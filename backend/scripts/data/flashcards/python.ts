import type { CartasDaTrilha } from "../../seed-flashcards.ts";

export const python: CartasDaTrilha = {
    trilha: "Python",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quais bibliotecas formam o ecossistema de dados do Python?",
                        verso: "pandas, NumPy, scikit-learn e Matplotlib.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o interpretador faz, diferente de uma linguagem compilada?",
                        verso: "Lê o código linha a linha e roda na hora, sem gerar um executável antes.",
                    },
                    {
                        frente: "Quando o arquivo .py ganha do REPL?",
                        verso: "Quando o programa precisa ser guardado, rodado depois ou compartilhado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que substitui as chaves e o ponto e vírgula em Python?",
                        verso: "A indentação marca o bloco, e a quebra de linha termina o comando.",
                    },
                    {
                        frente: "Qual é o recuo padrão da comunidade Python?",
                        verso: "Quatro espaços por nível de bloco.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual tipo o Python usa para um número como 1.65?",
                        verso: "float, o tipo dos números com casas decimais.",
                    },
                    {
                        frente: "Qual tipo o Python usa para texto?",
                        verso: "str, abreviação de string.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o parâmetro sep do print controla?",
                        verso: "O separador entre os argumentos, que por padrão é um espaço.",
                    },
                    {
                        frente: "O que o input() faz com o programa enquanto espera?",
                        verso: "Pausa a execução até o usuário digitar e apertar Enter.",
                    },
                ],
            },
        },

        2: {
            1: {
                neutra: [
                    {
                        frente: "Por que 10 / 2 devolve 5.0 em vez de 5?",
                        verso: "Porque a barra simples sempre devolve float, mesmo em divisão exata.",
                    },
                    {
                        frente: "Qual operador divide descartando as casas decimais?",
                        verso: "O //, chamado de divisão inteira.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Existe diferença entre aspas simples e duplas em Python?",
                        verso: "Nenhuma de comportamento. A escolha é só de estilo.",
                    },
                    {
                        frente: "O que len() conta numa string?",
                        verso: "Todos os caracteres, os espaços inclusive.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Um método de string altera a string original?",
                        verso: "Não. Ele devolve uma nova, porque string em Python é imutável.",
                    },
                    {
                        frente: "O que o método strip() remove?",
                        verso: "Os espaços do início e do fim do texto.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que texto[::-1] faz?",
                        verso: "Inverte o texto, porque o passo negativo percorre de trás para frente.",
                    },
                    {
                        frente: "Em texto[inicio:fim], o caractere da posição fim entra?",
                        verso: "Não. O corte vai só até fim menos um.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como se escrevem os booleanos em Python?",
                        verso: "True e False, sempre com a primeira letra maiúscula.",
                    },
                ],
            },
        },

        3: {
            1: {
                neutra: [
                    {
                        frente: "O que o else faz numa cadeia de decisões?",
                        verso: "É a resposta padrão quando nenhuma pergunta anterior foi verdadeira.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O for do Python percorre índices ou elementos?",
                        verso: "Elementos: a variável recebe o valor em si, não a posição.",
                    },
                    {
                        frente: "Quando usar range() dentro de um for?",
                        verso: "Só quando você precisa mesmo dos números, não para percorrer uma lista.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando o while é melhor escolha que o for?",
                        verso: "Quando a repetição depende de uma condição que só se sabe rodando.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Com que valor começa o acumulador de achar o maior?",
                        verso: "Com o primeiro valor da coleção, e não com zero.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a receita de uma list comprehension?",
                        verso: "[expressão for item in iterável], com um if opcional no fim.",
                    },
                    {
                        frente: "O que a list comprehension diz, em vez do passo a passo?",
                        verso: "O que você quer: transformar isso, filtrar aquilo.",
                    },
                ],
            },
        },

        4: {
            1: {
                neutra: [
                    {
                        frente: "O que significa dizer que a lista é mutável?",
                        verso: "Dá para alterá-la depois de criada, sem precisar criar outra.",
                    },
                    {
                        frente: "O que significa omitir o início ou o fim num fatiamento?",
                        verso: "Início omitido é desde o começo; fim omitido é até o final.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que intenção a tupla deixa clara no código?",
                        verso: "Que aquele dado é fixo e não deveria mudar.",
                    },
                    {
                        frente: "Que métodos a tupla não tem?",
                        verso: "append, pop e sort, porque ela não muda depois de criada.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre dicionario[chave] e dicionario.get(chave)?",
                        verso: "Com chave ausente, o colchete dá KeyError e o get devolve None.",
                    },
                    {
                        frente: "Um for sozinho num dicionário percorre o quê?",
                        verso: "As chaves, e não os valores.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para que serve principalmente um conjunto em Python?",
                        verso: "Tirar duplicados de uma coleção e comparar dois grupos de dados.",
                    },
                    {
                        frente: "Qual operador devolve o que está nos dois conjuntos?",
                        verso: "O &, que faz a interseção.",
                    },
                    {
                        frente: "Qual operador junta dois conjuntos num só?",
                        verso: "O |, que faz a união.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quando escolher dicionário em vez de lista?",
                        verso: "Quando cada campo precisa de nome, e não de posição.",
                    },
                    {
                        frente: "Desde qual versão o dicionário mantém a ordem de inserção?",
                        verso: "Desde o Python 3.7.",
                    },
                ],
            },
        },

        5: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre parâmetro e argumento?",
                        verso: "Parâmetro é o nome usado dentro da função; argumento é o valor da chamada.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que muda ao chamar uma função com argumentos nomeados?",
                        verso: "A ordem deixa de importar, porque o nome já diz o destino do valor.",
                    },
                    {
                        frente: "Onde os parâmetros com valor default precisam ficar?",
                        verso: "Depois dos que não têm default, senão o Python nem carrega o arquivo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que acontece ao criar, dentro da função, uma variável com nome de global?",
                        verso: "O Python cria uma local nova, e a global de fora fica intocada.",
                    },
                    {
                        frente: "O que é uma lambda?",
                        verso: "Uma função pequena demais para merecer um nome próprio.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre import modulo e from modulo import nome?",
                        verso: "O primeiro traz o módulo inteiro; o segundo, só o que você pediu.",
                    },
                    {
                        frente: "O que é um módulo, na prática?",
                        verso: "Um arquivo Python com funções e variáveis que você importa para usar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que cada projeto merece o próprio ambiente virtual?",
                        verso: "Para a versão de um pacote num projeto nunca brigar com a de outro.",
                    },
                    {
                        frente: "Que comando lista os pacotes já instalados?",
                        verso: "O pip list.",
                    },
                ],
            },
        },

        6: {
            1: {
                neutra: [
                    {
                        frente: "Por que chamar close() na mão é frágil?",
                        verso: "Se o código quebrar antes, a linha nunca roda e o arquivo pode não salvar.",
                    },
                    {
                        frente: "O que o modo r exige do arquivo?",
                        verso: "Que ele já exista, senão o programa quebra.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que significa a sigla CSV?",
                        verso: "Comma-separated values, ou valores separados por vírgula.",
                    },
                    {
                        frente: "Por que usar o módulo csv em vez de separar por vírgula na mão?",
                        verso: "Ele entende as regras do formato, como a vírgula dentro de aspas.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando acontece um ValueError?",
                        verso: "Quando o tipo está certo mas o conteúdo não serve, como vinte virar número.",
                    },
                    {
                        frente: "Quando acontece um KeyError?",
                        verso: "Ao pedir uma chave que não existe no dicionário.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre classe e objeto?",
                        verso: "A classe é o molde; o objeto é o exemplar criado a partir dela.",
                    },
                    {
                        frente: "O que é um atributo de um objeto?",
                        verso: "Um dado guardado dentro dele, acessado pelo ponto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que fazer com uma linha de CSV que traz dado inválido?",
                        verso: "Ignorar aquela linha e seguir, sem derrubar o programa inteiro.",
                    },
                ],
            },
        },

        7: {
            1: {
                neutra: [
                    {
                        frente: "Por que conferir o tipo antes de calcular com uma coluna?",
                        verso: "Uma coluna que veio como texto quebra a média sem avisar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Numa lista de dicionários, o que é cada dicionário e o que é cada chave?",
                        verso: "Cada dicionário é uma linha da tabela e cada chave é uma coluna.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o pandas faz com o que você aprendeu em Python puro?",
                        verso: "Constrói em cima: o cálculo de dez linhas vira um método pronto.",
                    },
                    {
                        frente: "Como o pandas calcula a média de uma coluna?",
                        verso: "Com o método mean() na coluna, no lugar do laço somando e dividindo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde roda o Jupyter e onde roda o Colab?",
                        verso: "O Jupyter no seu computador; o Colab no navegador, em servidores do Google.",
                    },
                    {
                        frente: "O que uma célula de notebook mostra logo abaixo dela?",
                        verso: "O resultado dela na hora, sem precisar rodar o arquivo inteiro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual convenção de nome o PEP 8 pede para variáveis e funções?",
                        verso: "snake_case, com as palavras separadas por underline.",
                    },
                    {
                        frente: "Que convenção o PEP 8 reserva para classes?",
                        verso: "PascalCase, com cada palavra começando em maiúscula.",
                    },
                ],
            },
        },
    },
};
