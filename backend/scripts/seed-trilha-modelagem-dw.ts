// Seed da trilha Modelagem de Dados e Data Warehousing (roadmap de Engenharia de Dados).
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-modelagem-dw.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Modelagem de Dados e Data Warehousing";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Trilha de modelagem de dados para analytics, do roadmap de Engenharia de Dados: do modelo relacional e da normalizacao (OLTP) ao data warehouse e a modelagem dimensional de Kimball (esquema estrela, fatos e dimensoes, slowly changing dimensions), ate os warehouses colunares na nuvem. Foco em decisoes de modelagem e cenarios, assumindo base de SQL.";

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
        "titulo": "Módulo 1 - Fundamentos de modelagem de dados",
        "aulas": [
            {
                "titulo": "Por que modelar dados e os três níveis",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que modelar dados e os três níveis\n\nModelar dados é decidir, antes de escrever a primeira linha de DDL, quais entidades existem, como elas se relacionam e quais regras o banco vai garantir. É um trabalho de design, não um detalhe técnico: toda decisão tomada aqui se propaga para anos de consultas, relatórios e manutenção.\n\nQuando a modelagem é feita às pressas (ou simplesmente pulada), o sistema ainda funciona no primeiro mês. O problema aparece depois, quando o volume cresce e as inconsistências viram bug de dado, não só de código."
                    },
                    {
                        "type": "text",
                        "value": "## O custo de não modelar\n\nSem um modelo claro, times tendem a repetir os mesmos erros:\n\n- **Dados duplicados**: o mesmo endereço de cliente gravado em três tabelas diferentes, cada uma podendo ficar desatualizada de um jeito diferente.\n- **Anomalias de atualização**: mudar o nome de um produto exige lembrar de todos os lugares onde ele foi copiado.\n- **Ambiguidade de regras**: sem chaves e relacionamentos explícitos, cada desenvolvedor aplica uma regra de negócio diferente na aplicação.\n- **Retrabalho caro**: corrigir a estrutura de uma tabela em produção, já com dado real e aplicações dependendo dela, custa muito mais do que corrigir um modelo no papel."
                    },
                    {
                        "type": "quote",
                        "value": "Modelagem de dados é o contrato entre como o negócio enxerga a informação e como ela vai ser armazenada, consultada e mantida consistente."
                    },
                    {
                        "type": "text",
                        "value": "## Os três níveis de abstração\n\nPara ir da conversa com o negócio até o banco rodando em produção, o trabalho passa por três níveis de modelo, cada um com um propósito e uma audiência diferente:\n\n- **Conceitual**: as entidades do negócio e como se relacionam, sem se preocupar com tipos de dado, chaves ou tecnologia. É a visão que um analista de negócio ou um product manager consegue validar.\n- **Lógico**: entidades viram tabelas, ganham atributos, chaves primárias e estrangeiras e tipos de dado abstratos (texto, número, data). Ainda é independente do SGBD que vai rodar por baixo.\n- **Físico**: o lógico traduzido para a sintaxe e os tipos de um banco específico (PostgreSQL, MySQL, Redshift), com índices, particionamento e constraints de implementação."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Nível\", \"O que captura\", \"Público principal\"], [\"Conceitual\", \"Entidades e relacionamentos do negócio\", \"Analistas de negócio, stakeholders\"], [\"Lógico\", \"Atributos, chaves e tipos abstratos\", \"Arquitetos e modeladores de dados\"], [\"Físico\", \"DDL, tipos do SGBD, índices e partições\", \"DBAs e engenheiros de dados\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- Nível conceitual (descrição, sem sintaxe formal)\n[Cliente] 1 ---coloca--- N [Pedido]\n\n-- Nível lógico (tabelas, atributos, chaves, tipos abstratos)\nCLIENTE (id_cliente PK, nome texto, email texto)\nPEDIDO (id_pedido PK, data_pedido data, id_cliente FK -> CLIENTE)\n\n-- Nível físico (DDL real, tipos do SGBD)\nCREATE TABLE cliente (\n    id_cliente  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    nome        VARCHAR(120) NOT NULL,\n    email       VARCHAR(160) NOT NULL UNIQUE\n);\n\nCREATE TABLE pedido (\n    id_pedido    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    data_pedido  DATE NOT NULL,\n    id_cliente   BIGINT NOT NULL REFERENCES cliente(id_cliente)\n);"
                    },
                    {
                        "type": "text",
                        "value": "## Como os níveis se conectam na prática\n\nOs três níveis não são etapas burocráticas: são filtros que evitam que uma decisão de negócio mal entendida vire uma coluna errada em produção. Um erro no nível conceitual (por exemplo, tratar 'um cliente pode ter vários endereços' como se fosse 'um cliente tem um endereço') se propaga para o lógico e para o físico, e só vai custar caro para corrigir quando já tiver dado real gravado.\n\nNa prática, projetos pequenos costumam fundir conceitual e lógico numa conversa curta com o time; projetos grandes, com vários sistemas integrados, se beneficiam de manter os três registrados e atualizados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções descreve o foco do modelo conceitual de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "As entidades do negócio e como se relacionam, sem tipos nem tecnologia.",
                                "isCorrect": true
                            },
                            {
                                "text": "As tabelas físicas do banco, já com índices e partições do SGBD escolhido.",
                                "isCorrect": false
                            },
                            {
                                "text": "As consultas SQL mais frequentes que a aplicação vai executar no banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dicionário de dados com os tipos exatos de cada coluna física criada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time sobe direto para produção uma tabela única 'pedidos' guardando nome do cliente, endereço e itens repetidos em colunas (item1, item2, item3). Três meses depois, precisam listar todos os endereços já usados por um cliente. Qual é o problema estrutural que essa modelagem malfeita causou?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dados de cliente e endereço ficaram duplicados e presos ao formato da tabela, o que dificulta consultas novas.",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco ficou lento porque colunas repetidas como item1 e item2 sempre exigem mais espaço em disco que uma tabela separada.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela única impede o uso de índices, então toda consulta precisa varrer a tabela inteira independente da estrutura.",
                                "isCorrect": false
                            },
                            {
                                "text": "O SGBD rejeita nomes de coluna repetidos como item1 e item2, então a tabela nem chega a ser criada com sucesso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquiteto de dados recebe de um analista de negócio a frase 'todo pedido pertence a um único cliente, e um cliente pode ter vários pedidos' e precisa transformar isso em tabelas com colunas, chaves primárias e estrangeiras, mas ainda sem decidir o SGBD que vai rodar em produção. Em qual nível de modelagem esse arquiteto está trabalhando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nível lógico, porque já existem atributos e chaves definidos, mas sem amarrar a um banco específico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nível conceitual, porque relacionamentos como 'um cliente para vários pedidos' só aparecem nessa etapa inicial.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nível físico, porque toda chave primária e estrangeira só faz sentido depois de escolhido o SGBD.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nível dimensional, porque a relação entre cliente e pedido só existe em modelos de data warehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Índices, particionamento e os tipos de dado exatos de uma coluna (como VARCHAR(120) ou NUMERIC(10,2)) são decisões tomadas em qual nível de modelagem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Conceitual",
                                "isCorrect": false
                            },
                            {
                                "text": "Lógico",
                                "isCorrect": false
                            },
                            {
                                "text": "Físico",
                                "isCorrect": true
                            },
                            {
                                "text": "Dimensional",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pulou o modelo conceitual e o lógico e foi direto para o DDL em produção. Seis meses depois, descobrem que a regra 'um produto pertence a exatamente uma categoria' estava errada: no negócio real, um produto pode pertencer a várias categorias ao mesmo tempo. Qual é a implicação mais provável dessa descoberta tardia?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nenhuma mudança será necessária, porque o SGBD ajusta automaticamente a cardinalidade do relacionamento conforme os dados inseridos ao longo do tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Será preciso alterar o esquema físico em produção com uma nova tabela associativa e migrar os dados, retrabalho que o conceitual evitaria.",
                                "isCorrect": true
                            },
                            {
                                "text": "Bastará adicionar um índice na coluna de categoria para que consultas com várias categorias por produto passem a funcionar corretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema se resolve sozinho na próxima normalização, sem exigir mudança de tabelas nem migração dos dados já armazenados em produção.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Entidades, atributos e relacionamentos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Entidades, atributos e relacionamentos\n\nO modelo entidade-relacionamento (ER) é a linguagem visual mais usada para registrar o nível conceitual e lógico de um modelo de dados. Com poucos símbolos (entidade, atributo, relacionamento e cardinalidade) ele descreve como o negócio funciona antes de qualquer tabela existir."
                    },
                    {
                        "type": "text",
                        "value": "## Entidades e atributos\n\n- **Entidade**: um objeto ou conceito do negócio sobre o qual se guarda informação (Cliente, Pedido, Produto, Funcionário). Vira uma tabela no nível físico.\n- **Atributo**: uma característica da entidade (nome do cliente, data do pedido, preço do produto). Vira uma coluna.\n- **Instância**: uma ocorrência concreta da entidade (o cliente 'Maria Silva' é uma instância da entidade Cliente). Vira uma linha.\n\nNem todo atributo é simples: um atributo pode ser multivalorado (um cliente com vários telefones) ou composto (um endereço com rua, número e cidade). Esses casos costumam virar entidades próprias no modelo lógico."
                    },
                    {
                        "type": "text",
                        "value": "## Relacionamentos\n\nUm relacionamento conecta duas (ou mais) entidades e descreve como elas se associam no mundo real: um Cliente **faz** Pedidos, um Pedido **contém** Produtos, um Funcionário **supervisiona** outro Funcionário. O verbo do relacionamento importa: é ele que revela a regra de negócio que o modelo precisa preservar."
                    },
                    {
                        "type": "quote",
                        "value": "Um diagrama ER bem feito conta a história do negócio antes de qualquer linha de SQL existir: quem faz o quê, para quem e quantas vezes."
                    },
                    {
                        "type": "text",
                        "value": "## Notação pé de galinha (crow's foot)\n\nA notação mais usada na indústria para desenhar cardinalidade é a 'pé de galinha': um símbolo em forma de garfo na ponta da linha que indica 'muitos'. Combinada com traços e círculos, ela mostra de uma vez cardinalidade e opcionalidade:\n\n- Traço duplo: exatamente um (obrigatório)\n- Círculo: zero (opcional)\n- Pé de galinha: muitos"
                    },
                    {
                        "type": "code",
                        "value": "[CLIENTE] --||-----------------o<-- [PEDIDO]\n      1 cliente faz zero ou muitos pedidos\n\nLegenda da notação pé de galinha:\n  ||   exatamente um (obrigatório)\n  o|   zero ou um (opcional)\n  o<   zero ou muitos (opcional, muitos)\n  |<   um ou muitos (obrigatório, muitos)"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo um diagrama ER\n\nPara ler um diagrama ER, comece pelas entidades (os retângulos) e depois percorra cada linha de relacionamento nos dois sentidos. A pergunta é sempre a mesma, de cada lado: 'para uma instância desta entidade, quantas instâncias da outra entidade se associam, e isso é obrigatório ou opcional?'. Fazer essa leitura nos dois sentidos evita o erro mais comum: interpretar um relacionamento como um-para-muitos quando na verdade é muitos-para-muitos."
                    }
                ],
                "questions": [
                    {
                        "statement": "No modelo entidade-relacionamento, o que um atributo como 'data_nascimento' representa dentro da entidade Funcionário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma entidade separada, porque toda data no modelo ER precisa da sua própria tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um relacionamento entre Funcionário e a entidade Data, com cardinalidade um-para-um.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma característica da entidade Funcionário, que vira uma coluna no nível físico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma chave estrangeira, já que datas sempre referenciam uma tabela de calendário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista desenha um relacionamento entre as entidades Médico e Paciente com o verbo 'atende'. Percorrendo a linha nos dois sentidos, ele percebe que um paciente pode ser atendido por vários médicos ao longo do tempo, e um médico atende vários pacientes. Que tipo de relacionamento é esse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um-para-muitos, porque um médico sempre atende mais pacientes do que um paciente tem médicos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um-para-um, porque cada consulta liga exatamente um médico a exatamente um paciente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Muitos-para-muitos, porque em ambos os sentidos existe mais de uma instância associada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Zero-para-muitos, porque um paciente pode não ter nenhum médico associado no cadastro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa notação pé de galinha, o símbolo |< aparece do lado de ITEM_PEDIDO na linha que sai de PEDIDO, e a legenda define |< como 'um ou muitos, obrigatório'. O que essa combinação indica sobre a relação entre um pedido e seus itens?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cada pedido pode ter zero ou vários itens de pedido, nunca sendo obrigatório.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada pedido tem obrigatoriamente um ou mais itens de pedido associados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada pedido tem exatamente um item de pedido, nunca mais do que isso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada item de pedido pertence a zero ou um pedido, de forma sempre opcional.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante o levantamento de requisitos, o time descobre que a entidade Cliente pode ter mais de um telefone de contato, sem limite fixo de quantidade. Ao transformar o modelo conceitual em modelo lógico, qual é a forma correta de tratar esse atributo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar uma entidade Telefone separada, relacionada a Cliente por um relacionamento um-para-muitos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter um único atributo 'telefone' na entidade Cliente, guardando todos os números separados por vírgula.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar vários atributos fixos na entidade Cliente, como telefone1, telefone2 e telefone3, para cobrir os casos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar o telefone principal na entidade Cliente e os demais números num campo de texto livre.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa escola, o modelo ER liga Turma a Aluno pelo relacionamento 'matrícula'. As regras de negócio são: uma turma pode ser criada antes de ter qualquer aluno matriculado, e todo aluno, para existir no sistema, precisa estar matriculado em pelo menos uma turma. Como fica a opcionalidade nos dois lados desse relacionamento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Dos dois lados a associação é obrigatória: nem turma nem aluno podem existir no sistema sem o outro estar associado a eles.",
                                "isCorrect": false
                            },
                            {
                                "text": "Do lado de Turma, a associação é opcional (pode não ter nenhum aluno); do lado de Aluno, é obrigatória (precisa de ao menos uma turma).",
                                "isCorrect": true
                            },
                            {
                                "text": "Do lado de Turma, a associação é obrigatória (toda turma precisa ter ao menos um aluno matriculado); do lado de Aluno, é opcional (pode não ter turma).",
                                "isCorrect": false
                            },
                            {
                                "text": "Dos dois lados a associação é opcional: tanto turma quanto aluno podem existir no sistema sem nenhuma associação entre eles.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Chaves: primária, estrangeira, natural x substituta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Chaves: primária, estrangeira, natural x substituta\n\nChaves são o mecanismo que garante que cada linha de uma tabela seja identificável de forma única e que os relacionamentos entre tabelas sejam confiáveis. Entender os tipos de chave, e quando usar cada um, é uma das decisões de modelagem com maior impacto de longo prazo."
                    },
                    {
                        "type": "text",
                        "value": "## Chave primária (PK) e chave estrangeira (FK)\n\n- **Chave primária**: coluna (ou conjunto de colunas) que identifica cada linha de forma única dentro da tabela. Não pode se repetir nem ser nula.\n- **Chave estrangeira**: coluna que referencia a chave primária de outra tabela (ou da mesma tabela, num relacionamento reflexivo), implementando o relacionamento e garantindo integridade referencial.\n\nUma FK não precisa ser única na sua própria tabela: vários pedidos podem ter o mesmo id_cliente."
                    },
                    {
                        "type": "text",
                        "value": "## Chave natural x chave substituta (surrogate)\n\n- **Chave natural**: um atributo que já existe no negócio e identifica a entidade (CPF, e-mail, código ISBN, placa de veículo).\n- **Chave substituta (surrogate)**: um identificador criado só para o banco, sem nenhum significado de negócio, normalmente um número sequencial ou um UUID.\n\nA escolha entre as duas não é só estética: afeta a estabilidade do relacionamento, o desempenho de join e até a capacidade de guardar histórico."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Chave natural\", \"Chave substituta\"], [\"Significado\", \"Tem significado de negócio\", \"Nenhum significado, só identifica\"], [\"Estabilidade\", \"Pode mudar (CPF corrigido, e-mail trocado)\", \"Nunca muda depois de criada\"], [\"Tamanho para join\", \"Pode ser grande (texto)\", \"Geralmente pequena (inteiro)\"], [\"Exposição\", \"Pode vazar dado sensível em URL ou log\", \"Não carrega informação do negócio\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma chave substituta não substitui a necessidade de uma constraint UNIQUE na chave natural: ela resolve estabilidade e desempenho, não integridade de negócio."
                    },
                    {
                        "type": "text",
                        "value": "## Chave composta\n\nUma chave composta usa duas ou mais colunas juntas para formar a identidade única de uma linha. É comum em tabelas associativas de relacionamentos muitos-para-muitos, onde a combinação das duas chaves estrangeiras (por exemplo, id_aluno e id_turma) é o que garante que a mesma matrícula não se repita."
                    },
                    {
                        "type": "code",
                        "value": "-- Chave substituta como PK, chave natural preservada com UNIQUE\nCREATE TABLE cliente (\n    id_cliente  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    cpf         CHAR(11) NOT NULL UNIQUE,\n    nome        VARCHAR(120) NOT NULL\n);\n\n-- Chave estrangeira simples\nCREATE TABLE pedido (\n    id_pedido    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    id_cliente   BIGINT NOT NULL REFERENCES cliente(id_cliente),\n    data_pedido  DATE NOT NULL\n);\n\n-- Chave composta numa tabela associativa\nCREATE TABLE matricula (\n    id_aluno        BIGINT NOT NULL REFERENCES aluno(id_aluno),\n    id_turma        BIGINT NOT NULL REFERENCES turma(id_turma),\n    data_matricula  DATE NOT NULL,\n    PRIMARY KEY (id_aluno, id_turma)\n);"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função de uma chave estrangeira (FK) numa tabela relacional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Identificar de forma única cada linha da própria tabela, nunca podendo se repetir na coluna.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerar automaticamente um valor sequencial toda vez que uma nova linha é inserida na tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Impedir que a tabela tenha mais de um relacionamento com outras tabelas do modelo inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Referenciar a chave primária de outra tabela, implementando um relacionamento entre as duas.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema usa o CPF como chave primária da tabela cliente, referenciada por chave estrangeira em pedido, fatura e endereço_entrega. Um cliente corrige o CPF cadastrado por erro de digitação. Qual é a consequência direta dessa escolha de chave?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhuma consequência, porque o SGBD atualiza automaticamente todas as chaves estrangeiras relacionadas ao valor antigo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cliente antigo é apagado e um novo registro é criado automaticamente com o CPF corrigido pelo sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela cliente passa a aceitar dois CPFs para a mesma pessoa, um antigo e um novo, sem gerar conflito.",
                                "isCorrect": false
                            },
                            {
                                "text": "A correção precisa se propagar para todas as tabelas que referenciam o CPF antigo, ou os relacionamentos quebram.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Numa tabela associativa chamada inscrição, que liga aluno a curso, o modelo usa id_aluno e id_curso juntos como chave primária composta. Que regra de negócio essa escolha garante automaticamente, só pela definição da chave?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um mesmo aluno pode se inscrever várias vezes no mesmo curso, desde que em datas diferentes de inscrição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um curso só pode ter um aluno inscrito por vez, porque a chave composta limita a cardinalidade a um.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um mesmo aluno não pode se inscrever duas vezes no mesmo curso, porque o par se repetiria na chave.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um aluno só pode se inscrever em um curso por vez, porque a chave composta impede múltiplas linhas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe modela a tabela produto usando código_barras (EAN) como chave primária. Meses depois, compras informa que produtos artesanais não têm código de barras, e que no futuro um mesmo produto poderá ter mais de um código (embalagens promocionais). Qual é a melhor decisão de modelagem diante desse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Manter código_barras como chave primária e permitir que fique nulo para os produtos artesanais sem código definido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Concatenar todos os códigos de barras de um produto numa única coluna de texto, mantendo-a como chave primária.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma chave primária composta por código_barras e nome_produto, garantindo unicidade mesmo sem código de barras.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adotar uma chave substituta como PK e tratar código_barras como atributo, podendo ser nulo ou repetido por produto.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um banco transacional de alto volume de escrita usa UUID aleatório (v4) como chave substituta primária numa tabela que recebe milhões de inserts por dia, com índice B-tree padrão. Qual é a implicação mais conhecida dessa escolha, comparada a um inteiro sequencial?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Os inserts ficam mais rápidos, porque valores aleatórios se distribuem naturalmente em ordem crescente no índice B-tree.",
                                "isCorrect": false
                            },
                            {
                                "text": "O espaço em disco usado pelo índice diminui, porque UUIDs ocupam menos bytes do que um inteiro sequencial.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os inserts tendem a fragmentar mais o índice, porque os valores aleatórios não seguem uma ordem crescente previsível.",
                                "isCorrect": true
                            },
                            {
                                "text": "A integridade referencial deixa de funcionar, porque chaves estrangeiras não aceitam colunas do tipo UUID como referência.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cardinalidade, opcionalidade e integridade referencial",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Cardinalidade, opcionalidade e integridade referencial\n\nCardinalidade descreve QUANTAS instâncias de uma entidade se associam a instâncias de outra. Opcionalidade descreve SE essa associação é obrigatória. Juntas, essas duas informações bastam para traduzir qualquer relacionamento de negócio em tabelas, chaves e constraints."
                    },
                    {
                        "type": "text",
                        "value": "## Os três tipos de cardinalidade\n\n- **Um-para-um (1:1)**: uma instância de A se associa a no máximo uma instância de B, e vice-versa. Exemplo: Funcionário e CrachaAcesso. Frequentemente as duas entidades poderiam virar uma única tabela; são separadas por motivo de segurança, tamanho ou dado opcional.\n- **Um-para-muitos (1:N)**: uma instância de A se associa a várias instâncias de B, mas cada instância de B se associa a apenas uma de A. Exemplo: Cliente e Pedido. É o tipo mais comum, implementado com uma FK do lado 'muitos'.\n- **Muitos-para-muitos (N:N)**: instâncias de A se associam a várias de B, e instâncias de B se associam a várias de A. Exemplo: Aluno e Curso. Não dá para implementar com uma única FK; exige uma tabela associativa."
                    },
                    {
                        "type": "code",
                        "value": "1:1   FUNCIONARIO (1) -------- (1) CRACHA_ACESSO\n\n1:N   CLIENTE (1) -------------< (N) PEDIDO\n\nN:N   ALUNO (N) >------------< (N) CURSO\n      resolvido com tabela associativa:\n\n      ALUNO (1) ------< (N) INSCRICAO (N) >------ (1) CURSO\n\nCREATE TABLE inscricao (\n    id_aluno        BIGINT NOT NULL REFERENCES aluno(id_aluno),\n    id_curso        BIGINT NOT NULL REFERENCES curso(id_curso),\n    data_inscricao  DATE NOT NULL,\n    PRIMARY KEY (id_aluno, id_curso)\n);"
                    },
                    {
                        "type": "text",
                        "value": "## Opcionalidade\n\nOpcionalidade responde 'essa associação é obrigatória ou pode não existir?', independente da quantidade. Um Pedido sempre precisa de um Cliente (obrigatório); um Cliente pode ainda não ter nenhum Pedido (opcional). No nível físico, opcionalidade obrigatória geralmente vira `NOT NULL` na coluna de chave estrangeira; opcional vira uma FK que aceita `NULL`."
                    },
                    {
                        "type": "quote",
                        "value": "Cardinalidade diz quantos; opcionalidade diz se é obrigatório. Confundir as duas é o erro mais comum na leitura de um diagrama ER."
                    },
                    {
                        "type": "text",
                        "value": "## Integridade referencial\n\nIntegridade referencial garante que toda chave estrangeira aponte para uma linha que realmente existe (ou seja nula, se a FK for opcional). O SGBD aplica essa garantia automaticamente quando a FK está declarada com uma constraint `REFERENCES`.\n\nAo tentar violar essa regra, duas situações são rejeitadas por padrão:\n\n- **Inserir** um pedido com id_cliente que não existe em cliente: o INSERT falha.\n- **Apagar** um cliente que ainda tem pedidos associados: o DELETE falha, a menos que exista uma ação em cascata definida (`ON DELETE CASCADE`, `ON DELETE SET NULL`)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ação\", \"O que faz ao apagar o pai\"], [\"RESTRICT (padrão)\", \"Bloqueia o DELETE se existir filho referenciando\"], [\"CASCADE\", \"Apaga também todas as linhas filhas relacionadas\"], [\"SET NULL\", \"Mantém os filhos, zera a coluna de chave estrangeira\"], [\"SET DEFAULT\", \"Mantém os filhos, volta a FK para um valor padrão\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a diferença entre cardinalidade e opcionalidade num relacionamento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cardinalidade indica quantas instâncias se associam; opcionalidade indica se essa associação é obrigatória.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cardinalidade indica se a associação é obrigatória; opcionalidade indica quantas instâncias se associam.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cardinalidade e opcionalidade são dois nomes diferentes para o mesmo conceito de quantidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cardinalidade se aplica a tabelas físicas; opcionalidade se aplica apenas ao modelo conceitual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa rede de clínicas, cada Paciente tem exatamente um Prontuário, e cada Prontuário pertence a exatamente um Paciente; nenhum dos dois pode existir sem o outro. Que tipo de relacionamento é esse, e onde normalmente se coloca a chave estrangeira?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um-para-um; a FK pode ficar em qualquer uma das duas tabelas, geralmente na que depende mais da outra.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um-para-muitos; a FK fica obrigatoriamente na tabela Prontuário, apontando para vários pacientes diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Muitos-para-muitos; é necessária uma tabela associativa entre Paciente e Prontuário para resolver a relação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um-para-um; a FK precisa ficar duplicada nas duas tabelas para garantir a integridade dos dois lados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela pedido tem uma chave estrangeira id_cliente que referencia cliente(id_cliente), declarada sem nenhuma cláusula ON DELETE. Uma aplicação tenta apagar um cliente que ainda tem pedidos registrados. O que acontece, assumindo o comportamento padrão do SGBD?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O DELETE funciona, e todos os pedidos associados são apagados automaticamente junto com o cliente escolhido.",
                                "isCorrect": false
                            },
                            {
                                "text": "O DELETE funciona, e a coluna id_cliente dos pedidos associados fica automaticamente nula após a exclusão.",
                                "isCorrect": false
                            },
                            {
                                "text": "O DELETE falha, porque o padrão (RESTRICT) bloqueia a exclusão enquanto existir pedido referenciando o cliente.",
                                "isCorrect": true
                            },
                            {
                                "text": "O DELETE funciona, e os pedidos ficam com uma referência inválida apontando para um cliente inexistente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num sistema de e-commerce, todo Pedido precisa de um Cliente (nunca existe pedido sem cliente), mas o campo cupom_aplicado é opcional: nem todo pedido usa um cupom de desconto. Como modelar a chave estrangeira id_cupom na tabela pedido para refletir essa regra corretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Coluna id_cupom como NOT NULL, com um valor especial reservado tipo zero para pedidos sem cupom.",
                                "isCorrect": false
                            },
                            {
                                "text": "Duas tabelas de pedido separadas, uma para pedidos com cupom e outra para pedidos sem cupom.",
                                "isCorrect": false
                            },
                            {
                                "text": "Coluna id_cupom aceitando NULL, e a coluna id_cliente também aceitando NULL por consistência entre as duas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Coluna id_cupom aceitando NULL, com FK para cupom, enquanto id_cliente fica como NOT NULL.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Num sistema de cursos, além de saber quais alunos estão inscritos em quais cursos, o negócio precisa guardar a nota final e a data de conclusão de cada inscrição específica. Como isso afeta o desenho da tabela associativa entre Aluno e Curso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As colunas nota_final e data_conclusao devem ficar na tabela Aluno, já que a nota pertence ao aluno que a recebeu.",
                                "isCorrect": false
                            },
                            {
                                "text": "As colunas nota_final e data_conclusao devem ficar na tabela Curso, já que representam o resultado do curso oferecido.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela associativa recebe colunas próprias (nota_final, data_conclusao) além das duas chaves estrangeiras da relação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não é possível guardar nota_final e data_conclusao numa relação muitos-para-muitos sem duplicar as tabelas Aluno e Curso.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Do modelo ER ao esquema físico",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Do modelo ER ao esquema físico\n\nEsta aula fecha o ciclo do Módulo 1: pega um modelo ER já validado e aplica as regras de tradução que transformam entidades, atributos e relacionamentos em `CREATE TABLE` prontos para rodar. São regras mecânicas, mas cada uma delas carrega uma decisão de modelagem."
                    },
                    {
                        "type": "text",
                        "value": "## Regras de tradução\n\n- **Entidade forte** -> tabela, com uma chave primária própria.\n- **Atributo** -> coluna, com um tipo de dado escolhido no nível físico.\n- **Atributo multivalorado** -> tabela própria, relacionada por chave estrangeira (como visto na Aula 2).\n- **Relacionamento 1:N** -> chave estrangeira na tabela do lado 'muitos', apontando para a PK do lado '1'.\n- **Relacionamento 1:1** -> chave estrangeira em uma das duas tabelas (a que faz mais sentido depender da outra), com constraint UNIQUE.\n- **Relacionamento N:N** -> nova tabela associativa, com uma chave estrangeira para cada entidade original."
                    },
                    {
                        "type": "code",
                        "value": "Modelo ER (resumo):\n  ALUNO (N) ---inscricao--- (N) CURSO\n  CURSO (N) ---leciona----- (1) PROFESSOR\n\nEsquema físico resultante:\n\nCREATE TABLE professor (\n    id_professor  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    nome          VARCHAR(120) NOT NULL\n);\n\nCREATE TABLE curso (\n    id_curso      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    titulo        VARCHAR(160) NOT NULL,\n    id_professor  BIGINT NOT NULL REFERENCES professor(id_professor)\n);\n\nCREATE TABLE aluno (\n    id_aluno      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    nome          VARCHAR(120) NOT NULL\n);\n\nCREATE TABLE inscricao (\n    id_aluno        BIGINT NOT NULL REFERENCES aluno(id_aluno),\n    id_curso        BIGINT NOT NULL REFERENCES curso(id_curso),\n    data_inscricao  DATE NOT NULL,\n    PRIMARY KEY (id_aluno, id_curso)\n);"
                    },
                    {
                        "type": "text",
                        "value": "## Escolhendo tipos de dado\n\nO tipo de uma coluna não é só uma formalidade: ele documenta uma regra e evita dado inválido. Prefira o tipo mais restrito que ainda representa o dado corretamente: `DATE` para datas sem hora, `NUMERIC(p,s)` para valores monetários (nunca `FLOAT`, que perde precisão em cálculos financeiros), `VARCHAR(n)` com um limite pensado para o atributo, e `BOOLEAN` para flags binárias em vez de inteiros 0/1 ou textos 'S'/'N'."
                    },
                    {
                        "type": "quote",
                        "value": "Cada tipo de dado escolhido no físico é uma regra de negócio documentada em forma de constraint: errar o tipo abre espaço para dado inválido que nenhuma validação de aplicação vai pegar sempre."
                    },
                    {
                        "type": "text",
                        "value": "## Índices em resumo\n\nUm índice acelera a busca por um valor, ao custo de espaço em disco e de um pequeno overhead em cada escrita. Como regra prática no nível físico:\n\n- Chaves primárias já ganham índice automaticamente na maioria dos SGBDs.\n- Colunas de chave estrangeira costumam merecer índice, porque são usadas o tempo todo em JOIN.\n- Colunas muito consultadas em filtros (`WHERE`) ou ordenação (`ORDER BY`) são boas candidatas.\n- Índice em excesso também tem custo: cada `INSERT` ou `UPDATE` precisa atualizar todos os índices da tabela."
                    },
                    {
                        "type": "text",
                        "value": "## Do lógico ao físico: o que muda\n\nO modelo lógico já definia entidades, atributos e chaves; o que o nível físico acrescenta é a materialização real: tipos exatos do SGBD escolhido, nomes de constraint, índices, particionamento e, quando necessário, desnormalização deliberada por performance (assunto da Aula 5 do Módulo 2). Até ali, toda decisão deveria vir do modelo, não de um palpite na hora de escrever o DDL."
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao traduzir um modelo ER para o esquema físico, o que acontece com uma entidade forte que tem apenas atributos simples?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ela vira uma coluna dentro da tabela do relacionamento mais próximo, sem gerar uma tabela própria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela vira uma view, já que entidades sem atributo multivalorado não precisam de armazenamento físico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela vira um índice, porque entidades simples servem apenas para acelerar buscas em outras tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela vira uma tabela, com seus atributos virando colunas e um deles (ou um novo) virando chave primária.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O modelo conceitual tem um relacionamento muitos-para-muitos entre Produto e Fornecedor: um produto pode ter vários fornecedores, e um fornecedor pode fornecer vários produtos. Ao traduzir para o esquema físico, qual é a abordagem correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Adicionar uma coluna id_fornecedor na tabela Produto, aceitando uma lista de valores separados por vírgula.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar uma coluna id_produto na tabela Fornecedor, e outra id_fornecedor na tabela Produto, apontando uma para a outra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Duplicar a tabela Produto uma vez para cada fornecedor diferente que fornece aquele produto no cadastro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma tabela associativa com chave estrangeira para Produto e para Fornecedor, formando a chave primária composta.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela fatura vai guardar o campo valor_total, que representa dinheiro e entra em somas e cálculos de imposto. Qual tipo de dado é o mais adequado no esquema físico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "FLOAT, porque oferece a maior velocidade de cálculo para somas de valores monetários.",
                                "isCorrect": false
                            },
                            {
                                "text": "NUMERIC(p,s), porque preserva precisão exata em operações financeiras.",
                                "isCorrect": true
                            },
                            {
                                "text": "VARCHAR, porque permite formatar o valor com símbolo de moeda direto no banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "INTEGER, porque valores monetários não costumam ter casas decimais em nenhum caso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela pedido recebe 50 mil inserts por dia e tem oito colunas, cada uma com seu próprio índice criado 'para garantir performance', incluindo colunas raramente usadas em filtro. Depois de alguns meses, o time percebe que os INSERTs ficaram visivelmente mais lentos. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Índices não têm nenhum custo de escrita, então o problema deve estar em outra tabela não relacionada a pedido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada INSERT precisa atualizar todos os índices da tabela, então o excesso de índices pouco usados penaliza a escrita.",
                                "isCorrect": true
                            },
                            {
                                "text": "O excesso de índices acelera o INSERT, mas deixa o SELECT mais lento, um efeito colateral esperado nesse caso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Índices em colunas pouco usadas em filtro são automaticamente ignorados pelo SGBD, então não deveriam causar impacto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No modelo lógico existe um relacionamento um-para-um entre Funcionário e ContaBancaria, obrigatório dos dois lados. Ao decidir o esquema físico, o time tem dúvida sobre onde colocar a chave estrangeira. Qual é a orientação correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A FK precisa ficar nas duas tabelas ao mesmo tempo, cada uma apontando para a outra, para manter a obrigatoriedade.",
                                "isCorrect": false
                            },
                            {
                                "text": "A FK pode ficar em qualquer uma das duas tabelas com constraint UNIQUE, escolhendo pela que depende mais da outra.",
                                "isCorrect": true
                            },
                            {
                                "text": "A FK só pode ficar na tabela que foi criada primeiro no script de DDL, independente do sentido lógico da relação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um relacionamento um-para-um nunca deveria existir no físico; as duas entidades sempre devem virar uma tabela única.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Modelo relacional e normalização (OLTP)",
        "aulas": [
            {
                "titulo": "O modelo relacional e as anomalias de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O modelo relacional e as anomalias de dados\n\nVocê já usa tabelas, chaves e JOINs no dia a dia. Antes de avançar para modelagem dimensional, vale revisitar a base teórica do modelo relacional: por que ele existe, o que uma tabela mal desenhada custa e qual problema a normalização resolve."
                    },
                    {
                        "type": "text",
                        "value": "## Relações, tuplas e atributos\n\nNo modelo relacional, proposto por Edgar Codd em 1970, os termos formais têm equivalentes práticos que você já usa:\n\n- **Relação**: uma tabela\n- **Tupla**: uma linha (registro)\n- **Atributo**: uma coluna\n- **Domínio**: o conjunto de valores válidos para um atributo\n\nUma relação bem definida não permite linhas duplicadas, e cada atributo guarda um único valor por tupla. Essas duas exigências parecem óbvias, mas é comum violá-las na prática, e é aí que os problemas começam."
                    },
                    {
                        "type": "text",
                        "value": "## Redundância: a raiz do problema\n\nQuando um mesmo dado aparece repetido em várias linhas, qualquer alteração precisa ser replicada em todas as ocorrências. Veja uma tabela única que mistura pedidos e dados de cliente:"
                    },
                    {
                        "type": "code",
                        "value": "pedidos_desnormalizada\n\nid_pedido | cliente_nome | cliente_email   | cliente_cidade | produto | valor\n1         | Ana Ribeiro  | ana@email.com   | Recife         | Teclado | 150.00\n2         | Ana Ribeiro  | ana@email.com   | Recife         | Mouse   | 80.00\n3         | Bruno Silva  | bruno@email.com | Natal          | Monitor | 900.00\n4         | Ana Ribeiro  | ana.r@email.com | Recife         | Headset | 220.00\n\nRepare: 'Ana Ribeiro' aparece em três linhas, e na linha 4 o e-mail já diverge das linhas 1 e 2. Qual é o e-mail correto dessa cliente?"
                    },
                    {
                        "type": "text",
                        "value": "## As três anomalias clássicas\n\nEsse tipo de redundância abre espaço para três problemas:\n\n- **Anomalia de inserção**: para cadastrar um cliente novo sem pedido ainda, você é forçado a criar uma linha com produto e valor vazios, ou simplesmente não consegue registrar o cliente até que ele compre algo.\n- **Anomalia de atualização**: mudar o e-mail da cliente exige atualizar várias linhas. Se uma delas for esquecida, a base fica inconsistente, como no exemplo acima.\n- **Anomalia de exclusão**: apagar o único pedido de um cliente apaga junto todos os dados cadastrais dele, mesmo que ele continue sendo cliente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Anomalia\", \"Quando ocorre\", \"Efeito\"], [\"Inserção\", \"Registrar uma entidade sem um fato associado\", \"Colunas obrigatórias ficam nulas ou o cadastro é bloqueado\"], [\"Atualização\", \"Alterar um dado repetido em várias linhas\", \"Risco de inconsistência se alguma linha não for atualizada\"], [\"Exclusão\", \"Remover a única linha que contém certa informação\", \"Perda de dados que não deveriam depender daquela linha\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Normalização é o processo de organizar colunas e tabelas para que cada fato seja armazenado em exatamente um lugar, eliminando a redundância que causa as anomalias de inserção, atualização e exclusão."
                    }
                ],
                "questions": [
                    {
                        "statement": "No vocabulário formal do modelo relacional, o que corresponde a uma 'tupla'?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma linha de uma tabela",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma coluna de uma tabela",
                                "isCorrect": false
                            },
                            {
                                "text": "O domínio de um atributo",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome de uma tabela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela única guarda pedidos e, em cada linha, repete nome, e-mail e cidade do cliente. Um analista percebe que o e-mail de um mesmo cliente aparece diferente em duas linhas. Qual anomalia esse cenário ilustra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Anomalia de atualização: o dado não foi alterado em todas as linhas",
                                "isCorrect": true
                            },
                            {
                                "text": "Anomalia de inserção: não é possível cadastrar um cliente sem pedido",
                                "isCorrect": false
                            },
                            {
                                "text": "Anomalia de exclusão: apagar o pedido apagaria os dados do cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Violação de integridade referencial: a chave estrangeira está inválida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma escola só consegue cadastrar um professor no sistema depois que ele é vinculado a pelo menos uma turma, porque as colunas de turma são obrigatórias na mesma tabela de professores. Isso é um exemplo de qual anomalia?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Anomalia de inserção: o professor não pode existir sem uma turma vinculada",
                                "isCorrect": true
                            },
                            {
                                "text": "Anomalia de exclusão: remover a turma apaga o cadastro do professor",
                                "isCorrect": false
                            },
                            {
                                "text": "Anomalia de atualização: dados do professor ficam duplicados por turma",
                                "isCorrect": false
                            },
                            {
                                "text": "Anomalia de redundância: o nome do professor se repete em várias linhas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma tabela única de vendas, cada linha combina um produto vendido com os dados cadastrais do vendedor. Ao remover a última venda de um vendedor específico, seus dados cadastrais desaparecem do sistema. Qual anomalia é essa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Anomalia de exclusão: apagar a venda remove os dados cadastrais do vendedor",
                                "isCorrect": true
                            },
                            {
                                "text": "Anomalia de inserção: o vendedor não pode ser cadastrado sem uma venda",
                                "isCorrect": false
                            },
                            {
                                "text": "Anomalia de atualização: o cadastro do vendedor fica inconsistente entre linhas",
                                "isCorrect": false
                            },
                            {
                                "text": "Anomalia de integridade: a chave primária da tabela permite valores duplicados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de RH mantém uma única tabela onde cada linha é um contracheque e repete, para cada linha, o nome do cargo e o salário-base do cargo. Um analista quer corrigir esse desenho para evitar anomalias. Qual mudança estrutural resolve o problema pela raiz?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Mover cargo e salário para uma tabela própria com chave estrangeira",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar uma trigger que sincroniza o salário-base em todas as linhas repetidas",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um índice composto sobre as colunas de cargo e salário-base",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloquear a edição do salário-base diretamente na tabela de contracheques",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Primeira, segunda e terceira forma normal",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Primeira, segunda e terceira forma normal\n\nAs formas normais são regras progressivas: cada nível resolve um tipo específico de anomalia e pressupõe que o nível anterior já foi cumprido. A base teórica é a dependência funcional: quando o valor de um atributo é determinado pelo valor da chave. Vamos evoluir um mesmo exemplo da 1FN até a 3FN."
                    },
                    {
                        "type": "text",
                        "value": "## 1FN: atomicidade e ausência de grupos repetidos\n\nUma tabela está na Primeira Forma Normal quando:\n\n- Cada coluna guarda um único valor atômico, nada de listas ou valores separados por vírgula em uma célula\n- Não existem grupos de colunas repetidas para representar uma lista, como `telefone1`, `telefone2`, `telefone3`\n- Existe uma chave primária que identifica cada linha de forma única"
                    },
                    {
                        "type": "code",
                        "value": "-- Viola a 1FN: coluna multivalorada\nCREATE TABLE cliente_v0 (\n    id_cliente INT PRIMARY KEY,\n    nome       VARCHAR(100),\n    telefones  VARCHAR(200)  -- ex: '81999990000,81988887777'\n);\n\n-- Em 1FN: uma linha por telefone\nCREATE TABLE cliente (\n    id_cliente INT PRIMARY KEY,\n    nome       VARCHAR(100)\n);\n\nCREATE TABLE cliente_telefone (\n    id_cliente INT REFERENCES cliente(id_cliente),\n    telefone   VARCHAR(20),\n    PRIMARY KEY (id_cliente, telefone)\n);"
                    },
                    {
                        "type": "text",
                        "value": "## 2FN: eliminando a dependência parcial\n\nA Segunda Forma Normal só é uma preocupação quando a chave primária é **composta** (mais de uma coluna). Ela exige que todo atributo não-chave dependa da chave **inteira**, e não de apenas uma parte dela.\n\nSe um atributo depende só de uma das colunas da chave composta, ele está no lugar errado: isso é uma dependência parcial."
                    },
                    {
                        "type": "code",
                        "value": "-- Viola a 2FN: nome_produto depende só de id_produto, não da chave inteira\nCREATE TABLE item_pedido_v0 (\n    id_pedido    INT,\n    id_produto   INT,\n    nome_produto VARCHAR(100),  -- depende só de id_produto\n    quantidade   INT,\n    PRIMARY KEY (id_pedido, id_produto)\n);\n\n-- Em 2FN: nome_produto migra para a tabela produto\nCREATE TABLE produto (\n    id_produto   INT PRIMARY KEY,\n    nome_produto VARCHAR(100)\n);\n\nCREATE TABLE item_pedido (\n    id_pedido  INT,\n    id_produto INT REFERENCES produto(id_produto),\n    quantidade INT,\n    PRIMARY KEY (id_pedido, id_produto)\n);"
                    },
                    {
                        "type": "text",
                        "value": "## 3FN: eliminando a dependência transitiva\n\nA Terceira Forma Normal exige que todo atributo não-chave dependa **diretamente** da chave, e não de outro atributo não-chave. Quando um atributo depende de outro atributo que não é chave, existe uma dependência transitiva.\n\nNo exemplo de `item_pedido`, suponha que a tabela `produto` também guarde `id_categoria` e `nome_categoria`. Como `nome_categoria` depende de `id_categoria`, e não diretamente de `id_produto`, isso viola a 3FN. A solução é extrair `categoria` para sua própria tabela."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Forma normal\", \"O que exige\", \"O que elimina\"], [\"1FN\", \"Atributos atômicos, sem grupos repetidos\", \"Colunas multivaloradas\"], [\"2FN\", \"Atributo não-chave depende da chave composta inteira\", \"Dependência parcial\"], [\"3FN\", \"Atributo não-chave depende só da chave, não de outro atributo\", \"Dependência transitiva\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que uma tabela precisa cumprir para estar na Primeira Forma Normal (1FN)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cada coluna deve conter apenas valores atômicos, sem listas",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada tabela deve ter no máximo uma única chave estrangeira",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada coluna deve sempre ter um valor padrão pré-definido",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada tabela deve conter no mínimo três colunas distintas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela `pedido` tem a coluna `produtos_comprados` armazenando valores como 'Teclado, Mouse, Headset' em uma única célula. Qual forma normal essa coluna viola?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A 1FN, porque o valor da coluna não é atômico",
                                "isCorrect": true
                            },
                            {
                                "text": "A 2FN, porque existe dependência parcial entre as colunas",
                                "isCorrect": false
                            },
                            {
                                "text": "A 3FN, porque existe dependência transitiva entre atributos",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma forma normal, pois a chave primária identifica a linha corretamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela `matricula_disciplina` tem chave composta (`id_aluno`, `id_disciplina`) e também guarda `nome_disciplina`, que depende apenas de `id_disciplina`. Que problema de normalização isso representa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dependência parcial, porque o atributo depende só de parte da chave composta",
                                "isCorrect": true
                            },
                            {
                                "text": "Dependência transitiva, porque o atributo depende de outro atributo não-chave",
                                "isCorrect": false
                            },
                            {
                                "text": "Violação da 1FN, porque a coluna guarda mais de um valor na mesma célula",
                                "isCorrect": false
                            },
                            {
                                "text": "Redundância proposital, aceitável para acelerar consultas de leitura",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na tabela `funcionario`, a coluna `id_departamento` referencia o departamento, mas a tabela também guarda `nome_gerente_departamento`, que depende de `id_departamento` e não do funcionário. Isso caracteriza qual situação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dependência transitiva, uma violação da 3FN",
                                "isCorrect": true
                            },
                            {
                                "text": "Dependência parcial, uma violação da 2FN",
                                "isCorrect": false
                            },
                            {
                                "text": "Ausência de atomicidade, uma violação da 1FN",
                                "isCorrect": false
                            },
                            {
                                "text": "Ausência de integridade referencial, por falta de chave estrangeira",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela `pedido_item` tem chave composta (`id_pedido`, `id_produto`) e guarda `nome_produto` (que depende só de `id_produto`) e `nome_categoria` (que depende de uma coluna `id_categoria` dentro da futura tabela produto, não do pedido). Qual sequência de correções leva essa estrutura até a 3FN?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Mover nome_produto para produto (2FN) e depois nome_categoria para categoria (3FN)",
                                "isCorrect": true
                            },
                            {
                                "text": "Mover nome_categoria para pedido_item, mantendo nome_produto como está hoje",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um índice composto em id_pedido e id_produto para remover a dependência",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover nome_produto e nome_categoria juntos para uma única coluna concatenada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "BCNF e formas normais superiores",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# BCNF e formas normais superiores\n\nA 3FN elimina a maioria dos problemas práticos de redundância, mas não cobre todos os casos. Quando uma tabela tem **mais de uma chave candidata** e essas chaves se sobrepõem, é possível estar em 3FN e ainda assim ter anomalias. Esse é o gatilho para a Forma Normal de Boyce-Codd (BCNF)."
                    },
                    {
                        "type": "text",
                        "value": "## BCNF: toda determinante precisa ser chave candidata\n\nUma tabela está na BCNF quando, para toda dependência funcional `X -> Y` não trivial, `X` é uma chave candidata (um conjunto de colunas que poderia ser a chave primária).\n\nA diferença para a 3FN é sutil: a 3FN permite uma exceção quando `Y` faz parte de alguma chave candidata. A BCNF fecha essa brecha: é uma regra mais rígida."
                    },
                    {
                        "type": "code",
                        "value": "-- Tabela em 3FN, mas fora da BCNF\n-- Um professor leciona uma única disciplina, mas uma disciplina pode ter vários professores\n-- Cada combinação (disciplina, sala) sempre tem o mesmo professor\nCREATE TABLE oferta_v0 (\n    disciplina VARCHAR(50),\n    sala       VARCHAR(10),\n    professor  VARCHAR(100),\n    PRIMARY KEY (disciplina, sala)\n);\n-- Dependência funcional oculta: professor -> disciplina\n-- 'professor' não é chave candidata, mas determina 'disciplina': viola BCNF\n\n-- Em BCNF: separar a dependência professor -> disciplina\nCREATE TABLE professor_disciplina (\n    professor  VARCHAR(100) PRIMARY KEY,\n    disciplina VARCHAR(50)\n);\n\nCREATE TABLE oferta (\n    professor VARCHAR(100) REFERENCES professor_disciplina(professor),\n    sala      VARCHAR(10),\n    PRIMARY KEY (professor, sala)\n);"
                    },
                    {
                        "type": "text",
                        "value": "## 4FN: dependências multivaloradas\n\nA Quarta Forma Normal trata dependências **multivaloradas** independentes dentro da mesma tabela. Exemplo clássico: uma tabela que relaciona `professor`, `idioma_que_fala` e `disciplina_que_leciona`. Quando essas duas listas não têm relação entre si, a tabela gera combinações redundantes (produto cartesiano) que só a 4FN resolve, separando cada relacionamento multivalorado em sua própria tabela."
                    },
                    {
                        "type": "text",
                        "value": "## 5FN: dependências de junção\n\nA Quinta Forma Normal (ou forma normal de projeção-junção) trata casos raros em que uma tabela só pode ser reconstruída sem perda de informação se for decomposta em três ou mais tabelas menores, e nenhuma decomposição em apenas duas tabelas preserva o significado original. É pouco citada fora de contextos acadêmicos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Forma normal\", \"Problema que resolve\"], [\"3FN\", \"Dependência transitiva entre atributos não-chave\"], [\"BCNF\", \"Dependência funcional em que a determinante não é chave candidata\"], [\"4FN\", \"Duas ou mais dependências multivaloradas independentes na mesma tabela\"], [\"5FN\", \"Perda de informação ao decompor a tabela em apenas duas partes\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Na prática, a grande maioria dos sistemas OLTP para em algum ponto entre a 3FN e a BCNF. Normalizar até a 4FN ou 5FN raramente compensa o custo de complexidade adicional nas consultas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a exigência central da Forma Normal de Boyce-Codd (BCNF)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Toda determinante funcional deve ser uma chave candidata",
                                "isCorrect": true
                            },
                            {
                                "text": "Toda coluna deve aceitar valores nulos, para manter flexibilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Toda tabela deve ter exatamente uma única chave estrangeira",
                                "isCorrect": false
                            },
                            {
                                "text": "Toda dependência funcional deve envolver ao menos três colunas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela está na 3FN, mas ainda tem uma dependência funcional em que a coluna determinante não é nenhuma das chaves candidatas da tabela. O que se pode afirmar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A tabela não está na BCNF, apesar de estar na 3FN",
                                "isCorrect": true
                            },
                            {
                                "text": "A tabela também não está na 3FN, já que as regras são equivalentes",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela está automaticamente na 4FN, por já superar a 3FN",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela viola a 1FN, pois a chave não determina todas as colunas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na tabela oferta(disciplina, sala, professor), a chave é (disciplina, sala). Sabe-se que cada professor leciona sempre a mesma disciplina, ou seja, professor determina disciplina, embora professor sozinho não seja chave candidata. Por que essa tabela viola a BCNF mesmo estando em 3FN?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque professor é determinante de disciplina mas não é chave candidata",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a coluna disciplina permite valores nulos, quebrando a exigência mínima da BCNF",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a chave composta (disciplina, sala) tem mais de duas colunas, o que a BCNF proíbe",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a tabela ainda guarda um grupo de colunas repetidas, violando a atomicidade exigida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela `professor_info` lista, sem relação entre si, os idiomas que cada professor fala e as disciplinas que ele pode lecionar, gerando o produto cartesiano das duas listas em cada linha. Qual forma normal trata diretamente esse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "4FN, ao separar as duas dependências multivaloradas em tabelas distintas",
                                "isCorrect": true
                            },
                            {
                                "text": "3FN, ao remover a dependência transitiva entre idioma e disciplina",
                                "isCorrect": false
                            },
                            {
                                "text": "BCNF, ao garantir que idioma seja uma chave candidata da tabela",
                                "isCorrect": false
                            },
                            {
                                "text": "1FN, ao transformar idioma e disciplina em colunas atômicas separadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de engenharia de dados está desenhando o modelo OLTP de um sistema de pedidos e debate até que forma normal levar as tabelas. Considerando o uso comum na indústria, qual orientação é mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Normalizar até a 3FN ou BCNF basta na prática; 4FN e 5FN raramente compensam",
                                "isCorrect": true
                            },
                            {
                                "text": "Normalizar sempre até a 5FN, pois é o padrão mínimo aceitável para sistemas transacionais",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar a normalização formal e desnormalizar tudo desde o início do projeto OLTP",
                                "isCorrect": false
                            },
                            {
                                "text": "Normalizar só até a 1FN, já que formas superiores servem apenas para relatórios analíticos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Modelagem para transações (OLTP)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Modelagem para transações (OLTP)\n\nOLTP (Online Transaction Processing) é a categoria de sistemas voltada a registrar e processar transações do dia a dia: um pedido de compra, uma transferência bancária, uma matrícula. É o tipo de carga para o qual o modelo relacional normalizado foi originalmente pensado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"Como se manifesta em OLTP\"], [\"Volume de operações\", \"Muitas transações pequenas, executadas em paralelo por muitos usuários\"], [\"Tipo de acesso\", \"Leituras e escritas pontuais, geralmente por chave primária\"], [\"Duração da transação\", \"Curta, da ordem de milissegundos\"], [\"Prioridade\", \"Consistência e integridade dos dados acima de tudo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que OLTP é normalizado\n\nA normalização existe justamente para sustentar esse tipo de carga:\n\n- Cada escrita altera o menor conjunto de linhas possível, o que reduz o tempo de cada transação e o risco de conflito entre transações concorrentes\n- A integridade referencial (chaves estrangeiras, constraints) impede estados inconsistentes mesmo com múltiplos usuários escrevendo ao mesmo tempo\n- Eliminar redundância evita que uma transação precise atualizar o mesmo dado em vários lugares, o que aumentaria a chance de falha parcial"
                    },
                    {
                        "type": "code",
                        "value": "-- Esquema OLTP normalizado para um e-commerce\nCREATE TABLE cliente (\n    id_cliente INT PRIMARY KEY,\n    nome       VARCHAR(100) NOT NULL,\n    email      VARCHAR(150) UNIQUE NOT NULL\n);\n\nCREATE TABLE produto (\n    id_produto INT PRIMARY KEY,\n    nome       VARCHAR(100) NOT NULL,\n    preco      NUMERIC(10,2) NOT NULL\n);\n\nCREATE TABLE pedido (\n    id_pedido   INT PRIMARY KEY,\n    id_cliente  INT REFERENCES cliente(id_cliente),\n    data_pedido TIMESTAMP NOT NULL DEFAULT now(),\n    status      VARCHAR(20) NOT NULL\n);\n\nCREATE TABLE item_pedido (\n    id_pedido  INT REFERENCES pedido(id_pedido),\n    id_produto INT REFERENCES produto(id_produto),\n    quantidade INT NOT NULL,\n    preco_unit NUMERIC(10,2) NOT NULL,\n    PRIMARY KEY (id_pedido, id_produto)\n);"
                    },
                    {
                        "type": "text",
                        "value": "## O que otimizar em OLTP\n\nO foco de otimização é bem diferente do mundo analítico:\n\n- **Índices seletivos** para buscas pontuais rápidas (buscar um pedido pelo `id_pedido`, um cliente pelo `email`)\n- **Isolamento de transações** para controlar o que uma transação enxerga enquanto outra está em andamento\n- **Concorrência**: minimizar o tempo que uma linha fica bloqueada, para não travar outras transações\n- **Constraints** (NOT NULL, UNIQUE, FOREIGN KEY, CHECK) para que a integridade seja garantida pelo próprio banco, não pela aplicação"
                    },
                    {
                        "type": "quote",
                        "value": "Um sistema OLTP é otimizado para responder rápido a uma transação de cada vez, com garantia de integridade. Ele não foi desenhado para varrer milhões de linhas em uma única consulta: essa é a tarefa do mundo analítico."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Propriedade ACID\", \"Garantia\"], [\"Atomicidade\", \"A transação é tudo ou nada, sem estados parciais\"], [\"Consistência\", \"A transação leva o banco de um estado válido a outro\"], [\"Isolamento\", \"Transações concorrentes não interferem uma na outra\"], [\"Durabilidade\", \"Após confirmada, a transação sobrevive a falhas\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza melhor uma carga de trabalho OLTP?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Muitas transações curtas, geralmente lendo e escrevendo poucas linhas por vez",
                                "isCorrect": true
                            },
                            {
                                "text": "Poucas consultas longas, que varrem milhões de linhas para gerar relatórios",
                                "isCorrect": false
                            },
                            {
                                "text": "Cargas em lote, executadas uma vez por dia fora do horário comercial",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultas somente leitura, sem nenhuma operação de escrita no banco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que sistemas OLTP costumam adotar um modelo de dados normalizado (3FN ou próximo disso)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque reduz o dado alterado a cada escrita e evita cópias redundantes",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque acelera relatórios que agregam milhões de linhas históricas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque elimina a necessidade de índices nas tabelas transacionais",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque reduz o número de tabelas do banco, simplificando o schema",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um sistema bancário, duas transferências para a mesma conta são processadas ao mesmo tempo por transações concorrentes. Qual propriedade do modelo transacional garante que o saldo final reflita as duas operações corretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Isolamento entre transações, controlando o que cada uma enxerga durante a execução",
                                "isCorrect": true
                            },
                            {
                                "text": "Desnormalização da tabela de contas, para reduzir o número de linhas acessadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Particionamento físico da tabela de contas por faixa de identificador",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituição da chave primária numérica por uma chave alfanumérica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação de e-commerce executa milhares de vezes por minuto a consulta 'buscar pedido pelo id_pedido'. Qual ação tem mais impacto na performance dessa carga OLTP?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Garantir um índice sobre a coluna id_pedido usada no filtro",
                                "isCorrect": true
                            },
                            {
                                "text": "Desnormalizar a tabela de pedidos para reduzir o número de JOINs",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma tabela agregada com o total de pedidos por dia",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o tamanho do campo de status do pedido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de pedidos guarda `preco_unit` em `item_pedido` além do `preco` já existente em `produto`. Um desenvolvedor sugere remover `preco_unit` de `item_pedido` por ser redundante, já que dá para buscar o preço direto em `produto`. Do ponto de vista de modelagem OLTP, essa sugestão está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, preco_unit guarda o preço da venda; produto.preco muda depois",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque toda coluna repetida entre tabelas é redundância a eliminar",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o JOIN com produto sempre traz o valor histórico certo",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque item_pedido não deveria referenciar produto por chave estrangeira",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Desnormalização controlada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Desnormalização controlada\n\nDesnormalizar é reintroduzir redundância de propósito, depois de entender exatamente qual anomalia isso pode causar e decidir que o ganho compensa o risco. É diferente de nunca ter normalizado: aqui a redundância é uma escolha registrada, não um acidente de design."
                    },
                    {
                        "type": "text",
                        "value": "## Quando desnormalizar de propósito\n\nAlguns motivos legítimos para introduzir redundância controlada em um schema majoritariamente normalizado:\n\n- Uma consulta de leitura crítica (exibida em toda página, por exemplo) precisa de vários JOINs caros para montar a resposta\n- Um valor é caro de recalcular a cada leitura, mas muda com pouca frequência\n- O volume de leitura é ordens de grandeza maior que o de escrita, então vale pagar um pouco mais na escrita para economizar em cada leitura"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Modelo normalizado\", \"Modelo desnormalizado\"], [\"Escrita\", \"Atualiza um único lugar\", \"Pode exigir atualizar várias cópias\"], [\"Leitura\", \"Frequentemente exige JOINs\", \"Muitas vezes lê de uma única tabela\"], [\"Consistência\", \"Garantida pela ausência de cópias\", \"Depende de manter as cópias sincronizadas\"], [\"Espaço em disco\", \"Menor, sem duplicação\", \"Maior, com dados repetidos\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- Exemplo: cache de um valor derivado na tabela pedido\nALTER TABLE pedido ADD COLUMN valor_total NUMERIC(10,2);\n\n-- valor_total é a soma de item_pedido, recalculada e gravada\n-- a cada inserção, atualização ou remoção de item\nUPDATE pedido\nSET valor_total = (\n    SELECT SUM(quantidade * preco_unit)\n    FROM item_pedido\n    WHERE item_pedido.id_pedido = pedido.id_pedido\n)\nWHERE id_pedido = 123;\n\n-- Risco assumido: se algum fluxo alterar item_pedido sem\n-- recalcular valor_total, o total exibido fica desatualizado"
                    },
                    {
                        "type": "text",
                        "value": "## Dados derivados e calculados\n\nDado derivado é qualquer valor que pode ser obtido a partir de outros dados já existentes, como um total, uma contagem ou uma média. Guardar esse valor calculado, em vez de recalculá-lo a cada leitura, é uma forma comum de desnormalização.\n\nPara manter esses valores consistentes, as opções mais comuns são:\n\n- **Triggers** no banco, que recalculam o valor a cada mudança relevante\n- **Lógica na aplicação**, que atualiza o valor dentro da mesma transação\n- **Jobs em lote**, que recalculam periodicamente, aceitando uma janela de defasagem"
                    },
                    {
                        "type": "quote",
                        "value": "Desnormalização não é o oposto de normalização: é um passo posterior, aplicado com intenção sobre partes específicas de um modelo que, por padrão, deveria continuar normalizado."
                    },
                    {
                        "type": "text",
                        "value": "## O caminho para o mundo analítico\n\nEm sistemas de relatórios e análise, o padrão se inverte: o volume de leitura (consultas que varrem milhões de linhas) é muito maior que o de escrita (cargas periódicas), e o mesmo dado é lido de muitas formas diferentes. Por isso, o mundo analítico assume a desnormalização como estratégia central de modelagem, não como exceção pontual. É isso que o próximo módulo explora."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é desnormalização, no contexto de modelagem de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Introduzir redundância de forma deliberada, aceitando um trade-off",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover todas as chaves estrangeiras de um schema já normalizado",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de tabelas para reduzir o tamanho de cada tabela",
                                "isCorrect": false
                            },
                            {
                                "text": "Corrigir erros de modelagem cometidos durante a normalização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela pedido passa a guardar valor_total como coluna calculada, em vez de somar item_pedido a cada leitura. O que essa mudança troca, na prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Leituras mais rápidas por escritas extras para manter o total",
                                "isCorrect": true
                            },
                            {
                                "text": "Menor uso de espaço em disco por um schema com mais tabelas ainda",
                                "isCorrect": false
                            },
                            {
                                "text": "Maior integridade referencial por um número bem menor de índices",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultas mais simples por uma chave primária composta na tabela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma página de perfil de produto é acessada milhares de vezes por segundo e hoje monta a nota média a partir de um JOIN com milhões de avaliações. A equipe considera guardar a nota média já calculada na própria tabela produto. Essa é uma decisão razoável de desnormalização?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, o alto volume de leitura compensa o custo extra nas escritas",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque desnormalizar nunca é aceitável em tabelas consultadas com alta frequência",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque colunas calculadas eliminam a necessidade de qualquer chave primária",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque a nota média não pode ser representada como uma coluna numérica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide guardar estoque_disponivel como coluna na tabela produto, atualizada por uma trigger sempre que item_pedido é alterado. Qual risco essa abordagem assume conscientemente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Se a trigger falhar silenciosamente, a coluna fica dessincronizada de item_pedido",
                                "isCorrect": true
                            },
                            {
                                "text": "A tabela produto deixa de aceitar novas colunas depois que a trigger é criada",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco de dados passa a exigir uma chave primária composta em produto",
                                "isCorrect": false
                            },
                            {
                                "text": "As consultas de leitura em produto passam a exigir permissão de escrita",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas tabelas guardam o mesmo dado de formas diferentes: (1) pedido.valor_total, recalculado por trigger sempre que item_pedido muda; (2) uma tabela cliente_v0 antiga que repete nome_cliente em toda linha de pedido, sem nenhum mecanismo de sincronização. Qual a diferença conceitual entre os dois casos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O primeiro é desnormalização controlada e sincronizada; o segundo é redundância não controlada",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois casos são exemplos idênticos de desnormalização controlada, aplicados a tabelas diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "O primeiro viola a 1FN; o segundo é um exemplo correto de dependência transitiva",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois casos deveriam ser eliminados, já que todo dado repetido é sempre um erro de modelagem",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - OLTP x OLAP e a razão do data warehouse",
        "aulas": [
            {
                "titulo": "Cargas transacionais x analíticas (OLTP x OLAP)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Cargas transacionais x analíticas (OLTP x OLAP)\n\nToda aplicação que guarda dados em um banco relacional gera dois tipos bem diferentes de carga de trabalho: registrar o que está acontecendo agora (uma venda, um cadastro, um pagamento) e responder perguntas sobre o que aconteceu ao longo do tempo (quanto vendemos no trimestre, qual o ticket médio por região). O primeiro tipo de carga se chama **OLTP** (On-Line Transaction Processing); o segundo, **OLAP** (On-Line Analytical Processing). Entender a diferença entre os dois é o ponto de partida para entender por que existe a figura do data warehouse."
                    },
                    {
                        "type": "text",
                        "value": "## Cargas OLTP: o dia a dia da aplicação\n\nUm sistema OLTP é o banco de dados que sustenta a operação: o e-commerce registrando pedidos, o banco registrando transferências, o ERP registrando notas fiscais. As características típicas de uma carga OLTP:\n\n- Muitas transações curtas e simultâneas (inserts, updates, deletes de poucas linhas)\n- Cada transação lê e escreve um pequeno número de registros, geralmente localizados por chave primária\n- Exige forte consistência (propriedades ACID), porque envolve dinheiro, estoque, contratos\n- O modelo de dados é normalizado (3FN), para evitar anomalias de inserção, atualização e remoção\n- O usuário típico é a própria aplicação, atendendo um cliente por vez, com resposta em milissegundos"
                    },
                    {
                        "type": "text",
                        "value": "## Cargas OLAP: perguntas sobre o negócio\n\nUm sistema OLAP existe para responder perguntas analíticas: como as vendas evoluíram nos últimos 12 meses, qual categoria de produto cresce mais rápido, quais clientes têm maior risco de cancelamento. As características típicas de uma carga OLAP:\n\n- Poucas consultas, mas cada uma varre um volume grande de linhas (meses ou anos de histórico)\n- As consultas agregam (`SUM`, `AVG`, `COUNT`) e agrupam por várias dimensões (tempo, região, produto, canal)\n- Tolera dados com alguns minutos ou horas de atraso; o que importa é consistência analítica, não a última escrita\n- O modelo de dados tende a ser dimensional (menos normalizado), otimizado para leitura e agregação\n- O usuário típico é um analista, um cientista de dados ou uma ferramenta de BI, rodando consultas ad hoc"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"OLTP\", \"OLAP\"], [\"Objetivo\", \"Registrar e processar transações do negócio\", \"Analisar histórico e apoiar decisão\"], [\"Padrão de acesso\", \"Muitas escritas curtas, leituras pontuais\", \"Poucas leituras, cada uma varrendo muitas linhas\"], [\"Modelagem\", \"Normalizada (3FN), evita redundância\", \"Dimensional, otimizada para leitura\"], [\"Volume por operação\", \"Poucos registros por transação\", \"Milhões de registros por consulta\"], [\"Usuário típico\", \"Aplicação, atendendo um cliente por vez\", \"Analista ou ferramenta de BI\"], [\"Exemplo\", \"Sistema de pedidos de um e-commerce\", \"Painel de vendas por região e período\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o mesmo banco não serve bem aos dois\n\nNa teoria, seria possível rodar análises direto no banco de produção. Na prática, isso cria problemas:\n\n- **Contenção de recursos**: uma consulta analítica que varre milhões de linhas disputa CPU, memória e I/O com as transações que estão processando pedidos naquele exato momento, podendo deixar a aplicação lenta ou até indisponível\n- **Índices em conflito**: OLTP quer índices seletivos para localizar poucas linhas rápido; OLAP se beneficia de varreduras sequenciais e agregações, que pedem estruturas diferentes (como armazenamento colunar)\n- **Modelo de dados em conflito**: a normalização que protege a integridade transacional obriga o analista a escrever `JOIN`s complexos entre dezenas de tabelas para montar uma métrica simples\n- **Fontes múltiplas**: uma análise de negócio raramente usa um único sistema. Ela cruza dados de vendas, marketing, suporte e financeiro, sistemas que normalmente vivem em bancos separados\n\nEssa tensão é exatamente o que motiva manter um banco separado, otimizado para analytics: o data warehouse, tema das próximas aulas."
                    },
                    {
                        "type": "code",
                        "value": "-- Consulta típica OLTP: localizar um pedido específico por chave\nSELECT id, cliente_id, status, valor_total\nFROM pedidos\nWHERE id = 458213;\n\n-- Consulta típica OLAP: agregar vendas por mês e categoria, histórico inteiro\nSELECT\n    DATE_TRUNC('month', p.data_pedido) AS mes,\n    c.categoria,\n    SUM(i.quantidade * i.preco_unitario) AS receita\nFROM pedidos p\nJOIN itens_pedido i ON i.pedido_id = p.id\nJOIN produtos c ON c.id = i.produto_id\nWHERE p.data_pedido >= '2023-01-01'\nGROUP BY 1, 2\nORDER BY 1, 2;"
                    },
                    {
                        "type": "quote",
                        "value": "OLTP responde 'o que está acontecendo agora' com poucas linhas por vez; OLAP responde 'o que aconteceu ao longo do tempo' varrendo milhões de linhas de uma vez. São padrões de acesso opostos, e por isso raramente convivem bem no mesmo banco."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das alternativas melhor caracteriza uma carga de trabalho OLTP?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Muitas transações curtas e concorrentes, que leem e escrevem poucos registros",
                                "isCorrect": true
                            },
                            {
                                "text": "Poucas consultas complexas, cada uma agregando milhões de registros históricos",
                                "isCorrect": false
                            },
                            {
                                "text": "Cargas em lote, executadas uma vez por dia, sem exigência de concorrência",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultas ad hoc de analistas, sem padrão fixo de acesso aos dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de BI passou a rodar, direto no banco de produção do e-commerce, um relatório que soma o valor de todos os pedidos dos últimos 24 meses, agrupado por categoria e mês. Depois disso, o time de operações começou a reclamar de lentidão no checkout nos horários em que o relatório roda. Qual é a causa mais provável do problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O banco de produção está com o índice de chave primária da tabela de pedidos corrompido, o que atrasa as consultas",
                                "isCorrect": false
                            },
                            {
                                "text": "A consulta analítica varre um grande volume de linhas e disputa CPU, memória e I/O com o checkout do mesmo banco",
                                "isCorrect": true
                            },
                            {
                                "text": "O relatório usa uma versão desatualizada do driver de conexão, gerando timeout nas transações de checkout",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela de pedidos atingiu o limite máximo de linhas suportado por um banco relacional convencional",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista precisa calcular a receita mensal por categoria de produto usando o banco de produção do e-commerce, que segue o modelo normalizado (3FN) usado pela aplicação. Ele precisa unir seis tabelas para chegar ao resultado, e a consulta demora minutos rodando junto com o tráfego de pedidos. Qual é a explicação mais direta para essa dificuldade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O banco de produção está com estatísticas de índice desatualizadas, o que explica toda a lentidão observada",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela de pedidos não possui chave primária definida, obrigando a consulta a fazer varredura completa",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo normalizado da OLTP otimiza a integridade das transações, não a leitura agregada que a análise exige",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor de banco de dados está subdimensionado em memória RAM para qualquer tipo de consulta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Das quatro consultas abaixo, rodadas sobre a mesma tabela de pedidos com 200 milhões de linhas, qual tem o padrão de acesso mais típico de uma carga OLAP?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Buscar os dados de um pedido específico a partir do número informado pelo cliente no atendimento",
                                "isCorrect": false
                            },
                            {
                                "text": "Atualizar o status de um pedido para 'enviado' logo após a confirmação da transportadora parceira",
                                "isCorrect": false
                            },
                            {
                                "text": "Inserir um novo pedido no sistema assim que o cliente finaliza a compra no carrinho de compras",
                                "isCorrect": false
                            },
                            {
                                "text": "Somar o valor total de pedidos dos últimos 24 meses, agrupado por mês e por região do cliente",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que um painel analítico de vendas costuma tolerar dados com algumas horas de atraso, enquanto o carrinho de compras do e-commerce não tolera nenhum atraso na baixa de estoque?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a análise depende de consistência agregada no tempo, e o carrinho depende de consistência imediata a cada compra",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque painéis analíticos sempre rodam em servidores mais lentos, o que torna qualquer atraso tecnicamente inevitável",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o carrinho de compras usa um banco totalmente diferente do sistema de estoque, sem nenhuma relação entre os dois",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque painéis analíticos não processam dados numéricos com a mesma precisão exigida pelos sistemas transacionais",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que é um data warehouse e o problema que ele resolve",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é um data warehouse e o problema que ele resolve\n\nUm **data warehouse** é um banco de dados construído especificamente para suportar análise e tomada de decisão, separado dos bancos que sustentam a operação do dia a dia. Ele recebe dados de múltiplas fontes (o sistema de vendas, o CRM, o ERP, os logs do site), integra tudo em um modelo comum e guarda o histórico para que perguntas sobre 'como o negócio evoluiu' possam ser respondidas de forma confiável."
                    },
                    {
                        "type": "text",
                        "value": "## O problema antes do data warehouse\n\nSem um repositório analítico central, cada área tende a extrair números direto dos sistemas operacionais, cada uma do seu jeito. O resultado é um cenário comum em empresas que crescem organicamente:\n\n- O financeiro calcula 'receita' de um jeito, o comercial calcula de outro, e as duas planilhas nunca batem\n- Cada analista escreve sua própria consulta contra o banco de produção, repetindo lógica e às vezes errando regras de negócio\n- Perguntas que cruzam sistemas (vendas x marketing x suporte) exigem juntar exportações manuais em planilha\n- O histórico se perde: o sistema operacional guarda só o estado atual, ou mantém poucos meses de dados por limitação de espaço e desempenho\n\nEsse cenário é conhecido como o problema das 'ilhas de informação': cada sistema sabe sua parte da verdade, e ninguém tem a visão completa."
                    },
                    {
                        "type": "text",
                        "value": "## O que o data warehouse resolve\n\nO data warehouse ataca diretamente esses problemas:\n\n- **Integração**: dados de sistemas diferentes são combinados em um modelo comum, com as mesmas definições de negócio\n- **Fonte única de verdade**: uma métrica como 'receita líquida' é calculada uma vez, com uma regra documentada, e todo mundo consulta o mesmo número\n- **Histórico**: o warehouse acumula anos de dados, mesmo que os sistemas de origem mantenham só o estado corrente\n- **Isolamento da produção**: as consultas analíticas, por mais pesadas que sejam, rodam em outro banco, sem competir por recursos com quem está processando pedidos"
                    },
                    {
                        "type": "quote",
                        "value": "Bill Inmon definiu o data warehouse como um conjunto de dados orientado por assunto, integrado, variante no tempo e não volátil, organizado para dar suporte a decisões de gestão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"O que significa\"], [\"Orientado por assunto\", \"Organizado em torno de temas do negócio (cliente, produto, vendas), não em torno dos processos de um sistema\"], [\"Integrado\", \"Dados de fontes diferentes chegam com nomes, formatos e unidades padronizados\"], [\"Variante no tempo\", \"Guarda o histórico; cada registro carrega o momento a que se refere\"], [\"Não volátil\", \"Depois de carregado, o dado não é sobrescrito nem apagado; novas cargas se somam ao histórico\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Sistema de vendas     ---+\nCRM                   ---+\nSuporte               ---+---> ETL / ELT ---> Data Warehouse ---> BI, dashboards e consultas ad hoc\nERP financeiro        ---+"
                    },
                    {
                        "type": "text",
                        "value": "## Fonte única de verdade, na prática\n\nImagine que o time comercial calcula 'receita' somando o valor bruto dos pedidos, enquanto o financeiro calcula descontando devoluções e impostos. Sem um warehouse, cada relatório traz um número diferente para a mesma pergunta, e reuniões inteiras se perdem discutindo qual planilha está certa. No data warehouse, a métrica 'receita líquida' é modelada uma única vez, com a regra de negócio documentada e aplicada de forma consistente. Times diferentes podem fazer perguntas diferentes, mas a partir da mesma base de verdade."
                    }
                ],
                "questions": [
                    {
                        "statement": "De acordo com a definição clássica de Bill Inmon, qual conjunto de características descreve um data warehouse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Normalizado, replicado, particionado e volátil por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Orientado por assunto, integrado, variante no tempo e não volátil",
                                "isCorrect": true
                            },
                            {
                                "text": "Orientado a eventos, distribuído, elástico e volátil",
                                "isCorrect": false
                            },
                            {
                                "text": "Orientado a objetos, replicado, particionado e não integrado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa percebe que o time comercial e o time financeiro apresentam, na mesma reunião, dois números diferentes para a 'receita do trimestre', cada um a partir de uma consulta própria no sistema de vendas. Qual prática de data warehouse ataca diretamente esse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar a frequência de replicação do banco operacional, para que as consultas leiam dados mais recentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o banco de produção por um banco colunar, para reduzir o tempo de resposta das consultas analíticas",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir a métrica de receita uma vez no warehouse, com regra documentada, para todas usarem o mesmo número",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar índices compostos nas tabelas de pedidos, para acelerar as consultas de receita de cada time",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das alternativas melhor resume o papel do 'isolamento da produção' em um data warehouse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Consultas analíticas pesadas rodam no mesmo banco de produção, protegidas por um usuário de somente leitura",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultas analíticas pesadas rodam em memória cache, evitando qualquer acesso ao banco de produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultas analíticas pesadas rodam em uma réplica síncrona do banco de produção, atualizada a cada escrita",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultas analíticas pesadas rodam em um banco separado, sem competir com as transações da aplicação",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um data warehouse recebe cargas diárias de três sistemas diferentes. Seis meses depois de entrar em operação, um analista pergunta por que o warehouse ainda mostra o histórico de compras de um cliente que foi excluído do CRM há três meses. Qual característica do data warehouse explica esse comportamento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A propriedade de não volatilidade: dados carregados no warehouse não são apagados quando o registro de origem muda",
                                "isCorrect": true
                            },
                            {
                                "text": "A propriedade de integração: o warehouse cruza automaticamente os dados do CRM com os do sistema financeiro",
                                "isCorrect": false
                            },
                            {
                                "text": "A propriedade de orientação por assunto: o warehouse organiza os dados por cliente, e não por sistema de origem",
                                "isCorrect": false
                            },
                            {
                                "text": "A propriedade de particionamento: o warehouse guarda cada carga diária em uma partição física separada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual problema o data warehouse resolve ao centralizar dados de vendas, suporte, CRM e financeiro em um único modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A falta de capacidade de armazenamento nos sistemas transacionais, que impede guardar histórico",
                                "isCorrect": false
                            },
                            {
                                "text": "A falta de uma fonte única de verdade, quando cada área calcula as métricas de formas diferentes",
                                "isCorrect": true
                            },
                            {
                                "text": "A lentidão das transações de venda, causada por índices mal configurados no banco operacional",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência de rotinas de backup automatizado nos sistemas que registram pedidos e pagamentos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Arquiteturas de data warehouse: Inmon x Kimball",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Arquiteturas de data warehouse: Inmon x Kimball\n\nDepois de decidir que a empresa precisa de um data warehouse, surge a pergunta de como construí-lo. Nos anos 1990, dois autores propuseram caminhos opostos para chegar lá: Bill Inmon defendeu começar por um modelo corporativo normalizado (abordagem **top-down**), enquanto Ralph Kimball defendeu começar por data marts dimensionais entregues área por área (abordagem **bottom-up**). As duas abordagens ainda moldam como times de dados pensam arquitetura hoje."
                    },
                    {
                        "type": "text",
                        "value": "## Abordagem Inmon: top-down\n\nPara Inmon, o data warehouse é um repositório corporativo único, modelado em terceira forma normal (3FN), que integra os dados de toda a empresa antes de qualquer entrega para as áreas de negócio. Os data marts (recortes por área, como vendas ou financeiro) vêm depois, derivados desse modelo central. As vantagens dessa ordem: um modelo corporativo consistente, com uma única fonte de integração, e baixa redundância de dados. O custo: o projeto exige um esforço inicial grande de modelagem antes de qualquer área ver valor entregue."
                    },
                    {
                        "type": "text",
                        "value": "## Abordagem Kimball: bottom-up\n\nPara Kimball, o data warehouse é, na prática, a união de vários data marts dimensionais (modelados em esquema estrela), construídos incrementalmente área por área: primeiro vendas, depois financeiro, depois marketing. A integração entre os marts acontece por meio de **dimensões conformadas**, dimensões compartilhadas (como cliente, produto ou tempo) com a mesma definição em todos os marts. As vantagens: entrega de valor rápida, já no primeiro mart, e um modelo dimensional mais simples de consultar. O risco: sem disciplina na governança das dimensões conformadas, os marts podem divergir e recriar as 'ilhas de informação' que o warehouse deveria eliminar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Inmon (top-down)\", \"Kimball (bottom-up)\"], [\"Ponto de partida\", \"Modelo corporativo normalizado (3FN)\", \"Data marts dimensionais por área\"], [\"Modelagem predominante\", \"Relacional, normalizada\", \"Dimensional, esquema estrela\"], [\"Tempo até o primeiro valor entregue\", \"Mais longo, exige modelo corporativo pronto\", \"Mais curto, um mart já gera valor\"], [\"Integração entre áreas\", \"Garantida pelo modelo central desde o início\", \"Depende da disciplina com dimensões conformadas\"], [\"Risco principal\", \"Projeto longo, sem entregas incrementais\", \"Marts divergentes sem governança\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Qual abordagem escolher\n\nNa prática, poucas empresas seguem uma abordagem pura. Organizações grandes, com forte governança de dados e tempo para investir, tendem a se aproximar do modelo Inmon, construindo um núcleo corporativo sólido. Empresas menores, ou times que precisam mostrar resultado rápido, tendem a começar como Kimball, entregando um data mart por vez. Uma prática comum hoje é a **abordagem híbrida**: usar dimensões conformadas (a ideia central de Kimball) como contrato de integração, enquanto se mantém uma camada intermediária mais normalizada (a influência de Inmon) para consolidar e limpar os dados antes de moldar os marts dimensionais."
                    },
                    {
                        "type": "code",
                        "value": "Inmon (top-down):\nSistemas de origem --> Modelo corporativo 3FN --> Data mart vendas\n                                              --> Data mart financeiro\n                                              --> Data mart marketing\n\nKimball (bottom-up):\nSistemas de origem --> Data mart vendas (estrela)       --+\nSistemas de origem --> Data mart financeiro (estrela)     +--> Dimensões conformadas integram os marts\nSistemas de origem --> Data mart marketing (estrela)    --+"
                    },
                    {
                        "type": "quote",
                        "value": "Inmon começa pelo todo e desdobra nas partes; Kimball começa pelas partes e as integra pelo todo. Os dois querem chegar ao mesmo lugar: um warehouse confiável e integrado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na abordagem de Bill Inmon para construir um data warehouse, qual é o ponto de partida do projeto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um data mart dimensional da área de vendas, que depois se expande para as demais áreas",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma dimensão conformada de cliente, compartilhada entre todos os sistemas de origem",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo corporativo normalizado (3FN), que integra os dados de toda a empresa",
                                "isCorrect": true
                            },
                            {
                                "text": "Um esquema estrela único que atende simultaneamente todas as áreas de negócio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma startup precisa mostrar ao time de vendas um primeiro painel de métricas em poucas semanas, e não tem uma equipe grande de modelagem de dados. Qual abordagem de arquitetura de data warehouse tende a se encaixar melhor nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Abordagem Inmon, construindo primeiro um modelo corporativo normalizado que cubra toda a empresa",
                                "isCorrect": false
                            },
                            {
                                "text": "Abordagem híbrida, exigindo uma camada normalizada consolidada antes de qualquer entrega ao time de vendas",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma abordagem formal, deixando cada analista consultar diretamente o banco de produção do sistema de vendas",
                                "isCorrect": false
                            },
                            {
                                "text": "Abordagem Kimball, começando por um data mart dimensional de vendas e expandindo aos poucos para outras áreas",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Na abordagem bottom-up de Kimball, o que garante que os data marts de vendas e de financeiro, construídos em momentos diferentes, permaneçam integrados entre si?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O uso de dimensões conformadas, como cliente e produto, com definição e chaves iguais nos dois marts",
                                "isCorrect": true
                            },
                            {
                                "text": "O uso de um único esquema floco de neve, compartilhado fisicamente entre os dois data marts",
                                "isCorrect": false
                            },
                            {
                                "text": "A migração periódica dos dois marts para um modelo normalizado em terceira forma normal",
                                "isCorrect": false
                            },
                            {
                                "text": "A execução dos dois marts no mesmo servidor de banco de dados, o que garante consistência automática",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa cresceu rápido adotando a abordagem Kimball: cada área de negócio criou seu próprio data mart, sem um processo formal de definição conjunta das dimensões. Dois anos depois, o data mart de vendas e o de logística tratam 'cliente' com chaves e regras diferentes, e cruzar os dois exige retrabalho manual. Qual é a causa raiz desse problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O uso de esquema estrela nos dois data marts, que por natureza impede o compartilhamento de dimensões",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta de governança sobre as dimensões conformadas, que deveriam ser compartilhadas entre os marts",
                                "isCorrect": true
                            },
                            {
                                "text": "A ausência de uma tabela fato única que centralize as vendas e a logística em um só lugar",
                                "isCorrect": false
                            },
                            {
                                "text": "A escolha da abordagem bottom-up, que segundo Kimball nunca permite integrar áreas diferentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como a abordagem híbrida combina as ideias de Inmon e Kimball na prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Descarta por completo a modelagem dimensional e adota somente o modelo corporativo normalizado de Inmon",
                                "isCorrect": false
                            },
                            {
                                "text": "Constrói um único data mart gigante, substituindo tanto o modelo corporativo quanto os marts por área",
                                "isCorrect": false
                            },
                            {
                                "text": "Mantém uma camada normalizada para consolidar os dados e dimensões conformadas para integrar os marts",
                                "isCorrect": true
                            },
                            {
                                "text": "Aplica normalização em terceira forma normal dentro de cada tabela fato do próprio esquema estrela",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Data warehouse, data mart e ODS",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Data warehouse, data mart e ODS\n\n'Data warehouse', 'data mart' e 'ODS' (operational data store) são termos que aparecem juntos com frequência, e é comum confundir os três. Os três guardam dados fora dos sistemas transacionais, mas resolvem problemas diferentes: escopo (a empresa toda ou uma área), profundidade de histórico (anos ou dias) e propósito (análise estratégica ou operação do dia a dia). Entender o papel de cada um evita desenhar a arquitetura errada para o problema errado."
                    },
                    {
                        "type": "text",
                        "value": "## Data warehouse: o repositório corporativo\n\nComo visto nas aulas anteriores, o data warehouse é o repositório central que integra dados de múltiplas fontes, guarda histórico de anos e serve de fonte única de verdade para toda a empresa. É o warehouse que sustenta perguntas amplas, como 'como a receita evoluiu nos últimos cinco anos em todas as regiões'."
                    },
                    {
                        "type": "text",
                        "value": "## Data mart: o recorte por área de negócio\n\nUm data mart é um subconjunto do data warehouse, modelado para atender às perguntas de uma área específica: vendas, marketing, financeiro, logística. Ele existe para que o time de marketing, por exemplo, não precise navegar por dezenas de tabelas irrelevantes para o seu trabalho, só as dimensões e fatos que importam para campanhas e conversão.\n\nHá duas formas comuns de construir um data mart:\n\n- **Dependente**: alimentado a partir do data warehouse corporativo, herdando suas definições e seu histórico (o caminho típico na abordagem Inmon)\n- **Independente**: alimentado diretamente das fontes, sem passar por um warehouse central (o caminho típico no início da abordagem Kimball)"
                    },
                    {
                        "type": "text",
                        "value": "## ODS: integração operacional, quase em tempo real\n\nO **operational data store (ODS)** integra dados de vários sistemas operacionais, como o data warehouse faz, mas com um propósito diferente: suportar decisões operacionais do dia a dia, não análises históricas profundas. Características típicas de um ODS:\n\n- Dados atualizados com baixa latência (minutos, quase em tempo real), enquanto o warehouse costuma atualizar em lotes (diário ou por hora)\n- Retém pouco histórico, muitas vezes só o estado atual ou os últimos dias\n- Modelo de dados próximo ao operacional, com pouca ou nenhuma transformação dimensional\n- Exemplo de uso: um painel de central de atendimento mostrando pedidos em aberto agora, cruzando dados de vendas e logística em tempo quase real"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Data warehouse\", \"Data mart\", \"ODS\"], [\"Escopo\", \"Toda a empresa\", \"Uma área de negócio\", \"Operacional, entre sistemas\"], [\"Histórico\", \"Anos de dados\", \"Anos, recorte da área\", \"Pouco ou nenhum histórico\"], [\"Latência típica\", \"Horas a um dia\", \"Horas a um dia\", \"Minutos, quase em tempo real\"], [\"Uso principal\", \"Análise estratégica ampla\", \"Análise de uma área específica\", \"Decisão operacional imediata\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Sistemas de origem --> ODS --> visão operacional quase em tempo real (suporte, logística)\n\nSistemas de origem --> Data Warehouse --> Data mart vendas\n                                       --> Data mart marketing\n                                       --> Data mart financeiro"
                    },
                    {
                        "type": "quote",
                        "value": "Data warehouse é escopo (a empresa toda), data mart é recorte (uma área), ODS é velocidade (agora, não o histórico). Os três podem conviver na mesma arquitetura, cada um resolvendo um problema diferente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal diferença de escopo entre um data warehouse e um data mart?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O data warehouse guarda só o mês corrente, enquanto o data mart guarda o histórico completo da empresa",
                                "isCorrect": false
                            },
                            {
                                "text": "O data warehouse atende uma única área de negócio, enquanto o data mart integra todos os sistemas da empresa",
                                "isCorrect": false
                            },
                            {
                                "text": "O data warehouse roda em tempo real, enquanto o data mart é atualizado apenas uma vez por ano",
                                "isCorrect": false
                            },
                            {
                                "text": "O data warehouse cobre a empresa toda, enquanto o data mart é um recorte voltado a uma área específica",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O time de central de atendimento precisa ver, com no máximo alguns minutos de atraso, quais pedidos das últimas duas horas ainda estão com status 'pendente', cruzando dados do sistema de vendas com o de logística. Qual componente de arquitetura atende melhor essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um ODS, que integra os sistemas operacionais com baixa latência e pouco histórico",
                                "isCorrect": true
                            },
                            {
                                "text": "Um data warehouse corporativo, atualizado uma vez por dia durante a madrugada",
                                "isCorrect": false
                            },
                            {
                                "text": "Um data mart de vendas, modelado em esquema estrela com granularidade mensal",
                                "isCorrect": false
                            },
                            {
                                "text": "Um data mart de logística, alimentado a partir do data warehouse corporativo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um data mart 'dependente' se diferencia de um data mart 'independente' por qual característica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É alimentado diretamente pelas fontes, sem qualquer processo de extração e transformação de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "É alimentado a partir do data warehouse corporativo, herdando definições e histórico já integrados",
                                "isCorrect": true
                            },
                            {
                                "text": "É modelado em terceira forma normal, enquanto o independente usa exclusivamente esquema estrela",
                                "isCorrect": false
                            },
                            {
                                "text": "Atende múltiplas áreas de negócio ao mesmo tempo, enquanto o independente atende uma única área",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa mantém um data warehouse corporativo atualizado a cada noite. O time de operações de estoque reclama que, para decisões de reposição urgente, os dados 'de ontem' não servem: eles precisam saber o estoque de agora, cruzando o sistema de vendas com o de armazém. Qual é a melhor decisão de arquitetura para essa demanda, sem descartar o data warehouse já existente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reduzir a carga noturna do data warehouse para rodar de hora em hora, mantendo o mesmo modelo dimensional",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar todo o data warehouse para um modelo de ODS, eliminando a carga em lote e o histórico acumulado",
                                "isCorrect": false
                            },
                            {
                                "text": "Construir um ODS separado, com baixa latência e pouco histórico, dedicado a essa visão operacional de estoque",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar um data mart de estoque no data warehouse, com granularidade diária, no lugar da carga noturna atual",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente o papel do ODS em relação ao data warehouse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O ODS substitui o data warehouse em empresas pequenas, pois cobre os mesmos casos de uso com menos esforço",
                                "isCorrect": false
                            },
                            {
                                "text": "O ODS armazena o histórico de longo prazo que o data warehouse não consegue guardar por limitação de espaço",
                                "isCorrect": false
                            },
                            {
                                "text": "O ODS é uma camada de cache do data warehouse, usada apenas para acelerar consultas já processadas",
                                "isCorrect": false
                            },
                            {
                                "text": "O ODS resolve necessidades operacionais imediatas, e o warehouse resolve análises históricas mais amplas",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Armazenamento colunar x por linha",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Armazenamento colunar x por linha\n\nAlém do modelo lógico (como as tabelas se relacionam), a forma física como os dados são gravados em disco tem um impacto enorme no desempenho. Bancos relacionais tradicionais, pensados para OLTP, gravam os dados **por linha**: cada registro inteiro fica junto no disco. Bancos analíticos modernos, pensados para OLAP, gravam os dados **por coluna**: cada coluna fica junto no disco, separada das demais. Essa escolha de baixo nível explica boa parte da diferença de desempenho entre um banco transacional e um data warehouse."
                    },
                    {
                        "type": "text",
                        "value": "## Armazenamento por linha (row-oriented)\n\nEm um banco orientado a linha, como é típico em bancos relacionais usados para OLTP, todos os valores de um mesmo registro (linha) ficam fisicamente próximos no disco. Isso é ótimo para o padrão de acesso do OLTP: buscar ou gravar um pedido inteiro, um cliente inteiro, um pagamento inteiro, em uma única operação de E/S. É o formato natural para transações que leem e escrevem registros completos com frequência."
                    },
                    {
                        "type": "text",
                        "value": "## Armazenamento colunar (column-oriented)\n\nEm um banco orientado a coluna, os valores de uma mesma coluna ficam fisicamente próximos no disco, separados das demais colunas da tabela. Isso favorece diretamente o padrão de acesso do OLAP: uma consulta analítica típica lê poucas colunas (`data`, `categoria`, `valor`) de uma tabela que tem dezenas de colunas, mas varre milhões de linhas. Em um banco colunar, o motor lê do disco somente as colunas pedidas, ignorando por completo as demais; em um banco por linha, mesmo que a consulta use 3 colunas de 40, o motor precisa passar por cada linha inteira para extrair os valores.\n\nO armazenamento colunar é a base dos principais data warehouses na nuvem, como Amazon Redshift, Google BigQuery e Snowflake, e também de formatos de arquivo usados em data lakes, como Apache Parquet."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Por linha (row)\", \"Por coluna (columnar)\"], [\"Unidade física agrupada no disco\", \"Todos os valores de um registro\", \"Todos os valores de uma coluna\"], [\"Melhor para\", \"Muitas escritas e leituras de registros completos (OLTP)\", \"Leitura de poucas colunas em muitas linhas (OLAP)\"], [\"Compressão típica\", \"Menor, valores de tipos diferentes misturados\", \"Maior, valores do mesmo tipo e domínio juntos\"], [\"Exemplo de uso\", \"Banco transacional de um e-commerce\", \"Data warehouse analítico\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que a compressão rende mais no formato colunar\n\nDentro de uma única coluna, os valores tendem a se repetir ou seguir um padrão: uma coluna `estado` tem só um punhado de valores distintos, uma coluna `status` idem. Quando esses valores ficam fisicamente juntos, técnicas de compressão funcionam muito melhor:\n\n- **Codificação por dicionário**: substitui valores repetidos (como nomes de estado) por códigos curtos\n- **Run-length encoding (RLE)**: substitui sequências repetidas do mesmo valor por um único par (valor, quantidade)\n\nO resultado prático é menos bytes lidos do disco por consulta, o que significa consultas analíticas mais rápidas, mesmo variando sobre bilhões de linhas. Em um banco por linha, cada registro mistura tipos diferentes (texto, número, data), o que reduz a eficiência dessas mesmas técnicas de compressão."
                    },
                    {
                        "type": "code",
                        "value": "Tabela lógica:\n\nid | data       | categoria    | valor\n1  | 2024-01-05 | Eletronicos  | 350.00\n2  | 2024-01-05 | Livros       | 40.00\n3  | 2024-01-06 | Eletronicos  | 210.00\n\nArmazenamento por linha (cada registro inteiro junto):\n[1, 2024-01-05, Eletronicos, 350.00] [2, 2024-01-05, Livros, 40.00] [3, 2024-01-06, Eletronicos, 210.00]\n\nArmazenamento colunar (cada coluna inteira junta):\nid:        [1, 2, 3]\ndata:      [2024-01-05, 2024-01-05, 2024-01-06]\ncategoria: [Eletronicos, Livros, Eletronicos]\nvalor:     [350.00, 40.00, 210.00]\n\nUma consulta que soma 'valor' por 'categoria' lê apenas essas duas colunas no formato colunar,\ne não precisa tocar em 'id' nem em 'data'."
                    },
                    {
                        "type": "quote",
                        "value": "Analytics lê poucas colunas de muitas linhas; o armazenamento colunar guarda exatamente assim, coluna a coluna, e por isso varre menos dados e comprime melhor do que o armazenamento por linha."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza o armazenamento orientado a coluna (columnar)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os valores de uma mesma coluna ficam fisicamente próximos no disco, separados das demais colunas",
                                "isCorrect": true
                            },
                            {
                                "text": "Os valores de um mesmo registro ficam fisicamente próximos no disco, separados dos demais registros",
                                "isCorrect": false
                            },
                            {
                                "text": "Os valores são distribuídos aleatoriamente no disco, sem nenhum agrupamento físico definido",
                                "isCorrect": false
                            },
                            {
                                "text": "Os valores são replicados em dois discos diferentes, um para leitura e outro para escrita",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de vendas tem 40 colunas. Um relatório mensal executa uma consulta que soma o valor de vendas agrupado por categoria, sobre 500 milhões de linhas. Rodando em um banco colunar, por que essa consulta tende a ser mais rápida do que no mesmo banco armazenado por linha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O motor cria automaticamente um índice B-tree sobre a coluna de categoria antes de cada consulta",
                                "isCorrect": false
                            },
                            {
                                "text": "O motor lê do disco apenas as colunas usadas na consulta, sem tocar nas outras colunas da tabela",
                                "isCorrect": true
                            },
                            {
                                "text": "O motor distribui a consulta em paralelo entre vários servidores, o que não acontece em bancos por linha",
                                "isCorrect": false
                            },
                            {
                                "text": "O motor mantém toda a tabela em memória RAM, eliminando qualquer leitura do disco durante a consulta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que técnicas de compressão como codificação por dicionário e run-length encoding funcionam melhor em um banco colunar do que em um banco por linha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o banco colunar usa um algoritmo de compressão mais avançado, indisponível para bancos por linha",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o banco colunar grava os dados em disco de estado sólido, que comprime nativamente qualquer arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque valores de uma mesma coluna tendem a se repetir ou seguir um padrão, e ficam fisicamente agrupados",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o banco colunar elimina colunas duplicadas da tabela antes de gravar qualquer dado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe migrou o data warehouse de um banco por linha para um banco colunar, mantendo o mesmo modelo de dados. As consultas de BI, que agregam poucas colunas sobre bilhões de linhas, ficaram várias vezes mais rápidas. Já um processo de integração que atualiza registros completos, um a um, em alta frequência, ficou mais lento que antes. Qual explicação é mais coerente com as características de um banco colunar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Bancos colunares são sempre mais lentos em leitura e escrita, e a melhora nas consultas de BI foi apenas coincidência",
                                "isCorrect": false
                            },
                            {
                                "text": "Bancos colunares não suportam escrita direta, então toda atualização precisa passar por um banco auxiliar por linha",
                                "isCorrect": false
                            },
                            {
                                "text": "Bancos colunares só aplicam compressão durante a leitura, então a escrita nunca deveria mudar de desempenho",
                                "isCorrect": false
                            },
                            {
                                "text": "Bancos colunares favorecem a leitura de poucas colunas em muitas linhas, mas custam mais para escrever registros inteiros",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual das alternativas associa corretamente uma tecnologia ao seu formato de armazenamento predominante?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon Redshift, data warehouse na nuvem que armazena os dados de forma colunar",
                                "isCorrect": true
                            },
                            {
                                "text": "PostgreSQL, banco relacional que, em sua configuração padrão, armazena os dados de forma colunar",
                                "isCorrect": false
                            },
                            {
                                "text": "MongoDB, banco de documentos que, em sua configuração padrão, armazena os dados de forma colunar",
                                "isCorrect": false
                            },
                            {
                                "text": "MySQL, banco relacional que, em sua configuração padrão, armazena os dados de forma colunar",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Modelagem dimensional: o esquema estrela",
        "aulas": [
            {
                "titulo": "Modelagem dimensional (Kimball): a ideia central",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Modelagem dimensional (Kimball): a ideia central\n\nQuando o assunto é transação (OLTP), o modelo relacional normalizado é o correto: ele existe para eliminar redundância e proteger a integridade dos dados a cada `INSERT` ou `UPDATE`. Mas quando o assunto muda para analytics, com perguntas como \"quanto vendemos, por região, no último trimestre?\", esse mesmo modelo normalizado vira um obstáculo: dezenas de tabelas, joins profundos, consultas difíceis de escrever e lentas de rodar.\n\nA modelagem dimensional, formalizada por Ralph Kimball, resolve isso com um objetivo diferente: não é eliminar redundância, é facilitar a consulta e entregar desempenho para quem faz perguntas analíticas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Modelagem normalizada (OLTP)\",\"Modelagem dimensional (Kimball)\"],[\"Objetivo principal: integridade e não redundância\",\"Objetivo principal: facilidade de consulta e desempenho\"],[\"Público: aplicações transacionais\",\"Público: analistas e ferramentas de BI\"],[\"Estrutura: muitas tabelas normalizadas\",\"Estrutura: poucas tabelas largas (fato e dimensões)\"],[\"Consulta típica: poucas linhas, muitos joins\",\"Consulta típica: muitas linhas, poucos joins\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Fatos e dimensões, em resumo\n\nTodo esquema dimensional se apoia em dois papéis complementares:\n\n- **Fato**: guarda as medidas numéricas de um processo de negócio (quanto foi vendido, quantos itens, qual o valor do frete) mais as chaves para as dimensões envolvidas.\n- **Dimensão**: guarda o contexto descritivo dessas medidas (qual produto, qual cliente, em qual loja, em qual data).\n\nAs próximas aulas deste módulo detalham cada um desses papéis."
                    },
                    {
                        "type": "quote",
                        "value": "Modelagem dimensional troca a eliminação de redundância pela facilidade de consulta: é o modelo certo para responder \"quanto\", \"quando\", \"onde\" e \"por quem\" em grandes volumes de dados."
                    },
                    {
                        "type": "code",
                        "value": "MEDIR x CONTEXTUALIZAR\n\n   [ FATO ]                      [ DIMENSAO ]\n   medida numerica                atributo descritivo\n   ------------------              ---------------------\n   valor_vendido                   nome_produto\n   quantidade                      categoria\n   valor_desconto                  cidade_loja\n\n   responde \"quanto\"                responde \"quem, o que,\n                                     quando, onde\""
                    },
                    {
                        "type": "text",
                        "value": "## Onde isso aparece na prática\n\nEsquemas dimensionais são o desenho padrão de data warehouses como Amazon Redshift, Google BigQuery e Snowflake, e também da camada de modelagem da maioria das ferramentas de BI, que esperam encontrar fatos e dimensões, não um modelo normalizado. A referência clássica sobre o assunto é o livro The Data Warehouse Toolkit, de Ralph Kimball."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o objetivo central da modelagem dimensional de Kimball, em contraste com a normalização usada em bancos OLTP?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Facilitar a consulta e o desempenho para análises, aceitando alguma redundância nas dimensões.",
                                "isCorrect": true
                            },
                            {
                                "text": "Eliminar toda redundância de dados para garantir a integridade das transações do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir ao máximo o espaço em disco ocupado pelo banco de dados analítico da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar os dados exatamente como o sistema de origem os gera, sem nenhuma transformação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de analistas pergunta com frequência: \"total de vendas por região, por mês e por categoria de produto\". Qual estrutura sustenta melhor esse tipo de consulta, com bom desempenho e simplicidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um esquema dimensional com uma tabela fato de vendas central e dimensões de região, tempo e produto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um esquema totalmente normalizado em terceira forma normal, igual ao sistema transacional de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma única tabela fato sem nenhuma dimensão, com todos os atributos descritivos embutidos nela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Várias tabelas fato conectadas diretamente umas às outras, sem nenhuma tabela dimensão no meio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para o processo de negócio \"vendas\", qual par associa corretamente um fato (medida) e uma dimensão (contexto)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fato: valor vendido na transação. Dimensão: produto vendido na transação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fato: nome do produto vendido. Dimensão: valor total vendido na transação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fato: categoria do cliente. Dimensão: quantidade de itens vendidos na transação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fato e dimensão são sempre a mesma tabela física, só muda o nome usado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a modelagem dimensional aceita, de propósito, alguma redundância nas tabelas dimensão em vez de normalizá-las por completo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque menos joins numa consulta analítica compensam a redundância extra nas dimensões.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque bancos de dados analíticos não suportam a criação de chaves estrangeiras entre tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a redundância nas dimensões elimina a necessidade de existir uma tabela fato no modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque normalizar as dimensões impede o uso de comandos SQL padrão nas consultas analíticas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa migrou o esquema normalizado do sistema transacional direto para o data warehouse, sem redesenho. Os analistas reclamam de consultas lentas, com muitos joins. Qual recomendação está alinhada à ideia central da modelagem dimensional?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Redesenhar o modelo em fatos e dimensões, priorizando poucos joins e facilidade de consulta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter o esquema normalizado e apenas criar mais índices nas chaves estrangeiras existentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a capacidade de hardware do banco para compensar a quantidade de joins nas consultas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar todas as dimensões e concentrar os dados numa única tabela fato bem larga.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tabelas fato: o que medem",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tabelas fato: o que medem\n\nA tabela fato é o centro do esquema estrela: cada linha registra um evento de negócio (uma venda, um envio, um clique) por meio de duas coisas: as chaves estrangeiras para as dimensões que dão contexto ao evento, e as medidas numéricas desse evento (quanto, quantos, com que desconto)."
                    },
                    {
                        "type": "text",
                        "value": "## O que compõe uma linha de fato\n\nUma linha típica de tabela fato combina:\n\n- **Chaves estrangeiras**: uma para cada dimensão envolvida no evento (produto, cliente, loja, data).\n- **Medidas**: os números que descrevem o evento, como `quantidade`, `valor_bruto`, `valor_desconto` e `valor_liquido`.\n\nO número de chaves estrangeiras é, tipicamente, muito menor que o número de colunas nas dimensões que elas referenciam: é isso que mantém a fato compacta mesmo com bilhões de linhas."
                    },
                    {
                        "type": "text",
                        "value": "## Tipos de medida, em resumo\n\nNem toda medida se comporta da mesma forma quando somada. Por agora, valem três categorias (o Módulo 6 aprofunda cada uma):\n\n- **Aditivas**: podem ser somadas em qualquer dimensão, como `valor_vendido` e `quantidade`.\n- **Semi-aditivas**: podem ser somadas em algumas dimensões, mas não em todas, como um saldo de estoque, que não se soma ao longo do tempo.\n- **Não aditivas**: nunca fazem sentido somadas, como uma taxa percentual ou um preço unitário.\n\nSaber em qual categoria uma medida cai evita agregações que produzem números sem sentido."
                    },
                    {
                        "type": "code",
                        "value": "CREATE TABLE fato_vendas (\n    venda_id        BIGINT        PRIMARY KEY,\n    data_key        INT           NOT NULL REFERENCES dim_tempo(data_key),\n    produto_key     INT           NOT NULL REFERENCES dim_produto(produto_key),\n    cliente_key     INT           NOT NULL REFERENCES dim_cliente(cliente_key),\n    loja_key        INT           NOT NULL REFERENCES dim_loja(loja_key),\n    quantidade      INT           NOT NULL,\n    valor_bruto     NUMERIC(12,2) NOT NULL,\n    valor_desconto  NUMERIC(12,2) NOT NULL DEFAULT 0,\n    valor_liquido   NUMERIC(12,2) NOT NULL\n);"
                    },
                    {
                        "type": "code",
                        "value": "venda_id | data_key | produto_key | cliente_key | loja_key | quantidade | valor_liquido\n---------+----------+-------------+-------------+----------+------------+---------------\n   90231 | 20260305 |         441 |        7781 |       12 |          2 |        259.80\n   90232 | 20260305 |         102 |        3390 |       12 |          1 |         89.90\n   90233 | 20260306 |         441 |        2205 |        7 |          3 |        389.70"
                    },
                    {
                        "type": "quote",
                        "value": "A tabela fato é sobretudo números e chaves: se uma coluna é um texto descritivo que não muda a cada evento, ela provavelmente pertence a uma dimensão, não à fato."
                    },
                    {
                        "type": "text",
                        "value": "## Granularidade, em resumo\n\nToda medida da fato só faz sentido em relação à granularidade da linha: o que exatamente um registro representa (um item de pedido? um pedido inteiro? uma venda por dia?). A Aula 5 deste módulo trata desse ponto em detalhe, mas ele já nasce junto com o desenho da tabela fato: é a primeira pergunta a responder, antes de listar colunas."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que uma tabela fato armazena, em essência?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Medidas numéricas do processo de negócio e as chaves estrangeiras para as dimensões relacionadas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas texto descritivo sobre os eventos de negócio, sem nenhuma chave estrangeira associada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente as chaves primárias das tabelas dimensão, sem nenhuma medida numérica registrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma cópia completa de todas as dimensões relacionadas ao evento de negócio medido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um varejista quer medir quanto cada transação gerou de receita, associada a produto, loja, cliente e data. Quais colunas a linha da fato_vendas deveria conter?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Chaves para produto, loja, cliente e data, mais medidas como quantidade e valor vendido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Somente o valor total vendido na transação, sem nenhuma referência às dimensões envolvidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do produto, o nome da loja e o nome do cliente escritos direto na tabela fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas a data da venda e o identificador da transação, sem nenhuma medida numérica.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é uma medida numérica adequada para compor uma tabela fato de vendas, e não um atributo de dimensão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A quantidade de itens vendidos em cada transação.",
                                "isCorrect": true
                            },
                            {
                                "text": "A categoria à qual o produto vendido pertence.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome da loja onde a transação aconteceu.",
                                "isCorrect": false
                            },
                            {
                                "text": "O segmento de mercado ao qual o cliente pertence.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro júnior sugere gravar o endereço completo da loja e o nome do gerente direto na fato_vendas, para evitar um join. Por que isso vai contra a modelagem dimensional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Atributos descritivos como endereço e gerente pertencem à dimensão loja, não à tabela fato.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque tabelas fato não podem conter nenhuma coluna de texto, apenas colunas numéricas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso impede a criação de chaves estrangeiras dentro da tabela fato de vendas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque bancos analíticos não aceitam colunas de texto maiores que cinquenta caracteres.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma fato_pedido_item precisa registrar, para cada item de um pedido de e-commerce, as medidas do evento de venda. Qual conjunto de colunas representa medidas adequadas para essa tabela fato?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "quantidade_itens, valor_unitario, valor_desconto e valor_frete_rateado.",
                                "isCorrect": true
                            },
                            {
                                "text": "quantidade_itens, nome_produto, valor_desconto e categoria_produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "nome_cliente, cidade_entrega, canal_venda, nome_produto e bandeira_loja.",
                                "isCorrect": false
                            },
                            {
                                "text": "id_pedido, id_cliente, id_produto, id_loja, id_vendedor e id_canal_venda.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tabelas dimensão: o contexto",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tabelas dimensão: o contexto\n\nSe a fato responde \"quanto\", a dimensão responde \"quem, o que, quando e onde\". Uma tabela dimensão guarda o contexto descritivo de um evento de negócio: os atributos que um analista usa para filtrar, agrupar e rotular as medidas da fato num relatório."
                    },
                    {
                        "type": "text",
                        "value": "## Quem, o que, quando, onde\n\nCada dimensão tipicamente responde um desses eixos:\n\n- **Quem**: `dim_cliente` (nome, segmento, faixa etária).\n- **O que**: `dim_produto` (nome, categoria, marca).\n- **Quando**: `dim_tempo` (dia, mês, trimestre, ano).\n- **Onde**: `dim_loja` (cidade, região, bandeira).\n\nUm mesmo esquema estrela pode ter várias dimensões para o mesmo eixo, por exemplo uma dim_loja de origem e uma dim_loja de destino num envio, cada uma com seu próprio papel na consulta."
                    },
                    {
                        "type": "text",
                        "value": "## Atributos descritivos e a chave substituta\n\nDimensões são tabelas largas: dezenas de colunas majoritariamente textuais, pensadas para leitura humana e para aparecer em filtros e legendas de gráfico, nada de códigos sem tradução.\n\nA chave primária de uma dimensão normalmente é uma chave substituta (surrogate key): um inteiro sem nenhum significado de negócio, gerado pelo próprio processo de carga. A chave natural do sistema de origem, como o SKU, o CPF ou o código da loja, continua presente na dimensão, mas como um atributo comum, não como chave primária."
                    },
                    {
                        "type": "code",
                        "value": "CREATE TABLE dim_produto (\n    produto_key     INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    produto_id      VARCHAR(20)  NOT NULL,\n    nome            VARCHAR(120) NOT NULL,\n    categoria       VARCHAR(60)  NOT NULL,\n    subcategoria    VARCHAR(60)  NOT NULL,\n    marca           VARCHAR(60)  NOT NULL,\n    unidade_medida  VARCHAR(10)  NOT NULL\n);\n\n-- produto_key: chave substituta, usada pela tabela fato\n-- produto_id: chave natural (SKU) do sistema de origem"
                    },
                    {
                        "type": "code",
                        "value": "data_key  | data_completa | dia_semana | mes | trimestre | ano  | eh_feriado\n----------+---------------+------------+-----+-----------+------+-----------\n 20260101 |    2026-01-01 |     quinta |   1 |        T1 | 2026 |       sim\n 20260305 |    2026-03-05 |     quinta |   3 |        T1 | 2026 |       nao\n 20260306 |    2026-03-06 |      sexta |   3 |        T1 | 2026 |       nao"
                    },
                    {
                        "type": "quote",
                        "value": "Dimensões são as perguntas que um analista faz; a dimensão de tempo é a única que aparece em quase todo esquema estrela, porque quase toda pergunta de negócio começa com \"quando\"."
                    },
                    {
                        "type": "text",
                        "value": "## Por que uma dimensão de data separada\n\nSeria possível guardar uma coluna de data direto na fato e extrair mês, trimestre e feriados com funções de data a cada consulta. A dim_tempo existe para não repetir essa lógica: ela centraliza o calendário, incluindo exceções como feriados e calendários fiscais, numa única tabela, populada com antecedência, que toda consulta reaproveita."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza os atributos de uma tabela dimensão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "São majoritariamente descritivos e textuais, usados para filtrar e agrupar as medidas.",
                                "isCorrect": true
                            },
                            {
                                "text": "São majoritariamente medidas numéricas que podem ser somadas diretamente nas consultas.",
                                "isCorrect": false
                            },
                            {
                                "text": "São sempre chaves estrangeiras que apontam exclusivamente para outras tabelas dimensão.",
                                "isCorrect": false
                            },
                            {
                                "text": "São colunas calculadas em tempo de consulta a partir dos valores da tabela fato.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é um exemplo típico de dimensão respondendo \"quando\" em um esquema estrela de vendas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma dimensão de data, com atributos como dia da semana, mês, trimestre e ano.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma dimensão de loja, com atributos como cidade, região e bandeira comercial.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma dimensão de cliente, com atributos como faixa etária e segmento de mercado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma dimensão de produto, com atributos como categoria, marca e unidade de medida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a modelagem dimensional usa uma chave substituta (surrogate key) como chave primária da dimensão, em vez da chave natural do sistema de origem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ela desacopla a dimensão da chave de origem, permitindo lidar com mudanças e integrar fontes diferentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela ocupa menos espaço em disco do que qualquer chave natural, independente do tipo de dado usado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A chave natural não pode ser referenciada como chave estrangeira por limitação do SQL padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela é exigida pelas ferramentas de BI para conseguir montar gráficos corretamente a partir dos dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A dimensão de produto usa o SKU do ERP como chave primária, referenciada pela fato. O ERP será trocado e todos os SKUs vão mudar de formato. Qual problema isso expõe?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A troca do SKU quebraria a ligação com o histórico na fato, problema que a chave substituta evitaria.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum problema seria causado, porque chaves naturais de sistemas de origem nunca mudam de formato.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema só ocorreria se a tabela fato não tivesse índices nas colunas de texto do SKU.",
                                "isCorrect": false
                            },
                            {
                                "text": "A fato precisaria ser recriada do zero a cada carga, com ou sem chave substituta na dimensão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma tabela de dimensão de data pré-construída costuma ser preferida a derivar dia da semana, mês e trimestre com funções de data em cada consulta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Centraliza os atributos de calendário, incluindo exceções como feriados, numa tabela única.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque funções de data não existem na maioria dos bancos de dados analíticos usados hoje.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a tabela fato não aceita nenhuma coluna do tipo data como chave estrangeira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso elimina a necessidade de guardar qualquer data em outra tabela do modelo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O esquema estrela na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O esquema estrela na prática\n\nCom fatos e dimensões definidos, o esquema estrela é simplesmente a forma de conectá-los: uma tabela fato no centro, referenciando diretamente cada tabela dimensão envolvida no processo de negócio, sem tabelas intermediárias entre elas."
                    },
                    {
                        "type": "code",
                        "value": "                    dim_tempo\n                        |\n                        |\n   dim_cliente ------ fato_vendas ------ dim_produto\n                        |\n                        |\n                    dim_loja\n\nfato_vendas: data_key, cliente_key, produto_key, loja_key,\n             quantidade, valor_bruto, valor_desconto, valor_liquido"
                    },
                    {
                        "type": "text",
                        "value": "## Por que \"estrela\"\n\nO nome vem do desenho: a fato no centro e cada dimensão ligada a ela por uma única linha, sem passar por outras tabelas no caminho. O resultado lembra os raios de uma estrela partindo de um núcleo. Quando uma dimensão é, ela mesma, quebrada em várias tabelas normalizadas relacionadas entre si, o desenho deixa de ser uma estrela simples: essa variação tem nome próprio e volta com detalhe no próximo módulo."
                    },
                    {
                        "type": "code",
                        "value": "SELECT\n    dp.categoria,\n    dt.mes,\n    dt.ano,\n    dl.cidade,\n    SUM(fv.valor_liquido) AS receita_total,\n    SUM(fv.quantidade)    AS itens_vendidos\nFROM fato_vendas fv\nJOIN dim_produto dp ON dp.produto_key = fv.produto_key\nJOIN dim_tempo   dt ON dt.data_key    = fv.data_key\nJOIN dim_loja    dl ON dl.loja_key    = fv.loja_key\nWHERE dt.ano = 2026\nGROUP BY dp.categoria, dt.mes, dt.ano, dl.cidade\nORDER BY receita_total DESC;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica da consulta\",\"Esquema estrela\",\"Esquema normalizado (fonte OLTP)\"],[\"Joins para vendas por categoria e mês\",\"Um join por dimensão envolvida\",\"Vários joins encadeados por dimensão\"],[\"Profundidade dos joins\",\"Sempre um nível (fato -> dimensão)\",\"Múltiplos níveis, tabela após tabela\"],[\"Familiaridade para o analista de BI\",\"Alta, mapeia direto para o dashboard\",\"Baixa, exige conhecer o esquema fonte\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "No esquema estrela, toda dimensão fica a exatamente um join de distância da fato: é isso que torna a consulta simples e previsível, mesmo quando o número de dimensões cresce."
                    },
                    {
                        "type": "text",
                        "value": "## Onde as ferramentas de BI se encaixam\n\nDashboards de ferramentas de BI mapeiam quase diretamente para o esquema estrela: medidas vêm da fato, atributos de filtro e agrupamento vêm das dimensões. É por isso que data warehouses como Amazon Redshift, Google BigQuery e Snowflake, junto com a camada semântica das ferramentas de BI, assumem esse desenho como padrão."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que o esquema com uma tabela fato central cercada de dimensões recebe o nome de \"esquema estrela\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque, no diagrama, a fato fica no centro e as dimensões se espalham ao redor, como os raios de uma estrela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque cada tabela dimensão deve ter exatamente cinco atributos obrigatórios, como as pontas de uma estrela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a consulta SQL usa o operador de selecionar tudo para trazer todas as colunas de uma vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque as dimensões ficam organizadas em camadas concêntricas ao redor da fato, como órbitas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta precisa de \"receita total por categoria de produto, por mês e por cidade da loja\". Num esquema estrela bem desenhado, quantos joins essa consulta tipicamente precisa entre a fato e cada dimensão envolvida?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um join direto entre a fato e cada dimensão envolvida, sem tabelas intermediárias no caminho.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dois ou mais joins em sequência por dimensão, pois as dimensões ficam normalizadas em subtabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum join, pois os atributos de categoria e cidade já ficam armazenados na própria fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um único join geral que traz todas as dimensões do modelo ao mesmo tempo, numa tabela virtual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual alternativa descreve corretamente como uma consulta analítica típica usa o esquema estrela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Faz join da fato com as dimensões necessárias, filtra e agrupa pelos atributos delas, e agrega as medidas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Agrupa apenas por colunas da própria tabela fato, sem nunca referenciar nenhuma dimensão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Precisa varrer todas as dimensões do modelo a cada execução, mesmo as que não aparecem no filtro aplicado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui os joins por uma subconsulta correlacionada executada para cada linha da tabela fato.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que melhor sustenta a ideia de que o esquema estrela facilita o trabalho do analista de BI ao montar um gráfico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O analista arrasta atributos de dimensões e uma medida da fato para montar o gráfico, sem escrever joins.",
                                "isCorrect": true
                            },
                            {
                                "text": "O analista precisa escrever manualmente uma nova view normalizada a cada gráfico novo que deseja montar.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ferramenta de BI lê diretamente os arquivos de log do banco para montar o gráfico exibido.",
                                "isCorrect": false
                            },
                            {
                                "text": "O analista só consegue montar gráficos usando atributos de uma única dimensão por vez.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um relatório junta fato_vendas a dim_produto, dim_loja e dim_tempo sem problema, mas ao filtrar por categoria do produto passa a exigir três joins adicionais a partir de dim_produto. O que isso indica sobre o modelo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A dimensão produto foi provavelmente dividida em tabelas normalizadas, fugindo do esquema estrela puro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Indica que a tabela fato está no grão errado e precisa ser reconstruída do zero pela equipe de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Indica que faltam índices nas colunas de medida da tabela fato de vendas da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Indica que o banco de dados escolhido não tem suporte a esquemas do tipo estrela.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O grão (grain) da tabela fato",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O grão (grain) da tabela fato\n\nO grão de uma tabela fato é a definição exata do que uma única linha representa. É a primeira decisão de design de qualquer fato, tomada antes de escolher dimensões ou medidas, porque toda medida só faz sentido em relação ao grão da linha em que ela vive."
                    },
                    {
                        "type": "quote",
                        "value": "Declarar o grão é a primeira decisão de design de uma tabela fato: quais dimensões usar e quais medidas incluir vêm depois, nunca antes."
                    },
                    {
                        "type": "text",
                        "value": "## O que uma linha representa\n\nO grão se declara numa frase simples, do tipo \"uma linha por X\":\n\n- \"Uma linha por item de pedido\" (grão fino, no nível do produto dentro do pedido).\n- \"Uma linha por pedido\" (grão mais grosso, um total por pedido inteiro).\n- \"Uma linha por produto, por loja, por dia\" (grão de snapshot periódico).\n\nMudar a frase muda completamente quais colunas fazem sentido na tabela."
                    },
                    {
                        "type": "code",
                        "value": "-- grão fino: uma linha por item de pedido\nCREATE TABLE fato_venda_item (\n    pedido_id     BIGINT NOT NULL,\n    item_seq      INT    NOT NULL,\n    produto_key   INT    NOT NULL,\n    quantidade    INT    NOT NULL,\n    valor_item    NUMERIC(12,2) NOT NULL,\n    PRIMARY KEY (pedido_id, item_seq)\n);\n\n-- grão agregado: uma linha por loja, por dia\nCREATE TABLE fato_venda_dia (\n    data_key      INT NOT NULL,\n    loja_key      INT NOT NULL,\n    qtd_pedidos   INT NOT NULL,\n    valor_total   NUMERIC(14,2) NOT NULL,\n    PRIMARY KEY (data_key, loja_key)\n);"
                    },
                    {
                        "type": "text",
                        "value": "## Misturar grãos: o erro clássico\n\nO erro mais comum em tabelas fato é misturar níveis de detalhe diferentes na mesma tabela, por exemplo, algumas linhas representando um pedido inteiro e outras representando itens isolados desse mesmo pedido. Ao somar a medida de valor sem perceber isso, o total do pedido e o total dos seus itens se somam juntos, e o resultado sai maior do que o real. A tabela fato precisa de um grão único e consistente em todas as suas linhas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Grão fino (atômico)\",\"Grão agregado\"],[\"Flexibilidade para perguntas novas\",\"Alta, qualquer corte é possível\",\"Baixa, limitada ao que foi pré-somado\"],[\"Tamanho da tabela\",\"Maior, uma linha por evento\",\"Menor, uma linha por resumo\"],[\"Desempenho em perguntas já conhecidas\",\"Bom, mas exige agregar na consulta\",\"Ótimo, o resumo já está pronto\"],[\"Risco ao mudar de ideia depois\",\"Baixo, o detalhe já está salvo\",\"Alto, pode exigir reprocessar o histórico\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Impacto do grão nas medidas\n\nO grão decide quais agregações fazem sentido. Uma medida como valor_liquido soma bem no grão de item de pedido; uma média de preço unitário, porém, só é válida se calculada no grão certo, nunca a partir de uma soma feita num grão diferente do original. Trocar o grão depois de a tabela estar em produção normalmente exige reprocessar todo o histórico, por isso vale investir tempo nessa decisão antes de criar a primeira coluna."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa \"definir o grão\" de uma tabela fato?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Definir o que uma única linha da tabela representa, antes de escolher dimensões e medidas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir o tamanho máximo em bytes que a tabela fato pode ocupar em disco do servidor de produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir quantas tabelas dimensão a tabela fato pode referenciar como limite máximo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir a ordem em que as colunas de medida devem aparecer na tabela fato.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe começa a desenhar a fato_vendas escolhendo dimensões e colunas direto, sem declarar o grão antes. Seguindo o processo de modelagem dimensional, qual é o risco dessa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fica ambíguo o que cada linha representa, o que facilita misturar níveis de detalhe na tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum risco real, porque o grão pode ser inferido automaticamente pelo banco na primeira carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "O único risco é a tabela receber um nome inadequado, sem nenhum impacto na modelagem em si.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco existe apenas quando a tabela fato tem mais de uma dimensão de tempo associada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A fato_pedidos tem algumas linhas representando um pedido inteiro, com o valor total, e outras representando itens individuais, com o valor de cada item. Qual problema esse desenho causa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Somar a coluna de valor gera contagem duplicada, pois pedido e itens do mesmo pedido se somam juntos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum problema, desde que a tabela tenha uma chave substituta bem definida em cada dimensão envolvida.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema se resolve automaticamente ao criar um índice na coluna de valor da fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema só afeta consultas filtradas por data, nas demais o resultado fica correto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Kimball recomenda declarar a tabela fato no grão mais atômico possível capturado pelo processo de negócio. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O grão atômico preserva o máximo de detalhe, respondendo perguntas novas sem refazer a fato.",
                                "isCorrect": true
                            },
                            {
                                "text": "O grão atômico sempre ocupa menos espaço em disco do que qualquer grão agregado equivalente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grão atômico elimina a necessidade de existir qualquer tabela dimensão no modelo estrela.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grão atômico é o único nível aceito pelas ferramentas de BI mais usadas atualmente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A fato_estoque_diario tem grão \"uma linha por produto, por depósito, por dia\", com a medida quantidade_em_estoque. Um analista soma essa medida ao longo de todos os dias do mês para reportar o estoque total mensal. O que está errado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cada dia representa uma posição de estoque, não um evento acumulável, então somar os dias não é válido.",
                                "isCorrect": true
                            },
                            {
                                "text": "O problema é que a tabela deveria ter sido criada com grão mensal desde o início do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é a ausência de uma dimensão de tempo associada à fato_estoque_diario nesse modelo de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema desaparece se a consulta agrupar por produto antes de somar os dias do mês.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Dimensões a fundo",
        "aulas": [
            {
                "titulo": "Esquema floco de neve x estrela",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Esquema floco de neve x estrela\n\nNo módulo anterior você modelou o esquema estrela: uma tabela fato no centro, cercada de dimensões desnormalizadas, cada uma resolvida numa única tabela larga. Essa não é a única forma de organizar uma dimensão. Quando os atributos de uma dimensão têm sua própria hierarquia de dependência (um produto pertence a uma categoria, que pertence a um departamento), é possível normalizar essa hierarquia em tabelas separadas. O resultado se chama esquema em floco de neve (snowflake schema), e esta aula trata da escolha entre os dois."
                    },
                    {
                        "type": "text",
                        "value": "## O que muda no floco de neve\n\nNo esquema estrela, a dimensão `dim_produto` carrega `categoria` e `departamento` como colunas de texto, repetidas em cada linha de produto. No floco de neve, essas colunas saem da tabela produto e viram tabelas próprias (`dim_categoria`, `dim_departamento`), ligadas por chave estrangeira em formato de hierarquia. O nome vem da forma do diagrama: uma dimensão que se ramifica em sub-dimensões lembra os galhos de um floco de neve, em vez da estrela de pontas únicas do esquema anterior.\n\nCada nível da hierarquia vira uma tabela própria. Isso reduz a redundância dos dados, mas aumenta o número de joins necessário para reconstruir o contexto completo de um produto numa consulta."
                    },
                    {
                        "type": "code",
                        "value": "Estrela (dimensao produto desnormalizada):\n\n              DIM_TEMPO\n                  |\nDIM_CLIENTE -- FATO_VENDAS -- DIM_LOJA\n                  |\n             DIM_PRODUTO\n        (sk_produto, nome, categoria,\n         departamento, fabricante)\n\nFloco de neve (dimensao produto normalizada):\n\nDIM_CLIENTE -- FATO_VENDAS -- DIM_LOJA\n                  |\n             DIM_PRODUTO\n        (sk_produto, nome, sk_categoria)\n                  |\n            DIM_CATEGORIA\n        (sk_categoria, nome, sk_departamento)\n                  |\n           DIM_DEPARTAMENTO\n        (sk_departamento, nome)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Esquema estrela\",\"Esquema floco de neve\"],[\"Estrutura da dimensão\",\"Desnormalizada, uma tabela larga\",\"Normalizada, várias tabelas por hierarquia\"],[\"Joins numa consulta típica\",\"Poucos: fato mais dimensões diretas\",\"Mais: dimensão mais cada subnível\"],[\"Redundância de dados\",\"Maior, atributos repetem por linha\",\"Menor, cada nível existe uma vez só\"],[\"Simplicidade para quem consulta\",\"Alta, poucas tabelas para entender\",\"Menor, exige navegar pela hierarquia\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando escolher cada um\n\nO esquema estrela é a escolha padrão na modelagem dimensional: menos joins, consultas mais simples de escrever, e ferramentas de BI navegam melhor num modelo raso. O floco de neve compensa quando a dimensão é grande e a redundância pesa de verdade (uma `dim_produto` com milhões de linhas e uma hierarquia profunda), ou quando um atributo de nível superior muda com frequência e precisa ser atualizado num único lugar: mudar o nome de um departamento numa tabela normalizada é um `UPDATE` só, enquanto numa dimensão desnormalizada seria um `UPDATE` em massa em todas as linhas de produto daquele departamento."
                    },
                    {
                        "type": "quote",
                        "value": "Normalizar uma dimensão troca menos redundância por mais joins. A pergunta não é qual esquema é mais correto, é qual deles o seu volume de dados e o seu padrão de consulta pedem."
                    },
                    {
                        "type": "text",
                        "value": "## Por que a estrela domina nos data warehouses atuais\n\nEm bancos colunares, como os usados na maioria dos data warehouses modernos, a compressão por coluna reduz bastante o peso da redundância: valores repetidos numa mesma coluna (como o nome de uma categoria repetido em milhares de produtos) comprimem muito bem, porque o motor guarda o valor distinto uma vez e referencia o restante. Isso tira boa parte da vantagem de espaço que motivava o floco de neve, e explica por que a maioria dos data warehouses analíticos prefere o esquema estrela mesmo em dimensões grandes: a economia de espaço do floco de neve encolhe, enquanto o custo extra de joins continua existindo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das alternativas descreve corretamente o esquema em floco de neve (snowflake)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "As tabelas fato são normalizadas em múltiplas tabelas ligadas por chave estrangeira.",
                                "isCorrect": false
                            },
                            {
                                "text": "As tabelas de dimensão são normalizadas em múltiplas tabelas relacionadas por hierarquia.",
                                "isCorrect": true
                            },
                            {
                                "text": "As tabelas de dimensão são fundidas numa única tabela larga e desnormalizada.",
                                "isCorrect": false
                            },
                            {
                                "text": "As tabelas fato e dimensão passam a compartilhar a mesma chave primária substituta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma dimensão produto tem 200 mil linhas, e os atributos categoria e departamento se repetem com alta redundância entre os produtos, ocupando espaço relevante em disco. A equipe prioriza reduzir essa redundância, mesmo aceitando mais joins nas consultas. Qual desenho de dimensão atende melhor a esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma dimensão degenerada, guardando categoria e departamento direto na tabela fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela fato adicional para armazenar categoria e departamento separadamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esquema estrela, mantendo categoria e departamento como colunas na própria dimensão produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esquema floco de neve, separando categoria e departamento em tabelas próprias normalizadas.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Em um data warehouse que prioriza a velocidade de leitura em dashboards com muitas consultas simultâneas, qual costuma ser a razão mais comum para preferir o esquema estrela ao floco de neve, mesmo com maior redundância nos dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O esquema estrela exige menos joins por consulta, o que tende a acelerar a leitura.",
                                "isCorrect": true
                            },
                            {
                                "text": "O esquema estrela costuma ocupar sempre menos espaço em disco do que o floco de neve.",
                                "isCorrect": false
                            },
                            {
                                "text": "O esquema estrela elimina a necessidade de chaves substitutas nas dimensões.",
                                "isCorrect": false
                            },
                            {
                                "text": "O esquema estrela impede qualquer duplicidade de dados dentro da dimensão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em bancos de dados colunares usados como data warehouse, a compressão por coluna reduz bastante o ganho de espaço que o floco de neve teria sobre o esquema estrela. Diante disso, qual costuma ser a orientação prática mais comum ao modelar dimensões nesses ambientes?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Preferir o floco de neve na maior parte dos casos, pois a normalização melhora a compressão colunar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter o floco de neve por padrão, pois tabelas menores comprimem de forma mais eficiente cada uma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Preferir o esquema estrela na maior parte dos casos, pois o ganho de espaço do floco de neve perde peso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Evitar o esquema estrela nesses ambientes, pois a redundância prejudica a compressão por coluna.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma dimensão geografia tem os níveis país, estado e cidade. Ao optar pelo esquema floco de neve, como esses níveis costumam ser modelados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em uma tabela fato adicional que registra apenas os níveis geográficos usados nas vendas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em tabelas separadas para país, estado e cidade, ligadas por chave estrangeira em hierarquia.",
                                "isCorrect": true
                            },
                            {
                                "text": "Em uma única tabela geografia com as colunas país, estado e cidade lado a lado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em uma tabela geografia com uma coluna só, concatenando país, estado e cidade em texto.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Slowly Changing Dimensions (SCD)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Slowly Changing Dimensions (SCD)\n\nAtributos de dimensão não são estáticos: um cliente muda de cidade, um produto é recategorizado, um vendedor troca de território. O problema que o Slowly Changing Dimensions (SCD) resolve é decidir o que fazer quando isso acontece: sobrescrever o valor antigo, guardar as duas versões, ou alguma coisa no meio do caminho. Essa decisão parece pequena, mas define se os seus relatórios conseguem reconstruir corretamente o passado ou não. É, de longe, o tema mais cobrado sobre dimensões, porque aparece em praticamente todo projeto de data warehouse real."
                    },
                    {
                        "type": "text",
                        "value": "## Tipo 0: o valor fixo\n\nNo SCD tipo 0, o atributo é carregado uma vez e nunca mais muda, mesmo que o sistema de origem informe um valor novo. Serve para atributos que devem preservar o dado original por definição, como o canal de aquisição do cliente (o meio pelo qual ele foi conquistado da primeira vez) ou a data do primeiro pedido. Atualizar esse tipo de atributo destruiria a própria informação que ele existe para guardar.\n\n## Tipo 1: sobrescrever\n\nNo SCD tipo 1, o valor novo substitui o antigo direto na mesma linha, e o valor anterior se perde. É a opção mais simples de implementar, e faz sentido quando o histórico da mudança não importa para o negócio, ou quando a mudança é, na real, a correção de um erro de cadastro, e não uma mudança de fato."
                    },
                    {
                        "type": "code",
                        "value": "-- Antes da correcao\nsk_produto | codigo_produto | categoria\n88         | PRD-4521       | Eletronicos\n\nUPDATE dim_produto\nSET categoria = 'Eletrodomesticos'\nWHERE codigo_produto = 'PRD-4521';\n\n-- Depois: o valor antigo nao existe mais em lugar nenhum\nsk_produto | codigo_produto | categoria\n88         | PRD-4521       | Eletrodomesticos"
                    },
                    {
                        "type": "text",
                        "value": "## Tipo 2: versionar com histórico completo\n\nNo SCD tipo 2, uma mudança não sobrescreve nada: ela gera uma nova linha na dimensão, com uma nova chave substituta (`sk_cliente`). A linha antiga ganha uma data de fim de vigência (`data_fim`), e a linha nova assume a vigência atual (`flag_atual`). A chave natural, o identificador do sistema de origem (`id_cliente`), continua igual nas duas linhas: o que muda é a chave substituta e os atributos versionados.\n\nEsse é o único dos quatro tipos que permite reconstruir o passado com exatidão: uma venda antiga aponta para a versão da dimensão que era válida na data em que a venda aconteceu, não para o estado atual do cliente. É por isso que o tipo 2 é o padrão de mercado quando o requisito é análise histórica de verdade."
                    },
                    {
                        "type": "code",
                        "value": "CREATE TABLE dim_cliente (\n  sk_cliente   INT PRIMARY KEY,\n  id_cliente   INT NOT NULL,\n  nome         VARCHAR(100),\n  cidade       VARCHAR(60),\n  data_inicio  DATE NOT NULL,\n  data_fim     DATE,\n  flag_atual   BOOLEAN NOT NULL\n);\n\nsk_cliente | id_cliente | nome         | cidade    | data_inicio | data_fim   | flag_atual\n501        | 123        | Marina Alves | Recife    | 2019-03-10  | 2024-06-30 | false\n502        | 123        | Marina Alves | Sao Paulo | 2024-07-01  | NULL       | true\n\n-- uma venda de 2022 referencia sk_cliente = 501 (Recife, vigente na epoca)\n-- uma venda de 2025 referencia sk_cliente = 502 (Sao Paulo, vigente agora)"
                    },
                    {
                        "type": "text",
                        "value": "## Tipo 3: guardar o valor anterior numa coluna\n\nNo SCD tipo 3, a dimensão ganha uma coluna extra para o valor anterior (`categoria_atual` e `categoria_anterior`, por exemplo), ao lado do valor vigente. É um meio-termo: guarda uma única mudança para trás, sem o crescimento de linhas do tipo 2, mas também sem histórico completo. Funciona bem para reorganizações pontuais, como uma mudança de território de vendas que só precisa comparar o antes e o depois.\n\n## Escolhendo o tipo certo\n\nNa prática, a escolha combina os quatro tipos por atributo, não por dimensão inteira: numa mesma `dim_cliente`, o campo cidade pode ser tipo 2, o campo canal de aquisição pode ser tipo 0, e um campo corrigido por erro de cadastro pode ser tratado como tipo 1. A pergunta que decide o tipo é sempre a mesma: o negócio precisa saber o valor que valia no passado, ou só o valor de agora?"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo\",\"Mantém histórico?\",\"Como implementa\",\"Quando usar\"],[\"Tipo 0\",\"Não muda nunca\",\"Valor fixo desde a carga inicial\",\"Atributos que devem preservar o dado original\"],[\"Tipo 1\",\"Não\",\"Sobrescreve o valor na mesma linha\",\"Correção de erro ou mudança irrelevante para o negócio\"],[\"Tipo 2\",\"Sim, completo\",\"Nova linha com data de vigência\",\"Análise histórica precisa\"],[\"Tipo 3\",\"Parcial, só o valor anterior\",\"Coluna extra para o valor anterior\",\"Comparar antes e depois de uma mudança pontual\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "No contexto de Slowly Changing Dimensions, o que caracteriza o SCD tipo 1?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O valor antigo é sobrescrito pelo novo, sem manter histórico da mudança.",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor antigo é preservado numa nova linha, com datas de início e fim.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor antigo é movido para uma coluna adicional, ao lado do valor atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor da dimensão é definido na carga inicial e nunca mais é alterado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rede de varejo quer que relatórios de vendas por região mostrem, para pedidos antigos, a cidade em que o cliente morava na época da compra, mesmo que ele tenha se mudado depois. Qual tipo de SCD atende a esse requisito na dimensão cliente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Tipo 1, sobrescrevendo o endereço a cada mudança de cidade informada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tipo 0, mantendo o primeiro endereço cadastrado como valor fixo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tipo 2, versionando o endereço em novas linhas com datas de vigência.",
                                "isCorrect": true
                            },
                            {
                                "text": "Tipo 3, guardando a cidade atual e a cidade anterior em colunas separadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista percebe que a categoria do produto X foi cadastrada errada (Eletrônicos em vez de Eletrodomésticos) por um erro de digitação no sistema de origem, sem que o produto tenha mudado de categoria de fato. Qual é a abordagem de SCD mais adequada para corrigir isso na dimensão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Tipo 2, criando uma nova versão da linha com data de início da correção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tipo 3, adicionando uma coluna com a categoria anterior errada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tipo 0, preservando a categoria original informada no cadastro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tipo 1, corrigindo o valor existente sem criar uma nova versão.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Numa dimensão cliente implementada como SCD tipo 2, o cliente C123 teve duas versões ao longo do tempo, com chaves substitutas diferentes para cada período de vigência. Como a tabela fato deve referenciar essa dimensão, para que uma venda antiga aponte para os dados do cliente válidos na data da venda?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Armazenando a chave natural do cliente, e resolvendo a versão certa em tempo de consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenando a chave substituta da versão vigente na data da venda, não a chave natural.",
                                "isCorrect": true
                            },
                            {
                                "text": "Armazenando as duas chaves substitutas do cliente, e escolhendo uma na consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenando a chave substituta mais recente do cliente, independente da data da venda.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa reorganizou seus territórios de vendas uma única vez, e os analistas precisam comparar os resultados usando tanto o território antigo quanto o novo, sem necessidade de rastrear futuras mudanças. Qual tipo de SCD é o mais adequado para o atributo território na dimensão vendedor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Tipo 3, guardando o território atual e o território anterior em colunas distintas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Tipo 2, criando uma nova linha versionada a cada reorganização de território.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tipo 1, sobrescrevendo o território sem manter nenhum valor anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tipo 0, mantendo o território original definido na contratação do vendedor.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dimensões conformadas e a matriz de barramento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Dimensões conformadas e a matriz de barramento\n\nUma empresa raramente tem um único data warehouse monolítico construído de uma vez. O mais comum é evoluir por data marts: um para vendas, outro para estoque, outro para financeiro, cada um atendendo uma área. O risco desse crescimento incremental é cada área reinventar sua própria dimensão cliente, sua própria dimensão tempo, com regras ligeiramente diferentes. O resultado são números que não batem quando alguém tenta cruzar dois data marts. Dimensões conformadas existem para evitar exatamente isso."
                    },
                    {
                        "type": "text",
                        "value": "## O que é uma dimensão conformada\n\nUma dimensão conformada tem a mesma estrutura, as mesmas chaves e o mesmo significado onde quer que seja usada. A dimensão tempo, conformada, é a mesma tabela (ou pelo menos a mesma definição de dia, mês, trimestre e ano) usada pela tabela fato de vendas, pela de estoque e pela de financeiro. Quando um analista agrupa por trimestre em qualquer um desses fatos, o trimestre significa exatamente a mesma coisa.\n\nConformar não exige uma tabela física única obrigatoriamente, exige consistência: mesma granularidade, mesmos atributos, mesmos valores possíveis. Duas tabelas `dim_tempo` em bancos diferentes podem ser conformadas, desde que sigam a mesma definição."
                    },
                    {
                        "type": "code",
                        "value": "DIM_TEMPO (conformada)              DIM_PRODUTO (conformada)\n        |                                    |\n        +---------------+-------------------+\n                        |\n         +--------------+--------------+\n         |                             |\n   FATO_VENDAS                   FATO_ESTOQUE\n         |                             |\n     DIM_LOJA                   DIM_FORNECEDOR\n\n(DIM_TEMPO e DIM_PRODUTO sao compartilhadas pelos dois fatos,\ncom a mesma estrutura e o mesmo significado nos dois)"
                    },
                    {
                        "type": "text",
                        "value": "## A matriz de barramento (bus matrix)\n\nA matriz de barramento é uma ferramenta de planejamento criada por Ralph Kimball para mapear, antes de construir qualquer tabela, quais dimensões conformadas cada processo de negócio (cada futura tabela fato) vai usar. As linhas da matriz são os processos de negócio (vendas, estoque, compras), as colunas são as dimensões conformadas (tempo, produto, loja, cliente, fornecedor), e cada célula marcada indica que aquele processo usa aquela dimensão.\n\nCom a matriz pronta, a empresa pode construir um data mart de cada vez, na ordem que fizer sentido para o negócio, sabendo de antemão que as dimensões compartilhadas vão se encaixar quando os próximos data marts forem construídos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Processo de negócio\",\"Tempo\",\"Produto\",\"Loja\",\"Cliente\",\"Fornecedor\"],[\"Vendas\",\"X\",\"X\",\"X\",\"X\",\"\"],[\"Estoque\",\"X\",\"X\",\"X\",\"\",\"X\"],[\"Compras\",\"X\",\"X\",\"\",\"\",\"X\"],[\"Devoluções\",\"X\",\"X\",\"X\",\"X\",\"\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que vale o esforço de conformar\n\nConformar dimensões evita o cenário de silos, os data marts isolados (às vezes chamados de stovepipes) que não conversam entre si porque cada um definiu cliente, produto ou tempo do seu próprio jeito. Com dimensões conformadas, a empresa constrói o data warehouse aos poucos, um processo de negócio de cada vez, sem perder a capacidade de cruzar dados entre áreas depois. É a diferença entre vários relatórios que discordam entre si e uma única versão dos fatos que todo mundo consulta."
                    },
                    {
                        "type": "quote",
                        "value": "A matriz de barramento não é sobre construir tudo de uma vez, é sobre garantir que as dimensões compartilhadas se encaixem quando as próximas tabelas fato chegarem."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma dimensão conformada, no contexto de modelagem dimensional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma dimensão que só pode ser usada por uma única tabela fato, nunca por mais de uma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma dimensão que guarda apenas atributos numéricos agregáveis do negócio inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma dimensão criada exclusivamente para corrigir erros encontrados em outras dimensões.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma dimensão com a mesma estrutura e o mesmo significado, reutilizada por fatos diferentes.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "As áreas de vendas e de logística de uma empresa mantêm, cada uma, sua própria dimensão cliente, com regras de agrupamento por região diferentes entre si. Um relatório que cruza dados das duas áreas mostra totais de clientes por região que não batem. Qual prática de modelagem resolve esse tipo de inconsistência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar uma tabela fato única, combinando os dados de vendas e logística num só grão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Conformar a dimensão cliente, com uma estrutura e atributos únicos usados pelas duas áreas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Duplicar a dimensão cliente em cada área, mantendo os nomes de colunas padronizados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar a dimensão cliente das duas áreas, movendo seus atributos para as tabelas fato.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o principal uso da matriz de barramento (bus matrix) de Kimball no planejamento de um data warehouse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Definir o volume de armazenamento necessário para cada tabela fato do ambiente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Listar as permissões de acesso de cada usuário às tabelas fato e dimensão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mapear quais dimensões conformadas se relacionam com cada processo de negócio.",
                                "isCorrect": true
                            },
                            {
                                "text": "Especificar qual tipo de SCD cada dimensão deve usar em cada processo de negócio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa decide construir seu data warehouse aos poucos, começando pelo data mart de vendas e, meses depois, acrescentando o data mart de estoque. Para que os dois possam ser cruzados sem retrabalho nas dimensões, qual prática deve ser seguida já no primeiro data mart?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Projetar as dimensões compartilhadas, como tempo e produto, já conformadas desde o início.",
                                "isCorrect": true
                            },
                            {
                                "text": "Adiar a modelagem das dimensões compartilhadas até que todos os data marts existam.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar dimensões independentes em cada data mart, e integrá-las por views no final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar uma única tabela fato para todos os data marts, sem depender de dimensões próprias.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa matriz de barramento, uma célula marcada no cruzamento entre o processo Compras e a dimensão Fornecedor indica que:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A dimensão fornecedor só existe para o processo de compras, sem uso em outros processos.",
                                "isCorrect": false
                            },
                            {
                                "text": "O processo de compras não depende de nenhuma outra dimensão além de fornecedor.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela fato de compras substitui a dimensão fornecedor nesse cruzamento específico.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela fato de compras se relaciona com a dimensão fornecedor conformada.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dimensões degeneradas, junk e role-playing",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Dimensões degeneradas, junk e role-playing\n\nNem todo elemento de contexto de uma tabela fato se encaixa perfeitamente no padrão de fato mais dimensões normais. Três situações aparecem com frequência em modelos reais: um identificador que não tem atributos próprios, um punhado de indicadores pequenos demais para justificar tabelas separadas, e uma mesma dimensão que precisa aparecer mais de uma vez no mesmo fato. Esta aula cobre os três padrões que resolvem cada caso."
                    },
                    {
                        "type": "text",
                        "value": "## Dimensão degenerada\n\nUma dimensão degenerada é um identificador que vem do sistema transacional de origem, como o número do pedido ou o número da nota fiscal, e que fica guardado direto na tabela fato, sem uma tabela de dimensão própria. Ela não tem atributos descritivos que justifiquem uma tabela separada (o número do pedido, sozinho, não tem nome, categoria ou qualquer outro atributo), mas ainda é útil: serve para agrupar as linhas de um mesmo pedido e para o drill-through, a navegação até o documento original no sistema de origem."
                    },
                    {
                        "type": "code",
                        "value": "FATO_VENDAS\nsk_data | sk_produto | sk_cliente | sk_loja | numero_pedido | quantidade | valor_venda\n1023    | 88         | 501        | 12      | PED-778401    | 2          | 159.80\n1023    | 91         | 501        | 12      | PED-778401    | 1          | 39.90\n1024    | 88         | 640        | 7       | PED-778402    | 1          | 79.90\n\n-- numero_pedido nao tem tabela DIM_PEDIDO propria: nao existe\n-- atributo descritivo alem do proprio numero. Ele fica no fato\n-- para agrupar os itens do mesmo pedido e permitir o drill-through\n-- ate o documento de origem."
                    },
                    {
                        "type": "text",
                        "value": "## Junk dimension\n\nUma tabela fato acumula, às vezes, uma coleção de flags e indicadores de baixa cardinalidade (se a venda teve desconto, a forma de pagamento, o canal de venda) que, sozinhos, não justificam uma dimensão própria, mas que também não deveriam virar várias colunas soltas e várias chaves estrangeiras no fato. A junk dimension resolve isso: agrupa esses indicadores numa única tabela pequena, com uma linha para cada combinação possível de valores, e o fato passa a guardar uma única chave estrangeira (`sk_junk`) no lugar de várias."
                    },
                    {
                        "type": "code",
                        "value": "DIM_JUNK_VENDA\nsk_junk | flag_promocional | forma_pagamento | canal_venda\n1       | S                | Cartao          | Loja fisica\n2       | S                | Cartao          | E-commerce\n3       | N                | Boleto          | Loja fisica\n4       | N                | Pix             | E-commerce\n5       | S                | Pix             | E-commerce\n\n-- FATO_VENDAS passa a ter sk_junk no lugar de tres colunas\n-- separadas (flag_promocional, forma_pagamento, canal_venda)"
                    },
                    {
                        "type": "text",
                        "value": "## Role-playing dimension\n\nUma dimensão role-playing é a mesma tabela física usada mais de uma vez pela mesma tabela fato, cada uso representando um papel diferente. O exemplo clássico é a dimensão tempo: uma tabela fato de pedidos pode ter data do pedido, data do envio e data da entrega, as três precisando dos mesmos atributos de calendário (dia da semana, mês, trimestre). Em vez de criar três tabelas `dim_tempo` redundantes, o fato referencia a mesma `dim_tempo` três vezes, com três chaves estrangeiras diferentes (`sk_data_pedido`, `sk_data_envio`, `sk_data_entrega`). Para o usuário final, cada papel costuma aparecer como uma view ou um alias com nome próprio, para não confundir qual data é qual numa consulta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Padrão\",\"O que resolve\",\"Exemplo típico\"],[\"Dimensão degenerada\",\"Identificador sem atributos próprios, vive no fato\",\"Número do pedido ou da nota fiscal\"],[\"Junk dimension\",\"Agrupa flags e indicadores de baixa cardinalidade\",\"Promoção, forma de pagamento, canal de venda\"],[\"Role-playing\",\"Reaproveita a mesma dimensão física em papéis diferentes\",\"Data do pedido, do envio e da entrega, todas na dim_tempo\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza uma dimensão degenerada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma dimensão que agrupa vários indicadores de baixa cardinalidade numa única tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma dimensão que perdeu os atributos originais após sucessivas cargas incrementais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um identificador de transação, como número do pedido, guardado direto na tabela fato.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma dimensão reutilizada em papéis diferentes dentro da mesma tabela fato.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela fato de vendas tem grão por item de pedido, e inclui a coluna numero_pedido apenas para agrupar os itens de um mesmo pedido e localizar o documento de origem. Não existe uma tabela de atributos descritivos para esse número. Como esse elemento deve ser classificado no modelo dimensional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como uma dimensão degenerada, guardada diretamente na tabela fato.",
                                "isCorrect": true
                            },
                            {
                                "text": "Como uma dimensão conformada, compartilhada entre vários data marts.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como uma junk dimension, reunindo indicadores de baixa cardinalidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como uma dimensão role-playing, usada em múltiplos papéis no fato.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela fato de vendas tem três colunas de flag: se a venda teve desconto, se foi parcelada, e se foi originada por um vendedor externo. Cada flag tem poucos valores possíveis, e isoladamente não justifica uma dimensão própria. Qual técnica reduz o número de chaves estrangeiras no fato sem perder essa informação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mover as três flags para a tabela fato como métricas numéricas agregáveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Combinar as três flags numa junk dimension, com uma linha para cada combinação possível.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar uma dimensão role-playing que representa cada uma das três flags em papéis distintos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Combinar as três flags numa dimensão degenerada dentro da própria tabela fato.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela fato de pedidos tem três colunas de data: data do pedido, data do envio e data da entrega. As três precisam dos mesmos atributos de calendário completos, como dia da semana, mês e trimestre. Qual abordagem evita criar três tabelas de dimensão de tempo redundantes?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Criar três dimensões conformadas de tempo, uma para cada papel, compartilhadas entre data marts.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar uma junk dimension que combina as três datas numa única chave substituta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformar as três datas em dimensões degeneradas dentro da própria tabela fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar uma única tabela dim_tempo física, referenciada três vezes pelo fato como role-playing.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual das alternativas diferencia melhor junk dimension de dimensão role-playing?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Junk dimension reaproveita uma dimensão existente em papéis diferentes; role-playing agrupa atributos de baixa cardinalidade numa tabela nova.",
                                "isCorrect": false
                            },
                            {
                                "text": "Junk dimension vive na tabela fato sem chave substituta, e role-playing sempre exige uma nova tabela física.",
                                "isCorrect": false
                            },
                            {
                                "text": "Junk dimension agrupa atributos de baixa cardinalidade numa tabela nova; role-playing reaproveita uma dimensão existente em papéis diferentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Junk dimension e role-playing são dois nomes diferentes para a mesma técnica de modelagem de flags.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Hierarquias e drill-down",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Hierarquias e drill-down\n\nQuase toda dimensão carrega uma ou mais hierarquias naturais: um dia pertence a um mês, que pertence a um trimestre, que pertence a um ano; um produto pertence a uma subcategoria, que pertence a uma categoria, que pertence a um departamento. Modelar essas hierarquias bem é o que permite que um relatório navegue de um total geral até o detalhe, e volte, sem trocar de tabela ou de consulta."
                    },
                    {
                        "type": "text",
                        "value": "## O que é uma hierarquia numa dimensão\n\nUma hierarquia é uma sequência de níveis dentro da mesma dimensão, ordenados do mais detalhado para o mais agregado. Cada nível tem seus próprios atributos (o nível mês tem nome do mês e número do mês, o nível trimestre tem número do trimestre), e cada linha da dimensão, no grão mais fino, carrega os valores de todos os níveis acima dela. Uma dimensão pode ter mais de uma hierarquia ao mesmo tempo: a dimensão tempo tem a hierarquia de calendário (dia, mês, trimestre, ano) e pode ter também uma hierarquia fiscal, com meses e trimestres que não coincidem com o calendário comum."
                    },
                    {
                        "type": "code",
                        "value": "Hierarquia de tempo:            Hierarquia de produto:\n\n      Ano                            Departamento\n       |                                   |\n   Trimestre                            Categoria\n       |                                   |\n      Mes                             Subcategoria\n       |                                   |\n      Dia                               Produto"
                    },
                    {
                        "type": "text",
                        "value": "## Drill-down e roll-up\n\nDrill-down é navegar de um nível mais agregado para um mais detalhado: sair do total do ano e abrir por trimestre, depois por mês, depois por dia. Roll-up é o caminho inverso, agregar do nível mais detalhado para um mais resumido: somar as vendas diárias até chegar num total mensal ou anual. Os dois nomes descrevem a direção da navegação, não uma técnica diferente de consulta: ambos funcionam agrupando pelos atributos de nível já presentes na dimensão."
                    },
                    {
                        "type": "code",
                        "value": "-- Total por ano (nivel mais alto: roll-up completo)\nSELECT dt.ano, SUM(f.valor_venda) AS total\nFROM fato_vendas f\nJOIN dim_tempo dt ON dt.sk_data = f.sk_data\nGROUP BY dt.ano;\n\n-- Drill-down: abrindo o mesmo total por trimestre e mes\nSELECT dt.ano, dt.trimestre, dt.mes, SUM(f.valor_venda) AS total\nFROM fato_vendas f\nJOIN dim_tempo dt ON dt.sk_data = f.sk_data\nGROUP BY dt.ano, dt.trimestre, dt.mes;"
                    },
                    {
                        "type": "text",
                        "value": "## Por que os atributos de nível ficam na mesma linha\n\nNo esquema estrela, os atributos de cada nível da hierarquia (mês, trimestre, ano, ou categoria, departamento) ficam todos na mesma linha da dimensão, de forma redundante: toda linha de um dia de março carrega `mes = 'Marco'`, `trimestre = 1` e `ano = 2024`, mesmo que esses valores se repitam em outras trinta linhas do mesmo mês. Essa redundância é proposital: ela permite agrupar ou filtrar por qualquer nível direto na dimensão, sem joins extras e sem recalcular nada em tempo de consulta. É a mesma lógica de desnormalização do esquema estrela, aplicada dentro de uma única dimensão.\n\nEm volumes grandes, quando os relatórios pedem principalmente os níveis mais altos (total por trimestre, por departamento), é comum também manter tabelas de resumo pré-agregadas para não escanear o grão mais fino a cada consulta, mas isso é uma otimização de desempenho, não uma mudança na forma como a hierarquia é modelada."
                    },
                    {
                        "type": "quote",
                        "value": "Uma hierarquia bem modelada é o que separa um relatório que só mostra um número fechado de um relatório que o usuário consegue abrir, nível por nível, até o detalhe que importa."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma hierarquia dentro de uma dimensão, no modelo dimensional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma sequência de tabelas fato, ordenadas do menor para o maior grão de granularidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma sequência de níveis, do mais detalhado ao mais agregado, dentro da mesma dimensão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma ordenação das dimensões conforme a frequência de uso nas consultas do relatório.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma sequência de chaves substitutas, geradas na ordem de carga inicial da dimensão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista está vendo o total de vendas do ano, e passa a visualizar o total por trimestre, depois por mês, chegando ao total por dia. Como essa navegação é chamada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Roll-up, pois avança de um nível mais agregado para um mais detalhado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Drill-down, pois avança de um nível mais detalhado para um mais agregado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Roll-up, pois avança de um nível mais detalhado para um mais agregado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Drill-down, pois avança de um nível mais agregado para um mais detalhado.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "A dimensão tempo de um data warehouse guarda, em cada linha de dia, também as colunas mês, trimestre e ano já calculadas, de forma redundante. Qual é a principal vantagem prática dessa modelagem para consultas de drill-down e roll-up?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Permite agrupar e filtrar por qualquer nível da hierarquia sem joins ou cálculos adicionais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduz bastante o espaço em disco ocupado pela dimensão tempo, frente a uma tabela normalizada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Elimina por completo a necessidade de uma chave substituta própria na dimensão tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garante que a tabela fato não precise referenciar a dimensão tempo em nenhuma consulta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela fato de vendas tem grão por dia e por produto. Um relatório precisa mostrar o total de vendas por departamento e por trimestre, níveis mais altos das hierarquias de produto e tempo. Qual é a forma correta de obter esse total a partir do grão diário por produto?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Alterando o grão da tabela fato para departamento e trimestre, no lugar das linhas diárias.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultando direto a dimensão produto, já que ela guarda os valores agregados por departamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Agregando os valores da tabela fato pelos atributos de departamento e trimestre das dimensões.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criando uma dimensão degenerada com o total de vendas por departamento e trimestre.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa dimensão produto, os atributos categoria e departamento representam níveis de uma hierarquia acima do próprio produto. O que se espera desses atributos de nível, dentro da mesma linha da dimensão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que cada produto referencie, por chave estrangeira, uma tabela separada de categoria e departamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que cada produto traga preenchidos, na própria linha, os valores de categoria e departamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que a categoria e o departamento fiquem armazenados apenas na tabela fato de vendas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a categoria e o departamento sejam recalculados a cada consulta, a partir do histórico.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Fatos a fundo e padrões de modelagem",
        "aulas": [
            {
                "titulo": "Tipos de tabela fato",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tipos de tabela fato\n\nAté aqui, toda tabela fato que você viu tinha um grão fixo e só recebia inserções. Mas Kimball descreve três padrões de fato que resolvem perguntas de negócio diferentes: o **fato transacional**, o **snapshot periódico** e o **snapshot acumulado**. A escolha certa depende do que a área de negócio precisa medir e de como o processo evolui no tempo."
                    },
                    {
                        "type": "text",
                        "value": "## Fato transacional\n\nÉ o padrão mais comum: uma linha para cada evento de negócio, no grão mais fino possível (um item vendido, uma transação de cartão, um clique). A tabela cresce por inserção contínua e quase nunca sofre update ou delete. As medidas costumam ser totalmente aditivas (quantidade, valor), porque cada linha é independente das demais.\n\nUse esse padrão quando a pergunta é \"o que aconteceu\" e você precisa somar ou contar eventos em qualquer combinação de dimensões."
                    },
                    {
                        "type": "code",
                        "value": "DDL de um fato transacional (grão: um item vendido)\n\nCREATE TABLE fact_venda_item (\n    sk_venda_item BIGINT PRIMARY KEY,\n    sk_data INT NOT NULL REFERENCES dim_data(sk_data),\n    sk_produto INT NOT NULL REFERENCES dim_produto(sk_produto),\n    sk_cliente INT NOT NULL REFERENCES dim_cliente(sk_cliente),\n    sk_loja INT NOT NULL REFERENCES dim_loja(sk_loja),\n    quantidade INT NOT NULL,\n    valor_bruto NUMERIC(12,2) NOT NULL,\n    valor_desconto NUMERIC(12,2) NOT NULL,\n    valor_liquido NUMERIC(12,2) NOT NULL\n);"
                    },
                    {
                        "type": "text",
                        "value": "## Snapshot periódico\n\nAqui a tabela grava uma linha por entidade a cada intervalo de tempo fixo (fim do dia, fim do mês), mesmo quando nada mudou. O exemplo clássico é o saldo diário de uma conta: todo fim de dia, cada conta ativa gera uma linha, com o saldo daquele momento. É útil para responder \"qual era a situação em tal data\", algo que um fato transacional não responde bem, porque somar transações não reconstrói um saldo.\n\nA tabela também só recebe inserção (uma leva por período), mas suas medidas costumam ser semi-aditivas: somar saldos de dias diferentes não faz sentido."
                    },
                    {
                        "type": "code",
                        "value": "Amostra de linhas de um snapshot periódico diário (saldo de conta)\n\ndata       | sk_conta | saldo_final | qtd_transacoes_dia\n2026-07-10 | 501      | 3200.00     | 2\n2026-07-11 | 501      | 3200.00     | 0\n2026-07-12 | 501      | 2750.50     | 3\n2026-07-10 | 502      | 980.00      | 1\n\nRepare que a conta 501 aparece em 2026-07-11 com zero transações: o snapshot periódico registra a entidade mesmo sem movimento, porque o objetivo é o estado, não o evento."
                    },
                    {
                        "type": "text",
                        "value": "## Snapshot acumulado\n\nModela o ciclo de vida de um processo com etapas bem definidas, como um pedido que passa por criação, pagamento, separação, envio e entrega. Existe uma linha por instância do processo (por pedido), com uma coluna de data para cada marco (milestone) e métricas de duração entre etapas, como dias entre pagamento e envio.\n\nA diferença principal para os outros dois padrões: o snapshot acumulado é atualizado (update) toda vez que o processo avança de etapa. Enquanto a etapa seguinte não aconteceu, a chave de data aponta para uma linha \"não aplicável\" na dim_data, ou fica nula, dependendo da convenção adotada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\",\"Transacional\",\"Snapshot periódico\",\"Snapshot acumulado\"],[\"Uma linha por\",\"evento\",\"entidade + período\",\"instância do processo\"],[\"Operação de carga\",\"só insert\",\"só insert\",\"insert e update\"],[\"Aditividade típica\",\"aditiva\",\"semi-aditiva\",\"mista (aditiva e durações)\"],[\"Responde bem\",\"o que aconteceu\",\"qual era o estado em X\",\"quanto tempo leva cada etapa\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Um marketplace registra uma linha para cada item comprado, no instante da compra, com o preço pago e a quantidade daquele item. Esse desenho de fato segue qual padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Fato transacional, com grão no item comprado e inserção contínua a cada evento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Snapshot periódico, com uma linha por carrinho capturada ao fim de cada dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Snapshot acumulado, com uma linha por pedido atualizada a cada etapa da compra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tabela fato sem fato, com uma linha apenas para marcar que a compra ocorreu.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time de risco de um banco precisa saber o saldo de cada conta ao final de todo dia, inclusive nos dias sem nenhuma movimentação. Qual desenho de fato atende essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fato transacional, com uma linha por movimentação, somada para obter o saldo do dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Snapshot acumulado, com uma linha por conta atualizada a cada nova movimentação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tabela fato sem fato, com uma linha por conta apenas para marcar que ela existe.",
                                "isCorrect": false
                            },
                            {
                                "text": "Snapshot periódico, com uma linha por conta a cada dia, mesmo sem movimentação.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O time de logística quer acompanhar, para cada pedido, quantos dias se passam entre pagamento, separação, envio e entrega, atualizando a mesma linha conforme o pedido avança. Isso pede um:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fato transacional, com uma linha nova a cada etapa concluída do pedido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tabela fato sem fato, com uma linha por etapa apenas para registrar sua ocorrência.",
                                "isCorrect": false
                            },
                            {
                                "text": "Snapshot acumulado, com uma coluna de data por etapa e atualização a cada marco.",
                                "isCorrect": true
                            },
                            {
                                "text": "Snapshot periódico, com uma linha por pedido capturada ao final de cada dia.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em teoria, um fato transacional com um evento por etapa do pedido também registra todo o histórico. Por que, na prática, um snapshot acumulado é preferido para medir a duração entre as etapas de um pedido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o snapshot acumulado não depende de uma dimensão de data para representar as etapas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque comparar datas de linhas diferentes é mais trabalhoso do que ler uma linha só com todas as etapas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o fato transacional não permite o uso de chaves substitutas nas dimensões de data envolvidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o fato transacional só consegue registrar eventos financeiros, nunca etapas operacionais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A diretoria de um centro de distribuição quer acompanhar, em um gráfico de tendência, a quantidade em estoque de cada SKU ao fim de cada semana. O desenho de fato mais adequado é:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Snapshot periódico, com uma linha por SKU a cada semana, refletindo o estoque naquele corte.",
                                "isCorrect": true
                            },
                            {
                                "text": "Snapshot acumulado, com uma linha por SKU atualizada a cada entrada ou saída do estoque.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fato transacional, com uma linha por movimentação de estoque, somada semana a semana.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tabela fato sem fato, com uma linha por SKU apenas para indicar que ele está ativo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Aditividade: aditivos, semi-aditivos e não aditivos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Aditividade: aditivos, semi-aditivos e não aditivos\n\nDepois de saber o tipo de fato, a próxima pergunta é: essa medida pode ser somada? A aditividade classifica cada medida numérica de acordo com as dimensões em que a soma (SUM) continua fazendo sentido. Errar essa classificação é a forma mais comum de uma ferramenta de BI entregar um número tecnicamente correto e semanticamente errado."
                    },
                    {
                        "type": "text",
                        "value": "## Medidas aditivas\n\nSão as mais simples: podem ser somadas em qualquer dimensão presente no fato, sem restrição. Valor de venda, quantidade vendida e valor de desconto são exemplos clássicos em um fato transacional. Você pode somar por produto, por loja, por cliente, por mês, por qualquer combinação, e o resultado sempre tem significado de negócio."
                    },
                    {
                        "type": "text",
                        "value": "## Medidas semi-aditivas\n\nPodem ser somadas em algumas dimensões, mas não em todas. O caso mais comum é não poderem ser somadas ao longo do tempo. O exemplo clássico é o saldo de uma conta: somar o saldo de várias contas no mesmo dia faz sentido (dá o saldo total da agência), mas somar o saldo da mesma conta em dias diferentes não produz nada útil. O mesmo vale para nível de estoque e para número de assinantes ativos em snapshots periódicos.\n\nO tratamento típico na consulta é trocar a soma no tempo por outra função: pegar o último valor do período (saldo do fechamento do mês) ou calcular a média."
                    },
                    {
                        "type": "code",
                        "value": "Duas formas de agregar um snapshot periódico diário de saldo\n\n-- errado: soma o saldo dos 30 dias do mês, inflando o resultado\nSELECT sk_conta, SUM(saldo_final) AS saldo_errado\nFROM fact_saldo_diario\nWHERE data BETWEEN '2026-07-01' AND '2026-07-31'\nGROUP BY sk_conta;\n\n-- correto: pega o saldo do último dia do período\nSELECT sk_conta, saldo_final\nFROM fact_saldo_diario\nWHERE data = '2026-07-31';"
                    },
                    {
                        "type": "text",
                        "value": "## Medidas não aditivas\n\nNunca podem ser somadas, em nenhuma dimensão, porque já são o resultado de uma razão ou de um percentual: margem percentual, ticket médio, taxa de conversão, preço unitário. Somar duas margens percentuais de dois produtos diferentes não gera uma margem válida.\n\nA solução é nunca persistir o percentual pronto na tabela fato. Guarde os dois componentes aditivos que formam a razão (por exemplo, valor_lucro e valor_venda, ou numero_conversoes e numero_visitas) e calcule a divisão somente na consulta, depois de agregar cada componente separadamente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo\",\"Soma no tempo\",\"Soma nas outras dimensões\",\"Exemplo\",\"Tratamento recomendado\"],[\"Aditiva\",\"Sim\",\"Sim\",\"Valor de venda\",\"Somar livremente\"],[\"Semi-aditiva\",\"Não\",\"Sim\",\"Saldo de conta\",\"Último valor ou média\"],[\"Não aditiva\",\"Não\",\"Não\",\"Margem percentual\",\"Guardar componentes e dividir na consulta\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma medida não aditiva nunca deve ser somada, nem persistida pronta: guarde numerador e denominador na tabela fato e calcule a razão no momento da consulta."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em um fato transacional de vendas, qual medida pode ser somada livremente em qualquer combinação de dimensões, sem perder o sentido de negócio?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Saldo da conta do cliente, porque cada linha representa um evento independente das demais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Margem percentual do item, porque cada linha representa um evento independente das demais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ticket médio do pedido, porque cada linha representa um evento independente das demais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Valor de venda, porque cada linha representa um evento independente das demais.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um analista somou o saldo_final de uma conta em todos os dias de julho para estimar o 'saldo do mês' e obteve um número muito maior que o saldo real. O que explica o erro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Saldo é aditivo, mas o fato usado nessa consulta tinha o grão errado para o caso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Saldo é semi-aditivo: não pode ser somado entre contas, só ao longo do tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Saldo é semi-aditivo: não soma ao longo do tempo, só entre contas no mesmo dia.",
                                "isCorrect": true
                            },
                            {
                                "text": "Saldo é não aditivo: nunca pode ser somado em nenhuma dimensão presente no fato.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela fato de vendas ganhou uma coluna margem_percentual, calculada e gravada na carga. Depois, um dashboard soma essa coluna por região e mostra um número absurdo. Qual é a forma correta de corrigir o modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mover a coluna margem_percentual para a dimensão de produto, fora da tabela fato atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover a coluna pronta e guardar valor_lucro e valor_venda, somando cada um antes de dividir.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar a soma por uma média simples da coluna margem_percentual na consulta do dashboard.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter a coluna, mas recalculá-la a cada carga para refletir o total mais recente vendido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Produto A vendeu 10 unidades com margem de 50% e produto B vendeu 1000 unidades com margem de 10%. Qual é a forma correta de calcular a margem percentual consolidada dos dois produtos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Somar o lucro e a receita dos dois produtos e dividir o lucro somado pela receita somada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Somar as duas margens percentuais e dividir o resultado pelos dois produtos envolvidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Multiplicar as duas margens percentuais pela quantidade vendida de cada produto envolvido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar a margem do produto de maior volume de vendas como margem consolidada dos dois.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um SaaS grava, em um snapshot mensal, o número de assinantes ativos de cada plano. Somar esse número entre todos os planos do mesmo mês faz sentido, mas somar entre meses diferentes não. Essa medida é:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Aditiva, pois soma em qualquer dimensão do fato, inclusive ao longo dos meses do ano.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não aditiva, pois é o resultado de uma razão entre assinantes ativos e cancelamentos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Semi-aditiva, pois soma ao longo dos meses, mas não soma entre planos diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Semi-aditiva, pois soma entre planos no mesmo mês, mas não soma ao longo dos meses.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tabelas fato sem fato (factless)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tabelas fato sem fato (factless)\n\nNem toda tabela fato precisa de uma medida numérica. Às vezes o que importa para o negócio é só confirmar que uma combinação de dimensões aconteceu, ou que estava disponível em determinado momento. Essas tabelas só têm chaves estrangeiras, sem nenhuma coluna de valor, e Kimball as chama de factless fact tables."
                    },
                    {
                        "type": "text",
                        "value": "## Factless de eventos\n\nRegistra a ocorrência de um evento que não carrega, por natureza, nenhum número associado. Exemplos típicos: um aluno matriculado em uma turma, a presença de um aluno em uma aula, o acesso de um usuário a uma página. O grão é a própria ocorrência, e cada linha é apenas um conjunto de chaves substitutas das dimensões envolvidas."
                    },
                    {
                        "type": "code",
                        "value": "DDL de um factless fact de eventos (matrícula em turma)\n\nCREATE TABLE fact_matricula (\n    sk_aluno INT NOT NULL REFERENCES dim_aluno(sk_aluno),\n    sk_turma INT NOT NULL REFERENCES dim_turma(sk_turma),\n    sk_data INT NOT NULL REFERENCES dim_data(sk_data),\n    PRIMARY KEY (sk_aluno, sk_turma, sk_data)\n);"
                    },
                    {
                        "type": "text",
                        "value": "## Factless de cobertura\n\nRegistra o que estava disponível ou válido em um momento, mesmo sem nenhum evento ter acontecido. O exemplo clássico é uma tabela de promoções ativas por produto, loja e semana: ela existe mesmo para produtos que não venderam naquela semana. Sem essa tabela, você só enxerga o que vendeu com promoção, nunca o total de produtos que estavam em promoção, e perde a capacidade de calcular taxas."
                    },
                    {
                        "type": "code",
                        "value": "DDL de um factless fact de cobertura (promoções ativas)\n\nCREATE TABLE fact_promocao_ativa (\n    sk_produto INT NOT NULL REFERENCES dim_produto(sk_produto),\n    sk_loja INT NOT NULL REFERENCES dim_loja(sk_loja),\n    sk_data INT NOT NULL REFERENCES dim_data(sk_data),\n    sk_promocao INT NOT NULL REFERENCES dim_promocao(sk_promocao),\n    PRIMARY KEY (sk_produto, sk_loja, sk_data, sk_promocao)\n);"
                    },
                    {
                        "type": "text",
                        "value": "## Como contar sem medida\n\nSem uma coluna de valor, a agregação usual é COUNT(*) ou COUNT(DISTINCT sk_aluno), para responder \"quantos eventos\" ou \"quantas entidades distintas\". O uso mais poderoso, porém, é combinar um factless de cobertura com um fato transacional para calcular taxas: por exemplo, contar quantos produtos em promoção tiveram alguma venda (numerador, vindo do fato de vendas) sobre o total de produtos em promoção naquela semana (denominador, vindo do factless de cobertura)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de factless\",\"Propósito\",\"Grão típico\",\"Exemplo\",\"Pergunta que responde\"],[\"Eventos\",\"Registrar uma ocorrência\",\"a própria ocorrência\",\"Aluno matriculado em turma\",\"Quantos eventos aconteceram\"],[\"Cobertura\",\"Registrar o que estava disponível\",\"combinação válida em um período\",\"Promoções ativas por loja e semana\",\"Qual o total possível, para servir de denominador\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "A escola quer saber, para cada turma, quais alunos estiveram presentes em cada aula. Não existe nenhum valor numérico associado a esse registro. O desenho de fato adequado é:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Snapshot periódico, com uma linha por combinação de aluno, turma e data de aula.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tabela dimensão, com uma linha por combinação de aluno, turma e data de aula.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tabela fato sem fato, com uma linha por combinação de aluno, turma e data de aula.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fato transacional, com uma linha por combinação de aluno, turma e data de aula.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O marketing quer calcular a taxa de produtos em promoção que efetivamente venderam em cada semana. O fato de vendas só mostra o que vendeu. Para calcular essa taxa, o modelo precisa de:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um snapshot acumulado com os produtos em promoção a cada etapa, para servir de denominador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um factless de cobertura com os produtos em promoção a cada semana, para servir de denominador.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um fato transacional a mais com os produtos em promoção a cada venda, para servir de denominador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma dimensão a mais com os produtos em promoção a cada semana, para servir de denominador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela fact_matricula tem apenas as chaves de aluno, turma e data, sem nenhuma coluna de valor. Para saber quantos alunos distintos se matricularam em uma turma, a consulta deve usar:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "COUNT(DISTINCT sk_aluno), já que a tabela não tem uma medida numérica para somar.",
                                "isCorrect": true
                            },
                            {
                                "text": "SUM(sk_aluno), já que a tabela não tem uma medida numérica para contar direito.",
                                "isCorrect": false
                            },
                            {
                                "text": "AVG(sk_data), já que a tabela não tem uma medida numérica para somar direito.",
                                "isCorrect": false
                            },
                            {
                                "text": "MAX(sk_turma), já que a tabela não tem uma medida numérica para contar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A dim_promocao já lista todas as promoções cadastradas, com suas regras e período de vigência. Por que ainda é necessária uma tabela fato sem fato para as promoções ativas por produto e loja?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque a dimensão nunca pode ter mais de uma linha para cada promoção cadastrada no sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a dimensão muda com frequência demais para ser usada direto em consultas analíticas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a dimensão não aceita ser referenciada por mais de uma tabela fato ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a dimensão descreve a promoção em si, não a combinação de produto, loja e semana ativa.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma plataforma de cursos quer saber quais usuários acessaram cada aula em cada dia, sem nenhum valor associado ao acesso em si. O desenho de fato mais adequado é:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Snapshot periódico, com uma linha por combinação de usuário, aula e mês de acesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tabela fato sem fato de cobertura, com uma linha por combinação de usuário, aula e data.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tabela fato sem fato de eventos, com uma linha por combinação de usuário, aula e data.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fato transacional, com uma linha por combinação de usuário, aula e data de acesso.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Chaves substitutas e o carregamento das dimensões",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Chaves substitutas e o carregamento das dimensões\n\nA tabela fato quase nunca guarda a chave de negócio vinda do sistema de origem. Ela guarda a chave substituta (surrogate key, ou sk) gerada pelo próprio data warehouse para cada linha de cada dimensão. Entender por que, e como essa chave chega até o fato durante a carga, é essencial para qualquer pipeline de ETL ou ELT de um modelo dimensional."
                    },
                    {
                        "type": "text",
                        "value": "## Por que o fato usa chaves substitutas\n\nQuatro motivos práticos. Performance: uma sk costuma ser um inteiro, mais leve para indexar e fazer join do que um código alfanumérico. Isolamento: se o sistema de origem trocar o formato do código do cliente, o fato não precisa ser reescrito. Suporte a SCD tipo 2: cada versão histórica de uma linha de dimensão tem sua própria sk, então o fato aponta exatamente para a versão vigente no momento do evento. Integração: quando há mais de um sistema de origem para a mesma entidade, cada um com sua própria numeração, a sk do DW unifica tudo em um único espaço de chaves."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Chave natural (de negócio)\",\"Chave substituta (surrogate)\"],[\"Origem\",\"Vem do sistema de origem\",\"Gerada pelo data warehouse\"],[\"Significado\",\"Tem significado de negócio (CPF, SKU)\",\"Não tem significado, é só um identificador\"],[\"Estabilidade\",\"Pode mudar ou ser reciclada pela origem\",\"Nunca muda depois de criada\"],[\"Uso no fato\",\"Guardada como atributo da dimensão\",\"Usada na chave estrangeira do fato\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O lookup na carga\n\nDurante o ETL, cada linha vinda da área de staging traz a chave de negócio, como o código do cliente no ERP ou o SKU do produto. Antes de gravar o fato, o processo faz um lookup na dimensão: busca a linha cuja chave de negócio bate e cuja versão está vigente naquele momento (is_current = true, ou a versão cujo intervalo de datas cobre a data do evento), e traz a sk correspondente para gravar na tabela fato."
                    },
                    {
                        "type": "code",
                        "value": "Lookup simplificado na carga de um fato (chave de negócio para sk vigente)\n\nSELECT\n    stg.nr_pedido,\n    stg.valor,\n    d.sk_cliente\nFROM stg_pedido stg\nJOIN dim_cliente d\n    ON d.cd_cliente_erp = stg.cd_cliente_erp\n    AND d.is_current = true;"
                    },
                    {
                        "type": "text",
                        "value": "## Late arriving dimensions (resumo)\n\nÀs vezes o fato chega antes da dimensão: uma venda para um cliente novo cujo cadastro completo ainda não foi processado. Em vez de descartar ou atrasar a carga do fato, cria-se uma linha provisória na dimensão (um inferred member), só com a chave de negócio conhecida e atributos \"desconhecido\" no restante, e gera-se uma sk normalmente para o fato usar. Quando o cadastro completo chegar, essa linha é atualizada com os atributos reais."
                    },
                    {
                        "type": "quote",
                        "value": "O fato nunca referencia a chave de negócio diretamente: ele referencia a chave substituta da versão da dimensão que estava vigente no momento do evento."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que a tabela fato referencia a chave substituta (sk) da dimensão, e não a chave de negócio vinda do sistema de origem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque a chave de negócio só existe em sistemas OLTP, nunca em um data warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a sk isola o fato de mudanças na origem e suporta múltiplas versões em SCD tipo 2.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a chave de negócio nunca pode ser usada como chave estrangeira em nenhuma tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a sk elimina a necessidade de uma dimensão de data no modelo dimensional inteiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante a carga de um fato de vendas, o lookup na dim_cliente encontra duas linhas com a mesma chave de negócio: uma com is_current = true e outra com is_current = false, de um endereço antigo. Qual sk o processo deve gravar no fato?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A sk da linha com is_current = true, que representa a versão vigente do cliente.",
                                "isCorrect": true
                            },
                            {
                                "text": "A sk da linha com is_current = false, que preserva o endereço do momento da venda.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas sks, uma em cada coluna, para manter o histórico completo do cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A menor sk entre as duas, por convenção de carga usada em chaves substitutas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma venda chega para processamento, mas o cliente informado ainda não existe na dim_cliente, porque o cadastro completo só será sincronizado à noite. Qual prática evita perder ou atrasar essa venda no fato?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Gravar o fato com a sk nula até que o cadastro completo do cliente seja sincronizado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adiar a carga de toda a venda até a próxima janela de sincronização do cadastro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gravar o fato usando a chave de negócio do cliente no lugar da sk, só nesse caso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma linha provisória na dimensão, só com a chave de negócio, e atualizá-la depois.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um ERP antigo reutiliza códigos de cliente cancelados para novos cadastros depois de alguns anos. Que problema isso causa para uma dimensão que usa a chave de negócio como identificador direto, sem chave substituta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O data warehouse não consegue mais fazer join entre a dimensão e o fato correspondente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A dimensão passa a exigir uma chave estrangeira extra para cada linha do fato atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dois clientes diferentes ficam associados ao mesmo identificador, misturando históricos.",
                                "isCorrect": true
                            },
                            {
                                "text": "A dimensão deixa de suportar qualquer tipo de SCD, mesmo o tipo 1 mais simples de todos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A empresa migrou de dois CRMs diferentes para um só, e cada sistema antigo numerava clientes com sua própria sequência, gerando códigos repetidos entre eles. Qual benefício da chave substituta resolve esse problema na dimensão unificada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A sk transforma automaticamente os códigos duplicados em códigos válidos na origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "A sk gera uma numeração única no data warehouse, independente da numeração de origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "A sk elimina a necessidade de armazenar a chave de negócio de cada sistema de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "A sk permite que a dimensão seja atualizada sem gerar uma nova versão em SCD tipo 2.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Muitos-para-muitos: bridge tables",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Muitos-para-muitos: bridge tables\n\nO esquema estrela pressupõe que cada linha do fato se liga a exatamente uma linha de cada dimensão. Mas existem casos legítimos de relacionamento muitos-para-muitos: uma conta bancária com vários titulares, uma consulta médica com vários diagnósticos, um vendedor responsável por vários territórios ao mesmo tempo. Ligar o fato direto a essas dimensões quebra a aritmética do modelo, e é para isso que existe a bridge table."
                    },
                    {
                        "type": "text",
                        "value": "## O problema do fan trap\n\nSe uma conta tem três titulares e você tenta juntar o fato de transações direto à dim_titular por uma chave multivalorada, cada linha do fato se repete uma vez para cada titular. Ao somar valor_transacao agrupando por titular, o valor total da transação aparece triplicado, porque a soma conta a mesma transação três vezes. Esse efeito de multiplicação indevida em joins muitos-para-muitos é conhecido como fan trap."
                    },
                    {
                        "type": "code",
                        "value": "Fato ligado a uma dimensão M:N através de uma bridge\n\nfact_transacao_conta\n   sk_conta ----------------+\n   valor                    |\n                            v\n                  bridge_conta_titular\n                  sk_conta | sk_titular | pct_alocacao\n                            |\n                            v\n                      dim_titular\n                      sk_titular | nome | tipo_titular"
                    },
                    {
                        "type": "text",
                        "value": "## A tabela ponte (bridge table)\n\nÉ a tabela intermediária que resolve a relação muitos-para-muitos: uma linha para cada combinação válida entre a entidade do fato (a conta) e cada membro associado (cada titular). O grão da bridge não é o grão do fato, e sim \"entidade mais membro\", então uma conta com três titulares gera três linhas na bridge, uma por titular."
                    },
                    {
                        "type": "code",
                        "value": "DDL da bridge table conta-titular\n\nCREATE TABLE bridge_conta_titular (\n    sk_conta INT NOT NULL REFERENCES dim_conta(sk_conta),\n    sk_titular INT NOT NULL REFERENCES dim_titular(sk_titular),\n    pct_alocacao NUMERIC(5,4) NOT NULL,\n    PRIMARY KEY (sk_conta, sk_titular)\n);"
                    },
                    {
                        "type": "text",
                        "value": "## O fator de alocação (weighting factor)\n\nÉ a coluna que evita a duplicação de medidas aditivas ao passar pela bridge: para cada conta, a soma dos pct_alocacao de todos os titulares deve fechar em 1, ou 100%. Ao calcular o valor atribuído a cada titular, multiplica-se valor_transacao pelo pct_alocacao daquele titular naquela conta, em vez de repetir o valor cheio para cada um. A soma final entre todos os titulares volta a bater com o total real da transação."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Abordagem\",\"Join direto fato-dimensão M:N\",\"Fato para bridge com weighting factor\"],[\"Linhas geradas por transação\",\"Uma por titular associado\",\"Uma por titular associado\"],[\"Soma de valor_transacao por titular\",\"Duplica o valor total (fan trap)\",\"Aloca o valor proporcional ao peso\"],[\"Soma final entre todos os titulares\",\"Maior que o valor real da transação\",\"Igual ao valor real da transação\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma conta bancária pode ter mais de um titular, e um titular pode ter mais de uma conta. Para representar essa relação entre o fato de transações e a dimensão de titulares, o modelo precisa de:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma bridge table entre a conta e o titular, com uma linha por combinação válida.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma chave estrangeira dupla na dimensão de titular, apontando para duas contas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma segunda tabela fato, só para transações com mais de um titular envolvido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma dimensão degenerada com o identificador de todos os titulares concatenado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma conta com quatro titulares foi ligada diretamente ao fato de transações, sem bridge table nem peso de alocação. Ao somar o valor das transações agrupado por titular, o resultado observado é:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O valor de cada transação aparece dividido por quatro, uma parte por titular.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor de cada transação some da consulta, porque a chave fica ambígua.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor de cada transação aparece somado uma vez, atribuído ao titular principal.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor de cada transação aparece somado quatro vezes, uma para cada titular.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Na bridge_conta_titular, a conta 900 tem dois titulares com pct_alocacao de 0.6 e 0.4. Qual é o papel dessa coluna ao consultar o valor total das transações por titular?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ordenar os titulares por ordem de cadastro na conta, do mais antigo ao mais recente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloquear o titular com menor percentual de realizar novas transações na conta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Distribuir o valor de cada transação proporcionalmente entre titulares, sem duplicar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir qual dos dois titulares é o responsável legal principal pela conta em questão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta médica pode registrar de um a vários diagnósticos (CID) simultâneos. O fato de consultas precisa se relacionar com a dimensão de diagnósticos numa relação muitos-para-muitos. Qual grão a bridge table deve ter?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma linha para cada combinação entre o paciente e todos os seus diagnósticos antigos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma linha para cada combinação entre a consulta e um diagnóstico associado a ela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma linha para cada consulta, com todos os diagnósticos concatenados em uma coluna.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma linha para cada diagnóstico cadastrado no sistema, independente da consulta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um relatório só precisa listar quais titulares estão associados a cada conta, sem somar nenhuma medida do fato de transações. Nesse uso específico, o pct_alocacao da bridge table é:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dispensável nessa consulta, pois só o relacionamento entre conta e titular importa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Obrigatório, porque a bridge table não funciona sem essa coluna estar preenchida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispensável, porque toda bridge table deve ser criada sem nenhuma coluna de peso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Obrigatório, porque sem ele a chave primária da bridge table fica inválida.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Data warehouses modernos",
        "aulas": [
            {
                "titulo": "O warehouse na nuvem",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O warehouse na nuvem\n\nOs módulos anteriores trataram o data warehouse como um conceito lógico: um repositório colunar, orientado a análise, modelado em esquema estrela. Este módulo olha para a implementação física predominante hoje, o warehouse colunar **gerenciado na nuvem**, como Amazon Redshift, Google BigQuery e Snowflake.\n\nA ideia central não muda: ainda é um banco colunar otimizado para leitura analítica. O que muda é a arquitetura por trás, e isso tem consequências diretas para quem modela os dados."
                    },
                    {
                        "type": "text",
                        "value": "## Armazenamento e computação separados\n\nNo warehouse on-premise clássico, armazenamento e computação vivem no mesmo hardware: o mesmo servidor guarda os dados em disco e executa as consultas. Para crescer, era preciso comprar mais máquinas, mesmo quando só faltava espaço em disco (ou só faltava poder de processamento).\n\nOs warehouses modernos na nuvem separam essas duas camadas:\n\n- **Armazenamento**: os dados ficam em um serviço de objeto barato e durável (por trás de Redshift RA3, BigQuery e Snowflake existe algo equivalente a S3 ou GCS), independente de quantos servidores de computação existem.\n- **Computação**: clusters, warehouses virtuais ou slots leem esses dados sob demanda. Podem crescer, encolher, pausar ou se multiplicar sem mover o dado de lugar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Warehouse on-premise\",\"Warehouse gerenciado na nuvem\"],[\"Armazenamento e computação\",\"Acoplados no mesmo hardware\",\"Separados, escalam de forma independente\"],[\"Escala\",\"Manual, compra e instalação de servidores\",\"Elástica, em minutos, sob demanda\"],[\"Custo\",\"Investimento inicial alto (capex)\",\"Pagamento pelo uso (opex)\"],[\"Manutenção\",\"Equipe própria cuida de patch, backup e tuning\",\"Provedor cuida da infraestrutura\"],[\"Concorrência entre cargas\",\"Um mesmo cluster disputado por ETL e BI\",\"Clusters ou warehouses independentes por carga\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Três exemplos, um conceito\n\n- **Amazon Redshift**: cluster de nós; a família RA3 já separa armazenamento (em um serviço gerenciado) de computação (os nós).\n- **Google BigQuery**: sem cluster para provisionar, é serverless. Você roda consultas e paga por bytes escaneados (ou por slots reservados), o armazenamento é gerenciado à parte.\n- **Snowflake**: arquitetura de dado compartilhado com múltiplos \"warehouses virtuais\". Vários times podem ligar seu próprio warehouse de computação sobre o mesmo dado, sem disputar recursos entre si.\n\nOs três divergem em como cobram e como você opera o cluster, mas compartilham a mesma ideia de fundo: armazenamento colunar barato, e computação elástica por cima."
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta deixou de ser quantos servidores comprar para os próximos três anos, e passou a ser quanto poder de processamento eu preciso agora, por quanto tempo."
                    },
                    {
                        "type": "code",
                        "value": "Camada de armazenamento (colunar, barata, duravel)\n   |\n   +-- Cluster/warehouse virtual: ETL e carga\n   |\n   +-- Cluster/warehouse virtual: BI e paineis\n   |\n   +-- Cluster/warehouse virtual: exploracao / data science"
                    },
                    {
                        "type": "text",
                        "value": "## O que isso muda para quem modela\n\n- Armazenamento deixou de ser o recurso mais caro: duplicar uma coluna em duas tabelas para evitar um join pesa pouco no custo de disco.\n- Cada carga (ingestão, BI, exploração) pode rodar em seu próprio cluster, sem disputar recursos com as outras, o que reduz a pressão por um modelo único que atenda tudo com perfeição.\n- Escalar para picos de uso é uma decisão de minutos, não de meses, o que muda o cálculo de quanto vale a pena desnormalizar hoje.\n\nEsses pontos voltam nas próximas aulas, quando o assunto for distribuição de dados e o trade-off entre normalizar e achatar tabelas."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza a arquitetura moderna de data warehouses gerenciados na nuvem (Redshift, BigQuery, Snowflake) em relação ao modelo on-premise tradicional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A eliminação completa do uso de SQL como linguagem de consulta, substituída por uma API proprietária.",
                                "isCorrect": false
                            },
                            {
                                "text": "A separação entre armazenamento e computação, que permite escalar cada um de forma independente.",
                                "isCorrect": true
                            },
                            {
                                "text": "A obrigatoriedade de um único cluster fixo, sem possibilidade de múltiplos ambientes de consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "A exigência de normalizar totalmente o modelo para reduzir o espaço ocupado em disco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de dados está decidindo se deve manter duas cópias parcialmente redundantes de uma tabela de vendas, uma normalizada para auditoria e outra achatada para consultas de BI, em um warehouse colunar gerenciado na nuvem. O que torna essa duplicação mais viável hoje do que em um warehouse on-premise tradicional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O SQL padrão foi totalmente substituído por uma linguagem de consulta mais simples de escrever.",
                                "isCorrect": false
                            },
                            {
                                "text": "As tabelas duplicadas passam a ser sincronizadas automaticamente pelo motor, sem nenhuma rotina de carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "A normalização deixou de ser necessária mesmo para o sistema transacional que sustenta a aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O armazenamento é barato e escala à parte da computação, reduzindo o peso de guardar dados duplicados.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma varejista percebe picos de consultas analíticas apenas em datas promocionais, com uso baixo no restante do mês. Qual característica dos warehouses gerenciados na nuvem melhor atende a esse padrão, sem pagar por capacidade ociosa o tempo todo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Escala elástica de computação, que permite aumentar ou reduzir clusters sob demanda em minutos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escala fixa de computação, definida uma única vez na criação do warehouse e mantida por contrato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Replicação manual do banco inteiro para um servidor extra sempre que uma promoção é planejada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumento permanente do armazenamento em disco para acomodar o volume de consultas do período.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time de engenharia reclama que a carga de ETL noturna está competindo por recursos com os painéis de BI usados durante o dia, no mesmo cluster de computação. Qual mudança, típica da arquitetura de warehouses modernos na nuvem, resolve isso sem duplicar o armazenamento dos dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Migrar o ETL para rodar fora do horário comercial, mantendo os dois processos no mesmo cluster único.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o volume de dados processados no ETL para liberar memória para os painéis durante o dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um cluster (ou warehouse virtual) separado para o ETL, apontando para o mesmo armazenamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Duplicar fisicamente o armazenamento em dois warehouses distintos, um para ETL e outro para BI.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma afirmação comum, mas equivocada, sobre warehouses colunares gerenciados na nuvem é que a elasticidade de computação torna a modelagem dos dados irrelevante. Por que essa afirmação está errada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque a elasticidade de computação existe apenas em ambientes on-premise, nunca em warehouses na nuvem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um modelo mal desenhado ainda gera mais bytes lidos e mais custo, mesmo com computação elástica.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque todo warehouse na nuvem exige um esquema totalmente normalizado até a terceira forma normal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a separação entre armazenamento e computação impede qualquer consulta analítica mais complexa.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Distribuição, particionamento e clustering",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Distribuição, particionamento e clustering\n\nUm warehouse colunar na nuvem guarda cada tabela espalhada em vários nós, arquivos ou blocos. Como esse espalhamento é feito não é um detalhe de infraestrutura que só o DBA vê, é uma decisão de modelagem, porque muda o tempo e o custo de uma consulta de forma drástica.\n\nOs nomes variam por produto (chave de distribuição e chave de ordenação no Redshift, particionamento e clustering no BigQuery e no Snowflake), mas os problemas que resolvem são os mesmos: reduzir o volume de dados lido, e evitar que um nó fique sobrecarregado enquanto os outros ficam ociosos."
                    },
                    {
                        "type": "text",
                        "value": "## Distribuição: como as linhas se espalham entre os nós\n\nEm arquiteturas de processamento distribuído (o caso do Redshift clássico), cada linha de uma tabela é atribuída a um nó de computação, geralmente com base em uma **chave de distribuição**. Quando duas tabelas usam a mesma chave de distribuição para o mesmo valor, um `JOIN` entre elas acontece localmente, sem precisar mover dados entre nós pela rede (a etapa cara chamada de shuffle, ou redistribuição).\n\nUma distribuição malfeita causa **data skew**: se a chave escolhida tem poucos valores muito frequentes (por exemplo, distribuir uma tabela de pedidos pela coluna país quando 90% dos pedidos são de um único país), a maior parte dos dados cai em pouquíssimos nós, que ficam sobrecarregados enquanto os demais quase não trabalham."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Técnica\",\"Onde aparece\",\"O que resolve\"],[\"Chave de distribuição\",\"Redshift (arquitetura distribuída)\",\"Coloca linhas relacionadas no mesmo nó, evitando shuffle em joins\"],[\"Chave de ordenação (sort key)\",\"Redshift\",\"Ordena os dados em disco para podar blocos irrelevantes na leitura\"],[\"Particionamento\",\"BigQuery, Snowflake\",\"Divide a tabela em fatias, como por data, que podem ser puladas inteiras\"],[\"Clustering\",\"BigQuery, Snowflake\",\"Agrupa fisicamente por colunas de filtro frequente dentro de cada partição\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Particionamento e clustering nos warehouses serverless\n\nNo BigQuery e no Snowflake, o modelo de nós fixos dá lugar a algo mais automático, mas as decisões de modelagem continuam importando:\n\n- **Particionamento** costuma ser feito por uma coluna de data (data do pedido, data do evento). Uma consulta que filtra por um intervalo de datas lê só as partições daquele intervalo, ignorando o resto da tabela inteiramente.\n- **Clustering** organiza fisicamente os dados dentro de cada partição por uma ou mais colunas usadas com frequência em filtros (cliente, categoria), para que consultas com esses filtros leiam menos blocos.\n\nO ganho não é teórico: em um warehouse cobrado por volume de dados lido, particionar bem uma tabela de fatos por data pode reduzir o custo de uma consulta em ordens de grandeza."
                    },
                    {
                        "type": "quote",
                        "value": "Escolher a chave de distribuição ou a coluna de particionamento é responder a uma pergunta de modelagem: quais colunas essa tabela vai filtrar e juntar com mais frequência?"
                    },
                    {
                        "type": "code",
                        "value": "-- Estilo Redshift: chave de distribuicao e chave de ordenacao\nCREATE TABLE fato_vendas (\n    id_data        INT,\n    id_produto     INT,\n    id_loja        INT,\n    quantidade     INT,\n    valor_total    DECIMAL(12,2)\n)\nDISTKEY (id_produto)\nSORTKEY (id_data);\n\n-- Estilo BigQuery: particionamento por data e clustering por colunas de filtro\nCREATE TABLE fato_vendas (\n    data_venda     DATE,\n    id_produto     INT64,\n    id_loja        INT64,\n    quantidade     INT64,\n    valor_total    NUMERIC\n)\nPARTITION BY data_venda\nCLUSTER BY id_produto, id_loja;"
                    },
                    {
                        "type": "text",
                        "value": "## Evitando data skew\n\nSinais de que a distribuição ou o particionamento estão ruins:\n\n- Um nó (ou uma partição) concentra uma fatia muito maior de linhas do que os demais.\n- Consultas demoram mais do que o esperado mesmo com filtros aplicados, porque o motor ainda lê blocos inteiros irrelevantes.\n- A tabela cresce, mas o tempo de consulta piora de forma desproporcional ao crescimento.\n\nA escolha de chave de distribuição, coluna de particionamento e colunas de clustering deve olhar para os **padrões reais de consulta** (o que a tabela costuma filtrar e juntar), não para a chave primária da tabela por hábito."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza o problema conhecido como data skew em um warehouse distribuído?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os dados são apagados automaticamente depois de um período de retenção definido pelo administrador.",
                                "isCorrect": false
                            },
                            {
                                "text": "As colunas de uma tabela mudam de tipo de dado sem nenhum aviso durante a carga noturna.",
                                "isCorrect": false
                            },
                            {
                                "text": "As consultas analíticas passam a exigir aprovação manual de um administrador antes de cada execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados ficam concentrados desigualmente entre os nós, sobrecarregando uns e deixando outros ociosos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela fato de vendas e uma tabela dimensão de produtos são unidas em quase todas as consultas analíticas de um Redshift clássico, pela coluna id_produto. Qual escolha de chave de distribuição reduz o tráfego de rede (shuffle) nesse join?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Distribuir as duas tabelas por id_produto, para que linhas relacionadas fiquem no mesmo nó.",
                                "isCorrect": true
                            },
                            {
                                "text": "Distribuir as duas tabelas por uma coluna aleatória diferente em cada uma, para equilibrar a carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "Distribuir só a tabela fato por id_produto, e deixar a dimensão sem nenhuma chave de distribuição definida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Distribuir as duas tabelas pela chave primária técnica de cada linha, gerada de forma sequencial.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de eventos no BigQuery tem cinco anos de histórico e está particionada por data_evento. Um painel de BI faz consultas filtrando sempre os últimos 7 dias. Qual é o principal benefício de manter o particionamento por data nesse cenário, em um modelo de cobrança por volume de dados lido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A consulta passa a ler a tabela inteira uma única vez por dia, guardando o resultado em cache permanente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela inteira é convertida automaticamente para um formato de linha, mais rápido para filtros de data.",
                                "isCorrect": false
                            },
                            {
                                "text": "A consulta lê só as partições dos últimos 7 dias, ignorando os anos anteriores e reduzindo o custo.",
                                "isCorrect": true
                            },
                            {
                                "text": "As partições antigas são apagadas automaticamente sempre que uma nova partição do dia atual é criada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer particionar uma tabela de fatos no BigQuery pela coluna id_cliente, que tem 40 milhões de valores distintos. Qual é a orientação correta para essa escolha de particionamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Manter o particionamento por id_cliente, que é a prática recomendada para colunas de alta cardinalidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Evitar particionar por coluna de cardinalidade tão alta; particionar por data e usar clustering por id_cliente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Particionar por id_cliente e também por data ao mesmo tempo, somando as duas colunas na cláusula de partição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não particionar a tabela em nenhuma coluna, deixando toda a otimização de leitura a cargo do clustering.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time define id_pedido (um identificador sequencial usado só para localizar registros pontualmente) como sort key de uma tabela fato de 2 bilhões de linhas em um Redshift, mas a maioria das consultas filtra por intervalo de datas. Qual é a consequência dessa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A ordenação por id_pedido acelera automaticamente qualquer filtro por data, porque o motor reordena os dados em tempo real.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela passa a ocupar menos espaço em disco, já que id_pedido é sempre um número inteiro sequencial.",
                                "isCorrect": false
                            },
                            {
                                "text": "As consultas por intervalo de datas passam a falhar, porque a sort key não é compatível com filtros de intervalo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordenação por id_pedido não ajuda a podar blocos nas consultas por data, que continuam varrendo quase toda a tabela.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Desnormalização e wide tables em bancos colunares",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Desnormalização e wide tables em bancos colunares\n\nA normalização (módulo 2) existe para evitar anomalias de atualização em sistemas transacionais. Em um banco colunar voltado para análise, essa preocupação pesa menos, porque a carga é majoritariamente de leitura, e o preço de um `JOIN` é medido de outra forma.\n\nEsta aula olha para o motivo técnico por trás de desnormalizar mais em warehouses colunares, e para a tabela larga (**wide table**) como padrão de modelagem."
                    },
                    {
                        "type": "text",
                        "value": "## Por que juntar demais custa caro em colunar\n\nUm banco colunar guarda cada coluna em blocos separados, o que é ótimo para ler poucas colunas de muitas linhas. Um `JOIN`, porém, precisa reconstruir linhas inteiras a partir de tabelas diferentes, o que exige localizar e casar chaves, e em arquiteturas distribuídas pode exigir mover dados entre nós quando as tabelas não compartilham a mesma chave de distribuição.\n\nCada `JOIN` a mais em uma consulta frequente custa:\n\n- Mais processamento, para casar linhas, ordenar e redistribuir.\n- Mais planos de execução para o otimizador escolher, com mais chance de um plano ruim.\n- Em modelos cobrados por dado lido, potencialmente mais bytes escaneados, se o join obrigar a ler tabelas inteiras."
                    },
                    {
                        "type": "quote",
                        "value": "Uma tabela larga troca espaço em disco, que é barato, por menos JOINs em tempo de consulta, que é o recurso mais caro em um banco colunar."
                    },
                    {
                        "type": "text",
                        "value": "## Wide tables: achatar a dimensão dentro do fato\n\nA tabela larga leva a desnormalização a um ponto prático: em vez de a tabela fato guardar só chaves estrangeiras para as dimensões, ela guarda também os atributos descritivos mais consultados, replicados em cada linha.\n\nIsso é uma forma de **pré-join**: o trabalho de juntar fato e dimensão é feito uma vez, na carga (ETL ou ELT), em vez de ser refeito a cada consulta. O resultado é uma tabela mais larga, com mais colunas e dados repetidos entre linhas, mas com menos `JOIN`s para quem consulta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Esquema estrela (fato + dimensões separadas)\",\"Wide table (fato com atributos achatados)\"],[\"Espaço em disco\",\"Menor, cada atributo gravado uma vez\",\"Maior, atributos repetidos em cada linha\"],[\"Consultas\",\"Exigem JOIN com as dimensões\",\"Leem direto, sem JOIN\"],[\"Atualização de um atributo\",\"Um UPDATE na dimensão\",\"Pode exigir reprocessar linhas do fato\"],[\"Reuso em outros fatos\",\"Alto, dimensões reutilizáveis\",\"Baixo, atributos presos àquele fato\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- Fato \"magro\", aponta so para chaves de dimensao\nCREATE TABLE fato_pedido (\n    id_data      INT,\n    id_cliente   INT,\n    id_produto   INT,\n    quantidade   INT,\n    valor_total  DECIMAL(12,2)\n);\n\n-- Wide table: atributos de dimensao achatados dentro do fato\nCREATE TABLE fato_pedido_wide (\n    data_pedido       DATE,\n    ano               INT,\n    mes               INT,\n    cliente_nome      VARCHAR(120),\n    cliente_segmento  VARCHAR(40),\n    cliente_uf        VARCHAR(2),\n    produto_nome      VARCHAR(120),\n    produto_categoria VARCHAR(60),\n    quantidade        INT,\n    valor_total       DECIMAL(12,2)\n);"
                    },
                    {
                        "type": "text",
                        "value": "## Quando vale a pena achatar\n\nAchatar não é uma regra universal, é um trade-off:\n\n- Vale mais quando a dimensão é pequena, muda pouco (ou é uma SCD tipo 2, em que o valor da época é exatamente o desejado) e é consultada quase sempre junto do fato.\n- Vale menos quando a dimensão é grande, muda com frequência, ou é compartilhada por muitos fatos diferentes (dimensão conformada), porque manter o achatamento sincronizado em vários lugares cria trabalho e risco de inconsistência.\n- Na prática, muitos times mantêm o esquema estrela como modelo de origem, mais fácil de manter e auditar, e materializam wide tables como camada de consumo para os relatórios mais pesados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o principal motivo para achatar atributos de dimensão dentro da tabela fato (wide table) em um warehouse colunar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reduzir a quantidade de JOINs nas consultas, trocando espaço em disco barato por menos processamento em tempo de consulta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir o espaço em disco ocupado, já que dados repetidos em uma tabela larga comprimem melhor que dados normalizados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cumprir uma exigência das formas normais, que recomendam achatar tabelas fato sempre que for possível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Evitar que a tabela fato tenha qualquer chave estrangeira, substituindo todas elas por texto livre.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela fato guarda o nome da categoria do produto achatado em cada linha, capturado no momento da venda. Um produto muda de categoria seis meses depois, e o relatório de vendas do período anterior à mudança continua mostrando a categoria antiga. Isso é:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um bug de carga que precisa ser corrigido, porque toda tabela fato deve sempre refletir o valor mais atual da dimensão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um problema de data skew, porque a categoria antiga ficou concentrada em poucos nós do warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um efeito esperado do achatamento: a linha do fato reflete o atributo válido na época da venda, como em uma SCD tipo 2.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma violação da terceira forma normal, que não deveria acontecer em nenhuma tabela de um data warehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma dimensão de cliente, com 200 atributos e usada por doze tabelas fato diferentes, muda com frequência (endereço, segmento, score de crédito). Uma equipe propõe achatar todos os atributos de cliente em cada uma das doze tabelas fato. Qual é o principal risco dessa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O warehouse colunar não permite fisicamente que uma dimensão seja usada por mais de uma tabela fato ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter os atributos sincronizados em doze lugares diferentes fica caro e sujeito a inconsistência entre os fatos.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tabela fato perde a capacidade de ser filtrada por data, já que ganhou colunas demais no achatamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O esquema deixa de ser um data warehouse e passa a ser considerado, por definição, um sistema OLTP.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma dimensão de 12 linhas (meses do ano), que praticamente nunca muda, é usada em quase toda consulta de uma tabela fato de bilhões de linhas. Do ponto de vista de custo e desempenho em um warehouse colunar cobrado por dado lido, qual é a decisão mais razoável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Manter a dimensão separada e proibir qualquer achatamento, porque toda dimensão deve ficar isolada do fato sem exceção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Duplicar a tabela fato inteira uma vez por mês, criando doze cópias para eliminar a necessidade do JOIN.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter a dimensão de meses em uma tabela fato própria, já que ela é pequena o suficiente para caber em um nó só.",
                                "isCorrect": false
                            },
                            {
                                "text": "Achatar os atributos do mês diretamente no fato, já que a dimensão é pequena, estável e quase sempre consultada junto.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de engenharia de dados decide manter o esquema estrela como modelo de origem, versionado e auditável, e gerar wide tables só como camada de consumo para os relatórios mais pesados, recriadas a partir do estrela. Qual vantagem essa abordagem preserva, que se perderia se só a wide table existisse?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A rastreabilidade: um atributo é corrigido em um único lugar, e a correção se propaga na próxima geração da wide table.",
                                "isCorrect": true
                            },
                            {
                                "text": "A eliminação do custo extra de disco, já que manter as duas estruturas juntas nunca ocupa espaço a mais no warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "A garantia de que a wide table nunca mais precisa ser reprocessada, mesmo depois de uma correção feita no estrela.",
                                "isCorrect": false
                            },
                            {
                                "text": "A conversão automática do esquema estrela para a terceira forma normal, exigida em todo data warehouse corporativo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Estrela x One Big Table x Data Vault",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Estrela, One Big Table e Data Vault\n\nAs aulas anteriores mostraram duas forças em tensão: o esquema estrela organiza fato e dimensões em tabelas separadas e reutilizáveis; a wide table achata tudo para reduzir `JOIN`s. Esta aula posiciona três abordagens de modelagem analítica lado a lado: o **esquema estrela**, a **One Big Table (OBT)**, que leva o achatamento ao extremo, e o **Data Vault**, pensado para outro problema: histórico e integração de múltiplas fontes.\n\nNenhuma das três é a certa de forma absoluta. São escolhas para contextos diferentes."
                    },
                    {
                        "type": "text",
                        "value": "## Esquema estrela: o padrão de consumo\n\nJá visto nos módulos 4 a 6: uma tabela fato central, cercada de dimensões, ligadas por chaves substitutas. Reutilizável (a mesma dimensão cliente serve a vários fatos), relativamente fácil de entender e de auditar, e o padrão que a maioria das ferramentas de BI espera.\n\nO custo é o `JOIN`: toda consulta de negócio precisa juntar o fato com uma ou mais dimensões para virar algo legível."
                    },
                    {
                        "type": "text",
                        "value": "## One Big Table: o achatamento levado ao limite\n\nA OBT é uma única tabela, larga o bastante para conter o fato e **todos** os atributos de dimensão relevantes, já pré-unidos. Não é só mais uma wide table: é a decisão de eliminar o esquema estrela como camada de consumo, e entregar uma tabela só para quem consulta (analistas, ferramentas de BI de autoatendimento, modelos de machine learning que leem uma tabela plana).\n\nFunciona bem quando:\n\n- Existe um caso de uso dominante e bem definido, sem exigir reaproveitar as dimensões em outros fatos.\n- A equipe de consumo não escreve SQL complexo, e se beneficia de nunca precisar de `JOIN`.\n- O grão é único e estável, sem misturar níveis de granularidade diferentes na mesma tabela.\n\nFunciona mal quando o mesmo conjunto de dimensões alimenta muitos fatos diferentes: cada OBT vira uma cópia quase duplicada de lógica de negócio, e uma correção em um atributo de cliente precisa ser propagada em várias tabelas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Esquema estrela\",\"One Big Table\",\"Data Vault\"],[\"Estrutura\",\"Fato e dimensões separados\",\"Uma única tabela larga\",\"Hubs, links e satellites\"],[\"JOINs para consultar\",\"Alguns, com as dimensões\",\"Nenhum ou quase nenhum\",\"Muitos, é camada de integração\"],[\"Reuso entre fatos\",\"Alto, dimensões conformadas\",\"Baixo, atributos presos à tabela\",\"Alto, é o ponto forte do modelo\"],[\"Público típico\",\"Analistas de BI\",\"Consumo final e autoatendimento\",\"Engenharia de dados\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Data Vault: histórico e integração antes do consumo\n\nO Data Vault resolve um problema diferente do estrela e da OBT: como integrar dados de várias fontes, preservando todo o histórico bruto, em um modelo que suporte mudanças na origem sem precisar remodelar tudo. Três tipos de tabela:\n\n- **Hub**: guarda a lista de chaves de negócio únicas de uma entidade (por exemplo, todo id_cliente já visto), sem atributos descritivos.\n- **Link**: guarda a associação entre hubs (um cliente fez um pedido, um pedido tem um produto), representando relacionamentos e eventos.\n- **Satellite**: guarda os atributos descritivos e o histórico de mudanças de um hub ou link, com data de validade, geralmente um satellite por fonte de dado.\n\nO Data Vault normalmente não é consultado direto por quem faz análise: ele fica entre a ingestão bruta e uma camada de esquema estrela (ou OBT) construída por cima dele para consumo."
                    },
                    {
                        "type": "code",
                        "value": "HUB_CLIENTE\n  chave de negocio: id_cliente\n\nHUB_PEDIDO\n  chave de negocio: id_pedido\n\nLINK_PEDIDO_CLIENTE\n  liga HUB_CLIENTE e HUB_PEDIDO (este pedido pertence a este cliente)\n\nSAT_CLIENTE_CRM (satellite do HUB_CLIENTE, fonte CRM)\n  nome, segmento, data_inicio_validade, data_fim_validade\n\nSAT_CLIENTE_ERP (satellite do HUB_CLIENTE, fonte ERP)\n  razao_social, segmento_erp, data_inicio_validade, data_fim_validade"
                    },
                    {
                        "type": "quote",
                        "value": "Estrela e OBT respondem como eu consulto rápido e simples. Data Vault responde como eu guardo tudo, de todas as fontes, sem perder histórico nem travar quando a origem mudar."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma One Big Table (OBT), no contexto de modelagem analítica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma tabela de dimensão que concentra as chaves substitutas de todas as outras dimensões do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tipo de índice que acelera automaticamente qualquer consulta feita sobre o esquema estrela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma única tabela larga que já traz o fato pré-unido com todos os atributos de dimensão relevantes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma tabela temporária criada pelo otimizador de consultas durante a execução de um JOIN complexo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de marketing usa uma ferramenta de BI de autoatendimento, sem escrever SQL, para analisar um único painel de campanhas. As mesmas dimensões (cliente, campanha, canal) não são usadas em nenhum outro relatório da empresa. Qual abordagem de modelagem melhor atende esse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um Data Vault completo, com hubs, links e satellites, para servir diretamente esse único painel de campanhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma One Big Table, já que existe um caso de uso único e a equipe se beneficia de não escrever JOINs.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um esquema estrela com dez dimensões novas, mesmo sem nenhum outro fato que vá reaproveitá-las.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela normalizada até a terceira forma normal, igual à usada no sistema transacional de origem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As dimensões cliente, produto e loja são usadas por oito tabelas fato diferentes em uma rede de varejo. Um analista propõe transformar cada fato em uma One Big Table própria, achatando as três dimensões em cada uma das oito tabelas. Qual é o principal problema dessa proposta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A OBT é uma técnica exclusiva do Data Vault, e não pode ser aplicada fora desse modelo de arquitetura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tabelas largas não são suportadas por warehouses colunares, que exigem sempre um esquema normalizado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O esquema estrela deixaria de existir fisicamente no banco de dados, impedindo qualquer nova consulta SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma correção em um atributo de dimensão precisaria ser propagada em oito tabelas em vez de em um único lugar.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma nova fonte de dados passa a enviar informações de clientes com um cadastro parcialmente diferente do já existente. No modelo Data Vault, onde esses novos atributos descritivos dessa fonte devem ser registrados, sem alterar a estrutura já existente do hub de cliente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em um novo satellite, ligado ao hub de cliente já existente, específico para essa fonte.",
                                "isCorrect": true
                            },
                            {
                                "text": "Diretamente no hub de cliente, adicionando as novas colunas descritivas junto da chave de negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em um novo link, conectando o hub de cliente a um hub de fonte de dados criado para a ocasião.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituindo o satellite atual, sobrescrevendo os atributos antigos pelos que vêm da nova fonte.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe implementou um Data Vault como camada única de dados históricos integrados, e agora os analistas de negócio precisam escrever relatórios consultando hubs, links e satellites diretamente, com vários JOINs para reconstruir cada entidade. Qual ajuste de arquitetura resolve essa dificuldade sem abrir mão do histórico integrado do Data Vault?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Eliminar todos os satellites do Data Vault, deixando apenas hubs e links disponíveis para consulta direta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar hubs e links para chaves naturais, removendo as chaves substitutas usadas na integração das fontes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Construir uma camada de esquema estrela (ou OBT) por cima do Data Vault, dedicada ao consumo dos analistas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Treinar os analistas para escreverem o mesmo tipo de JOIN complexo usado na carga do Data Vault.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Boas práticas e antipadrões de modelagem analítica",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Boas práticas e antipadrões de modelagem analítica\n\nEste módulo encerra a trilha revisitando decisões que atravessam todas as aulas anteriores. Não são regras novas, são os pontos onde a experiência mostra que os projetos mais erram, e como cada um se conecta com o que já foi visto sobre estrela, wide tables e warehouses na nuvem."
                    },
                    {
                        "type": "text",
                        "value": "## Definir o grão antes de tudo\n\nO grão (aula do módulo 4) é a primeira decisão de qualquer tabela fato, e a mais cara de corrigir depois. Um erro comum é começar a modelar pelas colunas (quais métricas eu quero?) antes de responder o que é uma linha desta tabela.\n\nUm grão indefinido aparece depois como sintoma: métricas batendo errado, duplicação em `JOIN`s, ou uma mesma tabela fato misturando linhas de granularidades diferentes (pedido e item do pedido, por exemplo) sem uma coluna que diferencie os níveis."
                    },
                    {
                        "type": "text",
                        "value": "## Dimensões conformadas e nomenclatura consistente\n\nUma dimensão conformada (módulo 5) só funciona se **significar a mesma coisa** em todo lugar onde aparece. Isso depende de disciplina, não só de modelagem:\n\n- O mesmo atributo tem o mesmo nome de coluna em todas as tabelas (id_cliente, e não ora cliente_id, ora cod_cli, ora customer_id).\n- A mesma métrica é calculada da mesma forma em todos os relatórios (receita líquida não pode significar uma coisa no painel financeiro e outra no painel comercial).\n- Chaves substitutas seguem um padrão único (tipo, geração, valor reservado para desconhecido) em todas as dimensões.\n\nSem isso, cada equipe reinterpreta os dados à sua maneira, e o warehouse deixa de ser uma fonte única de verdade."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Antipadrão\",\"Sintoma\",\"Como evitar\"],[\"Pântano de dados\",\"Dados brutos empilhados sem modelo, catálogo ou dono\",\"Definir grão, dimensões e responsável antes de liberar para consumo\"],[\"Grão misturado\",\"Métricas somando errado, duplicação em JOIN\",\"Uma granularidade por tabela fato, documentada\"],[\"Dimensão não conformada\",\"Mesmo atributo com nomes ou significados diferentes por área\",\"Bus matrix e revisão antes de publicar\"],[\"Nomenclatura inconsistente\",\"cliente_id, cod_cli e customer_id na mesma base\",\"Convenção de nomes única, aplicada por revisão\"],[\"Chave substituta ausente\",\"Uso de chave natural instável como chave de dimensão\",\"Gerar surrogate key sempre na carga da dimensão\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um data lake ou warehouse sem modelo não é flexível, é um pântano de dados: parece rápido de alimentar até o dia em que ninguém mais confia no que está lá dentro."
                    },
                    {
                        "type": "text",
                        "value": "## Outros erros recorrentes\n\n- **Desnormalizar sem critério**: achatar tudo em wide tables sem considerar quantos fatos compartilham a dimensão (aula 3), criando cópias divergentes do mesmo atributo.\n- **Ignorar SCD**: tratar toda mudança de atributo como sobrescrita (tipo 1) quando o negócio precisa do histórico (tipo 2), ou o contrário, guardando histórico que ninguém pediu e complicando consultas simples.\n- **Modelar para uma pergunta só**: desenhar o fato em função de um único painel, sem folga para as próximas perguntas óbvias do negócio.\n- **Esquecer o dono do dado**: publicar uma dimensão ou fato sem alguém responsável por validar mudanças de definição ao longo do tempo."
                    },
                    {
                        "type": "text",
                        "value": "## Uma checklist mínima antes de publicar um fato novo\n\n- O grão está escrito em uma frase, e cada linha da tabela corresponde exatamente a essa frase.\n- As dimensões usadas já existem (conformadas) ou foram criadas de propósito para serem reaproveitadas.\n- Os nomes de colunas seguem a convenção adotada no restante do warehouse.\n- O tipo de SCD de cada dimensão relacionada foi decidido de forma explícita, não por acidente.\n- Existe um responsável (time ou pessoa) pela definição de negócio por trás de cada métrica nova.\n\nNenhum desses pontos é sofisticado. A maior parte dos problemas de modelagem analítica em produção vem de pular um destes básicos sob pressão de prazo, não de falta de técnica avançada."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza um \"pântano de dados\" (data swamp)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um data warehouse colunar que separa armazenamento e computação em camadas independentes na nuvem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um repositório de dados brutos, acumulados sem modelo, catálogo ou dono definido, pouco confiável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma tabela fato que mistura métricas aditivas e semi-aditivas na mesma linha, de forma documentada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um esquema estrela com dimensões conformadas, reutilizadas por várias tabelas fato diferentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela fato de vendas tem, na mesma tabela, linhas que representam um pedido inteiro e linhas que representam cada item de um pedido, sem nenhuma coluna que diferencie os dois níveis. Um relatório que soma valor_total está retornando valores maiores do que o esperado. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A tabela está sofrendo data skew, porque os pedidos estão distribuídos de forma desigual entre os nós do warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "A dimensão de produto não está conformada, então cada item aparece com um nome de produto diferente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A chave substituta do pedido foi gerada de forma aleatória, causando duplicação de linhas na carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grão da tabela está misturado, e a soma está contando o mesmo pedido tanto no nível de cabeçalho quanto no de item.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O time financeiro chama a coluna de identificador do cliente de cod_cli, o time comercial usa cliente_id na mesma dimensão de cliente, e um novo fato criado pela equipe de logística usa customer_id. Qual problema essa inconsistência tende a causar primeiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dificuldade de reconhecer que é o mesmo atributo, atrapalhando o reuso da dimensão como conformada entre as áreas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Erro de tipo de dado, já que colunas com nomes diferentes são obrigadas a ter tipos diferentes no warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Perda automática de histórico da dimensão, porque a SCD tipo 2 exige um único nome de coluna em toda a empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Impossibilidade técnica de fazer JOIN entre as tabelas, já que nomes de coluna diferentes bloqueiam a operação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista começa a modelar uma tabela fato listando as métricas que o painel precisa mostrar (receita, quantidade, desconto), e só depois de terminar as colunas percebe que não sabe dizer, em uma frase, o que representa uma linha da tabela. Qual prática, se aplicada antes, evitaria esse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Escolher primeiro a chave substituta da tabela fato, deixando o grão para ser inferido depois pelo otimizador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar todas as dimensões conformadas da empresa antes de desenhar a primeira tabela fato do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir o grão da tabela fato em uma frase antes de escolher qualquer coluna de métrica.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever o DDL completo da tabela em SQL antes de validar qualquer métrica com a área de negócio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide achatar a dimensão de cliente (80 atributos) dentro de quinze tabelas fato diferentes, sem verificar antes se essa dimensão é usada por mais de um fato. Meses depois, uma correção no segmento de um cliente precisa ser aplicada manualmente em vários lugares, e alguns ficam desatualizados. Qual decisão, tomada antes do achatamento, teria evitado esse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumentar o número de nós do cluster de computação, já que o problema é de desempenho, não de modelagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Verificar, como na matriz de barramento, quantos fatos compartilham a dimensão antes de decidir achatá-la em cada um.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar a chave substituta da dimensão de cliente por uma chave natural, o que evita qualquer necessidade de correção futura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar a dimensão de cliente para o modelo de Data Vault, eliminando a necessidade de qualquer tabela fato.",
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
