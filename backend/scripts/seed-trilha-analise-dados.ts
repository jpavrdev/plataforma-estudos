// Seed da trilha Analise de Dados (intermediario), estagio 4 do roadmap de Ciencia de Dados.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-analise-dados.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Análise de Dados";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "O carro-chefe prático da ciência de dados: NumPy e pandas pra carregar, filtrar, transformar, agrupar e juntar dados, e a limpeza que consome 80% do tempo. De uma planilha bruta a dados prontos pra análise e machine learning.";

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
        "titulo": "Módulo 1 - NumPy: a base numérica",
        "aulas": [
            {
                "titulo": "Por que NumPy e criar arrays",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# NumPy: a base numérica\n\nVocê já programa em Python (sabe lidar com listas, dicts, funções, laços) e já passou pela trilha de Estatística (sabe o que são média, desvio padrão, outlier). Chegou a hora de juntar as duas coisas na ferramenta que sustenta praticamente toda a ciência de dados feita em Python: o NumPy.\n\nNumPy (Numerical Python) é uma biblioteca pra trabalhar com números em bloco. Em vez de guardar valores um a um numa lista e processar item por item num for, você guarda tudo num **array** e opera sobre o array inteiro de uma vez só. O resultado é código mais rápido e mais enxuto, e por isso o NumPy virou a base de praticamente tudo, inclusive do pandas, que você vai estudar a partir do próximo módulo. Toda coluna de um DataFrame pandas é, por dentro, um array NumPy. Entender bem o array agora poupa muita confusão lá na frente."
                    },
                    {
                        "type": "text",
                        "value": "## Lista Python x array NumPy\n\nUma lista Python é um contêiner genérico: aceita qualquer mistura de tipos (`[1, \"dois\", 3.0, True]` é uma lista válida) e guarda, internamente, um ponteiro pra cada item, espalhados pela memória. Isso dá flexibilidade, mas custa desempenho: somar 2 a cada item de uma lista de um milhão de números exige varrer item por item num laço.\n\nO array do NumPy, o `ndarray` (N-dimensional array), faz uma troca deliberada: todo elemento tem o mesmo tipo (o `dtype`) e fica lado a lado num bloco contíguo de memória. Com esse formato, o NumPy roda as operações em código C otimizado por baixo dos panos, sem o custo de um laço em Python puro. É a mesma lógica de uma planilha: uma coluna inteira de números, todos do mesmo tipo, prontos pra uma conta em bloco."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Lista Python\", \"Array NumPy (ndarray)\"], [\"Tipos dentro\", \"Pode misturar int, str, float...\", \"Um único tipo (dtype) pra todos os itens\"], [\"Na memória\", \"Espalhada, um ponteiro por item\", \"Contígua, valores lado a lado\"], [\"Somar 2 em cada item\", \"Precisa de laço ou list comprehension\", \"arr + 2 já resolve, sem laço\"], [\"Milhões de itens\", \"Fica lento, item por item\", \"Roda em C por baixo, muito mais rápido\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\nnotas_lista = [8.5, 7.0, 9.2, 6.5]\nnotas_array = np.array(notas_lista)\n\nprint(notas_lista)\n# [8.5, 7.0, 9.2, 6.5]\n\nprint(notas_array)\n# [8.5 7.  9.2 6.5]\n\nprint(type(notas_lista))\n# <class 'list'>\n\nprint(type(notas_array))\n# <class 'numpy.ndarray'>\n\nprint(notas_array.dtype)\n# float64 (todo elemento vira ponto flutuante de 64 bits)\n\nprint(notas_array.shape)\n# (4,) (uma dimensão, com 4 elementos)\n\nmistura = np.array([1, 2.5, 3])\nprint(mistura)\n# [1.  2.5 3. ]\n\nprint(mistura.dtype)\n# float64 (misturou int com float: o NumPy sobe tudo pro tipo mais abrangente)"
                    },
                    {
                        "type": "text",
                        "value": "## Criando arrays sem partir de uma lista\n\nNem sempre existe uma lista Python pronta pra virar array. O NumPy traz funções pra criar arrays direto, do jeito que a análise pedir:\n\n- `np.arange(inicio, fim, passo)`: como o `range` do Python, mas devolve um array.\n- `np.zeros(n)`: um array com `n` zeros, útil pra reservar um espaço e preencher depois.\n- `np.ones((linhas, colunas))`: um array de 1, já em duas dimensões se você passar uma tupla de formato.\n- `np.linspace(inicio, fim, quantidade)`: `quantidade` de pontos igualmente espaçados entre `inicio` e `fim`, incluindo as duas pontas. Vai reaparecer lá na frente, gerando o eixo de um gráfico na trilha de Visualização de Dados."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\nprint(np.arange(0, 10, 2))\n# [0 2 4 6 8]\n\nprint(np.zeros(4))\n# [0. 0. 0. 0.] (float64 por padrão)\n\nprint(np.ones((2, 3)))\n# [[1. 1. 1.]\n#  [1. 1. 1.]] (2 linhas, 3 colunas)\n\nprint(np.linspace(0, 10, 3))\n# [ 0.  5. 10.] (3 pontos igualmente espaçados entre 0 e 10)"
                    },
                    {
                        "type": "quote",
                        "value": "Todo DataFrame do pandas é, por dentro, um conjunto de arrays NumPy: dominar o array agora é entender o motor que roda por trás da planilha programável."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual a principal diferença entre uma lista Python e um array NumPy (ndarray)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O array guarda só um tipo de dado, a lista pode misturar vários",
                                "isCorrect": true
                            },
                            {
                                "text": "A lista guarda só um tipo de dado, o array pode misturar vários",
                                "isCorrect": false
                            },
                            {
                                "text": "O array só aceita números inteiros, nunca aceita decimais",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista e o array são exatamente a mesma estrutura por dentro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nimport numpy as np\narr = np.array([1, 2, 3])\nprint(type(arr))",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "<class 'numpy.ndarray'>",
                                "isCorrect": true
                            },
                            {
                                "text": "<class 'list'>",
                                "isCorrect": false
                            },
                            {
                                "text": "<class 'numpy.array'>",
                                "isCorrect": false
                            },
                            {
                                "text": "<class 'array.array'>",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar `arr = np.array([2, 4, 6, 8])`, qual é o dtype de arr?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "int64: todos os valores da lista são inteiros",
                                "isCorrect": true
                            },
                            {
                                "text": "float64: o NumPy converte tudo pra decimal",
                                "isCorrect": false
                            },
                            {
                                "text": "object: o NumPy não define um tipo automático",
                                "isCorrect": false
                            },
                            {
                                "text": "str: os números viram texto dentro do array",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nimport numpy as np\nprint(np.arange(1, 10, 3))",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "[1 4 7]",
                                "isCorrect": true
                            },
                            {
                                "text": "[ 1  4  7 10]",
                                "isCorrect": false
                            },
                            {
                                "text": "[1 3 5 7 9]",
                                "isCorrect": false
                            },
                            {
                                "text": "[0 3 6 9]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nimport numpy as np\narr = np.array([1, 2.5, 3])\nprint(arr.dtype)",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "float64, porque misturar int e float sobe pro tipo mais amplo",
                                "isCorrect": true
                            },
                            {
                                "text": "int64, porque a maior parte dos valores da lista é inteira",
                                "isCorrect": false
                            },
                            {
                                "text": "object, porque o NumPy guarda tipos diferentes lado a lado",
                                "isCorrect": false
                            },
                            {
                                "text": "erro de tipo, porque o array não aceita valores misturados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Operações vetorizadas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Operações vetorizadas: adeus ao for\n\nUm array NumPy permite aplicar uma operação matemática em todos os elementos de uma vez, sem escrever um laço. Isso se chama **operação vetorizada**: em vez de percorrer item por item, você escreve a operação uma única vez e o NumPy aplica ela em cada posição do array.\n\nVoltando ao exemplo da aula passada: somar 2 numa lista Python pede um laço ou uma list comprehension. Num array, `arr + 2` já faz a conta inteira, e o mesmo vale pra multiplicação, divisão, potência e comparação. Quando você tem dois arrays de mesmo tamanho, `arr1 + arr2` soma posição a posição: o primeiro item de um com o primeiro do outro, o segundo com o segundo, e assim por diante."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\nprecos = np.array([10.0, 25.5, 8.0, 42.0])\n\nprint(precos + 2)\n# [12.  27.5 10.  44. ]\n\nprint(precos * 1.1)\n# [11.   28.05  8.8  46.2 ] (reajuste de 10% em cada preço)\n\nquantidades = np.array([3, 1, 5, 2])\nprint(precos * quantidades)\n# [30.  25.5 40.  84. ] (preço vezes quantidade, item a item)\n\nprint(precos > 20)\n# [False  True False  True] (comparação também é vetorizada)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Operação\", \"Exemplo\", \"O que acontece\"], [\"Soma com um número\", \"arr + 2\", \"soma 2 em cada elemento\"], [\"Multiplicação com um número\", \"arr * 2\", \"dobra cada elemento\"], [\"Soma entre dois arrays\", \"arr1 + arr2\", \"soma posição a posição\"], [\"Comparação\", \"arr > 5\", \"gera um array de True e False\"]]"
                    },
                    {
                        "type": "code",
                        "value": "precos = [10.0, 25.5, 8.0, 42.0]\n\n# jeito tradicional, com for\nprecos_com_desconto = []\nfor p in precos:\n    precos_com_desconto.append(round(p * 0.9, 2))\nprint(precos_com_desconto)\n# [9.0, 22.95, 7.2, 37.8]\n\n# jeito vetorizado, com NumPy\nimport numpy as np\nprecos_array = np.array(precos)\nprint(precos_array * 0.9)\n# [ 9.   22.95  7.2  37.8 ] (mesmo resultado, sem escrever o laço)"
                    },
                    {
                        "type": "text",
                        "value": "## Por que é mais rápido (e mais legível) que um for\n\nA vantagem não é só estética. Um for em Python puro processa um item por vez, e cada iteração paga um custo: o interpretador verifica o tipo do valor, decide qual operação usar, empacota o resultado num novo objeto Python. Multiplique esse custo por milhões de itens e o laço fica visivelmente mais lento.\n\nO array NumPy evita esse custo porque já sabe, de antemão, que todo elemento é do mesmo tipo (dtype). Com essa garantia, a operação inteira roda num laço compilado em C, sobre um bloco contíguo de memória, sem o interpretador Python no meio do caminho. E como bônus, o código fica mais curto e mais perto de como você pensa a conta: `precos * 0.9` em vez de um for de quatro linhas."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nimport time\n\nvalores = list(range(2_000_000))\nvalores_array = np.arange(2_000_000)\n\ninicio = time.time()\ndobro_lista = [v * 2 for v in valores]\ntempo_lista = time.time() - inicio\n\ninicio = time.time()\ndobro_array = valores_array * 2\ntempo_array = time.time() - inicio\n\nprint(f\"list comprehension: {tempo_lista:.4f}s\")\n# list comprehension: 0.0445s\n\nprint(f\"numpy vetorizado: {tempo_array:.4f}s\")\n# numpy vetorizado: 0.0046s (nesta máquina, quase 10x mais rápido: o número exato varia por máquina, mas a vantagem cresce junto com o tamanho do array)"
                    },
                    {
                        "type": "quote",
                        "value": "Vetorizar não é só escrever menos código: é deixar o NumPy rodar a conta em C, no lugar do laço item a item do Python."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que uma operação com arrays NumPy é 'vetorizada'?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ela roda em todos os elementos do array de uma vez, sem for",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela só funciona em arrays com no máximo quatro elementos",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela transforma o array automaticamente numa lista Python",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela exige que cada valor do array seja um vetor separado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nimport numpy as np\narr = np.array([2, 4, 6])\nprint(arr * 3)",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "[ 6 12 18]",
                                "isCorrect": true
                            },
                            {
                                "text": "[5 7 9]",
                                "isCorrect": false
                            },
                            {
                                "text": "[ 4  8 12]",
                                "isCorrect": false
                            },
                            {
                                "text": "[2 4 6 3]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Com `a = np.array([1, 2, 3])` e `b = np.array([10, 20, 30])`, qual código soma os dois arrays posição a posição?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "a + b",
                                "isCorrect": true
                            },
                            {
                                "text": "a * b",
                                "isCorrect": false
                            },
                            {
                                "text": "a and b",
                                "isCorrect": false
                            },
                            {
                                "text": "a.sum(b)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nimport numpy as np\nnotas = np.array([5, 8, 9, 4])\nprint(notas >= 7)",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "[False  True  True False]",
                                "isCorrect": true
                            },
                            {
                                "text": "[True False False True]",
                                "isCorrect": false
                            },
                            {
                                "text": "[5 8 9 4]",
                                "isCorrect": false
                            },
                            {
                                "text": "[ True  True  True False]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que `precos * 0.9` (com precos um array NumPy) tende a ser mais rápido que o equivalente com for, à medida que o array cresce?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque roda em código C, sem o overhead de cada iteração do for",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o array comprime automaticamente os números antes da conta",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Python pula a checagem de tipo quando usa a palavra for",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque listas Python recalculam o próprio tamanho a cada iteração",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Broadcasting",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é broadcasting\n\nRepara numa coisa que você já fez na aula passada: `precos + 2`. precos é um array de 4 posições, 2 é um número só, e mesmo assim a soma funcionou em cada uma das 4 posições. Isso já é **broadcasting**: o NumPy espalha o valor menor pra combinar com o formato do maior, sem você precisar copiar o 2 quatro vezes numa lista `[2, 2, 2, 2]`.\n\nBroadcasting é a regra que o NumPy usa pra operar arrays de formatos diferentes, mas compatíveis, sem que você tenha que igualar os formatos manualmente. Escalar com array é o caso mais simples. Agora vamos ver o caso mais útil no dia a dia de dados: um array 2D (linhas e colunas) combinado com um array 1D."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\nnotas = np.array([6.0, 7.5, 8.0, 5.5])\nprint(notas.shape)\n# (4,)\n\nprint(notas + 1.0)\n# [7.  8.5 9.  6.5] (o 1.0 foi espalhado pras 4 posições: já era broadcasting)"
                    },
                    {
                        "type": "text",
                        "value": "## Broadcasting em 2D: array + vetor por linha\n\nImagine uma turma com 3 alunos e 3 provas: um array 2D de formato (3, 3), 3 linhas (alunos) por 3 colunas (provas). Agora imagine que cada prova recebeu um ajuste diferente (uma revisão de gabarito, por exemplo): um array 1D de formato (3,), um ajuste por prova.\n\nQuando você soma o array 2D com o array 1D, o NumPy compara os formatos de trás pra frente: as 3 colunas do array 2D combinam com as 3 posições do array 1D, então o NumPy repete o vetor de ajuste em cada uma das 3 linhas. O resultado é como se você tivesse somado o ajuste em cada linha, uma por uma, só que numa única operação."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\nnotas_provas = np.array([\n    [6.0, 7.0, 8.0],\n    [5.0, 9.0, 7.5],\n    [8.5, 6.5, 9.0],\n])\nprint(notas_provas.shape)\n# (3, 3)\n\najuste = np.array([0.5, -1.0, 1.0])\nprint(ajuste.shape)\n# (3,)\n\nprint(notas_provas + ajuste)\n# [[ 6.5  6.   9. ]\n#  [ 5.5  8.   8.5]\n#  [ 9.   5.5 10. ]] (o ajuste de cada prova foi somado em todas as linhas)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Formato do array maior\", \"Formato do segundo\", \"Compatível?\", \"O que acontece\"], [\"(4,)\", \"um número (escalar)\", \"sim\", \"o número se soma a cada um dos 4 elementos\"], [\"(3, 3)\", \"(3,)\", \"sim\", \"o vetor de 3 posições se repete nas 3 linhas\"], [\"(3, 3)\", \"(2,)\", \"não\", \"3 colunas não combinam com um vetor de 2 posições\"], [\"(3, 3)\", \"(3, 3)\", \"sim\", \"mesmo formato: soma posição a posição, sem broadcasting\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\nnotas_provas = np.array([\n    [6.0, 7.0, 8.0],\n    [5.0, 9.0, 7.5],\n    [8.5, 6.5, 9.0],\n])\n\nvetor_errado = np.array([1.0, 2.0])\nprint(vetor_errado.shape)\n# (2,)\n\nprint(notas_provas + vetor_errado)\n# ValueError: operands could not be broadcast together with shapes (3,3) (2,) "
                    },
                    {
                        "type": "quote",
                        "value": "Broadcasting é o NumPy esticando o array menor pra caber no maior, sem duplicar dado nenhum de verdade."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é broadcasting no NumPy?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A regra que deixa operar arrays de formatos diferentes e compatíveis",
                                "isCorrect": true
                            },
                            {
                                "text": "Um comando que transforma qualquer array numa lista Python comum",
                                "isCorrect": false
                            },
                            {
                                "text": "A função que ordena os elementos de um array do menor pro maior",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do processo que salva um array direto num arquivo CSV",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nimport numpy as np\narr = np.array([10, 20, 30])\nprint(arr + 5)",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "[15 25 35]",
                                "isCorrect": true
                            },
                            {
                                "text": "[10 20 30 5]",
                                "isCorrect": false
                            },
                            {
                                "text": "[50 100 150]",
                                "isCorrect": false
                            },
                            {
                                "text": "[5 10 15]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando notas_provas com formato (3, 3) e ajuste com formato (3,), qual é o formato do resultado de notas_provas + ajuste?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "(3, 3): o ajuste se repete em cada uma das 3 linhas",
                                "isCorrect": true
                            },
                            {
                                "text": "(3,): o resultado da soma perde uma dimensão inteira",
                                "isCorrect": false
                            },
                            {
                                "text": "(6, 3): o NumPy empilha os dois arrays um sobre o outro",
                                "isCorrect": false
                            },
                            {
                                "text": "erro: dimensões diferentes não podem ser somadas assim",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nimport numpy as np\nnotas = np.array([6.0, 7.5, 8.0, 5.5])\nprint(notas + 1.0)",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "[7.  8.5 9.  6.5]",
                                "isCorrect": true
                            },
                            {
                                "text": "[6.  7.5 8.  5.5]",
                                "isCorrect": false
                            },
                            {
                                "text": "[7.  8.5 9.  6.5 1. ]",
                                "isCorrect": false
                            },
                            {
                                "text": "[5.  6.5 7.  4.5]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma matriz notas tem formato (3, 3) e um vetor ajuste tem formato (2,). O que acontece ao rodar notas + ajuste?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Levanta ValueError: formatos incompatíveis pra broadcasting",
                                "isCorrect": true
                            },
                            {
                                "text": "Soma o vetor só nas duas primeiras colunas de cada linha",
                                "isCorrect": false
                            },
                            {
                                "text": "Preenche a posição que falta com zero, automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Repete o vetor de 2 posições até completar as 3 colunas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Agregações e o eixo (axis)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Funções de agregação\n\nAgregar é resumir vários valores num só. Você já fez isso na mão na trilha de Estatística: somar tudo e dividir pela quantidade pra tirar a média, por exemplo. O NumPy resolve isso com funções prontas, testadas e rápidas: sum, mean, std, min e max, entre outras.\n\nVocê pode chamar como função do NumPy (`np.sum(arr)`) ou como método do próprio array (`arr.sum()`): as duas formas fazem a mesma coisa, e o método costuma ser o mais usado no dia a dia. Aquela fórmula de desvio padrão que você calculou passo a passo na trilha de Estatística agora é uma chamada só: `arr.std()`."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\nnotas = np.array([8.5, 7.5, 9.0, 6.5, 8.5])\n\nprint(notas.sum())\n# 40.0\n\nprint(notas.mean())\n# 8.0\n\nprint(notas.std())\n# 0.8944271909999159 (o mesmo desvio padrão da trilha de Estatística, calculado numa linha)\n\nprint(notas.min())\n# 6.5\n\nprint(notas.max())\n# 9.0"
                    },
                    {
                        "type": "text",
                        "value": "## Agregando em 2D: o eixo axis\n\nNuma matriz (array 2D), somar tudo pode significar coisas diferentes: somar cada linha, somar cada coluna, ou somar cada valor do array inteiro num único número. O parâmetro axis é como você diz ao NumPy qual dessas contas você quer.\n\nA confusão mais comum é lembrar o que cada eixo colapsa. Pensa assim: axis=0 anda pelas **linhas** (de cima pra baixo) e entrega um resultado por coluna. Já axis=1 anda pelas **colunas** (da esquerda pra direita) e entrega um resultado por linha. Sem informar axis, o NumPy agrega o array inteiro num único valor."
                    },
                    {
                        "type": "table",
                        "value": "[[\"axis usado\", \"o que é percorrido\", \"resultado (numa matriz 4 linhas x 3 colunas)\"], [\"sem axis\", \"o array inteiro\", \"um único número\"], [\"axis=0\", \"as linhas, de cima pra baixo\", \"um valor por coluna (3 valores)\"], [\"axis=1\", \"as colunas, da esquerda pra direita\", \"um valor por linha (4 valores)\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\nnotas_turma = np.array([\n    [8.0, 7.5, 9.0],\n    [6.0, 7.0, 6.5],\n    [9.0, 9.5, 8.5],\n    [5.5, 6.0, 7.0],\n])\nprint(notas_turma.shape)\n# (4, 3) (4 alunos, 3 provas)\n\nprint(notas_turma.sum())\n# 89.5 (soma de todo mundo, sem axis)\n\nprint(notas_turma.mean(axis=0))\n# [7.125 7.5   7.75 ] (média de cada prova, uma por coluna)\n\nprint(notas_turma.mean(axis=1))\n# [8.16666667 6.5        9.         6.16666667] (média de cada aluno, uma por linha)\n\nprint(notas_turma.max(axis=0))\n# [9.  9.5 9. ] (a maior nota de cada prova)"
                    },
                    {
                        "type": "text",
                        "value": "## Essa ideia volta no pandas\n\nIsso que parece um detalhe técnico (escolher o axis certo) é exatamente o que o pandas usa por baixo dos panos quando você agrega uma coluna inteira de um DataFrame, ou quando o Módulo 5 desta trilha ensinar groupby. A lógica de resumir por linha ou por coluna não muda: só o jeito de escrever fica ainda mais direto."
                    },
                    {
                        "type": "quote",
                        "value": "axis=0 anda pelas linhas e resume por coluna, axis=1 anda pelas colunas e resume por linha: decorar isso agora evita confusão até no pandas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual função de agregação NumPy calcula o desvio padrão de um array?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "arr.std()",
                                "isCorrect": true
                            },
                            {
                                "text": "arr.mean()",
                                "isCorrect": false
                            },
                            {
                                "text": "arr.var_padrao()",
                                "isCorrect": false
                            },
                            {
                                "text": "arr.desvio()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nimport numpy as np\nnotas = np.array([8.5, 7.5, 9.0, 6.5, 8.5])\nprint(notas.mean())",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "8.0",
                                "isCorrect": true
                            },
                            {
                                "text": "40.0",
                                "isCorrect": false
                            },
                            {
                                "text": "9.0",
                                "isCorrect": false
                            },
                            {
                                "text": "6.5",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dada a matriz abaixo, com formato (2, 3), qual código devolve a soma de cada coluna?\n\nimport numpy as np\nm = np.array([[1, 2, 3], [4, 5, 6]])",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "m.sum(axis=0)",
                                "isCorrect": true
                            },
                            {
                                "text": "m.sum(axis=1)",
                                "isCorrect": false
                            },
                            {
                                "text": "m.sum()",
                                "isCorrect": false
                            },
                            {
                                "text": "m.sum(axis=2)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nimport numpy as np\nm = np.array([[1, 2, 3], [4, 5, 6]])\nprint(m.sum(axis=1))",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "[ 6 15]",
                                "isCorrect": true
                            },
                            {
                                "text": "[5 7 9]",
                                "isCorrect": false
                            },
                            {
                                "text": "[3 6]",
                                "isCorrect": false
                            },
                            {
                                "text": "[21]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma matriz notas_turma tem formato (4, 3): 4 alunos, 3 provas. Qual código calcula a média de cada aluno (uma média por linha)?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "notas_turma.mean(axis=1)",
                                "isCorrect": true
                            },
                            {
                                "text": "notas_turma.mean(axis=0)",
                                "isCorrect": false
                            },
                            {
                                "text": "notas_turma.mean()",
                                "isCorrect": false
                            },
                            {
                                "text": "notas_turma.sum(axis=1)",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Indexação, slicing e máscara booleana",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Indexação e slicing: como em listas\n\nUm array NumPy de uma dimensão se indexa exatamente como uma lista Python: posição 0 é o primeiro elemento, -1 é o último, e o fatiamento (slicing) com `:` funciona do mesmo jeito, incluindo o início e excluindo o fim. Se você já pegou o jeito com listas na trilha de Python, não tem nada novo pra aprender aqui, só trocar de estrutura."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\nnotas = np.array([8.5, 7.0, 9.2, 6.5, 5.0, 10.0])\n\nprint(notas[0])\n# 8.5 (primeiro elemento)\n\nprint(notas[-1])\n# 10.0 (último elemento)\n\nprint(notas[1:3])\n# [7.  9.2] (índices 1 e 2, o índice 3 fica de fora)\n\nprint(notas[:2])\n# [8.5 7. ] (do início até o índice 1)\n\nprint(notas[3:])\n# [ 6.5  5.  10. ] (do índice 3 até o final)\n\nprint(notas[::2])\n# [8.5 9.2 5. ] (pula de 2 em 2, começando no índice 0)"
                    },
                    {
                        "type": "text",
                        "value": "## Arrays 2D: linha e coluna numa tacada só\n\nNuma lista de listas, pegar um elemento específico pede dois colchetes: `matriz[1][2]`, primeiro a linha, depois a coluna. O array NumPy aceita isso, mas também aceita (e é o jeito idiomático) os dois índices dentro do mesmo par de colchetes, separados por vírgula: `matriz[linha, coluna]`. E dá pra combinar posição fixa com fatia: pegar uma linha inteira, uma coluna inteira, ou um pedaço da matriz."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\nmatriz = np.array([\n    [8.0, 7.5, 9.0],\n    [6.0, 7.0, 6.5],\n    [9.0, 9.5, 8.5],\n])\n\nprint(matriz[1, 2])\n# 6.5 (linha de índice 1, coluna de índice 2)\n\nprint(matriz[0])\n# [8.  7.5 9. ] (a linha inteira de índice 0)\n\nprint(matriz[:, 1])\n# [7.5 7.  9.5] (a coluna inteira de índice 1)\n\nprint(matriz[0:2, 1:3])\n# [[7.5 9. ]\n#  [7.  6.5]] (as 2 primeiras linhas, das colunas 1 e 2)"
                    },
                    {
                        "type": "text",
                        "value": "## Máscara booleana: filtrar com uma condição\n\nLá na aula de operações vetorizadas, `notas > 7` já devolvia um array de True e False, um por posição. Esse array booleano pode ser usado como índice: `notas[notas > 7]` devolve só os valores nas posições onde a condição bateu True. É o mesmo mecanismo por trás do filtro de linhas do pandas, que você vai ver com calma no Módulo 4 desta trilha, só que aplicado direto num array.\n\nDá pra combinar mais de uma condição com `&` (e) e `|` (ou), sempre com parênteses em cada condição: por exemplo, `notas[(notas > 5) & (notas < 9)]`. O and e o or do Python puro não funcionam aqui, porque eles esperam um único True ou False, não um array inteiro de valores."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\nnotas = np.array([8.5, 7.0, 9.2, 6.5, 5.0, 4.0])\n\nmask = notas >= 7\nprint(mask)\n# [ True  True  True False False False]\n\nprint(notas[mask])\n# [8.5 7.  9.2] (só as posições onde mask é True)\n\nprint(notas[notas < 6])\n# [5. 4.] (dá pra usar a condição direto, sem guardar numa variável)\n\nprint((notas >= 7).sum())\n# 3 (True vale 1 e False vale 0: soma conta quantos bateram a condição)\n\nnotas_ajustadas = notas.copy()\nnotas_ajustadas[notas_ajustadas < 6] = 6.0\nprint(notas_ajustadas)\n# [8.5 7.  9.2 6.5 6.  6. ] (substituiu só quem era menor que 6, direto no array)"
                    },
                    {
                        "type": "quote",
                        "value": "Máscara booleana é filtrar perguntando pro array em quais posições essa condição é verdadeira: guarda essa ideia, porque ela reaparece inteira no pandas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Dado notas = np.array([10, 20, 30, 40]), qual é o valor de notas[-1]?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "40",
                                "isCorrect": true
                            },
                            {
                                "text": "10",
                                "isCorrect": false
                            },
                            {
                                "text": "30",
                                "isCorrect": false
                            },
                            {
                                "text": "20",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nimport numpy as np\nnotas = np.array([8.5, 7.0, 9.2, 6.5])\nprint(notas[1:3])",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "[7.  9.2]",
                                "isCorrect": true
                            },
                            {
                                "text": "[8.5 7. ]",
                                "isCorrect": false
                            },
                            {
                                "text": "[9.2 6.5]",
                                "isCorrect": false
                            },
                            {
                                "text": "[7.  9.2 6.5]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando\n\nmatriz = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])\n\nqual código devolve a coluna do meio, [2, 5, 8]?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "matriz[:, 1]",
                                "isCorrect": true
                            },
                            {
                                "text": "matriz[1, :]",
                                "isCorrect": false
                            },
                            {
                                "text": "matriz[:, 2]",
                                "isCorrect": false
                            },
                            {
                                "text": "matriz[1]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual código devolve só os valores maiores que 8 do array notas = np.array([5, 9, 3, 10, 7])?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "notas[notas > 8]",
                                "isCorrect": true
                            },
                            {
                                "text": "notas[notas.max()]",
                                "isCorrect": false
                            },
                            {
                                "text": "notas > 8",
                                "isCorrect": false
                            },
                            {
                                "text": "notas[8]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que notas[notas > 5 and notas < 9] levanta erro, enquanto notas[(notas > 5) & (notas < 9)] funciona?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "and/or esperam um único booleano, array booleano usa & e |",
                                "isCorrect": true
                            },
                            {
                                "text": "and é mais lento que &, então o NumPy bloqueia por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "a ordem dos parênteses no & está invertida nessa expressão",
                                "isCorrect": false
                            },
                            {
                                "text": "notas precisa estar ordenado antes de usar and ou or aqui",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Conhecendo o pandas: Series e DataFrame",
        "aulas": [
            {
                "titulo": "O que é pandas (Series e DataFrame)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é pandas (Series e DataFrame)\n\nNo módulo de NumPy você trabalhou com arrays: rápidos, vetorizados, ótimos pra conta. Só que dado do mundo real quase nunca é uma lista de números soltos. É uma tabela: linhas de alunos, colunas de nome, idade, cidade, nota, cada coluna com um tipo diferente e um nome pra chamar. É pra esse cenário que existe o **pandas**.\n\npandas é a biblioteca Python de análise de dados em formato de tabela. Se o Excel é uma planilha que você clica e arrasta, o pandas é a planilha que você programa: cada filtro, cada conta, cada agrupamento vira uma linha de código, repetível, revisável e fácil de rodar de novo com dado novo."
                    },
                    {
                        "type": "text",
                        "value": "## Por que pandas, se o NumPy já existe?\n\nUm array do NumPy é ótimo pra números homogêneos (tudo `int` ou tudo `float`) e só tem posição, sem nome de coluna. Só que uma tabela de alunos mistura texto (nome, cidade) com número inteiro (idade) e número decimal (nota) lado a lado, e você quer chamar cada coluna pelo nome, não pela posição.\n\nO pandas resolve isso construindo por cima do NumPy: cada coluna de uma tabela pandas é, por baixo dos panos, um array do NumPy, só que com rótulo de coluna, rótulo de linha (o index) e liberdade pra misturar tipos diferentes lado a lado."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nimport pandas as pd\n\n# uma Series do pandas guarda os valores num array do NumPy\nnotas = pd.Series([8.5, 7.0, 9.2])\nprint(type(notas.values))\n# <class 'numpy.ndarray'>\n\nprint(notas)\n# 0    8.5\n# 1    7.0\n# 2    9.2\n# dtype: float64"
                    },
                    {
                        "type": "text",
                        "value": "## As duas estruturas centrais: Series e DataFrame\n\nO pandas gira em torno de dois objetos:\n\n- **Series**: uma única coluna de dados, com um índice (um rótulo pra cada valor). Você vai destrinchar isso na próxima aula.\n- **DataFrame**: a tabela inteira, com várias colunas (cada uma podendo ter um tipo diferente) e um índice compartilhado por todas as linhas. Na prática, um DataFrame é como várias Series lado a lado, todas com o mesmo índice.\n\nPor agora, um primeiro vislumbre dos dois."
                    },
                    {
                        "type": "table",
                        "value": "[[\"nome\", \"idade\", \"curso\"], [\"Ana\", 23, \"Estatística\"], [\"Bruno\", 25, \"Python\"], [\"Carla\", 22, \"SQL\"]]"
                    },
                    {
                        "type": "code",
                        "value": "dados = {\n    \"nome\": [\"Ana\", \"Bruno\", \"Carla\"],\n    \"idade\": [23, 25, 22],\n    \"curso\": [\"Estatística\", \"Python\", \"SQL\"]\n}\n\ndf = pd.DataFrame(dados)\nprint(df)\n#     nome  idade        curso\n# 0    Ana     23  Estatística\n# 1  Bruno     25       Python\n# 2  Carla     22          SQL\n\nprint(type(df))\n# <class 'pandas.DataFrame'>"
                    },
                    {
                        "type": "quote",
                        "value": "pandas é o NumPy com rótulo: Series é uma coluna com índice, DataFrame é a tabela inteira, e as duas seguram dado de tipos diferentes lado a lado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a forma padrão de importar o pandas em um script Python?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "import pandas as pd",
                                "isCorrect": true
                            },
                            {
                                "text": "import pandas as np",
                                "isCorrect": false
                            },
                            {
                                "text": "import numpy as pd",
                                "isCorrect": false
                            },
                            {
                                "text": "from pandas import pd",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "pandas é construído por cima de qual outra biblioteca, usando os arrays dela pra guardar os dados das colunas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "NumPy",
                                "isCorrect": true
                            },
                            {
                                "text": "Matplotlib",
                                "isCorrect": false
                            },
                            {
                                "text": "SciPy",
                                "isCorrect": false
                            },
                            {
                                "text": "Requests",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar o código abaixo, qual é o tipo de resultado?\n\nimport pandas as pd\n\nresultado = pd.Series([10, 20, 30])",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma Series, estrutura de uma única coluna com índice",
                                "isCorrect": true
                            },
                            {
                                "text": "Um DataFrame, estrutura de uma tabela com várias colunas",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma lista comum do Python, sem índice associado",
                                "isCorrect": false
                            },
                            {
                                "text": "Um array do NumPy, sem rótulos de linha",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente a diferença entre Series e DataFrame?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Series guarda uma coluna com índice; DataFrame guarda várias colunas e tipos",
                                "isCorrect": true
                            },
                            {
                                "text": "Series guarda várias colunas; DataFrame guarda uma coluna sem índice",
                                "isCorrect": false
                            },
                            {
                                "text": "Series e DataFrame são nomes diferentes pra exatamente a mesma coisa",
                                "isCorrect": false
                            },
                            {
                                "text": "Series só aceita números como valores; DataFrame só aceita texto nas colunas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe guarda idade (número inteiro) e cidade (texto) de clientes num único array 2D do NumPy. Qual limitação empurra essa equipe pro pandas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Arrays do NumPy usam um único dtype: número e texto juntos viram tipo genérico",
                                "isCorrect": true
                            },
                            {
                                "text": "Arrays do NumPy não conseguem ter mais de uma linha de dados ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Arrays do NumPy não permitem fazer nenhuma conta entre suas posições",
                                "isCorrect": false
                            },
                            {
                                "text": "Arrays do NumPy sempre calculam mais devagar que uma lista comum do Python",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Series na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Series: uma coluna com índice\n\nUma Series é a estrutura mais simples do pandas: uma sequência de valores, cada um com um rótulo (o índice) grudado do lado. Pense numa coluna de planilha com o nome de cada linha escrito ao lado: os valores de um lado, os rótulos do outro, sempre andando juntos.\n\nUma lista comum do Python só tem posição (0, 1, 2...). Uma Series tem posição E rótulo, e você escolhe qual dos dois usar pra acessar um valor."
                    },
                    {
                        "type": "table",
                        "value": "[[\"índice\", \"nota\"], [\"Ana\", 8.5], [\"Bruno\", 7.0], [\"Carla\", 9.2], [\"Diego\", 6.5]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\n# a partir de uma lista, com índice padrão (0, 1, 2...)\nnotas = pd.Series([8.5, 7.0, 9.2, 6.5])\nprint(notas.index)\n# RangeIndex(start=0, stop=4, step=1)\n\n# a partir de uma lista, com índice customizado\nnotas = pd.Series([8.5, 7.0, 9.2, 6.5], index=[\"Ana\", \"Bruno\", \"Carla\", \"Diego\"])\nprint(notas)\n# Ana      8.5\n# Bruno    7.0\n# Carla    9.2\n# Diego    6.5\n# dtype: float64\n\n# a partir de um dict: as chaves viram o índice\nnotas_dict = {\"Ana\": 8.5, \"Bruno\": 7.0, \"Carla\": 9.2, \"Diego\": 6.5}\nnotas = pd.Series(notas_dict)\nprint(notas)\n# Ana      8.5\n# Bruno    7.0\n# Carla    9.2\n# Diego    6.5\n# dtype: float64"
                    },
                    {
                        "type": "text",
                        "value": "## Acessar por rótulo ou por posição\n\nCom o índice em mãos, dá pra buscar um valor de dois jeitos: pelo **rótulo** (o nome, com `.loc`) ou pela **posição** (o número, com `.iloc`). Os dois merecem uma aula inteira mais pra frente (Módulo 4), porque é a confusão mais comum de quem começa com pandas. Por enquanto, o essencial: `.loc` usa o rótulo que aparece no índice, `.iloc` usa a posição, contando do 0, não importa qual seja o rótulo."
                    },
                    {
                        "type": "code",
                        "value": "print(notas.loc[\"Carla\"])\n# 9.2\n\nprint(notas.iloc[2])\n# 9.2\n\n# Carla é o rótulo e também a posição 2 nesse caso: os dois caminhos chegam no mesmo valor\nprint(notas[\"Bruno\"])\n# 7.0"
                    },
                    {
                        "type": "code",
                        "value": "# operação vetorizada: aplica pra cada valor de uma vez, sem laço (igual no NumPy)\nprint(notas * 10)\n# Ana      85.0\n# Bruno    70.0\n# Carla    92.0\n# Diego    65.0\n# dtype: float64\n\nprint(notas.mean())\n# 7.8\n\n# filtro booleano: só os valores que passam na condição\nprint(notas[notas > 8])\n# Ana      8.5\n# Carla    9.2\n# dtype: float64"
                    },
                    {
                        "type": "quote",
                        "value": "Series é a lista com nome nas posições: valor e rótulo sempre lado a lado, acessíveis por `.loc` (rótulo) ou `.iloc` (posição)."
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao criar uma Series a partir de uma lista, sem informar o parâmetro index, qual índice o pandas usa por padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um RangeIndex numérico, começando em 0",
                                "isCorrect": true
                            },
                            {
                                "text": "Os próprios valores da lista, usados como rótulo",
                                "isCorrect": false
                            },
                            {
                                "text": "Um índice alfabético, começando em \"a\"",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum índice: a Series fica sem rótulo de linha",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao criar uma Series a partir de um dicionário, como no código abaixo, o que vira o índice?\n\nidades = {\"Ana\": 23, \"Bruno\": 25}\ns = pd.Series(idades)",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "As chaves do dicionário, uma pra cada valor",
                                "isCorrect": true
                            },
                            {
                                "text": "Os valores do dicionário, repetidos como rótulo",
                                "isCorrect": false
                            },
                            {
                                "text": "As posições numéricas, de 0 em diante",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome da variável usada pra criar o dicionário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dada a Series abaixo,\n\nnotas = pd.Series([8.5, 7.0, 9.2], index=[\"Ana\", \"Bruno\", \"Carla\"])\n\nqual código retorna a nota de Bruno usando a posição dele, não o nome?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "notas.iloc[1]",
                                "isCorrect": true
                            },
                            {
                                "text": "notas.loc[1]",
                                "isCorrect": false
                            },
                            {
                                "text": "notas.iloc[\"Bruno\"]",
                                "isCorrect": false
                            },
                            {
                                "text": "notas.index[1]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dada notas = pd.Series([8.5, 7.0, 9.2]), qual é o resultado de notas * 10?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma nova Series com cada valor multiplicado por 10, sem alterar notas",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro, porque não é possível multiplicar uma Series por um número",
                                "isCorrect": false
                            },
                            {
                                "text": "A mesma Series notas, alterada permanentemente pelos novos valores",
                                "isCorrect": false
                            },
                            {
                                "text": "Um único número: a soma de todos os valores multiplicados por 10",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma Series foi criada com índice numérico customizado:\n\nvalores = pd.Series([100, 200, 300], index=[5, 6, 7])\n\nO que acontece ao rodar valores.iloc[5] logo em seguida?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Levanta IndexError, porque só existem as posições 0, 1 e 2",
                                "isCorrect": true
                            },
                            {
                                "text": "Retorna 100, o mesmo valor que valores.loc[5] retornaria",
                                "isCorrect": false
                            },
                            {
                                "text": "Retorna 300, o último valor guardado na Series",
                                "isCorrect": false
                            },
                            {
                                "text": "Retorna o rótulo 5, e não o valor associado a ele",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Criando um DataFrame",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Duas portas de entrada pro DataFrame\n\nNa prática, você cria um DataFrame de dois jeitos, dependendo de como o dado chega até você:\n\n- **Dict de listas**: uma chave por coluna, cada valor é a lista inteira daquela coluna. Você pensa \"coluna por coluna\".\n- **Lista de dicts**: um dicionário por linha, cada chave é o nome de uma coluna. Você pensa \"linha por linha\", que é como chega um retorno de API em JSON ou um `SELECT` de banco de dados.\n\nAs duas viram exatamente a mesma tabela."
                    },
                    {
                        "type": "table",
                        "value": "[[\"nome\", \"idade\", \"cidade\", \"nota\"], [\"Ana\", 23, \"São Paulo\", 8.5], [\"Bruno\", 25, \"Recife\", 7.0], [\"Carla\", 22, \"Belo Horizonte\", 9.2], [\"Diego\", 29, \"São Paulo\", 6.5], [\"Elisa\", 31, \"Curitiba\", 8.8], [\"Fábio\", 24, \"Salvador\", 7.4], [\"Gustavo\", 27, \"Recife\", 5.9], [\"Helena\", 26, \"São Paulo\", 9.0]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\n# dict de listas: uma chave por coluna\nalunos = {\n    \"nome\": [\"Ana\", \"Bruno\", \"Carla\", \"Diego\", \"Elisa\", \"Fábio\", \"Gustavo\", \"Helena\"],\n    \"idade\": [23, 25, 22, 29, 31, 24, 27, 26],\n    \"cidade\": [\"São Paulo\", \"Recife\", \"Belo Horizonte\", \"São Paulo\", \"Curitiba\", \"Salvador\", \"Recife\", \"São Paulo\"],\n    \"nota\": [8.5, 7.0, 9.2, 6.5, 8.8, 7.4, 5.9, 9.0]\n}\n\ndf = pd.DataFrame(alunos)\nprint(df)\n#       nome  idade          cidade  nota\n# 0      Ana     23       São Paulo   8.5\n# 1    Bruno     25          Recife   7.0\n# 2    Carla     22  Belo Horizonte   9.2\n# 3    Diego     29       São Paulo   6.5\n# 4    Elisa     31        Curitiba   8.8\n# 5    Fábio     24        Salvador   7.4\n# 6  Gustavo     27          Recife   5.9\n# 7   Helena     26       São Paulo   9.0"
                    },
                    {
                        "type": "text",
                        "value": "## A outra porta: lista de dicts\n\nQuando o dado chega registro por registro (por exemplo, uma lista de respostas de formulário, ou um retorno de API), é mais natural montar uma lista de dicionários e deixar o pandas juntar tudo numa tabela. As chaves de cada dict viram as colunas."
                    },
                    {
                        "type": "code",
                        "value": "registros = [\n    {\"nome\": \"Ana\", \"idade\": 23, \"cidade\": \"São Paulo\", \"nota\": 8.5},\n    {\"nome\": \"Bruno\", \"idade\": 25, \"cidade\": \"Recife\", \"nota\": 7.0},\n    {\"nome\": \"Carla\", \"idade\": 22, \"cidade\": \"Belo Horizonte\", \"nota\": 9.2}\n]\n\ndf2 = pd.DataFrame(registros)\nprint(df2)\n#     nome  idade          cidade  nota\n# 0    Ana     23       São Paulo   8.5\n# 1  Bruno     25          Recife   7.0\n# 2  Carla     22  Belo Horizonte   9.2"
                    },
                    {
                        "type": "code",
                        "value": "# as listas de um dict de listas precisam ter o mesmo tamanho\ntry:\n    pd.DataFrame({\"nome\": [\"Ana\", \"Bruno\"], \"idade\": [23, 25, 30]})\nexcept ValueError as e:\n    print(\"ValueError:\", e)\n# ValueError: All arrays must be of the same length\n\n# já numa lista de dicts, uma chave que falta em um registro vira NaN\nregistros_incompletos = [\n    {\"nome\": \"Ana\", \"idade\": 23},\n    {\"nome\": \"Bruno\", \"idade\": 25, \"cidade\": \"Recife\"}\n]\nprint(pd.DataFrame(registros_incompletos))\n#     nome  idade  cidade\n# 0    Ana     23     NaN\n# 1  Bruno     25  Recife"
                    },
                    {
                        "type": "quote",
                        "value": "De dict de listas (coluna por coluna) ou lista de dicts (linha por linha): dois jeitos de montar os dados em Python, a mesma tabela no final."
                    }
                ],
                "questions": [
                    {
                        "statement": "Pra criar um DataFrame a partir de um dicionário onde cada chave é uma coluna e cada valor é a lista de dados dessa coluna, qual código se usa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "pd.DataFrame(dicionario)",
                                "isCorrect": true
                            },
                            {
                                "text": "pd.Series(dicionario)",
                                "isCorrect": false
                            },
                            {
                                "text": "dicionario.to_frame()",
                                "isCorrect": false
                            },
                            {
                                "text": "pd.array(dicionario)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual estrutura Python, ao ser passada pra pd.DataFrame(...), cria uma linha da tabela pra cada item, com as chaves de cada item virando as colunas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma lista de dicionários",
                                "isCorrect": true
                            },
                            {
                                "text": "Um dicionário de listas",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma lista de listas aninhadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Um dicionário de dicionários",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao rodar o código abaixo,\n\npd.DataFrame({\"nome\": [\"Ana\", \"Bruno\"], \"idade\": [23, 25, 30]})\n\no que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Levanta ValueError: as listas de cada coluna têm que ter o mesmo tamanho",
                                "isCorrect": true
                            },
                            {
                                "text": "Cria o DataFrame normalmente, preenchendo a linha que falta com NaN",
                                "isCorrect": false
                            },
                            {
                                "text": "Cria o DataFrame normalmente, ignorando o último valor da lista maior",
                                "isCorrect": false
                            },
                            {
                                "text": "Cria o DataFrame, mas duplica o último nome pra completar as linhas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dado o código abaixo,\n\nregistros = [{\"nome\": \"Ana\", \"idade\": 23}, {\"nome\": \"Bruno\", \"idade\": 25, \"cidade\": \"Recife\"}]\ndf = pd.DataFrame(registros)\n\no que aparece na coluna cidade da linha da Ana?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "NaN, porque o dicionário da Ana não tinha a chave \"cidade\"",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma string vazia, porque o pandas preenche texto ausente assim",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor 0, porque o pandas usa zero pra qualquer dado ausente",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro, porque os dicionários da lista têm chaves diferentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dado o código abaixo,\n\ndf = pd.DataFrame({\"nome\": [\"Ana\", \"Bruno\", \"Carla\"], \"cidade\": \"SP\"})\n\no que acontece com a coluna cidade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O valor \"SP\" é repetido (broadcast) pras três linhas da coluna",
                                "isCorrect": true
                            },
                            {
                                "text": "Levanta ValueError, porque só a primeira linha tem uma lista de fato",
                                "isCorrect": false
                            },
                            {
                                "text": "Só a primeira linha recebe \"SP\"; as outras ficam com NaN",
                                "isCorrect": false
                            },
                            {
                                "text": "O DataFrame é criado com apenas uma linha, ignorando as outras duas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Index e dtypes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O index: o rótulo de cada linha\n\nTodo DataFrame (e toda Series) tem um índice: o rótulo de cada linha, mostrado à esquerda quando você imprime a tabela. Quando você não define nada, o pandas usa um `RangeIndex`, a mesma contagem 0, 1, 2... que você já viu em lista do Python.\n\nMas o índice não precisa ser um número. Dá pra usar qualquer coluna com valores únicos (um nome, um CPF, um ID) como índice, com `set_index`, e passar a buscar uma linha pelo que ela significa, não pela posição em que está.\n\nNos exemplos abaixo, `df` é o mesmo DataFrame de alunos (nome, idade, cidade, nota) que você criou na Aula 3."
                    },
                    {
                        "type": "code",
                        "value": "# df é o DataFrame de alunos criado na Aula 3 (nome, idade, cidade, nota)\nprint(df.index)\n# RangeIndex(start=0, stop=8, step=1)\n\ndf_idx = df.set_index(\"nome\")\nprint(df_idx)\n#          idade          cidade  nota\n# nome                                \n# Ana         23       São Paulo   8.5\n# Bruno       25          Recife   7.0\n# Carla       22  Belo Horizonte   9.2\n# Diego       29       São Paulo   6.5\n# Elisa       31        Curitiba   8.8\n# Fábio       24        Salvador   7.4\n# Gustavo     27          Recife   5.9\n# Helena      26       São Paulo   9.0\n\nprint(df_idx.index)\n# Index(['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Gustavo', 'Helena'], dtype='object', name='nome')\n\n# agora dá pra buscar direto pelo nome, sem saber em que posição ele está\nprint(df_idx.loc[\"Carla\"])\n# idade                 22\n# cidade    Belo Horizonte\n# nota                 9.2\n# Name: Carla, dtype: object"
                    },
                    {
                        "type": "text",
                        "value": "## dtype: o tipo de cada coluna\n\nCada coluna de um DataFrame tem um `dtype`: o tipo de dado que o pandas usa por baixo dos panos (os mesmos tipos do NumPy, do Módulo 1). Número inteiro vira `int64`, número decimal vira `float64`, texto vira `object`.\n\nIsso não é detalhe técnico: o dtype decide o que uma operação faz com a coluna. Uma coluna `int64` soma. Uma coluna `object` cheia de números escritos como texto não soma, concatena."
                    },
                    {
                        "type": "table",
                        "value": "[[\"coluna\", \"dtype\"], [\"nome\", \"object\"], [\"idade\", \"int64\"], [\"cidade\", \"object\"], [\"nota\", \"float64\"]]"
                    },
                    {
                        "type": "code",
                        "value": "print(df.dtypes)\n# nome       object\n# idade       int64\n# cidade     object\n# nota      float64\n# dtype: object\n\n# por que isso importa, na prática\nprecos_texto = pd.Series([\"10\", \"20\", \"30\"])\nprint(precos_texto.dtype)\n# object\nprint(precos_texto.sum())\n# 102030\n\nprecos_num = pd.Series([10, 20, 30])\nprint(precos_num.dtype)\n# int64\nprint(precos_num.sum())\n# 60"
                    },
                    {
                        "type": "quote",
                        "value": "O índice é como você acha uma linha; o dtype é quem decide se uma coluna soma número ou concatena texto. Os dois parecem detalhe, e definem o que sua conta vai fazer."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o atributo df.dtypes mostra?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O tipo de dado de cada coluna do DataFrame",
                                "isCorrect": true
                            },
                            {
                                "text": "A quantidade de valores nulos em cada coluna",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome de cada coluna do DataFrame, em ordem",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de linhas e colunas do DataFrame",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao criar um DataFrame sem informar o parâmetro index, qual índice o pandas atribui às linhas por padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um RangeIndex, com posições inteiras começando em 0",
                                "isCorrect": true
                            },
                            {
                                "text": "Um índice vazio, sem nenhum valor até ser definido manualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "O conteúdo da primeira coluna do DataFrame",
                                "isCorrect": false
                            },
                            {
                                "text": "Um índice de texto, gerado a partir do nome de cada linha",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dada a Series precos = pd.Series([\"10\", \"20\", \"30\"]), com dtype object, qual é o resultado de precos.sum()?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "'102030', porque soma de texto concatena os valores em vez de somar",
                                "isCorrect": true
                            },
                            {
                                "text": "60, porque o pandas converte texto numérico automaticamente antes de somar",
                                "isCorrect": false
                            },
                            {
                                "text": "NaN, porque não é possível chamar sum() numa coluna do tipo object",
                                "isCorrect": false
                            },
                            {
                                "text": "Levanta um erro, porque sum() só funciona em colunas numéricas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de df_idx = df.set_index(\"nome\"), qual código retorna a linha de \"Carla\" usando o rótulo dela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "df_idx.loc[\"Carla\"]",
                                "isCorrect": true
                            },
                            {
                                "text": "df_idx.iloc[\"Carla\"]",
                                "isCorrect": false
                            },
                            {
                                "text": "df_idx[\"Carla\"]",
                                "isCorrect": false
                            },
                            {
                                "text": "df_idx.index[\"Carla\"]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de df_idx = df.set_index(\"nome\"), a coluna \"nome\" some da lista de colunas. O que aconteceu com esses valores?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Viraram o índice do DataFrame, ainda acessíveis via df_idx.index",
                                "isCorrect": true
                            },
                            {
                                "text": "Foram apagados de vez; pra recuperá-los é preciso recarregar os dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Viraram os nomes das linhas só na exibição, mas os dados sumiram",
                                "isCorrect": false
                            },
                            {
                                "text": "Continuam como coluna, só ficam ocultos até serem chamados por nome",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Inspecionando: shape, head, info, describe",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A primeira coisa que você faz com um DataFrame novo\n\nAntes de filtrar, transformar ou agrupar qualquer coisa, todo mundo que mexe com pandas roda a mesma bateria de comandos pra entender o que chegou nas mãos: quantas linhas e colunas tem, que cara os dados têm, que tipo cada coluna carrega, se falta algo, quais são as estatísticas básicas. É a mesma média, desvio padrão e quartis da trilha de Estatística, só que o pandas calcula pra toda coluna numérica de uma vez.\n\nO `df` abaixo é o mesmo DataFrame de alunos das últimas duas aulas. Hoje ele veio de um dict pequeno; no Módulo 3 vai vir de um CSV de verdade, e mais pra frente, de um banco de dados (SQL). O jeito de inspecionar é sempre o mesmo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"nome\", \"idade\", \"cidade\", \"nota\"], [\"Ana\", 23, \"São Paulo\", 8.5], [\"Bruno\", 25, \"Recife\", 7.0], [\"Carla\", 22, \"Belo Horizonte\", 9.2], [\"Diego\", 29, \"São Paulo\", 6.5], [\"Elisa\", 31, \"Curitiba\", 8.8], [\"Fábio\", 24, \"Salvador\", 7.4], [\"Gustavo\", 27, \"Recife\", 5.9], [\"Helena\", 26, \"São Paulo\", 9.0]]"
                    },
                    {
                        "type": "code",
                        "value": "# df é o mesmo DataFrame de alunos das aulas anteriores\nprint(df.shape)\n# (8, 4)\n\nprint(df.columns)\n# Index(['nome', 'idade', 'cidade', 'nota'], dtype='object')"
                    },
                    {
                        "type": "code",
                        "value": "print(df.head())\n#     nome  idade          cidade  nota\n# 0    Ana     23       São Paulo   8.5\n# 1  Bruno     25          Recife   7.0\n# 2  Carla     22  Belo Horizonte   9.2\n# 3  Diego     29       São Paulo   6.5\n# 4  Elisa     31        Curitiba   8.8\n\nprint(df.head(3))\n#     nome  idade          cidade  nota\n# 0    Ana     23       São Paulo   8.5\n# 1  Bruno     25          Recife   7.0\n# 2  Carla     22  Belo Horizonte   9.2\n\nprint(df.tail(3))\n#       nome  idade    cidade  nota\n# 5    Fábio     24  Salvador   7.4\n# 6  Gustavo     27    Recife   5.9\n# 7   Helena     26  São Paulo   9.0"
                    },
                    {
                        "type": "code",
                        "value": "df.info()\n# <class 'pandas.DataFrame'>\n# RangeIndex: 8 entries, 0 to 7\n# Data columns (total 4 columns):\n#  #   Column  Non-Null Count  Dtype  \n# ---  ------  --------------  -----  \n#  0   nome    8 non-null      object \n#  1   idade   8 non-null      int64  \n#  2   cidade  8 non-null      object \n#  3   nota    8 non-null      float64\n# dtypes: float64(1), int64(1), object(2)\n# memory usage: 388.0+ bytes"
                    },
                    {
                        "type": "code",
                        "value": "print(df.describe())\n#            idade      nota\n# count   8.000000  8.000000\n# mean   25.875000  7.787500\n# std     3.044316  1.252925\n# min    22.000000  5.900000\n# 25%    23.750000  6.875000\n# 50%    25.500000  7.950000\n# 75%    27.500000  8.850000\n# max    31.000000  9.200000\n\n# describe() entra só nas colunas numéricas por padrão\n# (a mesma média, desvio e quartis da trilha de Estatística, calculados de uma vez)"
                    },
                    {
                        "type": "quote",
                        "value": "Antes de qualquer análise: shape, head, info, describe. Cinco comandos bastam pra entender que dado chegou nas suas mãos."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que df.shape retorna?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma tupla com (número de linhas, número de colunas)",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma lista com os nomes de todas as colunas",
                                "isCorrect": false
                            },
                            {
                                "text": "O número total de valores nulos no DataFrame",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tupla com (número de colunas, número de linhas)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sem passar nenhum argumento, quantas linhas df.head() mostra por padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "5 linhas, por padrão",
                                "isCorrect": true
                            },
                            {
                                "text": "10 linhas, por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "1 linha, por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Todas as linhas, sem limite",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere o DataFrame df abaixo, com índice padrão de 0 a 4:\n\n0 Ana    8.5\n1 Bruno  7.0\n2 Carla  9.2\n3 Diego  6.5\n4 Elisa  8.8\n\nQual é o resultado de df.tail(2)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As linhas de Diego e Elisa, as duas últimas do DataFrame",
                                "isCorrect": true
                            },
                            {
                                "text": "As linhas de Ana e Bruno, as duas primeiras do DataFrame",
                                "isCorrect": false
                            },
                            {
                                "text": "As linhas de Carla e Diego, as duas do meio do DataFrame",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma linha só, a última do DataFrame, ignorando o parâmetro 2",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença principal entre df.info() e df.describe()?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "info() mostra tipos e nulos por coluna; describe() mostra estatísticas dos números",
                                "isCorrect": true
                            },
                            {
                                "text": "info() mostra estatísticas dos números; describe() mostra tipos e nulos por coluna",
                                "isCorrect": false
                            },
                            {
                                "text": "info() e describe() fazem a mesma coisa, só que com nomes diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "info() funciona só em Series; describe() funciona só em DataFrame",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O DataFrame df tem as colunas nome (object), idade (int64), cidade (object) e nota (float64). Ao rodar df.describe() sem argumentos, quais colunas aparecem no resultado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Só idade e nota, as colunas numéricas",
                                "isCorrect": true
                            },
                            {
                                "text": "Só nome e cidade, as colunas de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "As quatro colunas, numéricas e de texto juntas",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma coluna: describe() exige o parâmetro include",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Carregar e inspecionar dados",
        "aulas": [
            {
                "titulo": "Lendo um CSV com read_csv",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 3 - Carregar e inspecionar dados\n\nAté aqui você criou DataFrames na mão, digitando um dict ou uma lista de dicts direto no código (Módulo 2). Na prática, os dados quase sempre vêm de um arquivo: uma planilha exportada, um extrato de sistema, um relatório baixado de algum lugar. O formato mais comum de longe é o CSV (comma-separated values), um arquivo de texto simples onde cada linha é uma linha da tabela e uma vírgula (ou outro caractere) separa as colunas.\n\n## Lendo um arquivo CSV\n\nO ponto de entrada de praticamente toda análise em pandas é a função `pd.read_csv()`. Ela lê o arquivo do disco e devolve um DataFrame pronto pra usar, com colunas, tipos e índice já montados, sem você precisar escrever nenhum laço pra separar linha por linha."
                    },
                    {
                        "type": "text",
                        "value": "O pandas também sabe ler outros formatos comuns, com funções parecidas: `pd.read_excel()` pra planilhas do Excel (.xlsx) e `pd.read_json()` pra arquivos JSON. A ideia é sempre a mesma: você aponta pro arquivo e recebe um DataFrame de volta. Neste módulo o foco fica no CSV, de longe o formato mais usado no dia a dia de quem mexe com dados."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.read_csv(\"vendas.csv\")\nprint(df.head())\n#          data   produto    categoria  preco  quantidade          cidade\n# 0  2024-01-05  Notebook  Eletrônicos 3500.0           1       São Paulo\n# 1  2024-01-06     Mouse  Eletrônicos   50.0           3  Rio de Janeiro\n# 2  2024-01-06   Cadeira       Móveis  650.0           1  Belo Horizonte\n# 3  2024-01-07   Teclado  Eletrônicos  120.0           2       São Paulo\n# 4  2024-01-08      Mesa       Móveis  900.0           1        Curitiba"
                    },
                    {
                        "type": "table",
                        "value": "[[\"data\", \"produto\", \"categoria\", \"preco\", \"quantidade\", \"cidade\"], [\"2024-01-05\", \"Notebook\", \"Eletrônicos\", \"3500.0\", \"1\", \"São Paulo\"], [\"2024-01-06\", \"Mouse\", \"Eletrônicos\", \"50.0\", \"3\", \"Rio de Janeiro\"], [\"2024-01-06\", \"Cadeira\", \"Móveis\", \"650.0\", \"1\", \"Belo Horizonte\"], [\"2024-01-07\", \"Teclado\", \"Eletrônicos\", \"120.0\", \"2\", \"São Paulo\"], [\"2024-01-08\", \"Mesa\", \"Móveis\", \"900.0\", \"1\", \"Curitiba\"], [\"2024-01-09\", \"Monitor\", \"Eletrônicos\", \"1000.0\", \"1\", \"São Paulo\"], [\"2024-01-10\", \"Notebook\", \"Eletrônicos\", \"3500.0\", \"1\", \"Rio de Janeiro\"], [\"2024-01-10\", \"Mouse\", \"Eletrônicos\", \"50.0\", \"5\", \"Salvador\"]]"
                    },
                    {
                        "type": "text",
                        "value": "Essa é a tabela completa do arquivo `vendas.csv` (8 linhas). Repare o que o `read_csv` fez sozinho: criou um índice numérico de 0 a 7 (o arquivo não indicava nenhuma coluna como índice), separou cada valor na coluna certa e converteu `preco` pra número decimal e `quantidade` pra número inteiro. É a mesma inferência automática de tipos que você viu no Módulo 2 ao montar um DataFrame a partir de um dict, agora aplicada a um arquivo inteiro."
                    },
                    {
                        "type": "quote",
                        "value": "read_csv transforma um arquivo de texto num DataFrame pronto pra usar: uma linha de código no lugar de ler e separar cada linha manualmente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual função do pandas é usada pra ler um arquivo CSV e transformar seu conteúdo em um DataFrame?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "pd.read_csv",
                                "isCorrect": true
                            },
                            {
                                "text": "pd.load_csv",
                                "isCorrect": false
                            },
                            {
                                "text": "pd.open_csv",
                                "isCorrect": false
                            },
                            {
                                "text": "pd.from_csv",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a função pd.read_csv devolve depois de ler um arquivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um DataFrame com os dados do arquivo",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma lista de dicionários com os dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Um array do NumPy com os dados lidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma string única com o texto do arquivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O arquivo vendas.csv tem 8 linhas de dados. Depois de rodar df = pd.read_csv(\"vendas.csv\") e em seguida df.head(), quantas linhas o resultado mostra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As 5 primeiras linhas do arquivo",
                                "isCorrect": true
                            },
                            {
                                "text": "Todas as 8 linhas do arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "As 5 últimas linhas do arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas a primeira linha do arquivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além do CSV, qual função o pandas oferece pra ler diretamente um arquivo Excel (.xlsx)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "pd.read_excel",
                                "isCorrect": true
                            },
                            {
                                "text": "pd.read_xlsx",
                                "isCorrect": false
                            },
                            {
                                "text": "pd.load_excel",
                                "isCorrect": false
                            },
                            {
                                "text": "pd.import_excel",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao ler vendas.csv com pd.read_csv(\"vendas.csv\"), sem indicar nenhuma coluna como índice, qual índice o DataFrame recebe?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um índice numérico sequencial, começando em 0",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor da coluna data, usado como índice",
                                "isCorrect": false
                            },
                            {
                                "text": "Um índice alfabético, baseado no produto",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum índice, o DataFrame fica sem index",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Parâmetros do read_csv: sep, na_values e encoding",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Nem todo CSV é igual\n\nUm CSV não segue um padrão único. O separador pode não ser vírgula, valores ausentes podem vir marcados de um jeito que o pandas não reconhece de cara, e a codificação de caracteres pode não ser a esperada. O `read_csv()` tem parâmetros pra cada um desses casos, e são eles que separam \"a leitura deu certo de primeira\" de \"a leitura trouxe uma bagunça\".\n\nNo Brasil é comum encontrar arquivos exportados do Excel com ponto e vírgula (;) como separador, em vez de vírgula, porque a vírgula já é usada como separador decimal no formato brasileiro de número."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf_errado = pd.read_csv(\"vendas_br.csv\")\nprint(df_errado.shape)\n# (8, 1)\n\nprint(df_errado.columns)\n# Index(['data;produto;categoria;preco;quantidade;cidade'], dtype='object')\n\n# o arquivo inteiro caiu numa coluna só, porque o parser usou a vírgula (padrão)\n# como separador, e esse arquivo usa ponto e vírgula"
                    },
                    {
                        "type": "code",
                        "value": "df = pd.read_csv(\"vendas_br.csv\", sep=\";\")\nprint(df.shape)\n# (8, 6)\n\nprint(df.columns.tolist())\n# ['data', 'produto', 'categoria', 'preco', 'quantidade', 'cidade']"
                    },
                    {
                        "type": "table",
                        "value": "[[\"data\", \"produto\", \"categoria\", \"preco\", \"quantidade\", \"cidade\"], [\"2024-01-05\", \"Notebook\", \"Eletrônicos\", \"3500.0\", \"1\", \"São Paulo\"], [\"2024-01-06\", \"Mouse\", \"Eletrônicos\", \"50.0\", \"3\", \"Rio de Janeiro\"], [\"2024-01-06\", \"Cadeira\", \"Móveis\", \"650.0\", \"1\", \"Belo Horizonte\"], [\"2024-01-07\", \"Teclado\", \"Eletrônicos\", \"120.0\", \"2\", \"-\"], [\"2024-01-08\", \"Mesa\", \"Móveis\", \"900.0\", \"1\", \"Curitiba\"], [\"2024-01-09\", \"Monitor\", \"Eletrônicos\", \"1000.0\", \"1\", \"São Paulo\"], [\"2024-01-10\", \"Notebook\", \"Eletrônicos\", \"3500.0\", \"1\", \"Rio de Janeiro\"], [\"2024-01-10\", \"Mouse\", \"Eletrônicos\", \"50.0\", \"5\", \"Salvador\"]]"
                    },
                    {
                        "type": "text",
                        "value": "Com o separador certo, os dados caem nas colunas certas, mas repare na linha do Teclado: a cidade está como o texto \"-\", não como um valor realmente ausente. Por padrão o pandas não sabe que \"-\" significa \"sem informação\"; pra ensinar isso existe o parâmetro `na_values`, que recebe uma lista de textos pra tratar como NaN.\n\nOutros parâmetros do read_csv que aparecem com frequência: `header` (qual linha do arquivo é o cabeçalho, o padrão é a primeira), `names` (uma lista de nomes de coluna pra usar, útil quando o arquivo não tem cabeçalho) e `index_col` (qual coluna vira o índice do DataFrame, no lugar do índice numérico automático). E tem a codificação de caracteres: arquivos exportados do Excel no Brasil às vezes vêm em ISO-8859-1 (latin1) em vez de UTF-8, o que pode causar erro ou trocar os acentos por caracteres estranhos na leitura; o parâmetro `encoding` resolve, indicando a codificação certa."
                    },
                    {
                        "type": "code",
                        "value": "df = pd.read_csv(\n    \"vendas_br.csv\",\n    sep=\";\",\n    na_values=[\"-\"],\n    index_col=\"data\"\n)\n\n# se o arquivo tivesse sido exportado do Excel em ISO-8859-1 (comum no Brasil),\n# a leitura seria: pd.read_csv(\"vendas_br.csv\", sep=\";\", encoding=\"latin1\")\n\nprint(df.isna().sum())\n# produto       0\n# categoria     0\n# preco         0\n# quantidade    0\n# cidade        1\n# dtype: int64\n\nprint(list(df.index))\n# ['2024-01-05', '2024-01-06', '2024-01-06', '2024-01-07', '2024-01-08', '2024-01-09', '2024-01-10', '2024-01-10']"
                    },
                    {
                        "type": "quote",
                        "value": "sep, na_values, encoding, header, names e index_col são os ajustes finos do read_csv: sem eles, um CSV do mundo real raramente entra certo de primeira."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual parâmetro do read_csv indica qual caractere separa as colunas do arquivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "sep",
                                "isCorrect": true
                            },
                            {
                                "text": "separator",
                                "isCorrect": false
                            },
                            {
                                "text": "split_char",
                                "isCorrect": false
                            },
                            {
                                "text": "col_sep",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquivo CSV brasileiro usa ; pra separar colunas. Ao ler esse arquivo com pd.read_csv(\"dados.csv\"), sem indicar o separador, o que costuma acontecer?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O DataFrame resultante fica com uma única coluna",
                                "isCorrect": true
                            },
                            {
                                "text": "O pandas detecta o ponto e vírgula sozinho e acerta",
                                "isCorrect": false
                            },
                            {
                                "text": "A leitura falha de imediato com um erro de formato",
                                "isCorrect": false
                            },
                            {
                                "text": "O pandas ignora as colunas extras e lê só a primeira",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O arquivo vendas_br.csv usa o texto \"-\" pra indicar cidade não informada. Sem usar o parâmetro na_values, como o pandas trata esse \"-\" ao ler o arquivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como texto comum, sem virar um valor ausente",
                                "isCorrect": true
                            },
                            {
                                "text": "Como NaN automaticamente, sem precisar de ajuste",
                                "isCorrect": false
                            },
                            {
                                "text": "Como zero, convertendo o traço num valor numérico",
                                "isCorrect": false
                            },
                            {
                                "text": "Como erro, interrompendo a leitura do arquivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual parâmetro do read_csv define que uma coluna do arquivo, em vez do índice numérico automático, deve virar o índice do DataFrame?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "index_col",
                                "isCorrect": true
                            },
                            {
                                "text": "set_index",
                                "isCorrect": false
                            },
                            {
                                "text": "index_by",
                                "isCorrect": false
                            },
                            {
                                "text": "as_index",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquivo CSV foi exportado do Excel no Brasil em ISO-8859-1 (latin1). Ao ler esse arquivo com pd.read_csv(\"dados.csv\"), sem indicar a codificação, o que pode acontecer com o texto acentuado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Erro de decodificação, ou acentos lidos de forma errada",
                                "isCorrect": true
                            },
                            {
                                "text": "O pandas troca a codificação sozinho, sem problema",
                                "isCorrect": false
                            },
                            {
                                "text": "Os acentos somem, mas o resto do texto fica igual",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo é lido como binário, sem colunas de texto",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Inspecionando de verdade: shape, dtypes, info e describe",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Depois de carregar, inspecionar\n\nCarregar o arquivo é só o primeiro passo. Antes de filtrar, agrupar ou calcular qualquer coisa, vale parar e perguntar: quantas linhas e colunas eu tenho? Qual o tipo de cada coluna? Falta algum dado? Como são as estatísticas básicas dos números? No Módulo 2 você já viu `shape`, `head`, `tail`, `info` e `describe` num DataFrame pequeno, montado na mão. Agora a mesma checklist entra em ação num arquivo carregado de verdade, que é onde ela mais importa."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.read_csv(\"vendas.csv\")\n\nprint(df.shape)\n# (8, 6)\n\nprint(df.columns.tolist())\n# ['data', 'produto', 'categoria', 'preco', 'quantidade', 'cidade']\n\nprint(df.dtypes)\n# data           object\n# produto        object\n# categoria      object\n# preco         float64\n# quantidade      int64\n# cidade         object\n# dtype: object"
                    },
                    {
                        "type": "text",
                        "value": "`shape` e `dtypes` já respondem duas perguntas (quanto e de que tipo), mas nenhum dos dois mostra se falta dado em alguma coluna. É pra isso que serve o `info()`: além do tipo de cada coluna, ele mostra quantos valores não nulos (`Non-Null Count`) cada uma tem e o total de memória usado pelo DataFrame. Se uma coluna com 8 linhas mostrasse 6 non-null, já daria pra saber que 2 valores estão faltando ali."
                    },
                    {
                        "type": "code",
                        "value": "df.info()\n# <class 'pandas.core.frame.DataFrame'>\n# RangeIndex: 8 entries, 0 to 7\n# Data columns (total 6 columns):\n#  #   Column      Non-Null Count  Dtype  \n# ---  ------      --------------  -----  \n#  0   data        8 non-null      object \n#  1   produto     8 non-null      object \n#  2   categoria   8 non-null      object \n#  3   preco       8 non-null      float64\n#  4   quantidade  8 non-null      int64  \n#  5   cidade      8 non-null      object \n# dtypes: float64(1), int64(1), object(4)\n# memory usage: 516.0+ bytes"
                    },
                    {
                        "type": "text",
                        "value": "Pra fechar a inspeção, `describe()` calcula de uma vez as estatísticas das colunas numéricas: contagem, média, desvio padrão, mínimo, os quartis (25%, 50%, 75%) e máximo. São as mesmas medidas da trilha de Estatística, só que aplicadas de uma vez em cada coluna numérica do DataFrame, sem escrever nenhuma fórmula na mão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"estatística\", \"preco\", \"quantidade\"], [\"count\", \"8.0\", \"8.0\"], [\"mean\", \"1221.25\", \"1.88\"], [\"std\", \"1455.05\", \"1.46\"], [\"min\", \"50.0\", \"1.0\"], [\"25%\", \"102.5\", \"1.0\"], [\"50%\", \"775.0\", \"1.0\"], [\"75%\", \"1625.0\", \"2.25\"], [\"max\", \"3500.0\", \"5.0\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "shape, dtypes, info e describe são a primeira conversa com qualquer dataset novo: quanto tem, de que tipo é, o que falta e como os números se distribuem."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual atributo do DataFrame mostra o número de linhas e colunas, no formato (linhas, colunas)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "shape",
                                "isCorrect": true
                            },
                            {
                                "text": "size",
                                "isCorrect": false
                            },
                            {
                                "text": "columns",
                                "isCorrect": false
                            },
                            {
                                "text": "dtypes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual método mostra, coluna por coluna, quantos valores não nulos existem e quanto de memória o DataFrame ocupa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df.info()",
                                "isCorrect": true
                            },
                            {
                                "text": "df.describe()",
                                "isCorrect": false
                            },
                            {
                                "text": "df.dtypes",
                                "isCorrect": false
                            },
                            {
                                "text": "df.shape",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um DataFrame de 8 linhas tem a coluna cidade lida de um arquivo. Ao rodar df.info(), a linha da coluna cidade mostra 6 non-null. O que isso indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Duas linhas têm valor ausente (NaN) na coluna cidade",
                                "isCorrect": true
                            },
                            {
                                "text": "A coluna cidade tem só 6 linhas, diferente das outras",
                                "isCorrect": false
                            },
                            {
                                "text": "Seis linhas têm valor ausente na coluna cidade",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna cidade foi lida com o tipo de dado errado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por padrão, ao rodar df.describe() num DataFrame com colunas de texto e de número, quais colunas entram no resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Só as colunas numéricas, como float64 e int64",
                                "isCorrect": true
                            },
                            {
                                "text": "Só as colunas de texto, do tipo object",
                                "isCorrect": false
                            },
                            {
                                "text": "Todas as colunas, numéricas e de texto juntas",
                                "isCorrect": false
                            },
                            {
                                "text": "Só a primeira coluna numérica do DataFrame",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No describe() de vendas.csv, a coluna preco mostra 50% (a mediana) igual a 775.0, bem abaixo da média de 1221.25. O que isso sugere sobre a distribuição dos preços?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Existem valores altos puxando a média pra cima",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dados foram lidos com o tipo errado, causando isso",
                                "isCorrect": false
                            },
                            {
                                "text": "A mediana está calculada errada, deveria ser igual à média",
                                "isCorrect": false
                            },
                            {
                                "text": "Os preços são todos muito próximos uns dos outros",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Explorando colunas: value_counts, unique e nunique",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Olhando coluna por coluna\n\n`describe()` resume as colunas numéricas, mas ignora as colunas de texto, como categoria e cidade. Pra entender essas colunas categóricas, o método mais usado é `value_counts()`: ele conta quantas vezes cada valor distinto aparece numa coluna, do mais frequente pro menos frequente."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.read_csv(\"vendas.csv\")\n\nprint(df[\"categoria\"].value_counts())\n# categoria\n# Eletrônicos    6\n# Móveis         2\n# Name: count, dtype: int64\n\n# o mesmo método funciona em qualquer coluna categórica, como cidade"
                    },
                    {
                        "type": "table",
                        "value": "[[\"cidade\", \"contagem\"], [\"São Paulo\", \"3\"], [\"Rio de Janeiro\", \"2\"], [\"Belo Horizonte\", \"1\"], [\"Curitiba\", \"1\"], [\"Salvador\", \"1\"]]"
                    },
                    {
                        "type": "text",
                        "value": "value_counts() conta e agrupa. Quando você só quer saber quais valores distintos existem, sem contar quantas vezes cada um aparece, use `unique()`; quando quer só o número de valores distintos, use `nunique()`. Os três respondem perguntas diferentes sobre a mesma coluna: value_counts (quanto cada valor aparece), unique (quais valores existem) e nunique (quantos valores distintos existem)."
                    },
                    {
                        "type": "code",
                        "value": "print(df[\"produto\"].unique())\n# ['Notebook' 'Mouse' 'Cadeira' 'Teclado' 'Mesa' 'Monitor']\n\nprint(df[\"produto\"].nunique())\n# 6\n\nprint(df[\"cidade\"].nunique())\n# 5"
                    },
                    {
                        "type": "code",
                        "value": "# describe() já mostra isso pras colunas numéricas, mas às vezes você quer só um número direto:\nprint(df[\"preco\"].mean())\n# 1221.25\n\nprint(df[\"preco\"].min())\n# 50.0\n\nprint(df[\"preco\"].max())\n# 3500.0"
                    },
                    {
                        "type": "quote",
                        "value": "value_counts, unique e nunique são a lupa sobre uma coluna categórica: quantas vezes, quais valores e quantos valores diferentes existem ali."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual método conta quantas vezes cada valor distinto aparece numa coluna, do mais frequente pro menos frequente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "value_counts()",
                                "isCorrect": true
                            },
                            {
                                "text": "unique()",
                                "isCorrect": false
                            },
                            {
                                "text": "nunique()",
                                "isCorrect": false
                            },
                            {
                                "text": "count_values()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual método devolve só o número de valores distintos de uma coluna, sem listar quais são?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "nunique()",
                                "isCorrect": true
                            },
                            {
                                "text": "unique()",
                                "isCorrect": false
                            },
                            {
                                "text": "value_counts()",
                                "isCorrect": false
                            },
                            {
                                "text": "shape",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma coluna cidade tem 8 linhas, com São Paulo aparecendo 3 vezes, Rio de Janeiro 2 vezes, e Belo Horizonte, Curitiba e Salvador 1 vez cada. O que df[\"cidade\"].nunique() devolve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "5",
                                "isCorrect": true
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            },
                            {
                                "text": "3",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar df[\"categoria\"].unique(), qual é o formato do resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um array com cada valor distinto aparecendo uma vez",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma lista com todos os valores da coluna, repetidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Um DataFrame com uma coluna e uma linha por categoria",
                                "isCorrect": false
                            },
                            {
                                "text": "Um número inteiro com a contagem de categorias",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Rodando df[\"categoria\"].value_counts(), a soma de todos os números do resultado é sempre igual a qual valor?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ao número de linhas não nulas da coluna categoria",
                                "isCorrect": true
                            },
                            {
                                "text": "Ao número de valores distintos da coluna categoria",
                                "isCorrect": false
                            },
                            {
                                "text": "Ao número total de colunas do DataFrame inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "Ao maior valor entre as contagens exibidas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Salvando com to_csv",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Fechando o ciclo: carregar, ver, salvar\n\nDepois de carregar e inspecionar, é comum precisar salvar um resultado: a versão com o separador certo, os valores ausentes já tratados, pronta pra não precisar repetir toda a leitura de novo. O pandas salva de volta em CSV de um jeito simétrico ao read_csv, com `to_csv()`."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.read_csv(\"vendas_br.csv\", sep=\";\", na_values=[\"-\"])\n\ndf.to_csv(\"vendas_salvo.csv\")\n# conteúdo de vendas_salvo.csv:\n# ,data,produto,categoria,preco,quantidade,cidade\n# 0,2024-01-05,Notebook,Eletrônicos,3500.0,1,São Paulo\n# 1,2024-01-06,Mouse,Eletrônicos,50.0,3,Rio de Janeiro\n# 2,2024-01-06,Cadeira,Móveis,650.0,1,Belo Horizonte\n# ..."
                    },
                    {
                        "type": "text",
                        "value": "Repare na primeira coluna do arquivo salvo: veio sem nome, só com os números 0, 1, 2. Por padrão, `to_csv()` grava o índice do DataFrame como se fosse mais uma coluna. Quando o índice é só a numeração automática (como aqui), essa coluna extra não serve pra nada, e o parâmetro `index=False` evita que ela seja gravada."
                    },
                    {
                        "type": "code",
                        "value": "df.to_csv(\"vendas_salvo.csv\", index=False)\n# conteúdo de vendas_salvo.csv:\n# data,produto,categoria,preco,quantidade,cidade\n# 2024-01-05,Notebook,Eletrônicos,3500.0,1,São Paulo\n# 2024-01-06,Mouse,Eletrônicos,50.0,3,Rio de Janeiro\n# 2024-01-06,Cadeira,Móveis,650.0,1,Belo Horizonte\n# 2024-01-07,Teclado,Eletrônicos,120.0,2,\n# ...\n\n# a cidade da linha do Teclado, que era NaN, virou um campo vazio no CSV:\n# essa é a forma padrão do pandas gravar um valor ausente"
                    },
                    {
                        "type": "text",
                        "value": "Esse é o fluxo que fecha o módulo: carregar (`read_csv`, com os parâmetros certos pra cada arquivo), inspecionar e entender os dados, e salvar o resultado (`to_csv`, quase sempre com `index=False`). Entre carregar e salvar entram os próximos módulos: selecionar e filtrar linhas e colunas (Módulo 4), agrupar e agregar (Módulo 5) e limpar dados de verdade (Módulo 6). Por enquanto, o ciclo básico já está completo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"read_csv\", \"to_csv\"], [\"o que faz\", \"lê um arquivo e devolve um DataFrame\", \"grava um DataFrame num arquivo\"], [\"separador\", \"sep define o caractere que separa colunas na leitura\", \"sep também existe, pra gravar com outro separador\"], [\"índice\", \"index_col escolhe uma coluna do arquivo pra virar índice\", \"index decide se o índice é gravado no arquivo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "to_csv fecha o ciclo que o read_csv abre: carregar, entender e salvar formam o fluxo básico de qualquer análise em pandas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual método salva um DataFrame como um arquivo CSV?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "to_csv()",
                                "isCorrect": true
                            },
                            {
                                "text": "save_csv()",
                                "isCorrect": false
                            },
                            {
                                "text": "write_csv()",
                                "isCorrect": false
                            },
                            {
                                "text": "export_csv()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o parâmetro index=False faz ao rodar df.to_csv(\"saida.csv\", index=False)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Evita que o índice do DataFrame vire coluna no arquivo",
                                "isCorrect": true
                            },
                            {
                                "text": "Evita gravar o cabeçalho das colunas no arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Evita gravar linhas com valores ausentes no arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz o pandas usar ponto e vírgula como separador",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um DataFrame df tem índice numérico padrão (0, 1, 2...). Depois de df.to_csv(\"saida.csv\"), sem indicar index, o que aparece no arquivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma coluna extra no início, com os números do índice",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma mudança, o índice nunca é gravado no arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro, pois to_csv exige a opção index sempre indicada",
                                "isCorrect": false
                            },
                            {
                                "text": "As colunas do DataFrame em ordem alfabética, sem índice",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de ler vendas_br.csv com na_values=[\"-\"] (o \"-\" da coluna cidade virou NaN) e salvar com df.to_csv(\"saida.csv\", index=False), como o valor ausente aparece no arquivo salvo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como um campo vazio, entre duas vírgulas",
                                "isCorrect": true
                            },
                            {
                                "text": "Como o texto NaN, escrito por extenso",
                                "isCorrect": false
                            },
                            {
                                "text": "Como o texto \"-\", igual ao arquivo original",
                                "isCorrect": false
                            },
                            {
                                "text": "Como o número zero, no lugar do texto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um DataFrame foi lido com index_col=\"data\", o que tornou a coluna data o índice. Depois de df.to_csv(\"saida.csv\") (sem index=False) e de ler de novo com pd.read_csv(\"saida.csv\"), o que acontece com a coluna data?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ela volta como uma coluna comum, não mais como índice",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela desaparece, pois índices não são gravados no arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela continua como índice automaticamente na nova leitura",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo falha ao abrir, por causa do índice de texto",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Selecionar, filtrar e ordenar",
        "aulas": [
            {
                "titulo": "Selecionar colunas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Selecionar, filtrar e ordenar\nNo Módulo 3 você aprendeu a carregar um CSV e dar uma primeira olhada nele: `shape`, `head`, `describe`. Agora começa a parte que você vai usar em praticamente toda análise: pegar só o pedaço do DataFrame que interessa.\n\nEsse módulo tem quatro operações centrais: selecionar colunas, escolher linhas e colunas com `loc`/`iloc`, filtrar por condição e ordenar. Bem parecido com o que você já fazia em Python com listas e dicts (pegar uma chave, um item de uma lista, um `if` dentro de um `for`), só que numa linha só e otimizado.\n\n## Selecionar uma coluna x selecionar várias\n\nA primeira pergunta é: você quer **uma coluna isolada** (pra fazer conta, por exemplo) ou **um pedaço do DataFrame** (que ainda é uma tabela)? A sintaxe muda, e o tipo do resultado muda junto."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndata = {\n    \"nome\": [\"Ana\", \"Bruno\", \"Carla\", \"Diego\", \"Elisa\", \"Fábio\"],\n    \"idade\": [23, 35, 41, 29, 38, 27],\n    \"cidade\": [\"SP\", \"RJ\", \"SP\", \"MG\", \"RJ\", \"SP\"],\n    \"salario\": [4500, 7200, 9800, 5100, 8300, 4900],\n    \"departamento\": [\"TI\", \"Vendas\", \"TI\", \"Marketing\", \"Vendas\", \"TI\"]\n}\ndf = pd.DataFrame(data)\nprint(df)\n#     nome  idade cidade  salario departamento\n# 0    Ana     23     SP     4500           TI\n# 1  Bruno     35     RJ     7200       Vendas\n# 2  Carla     41     SP     9800           TI\n# 3  Diego     29     MG     5100    Marketing\n# 4  Elisa     38     RJ     8300       Vendas\n# 5  Fábio     27     SP     4900           TI"
                    },
                    {
                        "type": "table",
                        "value": "[[\"nome\", \"idade\", \"cidade\", \"salario\", \"departamento\"], [\"Ana\", \"23\", \"SP\", \"4500\", \"TI\"], [\"Bruno\", \"35\", \"RJ\", \"7200\", \"Vendas\"], [\"Carla\", \"41\", \"SP\", \"9800\", \"TI\"], [\"Diego\", \"29\", \"MG\", \"5100\", \"Marketing\"], [\"Elisa\", \"38\", \"RJ\", \"8300\", \"Vendas\"], [\"Fábio\", \"27\", \"SP\", \"4900\", \"TI\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# colchete simples com uma string: devolve uma Series\nprint(df[\"nome\"])\n# 0      Ana\n# 1    Bruno\n# 2    Carla\n# 3    Diego\n# 4    Elisa\n# 5    Fábio\n# Name: nome, dtype: object\nprint(type(df[\"nome\"]))\n# <class 'pandas.Series'>"
                    },
                    {
                        "type": "code",
                        "value": "# colchete duplo (uma lista de colunas): devolve um DataFrame\nprint(df[[\"nome\", \"idade\"]])\n#     nome  idade\n# 0    Ana     23\n# 1  Bruno     35\n# 2  Carla     41\n# 3  Diego     29\n# 4  Elisa     38\n# 5  Fábio     27\nprint(type(df[[\"nome\", \"idade\"]]))\n# <class 'pandas.DataFrame'>\n\n# até com uma coluna só, lista = DataFrame (não Series)\nprint(type(df[[\"nome\"]]))\n# <class 'pandas.DataFrame'>\n\n# erro clássico: esquecer a lista dentro do colchete\ndf[\"nome\", \"idade\"]\n# KeyError: ('nome', 'idade')"
                    },
                    {
                        "type": "text",
                        "value": "## A regra pra não confundir\n\n- `df[\"coluna\"]` (uma string) devolve uma **Series**.\n- `df[[\"coluna\"]]` ou `df[[\"a\", \"b\"]]` (uma lista) devolve um **DataFrame**, mesmo que a lista tenha uma coluna só.\n- `df[\"a\", \"b\"]` sem a lista não existe: o pandas entende que você quer uma coluna chamada literalmente `(\"a\", \"b\")` e estoura `KeyError`.\n\nTambém dá pra usar `df.nome` como atalho pra `df[\"nome\"]`, mas só funciona quando o nome da coluna não tem espaço, não começa com número e não bate com um método do pandas (tipo uma coluna chamada `count`). Fora desses casos, `df[\"nome\"]` é a forma segura, e é a que vamos usar daqui pra frente."
                    },
                    {
                        "type": "quote",
                        "value": "Colchete simples com uma coluna devolve uma Series; colchete duplo, ou uma lista de colunas, sempre devolve um DataFrame, mesmo com uma coluna só dentro."
                    }
                ],
                "questions": [
                    {
                        "statement": "No DataFrame df, com colunas nome, idade, cidade, salario e departamento, qual é o tipo de df[\"idade\"]?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Series do pandas",
                                "isCorrect": true
                            },
                            {
                                "text": "DataFrame do pandas",
                                "isCorrect": false
                            },
                            {
                                "text": "lista Python",
                                "isCorrect": false
                            },
                            {
                                "text": "array do NumPy",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando seleciona as colunas nome e idade de df e devolve um DataFrame (não uma Series)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df[[\"nome\", \"idade\"]]",
                                "isCorrect": true
                            },
                            {
                                "text": "df[\"nome\", \"idade\"]",
                                "isCorrect": false
                            },
                            {
                                "text": "df(\"nome\", \"idade\")",
                                "isCorrect": false
                            },
                            {
                                "text": "df.nome, df.idade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual expressão devolve um DataFrame com uma única coluna chamada nome (e não uma Series)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "df[[\"nome\"]]",
                                "isCorrect": true
                            },
                            {
                                "text": "df[\"nome\"]",
                                "isCorrect": false
                            },
                            {
                                "text": "df.nome",
                                "isCorrect": false
                            },
                            {
                                "text": "df.loc[\"nome\"]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Rodar df[\"nome\", \"idade\"] (sem colchete duplo) faz o quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Levanta um erro, porque falta a lista dentro dos colchetes",
                                "isCorrect": true
                            },
                            {
                                "text": "Retorna um DataFrame com as duas colunas, do mesmo jeito que uma lista",
                                "isCorrect": false
                            },
                            {
                                "text": "Retorna uma Series combinando os valores das duas colunas numa string",
                                "isCorrect": false
                            },
                            {
                                "text": "Retorna só a coluna nome e ignora idade silenciosamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se uma coluna se chama \"data nascimento\" (com espaço no meio), qual forma de seleção funciona?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "df[\"data nascimento\"]",
                                "isCorrect": true
                            },
                            {
                                "text": "df.data nascimento",
                                "isCorrect": false
                            },
                            {
                                "text": "df.data_nascimento",
                                "isCorrect": false
                            },
                            {
                                "text": "df[data nascimento]",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "loc x iloc",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## loc e iloc: apontar pra linha e coluna certas\n\nSelecionar coluna resolve boa parte do trabalho, mas às vezes você quer uma linha específica, ou um cruzamento de linha e coluna, tipo \"o salário da Carla\". Pra isso o pandas tem dois seletores que quase todo mundo confunde no começo:\n\n- **`loc`**: seleciona por **rótulo** (label), ou seja, pelo nome do índice e pelo nome da coluna. `df.loc[linha, coluna]`.\n- **`iloc`**: seleciona por **posição** (um número inteiro, como no acesso de uma lista Python). `df.iloc[0, 1]`.\n\nA confusão clássica é achar que os dois fazem a mesma coisa porque, com o índice padrão (0, 1, 2, ...), rótulo e posição costumam coincidir. Só que é coincidência, não regra. Os exemplos abaixo usam o mesmo `df` de funcionários (nome, idade, cidade, salario, departamento) que você criou na Aula 1."
                    },
                    {
                        "type": "code",
                        "value": "print(df.loc[0, \"nome\"])\n# Ana\nprint(df.iloc[0, 0])\n# Ana\n\n# os dois batem aqui porque o índice padrão é 0, 1, 2... e coincide com a posição.\n# isso é uma coincidência do índice padrão (RangeIndex), não uma regra do loc/iloc."
                    },
                    {
                        "type": "code",
                        "value": "df2 = df.set_index(\"nome\")\nprint(df2)\n#        idade cidade  salario departamento\n# nome                                     \n# Ana       23     SP     4500           TI\n# Bruno     35     RJ     7200       Vendas\n# Carla     41     SP     9800           TI\n# Diego     29     MG     5100    Marketing\n# Elisa     38     RJ     8300       Vendas\n# Fábio     27     SP     4900           TI\n\n# rótulo \"Carla\" e posição 2 apontam pra mesma linha, por enquanto\nprint(df2.loc[\"Carla\"])\n# idade             41\n# cidade            SP\n# salario         9800\n# departamento      TI\n# Name: Carla, dtype: object\nprint(df2.iloc[2])\n# idade             41\n# cidade            SP\n# salario         9800\n# departamento      TI\n# Name: Carla, dtype: object\n\n# depois de ordenar por idade, a posição 2 já não é mais a Carla\ndf2_por_idade = df2.sort_values(\"idade\")\nprint(df2_por_idade.iloc[2])\n# idade                  29\n# cidade                 MG\n# salario              5100\n# departamento    Marketing\n# Name: Diego, dtype: object\n\n# mas loc continua achando a Carla pelo nome, não importa a ordem das linhas\nprint(df2_por_idade.loc[\"Carla\"])\n# idade             41\n# cidade            SP\n# salario         9800\n# departamento      TI\n# Name: Carla, dtype: object"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"loc\", \"iloc\"], [\"Seleciona por\", \"rótulo (nome do índice/coluna)\", \"posição inteira (0, 1, 2...)\"], [\"Sintaxe\", \"df.loc[linha, coluna]\", \"df.iloc[posição_linha, posição_coluna]\"], [\"Fatiamento (slice)\", \"df.loc[0:2] inclui o fim (3 linhas)\", \"df.iloc[0:2] exclui o fim (2 linhas)\"], [\"Erro comum\", \"usar um número achando que é posição\", \"usar um rótulo onde só cabe posição\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# fatiamento: loc inclui o fim, iloc exclui\nprint(df.loc[0:2, \"nome\"])\n# 0      Ana\n# 1    Bruno\n# 2    Carla\n# Name: nome, dtype: object\nprint(df.iloc[0:2, 0])\n# 0      Ana\n# 1    Bruno\n# Name: nome, dtype: object\n\n# selecionar várias linhas e colunas ao mesmo tempo\nprint(df.loc[[0, 2], [\"nome\", \"salario\"]])\n#     nome  salario\n# 0    Ana     4500\n# 2  Carla     9800\nprint(df.iloc[[0, 2], [0, 3]])\n#     nome  salario\n# 0    Ana     4500\n# 2  Carla     9800"
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar cada um\n\n- Pensou num **nome** (de linha ou de coluna)? `loc`.\n- Pensou num **número de posição** (a primeira, a segunda, a terceira linha)? `iloc`.\n- Cuidado quando o índice já é numérico (o `RangeIndex` padrão, 0, 1, 2...): `loc[1]` parece posição, mas continua sendo rótulo. Na maioria das vezes dá no mesmo, mas depois de um `sort_values` ou de um filtro isso deixa de ser verdade, porque a posição muda e o rótulo não.\n- E lembra do fatiamento: `loc` inclui a última posição do intervalo, `iloc` não, igual fatiamento de lista Python."
                    },
                    {
                        "type": "quote",
                        "value": "loc busca por rótulo (o nome da linha ou coluna); iloc busca por posição (um número, como numa lista). Com o índice padrão os dois costumam coincidir, e é exatamente isso que engana."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para selecionar a linha de rótulo 2 e a coluna \"idade\" em df, qual comando é o correto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df.loc[2, \"idade\"]",
                                "isCorrect": true
                            },
                            {
                                "text": "df.iloc[2, \"idade\"]",
                                "isCorrect": false
                            },
                            {
                                "text": "df[\"idade\"].loc[2, 0]",
                                "isCorrect": false
                            },
                            {
                                "text": "df.iloc[\"idade\", 2]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "df2 = df.set_index(\"nome\"). Qual comando seleciona a linha da Carla pelo rótulo do índice?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df2.loc[\"Carla\"]",
                                "isCorrect": true
                            },
                            {
                                "text": "df2.iloc[\"Carla\"]",
                                "isCorrect": false
                            },
                            {
                                "text": "df2.loc[2]",
                                "isCorrect": false
                            },
                            {
                                "text": "df2[\"Carla\"]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em df, com índice padrão 0 a 5, qual a diferença entre df.loc[0:2] e df.iloc[0:2]?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "loc[0:2] traz 3 linhas (inclui a posição 2); iloc[0:2] traz 2 linhas (exclui a posição 2)",
                                "isCorrect": true
                            },
                            {
                                "text": "loc[0:2] traz 2 linhas (exclui a posição 2); iloc[0:2] traz 3 linhas (inclui a posição 2)",
                                "isCorrect": false
                            },
                            {
                                "text": "loc[0:2] e iloc[0:2] trazem as mesmas 3 linhas, incluindo a de posição 2 nos dois casos",
                                "isCorrect": false
                            },
                            {
                                "text": "loc[0:2] e iloc[0:2] trazem as mesmas 2 linhas, excluindo a de posição 2 nos dois casos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de df_ordenado = df.sort_values(\"idade\"), por que df_ordenado.iloc[0] pode não ser a mesma linha de df.iloc[0]?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "porque iloc segue a posição, que mudou de lugar com o sort_values",
                                "isCorrect": true
                            },
                            {
                                "text": "porque iloc segue o rótulo do índice, que o sort_values também reordena",
                                "isCorrect": false
                            },
                            {
                                "text": "porque sort_values apaga o índice original e cria um novo do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "porque iloc só funciona corretamente em DataFrames nunca ordenados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando usa iloc corretamente pra pegar a linha de posição 0 e a coluna de posição 0 de df, sem depender dos rótulos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "df.iloc[0, 0]",
                                "isCorrect": true
                            },
                            {
                                "text": "df.loc[0, 0]",
                                "isCorrect": false
                            },
                            {
                                "text": "df.iloc[0, \"nome\"]",
                                "isCorrect": false
                            },
                            {
                                "text": "df.iloc[1, 1]",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Filtrar por condição (boolean indexing)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Filtrar é escrever a condição dentro do colchete\n\nLá em Estatística você aprendia a identificar quem era outlier, quem estava acima da média. Em Python puro, filtrar uma lista de dicionários significava um `for` com um `if` dentro, montando uma lista nova. Em pandas isso vira uma linha: você escreve a condição dentro do colchete, e o pandas devolve só as linhas onde ela é `True`. É o chamado **boolean indexing**.\n\nCompare a tabela original com o resultado depois de filtrar só quem tem mais de 30 anos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"nome\", \"idade\", \"cidade\", \"departamento\"], [\"Ana\", \"23\", \"SP\", \"TI\"], [\"Bruno\", \"35\", \"RJ\", \"Vendas\"], [\"Carla\", \"41\", \"SP\", \"TI\"], [\"Diego\", \"29\", \"MG\", \"Marketing\"], [\"Elisa\", \"38\", \"RJ\", \"Vendas\"], [\"Fábio\", \"27\", \"SP\", \"TI\"]]"
                    },
                    {
                        "type": "table",
                        "value": "[[\"nome\", \"idade\", \"cidade\", \"departamento\"], [\"Bruno\", \"35\", \"RJ\", \"Vendas\"], [\"Carla\", \"41\", \"SP\", \"TI\"], [\"Elisa\", \"38\", \"RJ\", \"Vendas\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# a condição sozinha devolve uma Series de True/False, uma pra cada linha\nmascara = df[\"idade\"] > 30\nprint(mascara)\n# 0    False\n# 1     True\n# 2     True\n# 3    False\n# 4     True\n# 5    False\n# Name: idade, dtype: bool\n\n# usando a máscara dentro do colchete, o pandas mantém só as linhas True\nprint(df[mascara])\n#     nome  idade cidade  salario departamento\n# 1  Bruno     35     RJ     7200       Vendas\n# 2  Carla     41     SP     9800           TI\n# 4  Elisa     38     RJ     8300       Vendas\n\n# forma direta, sem variável intermediária (a mais comum no dia a dia)\nprint(df[df[\"idade\"] > 30])\n#     nome  idade cidade  salario departamento\n# 1  Bruno     35     RJ     7200       Vendas\n# 2  Carla     41     SP     9800           TI\n# 4  Elisa     38     RJ     8300       Vendas"
                    },
                    {
                        "type": "code",
                        "value": "# E: as duas condições precisam ser verdadeiras (repare nos parênteses em cada uma)\nprint(df[(df[\"idade\"] > 30) & (df[\"cidade\"] == \"SP\")])\n#     nome  idade cidade  salario departamento\n# 2  Carla     41     SP     9800           TI\n\n# OU: pelo menos uma das condições precisa ser verdadeira\nprint(df[(df[\"idade\"] > 30) | (df[\"departamento\"] == \"Marketing\")])\n#     nome  idade cidade  salario departamento\n# 1  Bruno     35     RJ     7200       Vendas\n# 2  Carla     41     SP     9800           TI\n# 3  Diego     29     MG     5100    Marketing\n# 4  Elisa     38     RJ     8300       Vendas\n\n# isin: \"o departamento está numa dessas opções?\"\nprint(df[df[\"departamento\"].isin([\"TI\", \"Marketing\"])])\n#     nome  idade cidade  salario departamento\n# 0    Ana     23     SP     4500           TI\n# 2  Carla     41     SP     9800           TI\n# 3  Diego     29     MG     5100    Marketing\n# 5  Fábio     27     SP     4900           TI\n\n# usar \"and\" no lugar de \"&\" quebra\ndf[(df[\"idade\"] > 30) and (df[\"cidade\"] == \"SP\")]\n# ValueError: The truth value of a Series is ambiguous. Use a.empty, a.bool(), a.item(), a.any() or a.all()."
                    },
                    {
                        "type": "text",
                        "value": "## Por que & e não and\n\n`and` e `or` do Python esperam **um único valor** True ou False de cada lado. `df[\"idade\"] > 30` não é um valor só, é uma Series inteira cheia de True/False, um pra cada linha, e o Python não sabe qual desses valores usar pra decidir. Daí o `ValueError`.\n\n`&` (E) e `|` (OU) são operadores vetorizados: comparam posição por posição e devolvem outra Series de booleanos, do mesmo jeito que `+` soma posição por posição. Só que `&` tem precedência maior que `>` e `==` em Python, então sem os parênteses em volta de cada condição o resultado sai errado (ou nem roda). Regra prática: **sempre** parênteses em cada condição.\n\n`isin` é um atalho pra \"esse valor está numa lista de opções\", equivalente a várias condições de igualdade encadeadas com `|`."
                    },
                    {
                        "type": "quote",
                        "value": "Pra filtrar, combine condições com & (e) e | (ou), sempre entre parênteses. and e or são pra um valor só, não pra uma Series inteira, por isso eles quebram aqui."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando devolve as linhas de df em que idade é maior que 30?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df[df[\"idade\"] > 30]",
                                "isCorrect": true
                            },
                            {
                                "text": "df.filter(idade > 30)",
                                "isCorrect": false
                            },
                            {
                                "text": "df[\"idade\" > 30]",
                                "isCorrect": false
                            },
                            {
                                "text": "df.loc[idade > 30]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "df[\"idade\"] > 30, sozinho, sem o colchete por fora, devolve o quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "uma Series de True/False, uma pra cada linha",
                                "isCorrect": true
                            },
                            {
                                "text": "um DataFrame só com as linhas verdadeiras",
                                "isCorrect": false
                            },
                            {
                                "text": "um único valor True ou False, tipo um if comum",
                                "isCorrect": false
                            },
                            {
                                "text": "uma lista Python com os índices verdadeiros",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando seleciona as linhas com idade maior que 30 E cidade igual a \"SP\"?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "df[(df[\"idade\"] > 30) & (df[\"cidade\"] == \"SP\")]",
                                "isCorrect": true
                            },
                            {
                                "text": "df[df[\"idade\"] > 30 and df[\"cidade\"] == \"SP\"]",
                                "isCorrect": false
                            },
                            {
                                "text": "df[df[\"idade\"] > 30 & df[\"cidade\"] == \"SP\"]",
                                "isCorrect": false
                            },
                            {
                                "text": "df[df[\"idade\"] > 30, df[\"cidade\"] == \"SP\"]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Rodar df[(df[\"idade\"] > 30) and (df[\"cidade\"] == \"SP\")] lança qual erro?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "ValueError, porque a Series inteira não pode virar um único if",
                                "isCorrect": true
                            },
                            {
                                "text": "TypeError, porque idade e cidade são colunas de tipos diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "KeyError, porque uma das colunas usadas no filtro não existe",
                                "isCorrect": false
                            },
                            {
                                "text": "SyntaxError, porque os parênteses usados não fecham corretamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "df[\"departamento\"].isin([\"TI\", \"Vendas\"]) seleciona quais linhas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "as linhas em que o departamento é TI ou é Vendas",
                                "isCorrect": true
                            },
                            {
                                "text": "as linhas em que departamento é TI e Vendas juntos",
                                "isCorrect": false
                            },
                            {
                                "text": "as linhas em que departamento não é TI nem Vendas",
                                "isCorrect": false
                            },
                            {
                                "text": "apenas a primeira linha que bater com TI ou Vendas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ordenar (sort_values)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quem está no topo, quem está no fim\n\nDepois de filtrar quem interessa, a pergunta seguinte costuma ser: e quem é o maior, o menor, o primeiro? Ordenar em pandas usa `sort_values`, que ordena pelos **valores** de uma ou mais colunas, e `sort_index`, que ordena pelo **índice**. Pra um \"top N\" direto, tem os atalhos `nlargest` e `nsmallest`."
                    },
                    {
                        "type": "code",
                        "value": "print(df.sort_values(\"salario\"))\n#     nome  idade cidade  salario departamento\n# 0    Ana     23     SP     4500           TI\n# 5  Fábio     27     SP     4900           TI\n# 3  Diego     29     MG     5100    Marketing\n# 1  Bruno     35     RJ     7200       Vendas\n# 4  Elisa     38     RJ     8300       Vendas\n# 2  Carla     41     SP     9800           TI\n\n# do maior pro menor\nprint(df.sort_values(\"salario\", ascending=False))\n#     nome  idade cidade  salario departamento\n# 2  Carla     41     SP     9800           TI\n# 4  Elisa     38     RJ     8300       Vendas\n# 1  Bruno     35     RJ     7200       Vendas\n# 3  Diego     29     MG     5100    Marketing\n# 5  Fábio     27     SP     4900           TI\n# 0    Ana     23     SP     4500           TI"
                    },
                    {
                        "type": "code",
                        "value": "# ordenar por departamento (alfabético) e, dentro de cada um, por idade decrescente\nprint(df.sort_values([\"departamento\", \"idade\"], ascending=[True, False]))\n#     nome  idade cidade  salario departamento\n# 3  Diego     29     MG     5100    Marketing\n# 2  Carla     41     SP     9800           TI\n# 5  Fábio     27     SP     4900           TI\n# 0    Ana     23     SP     4500           TI\n# 4  Elisa     38     RJ     8300       Vendas\n# 1  Bruno     35     RJ     7200       Vendas"
                    },
                    {
                        "type": "table",
                        "value": "[[\"nome\", \"departamento\", \"idade\"], [\"Diego\", \"Marketing\", \"29\"], [\"Carla\", \"TI\", \"41\"], [\"Fábio\", \"TI\", \"27\"], [\"Ana\", \"TI\", \"23\"], [\"Elisa\", \"Vendas\", \"38\"], [\"Bruno\", \"Vendas\", \"35\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# sort_values embaralha a ordem das linhas, mas não muda o índice de cada uma\ndf_por_idade = df.sort_values(\"idade\")\nprint(df_por_idade.sort_index())\n#     nome  idade cidade  salario departamento\n# 0    Ana     23     SP     4500           TI\n# 1  Bruno     35     RJ     7200       Vendas\n# 2  Carla     41     SP     9800           TI\n# 3  Diego     29     MG     5100    Marketing\n# 4  Elisa     38     RJ     8300       Vendas\n# 5  Fábio     27     SP     4900           TI\n\n# as 3 linhas de maior salário, já ordenadas do maior pro menor\nprint(df.nlargest(3, \"salario\"))\n#     nome  idade cidade  salario departamento\n# 2  Carla     41     SP     9800           TI\n# 4  Elisa     38     RJ     8300       Vendas\n# 1  Bruno     35     RJ     7200       Vendas\n\n# as 2 linhas de menor idade\nprint(df.nsmallest(2, \"idade\"))\n#     nome  idade cidade  salario departamento\n# 0    Ana     23     SP     4500           TI\n# 5  Fábio     27     SP     4900           TI"
                    },
                    {
                        "type": "text",
                        "value": "## Recapitulando\n\n- `sort_values(\"coluna\")` ordena pelos valores, crescente por padrão; `ascending=False` inverte.\n- Passar uma lista de colunas define um critério de desempate: a segunda coluna só decide quando a primeira empata.\n- `sort_index()` devolve a ordem original do índice, útil depois de um `sort_values` que só reorganizou as linhas sem mudar o índice de cada uma.\n- `nlargest(n, \"coluna\")` e `nsmallest(n, \"coluna\")` são o atalho direto pro top e pro bottom N, sem precisar lembrar de inverter o `ascending` e encadear um `.head(n)`."
                    },
                    {
                        "type": "quote",
                        "value": "sort_values ordena pelos valores de uma ou mais colunas; sort_index devolve a ordem original do índice; nlargest e nsmallest são o atalho direto pro topo e pro fundo da tabela."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando ordena df pelo salário, do menor pro maior?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df.sort_values(\"salario\")",
                                "isCorrect": true
                            },
                            {
                                "text": "df.sort_values(\"salario\", ascending=False)",
                                "isCorrect": false
                            },
                            {
                                "text": "df.sort_index(\"salario\")",
                                "isCorrect": false
                            },
                            {
                                "text": "df.nlargest(\"salario\")",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual parâmetro de sort_values inverte a ordem pra do maior pro menor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "ascending=False",
                                "isCorrect": true
                            },
                            {
                                "text": "descending=True",
                                "isCorrect": false
                            },
                            {
                                "text": "reverse=True",
                                "isCorrect": false
                            },
                            {
                                "text": "order=\"desc\"",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "df.sort_values([\"departamento\", \"idade\"], ascending=[True, False]) ordena como?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "departamento em ordem alfabética; dentro de cada departamento, idade do maior pro menor",
                                "isCorrect": true
                            },
                            {
                                "text": "departamento e idade juntos, como se os dois formassem um único critério de soma",
                                "isCorrect": false
                            },
                            {
                                "text": "idade em ordem alfabética; dentro de cada idade, departamento do maior pro menor",
                                "isCorrect": false
                            },
                            {
                                "text": "departamento em ordem alfabética; dentro de cada departamento, idade do menor pro maior",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de df_ordenado = df.sort_values(\"idade\"), o que df_ordenado.sort_index() devolve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "as linhas na ordem original do índice, antes do sort_values",
                                "isCorrect": true
                            },
                            {
                                "text": "as linhas ordenadas por idade, do menor pro maior",
                                "isCorrect": false
                            },
                            {
                                "text": "um erro, porque sort_index não existe depois de um sort_values",
                                "isCorrect": false
                            },
                            {
                                "text": "as linhas ordenadas por idade, do maior pro menor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença prática entre df.nlargest(3, \"salario\") e df.sort_values(\"salario\", ascending=False).head(3)?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "praticamente nenhuma no resultado final; nlargest é só mais direto pra top N",
                                "isCorrect": true
                            },
                            {
                                "text": "nlargest inclui uma linha extra quando há empate; o outro sempre traz exatamente 3",
                                "isCorrect": false
                            },
                            {
                                "text": "nlargest ordena crescente; o sort_values com head já vem decrescente",
                                "isCorrect": false
                            },
                            {
                                "text": "nlargest não aceita nome de coluna como argumento, só posição numérica",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Criar e alterar colunas (apply, map)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Da seleção pra transformação\n\nSelecionar, filtrar e ordenar mostram pedaços do DataFrame, mas não mudam ele. Agora vem o passo que transforma de verdade: criar coluna nova e alterar coluna existente. É aqui que aquele `for` criando uma lista nova em Python vira, na maioria das vezes, uma conta vetorizada numa linha só."
                    },
                    {
                        "type": "code",
                        "value": "df[\"salario_anual\"] = df[\"salario\"] * 12\ndf[\"senior\"] = df[\"idade\"] >= 35\nprint(df[[\"nome\", \"salario\", \"salario_anual\", \"senior\"]])\n#     nome  salario  salario_anual  senior\n# 0    Ana     4500          54000   False\n# 1  Bruno     7200          86400    True\n# 2  Carla     9800         117600    True\n# 3  Diego     5100          61200   False\n# 4  Elisa     8300          99600    True\n# 5  Fábio     4900          58800   False"
                    },
                    {
                        "type": "table",
                        "value": "[[\"nome\", \"salario\", \"salario_anual\", \"senior\"], [\"Ana\", \"4500\", \"54000\", \"False\"], [\"Bruno\", \"7200\", \"86400\", \"True\"], [\"Carla\", \"9800\", \"117600\", \"True\"], [\"Diego\", \"5100\", \"61200\", \"False\"], [\"Elisa\", \"8300\", \"99600\", \"True\"], [\"Fábio\", \"4900\", \"58800\", \"False\"]]"
                    },
                    {
                        "type": "code",
                        "value": "def classificar_faixa(idade):\n    if idade < 30:\n        return \"jovem\"\n    elif idade < 40:\n        return \"adulto\"\n    else:\n        return \"senior\"\n\ndf[\"faixa\"] = df[\"idade\"].apply(classificar_faixa)\nprint(df[[\"nome\", \"idade\", \"faixa\"]])\n#     nome  idade   faixa\n# 0    Ana     23   jovem\n# 1  Bruno     35  adulto\n# 2  Carla     41  senior\n# 3  Diego     29   jovem\n# 4  Elisa     38  adulto\n# 5  Fábio     27   jovem\n\nmapa_regiao = {\"SP\": \"Sudeste\", \"RJ\": \"Sudeste\", \"MG\": \"Sudeste\"}\ndf[\"regiao\"] = df[\"cidade\"].map(mapa_regiao)\nprint(df[[\"nome\", \"cidade\", \"regiao\"]])\n#     nome cidade   regiao\n# 0    Ana     SP  Sudeste\n# 1  Bruno     RJ  Sudeste\n# 2  Carla     SP  Sudeste\n# 3  Diego     MG  Sudeste\n# 4  Elisa     RJ  Sudeste\n# 5  Fábio     SP  Sudeste\n\n# se a cidade não estivesse no dicionário, map devolveria NaN nessa linha"
                    },
                    {
                        "type": "code",
                        "value": "# criar e alterar um recorte numa variável separada funciona sem aviso:\n# o pandas atual usa Copy-on-Write, então df_seniors já nasce independente\ndf_seniors = df[df[\"idade\"] >= 35]\ndf_seniors[\"bonus\"] = 500\nprint(df_seniors[[\"nome\", \"idade\", \"bonus\"]])\n#     nome  idade  bonus\n# 1  Bruno     35    500\n# 2  Carla     41    500\n# 4  Elisa     38    500\nprint(\"bonus\" in df.columns)\n# False\n\n# a armadilha que continua existindo: filtrar e alterar numa expressão só, encadeada\ndf[df[\"idade\"] >= 35][\"bonus\"] = 500\n# A value is being set on a copy of a DataFrame or Series through chained assignment.\n# Such chained assignment never works to update the original DataFrame or Series, because the intermediate object on which we are setting values always behaves as a copy (due to Copy-on-Write).\n#\n# Try using '.loc[row_indexer, col_indexer] = value' instead, to perform the assignment in a single step.\n#\n# See the documentation for a more detailed explanation: https://pandas.pydata.org/pandas-docs/stable/user_guide/copy_on_write.html#chained-assignment\n\n# a forma certa de filtrar e alterar ao mesmo tempo, num passo só\ndf.loc[df[\"idade\"] >= 35, \"bonus\"] = 500\nprint(df[[\"nome\", \"idade\", \"bonus\"]])\n#     nome  idade  bonus\n# 0    Ana     23    NaN\n# 1  Bruno     35  500.0\n# 2  Carla     41  500.0\n# 3  Diego     29    NaN\n# 4  Elisa     38  500.0\n# 5  Fábio     27    NaN"
                    },
                    {
                        "type": "text",
                        "value": "## Recapitulando\n\n- Criar coluna com `df[\"nova\"] = ...` de forma vetorizada é sempre a primeira opção: roda por baixo dos panos em C, é rápido.\n- `apply` chama uma função Python pra cada valor da coluna. É flexível (lógica que não vira conta direta cabe aqui), mas mais lento que uma conta vetorizada.\n- `map` troca cada valor de uma Series usando um dicionário (ou uma função); valor que não está no dicionário vira `NaN`.\n- Cuidado com **atribuição encadeada** (filtrar e alterar na mesma expressão, tipo `df[condição][\"coluna\"] = valor`): isso nunca atualiza o DataFrame original, porque o pedaço filtrado vira uma cópia independente na hora. Você vai ver esse cuidado citado como `SettingWithCopyWarning` em muito material por aí; hoje o pandas (com Copy-on-Write) detecta o problema e avisa de outro jeito, mas a lição é a mesma. A forma certa de filtrar e alterar junto é com `loc`: `df.loc[condição, \"coluna\"] = valor`, num passo só."
                    },
                    {
                        "type": "quote",
                        "value": "Prefira df[\"coluna\"] = conta vetorizada sempre que der; use apply pra lógica que não vira conta direta, map pra trocar valores por um dicionário, e loc pra filtrar e alterar ao mesmo tempo, num passo só."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando cria a coluna salario_anual multiplicando salario por 12?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df[\"salario_anual\"] = df[\"salario\"] * 12",
                                "isCorrect": true
                            },
                            {
                                "text": "df.salario_anual = df[\"salario\"].apply(12)",
                                "isCorrect": false
                            },
                            {
                                "text": "df[\"salario_anual\"] == df[\"salario\"] * 12",
                                "isCorrect": false
                            },
                            {
                                "text": "df[\"salario\"] = df[\"salario_anual\"] * 12",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "df[\"idade\"].apply(funcao) faz o quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "chama funcao pra cada valor da coluna idade e devolve o resultado",
                                "isCorrect": true
                            },
                            {
                                "text": "chama funcao uma única vez, passando a coluna idade inteira de uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "filtra a coluna idade mantendo só os valores em que funcao devolve True",
                                "isCorrect": false
                            },
                            {
                                "text": "ordena a coluna idade usando funcao como critério de comparação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "df[\"cidade\"].map({\"SP\": \"Sudeste\", \"RJ\": \"Sudeste\"}) faz o quê numa linha com cidade \"MG\", que não está no dicionário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "vira NaN (valor ausente) nessa linha",
                                "isCorrect": true
                            },
                            {
                                "text": "lança KeyError e para a execução",
                                "isCorrect": false
                            },
                            {
                                "text": "mantém o valor \"MG\" sem alterar nada",
                                "isCorrect": false
                            },
                            {
                                "text": "vira a string de texto \"None\"",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Rodar df[df[\"idade\"] > 30][\"bonus\"] = 500, filtrando e alterando na mesma expressão, dispara um aviso de atribuição encadeada e não muda o df original. Qual é a forma recomendada de filtrar e alterar ao mesmo tempo, sem risco?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "usar df.loc[df[\"idade\"] > 30, \"bonus\"] = 500, num passo só",
                                "isCorrect": true
                            },
                            {
                                "text": "usar .iloc no lugar do colchete simples pra fazer o mesmo filtro",
                                "isCorrect": false
                            },
                            {
                                "text": "criar a coluna bonus antes de aplicar qualquer filtro no DataFrame",
                                "isCorrect": false
                            },
                            {
                                "text": "trocar o sinal de = por == na hora de atribuir o valor de bonus",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a principal diferença entre df[\"nova\"] = df[\"idade\"] * 2 e df[\"idade\"].apply(lambda x: x * 2)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "o resultado final é igual; a conta vetorizada direta costuma ser mais rápida",
                                "isCorrect": true
                            },
                            {
                                "text": "o resultado final é diferente, porque apply sempre arredonda os valores",
                                "isCorrect": false
                            },
                            {
                                "text": "só a versão com apply consegue lidar com números, a direta só funciona com texto",
                                "isCorrect": false
                            },
                            {
                                "text": "só a versão direta funciona dentro de um DataFrame, apply exige uma lista Python",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Agrupar e agregar (groupby)",
        "aulas": [
            {
                "titulo": "Split-apply-combine (a ideia do groupby)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 5 - Agrupar e agregar (groupby)\n\nEsse é o módulo mais importante da trilha até aqui. Se você entender bem o `groupby`, resolve sozinho boa parte dos pedidos de análise que vai aparecer no trabalho: a média de vendas por região, quantos clientes por categoria, o total por mês. Tudo isso é groupby.\n\n## Aula 1: Split-apply-combine (a ideia do groupby)\n\nAntes de escrever `df.groupby(...)`, vale entender a ideia por trás. Imagina que você tem uma pilha de notas fiscais espalhadas na mesa e quer saber o total vendido por categoria de produto. Na prática, você faria três coisas:\n\n- Separaria as notas em pilhas, uma pilha por categoria.\n- Somaria o valor de cada pilha separadamente.\n- Juntaria os totais numa tabela final, uma linha por categoria.\n\nEsse processo tem nome em análise de dados: **split-apply-combine** (dividir, aplicar, combinar)."
                    },
                    {
                        "type": "text",
                        "value": "## As três etapas\n\n- **Split (dividir):** o pandas separa as linhas do DataFrame em grupos, de acordo com os valores de uma coluna (ou mais de uma). Cada valor distinto vira um grupo.\n- **Apply (aplicar):** você aplica uma função em cada grupo separadamente, como soma, média, contagem ou máximo.\n- **Combine (combinar):** o pandas junta o resultado de cada grupo de volta numa estrutura única (uma Series ou um DataFrame).\n\nSe você já usou SQL, isso é exatamente o `GROUP BY`. A trilha de SQL e Banco de Dados vai formalizar essa ideia com `SELECT categoria, SUM(valor) FROM vendas GROUP BY categoria`. Por enquanto, fica a intuição: groupby é dividir, resolver cada pedaço e juntar de novo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"categoria\",\"valor\"],[\"Eletrônicos\",\"1200\"],[\"Roupas\",\"300\"],[\"Eletrônicos\",\"800\"],[\"Roupas\",\"150\"],[\"Alimentos\",\"90\"]]"
                    },
                    {
                        "type": "code",
                        "value": "vendas = [\n    {'categoria': 'Eletrônicos', 'valor': 1200},\n    {'categoria': 'Roupas', 'valor': 300},\n    {'categoria': 'Eletrônicos', 'valor': 800},\n    {'categoria': 'Roupas', 'valor': 150},\n    {'categoria': 'Alimentos', 'valor': 90},\n]\n\n# split + apply + combine, na mão\nsoma_por_categoria = {}\nfor venda in vendas:\n    cat = venda['categoria']\n    if cat not in soma_por_categoria:\n        soma_por_categoria[cat] = 0\n    soma_por_categoria[cat] += venda['valor']\n\nprint(soma_por_categoria)\n# {'Eletrônicos': 2000, 'Roupas': 450, 'Alimentos': 90}"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.DataFrame(vendas)\nresultado = df.groupby('categoria')['valor'].sum()\nprint(resultado)\n# categoria\n# Alimentos        90\n# Eletrônicos    2000\n# Roupas          450\n# Name: valor, dtype: int64"
                    },
                    {
                        "type": "table",
                        "value": "[[\"categoria\",\"valor\"],[\"Alimentos\",\"90\"],[\"Eletrônicos\",\"2000\"],[\"Roupas\",\"450\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "groupby é o padrão split-apply-combine em uma linha: divide o DataFrame em grupos, aplica uma função em cada um e junta tudo de volta numa tabela."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa a etapa split no padrão split-apply-combine?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dividir o DataFrame em grupos, um para cada valor distinto da coluna escolhida.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dividir o DataFrame em duas metades iguais, sem olhar pros valores das colunas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dividir o DataFrame em treino e teste, como se faz em machine learning.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dividir os dados em arquivos CSV separados, um por categoria.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual etapa do split-apply-combine junta os resultados de cada grupo numa única tabela final?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Split",
                                "isCorrect": false
                            },
                            {
                                "text": "Combine",
                                "isCorrect": true
                            },
                            {
                                "text": "Apply",
                                "isCorrect": false
                            },
                            {
                                "text": "Aggregate",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista tem uma lista de dicionários com vendas por categoria e usa um laço for pra somar o valor de cada categoria manualmente, guardando o total num dicionário. A que conceito do pandas esse processo corresponde?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O mesmo processo que o groupby faz de forma automática e em uma linha.",
                                "isCorrect": true
                            },
                            {
                                "text": "O mesmo processo que o método merge faz ao juntar duas tabelas diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O mesmo processo que o método sort_values faz ao ordenar as linhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O mesmo processo que o método loc faz ao selecionar linhas por rótulo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando pandas substitui esse laço manual e retorna o total de valor por categoria?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "df.sort_values('valor').sum()",
                                "isCorrect": false
                            },
                            {
                                "text": "df.groupby('categoria')['valor'].sum()",
                                "isCorrect": true
                            },
                            {
                                "text": "df['categoria'].sum()['valor']",
                                "isCorrect": false
                            },
                            {
                                "text": "df.groupby('valor')['categoria'].sum()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo em que df.groupby('categoria')['valor'].sum() retorna Alimentos, Eletrônicos e Roupas nessa ordem, mesmo a linha de Alimentos aparecendo por último no DataFrame original, o que explica essa ordem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Por padrão, o groupby ordena os grupos pelo valor da chave de agrupamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "O groupby preserva a ordem original das linhas do DataFrame de entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O groupby ordena os grupos pelo valor agregado, do menor pro maior.",
                                "isCorrect": false
                            },
                            {
                                "text": "O groupby embaralha os grupos aleatoriamente a cada execução.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "groupby básico",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Aula 2: groupby básico\n\nNa aula passada vimos a ideia por trás do groupby. Agora bora usar de verdade, com um dataset um pouco maior: vendas por categoria e região."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndados = {\n    'categoria': ['Eletrônicos', 'Roupas', 'Eletrônicos', 'Roupas', 'Alimentos', 'Eletrônicos', 'Alimentos'],\n    'regiao': ['Sul', 'Sul', 'Norte', 'Norte', 'Sul', 'Sul', 'Norte'],\n    'valor': [1200, 300, 800, 150, 90, 500, 60],\n    'quantidade': [3, 5, 2, 2, 10, 1, 6],\n}\ndf = pd.DataFrame(dados)\nprint(df)\n#      categoria regiao  valor  quantidade\n# 0  Eletrônicos    Sul   1200           3\n# 1       Roupas    Sul    300           5\n# 2  Eletrônicos  Norte    800           2\n# 3       Roupas  Norte    150           2\n# 4    Alimentos    Sul     90          10\n# 5  Eletrônicos    Sul    500           1\n# 6    Alimentos  Norte     60           6"
                    },
                    {
                        "type": "table",
                        "value": "[[\"categoria\",\"regiao\",\"valor\",\"quantidade\"],[\"Eletrônicos\",\"Sul\",\"1200\",\"3\"],[\"Roupas\",\"Sul\",\"300\",\"5\"],[\"Eletrônicos\",\"Norte\",\"800\",\"2\"],[\"Roupas\",\"Norte\",\"150\",\"2\"],[\"Alimentos\",\"Sul\",\"90\",\"10\"],[\"Eletrônicos\",\"Sul\",\"500\",\"1\"],[\"Alimentos\",\"Norte\",\"60\",\"6\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que o groupby retorna sozinho\n\nSe você chamar só `df.groupby('categoria')`, o pandas não devolve uma tabela pronta. Ele devolve um objeto especial, que já separou as linhas em grupos (o split), mas ainda não aplicou nenhuma função:"
                    },
                    {
                        "type": "code",
                        "value": "grupo = df.groupby('categoria')\nprint(type(grupo))\n# <class 'pandas.core.groupby.generic.DataFrameGroupBy'>\n\n# só vira uma tabela de verdade depois de aplicar uma função\nmedia_valor = df.groupby('categoria')['valor'].mean()\nprint(media_valor)\n# categoria\n# Alimentos       75.000000\n# Eletrônicos    833.333333\n# Roupas         225.000000\n# Name: valor, dtype: float64"
                    },
                    {
                        "type": "table",
                        "value": "[[\"categoria\",\"valor_medio\"],[\"Alimentos\",\"75.0\"],[\"Eletrônicos\",\"833.33\"],[\"Roupas\",\"225.0\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "df.groupby(coluna) sozinho só organiza os grupos. É preciso encadear uma função, como mean() ou sum(), pra transformar isso numa tabela de resultado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual código calcula a média de valor por categoria no DataFrame df?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df.mean('categoria')['valor']",
                                "isCorrect": false
                            },
                            {
                                "text": "df.groupby('categoria')['valor'].mean()",
                                "isCorrect": true
                            },
                            {
                                "text": "df['valor'].groupby().mean('categoria')",
                                "isCorrect": false
                            },
                            {
                                "text": "df.groupby('valor').mean()['categoria']",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que df.groupby('categoria') retorna sozinho, sem nenhuma função de agregação encadeada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um objeto que separa as linhas em grupos, mas sem cálculo aplicado ainda.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um DataFrame novo, já com uma linha por categoria e os totais prontos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma lista de DataFrames menores, um pra cada categoria distinta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro, porque o groupby sempre exige uma função de agregação junto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar media = df.groupby('categoria')['valor'].mean(), qual é o tipo do resultado guardado em media?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um DataFrame com duas colunas, categoria e valor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma Series, indexada pelos valores de categoria.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um dicionário Python, com categoria como chave.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma lista de tuplas, categoria e valor médio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se em vez de df.groupby('categoria')['valor'].mean() você rodar df.groupby('categoria').mean(), sem selecionar a coluna, qual a diferença no resultado, considerando que o DataFrame tem as colunas categoria, regiao, valor e quantidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O resultado traz a média de todas as colunas numéricas, não só de valor.",
                                "isCorrect": true
                            },
                            {
                                "text": "O resultado é idêntico, porque o pandas ignora colunas não numéricas de qualquer jeito.",
                                "isCorrect": false
                            },
                            {
                                "text": "O resultado dá erro, porque é obrigatório escolher uma coluna antes do groupby.",
                                "isCorrect": false
                            },
                            {
                                "text": "O resultado traz só a contagem de linhas de cada categoria, sem calcular média.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando as linhas de quantidade por categoria (Eletrônicos: 3, 2 e 1; Roupas: 5 e 2; Alimentos: 10 e 6), qual o resultado de df.groupby('categoria')['quantidade'].sum()?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Alimentos: 16, Eletrônicos: 6, Roupas: 7",
                                "isCorrect": true
                            },
                            {
                                "text": "Alimentos: 8, Eletrônicos: 2, Roupas: 3",
                                "isCorrect": false
                            },
                            {
                                "text": "Alimentos: 6, Eletrônicos: 16, Roupas: 7",
                                "isCorrect": false
                            },
                            {
                                "text": "Alimentos: 2, Eletrônicos: 3, Roupas: 2",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Agregações (sum, mean, count) e agg",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Aula 3: Agregações (sum, mean, count) e agg\n\nAté agora usamos sum() e mean(). Mas o groupby aceita qualquer função de agregação, entre as mais comuns:\n\n- sum(): soma dos valores do grupo.\n- mean(): média.\n- median(): mediana (lembra da trilha de Estatística: mais resistente a outliers que a média).\n- min() e max(): menor e maior valor.\n- std(): desvio padrão.\n- count(): quantidade de valores não nulos.\n\nTodas seguem o mesmo padrão: df.groupby('coluna_chave')['coluna_valor'].funcao()."
                    },
                    {
                        "type": "code",
                        "value": "print(df.groupby('categoria')['valor'].sum())\n# categoria\n# Alimentos       150\n# Eletrônicos    2500\n# Roupas          450\n# Name: valor, dtype: int64\n\nprint(df.groupby('categoria')['valor'].max())\n# categoria\n# Alimentos       90\n# Eletrônicos    1200\n# Roupas         300\n# Name: valor, dtype: int64"
                    },
                    {
                        "type": "table",
                        "value": "[[\"categoria\",\"soma\",\"media\",\"minimo\",\"maximo\",\"mediana\"],[\"Alimentos\",\"150\",\"75.0\",\"60\",\"90\",\"75.0\"],[\"Eletrônicos\",\"2500\",\"833.33\",\"500\",\"1200\",\"800\"],[\"Roupas\",\"450\",\"225.0\",\"150\",\"300\",\"225.0\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## count x size: cuidado com os nulos\n\ncount() conta só os valores não nulos de cada grupo. size() conta todas as linhas do grupo, nulo ou não. Se a coluna tiver algum NaN, os dois números podem divergir, e essa diferença geralmente é a pista de que tem dado faltando (assunto do próximo módulo).\n\n## Várias agregações de uma vez com agg\n\nEm vez de chamar sum(), mean() e max() em linhas separadas, dá pra pedir tudo de uma vez com agg(). Duas formas: passando uma lista de funções, ou um dicionário ligando cada coluna à função que você quer aplicar nela."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\ndados_com_nulo = {\n    'categoria': ['Eletrônicos', 'Eletrônicos', 'Eletrônicos', 'Roupas', 'Roupas'],\n    'valor': [1200, np.nan, 500, 300, 150],\n}\ndf_nulo = pd.DataFrame(dados_com_nulo)\n\nprint(df_nulo.groupby('categoria')['valor'].count())\n# categoria\n# Eletrônicos    2\n# Roupas         2\n# Name: valor, dtype: int64\n\nprint(df_nulo.groupby('categoria')['valor'].size())\n# categoria\n# Eletrônicos    3\n# Roupas         2\n# dtype: int64"
                    },
                    {
                        "type": "code",
                        "value": "# lista de funções aplicadas na mesma coluna\nresumo = df.groupby('categoria')['valor'].agg(['sum', 'mean', 'min', 'max', 'median'])\nprint(resumo)\n#                sum        mean  min   max  median\n# categoria                                          \n# Alimentos      150   75.000000   60    90    75.0\n# Eletrônicos   2500  833.333333  500  1200   800.0\n# Roupas         450  225.000000  150   300   225.0\n\n# dict: cada coluna com sua própria função\nresumo2 = df.groupby('categoria').agg({'valor': 'sum', 'quantidade': 'mean'})\nprint(resumo2)\n#              valor  quantidade\n# categoria                     \n# Alimentos      150    8.000000\n# Eletrônicos   2500    2.000000\n# Roupas         450    3.500000"
                    },
                    {
                        "type": "quote",
                        "value": "agg() é o canivete suíço do groupby: uma função só, várias estatísticas de uma vez, seja a mesma função em várias colunas ou uma função diferente pra cada coluna."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual método retorna a quantidade de valores não nulos em cada grupo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "size()",
                                "isCorrect": false
                            },
                            {
                                "text": "count()",
                                "isCorrect": true
                            },
                            {
                                "text": "len()",
                                "isCorrect": false
                            },
                            {
                                "text": "sum()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual código calcula, de uma vez só, a soma, a média e o máximo de valor por categoria?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df.groupby('categoria')['valor'].sum().mean().max()",
                                "isCorrect": false
                            },
                            {
                                "text": "df.groupby('categoria')['valor'].agg(['sum', 'mean', 'max'])",
                                "isCorrect": true
                            },
                            {
                                "text": "df.groupby('categoria').agg('valor', ['sum', 'mean', 'max'])",
                                "isCorrect": false
                            },
                            {
                                "text": "df['valor'].groupby('categoria').sum(['mean', 'max'])",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um DataFrame tem uma coluna valor com alguns valores faltantes. Ao rodar df.groupby('categoria')['valor'].count() e df.groupby('categoria')['valor'].size() para o mesmo grupo, os números vêm diferentes. O que isso indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Existem valores nulos na coluna valor, que o count() não conta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Existe um erro no groupby, porque count e size deveriam sempre bater.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grupo tem linhas duplicadas, e o size() está contando elas em dobro.",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna valor mudou de tipo, e isso confunde o count().",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença entre passar uma lista pro agg(), como agg(['sum', 'mean']), e passar um dicionário, como agg({'valor': 'sum', 'quantidade': 'mean'})?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A lista aplica as funções na mesma coluna; o dicionário, uma função por coluna.",
                                "isCorrect": true
                            },
                            {
                                "text": "A lista só aceita números inteiros; o dicionário aceita qualquer tipo de dado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista soma os resultados ao final; o dicionário mantém cada um separado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista exige agrupar por várias colunas; o dicionário funciona só com uma.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No resultado de df.groupby('categoria').agg({'valor': 'sum', 'quantidade': 'mean'}), Alimentos tem valor total 150 e quantidade média 8.0; Eletrônicos tem valor total 2500 e quantidade média 2.0; Roupas tem valor total 450 e quantidade média 3.5. Qual categoria vende, em média, mais itens por venda, apesar de ter o menor valor total?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Alimentos: maior quantidade média, mesmo com o menor valor total.",
                                "isCorrect": true
                            },
                            {
                                "text": "Eletrônicos: maior valor total entre as três categorias.",
                                "isCorrect": false
                            },
                            {
                                "text": "Roupas: fica no meio, tanto em valor total quanto em quantidade média.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma: as três têm a mesma quantidade média por venda.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Agrupar por várias colunas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Aula 4: Agrupar por várias colunas\n\nDá pra agrupar por mais de uma coluna ao mesmo tempo: basta passar uma lista pro groupby(). É o equivalente a perguntar qual o total de vendas por categoria e por região ao mesmo tempo, uma chave composta.\n\nEm Python puro, isso seria agrupar por uma tupla (categoria, regiao) como chave de um dicionário, bem mais verboso:"
                    },
                    {
                        "type": "code",
                        "value": "vendas = [\n    {'categoria': 'Eletrônicos', 'regiao': 'Sul', 'valor': 1200},\n    {'categoria': 'Eletrônicos', 'regiao': 'Sul', 'valor': 500},\n    {'categoria': 'Eletrônicos', 'regiao': 'Norte', 'valor': 800},\n    {'categoria': 'Roupas', 'regiao': 'Sul', 'valor': 300},\n    {'categoria': 'Roupas', 'regiao': 'Norte', 'valor': 150},\n]\n\nsoma_composta = {}\nfor venda in vendas:\n    chave = (venda['categoria'], venda['regiao'])\n    soma_composta[chave] = soma_composta.get(chave, 0) + venda['valor']\n\nprint(soma_composta)\n# {('Eletrônicos', 'Sul'): 1700, ('Eletrônicos', 'Norte'): 800, ('Roupas', 'Sul'): 300, ('Roupas', 'Norte'): 150}"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.DataFrame(vendas)\nresultado = df.groupby(['categoria', 'regiao'])['valor'].sum()\nprint(resultado)\n# categoria    regiao\n# Eletrônicos  Norte     800\n#              Sul      1700\n# Roupas       Norte     150\n#              Sul       300\n# Name: valor, dtype: int64"
                    },
                    {
                        "type": "text",
                        "value": "## MultiIndex: índice composto\n\nRepara que o resultado não tem uma coluna categoria e uma coluna regiao comuns: as duas viraram o índice, um índice composto (MultiIndex), com dois níveis. É a mesma informação da tupla usada como chave no dicionário, só que organizada em níveis.\n\nMultiIndex é útil pra navegar o resultado, mas se você quer voltar a um DataFrame comum, de colunas soltas, use reset_index()."
                    },
                    {
                        "type": "code",
                        "value": "resultado_flat = resultado.reset_index()\nprint(resultado_flat)\n#      categoria regiao  valor\n# 0  Eletrônicos  Norte    800\n# 1  Eletrônicos    Sul   1700\n# 2       Roupas  Norte    150\n# 3       Roupas    Sul    300\n\nprint(type(resultado_flat))\n# <class 'pandas.core.frame.DataFrame'>"
                    },
                    {
                        "type": "table",
                        "value": "[[\"categoria\",\"regiao\",\"valor\"],[\"Eletrônicos\",\"Norte\",\"800\"],[\"Eletrônicos\",\"Sul\",\"1700\"],[\"Roupas\",\"Norte\",\"150\"],[\"Roupas\",\"Sul\",\"300\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Agrupar por várias colunas dá um MultiIndex, um índice em níveis. reset_index() devolve isso pra um DataFrame comum, com cada chave numa coluna solta."
                    }
                ],
                "questions": [
                    {
                        "statement": "Como agrupar por duas colunas ao mesmo tempo com groupby?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df.groupby('categoria', 'regiao')",
                                "isCorrect": false
                            },
                            {
                                "text": "df.groupby(['categoria', 'regiao'])",
                                "isCorrect": true
                            },
                            {
                                "text": "df.groupby('categoria' + 'regiao')",
                                "isCorrect": false
                            },
                            {
                                "text": "df.groupby(('categoria'), ('regiao'))",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como se chama o índice em níveis que aparece quando você agrupa por mais de uma coluna?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "DoubleIndex",
                                "isCorrect": false
                            },
                            {
                                "text": "GroupIndex",
                                "isCorrect": false
                            },
                            {
                                "text": "MultiIndex",
                                "isCorrect": true
                            },
                            {
                                "text": "NestedIndex",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar df.groupby(['categoria', 'regiao'])['valor'].sum(), qual comando devolve um DataFrame comum, com categoria e regiao como colunas soltas em vez de índice?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "to_frame()",
                                "isCorrect": false
                            },
                            {
                                "text": "flatten()",
                                "isCorrect": false
                            },
                            {
                                "text": "reset_index()",
                                "isCorrect": true
                            },
                            {
                                "text": "droplevel()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista agrupou vendas por categoria e região com groupby(['categoria', 'regiao']) e reparou que o total de Eletrônicos ficou dividido em duas linhas do resultado (Norte e Sul), em vez de uma linha só. Por que isso acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a chave de agrupamento é a combinação categoria e região, não só categoria.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o DataFrame original tem duas colunas chamadas Eletrônicos, uma por região.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o groupby por várias colunas sempre duplica as linhas do resultado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque falta usar reset_index() antes de aplicar o sum() no groupby.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A Series resultado tem MultiIndex categoria e regiao, com Eletrônicos/Norte = 800, Eletrônicos/Sul = 1700, Roupas/Norte = 150 e Roupas/Sul = 300. Qual código retorna o total de Eletrônicos na região Sul (1700)?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "resultado.loc[('Eletrônicos', 'Sul')]",
                                "isCorrect": true
                            },
                            {
                                "text": "resultado.loc['Sul', 'Eletrônicos']",
                                "isCorrect": false
                            },
                            {
                                "text": "resultado.iloc[('Eletrônicos', 'Sul')]",
                                "isCorrect": false
                            },
                            {
                                "text": "resultado['Eletrônicos']['Norte']",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "pivot_table e o poder do groupby",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Aula 5: pivot_table e o poder do groupby\n\nSe você já usou tabela dinâmica no Excel ou Google Planilhas, o pivot_table do pandas faz a mesma coisa: pega uma coluna pra virar linha, outra pra virar coluna, e cruza os valores agregados nas células. É outra forma de fazer split-apply-combine, só que o resultado sai num formato de grade, mais fácil de ler quando você tem duas chaves de agrupamento.\n\nVamos acrescentar mais uma linha aos dados, uma venda de Eletrônicos na região Leste, pra deixar o exemplo mais interessante:"
                    },
                    {
                        "type": "code",
                        "value": "vendas = [\n    {'categoria': 'Eletrônicos', 'regiao': 'Sul', 'valor': 1200},\n    {'categoria': 'Roupas', 'regiao': 'Sul', 'valor': 300},\n    {'categoria': 'Eletrônicos', 'regiao': 'Norte', 'valor': 800},\n    {'categoria': 'Roupas', 'regiao': 'Norte', 'valor': 150},\n    {'categoria': 'Alimentos', 'regiao': 'Sul', 'valor': 90},\n    {'categoria': 'Eletrônicos', 'regiao': 'Sul', 'valor': 500},\n    {'categoria': 'Alimentos', 'regiao': 'Norte', 'valor': 60},\n    {'categoria': 'Eletrônicos', 'regiao': 'Leste', 'valor': 400},\n]\n\n# cruzar categoria x regiao na mão, com dict aninhado\ncruzamento = {}\nfor venda in vendas:\n    cat = venda['categoria']\n    reg = venda['regiao']\n    if cat not in cruzamento:\n        cruzamento[cat] = {}\n    cruzamento[cat][reg] = cruzamento[cat].get(reg, 0) + venda['valor']\n\nprint(cruzamento)\n# {'Eletrônicos': {'Sul': 1700, 'Norte': 800, 'Leste': 400}, 'Roupas': {'Sul': 300, 'Norte': 150}, 'Alimentos': {'Sul': 90, 'Norte': 60}}"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.DataFrame(vendas)\ntabela = df.pivot_table(index='categoria', columns='regiao', values='valor', aggfunc='sum')\nprint(tabela)\n# regiao        Leste  Norte     Sul\n# categoria                          \n# Alimentos       NaN   60.0    90.0\n# Eletrônicos   400.0  800.0  1700.0\n# Roupas          NaN  150.0   300.0"
                    },
                    {
                        "type": "table",
                        "value": "[[\"categoria\",\"Leste\",\"Norte\",\"Sul\"],[\"Alimentos\",\"\",\"60\",\"90\"],[\"Eletrônicos\",\"400\",\"800\",\"1700\"],[\"Roupas\",\"\",\"150\",\"300\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Preenchendo os buracos e trocando a função\n\nRepara nos NaN: Roupas e Alimentos não têm nenhuma venda na região Leste, então não existe valor pra cruzar nessa célula. Dois parâmetros ajudam a ajustar isso:\n\n- fill_value=0: troca cada NaN por 0, em vez de deixar em branco.\n- aggfunc: troca a função de agregação (o padrão é mean; dá pra usar sum, count, max, e por aí vai, igual no agg()).\n\nCom groupby, agg e pivot_table, você já cobre a grande maioria dos pedidos de análise agregada do dia a dia. O próximo passo, no Módulo 6, é a etapa que costuma vir antes de qualquer agrupamento valer a pena: limpar os dados."
                    },
                    {
                        "type": "code",
                        "value": "tabela_limpa = df.pivot_table(\n    index='categoria',\n    columns='regiao',\n    values='valor',\n    aggfunc='sum',\n    fill_value=0,\n)\nprint(tabela_limpa)\n# regiao       Leste  Norte   Sul\n# categoria                       \n# Alimentos        0     60    90\n# Eletrônicos     400    800  1700\n# Roupas            0    150   300"
                    },
                    {
                        "type": "quote",
                        "value": "pivot_table cruza duas chaves de agrupamento numa grade só, linhas e colunas. É o mesmo split-apply-combine do groupby, com fill_value resolvendo os buracos que sobram."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual parâmetro do pivot_table define qual coluna vira as colunas do resultado, o cruzamento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "index",
                                "isCorrect": false
                            },
                            {
                                "text": "columns",
                                "isCorrect": true
                            },
                            {
                                "text": "values",
                                "isCorrect": false
                            },
                            {
                                "text": "aggfunc",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual parâmetro do pivot_table troca os valores NaN do resultado por um valor padrão, como 0?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "aggfunc",
                                "isCorrect": false
                            },
                            {
                                "text": "dropna",
                                "isCorrect": false
                            },
                            {
                                "text": "fill_value",
                                "isCorrect": true
                            },
                            {
                                "text": "na_values",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em df.pivot_table(index='categoria', columns='regiao', values='valor', aggfunc='sum'), o que representa cada célula da tabela resultante?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A soma de valor para a combinação daquela categoria com aquela região.",
                                "isCorrect": true
                            },
                            {
                                "text": "A soma de valor para toda a categoria, repetida em todas as colunas de região.",
                                "isCorrect": false
                            },
                            {
                                "text": "A contagem de linhas para aquela combinação, não a soma dos valores.",
                                "isCorrect": false
                            },
                            {
                                "text": "A média de valor entre todas as categorias e regiões combinadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que aparece NaN na célula de Roupas com a região Leste no resultado do pivot_table?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque não existe linha de categoria Roupas com região Leste nos dados originais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o pandas não consegue calcular soma pra categorias com nome composto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque faltou passar o parâmetro aggfunc na chamada do pivot_table.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a região Leste tem algum valor nulo nos dados originais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Fazer df.groupby(['categoria', 'regiao'])['valor'].sum() seguido de reset_index(), e fazer df.pivot_table(index='categoria', columns='regiao', values='valor', aggfunc='sum'), partem dos mesmos dados e da mesma soma. Qual a principal diferença entre os dois resultados finais?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O groupby entrega uma linha por combinação; o pivot_table espalha as regiões em colunas.",
                                "isCorrect": true
                            },
                            {
                                "text": "O groupby soma os valores; o pivot_table só consegue calcular a média deles.",
                                "isCorrect": false
                            },
                            {
                                "text": "O groupby exige informar aggfunc; o pivot_table calcula soma automaticamente sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "O groupby ignora categorias sem venda em alguma região; o pivot_table sempre remove essas linhas.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Limpeza e preparação de dados",
        "aulas": [
            {
                "titulo": "Valores faltantes (isna, dropna, fillna)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 6 - Limpeza e preparação de dados\n\nSe você já ouviu que um cientista de dados passa **80% do tempo limpando dados** e só 20% analisando, não é exagero. Dado do mundo real vem faltando, com tipo errado, duplicado e com texto bagunçado. Esse módulo é sobre deixar os dados prontos pra valer, antes de qualquer `groupby` ou gráfico.\n\n## Valores faltantes: o NaN\n\nQuando um valor não existe numa célula do DataFrame, o pandas representa isso como `NaN` (*Not a Number*), um marcador especial de dado ausente. Vem de gente que não respondeu uma pergunta de formulário, de um sensor que falhou, de uma coluna que só existe pra algumas linhas."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport numpy as np\n\ndados = {\n    \"aluno\": [\"Ana\", \"Bruno\", \"Carla\", \"Diego\", \"Elisa\"],\n    \"nota\": [8.5, np.nan, 7.0, np.nan, 9.2],\n    \"faltas\": [2, 5, np.nan, 1, 0]\n}\ndf = pd.DataFrame(dados)\nprint(df)\n#    aluno  nota  faltas\n# 0    Ana   8.5     2.0\n# 1  Bruno   NaN     5.0\n# 2  Carla   7.0     NaN\n# 3  Diego   NaN     1.0\n# 4  Elisa   9.2     0.0\n\nprint(df.isna())\n#    aluno   nota  faltas\n# 0  False  False   False\n# 1  False   True   False\n# 2  False  False    True\n# 3  False   True   False\n# 4  False  False   False"
                    },
                    {
                        "type": "table",
                        "value": "[[\"aluno\", \"nota\", \"faltas\"], [\"Ana\", \"8.5\", \"2\"], [\"Bruno\", \"NaN\", \"5\"], [\"Carla\", \"7.0\", \"NaN\"], [\"Diego\", \"NaN\", \"1\"], [\"Elisa\", \"9.2\", \"0\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# quantos faltantes tem em cada coluna\nprint(df.isna().sum())\n# aluno     0\n# nota      2\n# faltas    1\n# dtype: int64\n\n# e no total\nprint(df.isna().sum().sum())\n# 3"
                    },
                    {
                        "type": "text",
                        "value": "## Remover ou preencher?\n\nDuas estratégias bem diferentes pra lidar com o que já foi detectado:\n\n- **`dropna()`**: remove toda linha que tem pelo menos um `NaN`. Rápido, mas arriscado: numa tabela pequena, cada linha removida é dado perdido de verdade. Faz sentido quando os faltantes são raros e sobra amostra, ou quando a coluna com falta é essencial (sem ela, a linha não serve pra nada).\n- **`fillna()`**: preenche o buraco em vez de descartar a linha inteira. Prefira quando quer manter o tamanho da amostra.\n\nUm guia rápido pra escolher o preenchimento:\n- Falta que significa \"não aconteceu\" (uma contagem, por exemplo) -> `fillna(0)`.\n- Falta numérica contínua, sem outlier forte -> `fillna(media)`.\n- Falta numérica com outlier (lembra da trilha de Estatística?) -> `fillna(mediana)`, mais robusta a valor extremo.\n- Dado em sequência, tipo série temporal -> `fillna(method=\"ffill\")`, repete o último valor válido."
                    },
                    {
                        "type": "code",
                        "value": "# dropna: remove qualquer linha com NaN\nprint(df.dropna())\n#   aluno  nota  faltas\n# 0   Ana   8.5     2.0\n# 4 Elisa   9.2     0.0\n# perdemos 3 das 5 linhas so por causa de 3 celulas vazias\n\n# fillna: preenche em vez de descartar\nprint(df[\"nota\"].fillna(df[\"nota\"].mean()))\n# 0    8.500000\n# 1    8.233333\n# 2    7.000000\n# 3    8.233333\n# 4    9.200000\n# Name: nota, dtype: float64\n\nprint(df[\"faltas\"].fillna(df[\"faltas\"].median()))\n# 0    2.0\n# 1    5.0\n# 2    1.5\n# 3    1.0\n# 4    0.0\n# Name: faltas, dtype: float64\n\nprint(df.fillna(0))\n#    aluno  nota  faltas\n# 0    Ana   8.5     2.0\n# 1  Bruno   0.0     5.0\n# 2  Carla   7.0     0.0\n# 3  Diego   0.0     1.0\n# 4  Elisa   9.2     0.0"
                    },
                    {
                        "type": "quote",
                        "value": "dropna() é rápido, mas cada linha removida é dado perdido: antes de usar, pergunte se sobra amostra suficiente. fillna() troca completude por uma aproximação, e a escolha entre 0, média, mediana ou o valor anterior depende do que a falta significa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Com df[\"nota\"] igual a [8.5, NaN, 7.0, NaN, 9.2], o que df[\"nota\"].isna().sum() retorna?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "2",
                                "isCorrect": true
                            },
                            {
                                "text": "3",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            },
                            {
                                "text": "5",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual método detecta valores faltantes num DataFrame, sem remover nem preencher nada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df.isna()",
                                "isCorrect": true
                            },
                            {
                                "text": "df.dropna()",
                                "isCorrect": false
                            },
                            {
                                "text": "df.fillna()",
                                "isCorrect": false
                            },
                            {
                                "text": "df.duplicated()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa tabela de 1000 linhas, a coluna \"renda\" tem 950 valores faltantes (95%). Qual encaminhamento faz mais sentido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Considerar descartar a coluna, já que quase não sobrou informação real ali",
                                "isCorrect": true
                            },
                            {
                                "text": "Preencher os 950 faltantes com a média dos 50 valores que sobraram",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar dropna() no DataFrame inteiro, removendo as 950 linhas sem renda",
                                "isCorrect": false
                            },
                            {
                                "text": "Preencher os 950 faltantes com 0, tratando a ausência como renda zero",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma série de temperaturas diárias tem um NaN no meio. Qual comando preenche esse buraco repetindo a última temperatura válida anterior?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "df[\"temp\"].fillna(method=\"ffill\")",
                                "isCorrect": true
                            },
                            {
                                "text": "df[\"temp\"].fillna(df[\"temp\"].mean())",
                                "isCorrect": false
                            },
                            {
                                "text": "df[\"temp\"].dropna()",
                                "isCorrect": false
                            },
                            {
                                "text": "df[\"temp\"].fillna(0)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que exatamente df.dropna(subset=[\"nota\"]) remove?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Linhas onde a coluna \"nota\" está com valor faltante",
                                "isCorrect": true
                            },
                            {
                                "text": "A coluna \"nota\" inteira, junto com todos os seus valores",
                                "isCorrect": false
                            },
                            {
                                "text": "Linhas onde qualquer coluna do DataFrame está faltante",
                                "isCorrect": false
                            },
                            {
                                "text": "Os valores faltantes da coluna \"nota\", trocando por zero",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Corrigindo tipos (astype, to_numeric, to_datetime)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Tipos errados: quando o número vira texto\n\nÉ clássico: você carrega dados e uma coluna que deveria ser numérica (preço, quantidade, idade) chega como texto. Acontece por formatação na origem, símbolo junto do número, ou uma célula com algo como `\"indisponivel\"` no meio de uma coluna de preços. O pandas não reclama na hora, mas guarda a coluna inteira como `object` (texto), e isso quebra conta.\n\nPor que importa: soma, média, comparação e ordenação em cima de texto não fazem o que você espera. `\"12.50\"` mais `\"8.90\"` não vira `21.40`, vira a concatenação `\"12.508.90\"`."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndados = {\n    \"produto\": [\"Caneta\", \"Caderno\", \"Mochila\", \"Lapis\"],\n    \"preco\": [\"12.50\", \"8.90\", \"150.00\", \"indisponivel\"],\n    \"estoque\": [\"34\", \"120\", \"8\", \"0\"],\n    \"data_venda\": [\"2024-01-10\", \"2024-01-11\", \"2024-01-12\", \"2024-01-13\"]\n}\ndf = pd.DataFrame(dados)\nprint(df.dtypes)\n# produto       object\n# preco         object\n# estoque       object\n# data_venda    object\n# dtype: object"
                    },
                    {
                        "type": "table",
                        "value": "[[\"produto\", \"preco\", \"estoque\", \"data_venda\"], [\"Caneta\", \"12.50\", \"34\", \"2024-01-10\"], [\"Caderno\", \"8.90\", \"120\", \"2024-01-11\"], [\"Mochila\", \"150.00\", \"8\", \"2024-01-12\"], [\"Lapis\", \"indisponivel\", \"0\", \"2024-01-13\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# tudo veio como object (texto), mesmo parecendo numero\nprint(df[\"preco\"].sum())\n# 12.508.90150.00indisponivel\n# nao e soma, e concatenacao de string: prova de que o tipo esta errado"
                    },
                    {
                        "type": "text",
                        "value": "## astype, to_numeric e to_datetime\n\nTrês ferramentas pra corrigir tipo, cada uma pro seu cenário:\n\n- **`astype(tipo)`**: converte direto, funciona quando TODOS os valores da coluna são convertíveis sem exceção. Se tiver um valor ruim no meio (tipo `\"indisponivel\"` numa coluna de preço), `astype(float)` quebra com erro.\n- **`pd.to_numeric(coluna, errors=\"coerce\")`**: converte pra número e, quando encontra algo que não dá pra converter, vira `NaN` em vez de travar o processo inteiro. Depois é só tratar esse `NaN` com o que você viu na aula passada (`dropna` ou `fillna`).\n- **`pd.to_datetime(coluna)`**: converte texto de data pro tipo `datetime64`, o que libera operação de data de verdade (filtrar por período, extrair mês ou ano com `.dt`, calcular diferença de dias)."
                    },
                    {
                        "type": "code",
                        "value": "# estoque: todos os valores sao numeros validos, astype direto resolve\ndf[\"estoque\"] = df[\"estoque\"].astype(int)\nprint(df[\"estoque\"])\n# 0     34\n# 1    120\n# 2      8\n# 3      0\n# Name: estoque, dtype: int64\n\n# preco: tem um valor invalido (\"indisponivel\"), astype quebraria\n# df[\"preco\"].astype(float)\n# -> ValueError: could not convert string to float: 'indisponivel'\ndf[\"preco\"] = pd.to_numeric(df[\"preco\"], errors=\"coerce\")\nprint(df[\"preco\"])\n# 0     12.5\n# 1      8.9\n# 2    150.0\n# 3      NaN\n# Name: preco, dtype: float64\n\ndf[\"data_venda\"] = pd.to_datetime(df[\"data_venda\"])\n\nprint(df.dtypes)\n# produto               object\n# preco                float64\n# estoque                int64\n# data_venda    datetime64[ns]\n# dtype: object\n\nprint(df[\"preco\"].sum())\n# 171.4\n# agora sim: soma numerica de verdade (NaN e ignorado por padrao)"
                    },
                    {
                        "type": "quote",
                        "value": "Coluna com tipo errado não avisa que tem problema, ela só calcula errado (ou concatena em vez de somar). astype converte direto quando os dados já estão limpos; to_numeric e to_datetime com errors=\"coerce\" convertem o que dá e marcam o resto como NaN, sem derrubar o processo inteiro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma coluna \"idade\" foi carregada e ficou com dtype object, mesmo os valores parecendo números inteiros válidos em todas as linhas. Qual comando converte pra número?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df[\"idade\"].astype(int)",
                                "isCorrect": true
                            },
                            {
                                "text": "df[\"idade\"].dropna()",
                                "isCorrect": false
                            },
                            {
                                "text": "df[\"idade\"].duplicated()",
                                "isCorrect": false
                            },
                            {
                                "text": "df[\"idade\"].str.strip()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que pd.to_datetime(df[\"data\"]) faz com essa coluna?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Converte uma coluna de texto pro tipo datetime64",
                                "isCorrect": true
                            },
                            {
                                "text": "Remove valores duplicados de uma coluna de datas",
                                "isCorrect": false
                            },
                            {
                                "text": "Formata a data pra exibição num gráfico de linha",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcula a diferença em dias entre duas colunas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma coluna \"preco\" tem o valor \"indisponivel\" misturado com números escritos como texto. Ao rodar df[\"preco\"].astype(float), o que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Levanta um ValueError, porque 'indisponivel' não vira float",
                                "isCorrect": true
                            },
                            {
                                "text": "Converte 'indisponivel' automaticamente pro valor NaN",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignora a linha com 'indisponivel' e converte o resto normalmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Transforma a coluna inteira pro tipo datetime64 direto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença entre astype(float) e pd.to_numeric(coluna, errors=\"coerce\") numa coluna com um valor de texto inválido misturado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "astype quebra com erro; to_numeric com coerce vira NaN",
                                "isCorrect": true
                            },
                            {
                                "text": "astype e to_numeric sempre dão exatamente o mesmo resultado",
                                "isCorrect": false
                            },
                            {
                                "text": "astype vira NaN; to_numeric sempre quebra com erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos dois lida com texto misturado na coluna",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar df[\"preco\"] = pd.to_numeric(df[\"preco\"], errors=\"coerce\") numa coluna que tinha um valor \"indisponivel\", o que aconteceu com essa linha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O valor virou NaN, mas a linha continua no DataFrame",
                                "isCorrect": true
                            },
                            {
                                "text": "A linha inteira foi removida automaticamente do DataFrame",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor virou 0, representando preço indisponível",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando levantou um erro e interrompeu a execução",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Duplicatas (drop_duplicates)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Duplicatas: quando a mesma linha aparece mais de uma vez\n\nDuplicata é linha repetida na tabela. Acontece por carregar o mesmo arquivo duas vezes, por um merge que multiplica linha sem querer (a próxima trilha, SQL, tem nome pra isso), ou por um formulário enviado em dobro. O pandas detecta com `duplicated()`: devolve `True` pra cada linha que já apareceu igualzinha antes."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndados = {\n    \"pedido_id\": [101, 102, 103, 103, 104],\n    \"cliente\": [\"Ana\", \"Bruno\", \"Carla\", \"Carla\", \"Diego\"],\n    \"produto\": [\"Mouse\", \"Teclado\", \"Monitor\", \"Monitor\", \"Mouse\"],\n    \"valor\": [50.0, 120.0, 800.0, 800.0, 50.0]\n}\ndf = pd.DataFrame(dados)\nprint(df.duplicated())\n# 0    False\n# 1    False\n# 2    False\n# 3     True\n# 4    False\n# dtype: bool"
                    },
                    {
                        "type": "table",
                        "value": "[[\"pedido_id\", \"cliente\", \"produto\", \"valor\"], [\"101\", \"Ana\", \"Mouse\", \"50.0\"], [\"102\", \"Bruno\", \"Teclado\", \"120.0\"], [\"103\", \"Carla\", \"Monitor\", \"800.0\"], [\"103\", \"Carla\", \"Monitor\", \"800.0\"], [\"104\", \"Diego\", \"Mouse\", \"50.0\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# remove a linha 3, que repete a linha 2 em todas as colunas\nprint(df.drop_duplicates())\n#    pedido_id cliente  produto  valor\n# 0        101     Ana    Mouse   50.0\n# 1        102   Bruno  Teclado  120.0\n# 2        103   Carla  Monitor  800.0\n# 4        104   Diego    Mouse   50.0\n\n# cuidado com subset: linha 0 e linha 4 tem produto e valor iguais,\n# mas sao pedidos diferentes (pedido_id e cliente diferentes)\nprint(df.drop_duplicates(subset=[\"produto\", \"valor\"]))\n#    pedido_id cliente  produto  valor\n# 0        101     Ana    Mouse   50.0\n# 1        102   Bruno  Teclado  120.0\n# 2        103   Carla  Monitor  800.0\n# a linha 4 (pedido 104, Diego) sumiu: nao era duplicata de verdade,\n# so coincidiu produto e valor com a linha 0"
                    },
                    {
                        "type": "text",
                        "value": "## keep, e quando uma duplicata é erro de verdade\n\n`drop_duplicates()` tem um parâmetro `keep` pra decidir qual cópia sobrevive:\n\n- `keep=\"first\"` (padrão): mantém a primeira ocorrência, descarta as próximas.\n- `keep=\"last\"`: mantém a última ocorrência.\n- `keep=False`: descarta TODAS as cópias, inclusive a primeira. Útil quando a duplicata é sinal de que algo deu errado e você prefere não confiar em nenhuma das linhas envolvidas.\n\nAntes de sair chamando `drop_duplicates()`, vale confirmar se a repetição é erro mesmo. `pedido_id` repetido igualzinho (linha 2 e 3 do exemplo) é forte sinal de duplicata real, provavelmente um import em dobro, porque pedido é único por natureza. Já produto e valor iguais entre pedidos diferentes é só coincidência: dois clientes compraram o mesmo mouse pelo mesmo preço, sem overlap nenhum de tabela. Uma coluna que funciona como identificador único (id, CPF, chave de pedido) é a referência mais confiável pra decidir."
                    },
                    {
                        "type": "code",
                        "value": "# keep=False descarta as duas copias do pedido 103, sem manter nenhuma\nprint(df.drop_duplicates(keep=False))\n#    pedido_id cliente  produto  valor\n# 0        101     Ana    Mouse   50.0\n# 1        102   Bruno  Teclado  120.0\n# 4        104   Diego    Mouse   50.0"
                    },
                    {
                        "type": "quote",
                        "value": "duplicated() e drop_duplicates() olham pra linha inteira por padrão: um subset mal escolhido transforma coincidência em falso positivo. A pergunta antes de remover não é só \"essas linhas são iguais\", é \"existe uma chave única que confirma que é o mesmo registro repetido\"."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que df.duplicated() devolve?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma Series booleana marcando com True as linhas repetidas",
                                "isCorrect": true
                            },
                            {
                                "text": "Um DataFrame só com as linhas duplicadas já removidas",
                                "isCorrect": false
                            },
                            {
                                "text": "A contagem total de linhas duplicadas na tabela inteira",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma lista com os índices das colunas que estão duplicadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando remove as linhas duplicadas de um DataFrame?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df.drop_duplicates()",
                                "isCorrect": true
                            },
                            {
                                "text": "df.dropna()",
                                "isCorrect": false
                            },
                            {
                                "text": "df.drop(columns=[\"duplicada\"])",
                                "isCorrect": false
                            },
                            {
                                "text": "df.duplicated()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No DataFrame de pedidos desta aula, o que drop_duplicates(subset=[\"produto\", \"valor\"]) faz de diferente do drop_duplicates() sem subset?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Considera só produto e valor, podendo remover pedidos diferentes",
                                "isCorrect": true
                            },
                            {
                                "text": "Ignora completamente as colunas produto e valor na comparação",
                                "isCorrect": false
                            },
                            {
                                "text": "Remove só as linhas onde pedido_id também está repetido",
                                "isCorrect": false
                            },
                            {
                                "text": "Produz exatamente o mesmo resultado do drop_duplicates() sem subset",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença entre keep=\"first\" e keep=False em drop_duplicates()?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "first mantém uma cópia de cada grupo; False descarta todas",
                                "isCorrect": true
                            },
                            {
                                "text": "first descarta todas as cópias; False mantém a última ocorrência",
                                "isCorrect": false
                            },
                            {
                                "text": "first e False sempre produzem exatamente o mesmo resultado",
                                "isCorrect": false
                            },
                            {
                                "text": "False remove só a última ocorrência, mantendo as demais cópias",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num DataFrame com uma única coluna e os valores [A, B, A, A], o que df.duplicated().sum() retorna?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "2",
                                "isCorrect": true
                            },
                            {
                                "text": "3",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Limpando texto com .str",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Texto bagunçado: o mesmo dado, escrito de formas diferentes\n\nColuna de texto suja de um jeito diferente das outras: não é valor faltando nem tipo errado, é a mesma informação escrita de formas diferentes. `\"SP\"`, `\" sp \"` e `\"São Paulo\"` deveriam ser a mesma categoria, mas pro pandas são três strings diferentes, o que estraga qualquer `value_counts()` ou `groupby()` feito em cima dessa coluna. Pra resolver isso, o pandas tem o acessor `.str`, que aplica método de string (os mesmos que você usa em texto puro do Python) na coluna inteira de uma vez, linha por linha."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndados = {\n    \"cliente\": [\"Ana\", \"Bruno\", \"Carla\", \"Diego\", \"Elisa\", \"Fabio\"],\n    \"estado\": [\"SP\", \" sp \", \"São Paulo\", \"RJ \", \"rio de janeiro\", \"MG\"]\n}\ndf = pd.DataFrame(dados)\nprint(df[\"estado\"].value_counts())\n# estado\n# SP                1\n#  sp               1\n# São Paulo         1\n# RJ                1\n# rio de janeiro    1\n# MG                1\n# Name: count, dtype: int64\n# 6 categorias \"diferentes\", mas na verdade sao so 3 estados"
                    },
                    {
                        "type": "table",
                        "value": "[[\"cliente\", \"estado\"], [\"Ana\", \"SP\"], [\"Bruno\", \" sp \"], [\"Carla\", \"São Paulo\"], [\"Diego\", \"RJ \"], [\"Elisa\", \"rio de janeiro\"], [\"Fabio\", \"MG\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Os métodos do .str\n\n- **`.str.strip()`**: remove espaço em branco do início e do fim (não mexe no meio da string).\n- **`.str.lower()`** e **`.str.upper()`**: padronizam maiúscula e minúscula.\n- **`.str.replace(de, para)`**: troca um trecho (ou a string inteira) por outro.\n- **`.str.contains(texto)`**: devolve `True`/`False` pra cada linha, indicando se ela contém aquele texto, útil pra filtrar.\n\nEncadeando esses métodos, dá pra transformar as variações bagunçadas de \"estado\" numa categoria única."
                    },
                    {
                        "type": "code",
                        "value": "df[\"estado_limpo\"] = (\n    df[\"estado\"]\n    .str.strip()\n    .str.lower()\n    .str.replace(\"são paulo\", \"sp\")\n    .str.replace(\"rio de janeiro\", \"rj\")\n    .str.upper()\n)\nprint(df[[\"estado\", \"estado_limpo\"]])\n#            estado estado_limpo\n# 0              SP           SP\n# 1             sp            SP\n# 2       São Paulo           SP\n# 3             RJ            RJ\n# 4  rio de janeiro           RJ\n# 5              MG           MG\n\nprint(df[\"estado_limpo\"].value_counts())\n# estado_limpo\n# SP    3\n# RJ    2\n# MG    1\n# Name: count, dtype: int64\n\n# contains ajuda a filtrar por um pedaco do texto original\nprint(df[df[\"estado\"].str.lower().str.contains(\"paulo\")])\n#   cliente     estado estado_limpo\n# 2   Carla  São Paulo           SP"
                    },
                    {
                        "type": "table",
                        "value": "[[\"cliente\", \"estado (bruto)\", \"estado_limpo\"], [\"Ana\", \"SP\", \"SP\"], [\"Bruno\", \" sp \", \"SP\"], [\"Carla\", \"São Paulo\", \"SP\"], [\"Diego\", \"RJ \", \"RJ\"], [\"Elisa\", \"rio de janeiro\", \"RJ\"], [\"Fabio\", \"MG\", \"MG\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Categoria bagunçada não dá erro, dá silêncio: o groupby roda, o value_counts roda, só que o resultado mente sobre quantas categorias realmente existem. .str.strip() e .str.lower() antes de qualquer agrupamento evitam que espaço ou maiúscula dupliquem uma categoria que era pra ser uma só."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual método do acessor .str remove espaços em branco do início e do fim de uma string?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": ".str.strip()",
                                "isCorrect": true
                            },
                            {
                                "text": ".str.lower()",
                                "isCorrect": false
                            },
                            {
                                "text": ".str.contains()",
                                "isCorrect": false
                            },
                            {
                                "text": ".str.replace()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "df[\"cidade\"].str.lower() faz o que com a coluna \"cidade\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Converte todo o texto da coluna pra minúsculas",
                                "isCorrect": true
                            },
                            {
                                "text": "Remove os valores duplicados da coluna inteira",
                                "isCorrect": false
                            },
                            {
                                "text": "Converte todo o texto da coluna pra maiúsculas",
                                "isCorrect": false
                            },
                            {
                                "text": "Remove os espaços em branco da coluna toda",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sem nenhuma limpeza, com os valores \"SP\", \" sp \" e \"São Paulo\" numa coluna, quantas categorias distintas o value_counts() enxerga?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "3, porque cada string tem uma formatação diferente pro pandas",
                                "isCorrect": true
                            },
                            {
                                "text": "1, porque o pandas ignora espaço e maiúscula automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "2, porque o pandas junta maiúscula com minúscula sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "0, porque o pandas não consegue contar valor de texto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual código filtra as linhas em que a coluna \"estado\" contém o texto \"paulo\", ignorando maiúscula e minúscula?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "df[df[\"estado\"].str.lower().str.contains(\"paulo\")]",
                                "isCorrect": true
                            },
                            {
                                "text": "df[df[\"estado\"].str.strip().str.contains(\"paulo\")]",
                                "isCorrect": false
                            },
                            {
                                "text": "df[df[\"estado\"].str.upper().str.contains(\"paulo\")]",
                                "isCorrect": false
                            },
                            {
                                "text": "df[df[\"estado\"].str.lower().str.contains(\"PAULO\")]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar df[\"estado\"].str.lower().str.replace(\"rio de janeiro\", \"rj\"), o valor original \"RJ \" (com espaço no final) vira o quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "\"rj \", com o espaço em branco no final ainda presente",
                                "isCorrect": true
                            },
                            {
                                "text": "\"rj\", sem espaço, porque lower() também remove espaço",
                                "isCorrect": false
                            },
                            {
                                "text": "\"RJ\", porque replace não achou correspondência e manteve",
                                "isCorrect": false
                            },
                            {
                                "text": "\"rio de janeiro\", porque replace trocou na direção errada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Outliers e dados prontos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Outliers: o que a trilha de Estatística já te preparou pra ver\n\nLembra de outlier lá da trilha de Estatística? É o valor muito fora do padrão do resto dos dados, seja por um evento real e raro, seja por erro de digitação (um zero a mais, um separador decimal errado). As duas formas de detectar que você já viu, o **IQR** (intervalo interquartil) e o **z-score**, funcionam exatamente igual aqui, só que agora é o pandas calculando em vez de você fazer na mão.\n\n- **IQR**: `IQR = Q3 - Q1`. Valor abaixo de `Q1 - 1.5 * IQR` ou acima de `Q3 + 1.5 * IQR` é candidato a outlier.\n- **z-score**: `z = (x - média) / desvio padrão`. Quanto maior o `|z|`, mais longe da média o valor está, um corte comum é `|z| > 3`."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndados = {\n    \"funcionario\": [\"Ana\", \"Bruno\", \"Carla\", \"Diego\", \"Elisa\", \"Fabio\", \"Gustavo\"],\n    \"salario\": [3200, 3400, 3100, 3600, 3300, 3500, 28000]\n}\ndf = pd.DataFrame(dados)\nprint(df[\"salario\"].describe())\n# count        7.000000\n# mean      6871.428571\n# std       9318.389397\n# min       3100.000000\n# 25%       3250.000000\n# 50%       3400.000000\n# 75%       3550.000000\n# max      28000.000000\n# Name: salario, dtype: float64\n# o max (28000) esta muito longe do resto: bom candidato a outlier"
                    },
                    {
                        "type": "table",
                        "value": "[[\"funcionario\", \"salario\"], [\"Ana\", \"3200\"], [\"Bruno\", \"3400\"], [\"Carla\", \"3100\"], [\"Diego\", \"3600\"], [\"Elisa\", \"3300\"], [\"Fabio\", \"3500\"], [\"Gustavo\", \"28000\"]]"
                    },
                    {
                        "type": "code",
                        "value": "q1 = df[\"salario\"].quantile(0.25)\nq3 = df[\"salario\"].quantile(0.75)\niqr = q3 - q1\nprint(q1, q3, iqr)\n# 3250.0 3550.0 300.0\n\nlimite_inferior = q1 - 1.5 * iqr\nlimite_superior = q3 + 1.5 * iqr\nprint(limite_inferior, limite_superior)\n# 2800.0 4000.0\n\nprint(df[(df[\"salario\"] < limite_inferior) | (df[\"salario\"] > limite_superior)])\n#   funcionario  salario\n# 6     Gustavo    28000"
                    },
                    {
                        "type": "text",
                        "value": "## z-score, e um cuidado com amostra pequena\n\nO z-score usa média e desvio padrão, e é justamente aí que mora um cuidado: um outlier bem extremo puxa a própria média e o próprio desvio padrão pra cima, o que pode disfarçar o quão longe ele está em termos de z-score. Em amostra pequena, com um outlier bem forte, o corte clássico `|z| > 3` pode não pegar o valor que o IQR já pegou (o código a seguir mostra isso acontecendo de verdade). É um motivo a mais pra preferir o IQR quando a amostra é pequena ou o outlier é muito extremo: quartil não se deixa puxar pelo valor absurdo do jeito que média e desvio se deixam.\n\nDepois de detectar, a decisão é: **remover** a linha (quando o valor claramente é erro e não tem conserto, tipo um zero a mais de digitação) ou **limitar** com `clip()` (troca o valor pelo limite mais próximo, mantendo a linha na tabela em vez de descartar o registro inteiro da análise)."
                    },
                    {
                        "type": "code",
                        "value": "media = df[\"salario\"].mean()\ndesvio = df[\"salario\"].std()\ndf[\"z_score\"] = (df[\"salario\"] - media) / desvio\nprint(df)\n#   funcionario  salario   z_score\n# 0         Ana     3200 -0.393998\n# 1       Bruno     3400 -0.372535\n# 2       Carla     3100 -0.404730\n# 3       Diego     3600 -0.351072\n# 4       Elisa     3300 -0.383267\n# 5       Fabio     3500 -0.361804\n# 6     Gustavo    28000  2.267406\n\nprint(df[df[\"z_score\"].abs() > 3])\n# Empty DataFrame\n# Columns: [funcionario, salario, z_score]\n# Index: []\n# com |z| > 3 o Gustavo passa batido, porque o proprio salario dele\n# inflou a media e o desvio padrao da amostra inteira\n\nprint(df[df[\"z_score\"].abs() > 2])\n#   funcionario  salario   z_score\n# 6     Gustavo    28000  2.267406\n\n# tratar: limitar em vez de descartar a linha inteira\ndf[\"salario_ajustado\"] = df[\"salario\"].clip(lower=limite_inferior, upper=limite_superior)\nprint(df[[\"funcionario\", \"salario\", \"salario_ajustado\"]])\n#   funcionario  salario  salario_ajustado\n# 0         Ana     3200              3200\n# 1       Bruno     3400              3400\n# 2       Carla     3100              3100\n# 3       Diego     3600              3600\n# 4       Elisa     3300              3300\n# 5       Fabio     3500              3500\n# 6     Gustavo    28000              4000"
                    },
                    {
                        "type": "quote",
                        "value": "IQR usa quartil, que não se abala com um valor absurdo isolado; z-score usa média e desvio, que se deixam puxar pelo próprio outlier, e isso pode custar sensibilidade bem na amostra pequena onde você mais precisa dela. Detectar é a parte fácil: decidir remover, limitar ou manter o valor é a parte que exige entender de onde veio o dado, e é aí que a limpeza termina e a análise de verdade começa."
                    }
                ],
                "questions": [
                    {
                        "statement": "No método IQR, qual a fórmula do intervalo interquartil?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "IQR = Q3 - Q1",
                                "isCorrect": true
                            },
                            {
                                "text": "IQR = Q3 + Q1",
                                "isCorrect": false
                            },
                            {
                                "text": "IQR = média - desvio padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "IQR = máximo - mínimo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que df[\"salario\"].clip(lower=2800, upper=4000) faz com um valor de 28000 nessa coluna?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Substitui o valor por 4000, o limite superior definido",
                                "isCorrect": true
                            },
                            {
                                "text": "Remove a linha inteira que contém esse valor",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui o valor por NaN, marcando como faltante",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui o valor pela média da coluna inteira",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Usando o corte |z-score| > 3 no exemplo desta aula, o que acontece com o salário de Gustavo (28000), o mesmo valor que o IQR já sinalizou?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não é sinalizado, pois seu valor infla média e desvio padrão",
                                "isCorrect": true
                            },
                            {
                                "text": "É sinalizado como outlier, com z-score acima de 3",
                                "isCorrect": false
                            },
                            {
                                "text": "É removido automaticamente antes do cálculo do z-score",
                                "isCorrect": false
                            },
                            {
                                "text": "O cálculo de z-score não funciona quando há outlier na coluna",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença prática entre remover um outlier e usar clip() pra limitá-lo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Remover apaga a linha inteira; clip() mantém a linha e ajusta o valor",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover e clip() sempre produzem exatamente o mesmo DataFrame",
                                "isCorrect": false
                            },
                            {
                                "text": "clip() apaga a linha inteira; remover apenas ajusta o valor extremo",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover ajusta o valor pro limite; clip() apaga a coluna inteira",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o IQR costuma ser mais indicado que o z-score pra detectar outlier numa amostra pequena com um valor muito extremo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Quartil não é afetado pelo extremo, enquanto média e desvio são puxados",
                                "isCorrect": true
                            },
                            {
                                "text": "O IQR sempre gera um resultado numericamente maior que o z-score",
                                "isCorrect": false
                            },
                            {
                                "text": "O z-score só funciona em colunas de texto, não em colunas numéricas",
                                "isCorrect": false
                            },
                            {
                                "text": "O IQR remove o outlier automaticamente, sem precisar definir limite",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Juntar dados e o próximo passo",
        "aulas": [
            {
                "titulo": "Por que juntar tabelas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 7 - Juntar dados e o próximo passo\n\nAté aqui, você tratou cada tabela (cada `DataFrame`) como um mundo isolado: carregou um CSV, limpou, filtrou, agrupou. Mas dado de verdade quase nunca mora numa tabela só.\n\nUm sistema de vendas, por exemplo, guarda os **clientes** numa tabela e os **pedidos** em outra. Se toda vez que alguém fizesse um pedido o sistema copiasse nome e cidade do cliente de novo dentro da tabela de pedidos, você teria a mesma informação repetida em centenas de linhas, e se o cliente mudasse de cidade, precisaria corrigir em todo lugar. Por isso os dados ficam espalhados em tabelas menores, cada uma com uma responsabilidade, ligadas por uma coluna em comum: a **chave**."
                    },
                    {
                        "type": "table",
                        "value": "[[\"cliente_id\", \"nome\", \"cidade\"], [\"1\", \"Ana\", \"São Paulo\"], [\"2\", \"Bruno\", \"Rio de Janeiro\"], [\"3\", \"Carla\", \"Belo Horizonte\"], [\"4\", \"Diego\", \"Salvador\"]]"
                    },
                    {
                        "type": "table",
                        "value": "[[\"pedido_id\", \"cliente_id\", \"produto\", \"valor\"], [\"101\", \"1\", \"Notebook\", \"3500\"], [\"102\", \"2\", \"Mouse\", \"80\"], [\"103\", \"1\", \"Teclado\", \"250\"], [\"104\", \"5\", \"Monitor\", \"900\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A chave que liga as tabelas\n\nRepare na coluna `cliente_id`: ela aparece nas duas tabelas e é o elo entre elas. Em cada linha de `pedidos`, `cliente_id` diz de quem é aquele pedido; em `clientes`, `cliente_id` identifica quem é aquele cliente. É essa coluna repetida (a chave) que permite responder perguntas como \"qual o nome do cliente que comprou o Notebook?\" sem duplicar nome e cidade em toda linha de pedido.\n\nRepare também em dois detalhes que vão importar na próxima aula: Carla e Diego ainda não fizeram nenhum pedido, e o pedido 104 tem `cliente_id` 5, que não existe na tabela de clientes (um dado inconsistente, comum em sistemas reais). O que fazer com essas linhas sem correspondência depende do tipo de junção que você escolher."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\nclientes = pd.DataFrame({\n    \"cliente_id\": [1, 2, 3, 4],\n    \"nome\": [\"Ana\", \"Bruno\", \"Carla\", \"Diego\"],\n    \"cidade\": [\"São Paulo\", \"Rio de Janeiro\", \"Belo Horizonte\", \"Salvador\"]\n})\n\npedidos = pd.DataFrame({\n    \"pedido_id\": [101, 102, 103, 104],\n    \"cliente_id\": [1, 2, 1, 5],\n    \"produto\": [\"Notebook\", \"Mouse\", \"Teclado\", \"Monitor\"],\n    \"valor\": [3500, 80, 250, 900]\n})\n\nprint(clientes.shape, pedidos.shape)\n# (4, 3) (4, 4)\n\nprint(pedidos[\"cliente_id\"].isin(clientes[\"cliente_id\"]))\n# 0     True\n# 1     True\n# 2     True\n# 3    False\n# Name: cliente_id, dtype: bool"
                    },
                    {
                        "type": "text",
                        "value": "## Duas tabelas, uma pergunta\n\nSe você quisesse o nome do cliente ao lado de cada pedido, hoje faria isso na unha: um `for`, ou um `.map()` de um dicionário `cliente_id -> nome`. Funciona pra um caso simples, mas fica frágil quando você precisa trazer várias colunas de uma vez, ou quando as tabelas têm milhões de linhas.\n\nO pandas resolve isso com uma operação só: `merge`. Ela é o equivalente ao `JOIN` do SQL, a linguagem que você vai ver na próxima trilha para consultar bancos de dados diretamente. Aprender `merge` aqui adianta boa parte do que o `JOIN` faz lá."
                    },
                    {
                        "type": "quote",
                        "value": "Toda tabela conta uma parte da história. Juntar tabelas é o que transforma dados que existem em resposta que você precisa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Nas tabelas clientes e pedidos desta aula, qual coluna funciona como a chave que liga as duas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "cliente_id, porque aparece nas duas tabelas e identifica a quem cada pedido pertence",
                                "isCorrect": true
                            },
                            {
                                "text": "pedido_id, porque aparece nas duas tabelas e identifica o produto comprado",
                                "isCorrect": false
                            },
                            {
                                "text": "nome, porque aparece nas duas tabelas e identifica o cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "valor, porque aparece nas duas tabelas e identifica o preço pago",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um sistema costuma guardar clientes e pedidos em tabelas separadas, em vez de repetir nome e cidade do cliente em cada linha de pedido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque repetir os dados do cliente em cada pedido gera duplicação e risco de inconsistência",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o pandas não permite colunas de texto repetidas dentro de um único DataFrame",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque tabelas separadas ocupam sempre menos espaço em disco do que qualquer tabela única",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o merge só funciona quando os dados vêm de arquivos CSV diferentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No código desta aula, pedidos[\"cliente_id\"].isin(clientes[\"cliente_id\"]) retorna False na última posição. O que isso indica sobre o pedido 104?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O cliente_id 5 do pedido 104 não existe na tabela de clientes",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor do pedido 104 é negativo e por isso é inválido",
                                "isCorrect": false
                            },
                            {
                                "text": "O produto do pedido 104 está com o nome duplicado em outra linha",
                                "isCorrect": false
                            },
                            {
                                "text": "O pedido_id 104 é menor do que os demais pedidos da tabela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Olhando as tabelas clientes e pedidos mostradas na aula, o que é verdade sobre Carla e Diego?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aparecem na tabela de clientes, mas nenhum cliente_id deles aparece na tabela de pedidos",
                                "isCorrect": true
                            },
                            {
                                "text": "Aparecem na tabela de pedidos, mas nenhum cliente_id deles aparece na tabela de clientes",
                                "isCorrect": false
                            },
                            {
                                "text": "Aparecem em ambas as tabelas, cada um com exatamente um pedido registrado",
                                "isCorrect": false
                            },
                            {
                                "text": "Não aparecem em nenhuma das duas tabelas mostradas na aula",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer descobrir, pra cada pedido, o nome e a cidade do cliente que comprou, sem duplicar essas colunas manualmente em pedidos. Antes de aprender merge, qual abordagem já vista na trilha resolveria isso, ainda que de forma mais manual?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Mapear cliente_id para nome e cidade com .map() a partir de dicionários montados de clientes",
                                "isCorrect": true
                            },
                            {
                                "text": "Ordenar pedidos com sort_values(\"cliente_id\") para que os nomes apareçam automaticamente ao lado",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar groupby(\"cliente_id\") em pedidos para que o pandas busque o nome na tabela clientes",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar astype(str) na coluna cliente_id para que ela passe a exibir o nome do cliente",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "merge e os tipos de join",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## merge: juntando por uma chave\n\nA função `pd.merge` combina duas tabelas usando uma coluna em comum, a chave, indicada pelo parâmetro `on`:\n\n`pd.merge(esquerda, direita, on=\"chave\", how=\"tipo\")`\n\nO `how` decide o que fazer com as linhas sem correspondência do outro lado, e tem quatro valores possíveis: `\"inner\"`, `\"left\"`, `\"right\"` e `\"outer\"`. Essa é a mesma lógica do `JOIN` em SQL: `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN` e `FULL OUTER JOIN` fazem exatamente isso, e o `ON` do SQL é o mesmo `on` do `pd.merge`."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\nclientes = pd.DataFrame({\n    \"cliente_id\": [1, 2, 3, 4],\n    \"nome\": [\"Ana\", \"Bruno\", \"Carla\", \"Diego\"],\n    \"cidade\": [\"São Paulo\", \"Rio de Janeiro\", \"Belo Horizonte\", \"Salvador\"]\n})\n\npedidos = pd.DataFrame({\n    \"pedido_id\": [101, 102, 103, 104],\n    \"cliente_id\": [1, 2, 1, 5],\n    \"produto\": [\"Notebook\", \"Mouse\", \"Teclado\", \"Monitor\"],\n    \"valor\": [3500, 80, 250, 900]\n})\n\ninner = pd.merge(clientes, pedidos, on=\"cliente_id\", how=\"inner\")\nprint(inner)\n#    cliente_id   nome           cidade  pedido_id   produto  valor\n# 0           1    Ana        São Paulo        101  Notebook   3500\n# 1           1    Ana        São Paulo        103   Teclado    250\n# 2           2  Bruno  Rio de Janeiro        102     Mouse     80\n\nprint(inner.shape)\n# (3, 6)\n\n# Carla, Diego (sem pedidos) e o pedido 104 (cliente_id 5, que não existe) somem:\n# o inner só mantém quem casa dos dois lados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"cliente_id\", \"nome\", \"cidade\", \"pedido_id\", \"produto\", \"valor\"], [\"1\", \"Ana\", \"São Paulo\", \"101\", \"Notebook\", \"3500\"], [\"1\", \"Ana\", \"São Paulo\", \"103\", \"Teclado\", \"250\"], [\"2\", \"Bruno\", \"Rio de Janeiro\", \"102\", \"Mouse\", \"80\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que acontece com quem não casa\n\nO `how=\"inner\"` (o padrão, se você não informar nada) só mantém linhas cuja chave existe nos dois lados. Os outros três tipos decidem diferente o que fazer com quem fica de fora:\n\n- `\"left\"`: mantém todas as linhas da tabela da esquerda; quando não há correspondência à direita, as colunas da direita vêm como `NaN`.\n- `\"right\"`: o espelho do left, mantém todas as linhas da direita e preenche com `NaN` o que faltar à esquerda.\n- `\"outer\"`: mantém todas as linhas dos dois lados, casando o que casa e preenchendo com `NaN` o resto.\n\nNo exemplo de clientes e pedidos, isso decide se Carla, Diego (sem pedidos) e o pedido 104 (cliente inexistente) aparecem ou não no resultado."
                    },
                    {
                        "type": "code",
                        "value": "left = pd.merge(clientes, pedidos, on=\"cliente_id\", how=\"left\")\nprint(left)\n#    cliente_id   nome           cidade  pedido_id   produto   valor\n# 0           1    Ana        São Paulo      101.0  Notebook   3500.0\n# 1           1    Ana        São Paulo      103.0   Teclado    250.0\n# 2           2  Bruno  Rio de Janeiro      102.0     Mouse     80.0\n# 3           3  Carla  Belo Horizonte        NaN       NaN      NaN\n# 4           4  Diego        Salvador        NaN       NaN      NaN\n\n# pedido_id e valor viram float (101.0, 3500.0...): o NaN nas linhas de Carla e Diego\n# força a coluna inteira a virar float64, mesmo pedido_id sendo um \"código inteiro\".\n\nright = pd.merge(clientes, pedidos, on=\"cliente_id\", how=\"right\")\nprint(right)\n#    cliente_id  nome           cidade  pedido_id   produto  valor\n# 0           1   Ana        São Paulo        101  Notebook   3500\n# 1           2  Bruno  Rio de Janeiro        102     Mouse     80\n# 2           1   Ana        São Paulo        103   Teclado    250\n# 3           5   NaN              NaN        104   Monitor    900\n\nouter = pd.merge(clientes, pedidos, on=\"cliente_id\", how=\"outer\")\nprint(outer.shape)\n# (6, 6)\n\nprint(outer[\"nome\"].isna().sum(), outer[\"produto\"].isna().sum())\n# 1 2"
                    },
                    {
                        "type": "table",
                        "value": "[[\"how\", \"o que mantém\", \"linhas sem correspondência\"], [\"inner\", \"só as linhas cuja chave existe nos dois lados\", \"descartadas dos dois lados\"], [\"left\", \"todas as linhas da tabela da esquerda\", \"a tabela da direita vira NaN quando não casa\"], [\"right\", \"todas as linhas da tabela da direita\", \"a tabela da esquerda vira NaN quando não casa\"], [\"outer\", \"todas as linhas dos dois lados\", \"o lado que não casa vira NaN\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "merge não é mágica: é a pergunta o que faço com quem não casa respondida de quatro jeitos diferentes. Escolher o how certo é decidir se uma linha sem par deve sumir ou virar NaN."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o valor padrão do parâmetro how em pd.merge, caso ele não seja informado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "\"inner\", que mantém só as linhas cuja chave existe nos dois lados",
                                "isCorrect": true
                            },
                            {
                                "text": "\"outer\", que mantém todas as linhas dos dois lados",
                                "isCorrect": false
                            },
                            {
                                "text": "\"left\", que mantém todas as linhas da tabela da esquerda",
                                "isCorrect": false
                            },
                            {
                                "text": "\"right\", que mantém todas as linhas da tabela da direita",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No merge entre clientes e pedidos desta aula, qual parâmetro indica a coluna usada para ligar as duas tabelas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "on",
                                "isCorrect": true
                            },
                            {
                                "text": "how",
                                "isCorrect": false
                            },
                            {
                                "text": "key",
                                "isCorrect": false
                            },
                            {
                                "text": "index",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de pd.merge(clientes, pedidos, on=\"cliente_id\", how=\"left\"), o que acontece com Carla e Diego, que não têm nenhum pedido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Continuam no resultado, com as colunas vindas de pedidos preenchidas com NaN",
                                "isCorrect": true
                            },
                            {
                                "text": "Somem do resultado, porque left descarta quem não tem pedido",
                                "isCorrect": false
                            },
                            {
                                "text": "Continuam no resultado, mas com as colunas vindas de pedidos preenchidas com zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Aparecem duplicados no resultado, uma linha para cada coluna de pedidos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No merge how=\"right\" entre clientes e pedidos, o que acontece com o pedido 104, cujo cliente_id é 5 e não existe em clientes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Continua no resultado, com nome e cidade como NaN",
                                "isCorrect": true
                            },
                            {
                                "text": "É descartado, porque right só mantém pedidos com cliente cadastrado",
                                "isCorrect": false
                            },
                            {
                                "text": "Continua no resultado, com nome e cidade preenchidos com Desconhecido",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera um erro, porque o cliente_id 5 não existe na tabela da esquerda",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de pd.merge(clientes, pedidos, on=\"cliente_id\", how=\"left\"), a coluna pedido_id (originalmente int64 em pedidos) aparece como 101.0, 103.0 em vez de 101, 103. Por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As linhas de Carla e Diego, sem pedido, geram NaN em pedido_id, e isso força a coluna inteira para float64",
                                "isCorrect": true
                            },
                            {
                                "text": "O pd.merge sempre converte colunas numéricas para float64, mesmo sem nenhum valor faltante",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna pedido_id da tabela pedidos já estava como float64 antes do merge, e o merge só manteve o tipo",
                                "isCorrect": false
                            },
                            {
                                "text": "O parâmetro how=\"left\" converte todas as colunas numéricas da direita para float64 por padrão",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "concat: empilhando DataFrames",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## concat: empilhar tabelas\n\nNem toda combinação de tabelas é uma relação por chave. Às vezes você só recebe mais dados no mesmo formato: as vendas de fevereiro chegaram depois das de janeiro, mas em outro arquivo, com as mesmas colunas. Não faz sentido usar merge aqui, porque não existe uma chave ligando \"pedido de janeiro\" a \"pedido de fevereiro\": você só quer empilhar as duas tabelas, uma embaixo da outra. É pra isso que serve `pd.concat`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"pedido_id\", \"cliente_id\", \"produto\", \"valor\"], [\"105\", \"2\", \"Cabo HDMI\", \"45\"], [\"106\", \"3\", \"Monitor\", \"900\"], [\"107\", \"1\", \"Headset\", \"150\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\npedidos_jan = pd.DataFrame({\n    \"pedido_id\": [101, 102, 103, 104],\n    \"cliente_id\": [1, 2, 1, 5],\n    \"produto\": [\"Notebook\", \"Mouse\", \"Teclado\", \"Monitor\"],\n    \"valor\": [3500, 80, 250, 900]\n})\n\npedidos_fev = pd.DataFrame({\n    \"pedido_id\": [105, 106, 107],\n    \"cliente_id\": [2, 3, 1],\n    \"produto\": [\"Cabo HDMI\", \"Monitor\", \"Headset\"],\n    \"valor\": [45, 900, 150]\n})\n\npedidos_semestre = pd.concat([pedidos_jan, pedidos_fev], axis=0, ignore_index=True)\nprint(pedidos_semestre.shape)\n# (7, 4)\n\nprint(pedidos_semestre.tail(3))\n#    pedido_id  cliente_id    produto  valor\n# 4        105           2  Cabo HDMI     45\n# 5        106           3    Monitor    900\n# 6        107           1    Headset    150\n\n# sem ignore_index=True, o índice de pedidos_fev (0, 1, 2) se repetiria\n# depois do índice de pedidos_jan (0, 1, 2, 3), criando índice duplicado."
                    },
                    {
                        "type": "text",
                        "value": "## concat no outro eixo: lado a lado\n\n`pd.concat` também aceita `axis=1`, que combina colunas lado a lado em vez de empilhar linhas. Nesse caso, o pandas alinha as tabelas pelo índice: cada linha do resultado junta os dados que compartilham o mesmo valor de índice nas tabelas de entrada. É útil quando duas tabelas descrevem os mesmos registros (os mesmos clientes, por exemplo), mas cada uma guarda um grupo diferente de colunas."
                    },
                    {
                        "type": "code",
                        "value": "clientes_basico = pd.DataFrame({\n    \"nome\": [\"Ana\", \"Bruno\", \"Carla\"],\n    \"cidade\": [\"São Paulo\", \"Rio de Janeiro\", \"Belo Horizonte\"]\n}, index=[1, 2, 3])\nclientes_basico.index.name = \"cliente_id\"\n\nclientes_contato = pd.DataFrame({\n    \"email\": [\"ana@email.com\", \"bruno@email.com\", \"carla@email.com\"],\n    \"telefone\": [\"11-9999\", \"21-8888\", \"31-7777\"]\n}, index=[1, 2, 3])\nclientes_contato.index.name = \"cliente_id\"\n\nclientes_completo = pd.concat([clientes_basico, clientes_contato], axis=1)\nprint(clientes_completo)\n#              nome           cidade            email telefone\n# cliente_id\n# 1             Ana        São Paulo    ana@email.com  11-9999\n# 2           Bruno  Rio de Janeiro  bruno@email.com  21-8888\n# 3           Carla  Belo Horizonte  carla@email.com  31-7777"
                    },
                    {
                        "type": "text",
                        "value": "## concat ou merge?\n\nOs dois combinam tabelas, mas resolvem problemas diferentes:\n\n- Use concat quando as tabelas têm a mesma estrutura e você só quer empilhar mais linhas (axis=0), ou quando compartilham o mesmo índice e você quer juntar colunas (axis=1). Não existe chave, não existe casamento linha a linha por valor: é posição de índice.\n- Use merge quando as tabelas se relacionam por uma coluna chave, com valores que precisam ser combinados com a linha correspondente da outra, mesmo que as linhas não estejam na mesma ordem, e mesmo que uma tabela tenha várias linhas para uma linha da outra (como vários pedidos para um cliente).\n\nNa dúvida, pergunte: as tabelas têm as mesmas colunas (ou o mesmo índice) e eu só quero somar linhas ou colunas? Ou existe uma coluna em comum que liga as linhas de um jeito relacional? A primeira pergunta aponta pra concat, a segunda pra merge."
                    },
                    {
                        "type": "quote",
                        "value": "concat empilha o que já tem o mesmo formato; merge liga o que se relaciona por uma chave. Confundir os dois é tentar montar um quebra-cabeça encaixando peças de caixas diferentes."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual eixo em pd.concat empilha um DataFrame embaixo do outro, adicionando linhas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "axis=0",
                                "isCorrect": true
                            },
                            {
                                "text": "axis=1",
                                "isCorrect": false
                            },
                            {
                                "text": "axis=2",
                                "isCorrect": false
                            },
                            {
                                "text": "axis=-1",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você recebeu pedidos_jan e pedidos_fev, duas tabelas com exatamente as mesmas colunas, e quer uma tabela só com os pedidos dos dois meses. Qual código resolve isso diretamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "pd.concat([pedidos_jan, pedidos_fev])",
                                "isCorrect": true
                            },
                            {
                                "text": "pd.merge(pedidos_jan, pedidos_fev, on=\"pedido_id\")",
                                "isCorrect": false
                            },
                            {
                                "text": "pedidos_jan.groupby(\"pedido_id\").sum()",
                                "isCorrect": false
                            },
                            {
                                "text": "pedidos_jan.join(pedidos_fev, how=\"outer\")",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao empilhar pedidos_jan (índice 0 a 3) e pedidos_fev (índice 0 a 2) com pd.concat([pedidos_jan, pedidos_fev], axis=0), sem usar ignore_index=True, o que acontece com o índice do resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fica com valores repetidos, porque cada tabela mantém seu índice original",
                                "isCorrect": true
                            },
                            {
                                "text": "Vira automaticamente uma sequência nova de 0 até o total de linhas, sem repetição",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera um erro, porque o pandas não aceita índices repetidos em um concat",
                                "isCorrect": false
                            },
                            {
                                "text": "Fica vazio, porque o pandas não sabe qual dos dois índices usar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em pd.concat([clientes_basico, clientes_contato], axis=1), como o pandas decide qual linha de clientes_contato combina com qual linha de clientes_basico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pelo índice: linhas com o mesmo valor de índice nas duas tabelas ficam juntas",
                                "isCorrect": true
                            },
                            {
                                "text": "Pela posição: a primeira linha de cada tabela sempre fica junta, sem olhar índice",
                                "isCorrect": false
                            },
                            {
                                "text": "Por uma coluna chave, escolhida automaticamente entre as colunas em comum",
                                "isCorrect": false
                            },
                            {
                                "text": "Pela ordem alfabética dos valores da primeira coluna de cada tabela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se clientes_basico estiver ordenado por cliente_id (1, 2, 3) mas clientes_contato estiver na ordem (3, 1, 2), o que acontece ao rodar pd.concat([clientes_basico, clientes_contato], axis=1)?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O pandas casa as linhas pelo índice, então o resultado sai correto mesmo com ordens diferentes",
                                "isCorrect": true
                            },
                            {
                                "text": "O pandas casa as linhas pela posição, então o contato do cliente 3 liga ao nome do cliente 1",
                                "isCorrect": false
                            },
                            {
                                "text": "O concat recusa a operação com erro, já que as tabelas precisam estar na mesma ordem",
                                "isCorrect": false
                            },
                            {
                                "text": "O concat reordena clientes_contato pra ordem alfabética antes de combinar as colunas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Um fluxo de análise de ponta a ponta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O cenário\n\nChegou a hora de juntar tudo que você viu na trilha num fluxo só, do jeito que uma análise de verdade acontece: carregar dados sujos, limpar, transformar, agrupar e cruzar com outra tabela pra tirar uma conclusão. Nenhuma ferramenta nova aqui, só as das aulas anteriores trabalhando juntas.\n\nO cenário: uma tabela de vendas, uma linha por pedido, com categoria do produto, quantidade e preço unitário. Os dados vieram exportados de outro sistema e, como sempre acontece fora do exemplo didático, vieram com problemas: valores faltando e uma linha duplicada."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport io\n\ncsv_vendas = \"\"\"pedido_id,categoria,quantidade,preco_unitario\n1,Eletrônicos,2,350.00\n2,Livros,1,45.00\n3,Eletrônicos,,120.00\n4,Papelaria,5,8.50\n5,Livros,3,45.00\n6,Eletrônicos,1,999.00\n7,Papelaria,10,8.50\n8,Livros,2,\n9,Eletrônicos,2,350.00\n9,Eletrônicos,2,350.00\"\"\"\n\nvendas = pd.read_csv(io.StringIO(csv_vendas))\n\nprint(vendas.shape)\n# (10, 4)\n\nprint(vendas.isna().sum())\n# pedido_id          0\n# categoria          0\n# quantidade         1\n# preco_unitario     1\n# dtype: int64\n\nprint(vendas.duplicated().sum())\n# 1\n\nprint(vendas.dtypes[\"quantidade\"])\n# float64"
                    },
                    {
                        "type": "code",
                        "value": "vendas = vendas.drop_duplicates()\nprint(vendas.shape)\n# (9, 4)\n\nmediana_quantidade = vendas[\"quantidade\"].median()\nmedia_preco = vendas[\"preco_unitario\"].mean()\nprint(mediana_quantidade, media_preco)\n# 2.0 240.75\n\nvendas[\"quantidade\"] = vendas[\"quantidade\"].fillna(mediana_quantidade).astype(int)\nvendas[\"preco_unitario\"] = vendas[\"preco_unitario\"].fillna(media_preco)\n\nprint(vendas.isna().sum().sum())\n# 0\n\nprint(vendas.dtypes[\"quantidade\"])\n# int64"
                    },
                    {
                        "type": "table",
                        "value": "[[\"pedido_id\", \"categoria\", \"quantidade\", \"preco_unitario\"], [\"1\", \"Eletrônicos\", \"2\", \"350.0\"], [\"2\", \"Livros\", \"1\", \"45.0\"], [\"3\", \"Eletrônicos\", \"2\", \"120.0\"], [\"4\", \"Papelaria\", \"5\", \"8.5\"], [\"5\", \"Livros\", \"3\", \"45.0\"], [\"6\", \"Eletrônicos\", \"1\", \"999.0\"], [\"7\", \"Papelaria\", \"10\", \"8.5\"], [\"8\", \"Livros\", \"2\", \"240.75\"], [\"9\", \"Eletrônicos\", \"2\", \"350.0\"]]"
                    },
                    {
                        "type": "code",
                        "value": "vendas[\"valor_total\"] = vendas[\"quantidade\"] * vendas[\"preco_unitario\"]\n\nresumo = vendas.groupby(\"categoria\")[\"valor_total\"].sum().sort_values(ascending=False)\nprint(resumo)\n# categoria\n# Eletrônicos    2639.00\n# Livros          661.50\n# Papelaria       127.50\n# Name: valor_total, dtype: float64"
                    },
                    {
                        "type": "code",
                        "value": "metas = pd.DataFrame({\n    \"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\", \"Brinquedos\"],\n    \"meta_mensal\": [3000, 500, 150, 200]\n})\n\ndesempenho = pd.merge(resumo.reset_index(), metas, on=\"categoria\", how=\"right\")\ndesempenho[\"atingiu_meta\"] = desempenho[\"valor_total\"] >= desempenho[\"meta_mensal\"]\nprint(desempenho)\n#      categoria  valor_total  meta_mensal  atingiu_meta\n# 0  Eletrônicos      2639.00         3000         False\n# 1       Livros       661.50          500          True\n# 2    Papelaria       127.50          150         False\n# 3   Brinquedos          NaN          200         False\n\n# how=\"right\": mantém todas as categorias de metas, mesmo Brinquedos, que não teve\n# nenhuma venda no período (valor_total vira NaN, e a comparação NaN >= 200 já dá False).\n\n# insight: Eletrônicos fatura mais em valor absoluto, mas fica abaixo da meta;\n# Livros é a única categoria que bateu a meta do mês."
                    },
                    {
                        "type": "quote",
                        "value": "Carregar, limpar, transformar, agrupar, juntar: são cinco verbos, e cada um já apareceu nesta trilha. Uma análise de ponta a ponta é só esses verbos na ordem certa, aplicados a um problema real."
                    }
                ],
                "questions": [
                    {
                        "statement": "Depois de vendas = vendas.drop_duplicates() nesta aula, quantas linhas restam na tabela de vendas, que tinha 10 linhas com um pedido duplicado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "9",
                                "isCorrect": true
                            },
                            {
                                "text": "10",
                                "isCorrect": false
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            },
                            {
                                "text": "7",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para preencher os valores faltantes de quantidade com a mediana da própria coluna, qual código está correto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "vendas[\"quantidade\"].fillna(vendas[\"quantidade\"].median())",
                                "isCorrect": true
                            },
                            {
                                "text": "vendas[\"quantidade\"].dropna(vendas[\"quantidade\"].median())",
                                "isCorrect": false
                            },
                            {
                                "text": "vendas[\"quantidade\"].fillna(vendas[\"quantidade\"].mode())",
                                "isCorrect": false
                            },
                            {
                                "text": "vendas[\"quantidade\"].astype(vendas[\"quantidade\"].median())",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois do fillna e do astype(int) na coluna quantidade desta aula, qual dtype ela passa a ter?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "int64",
                                "isCorrect": true
                            },
                            {
                                "text": "float64",
                                "isCorrect": false
                            },
                            {
                                "text": "object",
                                "isCorrect": false
                            },
                            {
                                "text": "bool",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O código vendas.groupby(\"categoria\")[\"valor_total\"].sum().sort_values(ascending=False) desta aula retorna a soma de valor_total por categoria, da maior para a menor. Qual categoria aparece primeiro no resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Eletrônicos, com valor_total de 2639.00",
                                "isCorrect": true
                            },
                            {
                                "text": "Livros, com valor_total de 661.50",
                                "isCorrect": false
                            },
                            {
                                "text": "Papelaria, com valor_total de 127.50",
                                "isCorrect": false
                            },
                            {
                                "text": "Eletrônicos, com valor_total de 3000.00",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No merge final desta aula, pd.merge(resumo.reset_index(), metas, on=\"categoria\", how=\"right\"), a categoria Brinquedos aparece com valor_total igual a NaN, e a coluna atingiu_meta (valor_total >= meta_mensal) mostra False pra ela. Por que False, e não um erro ou NaN?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque comparações com NaN (como >=) sempre resultam em False, nunca em erro ou em NaN",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o pandas converte NaN em zero antes de qualquer comparação numérica",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o how=\"right\" substitui automaticamente valores ausentes por False nas colunas booleanas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque meta_mensal também é NaN pra Brinquedos, e NaN >= NaN é definido como False",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Recap e o próximo passo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Fim da trilha, o que fica\n\nSete módulos atrás, você via uma lista de números em Python puro e se perguntava por que precisava de mais uma biblioteca pra isso. Agora você carrega um CSV sujo, limpa valores faltando, cria colunas novas, agrupa por categoria e junta com outra tabela, tudo em poucas linhas de pandas. Antes do próximo passo, vale o recap rápido do que cada módulo te deu."
                    },
                    {
                        "type": "table",
                        "value": "[[\"módulo\", \"o que você aprendeu\", \"ferramenta-chave\"], [\"1. NumPy\", \"arrays rápidos e operações vetorizadas, a base do pandas\", \"array, operações element-wise\"], [\"2. Series e DataFrame\", \"a tabela programável, colunas tipadas, o index\", \"DataFrame, dtypes\"], [\"3. Carregar e inspecionar\", \"trazer dados de fora e olhar antes de mexer\", \"read_csv, describe, info\"], [\"4. Selecionar e filtrar\", \"escolher linhas e colunas, com cuidado entre view e cópia\", \"loc, iloc, boolean indexing\"], [\"5. Agrupar e agregar\", \"resumir grupos numa linha, no lugar do dict manual\", \"groupby, agg\"], [\"6. Limpeza e preparação\", \"tratar faltantes, tipos errados, duplicatas e outliers\", \"isna, fillna, astype, drop_duplicates\"], [\"7. Juntar dados\", \"combinar tabelas relacionadas por chave, ou empilhar\", \"merge, concat\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\"],\n    \"quantidade\": [2, 1, 5],\n    \"preco\": [350.0, 45.0, 8.5]\n})\nmetas = pd.DataFrame({\"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\"], \"meta\": [3000, 500, 150]})\n\ndf[\"valor_total\"] = df[\"quantidade\"] * df[\"preco\"]                # Módulo 4: transformar\nresumo = df.groupby(\"categoria\")[\"valor_total\"].sum()              # Módulo 5: agrupar\nfinal = pd.merge(resumo.reset_index(), metas, on=\"categoria\")      # Módulo 7: juntar\nprint(final)\n#      categoria  valor_total  meta\n# 0  Eletrônicos        700.0  3000\n# 1       Livros         45.0   500\n# 2    Papelaria         42.5   150\n\n# cada linha do bloco usa uma ferramenta de um módulo diferente da trilha:\n# carregar (Módulo 3), limpar (Módulo 6), selecionar (Módulo 4), agrupar (Módulo 5), juntar (Módulo 7)."
                    },
                    {
                        "type": "text",
                        "value": "## Uma direção: SQL e bancos de dados\n\nNesta trilha, os dados sempre chegaram prontos, um CSV ou um dict pronto pra virar DataFrame. Uma direção natural a partir daqui é aprender SQL e bancos de dados: de onde esses dados realmente vêm, como ficam guardados em tabelas relacionais, como se escreve uma consulta com SELECT, WHERE, GROUP BY, e principalmente como se escreve o JOIN que você acabou de aprender aqui como merge. INNER JOIN, LEFT JOIN, RIGHT JOIN: os mesmos quatro tipos, a mesma lógica de linhas sem correspondência, só que direto no banco, antes mesmo do dado chegar num DataFrame."
                    },
                    {
                        "type": "text",
                        "value": "## Uma direção: visualização de dados\n\nCada groupby, cada merge, cada limpeza desta trilha produziu uma tabela de resultado, e você leu essa tabela com print ou olhando os números. Isso funciona, mas um gráfico comunica um padrão muito mais rápido do que uma tabela cheia de números. A visualização de dados transforma esses mesmos DataFrames em gráficos com matplotlib e seaborn: o resumo da aula anterior, por exemplo, vira um gráfico de barras em uma linha de código."
                    },
                    {
                        "type": "text",
                        "value": "## Uma direção: machine learning\n\nNumPy, pandas, limpeza e junção de dados não são o fim da linha: são o que prepara o terreno para machine learning. Todo modelo de aprendizado de máquina recebe como entrada uma tabela numérica e limpa, sem valores faltando: exatamente o que você aprendeu a produzir aqui. Quanto melhor o dado que chega no modelo, melhor o modelo, e é por isso que essa trilha inteira valeu a pena antes mesmo de você treinar o primeiro modelo.\n\nQual dessas direções é a sua próxima trilha depende do seu roadmap. Abra o seu roadmap e siga por ele."
                    },
                    {
                        "type": "quote",
                        "value": "Você começou essa trilha com um array do NumPy e termina juntando tabelas inteiras. O caminho até Machine Learning passa por dado bem tratado, e agora você sabe tratar dado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual dupla de bibliotecas Python foi a base prática de toda a trilha Análise de Dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "NumPy e pandas",
                                "isCorrect": true
                            },
                            {
                                "text": "matplotlib e seaborn",
                                "isCorrect": false
                            },
                            {
                                "text": "NumPy e scikit-learn",
                                "isCorrect": false
                            },
                            {
                                "text": "pandas e SQL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na próxima trilha do roadmap depois de Análise de Dados, qual comando de SQL faz o mesmo papel do merge do pandas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "JOIN",
                                "isCorrect": true
                            },
                            {
                                "text": "GROUP BY",
                                "isCorrect": false
                            },
                            {
                                "text": "WHERE",
                                "isCorrect": false
                            },
                            {
                                "text": "ORDER BY",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de agrupar vendas por categoria com groupby e somar valor_total, qual trilha do roadmap ensina a transformar esse resultado num gráfico de barras?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Visualização de Dados, com matplotlib e seaborn",
                                "isCorrect": true
                            },
                            {
                                "text": "SQL e Banco de Dados, com o comando PLOT",
                                "isCorrect": false
                            },
                            {
                                "text": "Machine Learning, com um modelo de regressão",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatística, revisando média e desvio padrão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a trilha destaca que Machine Learning depende do que foi aprendido em Análise de Dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque todo modelo recebe como entrada uma tabela numérica e limpa, o que esta trilha ensina a produzir",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque os modelos de Machine Learning são escritos usando apenas comandos do NumPy, sem outra biblioteca",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o pandas treina modelos de Machine Learning diretamente, sem precisar de outra biblioteca",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a limpeza de dados só é necessária quando o projeto usa Machine Learning, e não em outras análises",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tem duas tabelas, vendas_2025 (uma linha por venda, todo o ano) e metas_categoria (a meta de faturamento por categoria). Quer somar o faturamento por categoria e comparar com a meta de cada uma. Qual sequência de operações resolve isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "agrupar vendas_2025 por categoria com groupby, e juntar o resultado com metas_categoria via merge",
                                "isCorrect": true
                            },
                            {
                                "text": "empilhar vendas_2025 com metas_categoria via concat, e filtrar o resultado com boolean indexing",
                                "isCorrect": false
                            },
                            {
                                "text": "juntar vendas_2025 com metas_categoria via merge, e depois empilhar tudo de novo com concat",
                                "isCorrect": false
                            },
                            {
                                "text": "ordenar vendas_2025 com sort_values, e empilhar o resultado com metas_categoria via concat",
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
