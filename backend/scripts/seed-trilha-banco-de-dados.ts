// Seed da trilha Banco de Dados (iniciante), estagio 4 do roadmap de Back-end.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-banco-de-dados.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Banco de Dados";
const DESCRICAO =
    "Do modelo relacional ao ORM: SQL para consultar e modificar dados, modelagem e relacionamentos, PostgreSQL na prática, como conectar o back-end ao banco com segurança, e o papel dos ORMs. A camada que dá persistência à sua API.";

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
        "titulo": "Módulo 1 - Por que bancos de dados e o modelo relacional",
        "aulas": [
            {
                "titulo": "O que é um banco de dados e por que você precisa de um",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que bancos de dados e o modelo relacional\n\nNas trilhas anteriores você construiu APIs com Express guardando dados assim: `let tarefas = []`, um array na memória do processo. Funciona bem para testar uma rota, mas quebra na primeira vez que o servidor reinicia ou que duas pessoas usam a API ao mesmo tempo. Neste módulo você entende por que isso acontece e conhece o modelo mental por trás de praticamente todo banco de dados usado em produção: o modelo relacional, com suas tabelas, linhas, colunas e chaves. O SQL de verdade começa no próximo módulo. Aqui você constrói a base que sustenta tudo o que vem depois."
                    },
                    {
                        "type": "text",
                        "value": "## Onde os seus dados moram hoje\n\nEm uma API Express típica, cada rota lê e escreve em uma variável do próprio processo Node: um array de tarefas, um array de usuários, um objeto de configuração. Enquanto o servidor está de pé, tudo funciona. O problema aparece no momento em que esse processo deixa de existir, ou quando mais de uma pessoa mexe nos dados ao mesmo tempo."
                    },
                    {
                        "type": "code",
                        "value": "let tarefas = [];\nlet proximoId = 1;\n\napp.post('/tarefas', (req, res) => {\n  const tarefa = { id: proximoId++, titulo: req.body.titulo, feita: false };\n  tarefas.push(tarefa);\n  res.status(201).json(tarefa);\n});\n\napp.get('/tarefas', (req, res) => {\n  res.json(tarefas);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Os quatro problemas de guardar dados em memória, arquivo ou planilha\n\n- **Os dados somem.** Um deploy, um crash, um `nodemon` recarregando o processo: o array volta a `[]`. Nada do que foi salvo sobrevive.\n- **Não escala.** Um array vive na memória RAM daquele processo. Com poucas dezenas de registros ninguém percebe, mas com milhões, ou a memória acaba, ou cada leitura fica lenta porque o processo precisa manter tudo carregado.\n- **Sem busca eficiente.** Para achar as tarefas do usuário 42 em um array, o código percorre item por item com um `.filter()`. Com 20 itens não dá pra notar a diferença, com 2 milhões, dá.\n- **Sem acesso concorrente seguro.** Duas requisições chegando ao mesmo tempo podem ler e escrever o mesmo array de um jeito inconsistente. E se você rodar mais de uma instância do servidor para aguentar mais tráfego, cada instância tem seu próprio array, cada um com uma versão diferente dos dados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Onde os dados ficam\", \"Sobrevive ao reinício\", \"Busca eficiente\", \"Acesso concorrente seguro\"], [\"Variável em memória\", \"Não\", \"Não\", \"Não\"], [\"Arquivo de texto (.txt, .csv)\", \"Sim\", \"Não\", \"Não\"], [\"Planilha\", \"Sim\", \"Não\", \"Limitado\"], [\"Banco de dados\", \"Sim\", \"Sim\", \"Sim\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Então, o que é um banco de dados\n\nUm banco de dados é um sistema feito para guardar dados de forma organizada, com garantias que memória, arquivo solto e planilha não entregam ao mesmo tempo: os dados persistem depois que qualquer processo termina, existe um jeito eficiente de buscar exatamente o que você precisa, várias pessoas ou aplicações podem ler e escrever ao mesmo tempo sem corromper nada, e a estrutura dos dados é organizada de forma previsível. Guardar dados em algum lugar, qualquer arquivo faz isso. Garantir tudo isso ao mesmo tempo é o trabalho de um banco de dados."
                    },
                    {
                        "type": "quote",
                        "value": "Um banco de dados não é só um lugar para guardar dados: é um sistema que garante que eles sobrevivem, são encontrados rápido e continuam corretos mesmo com muita gente mexendo neles ao mesmo tempo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma API em Express guarda a lista de usuários em `let usuarios = []`. Depois de um deploy que reinicia o servidor, a lista de usuários cadastrados aparece vazia. Qual é a causa mais provável?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os dados viviam apenas na memória do processo, que foi zerada ao reiniciar",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco de dados apagou os registros automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "O Express limita arrays a poucos itens por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "O deploy corrompeu o arquivo de configuração do servidor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é uma garantia que um banco de dados oferece e que uma simples variável em memória não oferece?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Persistência dos dados mesmo depois do processo reiniciar",
                                "isCorrect": true
                            },
                            {
                                "text": "Capacidade de guardar números e textos",
                                "isCorrect": false
                            },
                            {
                                "text": "Uso dentro de uma função JavaScript",
                                "isCorrect": false
                            },
                            {
                                "text": "Velocidade de leitura maior que qualquer estrutura em memória",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema guarda 2 milhões de pedidos em um arquivo de texto, um pedido por linha. Para listar os pedidos de um cliente específico, o programa abre o arquivo inteiro e compara o campo cliente de cada linha, uma a uma. O que esse cenário demonstra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A falta de busca eficiente: sem um índice, é preciso varrer o arquivo inteiro a cada consulta",
                                "isCorrect": true
                            },
                            {
                                "text": "Que arquivos de texto são sempre mais rápidos que bancos de dados para leitura",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o problema seria resolvido apenas trocando o formato do arquivo para JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "Que 2 milhões de linhas é um volume pequeno para qualquer estrutura de dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas instâncias do mesmo servidor Node, rodando em processos separados para aguentar mais tráfego, guardam o estoque de produtos em um array `let estoque = []` dentro de cada processo. O que acontece quando um cliente compra o último item de um produto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cada instância tem sua própria cópia do array, então uma instância pode não saber que o estoque já zerou na outra",
                                "isCorrect": true
                            },
                            {
                                "text": "O Node sincroniza automaticamente os arrays entre os processos",
                                "isCorrect": false
                            },
                            {
                                "text": "O sistema operacional bloqueia a segunda instância até a primeira terminar",
                                "isCorrect": false
                            },
                            {
                                "text": "Não acontece nada: arrays em memória são compartilhados entre processos automaticamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de reservas de assentos de cinema grava as reservas em um arquivo JSON no disco. Dois usuários, em requisições simultâneas, leem o arquivo, veem o assento 12 livre, e cada um grava uma reserva para o assento 12. O resultado é uma reserva sobrescrevendo a outra. Qual garantia, tipicamente oferecida por um banco de dados e ausente nesse sistema baseado em arquivo, evitaria esse problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Controle de acesso concorrente que impede duas escritas conflitantes de corromper o mesmo dado",
                                "isCorrect": true
                            },
                            {
                                "text": "Um formato de arquivo mais compacto que o JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma interface gráfica para editar o arquivo manualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Um nome de arquivo mais descritivo para facilitar a busca",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "SGBD e o modelo relacional: tabelas, linhas e colunas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Se um banco de dados garante persistência, busca eficiente e acesso concorrente, quem entrega tudo isso na prática é um programa chamado SGBD, o Sistema Gerenciador de Banco de Dados. É dentro dele que você vai rodar SQL a partir do próximo módulo.\n\n## O que é um SGBD\n\nUm SGBD é o software que fica entre a sua aplicação e o disco. Ele é responsável por guardar os dados de forma organizada em arquivos internos, controlar várias conexões acessando os dados ao mesmo tempo, aplicar regras que garantem a integridade dos dados, oferecer uma linguagem para consultar e alterar esses dados (o SQL, nos bancos relacionais), cuidar de backup e recuperação, e controlar quem tem permissão para fazer o quê. PostgreSQL, MySQL, SQL Server e SQLite são exemplos de SGBDs. Nesta trilha você vai usar o PostgreSQL, um SGBD relacional gratuito, de código aberto e um dos mais usados do mundo."
                    },
                    {
                        "type": "text",
                        "value": "## O modelo relacional\n\nO PostgreSQL é um SGBD **relacional**: ele organiza tudo em tabelas. O modelo relacional tem três peças, cada uma com um nome técnico e um nome do dia a dia:\n\n- **Tabela** (relação): representa uma entidade do seu domínio, como usuários, tarefas ou produtos.\n- **Linha** (registro ou tupla): representa uma ocorrência específica dessa entidade, um usuário específico, uma tarefa específica.\n- **Coluna** (atributo): representa uma característica que toda linha da tabela tem, como nome, email ou data de criação.\n\nUma tabela `usuarios`, por exemplo, representa a entidade usuário. Cada linha dela é um usuário cadastrado. Cada coluna é uma informação que todo usuário tem."
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\", \"nome\", \"email\"], [\"1\", \"Ana Souza\", \"ana@exemplo.com\"], [\"2\", \"Bruno Lima\", \"bruno@exemplo.com\"], [\"3\", \"Carla Dias\", \"carla@exemplo.com\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo a tabela: linha, coluna e célula\n\nA tabela `usuarios` acima tem 3 linhas (3 usuários) e 3 colunas (id, nome e email). A segunda linha é o registro de Bruno Lima: um conjunto de valores, um para cada coluna, que descreve um único usuário. A coluna `email` guarda o mesmo tipo de informação em todas as linhas, o endereço de email de cada usuário. E o cruzamento de uma linha com uma coluna, um valor específico como `bruno@exemplo.com`, também tem nome: célula."
                    },
                    {
                        "type": "code",
                        "value": "Um jeito de pensar nisso usando o que você já conhece: cada linha da tabela é parecida com um objeto JavaScript, e a tabela inteira é parecida com um array desses objetos.\n\nusuarios = [\n  { id: 1, nome: 'Ana Souza',  email: 'ana@exemplo.com' },\n  { id: 2, nome: 'Bruno Lima', email: 'bruno@exemplo.com' },\n  { id: 3, nome: 'Carla Dias', email: 'carla@exemplo.com' }\n]\n\nA diferença é que, no banco, essa lista de objetos vive de forma persistente, toda linha é obrigada a ter as mesmas colunas, e é o SGBD quem garante essa organização, não o seu código."
                    },
                    {
                        "type": "quote",
                        "value": "No modelo relacional, cada entidade do seu domínio vira uma tabela, cada ocorrência dela vira uma linha, e cada característica dela vira uma coluna. Um SGBD, como o PostgreSQL, é quem guarda, organiza e protege essas tabelas."
                    }
                ],
                "questions": [
                    {
                        "statement": "No modelo relacional, qual é o nome técnico dado a cada linha de uma tabela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Registro (ou tupla)",
                                "isCorrect": true
                            },
                            {
                                "text": "Atributo",
                                "isCorrect": false
                            },
                            {
                                "text": "Relação",
                                "isCorrect": false
                            },
                            {
                                "text": "Esquema",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela `produtos` tem as colunas `id`, `nome` e `preco`. O que cada coluna representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma característica comum a todo produto cadastrado na tabela",
                                "isCorrect": true
                            },
                            {
                                "text": "Um produto específico cadastrado no sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela relacionada dentro do mesmo banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Um comando usado para criar o produto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe está desenhando o banco de dados de um sistema de biblioteca e precisa guardar informações sobre livros e sobre empréstimos. Seguindo o modelo relacional, qual é a abordagem correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar uma tabela `livros` e uma tabela `emprestimos`, cada uma representando uma entidade diferente",
                                "isCorrect": true
                            },
                            {
                                "text": "Guardar livros e empréstimos na mesma tabela, em colunas diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma tabela nova para cada livro cadastrado no sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma coluna nova para cada empréstimo dentro da tabela de livros",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções descreve corretamente o papel de um SGBD como o PostgreSQL?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Gerenciar o armazenamento dos dados em disco, controlar acessos simultâneos e oferecer uma linguagem para consultar e alterar os dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Ser a linguagem usada para escrever o front-end da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir a necessidade de um servidor de aplicação como o Express",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar os dados exclusivamente na memória RAM do computador",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma tabela `tarefas`, a linha com `id = 5` tem os valores `titulo = 'Estudar SQL'` e `feita = false`. Um desenvolvedor atualiza apenas o valor da coluna `feita` para `true`, mantendo `id` e `titulo` iguais. O que aconteceu, em termos do modelo relacional?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O valor de um atributo (coluna) daquele registro (linha) foi alterado, mas ele continua sendo a mesma linha, identificada pelo mesmo id",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma nova tabela foi criada automaticamente para guardar o valor alterado",
                                "isCorrect": false
                            },
                            {
                                "text": "A linha com id 5 se tornou uma nova relação dentro do banco",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna `titulo` também precisa mudar de valor para manter a consistência",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tipos de dados e o esquema de uma tabela",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Toda coluna de uma tabela tem um tipo de dado definido: número inteiro, número com casas decimais, texto, verdadeiro ou falso, data. Isso não é burocracia, é o que garante que o banco guarde, compare e calcule os valores corretamente. E o conjunto de tabelas, colunas e tipos que descreve a estrutura do seu banco tem nome: **esquema** (schema)."
                    },
                    {
                        "type": "text",
                        "value": "## Por que o tipo da coluna importa\n\nSe uma coluna `idade` fosse definida como texto em vez de número, nada impediria que alguém inserisse \"trinta\" junto de \"25\" na mesma coluna. E mesmo só com números guardados como texto, comparações saem erradas: como texto, \"9\" vem depois de \"10\" na ordenação, porque a comparação é feita caractere por caractere, não numericamente. Definir o tipo certo faz o SGBD validar o que entra, rejeitando um valor incompatível na hora de inserir, guardar o dado de forma mais compacta, e permitir operações corretas, como somar uma coluna de preços ou filtrar por um intervalo de datas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo\", \"Guarda\", \"Exemplo\"], [\"INTEGER\", \"número inteiro\", \"1, 42, -7\"], [\"NUMERIC\", \"número com casas decimais exatas\", \"19.90, 1050.75\"], [\"VARCHAR / TEXT\", \"texto\", \"'Ana Souza', 'Comprar leite'\"], [\"BOOLEAN\", \"verdadeiro ou falso\", \"true, false\"], [\"DATE\", \"apenas uma data\", \"2026-07-15\"], [\"TIMESTAMP\", \"data e hora\", \"2026-07-01 09:00:00\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O esquema da tabela\n\nO esquema é a estrutura definida de uma tabela: quais colunas ela tem e qual o tipo de cada uma, decidido antes de qualquer linha existir. Toda linha inserida na tabela precisa respeitar esse esquema, um valor do tipo certo para cada coluna (ou nulo, quando a coluna permite). É esse esquema fixo que faz um banco relacional ser previsível: você sempre sabe, de antemão, quais informações uma linha de `usuarios` ou de `tarefas` vai ter."
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\", \"titulo\", \"feita\", \"prioridade\", \"prazo\", \"criado_em\"], [\"1\", \"Estudar SQL\", \"false\", \"2\", \"2026-07-15\", \"2026-07-01 09:00:00\"], [\"2\", \"Revisar PR\", \"true\", \"1\", \"2026-07-05\", \"2026-06-28 16:45:00\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Esquema da tabela tarefas (a estrutura, não os dados):\n\nid          -> INTEGER, identifica cada tarefa\ntitulo      -> TEXT, o nome da tarefa\nfeita       -> BOOLEAN, verdadeiro ou falso\nprioridade  -> INTEGER, um número de prioridade\nprazo       -> DATE, até quando a tarefa deve ser feita\ncriado_em   -> TIMESTAMP, data e hora em que a tarefa foi criada\n\nA definição de CREATE TABLE que gera esse esquema de verdade no PostgreSQL você vai ver no módulo 5. Por enquanto, o que importa é o modelo: cada coluna tem um nome e um tipo, e é isso que toda linha precisa respeitar."
                    },
                    {
                        "type": "quote",
                        "value": "O esquema é o contrato da sua tabela: define, antes de qualquer dado existir, quais colunas existem e que tipo de valor cada uma aceita. É esse contrato que o SGBD usa para proteger a qualidade dos seus dados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual tipo de dado é mais adequado para uma coluna que guarda a idade de um usuário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "INTEGER",
                                "isCorrect": true
                            },
                            {
                                "text": "BOOLEAN",
                                "isCorrect": false
                            },
                            {
                                "text": "DATE",
                                "isCorrect": false
                            },
                            {
                                "text": "VARCHAR",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual tipo de dado é mais adequado para uma coluna que indica se uma tarefa foi concluída ou não?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "BOOLEAN",
                                "isCorrect": true
                            },
                            {
                                "text": "NUMERIC",
                                "isCorrect": false
                            },
                            {
                                "text": "TIMESTAMP",
                                "isCorrect": false
                            },
                            {
                                "text": "TEXT",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma coluna `preco` foi criada como VARCHAR (texto) em vez de NUMERIC. Um relatório precisa somar o preço de todos os produtos. Qual problema esse tipo incorreto pode causar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Operações matemáticas como soma podem falhar ou exigir conversão manual dos valores de texto para número",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum, o banco converte automaticamente o texto para número sem nenhum efeito colateral",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum, VARCHAR e NUMERIC se comportam de forma idêntica em cálculos",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco impede a criação da coluna, então esse cenário nunca acontece",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um esquema define a coluna `criado_em` como TIMESTAMP. O que essa coluna deve guardar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Data e hora, como o momento exato em que o registro foi criado",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas a data, sem informação de horário",
                                "isCorrect": false
                            },
                            {
                                "text": "Um texto livre descrevendo quando o registro foi criado",
                                "isCorrect": false
                            },
                            {
                                "text": "Um número que representa quantos dias se passaram desde a criação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela `pedidos` tem uma coluna `quantidade` definida como INTEGER. Uma aplicação tenta inserir um pedido com `quantidade = 'dez'`. O que deve acontecer, considerando o esquema definido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O SGBD rejeita a inserção, porque o valor não é compatível com o tipo INTEGER da coluna",
                                "isCorrect": true
                            },
                            {
                                "text": "O SGBD converte automaticamente o texto 'dez' para o número 10",
                                "isCorrect": false
                            },
                            {
                                "text": "O SGBD aceita o valor e guarda 'dez' como texto dentro da coluna INTEGER",
                                "isCorrect": false
                            },
                            {
                                "text": "O SGBD ignora o esquema para essa inserção específica",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Chave primária: identidade de cada linha",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Duas pessoas podem se chamar Ana Souza. Dois produtos podem ter exatamente o mesmo nome. Se você precisa apagar, atualizar ou referenciar uma linha específica de uma tabela, precisa de algo que identifique aquela linha, e só aquela, sem ambiguidade. Essa é a chave primária.\n\n## O que é uma chave primária\n\nA chave primária (primary key, ou PK) é uma coluna, ou um conjunto de colunas, cujo valor é único em cada linha e nunca fica vazio. Ela existe para responder uma pergunta simples: essa linha aqui, e não outra. Nenhuma outra linha da tabela pode ter o mesmo valor de chave primária."
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\", \"nome\", \"email\"], [\"1\", \"Ana Souza\", \"ana.souza@exemplo.com\"], [\"2\", \"Ana Souza\", \"ana2024@exemplo.com\"], [\"3\", \"Bruno Lima\", \"bruno@exemplo.com\"]]"
                    },
                    {
                        "type": "text",
                        "value": "Repare que a coluna `nome` não serve como chave primária dessa tabela: as linhas 1 e 2 têm o mesmo valor, Ana Souza. Se um sistema recebesse o comando apague o usuário Ana Souza, não haveria como saber qual das duas linhas apagar. Já a coluna `id` é única em cada linha: o id 1 é, para sempre, aquele registro específico. É por isso que `id` é a chave primária dessa tabela, e não `nome`."
                    },
                    {
                        "type": "text",
                        "value": "## SERIAL e o autoincremento\n\nNa prática, a forma mais comum de criar uma chave primária é uma coluna `id`, numérica, gerada automaticamente pelo SGBD a cada nova linha: 1, 2, 3, 4, e assim por diante, sem que você precise escolher o valor. No PostgreSQL, esse comportamento existe através do tipo `SERIAL` (e, nas versões mais recentes, também pela sintaxe `GENERATED ... AS IDENTITY`). Você vai criar colunas assim de verdade a partir do módulo 5. Por enquanto, o que importa é o modelo mental: cada inserção ganha automaticamente o próximo número disponível."
                    },
                    {
                        "type": "code",
                        "value": "Cada inserção recebe automaticamente o próximo id disponível, sem que você precise informá-lo:\n\ninserção 1 -> id gerado: 1\ninserção 2 -> id gerado: 2\ninserção 3 -> id gerado: 3\n(a linha com id 2 é apagada)\ninserção 4 -> id gerado: 4   (o PostgreSQL não reaproveita o 2)"
                    },
                    {
                        "type": "quote",
                        "value": "A chave primária é a identidade de uma linha: um valor único, que nunca se repete e nunca fica vazio, usado para dizer exatamente qual registro você quer buscar, atualizar ou apagar. Por isso, praticamente toda tabela tem uma coluna `id` como chave primária."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função da chave primária de uma tabela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Identificar cada linha de forma única, sem repetição e sem valor vazio",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir o tipo de dado de uma coluna",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar o texto mais importante da tabela",
                                "isCorrect": false
                            },
                            {
                                "text": "Ordenar as colunas na ordem em que foram criadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma tabela `usuarios` com a coluna `id` como chave primária, o que acontece se uma nova linha tentar usar um valor de `id` que já existe em outra linha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O banco impede a operação, porque a chave primária não permite valores repetidos",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco aceita normalmente, sem nenhuma restrição",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco apaga a linha mais antiga automaticamente para liberar o valor",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco transforma o novo id em texto para diferenciar das outras linhas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela `clientes` tem duas linhas com o valor 'Ana Souza' na coluna `nome`, mas ids diferentes (`id = 1` e `id = 12`). Um sistema recebe o comando para apagar o cliente Ana Souza. Por que usar o `nome` para identificar a linha a ser apagada é arriscado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o nome não é único, então não há garantia de qual das duas linhas seria apagada",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque nomes não podem ser guardados como texto no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o banco não permite comparar valores de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda coluna de texto se torna automaticamente uma chave primária",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma tabela com `id` gerado automaticamente (autoincremento), a linha com `id = 5` é apagada. Qual é o comportamento esperado ao inserir a próxima linha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O novo id gerado continua a sequência (por exemplo, 6), sem reaproveitar o 5",
                                "isCorrect": true
                            },
                            {
                                "text": "O novo id gerado será 5 novamente, reaproveitando o valor apagado",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela para de aceitar novas inserções até o id ser resetado manualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Todos os ids das linhas restantes são renumerados automaticamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor decide usar a coluna `email` como chave primária de uma tabela `usuarios`, em vez de um `id` numérico gerado automaticamente. Algum tempo depois, um usuário pede para trocar de email cadastrado. Por que essa troca é mais delicada do que quando a chave primária é um `id` numérico?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque mudar a chave primária muda a própria identidade da linha, algo que um id numérico independente do conteúdo não exige",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque colunas de texto ocupam mais espaço em disco do que colunas numéricas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o PostgreSQL não permite fazer UPDATE em colunas de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque emails não podem conter o caractere @ em nenhuma coluna do banco",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Relacional x NoSQL: o mapa dos bancos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Até aqui você viu tabelas, linhas, colunas e chaves: o modelo relacional. Mas ele não é o único jeito de guardar dados. Existe uma família de bancos chamada NoSQL, que inclui bancos de documentos, de chave-valor e de grafo. Cada um resolve um tipo de problema diferente. Para fechar este módulo, vale conhecer o mapa completo, e entender por que esta trilha começa, e passa boa parte do tempo, no modelo relacional."
                    },
                    {
                        "type": "text",
                        "value": "## Bancos de documentos\n\nBancos de documentos, como o MongoDB, guardam cada registro como um documento flexível, parecido com um JSON. Documentos diferentes na mesma coleção podem ter formatos diferentes entre si: não existe um esquema fixo obrigando todas as colunas a existirem em toda linha. Isso ajuda a começar rápido e a guardar dados que naturalmente variam de formato ou têm estrutura aninhada."
                    },
                    {
                        "type": "code",
                        "value": "Documento (bancos como o MongoDB), tudo dentro de um único registro:\n\n{\n  \"nome\": \"Ana Souza\",\n  \"email\": \"ana@exemplo.com\",\n  \"tarefas\": [\n    { \"titulo\": \"Estudar SQL\", \"feita\": false },\n    { \"titulo\": \"Revisar PR\", \"feita\": true }\n  ]\n}\n\nNo modelo relacional, esse mesmo dado fica em duas tabelas separadas, usuarios e tarefas, ligadas por uma chave. Você vai ver como conectar tabelas assim no módulo de relacionamentos."
                    },
                    {
                        "type": "text",
                        "value": "## Chave-valor e grafo\n\nBancos chave-valor, como o Redis, guardam um valor associado a uma chave única, sem relacionamentos e sem uma linguagem de consulta rica: você basicamente pergunta qual é o valor da chave X e recebe a resposta. São extremamente rápidos, ótimos para cache, sessões de usuário e contadores.\n\nBancos de grafo, como o Neo4j, tratam os relacionamentos entre os dados como a peça central, não como um detalhe. Nós representam entidades (uma pessoa, um produto) e arestas representam as conexões entre elas, como Ana segue Bruno ou Bruno comprou o produto X. São muito usados em redes sociais e sistemas de recomendação, onde a pergunta mais comum é sobre como os dados se conectam."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Família\", \"Como organiza os dados\", \"Bom para\", \"Exemplo de SGBD\"], [\"Relacional (SQL)\", \"Tabelas com linhas e colunas, esquema fixo\", \"Dados estruturados e relacionados, integridade forte\", \"PostgreSQL, MySQL\"], [\"Documentos\", \"Documentos tipo JSON, esquema flexível\", \"Dados que variam de formato, prototipagem rápida\", \"MongoDB\"], [\"Chave-valor\", \"Um valor por chave única\", \"Cache, sessões, leituras e escritas muito rápidas\", \"Redis\"], [\"Grafo\", \"Nós e relacionamentos entre eles\", \"Dados fortemente conectados, redes, recomendações\", \"Neo4j\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que esta trilha foca no relacional\n\nO modelo relacional continua sendo a base mais usada em sistemas back-end, e os conceitos que ele ensina (esquema, chaves, integridade, junção entre tabelas) aparecem, de um jeito ou de outro, até em bancos NoSQL. Para dados como usuários, pedidos e pagamentos, informações estruturadas que precisam permanecer consistentes, um banco relacional costuma dar as garantias mais fortes. Dominar SQL e modelagem relacional primeiro também facilita aprender um banco de documentos ou chave-valor depois, quando fizer sentido usar um ao lado do outro. Isso não torna o NoSQL pior, só significa que ele resolve outro tipo de problema."
                    },
                    {
                        "type": "quote",
                        "value": "Relacional e NoSQL não competem entre si, resolvem problemas diferentes. Esta trilha começa pelo modelo relacional porque ele dá a base mais sólida (esquema, chaves, integridade) para modelar dados estruturados, a base que sustenta a maior parte dos sistemas back-end, inclusive os que também usam NoSQL ao lado. A partir do próximo módulo, você começa a escrever SQL de verdade."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções abaixo descreve corretamente um banco de dados de documentos, como o MongoDB?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guarda cada registro como um documento flexível, tipo JSON, sem exigir que todos os documentos tenham exatamente as mesmas colunas",
                                "isCorrect": true
                            },
                            {
                                "text": "Guarda os dados exclusivamente em tabelas com colunas fixas e tipadas",
                                "isCorrect": false
                            },
                            {
                                "text": "É a única família de banco capaz de guardar relacionamentos entre dados",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma linguagem de consulta, assim como o SQL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o principal caso de uso de um banco chave-valor, como o Redis?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Leituras e escritas muito rápidas de valores simples associados a uma chave, como cache e sessões",
                                "isCorrect": true
                            },
                            {
                                "text": "Modelar relacionamentos complexos entre entidades, como em uma rede social",
                                "isCorrect": false
                            },
                            {
                                "text": "Garantir integridade referencial entre várias tabelas",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir totalmente o uso de um banco relacional em qualquer sistema",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe está modelando uma rede social cujo recurso mais importante é sugerir amizades com base em conexões em comum (amigos de amigos). Qual família de banco de dados é mais indicada para esse problema específico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Grafo, porque relacionamentos entre os dados são o foco principal da consulta",
                                "isCorrect": true
                            },
                            {
                                "text": "Chave-valor, porque é a opção mais rápida para qualquer tipo de consulta",
                                "isCorrect": false
                            },
                            {
                                "text": "Relacional, porque só tabelas conseguem guardar usuários",
                                "isCorrect": false
                            },
                            {
                                "text": "Documentos, porque JSON é sempre mais rápido para representar relacionamentos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema financeiro precisa garantir que toda transferência entre contas seja consistente, com dados fortemente estruturados e regras de integridade rígidas. Por que o modelo relacional costuma ser a escolha mais indicada nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque oferece esquema fixo, chaves e garantias de integridade que ajudam a manter os dados consistentes",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque bancos relacionais são sempre mais rápidos do que qualquer banco NoSQL",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque bancos NoSQL não conseguem guardar números com casas decimais",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o modelo relacional dispensa a necessidade de backups",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide usar um banco de documentos para guardar pedidos de um e-commerce sem nenhum planejamento de esquema. Meses depois, os documentos de pedidos têm formatos bem diferentes entre si: alguns têm o campo `desconto`, outros não; alguns guardam o endereço como texto, outros como objeto. Qual é o principal risco dessa flexibilidade quando usada sem disciplina?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A inconsistência entre os documentos dificulta escrever código confiável, já que a aplicação não pode assumir uma estrutura fixa dos dados",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco de documentos rejeita automaticamente qualquer documento com formato diferente dos anteriores",
                                "isCorrect": false
                            },
                            {
                                "text": "Bancos de documentos não permitem esse tipo de crescimento ao longo do tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso é exclusivo de bancos relacionais, já que documentos nunca variam de formato",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - SQL: consultando dados (SELECT)",
        "aulas": [
            {
                "titulo": "SELECT: escolhendo o que ver",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# SELECT: escolhendo o que ver\n\nSe existe um comando que você vai digitar centenas de vezes trabalhando com banco de dados, é o SELECT. Ler dados é, disparado, a operação mais comum em qualquer sistema: toda tela que lista pedidos, todo relatório, todo endpoint GET da sua API termina em uma consulta SELECT rodando no banco.\n\nNeste módulo você vai consultar dados usando sempre a mesma tabela de exemplo, tarefas, como se fosse o banco de um aplicativo de lista de tarefas:\n\n- **id**: identificador único de cada tarefa\n- **titulo**: o texto da tarefa\n- **descricao**: um texto mais longo explicando a tarefa (pode ficar em branco)\n- **concluida**: se a tarefa já foi feita (true ou false)\n- **prioridade**: baixa, media ou alta\n- **criado_em**: a data em que a tarefa foi criada\n\nEssa é a tabela que vamos usar nas 5 aulas do módulo. Dá uma olhada nos dados que estão nela agora:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\", \"titulo\", \"descricao\", \"concluida\", \"prioridade\", \"criado_em\"], [\"1\", \"Configurar ambiente de desenvolvimento\", \"Instalar Node, PostgreSQL e configurar o editor\", \"true\", \"baixa\", \"2026-06-01\"], [\"2\", \"Criar tabela de usuários\", \"NULL\", \"true\", \"alta\", \"2026-06-02\"], [\"3\", \"Implementar autenticação\", \"Login e cadastro com JWT\", \"false\", \"alta\", \"2026-06-03\"], [\"4\", \"Escrever testes de integração\", \"NULL\", \"false\", \"media\", \"2026-06-05\"], [\"5\", \"Revisar pull request do time\", \"NULL\", \"true\", \"media\", \"2026-06-05\"], [\"6\", \"Configurar CI/CD\", \"Pipeline no GitHub Actions\", \"false\", \"alta\", \"2026-06-08\"], [\"7\", \"Atualizar documentação da API\", \"NULL\", \"false\", \"baixa\", \"2026-06-10\"], [\"8\", \"Corrigir bug no login\", \"Usuário não consegue entrar com email maiúsculo\", \"true\", \"alta\", \"2026-06-11\"], [\"9\", \"Planejar sprint seguinte\", \"NULL\", \"false\", \"media\", \"2026-06-13\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- Retorna todas as colunas e todas as linhas da tabela\nSELECT * FROM tarefas;"
                    },
                    {
                        "type": "text",
                        "value": "Repare que a coluna descricao aparece como NULL em boa parte das linhas, como a tarefa 2: é o jeito do banco dizer que aquele valor não foi informado (nem toda tarefa precisa de uma descrição detalhada). Vamos tratar esse tipo de valor ausente com calma na próxima aula, filtrando com WHERE ... IS NULL.\n\nPor enquanto, foque no asterisco (*): ele é um atalho para \"todas as colunas\", útil para explorar uma tabela pequena. Em código de verdade, porém, o mais comum é listar exatamente as colunas que você precisa. Isso deixa a consulta mais clara para quem lê depois, evita trafegar dados que ninguém vai usar (como uma descricao longa que ninguém vai exibir naquela tela) e protege sua aplicação: se alguém adicionar uma coluna nova na tabela amanhã, um SELECT * muda de resultado sem avisar, enquanto um SELECT titulo, prioridade continua retornando exatamente o que você pediu.\n\nTambém dá para renomear uma coluna só no resultado da consulta, sem tocar na tabela de verdade, usando AS:"
                    },
                    {
                        "type": "code",
                        "value": "SELECT titulo AS tarefa, prioridade AS nivel\nFROM tarefas;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"tarefa\", \"nivel\"], [\"Configurar ambiente de desenvolvimento\", \"baixa\"], [\"Criar tabela de usuários\", \"alta\"], [\"Implementar autenticação\", \"alta\"], [\"Escrever testes de integração\", \"media\"], [\"Revisar pull request do time\", \"media\"], [\"Configurar CI/CD\", \"alta\"], [\"Atualizar documentação da API\", \"baixa\"], [\"Corrigir bug no login\", \"alta\"], [\"Planejar sprint seguinte\", \"media\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "SELECT descreve O QUE você quer ver, não como buscar: você lista as colunas (ou usa * para todas) e o PostgreSQL decide o caminho mais eficiente para achar os dados. AS renomeia colunas só no resultado, sem alterar a tabela."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando retorna somente as colunas titulo e prioridade da tabela tarefas, sem apelidos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SELECT titulo, prioridade FROM tarefas;",
                                "isCorrect": true
                            },
                            {
                                "text": "SELECT * FROM tarefas WHERE titulo, prioridade;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT tarefas FROM titulo, prioridade;",
                                "isCorrect": false
                            },
                            {
                                "text": "GET titulo, prioridade FROM tarefas;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a consulta SELECT * FROM tarefas; retorna?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Todas as colunas e todas as linhas da tabela tarefas",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas a primeira coluna da tabela",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga todos os dados da tabela tarefas",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas as linhas em que alguma coluna se chama asterisco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que a coluna concluida apareça no resultado com o nome feita, sem alterar o nome da coluna na tabela de verdade. Qual comando faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SELECT concluida AS feita FROM tarefas;",
                                "isCorrect": true
                            },
                            {
                                "text": "ALTER TABLE tarefas RENAME COLUMN concluida TO feita;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT feita FROM tarefas AS concluida;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT concluida FROM tarefas AS feita;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que, em código de produção, costuma ser melhor escrever SELECT titulo, prioridade FROM tarefas; em vez de SELECT * FROM tarefas;?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque listar as colunas deixa a consulta mais clara, evita trafegar dados desnecessários e protege o código de mudanças futuras na tabela",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque SELECT * é proibido pelo padrão SQL",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque SELECT * não funciona em tabelas com mais de cinco colunas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque SELECT * sempre retorna as colunas em ordem aleatória",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar SELECT titulo AS tarefa, prioridade AS nivel FROM tarefas;, qual afirmação está correta sobre a tabela tarefas armazenada no banco?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As colunas continuam se chamando titulo e prioridade na tabela; AS só muda os nomes exibidos no resultado dessa consulta",
                                "isCorrect": true
                            },
                            {
                                "text": "As colunas titulo e prioridade foram renomeadas permanentemente para tarefa e nivel",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela tarefas foi duplicada com os novos nomes de coluna",
                                "isCorrect": false
                            },
                            {
                                "text": "É preciso rodar um ALTER TABLE logo depois do SELECT para confirmar o novo nome",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "WHERE: filtrando linhas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## WHERE: filtrando linhas\n\nAté agora você viu como escolher colunas. Mas raramente você quer todas as linhas de uma tabela: você quer as tarefas de um projeto específico, os pedidos de hoje, os produtos com estoque baixo. É isso que o WHERE faz: ele filtra as linhas antes de te devolver o resultado.\n\nOs operadores de comparação são os mesmos que você já usa em qualquer linguagem de programação:\n\n- = igual\n- <> (ou !=) diferente\n- > maior que\n- < menor que\n- >= maior ou igual\n- <= maior ou igual\n\nVamos aplicar isso na tabela tarefas:"
                    },
                    {
                        "type": "code",
                        "value": "-- Tarefas com prioridade alta\nSELECT titulo, prioridade FROM tarefas WHERE prioridade = 'alta';\n\n-- Tarefas que ainda não foram concluídas\nSELECT titulo, concluida FROM tarefas WHERE concluida = false;\n\n-- Tarefas criadas depois de 5 de junho de 2026\nSELECT titulo, criado_em FROM tarefas WHERE criado_em > '2026-06-05';\n\n-- Tarefas com prioridade diferente de alta\nSELECT titulo, prioridade FROM tarefas WHERE prioridade <> 'alta';"
                    },
                    {
                        "type": "table",
                        "value": "[[\"titulo\", \"prioridade\"], [\"Criar tabela de usuários\", \"alta\"], [\"Implementar autenticação\", \"alta\"], [\"Configurar CI/CD\", \"alta\"], [\"Corrigir bug no login\", \"alta\"]]"
                    },
                    {
                        "type": "text",
                        "value": "Um único WHERE já resolve muita coisa, mas o poder aparece quando você combina condições:\n\n- **AND**: as duas condições precisam ser verdadeiras\n- **OR**: pelo menos uma precisa ser verdadeira\n- **NOT**: inverte uma condição\n- **LIKE** com %: busca por texto. %teste% significa \"contém teste em qualquer posição\"; teste% significa \"começa com teste\"\n- **IN (...)**: forma curta de dizer \"o valor é um destes\", equivalente a vários OR encadeados\n- **BETWEEN a AND b**: intervalo, incluindo as duas pontas\n- **IS NULL / IS NOT NULL**: para checar valor ausente, como uma tarefa sem descrição preenchida. Não dá para usar = NULL: NULL representa \"desconhecido\", e nada é igual a um valor desconhecido, nem outro NULL. Por isso o SQL tem um operador específico para isso.\n\nExemplos com a tabela tarefas:"
                    },
                    {
                        "type": "code",
                        "value": "-- Tarefas de alta prioridade que ainda não foram concluídas\nSELECT titulo\nFROM tarefas\nWHERE prioridade = 'alta' AND concluida = false;\n\n-- Tarefas de prioridade alta ou média\nSELECT titulo, prioridade\nFROM tarefas\nWHERE prioridade = 'alta' OR prioridade = 'media';\n\n-- O mesmo resultado, de um jeito mais curto\nSELECT titulo, prioridade\nFROM tarefas\nWHERE prioridade IN ('alta', 'media');\n\n-- Tarefas que NÃO estão concluídas\nSELECT titulo\nFROM tarefas\nWHERE NOT concluida;\n\n-- Tarefas cujo título contém a palavra \"teste\"\nSELECT titulo\nFROM tarefas\nWHERE titulo LIKE '%teste%';\n\n-- Tarefas criadas entre os dias 2 e 8 de junho (incluindo as pontas)\nSELECT titulo, criado_em\nFROM tarefas\nWHERE criado_em BETWEEN '2026-06-02' AND '2026-06-08';\n\n-- Tarefas sem descrição preenchida\nSELECT titulo, descricao\nFROM tarefas\nWHERE descricao IS NULL;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"titulo\", \"criado_em\"], [\"Criar tabela de usuários\", \"2026-06-02\"], [\"Implementar autenticação\", \"2026-06-03\"], [\"Escrever testes de integração\", \"2026-06-05\"], [\"Revisar pull request do time\", \"2026-06-05\"], [\"Configurar CI/CD\", \"2026-06-08\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "WHERE filtra linhas antes de montar o resultado. Use =, <>, >, <, >=, <= para comparar; AND, OR e NOT para combinar condições; LIKE com % para buscar texto; IN para uma lista de valores; BETWEEN para intervalos incluindo as pontas; e sempre IS NULL / IS NOT NULL para checar valor ausente, nunca = NULL."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual consulta retorna somente as tarefas com prioridade igual a 'alta'?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SELECT * FROM tarefas WHERE prioridade = 'alta';",
                                "isCorrect": true
                            },
                            {
                                "text": "SELECT * FROM tarefas WHERE prioridade = alta;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT * FROM tarefas WHEN prioridade = 'alta';",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT * FROM tarefas WHERE prioridade == 'alta';",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual palavra-chave combina duas condições no WHERE exigindo que as duas sejam verdadeiras ao mesmo tempo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "AND",
                                "isCorrect": true
                            },
                            {
                                "text": "OR",
                                "isCorrect": false
                            },
                            {
                                "text": "NOT",
                                "isCorrect": false
                            },
                            {
                                "text": "IN",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer encontrar tarefas cujo título contenha a palavra 'teste' em qualquer posição do texto. Qual condição faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "WHERE titulo LIKE '%teste%';",
                                "isCorrect": true
                            },
                            {
                                "text": "WHERE titulo LIKE 'teste';",
                                "isCorrect": false
                            },
                            {
                                "text": "WHERE titulo = '%teste%';",
                                "isCorrect": false
                            },
                            {
                                "text": "WHERE titulo IN '%teste%';",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Várias tarefas ainda não têm a coluna descricao preenchida (aparece como NULL). Qual consulta retorna as tarefas nessa situação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SELECT * FROM tarefas WHERE descricao IS NULL;",
                                "isCorrect": true
                            },
                            {
                                "text": "SELECT * FROM tarefas WHERE descricao = NULL;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT * FROM tarefas WHERE descricao = '';",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT * FROM tarefas WHERE descricao <> NULL;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual consulta é equivalente, em resultado, a SELECT titulo FROM tarefas WHERE prioridade = 'alta' OR prioridade = 'media';?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "SELECT titulo FROM tarefas WHERE prioridade IN ('alta', 'media');",
                                "isCorrect": true
                            },
                            {
                                "text": "SELECT titulo FROM tarefas WHERE prioridade BETWEEN 'alta' AND 'media';",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT titulo FROM tarefas WHERE prioridade = 'alta' AND prioridade = 'media';",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT titulo FROM tarefas WHERE prioridade AND IN ('alta', 'media');",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "ORDER BY e LIMIT: ordenar e limitar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## ORDER BY e LIMIT: ordenar e limitar\n\nSem um ORDER BY, o PostgreSQL não promete devolver as linhas em nenhuma ordem específica: ele pode escolher o caminho mais rápido para achar os dados, e isso não tem relação nenhuma com a ordem que você espera ver. Se a ordem importa (e quase sempre importa), você precisa pedir explicitamente com ORDER BY.\n\nPor padrão, ORDER BY ordena de forma crescente (ASC). Para inverter, use DESC:"
                    },
                    {
                        "type": "code",
                        "value": "-- Da tarefa mais antiga para a mais recente (ASC é o padrão)\nSELECT titulo, criado_em FROM tarefas\nORDER BY criado_em;\n\n-- Da tarefa mais recente para a mais antiga\nSELECT titulo, criado_em FROM tarefas\nORDER BY criado_em DESC;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"titulo\", \"criado_em\"], [\"Planejar sprint seguinte\", \"2026-06-13\"], [\"Corrigir bug no login\", \"2026-06-11\"], [\"Atualizar documentação da API\", \"2026-06-10\"], [\"Configurar CI/CD\", \"2026-06-08\"], [\"Revisar pull request do time\", \"2026-06-05\"], [\"Escrever testes de integração\", \"2026-06-05\"], [\"Implementar autenticação\", \"2026-06-03\"], [\"Criar tabela de usuários\", \"2026-06-02\"], [\"Configurar ambiente de desenvolvimento\", \"2026-06-01\"]]"
                    },
                    {
                        "type": "text",
                        "value": "Note que as tarefas 4 e 5 têm exatamente o mesmo criado_em (2026-06-05). A ordem entre elas no resultado acima não é garantida: o PostgreSQL poderia devolver qualquer uma primeiro. Se isso importa, você desempata acrescentando uma segunda coluna ao ORDER BY, que decide a ordem quando a primeira coluna empata.\n\nDepois de ordenar, também é comum querer só uma fatia do resultado, como as 3 tarefas mais recentes. Para isso existe o LIMIT, que corta o resultado em um número máximo de linhas. Combinado com OFFSET, que pula um número de linhas antes de começar a contar, dá para paginar um resultado: mostrar a página 1, depois a página 2, e assim por diante."
                    },
                    {
                        "type": "code",
                        "value": "-- Tarefas pendentes primeiro, e dentro de cada grupo, da mais antiga para a mais nova\nSELECT titulo, concluida, criado_em\nFROM tarefas\nORDER BY concluida, criado_em;\n\n-- As 3 tarefas criadas mais recentemente\nSELECT titulo, criado_em\nFROM tarefas\nORDER BY criado_em DESC\nLIMIT 3;\n\n-- Paginação: pula as 3 primeiras e traz as 3 seguintes (página 2 de 3 em 3)\nSELECT titulo, criado_em\nFROM tarefas\nORDER BY criado_em DESC\nLIMIT 3 OFFSET 3;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"titulo\", \"criado_em\"], [\"Planejar sprint seguinte\", \"2026-06-13\"], [\"Corrigir bug no login\", \"2026-06-11\"], [\"Atualizar documentação da API\", \"2026-06-10\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "ORDER BY define a ordem do resultado (ASC crescente por padrão, DESC decrescente); mais de uma coluna serve para desempatar. LIMIT corta o número de linhas devolvidas; OFFSET pula linhas antes de começar a contar, o que junto vira paginação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Sem informar ASC ou DESC, em que ordem o ORDER BY organiza o resultado por padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Crescente (ASC)",
                                "isCorrect": true
                            },
                            {
                                "text": "Decrescente (DESC)",
                                "isCorrect": false
                            },
                            {
                                "text": "Ordem aleatória",
                                "isCorrect": false
                            },
                            {
                                "text": "Pela ordem em que as linhas foram inseridas na tabela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual consulta retorna as tarefas da mais recente para a mais antiga, pela data de criação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SELECT * FROM tarefas ORDER BY criado_em DESC;",
                                "isCorrect": true
                            },
                            {
                                "text": "SELECT * FROM tarefas ORDER BY criado_em ASC;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT * FROM tarefas ORDER BY criado_em;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT * FROM tarefas SORT BY criado_em DESC;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual consulta retorna somente as 3 tarefas criadas mais recentemente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SELECT titulo, criado_em FROM tarefas ORDER BY criado_em DESC LIMIT 3;",
                                "isCorrect": true
                            },
                            {
                                "text": "SELECT titulo, criado_em FROM tarefas LIMIT 3;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT titulo, criado_em FROM tarefas ORDER BY criado_em LIMIT 3;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT TOP 3 titulo, criado_em FROM tarefas ORDER BY criado_em DESC;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você está paginando a lista de tarefas em páginas de 3 itens, ordenando por data de criação crescente. Qual consulta traz a página 2 (a segunda leva de 3 tarefas)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SELECT * FROM tarefas ORDER BY criado_em LIMIT 3 OFFSET 3;",
                                "isCorrect": true
                            },
                            {
                                "text": "SELECT * FROM tarefas ORDER BY criado_em LIMIT 3 OFFSET 2;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT * FROM tarefas ORDER BY criado_em LIMIT 2 OFFSET 3;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT * FROM tarefas ORDER BY criado_em OFFSET 3;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As tarefas 4 e 5 têm o mesmo criado_em (2026-06-05). Rodando SELECT titulo, criado_em FROM tarefas ORDER BY criado_em DESC;, o que se pode afirmar sobre a ordem entre essas duas linhas no resultado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não é garantida: como só há uma coluna no ORDER BY, o banco pode devolver as duas em qualquer ordem entre si; para garantir uma ordem específica seria preciso acrescentar uma segunda coluna, como ORDER BY criado_em DESC, titulo",
                                "isCorrect": true
                            },
                            {
                                "text": "O PostgreSQL sempre desempata automaticamente pela ordem alfabética do título",
                                "isCorrect": false
                            },
                            {
                                "text": "O PostgreSQL sempre desempata automaticamente pela ordem de inserção (id crescente)",
                                "isCorrect": false
                            },
                            {
                                "text": "A consulta retorna erro, porque não pode haver duas linhas com o mesmo criado_em",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Contando e somando: funções de agregação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Contando e somando: funções de agregação\n\nAté agora toda consulta devolveu uma linha para cada linha da tabela. Mas boa parte das perguntas que um sistema precisa responder não é \"me mostre as tarefas\", e sim \"quantas tarefas existem?\", \"quantos títulos ainda não foram descritos?\", \"qual o maior título cadastrado?\". Para isso existem as funções de agregação: elas recebem várias linhas e devolvem um único valor resumido.\n\nAs mais usadas:\n\n- **COUNT**: conta linhas\n- **SUM**: soma valores numéricos\n- **AVG**: calcula a média\n- **MAX** / **MIN**: o maior e o menor valor\n\nUma pegadinha importante: COUNT(*) conta todas as linhas, mas COUNT(coluna) conta só as linhas em que aquela coluna não é NULL. SUM, AVG, MAX e MIN também ignoram NULL automaticamente, e só funcionam em valores numéricos. E quando você quer saber quais valores diferentes aparecem em uma coluna, sem repetição, existe o DISTINCT."
                    },
                    {
                        "type": "code",
                        "value": "-- Quantas tarefas existem, e quantas têm uma descrição preenchida?\nSELECT COUNT(*) AS total_tarefas, COUNT(descricao) AS com_descricao\nFROM tarefas;\n\n-- Quais valores de prioridade aparecem na tabela?\nSELECT DISTINCT prioridade FROM tarefas;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"prioridade\"], [\"alta\"], [\"baixa\"], [\"media\"]]"
                    },
                    {
                        "type": "text",
                        "value": "A primeira consulta retorna total_tarefas = 9 e com_descricao = 4: só 4 das 9 tarefas têm uma descrição preenchida, as outras têm NULL nessa coluna. Já o DISTINCT mostrou que existem 3 valores diferentes de prioridade na tabela (alta, baixa e media): toda tarefa sempre tem uma prioridade, porque a coluna tem um valor padrão quando ninguém informa um.\n\nMas repare que nenhuma coluna de tarefas guarda um número: concluida é verdadeiro ou falso, prioridade e titulo são texto. SUM e AVG só funcionam em valores numéricos, então, para usar essas funções aqui, vamos agregar sobre uma expressão calculada a partir de uma coluna, não a coluna direto. titulo é VARCHAR(100); LENGTH(titulo) devolve quantos caracteres cada título tem, o que ajuda a saber se os títulos atuais estão longe desse limite:"
                    },
                    {
                        "type": "code",
                        "value": "-- titulo é VARCHAR(100): quantos caracteres os títulos atuais estão usando?\nSELECT\n  SUM(LENGTH(titulo)) AS total_caracteres,\n  AVG(LENGTH(titulo)) AS media_caracteres,\n  MAX(LENGTH(titulo)) AS maior_titulo,\n  MIN(LENGTH(titulo)) AS menor_titulo\nFROM tarefas;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"total_caracteres\", \"media_caracteres\", \"maior_titulo\", \"menor_titulo\"], [\"233\", \"25.89\", \"38\", \"16\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Funções de agregação transformam várias linhas em um resumo: COUNT conta, SUM soma, AVG tira a média, MAX e MIN pegam os extremos. Todas ignoram NULL, exceto COUNT(*), e exigem valores numéricos (uma coluna numérica ou uma expressão que gere um número, como LENGTH). Para valores únicos, sem repetição, use DISTINCT."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual função retorna o número total de linhas de uma tabela, mesmo as que têm colunas com valor NULL?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "COUNT(*)",
                                "isCorrect": true
                            },
                            {
                                "text": "COUNT(coluna)",
                                "isCorrect": false
                            },
                            {
                                "text": "SUM(*)",
                                "isCorrect": false
                            },
                            {
                                "text": "DISTINCT(*)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual consulta conta somente as tarefas que têm a coluna descricao preenchida (não NULL)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SELECT COUNT(descricao) FROM tarefas;",
                                "isCorrect": true
                            },
                            {
                                "text": "SELECT COUNT(*) FROM tarefas;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT SUM(descricao) FROM tarefas;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT COUNT(titulo) FROM tarefas WHERE descricao;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela tarefas tem 9 linhas ao todo, e a coluna descricao está preenchida em apenas 4 delas (nas outras 5 o valor é NULL). Qual é o resultado de SELECT COUNT(*), COUNT(descricao) FROM tarefas;?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "9 e 4",
                                "isCorrect": true
                            },
                            {
                                "text": "9 e 9",
                                "isCorrect": false
                            },
                            {
                                "text": "4 e 4",
                                "isCorrect": false
                            },
                            {
                                "text": "9 e 5",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual consulta lista, sem repetição, os valores de prioridade usados na tabela tarefas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SELECT DISTINCT prioridade FROM tarefas;",
                                "isCorrect": true
                            },
                            {
                                "text": "SELECT UNIQUE prioridade FROM tarefas;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT prioridade FROM tarefas GROUP DISTINCT;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT COUNT(DISTINCT prioridade) FROM tarefas;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A coluna prioridade é do tipo texto (VARCHAR). O que acontece ao rodar SELECT SUM(prioridade) FROM tarefas;?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O PostgreSQL recusa a consulta com um erro, porque SUM espera uma coluna numérica e prioridade é texto",
                                "isCorrect": true
                            },
                            {
                                "text": "O PostgreSQL soma a quantidade de caracteres de todos os valores de prioridade automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "O PostgreSQL concatena todos os valores de prioridade em um único texto",
                                "isCorrect": false
                            },
                            {
                                "text": "O PostgreSQL ignora a coluna prioridade e retorna 0",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "GROUP BY e HAVING: agrupando dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## GROUP BY e HAVING: agrupando dados\n\nNa aula passada você viu COUNT, SUM, AVG, MAX e MIN aplicados à tabela inteira. Mas a pergunta mais comum no dia a dia não é \"quantas tarefas existem\", e sim \"quantas tarefas existem por prioridade\", \"quantas tarefas cada categoria tem pendente\". Para isso existe o GROUP BY: ele separa as linhas em grupos que compartilham o mesmo valor em uma coluna, e aplica a função de agregação a cada grupo separadamente, não à tabela inteira de uma vez.\n\nUma regra importante: toda coluna que aparece no SELECT sem estar dentro de uma função de agregação também precisa aparecer no GROUP BY. Faz sentido: se cada grupo vira uma única linha no resultado, o banco precisa saber por qual coluna resumir o resto."
                    },
                    {
                        "type": "code",
                        "value": "-- Quantas tarefas existem em cada prioridade?\nSELECT prioridade, COUNT(*) AS quantidade\nFROM tarefas\nGROUP BY prioridade;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"prioridade\", \"quantidade\"], [\"alta\", \"4\"], [\"baixa\", \"2\"], [\"media\", \"3\"]]"
                    },
                    {
                        "type": "text",
                        "value": "Três grupos, um para cada valor de prioridade que existe na tabela. E se você quiser só os grupos que atendem uma condição, como \"somente as prioridades com mais de 2 tarefas\"? É aí que entra o HAVING.\n\nA diferença entre WHERE e HAVING é o momento em que cada um age: WHERE filtra linhas antes de agrupar, por isso não pode usar uma função de agregação. HAVING filtra grupos depois de agrupar e agregar, por isso pode (e geralmente precisa) usar COUNT, SUM, AVG e companhia. As duas cláusulas podem conviver na mesma consulta: primeiro o WHERE reduz as linhas, depois o GROUP BY forma os grupos, e por fim o HAVING decide quais grupos sobrevivem no resultado final."
                    },
                    {
                        "type": "code",
                        "value": "-- Quais prioridades têm mais de 2 tarefas?\nSELECT prioridade, COUNT(*) AS quantidade\nFROM tarefas\nGROUP BY prioridade\nHAVING COUNT(*) > 2;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"prioridade\", \"quantidade\"], [\"alta\", \"4\"], [\"media\", \"3\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "GROUP BY agrupa linhas que compartilham o mesmo valor e aplica agregação a cada grupo. WHERE filtra linhas antes de agrupar, sem agregação; HAVING filtra grupos depois de agregar, com agregação. Ordem lógica de uma consulta: FROM, WHERE, GROUP BY, HAVING, SELECT."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o GROUP BY faz em uma consulta SQL?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Agrupa linhas que têm o mesmo valor em uma coluna, permitindo aplicar funções de agregação a cada grupo separadamente",
                                "isCorrect": true
                            },
                            {
                                "text": "Ordena as linhas pela coluna informada",
                                "isCorrect": false
                            },
                            {
                                "text": "Remove linhas duplicadas do resultado",
                                "isCorrect": false
                            },
                            {
                                "text": "Junta duas tabelas em uma só",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual consulta mostra quantas tarefas existem em cada prioridade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SELECT prioridade, COUNT(*) FROM tarefas GROUP BY prioridade;",
                                "isCorrect": true
                            },
                            {
                                "text": "SELECT prioridade, COUNT(*) FROM tarefas;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT prioridade, COUNT(*) FROM tarefas WHERE COUNT(*) > 0;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT COUNT(prioridade) FROM tarefas GROUP BY id;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a principal diferença entre WHERE e HAVING?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "WHERE filtra linhas antes do agrupamento e não pode usar funções de agregação; HAVING filtra grupos depois do agrupamento e pode usar funções de agregação",
                                "isCorrect": true
                            },
                            {
                                "text": "WHERE e HAVING fazem exatamente a mesma coisa, são apenas sinônimos",
                                "isCorrect": false
                            },
                            {
                                "text": "WHERE só funciona com colunas de texto, e HAVING só funciona com colunas numéricas",
                                "isCorrect": false
                            },
                            {
                                "text": "HAVING substitui o GROUP BY, então as duas cláusulas nunca aparecem juntas na mesma consulta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual consulta retorna somente as prioridades que têm mais de 2 tarefas associadas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SELECT prioridade, COUNT(*) FROM tarefas GROUP BY prioridade HAVING COUNT(*) > 2;",
                                "isCorrect": true
                            },
                            {
                                "text": "SELECT prioridade, COUNT(*) FROM tarefas WHERE COUNT(*) > 2 GROUP BY prioridade;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT prioridade, COUNT(*) FROM tarefas GROUP BY prioridade WHERE COUNT(*) > 2;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT prioridade FROM tarefas HAVING COUNT(*) > 2;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual consulta retorna, para cada prioridade, quantas tarefas NÃO concluídas existem, mostrando apenas as prioridades com mais de 1 tarefa pendente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "SELECT prioridade, COUNT(*) AS pendentes FROM tarefas WHERE concluida = false GROUP BY prioridade HAVING COUNT(*) > 1;",
                                "isCorrect": true
                            },
                            {
                                "text": "SELECT prioridade, COUNT(*) AS pendentes FROM tarefas HAVING COUNT(*) > 1 AND concluida = false GROUP BY prioridade;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT prioridade, COUNT(*) AS pendentes FROM tarefas WHERE concluida = false AND COUNT(*) > 1 GROUP BY prioridade;",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT prioridade, COUNT(*) AS pendentes FROM tarefas GROUP BY prioridade HAVING concluida = false AND COUNT(*) > 1;",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - SQL: inserindo, atualizando e removendo",
        "aulas": [
            {
                "titulo": "INSERT: colocando dados na tabela",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 3 - SQL: inserindo, atualizando e removendo\n\nNo módulo anterior você aprendeu a consultar dados com SELECT: filtrar linhas com WHERE, ordenar com ORDER BY, agregar com COUNT, SUM, AVG e GROUP BY. Só que toda consulta depende de algo já existir na tabela antes. Neste módulo você aprende os três comandos que colocam, alteram e removem dados, INSERT, UPDATE e DELETE, e um conceito que separa um banco de dados sério de uma gambiarra em arquivo: a transação.\n\nVamos continuar com a tabela tarefas usada nos módulos anteriores, com as colunas id, titulo, feita, prioridade, prazo e criado_em. Ela já tem duas tarefas cadastradas:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"titulo\",\"feita\",\"prioridade\",\"prazo\",\"criado_em\"],[\"1\",\"Estudar SQL\",\"false\",\"2\",\"2026-07-15\",\"2026-07-01 09:00:00\"],[\"2\",\"Revisar PR\",\"true\",\"1\",\"2026-07-05\",\"2026-06-28 16:45:00\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A sintaxe do INSERT\n\nO comando para colocar uma linha nova em uma tabela é o INSERT INTO: INSERT INTO tabela (coluna1, coluna2, ...) VALUES (valor1, valor2, ...);. A ordem dos valores precisa bater com a ordem das colunas que você listou, e cada valor precisa ser compatível com o tipo da coluna: texto entre aspas simples, número sem aspas, data entre aspas simples no formato 'AAAA-MM-DD'.\n\nVocê não é obrigado a listar todas as colunas de tarefas. id é a chave primária, gerada automaticamente a cada linha nova, como você viu no módulo 1. feita começa sempre em false (toda tarefa nova começa como não feita) e criado_em recebe o instante em que o INSERT rodou, os dois têm um valor padrão. prazo aceita nulo, então pode ficar de fora quando a tarefa ainda não tem uma data limite definida. Só titulo e prioridade você sempre precisa informar.\n\n## RETURNING: recuperando o id gerado\n\nComo o id de uma tarefa nova só existe depois que o INSERT roda, o back-end normalmente precisa saber qual foi esse id logo em seguida, por exemplo para responder ao cliente da API com o registro recém-criado. Em vez de rodar um segundo SELECT para descobrir isso, algo lento e, com muitos usuários ao mesmo tempo, arriscado (outra inserção pode acontecer entre as duas queries e te fazer pegar o id errado), o PostgreSQL permite pedir o valor de volta na hora com a cláusula RETURNING, no final do próprio INSERT."
                    },
                    {
                        "type": "code",
                        "value": "INSERT INTO tarefas (titulo, prioridade)\nVALUES ('Corrigir bug de login', 1);\n\nINSERT INTO tarefas (titulo, prioridade, prazo)\nVALUES\n    ('Revisar contrato', 2, '2026-07-20'),\n    ('Planejar sprint', 3, '2026-07-25'),\n    ('Responder e-mails', 3, '2026-07-12');"
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"titulo\",\"feita\",\"prioridade\",\"prazo\",\"criado_em\"],[\"1\",\"Estudar SQL\",\"false\",\"2\",\"2026-07-15\",\"2026-07-01 09:00:00\"],[\"2\",\"Revisar PR\",\"true\",\"1\",\"2026-07-05\",\"2026-06-28 16:45:00\"],[\"3\",\"Corrigir bug de login\",\"false\",\"1\",\"NULL\",\"2026-07-10 09:00:00\"],[\"4\",\"Revisar contrato\",\"false\",\"2\",\"2026-07-20\",\"2026-07-10 09:01:00\"],[\"5\",\"Planejar sprint\",\"false\",\"3\",\"2026-07-25\",\"2026-07-10 09:01:00\"],[\"6\",\"Responder e-mails\",\"false\",\"3\",\"2026-07-12\",\"2026-07-10 09:01:00\"]]"
                    },
                    {
                        "type": "code",
                        "value": "INSERT INTO tarefas (titulo, prioridade)\nVALUES ('Ajustar CSS do header', 2)\nRETURNING id, titulo, criado_em;\n\n--  id |         titulo         |        criado_em\n-- ----+-------------------------+---------------------------\n--   7 | Ajustar CSS do header   | 2026-07-10 09:15:32.104219\n-- (1 row)\n--\n-- INSERT 0 1"
                    },
                    {
                        "type": "quote",
                        "value": "O INSERT cria linhas novas; id e colunas com DEFAULT se preenchem sozinhas quando você não informa valor. RETURNING evita uma consulta extra: você já sai do INSERT sabendo o id que o banco gerou, exatamente o que o back-end precisa para responder ao cliente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na tabela tarefas (id gerado automaticamente, titulo TEXT NOT NULL, feita BOOLEAN DEFAULT FALSE), qual comando insere corretamente uma nova tarefa informando o título e a prioridade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "INSERT INTO tarefas (titulo, prioridade) VALUES ('Estudar SQL', 2);",
                                "isCorrect": true
                            },
                            {
                                "text": "INSERT tarefas VALUES ('Estudar SQL', 2);",
                                "isCorrect": false
                            },
                            {
                                "text": "INSERT INTO tarefas SET titulo = 'Estudar SQL', prioridade = 2;",
                                "isCorrect": false
                            },
                            {
                                "text": "UPDATE tarefas (titulo, prioridade) VALUES ('Estudar SQL', 2);",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na tabela tarefas, prioridade é NOT NULL sem valor padrão, feita tem DEFAULT FALSE, criado_em tem DEFAULT NOW() e prazo aceita nulo. Ao rodar INSERT INTO tarefas (titulo, prioridade) VALUES ('Revisar PR', 2);, o que acontece com as colunas que não foram informadas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "id recebe o próximo valor gerado automaticamente, feita e criado_em usam seus valores padrão, e prazo fica NULL, porque aceita nulo",
                                "isCorrect": true
                            },
                            {
                                "text": "A inserção falha, porque todo INSERT precisa informar todas as colunas da tabela",
                                "isCorrect": false
                            },
                            {
                                "text": "A inserção falha, porque a coluna prazo não pode ficar de fora do INSERT",
                                "isCorrect": false
                            },
                            {
                                "text": "id fica NULL até um UPDATE futuro definir seu valor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer inserir três tarefas novas de uma vez, cada uma com título e prioridade: ('Ligar para o cliente', 2), ('Atualizar changelog', 3), ('Revisar contrato', 1). Qual comando faz isso em uma única instrução SQL?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "INSERT INTO tarefas (titulo, prioridade) VALUES ('Ligar para o cliente', 2), ('Atualizar changelog', 3), ('Revisar contrato', 1);",
                                "isCorrect": true
                            },
                            {
                                "text": "INSERT INTO tarefas (titulo, prioridade) VALUES ('Ligar para o cliente', 2) AND ('Atualizar changelog', 3) AND ('Revisar contrato', 1);",
                                "isCorrect": false
                            },
                            {
                                "text": "INSERT INTO tarefas (titulo, prioridade) VALUES ('Ligar para o cliente', 2) VALUES ('Atualizar changelog', 3) VALUES ('Revisar contrato', 1);",
                                "isCorrect": false
                            },
                            {
                                "text": "INSERT INTO tarefas (titulo, prioridade) VALUES ('Ligar para o cliente', 2); ('Atualizar changelog', 3); ('Revisar contrato', 1);",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota POST /tarefas da API precisa devolver ao cliente o JSON da tarefa recém-criada, incluindo o id que o banco gerou. Qual abordagem resolve isso em uma única ida ao banco, sem depender de uma segunda consulta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "INSERT INTO tarefas (titulo, prioridade) VALUES ('Nova tarefa', 2) RETURNING id, titulo, criado_em;",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar o INSERT normal e, em seguida, SELECT * FROM tarefas ORDER BY id DESC LIMIT 1;",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar o INSERT normal e, em seguida, SELECT MAX(id) FROM tarefas;",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar o INSERT normal e assumir que o id é sempre o total de linhas da tabela mais um",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A sequência que gera o id de tarefas está prestes a produzir 8 como próximo valor. Alguém roda manualmente INSERT INTO tarefas (id, titulo, prioridade) VALUES (8, 'Ajuste manual', 2);. Logo depois, roda INSERT INTO tarefas (titulo, prioridade) VALUES ('Tarefa nova', 3); sem informar id. O que provavelmente acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O segundo INSERT tenta usar o id 8 de novo, porque a sequência não foi avisada da inserção manual, e falha por violar a chave primária",
                                "isCorrect": true
                            },
                            {
                                "text": "O segundo INSERT gera o id 9 normalmente, sem nenhum problema",
                                "isCorrect": false
                            },
                            {
                                "text": "O PostgreSQL detecta o conflito e ajusta a sequência sozinho antes de inserir",
                                "isCorrect": false
                            },
                            {
                                "text": "O primeiro INSERT falha, porque não é permitido informar um valor explícito para a chave primária",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "UPDATE: alterando dados com segurança",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## UPDATE: alterando dados que já existem\n\nA tabela tarefas terminou a aula anterior com sete linhas. Só que tarefa não fica parada: você termina uma, muda a prioridade de outra, empurra o prazo de uma terceira. Para isso existe o UPDATE, o comando que altera valores de linhas que já existem, sem apagar e recriar nada.\n\n## A sintaxe do UPDATE\n\nA estrutura é UPDATE tabela SET coluna1 = valor1, coluna2 = valor2 WHERE condicao;. O SET diz o que muda, o WHERE diz em quais linhas. Você pode alterar uma coluna só ou várias de uma vez, separando por vírgula. E, assim como no SELECT, o WHERE aceita qualquer condição: igualdade, comparação, LIKE, IN e por aí vai."
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"titulo\",\"feita\",\"prioridade\",\"prazo\",\"criado_em\"],[\"1\",\"Estudar SQL\",\"false\",\"2\",\"2026-07-15\",\"2026-07-01 09:00:00\"],[\"2\",\"Revisar PR\",\"true\",\"1\",\"2026-07-05\",\"2026-06-28 16:45:00\"],[\"3\",\"Corrigir bug de login\",\"false\",\"1\",\"NULL\",\"2026-07-10 09:00:00\"],[\"4\",\"Revisar contrato\",\"false\",\"2\",\"2026-07-20\",\"2026-07-10 09:01:00\"],[\"5\",\"Planejar sprint\",\"false\",\"3\",\"2026-07-25\",\"2026-07-10 09:01:00\"],[\"6\",\"Responder e-mails\",\"false\",\"3\",\"2026-07-12\",\"2026-07-10 09:01:00\"],[\"7\",\"Ajustar CSS do header\",\"false\",\"2\",\"NULL\",\"2026-07-10 09:15:32\"]]"
                    },
                    {
                        "type": "code",
                        "value": "UPDATE tarefas\nSET feita = true\nWHERE id = 3;\n\nUPDATE tarefas\nSET prioridade = 1, prazo = '2026-07-18'\nWHERE id = 6;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"titulo\",\"feita\",\"prioridade\",\"prazo\",\"criado_em\"],[\"1\",\"Estudar SQL\",\"false\",\"2\",\"2026-07-15\",\"2026-07-01 09:00:00\"],[\"2\",\"Revisar PR\",\"true\",\"1\",\"2026-07-05\",\"2026-06-28 16:45:00\"],[\"3\",\"Corrigir bug de login\",\"true\",\"1\",\"NULL\",\"2026-07-10 09:00:00\"],[\"4\",\"Revisar contrato\",\"false\",\"2\",\"2026-07-20\",\"2026-07-10 09:01:00\"],[\"5\",\"Planejar sprint\",\"false\",\"3\",\"2026-07-25\",\"2026-07-10 09:01:00\"],[\"6\",\"Responder e-mails\",\"false\",\"1\",\"2026-07-18\",\"2026-07-10 09:01:00\"],[\"7\",\"Ajustar CSS do header\",\"false\",\"2\",\"NULL\",\"2026-07-10 09:15:32\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O perigo real de esquecer o WHERE\n\nO WHERE não é um detalhe de estilo, é o que restringe o UPDATE às linhas certas. Se você rodar UPDATE tarefas SET feita = true; sem WHERE, o PostgreSQL não pede confirmação nem avisa que parece perigoso, ele aplica SET feita = true em todas as linhas da tabela, porque, sem WHERE, a condição passa a valer para qualquer linha.\n\nEm produção isso é o tipo de erro que vira incidente: imagine esse mesmo esquecimento em UPDATE usuarios SET senha_hash = '...' ou UPDATE pedidos SET status = 'cancelado'. O único sinal imediato costuma ser a contagem de linhas que o próprio comando devolve."
                    },
                    {
                        "type": "code",
                        "value": "-- rodado por engano, sem WHERE\nUPDATE tarefas SET feita = true;\n-- UPDATE 7\n-- eram 7 linhas na tabela inteira, não só a que você queria mudar\n\n-- hábito seguro: primeiro confira o que seria afetado\nSELECT id, titulo FROM tarefas WHERE prioridade = 1;\n\n-- só então rode o UPDATE com o mesmo filtro\nUPDATE tarefas SET feita = true WHERE prioridade = 1;\n-- UPDATE 3"
                    },
                    {
                        "type": "quote",
                        "value": "UPDATE sem WHERE não avisa, não pede confirmação e não faz o que você queria: ele muda a tabela inteira. Antes de rodar um UPDATE em produção, rode a mesma condição num SELECT primeiro e confira se a quantidade de linhas bate com o que você espera mudar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando marca como feita apenas a tarefa de id igual a 5, na tabela tarefas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "UPDATE tarefas SET feita = true WHERE id = 5;",
                                "isCorrect": true
                            },
                            {
                                "text": "UPDATE tarefas SET feita = true;",
                                "isCorrect": false
                            },
                            {
                                "text": "UPDATE tarefas WHERE id = 5 SET feita = true;",
                                "isCorrect": false
                            },
                            {
                                "text": "UPDATE tarefas SET id = 5 WHERE feita = true;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a cláusula WHERE faz dentro de um comando UPDATE?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Define quais linhas da tabela serão alteradas pelo SET",
                                "isCorrect": true
                            },
                            {
                                "text": "Define quais colunas serão alteradas",
                                "isCorrect": false
                            },
                            {
                                "text": "Cria uma nova linha caso nenhuma corresponda à condição",
                                "isCorrect": false
                            },
                            {
                                "text": "Ordena as linhas antes de aplicar a alteração",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tarefa de id 6 mudou de prioridade e ganhou um novo prazo ao mesmo tempo. Qual comando faz as duas alterações em uma única instrução?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "UPDATE tarefas SET prioridade = 1, prazo = '2026-07-18' WHERE id = 6;",
                                "isCorrect": true
                            },
                            {
                                "text": "UPDATE tarefas SET prioridade = 1 AND prazo = '2026-07-18' WHERE id = 6;",
                                "isCorrect": false
                            },
                            {
                                "text": "UPDATE tarefas SET prioridade = 1 WHERE id = 6, SET prazo = '2026-07-18' WHERE id = 6;",
                                "isCorrect": false
                            },
                            {
                                "text": "UPDATE tarefas WHERE id = 6 SET prioridade = 1, prazo = '2026-07-18';",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Alguém executa por engano UPDATE tarefas SET feita = true; numa tabela com 7 linhas. O comando roda sem erro. O que aconteceu de fato no banco?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As 7 linhas da tabela tiveram a coluna feita alterada para true, porque não havia WHERE para restringir quais linhas mudariam",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma linha foi alterada, porque o PostgreSQL exige WHERE em todo UPDATE",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas a primeira linha da tabela foi alterada",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando falha silenciosamente e não altera nada, mas registra um aviso no log",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de rodar um UPDATE tarefas SET prioridade = 1 WHERE feita = false AND prioridade = 2; em uma tabela de produção com milhares de linhas, qual prática reduz o risco de alterar mais linhas do que o esperado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Rodar antes um SELECT COUNT(*) FROM tarefas WHERE feita = false AND prioridade = 2; e conferir se o número bate com o esperado",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover o WHERE para o UPDATE rodar mais rápido e conferir o resultado depois",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar AND por OR na condição para ter certeza de pegar todas as linhas",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar o UPDATE direto e, se der errado, apagar a tabela e recriar com os dados corretos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "DELETE: removendo dados (e o soft delete)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## DELETE: removendo linhas da tabela\n\nA tarefa \"Revisar contrato\" (id 4) foi cancelada e não faz mais sentido manter na tabela. Para isso existe o DELETE, o comando que remove linhas inteiras. A sintaxe é direta: DELETE FROM tabela WHERE condicao;. Não existe SET, porque o DELETE não altera colunas, ele remove a linha inteira que casa com a condição.\n\nAssim como no UPDATE, o WHERE do DELETE aceita qualquer condição: por id, por uma coluna de texto, por uma faixa de datas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"titulo\",\"feita\",\"prioridade\",\"prazo\",\"criado_em\"],[\"1\",\"Estudar SQL\",\"false\",\"2\",\"2026-07-15\",\"2026-07-01 09:00:00\"],[\"2\",\"Revisar PR\",\"true\",\"1\",\"2026-07-05\",\"2026-06-28 16:45:00\"],[\"3\",\"Corrigir bug de login\",\"true\",\"1\",\"NULL\",\"2026-07-10 09:00:00\"],[\"4\",\"Revisar contrato\",\"false\",\"2\",\"2026-07-20\",\"2026-07-10 09:01:00\"],[\"5\",\"Planejar sprint\",\"false\",\"3\",\"2026-07-25\",\"2026-07-10 09:01:00\"],[\"6\",\"Responder e-mails\",\"false\",\"1\",\"2026-07-18\",\"2026-07-10 09:01:00\"],[\"7\",\"Ajustar CSS do header\",\"false\",\"2\",\"NULL\",\"2026-07-10 09:15:32\"]]"
                    },
                    {
                        "type": "code",
                        "value": "DELETE FROM tarefas\nWHERE id = 4;\n-- DELETE 1"
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"titulo\",\"feita\",\"prioridade\",\"prazo\",\"criado_em\"],[\"1\",\"Estudar SQL\",\"false\",\"2\",\"2026-07-15\",\"2026-07-01 09:00:00\"],[\"2\",\"Revisar PR\",\"true\",\"1\",\"2026-07-05\",\"2026-06-28 16:45:00\"],[\"3\",\"Corrigir bug de login\",\"true\",\"1\",\"NULL\",\"2026-07-10 09:00:00\"],[\"5\",\"Planejar sprint\",\"false\",\"3\",\"2026-07-25\",\"2026-07-10 09:01:00\"],[\"6\",\"Responder e-mails\",\"false\",\"1\",\"2026-07-18\",\"2026-07-10 09:01:00\"],[\"7\",\"Ajustar CSS do header\",\"false\",\"2\",\"NULL\",\"2026-07-10 09:15:32\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O mesmo perigo do WHERE ausente, e a ideia do soft delete\n\nDELETE FROM tarefas; sem WHERE apaga as seis linhas que sobraram, de uma vez, sem pedir confirmação. É o mesmo problema do UPDATE, só que pior: um UPDATE sem WHERE ainda deixa as linhas lá, com dado errado, algo recuperável se você perceber rápido e souber qual era o valor antigo. Um DELETE sem WHERE apaga o dado, e sem um backup ou uma transação em aberto, ele não volta.\n\nPor isso, muitos sistemas evitam usar DELETE em tabelas que guardam algo importante e usam o chamado soft delete: em vez de remover a linha, você marca ela como removida numa coluna própria. A linha continua na tabela, então nada se perde, dá pra auditar ou desfazer, mas o sistema passa a tratá-la como se não existisse mais nas consultas do dia a dia."
                    },
                    {
                        "type": "code",
                        "value": "-- a sintaxe completa de ALTER TABLE e constraints vem no módulo 5; aqui o que importa é a ideia\nALTER TABLE tarefas ADD COLUMN removida BOOLEAN NOT NULL DEFAULT FALSE;\n\n-- em vez de DELETE FROM tarefas WHERE id = 7;\nUPDATE tarefas SET removida = true WHERE id = 7;\n\n-- as consultas do dia a dia passam a filtrar as removidas\nSELECT id, titulo FROM tarefas WHERE removida = false;"
                    },
                    {
                        "type": "quote",
                        "value": "DELETE apaga de verdade, e sem WHERE apaga a tabela inteira. Antes de remover, pergunte-se se o dado precisa mesmo desaparecer ou só sair de vista: se for a segunda opção, um soft delete (uma coluna removida e um UPDATE) costuma ser mais seguro do que um DELETE."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando remove da tabela tarefas apenas a linha com id igual a 4?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "DELETE FROM tarefas WHERE id = 4;",
                                "isCorrect": true
                            },
                            {
                                "text": "DELETE tarefas WHERE id = 4;",
                                "isCorrect": false
                            },
                            {
                                "text": "DELETE FROM tarefas;",
                                "isCorrect": false
                            },
                            {
                                "text": "REMOVE FROM tarefas WHERE id = 4;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal diferença entre UPDATE e DELETE?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "UPDATE altera valores de colunas em linhas que continuam existindo; DELETE remove a linha inteira da tabela",
                                "isCorrect": true
                            },
                            {
                                "text": "UPDATE remove linhas; DELETE altera colunas",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois fazem a mesma coisa, apenas com nomes diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "UPDATE só funciona com números; DELETE só funciona com texto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que acontece ao rodar DELETE FROM tarefas; sem nenhuma cláusula WHERE?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Todas as linhas da tabela tarefas são removidas, mas a tabela em si (a estrutura, as colunas) continua existindo",
                                "isCorrect": true
                            },
                            {
                                "text": "O comando falha, porque o PostgreSQL exige WHERE em todo DELETE",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas a tabela é removida, mas as linhas continuam acessíveis em outro lugar",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada acontece, porque DELETE sem WHERE é ignorado por segurança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela pedidos guarda o histórico de compras de uma loja. Em vez de apagar um pedido cancelado com DELETE, a equipe prefere manter a linha e usar uma coluna cancelado_em (TIMESTAMP, aceita NULL). Que padrão é esse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Soft delete: marcar a linha como removida ou cancelada em vez de apagar de verdade",
                                "isCorrect": true
                            },
                            {
                                "text": "Normalização: dividir a tabela em tabelas menores",
                                "isCorrect": false
                            },
                            {
                                "text": "Rollback automático: desfazer a operação depois de um tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Indexação: criar um índice para acelerar buscas por pedidos cancelados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema decide usar soft delete na tabela tarefas, com a coluna removida BOOLEAN DEFAULT FALSE. Depois de implementado, os desenvolvedores notam que tarefas removidas continuam aparecendo em relatórios e buscas antigas. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As queries desses relatórios não foram atualizadas para incluir WHERE removida = false, então continuam trazendo todas as linhas, inclusive as marcadas como removidas",
                                "isCorrect": true
                            },
                            {
                                "text": "A coluna removida precisa ser do tipo TEXT, não BOOLEAN, para funcionar corretamente",
                                "isCorrect": false
                            },
                            {
                                "text": "O soft delete só funciona se a tabela também tiver uma chave estrangeira",
                                "isCorrect": false
                            },
                            {
                                "text": "O PostgreSQL remove automaticamente linhas com removida = true depois de 24 horas, então o problema é temporário",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Transações: tudo ou nada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que algumas operações precisam acontecer juntas\n\nAté aqui, cada INSERT, UPDATE ou DELETE que você rodou foi uma operação isolada: um comando, um efeito, pronto. Mas muita regra de negócio real não cabe em um comando só. O exemplo clássico é a transferência bancária: tirar dinheiro da conta de uma pessoa e colocar na de outra são duas operações separadas, só que elas só fazem sentido juntas. Se uma rodar sem a outra, dinheiro é criado ou destruído do nada.\n\nPara ver isso na prática, vamos sair da tabela tarefas por um instante e imaginar uma tabela contas, já criada (a sintaxe completa de CREATE TABLE vem no módulo 5):"
                    },
                    {
                        "type": "code",
                        "value": "contas\n  id       -> chave primária, gerada automaticamente\n  titular  -> TEXT, o nome de quem é dona da conta\n  saldo    -> NUMERIC, o valor disponível\n\nINSERT INTO contas (titular, saldo)\nVALUES\n    ('Ana', 500.00),\n    ('Bruno', 100.00);"
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"titular\",\"saldo\"],[\"1\",\"Ana\",\"500.00\"],[\"2\",\"Bruno\",\"100.00\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## BEGIN, COMMIT e ROLLBACK\n\nUma transferência de R$ 100,00 de Ana para Bruno precisa de dois UPDATE: um tirando 100 do saldo de Ana, outro somando 100 ao saldo de Bruno. Se o processo da aplicação cair, a conexão cair ou algo der erro entre os dois comandos, o banco fica com o débito aplicado e o crédito não, e R$ 100,00 somem.\n\nÉ para isso que existe a transação. BEGIN abre um bloco de transação: os comandos que vêm depois ficam provisórios. COMMIT confirma tudo de uma vez, tornando as mudanças permanentes. ROLLBACK faz o oposto: descarta tudo que foi feito desde o BEGIN, como se nenhum dos comandos tivesse rodado. Enquanto não chega um COMMIT ou um ROLLBACK, nada daquilo é definitivo."
                    },
                    {
                        "type": "code",
                        "value": "-- cenário 1: a transferência acontece por completo\nBEGIN;\n\nUPDATE contas SET saldo = saldo - 100 WHERE titular = 'Ana';\nUPDATE contas SET saldo = saldo + 100 WHERE titular = 'Bruno';\n\nCOMMIT;\n-- as duas mudanças viram permanentes juntas\n\n-- cenário 2: algo impede a transferência de continuar\nBEGIN;\n\nUPDATE contas SET saldo = saldo - 1000 WHERE titular = 'Ana';\n-- saldo insuficiente: a aplicação decide desfazer tudo\n\nROLLBACK;\n-- o saldo de Ana volta a ser o mesmo de antes do BEGIN, como se o UPDATE nunca tivesse rodado"
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"titular\",\"saldo\"],[\"1\",\"Ana\",\"400.00\"],[\"2\",\"Bruno\",\"200.00\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Toda vez que uma ação do seu sistema depende de mais de um INSERT, UPDATE ou DELETE para fazer sentido, pergunte-se o que acontece se o processo parar no meio. Se a resposta for que os dados ficam inconsistentes, a resposta certa é envolver os comandos em BEGIN e fechar com COMMIT, ou ROLLBACK se algo deu errado."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o comando BEGIN faz no PostgreSQL?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Inicia um bloco de transação, deixando os comandos seguintes provisórios até um COMMIT ou ROLLBACK",
                                "isCorrect": true
                            },
                            {
                                "text": "Cria uma nova tabela vazia",
                                "isCorrect": false
                            },
                            {
                                "text": "Confirma de forma definitiva as últimas mudanças feitas no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Remove todas as transações em andamento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um ROLLBACK, o que acontece com as alterações feitas desde o BEGIN?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Todas são desfeitas; o banco volta ao estado de antes do BEGIN",
                                "isCorrect": true
                            },
                            {
                                "text": "Todas se tornam permanentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas a última alteração é desfeita",
                                "isCorrect": false
                            },
                            {
                                "text": "As alterações ficam pendentes até o próximo COMMIT",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que transferir dinheiro entre duas contas com dois UPDATE separados, sem uma transação, é arriscado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Se o processo falhar entre os dois UPDATE, um saldo pode ser debitado sem o outro ser creditado, deixando os dados inconsistentes",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o PostgreSQL não permite rodar dois UPDATE seguidos sem uma transação",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada UPDATE fora de uma transação apaga a linha inteira em vez de alterar apenas o saldo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, sem transação, o segundo UPDATE sempre sobrescreve o efeito do primeiro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de BEGIN; UPDATE contas SET saldo = saldo - 100 WHERE titular = 'Ana';, mas antes do COMMIT, a aplicação percebe que o saldo de Ana ficaria negativo e decide não continuar a transferência. Qual comando desfaz esse UPDATE?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ROLLBACK;",
                                "isCorrect": true
                            },
                            {
                                "text": "COMMIT;",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar o mesmo UPDATE contas SET saldo = saldo - 100 WHERE titular = 'Ana'; novamente",
                                "isCorrect": false
                            },
                            {
                                "text": "DELETE FROM contas WHERE titular = 'Ana';",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de uma transação (depois do BEGIN, antes do COMMIT), um UPDATE já rodou tirando R$ 100,00 do saldo de Ana. Nesse momento, antes do COMMIT, outra conexão faz SELECT saldo FROM contas WHERE titular = 'Ana';. Qual saldo essa outra conexão enxerga, considerando o comportamento padrão de isolamento do PostgreSQL?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O saldo de antes do UPDATE, porque mudanças de uma transação não confirmada não ficam visíveis para outras conexões",
                                "isCorrect": true
                            },
                            {
                                "text": "O saldo já com os R$ 100,00 debitados, porque toda alteração fica visível assim que o comando roda, mesmo sem COMMIT",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de bloqueio, porque o PostgreSQL impede qualquer SELECT enquanto existir uma transação aberta",
                                "isCorrect": false
                            },
                            {
                                "text": "Um saldo médio entre o valor antigo e o novo, calculado automaticamente pelo banco",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "ACID: as garantias do banco relacional",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## ACID: as quatro garantias por trás de cada transação\n\nNa aula anterior você usou BEGIN, COMMIT e ROLLBACK para garantir que a transferência entre Ana e Bruno acontecesse por completo ou não acontecesse. Essa garantia de tudo ou nada tem nome: atomicidade. E ela é só uma de quatro garantias que todo banco relacional promete para cada transação, resumidas na sigla ACID: Atomicidade, Consistência, Isolamento e Durabilidade. Vamos ver cada uma, sempre voltando ao exemplo da tabela contas."
                    },
                    {
                        "type": "text",
                        "value": "## Atomicidade e Consistência\n\nAtomicidade é o que você já viu: uma transação roda por inteiro ou não roda nada. Não existe meio-termo em que só o débito da Ana aconteceu. Ou o BEGIN termina em COMMIT e as duas mudanças valem, ou termina em ROLLBACK (ou numa falha) e nenhuma vale.\n\nConsistência é a garantia de que uma transação nunca deixa os dados violando as regras do banco, as constraints. Se você definir que o saldo de uma conta nunca pode ficar negativo, o PostgreSQL rejeita qualquer transação que tentasse deixar o saldo assim, mesmo no meio do caminho, antes do COMMIT."
                    },
                    {
                        "type": "code",
                        "value": "-- constraints de verdade, com a sintaxe completa, vem no módulo 5; a ideia já vale agora\nALTER TABLE contas ADD CONSTRAINT saldo_nao_negativo CHECK (saldo >= 0);\n\nBEGIN;\nUPDATE contas SET saldo = saldo - 1000 WHERE titular = 'Ana';\n-- ERROR:  new row for relation \"contas\" violates check constraint \"saldo_nao_negativo\"\nROLLBACK;\n-- a transação inteira é desfeita; o saldo de Ana continua o mesmo de antes"
                    },
                    {
                        "type": "text",
                        "value": "## Isolamento\n\nIsolamento garante que uma transação não enxerga o estado \"no meio do caminho\" de outra transação que ainda não terminou. Imagine que a transferência de Ana para Bruno está em andamento: o débito de R$ 100,00 já rodou, mas o crédito ainda não, e o COMMIT ainda não chegou. Se, nesse exato instante, outra conexão rodar SELECT saldo FROM contas WHERE titular = 'Ana';, ela não vê o saldo parcialmente debitado. Ela enxerga o saldo de antes da transação começar, e só passa a ver o valor novo depois que a transação der COMMIT. Sem isolamento, duas transações rodando ao mesmo tempo poderiam ler e escrever em cima uma da outra e corromper os dados, mesmo cada uma sendo internamente correta."
                    },
                    {
                        "type": "text",
                        "value": "## Durabilidade\n\nLá no primeiro módulo desta trilha você viu por que não faz sentido guardar dados só na memória: se o processo cai, tudo some. Durabilidade é a garantia complementar a essa ideia: assim que o COMMIT retorna sucesso, a mudança já está gravada de um jeito que sobrevive a uma falha. O PostgreSQL registra a transação em um log próprio, o WAL (write-ahead log), antes mesmo de considerar o COMMIT concluído. Mesmo que o servidor perca energia um segundo depois, ao voltar, o banco reconstrói exatamente aquele estado. É essa garantia que permite confiar que \"salvou\" significa salvou, de verdade."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Letra\",\"Garantia\",\"No exemplo da conta\"],[\"A - Atomicidade\",\"A transação roda por inteiro ou não roda nada\",\"Debitar de Ana e creditar Bruno acontecem juntos, ou nenhum dos dois\"],[\"C - Consistência\",\"Os dados nunca violam as regras (constraints) do banco\",\"Um CHECK impede o saldo de ficar negativo, mesmo dentro da transação\"],[\"I - Isolamento\",\"Uma transação não vê o estado intermediário de outra\",\"Ninguém lê um saldo debitado sem o crédito correspondente já ter sido feito\"],[\"D - Durabilidade\",\"Depois do COMMIT, a mudança sobrevive a uma falha\",\"Mesmo se o servidor cair logo após o COMMIT, o saldo novo persiste\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "ACID é a promessa por trás de cada COMMIT: atomicidade, consistência, isolamento e durabilidade. Não é só o SQL que faz um banco relacional confiável para guardar dinheiro, pedidos ou qualquer dado que não pode se perder nem ficar pela metade, é essa garantia."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a letra A de ACID representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Atomicidade: a transação roda por inteiro ou não roda nada",
                                "isCorrect": true
                            },
                            {
                                "text": "Auditoria: todo comando é registrado para consulta futura",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação: só usuários autorizados podem abrir uma transação",
                                "isCorrect": false
                            },
                            {
                                "text": "Agregação: o banco soma automaticamente os valores alterados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a letra D de ACID representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Durabilidade: depois do COMMIT, a mudança sobrevive a uma falha do banco",
                                "isCorrect": true
                            },
                            {
                                "text": "Duplicação: o banco mantém uma cópia de cada linha automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Deleção: toda transação termina apagando dados temporários",
                                "isCorrect": false
                            },
                            {
                                "text": "Distribuição: os dados são espalhados automaticamente entre vários servidores",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela contas tem a constraint CHECK (saldo >= 0). Dentro de uma transação, um UPDATE tentaria deixar o saldo de uma conta em -50. Qual garantia do ACID é responsável por impedir que esse UPDATE deixe o dado nesse estado inválido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Consistência",
                                "isCorrect": true
                            },
                            {
                                "text": "Isolamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Durabilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Atomicidade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Enquanto uma transação de transferência ainda não deu COMMIT (o débito já rodou, o crédito ainda não), outra conexão consulta o saldo da conta debitada. Qual garantia do ACID explica por que essa consulta não enxerga o saldo pela metade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Isolamento",
                                "isCorrect": true
                            },
                            {
                                "text": "Atomicidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Consistência",
                                "isCorrect": false
                            },
                            {
                                "text": "Durabilidade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O servidor de banco de dados perde energia um segundo depois de um COMMIT retornar sucesso para o cliente. Ao religar, a mudança confirmada continua lá. Isso é resultado direto de qual garantia, e apoiado em qual mecanismo do PostgreSQL?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Durabilidade, apoiada no registro da transação em um log de write-ahead (WAL) antes de considerar o COMMIT concluído",
                                "isCorrect": true
                            },
                            {
                                "text": "Isolamento, apoiado no bloqueio de todas as outras conexões até o servidor religar",
                                "isCorrect": false
                            },
                            {
                                "text": "Atomicidade, apoiada em manter uma cópia da tabela inteira em outro servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Consistência, apoiada em um CHECK constraint que valida os dados a cada reinicialização",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Modelagem e relacionamentos",
        "aulas": [
            {
                "titulo": "Por que modelar: o problema da repetição",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que modelar? O problema da repetição de dados\n\nAté aqui você já sabe escrever SELECT, INSERT, UPDATE e DELETE. Todo esse SQL parte de um pressuposto: que os dados estão bem organizados em tabelas, cada uma cuidando de um tipo de coisa. Este módulo mostra como chegar nesse ponto, que é o coração do modelo relacional.\n\nImagine que você está montando o banco de uma lojinha e resolve guardar tudo numa tabela só, chamada pedidos: nome do cliente, email, produto, quantidade e data, tudo junto na mesma linha. Parece prático. O problema aparece assim que o mesmo cliente faz o segundo pedido."
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"cliente_nome\",\"cliente_email\",\"produto\",\"quantidade\",\"data_pedido\"],[\"1\",\"Ana Souza\",\"ana@exemplo.com\",\"Teclado mecânico\",\"1\",\"2026-01-10\"],[\"2\",\"Ana Souza\",\"ana@exemplo.com\",\"Mouse gamer\",\"2\",\"2026-01-10\"],[\"3\",\"Bruno Lima\",\"bruno@exemplo.com\",\"Monitor 27 pol\",\"1\",\"2026-02-03\"],[\"4\",\"Ana Souza\",\"ana@exemplo.com.br\",\"Teclado mecânico\",\"1\",\"2026-03-15\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## As anomalias da repetição\n\nRepare que o nome e o email de Ana Souza aparecem três vezes. Isso não é só feio, é perigoso:\n\n- **Anomalia de atualização**: se Ana mudar de email, alguém precisa lembrar de atualizar as três linhas. Esqueceu uma? O banco passa a ter duas respostas diferentes para \"qual é o email da Ana\", que é exatamente o que aconteceu na linha 4 (ana@exemplo.com.br em vez de ana@exemplo.com).\n- **Anomalia de inserção**: um cliente novo que ainda não comprou nada não tem onde entrar, porque essa tabela só existe em função de pedidos.\n- **Anomalia de remoção**: se o pedido 3 for cancelado e a linha apagada, os dados do Bruno Lima (nome, email) somem junto, mesmo que ele continue sendo cliente da loja.\n\nQuanto mais uma informação se repete pelas linhas, maior a chance dela ficar inconsistente."
                    },
                    {
                        "type": "text",
                        "value": "## Separando por entidade\n\nA solução é simples de enunciar: cada fato deve morar em um lugar só. Nome e email são fatos sobre o usuário, não sobre o pedido, então vão para uma tabela usuarios, com uma linha por cliente. Produto, quantidade e data são fatos sobre o pedido, então ficam em pedidos, que passa a guardar apenas uma referência (um id) para o usuário dono daquele pedido.\n\nEsse processo de separar dados em tabelas por entidade, eliminando repetição, é o que os livros chamam de normalização. Você não precisa decorar as formas normais (1FN, 2FN, 3FN) para aplicar a ideia no dia a dia: a regra prática é \"esse dado está se repetindo? então ele provavelmente deveria estar em outra tabela, referenciada por id\"."
                    },
                    {
                        "type": "code",
                        "value": "-- separando em duas tabelas: cada uma cuida de uma entidade\nCREATE TABLE usuarios (\n  id SERIAL PRIMARY KEY,\n  nome TEXT NOT NULL,\n  email TEXT NOT NULL UNIQUE\n);\n\nCREATE TABLE pedidos (\n  id SERIAL PRIMARY KEY,\n  usuario_id INTEGER NOT NULL, -- por enquanto so um numero; na proxima aula viramos isso numa FOREIGN KEY de verdade\n  produto TEXT NOT NULL,\n  quantidade INTEGER NOT NULL,\n  data_pedido DATE NOT NULL\n);"
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"usuario_id\",\"produto\",\"quantidade\",\"data_pedido\"],[\"1\",\"1\",\"Teclado mecânico\",\"1\",\"2026-01-10\"],[\"2\",\"1\",\"Mouse gamer\",\"2\",\"2026-01-10\"],[\"3\",\"2\",\"Monitor 27 pol\",\"1\",\"2026-02-03\"],[\"4\",\"1\",\"Teclado mecânico\",\"1\",\"2026-03-15\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Regra prática de modelagem: se um dado está se repetindo entre linhas, ele provavelmente pertence a outra tabela. Separe por entidade e conecte pelas chaves: cada fato mora em exatamente um lugar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Numa tabela pedidos que repete nome e email do cliente em toda linha, o que acontece se esse cliente mudar de email?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Nada, o banco atualiza sozinho todas as linhas que repetem aquele email",
                                "isCorrect": false
                            },
                            {
                                "text": "É preciso atualizar manualmente todas as linhas desse cliente, e esquecer uma gera inconsistência",
                                "isCorrect": true
                            },
                            {
                                "text": "O PostgreSQL impede qualquer atualização até as linhas duplicadas serem removidas",
                                "isCorrect": false
                            },
                            {
                                "text": "O email antigo é apagado automaticamente de todas as linhas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a ideia central da normalização básica aplicada no dia a dia?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guardar o máximo de colunas possível numa única tabela para facilitar consultas",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada fato deve morar em um lugar só, separado por entidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Toda tabela precisa ter pelo menos dez colunas para ser considerada válida",
                                "isCorrect": false
                            },
                            {
                                "text": "Nunca usar mais de uma tabela no mesmo banco de dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa tabela pedidos_tudo_junto, que guarda produto, quantidade, nome e email do cliente na mesma linha, um cliente sem nenhum pedido ainda não consegue ser cadastrado. Que anomalia é essa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Anomalia de remoção",
                                "isCorrect": false
                            },
                            {
                                "text": "Anomalia de atualização",
                                "isCorrect": false
                            },
                            {
                                "text": "Anomalia de inserção",
                                "isCorrect": true
                            },
                            {
                                "text": "Anomalia de agregação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de separar usuarios e pedidos, a tabela pedidos passa a ter uma coluna usuario_id em vez de nome e email do cliente. O que essa coluna representa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma referência ao id do usuário na tabela usuarios, evitando repetir nome e email",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro de modelagem, já que toda tabela deveria manter o nome do cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma cópia do id gerado automaticamente, sem relação com a tabela usuarios",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma forma de guardar o email do cliente de forma criptografada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na tabela pedidos_tudo_junto (não normalizada), o pedido 3 é cancelado e a linha é apagada. O cliente Bruno Lima não tinha nenhum outro pedido registrado. O que acontece com os dados de Bruno?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nada, os dados de Bruno continuam disponíveis em outra parte do banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados de Bruno (nome, email) são perdidos junto com a linha apagada, porque não existiam em nenhum outro lugar",
                                "isCorrect": true
                            },
                            {
                                "text": "O PostgreSQL move automaticamente os dados de Bruno para uma tabela de histórico",
                                "isCorrect": false
                            },
                            {
                                "text": "A linha não pode ser apagada enquanto Bruno tiver dados associados a ela",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Chave estrangeira e integridade referencial",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Formalizando a referência com FOREIGN KEY\n\nNa aula passada, a tabela pedidos ganhou uma coluna usuario_id que guarda o id do usuário dono do pedido. Só que, do jeito que ficou, aquilo é só um INTEGER qualquer: nada impede um INSERT com usuario_id = 999, mesmo que esse usuário não exista. O banco aceitaria numa boa, e você só ia descobrir o problema muito depois, numa consulta que retorna um pedido \"órfão\".\n\nÉ pra isso que existe a FOREIGN KEY (chave estrangeira): uma coluna que referencia a chave primária de outra tabela, e o PostgreSQL passa a garantir que só valores que realmente existem do outro lado podem entrar aqui."
                    },
                    {
                        "type": "code",
                        "value": "CREATE TABLE usuarios (\n  id SERIAL PRIMARY KEY,\n  nome TEXT NOT NULL,\n  email TEXT NOT NULL UNIQUE\n);\n\nCREATE TABLE pedidos (\n  id SERIAL PRIMARY KEY,\n  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),\n  produto TEXT NOT NULL,\n  quantidade INTEGER NOT NULL,\n  data_pedido DATE NOT NULL\n);\n\n-- o mesmo, de forma mais explicita, nomeando a constraint:\n-- usuario_id INTEGER NOT NULL,\n-- CONSTRAINT pedidos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id)"
                    },
                    {
                        "type": "text",
                        "value": "## O que a FOREIGN KEY garante\n\nCom a constraint criada, o PostgreSQL passa a checar toda escrita em pedidos: o valor de usuario_id precisa existir como id em usuarios. Essa garantia tem nome: **integridade referencial**. Ela vale nos dois sentidos:\n\n- Não dá pra inserir (ou atualizar) um pedido apontando para um usuário que não existe.\n- Não dá pra apagar um usuário que ainda tem pedidos, a menos que você diga explicitamente o que fazer com eles (é o que ON DELETE resolve, mais adiante nesta aula)."
                    },
                    {
                        "type": "code",
                        "value": "INSERT INTO pedidos (usuario_id, produto, quantidade, data_pedido)\nVALUES (999, 'Cadeira gamer', 1, '2026-04-01');\n\n-- ERROR:  insert or update on table \"pedidos\" violates foreign key constraint \"pedidos_usuario_id_fkey\"\n-- DETAIL:  Key (usuario_id)=(999) is not present in table \"usuarios\"."
                    },
                    {
                        "type": "text",
                        "value": "## Apagando o lado \"um\": o que fazer com quem ficaria órfão\n\nA integridade referencial também protege o outro lado. Por padrão, o PostgreSQL recusa apagar um usuário que ainda tem pedidos vinculados a ele, porque isso deixaria pedidos apontando para um usuario_id inexistente. Esse comportamento padrão equivale a ON DELETE NO ACTION, e pode ser trocado na hora de criar a FK, dependendo do que fizer sentido para o seu domínio."
                    },
                    {
                        "type": "code",
                        "value": "-- comportamento padrao (sem clausula ON DELETE): bloqueia o DELETE\nDELETE FROM usuarios WHERE id = 1;\n\n-- ERROR:  update or delete on table \"usuarios\" violates foreign key constraint \"pedidos_usuario_id_fkey\" on table \"pedidos\"\n-- DETAIL:  Key (id)=(1) is still referenced from table \"pedidos\".\n\n-- se voce quisesse outro comportamento, escolhe na hora de definir a FK:\nCREATE TABLE pedidos (\n  id SERIAL PRIMARY KEY,\n  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,\n  produto TEXT NOT NULL,\n  quantidade INTEGER NOT NULL,\n  data_pedido DATE NOT NULL\n);\n-- ON DELETE CASCADE: apagou o usuario, apaga os pedidos dele junto (cuidado, e destrutivo)\n-- ON DELETE SET NULL: apagou o usuario, os pedidos ficam com usuario_id = NULL (a coluna precisa aceitar NULL)\n-- ON DELETE RESTRICT / NO ACTION: bloqueia o DELETE enquanto existir pedido vinculado (e o padrao, usado acima)"
                    },
                    {
                        "type": "quote",
                        "value": "Chave estrangeira é uma promessa que o banco cumpre por você: nenhuma linha aponta para algo que não existe. Escolher o ON DELETE certo (RESTRICT, CASCADE ou SET NULL) é decidir o que a sua regra de negócio manda fazer quando o lado referenciado desaparece."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que uma FOREIGN KEY em pedidos.usuario_id referenciando usuarios(id) impede?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Impede inserir um pedido com um usuario_id que não existe em usuarios",
                                "isCorrect": true
                            },
                            {
                                "text": "Impede cadastrar dois usuários com o mesmo nome",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede que a tabela pedidos tenha mais de uma FOREIGN KEY",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede fazer SELECT em pedidos sem antes consultar usuarios",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como se chama a garantia de que uma chave estrangeira sempre aponta para um registro que realmente existe na tabela referenciada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Normalização",
                                "isCorrect": false
                            },
                            {
                                "text": "Integridade referencial",
                                "isCorrect": true
                            },
                            {
                                "text": "Chave candidata",
                                "isCorrect": false
                            },
                            {
                                "text": "Transação atômica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela pedidos tem usuario_id INTEGER NOT NULL REFERENCES usuarios(id), sem nenhuma cláusula ON DELETE. O que acontece ao rodar DELETE FROM usuarios WHERE id = 5, se existir algum pedido com usuario_id = 5?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O usuário é apagado e os pedidos dele ficam com usuario_id igual a NULL",
                                "isCorrect": false
                            },
                            {
                                "text": "O usuário é apagado e os pedidos dele são apagados em cascata",
                                "isCorrect": false
                            },
                            {
                                "text": "O PostgreSQL recusa o DELETE e retorna um erro de violação de foreign key",
                                "isCorrect": true
                            },
                            {
                                "text": "O PostgreSQL apaga o usuário e ignora silenciosamente os pedidos que ficaram inconsistentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual cláusula de FOREIGN KEY faz com que, ao apagar um usuário, todos os pedidos vinculados a ele sejam apagados automaticamente junto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ON DELETE SET NULL",
                                "isCorrect": false
                            },
                            {
                                "text": "ON DELETE RESTRICT",
                                "isCorrect": false
                            },
                            {
                                "text": "ON DELETE CASCADE",
                                "isCorrect": true
                            },
                            {
                                "text": "ON DELETE NO ACTION",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide usar ON DELETE SET NULL na FK de pedidos.usuario_id. Um usuário com 3 pedidos é apagado. O que é necessário para essa configuração funcionar, e o que acontece com os 3 pedidos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A coluna usuario_id precisa aceitar NULL; os 3 pedidos continuam existindo, mas com usuario_id igual a NULL",
                                "isCorrect": true
                            },
                            {
                                "text": "A coluna usuario_id precisa ser UNIQUE; os 3 pedidos são apagados junto com o usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é necessário nenhum ajuste; os 3 pedidos são movidos para uma tabela de arquivamento automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela usuarios também precisa de ON DELETE CASCADE; os 3 pedidos ficam bloqueados para edição",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Um-para-muitos: o relacionamento mais comum",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Três formas de relacionar tabelas\n\nDuas tabelas podem se relacionar de três jeitos: um-para-um (1:1), um-para-muitos (1:N) e muitos-para-muitos (N:N). Os três aparecem o tempo todo em sistemas reais, mas na prática a grande maioria das relações que você vai modelar é 1:N. É nele que esta aula foca. Antes, vale ver rapidamente como é o 1:1, porque a diferença ajuda a fixar a ideia."
                    },
                    {
                        "type": "text",
                        "value": "## Um-para-um (1:1): cada linha tem no máximo uma correspondente\n\nImagine que cada pedido, quando sai para envio, ganha uma entrega: código de rastreio, transportadora, data prevista. Um pedido tem no máximo uma entrega, e uma entrega pertence a exatamente um pedido. Isso é 1:1. Na prática é o relacionamento menos comum dos três: na maioria dos casos esses dados caberiam na própria tabela pedidos. Ele costuma aparecer quando o grupo de colunas é opcional, é criado bem depois do registro principal, ou faz sentido morar separado por outro motivo, como organização ou permissões diferentes de acesso."
                    },
                    {
                        "type": "code",
                        "value": "CREATE TABLE entregas (\n  id SERIAL PRIMARY KEY,\n  pedido_id INTEGER NOT NULL UNIQUE REFERENCES pedidos(id),\n  codigo_rastreio TEXT NOT NULL,\n  transportadora TEXT NOT NULL,\n  data_prevista DATE\n);\n-- o UNIQUE em pedido_id e o que transforma isso em 1:1:\n-- sem ele, um pedido poderia aparecer em varias linhas de entregas, e vira 1:N"
                    },
                    {
                        "type": "text",
                        "value": "## Um-para-muitos (1:N): o relacionamento mais comum\n\nUm usuário faz vários pedidos ao longo do tempo; cada pedido pertence a um único usuário. Essa assimetria (um usuário, muitos pedidos) é a cara do 1:N, o padrão que você vai modelar o tempo todo: um autor com muitos livros, uma categoria com muitos produtos, um projeto com muitas tarefas.\n\nA regra prática pra nunca errar onde colocar a FK: ela mora no lado \"muitos\". Pedido é o lado muitos (vários pedidos por usuário), então é pedidos.usuario_id que existe, nunca o contrário. Não faria sentido usuarios ter uma coluna pedido_id, porque um usuário teria que guardar vários pedidos numa coluna que só aceita um valor."
                    },
                    {
                        "type": "code",
                        "value": "-- usuarios e o lado \"um\"; pedidos e o lado \"muitos\" (tem a FK)\nSELECT * FROM pedidos WHERE usuario_id = 1;\n\n-- contar quantos pedidos cada usuario tem (o GROUP BY que voce ja viu no modulo 2)\nSELECT usuario_id, COUNT(*) AS total_pedidos\nFROM pedidos\nGROUP BY usuario_id;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"usuario_id\",\"produto\",\"quantidade\",\"data_pedido\"],[\"1\",\"1\",\"Teclado mecânico\",\"1\",\"2026-01-10\"],[\"2\",\"1\",\"Mouse gamer\",\"2\",\"2026-01-10\"],[\"3\",\"2\",\"Monitor 27 pol\",\"1\",\"2026-02-03\"],[\"4\",\"1\",\"Teclado mecânico\",\"1\",\"2026-03-15\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um-para-muitos é o relacionamento mais comum do modelo relacional, e a regra é sempre a mesma: a chave estrangeira mora no lado muitos. Se você não lembrar de mais nada sobre modelagem, lembre dessa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num relacionamento 1:N entre usuarios e pedidos, em que um usuário tem muitos pedidos, em qual tabela fica a chave estrangeira?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em usuarios, apontando para pedidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Em pedidos, apontando para usuarios, que é o lado muitos",
                                "isCorrect": true
                            },
                            {
                                "text": "Nas duas tabelas ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Em uma terceira tabela de junção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que torna um relacionamento 1:1, como pedidos e entregas, diferente de um 1:N comum?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "No 1:1 não existe FOREIGN KEY entre as tabelas",
                                "isCorrect": false
                            },
                            {
                                "text": "No 1:1 a coluna com a FK também tem uma restrição UNIQUE, limitando a uma correspondência só",
                                "isCorrect": true
                            },
                            {
                                "text": "No 1:1 as duas tabelas precisam ter exatamente o mesmo nome de coluna id",
                                "isCorrect": false
                            },
                            {
                                "text": "No 1:1 não é possível usar SELECT com JOIN entre as tabelas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A query SELECT usuario_id, COUNT(*) FROM pedidos GROUP BY usuario_id retorna, para o usuário de id 1, o valor 3. O que isso indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O usuário de id 1 tem 3 linhas na tabela usuarios",
                                "isCorrect": false
                            },
                            {
                                "text": "Existem 3 pedidos cuja coluna usuario_id aponta para o usuário de id 1",
                                "isCorrect": true
                            },
                            {
                                "text": "A tabela pedidos tem 3 colunas",
                                "isCorrect": false
                            },
                            {
                                "text": "O relacionamento é N:N, porque há mais de um pedido para o mesmo usuário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que não faz sentido colocar uma coluna pedido_id na tabela usuarios para representar a relação 1:N entre usuarios e pedidos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque colunas não podem se chamar pedido_id",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um usuário pode ter vários pedidos, e uma coluna só guarda um valor por linha",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o PostgreSQL não permite FOREIGN KEY em tabelas que começam com a letra u",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque pedido_id precisaria obrigatoriamente ser do tipo TEXT",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time modela entregas com pedido_id INTEGER NOT NULL REFERENCES pedidos(id), mas esquece de marcar essa coluna como UNIQUE. Qual é a consequência prática desse esquecimento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O PostgreSQL rejeita qualquer INSERT feito na tabela entregas",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada muda, porque REFERENCES já implica UNIQUE automaticamente na coluna",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixa de ser um 1:1 de fato: nada impede que o mesmo pedido_id apareça em várias linhas de entregas, virando um 1:N",
                                "isCorrect": true
                            },
                            {
                                "text": "A tabela pedidos passa a exigir obrigatoriamente uma entrega para cada pedido",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Muitos-para-muitos e a tabela de junção",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando nenhum dos dois lados pode guardar a chave estrangeira\n\nUm pedido normalmente tem mais de um produto: o cliente compra teclado e mousepad no mesmo pedido. E o mesmo produto aparece em pedidos diferentes: o teclado mecânico vende bem, então está em vários pedidos. Isso é muitos-para-muitos (N:N): muitos pedidos se relacionam com muitos produtos, e vice-versa.\n\nA solução do 1:N não resolve aqui. Não dá pra colocar produto_id em pedidos (um pedido pode ter vários produtos, e uma coluna só guarda um valor por linha). Também não dá pra colocar pedido_id em produtos, pelo mesmo motivo invertido. Aliás, isso escancara uma simplificação que pedidos carregava desde a aula 1: a coluna produto, guardando um texto só. Ela nunca se sustentaria num pedido de verdade com vários itens; é hora de resolver isso direito."
                    },
                    {
                        "type": "text",
                        "value": "## A tabela de junção\n\nA saída é criar uma terceira tabela só para representar a relação: uma tabela de junção, também chamada de tabela associativa. Cada linha dela representa um par pedido e produto, ou seja, um item de pedido. Ela tem duas FKs, uma para cada lado, e normalmente mais alguma coluna que só faz sentido para aquele par específico, como a quantidade comprada e o preço no momento da compra (o preço do produto muda com o tempo, mas o item de pedido precisa lembrar o preço que foi cobrado naquela venda)."
                    },
                    {
                        "type": "code",
                        "value": "-- ate aqui, pedidos guardava um produto so, numa coluna de texto (simplificacao da aula 1)\n-- agora que existem varios produtos por pedido, isso nao serve mais\nALTER TABLE pedidos DROP COLUMN produto, DROP COLUMN quantidade;\n\nCREATE TABLE produtos (\n  id SERIAL PRIMARY KEY,\n  nome TEXT NOT NULL,\n  preco NUMERIC(10,2) NOT NULL\n);\n\nCREATE TABLE itens_pedido (\n  id SERIAL PRIMARY KEY,\n  pedido_id INTEGER NOT NULL REFERENCES pedidos(id),\n  produto_id INTEGER NOT NULL REFERENCES produtos(id),\n  quantidade INTEGER NOT NULL,\n  preco_unitario NUMERIC(10,2) NOT NULL,\n  UNIQUE (pedido_id, produto_id)\n);\n-- UNIQUE (pedido_id, produto_id): evita duas linhas pro mesmo produto no mesmo pedido\n-- (pra comprar 2 unidades, aumenta a quantidade na linha existente, nao duplica a linha)"
                    },
                    {
                        "type": "code",
                        "value": "INSERT INTO produtos (nome, preco) VALUES\n  ('Teclado mecânico', 350.00),\n  ('Mouse gamer', 180.00),\n  ('Monitor 27 pol', 999.00),\n  ('Mousepad', 60.00);\n\n-- pedido 1 (Ana) ja tinha o teclado; agora ganha tambem um mousepad, no mesmo pedido\nINSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES\n  (1, 1, 1, 350.00),\n  (1, 4, 1, 60.00);\n\n-- os demais pedidos, cada um com o produto que ja tinha antes\nINSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES\n  (2, 2, 2, 180.00),\n  (3, 3, 1, 999.00),\n  (4, 1, 1, 350.00);"
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"pedido_id\",\"produto_id\",\"quantidade\",\"preco_unitario\"],[\"1\",\"1\",\"1\",\"1\",\"350.00\"],[\"2\",\"1\",\"4\",\"1\",\"60.00\"],[\"3\",\"2\",\"2\",\"2\",\"180.00\"],[\"4\",\"3\",\"3\",\"1\",\"999.00\"],[\"5\",\"4\",\"1\",\"1\",\"350.00\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo a tabela de junção\n\nRepare nos dois lados: o produto_id 1 (teclado mecânico) aparece nas linhas 1 e 5, ou seja, está em dois pedidos diferentes (o pedido 1 e o pedido 4). E o pedido_id 1 aparece nas linhas 1 e 2, ou seja, tem dois produtos no mesmo pedido (teclado e mousepad), algo que a antiga coluna produto jamais permitiria. Isso é o N:N na prática: cada linha de itens_pedido não representa \"um pedido\" nem \"um produto\" sozinho, representa a combinação dos dois.\n\nPor enquanto os resultados só trazem ids, o que não ajuda muito para ler. Transformar produto_id em nome do produto, e usuario_id em nome do cliente, direto na consulta, é o que o JOIN faz, assunto da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "Muitos-para-muitos sempre vira duas relações um-para-muitos, ligadas por uma tabela de junção com duas FKs. Se você não sabe em qual tabela colocar a FK porque os dois lados têm muitos, provavelmente falta essa terceira tabela no meio."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que não é possível representar a relação entre pedidos e produtos (um pedido com vários produtos, um produto em vários pedidos) só com uma FK de um lado para o outro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque FOREIGN KEY só funciona em relacionamentos 1:1",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque uma coluna só guarda um valor por linha, e os dois lados precisariam guardar vários",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o PostgreSQL não permite que duas tabelas se referenciem",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque pedidos e produtos precisam ter o mesmo número de linhas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é uma tabela de junção, também chamada de tabela associativa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma tabela que guarda apenas ids, sem nenhuma outra coluna permitida",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela criada para representar um relacionamento N:N, com uma FK para cada lado",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma view que junta duas tabelas automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tipo especial de índice do PostgreSQL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na tabela itens_pedido (pedido_id, produto_id, quantidade, preco_unitario), existe a constraint UNIQUE (pedido_id, produto_id). O que ela impede?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Impede que o mesmo produto apareça em pedidos diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede duas linhas para o mesmo par pedido e produto; para comprar mais, aumenta a quantidade na mesma linha",
                                "isCorrect": true
                            },
                            {
                                "text": "Impede que um pedido tenha mais de um produto",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede o uso de JOIN nessa tabela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que itens_pedido guarda uma coluna preco_unitario, já que produtos já tem uma coluna preco?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É redundante e essa coluna deveria ser removida de itens_pedido",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o preço do produto pode mudar depois, e o item de pedido precisa manter o preço cobrado no momento da compra",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a coluna preco de produtos é apenas um valor de referência interno, sem uso real",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o PostgreSQL exige que toda tabela de junção repita as colunas das tabelas relacionadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Consultando itens_pedido, produto_id = 1 aparece nas linhas com pedido_id = 1 e pedido_id = 4, e pedido_id = 1 aparece em duas linhas (produto_id 1 e produto_id 4). O que isso confirma sobre o relacionamento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que existe um erro de duplicação de dados que deveria ser corrigido",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o produto 1 pertence simultaneamente a dois pedidos diferentes dentro da tabela produtos",
                                "isCorrect": false
                            },
                            {
                                "text": "Que é de fato N:N: um produto está em vários pedidos, e um pedido tem vários produtos, cada combinação em uma linha",
                                "isCorrect": true
                            },
                            {
                                "text": "Que a tabela itens_pedido deveria ter uma FOREIGN KEY a mais para cada produto",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "JOIN: juntando tabelas nas consultas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Trazendo os dados de volta com JOIN\n\nModelar bem significa espalhar os dados em várias tabelas, cada uma cuidando de uma entidade. O preço a pagar é que, na hora de consultar, você quase sempre precisa juntar essas tabelas de novo: o pedido mora em pedidos, o nome do cliente mora em usuarios. É para isso que existe o JOIN.\n\nUm JOIN junta linhas de duas tabelas numa única consulta, casando pelos valores de uma coluna, geralmente a FK de um lado com a PK do outro. A condição de junção fica depois do ON: FROM pedidos INNER JOIN usuarios ON pedidos.usuario_id = usuarios.id lê-se \"para cada pedido, encontre o usuário cujo id é igual ao usuario_id desse pedido\"."
                    },
                    {
                        "type": "code",
                        "value": "SELECT\n  pedidos.id AS pedido_id,\n  usuarios.nome AS cliente,\n  pedidos.data_pedido\nFROM pedidos\nINNER JOIN usuarios ON pedidos.usuario_id = usuarios.id\nORDER BY pedidos.id;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"pedido_id\",\"cliente\",\"data_pedido\"],[\"1\",\"Ana Souza\",\"2026-01-10\"],[\"2\",\"Ana Souza\",\"2026-01-10\"],[\"3\",\"Bruno Lima\",\"2026-02-03\"],[\"4\",\"Ana Souza\",\"2026-03-15\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Só o que casa dos dois lados\n\nO INNER JOIN só devolve linhas em que existe correspondência nas duas tabelas. Todo pedido tem um usuario_id válido (a FK garante isso), então todo pedido apareceu no resultado. Mas o oposto não é verdade: um usuário sem nenhum pedido simplesmente não aparece, porque não existe nenhuma linha de pedidos para casar com ele.\n\nImagine cadastrar uma cliente nova, Carla, que ainda não comprou nada. Com INNER JOIN, ela some do resultado, mesmo estando na tabela usuarios. Se a tela é \"lista de clientes e quantos pedidos cada um fez\", isso é um bug: Carla deveria aparecer, com zero pedidos."
                    },
                    {
                        "type": "code",
                        "value": "-- cliente nova, ainda sem nenhum pedido\nINSERT INTO usuarios (nome, email) VALUES ('Carla Mendes', 'carla@exemplo.com');\n\nSELECT\n  usuarios.nome AS cliente,\n  pedidos.id AS pedido_id,\n  pedidos.data_pedido\nFROM usuarios\nLEFT JOIN pedidos ON pedidos.usuario_id = usuarios.id\nORDER BY usuarios.id;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"cliente\",\"pedido_id\",\"data_pedido\"],[\"Ana Souza\",\"1\",\"2026-01-10\"],[\"Ana Souza\",\"2\",\"2026-01-10\"],[\"Ana Souza\",\"4\",\"2026-03-15\"],[\"Bruno Lima\",\"3\",\"2026-02-03\"],[\"Carla Mendes\",\"NULL\",\"NULL\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "INNER JOIN só traz o que existe dos dois lados; LEFT JOIN traz tudo da tabela da esquerda, preenchendo com NULL quando não há par do lado direito. Na dúvida sobre qual usar, pergunte: preciso ver também quem não tem correspondência?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Na query FROM pedidos INNER JOIN usuarios ON pedidos.usuario_id = usuarios.id, o que a cláusula ON define?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A ordem de exibição das colunas no resultado final",
                                "isCorrect": false
                            },
                            {
                                "text": "A condição usada para casar as linhas das duas tabelas",
                                "isCorrect": true
                            },
                            {
                                "text": "Um filtro que remove linhas duplicadas do resultado",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome da tabela que aparece primeiro no resultado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual JOIN garante que todos os usuários apareçam no resultado, mesmo os que não têm nenhum pedido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "INNER JOIN",
                                "isCorrect": false
                            },
                            {
                                "text": "LEFT JOIN, com usuarios do lado esquerdo da consulta",
                                "isCorrect": true
                            },
                            {
                                "text": "Um JOIN comum, desde que se use WHERE no lugar do ON",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é possível; seria preciso rodar duas consultas separadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela usuarios tem 3 linhas (Ana, Bruno, Carla) e a tabela pedidos tem 4 linhas, sendo 3 de Ana e 1 de Bruno (Carla não tem nenhum pedido). Quantas linhas retorna SELECT * FROM pedidos INNER JOIN usuarios ON pedidos.usuario_id = usuarios.id?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "3, uma para cada usuário cadastrado",
                                "isCorrect": false
                            },
                            {
                                "text": "4, uma para cada pedido, porque Carla não tem pedido para casar",
                                "isCorrect": true
                            },
                            {
                                "text": "7, a soma das linhas das duas tabelas",
                                "isCorrect": false
                            },
                            {
                                "text": "5, os quatro pedidos mais a linha de Carla preenchida com NULL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Nos mesmos dados da questão anterior, quantas linhas retorna a versão com FROM usuarios LEFT JOIN pedidos ON pedidos.usuario_id = usuarios.id?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "3, porque LEFT JOIN sempre limita o resultado ao número de linhas da tabela da esquerda",
                                "isCorrect": false
                            },
                            {
                                "text": "4, igual ao INNER JOIN, porque LEFT JOIN nunca traz linhas com NULL",
                                "isCorrect": false
                            },
                            {
                                "text": "5: as 4 linhas de pedidos casadas, mais 1 linha de Carla com as colunas de pedidos em NULL",
                                "isCorrect": true
                            },
                            {
                                "text": "7, a soma das linhas das duas tabelas, com NULL preenchendo os espaços que sobram",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta usa FROM usuarios LEFT JOIN pedidos ON pedidos.usuario_id = usuarios.id, mas alguém adiciona WHERE pedidos.data_pedido > '2026-01-01' depois do JOIN. O que acontece com os usuários que não têm nenhum pedido, como Carla?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Continuam aparecendo normalmente, porque LEFT JOIN ignora qualquer WHERE aplicado depois",
                                "isCorrect": false
                            },
                            {
                                "text": "Somem do resultado, porque pedidos.data_pedido é NULL para eles e a comparação com NULL nunca é verdadeira, o que na prática anula o efeito do LEFT JOIN",
                                "isCorrect": true
                            },
                            {
                                "text": "O PostgreSQL recusa executar a query, porque não é possível usar WHERE depois de um LEFT JOIN",
                                "isCorrect": false
                            },
                            {
                                "text": "Aparecem com a coluna data_pedido preenchida automaticamente com a data atual",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - PostgreSQL na prática",
        "aulas": [
            {
                "titulo": "Por que PostgreSQL e como subir um para estudar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# PostgreSQL na prática\n\nAté aqui você viu SQL de um jeito mais genérico: SELECT, INSERT, JOIN, chave primária, chave estrangeira. São comandos que funcionam, com pequenas diferenças, em praticamente qualquer banco relacional. Chegou a hora de sair da teoria e aterrissar num banco de verdade: o **PostgreSQL**, um dos SGBDs mais usados do mundo e o mesmo que roda por trás da própria ensina.dev.\n\nNas próximas cinco aulas você vai subir um Postgres pra estudar, conectar nele pelo terminal, criar tabelas de verdade com os tipos do Postgres, proteger os dados com constraints e acelerar consultas com índices."
                    },
                    {
                        "type": "text",
                        "value": "## Por que Postgres, especificamente?\n\nExistem vários bancos relacionais (MySQL, SQLite, SQL Server, Oracle), e a boa notícia é que o SQL que você aprendeu nos módulos anteriores (SELECT, WHERE, JOIN, INSERT) é praticamente o mesmo em todos eles. As diferenças aparecem nos detalhes: tipos de dados, funções específicas, algumas variações de sintaxe. O SQLite, por exemplo, é minimalista (o banco inteiro cabe num único arquivo, ótimo pra apps mobile ou protótipos); o MySQL é outro banco open source popular, com um jeito próprio de lidar com alguns tipos e configurações.\n\nO PostgreSQL seguiu outro caminho: é open source há mais de 25 anos, extremamente aderente ao padrão SQL, robusto o bastante pra guardar dados críticos de empresas de qualquer tamanho, e hoje é tratado como o SGBD relacional open source mais completo disponível. Não é modismo: é o banco que a própria ensina.dev usa em produção, e é uma escolha segura pra praticamente qualquer projeto novo."
                    },
                    {
                        "type": "text",
                        "value": "## Subindo um Postgres pra estudar\n\nInstalar o Postgres direto no seu sistema operacional funciona, mas dá trabalho: gerenciar versão, dependências, um serviço rodando em segundo plano, e depois desinstalar sem deixar rastro. Pra estudar, o caminho mais simples é o Docker: ele sobe um Postgres isolado dentro de um container, sem tocar no resto da sua máquina. Quando terminar, basta apagar o container.\n\nO comando abaixo baixa a imagem oficial do Postgres e sobe um container já rodando, com um usuário, uma senha e um banco de dados criados automaticamente:"
                    },
                    {
                        "type": "code",
                        "value": "docker run --name pg-estudo -e POSTGRES_USER=estudo -e POSTGRES_PASSWORD=estudo123 -e POSTGRES_DB=escola -p 5432:5432 -d postgres:16"
                    },
                    {
                        "type": "text",
                        "value": "## Entendendo o comando\n\n- **--name pg-estudo**: dá um nome ao container, pra referenciar ele depois (docker stop pg-estudo, por exemplo).\n- **-e POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB**: variáveis de ambiente que o Postgres lê na primeira inicialização, pra já criar um usuário, uma senha e um banco de dados prontos pra uso.\n- **-p 5432:5432**: mapeia a porta 5432 do container (onde o Postgres escuta) pra porta 5432 da sua máquina.\n- **-d**: roda o container em segundo plano (detached), sem travar o terminal.\n- **postgres:16**: a imagem oficial do Postgres, na versão 16.\n\nIsso resolve pra um teste rápido, mas você vai ligar e desligar esse banco várias vezes ao longo do módulo. Vale a pena guardar essa configuração num arquivo docker-compose.yml em vez de digitar o comando toda vez. O compose também facilita adicionar um volume, uma pasta que persiste os dados do banco fora do container, pra você não perder tudo se ele for removido:"
                    },
                    {
                        "type": "code",
                        "value": "services:\n  postgres:\n    image: postgres:16\n    container_name: pg-estudo\n    environment:\n      POSTGRES_USER: estudo\n      POSTGRES_PASSWORD: estudo123\n      POSTGRES_DB: escola\n    ports:\n      - \"5432:5432\"\n    volumes:\n      - pg_data:/var/lib/postgresql/data\n\nvolumes:\n  pg_data:\n\n# subir com: docker compose up -d\n# derrubar (mantendo o volume): docker compose down\n# derrubar e apagar também o volume: docker compose down -v"
                    },
                    {
                        "type": "quote",
                        "value": "Não existe uma resposta única entre instalar local ou usar Docker, mas pra estudar, um banco isolado e descartável ganha quase sempre. O Postgres que você sobe aqui é uma ferramenta de treino: pode derrubar, apagar e recriar quantas vezes precisar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Sobre PostgreSQL, MySQL e SQLite, qual afirmação está correta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os três compartilham o núcleo básico do SQL (SELECT, INSERT, JOIN), mas têm diferenças em tipos de dados, funções e detalhes de sintaxe.",
                                "isCorrect": true
                            },
                            {
                                "text": "São linguagens completamente diferentes, sem nenhuma semelhança entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "O SQLite não aceita o comando SELECT, só INSERT e UPDATE.",
                                "isCorrect": false
                            },
                            {
                                "text": "O MySQL não é considerado um banco de dados relacional.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No comando docker run --name pg-estudo -e POSTGRES_USER=estudo -e POSTGRES_PASSWORD=estudo123 -e POSTGRES_DB=escola -p 5432:5432 -d postgres:16, o que a flag -d faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Roda o container em segundo plano, sem travar o terminal.",
                                "isCorrect": true
                            },
                            {
                                "text": "Define o nome do banco de dados que será criado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativa um modo de depuração (debug) do Postgres.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remove o container automaticamente assim que ele para de rodar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você subiu um Postgres com docker run sem configurar nenhum volume, inseriu alguns dados de teste e depois removeu o container com docker rm. O que aconteceu com os dados inseridos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Foram perdidos, porque sem volume os dados vivem só dentro do container que foi removido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Continuam salvos automaticamente numa pasta temporária que o Docker cria sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Foram enviados para um backup na nuvem do Postgres.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker impede remover um container que ainda tem dados gravados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao subir a imagem oficial do Postgres com as variáveis POSTGRES_USER, POSTGRES_PASSWORD e POSTGRES_DB definidas, para que elas servem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São lidas na primeira inicialização do container para criar automaticamente um usuário, uma senha e um banco de dados prontos para uso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Servem apenas para nomear o container no Docker.",
                                "isCorrect": false
                            },
                            {
                                "text": "São obrigatórias em qualquer imagem Docker, não só na do Postgres.",
                                "isCorrect": false
                            },
                            {
                                "text": "Controlam qual versão do Postgres será baixada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao subir o Postgres com um docker-compose.yml que declara um volume nomeado (ex.: pg_data:/var/lib/postgresql/data), qual afirmação é correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Os dados ficam persistidos no volume e sobrevivem mesmo se o container for removido e recriado com docker compose up.",
                                "isCorrect": true
                            },
                            {
                                "text": "O volume só guarda os dados enquanto o container está rodando, e some quando ele para.",
                                "isCorrect": false
                            },
                            {
                                "text": "O volume funciona como um backup automático enviado para um servidor remoto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem a flag -p 5432:5432 no compose, os dados param de ser gravados no volume.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Conectando: psql e comandos essenciais",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dois jeitos de conversar com o Postgres\n\nO psql é o cliente de linha de comando que vem junto com toda instalação do Postgres. Funciona em qualquer lugar (inclusive numa VPS de produção acessada só por SSH, sem interface gráfica nenhuma), e o conhecimento de terminal se transfere pra qualquer servidor Postgres que você for administrar na carreira. Já ferramentas como DBeaver e pgAdmin são clientes gráficos: mostram tabelas numa árvore, dados numa grade editável, e ajudam bastante no dia a dia. Nesta aula o foco é o psql, exatamente por ele ser universal."
                    },
                    {
                        "type": "code",
                        "value": "# de dentro da máquina que já tem o container rodando\ndocker exec -it pg-estudo psql -U estudo -d escola\n\n# ou, se você tiver o psql instalado localmente, conectando pela porta exposta\npsql -h localhost -p 5432 -U estudo -d escola"
                    },
                    {
                        "type": "text",
                        "value": "## Meta-comandos: o vocabulário do psql\n\nDepois de conectar, o prompt muda pra algo como escola=#, sinal de que você está dentro do banco escola. A partir daí, dois tipos de comando convivem no mesmo terminal:\n\n- Comandos SQL (SELECT, INSERT, CREATE TABLE...): terminam sempre com ponto e vírgula e são enviados pro servidor Postgres processar.\n- Meta-comandos do psql: começam com barra invertida, não usam ponto e vírgula, e são interpretados pelo próprio psql, sem nem chegar no banco.\n\nOs meta-comandos mais usados no dia a dia:\n\n- \\l lista todos os bancos de dados do servidor.\n- \\c nome_do_banco troca de banco (conecta em outro).\n- \\dt lista as tabelas do banco atual.\n- \\d nome_da_tabela mostra as colunas, tipos e constraints de uma tabela.\n- \\du lista os usuários (roles) do servidor.\n- \\q sai do psql."
                    },
                    {
                        "type": "code",
                        "value": "escola=# \\l"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Name\",\"Owner\",\"Encoding\"],[\"escola\",\"estudo\",\"UTF8\"],[\"postgres\",\"estudo\",\"UTF8\"],[\"template0\",\"estudo\",\"UTF8\"],[\"template1\",\"estudo\",\"UTF8\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## E os clientes gráficos?\n\nDBeaver e pgAdmin conectam nesse mesmo Postgres (mesmo host, porta, usuário e senha) e mostram tudo visualmente, incluindo um editor de query com autocomplete. São ótimos pra explorar dados rapidamente no dia a dia. Mas por baixo é o mesmo SQL e os mesmos conceitos que você está aprendendo aqui, e o psql tem uma vantagem que nenhum cliente gráfico tem: funciona em qualquer lugar que você tenha acesso a um terminal. Na próxima aula, depois de criar as primeiras tabelas, você vai usar \\dt e \\d pra inspecionar o que criou."
                    },
                    {
                        "type": "quote",
                        "value": "psql parece só mais um terminal, mas é a ferramenta que funciona em qualquer servidor Postgres do mundo: local, dentro de um container, ou numa VPS de produção acessada por SSH. Vale o investimento de decorar meia dúzia de comandos."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando conecta, via psql, ao banco escola dentro de um container Docker chamado pg-estudo, autenticando como o usuário estudo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker exec -it pg-estudo psql -U estudo -d escola",
                                "isCorrect": true
                            },
                            {
                                "text": "docker run pg-estudo psql escola",
                                "isCorrect": false
                            },
                            {
                                "text": "psql --container pg-estudo --db escola",
                                "isCorrect": false
                            },
                            {
                                "text": "docker exec pg-estudo CONNECT escola AS estudo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que diferencia um meta-comando do psql (como \\dt) de um comando SQL?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O meta-comando começa com barra invertida, não termina com ponto e vírgula e é interpretado pelo próprio psql; o SQL termina com ponto e vírgula e é enviado ao servidor.",
                                "isCorrect": true
                            },
                            {
                                "text": "O meta-comando só funciona em bancos de dados vazios.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comandos SQL só funcionam dentro de uma transação aberta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe diferença prática, os dois nomes são sinônimos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer ver rapidamente todos os bancos de dados que existem no servidor Postgres ao qual está conectado, antes de decidir em qual entrar. Qual comando usa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "\\l",
                                "isCorrect": true
                            },
                            {
                                "text": "\\dt",
                                "isCorrect": false
                            },
                            {
                                "text": "SELECT * FROM databases;",
                                "isCorrect": false
                            },
                            {
                                "text": "\\c *",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de digitar \\c financeiro dentro de uma sessão do psql conectada ao banco escola, o que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A sessão passa a operar dentro do banco financeiro, e o prompt muda para financeiro=#.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um novo banco chamado financeiro é criado a partir do escola.",
                                "isCorrect": false
                            },
                            {
                                "text": "As tabelas do banco financeiro são listadas, sem trocar de banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco escola é apagado e substituído pelo financeiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a principal vantagem prática do psql sobre um cliente gráfico como o DBeaver no dia a dia de quem administra bancos em produção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O psql funciona em qualquer lugar com acesso a um terminal, inclusive via SSH numa VPS sem interface gráfica, sem precisar instalar nada além do próprio Postgres.",
                                "isCorrect": true
                            },
                            {
                                "text": "O psql executa as queries mais rápido do que qualquer cliente gráfico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comandos DDL como CREATE TABLE só podem ser executados pelo psql.",
                                "isCorrect": false
                            },
                            {
                                "text": "Clientes gráficos não conseguem se conectar a bancos de dados remotos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "CREATE TABLE: criando o esquema no Postgres",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do banco vazio ao esquema completo\n\nO docker-compose do início do módulo já criou um banco chamado escola pra você (foi o que a variável POSTGRES_DB fez). Mas é comum precisar de mais de um banco no mesmo servidor, por exemplo um separado só para rodar testes. A sintaxe para criar um banco é direta, e \\c troca a conexão para o banco que você quer usar:"
                    },
                    {
                        "type": "code",
                        "value": "CREATE DATABASE escola_teste;\n\n\\c escola"
                    },
                    {
                        "type": "text",
                        "value": "## Os tipos de dado do Postgres\n\nCom o banco certo selecionado, chegou a hora de criar as tabelas usuarios e tarefas que você já modelou nos módulos anteriores, agora com os tipos do Postgres:\n\n- INTEGER GENERATED ALWAYS AS IDENTITY: gera um número inteiro automático (1, 2, 3...) a cada linha inserida. É a forma recomendada hoje pra chave primária autoincrementável (SERIAL é a forma antiga, ainda comum em código legado, com o mesmo efeito).\n- INTEGER: número inteiro, sem casas decimais.\n- VARCHAR(n): texto curto, com limite de n caracteres. O Postgres recusa um valor maior que o limite.\n- TEXT: texto sem limite de tamanho, ideal pra campos livres como uma descrição.\n- BOOLEAN: true ou false.\n- TIMESTAMP: data e hora.\n- NUMERIC(p, s): número exato com casas decimais fixas, ideal pra dinheiro (p é o total de dígitos, s é quantos ficam depois da vírgula).\n\nO esquema também não é definitivo: dá pra evoluir depois com ALTER TABLE (adicionar ou remover coluna sem perder os dados que já existem) ou apagar tudo com DROP TABLE."
                    },
                    {
                        "type": "code",
                        "value": "CREATE TABLE usuarios (\n    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    nome VARCHAR(100) NOT NULL,\n    email VARCHAR(150) NOT NULL,\n    ativo BOOLEAN DEFAULT true,\n    criado_em TIMESTAMP DEFAULT now()\n);\n\nCREATE TABLE tarefas (\n    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    titulo VARCHAR(150) NOT NULL,\n    concluida BOOLEAN DEFAULT false,\n    usuario_id INTEGER REFERENCES usuarios(id),\n    criado_em TIMESTAMP DEFAULT now()\n);"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Schema\",\"Name\",\"Type\",\"Owner\"],[\"public\",\"tarefas\",\"table\",\"estudo\"],[\"public\",\"usuarios\",\"table\",\"estudo\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- \\d usuarios mostra as colunas, tipos e valores padrão da tabela:\n--\n--   Column    |            Type             | Nullable |             Default\n-- ------------+------------------------------+----------+-------------------------------\n--  id          | integer                     | not null | generated always as identity\n--  nome        | character varying(100)      | not null |\n--  email       | character varying(150)      | not null |\n--  ativo       | boolean                     |          | true\n--  criado_em   | timestamp without time zone |          | now()\n\n-- adiciona uma coluna nova, sem apagar os dados que já existem\nALTER TABLE usuarios ADD COLUMN telefone VARCHAR(20);\n\n-- remove a coluna (também preserva o resto da tabela)\nALTER TABLE usuarios DROP COLUMN telefone;\n\n-- CUIDADO: DROP TABLE apaga a tabela inteira, estrutura e dados, sem pedir confirmação\n-- (exemplo hipotético, não é pra rodar numa tabela que você quer manter)\nDROP TABLE tarefas_backup;"
                    },
                    {
                        "type": "quote",
                        "value": "CREATE TABLE não é só sintaxe: cada tipo escolhido é uma decisão sobre o que o banco vai aceitar guardar. E como o esquema evolui com ALTER TABLE, você não precisa acertar tudo de primeira."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando cria um novo banco de dados chamado escola_teste no Postgres?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "CREATE DATABASE escola_teste;",
                                "isCorrect": true
                            },
                            {
                                "text": "CREATE TABLE escola_teste;",
                                "isCorrect": false
                            },
                            {
                                "text": "CREATE SCHEMA escola_teste;",
                                "isCorrect": false
                            },
                            {
                                "text": "NEW DATABASE escola_teste;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual tipo do Postgres é o mais indicado pra guardar um valor monetário com casas decimais exatas, sem erro de arredondamento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "NUMERIC(p, s)",
                                "isCorrect": true
                            },
                            {
                                "text": "FLOAT",
                                "isCorrect": false
                            },
                            {
                                "text": "INTEGER",
                                "isCorrect": false
                            },
                            {
                                "text": "TEXT",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela usuarios já tem 500 linhas em produção e você precisa adicionar a coluna telefone sem perder nenhum dado existente. Qual comando usa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ALTER TABLE usuarios ADD COLUMN telefone VARCHAR(20);",
                                "isCorrect": true
                            },
                            {
                                "text": "DROP TABLE usuarios; e recriar com a coluna telefone incluída.",
                                "isCorrect": false
                            },
                            {
                                "text": "CREATE TABLE usuarios (...); rodando de novo com a coluna telefone.",
                                "isCorrect": false
                            },
                            {
                                "text": "UPDATE usuarios SET telefone = NULL;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a principal diferença entre VARCHAR(n) e TEXT no Postgres?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "VARCHAR(n) limita o texto a n caracteres, e o Postgres recusa um valor maior; TEXT não impõe limite de tamanho.",
                                "isCorrect": true
                            },
                            {
                                "text": "TEXT é sempre mais rápido de consultar do que VARCHAR(n).",
                                "isCorrect": false
                            },
                            {
                                "text": "VARCHAR(n) é usado para números, TEXT para texto.",
                                "isCorrect": false
                            },
                            {
                                "text": "TEXT não aceita acentuação nem caracteres especiais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa coluna id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, o que acontece se um INSERT tentar informar um valor manual pra essa coluna?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Postgres recusa o INSERT com erro, a menos que a cláusula OVERRIDING SYSTEM VALUE seja usada.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Postgres aceita o valor informado normalmente, sem restrição.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres ignora o valor informado e sempre usa o próximo número da sequência.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres converte automaticamente a coluna para SERIAL.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Constraints: o banco protegendo seus dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Regras que o banco nunca deixa passar\n\nLá atrás, o CREATE TABLE de usuarios e tarefas garantia os tipos certos, mas ainda deixava passar e-mail repetido, um papel de usuário inválido, ou uma tarefa apontando pra um usuário que não existe. Constraints são regras extras que o próprio Postgres passa a aplicar, então vamos recriar essas duas tabelas com as regras completas. Como tarefas depende de usuarios (via chave estrangeira), a ordem importa tanto pra apagar quanto pra criar:"
                    },
                    {
                        "type": "code",
                        "value": "DROP TABLE IF EXISTS tarefas;\nDROP TABLE IF EXISTS usuarios;\n\nCREATE TABLE usuarios (\n    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    nome VARCHAR(100) NOT NULL,\n    email VARCHAR(150) NOT NULL UNIQUE,\n    papel VARCHAR(20) NOT NULL DEFAULT 'aluno' CHECK (papel IN ('aluno', 'instrutor', 'admin')),\n    ativo BOOLEAN NOT NULL DEFAULT true,\n    criado_em TIMESTAMP NOT NULL DEFAULT now()\n);\n\nCREATE TABLE tarefas (\n    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    titulo VARCHAR(150) NOT NULL,\n    concluida BOOLEAN NOT NULL DEFAULT false,\n    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),\n    criado_em TIMESTAMP NOT NULL DEFAULT now()\n);"
                    },
                    {
                        "type": "text",
                        "value": "## O que cada constraint garante\n\n- NOT NULL: a coluna não pode ficar vazia. Toda linha é obrigada a ter um valor ali.\n- UNIQUE: não permite dois valores iguais na coluna, como o email de usuarios.\n- DEFAULT: valor usado automaticamente quando o INSERT não informa a coluna (papel vira 'aluno' se você não disser outra coisa).\n- CHECK: uma condição que o valor precisa satisfazer, como papel só aceitar 'aluno', 'instrutor' ou 'admin'.\n- PRIMARY KEY: identifica cada linha de forma única. Por baixo, já é NOT NULL e UNIQUE ao mesmo tempo, e só pode existir uma por tabela.\n- FOREIGN KEY (o REFERENCES usuarios(id) em tarefas): garante que usuario_id só aceita valores que realmente existem na tabela usuarios. É a integridade referencial que você viu no módulo anterior, agora aplicada de verdade pelo Postgres.\n\nNenhuma dessas regras depende da aplicação lembrar de validar. Elas valem pra qualquer INSERT ou UPDATE, venha de onde vier."
                    },
                    {
                        "type": "code",
                        "value": "INSERT INTO usuarios (nome, email, papel) VALUES ('Ana Souza', 'ana@ensina.dev', 'aluno');\nINSERT INTO usuarios (nome, email, papel) VALUES ('Bruno Lima', 'bruno@ensina.dev', 'instrutor');\n\n-- tentando cadastrar outra pessoa com o mesmo email da Ana\nINSERT INTO usuarios (nome, email, papel) VALUES ('Ana Paula', 'ana@ensina.dev', 'aluno');\n\n-- ERROR:  duplicate key value violates unique constraint \"usuarios_email_key\"\n-- DETAIL:  Key (email)=(ana@ensina.dev) already exists."
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"nome\",\"email\",\"papel\"],[\"1\",\"Ana Souza\",\"ana@ensina.dev\",\"aluno\"],[\"2\",\"Bruno Lima\",\"bruno@ensina.dev\",\"instrutor\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- papel fora da lista permitida pelo CHECK\nINSERT INTO usuarios (nome, email, papel) VALUES ('Carlos Dias', 'carlos@ensina.dev', 'gerente');\n\n-- ERROR:  new row for relation \"usuarios\" violates check constraint \"usuarios_papel_check\"\n\n-- usuario_id que não existe na tabela usuarios\nINSERT INTO tarefas (titulo, usuario_id) VALUES ('Revisar PR', 999);\n\n-- ERROR:  insert or update on table \"tarefas\" violates foreign key constraint \"tarefas_usuario_id_fkey\"\n-- DETAIL:  Key (usuario_id)=(999) is not present in table \"usuarios\"."
                    },
                    {
                        "type": "quote",
                        "value": "Constraint não é burocracia: é a diferença entre confiar que a aplicação vai validar tudo certo e ter a garantia de que o banco nunca vai deixar passar um dado inválido, não importa quem escreve nele."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual constraint impede que dois usuários sejam cadastrados com o mesmo email?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "UNIQUE",
                                "isCorrect": true
                            },
                            {
                                "text": "NOT NULL",
                                "isCorrect": false
                            },
                            {
                                "text": "CHECK",
                                "isCorrect": false
                            },
                            {
                                "text": "DEFAULT",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a constraint NOT NULL garante numa coluna?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que nenhuma linha da tabela pode deixar essa coluna vazia, sem valor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o valor da coluna precisa ser único em toda a tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o valor é gerado automaticamente pelo banco a cada INSERT.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o valor precisa satisfazer uma expressão lógica definida pelo programador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela tarefas tem usuario_id INTEGER NOT NULL REFERENCES usuarios(id). O que acontece se você tentar inserir uma tarefa com usuario_id = 999 e não existir nenhum usuário com esse id?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Postgres recusa o INSERT com um erro de violação de foreign key constraint.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tarefa é inserida normalmente, com usuario_id igual a NULL.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tarefa é inserida e o Postgres cria automaticamente um usuário com id 999.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tarefa é inserida, mas fica marcada internamente como inválida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença entre a constraint PRIMARY KEY e a constraint UNIQUE numa coluna?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "PRIMARY KEY já é NOT NULL e UNIQUE ao mesmo tempo, e só pode existir uma por tabela; UNIQUE sozinha pode aparecer em várias colunas e aceita mais de um valor NULL.",
                                "isCorrect": true
                            },
                            {
                                "text": "PRIMARY KEY permite valores repetidos, enquanto UNIQUE nunca permite.",
                                "isCorrect": false
                            },
                            {
                                "text": "UNIQUE só pode ser usada em colunas do tipo TEXT, PRIMARY KEY em qualquer tipo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe diferença prática entre as duas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A coluna papel de usuarios foi criada como VARCHAR(20) DEFAULT 'aluno' CHECK (papel IN ('aluno', 'instrutor', 'admin')), sem NOT NULL. Se um INSERT informar explicitamente papel = NULL, o que acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O INSERT é aceito e a coluna fica com NULL: o DEFAULT só entra quando a coluna é omitida, e o CHECK não barra valores NULL.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Postgres ignora o NULL informado e aplica o DEFAULT, gravando 'aluno'.",
                                "isCorrect": false
                            },
                            {
                                "text": "O INSERT é recusado, porque NULL não está entre os valores aceitos pelo CHECK.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres grava uma string vazia no lugar do NULL.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Índices: fazendo as consultas voarem",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O índice de um livro, aplicado a uma tabela\n\nImagine procurar um capítulo específico num livro de 800 páginas sem usar o índice remissivo: você folhearia página por página até achar. Um índice de banco de dados resolve o mesmo problema: é uma estrutura extra, guardada ao lado da tabela, que aponta direto pras linhas que batem com uma condição, sem precisar passar por todas as outras.\n\nSem um índice, toda busca faz o que se chama de sequential scan: o Postgres lê a tabela inteira, linha por linha, comparando cada uma com a condição do WHERE. Numa tabela de mil linhas isso é instantâneo. Numa tabela de 50 milhões, é lento, mesmo que só uma linha bata com a condição."
                    },
                    {
                        "type": "code",
                        "value": "CREATE INDEX idx_usuarios_email ON usuarios(email);\nCREATE INDEX idx_tarefas_usuario_id ON tarefas(usuario_id);"
                    },
                    {
                        "type": "text",
                        "value": "## Conferindo com EXPLAIN\n\nO comando EXPLAIN mostra o plano de execução que o Postgres escolheu pra rodar uma query, sem executar a query de verdade. É a forma de confirmar se um índice está realmente sendo usado ou se a query ainda está caindo num sequential scan."
                    },
                    {
                        "type": "code",
                        "value": "-- antes de criar o índice em email\nEXPLAIN SELECT * FROM usuarios WHERE email = 'ana@ensina.dev';\n\n--  Seq Scan on usuarios  (cost=0.00..18.50 rows=1 width=58)\n--    Filter: (email = 'ana@ensina.dev'::text)\n\n-- depois de CREATE INDEX idx_usuarios_email ON usuarios(email)\nEXPLAIN SELECT * FROM usuarios WHERE email = 'ana@ensina.dev';\n\n--  Index Scan using idx_usuarios_email on usuarios  (cost=0.15..8.17 rows=1 width=58)\n--    Index Cond: (email = 'ana@ensina.dev'::text)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Sem índice\",\"Com índice\"],[\"Busca com WHERE ou JOIN na coluna\",\"Varre a tabela inteira (sequential scan)\",\"Vai direto nas linhas certas (index scan)\"],[\"INSERT, UPDATE, DELETE\",\"Só grava na tabela\",\"Grava na tabela e atualiza cada índice relacionado\"],[\"Espaço em disco\",\"Só o tamanho da tabela\",\"Tabela mais o espaço de cada índice\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando criar um índice (e quando não)\n\nVale criar índice em colunas muito usadas em WHERE, em JOIN e em ORDER BY, além de colunas com UNIQUE ou chave estrangeira. É o caso de usuarios.email (buscas por login) e tarefas.usuario_id (o JOIN mais comum entre as duas tabelas).\n\nVale pensar duas vezes antes de criar índice em tabelas pequenas (um sequential scan em 200 linhas já é rápido o suficiente), em colunas raramente usadas em filtro, ou em tabelas com muita escrita e pouca leitura, já que cada índice deixa todo INSERT, UPDATE e DELETE um pouco mais lento. E um detalhe importante: a PRIMARY KEY já vem com um índice único criado automaticamente, você não precisa, nem deve, criar outro pra ela."
                    },
                    {
                        "type": "quote",
                        "value": "Índice não é grátis: você troca espaço em disco e um pouco de velocidade na escrita por consultas muito mais rápidas na leitura. Crie pensando em como a tabela vai ser consultada de verdade, não em todas as colunas que existem."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um sequential scan?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O Postgres varre a tabela inteira, linha por linha, comparando cada uma com a condição do WHERE.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Postgres usa o índice para pular direto até as linhas certas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres ordena fisicamente a tabela no disco antes de buscar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres divide a busca entre vários núcleos do processador automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando cria um índice na coluna email da tabela usuarios?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "CREATE INDEX idx_usuarios_email ON usuarios(email);",
                                "isCorrect": true
                            },
                            {
                                "text": "CREATE INDEX ON usuarios SET email;",
                                "isCorrect": false
                            },
                            {
                                "text": "ALTER TABLE usuarios ADD INDEX email;",
                                "isCorrect": false
                            },
                            {
                                "text": "CREATE UNIQUE usuarios(email);",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela pedidos tem 2 milhões de linhas. Uma query com WHERE cliente_id = 42 está demorando vários segundos, mesmo cada cliente tendo poucos pedidos. Qual a explicação mais provável, e a solução?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não existe índice em cliente_id, então o Postgres faz um sequential scan na tabela inteira; criar um índice em cliente_id resolveria.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tabela está corrompida e precisa ser recriada do zero.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres sempre demora em tabelas com mais de 1 milhão de linhas, não tem solução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta adicionar uma constraint CHECK em cliente_id.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual o principal custo de criar muitos índices numa tabela que recebe INSERT e UPDATE com frequência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cada índice ocupa espaço extra em disco e precisa ser atualizado a cada escrita, deixando INSERT, UPDATE e DELETE mais lentos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Índices deixam os comandos SELECT mais lentos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Índices não têm custo nenhum, só benefícios.",
                                "isCorrect": false
                            },
                            {
                                "text": "Índices substituem a necessidade de definir uma PRIMARY KEY.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de criar a tabela usuarios com id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, é preciso rodar um CREATE INDEX separado na coluna id para acelerar buscas por id?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, toda PRIMARY KEY já cria automaticamente um índice único para a coluna.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, PRIMARY KEY não cria nenhum índice por conta própria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só é necessário depois que a tabela passar de 1 milhão de linhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é preciso, mas apenas enquanto a tabela tiver menos de 100 linhas.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Conectando o back-end ao banco",
        "aulas": [
            {
                "titulo": "Como o back-end conversa com o banco (driver pg e DATABASE_URL)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Como o back-end conversa com o banco\n\nAté aqui, todo SQL que você escreveu foi digitado direto no `psql`, o cliente de linha de comando do Postgres. Mas uma API não tem ninguém sentado no terminal digitando `SELECT`. Ela precisa abrir uma conexão com o banco, enviar a query e receber o resultado de volta, tudo a partir de código Node.js.\n\nÉ aqui que entra o **driver**: uma biblioteca que sabe conversar com o Postgres pela rede, no protocolo que ele entende, e devolve o resultado como um objeto JavaScript comum."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um driver\n\nUm driver, também chamado de cliente, é a ponte entre a sua linguagem de programação e o banco de dados. Ele resolve um problema chato: o Postgres não entende JavaScript, e o Node não entende o protocolo binário que o Postgres usa para trocar dados pela rede.\n\nO driver esconde essa complexidade. Você chama algo como `client.query('SELECT * FROM tarefas')`, e ele traduz isso para o protocolo do Postgres, abre a conexão TCP (a mesma porta 5432 que você já usou com o psql), envia a query, espera a resposta e converte as linhas retornadas em objetos JavaScript.\n\nPara Node.js, o driver mais usado com PostgreSQL é o **pg** (também chamado de node-postgres). Ele não é um ORM: não tem modelos, não gera SQL para você. Ele só executa o SQL que você escrever e devolve o resultado. Isso faz dele uma ótima porta de entrada: você continua no controle total das queries."
                    },
                    {
                        "type": "code",
                        "value": "npm install pg"
                    },
                    {
                        "type": "text",
                        "value": "## A string de conexão\n\nPara o driver saber onde está o banco, ele precisa de uma única informação: a **string de conexão**. Ela reúne usuário, senha, host, porta e nome do banco em um texto só, no formato `postgres://usuario:senha@host:porta/banco`.\n\nEssa string costuma ficar guardada numa variável de ambiente chamada `DATABASE_URL`. É ela que o pg lê para saber com qual banco falar, sem você precisar espalhar usuário e senha pelo código."
                    },
                    {
                        "type": "code",
                        "value": "Arquivo .env:\nDATABASE_URL=postgres://postgres:minhasenha@localhost:5432/estudos\n\nArquivo conectar.js:\nrequire('dotenv').config();\nconst { Client } = require('pg');\n\nconst client = new Client({\n  connectionString: process.env.DATABASE_URL,\n});\n\nasync function testarConexao() {\n  await client.connect();\n  const resultado = await client.query('SELECT NOW()');\n  console.log(resultado.rows[0]);\n  await client.end();\n}\n\ntestarConexao();"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso fica fora do código\n\nRepare que `conectar.js` não tem usuário, senha ou host escritos em nenhum lugar. Ele só lê `process.env.DATABASE_URL`. Isso não é frescura, é uma regra de segurança:\n\n- Se a senha do banco for escrita direto no código e for parar num `git push`, ela fica no histórico do repositório para sempre, mesmo que a linha seja apagada num commit depois.\n- Cada ambiente (sua máquina, testes, produção) usa um banco diferente, com credenciais diferentes. Variável de ambiente permite trocar de banco sem tocar em uma linha de código.\n- O arquivo `.env` nunca vai para o Git: ele entra no `.gitignore`, junto de qualquer outro segredo.\n\nO pacote `dotenv` só existe para carregar esse arquivo `.env` durante o desenvolvimento e jogar o conteúdo dele em `process.env`. Em produção, a variável costuma vir configurada direto no servidor ou no serviço de hospedagem."
                    },
                    {
                        "type": "quote",
                        "value": "O driver pg traduz chamadas JavaScript para o protocolo do Postgres. A porta de entrada do banco, a DATABASE_URL, mora em variável de ambiente, nunca no código."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o pacote pg no contexto de uma API Node.js?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É o driver que permite ao Node.js se conectar e executar queries SQL no PostgreSQL.",
                                "isCorrect": true
                            },
                            {
                                "text": "É um ORM que gera SQL automaticamente a partir de modelos JavaScript.",
                                "isCorrect": false
                            },
                            {
                                "text": "É o próprio banco de dados PostgreSQL empacotado para rodar dentro do Node.",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma ferramenta de linha de comando para substituir o psql.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando instala o driver de PostgreSQL usado neste módulo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "npm install pg",
                                "isCorrect": true
                            },
                            {
                                "text": "npm install postgres-client",
                                "isCorrect": false
                            },
                            {
                                "text": "npm install node-sql",
                                "isCorrect": false
                            },
                            {
                                "text": "npm install pg-orm",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a string de conexão com o banco (DATABASE_URL) deve ficar em uma variável de ambiente, e não escrita direto no código-fonte?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque credenciais no código ficam expostas no histórico do Git e dificultam usar bancos diferentes por ambiente, como desenvolvimento, teste e produção.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o driver pg não aceita strings de conexão escritas dentro do próprio código-fonte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque variáveis de ambiente deixam a query mais rápida de executar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Postgres exige que a senha seja passada apenas por linha de comando.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor comita um arquivo com a linha DATABASE_URL=postgres://admin:123456@prod-db:5432/app dentro de um config.js. Semanas depois, remove essa linha num novo commit. Qual é o risco real dessa credencial?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A senha continua exposta no histórico do Git, mesmo depois de removida do arquivo atual, e deve ser considerada comprometida.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum, porque o Git sempre sobrescreve versões antigas de um arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco desaparece assim que a linha é apagada do arquivo no repositório.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres bloqueia automaticamente credenciais que já apareceram em algum repositório.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual alternativa descreve corretamente o papel do driver pg (node-postgres) na arquitetura de uma API?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ele abre a conexão com o Postgres, envia o SQL que você escreve e converte o resultado em objetos JavaScript, sem gerar ou abstrair o SQL por conta própria.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele intercepta chamadas HTTP do Express e as transforma automaticamente em comandos SQL equivalentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele mantém uma cópia local das tabelas em memória para evitar consultas repetidas ao banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele substitui o psql como servidor de banco de dados durante o desenvolvimento.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Rodando queries do Node e devolvendo na API",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Da conexão à query real\n\nNa aula anterior você confirmou que dava para conectar no banco. Agora vem a parte que interessa de verdade: rodar uma query a partir do Node e usar o resultado dentro de uma rota da API, a mesma que você construiu com Express na trilha anterior."
                    },
                    {
                        "type": "text",
                        "value": "## client.query e o objeto de resultado\n\nO método `client.query(sql)` envia o SQL para o Postgres e devolve uma Promise, porque toda comunicação com o banco acontece pela rede e leva um tempo para responder. Por isso toda query é assíncrona: você usa `await` dentro de uma função `async` para esperar o resultado.\n\nO que a Promise resolve não é um array direto, é um objeto com várias informações. As mais usadas são:\n\n- `rows`: um array com as linhas retornadas, cada uma já convertida em objeto JavaScript (`{ id: 1, titulo: 'Estudar SQL' }`).\n- `rowCount`: quantas linhas vieram, ou foram afetadas, no caso de um UPDATE ou DELETE.\n\nNa prática, quase todo código só precisa de `resultado.rows`."
                    },
                    {
                        "type": "code",
                        "value": "require('dotenv').config();\nconst { Client } = require('pg');\n\nconst client = new Client({ connectionString: process.env.DATABASE_URL });\n\nasync function listarTarefas() {\n  await client.connect();\n\n  const resultado = await client.query('SELECT id, titulo, concluida FROM tarefas ORDER BY id');\n  console.log(resultado.rows);\n\n  await client.end();\n}\n\nlistarTarefas();"
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\", \"titulo\", \"concluida\"], [\"1\", \"Estudar SQL\", \"false\"], [\"2\", \"Revisar JOIN\", \"true\"], [\"3\", \"Configurar o pg\", \"false\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Devolvendo os dados numa rota Express\n\nO padrão muda pouco dentro de uma rota: em vez de usar `console.log` no resultado, você usa `res.json()` para devolver as linhas como resposta HTTP. A rota GET que antes lia de um array em memória agora consulta o Postgres a cada chamada."
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst { Client } = require('pg');\n\nconst app = express();\nconst client = new Client({ connectionString: process.env.DATABASE_URL });\nclient.connect();\n\napp.get('/tarefas', async (req, res) => {\n  try {\n    const resultado = await client.query('SELECT id, titulo, concluida FROM tarefas ORDER BY id');\n    res.json(resultado.rows);\n  } catch (erro) {\n    console.error(erro);\n    res.status(500).json({ mensagem: 'Erro ao buscar tarefas' });\n  }\n});\n\napp.listen(3000);"
                    },
                    {
                        "type": "quote",
                        "value": "client.query devolve uma Promise; o que importa quase sempre está em resultado.rows. Trocar console.log por res.json() é o que transforma uma consulta solta numa rota de API de verdade."
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao executar await client.query('SELECT ...'), onde ficam as linhas retornadas pelo banco?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Na propriedade rows do objeto retornado pela Promise.",
                                "isCorrect": true
                            },
                            {
                                "text": "Diretamente no valor retornado, como um array puro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na propriedade result, como uma string JSON.",
                                "isCorrect": false
                            },
                            {
                                "text": "No próprio objeto client, sobrescrevendo a conexão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é necessário usar await (ou .then) ao chamar client.query()?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque a comunicação com o banco acontece pela rede, e client.query retorna uma Promise.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o pg exige que toda função do arquivo seja declarada como async.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sem await o Postgres recusa a conexão por segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque await converte o SQL automaticamente para o dialeto do Postgres.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota Express precisa devolver a lista de tarefas cadastradas no banco. Depois de rodar const resultado = await client.query('SELECT * FROM tarefas'), qual é a forma correta de responder ao cliente HTTP?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "res.json(resultado.rows)",
                                "isCorrect": true
                            },
                            {
                                "text": "res.json(resultado)",
                                "isCorrect": false
                            },
                            {
                                "text": "res.send(resultado.query)",
                                "isCorrect": false
                            },
                            {
                                "text": "res.json(resultado.rowCount)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que rowCount representa no objeto devolvido por client.query?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O número de linhas retornadas (em SELECT) ou afetadas (em UPDATE ou DELETE) pela query.",
                                "isCorrect": true
                            },
                            {
                                "text": "O número total de colunas da tabela consultada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O identificador único da query dentro do banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo, em milissegundos, que a query levou para executar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota está assim:\n\napp.get('/tarefas', (req, res) => {\n  const resultado = client.query('SELECT * FROM tarefas');\n  res.json(resultado.rows);\n});\n\nAo testar, a rota devolve um objeto de Promise pendente em vez da lista de tarefas. Qual é o problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A função da rota não é async e não usa await antes de client.query, então resultado é uma Promise, não o resultado da query.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tabela tarefas não existe no banco configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "res.json só aceita arrays, nunca consegue devolver o resultado de uma query.",
                                "isCorrect": false
                            },
                            {
                                "text": "client.query não pode ser chamado dentro de uma rota do Express.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "SQL Injection: o erro que abre a porta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando o SQL vira uma armadilha\n\nToda vez que uma query usa um dado que veio do usuário, um email digitado no login, um texto de busca, um id na URL, existe uma pergunta que precisa ser respondida antes de escrever o código: como esse dado está entrando na query? A resposta errada para essa pergunta é a causa de uma das falhas de segurança mais antigas e mais graves em aplicações web: **SQL injection**."
                    },
                    {
                        "type": "text",
                        "value": "## O erro clássico: concatenar string\n\nImagine uma rota de login que busca o usuário pelo email recebido no corpo da requisição. Uma forma, errada, de escrever isso é montar o SQL colando o valor do email direto na string:"
                    },
                    {
                        "type": "code",
                        "value": "app.post('/login', async (req, res) => {\n  const { email } = req.body;\n\n  const sql = \"SELECT * FROM usuarios WHERE email = '\" + email + \"'\";\n  const resultado = await client.query(sql);\n\n  if (resultado.rows.length === 0) {\n    return res.status(401).json({ mensagem: 'Usuário não encontrado' });\n  }\n\n  res.json(resultado.rows[0]);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O ataque: ' OR '1'='1\n\nO problema é que `email` vem direto do corpo da requisição, sem nenhum filtro. Um usuário malicioso não precisa digitar um email de verdade. Ele pode digitar isto no campo de email:\n\n`' OR '1'='1`\n\nQuando esse texto é colado dentro da string SQL, a query que chega ao Postgres deixa de ser a que você escreveu no código."
                    },
                    {
                        "type": "code",
                        "value": "SELECT * FROM usuarios WHERE email = '' OR '1'='1'"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso é grave\n\nA condição `'1'='1'` é sempre verdadeira. Isso muda o significado inteiro do WHERE: em vez de filtrar por um email específico, a query passa a aceitar todas as linhas da tabela `usuarios`. Na rota de login do exemplo, `resultado.rows[0]` vira o primeiro usuário cadastrado no banco, e o atacante entra sem saber senha nenhuma.\n\nEssa mesma falha, a de concatenar string, permite muito mais do que contornar um login: com a query certa, dá para ler dados de outras tabelas, ou até apagar dados com um DROP TABLE embutido na entrada. Qualquer lugar onde uma entrada do usuário vira parte de um comando SQL é uma porta aberta.\n\nÉ a mesma lição de nunca confiar na entrada do usuário que você já viu ao validar dados de requisição. Validar formato (é um email? tem o tamanho esperado?) ajuda, mas não resolve o problema de raiz. O que resolve é nunca deixar a entrada do usuário virar texto SQL."
                    },
                    {
                        "type": "quote",
                        "value": "Se a entrada do usuário vira parte da string SQL, é o usuário quem decide o que a query faz, não você. SQL injection não é um bug raro: é a consequência direta de misturar código e dado no mesmo texto."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é SQL injection?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma falha de segurança em que a entrada de um usuário é interpretada como parte do comando SQL, alterando o que a query faz.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um recurso do PostgreSQL para inserir dados em lote com alta performance.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de sintaxe que impede a query de ser executada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tipo de índice usado para acelerar buscas por texto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo \"SELECT * FROM usuarios WHERE email = '\" + email + \"'\", qual é a causa raiz da vulnerabilidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O valor de email é concatenado direto na string SQL, sem nenhum tratamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "A query usa SELECT * em vez de listar colunas específicas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela usuarios não tem chave primária definida.",
                                "isCorrect": false
                            },
                            {
                                "text": "A rota usa o método POST em vez de GET.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um atacante envia ' OR '1'='1 no campo de email de uma rota de login que concatena a entrada direto na query. Qual é o efeito mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A condição do WHERE passa a ser sempre verdadeira, e a query retorna todas as linhas da tabela usuarios, inclusive para quem não tem credenciais válidas.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Postgres rejeita a query automaticamente por conter aspas simples repetidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A rota trava e devolve erro 500, sem expor nenhum dado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O campo email é convertido em NULL, e a query não retorna nenhuma linha.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que apenas validar o formato do email (por exemplo, com uma expressão regular) não é suficiente para prevenir SQL injection?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque validação de formato não impede que o texto, mesmo parecendo válido, seja concatenado como código SQL; o problema é como o dado entra na query, não só o formato dele.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque expressões regulares nunca conseguem identificar um email válido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque validação de formato só pode ser feita no front-end.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Postgres ignora qualquer validação feita fora do banco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além de contornar um login, o que mais um ataque de SQL injection bem-sucedido pode permitir, dependendo da query vulnerável e das permissões do banco?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ler dados de outras tabelas ou até executar comandos destrutivos, como um DROP TABLE, se esses comandos forem embutidos na entrada concatenada na query.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas alterar a cor da interface do usuário no front-end.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas aumentar o tempo de resposta da API, sem qualquer acesso a dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada além do que a validação de formato do front-end já impede.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Queries parametrizadas: a defesa certa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A solução: queries parametrizadas\n\nO problema da aula anterior não é usar dado do usuário numa query. É colar esse dado direto no texto do SQL. A solução do pg, como na maioria dos drivers de banco de dados sérios, é separar o SQL do dado: você escreve a query com **placeholders** numerados e manda os valores à parte, num array."
                    },
                    {
                        "type": "text",
                        "value": "## Placeholders e o array de valores\n\nO pg usa `$1`, `$2`, `$3` como marcadores de posição dentro do SQL. O segundo argumento de `client.query` é um array com os valores que preenchem cada placeholder, na ordem: `$1` recebe o primeiro item do array, `$2` o segundo, e assim por diante.\n\nA diferença não é estética. O driver envia o texto do SQL e os valores separadamente para o Postgres. O banco compila a query primeiro, sem nenhum valor, e só depois encaixa os valores como dado puro, nunca como parte do comando SQL. Não existe aspas, `OR` ou ponto e vírgula que escape disso, porque o valor nunca é interpretado como texto SQL."
                    },
                    {
                        "type": "code",
                        "value": "// Vulnerável: o valor do usuário vira parte do texto SQL\nconst sqlVulneravel = \"SELECT * FROM usuarios WHERE email = '\" + email + \"'\";\nawait client.query(sqlVulneravel);\n\n// Parametrizado: o valor vai separado, como dado\nconst sqlSeguro = 'SELECT * FROM usuarios WHERE email = $1';\nawait client.query(sqlSeguro, [email]);"
                    },
                    {
                        "type": "text",
                        "value": "## O mesmo ataque, agora sem efeito\n\nSe alguém enviar `' OR '1'='1` como email na versão parametrizada, o pg não cola esse texto no SQL. Ele envia `SELECT * FROM usuarios WHERE email = $1` para o Postgres e manda `' OR '1'='1` só como o valor do parâmetro `$1`. Para o banco, isso é uma string qualquer, do tamanho que for, que nenhum usuário tem como email. A query roda normalmente e devolve zero linhas, o comportamento esperado para um email que não existe."
                    },
                    {
                        "type": "code",
                        "value": "app.post('/tarefas', async (req, res) => {\n  const { titulo, concluida } = req.body;\n\n  const resultado = await client.query(\n    'INSERT INTO tarefas (titulo, concluida) VALUES ($1, $2) RETURNING *',\n    [titulo, concluida]\n  );\n\n  res.status(201).json(resultado.rows[0]);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## A regra de ouro\n\nDado que vem do usuário, corpo da requisição, query string, parâmetro de rota, cabeçalho, sempre vai como parâmetro. Nunca é concatenado com `+`, nunca colado com template string. A regra vale para SELECT, mas também para INSERT, UPDATE e DELETE: qualquer query que misture SQL fixo com dado variável usa placeholder."
                    },
                    {
                        "type": "quote",
                        "value": "Placeholder é SQL, valor é dado, e o pg nunca deixa os dois se misturarem. $1, $2 e um array de valores: essa é a defesa que fecha a porta do SQL injection."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na chamada client.query('SELECT * FROM usuarios WHERE email = $1', [email]), o que $1 representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um placeholder que será substituído, com segurança, pelo primeiro valor do array passado como segundo argumento.",
                                "isCorrect": true
                            },
                            {
                                "text": "O índice da primeira linha retornada pela query.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma variável global do PostgreSQL que guarda o último valor inserido.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número da coluna email dentro da tabela usuarios.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções mostra a forma segura de usar o email do usuário numa query com o pg?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "client.query('SELECT * FROM usuarios WHERE email = $1', [email])",
                                "isCorrect": true
                            },
                            {
                                "text": "client.query(\"SELECT * FROM usuarios WHERE email = '\" + email + \"'\")",
                                "isCorrect": false
                            },
                            {
                                "text": "client.query(`SELECT * FROM usuarios WHERE email = '${email}'`)",
                                "isCorrect": false
                            },
                            {
                                "text": "client.query('SELECT * FROM usuarios WHERE email = ' + email)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um atacante envia ' OR '1'='1 como valor de email para uma rota que usa client.query('SELECT * FROM usuarios WHERE email = $1', [email]). O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A query busca por um usuário cujo email seja literalmente a string ' OR '1'='1, e não retorna nenhuma linha, porque o valor nunca é interpretado como parte do comando SQL.",
                                "isCorrect": true
                            },
                            {
                                "text": "A query retorna todos os usuários da tabela, do mesmo jeito que na versão concatenada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pg lança um erro de sintaxe e encerra a conexão com o banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "O PostgreSQL executa o OR como um comando separado, apagando a condição original.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma query parametrizada continua segura mesmo quando o valor do parâmetro contém aspas simples ou palavras-chave SQL como OR?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o SQL é compilado separadamente dos valores; o valor é sempre tratado como dado, nunca interpretado como parte do comando.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o pg remove automaticamente aspas e palavras-chave do valor antes de enviar a query.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o PostgreSQL bloqueia qualquer valor que contenha a palavra OR.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Express valida o corpo da requisição antes de chamar client.query.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota precisa inserir uma nova tarefa recebendo titulo e concluida do corpo da requisição. Qual chamada aplica corretamente a regra de sempre usar parâmetros para dado do usuário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "client.query('INSERT INTO tarefas (titulo, concluida) VALUES ($1, $2)', [titulo, concluida])",
                                "isCorrect": true
                            },
                            {
                                "text": "client.query('INSERT INTO tarefas (titulo, concluida) VALUES (' + titulo + ', ' + concluida + ')')",
                                "isCorrect": false
                            },
                            {
                                "text": "client.query(`INSERT INTO tarefas (titulo, concluida) VALUES ('${titulo}', ${concluida})`)",
                                "isCorrect": false
                            },
                            {
                                "text": "client.query('INSERT INTO tarefas (titulo, concluida) VALUES ($1, $2)', titulo, concluida)",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Connection pool e um CRUD que persiste de verdade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O custo de abrir uma conexão por requisição\n\nAté aqui, cada exemplo criou um `Client` e chamou `client.connect()` uma vez, no início do programa. Numa API de verdade, isso não escala se for feito a cada requisição: abrir uma conexão nova para cada requisição HTTP faz com que toda requisição pague o custo de autenticar no Postgres e alocar memória no servidor do banco para aquela sessão, para depois encerrar tudo de novo. Com poucos usuários simultâneos isso passa despercebido; com tráfego real, vira gargalo rápido, e o Postgres tem um limite de quantas conexões simultâneas aceita."
                    },
                    {
                        "type": "text",
                        "value": "## O Pool do pg\n\nA solução é reaproveitar conexões já abertas em vez de abrir e fechar uma a cada query. O pg resolve isso com `Pool`: em vez de um `Client` só, você cria um `Pool`, que mantém um conjunto de conexões já estabelecidas com o banco.\n\nQuando você chama `pool.query(sql, valores)`, o pool empresta uma conexão livre do conjunto, roda a query, e devolve essa conexão assim que termina, pronta para a próxima requisição usar. A API é praticamente igual à do `Client`: mesmo `.query()`, mesmos placeholders `$1`, `$2`."
                    },
                    {
                        "type": "code",
                        "value": "const { Pool } = require('pg');\n\nconst pool = new Pool({\n  connectionString: process.env.DATABASE_URL,\n  max: 10,\n});\n\napp.get('/tarefas', async (req, res) => {\n  const resultado = await pool.query('SELECT id, titulo, concluida FROM tarefas ORDER BY id');\n  res.json(resultado.rows);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Esgotamento de conexões e por que fechar recursos importa\n\nO Pool não cria conexões ilimitadas. A opção `max` define quantas conexões simultâneas ele pode manter, 10 no exemplo acima. Se todas as conexões do pool estiverem ocupadas com queries lentas e novas requisições continuarem chegando, as próximas ficam numa fila esperando alguma conexão liberar. É o chamado esgotamento do pool: sintoma comum de queries lentas demais, ou de um `max` baixo demais para o tráfego real.\n\nPor isso duas práticas importam: manter as queries rápidas (índices ajudam, como você viu no módulo anterior) e nunca deixar uma conexão presa. Com `Pool`, isso é automático a cada `pool.query()`, a conexão sempre volta para o conjunto, mesmo se a query der erro. No encerramento da aplicação, `pool.end()` fecha todas as conexões do conjunto de uma vez."
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst { Pool } = require('pg');\n\nconst app = express();\napp.use(express.json());\n\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });\n\napp.get('/tarefas', async (req, res) => {\n  const resultado = await pool.query('SELECT id, titulo, concluida FROM tarefas ORDER BY id');\n  res.json(resultado.rows);\n});\n\napp.get('/tarefas/:id', async (req, res) => {\n  const { id } = req.params;\n  const resultado = await pool.query('SELECT id, titulo, concluida FROM tarefas WHERE id = $1', [id]);\n\n  if (resultado.rows.length === 0) {\n    return res.status(404).json({ mensagem: 'Tarefa não encontrada' });\n  }\n  res.json(resultado.rows[0]);\n});\n\napp.post('/tarefas', async (req, res) => {\n  const { titulo } = req.body;\n  const resultado = await pool.query(\n    'INSERT INTO tarefas (titulo, concluida) VALUES ($1, false) RETURNING *',\n    [titulo]\n  );\n  res.status(201).json(resultado.rows[0]);\n});\n\napp.put('/tarefas/:id', async (req, res) => {\n  const { id } = req.params;\n  const { titulo, concluida } = req.body;\n  const resultado = await pool.query(\n    'UPDATE tarefas SET titulo = $1, concluida = $2 WHERE id = $3 RETURNING *',\n    [titulo, concluida, id]\n  );\n\n  if (resultado.rows.length === 0) {\n    return res.status(404).json({ mensagem: 'Tarefa não encontrada' });\n  }\n  res.json(resultado.rows[0]);\n});\n\napp.delete('/tarefas/:id', async (req, res) => {\n  const { id } = req.params;\n  const resultado = await pool.query('DELETE FROM tarefas WHERE id = $1 RETURNING id', [id]);\n\n  if (resultado.rows.length === 0) {\n    return res.status(404).json({ mensagem: 'Tarefa não encontrada' });\n  }\n  res.status(204).send();\n});\n\napp.listen(3000);"
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\", \"titulo\", \"concluida\"], [\"1\", \"Estudar SQL\", \"true\"], [\"2\", \"Revisar JOIN\", \"true\"], [\"3\", \"Configurar o pg\", \"false\"], [\"4\", \"Testar o CRUD completo\", \"false\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Client conecta uma vez; Pool empresta e devolve conexões conforme a demanda. Trocar um array em memória por SELECT, INSERT, UPDATE e DELETE parametrizados é o que faz o CRUD sobreviver a um restart da API."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que abrir uma nova conexão com o banco a cada requisição HTTP é uma prática ruim numa API com tráfego real?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque autenticar e estabelecer uma conexão nova tem um custo, e o Postgres aceita apenas um número limitado de conexões simultâneas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o PostgreSQL não permite mais de uma conexão por aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada conexão nova apaga os dados da conexão anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o driver pg não suporta o objeto Client fora de scripts isolados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o Pool do pg faz, na prática?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Mantém um conjunto de conexões já abertas com o banco e as reaproveita entre as queries, em vez de abrir e fechar uma conexão a cada vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "Agrupa várias queries diferentes em uma única transação automática.",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazena em cache o resultado de queries repetidas para evitar acessar o banco de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui a necessidade de usar placeholders nas queries.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API configura new Pool({ connectionString: process.env.DATABASE_URL, max: 10 }) e recebe um pico de requisições lentas simultâneas. O que provavelmente acontece quando as 10 conexões do pool estão todas ocupadas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Novas queries ficam esperando numa fila até alguma conexão do pool ser liberada, o chamado esgotamento do pool.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Pool cria conexões extras automaticamente, sem limite, até atender todas as requisições.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres encerra o banco de dados até o tráfego normalizar.",
                                "isCorrect": false
                            },
                            {
                                "text": "As queries mais antigas são canceladas para abrir espaço para as novas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de migrar de Client para Pool, uma rota troca client.query(sql, valores) por pool.query(sql, valores). O que muda na forma de escrever a query em si?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada na forma de escrever a query: os placeholders $1, $2 e o array de valores funcionam do mesmo jeito, o que muda é como a conexão é gerenciada por baixo dos panos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os placeholders passam a usar ? em vez de $1, $2.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os valores deixam de precisar ser passados dentro de um array.",
                                "isCorrect": false
                            },
                            {
                                "text": "pool.query não aceita mais queries do tipo INSERT ou UPDATE, só SELECT.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota de atualizar tarefa está assim:\n\napp.put('/tarefas/:id', async (req, res) => {\n  const { id } = req.params;\n  const { titulo, concluida } = req.body;\n  const resultado = await pool.query(\n    'UPDATE tarefas SET titulo = $1, concluida = $2 WHERE id = $3 RETURNING *',\n    [titulo, concluida, id]\n  );\n  if (resultado.rows.length === 0) {\n    return res.status(404).json({ mensagem: 'Tarefa não encontrada' });\n  }\n  res.json(resultado.rows[0]);\n});\n\nPor que essa rota é considerada segura contra SQL injection e correta para um CRUD persistente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque usa WHERE com o id para atingir só a linha certa, os três valores vêm como parâmetros ($1, $2, $3), e trata o caso de nenhuma linha ser afetada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque dispensa o uso de WHERE, já que RETURNING * garante que só uma linha seja alterada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque concatena o id diretamente na query para simplificar o SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque usa pool.query em vez de client.query, o que por si só elimina qualquer risco de SQL injection.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - ORMs: produtividade com cuidado",
        "aulas": [
            {
                "titulo": "O que é um ORM e por que usar (ou não)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é um ORM e por que usar (ou não)\n\nNos módulos anteriores desta trilha você escreveu SQL na mão: SELECT com WHERE e JOIN, INSERT com RETURNING, UPDATE com cuidado redobrado no WHERE, e conectou tudo isso a uma API Node com o driver `pg`, usando queries parametrizadas para não abrir brecha de SQL injection. Isso é, de longe, a parte mais importante da trilha: entender o banco por baixo é o que separa quem programa de quem só decora comandos.\n\nSó que, no dia a dia de um projeto real, boa parte das equipes não escreve cada SELECT e INSERT à mão o tempo todo. Elas usam uma camada chamada **ORM** (Object-Relational Mapping) para automatizar o que é repetitivo. Nesta última aula da trilha você entende o que essa camada faz, o que ela resolve de verdade e, mais importante, o que ela não resolve."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um ORM, na prática\n\nORM significa Object-Relational Mapping, mapeamento objeto-relacional. A ideia central é simples: cada tabela do banco vira uma classe (ou um \"model\") na linguagem de programação, e cada linha da tabela vira um objeto dessa classe. Em vez de escrever `SELECT * FROM usuarios WHERE id = 1` e depois transformar o resultado num objeto JavaScript à mão, você chama um método como `findUnique({ where: { id: 1 } })` e recebe esse objeto pronto, já tipado.\n\nPor baixo, o ORM continua gerando e executando SQL. Ele não substitui o banco relacional nem inventa uma forma nova de guardar dados: ele só evita que você digite esse SQL toda vez."
                    },
                    {
                        "type": "text",
                        "value": "## O que um ORM resolve de verdade\n\n- **Produtividade**: operações comuns (buscar por id, criar, atualizar, listar com filtro) viram uma chamada de método, sem reescrever a mesma query repetida em vários lugares do projeto.\n- **Tipagem**: em TypeScript, um ORM como o Prisma gera tipos a partir do schema do banco. Se uma coluna se chama `email` e é obrigatória, o editor avisa em tempo de desenvolvimento se você esquecer esse campo ou errar o nome, antes mesmo de rodar o código.\n- **Segurança por padrão**: como você não escreve a string SQL na mão, não existe a tentação de concatenar um valor recebido do usuário direto na query. O ORM monta a query parametrizada por você, o mesmo cuidado que você já tomava manualmente no módulo 6, só que automático.\n- **Portabilidade entre bancos**: trocar de PostgreSQL para MySQL, por exemplo, tende a exigir menos mudança de código quando o acesso a dados passa pelo ORM, já que ele abstrai boa parte das diferenças de sintaxe entre os bancos."
                    },
                    {
                        "type": "text",
                        "value": "## O que um ORM não resolve\n\nNada disso substitui entender o banco. Um ORM não decide por você:\n\n- Como modelar as tabelas e os relacionamentos entre elas: isso continua sendo trabalho de modelagem, o que você viu no módulo 4.\n- Quando criar um índice, ou por que uma query está lenta porque falta um, tema do módulo 5.\n- Se uma consulta gerada automaticamente é eficiente ou está fazendo mais trabalho do que precisa.\n- O que uma transação realmente garante, ou quando agrupar operações, tema do módulo 3.\n\nOu seja: o ORM tira trabalho repetitivo das suas mãos, não a responsabilidade de entender o que acontece no banco. As próximas aulas mostram isso na prática, inclusive um problema clássico (N+1) que só faz sentido para quem entende o SQL por trás da abstração."
                    },
                    {
                        "type": "text",
                        "value": "## Query builder x ORM completo\n\nNem toda ferramenta de acesso a dados é um ORM completo. Vale conhecer os dois estilos mais comuns no ecossistema Node:\n\n- **Query builder**, como **Knex** ou **Drizzle**: ajuda a montar SQL de forma programática, mais perto do SQL de verdade, sem impor um sistema de models, classes e migrations automáticas. Você monta a query encadeando métodos, mas ainda pensa em termos de tabelas e colunas.\n- **ORM completo**, como **Prisma**, **TypeORM** ou **Sequelize**: adiciona uma camada de modelos, relacionamentos declarados no schema e uma ferramenta própria de migrations em volta do acesso a dados.\n\nNão existe um \"melhor\" absoluto. Um query builder costuma deixar mais visível o SQL gerado; um ORM completo costuma ser mais produtivo para CRUDs comuns. Nesta trilha, o exemplo é o Prisma, hoje a opção mais popular e didática do ecossistema Node/TypeScript."
                    },
                    {
                        "type": "code",
                        "value": "-- o que voce escrevia ate o modulo 6, com o driver pg puro\nSELECT * FROM usuarios WHERE id = $1;\n\n// com um query builder (Knex), mais perto do SQL\nconst usuario = await knex('usuarios').where({ id: 1 }).first();\n\n// com um ORM completo (Prisma), atraves de um model\nconst usuario2 = await prisma.usuario.findUnique({\n  where: { id: 1 },\n});"
                    },
                    {
                        "type": "quote",
                        "value": "Um ORM não é mágica: é uma camada que gera o mesmo SQL que você já sabe escrever, de forma mais produtiva e mais segura por padrão. Ele muda como você escreve a query, não o que acontece no banco por baixo dela."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que um ORM (Object-Relational Mapping) faz, na essência?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Mapeia tabelas do banco relacional para objetos ou classes da linguagem de programação, permitindo interagir com o banco por meio de código em vez de SQL escrito à mão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Substitui completamente o banco de dados relacional por um banco orientado a objetos.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um tipo de banco de dados NoSQL otimizado para guardar objetos JSON.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um servidor HTTP que expõe automaticamente uma API REST sobre as tabelas do banco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que um ORM como o Prisma NÃO resolve sozinho, mesmo depois de configurado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A geração automática de um cliente de acesso ao banco a partir do schema.",
                                "isCorrect": false
                            },
                            {
                                "text": "A necessidade de entender modelagem de dados e índices: más decisões nessas áreas continuam gerando queries lentas mesmo com ORM.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tipagem das colunas do banco no código.",
                                "isCorrect": false
                            },
                            {
                                "text": "A montagem automática de queries parametrizadas para operações comuns.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um query builder como Knex ou Drizzle e um ORM completo como Prisma ou TypeORM têm uma diferença central. Qual das opções descreve essa diferença corretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Query builders só funcionam com MySQL, enquanto ORMs completos só funcionam com PostgreSQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um query builder não permite parametrizar queries, por isso é mais suscetível a SQL injection do que um ORM.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um query builder ajuda a montar SQL de forma programática, mais próxima do SQL real, sem impor um sistema completo de models e migrations; um ORM completo adiciona uma camada de modelos, relacionamentos e migrations em torno do acesso a dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não existe diferença prática, os dois termos descrevem a mesma ferramenta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena já usa TypeScript no back-end e quer produtividade num CRUD comum. Qual vantagem prática de adotar um ORM como o Prisma se destaca nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Prisma elimina totalmente a necessidade de índices no banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tipagem de ponta a ponta: o Client gerado a partir do schema garante autocomplete e erros de tipo em tempo de compilação, além de reduzir a quantidade de SQL escrito à mão para operações comuns.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Prisma torna as queries automaticamente mais rápidas que SQL escrito à mão, em qualquer cenário.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Prisma impede qualquer possibilidade de erro de lógica na aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa migra sua aplicação de PostgreSQL para outro banco relacional e o time comenta que \"trocar de banco deu bem menos trabalho por causa do ORM\". Isso reflete qual característica real, e qual limite, dos ORMs?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "ORMs tornam dois bancos de dados diferentes tecnicamente idênticos em todos os aspectos, sem exceção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Essa portabilidade só existe em bancos NoSQL, nunca em bancos relacionais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso não tem relação com o ORM; a facilidade veio exclusivamente do driver de conexão de cada banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "ORMs abstraem boa parte das diferenças de sintaxe SQL entre bancos, facilitando a portabilidade do código de acesso a dados; isso não elimina diferenças de comportamento, tipos específicos ou performance entre os bancos, que ainda podem exigir ajustes manuais.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Prisma na prática: schema e queries",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Prisma na prática: schema e queries\n\nO Prisma se organiza em três peças que trabalham juntas: o arquivo `schema.prisma`, onde você declara os models (a fonte da verdade do formato dos seus dados); o **Prisma Client**, um código gerado automaticamente a partir desse schema, com um método para cada operação em cada tabela; e o **Prisma Migrate**, que cuida de aplicar as mudanças do schema no banco (assunto da próxima aula). Esta aula fica com as duas primeiras peças: schema e queries."
                    },
                    {
                        "type": "code",
                        "value": "datasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\ngenerator client {\n  provider = \"prisma-client-js\"\n}\n\nmodel Usuario {\n  id        Int      @id @default(autoincrement())\n  nome      String\n  email     String   @unique\n  senhaHash String   @map(\"senha_hash\")\n  criadoEm  DateTime @default(now()) @map(\"criado_em\")\n  tarefas   Tarefa[]\n\n  @@map(\"usuarios\")\n}\n\nmodel Tarefa {\n  id        Int      @id @default(autoincrement())\n  titulo    String\n  concluida Boolean  @default(false)\n  usuarioId Int      @map(\"usuario_id\")\n  usuario   Usuario  @relation(fields: [usuarioId], references: [id])\n  criadoEm  DateTime @default(now()) @map(\"criado_em\")\n\n  @@map(\"tarefas\")\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo o schema, parte por parte\n\nO bloco `datasource db` diz qual banco usar (`postgresql`) e de onde vem a string de conexão: a variável de ambiente `DATABASE_URL`, a mesma ideia de configuração por `.env` que você já usava com o driver `pg` no módulo 6. O bloco `generator client` diz para o Prisma gerar o Client em JavaScript/TypeScript, o que acontece quando você roda `npx prisma generate`.\n\nCada `model` vira uma tabela. Repare em dois detalhes importantes:\n\n- Os campos usam **camelCase** (`senhaHash`, `criadoEm`), convenção de nomes em JavaScript, mas o atributo `@map(\"senha_hash\")` diz ao Prisma qual é o nome real da coluna no PostgreSQL, em **snake_case**. O `@@map(\"usuarios\")` faz o mesmo para o nome da tabela.\n- `tarefas Tarefa[]` e `usuario Usuario @relation(...)` declaram o relacionamento 1:N entre `usuarios` e `tarefas`, o mesmo relacionamento por chave estrangeira do módulo 4, agora navegável como propriedade de objeto.\n\nOu seja: o schema não inventa uma estrutura nova, ele descreve a mesma tabela relacional que você criaria com `CREATE TABLE`, com um mapeamento explícito entre nome de campo no código e nome de coluna no banco."
                    },
                    {
                        "type": "code",
                        "value": "// SELECT * FROM tarefas WHERE usuario_id = $1 ORDER BY criado_em DESC;\nconst tarefas = await prisma.tarefa.findMany({\n  where: { usuarioId: 1 },\n  orderBy: { criadoEm: 'desc' },\n});\n\n// SELECT * FROM usuarios WHERE id = $1 LIMIT 1;\nconst usuario = await prisma.usuario.findUnique({\n  where: { id: 1 },\n});\n\n// INSERT INTO tarefas (titulo, usuario_id) VALUES ($1, $2) RETURNING *;\nconst novaTarefa = await prisma.tarefa.create({\n  data: {\n    titulo: 'Estudar Prisma',\n    usuarioId: 1,\n  },\n});\n\n// UPDATE tarefas SET concluida = $1 WHERE id = $2;\nconst tarefaConcluida = await prisma.tarefa.update({\n  where: { id: novaTarefa.id },\n  data: { concluida: true },\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O SQL não foi embora, só ficou escondido\n\nNo módulo 6, uma chamada equivalente vinha de `pool.query('INSERT INTO tarefas (titulo, usuario_id) VALUES ($1, $2) RETURNING *', [titulo, usuarioId])`, escrita à mão, com `$1` e `$2` parametrizados por você. O `prisma.tarefa.create(...)` do bloco anterior faz, por baixo, praticamente a mesma coisa: monta um INSERT parametrizado e devolve a linha criada. A diferença não é que um seja \"seguro\" e o outro não, os dois parametrizam; a diferença é que o Prisma monta essa query sozinho a partir de um objeto JavaScript, sem você escrever SQL nem lembrar do RETURNING.\n\nIsso vale para toda operação: por trás de `findMany`, `findUnique`, `create` ou `update` sempre existe uma query real rodando no PostgreSQL, visível se você ligar o log de queries do Prisma. Entender isso é o que vai ajudar a diagnosticar problemas de performance nas próximas aulas, em vez de tratar o ORM como uma caixa-preta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"id\",\"titulo\",\"concluida\",\"usuarioId\",\"criadoEm\"],[\"1\",\"Estudar SQL\",\"true\",\"1\",\"2026-05-02T14:00:00.000Z\"],[\"2\",\"Estudar Prisma\",\"false\",\"1\",\"2026-07-10T09:15:00.000Z\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O Prisma Client não é uma linguagem nova para aprender: é uma tradução direta do SQL que você já sabe escrever, com tipos e menos repetição. Se você sabe ler o SELECT, o INSERT e o UPDATE que geram essas chamadas, nunca vai depender cegamente da abstração."
                    }
                ],
                "questions": [
                    {
                        "statement": "No schema.prisma, o que declara o tipo do banco e a URL de conexão que o Prisma vai usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O bloco generator client, que serve apenas para definir o nome dos models.",
                                "isCorrect": false
                            },
                            {
                                "text": "O bloco datasource db, que define o provider (por exemplo postgresql) e a propriedade url, normalmente lida de uma variável de ambiente como DATABASE_URL.",
                                "isCorrect": true
                            },
                            {
                                "text": "O arquivo package.json, onde o Prisma lê diretamente a string de conexão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma migration, único lugar onde a URL do banco pode ser definida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual chamada do Prisma Client corresponde a \"SELECT * FROM tarefas WHERE usuario_id = $1\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "prisma.tarefa.create({ data: { usuarioId: 1 } })",
                                "isCorrect": false
                            },
                            {
                                "text": "prisma.tarefa.delete({ where: { usuarioId: 1 } })",
                                "isCorrect": false
                            },
                            {
                                "text": "prisma.tarefa.findMany({ where: { usuarioId: 1 } })",
                                "isCorrect": true
                            },
                            {
                                "text": "prisma.tarefa.update({ where: { usuarioId: 1 } })",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O código chama prisma.usuario.create({ data: { nome: 'Ana', email: 'ana@x.com', senhaHash: '...' } }). O que essa chamada faz por baixo, em termos de SQL?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Executa um SELECT para verificar se o usuário já existe, sem inserir nada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera uma nova migration automaticamente para registrar essa inserção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Executa a query concatenando os valores recebidos direto na string SQL, como numa query manual mal escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Executa uma query INSERT parametrizada na tabela usuarios; o Prisma monta os parâmetros automaticamente, sem concatenar valores na string SQL.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "No schema.prisma, um campo é declarado como usuarioId, mas a coluna real no PostgreSQL se chama usuario_id. Qual mecanismo do Prisma faz esse mapeamento entre o nome do campo no model e o nome da coluna no banco?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O atributo @map(\"usuario_id\") no campo do model (ou @@map no nível da tabela), que conecta o nome usado no código ao nome real da coluna ou tabela no banco.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Prisma renomeia automaticamente todas as colunas do banco para camelCase na primeira migration.",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso só é possível criando uma view no banco com o novo nome.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Prisma ignora o nome da coluna e usa sempre a ordem em que as colunas foram criadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um trecho usa pool.query('INSERT INTO tarefas (titulo, usuario_id) VALUES ($1, $2) RETURNING *', [titulo, usuarioId]) com o driver pg puro, do jeito ensinado no módulo 6. Ao reescrever para prisma.tarefa.create({ data: { titulo, usuarioId } }), o que muda de fato na segurança e no resultado da operação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Prisma é a única das duas formas protegida contra SQL injection, porque o driver pg puro sempre concatena os valores diretamente na query.",
                                "isCorrect": false
                            },
                            {
                                "text": "A troca elimina a necessidade de a tabela tarefas ter uma chave primária.",
                                "isCorrect": false
                            },
                            {
                                "text": "Com o Prisma, a operação deixa de ser uma query SQL de verdade e passa a gravar os dados diretamente em um arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pouca coisa muda em segurança: as duas formas já parametrizam os valores, nenhuma concatena entrada do usuário na string SQL. A diferença do Prisma é gerar essa query automaticamente e retornar um objeto tipado, sem exigir escrever o SQL nem o RETURNING * manualmente.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Migrations: versionando o schema do banco",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Migrations: versionando o schema do banco\n\nUm projeto de verdade muda de schema o tempo todo: uma tabela nova, uma coluna a mais, uma constraint que faltava. O problema é manter isso sincronizado entre o banco do seu computador, o banco de cada colega de equipe, o ambiente de teste e o banco de produção. Se cada mudança for um `ALTER TABLE` digitado manualmente em cada lugar, é questão de tempo até um ambiente ficar dessincronizado do código que roda em cima dele, e ninguém mais souber ao certo qual é o schema real de produção."
                    },
                    {
                        "type": "text",
                        "value": "## O que é uma migration\n\nUma **migration** é um passo versionado e ordenado de alteração do schema do banco: \"criar a tabela usuarios\", \"adicionar a coluna senha_hash\", \"criar um índice em email\". Cada migration vira um arquivo, guardado no repositório junto do resto do código, numerado ou com timestamp, aplicado sempre na mesma ordem. O banco passa a ter um histórico auditável de como o schema chegou ao estado atual, do mesmo jeito que o Git guarda o histórico do código.\n\nNo Prisma, você não escreve `ALTER TABLE` à mão: você altera o `schema.prisma` (por exemplo, adiciona um campo num model) e roda `npx prisma migrate dev --name adiciona_campo`. O Prisma compara o schema novo com o estado atual do banco, gera o SQL necessário para essa diferença dentro de uma migration nova, aplica no banco de desenvolvimento e regenera o Prisma Client."
                    },
                    {
                        "type": "code",
                        "value": "-- prisma/migrations/20260115120000_cria_tabelas_iniciais/migration.sql\n-- gerado automaticamente pelo prisma migrate dev, a partir do schema.prisma\n\nCREATE TABLE \"usuarios\" (\n    \"id\" SERIAL NOT NULL,\n    \"nome\" TEXT NOT NULL,\n    \"email\" TEXT NOT NULL,\n    \"senha_hash\" TEXT NOT NULL,\n    \"criado_em\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n\n    CONSTRAINT \"usuarios_pkey\" PRIMARY KEY (\"id\")\n);\n\nCREATE UNIQUE INDEX \"usuarios_email_key\" ON \"usuarios\"(\"email\");\n\nCREATE TABLE \"tarefas\" (\n    \"id\" SERIAL NOT NULL,\n    \"titulo\" TEXT NOT NULL,\n    \"concluida\" BOOLEAN NOT NULL DEFAULT false,\n    \"usuario_id\" INTEGER NOT NULL,\n    \"criado_em\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n\n    CONSTRAINT \"tarefas_pkey\" PRIMARY KEY (\"id\")\n);\n\nALTER TABLE \"tarefas\" ADD CONSTRAINT \"tarefas_usuario_id_fkey\"\n  FOREIGN KEY (\"usuario_id\") REFERENCES \"usuarios\"(\"id\") ON DELETE RESTRICT ON UPDATE CASCADE;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"comando\",\"o que faz\",\"quando usar\"],[\"npx prisma migrate dev\",\"Compara o schema com o banco, gera uma nova migration a partir da diferença, aplica no banco e regenera o Client\",\"No dia a dia, em desenvolvimento local\"],[\"npx prisma migrate deploy\",\"Aplica as migrations já existentes e versionadas, sem gerar nenhuma nova\",\"Em CI/CD e produção, durante o deploy\"],[\"npx prisma generate\",\"Gera o Prisma Client a partir do schema.prisma atual, sem alterar o banco\",\"Depois de clonar o projeto ou trocar de branch com schema diferente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa em equipe e em produção\n\nO Prisma guarda, dentro do próprio banco, uma tabela de controle chamada `_prisma_migrations`, com o registro de quais migrations já foram aplicadas ali. É assim que a ferramenta sabe, em qualquer ambiente, exatamente quais passos faltam rodar: nenhuma migration roda duas vezes, e nenhuma fica esquecida.\n\nIsso é o que permite um fluxo confiável em equipe: você cria a migration localmente, comita o arquivo gerado junto com a alteração de código que depende dela, e quando um colega puxa a branch, basta rodar as migrations pendentes para o banco dele ficar no mesmo estado que o seu. Em produção, o deploy roda `migrate deploy` antes de subir a nova versão da aplicação, então o schema do banco nunca fica um passo atrás do código que espera aquele schema. É esse tipo de disciplina, aliás, que a própria plataforma em que você estuda usa para versionar seu banco: cada mudança de schema vira uma migration commitada, nunca um ajuste manual direto em produção."
                    },
                    {
                        "type": "quote",
                        "value": "Uma migration é, antes de tudo, controle de versão para o schema do banco: cada mudança fica registrada, ordenada e repetível, em vez de depender da memória de alguém sobre o que foi alterado manualmente em cada ambiente."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é, na prática, uma migration?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um backup completo do banco de dados feito periodicamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um passo versionado e ordenado que altera o schema do banco de dados, como criar uma tabela ou adicionar uma coluna, guardado como arquivo e aplicado de forma controlada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma cópia de todos os dados de uma tabela para outra, sem alterar a estrutura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um comando que apaga e recria o banco de dados inteiro do zero a cada deploy.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que não é uma boa prática cada desenvolvedor da equipe simplesmente rodar ALTER TABLE manualmente no banco sempre que precisa mudar o schema?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o PostgreSQL não permite o comando ALTER TABLE em nenhuma situação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ALTER TABLE sempre apaga os dados existentes da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque apenas o Prisma tem permissão de sistema para alterar tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque as mudanças não ficam versionadas nem documentadas: outros ambientes, como o banco de outro dev, o de staging ou o de produção, ficam dessincronizados, e ninguém sabe ao certo quais alterações já foram aplicadas onde.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Durante o desenvolvimento local, um dev roda \"npx prisma migrate dev\" depois de alterar o schema.prisma. O que esse comando faz, diferente de um comando pensado para produção como \"prisma migrate deploy\"?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "migrate dev compara o schema com o banco, gera um novo arquivo de migration a partir das diferenças, aplica essa migration no banco de desenvolvimento e regenera o Prisma Client; migrate deploy só aplica migrations já existentes e versionadas, sem gerar nada novo, sendo o comando adequado para CI/produção.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois comandos fazem exatamente a mesma coisa, migrate dev é só um apelido de migrate deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "migrate dev apaga todos os dados de produção automaticamente para aplicar o novo schema.",
                                "isCorrect": false
                            },
                            {
                                "text": "migrate deploy gera as migrations a partir do schema.prisma, enquanto migrate dev apenas aplica migrations já prontas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O Prisma mantém uma tabela de controle (_prisma_migrations) dentro do próprio banco de dados. Para que ela serve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Para guardar uma cópia de segurança de todos os dados de todas as tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para armazenar as senhas de acesso ao banco de forma criptografada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para registrar quais migrations já foram aplicadas naquele banco, permitindo que a ferramenta saiba exatamente quais passos ainda faltam rodar quando o schema evolui.",
                                "isCorrect": true
                            },
                            {
                                "text": "Para registrar o histórico de queries SELECT executadas pela aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois desenvolvedores, em branches separadas, criam migrations diferentes que alteram a mesma tabela tarefas ao mesmo tempo. Depois que as duas branches são mescladas, o que é essencial verificar antes de aplicar as migrations em produção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nada precisa ser verificado, o Prisma sempre resolve automaticamente qualquer conflito entre migrations concorrentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Basta apagar o banco de produção e recriar do zero a cada novo deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "É preciso reescrever manualmente o schema.prisma inteiro, já que migrations não podem coexistir em um mesmo projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que as migrations resultantes fazem sentido quando aplicadas juntas, na ordem correta, sobre o mesmo estado de schema; conflitos de migrations concorrentes podem exigir recriar ou reordenar uma delas manualmente antes do deploy, já que foram geradas a partir de pontos de partida diferentes.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O lado sombrio: N+1 e queries escondidas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O lado sombrio: N+1 e queries escondidas\n\nAté aqui, o Prisma parece só vantagem: menos SQL escrito à mão, tipos automáticos, migrations organizadas. É hora da parte honesta. Todo ORM, o Prisma incluso, facilita demais disparar queries sem perceber, e o exemplo mais clássico disso tem até nome: o **problema N+1**."
                    },
                    {
                        "type": "text",
                        "value": "## O problema N+1, explicado\n\nImagine que você quer listar usuários junto com a quantidade de tarefas de cada um. Uma forma comum, e ruim, de escrever isso é buscar todos os usuários primeiro e, dentro de um loop, buscar as tarefas de cada usuário, um de cada vez, como no bloco de código a seguir.\n\nIsso é o **problema N+1**: uma query inicial que traz N registros (os usuários), seguida de mais uma query para cada um desses N registros (as tarefas de cada usuário), totalizando N+1 idas ao banco em vez de uma consulta só. Com 50 usuários, são 51 queries; com 5 mil usuários, são 5.001. O código funciona e passa despercebido em ambiente de teste com poucos dados, e só vira um problema visível quando a tabela cresce em produção."
                    },
                    {
                        "type": "code",
                        "value": "// 1 query para buscar os usuarios\nconst usuarios = await prisma.usuario.findMany();\n\n// + 1 query PARA CADA usuario dentro do loop\nfor (const usuario of usuarios) {\n  const tarefas = await prisma.tarefa.findMany({\n    where: { usuarioId: usuario.id },\n  });\n  console.log(usuario.nome, tarefas.length);\n}\n\n// se existem 50 usuarios, isso dispara 1 + 50 = 51 queries contra o banco"
                    },
                    {
                        "type": "code",
                        "value": "// a correcao: pedir o relacionamento junto, numa quantidade fixa de queries\nconst usuarios = await prisma.usuario.findMany({\n  include: { tarefas: true },\n});\n\nfor (const usuario of usuarios) {\n  console.log(usuario.nome, usuario.tarefas.length);\n}\n\n// por baixo, o Prisma busca os usuarios e busca TODAS as tarefas\n// relacionadas de uma vez (algo como WHERE usuario_id IN (1, 2, 3, ...)),\n// em vez de uma query de tarefas por usuario dentro do loop"
                    },
                    {
                        "type": "table",
                        "value": "[[\"cenário\",\"queries disparadas\"],[\"50 usuários, buscando as tarefas de cada um dentro de um loop, sem include\",\"1 + 50 = 51 queries\"],[\"Mesma busca, usando include: { tarefas: true }\",\"Uma quantidade fixa (tipicamente 1 ou 2 no total), independente do número de usuários\"],[\"5.000 usuários no mesmo loop, sem include\",\"1 + 5.000 = 5.001 queries\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como perceber (e evitar) na prática\n\nO sintoma mais comum é uma rota que fica mais lenta conforme a tabela cresce, sem nenhuma mudança de código. Duas formas de confirmar a suspeita:\n\n- Ligar o log de queries do Prisma (`new PrismaClient({ log: ['query'] })`) e observar os logs de uma requisição: se aparecem dezenas de SELECT quase idênticos em sequência, é N+1.\n- Medir o tempo de resposta da rota com bancos de tamanhos diferentes (10 registros x 10 mil registros); se o tempo cresce proporcionalmente ao número de registros, é sinal de uma query por item.\n\nA correção quase sempre passa por `include` (para relacionamentos) ou `select` (para escolher só as colunas necessárias, evitando trazer dados demais). E isso não é um problema exclusivo do Prisma: Sequelize, TypeORM, Django ORM e ActiveRecord (Rails) sofrem do mesmo jeito, porque a causa é sempre a mesma, uma query dentro de um loop, não uma falha específica de uma ferramenta. Nos casos em que nem include resolve bem, o próprio Prisma permite fugir para SQL puro com `prisma.$queryRaw`, sem trocar de ferramenta."
                    },
                    {
                        "type": "quote",
                        "value": "N+1 não é um bug do Prisma, é um padrão de uso perigoso que qualquer ORM permite. Quem entende o SQL por trás do include sabe reconhecer o problema no log e corrigir; quem trata o ORM como caixa-preta só descobre quando a rota trava em produção."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o \"problema N+1\" em ORMs?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um erro de sintaxe que acontece quando o schema.prisma tem mais de N tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um limite do PostgreSQL que impede mais de N+1 conexões simultâneas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando uma query inicial busca N registros e, em seguida, o código dispara uma query adicional para cada um desses registros dentro de um loop, resultando em N+1 queries no banco em vez de uma consulta só.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma falha de segurança que permite N+1 tentativas de login antes de bloquear o usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual recurso do Prisma Client ajuda a evitar o problema N+1 ao buscar usuários junto de suas tarefas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A opção skip, que pula registros indesejados da resposta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando prisma migrate dev, que reorganiza automaticamente as queries do código.",
                                "isCorrect": false
                            },
                            {
                                "text": "A troca do banco de dados de PostgreSQL para outro banco mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "A opção include, que carrega o relacionamento numa quantidade fixa de consultas, em vez de uma query separada por registro.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um código busca prisma.usuario.findMany() (retornando 50 usuários) e, dentro de um for, chama prisma.tarefa.findMany({ where: { usuarioId: usuario.id } }) para cada um. Quantas queries, no total, esse trecho dispara contra o banco?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "1, porque o Prisma agrupa automaticamente todas as chamadas do loop em uma única query.",
                                "isCorrect": false
                            },
                            {
                                "text": "51: uma para buscar os usuários, mais uma para cada um dos 50 usuários dentro do loop.",
                                "isCorrect": true
                            },
                            {
                                "text": "50, porque a busca inicial de usuários não conta como uma query separada.",
                                "isCorrect": false
                            },
                            {
                                "text": "2, uma para os usuários e outra compartilhada entre todos os usuários do loop.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota da API está lenta e, ao ativar o log de queries do Prisma, o time percebe dezenas de SELECT quase idênticos disparados em sequência para a mesma tabela, um logo após o outro, a cada requisição. O que esse padrão nos logs geralmente indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que o banco de dados está corrompido e precisa ser recriado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a aplicação está sofrendo um ataque de SQL injection.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o Prisma Client não foi gerado corretamente com npx prisma generate.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um provável problema N+1: uma query dentro de um loop, disparada uma vez para cada item de uma lista, em vez de uma única consulta com include equivalente a um JOIN.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time comenta que \"esse tipo de problema de N+1 é uma falha específica do Prisma; se a gente usasse outro ORM, o problema não existiria\". Essa afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Correta: o N+1 é um bug exclusivo do Prisma, já documentado como falha crítica da ferramenta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Correta: apenas bancos NoSQL sofrem com N+1, então trocar de ORM relacional para outro ORM relacional não resolveria, mas trocar para um banco NoSQL sim.",
                                "isCorrect": false
                            },
                            {
                                "text": "Incorreta, porque N+1 só acontece quando o banco de dados não tem nenhum índice configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Incorreta: N+1 é um risco inerente a como ORMs facilitam disparar queries relacionadas dentro de loops; aparece em praticamente qualquer ORM (Sequelize, TypeORM, ActiveRecord, Django ORM etc.), e a mitigação em todos passa pela mesma ideia, carregar relacionamentos numa única leva de consultas em vez de um loop de queries.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Recapitulando e o próximo passo: autenticação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Recapitulando e o próximo passo: autenticação\n\nChegamos à última aula da trilha de Banco de Dados. Ao longo de sete módulos você saiu de \"por que guardar dados em tabelas\" até escrever uma migration e reconhecer um problema de performance escondido dentro de um ORM. Vale parar um instante e olhar o caminho inteiro antes de seguir para o próximo estágio do roadmap de back-end."
                    },
                    {
                        "type": "table",
                        "value": "[[\"módulo\",\"o que você aprendeu\"],[\"1. Por que bancos de dados e o modelo relacional\",\"Tabelas, linhas, colunas, tipos de dado, chave primária, e quando um banco relacional faz mais sentido que um NoSQL\"],[\"2. SQL: consultando dados\",\"SELECT, WHERE, ORDER BY, LIMIT, funções de agregação e GROUP BY\"],[\"3. SQL: inserindo, atualizando e removendo\",\"INSERT, UPDATE e DELETE com WHERE, e a noção de transação\"],[\"4. Modelagem e relacionamentos\",\"Normalização básica, chave estrangeira, relacionamentos 1:1, 1:N e N:N, JOINs\"],[\"5. PostgreSQL na prática\",\"CREATE TABLE com tipos e constraints, e o que um índice muda na performance\"],[\"6. Conectando o back-end ao banco\",\"Driver pg, queries parametrizadas contra SQL injection, connection pool\"],[\"7. ORMs: produtividade com cuidado\",\"Prisma, migrations, e o problema N+1\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## SQL puro ainda importa (e vai continuar importando)\n\nDepois de conhecer o Prisma, é tentador achar que o SQL puro ficou para trás. Não ficou. Há situações em que ele continua sendo a escolha certa:\n\n- **Relatórios complexos**, com múltiplas agregações, subqueries e regras que não se encaixam bem na API de um ORM.\n- **Performance crítica**, quando cada milissegundo importa e você precisa controlar exatamente o plano de execução da query, incluindo os índices usados.\n- **Consultas muito dinâmicas**, montadas a partir de várias combinações de filtro, mais fáceis de expressar em SQL do que empilhando opções de um Client.\n\nO próprio Prisma reconhece esses limites: `prisma.$queryRaw` permite rodar SQL puro dentro do mesmo projeto, quando a API do Client não é a ferramenta certa para aquela consulta específica. O ORM não é um substituto do SQL, é uma camada por cima dele, e você só sabe quando pular essa camada se souber o que tem embaixo."
                    },
                    {
                        "type": "text",
                        "value": "## O próximo estágio: autenticação\n\nO roadmap de back-end segue agora para **Autenticação**: como uma aplicação identifica quem está fazendo cada requisição, com login, senha e um token (como JWT) ou sessão para manter esse usuário \"logado\" nas próximas chamadas.\n\nEssa próxima trilha não começa do zero. Ela usa exatamente a tabela `usuarios` que você aprendeu a modelar e consultar aqui: um `email` único para localizar o usuário, um campo para a senha guardada como hash (nunca em texto puro, isso vem na própria trilha de autenticação) e uma chave primária `id` para identificar esse usuário em todas as outras tabelas relacionadas, como a `tarefas` que você já usou nos exemplos. O login, no fim, é mais uma consulta numa tabela que você já sabe modelar, indexar e consultar com segurança."
                    },
                    {
                        "type": "code",
                        "value": "// pista do que vem na trilha de Autenticacao:\n// localizar o usuario pelo email e comparar a senha com o hash guardado\n// (a senha em texto puro NUNCA e comparada nem guardada diretamente)\n\nconst usuario = await prisma.usuario.findUnique({\n  where: { email: emailDigitado },\n});\n\nconst senhaValida = usuario\n  ? await bcrypt.compare(senhaDigitada, usuario.senhaHash)\n  : false;"
                    },
                    {
                        "type": "quote",
                        "value": "Você chegou ao fim da trilha de Banco de Dados sabendo modelar dados em tabelas, consultá-los e modificá-los com SQL, criar relacionamentos e índices num PostgreSQL de verdade, conectar tudo isso a uma API com segurança, e usar um ORM sem perder de vista o que ele faz por baixo. Essa é a base que sustenta qualquer coisa que você construir daqui para frente no back-end, a começar pela próxima trilha, autenticação, aplicada exatamente sobre a tabela de usuários que agora é sua."
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao longo da trilha, qual foi a ordem lógica de aprendizado, do início ao fim?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "ORMs primeiro, para só depois entender o que eles fazem por baixo com SQL puro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação e login, seguidos de modelagem de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelo relacional e SQL para consultar dados, depois para modificar dados, modelagem e relacionamentos, PostgreSQL na prática, conectar isso a uma API em Node, e por fim ORMs como camada de produtividade sobre o SQL.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas Prisma, sem nenhum SQL puro em nenhum momento da trilha.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo o fechamento da trilha, qual é o próximo estágio do roadmap de back-end depois de \"Banco de Dados\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Deploy em nuvem, sem relação direta com o que foi estudado nesta trilha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma segunda linguagem de back-end, para substituir o Node.js.",
                                "isCorrect": false
                            },
                            {
                                "text": "Design de interface (UI/UX) para as telas do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação, que vai usar a própria tabela de usuários modelada e consultada ao longo desta trilha para lidar com login e identificação de quem faz cada requisição.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa gerar um relatório complexo, com múltiplas agregações e ajuste fino de performance sobre milhões de linhas. Depender só da API do Prisma Client para montar essa consulta tende a ser a melhor escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, o Prisma sempre gera a consulta mais eficiente possível, superando qualquer SQL escrito manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não necessariamente: para relatórios complexos e performance crítica, SQL puro, inclusive via $queryRaw do próprio Prisma quando for o caso, costuma dar mais controle e melhor desempenho do que tentar expressar tudo pela API do ORM.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque ORMs não permitem nenhum tipo de consulta com agregações.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há diferença de desempenho entre usar o Prisma Client ou escrever o SQL manualmente, em nenhum cenário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um recém-contratado, que só usou Prisma e nunca escreveu um JOIN manualmente, está debugando uma rota lenta causada por um N+1. Por que o fato de nunca ter estudado SQL puro dificulta a resolução desse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não dificulta em nada, o Prisma resolve automaticamente qualquer problema de performance sem intervenção humana.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dificulta porque o Prisma exige certificação oficial em SQL antes de instalar o pacote.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não dificulta, já que N+1 é um problema exclusivo de bancos NoSQL, não de bancos SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem entender como JOIN, índices e o custo de uma query funcionam, fica difícil reconhecer que o problema é N+1 e avaliar se um include realmente resolve, em vez de só confiar cegamente na abstração do ORM.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "A trilha de Autenticação, próximo estágio do roadmap, vai construir login sobre a tabela usuarios que você aprendeu a modelar e consultar. Qual conhecimento desta trilha de Banco de Dados é diretamente reaproveitado nesse próximo estágio?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Modelar uma tabela com colunas como email único e uma coluna para a senha em formato de hash, além de saber consultar essa tabela, por exemplo localizar um usuário pelo email, com SQL puro ou por um ORM como o Prisma.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: autenticação é um assunto totalmente isolado, sem relação com banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o conhecimento de CSS e estilização de telas de login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente a sintaxe do comando npx prisma migrate dev, sem nenhuma relação com modelagem de dados.",
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
