// Seed da trilha SQL para Dados, estagio 3 do roadmap de Engenharia de Dados e estagio 5 do de Ciencia de Dados
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-sql-para-dados.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "SQL para Dados";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "SQL escrito para quem analisa dados, não para quem constrói aplicação. Começa na primeira consulta e vai até funções de janela, agregação por tempo, coorte de retenção e leitura de plano de execução. Todos os exemplos são perguntas reais de análise resolvidas em PostgreSQL.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - O dado em tabelas",
    aulas: [
        {
            titulo: "Por que tabela e não planilha",
            blocks: [
                {
                    type: "text",
                    value: "# A planilha não erra, ela só não avisa\n\nQuase toda análise começa numa planilha, e por bons motivos: você vê o dado, mexe nele com o mouse e o resultado aparece na hora. O problema é que a planilha foi feita para uma pessoa editar valores, não para muita gente responder perguntas sobre milhões de linhas. E quando ela deixa de servir, ela não avisa. O número continua aparecendo, só que errado.\n\nO defeito estrutural é que na planilha cada célula é independente. A coluna de datas pode ter três células que são texto, uma que é número e o resto data de verdade, e nada impede isso. A fórmula da linha 4000 pode apontar para um intervalo que parou na linha 3800 porque alguém arrastou até ali. Ninguém percebe, porque o total continua saindo.\n\nNuma tabela de banco de dados, a garantia muda de lugar. O tipo não é da célula, é da coluna inteira: se a coluna é do tipo data, não existe uma linha com texto ali dentro. A forma da linha é fixa, as regras valem para todas as linhas presentes e futuras, e o banco recusa o que não obedece. É menos livre e muito mais confiável, que é exatamente a troca que a análise séria precisa fazer.",
                },
                {
                    type: "text",
                    value: "## SQL é um pedido, não um passo a passo\n\nA segunda diferença é a linguagem. Na planilha, o que foi feito está registrado em cliques: você filtrou, ordenou, copiou uma coluna, colou como valor. Seis meses depois ninguém consegue refazer aquilo igual, nem você.\n\nEm SQL você escreve o que quer, em texto. A consulta é um pedido declarativo: descreve o resultado desejado e deixa o banco decidir como chegar lá, qual arquivo ler primeiro, qual índice usar, se vale a pena ler em paralelo. Você não programa o caminho, você descreve o destino.\n\nIsso tem duas consequências enormes para quem trabalha com dados. Primeiro, a análise vira texto: dá para versionar no Git, pedir revisão de um colega, rodar de novo daqui a um ano e obter o mesmo resultado. Segundo, quando o volume cresce, o banco pode mudar completamente a estratégia de execução sem você reescrever nada.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Planilha","Tabela em banco"],["Tipo do dado","Definido célula a célula","Definido para a coluna inteira"],["Regra de integridade","Nenhuma por padrão","Chave, tipo e restrição declaradas"],["Registro do que foi feito","Sequência de cliques","Consulta em texto, versionável"],["Volume confortável","Dezenas de milhares de linhas","Centenas de milhões de linhas"],["Quem lê ao mesmo tempo","Uma pessoa por arquivo","Muita gente, sem copiar o dado"],["Como se pede o resultado","Fórmula que aponta intervalo","Consulta que descreve o recorte"]]',
                },
                {
                    type: "quote",
                    value: "Planilha é onde o dado é editado por uma pessoa. Tabela é onde o dado é consultado por muitas. Metade dos relatórios errados nasce de confundir os dois papéis.",
                },
                {
                    type: "text",
                    value: "## O que você ganha ao mudar de lugar\n\nQuando o dado sai do arquivo e vai para uma tabela, três coisas passam a ser possíveis. A primeira é responder à pergunta sem carregar tudo: você pede a soma de vendas de março e o banco lê só o que precisa, em vez de abrir dois gigabytes na memória do seu notebook.\n\nA segunda é combinar fontes. A venda mora numa tabela, o cadastro do produto em outra, a campanha de marketing em uma terceira. Uma consulta junta as três no momento da pergunta, sem ninguém colar coluna em lugar nenhum.\n\nA terceira é confiar no resultado. Se a coluna de valor é numérica, ninguém digitou um traço no meio dela. Se o identificador do produto é chave estrangeira, não existe venda apontando para produto inexistente. Nas próximas aulas você vai ver exatamente como essas garantias são declaradas e o que acontece com a sua análise quando elas faltam.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é a diferença estrutural entre uma planilha e uma tabela de banco de dados?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O tipo vale para a coluna inteira, não célula a célula",
                            isCorrect: true,
                        },
                        {
                            text: "O banco recalcula as fórmulas toda vez que a aba é aberta",
                            isCorrect: false,
                        },
                        {
                            text: "A planilha não deixa dois usuários lerem ao mesmo tempo",
                            isCorrect: false,
                        },
                        {
                            text: "A tabela aceita apenas colunas de texto e de número",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa dizer que SQL é uma linguagem declarativa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Você descreve o resultado e o banco escolhe o caminho",
                            isCorrect: true,
                        },
                        {
                            text: "Você declara todas as variáveis antes de usar cada uma",
                            isCorrect: false,
                        },
                        {
                            text: "Você escreve o passo a passo da leitura de cada arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "Você precisa declarar qual índice a consulta deve usar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um total mensal em planilha começou a divergir do sistema de origem. Qual causa é a mais provável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma fórmula arrastada cujo intervalo ficou incompleto",
                            isCorrect: true,
                        },
                        {
                            text: "O sistema de origem trocou o idioma dos cabeçalhos",
                            isCorrect: false,
                        },
                        {
                            text: "A planilha perdeu a conexão com o servidor de arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "O arquivo foi salvo num formato mais novo que o antigo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que uma análise escrita em SQL é mais reprodutível que uma planilha?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A consulta é texto, então dá para versionar e repetir",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta roda mais rápido do que a mesma conta na aba",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta dispensa qualquer conhecimento das tabelas",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta é convertida em planilha automaticamente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma analista precisa somar vendas de março a partir de uma base de trezentos milhões de linhas. Qual vantagem do banco pesa mais aqui?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ele lê só o recorte pedido, sem carregar a base toda",
                            isCorrect: true,
                        },
                        {
                            text: "Ele guarda o dado sempre comprimido, ocupando bem menos",
                            isCorrect: false,
                        },
                        {
                            text: "Ele mantém a base inteira na memória do computador local",
                            isCorrect: false,
                        },
                        {
                            text: "Ele converte a consulta em uma fórmula equivalente antes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O modelo relacional para quem analisa",
            blocks: [
                {
                    type: "text",
                    value: "# Uma tabela por tipo de coisa\n\nO modelo relacional tem uma ideia central e simples: cada tabela guarda um tipo de coisa, e cada linha é uma ocorrência daquele tipo. A tabela de vendas guarda vendas, uma linha por venda. A tabela de produtos guarda produtos, uma linha por produto. A tabela de clientes guarda clientes. Nada de misturar.\n\nDentro de uma linha, cada coluna é um atributo daquela ocorrência: a data em que a venda aconteceu, o canal por onde ela entrou, a quantidade, o valor. E a coluna tem um domínio, ou seja, um conjunto de valores aceitáveis. Data é data, valor é número com casas decimais, canal é texto de uma lista curta.\n\nA consequência prática disso é que o dado de uma análise quase nunca mora numa tabela só. A venda sabe qual produto foi vendido, mas não sabe o nome dele; sabe qual cliente comprou, mas não sabe a cidade. Reunir isso na hora da pergunta é o trabalho da junção, que você vai aprender no módulo 3.",
                },
                {
                    type: "code",
                    value: "-- Tres tabelas do nosso cenario de vendas, bem simplificadas.\n-- Repare que vendas guarda IDs, nao textos repetidos.\nCREATE TABLE produtos (\n    id          integer PRIMARY KEY,\n    nome        text        NOT NULL,\n    categoria   text        NOT NULL,\n    preco_lista numeric(10,2) NOT NULL\n);\n\nCREATE TABLE clientes (\n    id        integer PRIMARY KEY,\n    nome      text NOT NULL,\n    cidade    text,\n    uf        char(2),\n    criado_em date NOT NULL\n);\n\nCREATE TABLE vendas (\n    id          bigint PRIMARY KEY,\n    data_venda  date    NOT NULL,\n    cliente_id  integer NOT NULL REFERENCES clientes (id),\n    produto_id  integer NOT NULL REFERENCES produtos (id),\n    canal       text    NOT NULL,\n    quantidade  integer NOT NULL,\n    valor       numeric(10,2) NOT NULL\n);",
                },
                {
                    type: "text",
                    value: "## Fato e dimensão, o vocabulário de quem analisa\n\nQuem trabalha com dados costuma olhar esse mesmo desenho com outros nomes. A tabela que registra acontecimentos, com uma linha por evento e colunas numéricas que se somam, é a tabela de fatos. Vendas é um fato. Eventos de produto são um fato. Leituras de sensor são um fato.\n\nAs tabelas que descrevem o contexto do acontecimento são as dimensões: produto, cliente, loja, campanha, calendário. Elas costumam ser pequenas, mudam pouco e servem para dizer por quais recortes você pode olhar o fato. Faturamento por categoria, por estado, por canal: cada um desses recortes vem de uma dimensão.\n\nEsse vocabulário explica por que a tabela de vendas guarda produto_id em vez do nome do produto. Primeiro, porque repetir o texto em duzentos milhões de linhas custa espaço e leitura. Segundo, e mais importante, porque se o nome do produto mudar você corrige em um lugar só. O identificador é estável, o rótulo é volátil.",
                },
                {
                    type: "table",
                    value: '[["Papel","O que guarda","Exemplo","Tamanho típico"],["Fato","Acontecimentos com medidas","vendas, eventos, leituras","Enorme e sempre crescendo"],["Dimensão","Contexto que descreve o fato","produtos, clientes, campanhas","Pequena e estável"],["Medida","Coluna numérica que soma","valor, quantidade, duração","Uma por aspecto medido"],["Atributo","Coluna pela qual se recorta","categoria, uf, canal","Poucos valores distintos"],["Chave","Ligação entre fato e dimensão","produto_id, cliente_id","Um número por linha"]]',
                },
                {
                    type: "quote",
                    value: "O fato responde quanto e quando. A dimensão responde de quem, de quê e de onde. Toda análise é um fato recortado por dimensões, e saber isso já organiza metade das suas consultas.",
                },
            ],
            questions: [
                {
                    statement: "No modelo relacional, o que uma linha de uma tabela representa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma ocorrência, com um valor para cada coluna definida",
                            isCorrect: true,
                        },
                        {
                            text: "Um conjunto de células livres para digitar qualquer coisa",
                            isCorrect: false,
                        },
                        {
                            text: "Uma cópia da estrutura da tabela, repetida para leitura",
                            isCorrect: false,
                        },
                        {
                            text: "Um agrupamento de várias tabelas ligadas entre si por id",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza uma tabela de fatos numa análise?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Registra acontecimentos e traz medidas que se somam",
                            isCorrect: true,
                        },
                        {
                            text: "Descreve o contexto usado para recortar os números",
                            isCorrect: false,
                        },
                        {
                            text: "Guarda apenas o resultado final já agregado por mês",
                            isCorrect: false,
                        },
                        {
                            text: "Concentra as regras de acesso e permissão do relatório",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a tabela de vendas guarda produto_id em vez do nome do produto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O id é estável e o nome muda em um lugar só quando muda",
                            isCorrect: true,
                        },
                        {
                            text: "O nome do produto não pode ser guardado em coluna de texto",
                            isCorrect: false,
                        },
                        {
                            text: "O banco só aceita colunas numéricas em tabela de fato",
                            isCorrect: false,
                        },
                        {
                            text: "O id ocupa mais espaço, mas garante ordenação alfabética",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe quer analisar faturamento por categoria de produto e por estado do cliente. De onde vêm esses dois recortes?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Das dimensões produtos e clientes, ligadas pelos ids",
                            isCorrect: true,
                        },
                        {
                            text: "Da própria tabela de vendas, que já traz os dois textos",
                            isCorrect: false,
                        },
                        {
                            text: "De uma tabela de resumo criada só para esse relatório",
                            isCorrect: false,
                        },
                        {
                            text: "Do catálogo interno do banco, que descreve as colunas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um analista propõe copiar nome, categoria, cidade e estado para dentro da tabela de vendas, que tem duzentos milhões de linhas. Qual é o principal risco?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Corrigir um rótulo passa a exigir reescrever a base toda",
                            isCorrect: true,
                        },
                        {
                            text: "A tabela deixaria de aceitar novas linhas depois da cópia",
                            isCorrect: false,
                        },
                        {
                            text: "As colunas de texto impedem qualquer soma na consulta",
                            isCorrect: false,
                        },
                        {
                            text: "O banco perderia a capacidade de ordenar por data_venda",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Tipos de dado e o que o tipo errado custa",
            blocks: [
                {
                    type: "text",
                    value: "# O tipo é a primeira regra de qualidade\n\nEscolher o tipo de uma coluna parece detalhe de quem cria a tabela, mas é a primeira decisão que afeta a sua análise. O tipo define o que pode entrar, como o banco ordena, como compara e quais funções ficam disponíveis. Quando o tipo está errado, a consulta continua rodando e devolvendo número. Ele só não é o número certo.\n\nO caso mais comum e mais caro é a data guardada como texto. Ordenar texto é ordenar alfabeticamente, então 10/01/2026 vem antes de 2/01/2026, porque o caractere 1 vem antes do 2. Filtrar um intervalo vira sorte. Agrupar por mês exige recortar pedaço de string. E nada disso dá erro: dá resultado.\n\nO segundo caso é o número guardado como texto. Em texto, o valor 9 é maior que 10 na ordenação, e somar exige converter. O terceiro é usar ponto flutuante para dinheiro: double precision guarda 0,1 de forma aproximada, e ao somar milhões de linhas a diferença aparece nos centavos, justamente onde alguém confere.",
                },
                {
                    type: "code",
                    value: "-- Comparando ordenacao de texto com ordenacao de data e de numero.\n-- Os dois primeiros SELECTs mostram a armadilha.\nSELECT unnest(ARRAY['10/01/2026', '2/01/2026', '31/12/2025']) AS data_texto\nORDER BY data_texto;          -- 10/01, 2/01, 31/12: ordem alfabetica\n\nSELECT unnest(ARRAY['9', '10', '100']) AS numero_texto\nORDER BY numero_texto;        -- 10, 100, 9: tambem alfabetica\n\n-- Com o tipo certo, a ordem e a que voce espera:\nSELECT unnest(ARRAY[DATE '2026-01-10', DATE '2026-01-02']) AS dia\nORDER BY dia;\n\n-- Dinheiro em ponto flutuante nao fecha; numeric fecha.\nSELECT 0.1::double precision + 0.2::double precision AS com_float,\n       0.1::numeric          + 0.2::numeric          AS com_numeric;",
                },
                {
                    type: "table",
                    value: '[["Dado","Tipo certo","Tipo errado comum","Sintoma na análise"],["Data do evento","date","text","Ordem alfabética e filtro de período furado"],["Instante com fuso","timestamptz","timestamp","Relatório diário troca de dia entre regiões"],["Valor em reais","numeric","double precision","Diferença de centavos ao somar muitas linhas"],["Identificador","bigint","text","Junção lenta e comparação por caractere"],["CEP ou CNPJ","text","integer","Zero à esquerda some e o código quebra"],["Sinalizador","boolean","text","Aparecem sim, S, true e 1 na mesma coluna"],["Atributo variável","jsonb","text","Não dá para filtrar por chave sem gambiarra"]]',
                },
                {
                    type: "quote",
                    value: "Tipo errado não gera erro, gera relatório. É por isso que ele sobrevive tanto tempo: ninguém percebe o problema, só percebe a divergência, meses depois, quando já virou decisão.",
                },
                {
                    type: "text",
                    value: "## Fuso horário, o erro silencioso favorito\n\nUm caso merece parágrafo próprio porque assombra toda equipe de dados: o instante sem fuso. O tipo timestamp guarda uma data e uma hora sem dizer de onde, então 2026-03-01 00:30 pode ser meia-noite e meia em São Paulo ou em Londres, e o banco não sabe qual. O tipo timestamptz guarda o instante absoluto e converte na leitura.\n\nO efeito prático aparece no relatório diário. Se os eventos foram gravados em horário universal e a análise agrupa por dia sem converter, tudo que aconteceu depois das 21h no Brasil cai no dia seguinte. O total do mês fecha, mas nenhum dia individual bate com o que a operação viu, e a discussão dura semanas.\n\nA regra prática é curta: guarde instantes em timestamptz, converta para o fuso do negócio no momento de agrupar e deixe isso explícito na consulta. Data pura, como a competência de uma fatura, continua sendo date, porque ali não existe hora nenhuma para converter.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o efeito de guardar uma data como texto numa coluna?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A ordenação vira alfabética e o filtro de período falha",
                            isCorrect: true,
                        },
                        {
                            text: "O banco recusa a inserção de qualquer linha nova ali",
                            isCorrect: false,
                        },
                        {
                            text: "A coluna passa a ocupar exatamente o dobro de espaço",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta lança erro de conversão na primeira leitura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que valores monetários devem usar numeric em vez de double precision?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Numeric guarda o valor exato, sem erro de arredondamento",
                            isCorrect: true,
                        },
                        {
                            text: "Numeric aceita mais casas decimais do que qualquer float",
                            isCorrect: false,
                        },
                        {
                            text: "Numeric é o único tipo que permite somar dentro do banco",
                            isCorrect: false,
                        },
                        {
                            text: "Numeric ocupa menos espaço em disco do que o ponto flutuante",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Ordenando os textos '9', '10' e '100' numa coluna do tipo text, qual sequência o Postgres devolve?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "10, 100 e 9, porque a comparação é caractere a caractere",
                            isCorrect: true,
                        },
                        {
                            text: "9, 10 e 100, porque o banco reconhece que são números",
                            isCorrect: false,
                        },
                        {
                            text: "100, 10 e 9, porque textos maiores vêm sempre primeiro",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem de inserção, porque texto não pode ser ordenado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Eventos foram gravados em horário universal e a análise agrupa por dia sem converter fuso. O que acontece com o relatório diário no Brasil?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O que ocorre à noite entra no dia seguinte e o dia não bate",
                            isCorrect: true,
                        },
                        {
                            text: "O total do mês fica errado, mas cada dia continua correto",
                            isCorrect: false,
                        },
                        {
                            text: "O agrupamento falha e devolve erro de conversão de fuso",
                            isCorrect: false,
                        },
                        {
                            text: "Os eventos noturnos ficam de fora do resultado agrupado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que guardar um CEP numa coluna do tipo integer é uma má ideia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O zero à esquerda desaparece e o código deixa de valer",
                            isCorrect: true,
                        },
                        {
                            text: "O tipo integer não comporta a quantidade de dígitos usada",
                            isCorrect: false,
                        },
                        {
                            text: "O banco recusa qualquer comparação entre dois inteiros",
                            isCorrect: false,
                        },
                        {
                            text: "A coluna numérica não pode participar de agrupamento",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Chave primária e chave estrangeira",
            blocks: [
                {
                    type: "text",
                    value: "# Sem chave, você não sabe se contou duas vezes\n\nChave primária é a coluna, ou o conjunto de colunas, que identifica uma linha sem ambiguidade. Ela não aceita valor repetido nem nulo. Parece burocracia de quem modela, mas para quem analisa ela responde a uma pergunta que assombra todo relatório: essa linha é uma venda de verdade ou é a mesma venda que entrou duas vezes?\n\nSem chave primária, nada impede que a carga da madrugada rode duas vezes e duplique tudo. A soma dobra, a contagem de clientes distintos não muda, e a divergência aparece só quando alguém compara com outra fonte. Com chave primária, a segunda carga esbarra na restrição e falha barulhentamente, que é o comportamento desejável.\n\nExiste ainda a distinção entre chave natural e chave artificial. A natural vem do negócio, como o número da nota fiscal. A artificial é um número sequencial que só existe dentro do banco. A artificial é estável e pequena, mas quem analisa precisa saber qual coluna representa a identidade real do evento, porque é ela que revela duplicata vinda da origem.",
                },
                {
                    type: "code",
                    value: "-- A chave primaria impede a mesma venda duas vezes.\n-- A chave estrangeira impede venda apontando para produto inexistente.\nCREATE TABLE assinaturas (\n    id           bigint PRIMARY KEY,\n    cliente_id   integer NOT NULL REFERENCES clientes (id),\n    plano        text    NOT NULL,\n    inicio       date    NOT NULL,\n    fim          date,\n    valor_mensal numeric(10,2) NOT NULL\n);\n\n-- Chave composta: um cliente nao pode ter duas linhas do mesmo mes.\nCREATE TABLE receita_mensal (\n    cliente_id integer NOT NULL REFERENCES clientes (id),\n    competencia date   NOT NULL,\n    receita     numeric(12,2) NOT NULL,\n    PRIMARY KEY (cliente_id, competencia)\n);",
                },
                {
                    type: "text",
                    value: "## A chave estrangeira protege a junção\n\nChave estrangeira é a coluna que aponta para a chave primária de outra tabela. Quando vendas.produto_id é declarado como referência a produtos.id, o banco passa a garantir duas coisas: não entra venda com produto que não existe, e não some produto que ainda tem venda apontando para ele.\n\nPara quem analisa, isso evita a linha órfã, que é o problema mais irritante da junção. Se existirem vendas com produto_id que não está em produtos, uma junção interna simplesmente descarta essas vendas, e o faturamento por categoria fica menor que o faturamento total. O número não dá erro, ele só encolhe.\n\nUm aviso honesto: em ambiente analítico as chaves estrangeiras costumam não existir. Data warehouse e data lake muitas vezes abrem mão delas por custo de carga, o que empurra a verificação para você. É por isso que uma etapa de qualidade, contando órfãos e duplicatas, faz parte do trabalho, e é o que fecha o módulo 7 desta trilha.",
                },
                {
                    type: "table",
                    value: '[["Restrição","O que garante","O que quebra sem ela"],["PRIMARY KEY","Linha única e identificável","Carga repetida dobra a soma sem avisar"],["Chave composta","Unicidade de uma combinação","Dois valores para o mesmo cliente e mês"],["FOREIGN KEY","O id apontado existe de verdade","Linha órfã some na junção interna"],["NOT NULL","A coluna sempre tem valor","Agregação ignora linha e o total encolhe"],["UNIQUE","Nenhum valor repetido na coluna","Contagem de distintos deixa de bater"],["CHECK","O valor está na faixa esperada","Quantidade negativa entra e polui a média"]]',
                },
                {
                    type: "quote",
                    value: "Duplicata não dá erro, dá crescimento. Todo analista já comemorou um pico de faturamento que era só a carga da madrugada rodando duas vezes.",
                },
            ],
            questions: [
                {
                    statement: "O que uma chave primária garante sobre a tabela?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Que nenhuma linha se repete e nenhuma fica sem identidade",
                            isCorrect: true,
                        },
                        {
                            text: "Que as linhas ficam ordenadas por data de inserção no disco",
                            isCorrect: false,
                        },
                        {
                            text: "Que toda coluna da tabela recusa valores nulos ou vazios",
                            isCorrect: false,
                        },
                        {
                            text: "Que a consulta sempre usa índice ao filtrar essa tabela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual efeito uma carga duplicada tem sobre uma análise de faturamento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A soma dobra enquanto a contagem de clientes não muda",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta passa a devolver erro de chave já existente",
                            isCorrect: false,
                        },
                        {
                            text: "A soma continua correta porque o banco ignora repetidos",
                            isCorrect: false,
                        },
                        {
                            text: "A contagem de clientes dobra e a soma segue igual antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que uma chave estrangeira impede na prática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Que uma venda aponte para um produto que não existe",
                            isCorrect: true,
                        },
                        {
                            text: "Que duas vendas tenham exatamente o mesmo valor pago",
                            isCorrect: false,
                        },
                        {
                            text: "Que uma coluna numérica receba um valor negativo ali",
                            isCorrect: false,
                        },
                        {
                            text: "Que a tabela de produtos receba linhas novas sem revisão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma base sem chave estrangeira tem vendas cujo produto_id não existe em produtos. O que acontece com o faturamento por categoria?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ele fica menor que o total, pois as órfãs são descartadas",
                            isCorrect: true,
                        },
                        {
                            text: "Ele fica maior que o total, pois as órfãs contam duas vezes",
                            isCorrect: false,
                        },
                        {
                            text: "Ele continua igual, pois a junção mantém as linhas órfãs",
                            isCorrect: false,
                        },
                        {
                            text: "Ele falha com erro de referência inválida na hora de somar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para que serve uma chave primária composta como (cliente_id, competencia)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Garantir uma única linha por cliente em cada mês medido",
                            isCorrect: true,
                        },
                        {
                            text: "Permitir que o cliente apareça em vários meses seguidos",
                            isCorrect: false,
                        },
                        {
                            text: "Acelerar a leitura de qualquer coluna dessa mesma tabela",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir a chave estrangeira para a tabela de clientes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Banco transacional e banco analítico",
            blocks: [
                {
                    type: "text",
                    value: "# Dois bancos com o mesmo SQL e cargas opostas\n\nO mesmo SQL que você vai aprender roda em dois mundos que têm objetivos quase opostos. O banco transacional atende o sistema que está no ar: muitas operações minúsculas por segundo, cada uma tocando uma linha ou poucas, com a exigência de gravar sem perder nada. É o banco que registra a venda no instante em que ela acontece.\n\nO banco analítico atende a pergunta: poucas consultas, cada uma varrendo centenas de milhões de linhas e trazendo três ou quatro colunas. Ninguém escreve linha a linha ali; o dado chega em lotes, e o que importa é ler muito, rápido e barato.\n\nO desenho interno segue a carga. O transacional guarda o dado por linha, porque quase sempre precisa da linha inteira de uma vez. O analítico guarda por coluna, porque a pergunta típica usa poucas colunas de muitas linhas, e ler só o que interessa muda o custo por ordem de grandeza.",
                },
                {
                    type: "text",
                    value: "## Por que colunar muda tanto o custo\n\nImagine uma tabela de vendas com quarenta colunas e trezentos milhões de linhas, e a pergunta: qual foi o faturamento por canal no ano passado? A consulta precisa de três colunas, data_venda, canal e valor. No armazenamento por linha, o banco precisa passar por todas as quarenta colunas para chegar às três, porque a linha é a unidade física de leitura.\n\nNo armazenamento por coluna, cada coluna é um arquivo separado. Ler três colunas é ler três arquivos e ignorar os outros trinta e sete. Além disso, valores de uma mesma coluna são parecidos entre si, então comprimem muito melhor: uma coluna de canal com cinco valores possíveis vira quase nada em disco.\n\nA contrapartida é simétrica. Buscar a linha inteira de uma venda específica é caro no colunar, porque exige remontar a linha a partir de quarenta arquivos. Atualizar uma linha é pior ainda. Por isso o colunar reina em análise e o formato por linha reina em produção: cada um é ótimo para a carga do outro ser péssimo.",
                },
                {
                    type: "table",
                    value: '[["Característica","Transacional (OLTP)","Analítico (OLAP)"],["Pergunta típica","Qual o pedido número 84212","Qual o faturamento por canal no ano"],["Escritas","Milhares por segundo, minúsculas","Cargas em lote, poucas vezes ao dia"],["Leitura típica","Poucas linhas, todas as colunas","Muitas linhas, poucas colunas"],["Armazenamento","Por linha","Por coluna"],["Modelagem","Normalizada, sem repetição","Desnormalizada, fato e dimensão"],["Índice","Muitos, por chave de acesso","Poucos, particionamento pesa mais"],["Métrica de sucesso","Latência por transação","Volume varrido por segundo"]]',
                },
                {
                    type: "quote",
                    value: "Rodar consulta analítica pesada no banco de produção é dividir o mesmo disco entre quem paga a conta e quem estuda a conta. Quando os dois brigam, quem perde é a venda.",
                },
                {
                    type: "text",
                    value: "## A consequência prática no seu dia a dia\n\nA primeira consequência é operacional: consulta analítica pesada não roda no banco de produção. Uma varredura de trezentos milhões de linhas segura disco e memória por minutos, e o sistema que atende cliente fica lento junto. A solução usual é ler de uma réplica ou de um armazém de dados alimentado por um processo periódico.\n\nA segunda é de expectativa. No transacional, uma consulta que demora dois segundos é um problema grave. No analítico, dois segundos para varrer bilhões de linhas é excelente. Levar o instinto de um mundo para o outro leva a otimizações inúteis e a sustos desnecessários.\n\nA terceira é de modelagem, e vale guardar: no analítico, repetir dado costuma ser barato e ler menos costuma ser caro. Muita coisa que parece feia na teoria relacional, como uma tabela larga e desnormalizada, é a escolha certa quando o objetivo é varrer rápido. O resto desta trilha é escrito com esse mundo em mente.",
                },
            ],
            questions: [
                {
                    statement: "Qual carga de trabalho caracteriza um banco transacional?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Muitas operações pequenas, cada uma em poucas linhas",
                            isCorrect: true,
                        },
                        {
                            text: "Poucas consultas grandes varrendo milhões de registros",
                            isCorrect: false,
                        },
                        {
                            text: "Cargas em lote uma vez por dia, sempre de madrugada",
                            isCorrect: false,
                        },
                        {
                            text: "Leituras que trazem poucas colunas de muitas linhas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o armazenamento por coluna favorece consultas analíticas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele lê só as colunas pedidas e ignora todas as demais",
                            isCorrect: true,
                        },
                        {
                            text: "Ele mantém todas as colunas carregadas na memória do nó",
                            isCorrect: false,
                        },
                        {
                            text: "Ele remonta a linha inteira mais rápido que o formato antigo",
                            isCorrect: false,
                        },
                        {
                            text: "Ele grava linha a linha com menos custo de escrita em disco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que dados em formato colunar comprimem melhor?",
                    difficulty: "medio",
                    options: [
                        { text: "Valores da mesma coluna são parecidos entre si", isCorrect: true },
                        {
                            text: "As colunas são gravadas sem nenhum cabeçalho junto",
                            isCorrect: false,
                        },
                        {
                            text: "Cada linha é reduzida a uma única chave numérica",
                            isCorrect: false,
                        },
                        {
                            text: "O formato descarta as colunas de texto ao gravar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual operação é notoriamente cara num banco colunar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Buscar e atualizar a linha inteira de um único registro",
                            isCorrect: true,
                        },
                        {
                            text: "Somar uma coluna numérica ao longo de milhões de linhas",
                            isCorrect: false,
                        },
                        {
                            text: "Contar quantos valores distintos existem em uma coluna",
                            isCorrect: false,
                        },
                        {
                            text: "Filtrar um intervalo de datas em uma tabela particionada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma analista precisa varrer um ano de vendas para um estudo. Por que rodar isso direto no banco de produção é arriscado?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A varredura disputa disco e memória com quem atende cliente",
                            isCorrect: true,
                        },
                        {
                            text: "O banco de produção não aceita consultas com agregação nenhuma",
                            isCorrect: false,
                        },
                        {
                            text: "A leitura pode alterar valores das linhas percorridas no caminho",
                            isCorrect: false,
                        },
                        {
                            text: "O resultado seria diferente do obtido no armazém de dados",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Consultando de verdade",
    aulas: [
        {
            titulo: "SELECT e projeção",
            blocks: [
                {
                    type: "text",
                    value: "# Escolher colunas já é uma decisão de análise\n\nA consulta mais simples do SQL tem duas partes: de onde vem o dado e o que você quer ver dele. O FROM diz a tabela, o SELECT diz as colunas. Essa escolha de colunas tem nome no vocabulário relacional: projeção. Você projeta a tabela larga sobre o recorte estreito que interessa à pergunta.\n\nO SELECT não se limita a repetir colunas existentes. Ele aceita expressão: multiplicar quantidade por valor, arredondar, concatenar, converter tipo, aplicar uma condição com CASE. Cada expressão vira uma coluna nova no resultado, e o apelido dado com AS é o nome que ela terá dali para frente.\n\nVale entender desde já que o resultado de uma consulta é ele próprio uma tabela: mesma ideia de linhas e colunas, só que temporária. Essa propriedade é o que permite encaixar consulta dentro de consulta, e é a base dos módulos 3 e 4.",
                },
                {
                    type: "code",
                    value: "-- Projecao: so as colunas que a pergunta usa, mais uma calculada.\nSELECT\n    data_venda,\n    canal,\n    quantidade,\n    valor,\n    round(valor / quantidade, 2) AS ticket_unitario\nFROM vendas\nLIMIT 20;\n\n-- Valores distintos: quais canais existem mesmo na base?\nSELECT DISTINCT canal\nFROM vendas;\n\n-- Combinacao distinta de duas colunas, nao uma de cada.\nSELECT DISTINCT canal, extract(year FROM data_venda) AS ano\nFROM vendas;",
                },
                {
                    type: "text",
                    value: "## Por que SELECT asterisco é um hábito caro\n\nPedir todas as colunas parece prático e é o primeiro reflexo de quem começa. Em análise, ele custa em três frentes. A primeira é leitura: numa base colunar, trazer quarenta colunas quando a pergunta usa três multiplica o volume lido, e o tempo junto.\n\nA segunda é estabilidade. Se a consulta salva o resultado numa tabela ou alimenta um painel, o dia em que alguém adicionar uma coluna na origem o formato da saída muda sozinho, e o que dependia da posição das colunas quebra. Nomear explicitamente é o que torna a consulta previsível.\n\nA terceira é comunicação. Uma consulta que lista as colunas usadas documenta a análise: quem lê entende o que a pergunta precisa. Existe um uso legítimo do asterisco, que é a exploração inicial de uma tabela desconhecida, sempre com LIMIT. Depois que a pergunta está formada, ele sai.",
                },
                {
                    type: "table",
                    value: '[["Elemento","O que faz","Exemplo"],["SELECT","Escolhe as colunas do resultado","SELECT canal, valor"],["FROM","Diz de qual tabela vem o dado","FROM vendas"],["AS","Dá nome a uma coluna calculada","valor * 0.9 AS liquido"],["DISTINCT","Remove combinações repetidas","SELECT DISTINCT canal"],["Expressão","Calcula coluna nova por linha","round(valor / quantidade, 2)"],["LIMIT","Corta o resultado ao explorar","LIMIT 20"]]',
                },
                {
                    type: "quote",
                    value: "O resultado de uma consulta é uma tabela. Guarde essa frase: ela é o motivo de você poder encaixar consulta dentro de consulta pelo resto da trilha.",
                },
            ],
            questions: [
                {
                    statement: "O que a projeção define em uma consulta SQL?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quais colunas aparecem no resultado da consulta",
                            isCorrect: true,
                        },
                        {
                            text: "Quais linhas sobrevivem ao filtro que foi aplicado",
                            isCorrect: false,
                        },
                        {
                            text: "Em que ordem as linhas saem no resultado final",
                            isCorrect: false,
                        },
                        {
                            text: "Quantas linhas o banco devolve para quem perguntou",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que evitar SELECT com asterisco numa consulta analítica já madura?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele lê colunas que a pergunta não usa e custa tempo",
                            isCorrect: true,
                        },
                        {
                            text: "Ele impede o uso de qualquer função de agregação",
                            isCorrect: false,
                        },
                        {
                            text: "Ele obriga o banco a percorrer a tabela duas vezes",
                            isCorrect: false,
                        },
                        {
                            text: "Ele desabilita o filtro escrito na cláusula WHERE",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve a palavra AS no SELECT?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dar nome à coluna calculada que sai no resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Converter o valor da coluna para outro tipo de dado",
                            isCorrect: false,
                        },
                        {
                            text: "Indicar que a coluna participa do agrupamento final",
                            isCorrect: false,
                        },
                        {
                            text: "Ordenar o resultado pela coluna que vem antes dela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta usa SELECT DISTINCT canal, ano. O que exatamente é eliminado do resultado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As combinações de canal e ano que se repetem entre si",
                            isCorrect: true,
                        },
                        {
                            text: "Os valores repetidos de canal, mantendo todos os anos",
                            isCorrect: false,
                        },
                        {
                            text: "As linhas em que alguma das duas colunas está vazia",
                            isCorrect: false,
                        },
                        {
                            text: "Os anos repetidos, mantendo um canal para cada ano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta salva num painel usa asterisco no SELECT. Alguém adiciona uma coluna na tabela de origem. Qual é o efeito mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O formato da saída muda sozinho e o painel desalinha",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta passa a devolver erro de coluna desconhecida",
                            isCorrect: false,
                        },
                        {
                            text: "A coluna nova é ignorada porque não estava no original",
                            isCorrect: false,
                        },
                        {
                            text: "O banco recusa a alteração enquanto o painel existir",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "WHERE e o cuidado com o nulo",
            blocks: [
                {
                    type: "text",
                    value: "# Filtrar é dizer quais linhas entram na conta\n\nO WHERE avalia uma condição para cada linha e mantém apenas as que resultam em verdadeiro. É a cláusula que transforma uma tabela inteira no recorte da sua pergunta: só o ano passado, só o canal aplicativo, só as vendas acima de duzentos reais.\n\nAlém dos comparadores usuais, três atalhos aparecem em quase toda análise. O IN testa pertencimento a uma lista, o BETWEEN testa um intervalo fechado nos dois extremos, e o LIKE testa padrão de texto com o curinga por cento. Combinar condições com AND e OR exige atenção à precedência: AND é avaliado antes de OR, então uma condição composta sem parênteses costuma filtrar algo diferente do que você quis dizer.\n\nUm cuidado específico de análise: aplicar função sobre a coluna filtrada, como comparar o ano extraído da data em vez de comparar a data com um intervalo, funciona, mas atrapalha o uso de índice. Filtrar a coluna crua contra um intervalo é quase sempre melhor, e o módulo 7 volta a esse ponto.",
                },
                {
                    type: "code",
                    value: "-- Recorte de analise: vendas do ano passado, em dois canais.\nSELECT data_venda, canal, valor\nFROM vendas\nWHERE data_venda >= DATE '2025-01-01'\n  AND data_venda <  DATE '2026-01-01'\n  AND canal IN ('app', 'site')\n  AND valor > 200;\n\n-- Cuidado com precedencia: os dois filtros abaixo sao diferentes.\nSELECT count(*) FROM vendas WHERE canal = 'app' OR canal = 'site' AND valor > 200;\nSELECT count(*) FROM vendas WHERE (canal = 'app' OR canal = 'site') AND valor > 200;",
                },
                {
                    type: "text",
                    value: "## Nulo não é zero, nem vazio: é desconhecido\n\nNulo em SQL significa ausência de informação. Não é zero, não é texto vazio, não é falso. E como ele representa algo desconhecido, qualquer comparação com ele devolve desconhecido, e não verdadeiro nem falso. É por isso que a condição valor = NULL nunca traz linha nenhuma: o banco não consegue afirmar que um desconhecido é igual a um desconhecido.\n\nA forma correta é usar IS NULL e IS NOT NULL, que testam a ausência em si em vez de comparar valores. Essa lógica de três estados contamina outras situações. Uma linha em que fim_assinatura é nulo não passa nem no filtro fim_assinatura > hoje nem no filtro fim_assinatura <= hoje, então some das duas metades da sua análise sem aparecer em lugar nenhum.\n\nA armadilha mais famosa é o NOT IN com nulo dentro da lista. Se a subconsulta que alimenta o NOT IN devolver ao menos um nulo, o resultado inteiro fica vazio, porque o banco não consegue garantir que o valor é diferente de um desconhecido. O IN sofre menos, mas o NOT IN é uma cilada silenciosa que aparece muito no módulo 3.",
                },
                {
                    type: "table",
                    value: '[["Expressão","Resultado","Efeito no filtro"],["valor = NULL","Desconhecido","Nunca traz linha alguma"],["valor IS NULL","Verdadeiro ou falso","Traz exatamente as linhas sem valor"],["NULL = NULL","Desconhecido","Junção por coluna nula não casa"],["5 > NULL","Desconhecido","A linha é descartada em silêncio"],["NOT IN com um nulo na lista","Desconhecido","O resultado vem vazio por inteiro"],["coalesce(valor, 0) = 0","Verdadeiro ou falso","Trata ausência como zero de propósito"],["NULL AND falso","Falso","Aqui a lógica de três estados decide"]]',
                },
                {
                    type: "quote",
                    value: "Nulo não é um valor, é a falta de um. Toda comparação com ele devolve desconhecido, e desconhecido não passa no WHERE. Linha some sem deixar bilhete.",
                },
            ],
            questions: [
                {
                    statement: "Por que a condição valor = NULL nunca traz linhas no resultado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Comparar com um desconhecido devolve desconhecido",
                            isCorrect: true,
                        },
                        {
                            text: "O operador de igualdade não aceita coluna sem valor",
                            isCorrect: false,
                        },
                        {
                            text: "O banco converte nulo em zero antes da comparação",
                            isCorrect: false,
                        },
                        {
                            text: "Colunas nulas ficam fora do índice usado no filtro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a forma correta de selecionar linhas em que a coluna fim está vazia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Usar a condição fim IS NULL na cláusula de filtro",
                            isCorrect: true,
                        },
                        {
                            text: "Usar a condição fim = NULL na cláusula de filtro",
                            isCorrect: false,
                        },
                        {
                            text: "Usar a condição fim = 0 para pegar a ausência dela",
                            isCorrect: false,
                        },
                        {
                            text: "Usar a condição NOT fim para inverter a comparação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma análise divide assinaturas em ativas e encerradas por fim > hoje e fim <= hoje. O que acontece com quem tem fim nulo?",
                    difficulty: "medio",
                    options: [
                        { text: "Fica de fora dos dois grupos e some da análise", isCorrect: true },
                        { text: "Entra nos dois grupos e é contada duas vezes", isCorrect: false },
                        {
                            text: "Entra no grupo de encerradas, por ausência de data",
                            isCorrect: false,
                        },
                        {
                            text: "Gera erro de comparação inválida ao rodar a consulta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um NOT IN alimentado por uma subconsulta com nulos costuma devolver resultado vazio?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Nada pode ser garantido diferente de um desconhecido",
                            isCorrect: true,
                        },
                        {
                            text: "O NOT IN só aceita listas escritas manualmente à mão",
                            isCorrect: false,
                        },
                        {
                            text: "A subconsulta com nulo é descartada inteira pelo banco",
                            isCorrect: false,
                        },
                        {
                            text: "O operador NOT inverte o nulo e derruba toda a condição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em `WHERE canal = 'app' OR canal = 'site' AND valor > 200`, qual é o efeito da precedência?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O filtro de valor vale só para as vendas do canal site",
                            isCorrect: true,
                        },
                        {
                            text: "O filtro de valor vale para os dois canais listados ali",
                            isCorrect: false,
                        },
                        {
                            text: "O filtro de canal é ignorado e sobra apenas o de valor",
                            isCorrect: false,
                        },
                        {
                            text: "O banco avalia da esquerda para a direita, sem hierarquia",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "ORDER BY, LIMIT e o topo enganoso",
            blocks: [
                {
                    type: "text",
                    value: "# Sem ORDER BY não existe ordem\n\nUma tabela não tem ordem natural. O banco devolve as linhas na sequência que for mais conveniente para ele naquele momento, e essa sequência pode mudar entre duas execuções da mesma consulta, por causa de leitura paralela, cache ou reorganização interna. Se a ordem importa para você, ela precisa estar escrita: é isso que o ORDER BY faz.\n\nOrdenar aceita mais de uma coluna, e a segunda serve de desempate para a primeira. Isso é mais importante do que parece quando combinado com LIMIT. Se dez clientes empatam em faturamento e você pede os cinco primeiros, quais cinco aparecem é indefinido, e o relatório muda sozinho de uma semana para outra sem ninguém ter mexido em nada.\n\nNo PostgreSQL, nulos vão para o fim na ordem crescente e para o começo na ordem decrescente. Ou seja, um ORDER BY valor DESC LIMIT 10 pode devolver dez linhas de valor nulo e nenhum campeão de verdade. As cláusulas NULLS LAST e NULLS FIRST existem justamente para você decidir isso em vez de descobrir depois.",
                },
                {
                    type: "code",
                    value: "-- Top 10 clientes por faturamento, com desempate e nulos no fim.\nSELECT cliente_id, sum(valor) AS faturamento\nFROM vendas\nWHERE data_venda >= DATE '2025-01-01'\nGROUP BY cliente_id\nORDER BY faturamento DESC NULLS LAST, cliente_id\nLIMIT 10;\n\n-- Antes de olhar so o topo, veja o peso dele no total.\nSELECT\n    count(*)                             AS clientes,\n    sum(faturamento)                     AS total,\n    sum(faturamento) FILTER (WHERE posicao <= 10) AS top10\nFROM (\n    SELECT cliente_id,\n           sum(valor) AS faturamento,\n           row_number() OVER (ORDER BY sum(valor) DESC) AS posicao\n    FROM vendas\n    GROUP BY cliente_id\n) t;",
                },
                {
                    type: "text",
                    value: "## O topo mente sobre o corpo\n\nOlhar os dez maiores é o reflexo mais comum de quem começa a analisar, e ele engana de duas formas. A primeira é de representatividade: os dez maiores clientes podem valer três por cento do faturamento, e nesse caso a decisão tomada olhando para eles não muda quase nada. Ou podem valer setenta por cento, e aí a empresa tem um risco de concentração enorme. O ranking sozinho não distingue os dois cenários.\n\nA segunda é de estabilidade. Ranking de topo oscila muito quando os valores são próximos, porque uma diferença de um real troca posições. Times inteiros gastam reunião discutindo por que o quarto virou sexto, quando a diferença está dentro do ruído.\n\nO hábito profissional é sempre acompanhar o topo de um número de contexto: quanto o topo pesa no total, qual a mediana, quantos itens somam metade do valor. O módulo 6 traz percentil e mediana justamente para isso. Ver o topo é útil; ver só o topo é como julgar uma cidade pela rua mais movimentada.",
                },
                {
                    type: "table",
                    value: '[["Situação","O que acontece","Como resolver"],["Consulta sem ORDER BY","A ordem pode mudar a cada execução","Escrever a ordem que a análise exige"],["Empate no critério","Quais linhas entram no topo é indefinido","Somar uma coluna de desempate estável"],["ORDER BY valor DESC","Nulos aparecem antes dos maiores valores","Acrescentar NULLS LAST na cláusula"],["LIMIT sem contexto","O topo parece representar o conjunto","Comparar o topo com o total e a mediana"],["OFFSET alto na paginação","Custo cresce, pois o banco descarta linhas","Filtrar por faixa em vez de pular linhas"]]',
                },
                {
                    type: "quote",
                    value: "Ranking sem denominador é opinião. Antes de mostrar os dez maiores, responda quanto esses dez pesam no total, ou você estará vendendo ruído como descoberta.",
                },
            ],
            questions: [
                {
                    statement: "O que acontece com a ordem de uma consulta que não tem ORDER BY?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pode variar entre execuções, sem garantia nenhuma",
                            isCorrect: true,
                        },
                        {
                            text: "Segue sempre a ordem em que as linhas foram inseridas",
                            isCorrect: false,
                        },
                        {
                            text: "Segue a chave primária da tabela consultada, por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Fica ordenada pela primeira coluna listada no SELECT",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No PostgreSQL, onde ficam os nulos em um ORDER BY valor DESC?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "No começo do resultado, antes do maior valor real",
                            isCorrect: true,
                        },
                        {
                            text: "No fim do resultado, depois do menor valor real",
                            isCorrect: false,
                        },
                        {
                            text: "Fora do resultado, porque nulo não é ordenável",
                            isCorrect: false,
                        },
                        {
                            text: "No meio, entre os valores positivos e negativos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um relatório de top 5 por faturamento muda de posições toda semana sem mudança nos dados. Qual é a causa mais provável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Existe empate e falta uma coluna de desempate estável",
                            isCorrect: true,
                        },
                        {
                            text: "O LIMIT devolve linhas aleatórias por natureza própria",
                            isCorrect: false,
                        },
                        {
                            text: "O banco reordena a tabela fisicamente a cada semana",
                            isCorrect: false,
                        },
                        {
                            text: "A soma de faturamento é recalculada com precisão menor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que mostrar apenas os dez maiores clientes pode enganar quem decide?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O ranking não diz quanto esses dez pesam no total",
                            isCorrect: true,
                        },
                        {
                            text: "O ranking exclui clientes que compraram no período",
                            isCorrect: false,
                        },
                        {
                            text: "O ranking calcula a soma com menos precisão que a média",
                            isCorrect: false,
                        },
                        {
                            text: "O ranking depende de índice que pode estar desatualizado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que paginar um resultado grande com OFFSET alto fica lento no banco?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O banco produz e descarta todas as linhas puladas",
                            isCorrect: true,
                        },
                        {
                            text: "O OFFSET desabilita o índice usado na ordenação",
                            isCorrect: false,
                        },
                        {
                            text: "Cada página refaz a consulta com um plano diferente",
                            isCorrect: false,
                        },
                        {
                            text: "O resultado inteiro é gravado em disco a cada página",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Agregação e o que cada função ignora",
            blocks: [
                {
                    type: "text",
                    value: "# Cinco funções que resolvem quase tudo\n\nAgregar é reduzir muitas linhas a um número. As funções básicas são poucas e você vai usá-las todo dia: count conta, sum soma, avg tira média, min e max pegam extremos. A parte que separa quem entende de quem chuta é saber o que cada uma faz com o nulo, porque é aí que mora a divergência de relatório.\n\nA regra geral é que as funções de agregação ignoram nulos. O sum de uma coluna com metade dos valores ausentes soma só a outra metade, sem avisar. O avg divide pela quantidade de valores presentes, não pela quantidade de linhas. Isso é razoável, mas quase nunca é o que a pessoa imaginou.\n\nO count tem três formas, e confundi-las é o erro mais comum da carreira inteira. O count com asterisco conta linhas, inclusive as que só têm nulos. O count de uma coluna conta as linhas em que aquela coluna tem valor. E o count distinct de uma coluna conta os valores diferentes presentes, ignorando nulos também.",
                },
                {
                    type: "code",
                    value: "-- As tres contagens respondem perguntas diferentes.\nSELECT\n    count(*)                    AS linhas,\n    count(cupom)                AS vendas_com_cupom,\n    count(DISTINCT cliente_id)  AS clientes_distintos,\n    sum(valor)                  AS faturamento,\n    avg(valor)                  AS ticket_medio_valores_presentes,\n    sum(valor) / count(*)       AS ticket_medio_por_linha,\n    min(data_venda)             AS primeira_venda,\n    max(data_venda)             AS ultima_venda\nFROM vendas\nWHERE data_venda >= DATE '2025-01-01';\n\n-- Contagem condicional sem escrever varias consultas.\nSELECT\n    count(*) FILTER (WHERE canal = 'app')  AS vendas_app,\n    count(*) FILTER (WHERE canal = 'site') AS vendas_site\nFROM vendas;",
                },
                {
                    type: "text",
                    value: "## Média mente de duas formas ao mesmo tempo\n\nA primeira forma é a do nulo, que acabamos de ver: avg divide pelos valores presentes. Se uma coluna de nota de satisfação tem oitenta por cento de respostas ausentes, a média que aparece no painel é a média de quem respondeu, e ninguém escreveu isso no título do gráfico. Quando o correto for tratar ausência como zero, use coalesce de propósito e deixe visível.\n\nA segunda forma é a assimetria. Média é fortemente puxada por poucos valores extremos. Um faturamento médio por cliente de mil e duzentos reais pode significar mil clientes gastando mil e um cliente gastando duzentos mil. A mediana e os percentis contam a história do meio, e o módulo 6 mostra como calculá-los.\n\nHá ainda um detalhe que confunde muita gente: numa consulta sem GROUP BY que não encontra linha alguma, count devolve zero, mas sum devolve nulo. Um painel que divide um sum por outro pode explodir ou mostrar vazio no primeiro dia de mês, e a correção é envolver com coalesce quando o zero for o valor correto.",
                },
                {
                    type: "table",
                    value: '[["Função","Ignora nulo?","Sem nenhuma linha devolve","Pergunta que responde"],["count(*)","Não, conta a linha","Zero","Quantos registros existem"],["count(coluna)","Sim","Zero","Em quantas linhas isso foi preenchido"],["count(DISTINCT coluna)","Sim","Zero","Quantos valores diferentes aparecem"],["sum(coluna)","Sim","Nulo","Qual o total acumulado"],["avg(coluna)","Sim","Nulo","Qual o valor típico, com ressalvas"],["min e max","Sim","Nulo","Quais são os extremos observados"]]',
                },
                {
                    type: "quote",
                    value: "count(*) conta linhas, count(coluna) conta preenchimentos. Trocar um pelo outro é a forma mais barata de publicar um número errado com muita confiança.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é a diferença entre count com asterisco e count de uma coluna?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O primeiro conta linhas, o segundo conta preenchidos",
                            isCorrect: true,
                        },
                        {
                            text: "O primeiro conta valores distintos, o segundo conta todos",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro é mais lento, mas os dois devolvem o mesmo",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro ignora nulos e o segundo os inclui na conta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a função sum faz com os nulos de uma coluna?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ignora esses valores e soma apenas os presentes",
                            isCorrect: true,
                        },
                        { text: "Trata cada nulo como zero e soma normalmente", isCorrect: false },
                        {
                            text: "Devolve nulo se qualquer linha tiver valor ausente",
                            isCorrect: false,
                        },
                        {
                            text: "Devolve erro pedindo a conversão explícita do nulo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma coluna de nota tem oitenta por cento dos valores nulos. O que avg dessa coluna representa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A média apenas de quem de fato respondeu a nota",
                            isCorrect: true,
                        },
                        {
                            text: "A média de todas as linhas, com o nulo valendo zero",
                            isCorrect: false,
                        },
                        {
                            text: "Um valor nulo, porque existem ausências na coluna",
                            isCorrect: false,
                        },
                        {
                            text: "A mediana das notas, que é robusta à falta de dado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta agregada não encontra nenhuma linha no filtro. O que count e sum devolvem, respectivamente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Zero e nulo, o que costuma quebrar painel na virada",
                            isCorrect: true,
                        },
                        {
                            text: "Zero e zero, porque agregação nunca devolve ausência",
                            isCorrect: false,
                        },
                        {
                            text: "Nulo e nulo, já que não houve valor algum para contar",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma linha de resultado, pois o filtro veio vazio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O ticket médio de uma base é mil e duzentos reais, mas a maioria dos clientes gasta bem menos. Qual é a explicação mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Poucos clientes com valores enormes puxam a média",
                            isCorrect: true,
                        },
                        {
                            text: "A soma foi calculada em ponto flutuante e perdeu precisão",
                            isCorrect: false,
                        },
                        {
                            text: "A função avg conta cada linha duas vezes ao agrupar",
                            isCorrect: false,
                        },
                        {
                            text: "Os clientes sem compra entram no cálculo como zero",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "GROUP BY e HAVING",
            blocks: [
                {
                    type: "text",
                    value: "# Agrupar é aplicar a agregação por recorte\n\nO GROUP BY divide as linhas em grupos segundo as colunas indicadas e roda a agregação dentro de cada grupo. Faturamento por canal, vendas por mês, clientes distintos por estado: todo relatório de negócio é isso. O resultado tem uma linha por grupo, e não mais uma linha por venda, o que significa que a consulta colapsa o detalhe.\n\nDaí vem a regra que o banco cobra: toda coluna que aparece no SELECT precisa estar no GROUP BY ou dentro de uma função de agregação. Não existe meio termo, porque para um grupo com trezentas vendas não faz sentido perguntar qual foi o valor, e sim qual foi a soma, a média ou o máximo dos valores.\n\nO agrupamento por expressão também vale, e é assim que se agrupa por mês a partir de uma data. No PostgreSQL você pode repetir a expressão no GROUP BY ou referenciar o apelido definido no SELECT, o que deixa a consulta bem mais legível.",
                },
                {
                    type: "code",
                    value: "-- Faturamento por canal e por mes, so de 2025, com filtro pos-agregacao.\nSELECT\n    canal,\n    date_trunc('month', data_venda)::date AS mes,\n    count(*)                              AS vendas,\n    sum(valor)                            AS faturamento\nFROM vendas\nWHERE data_venda >= DATE '2025-01-01'      -- filtra LINHAS, antes de agrupar\n  AND data_venda <  DATE '2026-01-01'\nGROUP BY canal, mes\nHAVING sum(valor) > 100000                 -- filtra GRUPOS, depois de agrupar\nORDER BY mes, faturamento DESC;",
                },
                {
                    type: "text",
                    value: "## WHERE filtra linha, HAVING filtra grupo\n\nA confusão entre os dois some quando você entende a ordem lógica de execução. O banco resolve primeiro o FROM, depois o WHERE, depois o GROUP BY, depois o HAVING, depois o SELECT, depois o ORDER BY e por último o LIMIT. Repare que o WHERE roda antes de existir grupo, e o HAVING roda quando os grupos já foram formados.\n\nIsso explica duas coisas que todo mundo esbarra. A primeira: não dá para usar uma função de agregação no WHERE, porque naquele momento a soma ainda não existe. A segunda: um apelido criado no SELECT não pode ser usado no WHERE, porque o SELECT é avaliado depois. No ORDER BY o apelido funciona, justamente porque ele vem depois.\n\nA diferença muda o número, e não só a sintaxe. Filtrar valor acima de duzentos no WHERE calcula o faturamento apenas das vendas grandes. Filtrar soma acima de duzentos no HAVING calcula o faturamento de todas as vendas e depois descarta os grupos pequenos. São perguntas diferentes, e escolher a errada é um erro que passa despercebido na revisão.",
                },
                {
                    type: "table",
                    value: '[["Ordem lógica","Cláusula","O que já existe nesse ponto"],["1","FROM","As tabelas de origem"],["2","WHERE","Linhas individuais, sem grupo ainda"],["3","GROUP BY","Os grupos recém formados"],["4","HAVING","Os grupos com suas agregações"],["5","SELECT","As colunas e apelidos do resultado"],["6","ORDER BY","O resultado pronto para ordenar"],["7","LIMIT","O corte final de linhas"]]',
                },
                {
                    type: "quote",
                    value: "WHERE decide quais vendas entram na soma. HAVING decide quais somas aparecem no relatório. Trocar os dois não gera erro, gera outra pergunta respondida com convicção.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é a regra para colunas listadas no SELECT de uma consulta com GROUP BY?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cada uma está no GROUP BY ou dentro de uma agregação",
                            isCorrect: true,
                        },
                        {
                            text: "Cada uma precisa estar também na cláusula ORDER BY final",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas colunas numéricas podem aparecer no resultado",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma coluna de texto pode participar do agrupamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença prática entre WHERE e HAVING?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "WHERE filtra linhas e HAVING filtra grupos já agregados",
                            isCorrect: true,
                        },
                        {
                            text: "WHERE é mais rápido, mas os dois filtram a mesma coisa",
                            isCorrect: false,
                        },
                        {
                            text: "WHERE vale para texto e HAVING vale para valor numérico",
                            isCorrect: false,
                        },
                        {
                            text: "WHERE roda depois do agrupamento e HAVING roda antes dele",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que não é possível usar sum dentro da cláusula WHERE?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O WHERE roda antes de os grupos e as somas existirem",
                            isCorrect: true,
                        },
                        {
                            text: "O WHERE só aceita comparações entre duas colunas cruas",
                            isCorrect: false,
                        },
                        {
                            text: "A função sum exige um índice que o WHERE não consegue ler",
                            isCorrect: false,
                        },
                        {
                            text: "O padrão SQL reserva as agregações para o SELECT apenas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma analista quer o faturamento por canal considerando só vendas acima de duzentos reais. Onde entra esse filtro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "No WHERE, pois ele descarta vendas antes de somar",
                            isCorrect: true,
                        },
                        {
                            text: "No HAVING, pois ele descarta canais depois de somar",
                            isCorrect: false,
                        },
                        {
                            text: "No SELECT, com um CASE que zera as vendas pequenas",
                            isCorrect: false,
                        },
                        {
                            text: "No ORDER BY, colocando as vendas grandes no começo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um apelido criado no SELECT funciona no ORDER BY, mas não no WHERE?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O SELECT é avaliado depois do WHERE e antes do ORDER BY",
                            isCorrect: true,
                        },
                        {
                            text: "O ORDER BY aceita qualquer texto, sem validar o que existe",
                            isCorrect: false,
                        },
                        {
                            text: "O WHERE só reconhece nomes de colunas físicas indexadas",
                            isCorrect: false,
                        },
                        {
                            text: "O apelido só existe quando a consulta tem agrupamento",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Juntando dados",
    aulas: [
        {
            titulo: "O que uma junção realmente faz",
            blocks: [
                {
                    type: "text",
                    value: "# Toda junção começa como um produto\n\nA definição formal de junção é menos misteriosa do que o nome sugere: o banco combina cada linha de uma tabela com cada linha da outra e depois mantém apenas as combinações que satisfazem a condição escrita no ON. Combinar tudo com tudo é o produto cartesiano; a condição é o filtro que sobra em cima dele.\n\nEssa definição é conceitual, e não a receita física: nenhum banco moderno gera de fato todas as combinações antes de filtrar, porque isso seria insano em qualquer volume real. Mas guardar a definição na cabeça explica o comportamento que mais confunde analista iniciante, que é a junção devolver mais linhas do que a tabela de origem tinha.\n\nO produto puro, sem condição, existe e tem uso legítimo. Ele se escreve com CROSS JOIN e serve, por exemplo, para gerar todas as combinações de mês e categoria antes de preencher os buracos de uma série temporal, que é assunto do módulo 6. Fora desses casos, um produto cartesiano acidental é sempre um erro.",
                },
                {
                    type: "code",
                    value: "-- Juncao explicita: cada venda ganha os atributos do seu produto.\nSELECT\n    v.data_venda,\n    v.valor,\n    p.nome      AS produto,\n    p.categoria\nFROM vendas v\nJOIN produtos p ON p.id = v.produto_id\nWHERE v.data_venda >= DATE '2025-01-01';\n\n-- Produto cartesiano de proposito: toda combinacao de mes e categoria.\nSELECT m.mes, c.categoria\nFROM (SELECT generate_series(1, 12) AS mes) m\nCROSS JOIN (SELECT DISTINCT categoria FROM produtos) c;",
                },
                {
                    type: "text",
                    value: "## Cardinalidade, a pergunta que evita susto\n\nAntes de escrever qualquer junção, vale responder mentalmente: para uma linha da esquerda, quantas linhas da direita casam? Se a resposta é no máximo uma, a junção preserva a contagem e a soma. Se a resposta é várias, a contagem cresce e toda soma feita depois fica inflada.\n\nO caso confortável é juntar um fato com uma dimensão pela chave primária dela: cada venda tem exatamente um produto, então juntar vendas com produtos não muda a quantidade de linhas. Esse é o padrão da maior parte das análises e o motivo de a junção parecer inofensiva no começo.\n\nO caso perigoso é juntar dois fatos, ou juntar com uma tabela em que a chave se repete, como um histórico de preços com várias vigências por produto. Aí a junção multiplica, e a próxima aula é inteira sobre isso porque esse é o erro mais caro de quem começa a analisar dados com SQL.",
                },
                {
                    type: "table",
                    value: '[["Escrita","O que devolve","Uso típico em análise"],["JOIN com ON","Só as combinações que casam","Fato com dimensão pela chave"],["LEFT JOIN","Tudo da esquerda, casando ou não","Manter o fato mesmo sem cadastro"],["RIGHT JOIN","Tudo da direita, casando ou não","Raro, escreve-se invertendo o lado"],["FULL JOIN","Tudo dos dois lados","Conciliar duas fontes divergentes"],["CROSS JOIN","Todas as combinações possíveis","Gerar grade de período e categoria"],["USING (coluna)","Junção por coluna de mesmo nome","Encurtar quando o nome coincide"]]',
                },
                {
                    type: "quote",
                    value: "Antes de juntar, responda: para uma linha da esquerda, quantas casam do outro lado? Se a resposta não for uma, sua soma vai mudar e ninguém vai avisar.",
                },
            ],
            questions: [
                {
                    statement: "Conceitualmente, o que uma junção com ON produz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "As combinações entre as tabelas que passam na condição",
                            isCorrect: true,
                        },
                        {
                            text: "A união das linhas das duas tabelas, uma abaixo da outra",
                            isCorrect: false,
                        },
                        {
                            text: "As linhas da tabela da esquerda que não existem na direita",
                            isCorrect: false,
                        },
                        {
                            text: "Uma cópia das duas tabelas em um mesmo arquivo temporário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que um CROSS JOIN devolve?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Todas as combinações possíveis entre as duas tabelas",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas as linhas presentes nas duas tabelas ao mesmo tempo",
                            isCorrect: false,
                        },
                        {
                            text: "As linhas da esquerda completadas com nulos quando falta par",
                            isCorrect: false,
                        },
                        {
                            text: "As linhas de uma tabela que não têm correspondência na outra",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando uma junção preserva a quantidade de linhas do fato?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quando cada linha casa com no máximo uma linha da direita",
                            isCorrect: true,
                        },
                        {
                            text: "Quando as duas tabelas têm a mesma quantidade de linhas",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a condição do ON compara colunas de mesmo nome",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a tabela da direita é menor do que a da esquerda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma analista precisa de uma grade com todos os meses do ano e todas as categorias, mesmo as sem venda. Qual construção resolve isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um CROSS JOIN entre a lista de meses e a de categorias",
                            isCorrect: true,
                        },
                        {
                            text: "Um INNER JOIN entre vendas e a tabela de categorias",
                            isCorrect: false,
                        },
                        {
                            text: "Um FULL JOIN entre vendas e a tabela de calendário",
                            isCorrect: false,
                        },
                        {
                            text: "Um LEFT JOIN de vendas com ela mesma, por mês e categoria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que dizer que a junção gera o produto e depois filtra é uma definição conceitual, e não a execução real?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O banco escolhe estratégias que evitam gerar tudo antes",
                            isCorrect: true,
                        },
                        {
                            text: "O banco nunca aplica a condição escrita na cláusula ON",
                            isCorrect: false,
                        },
                        {
                            text: "O produto cartesiano é proibido pelo padrão da linguagem",
                            isCorrect: false,
                        },
                        {
                            text: "A definição vale apenas quando existe índice nas colunas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "INNER e LEFT, e quando a escolha muda o número",
            blocks: [
                {
                    type: "text",
                    value: "# A pergunta define o tipo de junção\n\nA junção interna, escrita como JOIN ou INNER JOIN, mantém apenas as linhas que casam nos dois lados. A junção externa à esquerda, o LEFT JOIN, mantém todas as linhas da tabela da esquerda e completa com nulo as colunas da direita quando não há correspondência.\n\nQuando os dois lados estão íntegros, as duas devolvem o mesmo resultado, e é por isso que a diferença passa despercebida durante meses. Ela aparece exatamente quando existe furo: venda apontando para produto que sumiu do cadastro, cliente sem nenhuma compra, campanha sem clique registrado.\n\nA escolha certa vem da pergunta. Se a pergunta é sobre o fato, use LEFT partindo do fato, para não perder venda por causa de cadastro incompleto. Se a pergunta é sobre o universo do cadastro, como quantos produtos não venderam nada, use LEFT partindo da dimensão. Se você quer explicitamente só o que tem os dois lados, INNER é a escolha honesta, desde que declarada.",
                },
                {
                    type: "code",
                    value: "-- Pergunta sobre o fato: nenhuma venda pode sumir por falta de cadastro.\nSELECT\n    v.id,\n    v.valor,\n    coalesce(p.categoria, 'sem cadastro') AS categoria\nFROM vendas v\nLEFT JOIN produtos p ON p.id = v.produto_id;\n\n-- Pergunta sobre o cadastro: quais produtos nao venderam nada em 2025?\nSELECT\n    p.id,\n    p.nome,\n    count(v.id) AS vendas_no_ano\nFROM produtos p\nLEFT JOIN vendas v\n       ON v.produto_id = p.id\n      AND v.data_venda >= DATE '2025-01-01'\nGROUP BY p.id, p.nome\nHAVING count(v.id) = 0;",
                },
                {
                    type: "text",
                    value: "## O detalhe do count numa junção externa\n\nNa segunda consulta acima há uma sutileza que vale ouro. Ao contar linhas de um LEFT JOIN, usar count com asterisco daria um para os produtos sem venda nenhuma, porque a linha existe no resultado, só que preenchida com nulos. Contar uma coluna da tabela da direita, como count de v.id, devolve zero corretamente, porque count de coluna ignora nulos.\n\nEsse é um dos poucos lugares em que a regra do módulo anterior, de que agregação ignora nulo, joga a seu favor. Vale o mesmo para sum: somar valor num LEFT JOIN sem correspondência devolve nulo, e não zero, então o coalesce costuma ser necessário na saída.\n\nExiste ainda o FULL JOIN, que preserva os dois lados, e o uso mais comum dele em dados é conciliação: comparar a base do sistema de origem com a base do armazém e listar o que existe só de um lado. É uma consulta de qualidade de dado, não de relatório, e o módulo 7 volta a ela.",
                },
                {
                    type: "table",
                    value: '[["Cenário","INNER JOIN devolve","LEFT JOIN devolve"],["Venda com produto cadastrado","A linha completa","A linha completa"],["Venda com produto inexistente","Nada, a venda some","A venda com colunas nulas"],["Produto que nunca vendeu","Nada, não aparece","Aparece se a dimensão for a esquerda"],["Faturamento total somado","Menor que o real, se houver órfã","Igual ao real, com categoria nula"],["Contagem com count(*)","Conta as linhas que casaram","Conta um até para quem não casou"],["Contagem com count(coluna)","Igual ao count(*) do INNER","Conta zero para quem não casou"]]',
                },
                {
                    type: "quote",
                    value: "INNER JOIN é um filtro disfarçado de junção. Toda vez que você usa um, está dizendo que linha sem par não interessa. Diga isso de propósito, não por hábito.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que um LEFT JOIN faz com uma linha da esquerda que não tem par na direita?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mantém a linha e preenche as colunas da direita com nulo",
                            isCorrect: true,
                        },
                        {
                            text: "Descarta a linha, como faria uma junção interna comum",
                            isCorrect: false,
                        },
                        {
                            text: "Duplica a linha para cada valor possível da outra tabela",
                            isCorrect: false,
                        },
                        {
                            text: "Devolve erro avisando que faltou correspondência no par",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual junção responde melhor a quantos produtos não tiveram nenhuma venda no período?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "LEFT JOIN partindo de produtos em direção a vendas",
                            isCorrect: true,
                        },
                        {
                            text: "INNER JOIN entre produtos e vendas, contando as linhas",
                            isCorrect: false,
                        },
                        {
                            text: "LEFT JOIN partindo de vendas em direção a produtos",
                            isCorrect: false,
                        },
                        {
                            text: "CROSS JOIN entre produtos e o calendário do período",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num LEFT JOIN de produtos com vendas, por que count(v.id) é melhor que count(*)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "count de coluna ignora nulo e devolve zero corretamente",
                            isCorrect: true,
                        },
                        {
                            text: "count com asterisco não funciona em junções externas",
                            isCorrect: false,
                        },
                        {
                            text: "count de coluna é sempre mais rápido em tabelas grandes",
                            isCorrect: false,
                        },
                        {
                            text: "count com asterisco conta apenas as linhas que casaram",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma base tem vendas cujo produto foi removido do cadastro. O que acontece com o faturamento se a consulta usar INNER JOIN?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fica menor que o real, pois as órfãs somem do resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Fica maior que o real, pois as órfãs entram duplicadas",
                            isCorrect: false,
                        },
                        {
                            text: "Fica igual ao real, com categoria preenchida como nula",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta falha por violação de chave estrangeira ali",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o uso mais típico de um FULL JOIN em trabalho com dados?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Conciliar duas fontes e ver o que só existe em uma delas",
                            isCorrect: true,
                        },
                        {
                            text: "Acelerar a leitura de duas tabelas muito grandes de uma vez",
                            isCorrect: false,
                        },
                        {
                            text: "Garantir que a soma do fato não seja alterada na junção",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir o CROSS JOIN quando faltam colunas em comum",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A junção que multiplica linhas",
            blocks: [
                {
                    type: "text",
                    value: "# O erro mais caro de quem começa\n\nUma junção só preserva a contagem de linhas se a chave usada for única do outro lado. Quando não é, cada linha da esquerda se repete uma vez para cada correspondência da direita. A consulta não dá erro, o resultado parece plausível, e toda soma feita depois vem inflada.\n\nO exemplo clássico é juntar um pedido com os seus itens. Um pedido de três itens vira três linhas, e o valor do frete, que é do pedido, passa a aparecer três vezes. Somar frete depois dessa junção multiplica o frete por três. Outro exemplo igualmente comum é juntar vendas com uma tabela de preços que tem várias vigências por produto: se você esquecer de filtrar a vigência certa, cada venda casa com todas as vigências.\n\nO que torna esse erro perigoso é que ele infla, e número inflado é bem-vindo. Faturamento maior do que o esperado raramente é questionado com a mesma energia de um faturamento menor. Muitos relatórios errados sobrevivem anos exatamente por isso.",
                },
                {
                    type: "code",
                    value: "-- ERRADO: o frete do pedido se repete uma vez por item.\nSELECT sum(p.frete) AS frete_total\nFROM pedidos p\nJOIN itens_pedido i ON i.pedido_id = p.id;\n\n-- CERTO: agregue de um lado antes de juntar, para nao multiplicar.\nSELECT\n    p.id,\n    p.frete,\n    itens.qtd_itens,\n    itens.valor_itens\nFROM pedidos p\nJOIN (\n    SELECT pedido_id,\n           count(*)          AS qtd_itens,\n           sum(valor_item)   AS valor_itens\n    FROM itens_pedido\n    GROUP BY pedido_id\n) itens ON itens.pedido_id = p.id;\n\n-- Diagnostico rapido: a chave da direita e mesmo unica?\nSELECT pedido_id, count(*)\nFROM itens_pedido\nGROUP BY pedido_id\nHAVING count(*) > 1\nLIMIT 5;",
                },
                {
                    type: "text",
                    value: "## Como perceber antes de publicar\n\nO diagnóstico mais simples é contar linhas antes e depois. Se a tabela de vendas tem oito milhões de linhas e a consulta com junção devolve onze milhões, a junção multiplicou. Esse reflexo custa dez segundos e evita uma reunião inteira.\n\nO segundo diagnóstico é verificar a unicidade da chave do lado direito, com um agrupamento simples que lista as chaves repetidas. Se aparecer alguma, a junção vai multiplicar, e você já sabe por quê.\n\nExistem três saídas quando a multiplicação é real. A primeira é agregar antes de juntar, como no exemplo acima, para que o lado direito passe a ter uma linha por chave. A segunda é filtrar a direita até ela ficar única, como escolher só a vigência de preço válida na data da venda. A terceira, quando você só precisa saber se existe correspondência e não quer nenhuma coluna da direita, é usar semi-junção, que é o assunto da próxima aula.",
                },
                {
                    type: "table",
                    value: '[["Sintoma","O que provavelmente aconteceu","Como confirmar"],["Soma maior que o esperado","A junção repetiu linhas do fato","Comparar a soma sem a junção"],["Contagem cresceu após juntar","A chave da direita não é única","Agrupar a direita e olhar repetidos"],["Média caiu sem motivo","O denominador inflou junto","Conferir a contagem do denominador"],["Cliente distinto continua igual","A multiplicação não afeta distintos","Comparar count e count distinct"],["Frete somando três vezes","Coluna do pai somada no grão do filho","Somar o pai em consulta separada"]]',
                },
                {
                    type: "quote",
                    value: "Erro que faz o número cair é descoberto na segunda-feira. Erro que faz o número subir vira meta do trimestre. Por isso a junção que multiplica é a mais perigosa de todas.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que uma junção pode aumentar a quantidade de linhas do resultado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A chave da direita se repete e cada par vira uma linha",
                            isCorrect: true,
                        },
                        {
                            text: "A junção externa acrescenta linhas vazias ao resultado",
                            isCorrect: false,
                        },
                        {
                            text: "O banco duplica linhas para acelerar a leitura paralela",
                            isCorrect: false,
                        },
                        {
                            text: "A ordenação posterior repete linhas que ficaram empatadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Ao juntar pedidos com itens, por que somar o frete do pedido dá um valor errado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O frete se repete uma vez para cada item do pedido",
                            isCorrect: true,
                        },
                        {
                            text: "O frete fica nulo nas linhas trazidas pela junção",
                            isCorrect: false,
                        },
                        {
                            text: "O frete é somado apenas no primeiro item do pedido",
                            isCorrect: false,
                        },
                        {
                            text: "O frete muda de tipo ao passar pela junção com itens",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a checagem mais rápida para saber se uma junção multiplicou linhas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Comparar a contagem de linhas antes e depois de juntar",
                            isCorrect: true,
                        },
                        {
                            text: "Conferir se as duas tabelas têm a mesma quantidade de linhas",
                            isCorrect: false,
                        },
                        {
                            text: "Verificar se as colunas do ON usam exatamente o mesmo nome",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar a consulta duas vezes e comparar os tempos obtidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta junta vendas com um histórico de preços que tem várias vigências por produto. Qual é a correção mais direta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Filtrar a vigência válida na data da venda dentro do ON",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar a junção interna por uma junção externa à esquerda",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar DISTINCT no resultado final para tirar repetidas",
                            isCorrect: false,
                        },
                        {
                            text: "Ordenar por data de vigência e usar LIMIT no fim da consulta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que aplicar DISTINCT para consertar uma junção que multiplicou é uma ideia ruim?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ele também apaga linhas legitimamente iguais do fato",
                            isCorrect: true,
                        },
                        {
                            text: "Ele não roda em consultas que tenham qualquer junção",
                            isCorrect: false,
                        },
                        {
                            text: "Ele só remove repetições quando existe chave primária",
                            isCorrect: false,
                        },
                        {
                            text: "Ele desfaz o filtro escrito na condição de junção usada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Semi e anti junção com EXISTS",
            blocks: [
                {
                    type: "text",
                    value: "# Filtrar por existência, sem trazer nada junto\n\nMuita pergunta de análise não quer colunas da outra tabela, quer apenas saber se existe correspondência lá. Quais clientes compraram no último trimestre. Quais produtos nunca foram vendidos. Quais assinantes abriram ao menos um chamado. Nesses casos, juntar é desnecessário e arriscado, porque a junção pode multiplicar.\n\nA construção certa é a semi-junção, escrita com EXISTS. Ela testa se a subconsulta devolve ao menos uma linha e para de procurar assim que encontra a primeira. O resultado tem exatamente as linhas da tabela externa que passaram no teste, sem repetição, porque nenhuma coluna da subconsulta entra no resultado.\n\nO espelho dela é a anti-junção, escrita com NOT EXISTS: mantém as linhas da tabela externa que não têm correspondência nenhuma do outro lado. É a forma direta de responder perguntas de ausência, que costumam ser as mais interessantes de um estudo de base.",
                },
                {
                    type: "code",
                    value: "-- Semi-juncao: clientes com ao menos uma compra no trimestre.\nSELECT c.id, c.nome, c.uf\nFROM clientes c\nWHERE EXISTS (\n    SELECT 1\n    FROM vendas v\n    WHERE v.cliente_id = c.id\n      AND v.data_venda >= DATE '2025-10-01'\n);\n\n-- Anti-juncao: produtos que nunca venderam, seguro mesmo com nulos.\nSELECT p.id, p.nome\nFROM produtos p\nWHERE NOT EXISTS (\n    SELECT 1 FROM vendas v WHERE v.produto_id = p.id\n);\n\n-- Mesma anti-juncao no estilo antigo, com LEFT JOIN e teste de nulo.\nSELECT p.id, p.nome\nFROM produtos p\nLEFT JOIN vendas v ON v.produto_id = p.id\nWHERE v.id IS NULL;",
                },
                {
                    type: "text",
                    value: "## Por que NOT EXISTS ganha do NOT IN\n\nA armadilha do NOT IN com nulo, que apareceu no módulo 2, tem consequência séria aqui. Se a subconsulta que alimenta um NOT IN devolver ao menos um valor nulo, a consulta inteira devolve zero linhas, porque o banco não consegue afirmar que um valor é diferente de um desconhecido. E a subconsulta costuma vir de uma coluna que ninguém garantiu ser preenchida.\n\nO NOT EXISTS não sofre disso, porque ele testa existência de linha em vez de comparar valores. Se a subconsulta encontra uma linha que casa, o resultado é verdadeiro; se não encontra, é falso. Não há terceiro estado. Por isso a recomendação prática é simples: para ausência, use NOT EXISTS.\n\nA versão com LEFT JOIN e teste de nulo dá o mesmo resultado e ainda aparece bastante em código antigo. Ela é correta desde que a coluna testada com IS NULL nunca seja nula por conta própria; o mais seguro é testar a chave primária da tabela da direita. Em desempenho, os planejadores modernos costumam tratar as três formas de maneira parecida, então escolha pela clareza.",
                },
                {
                    type: "table",
                    value: '[["Construção","Multiplica linhas?","Seguro com nulo?","Melhor uso"],["JOIN comum","Sim, se a chave repete","Não casa em nulo","Quando você precisa das colunas"],["EXISTS","Não","Sim","Filtrar por presença de correspondência"],["NOT EXISTS","Não","Sim","Listar quem não tem correspondência"],["IN com subconsulta","Não","Tolerável","Lista curta e conhecida de valores"],["NOT IN com subconsulta","Não","Não, esvazia tudo","Evitar em base sem garantia de nulo"],["LEFT JOIN com IS NULL","Só se a chave repete","Depende da coluna testada","Código antigo, ainda correto"]]',
                },
                {
                    type: "quote",
                    value: "Se a pergunta é se existe, não junte: teste existência. Junção traz colunas e traz risco de multiplicar; EXISTS traz só a resposta que você pediu.",
                },
            ],
            questions: [
                {
                    statement: "O que a construção EXISTS faz numa consulta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Testa se a subconsulta devolve ao menos uma linha",
                            isCorrect: true,
                        },
                        {
                            text: "Traz as colunas da subconsulta para o resultado final",
                            isCorrect: false,
                        },
                        {
                            text: "Conta quantas linhas a subconsulta consegue devolver",
                            isCorrect: false,
                        },
                        {
                            text: "Ordena o resultado pelo campo usado na subconsulta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que uma semi-junção não corre o risco de multiplicar linhas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela não traz colunas da subconsulta para o resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Ela aplica DISTINCT automaticamente sobre o resultado",
                            isCorrect: false,
                        },
                        {
                            text: "Ela só funciona quando a chave testada é mesmo única",
                            isCorrect: false,
                        },
                        {
                            text: "Ela lê apenas a primeira linha de toda a tabela externa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual construção responde melhor a quais produtos nunca foram vendidos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "NOT EXISTS com a subconsulta correlacionada em vendas",
                            isCorrect: true,
                        },
                        {
                            text: "INNER JOIN entre produtos e vendas, contando as linhas",
                            isCorrect: false,
                        },
                        {
                            text: "NOT IN com a lista de produto_id retirada de vendas",
                            isCorrect: false,
                        },
                        {
                            text: "CROSS JOIN entre produtos e vendas com filtro de data",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que NOT EXISTS é preferível a NOT IN quando a subconsulta pode devolver nulos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele testa existência de linha, sem lógica de três estados",
                            isCorrect: true,
                        },
                        {
                            text: "Ele converte os nulos em zero antes de fazer a comparação",
                            isCorrect: false,
                        },
                        {
                            text: "Ele descarta as linhas nulas da subconsulta antes de rodar",
                            isCorrect: false,
                        },
                        {
                            text: "Ele é a única forma aceita pelo PostgreSQL em subconsulta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na anti-junção escrita com LEFT JOIN e IS NULL, qual coluna deve ser testada?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A chave primária da direita, que nunca é nula por si só",
                            isCorrect: true,
                        },
                        {
                            text: "Qualquer coluna da direita, pois o efeito é sempre igual",
                            isCorrect: false,
                        },
                        {
                            text: "Uma coluna da esquerda, para checar o lado preservado",
                            isCorrect: false,
                        },
                        {
                            text: "A coluna de data da direita, por ser sempre preenchida",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Nulo na junção e o LEFT que vira INNER",
            blocks: [
                {
                    type: "text",
                    value: "# Duas armadilhas que zeram análises inteiras\n\nA primeira é a junção por coluna que aceita nulo. Como nulo comparado com nulo devolve desconhecido, duas linhas com a chave ausente nunca casam entre si. Se dez por cento das vendas têm campanha_id nulo, essas vendas somem de qualquer junção com a tabela de campanhas, e o faturamento atribuído a campanhas fica menor sem qualquer aviso.\n\nQuando você realmente quer que ausência case com ausência, existe o operador IS NOT DISTINCT FROM, que trata nulo como um valor comparável. Ele resolve o caso, mas costuma impedir o uso de índice, então use com consciência e apenas quando a regra de negócio exigir mesmo isso.\n\nNa maior parte dos casos a decisão correta é outra: manter o LEFT JOIN e tratar a ausência na saída, com um coalesce que rotule aquilo como sem campanha. Assim a linha continua na análise e o buraco fica visível em vez de sumir.",
                },
                {
                    type: "code",
                    value: "-- ARMADILHA: o filtro no WHERE transforma o LEFT JOIN em INNER.\nSELECT v.id, c.nome AS campanha\nFROM vendas v\nLEFT JOIN campanhas c ON c.id = v.campanha_id\nWHERE c.canal = 'email';        -- descarta as linhas nulas do LEFT\n\n-- CERTO: a condicao da tabela da direita vai para o ON.\nSELECT v.id, c.nome AS campanha\nFROM vendas v\nLEFT JOIN campanhas c\n       ON c.id = v.campanha_id\n      AND c.canal = 'email';     -- preserva todas as vendas\n\n-- Se a ausencia precisa casar com ausencia, seja explicito:\nSELECT a.id, b.id\nFROM origem a\nJOIN destino b ON a.lote IS NOT DISTINCT FROM b.lote;",
                },
                {
                    type: "text",
                    value: "## O filtro que apaga a junção externa\n\nA segunda armadilha é mais sutil e muito mais comum. Você escreve um LEFT JOIN de propósito, para preservar todas as vendas, e depois acrescenta no WHERE um filtro sobre uma coluna da tabela da direita. Nas linhas sem correspondência, essa coluna é nula, o filtro devolve desconhecido, e essas linhas são descartadas. O resultado é idêntico ao de um INNER JOIN, e o seu LEFT virou decoração.\n\nA regra que resolve é posicional: condição que restringe a tabela da direita numa junção externa vai no ON, não no WHERE. No ON ela decide o que casa; no WHERE ela decide o que sobrevive depois da junção, e nulo nunca sobrevive a uma comparação.\n\nA exceção útil é justamente a anti-junção da aula anterior, em que o filtro IS NULL no WHERE é intencional. Fora dela, sempre que você vir um LEFT JOIN acompanhado de filtro no WHERE sobre a tabela da direita, desconfie: ou é bug, ou é um INNER JOIN escrito de forma confusa.",
                },
                {
                    type: "table",
                    value: '[["Situação","Onde fica a condição","Resultado"],["Restringir a direita, preservando a esquerda","No ON","LEFT JOIN continua sendo externo"],["Restringir a direita no WHERE","No WHERE","Vira um INNER JOIN silencioso"],["Restringir a esquerda","No WHERE","Correto, filtra o lado preservado"],["Buscar quem não tem par","IS NULL no WHERE","Anti-junção, uso intencional"],["Chave nula dos dois lados","Igualdade comum","Não casa, a linha desaparece"],["Chave nula que deve casar","IS NOT DISTINCT FROM","Casa, mas costuma perder o índice"]]',
                },
                {
                    type: "quote",
                    value: "LEFT JOIN com filtro do lado direito no WHERE é um INNER JOIN que finge não ser. É o bug mais educado do SQL: ele não reclama, ele só devolve menos linhas.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que duas linhas com a chave de junção nula nunca casam entre si?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Comparar nulo com nulo devolve desconhecido, não verdadeiro",
                            isCorrect: true,
                        },
                        {
                            text: "O banco remove linhas com chave nula antes de qualquer junção",
                            isCorrect: false,
                        },
                        {
                            text: "A chave nula é convertida em zero e deixa de coincidir ali",
                            isCorrect: false,
                        },
                        {
                            text: "Junções só aceitam colunas declaradas como não nulas na tabela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta usa LEFT JOIN e filtra uma coluna da tabela da direita no WHERE. Qual é o efeito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A junção passa a se comportar como uma junção interna",
                            isCorrect: true,
                        },
                        {
                            text: "A junção continua externa e o filtro é simplesmente ignorado",
                            isCorrect: false,
                        },
                        {
                            text: "As linhas sem par recebem o valor padrão da coluna filtrada",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta devolve erro por comparar nulo com uma constante",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Onde deve ficar uma condição que restringe a tabela da direita num LEFT JOIN?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Na cláusula ON, junto com a condição de correspondência",
                            isCorrect: true,
                        },
                        {
                            text: "Na cláusula WHERE, depois de a junção ter sido resolvida",
                            isCorrect: false,
                        },
                        {
                            text: "Na cláusula HAVING, para agir só sobre os grupos formados",
                            isCorrect: false,
                        },
                        {
                            text: "Em uma segunda consulta, aplicada sobre o resultado obtido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o operador IS NOT DISTINCT FROM numa junção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fazer ausência casar com ausência na comparação de chaves",
                            isCorrect: true,
                        },
                        {
                            text: "Comparar apenas valores distintos entre as duas tabelas",
                            isCorrect: false,
                        },
                        {
                            text: "Remover linhas repetidas antes de aplicar a condição do ON",
                            isCorrect: false,
                        },
                        {
                            text: "Converter colunas de tipos diferentes para poder comparar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dez por cento das vendas têm campanha_id nulo. O que acontece ao juntar vendas com campanhas por igualdade?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Essas vendas somem e o total por campanha fica menor",
                            isCorrect: true,
                        },
                        {
                            text: "Essas vendas casam com todas as campanhas existentes",
                            isCorrect: false,
                        },
                        {
                            text: "Essas vendas ficam agrupadas numa campanha chamada nula",
                            isCorrect: false,
                        },
                        {
                            text: "Essas vendas são mantidas, pois o nulo casa consigo mesmo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Subconsultas e CTE",
    aulas: [
        {
            titulo: "Subconsulta no WHERE",
            blocks: [
                {
                    type: "text",
                    value: "# Uma consulta pode alimentar outra\n\nO resultado de uma consulta é uma tabela, e isso permite usar uma consulta dentro de outra. No WHERE, a subconsulta aparece de três formas, e distinguir as três resolve quase toda dúvida de sintaxe que aparece nessa etapa.\n\nA primeira é a subconsulta escalar, que devolve uma única linha e uma única coluna e é comparada com um operador comum. Ela responde perguntas do tipo quais vendas ficaram acima do ticket médio da base. Se ela devolver mais de uma linha, o banco lança erro em tempo de execução, o que é bom: o problema aparece na hora.\n\nA segunda é a subconsulta de lista, usada com IN, que devolve uma coluna e várias linhas. A terceira é a de existência, com EXISTS, que você já viu no módulo 3. A escolha entre IN e EXISTS costuma ser de clareza, com uma ressalva importante: o NOT IN continua sendo perigoso quando a coluna pode ter nulo.",
                },
                {
                    type: "code",
                    value: "-- Escalar: vendas acima do ticket medio geral do periodo.\nSELECT id, data_venda, valor\nFROM vendas\nWHERE data_venda >= DATE '2025-01-01'\n  AND valor > (\n      SELECT avg(valor) FROM vendas WHERE data_venda >= DATE '2025-01-01'\n  );\n\n-- Lista: vendas dos produtos de duas categorias.\nSELECT id, produto_id, valor\nFROM vendas\nWHERE produto_id IN (\n    SELECT id FROM produtos WHERE categoria IN ('bebidas', 'mercearia')\n);\n\n-- Existencia: clientes que compraram no ultimo trimestre.\nSELECT c.id, c.nome\nFROM clientes c\nWHERE EXISTS (\n    SELECT 1 FROM vendas v\n    WHERE v.cliente_id = c.id AND v.data_venda >= DATE '2025-10-01'\n);",
                },
                {
                    type: "text",
                    value: "## O detalhe que muda o resultado: quando a média é calculada\n\nNo primeiro exemplo, a média é calculada uma vez, sobre o mesmo recorte de datas da consulta externa. Se você esquecer o filtro de data dentro da subconsulta, a comparação passa a usar a média histórica inteira, e o resultado muda completamente sem nenhum sinal de erro. Subconsulta escalar carrega o próprio recorte, e ele precisa combinar com a pergunta.\n\nOutro cuidado é o nulo na subconsulta escalar. Se a subconsulta não encontrar linha alguma, ela devolve nulo, e comparar qualquer valor com nulo resulta em desconhecido, o que descarta todas as linhas. Uma consulta que devolve vazio no primeiro dia do mês costuma ter exatamente essa causa.\n\nPor fim, vale saber que a subconsulta escalar pode aparecer também no SELECT, produzindo uma coluna constante ao lado de cada linha, como o total geral para calcular participação percentual. É legítimo, embora o módulo 5 mostre uma forma bem mais eficiente de fazer isso com função de janela.",
                },
                {
                    type: "table",
                    value: '[["Forma","O que devolve","Onde se encaixa","Cuidado principal"],["Escalar","Uma linha e uma coluna","Comparação com operador","Erra se devolver duas linhas"],["Escalar sem resultado","Nulo","Comparação com operador","A consulta inteira vem vazia"],["Lista com IN","Uma coluna, várias linhas","Teste de pertencimento","Cresce se a lista for enorme"],["Lista com NOT IN","Uma coluna, várias linhas","Teste de ausência","Um nulo esvazia o resultado"],["Existência com EXISTS","Verdadeiro ou falso","Filtro por correspondência","Precisa da correlação certa"]]',
                },
                {
                    type: "quote",
                    value: "Subconsulta escalar traz o próprio recorte. Se a de fora filtra 2025 e a de dentro não filtra nada, você está comparando o presente com a história inteira e chamando isso de média.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza uma subconsulta escalar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ela devolve uma única linha com uma única coluna",
                            isCorrect: true,
                        },
                        {
                            text: "Ela devolve uma coluna com várias linhas para o IN",
                            isCorrect: false,
                        },
                        {
                            text: "Ela devolve verdadeiro ou falso para cada linha lida",
                            isCorrect: false,
                        },
                        {
                            text: "Ela devolve uma tabela inteira usada dentro do FROM",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que acontece se uma subconsulta escalar devolver duas linhas?",
                    difficulty: "facil",
                    options: [
                        { text: "O banco lança erro ao executar a comparação", isCorrect: true },
                        {
                            text: "O banco usa a primeira linha e ignora as demais",
                            isCorrect: false,
                        },
                        {
                            text: "O banco converte o resultado em uma lista de IN",
                            isCorrect: false,
                        },
                        {
                            text: "O banco devolve nulo e descarta todas as linhas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta filtra 2025 no WHERE, mas a subconsulta que calcula a média não tem filtro de data. Qual é o efeito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A comparação usa a média histórica, e não a do período",
                            isCorrect: true,
                        },
                        {
                            text: "A subconsulta herda o filtro de data da consulta externa",
                            isCorrect: false,
                        },
                        {
                            text: "O banco recusa a consulta por recortes incompatíveis ali",
                            isCorrect: false,
                        },
                        {
                            text: "A média sai nula porque falta o filtro dentro do parêntese",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta com subconsulta escalar passou a devolver zero linhas no primeiro dia do mês. Qual é a causa mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A subconsulta não achou linhas e devolveu nulo na comparação",
                            isCorrect: true,
                        },
                        {
                            text: "A subconsulta passou a devolver mais de uma linha nesse dia",
                            isCorrect: false,
                        },
                        {
                            text: "O banco descartou o plano em cache e refez a consulta toda",
                            isCorrect: false,
                        },
                        {
                            text: "A comparação com data virou texto por causa da virada de mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o NOT IN com subconsulta continua sendo arriscado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um único nulo na lista esvazia o resultado inteiro",
                            isCorrect: true,
                        },
                        {
                            text: "Ele só aceita listas com no máximo mil valores dentro",
                            isCorrect: false,
                        },
                        {
                            text: "Ele obriga o banco a percorrer a tabela externa duas vezes",
                            isCorrect: false,
                        },
                        {
                            text: "Ele não pode ser usado junto de nenhum outro filtro no WHERE",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Subconsulta no FROM: a tabela derivada",
            blocks: [
                {
                    type: "text",
                    value: "# Quando a pergunta exige agregar duas vezes\n\nAlgumas perguntas não cabem numa consulta só porque envolvem dois níveis de agregação. Qual é o faturamento médio por cliente, por exemplo, exige primeiro somar as vendas de cada cliente e depois tirar a média dessas somas. Não existe função que faça as duas coisas ao mesmo tempo, e tentar avg direto na coluna valor responde outra pergunta, o ticket médio por venda.\n\nA solução é a tabela derivada: uma subconsulta escrita no FROM, que produz um resultado intermediário sobre o qual a consulta externa trabalha. No PostgreSQL ela precisa de um apelido, senão a consulta nem é aceita. Esse apelido é o nome que você usa para referenciar as colunas dela.\n\nA tabela derivada tem uma limitação importante: ela é isolada. Não é possível referenciar, lá dentro, colunas de outra tabela do mesmo FROM. Quando a pergunta exige isso, existe a palavra LATERAL, que libera a subconsulta a enxergar as colunas das tabelas listadas antes dela.",
                },
                {
                    type: "code",
                    value: "-- Dois niveis de agregacao: soma por cliente, depois media das somas.\nSELECT\n    round(avg(faturamento), 2) AS faturamento_medio_por_cliente,\n    count(*)                   AS clientes\nFROM (\n    SELECT cliente_id, sum(valor) AS faturamento\n    FROM vendas\n    WHERE data_venda >= DATE '2025-01-01'\n    GROUP BY cliente_id\n) por_cliente;\n\n-- LATERAL: para cada cliente, as tres compras mais recentes.\nSELECT c.id, c.nome, u.data_venda, u.valor\nFROM clientes c\nCROSS JOIN LATERAL (\n    SELECT v.data_venda, v.valor\n    FROM vendas v\n    WHERE v.cliente_id = c.id\n    ORDER BY v.data_venda DESC\n    LIMIT 3\n) u;",
                },
                {
                    type: "text",
                    value: "## Ticket médio por venda não é faturamento médio por cliente\n\nVale insistir nessa distinção porque ela aparece em reunião toda semana. O ticket médio por venda divide o faturamento total pela quantidade de vendas. O faturamento médio por cliente divide o faturamento total pela quantidade de clientes. Os dois números são úteis, respondem coisas diferentes e costumam ser confundidos no título do gráfico.\n\nA regra prática é olhar o denominador. Sempre que alguém pedir uma média, pergunte média por o quê, e transforme a resposta no grão da tabela derivada interna. Se o grão pedido é cliente, a subconsulta agrupa por cliente; se é dia, agrupa por dia; se é campanha, agrupa por campanha.\n\nO LATERAL, por sua vez, resolve a família de perguntas do tipo os N mais recentes por grupo, difíceis de escrever sem ele. Ele funciona como um laço: para cada linha da esquerda, a subconsulta roda enxergando aquela linha. É poderoso e legível, mas o custo cresce com a quantidade de linhas da esquerda, então prefira funções de janela quando o volume for grande, e o módulo 5 mostra como.",
                },
                {
                    type: "table",
                    value: '[["Pergunta","Grão da tabela derivada","Denominador da média"],["Ticket médio por venda","Nenhuma, agrega direto","Quantidade de vendas"],["Faturamento médio por cliente","Uma linha por cliente","Quantidade de clientes"],["Vendas médias por dia","Uma linha por dia","Quantidade de dias"],["Itens médios por pedido","Uma linha por pedido","Quantidade de pedidos"],["Receita média por campanha","Uma linha por campanha","Quantidade de campanhas"]]',
                },
                {
                    type: "quote",
                    value: "Toda média tem um denominador escondido. Quando alguém pede a média, a pergunta certa é média por o quê, e a resposta vira o agrupamento da subconsulta interna.",
                },
            ],
            questions: [
                {
                    statement: "Por que o faturamento médio por cliente exige uma tabela derivada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "É preciso somar por cliente antes de tirar a média",
                            isCorrect: true,
                        },
                        {
                            text: "A função avg não aceita colunas do tipo numeric ali",
                            isCorrect: false,
                        },
                        {
                            text: "O GROUP BY não pode aparecer junto de outro filtro",
                            isCorrect: false,
                        },
                        {
                            text: "A média de clientes exige junção com a dimensão deles",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o PostgreSQL exige de toda subconsulta escrita no FROM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Que ela receba um apelido para ser referenciada",
                            isCorrect: true,
                        },
                        {
                            text: "Que ela tenha ao menos uma cláusula de agrupamento",
                            isCorrect: false,
                        },
                        {
                            text: "Que ela devolva uma única coluna no seu resultado",
                            isCorrect: false,
                        },
                        {
                            text: "Que ela seja convertida em CTE antes de executar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a diferença entre ticket médio por venda e faturamento médio por cliente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O denominador é a quantidade de vendas ou de clientes",
                            isCorrect: true,
                        },
                        {
                            text: "O primeiro ignora nulos e o segundo os trata como zero",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro usa avg e o segundo precisa usar a mediana",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro considera devoluções e o segundo as descarta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a palavra LATERAL permite numa subconsulta do FROM?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Enxergar colunas das tabelas listadas antes dela",
                            isCorrect: true,
                        },
                        {
                            text: "Dispensar o apelido exigido pela tabela derivada",
                            isCorrect: false,
                        },
                        {
                            text: "Executar a subconsulta uma única vez, em cache",
                            isCorrect: false,
                        },
                        {
                            text: "Combinar duas tabelas sem escrever condição no ON",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta usa CROSS JOIN LATERAL com LIMIT 3 para pegar as compras recentes de cada cliente. Qual é o custo dessa construção?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A subconsulta roda uma vez por linha da tabela da esquerda",
                            isCorrect: true,
                        },
                        {
                            text: "A subconsulta lê toda a tabela de vendas em cada execução",
                            isCorrect: false,
                        },
                        {
                            text: "O banco materializa o resultado inteiro em disco temporário",
                            isCorrect: false,
                        },
                        {
                            text: "O LIMIT interno impede o uso de qualquer índice em vendas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Subconsulta correlacionada e o custo dela",
            blocks: [
                {
                    type: "text",
                    value: "# A subconsulta que olha para a linha de fora\n\nUma subconsulta é correlacionada quando referencia uma coluna da consulta externa. O EXISTS do módulo 3 é o exemplo mais comum: dentro dele, v.cliente_id é comparado com c.id, que vem de fora. Conceitualmente, isso significa que a subconsulta é reavaliada para cada linha da consulta externa.\n\nEssa forma é muito expressiva. Perguntas como qual foi a data da última compra deste cliente, ou quantos chamados este assinante abriu, saem quase traduzidas do português. E enquanto a tabela externa tem centenas de linhas, o custo é irrelevante.\n\nO problema aparece na escala. Com um milhão de clientes na consulta externa, uma subconsulta correlacionada mal indexada vira um milhão de buscas. É o padrão que a literatura chama de consulta em laço, e é a causa mais frequente de relatório que rodava em segundos e passou a rodar em horas depois que a base cresceu.",
                },
                {
                    type: "code",
                    value: "-- Correlacionada: uma coluna por linha, avaliada cliente a cliente.\nSELECT\n    c.id,\n    c.nome,\n    (SELECT max(v.data_venda) FROM vendas v WHERE v.cliente_id = c.id) AS ultima_compra,\n    (SELECT count(*)          FROM vendas v WHERE v.cliente_id = c.id) AS compras\nFROM clientes c;\n\n-- Mesma resposta com uma unica varredura, agregando antes de juntar.\nSELECT\n    c.id,\n    c.nome,\n    a.ultima_compra,\n    coalesce(a.compras, 0) AS compras\nFROM clientes c\nLEFT JOIN (\n    SELECT cliente_id,\n           max(data_venda) AS ultima_compra,\n           count(*)        AS compras\n    FROM vendas\n    GROUP BY cliente_id\n) a ON a.cliente_id = c.id;",
                },
                {
                    type: "text",
                    value: "## Quando ela é aceitável e quando trocar\n\nA reescrita padrão é a da segunda consulta: agregue a tabela grande uma vez, por chave, e junte o resultado. Em vez de um milhão de buscas pontuais, o banco faz uma varredura agrupada e uma junção, o que costuma ser ordens de grandeza mais rápido em volume analítico. Repare também que a versão com junção precisa de coalesce para transformar a ausência em zero, coisa que a correlacionada com count já fazia sozinha.\n\nNem toda correlacionada é ruim. O EXISTS correlacionado é eficiente porque para na primeira linha encontrada e costuma virar uma semi-junção no plano de execução. Planejadores modernos, incluindo o do PostgreSQL, reescrevem várias correlacionadas automaticamente; o que eles nem sempre conseguem é transformar uma correlacionada com agregação em junção agregada.\n\nA regra prática: se a subconsulta correlacionada só testa existência, deixe como está. Se ela calcula agregação por linha da externa, e a externa tem muitas linhas, reescreva como junção agregada, ou use função de janela, que é justamente o próximo módulo.",
                },
                {
                    type: "table",
                    value: '[["Uso da correlacionada","Escala confortável","Alternativa recomendada"],["EXISTS para filtrar","Boa em qualquer volume","Manter, vira semi-junção"],["NOT EXISTS para ausência","Boa em qualquer volume","Manter, é a forma segura"],["max ou min por linha","Ruim com muitas linhas","Agregar antes e juntar"],["count por linha externa","Ruim com muitas linhas","Agregar antes e juntar"],["Ranking dentro do grupo","Ruim já em volume médio","Função de janela do módulo 5"]]',
                },
                {
                    type: "quote",
                    value: "Correlacionada com agregação é um laço escrito em SQL. Enquanto a tabela de fora é pequena, ninguém percebe. Quando ela cresce, o relatório não fica lento: ele para de terminar.",
                },
            ],
            questions: [
                {
                    statement: "O que torna uma subconsulta correlacionada?",
                    difficulty: "facil",
                    options: [
                        { text: "Ela referencia uma coluna da consulta externa", isCorrect: true },
                        { text: "Ela aparece escrita dentro da cláusula FROM", isCorrect: false },
                        {
                            text: "Ela devolve mais de uma linha no seu resultado",
                            isCorrect: false,
                        },
                        {
                            text: "Ela usa alguma função de agregação no seu corpo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que uma correlacionada com agregação fica cara quando a base cresce?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ela é reavaliada para cada linha da consulta externa",
                            isCorrect: true,
                        },
                        {
                            text: "Ela precisa ordenar a tabela interna antes de agregar",
                            isCorrect: false,
                        },
                        {
                            text: "Ela impede o banco de usar qualquer índice na externa",
                            isCorrect: false,
                        },
                        {
                            text: "Ela mantém o resultado inteiro na memória durante a leitura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a reescrita padrão de uma correlacionada com agregação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Agregar a tabela grande por chave e juntar o resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar a subconsulta por um filtro simples na cláusula WHERE",
                            isCorrect: false,
                        },
                        {
                            text: "Mover a subconsulta do SELECT para dentro do HAVING final",
                            isCorrect: false,
                        },
                        {
                            text: "Criar um índice em cada coluna citada dentro da subconsulta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Ao trocar uma correlacionada com count por uma junção agregada, o que costuma ser necessário na saída?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Aplicar coalesce para virar zero onde não houve linha",
                            isCorrect: true,
                        },
                        {
                            text: "Aplicar DISTINCT para remover clientes repetidos ali",
                            isCorrect: false,
                        },
                        {
                            text: "Ordenar por cliente para manter a mesma sequência antes",
                            isCorrect: false,
                        },
                        {
                            text: "Converter a contagem para texto antes de exibir no painel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o EXISTS correlacionado costuma ser eficiente mesmo em volume alto?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ele para na primeira linha achada e vira semi-junção",
                            isCorrect: true,
                        },
                        {
                            text: "Ele é executado apenas uma vez, no início da consulta",
                            isCorrect: false,
                        },
                        {
                            text: "Ele mantém em memória o resultado de cada linha testada",
                            isCorrect: false,
                        },
                        {
                            text: "Ele dispensa índice porque lê somente a chave primária",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "WITH: a CTE que salva a legibilidade",
            blocks: [
                {
                    type: "text",
                    value: "# Dar nome às etapas muda tudo\n\nUma consulta analítica de verdade costuma ter três ou quatro etapas: recortar o período, agregar por alguma chave, cruzar com outra base, calcular a métrica final. Escrita com subconsultas aninhadas, ela vira um bloco em que a leitura começa no meio e vai para fora, o que é desconfortável até para quem escreveu.\n\nA cláusula WITH resolve isso. Ela define expressões de tabela comuns, as CTEs, que são resultados intermediários nomeados, declarados antes da consulta principal. Você lê de cima para baixo, na mesma ordem em que pensou o problema, e cada etapa ganha um nome que explica o que ela faz.\n\nUma CTE vale apenas durante a consulta em que foi declarada. Ela não cria tabela, não persiste nada e some quando a consulta termina. É um nome para um resultado intermediário, não um objeto do banco, e essa distinção evita a confusão mais comum de quem está começando.",
                },
                {
                    type: "code",
                    value: "-- A mesma analise, agora legivel de cima para baixo.\nWITH vendas_2025 AS (\n    SELECT cliente_id, produto_id, valor, data_venda\n    FROM vendas\n    WHERE data_venda >= DATE '2025-01-01'\n      AND data_venda <  DATE '2026-01-01'\n),\npor_cliente AS (\n    SELECT cliente_id,\n           sum(valor) AS faturamento,\n           count(*)   AS compras\n    FROM vendas_2025\n    GROUP BY cliente_id\n)\nSELECT\n    c.uf,\n    count(*)                        AS clientes,\n    round(avg(p.faturamento), 2)    AS faturamento_medio,\n    round(avg(p.compras), 2)        AS compras_medias\nFROM por_cliente p\nJOIN clientes c ON c.id = p.cliente_id\nGROUP BY c.uf\nORDER BY faturamento_medio DESC;",
                },
                {
                    type: "text",
                    value: "## Reaproveitar a mesma etapa duas vezes\n\nO segundo ganho da CTE é o reaproveitamento. Comparar o faturamento de cada estado com o faturamento nacional exige o mesmo recorte de dados em dois níveis diferentes. Com subconsulta, você escreveria o recorte duas vezes, e o dia em que alguém alterar um lado e esquecer o outro, o percentual passa a não fechar em cem.\n\nCom CTE, o recorte é declarado uma vez e referenciado nas duas pontas. A consulta fica menor, e o mais importante, fica impossível os dois lados divergirem. Em análise, consistência interna vale mais que elegância.\n\nO terceiro ganho é a revisão. Uma consulta com etapas nomeadas pode ser conferida etapa por etapa: basta trocar o SELECT final por um SELECT sobre a CTE intermediária e olhar o que ela produziu. Esse hábito, de inspecionar cada etapa antes de acreditar no número final, separa quem escreve SQL de quem confia em SQL.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Subconsulta aninhada","CTE com WITH"],["Ordem de leitura","De dentro para fora","De cima para baixo"],["Nome da etapa","Só o apelido no fim","Nome declarado antes do uso"],["Reaproveitar a etapa","Precisa repetir o texto","Referencia o nome outra vez"],["Conferir o meio do caminho","Difícil, exige recortar","Basta consultar a CTE isolada"],["Persistência no banco","Nenhuma","Nenhuma, some ao terminar"],["Uso em consultas longas","Vira bloco ilegível","Sustenta quatro ou cinco etapas"]]',
                },
                {
                    type: "quote",
                    value: "CTE não deixa a consulta mais rápida, deixa a consulta revisável. E consulta que ninguém consegue revisar é exatamente aquela em que o erro mora há meses.",
                },
            ],
            questions: [
                {
                    statement: "O que a cláusula WITH cria numa consulta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Resultados intermediários nomeados para aquela consulta",
                            isCorrect: true,
                        },
                        {
                            text: "Tabelas temporárias gravadas no banco até o fim da sessão",
                            isCorrect: false,
                        },
                        {
                            text: "Índices auxiliares usados durante a execução da consulta",
                            isCorrect: false,
                        },
                        {
                            text: "Cópias das tabelas de origem para leitura mais rápida ali",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a principal vantagem de ler uma consulta escrita com CTE?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A leitura segue de cima para baixo, na ordem do raciocínio",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta passa a usar índice em todas as etapas nomeadas",
                            isCorrect: false,
                        },
                        {
                            text: "O banco guarda o resultado das etapas para a próxima sessão",
                            isCorrect: false,
                        },
                        {
                            text: "As etapas rodam em paralelo por padrão em qualquer versão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quanto tempo uma CTE existe?",
                    difficulty: "facil",
                    options: [
                        { text: "Apenas durante a consulta em que foi declarada", isCorrect: true },
                        {
                            text: "Até o fim da sessão aberta com o banco de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Até alguém remover explicitamente o objeto criado",
                            isCorrect: false,
                        },
                        {
                            text: "Enquanto a tabela de origem não sofrer alteração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que declarar o recorte uma vez em CTE reduz erro numa análise que compara estado com total nacional?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os dois níveis usam o mesmo recorte e não podem divergir",
                            isCorrect: true,
                        },
                        {
                            text: "O banco recalcula o recorte a cada nível, com mais precisão",
                            isCorrect: false,
                        },
                        {
                            text: "A CTE aplica arredondamento uniforme nos dois lados da conta",
                            isCorrect: false,
                        },
                        {
                            text: "A CTE garante que o percentual sempre feche exatamente em cem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual prática de revisão a CTE viabiliza numa consulta longa de análise?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Consultar cada etapa isolada e conferir o que ela produziu",
                            isCorrect: true,
                        },
                        {
                            text: "Executar a consulta em modo de teste, sem tocar nos dados",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar automaticamente o resultado com a execução anterior",
                            isCorrect: false,
                        },
                        {
                            text: "Obrigar o banco a validar os tipos antes de rodar a consulta",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "CTE encadeada e quando ela atrapalha",
            blocks: [
                {
                    type: "text",
                    value: "# Um pipeline de análise em etapas nomeadas\n\nCTEs podem se referenciar em cadeia: a segunda usa a primeira, a terceira usa a segunda. É assim que uma análise complexa vira um pipeline legível, em que cada etapa faz uma coisa só. Uma sequência comum em trabalho com dados é recortar, limpar, agregar, enriquecer e calcular a métrica final.\n\nO benefício não é apenas estético. Quando cada etapa tem uma responsabilidade única, encontrar o ponto em que o número ficou errado é questão de olhar as etapas em ordem. Quando tudo está num bloco só, achar o erro exige reconstruir a consulta.\n\nUm limite prático: passar de cinco ou seis etapas costuma indicar que a análise merece virar uma tabela intermediária de verdade, materializada por um processo agendado. Consulta longa demais é sinal de que o trabalho passou de exploração para produção, e essa mudança pede outro instrumento, que o módulo 7 apresenta.",
                },
                {
                    type: "code",
                    value: "-- Pipeline: recorta, agrega, classifica e resume, uma etapa por vez.\nWITH base AS (\n    SELECT cliente_id, valor, data_venda\n    FROM vendas\n    WHERE data_venda >= DATE '2025-01-01'\n),\npor_cliente AS (\n    SELECT cliente_id, sum(valor) AS faturamento\n    FROM base\n    GROUP BY cliente_id\n),\nclassificado AS (\n    SELECT\n        cliente_id,\n        faturamento,\n        CASE\n            WHEN faturamento >= 10000 THEN 'alto'\n            WHEN faturamento >= 1000  THEN 'medio'\n            ELSE 'baixo'\n        END AS faixa\n    FROM por_cliente\n)\nSELECT faixa, count(*) AS clientes, sum(faturamento) AS total\nFROM classificado\nGROUP BY faixa\nORDER BY total DESC;",
                },
                {
                    type: "text",
                    value: "## Quando a CTE atrapalha de verdade\n\nAté a versão 11 do PostgreSQL, toda CTE era uma barreira de otimização: o banco executava a etapa inteira e só depois aplicava o que viesse fora dela. Isso significava que um filtro escrito na consulta final não descia para dentro da CTE, e uma etapa que produzia cinquenta milhões de linhas era executada inteira mesmo que o resultado final usasse mil.\n\nDa versão 12 em diante o comportamento mudou: uma CTE não recursiva, sem efeito colateral e referenciada uma única vez é embutida na consulta por padrão, e o otimizador pode empurrar filtros para dentro dela. Quando a CTE é referenciada mais de uma vez, o padrão continua sendo materializar, para não repetir o trabalho.\n\nVocê pode decidir explicitamente com as palavras MATERIALIZED e NOT MATERIALIZED depois do AS. Materializar vale a pena quando a etapa é cara e reutilizada; não materializar vale quando você quer que o filtro externo desça e reduza a leitura. Em outros bancos analíticos o comportamento varia, então a regra profissional é medir com o plano de execução em vez de supor, e ler plano é o começo do módulo 7.",
                },
                {
                    type: "table",
                    value: '[["Situação","Comportamento no PostgreSQL 12 ou maior","Efeito prático"],["CTE usada uma vez","Embutida na consulta por padrão","O filtro externo pode descer"],["CTE usada duas ou mais vezes","Materializada por padrão","Executada uma vez e reaproveitada"],["CTE com MATERIALIZED","Sempre materializada","Boa para etapa cara e reutilizada"],["CTE com NOT MATERIALIZED","Sempre embutida","Deixa o otimizador reduzir a leitura"],["CTE recursiva","Sempre materializada","Necessária para hierarquia e série"],["PostgreSQL 11 ou menor","Sempre barreira de otimização","Filtro externo nunca descia"]]',
                },
                {
                    type: "quote",
                    value: "Escreva a CTE pensando em quem vai ler, e depois confira no plano de execução se o banco entendeu do jeito que você imaginou. Legibilidade primeiro, medição em seguida.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza uma cadeia de CTEs numa análise?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cada etapa referencia a anterior e faz uma coisa só",
                            isCorrect: true,
                        },
                        {
                            text: "Todas as etapas leem a mesma tabela de origem em paralelo",
                            isCorrect: false,
                        },
                        {
                            text: "As etapas são gravadas em disco e reusadas na próxima vez",
                            isCorrect: false,
                        },
                        {
                            text: "A última etapa precisa repetir os filtros de todas as outras",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como o PostgreSQL 12 trata uma CTE não recursiva referenciada uma única vez?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Embute na consulta, deixando o filtro externo descer",
                            isCorrect: true,
                        },
                        {
                            text: "Materializa sempre, como uma barreira de otimização",
                            isCorrect: false,
                        },
                        {
                            text: "Converte a etapa em tabela temporária durante a sessão",
                            isCorrect: false,
                        },
                        {
                            text: "Executa a etapa uma vez para cada linha do resultado final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando vale a pena escrever MATERIALIZED numa CTE?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quando a etapa é cara e aparece mais de uma vez adiante",
                            isCorrect: true,
                        },
                        {
                            text: "Quando a etapa é barata e usada uma única vez na consulta",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o resultado precisa continuar existindo após o fim",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a consulta tem junções entre mais de duas tabelas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa versão antiga do PostgreSQL, por que uma CTE que produz cinquenta milhões de linhas era um problema?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ela rodava inteira, pois o filtro externo não descia",
                            isCorrect: true,
                        },
                        {
                            text: "Ela era recalculada uma vez para cada linha do resultado",
                            isCorrect: false,
                        },
                        {
                            text: "Ela era gravada em disco e ocupava espaço permanente",
                            isCorrect: false,
                        },
                        {
                            text: "Ela impedia o uso de qualquer junção na consulta final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma análise passou a ter oito etapas encadeadas e roda todo dia num painel. O que isso costuma indicar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Que ela merece virar uma tabela intermediária mantida",
                            isCorrect: true,
                        },
                        {
                            text: "Que ela precisa ser reescrita como uma consulta única",
                            isCorrect: false,
                        },
                        {
                            text: "Que faltam índices nas colunas usadas em cada etapa",
                            isCorrect: false,
                        },
                        {
                            text: "Que as etapas deveriam ser trocadas por correlacionadas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Funções de janela",
    aulas: [
        {
            titulo: "Agregar sem colapsar linhas",
            blocks: [
                {
                    type: "text",
                    value: "# O salto conceitual da trilha\n\nAté agora, agregar significava perder o detalhe: cinco milhões de vendas viravam doze linhas de faturamento mensal. Isso resolve muita coisa, mas trava numa família inteira de perguntas em que você quer o detalhe e o contexto ao mesmo tempo. Quanto esta venda representa do total do dia. Quanto este cliente gastou a mais que a média do estado dele. Qual a posição deste produto dentro da categoria.\n\nA função de janela responde exatamente isso. Ela calcula uma agregação sobre um conjunto de linhas relacionadas à linha atual, chamado de janela, e devolve o resultado ao lado da linha, sem colapsar nada. A quantidade de linhas do resultado continua igual à da entrada.\n\nA sintaxe é a mesma agregação de sempre, seguida da palavra OVER e da definição da janela entre parênteses. Dentro dos parênteses vão duas ideias: PARTITION BY, que diz em quais grupos a janela se reinicia, e ORDER BY, que dá sequência às linhas dentro de cada grupo. Sem nada dentro, a janela é a tabela inteira.",
                },
                {
                    type: "code",
                    value: "-- Cada venda ao lado do total do seu dia e da sua participacao.\nSELECT\n    v.id,\n    v.data_venda,\n    v.valor,\n    sum(v.valor)  OVER (PARTITION BY v.data_venda)              AS total_do_dia,\n    round(100 * v.valor / sum(v.valor) OVER (PARTITION BY v.data_venda), 2)\n                                                                AS pct_do_dia,\n    round(avg(v.valor) OVER (PARTITION BY v.data_venda), 2)     AS ticket_medio_do_dia,\n    count(*)      OVER ()                                       AS linhas_no_recorte\nFROM vendas v\nWHERE v.data_venda >= DATE '2025-01-01';",
                },
                {
                    type: "text",
                    value: "## Janela e GROUP BY resolvem coisas diferentes\n\nA comparação mais útil é esta: o GROUP BY responde qual é o total por dia, com uma linha por dia. A janela responde qual é o total do dia desta venda, com uma linha por venda. São a mesma conta em grãos diferentes de resposta.\n\nA consequência prática é que participação percentual, que antes exigia calcular o total numa subconsulta e juntar de volta, vira uma expressão só. Isso não é apenas mais curto: é uma varredura a menos e um lugar a menos onde os dois recortes podem divergir.\n\nVale registrar a ordem em que as coisas acontecem, porque ela explica quase todo erro do módulo. As funções de janela são calculadas depois do FROM, do WHERE, do GROUP BY e do HAVING, e antes do ORDER BY final, do DISTINCT e do LIMIT. Por isso a janela enxerga o resultado já filtrado e já agrupado, e por isso não se pode filtrar o resultado de uma janela no WHERE da mesma consulta.",
                },
                {
                    type: "table",
                    value: '[["Pergunta","Ferramenta","Linhas no resultado"],["Faturamento por dia","GROUP BY data","Uma por dia"],["Total do dia ao lado de cada venda","Janela com PARTITION BY","Uma por venda"],["Participação da venda no dia","Janela dividindo pelo total","Uma por venda"],["Média do estado ao lado do cliente","Janela particionada por estado","Uma por cliente"],["Total geral do recorte","Janela com OVER vazio","Uma por linha do recorte"],["Posição do produto na categoria","Janela de ranking","Uma por produto"]]',
                },
                {
                    type: "quote",
                    value: "GROUP BY troca detalhe por resumo. Janela dá o resumo sem cobrar o detalhe. É por isso que ela abre uma classe de perguntas que antes exigia duas consultas e uma junção.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que distingue uma função de janela de uma agregação com GROUP BY?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ela devolve o resultado sem reduzir a quantidade de linhas",
                            isCorrect: true,
                        },
                        {
                            text: "Ela só funciona sobre colunas numéricas de tabelas grandes",
                            isCorrect: false,
                        },
                        {
                            text: "Ela calcula o valor antes de o filtro do WHERE ser aplicado",
                            isCorrect: false,
                        },
                        {
                            text: "Ela substitui a junção entre a tabela de fato e a dimensão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a cláusula PARTITION BY define dentro de um OVER?",
                    difficulty: "facil",
                    options: [
                        { text: "Em quais grupos a janela se reinicia do zero", isCorrect: true },
                        {
                            text: "Em que ordem as linhas saem no resultado final",
                            isCorrect: false,
                        },
                        { text: "Quantas linhas anteriores entram no cálculo", isCorrect: false },
                        { text: "Quais colunas aparecem na saída da consulta", isCorrect: false },
                    ],
                },
                {
                    statement: "O que OVER sem nada entre parênteses significa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A janela é todo o conjunto de linhas já filtrado",
                            isCorrect: true,
                        },
                        {
                            text: "A janela é apenas a linha atual, sem vizinhança",
                            isCorrect: false,
                        },
                        {
                            text: "A janela é a tabela crua, antes de qualquer filtro",
                            isCorrect: false,
                        },
                        {
                            text: "A janela é definida automaticamente pela chave primária",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em que momento da execução as funções de janela são calculadas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Depois do WHERE e do GROUP BY, antes do ORDER BY final",
                            isCorrect: true,
                        },
                        {
                            text: "Antes do WHERE, direto sobre as linhas cruas da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "Junto com o FROM, enquanto as tabelas são combinadas",
                            isCorrect: false,
                        },
                        {
                            text: "Depois do LIMIT, apenas sobre as linhas que sobraram",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual vantagem prática existe em calcular participação percentual com janela em vez de subconsulta e junção?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Uma varredura a menos e um recorte só, sem divergir",
                            isCorrect: true,
                        },
                        {
                            text: "O resultado passa a incluir também as linhas sem valor",
                            isCorrect: false,
                        },
                        {
                            text: "O banco garante que o percentual sempre feche em cem",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta deixa de precisar de qualquer filtro de data",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "ROW_NUMBER, RANK e DENSE_RANK",
            blocks: [
                {
                    type: "text",
                    value: "# Três formas de numerar, três respostas diferentes\n\nAs três funções numeram linhas dentro da janela seguindo a ordem definida no OVER, e diferem apenas no tratamento de empate. O row_number nunca empata: ele atribui um número distinto para cada linha, e a escolha entre linhas empatadas é arbitrária se não houver desempate explícito.\n\nO rank empata e pula. Se duas linhas dividem o primeiro lugar, as duas recebem um e a próxima recebe três. É o comportamento de classificação esportiva, e é o que a maioria das pessoas espera quando pede um ranking.\n\nO dense_rank empata e não pula. Duas linhas em primeiro recebem um, e a próxima recebe dois. Ele é útil quando você quer contar níveis distintos de valor, e não posições. Escolher entre os três não é detalhe estético: a resposta de quantos produtos estão no top três muda conforme a função.",
                },
                {
                    type: "code",
                    value: "-- Ranking de produtos dentro de cada categoria.\nSELECT\n    p.categoria,\n    p.nome,\n    sum(v.valor)                                                          AS faturamento,\n    row_number() OVER (PARTITION BY p.categoria ORDER BY sum(v.valor) DESC) AS posicao,\n    rank()       OVER (PARTITION BY p.categoria ORDER BY sum(v.valor) DESC) AS rank_com_pulo,\n    dense_rank() OVER (PARTITION BY p.categoria ORDER BY sum(v.valor) DESC) AS rank_sem_pulo\nFROM vendas v\nJOIN produtos p ON p.id = v.produto_id\nGROUP BY p.categoria, p.nome;\n\n-- Padrao classico: a compra mais recente de cada cliente.\nWITH numerada AS (\n    SELECT\n        v.*,\n        row_number() OVER (PARTITION BY v.cliente_id\n                           ORDER BY v.data_venda DESC, v.id DESC) AS rn\n    FROM vendas v\n)\nSELECT cliente_id, id, data_venda, valor\nFROM numerada\nWHERE rn = 1;",
                },
                {
                    type: "text",
                    value: "## O padrão mais usado da carreira: um por grupo\n\nA segunda consulta acima é o padrão que você vai repetir mais vezes na vida: pegar o primeiro registro de cada grupo. A última compra de cada cliente, o preço mais recente de cada produto, o evento mais antigo de cada sessão, a leitura mais alta de cada sensor. Tudo cai nesse molde.\n\nA receita tem três partes. Particione pelo grupo, ordene pelo critério que define o primeiro, e filtre a numeração igual a um. A parte que todo mundo esquece é que o filtro não pode ficar no WHERE da mesma consulta, porque a janela é calculada depois do WHERE. Por isso a numeração vai para uma CTE ou subconsulta, e o filtro vem por fora.\n\nO segundo detalhe é o desempate. Se dois registros do mesmo cliente têm a mesma data, qual deles é o primeiro fica indefinido, e o relatório muda entre execuções. Acrescentar uma segunda coluna no ORDER BY da janela, como o identificador, resolve de forma barata e definitiva.",
                },
                {
                    type: "table",
                    value: '[["Valores 100, 90, 90, 80","row_number","rank","dense_rank"],["Primeira linha","1","1","1"],["Segunda linha","2","2","2"],["Terceira linha, empatada","3","2","2"],["Quarta linha","4","4","3"],["Quantas linhas com número 1","Sempre uma","Todas as empatadas no topo","Todas as empatadas no topo"],["Uso mais comum","Pegar um por grupo","Classificação de negócio","Contar níveis distintos"]]',
                },
                {
                    type: "quote",
                    value: "Ranking sem desempate explícito é uma moeda jogada pelo banco. Coloque uma segunda coluna no ORDER BY da janela e o relatório para de mudar sozinho.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença entre rank e dense_rank em caso de empate?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O rank pula posições depois do empate e o dense não pula",
                            isCorrect: true,
                        },
                        {
                            text: "O rank ignora as linhas empatadas e o dense as mantém ali",
                            isCorrect: false,
                        },
                        {
                            text: "O rank só funciona com ORDER BY decrescente na janela",
                            isCorrect: false,
                        },
                        {
                            text: "O rank numera por partição e o dense numera a tabela toda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que row_number faz quando duas linhas empatam no critério de ordenação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Atribui números diferentes, com escolha arbitrária",
                            isCorrect: true,
                        },
                        {
                            text: "Atribui o mesmo número às duas linhas empatadas",
                            isCorrect: false,
                        },
                        {
                            text: "Devolve nulo para as duas linhas que empataram",
                            isCorrect: false,
                        },
                        {
                            text: "Descarta uma das duas linhas do resultado final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o filtro de posição igual a um precisa ficar fora da consulta que calcula a janela?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A janela é calculada depois de o WHERE já ter rodado",
                            isCorrect: true,
                        },
                        {
                            text: "O WHERE não aceita comparações com colunas numéricas",
                            isCorrect: false,
                        },
                        {
                            text: "A função de janela devolve texto e exige conversão antes",
                            isCorrect: false,
                        },
                        {
                            text: "O banco recalcula a janela a cada linha que passa no filtro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa lista com valores 100, 90, 90 e 80, qual número dense_rank atribui à última linha?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Três, porque ele não pula posições após o empate",
                            isCorrect: true,
                        },
                        {
                            text: "Quatro, porque ele conta cada linha individualmente",
                            isCorrect: false,
                        },
                        {
                            text: "Dois, porque ele agrupa os valores em duas faixas",
                            isCorrect: false,
                        },
                        {
                            text: "Um, porque ele reinicia a contagem a cada empate",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um relatório da última compra por cliente troca de resultado entre execuções. Qual é a causa mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Há compras na mesma data e falta desempate na janela",
                            isCorrect: true,
                        },
                        {
                            text: "O row_number reinicia a numeração a cada nova execução",
                            isCorrect: false,
                        },
                        {
                            text: "O PARTITION BY foi escrito com a coluna de data errada",
                            isCorrect: false,
                        },
                        {
                            text: "A CTE materializa um resultado diferente a cada consulta",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "LAG e LEAD para comparar períodos",
            blocks: [
                {
                    type: "text",
                    value: "# Trazer a linha vizinha para o lado\n\nComparar um período com o anterior é a pergunta mais frequente de qualquer painel: quanto o faturamento cresceu em relação ao mês passado, quantos dias se passaram entre uma compra e a seguinte, se a temperatura do sensor subiu desde a leitura anterior. Sem função de janela, isso exigia juntar a tabela com ela mesma deslocada, que é trabalhoso e fácil de errar.\n\nO lag traz o valor de uma linha anterior dentro da janela, e o lead traz o de uma linha posterior. Ambos aceitam o deslocamento como segundo argumento, então lag de doze compara com o mesmo mês do ano passado numa série mensal. Aceitam também um terceiro argumento, que é o valor a devolver quando não existe vizinho.\n\nA primeira linha de cada partição não tem anterior, então o lag devolve nulo ali, e a variação percentual calculada em cima também vem nula. Isso é correto: não existe crescimento no primeiro período observado. Substituir esse nulo por zero é enganoso, e um coalesce aplicado sem pensar transforma ausência de informação em um dado falso.",
                },
                {
                    type: "code",
                    value: "-- Faturamento mensal e variacao contra o mes anterior.\nWITH mensal AS (\n    SELECT\n        date_trunc('month', data_venda)::date AS mes,\n        sum(valor)                            AS faturamento\n    FROM vendas\n    GROUP BY 1\n)\nSELECT\n    mes,\n    faturamento,\n    lag(faturamento) OVER (ORDER BY mes)                       AS mes_anterior,\n    faturamento - lag(faturamento) OVER (ORDER BY mes)         AS variacao,\n    round(100 * (faturamento / lag(faturamento) OVER (ORDER BY mes) - 1), 2)\n                                                               AS variacao_pct,\n    lag(faturamento, 12) OVER (ORDER BY mes)                   AS mesmo_mes_ano_passado\nFROM mensal\nORDER BY mes;\n\n-- Intervalo entre compras consecutivas do mesmo cliente.\nSELECT\n    cliente_id,\n    data_venda,\n    data_venda - lag(data_venda) OVER (PARTITION BY cliente_id ORDER BY data_venda)\n        AS dias_desde_a_anterior\nFROM vendas;",
                },
                {
                    type: "text",
                    value: "## A armadilha do mês que não existe\n\nAqui mora um erro que atinge relatórios sérios. O lag traz a linha anterior da janela, e não o mês anterior do calendário. Se março não teve nenhuma venda, ele simplesmente não aparece na série agregada, e o lag de abril traz fevereiro. A consulta continua rodando, o gráfico continua bonito, e a variação de abril é comparada com o período errado.\n\nO mesmo vale para qualquer série com buracos: dias sem evento, semanas sem campanha, sensores que ficaram offline. Quanto mais granular a série, mais provável o buraco. A correção é garantir a série completa antes de aplicar o lag, gerando todos os períodos e preenchendo com zero os que não tiveram movimento. É exatamente o assunto do módulo 6.\n\nUm segundo cuidado é o PARTITION BY. Sem ele, o lag atravessa fronteiras de grupo: numa série por cliente e mês, a primeira linha de um cliente pega o último mês do cliente anterior. Particionar pelo cliente é o que impede essa contaminação, e esquecer isso produz números que parecem plausíveis, o que é a pior categoria de erro.",
                },
                {
                    type: "table",
                    value: '[["Função","O que traz","Argumento extra","Quando devolve nulo"],["lag(coluna)","Valor da linha anterior","Deslocamento e padrão","Na primeira linha da partição"],["lead(coluna)","Valor da linha seguinte","Deslocamento e padrão","Na última linha da partição"],["lag(coluna, 12)","Valor doze linhas atrás","Padrão opcional","Nas doze primeiras linhas"],["first_value(coluna)","Primeiro valor da janela","Depende do frame","Se a janela estiver vazia"],["last_value(coluna)","Último valor da janela","Exige frame explícito","Se a janela estiver vazia"]]',
                },
                {
                    type: "quote",
                    value: "O lag traz a linha anterior, não o mês anterior. Se um mês não tem venda, ele não existe na série, e a sua comparação mensal está mentindo com muita elegância.",
                },
            ],
            questions: [
                {
                    statement: "O que a função lag devolve numa consulta com janela ordenada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O valor da linha anterior dentro da mesma partição",
                            isCorrect: true,
                        },
                        {
                            text: "O valor acumulado desde o começo daquela partição",
                            isCorrect: false,
                        },
                        {
                            text: "O valor da próxima linha da sequência ordenada ali",
                            isCorrect: false,
                        },
                        {
                            text: "A média dos valores anteriores da mesma partição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o lag devolve na primeira linha de uma partição?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Nulo, a menos que um valor padrão seja informado",
                            isCorrect: true,
                        },
                        {
                            text: "Zero, porque não existe valor anterior para trazer",
                            isCorrect: false,
                        },
                        {
                            text: "O próprio valor da linha atual, como aproximação",
                            isCorrect: false,
                        },
                        {
                            text: "O último valor da partição anterior da mesma janela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Março não teve nenhuma venda e não aparece na série mensal agregada. O que o lag traz na linha de abril?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fevereiro, porque ele traz a linha anterior da janela",
                            isCorrect: true,
                        },
                        {
                            text: "Nulo, porque o mês anterior do calendário está ausente",
                            isCorrect: false,
                        },
                        {
                            text: "Zero, porque o banco preenche períodos vazios sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "Março com faturamento zero, criado automaticamente ali",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa série de faturamento por cliente e mês, o que acontece se o lag for usado sem PARTITION BY?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A primeira linha de um cliente pega o mês do anterior",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta devolve erro por falta de partição na janela",
                            isCorrect: false,
                        },
                        {
                            text: "Todos os valores de lag saem nulos na série resultante",
                            isCorrect: false,
                        },
                        {
                            text: "O lag passa a considerar apenas o primeiro cliente da lista",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que aplicar coalesce com zero sobre o resultado de um lag pode ser enganoso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Vira crescimento infinito onde não havia período anterior",
                            isCorrect: true,
                        },
                        {
                            text: "Vira erro de divisão que interrompe a execução da consulta",
                            isCorrect: false,
                        },
                        {
                            text: "Vira um valor negativo que inverte a ordem da série gerada",
                            isCorrect: false,
                        },
                        {
                            text: "Vira uma linha a mais no resultado, alterando a contagem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Soma acumulada e média móvel com frame",
            blocks: [
                {
                    type: "text",
                    value: "# O frame decide quais linhas entram na conta\n\nQuando a janela tem ORDER BY, ela ganha um recorte adicional chamado frame: quais linhas, em relação à atual, participam do cálculo. É o frame que separa uma soma acumulada de uma soma total, e uma média móvel de uma média geral.\n\nO frame se escreve com ROWS ou RANGE seguido de BETWEEN. Soma acumulada é ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, ou seja, do começo da partição até a linha atual. Média móvel de sete dias é ROWS BETWEEN 6 PRECEDING AND CURRENT ROW, uma janela deslizante de sete linhas.\n\nA diferença entre ROWS e RANGE é sutil e importante. ROWS conta linhas físicas. RANGE conta valores da coluna de ordenação, o que faz todas as linhas empatadas naquele valor entrarem juntas. Numa série com um registro por dia, as duas se comportam igual; numa série com vários registros por dia, elas divergem, e o acumulado com RANGE inclui o dia inteiro em todas as linhas daquele dia.",
                },
                {
                    type: "code",
                    value: "-- Serie diaria com acumulado no ano e media movel de sete dias.\nWITH diario AS (\n    SELECT data_venda AS dia, sum(valor) AS faturamento\n    FROM vendas\n    WHERE data_venda >= DATE '2025-01-01'\n    GROUP BY data_venda\n)\nSELECT\n    dia,\n    faturamento,\n    sum(faturamento) OVER (\n        ORDER BY dia\n        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n    ) AS acumulado_no_ano,\n    round(avg(faturamento) OVER (\n        ORDER BY dia\n        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n    ), 2) AS media_movel_7d,\n    round(100 * faturamento / sum(faturamento) OVER (), 2) AS pct_do_total\nFROM diario\nORDER BY dia;",
                },
                {
                    type: "text",
                    value: "## O frame padrão, que engana quem não sabe dele\n\nSe você escreve OVER com ORDER BY e não define frame, o PostgreSQL aplica o padrão do SQL, que é RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. Na prática, isso já dá soma acumulada, e é por isso que muita gente escreve acumulado sem frame e obtém o resultado certo por acidente.\n\nO acidente acaba quando existem empates na coluna de ordenação. Como o RANGE inclui todas as linhas com o mesmo valor, o acumulado de todas as vendas de um mesmo dia mostra o total do dia inteiro, e não o valor até aquela venda. Se a sua intenção era acumular linha a linha, ROWS é a escrita correta, e ela deve ser explícita.\n\nA outra armadilha é o last_value. Com o frame padrão terminando na linha atual, o último valor da janela é sempre a própria linha, o que faz a coluna parecer inútil. Para obter de fato o último valor da partição é preciso escrever ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING. É a pergunta de entrevista favorita sobre janelas, e agora você sabe a resposta.",
                },
                {
                    type: "table",
                    value: '[["Objetivo","Frame a escrever","Observação"],["Soma acumulada linha a linha","ROWS UNBOUNDED PRECEDING até CURRENT ROW","Explícito evita surpresa com empate"],["Média móvel de sete períodos","ROWS 6 PRECEDING até CURRENT ROW","As seis primeiras linhas usam menos"],["Total da partição inteira","Sem ORDER BY no OVER","Frame padrão vira a partição toda"],["Último valor da partição","ROWS UNBOUNDED PRECEDING até UNBOUNDED FOLLOWING","Sem isso, last_value devolve a atual"],["Acumulado somando o dia inteiro","RANGE UNBOUNDED PRECEDING até CURRENT ROW","Inclui todas as linhas empatadas"],["Média centrada em três períodos","ROWS 1 PRECEDING até 1 FOLLOWING","Olha uma linha para cada lado"]]',
                },
                {
                    type: "quote",
                    value: "Escreva o frame mesmo quando o padrão já resolve. O padrão é RANGE, e RANGE trata empates de um jeito que só aparece no dia em que a série ganha duas linhas com a mesma data.",
                },
            ],
            questions: [
                {
                    statement: "O que o frame de uma janela determina?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quais linhas em torno da atual entram no cálculo",
                            isCorrect: true,
                        },
                        {
                            text: "Quais colunas da tabela participam da agregação",
                            isCorrect: false,
                        },
                        {
                            text: "Em quais grupos a numeração da janela reinicia",
                            isCorrect: false,
                        },
                        { text: "Em que ordem o resultado final é apresentado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual frame produz uma média móvel de sete períodos?",
                    difficulty: "medio",
                    options: [
                        { text: "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW", isCorrect: true },
                        { text: "ROWS BETWEEN 7 PRECEDING AND 7 FOLLOWING", isCorrect: false },
                        {
                            text: "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
                            isCorrect: false,
                        },
                        { text: "ROWS BETWEEN CURRENT ROW AND 7 FOLLOWING", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual é o frame padrão quando o OVER tem ORDER BY e nenhum frame escrito?",
                    difficulty: "medio",
                    options: [
                        { text: "RANGE do início da partição até a linha atual", isCorrect: true },
                        { text: "ROWS do início da partição até a linha atual", isCorrect: false },
                        {
                            text: "RANGE cobrindo a partição inteira, do início ao fim",
                            isCorrect: false,
                        },
                        {
                            text: "ROWS cobrindo apenas a linha atual, sem vizinhas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa série com várias vendas por dia, qual é a diferença entre acumular com ROWS e com RANGE?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "RANGE soma o dia inteiro em todas as linhas daquele dia",
                            isCorrect: true,
                        },
                        {
                            text: "ROWS soma o dia inteiro em todas as linhas daquele dia",
                            isCorrect: false,
                        },
                        {
                            text: "RANGE ignora as linhas empatadas e soma apenas a primeira",
                            isCorrect: false,
                        },
                        {
                            text: "ROWS reinicia o acumulado a cada mudança de data na série",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que last_value costuma devolver o valor da própria linha atual?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O frame padrão termina justamente na linha atual",
                            isCorrect: true,
                        },
                        {
                            text: "A função ignora o ORDER BY escrito dentro do OVER",
                            isCorrect: false,
                        },
                        {
                            text: "A função exige PARTITION BY para enxergar o fim",
                            isCorrect: false,
                        },
                        {
                            text: "O banco calcula o último valor antes de ordenar tudo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Erros comuns com PARTITION BY e ORDER BY",
            blocks: [
                {
                    type: "text",
                    value: "# Cinco erros que consomem uma tarde\n\nO primeiro é filtrar o resultado da janela no WHERE da mesma consulta. Como a janela é calculada depois do WHERE, o banco recusa a consulta ou, pior, você move o filtro e muda a partição sem perceber. A solução é sempre a mesma: calcule a janela numa CTE e filtre por fora.\n\nO segundo é confundir o filtro que restringe a janela com o filtro que restringe a saída. Um WHERE aplicado antes muda o conjunto sobre o qual a janela é calculada. Se você quer o percentual da venda sobre o total do ano, mas filtra janeiro no WHERE, o total passa a ser o de janeiro. Nem sempre é o que você queria, e a consulta não avisa.\n\nO terceiro é misturar janela com GROUP BY sem entender a ordem. Quando existe agrupamento, a janela opera sobre as linhas já agregadas, e por isso dentro do OVER você escreve sum de valor, e não a coluna crua. Quem tenta usar a coluna original recebe um erro que parece arbitrário, mas é coerente com a ordem de execução.",
                },
                {
                    type: "code",
                    value: "-- ERRADO: nao da para filtrar a janela no mesmo nivel.\n-- SELECT cliente_id, row_number() OVER (...) AS rn FROM vendas WHERE rn = 1;\n\n-- CERTO: janela numa etapa, filtro na etapa seguinte.\nWITH ranqueado AS (\n    SELECT\n        p.categoria,\n        p.nome,\n        sum(v.valor) AS faturamento,\n        rank() OVER (PARTITION BY p.categoria ORDER BY sum(v.valor) DESC) AS pos\n    FROM vendas v\n    JOIN produtos p ON p.id = v.produto_id\n    WHERE v.data_venda >= DATE '2025-01-01'\n    GROUP BY p.categoria, p.nome\n)\nSELECT categoria, nome, faturamento, pos\nFROM ranqueado\nWHERE pos <= 3\nORDER BY categoria, pos;\n\n-- Janela nomeada: escreva a definicao uma vez e reuse.\nSELECT\n    cliente_id,\n    data_venda,\n    sum(valor) OVER w AS acumulado,\n    count(*)   OVER w AS compras_ate_aqui\nFROM vendas\nWINDOW w AS (PARTITION BY cliente_id ORDER BY data_venda\n             ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW);",
                },
                {
                    type: "text",
                    value: "## Repetição de definição e o desempenho da janela\n\nO quarto erro é repetir a mesma definição de janela em cinco colunas diferentes. Além de deixar a consulta comprida e frágil a divergências, dificulta enxergar que todas usam o mesmo recorte. A cláusula WINDOW nomeia a definição uma vez e cada coluna a referencia pelo nome, como no exemplo acima.\n\nO quinto é ignorar o custo. Uma função de janela exige que o banco ordene as linhas dentro de cada partição, e ordenação de volume grande usa memória e, quando ela acaba, disco. Duas janelas com a mesma definição custam quase o mesmo que uma, porque o banco reaproveita a ordenação; duas janelas com definições diferentes custam duas ordenações.\n\nDaí duas recomendações práticas: filtre antes de aplicar janela, para ordenar menos linhas, e padronize as definições sempre que possível. Ainda assim, a janela quase sempre ganha da alternativa antiga, que era juntar a tabela com ela mesma. Ler o plano de execução é o que confirma isso caso a caso, e é o começo do módulo 7.",
                },
                {
                    type: "table",
                    value: '[["Erro","Sintoma","Correção"],["Filtrar a janela no WHERE","Erro de coluna inexistente","Calcular em CTE e filtrar por fora"],["Filtro que encolhe a janela","Percentual não fecha como esperado","Decidir se o filtro vem antes ou depois"],["Coluna crua dentro do OVER com GROUP BY","Erro de coluna fora do agrupamento","Usar a agregação dentro do OVER"],["Repetir a definição de janela","Consulta longa e propensa a divergir","Nomear a janela com WINDOW"],["Esquecer PARTITION BY","Valores atravessam grupos vizinhos","Particionar pela chave do grupo"],["Ignorar o custo da ordenação","Consulta lenta em volume alto","Filtrar antes e padronizar definições"]]',
                },
                {
                    type: "quote",
                    value: "Toda janela pede uma ordenação. Filtrar antes de ordenar é a otimização mais barata que existe, e é a que quase ninguém lembra de fazer.",
                },
            ],
            questions: [
                {
                    statement: "Por que não é possível filtrar o resultado de uma janela no WHERE?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A janela só é calculada depois de o WHERE ter rodado",
                            isCorrect: true,
                        },
                        {
                            text: "O WHERE aceita apenas comparações entre duas colunas",
                            isCorrect: false,
                        },
                        {
                            text: "A janela devolve um valor por partição, e não por linha",
                            isCorrect: false,
                        },
                        {
                            text: "O banco proíbe funções de qualquer tipo dentro do WHERE",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve a cláusula WINDOW numa consulta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Nomear uma definição de janela e reusá-la nas colunas",
                            isCorrect: true,
                        },
                        {
                            text: "Limitar quantas linhas a função de janela vai percorrer",
                            isCorrect: false,
                        },
                        {
                            text: "Definir o tamanho de memória reservado para a ordenação",
                            isCorrect: false,
                        },
                        {
                            text: "Criar uma janela persistente reaproveitada por outra consulta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta quer o percentual de cada venda sobre o total do ano, mas o WHERE filtra janeiro. O que acontece?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O total da janela passa a ser o de janeiro, não o do ano",
                            isCorrect: true,
                        },
                        {
                            text: "O total da janela continua sendo o do ano inteiro filtrado",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta devolve erro por incompatibilidade de recorte",
                            isCorrect: false,
                        },
                        {
                            text: "O percentual sai nulo, pois a janela ficou sem referência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa consulta com GROUP BY, o que deve ir dentro do OVER ao ranquear por faturamento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A agregação sum de valor, e não a coluna crua de valor",
                            isCorrect: true,
                        },
                        {
                            text: "A coluna crua de valor, pois a janela lê a tabela original",
                            isCorrect: false,
                        },
                        {
                            text: "O apelido criado no SELECT, que já resolve o agrupamento",
                            isCorrect: false,
                        },
                        {
                            text: "Uma subconsulta escalar que devolve o total agrupado ali",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que duas janelas com a mesma definição custam menos que duas com definições diferentes?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O banco reaproveita uma única ordenação para as duas",
                            isCorrect: true,
                        },
                        {
                            text: "O banco guarda o resultado da primeira janela em cache",
                            isCorrect: false,
                        },
                        {
                            text: "O banco só calcula a segunda janela se a primeira falhar",
                            isCorrect: false,
                        },
                        {
                            text: "O banco converte a segunda janela em subconsulta simples",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Agregação analítica e tempo",
    aulas: [
        {
            titulo: "GROUPING SETS, ROLLUP e CUBE",
            blocks: [
                {
                    type: "text",
                    value: "# Vários níveis de total numa consulta só\n\nRelatório de negócio quase nunca pede um nível de agregação apenas. Ele pede faturamento por canal e por categoria, mais o subtotal de cada canal, mais o total geral. A saída ingênua para isso é escrever três consultas e uni-las com UNION ALL, o que funciona, mas varre a tabela três vezes e triplica a chance de os filtros divergirem entre os blocos.\n\nO SQL tem uma construção própria para isso. O GROUPING SETS recebe a lista de agrupamentos desejados e produz todos numa varredura só. Cada conjunto entre parênteses é um nível, e o conjunto vazio representa o total geral.\n\nO ROLLUP é um atalho para a hierarquia: ROLLUP de canal e categoria gera os dois juntos, depois só canal, depois o total. É o formato de relatório com subtotal que todo mundo conhece de planilha. O CUBE é o atalho para todas as combinações possíveis, útil quando você quer explorar cruzamentos sem decidir antes qual importa.",
                },
                {
                    type: "code",
                    value: "-- Detalhe, subtotal por canal e total geral, em uma varredura.\nSELECT\n    coalesce(canal, 'TODOS OS CANAIS')        AS canal,\n    coalesce(categoria, 'TODAS AS CATEGORIAS') AS categoria,\n    sum(v.valor)                               AS faturamento,\n    grouping(canal)     AS eh_total_de_canal,\n    grouping(categoria) AS eh_total_de_categoria\nFROM vendas v\nJOIN produtos p ON p.id = v.produto_id\nWHERE v.data_venda >= DATE '2025-01-01'\nGROUP BY ROLLUP (canal, p.categoria)\nORDER BY grouping(canal), canal, grouping(p.categoria), categoria;\n\n-- Equivalente explicito do ROLLUP acima:\n-- GROUP BY GROUPING SETS ((canal, categoria), (canal), ())",
                },
                {
                    type: "text",
                    value: "## O nulo que significa subtotal\n\nEssas construções trazem uma sutileza que causa confusão em toda equipe. Nas linhas de subtotal, as colunas que não participam daquele nível vêm com nulo. A linha de total geral tem canal nulo e categoria nula. Só que a base também pode ter vendas com canal genuinamente nulo, e no resultado as duas coisas ficam idênticas.\n\nA função grouping resolve o impasse. Ela devolve um para as colunas que foram agregadas naquele nível e zero para as que participaram do agrupamento. Assim você distingue o nulo de subtotal do nulo de dado ausente, e pode rotular a saída com um coalesce apenas onde faz sentido.\n\nA mesma função ajuda na ordenação. Ordenar apenas pelo nome do canal joga os subtotais no meio do relatório, porque nulo tem posição própria na ordenação. Ordenar primeiro por grouping e depois pela coluna coloca o detalhe antes do subtotal e o total geral no fim, que é a leitura esperada.",
                },
                {
                    type: "table",
                    value: '[["Construção","Níveis gerados com duas colunas","Uso típico"],["GROUP BY a, b","Apenas o detalhe cruzado","Tabela de fato a fato"],["GROUPING SETS","Exatamente os que você listar","Controle total sobre o relatório"],["ROLLUP (a, b)","Cruzado, só a, e total geral","Relatório com subtotal hierárquico"],["CUBE (a, b)","Cruzado, só a, só b, e total","Exploração de todos os cruzamentos"],["UNION ALL de consultas","Os que você escrever à mão","Evitar, varre a tabela várias vezes"],["grouping(coluna)","Não gera nível, marca o nível","Separar subtotal de nulo real"]]',
                },
                {
                    type: "quote",
                    value: "No resultado de um ROLLUP, nulo pode significar subtotal ou pode significar dado ausente. A função grouping é a única forma honesta de saber qual dos dois você está olhando.",
                },
            ],
            questions: [
                {
                    statement: "O que a construção GROUPING SETS permite fazer?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Produzir vários níveis de agregação numa varredura só",
                            isCorrect: true,
                        },
                        {
                            text: "Filtrar grupos depois que a agregação já foi calculada",
                            isCorrect: false,
                        },
                        {
                            text: "Agrupar por uma coluna sem incluí-la no resultado final",
                            isCorrect: false,
                        },
                        {
                            text: "Ordenar o resultado por vários critérios ao mesmo tempo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais níveis o ROLLUP de duas colunas gera?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O cruzado, só a primeira coluna e o total geral",
                            isCorrect: true,
                        },
                        {
                            text: "O cruzado, só a segunda coluna e o total geral",
                            isCorrect: false,
                        },
                        {
                            text: "Todas as combinações possíveis entre as duas colunas",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas o cruzamento das duas colunas, sem subtotais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve a função grouping no resultado de um ROLLUP?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Distinguir o nulo de subtotal do nulo de dado ausente",
                            isCorrect: true,
                        },
                        {
                            text: "Contar quantos níveis de agregação foram gerados ali",
                            isCorrect: false,
                        },
                        {
                            text: "Somar os subtotais para conferir com o total geral",
                            isCorrect: false,
                        },
                        {
                            text: "Remover as linhas de subtotal quando não são desejadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a desvantagem de gerar subtotais com UNION ALL de várias consultas?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A tabela é varrida uma vez para cada bloco escrito",
                            isCorrect: true,
                        },
                        {
                            text: "O resultado sai sem a linha de total geral no fim",
                            isCorrect: false,
                        },
                        {
                            text: "Os subtotais saem sempre em ordem alfabética fixa",
                            isCorrect: false,
                        },
                        {
                            text: "As colunas de texto precisam ser convertidas antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num relatório com ROLLUP, os subtotais aparecem no meio das linhas de detalhe. Como corrigir a ordenação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ordenar por grouping da coluna antes da própria coluna",
                            isCorrect: true,
                        },
                        {
                            text: "Ordenar apenas pelo nome da coluna, em ordem crescente",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o ROLLUP por CUBE, que já ordena os níveis certo",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar coalesce nas colunas nulas antes de ordenar tudo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Truncar e agrupar por período",
            blocks: [
                {
                    type: "text",
                    value: "# Reduzir o instante ao período da pergunta\n\nEventos chegam com carimbo de tempo até o segundo, mas quase nenhuma análise pergunta por segundo. A pergunta é por dia, por semana, por mês, por trimestre. Agrupar por período é reduzir o instante ao início do período que interessa, e a função que faz isso no PostgreSQL é date_trunc.\n\nEla recebe a unidade e o valor e devolve o começo daquele período: date_trunc de month sobre o dia vinte e três de março devolve o primeiro de março. Como a saída continua sendo um valor temporal, e não texto, ela ordena corretamente, aceita comparação de intervalo e pode ser subtraída de outra data.\n\nÉ aí que mora um erro muito comum: agrupar usando to_char, que devolve texto formatado. O agrupamento funciona, mas a ordenação passa a ser alfabética, então abril vem antes de janeiro se o formato for por nome, e 2025-10 vem antes de 2025-9 se o mês não tiver zero à esquerda. A regra é agrupar e ordenar por valor temporal e formatar somente na hora de exibir.",
                },
                {
                    type: "code",
                    value: "-- Serie mensal correta: agrupa por data, formata so na saida.\nSELECT\n    date_trunc('month', data_venda)::date            AS mes,\n    to_char(date_trunc('month', data_venda), 'MM/YYYY') AS rotulo,\n    count(*)                                          AS vendas,\n    sum(valor)                                        AS faturamento\nFROM vendas\nGROUP BY 1\nORDER BY 1;\n\n-- Evento com fuso: converta antes de truncar para o dia bater.\nSELECT\n    date_trunc('day', ocorrido_em AT TIME ZONE 'America/Sao_Paulo')::date AS dia,\n    count(*) AS eventos\nFROM eventos\nGROUP BY 1\nORDER BY 1;\n\n-- Semana comeca na segunda no PostgreSQL.\nSELECT date_trunc('week', data_venda)::date AS semana, sum(valor)\nFROM vendas\nGROUP BY 1\nORDER BY 1;",
                },
                {
                    type: "text",
                    value: "## Detalhes de calendário que mudam o número\n\nO primeiro é a semana. No PostgreSQL, date_trunc de week devolve a segunda-feira, seguindo o padrão internacional. Se o negócio conta a semana começando no domingo, o resultado fica deslocado em um dia, e o gráfico semanal não bate com o que a operação enxerga. Isso se ajusta subtraindo um dia antes de truncar e somando depois, mas o importante é combinar a definição com quem usa o número.\n\nO segundo é o fuso, que já apareceu no módulo 1 e volta aqui em forma prática. Se o carimbo está em horário universal, truncar direto joga as três últimas horas do dia brasileiro para o dia seguinte. Converter com AT TIME ZONE antes de truncar resolve, e deixar essa conversão explícita na consulta evita que alguém a esqueça na próxima versão do relatório.\n\nO terceiro é a comparação de períodos incompletos. O mês corrente sempre parece pior que o anterior porque ainda não terminou. Comparações honestas ou excluem o período em curso, ou comparam a mesma quantidade de dias decorridos, e isso é decisão de análise, não de SQL.",
                },
                {
                    type: "table",
                    value: '[["Necessidade","Escrita recomendada","Por que"],["Agrupar por mês","date_trunc month sobre a data","Mantém tipo temporal e ordena certo"],["Rotular o mês no painel","to_char apenas no SELECT","Texto só na exibição, não no GROUP BY"],["Agrupar por semana","date_trunc week sobre a data","Começa na segunda no PostgreSQL"],["Dia local a partir de instante","AT TIME ZONE antes de truncar","Sem isso a noite cai no dia seguinte"],["Filtrar um mês inteiro","Intervalo com maior ou igual e menor","Permite usar índice na coluna crua"],["Comparar com o mês anterior","Excluir o período ainda em curso","Mês incompleto sempre parece pior"]]',
                },
                {
                    type: "quote",
                    value: "Agrupe por data, formate por texto. Quem agrupa por texto formatado descobre o problema no dia em que outubro aparece antes de setembro no eixo do gráfico.",
                },
            ],
            questions: [
                {
                    statement: "O que a função date_trunc devolve?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O início do período pedido, ainda como valor temporal",
                            isCorrect: true,
                        },
                        {
                            text: "O período formatado como texto, pronto para exibição",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de dias decorridos desde o início do ano",
                            isCorrect: false,
                        },
                        {
                            text: "O número do mês ou da semana extraído da data original",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que agrupar por to_char em vez de date_trunc é arriscado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A ordenação vira alfabética e a série sai fora de ordem",
                            isCorrect: true,
                        },
                        {
                            text: "A função to_char não aceita colunas do tipo timestamp",
                            isCorrect: false,
                        },
                        {
                            text: "O agrupamento por texto ignora as linhas com valor nulo",
                            isCorrect: false,
                        },
                        {
                            text: "O resultado passa a somar duas vezes cada mês da série",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em que dia da semana o date_trunc de week começa no PostgreSQL?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Na segunda-feira, seguindo o padrão internacional",
                            isCorrect: true,
                        },
                        {
                            text: "No domingo, seguindo o calendário comercial local",
                            isCorrect: false,
                        },
                        {
                            text: "No mesmo dia da semana da primeira linha da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "No primeiro dia do mês em que a semana se encontra",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Eventos gravados em horário universal são truncados por dia sem conversão. Qual é o efeito no Brasil?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As últimas horas da noite entram no dia seguinte",
                            isCorrect: true,
                        },
                        {
                            text: "As primeiras horas da manhã entram no dia anterior",
                            isCorrect: false,
                        },
                        {
                            text: "O total do período fica maior do que o real medido",
                            isCorrect: false,
                        },
                        {
                            text: "Os eventos noturnos são descartados do agrupamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o mês corrente quase sempre parece pior que o anterior num painel?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ele ainda não terminou e acumulou menos dias que o outro",
                            isCorrect: true,
                        },
                        {
                            text: "O date_trunc exclui o dia atual do agrupamento por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "A carga do mês corrente só é processada na virada do mês",
                            isCorrect: false,
                        },
                        {
                            text: "O banco arredonda o mês em curso para o valor anterior",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Buracos na série e como preenchê-los",
            blocks: [
                {
                    type: "text",
                    value: "# O dia sem venda não existe na tabela\n\nUma agregação só produz linha para o que existe. Se nenhum evento aconteceu no dia sete, esse dia simplesmente não aparece na série. Para o banco isso é coerente; para a análise é um buraco, e ele estraga três coisas ao mesmo tempo.\n\nA primeira é o gráfico: a linha pula do dia seis para o dia oito e o eixo mente sobre o intervalo. A segunda é a média por período: dividir o total por trinta dias dá um resultado diferente de dividir pelos vinte e oito dias que apareceram. A terceira, já vista no módulo 5, é o lag, que passa a comparar com o período errado.\n\nA correção é gerar o calendário do recorte e juntar a agregação nele. No PostgreSQL isso se faz com generate_series, que produz uma sequência de datas a partir de um início, um fim e um passo. O calendário fica à esquerda de um LEFT JOIN, e o coalesce transforma a ausência em zero.",
                },
                {
                    type: "code",
                    value: "-- Serie diaria completa, com zero nos dias sem venda.\nWITH calendario AS (\n    SELECT generate_series(DATE '2025-01-01', DATE '2025-12-31', INTERVAL '1 day')::date AS dia\n),\ndiario AS (\n    SELECT data_venda AS dia, sum(valor) AS faturamento\n    FROM vendas\n    WHERE data_venda BETWEEN DATE '2025-01-01' AND DATE '2025-12-31'\n    GROUP BY data_venda\n)\nSELECT\n    c.dia,\n    coalesce(d.faturamento, 0) AS faturamento\nFROM calendario c\nLEFT JOIN diario d ON d.dia = c.dia\nORDER BY c.dia;\n\n-- Grade completa: todo mes cruzado com toda categoria, mesmo sem venda.\nWITH meses AS (\n    SELECT generate_series(DATE '2025-01-01', DATE '2025-12-01', INTERVAL '1 month')::date AS mes\n),\ncategorias AS (SELECT DISTINCT categoria FROM produtos)\nSELECT m.mes, c.categoria\nFROM meses m\nCROSS JOIN categorias c;",
                },
                {
                    type: "text",
                    value: "## Quando zero é a resposta certa e quando não é\n\nPreencher com zero é correto quando a ausência significa mesmo ausência de fato: nenhuma venda aconteceu, nenhum evento foi registrado. Nesse caso, o zero é informação legítima e deve entrar na média e no gráfico.\n\nMas existe o caso oposto, e confundir os dois é um erro sério. Se o sensor ficou offline, não houve zero grau: houve falta de medição. Se a carga do dia falhou, não houve zero vendas: houve dado faltando. Preencher esses casos com zero cria um vale no gráfico que ninguém consegue distinguir de uma queda real de negócio, e alguém vai tomar decisão em cima disso.\n\nA prática profissional é separar as duas situações e deixar visível qual é qual. Ausência de fato vira zero; ausência de medição fica nula e é sinalizada como falha de coleta. Uma tabela de controle de cargas, dizendo quais dias foram processados com sucesso, é o que permite distinguir os dois casos com honestidade.",
                },
                {
                    type: "table",
                    value: '[["Situação","Como preencher","Risco de errar"],["Dia sem nenhuma venda","Zero","Média por dia fica inflada sem o zero"],["Categoria sem venda no mês","Zero na grade cruzada","O item some do relatório comparativo"],["Sensor offline no período","Nulo, marcado como falha","Zero vira queda falsa de temperatura"],["Carga do dia que não rodou","Nulo, marcado como pendente","Zero vira queda falsa de faturamento"],["Cliente sem compra no mês","Zero na coorte","Sem a linha, a retenção sai maior"],["Período fora da operação","Excluir do recorte","Zero de loja fechada polui a média"]]',
                },
                {
                    type: "quote",
                    value: "Zero e ausente são coisas diferentes, e o gráfico não sabe disso. Antes de preencher um buraco com zero, responda se aquilo não aconteceu ou se apenas não foi medido.",
                },
            ],
            questions: [
                {
                    statement: "Por que dias sem evento não aparecem numa série agregada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A agregação só produz linha para o que existe na base",
                            isCorrect: true,
                        },
                        {
                            text: "O banco descarta linhas cujo total agregado seja zero",
                            isCorrect: false,
                        },
                        {
                            text: "O GROUP BY remove períodos que não tenham índice ali",
                            isCorrect: false,
                        },
                        {
                            text: "A função date_trunc pula datas sem correspondência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve generate_series numa análise temporal?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Produzir o calendário completo do recorte analisado",
                            isCorrect: true,
                        },
                        {
                            text: "Ordenar a série pelo período em ordem crescente ali",
                            isCorrect: false,
                        },
                        {
                            text: "Converter carimbos de tempo para o fuso local do país",
                            isCorrect: false,
                        },
                        {
                            text: "Calcular a diferença de dias entre duas datas da série",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a estrutura correta para preencher os buracos de uma série diária?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Calendário à esquerda num LEFT JOIN, com coalesce zero",
                            isCorrect: true,
                        },
                        {
                            text: "Agregação à esquerda num LEFT JOIN com o calendário",
                            isCorrect: false,
                        },
                        {
                            text: "INNER JOIN entre calendário e agregação, por data igual",
                            isCorrect: false,
                        },
                        {
                            text: "UNION ALL entre a agregação e a lista de datas faltantes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um sensor ficou offline por três dias. Por que preencher esse período com zero é perigoso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Falta de medição vira queda real aos olhos de quem lê",
                            isCorrect: true,
                        },
                        {
                            text: "O banco recusa valores zero em colunas de temperatura",
                            isCorrect: false,
                        },
                        {
                            text: "O zero impede o cálculo de média móvel sobre a série",
                            isCorrect: false,
                        },
                        {
                            text: "A série passa a ter mais linhas do que dias no período",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que permite distinguir com segurança ausência de fato de ausência de medição?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Uma tabela de controle dizendo quais cargas rodaram bem",
                            isCorrect: true,
                        },
                        {
                            text: "A comparação do total do dia com o total do dia anterior",
                            isCorrect: false,
                        },
                        {
                            text: "O uso de coalesce com zero em todas as séries geradas",
                            isCorrect: false,
                        },
                        {
                            text: "A contagem de linhas distintas presentes em cada período",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Coorte simples de retenção",
            blocks: [
                {
                    type: "text",
                    value: "# Agrupar pessoas pelo momento em que começaram\n\nCoorte é um grupo de pessoas que compartilha um marco inicial: quem fez a primeira compra em janeiro, quem assinou em março, quem instalou o aplicativo na semana passada. Analisar por coorte responde uma pergunta que a média geral esconde: quem entrou depois se comporta como quem entrou antes?\n\nA análise de retenção mede quantos membros de cada coorte continuam ativos em cada período seguinte. O resultado é uma matriz: cada linha é uma coorte, cada coluna é a distância em meses desde a entrada, e cada célula é o percentual que continuou ativo. O mês zero é sempre cem por cento, por definição.\n\nA construção em SQL tem três etapas claras, e é um exercício excelente de CTE encadeada. Primeiro, descobrir o mês de entrada de cada pessoa. Segundo, marcar em quais meses cada pessoa esteve ativa. Terceiro, cruzar as duas coisas, contar distintos por coorte e por distância, e dividir pelo tamanho da coorte.",
                },
                {
                    type: "code",
                    value: "-- Retencao mensal por coorte de primeira compra.\nWITH primeira AS (\n    SELECT cliente_id,\n           date_trunc('month', min(data_venda))::date AS coorte\n    FROM vendas\n    GROUP BY cliente_id\n),\natividade AS (\n    SELECT DISTINCT cliente_id,\n           date_trunc('month', data_venda)::date AS mes_ativo\n    FROM vendas\n),\ncruzado AS (\n    SELECT\n        p.coorte,\n        (extract(year  FROM age(a.mes_ativo, p.coorte)) * 12 +\n         extract(month FROM age(a.mes_ativo, p.coorte)))::int AS mes_indice,\n        a.cliente_id\n    FROM primeira p\n    JOIN atividade a ON a.cliente_id = p.cliente_id\n),\ntamanho AS (\n    SELECT coorte, count(*) AS clientes FROM primeira GROUP BY coorte\n)\nSELECT\n    c.coorte,\n    c.mes_indice,\n    count(DISTINCT c.cliente_id)                                  AS ativos,\n    round(100.0 * count(DISTINCT c.cliente_id) / t.clientes, 1)    AS retencao_pct\nFROM cruzado c\nJOIN tamanho t ON t.coorte = c.coorte\nGROUP BY c.coorte, c.mes_indice, t.clientes\nORDER BY c.coorte, c.mes_indice;",
                },
                {
                    type: "text",
                    value: "## Os três cuidados que separam coorte útil de coorte enganosa\n\nO primeiro é o denominador. A retenção de cada célula precisa ser dividida pelo tamanho da coorte na origem, e não pela quantidade de ativos do mês anterior. Dividir pelo mês anterior mede outra coisa, que é a sobrevivência período a período, e misturar as duas leituras na mesma tabela é um erro clássico de apresentação.\n\nO segundo é a maturidade desigual. A coorte de janeiro tem doze meses observados; a de novembro tem dois. Comparar a coluna do mês seis entre elas é comparar quem tem o dado com quem não tem, e a coorte nova aparece vazia, não ruim. Toda matriz de coorte precisa deixar visível que a parte inferior direita ainda não existe.\n\nO terceiro é a definição de ativo, que é decisão de negócio e precisa estar escrita. Comprar qualquer valor, comprar acima de um mínimo, abrir o aplicativo, usar uma funcionalidade específica: cada definição produz uma curva diferente, e comparar coortes medidas com definições distintas é comparar coisas diferentes com a mesma cor de gráfico.",
                },
                {
                    type: "table",
                    value: '[["Elemento da coorte","Definição","Erro comum"],["Coorte","Mês do primeiro evento da pessoa","Usar o mês do cadastro, não o do uso"],["Mês índice","Distância em meses desde a coorte","Contar meses de calendário corridos"],["Ativo","Regra de negócio explícita","Deixar a definição implícita no código"],["Denominador","Tamanho da coorte na origem","Dividir pelos ativos do mês anterior"],["Mês zero","Sempre cem por cento","Estranhar o valor e tentar corrigir"],["Coortes recentes","Poucos períodos observados","Ler ausência de dado como queda"]]',
                },
                {
                    type: "quote",
                    value: "Média geral mistura quem entrou ontem com quem entrou há três anos. A coorte separa os dois, e quase sempre revela que a base não piorou: ela só ficou mais nova.",
                },
            ],
            questions: [
                {
                    statement: "O que define uma coorte numa análise de retenção?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O período em que as pessoas tiveram o primeiro evento",
                            isCorrect: true,
                        },
                        {
                            text: "O valor total que cada pessoa gastou durante o período",
                            isCorrect: false,
                        },
                        {
                            text: "A faixa de idade usada para segmentar a base analisada",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de meses que a pessoa permaneceu ativa ali",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o mês índice representa numa matriz de coorte?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A distância em meses entre a atividade e a coorte",
                            isCorrect: true,
                        },
                        {
                            text: "O mês do calendário em que a atividade aconteceu",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de compras feitas naquele mesmo mês",
                            isCorrect: false,
                        },
                        {
                            text: "O total de clientes que entraram naquele período",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual deve ser o denominador do percentual de retenção de cada célula?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O tamanho da coorte no momento em que ela se formou",
                            isCorrect: true,
                        },
                        {
                            text: "A quantidade de clientes ativos no mês imediatamente anterior",
                            isCorrect: false,
                        },
                        {
                            text: "O total de clientes ativos na base inteira naquele mês",
                            isCorrect: false,
                        },
                        {
                            text: "A soma dos ativos de todos os meses índice já observados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o mês zero de toda coorte é sempre cem por cento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A coorte é definida pelo próprio evento daquele mês",
                            isCorrect: true,
                        },
                        {
                            text: "O cálculo arredonda o primeiro período para o topo",
                            isCorrect: false,
                        },
                        {
                            text: "Ninguém abandona o serviço no primeiro mês de uso",
                            isCorrect: false,
                        },
                        {
                            text: "O denominador do mês zero é sempre igual a um ali",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A coorte de novembro aparece com células vazias a partir do mês três. Como isso deve ser lido?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Como período ainda não observado, e não como queda",
                            isCorrect: true,
                        },
                        {
                            text: "Como abandono total dos clientes daquela coorte ali",
                            isCorrect: false,
                        },
                        {
                            text: "Como falha da consulta, que perdeu linhas na junção",
                            isCorrect: false,
                        },
                        {
                            text: "Como retenção zero, que deve entrar na média final",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Percentil e mediana, porque a média mente",
            blocks: [
                {
                    type: "text",
                    value: "# A média resume mal quase toda distribuição real\n\nMédia é a única estatística que muita análise apresenta, e ela é péssima nesse papel sozinha. O motivo é que quase toda distribuição interessante em dados de negócio é assimétrica: poucos clientes gastam muito, poucas sessões duram muito, poucas requisições demoram muito, e essas caudas puxam a média para longe do comportamento típico.\n\nA mediana é o valor que divide a distribuição em duas metades: metade abaixo, metade acima. Ela não se move quando o maior valor dobra, e por isso descreve o caso típico com muito mais fidelidade. Quando média e mediana estão distantes, isso já é uma descoberta: significa que existe uma cauda importante e que falar em cliente médio não faz sentido.\n\nOs percentis generalizam a ideia. O percentil noventa e cinco de tempo de resposta é o valor abaixo do qual estão noventa e cinco por cento das requisições, e é a métrica padrão para falar de experiência ruim. Em negócio, o percentil noventa de ticket separa a cauda de alto valor, e o percentil dez mostra o piso real da base.",
                },
                {
                    type: "code",
                    value: "-- Media engana; mediana e percentis contam a historia toda.\nSELECT\n    count(*)                                                       AS clientes,\n    round(avg(faturamento), 2)                                     AS media,\n    round(percentile_cont(0.5)  WITHIN GROUP (ORDER BY faturamento)::numeric, 2) AS mediana,\n    round(percentile_cont(0.9)  WITHIN GROUP (ORDER BY faturamento)::numeric, 2) AS p90,\n    round(percentile_cont(0.99) WITHIN GROUP (ORDER BY faturamento)::numeric, 2) AS p99,\n    max(faturamento)                                               AS maior\nFROM (\n    SELECT cliente_id, sum(valor) AS faturamento\n    FROM vendas\n    WHERE data_venda >= DATE '2025-01-01'\n    GROUP BY cliente_id\n) t;\n\n-- Percentil por grupo, para comparar canais entre si.\nSELECT\n    canal,\n    percentile_disc(0.5) WITHIN GROUP (ORDER BY valor) AS mediana_da_venda,\n    percentile_cont(0.95) WITHIN GROUP (ORDER BY valor) AS p95_da_venda\nFROM vendas\nGROUP BY canal\nORDER BY canal;",
                },
                {
                    type: "text",
                    value: "## Contínuo, discreto e o cuidado com o corte\n\nO PostgreSQL oferece duas famílias. A percentile_cont interpola entre os dois valores vizinhos e devolve um número que pode não existir na base, o que é adequado para métricas contínuas como tempo e valor. A percentile_disc devolve sempre um valor que existe de fato, o que é adequado quando o resultado precisa ser um registro real, como uma nota de avaliação.\n\nAs duas se escrevem com WITHIN GROUP e um ORDER BY interno, que é a sintaxe das funções de conjunto ordenado. Elas funcionam junto com GROUP BY, o que permite comparar a mediana entre canais, entre estados ou entre coortes numa consulta só. Para o valor mais frequente existe ainda a função mode, útil em colunas categóricas.\n\nUm cuidado final que vale mais que a sintaxe: percentil de amostra pequena é instável. O percentil noventa e nove de um grupo com trinta linhas é praticamente o máximo, e vai variar muito de uma semana para outra. Antes de comparar percentis entre grupos, olhe a contagem de cada grupo, e desconfie de qualquer p99 calculado sobre poucas dezenas de observações.",
                },
                {
                    type: "table",
                    value: '[["Medida","O que responde","Sensível a extremos?","Quando preferir"],["Média","Total dividido pela contagem","Muito","Quando a soma importa de fato"],["Mediana","O valor do meio da distribuição","Pouco","Para descrever o caso típico"],["Percentil 90","Onde termina a maioria","Pouco","Para separar a cauda de alto valor"],["Percentil 95 ou 99","Onde está a pior experiência","Moderada","Para tempo de resposta e latência"],["Moda","O valor mais frequente","Nenhuma","Em colunas categóricas"],["Máximo","O maior valor observado","Total","Para achar valor absurdo na base"]]',
                },
                {
                    type: "quote",
                    value: "Se a média está bem acima da mediana, existe uma cauda mandando na sua análise. Nesse cenário, cliente médio é uma pessoa que não existe em lugar nenhum da base.",
                },
            ],
            questions: [
                {
                    statement: "O que a mediana representa numa distribuição?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O valor que divide a distribuição em duas metades",
                            isCorrect: true,
                        },
                        {
                            text: "O valor que aparece com maior frequência na coluna",
                            isCorrect: false,
                        },
                        {
                            text: "A soma dos valores dividida pela quantidade de linhas",
                            isCorrect: false,
                        },
                        {
                            text: "A distância média entre os valores e o ponto central",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa a média estar bem acima da mediana?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Existe uma cauda de valores altos puxando a média",
                            isCorrect: true,
                        },
                        {
                            text: "Existem muitos valores nulos ignorados pelo cálculo",
                            isCorrect: false,
                        },
                        {
                            text: "A distribuição é simétrica em torno do ponto central",
                            isCorrect: false,
                        },
                        {
                            text: "A amostra é pequena demais para qualquer conclusão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre percentile_cont e percentile_disc?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A primeira interpola e a segunda devolve valor existente",
                            isCorrect: true,
                        },
                        {
                            text: "A primeira ignora nulos e a segunda os trata como zero",
                            isCorrect: false,
                        },
                        {
                            text: "A primeira funciona por grupo e a segunda só no total",
                            isCorrect: false,
                        },
                        {
                            text: "A primeira aceita texto e a segunda exige valor numérico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o percentil noventa e cinco é a métrica usual para tempo de resposta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele mostra a experiência ruim que a média esconde",
                            isCorrect: true,
                        },
                        {
                            text: "Ele é mais barato de calcular do que a média simples",
                            isCorrect: false,
                        },
                        {
                            text: "Ele descarta os valores extremos antes de calcular",
                            isCorrect: false,
                        },
                        {
                            text: "Ele coincide com a mediana em qualquer distribuição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe compara o percentil noventa e nove entre grupos de trinta linhas cada. Qual é o problema?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Com poucas linhas, esse percentil é quase o máximo",
                            isCorrect: true,
                        },
                        {
                            text: "Esse percentil não pode ser calculado com GROUP BY",
                            isCorrect: false,
                        },
                        {
                            text: "Grupos pequenos fazem a função devolver sempre nulo",
                            isCorrect: false,
                        },
                        {
                            text: "A interpolação exige ao menos cem linhas por grupo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Desempenho e escala",
    aulas: [
        {
            titulo: "Ler um plano de execução",
            blocks: [
                {
                    type: "text",
                    value: "# Pare de adivinhar e leia o que o banco decidiu\n\nSQL é declarativo, então você descreve o resultado e o banco escolhe o caminho. O plano de execução é esse caminho escrito por extenso. Aprender a lê-lo transforma discussão sobre desempenho em observação: em vez de achar que a consulta está lenta por causa da junção, você vê onde o tempo foi gasto.\n\nO comando EXPLAIN mostra o plano estimado, sem executar. O EXPLAIN ANALYZE executa de verdade e mostra, ao lado da estimativa, o tempo e a quantidade de linhas que realmente saíram de cada etapa. Em análise, use quase sempre o segundo, e lembre que ele roda a consulta, então cuidado com o que você pede em produção.\n\nO plano é uma árvore e se lê de dentro para fora, ou de baixo para cima na saída em texto. Cada nó recebe linhas dos filhos, faz alguma coisa e entrega ao pai. O nó mais interno costuma ser a leitura de uma tabela, e o mais externo é o que devolve o resultado final.",
                },
                {
                    type: "code",
                    value: "-- Plano estimado, sem executar a consulta.\nEXPLAIN\nSELECT canal, sum(valor)\nFROM vendas\nWHERE data_venda >= DATE '2025-01-01'\nGROUP BY canal;\n\n-- Plano real, com tempo e linhas efetivas de cada no.\nEXPLAIN (ANALYZE, BUFFERS)\nSELECT p.categoria, sum(v.valor)\nFROM vendas v\nJOIN produtos p ON p.id = v.produto_id\nWHERE v.data_venda >= DATE '2025-01-01'\nGROUP BY p.categoria;\n\n-- Estatisticas desatualizadas fazem o otimizador errar a estimativa.\nANALYZE vendas;",
                },
                {
                    type: "text",
                    value: "## O sinal mais valioso: estimativa contra realidade\n\nO número que mais ensina no EXPLAIN ANALYZE é a comparação entre linhas estimadas e linhas efetivas em cada nó. Quando o banco estima mil linhas e saem dois milhões, ele escolheu a estratégia para o cenário errado, e é por isso que a consulta está lenta. A causa mais comum é estatística desatualizada, resolvida rodando ANALYZE na tabela.\n\nOutras causas de estimativa ruim são correlação entre colunas, que o otimizador não conhece por padrão, e filtros aplicados sobre o resultado de funções, que ele não consegue estimar bem. Reconhecer o padrão já vale mais do que decorar soluções: divergência grande entre estimado e efetivo é sempre o primeiro lugar para olhar.\n\nO segundo sinal é onde o tempo se concentra. Um nó de ordenação que derrama em disco, uma junção em laço aninhado repetindo milhões de buscas, uma varredura que lê a tabela inteira para devolver dez linhas: cada um desses aparece nomeado no plano. Ler três ou quatro planos com atenção ensina mais sobre desempenho do que qualquer lista de dicas.",
                },
                {
                    type: "table",
                    value: '[["Nó do plano","O que faz","Quando é bom sinal"],["Seq Scan","Lê a tabela inteira","Quando a consulta usa boa parte dela"],["Index Scan","Busca pelo índice, linha a linha","Quando o filtro devolve poucas linhas"],["Bitmap Heap Scan","Usa índice e depois lê em blocos","Faixa média de linhas selecionadas"],["Nested Loop","Para cada linha, busca do outro lado","Lado externo pequeno e índice do outro"],["Hash Join","Monta tabela hash e cruza","Junção de duas entradas grandes"],["Merge Join","Cruza duas entradas já ordenadas","Quando as duas já vêm ordenadas"],["Sort","Ordena as linhas recebidas","Ruim se derramar para o disco"],["HashAggregate","Agrupa usando hash em memória","Agrupamento com poucos grupos"]]',
                },
                {
                    type: "quote",
                    value: "A pergunta mais produtiva diante de um plano não é qual nó é lento, e sim onde o banco errou a estimativa. O erro de estimativa é a causa; a estratégia ruim é só o sintoma.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença entre EXPLAIN e EXPLAIN ANALYZE?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O segundo executa a consulta e mostra tempo real",
                            isCorrect: true,
                        },
                        {
                            text: "O segundo apenas formata melhor a mesma estimativa",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro executa e o segundo só estima o resultado",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro exige índice e o segundo funciona sem ele",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em que ordem se lê a árvore de um plano de execução?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "De dentro para fora, dos nós mais internos ao final",
                            isCorrect: true,
                        },
                        {
                            text: "De cima para baixo, na ordem em que foi impressa ali",
                            isCorrect: false,
                        },
                        {
                            text: "Na ordem das cláusulas escritas na consulta original",
                            isCorrect: false,
                        },
                        {
                            text: "Da esquerda para a direita, seguindo a indentação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O plano estima mil linhas num nó, mas saem dois milhões. O que isso indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O otimizador escolheu a estratégia para o cenário errado",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta devolveu linhas duplicadas por causa da junção",
                            isCorrect: false,
                        },
                        {
                            text: "O índice usado no filtro está corrompido e precisa ser refeito",
                            isCorrect: false,
                        },
                        {
                            text: "A tabela ficou grande demais para ser lida em uma varredura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a causa mais comum de estimativas ruins no plano?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Estatísticas desatualizadas sobre a distribuição da tabela",
                            isCorrect: true,
                        },
                        {
                            text: "Falta de chave primária declarada na tabela consultada",
                            isCorrect: false,
                        },
                        {
                            text: "Excesso de colunas listadas na projeção da consulta",
                            isCorrect: false,
                        },
                        {
                            text: "Uso de CTE em vez de subconsulta dentro da consulta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um plano mostra Nested Loop com milhões de iterações numa consulta analítica. O que isso costuma indicar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O lado externo era grande e a estratégia não escala ali",
                            isCorrect: true,
                        },
                        {
                            text: "O banco preferiu memória a disco e acertou a escolha",
                            isCorrect: false,
                        },
                        {
                            text: "A junção foi resolvida por hash antes de percorrer tudo",
                            isCorrect: false,
                        },
                        {
                            text: "As duas entradas já estavam ordenadas pela chave usada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Índice em consulta analítica",
            blocks: [
                {
                    type: "text",
                    value: "# Índice é atalho, e atalho nem sempre compensa\n\nUm índice é uma estrutura auxiliar que permite achar linhas sem percorrer a tabela inteira. A intuição de que índice sempre acelera vem do mundo transacional, em que a consulta busca poucas linhas por chave. Em análise, essa intuição falha com frequência, e entender por quê é o que separa quem otimiza de quem chuta.\n\nO ponto é a seletividade: qual fração da tabela o filtro deixa passar. Se o filtro seleciona meio por cento das linhas, o índice ganha com folga. Se seleciona quarenta por cento, usar o índice significa mil idas e voltas entre a estrutura e a tabela, e ler a tabela inteira em sequência acaba sendo mais barato. O otimizador estima isso e escolhe, e é por isso que ele às vezes ignora o índice que você criou de propósito.\n\nHá ainda um custo do outro lado. Cada índice precisa ser atualizado a cada escrita, o que pesa em carga em lote, o padrão do mundo analítico. Índice demais transforma uma carga de dez minutos em uma de quarenta, e ninguém liga os dois fatos.",
                },
                {
                    type: "code",
                    value: "-- Indice composto: a ordem das colunas importa.\nCREATE INDEX idx_vendas_data_canal ON vendas (data_venda, canal);\n\n-- Filtro sobre a coluna crua usa o indice acima.\nSELECT sum(valor) FROM vendas\nWHERE data_venda >= DATE '2025-01-01' AND canal = 'app';\n\n-- Filtro com funcao na coluna NAO usa: crie indice de expressao.\nCREATE INDEX idx_vendas_ano ON vendas (extract(year FROM data_venda));\n\n-- Indice parcial: so o recorte que a analise consulta sempre.\nCREATE INDEX idx_vendas_recentes ON vendas (cliente_id)\nWHERE data_venda >= DATE '2025-01-01';\n\n-- BRIN: minusculo, otimo para tabela enorme e quase ordenada por tempo.\nCREATE INDEX idx_eventos_brin ON eventos USING brin (ocorrido_em);",
                },
                {
                    type: "text",
                    value: "## Quatro decisões que valem mais que criar índice\n\nA primeira é a ordem das colunas no índice composto. Um índice em data e canal serve para filtrar por data sozinha e para filtrar por data e canal juntos, mas não serve para filtrar só por canal. A regra prática é colocar primeiro a coluna que aparece em igualdade ou que corta mais, e pensar no índice como uma lista telefônica ordenada por sobrenome e depois por nome.\n\nA segunda é evitar função sobre a coluna filtrada. Comparar o ano extraído da data impede o uso do índice comum, porque o índice guarda a data, não o ano. Ou você filtra a coluna crua contra um intervalo, ou cria um índice de expressão que guarda exatamente aquela função.\n\nA terceira é o índice parcial, que indexa apenas o recorte relevante e fica muito menor. A quarta, específica de dado analítico, é o BRIN: em tabelas enormes cuja ordem física acompanha o tempo, ele guarda apenas os limites de cada faixa de blocos e ocupa uma fração do espaço de um índice comum. Em série temporal grande, ele costuma ser a melhor relação entre custo e benefício, e o particionamento por período resolve o resto.",
                },
                {
                    type: "table",
                    value: '[["Situação","Índice ajuda?","Motivo"],["Filtro que deixa passar 0,5 por cento","Sim, muito","Poucas buscas e nenhuma varredura"],["Filtro que deixa passar 40 por cento","Não","Ler tudo em sequência sai mais barato"],["Agregação da tabela inteira","Não","O banco precisa de todas as linhas"],["Junção pela chave da dimensão","Sim","Busca pontual do lado indexado"],["Função aplicada sobre a coluna","Só com índice de expressão","O índice guarda a coluna, não a função"],["Série temporal muito grande","BRIN costuma bastar","Ordem física acompanha o tempo"],["Carga em lote diária","Índice atrapalha","Cada escrita atualiza cada índice"]]',
                },
                {
                    type: "quote",
                    value: "Índice não é sempre bom, é bom quando o filtro é seletivo. Numa consulta que soma o ano inteiro, o melhor índice do mundo perde para uma varredura sequencial bem feita.",
                },
            ],
            questions: [
                {
                    statement: "O que determina se um índice ajuda uma consulta?",
                    difficulty: "facil",
                    options: [
                        { text: "A fração da tabela que o filtro deixa passar", isCorrect: true },
                        { text: "A quantidade de colunas listadas no SELECT", isCorrect: false },
                        { text: "O tamanho total ocupado pela tabela em disco", isCorrect: false },
                        { text: "A presença de agrupamento na mesma consulta", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que o banco às vezes prefere varredura sequencial mesmo existindo índice?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ler tudo em sequência sai mais barato quando o filtro é largo",
                            isCorrect: true,
                        },
                        {
                            text: "O índice só pode ser usado quando a tabela tem chave primária",
                            isCorrect: false,
                        },
                        {
                            text: "A varredura sequencial sempre consome menos memória que o índice",
                            isCorrect: false,
                        },
                        {
                            text: "O otimizador ignora índices em qualquer consulta com agregação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Um índice composto em (data_venda, canal) serve para qual filtro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Filtro por data sozinha ou por data e canal juntos",
                            isCorrect: true,
                        },
                        {
                            text: "Filtro por canal sozinho, sem mencionar nenhuma data",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer filtro que envolva ao menos uma das colunas",
                            isCorrect: false,
                        },
                        {
                            text: "Somente o filtro que use as duas colunas com igualdade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que filtrar pelo ano extraído da data impede o uso de um índice comum na coluna?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O índice guarda a data inteira, e não o ano calculado",
                            isCorrect: true,
                        },
                        {
                            text: "A função extract não pode aparecer dentro de um WHERE",
                            isCorrect: false,
                        },
                        {
                            text: "O índice só é usado quando o filtro compara com texto",
                            isCorrect: false,
                        },
                        {
                            text: "A coluna de data precisa ser convertida antes de indexar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a principal vantagem de um índice BRIN numa tabela de eventos muito grande?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ocupa pouquíssimo espaço quando a ordem segue o tempo",
                            isCorrect: true,
                        },
                        {
                            text: "Localiza uma linha específica mais rápido que o comum",
                            isCorrect: false,
                        },
                        {
                            text: "Dispensa a atualização do índice durante a carga em lote",
                            isCorrect: false,
                        },
                        {
                            text: "Funciona bem mesmo quando a tabela está desordenada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Materialização e o custo de manter",
            blocks: [
                {
                    type: "text",
                    value: "# Guardar o resultado em vez de recalcular\n\nQuando a mesma agregação pesada é consultada dezenas de vezes por dia, recalcular do zero a cada vez é desperdício. A alternativa é materializar: gravar o resultado e consultar o resultado. É a mesma ideia de cache, aplicada dentro do banco.\n\nO primeiro passo é distinguir view de view materializada. Uma view comum é apenas um nome para uma consulta: nada é gravado, e cada leitura executa tudo de novo. Ela serve para organizar e padronizar definições, não para acelerar. A view materializada, ao contrário, guarda o resultado em disco e responde instantaneamente, ao custo de ficar desatualizada assim que a base muda.\n\nAtualizar uma view materializada é uma operação explícita, com REFRESH. Na forma simples, ela bloqueia leituras durante a reconstrução; na forma concorrente, permite ler durante o processo, mas exige um índice único no resultado e costuma demorar mais. Escolher entre as duas é decidir entre indisponibilidade curta e custo maior.",
                },
                {
                    type: "code",
                    value: "-- View comum: apenas um nome para a consulta, nada e gravado.\nCREATE VIEW vw_vendas_mensais AS\nSELECT date_trunc('month', data_venda)::date AS mes,\n       canal,\n       sum(valor) AS faturamento\nFROM vendas\nGROUP BY 1, 2;\n\n-- View materializada: o resultado fica gravado em disco.\nCREATE MATERIALIZED VIEW mv_vendas_mensais AS\nSELECT date_trunc('month', data_venda)::date AS mes,\n       canal,\n       sum(valor)  AS faturamento,\n       count(*)    AS vendas\nFROM vendas\nGROUP BY 1, 2;\n\n-- Indice unico habilita a atualizacao concorrente.\nCREATE UNIQUE INDEX ON mv_vendas_mensais (mes, canal);\n\nREFRESH MATERIALIZED VIEW CONCURRENTLY mv_vendas_mensais;",
                },
                {
                    type: "text",
                    value: "## O que materializar, e o preço de cada escolha\n\nA regra prática é materializar o que é caro de calcular e consultado com frequência, e cujo grão é estável. Uma tabela de faturamento por mês e canal cabe bem: o cálculo varre milhões de linhas e a saída tem centenas. Já uma consulta exploratória que muda a cada pergunta não deve ser materializada, porque o esforço de manter não se paga.\n\nO preço é sempre o mesmo: frescor. Todo dado materializado está defasado desde o instante em que foi gravado, e a defasagem aceitável é decisão de negócio. Painel executivo diário tolera horas; alerta operacional não tolera minutos. Publicar junto do número a hora da última atualização é uma prática simples que evita muita discussão.\n\nExiste ainda o caminho fora do banco, que é a tabela agregada mantida por um processo agendado. Ele dá mais controle: você atualiza apenas o período que mudou, em vez de reconstruir tudo, e consegue manter histórico de execuções. É o desenho usado na maioria dos armazéns de dados, e o instrumento certo quando a análise virou rotina de produção.",
                },
                {
                    type: "table",
                    value: '[["Opção","Custo de leitura","Frescor","Quando usar"],["Consulta direta","Alto e repetido","Sempre atual","Exploração e pergunta nova"],["View comum","Igual à consulta direta","Sempre atual","Padronizar uma definição"],["View materializada","Muito baixo","Do último refresh","Agregação estável e consultada muito"],["Tabela agregada agendada","Muito baixo","Do último processamento","Rotina de produção com histórico"],["Refresh simples","Reconstrói tudo","Bloqueia a leitura","Janela de manutenção definida"],["Refresh concorrente","Reconstrói tudo","Permite ler durante","Exige índice único no resultado"]]',
                },
                {
                    type: "quote",
                    value: "Materializar troca custo de leitura por dívida de frescor. Sempre que você grava um número, passa a dever uma resposta: de quando ele é? Publique isso junto ou alguém vai supor errado.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença entre uma view comum e uma view materializada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A materializada guarda o resultado gravado em disco",
                            isCorrect: true,
                        },
                        {
                            text: "A materializada só aceita consultas sem agrupamento",
                            isCorrect: false,
                        },
                        {
                            text: "A comum grava o resultado e a outra recalcula sempre",
                            isCorrect: false,
                        },
                        {
                            text: "A comum aceita índice e a materializada não aceita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Uma view comum acelera uma consulta pesada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Não, porque a consulta é executada a cada leitura",
                            isCorrect: true,
                        },
                        {
                            text: "Sim, porque o banco guarda o plano já compilado",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, porque o resultado fica em cache na memória",
                            isCorrect: false,
                        },
                        {
                            text: "Não, mas ela cria um índice automático na origem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a atualização concorrente de uma view materializada exige?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um índice único sobre o resultado materializado",
                            isCorrect: true,
                        },
                        {
                            text: "Uma janela de manutenção sem nenhuma leitura ativa",
                            isCorrect: false,
                        },
                        {
                            text: "Uma chave estrangeira ligando o resultado à origem",
                            isCorrect: false,
                        },
                        {
                            text: "Uma tabela temporária criada antes da atualização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que tipo de resultado vale a pena materializar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Agregação cara, de grão estável e consultada sempre",
                            isCorrect: true,
                        },
                        {
                            text: "Consulta exploratória que muda a cada nova pergunta",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer consulta que envolva junção entre duas tabelas",
                            isCorrect: false,
                        },
                        {
                            text: "Leitura de uma tabela pequena usada por poucas pessoas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a vantagem de uma tabela agregada mantida por processo agendado sobre a view materializada?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Dá para atualizar só o período que mudou e guardar histórico",
                            isCorrect: true,
                        },
                        {
                            text: "Dispensa qualquer índice e ainda responde mais rápido que ela",
                            isCorrect: false,
                        },
                        {
                            text: "Garante que o dado esteja sempre atualizado até o último minuto",
                            isCorrect: false,
                        },
                        {
                            text: "Elimina a necessidade de reprocessar cargas que falharam antes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Amostragem e limite ao explorar dado grande",
            blocks: [
                {
                    type: "text",
                    value: "# Explorar não é processar tudo\n\nA primeira coisa que se faz com uma tabela desconhecida é olhar. E a primeira armadilha é olhar de um jeito que consome uma hora de máquina ou, pior, produz uma impressão errada sobre a base inteira. Exploração tem técnica, e ela começa por aceitar que você não precisa de todas as linhas para formar as primeiras perguntas.\n\nO reflexo mais comum é usar LIMIT. Ele é ótimo para inspecionar formato de coluna e valores típicos, e é péssimo como amostra. LIMIT devolve as primeiras linhas que o banco encontrar, o que costuma seguir a ordem física da tabela, que costuma seguir a ordem de inserção. Ou seja, você olha o passado antigo e conclui sobre o presente.\n\nPara amostrar de verdade existe TABLESAMPLE. A variante SYSTEM sorteia blocos inteiros, é muito rápida e enviesada quando linhas parecidas ficam juntas no disco. A variante BERNOULLI sorteia linha a linha, é mais fiel e mais lenta porque percorre a tabela. As duas aceitam uma semente, o que permite repetir exatamente a mesma amostra depois.",
                },
                {
                    type: "code",
                    value: "-- Espiar o formato: LIMIT serve para isso, e so para isso.\nSELECT * FROM vendas LIMIT 20;\n\n-- Amostra de verdade: 1 por cento das linhas, repetivel pela semente.\nSELECT canal, count(*), avg(valor)\nFROM vendas TABLESAMPLE BERNOULLI (1) REPEATABLE (42)\nGROUP BY canal;\n\n-- Amostra por hash da chave: estavel e coerente entre tabelas.\nSELECT *\nFROM clientes\nWHERE abs(hashtext(id::text)) % 100 < 5;   -- 5 por cento dos clientes\n\n-- Explorar com recorte de periodo curto custa pouco e ensina muito.\nSELECT canal, count(*), sum(valor)\nFROM vendas\nWHERE data_venda BETWEEN DATE '2025-06-01' AND DATE '2025-06-07'\nGROUP BY canal;",
                },
                {
                    type: "text",
                    value: "## A amostra que atravessa tabelas\n\nAmostrar tabelas separadamente cria um problema silencioso: se você pega um por cento das vendas e um por cento dos clientes, quase nenhuma venda da amostra terá o cliente correspondente na outra amostra, e qualquer junção vira vazio. A solução é amostrar pela chave de negócio, e não pelas linhas.\n\nA técnica é escolher uma fração dos clientes por hash do identificador e depois trazer todas as vendas daqueles clientes. Como o hash é determinístico, o mesmo conjunto de clientes é selecionado em qualquer tabela e em qualquer execução, e as junções continuam fazendo sentido. É assim que se monta um ambiente de desenvolvimento reduzido a partir de uma base enorme.\n\nDois cuidados fecham o assunto. Primeiro, amostra serve para explorar e para prototipar, nunca para publicar número final: totais de negócio precisam da base inteira. Segundo, evento raro desaparece em amostra pequena; para investigar fraude, erro ou comportamento incomum, filtre o recorte em vez de sortear, porque o que você procura é justamente o que a amostragem tende a descartar.",
                },
                {
                    type: "table",
                    value: '[["Técnica","O que faz","Bom para","Cuidado"],["LIMIT","Traz as primeiras linhas achadas","Ver formato e valores típicos","Não é amostra, segue ordem física"],["TABLESAMPLE SYSTEM","Sorteia blocos inteiros","Estimativa rápida em base enorme","Enviesa se linhas parecidas se agrupam"],["TABLESAMPLE BERNOULLI","Sorteia linha a linha","Amostra mais fiel da base","Percorre a tabela, custa mais"],["REPEATABLE","Fixa a semente do sorteio","Repetir a mesma amostra depois","Só vale dentro da mesma tabela"],["Hash da chave","Fração fixa por identificador","Amostra coerente entre tabelas","Exige chave estável e bem distribuída"],["Recorte de período curto","Filtra em vez de sortear","Investigar evento raro","Pode não representar o ano todo"]]',
                },
                {
                    type: "quote",
                    value: "LIMIT mostra o começo da tabela, não uma amostra dela. Concluir sobre a base inteira olhando as primeiras mil linhas é entrevistar a fila da porta e chamar isso de pesquisa.",
                },
            ],
            questions: [
                {
                    statement: "Por que LIMIT não serve como amostra de uma tabela?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele traz as primeiras linhas achadas, sem sorteio algum",
                            isCorrect: true,
                        },
                        {
                            text: "Ele descarta linhas que tenham qualquer coluna nula ali",
                            isCorrect: false,
                        },
                        {
                            text: "Ele só funciona quando a consulta tem ordenação definida",
                            isCorrect: false,
                        },
                        {
                            text: "Ele devolve linhas repetidas quando a tabela é muito grande",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre TABLESAMPLE SYSTEM e BERNOULLI?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O primeiro sorteia blocos e o segundo sorteia linhas",
                            isCorrect: true,
                        },
                        {
                            text: "O primeiro sorteia linhas e o segundo sorteia colunas",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro exige índice e o segundo funciona sem ele",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro é exato e o segundo devolve estimativa só",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve a palavra REPEATABLE numa amostragem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Fixar a semente e obter a mesma amostra de novo",
                            isCorrect: true,
                        },
                        {
                            text: "Repetir a consulta até atingir o tamanho pedido",
                            isCorrect: false,
                        },
                        {
                            text: "Permitir que a amostra inclua linhas duplicadas",
                            isCorrect: false,
                        },
                        {
                            text: "Executar a amostragem em várias tabelas de uma vez",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que amostrar vendas e clientes separadamente quebra as junções entre eles?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quase nenhuma venda sorteada tem o seu cliente sorteado",
                            isCorrect: true,
                        },
                        {
                            text: "As duas amostras usam sementes diferentes na mesma consulta",
                            isCorrect: false,
                        },
                        {
                            text: "O sorteio remove as colunas de chave usadas na condição",
                            isCorrect: false,
                        },
                        {
                            text: "A amostra de clientes fica sempre menor que a de vendas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe investiga um comportamento raro de fraude numa base enorme. Por que amostrar é uma má escolha?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O evento raro é justamente o que o sorteio tende a perder",
                            isCorrect: true,
                        },
                        {
                            text: "A amostragem duplica as linhas suspeitas do conjunto lido",
                            isCorrect: false,
                        },
                        {
                            text: "O sorteio não pode ser combinado com filtros no mesmo WHERE",
                            isCorrect: false,
                        },
                        {
                            text: "A amostra deixa de ser repetível quando o evento é escasso",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Qualidade de dado em SQL e o fechamento da trilha",
            blocks: [
                {
                    type: "text",
                    value: "# A consulta que você roda antes de acreditar no número\n\nToda análise séria começa checando a base, e essas checagens são consultas simples que você já sabe escrever. A diferença é o hábito: rodá-las antes de confiar, e não depois de alguém questionar o resultado numa reunião.\n\nSão cinco famílias de verificação. Duplicata: existe mais de uma linha para a chave que deveria ser única? Nulo inesperado: uma coluna que o negócio garante preenchida está vazia em alguma linha? Órfã: existe fato apontando para uma dimensão que não existe? Faixa: aparecem valores impossíveis, como quantidade negativa ou data no futuro? Frescor: qual é o registro mais recente, e ele é compatível com a periodicidade da carga?\n\nA sexta, que fecha o conjunto, é a conciliação: o total calculado por dois caminhos diferentes bate? Somar o fato direto e somar depois de todas as junções e agregações deve dar o mesmo número. Quando não dá, o módulo 3 costuma ter a explicação, e ela costuma se chamar junção que multiplica.",
                },
                {
                    type: "code",
                    value: "-- 1. Duplicata na chave que deveria ser unica.\nSELECT id, count(*) FROM vendas GROUP BY id HAVING count(*) > 1;\n\n-- 2. Nulo onde o negocio garante preenchimento.\nSELECT count(*) FILTER (WHERE cliente_id IS NULL) AS sem_cliente,\n       count(*) FILTER (WHERE valor IS NULL)      AS sem_valor,\n       count(*)                                   AS total\nFROM vendas;\n\n-- 3. Orfa: fato apontando para dimensao inexistente.\nSELECT count(*) AS vendas_sem_produto\nFROM vendas v\nWHERE NOT EXISTS (SELECT 1 FROM produtos p WHERE p.id = v.produto_id);\n\n-- 4. Faixa impossivel.\nSELECT count(*) FROM vendas\nWHERE quantidade <= 0 OR valor < 0 OR data_venda > current_date;\n\n-- 5. Frescor da carga.\nSELECT max(data_venda) AS ultimo_dia,\n       current_date - max(data_venda) AS dias_de_atraso\nFROM vendas;",
                },
                {
                    type: "text",
                    value: "## Transformar checagem em rotina\n\nUma checagem que você roda quando lembra não protege ninguém. O passo profissional é transformar cada uma dessas consultas em uma verificação que roda junto da carga e falha quando o resultado é diferente do esperado. A forma mais simples é escrever cada checagem para devolver zero linhas quando está tudo bem: qualquer linha devolvida é um alerta, sem precisar interpretar número.\n\nEsse mesmo desenho vale para checagens de negócio, e não só de estrutura. O faturamento de ontem não pode ser vinte por cento menor que a média das últimas quatro semanas sem que alguém saiba. A quantidade de eventos por hora não pode cair a zero de madrugada se o produto é usado à noite. Regra que descreve o comportamento normal vira consulta, e consulta vira alarme.\n\nA última recomendação é a mais simples e a mais ignorada: documente o recorte junto do número. Período, filtros aplicados, definição de cliente ativo, o que foi excluído e por quê. Número sem recorte não é reproduzível, e análise que ninguém consegue reproduzir tem exatamente o mesmo valor de um palpite bem apresentado.",
                },
                {
                    type: "table",
                    value: '[["Checagem","Consulta típica","O que revela"],["Duplicata","Agrupar pela chave e filtrar contagem maior que um","Carga repetida ou chave errada"],["Nulo inesperado","Contar linhas com a coluna vazia","Origem incompleta ou campo novo"],["Órfã","NOT EXISTS contra a dimensão","Dimensão desatualizada ou id inválido"],["Faixa impossível","Filtrar valores negativos ou futuros","Erro de digitação ou de conversão"],["Frescor","Comparar o máximo da data com hoje","Carga que falhou sem ninguém notar"],["Conciliação","Somar por dois caminhos e comparar","Junção que multiplicou ou perdeu linhas"]]',
                },
                {
                    type: "text",
                    value: "## O que você leva daqui\n\nVocê começou lendo tabelas e termina lendo planos de execução. No caminho passou por projeção e filtro, pelo cuidado com nulo, por junções que multiplicam e junções que apagam linhas em silêncio, por CTE que organiza o raciocínio, por funções de janela que agregam sem perder o detalhe, por agregação em vários níveis, séries temporais com buracos, coorte, percentil e, no fim, pelo custo de tudo isso em escala.\n\nO fio que amarra os sete módulos não é sintaxe, é desconfiança produtiva. Quase todo erro grave de análise em SQL não dá mensagem: ele devolve um número plausível. A soma que dobrou por causa de uma junção, o total que encolheu por causa de um filtro no lugar errado, a média que ignorou nulos, o mês que sumiu da série. Quem sabe onde esses erros moram passa a conferir antes de publicar, e essa é a habilidade que separa quem escreve consulta de quem responde pergunta.\n\nO próximo passo é praticar em base de verdade, com volume que force você a olhar o plano. Escreva a consulta, confira o recorte, compare dois caminhos, e só então apresente o número. Com essa base pronta, siga para a próxima trilha do seu roadmap.",
                },
                {
                    type: "quote",
                    value: "Erro de SQL raramente aparece como erro. Ele aparece como um número plausível, apresentado com confiança. Conferir antes de publicar é a parte do trabalho que ninguém vê e todo mundo depende.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual consulta identifica duplicatas numa coluna que deveria ser única?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Agrupar pela coluna e filtrar contagem maior que um",
                            isCorrect: true,
                        },
                        {
                            text: "Contar valores distintos e comparar com o total lido",
                            isCorrect: false,
                        },
                        {
                            text: "Ordenar pela coluna e olhar as primeiras linhas do topo",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar DISTINCT e verificar se o resultado mudou algo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como detectar fatos apontando para uma dimensão que não existe?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Contar as linhas do fato com NOT EXISTS na dimensão",
                            isCorrect: true,
                        },
                        {
                            text: "Juntar as duas tabelas e contar o resultado da junção",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar a quantidade de linhas das duas tabelas lidas",
                            isCorrect: false,
                        },
                        {
                            text: "Verificar se a dimensão tem chave primária declarada ali",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que uma checagem de frescor verifica numa base analítica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Se o registro mais recente é compatível com a carga",
                            isCorrect: true,
                        },
                        {
                            text: "Se a tabela foi reorganizada fisicamente nos últimos dias",
                            isCorrect: false,
                        },
                        {
                            text: "Se as estatísticas usadas pelo otimizador estão atuais",
                            isCorrect: false,
                        },
                        {
                            text: "Se as colunas de data usam o fuso horário correto ali",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que escrever cada checagem para devolver zero linhas quando está tudo bem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Qualquer linha devolvida já é um alerta, sem interpretar",
                            isCorrect: true,
                        },
                        {
                            text: "Consultas sem resultado rodam bem mais rápido no banco",
                            isCorrect: false,
                        },
                        {
                            text: "O banco só permite alarme automático em consulta vazia",
                            isCorrect: false,
                        },
                        {
                            text: "Assim a checagem dispensa qualquer filtro de período nela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma conciliação mostra que o total somado após as junções ficou maior que o total do fato. Qual é a causa mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Alguma junção multiplicou linhas por chave repetida",
                            isCorrect: true,
                        },
                        {
                            text: "Algum filtro no WHERE descartou linhas sem par válido",
                            isCorrect: false,
                        },
                        {
                            text: "A agregação ignorou nulos e reduziu o denominador ali",
                            isCorrect: false,
                        },
                        {
                            text: "O índice usado na leitura estava desatualizado na carga",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

export const MODULOS: Modulo[] = [
    MODULO_1,
    MODULO_2,
    MODULO_3,
    MODULO_4,
    MODULO_5,
    MODULO_6,
    MODULO_7,
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: LEVEL,
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log(
                "Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.",
            );
            return;
        }
        await db
            .update(trails)
            .set({ workloadHours: CARGA_HORARIA, description: DESCRICAO, trailLevel: LEVEL })
            .where(eq(trails.id, trilha.id));
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
    console.log(
        "Seed concluido: " +
            MODULOS.length +
            " modulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questoes.",
    );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
