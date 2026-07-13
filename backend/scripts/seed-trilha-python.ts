// Seed da trilha Python (iniciante), estagio 2 do roadmap de Ciencia de Dados.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-python.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Python";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "A linguagem da ciência de dados, do zero: sintaxe, números e strings, controle de fluxo, estruturas de dados (listas, dicionários, conjuntos), funções e módulos, arquivos e erros, e a ponte pra manipular dados. A base de código pra NumPy, pandas e machine learning.";

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
        "titulo": "Módulo 1 - Primeiros passos com Python",
        "aulas": [
            {
                "titulo": "O que é Python e por que é a linguagem da ciência de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é Python e por que é a linguagem da ciência de dados\n\nVocê já passou pela trilha de Lógica de Programação: já sabe o que é uma variável, uma condição, um laço, uma função. Agora chega a hora de aplicar tudo isso numa linguagem real, e a escolhida aqui é o Python.\n\nPython é uma linguagem de programação de propósito geral, criada por Guido van Rossum e lançada em 1991. O nome não tem relação com a cobra: veio do grupo de comédia britânico Monty Python, um dos programas favoritos do criador da linguagem."
                    },
                    {
                        "type": "text",
                        "value": "## Por que Python é a linguagem da ciência de dados\n\nExistem dezenas de linguagens de programação, mas Python virou o padrão de fato em ciência de dados por alguns motivos concretos:\n\n- **Sintaxe legível**: o código Python se parece muito com pseudocódigo. Isso reduz a distância entre o que você pensa e o que você escreve.\n- **Ecossistema de dados enorme**: bibliotecas como pandas, NumPy, scikit-learn e Matplotlib (que você vai conhecer nas próximas trilhas) resolvem praticamente qualquer problema de manipulação, análise e visualização de dados. Muitas delas rodam código otimizado por baixo dos panos, o que compensa o Python puro ser mais lento que linguagens compiladas.\n- **Comunidade gigante**: qualquer erro que você tiver, alguém já teve antes e documentou a solução.\n- **Linguagem interpretada**: você escreve uma linha e já vê o resultado, sem esperar um processo de compilação longo. Isso deixa a experimentação com dados muito mais rápida."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Área\", \"Exemplo de uso\"], [\"Ciência de dados\", \"Analisar planilhas e treinar modelos de machine learning\"], [\"Desenvolvimento web\", \"Backends de sites com frameworks como Django e Flask\"], [\"Automação\", \"Scripts que renomeiam arquivos, enviam e-mails, coletam dados da web\"], [\"Ciência e pesquisa\", \"Simulações e processamento de dados de experimentos\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# um gostinho de Python: calcular a média de notas de uma turma\nnotas = [8, 7, 9, 6, 10]\nmedia = sum(notas) / len(notas)\nprint(media)\n# Saída: 8.0"
                    },
                    {
                        "type": "text",
                        "value": "## Conectando com o que você já sabe\n\nRepare que o código acima tem uma lista de números, uma soma, uma divisão e um `print` para mostrar o resultado. Nada disso é novidade: é a mesma lógica de sempre, guardar valores, fazer uma conta, exibir o resultado. O que muda é a sintaxe: em Python isso cabe em três linhas, sem declarar tipos e sem chaves para marcar blocos.\n\nNas próximas aulas deste módulo você vai aprender a rodar código Python de verdade, entender a sintaxe que chama atenção de quem vem de outras linguagens e criar suas primeiras variáveis."
                    },
                    {
                        "type": "quote",
                        "value": "Python transforma lógica em código quase do jeito que você pensa nela: essa é a porta de entrada da maioria dos cientistas de dados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual característica de Python é apontada como um dos motivos de ser tão usada em ciência de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A sintaxe legível, parecida com pseudocódigo",
                                "isCorrect": true
                            },
                            {
                                "text": "A exigência de declarar o tipo de cada variável",
                                "isCorrect": false
                            },
                            {
                                "text": "A obrigatoriedade de usar chaves para marcar blocos",
                                "isCorrect": false
                            },
                            {
                                "text": "A necessidade de compilar o código antes de rodar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além da ciência de dados, em quais outras áreas o Python é amplamente usado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Desenvolvimento web e automação de tarefas",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas em aplicativos de celular nativos",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas em jogos eletrônicos em três dimensões",
                                "isCorrect": false
                            },
                            {
                                "text": "Exclusivamente em sistemas operacionais",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Diferente de linguagens compiladas, o Python é interpretado. Na prática, isso significa que:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "dá para rodar um trecho e ver o resultado na hora",
                                "isCorrect": true
                            },
                            {
                                "text": "o código nunca pode conter erro de digitação",
                                "isCorrect": false
                            },
                            {
                                "text": "o programa sempre roda mais rápido que um compilado",
                                "isCorrect": false
                            },
                            {
                                "text": "é obrigatório usar sempre o mesmo editor de texto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nnotas = [8, 7, 9, 6, 10]\nmedia = sum(notas) / len(notas)\nprint(media)",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "8.0",
                                "isCorrect": true
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            },
                            {
                                "text": "40",
                                "isCorrect": false
                            },
                            {
                                "text": "5",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Python costuma ser mais lento que linguagens compiladas como C. Por que, mesmo assim, ele é tão usado em ciência de dados?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque NumPy e pandas usam código otimizado por baixo dos panos",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a velocidade de execução não importa em projetos de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Python compila para C antes de cada execução",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cientistas de dados preferem programas mais lentos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Rodando seu primeiro código: REPL e arquivo .py",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O interpretador Python\n\nDiferente de linguagens compiladas, o Python é executado por um programa chamado **interpretador**, que lê o código linha por linha e roda na hora, sem gerar antes um arquivo executável separado.\n\nNa trilha de Lógica você testava seus algoritmos no papel ou mentalmente, passo a passo. Agora, com Python instalado, dá para testar de verdade: existem duas formas principais de rodar código, o **modo interativo** (REPL) e a execução de um **arquivo `.py`**. Vamos conhecer as duas."
                    },
                    {
                        "type": "text",
                        "value": "## O modo interativo (REPL)\n\nREPL é a sigla para Read-Eval-Print Loop (ler, avaliar, imprimir, repetir). É um modo em que você digita uma linha de Python, aperta Enter, e vê o resultado na hora, sem precisar criar nenhum arquivo.\n\nPara abrir o REPL, digite `python3` no terminal (em alguns sistemas o comando é `python`). Vai aparecer um prompt `>>>` esperando você digitar algo."
                    },
                    {
                        "type": "code",
                        "value": "# no terminal, depois de digitar python3, você entra no REPL:\n>>> 2 + 2\n4\n>>> print(\"Olá, dados!\")\nOlá, dados!\n>>> nome = \"Ana\"\n>>> nome\n'Ana'"
                    },
                    {
                        "type": "text",
                        "value": "## Executando um arquivo .py\n\nO REPL é ótimo para testar coisas rápidas, mas um programa de verdade fica guardado num arquivo com extensão `.py`, que o interpretador executa de uma vez só.\n\nCrie um arquivo chamado `ola.py` com o conteúdo abaixo e rode `python3 ola.py` no terminal, na mesma pasta onde salvou o arquivo."
                    },
                    {
                        "type": "code",
                        "value": "# arquivo: ola.py\nprint(\"Olá, mundo dos dados!\")\n\n# no terminal, dentro da pasta do arquivo:\n# python3 ola.py\n# Olá, mundo dos dados!"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"Melhor opção\"], [\"Testar rapidamente uma linha de código\", \"REPL\"], [\"Guardar um programa para rodar depois\", \"Arquivo .py\"], [\"Ver o resultado de uma expressão na hora\", \"REPL\"], [\"Compartilhar um script com outra pessoa\", \"Arquivo .py\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O REPL é o seu laboratório para testar ideias rápidas. O arquivo .py é onde o programa de verdade mora."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa a sigla REPL?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Read-Eval-Print Loop (ler, avaliar, imprimir, repetir)",
                                "isCorrect": true
                            },
                            {
                                "text": "Run-Execute-Print Language (rodar, executar, imprimir)",
                                "isCorrect": false
                            },
                            {
                                "text": "Read-Execute-Program Loop (ler, executar, programar)",
                                "isCorrect": false
                            },
                            {
                                "text": "Run-Eval-Python Loop (rodar, avaliar, python)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na maioria dos sistemas, qual comando digitado no terminal abre o modo interativo do Python?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "python3",
                                "isCorrect": true
                            },
                            {
                                "text": "pip3",
                                "isCorrect": false
                            },
                            {
                                "text": "python.py",
                                "isCorrect": false
                            },
                            {
                                "text": "run python3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer testar rapidamente se 10 % 3 dá o resultado que você imagina, sem criar nenhum arquivo. Qual é a forma mais prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Abrir o REPL e digitar a expressão direto",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar um arquivo .py só para essa conta",
                                "isCorrect": false
                            },
                            {
                                "text": "Instalar uma biblioteca externa para calcular",
                                "isCorrect": false
                            },
                            {
                                "text": "Reiniciar o computador antes de testar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você escreveu um arquivo chamado analise.py dentro de uma pasta chamada projeto. Qual comando, executado dentro da pasta projeto no terminal, roda o programa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "python3 analise.py",
                                "isCorrect": true
                            },
                            {
                                "text": "python3 -analise.py",
                                "isCorrect": false
                            },
                            {
                                "text": "rodar analise.py",
                                "isCorrect": false
                            },
                            {
                                "text": "analise.py python3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No REPL, você digita:\n\n>>> nome = \"Ana\"\n>>> nome\n\nO que aparece na tela logo após o segundo comando?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "'Ana', porque o REPL mostra a representação do valor",
                                "isCorrect": true
                            },
                            {
                                "text": "Ana, porque o REPL imprime como o print faria",
                                "isCorrect": false
                            },
                            {
                                "text": "nome, porque o REPL repete o nome da variável digitada",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada aparece, porque atribuição não gera saída",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Indentação, sintaxe e comentários",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Blocos por indentação, não por chaves\n\nSe você já deu uma olhada em código de outras linguagens (Java, C, JavaScript), deve ter visto chaves `{ }` marcando onde um bloco começa e termina, e ponto e vírgula `;` no fim de cada linha. Python não usa nada disso: quem marca um bloco é a **indentação**, os espaços no início da linha.\n\nAs regras são fixas:\n- Toda linha que abre um bloco (`if`, `else`, `for`, `while`, `def`...) termina com dois-pontos (`:`).\n- A linha seguinte, dentro do bloco, fica indentada (a convenção da comunidade Python é usar **4 espaços**).\n- Todas as linhas de um mesmo bloco precisam ter a mesma indentação.\n- Não existe ponto e vírgula no fim da linha: a quebra de linha já marca o fim do comando."
                    },
                    {
                        "type": "code",
                        "value": "idade = 20\n\nif idade >= 18:\n    print(\"Pode votar\")\nelse:\n    print(\"Não pode votar\")\n# Saída: Pode votar"
                    },
                    {
                        "type": "code",
                        "value": "idade = 20\n\nif idade >= 18:\nprint(\"Pode votar\")\n# IndentationError: expected an indented block after 'if' statement on line 3"
                    },
                    {
                        "type": "text",
                        "value": "## Comentários com #\n\nQualquer trecho depois de `#` numa linha é ignorado pelo interpretador: serve só para quem está lendo o código. Um bom comentário explica o porquê de uma decisão, não repete o que o código já deixa claro sozinho."
                    },
                    {
                        "type": "code",
                        "value": "# comentário que só repete o código (evite)\nidade = 20  # atribui 20 a idade\n\n# comentário que explica uma decisão (útil)\nidade = 20  # idade mínima usada nos testes, trocar por dado real depois"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Elemento\", \"Python\", \"Linguagens como Java/C\"], [\"Marcação de bloco\", \"Indentação (espaços)\", \"Chaves { }\"], [\"Fim de comando\", \"Quebra de linha\", \"Ponto e vírgula ;\"], [\"Comentário de uma linha\", \"# comentário\", \"// comentário\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Em Python, o espaço em branco não é só estética, é sintaxe. Respeitar a indentação não é escolha, é regra."
                    }
                ],
                "questions": [
                    {
                        "statement": "Como o Python marca onde um bloco de código começa e termina?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pela indentação (os espaços no início da linha)",
                                "isCorrect": true
                            },
                            {
                                "text": "Por chaves { } no início e no fim do bloco",
                                "isCorrect": false
                            },
                            {
                                "text": "Por ponto e vírgula no final de cada linha",
                                "isCorrect": false
                            },
                            {
                                "text": "Pela palavra begin no início e end no final",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que acontece com o texto escrito depois de # numa linha de código Python?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É ignorado pelo interpretador",
                                "isCorrect": true
                            },
                            {
                                "text": "É executado como se fosse código",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera um erro de sintaxe imediato",
                                "isCorrect": false
                            },
                            {
                                "text": "É impresso na tela automaticamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o resultado de rodar este código?\n\nidade = 20\n\nif idade >= 18:\nprint(\"Pode votar\")",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "IndentationError, por causa do print",
                                "isCorrect": true
                            },
                            {
                                "text": "Pode votar, impresso na tela",
                                "isCorrect": false
                            },
                            {
                                "text": "Não pode votar, impresso na tela",
                                "isCorrect": false
                            },
                            {
                                "text": "NameError, por causa de idade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comentário abaixo segue a boa prática de explicar o porquê de uma decisão, e não só repetir o código?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "# idade mínima usada nos testes",
                                "isCorrect": true
                            },
                            {
                                "text": "# atribui o número vinte a idade",
                                "isCorrect": false
                            },
                            {
                                "text": "# isso é uma variável chamada idade",
                                "isCorrect": false
                            },
                            {
                                "text": "# aqui existe um número inteiro salvo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro do mesmo bloco if, uma linha está indentada com 4 espaços e a linha seguinte está indentada com 2 espaços. O que o Python faz?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Gera IndentationError, por indentação diferente no bloco",
                                "isCorrect": true
                            },
                            {
                                "text": "Executa normalmente, porque Python aceita indentação livre",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignora a segunda linha e continua só com a primeira",
                                "isCorrect": false
                            },
                            {
                                "text": "Converte automaticamente as duas linhas para 4 espaços",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Variáveis e tipos básicos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Variáveis em Python\n\nNa trilha de Lógica você já criava variáveis para guardar valores: um contador, uma soma, um nome digitado pelo usuário. Em Python o processo é o mesmo, só muda a sintaxe: sem declarar o tipo, sem palavra reservada como `var`, é só escolher um nome e atribuir um valor com `=`."
                    },
                    {
                        "type": "code",
                        "value": "nome = \"Maria\"\nidade = 28\naltura = 1.65\nestuda_dados = True\n\nprint(nome, idade, altura, estuda_dados)\n# Saída: Maria 28 1.65 True"
                    },
                    {
                        "type": "text",
                        "value": "## Tipagem dinâmica e nomes de variáveis\n\nRepare que em nenhum momento você disse que `idade` era um número inteiro ou que `nome` era um texto: o Python descobre o tipo sozinho, olhando o valor atribuído. Isso se chama **tipagem dinâmica**, diferente de linguagens como Java, onde você escreveria algo como `int idade = 28`.\n\nUm detalhe que engana muito iniciante: um valor entre aspas é sempre `str`, mesmo que o conteúdo pareça um número. Assim, `codigo = \"28\"` guarda um texto, não um número.\n\nRegras para nomes de variáveis:\n- Podem ter letras, números e underscore (`_`), mas não podem começar com número.\n- Diferenciam maiúsculas de minúsculas: `idade` e `Idade` são variáveis diferentes.\n- Por convenção, use `snake_case` (minúsculas separadas por underscore), como `nome_completo`.\n- Não podem ser palavras reservadas da linguagem, como `if`, `for` ou `print`."
                    },
                    {
                        "type": "code",
                        "value": "# nomes válidos\nnome_completo = \"Ana Souza\"\nidade2 = 30\n_temp = 100\n\n# nomes inválidos (geram erro de sintaxe)\n# 2idade = 30   -> não pode começar com número\n# for = 5       -> for é palavra reservada"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo\", \"Nome em Python\", \"Exemplo\"], [\"Número inteiro\", \"int\", \"idade = 28\"], [\"Número decimal\", \"float\", \"altura = 1.65\"], [\"Texto\", \"str\", \"nome = \\\"Maria\\\"\"], [\"Verdadeiro ou falso\", \"bool\", \"estuda_dados = True\"]]"
                    },
                    {
                        "type": "code",
                        "value": "idade = 28\naltura = 1.65\nnome = \"Maria\"\nestuda_dados = True\n\nprint(type(idade))          # <class 'int'>\nprint(type(altura))         # <class 'float'>\nprint(type(nome))           # <class 'str'>\nprint(type(estuda_dados))   # <class 'bool'>"
                    },
                    {
                        "type": "quote",
                        "value": "Antes de usar uma variável, a lógica já ensinou você a pensar no valor que ela guarda. Em Python, quando bater a dúvida sobre o tipo, é só perguntar para o próprio interpretador com type()."
                    }
                ],
                "questions": [
                    {
                        "statement": "Antes de atribuir um valor a uma variável em Python, é preciso declarar o tipo dela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Não, o Python descobre o tipo pelo valor atribuído",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, toda variável precisa de um tipo declarado antes",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só números precisam de tipo declarado",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, mas é preciso escrever var antes do nome",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nidade = 28\nprint(type(idade))",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "<class 'int'>",
                                "isCorrect": true
                            },
                            {
                                "text": "<class 'float'>",
                                "isCorrect": false
                            },
                            {
                                "text": "28",
                                "isCorrect": false
                            },
                            {
                                "text": "int",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual dos nomes abaixo é um nome de variável válido em Python?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "idade_do_aluno",
                                "isCorrect": true
                            },
                            {
                                "text": "2_idade_do_aluno",
                                "isCorrect": false
                            },
                            {
                                "text": "for",
                                "isCorrect": false
                            },
                            {
                                "text": "nome completo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nvalor = 10\nprint(type(valor))\nvalor = \"dez\"\nprint(type(valor))",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "<class 'int'> e depois <class 'str'>",
                                "isCorrect": true
                            },
                            {
                                "text": "<class 'int'> e depois <class 'int'>",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro, porque o tipo de valor não pode mudar",
                                "isCorrect": false
                            },
                            {
                                "text": "<class 'str'> e depois <class 'str'>",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nidade = \"28\"\nprint(type(idade))",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "<class 'str'>",
                                "isCorrect": true
                            },
                            {
                                "text": "<class 'int'>",
                                "isCorrect": false
                            },
                            {
                                "text": "<class 'float'>",
                                "isCorrect": false
                            },
                            {
                                "text": "<class 'bool'>",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "print e input: mostrando e lendo dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## print e input: a conversa entre programa e usuário\n\nVocê já usou `print()` nas aulas anteriores para mostrar resultados na tela. Na trilha de Lógica, você também usou algo como \"leia\" ou \"mostre\" para representar entrada e saída de dados. Em Python, quem cuida disso é a dupla `print()` (mostrar) e `input()` (ler o que o usuário digita). Vamos ver os dois com mais detalhe."
                    },
                    {
                        "type": "code",
                        "value": "print(\"Nome:\", \"Ana\", \"Idade:\", 28)\n# Saída: Nome: Ana Idade: 28\n\n# por padrão, print() separa os argumentos com um espaço\nprint(1, 2, 3)\n# Saída: 1 2 3"
                    },
                    {
                        "type": "code",
                        "value": "# sep muda o separador entre os argumentos\nprint(\"maçã\", \"banana\", \"uva\", sep=\", \")\n# Saída: maçã, banana, uva\n\n# end muda o que é escrito no final (o padrão é pular para a próxima linha)\nprint(\"Carregando\", end=\"...\")\nprint(\"pronto\")\n# Saída: Carregando...pronto"
                    },
                    {
                        "type": "text",
                        "value": "## input(): lendo o que o usuário digita\n\nA função `input()` pausa o programa, espera o usuário digitar algo e apertar Enter, e devolve o que foi digitado. Você pode passar um texto para `input()` como mensagem para o usuário.\n\nPonto fundamental: **`input()` sempre devolve uma string**, mesmo que a pessoa digite só números. Se você precisar de um número de verdade, vai converter o resultado (você vai ver isso a fundo no próximo módulo, com `int()` e `float()`)."
                    },
                    {
                        "type": "code",
                        "value": "nome = input(\"Qual é o seu nome? \")\nprint(\"Olá,\", nome)\n# se a pessoa digitar Ana:\n# Saída: Olá, Ana\n\nidade = input(\"Qual é a sua idade? \")\nprint(type(idade))\n# Saída: <class 'str'>  (mesmo que a pessoa digite só números, como 28)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Parâmetro\", \"Para que serve\", \"Valor padrão\"], [\"sep\", \"Separador entre os argumentos de print\", \"um espaço\"], [\"end\", \"O que é escrito depois do último argumento\", \"pular para a próxima linha\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "print() é a voz do seu programa, input() é o ouvido. Toda entrada chega como texto, e transformar esse texto no dado certo é o próximo passo da sua jornada em Python."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a função input() retorna, mesmo quando o usuário digita apenas números?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sempre uma string",
                                "isCorrect": true
                            },
                            {
                                "text": "Sempre um número inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre um número decimal",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende do que foi digitado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nprint(1, 2, 3)",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "1 2 3",
                                "isCorrect": true
                            },
                            {
                                "text": "1,2,3",
                                "isCorrect": false
                            },
                            {
                                "text": "123",
                                "isCorrect": false
                            },
                            {
                                "text": "1-2-3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nprint(\"maçã\", \"banana\", sep=\"-\")",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "maçã-banana",
                                "isCorrect": true
                            },
                            {
                                "text": "maçã banana",
                                "isCorrect": false
                            },
                            {
                                "text": "maçã, banana",
                                "isCorrect": false
                            },
                            {
                                "text": "maçã-banana-",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que duas chamadas de print() seguidas apareçam na mesma linha, sem pular para a próxima. Qual parâmetro você usa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "end, definindo um valor sem quebra de linha",
                                "isCorrect": true
                            },
                            {
                                "text": "sep, definindo um valor sem quebra de linha",
                                "isCorrect": false
                            },
                            {
                                "text": "line, definindo o modo de exibição do texto",
                                "isCorrect": false
                            },
                            {
                                "text": "break, desativando a quebra automática",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um programa faz:\n\nnome = input(\"Nome: \")\nprint(\"Olá\", nome, sep=\", \", end=\"!\")\n\nSe o usuário digitar Carla, o que é escrito na tela (sem contar a quebra de linha final)?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Olá, Carla!",
                                "isCorrect": true
                            },
                            {
                                "text": "Olá Carla!",
                                "isCorrect": false
                            },
                            {
                                "text": "Olá, Carla",
                                "isCorrect": false
                            },
                            {
                                "text": "OláCarla!",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Números, strings e operadores",
        "aulas": [
            {
                "titulo": "Números e aritmética (//, %, **)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Números e aritmética em Python\n\nNo Módulo 1 você já viu rapidamente que Python tem tipos como `int` e `float`. Agora é hora de ir a fundo: como Python guarda números, como faz contas com eles, e quais operadores são só dele (spoiler: `//`, `%` e `**` não apareceram na trilha de Lógica, mas fazem toda a diferença no dia a dia de quem trabalha com dados).\n\nUm **int** é um número inteiro, sem casas decimais: `10`, `-3`, `0`, `1500`. Um **float** é um número com casas decimais, mesmo que sejam zero: `10.0`, `3.14`, `-0.5`. Python decide o tipo sozinho, olhando como você escreveu o número: se tem ponto, é `float`; se não tem, é `int`."
                    },
                    {
                        "type": "code",
                        "value": "idade = 25\naltura = 1.68\n\nprint(idade)          # saida: 25\nprint(type(idade))    # saida: <class 'int'>\n\nprint(altura)         # saida: 1.68\nprint(type(altura))   # saida: <class 'float'>\n\n# misturar int e float numa conta sempre gera float\nmedia = (25 + 1.68) / 2\nprint(media)           # saida: 13.34\nprint(type(media))     # saida: <class 'float'>"
                    },
                    {
                        "type": "text",
                        "value": "## Operadores aritméticos: do básico ao que só o Python tem\n\nOs quatro operadores mais conhecidos funcionam como na matemática de sempre: `+` (soma), `-` (subtração), `*` (multiplicação) e `/` (divisão). O detalhe que costuma pegar quem vem de outra linguagem: em Python, `/` **sempre** devolve um `float`, mesmo quando a divisão é exata. `10 / 2` não dá `5`, dá `5.0`.\n\nAlém desses, Python tem três operadores que talvez sejam novidade: `//` (divisão inteira), `%` (resto da divisão) e `**` (potência). Eles aparecem o tempo todo em código de verdade, e são o foco desta aula."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Operador\", \"Significado\", \"Exemplo\", \"Resultado\"], [\"+\", \"soma\", \"10 + 3\", \"13\"], [\"-\", \"subtração\", \"10 - 3\", \"7\"], [\"*\", \"multiplicação\", \"10 * 3\", \"30\"], [\"/\", \"divisão (sempre devolve float)\", \"10 / 4\", \"2.5\"], [\"//\", \"divisão inteira (descarta as casas decimais)\", \"10 // 4\", \"2\"], [\"%\", \"resto da divisão\", \"10 % 3\", \"1\"], [\"**\", \"potência\", \"10 ** 2\", \"100\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# distribuindo 137 registros em páginas de 10 itens cada\nregistros = 137\npor_pagina = 10\n\npaginas_cheias = registros // por_pagina\nprint(paginas_cheias)   # saida: 13\n\nitens_sobrando = registros % por_pagina\nprint(itens_sobrando)   # saida: 7\n\n# o mesmo % que você usou em Lógica pra achar par ou ímpar funciona igual em Python\nnumero = 15\nprint(numero % 2)       # saida: 1 (resto 1, então número é ímpar)"
                    },
                    {
                        "type": "code",
                        "value": "print(2 ** 10)          # saida: 1024\nprint(5 ** 2)            # saida: 25\n\n# cuidado: em Python, ^ não é potência, é o operador bit a bit XOR\nprint(5 ^ 2)             # saida: 7 (não é 25! é outra conta, bit a bit)\n\n# precedência: ** vem antes de * / // %, que vêm antes de + -\nprint(2 + 3 * 4)         # saida: 14 (multiplica 3 * 4 primeiro, depois soma)\nprint((2 + 3) * 4)       # saida: 20 (parênteses forçam a soma primeiro)\nprint(2 * 3 ** 2)        # saida: 18 (potência acontece antes: 3 ** 2 = 9, depois 2 * 9)"
                    },
                    {
                        "type": "quote",
                        "value": "Python separa a aritmética básica (+, -, *) da divisão float (/) e reserva // pra divisão inteira e % pro resto. Some com ** pra potência, e use parênteses sempre que a ordem das contas não for óbvia."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o resultado de print(17 // 5)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "3",
                                "isCorrect": true
                            },
                            {
                                "text": "3.4",
                                "isCorrect": false
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "2",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer calcular 2 elevado a 3 em Python. Qual operador faz isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "**",
                                "isCorrect": true
                            },
                            {
                                "text": "^",
                                "isCorrect": false
                            },
                            {
                                "text": "%%",
                                "isCorrect": false
                            },
                            {
                                "text": "*",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o resultado de print(2 + 3 * 4 ** 2)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "50",
                                "isCorrect": true
                            },
                            {
                                "text": "400",
                                "isCorrect": false
                            },
                            {
                                "text": "196",
                                "isCorrect": false
                            },
                            {
                                "text": "48",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema divide 250 pedidos em lotes de 40 pedidos cada. Qual expressão calcula quantos pedidos sobram no último lote incompleto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "250 % 40",
                                "isCorrect": true
                            },
                            {
                                "text": "250 // 40",
                                "isCorrect": false
                            },
                            {
                                "text": "40 % 250",
                                "isCorrect": false
                            },
                            {
                                "text": "250 / 40",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o resultado de print(10 - 2 ** 2 // 4 + 1)?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "10",
                                "isCorrect": true
                            },
                            {
                                "text": "17",
                                "isCorrect": false
                            },
                            {
                                "text": "9",
                                "isCorrect": false
                            },
                            {
                                "text": "16",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Strings: criar, concatenar, len",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Criando strings: aspas simples e duplas\n\nUma string é uma sequência de caracteres, o tipo `str` que você já viu de relance no Módulo 1. Em Python, aspas simples (`'...'`) e aspas duplas (`\"...\"`) funcionam exatamente da mesma forma, não existe diferença de comportamento entre elas. A escolha é só de estilo, com uma exceção prática: se o texto tem um apóstrofo dentro, é mais fácil usar aspas duplas por fora (e vice-versa), pra não precisar escapar nada."
                    },
                    {
                        "type": "code",
                        "value": "nome = 'Ana'\ncidade = \"São Paulo\"\n\nprint(nome)      # saida: Ana\nprint(cidade)    # saida: São Paulo\n\n# aspas duplas por fora evitam ter que escapar o apóstrofo\nfrase = \"Ana disse: 'vamos estudar dados'\"\nprint(frase)     # saida: Ana disse: 'vamos estudar dados'\n\n# e aspas simples por fora evitam escapar as aspas duplas\nfrase2 = 'A cidade é \"linda\" no verão'\nprint(frase2)    # saida: A cidade é \"linda\" no verão"
                    },
                    {
                        "type": "text",
                        "value": "## Strings de várias linhas e quebras de linha\n\nPara um texto que ocupa mais de uma linha, use aspas triplas, `'''` ou `\"\"\"`. Tudo que está entre elas vira uma única string, com as quebras de linha exatamente onde você digitou. É o mesmo recurso que mais pra frente vira docstring (a documentação de uma função), mas por enquanto vale só como string mesmo.\n\nOutra forma de quebrar linha, mesmo dentro de uma string de aspas simples, é usando `\\n`: esse par de caracteres representa uma quebra de linha quando a string é exibida."
                    },
                    {
                        "type": "code",
                        "value": "aviso = \"\"\"Bem-vindo ao curso de Python!\nEste módulo cobre números, strings e operadores.\nBons estudos.\"\"\"\nprint(aviso)\n# saida:\n# Bem-vindo ao curso de Python!\n# Este módulo cobre números, strings e operadores.\n# Bons estudos.\n\nrecado = \"Linha 1\\nLinha 2\"\nprint(recado)\n# saida:\n# Linha 1\n# Linha 2"
                    },
                    {
                        "type": "text",
                        "value": "## Concatenar, repetir e medir\n\nPara juntar duas strings, use `+`: ele gruda uma string na outra, sem adicionar espaço nenhum entre elas (diferente do `print()`, que separa os valores com espaço automaticamente). Para repetir uma string várias vezes, use `*` seguido de um número inteiro, útil pra criar separadores visuais rapidinho. E pra saber quantos caracteres uma string tem, incluindo espaços, use `len()`.\n\nUm erro comum de quem está começando: tentar somar `str` com `int` direto no `+`, como em `\"Idade: \" + 25`. Python recusa e lança um erro (`TypeError`), porque `+` entre tipos diferentes não faz sentido pra ele. A solução é converter o número pra texto antes, com `str()`."
                    },
                    {
                        "type": "code",
                        "value": "primeiro = \"Ana\"\nsobrenome = \"Silva\"\nnome_completo = primeiro + \" \" + sobrenome\nprint(nome_completo)     # saida: Ana Silva\n\nseparador = \"-\" * 20\nprint(separador)         # saida: --------------------\n\ntitulo = \"Relatório\"\nprint(len(titulo))       # saida: 9\n\nidade = 25\n# print(\"Idade: \" + idade)     # TypeError: não dá pra somar str com int direto\nprint(\"Idade: \" + str(idade))  # saida: Idade: 25"
                    },
                    {
                        "type": "quote",
                        "value": "Strings se juntam com +, se repetem com *, e len() conta os caracteres, inclusive espaços. Aspas simples ou duplas dão no mesmo: escolha a que deixar o texto mais fácil de escrever."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o resultado de print(len(\"Python\"))?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "6",
                                "isCorrect": true
                            },
                            {
                                "text": "5",
                                "isCorrect": false
                            },
                            {
                                "text": "7",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o resultado de print(\"Data\" + \"Science\")?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "DataScience",
                                "isCorrect": true
                            },
                            {
                                "text": "Data Science",
                                "isCorrect": false
                            },
                            {
                                "text": "ScienceData",
                                "isCorrect": false
                            },
                            {
                                "text": "Data+Science",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A variável nota guarda o valor inteiro 8. Qual das linhas abaixo causa um erro (TypeError) ao rodar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "print(\"Nota: \" + nota)",
                                "isCorrect": true
                            },
                            {
                                "text": "print(\"Nota: \" + str(nota))",
                                "isCorrect": false
                            },
                            {
                                "text": "print(f\"Nota: {nota}\")",
                                "isCorrect": false
                            },
                            {
                                "text": "print(\"Nota:\", nota)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A variável texto guarda a string \"\"\"Ana\\nBeatriz\"\"\" (aspas triplas, com uma quebra de linha real entre Ana e Beatriz). Qual é o resultado de print(len(texto))?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "11",
                                "isCorrect": true
                            },
                            {
                                "text": "10",
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
                        "statement": "A variável nome guarda \"Bia\". Qual é o resultado de print((\"Oi \" * 2) + nome + \"!\")?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Oi Oi Bia!",
                                "isCorrect": true
                            },
                            {
                                "text": "OiOi Bia!",
                                "isCorrect": false
                            },
                            {
                                "text": "Oi Oi  Bia!",
                                "isCorrect": false
                            },
                            {
                                "text": "Oi Oi Bia !",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "f-strings e métodos de string",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## f-strings: o jeito moderno de formatar texto\n\nAté agora, pra misturar texto e variáveis você teria que concatenar com `+` e converter números com `str()`. Funciona, mas cansa rápido. Python tem um jeito bem mais direto: as **f-strings**.\n\nUma f-string é uma string comum com um `f` colado antes da aspa de abertura. Dentro dela, qualquer trecho entre chaves `{}` é avaliado como código Python, e o resultado entra no texto automaticamente, sem precisar de `+` nem de `str()`."
                    },
                    {
                        "type": "code",
                        "value": "nome = \"Marina\"\nidade = 28\nprint(f\"{nome} tem {idade} anos\")\n# saida: Marina tem 28 anos\n\n# dentro das chaves dá até pra fazer uma conta\npreco = 40\nprint(f\"Com 10% de desconto: {preco * 0.9}\")\n# saida: Com 10% de desconto: 36.0\n\n# formatando casas decimais, ótimo pra médias, preços e outros números de dados\nmedia = 7.6666666\nprint(f\"Média: {media:.2f}\")\n# saida: Média: 7.67"
                    },
                    {
                        "type": "text",
                        "value": "## Métodos de string: verbos que o texto sabe fazer\n\nAlém das f-strings, toda string em Python vem com um conjunto de **métodos** prontos: funções já coladas no valor, chamadas com um ponto depois da variável, como `texto.upper()`. Eles resolvem tarefas comuns, como transformar maiúsculas em minúsculas, tirar espaço sobrando ou dividir um texto em pedaços.\n\nUm detalhe que costuma pegar iniciante: strings em Python são **imutáveis**. Nenhum método muda a string original, todos devolvem uma string **nova**. Se você não guardar o resultado numa variável, o valor formatado se perde."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método\", \"O que faz\", \"Exemplo\", \"Resultado\"], [\"upper()\", \"deixa tudo em maiúsculas\", \"\\\"dados\\\".upper()\", \"'DADOS'\"], [\"lower()\", \"deixa tudo em minúsculas\", \"\\\"DADOS\\\".lower()\", \"'dados'\"], [\"strip()\", \"remove espaços do início e do fim\", \"\\\"  dados  \\\".strip()\", \"'dados'\"], [\"replace(a, b)\", \"troca todas as ocorrências de a por b\", \"\\\"a-b-c\\\".replace(\\\"-\\\", \\\"_\\\")\", \"'a_b_c'\"], [\"split(sep)\", \"divide a string numa lista, usando sep como corte\", \"\\\"a,b,c\\\".split(\\\",\\\")\", \"['a', 'b', 'c']\"], [\"find(sub)\", \"posição da 1ª ocorrência de sub (ou -1 se não achar)\", \"\\\"dados\\\".find(\\\"do\\\")\", \"2\"]]"
                    },
                    {
                        "type": "code",
                        "value": "texto = \"Ciência de Dados\"\nprint(texto.upper())     # saida: CIÊNCIA DE DADOS\nprint(texto.lower())     # saida: ciência de dados\n\nbruto = \"   python   \"\nprint(bruto.strip())      # saida: python (sem os espaços das pontas)\nprint(len(bruto))         # saida: 12 (conta os espaços também)\nprint(len(bruto.strip())) # saida: 6\n\n# imutabilidade: nenhum método muda a variável original\nprint(texto)               # saida: Ciência de Dados (continua igual)"
                    },
                    {
                        "type": "code",
                        "value": "frase = \"python-para-dados\"\nprint(frase.replace(\"-\", \" \"))   # saida: python para dados\nprint(frase)                        # saida: python-para-dados (original não muda)\n\npartes = frase.split(\"-\")\nprint(partes)              # saida: ['python', 'para', 'dados']\nprint(len(partes))         # saida: 3\n\nemail = \"contato@ensina.dev\"\nprint(email.find(\"@\"))     # saida: 7"
                    },
                    {
                        "type": "quote",
                        "value": "f-strings colocam variáveis dentro do texto só com um f antes da aspa e chaves ao redor do valor. E lembre-se: todo método de string devolve uma string nova, a original nunca muda."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a forma correta de criar uma f-string em Python?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "f\"Olá, {nome}\"",
                                "isCorrect": true
                            },
                            {
                                "text": "\"Olá, {nome}\"",
                                "isCorrect": false
                            },
                            {
                                "text": "f\"Olá, [nome]\"",
                                "isCorrect": false
                            },
                            {
                                "text": "$\"Olá, {nome}\"",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As variáveis produto = \"Caderno\" e preco = 12 já existem. Qual é o resultado de print(f\"{produto}: R$ {preco}\")?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Caderno: R$ 12",
                                "isCorrect": true
                            },
                            {
                                "text": "produto: R$ preco",
                                "isCorrect": false
                            },
                            {
                                "text": "{produto}: R$ {preco}",
                                "isCorrect": false
                            },
                            {
                                "text": "Caderno: R$ {preco}",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A variável texto guarda \"  Dados em Python  \" (com espaços nas pontas). Qual é o resultado de print(texto.strip().upper())?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "DADOS EM PYTHON",
                                "isCorrect": true
                            },
                            {
                                "text": "  DADOS EM PYTHON  ",
                                "isCorrect": false
                            },
                            {
                                "text": "Dados em Python",
                                "isCorrect": false
                            },
                            {
                                "text": "dados em python",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A variável frase guarda \"dado bruto\". O código chama frase.upper() mas não guarda o resultado em lugar nenhum. Qual é o resultado de print(frase) logo depois?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "dado bruto",
                                "isCorrect": true
                            },
                            {
                                "text": "DADO BRUTO",
                                "isCorrect": false
                            },
                            {
                                "text": "Dado Bruto",
                                "isCorrect": false
                            },
                            {
                                "text": "None",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A variável titulo guarda \"  ciência de dados  \" (com espaços nas pontas). Depois de limpo = titulo.strip().replace(\"ê\", \"e\"), qual é o resultado de print(f\"[{limpo.upper()}]\")?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "[CIENCIA DE DADOS]",
                                "isCorrect": true
                            },
                            {
                                "text": "[ciencia de dados]",
                                "isCorrect": false
                            },
                            {
                                "text": "[CIÊNCIA DE DADOS]",
                                "isCorrect": false
                            },
                            {
                                "text": "  [CIENCIA DE DADOS]  ",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Fatiamento de strings",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Cada caractere tem uma posição (index)\n\nPython enxerga uma string como uma sequência de caracteres, e cada um deles tem uma posição, chamada de **índice** (index). Aqui vai o detalhe que mais pega quem está começando: **a contagem começa em 0**, não em 1. O primeiro caractere está na posição `0`, o segundo na posição `1`, e assim por diante.\n\nPython também aceita índices negativos, contando de trás pra frente: `-1` é sempre o último caractere, `-2` o penúltimo, e assim por diante. É uma forma rápida de pegar o final de uma string sem precisar calcular o tamanho dela primeiro."
                    },
                    {
                        "type": "code",
                        "value": "linguagem = \"Python\"\nprint(linguagem[0])    # saida: P\nprint(linguagem[1])    # saida: y\nprint(linguagem[5])    # saida: n\n\nprint(linguagem[-1])   # saida: n (último caractere)\nprint(linguagem[-2])   # saida: o (penúltimo)\n\n# linguagem[10] daria erro: IndexError: string index out of range"
                    },
                    {
                        "type": "text",
                        "value": "## Fatiamento: pegando um pedaço da string\n\nPara pegar mais de um caractere de uma vez, use o **fatiamento** (slicing): `string[inicio:fim]`. Ele devolve tudo a partir da posição `inicio` até a posição `fim`, **sem incluir** o caractere que está em `fim`. É o segundo detalhe que costuma confundir: `fim` marca onde o corte para, não a última posição incluída.\n\nSe você omitir `inicio`, o fatiamento começa do 0. Se omitir `fim`, ele vai até o final da string. E `string[:]`, com os dois omitidos, devolve uma cópia da string inteira."
                    },
                    {
                        "type": "code",
                        "value": "linguagem = \"Python\"\nprint(linguagem[0:4])   # saida: Pyth (posições 0, 1, 2 e 3; a posição 4 fica de fora)\nprint(linguagem[2:6])   # saida: thon\n\nprint(linguagem[:4])    # saida: Pyth (começa do 0 por padrão)\nprint(linguagem[2:])    # saida: thon (vai até o final por padrão)\nprint(linguagem[:])     # saida: Python (cópia da string inteira)\n\nprint(linguagem[-4:])   # saida: thon (os 4 últimos caracteres)"
                    },
                    {
                        "type": "text",
                        "value": "## O terceiro número: o passo\n\nO fatiamento aceita um terceiro valor: `string[inicio:fim:passo]`. O `passo` diz de quantos em quantos caracteres o fatiamento avança. Com passo `2`, por exemplo, ele pega um caractere e pula o seguinte.\n\nUm passo negativo inverte a direção da leitura, andando de trás pra frente. É por isso que `string[::-1]` virou um truque clássico em Python pra inverter uma string inteira: começo e fim omitidos (string inteira) com passo `-1` (de trás pra frente)."
                    },
                    {
                        "type": "code",
                        "value": "alfabeto = \"abcdefgh\"\nprint(alfabeto[::2])     # saida: aceg (pula de 2 em 2)\nprint(alfabeto[1::2])    # saida: bdfh (começa no índice 1, pula de 2 em 2)\n\npalavra = \"dados\"\nprint(palavra[::-1])     # saida: sodad (a string inteira, invertida)\nprint(palavra[3:0:-1])   # saida: oda (de trás pra frente, do índice 3 até o 1)"
                    },
                    {
                        "type": "quote",
                        "value": "Índice começa em 0, e em string[inicio:fim] o fim nunca entra no resultado. Com um passo negativo, string[::-1] inverte qualquer texto numa linha só."
                    }
                ],
                "questions": [
                    {
                        "statement": "No Python, qual é o índice do primeiro caractere de uma string?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "0",
                                "isCorrect": true
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "-1",
                                "isCorrect": false
                            },
                            {
                                "text": "2",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A variável linguagem guarda \"Dados\". Qual é o resultado de print(linguagem[-1])?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "s",
                                "isCorrect": true
                            },
                            {
                                "text": "D",
                                "isCorrect": false
                            },
                            {
                                "text": "a",
                                "isCorrect": false
                            },
                            {
                                "text": "o",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A variável palavra guarda \"Estatistica\". Qual é o resultado de print(palavra[0:5])?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Estat",
                                "isCorrect": true
                            },
                            {
                                "text": "Estati",
                                "isCorrect": false
                            },
                            {
                                "text": "statis",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatis",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A variável numeros guarda \"0123456789\". Qual é o resultado de print(numeros[2:9:2])?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "2468",
                                "isCorrect": true
                            },
                            {
                                "text": "234567",
                                "isCorrect": false
                            },
                            {
                                "text": "246",
                                "isCorrect": false
                            },
                            {
                                "text": "13579",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A variável texto guarda \"programar\". Qual é o resultado de print(texto[::-1][0:4])?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "rama",
                                "isCorrect": true
                            },
                            {
                                "text": "gorp",
                                "isCorrect": false
                            },
                            {
                                "text": "prog",
                                "isCorrect": false
                            },
                            {
                                "text": "ramar",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Booleanos, conversão de tipos e operadores",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Booleanos e operadores de comparação\n\nPython tem um tipo pra representar só duas respostas possíveis: verdadeiro ou falso. É o `bool`, e seus dois únicos valores são `True` e `False` (sempre com a primeira letra maiúscula, é assim que Python reconhece). Você já usa booleanos sem perceber: toda comparação que você faz devolve um deles.\n\nOs operadores de comparação são `==` (igual), `!=` (diferente), `<` (menor), `>` (maior), `<=` (menor ou igual) e `>=` (maior ou igual). Cada um compara dois valores e devolve `True` ou `False`. E quando você precisa combinar mais de uma comparação numa condição só, entram os operadores lógicos `and`, `or` e `not`, que você vê na tabela a seguir."
                    },
                    {
                        "type": "code",
                        "value": "nota = 8.5\nprint(nota >= 7)        # saida: True\nprint(nota == 10)        # saida: False\nprint(nota != 10)         # saida: True\n\nidade_minima = 18\nidade = 16\nprint(idade < idade_minima)          # saida: True\nprint(type(idade < idade_minima))    # saida: <class 'bool'>"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Operador\", \"O que faz\", \"Exemplo\", \"Resultado\"], [\"==\", \"verifica se são iguais\", \"5 == 5\", \"True\"], [\"!=\", \"verifica se são diferentes\", \"5 != 3\", \"True\"], [\"<\", \"menor que\", \"3 < 5\", \"True\"], [\">\", \"maior que\", \"3 > 5\", \"False\"], [\"<=\", \"menor ou igual\", \"5 <= 5\", \"True\"], [\">=\", \"maior ou igual\", \"4 >= 5\", \"False\"], [\"and\", \"verdadeiro só se os dois lados forem verdadeiros\", \"True and False\", \"False\"], [\"or\", \"verdadeiro se pelo menos um lado for verdadeiro\", \"True or False\", \"True\"], [\"not\", \"inverte o valor\", \"not True\", \"False\"]]"
                    },
                    {
                        "type": "code",
                        "value": "nota = 8.5\npresencas = 16\naprovado = nota >= 7 and presencas >= 15\nprint(aprovado)          # saida: True\n\nbolsista = False\nnota_alta = True\nmerece_desconto = bolsista or nota_alta\nprint(merece_desconto)    # saida: True\n\nativo = True\nprint(not ativo)           # saida: False\n\n# == compara, = atribui: são coisas diferentes\nidade = 18\nprint(idade == 18)          # saida: True (comparação)\n# if idade = 18:            # SyntaxError: Python nem deixa rodar um \"=\" dentro de um if\n#     print(\"maior de idade\")"
                    },
                    {
                        "type": "text",
                        "value": "## Convertendo tipos: int(), float(), str(), bool()\n\nMuitas vezes um valor está no tipo errado pro que você precisa: um número chega como texto (digitado num `input()`, por exemplo) e você precisa somar com ele, ou o contrário. Pra isso existem quatro funções de conversão: `int()`, `float()`, `str()` e `bool()`. Cada uma tenta transformar o valor recebido no tipo correspondente.\n\nDuas armadilhas clássicas: `int(\"3.5\")` dá erro (`ValueError`), porque o texto tem um ponto decimal e `int()` não sabe interpretar isso direto, o caminho certo é `int(float(\"3.5\"))`. E `int(3.9)` não arredonda pra `4`: ele **trunca**, descarta a parte decimal e fica só com `3`."
                    },
                    {
                        "type": "code",
                        "value": "print(int(\"42\"))              # saida: 42\nprint(float(\"3.14\"))           # saida: 3.14\nprint(str(100) + \"%\")           # saida: 100%\nprint(bool(1), bool(0))          # saida: True False\n\n# int(3.9) não arredonda, trunca (descarta a parte decimal)\nprint(int(3.9))                   # saida: 3\n\n# int(\"3.5\") direto dá erro (o ponto decimal confunde o int)\n# print(int(\"3.5\"))               # ValueError: invalid literal for int() with base 10: '3.5'\nprint(int(float(\"3.5\")))          # saida: 3 (primeiro vira float, só depois trunca)\n\n# cuidado: bool() de qualquer texto não vazio é True, mesmo \"False\" escrito como string\nprint(bool(\"\"))                    # saida: False\nprint(bool(\"False\"))               # saida: True"
                    },
                    {
                        "type": "quote",
                        "value": "Toda comparação devolve um bool, and/or/not combinam booleanos, e == compara enquanto = atribui, nunca confunda os dois. Pra trocar de tipo, int(), float(), str() e bool() resolvem, mas int() trunca, não arredonda."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o resultado de print(10 > 7)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "True",
                                "isCorrect": true
                            },
                            {
                                "text": "False",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "10 > 7",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual operador é usado para comparar se dois valores são iguais em Python (sem atribuir nada)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "==",
                                "isCorrect": true
                            },
                            {
                                "text": "=",
                                "isCorrect": false
                            },
                            {
                                "text": "!=",
                                "isCorrect": false
                            },
                            {
                                "text": "<=",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o resultado de print(int(7.8))?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "7",
                                "isCorrect": true
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            },
                            {
                                "text": "7.0",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As variáveis nota = 6 e presencas = 18 já existem. Qual é o resultado de print(nota >= 7 and presencas >= 15)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "False",
                                "isCorrect": true
                            },
                            {
                                "text": "True",
                                "isCorrect": false
                            },
                            {
                                "text": "6",
                                "isCorrect": false
                            },
                            {
                                "text": "None",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As variáveis a = \"10\" e b = 5 já existem. Qual é o resultado de print(int(a) > b and bool(a))?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "True",
                                "isCorrect": true
                            },
                            {
                                "text": "False",
                                "isCorrect": false
                            },
                            {
                                "text": "10",
                                "isCorrect": false
                            },
                            {
                                "text": "TypeError",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Controle de fluxo",
        "aulas": [
            {
                "titulo": "If, elif, else: como o Python decide",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Controle de fluxo: ensinando o programa a decidir e repetir\n\nAté aqui você viu o vocabulário do Python: números, strings, operadores. A partir de agora o programa ganha vida de verdade, porque ele passa a **decidir** (fazer uma coisa ou outra, dependendo da situação) e **repetir** (executar o mesmo trecho várias vezes, sem copiar e colar código). Isso é controle de fluxo, e é o assunto deste módulo inteiro.\n\nSe você fez a trilha de Lógica de Programação, o \"se isso, então aquilo, senão aquilo outro\" e os laços já são ideias conhecidas. O que falta é a sintaxe real do Python: como escrever isso em código que roda de verdade."
                    },
                    {
                        "type": "text",
                        "value": "## O `if`: a decisão mais simples\n\nUm `if` testa uma condição. Se ela for `True`, o bloco indentado logo abaixo roda; se for `False`, o Python pula o bloco inteiro e segue o programa.\n\nDuas regras que não existem em linguagens com chaves:\n\n- A linha do `if` (e depois `elif`, `else`, `for`, `while`) termina com dois-pontos (`:`).\n- O código que pertence a esse bloco fica **indentado** (o padrão da comunidade Python é 4 espaços). É a indentação que marca onde o bloco começa e termina, não um `end` nem uma chave."
                    },
                    {
                        "type": "code",
                        "value": "idade = 20\n\nif idade >= 18:\n    print('Pode dirigir')\nelse:\n    print('Ainda não pode dirigir')\n# Saída:\n# Pode dirigir"
                    },
                    {
                        "type": "text",
                        "value": "## `elif` e a decisão encadeada\n\nO `else` roda quando a condição do `if` é falsa. Quando existem várias condições possíveis, não só duas, o `elif` (contração de \"else if\") entra em cena: ele testa mais uma condição sem precisar aninhar um `if` dentro do outro.\n\nO Python avalia de cima pra baixo e **para no primeiro bloco cuja condição for `True`**. Se nenhuma bater, o `else` final roda. E dá pra combinar comparações (`==`, `>=`, `!=`) com operadores lógicos (`and`, `or`, `not`) na mesma condição."
                    },
                    {
                        "type": "code",
                        "value": "nota = 7\nfrequencia = 85\n\nif nota >= 9 and frequencia >= 75:\n    print('Aprovado com conceito A')\nelif nota >= 7 and frequencia >= 75:\n    print('Aprovado com conceito B')\nelif frequencia < 75:\n    print('Reprovado por falta')\nelse:\n    print('Reprovado por nota')\n# Saída:\n# Aprovado com conceito B"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Operador\", \"O que faz\", \"Exemplo\", \"Resultado\"], [\"==\", \"compara se é igual\", \"5 == 5\", \"True\"], [\"!=\", \"compara se é diferente\", \"5 != 3\", \"True\"], [\">=\", \"maior ou igual a\", \"18 >= 18\", \"True\"], [\"and\", \"True só se os dois lados forem True\", \"True and False\", \"False\"], [\"or\", \"True se pelo menos um lado for True\", \"True or False\", \"True\"], [\"not\", \"inverte o valor lógico\", \"not True\", \"False\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um `if` é uma pergunta de sim ou não; cada `elif` encadeia mais uma pergunta; o `else` é a resposta padrão quando nenhuma pergunta anterior foi respondida com sim."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em Python, o que precisa vir no final da linha de um `if` para o bloco indentado funcionar corretamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um ponto e vírgula, como no fim de outras instruções",
                                "isCorrect": false
                            },
                            {
                                "text": "Dois-pontos, indicando que o bloco indentado vem a seguir",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma chave de abertura, como em outras linguagens",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum símbolo, a quebra de linha já é suficiente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\n```\nx = 7\n\nif x > 10:\n    print('alto')\nelif x > 5:\n    print('médio')\nelif x > 0:\n    print('baixo')\nelse:\n    print('zero')\n```",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "alto",
                                "isCorrect": false
                            },
                            {
                                "text": "médio",
                                "isCorrect": true
                            },
                            {
                                "text": "baixo",
                                "isCorrect": false
                            },
                            {
                                "text": "zero",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na condição `idade >= 18 and tem_carteira`, quando o resultado é `True`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Somente quando as duas condições são verdadeiras",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando pelo menos uma das duas condições é verdadeira",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre que a idade for maior ou igual a 18",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente quando as duas condições são falsas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\n```\nnota = 95\n\nif nota >= 50:\n    print('aprovado')\nelif nota >= 90:\n    print('destaque')\nelse:\n    print('reprovado')\n```",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "aprovado",
                                "isCorrect": true
                            },
                            {
                                "text": "destaque",
                                "isCorrect": false
                            },
                            {
                                "text": "reprovado",
                                "isCorrect": false
                            },
                            {
                                "text": "excelente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o erro no trecho de código abaixo?\n\n```\nidade = 18\n\nif idade = 18:\n    print('Maioridade')\n```",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usa `=` (atribuição) no lugar de `==` (comparação)",
                                "isCorrect": true
                            },
                            {
                                "text": "A variável `idade` não foi criada antes do `if`",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta um `elif` ou `else` depois desse `if`",
                                "isCorrect": false
                            },
                            {
                                "text": "O `print` está fora do bloco indentado do `if`",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Laço for e range: repetindo sem copiar e colar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O laço `for`: repetindo sem copiar e colar\n\nVocê já viu, em Lógica de Programação, que um laço repete um bloco de instruções várias vezes. Em Python, o jeito mais comum de repetir é o `for`, e ele tem uma particularidade importante: ao contrário de várias linguagens, o `for` do Python não conta números de índice por padrão. Ele **percorre os elementos de uma sequência, um por um**."
                    },
                    {
                        "type": "code",
                        "value": "frutas = ['maçã', 'banana', 'uva']\n\nfor fruta in frutas:\n    print(fruta)\n# Saída:\n# maçã\n# banana\n# uva"
                    },
                    {
                        "type": "text",
                        "value": "## Elementos, não índices\n\nRepare que `fruta` recebe direto cada valor da lista, não a posição (0, 1, 2...). Isso é o **for pythônico**: você pensa \"para cada item nessa coleção\", não \"para i de 0 até o tamanho da lista\". E funciona pra qualquer sequência, inclusive strings, onde cada elemento é um caractere.\n\nQuando você realmente precisa de uma faixa de números (contar de 0 a 10, repetir 5 vezes, andar de 2 em 2), existe a função `range()`."
                    },
                    {
                        "type": "code",
                        "value": "for letra in 'Python':\n    print(letra)\n# Saída:\n# P\n# y\n# t\n# h\n# o\n# n\n\nfor numero in range(5):\n    print(numero)\n# Saída:\n# 0\n# 1\n# 2\n# 3\n# 4"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Forma\", \"Significado\", \"Exemplo\", \"Resultado\"], [\"range(fim)\", \"de 0 até fim, sem incluir fim\", \"range(5)\", \"0, 1, 2, 3, 4\"], [\"range(inicio, fim)\", \"de início até fim, sem incluir fim\", \"range(2, 6)\", \"2, 3, 4, 5\"], [\"range(inicio, fim, passo)\", \"de início até fim, andando de passo em passo\", \"range(0, 10, 2)\", \"0, 2, 4, 6, 8\"], [\"range(inicio, fim, passo negativo)\", \"contagem regressiva\", \"range(5, 0, -1)\", \"5, 4, 3, 2, 1\"]]"
                    },
                    {
                        "type": "code",
                        "value": "precos = [10, 25, 40]\n\nfor i in range(len(precos)):\n    print(f'Item {i}: R$ {precos[i]}')\n# Saída:\n# Item 0: R$ 10\n# Item 1: R$ 25\n# Item 2: R$ 40"
                    },
                    {
                        "type": "quote",
                        "value": "O for pythônico não pergunta \"em qual posição estou?\", pergunta \"qual é o próximo item?\". Use `range()` só quando precisar mesmo dos números."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o comando `range(5)` gera, quando usado num `for`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os números de 0 até 4",
                                "isCorrect": true
                            },
                            {
                                "text": "Os números de 1 até 5",
                                "isCorrect": false
                            },
                            {
                                "text": "Os números de 0 até 5",
                                "isCorrect": false
                            },
                            {
                                "text": "Os números de 1 até 4",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\n```\nnumeros = [10, 20, 30]\n\nfor n in numeros:\n    print(n * 2)\n```",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "20, 40 e 60",
                                "isCorrect": true
                            },
                            {
                                "text": "10, 20 e 30",
                                "isCorrect": false
                            },
                            {
                                "text": "5, 10 e 15",
                                "isCorrect": false
                            },
                            {
                                "text": "0, 1 e 2",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\n```\nfor i in range(2, 10, 3):\n    print(i)\n```",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "2, 5 e 8",
                                "isCorrect": true
                            },
                            {
                                "text": "2, 5, 8 e 10",
                                "isCorrect": false
                            },
                            {
                                "text": "3, 6 e 9",
                                "isCorrect": false
                            },
                            {
                                "text": "2, 4, 6 e 8",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que `for nome in nomes:` é considerado mais pythônico do que `for i in range(len(nomes)):` para percorrer uma lista?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque acessa os elementos direto, sem calcular índices",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque roda mais rápido em qualquer situação, sem exceção",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque é a única forma que funciona com listas de números",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque evita que a lista seja alterada durante o laço",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\n```\ntotal = 0\nfor c in 'abc':\n    total = total + 1\n\nprint(total)\n```",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "3",
                                "isCorrect": true
                            },
                            {
                                "text": "abc",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Laço while, break e continue",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O laço `while`: repetir enquanto for verdade\n\nO `for` é ótimo quando você sabe, de antemão, sobre qual sequência (ou quantas vezes) vai repetir. Mas às vezes você não sabe quantas voltas serão necessárias, só sabe a **condição** que precisa continuar verdadeira. Pra isso existe o `while`, o mesmo \"repita enquanto\" que você já viu em Lógica de Programação.\n\nA sintaxe segue o mesmo padrão do `if`: dois-pontos e bloco indentado. A diferença é que o `while` volta pro topo e testa a condição de novo a cada repetição, até ela virar `False`."
                    },
                    {
                        "type": "code",
                        "value": "contador = 5\n\nwhile contador > 0:\n    print(contador)\n    contador = contador - 1\n\nprint('Fim da contagem')\n# Saída:\n# 5\n# 4\n# 3\n# 2\n# 1\n# Fim da contagem"
                    },
                    {
                        "type": "text",
                        "value": "## Cuidado com o laço infinito\n\nTodo `while` depende de alguma variável mudar dentro do laço até a condição ficar `False`. Se você esquecer de atualizar essa variável, a condição nunca vira falsa e o programa **trava, repetindo pra sempre**. No exemplo acima, se a linha `contador = contador - 1` sumisse, `contador > 0` seria sempre verdadeira.\n\nRegra prática: antes de rodar um `while`, confira se existe, dentro do bloco, uma linha que empurra a condição pra perto de `False`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"Use\", \"Exemplo\"], [\"Sabe a sequência ou a quantidade exata de repetições\", \"for\", \"for item in lista\"], [\"Depende de uma condição que só se sabe em tempo de execução\", \"while\", \"while saldo > 0\"], [\"Quer contar de 0 até um número fixo\", \"for com range\", \"for i in range(10)\"], [\"Quer repetir até o usuário digitar algo específico\", \"while\", \"while resposta != 'sair'\"]]"
                    },
                    {
                        "type": "code",
                        "value": "numeros = [4, 9, 15, 22, 7]\n\nfor n in numeros:\n    if n > 20:\n        print(f'Achei um valor maior que 20: {n}')\n        break\n    print(f'Verificando {n}')\n# Saída:\n# Verificando 4\n# Verificando 9\n# Verificando 15\n# Achei um valor maior que 20: 22"
                    },
                    {
                        "type": "code",
                        "value": "numeros = [4, 9, 15, 22, 7]\n\nfor n in numeros:\n    if n % 2 == 0:\n        continue\n    print(n)\n# Saída:\n# 9\n# 15\n# 7"
                    },
                    {
                        "type": "quote",
                        "value": "`break` diz \"pare tudo agora\"; `continue` diz \"pule só essa volta e siga pra próxima\". Nenhum dos dois substitui uma condição bem pensada, mas os dois deixam o código mais direto."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a saída do código abaixo?\n\n```\nn = 3\n\nwhile n > 0:\n    print(n)\n    n = n - 1\n```",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "3, 2 e 1",
                                "isCorrect": true
                            },
                            {
                                "text": "3, 2, 1 e 0",
                                "isCorrect": false
                            },
                            {
                                "text": "1, 2 e 3",
                                "isCorrect": false
                            },
                            {
                                "text": "4, 3, 2 e 1",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das situações abaixo entra em laço infinito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um `while` cuja condição nunca muda, porque a variável não é atualizada",
                                "isCorrect": true
                            },
                            {
                                "text": "Um `while` cuja variável de controle diminui a cada repetição até zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Um `while` cuja variável de controle aumenta a cada repetição até um limite",
                                "isCorrect": false
                            },
                            {
                                "text": "Um `for` que percorre do início ao fim uma lista com cinco elementos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\n```\nfor n in [1, 2, 3, 4, 5]:\n    if n == 3:\n        continue\n    print(n)\n```",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "1, 2, 4 e 5",
                                "isCorrect": true
                            },
                            {
                                "text": "1, 2, 3 e 4",
                                "isCorrect": false
                            },
                            {
                                "text": "2, 3, 4 e 5",
                                "isCorrect": false
                            },
                            {
                                "text": "1, 3, 4 e 5",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\n```\nn = 1\n\nwhile True:\n    if n > 3:\n        break\n    print(n)\n    n = n + 1\n```",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "1, 2 e 3, o `break` corta antes do 4",
                                "isCorrect": true
                            },
                            {
                                "text": "1, 2, 3 e 4, todos antes do `break`",
                                "isCorrect": false
                            },
                            {
                                "text": "1 e 2, o `break` age antes do print",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma, entra em laço infinito",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença entre `break` e `continue` dentro de um laço?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`break` encerra o laço; `continue` pula pra próxima repetição",
                                "isCorrect": true
                            },
                            {
                                "text": "`break` pula pra próxima repetição; `continue` encerra o laço",
                                "isCorrect": false
                            },
                            {
                                "text": "`break` e `continue` sempre fazem exatamente a mesma coisa",
                                "isCorrect": false
                            },
                            {
                                "text": "`break` encerra o programa inteiro; `continue` encerra só o laço",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Acumulando valores num laço",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O padrão de acumular: a base de somar e contar\n\nBoa parte do trabalho com dados começa com a mesma receita: percorrer uma coleção de valores e ir **acumulando** um resultado (soma, contagem, maior valor, menor valor). O padrão sempre tem três partes:\n\n1. Cria a variável acumuladora **antes** do laço, com um valor inicial (0 pra soma e contagem, por exemplo).\n2. **Atualiza** essa variável a cada repetição, dentro do laço.\n3. Usa o resultado final **depois** que o laço termina.\n\nEsquecer o passo 1 (ou colocar a variável dentro do laço, sendo reiniciada a cada volta) é um dos erros mais comuns de quem está aprendendo."
                    },
                    {
                        "type": "code",
                        "value": "notas = [7.5, 8.0, 6.5, 9.0]\n\nsoma = 0\nfor nota in notas:\n    soma = soma + nota\n\nprint(f'Soma: {soma}')\nprint(f'Média: {soma / len(notas)}')\n# Saída:\n# Soma: 31.0\n# Média: 7.75"
                    },
                    {
                        "type": "code",
                        "value": "notas = [7.5, 8.0, 6.5, 9.0, 4.0]\n\naprovados = 0\nfor nota in notas:\n    if nota >= 6.0:\n        aprovados = aprovados + 1\n\nprint(f'Aprovados: {aprovados}')\n# Saída:\n# Aprovados: 4"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Objetivo\", \"Valor inicial\", \"Atualização dentro do laço\"], [\"Somar valores\", \"soma = 0\", \"soma = soma + valor\"], [\"Contar itens (todos ou com condição)\", \"contador = 0\", \"contador = contador + 1\"], [\"Achar o maior valor\", \"maior = valores[0]\", \"if valor > maior: maior = valor\"], [\"Achar o menor valor\", \"menor = valores[0]\", \"if valor < menor: menor = valor\"]]"
                    },
                    {
                        "type": "code",
                        "value": "temperaturas = [22, 28, 19, 31, 25]\n\nmaior = temperaturas[0]\nfor temp in temperaturas:\n    if temp > maior:\n        maior = temp\n\nprint(f'Maior temperatura: {maior}')\n# Saída:\n# Maior temperatura: 31"
                    },
                    {
                        "type": "code",
                        "value": "gastos = [50, 120, 80, 200, 60]\n\ntotal = 0\ni = 0\nwhile total < 300 and i < len(gastos):\n    total = total + gastos[i]\n    i = i + 1\n\nprint(f'Parou no gasto de índice {i - 1}, total acumulado: {total}')\n# Saída:\n# Parou no gasto de índice 3, total acumulado: 450"
                    },
                    {
                        "type": "quote",
                        "value": "Somar, contar, achar o maior: é sempre a mesma dança. Uma variável nasce antes do laço, cresce a cada volta, e entrega o resultado quando o laço acaba."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o valor final de `soma` depois do código abaixo?\n\n```\nsoma = 0\nfor n in [1, 2, 3, 4]:\n    soma = soma + n\n```",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "10",
                                "isCorrect": true
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "24",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O código abaixo deveria somar os valores da lista, mas tem um problema. Qual?\n\n```\nvalores = [10, 20, 30]\n\nfor v in valores:\n    soma = 0\n    soma = soma + v\n\nprint(soma)\n```",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A variável `soma` é reiniciada a cada volta do laço",
                                "isCorrect": true
                            },
                            {
                                "text": "A lista `valores` deveria começar com um valor extra",
                                "isCorrect": false
                            },
                            {
                                "text": "O `print` está fora do laço e por isso nunca roda",
                                "isCorrect": false
                            },
                            {
                                "text": "O operador `+` não soma números dentro de um laço",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quantas vezes a palavra `par` é impressa pelo código abaixo?\n\n```\nnumeros = [3, 8, 12, 7, 4, 9]\n\nfor n in numeros:\n    if n % 2 == 0:\n        print('par')\n```",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "3",
                                "isCorrect": true
                            },
                            {
                                "text": "6",
                                "isCorrect": false
                            },
                            {
                                "text": "2",
                                "isCorrect": false
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\n```\nvalores = [5, 5, 5]\n\nmaior = valores[0]\nfor v in valores:\n    if v > maior:\n        maior = v\n\nprint(maior)\n```",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "5, porque `maior` já é o primeiro valor da lista",
                                "isCorrect": true
                            },
                            {
                                "text": "3, porque conta quantos valores existem na lista",
                                "isCorrect": false
                            },
                            {
                                "text": "15, porque soma os três valores da lista",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro, porque o `if` nunca chega a ser verdadeiro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a variável acumuladora (como `soma = 0`) deve ficar antes do laço, e não dentro dele?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque dentro do laço ela seria reiniciada a cada repetição",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Python não permite criar variáveis dentro de um for",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só funciona fora do laço quando o valor inicial é zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque dentro do laço ela mudaria de tipo a cada repetição",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "List comprehensions: a forma pythônica de criar listas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## List comprehension: a forma pythônica de criar listas\n\nVocê já sabe criar uma lista nova a partir de outra usando um `for` com `append`. Funciona, mas o Python tem um jeito mais direto e muito comum no código de quem já manja a linguagem: a **list comprehension**. É uma única linha que diz \"para cada item de uma coleção, calcule isso, e opcionalmente filtre aquilo\"."
                    },
                    {
                        "type": "code",
                        "value": "numeros = [1, 2, 3, 4, 5]\n\ndobros = []\nfor n in numeros:\n    dobros.append(n * 2)\n\nprint(dobros)\n# Saída:\n# [2, 4, 6, 8, 10]"
                    },
                    {
                        "type": "code",
                        "value": "numeros = [1, 2, 3, 4, 5]\n\ndobros = [n * 2 for n in numeros]\n\nprint(dobros)\n# Saída:\n# [2, 4, 6, 8, 10]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que essa forma é idiomática\n\nA receita é `[expressão for item in iterável]`. O Python lê quase como uma frase: \"para cada `n` em `numeros`, guarde `n * 2`\". É mais curto que o laço com `append`, evita criar e povoar uma lista vazia na mão, e é o padrão que você vai encontrar o tempo todo em código Python real, inclusive depois com pandas.\n\nDá pra ir além e filtrar quais itens entram, acrescentando um `if` no final. E lembra do padrão de acumular soma da aula passada? A função pronta `sum()` faz aquele laço inteiro numa chamada só, e combina muito bem com uma comprehension."
                    },
                    {
                        "type": "code",
                        "value": "numeros = [1, 2, 3, 4, 5, 6, 7, 8]\n\npares = [n for n in numeros if n % 2 == 0]\n\nprint(pares)\n# Saída:\n# [2, 4, 6, 8]"
                    },
                    {
                        "type": "code",
                        "value": "precos = [45, 120, 15, 200, 80]\n\ncaros_com_desconto = [p * 0.9 for p in precos if p > 50]\n\nprint(caros_com_desconto)\nprint(f'Total: {sum(caros_com_desconto)}')\n# Saída:\n# [108.0, 180.0, 72.0]\n# Total: 360.0"
                    },
                    {
                        "type": "quote",
                        "value": "Uma list comprehension não é só mais curta: ela diz o que você quer (transformar isso, filtrar aquilo), não o passo a passo de como fazer. Isso é pensar pythônico."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o resultado de `[n * 2 for n in [1, 2, 3]]`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "[2, 4, 6]",
                                "isCorrect": true
                            },
                            {
                                "text": "[1, 2, 3]",
                                "isCorrect": false
                            },
                            {
                                "text": "[2, 4, 6, 8]",
                                "isCorrect": false
                            },
                            {
                                "text": "[1, 4, 9]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\n```\nnumeros = [10, 15, 20, 25, 30]\n\nresultado = [n for n in numeros if n % 10 == 0]\n\nprint(resultado)\n```",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "[10, 20, 30]",
                                "isCorrect": true
                            },
                            {
                                "text": "[15, 25]",
                                "isCorrect": false
                            },
                            {
                                "text": "[10, 15, 20, 25, 30]",
                                "isCorrect": false
                            },
                            {
                                "text": "[20, 30]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a condição `if` faz dentro de uma list comprehension como `[n for n in numeros if n % 2 == 0]`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Filtra os itens, só entram os que passam no teste",
                                "isCorrect": true
                            },
                            {
                                "text": "Ordena os itens da lista final do menor para o maior",
                                "isCorrect": false
                            },
                            {
                                "text": "Repete cada item duas vezes quando a condição é verdadeira",
                                "isCorrect": false
                            },
                            {
                                "text": "Converte o tipo de cada item pra número inteiro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\n```\nresultado = [n for n in range(1, 10) if n % 3 == 0]\n\nprint(resultado)\n```",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "[3, 6, 9]",
                                "isCorrect": true
                            },
                            {
                                "text": "[3, 6]",
                                "isCorrect": false
                            },
                            {
                                "text": "[0, 3, 6, 9]",
                                "isCorrect": false
                            },
                            {
                                "text": "[1, 4, 7]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tem `precos = [10, 200, 35, 500, 8]` e quer uma lista só com os preços maiores que 20. Qual comprehension faz isso corretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "[p for p in precos if p > 20]",
                                "isCorrect": true
                            },
                            {
                                "text": "[p for p in precos if p < 20]",
                                "isCorrect": false
                            },
                            {
                                "text": "[p if p > 20 for p in precos]",
                                "isCorrect": false
                            },
                            {
                                "text": "[p > 20 for p in precos]",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Estruturas de dados",
        "aulas": [
            {
                "titulo": "Listas: indexar, fatiar e usar métodos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Estruturas de dados: guardando mais de um valor\n\nAté aqui você trabalhou com um valor por vez: uma variável guarda um número, uma string, um booleano. Mas dado raramente vem sozinho: uma turma tem várias notas, uma cidade tem vários bairros. Pra isso existem as **estruturas de dados**: listas, tuplas, dicionários e conjuntos, o assunto deste módulo.\n\nComeçamos pela mais usada no dia a dia: a **lista** (`list`), uma coleção **ordenada** que pode ser alterada depois de criada. Ela fica entre colchetes `[]`, com os itens separados por vírgula. Cada item tem uma posição, o **índice**, que começa em **0** (não em 1). Índices negativos contam a partir do fim: `-1` é o último item, `-2` o penúltimo."
                    },
                    {
                        "type": "code",
                        "value": "notas = [7.5, 8.0, 6.5, 9.0, 10.0]\n\nprint(notas)\n# [7.5, 8.0, 6.5, 9.0, 10.0]\n\nprint(notas[0])\n# 7.5 (primeiro item, índice 0)\n\nprint(notas[2])\n# 6.5\n\nprint(notas[-1])\n# 10.0 (último item)\n\nprint(notas[-2])\n# 9.0 (penúltimo item)\n\nprint(len(notas))\n# 5 (quantidade de itens na lista)"
                    },
                    {
                        "type": "text",
                        "value": "## Fatiando uma lista (slicing)\n\nO fatiamento pega um pedaço da lista com `lista[inicio:fim]`. O item no índice `fim` fica **de fora**, o corte vai só até `fim - 1`. Omitir o início significa \"desde o começo\"; omitir o fim significa \"até o final\"."
                    },
                    {
                        "type": "code",
                        "value": "notas = [7.5, 8.0, 6.5, 9.0, 10.0]\n\nprint(notas[1:3])\n# [8.0, 6.5] (índices 1 e 2; o índice 3 fica de fora)\n\nprint(notas[:2])\n# [7.5, 8.0] (do início até o índice 1)\n\nprint(notas[2:])\n# [6.5, 9.0, 10.0] (do índice 2 até o final)\n\nprint(notas[-2:])\n# [9.0, 10.0] (os dois últimos itens)"
                    },
                    {
                        "type": "text",
                        "value": "## Lista é mutável: alterando e usando métodos\n\nDiferente de um número ou de uma string, uma lista pode ser alterada depois de criada, sem precisar criar outra: isso é a **mutabilidade**. Os métodos mais usados no dia a dia:\n- `append(valor)`: adiciona no final\n- `insert(indice, valor)`: adiciona numa posição específica\n- `pop()`: remove e devolve o último item\n- `remove(valor)`: remove a primeira ocorrência daquele valor\n- `sort()`: ordena a lista em ordem crescente"
                    },
                    {
                        "type": "code",
                        "value": "notas = [7.5, 8.0, 6.5]\n\nnotas[0] = 7.0\nprint(notas)\n# [7.0, 8.0, 6.5] (alterou o item do índice 0, sem criar outra lista)\n\nnotas.append(9.5)\nprint(notas)\n# [7.0, 8.0, 6.5, 9.5]\n\nnotas.insert(0, 10.0)\nprint(notas)\n# [10.0, 7.0, 8.0, 6.5, 9.5]\n\nnotas.pop()\nprint(notas)\n# [10.0, 7.0, 8.0, 6.5] (removeu o último item, 9.5)\n\nnotas.remove(7.0)\nprint(notas)\n# [10.0, 8.0, 6.5]\n\nnotas.sort()\nprint(notas)\n# [6.5, 8.0, 10.0]\n\nfor nota in notas:\n    print(nota)\n# 6.5\n# 8.0\n# 10.0"
                    },
                    {
                        "type": "quote",
                        "value": "Lista é a estrutura mais usada em Python: ordenada, mutável, com índice começando em 0. Dominar list é a base pra tudo que vem depois."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nfrutas = [\"maçã\", \"pera\", \"uva\", \"kiwi\"]\nprint(frutas[2])",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "maçã",
                                "isCorrect": false
                            },
                            {
                                "text": "pera",
                                "isCorrect": false
                            },
                            {
                                "text": "uva",
                                "isCorrect": true
                            },
                            {
                                "text": "kiwi",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nnumeros = [10, 20, 30, 40]\nprint(numeros[-1])",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "10",
                                "isCorrect": false
                            },
                            {
                                "text": "20",
                                "isCorrect": false
                            },
                            {
                                "text": "30",
                                "isCorrect": false
                            },
                            {
                                "text": "40",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nnumeros = [10, 20, 30, 40, 50]\nprint(numeros[1:3])",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "[20, 30]",
                                "isCorrect": true
                            },
                            {
                                "text": "[10, 20]",
                                "isCorrect": false
                            },
                            {
                                "text": "[30, 40]",
                                "isCorrect": false
                            },
                            {
                                "text": "[40, 50]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nlista = [1, 2, 3]\nlista.append(4)\nprint(lista)",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "[1, 2, 3, 4]",
                                "isCorrect": true
                            },
                            {
                                "text": "[1, 2, 3]",
                                "isCorrect": false
                            },
                            {
                                "text": "[4, 1, 2, 3]",
                                "isCorrect": false
                            },
                            {
                                "text": "[1, 2, 4, 3]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nnumeros = [3, 1, 2]\nnumeros = numeros.sort()\nprint(numeros)",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "None, porque sort() ordena a lista e não retorna nada",
                                "isCorrect": true
                            },
                            {
                                "text": "[1, 2, 3], porque sort() devolve a lista já ordenada",
                                "isCorrect": false
                            },
                            {
                                "text": "[3, 1, 2], porque sort() não altera a lista original",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro, porque não é possível reatribuir o retorno de sort()",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tuplas e desempacotamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Tuplas: como listas, mas fixas\n\nA **tupla** (`tuple`) é uma coleção ordenada, parecida com a lista, mas **imutável**: depois de criada, não dá pra adicionar, remover ou trocar um item. Ela fica entre parênteses `()`.\n\nUse tupla quando o dado não deveria mudar: coordenadas de um ponto, um par (latitude, longitude), os três valores de uma cor RGB. Se a ideia é \"isso é fixo\", a tupla deixa essa intenção clara no código."
                    },
                    {
                        "type": "code",
                        "value": "ponto = (10, 20)\nprint(ponto)\n# (10, 20)\n\nprint(ponto[0])\n# 10\n\nprint(ponto[-1])\n# 20\n\ncores = (\"vermelho\", \"verde\", \"azul\")\nprint(cores[1:])\n# ('verde', 'azul')\n\n# ponto[0] = 99\n# TypeError: 'tuple' object does not support item assignment\n\nlista_ponto = [10, 20]\nlista_ponto[0] = 99\nprint(lista_ponto)\n# [99, 20] (lista aceita alterar; tupla não aceitaria)"
                    },
                    {
                        "type": "text",
                        "value": "## Desempacotando uma tupla\n\nUma tupla pode ser **desempacotada**: cada item vai para uma variável, na mesma linha. É a mesma ideia por trás de uma função que parece \"retornar vários valores\": na prática, ela retorna uma única tupla, e você desempacota o resultado."
                    },
                    {
                        "type": "code",
                        "value": "ponto = (10, 20)\nx, y = ponto\nprint(x)\n# 10\nprint(y)\n# 20\n\npessoa = (\"Ana\", 23, \"Recife\")\nnome, idade, cidade = pessoa\nprint(nome, idade, cidade)\n# Ana 23 Recife\n\na = 1\nb = 2\na, b = b, a\nprint(a, b)\n# 2 1 (trocou os dois valores sem variável auxiliar)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"list\", \"tuple\"], [\"Sintaxe\", \"[1, 2, 3]\", \"(1, 2, 3)\"], [\"Muda depois de criada\", \"Sim\", \"Não\"], [\"Indexar e fatiar\", \"Sim\", \"Sim\"], [\"append, pop, sort\", \"Sim\", \"Não\"], [\"Uso típico\", \"coleção que cresce\", \"dado fixo, registro curto\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando escolher tupla em vez de lista\n\nNa prática: se a coleção vai crescer, encolher ou trocar de item, use lista. Se representa um registro fixo (um ponto, uma data, uma cor em RGB), use tupla. Tupla também deixa claro pra quem lê o código que aquele dado não deveria ser alterado."
                    },
                    {
                        "type": "quote",
                        "value": "Lista muda, tupla não. Escolher tupla é dizer no código: isso aqui é um dado fixo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a saída do código abaixo?\n\ncores = (\"azul\", \"verde\", \"amarelo\")\nprint(cores[1])",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "azul",
                                "isCorrect": false
                            },
                            {
                                "text": "verde",
                                "isCorrect": true
                            },
                            {
                                "text": "amarelo",
                                "isCorrect": false
                            },
                            {
                                "text": "vermelho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\npessoa = (\"Ana\", 23)\nnome, idade = pessoa\nprint(idade)",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ana",
                                "isCorrect": false
                            },
                            {
                                "text": "23",
                                "isCorrect": true
                            },
                            {
                                "text": "Erro",
                                "isCorrect": false
                            },
                            {
                                "text": "None",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nponto = (5, 10)\nponto[0] = 1\nprint(ponto)",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "(1, 10), pois a atribuição por índice vale para qualquer sequência",
                                "isCorrect": false
                            },
                            {
                                "text": "TypeError, pois tupla não aceita alteração de item",
                                "isCorrect": true
                            },
                            {
                                "text": "(5, 10), pois a atribuição não teve efeito nenhum",
                                "isCorrect": false
                            },
                            {
                                "text": "IndexError, pois o índice 0 estaria fora do intervalo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\na = 3\nb = 7\na, b = b, a\nprint(a, b)",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "7 3",
                                "isCorrect": true
                            },
                            {
                                "text": "3 7",
                                "isCorrect": false
                            },
                            {
                                "text": "7 7",
                                "isCorrect": false
                            },
                            {
                                "text": "3 3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o tipo de x no código abaixo?\n\nx = (5)",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "tuple, porque qualquer valor entre parênteses vira uma tupla",
                                "isCorrect": false
                            },
                            {
                                "text": "int, porque sem vírgula os parênteses só agrupam a expressão",
                                "isCorrect": true
                            },
                            {
                                "text": "tuple, porque um único elemento ainda conta como coleção",
                                "isCorrect": false
                            },
                            {
                                "text": "float, porque o Python converte número isolado em ponto flutuante",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dicionários: pares chave-valor",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dicionários: pares chave-valor\n\nO **dicionário** (`dict`) guarda dados em pares **chave: valor**, entre chaves `{}`. Em vez de posição (como na lista), você acessa um item pelo **nome** dele, a chave.\n\nÉ a estrutura mais parecida com como pensamos dados no mundo real: um cadastro de aluno tem `nome`, `idade`, `curso`. Um dicionário representa um **registro**: os campos de uma pessoa, um produto, uma linha de uma planilha."
                    },
                    {
                        "type": "code",
                        "value": "aluno = {\"nome\": \"Ana\", \"idade\": 23, \"curso\": \"Dados\"}\n\nprint(aluno)\n# {'nome': 'Ana', 'idade': 23, 'curso': 'Dados'}\n\nprint(aluno[\"nome\"])\n# Ana\n\nprint(aluno[\"idade\"])\n# 23\n\nprint(len(aluno))\n# 3 (número de pares chave-valor)\n\n# print(aluno[\"email\"])\n# KeyError: 'email' (chave que não existe)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Forma de acessar\", \"Se a chave existe\", \"Se a chave não existe\"], [\"dicionario[chave]\", \"devolve o valor\", \"erro (KeyError)\"], [\"dicionario.get(chave)\", \"devolve o valor\", \"devolve None\"], [\"dicionario.get(chave, padrao)\", \"devolve o valor\", \"devolve padrao\"]]"
                    },
                    {
                        "type": "code",
                        "value": "aluno = {\"nome\": \"Ana\", \"idade\": 23}\n\nprint(aluno.get(\"nome\"))\n# Ana\n\nprint(aluno.get(\"email\"))\n# None (não existe, mas não quebra o programa)\n\nprint(aluno.get(\"email\", \"não informado\"))\n# não informado (valor padrão quando a chave não existe)\n\naluno[\"email\"] = \"ana@email.com\"\nprint(aluno)\n# {'nome': 'Ana', 'idade': 23, 'email': 'ana@email.com'} (adicionou uma chave nova)\n\naluno[\"idade\"] = 24\nprint(aluno)\n# {'nome': 'Ana', 'idade': 24, 'email': 'ana@email.com'} (atualizou uma chave existente)"
                    },
                    {
                        "type": "text",
                        "value": "## Percorrendo um dicionário\n\nUm `for` sozinho num dicionário percorre as **chaves**. Pra ter mais controle, três recursos ajudam:\n- `keys()`: só as chaves\n- `values()`: só os valores\n- `items()`: os pares chave e valor juntos, o mais usado na prática"
                    },
                    {
                        "type": "code",
                        "value": "aluno = {\"nome\": \"Ana\", \"idade\": 23, \"curso\": \"Dados\"}\n\nfor chave in aluno:\n    print(chave)\n# nome\n# idade\n# curso\n\nfor valor in aluno.values():\n    print(valor)\n# Ana\n# 23\n# Dados\n\nfor chave, valor in aluno.items():\n    print(chave, \"->\", valor)\n# nome -> Ana\n# idade -> 23\n# curso -> Dados"
                    },
                    {
                        "type": "quote",
                        "value": "Um dicionário é um registro: os campos de uma pessoa, um produto, uma linha de dados, guardados por nome, não por posição."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nproduto = {\"nome\": \"Caderno\", \"preco\": 12.5}\nprint(produto[\"preco\"])",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Caderno",
                                "isCorrect": false
                            },
                            {
                                "text": "12.5",
                                "isCorrect": true
                            },
                            {
                                "text": "preco",
                                "isCorrect": false
                            },
                            {
                                "text": "nome",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nproduto = {\"nome\": \"Caderno\"}\nprint(produto.get(\"preco\"))",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "None",
                                "isCorrect": true
                            },
                            {
                                "text": "Zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Vazio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nproduto = {\"nome\": \"Caderno\", \"preco\": 10}\nproduto[\"preco\"] = 15\nprint(produto)",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "{'nome': 'Caderno', 'preco': 15}",
                                "isCorrect": true
                            },
                            {
                                "text": "{'nome': 'Caderno', 'preco': 10}",
                                "isCorrect": false
                            },
                            {
                                "text": "{'nome': 'Caderno', 'preco': 10, 'preco': 15}",
                                "isCorrect": false
                            },
                            {
                                "text": "{'preco': 15}",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nestoque = {\"caderno\": \"cheio\", \"lapis\": \"baixo\"}\nfor item in estoque:\n    print(item)",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Primeiro caderno, depois lapis",
                                "isCorrect": true
                            },
                            {
                                "text": "Primeiro cheio, depois baixo",
                                "isCorrect": false
                            },
                            {
                                "text": "caderno: cheio, depois lapis: baixo",
                                "isCorrect": false
                            },
                            {
                                "text": "Primeiro lapis, depois caderno",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\ncontagem = {}\ncontagem[\"maçã\"] = contagem.get(\"maçã\", 0) + 1\nprint(contagem)",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "{'maçã': 1}, pois get devolve 0 e soma 1 pra chave nova",
                                "isCorrect": true
                            },
                            {
                                "text": "{'maçã': 0}, pois a soma final não é aplicada",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro, pois a chave \"maçã\" ainda não existe no dicionário",
                                "isCorrect": false
                            },
                            {
                                "text": "{}, pois atribuir uma chave nova não tem efeito imediato",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Conjuntos (set): valores únicos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Conjuntos: valores únicos, sem ordem\n\nO **conjunto** (`set`) é uma coleção sem ordem definida e **sem repetição**: cada valor aparece no máximo uma vez. Também fica entre chaves `{}`, mas sem os dois-pontos do dicionário: `{1, 2, 3}` é um set, um dicionário sempre tem `chave: valor`.\n\nUse set principalmente pra duas coisas: tirar duplicados de uma coleção e comparar dois grupos de dados (o que está nos dois, o que está só num deles)."
                    },
                    {
                        "type": "code",
                        "value": "numeros = {1, 2, 3, 2, 1}\nprint(numeros)\n# {1, 2, 3} (duplicados somem; a ordem exibida pode não ser a mesma em que você digitou)\n\nprint(len(numeros))\n# 3\n\nvisitas = [1, 5, 3, 5, 1, 1, 3]\nvisitantes_unicos = set(visitas)\nprint(len(visitantes_unicos))\n# 3 (a lista tinha 7 itens, sobraram 3 valores únicos)"
                    },
                    {
                        "type": "text",
                        "value": "## Sem índice, mas com add, remove e in\n\nComo não tem ordem fixa, set não aceita indexar por posição (`conjunto[0]` dá erro). Em compensação, três operações resolvem o dia a dia:\n- `add(valor)`: adiciona um item\n- `remove(valor)`: remove um item (dá erro se ele não existir)\n- `valor in conjunto`: testa se um valor está no conjunto"
                    },
                    {
                        "type": "code",
                        "value": "frutas = {\"maçã\", \"banana\"}\n\nfrutas.add(\"uva\")\nprint(len(frutas))\n# 3\n\nfrutas.add(\"maçã\")\nprint(len(frutas))\n# 3 (já tinha \"maçã\"; add não duplica)\n\nfrutas.remove(\"banana\")\nprint(len(frutas))\n# 2\n\nprint(\"uva\" in frutas)\n# True\n\nprint(\"banana\" in frutas)\n# False (foi removida)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Operação\", \"Operador\", \"Método\", \"Resultado\"], [\"União\", \"a | b\", \"a.union(b)\", \"itens que estão em a ou em b\"], [\"Interseção\", \"a & b\", \"a.intersection(b)\", \"itens que estão nos dois\"], [\"Diferença\", \"a - b\", \"a.difference(b)\", \"itens que estão só em a\"]]"
                    },
                    {
                        "type": "code",
                        "value": "turma_python = {\"Ana\", \"Bruno\", \"Carla\"}\nturma_sql = {\"Bruno\", \"Carla\", \"Diego\"}\n\n# sorted() transforma o conjunto numa lista ordenada, boa pra exibir de forma previsível\nprint(sorted(turma_python & turma_sql))\n# ['Bruno', 'Carla'] (interseção: quem está nas duas turmas)\n\nprint(sorted(turma_python - turma_sql))\n# ['Ana'] (diferença: quem está só na turma de Python)\n\nprint(sorted(turma_python | turma_sql))\n# ['Ana', 'Bruno', 'Carla', 'Diego'] (união: todo mundo, sem repetir)"
                    },
                    {
                        "type": "quote",
                        "value": "Set não guarda ordem nem repetição. Serve pra duas perguntas: quais valores diferentes existem aqui, e o que essas duas coleções têm em comum."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nnumeros = {1, 2, 2, 3, 3, 3}\nprint(len(numeros))",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "3",
                                "isCorrect": true
                            },
                            {
                                "text": "6",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o tipo de x no código abaixo?\n\nx = {}",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "set",
                                "isCorrect": false
                            },
                            {
                                "text": "dict",
                                "isCorrect": true
                            },
                            {
                                "text": "list",
                                "isCorrect": false
                            },
                            {
                                "text": "tuple",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\ncores = {\"azul\", \"verde\"}\nprint(cores[0])",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "azul, pois é o primeiro valor que foi inserido",
                                "isCorrect": false
                            },
                            {
                                "text": "verde, pois sets ordenam os itens ao serem criados",
                                "isCorrect": false
                            },
                            {
                                "text": "TypeError, pois set não aceita indexação por posição",
                                "isCorrect": true
                            },
                            {
                                "text": "IndexError, pois o índice 0 estaria fora do intervalo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o resultado de a | b no código abaixo?\n\na = {1, 2, 3}\nb = {2, 3, 4}",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "{1, 2, 3, 4}",
                                "isCorrect": true
                            },
                            {
                                "text": "{2, 3}",
                                "isCorrect": false
                            },
                            {
                                "text": "{1, 2, 2, 3, 3, 4}",
                                "isCorrect": false
                            },
                            {
                                "text": "{1, 2, 3}",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nfrutas = {\"maçã\", \"banana\"}\nfrutas.remove(\"uva\")\nprint(frutas)",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "KeyError, pois \"uva\" não está no conjunto",
                                "isCorrect": true
                            },
                            {
                                "text": "{'maçã', 'banana'}, pois remove ignora valores ausentes",
                                "isCorrect": false
                            },
                            {
                                "text": "{'maçã', 'banana', 'uva'}, pois remove insere o valor antes de tirar",
                                "isCorrect": false
                            },
                            {
                                "text": "TypeError, pois remove exige um valor já existente antes de rodar",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escolhendo a estrutura certa: lista de dicionários como tabela",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Qual estrutura usar?\n\nAgora que você conheceu lista, tupla, dicionário e conjunto, a pergunta do dia a dia é: qual usar em cada situação? Um jeito rápido de decidir:\n- Precisa de posição e o conteúdo pode mudar? **Lista**.\n- É um dado fixo que não deveria mudar? **Tupla**.\n- Precisa nomear cada campo, um registro com nome e valor? **Dicionário**.\n- Só quer saber quais valores diferentes existem, sem duplicar? **Conjunto**."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estrutura\", \"Ordenada\", \"Mutável\", \"Aceita duplicados\", \"Uso típico\"], [\"list\", \"Sim\", \"Sim\", \"Sim\", \"coleção que cresce ou muda\"], [\"tuple\", \"Sim\", \"Não\", \"Sim\", \"dado fixo, registro curto\"], [\"dict\", \"Sim (desde o Python 3.7)\", \"Sim\", \"Chaves não, valores sim\", \"registro com campos nomeados\"], [\"set\", \"Não\", \"Sim\", \"Não\", \"valores únicos, comparar grupos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Comprehension também funciona com dicionário\n\nVocê já viu o list comprehension em Controle de Fluxo: `[expressao for item in iteravel]`. A mesma ideia funciona pra criar um dicionário, só que com chave e valor: `{chave: valor for item in iteravel}`."
                    },
                    {
                        "type": "code",
                        "value": "numeros = [1, 2, 3, 4, 5]\n\nquadrados = [n ** 2 for n in numeros]\nprint(quadrados)\n# [1, 4, 9, 16, 25]\n\npares = [n for n in numeros if n % 2 == 0]\nprint(pares)\n# [2, 4]\n\nquadrados_dict = {n: n ** 2 for n in numeros}\nprint(quadrados_dict)\n# {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}"
                    },
                    {
                        "type": "text",
                        "value": "## Uma lista de dicionários é uma tabela\n\nJunte o que você aprendeu: se um dicionário é um registro (os campos de uma pessoa, de um produto), uma **lista de dicionários** é uma coleção de registros, ou seja, uma tabela. Cada dicionário é uma linha; as chaves em comum são as colunas.\n\nÉ assim que dados tabulares (uma planilha, uma tabela de banco, um CSV) aparecem no Python puro, antes de existir uma ferramenta como o pandas pra isso."
                    },
                    {
                        "type": "code",
                        "value": "alunos = [\n    {\"nome\": \"Ana\", \"nota\": 8.5},\n    {\"nome\": \"Bruno\", \"nota\": 6.0},\n    {\"nome\": \"Carla\", \"nota\": 9.5},\n]\n\nprint(alunos[0])\n# {'nome': 'Ana', 'nota': 8.5} (a primeira \"linha\" da tabela)\n\nprint(alunos[0][\"nome\"])\n# Ana\n\nsoma = 0\nfor aluno in alunos:\n    soma = soma + aluno[\"nota\"]\n\nmedia = soma / len(alunos)\nprint(media)\n# 8.0\n\naprovados = [aluno[\"nome\"] for aluno in alunos if aluno[\"nota\"] >= 7]\nprint(aprovados)\n# ['Ana', 'Carla']"
                    },
                    {
                        "type": "quote",
                        "value": "Lista, tupla, dicionário e conjunto são só quatro formas de guardar dados. Uma lista de dicionários já é uma tabela: é daqui que o pandas decola."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você precisa guardar as coordenadas (latitude, longitude) de um ponto, um dado que não muda depois de criado. Qual estrutura combina mais com esse caso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "list",
                                "isCorrect": false
                            },
                            {
                                "text": "tuple",
                                "isCorrect": true
                            },
                            {
                                "text": "dict",
                                "isCorrect": false
                            },
                            {
                                "text": "set",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tem uma lista com e-mails repetidos e quer só os valores diferentes, sem se importar com a ordem. Qual estrutura resolve isso mais direto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "list",
                                "isCorrect": false
                            },
                            {
                                "text": "tuple",
                                "isCorrect": false
                            },
                            {
                                "text": "dict",
                                "isCorrect": false
                            },
                            {
                                "text": "set",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nnumeros = [1, 2, 3, 4]\nresultado = [n * 10 for n in numeros if n % 2 == 0]\nprint(resultado)",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "[20, 40]",
                                "isCorrect": true
                            },
                            {
                                "text": "[10, 20, 30, 40]",
                                "isCorrect": false
                            },
                            {
                                "text": "[10, 30]",
                                "isCorrect": false
                            },
                            {
                                "text": "[2, 4]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nnomes = [\"ana\", \"bruno\"]\nresultado = {nome: len(nome) for nome in nomes}\nprint(resultado)",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "{'ana': 3, 'bruno': 5}",
                                "isCorrect": true
                            },
                            {
                                "text": "{'ana': 5, 'bruno': 3}",
                                "isCorrect": false
                            },
                            {
                                "text": "['ana', 'bruno']",
                                "isCorrect": false
                            },
                            {
                                "text": "{3: 'ana', 5: 'bruno'}",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\n\nprodutos = [\n    {\"nome\": \"Caneta\", \"preco\": 2.0},\n    {\"nome\": \"Caderno\", \"preco\": 15.0},\n    {\"nome\": \"Lapis\", \"preco\": 1.5},\n]\nbaratos = [produto[\"nome\"] for produto in produtos if produto[\"preco\"] < 5]\nprint(baratos)",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "['Caneta', 'Lapis']",
                                "isCorrect": true
                            },
                            {
                                "text": "['Caneta', 'Caderno', 'Lapis']",
                                "isCorrect": false
                            },
                            {
                                "text": "[2.0, 1.5]",
                                "isCorrect": false
                            },
                            {
                                "text": "['Caderno']",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Funções e módulos",
        "aulas": [
            {
                "titulo": "Definindo funções (def, return)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Funções: dando um nome pro que se repete\n\nNa trilha de Lógica de Programação você já resolveu problemas quebrando eles em passos menores, blocos que recebem uma entrada e devolvem um resultado. Em Python, esses blocos reutilizáveis têm nome, sintaxe própria e um lugar central na linguagem: são as **funções**.\n\nUma função existe por três motivos bem práticos:\n\n- **Reuso**: escreve a lógica uma vez, usa quantas vezes precisar.\n- **Organização**: um programa grande vira um monte de blocos pequenos, cada um com uma responsabilidade.\n- **Legibilidade**: `calcular_media(notas)` diz o que o código faz sem você precisar ler a conta por dentro.\n\nNesta aula você aprende a definir uma função com `def` e a devolver um resultado com `return`."
                    },
                    {
                        "type": "text",
                        "value": "## A sintaxe básica\n\nUma função começa com a palavra reservada `def`, seguida do nome da função, parênteses (onde entram os parâmetros, se houver) e dois pontos. O corpo vem indentado na linha de baixo, exatamente como o corpo de um `if` ou de um `for` que você já viu em Lógica de Programação.\n\nPra usar a função, você **chama** ela pelo nome, passando os valores entre parênteses. O parâmetro é o nome usado dentro da função; o argumento é o valor que você manda na chamada."
                    },
                    {
                        "type": "code",
                        "value": "def saudacao(nome):\n    print(f\"Oi, {nome}! Bem-vindo(a).\")\n\nsaudacao(\"Marcos\")\nsaudacao(\"Júlia\")\n# Oi, Marcos! Bem-vindo(a).\n# Oi, Júlia! Bem-vindo(a).\n\n# a mesma função rodou duas vezes com entradas diferentes:\n# escrever a lógica uma vez e reusar é a ideia central de uma função"
                    },
                    {
                        "type": "text",
                        "value": "## Devolvendo um valor com return\n\n`print` só mostra um valor na tela, ele não devolve nada que o resto do programa possa usar depois. Quando a função precisa entregar um resultado pra ser usado em outro lugar (numa conta, numa condição, guardado numa variável), ela usa `return`.\n\nAssim que o Python executa um `return`, a função é interrompida ali mesmo e o valor volta pra quem chamou. Se a função não tiver nenhum `return`, ou tiver um `return` sem valor nenhum, ela devolve `None` (o \"nada\" do Python) sem avisar."
                    },
                    {
                        "type": "code",
                        "value": "def dobro(n):\n    return n * 2\n\nresultado = dobro(5)\nprint(resultado)\n# 10\n\ndef exibir_boas_vindas(nome):\n    print(f\"Oi, {nome}!\")\n\nvalor = exibir_boas_vindas(\"Ana\")\n# Oi, Ana! (o print roda dentro da função)\nprint(valor)\n# None (a função não tem return, então devolveu None)"
                    },
                    {
                        "type": "code",
                        "value": "def calcular_media(numeros):\n    soma = sum(numeros)\n    quantidade = len(numeros)\n    return soma / quantidade\n\nnotas = [7.5, 8.0, 6.5, 9.0]\nmedia = calcular_media(notas)\nprint(media)\n# 7.75\n\n# guardamos o resultado em \"media\" porque calcular_media devolveu um valor com return\n# se a função só desse print(soma / quantidade), \"media\" teria virado None"
                    },
                    {
                        "type": "quote",
                        "value": "Uma função só é útil de verdade quando devolve algo que o resto do programa pode aproveitar: print mostra, return entrega."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual palavra reservada é usada para definir uma função em Python?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "def",
                                "isCorrect": true
                            },
                            {
                                "text": "function",
                                "isCorrect": false
                            },
                            {
                                "text": "func",
                                "isCorrect": false
                            },
                            {
                                "text": "define",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que este código imprime?\n\ndef triplo(n):\n    return n * 3\n\nprint(triplo(4))",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "12",
                                "isCorrect": true
                            },
                            {
                                "text": "7",
                                "isCorrect": false
                            },
                            {
                                "text": "444",
                                "isCorrect": false
                            },
                            {
                                "text": "None",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que acontece ao executar este código?\n\ndef dobro(n):\nreturn n * 2\n\nprint(dobro(5))",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dá erro de indentação",
                                "isCorrect": true
                            },
                            {
                                "text": "Funciona e imprime 10",
                                "isCorrect": false
                            },
                            {
                                "text": "Funciona e imprime None",
                                "isCorrect": false
                            },
                            {
                                "text": "Funciona, mas só às vezes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Este código chama cumprimenta(\"Rio\") e depois faz print(resultado). O que a última linha imprime?\n\ndef cumprimenta(nome):\n    print(f\"Olá, {nome}\")\n\nresultado = cumprimenta(\"Rio\")\nprint(resultado)",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "None",
                                "isCorrect": true
                            },
                            {
                                "text": "Olá, Rio",
                                "isCorrect": false
                            },
                            {
                                "text": "String vazia",
                                "isCorrect": false
                            },
                            {
                                "text": "O número 0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que este código imprime?\n\ndef checar(n):\n    if n < 0:\n        return \"negativo\"\n    return \"positivo\"\n    print(\"depois do return\")\n\nprint(checar(-5))",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "negativo",
                                "isCorrect": true
                            },
                            {
                                "text": "positivo",
                                "isCorrect": false
                            },
                            {
                                "text": "negativo e depois positivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de sintaxe",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Argumentos (posicionais, nomeados, default)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Argumentos posicionais e nomeados\n\nQuando você chama uma função, existem dois jeitos de associar os valores aos parâmetros. No jeito **posicional**, o Python casa cada valor com o parâmetro na mesma posição, seguindo a ordem em que aparecem. No jeito **nomeado** (ou *keyword*), você escreve `parametro=valor` na chamada, e a ordem deixa de importar, porque o nome já diz pra qual parâmetro aquele valor vai."
                    },
                    {
                        "type": "code",
                        "value": "def registrar(cidade, temperatura):\n    print(f\"{cidade}: {temperatura}°C\")\n\nregistrar(\"Recife\", 30)\n# Recife: 30°C (posicional: cidade=\"Recife\", temperatura=30)\n\nregistrar(temperatura=30, cidade=\"Recife\")\n# Recife: 30°C (nomeado: a ordem não importa mais)"
                    },
                    {
                        "type": "text",
                        "value": "## Valores default e a ordem dos parâmetros\n\nUm parâmetro pode ter um **valor default** (padrão), usado quando a chamada não informa aquele argumento. Isso torna alguns argumentos opcionais.\n\nExiste uma regra de ordem: parâmetros com default precisam vir depois dos parâmetros sem default, na definição da função. `def f(a, b=10):` funciona; `def f(a=10, b):` dá erro, porque o Python não sabe se um valor solto depois de um default é pra `b` ou é só mais um posicional."
                    },
                    {
                        "type": "code",
                        "value": "def calcular_media(numeros, casas=2):\n    return round(sum(numeros) / len(numeros), casas)\n\nnotas = [7.333, 8.667, 6.5]\n\nprint(calcular_media(notas))\n# 7.5 (usa o default: casas=2)\n\nprint(calcular_media(notas, casas=0))\n# 8.0 (sobrescreve o default)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de argumento\",\"Como funciona\",\"Exemplo na chamada\"],[\"Posicional\",\"O valor é associado ao parâmetro pela ordem\",\"funcao(1, 2)\"],[\"Nomeado (keyword)\",\"O valor é associado ao parâmetro pelo nome, a ordem fica livre\",\"funcao(b=2, a=1)\"],[\"Default\",\"O parâmetro já tem um valor se a chamada não informar outro\",\"funcao(1)\"],[\"*args\",\"Recebe argumentos posicionais extras, juntados numa tupla\",\"funcao(1, 2, 3, 4)\"],[\"**kwargs\",\"Recebe argumentos nomeados extras, juntados num dicionário\",\"funcao(x=1, y=2)\"]]"
                    },
                    {
                        "type": "code",
                        "value": "def soma_tudo(*valores):\n    return sum(valores)\n\nprint(soma_tudo(1, 2, 3))\n# 6\nprint(soma_tudo(10, 20, 30, 40))\n# 100\n# \"*valores\" junta qualquer quantidade de argumentos posicionais numa tupla\n\ndef mostrar_ficha(**dados):\n    for chave, valor in dados.items():\n        print(f\"{chave}: {valor}\")\n\nmostrar_ficha(nome=\"Ana\", idade=28, cidade=\"Recife\")\n# nome: Ana\n# idade: 28\n# cidade: Recife\n# \"**dados\" junta os argumentos nomeados extras num dicionário\n\n# a ordem na definição importa: parâmetros normais primeiro, depois *args, depois **kwargs"
                    },
                    {
                        "type": "quote",
                        "value": "Posicional pela ordem, nomeado pelo nome, default quando ninguém informa nada: a mesma função pode ser chamada de vários jeitos."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na chamada funcao(nome=\"Ana\", idade=20), que tipo de argumento está sendo usado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Nomeado (keyword)",
                                "isCorrect": true
                            },
                            {
                                "text": "Posicional (pela ordem)",
                                "isCorrect": false
                            },
                            {
                                "text": "Default (valor padrão)",
                                "isCorrect": false
                            },
                            {
                                "text": "*args (posicionais extras)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que este código imprime?\n\ndef apresentar(nome, cidade):\n    print(f\"{nome} mora em {cidade}\")\n\napresentar(cidade=\"Recife\", nome=\"Bia\")",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Bia mora em Recife",
                                "isCorrect": true
                            },
                            {
                                "text": "Recife mora em Bia",
                                "isCorrect": false
                            },
                            {
                                "text": "cidade mora em nome",
                                "isCorrect": false
                            },
                            {
                                "text": "Dá erro na chamada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual definição de função é válida em Python?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "def calc(a, b=10):",
                                "isCorrect": true
                            },
                            {
                                "text": "def calc(a=10, b):",
                                "isCorrect": false
                            },
                            {
                                "text": "def calc(a=5, b, c=10):",
                                "isCorrect": false
                            },
                            {
                                "text": "def calc(b=10, a, c=5):",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que este código imprime?\n\ndef multiplicar_tudo(*numeros):\n    resultado = 1\n    for n in numeros:\n        resultado *= n\n    return resultado\n\nprint(multiplicar_tudo(2, 3, 4))",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "24",
                                "isCorrect": true
                            },
                            {
                                "text": "9",
                                "isCorrect": false
                            },
                            {
                                "text": "234",
                                "isCorrect": false
                            },
                            {
                                "text": "12",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que este código imprime?\n\ndef registrar(local, *valores):\n    print(local, valores)\n\nregistrar(\"SP\", 10, 20, 30)",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "SP (10, 20, 30)",
                                "isCorrect": true
                            },
                            {
                                "text": "SP [10, 20, 30]",
                                "isCorrect": false
                            },
                            {
                                "text": "(SP, 10, 20, 30)",
                                "isCorrect": false
                            },
                            {
                                "text": "SP 10 20 30",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Lambda, escopo e docstrings",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Escopo: onde uma variável existe\n\nUma variável criada dentro de uma função é **local**: só existe enquanto a função está rodando, e desaparece assim que ela termina. Ninguém de fora enxerga essa variável.\n\nUma variável criada fora de qualquer função é **global**: qualquer função consegue *ler* o valor dela. Mas atenção: se você criar, dentro da função, uma variável com o mesmo nome de uma global, o Python entende que é uma variável local nova, e a global fica intocada."
                    },
                    {
                        "type": "code",
                        "value": "contador = 0  # variável global\n\ndef mostrar():\n    print(contador)  # lê a global, sem problema\n\ndef incrementar():\n    contador = 1  # cria uma variável LOCAL, com o mesmo nome\n    print(contador)\n\nmostrar()\n# 0\nincrementar()\n# 1 (a local)\nprint(contador)\n# 0 (a global nunca foi alterada)"
                    },
                    {
                        "type": "text",
                        "value": "## Funções lambda: funções de uma linha\n\nUma **lambda** é uma função anônima (sem nome, sem `def`) escrita numa linha só: `lambda parametros: expressao`. O valor da expressão já é o retorno, sem precisar escrever `return`.\n\nLambdas são úteis quando você precisa de uma função pequena e descartável só pra passar como argumento pra outra função, como o `sorted()` (pra decidir a ordem) ou o `filter()` (pra decidir o que entra numa lista nova), sem precisar dar nome a essa função."
                    },
                    {
                        "type": "code",
                        "value": "dobro = lambda x: x * 2\nprint(dobro(5))\n# 10\n\nalunos = [(\"Ana\", 22), (\"Bruno\", 19), (\"Carla\", 25)]\n\nalunos_por_idade = sorted(alunos, key=lambda aluno: aluno[1])\nprint(alunos_por_idade)\n# [('Bruno', 19), ('Ana', 22), ('Carla', 25)]\n# a lambda diz ao sorted: \"ordene usando o segundo item de cada tupla\""
                    },
                    {
                        "type": "text",
                        "value": "## Docstrings: documentando sua função\n\nUma **docstring** é uma string entre aspas triplas logo na primeira linha do corpo da função, explicando o que ela faz. Não é comentário: fica guardada junto da função e pode ser consultada depois, com `help(funcao)` ou `funcao.__doc__`.\n\nEm times de dados, docstrings curtas e diretas (o que a função recebe, o que ela devolve) economizam o tempo de quem só quer usar a função sem ler o código todo."
                    },
                    {
                        "type": "code",
                        "value": "def calcular_media(numeros):\n    \"\"\"Recebe uma lista de números e devolve a média (float).\"\"\"\n    return sum(numeros) / len(numeros)\n\nprint(calcular_media([2, 4, 6]))\n# 4.0\n\nprint(calcular_media.__doc__)\n# Recebe uma lista de números e devolve a média (float)."
                    },
                    {
                        "type": "quote",
                        "value": "Local desaparece quando a função termina, global sobrevive: e uma lambda é só uma função pequena demais pra merecer um nome."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma variável criada dentro de uma função, sem usar a palavra global, é:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Local à função",
                                "isCorrect": true
                            },
                            {
                                "text": "Global ao programa",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma constante",
                                "isCorrect": false
                            },
                            {
                                "text": "Um parâmetro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que este código imprime, na ordem?\n\nx = 10\n\ndef mostrar():\n    x = 20\n    print(x)\n\nmostrar()\nprint(x)",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "20 e 10",
                                "isCorrect": true
                            },
                            {
                                "text": "10 e 20",
                                "isCorrect": false
                            },
                            {
                                "text": "20 e 20",
                                "isCorrect": false
                            },
                            {
                                "text": "10 e 10",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual opção cria corretamente uma lambda que devolve o quadrado de um número?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "lambda x: x ** 2",
                                "isCorrect": true
                            },
                            {
                                "text": "lambda x: return x ** 2",
                                "isCorrect": false
                            },
                            {
                                "text": "lambda(x): x ** 2",
                                "isCorrect": false
                            },
                            {
                                "text": "def lambda x: x ** 2",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a utilidade de uma docstring numa função?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Explicar o que a função faz",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir os tipos aceitos",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar a função mais rápido",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar testes da função",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que este código imprime, na ordem?\n\ndef dobrar_lista(numeros):\n    novos = []\n    for n in numeros:\n        novos.append(n * 2)\n    return novos\n\nvalores = [1, 2, 3]\nresultado = dobrar_lista(valores)\nprint(valores)\nprint(resultado)",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "[1, 2, 3] e [2, 4, 6]",
                                "isCorrect": true
                            },
                            {
                                "text": "[2, 4, 6] e [2, 4, 6]",
                                "isCorrect": false
                            },
                            {
                                "text": "[2, 4, 6] e [1, 2, 3]",
                                "isCorrect": false
                            },
                            {
                                "text": "[1, 2, 3] e [1, 2, 3]",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Módulos e a biblioteca padrão (math, statistics, random, datetime)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Reaproveitando código com módulos\n\nPython já vem com uma biblioteca padrão enorme: um conjunto de módulos prontos pra tarefas comuns, sem precisar instalar nada. Um **módulo** é só um arquivo Python com funções e variáveis dentro, que você importa pra usar.\n\nExistem dois jeitos comuns de importar: `import modulo`, que traz o módulo inteiro (você acessa com `modulo.funcao()`), e `from modulo import nome`, que traz só o que você pediu, direto pelo nome."
                    },
                    {
                        "type": "code",
                        "value": "import math\n\nprint(math.sqrt(16))\n# 4.0\nprint(math.pi)\n# 3.141592653589793\nprint(math.ceil(4.2))\n# 5 (arredonda pra cima)\nprint(math.floor(4.8))\n# 4 (arredonda pra baixo)"
                    },
                    {
                        "type": "text",
                        "value": "## O módulo statistics: de volta à média\n\nLembra da `calcular_media` que você escreveu na aula 1? A biblioteca padrão já tem isso pronto, e mais alguns cálculos parecidos, no módulo `statistics`: `mean` (média), `median` (mediana) e `stdev` (desvio padrão), entre outros."
                    },
                    {
                        "type": "code",
                        "value": "from statistics import mean, median, stdev\n\nnotas = [7.5, 8.0, 6.5, 9.0]\n\nprint(mean(notas))\n# 7.75\nprint(median(notas))\n# 7.75\nprint(round(stdev(notas), 2))\n# 1.04\n\n# é a mesma ideia da calcular_media que você escreveu à mão,\n# só que pronta e testada na biblioteca padrão"
                    },
                    {
                        "type": "code",
                        "value": "import random\n\nprint(random.randint(1, 6))\n# um inteiro entre 1 e 6, sorteado (varia a cada execução)\nprint(random.choice([\"A\", \"B\", \"C\"]))\n# um item sorteado da lista (também varia)\n\nfrom datetime import date\n\nhoje = date.today()\nprint(hoje)\n# algo como 2026-07-13, a data de hoje\nprint(hoje.year)\n# 2026"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Módulo\",\"Pra que serve\",\"Exemplo\"],[\"math\",\"Funções e constantes matemáticas\",\"math.sqrt(16)\"],[\"random\",\"Números aleatórios e sorteios\",\"random.randint(1, 6)\"],[\"statistics\",\"Estatística básica: média, mediana, desvio\",\"mean(notas)\"],[\"datetime\",\"Datas e horas\",\"date.today()\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Antes de programar a sua própria versão, dá uma olhada na biblioteca padrão: boa parte do que você precisa já está ali, pronta e testada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando importa só a função mean do módulo statistics, sem trazer o módulo inteiro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "from statistics import mean",
                                "isCorrect": true
                            },
                            {
                                "text": "import statistics.mean",
                                "isCorrect": false
                            },
                            {
                                "text": "import mean from statistics",
                                "isCorrect": false
                            },
                            {
                                "text": "from statistics use mean",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que este código imprime?\n\nimport math\n\nprint(math.floor(7.9))",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "7",
                                "isCorrect": true
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            },
                            {
                                "text": "7.9",
                                "isCorrect": false
                            },
                            {
                                "text": "7.0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de from datetime import date, qual comando devolve a data de hoje?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "date.today()",
                                "isCorrect": true
                            },
                            {
                                "text": "date.now()",
                                "isCorrect": false
                            },
                            {
                                "text": "date.current()",
                                "isCorrect": false
                            },
                            {
                                "text": "date.get_today()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que este código imprime?\n\nfrom statistics import mean\n\nnotas = [7.5, 8.0, 6.5, 9.0]\nprint(mean(notas))",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "7.75",
                                "isCorrect": true
                            },
                            {
                                "text": "7.5",
                                "isCorrect": false
                            },
                            {
                                "text": "31.0",
                                "isCorrect": false
                            },
                            {
                                "text": "8.0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que este código imprime?\n\nfrom math import sqrt\n\ndef sqrt(x):\n    return \"raiz de \" + str(x)\n\nprint(sqrt(9))",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "raiz de 9",
                                "isCorrect": true
                            },
                            {
                                "text": "3.0",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro, o nome sqrt já existe",
                                "isCorrect": false
                            },
                            {
                                "text": "3",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "pip e ambientes virtuais (venv)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Nem tudo vem pronto: pacotes de terceiros\n\nA biblioteca padrão resolve muita coisa, mas o ecossistema de dados em Python vive em **pacotes de terceiros**: bibliotecas que outras pessoas escreveram e publicaram, como `numpy` e `pandas` (que você vai conhecer na próxima trilha). Esses pacotes não vêm junto com o Python, você instala com o **pip**, o gerenciador de pacotes padrão da linguagem."
                    },
                    {
                        "type": "code",
                        "value": "# comandos de terminal, fora do interpretador Python:\n\npip install numpy\n# instala o pacote numpy\n\npip list\n# lista os pacotes instalados no ambiente atual\n\npip show numpy\n# mostra detalhes do pacote: versão, local de instalação etc.\n\npip uninstall numpy\n# remove o pacote"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isolar dependências: ambientes virtuais\n\nCada projeto pode precisar de uma versão diferente do mesmo pacote. Se você instala tudo direto no sistema, um projeto pode quebrar o outro quando as versões não batem.\n\nA solução é o **venv**: um ambiente virtual, uma pasta isolada com sua própria cópia do Python e seus próprios pacotes instalados, sem interferir no resto da máquina nem em outros projetos."
                    },
                    {
                        "type": "code",
                        "value": "# dentro da pasta do projeto, no terminal:\n\npython -m venv venv\n# cria o ambiente virtual numa pasta chamada \"venv\"\n\nsource venv/bin/activate\n# ativa o ambiente no Linux/macOS\n# no Windows: venv\\Scripts\\activate\n\n# com o ambiente ativo, o prompt do terminal passa a mostrar (venv) no início\n# a partir daqui, todo pip install fica só dentro deste projeto\n\ndeactivate\n# sai do ambiente virtual"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\",\"Pra que serve\"],[\"pip install pacote\",\"Instala um pacote de terceiros no ambiente atual\"],[\"pip list\",\"Lista os pacotes já instalados\"],[\"pip uninstall pacote\",\"Remove um pacote instalado\"],[\"python -m venv nome\",\"Cria um ambiente virtual novo\"],[\"source nome/bin/activate\",\"Ativa o ambiente virtual (Linux/macOS)\"],[\"deactivate\",\"Sai do ambiente virtual ativo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Cada projeto com seu próprio ambiente virtual: assim a versão de um pacote num projeto nunca briga com a versão de outro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando instala o pacote pandas usando o pip?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "pip install pandas",
                                "isCorrect": true
                            },
                            {
                                "text": "pip get pandas",
                                "isCorrect": false
                            },
                            {
                                "text": "pip add pandas",
                                "isCorrect": false
                            },
                            {
                                "text": "python install pandas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve um ambiente virtual (venv) num projeto Python?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Isolar os pacotes desse projeto",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixar o código mais rápido",
                                "isCorrect": false
                            },
                            {
                                "text": "Traduzir o código pra outra linguagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispensar a instalação do Python",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pacote está instalado globalmente na versão 2.0, mas um projeto novo precisa da versão 3.0 sem afetar outros projetos que usam a 2.0. Qual é a solução recomendada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar um venv novo e instalar a 3.0 nele",
                                "isCorrect": true
                            },
                            {
                                "text": "Desinstalar a 2.0 e instalar a 3.0 no sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "Editar manualmente os arquivos do pacote",
                                "isCorrect": false
                            },
                            {
                                "text": "Reinstalar o Python inteiro na máquina",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de ativar um ambiente virtual chamado venv no Linux, o que aparece no terminal indicando que ele está ativo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O prefixo (venv) antes do prompt",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma mudança na cor do texto",
                                "isCorrect": false
                            },
                            {
                                "text": "A mensagem \"Python ativado\" na tela",
                                "isCorrect": false
                            },
                            {
                                "text": "O terminal fecha e abre de novo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se você esquecer de ativar o ambiente virtual antes de rodar pip install pandas, o que acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Instala no ambiente global, não no venv",
                                "isCorrect": true
                            },
                            {
                                "text": "O comando falha, sem venv ativo",
                                "isCorrect": false
                            },
                            {
                                "text": "O pip ativa o venv automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Instala dentro do venv mesmo assim",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Arquivos, erros e um gostinho de objetos",
        "aulas": [
            {
                "titulo": "Ler e escrever arquivos com with",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ler e escrever arquivos com with\n\nAté agora, todo dado que você criou num programa Python (uma variável, uma lista, um dicionário) existia só enquanto o programa estava rodando. Assim que o script terminava, tudo aquilo desaparecia da memória. Para guardar alguma coisa de verdade, de um jeito que sobrevive ao fim do programa e pode ser lida depois (por você, por outro programa, ou até por uma planilha), você precisa escrever num arquivo.\n\nNesta aula você vai aprender a abrir, ler e escrever arquivos de texto em Python, e a usar `with`, a forma correta de trabalhar com arquivos. Essa é também a base de uma ponte importante: mais pra frente, quando você for abrir uma planilha ou uma base de dados com pandas, por baixo dos panos vai existir sempre a mesma ideia de abrir, ler e fechar um arquivo.\n\n## Abrindo um arquivo com open()\n\nA função `open()` recebe pelo menos dois argumentos: o caminho do arquivo (o nome dele, ou o caminho completo até ele) e o modo de abertura, que diz o que você pretende fazer. Por exemplo, `open(\"recado.txt\", \"w\")` abre (ou cria) o arquivo `recado.txt` no modo de escrita.\n\nO modo é sempre o segundo argumento, e é ele que determina se você vai ler o conteúdo, escrever por cima ou acrescentar informação no final. Trocar o modo por engano é um erro comum: abrir um arquivo que você só queria ler no modo `\"w\"`, por exemplo, apaga tudo que já estava escrito nele antes mesmo de você perceber."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Modo\",\"O que faz\"],[\"r\",\"Abre para leitura. O arquivo precisa existir, senão o programa quebra.\"],[\"w\",\"Abre para escrita. Cria o arquivo se ele não existir, e apaga todo o conteúdo anterior.\"],[\"a\",\"Abre para escrita a partir do final. Cria o arquivo se ele não existir, mas preserva o que já tem.\"],[\"x\",\"Cria um arquivo novo para escrita. Se o arquivo já existir, o programa quebra.\"]]"
                    },
                    {
                        "type": "code",
                        "value": "arquivo = open(\"recado.txt\", \"w\")\narquivo.write(\"Primeira linha\\n\")\narquivo.write(\"Segunda linha\\n\")\narquivo.close()\n\n# Se você esquecer o close(), ou se um erro acontecer em alguma\n# linha antes dele, não há garantia de que o conteúdo escrito\n# tenha sido realmente salvo no arquivo."
                    },
                    {
                        "type": "text",
                        "value": "## O problema de fechar na mão, e a solução: with\n\nChamar `close()` manualmente funciona, mas depende de você lembrar de fazer isso toda vez, em todo caminho que o código pode seguir. Se o programa lançar um erro entre o `open()` e o `close()`, essa última linha nunca chega a rodar, e o arquivo pode ficar sem salvar direito.\n\nPor isso, o jeito idiomático de trabalhar com arquivos em Python é usando `with`. Ele abre o arquivo, executa o bloco indentado abaixo dele, e fecha o arquivo sozinho ao sair desse bloco, seja porque o código terminou normalmente, seja porque um erro interrompeu ele no meio. Você nunca mais precisa chamar `close()` na mão."
                    },
                    {
                        "type": "code",
                        "value": "with open(\"recado.txt\", \"w\") as arquivo:\n    arquivo.write(\"Primeira linha\\n\")\n    arquivo.write(\"Segunda linha\\n\")\n\n# Ao sair do bloco do with (mesmo que um erro acontecesse aqui dentro),\n# o Python fecha o arquivo sozinho. Repare que não existe arquivo.close()\n# em nenhum lugar deste trecho."
                    },
                    {
                        "type": "code",
                        "value": "with open(\"recado.txt\", \"r\") as arquivo:\n    conteudo = arquivo.read()\n\nprint(conteudo)\n# saída:\n# Primeira linha\n# Segunda linha\n# (mais uma linha em branco no final: o texto já termina com \\n, e o print acrescenta outro)\n\n\nwith open(\"recado.txt\", \"r\") as arquivo:\n    linhas = arquivo.readlines()\n\nprint(linhas)\n# saída: ['Primeira linha\\n', 'Segunda linha\\n']\n\n\nwith open(\"recado.txt\", \"r\") as arquivo:\n    for linha in arquivo:\n        print(linha.strip())\n# saída:\n# Primeira linha\n# Segunda linha\n# (o strip() tira o \\n do final de cada linha antes do print)"
                    },
                    {
                        "type": "quote",
                        "value": "O with abre e fecha o arquivo pra você, mesmo quando o código quebra no meio do caminho. É por isso que ele é sempre a forma certa de trabalhar com arquivos em Python."
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao abrir um arquivo com `open(\"dados.txt\", \"w\")`, o que acontece com o conteúdo que já existia nesse arquivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É apagado, e o arquivo passa a ser escrito do zero novamente",
                                "isCorrect": true
                            },
                            {
                                "text": "É mantido, e o texto novo é escrito a partir do final dele",
                                "isCorrect": false
                            },
                            {
                                "text": "É mantido, mas o arquivo fica bloqueado até ser fechado",
                                "isCorrect": false
                            },
                            {
                                "text": "É copiado para um arquivo de backup antes da escrita",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer acrescentar uma nova linha ao final de um arquivo de log que já existe, sem apagar as linhas anteriores. Qual modo usar no `open()`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "\"a\", que escreve a partir do final do conteúdo existente",
                                "isCorrect": true
                            },
                            {
                                "text": "\"w\", que garante um arquivo novo e vazio a cada execução",
                                "isCorrect": false
                            },
                            {
                                "text": "\"r\", que abre o arquivo para leitura e escrita ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "\"x\", que cria o arquivo somente se ele ainda não existir",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere o código:\n\nwith open(\"notas.txt\", \"w\") as arquivo:\n    arquivo.write(\"Ana\\n\")\n    arquivo.write(\"Bruno\\n\")\n\nwith open(\"notas.txt\", \"r\") as arquivo:\n    conteudo = arquivo.read()\n\nprint(conteudo)\n\nQual é a saída deste trecho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ana e Bruno, cada um em uma linha, e mais uma linha em branco no final",
                                "isCorrect": true
                            },
                            {
                                "text": "AnaBruno, tudo em uma linha só, pois o write não separa as chamadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada é impresso, pois o arquivo já tinha sido fechado antes do print",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas Bruno, pois a segunda chamada de write apaga o texto escrito antes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a principal vantagem de usar `with open(...) as arquivo:` no lugar de abrir e fechar manualmente com `close()`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Python fecha o arquivo sozinho ao sair do bloco, mesmo se ocorrer um erro no meio",
                                "isCorrect": true
                            },
                            {
                                "text": "O with permite abrir vários arquivos ao mesmo tempo, o que close() não permite",
                                "isCorrect": false
                            },
                            {
                                "text": "O with é a única forma de ler o conteúdo de um arquivo em Python",
                                "isCorrect": false
                            },
                            {
                                "text": "O with faz o arquivo ser lido mais rápido do que com open() comum",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere o código:\n\narquivo = open(\"log.txt\", \"w\")\narquivo.write(\"Início do processo\\n\")\nresultado = 10 / 0\narquivo.write(\"Fim do processo\\n\")\narquivo.close()\n\nA divisão por zero interrompe o programa na terceira linha. O que se pode afirmar sobre o arquivo log.txt nesse momento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não há garantia de que a primeira linha escrita tenha sido salva, pois o close() nunca roda",
                                "isCorrect": true
                            },
                            {
                                "text": "As duas linhas são salvas normalmente, pois o Python sempre grava antes de um erro parar o programa",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo não chega a ser criado, pois o erro acontece antes de qualquer escrita",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo é apagado automaticamente quando o programa termina com erro",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ler um CSV com o módulo csv",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O formato que carrega dados de verdade\n\nCSV significa \"comma-separated values\", valores separados por vírgula. É o formato mais comum para guardar dados em forma de tabela: cada linha do arquivo é um registro, e dentro da linha, cada valor é separado por vírgula. Se você já exportou uma planilha do Excel ou do Google Sheets como \".csv\", já mexeu com esse formato sem saber os detalhes por trás dele.\n\nUm CSV nada mais é do que um arquivo de texto comum, e você já sabe abrir arquivos de texto desde a aula passada. Dá pra ler um CSV linha por linha e separar os valores você mesmo, usando o `split(\",\")` que você viu no Módulo 2. O problema é que dados reais nem sempre são tão simples: um endereço como Rua A, 123 já tem uma vírgula dentro do próprio valor, e um split ingênuo separaria isso em dois pedaços por engano. Para esses casos, a biblioteca padrão do Python tem um módulo pronto: `csv`."
                    },
                    {
                        "type": "code",
                        "value": "with open(\"alunos.csv\", \"w\") as arquivo:\n    arquivo.write(\"nome,idade,cidade\\n\")\n    arquivo.write(\"Ana,23,Recife\\n\")\n    arquivo.write(\"Bruno,31,Curitiba\\n\")\n    arquivo.write(\"Carla,19,Belo Horizonte\\n\")\n\n# alunos.csv agora tem 4 linhas: 1 de cabeçalho (o nome dos campos) e 3 de dados."
                    },
                    {
                        "type": "text",
                        "value": "## Lendo com csv.reader\n\nO jeito mais direto de ler um CSV é com `csv.reader`. Ele recebe o arquivo já aberto e devolve um objeto que você percorre com `for`, onde cada linha vira uma lista de strings, uma posição para cada coluna.\n\nA primeira linha do arquivo costuma ser o cabeçalho (os nomes das colunas), não um dado de verdade. Por isso é comum consumir essa primeira linha separadamente, com `next()`, antes de entrar no loop que trata os dados de fato. Depois disso, cada linha é uma lista comum, e você acessa cada valor pelo índice, como `linha[0]` para a primeira coluna."
                    },
                    {
                        "type": "code",
                        "value": "import csv\n\nwith open(\"alunos.csv\", \"r\") as arquivo:\n    leitor = csv.reader(arquivo)\n    cabecalho = next(leitor)\n    print(cabecalho)\n    # saída: ['nome', 'idade', 'cidade']\n\n    for linha in leitor:\n        print(linha)\n# saída:\n# ['Ana', '23', 'Recife']\n# ['Bruno', '31', 'Curitiba']\n# ['Carla', '19', 'Belo Horizonte']"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo com csv.DictReader\n\nAcessar coluna por índice funciona, mas obriga você a lembrar a ordem exata das colunas no arquivo. O `csv.DictReader` resolve isso: ele usa a primeira linha do arquivo como cabeçalho automaticamente, e devolve cada linha como um dicionário, com o nome da coluna como chave. Você não precisa mais chamar `next()` para pular o cabeçalho: o DictReader já faz isso sozinho.\n\nTem um detalhe importante: não importa o que está escrito no CSV, todo valor lido por `csv.reader` ou `csv.DictReader` chega como string, mesmo que pareça um número. Se você precisar somar ou comparar esses valores, vai ter que converter com `int()` ou `float()` primeiro, como você aprendeu no Módulo 2."
                    },
                    {
                        "type": "code",
                        "value": "import csv\n\nwith open(\"alunos.csv\", \"r\") as arquivo:\n    leitor = csv.DictReader(arquivo)\n    for linha in leitor:\n        print(linha)\n# saída:\n# {'nome': 'Ana', 'idade': '23', 'cidade': 'Recife'}\n# {'nome': 'Bruno', 'idade': '31', 'cidade': 'Curitiba'}\n# {'nome': 'Carla', 'idade': '19', 'cidade': 'Belo Horizonte'}\n\nwith open(\"alunos.csv\", \"r\") as arquivo:\n    leitor = csv.DictReader(arquivo)\n    primeira_linha = next(leitor)\n\nprint(primeira_linha[\"nome\"], \"tem\", primeira_linha[\"idade\"], \"anos\")\n# saída: Ana tem 23 anos\n\nprint(type(primeira_linha[\"idade\"]))\n# saída: <class 'str'>"
                    },
                    {
                        "type": "quote",
                        "value": "Um CSV é só um arquivo de texto com vírgulas separando colunas, mas o módulo csv entende essas regras por você e devolve cada linha pronta, como lista ou como dicionário."
                    }
                ],
                "questions": [
                    {
                        "statement": "O csv.reader() transforma cada linha de um arquivo CSV em qual tipo de dado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma lista de strings, uma posição para cada coluna",
                                "isCorrect": true
                            },
                            {
                                "text": "Um dicionário, com o nome de cada coluna como chave",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tupla imutável, com um valor para cada coluna",
                                "isCorrect": false
                            },
                            {
                                "text": "Um número inteiro representando a linha inteira",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de usar csv.reader ou csv.DictReader num programa, qual linha é necessária no início do arquivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "import csv, pois csv é um módulo da biblioteca padrão",
                                "isCorrect": true
                            },
                            {
                                "text": "install csv, pois csv precisa ser baixado antes de usar",
                                "isCorrect": false
                            },
                            {
                                "text": "from python import csv, pois csv vem junto do interpretador",
                                "isCorrect": false
                            },
                            {
                                "text": "import pandas as csv, pois é o pandas que lê arquivos CSV",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere o código:\n\nimport csv\n\nwith open(\"alunos.csv\", \"r\") as arquivo:\n    leitor = csv.reader(arquivo)\n    cabecalho = next(leitor)\n    for linha in leitor:\n        print(linha[0])\n\nO arquivo alunos.csv tem o cabeçalho nome,idade,cidade seguido pelas linhas de Ana, Bruno e Carla. Qual é a saída deste trecho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ana, Bruno e Carla, cada nome em uma linha, pois o cabeçalho já foi consumido pelo next",
                                "isCorrect": true
                            },
                            {
                                "text": "nome, Ana, Bruno e Carla, pois o cabeçalho também é impresso junto com os dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Recife, Curitiba e Belo Horizonte, pois linha[0] pega sempre a última coluna",
                                "isCorrect": false
                            },
                            {
                                "text": "As três linhas completas, com todas as colunas, pois linha[0] imprime a linha inteira",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de ler uma linha com csv.DictReader, você quer somar 1 ao valor da coluna idade. Sabendo que os valores de um DictReader sempre chegam como string, qual trecho faz essa soma corretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "int(linha[\"idade\"]) + 1",
                                "isCorrect": true
                            },
                            {
                                "text": "str(linha[\"idade\"]) + 1",
                                "isCorrect": false
                            },
                            {
                                "text": "linha[idade] + 1",
                                "isCorrect": false
                            },
                            {
                                "text": "linha.idade + 1",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma coluna endereco de um CSV guarda o valor Rua A, 123 (com vírgula dentro do próprio dado, entre aspas no arquivo). Por que usar csv.reader é mais seguro do que fazer linha.split(\",\") em cada linha do arquivo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o csv.reader entende aspas e não separa um valor com vírgula dentro",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o split(\",\") não existe para textos lidos de dentro de um arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o csv.reader é a única forma de abrir um arquivo com extensão .csv",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o split(\",\") apaga os espaços em branco de cada valor separado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tratamento de erros (try/except)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando o programa encontra um erro\n\nAté agora, todo código que você escreveu supunha que os dados chegariam do jeito esperado: um texto que realmente vira número, uma chave que realmente existe no dicionário, uma posição que realmente existe na lista. Na prática, dados reais vêm sujos: alguém digita \"vinte\" no lugar de 20, uma planilha tem uma célula vazia, um arquivo que deveria existir foi apagado.\n\nQuando algo assim acontece e o Python não sabe como continuar, ele levanta uma exceção: um erro em tempo de execução que, se não for tratado, interrompe o programa imediatamente e mostra um traceback (o relatório do que deu errado). Isso é péssimo quando você está processando, por exemplo, mil linhas de um arquivo: uma única linha ruim não deveria derrubar as outras 999. É pra isso que serve o `try`/`except`: capturar o erro e decidir o que fazer com ele, em vez de deixar o programa inteiro parar."
                    },
                    {
                        "type": "code",
                        "value": "idade_texto = \"vinte\"\nidade = int(idade_texto)\nprint(idade)\n\n# ValueError: invalid literal for int() with base 10: 'vinte'\n#\n# O programa para exatamente nessa linha.\n# A linha print(idade) nunca chega a ser executada."
                    },
                    {
                        "type": "code",
                        "value": "idade_texto = \"vinte\"\n\ntry:\n    idade = int(idade_texto)\n    print(f\"Idade: {idade}\")\nexcept ValueError:\n    print(\"Não consegui entender essa idade, tente um número.\")\n\nprint(\"O programa continua normalmente depois do try/except.\")\n# saída:\n# Não consegui entender essa idade, tente um número.\n# O programa continua normalmente depois do try/except."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Exceção\",\"Quando acontece\"],[\"ValueError\",\"O valor tem o tipo certo, mas o conteúdo é inválido para a operação, como converter a palavra vinte para número\"],[\"KeyError\",\"Tentar acessar uma chave que não existe em um dicionário, como pedir idade quando só existe nome\"],[\"IndexError\",\"Tentar acessar uma posição que não existe em uma lista ou string, como o índice 10 numa lista de 3 itens\"],[\"FileNotFoundError\",\"Tentar abrir no modo de leitura um arquivo que não existe no caminho informado\"],[\"ZeroDivisionError\",\"Tentar dividir um número por zero, como 10 dividido por 0\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Vários except, e os blocos else e finally\n\nUm mesmo trecho de código pode falhar de mais de um jeito, e você pode tratar cada exceção separadamente, empilhando vários `except`, cada um cuidando de um tipo de erro. O Python testa cada `except` na ordem em que aparece e executa apenas o primeiro que combinar com a exceção levantada.\n\nAlém do `try` e do `except`, existem dois blocos opcionais que ajudam a organizar o código: o `else`, que roda somente quando o `try` termina sem nenhum erro, e o `finally`, que roda sempre, com erro ou sem erro. O `else` separa \"o que fazer quando deu certo\" de \"o que tentar fazer\", e o `finally` é o lugar certo para um código que precisa rodar de qualquer jeito, como avisar que a tentativa terminou."
                    },
                    {
                        "type": "code",
                        "value": "def calcular_media(lista_de_notas):\n    try:\n        media = sum(lista_de_notas) / len(lista_de_notas)\n    except ZeroDivisionError:\n        print(\"Lista de notas vazia, não dá pra calcular média.\")\n    else:\n        print(f\"Média calculada: {media:.1f}\")\n    finally:\n        print(\"Tentativa de cálculo encerrada.\")\n\ncalcular_media([7, 8, 9])\n# saída:\n# Média calculada: 8.0\n# Tentativa de cálculo encerrada.\n\ncalcular_media([])\n# saída:\n# Lista de notas vazia, não dá pra calcular média.\n# Tentativa de cálculo encerrada."
                    },
                    {
                        "type": "quote",
                        "value": "try/except não esconde os erros: ele te dá a chance de decidir o que fazer quando um deles acontece, em vez de deixar o programa inteiro parar por causa de uma linha ruim."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que acontece quando uma exceção é levantada em um programa Python e não existe nenhum try/except ao redor dela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O programa é interrompido imediatamente, e um traceback com o erro é exibido",
                                "isCorrect": true
                            },
                            {
                                "text": "O Python ignora aquela linha automaticamente e segue para a próxima",
                                "isCorrect": false
                            },
                            {
                                "text": "O programa pede, no terminal, para o usuário corrigir o valor e tentar de novo",
                                "isCorrect": false
                            },
                            {
                                "text": "O erro é salvo em um arquivo de log, e o programa continua rodando normalmente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual exceção o Python levanta ao tentar executar 10 / 0?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "ZeroDivisionError, o erro de dividir um número por zero",
                                "isCorrect": true
                            },
                            {
                                "text": "ValueError, o erro de valor com tipo certo mas conteúdo inválido",
                                "isCorrect": false
                            },
                            {
                                "text": "IndexError, o erro de posição que não existe numa lista",
                                "isCorrect": false
                            },
                            {
                                "text": "TypeError, o erro de operação entre tipos incompatíveis",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere o código:\n\ntry:\n    numeros = [10, 20, 30]\n    print(numeros[5])\nexcept IndexError:\n    print(\"indice invalido\")\nexcept ValueError:\n    print(\"valor invalido\")\nelse:\n    print(\"tudo certo\")\nfinally:\n    print(\"fim da tentativa\")\n\nQual é a saída deste trecho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "indice invalido, e depois fim da tentativa, pois o índice 5 não existe na lista",
                                "isCorrect": true
                            },
                            {
                                "text": "valor invalido, e depois fim da tentativa, pois o índice fora da faixa vira valor inválido",
                                "isCorrect": false
                            },
                            {
                                "text": "indice invalido, tudo certo e fim da tentativa, pois o else roda mesmo após o except",
                                "isCorrect": false
                            },
                            {
                                "text": "apenas fim da tentativa, pois o erro cancela os prints anteriores do bloco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o bloco else de um try/except em Python?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Para rodar um código que só deve executar quando nenhuma exceção acontece no try",
                                "isCorrect": true
                            },
                            {
                                "text": "Para rodar um código alternativo quando ocorre uma exceção diferente das previstas",
                                "isCorrect": false
                            },
                            {
                                "text": "Para substituir o except, nos casos em que não se sabe qual erro pode ocorrer",
                                "isCorrect": false
                            },
                            {
                                "text": "Para rodar antes do finally, mesmo quando o erro interrompe o programa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você está lendo mil linhas de um CSV e convertendo uma coluna para número com int(). Por que colocar essa conversão dentro de um try/except, linha a linha, costuma ser melhor do que deixar sem tratamento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque uma linha com valor inválido não impede o processamento das outras 999",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o try/except deixa a leitura do arquivo várias vezes mais rápida",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Python só permite usar int() quando ele está dentro de um bloco try",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o try/except corrige sozinho o valor inválido para o número mais próximo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Um gostinho de classes e objetos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Tudo em Python é um objeto\n\nDesde o Módulo 2 você chama coisas como \"texto\".upper() ou lista.append(valor). Repare no padrão: um valor, seguido de ponto, seguido de um nome com parênteses. Isso não é coincidência: em Python, praticamente tudo (um número, uma string, uma lista, um dicionário) é um objeto, e upper() e append() são métodos, funções que pertencem àquele objeto e sabem operar sobre os dados que ele guarda.\n\nAté aqui você só usou objetos prontos, que já vêm embutidos na linguagem. Nesta aula você vai aprender a criar os seus próprios, com `class`. O objetivo não é te tornar um especialista em orientação a objetos, e sim te dar o vocabulário mínimo para entender, mais pra frente, por que um DataFrame do pandas também é só um objeto, com seus próprios atributos e métodos.\n\n## Definindo uma classe\n\nUma classe é o molde que define quais dados (atributos) e quais ações (métodos) os objetos criados a partir dela vão ter. Você define uma classe com a palavra `class`, e dentro dela, o método `__init__` é chamado automaticamente sempre que um novo objeto é criado: é nele que você define os atributos iniciais, usando `self`.\n\n`self` representa o próprio objeto que está sendo criado ou usado. Toda vez que você escreve `self.nome = nome` dentro do `__init__`, está guardando o valor recebido em `nome` como um atributo daquele objeto específico, para poder usar depois em qualquer método da classe."
                    },
                    {
                        "type": "code",
                        "value": "numero = 10\ntexto = \"dados\"\nlista = [1, 2, 3]\n\nprint(type(numero))\n# saída: <class 'int'>\nprint(type(texto))\n# saída: <class 'str'>\nprint(type(lista))\n# saída: <class 'list'>\n\nprint(texto.upper())\n# saída: DADOS\nlista.append(4)\nprint(lista)\n# saída: [1, 2, 3, 4]"
                    },
                    {
                        "type": "code",
                        "value": "class Aluno:\n    def __init__(self, nome, nota):\n        self.nome = nome\n        self.nota = nota\n\n    def esta_aprovado(self):\n        return self.nota >= 6\n\naluno1 = Aluno(\"Ana\", 8.5)\naluno2 = Aluno(\"Bruno\", 5.0)\n\nprint(aluno1.nome, aluno1.nota)\n# saída: Ana 8.5\nprint(aluno2.nome, aluno2.nota)\n# saída: Bruno 5.0"
                    },
                    {
                        "type": "code",
                        "value": "class Aluno:\n    def __init__(self, nome, nota):\n        self.nome = nome\n        self.nota = nota\n\n    def esta_aprovado(self):\n        return self.nota >= 6\n\nalunos = [Aluno(\"Ana\", 8.5), Aluno(\"Bruno\", 5.0), Aluno(\"Carlos\", 7.0)]\n\nfor aluno in alunos:\n    if aluno.esta_aprovado():\n        print(f\"{aluno.nome} foi aprovado\")\n    else:\n        print(f\"{aluno.nome} ficou de recuperação\")\n# saída:\n# Ana foi aprovado\n# Bruno ficou de recuperação\n# Carlos foi aprovado"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Termo\",\"O que é\"],[\"Classe\",\"O molde que define quais atributos e métodos os objetos vão ter\"],[\"Objeto (instância)\",\"Um exemplar criado a partir da classe, com valores próprios\"],[\"Atributo\",\"Um dado guardado dentro do objeto, acessado com self.nome\"],[\"Método\",\"Uma função definida dentro da classe, que age sobre o objeto\"],[\"self\",\"O parâmetro que representa o próprio objeto dentro de um método\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que isso tem a ver com pandas\n\nGuarde essas cinco palavras: classe, objeto, atributo, método e self. Na trilha seguinte, você vai importar o pandas e criar um DataFrame a partir de um CSV, mais ou menos assim: `tabela = pd.DataFrame(dados)`. Essa tabela é um objeto, criado a partir da classe DataFrame. Ele guarda os dados como atributos (como `tabela.shape`, o formato da tabela) e oferece métodos prontos para você chamar, como `tabela.head()` para ver as primeiras linhas ou `tabela.mean()` para calcular a média de uma coluna.\n\nNada disso vai parecer mágico quando chegar lá: é exatamente o mesmo padrão objeto.metodo() que você acabou de praticar com a classe Aluno."
                    },
                    {
                        "type": "quote",
                        "value": "Uma classe é o molde, um objeto é o que você cria a partir dele, e self é como o método sabe de qual objeto está falando. É a mesma ideia por trás de cada .metodo() que você vai chamar em pandas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em Python, o que é uma classe?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O molde que define os atributos e métodos que os objetos vão ter",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma variável que guarda vários valores diferentes ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma função que sempre devolve um número como resultado final",
                                "isCorrect": false
                            },
                            {
                                "text": "Um arquivo do disco que guarda dados em linhas e colunas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o parâmetro self representa dentro dos métodos de uma classe?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O próprio objeto sobre o qual o método está sendo chamado",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome da classe que foi usada para criar o objeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma cópia dos dados de todos os objetos já criados",
                                "isCorrect": false
                            },
                            {
                                "text": "Um valor opcional que pode ser omitido ao criar o método",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere o código:\n\nclass Produto:\n    def __init__(self, nome, preco):\n        self.nome = nome\n        self.preco = preco\n\np1 = Produto(\"Caderno\", 12.0)\np2 = Produto(\"Caneta\", 3.0)\np1.preco = 15.0\n\nprint(p1.preco, p2.preco)\n\nQual é a saída deste trecho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "15.0 e 3.0, pois cada objeto guarda atributos independentes do outro",
                                "isCorrect": true
                            },
                            {
                                "text": "15.0 e 15.0, pois mudar o atributo de p1 também muda o mesmo atributo em p2",
                                "isCorrect": false
                            },
                            {
                                "text": "12.0 e 3.0, pois a atribuição p1.preco = 15.0 só funciona dentro do __init__",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro, pois não é permitido alterar o valor de um atributo depois de criado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença entre um método e uma função comum em Python?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O método é definido dentro de uma classe e acessa dados do objeto pelo self",
                                "isCorrect": true
                            },
                            {
                                "text": "O método nunca pode receber parâmetros além do self, diferente da função",
                                "isCorrect": false
                            },
                            {
                                "text": "A função sempre devolve um valor, enquanto o método nunca devolve nada",
                                "isCorrect": false
                            },
                            {
                                "text": "O método só pode ser chamado dentro do mesmo arquivo onde a classe existe",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de aprender classes, você lê que um DataFrame do pandas é um objeto. O que isso quer dizer, na prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que o DataFrame guarda dados e oferece métodos prontos, como head ou mean",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o DataFrame é, na prática, um arquivo CSV salvo permanentemente em disco",
                                "isCorrect": false
                            },
                            {
                                "text": "Que um DataFrame só pode ser usado dentro de uma classe criada pelo programador",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o DataFrame funciona como uma função que transforma uma lista em dicionário",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Juntando tudo: CSV, erros e resumo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que vamos juntar\n\nChegou a hora de somar tudo que você viu neste módulo com o que já sabia dos módulos anteriores. O cenário: uma lojinha registra as vendas do dia num arquivo CSV, mas nem toda linha vem perfeita. Alguém esqueceu de preencher uma quantidade, outra pessoa digitou um preço que não é um número. Você vai ler esse arquivo, ignorar as linhas com problema sem derrubar o programa, e calcular um resumo: quantas vendas foram válidas, quantas foram ignoradas, o total vendido e o ticket médio.\n\nIsso é, em miniatura, exatamente o tipo de trabalho que um cientista de dados faz o tempo todo antes de qualquer análise: ler dados de uma fonte real, lidar com o que vem errado, e só depois resumir."
                    },
                    {
                        "type": "code",
                        "value": "with open(\"vendas.csv\", \"w\") as arquivo:\n    arquivo.write(\"produto,quantidade,preco\\n\")\n    arquivo.write(\"Caderno,3,12.50\\n\")\n    arquivo.write(\"Caneta,10,2.50\\n\")\n    arquivo.write(\"Mochila,,89.90\\n\")\n    arquivo.write(\"Estojo,2,abc\\n\")\n    arquivo.write(\"Caderno,1,12.50\\n\")\n\n# Repare nas linhas 3 e 4: a de Mochila está sem quantidade,\n# e a de Estojo tem \"abc\" no lugar de um preço."
                    },
                    {
                        "type": "text",
                        "value": "## O plano\n\nAntes de escrever o código, vale organizar o raciocínio em passos, do jeito que você aprendeu lá no início da trilha de Lógica de Programação:\n\n- Abrir vendas.csv com `with` e ler cada linha com `csv.DictReader`\n- Para cada linha, tentar converter quantidade e preco para número dentro de um `try`\n- Se a conversão falhar (ValueError), contar a linha como inválida e seguir para a próxima, sem travar o programa\n- Se a conversão der certo (`else`), somar o valor da venda ao total e contar como válida\n- No final, calcular a média com cuidado, porque dividir pelo número de vendas válidas só funciona se esse número for maior que zero"
                    },
                    {
                        "type": "code",
                        "value": "import csv\n\ntotal_geral = 0.0\nvendas_validas = 0\nvendas_invalidas = 0\n\nwith open(\"vendas.csv\", \"r\") as arquivo:\n    leitor = csv.DictReader(arquivo)\n    for linha in leitor:\n        try:\n            quantidade = int(linha[\"quantidade\"])\n            preco = float(linha[\"preco\"])\n        except ValueError:\n            vendas_invalidas += 1\n            print(f\"Linha ignorada (dado inválido): {linha}\")\n        else:\n            total_geral += quantidade * preco\n            vendas_validas += 1\n\ntry:\n    ticket_medio = total_geral / vendas_validas\nexcept ZeroDivisionError:\n    ticket_medio = 0.0\n\nprint(f\"Vendas válidas: {vendas_validas}\")\nprint(f\"Vendas ignoradas: {vendas_invalidas}\")\nprint(f\"Total: R$ {total_geral:.2f}\")\nprint(f\"Ticket médio: R$ {ticket_medio:.2f}\")\n# saída:\n# Linha ignorada (dado inválido): {'produto': 'Mochila', 'quantidade': '', 'preco': '89.90'}\n# Linha ignorada (dado inválido): {'produto': 'Estojo', 'quantidade': '2', 'preco': 'abc'}\n# Vendas válidas: 3\n# Vendas ignoradas: 2\n# Total: R$ 75.00\n# Ticket médio: R$ 25.00"
                    },
                    {
                        "type": "text",
                        "value": "## De onde veio cada parte\n\nRepare que esse script inteiro é a soma de coisas que você já sabia. A leitura do arquivo com `with` e `csv.DictReader` veio das aulas 1 e 2 deste módulo. O `try`/`except`/`else` que protege a conversão de cada linha veio da aula 3, inclusive o cuidado extra de proteger a divisão final com ZeroDivisionError, para o caso de nenhuma linha ser válida. E os contadores (vendas_validas, vendas_invalidas) e a soma acumulada (total_geral) não são nada além do que você já usava desde o Módulo 3, para somar valores de uma lista.\n\nNenhuma peça aqui é nova. O que muda é que agora elas trabalham juntas, lendo um arquivo de verdade."
                    },
                    {
                        "type": "code",
                        "value": "import csv\n\ncontagem_por_produto = {}\n\nwith open(\"vendas.csv\", \"r\") as arquivo:\n    leitor = csv.DictReader(arquivo)\n    for linha in leitor:\n        produto = linha[\"produto\"]\n        contagem_por_produto[produto] = contagem_por_produto.get(produto, 0) + 1\n\nfor produto, vezes in contagem_por_produto.items():\n    print(f\"{produto}: {vezes} venda(s)\")\n# saída:\n# Caderno: 2 venda(s)\n# Caneta: 1 venda(s)\n# Mochila: 1 venda(s)\n# Estojo: 1 venda(s)\n\n# .get(produto, 0) devolve 0 quando o produto ainda não é uma chave do dicionário,\n# evitando um KeyError na primeira vez que cada produto aparece."
                    },
                    {
                        "type": "quote",
                        "value": "Ler um arquivo, proteger o código de dados ruins com try/except e resumir o resultado com contadores e soma: isso já é, na prática, o primeiro pipeline de dados que você escreveu do zero."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num script que lê um CSV com milhares de linhas, qual a vantagem de colocar a conversão de cada valor (int(), float()) dentro de um try/except?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma linha com dado inválido é ignorada, e o programa segue com as demais",
                                "isCorrect": true
                            },
                            {
                                "text": "O programa fica proibido de abrir arquivos CSV que tenham algum erro",
                                "isCorrect": false
                            },
                            {
                                "text": "O Python corrige sozinho o valor inválido para o tipo de dado certo",
                                "isCorrect": false
                            },
                            {
                                "text": "A leitura do arquivo inteiro fica mais rápida do que sem o try/except",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No script de vendas, o que acontece com o contador vendas_invalidas quando uma linha tem preco igual a \"abc\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É somado em 1, dentro do bloco except daquela linha",
                                "isCorrect": true
                            },
                            {
                                "text": "É zerado, porque o script encontrou um valor inválido",
                                "isCorrect": false
                            },
                            {
                                "text": "Não muda, porque o except só afeta a variável quantidade",
                                "isCorrect": false
                            },
                            {
                                "text": "É somado em 1, mas só depois de todas as linhas serem lidas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere o código:\n\ntotal = 0\nvalidos = 0\nvalores = [\"10\", \"vinte\", \"30\"]\n\nfor texto in valores:\n    try:\n        numero = int(texto)\n    except ValueError:\n        print(\"ignorado\")\n    else:\n        total += numero\n        validos += 1\n\nprint(total, validos)\n\nQual é a saída deste trecho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ignorado uma vez, depois 40 2, pois só vinte falha e os outros dois somam 40",
                                "isCorrect": true
                            },
                            {
                                "text": "ignorado três vezes, depois 0 0, pois nenhum dos três textos vira número",
                                "isCorrect": false
                            },
                            {
                                "text": "nenhum ignorado, depois 60 3, pois int também converte um texto por extenso",
                                "isCorrect": false
                            },
                            {
                                "text": "ignorado uma vez, depois 40 3, pois todo texto lido conta como um item válido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No trecho contagem_por_produto[produto] = contagem_por_produto.get(produto, 0) + 1, para que serve o segundo argumento (0) do get?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É o valor usado quando a chave produto ainda não existe no dicionário",
                                "isCorrect": true
                            },
                            {
                                "text": "É o valor que substitui qualquer número negativo encontrado na contagem",
                                "isCorrect": false
                            },
                            {
                                "text": "É a posição inicial onde o novo item será inserido no dicionário",
                                "isCorrect": false
                            },
                            {
                                "text": "É o número mínimo de vendas para o produto aparecer no resultado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No script de vendas, por que o cálculo de ticket_medio (total_geral dividido por vendas_validas) também fica dentro de um try/except para ZeroDivisionError?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque, se todas as linhas forem inválidas, vendas_validas fica 0 e a divisão quebra",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a divisão de números decimais sempre gera erro de arredondamento em Python",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o csv.DictReader impede qualquer divisão dentro do mesmo bloco with",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque total_geral começa como um texto, e não dá para dividir texto por número",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Python para dados: o próximo passo",
        "aulas": [
            {
                "titulo": "Recap: os pilares do Python",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Recap: os pilares do Python\n\nVocê chegou à última etapa da trilha de Python. Nos módulos anteriores foi uma jornada e tanto: do primeiro `print(\"Olá, mundo\")` até ler arquivos, tratar erros e dar uma espiada em classes. Este módulo não ensina sintaxe nova de verdade; ele fecha o círculo, mostrando por que cada pilar que você aprendeu importa especificamente para ciência de dados, e para onde ir a partir daqui.\n\nAo longo destas cinco aulas você vai: recapitular os pilares da linguagem, manipular um conjunto de dados só com Python puro, sentir na pele por que o pandas existe, conhecer os notebooks que cientistas de dados usam no dia a dia, e fechar com boas práticas e os próximos passos do roadmap."
                    },
                    {
                        "type": "text",
                        "value": "## Tipos: o material com que os dados são feitos\n\n`int`, `float`, `str` e `bool` (módulos 1 e 2) parecem básicos, mas são literalmente do que uma tabela de dados é feita: uma coluna de idade é uma sequência de `int`, uma coluna de preço é uma sequência de `float`, um nome é `str`, uma coluna \"está ativo\" é `bool`. Saber o tipo de um valor antes de calcular com ele evita erros bobos, como tentar tirar a média de uma coluna que, na verdade, veio como texto."
                    },
                    {
                        "type": "text",
                        "value": "## Controle de fluxo: decidir e repetir\n\n`if`, `elif`, `else`, `for`, `while` e list comprehensions (módulo 3) são como você processa muitos valores sem repetir código. Em dados, quase toda tarefa se resume a duas perguntas: \"para cada registro, o que eu faço?\" (`for`) e \"esse registro entra ou não?\" (`if`). Filtrar linhas, somar uma coluna, transformar um valor: tudo isso é controle de fluxo por trás."
                    },
                    {
                        "type": "text",
                        "value": "## Estruturas de dados: como organizar muitos valores\n\nListas, tuplas, dicionários e conjuntos (módulo 4) são as peças de montar. Para dados, uma peça se destaca: o **dicionário** representa muito bem um registro (uma pessoa, uma venda, uma linha), porque associa cada informação a um nome (`\"idade\"`, `\"preco\"`). E uma **lista de dicionários** representa uma tabela inteira, cada dicionário sendo uma linha. Essa ideia é o ponto de partida da próxima aula."
                    },
                    {
                        "type": "text",
                        "value": "## Funções, arquivos e o resto da caixa de ferramentas\n\nFunções (módulo 5) evitam reescrever o mesmo cálculo para cada coluna ou cada arquivo. Ler e escrever arquivos, principalmente CSV com o módulo `csv` (módulo 6), é como os dados de verdade chegam até o seu código, já que raramente alguém digita um dataset à mão. E `try/except` evita que um único valor faltando ou mal formatado derrube o programa inteiro no meio de uma análise."
                    },
                    {
                        "type": "code",
                        "value": "# Um miniprograma que usa os pilares dos módulos 1 a 6 juntos.\ndef classificar_idade(idade):\n    \"\"\"Classifica uma idade em uma faixa etária simples.\"\"\"\n    if idade < 18:\n        return \"menor de idade\"\n    elif idade < 60:\n        return \"adulto\"\n    else:\n        return \"idoso\"\n\n\npessoas = [\n    {\"nome\": \"Ana\", \"idade\": 34},\n    {\"nome\": \"Bruno\", \"idade\": 17},\n    {\"nome\": \"Carla\", \"idade\": 68},\n]\n\nfor pessoa in pessoas:\n    faixa = classificar_idade(pessoa[\"idade\"])\n    print(f\"{pessoa['nome']} tem {pessoa['idade']} anos: {faixa}\")\n\n# Ana tem 34 anos: adulto\n# Bruno tem 17 anos: menor de idade\n# Carla tem 68 anos: idoso"
                    },
                    {
                        "type": "quote",
                        "value": "Tipos, controle de fluxo, estruturas de dados, funções e arquivos não são tópicos separados: juntos, formam o vocabulário que você vai usar para ler, limpar e entender dados pelo resto do roadmap."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você tem uma coluna com os valores 1.75, 1.68 e 1.80 (alturas em metros). Qual tipo básico do Python representa melhor esses valores?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "float, para números com casas decimais",
                                "isCorrect": true
                            },
                            {
                                "text": "int, para números inteiros, sem parte decimal",
                                "isCorrect": false
                            },
                            {
                                "text": "str, para texto delimitado por aspas",
                                "isCorrect": false
                            },
                            {
                                "text": "bool, para valores verdadeiro ou falso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual estrutura representa melhor o registro de uma pessoa, com nome, idade e cidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um dicionário, com uma chave para cada informação",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma lista, com um valor para cada informação",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tupla, com um valor para cada informação",
                                "isCorrect": false
                            },
                            {
                                "text": "Um conjunto, com um valor para cada informação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código [x * 2 for x in [3, 5, 8]]?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "[6, 10, 16]",
                                "isCorrect": true
                            },
                            {
                                "text": "[9, 25, 64]",
                                "isCorrect": false
                            },
                            {
                                "text": "[3, 5, 8]",
                                "isCorrect": false
                            },
                            {
                                "text": "[6, 10, 16, 3, 5, 8]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é uma boa razão para usar try/except ao processar dados vindos de um arquivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque um valor com formato inesperado não derruba o programa inteiro",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Python exige try/except sempre que um arquivo é aberto",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque try/except torna a leitura do arquivo mais rápida",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque try/except já fecha o arquivo automaticamente ao final",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função recebe uma lista como parâmetro e faz lista.append(1) dentro dela, sem retornar nada. Depois de chamar a função passando numeros = [1, 2, 3], o que aconteceu com numeros fora da função?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ganhou o elemento 1 no final, porque a lista é mutável e foi alterada dentro da função",
                                "isCorrect": true
                            },
                            {
                                "text": "Continua [1, 2, 3], porque toda função recebe uma cópia independente da lista",
                                "isCorrect": false
                            },
                            {
                                "text": "Vira uma lista vazia, porque passar a lista para a função reseta seu conteúdo",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera erro, porque listas não podem ser alteradas de dentro de uma função",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dados na mão: lista de dicionários como tabela",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Dados na mão: lista de dicionários como tabela\n\nAté aqui você aprendeu listas, dicionários e laços, cada um na sua aula. Agora vem a virada de chave desta trilha: juntos, eles conseguem representar uma tabela de dados, o formato mais comum em ciência de dados, sem precisar de nenhuma biblioteca externa.\n\nA ideia é simples: cada **linha** da tabela vira um dicionário, e cada **coluna** vira uma chave que se repete em todos os dicionários. Uma lista desses dicionários representa a tabela inteira. É mais verboso do que o que vem depois nesta trilha (aviso: pandas), mas entender esse formato na mão é o que vai fazer o pandas fazer sentido de verdade mais adiante.\n\nNesta aula você vai usar esse formato para calcular a média de uma coluna, contar registros por categoria e filtrar linhas, tudo com o Python que você já conhece: `for`, `if` e dicionários."
                    },
                    {
                        "type": "code",
                        "value": "# Uma \"tabela\" de vendas, representada como lista de dicionários.\n# Cada dicionário é uma linha; as chaves (\"produto\", \"categoria\", ...) são as colunas.\nvendas = [\n    {\"produto\": \"Caderno\", \"categoria\": \"Papelaria\", \"preco\": 12.50, \"quantidade\": 3},\n    {\"produto\": \"Caneta\", \"categoria\": \"Papelaria\", \"preco\": 2.00, \"quantidade\": 10},\n    {\"produto\": \"Lápis\", \"categoria\": \"Papelaria\", \"preco\": 1.50, \"quantidade\": 20},\n    {\"produto\": \"Mouse\", \"categoria\": \"Eletrônicos\", \"preco\": 45.00, \"quantidade\": 2},\n    {\"produto\": \"Teclado\", \"categoria\": \"Eletrônicos\", \"preco\": 89.90, \"quantidade\": 1},\n    {\"produto\": \"Fone de ouvido\", \"categoria\": \"Eletrônicos\", \"preco\": 59.90, \"quantidade\": 4},\n]\n\nprint(vendas[0])\nprint(f\"Total de linhas: {len(vendas)}\")\n# {'produto': 'Caderno', 'categoria': 'Papelaria', 'preco': 12.5, 'quantidade': 3}\n# Total de linhas: 6"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Produto\", \"Categoria\", \"Preço\", \"Quantidade\"], [\"Caderno\", \"Papelaria\", \"12.50\", \"3\"], [\"Caneta\", \"Papelaria\", \"2.00\", \"10\"], [\"Lápis\", \"Papelaria\", \"1.50\", \"20\"], [\"Mouse\", \"Eletrônicos\", \"45.00\", \"2\"], [\"Teclado\", \"Eletrônicos\", \"89.90\", \"1\"], [\"Fone de ouvido\", \"Eletrônicos\", \"59.90\", \"4\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# Calcular a média de uma coluna (\"preco\"), só com Python puro:\n# somar tudo e dividir pela quantidade de linhas.\ntotal = 0\nfor venda in vendas:\n    total += venda[\"preco\"]\n\nmedia_preco = total / len(vendas)\nprint(f\"Preço médio: R$ {media_preco:.2f}\")\n# Preço médio: R$ 35.13"
                    },
                    {
                        "type": "code",
                        "value": "# Filtrar linhas: só os produtos da categoria \"Eletrônicos\".\neletronicos = [venda for venda in vendas if venda[\"categoria\"] == \"Eletrônicos\"]\n\nfor venda in eletronicos:\n    print(venda[\"produto\"])\n# Mouse\n# Teclado\n# Fone de ouvido"
                    },
                    {
                        "type": "code",
                        "value": "# Contar quantos produtos existem por categoria, agrupando num dicionário.\ncontagem_por_categoria = {}\nfor venda in vendas:\n    categoria = venda[\"categoria\"]\n    if categoria not in contagem_por_categoria:\n        contagem_por_categoria[categoria] = 0\n    contagem_por_categoria[categoria] += 1\n\nprint(contagem_por_categoria)\n# {'Papelaria': 3, 'Eletrônicos': 3}\n\n# Repare quantas linhas foram precisas para três cálculos simples.\n# Isso é o assunto da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "Uma lista de dicionários já é uma tabela: cada dicionário é uma linha, cada chave é uma coluna. Com for, if e um dicionário acumulador, dá para calcular médias, contar categorias e filtrar linhas só com Python puro, mesmo que isso custe muitas linhas de código."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na lista de dicionários vendas, cada dicionário representa uma linha da tabela. O que representa cada chave, como \"preco\" ou \"categoria\", dentro desses dicionários?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma coluna da tabela",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma tabela inteira",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tipo de dado do Python",
                                "isCorrect": false
                            },
                            {
                                "text": "Um índice de posição na lista",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um laço percorre uma lista com dois dicionários, {\"preco\": 2.0} e {\"preco\": 12.5}, somando o valor de \"preco\" de cada um numa variável total que começava em 0. Qual é o valor final de total?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "14.5",
                                "isCorrect": true
                            },
                            {
                                "text": "12.5",
                                "isCorrect": false
                            },
                            {
                                "text": "2.0",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você está agrupando vendas por categoria num dicionário acumulador, mas esqueceu de inicializar contagem_por_categoria[categoria] = 0 antes de somar. O que acontece na primeira vez que uma categoria nova aparece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um KeyError, porque essa chave ainda não existe no dicionário",
                                "isCorrect": true
                            },
                            {
                                "text": "O dicionário cria a chave sozinho, já com valor 0",
                                "isCorrect": false
                            },
                            {
                                "text": "O programa roda normalmente, só pulando essa primeira categoria",
                                "isCorrect": false
                            },
                            {
                                "text": "Um TypeError, porque não é possível somar dentro de um dicionário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar eletronicos = [venda for venda in vendas if venda[\"categoria\"] == \"Eletrônicos\"], o que a variável eletronicos passa a conter?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma nova lista, só com os dicionários da categoria \"Eletrônicos\"",
                                "isCorrect": true
                            },
                            {
                                "text": "A lista vendas original, sem nenhuma alteração",
                                "isCorrect": false
                            },
                            {
                                "text": "Um dicionário com a contagem de produtos eletrônicos",
                                "isCorrect": false
                            },
                            {
                                "text": "Um único dicionário, o primeiro produto eletrônico encontrado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Comparado a uma planilha do tipo Excel, calcular a média de uma coluna com lista de dicionários em Python puro exige:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Escrever um laço que soma os valores e divide pelo total de linhas",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas chamar uma função já pronta de média sobre a coluna",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum código, já que o Python calcula médias de coluna sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Importar uma biblioteca externa logo antes de qualquer cálculo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A dor que o pandas vai resolver",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A dor que o pandas vai resolver\n\nNa aula passada você calculou a média de uma coluna, filtrou linhas e agrupou por categoria usando só `for`, `if` e dicionários. Funcionou, mas deu trabalho. Agora vamos aumentar um pouco a complexidade da tarefa e sentir essa dor de verdade, para você entender exatamente o problema que uma biblioteca chamada **pandas** foi criada para resolver.\n\nCalma: esta aula não ensina pandas. A próxima trilha do roadmap faz isso com calma. Aqui a missão é uma só: motivar por que ele existe."
                    },
                    {
                        "type": "code",
                        "value": "# Tarefa: preço médio por categoria, calculado só com Python puro.\nvendas = [\n    {\"produto\": \"Caderno\", \"categoria\": \"Papelaria\", \"preco\": 12.50},\n    {\"produto\": \"Caneta\", \"categoria\": \"Papelaria\", \"preco\": 2.00},\n    {\"produto\": \"Lápis\", \"categoria\": \"Papelaria\", \"preco\": 1.50},\n    {\"produto\": \"Mouse\", \"categoria\": \"Eletrônicos\", \"preco\": 45.00},\n    {\"produto\": \"Teclado\", \"categoria\": \"Eletrônicos\", \"preco\": 89.90},\n    {\"produto\": \"Fone de ouvido\", \"categoria\": \"Eletrônicos\", \"preco\": 59.90},\n]\n\nvendas_por_categoria = {}\nfor venda in vendas:\n    categoria = venda[\"categoria\"]\n    if categoria not in vendas_por_categoria:\n        vendas_por_categoria[categoria] = []\n    vendas_por_categoria[categoria].append(venda[\"preco\"])\n\nmedia_por_categoria = {}\nfor categoria, precos in vendas_por_categoria.items():\n    media_por_categoria[categoria] = sum(precos) / len(precos)\n\nprint(media_por_categoria)\n# {'Papelaria': 5.333333333333333, 'Eletrônicos': 64.93333333333334}"
                    },
                    {
                        "type": "text",
                        "value": "## Dez linhas só para uma média por categoria\n\nRepare no que foi preciso: um dicionário para acumular listas de preços por categoria, um laço para preencher esse dicionário, outro dicionário para guardar as médias, e mais um laço para calcular cada média. Cerca de dez linhas de lógica, e olha que essa tabela tem só seis produtos e duas categorias.\n\nAgora imagine uma tabela de verdade: milhares de linhas, dezenas de colunas, categorias que você nem sabe quais são de antemão, valores faltando, tipos misturados. O código só cresceria, e cada novo cálculo (mediana, desvio padrão, agrupar por duas colunas ao mesmo tempo) exigiria escrever essa lógica de acumulação de novo, do zero."
                    },
                    {
                        "type": "code",
                        "value": "# Prévia (não precisa entender agora, você aprende pandas na próxima trilha):\nimport pandas as pd\n\ndf = pd.DataFrame(vendas)\nprint(df.groupby(\"categoria\")[\"preco\"].mean())\n\n# categoria\n# Eletrônicos    64.933333\n# Papelaria       5.333333\n# Name: preco, dtype: float64"
                    },
                    {
                        "type": "text",
                        "value": "## Você não perdeu tempo aprendendo Python puro\n\nImportante: pandas não é outra linguagem. Ele é uma biblioteca escrita em Python, que você importa com `import pandas`, e o objeto `DataFrame` que ele te dá é só um objeto Python, parecido com aquelas classes que você viu de leve no módulo 6. Tudo que você aprendeu (tipos, `for`, `if`, dicionários, funções, o próprio `import`) continua sendo a base de tudo. O pandas só empacota padrões repetitivos, como \"somar e dividir por categoria\", em métodos prontos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tarefa\", \"Python nativo\", \"pandas\"], [\"Média de uma coluna\", \"Laço somando e dividindo pelo total\", \"df[\\\"preco\\\"].mean()\"], [\"Contar por categoria\", \"Dicionário acumulador dentro de um for\", \"df[\\\"categoria\\\"].value_counts()\"], [\"Filtrar linhas\", \"List comprehension com if\", \"df[df[\\\"categoria\\\"] == \\\"Eletrônicos\\\"]\"], [\"Ler um CSV grande\", \"Módulo csv, linha por linha\", \"pd.read_csv(\\\"arquivo.csv\\\")\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "pandas não substitui o que você aprendeu, ele constrói em cima disso. A mesma tarefa que levou dez linhas de for e dicionários em Python puro cabe em uma linha de pandas, e é exatamente essa economia que faz dele a ferramenta favorita de quem trabalha com dados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo o que foi apresentado nesta aula, o que é o pandas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma biblioteca Python para trabalhar com dados em formato de tabela",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma linguagem de programação diferente do Python, feita para dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Um programa separado que substitui o interpretador Python",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tipo de banco de dados para guardar tabelas grandes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No código que agrupa preços por categoria, depois do primeiro for (antes de calcular as médias), o que a variável vendas_por_categoria contém na chave \"Papelaria\"?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A lista [12.5, 2.0, 1.5], com o preço de cada produto da categoria",
                                "isCorrect": true
                            },
                            {
                                "text": "O número 16.0, com a soma dos preços já calculada",
                                "isCorrect": false
                            },
                            {
                                "text": "O número 3, com a contagem de produtos da categoria",
                                "isCorrect": false
                            },
                            {
                                "text": "O texto \"Papelaria\", repetido para cada produto encontrado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo a comparação entre Python nativo e pandas vista nesta aula, qual é a principal vantagem do pandas para tarefas como média por coluna ou contagem por categoria?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Faz num método pronto o que em Python puro exige escrever um laço",
                                "isCorrect": true
                            },
                            {
                                "text": "Elimina de vez a necessidade de aprender laços e dicionários",
                                "isCorrect": false
                            },
                            {
                                "text": "Só funciona com arquivos CSV, nunca com listas de dicionários",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui o Python por uma linguagem de consulta parecida com SQL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O DataFrame do pandas, citado nesta aula, é um exemplo do quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um objeto Python, parecido com as classes vistas no módulo 6",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma estrutura nova, que substitui listas e dicionários no Python",
                                "isCorrect": false
                            },
                            {
                                "text": "Um arquivo de configuração do Python, separado do código",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma função da biblioteca padrão do Python",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o código de cálculo por categoria ficaria ainda mais trabalhoso numa tabela real, com milhares de linhas e várias colunas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cada novo cálculo pediria escrever de novo toda a lógica de acumulação",
                                "isCorrect": true
                            },
                            {
                                "text": "Listas de dicionários deixam de funcionar direito acima de mil linhas",
                                "isCorrect": false
                            },
                            {
                                "text": "O Python fica bem mais lento pra ler arquivos grandes, mesmo sem cálculo",
                                "isCorrect": false
                            },
                            {
                                "text": "Dicionários não conseguem guardar mais de duas categorias diferentes",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Notebooks (Jupyter e Colab)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Notebooks: Jupyter e Google Colab\n\nAté agora, todo código deste curso rodou de um jeito só: um arquivo .py, executado do começo ao fim, de cima a baixo (como você viu lá no módulo 1). Isso funciona bem para programas prontos, mas cientistas de dados raramente escrevem um programa pronto de primeira. Eles exploram: carregam um pedaço dos dados, olham o que tem ali, tentam um cálculo, ajustam, tentam de novo.\n\nPara esse tipo de trabalho existe um jeito diferente de rodar Python: o notebook. Nesta aula você conhece os dois mais usados no mundo de dados, o Jupyter e o Google Colab, sem precisar instalar nada agora."
                    },
                    {
                        "type": "text",
                        "value": "## Células que rodam (e mostram o resultado na hora)\n\nUm notebook é dividido em células. Cada célula pode ter texto explicativo (em markdown) ou código Python, e você roda uma célula de cada vez, na ordem que quiser, não obrigatoriamente de cima para baixo.\n\nA diferença que mais chama atenção de quem vem de um arquivo .py: o resultado da célula aparece logo abaixo dela, na hora, sem precisar rodar o arquivo inteiro de novo. E as variáveis que você criou numa célula continuam disponíveis nas células seguintes, porque o notebook mantém tudo isso vivo na memória enquanto está aberto."
                    },
                    {
                        "type": "code",
                        "value": "# Um notebook não é um arquivo .py comum, mas dá para imaginar cada bloco abaixo\n# como uma célula separada, rodada em sequência, na ordem em que aparecem aqui.\n\n# --- Célula 1 ---\nimport random\nrandom.seed(7)\nnumeros = [random.randint(1, 100) for _ in range(5)]\nnumeros\n# A célula mostra isso na hora, sem precisar de print():\n# [42, 20, 51, 84, 7]\n\n# --- Célula 2 (rodada depois; \"numeros\" da célula 1 continua disponível) ---\nmedia = sum(numeros) / len(numeros)\nmedia\n# A célula mostra: 40.8"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Jupyter\", \"Google Colab\"], [\"Onde roda\", \"No seu computador (ou servidor próprio)\", \"No navegador, em servidores do Google\"], [\"Precisa instalar\", \"Sim, junto com Python (geralmente via Anaconda)\", \"Não, só uma conta Google\"], [\"Onde salva os notebooks\", \"Nas suas pastas locais (arquivos .ipynb)\", \"No Google Drive\"], [\"Ponto de partida sem instalar nada\", \"Não é o mais indicado\", \"Sim, é o mais comum para começar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que cientistas de dados vivem em notebooks\n\nO notebook combina três coisas num único documento: texto explicando o raciocínio, código que roda de verdade, e o resultado desse código (número, tabela, gráfico) logo ali embaixo. É como um caderno de laboratório: você registra o que tentou, o que deu certo e o que descobriu, tudo junto.\n\nIsso encaixa perfeitamente com o jeito que se explora dados: você não sabe de antemão qual pergunta vai fazer depois de ver o resultado da atual. Um notebook deixa rodar só um pedaço, ver o que aconteceu, e decidir o próximo passo sem precisar reexecutar tudo de novo."
                    },
                    {
                        "type": "text",
                        "value": "## Por onde começar\n\nPara quem está aprendendo, o Google Colab costuma ser o ponto de partida mais simples: basta uma conta Google, e o notebook já roda em segundos, sem instalar Python na sua máquina. O Jupyter entra depois, quando você configura um ambiente Python próprio no seu computador (lembra do módulo 5, com `pip` e `venv`?): ele roda localmente e é a escolha mais comum no dia a dia de quem já trabalha com dados.\n\nNos módulos seguintes do roadmap, é bem provável que você veja exemplos rodando dentro de um notebook, e agora você já sabe por quê."
                    },
                    {
                        "type": "quote",
                        "value": "Um notebook é só um outro jeito de rodar o Python que você já aprendeu, em células, com o resultado aparecendo na hora. É essa exploração rápida, tentar, ver o resultado, ajustar, que faz do Jupyter e do Colab o ambiente natural de quem trabalha com dados."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o Google Colab, segundo o que foi visto nesta aula?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um notebook que roda no navegador, em servidores do Google",
                                "isCorrect": true
                            },
                            {
                                "text": "Um programa que precisa ser instalado no computador antes de usar",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma linguagem de programação nova, sem relação com o Python",
                                "isCorrect": false
                            },
                            {
                                "text": "Um editor de texto simples, sem capacidade de rodar código",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar uma célula que cria dados = [10, 20, 30], você roda uma célula seguinte só com sum(dados). O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A célula mostra 60, já que dados continua na memória do notebook",
                                "isCorrect": true
                            },
                            {
                                "text": "Dá erro, porque dados só existe dentro da célula onde foi criado",
                                "isCorrect": false
                            },
                            {
                                "text": "A célula não mostra nada, porque falta um print() explícito ali",
                                "isCorrect": false
                            },
                            {
                                "text": "A célula mostra 10, 20, 30, repetindo a lista em vez de somar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal diferença entre rodar código num notebook e num arquivo .py comum?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "No notebook dá para rodar célula por célula e ver o resultado na hora",
                                "isCorrect": true
                            },
                            {
                                "text": "No notebook o código roda mais rápido, porque usa outra linguagem",
                                "isCorrect": false
                            },
                            {
                                "text": "No notebook não é possível usar variáveis nem funções",
                                "isCorrect": false
                            },
                            {
                                "text": "No notebook o código só roda depois de salvo num arquivo .py",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o formato de células encaixa bem com a exploração de dados, mais do que um script .py rodado do início ao fim?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dá para rodar um pedaço, ver o resultado, e decidir o próximo passo sem reexecutar tudo",
                                "isCorrect": true
                            },
                            {
                                "text": "Notebooks rodam sem nenhum interpretador Python por trás, diferente de um script",
                                "isCorrect": false
                            },
                            {
                                "text": "Um script .py não consegue importar bibliotecas externas como um notebook",
                                "isCorrect": false
                            },
                            {
                                "text": "Notebooks impedem que o código tenha erros de sintaxe",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você roda a célula 2 por engano antes da célula 1, sendo que a célula 2 usa uma variável criada na célula 1. O que provavelmente acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um NameError, porque essa variável ainda não existe na memória",
                                "isCorrect": true
                            },
                            {
                                "text": "O notebook roda a célula 1 primeiro, sozinho, na ordem em que aparece no arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "O Python usa um valor padrão para a variável que ainda não foi criada",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada acontece, porque notebooks ignoram a ordem de execução das células",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Boas práticas (PEP 8) e o próximo passo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Boas práticas (PEP 8) e o próximo passo\n\nVocê já sabe escrever Python que funciona. Esta última aula é sobre escrever Python que funciona bem, no sentido de ser legível por outra pessoa (ou por você mesmo, daqui a três meses, olhando para um notebook de análise que já esqueceu como fez). E, depois, sobre para onde ir a partir daqui.\n\nA comunidade Python tem um guia de estilo oficial chamado **PEP 8**. PEP vem de \"Python Enhancement Proposal\", propostas de melhoria da linguagem, e a de número 8 é especificamente sobre como escrever código Python de um jeito consistente."
                    },
                    {
                        "type": "text",
                        "value": "## O que o PEP 8 recomenda\n\nAlgumas das regras mais importantes do PEP 8, muitas das quais você já vem seguindo desde o módulo 1 sem nem saber o nome:\n\n- **Indentação de 4 espaços** por nível (não tabulação, não 2 espaços).\n- **Nomes descritivos**: `preco_medio` diz muito mais do que `pm` ou `x`.\n- **snake_case** para variáveis e funções (`calcular_media`, `total_vendas`), reservando `PascalCase` para classes (`RegistroAluno`, como no módulo 6).\n- **Espaços ao redor de operadores**: `total = preco + imposto`, não `total=preco+imposto`.\n- **Linhas não muito longas** (o guia sugere até 79 caracteres, embora muitos times usem até 99 ou 100 na prática).\n\nNenhuma dessas regras muda o que o código faz. Um Python mal formatado roda exatamente igual a um bem formatado. A diferença é inteiramente sobre quem vai ler depois."
                    },
                    {
                        "type": "code",
                        "value": "# Fora do PEP 8: funciona, mas é difícil de ler.\ndef calc(l):\n    t = 0\n    for i in l:\n        t = t + i[\"preco\"]\n    return t / len(l)\n\n\n# Seguindo o PEP 8: mesma lógica, nomes que explicam o que a função faz.\ndef calcular_preco_medio(produtos):\n    total = 0\n    for produto in produtos:\n        total = total + produto[\"preco\"]\n    return total / len(produtos)\n\n\n# As duas funções devolvem o mesmo resultado para a mesma lista de produtos.\n# A diferença é o tempo que alguém leva para entender cada uma.\nprodutos = [{\"preco\": 10}, {\"preco\": 20}, {\"preco\": 30}]\nprint(calcular_preco_medio(produtos))\n# 20.0"
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que\", \"Convenção\", \"Exemplo\"], [\"Variável\", \"snake_case\", \"preco_medio\"], [\"Função\", \"snake_case\", \"calcular_media()\"], [\"Constante\", \"MAIUSCULA_COM_UNDERSCORE\", \"TAXA_DE_JUROS\"], [\"Classe\", \"PascalCase\", \"RegistroAluno\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa (ainda mais) em ciência de dados\n\nEm notebooks é comum copiar uma célula, ajustar rapidinho, testar de novo, e acumular nomes de variável tipo `df2`, `df_novo`, `x_final` sem perceber. Nada disso trava o código, mas transforma um notebook num quebra-cabeça para quem for reabrir depois (inclusive você). Nomes claros e um pouco de organização poupam esse trabalho.\n\nExistem ferramentas que checam o PEP 8 automaticamente, como o `flake8`, e outras que reformatam o código sozinhas, como o `black`. Você não precisa decorar o guia inteiro: o hábito de nomear bem e manter a indentação consistente já resolve a maior parte."
                    },
                    {
                        "type": "text",
                        "value": "## O que vem depois desta trilha\n\nFechando este módulo, vale olhar para trás: você saiu de \"o que é um algoritmo\" (lá na trilha de Lógica de Programação) para escrever Python de verdade, com tipos, controle de fluxo, listas, dicionários, funções, arquivos, tratamento de erros e um gostinho de classes. E nesta última aula, viu na prática por que uma lista de dicionários processada na mão é o tipo de tarefa que motivou a existência do pandas.\n\nNo roadmap de Ciência de Dados, os próximos passos são:\n\n- **Estatística e Probabilidade**: o raciocínio por trás de toda análise de dados (média, mediana, distribuição, correlação, o porquê dos números, não só o como calculá-los).\n- **Análise de Dados com pandas**: onde a dor sentida nesta trilha vira solução. DataFrames, leitura de CSVs enormes em uma linha, agrupamentos, filtros e cálculos que aqui exigiam dezenas de linhas.\n\nVocê já programa em Python. Agora vem domar os dados."
                    },
                    {
                        "type": "quote",
                        "value": "PEP 8 não muda o que o código faz, muda quem consegue lê-lo depois. Você fecha esta trilha sabendo a língua; a próxima etapa é aprender a pensar sobre dados (estatística) e a ferramenta que faz esse pensamento render (pandas)."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o PEP 8?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um guia de estilo oficial para escrever código Python de forma consistente",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma versão mais recente do Python, lançada depois do Python 3",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma biblioteca externa que precisa ser instalada com pip",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tipo de erro que o Python mostra quando o código está mal formatado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo segue a convenção de nomes do PEP 8 para uma função que calcula a mediana de uma lista?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "def calcular_mediana(valores):",
                                "isCorrect": true
                            },
                            {
                                "text": "def CalcularMediana(valores):",
                                "isCorrect": false
                            },
                            {
                                "text": "def calcularMediana(valores):",
                                "isCorrect": false
                            },
                            {
                                "text": "def Calcular_Mediana(valores):",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas funções calculam exatamente o mesmo resultado; uma usa nomes como l, t, x, a outra usa lista_precos, total, preco_medio. Segundo o PEP 8, qual a diferença entre elas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Executam igual; a com nomes descritivos é mais fácil de entender depois",
                                "isCorrect": true
                            },
                            {
                                "text": "A com nomes curtos roda mais rápido, porque usa menos memória",
                                "isCorrect": false
                            },
                            {
                                "text": "A com nomes descritivos não pode ser reaproveitada em outro programa",
                                "isCorrect": false
                            },
                            {
                                "text": "Executam igual; nomes de variável só importam dentro de classes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo o fechamento deste módulo, qual trilha do roadmap de Ciência de Dados ensina a manipular dados com DataFrames, o que aqui ainda foi feito na mão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Análise de Dados com pandas",
                                "isCorrect": true
                            },
                            {
                                "text": "Estatística e Probabilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Lógica de Programação",
                                "isCorrect": false
                            },
                            {
                                "text": "Machine Learning",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você reabre um notebook antigo, escrito por você mesmo, e encontra uma função chamada f(x) que faz vários cálculos sem nenhum comentário. Semanas depois, qual é o problema mais provável ao tentar reentender esse código?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Vai ser preciso reler a lógica inteira, já que o nome não indica o que a função faz",
                                "isCorrect": true
                            },
                            {
                                "text": "O código vai dar erro ao rodar de novo, mesmo sem nenhuma mudança",
                                "isCorrect": false
                            },
                            {
                                "text": "A função só pode ser chamada uma vez por notebook, e precisa ser reescrita",
                                "isCorrect": false
                            },
                            {
                                "text": "O Python vai exigir renomear a função antes de rodá-la de novo",
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
