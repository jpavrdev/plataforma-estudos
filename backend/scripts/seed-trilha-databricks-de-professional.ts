// Seed da trilha Databricks Certified Data Engineer Professional. Conteúdo autoral, escrito para
// cobrir as seções do guia oficial do exame. Idempotente e não destrutivo: se a
// trilha já tiver aulas, não faz nada.
//
// Rodar em dev:  node --env-file=.env scripts/seed-trilha-databricks-de-professional.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-databricks-de-professional.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "Databricks Certified Data Engineer Professional";
const CARGA_HORARIA = 28;
const DESCRICAO =
    "Trilha de preparação para a certificação Databricks Certified Data Engineer Professional: PySpark e SQL avançados, Structured Streaming com estado e marca de tempo, ingestão incremental de ponta fina, modelagem dimensional e compartilhamento de dados, custo e desempenho com Photon e clustering, segurança e conformidade, e monitoramento, depuração e promoção para produção.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    explanation: string;
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - PySpark e SQL para engenharia avançada",
    aulas: [
        {
            titulo: "Funções de janela para deduplicar com precisão",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber escolher, diante de uma tabela que recebeu a mesma chave de negócio várias vezes, entre três caminhos que parecem equivalentes e não são: `dropDuplicates`, agrupar com `groupBy` mais agregação, e marcar a linha vencedora com uma função de janela. A prova insiste nessa escolha porque só um dos três deixa você declarar qual linha sobrevive e, no mesmo passo, manter todas as outras colunas.\n\nO cenário é o de qualquer feed de mudanças que cai numa camada bronze: cada chave chega duas, três, dez vezes, com um carimbo de tempo e uma coluna de operação. Você quer a versão mais recente de cada chave, com as colunas todas, uma vez só, e quer que o resultado seja o mesmo se o job rodar de novo amanhã.",
                },
                {
                    type: "text",
                    value: "A cláusula `OVER` tem três partes, e a documentação de funções de janela define cada uma. A partição é uma ou mais expressões usadas para especificar um grupo de linhas que define o escopo sobre o qual a função opera. O `ORDER BY` especifica a ordem das linhas dentro de uma partição. O quadro de janela especifica um subconjunto deslizante de linhas dentro da partição sobre o qual a função agregada ou analítica opera.\n\nA regra que decide questão está no verbete de função de ranqueamento: se a especificação de janela for informada, ela precisa incluir uma cláusula `ORDER BY` e não pode incluir uma cláusula de quadro. Ou seja, `ROWS BETWEEN` e `RANGE BETWEEN` não fazem parte da sintaxe de `row_number`, `rank` e `dense_rank`, e a mesma página lista `WINDOW_FUNCTION_AND_FRAME_MISMATCH` entre as condições de erro comuns, sinal de que quadro e função de janela precisam combinar.\n\nVale avisar de uma inconsistência da própria página, porque ela confunde quem estuda pelos exemplos: dois deles aplicam quadro a função de ranqueamento sem erro, `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` em `DENSE_RANK` e `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` em `CUME_DIST`. Na prova, responda pela regra de sintaxe, que é o que está escrito na seção de sintaxe. No seu código, não escreva quadro em função de ranqueamento: você não ganha nada com ele e corre o risco do erro de combinação.",
                },
                {
                    type: "code",
                    value: 'from pyspark.sql import Window\nfrom pyspark.sql import functions as F\n\n# O desempate faz parte do contrato: ts_evento sozinho empata.\njanela = (\n    Window.partitionBy("id_cliente")\n    .orderBy(F.col("ts_evento").desc(), F.col("arquivo_origem").desc())\n)\n\nmais_recente = (\n    bronze\n    .withColumn("rn", F.row_number().over(janela))\n    .where(F.col("rn") == 1)\n    .drop("rn")\n)',
                },
                {
                    type: "text",
                    value: "`row_number` não recebe argumento e devolve `INTEGER`. A documentação dela traz duas frases que vale guardar. A primeira: a cláusula `OVER` da função de janela precisa incluir uma cláusula `ORDER BY` e, diferente de `rank` e `dense_rank`, `row_number` desempata. A segunda, logo abaixo: se a ordem não for única, o resultado é não determinístico.\n\nJuntas, as duas dizem o que fazer no seu código. Ordenar só por `ts_evento` não basta quando duas linhas da mesma chave carregam o mesmo carimbo: `row_number` vai dar 1 para alguma delas, e qual delas muda entre execuções. O desempate precisa ser uma coluna que realmente distingue as duas linhas, como o nome do arquivo de origem, o deslocamento dentro do arquivo ou o número de versão do registro na origem.",
                },
                {
                    type: "table",
                    value: '[["a","b","dense_rank","rank","row_number"],["A1","1","1","1","1"],["A1","1","1","1","2"],["A1","2","2","3","3"],["A2","3","1","1","1"]]',
                },
                {
                    type: "text",
                    value: "A tabela acima é o exemplo da própria documentação, com `PARTITION BY a ORDER BY b` sobre as linhas `(A1, 2)`, `(A1, 1)`, `(A2, 3)` e `(A1, 1)`. Olhe a partição `A1`: as duas linhas com `b` igual a 1 recebem `dense_rank` 1 e `rank` 1, as duas. Filtrar por `rank = 1` ali devolve duas linhas, e a sua deduplicação acabou de falhar. O `row_number` dá 1 e 2, então o filtro devolve exatamente uma. Repare também no `rank` da terceira linha: 3, não 2. `rank` deixa buraco depois do empate, `dense_rank` não.",
                },
                {
                    type: "text",
                    value: 'Agora o outro caminho. `groupBy("id_cliente").agg(F.max("ts_evento"))` responde qual é o carimbo mais recente de cada chave, e nada mais: o resultado tem duas colunas. Para recuperar o resto da linha você junta esse resultado de volta na tabela original, e voltam dois problemas. O primeiro é custo, porque a tabela é lida duas vezes e entra um embaralhamento a mais para a junção. O segundo é correção: se duas linhas da mesma chave empatarem no carimbo, a junção casa com as duas, e a deduplicação que prometia uma linha por chave entrega duas.\n\n`max_by(expr, ordExpr)` encurta o caminho, porque devolve o valor de uma expressão na linha onde outra expressão é máxima. Só que não resolve o empate: a documentação registra que, se várias linhas têm o mesmo valor máximo de `ordExpr`, o resultado é não determinístico. E para trazer doze colunas você precisaria de doze chamadas, ou de empacotar a linha inteira num struct antes.',
                },
                {
                    type: "table",
                    value: '[["Caminho","Escolhe qual linha sobrevive","Mantém as outras colunas","Leituras da tabela","No empate"],["`dropDuplicates([\\"id_cliente\\"])`","Não, a assinatura só recebe colunas","Sim, as da linha que sobrar","Uma","Linha sobrevivente fora do seu controle"],["`groupBy` com `max` e junção de volta","Sim, pelo critério da agregação","Só depois da junção","Duas","Duplica a chave empatada"],["`max_by(coluna, ts_evento)`","Sim, pelo máximo do ordenador","Uma coluna por chamada","Uma","Documentado como não determinístico"],["`row_number` com `ORDER BY` e desempate","Sim, pelo `ORDER BY` inteiro","Sim, todas, no mesmo passo","Uma","Resolvido se o desempate for único"]]',
                },
                {
                    type: "text",
                    value: "Vale abrir a assinatura de `dropDuplicates`, porque a prova usa essa função como distrator fácil. Ela é `dropDuplicates(subset: Optional[List[str]] = None)`, e a documentação descreve `subset` como a lista de colunas usadas na comparação de duplicata, tendo como padrão todas as colunas. Repare no que não existe ali: nenhum parâmetro de ordenação.\n\nEntão sem `subset` ela remove apenas linhas inteiras idênticas, o que num feed de mudanças quase nunca é o que você quer, porque duas versões da mesma chave diferem no carimbo e as duas passam ilesas. Com `subset`, ela reduz a uma linha por chave, mas quem escolhe a sobrevivente é o motor. Um `orderBy` antes da chamada não é contrato nenhum: nada na documentação promete que a ordem anterior decide quem fica.",
                },
                {
                    type: "code",
                    value: "-- Mesma deduplicação em SQL. O EXCEPT do star clause existe em\n-- Databricks Runtime 11.3 LTS e acima e evita listar as colunas na mão.\nSELECT * EXCEPT (rn)\nFROM (\n  SELECT\n    *,\n    row_number() OVER (\n      PARTITION BY id_cliente\n      ORDER BY ts_evento DESC, arquivo_origem DESC\n    ) AS rn\n  FROM bronze.clientes_cdc\n)\nWHERE rn = 1;",
                },
                {
                    type: "quote",
                    value: "A sintaxe de função de ranqueamento pede ORDER BY e não prevê cláusula de quadro. E se a ordem não for única, o resultado é não determinístico: desempate não é zelo, é requisito.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual função de janela garante exatamente uma linha por partição quando duas linhas empatam no critério de ordenação?",
                    difficulty: "facil",
                    explanation:
                        "A documentação de `row_number` diz que, diferente de `rank` e `dense_rank`, ela desempata, então cada linha da partição recebe um número distinto. `rank` e `dense_rank` repetem o número das linhas empatadas, e filtrar por 1 pode devolver duas linhas.",
                    options: [
                        {
                            text: "`row_number`, que desempata e numera 1, 2, 3 dentro da partição",
                            isCorrect: true,
                        },
                        {
                            text: "`rank`, que repete o número das linhas empatadas e deixa buraco",
                            isCorrect: false,
                        },
                        {
                            text: "`dense_rank`, que repete o número das empatadas sem deixar buraco",
                            isCorrect: false,
                        },
                        {
                            text: "`cume_dist`, que devolve a posição relativa acumulada na partição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um feed de mudanças grava várias versões de cada `id_cliente`, com `ts_evento` e mais doze colunas. Você precisa de uma linha por `id_cliente`, sempre a de `ts_evento` mais alto, com as doze colunas preservadas. Qual caminho entrega isso em uma leitura?",
                    difficulty: "medio",
                    explanation:
                        "Só a função de janela deixa declarar o critério de sobrevivência e manter as demais colunas no mesmo passo. `dropDuplicates` não tem parâmetro de ordenação na assinatura, e um `orderBy` anterior não promete quem fica; o `groupBy` com `max` devolve apenas duas colunas.",
                    options: [
                        {
                            text: "`row_number()` sobre janela particionada por `id_cliente` e ordenada por `ts_evento` decrescente, filtrando o valor 1",
                            isCorrect: true,
                        },
                        {
                            text: '`dropDuplicates(["id_cliente"])` aplicado depois de ordenar o DataFrame por `ts_evento` decrescente, o que fixa a linha mais nova',
                            isCorrect: false,
                        },
                        {
                            text: '`groupBy("id_cliente").agg(max("ts_evento"))`, que já devolve a linha completa da versão mais recente de cada chave',
                            isCorrect: false,
                        },
                        {
                            text: "`distinct()` sobre o DataFrame inteiro, que colapsa as versões repetidas de cada chave em uma única linha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Segundo a seção de sintaxe de funções de janela, o que a especificação de janela de uma função de ranqueamento deve e não deve conter?",
                    difficulty: "medio",
                    explanation:
                        "A sintaxe é explícita para função de ranqueamento: se a especificação de janela for informada, ela deve incluir uma cláusula `ORDER BY` e não deve incluir cláusula de quadro. O `PARTITION BY` aparece na sintaxe como opcional, entre colchetes, e não como exigência.",
                    options: [
                        {
                            text: "Deve conter `ORDER BY` e não deve conter cláusula de quadro de janela",
                            isCorrect: true,
                        },
                        {
                            text: "Deve conter cláusula de quadro de janela e não deve conter `ORDER BY`",
                            isCorrect: false,
                        },
                        {
                            text: "Deve conter `PARTITION BY` e `ORDER BY`, e o quadro de janela é opcional",
                            isCorrect: false,
                        },
                        {
                            text: "Deve conter apenas `PARTITION BY`, porque a ordem vem da ordem do arquivo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A deduplicação por `row_number` particiona por `id_pedido` e ordena só por `ts_evento DESC`. Em produção, a mesma entrada produz resultados diferentes entre execuções para alguns pedidos. Qual é a causa documentada?",
                    difficulty: "dificil",
                    explanation:
                        "A página de `row_number` diz que, se a ordem não for única, o resultado é não determinístico. Empate em `ts_evento` deixa a escolha com o motor. A correção é somar ao `ORDER BY` uma coluna que distinga as linhas, como arquivo de origem ou versão do registro.",
                    options: [
                        {
                            text: "O `ORDER BY` não é único nessas chaves, e a documentação registra o resultado como não determinístico",
                            isCorrect: true,
                        },
                        {
                            text: "O `row_number` reinicia a numeração quando a partição ultrapassa o tamanho de um lote do Arrow",
                            isCorrect: false,
                        },
                        {
                            text: "A ordenação decrescente de carimbo de tempo não é estável, e é preciso converter para `BIGINT` antes",
                            isCorrect: false,
                        },
                        {
                            text: "A janela sem cláusula de quadro cai num quadro padrão que varia com o número de partições do embaralhamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em lugar da janela, um colega propõe `SELECT id, max_by(status, ts_evento) AS status FROM eventos GROUP BY id`. Qual limitação a documentação de `max_by` registra para esse uso?",
                    difficulty: "dificil",
                    explanation:
                        "A documentação de `max_by` diz que, se várias linhas têm o mesmo valor máximo de `ordExpr`, o resultado é não determinístico. Por isso ela não substitui a janela com desempate, e ainda exigiria uma chamada por coluna que você quisesse trazer.",
                    options: [
                        {
                            text: "Com empate no valor máximo do ordenador, o resultado é documentado como não determinístico",
                            isCorrect: true,
                        },
                        {
                            text: "Só aceita ordenador numérico, então um carimbo de tempo precisa ser convertido antes da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Devolve sempre um `ARRAY`, então o valor precisa ser desempacotado depois com `element_at`",
                            isCorrect: false,
                        },
                        {
                            text: "Não pode aparecer em consulta com `GROUP BY`, apenas dentro de uma cláusula `OVER` com partição",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Arrays, structs e funções de ordem superior",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber transformar o conteúdo de um array sem tirar a linha do lugar. O problema aparece em todo evento que chega com uma lista dentro: um pedido com itens, uma sessão com cliques, uma fatura com lançamentos. Você precisa descartar os itens inválidos, converter o valor de cada item e somar o total, e o reflexo de quem vem do SQL de banco é desmontar com `explode`, filtrar, e remontar com `groupBy` mais `collect_list`.\n\nEsse reflexo custa um embaralhamento inteiro e abre dois buracos de correção: a linha cujo array é vazio ou nulo desaparece no `explode`, e a ordem original dos itens não volta no `collect_list`. As funções de ordem superior existem para você nunca desmontar a linha.",
                },
                {
                    type: "text",
                    value: "Antes do array, o struct. `struct` e `named_struct` constroem um; a diferença é que `named_struct( {name1, val1} [, ...] )` recebe um literal `STRING` nomeando cada campo, então `SELECT named_struct('a', 1, 'b', 2, 'c', 3)` devolve `{\"a\":1,\"b\":2,\"c\":3}`. Você lê campo com ponto, e expande todos os campos de um alias com `alias.*`.\n\nPara um `ARRAY<STRUCT>` existe `inline(input)`, que produz um conjunto de linhas montado a partir dos campos dos structs do array, nomeando as colunas de saída como os campos. Se o `input` for `NULL`, nenhuma linha é produzida. Já `explode(collection)` aceita `ARRAY` ou `MAP`: a coluna gerada a partir de um array chama `col`, e as de um mapa chamam `key` e `value`. Coleção `NULL` também não produz linha, e quem precisa preservar a linha usa `explode_outer`.",
                },
                {
                    type: "text",
                    value: "Detalhe de versão que a prova gosta: em Databricks Runtime 12.2 LTS e acima, a invocação de `explode` e de `inline` a partir da cláusula `LATERAL VIEW` ou da lista do `SELECT` está obsoleta, e a forma indicada é invocá-las como referência de tabela. Em Databricks Runtime 12.1 e anterior, duas funções geradoras na mesma lista de `SELECT` levantam `UNSUPPORTED_GENERATOR.MULTI_GENERATOR`.",
                },
                {
                    type: "code",
                    value: "-- Forma de referência de tabela, indicada em DBR 12.2 LTS e acima\nSELECT i.*, 'Spark SQL'\n  FROM inline(array(struct(1, 'a'), struct(2, 'b'))) AS i;\n-- 1  a  Spark SQL\n-- 2  b  Spark SQL\n\nSELECT elem, 'Spark' FROM explode(array(10, 20)) AS t(elem);\n-- 10  Spark\n-- 20  Spark\n\nSELECT num, val, 'Spark' FROM explode(map(1, 'a', 2, 'b')) AS t(num, val);\n-- 1  a  Spark\n-- 2  b  Spark",
                },
                {
                    type: "text",
                    value: "Agora o ponto central. A documentação de otimização diz que a Databricks oferece primitivas dedicadas para manipular arrays no Apache Spark SQL, e define função de ordem superior assim: ela recebe um array, implementa como esse array é processado e dita o resultado da computação, delegando a uma função lambda como processar cada item do array.\n\nO conjunto que a prova cobra é pequeno e vale saber de cabeça, inclusive a aridade de cada lambda:\n\n- `transform(expr, func)`: o lambda tem 1 ou 2 parâmetros, o primeiro é o elemento e o segundo, opcional, é o índice. Devolve um `ARRAY` do tipo do resultado do lambda.\n- `filter(expr, func)`: o lambda também aceita 1 ou 2 parâmetros, elemento e índice. O resultado é do mesmo tipo de `expr`.\n- `exists(expr, func)`: devolve `BOOLEAN`; o lambda opera sobre um parâmetro e deve resultar em booleano.\n- `forall(expr, func)`: devolve `BOOLEAN`; o lambda recebe um parâmetro e deve devolver `BOOLEAN`.\n- `aggregate(expr, start, merge [, finish])`: reduz o array a um valor, e é sinônimo de `reduce`.\n- `zip_with(expr1, expr2, func)`: lambda de dois parâmetros, devolve um `ARRAY` com o resultado.\n- `array_sort(array, func)`: o comparador recebe dois elementos e deve devolver -1, 0 ou 1.\n- em mapas, `transform_keys` e `transform_values` fazem o mesmo papel do `transform`.",
                },
                {
                    type: "table",
                    value: '[["Função","Devolve","Parâmetros do lambda","Detalhe que a prova cobra"],["`transform`","`ARRAY` do tipo do lambda","Elemento, e opcionalmente o índice","`transform(array(1, 2, 3), (x, i) -> x + i)` resulta `[1,3,5]`"],["`filter`","Mesmo tipo de `expr`","Elemento, e opcionalmente o índice","`filter(array(0, 2, 3), (x, i) -> x > i)` resulta `[2,3]`"],["`exists`","`BOOLEAN`","Só o elemento","Pode devolver `NULL` quando algum elemento é nulo"],["`forall`","`BOOLEAN`","Só o elemento","Devolve `false` com um falso certo, `NULL` sem nenhum falso"],["`aggregate`","Tipo do `finish`, ou do `start`","Acumulador e elemento, e o `finish` à parte","É sinônimo de `reduce`, e o `finish` é opcional"],["`zip_with`","`ARRAY` do tipo do lambda","Um elemento de cada array","O array menor recebe nulos no fim para igualar o comprimento"],["`array_sort`","Mesmo tipo de `array`","Dois elementos a comparar","Comparador que devolve `NULL` levanta `COMPARATOR_RETURNS_NULL`"]]',
                },
                {
                    type: "code",
                    value: "SELECT transform(array(1, 2, 3), x -> x + 1);                          -- [2,3,4]\nSELECT transform(array(1, 2, 3), (x, i) -> x + i);                     -- [1,3,5]\nSELECT filter(array(1, 2, 3), x -> x % 2 == 1);                        -- [1,3]\nSELECT filter(array(0, 2, 3), (x, i) -> x > i);                        -- [2,3]\nSELECT filter(array(0, null, 2, 3, null), x -> x IS NOT NULL);         -- [0,2,3]\nSELECT aggregate(array(1, 2, 3), 0, (acc, x) -> acc + x);              -- 6\nSELECT aggregate(array(1, 2, 3), 0, (acc, x) -> acc + x, acc -> acc * 10); -- 60\nSELECT zip_with(array(1, 2), array(3, 4), (x, y) -> x + y);            -- [4,6]\nSELECT array_sort(array('b', 'd', null, 'c', 'a'));                    -- [a,b,c,d,NULL]\nSELECT transform_values(map_from_arrays(array(1, 2), array(1, 2)), (k, v) -> k + v);\n-- {1 -> 2, 2 -> 4}",
                },
                {
                    type: "text",
                    value: "O `aggregate` é o que resolve o total sem sair da linha, e o quarto argumento é o que o pessoal esquece. O exemplo da documentação mostra os dois formatos: com três argumentos, `aggregate(array(1, 2, 3), 0, (acc, x) -> acc + x)` devolve 6; com o `finish`, `aggregate(array(1, 2, 3), 0, (acc, x) -> acc + x, acc -> acc * 10)` devolve 60. E o acumulador pode ser um struct, o que permite média em uma passada: partindo de `named_struct('sum', 0, 'cnt', 0)` e fechando com `acc -> acc.sum / acc.cnt`, o array `array(1, 2, 3, 4)` devolve 2.5.",
                },
                {
                    type: "text",
                    value: "Agora a armadilha de nulo, que é a questão mais cara desta aula. `exists` e `forall` vivem em lógica de três valores, e os resultados da documentação mostram cada caso:\n\n- `exists(array(1, 2, 3), x -> x % 2 == 0)` devolve `true`;\n- `exists(array(1, 2, 3), x -> x % 2 == 10)` devolve `false`;\n- `exists(array(1, NULL, 3), x -> x % 2 == 0)` devolve `NULL`;\n- `exists(array(0, NULL, 2, 3, NULL), x -> x IS NULL)` devolve `true`;\n- `forall(array(1, NULL, 3), x -> x % 2 == 0)` devolve `false`;\n- `forall(array(2, NULL, 8), x -> x % 2 == 0)` devolve `NULL`.\n\nA regra por trás: um resultado definitivo encerra a conta. `exists` fecha em `true` no primeiro elemento que satisfaz; se nenhum satisfaz mas algum não pôde ser avaliado, o melhor que ela pode dizer é `NULL`. `forall` fecha em `false` no primeiro elemento definitivamente falso, como na lista `1, NULL, 3`; se nenhum é falso e algum é desconhecido, como em `2, NULL, 8`, o resultado é `NULL`. Um predicado que compara explicitamente com nulo, como `x IS NULL`, nunca devolve nulo e por isso continua definitivo.\n\nO estrago prático é silencioso: `WHERE exists(...)` descarta a linha cujo resultado foi `NULL`, porque em `WHERE` nulo não é verdadeiro. A linha com item nulo some do seu relatório de qualidade sem nenhum erro no log. Quando você quer tratar nulo como ausência, filtre antes com `filter(itens, x -> x IS NOT NULL)`.",
                },
                {
                    type: "code",
                    value: 'from pyspark.sql import functions as F\n\npedidos = (\n    eventos\n    # filtra dentro do array, sem explode e sem shuffle\n    .withColumn("itens_validos", F.filter("itens", lambda it: it["quantidade"] > 0))\n    # transform remonta cada struct do array com a coluna convertida\n    .withColumn(\n        "itens_brl",\n        F.transform(\n            "itens_validos",\n            lambda it: F.struct(\n                it["sku"].alias("sku"),\n                it["quantidade"].alias("quantidade"),\n                (it["valor"] * F.col("cotacao")).alias("valor_brl"),\n            ),\n        ),\n    )\n    # aggregate soma na própria linha, sem collect_list de volta\n    .withColumn(\n        "total_brl",\n        F.aggregate("itens_brl", F.lit(0.0), lambda acc, it: acc + it["valor_brl"]),\n    )\n    # nulo tratado de propósito: filtra antes de perguntar\n    .withColumn(\n        "tem_sku_nulo",\n        F.exists(F.filter("itens", lambda it: it.isNotNull()), lambda it: it["sku"].isNull()),\n    )\n)',
                },
                {
                    type: "text",
                    value: "Compare com a versão desmontada. `explode` nos itens, `where` no filtro, `groupBy` na chave do pedido e `collect_list` para remontar: três estágios, um embaralhamento pela chave, e o resultado perde o pedido cujo array era vazio, perde a ordem dos itens e precisa de um `agg` extra para cada coluna de cabeçalho que você quiser carregar junto. A versão com `filter`, `transform` e `aggregate` é uma única projeção sobre a mesma linha, sem estágio novo. É por isso que a prova trata explode mais collect_list como resposta errada quando a pergunta é sobre transformar o conteúdo de um array.",
                },
                {
                    type: "quote",
                    value: "Função de ordem superior recebe o array e delega ao lambda como processar cada item. Enquanto a linha não é desmontada, não existe embaralhamento para remontá-la.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que `transform(array(1, 2, 3), (x, i) -> x + i)` devolve, segundo a documentação?",
                    difficulty: "facil",
                    explanation:
                        "O lambda de `transform` aceita 1 ou 2 parâmetros, e o segundo é o índice do elemento, começando em zero. Somando elemento e índice saem 1 mais 0, 2 mais 1 e 3 mais 2, ou seja `[1,3,5]`. Quem lê o segundo parâmetro como a constante 1 chega a `[2,3,4]`.",
                    options: [
                        {
                            text: "`[1,3,5]`, porque o segundo parâmetro do lambda é o índice do elemento",
                            isCorrect: true,
                        },
                        {
                            text: "`[2,3,4]`, porque o segundo parâmetro do lambda entra como a constante 1",
                            isCorrect: false,
                        },
                        {
                            text: "`[1,2,3]`, porque o índice começa em zero e o lambda devolve o elemento",
                            isCorrect: false,
                        },
                        {
                            text: "`[2,4,6]`, porque o lambda recebe o mesmo elemento nos dois parâmetros",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que `exists(array(1, NULL, 3), x -> x % 2 == 0)` devolve, segundo a documentação?",
                    difficulty: "medio",
                    explanation:
                        "Nenhum elemento conhecido satisfaz o predicado, mas o elemento nulo não pôde ser avaliado, então `exists` não consegue afirmar `false` e devolve `NULL`. Num `WHERE` esse `NULL` descarta a linha, o que faz o problema passar sem erro no log.",
                    options: [
                        {
                            text: "`NULL`, porque nenhum elemento é verdadeiro e um deles não pode ser avaliado",
                            isCorrect: true,
                        },
                        {
                            text: "`false`, porque nenhum dos elementos conhecidos satisfaz o predicado informado",
                            isCorrect: false,
                        },
                        {
                            text: "`true`, porque o elemento nulo conta como correspondência para o predicado",
                            isCorrect: false,
                        },
                        {
                            text: "Erro de execução, porque o lambda de `exists` não aceita elemento nulo no array",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "`forall(array(1, NULL, 3), x -> x % 2 == 0)` devolve `false`, mas `forall(array(2, NULL, 8), x -> x % 2 == 0)` devolve `NULL`. Por quê?",
                    difficulty: "medio",
                    explanation:
                        "Um elemento definitivamente falso já encerra o `forall` em `false`, como o 1 da primeira lista. Na segunda, nenhum elemento conhecido é falso e o nulo permanece desconhecido, então a resposta possível é `NULL`. Não há relação com o comprimento do array.",
                    options: [
                        {
                            text: "Um elemento falso com certeza já decide o resultado, e sem nenhum falso o nulo deixa a resposta indefinida",
                            isCorrect: true,
                        },
                        {
                            text: "`forall` avalia apenas o primeiro elemento não nulo do array, e o resultado dele passa a valer para a chamada",
                            isCorrect: false,
                        },
                        {
                            text: "`forall` devolve `NULL` quando o array tem comprimento par e `false` quando tem comprimento ímpar",
                            isCorrect: false,
                        },
                        {
                            text: "`forall` converte nulo em zero, e zero é par, então a diferença vem do sinal dos outros elementos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "`zip_with(array(1, 2, 3), array(10, 20), (x, y) -> x + y)` roda sem erro. O que a documentação diz que acontece com o terceiro par?",
                    difficulty: "medio",
                    explanation:
                        "A documentação de `zip_with` diz que, se um array for menor, nulos são acrescentados no fim para igualar o comprimento do maior antes de aplicar a função. O terceiro par fica `3` e `NULL`, e a soma resulta nulo. A função não trunca nem levanta erro.",
                    options: [
                        {
                            text: "Nulos são acrescentados no fim do array menor para igualar o comprimento antes do lambda",
                            isCorrect: true,
                        },
                        {
                            text: "O array maior é truncado no comprimento do menor, então o terceiro elemento é descartado",
                            isCorrect: false,
                        },
                        {
                            text: "O lambda recebe zero no lugar do elemento ausente, então o terceiro resultado vira `3`",
                            isCorrect: false,
                        },
                        {
                            text: "A função levanta erro de comprimento incompatível sempre que os arrays têm tamanhos diferentes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um comparador passado para `array_sort` devolve `NULL` para certo par de elementos. Qual é o comportamento documentado?",
                    difficulty: "dificil",
                    explanation:
                        "O comparador de `array_sort` deve devolver -1, 0 ou 1 conforme o primeiro elemento seja menor, igual ou maior que o segundo. Devolver nulo levanta `COMPARATOR_RETURNS_NULL`. Já o `array_sort` sem comparador é que coloca os elementos nulos no fim do array.",
                    options: [
                        {
                            text: "A chamada levanta `COMPARATOR_RETURNS_NULL`, porque o comparador deve devolver -1, 0 ou 1",
                            isCorrect: true,
                        },
                        {
                            text: "O par é mantido na ordem de entrada, e os outros elementos seguem a ordem do comparador",
                            isCorrect: false,
                        },
                        {
                            text: "Os elementos desse par vão para o fim do array, como no `array_sort` sem comparador",
                            isCorrect: false,
                        },
                        {
                            text: "O comparador é descartado e a ordenação cai no padrão crescente, com aviso no log do driver",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "UDF, pandas UDF e applyInPandas",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber responder, diante de uma regra de negócio que ninguém conseguiu escrever em SQL, qual das quatro saídas usar: função nativa com um pouco mais de criatividade, UDF Python, pandas UDF ou uma das APIs de função pandas como `applyInPandas`. A prova pergunta isso em forma de cenário, com o número de linhas e a natureza do cálculo no enunciado, e a resposta certa muda com esses dois detalhes.\n\nA documentação de UDF da Databricks dá o critério em uma frase: use UDF para lógica difícil de expressar com funções nativas do Apache Spark. Difícil, não chata. Se existe função nativa, ela ganha.",
                },
                {
                    type: "text",
                    value: "A ordem de eficiência aparece explícita na seção de considerações de desempenho. Funções nativas e UDFs SQL são as opções mais eficientes. UDFs Scala são em geral mais rápidas que UDFs Python. UDFs Python e pandas UDFs tendem a ser mais lentas que UDFs Scala porque precisam serializar o dado e movê-lo para fora da JVM, até o interpretador Python. E a frase que vale decorar: pandas UDFs são até 100 vezes mais rápidas que UDFs Python porque usam o Apache Arrow para reduzir o custo de serialização.\n\nEntenda o porquê, que é o que a prova testa por trás do número. A UDF Python recebe uma linha, devolve uma linha, e cada ida e volta atravessa a fronteira entre a JVM e o processo Python. A pandas UDF recebe um lote de linhas já no formato colunar do Arrow, roda uma operação vetorizada de pandas sobre o lote e devolve o lote. A travessia continua existindo, mas acontece uma vez por lote em lugar de uma vez por linha.",
                },
                {
                    type: "table",
                    value: '[["Opção","Unidade de trabalho","Travessia para o Python","Quando se justifica"],["Função nativa ou UDF SQL","Expressão sobre a coluna","Nenhuma","Sempre que a regra cabe em SQL, por ser a opção mais eficiente"],["UDF Python escalar","Uma linha por chamada","Uma por linha","Regra pontual, volume pequeno, ou chamada a biblioteca Python"],["pandas UDF Série para série","Um lote de linhas","Uma por lote do Arrow","Cálculo vetorizável em que a saída tem o tamanho da entrada"],["pandas UDF Série para escalar","Um grupo inteiro","Uma por grupo","Agregação própria, aceitando que o grupo cabe na memória"],["`applyInPandas`","Um grupo inteiro como `pandas.DataFrame`","Uma por grupo","Cálculo que precisa do grupo todo e muda o número de linhas"],["`mapInPandas`","Um iterador de lotes","Uma por lote","Saída de tamanho arbitrário sem precisar agrupar por chave"]]',
                },
                {
                    type: "code",
                    value: 'from pyspark.sql.types import LongType\n\ndef squared_typed(s):\n  return s * s\n\n# Sem o terceiro argumento, o tipo de retorno padrão é StringType.\nspark.udf.register("squaredWithPython", squared_typed, LongType())',
                },
                {
                    type: "text",
                    value: "Esse exemplo guarda a pegadinha mais barata da seção. A documentação diz que você pode opcionalmente definir o tipo de retorno da sua UDF, e que o tipo de retorno padrão é `StringType`. Quem registra sem o tipo recebe uma coluna de texto, a soma seguinte virá concatenada ou nula, e nada no log avisa.\n\nO decorador tem a mesma pegadinha e um parâmetro extra: em `sf.udf(f, returnType, useArrow)`, o `useArrow` é descrito como opcional, controlando se o Arrow será usado para otimizar a serialização, e quando ele é `None` vale a configuração `spark.sql.execution.pythonUDF.arrow.enabled` da sessão. A UDF Python otimizada por Arrow continua processando linha por linha; o que muda é o custo de transporte.\n\nMais um limite que cai em questão de cenário: a documentação de UDF Python registra que UDFs PySpark em compute serverless têm limite de memória de 1GB por UDF PySpark.",
                },
                {
                    type: "text",
                    value: "A pandas UDF, chamada também de UDF vetorizada, usa o Apache Arrow para transferir o dado e o pandas para trabalhar com ele. Existem três tipos, e cada um tem uma regra de comprimento que a prova cobra:\n\n- Série para série: a função Python deve aceitar uma pandas Series como entrada e devolver uma pandas Series do mesmo comprimento. O Spark divide o dado em lotes de linhas, chama a função em cada lote e concatena os resultados. É o tipo que se usa com `select` e `withColumn`.\n- Iterador de séries para iterador de séries: o comprimento total da saída no iterador deve ser igual ao comprimento total da entrada. É útil quando a UDF precisa inicializar algum estado antes, como carregar um modelo uma vez por tarefa.\n- Série para escalar: funciona como uma função de agregação do Spark, reduzindo uma ou mais séries a um único valor. A documentação é dura aqui: esse tipo de UDF não suporta agregação parcial e todo o dado de cada grupo é carregado em memória.\n\nO tamanho do lote é controlado por `spark.sql.execution.arrow.maxRecordsPerBatch`, que limita o número de linhas de cada lote de registros do Arrow para evitar erro de memória na JVM, e cujo valor padrão é 10.000 registros por lote.",
                },
                {
                    type: "code",
                    value: 'import pandas as pd\nfrom typing import Iterator\nfrom pyspark.sql.functions import pandas_udf\n\n# Série para série: saída com o mesmo comprimento da entrada\n@pandas_udf("double")\ndef valor_liquido(valor: pd.Series, imposto: pd.Series) -> pd.Series:\n    return valor * (1 - imposto)\n\n# Iterador de séries: o estado caro é criado uma vez por tarefa\n@pandas_udf("double")\ndef escore(lotes: Iterator[pd.Series]) -> Iterator[pd.Series]:\n    modelo = carrega_modelo()\n    for lote in lotes:\n        yield pd.Series(modelo.predict(lote))\n\n# Série para escalar: agrega, sem agregação parcial\n@pandas_udf("double")\ndef media_ponderada(valor: pd.Series, peso: pd.Series) -> float:\n    return (valor * peso).sum() / peso.sum()\n\ndf.select(valor_liquido("valor", "imposto"))\ndf.groupBy("id_loja").agg(media_ponderada("valor", "peso"))',
                },
                {
                    type: "text",
                    value: "As APIs de função pandas são outra categoria, e a diferença é que elas não são UDF: você passa a função direto para o DataFrame, não para uma coluna.\n\nO mapa agrupado, `groupBy().applyInPandas()`, recebe e devolve um `pandas.DataFrame`, e o schema de saída é um objeto `StructType` ou uma string que define o schema do DataFrame de saída. A documentação avisa duas coisas na sequência: todo o dado de um grupo é carregado em memória antes de a função ser aplicada, e isso pode levar a exceções de memória, especialmente se os tamanhos dos grupos forem assimétricos. E o detalhe que derruba a solução errada: a configuração `maxRecordsPerBatch` não se aplica aos grupos, então é você que precisa garantir que o dado agrupado cabe na memória.\n\nO mapa simples, `mapInPandas()`, recebe e devolve um iterador de `pandas.DataFrame`, e a saída pode ter comprimento arbitrário, diferente da pandas UDF do tipo série para série. O mapa cogrupado, `cogroup().applyInPandas()`, recebe dois `pandas.DataFrame` e devolve um; vale a mesma advertência de memória, porque todo o dado de um cogrupo é carregado em memória antes de a função ser aplicada.",
                },
                {
                    type: "code",
                    value: 'import pandas as pd\n\ndef subtract_mean(pdf: pd.DataFrame) -> pd.DataFrame:\n    v = pdf.v\n    return pdf.assign(v=v - v.mean())\n\n# Schema de saída obrigatório, como StructType ou string\ndf.groupby("id").applyInPandas(subtract_mean, schema="id long, v double").show()\n\ndef filter_func(iterator):\n    for pdf in iterator:\n        yield pdf[pdf.id == 1]\n\n# mapInPandas aceita saída de comprimento arbitrário\ndf.mapInPandas(filter_func, schema=df.schema).show()\n\ndef asof_join(l, r):\n    return pd.merge_asof(l, r, on="time", by="id")\n\ndf1.groupby("id").cogroup(df2.groupby("id")).applyInPandas(\n    asof_join, schema="time int, id int, v1 double, v2 string").show()',
                },
                {
                    type: "table",
                    value: '[["Característica","pandas UDF série para série","`applyInPandas`","`mapInPandas`"],["O que a função recebe","Uma `pandas.Series` por lote","Um `pandas.DataFrame` por grupo","Um iterador de `pandas.DataFrame`"],["Comprimento da saída","Igual ao da entrada","Livre, declarado pelo schema","Arbitrário"],["Schema de saída obrigatório","Não, vem do tipo de retorno","Sim, `StructType` ou string","Sim, no argumento `schema`"],["Respeita `maxRecordsPerBatch`","Sim, é o tamanho do lote","Não, a configuração não se aplica","Sim, nos lotes do iterador"],["Risco principal","Converter tipo errado no retorno","Memória com grupos assimétricos","Esquecer que não existe agrupamento"]]',
                },
                {
                    type: "text",
                    value: "Fechando com o roteiro de decisão que a prova premia. Primeiro, procure a função nativa, porque funções nativas e UDFs SQL são as opções mais eficientes e funções nativas do Apache Spark são otimizadas para processamento distribuído e oferecem melhor desempenho em escala. Se não houver, pergunte se o cálculo é vetorizável sobre um lote: se sim, pandas UDF. Se o cálculo precisa do grupo inteiro de uma vez e pode mudar o número de linhas, `applyInPandas`, e aí você assume a conta de memória do maior grupo. UDF Python escalar fica para o caso em que você precisa chamar uma biblioteca Python linha por linha e o volume é pequeno.",
                },
                {
                    type: "quote",
                    value: "Pandas UDFs são até 100 vezes mais rápidas que UDFs Python porque usam o Apache Arrow para reduzir o custo de serialização. Mas função nativa continua sendo a opção mais eficiente.",
                },
            ],
            questions: [
                {
                    statement:
                        "Segundo a documentação da Databricks, por que uma pandas UDF pode ser até 100 vezes mais rápida que uma UDF Python?",
                    difficulty: "facil",
                    explanation:
                        "A frase da documentação é direta: pandas UDFs são até 100 vezes mais rápidas que UDFs Python porque usam o Apache Arrow para reduzir o custo de serialização. A travessia para o Python continua existindo, só passa a ser por lote em lugar de por linha.",
                    options: [
                        {
                            text: "Ela usa o Apache Arrow, o que reduz o custo de serialização do dado",
                            isCorrect: true,
                        },
                        {
                            text: "Ela roda dentro da JVM, o que tira o interpretador Python do caminho",
                            isCorrect: false,
                        },
                        {
                            text: "Ela é compilada para bytecode Scala antes de ir para os executores",
                            isCorrect: false,
                        },
                        {
                            text: "Ela é reescrita pelo Catalyst como função nativa quando o tipo deixa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Uma UDF Python é registrada com `spark.udf.register("dobro", lambda x: x * 2)` e a coluna resultante aparece como texto em lugar de número. Qual é a causa?',
                    difficulty: "medio",
                    explanation:
                        "A documentação diz que definir o tipo de retorno é opcional e que o tipo de retorno padrão é `StringType`. Sem o terceiro argumento, a coluna sai como texto. Não há inferência pela primeira linha do DataFrame nem relação com o estado do Arrow na sessão.",
                    options: [
                        {
                            text: "O tipo de retorno padrão de uma UDF Python é `StringType`, e ele não foi informado",
                            isCorrect: true,
                        },
                        {
                            text: "A UDF Python infere o tipo de retorno pela primeira linha do DataFrame, que era de texto",
                            isCorrect: false,
                        },
                        {
                            text: "O registro em sessão sempre devolve texto, e só a UDF do Unity Catalog é tipada",
                            isCorrect: false,
                        },
                        {
                            text: "A multiplicação em Python devolve texto quando o Arrow está desligado na sessão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pipeline agrupa por cliente e aplica `applyInPandas`. Alguns clientes têm milhões de linhas e o job cai com erro de memória. Qual é a explicação que a documentação dá?",
                    difficulty: "medio",
                    explanation:
                        "A documentação de APIs de função pandas diz que todo o dado de um grupo é carregado em memória antes de a função ser aplicada, e que isso pode levar a exceções de memória, especialmente com tamanhos de grupo assimétricos. Não é o schema nem o tamanho do lote do Arrow.",
                    options: [
                        {
                            text: "Todo o dado de um grupo é carregado em memória antes de a função ser aplicada nele",
                            isCorrect: true,
                        },
                        {
                            text: "O valor de `spark.sql.execution.arrow.maxRecordsPerBatch` está baixo e fatia o grupo",
                            isCorrect: false,
                        },
                        {
                            text: "A função recebe um iterador de lotes e o iterador materializa o grupo inteiro antes",
                            isCorrect: false,
                        },
                        {
                            text: "O schema declarado em `applyInPandas` reserva memória por número de grupos do job",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para conter o consumo de memória de um `groupBy` com `applyInPandas`, um time baixa `spark.sql.execution.arrow.maxRecordsPerBatch` de 10000 para 500. Qual é o efeito sobre os grupos?",
                    difficulty: "dificil",
                    explanation:
                        "A documentação afirma que a configuração `maxRecordsPerBatch` não é aplicada aos grupos e que você deve garantir que o dado agrupado cabe na memória disponível. Baixar o valor não fatia o grupo: a função continua recebendo o grupo inteiro como um `pandas.DataFrame`.",
                    options: [
                        {
                            text: "Nenhum: a configuração não é aplicada aos grupos, que precisam caber na memória",
                            isCorrect: true,
                        },
                        {
                            text: "Cada grupo passa a ser entregue em pedaços de 500 linhas, uma chamada por pedaço",
                            isCorrect: false,
                        },
                        {
                            text: "O grupo é redistribuído em 500 partições antes da chamada, diluindo a memória",
                            isCorrect: false,
                        },
                        {
                            text: "A função passa a receber um iterador de `pandas.DataFrame` em vez de um único",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma transformação precisa, para cada chave, rodar um ajuste que depende de todas as linhas da chave ao mesmo tempo e devolver um número de linhas diferente do de entrada. Qual API atende?",
                    difficulty: "dificil",
                    explanation:
                        "`groupBy().applyInPandas()` recebe o grupo inteiro como `pandas.DataFrame` e devolve outro, com o schema declarado, então pode mudar o número de linhas. A pandas UDF série para série é descartada porque a documentação exige saída do mesmo comprimento da entrada.",
                    options: [
                        {
                            text: "`groupBy().applyInPandas()`, que recebe e devolve um `pandas.DataFrame` com schema declarado",
                            isCorrect: true,
                        },
                        {
                            text: "Uma pandas UDF do tipo série para série, que preserva o mesmo comprimento entre entrada e saída",
                            isCorrect: false,
                        },
                        {
                            text: "Uma pandas UDF do tipo série para escalar, que devolve um único valor por grupo agregado",
                            isCorrect: false,
                        },
                        {
                            text: "`mapInPandas()`, que recebe um iterador de lotes e não garante agrupamento por chave",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "SQL avançado: QUALIFY, recursão e coluna gerada",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber escrever três coisas que a prova cobra em SQL puro e que muita gente só conhece de nome: filtrar o resultado de uma função de janela sem subconsulta, percorrer uma hierarquia de profundidade desconhecida, e deixar o Delta Lake calcular e guardar uma coluna derivada por você. São três recursos com restrição de versão e com mensagem de erro própria, e é justamente a restrição que aparece na questão.",
                },
                {
                    type: "text",
                    value: "Comece pelo `QUALIFY`, que a documentação resume em três palavras: filtra os resultados de funções de janela. A sintaxe é `QUALIFY boolean_expression`, e vale em Databricks SQL e em Databricks Runtime 10.4 LTS e acima.\n\nDuas regras definem o uso. A primeira: é necessário que pelo menos uma função de janela esteja presente na lista do `SELECT` ou na própria cláusula `QUALIFY`. A segunda: as expressões especificadas na cláusula `QUALIFY` não podem conter funções de agregação. Quer dizer que `QUALIFY count(*) > 1` é inválido, mas `QUALIFY count(*) OVER (PARTITION BY id) > 1` é válido, porque a página de funções de janela lista função de agregação como uma das categorias de função de janela, ao lado de ranqueamento e analítica: com `OVER`, a contagem passa a ser função de janela.",
                },
                {
                    type: "code",
                    value: "CREATE TABLE dealer (id INT, city STRING, car_model STRING, quantity INT);\n\nINSERT INTO dealer VALUES\n    (100, 'Fremont', 'Honda Civic', 10),\n    (100, 'Fremont', 'Honda Accord', 15),\n    (100, 'Fremont', 'Honda CRV', 7),\n    (200, 'Dublin', 'Honda Civic', 20),\n    (200, 'Dublin', 'Honda Accord', 10),\n    (200, 'Dublin', 'Honda CRV', 3),\n    (300, 'San Jose', 'Honda Civic', 5),\n    (300, 'San Jose', 'Honda Accord', 8);\n\n-- QUALIFY sobre a função de janela que está na lista do SELECT\nSELECT\n    city,\n    car_model,\n    RANK() OVER (PARTITION BY car_model ORDER BY quantity) AS rank\n  FROM dealer\n  QUALIFY rank = 1;\n\n-- QUALIFY com a função de janela dentro da própria cláusula\nSELECT city, car_model\nFROM dealer\nQUALIFY RANK() OVER (PARTITION BY car_model ORDER BY quantity) = 1;",
                },
                {
                    type: "text",
                    value: "Repare na segunda consulta, que é o ganho real: ela devolve apenas `city` e `car_model`. Sem `QUALIFY`, para filtrar por uma função de janela você precisa projetar a coluna calculada, envolver tudo numa subconsulta, filtrar e depois descartar a coluna auxiliar. Com `QUALIFY` o cálculo vive na cláusula de filtro e nunca entra na saída.",
                },
                {
                    type: "table",
                    value: '[["Cláusula","Filtra o quê","Pode conter agregação","Pode conter função de janela"],["`WHERE`","Linhas antes do agrupamento","Não","Não"],["`HAVING`","Grupos depois do `GROUP BY`","Sim, é para isso que existe","Não"],["`QUALIFY`","Resultado de função de janela","Não, a documentação proíbe","Sim, e é obrigatório ter uma"]]',
                },
                {
                    type: "text",
                    value: "O segundo recurso é a CTE recursiva, que resolve hierarquia de profundidade desconhecida: organograma, lista de materiais, grafo de rotas, árvore de categorias. `RECURSIVE` e `MAX RECURSION LEVEL` valem em Databricks Runtime 17.0 e acima, e também em Databricks SQL.\n\nA forma é `WITH [ RECURSIVE ] view_identifier [ ( colunas ) ] [ MAX RECURSION LEVEL maxLevel ] AS ( base_case_query UNION ALL step_case_query )`. Quando `RECURSIVE` é especificado, a consulta de uma CTE pode referenciar a si mesma. O caso base é a semente da recursão e não deve referenciar o `view_identifier`; o caso de passo, para ser recursivo, precisa referenciar o `view_identifier`. A única forma documentada é com `UNION ALL`, e usar `UNION` levanta `UNION_NOT_SUPPORTED_IN_RECURSIVE_CTE`.",
                },
                {
                    type: "code",
                    value: "CREATE TABLE department (\n  id INTEGER, -- department ID\n  parent_department INTEGER, -- upper department ID\n  name string -- department name\n);\n\nINSERT INTO department VALUES\n  (0, NULL, 'ROOT'),\n  (1, 0, 'A'),\n  (2, 1, 'B'),\n  (3, 2, 'C'),\n  (4, 2, 'D'),\n  (5, 0, 'E'),\n  (6, 4, 'F'),\n  (7, 5, 'G');\n\nWITH RECURSIVE subdepartment AS (\n  SELECT name as root_name, * FROM department WHERE name = 'A'\n  UNION ALL\n  SELECT sd.root_name, d.* FROM department AS d, subdepartment AS sd\n  WHERE d.parent_department = sd.id\n)\nSELECT * FROM subdepartment ORDER BY name;\n-- A 1 0 A / A 2 1 B / A 3 2 C / A 4 2 D / A 6 4 F",
                },
                {
                    type: "text",
                    value: "Agora os freios, que é de onde saem as questões. O `maxLevel` deve ser um literal `INTEGER` maior que zero e o valor padrão é 100. Se o limite é excedido, `RECURSION_LEVEL_LIMIT_EXCEEDED` é levantado. O tamanho total do conjunto de resultados é limitado a 1.000.000 de linhas; em Databricks Runtime 17.2 e acima, um `LIMIT` na consulta que dirige a CTE pode sobrepor esse limite, e `LIMIT ALL` remove o limite por completo. Se a CTE não for recursiva, a cláusula de limite é ignorada.\n\nDois detalhes finos valem guardar. O `LIMIT` consegue encerrar uma recursão que seria infinita, mas colocar um `ORDER BY` antes dele volta a levantar `RECURSION_LEVEL_LIMIT_EXCEEDED`, porque a ordenação impede o encerramento antecipado. E CTEs recursivas não são suportadas em comandos `UPDATE`, `DELETE` e `MERGE`.\n\nContra ciclo no grafo, o padrão da documentação é carregar o caminho num array e barrar o que já passou, com `ARRAY_CONTAINS`. O exemplo de rotas faz exatamente isso, acumulando o caminho com `CONCAT(d.path, ARRAY(r.destination))` e exigindo `NOT ARRAY_CONTAINS(d.path, r.destination)` na junção.",
                },
                {
                    type: "code",
                    value: "-- Limite por CTE, com o erro que a prova cita\nWITH RECURSIVE t(n) MAX RECURSION LEVEL 10 AS (\n  VALUES(1)\n  UNION ALL\n  SELECT n+1 FROM t WHERE n < 100\n)\nSELECT * FROM t;\n-- Error: RECURSION_LEVEL_LIMIT_EXCEEDED\n\n-- Proteção contra ciclo com ARRAY_CONTAINS\nCREATE TEMPORARY VIEW routes(origin, destination) AS VALUES\n  ('New York', 'Washington'),\n  ('New York', 'Boston'),\n  ('Boston', 'New York'),\n  ('Washington', 'Boston'),\n  ('Washington', 'Raleigh');\n\nWITH RECURSIVE destinations_from_new_york AS (\n  SELECT 'New York' AS destination, ARRAY('New York') AS path, 0 AS length\n  UNION ALL\n  SELECT r.destination, CONCAT(d.path, ARRAY(r.destination)), d.length + 1\n    FROM routes AS r\n    JOIN destinations_from_new_york AS d\n      ON d.destination = r.origin AND NOT ARRAY_CONTAINS(d.path, r.destination)\n)\nSELECT * FROM destinations_from_new_york;",
                },
                {
                    type: "text",
                    value: "O terceiro recurso é a coluna gerada do Delta Lake, que calcula e guarda automaticamente valores a partir de uma expressão definida por você sobre outras colunas da tabela. Ela é física: fica gravada nos arquivos de dados, como uma coluna comum.\n\nA restrição que a prova cobra está na expressão. Uma expressão de geração pode usar qualquer função SQL determinística que sempre devolva o mesmo resultado para a mesma entrada. Não são suportadas funções definidas pelo usuário, funções de agregação, funções de janela e funções que devolvem várias linhas. Aritmética, `CONCAT`, `SUBSTRING`, `CAST` e `YEAR` entram sem problema.\n\nNa escrita você não precisa fornecer valor, porque o Delta Lake calcula. Se fornecer, a documentação é explícita: os valores devem satisfazer `(<value> <=> <generation expression>) IS TRUE` ou a escrita falha. Habilitar coluna gerada eleva o protocolo de escrita da tabela, o que pode afetar a compatibilidade com clientes Delta Lake externos. E uma coluna gerada não pode referenciar coluna com máscara, porque o valor derivado poderia revelar o dado protegido.",
                },
                {
                    type: "code",
                    value: "CREATE OR REPLACE TABLE eventos (\n  id_evento BIGINT,\n  dado STRING,\n  tipo_evento STRING,\n  ts_evento TIMESTAMP,\n  data_evento DATE GENERATED ALWAYS AS (CAST(ts_evento AS DATE))\n)\nPARTITIONED BY (tipo_evento, data_evento);\n\n-- Sem filtro explícito de partição: o Delta Lake deriva um\nSELECT * FROM eventos\nWHERE ts_evento >= '2026-10-01 00:00:00' AND ts_evento < '2026-10-02 00:00:00';\n\n-- EXPLAIN mostra se o filtro de partição foi gerado\nEXPLAIN SELECT * FROM eventos WHERE ts_evento > '2026-10-01';",
                },
                {
                    type: "text",
                    value: "O motivo de particionar por coluna gerada é a geração automática de filtro de partição: quando a tabela é particionada por uma coluna gerada e você consulta a coluna de base, o Delta Lake deriva o filtro de partição quando possível. Os padrões suportados são o `CAST` de uma coluna `TIMESTAMP` para `DATE`, o `YEAR` dessa coluna, o particionamento por `YEAR`, depois `MONTH`, depois `DAY`, depois `HOUR`, o `SUBSTRING` de uma coluna `STRING` e um conjunto limitado de padrões de `DATE_FORMAT`. Para checar se o filtro foi de fato gerado, use `EXPLAIN`.\n\nVale distinguir da coluna de identidade, que é um tipo de coluna gerada que atribui valores `BIGINT` únicos na inserção. Declarar uma desabilita transações concorrentes na tabela, não se pode particionar por ela, não se pode usar `ALTER TABLE` para adicionar, substituir ou alterar uma, e não se pode atualizar o valor de identidade de um registro existente.",
                },
                {
                    type: "table",
                    value: '[["Elemento","Permitido em expressão de coluna gerada","Por quê"],["`CAST(ts_evento AS DATE)`","Sim","Função SQL determinística sobre outra coluna"],["`base_price * 1.1`","Sim","Aritmética determinística é citada como exemplo"],["`CONCAT`, `SUBSTRING`, `YEAR`","Sim","Funções de texto e de data determinísticas"],["Função definida pelo usuário","Não","A documentação lista UDF como não suportada"],["Função de agregação","Não","Depende de outras linhas, não só da linha atual"],["Função de janela","Não","Também depende de um conjunto de linhas"],["Coluna com máscara","Não","O valor derivado poderia revelar o dado protegido"]]',
                },
                {
                    type: "quote",
                    value: "QUALIFY exige pelo menos uma função de janela e proíbe agregação. CTE recursiva aceita só UNION ALL e para em 100 níveis por padrão. Coluna gerada só aceita função SQL determinística.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que a cláusula `QUALIFY` filtra, e qual é o seu requisito obrigatório?",
                    difficulty: "facil",
                    explanation:
                        "A documentação define `QUALIFY` como a cláusula que filtra os resultados de funções de janela, e exige que pelo menos uma função de janela esteja presente na lista do `SELECT` ou na própria cláusula. Agregação dentro do `QUALIFY` é proibida pela documentação.",
                    options: [
                        {
                            text: "Filtra resultados de função de janela, e exige uma função de janela no `SELECT` ou nela",
                            isCorrect: true,
                        },
                        {
                            text: "Filtra grupos depois do `GROUP BY`, e exige uma função de agregação na própria cláusula",
                            isCorrect: false,
                        },
                        {
                            text: "Filtra linhas antes do agrupamento, e exige que a coluna filtrada esteja no `SELECT`",
                            isCorrect: false,
                        },
                        {
                            text: "Filtra partições do arquivo lido, e exige coluna de particionamento na comparação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual destas cláusulas é inválida em Databricks SQL, segundo as regras documentadas do `QUALIFY`?",
                    difficulty: "medio",
                    explanation:
                        "A documentação diz que as expressões especificadas na cláusula `QUALIFY` não podem conter funções de agregação. `count(*)` solto é agregação; `count(*) OVER (...)` é função de janela e portanto é aceito, assim como `row_number` e `rank` com `OVER`.",
                    options: [
                        {
                            text: "`QUALIFY count(*) > 1`, porque `count(*)` sem `OVER` é função de agregação",
                            isCorrect: true,
                        },
                        {
                            text: "`QUALIFY count(*) OVER (PARTITION BY id) > 1`, porque é função de janela",
                            isCorrect: false,
                        },
                        {
                            text: "`QUALIFY row_number() OVER (ORDER BY ts) = 1`, porque numera cada linha",
                            isCorrect: false,
                        },
                        {
                            text: "`QUALIFY rank = 1`, com `RANK() OVER (...)` projetado na lista do `SELECT`",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma CTE recursiva escrita com `UNION` em lugar de `UNION ALL` é submetida. O que acontece, e qual é o limite de nível padrão da recursão?",
                    difficulty: "medio",
                    explanation:
                        "A única forma documentada do corpo recursivo é `base_case_query UNION ALL step_case_query`, e `UNION` levanta `UNION_NOT_SUPPORTED_IN_RECURSIVE_CTE`. O `maxLevel` deve ser um literal inteiro maior que zero e o valor padrão é 100, não 1.000 nem o número de linhas.",
                    options: [
                        {
                            text: "Levanta `UNION_NOT_SUPPORTED_IN_RECURSIVE_CTE`, e o limite padrão é 100 níveis",
                            isCorrect: true,
                        },
                        {
                            text: "Levanta `RECURSION_LEVEL_LIMIT_EXCEEDED`, e o limite padrão é 1.000 níveis",
                            isCorrect: false,
                        },
                        {
                            text: "Roda com deduplicação a cada passo, e o limite padrão é 1.000.000 de níveis",
                            isCorrect: false,
                        },
                        {
                            text: "Roda e ignora a palavra `RECURSIVE`, e o limite padrão passa a ser de apenas 10 níveis",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um `INSERT` fornece explicitamente valor para uma coluna declarada com `GENERATED ALWAYS AS`. Qual condição a documentação exige para que a escrita não falhe?",
                    difficulty: "dificil",
                    explanation:
                        "A documentação diz que, se você fornecer valores, eles devem satisfazer `(<value> <=> <generation expression>) IS TRUE` ou a escrita falha. O operador de igualdade segura a nulo faz nulo igual a nulo valer verdadeiro, mas o valor fornecido ainda tem que bater com a expressão.",
                    options: [
                        {
                            text: "O valor fornecido precisa satisfazer `(<value> <=> <generation expression>) IS TRUE`",
                            isCorrect: true,
                        },
                        {
                            text: "O valor é aceito e sobrepõe a expressão de geração a partir dessa versão da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "O valor é descartado em silêncio e a expressão de geração é recalculada na escrita",
                            isCorrect: false,
                        },
                        {
                            text: "O valor precisa ser nulo, porque coluna gerada não aceita valor em comando de escrita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma tabela Delta é particionada por `data_evento DATE GENERATED ALWAYS AS (CAST(ts_evento AS DATE))`. Uma consulta filtra apenas `ts_evento`, sem citar `data_evento`. O que a documentação diz que acontece?",
                    difficulty: "dificil",
                    explanation:
                        "Quando a tabela é particionada por uma coluna gerada e a consulta filtra a coluna de base, o Delta Lake deriva o filtro de partição quando possível, e `CAST` de `TIMESTAMP` para `DATE` é um dos padrões suportados. Para confirmar se o filtro saiu, a documentação indica `EXPLAIN`.",
                    options: [
                        {
                            text: "O Delta Lake deriva o filtro de partição quando possível, e `EXPLAIN` confirma isso",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta varre todas as partições, porque filtro derivado exige citar a coluna gerada",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta falha com erro de partição ausente, porque a coluna gerada é obrigatória",
                            isCorrect: false,
                        },
                        {
                            text: "O Delta Lake recalcula a coluna gerada em tempo de consulta, sem usar partição alguma",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Testar transformação: função pura e teste unitário",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber transformar um notebook de trezentas linhas, que lê uma tabela, faz dez passos e grava outra tabela, em algo que você consegue testar em segundos sem tocar em dado de produção. O obstáculo não é a biblioteca de teste: é que a transformação está presa ao notebook. Enquanto o passo de negócio e a leitura da tabela moram na mesma célula, não existe nada para chamar num teste.\n\nA Databricks recomenda, para notebooks Python e R, armazenar as funções e seus testes unitários fora dos notebooks. E dá o critério de qualidade: para obter os melhores resultados de teste unitário, uma função deve devolver um único resultado previsível e ser de um único tipo de dado. Fecha com a regra de prudência que a prova também cobra: em geral é boa prática não rodar testes unitários contra funções que trabalham com dado em produção.",
                },
                {
                    type: "text",
                    value: "A forma que atende às três recomendações é a função pura de DataFrame: ela recebe um ou mais DataFrames e parâmetros, devolve um DataFrame, e não faz mais nada. Em particular, uma função pura de transformação não contém `spark.read`, não contém `write`, não contém `display`, não cita nome de tabela e não chama `current_timestamp` nem gerador aleatório sem receber o valor como parâmetro. Essa última é a que mais escapa: uma transformação que chama o relógio por conta própria devolve resultado diferente em cada execução, e deixa de ser previsível.\n\nQuem fica com a leitura e a escrita é o notebook, que vira uma casca de três linhas: lê, chama a função, grava. A casca não é testada por teste unitário, e está certo que não seja.",
                },
                {
                    type: "code",
                    value: '# transformacoes.py, versionado ao lado do notebook em Databricks Git folders\nfrom pyspark.sql import DataFrame, Window\nfrom pyspark.sql import functions as F\n\n\ndef ultima_versao_por_chave(df: DataFrame, chave: str, ordem: list) -> DataFrame:\n    """Uma linha por chave, a vencedora do ORDER BY. Entra DataFrame, sai DataFrame."""\n    janela = Window.partitionBy(chave).orderBy(*[F.col(c).desc() for c in ordem])\n    return (\n        df.withColumn("_rn", F.row_number().over(janela))\n        .where(F.col("_rn") == 1)\n        .drop("_rn")\n    )\n\n\ndef marca_processamento(df: DataFrame, carimbo: str) -> DataFrame:\n    """O carimbo entra por parâmetro, nunca de current_timestamp aqui dentro."""\n    return df.withColumn("ts_processamento", F.lit(carimbo).cast("timestamp"))',
                },
                {
                    type: "code",
                    value: '# O notebook fica sendo a casca: leitura, chamada, escrita.\nfrom datetime import datetime, timezone\nfrom transformacoes import ultima_versao_por_chave, marca_processamento\n\nbronze = spark.read.table("catalogo.bronze.clientes_cdc")\nagora = datetime.now(timezone.utc).isoformat()\n\nprata = marca_processamento(\n    ultima_versao_por_chave(bronze, "id_cliente", ["ts_evento", "arquivo_origem"]),\n    agora,\n)\n\nprata.write.mode("overwrite").saveAsTable("catalogo.prata.clientes")',
                },
                {
                    type: "text",
                    value: "Com a função isolada, o teste fica trivial, e o guia de teste do PySpark mostra três formas de montá-lo. A primeira é usar os utilitários de asserção de forma autônoma: para casos simples de validação, utilitários de teste do PySpark como `assertDataFrameEqual` e `assertSchemaEqual` podem ser usados em contexto autônomo, inclusive numa sessão de notebook. A segunda é `unittest`, criando e encerrando a sessão Spark com o decorador `classmethod` em `setUpClass` e `tearDownClass`. A terceira, e a que combina com o fluxo recomendado pela Databricks, é a fixture de `pytest`: usar uma fixture permite compartilhar uma sessão Spark entre os testes, encerrando-a quando os testes terminam.\n\nDuas asserções cobrem quase tudo. `assertDataFrameEqual(df1, df2)` passa quando os DataFrames são idênticos, e aceita tolerância relativa: no exemplo da documentação, `assertDataFrameEqual(df1, df2, rtol=1e-1)` passa para valores que diferem na terceira casa decimal, o que resolve a comparação de ponto flutuante. `assertSchemaEqual(s1, s2)` compara apenas dois schemas, e serve para o teste que só quer garantir contrato de saída.",
                },
                {
                    type: "code",
                    value: '# test_transformacoes.py\nimport pytest\nfrom pyspark.sql import SparkSession\nfrom pyspark.testing.utils import assertDataFrameEqual\n\nfrom transformacoes import ultima_versao_por_chave\n\n\n@pytest.fixture\ndef spark_fixture():\n    spark = SparkSession.builder.appName("Testando a trilha prata").getOrCreate()\n    yield spark\n\n\ndef test_mantem_a_versao_mais_recente(spark_fixture):\n    entrada = spark_fixture.createDataFrame(\n        [\n            (1, "2026-10-01", "a.json", "ativo"),\n            (1, "2026-10-02", "b.json", "cancelado"),\n            (2, "2026-10-01", "a.json", "ativo"),\n        ],\n        "id_cliente int, ts_evento string, arquivo_origem string, status string",\n    )\n\n    saida = ultima_versao_por_chave(entrada, "id_cliente", ["ts_evento", "arquivo_origem"])\n\n    esperado = spark_fixture.createDataFrame(\n        [\n            (1, "2026-10-02", "b.json", "cancelado"),\n            (2, "2026-10-01", "a.json", "ativo"),\n        ],\n        "id_cliente int, ts_evento string, arquivo_origem string, status string",\n    )\n\n    assertDataFrameEqual(saida, esperado)\n\n\ndef test_desempata_pelo_arquivo_quando_o_carimbo_empata(spark_fixture):\n    entrada = spark_fixture.createDataFrame(\n        [\n            (3, "2026-10-02", "a.json", "ativo"),\n            (3, "2026-10-02", "b.json", "cancelado"),\n        ],\n        "id_cliente int, ts_evento string, arquivo_origem string, status string",\n    )\n\n    saida = ultima_versao_por_chave(entrada, "id_cliente", ["ts_evento", "arquivo_origem"])\n\n    assert saida.count() == 1\n    assert saida.first()["arquivo_origem"] == "b.json"',
                },
                {
                    type: "table",
                    value: '[["Aspecto","Notebook monolítico","Função pura mais teste"],["O que a unidade testável recebe","Nada, a lógica vive na célula","DataFrame e parâmetros"],["De onde vem o dado do teste","Da tabela real, lida na célula","De `createDataFrame` com linhas escritas à mão"],["Tempo para rodar","O do job inteiro","O de montar dois DataFrames pequenos"],["Determinismo","Quebra com `current_timestamp` na célula","Garantido porque o carimbo entra por parâmetro"],["Onde o código mora","Dentro do notebook","Em arquivo `.py` fora do notebook, como recomendado"],["Risco de tocar produção","Alto, a célula aponta para a tabela real","Nenhum, a função não conhece nome de tabela"]]',
                },
                {
                    type: "text",
                    value: 'Para rodar, o `pytest` procura por padrão arquivos `.py` cujo nome começa com `test_`, ou termina com `_test`, e dentro deles pega todas as funções cujo nome começa com `test`. Se você preferir disparar a partir de um notebook, a documentação mostra instalar com `%pip install pytest` e chamar `pytest.main([".", "-v", "-p", "no:cacheprovider"])`, com duas linhas de apoio: `sys.dont_write_bytecode = True`, para evitar escrever arquivos pyc em sistema de arquivos somente leitura, e um `assert retcode == 0` ao final, para fazer a execução da célula falhar quando houver qualquer falha de teste.\n\nO que vale testar, em ordem de retorno: o contrato de schema da saída, porque é o que quebra o consumidor; o caminho do nulo, porque é o que a amostra de desenvolvimento nunca tem; o desempate da deduplicação, porque é a regra que ninguém documenta; e a idempotência, chamando a função duas vezes sobre a mesma entrada e comparando as duas saídas com `assertDataFrameEqual`.',
                },
                {
                    type: "code",
                    value: '# Dispara a suíte de dentro de um notebook, sem sair do workspace\n%pip install pytest\n\nimport pytest\nimport sys\n\n# Evita escrever arquivos pyc em sistema de arquivos somente leitura\nsys.dont_write_bytecode = True\n\nretcode = pytest.main([".", "-v", "-p", "no:cacheprovider"])\n\n# Faz a célula falhar se algum teste falhou\nassert retcode == 0, "a suíte de testes falhou, veja o log"',
                },
                {
                    type: "quote",
                    value: "Para notebooks Python, armazene as funções e os testes fora do notebook. Uma função boa de testar devolve um único resultado previsível, e DataFrame que entra e DataFrame que sai é exatamente isso.",
                },
            ],
            questions: [
                {
                    statement:
                        "Segundo a documentação de teste unitário da Databricks, onde devem morar as funções e os testes unitários de um notebook Python?",
                    difficulty: "facil",
                    explanation:
                        "A recomendação é literal: para notebooks Python e R, a Databricks recomenda armazenar as funções e seus testes unitários fora dos notebooks. A regra de manter função num notebook e teste em outro é a indicada para Scala, não para Python.",
                    options: [
                        {
                            text: "Fora dos notebooks, em arquivos próprios versionados junto do código",
                            isCorrect: true,
                        },
                        {
                            text: "Dentro do mesmo notebook, em células separadas por comentário de seção",
                            isCorrect: false,
                        },
                        {
                            text: "A função em um notebook e os testes em outro notebook do mesmo diretório",
                            isCorrect: false,
                        },
                        {
                            text: "Dentro de um job de produção, para que o teste rode com o dado real",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma função de transformação lê a tabela bronze, deduplica, chama `current_timestamp` para marcar o processamento e grava a tabela prata. Por que ela é ruim de testar unitariamente?",
                    difficulty: "medio",
                    explanation:
                        "A documentação pede função que devolva um único resultado previsível, e avisa para não rodar teste unitário contra função que trabalha com dado de produção. Leitura e escrita amarram a função à tabela real, e o relógio interno tira a previsibilidade do resultado.",
                    options: [
                        {
                            text: "Ela depende de tabela real e do relógio, então não devolve um resultado previsível",
                            isCorrect: true,
                        },
                        {
                            text: "Ela usa função de janela, e janela só pode ser avaliada sobre um DataFrame de streaming",
                            isCorrect: false,
                        },
                        {
                            text: "Ela mistura SQL e PySpark, e o `pytest` só consegue coletar funções escritas em SQL",
                            isCorrect: false,
                        },
                        {
                            text: "Ela devolve um DataFrame, e `assertDataFrameEqual` compara apenas tipos primitivos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual assinatura corresponde a uma transformação pura, pronta para teste unitário?",
                    difficulty: "medio",
                    explanation:
                        "A função pura recebe o DataFrame e os parâmetros de que precisa e devolve um DataFrame, sem ler nem gravar tabela e sem consultar o relógio por conta própria. As demais assinaturas carregam leitura, escrita ou nome de tabela, que é o que amarra o teste ao ambiente.",
                    options: [
                        {
                            text: "`def dedup(df: DataFrame, chave: str, ordem: list) -> DataFrame`",
                            isCorrect: true,
                        },
                        {
                            text: "`def dedup(tabela: str, chave: str, ordem: list) -> DataFrame`",
                            isCorrect: false,
                        },
                        {
                            text: "`def dedup(df: DataFrame, chave: str, destino: str) -> None`",
                            isCorrect: false,
                        },
                        {
                            text: "`def dedup(spark: SparkSession, origem: str, destino: str) -> None`",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um teste compara duas colunas de ponto flutuante calculadas de formas diferentes e falha por diferença na terceira casa decimal. Qual é o ajuste que a documentação do PySpark mostra?",
                    difficulty: "medio",
                    explanation:
                        "O guia de teste do PySpark mostra `assertDataFrameEqual(df1, df2, rtol=1e-1)` passando para DataFrames aproximadamente iguais por tolerância relativa. Arredondar na transformação mudaria a regra de negócio só para o teste passar, o que resolve o sintoma e esconde o problema.",
                    options: [
                        {
                            text: "Passar uma tolerância relativa com o parâmetro `rtol` na asserção",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar por `assertSchemaEqual`, que ignora os valores das colunas",
                            isCorrect: false,
                        },
                        {
                            text: "Arredondar as duas colunas dentro da própria função de transformação",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar os DataFrames com `collect` e o operador de igualdade do Python",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time quer rodar a suíte de testes de dentro de um notebook do workspace. Qual chamada a documentação mostra, e por que o argumento extra está ali?",
                    difficulty: "dificil",
                    explanation:
                        'A documentação mostra `pytest.main([".", "-v", "-p", "no:cacheprovider"])` depois de `%pip install pytest`. O argumento desliga o plugin de cache, que tentaria escrever um diretório de cache; `-x` e `--collect-only` não têm relação com esse problema de escrita.',
                    options: [
                        {
                            text: '`pytest.main([".", "-v", "-p", "no:cacheprovider"])`, que desliga o cache em disco',
                            isCorrect: true,
                        },
                        {
                            text: '`pytest.main([".", "-v", "-x"])`, que interrompe a suíte logo na primeira falha vista',
                            isCorrect: false,
                        },
                        {
                            text: '`pytest.main([".", "--collect-only"])`, que lista os testes sem executar nenhum',
                            isCorrect: false,
                        },
                        {
                            text: '`pytest.main(["--no-header", "-q"])`, que reduz a saída escrita no driver',
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Structured Streaming com estado",
    aulas: [
        {
            titulo: "Checkpoint, gatilho e modo de saída",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você decide três coisas antes de ligar uma consulta de streaming em produção: onde vive o checkpoint, qual gatilho usar e qual modo de saída o destino aceita. Na prova as três aparecem juntas, em questões que descrevem uma consulta que não volta depois de um deploy ou um `writeStream` que falha no primeiro micro-lote.",
                },
                {
                    type: "text",
                    value: "O diretório de checkpoint não é log de depuração, é o que define a identidade da consulta. Ele guarda quatro coisas:\n\n- **Offsets**: os offsets de origem processados em cada micro-lote, o que permite retomar exatamente de onde parou sem reprocessar.\n- **Commits**: o registro de quais micro-lotes já foram confirmados no destino, que é o que sustenta a semântica exactly-once.\n- **Estado**: em consulta com estado (agregação, junção entre streams, deduplicação e operador customizado como `transformWithState`), os metadados do operador, o schema do estado e o conteúdo do state store.\n- **Metadados**: o ID único que identifica a consulta. As configurações ficam gravadas junto do log de offsets.\n\nApagar os arquivos do diretório ou apontar para um local novo faz a próxima execução começar do zero.",
                },
                {
                    type: "code",
                    value: '(df.writeStream\n  .option("checkpointLocation", "/Volumes/main/ops/checkpoints/vendas_bronze")\n  .trigger(availableNow=True)\n  .toTable("main.vendas.bronze"))',
                },
                {
                    type: "text",
                    value: "Daí vem a regra que a prova cobra direto: cada consulta precisa de um local de checkpoint diferente, e duas consultas nunca devem compartilhar o mesmo local. O checkpoint guarda o ID da consulta, o log de offsets e o log de commits como se houvesse um único dono, então compartilhar o diretório é uma condição que a documentação proíbe, não uma otimização de armazenamento. Alguns destinos, como a saída do `display()` em notebook e o sink `memory`, geram um local temporário se você omitir a opção. Esse local temporário não assegura tolerância a falhas nem consistência de dados, e pode nem ser limpo direito, então a recomendação é sempre declarar o `checkpointLocation`.",
                },
                {
                    type: "quote",
                    value: "Cada consulta precisa de um local de checkpoint diferente. Duas consultas nunca devem compartilhar o mesmo local.",
                },
                {
                    type: "text",
                    value: "A segunda metade da história é o que acontece quando o código muda e o checkpoint continua o mesmo. A documentação separa dois rótulos que vale decorar: **permitido** quer dizer que a mudança pode ser feita, embora a semântica do efeito dependa da consulta; **não permitido** quer dizer que a consulta reiniciada provavelmente falha com erro imprevisível.",
                },
                {
                    type: "table",
                    value: '[["Mudança no código", "Com o mesmo local de checkpoint"], ["Adicionar ou remover filtro", "Permitido"], ["Mudar intervalo de gatilho ou limite de taxa", "Permitido"], ["Projeção com o mesmo schema de saída", "Permitido"], ["Trocar o tópico Kafka assinado ou o caminho do Auto Loader", "Não permitido, resultado imprevisível"], ["Mudar o número ou o tipo das origens de entrada", "Exige checkpoint novo por padrão"], ["Mudar a chave de agrupamento ou os agregados da agregação", "Não permitido"], ["Mudar a coluna de deduplicação", "Não permitido"], ["Mudar o tipo da junção entre streams, de inner para outer", "Não permitido"], ["Mudar o schema do estado ou o tipo de timeout do operador arbitrário", "Não permitido"], ["Mudar a lógica dentro de `mapGroupsWithState`", "Permitido, com semântica dependente do código"], ["Mudar o diretório de saída de um sink de arquivo", "Não permitido"], ["Mudar o tópico de saída de um sink Kafka", "Permitido"], ["Trocar sink de arquivo por sink Kafka", "Permitido"], ["Trocar sink Kafka por sink de arquivo", "Não permitido"]]',
                },
                {
                    type: "text",
                    value: "Duas saídas existem para as restrições mais incômodas dessa lista. Para schema de estado, você pode codificar o estado como bytes em um formato que tolere migração, por exemplo Avro, e aí trocar o schema entre reinícios sem perder o estado binário. Para origens, a partir do Databricks Runtime 18.2 existe a evolução de origem: por padrão o Structured Streaming identifica as origens pela posição no plano, `0`, `1`, `2`, e qualquer mudança de número ou de ordem quebra a compatibilidade do checkpoint. Com `spark.sql.streaming.queryEvolution.enableSourceEvolution` em `true`, toda origem passa a exigir um nome estável declarado com `.name()` antes de `.load()` ou `.table()`, e aí reordenar, adicionar e remover origem fica seguro. O nome aceita só letras, dígitos e sublinhado, é único na consulta e é permanente: origem removida não volta com o mesmo nome. Ligar a evolução de origem exige um checkpoint novo e não dá para desfazer naquele checkpoint.",
                },
                {
                    type: "text",
                    value: "O gatilho controla a frequência com que a consulta procura dado novo. Reparar na coluna da direita é o que resolve a questão de prova.",
                },
                {
                    type: "table",
                    value: '[["Gatilho", "Sintaxe em Python", "Para que serve"], ["Não especificado (padrão)", "nenhuma chamada a `trigger`", "Streaming de uso geral, latência de 3 a 5 segundos, equivalente a `processingTime` com intervalo de 0 ms"], ["Tempo de processamento", "`.trigger(processingTime=\'10 seconds\')`", "Equilibrar custo e latência, evitando que o sistema procure dado novo com frequência demais"], ["Available Now", "`.trigger(availableNow=True)`", "Lote incremental agendado: consome o que estiver disponível no momento do disparo e encerra"], ["Modo tempo real", "`.trigger(realTime=\'5 minutes\')`", "Carga operacional de latência abaixo de um segundo; o valor informado é a duração do micro-lote"], ["Continuous", "`.trigger(continuous=\'1 second\')`", "Não suportado pela Databricks, segue experimental no Spark OSS; a orientação é usar o modo tempo real"]]',
                },
                {
                    type: "text",
                    value: "Sobre nomes antigos: `Trigger.Once` está obsoleto desde o Databricks Runtime 11.3 LTS, e a orientação é usar `Trigger.AvailableNow` para toda carga de lote incremental. O `AvailableNow` consome todos os registros disponíveis como lote incremental, com tamanho configurável por opções como `maxBytesPerTrigger`, e as opções de dimensionamento variam conforme a origem. O suporte a esse gatilho tem versão mínima por origem: fonte de arquivo a partir do 9.1 LTS, Delta Lake, Auto Loader e Apache Kafka a partir do 10.4 LTS, Kinesis a partir do 13.1. Em compute serverless só `Trigger.AvailableNow()` e `Trigger.Once()` são suportados, e a Databricks recomenda o primeiro. Não declarar gatilho nenhum coloca a consulta em `processingTime` com intervalo `0`, que procura dado novo a cada poucos milissegundos e pode gerar volume alto de chamadas de API no armazenamento de objetos, com cobrança inesperada do provedor de nuvem.",
                },
                {
                    type: "text",
                    value: "Trocar o gatilho entre execuções é permitido com o mesmo checkpoint, mas a transição não é instantânea. Se a consulta parou com um micro-lote em andamento, aquele lote precisa terminar com a configuração anterior antes de a nova valer, então é normal ver um lote rodando com o ajuste antigo. Saindo de intervalo de tempo para `AvailableNow`, um micro-lote pode processar como lote incremental antes de todos os registros disponíveis saírem. No sentido inverso, o processamento pode continuar com os registros que estavam disponíveis no último disparo do `AvailableNow`. E a pegadinha que a prova usa: trocar o gatilho não recupera consulta que falhou. O lote malsucedido precisa terminar, porque o Structured Streaming exige micro-lote idempotente. A saída é aumentar a capacidade de compute, por exemplo subir o tamanho dos nós de trabalho, e, em caso raro, reiniciar o stream com checkpoint novo.",
                },
                {
                    type: "code",
                    value: '# lote incremental agendado: consome o disponível e encerra\n(df.writeStream\n  .option("checkpointLocation", ckpt)\n  .trigger(availableNow=True)\n  .toTable("main.vendas.bronze"))\n\n# intervalo fixo de micro-lote, com modo de saída explícito\n(agregado.writeStream\n  .option("checkpointLocation", ckpt_agg)\n  .trigger(processingTime="10 seconds")\n  .outputMode("complete")\n  .toTable("main.vendas.por_janela"))',
                },
                {
                    type: "text",
                    value: "Falta o terceiro ajuste. O modo de saída decide quais registros cada operador emite em um disparo, e só stream com estado que faz agregação exige configuração de modo. Junção entre streams suporta apenas `append`. Deduplicação não é afetada pelo modo. Os operadores arbitrários `mapGroupsWithState` e `flatMapGroupsWithState` emitem com lógica própria, então o modo da consulta não muda o comportamento deles. Em stream sem estado, os três modos se comportam igual.",
                },
                {
                    type: "table",
                    value: '[["Modo", "O que o operador emite no disparo", "Restrição que a prova cobra"], ["`append` (padrão)", "Só as linhas que não vão mudar em disparo futuro; operador com estado usa a marca de tempo para saber quando isso acontece", "Atrasa a escrita em pelo menos o valor do limite da marca de tempo"], ["`update`", "Todas as linhas que mudaram no disparo, mesmo que possam mudar de novo depois", "O sink Delta Lake, que sustenta toda tabela gerenciada do Unity Catalog, não aceita este modo"], ["`complete`", "Todas as linhas que o operador já produziu desde o início", "Funciona só com agregação de streaming, e não descarta estado"]]',
                },
                {
                    type: "quote",
                    value: "O sink Delta Lake aceita append e complete, e não aceita update. Para comportamento parecido com o update em tabela Delta, use MERGE dentro do foreachBatch.",
                },
                {
                    type: "text",
                    value: "A escolha entre `append` e `update` é de semântica de aplicação. Se o consumidor a jusante precisa agir uma vez por registro escrito, como um serviço de notificação, `append` garante que cada registro entra uma vez só, enquanto `update` escreveria a cada mudança do estado. Se o consumidor precisa de resultado fresco, como painel de agregado em tempo real ou modelo que lê feature na hora, `update` mantém o destino o mais atualizado possível. O custo entra na conta: `update` gera uma escrita por disparo por valor agregado, e isso pesa quando o registro muda muitas vezes antes de o limite da marca de tempo passar. O `complete` tem aplicação, porém escala mal, e a Databricks recomenda visão materializada para obter a garantia semântica dele com processamento incremental.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que o diretório de checkpoint de uma consulta de Structured Streaming guarda?",
                    difficulty: "facil",
                    explanation:
                        "O checkpoint reúne offsets, commits, estado e metadados, incluindo o ID da consulta. A opção dos offsets isolados engana porque é mesmo nos offsets que está a retomada, mas o estado dos operadores também é checkpointado, e não vive só em memória.",
                    options: [
                        {
                            text: "Offsets, commits, estado do operador e metadados com o ID único da consulta.",
                            isCorrect: true,
                        },
                        {
                            text: "Só os offsets da origem, porque o estado de janela vive na memória do executor.",
                            isCorrect: false,
                        },
                        {
                            text: "Só o estado do operador, porque os offsets ficam no log de transações do Delta.",
                            isCorrect: false,
                        },
                        {
                            text: "O plano físico da consulta, para que o reinício não precise replanejar o lote.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta agrega por `loja` e roda há meses com o mesmo local de checkpoint. O time quer passar a agregar por `loja` e `canal`. O que a documentação exige?",
                    difficulty: "medio",
                    explanation:
                        "Mudar o número ou o tipo das chaves de agrupamento altera o schema do estado, e isso não é permitido no mesmo checkpoint. A opção da projeção engana porque projeção com o mesmo schema de saída é permitida, só que trocar chave de agregação não é projeção.",
                    options: [
                        {
                            text: "Iniciar a consulta em um local de checkpoint novo, porque mudar a chave de agrupamento muda o schema do estado.",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas publicar o código novo, porque mudança de projeção com o mesmo schema de saída é sempre permitida no reinício.",
                            isCorrect: false,
                        },
                        {
                            text: "Apagar somente o log de commits do checkpoint, porque é ele que guarda o schema do estado da agregação.",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o modo de saída para `complete`, porque assim o operador reconstrói todo o estado a cada disparo.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job diário lê um diretório grande com `.trigger(once=True)` e grava em tabela Delta. Qual é a orientação atual da documentação?",
                    difficulty: "medio",
                    explanation:
                        "`Trigger.Once` está obsoleto desde o Databricks Runtime 11.3 LTS e a recomendação é `Trigger.AvailableNow` para lote incremental. A opção de remover o gatilho engana porque sem gatilho a consulta vira `processingTime` com intervalo zero e nunca encerra.",
                    options: [
                        {
                            text: "Trocar por `.trigger(availableNow=True)`, o gatilho recomendado para carga de lote incremental.",
                            isCorrect: true,
                        },
                        {
                            text: "Manter `.trigger(once=True)`, que hoje é o único gatilho suportado em compute serverless.",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar por `.trigger(continuous='1 second')`, que é o substituto suportado do gatilho obsoleto.",
                            isCorrect: false,
                        },
                        {
                            text: "Remover a chamada a `trigger`, porque sem gatilho a consulta processa o disponível e encerra.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Uma agregação com janela tenta gravar em tabela gerenciada do Unity Catalog com `outputMode("update")` e a consulta falha. Qual é a correção alinhada à documentação?',
                    difficulty: "dificil",
                    explanation:
                        "O sink Delta Lake, base de toda tabela gerenciada do Unity Catalog, aceita append e complete e não aceita update, e a saída documentada é MERGE dentro do foreachBatch. Trocar para complete engana porque funciona, mas reescreve o destino inteiro e nunca descarta estado.",
                    options: [
                        {
                            text: "Escrever com `foreachBatch` e `MERGE INTO`, porque o sink Delta Lake não aceita o modo `update`.",
                            isCorrect: true,
                        },
                        {
                            text: "Passar o modo para `complete` e manter o sink, porque é o único modo válido com janela de tempo.",
                            isCorrect: false,
                        },
                        {
                            text: "Remover a marca de tempo da consulta, porque o modo `update` só vale para operador sem estado.",
                            isCorrect: false,
                        },
                        {
                            text: "Gravar em tabela externa em Parquet, porque somente tabela gerenciada recusa o modo `update`.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time precisa gravar a mesma origem em duas tabelas Delta e decide criar duas consultas de streaming. Como configurar o checkpoint?",
                    difficulty: "dificil",
                    explanation:
                        "A regra é literal na documentação: cada consulta precisa de um local próprio e duas consultas nunca devem compartilhar o mesmo. A opção do checkpoint temporário engana porque ele existe para display e sink memory, só que não assegura tolerância a falhas.",
                    options: [
                        {
                            text: "Um local de checkpoint próprio para cada consulta, porque duas consultas nunca compartilham o mesmo local.",
                            isCorrect: true,
                        },
                        {
                            text: "Um local único para as duas consultas, porque o checkpoint separa os commits por sink e por origem de dados.",
                            isCorrect: false,
                        },
                        {
                            text: "Um local único, desde que as duas usem o mesmo gatilho `availableNow` e o mesmo modo de saída `append`.",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum local declarado, porque o sink Delta cria um checkpoint temporário com tolerância a falhas.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Marca de tempo e janela: conter o estado",
            blocks: [
                {
                    type: "text",
                    value: "Consulta com estado sem limite cresce até cair. No fim desta aula você sabe dimensionar a marca de tempo que contém esse crescimento, sabe exatamente o que a documentação garante para o registro atrasado, e sabe deduplicar em streaming sem guardar chave para sempre.",
                },
                {
                    type: "text",
                    value: "A marca de tempo, ou watermark, limita por quanto tempo o Structured Streaming mantém estado para cada entidade, seja uma janela de tempo, seja uma chave de junção. Ela existe para evitar erro de memória e latência crescente. Você declara duas coisas: a coluna de timestamp e o limite de atraso que você tolera. A consulta passa a acompanhar o maior valor já observado naquela coluna, e o estado de uma entidade é descartado quando o fim dela fica mais velho que esse maior valor menos o limite.",
                },
                {
                    type: "code",
                    value: 'from pyspark.sql.functions import window\n\ncontagem = (df\n  .withWatermark("event_time", "10 minutes")\n  .groupBy(window("event_time", "5 minutes"), "id")\n  .count())',
                },
                {
                    type: "text",
                    value: "Referencie a coluna pelo nome dentro de `groupBy()` e de `window()`, para que o marcador de tempo de evento seja preservado. A coluna precisa ser do tipo `TimestampType` ou `TimestampNTZType`. Em SQL a cláusula equivalente é `WATERMARK`, escrita como `WATERMARK event_time DELAY OF INTERVAL 3 MINUTES`.",
                },
                {
                    type: "text",
                    value: "O registro atrasado tem uma regra de duas partes, e a prova gosta da segunda. Registro que chega dentro do limite é sempre processado. Registro que chega depois do limite pode ser processado, e não há garantia de que será. Ou seja: não existe promessa de descarte nem promessa de inclusão para o atrasado, existe garantia só dentro do limite. Em agregação de streaming, a métrica `numRowsDroppedByWatermark` conta as linhas que o operador considerou atrasadas demais. Dois detalhes dela: conta linhas depois da agregação, não a entrada bruta, e o número não é preciso, serve como indicação de que há dado atrasado sendo descartado.",
                },
                {
                    type: "quote",
                    value: "Dentro do limite da marca de tempo, o processamento é garantido. Depois do limite, o registro pode ser processado, e não há garantia.",
                },
                {
                    type: "text",
                    value: "A marca de tempo não trabalha sozinha: o que ela faz com o estado depende do modo de saída da consulta.",
                },
                {
                    type: "table",
                    value: '[["Modo de saída", "Quando a linha da janela é escrita", "Estado antigo"], ["`append`", "Depois que a marca de tempo passa do fim da janela", "É descartado"], ["`update`", "A cada disparo, conforme o resultado é calculado, podendo ser sobrescrito depois", "É descartado"], ["`complete`", "A cada disparo, reescrevendo o destino inteiro", "Não é descartado"]]',
                },
                {
                    type: "text",
                    value: "Daí sai a troca que define o dimensionamento. Limite curto reduz estado e latência, e tolera menos dado atrasado. Limite longo tolera mais atraso, e aumenta estado e latência. Em `append`, o atraso da escrita é de pelo menos o valor do limite: uma marca de tempo de uma hora significa pelo menos uma hora entre o evento e a linha final no destino. E a armadilha clássica: em `complete` o estado não é descartado, nem com `withWatermark` declarado, porque o modo precisa poder reemitir tudo que o operador já produziu. Declarar marca de tempo e escolher `complete` não contém estado nenhum.",
                },
                {
                    type: "text",
                    value: "Três tipos de janela aparecem na prova, e o engano comum é achar que a janela deslizante aceita qualquer deslocamento.",
                },
                {
                    type: "table",
                    value: '[["Janela", "Chamada", "Comportamento"], ["Fixa", "`window(\\"timestamp\\", \\"1 hour\\")`", "Blocos fixos sem sobreposição"], ["Deslizante", "`window(\\"timestamp\\", \\"6 hours\\", slideDuration=\\"1 hour\\")`", "Janelas sobrepostas; o `slideDuration` tem de ser menor ou igual à duração da janela"], ["De sessão", "`session_window(\\"timestamp\\", gapDuration=\\"30 minutes\\")`", "A janela fecha depois de um intervalo sem linha nova para a chave"]]',
                },
                {
                    type: "text",
                    value: "A duração de janela vai de microssegundos a dias. Duração em meses ou maior não é suportada. Para janela por tempo de processamento em vez de tempo de evento, use `current_timestamp()` como coluna de tempo.",
                },
                {
                    type: "text",
                    value: "O segundo uso da marca de tempo é deduplicação, e aqui a escolha do operador muda o resultado. O `distinct` guarda cada registro único em estado, então sem marca de tempo o estado cresce indefinidamente. Para deduplicar por colunas específicas, a documentação recomenda `dropDuplicates()` ou `dropDuplicatesWithinWatermark()` no lugar de `distinct`. O `dropDuplicatesWithinWatermark()`, disponível a partir do Databricks Runtime 13.3 LTS, remove duplicata por qualquer campo mesmo quando as duas cópias têm tempo de evento ou de chegada diferentes, e exige marca de tempo declarada.",
                },
                {
                    type: "code",
                    value: 'sem_duplicata = (streamingDf\n  .withWatermark("eventTime", "10 hours")\n  .dropDuplicatesWithinWatermark(["guid"]))',
                },
                {
                    type: "text",
                    value: "A regra de dimensionamento é explícita: duplicata que chega dentro do limite é sempre removida, duplicata que chega depois pode ser removida, sem garantia. Para garantir que toda duplicata caia, defina o limite maior que a diferença máxima de timestamp entre os eventos duplicados. Se a origem pode repetir um evento até seis horas depois do original, dez horas de limite é dimensionamento, não exagero. E um detalhe de operação que a prova explora: `dropDuplicates()` e `dropDuplicatesWithinWatermark()` podem falhar no reinício por checagem de compatibilidade de schema de estado quando o modo de acesso do compute muda. Trocar entre dedicado e sem isolamento é permitido, trocar entre padrão e serverless é permitido, outras combinações não.",
                },
                {
                    type: "quote",
                    value: "Para garantir que toda duplicata seja removida, o limite da marca de tempo tem de ser maior que a diferença máxima de timestamp entre os eventos duplicados.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve `withWatermark()` em uma agregação por janela?",
                    difficulty: "facil",
                    explanation:
                        "A marca de tempo limita por quanto tempo o estado de cada entidade é mantido, evitando erro de memória e latência crescente. A opção de ordenar engana porque a marca de tempo não reordena nada, só define até quando a janela aceita contribuição.",
                    options: [
                        {
                            text: "Limitar por quanto tempo o estado de cada janela é mantido antes de ser descartado.",
                            isCorrect: true,
                        },
                        {
                            text: "Reordenar os registros do micro-lote por tempo de evento antes da agregação.",
                            isCorrect: false,
                        },
                        {
                            text: "Garantir que todo registro atrasado da origem entre na janela correspondente a ele.",
                            isCorrect: false,
                        },
                        {
                            text: "Forçar o operador a reemitir a janela fechada sempre que chega dado novo nela.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Uma consulta usa `withWatermark("event_time", "10 minutes")`. Um registro chega 25 minutos depois do tempo de evento máximo já observado. O que a documentação garante?',
                    difficulty: "medio",
                    explanation:
                        "A garantia é só dentro do limite: dentro dele o processamento é certo, fora dele o registro pode ser processado sem garantia. A opção do descarte garantido engana porque é o comportamento que a maioria presume, mas a documentação não promete descarte.",
                    options: [
                        {
                            text: "Nada: fora do limite o registro pode ser processado, e não há garantia de que será.",
                            isCorrect: true,
                        },
                        {
                            text: "O descarte do registro, porque fora do limite da marca de tempo nada é processado.",
                            isCorrect: false,
                        },
                        {
                            text: "O processamento do registro, porque o limite só atrasa a escrita e nunca descarta.",
                            isCorrect: false,
                        },
                        {
                            text: "A reabertura da janela, porque a marca de tempo recua para acomodar o atraso visto.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Uma agregação por janela declara marca de tempo de uma hora e grava com `outputMode("complete")`. O time estranha que a memória do state store só cresce. Por quê?',
                    difficulty: "medio",
                    explanation:
                        "No modo complete o estado não é descartado, porque o operador tem de poder reemitir todas as linhas já produzidas. A opção do limite curto engana porque reduzir o limite ajudaria em append ou update, e em complete não muda nada.",
                    options: [
                        {
                            text: "No modo `complete` o estado não é descartado, mesmo com marca de tempo declarada na consulta.",
                            isCorrect: true,
                        },
                        {
                            text: "O limite de uma hora é curto demais, e a janela só é liberada com limite acima disso.",
                            isCorrect: false,
                        },
                        {
                            text: "A marca de tempo em modo `complete` precisa ser declarada depois do `groupBy` da janela de tempo.",
                            isCorrect: false,
                        },
                        {
                            text: "O modo `complete` descarta o estado apenas quando o destino é um sink que aceita commit.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma origem reemite o mesmo evento com `guid` igual, e as duas cópias chegam com tempos de evento diferentes. Qual operador a documentação indica para deduplicar?",
                    difficulty: "medio",
                    explanation:
                        "O `dropDuplicatesWithinWatermark()` existe justamente para duplicata com tempo de evento ou de chegada diferente, e está disponível a partir do Databricks Runtime 13.3 LTS. A opção do `distinct` engana porque deduplica, só que guarda cada registro único e faz o estado crescer sem limite.",
                    options: [
                        {
                            text: '`dropDuplicatesWithinWatermark(["guid"])`, com marca de tempo declarada na consulta.',
                            isCorrect: true,
                        },
                        {
                            text: "`distinct()` sobre o DataFrame inteiro, que compara os registros campo por campo.",
                            isCorrect: false,
                        },
                        {
                            text: '`dropDuplicates(["guid", "eventTime"])`, que inclui o tempo de evento na chave.',
                            isCorrect: false,
                        },
                        {
                            text: '`groupBy("guid").agg(min("eventTime"))`, que elege a primeira cópia de cada chave vista.',
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A origem pode repetir um evento até seis horas depois do original. Como dimensionar o limite da marca de tempo para garantir que toda duplicata seja removida?",
                    difficulty: "dificil",
                    explanation:
                        "A regra documentada é definir o limite maior que a diferença máxima de timestamp entre os eventos duplicados, então seis horas pede algo acima disso. A opção das seis horas exatas engana porque na igualdade a duplicata cai na borda e a remoção deixa de ser garantida.",
                    options: [
                        {
                            text: "Acima de seis horas, porque o limite tem de passar da diferença máxima entre as duplicatas.",
                            isCorrect: true,
                        },
                        {
                            text: "Exatamente seis horas, porque o limite é comparado com a diferença máxima já observada na origem.",
                            isCorrect: false,
                        },
                        {
                            text: "Bem abaixo de seis horas, porque limite menor força o operador a comparar mais cópias.",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer valor serve, porque o operador compara pela chave e ignora o limite declarado.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Junção entre streams e o que a marca de tempo exige",
            blocks: [
                {
                    type: "text",
                    value: "Juntar dois streams é a operação com estado mais cara que você vai colocar em produção, e a que mais aparece em questão de diagnóstico. No fim desta aula você sabe escrever a junção que a documentação considera correta, sabe por que a marca de tempo é obrigatória nos dois lados na junção externa, e sabe o que muda quando os dois streams correm em ritmos diferentes.",
                },
                {
                    type: "text",
                    value: "A exigência é dupla e inseparável: marca de tempo nos dois lados da junção e uma cláusula de intervalo de tempo na condição. A cláusula de intervalo tem de usar os mesmos campos que definem as marcas de tempo. Ela é o que diz ao motor quando nenhum casamento novo é mais possível para uma linha guardada, e portanto quando aquele estado pode sair. Faltando a marca de tempo ou faltando o intervalo, o estado cresce sem limite. Junção entre streams suporta apenas o modo de saída `append`.",
                },
                {
                    type: "code",
                    value: 'from pyspark.sql.functions import expr\n\ncliques = (spark.readStream.table("main.ads.raw_clicks")\n  .withWatermark("clickTimestamp", "3 minutes"))\n\nimpressoes = (spark.readStream.table("main.ads.raw_impressions")\n  .withWatermark("impressionTimestamp", "3 minutes"))\n\njuncao = (impressoes.alias("imp").join(\n  cliques.alias("click"),\n  expr("""\n    imp.userId = click.userId AND\n    click.adId = imp.adId AND\n    click.clickTimestamp >= imp.impressionTimestamp AND\n    click.clickTimestamp <= imp.impressionTimestamp + interval 3 minutes\n  """),\n  "inner"))',
                },
                {
                    type: "text",
                    value: "Note que o intervalo de três minutos da condição conversa com os três minutos das duas marcas de tempo. Passado esse intervalo, as linhas de estado que não podem mais casar são descartadas. Se você declarar marca de tempo e esquecer a cláusula de intervalo, o motor não tem como saber que a impressão de ontem nunca mais vai receber clique.",
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Junção interna", "Junção externa"], ["Marca de tempo nos dois lados", "Recomendada pela documentação", "Obrigatória"], ["Efeito de não declarar marca de tempo", "A consulta roda, e toda chave pode ser casada em cada disparo, com estado crescendo", "Não é uma opção válida"], ["Linha que não encontra par", "Nunca é emitida", "É emitida com nulo, só depois que o limite passa"], ["Modo de saída suportado", "Apenas `append`", "Apenas `append`"], ["Cláusula de intervalo de tempo", "Usa os mesmos campos das marcas de tempo", "Usa os mesmos campos das marcas de tempo"]]',
                },
                {
                    type: "quote",
                    value: "Na junção externa a marca de tempo é obrigatória, e o registro sem par só sai, preenchido com nulo, depois que o limite passa.",
                },
                {
                    type: "text",
                    value: "Com duas origens, cada stream pode ter o seu próprio limite. O Structured Streaming acompanha o tempo de evento máximo de cada stream, calcula a marca de tempo de cada um e deriva uma marca de tempo global. Por padrão a global é o **mínimo** entre elas, para que um stream lento não faça dado válido ser considerado atrasado. Trocar isso é possível, e perigoso: `spark.sql.streaming.multipleWatermarkPolicy` aceita `max`, que faz a global seguir o stream mais rápido, reduz latência e descarta dado dos streams mais lentos. O padrão é `min`.",
                },
                {
                    type: "code",
                    value: 'spark.conf.set("spark.sql.streaming.multipleWatermarkPolicy", "max")',
                },
                {
                    type: "text",
                    value: "A junção entre streams também é a operação mais pesada no state store, e isso aparece nas métricas de progresso. No campo `stateOperators`, o `operatorName` de uma junção é `symmetricHashJoin`, enquanto deduplicação aparece como `dedupe` e agregação como `stateStoreSave`. O detalhe que vale decorar está em `numStateStoreInstances`: para a maioria dos operadores com estado esse número é igual ao de partições, mas a junção entre streams inicializa **quatro** instâncias de state store por partição. É por isso que a memória de uma junção cresce mais rápido do que a conta ingênua sugere, e é a primeira coisa a olhar quando `memoryUsedBytes` dispara.",
                },
                {
                    type: "text",
                    value: "No reinício, a junção é tão restritiva quanto a agregação. Mudar o schema ou as colunas de equi-junção não é permitido. Mudar o tipo da junção, de interna para externa ou o contrário, não é permitido. Outras mudanças na condição de junção têm efeito mal definido, o que na prática significa que você não deve fazê-las com o mesmo checkpoint. Quando a decisão de produto exige virar a junção de interna para externa, o caminho é checkpoint novo, com o custo de reprocessamento que isso implica.",
                },
                {
                    type: "text",
                    value: "Por fim, encadear operadores com estado é suportado a partir do Databricks Runtime 13.3 LTS, e abre padrões que antes exigiam duas consultas: agregação por janela alimentando uma junção, agregação por janela nos dois streams seguida de junção por janela, e junção por intervalo entre streams seguida de agregação por janela. Duas limitações: só o modo de saída `append` é suportado nesse encadeamento, e os operadores antigos `FlatMapGroupWithState` e `applyInPandasWithState` não entram. O `transformWithState` passa a aceitar encadeamento a partir do Databricks Runtime 16.2.",
                },
                {
                    type: "quote",
                    value: "A cláusula de intervalo de tempo é o que diz ao motor quando nenhum casamento novo é possível. Sem ela, ou sem marca de tempo nos dois lados, o estado da junção cresce sem limite.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que a documentação exige para uma junção externa entre dois streams?",
                    difficulty: "facil",
                    explanation:
                        "A exigência é marca de tempo nos dois lados mais cláusula de intervalo de tempo usando os mesmos campos das marcas. A opção de um lado só engana porque parece bastar para limpar estado, mas o lado sem marca de tempo segue guardando linha para sempre.",
                    options: [
                        {
                            text: "Marca de tempo nos dois lados e intervalo sobre as colunas de tempo de evento.",
                            isCorrect: true,
                        },
                        {
                            text: "Marca de tempo em um dos lados e condição de igualdade sobre a chave de junção.",
                            isCorrect: false,
                        },
                        {
                            text: "Modo de saída `update` nos dois lados e cláusula de intervalo sobre a chave comum.",
                            isCorrect: false,
                        },
                        {
                            text: "Marca de tempo global única e condição de igualdade sobre as duas colunas de timestamp.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma junção externa entre dois streams tem marca de tempo de cinco minutos nos dois lados. Quando a linha sem par é emitida?",
                    difficulty: "medio",
                    explanation:
                        "Na junção externa o registro sem par é escrito com nulo só depois que o limite da marca de tempo passa, porque antes disso ainda pode aparecer um casamento. A opção do disparo seguinte engana porque é o que aconteceria em uma junção de lote, sem estado pendente.",
                    options: [
                        {
                            text: "Depois que o limite da marca de tempo passa, preenchida com nulo do outro lado.",
                            isCorrect: true,
                        },
                        {
                            text: "No disparo seguinte ao da chegada, preenchida com nulo do outro lado da junção.",
                            isCorrect: false,
                        },
                        {
                            text: "Só quando a consulta é encerrada, no descarregamento final do state store dela.",
                            isCorrect: false,
                        },
                        {
                            text: "Nunca, porque a junção externa entre streams descarta a linha que não encontra par.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para reduzir latência, o time configura `spark.sql.streaming.multipleWatermarkPolicy` com `max` em uma junção entre dois streams de ritmos diferentes. Qual é a consequência?",
                    difficulty: "medio",
                    explanation:
                        "Com `max` a marca de tempo global passa a seguir o stream mais rápido, o que reduz latência e descarta dado dos streams mais lentos. A opção do erro de inicialização engana porque a configuração é válida e aceita, o risco é silencioso, de perda de dado.",
                    options: [
                        {
                            text: "A marca de tempo global segue o stream mais rápido e descarta dado dos mais lentos.",
                            isCorrect: true,
                        },
                        {
                            text: "A marca de tempo global segue o stream mais lento e aumenta o estado dos mais rápidos.",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta falha ao iniciar, porque esse valor só é aceito com um único stream de entrada.",
                            isCorrect: false,
                        },
                        {
                            text: "Cada stream passa a manter a sua própria marca de tempo e nenhum dado é mais descartado.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma junção interna entre streams está em produção há meses. O produto agora exige emitir impressão sem clique, então o time quer trocar para junção externa à esquerda, mantendo o checkpoint. O que acontece?",
                    difficulty: "dificil",
                    explanation:
                        "Mudar o tipo da junção, de interna para externa ou o contrário, não é permitido no mesmo checkpoint, então é preciso um local novo. A opção de só declarar marca de tempo engana porque ela é mesmo obrigatória na externa, mas não resolve a incompatibilidade de estado.",
                    options: [
                        {
                            text: "A mudança não é permitida com o mesmo checkpoint, e é preciso um local novo.",
                            isCorrect: true,
                        },
                        {
                            text: "A mudança é permitida, desde que as colunas de equi-junção continuem as mesmas.",
                            isCorrect: false,
                        },
                        {
                            text: "A mudança é permitida, bastando declarar marca de tempo também no lado à direita.",
                            isCorrect: false,
                        },
                        {
                            text: "A mudança é permitida, porém o estado da junção interna é descartado no reinício.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em uma consulta com junção entre streams, `memoryUsedBytes` cresce muito mais rápido do que o time esperava pelo número de partições. Que característica da junção explica isso?",
                    difficulty: "dificil",
                    explanation:
                        "Junção entre streams inicializa quatro instâncias de state store por partição, enquanto a maioria dos operadores usa uma por partição. A opção do `numRowsDroppedByWatermark` engana porque a métrica existe e é útil, só que indica descarte por atraso, não consumo de memória.",
                    options: [
                        {
                            text: "A junção inicializa quatro instâncias de state store por partição do operador.",
                            isCorrect: true,
                        },
                        {
                            text: "A junção mantém uma instância de state store por chave distinta já encontrada.",
                            isCorrect: false,
                        },
                        {
                            text: "A junção replica o state store em cada executor para evitar embaralhamento.",
                            isCorrect: false,
                        },
                        {
                            text: "A junção soma ao estado as linhas contadas em `numRowsDroppedByWatermark`.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "foreachBatch e escrita idempotente",
            blocks: [
                {
                    type: "text",
                    value: "Existe uma classe de escrita que o sink nativo de streaming simplesmente não faz, e `foreachBatch` é a porta de saída. No fim desta aula você sabe quando ele é obrigatório, sabe escrever de forma idempotente em tabela Delta, e reconhece as três armadilhas que derrubam consulta em produção: lote vazio, consumo parcial do DataFrame e tratamento de erro no lugar errado.",
                },
                {
                    type: "text",
                    value: "O padrão é `streamingDF.writeStream.foreachBatch(...)`, e a função recebe dois parâmetros: um DataFrame com os dados de saída do micro-lote e o ID único daquele micro-lote. Com ele você aplica em cada lote operações que o DataFrame de streaming não suporta, porque o Spark não consegue gerar plano incremental para elas, e reaproveita escritores de lote para destinos sem sink nativo de streaming, como Cassandra ou um banco relacional. O caso que a prova cobra mais é o merge: para fazer operação de merge do Delta Lake em Structured Streaming, você **tem** de usar `foreachBatch`. É também a forma de obter, em tabela Delta, comportamento parecido com o modo de saída `update`, que o sink Delta não aceita.",
                },
                {
                    type: "code",
                    value: 'def upsert(micro_batch_df, batch_id):\n    if micro_batch_df.isEmpty():\n        return\n    micro_batch_df.createOrReplaceTempView("atualizacoes")\n    micro_batch_df.sparkSession.sql("""\n        MERGE INTO main.vendas.agregado AS t\n        USING atualizacoes AS s\n          ON t.loja = s.loja AND t.janela = s.janela\n        WHEN MATCHED THEN UPDATE SET t.total = s.total\n        WHEN NOT MATCHED THEN INSERT *\n    """)\n\n(agregado.writeStream\n  .option("checkpointLocation", "/Volumes/main/ops/checkpoints/agregado")\n  .foreachBatch(upsert)\n  .start())',
                },
                {
                    type: "text",
                    value: "Agora a parte que define a corretude. O `foreachBatch()` oferece **apenas** garantia de escrita at-least-once. Para chegar a exactly-once, você usa o `batchId` recebido na função para deduplicar a saída, e em qualquer um dos dois casos a responsabilidade de raciocinar sobre a semântica de ponta a ponta é sua. Para tabela Delta Lake, a dedução já vem pronta em duas opções de escrita: `txnAppId`, uma string única que você passa em cada escrita de DataFrame, e `txnVersion`, um número monotonicamente crescente que funciona como versão de transação. O Delta Lake usa o par para identificar e ignorar escrita duplicada, então basta ligar `txnVersion` ao `batchId`. Depois de uma falha no meio da escrita, reexecutar o lote com o mesmo par faz o Delta reconhecer e ignorar a duplicata.",
                },
                {
                    type: "code",
                    value: 'app_id = "agregado_vendas_v1"\n\ndef escreve_idempotente(batch_df, batch_id):\n    (batch_df.write\n      .format("delta")\n      .option("txnVersion", batch_id)\n      .option("txnAppId", app_id)\n      .mode("append")\n      .saveAsTable("main.vendas.agregado"))\n\nstreamingDF.writeStream.foreachBatch(escreve_idempotente).start()',
                },
                {
                    type: "text",
                    value: "O `txnAppId` pode ser qualquer string única gerada por você e não precisa ter relação com o ID da consulta, embora usar o ID da `StreamingQuery` seja uma opção. E aqui está a pegadinha preferida da prova: se você apagar o checkpoint e reiniciar a consulta com um local novo, precisa fornecer um `txnAppId` diferente. Checkpoint novo começa com `batchId` igual a `0`, e o Delta Lake usa o par formado por ID do lote e `txnAppId` como chave única, pulando lote com valores já vistos. Mantendo o mesmo `txnAppId`, a consulta reiniciada grava nada e não reclama.",
                },
                {
                    type: "quote",
                    value: "Ao apagar o checkpoint e reiniciar com um local novo, forneça um txnAppId diferente: o ID de lote volta a zero e o Delta pula tudo que já viu.",
                },
                {
                    type: "text",
                    value: "Primeira armadilha: `foreachBatch()` pode receber um DataFrame vazio, e o seu código tem de tratar esse caso, senão a consulta pode falhar. Com Delta Lake como origem, dois cenários produzem lote vazio. Um `OPTIMIZE` que roda na tabela de origem sem arquivo a processar faz o Structured Streaming escrever uma entrada no log de offsets para incrementar a versão da tabela, o que gera micro-lote vazio no destino mesmo sem leitura de arquivo. E poda de arquivo no plano físico, por empurrão de predicado, pode eliminar todos os registros e resultar em commit vazio. A guarda é curta.",
                },
                {
                    type: "code",
                    value: "def process_batch(output_df, batch_id):\n    # Processa apenas DataFrame válido\n    if not output_df.isEmpty():\n        # lógica de negócio\n        pass\n\nstreamingDF.writeStream.foreachBatch(process_batch).start()",
                },
                {
                    type: "text",
                    value: "Segunda armadilha, e a mais cruel: quando a consulta usa operador com estado, por exemplo `dropDuplicatesWithinWatermark`, cada iteração **tem** de consumir o DataFrame do lote por inteiro, ou a consulta precisa ser reiniciada. Se você não consome tudo, a consulta falha no lote seguinte, não no lote onde está o erro, e é isso que faz o diagnóstico demorar. O caso típico é inspecionar uma amostra, com algo como `batch_df.show(2)`, que trata só os dois primeiros itens. A correção documentada é consumir o resto de propósito, com uma função que não faz nada.",
                },
                {
                    type: "code",
                    value: "def do_nothing(row):\n    pass\n\ndef partial_func(batch_df, batch_id):\n    batch_df.show(2)\n    batch_df.foreach(do_nothing)  # consome o resto do lote em silêncio",
                },
                {
                    type: "text",
                    value: "Terceira armadilha: tratamento de erro. A orientação da Databricks é deixar a consulta falhar rápido e confiar a repetição à camada de orquestração, porque laço de repetição dentro do código é onde a perda de dado nasce.",
                },
                {
                    type: "table",
                    value: '[["Situação", "Orientação da documentação"], ["Escrita em tabela Delta por operação de DataFrame", "Usar `txnAppId` e `txnVersion`, com `txnVersion` ligado ao `batchId`, e deixar o erro propagar"], ["Código próprio, banco OLTP, fila de mensagem, API", "Implementar a própria idempotência, assumindo que qualquer operação será repetida"], ["Erro transitório de destino, como timeout ou HTTP 429", "Capturar: repetir, ou mandar o registro para uma fila de descarte"], ["Violação de chave quando o destino é idempotente", "Capturar: registrar em log e suprimir"], ["Erro de lógica ou de schema, como `AttributeError`", "Propagar: deixar o Spark falhar a consulta"], ["Falha crítica, como `OutOfMemoryError` ou estado corrompido", "Propagar: deixar o Spark falhar a consulta"]]',
                },
                {
                    type: "text",
                    value: "Três limites fecham a aula. O `foreachBatch()` não funciona no modo de processamento contínuo, porque depende da execução em micro-lotes; para escrever em modo contínuo, use `foreach()`. Escrever o mesmo lote em vários destinos dentro do `foreachBatch` serializa as escritas de streaming e pode aumentar a latência de cada micro-lote, então a recomendação é configurar uma escrita de streaming separada por destino. E no Databricks Runtime 14.0 e acima, em compute com modo de acesso padrão, três comportamentos mudam: `print()` passa a escrever nos logs do driver, o submódulo `dbutils.widgets` não pode ser acessado dentro da função, e todo arquivo, módulo ou objeto referenciado na função tem de ser serializável e estar disponível no Spark.",
                },
                {
                    type: "quote",
                    value: "foreachBatch oferece apenas garantia at-least-once. Chegar a exactly-once depende de você usar o batchId para deduplicar a saída.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que uma operação de merge do Delta Lake em Structured Streaming precisa de `foreachBatch`?",
                    difficulty: "medio",
                    explanation:
                        "O merge não tem plano incremental em DataFrame de streaming, e `foreachBatch` entrega um DataFrame de lote onde a operação é válida. A opção do modo update engana porque o problema do merge não é o modo de saída, é a operação não ser suportada em streaming.",
                    options: [
                        {
                            text: "Porque o merge não é suportado em DataFrame de streaming, e o lote entrega um DataFrame comum.",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o merge exige modo de saída `update`, e o `foreachBatch` muda o modo de saída da consulta.",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o merge precisa do `batchId` como coluna de controle na condição de casamento.",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o sink Delta nativo só aceita `append`, e o `foreachBatch` troca o sink por outro.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual garantia de escrita o `foreachBatch()` oferece por si só?",
                    difficulty: "facil",
                    explanation:
                        "A documentação é explícita: `foreachBatch()` oferece apenas garantia at-least-once, e exactly-once depende de você deduplicar a saída com o `batchId`. A opção do exactly-once automático engana porque é a garantia do sink nativo, não a desse caminho.",
                    options: [
                        {
                            text: "At-least-once, e chegar a exactly-once depende de deduplicar a saída pelo `batchId`.",
                            isCorrect: true,
                        },
                        {
                            text: "Exactly-once, porque o checkpoint registra o commit de cada micro-lote no destino.",
                            isCorrect: false,
                        },
                        {
                            text: "At-most-once, porque o lote com falha é descartado e o processamento segue adiante.",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma garantia, porque o micro-lote fora do sink nativo não entra no log de commits.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pipeline grava em tabela Delta dentro de `foreachBatch` com `txnAppId` fixo e `txnVersion` ligado ao `batchId`. Depois de um incidente, o time apaga o checkpoint e reinicia com um local novo. O que acontece?",
                    difficulty: "dificil",
                    explanation:
                        "Checkpoint novo reinicia o `batchId` em zero, e o Delta usa ID do lote mais `txnAppId` como chave única, pulando o que já viu. A opção do erro de transação engana porque não há falha visível: a consulta roda e simplesmente não grava.",
                    options: [
                        {
                            text: "O Delta ignora os lotes como duplicados, e nada é gravado até o `txnAppId` mudar.",
                            isCorrect: true,
                        },
                        {
                            text: "O Delta grava tudo de novo, e a tabela passa a ter os registros antigos duplicados.",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta falha com erro de transação, porque a versão informada já existe na tabela.",
                            isCorrect: false,
                        },
                        {
                            text: "O Delta sobrescreve as versões anteriores, e a tabela fica só com os lotes reprocessados.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta com `dropDuplicatesWithinWatermark` usa `foreachBatch` e a função só faz `batch_df.show(2)` para inspeção. A consulta falha no lote seguinte. Qual é a causa e a correção?",
                    difficulty: "dificil",
                    explanation:
                        "Com operador com estado, cada iteração tem de consumir o DataFrame do lote por inteiro, e a correção documentada é consumir o resto com um `foreach` que não faz nada. A opção do lote vazio engana porque é uma armadilha real do `foreachBatch`, só que produz outro sintoma.",
                    options: [
                        {
                            text: "O lote não foi consumido por inteiro; consumir o resto com `foreach` e função vazia.",
                            isCorrect: true,
                        },
                        {
                            text: "O lote chegou vazio em algum disparo; proteger a função com uma guarda de `isEmpty()`.",
                            isCorrect: false,
                        },
                        {
                            text: "A amostra do `show` quebra a idempotência; trocar por `collect` dentro da função.",
                            isCorrect: false,
                        },
                        {
                            text: "O estado ficou grande demais para o driver; subir o limite de resultado do driver.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em qual situação a documentação diz que `foreachBatch()` não funciona, e o que usar no lugar?",
                    difficulty: "medio",
                    explanation:
                        "`foreachBatch()` depende da execução em micro-lotes, então não funciona no modo de processamento contínuo, onde o caminho é `foreach()`. A opção do modo tempo real engana porque é a recomendação da Databricks para baixa latência, e não é o caso citado como incompatível.",
                    options: [
                        {
                            text: "No modo de processamento contínuo, onde o caminho indicado é usar `foreach()`.",
                            isCorrect: true,
                        },
                        {
                            text: "No gatilho `availableNow`, onde o caminho indicado é usar `foreach()` por lote.",
                            isCorrect: false,
                        },
                        {
                            text: "Em tabela gerenciada do Unity Catalog, onde o indicado é o sink nativo.",
                            isCorrect: false,
                        },
                        {
                            text: "Em modo de saída `complete`, onde o caminho indicado é agregar antes do sink.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Estado arbitrário e o armazenamento de estado",
            blocks: [
                {
                    type: "text",
                    value: "Quando nem agregação, nem deduplicação, nem junção descrevem a sua regra, sobra escrever o operador com estado na mão. No fim desta aula você sabe qual API usar hoje para isso, sabe como o estado é guardado e como baratear o checkpoint dele, e sabe quais métricas olhar para descobrir que o estado saiu de controle antes de o job cair.",
                },
                {
                    type: "text",
                    value: "A API atual é o `transformWithState`, disponível a partir do Databricks Runtime 16.2, e a recomendação da documentação é usá-la em lugar dos operadores antigos `flatMapGroupsWithState` e `mapGroupsWithState`. Para agregação, deduplicação e junção, a orientação continua sendo usar os operadores embutidos. O desenho é este: você define uma ou mais variáveis de estado, cujo conteúdo persiste **por chave de agrupamento**; a cada micro-lote, todas as linhas daquela chave chegam como um iterador; e você usa o `StatefulProcessorHandle` com temporizadores e condições próprias para controlar quando emitir linha. Como o `transformWithState` suporta evolução de schema no state store, você consegue mudar o schema do estado e seguir em produção sem reprocessar as linhas antigas.",
                },
                {
                    type: "code",
                    value: 'from pyspark.sql import Row\nfrom pyspark.sql.streaming import StatefulProcessor, StatefulProcessorHandle\nfrom pyspark.sql.types import StructType, StructField, IntegerType, StringType\n\noutput_schema = StructType([\n    StructField("id", StringType(), True),\n    StructField("countAsString", StringType(), True),\n])\n\nclass ContadorSimples(StatefulProcessor):\n    def init(self, handle: StatefulProcessorHandle) -> None:\n        schema = StructType([StructField("count", IntegerType(), True)])\n        self.value_state = handle.getValueState(stateName="valueState", schema=schema)\n        # o schema também aceita string em DDL de SQL\n        self.map_state = handle.getMapState(\n            stateName="mapState", userKeySchema="name string", valueSchema="count int")\n\n    def handleInputRows(self, key, rows, timerValues):\n        count = self.value_state.get()[0] if self.value_state.exists() else 0\n        for linha in rows:\n            count += 1\n        self.value_state.update((count,))\n        yield Row(id=key[0], countAsString=str(count))\n\nq = (df.groupBy("key")\n  .transformWithState(\n      statefulProcessor=ContadorSimples(),\n      outputStructType=output_schema,\n      outputMode="Update",\n      timeMode="None")\n  .writeStream)',
                },
                {
                    type: "text",
                    value: "Você implementa `handleInputRows` para dizer como a aplicação processa dado, atualiza estado e emite linha em cada micro-lote. Implementa `handleExpiredTimer` para rodar lógica baseada em tempo mesmo quando a chave não recebe linha nova no micro-lote. E opcionalmente implementa `handleInitialState`, para pré-popular o estado antes de qualquer linha de entrada ser processada, o que permite começar uma aplicação com estado sem checkpoint válido e sem reprocessar histórico.",
                },
                {
                    type: "table",
                    value: '[["Comportamento", "`handleInputRows`", "`handleExpiredTimer`"], ["Ler, gravar, atualizar ou limpar valor de estado", "Sim", "Sim"], ["Criar ou apagar temporizador", "Sim", "Sim"], ["Emitir linha", "Sim", "Sim"], ["Iterar as linhas do micro-lote atual", "Sim", "Não"], ["Disparar lógica por tempo decorrido", "Não", "Sim"]]',
                },
                {
                    type: "text",
                    value: "São três tipos de estado, e a diferença entre eles aparece na forma como o tempo de vida se aplica. O tempo de vida, ou TTL, é opcional por valor e existe para evitar erro de memória e remover valor obsoleto. Em todos os tipos, o TTL é reiniciado quando a informação de estado é atualizada.",
                },
                {
                    type: "table",
                    value: '[["Tipo de estado", "O que guarda por chave de agrupamento", "Como o TTL se aplica"], ["`ValueState`", "Um único valor", "Ao valor; reinicia quando o valor é atualizado"], ["`ListState`", "Uma lista com muitos valores", "A cada valor da lista de forma independente, mas o `put` sobrescreve a lista toda e reinicia o TTL de todos"], ["`MapState`", "Pares de chave e valor", "A cada par de forma independente"]]',
                },
                {
                    type: "text",
                    value: "O modo de tempo é informado no parâmetro `timeMode` e amarra temporizador e TTL ao relógio certo.",
                },
                {
                    type: "table",
                    value: '[["`timeMode`", "Temporizador", "TTL", "Observação"], ["`ProcessingTime`", "Suportado", "Suportado", "Avaliado pelo relógio de parede de quando o Spark processa cada micro-lote"], ["`EventTime`", "Suportado", "Não suportado", "Avaliado pela marca de tempo de evento; exige também o parâmetro `eventTimeColumnName`"], ["`NoTime`", "Não suportado", "Não suportado", "Para aplicação com estado que não depende de tempo"]]',
                },
                {
                    type: "text",
                    value: "Dois cuidados que a prova explora. O primeiro: o TTL remove o valor de estado em silêncio, sem executar `handleExpiredTimer` nem qualquer lógica sua; se você precisa rodar código na expiração, use temporizador, não TTL. O segundo: não chame o relógio do sistema dentro do processador, porque isso leva a repetição não confiável quando a tarefa falha. Use a classe `TimerValues`, com `getCurrentProcessingTimeInMs` para o tempo de processamento do lote atual e `getCurrentWatermarkInMs` para a marca de tempo do lote atual, ambos em milissegundos desde a época.",
                },
                {
                    type: "quote",
                    value: "O TTL remove o valor de estado em silêncio e não executa handleExpiredTimer. Para rodar código na expiração, use temporizador.",
                },
                {
                    type: "text",
                    value: "Abaixo da sua lógica está o armazenamento de estado. O RocksDB é o provedor padrão de state store a partir do Databricks Runtime 17.3; em versão anterior, você liga antes de iniciar a consulta com `spark.sql.streaming.stateStore.providerClass`. Em cima dele vem o checkpoint de changelog, disponível a partir do Databricks Runtime 13.3 LTS e recomendado pela Databricks para **toda** consulta de streaming com estado. Tradicionalmente o RocksDB tira um instantâneo e sobe os arquivos de dados a cada checkpoint; o checkpoint de changelog grava no armazenamento durável só os registros que mudaram desde o último checkpoint, o que reduz a duração do checkpoint e a latência de ponta a ponta. Ele é padrão a partir do 17.3 e desligado por padrão nas versões abaixo. Você pode ligá-lo em um stream existente mantendo o estado já guardado, e pode desligá-lo para voltar ao comportamento antigo, mas a consulta tem de continuar rodando em 13.3 LTS ou acima. O job precisa ser reiniciado para a mudança valer. O esquema de gerenciamento de estado não muda entre reinícios: trocar exige local de checkpoint novo.",
                },
                {
                    type: "code",
                    value: 'spark.conf.set("spark.sql.streaming.stateStore.providerClass",\n               "com.databricks.sql.streaming.state.RocksDBStateStoreProvider")\n\nspark.conf.set("spark.sql.streaming.stateStore.rocksdb.changelogCheckpointing.enabled",\n               "true")',
                },
                {
                    type: "text",
                    value: "Mais dois ajustes de consulta com estado que valem decorar. O número de partições de embaralhamento é fixado quando o checkpoint é criado, então mudar `spark.sql.shuffle.partitions` não tem efeito em consulta que já tem checkpoint; a recomendação é de uma a duas vezes o número de núcleos do cluster. E `spark.sql.streaming.noDataMicroBatches.enabled` em `false` economiza disparo sem dado, com o preço de atrasar a saída que dependeria do avanço da marca de tempo ou do vencimento de temporizador até que dado novo chegue.",
                },
                {
                    type: "text",
                    value: "Resta saber que a consulta está saudável. O caminho programático é a interface `StreamingQueryListener`, disponível em Python e Scala a partir do Databricks Runtime 11.3 LTS. Você estende a classe, implementa os retornos de chamada e registra com `spark.streams.addListener(...)`. São quatro: `onQueryStarted`, chamado de forma síncrona com o `start()` da escrita, onde você não deve bloquear porque isso bloqueia a consulta; `onQueryProgress`, entregue ao fim de cada micro-lote; `onQueryIdle`, entregue quando não há dado na origem e a consulta está esperando; e `onQueryTerminated`, quando a consulta para, com ou sem erro. Se a consulta está processando um lote longo, é possível que nem `onQueryIdle` nem `onQueryProgress` cheguem, e a consulta continua saudável. A latência de processamento do listener afeta a velocidade da consulta, então mantenha a lógica leve e escreva as métricas em um sistema de resposta rápida, por exemplo Kafka, quando o destino for alerta ou painel.",
                },
                {
                    type: "code",
                    value: 'from pyspark.sql.functions import col, count, lit\nfrom pyspark.sql.streaming import StreamingQueryListener\n\n# métrica observável: agregado com nome, lido depois no evento de progresso\nobserved_df = df.observe("metric",\n                         count(lit(1)).alias("cnt"),\n                         count(col("error")).alias("malformed"))\n\nclass MeuListener(StreamingQueryListener):\n    def onQueryStarted(self, event):\n        print(f"iniciou: {event.name} [{event.id}]")\n\n    def onQueryProgress(self, event):\n        row = event.progress.observedMetrics.get("metric")\n        if row is not None and row.malformed / row.cnt > 0.5:\n            print(f"alerta: {row.malformed} malformados em {row.cnt}")\n\n    def onQueryIdle(self, event):\n        pass\n\n    def onQueryTerminated(self, event):\n        print(f"terminou: {event.id}")\n\nspark.streams.addListener(MeuListener())',
                },
                {
                    type: "table",
                    value: '[["Métrica", "Onde fica", "O que ela diz"], ["`numInputRows`, `inputRowsPerSecond`, `processedRowsPerSecond`", "Raiz do progresso", "Se o processamento acompanha a chegada; taxa processada abaixo da taxa de chegada é acúmulo"], ["`batchDuration` e `durationMs.triggerExecution`", "Raiz e `durationMs`", "Quanto o micro-lote levou, e quanto levou para planejar mais executar"], ["`eventTime.watermark`", "`eventTime`", "O valor da marca de tempo usada naquele disparo"], ["`stateOperators.numRowsTotal` e `numRowsUpdated`", "`stateOperators`", "Tamanho do estado e quanto dele foi tocado no disparo"], ["`stateOperators.memoryUsedBytes`", "`stateOperators`", "Memória usada pelo state store"], ["`stateOperators.numRowsDroppedByWatermark`", "`stateOperators`", "Indício de dado atrasado sendo descartado, contado depois da agregação"], ["`numFilesOutstanding` e `numBytesOutstanding`", "`sources.metrics`", "Fila pendente em origem Delta Lake e Auto Loader"], ["`sink.numOutputRows`", "`sink`", "Linhas escritas; em sink Delta vem sempre como -1"]]',
                },
                {
                    type: "text",
                    value: 'Duas notas de leitura das métricas. O `batchId` pode ser executado mais de uma vez em caso de repetição após falha, e não é incrementado quando não há dado a processar, então não o use como contador de lotes bem-sucedidos. E as métricas do RocksDB chegam no mapa `customMetrics` dentro de `stateOperators`, com nomes como `rocksdbCommitCheckpointLatency`, `rocksdbReadBlockCacheHitCount` e `rocksdbTotalCompactionLatencyMs`; a partir do Databricks Runtime 16.4 LTS elas vêm rotuladas por ID de partição e nome do store. Quando precisar olhar o conteúdo do estado, e não só o tamanho, existe leitura em lote do próprio checkpoint: `spark.read.format("statestore").load("/caminho/do/checkpoint")` em Python, ou `read_statestore` em SQL, desde que você tenha acesso de leitura ao caminho.',
                },
                {
                    type: "quote",
                    value: "O RocksDB é o provedor padrão de state store a partir do Databricks Runtime 17.3, e o checkpoint de changelog é recomendado para toda consulta de streaming com estado.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é a API que a documentação recomenda hoje para estado arbitrário por grupo em Structured Streaming?",
                    difficulty: "facil",
                    explanation:
                        "A documentação recomenda `transformWithState`, disponível a partir do Databricks Runtime 16.2, em lugar dos operadores antigos. A opção do `flatMapGroupsWithState` engana porque ele ainda funciona e aparece em material antigo, mas está na página de operadores legados.",
                    options: [
                        {
                            text: "`transformWithState`, disponível a partir do Databricks Runtime 16.2 e acima.",
                            isCorrect: true,
                        },
                        {
                            text: "`flatMapGroupsWithState`, que segue como operador recomendado para esse caso.",
                            isCorrect: false,
                        },
                        {
                            text: "`applyInPandas`, que recebe o grupo inteiro e devolve o estado atualizado.",
                            isCorrect: false,
                        },
                        {
                            text: "`foreachBatch` com estado guardado em uma tabela Delta auxiliar por chave.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um `transformWithState`, o time define TTL nas variáveis de estado esperando que a expiração dispare a emissão de uma linha de encerramento. Isso funciona?",
                    difficulty: "medio",
                    explanation:
                        "O TTL remove o valor de estado em silêncio e não executa `handleExpiredTimer` nem lógica própria, então emitir linha na expiração exige temporizador. A opção do modo de tempo engana porque o modo realmente condiciona o TTL, mas não transforma expiração em chamada de código.",
                    options: [
                        {
                            text: "Não: o TTL remove o valor em silêncio, e emitir linha exige um temporizador.",
                            isCorrect: true,
                        },
                        {
                            text: "Sim: a expiração do TTL chama `handleExpiredTimer` para a chave afetada.",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, desde que o modo de tempo seja `EventTime` em vez de `ProcessingTime`.",
                            isCorrect: false,
                        },
                        {
                            text: "Não: o TTL só vale para `MapState`, e emitir linha exige trocar o tipo de estado.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que o checkpoint de changelog do RocksDB muda, e para que tipo de consulta a Databricks o recomenda?",
                    difficulty: "medio",
                    explanation:
                        "O checkpoint de changelog grava no armazenamento durável apenas os registros alterados desde o último checkpoint, e a recomendação vale para toda consulta de streaming com estado. A opção do instantâneo engana porque descreve justamente o comportamento tradicional que o changelog evita.",
                    options: [
                        {
                            text: "Grava só os registros alterados desde o último checkpoint, para toda consulta com estado.",
                            isCorrect: true,
                        },
                        {
                            text: "Sobe um instantâneo completo do estado a cada lote, para consulta com junção entre streams.",
                            isCorrect: false,
                        },
                        {
                            text: "Mantém o estado apenas em memória entre os lotes, para consulta sem janela de tempo.",
                            isCorrect: false,
                        },
                        {
                            text: "Replica o estado nos executores a cada disparo, para consulta com muitas partições.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Uma aplicação com `transformWithState` usa `timeMode="EventTime"` e o time quer também definir TTL nas variáveis de estado. O que a documentação diz?',
                    difficulty: "dificil",
                    explanation:
                        "Com `EventTime` o temporizador é suportado e o TTL não é, e esse modo ainda exige o parâmetro `eventTimeColumnName`. A opção do TTL contado pela marca de tempo engana porque é o comportamento que se esperaria por simetria com o temporizador, e não existe.",
                    options: [
                        {
                            text: "TTL não é suportado em `EventTime`, modo que exige também o `eventTimeColumnName`.",
                            isCorrect: true,
                        },
                        {
                            text: "TTL é suportado em `EventTime` e passa a ser contado pela marca de tempo da consulta.",
                            isCorrect: false,
                        },
                        {
                            text: "TTL é suportado em `EventTime` somente para `ValueState`, e ignorado nos outros tipos.",
                            isCorrect: false,
                        },
                        {
                            text: "TTL é suportado em `EventTime` e no `NoTime`, e fica indisponível em `ProcessingTime`.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um `StreamingQueryListener`, quais campos indicam que uma consulta com estado está acumulando estado sem limite?",
                    difficulty: "dificil",
                    explanation:
                        "`numRowsTotal` e `memoryUsedBytes` ficam em `stateOperators` e mostram o tamanho do estado crescendo por disparo. A opção do `sink.numOutputRows` engana porque parece medir volume de saída, só que em sink Delta ela sempre vem como -1.",
                    options: [
                        {
                            text: "`stateOperators.numRowsTotal` e `stateOperators.memoryUsedBytes`, disparo após disparo.",
                            isCorrect: true,
                        },
                        {
                            text: "`sink.numOutputRows` e `numInputRows`, comparados entre dois disparos consecutivos.",
                            isCorrect: false,
                        },
                        {
                            text: "`durationMs.walCommit` e `durationMs.getBatch`, somados ao longo de toda a janela de tempo.",
                            isCorrect: false,
                        },
                        {
                            text: "`batchId` e `eventTime.max`, observados desde o primeiro disparo depois do reinício.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Ingestão incremental e qualidade",
    aulas: [
        {
            titulo: "Auto Loader fino: descoberta, backfill e limite por lote",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você decide três coisas sem abrir a documentação: qual modo de descoberta de arquivo usar, quando configurar varredura de recuperação periódica, e qual limite por micro-lote evita que uma recarga de três anos de histórico derrube o job.\n\nO Auto Loader tem **dois modos de descoberta**: `directory listing`, que é o padrão, e `file notification`, que a documentação recomenda para a maioria das cargas. Você pode trocar de modo entre reinícios do stream e continua com a garantia de processamento exatamente uma vez. O que nenhum dos dois garante é **ordem**: a doc avisa que o Auto Loader não garante a ordem em que os arquivos são descobertos nem processados, em modo nenhum.",
                },
                {
                    type: "table",
                    value: '[["Aspecto", "directory listing", "file notification clássico", "file notification com file events"], ["Como descobre", "lista o diretório de entrada", "fila de notificação por stream", "uma fila por external location"], ["Recurso criado na nuvem", "nenhum, só chamada de LIST", "serviço de assinatura e fila, pelo próprio Auto Loader", "assinatura gerenciada pela Databricks"], ["Permissão para subir", "só acesso ao dado no storage", "criar e usar fila, tópico e notificação do bucket", "file events ligado na external location"], ["Teto por bucket", "não cria fila, não tem teto", "100 pipelines por bucket S3", "não cria fila por stream"], ["Varredura de recuperação", "só se você configurar", "só se você configurar", "automática, a cada 24 horas"], ["Opção que liga", "é o padrão, nada a ligar", "cloudFiles.useNotifications", "cloudFiles.useManagedFileEvents"]]',
                },
                {
                    type: "text",
                    value: "O custo de recurso de cada modo é pergunta de prova. No modo clássico de notificação, o Auto Loader cria sozinho um serviço de assinatura e um de fila na **sua** conta de nuvem: no S3 são **SNS e SQS**, no ADLS e no Blob Storage são **Event Grid e Queue Storage**, no GCS é **Pub/Sub** nas duas pontas. Os recursos nascem com o prefixo `databricks-auto-ingest` no S3 e no GCS, e `databricks` no Azure. O teto documentado é de 100 pipelines de notificação simultâneos por bucket S3, 100 por bucket GCS e 500 por conta de armazenamento no Azure, onde teto significa quantos pipelines de notificação podem ser lançados ao mesmo tempo. Estourar esse teto é o motivo mais comum para migrar para file events, que usa uma fila por external location em vez de uma fila por stream.\n\nO `directory listing` não cria recurso nenhum, e é exatamente aí que está o custo dele: **chamada de API LIST**. Cada chamada devolve no máximo 1000 resultados no S3, 5000 no ADLS e 1024 no GCS, e com gatilho contínuo como `Trigger.ProcessingTime` o modo fica listando o diretório inteiro sem parar, o que a doc aponta como aumento significativo do custo de LIST. A listagem incremental, aquela que aproveitava ordem lexical dos nomes, está **deprecada**.",
                },
                {
                    type: "code",
                    value: '# Descoberta por notificação com file events: nada de fila por stream\n(spark.readStream\n  .format("cloudFiles")\n  .option("cloudFiles.format", "json")\n  .option("cloudFiles.useManagedFileEvents", "true")\n  .option("cloudFiles.schemaLocation", "/Volumes/prod/ops/esquemas/pedidos")\n  .load("/Volumes/prod/raw/pedidos")\n  .writeStream\n  .option("checkpointLocation", "/Volumes/prod/ops/ckpt/pedidos")\n  .trigger(availableNow=True)\n  .toTable("prod.bronze.pedidos"))',
                },
                {
                    type: "text",
                    value: "Sistema de notificação de nuvem entrega evento **pelo menos uma vez**, e mesmo assim um arquivo pode escapar. A doc não disfarça: provedor de nuvem não garante entrega de 100% dos eventos de arquivo e não oferece SLA estrito de latência. O remédio é a varredura de recuperação, configurada em `cloudFiles.backfillInterval` com uma string de duração como `1 day` ou `1 week`. **Não existe valor padrão**, ou seja, em `directory listing` e no modo clássico de notificação o backfill só roda se você configurar.\n\nO que a prova cobra sobre esse backfill:\n\n- é **assíncrono**, roda em segundo plano e não bloqueia o micro-lote;\n- é **baseado em tempo**, não em data de arquivo: dispara quando o tempo desde o último backfill passa do intervalo, e esse horário fica no checkpoint. As métricas `lastBackfillStartTimeMs` e `lastBackfillFinishTimeMs` dizem quando foi o último;\n- **não duplica**: ingere só o que não foi processado, conferindo o estado do arquivo no checkpoint;\n- cada backfill é uma **listagem completa** do diretório, então o custo cresce com o número de arquivos na origem, e em modo de listagem ainda vira cobrança de LIST. A recomendação é escolher o maior intervalo que ainda cumpra o seu SLA de completude.\n\nCom file events a opção é **não suportada**. A Databricks faz uma listagem completa quando o file events é habilitado na external location e depois repete a cada 24 horas, aproximadamente, enquanto o stream está ingerindo, e por ser mais barato esse é o caminho indicado em vez do intervalo manual.",
                },
                {
                    type: "quote",
                    value: "Notificação de arquivo entrega pelo menos uma vez, não garante 100% de entrega. Em modo clássico, quem fecha essa lacuna é o `cloudFiles.backfillInterval`, e ele não tem valor padrão.",
                },
                {
                    type: "text",
                    value: "Limite por lote resolve dois problemas opostos: o stream contínuo que não pode atrasar e a recarga histórica que não pode estourar o cluster.\n\n- `cloudFiles.maxFilesPerTrigger` tem padrão de **1000** arquivos por micro-lote e é limite **rígido**.\n- `cloudFiles.maxBytesPerTrigger` não tem padrão e aceita string de byte como `10g`. É limite **flexível**, porque arquivo nunca é dividido entre micro-lotes: a doc dá o exemplo de arquivos de 3 GB com o limite em `10g`, caso em que a Databricks processa 12 GB em um micro-lote.\n- Com as duas juntas, vale o **limite menor**, aquele que for atingido primeiro.\n- Nenhuma das duas tem efeito com `Trigger.Once()`, que está deprecado. E no Databricks Runtime 18.0 e acima o `cloudFiles.maxFilesPerTrigger` passa a ser configurado dinamicamente, sem precisar de valor na mão.",
                },
                {
                    type: "text",
                    value: "Numa recarga grande o gatilho importa tanto quanto o limite. Com `Trigger.AvailableNow`, o Auto Loader processa todos os arquivos que chegaram antes do início da consulta e **ignora** os que chegarem depois, até o próximo disparo. A descoberta roda de forma assíncrona em relação ao processamento, e o dado é fatiado em vários micro-lotes com limitação de taxa. É esse conjunto que transforma três anos de arquivo numa fila de lotes de tamanho previsível, em vez de um lote único que não cabe na memória. O mesmo vale para o estado: com volume muito alto, `cloudFiles.maxFileAge` expira evento antigo para o estado do checkpoint não crescer sem limite, com mínimo aceito de `14 days`.",
                },
                {
                    type: "code",
                    value: '# Recarga histórica: lote previsível, fim definido e rede de segurança diária\n(spark.readStream\n  .format("cloudFiles")\n  .option("cloudFiles.format", "parquet")\n  .option("cloudFiles.maxFilesPerTrigger", "2000")\n  .option("cloudFiles.maxBytesPerTrigger", "10g")\n  .option("cloudFiles.backfillInterval", "1 day")\n  .option("cloudFiles.schemaLocation", "/Volumes/prod/ops/esquemas/eventos")\n  .load("s3://lake-raw/eventos/")\n  .writeStream\n  .option("checkpointLocation", "/Volumes/prod/ops/ckpt/eventos")\n  .trigger(availableNow=True)\n  .toTable("prod.bronze.eventos"))',
                },
            ],
            questions: [
                {
                    statement:
                        "Um time sobe um stream do Auto Loader sem configurar nenhuma opção de descoberta. Como os arquivos novos passam a ser encontrados?",
                    difficulty: "facil",
                    explanation:
                        "O padrão do Auto Loader é directory listing, que lista o diretório de entrada e não precisa de permissão extra. File notification é o modo recomendado pela doc, mas não é o padrão: ele precisa ser ligado por opção.",
                    options: [
                        {
                            text: "Por `directory listing`, o padrão, que acha arquivo listando o diretório de entrada",
                            isCorrect: true,
                        },
                        {
                            text: "Por `file notification`, o padrão, que acha arquivo lendo a fila de evento da nuvem",
                            isCorrect: false,
                        },
                        {
                            text: "Por file events, o padrão quando a origem fica dentro de uma external location do UC",
                            isCorrect: false,
                        },
                        {
                            text: "Por gatilho de chegada de arquivo do job, que acorda o stream a cada objeto novo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No modo clássico de notificação sobre um bucket S3, quais recursos o Auto Loader cria e qual é o teto documentado?",
                    difficulty: "medio",
                    explanation:
                        "A doc lista SNS como serviço de assinatura e SQS como fila, criados com o prefixo databricks-auto-ingest, e teto de 100 pipelines de notificação simultâneos por bucket S3. O teto de 500 é do Azure, por conta de armazenamento, não do S3.",
                    options: [
                        {
                            text: "Um tópico SNS e uma fila SQS com prefixo `databricks-auto-ingest`, com teto de 100 por bucket",
                            isCorrect: true,
                        },
                        {
                            text: "Uma fila SQS por micro-lote com prefixo `databricks-auto-ingest`, com teto de 1000 por bucket",
                            isCorrect: false,
                        },
                        {
                            text: "Um tópico SNS e uma fila SQS com prefixo `databricks-events`, com teto de 500 por bucket",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum recurso na sua conta, porque a fila fica na conta da Databricks, com teto por workspace",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pipeline usa file notification com file events habilitado na external location e o time quer garantia de completude. O que fazer com `cloudFiles.backfillInterval`?",
                    difficulty: "dificil",
                    explanation:
                        "Com file events a opção é não suportada: a Databricks faz listagem completa ao habilitar o file events e repete a cada 24 horas, aproximadamente, enquanto o stream ingere. Configurar o intervalo é o certo no modo clássico, não neste.",
                    options: [
                        {
                            text: "Nada: a opção não é suportada com file events, que já faz a relistagem a cada 24 horas",
                            isCorrect: true,
                        },
                        {
                            text: "Ajustar para `1 day`, porque com file events não existe nenhuma listagem automática depois",
                            isCorrect: false,
                        },
                        {
                            text: "Ajustar para `1 hour`, porque com file events o backfill é o que mantém a fila sincronizada",
                            isCorrect: false,
                        },
                        {
                            text: "Ajustar para `14 days`, que é o mínimo aceito pela opção quando o stream usa file events",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um stream define `cloudFiles.maxFilesPerTrigger` em 500 e `cloudFiles.maxBytesPerTrigger` em `10g`, e cada arquivo da origem tem 3 GB. O que acontece em um micro-lote?",
                    difficulty: "medio",
                    explanation:
                        "Vale o limite atingido primeiro, e o de byte é flexível porque arquivo não é dividido entre micro-lotes: com arquivos de 3 GB e limite de 10g a doc diz que a Databricks processa 12 GB. Não existe precedência fixa de uma opção sobre a outra.",
                    options: [
                        {
                            text: "Para no primeiro limite atingido e processa 12 GB, porque o limite de byte é flexível",
                            isCorrect: true,
                        },
                        {
                            text: "Para exatamente em 10 GB, porque o limite de byte é rígido e corta o lote no número exato",
                            isCorrect: false,
                        },
                        {
                            text: "Processa os 500 arquivos, porque o limite de arquivo tem precedência sobre o de byte",
                            isCorrect: false,
                        },
                        {
                            text: "Divide o quarto arquivo em duas partes, porque o limite de byte não pode ser excedido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma recarga de três anos de arquivos roda com `Trigger.AvailableNow` e `cloudFiles.maxFilesPerTrigger` em 2000. Qual é o comportamento esperado?",
                    difficulty: "dificil",
                    explanation:
                        "AvailableNow processa todos os arquivos que chegaram antes do início da consulta, em vários micro-lotes com limitação de taxa, e ignora o que chega depois até o próximo disparo. O limite configurado continua valendo, ele não é anulado pelo gatilho.",
                    options: [
                        {
                            text: "Vários micro-lotes de até 2000 arquivos, e o que chegar após o início fica para o próximo disparo",
                            isCorrect: true,
                        },
                        {
                            text: "Um único micro-lote com tudo, porque `AvailableNow` desliga a limitação de taxa do stream",
                            isCorrect: false,
                        },
                        {
                            text: "Vários micro-lotes de até 2000 arquivos, e o que chegar durante a execução entra no mesmo disparo",
                            isCorrect: false,
                        },
                        {
                            text: "Vários micro-lotes de até 1000 arquivos, porque o padrão prevalece sobre o valor configurado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Schema em produção: dica, evolução e dado resgatado",
            blocks: [
                {
                    type: "text",
                    value: "Esta aula responde a pergunta do plantão das três da manhã: entrou uma coluna nova no JSON da origem, o stream morreu com `UnknownFieldException`, e alguém quer saber se é bug. Não é, é o modo de evolução padrão cumprindo o que promete. No fim você escolhe entre dica de schema, evolução e resgate sabendo o que cada um faz com a coluna que apareceu sem avisar.",
                },
                {
                    type: "text",
                    value: "A inferência olha uma amostra, não a origem inteira: **os primeiros 50 GB ou 1000 arquivos descobertos, o que for atingido primeiro**. O resultado vai para um diretório `_schemas` dentro do `cloudFiles.schemaLocation`, que é onde o histórico de mudança de schema fica guardado ao longo do tempo. O tamanho da amostra se muda com duas configurações SQL, `spark.databricks.cloudFiles.schemaInference.sampleSize.numBytes` e a irmã `...numFiles`.\n\nA inferência é conservadora de propósito, para evitar problema de evolução por divergência de tipo. Em formato que não codifica tipo, como JSON, CSV e XML, **toda coluna sai como string**, inclusive campo aninhado de JSON. Em Avro e Parquet valem os tipos codificados no arquivo, e quando dois arquivos Parquet discordam do tipo de uma coluna o Auto Loader fica com o tipo mais amplo. Ligar `cloudFiles.inferColumnTypes` com `true` traz o comportamento do `DataFrameReader` do Spark, que escolhe o tipo pela amostra. Em CSV, a inferência assume que o arquivo tem cabeçalho, e sem cabeçalho você precisa passar a opção `header` como `false`.",
                },
                {
                    type: "table",
                    value: '[["Formato", "Tipo inferido por padrão"], ["JSON", "string, inclusive em campo aninhado"], ["CSV", "string, assumindo arquivo com cabeçalho"], ["XML", "string"], ["Avro", "tipos codificados no schema Avro"], ["Parquet", "tipos do Parquet, com o mais amplo em caso de conflito"]]',
                },
                {
                    type: "code",
                    value: "-- Dica de schema: corrige parte do schema e deixa a inferência cuidar do resto\nCREATE OR REFRESH STREAMING TABLE bronze.compras AS\nSELECT * FROM STREAM read_files(\n  '/Volumes/prod/raw/compras',\n  format => 'json',\n  schemaHints => 'date DATE, user_info.dob DATE, purchase_options MAP<STRING,STRING>, time TIMESTAMP',\n  schemaEvolutionMode => 'addNewColumns'\n);",
                },
                {
                    type: "text",
                    value: "`cloudFiles.schemaHints` é **dica, não schema**. Ele corrige subconjuntos do schema inferido com sintaxe SQL de schema, e só vale quando você não fornece o schema completo. Serve para três coisas que aparecem direto na prática: fixar o tipo de uma coluna que nasceria string, acertar campo aninhado com caminho pontuado como `user_info.dob DATE`, e **adicionar ao schema uma coluna que ainda não apareceu** no começo do stream. Dica para `array` e `map` existe desde o Databricks Runtime 9.1 LTS.\n\nA diferença que a prova explora é esta: dica atua na inferência, modo de evolução atua na chegada de coluna nova. Dica não impede o stream de falhar quando aparece coluna fora do schema, e modo de evolução não conserta tipo errado de coluna que já existe.",
                },
                {
                    type: "table",
                    value: '[["Modo de evolução", "O que acontece com coluna nova", "Evolui o schema?"], ["addNewColumns, padrão sem schema", "adiciona a coluna e falha com UnknownFieldException; reinício retoma", "sim"], ["addNewColumnsWithTypeWidening", "igual ao padrão e ainda alarga tipo, por exemplo int para long", "sim"], ["rescue", "coluna nova vai para a coluna de dado resgatado e o stream não falha", "não"], ["failOnNewColumns", "falha e não reinicia até você atualizar o schema ou tirar o arquivo", "não"], ["none, padrão com schema", "coluna nova é ignorada e nada é resgatado, a menos que rescuedDataColumn esteja definido", "não"]]',
                },
                {
                    type: "text",
                    value: "O padrão depende de você ter fornecido schema: **sem schema o padrão é `addNewColumns`, com schema é `none`**. No `addNewColumns`, o Auto Loader infere o schema no micro-lote mais recente, acrescenta a coluna nova no fim do schema e só então o stream falha com `UnknownFieldException`. No reinício ele já roda com o schema atualizado. Tipo de coluna que já existia não evolui nesse modo. Por isso a doc recomenda configurar stream de Auto Loader com o Lakeflow Jobs, para o reinício ser automático em vez de chamada de plantão.\n\nO modo `rescue` é o oposto por desenho: ele **nunca evolui o schema** e o stream não falha por mudança de schema. A coluna nova não entra na tabela, ela é registrada na coluna de dado resgatado. Isso é contrato, não limitação: o schema do destino fica estável e o dado que não encaixa fica guardado para alguém decidir depois. Quem precisa que a tabela acompanhe a origem usa `addNewColumns` e paga o preço do reinício. Já o `failOnNewColumns` não atualiza nada sozinho: ele para e só volta quando você muda o schema fornecido ou remove o arquivo ofensor.",
                },
                {
                    type: "quote",
                    value: "O modo `rescue` nunca evolui o schema e o stream não falha por mudança de schema: coluna nova vira conteúdo da coluna de dado resgatado, não coluna da tabela.",
                },
                {
                    type: "text",
                    value: "A coluna de dado resgatado se chama `_rescued_data` por padrão, vem **habilitada por padrão no Auto Loader**, e pode ser renomeada pela opção `rescuedDataColumn`. Ela guarda um blob JSON com as colunas resgatadas e o caminho do arquivo de origem do registro, e captura três situações: coluna ausente do schema, divergência de tipo e divergência de caixa. Registro formado só por struct vazio em Avro e JSON também é resgatado, porque Parquet proíbe struct sem campo.\n\nEssa coluna muda o comportamento do parser. Os três modos de parser de JSON e CSV são `PERMISSIVE`, `DROPMALFORMED` e `FAILFAST`, e com a coluna de dado resgatado em uso a divergência de tipo **deixa de descartar o registro** no `DROPMALFORMED` e deixa de lançar erro no `FAILFAST`. Só registro corrompido de verdade, como JSON ou CSV incompleto, continua falhando. Em `read_files`, definir `schemaEvolutionMode => 'none'` derruba a coluna de dado resgatado, e o `COPY INTO` não suporta essa coluna.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um stream do Auto Loader lê JSON sem schema declarado e sem definir `cloudFiles.schemaEvolutionMode`. Qual modo está em vigor?",
                    difficulty: "facil",
                    explanation:
                        "Sem schema fornecido o padrão é addNewColumns; o padrão none só vale quando você fornece o schema. Rescue e failOnNewColumns nunca são padrão: os dois precisam ser pedidos de forma explícita na opção.",
                    options: [
                        {
                            text: "`addNewColumns`, que é o padrão quando nenhum schema é fornecido ao Auto Loader",
                            isCorrect: true,
                        },
                        {
                            text: "`none`, que é o padrão sempre que nenhum schema é fornecido na leitura do Auto Loader",
                            isCorrect: false,
                        },
                        {
                            text: "`rescue`, que é o padrão porque a coluna de dado resgatado já vem ligada no Auto Loader",
                            isCorrect: false,
                        },
                        {
                            text: "`failOnNewColumns`, que é o padrão para proteger o schema da tabela de destino",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma coluna nova aparece no JSON de origem e o stream roda em `addNewColumns`. Qual é a sequência correta?",
                    difficulty: "medio",
                    explanation:
                        "No addNewColumns o Auto Loader adiciona as colunas novas ao schema e só então falha com UnknownFieldException; o reinício retoma com o schema atualizado, e por isso a doc recomenda rodar o stream em um job. Ele não ignora a coluna nem segue sem parar.",
                    options: [
                        {
                            text: "Adiciona a coluna ao schema, falha com `UnknownFieldException` e retoma no reinício",
                            isCorrect: true,
                        },
                        {
                            text: "Falha com `UnknownFieldException` sem tocar no schema e exige correção manual do schema",
                            isCorrect: false,
                        },
                        {
                            text: "Adiciona a coluna ao schema e segue processando o micro-lote sem interromper o stream",
                            isCorrect: false,
                        },
                        {
                            text: "Ignora a coluna no micro-lote atual e a incorpora ao schema no próximo disparo do job",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o modo `rescue` é descrito como um modo que não evolui o schema?",
                    difficulty: "dificil",
                    explanation:
                        "Em rescue o Auto Loader nunca evolui o schema e o stream não falha por mudança de schema: a coluna nova é registrada na coluna de dado resgatado. O schema do destino continua estável, e é isso que diferencia rescue de addNewColumns.",
                    options: [
                        {
                            text: "Porque ele nunca altera o schema e sempre manda a coluna nova para o dado resgatado",
                            isCorrect: true,
                        },
                        {
                            text: "Porque ele adia a alteração do schema para o próximo reinício programado do stream",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ele altera o schema apenas quando a coluna aparece em todos os arquivos do lote",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ele exige schema fornecido na leitura e por isso não tem o que evoluir ali",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um campo de data chega como string na inferência e o time quer o tipo certo sem declarar o schema inteiro. Qual recurso resolve?",
                    difficulty: "medio",
                    explanation:
                        "schemaHints corrige subconjuntos do schema inferido com sintaxe SQL de schema, inclusive campo aninhado, e serve até para declarar coluna que ainda não apareceu. inferColumnTypes muda a estratégia de inferência inteira, não corrige uma coluna específica.",
                    options: [
                        {
                            text: "`cloudFiles.schemaHints`, que corrige subconjuntos do schema inferido pelo Auto Loader",
                            isCorrect: true,
                        },
                        {
                            text: "`cloudFiles.inferColumnTypes`, que corrige subconjuntos do schema inferido pelo Auto Loader",
                            isCorrect: false,
                        },
                        {
                            text: "`cloudFiles.schemaEvolutionMode`, que redefine o tipo das colunas já presentes no schema",
                            isCorrect: false,
                        },
                        {
                            text: "`cloudFiles.rescuedDataColumn`, que reescreve o tipo da coluna ao gravar na tabela Delta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um fluxo lê JSON em modo `FAILFAST` com a coluna de dado resgatado em uso. Um registro traz um número onde o schema espera data. O que acontece?",
                    difficulty: "dificil",
                    explanation:
                        "Com a coluna de dado resgatado em uso, divergência de tipo deixa de lançar erro em FAILFAST e deixa de descartar registro em DROPMALFORMED: o valor vai para a coluna de resgate. Só registro corrompido de verdade, como JSON incompleto, continua falhando.",
                    options: [
                        {
                            text: "O registro passa e o valor vai para a coluna de resgate, sem erro no parser do JSON",
                            isCorrect: true,
                        },
                        {
                            text: "O micro-lote falha na hora, porque `FAILFAST` prevalece sobre a coluna de resgate",
                            isCorrect: false,
                        },
                        {
                            text: "O registro é descartado em silêncio, porque `FAILFAST` age como `DROPMALFORMED` aqui",
                            isCorrect: false,
                        },
                        {
                            text: "O registro passa com a coluna nula, porque o resgate só guarda coluna fora do schema",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "COPY INTO e onde vive a idempotência",
            blocks: [
                {
                    type: "text",
                    value: "Dois caminhos de ingestão leem o mesmo diretório: um stream de Auto Loader e um `COPY INTO` agendado. Alguém corrige o conteúdo de um arquivo já carregado e pergunta qual dos dois vai pegar a correção. A resposta depende de **onde cada caminho guarda o estado de idempotência**, e essa é a pergunta mais recorrente da seção de ingestão da prova.",
                },
                {
                    type: "text",
                    value: "No Auto Loader o estado tem nome e endereço: conforme os arquivos são descobertos, os metadados deles são gravados em um **key-value store escalável, o RocksDB**, dentro da **pasta de checkpoint** do stream. É esse store que garante que o dado é processado exatamente uma vez, e a doc faz questão de dizer que você não mantém estado nenhum à mão para ter tolerância a falha.\n\nTrês consequências práticas disso:\n\n- a pasta de checkpoint **não pode ficar sob política de ciclo de vida** do storage. Se os arquivos do checkpoint forem limpos pela política, o estado do stream corrompe e você tem de reiniciar o stream do zero;\n- trocar o caminho do checkpoint num reinício significa, nas palavras da doc, **abandonar o stream anterior e começar um novo**, com toda a origem para descobrir de novo;\n- em volume muito alto, `cloudFiles.maxFileAge` expira evento de arquivo antigo para o estado não crescer sem limite. O mínimo aceito é `14 days`, a doc sugere algo conservador como 90 dias, e apertar demais causa ingestão duplicada ou arquivo não processado.",
                },
                {
                    type: "table",
                    value: '[["Pergunta", "Auto Loader", "COPY INTO"], ["Onde vive o estado", "RocksDB na pasta de checkpoint do stream", "a doc não nomeia o local, só garante que o já carregado é pulado"], ["Garantia declarada", "processamento exatamente uma vez", "operação retentável e idempotente"], ["Arquivo alterado depois de carregado", "cloudFiles.allowOverwrites controla, padrão false", "continua pulado, mesmo tendo sido modificado"], ["Como forçar reprocessamento", "checkpoint novo, ou full refresh da streaming table", "COPY_OPTIONS com force igual a true"], ["Coluna de dado resgatado", "habilitada por padrão", "não suportada"], ["Escala citada pela doc", "bilhões de arquivos, milhões por hora", "a doc indica streaming table para carga mais escalável"]]',
                },
                {
                    type: "code",
                    value: "-- Carga de um lote que chegou por transferência, com filtro de caminho\nCOPY INTO prod.bronze.faturas\nFROM '/Volumes/prod/raw/faturas'\nFILEFORMAT = JSON\nPATTERN = '2026/10/*/*.json'\nFORMAT_OPTIONS ('multiLine' = 'true')\nCOPY_OPTIONS ('mergeSchema' = 'true');",
                },
                {
                    type: "text",
                    value: "O `COPY INTO` não tem checkpoint. Ele é descrito como operação **retentável e idempotente**: arquivo da origem que já foi carregado é pulado nas execuções seguintes. E vem a frase que derruba gente na prova: isso vale **mesmo que o arquivo tenha sido modificado depois de carregado**. Quer dizer que corrigir o conteúdo de um arquivo e rodar o comando de novo não recarrega nada, porque a identidade que conta é o arquivo, não o conteúdo dele.\n\nOutros detalhes que a prova gosta de cobrar:\n\n- `FILES` aceita lista de no máximo **1000 arquivos** e não pode ser usado junto com `PATTERN`;\n- `COPY_OPTIONS ('mergeSchema' = 'true')` deixa o schema evoluir conforme o dado que chega, e é o que permite carregar numa tabela Delta vazia sem declarar coluna;\n- o `VACUUM` limpa arquivos de metadados não referenciados criados pelo `COPY INTO` a partir do Databricks Runtime 15.x;\n- para carga de arquivo mais escalável e robusta, a doc recomenda que quem escreve SQL use streaming table em vez do comando.",
                },
                {
                    type: "quote",
                    value: "O `COPY INTO` pula arquivo já carregado mesmo que ele tenha sido modificado depois: corrigir o conteúdo e rodar o comando de novo não recarrega nada.",
                },
                {
                    type: "text",
                    value: "Reprocessamento forçado existe nos dois caminhos, com preços diferentes.\n\nNo `COPY INTO`, `COPY_OPTIONS ('force' = 'true')` **desliga a idempotência** e carrega os arquivos tenham eles sido carregados antes ou não. O comando insere, não substitui: o que já estava na tabela continua lá. O custo do `force`, então, é dobrado: releitura de todos os arquivos que casam com o filtro, e **linha duplicada** se você não limpar a janela de destino antes.\n\nDo lado do stream, o equivalente é apontar um checkpoint novo, e aí você paga listagem completa da origem mais reprocessamento de tudo que ainda estiver lá. Em pipeline declarativo o botão correspondente é o **full refresh**, que recomputa a tabela e, em streaming table, **reseta estado e informação de checkpoint**. O risco documentado é perder registro: se o dado de origem não existe mais, por exemplo arquivo apagado por política de ciclo de vida ou evento fora da retenção do Kafka, o full refresh produz uma tabela sem esses registros. Para proibir isso numa tabela sensível existe a propriedade `pipelines.reset.allowed` com valor `false`.",
                },
                {
                    type: "code",
                    value: "-- Recarga deliberada de um mês fechado: limpa a janela e desliga a idempotência\nDELETE FROM prod.bronze.faturas WHERE mes_referencia = '2026-09';\n\nCOPY INTO prod.bronze.faturas\nFROM '/Volumes/prod/raw/faturas'\nFILEFORMAT = JSON\nPATTERN = '2026/09/*/*.json'\nCOPY_OPTIONS ('force' = 'true');",
                },
            ],
            questions: [
                {
                    statement:
                        "Onde o Auto Loader guarda a informação que impede o mesmo arquivo de ser ingerido duas vezes?",
                    difficulty: "facil",
                    explanation:
                        "A doc é literal: os metadados dos arquivos descobertos ficam em um key-value store escalável, o RocksDB, dentro da pasta de checkpoint do stream. Não é a tabela de destino nem o schema location que cumprem esse papel.",
                    options: [
                        {
                            text: "Em um store RocksDB dentro da pasta de checkpoint configurada para o stream",
                            isCorrect: true,
                        },
                        {
                            text: "Em uma propriedade da tabela Delta de destino, lida a cada micro-lote do stream",
                            isCorrect: false,
                        },
                        {
                            text: "No diretório `_schemas` dentro do `cloudFiles.schemaLocation` informado no stream",
                            isCorrect: false,
                        },
                        {
                            text: "Na fila de notificação do provedor de nuvem, que retém a mensagem já consumida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um arquivo JSON já carregado por `COPY INTO` é corrigido na origem e o comando roda de novo, com o mesmo filtro e sem opções novas. O que acontece?",
                    difficulty: "medio",
                    explanation:
                        "A doc diz que arquivo já carregado é pulado, e acrescenta que isso vale mesmo que o arquivo tenha sido modificado depois. Sem force a correção não entra, e mergeSchema cuida de schema, não de idempotência.",
                    options: [
                        {
                            text: "O arquivo é pulado, porque arquivo já carregado fica pulado mesmo após mudança",
                            isCorrect: true,
                        },
                        {
                            text: "O arquivo é recarregado, porque a verificação compara o conteúdo e vê a diferença",
                            isCorrect: false,
                        },
                        {
                            text: "O arquivo é recarregado, porque a modificação muda a data e invalida o registro",
                            isCorrect: false,
                        },
                        {
                            text: "O comando falha com conflito, porque o arquivo tem registro de carga anterior",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o efeito de rodar `COPY INTO` com `COPY_OPTIONS ('force' = 'true')` sobre uma janela já carregada?",
                    difficulty: "medio",
                    explanation:
                        "Force desliga a idempotência e carrega os arquivos tenham sido carregados antes ou não. Como COPY INTO insere, o conteúdo anterior permanece, e o resultado é linha duplicada se a janela de destino não for limpa primeiro.",
                    options: [
                        {
                            text: "A idempotência é desligada e as linhas entram de novo, somando ao que já existia",
                            isCorrect: true,
                        },
                        {
                            text: "A idempotência é desligada e as linhas entram substituindo o que já existia na janela",
                            isCorrect: false,
                        },
                        {
                            text: "A tabela é truncada antes da carga, o que deixa só a versão mais nova dos arquivos",
                            isCorrect: false,
                        },
                        {
                            text: "Só arquivo alterado desde a última carga volta a ser lido, o que evita duplicar linha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para resolver um incidente, um time reinicia o stream do Auto Loader apontando um caminho de checkpoint novo. Qual é a consequência?",
                    difficulty: "dificil",
                    explanation:
                        "A doc trata troca de checkpoint como abandono do stream anterior e início de um novo: o estado do RocksDB não é herdado, então a origem é descoberta de novo e tudo que ainda estiver lá é reprocessado.",
                    options: [
                        {
                            text: "O stream passa a ser um stream novo e reprocessa o que ainda existir na origem",
                            isCorrect: true,
                        },
                        {
                            text: "O stream herda o estado do checkpoint antigo, já que o schema location não mudou",
                            isCorrect: false,
                        },
                        {
                            text: "O stream continua de onde parou, porque o estado real fica na tabela de destino",
                            isCorrect: false,
                        },
                        {
                            text: "O stream falha ao subir, porque a pasta de checkpoint nova está sem o estado dele",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma streaming table recebe full refresh, mas parte dos arquivos de origem já foi apagada por política de ciclo de vida. Qual é o resultado documentado?",
                    difficulty: "dificil",
                    explanation:
                        "Full refresh reseta estado e checkpoint e reprocessa a partir da origem; o que não existe mais na origem não volta, e os registros correspondentes ficam fora da tabela. Para proibir o full refresh em tabela sensível existe pipelines.reset.allowed igual a false.",
                    options: [
                        {
                            text: "A tabela é recomputada sem os registros cujos arquivos de origem não existem mais",
                            isCorrect: true,
                        },
                        {
                            text: "A tabela é recomputada a partir do histórico da própria tabela Delta de destino",
                            isCorrect: false,
                        },
                        {
                            text: "O full refresh é bloqueado automaticamente quando detecta origem incompleta",
                            isCorrect: false,
                        },
                        {
                            text: "A tabela mantém os registros antigos e só recomputa a parte ainda presente na origem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Expectations: avisar, descartar e pôr em quarentena",
            blocks: [
                {
                    type: "text",
                    value: "Expectation é cláusula opcional dentro da declaração de uma materialized view, de uma streaming table ou de uma view de pipeline, e aplica a checagem em **cada registro que passa pela consulta**. Esta aula fecha três decisões: qual das três ações usar, como montar quarentena quando nenhuma das três serve, e onde achar a métrica de qualidade depois que o pipeline rodou.\n\nToda expectation tem três partes: um **nome**, que precisa ser único dentro do dataset e é por onde a métrica aparece, uma **restrição** booleana em SQL, e uma **ação** para o registro inválido. A restrição tem de ser SQL válido e não pode conter função Python própria, chamada a serviço externo nem subconsulta referenciando outra tabela.",
                },
                {
                    type: "table",
                    value: '[["Ação", "Sintaxe SQL", "Sintaxe Python", "Registro inválido", "Registra métrica?"], ["warn, o padrão", "EXPECT (...)", "dp.expect", "é gravado no destino", "sim"], ["drop", "EXPECT (...) ON VIOLATION DROP ROW", "dp.expect_or_drop", "é descartado antes da escrita", "sim, com a contagem de descarte"], ["fail", "EXPECT (...) ON VIOLATION FAIL UPDATE", "dp.expect_or_fail", "impede a atualização de concluir", "não, porque a atualização falha"]]',
                },
                {
                    type: "code",
                    value: "-- Três restrições independentes, cada uma com a sua ação e o seu nome no log\nCREATE OR REFRESH STREAMING TABLE silver.pedidos (\n  CONSTRAINT valor_nao_negativo EXPECT (valor_total >= 0),\n  CONSTRAINT cliente_informado EXPECT (cliente_id IS NOT NULL) ON VIOLATION DROP ROW,\n  CONSTRAINT data_plausivel EXPECT (data_pedido <= current_date()) ON VIOLATION FAIL UPDATE\n)\nAS SELECT * FROM STREAM(bronze.pedidos);",
                },
                {
                    type: "text",
                    value: "Várias restrições independentes convivem no mesmo dataset, e cada uma tem a sua ação. Em SQL elas são **separadas por vírgula** dentro dos parênteses da declaração. Em Python cada uma é um decorador empilhado sobre a função. A diferença que a prova cobra: **só Python permite agrupar** várias expectations e dar uma ação coletiva, com `expect_all`, `expect_all_or_drop` e `expect_all_or_fail`, que recebem um dicionário de nome para restrição e podem ser reaproveitados em mais de um dataset do pipeline.\n\nNa ação `fail`, se a operação for atualização de tabela o sistema **desfaz a transação de forma atômica**. Em pipeline acionado por gatilho, a falha de um fluxo não derruba os outros fluxos paralelos; em pipeline contínuo, ela para o fluxo e os dependentes, e o pipeline emite a mensagem explicando por quê. Não existe nova tentativa automática: a doc diz que você precisa corrigir o código do pipeline antes de rodar de novo. A mensagem de erro `EXPECTATION_VIOLATION` traz o nome da expectation violada e o registro de entrada, o que dispensa caçar a linha culpada na mão.",
                },
                {
                    type: "quote",
                    value: "Sem `ON VIOLATION`, a ação é `warn`: o registro inválido é gravado no destino e você fica apenas com a métrica. Quem precisa barrar o registro escolhe `DROP ROW` ou `FAIL UPDATE`.",
                },
                {
                    type: "text",
                    value: "Quando nem gravar nem descartar serve, o padrão é **quarentena feita à mão**, porque não existe ação nativa de quarentena. A receita da doc junta expectation com tabela temporária e views: você mantém o registro, marca a validade em uma coluna booleana derivada da negação das regras, particiona a tabela por essa coluna e expõe duas views, uma de válidos e outra de inválidos. Como a ação continua sendo `warn`, as métricas seguem sendo coletadas, e o dado inválido fica disponível em vez de desaparecer.",
                },
                {
                    type: "code",
                    value: 'from pyspark import pipelines as dp\nfrom pyspark.sql.functions import expr\n\nregras = {\n    "cep_origem_valido": "(cep_origem IS NOT NULL)",\n    "cep_destino_valido": "(cep_destino IS NOT NULL)",\n}\nregras_quarentena = "NOT({0})".format(" AND ".join(regras.values()))\n\n@dp.view\ndef corridas_cru():\n    return spark.readStream.table("bronze.corridas")\n\n@dp.table(temporary=True, partition_cols=["em_quarentena"])\n@dp.expect_all(regras)\ndef corridas_quarentena():\n    return (spark.readStream.table("corridas_cru")\n            .withColumn("em_quarentena", expr(regras_quarentena)))\n\n@dp.view\ndef corridas_validas():\n    return spark.read.table("corridas_quarentena").filter("em_quarentena=false")\n\n@dp.view\ndef corridas_invalidas():\n    return spark.read.table("corridas_quarentena").filter("em_quarentena=true")',
                },
                {
                    type: "text",
                    value: "Em SQL a mesma quarentena vira uma `CREATE OR REFRESH TEMPORARY STREAMING TABLE` com `PARTITIONED BY (em_quarentena)` e a coluna calculada no `SELECT`. Aqui aparece uma escolha de desenho que a doc mostra lado a lado: ou você **junta as regras em uma restrição só**, e fica com um nome único no log de eventos, ou **mantém uma restrição por coluna**, e fica com uma entrada por nome. A segunda forma custa mais linhas de declaração e entrega diagnóstico por campo, que é o que você quer quando o dado chega sujo de fontes diferentes.",
                },
                {
                    type: "text",
                    value: "A métrica de qualidade aparece em dois lugares. Na interface, em **Jobs & Pipelines**, abrindo o pipeline, clicando no dataset e indo na aba **Data quality** da barra lateral. Em pipeline SQL autônomo essa aba não existe, e aí só resta o log de eventos.\n\nNo log, a contagem por expectation fica em `details:flow_progress.data_quality.expectations`, com os campos `name`, `dataset`, `passed_records` e `failed_records`, e o total descartado fica em `details:flow_progress.data_quality.dropped_records`. Lembre dos limites: só `warn` e `drop` registram métrica, apenas streaming table, materialized view e view temporária suportam expectation, um fluxo `COMPLETED` pode não trazer métrica porque ela foi reportada em evento `flow_progress` com status `RUNNING` de cada micro-lote, e nada é registrado se a configuração `pipelines.metrics.flowTimeReporter.enabled` não estiver presente. Vale guardar também que expectation **não é suportada com AUTO CDC FROM SNAPSHOT**.",
                },
                {
                    type: "code",
                    value: "-- Quantos registros passaram e falharam, por dataset e por expectation\nSELECT\n  linha.dataset AS dataset,\n  linha.name AS expectation,\n  SUM(linha.passed_records) AS passaram,\n  SUM(linha.failed_records) AS falharam\nFROM (\n  SELECT EXPLODE(\n    FROM_JSON(\n      details:flow_progress.data_quality.expectations,\n      \"array<struct<name: string, dataset: string, passed_records: int, failed_records: int>>\"\n    )\n  ) AS linha\n  FROM event_log_raw\n  WHERE event_type = 'flow_progress'\n)\nGROUP BY linha.dataset, linha.name;",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma streaming table declara `CONSTRAINT valor_ok EXPECT (valor >= 0)` sem nenhuma cláusula a mais. O que acontece com o registro que tem valor negativo?",
                    difficulty: "facil",
                    explanation:
                        "Sem ON VIOLATION a ação é warn: o registro inválido é gravado no destino e a violação fica só na métrica. Para barrar o registro é preciso escrever DROP ROW, e para derrubar a atualização, FAIL UPDATE.",
                    options: [
                        {
                            text: "É gravado no destino, e a violação aparece apenas na métrica de qualidade",
                            isCorrect: true,
                        },
                        {
                            text: "É descartado antes da escrita, e a contagem de descarte vai para a métrica",
                            isCorrect: false,
                        },
                        {
                            text: "Faz a atualização falhar, e a transação da tabela é desfeita de forma atômica",
                            isCorrect: false,
                        },
                        {
                            text: "É gravado em uma tabela de quarentena criada pelo pipeline automaticamente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pipeline define expectations com as três ações e o time não acha métrica de uma delas no log de eventos. Qual é a explicação documentada?",
                    difficulty: "medio",
                    explanation:
                        "A doc diz que métrica é registrada para warn e drop, e que fail não registra porque a atualização falha. Restrição com fail não produz contagem de passagem e falha, então procurar essa métrica no log não leva a nada.",
                    options: [
                        {
                            text: "A ação `fail` não registra métrica, porque a atualização não chega a concluir",
                            isCorrect: true,
                        },
                        {
                            text: "A ação `drop` não registra métrica, porque o registro sai antes de ser contado",
                            isCorrect: false,
                        },
                        {
                            text: "A ação `warn` não registra métrica, porque o registro inválido segue para o destino",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma das três registra métrica sem uma tabela de monitoramento declarada à parte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um pipeline acionado por gatilho, uma expectation com `ON VIOLATION FAIL UPDATE` é violada em um fluxo. Qual é o efeito nos outros fluxos paralelos?",
                    difficulty: "medio",
                    explanation:
                        "Em pipeline acionado por gatilho a falha de um fluxo não derruba os outros fluxos paralelos; é no pipeline contínuo que o fluxo e os dependentes param. A transação da tabela que falhou é desfeita de forma atômica.",
                    options: [
                        {
                            text: "Os paralelos seguem, e a transação do fluxo que falhou é desfeita de forma atômica",
                            isCorrect: true,
                        },
                        {
                            text: "Os paralelos param juntos, e as transações de todos os fluxos são desfeitas por igual",
                            isCorrect: false,
                        },
                        {
                            text: "Os paralelos seguem, e o fluxo que falhou é repetido automaticamente até passar",
                            isCorrect: false,
                        },
                        {
                            text: "Os paralelos entram em pausa até alguém escolher entre descartar ou gravar o registro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time precisa manter o registro inválido disponível para análise, sem gravá-lo junto do dado bom nem descartá-lo. Qual é o padrão recomendado?",
                    difficulty: "medio",
                    explanation:
                        "Não existe ação nativa de quarentena: a receita é manter a ação warn, marcar a validade em uma coluna derivada da negação das regras, particionar a tabela por essa coluna e expor views de válidos e inválidos. DROP ROW apagaria o registro que se quer analisar.",
                    options: [
                        {
                            text: "Marcar o registro com uma coluna de validade e expor views de válidos e inválidos",
                            isCorrect: true,
                        },
                        {
                            text: "Usar `ON VIOLATION QUARANTINE ROW`, que desvia o registro para a tabela de quarentena",
                            isCorrect: false,
                        },
                        {
                            text: "Usar `ON VIOLATION DROP ROW` e ler os registros perdidos pelo log de eventos depois",
                            isCorrect: false,
                        },
                        {
                            text: "Marcar o registro com coluna de validade e deixar `ON VIOLATION FAIL UPDATE` ativo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em qual campo do log de eventos ficam as contagens de registros que passaram e falharam em cada expectation?",
                    difficulty: "dificil",
                    explanation:
                        "A contagem por expectation fica em details:flow_progress.data_quality.expectations, com name, dataset, passed_records e failed_records. O total de descartados fica no objeto data_quality, em dropped_records, que é outro campo.",
                    options: [
                        {
                            text: "Em `details:flow_progress.data_quality.expectations`, com `passed_records` e `failed_records`",
                            isCorrect: true,
                        },
                        {
                            text: "Em `details:flow_progress.data_quality.dropped_records`, que soma passagem e falha por nome dado",
                            isCorrect: false,
                        },
                        {
                            text: "Em `details:flow_progress.metrics.num_output_rows`, que separa registro válido de inválido",
                            isCorrect: false,
                        },
                        {
                            text: "Em `details:flow_definition.expectations`, declarado junto do plano da consulta do fluxo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "AUTO CDC: histórico, exclusão e evento atrasado",
            blocks: [
                {
                    type: "text",
                    value: "Um feed de mudanças chega com `INSERT`, `UPDATE` e `DELETE` fora de ordem, e o negócio quer saber como estava o cadastro em uma data passada. Escrever isso com `MERGE` à mão dá certo e envelhece mal. O `AUTO CDC` resolve o caso em declaração, e esta aula fecha as cinco decisões que a prova cobra: tipo de histórico, tratamento de exclusão, quais colunas geram versão, o que fazer com evento atrasado e qual é o alvo permitido.",
                },
                {
                    type: "code",
                    value: "CREATE OR REFRESH STREAMING TABLE clientes;\n\nCREATE FLOW clientes_cdc AS AUTO CDC INTO clientes\nFROM STREAM(origem.clientes_cdc)\nKEYS (cliente_id)\nAPPLY AS DELETE WHEN operacao = 'DELETE'\nSEQUENCE BY numero_sequencia\nCOLUMNS * EXCEPT (operacao, numero_sequencia)\nSTORED AS SCD TYPE 2\nTRACK HISTORY ON * EXCEPT (cidade);",
                },
                {
                    type: "text",
                    value: "Comece pelo alvo, que é a parte mais esquecida. A declaração obrigatória é **uma streaming table declarada por você**, e o fluxo de `AUTO CDC` escreve nela: a doc diz, em destaque, que você precisa declarar a streaming table de destino para aplicar as mudanças. Esse alvo é **gerenciado por um único pipeline**: streaming table é possuída e atualizada por um pipeline só, e tabela definida por um pipeline não pode ser alterada nem atualizada por outro. Nada de apontar `AUTO CDC` para uma tabela Delta qualquer que outro processo também escreve.\n\nOutras condições de contorno do alvo e da origem:\n\n- se você especificar o schema do destino em SCD tipo 2, precisa incluir as colunas **`__START_AT` e `__END_AT` com o mesmo tipo de dado do campo de `SEQUENCE BY`**. Registro com `__END_AT` nulo é o que está ativo;\n- a origem tem de ser streaming, lida com a palavra-chave `STREAM`. Se a leitura encontrar alteração ou exclusão de um registro já lido, um erro é lançado, e o caminho seguro é origem estática ou só de inserção;\n- a API de `AUTO CDC` exige pipeline serverless ou nas edições Pro e Advanced, e não existe no Apache Spark Declarative Pipelines.",
                },
                {
                    type: "table",
                    value: '[["Aspecto", "SCD TYPE 1", "SCD TYPE 2"], ["Histórico", "não é retido, a versão nova sobrescreve", "cada versão vira uma linha"], ["Colunas de vigência", "não existem", "__START_AT e __END_AT, ativo quando __END_AT é nulo"], ["APPLY AS DELETE WHEN", "remove o registro do alvo", "encerra a versão e guarda tombstone por um tempo"], ["APPLY AS TRUNCATE WHEN", "suportado", "não suportado"], ["É o padrão de STORED AS?", "sim, o padrão é SCD TYPE 1", "não, precisa ser pedido"]]',
                },
                {
                    type: "text",
                    value: "Exclusão é onde os dois tipos mais se separam. `APPLY AS DELETE WHEN condicao` diz quando um evento do feed deve ser tratado como exclusão em vez de upsert. Em SCD tipo 1 a linha sai do alvo. Em SCD tipo 2, para aguentar dado fora de ordem, **a linha excluída é retida temporariamente como tombstone** na tabela Delta por baixo, e uma **view é criada no metastore filtrando esses tombstones**: é a view que você consulta. A retenção se configura na propriedade de tabela `pipelines.cdc.tombstoneGCThresholdInSeconds`.\n\nJá `APPLY AS TRUNCATE WHEN` dispara truncamento completo do alvo e é **suportado apenas em SCD tipo 1**. Em SCD tipo 2 a operação de truncamento não existe, o que faz sentido: truncar apagaria o histórico que o tipo 2 existe para guardar.",
                },
                {
                    type: "text",
                    value: "`SEQUENCE BY` é cláusula **obrigatória** e define a ordem lógica dos eventos de mudança. É com ela que o processamento lida com evento que chega fora de ordem, e em SCD tipo 1 o efeito é direto: **a atualização atrasada é descartada**. O exemplo da doc é literal, um `UPDATE` com `sequenceNum=5` foi descartado porque um `UPDATE` com `sequenceNum=6` já havia chegado. Nada de a linha corrente ser sobrescrita por uma versão velha que atrasou na fila. Em SCD tipo 2 a mesma sequência decide onde a versão entra no histórico, e é para aguentar dado fora de ordem que a exclusão fica guardada como tombstone por um tempo.\n\nDuas restrições que valem decorar: a coluna de sequência tem de ser de **tipo ordenável** e **valor nulo não é suportado**. Quando uma coluna só não resolve, use uma expressão `STRUCT`, que ordena pelo primeiro campo e usa o segundo como critério de desempate.",
                },
                {
                    type: "quote",
                    value: "`SEQUENCE BY` não reordena o feed, ele julga: em SCD tipo 1, atualização atrasada com número de sequência menor que a já aplicada é descartada.",
                },
                {
                    type: "text",
                    value: "Resta escolher **o que gera versão nova**. Por padrão, SCD tipo 2 cria uma versão a cada mudança em qualquer coluna de saída, o que equivale a `TRACK HISTORY ON *`. Com `TRACK HISTORY ON` você limita o rastreio a um subconjunto, por lista ou por `* EXCEPT (...)`, e mudança em coluna fora do rastreio **atualiza a versão corrente no lugar**, sem gerar linha nova. Então `TRACK HISTORY ON * EXCEPT (cidade)` significa: correção de cidade não polui o histórico, mudança em qualquer outra coluna polui.\n\nNão confunda com `COLUMNS`, que escolhe quais colunas entram no alvo e costuma aparecer como `COLUMNS * EXCEPT (operacao, numero_sequencia)` para tirar os campos de controle do feed. E nem com `IGNORE NULL UPDATES`, que faz coluna com valor nulo preservar o valor existente no alvo, útil em atualização parcial, e que não pode ser combinado com `COLUMNS TO UPDATE`. Em Python as mesmas decisões viram argumentos de `create_auto_cdc_flow`, com `stored_as_scd_type` e `track_history_except_column_list`.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um fluxo de `AUTO CDC INTO` é declarado sem a cláusula `STORED AS`. Que tipo de histórico o alvo passa a ter?",
                    difficulty: "facil",
                    explanation:
                        "O padrão de STORED AS é SCD tipo 1, que não retém histórico: a versão nova sobrescreve a anterior. SCD tipo 2 e bitemporal precisam ser pedidos de forma explícita na cláusula.",
                    options: [
                        {
                            text: "SCD tipo 1, o padrão, em que a versão nova sobrescreve e nada é retido",
                            isCorrect: true,
                        },
                        {
                            text: "SCD tipo 2, o padrão, em que cada mudança gera uma linha de versão nova",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum, porque sem `STORED AS` o fluxo apenas insere e nunca atualiza linha",
                            isCorrect: false,
                        },
                        {
                            text: "Depende do tipo da coluna de `SEQUENCE BY`, que define a estratégia de versão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um alvo em SCD tipo 2 usa `TRACK HISTORY ON * EXCEPT (cidade)`. O cadastro de um cliente muda só a cidade. Qual é o resultado?",
                    difficulty: "medio",
                    explanation:
                        "Coluna fora do rastreio atualiza a versão corrente no lugar, sem gerar linha nova: é exatamente o efeito de excluir cidade do TRACK HISTORY. Mudança em coluna rastreada é que fecha a versão e abre outra.",
                    options: [
                        {
                            text: "A versão corrente é atualizada no próprio lugar, sem gerar linha de histórico",
                            isCorrect: true,
                        },
                        {
                            text: "Uma versão nova é criada, porque em SCD tipo 2 toda mudança gera linha nova",
                            isCorrect: false,
                        },
                        {
                            text: "A mudança é descartada, porque a coluna fora do rastreio não entra no alvo",
                            isCorrect: false,
                        },
                        {
                            text: "A versão corrente é encerrada e o cliente passa a contar como registro excluído",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que `APPLY AS TRUNCATE WHEN` não pode ser usado com `STORED AS SCD TYPE 2`?",
                    difficulty: "medio",
                    explanation:
                        "A doc afirma que APPLY AS TRUNCATE WHEN é suportado apenas em SCD tipo 1, porque o tipo 2 não suporta a operação de truncamento. Quem trata exclusão em tipo 2 é APPLY AS DELETE WHEN, que encerra a versão.",
                    options: [
                        {
                            text: "Porque a cláusula é suportada só em SCD tipo 1, e o tipo 2 não suporta truncamento",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a cláusula exige coluna de sequência numérica, e o tipo 2 aceita qualquer tipo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a cláusula precisa de chave composta, e o tipo 2 trabalha com chave simples",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a cláusula só funciona em alvo sem expectation, e o tipo 2 sempre tem uma",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um alvo em SCD tipo 1, um `UPDATE` com número de sequência 5 chega depois de um `UPDATE` com número 6 já ter sido aplicado na mesma chave. O que o `AUTO CDC` faz?",
                    difficulty: "dificil",
                    explanation:
                        "SEQUENCE BY define a ordem lógica dos eventos e é o que trata chegada fora de ordem: o evento com sequência menor é descartado, como no exemplo da doc em que o update de sequência 5 cai porque o de 6 já chegou.",
                    options: [
                        {
                            text: "Descarta o evento de sequência 5, porque um evento mais novo já foi aplicado",
                            isCorrect: true,
                        },
                        {
                            text: "Aplica o evento de sequência 5, porque a ordem de chegada é o que vale no fluxo",
                            isCorrect: false,
                        },
                        {
                            text: "Aplica o evento de sequência 5 e marca a linha para conferência posterior no log",
                            isCorrect: false,
                        },
                        {
                            text: "Falha o fluxo, porque evento fora de ordem viola a sequência declarada na cláusula",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time declara o schema do alvo de um `AUTO CDC` em SCD tipo 2 e usa um `timestamp` em `SEQUENCE BY`. O que o schema precisa conter?",
                    difficulty: "dificil",
                    explanation:
                        "Ao especificar o schema de um alvo em SCD tipo 2 é obrigatório incluir __START_AT e __END_AT com o mesmo tipo do campo de SEQUENCE BY, aqui timestamp. Registro ativo é o que tem __END_AT nulo, e não existe coluna de versão nomeada à parte.",
                    options: [
                        {
                            text: "As colunas `__START_AT` e `__END_AT` com tipo `timestamp`, igual ao de `SEQUENCE BY`",
                            isCorrect: true,
                        },
                        {
                            text: "As colunas `__START_AT` e `__END_AT` com tipo `bigint`, por serem número de versão",
                            isCorrect: false,
                        },
                        {
                            text: "Uma coluna `__IS_CURRENT` booleana, que o pipeline mantém a cada mudança aplicada",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas a chave de `KEYS`, porque as colunas de vigência são adicionadas pelo pipeline",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Modelagem, compartilhamento e federação",
    aulas: [
        {
            titulo: "Modelagem dimensional no lakehouse",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você decide, com critério de documentação e não de gosto pessoal, entre normalizar a camada gold em terceira forma normal e modelar em estrela, e sabe dizer quando vale puxar um atributo da dimensão para dentro da tabela de fato.\n\nA pergunta parece acadêmica, mas na prova ela chega disfarçada de cenário: alguém descreve uma consulta que junta sete tabelas, reclama de varredura completa e pede a mudança de modelo que resolve. Quem responde por hábito de banco transacional erra, porque o lakehouse cobra pelos joins de um jeito diferente.",
                },
                {
                    type: "text",
                    value: "A recomendação da Databricks é explícita: para um lakehouse novo ou para um conjunto de dados novo, ela recomenda não usar um modelo fortemente normalizado como a terceira forma normal (3NF). Modelos como estrela e floco de neve funcionam bem na plataforma, e a doc dá dois motivos: as consultas padrão fazem menos joins e existem menos chaves para manter em sincronia.\n\nO segundo motivo aparece pouco em material de terceiros e muito na prova. Cada chave que você espalha entre tabelas é uma chave que o seu pipeline precisa atualizar junto. E como chave primária e estrangeira na plataforma são apenas informativas, e não são validadas pelo motor, nada avisa quando uma delas sai de sincronia: o resultado sai errado em silêncio.",
                },
                {
                    type: "table",
                    value: '[["Modelo","Joins na consulta típica","Chaves para manter em sincronia","Data skipping por estatística de arquivo","Posição da doc"],["Terceira forma normal (3NF)","Muitos","Muitas","Pouco aproveitado, o filtro quase sempre cai em outra tabela","Não recomendada para lakehouse novo"],["Floco de neve","Médio, a dimensão vem quebrada em níveis","Médio","Parcial, depende de onde está o atributo filtrado","Funciona bem na plataforma"],["Estrela","Poucos, fato mais dimensões em um nível","Poucas","Bom na dimensão, limitado no fato","Funciona bem na plataforma"],["Fato alargado por desnormalização","Nenhum para o atributo trazido","Nenhuma para o atributo trazido","Melhor caso, o filtro cai na própria tabela","Citada como ganho de skipping"]]',
                },
                {
                    type: "text",
                    value: "O vocabulário importa porque a prova usa os termos sem explicar. Fato é a tabela do evento: uma linha por ocorrência do processo de negócio, com as medidas numéricas que se somam e com as chaves que apontam para o contexto. Dimensão é a tabela do contexto: uma linha por entidade, com os atributos pelos quais o usuário filtra e agrupa. O grão do fato é a definição do que uma linha representa, e é a primeira decisão do projeto, porque trocar o grão depois significa recarregar a tabela inteira.\n\nA doc da arquitetura medallion encaixa isso na camada gold, descrita como o lugar onde você modela o dado para relatório e análise usando um modelo dimensional, estabelecendo relações e definindo medidas. A função listada para a camada é, literalmente, modelagem dimensional e agregação. A página de conceitos de data warehouse completa o desenho: o data warehouse é modelado na camada silver e alimenta data marts especializados na gold, e data mart é definido como modelo dimensional na forma de um conjunto de tabelas relacionadas. A mesma doc diz que é comum começar a modelagem já na silver e que alguns clientes criam mais de uma camada gold.",
                },
                {
                    type: "text",
                    value: "Desnormalizar não é preguiça, é uma troca que a doc justifica pelo otimizador. Ter mais campos de dado em uma única tabela permite que o otimizador de consulta descarte grandes volumes de dado usando as estatísticas de nível de arquivo. O outro lado do mesmo argumento está na mesma página: o otimizador tem dificuldade com consultas que juntam muitas tabelas, e quando o filtro se aplica a um campo que está em outra tabela ele pode não conseguir descartar registro nenhum, o que leva à varredura completa.\n\nDaí sai o critério prático. Se o filtro que de fato recorta as consultas vive em um atributo da dimensão e o fato é grande, trazer esse atributo para o fato troca join por poda de arquivo. Se o atributo muda com frequência, o preço é reescrever muitas linhas do fato a cada mudança, e a dimensão separada volta a ganhar. O guia de preparo de dado para BI acrescenta duas restrições antes de alargar a tabela: evite tipo de dado largo e coluna de cardinalidade alta, e aplique liquid clustering nas tabelas grandes de acordo com o padrão de filtro.",
                },
                {
                    type: "code",
                    value: "-- Dimensão e fato da gold, com as chaves declaradas como informativas\nCREATE TABLE vendas.gold.dim_produto (\n  sk_produto  BIGINT NOT NULL,\n  id_produto  STRING NOT NULL,\n  nome        STRING,\n  categoria   STRING,\n  CONSTRAINT pk_dim_produto PRIMARY KEY (sk_produto) RELY\n);\n\nCREATE TABLE vendas.gold.fato_venda (\n  sk_venda    BIGINT NOT NULL,\n  sk_produto  BIGINT,\n  sk_loja     BIGINT,\n  data_venda  DATE,\n  quantidade  INT,\n  valor       DECIMAL(18,2),\n  CONSTRAINT pk_fato_venda PRIMARY KEY (sk_venda) RELY,\n  CONSTRAINT fk_fato_produto FOREIGN KEY (sk_produto)\n    REFERENCES vendas.gold.dim_produto RELY\n);\n\n-- Mesma declaração em tabela que já existe\nALTER TABLE vendas.gold.dim_loja\n  ADD CONSTRAINT pk_dim_loja PRIMARY KEY (sk_loja) RELY;\n\nALTER TABLE vendas.gold.fato_venda\n  ADD CONSTRAINT fk_fato_loja FOREIGN KEY (sk_loja)\n  REFERENCES vendas.gold.dim_loja;",
                },
                {
                    type: "text",
                    value: "Declarar a chave não valida nada, mas pode acelerar, e a doc é dura nos dois lados. De um lado, chave primária, estrangeira e unique são apenas informativas e não são validadas: elas definem a relação entre campos das tabelas, não são verificação do dado inserido. De outro, a opção RELY permite que a Databricks explore a restrição para reescrever consultas.\n\nDois exemplos estão na doc. Em um SELECT DISTINCT sobre coluna que é chave primária com RELY, todos os valores já são únicos, então o otimizador pode pular a operação de DISTINCT. Em um outer join de fato com dimensão feito pela chave primária da dimensão, cada linha do fato casa com no máximo uma linha da dimensão e o outer join preserva todas as linhas do fato, então o otimizador pode remover o join e a soma continua igual.\n\nO padrão é NORELY, as otimizações de RELY exigem compute com Photon habilitado, e o aviso vem junto: confiar em uma restrição que não é satisfeita pode levar a resultado de consulta incorreto. Na prática, RELY é uma promessa sua. Se o pipeline deixar duplicata entrar na dimensão, a consulta devolve número errado sem erro nenhum.",
                },
                {
                    type: "table",
                    value: '[["Restrição","RELY disponível a partir de","O que o otimizador pode fazer","Requisito de compute"],["PRIMARY KEY","Databricks Runtime 14.2","Pular DISTINCT e eliminar o join com a dimensão","Compute com Photon"],["FOREIGN KEY","Databricks Runtime 15.4","Eliminar join quando a referência garante no máximo uma linha","Compute com Photon"],["UNIQUE","Databricks Runtime 18.2","Simplificar DISTINCT e eliminar inner join","Compute com Photon"]]',
                },
                {
                    type: "quote",
                    value: "Chave primária e estrangeira na Databricks são informativas e não são validadas pelo motor. Declarar RELY passa para o seu pipeline a obrigação de que elas sejam verdadeiras, e confiar em restrição não satisfeita pode levar a resultado de consulta incorreto.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma equipe vai desenhar a camada gold de um lakehouse novo e discute o modelo de dados. Qual é a recomendação da documentação da Databricks?",
                    difficulty: "facil",
                    explanation:
                        "A doc recomenda não usar modelo fortemente normalizado como 3NF, e diz que estrela e floco de neve funcionam bem porque exigem menos joins e menos chaves em sincronia. Adotar 3NF é a armadilha, porque é o reflexo de quem vem de banco transacional.",
                    options: [
                        {
                            text: "Evitar modelo fortemente normalizado como 3NF, porque estrela e floco de neve fazem menos joins e têm menos chaves para sincronizar.",
                            isCorrect: true,
                        },
                        {
                            text: "Adotar terceira forma normal, porque reduzir redundância diminui o custo de armazenamento e evita divergência entre as tabelas.",
                            isCorrect: false,
                        },
                        {
                            text: "Adotar terceira forma normal, porque o otimizador resolve join melhor do que varredura de tabela larga em formato colunar.",
                            isCorrect: false,
                        },
                        {
                            text: "Evitar qualquer relação entre tabelas e manter uma única tabela por domínio de negócio, porque Delta Lake não aceita declaração de chave estrangeira.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a documentação diz que colocar mais campos de dado em uma única tabela ajuda a performance das consultas da gold?",
                    difficulty: "medio",
                    explanation:
                        "A doc liga tabela mais larga a data skipping: com mais campos na mesma tabela, o otimizador descarta grandes volumes usando estatística de nível de arquivo. Formato colunar e cache existem, mas não são o motivo que a página dá para alargar a tabela.",
                    options: [
                        {
                            text: "Com mais campos na mesma tabela, o otimizador descarta grandes volumes de dado usando as estatísticas de nível de arquivo.",
                            isCorrect: true,
                        },
                        {
                            text: "Com mais campos na mesma tabela, a Delta Lake passa a guardar o dado em formato colunar comprimido e lê menos bytes.",
                            isCorrect: false,
                        },
                        {
                            text: "Com mais campos na mesma tabela, a transação deixa de ser por tabela e o commit cobre todas as colunas de uma vez.",
                            isCorrect: false,
                        },
                        {
                            text: "Com mais campos na mesma tabela, o cache de disco do cluster retém o resultado do join anterior e não precisa recalcular mais nada.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que a opção RELY em uma restrição de chave primária muda, e o que ela exige para valer?",
                    difficulty: "medio",
                    explanation:
                        "RELY não valida dado: ela autoriza o otimizador a explorar a restrição para reescrever consultas, e essas otimizações exigem compute com Photon. Quem marca a opção de validação na escrita cai na armadilha, porque a doc diz que a restrição é informativa.",
                    options: [
                        {
                            text: "Permite ao otimizador reescrever consultas apoiado na restrição, exige compute com Photon e não valida o dado existente.",
                            isCorrect: true,
                        },
                        {
                            text: "Faz o motor validar a chave em cada escrita, exige compute com Photon e rejeita a inserção de valor duplicado.",
                            isCorrect: false,
                        },
                        {
                            text: "Cria um índice único físico sobre a coluna da chave, exige Unity Catalog e acelera a busca pontual por valor.",
                            isCorrect: false,
                        },
                        {
                            text: "Liga a verificação da restrição em um job de manutenção noturno, exige liquid clustering e marca as linhas em conflito na tabela.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta soma `valor` de `fato_venda` com LEFT OUTER JOIN em `dim_cliente` pela chave primária da dimensão, e não usa nenhuma coluna da dimensão no SELECT nem no WHERE. Com a chave declarada com RELY e compute com Photon, o que o otimizador pode fazer?",
                    difficulty: "dificil",
                    explanation:
                        "É o exemplo de eliminação de join da doc: a chave primária garante no máximo uma linha casada e o outer join preserva todas as linhas do fato, então remover o join não muda a soma. Trocar por inner join mudaria o resultado se alguma chave do fato não existisse na dimensão.",
                    options: [
                        {
                            text: "Remover o join, porque a chave primária garante no máximo uma linha casada e o outer join preserva todas as linhas do fato.",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar o outer join por inner join, porque a chave primária garante que toda linha do fato encontra par na dimensão.",
                            isCorrect: false,
                        },
                        {
                            text: "Transformar o join em broadcast obrigatório, porque dimensão com chave primária declarada é sempre pequena o bastante.",
                            isCorrect: false,
                        },
                        {
                            text: "Nada, porque otimização apoiada em RELY vale apenas para consulta com DISTINCT e nunca para consulta com função de agregação.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Segundo a documentação da arquitetura medallion e a de conceitos de data warehouse, onde fica a modelagem dimensional e onde ficam os data marts?",
                    difficulty: "medio",
                    explanation:
                        "A doc lista modelagem dimensional e agregação como função da gold, e diz que o data warehouse é modelado na silver e alimenta data marts especializados na gold. Pôr o modelo na bronze é a armadilha, porque a bronze guarda dado bruto sem validação.",
                    options: [
                        {
                            text: "Modelagem dimensional e agregação são função da gold, e os data marts especializados também ficam na gold, alimentados pela silver.",
                            isCorrect: true,
                        },
                        {
                            text: "Modelagem dimensional é função da bronze, que já entrega fato e dimensão prontos, e os data marts ficam depois na silver.",
                            isCorrect: false,
                        },
                        {
                            text: "Modelagem dimensional é função da silver, e a gold guarda apenas cópia física do resultado de cada painel publicado.",
                            isCorrect: false,
                        },
                        {
                            text: "Modelagem dimensional acontece em uma camada platinum à parte, criada para data mart, e a gold fica só com agregação de métrica de negócio.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Chave substituta e coluna de identidade",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você escolhe a coluna que vira chave da dimensão e conhece os limites da coluna de identidade da Delta Lake, que é a ferramenta que a plataforma oferece para gerar essa chave.\n\nA decisão parece boba até o dia em que o sistema de origem reaproveita o código de um cliente excluído, ou passa a emitir o mesmo código com um zero à esquerda. O fato passa a apontar para a linha errada e ninguém percebe, porque chave estrangeira na plataforma não é validada pelo motor.",
                },
                {
                    type: "text",
                    value: "Chave de negócio é o identificador que vem da origem: o código do cliente no ERP, o SKU do catálogo, o CNPJ. Chave substituta é um número sem significado, gerado pela própria tabela de dimensão, que serve só para ligar fato e dimensão. Três razões empurram para a substituta.\n\nA primeira é estabilidade. A chave de negócio pertence a outro sistema e muda quando aquele sistema quiser: troca de formato, fusão de cadastro, reuso de código de registro excluído. A chave substituta não muda porque ninguém fora da sua dimensão a conhece.\n\nA segunda é a dimensão com histórico. No momento em que a dimensão passa a guardar versão, a chave de negócio deixa de identificar uma linha: o mesmo cliente passa a ter três linhas, uma por período de vigência. O fato precisa apontar para a versão que valia no instante do evento, e só uma chave por linha entrega isso.\n\nA terceira é custo de consulta. O guia de preparo de dado para BI recomenda evitar tipo de dado largo e coluna de cardinalidade alta no modelo, e chave de negócio costuma ser exatamente isso: texto longo, às vezes composto por duas ou três colunas. A chave substituta é um BIGINT único por linha.",
                },
                {
                    type: "code",
                    value: "CREATE TABLE vendas.gold.dim_cliente (\n  sk_cliente BIGINT NOT NULL\n    GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),\n  id_cliente STRING NOT NULL,\n  nome       STRING,\n  uf         STRING,\n  CONSTRAINT pk_dim_cliente PRIMARY KEY (sk_cliente) RELY\n);\n\n-- A carga nunca menciona a coluna de identidade\nINSERT INTO vendas.gold.dim_cliente (id_cliente, nome, uf)\nSELECT id_cliente, nome, uf\nFROM vendas.silver.cliente;",
                },
                {
                    type: "table",
                    value: '[["Aspecto","GENERATED ALWAYS AS IDENTITY","GENERATED BY DEFAULT AS IDENTITY"],["INSERT pode informar o valor","Não, a plataforma sempre atribui o valor","Sim, o valor informado na inserção é aceito"],["Uso típico","Dimensão nova, em que a chave só nasce na tabela","Carga inicial que traz chave vinda de um sistema antigo"],["Risco a vigiar","Nenhum na unicidade, a tabela controla o valor","Valor informado à mão pode colidir com valor gerado depois"],["Frase da doc","Use ALWAYS para anular a possibilidade de definir valor manualmente","Permite que a inserção forneça valores para a coluna"]]',
                },
                {
                    type: "text",
                    value: "A doc é cuidadosa com o que a identidade promete. Os valores são únicos e crescem na direção do passo definido, mas não é garantido que sejam contíguos: o exemplo da própria página é que alguns números pares podem ser pulados. Então não use o valor da identidade para contar linhas, para inferir ordem de carga nem para mostrar ao usuário como número sequencial de documento.\n\nO resto das regras é curto e cai na prova: o único tipo suportado é BIGINT, e a operação falha se o valor passar do limite do BIGINT; início e passo têm valor padrão 1; passo 0 não é permitido, mas passo negativo é.",
                },
                {
                    type: "table",
                    value: '[["Limite documentado","Consequência prática"],["Só o tipo BIGINT é suportado","A operação falha se o valor exceder o limite do BIGINT"],["Não é possível particionar a tabela por coluna de identidade","Escolha outra coluna de partição ou use liquid clustering"],["ALTER TABLE não adiciona, substitui nem altera coluna de identidade","A definição tem que nascer no CREATE TABLE"],["CREATE TABLE AS SELECT não define restrição de identidade","Crie a tabela com a definição e carregue depois com INSERT"],["Não é possível atualizar o valor de identidade de um registro existente","Para mudar, apague o registro e insira de novo"],["Declarar identidade desativa transações concorrentes na tabela Delta","Use identidade só onde não existe escrita concorrente no destino"],["Materialized view não suporta coluna de identidade nem chave substituta","A dimensão com chave substituta precisa ser tabela, não materialized view"]]',
                },
                {
                    type: "code",
                    value: "-- Não funciona: CTAS não aceita definição de identidade\nCREATE TABLE vendas.gold.dim_loja AS\nSELECT id_loja, cidade FROM vendas.silver.loja;\n\n-- Funciona: declare a tabela, depois carregue\nCREATE TABLE vendas.gold.dim_loja (\n  sk_loja BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY,\n  id_loja STRING NOT NULL,\n  cidade  STRING\n);\n\nINSERT INTO vendas.gold.dim_loja (id_loja, cidade)\nSELECT id_loja, cidade FROM vendas.silver.loja;",
                },
                {
                    type: "quote",
                    value: "Coluna de identidade entrega valor único e crescente na direção do passo, mas não garante valor contíguo. E declarar identidade desativa transações concorrentes na tabela Delta: use identidade só onde não existe escrita concorrente no destino.",
                },
                {
                    type: "text",
                    value: "Quando identidade não cabe, o atalho documentado é a coluna gerada. Coluna gerada é calculada por uma expressão que você define e fica fisicamente gravada nos arquivos de dado: se você omitir a coluna na escrita, a Delta Lake calcula o valor, e se informar, o valor precisa casar com a expressão ou a escrita falha. A expressão aceita qualquer função SQL determinística, o que inclui função de hash sobre a chave de negócio, e não aceita função definida pelo usuário, função de agregação, função de janela nem função que devolve várias linhas.\n\nDuas ressalvas antes de adotar. Habilitar coluna gerada eleva o protocolo de escrita da tabela, o que pode afetar cliente Delta externo. E coluna gerada não pode referenciar coluna mascarada, nem é possível aplicar máscara a uma coluna referenciada por coluna gerada. A doc não chama esse padrão de chave substituta, então na prova ele é a saída para o caso em que identidade não serve, não a resposta esperada quando o enunciado fala em coluna de identidade.",
                },
                {
                    type: "code",
                    value: "-- Identidade não serve aqui: dois pipelines escrevem na mesma tabela\nCREATE TABLE vendas.gold.dim_fornecedor (\n  sk_fornecedor BIGINT GENERATED ALWAYS AS (xxhash64(cnpj)),\n  cnpj          STRING NOT NULL,\n  razao_social  STRING\n);\n\nINSERT INTO vendas.gold.dim_fornecedor (cnpj, razao_social)\nSELECT cnpj, razao_social FROM vendas.silver.fornecedor;",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma dimensão de cliente passou a guardar histórico, com uma linha por período de vigência. Por que a chave de negócio deixa de servir como chave da dimensão?",
                    difficulty: "facil",
                    explanation:
                        "Com histórico, a mesma entidade ganha várias linhas, então a chave de negócio não identifica mais uma linha única, e o fato precisa apontar para a versão vigente no instante do evento. A validação pelo motor não é o ponto, porque a plataforma não valida chave nenhuma.",
                    options: [
                        {
                            text: "Porque a mesma entidade passa a ter várias linhas, e o fato precisa apontar para a versão que valia no instante do evento.",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o motor passa a validar a chave da dimensão a cada escrita, e a inserção da segunda versão da entidade seria rejeitada.",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a chave de negócio só aceita tipo BIGINT na dimensão com histórico, e código de origem quase sempre é texto.",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a dimensão com histórico precisa ser materialized view, e materialized view não aceita restrição de chave primária.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma carga inicial precisa preservar os códigos de chave que já existem num data warehouse antigo e, depois disso, deixar a tabela gerar as chaves novas. Qual declaração de identidade atende?",
                    difficulty: "medio",
                    explanation:
                        "GENERATED BY DEFAULT AS IDENTITY permite que a inserção forneça valores, que é o que a carga inicial precisa, e segue gerando valor quando a coluna é omitida. GENERATED ALWAYS anula a possibilidade de definir valor manualmente, então rejeitaria a carga inicial.",
                    options: [
                        {
                            text: "GENERATED BY DEFAULT AS IDENTITY, porque ela aceita o valor informado na inserção e gera valor quando a coluna é omitida.",
                            isCorrect: true,
                        },
                        {
                            text: "GENERATED ALWAYS AS IDENTITY, porque ela aceita o valor informado na carga inicial e depois passa a gerar o valor sozinha.",
                            isCorrect: false,
                        },
                        {
                            text: "GENERATED ALWAYS AS IDENTITY com START WITH igual ao maior código antigo, porque isso preserva os códigos já existentes.",
                            isCorrect: false,
                        },
                        {
                            text: "Coluna BIGINT comum carregada pela origem, porque identidade não convive com valor informado em nenhuma das duas formas.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um engenheiro roda `CREATE TABLE dim_loja AS SELECT ...` declarando a coluna de chave como identidade e o comando falha. Qual é o caminho documentado?",
                    difficulty: "medio",
                    explanation:
                        "A doc diz que CREATE TABLE AS SELECT não define restrição de identidade: o caminho é criar a tabela com a definição e carregar com INSERT. Tentar consertar com ALTER TABLE também falha, porque ALTER não adiciona nem altera coluna de identidade.",
                    options: [
                        {
                            text: "Criar a tabela com a definição de identidade e carregar depois com INSERT, porque CTAS não define restrição de identidade.",
                            isCorrect: true,
                        },
                        {
                            text: "Rodar o CTAS sem a identidade e depois adicionar a coluna de chave com ALTER TABLE, porque ALTER aceita definição de identidade.",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar o CTAS declarando a coluna como INT em vez de BIGINT, porque identidade em CTAS só funciona com tipo de 32 bits.",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o CTAS por CREATE MATERIALIZED VIEW AS SELECT, porque materialized view resolve a geração da chave substituta.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois jobs gravam na mesma tabela de dimensão ao mesmo tempo e a equipe quer declarar a chave como coluna de identidade. Qual é o problema documentado?",
                    difficulty: "dificil",
                    explanation:
                        "A doc diz que declarar coluna de identidade em uma tabela Delta desativa transações concorrentes, e recomenda identidade só onde não existe escrita concorrente no destino. Valor duplicado não é o risco, porque a unicidade continua garantida pela tabela.",
                    options: [
                        {
                            text: "Declarar identidade desativa transações concorrentes na tabela, então a escrita simultânea dos dois jobs deixa de funcionar.",
                            isCorrect: true,
                        },
                        {
                            text: "Declarar identidade mantém a concorrência, mas os dois jobs podem receber o mesmo valor e inserir chave duplicada na dimensão.",
                            isCorrect: false,
                        },
                        {
                            text: "Declarar identidade obriga os dois jobs a rodar na mesma edição de pipeline, porque a sequência vive no event log do pipeline.",
                            isCorrect: false,
                        },
                        {
                            text: "Declarar identidade exige particionar a tabela pela coluna de chave, e partição por identidade serializa a escrita dos jobs.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um analista reclama que os valores de `sk_cliente` saltaram de 4120 para 4140 e quer saber se o pipeline perdeu vinte clientes. O que a documentação diz sobre isso?",
                    difficulty: "medio",
                    explanation:
                        "A doc garante valor único e crescente na direção do passo, mas avisa que o valor não é garantidamente contíguo, e dá o exemplo de números pulados. Logo, o salto não indica perda de registro e não deve ser usado para contar linhas.",
                    options: [
                        {
                            text: "O valor é único e crescente na direção do passo, mas não é garantido contíguo, então o salto não indica perda de registro.",
                            isCorrect: true,
                        },
                        {
                            text: "O valor é único e contíguo por definição, então o salto indica que vinte inserções falharam e foram descartadas em silêncio.",
                            isCorrect: false,
                        },
                        {
                            text: "O valor segue a ordem de chegada e nunca salta, então o salto só aparece quando alguém roda VACUUM na tabela de dimensão.",
                            isCorrect: false,
                        },
                        {
                            text: "O valor pode saltar porque a doc reserva faixas de vinte números por partição, e cada partição consome a sua faixa inteira.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Dimensão que muda devagar com AUTO CDC",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você escreve o fluxo que mantém uma dimensão com histórico sem escrever um MERGE à mão, e sabe quais colunas a tabela de destino ganha quando você pede tipo 2.\n\nO problema é o de sempre: a origem manda o estado atual do cliente, às vezes fora de ordem e às vezes repetido, e o relatório precisa saber em que cidade o cliente morava no dia da compra. Resolver isso com MERGE é possível, e é onde a maioria dos bugs de pipeline mora: fecha a vigência da linha errada, ignora o evento atrasado, duplica versão quando o mesmo evento chega duas vezes.",
                },
                {
                    type: "text",
                    value: "A plataforma resolve isso com as APIs AUTO CDC, dentro de um pipeline. A doc é direta sobre a troca de nome: as APIs AUTO CDC substituem as APIs APPLY CHANGES e têm a mesma sintaxe, APPLY CHANGES continua disponível, e a Databricks recomenda AUTO CDC. Se a prova oferecer o nome antigo como resposta certa para um cenário novo, a certa é a outra.\n\nTem requisito de edição: para usar as APIs de CDC, o pipeline precisa estar configurado para pipelines serverless, ou para a edição Pro ou Advanced de Lakeflow pipelines. E tem requisito de ordenação: `SEQUENCE BY` é obrigatório e é a cláusula que faz o evento atrasado cair no lugar certo do histórico, em vez de sobrescrever um estado mais novo.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","STORED AS SCD TYPE 1","STORED AS SCD TYPE 2"],["Padrão da cláusula STORED AS","Sim, é o tipo usado quando você omite a cláusula","Não, precisa ser declarado"],["Histórico","Não retém histórico do registro atualizado","Retém histórico, em todas as mudanças ou só nas colunas escolhidas"],["Comportamento da atualização","Atualiza o registro direto, no lugar","Fecha a versão antiga e abre uma versão nova"],["Colunas de vigência","Nenhuma","Ganha `__START_AT` e `__END_AT`"],["Linha vigente","A única linha com aquela chave","A linha com `__END_AT` nulo"],["APPLY AS TRUNCATE WHEN","Suportado","Não suportado"],["APPLY AS DELETE WHEN","Remove o registro do destino","Encerra o histórico e guarda a linha como tombstone por um tempo"]]',
                },
                {
                    type: "code",
                    value: "CREATE OR REFRESH STREAMING TABLE dim_cliente_hist;\n\nCREATE FLOW f_dim_cliente AS AUTO CDC INTO dim_cliente_hist\nFROM STREAM(vendas.silver.cliente_cdc)\nKEYS (id_cliente)\nAPPLY AS DELETE WHEN operacao = 'DELETE'\nSEQUENCE BY commit_ts\nCOLUMNS * EXCEPT (operacao, commit_ts)\nSTORED AS SCD TYPE 2\nTRACK HISTORY ON * EXCEPT (telefone);",
                },
                {
                    type: "text",
                    value: "Quando você declara o schema da tabela de destino de um SCD tipo 2, precisa incluir as colunas `__START_AT` e `__END_AT`, e o tipo delas tem que ser o mesmo do campo usado em `SEQUENCE BY`. Se você não declarar o schema, o pipeline cria as duas colunas sozinho.\n\nO conteúdo delas é o valor de sequenciamento, não a hora do processamento: para o tipo 2, o pipeline copia os valores de sequência para `__START_AT` e `__END_AT`. A linha ativa é a que tem `__END_AT` nulo, e esse é o filtro que toda consulta de estado atual usa. Se alguém mexer na tabela com DML manual, a doc exige que o comando informe valores válidos para as duas colunas, senão a ordenação do histórico quebra.",
                },
                {
                    type: "code",
                    value: "-- Schema declarado: as colunas de vigência vêm com o tipo do SEQUENCE BY\nCREATE OR REFRESH STREAMING TABLE dim_cliente_hist (\n  id_cliente STRING,\n  nome       STRING,\n  uf         STRING,\n  telefone   STRING,\n  __START_AT TIMESTAMP,\n  __END_AT   TIMESTAMP\n);\n\n-- Estado atual da dimensão\nSELECT * FROM dim_cliente_hist WHERE __END_AT IS NULL;\n\n-- Onde o cliente morava no dia da compra\nSELECT f.sk_venda, d.uf\nFROM vendas.gold.fato_venda f\nJOIN dim_cliente_hist d\n  ON d.id_cliente = f.id_cliente\n AND f.data_venda >= d.__START_AT\n AND (f.data_venda < d.__END_AT OR d.__END_AT IS NULL);",
                },
                {
                    type: "text",
                    value: "Três cláusulas mudam o comportamento de um jeito que a prova gosta de perguntar.\n\n`TRACK HISTORY ON` limita quais colunas geram registro de histórico. Por padrão, o tipo 2 cria uma versão nova quando qualquer coluna de saída muda. Com um subconjunto declarado, mudança nas outras colunas atualiza a versão atual no lugar, em vez de gerar um registro de histórico. É assim que você evita uma versão nova de cliente a cada correção de telefone.\n\n`IGNORE NULL UPDATES` faz com que, nas linhas casadas, valor nulo que chega preserve o valor que já está no destino. O padrão é o contrário: nulo sobrescreve o valor existente. Serve para origem que manda evento parcial, só com as colunas que mudaram.\n\n`APPLY AS DELETE WHEN` define a condição que trata o evento como exclusão, em vez de upsert. No tipo 2 a linha apagada fica guardada temporariamente como tombstone, e o período de retenção vem da propriedade de tabela `pipelines.cdc.tombstoneGCThresholdInSeconds`. O tombstone existe justamente para o dado fora de ordem: se um evento mais antigo chegar depois da exclusão, o pipeline sabe que aquela chave foi apagada.",
                },
                {
                    type: "table",
                    value: '[["Cláusula","Obrigatória","Para que serve"],["`KEYS`","Sim","Coluna ou colunas que identificam a linha e casam o evento com a linha do destino"],["`SEQUENCE BY`","Sim","Ordem lógica dos eventos, para tratar chegada fora de ordem; precisa ser tipo ordenável"],["`COLUMNS`","Não","Limita as colunas que vão para o destino, por lista ou por `* EXCEPT`"],["`STORED AS`","Não","Escolhe `SCD TYPE 1`, `SCD TYPE 2` ou `BITEMPORAL`; o padrão é tipo 1"],["`TRACK HISTORY ON`","Não","Limita quais colunas geram registro de histórico no tipo 2"],["`IGNORE NULL UPDATES`","Não","Nas linhas casadas, nulo que chega preserva o valor existente no destino"],["`APPLY AS DELETE WHEN`","Não","Condição que trata o evento como exclusão"],["`APPLY AS TRUNCATE WHEN`","Não","Condição que trunca o destino inteiro; suportada só no tipo 1"]]',
                },
                {
                    type: "code",
                    value: 'from pyspark import pipelines as dp\n\ndp.create_streaming_table("dim_cliente_hist")\n\ndp.create_auto_cdc_flow(\n    target="dim_cliente_hist",\n    source="cliente_cdc",\n    keys=["id_cliente"],\n    sequence_by="commit_ts",\n    apply_as_deletes="operacao = \'DELETE\'",\n    except_column_list=["operacao", "commit_ts"],\n    stored_as_scd_type="2",\n    track_history_except_column_list=["telefone"],\n)',
                },
                {
                    type: "quote",
                    value: "Em dimensão SCD tipo 2 montada com AUTO CDC, a linha vigente é a que tem `__END_AT` nulo, e o tipo dessas duas colunas de vigência precisa ser igual ao da coluna usada em `SEQUENCE BY`.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é o nome atual da API declarativa de change data capture em pipelines da Databricks, e o que a doc diz sobre o nome anterior?",
                    difficulty: "facil",
                    explanation:
                        "A doc diz que as APIs AUTO CDC substituem as APIs APPLY CHANGES, com a mesma sintaxe, e que a Databricks recomenda AUTO CDC. APPLY CHANGES segue disponível, mas é o nome anterior, então não é a resposta esperada em cenário novo.",
                    options: [
                        {
                            text: "AUTO CDC, que substitui APPLY CHANGES com a mesma sintaxe; o nome antigo segue disponível, mas não é o recomendado.",
                            isCorrect: true,
                        },
                        {
                            text: "APPLY CHANGES INTO, que substituiu AUTO CDC na reorganização da doc; o nome AUTO CDC segue válido só em Python.",
                            isCorrect: false,
                        },
                        {
                            text: "MERGE INTO declarativo, que substitui as duas APIs antigas; AUTO CDC e APPLY CHANGES foram retirados do produto.",
                            isCorrect: false,
                        },
                        {
                            text: "CREATE FLOW CDC, que substitui AUTO CDC quando a tabela de destino é uma streaming table em vez de materialized view.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um fluxo AUTO CDC foi escrito sem a cláusula STORED AS. Qual é o comportamento da tabela de destino?",
                    difficulty: "medio",
                    explanation:
                        "SCD TYPE 1 é o padrão quando STORED AS é omitido: atualiza o registro direto, no lugar, sem retenção de histórico, e sem criar as colunas de vigência. Esperar as colunas de vigência é a armadilha, porque elas só aparecem no tipo 2.",
                    options: [
                        {
                            text: "Vale SCD tipo 1: atualiza o registro direto no lugar, não retém histórico e não cria as colunas de vigência.",
                            isCorrect: true,
                        },
                        {
                            text: "Vale SCD tipo 2: retém histórico e cria as colunas de vigência, porque pipeline sempre preserva versão por segurança.",
                            isCorrect: false,
                        },
                        {
                            text: "O fluxo falha na validação, porque STORED AS é obrigatório sempre que a tabela de destino é uma streaming table.",
                            isCorrect: false,
                        },
                        {
                            text: "Vale o tipo BITEMPORAL, que é o padrão desde que a cláusula SYSTEM SEQUENCE BY passou a existir na sintaxe.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma dimensão SCD tipo 2 de cliente está ganhando uma versão nova a cada correção de telefone, e o negócio só quer histórico de endereço. Qual cláusula resolve?",
                    difficulty: "medio",
                    explanation:
                        "TRACK HISTORY ON limita quais colunas geram registro de histórico: com um subconjunto declarado, mudança nas demais colunas atualiza a versão atual no lugar. IGNORE NULL UPDATES trata nulo que chega, que é outro problema.",
                    options: [
                        {
                            text: "TRACK HISTORY ON com EXCEPT na coluna de telefone, porque mudança em coluna fora da lista atualiza a versão atual no lugar.",
                            isCorrect: true,
                        },
                        {
                            text: "IGNORE NULL UPDATES na coluna de telefone, porque o valor que chega nessa coluna passa a preservar o valor já gravado no destino.",
                            isCorrect: false,
                        },
                        {
                            text: "COLUMNS com EXCEPT na coluna de telefone, porque a coluna some do destino e deixa de disparar versão nova.",
                            isCorrect: false,
                        },
                        {
                            text: "SEQUENCE BY na coluna de endereço, porque a sequência passa a avançar só quando o endereço do cliente muda de valor.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um fluxo AUTO CDC com STORED AS SCD TYPE 2 precisa tratar a carga completa que a origem manda todo domingo, apagando o que saiu do cadastro. A equipe quer usar APPLY AS TRUNCATE WHEN. O que acontece?",
                    difficulty: "dificil",
                    explanation:
                        "A doc diz que APPLY AS TRUNCATE WHEN é suportada só no tipo 1, não no tipo 2, o que faz sentido: truncar apagaria o histórico. Para o tipo 2 a saída é APPLY AS DELETE WHEN, que encerra o histórico da chave e guarda a linha como tombstone.",
                    options: [
                        {
                            text: "Não funciona, porque a cláusula é suportada só no tipo 1; no tipo 2 a saída é APPLY AS DELETE WHEN por chave.",
                            isCorrect: true,
                        },
                        {
                            text: "Funciona, porque a cláusula vale nos dois tipos; no tipo 2 ela fecha a vigência de todas as linhas de uma vez.",
                            isCorrect: false,
                        },
                        {
                            text: "Funciona só com pipeline serverless, porque truncar destino de tipo 2 depende do recurso de commit de catálogo.",
                            isCorrect: false,
                        },
                        {
                            text: "Não funciona, porque a cláusula exige que SEQUENCE BY use coluna de timestamp, e carga completa não traz timestamp.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um engenheiro declara o schema do destino de um SCD tipo 2 com `SEQUENCE BY commit_ts`, de tipo TIMESTAMP, e define `__START_AT` e `__END_AT` como BIGINT. O que a documentação diz?",
                    difficulty: "dificil",
                    explanation:
                        "A doc exige que o tipo de __START_AT e __END_AT seja o mesmo do campo usado em SEQUENCE BY, porque o pipeline copia o valor de sequência para essas colunas. Converter para epoch não é o comportamento documentado, e supor hora de processamento também está errado.",
                    options: [
                        {
                            text: "Está errado: o tipo das duas colunas de vigência precisa ser o mesmo da coluna usada em SEQUENCE BY, ou seja TIMESTAMP.",
                            isCorrect: true,
                        },
                        {
                            text: "Está certo: o pipeline converte o valor de sequência para epoch em BIGINT antes de gravar nas colunas de vigência.",
                            isCorrect: false,
                        },
                        {
                            text: "Está certo: as colunas de vigência guardam a hora de processamento do pipeline, que é sempre um inteiro de 64 bits.",
                            isCorrect: false,
                        },
                        {
                            text: "Está errado: o schema do destino de um SCD tipo 2 não pode ser declarado à mão, então as duas colunas sobram no CREATE.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Compartilhar dados entre organizações",
            blocks: [
                {
                    type: "text",
                    value: 'No fim desta aula você escolhe entre os dois modos de compartilhamento, sabe o que cada um exige de autenticação e o que o destinatário recebe, e sabe girar a credencial de um destinatário externo sem derrubar o acesso dele.\n\nAntes, um aviso de nome, porque ele decide questão. O guia do exame e o protocolo aberto usam Delta Sharing, e é esse o termo que você vai ler na prova. A documentação da AWS, por outro lado, já renomeou o produto: o caminho `/aws/en/delta-sharing/` hoje abre uma página intitulada "What is OpenSharing?", e as páginas de privilégio já descrevem share, provider e recipient com esse nome novo. Na tela você vai ler um nome, na prova você vai ler o outro, o mecanismo é o mesmo, e o resto desta aula usa o termo do exame.',
                },
                {
                    type: "text",
                    value: "Share é uma coleção somente de leitura de tabelas e partições de tabela que um provedor compartilha com um ou mais destinatários, e para destinatário habilitado para Unity Catalog ele também pode levar notebook, view, volume e modelo. Provedor é a entidade que compartilha, destinatário é a entidade que recebe. O que muda entre os dois modos é quem garante a identidade do destinatário.\n\nNo modo entre contas da própria plataforma, o Databricks para Databricks, o destinatário precisa de um workspace habilitado para Unity Catalog, em qualquer conta e em qualquer nuvem. Ele é identificado pelo identificador de compartilhamento do metastore, no formato `<nuvem>:<região>:<uuid>`, como em `aws:us-west-2:19a84bee-54bc-43a2-87de-023d0ec16016`. Nesse modo o destinatário não precisa de token e o provedor não administra token nenhum: verificação de identidade, autenticação e auditoria ficam com a plataforma. O dado compartilhado só é acessível naquele metastore.\n\nNo modo aberto, o Databricks para Open, o destinatário pode ser qualquer pessoa, use ela Databricks ou não. O provedor escolhe entre dois métodos de autenticação: um token portador de vida longa, que ele gera e entrega ao destinatário por canal seguro, ou federação OIDC, em que o provedor de identidade do destinatário emite JWT e a Databricks troca esse JWT por token OAuth de vida curta. No caminho do token, a plataforma gera um arquivo de credencial e um link de ativação: o provedor manda o link, o destinatário baixa o arquivo e usa o endpoint mais o token portador para ler.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Databricks para Databricks","Databricks para Open"],["Quem pode ser destinatário","Quem tem workspace habilitado para Unity Catalog, em qualquer conta ou nuvem","Qualquer pessoa, com ou sem Databricks"],["Como o destinatário é identificado","Identificador de compartilhamento do metastore, com nuvem, região e uuid","Token portador gerado pelo provedor, ou federação OIDC"],["Token administrado pelo provedor","Nenhum, o provedor não administra token do destinatário","Sim, no caminho do token portador, com giro pelo provedor"],["O que o destinatário recebe","Catálogo criado a partir do share, dentro do Unity Catalog dele","Arquivo de credencial com endpoint e token, usado por cliente externo"],["Ativos além de tabela","Notebook, view, volume e modelo entram no share","Só o snapshot atual em streaming table e materialized view"],["Permissão do destinatário","Somente leitura","Somente leitura"]]',
                },
                {
                    type: "code",
                    value: "-- Lado do provedor\nCREATE SHARE vendas_2026 COMMENT 'Fato de venda e dimensões do parceiro';\n\nALTER SHARE vendas_2026\n  ADD TABLE vendas.gold.fato_venda\n  WITH HISTORY;\n\nALTER SHARE vendas_2026\n  ADD TABLE vendas.gold.dim_produto\n  WITHOUT HISTORY;\n\n-- Destinatário na própria plataforma: identificado pelo metastore dele\nCREATE RECIPIENT parceiro_br\n  USING ID 'aws:us-west-2:19a84bee-54bc-43a2-87de-023d0ec16016';\n\nGRANT SELECT ON SHARE vendas_2026 TO RECIPIENT parceiro_br;",
                },
                {
                    type: "code",
                    value: "-- Lado do destinatário, no workspace dele\nSHOW PROVIDERS;\nSHOW SHARES IN PROVIDER acme_corp;\n\n-- O share vira um catálogo somente de leitura no Unity Catalog do destinatário\nCREATE CATALOG parceiro_vendas USING SHARE acme_corp.vendas_2026;\n\nGRANT USE CATALOG ON CATALOG parceiro_vendas TO `analistas`;\n\nSELECT count(*) FROM parceiro_vendas.gold.fato_venda;",
                },
                {
                    type: "text",
                    value: "Compartilhar histórico é uma opção por tabela, e ela mexe em performance, não só em time travel. A cláusula vai no comando que adiciona a tabela ao share, como `WITH HISTORY` ou `WITHOUT HISTORY`. O padrão depende da versão do compute: compartilhando tabela com compute em Databricks Runtime 16.2 ou acima, `WITH HISTORY` é o padrão, e em versão anterior o padrão é `WITHOUT HISTORY`. Ao compartilhar um schema inteiro, todas as tabelas do schema vão com histórico.\n\nO ganho de performance vem do mecanismo: o compartilhamento de histórico usa credencial temporária de nuvem com escopo no diretório raiz da tabela Delta do provedor, o que deixa o destinatário ler arquivo de dado e log direto do armazenamento. Duas ressalvas que a prova cobra. Tabela com particionamento habilitado não recebe o benefício de performance do compartilhamento de histórico. E para o destinatário do modo aberto, time travel com `versionAsOf` ou `timestampAsOf` só funciona se o provedor compartilhou o histórico da tabela; em streaming table e materialized view ele lê apenas o snapshot atual, sem consulta de histórico, sem change data feed e sem leitura em streaming.",
                },
                {
                    type: "text",
                    value: "Girar o token do destinatário consiste em marcar o token existente para expirar e substituí-lo por um token novo e uma URL de ativação nova. Quem faz é o dono do objeto de destinatário, pelo Catalog Explorer, na área de compartilhamento, ou pela CLI.\n\nAs regras que a prova cobra são quatro. Um destinatário tem no máximo dois tokens ao mesmo tempo, um ativo e um girado, e enquanto o girado não expirar, tentar girar de novo devolve erro. O parâmetro de segundos define quanto tempo o token antigo continua válido, e o valor 0 expira o token existente imediatamente. Se a URL de ativação existente nunca foi acessada, girar o token invalida aquela URL e gera outra no lugar. E, depois de girar, você entrega o link de ativação novo ao destinatário por canal seguro, porque é ele que aplica a credencial nova do lado de lá.\n\nA recomendação da doc é um prazo curto: grande o suficiente para o destinatário aplicar a credencial nova, pequeno o suficiente para não deixar dois tokens vivos por muito tempo. Se houver suspeita de credencial comprometida, expire na hora. Os motivos típicos de giro são token perto de vencer, link de ativação perdido ou exposto, e mudança no tempo de vida de token configurado no metastore.",
                },
                {
                    type: "code",
                    value: "# Expira o token antigo em 1 hora e emite token e link de ativação novos\ndatabricks recipients rotate-token parceiro_externo 3600\n\n# Suspeita de credencial exposta: expira o token antigo imediatamente\ndatabricks recipients rotate-token parceiro_externo 0",
                },
                {
                    type: "table",
                    value: '[["Privilégio","Onde é concedido","O que permite"],["CREATE SHARE","Metastore","Criar um share no metastore"],["CREATE RECIPIENT","Metastore","Criar um objeto de destinatário no metastore"],["CREATE PROVIDER","Metastore","Criar um objeto de provedor no metastore"],["SET SHARE PERMISSION","Metastore","Conceder a um destinatário o acesso a um share"],["USE SHARE","Metastore","Ver os shares e os ativos deles como usuário do provedor"],["USE RECIPIENT","Metastore","Ver os destinatários e os shares deles como usuário do provedor"],["USE PROVIDER","Metastore","Ver os provedores e montar catálogo compartilhado como destinatário"],["SELECT","Share","Permitir que o destinatário consulte o share"]]',
                },
                {
                    type: "quote",
                    value: "No modo entre contas da plataforma o destinatário não precisa de token e o provedor não administra token nenhum. No modo aberto o provedor escolhe entre token portador de vida longa e federação OIDC, e assume o giro da credencial do destinatário.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma empresa precisa entregar duas tabelas da gold para um cliente que usa Snowflake e não tem conta na Databricks. Qual modo de compartilhamento atende, e com o que de autenticação?",
                    difficulty: "facil",
                    explanation:
                        "O modo aberto, Databricks para Open, atende quem não usa Databricks, com token portador de vida longa ou federação OIDC. O modo entre contas da plataforma exige workspace habilitado para Unity Catalog do outro lado, o que o cliente não tem.",
                    options: [
                        {
                            text: "Modo aberto, com token portador de vida longa entregue por canal seguro ou com federação OIDC pelo provedor de identidade.",
                            isCorrect: true,
                        },
                        {
                            text: "Modo entre contas da plataforma, com o identificador de compartilhamento do metastore do cliente informado na criação do destinatário.",
                            isCorrect: false,
                        },
                        {
                            text: "Modo entre contas da plataforma, com token portador emitido para o cliente porque ele não tem metastore próprio ainda.",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum dos dois: sem conta na Databricks o único caminho é exportar arquivo Parquet para o armazenamento do cliente.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No compartilhamento entre duas contas da própria plataforma, o que o provedor precisa do destinatário e que token ele administra?",
                    difficulty: "medio",
                    explanation:
                        "Nesse modo o provedor precisa do identificador de compartilhamento do metastore do destinatário, no formato de nuvem, região e uuid, e não administra token nenhum: identidade, autenticação e auditoria ficam com a plataforma.",
                    options: [
                        {
                            text: "Precisa do identificador de compartilhamento do metastore e não administra token, porque a plataforma cuida da autenticação.",
                            isCorrect: true,
                        },
                        {
                            text: "Precisa do e-mail do destinatário e administra um token portador, que ele gira sempre que a credencial estiver por vencer.",
                            isCorrect: false,
                        },
                        {
                            text: "Precisa do identificador do workspace e administra um token OAuth de vida curta, renovado pelo provedor a cada leitura.",
                            isCorrect: false,
                        },
                        {
                            text: "Precisa da credencial de armazenamento do destinatário e administra a chave da nuvem dele, com escopo no diretório da tabela.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma tabela particionada foi adicionada a um share com `WITH HISTORY` e o provedor esperava ganho de performance para o destinatário. O que a documentação diz?",
                    difficulty: "medio",
                    explanation:
                        "A doc é explícita: tabela com particionamento habilitado não recebe o benefício de performance do compartilhamento de histórico, que depende de credencial temporária de nuvem com escopo no diretório raiz da tabela. O comando não falha, só não traz o ganho.",
                    options: [
                        {
                            text: "Tabela com particionamento habilitado não recebe o benefício de performance do compartilhamento de histórico no share.",
                            isCorrect: true,
                        },
                        {
                            text: "Tabela com particionamento habilitado recebe o benefício em dobro, porque cada partição ganha a sua credencial de nuvem.",
                            isCorrect: false,
                        },
                        {
                            text: "Tabela com particionamento habilitado não pode ser adicionada a um share, e o comando falha na validação do ativo.",
                            isCorrect: false,
                        },
                        {
                            text: "Tabela com particionamento habilitado só recebe o benefício depois de uma execução de OPTIMIZE sobre todas as partições.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um provedor girou o token de um destinatário aberto com prazo de 24 horas e, dez minutos depois, descobriu que o link de ativação vazou. Ele tenta girar de novo e recebe erro. Por quê?",
                    difficulty: "dificil",
                    explanation:
                        "Um destinatário tem no máximo dois tokens ao mesmo tempo, um ativo e um girado, e enquanto o girado não expirar, girar de novo devolve erro. Por isso a doc recomenda prazo curto, e prazo 0 quando há suspeita de comprometimento.",
                    options: [
                        {
                            text: "Porque o destinatário já tem dois tokens, um ativo e um girado, e girar de novo só é possível quando o girado expirar.",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o giro de token só pode ser feito uma vez por dia por destinatário, limite definido no metastore do provedor.",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o link de ativação ainda não foi acessado, e a doc bloqueia o giro até o destinatário baixar a credencial nova.",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o giro exige que o destinatário seja do tipo DATABRICKS, e destinatário aberto só aceita a troca do share inteiro.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um destinatário na própria plataforma recebeu acesso a um share e quer consultar as tabelas pelo nome de três níveis. O que ele faz, e que permissão ele ganha sobre o dado?",
                    difficulty: "medio",
                    explanation:
                        "O destinatário cria um catálogo a partir do share, com CREATE CATALOG ... USING SHARE no formato provedor.share, e sobre os objetos desse catálogo só pode receber acesso de leitura. Montar como local externo não é o caminho documentado.",
                    options: [
                        {
                            text: "Cria um catálogo a partir do share com CREATE CATALOG USING SHARE, e sobre esse catálogo só pode receber acesso de leitura.",
                            isCorrect: true,
                        },
                        {
                            text: "Cria um local externo apontando para o diretório da tabela do provedor, e ganha leitura e escrita sobre os arquivos de dado.",
                            isCorrect: false,
                        },
                        {
                            text: "Cria um catálogo estrangeiro com CREATE FOREIGN CATALOG USING CONNECTION, e ganha leitura com pushdown para o provedor.",
                            isCorrect: false,
                        },
                        {
                            text: "Baixa o arquivo de credencial pelo link de ativação e registra o share como schema do catálogo principal, com leitura.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Federação contra ingestão",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você decide entre apontar a consulta para o banco de origem e trazer o dado para dentro do lakehouse, e sabe dizer, em cada caminho, onde o processamento acontece e quem paga a conta de compute.\n\nA pergunta chega na prova como cenário de custo: um time de BI quer um relatório pontual sobre uma base operacional de Postgres, outro time quer painel de hora em hora sobre a mesma base com volume alto, e a resposta certa é diferente nos dois casos. Errar aqui custa caro na vida real, porque o caminho errado joga carga analítica no banco que atende o sistema transacional.",
                },
                {
                    type: "text",
                    value: "Lakehouse Federation é a plataforma de federação de consulta da Databricks. Ela dá acesso governado, somente de leitura, a dado externo através de catálogo estrangeiro do Unity Catalog, com controle de acesso em nível de tabela. A doc divide em dois tipos: federação de consulta e federação de catálogo.\n\nNa federação de consulta você cria uma conexão do Unity Catalog com as credenciais e a URL JDBC, cria um catálogo estrangeiro a partir dessa conexão, concede privilégio de tabela e consulta. Os destinos suportados são MySQL, PostgreSQL, Teradata, Oracle, Amazon Redshift, Salesforce Data 360, Snowflake, Microsoft SQL Server, Azure Synapse, Google BigQuery e outra Databricks.\n\nNa federação de catálogo você cria a conexão com o catálogo externo e, além dela, uma credencial de armazenamento e um local externo para os caminhos das tabelas. Os destinos são de outra natureza: Hive metastore legado, Hive metastore externo, AWS Glue, Salesforce Data 360 por compartilhamento de arquivo, Snowflake, Palantir Foundry e Workday Data Connect.",
                },
                {
                    type: "code",
                    value: "-- Credencial vinda do secret scope, nunca em texto claro\nCREATE CONNECTION pg_vendas TYPE postgresql\nOPTIONS (\n  host 'pg-vendas.interno',\n  port '5432',\n  user secret('erp', 'pg_user'),\n  password secret('erp', 'pg_password')\n);\n\nCREATE FOREIGN CATALOG IF NOT EXISTS pg_vendas_cat\nUSING CONNECTION pg_vendas\nOPTIONS (database 'vendas');\n\nGRANT USE CATALOG ON CATALOG pg_vendas_cat TO `analistas`;\n\n-- Filtro e agregação descem para o Postgres\nSELECT status, count(*) AS pedidos\nFROM pg_vendas_cat.public.pedido\nWHERE criado_em >= current_date() - INTERVAL 7 DAYS\nGROUP BY status;",
                },
                {
                    type: "text",
                    value: "É aqui que a prova separa quem leu a doc. Na federação de consulta, a consulta é empurrada para o banco externo via JDBC, e a doc diz que ela roda tanto no compute da Databricks quanto no compute remoto. Parte do trabalho vai para a máquina do banco de origem, que normalmente é a mesma máquina que atende o sistema transacional. Na federação de catálogo, a doc diz que a consulta roda apenas no compute da Databricks, lendo o armazenamento de objetos direto, e por isso a página a descreve como mais econômica e mais otimizada em performance do que a federação de consulta.\n\nO que desce para o banco externo não é a consulta inteira. A lista de pushdown suportado inclui filtro, projeção, limit, offset, agregação e TABLESAMPLE sem reposição, mais os operadores aritméticos, booleanos e de bit. Função de data, de hora e de timestamp, função matemática, função de texto e as auxiliares como cast, alias e ordenação descem parcialmente, só em expressão de filtro. Join não aparece na lista. Então um relatório que junta uma tabela federada com uma tabela do lakehouse puxa linha pela rede, e é esse o cenário em que federação começa a sair caro.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Federação de consulta","Federação de catálogo"],["Onde a consulta roda","Empurrada por JDBC, roda no compute da Databricks e no remoto","Só no compute da Databricks, lendo o armazenamento de objetos"],["Escrita","Não suportada","Não suportada"],["Governança","Catálogo estrangeiro do Unity Catalog, com controle em nível de tabela","Catálogo estrangeiro do Unity Catalog, com controle em nível de tabela"],["O que exige além da conexão","Nada, só a conexão com credencial e URL JDBC","Credencial de armazenamento e local externo para os caminhos das tabelas"],["Caso de uso da doc","Relatório ad hoc, BI e prova de conceito sobre banco operacional","Migração incremental para Unity Catalog ou modelo híbrido de longo prazo"],["Custo e performance","É a base da comparação","Descrita como mais econômica e mais otimizada que a de consulta"]]',
                },
                {
                    type: "table",
                    value: '[["Pergunta de decisão","Federação","Ingestão"],["Onde o dado mora depois","Continua na origem, nada é copiado","Em tabela do lakehouse"],["Quem paga o processamento da leitura","Compute da Databricks mais o compute da origem","Só o compute da Databricks, depois da carga"],["Dado sempre no estado atual","Sim, cada consulta lê a origem","Depende da frequência do pipeline"],["Escrita no destino","Não suportada","Suportada, a tabela é sua"],["Volume alto com latência baixa","A doc manda procurar outro caminho","É a recomendação da doc nesse caso"],["Histórico e time travel","Só o que a origem guardar","Sim, a tabela Delta guarda versão"],["Carga de pico na origem","Alta, a consulta analítica cai no banco transacional","Isolada, a origem é lida uma vez por carga"]]',
                },
                {
                    type: "text",
                    value: "A doc dá o critério em uma frase: escolha a abordagem pelo padrão de acesso, pelos requisitos de governança, pela necessidade de escrita e pela preferência de compute. E dá os desempates.\n\nFederação de consulta é o caminho quando você precisa de relatório ad hoc, BI ou prova de conceito sobre dado operacional guardado em banco externo. O ganho é não mover dado e manter acesso ao estado atual da origem.\n\nQuando a origem suporta os dois caminhos, a doc recomenda Lakeflow Connect se performance em volume maior e latência menor são prioridade. Essa frase resolve a questão de cenário: volume alto mais painel frequente é ingestão, não federação.\n\nFonte de dado do Spark é a alternativa em três casos: quando Lakehouse Federation não suporta a sua origem, quando você precisa de acesso de escrita, e quando precisa de mais controle sobre a execução da consulta e sobre a paralelização.\n\nFederação de catálogo é o caminho de transição: migração incremental para Unity Catalog, ou modelo híbrido de longo prazo em que parte do dado fica em catálogo externo e parte é gerenciada pelo Unity Catalog.",
                },
                {
                    type: "text",
                    value: "Vale separar federação de compartilhamento, porque as duas entregam leitura somente e a prova mistura as duas em distrator. No compartilhamento, quem toma a iniciativa é o provedor: ele publica um conjunto de ativos governados do lado dele e o destinatário monta um catálogo a partir do share. Na federação, quem toma a iniciativa é o consumidor: você monta um catálogo estrangeiro sobre um sistema que não fala o protocolo da plataforma, com credencial que é sua, e nada do outro lado precisa publicar nada.\n\nO resumo que resolve a maioria das questões é curto. Dado de outra organização que também usa a plataforma, ou de qualquer organização que aceite ler por protocolo aberto: compartilhamento. Dado de um banco ou de um catálogo externo que você precisa consultar sem copiar: federação. Dado externo que vai alimentar pipeline, com volume alto e latência baixa: ingestão.",
                },
                {
                    type: "quote",
                    value: "Na federação de consulta o trabalho é empurrado por JDBC e roda nos dois lados, no compute da Databricks e no compute remoto. Quando performance em volume maior e latência menor são prioridade, a doc recomenda ingestão com Lakeflow Connect.",
                },
            ],
            questions: [
                {
                    statement: "O que o Lakehouse Federation entrega, segundo a documentação?",
                    difficulty: "facil",
                    explanation:
                        "A doc descreve Lakehouse Federation como acesso governado e somente de leitura a dado externo, através de catálogo estrangeiro do Unity Catalog, com controle de acesso em nível de tabela. Escrita não é suportada em nenhum dos dois tipos de federação.",
                    options: [
                        {
                            text: "Acesso governado e somente de leitura a dado externo, por catálogo estrangeiro do Unity Catalog, com controle por tabela.",
                            isCorrect: true,
                        },
                        {
                            text: "Acesso governado de leitura e escrita a dado externo, por catálogo estrangeiro do Unity Catalog, com controle por coluna.",
                            isCorrect: false,
                        },
                        {
                            text: "Cópia incremental do dado externo para tabela Delta gerenciada, com controle de acesso herdado do catálogo de origem.",
                            isCorrect: false,
                        },
                        {
                            text: "Publicação de ativos do seu metastore para outra organização, com controle de acesso por objeto de destinatário e share.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em uma consulta sobre um catálogo estrangeiro criado por federação de consulta, onde o processamento acontece?",
                    difficulty: "medio",
                    explanation:
                        "A doc diz que a consulta é empurrada para o banco externo via JDBC e roda tanto no compute da Databricks quanto no remoto. Rodar só na Databricks é a descrição da federação de catálogo, que lê o armazenamento de objetos direto.",
                    options: [
                        {
                            text: "A consulta é empurrada por JDBC e roda nos dois lados, no compute da Databricks e no compute do banco remoto.",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta roda só no compute da Databricks, que lê o armazenamento de objetos da origem sem passar pelo banco.",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta roda só no compute do banco remoto, e a Databricks apenas recebe e formata o resultado já agregado.",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta roda sobre uma cópia materializada no lakehouse, atualizada pelo Unity Catalog a cada criação de conexão.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um painel precisa de dado de um PostgreSQL de alto volume, atualizado a cada hora, e a origem suporta tanto Lakehouse Federation quanto conector gerenciado. O que a documentação recomenda?",
                    difficulty: "medio",
                    explanation:
                        "A frase da doc é direta: quando a origem suporta os dois caminhos, a Databricks recomenda Lakeflow Connect se performance em volume maior e latência menor são prioridade. Federação de consulta é indicada para relatório ad hoc e prova de conceito.",
                    options: [
                        {
                            text: "Ingestão com Lakeflow Connect, porque performance em volume maior e latência menor são prioridade nesse cenário.",
                            isCorrect: true,
                        },
                        {
                            text: "Federação de consulta com catálogo estrangeiro, porque ela evita cópia e mantém o painel sempre no estado atual.",
                            isCorrect: false,
                        },
                        {
                            text: "Federação de catálogo sobre o PostgreSQL, porque a doc a descreve como mais econômica e mais otimizada em performance.",
                            isCorrect: false,
                        },
                        {
                            text: "Compartilhamento no modo aberto a partir do PostgreSQL, porque o painel passa a ler por protocolo aberto sem mover dado.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta junta uma tabela de um catálogo estrangeiro de federação de consulta com uma tabela Delta da gold, e o time estranha o volume de tráfego de rede. Qual explicação se apoia na documentação?",
                    difficulty: "dificil",
                    explanation:
                        "Pushdown acontece dentro da fonte. Um join que mistura tabela federada com tabela Delta não pode ser empurrado para o banco remoto, porque o outro lado não vive lá, então as linhas da federada atravessam a rede até o compute da Databricks. A doc já tem pushdown de join por conector, inclusive em prévia no PostgreSQL, mas só entre tabelas da mesma fonte. Cache e estatística não têm relação com isso.",
                    options: [
                        {
                            text: "Join entre a fonte federada e a tabela Delta não é empurrado, então as linhas da federada sobem para o compute.",
                            isCorrect: true,
                        },
                        {
                            text: "Filtro e agregação não estão na lista de pushdown suportado, então a tabela federada é lida inteira a cada execução.",
                            isCorrect: false,
                        },
                        {
                            text: "Catálogo estrangeiro desativa o cache de disco do cluster, então toda leitura da tabela Delta da gold também vai pela rede.",
                            isCorrect: false,
                        },
                        {
                            text: "Tabela federada não tem estatística de nível de arquivo, então o join força a leitura das duas tabelas pela rede.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time precisa ler e também gravar em um sistema externo que a federação não cobre, e quer controlar a paralelização da leitura. Qual caminho a documentação indica?",
                    difficulty: "dificil",
                    explanation:
                        "A doc aponta fonte de dado do Spark exatamente nesses casos: quando a federação não suporta a origem, quando é preciso acesso de escrita, e quando é preciso mais controle sobre a execução da consulta e a paralelização. Os dois tipos de federação são somente de leitura.",
                    options: [
                        {
                            text: "Fonte de dado do Spark, porque ela cobre origem não suportada, acesso de escrita e controle sobre execução e paralelização.",
                            isCorrect: true,
                        },
                        {
                            text: "Federação de catálogo, porque ela roda só no compute da Databricks e por isso permite escrita e ajuste de paralelismo.",
                            isCorrect: false,
                        },
                        {
                            text: "Federação de consulta com conexão JDBC própria, porque a conexão aceita a opção de escrita e o número de partições de leitura.",
                            isCorrect: false,
                        },
                        {
                            text: "Compartilhamento no modo aberto, porque o arquivo de credencial permite ao cliente externo gravar de volta na origem.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Custo e desempenho",
    aulas: [
        {
            titulo: "Photon, execução adaptativa e o plano de consulta",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você olha um plano de consulta e diz se o problema é o motor de execução, a estimativa de estatística ou o volume de embaralhamento, e qual configuração mexer em cada caso.\n\nNeste nível a pergunta nunca é o que é Photon. É por que esta consulta não acelerou com Photon ligado, e o que a execução adaptativa já decidiu sozinha antes de você tocar em configuração.",
                },
                {
                    type: "text",
                    value: "**Photon** é o motor de consulta vetorizado nativo da Databricks. Ele troca o motor Spark SQL da JVM por um runtime em C++ nos operadores suportados, e o otimizador Catalyst continua planejando a consulta. O plano é o mesmo, muda quem executa cada operador.\n\nO que ele acelera, segundo a documentação: SQL e BI, ETL e engenharia de dados, pipelines, streaming sem estado e engenharia de atributos. Entre os operadores cobertos estão varredura, filtro, projeção, agregação e junção por hash, embaralhamento, ordenação, limite, funções de janela e escrita em Delta e Parquet.",
                },
                {
                    type: "text",
                    value: "O que ele **não** acelera é o que a prova cobra:\n\n- **UDF, API de RDD e API de Dataset** não são suportadas pelo Photon.\n- **Streaming com estado** não é suportado. Photon cobre apenas streaming sem estado.\n- Consulta que já roda em menos de **dois segundos** não tem melhora relevante.\n\nQuando o Photon encontra uma operação não suportada durante a execução, ele cai de volta no runtime do Spark pelo resto daquela operação, de forma transparente. O resultado continua correto, só a aceleração desaparece, e nenhum erro é levantado. É por isso que uma consulta recheada de UDF em Python acelera quase nada mesmo com Photon ligado: reescrever a UDF como expressão nativa vale mais que qualquer configuração.",
                },
                {
                    type: "table",
                    value: '[["Compute", "Photon", "Como se controla"], ["Serverless, SQL warehouse e pipeline serverless", "Ligado por padrão", "Não é alternável"], ["All-purpose e job compute clássicos", "Ligado por padrão, alternável", "Campo runtime_engine com valor PHOTON nas APIs de clusters e de jobs"], ["Pipeline clássico", "Ligado por padrão, alternável", "Campo photon com valor true na API de pipelines"], ["Recursos que exigem Photon", "Obrigatório", "Entrada e saída preditiva, e poda dinâmica de arquivo em MERGE, UPDATE e DELETE"]]',
                },
                {
                    type: "quote",
                    value: "Photon não cobre UDF, RDD nem Dataset, e streaming com estado fica fora. Na operação não suportada ele volta para o Spark, então o ganho prometido some sem nenhum erro aparecer.",
                },
                {
                    type: "text",
                    value: "A **execução adaptativa de consulta**, AQE, replaneja a consulta durante a execução, usando a estatística real dos estágios já concluídos. Quatro decisões, exatamente as que a prova cobra:\n\n1. Trocar junção por mesclagem ordenada, sort merge join, por junção hash com difusão, broadcast hash join, em tempo de execução.\n2. Juntar partições pequenas depois do embaralhamento, para cortar overhead de agendamento e de tarefa.\n3. Tratar distorção em sort merge join e em shuffle hash join, dividindo a tarefa distorcida em tarefas de tamanho parecido.\n4. Detectar relação vazia e propagar essa informação pelo plano.\n\nA AQE vale para consulta não streaming que tenha ao menos um exchange, tipicamente junção, agregação ou janela, ou ao menos uma subconsulta. Estar ativa não garante que o plano mudou.",
                },
                {
                    type: "table",
                    value: '[["Configuração", "Padrão", "O que controla"], ["spark.databricks.optimizer.adaptive.enabled", "true", "Liga a execução adaptativa"], ["spark.databricks.adaptive.autoBroadcastJoinThreshold", "30MB", "Limite da difusão decidida em tempo de execução"], ["spark.sql.adaptive.coalescePartitions.enabled", "true", "Junta partição pequena depois do embaralhamento"], ["spark.sql.adaptive.advisoryPartitionSizeInBytes", "64MB", "Tamanho aconselhado da partição de embaralhamento"], ["spark.sql.adaptive.coalescePartitions.minPartitionSize", "1MB", "Piso de tamanho da partição"], ["spark.sql.adaptive.skewJoin.enabled", "true", "Liga o tratamento de distorção em junção"], ["spark.sql.adaptive.skewJoin.skewedPartitionFactor", "5", "Fator sobre a mediana para chamar a partição de distorcida"], ["spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "256MB", "Piso absoluto para chamar a partição de distorcida"], ["spark.databricks.adaptive.emptyRelationPropagation.enabled", "true", "Propaga relação vazia pelo plano"]]',
                },
                {
                    type: "text",
                    value: "Para achar o gargalo existem três lugares, e eles respondem perguntas diferentes.\n\n**EXPLAIN**, na própria consulta. Sozinho ele mostra só o plano físico. `EXPLAIN EXTENDED` gera o plano lógico analisado, o lógico otimizado e o físico. `EXPLAIN FORMATTED` separa a saída em um esqueleto do plano físico e os detalhes por nó, que é o formato mais legível para conferir ordem de junção e filtro empurrado. `EXPLAIN COST` gera o plano lógico junto com as estatísticas do nó, quando elas existem, e é assim que você descobre que a estimativa de tamanho está errada.",
                },
                {
                    type: "code",
                    value: "-- esqueleto do plano físico mais o detalhe por nó\nEXPLAIN FORMATTED\nSELECT c.pais, sum(f.valor)\nFROM fato_venda f JOIN dim_cliente c USING (cliente_id)\nGROUP BY c.pais;\n\n-- estatística estimada de cada nó, para desconfiar da estimativa do otimizador\nEXPLAIN COST\nSELECT * FROM fato_venda WHERE data_venda > current_date() - INTERVAL 7 DAYS;",
                },
                {
                    type: "text",
                    value: "**Interface do Spark**, em compute clássico. Na aba de SQL e DataFrame, operador do Photon aparece em **laranja** e operador padrão do Spark em **azul**, então o fallback fica visível no desenho. A consulta com AQE tem um ou mais nós `AdaptiveSparkPlan`, normalmente na raiz de cada consulta ou subconsulta, com a marca `isFinalPlan`: falsa antes e durante a execução, verdadeira quando a consulta termina. Abaixo do nó ficam o plano inicial e o plano atual ou final.\n\n**Perfil de consulta**, em SQL warehouse e serverless. A visão de detalhes de execução mostra a porcentagem do tempo de tarefa gasta no Photon, e no plano o operador do Photon aparece em roxo e o padrão em cinza. O painel de operadores mais caros ordena por tempo e é o atalho para o gargalo. E os ícones de filtro ao lado de algumas métricas de resumo indicam a porcentagem de dado podado durante a varredura, que é como você confere se a poda de partição e de arquivo realmente aconteceu.\n\nA ordem que economiza tempo: confirmar na linha do tempo qual é o estágio mais longo, olhar nele distorção e derramamento, checar se o estágio é limitado por entrada e saída, e só então procurar outras causas. Mexer em `spark.sql.shuffle.partitions` antes de olhar o plano é o erro mais comum, porque a AQE já junta partição pequena sozinha.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma agregação em SQL roda em compute com Photon ligado e o tempo não cai. O plano mostra uma UDF em Python aplicada antes do GROUP BY. O que explica a falta de ganho?",
                    difficulty: "facil",
                    explanation:
                        "A documentação diz que o Photon não suporta UDF, API de RDD e API de Dataset, e que ele cai de volta no runtime do Spark pelo resto da operação não suportada. O distrator do desligamento engana porque o fallback é por operação, não no compute inteiro.",
                    options: [
                        {
                            text: "O Photon não cobre UDF e volta ao runtime do Spark naquela operação, então a aceleração desaparece.",
                            isCorrect: true,
                        },
                        {
                            text: "O Photon só acelera leitura de arquivo Parquet, então qualquer agregação roda no motor da JVM mesmo sem UDF no caminho.",
                            isCorrect: false,
                        },
                        {
                            text: "A UDF desliga o Photon no compute inteiro até a próxima reinicialização, e só um restart devolve o ganho.",
                            isCorrect: false,
                        },
                        {
                            text: "O Photon exige vetores de exclusão habilitados na tabela para acelerar agregação com agrupamento.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual decisão a execução adaptativa de consulta toma em tempo de execução, usando a estatística real dos estágios já concluídos?",
                    difficulty: "medio",
                    explanation:
                        "A AQE troca sort merge join por broadcast hash join, junta partição pequena depois do embaralhamento, divide tarefa distorcida e propaga relação vazia. Mudar layout de tabela ou reescrever UDF não é decisão de tempo de execução, é trabalho de autor ou de manutenção.",
                    options: [
                        {
                            text: "Trocar a junção por mesclagem ordenada pela junção hash com difusão, se o lado medido cabe no limite.",
                            isCorrect: true,
                        },
                        {
                            text: "Reescrever a UDF em Python como expressão nativa, quando a função tem equivalente no catálogo interno.",
                            isCorrect: false,
                        },
                        {
                            text: "Recalcular a estatística de salto de dados da tabela de origem, gravando mínimo e máximo por arquivo novo.",
                            isCorrect: false,
                        },
                        {
                            text: "Mudar o layout físico da tabela para liquid clustering, quando o filtro repete na mesma coluna por semanas.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na interface do Spark, como você confirma que a execução adaptativa chegou ao plano final de uma consulta?",
                    difficulty: "medio",
                    explanation:
                        "A documentação de AQE diz que a consulta tem um ou mais nós AdaptiveSparkPlan, normalmente na raiz, com isFinalPlan falsa antes e durante a execução e verdadeira no fim. O laranja do desenho indica operador do Photon, não replanejamento da AQE.",
                    options: [
                        {
                            text: "Pelo nó AdaptiveSparkPlan, cuja marca isFinalPlan passa a ser verdadeira quando a consulta termina.",
                            isCorrect: true,
                        },
                        {
                            text: "Pela cor do operador no desenho, porque a AQE pinta de laranja o nó que ela reescreveu na execução.",
                            isCorrect: false,
                        },
                        {
                            text: "Pelo número de partições do estágio, que fica igual ao valor de spark.sql.shuffle.partitions no fim.",
                            isCorrect: false,
                        },
                        {
                            text: "Pela aba de ambiente, que passa a listar spark.databricks.optimizer.adaptive.enabled como verdadeira.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você suspeita que o otimizador está subestimando o tamanho de uma tabela e escolhendo difusão onde ela não cabe. Qual forma de EXPLAIN mostra a estatística estimada por nó?",
                    difficulty: "dificil",
                    explanation:
                        "Só o modo COST gera o plano lógico junto com as estatísticas do nó, quando elas existem. O modo FORMATTED engana porque tem detalhe por nó, mas o detalhe é de operador e expressão, não a estimativa de tamanho que você precisa conferir aqui.",
                    options: [
                        {
                            text: "EXPLAIN COST, que gera o plano lógico junto com as estatísticas de cada nó, quando elas existem.",
                            isCorrect: true,
                        },
                        {
                            text: "EXPLAIN CODEGEN, que gera o plano físico junto com o código produzido para a consulta, se existir.",
                            isCorrect: false,
                        },
                        {
                            text: "EXPLAIN EXTENDED, que gera o plano analisado, o otimizado e o físico, sem estatística nenhuma de nó.",
                            isCorrect: false,
                        },
                        {
                            text: "EXPLAIN FORMATTED, que separa a saída em esqueleto do plano físico e detalhe por nó, sem estatística.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Antes de mexer em configuração, qual passo o roteiro da documentação coloca primeiro na investigação de um estágio lento na interface do Spark?",
                    difficulty: "dificil",
                    explanation:
                        "O roteiro é linha do tempo dos jobs, estágio mais longo, distorção ou derramamento, checagem de carga de entrada e saída, e só então outras causas. Dobrar as partições de embaralhamento engana porque a AQE já junta partição pequena sozinha depois do embaralhamento.",
                    options: [
                        {
                            text: "Identificar o estágio mais longo e olhar nele distorção e derramamento, antes de qualquer ajuste fino.",
                            isCorrect: true,
                        },
                        {
                            text: "Subir spark.sql.shuffle.partitions para o dobro do número de cores, que é o ponto de partida sugerido.",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o tipo de instância por uma com mais memória por core, que resolve a maioria dos estágios lentos.",
                            isCorrect: false,
                        },
                        {
                            text: "Ligar o cache de disco no compute, porque releitura do mesmo Parquet é a causa mais comum de lentidão.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Embaralhamento, junção e distorção de dados",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você olha um estágio parado em três tarefas de duzentas e diz se é distorção, derramamento ou difusão que não aconteceu, e qual é a correção de cada um.\n\nEmbaralhamento, shuffle, é a troca de dados entre executores que toda junção e toda agregação por chave exige. É a operação mais cara do Spark, porque escreve em disco local, atravessa a rede e serializa tudo no caminho.",
                },
                {
                    type: "text",
                    value: "`spark.sql.shuffle.partitions` define quantas partições a consulta cria ao embaralhar para junção ou agregação. O padrão é **200**, e esse número está documentado no guia de ajuste de desempenho do **Apache Spark**, não na documentação da Databricks. A documentação da Databricks acrescenta um valor extra: colocar a configuração em `auto` liga o embaralhamento auto otimizado, que escolhe o número para você.\n\nCom a AQE ligada, esse 200 importa menos do que parece, porque a junção de partições pequenas acontece depois do embaralhamento, mirando `spark.sql.adaptive.advisoryPartitionSizeInBytes`, de 64MB por padrão. O que o 200 ainda define é o teto de paralelismo inicial: se o estágio precisa de mais paralelismo que isso, aí vale subir.",
                },
                {
                    type: "text",
                    value: "Numa **junção com difusão**, broadcast join, a tabela pequena vai inteira para todos os executores e o embaralhamento do lado grande desaparece. Quem decide é o tamanho estimado do lado pequeno, e aqui a prova gosta de misturar dois números de origens diferentes:\n\n- `spark.sql.autoBroadcastJoinThreshold` vale 10485760 bytes, ou 10 MB, por padrão. Esse número está na documentação de ajuste de desempenho do **Apache Spark**, e é o limite usado no planejamento, com estimativa. Colocar a configuração em -1 desliga a difusão automática.\n- `spark.databricks.adaptive.autoBroadcastJoinThreshold` vale **30MB** por padrão. Esse é o limite da documentação da **Databricks**, e é o que a AQE usa para trocar sort merge join por broadcast hash join em tempo de execução, já com o tamanho medido do estágio.\n\nOs dois convivem, em momentos diferentes: um decide no planejamento, o outro durante a execução. Quando o aluno responde 10 MB para uma pergunta sobre Databricks, é porque decorou o número do Apache Spark.",
                },
                {
                    type: "code",
                    value: "-- difusão forçada: o lado marcado é difundido mesmo acima do limite automático\nSELECT /*+ BROADCAST(d) */ f.pedido_id, d.nome\nFROM fato_pedido f JOIN dim_cliente d USING (cliente_id);\n\n-- reequilibra as partições de saída em tamanho razoável, depende da AQE estar ligada\nSELECT /*+ REBALANCE(cliente_id) */ cliente_id, valor FROM fato_pedido;",
                },
                {
                    type: "table",
                    value: '[["Dica", "Apelidos", "O que faz"], ["BROADCAST", "BROADCASTJOIN, MAPJOIN", "Difunde o lado marcado, ignorando o limite automático"], ["MERGE", "SHUFFLE_MERGE, MERGEJOIN", "Força junção por mesclagem ordenada com embaralhamento"], ["SHUFFLE_HASH", "nenhum", "Força junção hash com embaralhamento, e o lado menor vira o de construção"], ["SHUFFLE_REPLICATE_NL", "nenhum", "Força laço aninhado com embaralhamento e replicação"], ["REBALANCE", "nenhum", "Reequilibra as partições de saída, por melhor esforço, e é ignorada sem AQE"]]',
                },
                {
                    type: "text",
                    value: "Quando há dica de estratégia de junção nos dois lados, a prioridade é fixa: `BROADCAST`, depois `MERGE`, depois `SHUFFLE_HASH`, depois `SHUFFLE_REPLICATE_NL`. E a documentação avisa que não há garantia de que a estratégia da dica será usada, porque uma estratégia pode não suportar aquele tipo de junção. Nas dicas de particionamento, várias dicas inserem vários nós no plano lógico, e o otimizador escolhe a mais à esquerda.",
                },
                {
                    type: "text",
                    value: "**Distorção de dados** é chave de junção ou de agrupamento mal distribuída: um valor concentra a maioria das linhas, e a tarefa daquela partição sozinha define a duração do estágio. O sintoma clássico, descrito na documentação, é a consulta travar nas últimas tarefas, por exemplo as três últimas de duzentas.\n\nA AQE trata isso sozinha, dividindo a tarefa distorcida, mas só quando a partição satisfaz **as duas** condições ao mesmo tempo: ser maior que `spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes`, de 256MB, **e** maior que `spark.sql.adaptive.skewJoin.skewedPartitionFactor`, de 5, vezes a mediana das partições. Distorção menor que isso não dispara nada, e é aí que você precisa agir na mão.\n\nA página da dica `SKEW` foi retirada da documentação, com a frase de que dicas de distorção não são necessárias porque a Databricks trata distorção por padrão com a AQE. Decorar a sintaxe dela não paga; entender o limite que dispara a AQE, sim.",
                },
                {
                    type: "text",
                    value: "**Salgar a chave** é a técnica para a distorção que a AQE não pega. A recomendação de boas práticas de pipelines é literal: para distorção que acontece durante a computação, salgue a chave muito distorcida acrescentando um sufixo de balde aleatório, antes de agrupar e agregar em duas etapas. Para distorção na tabela já armazenada, a recomendação é outra, liquid clustering, não salga.\n\nA mecânica das duas etapas: primeiro agrega por chave mais sal, o que espalha o valor pesado por vários baldes e vários executores; depois agrega o resultado parcial por chave, já com pouquíssimas linhas por chave. Em junção, o lado pequeno precisa ser replicado por todos os baldes, com `explode`, para que cada linha salgada ache par.",
                },
                {
                    type: "code",
                    value: "-- etapa 1: sal materializado em coluna, para o agrupamento ficar determinístico\nWITH salgado AS (\n  SELECT cliente_id, valor, cast(rand() * 16 AS INT) AS balde\n  FROM fato_pedido\n),\nparcial AS (\n  SELECT cliente_id, balde, sum(valor) AS soma_parcial\n  FROM salgado\n  GROUP BY cliente_id, balde\n)\n-- etapa 2: poucas linhas por chave, nenhuma partição quente\nSELECT cliente_id, sum(soma_parcial) AS total\nFROM parcial\nGROUP BY cliente_id;",
                },
                {
                    type: "text",
                    value: "**Derramamento de memória**, spill, é o Spark ficar sem memória de execução para embaralhar, juntar, ordenar ou agregar e mandar dados para o disco. A documentação trata o derramamento como a primeira coisa a procurar num estágio lento, e ele é mais comum justamente durante o embaralhamento, porque mover dado da memória para o disco é caro.\n\nComo se percebe: na página do estágio, os detalhes do topo trazem estatística de derramamento, ao lado de métricas como `Peak Execution Memory`. Se não aparece estatística de derramamento, o estágio não derramou. A distorção, na mesma página, aparece em **Summary Metrics**: a regra de bolso é comparar a duração **Max** com a do percentil 75 e desconfiar quando a Max passa de 50% acima do percentil 75. Num estágio saudável as duas ficam parecidas.\n\nAs causas de problema de memória que a documentação lista: partições de embaralhamento em número insuficiente, difusão grande, UDF, função de janela sem `PARTITION BY`, distorção e estado de streaming. O teste sugerido para confirmar que o problema é memória é dobrar a memória por core mantendo o número de cores, porque o que importa é a razão entre core e memória. Se a falha demora mais para acontecer ou deixa de acontecer, era memória.",
                },
                {
                    type: "quote",
                    value: "A AQE só chama uma partição de distorcida quando ela passa de 256MB e também passa de cinco vezes a mediana. Distorção abaixo disso é sua, e a resposta é salgar a chave e agregar em duas etapas.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que uma junção com difusão evita, em comparação com a junção por mesclagem ordenada?",
                    difficulty: "facil",
                    explanation:
                        "Na difusão a tabela pequena é replicada para cada executor e a junção acontece local, sem embaralhar o lado grande. O distrator do filtro empurrado engana porque isso é salto de dados e poda de arquivo, que existe com ou sem difusão na consulta.",
                    options: [
                        {
                            text: "O embaralhamento do lado grande, porque a tabela pequena vai inteira para todos os executores.",
                            isCorrect: true,
                        },
                        {
                            text: "A leitura do lado grande, porque o filtro da tabela pequena é empurrado para a varredura de arquivo.",
                            isCorrect: false,
                        },
                        {
                            text: "A ordenação do lado pequeno, porque a difusão já entrega as linhas ordenadas pela chave de junção.",
                            isCorrect: false,
                        },
                        {
                            text: "A escrita do resultado em disco local, porque a difusão mantém o resultado na memória do driver.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em uma discussão de ajuste, alguém afirma que o limite de difusão padrão da Databricks é 10 MB. Qual é a correção?",
                    difficulty: "medio",
                    explanation:
                        "A documentação da Databricks lista spark.databricks.adaptive.autoBroadcastJoinThreshold com padrão 30MB, usado pela AQE em tempo de execução. O 10485760 bytes, ou 10 MB, é o padrão de spark.sql.autoBroadcastJoinThreshold na documentação do Apache Spark.",
                    options: [
                        {
                            text: "30 MB é o padrão de spark.databricks.adaptive.autoBroadcastJoinThreshold, e 10 MB vem da doc do Apache Spark.",
                            isCorrect: true,
                        },
                        {
                            text: "10 MB é o padrão de spark.sql.adaptive.advisoryPartitionSizeInBytes, e a difusão não tem limite configurável na Databricks.",
                            isCorrect: false,
                        },
                        {
                            text: "256 MB é o padrão de spark.databricks.adaptive.autoBroadcastJoinThreshold, desde que a AQE passou a vir ligada.",
                            isCorrect: false,
                        },
                        {
                            text: "64 MB é o padrão de spark.sql.autoBroadcastJoinThreshold na Databricks, e o valor do Apache Spark é ignorado.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na página do estágio, em Summary Metrics, a duração Max é 2,3 vezes a do percentil 75. O que a regra de bolso da documentação indica?",
                    difficulty: "medio",
                    explanation:
                        "A documentação diz que se a duração Max for 50% maior que a do percentil 75 você pode estar sofrendo de distorção, e que num estágio saudável as duas ficam parecidas. O fator cinco é da detecção da AQE sobre a mediana, não da leitura da interface.",
                    options: [
                        {
                            text: "Suspeita de distorção, porque a Max passou de 50% acima do percentil 75 e poucas tarefas dominam.",
                            isCorrect: true,
                        },
                        {
                            text: "Suspeita de derramamento, porque a diferença entre Max e percentil 75 mede a pressão de memória.",
                            isCorrect: false,
                        },
                        {
                            text: "Estágio saudável, porque a regra só acende quando a Max passa de cinco vezes a do percentil 75.",
                            isCorrect: false,
                        },
                        {
                            text: "Estágio limitado por entrada e saída, porque a Max cresce com o volume lido e não com a chave usada.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma agregação por cliente_id trava porque um cliente concentra as linhas, e a partição distorcida tem 120 MB. Qual correção a documentação de boas práticas indica?",
                    difficulty: "medio",
                    explanation:
                        "A recomendação para distorção durante a computação é salgar a chave muito distorcida com sufixo de balde aleatório e agrupar em duas etapas. Subir o fator não ajuda porque 120 MB já está abaixo do piso de 256MB, e janela sem PARTITION BY joga tudo em uma partição.",
                    options: [
                        {
                            text: "Salgar a chave com sufixo de balde aleatório e agregar em duas etapas, parcial por balde e depois total.",
                            isCorrect: true,
                        },
                        {
                            text: "Subir spark.sql.adaptive.skewJoin.skewedPartitionFactor para dez, deixando a AQE dividir a tarefa pesada.",
                            isCorrect: false,
                        },
                        {
                            text: "Particionar a tabela por cliente_id, para que cada chave caia em um diretório separado no armazenamento.",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a agregação por função de janela sem PARTITION BY, que distribui o cálculo por todos os executores.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um estágio de junção tem mediana de partição de 8 MB e uma partição de 180 MB. Com as configurações padrão, a AQE divide essa tarefa?",
                    difficulty: "dificil",
                    explanation:
                        "A AQE considera distorcida a partição que é maior que skewedPartitionThresholdInBytes, de 256MB, e também maior que skewedPartitionFactor, de 5, vezes a mediana. As duas condições valem juntas, então 180 MB não dispara nada mesmo com 22 vezes a mediana.",
                    options: [
                        {
                            text: "Não, porque além de passar o fator sobre a mediana a partição precisa ser maior que 256MB também.",
                            isCorrect: true,
                        },
                        {
                            text: "Sim, porque 180 MB passa de cinco vezes a mediana, e esse é o único critério que a AQE aplica.",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, porque a partição passa do tamanho aconselhado de 64MB, que é o gatilho do tratamento de distorção.",
                            isCorrect: false,
                        },
                        {
                            text: "Não, porque o tratamento de distorção da AQE vale só para junção hash com difusão, não para mesclagem.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Liquid clustering, Z-order e vetores de exclusão",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você decide o layout físico de uma tabela Delta sem chutar: quando liquid clustering, por que o particionamento saiu da recomendação, e o que os vetores de exclusão cobram de volta na leitura.\n\nLayout é o que mais mexe no custo de leitura, porque nenhuma configuração de compute compensa varrer arquivo que poderia ter sido podado.",
                },
                {
                    type: "text",
                    value: "**Liquid clustering** substitui particionamento de tabela e `ZORDER`. A frase da documentação é direta: a Databricks recomenda liquid clustering para toda tabela nova, inclusive tabela de streaming e visão materializada. Ele é **incompatível** com os dois, então não existe tabela com particionamento mais clustering, nem com clustering mais `ZORDER`.\n\nOs números que valem decorar:\n\n- Disponibilidade geral em tabela Delta a partir do Databricks Runtime 15.4 LTS, e acionar o clustering funciona desde o 13.3 LTS.\n- Até **quatro** chaves de clustering. Em tabela abaixo de 10 TB, chave a mais pode piorar o filtro de uma coluna só.\n- `CLUSTER BY AUTO` deixa a Databricks escolher a chave pelo histórico de consultas, e só troca a chave quando o ganho previsto de salto de dados supera o custo de reclusterizar. Exige otimização preditiva, e vale para tabela Delta gerenciada do Unity Catalog a partir do 15.4 LTS.\n- `OPTIMIZE tabela FULL` reclusteriza todo o dado existente conforme a necessidade, e é o que você roda ao habilitar clustering pela primeira vez ou ao trocar a chave. Disponível a partir do 16.4 LTS, e em tabela grande pode levar horas. O `OPTIMIZE` comum é incremental: reescreve só o dado que precisa de clustering.",
                },
                {
                    type: "table",
                    value: '[["Critério", "Particionamento", "ZORDER", "Liquid clustering"], ["Recomendação atual da doc", "Não para tabela nova", "Não para tabela nova", "Toda tabela nova"], ["Cardinalidade da coluna", "Baixa, senão explode em diretórios", "Alta", "Alta, e resiste a distorção"], ["Trocar a chave depois", "Reescrever a tabela", "Mudar no próximo OPTIMIZE", "ALTER TABLE CLUSTER BY, sem reescrever tudo"], ["Quantas colunas", "Quantas quiser, com risco", "Várias, com perda a cada uma", "Até quatro"], ["Combina com os outros", "Não com clustering", "Não com clustering", "Não com nenhum dos dois"]]',
                },
                {
                    type: "code",
                    value: "-- tabela nova com chave explícita, até quatro colunas\nCREATE TABLE vendas (\n  pedido_id BIGINT,\n  cliente_id BIGINT,\n  data_venda DATE,\n  valor DECIMAL(18,2)\n) CLUSTER BY (cliente_id, data_venda);\n\n-- deixar a plataforma escolher a chave pelo histórico de consultas\nALTER TABLE vendas CLUSTER BY AUTO;\n\n-- reclusterizar o que já estava gravado, depois de trocar a chave\nOPTIMIZE vendas FULL;\n\n-- converter tabela particionada, a partir do Databricks Runtime 18.1\nALTER TABLE vendas_antiga REPLACE PARTITIONED BY WITH CLUSTER BY (data_venda, cliente_id);\n\n-- desligar o clustering\nALTER TABLE vendas CLUSTER BY NONE;",
                },
                {
                    type: "text",
                    value: "Nem toda escrita clusteriza. O clustering na escrita só dispara quando o dado da transação passa de um limiar, e o limiar depende de quantas colunas de clustering a tabela tem e de a tabela ser gerenciada no Unity Catalog ou não. Vale para `INSERT INTO`, `CREATE TABLE AS SELECT`, `REPLACE TABLE AS SELECT`, `COPY INTO` a partir de Parquet e gravação em modo de acréscimo.",
                },
                {
                    type: "table",
                    value: '[["Colunas de clustering", "Tabela gerenciada do Unity Catalog", "Outra tabela Delta"], ["1", "64 MB", "256 MB"], ["2", "256 MB", "1 GB"], ["3", "512 MB", "2 GB"], ["4", "1 GB", "4 GB"]]',
                },
                {
                    type: "text",
                    value: "Como não toda operação clusteriza na escrita, a documentação recomenda rodar `OPTIMIZE` com frequência, e sem otimização preditiva sugere a cada uma ou duas horas em tabela com muita atualização ou inserção.\n\nE o clustering só rende se existir **estatística** por arquivo. A estatística é coletada automaticamente na escrita, com mínimo, máximo, contagem de nulos e total de registros por arquivo, e é ela que permite pular arquivo inteiro:\n\n- Em tabela **externa** do Unity Catalog, a estatística cobre por padrão as **32 primeiras colunas** do esquema. Coluna 33 em diante não pula nada.\n- Em tabela **gerenciada**, a otimização preditiva escolhe as colunas pela frequência com que elas aparecem em filtro, e o limite de 32 não se aplica.\n- `delta.dataSkippingStatsColumns` lista as colunas na mão, a partir do Databricks Runtime 13.3 LTS, e substitui `delta.dataSkippingNumIndexedCols`. Trocar a propriedade não recalcula o que já existe: do 14.3 LTS em diante use `ANALYZE TABLE tabela COMPUTE DELTA STATISTICS`.\n- `ZORDER` em coluna sem estatística coletada é ineficaz e gasta compute sem necessidade, nas palavras da própria documentação.",
                },
                {
                    type: "text",
                    value: "A **poda dinâmica de arquivo** fecha o ciclo: ela usa o resultado do lado pequeno da junção para descartar arquivo do lado grande antes de ler. Vem ligada, em `spark.databricks.optimizer.dynamicFilePruning` com valor `true`, e só dispara acima de dois pisos no lado de sonda: `spark.databricks.optimizer.deltaTableSizeThreshold`, de 10 GB, e `spark.databricks.optimizer.deltaTableFilesThreshold`, de 10 arquivos. A documentação diz que ela é especialmente eficiente em tabela **não particionada** e em junção por coluna que não é de partição, e que em `MERGE`, `UPDATE` e `DELETE` ela exige compute com Photon.\n\nEm `MERGE`, isso se soma à técnica mais simples de todas: estreitar o espaço de busca no predicado. A documentação mostra exatamente esse ajuste, acrescentando uma condição de data à cláusula de correspondência para que a busca de duplicata olhe só os últimos dias da tabela, em vez da tabela inteira.",
                },
                {
                    type: "text",
                    value: "**Vetores de exclusão** mudam o jeito de apagar e atualizar. Em vez de reescrever o arquivo Parquet que contém a linha afetada, a operação marca a linha como modificada em metadado, e a leitura aplica as entradas do vetor no momento da consulta para resolver o estado atual da tabela.\n\nO que eles evitam: a reescrita do arquivo inteiro a cada `DELETE`, `UPDATE` e `MERGE`, que em tabela grande é a maior parte do custo dessas operações. Ligar é propriedade de tabela, `delta.enableDeletionVectors` com valor `true`.\n\nVersões que a prova cobra: **leitura** a partir do Databricks Runtime 12.2 LTS; **escrita** com todas as otimizações a partir do 14.3 LTS, sendo que sem Photon o `DELETE` pede 12.2 LTS, o `UPDATE` pede 14.1 e o `MERGE` pede 14.3 LTS. Concorrência em nível de linha a partir do 14.2.",
                },
                {
                    type: "text",
                    value: "O que eles custam: toda leitura passa a aplicar o vetor, e a exclusão é **lógica** até o arquivo ser reescrito. Enquanto não for, o dado antigo continua no armazenamento, o que é problema de custo e de conformidade.\n\nQuem reescreve: `OPTIMIZE`, `REORG TABLE ... APPLY (PURGE)` ou uma escrita com compactação automática. A documentação avisa que a compactação não dá garantia estrita, então parte das mudanças pode não ser aplicada se o arquivo alvo não entrar como candidato. Para remover o dado de verdade, a sequência é `REORG TABLE ... APPLY (PURGE)` e depois `VACUUM` com o limite de retenção alcançando o instante em que a purga terminou.\n\nDois detalhes finos: `spark.databricks.delta.reorg.purgeMode` vem em `all`, que varre o rodapé de todos os arquivos Parquet e fica lento em tabela grande, e pode ir para `rows`, que limita a varredura aos arquivos com linha removida logicamente. E habilitar vetores **sobe o protocolo da tabela**, então cliente sem suporte deixa de ler, e não é possível rebaixar o protocolo depois.",
                },
                {
                    type: "code",
                    value: "-- habilitar em tabela existente: isso sobe o protocolo da tabela\nALTER TABLE vendas SET TBLPROPERTIES ('delta.enableDeletionVectors' = true);\n\n-- limitar a varredura aos arquivos com linha removida logicamente\nSET spark.databricks.delta.reorg.purgeMode = rows;\n\n-- aplicar fisicamente as exclusões lógicas, reescrevendo os arquivos afetados\nREORG TABLE vendas APPLY (PURGE);",
                },
                {
                    type: "quote",
                    value: "Liquid clustering substitui particionamento e ZORDER, e não combina com nenhum dos dois. Vetor de exclusão troca reescrita na escrita por trabalho na leitura, e a exclusão só é física depois de REORG APPLY PURGE.",
                },
            ],
            questions: [
                {
                    statement:
                        "Você vai criar uma tabela Delta nova, filtrada por uma coluna de alta cardinalidade. O que a documentação recomenda hoje para o layout?",
                    difficulty: "facil",
                    explanation:
                        "A documentação diz que a Databricks recomenda liquid clustering para toda tabela nova, inclusive tabela de streaming e visão materializada, e que ele substitui particionamento e ZORDER. Combinar as técnicas não é possível, porque elas são incompatíveis entre si.",
                    options: [
                        {
                            text: "Liquid clustering, que a doc recomenda para toda tabela nova e substitui particionamento e ZORDER.",
                            isCorrect: true,
                        },
                        {
                            text: "Particionamento por data mais ZORDER na coluna filtrada, combinação recomendada para alta cardinalidade.",
                            isCorrect: false,
                        },
                        {
                            text: "Particionamento pela coluna filtrada, que garante poda de diretório mesmo sem estatística coletada.",
                            isCorrect: false,
                        },
                        {
                            text: "ZORDER sozinho em OPTIMIZE semanal, recomendado quando a tabela não tem coluna de data para partição.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você acabou de trocar as chaves de clustering de uma tabela grande. Qual comando reclusteriza o dado que já estava gravado?",
                    difficulty: "medio",
                    explanation:
                        "OPTIMIZE FULL reclusteriza todo o dado existente e é o indicado ao habilitar clustering pela primeira vez ou ao trocar a chave. O OPTIMIZE comum engana porque é incremental: ele reescreve apenas o dado que precisa de clustering, deixando o antigo como está.",
                    options: [
                        {
                            text: "OPTIMIZE tabela FULL, que reclusteriza todo o dado existente conforme a necessidade.",
                            isCorrect: true,
                        },
                        {
                            text: "OPTIMIZE tabela, que é incremental e reescreve também o dado antigo com a chave nova.",
                            isCorrect: false,
                        },
                        {
                            text: "REORG TABLE tabela APPLY (PURGE), que reescreve os arquivos aplicando o layout novo.",
                            isCorrect: false,
                        },
                        {
                            text: "ANALYZE TABLE tabela COMPUTE DELTA STATISTICS, que recalcula a estatística e o layout.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o custo de leitura que os vetores de exclusão introduzem em uma tabela com muitos DELETE?",
                    difficulty: "medio",
                    explanation:
                        "A documentação diz que os vetores de exclusão marcam a linha como modificada em metadado e que a leitura aplica as entradas do vetor no momento da consulta. A reescrita engana porque ela acontece depois, em OPTIMIZE ou REORG APPLY PURGE, não na leitura.",
                    options: [
                        {
                            text: "O leitor precisa aplicar as entradas do vetor no momento da consulta, resolvendo o estado atual.",
                            isCorrect: true,
                        },
                        {
                            text: "O leitor precisa recalcular a estatística de mínimo e máximo por arquivo antes do salto de dados.",
                            isCorrect: false,
                        },
                        {
                            text: "O leitor precisa abrir o log de transações inteiro, porque o vetor mora fora do ponto de verificação.",
                            isCorrect: false,
                        },
                        {
                            text: "O leitor precisa reescrever os arquivos Parquet afetados antes de devolver as linhas para a consulta.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pedido de apagamento exige que as linhas saiam fisicamente do armazenamento, em uma tabela com vetores de exclusão. Qual sequência a documentação indica?",
                    difficulty: "dificil",
                    explanation:
                        "A exclusão é lógica até os arquivos Parquet serem reescritos. A doc indica rodar REORG TABLE APPLY PURGE, que reescreve os arquivos com mudança de vetor, e depois VACUUM com a retenção alcançando o instante da purga. Desligar o vetor não remove os que já existem.",
                    options: [
                        {
                            text: "REORG TABLE com APPLY (PURGE) e depois VACUUM com a retenção no instante final da purga.",
                            isCorrect: true,
                        },
                        {
                            text: "OPTIMIZE com ZORDER na coluna de identificação e depois VACUUM com retenção de zero hora.",
                            isCorrect: false,
                        },
                        {
                            text: "DELETE com a mesma condição outra vez e depois VACUUM com a retenção padrão de sete dias.",
                            isCorrect: false,
                        },
                        {
                            text: "ALTER TABLE com SET TBLPROPERTIES desligando o vetor e depois OPTIMIZE na tabela inteira.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um MERGE em uma tabela Delta de 40 GB não está podando arquivo pelo predicado de junção. Qual requisito a documentação aponta?",
                    difficulty: "dificil",
                    explanation:
                        "A documentação diz que poda dinâmica de arquivo em MERGE, UPDATE e DELETE exige compute com Photon. Os limiares são piso, não teto: deltaTableSizeThreshold pede ao menos 10 GB e deltaTableFilesThreshold ao menos 10 arquivos no lado de sonda da junção.",
                    options: [
                        {
                            text: "Poda dinâmica de arquivo em MERGE, UPDATE e DELETE exige compute com Photon habilitado nele.",
                            isCorrect: true,
                        },
                        {
                            text: "Poda dinâmica de arquivo exige mais de 10 arquivos e menos de 10 GB no lado de sonda da junção.",
                            isCorrect: false,
                        },
                        {
                            text: "Poda dinâmica de arquivo exige particionamento pela coluna de junção, e por isso ela falha aqui.",
                            isCorrect: false,
                        },
                        {
                            text: "Poda dinâmica de arquivo exige a dica BROADCAST no lado pequeno, senão o filtro não é propagado.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cache, compactação e otimização preditiva",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você sabe qual cache responde por uma segunda leitura rápida, por que uma tabela cheia de arquivo pequeno continua lenta mesmo com `OPTIMIZE` agendado, e o que a plataforma já faz sozinha antes de você agendar manutenção.\n\nO erro de custo mais caro aqui é duplicar trabalho: rodar `OPTIMIZE` e `VACUUM` em job próprio sobre tabela que a otimização preditiva já cuida, e pagar duas vezes pela mesma manutenção.",
                },
                {
                    type: "text",
                    value: "O **cache de disco**, antes chamado de Delta cache e de DBIO cache, copia o dado remoto para o armazenamento local do nó, para que a leitura seguinte seja local. Ele cobre arquivo **Parquet**, o que inclui tabela Delta Lake, e se popula sozinho na primeira leitura.\n\nPontos que a prova cobra: ele detecta arquivo criado, apagado, modificado ou sobrescrito e se atualiza, então você não invalida nada na mão. A remoção é por menos usado recentemente, por mudança no arquivo ou por reinício do compute. Tipo de worker com volume SSD já vem habilitado e configurado para ele, e o cache usa no máximo **metade** do espaço do SSD local. Em SQL warehouse e no Databricks Runtime 14.2 em diante, o comando `CACHE SELECT` é ignorado, porque um algoritmo melhor de cache de disco entrou no lugar.",
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Cache de disco", "Cache do Spark com cache ou persist"], ["Onde guarda", "Arquivo local no nó de trabalho", "Bloco em memória, conforme o nível de armazenamento"], ["O que cobre", "Qualquer tabela Parquet no armazenamento remoto", "Qualquer DataFrame ou RDD"], ["Como se popula", "Sozinho, na primeira leitura", "Só com mudança explícita no código"], ["Disponibilidade", "Alternável, e padrão em certos tipos de nó", "Sempre disponível"], ["Remoção", "Menos usado, mudança de arquivo ou reinício", "Menos usado ou chamada de unpersist"]]',
                },
                {
                    type: "code",
                    value: "# valores de exemplo da documentação, que não publica padrão para os três últimos\nspark.databricks.io.cache.enabled true\nspark.databricks.io.cache.maxDiskUsage 50g\nspark.databricks.io.cache.maxMetaDataCache 1g\nspark.databricks.io.cache.compression.enabled false",
                },
                {
                    type: "text",
                    value: "Duas correções automáticas para o problema de arquivo pequeno, e a prova cobra a diferença entre elas.\n\n**Escrita otimizada**, propriedade de tabela `delta.autoOptimize.optimizeWrite` e configuração de sessão `spark.databricks.delta.optimizeWrite.enabled`. Ela reorganiza o dado antes de gravar, mirando arquivo de **128 MB**. Já vem habilitada em `MERGE`, em `UPDATE` com subconsulta e em `DELETE` com subconsulta, e também em `CREATE TABLE AS SELECT` e `INSERT` em SQL warehouse. Do Databricks Runtime 13.3 LTS em diante vale ainda para `CREATE TABLE AS SELECT` e `INSERT` em tabela particionada registrada no Unity Catalog.\n\n**Compactação automática**, propriedade `delta.autoOptimize.autoCompact` e configuração `spark.databricks.delta.autoCompact.enabled`. Ela roda depois de uma escrita bem sucedida, quando o número de arquivos pequenos alcança o mínimo de `spark.databricks.delta.autoCompact.minNumFiles`, e o teto de saída fica em `spark.databricks.delta.autoCompact.maxFileSize`. O valor `true` mira **128 MB**; o valor `auto`, que é o recomendado, autossintoniza o tamanho.\n\nO detalhe que a prova adora: compactação automática e escrita otimizada estão **sempre** habilitadas em `MERGE`, `UPDATE` e `DELETE`, e isso não se desliga.",
                },
                {
                    type: "text",
                    value: "Sem alvo fixo, a plataforma autossintoniza o tamanho de arquivo pelo tamanho da tabela. `delta.targetFileSize` fixa o alvo para todas as operações de layout, incluindo `OPTIMIZE`, liquid clustering, compactação automática e escrita otimizada, e é sempre melhor esforço. Em tabela gerenciada do Unity Catalog em SQL warehouse ou no Databricks Runtime 11.3 LTS em diante, só o `OPTIMIZE` respeita esse alvo. A autossintonia não se aplica a tabela com alvo fixo definido, e arquivo já gravado não é reescrito só porque o alvo cresceu.",
                },
                {
                    type: "table",
                    value: '[["Tamanho da tabela", "Tamanho alvo de arquivo"], ["Abaixo de 2,56 TB", "256 MB"], ["De 2,56 TB a 10 TB", "Cresce linearmente de 256 MB até 1 GB"], ["Acima de 10 TB", "1 GB"]]',
                },
                {
                    type: "code",
                    value: "-- alvo fixo, respeitado pelo OPTIMIZE em tabela gerenciada do Unity Catalog\nALTER TABLE vendas SET TBLPROPERTIES ('delta.targetFileSize' = '100mb');\n\n-- compactação automática com tamanho autossintonizado, o valor recomendado\nALTER TABLE vendas SET TBLPROPERTIES ('delta.autoOptimize.autoCompact' = 'auto');",
                },
                {
                    type: "text",
                    value: "A **otimização preditiva** faz a manutenção sozinha em tabela gerenciada do Unity Catalog: identifica a tabela que se beneficia, enfileira a operação e coleta estatística quando o dado é gravado. O que ela roda:\n\n- `OPTIMIZE`, para melhorar tamanho de arquivo e acionar clustering incremental. Ela **não** roda `ZORDER` e **ignora** arquivo já ordenado por Z.\n- `VACUUM`, apagando arquivo que a tabela não referencia mais. A janela de retenção tem padrão de **sete dias**, definido por `delta.deletedFileRetentionDuration`.\n- `ANALYZE`, coletando estatística para melhorar o desempenho das consultas.\n- A escolha de chave do clustering automático, quando a tabela está em `CLUSTER BY AUTO`.\n\nEscopo e cobrança: só tabela gerenciada do Unity Catalog, Delta ou Iceberg, e a doc é explícita em dizer que apenas tabela gerenciada é suportada. Tabela externa fica fora. Ela vem habilitada por padrão em conta criada em 11 de novembro de 2024 ou depois, exige plano Premium ou superior, e roda em compute serverless de jobs, cobrada no SKU serverless de jobs.",
                },
                {
                    type: "code",
                    value: "-- herança de cima para baixo: catálogo, esquema e tabela\nALTER CATALOG analytics ENABLE PREDICTIVE OPTIMIZATION;\nALTER SCHEMA analytics.ouro INHERIT PREDICTIVE OPTIMIZATION;\nALTER TABLE analytics.ouro.vendas DISABLE PREDICTIVE OPTIMIZATION;\n\n-- conferir o estado atual\nDESCRIBE TABLE EXTENDED analytics.ouro.vendas;",
                },
                {
                    type: "text",
                    value: "Visão materializada entra na conta de custo por um motivo: só pipeline em compute serverless consegue **refresh incremental**. Em compute clássico a visão é sempre recomputada por inteiro, o que encarece cada atualização, e o refresh incremental é bem mais barato que rodar a consulta do zero a cada disparo.\n\nA política fica em `REFRESH POLICY`: `AUTO`, o padrão, faz análise de custo e escolhe o mais barato entre incremental e completo; `INCREMENTAL` prefere incremental e pode cair no completo; `INCREMENTAL STRICT` falha se não der para incrementalizar; `FULL` nunca incrementaliza.\n\nO que derruba a incrementalização: `WITH RECURSIVE` sempre cai em recomputação completa; função não determinística não é suportada, com exceção de função de tempo em `WHERE`; e `SUM`, `AVG` e covariância sobre `FLOAT` ou `DOUBLE` podem forçar recomputação completa, o que se evita convertendo para `DECIMAL`. Para descobrir qual caminho rodou, consulte o log de eventos buscando `planning_information`, onde a técnica aparece como `FULL_RECOMPUTE`, `NO_OP` ou um dos modos incrementais, como `ROW_BASED` e `GROUP_AGGREGATE`. Para testar antes de publicar, use `EXPLAIN CREATE MATERIALIZED VIEW`.",
                },
                {
                    type: "quote",
                    value: "Compactação automática e escrita otimizada já estão sempre ligadas em MERGE, UPDATE e DELETE. Em tabela gerenciada do Unity Catalog, OPTIMIZE e VACUUM agendados na mão costumam ser custo duplicado.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é a diferença entre o cache de disco e o cache do Spark pedido com cache ou persist?",
                    difficulty: "facil",
                    explanation:
                        "O cache de disco copia dado remoto para o armazenamento local do nó, cobre qualquer tabela Parquet, inclusive Delta, e se popula na primeira leitura. O cache do Spark guarda bloco em memória, é pedido no código e se aplica a DataFrame ou RDD, não a arquivo.",
                    options: [
                        {
                            text: "O cache de disco guarda arquivo local no nó e se popula sozinho na primeira leitura de Parquet.",
                            isCorrect: true,
                        },
                        {
                            text: "O cache de disco guarda bloco em memória no executor e precisa de chamada explícita no código.",
                            isCorrect: false,
                        },
                        {
                            text: "O cache de disco vale para qualquer DataFrame, inclusive resultado de UDF, e nunca expira sozinho.",
                            isCorrect: false,
                        },
                        {
                            text: "O cache de disco exige invalidação na mão quando o arquivo de origem muda, igual ao cache do Spark.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com a compactação automática ligada no valor true, qual tamanho de arquivo ela mira, e o que muda ao usar auto?",
                    difficulty: "medio",
                    explanation:
                        "A documentação diz que a compactação automática no valor true usa 128 MB e que auto, recomendado, autossintoniza o tamanho. O 1 GB engana porque é o teto da autossintonia por tamanho de tabela, aplicado acima de 10 TB, e não o alvo fixo da compactação.",
                    options: [
                        {
                            text: "Mira 128 MB com true, e com auto, que é o recomendado, o tamanho passa a ser autossintonizado.",
                            isCorrect: true,
                        },
                        {
                            text: "Mira 1 GB com true, e com auto o tamanho cai para 128 MB em qualquer tamanho de tabela.",
                            isCorrect: false,
                        },
                        {
                            text: "Mira 256 MB com true, e com auto o alvo passa a seguir sempre o delta.targetFileSize da tabela.",
                            isCorrect: false,
                        },
                        {
                            text: "Mira 32 MB com true, e com auto a compactação só roda quando a otimização preditiva aciona.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quais operações de manutenção a otimização preditiva roda, e em que tipo de tabela?",
                    difficulty: "medio",
                    explanation:
                        "A doc lista OPTIMIZE, VACUUM, ANALYZE e a escolha de chave do clustering automático, e diz que só tabela gerenciada do Unity Catalog é suportada. Ela também diz que o OPTIMIZE da otimização preditiva não roda ZORDER e ignora arquivo já ordenado por Z.",
                    options: [
                        {
                            text: "OPTIMIZE, VACUUM e ANALYZE, só em tabela gerenciada do Unity Catalog, e sem nunca rodar ZORDER.",
                            isCorrect: true,
                        },
                        {
                            text: "OPTIMIZE, VACUUM e ZORDER, em tabela gerenciada e externa do Unity Catalog, de forma assíncrona.",
                            isCorrect: false,
                        },
                        {
                            text: "OPTIMIZE e REORG APPLY PURGE, só em tabela externa do Unity Catalog, acionados pelo dono da tabela.",
                            isCorrect: false,
                        },
                        {
                            text: "VACUUM e ANALYZE, em qualquer tabela Delta, inclusive registrada no Hive metastore legado da conta.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a janela de retenção que o VACUUM da otimização preditiva usa por padrão, e qual propriedade a define?",
                    difficulty: "medio",
                    explanation:
                        "A documentação de otimização preditiva diz que o VACUUM apaga arquivo que a tabela não referencia mais e que a janela de retenção tem padrão de sete dias, definido por delta.deletedFileRetentionDuration. O padrão de vinte e quatro horas não existe nessa propriedade.",
                    options: [
                        {
                            text: "Sete dias, definidos por delta.deletedFileRetentionDuration na propriedade da tabela.",
                            isCorrect: true,
                        },
                        {
                            text: "Trinta dias, definidos por delta.logRetentionDuration na propriedade da tabela.",
                            isCorrect: false,
                        },
                        {
                            text: "Vinte e quatro horas, definidas por delta.targetFileSize na propriedade da tabela.",
                            isCorrect: false,
                        },
                        {
                            text: "Um dia, definido por delta.deletedFileRetentionDuration, cujo padrão é de vinte e quatro horas.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma visão materializada com SUM sobre coluna DOUBLE passou a fazer recomputação completa a cada atualização. O que a documentação indica?",
                    difficulty: "dificil",
                    explanation:
                        "A doc de refresh incremental lista SUM, AVG e covariância sobre FLOAT ou DOUBLE como caso que pode forçar recomputação completa, e sugere converter para DECIMAL. GROUP BY é incrementalizável, e a política padrão é AUTO, que escolhe o caminho mais barato.",
                    options: [
                        {
                            text: "SUM e AVG sobre FLOAT ou DOUBLE podem forçar refresh completo, e converter para DECIMAL evita isso.",
                            isCorrect: true,
                        },
                        {
                            text: "Refresh incremental exige chave de clustering na visão, e sem CLUSTER BY a recomputação é sempre total.",
                            isCorrect: false,
                        },
                        {
                            text: "Refresh incremental não suporta GROUP BY, então toda agregação na visão cai em recomputação completa.",
                            isCorrect: false,
                        },
                        {
                            text: "Refresh incremental exige REFRESH POLICY FULL declarado, que é o padrão de visão criada sem política.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Escolher compute: serverless, autoescala e spot",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você escolhe compute por carga sem olhar tabela de preço: qual job vai para serverless, qual precisa de cluster clássico, onde a autoescala ajuda, e o que nunca entra em instância spot.\n\nA regra que resume o resto: serverless é o padrão recomendado na documentação, e clássico é a exceção justificada por um requisito que o serverless não atende.",
                },
                {
                    type: "table",
                    value: '[["Carga", "Escolha recomendada", "Quando fugir dela"], ["Notebook interativo", "Compute serverless", "API de RDD ou linguagem R, que pedem all-purpose clássico"], ["Análise em SQL e BI", "SQL warehouse serverless", "Rede personalizada ou serverless indisponível, que pedem o tipo pro"], ["Job automatizado", "Compute serverless", "Job não SQL que precisa de ajuste de cluster que o serverless não tem"], ["Pipeline", "Compute serverless", "Recurso não suportado no serverless, ou Hive metastore legado"], ["Job em all-purpose", "Evitar", "All-purpose não é otimizado para carga automatizada"]]',
                },
                {
                    type: "text",
                    value: "Em job serverless, a autoescala e o Photon já ficam habilitados automaticamente, e a plataforma ainda ajusta tipo de instância, memória e motor de processamento por carga. O que sobra para você decidir é o **modo de desempenho**:\n\n- **Otimizado para desempenho ligado**: o job começa e roda mais rápido, e a doc o descreve como desenhado para carga sensível a tempo.\n- **Otimizado para desempenho desligado**, o modo padrão: usa menos compute e por isso custa menos, com partida de cerca de **quatro a seis minutos**, dependendo de disponibilidade e agendamento.\n\nOs dois modos usam o **mesmo SKU**: o que muda é o consumo de DBU, menor no modo padrão porque ele usa menos compute. O ajuste fica na página de detalhes do job, vale só para as tarefas serverless, e o job precisa de ao menos uma tarefa serverless para a opção aparecer. O modo padrão não é suportado em pipeline contínuo.",
                },
                {
                    type: "text",
                    value: "Em compute clássico a autoescala tem duas implementações, e a prova mistura os números das duas.\n\n**Autoescala otimizada**, no plano Premium ou superior: vai do mínimo ao máximo em no máximo **dois** eventos de escala; reduz mesmo com o compute não ocioso, olhando o estado dos arquivos de embaralhamento; reduz por porcentagem dos nós atuais; em **job compute** reduz após subutilização nos últimos **40 segundos**, e em **all-purpose** após **150 segundos**. A frequência da decisão de redução fica em `spark.databricks.aggressiveWindowDownS`, com máximo de 600.\n\n**Autoescala padrão**, no plano Standard: começa adicionando **8 nós** e sobe de forma exponencial até o máximo; reduz quando **90% dos nós** ficaram ociosos por **10 minutos** e o compute ficou ocioso por ao menos **30 segundos**; e desce de forma exponencial, começando por um nó.\n\nDuas restrições que a prova cobra: autoescala não está disponível para job com `spark-submit`, e não se liga a alocação dinâmica do Spark em compute com autoescala. E se o provedor encerrar instância, o compute pode cair abaixo do mínimo configurado, com a plataforma tentando reprovisionar.",
                },
                {
                    type: "table",
                    value: '[["Comportamento", "Autoescala otimizada", "Autoescala padrão"], ["Plano", "Premium ou superior", "Standard"], ["Subida", "Do mínimo ao máximo em até dois eventos", "Começa com 8 nós e cresce exponencialmente"], ["Descida em job compute", "Subutilização nos últimos 40 segundos", "90% dos nós ociosos por 10 minutos"], ["Descida em all-purpose", "Subutilização nos últimos 150 segundos", "90% dos nós ociosos por 10 minutos"], ["Precisa estar ocioso", "Não, usa o estado dos arquivos de embaralhamento", "Sim, ao menos 30 segundos de compute ocioso"]]',
                },
                {
                    type: "text",
                    value: "Em pipelines a autoescala aprimorada é outra coisa: ela decide por **utilização de slot de tarefa** e **tamanho da fila de tarefas**, e desliga nó subutilizado de forma mais proativa que a autoescala de cluster, que só remove nó ocioso. É o padrão em pipeline novo, e no serverless ela está sempre ligada e não se desliga. A recomendação é deixar o mínimo de workers no valor padrão e definir o máximo pelo orçamento e pela prioridade do pipeline. Mudar isso em pipeline contínuo provoca reinício.\n\nNo serverless existe ainda autoescala **vertical**, separada da horizontal: ela escolhe o tamanho da instância, sobe para um tamanho maior depois de falha por falta de memória, e desce quando a memória fica subutilizada por tempo suficiente.",
                },
                {
                    type: "text",
                    value: "**Instância spot** troca preço por risco de ser reivindicada pelo provedor. Na criação do compute clássico a caixa fica na seção de desempenho avançado, e a regra que a prova cobra é curta: o **driver sempre roda sob demanda**, porque a primeira instância é sempre sob demanda. Nunca aponte o tipo do driver para um pool de spot; escolha um tipo sob demanda para o driver, para que ele não possa ser reivindicado no meio do job.\n\nNa API, `first_on_demand` dentro de `aws_attributes` diz quantos dos primeiros nós ficam sob demanda, e precisa ser maior que zero para o driver cair em sob demanda. Se o valor for maior ou igual ao tamanho do cluster, todo o cluster fica sob demanda. O campo `availability` vale para os nós depois desses, com padrão `SPOT_WITH_FALLBACK`, e `spot_bid_price_percent` é a oferta como porcentagem do preço sob demanda, com padrão 100.\n\nQuem vai para spot: carga com requisito de latência frouxo, que é a recomendação literal das boas práticas de configuração. Quem não vai: o driver, e qualquer coisa com prazo apertado, porque perder nó custa reprocessamento. Mudar a porcentagem da oferta não tem efeito quando o tipo de worker é de frota.",
                },
                {
                    type: "code",
                    value: '{\n  "aws_attributes": {\n    "first_on_demand": 1,\n    "availability": "SPOT_WITH_FALLBACK",\n    "spot_bid_price_percent": 100\n  }\n}',
                },
                {
                    type: "text",
                    value: "Escolha de compute só fecha com o número na mão, e o número vem de duas tabelas de sistema.\n\n`system.billing.usage` traz o consumo: `usage_quantity` com as unidades consumidas no registro, `sku_name` com o SKU, `usage_metadata` com os identificadores de compute e de job, e `billing_origin_product` com o produto que originou o uso. O registro pode levar até **24 horas** para aparecer.\n\n`system.billing.list_prices` traz o preço de lista, com um registro novo a cada mudança de preço de SKU. Os campos que importam: `price_start_time` e `price_end_time` delimitando a validade, `currency_code`, `usage_unit`, e a estrutura `pricing`, em que `default` é o preço de longo prazo, `promotional` é o preço temporário e `effective_list` resolve os dois e é o valor usado para calcular custo.",
                },
                {
                    type: "code",
                    value: "-- custo em dinheiro por job, juntando consumo e preço de lista vigente na hora do uso\nSELECT\n  u.usage_metadata.job_id,\n  sum(u.usage_quantity * p.pricing.effective_list.default) AS custo\nFROM system.billing.usage u\nJOIN system.billing.list_prices p\n  ON p.sku_name = u.sku_name\n AND u.usage_end_time >= p.price_start_time\n AND u.usage_end_time < coalesce(p.price_end_time, current_timestamp())\nWHERE u.usage_metadata.job_id IS NOT NULL\nGROUP BY ALL;",
                },
                {
                    type: "quote",
                    value: "O driver nunca vai para spot, porque a primeira instância é sempre sob demanda. E o modo padrão de job serverless não troca de SKU, troca de consumo de DBU.",
                },
            ],
            questions: [
                {
                    statement:
                        "Em um cluster clássico com instância spot habilitada, qual nó nunca roda em spot?",
                    difficulty: "facil",
                    explanation:
                        "A documentação de configuração de compute diz que o driver sempre roda sob demanda e que a primeira instância é sempre sob demanda. Ela também avisa para não usar pool de spot como tipo do driver, justamente para que ele não seja reivindicado pelo provedor.",
                    options: [
                        {
                            text: "O driver, porque a primeira instância do cluster é sempre sob demanda, por configuração.",
                            isCorrect: true,
                        },
                        {
                            text: "O primeiro executor, porque ele guarda os arquivos de embaralhamento do estágio inicial.",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum, porque ao marcar a opção todos os nós passam a usar instância spot do provedor.",
                            isCorrect: false,
                        },
                        {
                            text: "O executor com cache de disco populado, porque o cache se perde ao recuperar a instância.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que muda ao desligar o modo otimizado para desempenho em um job serverless?",
                    difficulty: "medio",
                    explanation:
                        "A doc diz que o modo padrão usa menos compute e por isso consome menos DBU, com partida de cerca de quatro a seis minutos, e que o SKU é o mesmo nos dois modos. Autoescala e Photon ficam habilitados automaticamente no serverless, independente do modo escolhido.",
                    options: [
                        {
                            text: "O job usa menos compute e custa menos DBU, com partida de cerca de quatro a seis minutos.",
                            isCorrect: true,
                        },
                        {
                            text: "O job troca de SKU para o de all-purpose clássico, que tem preço de DBU mais baixo por hora.",
                            isCorrect: false,
                        },
                        {
                            text: "O job perde a autoescala e passa a rodar com um número fixo de executores definido na tarefa.",
                            isCorrect: false,
                        },
                        {
                            text: "O job perde o Photon e volta ao motor da JVM, o que explica a diferença de preço entre os modos.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com a autoescala otimizada, depois de quanto tempo de subutilização o compute reduz, em job compute e em all-purpose?",
                    difficulty: "medio",
                    explanation:
                        "A documentação diz que a autoescala otimizada reduz job compute após subutilização nos últimos quarenta segundos e all-purpose após cento e cinquenta segundos. Os dez minutos com noventa por cento dos nós ociosos são da autoescala padrão, do plano Standard.",
                    options: [
                        {
                            text: "Quarenta segundos de subutilização em job compute e cento e cinquenta segundos em all-purpose.",
                            isCorrect: true,
                        },
                        {
                            text: "Dez minutos em job compute e trinta segundos em all-purpose, nos dois casos com noventa por cento ocioso.",
                            isCorrect: false,
                        },
                        {
                            text: "Cento e cinquenta segundos em job compute e dez minutos em all-purpose, medidos pela fila de tarefas.",
                            isCorrect: false,
                        },
                        {
                            text: "Seiscentos segundos nos dois casos, valor fixado por spark.databricks.aggressiveWindowDownS.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual sinal a autoescala aprimorada de pipelines usa para decidir escala, e o que ela faz de diferente da autoescala de cluster?",
                    difficulty: "medio",
                    explanation:
                        "A doc de autoescala de pipelines cita utilização de slot de tarefa e tamanho da fila de tarefas, e diz que ela desliga nó subutilizado de forma mais proativa que a autoescala de cluster, que só remove nó ocioso. Ela é padrão em pipeline novo e obrigatória no serverless.",
                    options: [
                        {
                            text: "Utilização de slot de tarefa e tamanho da fila, e desliga nó subutilizado, não só nó ocioso.",
                            isCorrect: true,
                        },
                        {
                            text: "Custo acumulado no SKU do pipeline e tamanho da fila, e troca o tipo de instância a cada atualização.",
                            isCorrect: false,
                        },
                        {
                            text: "Pressão de memória do driver apenas, e espera o nó ficar ocioso por dez minutos antes de removê-lo.",
                            isCorrect: false,
                        },
                        {
                            text: "Volume de arquivo novo na origem, e mantém o número de nós fixo durante a atualização em curso.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você precisa do custo em dinheiro por job, não em DBU. Quais tabelas de sistema combinar?",
                    difficulty: "dificil",
                    explanation:
                        "A quantidade consumida fica em system.billing.usage, com usage_quantity e usage_metadata, e o preço fica em system.billing.list_prices, cuja chave effective_list resolve preço de lista e promocional e é o valor usado para calcular custo. A tabela de uso não traz valor em dinheiro.",
                    options: [
                        {
                            text: "system.billing.usage com system.billing.list_prices, usando effective_list dentro de pricing.",
                            isCorrect: true,
                        },
                        {
                            text: "system.billing.usage com system.access.audit, usando o identificador de job do metadado de uso.",
                            isCorrect: false,
                        },
                        {
                            text: "system.query.history com system.billing.list_prices, usando o tempo de tarefa agregado por consulta.",
                            isCorrect: false,
                        },
                        {
                            text: "system.billing.usage sozinha, porque ela já traz a coluna de custo convertida na moeda da conta.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Segurança, conformidade e governança",
    aulas: [
        {
            titulo: "Segredos: escopo, ACL e o limite da ocultação",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você decide onde uma credencial vive, quem pode lê-la e, principalmente, sabe dizer o que a ocultação automática **não** protege. A prova gosta dessa última parte: ela mostra uma saída de notebook com `[REDACTED]` e pergunta se o segredo está seguro.\n\nUm escopo de segredo é uma coleção nomeada de segredos. A recomendação da documentação é alinhar escopo a papel ou a aplicação, não a pessoa. O nome do escopo é único no workspace, aceita letras, números, traço, sublinhado, arroba e ponto, tem no máximo 128 caracteres e não diferencia maiúscula de minúscula. Detalhe que vira pegadinha: nome de escopo é tratado como informação **não sensível** e qualquer usuário do workspace consegue listá-lo, então não descreva o banco de produção no nome do escopo.",
                },
                {
                    type: "table",
                    value: '[["Tipo de escopo","Onde o valor fica guardado","Quem grava o valor"],["Apoiado na Databricks","Banco criptografado que a Databricks gerencia","CLI, SDK ou API de segredos"],["Apoiado em cofre do provedor","No cofre da sua própria assinatura","Só pelo provedor, a interface é de leitura"]]',
                },
                {
                    type: "text",
                    value: "A documentação da variante AWS descreve apenas o escopo apoiado na Databricks, que ela define como armazenado em um banco criptografado de propriedade e gestão da Databricks. O escopo apoiado em cofre aparece na documentação da variante Azure, onde ele é descrito como uma interface somente de leitura para o Azure Key Vault: você cria e atualiza o segredo no cofre, não na Databricks.\n\nQuem cria o escopo recebe `MANAGE` por padrão. Na tela de criação existe o campo **Manage Principal**, que escolhe entre **Creator** e **All workspace users** para decidir quem fica com `MANAGE`, e escolher **Creator** exige plano Premium ou acima. Apagar o escopo apaga todos os segredos e todas as ACLs dele.",
                },
                {
                    type: "code",
                    value: 'databricks secrets create-scope vendas_prod\n\ndatabricks secrets put-secret --json \'{\n  "scope": "vendas_prod",\n  "key": "jdbc_password",\n  "string_value": "troque-depois"\n}\'\n\n# segredo de várias linhas entra pela entrada padrão\n(cat <<EOF\n-----BEGIN PRIVATE KEY-----\nlinha2\nEOF\n) | databricks secrets put-secret vendas_prod chave_privada\n\ndatabricks secrets put-acl vendas_prod engenharia-dados READ\ndatabricks secrets list-acls vendas_prod',
                },
                {
                    type: "text",
                    value: "A lista de controle de acesso do segredo vive no **nível do escopo**, nunca no segredo individual. São três níveis cumulativos: `READ` lê os segredos e lista as chaves do escopo, `WRITE` acrescenta gravar no escopo e `MANAGE` acrescenta modificar permissões. O principal é identificado por e-mail quando é usuário, pelo `applicationId` quando é service principal e pelo nome quando é grupo. Repetir um `put-acl` para o mesmo principal sobrescreve o nível anterior, e `get-acl` falha quando não existe ACL daquele principal naquele escopo.\n\nA consequência prática de a ACL ser de escopo: quem recebe acesso a um escopo apoiado em cofre passa a ter acesso a **todos** os segredos daquele cofre. Para separar times, use instâncias de cofre diferentes, não chaves diferentes dentro do mesmo cofre.",
                },
                {
                    type: "quote",
                    value: "A ocultação vale só para valor literal. Ela não impede transformação deliberada e arbitrária de um literal de segredo.",
                },
                {
                    type: "text",
                    value: "A ocultação troca por `[REDACTED]` o valor lido com `dbutils.secrets.get()` e o valor referenciado em propriedade de configuração do Spark. Ela cobre o acidente, não a intenção. `print(senha)` sai ocultado; `print(senha[::-1])`, `print(len(senha))` ou qualquer concatenação não saem, porque o que chega na saída já não é o literal. A própria documentação avisa que administradores do workspace, o criador do segredo e quem recebeu permissão conseguem ler o segredo, e que não é possível impedir totalmente esses usuários de ver o conteúdo. O controle real é a ACL, somada à permissão de executar comandos naquele contexto.\n\nEm SQL vale a mesma regra, com dois acréscimos. A plataforma tenta redigir comandos de consulta que chamam a função `secret`, inclusive através de views e de funções definidas pelo usuário, e isso também só alcança valor literal. Em comandos de manipulação, a busca do segredo é liberada quando ele vem embrulhado em função criptográfica como `sha()` ou `aes_encrypt()`, e o analisador de consulta tenta bloquear o comando que gravaria o segredo em claro em uma tabela.\n\nPara referenciar o segredo fora do código, a sintaxe é `spark.<property-name> {{secrets/<scope-name>/<secret-name>}}` na configuração do Spark e `<variable-name>={{secrets/<scope-name>/<secret-name>}}` na variável de ambiente. Cada propriedade referencia um único segredo, o dono do cluster precisa de permissão de leitura no escopo e só o dono do cluster adiciona ou edita essa referência.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Escopo de segredo do workspace","Segredo no Unity Catalog"],["Nome","escopo mais chave, dentro de um workspace","catalog.schema.secret, nos três níveis"],["Permissão","ACL de escopo: READ, WRITE, MANAGE","CREATE SECRET, READ SECRET, WRITE SECRET, REFERENCE SECRET"],["Granularidade","o escopo inteiro de uma vez","o segredo, com herança de catálogo e schema"],["Leitura no código","dbutils.secrets.get(scope=, key=)","dbutils.secrets.get(catalog=, schema=, key=)"],["Fonte externa","cofre do provedor apoiando o escopo","schema apoiado em gerenciador de segredo da nuvem"]]',
                },
                {
                    type: "code",
                    value: "-- o segredo como objeto governável, nos três níveis\nGRANT READ SECRET ON SECRET main.default.jdbc_password TO `engenharia-dados`;\nGRANT REFERENCE SECRET ON SECRET main.default.jdbc_password TO `analistas`;\n\n-- leitura em SQL, com a variante que devolve nulo em vez de erro\nSELECT secret('vendas_prod', 'jdbc_password');\nSELECT try_secret('vendas_prod', 'chave_que_nao_existe');",
                },
                {
                    type: "text",
                    value: "`REFERENCE SECRET` é o privilégio que resolve o caso do pipeline: ele permite referenciar o segredo **sem** acesso ao valor, então o objeto do Unity Catalog autentica e a pessoa que dispara não vê a credencial. Para ler de verdade é `READ SECRET`, e em qualquer caso ainda são necessários `USE CATALOG` no catálogo e `USE SCHEMA` no schema. Criar exige `CREATE SECRET`, concedido no catálogo ou no schema.\n\nDois detalhes que a prova explora. Primeiro: valor obtido pela API REST **não** passa pela ocultação, embora o acesso continue registrado no log de auditoria, e por isso a recomendação é ler por `dbutils`. Segundo: um schema pode ser apoiado em um gerenciador externo, AWS Secrets Manager ou Azure Key Vault, e nesse modo o Unity Catalog recusa `CREATE SECRET`, `WRITE SECRET` e a exclusão, porque o valor é administrado fora. Um schema não mistura os dois modos.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma conta de serviço precisa ler os segredos de um escopo e listar as chaves dele, mas não pode gravar valor novo nem alterar permissão. Qual nível de ACL atende exatamente a isso?",
                    difficulty: "facil",
                    explanation:
                        "READ lê os segredos e lista as chaves, e para no que a questão pede. WRITE engana porque parece o nível natural de quem usa o segredo, mas ele acrescenta gravar valor no escopo, o que a conta de serviço não pode fazer.",
                    options: [
                        {
                            text: "`READ`, que lê os segredos e lista as chaves do escopo",
                            isCorrect: true,
                        },
                        {
                            text: "`WRITE`, que lê e também grava segredos naquele escopo",
                            isCorrect: false,
                        },
                        {
                            text: "`MANAGE`, que lê, grava e altera permissão do escopo",
                            isCorrect: false,
                        },
                        {
                            text: "`SELECT`, que autoriza consulta ao valor do segredo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma analista roda o trecho abaixo em um notebook e vê `[REDACTED]` na primeira impressão, mas a senha legível na segunda.\n\n```python\nsenha = dbutils.secrets.get(scope='vendas_prod', key='jdbc_password')\nprint(senha)\nprint(senha[::-1])\n```\n\nQual explicação está de acordo com a documentação?",
                    difficulty: "medio",
                    explanation:
                        "A ocultação vale só para valor literal e não impede transformação deliberada e arbitrária do literal. A string invertida já não é o literal, então nada é trocado por [REDACTED]. A ACL é o controle real, não a ocultação.",
                    options: [
                        {
                            text: "A ocultação cobre só o valor literal, e a string invertida já não é o literal",
                            isCorrect: true,
                        },
                        {
                            text: "A ocultação cobre só a saída de célula SQL, e impressão em Python fica fora",
                            isCorrect: false,
                        },
                        {
                            text: "A ocultação exige ACL `MANAGE` no escopo, e sem ela o valor sai sempre limpo",
                            isCorrect: false,
                        },
                        {
                            text: "A ocultação vale só na primeira leitura da sessão, e a segunda sai sem filtro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um escopo apoiado em cofre do provedor guarda doze segredos, e o time de BI precisa ler apenas um deles. O que a documentação indica fazer?",
                    difficulty: "medio",
                    explanation:
                        "A ACL de segredo é de escopo, então quem entra no escopo alcança todos os segredos do cofre. A separação se faz com instâncias de cofre diferentes. Conceder por chave engana porque é o que a intuição espera, mas esse nível não existe.",
                    options: [
                        {
                            text: "Usar outro cofre e outro escopo, porque a ACL vale no nível do escopo",
                            isCorrect: true,
                        },
                        {
                            text: "Conceder `READ` só naquela chave, porque a ACL aceita nível de segredo",
                            isCorrect: false,
                        },
                        {
                            text: "Negar as outras onze chaves, porque a ACL aceita recusa explícita",
                            isCorrect: false,
                        },
                        {
                            text: "Marcar as outras onze como ocultas, porque a ACL lê atributo de chave",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pipeline precisa usar um segredo do Unity Catalog para autenticar, e a pessoa que dispara o pipeline não pode ver o valor. Qual privilégio no segredo resolve?",
                    difficulty: "dificil",
                    explanation:
                        "REFERENCE SECRET permite referenciar o segredo sem acesso ao valor, que é exatamente o pedido. READ SECRET engana porque é o privilégio de leitura mais citado, mas ele entrega o valor para quem consulta e quebra o requisito.",
                    options: [
                        {
                            text: "`REFERENCE SECRET`, que referencia o segredo sem acesso ao valor",
                            isCorrect: true,
                        },
                        {
                            text: "`READ SECRET`, que recupera o valor do segredo para quem consulta",
                            isCorrect: false,
                        },
                        {
                            text: "`WRITE SECRET`, que atualiza o valor de um segredo já existente",
                            isCorrect: false,
                        },
                        {
                            text: "`CREATE SECRET`, que cria um segredo novo dentro daquele schema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual afirmação sobre a leitura de um segredo do Unity Catalog está de acordo com a documentação?",
                    difficulty: "dificil",
                    explanation:
                        "A documentação diz que o valor obtido pela API REST não passa pela ocultação, mas que o acesso continua no log de auditoria, e por isso recomenda dbutils. A alternativa que iguala API e dbutils engana porque a ocultação parece ser do produto inteiro.",
                    options: [
                        {
                            text: "Valor lido pela API REST não passa pela ocultação, mas fica na auditoria",
                            isCorrect: true,
                        },
                        {
                            text: "Valor lido pela API REST passa pela mesma ocultação da leitura por `dbutils`",
                            isCorrect: false,
                        },
                        {
                            text: "Valor lido por `dbutils` não passa pela ocultação, e o acesso não é auditado",
                            isCorrect: false,
                        },
                        {
                            text: "Valor lido pela API REST exige `MANAGE` no catálogo e dispensa auditoria",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Chave gerenciada pelo cliente e criptografia",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você olha para um dado qualquer da plataforma e diz qual das duas chaves gerenciadas pelo cliente o protege. É assim que a prova pergunta: ela descreve um dado, por exemplo o histórico de consultas ou a raiz do DBFS, e pede a configuração correta.\n\nChave gerenciada pelo cliente, ou customer-managed key, é registrar na Databricks uma referência a uma chave do serviço de gerenciamento de chaves da sua nuvem e deixar a plataforma criptografar com ela. O recurso exige o nível **Enterprise**. São dois casos de uso, e o nome deles é o vocabulário que a prova usa: `MANAGED_SERVICES`, para o dado de serviço gerenciado que fica no plano de controle, e `STORAGE`, para o armazenamento do workspace, que fica na sua conta de nuvem.",
                },
                {
                    type: "table",
                    value: '[["Dado","Chave que protege"],["Fonte e metadado de notebook","Serviço gerenciado"],["Segredos da Databricks","Serviço gerenciado"],["Consulta e histórico de consultas do Databricks SQL","Serviço gerenciado"],["Token de acesso pessoal e credencial de Git das pastas de Git","Serviço gerenciado"],["Imagem de contêiner e artefato do Model Serving","Serviço gerenciado"],["Raiz do DBFS, FileStore e modelos do MLflow na raiz","Armazenamento do workspace"],["Resultado de job, resultado do Databricks SQL e revisão de notebook","Armazenamento do workspace"],["Volume EBS remoto do compute clássico","Armazenamento do workspace, opcional"],["Ponto de montagem do DBFS","Nenhuma das duas"]]',
                },
                {
                    type: "code",
                    value: 'POST /api/2.0/accounts/{account_id}/customer-managed-keys\n{\n  "use_cases": ["MANAGED_SERVICES"],\n  "aws_key_info": {\n    "key_arn": "arn:aws:kms:us-east-1:111122223333:key/abcd-1234",\n    "key_alias": "databricks-managed-services",\n    "key_region": "us-east-1"\n  }\n}',
                },
                {
                    type: "text",
                    value: "A chamada acima apenas envia para a Databricks uma referência à sua chave e devolve o identificador da configuração. Esse identificador é o que você passa ao workspace, em `managed_services_customer_managed_key_id` ou em `storage_customer_managed_key_id`. O campo obrigatório dentro de `aws_key_info` é o `key_arn`; `key_alias` e `key_region` são opcionais. O mesmo trabalho sai pela linha de comando com `databricks account encryption-keys create`.\n\nO sinalizador `reuse_key_for_cluster_volumes` só faz sentido quando `STORAGE` está na lista: com ele verdadeiro ou omitido, a mesma chave criptografa o volume EBS do cluster, e `false` recusa esse uso. Atualização de chave para o armazenamento do workspace pode levar até 24 horas para valer.",
                },
                {
                    type: "quote",
                    value: "Chave de serviço gerenciado protege o que a Databricks guarda; chave de armazenamento protege o que está na sua conta de nuvem.",
                },
                {
                    type: "table",
                    value: '[["Pegadinha","O que a documentação diz"],["Ponto de montagem do DBFS","Não é coberto pela chave de armazenamento, resolva no próprio bucket"],["Workspace serverless","Basta configurar a chave de serviço gerenciado, que vale também para o armazenamento"],["Volume EBS em serverless","A criptografia de volume EBS remoto não se aplica a compute serverless"],["Painel de IA e BI","Coberto apenas se foi criado depois de 1 de novembro de 2024"],["Campo statement_text do histórico","Pode vir vazio até existir chave configurada para o catálogo system"],["Resultado interativo de notebook","Parte fica no plano de controle e parte no bucket, então as duas chaves aparecem"]]',
                },
                {
                    type: "text",
                    value: "Duas leituras valem decorar. A primeira é a do workspace serverless: como não existe plano de computação clássico para proteger, você só configura chave para serviço gerenciado, e essa configuração passa a valer também para o armazenamento do workspace e para o armazenamento raiz. A segunda é a do histórico de consultas: ao definir a chave de serviço gerenciado, campos como `statement_text` na tabela de sistema de histórico podem aparecer vazios até você configurar uma chave para o catálogo `system`. Em uma prova que pergunta por que o analista perdeu o texto da consulta, essa é a resposta.\n\nPor último, separe os dois assuntos que a prova adora misturar: criptografia em repouso responde quem consegue ler o arquivo no armazenamento, e privilégio do Unity Catalog responde quem consegue consultar a tabela. Configurar chave própria não esconde coluna de ninguém que já tem `SELECT`; para isso existem máscara e filtro, que são o assunto da próxima aula.",
                },
            ],
            questions: [
                {
                    statement:
                        "O time de conformidade exige que a fonte dos notebooks e os segredos da Databricks sejam criptografados com uma chave do seu próprio serviço de chaves. Qual caso de uso você registra?",
                    difficulty: "facil",
                    explanation:
                        "Fonte de notebook e segredos ficam no plano de controle, cobertos pelo caso de uso de serviço gerenciado. STORAGE engana porque parece cobrir tudo que é persistido, mas ele trata do bucket do workspace e do volume do compute.",
                    options: [
                        {
                            text: "`MANAGED_SERVICES`, porque esse dado fica no plano de controle",
                            isCorrect: true,
                        },
                        {
                            text: "`STORAGE`, porque esse dado fica no bucket raiz do workspace",
                            isCorrect: false,
                        },
                        {
                            text: "`MANAGED_SERVICES` e `STORAGE`, porque o dado é gravado nos dois",
                            isCorrect: false,
                        },
                        {
                            text: "`CLUSTER_VOLUMES`, porque o dado é gravado no disco do compute",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A auditoria pede chave própria para a raiz do DBFS, para as revisões de notebook e para os resultados de job. Qual caso de uso cobre esses três?",
                    difficulty: "medio",
                    explanation:
                        "Raiz do DBFS, revisão de notebook e resultado de job são dado de sistema no bucket do workspace, cobertos por STORAGE. MANAGED_SERVICES engana porque notebook aparece nos dois lados, mas o que ele cobre é a fonte e o metadado no plano de controle.",
                    options: [
                        {
                            text: "`STORAGE`, que cobre o bucket raiz do workspace e o dado de sistema",
                            isCorrect: true,
                        },
                        {
                            text: "`MANAGED_SERVICES`, que cobre todo artefato ligado a notebook e a job",
                            isCorrect: false,
                        },
                        {
                            text: "`MANAGED_SERVICES`, que cobre qualquer resultado de execução",
                            isCorrect: false,
                        },
                        {
                            text: "`STORAGE` apenas depois de desligar o ponto de montagem do DBFS",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um workspace novo usa apenas compute serverless e precisa de chave gerenciada pelo cliente. O que a documentação manda configurar?",
                    difficulty: "medio",
                    explanation:
                        "Em workspace serverless você só configura a chave de serviço gerenciado, e ela passa a valer também para o armazenamento do workspace e o raiz. Pedir as duas engana porque é o que se faz no workspace clássico, com plano de computação próprio.",
                    options: [
                        {
                            text: "Só a chave de serviço gerenciado, que vale também para o armazenamento",
                            isCorrect: true,
                        },
                        {
                            text: "As duas chaves, porque todo workspace precisa das duas configurações juntas",
                            isCorrect: false,
                        },
                        {
                            text: "Só a chave de armazenamento, porque o serverless grava na sua conta",
                            isCorrect: false,
                        },
                        {
                            text: "As duas chaves mais a de volume, por causa do disco efêmero do nó",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de configurar a chave de serviço gerenciado, uma analista nota que o campo `statement_text` do histórico de consultas vem vazio. Qual é a causa documentada?",
                    difficulty: "medio",
                    explanation:
                        "A documentação avisa que definir a chave de serviço gerenciado pode esvaziar campos como statement_text até existir chave configurada para o catálogo system. Culpar privilégio engana porque o sintoma é campo vazio, não erro de permissão.",
                    options: [
                        {
                            text: "Falta chave configurada para o catálogo `system`, que guarda o histórico",
                            isCorrect: true,
                        },
                        {
                            text: "Falta `SELECT` no schema do histórico de consultas, que a chave passou a exigir",
                            isCorrect: false,
                        },
                        {
                            text: "A chave de serviço gerenciado não cobre consulta, só fonte de notebook",
                            isCorrect: false,
                        },
                        {
                            text: "O histórico passou a viver no bucket, e falta a chave de armazenamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um workspace clássico tem as duas chaves gerenciadas pelo cliente configuradas, e ainda assim um auditor aponta dado em claro em um bucket de terceiros montado no DBFS. O que explica isso?",
                    difficulty: "dificil",
                    explanation:
                        "A chave de armazenamento cobre o bucket raiz e o volume EBS, e a documentação diz que ponto de montagem do DBFS não é coberto: a criptografia tem de vir do próprio bucket. Culpar a propagação de 24 horas engana porque o prazo existe, mas é de atualização de chave.",
                    options: [
                        {
                            text: "Ponto de montagem do DBFS não entra na chave de armazenamento",
                            isCorrect: true,
                        },
                        {
                            text: "Bucket de terceiros exige o caso de uso `MANAGED_SERVICES` junto",
                            isCorrect: false,
                        },
                        {
                            text: "A chave só vale após as 24 horas de propagação da configuração",
                            isCorrect: false,
                        },
                        {
                            text: "Falta o sinalizador que reaproveita a chave em volume de cluster",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Filtro de linha e máscara de coluna em escala",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você entrega uma tabela única para públicos diferentes sem duplicar dado, e sabe antecipar as três situações em que esse controle quebra o resto do pipeline: viagem no tempo, clone e compartilhamento.\n\nOs dois controles são funções SQL definidas pelo usuário, amarradas à tabela. O **filtro de linha** recebe colunas e devolve booleano: a linha em que a função devolve `FALSE` é excluída do resultado. A **máscara de coluna** recebe o valor da coluna no primeiro parâmetro e devolve o valor original ou uma versão protegida, e o tipo de retorno precisa ser conversível para o tipo da coluna.",
                },
                {
                    type: "code",
                    value: "-- filtro de linha: devolve booleano\nCREATE FUNCTION us_filter(region STRING)\n  RETURN IF(IS_ACCOUNT_GROUP_MEMBER('admin'), true, region = 'US');\n\nALTER TABLE vendas SET ROW FILTER us_filter ON (region);\nALTER TABLE vendas DROP ROW FILTER;\n\n-- máscara de coluna: primeiro parâmetro é a coluna mascarada\nCREATE FUNCTION ssn_mask(ssn STRING)\n  RETURN CASE WHEN is_account_group_member('rh') THEN ssn\n              ELSE '***-**-****' END;\n\nALTER TABLE pessoas ALTER COLUMN ssn SET MASK ssn_mask;\nALTER TABLE pessoas ALTER COLUMN ssn DROP MASK;",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Filtro de linha","Máscara de coluna"],["Onde é amarrado","na tabela, com SET ROW FILTER","na coluna, com ALTER COLUMN SET MASK"],["O que a função devolve","booleano, e FALSE corta a linha","valor conversível para o tipo da coluna"],["Quantos por objeto","um filtro distinto resolvido por usuário e tabela","uma máscara por coluna"],["Parâmetro extra","colunas listadas na cláusula ON","colunas ou literais em USING COLUMNS"],["Como sai","ALTER TABLE ... DROP ROW FILTER","ALTER COLUMN ... DROP MASK"]]',
                },
                {
                    type: "text",
                    value: "Privilégio é o primeiro ponto que a prova cobra. Para **associar** a função à tabela você precisa de `EXECUTE` na função, `USE SCHEMA` no schema e `USE CATALOG` no catálogo. Sobre a tabela, em tabela nova basta `CREATE TABLE` no schema; em tabela existente é preciso **ser o dono** ou ter `MANAGE` **e** `SELECT` sobre ela, e `MODIFY` também entra se o mesmo comando alterar o schema. De compute, serve um SQL warehouse, modo de acesso padrão no Databricks Runtime 12.2 LTS ou acima, ou modo dedicado no 15.4 LTS ou acima. Runtime abaixo de 12.2 LTS não suporta os dois recursos e falha de forma segura, sem devolver dado.\n\nQuando os dois se combinam na mesma tabela, eles não competem: o filtro decide quais linhas sobram e a máscara decide como cada valor aparece nas linhas que sobraram. O limite é de quantidade, não de combinação. Só **um filtro de linha distinto** pode resolver em tempo de execução para um dado usuário e uma dada tabela, e só **uma máscara distinta por coluna**. Se dois caminhos resolvem filtros diferentes para o mesmo usuário, o acesso é bloqueado em vez de alguém escolher o mais restritivo; em máscara, o erro é `COLUMN_MASKS_FEATURE_NOT_SUPPORTED.MULTIPLE_MASKS`. Caminhos que resolvem no mesmo filtro ou na mesma máscara convivem sem conflito.\n\nDuas dependências proibidas fecham o assunto: filtro e máscara não podem referenciar tabela que também tenha filtro ou máscara ativos, e uma coluna já mascarada por uma política não serve de entrada para o `USING COLUMNS` de outra.",
                },
                {
                    type: "code",
                    value: "-- máscara com parâmetro extra: coluna e literal depois do primeiro parâmetro\nCREATE FUNCTION mask_address_by_country(\n    address STRING,\n    country STRING,\n    group_suffix STRING DEFAULT '_address_viewers')\n  RETURN IF(is_account_group_member(country || group_suffix), address, 'REDACTED');\n\nALTER TABLE clientes\n  ALTER COLUMN address\n  SET MASK mask_address_by_country USING COLUMNS (country, '_address_viewers');",
                },
                {
                    type: "quote",
                    value: "Tire o filtro ou a máscara da tabela antes de derrubar a função. Fora dessa ordem, a tabela fica inacessível.",
                },
                {
                    type: "table",
                    value: '[["Situação","Com filtro de linha ou máscara de nível de tabela"],["Viagem no tempo","Não é suportada com filtro ou máscara de nível de tabela"],["Clone profundo e clone raso","Não são suportados em tabela com filtro ou máscara"],["View","Não se aplica filtro nem máscara a uma view"],["Compartilhamento aberto","O provedor não compartilha tabela com filtro ou máscara de nível de tabela"],["API do Delta Lake","Não é suportada nessas tabelas"],["Acesso por caminho de arquivo","Não é suportado em tabela com política"],["Catálogo REST do Iceberg e API REST do Unity","Não acessam tabela com filtro ou máscara"],["Coluna gerada","Máscara não se aplica a coluna referenciada por coluna gerada"],["Índice de busca de IA","Não é possível criar índice a partir dessa tabela"]]',
                },
                {
                    type: "text",
                    value: "A armadilha mais silenciosa é de tipo. Quando o tipo da coluna difere do tipo do parâmetro da função, a plataforma converte de forma implícita. Com o modo ANSI desligado, o valor que não converte vira nulo **em silêncio**, e um filtro que compara nulo deixa de cortar linha: o exemplo da própria documentação é uma coluna `STRING` passada para um parâmetro `INT`, que devolveu todas as linhas. A correção é declarar o parâmetro como `STRING`, e a recomendação geral é manter o modo ANSI ligado para que a conversão falhada levante erro em vez de abrir a tabela.\n\nDesempenho fecha a aula, porque toda consulta paga a função. As recomendações são: funções simples, `CASE` em vez de tabela de mapeamento ou subconsulta; poucas máscaras distintas em tabela grande, reaproveitando a mesma função; poucos argumentos, já que coluna referenciada não pode ser eliminada pelo otimizador; evitar filtro com muitos `AND` encadeados; usar expressão determinística que não lance erro, como `try_divide`, para não bloquear a descida do predicado; e preferir SQL a Python, marcando a função como determinística quando Python for inevitável.\n\nQuando a mesma regra precisa valer em dezenas de tabelas, a própria documentação manda trocar a amarração por tabela por política de atributo, que é a aula seguinte.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que acontece com as linhas em que a função associada como filtro de linha devolve `FALSE`?",
                    difficulty: "facil",
                    explanation:
                        "O filtro mantém a linha em que a função devolve verdadeiro e exclui a linha em que devolve falso. Devolver a linha com valor nulo engana porque é o comportamento de máscara, que troca o valor em vez de cortar o registro.",
                    options: [
                        {
                            text: "São excluídas do resultado, porque o filtro mantém só o verdadeiro",
                            isCorrect: true,
                        },
                        {
                            text: "Voltam com as colunas anuladas, porque o filtro anula em vez de cortar",
                            isCorrect: false,
                        },
                        {
                            text: "Voltam com as colunas mascaradas, porque o filtro chama a máscara",
                            isCorrect: false,
                        },
                        {
                            text: "Provocam erro na consulta, porque o filtro exige retorno verdadeiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você precisa aplicar uma máscara em uma coluna de uma tabela que não é sua. Além de `EXECUTE` na função, `USE SCHEMA` e `USE CATALOG`, o que a documentação exige sobre a tabela existente?",
                    difficulty: "medio",
                    explanation:
                        "Em tabela existente, a documentação pede ser o dono ou ter MANAGE e SELECT sobre ela. MODIFY engana porque é o privilégio de escrever dado, e aqui a alteração é de metadado de controle de acesso, não de conteúdo.",
                    options: [
                        {
                            text: "Ser dono da tabela, ou então ter `MANAGE` e `SELECT` sobre ela",
                            isCorrect: true,
                        },
                        {
                            text: "Ter `MODIFY` sobre a tabela, que já cobre associar a máscara",
                            isCorrect: false,
                        },
                        {
                            text: "Ter `ALL PRIVILEGES` no schema, que já cobre a tabela de dentro",
                            isCorrect: false,
                        },
                        {
                            text: "Ser administrador do workspace, que cobre qualquer tabela dele",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois caminhos de configuração resolvem filtros de linha distintos para o mesmo usuário e a mesma tabela. O que a documentação diz que acontece na consulta?",
                    difficulty: "medio",
                    explanation:
                        "Só um filtro distinto pode resolver por usuário e tabela, então a plataforma bloqueia o acesso e devolve erro. Escolher o mais restritivo engana porque soa seguro, mas não é o comportamento: não existe precedência entre filtros.",
                    options: [
                        {
                            text: "O acesso é bloqueado, porque só um filtro distinto resolve por usuário",
                            isCorrect: true,
                        },
                        {
                            text: "Os dois são combinados com `AND`, porque o motor interseta condição",
                            isCorrect: false,
                        },
                        {
                            text: "Vale o filtro mais restritivo, porque o motor sempre fecha pelo mais seguro",
                            isCorrect: false,
                        },
                        {
                            text: "Vale o filtro da tabela, porque o nível de tabela tem precedência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma tabela com filtro de linha de nível de tabela entra em um plano de recuperação que prevê clone profundo diário e consulta por versão anterior. O que a documentação diz?",
                    difficulty: "dificil",
                    explanation:
                        "A documentação diz que viagem no tempo não é suportada com filtro ou máscara de nível de tabela e que clone profundo e raso também não são suportados nessas tabelas. A alternativa que salva o clone engana porque clone parece só copiar metadado.",
                    options: [
                        {
                            text: "Nenhum dos dois funciona: clone e viagem no tempo não são suportados",
                            isCorrect: true,
                        },
                        {
                            text: "Os dois funcionam, desde que quem executa seja o dono da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "O clone funciona e a viagem no tempo não, porque o clone leva o filtro",
                            isCorrect: false,
                        },
                        {
                            text: "A viagem no tempo funciona e o clone não, porque a versão é anterior",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um filtro de linha recebe uma coluna `STRING` em um parâmetro declarado `INT`, em um ambiente com o modo ANSI desligado. Qual é o efeito mais perigoso?",
                    difficulty: "dificil",
                    explanation:
                        "Com o modo ANSI desligado, o valor que não converte vira nulo em silêncio e o filtro deixa de cortar, devolvendo todas as linhas. Esperar erro de conversão engana porque é o que aconteceria com o modo ANSI ligado, que é a recomendação.",
                    options: [
                        {
                            text: "O valor que não converte vira nulo em silêncio e o filtro erra sem avisar",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta falha com erro de conversão e ninguém lê a tabela até o ajuste",
                            isCorrect: false,
                        },
                        {
                            text: "A coluna é comparada como texto e o filtro devolve sempre zero linha",
                            isCorrect: false,
                        },
                        {
                            text: "O filtro é ignorado e a máscara da coluna passa a valer no lugar dele",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "ABAC com tags governadas",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você escreve uma regra única que protege toda tabela marcada como sensível, hoje e no mês que vem, sem visitar tabela por tabela. É o salto que a prova cobra de quem já sabe amarrar filtro e máscara em uma tabela: o controle de acesso baseado em atributo, o ABAC.\n\nO atributo é representado por **tag governada**. Tag governada é um par chave e valor definido no nível da conta, com regras do que pode ser atribuído e de quem atribui. Tag comum, criada livremente, **não** serve: a documentação é explícita em dizer que a política de ABAC usa tag governada, não tag não governada. Criar a tag exige o privilégio `CREATE` no nível da conta, atribuir exige a permissão `ASSIGN` sobre aquela tag governada, e editar a lista de valores permitidos exige `MANAGE` sobre ela.",
                },
                {
                    type: "code",
                    value: "-- a tag governada nasce na conta, com os valores aceitos\nCREATE GOVERNED TAG pii\n  DESCRIPTION 'Tipo de dado pessoal que o ativo contém'\n  VALUES ('ssn', 'ccn', 'dob');\n\n-- atribuição na tabela e na coluna\nALTER TABLE prod.clientes.perfis SET TAGS ('sensitivity' = 'high');\n\nALTER TABLE prod.clientes.perfis\n  ALTER COLUMN ssn\n  SET TAGS ('pii' = 'ssn');",
                },
                {
                    type: "text",
                    value: "Onde a política mora decide o alcance. Ela é anexada a um nível da hierarquia do Unity Catalog: metastore, em versão beta, catálogo, schema ou tabela. A regra de avaliação é direta: a política avalia todas as tabelas, inclusive views, descendentes do objeto em que foi anexada. Anexada no catálogo, vale para todo securável daquele tipo dentro do catálogo; anexada no schema, para todo securável dentro do schema; anexada na tabela, só para aquela tabela. A recomendação da documentação é anexar no nível mais alto que resolva o caso, em geral o catálogo.\n\nA herança de tag é o detalhe que derruba candidato. Por padrão, o securável herda as tags do catálogo ou do schema pai, e em uma condição de tabela a função `has_tag()` olha tanto a tag posta direto na tabela quanto a herdada do pai. Coluna é a exceção: **tag de coluna não herda** da tabela e precisa ser aplicada diretamente. Na cláusula `MATCH COLUMNS`, `has_tag()` e `has_tag_value()` consultam apenas a tag posta na própria coluna, e nunca a tag da tabela.",
                },
                {
                    type: "table",
                    value: '[["Cláusula","Para que serve"],["ON METASTORE, CATALOG, SCHEMA ou TABLE","escopo: a política avalia os descendentes desse objeto"],["TO e EXCEPT","a quem a política se aplica e quem fica isento dela"],["FOR TABLES","o tipo de securável alvo, no plural, incluindo views"],["WHEN","expressão booleana sobre tags que escolhe as tabelas alvo"],["MATCH COLUMNS ... AS alias","escolhe as colunas por tag, até três expressões e todas precisam casar"],["ON COLUMN alias","em máscara, qual coluna casada será mascarada"],["USING COLUMNS","os argumentos passados à função: alias de coluna ou literal"]]',
                },
                {
                    type: "code",
                    value: "-- máscara: só os quatro últimos caracteres da coluna marcada como pii:ssn\nCREATE FUNCTION ssn_to_last_nr(ssn STRING, nr INT)\n  RETURNS STRING RETURN right(ssn, nr);\n\nCREATE POLICY mask_ssn\nON SCHEMA prod.clientes\nCOLUMN MASK ssn_to_last_nr\nTO us_analysts EXCEPT admins\nFOR TABLES\nMATCH COLUMNS has_tag_value('pii', 'ssn') AS ssn\nON COLUMN ssn\nUSING COLUMNS (4);\n\n-- filtro: corta região europeia nas tabelas marcadas como sensíveis\nCREATE FUNCTION non_eu_region(geo_region STRING)\n  RETURNS BOOLEAN RETURN geo_region <> 'eu';\n\nCREATE POLICY hide_eu_customers\nON SCHEMA prod.clientes\nCOMMENT 'Exclui clientes europeus das tabelas sensíveis'\nROW FILTER non_eu_region\nTO us_analysts\nFOR TABLES\nWHEN has_tag_value('sensitivity', 'high')\nMATCH COLUMNS has_tag('geo_region') AS region\nUSING COLUMNS (region);",
                },
                {
                    type: "quote",
                    value: "Anexe a política no nível mais alto que resolva o caso, em geral o catálogo. Uma política pode valer para um metastore inteiro.",
                },
                {
                    type: "text",
                    value: "Para operar isso em produção, cinco fatos. **Requisitos**: criar a política exige `MANAGE` no catálogo ou no schema onde ela é anexada, ou a propriedade desse objeto; o compute precisa ser serverless, padrão no Databricks Runtime 16.4 ou acima, ou dedicado no 16.4 ou acima com filtragem de controle de acesso fino ligada; alteração de tag leva alguns minutos para valer. **Cotas**: 10.000 políticas por metastore, 100 por catálogo, 100 por schema, 50 por tabela, 20 principais por política e 3 condições de coluna por `MATCH COLUMNS`. **Conflito**: continua valendo um filtro distinto por usuário e tabela e uma máscara distinta por coluna, e políticas que resolvem no mesmo resultado convivem; filtro amarrado na tabela e política de ABAC no mesmo alvo entram em conflito e o resultado é erro, sem precedência de um sobre o outro. **Inspeção**: `SHOW POLICIES ON ...`, `SHOW EFFECTIVE POLICIES ON ...` para incluir as políticas dos escopos pais, `DESCRIBE POLICY` e `DROP POLICY`; para auditar a marcação em si, consulte `INFORMATION_SCHEMA.TABLE_TAGS`, `COLUMN_TAGS`, `CATALOG_TAGS`, `SCHEMA_TAGS` e `VOLUME_TAGS`, e lembre dos limites de 50 tags por securável, 1.000 tags de coluna por tabela e 256 caracteres em chave e em valor. **Isenção**: principal listado em `EXCEPT` vê o dado sem filtro e sem máscara.\n\nO caso de visão materializada e de tabela de streaming merece atenção. A atualização do pipeline roda com a identidade do dono ou com a identidade de execução, e se essa identidade estiver sujeita à política, o objeto passa a **conter** dado mascarado ou filtrado de forma permanente, porque a gravação já sai protegida. A correção é colocar essa identidade na cláusula `EXCEPT`. Clone profundo e raso também não são suportados em tabela com política de ABAC, e em compartilhamento aberto a tabela só sai se o dono do compartilhamento estiver isento.",
                },
                {
                    type: "table",
                    value: '[["Pergunta","Comando DENY do SQL","Política DENY do ABAC, em beta"],["Vale no Unity Catalog?","Não, a referência diz que não é suportado por ele","Sim, é o caminho de recusa do Unity Catalog"],["Onde se aplica","Somente no catálogo hive_metastore e seus objetos","Anexada no metastore, no catálogo ou no schema"],["O que recusa","Qualquer privilégio do modelo antigo","Apenas MANAGE ACCESS CONTROL, que nem pode ser concedido"],["Como desfazer","REVOKE do mesmo privilégio para o principal","DROP POLICY, ou isentar o principal com EXCEPT"],["Quem escapa","A referência de SQL não descreve isenção","Administrador do metastore é sempre isento"],["Onde aparece","SHOW GRANTS","SHOW EFFECTIVE POLICIES, porque SHOW GRANTS não mostra"]]',
                },
                {
                    type: "text",
                    value: "Fixe a linha da tabela acima que mais aparece em prova: o comando `DENY` do SQL **não é suportado pelo Unity Catalog** e vale apenas para o catálogo `hive_metastore` e seus objetos. Quem está no Unity Catalog e precisa de uma recusa explícita escreve política de ABAC, e essa recusa cobre um único privilégio, o `MANAGE ACCESS CONTROL`.\n\nO comportamento da política de recusa também é peculiar. Ela tem precedência sobre qualquer concessão do mesmo privilégio e não pode ser contornada por uma concessão individual; ela é anexada em metastore, catálogo ou schema, nunca em um objeto isolado; cada política trata de um único tipo de securável, então cobrir tabela e volume no mesmo escopo pede duas políticas ou uma no schema; e o administrador do metastore é sempre isento, o que garante que exista sempre alguém capaz de remover a política.",
                },
            ],
            questions: [
                {
                    statement:
                        "Alguém tenta criar uma política de ABAC com a condição `has_tag('pii')`, usando uma tag `pii` criada livremente pelo dono da tabela, e a criação falha. Qual é a causa?",
                    difficulty: "facil",
                    explanation:
                        "A documentação diz que a política de ABAC usa tag governada, não tag não governada, e tag governada nasce no nível da conta. Culpar a falta de valor engana porque tag governada aceita atribuição só de chave, sem valor.",
                    options: [
                        {
                            text: "A política usa tag governada, e tag comum não entra na condição",
                            isCorrect: true,
                        },
                        {
                            text: "A política exige tag na coluna, e tag de tabela nunca é avaliada",
                            isCorrect: false,
                        },
                        {
                            text: "A política lê só tag criada por administrador do próprio workspace",
                            isCorrect: false,
                        },
                        {
                            text: "A política exige tag com valor, e tag só com chave é sempre ignorada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma política de máscara é criada com `ON SCHEMA prod.clientes`. Que objetos ela alcança?",
                    difficulty: "medio",
                    explanation:
                        "A política avalia todas as tabelas descendentes do objeto em que foi anexada, inclusive views, e isso inclui tabela criada depois. Limitar ao que existia na criação engana porque sugere uma lista fixa, e o atrativo do ABAC é justamente valer para o novo.",
                    options: [
                        {
                            text: "Todas as tabelas descendentes daquele schema, inclusive as views",
                            isCorrect: true,
                        },
                        {
                            text: "Só as tabelas que já existiam no schema quando foi criada",
                            isCorrect: false,
                        },
                        {
                            text: "Só o próprio schema, até alguém anexar a política em cada tabela",
                            isCorrect: false,
                        },
                        {
                            text: "Todas as tabelas do catálogo, porque o schema propaga para o pai",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você aplicou a tag governada no catálogo e esperava que o `MATCH COLUMNS` encontrasse as colunas sensíveis, mas nenhuma coluna casou. O que a documentação diz sobre herança de tag?",
                    difficulty: "medio",
                    explanation:
                        "Securável herda tag do catálogo ou do schema pai, mas tag de coluna não herda da tabela e precisa ser aplicada direto, e em MATCH COLUMNS a função só olha a tag da própria coluna. Dizer que nada herda engana porque a herança existe até o nível de tabela.",
                    options: [
                        {
                            text: "Tabela e schema herdam do pai, mas coluna precisa da tag aplicada direto",
                            isCorrect: true,
                        },
                        {
                            text: "Coluna herda da tabela e a tabela herda do catálogo, então tudo é coberto",
                            isCorrect: false,
                        },
                        {
                            text: "Só a tabela herda do catálogo, e o schema precisa receber a tag na mão",
                            isCorrect: false,
                        },
                        {
                            text: "Nada herda na avaliação, então todo objeto precisa da tag aplicada direto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um arquiteto quer impedir que o dono de uma tabela sensível conceda privilégios sobre ela a terceiros, em um catálogo do Unity Catalog. Qual caminho a documentação oferece?",
                    difficulty: "dificil",
                    explanation:
                        "No Unity Catalog a recusa vem de política de ABAC, que nega MANAGE ACCESS CONTROL por tag governada e tem precedência sobre concessão. O comando DENY engana porque existe na referência de SQL, mas não é suportado pelo Unity Catalog, só no hive_metastore.",
                    options: [
                        {
                            text: "Política de ABAC que recusa `MANAGE ACCESS CONTROL` por tag governada",
                            isCorrect: true,
                        },
                        {
                            text: "Comando `DENY MANAGE ACCESS CONTROL` sobre a tabela, para aquele dono",
                            isCorrect: false,
                        },
                        {
                            text: "Revogar `MANAGE` do dono da tabela, o que tira a concessão que ele faz",
                            isCorrect: false,
                        },
                        {
                            text: "Vínculo somente leitura do catálogo, que corta a concessão no workspace",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma tabela de streaming é atualizada com a identidade do dono, e esse dono está sujeito a uma política de máscara de coluna. Qual é a consequência documentada?",
                    difficulty: "dificil",
                    explanation:
                        "A atualização roda com a identidade do dono ou de execução, então o objeto passa a conter dado mascarado de forma permanente, e a correção é isentar essa identidade com EXCEPT. Esperar erro engana porque a gravação não falha, ela grava o valor protegido.",
                    options: [
                        {
                            text: "A tabela passa a conter dado mascarado em definitivo, até isentar a identidade",
                            isCorrect: true,
                        },
                        {
                            text: "A atualização falha com erro de política, e o pipeline para logo no primeiro ciclo",
                            isCorrect: false,
                        },
                        {
                            text: "A máscara é ignorada na atualização, porque a identidade de execução é isenta",
                            isCorrect: false,
                        },
                        {
                            text: "A máscara vale só na leitura final, então a tabela guarda o valor original",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Propriedade, auditoria e dado pessoal",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você sabe a quem entregar a propriedade de um objeto de produção, onde provar quem leu o quê e o que de fato acontece com um dado pessoal depois de um `DELETE`. São os três assuntos que fecham a seção de governança, e todos os três têm uma resposta curta que a prova espera.\n\nComece pela propriedade. O dono de um objeto tem todos os privilégios sobre ele, inclusive conceder privilégio a outro principal, e o dono de catálogo ou de schema também administra os privilégios dos objetos contidos. Transfere a propriedade quem é o dono atual, o administrador do metastore, o dono do contêiner, isto é, o catálogo de um schema ou o schema de uma tabela, ou quem tem `MANAGE` no objeto. Para ver o dono basta `BROWSE` no objeto ou em um pai.",
                },
                {
                    type: "table",
                    value: '[["Papel","O que pode","Limite"],["Dono do objeto","todos os privilégios, inclusive conceder a terceiros","transfere view, função ou modelo só para si ou para grupo seu"],["Quem tem MANAGE","administra privilégio, transfere propriedade e exclui o objeto","não recebe automaticamente todo privilégio, concede a si mesmo"],["Administrador do metastore","transfere qualquer objeto para qualquer principal da conta","é opcional, a recomendação é só existir se for necessário"],["Objeto de pipeline","visão materializada e tabela de streaming não transferem direto","troque a identidade de execução do pipeline e espere a atualização"]]',
                },
                {
                    type: "code",
                    value: "-- a propriedade vai para um grupo, não para uma pessoa\nALTER TABLE prod.vendas.pedidos OWNER TO `eng-dados-prod`;\nALTER SCHEMA prod.vendas OWNER TO `eng-dados-prod`;\n\n-- administrar privilégio sem ser dono\nGRANT MANAGE ON SCHEMA prod.vendas TO `plantao-dados`;\n\n-- quem é o dono agora\nDESCRIBE SCHEMA EXTENDED prod.vendas;",
                },
                {
                    type: "text",
                    value: "As boas práticas de produção são frases curtas e literais da documentação, e vale levá-las para a prova do jeito que estão: use grupos para atribuir a propriedade da maioria dos seguráveis; evite concessão direta a usuário sempre que possível; defina e administre os grupos no seu provedor de identidade em vez de editá-los na Databricks; o criador de qualquer objeto é o primeiro dono dele e deve reatribuir a propriedade ao grupo adequado; use service principal para executar job, porque usar usuário para gravar em produção arrisca sobrescrever dado por acidente; reserve `MODIFY` direto em tabela de produção para service principal; e atribua papel de administrador a grupo sempre que der.\n\nUm cerco a mais, barato e muito esquecido: por padrão todo catálogo é acessível de qualquer workspace ligado ao mesmo metastore. Vincular o catálogo a workspaces específicos nega o acesso dos demais, mesmo de quem tem concessão explícita, e o vínculo aceita o modo somente leitura para bloquear gravação a partir daquele workspace. Quem define o vínculo é o administrador do metastore, o dono do catálogo ou quem tem `MANAGE` nele.",
                },
                {
                    type: "quote",
                    value: "Sempre atribua a propriedade de catálogos e schemas de produção a grupos, não a usuários individuais.",
                },
                {
                    type: "table",
                    value: '[["Campo de system.access.audit","O que você faz com ele"],["event_date","coluna de data, e a recomendação é filtrar por ela para a consulta render"],["event_time","carimbo do evento em UTC, para ordenar e recortar janela"],["workspace_id","o workspace de origem, e o valor 0 marca evento de nível de conta"],["audit_level","distingue evento de nível de workspace de evento de nível de conta"],["user_identity","estrutura com a identidade de quem iniciou, por exemplo o e-mail"],["service_name e action_name","o serviço, como unityCatalog, e a ação, como getTable"],["request_params","mapa com os parâmetros do pedido, que variam por tipo de pedido"],["response","estrutura com statusCode, errorMessage e result do pedido"],["identity_metadata","run_by, run_as e acting_resource, para separar quem pediu de quem executou"]]',
                },
                {
                    type: "code",
                    value: "-- quem leu tabela do Unity Catalog nos últimos sete dias\nSELECT event_time, user_identity.email, action_name,\n       request_params, response.statusCode, response.errorMessage\nFROM system.access.audit\nWHERE event_date >= current_date() - INTERVAL 7 DAYS\n  AND service_name = 'unityCatalog'\n  AND action_name = 'getTable'\nORDER BY event_time DESC;\n\n-- de onde veio e para onde foi o dado de uma tabela\nSELECT source_table_full_name, target_table_full_name, entity_type, created_by\nFROM system.access.table_lineage\nWHERE event_date >= current_date() - INTERVAL 30 DAYS\n  AND target_table_full_name = 'prod.vendas.pedidos';",
                },
                {
                    type: "text",
                    value: "Sobre as tabelas de sistema, três números e uma permissão. O schema `access`, que traz `audit`, `table_lineage` e `column_lineage`, tem 365 dias de retenção gratuita, e as tabelas de linhagem guardam uma janela móvel de um ano. A prévia de retenção configurável, em beta, eleva a retenção gratuita para 395 dias e permite ajustar de 30 a 3.650 dias. Quem é administrador da conta e administrador do metastore acessa as tabelas de sistema por padrão; qualquer outra pessoa precisa de `USE CATALOG` em `system`, mais `USE SCHEMA` e `SELECT` no schema, e o metastore precisa estar na versão 1.0 do modelo de privilégios.\n\nDuas limitações de linhagem evitam conclusão errada em auditoria: as tabelas representam um subconjunto dos eventos de leitura e escrita, porque não é sempre possível capturar linhagem, e tabela externa referenciada por caminho aparece com o caminho, não com o nome, então filtre por `source_path` ou `target_path`. Para distinguir leitura de escrita, olhe o tipo de origem e de destino: origem preenchida com destino nulo é leitura, o inverso é escrita, e os dois preenchidos é leitura com escrita.",
                },
                {
                    type: "text",
                    value: "Fecha a aula o dado pessoal, e aqui a distinção é conceitual antes de ser técnica. **Pseudonimizar** é substituir o identificador por outro valor mantendo a possibilidade de reverter, por meio de uma chave, de uma tabela de correspondência ou do privilégio que desliga a máscara; o dado continua sendo dado pessoal e continua no arquivo. **Anonimizar** é tornar a reversão impossível. Máscara de coluna e filtro de linha pseudonimizam no momento da leitura: o valor original permanece intacto no arquivo, e quem estiver isento da política o vê. A documentação é direta ao tratar do direito ao esquecimento e diz que a ofuscação pode ser feita com pseudonimização e máscara, mas que a opção mais segura é a eliminação completa.\n\nEliminar de verdade tem uma sequência. Apague o registro primeiro nas tabelas de bronze e propague para prata e ouro, com `DELETE` para um caso e `MERGE` contra uma tabela de controle de pedidos quando forem muitos. Com vetores de exclusão ligados, a linha fica apenas marcada como removida até ser purgada, então rode `REORG TABLE ... APPLY (PURGE)`, que reescreve só os arquivos com dado marcado, e depois `VACUUM`, porque o dado marcado ainda pode viver nos arquivos antigos. E não esqueça da origem: Kafka, arquivos e bancos a montante também guardam o registro.",
                },
                {
                    type: "table",
                    value: '[["Onde o dado apagado ainda sobrevive","O que controla","Padrão"],["Histórico da tabela e viagem no tempo","delta.logRetentionDuration","interval 30 days"],["Arquivo de dado não referenciado","delta.deletedFileRetentionDuration, o limiar do VACUUM","interval 7 days"],["Linha marcada por vetor de exclusão","REORG TABLE ... APPLY (PURGE) e depois VACUUM","nenhum, é manual"],["Feed de mudança de dados","a mesma retenção do histórico da tabela","transitório, segue a janela da tabela"],["Tabela de streaming a jusante","apagar na origem e na tabela, e ler com skipChangeCommits","só processa inclusão"],["Tabelas de sistema de auditoria","retenção do schema access","365 dias"]]',
                },
                {
                    type: "text",
                    value: "O feed de mudança de dados merece um parágrafo próprio, porque é a fonte de vazamento que ninguém procura. Ele é ligado com a propriedade `delta.enableChangeDataFeed` nas tabelas Delta, e o registro de mudança é **transitório**, acessível só dentro de uma janela de retenção: o log de transação remove versões da tabela e as versões correspondentes do feed em intervalos regulares, e versão removida não tem mais feed para ler. O `VACUUM` apaga os arquivos de dado de mudança. A documentação diz que o feed **não** foi feito para servir de registro permanente de todas as mudanças de uma tabela, e recomenda, para quem precisa de histórico permanente, gravar o dado de mudança em uma tabela separada de forma incremental. Note a consequência de conformidade: essa tabela separada passa a guardar a imagem anterior do registro apagado e entra na sua rotina de purga como qualquer outra.\n\nUm último apoio que a plataforma oferece: a classificação de dados marca automaticamente colunas sensíveis com tags como `class.email_address`, grava o resultado em `system.data_classification.results`, com 13 meses de retenção, e essas tags alimentam as políticas de ABAC da aula anterior. Dois cuidados: a tabela de resultados guarda valores de exemplo das suas tabelas, então trate o acesso a ela como acesso a dado sensível, e não coloque filtro de linha nem máscara de nível de tabela nessa tabela de resultados, porque isso atrapalha o sistema e faz a varredura falhar.",
                },
            ],
            questions: [
                {
                    statement:
                        "Quem deve ser o dono de um catálogo e de um schema de produção, segundo as boas práticas da documentação?",
                    difficulty: "facil",
                    explanation:
                        "A documentação diz para sempre atribuir a propriedade de catálogos e schemas de produção a grupos, e não a usuários individuais. O service principal engana porque a recomendação sobre ele é outra: executar job e concentrar o MODIFY direto em produção.",
                    options: [
                        {
                            text: "Um grupo, porque a propriedade de produção não deve ficar com pessoa",
                            isCorrect: true,
                        },
                        {
                            text: "O engenheiro que criou o objeto, porque ele conhece a estrutura dele",
                            isCorrect: false,
                        },
                        {
                            text: "O service principal do job, porque é ele que grava em produção",
                            isCorrect: false,
                        },
                        {
                            text: "O administrador do metastore, porque ele já transfere qualquer objeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta em `system.access.audit` demora demais e traz eventos sem workspace. Quais duas leituras dos campos resolvem isso?",
                    difficulty: "medio",
                    explanation:
                        "A recomendação é filtrar por event_date, que é a coluna de data, para a consulta render, e o valor 0 em workspace_id marca evento de nível de conta. Filtrar por event_time engana porque é o carimbo do evento, mas não é a coluna indicada para recortar.",
                    options: [
                        {
                            text: "Filtrar por `event_date`, e ler o `workspace_id` igual a 0 como nível de conta",
                            isCorrect: true,
                        },
                        {
                            text: "Filtrar por `event_time`, e ler o `workspace_id` nulo como nível de conta",
                            isCorrect: false,
                        },
                        {
                            text: "Filtrar por `audit_level`, e ler o `workspace_id` igual a 1 como nível de conta",
                            isCorrect: false,
                        },
                        {
                            text: "Filtrar por `request_id`, e ler o `workspace_id` vazio como nível de conta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O dono de uma view quer passar a propriedade dela para um analista de outro time, do qual ele não participa. O que a documentação diz?",
                    difficulty: "medio",
                    explanation:
                        "Para evitar escalonamento de privilégio, dono e quem tem MANAGE transferem view, função e modelo só para si ou para grupo do qual participam; só o administrador do metastore transfere para qualquer principal da conta. Supor liberdade total engana porque vale para tabela, não para view.",
                    options: [
                        {
                            text: "Não pode: view só vai para ele mesmo ou para grupo dele, ou via administrador",
                            isCorrect: true,
                        },
                        {
                            text: "Pode: o dono transfere qualquer objeto dele para qualquer principal da conta",
                            isCorrect: false,
                        },
                        {
                            text: "Pode, desde que conceda `MANAGE` ao analista antes de fazer a transferência",
                            isCorrect: false,
                        },
                        {
                            text: "Não pode: transferência de view exige que o objeto seja recriado pelo destino",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma coluna de documento recebeu máscara de coluna e o time de conformidade considera o caso encerrado. Qual avaliação está correta?",
                    difficulty: "medio",
                    explanation:
                        "Máscara pseudonimiza na leitura: o valor original continua no arquivo e quem está isento da política o vê, então não há anonimização. Dizer que a máscara reescreve o arquivo engana porque a máscara é avaliada em tempo de consulta, não na gravação.",
                    options: [
                        {
                            text: "A máscara pseudonimiza na leitura, e o valor original segue no arquivo",
                            isCorrect: true,
                        },
                        {
                            text: "A máscara anonimiza o dado, porque o valor original deixa de existir",
                            isCorrect: false,
                        },
                        {
                            text: "A máscara reescreve o arquivo na aplicação, então o original se perde",
                            isCorrect: false,
                        },
                        {
                            text: "A máscara anonimiza quando o modo ANSI estiver ligado na hora da consulta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pedido de esquecimento chega para uma tabela Delta com vetores de exclusão e feed de mudança ligados. Qual sequência elimina o registro de verdade?",
                    difficulty: "dificil",
                    explanation:
                        "Com vetores de exclusão a linha fica apenas marcada, então é DELETE, REORG TABLE APPLY PURGE para reescrever os arquivos e VACUUM para apagar os antigos. Parar no DELETE engana porque a consulta já não mostra a linha, embora o arquivo, o histórico e o feed ainda a guardem.",
                    options: [
                        {
                            text: "`DELETE`, depois `REORG TABLE ... APPLY (PURGE)` e por último `VACUUM`",
                            isCorrect: true,
                        },
                        {
                            text: "`DELETE` apenas, porque o vetor de exclusão já remove o dado do arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "`DELETE` e `OPTIMIZE`, porque a compactação reescreve todos os arquivos",
                            isCorrect: false,
                        },
                        {
                            text: "`DELETE` e `RESTORE` para a versão anterior, que descarta o dado antigo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Monitoramento, depuração e deploy",
    aulas: [
        {
            titulo: "Monitorar streaming: listener e métricas",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você olha o relatório de progresso de uma consulta de streaming e decide em poucos segundos se ela está saudável ou perdendo terreno, sem abrir a interface do Spark.\n\nO painel de jobs engana por omissão. Uma consulta contínua que falha fica vermelha e ninguém discute. Já uma consulta que processa cada lote em três segundos e acumula quarenta minutos de dado não lido fica verde, porque nada falhou. Quem monitora streaming de verdade olha duas coisas separadas: a vazão e o atraso acumulado.",
                },
                {
                    type: "text",
                    value: "`StreamingQueryListener` é a interface que recebe os eventos de ciclo de vida de toda consulta registrada na sessão. São quatro retornos de chamada:\n\n- `onQueryStarted`, chamado de forma síncrona quando a consulta inicia. Não bloqueie nada aqui.\n- `onQueryProgress`, chamado a cada atualização de progresso. A documentação é explícita: a mensagem de `onQueryProgress` só é entregue no fim do lote da consulta de streaming.\n- `onQueryIdle`, chamado quando a consulta não tem dado novo na origem e está esperando.\n- `onQueryTerminated`, chamado quando a consulta para, com ou sem erro.\n\nO requisito mínimo é Databricks Runtime 11.3 LTS para Python e Scala. Em modo de acesso dedicado com Unity Catalog, 15.1 ou superior; Scala em modo de acesso padrão exige 16.1 ou superior.\n\nDuas armadilhas de identidade: `id` identifica a consulta e sobrevive a reinícios, enquanto `runId` é único por início ou reinício. E `name` vem nulo até você nomear a consulta com `.queryName()`, o que atrapalha quem tenta agrupar métrica por nome.",
                },
                {
                    type: "code",
                    value: 'from pyspark.sql.streaming import StreamingQueryListener\n\nclass ListenerAtraso(StreamingQueryListener):\n    def onQueryStarted(self, event):\n        print(f"iniciou id={event.id} runId={event.runId}")\n\n    def onQueryProgress(self, event):\n        p = event.progress\n        origem = p.sources[0]\n        print(\n            p.batchId,\n            p.inputRowsPerSecond,\n            p.processedRowsPerSecond,\n            origem.metrics.get("numBytesOutstanding"),\n            origem.metrics.get("numFilesOutstanding"),\n        )\n\n    def onQueryIdle(self, event):\n        print(f"ociosa id={event.id}")\n\n    def onQueryTerminated(self, event):\n        print(f"terminou runId={event.runId}")\n\nspark.streams.addListener(ListenerAtraso())',
                },
                {
                    type: "text",
                    value: "O objeto de progresso que chega no listener é o mesmo que `lastProgress` devolve. Os campos que a prova cobra:\n\n- `batchId` e `timestamp`: qual micro-lote e quando ele rodou.\n- `batchDuration`: o tempo de processamento do lote, em milissegundos.\n- `numInputRows`: total de linhas de entrada no gatilho, somando todas as origens.\n- `inputRowsPerSecond`: a taxa de chegada do dado.\n- `processedRowsPerSecond`: a taxa com que o Spark processa.\n- `durationMs`: o tempo por etapa, com as chaves `addBatch`, `getBatch`, `latestOffset`, `queryPlanning`, `triggerExecution`, `walCommit` e `commitOffsets`.\n- `eventTime`: os valores `avg`, `max`, `min` e `watermark`.\n- `stateOperators`: o estado, com `numRowsTotal`, `numRowsUpdated`, `numRowsRemoved`, `memoryUsedBytes` e `numRowsDroppedByWatermark`.\n- `sources`: por origem, com `startOffset`, `endOffset`, `latestOffset`, `numInputRows` e `metrics`.\n- `sink`: `description` e `numOutputRows`.\n- `observedMetrics`: o que você declarou com `df.observe`.\n\nA leitura básica é comparar duas taxas: `processedRowsPerSecond` abaixo de `inputRowsPerSecond` por vários lotes seguidos é uma consulta que não dá conta da origem. Um lote isolado abaixo não diz nada, porque a taxa de chegada oscila por natureza.",
                },
                {
                    type: "table",
                    value: '[["Métrica","O que responde","Sinal de problema"],["processedRowsPerSecond","Quanto o Spark consegue processar","Fica abaixo de inputRowsPerSecond em vários lotes"],["batchDuration","Quanto tempo o lote levou","Cresce lote a lote com a mesma entrada"],["durationMs.triggerExecution","Tempo total do gatilho","Passa do intervalo do trigger configurado"],["numBytesOutstanding","Bytes de arquivo pendentes na origem","Cresce de forma sustentada"],["maxOffsetsBehindLatest","Offsets que faltam para o fim do tópico","Cresce de forma sustentada"],["stateOperators.memoryUsedBytes","Memória ocupada pelo estado","Cresce sem watermark que limpe o estado"]]',
                },
                {
                    type: "text",
                    value: "**Atraso acumulado** é o volume de dado que já chegou na origem e a consulta ainda não leu. É ele que diz se a consulta está atrasada, porque vazão alta com atraso crescente continua sendo atraso.\n\nOnde ele aparece, sempre dentro de `sources.metrics`:\n\n- Delta Lake e Auto Loader: `numBytesOutstanding`, o tamanho somado dos arquivos pendentes, e `numFilesOutstanding`, a contagem deles.\n- Auto Loader com `cloudFiles.useNotifications` ligado ganha também `approximateQueueSize`, que não aparece no modo de listagem de diretório.\n- Kafka: `avgOffsetsBehindLatest`, `minOffsetsBehindLatest`, `maxOffsetsBehindLatest` e `estimatedTotalBytesBehindLatest`.\n- Kinesis: `totalPrefetchedBytes` como volume pendente e `avgMsBehindLatest` como atraso em tempo.\n\nTrês pegadinhas documentadas. A primeira: em tópico que recebe dado continuamente, as métricas de atraso mostram valores pequenos e persistentes diferentes de zero, e isso não significa que a stream está atrasada. No Databricks Runtime 17.1 e superior os offsets mais recentes são buscados depois de cada micro-lote; em 17.0 e abaixo eles eram buscados no início do lote, e por isso a métrica podia marcar zero mesmo com a consulta acompanhando. A segunda: em sink Delta, `sink.numOutputRows` é sempre -1, então esse campo não serve para contar escrita. A terceira: `reservoirId`, que identifica a tabela Delta da origem, não é o `tableId` do Unity Catalog, e para casar os dois você roda `DESCRIBE DETAIL` na tabela e usa o campo `id`.",
                },
                {
                    type: "quote",
                    value: "Vazão alta com atraso acumulado crescente não é saúde: é uma consulta que corre rápido e ainda assim fica para trás.",
                },
                {
                    type: "text",
                    value: "O listener serve para exportar métrica, não para acordar alguém de madrugada. Mantenha a lógica dele leve, porque a latência de processamento do listener atrasa a própria consulta, e empurre o dado para um sistema rápido em vez de processar ali dentro.\n\nO alerta de atraso mora no job, no mapeamento `health`, com uma regra por métrica, operador `GREATER_THAN` e um valor de limite:\n\n- `STREAMING_BACKLOG_BYTES`: estimativa do máximo de bytes esperando consumo em todas as streams.\n- `STREAMING_BACKLOG_RECORDS`\n- `STREAMING_BACKLOG_SECONDS`\n- `STREAMING_BACKLOG_FILES`\n\nO destinatário vai em `on_streaming_backlog_exceeded`, com no máximo três destinos. O disparo não é instantâneo: ele acontece quando a média de dez minutos da métrica passa do limite, e enquanto o problema persiste a mensagem é reenviada a cada trinta minutos. Duas restrições que a prova explora: a notificação de atraso não vale para task de pipeline, e a consulta precisa ser rastreável pelo serviço de jobs, o que exclui código que chama `awaitTermination()`.\n\nE nem toda origem reporta toda métrica. A tabela da interface de jobs lista atraso em bytes para Kafka, Kinesis, Delta, Auto Loader e Google Pub/Sub, e bytes é a única das quatro métricas que as cinco origens reportam.",
                },
                {
                    type: "code",
                    value: '{\n  "health": {\n    "rules": [\n      {\n        "metric": "STREAMING_BACKLOG_SECONDS",\n        "op": "GREATER_THAN",\n        "value": 900\n      }\n    ]\n  },\n  "email_notifications": {\n    "on_streaming_backlog_exceeded": ["plantao@empresa.com.br"]\n  }\n}',
                },
            ],
            questions: [
                {
                    statement:
                        "Em qual retorno de chamada do StreamingQueryListener as métricas de progresso do micro-lote chegam, e em que momento?",
                    difficulty: "facil",
                    explanation:
                        "A documentação diz que a mensagem de onQueryProgress só é entregue no fim do lote, então um lote longo passa minutos sem evento. onQueryStarted roda uma única vez, de forma síncrona, quando a consulta inicia, e não por lote.",
                    options: [
                        {
                            text: "Em `onQueryProgress`, e a mensagem só é entregue no fim do lote da consulta",
                            isCorrect: true,
                        },
                        {
                            text: "Em `onQueryStarted`, e a mensagem é entregue no início de cada micro-lote novo",
                            isCorrect: false,
                        },
                        {
                            text: "Em `onQueryIdle`, e a mensagem é entregue a cada intervalo do gatilho",
                            isCorrect: false,
                        },
                        {
                            text: "Em `onQueryTerminated`, e a mensagem é entregue quando um lote falha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta de streaming mantém batchDuration estável em quatro segundos e processedRowsPerSecond acima de inputRowsPerSecond, mas numFilesOutstanding subiu de 2 mil para 40 mil ao longo de uma hora. O que isso indica?",
                    difficulty: "medio",
                    explanation:
                        "numFilesOutstanding é a métrica de atraso acumulado da origem, e crescimento sustentado dela significa que a consulta lê menos do que chega. A duração estável do lote engana, porque um lote limitado processa rápido e deixa o resto pendente.",
                    options: [
                        {
                            text: "A consulta acumula atraso na origem, porque o volume pendente cresce de forma sustentada",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta está saudável, porque a duração do lote não aumentou ao longo da hora",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta tem estado inflado, porque arquivo pendente é contabilizado no state store",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta perdeu o checkpoint, porque arquivo já lido voltou a aparecer como pendente na origem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quais campos de `sources.metrics` medem o atraso de uma origem Kafka?",
                    difficulty: "medio",
                    explanation:
                        "maxOffsetsBehindLatest e estimatedTotalBytesBehindLatest são as métricas de atraso da origem Kafka. numBytesOutstanding e numFilesOutstanding existem, mas são as métricas de atraso de Delta Lake e Auto Loader, que trabalham com arquivo e não com offset.",
                    options: [
                        {
                            text: "`maxOffsetsBehindLatest` e `estimatedTotalBytesBehindLatest`, que medem offset e byte pendentes",
                            isCorrect: true,
                        },
                        {
                            text: "`numBytesOutstanding` e `numFilesOutstanding`, que medem byte e arquivo ainda pendentes na origem",
                            isCorrect: false,
                        },
                        {
                            text: "`approximateQueueSize` e `totalPrefetchedBytes`, que medem fila de notificação e prefetch",
                            isCorrect: false,
                        },
                        {
                            text: "`numInputRows` e `processedRowsPerSecond`, que medem entrada e vazão do micro-lote",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe quer contar as linhas escritas por lote lendo `sink.numOutputRows` de uma consulta que grava em tabela Delta. Por que o número não serve?",
                    difficulty: "dificil",
                    explanation:
                        "A documentação registra que em sink Delta o campo numOutputRows é sempre -1, então a contagem precisa vir de outra fonte, como as métricas da operação no histórico da tabela. O campo não repete numInputRows nem depende do modo de saída.",
                    options: [
                        {
                            text: "Em sink Delta esse campo é sempre -1, então a contagem precisa vir de outra fonte",
                            isCorrect: true,
                        },
                        {
                            text: "Esse campo conta linha de entrada do lote, então ele só repete o valor de numInputRows",
                            isCorrect: false,
                        },
                        {
                            text: "Esse campo só é preenchido quando a consulta usa o modo de saída complete no sink",
                            isCorrect: false,
                        },
                        {
                            text: "Esse campo zera a cada reinício da consulta, porque está vinculado ao runId e não ao id",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job de streaming precisa avisar o plantão quando o atraso passa de quinze minutos. O que a configuração precisa ter e como o alerta se comporta?",
                    difficulty: "dificil",
                    explanation:
                        "A regra STREAMING_BACKLOG_SECONDS no mapeamento health e o destino em on_streaming_backlog_exceeded fazem o alerta, que dispara pela média de dez minutos. RUN_DURATION_SECONDS existe, mas mede a duração total da execução, não o atraso da origem.",
                    options: [
                        {
                            text: "Regra `STREAMING_BACKLOG_SECONDS` em `health` e destino em `on_streaming_backlog_exceeded`, com disparo pela média de dez minutos",
                            isCorrect: true,
                        },
                        {
                            text: "Regra `RUN_DURATION_SECONDS` em `health` e destino em `on_duration_warning_threshold_exceeded`, com disparo pela média de dez minutos",
                            isCorrect: false,
                        },
                        {
                            text: "Campo `timeout_seconds` no job e destino em `on_failure`, com disparo no instante exato em que o limite de atraso é cruzado",
                            isCorrect: false,
                        },
                        {
                            text: "Listener registrado na sessão gravando em tabela de auditoria, com disparo a cada micro-lote que termina acima do limite",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Log de eventos do pipeline como tabela",
            blocks: [
                {
                    type: "text",
                    value: "Um pipeline rodou em doze minutos ontem e em cinquenta hoje, sem ninguém mexer no código. No fim desta aula você responde com SQL qual fluxo atrasou, quanto cada um escreveu e quantos registros falharam em cada expectation, sem depender de ninguém abrir a interface do pipeline para você.\n\nO material aqui é o log de eventos, que todo pipeline grava automaticamente e que registra auditoria, verificação de qualidade, progresso e linhagem.",
                },
                {
                    type: "text",
                    value: "Por padrão o log de eventos é uma tabela Delta oculta chamada `event_log_{pipeline_id}`, com os hifens do identificador trocados por sublinhado. Ela aparece em `system.information_schema.tables`, mas não no Catalog Explorer, então o caminho de leitura é a função de tabela `event_log()`.\n\nA sintaxe aceita duas formas: `event_log( { TABLE ( table_name ) | pipeline_id } )`.\n\nCom `TABLE(nome)` o argumento é o nome de uma materialized view ou de uma streaming table, sem especificação temporal, e nome não qualificado resolve pelo catálogo e schema atuais. Com `pipeline_id` o argumento é o identificador do pipeline como literal de string. O requisito é Databricks SQL ou Databricks Runtime 13.3 LTS e superior.\n\nA restrição que a prova cobra: a função `event_log` só pode ser chamada pelo owner da streaming table ou da materialized view, e uma view construída sobre ela só pode ser consultada por esse mesmo owner, sem possibilidade de compartilhamento. Na página do log de eventos a mesma regra aparece pelo outro lado: por padrão só o usuário de execução do pipeline consulta a tabela oculta.",
                },
                {
                    type: "text",
                    value: "Para dar acesso ao time sem brigar com permissão de tabela oculta, publique o log com nome próprio. Nas configurações avançadas do pipeline as chaves são `event_log` com `name`, mais `catalog` e `schema` opcionais. Depois crie uma view em cima dele, que é o que a Databricks recomenda antes de mexer em privilégio, porque algumas configurações de compute expõem metadado de schema quando a tabela é compartilhada direto.\n\nE não apague o log de eventos nem o catálogo ou o schema que o contém: isso pode quebrar atualizações futuras do pipeline.",
                },
                {
                    type: "code",
                    value: '"event_log": {\n  "catalog": "main",\n  "schema": "ops",\n  "name": "event_log_vendas"\n}',
                },
                {
                    type: "code",
                    value: "CREATE VIEW main.ops.event_log_raw\nAS SELECT * FROM main.ops.event_log_vendas;",
                },
                {
                    type: "table",
                    value: '[["Coluna","O que traz"],["id","Identificador único do registro de evento"],["sequence","JSON com o metadado de identificação e de ordenação dos eventos"],["origin","JSON com a origem: nuvem, região, organização, pipeline e identificadores"],["timestamp","Quando o evento foi registrado, em UTC"],["message","Descrição legível do evento"],["level","Severidade: INFO, WARN, ERROR ou METRICS"],["maturity_level","Estabilidade do schema: STABLE, NULL, EVOLVING ou DEPRECATED"],["error","Detalhe do erro, quando houve erro"],["details","JSON com o dado estruturado, no formato que o event_type determina"],["event_type","Categoria do evento, que define a estrutura de details"]]',
                },
                {
                    type: "text",
                    value: "`event_type` é o filtro que você aplica antes de qualquer outra coisa. Os valores documentados são `create_update`, `user_action`, `runtime_details`, `flow_progress`, `update_progress`, `flow_definition`, `dataset_definition`, `sink_definition`, `deprecation`, `cluster_resources`, `autoscale`, `planning_information`, `hook_progress`, `operation_progress`, `stream_progress` e `behavior_change_in_spark_connect`.\n\nTrês deles resolvem a maioria das perguntas:\n\n- `create_update`: cada atualização do pipeline. É por aqui que você descobre o `origin.update_id` da execução mais recente antes de filtrar o resto.\n- `flow_definition`: a linhagem declarada, com `details:flow_definition.input_datasets` e `details:flow_definition.output_dataset`.\n- `flow_progress`: o estado e as métricas de cada fluxo.\n\nSobre `maturity_level`: campo marcado `EVOLVING` pode mudar e campo `DEPRECATED` pode parar de ser produzido, então a documentação recomenda não construir alerta em cima desses campos. O valor `NULL` aparece em registro antigo, criado antes de o campo existir, na versão 2022.37.",
                },
                {
                    type: "text",
                    value: "Dentro de `details:flow_progress` moram três coisas: `status`, `metrics` e `data_quality`.\n\n`status` assume `QUEUED`, `STARTING`, `RUNNING`, `COMPLETED`, `FAILED`, `SKIPPED`, `STOPPED`, `IDLE` ou `EXCLUDED`.\n\nAs métricas por fluxo ficam em `details:flow_progress.metrics`:\n\n- `num_output_rows` e `num_output_bytes`: o que o fluxo escreveu nesta atualização.\n- `num_upserted_rows` e `num_deleted_rows`: linhas inseridas ou atualizadas e linhas apagadas no dataset de saída.\n- `backlog_bytes`, `backlog_records` e `backlog_files`: o atraso somado em todas as origens de entrada do fluxo.\n- `backlog_seconds`: o maior atraso em tempo entre as origens de entrada. Aqui a diferença importa, porque é máximo e não soma.\n- `executor_time_ms` e `executor_cpu_time_ms`: tempo de execução e tempo de CPU das tasks no período relatado.\n- `source_metrics`: a mesma conta aberta por origem, com `source_name`, `backlog_bytes`, `backlog_records`, `backlog_files` e `backlog_seconds`.\n\nA tabela de métricas do fluxo lista atraso em bytes para Kafka, Kinesis, Delta, Auto Loader e Google Pub/Sub.",
                },
                {
                    type: "code",
                    value: "CREATE OR REPLACE TEMP VIEW ultima_atualizacao AS\nSELECT origin.update_id AS id\nFROM event_log('a1b2c3d4-0000-1111-2222-333344445555')\nWHERE event_type = 'create_update'\nORDER BY timestamp DESC\nLIMIT 1;\n\nSELECT\n  e.timestamp,\n  e.origin.flow_name,\n  e.details:flow_progress.status AS status,\n  e.details:flow_progress.metrics.num_output_rows AS linhas,\n  CAST(e.details:flow_progress.metrics.backlog_bytes AS DOUBLE) AS atraso_bytes,\n  CAST(e.details:flow_progress.metrics.backlog_seconds AS DOUBLE) AS atraso_seg\nFROM event_log('a1b2c3d4-0000-1111-2222-333344445555') AS e\nJOIN ultima_atualizacao AS u ON e.origin.update_id = u.id\nWHERE e.event_type = 'flow_progress'\nORDER BY e.timestamp;",
                },
                {
                    type: "text",
                    value: "As métricas de qualidade vêm das expectations e ficam em `details:flow_progress.data_quality`. São dois níveis, e confundir os dois é erro clássico:\n\n- `dropped_records` fica no nível de `data_quality`, e não dentro de cada expectation. É a contagem de registros descartados por falhar em uma ou mais expectations.\n- `expectations` é uma lista, e cada item tem `name`, `dataset`, `passed_records` e `failed_records`.\n\nO detalhe que a prova explora: `failed_records` diz que a expectation não foi atendida, e não diz o que aconteceu com o registro. Avisar, descartar a linha ou derrubar a atualização é decisão do `ON VIOLATION`, e o log não repete essa decisão. É também por isso que somar `failed_records` de várias expectations não dá o número de registros descartados: um registro que falhou em duas expectations conta nas duas listas e aparece uma única vez em `dropped_records`.",
                },
                {
                    type: "code",
                    value: "WITH expectations_parsed AS (\n  SELECT\n    e.timestamp,\n    e.details:flow_progress.data_quality.dropped_records AS descartados,\n    EXPLODE(\n      FROM_JSON(\n        e.details:flow_progress.data_quality.expectations,\n        'array<struct<name: string, dataset: string, passed_records: int, failed_records: int>>'\n      )\n    ) AS row_expectations\n  FROM event_log(TABLE(main.vendas.pedidos_silver)) AS e\n  WHERE e.event_type = 'flow_progress'\n)\nSELECT\n  row_expectations.dataset,\n  row_expectations.name,\n  SUM(row_expectations.passed_records) AS passing_records,\n  SUM(row_expectations.failed_records) AS failing_records\nFROM expectations_parsed\nGROUP BY ALL\nORDER BY failing_records DESC;",
                },
                {
                    type: "quote",
                    value: "failed_records diz que a expectation não foi atendida. O que aconteceu com o registro quem decide é o ON VIOLATION, e o log de eventos não repete essa decisão.",
                },
                {
                    type: "text",
                    value: "Uma mudança recente vale saber para reconhecer a tela e a recomendação. A Databricks passou a recomendar consultar os eventos de pipeline pela tabela de sistema `pipeline_events`, ainda em Beta, que cobre todos os pipelines de todos os workspaces de uma região em vez de uma tabela oculta por pipeline. O schema do evento é o mesmo objeto de evento de pipeline que você acabou de ver, então a consulta escrita com `event_log()` muda praticamente só a cláusula `FROM`.",
                },
            ],
            questions: [
                {
                    statement:
                        "Como se chama a tabela oculta do log de eventos de um pipeline e por qual caminho ela é lida?",
                    difficulty: "facil",
                    explanation:
                        "A tabela é event_log_{pipeline_id} com os hifens do identificador trocados por sublinhado, e o caminho de leitura é a função event_log, porque a tabela aparece no information_schema mas não no Catalog Explorer.",
                    options: [
                        {
                            text: "`event_log_{pipeline_id}` com hifens trocados por sublinhado, lida pela função `event_log()`",
                            isCorrect: true,
                        },
                        {
                            text: "`pipeline_log_{pipeline_id}` com os hifens preservados, lida pelo Catalog Explorer do workspace",
                            isCorrect: false,
                        },
                        {
                            text: "`event_log` no schema de destino do pipeline, lida por SELECT com o nome completo da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "`_dlt_events` no catálogo system, lida apenas pela API de pipelines com o identificador dele",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um fluxo do pipeline lê de três origens diferentes. O que o campo `details:flow_progress.metrics.backlog_seconds` traz?",
                    difficulty: "medio",
                    explanation:
                        "A documentação define backlog_seconds como o maior atraso em tempo entre as origens de entrada, ou seja, um máximo. Os campos backlog_bytes, backlog_records e backlog_files é que são somados em todas as origens, o que faz muita gente generalizar errado.",
                    options: [
                        {
                            text: "O maior atraso em tempo entre as três origens, porque o campo é máximo e não soma",
                            isCorrect: true,
                        },
                        {
                            text: "A soma do atraso em tempo das três origens, porque o campo agrega toda a entrada",
                            isCorrect: false,
                        },
                        {
                            text: "O atraso em tempo da origem mais lenta a gravar, porque o campo olha para a saída",
                            isCorrect: false,
                        },
                        {
                            text: "A média do atraso em tempo das três origens, porque o campo normaliza pela contagem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que somar `failed_records` de todas as expectations de um fluxo não dá o número de registros descartados?",
                    difficulty: "medio",
                    explanation:
                        "failed_records é contado por expectation, então um registro que falha em duas aparece nas duas listas. O número de descartados fica em dropped_records, no nível de data_quality, exatamente para não sofrer essa dupla contagem.",
                    options: [
                        {
                            text: "Porque um registro que falha em duas expectations conta nas duas listas, e o descarte está em `dropped_records`",
                            isCorrect: true,
                        },
                        {
                            text: "Porque `failed_records` conta registro aprovado em pelo menos uma expectation, e o descarte está em `passed_records`",
                            isCorrect: false,
                        },
                        {
                            text: "Porque `failed_records` só é preenchido quando a expectation usa ON VIOLATION DROP ROW, e o descarte fica nulo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque `failed_records` é agregado por atualização e não por fluxo, e o descarte aparece só em update_progress",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um analista com SELECT em uma streaming table roda `SELECT * FROM event_log(TABLE(main.vendas.pedidos))` e recebe erro de permissão. Qual é a causa documentada?",
                    difficulty: "dificil",
                    explanation:
                        "A função event_log só pode ser chamada pelo owner da streaming table ou da materialized view, e uma view sobre ela também só serve ao owner. SELECT na tabela de dados não habilita a leitura do log de eventos dela.",
                    options: [
                        {
                            text: "A função só pode ser chamada pelo owner da streaming table ou da materialized view",
                            isCorrect: true,
                        },
                        {
                            text: "A função exige compute em modo de acesso dedicado para resolver o nome da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "A função aceita apenas identificador de pipeline como argumento, nunca nome de tabela",
                            isCorrect: false,
                        },
                        {
                            text: "A função exige que o log de eventos tenha sido publicado em catálogo e schema antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você precisa listar os datasets de entrada e de saída declarados por cada fluxo na atualização mais recente do pipeline. Qual combinação de eventos resolve?",
                    difficulty: "medio",
                    explanation:
                        "create_update dá o origin.update_id da atualização mais recente e flow_definition traz input_datasets e output_dataset. flow_progress tem status e métricas do fluxo, mas não a declaração de entradas e saídas.",
                    options: [
                        {
                            text: "`create_update` para achar o `origin.update_id` mais recente e `flow_definition` para os datasets",
                            isCorrect: true,
                        },
                        {
                            text: "`update_progress` para achar o `origin.update_id` mais recente e `flow_progress` para os datasets",
                            isCorrect: false,
                        },
                        {
                            text: "`dataset_definition` para achar o `origin.update_id` mais recente e `sink_definition` para os datasets",
                            isCorrect: false,
                        },
                        {
                            text: "`planning_information` para achar o `origin.update_id` e `cluster_resources` para os datasets",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "System tables: consulta, linhagem e custo",
            blocks: [
                {
                    type: "text",
                    value: "Uma reunião de auditoria costuma fazer quatro perguntas na mesma hora: qual consulta travou o warehouse na terça, quem leu a tabela de clientes, quem mudou aquela permissão e quanto esse pipeline custou no mês. No fim desta aula você sabe em qual tabela de sistema cada uma dessas respostas mora, e por quanto tempo ela continua lá.\n\nTabela de sistema é um catálogo de leitura, chamado `system`, mantido pela Databricks com dado operacional da conta. Você consulta com SQL comum.",
                },
                {
                    type: "table",
                    value: '[["Tabela de sistema","O que responde","Retenção"],["system.query.history","Qual instrução rodou, por quem, quanto durou e quanto leu","365 dias"],["system.access.audit","Qual ação foi chamada, por qual identidade e de qual endereço","365 dias"],["system.access.table_lineage","Qual entidade leu ou escreveu qual tabela","365 dias"],["system.access.column_lineage","Qual coluna de origem alimentou qual coluna de destino","365 dias"],["system.billing.usage","Quanta unidade de cada SKU foi consumida","365 dias"],["system.billing.list_prices","Qual era o preço de lista de cada SKU em cada janela","Indefinida"],["system.lakeflow.jobs","Qual é o nome e a definição de cada job","365 dias"],["system.lakeflow.job_run_timeline","Quando cada execução de job começou e terminou","365 dias"],["system.compute.node_timeline","Qual era o uso de recurso por nó, minuto a minuto","90 dias"]]',
                },
                {
                    type: "text",
                    value: "Tabela de sistema não é consulta livre. Quem acumula os papéis de administrador da conta e administrador do metastore tem acesso por padrão; qualquer outra pessoa precisa de `USE CATALOG` no catálogo `system`, mais `USE SCHEMA` e `SELECT` nos schemas que vai ler. O metastore tem de estar na versão 1.0 do modelo de privilégios do Unity Catalog, e alguns schemas chegam desabilitados, dependendo de habilitação por um administrador da conta.\n\nDois avisos de nomenclatura que derrubam código antigo: `system.operational_data` e `system.lineage` estão obsoletos e contêm tabelas vazias, então uma consulta apontada para `system.lineage` não devolve erro, devolve nada. E `system.information_schema` funciona de forma diferente das outras tabelas de sistema.\n\nExiste ainda uma retenção configurável, em Beta, que troca as janelas por tabela por uma única janela da conta, de 30 a 3650 dias.",
                },
                {
                    type: "text",
                    value: "`system.query.history` é o histórico de consulta: um registro por instrução, com o que ela custou em tempo e em leitura. As colunas que sustentam investigação:\n\n- Identificação: `statement_id`, `session_id`, `executed_by`, `executed_as`, `query_source`, `query_tags`, `client_application`, `client_driver`.\n- Resultado: `execution_status`, `error_message`, `statement_type`.\n- Tempo: `total_duration_ms`, `waiting_for_compute_duration_ms`, `waiting_at_capacity_duration_ms`, `compilation_duration_ms`, `execution_duration_ms`, `total_task_duration_ms`, `result_fetch_duration_ms`.\n- Leitura: `read_bytes`, `read_rows`, `read_files`, `read_partitions`, `pruned_files`, `pruned_files_bytes`, `read_io_cache_percent`, `from_result_cache`, `cache_origin_statement_id`.\n- Escrita e movimentação: `written_bytes`, `written_rows`, `written_files`, `shuffle_read_bytes`, `spilled_local_bytes`.\n\nDois campos mudam a conclusão da investigação. `statement_text` devolve `<REDACTED>` por padrão, então não conte com o texto da consulta para achar o culpado: use `statement_id`, `query_source` e `query_tags`. E `spilled_local_bytes` acima de zero é derrame de memória para disco, o mesmo sintoma que a interface do Spark mostra por execução, só que aqui você rankeia mil consultas de uma vez.\n\nE separar `waiting_for_compute_duration_ms` de `execution_duration_ms` responde uma pergunta que parece a mesma e não é: consulta lenta por espera de compute não melhora com reescrita de SQL.",
                },
                {
                    type: "code",
                    value: "SELECT\n  statement_id,\n  executed_by,\n  query_source,\n  total_duration_ms,\n  waiting_for_compute_duration_ms,\n  read_bytes,\n  spilled_local_bytes\nFROM system.query.history\nWHERE start_time >= current_timestamp() - INTERVAL 7 DAYS\n  AND spilled_local_bytes > 0\nORDER BY spilled_local_bytes DESC\nLIMIT 20;",
                },
                {
                    type: "text",
                    value: "Linhagem vive em duas tabelas: `system.access.table_lineage`, um registro por evento de leitura ou escrita de tabela, e `system.access.column_lineage`, a mesma coisa no nível de coluna, com `source_column_name` e `target_column_name` a mais.\n\nAs colunas que você usa: `source_table_full_name`, `source_table_catalog`, `source_table_schema`, `source_table_name`, `source_path` e `source_type`, os mesmos seis no lado `target_`, mais `entity_type`, `entity_id`, `entity_run_id`, `created_by`, `event_time`, `event_date`, `statement_id`, `entity_metadata` e `direct_access`.\n\nComo ler o sentido do evento: destino nulo é leitura, origem nula é escrita, origem e destino preenchidos é leitura e escrita.\n\nOs limites que a prova cobra:\n\n- As duas tabelas capturam só um subconjunto dos eventos, porque o registro sai quando a linhagem pode ser inferida.\n- `column_lineage` não registra evento sem origem, como inserir valor literal em uma coluna.\n- Tabela external referenciada por caminho entra com o caminho e sem o nome da tabela, então o filtro vai em `source_path` ou `target_path`.\n- `direct_access = false` marca dependência intermediária descoberta por expansão de view.\n- `entity_metadata` vem todo nulo quando nenhuma entidade Databricks participou, como em consulta por JDBC.\n- A linhagem é registrada para pipelines, notebooks, jobs, consultas de Databricks SQL, dashboards, Genie Agents e alertas. Outras entidades não entram.\n\nE a retenção tem duas caras. As tabelas mantêm uma janela móvel de um ano, enquanto o Catalog Explorer e a API de linhagem guardam de forma indefinida a linhagem capturada depois de 1 de setembro de 2024. Para pergunta de auditoria com mais de um ano, a tabela não responde e a interface responde.",
                },
                {
                    type: "code",
                    value: "SELECT\n  source_table_full_name,\n  entity_type,\n  created_by,\n  count(*) AS eventos\nFROM system.access.table_lineage\nWHERE target_table_full_name = 'main.vendas.pedidos_gold'\n  AND event_date >= current_date() - INTERVAL 30 DAYS\n  AND direct_access = true\nGROUP BY ALL\nORDER BY eventos DESC;",
                },
                {
                    type: "text",
                    value: "`system.access.audit` é o log de auditoria, e cada registro é uma chamada. `service_name` e `action_name` dizem o que foi chamado, `request_params` traz os parâmetros da chamada, `user_identity` diz quem chamou, `source_ip_address` e `user_agent` de onde, `request_id` e `event_id` identificam o evento, `response` traz o que voltou e `audit_level` separa evento de workspace de evento de conta, com `ACCOUNT_LEVEL` como o exemplo da documentação. Completam a tabela `account_id`, `version`, `event_time`, `event_date`, `workspace_id`, `session_id` e `identity_metadata`.\n\nUm detalhe de ciclo de vida que surpreende em auditoria: quando um workspace é apagado, a Databricks remove da tabela os eventos de auditoria daquele workspace com mais de 14 dias.",
                },
                {
                    type: "text",
                    value: "`system.billing.usage` responde quanto foi consumido, não quanto custou. Cada registro tem `record_id`, `account_id`, `workspace_id`, `sku_name`, `cloud`, `usage_start_time`, `usage_end_time`, `usage_date`, `custom_tags`, `usage_unit`, `usage_quantity`, `usage_metadata`, `identity_metadata`, `record_type`, `ingestion_date`, `billing_origin_product`, `product_features` e `usage_type`. A quantidade está em `usage_quantity`, medida na unidade de `usage_unit`.\n\nDinheiro sai do cruzamento com `system.billing.list_prices`, que guarda o histórico de preço de lista por SKU, com `price_start_time`, `price_end_time`, `account_id`, `sku_name`, `cloud`, `currency_code`, `usage_unit` e a struct `pricing`. Dentro de `pricing`:\n\n- `default`: um preço único, para estimativa simples de longo prazo.\n- `promotional`: o preço promocional temporário que todos os clientes recebem.\n- `effective_list`: o preço de lista efetivo, que resolve lista e promoção, descrito como o preço usado para calcular custo.\n\nA junção tem três partes e nenhuma é opcional: mesmo SKU, mesma nuvem e janela de tempo. `list_prices` só ganha registro quando o preço de um SKU muda, então sem o filtro de janela a mesma linha de uso casa com várias faixas de preço e o total infla.\n\nTrês cuidados práticos. Para atribuir custo a um job, `usage_metadata.job_id` liga o uso ao job e `system.lakeflow.jobs` dá o nome, mas essa tabela tem um registro por versão da definição, então pegue a linha mais recente por `change_time` antes de juntar. Filtrar `billing_origin_product` reduz a varredura. E existe registro de retratação: a documentação soma com `HAVING usage_quantity != 0` para que a retratação cancele o registro original.",
                },
                {
                    type: "code",
                    value: "WITH jobs_atuais AS (\n  SELECT job_id, name\n  FROM system.lakeflow.jobs\n  QUALIFY ROW_NUMBER() OVER (PARTITION BY job_id ORDER BY change_time DESC) = 1\n)\nSELECT\n  j.name AS job,\n  SUM(u.usage_quantity * p.pricing.default) AS custo_lista\nFROM system.billing.usage AS u\nJOIN system.billing.list_prices AS p\n  ON u.cloud = p.cloud\n AND u.sku_name = p.sku_name\n AND u.usage_start_time >= p.price_start_time\n AND (u.usage_end_time <= p.price_end_time OR p.price_end_time IS NULL)\nLEFT JOIN jobs_atuais AS j\n  ON u.usage_metadata.job_id = j.job_id\nWHERE u.billing_origin_product = 'JOBS'\n  AND u.usage_date >= current_date() - INTERVAL 30 DAYS\nGROUP BY ALL\nORDER BY custo_lista DESC\nLIMIT 10;",
                },
                {
                    type: "quote",
                    value: "A tabela de uso devolve quantidade. Dinheiro só aparece depois do cruzamento com o preço de lista vigente na janela daquele consumo.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual tabela de sistema responde quais colunas de origem alimentaram uma coluna de destino?",
                    difficulty: "facil",
                    explanation:
                        "system.access.column_lineage é a linhagem no nível de coluna, e traz source_column_name e target_column_name além das colunas de tabela. table_lineage responde no nível de tabela e não guarda nome de coluna.",
                    options: [
                        {
                            text: "`system.access.column_lineage`, que traz `source_column_name` e `target_column_name`",
                            isCorrect: true,
                        },
                        {
                            text: "`system.access.table_lineage`, que traz `source_table_full_name` e `target_table_name`",
                            isCorrect: false,
                        },
                        {
                            text: "`system.query.history`, que traz `statement_text` e `read_rows` de cada instrução",
                            isCorrect: false,
                        },
                        {
                            text: "`system.information_schema.columns`, que traz o tipo e a posição de cada coluna",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma auditoria quer saber qual job leu uma tabela há dezoito meses. O que a retenção documentada permite responder?",
                    difficulty: "medio",
                    explanation:
                        "As tabelas de linhagem mantêm janela móvel de um ano, então um evento de dezoito meses já saiu delas. O Catalog Explorer e a API de linhagem guardam de forma indefinida o que foi capturado depois de 1 de setembro de 2024.",
                    options: [
                        {
                            text: "As tabelas de linhagem guardam uma janela móvel de um ano, então a resposta sai do Catalog Explorer ou da API",
                            isCorrect: true,
                        },
                        {
                            text: "As tabelas de linhagem guardam um ano e a API tem o mesmo limite, então o evento não existe mais em lugar algum",
                            isCorrect: false,
                        },
                        {
                            text: "As tabelas de linhagem guardam de forma indefinida, então basta filtrar `event_date` pela data que a auditoria pediu",
                            isCorrect: false,
                        },
                        {
                            text: "As tabelas de linhagem guardam 90 dias, então a resposta sai do log de auditoria da conta, que guarda cinco anos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma investigação quer achar as consultas que derramaram memória para disco na semana passada. Quais campos de `system.query.history` sustentam a resposta?",
                    difficulty: "medio",
                    explanation:
                        "spilled_local_bytes é o derrame para disco e statement_id é o que identifica a instrução, porque statement_text devolve REDACTED por padrão. Contar com o texto da consulta é a armadilha clássica dessa tabela.",
                    options: [
                        {
                            text: "`spilled_local_bytes` para o derrame e `statement_id` para identificar, porque `statement_text` vem ocultado",
                            isCorrect: true,
                        },
                        {
                            text: "`shuffle_read_bytes` para o derrame e `statement_text` para identificar, porque o texto vem completo por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "`read_io_cache_percent` para o derrame e `session_id` para identificar, porque o texto só aparece para o owner",
                            isCorrect: false,
                        },
                        {
                            text: "`total_task_duration_ms` para o derrame e `query_tags` para identificar, porque o texto exige papel de admin",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual junção entre `system.billing.usage` e `system.billing.list_prices` dá custo em dinheiro sem inflar o total?",
                    difficulty: "dificil",
                    explanation:
                        "A junção documentada casa nuvem e SKU e ainda exige que a janela de uso caia dentro da janela do preço, tratando price_end_time nulo como preço vigente. Sem a janela, uma linha de uso casa com todas as faixas históricas do SKU e o total multiplica.",
                    options: [
                        {
                            text: "Mesmo SKU, mesma nuvem e janela de uso contida dentro da janela de vigência do preço",
                            isCorrect: true,
                        },
                        {
                            text: "Mesmo SKU e mesma nuvem, sem janela, porque a tabela de preço tem um registro por SKU",
                            isCorrect: false,
                        },
                        {
                            text: "Mesmo SKU e mesma data de uso, porque a tabela de preço tem um registro por dia e SKU",
                            isCorrect: false,
                        },
                        {
                            text: "Mesma nuvem e mesma unidade de uso, porque o preço varia por unidade e não por SKU",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que representa cada chave da struct `pricing` em `system.billing.list_prices`?",
                    difficulty: "dificil",
                    explanation:
                        "A referência de preços descreve default como preço único para estimativa simples, promotional como preço temporário que todos recebem e effective_list como o preço de lista efetivo, que resolve lista e promoção e é usado para calcular custo.",
                    options: [
                        {
                            text: "`default` é preço único de estimativa, `promotional` é preço temporário e `effective_list` resolve os dois",
                            isCorrect: true,
                        },
                        {
                            text: "`default` é preço de contrato, `promotional` é crédito do nível gratuito e `effective_list` é preço por nuvem",
                            isCorrect: false,
                        },
                        {
                            text: "`default` é preço da última mudança, `promotional` é preço médio do mês e `effective_list` é preço com imposto",
                            isCorrect: false,
                        },
                        {
                            text: "`default` é preço em dólar, `promotional` é preço em moeda local e `effective_list` é preço por unidade",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Depurar job: log de driver, executor e reparo",
            blocks: [
                {
                    type: "text",
                    value: "Três da manhã, um job de seis tasks falhou na terceira, e você tem duas decisões para tomar em sequência: qual log abrir e como reexecutar sem duplicar dado. No fim desta aula as duas são automáticas.\n\nA regra que resolve a primeira decisão é curta: log do driver explica por que o trabalho não começou ou morreu inteiro, log do executor explica por que uma task específica se comportou mal.",
                },
                {
                    type: "table",
                    value: '[["Onde olhar","O que mostra","Como chegar"],["Log do driver","Saída de print e de log de notebook, job e biblioteca, mais rastro de pilha da exceção","Aba Driver logs na página de detalhes do compute"],["Log do executor","Comportamento de task individual, pelo log4j do worker que rodou a task","Aba Spark UI, então nodes, master e o worker"],["Log de eventos do compute","Criação, término e edição de configuração do recurso","Aba de eventos do compute, com 60 dias de histórico"],["Destino de entrega de log","Cópia durável do log de worker e de compute para depois do término","Subpasta nomeada com o cluster_id no destino configurado"]]',
                },
                {
                    type: "text",
                    value: "O log do driver tem três saídas: saída padrão, erro padrão e os logs do **Log4j**. Elas ficam na aba `Driver logs` da página de detalhes do compute, e cada arquivo pode ser baixado clicando no nome.\n\nÉ aqui que caem os `print` do seu código e o rastro de pilha das exceções. O exemplo que a documentação usa é instrutivo: quando a aba Streaming nem aparece na interface do Spark, ou quando os lotes ficam em processamento e nunca chegam a lote concluído, é porque a consulta de streaming falhou ao iniciar, e o rastro de pilha disso está no log do driver, não no do executor.",
                },
                {
                    type: "text",
                    value: "O log do executor é o caminho oposto: ele não explica por que o trabalho não começou, explica por que uma task específica se comportou mal. Para chegar nele você parte da página de detalhes da task, descobre em qual executor ela rodou, abre a página do compute, clica em `# nodes`, depois em `master`, e na lista de workers escolhe o que rodou a task suspeita para ler o log4j dele. A aba `Executors` da interface do Spark ainda mostra o motivo de perda de um executor que foi desativado.\n\nO modo de acesso muda quem vê o que, e isso é pegadinha de prova:\n\n- Modo de acesso padrão: só administradores do workspace acessam o log do driver, e o log do executor não fica disponível.\n- Modo de acesso dedicado: o usuário ou grupo dedicado e os administradores do workspace acessam log do driver e log do executor.\n\nPor padrão, o log do driver do Spark é visível para quem tem `CAN MANAGE` no compute, seja job compute ou all-purpose.",
                },
                {
                    type: "text",
                    value: "Log que vive na página do compute morre com o compute. Para investigação depois do fato, configure o destino de entrega de log na aba de registro das configurações avançadas. Os logs são entregues a cada cinco minutos e arquivados a cada hora no destino escolhido, e a entrega continua até o recurso ser encerrado.\n\nSão três destinos: volume do Unity Catalog, que a documentação recomenda como o mais seguro para compute com Unity Catalog; bucket S3, que exige instance profile com permissão de `PutObject` e `PutObjectAcl`; e DBFS, que é legado e só aparece se a raiz e as montagens do DBFS não estiverem desabilitadas no workspace. A Databricks cria no caminho escolhido uma subpasta nomeada com o `cluster_id` do recurso.\n\nEm job com compute próprio, a mesma configuração se declara em `new_cluster.cluster_log_conf`.",
                },
                {
                    type: "code",
                    value: '{\n  "new_cluster": {\n    "spark_version": "15.4.x-scala2.12",\n    "num_workers": 4,\n    "cluster_log_conf": {\n      "volumes": {\n        "destination": "/Volumes/main/ops/logs/cluster_log"\n      }\n    }\n  }\n}',
                },
                {
                    type: "text",
                    value: "Achado o motivo, vem a segunda decisão. `Repair run`, o reparo da execução, roda de novo só o subconjunto de tasks que não teve sucesso mais as tasks que dependem delas. Task que passou não roda de novo, e task que depende de uma que passou também não.\n\nO caminho é abrir a execução que falhou, chegar na página de detalhes da execução do job e clicar em `Repair run`. A caixa de diálogo `Repair job run` lista as tasks malsucedidas e seus dependentes, e aceita acrescentar ou editar parâmetro de task: o parâmetro informado ali sobrescreve o valor existente.\n\nO que é fácil errar:\n\n- O reparo usa as configurações atuais do job e da task, então mudança de caminho de notebook ou de compute feita antes do reparo já vale naquela reexecução.\n- O reparo só existe para job com duas tasks ou mais. Para reexecutar job de uma task só, o caminho é `Run now`.\n- Se as tasks compartilham um job cluster, o reparo cria um cluster novo com sufixo `_v1`, por exemplo `my_job_cluster_v1`, para você comparar com o original.\n- Na visão em matriz aparece uma coluna nova para a execução reparada, e a `Duration` na aba `Runs` passa a cobrir do início da primeira execução até o fim do último reparo.\n- O reparo roda cada task malsucedida desde o começo. Se a task escreveu saída parcial antes de falhar, reexecutar duplica dado, e é por isso que a escrita precisa ser idempotente, com overwrite ou merge em vez de append.\n- `rerun_tasks` força a execução de uma task desabilitada. Sem isso, o reparo decide o que reexecutar pelo estado de execução de cada task, e não pelo fato de ela estar desabilitada.",
                },
                {
                    type: "code",
                    value: "# reexecuta as tasks que falharam e as que dependem delas\ndatabricks jobs repair-run 1138423521 \\\n  --rerun-all-failed-tasks \\\n  --rerun-dependent-tasks \\\n  -p prod\n\n# em um novo reparo da mesma execução, aponte o reparo anterior\ndatabricks jobs repair-run 1138423521 \\\n  --latest-repair-id 8930214 \\\n  --rerun-all-failed-tasks \\\n  -p prod",
                },
                {
                    type: "text",
                    value: "Depurar de madrugada é pior que ser avisado de tarde. Lakeflow Jobs tem dois limites de duração, e eles fazem coisas diferentes:\n\n- O aviso de duração é uma regra de saúde: no mapeamento `health`, a métrica `RUN_DURATION_SECONDS` com operador `GREATER_THAN` e o valor em segundos, que representa o tempo total esperado da execução. Sem essa regra em `health` a notificação não é enviada. O destino vai em `on_duration_warning_threshold_exceeded`, com no máximo três destinos. Na interface o campo fica nos limites de duração e de atraso de streaming, e ele só dispara um evento: a execução continua rodando.\n- O tempo limite é `timeout_seconds`, uma duração máxima de verdade. O padrão é 0, e 0 significa sem tempo limite. Ao estourar, a execução recebe o status `Timed Out`.\n\nEm uma frase: `RUN_DURATION_SECONDS` avisa, `timeout_seconds` mata.",
                },
                {
                    type: "quote",
                    value: "Log do driver explica por que o trabalho não começou. Log do executor explica por que uma task se comportou mal. Trocar os dois é passar a madrugada no arquivo errado.",
                },
            ],
            questions: [
                {
                    statement:
                        "Quais são as três saídas do log do driver e em qual aba elas ficam?",
                    difficulty: "facil",
                    explanation:
                        "O log do driver reúne saída padrão, erro padrão e os logs do Log4j, e fica na aba Driver logs da página de detalhes do compute. A aba Spark UI é o caminho para o log do worker, que é outra coisa.",
                    options: [
                        {
                            text: "Saída padrão, erro padrão e Log4j, na aba `Driver logs` do compute",
                            isCorrect: true,
                        },
                        {
                            text: "Saída padrão, erro padrão e log4j do worker, na aba `Spark UI` do compute",
                            isCorrect: false,
                        },
                        {
                            text: "Erro padrão, Log4j e log de init script, na aba de eventos do compute",
                            isCorrect: false,
                        },
                        {
                            text: "Saída padrão, Log4j e histórico de consulta, na aba de métricas do compute",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consulta de streaming em job não aparece na aba Streaming da interface do Spark e os lotes nunca chegam a concluído. Onde está o rastro de pilha?",
                    difficulty: "medio",
                    explanation:
                        "A documentação usa esse caso como exemplo: a aba Streaming ausente indica que a consulta falhou ao iniciar, e a exceção fica no log do driver. O log do executor explicaria uma task que se comportou mal, não um início que nunca aconteceu.",
                    options: [
                        {
                            text: "No log do driver, porque a consulta falhou ao iniciar e a exceção foi registrada ali",
                            isCorrect: true,
                        },
                        {
                            text: "No log do executor, porque a falha ocorre na task que lê a origem do streaming",
                            isCorrect: false,
                        },
                        {
                            text: "No log de eventos do compute, porque o recurso registra falha de início de consulta",
                            isCorrect: false,
                        },
                        {
                            text: "No histórico de consulta, porque toda consulta de streaming grava uma linha por lote",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em compute com modo de acesso padrão, o que a documentação diz sobre o acesso aos logs?",
                    difficulty: "medio",
                    explanation:
                        "Em modo de acesso padrão apenas administradores do workspace acessam o log do driver, e o log do executor simplesmente não fica disponível. A disponibilidade dos dois para usuário ou grupo é a regra do modo de acesso dedicado.",
                    options: [
                        {
                            text: "Só administradores do workspace veem o log do driver, e o log do executor não fica disponível",
                            isCorrect: true,
                        },
                        {
                            text: "Só administradores do workspace veem o log do executor, e o log do driver fica aberto a todos",
                            isCorrect: false,
                        },
                        {
                            text: "Quem tem CAN ATTACH TO vê os dois logs, porque o modo padrão compartilha o mesmo driver",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois logs ficam disponíveis para o usuário dedicado e para o administrador do workspace",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job de seis tasks falhou na terceira, que havia escrito parte da saída antes do erro. O que o reparo da execução faz e qual é o cuidado?",
                    difficulty: "medio",
                    explanation:
                        "O reparo roda de novo a task malsucedida e suas dependentes com as configurações atuais, e começa a task do zero. Como a escrita parcial permanece, append duplica dado e a documentação recomenda operação idempotente, como overwrite ou merge.",
                    options: [
                        {
                            text: "Roda de novo a terceira e as dependentes dela, desde o começo, o que duplica dado se a escrita for append",
                            isCorrect: true,
                        },
                        {
                            text: "Roda de novo as seis tasks desde o começo, o que duplica dado se a escrita for overwrite em vez de merge",
                            isCorrect: false,
                        },
                        {
                            text: "Roda de novo a terceira a partir do ponto de falha, o que evita duplicar dado em qualquer tipo de escrita",
                            isCorrect: false,
                        },
                        {
                            text: "Roda de novo a terceira em um clone do job, o que preserva a execução original como somente leitura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a diferença entre a regra `RUN_DURATION_SECONDS` e o campo `timeout_seconds` em um job?",
                    difficulty: "dificil",
                    explanation:
                        "RUN_DURATION_SECONDS é regra de saúde que apenas dispara notificação quando a execução passa do tempo esperado, enquanto timeout_seconds é limite real: ao estourar, a execução é marcada como Timed Out. O padrão 0 de timeout_seconds significa sem limite.",
                    options: [
                        {
                            text: "A regra avisa quando o tempo esperado é ultrapassado, e o campo encerra a execução como `Timed Out`",
                            isCorrect: true,
                        },
                        {
                            text: "A regra encerra a execução quando o tempo esperado é ultrapassado, e o campo apenas registra o evento",
                            isCorrect: false,
                        },
                        {
                            text: "A regra vale por task e o campo vale por job, e os dois encerram a execução no mesmo instante",
                            isCorrect: false,
                        },
                        {
                            text: "A regra exige compute serverless e o campo vale em qualquer compute, sem notificação em nenhum caso",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Promover para produção com bundles",
            blocks: [
                {
                    type: "text",
                    value: "Em desenvolvimento o job roda como você, lê do catálogo de teste e nunca dispara no horário. Em produção o mesmo job roda como uma identidade de serviço, lê do catálogo de produção e tem agendamento ativo. No fim desta aula você faz essa troca mudando o alvo da implantação, e não o código.",
                },
                {
                    type: "text",
                    value: 'O pacote declarativo da Databricks se chama **Declarative Automation Bundles**, sigla DAB, e a página oficial tem o título "What are Declarative Automation Bundles?". O nome anterior era Databricks Asset Bundles, grafia que você ainda encontra em material antigo e em nome de pasta de projeto.\n\nUm pacote empacota quatro coisas:\n\n- a infraestrutura de nuvem e as configurações de workspace necessárias;\n- os arquivos de código com a lógica de negócio, como notebooks e arquivos Python;\n- as definições e configurações de recursos: jobs, pipelines, dashboards, endpoints de model serving, experimentos do MLflow e modelos registrados;\n- os testes unitários e de integração.\n\nEsse último item é o que separa promoção de produção de cópia de notebook: o teste da função pura de transformação viaja no pacote e roda como task antes da carga, no mesmo artefato que vai para produção.\n\nA configuração fica em `databricks.yml` e nos arquivos de configuração de recurso.',
                },
                {
                    type: "code",
                    value: "bundle:\n  name: vendas_etl\n\nvariables:\n  catalogo:\n    description: catálogo de leitura e escrita do job\n    default: dev\n  warehouse_id:\n    description: warehouse usado pela task de validação\n    lookup:\n      warehouse: ops-shared\n\nresources:\n  jobs:\n    carga_diaria:\n      name: carga_diaria\n      tasks:\n        - task_key: testes\n          notebook_task:\n            notebook_path: ../tests/test_transformacoes.py\n        - task_key: carga\n          depends_on:\n            - task_key: testes\n          notebook_task:\n            notebook_path: ../src/carga.py\n            base_parameters:\n              catalogo: ${var.catalogo}\n\ntargets:\n  dev:\n    mode: development\n    default: true\n    run_as:\n      user_name: eu@empresa.com.br\n    variables:\n      catalogo: dev\n\n  prod:\n    mode: production\n    git:\n      branch: main\n    run_as:\n      service_principal_name: 68ed9cd5-8923-4851-b0c1-c7536c67ff99\n    variables:\n      catalogo: prod",
                },
                {
                    type: "table",
                    value: '[["Comportamento","mode: development","mode: production"],["Nome do recurso","Prefixado com o nome curto do usuário atual","Sem prefixo automático"],["Tag","Jobs e pipelines ganham a tag dev","Sem tag automática"],["Pipelines","Marcados como development igual a true","Validados como development igual a false"],["Agendamento e trigger","Pausados, com pause_status UNPAUSED para liberar","Como foi declarado"],["Execuções simultâneas","Habilitadas, com max_concurrent_runs igual a 1 para desligar","Como foi declarado"],["Trava de implantação","Desabilitada, religável em bundle.deployment.lock.enabled","Ativa"],["Sobreposição de compute","Aceita id de cluster informado na implantação","Não permitida"],["Branch do Git","Sem checagem","Tem de bater com o git.branch do alvo"]]',
                },
                {
                    type: "text",
                    value: "Em modo de desenvolvimento o prefixo é literal: `[dev ${workspace.current_user.short_name}]` na frente do nome do recurso. Isso resolve um problema bem prático, que é dez pessoas implantando o mesmo pacote no mesmo workspace sem se atropelar. Junto vêm a tag `dev` em jobs e pipelines, o pipeline marcado como `development: true`, o agendamento pausado, a execução simultânea liberada e a trava de implantação desligada.\n\nOs padrões do modo são ajustáveis por `presets` no alvo, com chaves como `name_prefix`, `pipelines_development`, `trigger_pause_status`, `jobs_max_concurrent_runs` e `tags`. A precedência é clara: `presets` sobrescreve o padrão do modo, e a configuração do próprio recurso sobrescreve o `presets`.",
                },
                {
                    type: "text",
                    value: "Em modo de produção o pacote valida em vez de relaxar:\n\n- todos os pipelines relacionados têm de estar marcados como `development: false`;\n- o branch atual do Git tem de bater com o `git.branch` do alvo, e a opção `--force` ignora essa checagem;\n- sem identidade de serviço em `run_as`, ele valida que `artifact_path`, `file_path`, `root_path` e `state_path` não estejam sobrepostos para um usuário específico, e que `run_as` e `permissions` estejam declarados;\n- sobreposição de compute pela opção de linha de comando ou por `compute_id` não é permitida.\n\nA documentação recomenda identidade de serviço em produção, e definir `run_as` com uma força esse arranjo. E dá uma dica que resolve um problema real de operação: implantar em uma pasta imutável e somente leitura, para proteger os artefatos e os jobs em execução de edição acidental.",
                },
                {
                    type: "text",
                    value: 'Variável é o que faz um pacote servir a dois alvos. Ela é declarada no mapeamento `variables`, aceitando `description`, `default`, `type` e `lookup`:\n\n- `type` tem um único valor válido, `complex`, para variável estruturada como a definição inteira de um cluster. Variável complexa com valor padrão simples falha na validação.\n- `lookup` resolve na implantação o identificador de um objeto pelo nome, para tipos como `cluster`, `job` e `warehouse`. Se o nome não casar com nenhum objeto, ou casar com mais de um, dá erro.\n\nA referência no YAML é a substituição `${var.<nome>}`. O valor por alvo vai no mapeamento `variables` dentro de `targets`.\n\nA precedência, e a CLI para no primeiro valor que encontrar:\n\n1. a opção `--var="chave=valor"` no comando `bundle`;\n2. variável de ambiente com o prefixo `BUNDLE_VAR_`;\n3. o arquivo `variable-overrides.json`, se existir;\n4. o mapeamento `variables` dentro de `targets`;\n5. o `default` da definição da variável.',
                },
                {
                    type: "text",
                    value: "`run_as` define a identidade de execução, e aceita `user_name` ou `service_principal_name`. Quem não é admin só pode colocar o próprio email em `user_name`.\n\nOnde ele pode aparecer:\n\n- como mapeamento de topo, valendo para os recursos do pacote;\n- dentro do mapeamento de um alvo, que é o arranjo recomendado: um usuário em desenvolvimento e identidades de serviço distintas em homologação e em produção;\n- no próprio job ou pipeline, e só nesse nível ele aceita `group_name`, para grupo de conta.\n\nOs limites: quando a identidade que implanta é diferente da identidade de `run_as`, só jobs e pipelines são suportados. Endpoint de model serving não suporta `run_as`, e dá erro se estiver em um pacote que define `run_as`. E a configuração de produção com identidade de serviço garante que o fluxo foi implantado pela mesma identidade de serviço ou por alguém com permissão `CAN_USE` sobre ela, o que desacopla a permissão de execução de quem implantou.",
                },
                {
                    type: "code",
                    value: "# 1. valida a configuração do alvo de desenvolvimento\ndatabricks bundle validate -t dev\n\n# 2. implanta e roda com o seu perfil de autenticação\ndatabricks bundle deploy -t dev\ndatabricks bundle run -t dev carga_diaria\n\n# 3. confere o que ficou no workspace, com link para cada recurso\ndatabricks bundle summary -t dev\n\n# 4. promove o mesmo pacote para produção\ndatabricks bundle validate -t prod\ndatabricks bundle deploy -t prod --fail-on-active-runs\ndatabricks bundle run -t prod carga_diaria",
                },
                {
                    type: "text",
                    value: "O que cada comando faz, e o que a prova cobra deles:\n\n- `databricks bundle validate` checa se os arquivos de configuração estão sintaticamente corretos. A saída traz nome do pacote, alvo e workspace, com host, usuário e caminho, e termina com a linha `Validation OK!`. É o comando que pega variável sem valor e alvo mal declarado antes de qualquer implantação.\n- `databricks bundle deploy` implanta no workspace remoto, com `--auto-approve`, `--fail-on-active-runs` e `--force-lock`.\n- `databricks bundle run` executa um job, pipeline, app ou script definido no pacote.\n- `databricks bundle summary` mostra a identidade e os recursos do pacote, com link direto para cada um no workspace.\n- `databricks bundle destroy` apaga os recursos e artefatos implantados, e não tem volta.\n\n`-t` ou `--target` escolhe o alvo, e `-p` ou `--profile` escolhe o perfil de autenticação. O perfil é o que separa a sua máquina da esteira de integração: o pacote pode fixar o perfil no mapeamento `profile` dentro de `workspace`, mas fixar isso deixa a configuração menos reutilizável entre projetos. Se nem a opção nem o mapeamento `profile` ou `host` forem informados, o perfil `DEFAULT` é usado. E quando você usa `--profile` para sobrepor a autenticação do pacote, não passe `--target` no mesmo comando.\n\nEm projeto com vários workspaces, a recomendação é autenticação por identidade de serviço com OAuth máquina a máquina, uma identidade com acesso a todos os workspaces participantes.",
                },
                {
                    type: "text",
                    value: "Falta o último elo: de onde o código vem quando o job roda em produção. Em job com `git_source`, os campos `git_branch`, `git_tag` e `git_commit` são mutuamente exclusivos, um de cada vez. Quando a execução começa, a Databricks tira um instantâneo da referência indicada, e todas as tasks daquela execução usam a mesma versão do código. O campo `git_snapshot.used_commit` registra o commit que de fato rodou: com `git_branch`, o HEAD do branch no momento da execução; com `git_tag`, o commit para onde a tag apontava.\n\nDaí a escolha: branch é referência móvel e serve para desenvolver, tag ou commit é referência que você consegue auditar depois. E em pasta Git do workspace, atualizar para uma tag deixa o checkout em HEAD desacoplado, o que serve para ler código e não para desenvolver nele, porque antes de commitar é preciso voltar para um branch.",
                },
                {
                    type: "quote",
                    value: "Promover não é copiar código: é apontar o mesmo pacote já validado para outro alvo, com outra identidade de execução e outras variáveis.",
                },
                {
                    type: "text",
                    value: "Com isso o ciclo fecha. Você mede com listener e com o log de eventos, explica com as tabelas de sistema, depura com o log certo e o reparo da execução, e promove com o mesmo pacote apontado para outro alvo. São quatro perguntas de operação, e cada uma tem um lugar documentado para ser respondida: a consulta está atrasada, o que esse fluxo escreveu e descartou, quanto isso custou e quem leu, e qual versão do código rodou. Um pipeline que você consegue responder essas quatro é um pipeline que dá para operar.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é o nome atual do pacote declarativo da Databricks e qual arquivo o define?",
                    difficulty: "facil",
                    explanation:
                        "O nome atual é Declarative Automation Bundles, com Databricks Asset Bundles como nome anterior, e a configuração fica em databricks.yml mais os arquivos de recurso. Databricks Git folders é outra coisa: a integração de pastas com Git.",
                    options: [
                        {
                            text: "Declarative Automation Bundles, definido em `databricks.yml` e nos arquivos de recurso",
                            isCorrect: true,
                        },
                        {
                            text: "Databricks Asset Bundles, definido em `bundle.yaml` e nos arquivos de recurso",
                            isCorrect: false,
                        },
                        {
                            text: "Databricks Git folders, definido em `.databricks/config.yml` e nos arquivos de recurso",
                            isCorrect: false,
                        },
                        {
                            text: "Declarative Automation Templates, definido em `databricks.json` e no arquivo de recurso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que um alvo com `mode: development` faz na implantação?",
                    difficulty: "medio",
                    explanation:
                        "Em modo de desenvolvimento os recursos ganham o prefixo com o nome curto do usuário atual, agendamentos e triggers ficam pausados e a execução simultânea é habilitada. Validar o branch do Git e impedir sobreposição de compute são comportamentos do modo de produção.",
                    options: [
                        {
                            text: "Prefixa os recursos com o nome do usuário atual, pausa agendamentos e habilita execução simultânea",
                            isCorrect: true,
                        },
                        {
                            text: "Prefixa os recursos com o nome do alvo, mantém agendamentos ativos e bloqueia a execução simultânea",
                            isCorrect: false,
                        },
                        {
                            text: "Mantém o nome dos recursos, pausa agendamentos e exige identidade de serviço na implantação",
                            isCorrect: false,
                        },
                        {
                            text: "Mantém o nome dos recursos, valida o branch do Git e impede sobreposição de compute no deploy",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual validação de Git o alvo com `mode: production` aplica, e como ela pode ser ignorada?",
                    difficulty: "medio",
                    explanation:
                        "Em modo de produção o branch atual tem de bater com o git.branch declarado no alvo, e a opção force ignora a checagem. Essa validação é justamente o que evita implantar em produção a partir de um branch de trabalho.",
                    options: [
                        {
                            text: "O branch atual tem de bater com `git.branch` do alvo, e a opção `--force` ignora a checagem",
                            isCorrect: true,
                        },
                        {
                            text: "O branch atual tem de ser o branch padrão do repositório, e nenhuma opção ignora a checagem",
                            isCorrect: false,
                        },
                        {
                            text: "O alvo tem de declarar `presets` com `trigger_pause_status`, e a opção `--force` ignora tudo",
                            isCorrect: false,
                        },
                        {
                            text: "O alvo tem de apontar uma tag em vez de um branch, e a opção `--auto-approve` ignora isso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a ordem de precedência que a CLI usa para resolver o valor de uma variável do pacote?",
                    difficulty: "dificil",
                    explanation:
                        "A CLI procura nesta ordem e para no primeiro valor encontrado: a opção var na linha de comando, variável de ambiente com prefixo BUNDLE_VAR_, o arquivo variable-overrides.json, o mapeamento variables do alvo e, por último, o default da definição.",
                    options: [
                        {
                            text: "`--var`, variável `BUNDLE_VAR_`, `variable-overrides.json`, variáveis do alvo e por fim o `default`",
                            isCorrect: true,
                        },
                        {
                            text: "O `default`, variáveis do alvo, `variable-overrides.json`, variável `BUNDLE_VAR_` e por fim `--var`",
                            isCorrect: false,
                        },
                        {
                            text: "Variáveis do alvo, `--var`, o `default`, variável `BUNDLE_VAR_` e por fim `variable-overrides.json`",
                            isCorrect: false,
                        },
                        {
                            text: "`variable-overrides.json`, `--var`, variáveis do alvo, o `default` e por fim variável `BUNDLE_VAR_`",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pacote implantado por um usuário define `run_as` com uma identidade de serviço. O que a documentação diz sobre esse caso?",
                    difficulty: "dificil",
                    explanation:
                        "Quando a identidade que implanta difere da identidade de run_as, só jobs e pipelines são suportados. Endpoint de model serving não aceita run_as, e o arranjo com identidade de serviço exige CAN_USE sobre ela para quem não é a própria identidade.",
                    options: [
                        {
                            text: "Como a identidade que implanta difere da de execução, apenas jobs e pipelines são suportados",
                            isCorrect: true,
                        },
                        {
                            text: "Como a identidade que implanta difere da de execução, só dashboards e modelos são suportados",
                            isCorrect: false,
                        },
                        {
                            text: "Como a identidade que implanta difere da de execução, o pacote passa a exigir modo development",
                            isCorrect: false,
                        },
                        {
                            text: "Como a identidade que implanta difere da de execução, o alvo ignora `run_as` e usa quem implantou",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_8: Modulo = {
    titulo: "Módulo 8 - Delta Lake avançado",
    aulas: [
        {
            titulo: "Transaction log e controle de concorrência",
            blocks: [
                {
                    type: "text",
                    value: "Dois jobs escrevem na mesma tabela e um deles morre com `ConcurrentAppendException`. Decidir se a culpa é do código, do particionamento ou do nível de isolamento é o que esta aula entrega. No fim você sabe o que cada versão grava no log de transações, para que serve o checkpoint em Parquet, qual é o nível de isolamento padrão de escrita e de leitura, e quais conflitos a plataforma resolve sozinha e quais ela devolve na sua mão.",
                },
                {
                    type: "text",
                    value: "Comece aceitando que o log de transações é a fonte da verdade, e não a listagem do diretório. A documentação é literal: o estado atual da tabela é composto por todos os arquivos de dado marcados como válidos nos logs de transação, e arquivo que não foi registrado por uma versão nova do log não afeta o estado da tabela. Quem apaga esse arquivo solto depois é o `VACUUM`.\n\nA mecânica do commit segue essa ideia. O dado é gravado primeiro, e só então uma entrada nova é confirmada no log de transações contendo os caminhos de todos os arquivos escritos na transação. Cada commit incrementa a versão da tabela e torna os arquivos de dado novos visíveis para a leitura. O log guarda as versões como arquivos JSON dentro do diretório de log, ao lado do dado, e o nome do arquivo usa o próximo número de versão disponível, preenchido com zeros até vinte dígitos. Durante a escrita a plataforma também cria arquivos `_started_<id>` e `_committed_<id>` ao lado dos arquivos de dado, e limpa os obsoletos depois.",
                },
                {
                    type: "code",
                    value: '# o diretório de log, ao lado dos arquivos de dado da tabela\n_delta_log/00000000000000000000.json\n_delta_log/00000000000000000001.json\n_delta_log/00000000000000000002.json\n_delta_log/00000000000000000010.checkpoint.parquet\n_delta_log/_last_checkpoint\n\n# dentro de 00000000000000000001.json, uma ação por linha\n{"commitInfo":{"operation":"MERGE","isBlindAppend":false,"readVersion":0}}\n{"remove":{"path":"part-00000-a.parquet","dataChange":true}}\n{"add":{"path":"part-00000-b.parquet","size":1048576,"dataChange":true}}',
                },
                {
                    type: "table",
                    value: '[["Ação no JSON do commit", "O que ela registra"], ["metaData", "os metadados da tabela, como id, schema, colunas de partição e configuração, e a ação nova substitui por inteiro a anterior"], ["add", "a adição de um arquivo lógico, com caminho, valores de partição, tamanho e estatística ou vetor de exclusão opcionais"], ["remove", "a marcação de um arquivo lógico como excluído, que fica como tombstone até expirar, para o VACUUM poder limpar"], ["cdc", "a referência a um arquivo de dado de mudança com as inclusões, atualizações e exclusões em nível de linha daquela versão"], ["txn", "o progresso mais recente de uma aplicação externa, identificada por appId, que é o que sustenta escrita idempotente"], ["protocol", "as versões mínimas de leitor e de escritor e os recursos de tabela exigidos para usar a tabela"], ["commitInfo", "a procedência opcional da operação que gerou o commit, como o tipo de operação e o usuário"], ["domainMetadata", "a configuração de um domínio de metadados nomeado, com uma forma de tombstone para apagar o domínio"]]',
                },
                {
                    type: "text",
                    value: "Reconstruir o estado lendo todo JSON desde a versão zero envelhece mal, e é para isso que existe o checkpoint. As versões da tabela são agregadas em arquivos de checkpoint em Parquet, o que melhora o desempenho por evitar a leitura de todas as versões JSON do histórico, e o leitor acha um checkpoint recente olhando o arquivo `_last_checkpoint` dentro do diretório de log. O checkpoint clássico é um arquivo chamado `n.checkpoint.parquet`; o formato V2 pode espalhar as ações de arquivo em arquivos sidecar, referenciados pelas ações `sidecar` e `checkpointMetadata`, que não são permitidas em arquivo de commit comum.\n\nA pegadinha de prova está na frequência. A documentação diz que a Databricks otimiza a frequência de checkpoint para o tamanho do dado e para a carga de trabalho, e que essa frequência está sujeita a mudança sem aviso. Ou seja: não existe número fixo de commits por checkpoint garantido pela plataforma, e material que crava um número está chutando.\n\nOs arquivos de log também não são governados pelo `VACUUM`: eles são apagados automaticamente e de forma assíncrona depois das operações de checkpoint. Quanto tempo de histórico sobra é a propriedade `delta.logRetentionDuration`, com padrão `interval 30 days`.",
                },
                {
                    type: "quote",
                    value: "O estado da tabela é o conjunto de arquivos marcados como válidos no log de transações, não o que aparece na listagem do diretório: arquivo que nenhuma versão do log registrou não existe para a tabela.",
                },
                {
                    type: "text",
                    value: "Uma propriedade das ações de arquivo decide o que os consumidores a jusante vão reprocessar: `dataChange`. O exemplo da própria documentação mostra um `OPTIMIZE` que comita `AddFile(/path/to/file-3, dataChange = false)` mais dois `RemoveFile`, com a observação de que a compactação não muda o dado da tabela. Já as entradas de log acrescentadas pelo comando `RESTORE` contêm `dataChange` igual a true. É daí que vem a assimetria que a prova gosta: compactar não faz um leitor em fluxo reprocessar linha nenhuma, e restaurar faz.\n\nO que foi decidido no commit fica visível em `DESCRIBE HISTORY`, que traz entre outras colunas `readVersion`, a versão da tabela que foi lida para realizar a escrita, `isolationLevel`, o nível usado, e `isBlindAppend`, que diz se a operação apenas acrescentou dado. Essas três colunas são o seu laudo quando um conflito aparece: append cego não lê o alvo, e por isso quase não conflita.",
                },
                {
                    type: "text",
                    value: "Agora o controle de concorrência. A Databricks usa controle de concorrência otimista: as transações seguem sem travar nada e os conflitos são detectados no momento do commit. No commit, a plataforma verifica em cada tabela escrita se outra transação mudou algo depois que a sua começou, e se mudou a sua transação falha.\n\nLeitura e escrita não usam o mesmo nível. Operações de leitura sempre usam isolamento de snapshot: a plataforma captura um snapshot consistente da tabela no primeiro acesso dentro da transação e as leituras seguintes daquela tabela usam esse mesmo snapshot. Para a escrita existem dois níveis na propriedade `delta.isolationLevel`, e o padrão é `WriteSerializable`.",
                },
                {
                    type: "table",
                    value: '[["Aspecto", "WriteSerializable", "Serializable"], ["É o padrão de `delta.isolationLevel`?", "sim, é o valor padrão da propriedade", "não, precisa ser pedido na propriedade"], ["Força da garantia", "mais fraco, garante que só as operações de escrita sejam serializáveis, e ainda assim é mais forte que snapshot", "o nível mais forte, garante que as escritas confirmadas e também todas as leituras sejam serializáveis"], ["O que um leitor pode ver", "pode ver um estado de tabela que não existe no log do Delta", "vê sempre apenas tabelas que estão de acordo com o histórico"], ["Conflito de escrita com leitura", "não se aplica nesse nível", "sim, alterar linha que outra transação leu gera conflito"], ["Custo prático", "menos falha de commit em carga com muito append concorrente", "mais falha de commit, em troca de histórico sempre coerente"]]',
                },
                {
                    type: "table",
                    value: '[["Cenário de conflito", "O que acontece", "Em que isolamento vale"], ["Escrita com escrita", "duas transações atualizam ou excluem as mesmas linhas", "WriteSerializable e Serializable"], ["Escrita com leitura", "outra transação alterou linhas que a sua transação leu", "somente Serializable"], ["Leitura fantasma", "outra transação acrescentou linhas novas que casam com um predicado que a sua leu", "WriteSerializable e Serializable"], ["Metadados", "outra transação mudou o schema ou as propriedades da tabela", "os dois, e pode derrubar toda escrita concorrente, inclusive INSERT"]]',
                },
                {
                    type: "text",
                    value: "Parte do conflito a plataforma resolve sozinha. A concorrência em nível de linha reduz conflitos entre escritas concorrentes detectando a mudança no nível da linha e resolvendo o conflito automaticamente quando as escritas tocam linhas diferentes do mesmo arquivo de dado. Ela é habilitada automaticamente no Databricks Runtime 14.3 LTS e acima, e os requisitos são três, todos obrigatórios: runtime 14.3 LTS ou acima, vetores de exclusão habilitados na tabela de origem e tabela sem partição, porque tabela particionada não permite concorrência em nível de linha.\n\nCom ela valendo, o mapa fica assim: `INSERT` com `INSERT` nunca conflita; `INSERT` com `UPDATE`, `DELETE` ou `MERGE INTO` nunca conflita sob o padrão WriteSerializable, e sob Serializable pode conflitar quando a mesma linha é alterada, caso em que falha a operação de alteração e não o `INSERT`; `INSERT` com `OPTIMIZE` nunca conflita; e `OPTIMIZE` com escrita, ou com outro `OPTIMIZE`, só conflita quando `ZORDER BY` é usado. O que continua conflitando nos dois níveis é o par de operações de `UPDATE`, `DELETE` ou `MERGE INTO` que altera a mesma linha.",
                },
                {
                    type: "text",
                    value: "E o que ela não resolve, que é o outro lado da pergunta de prova:\n\n- mudança de metadados, como um `ALTER TABLE` ou uma escrita que atualiza o schema, pode derrubar toda escrita concorrente, inclusive `INSERT`;\n- operação com cláusula condicional complexa cai no comportamento normal de conflito de escrita, e a lista documentada é condição sobre tipo complexo (struct, array e map), expressão não determinística, subconsulta e subconsulta correlacionada;\n- coluna de identidade não suporta transação concorrente;\n- `REORG` usado para aplicar upgrade muda o protocolo da tabela e conflita com todas as operações em andamento;\n- a detecção em nível de linha custa tempo, e com muitas transações concorrentes o escritor prioriza latência em vez de resolução de conflito;\n- para `MERGE`, a concorrência em nível de linha não é suportada no AWS GovCloud nem em cluster de usuário único, isto é, dedicado.\n\nQuando ela não dá conta, a saída documentada é fazer os conjuntos de arquivos não se cruzarem: conflito só ocorre quando duas operações afetam o mesmo conjunto de arquivos, então particionar pelas colunas usadas nas condições das operações mantém esses conjuntos disjuntos, e acrescentar filtro explícito de partição na condição do `MERGE`, `UPDATE` ou `DELETE` evita que a operação varra, e conflite com, partição que não interessa. O aviso que vem junto: coluna de partição de cardinalidade alta cria subdiretório demais e vira problema de desempenho.",
                },
                {
                    type: "table",
                    value: '[["Exceção", "Causa documentada"], ["ConcurrentAppendException", "uma operação concorrente adicionou arquivos na partição que a sua lê, ou em qualquer lugar se a tabela não tem partição; sob WriteSerializable, append que não lê dado não dispara"], ["ConcurrentDeleteReadException", "uma operação concorrente excluiu um arquivo que a sua operação leu, em geral um DELETE, UPDATE ou MERGE que reescreveu arquivos"], ["ConcurrentDeleteDeleteException", "uma operação concorrente excluiu um arquivo que a sua também exclui, como duas compactações reescrevendo os mesmos arquivos"], ["MetadataChangedException", "uma transação concorrente mudou os metadados da tabela, por ALTER TABLE ou por escrita que atualiza o schema"], ["ConcurrentTransactionException", "duas consultas de streaming que compartilham o mesmo local de checkpoint escreveram na tabela ao mesmo tempo, e a orientação é nunca rodar as duas em paralelo"], ["ProtocolChangedException", "a tabela foi atualizada para uma versão nova de protocolo, ou vários escritores criaram, substituíram ou escreveram na mesma tabela ou no mesmo caminho vazio ao mesmo tempo"]]',
                },
                {
                    type: "code",
                    value: "-- subir a garantia de escrita quando o histórico precisa ser coerente\nALTER TABLE prod.vendas.pedidos\n  SET TBLPROPERTIES ('delta.isolationLevel' = 'Serializable');\n\n-- o filtro de partição no alvo é o que evita varrer, e conflitar com, o resto da tabela\nMERGE INTO prod.vendas.pedidos AS alvo\nUSING pedidos_do_dia AS origem\n  ON alvo.pedido_id = origem.pedido_id\n AND alvo.data_pedido = current_date()\nWHEN MATCHED THEN UPDATE SET *\nWHEN NOT MATCHED THEN INSERT *;\n\n-- o laudo do conflito está no histórico, nas colunas readVersion,\n-- isolationLevel e isBlindAppend\nDESCRIBE HISTORY prod.vendas.pedidos;",
                },
            ],
            questions: [
                {
                    statement:
                        "Onde o Delta Lake guarda a verdade sobre quais arquivos compõem a tabela?",
                    difficulty: "facil",
                    explanation:
                        "O estado atual da tabela é o conjunto de arquivos marcados como válidos no log de transações. Arquivo solto no diretório não entra no estado, e é justamente ele que o VACUUM apaga depois, então a listagem do diretório não serve de fonte da verdade.",
                    options: [
                        {
                            text: "No log de transações, porque o estado é o conjunto de arquivos válidos nele",
                            isCorrect: true,
                        },
                        {
                            text: "No diretório da tabela, porque todo Parquet presente ali conta como dado dela",
                            isCorrect: false,
                        },
                        {
                            text: "No catálogo, porque é ele que mantém a lista de arquivos de cada tabela Delta",
                            isCorrect: false,
                        },
                        {
                            text: "No arquivo `_last_checkpoint`, porque ele enumera os arquivos da versão atual",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um candidato afirma que o Delta Lake escreve um checkpoint em Parquet a cada dez commits. O que a documentação da Databricks diz sobre isso?",
                    difficulty: "medio",
                    explanation:
                        "A doc diz que a Databricks otimiza a frequência de checkpoint para o tamanho do dado e a carga, e que ela está sujeita a mudança sem aviso. Logo, nenhum número fixo de commits é garantia, embora o checkpoint em Parquet exista mesmo para evitar a leitura de todo JSON.",
                    options: [
                        {
                            text: "Que a frequência é otimizada pela plataforma e está sujeita a mudança sem aviso prévio",
                            isCorrect: true,
                        },
                        {
                            text: "Que a frequência é fixa em dez commits e pode ser alterada por uma propriedade de tabela",
                            isCorrect: false,
                        },
                        {
                            text: "Que a frequência acompanha a retenção de log, com um checkpoint por dia de histórico",
                            isCorrect: false,
                        },
                        {
                            text: "Que a frequência é fixa em cem commits desde que a tabela esteja no Unity Catalog",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma tabela Delta não teve `delta.isolationLevel` alterado. Que combinação de isolamento vale nela?",
                    difficulty: "medio",
                    explanation:
                        "O padrão da propriedade é WriteSerializable, e a leitura usa sempre isolamento de snapshot. A armadilha é marcar Serializable como padrão: ele existe, é mais forte, mas precisa ser pedido de forma explícita na propriedade de tabela.",
                    options: [
                        {
                            text: "Escrita em WriteSerializable e leitura em isolamento de snapshot",
                            isCorrect: true,
                        },
                        {
                            text: "Escrita em Serializable e leitura em isolamento de snapshot",
                            isCorrect: false,
                        },
                        {
                            text: "Escrita e leitura em Serializable, por ser o nível mais forte",
                            isCorrect: false,
                        },
                        {
                            text: "Escrita em WriteSerializable e leitura sem garantia de isolamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em uma tabela particionada por data, um job de `DELETE` sobre a partição de ontem falha com `ConcurrentAppendException` enquanto um fluxo de ingestão acrescenta dado de hoje. Qual é o ajuste documentado?",
                    difficulty: "dificil",
                    explanation:
                        "O conflito ocorre porque as duas operações afetam o mesmo conjunto de arquivos: sem filtro, o DELETE lê a tabela toda. Pôr o filtro de partição na condição mantém os conjuntos disjuntos. Subir para Serializable só aumenta o conflito, e não há como ligar bloqueio, porque a concorrência é otimista.",
                    options: [
                        {
                            text: "Acrescentar o filtro de partição na condição do `DELETE`, para ele não varrer a partição do fluxo",
                            isCorrect: true,
                        },
                        {
                            text: "Elevar o nível de isolamento da tabela para Serializable, para o commit do `DELETE` ter prioridade",
                            isCorrect: false,
                        },
                        {
                            text: "Ligar bloqueio pessimista na tabela, para o `DELETE` segurar a partição até terminar a escrita",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o `DELETE` por `OVERWRITE` da partição, porque sobrescrita não lê o estado anterior",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time liga vetores de exclusão em uma tabela particionada no Databricks Runtime 15.4 LTS e espera que dois `MERGE` concorrentes deixem de conflitar. Por que a expectativa está errada?",
                    difficulty: "dificil",
                    explanation:
                        "A concorrência em nível de linha exige runtime 14.3 LTS ou acima, vetores de exclusão e tabela sem partição, e tabela particionada não a permite. O detalhe que engana é o runtime, que está em dia: o requisito que falta é a ausência de partição.",
                    options: [
                        {
                            text: "Porque tabela particionada não permite concorrência em nível de linha, mesmo com vetores de exclusão",
                            isCorrect: true,
                        },
                        {
                            text: "Porque vetores de exclusão desligam a concorrência em nível de linha e precisam ser removidos antes",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a concorrência em nível de linha exige o Databricks Runtime 16.1 e acima para valer em `MERGE`",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a concorrência em nível de linha só atua entre `INSERT`, e nunca entre duas escritas de alteração",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "MERGE INTO no detalhe: cláusulas e evolução de schema",
            blocks: [
                {
                    type: "text",
                    value: "Um `MERGE INTO` que resolvia o dia a dia começa a receber três coisas novas: evento de exclusão no feed, coluna que apareceu na origem e um cadastro completo em que a linha que desapareceu da origem precisa ser desativada no alvo. No fim desta aula você escreve isso em uma sentença só, sabe em que ordem as cláusulas são avaliadas, sabe quando o comando falha por correspondência ambígua e sabe por onde atacar um `MERGE` lento.",
                },
                {
                    type: "code",
                    value: "MERGE INTO prod.vendas.clientes AS alvo\nUSING clientes_do_dia AS origem\n  ON alvo.cliente_id = origem.cliente_id\n AND alvo.uf = origem.uf\nWHEN MATCHED AND origem.operacao = 'DELETE' THEN DELETE\nWHEN MATCHED AND origem.versao > alvo.versao THEN UPDATE SET *\nWHEN NOT MATCHED BY TARGET THEN INSERT *\nWHEN NOT MATCHED BY SOURCE AND alvo.ativo = true\n  THEN UPDATE SET alvo.ativo = false, alvo.encerrado_em = current_date();",
                },
                {
                    type: "text",
                    value: "As regras das cláusulas, que é o que a prova cobra palavra por palavra:\n\n- pode haver qualquer número de cláusulas `WHEN MATCHED` e `WHEN NOT MATCHED`;\n- as cláusulas `WHEN MATCHED` podem ter no máximo uma ação de atualização e uma ação de exclusão, que é exatamente o par do exemplo acima;\n- havendo várias cláusulas do mesmo tipo, elas são avaliadas na ordem em que foram escritas, e vence a primeira cuja condição for verdadeira;\n- todas as cláusulas de um mesmo tipo, menos a última, precisam ter condição. Sem isso a consulta falha com `NON_LAST_MATCHED_CLAUSE_OMIT_CONDITION`, `NON_LAST_NOT_MATCHED_CLAUSE_OMIT_CONDITION` ou `NON_LAST_NOT_MATCHED_BY_SOURCE_CLAUSE_OMIT_CONDITION`, conforme o tipo;\n- se nenhuma condição de `WHEN MATCHED` for verdadeira para um par de linhas que casou na condição do `ON`, a linha do alvo fica inalterada. Não é erro, é silêncio, e é a origem clássica do bug de atualização que não aconteceu.\n\n`WHEN NOT MATCHED BY TARGET` é apelido de `WHEN NOT MATCHED`, então as duas grafias são a mesma cláusula.",
                },
                {
                    type: "table",
                    value: '[["Cláusula", "Dispara quando", "Ações permitidas", "A que colunas a condição e a expressão podem se referir"], ["WHEN MATCHED", "a linha da origem casa com uma linha do alvo na condição do ON", "DELETE, UPDATE SET *, com EXCEPT opcional, e UPDATE SET coluna igual a expressão ou DEFAULT", "origem e alvo"], ["WHEN NOT MATCHED, ou WHEN NOT MATCHED BY TARGET", "a linha da origem não encontra correspondência no alvo", "INSERT *, com EXCEPT opcional, e INSERT com lista de colunas e VALUES", "origem e alvo"], ["WHEN NOT MATCHED BY SOURCE", "a linha do alvo não encontra correspondência na origem", "DELETE e UPDATE SET coluna igual a expressão ou DEFAULT, sem UPDATE SET *", "somente alvo"]]',
                },
                {
                    type: "text",
                    value: "A cláusula que age no que não existe mais na origem merece parágrafo próprio. `WHEN NOT MATCHED BY SOURCE` está disponível no Databricks SQL e no Databricks Runtime 12.2 LTS e acima, e aceita apenas ação de exclusão e de atualização. Por definição ela não tem linha de origem de onde tirar valor, então a condição precisa referenciar apenas colunas do alvo e a atualização só pode usar literal ou expressão sobre coluna do alvo, como incrementar um contador ou gravar `current_date()`.\n\nÉ a cláusula que transforma um cadastro completo em exclusão lógica: quem sumiu da origem vira `ativo = false` no alvo, sem precisar de uma segunda sentença. O aviso da documentação vem junto: acrescentar `WHEN NOT MATCHED BY SOURCE` pode modificar um número grande de linhas, e a recomendação é usar a condição opcional para limitar as linhas afetadas. Um `MERGE` em que a origem é uma carga parcial e a cláusula não tem condição desativa a tabela inteira, e o comando não vai reclamar.",
                },
                {
                    type: "quote",
                    value: "Por definição, a cláusula `WHEN NOT MATCHED BY SOURCE` não tem linha de origem de onde puxar valor de coluna: a condição e a atualização só falam de colunas do alvo.",
                },
                {
                    type: "text",
                    value: "Correspondência ambígua é a falha mais comum em `MERGE` de produção. Apenas uma única linha da origem pode casar com uma determinada linha do alvo; quando mais de uma casa e o comando tenta atualizar a linha, ele falha com `DELTA_MULTIPLE_SOURCE_ROW_MATCHING_TARGET_ROW_IN_MERGE`. A exceção é a exclusão sem condição, que pode casar com várias linhas. A saída é deduplicar a origem antes, por chave e por critério de recência.\n\nUm detalhe de versão que muda o diagnóstico: no Databricks Runtime 16.0 e acima a detecção de correspondência duplicada avalia as condições de `WHEN MATCHED` junto com a do `ON`, enquanto no 15.4 LTS e abaixo apenas a cláusula `ON` é considerada. O mesmo `MERGE` que falhava em um runtime antigo pode passar em um novo, porque a condição da cláusula já separava as linhas duplicadas.",
                },
                {
                    type: "text",
                    value: "Evolução de schema no `MERGE` não é automática, e isso é metade da questão de prova. Existem três formas de pedir, e a ordem importa para a resposta:\n\n- no Databricks Runtime 15.4 LTS e acima, `MERGE WITH SCHEMA EVOLUTION INTO` em SQL, ou `withSchemaEvolution()` encadeado no `merge(...)` nas APIs de tabela em Python e Scala;\n- a configuração de sessão `spark.databricks.delta.schema.autoMerge.enabled` igual a `true`, que vale para toda escrita da SparkSession e que a Databricks não recomenda para produção, justamente porque muda o comportamento de tudo que roda na sessão;\n- para escrita comum, fora do `MERGE`, a opção `mergeSchema` igual a `true` na operação.\n\nO que evolui: coluna presente na origem e ausente no alvo é acrescentada ao alvo se ela for nomeada em uma ação de inclusão ou de atualização, ou se a ação for `UPDATE SET *` ou `INSERT *`, e os valores vêm da origem. Vale para coluna de primeiro nível e para campo novo dentro de um struct que já existe; struct dentro de map é suportado a partir do Databricks Runtime 13.3 LTS. A coluna tem de existir no schema da origem, com nome e estrutura batendo com a atribuição: nomear algo na cláusula não cria coluna, e atribuição que usa expressão sobre colunas da origem, coluna sem relação ou caminho aninhado que não mapeia na coluna nova não dispara evolução.",
                },
                {
                    type: "table",
                    value: '[["Situação", "Sem evolução de schema", "Com evolução de schema"], ["Origem tem coluna que o alvo não tem, com UPDATE SET * e INSERT *", "a ação falha, porque as colunas da origem e do alvo não batem", "a coluna é acrescentada ao alvo e preenchida com o valor da origem"], ["Origem tem coluna nova nomeada em UPDATE SET coluna igual a valor", "erro, porque a coluna não existe no alvo, a partir do runtime 12.2 LTS", "a coluna é criada no alvo e recebe nulo onde a origem não tem valor"], ["Alvo tem coluna que a origem não tem, com UPDATE SET *", "a coluna fica inalterada na linha atualizada", "o schema do alvo não muda e a coluna segue inalterada"], ["Alvo tem coluna que a origem não tem, com INSERT *", "a coluna recebe nulo na linha inserida", "o schema do alvo não muda e a coluna recebe nulo"], ["Quer excluir coluna da sincronização", "EXCEPT nomeia colunas do alvo, e a excluída vira nula", "EXCEPT nomeia colunas da origem, e elas ficam fora da evolução"]]',
                },
                {
                    type: "code",
                    value: "-- SQL, a partir do Databricks Runtime 15.4 LTS\nMERGE WITH SCHEMA EVOLUTION INTO prod.vendas.clientes AS alvo\nUSING clientes_do_dia AS origem\n  ON alvo.cliente_id = origem.cliente_id\nWHEN MATCHED THEN UPDATE SET *\nWHEN NOT MATCHED THEN INSERT *\nWHEN NOT MATCHED BY SOURCE THEN DELETE;",
                },
                {
                    type: "code",
                    value: 'from delta.tables import DeltaTable\n\nalvo = DeltaTable.forName(spark, "prod.vendas.clientes").alias("alvo")\n\n(alvo\n    .merge(origem.alias("origem"), "alvo.cliente_id = origem.cliente_id")\n    .withSchemaEvolution()\n    .whenMatchedUpdateAll()\n    .whenNotMatchedInsertAll()\n    .whenNotMatchedBySourceDelete()\n    .execute())',
                },
                {
                    type: "text",
                    value: "Sobra o desempenho, e aqui a causa raiz quase sempre é a mesma: por padrão o `MERGE` procura correspondência na tabela Delta inteira. A recomendação documentada é acrescentar à condição de correspondência as restrições que você já conhece, e o exemplo da própria documentação é `events.date = current_date() AND events.country = 'USA'`, o que faz a consulta ficar mais rápida porque ela passa a procurar correspondência apenas nas partições relevantes. O mesmo filtro que acelera é o que reduz a chance de conflito com outra operação concorrente, então vale duas vezes.\n\nOs outros três pontos de ataque:\n\n- arquivo pequeno demais. Se o dado está em muitos arquivos pequenos, lê-lo para procurar correspondência fica lento, e a saída é compactar com `OPTIMIZE`, que não remove os arquivos antigos, quem remove é o `VACUUM`;\n- paralelismo e número de arquivos de saída. O número de tarefas usadas no shuffle vem de `spark.sql.shuffle.partitions`, e essa configuração não controla só o paralelismo: ela determina também o número de arquivos de saída. Em tabela particionada, um `MERGE` pode produzir muito mais arquivos pequenos que o número de partições de shuffle, e é aí que entra a escrita otimizada;\n- reescrita desnecessária. O `MERGE` de baixo shuffle, habilitado por padrão no Databricks Runtime 10.4 e acima, processa as linhas não modificadas em um caminho separado e mais enxuto, o que reduz o dado embaralhado e a necessidade de rodar `OPTIMIZE` depois.\n\nVale lembrar que a Databricks ajusta o tamanho de arquivo automaticamente conforme o tamanho da tabela, então tabela pequena recebe arquivo menor e tabela grande recebe arquivo maior.",
                },
                {
                    type: "quote",
                    value: "Por padrão um `MERGE INTO` varre a tabela de destino inteira procurando correspondência: a condição que restringe a busca é o primeiro ajuste de desempenho, e o mesmo ajuste reduz conflito de escrita.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um `MERGE INTO` tem duas cláusulas `WHEN MATCHED` e a primeira delas não tem condição. O que acontece?",
                    difficulty: "facil",
                    explanation:
                        "Todas as cláusulas de um mesmo tipo, menos a última, precisam ter condição, e a consulta falha com NON_LAST_MATCHED_CLAUSE_OMIT_CONDITION. A armadilha é achar que a segunda cláusula só fica inalcançável: o comando nem chega a rodar.",
                    options: [
                        {
                            text: "A consulta falha, porque só a última cláusula de cada tipo pode ficar sem condição",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta roda e a segunda cláusula nunca é alcançada, porque a primeira casa sempre",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta roda e as duas cláusulas são aplicadas na mesma linha, na ordem escrita",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta falha, porque um `MERGE` aceita no máximo uma cláusula `WHEN MATCHED`",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um `MERGE INTO`, qual é a restrição da cláusula `WHEN NOT MATCHED BY SOURCE`?",
                    difficulty: "medio",
                    explanation:
                        "Ela não tem linha de origem de onde puxar valor, então aceita exclusão e atualização com literal ou expressão sobre o alvo. Inserir não faz sentido nesse caso, já que a linha existe no alvo e é a origem que não a tem.",
                    options: [
                        {
                            text: "Aceita exclusão e atualização, e a condição e a expressão só podem citar colunas do alvo",
                            isCorrect: true,
                        },
                        {
                            text: "Aceita exclusão e inclusão, e a condição e a expressão só podem citar colunas da origem",
                            isCorrect: false,
                        },
                        {
                            text: "Aceita apenas exclusão, e a condição precisa citar ao menos uma coluna da tabela de origem",
                            isCorrect: false,
                        },
                        {
                            text: "Aceita exclusão e atualização, e a expressão pode citar qualquer coluna da origem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A origem de um `MERGE` passou a trazer uma coluna a mais, sem faltar nenhuma que o alvo tenha, e as ações são `UPDATE SET *` e `INSERT *`. Sem nenhuma configuração extra, qual é o resultado?",
                    difficulty: "medio",
                    explanation:
                        "A tabela de comportamento do MERGE na página de evolução de schema diz que, com coluna a mais na origem e sem evolução, o schema do alvo não muda e só as colunas em comum são atualizadas ou inseridas. O erro de análise aparece no caso inverso, quando o alvo tem coluna que a origem não tem. Para criar a coluna no alvo é preciso pedir evolução de schema no próprio MERGE.",
                    options: [
                        {
                            text: "As ações falham, porque a coluna a mais na origem é o caso que gera erro de análise",
                            isCorrect: false,
                        },
                        {
                            text: "A coluna é criada no alvo, porque `UPDATE SET *` e `INSERT *` evoluem o schema por conta própria",
                            isCorrect: false,
                        },
                        {
                            text: "A coluna é ignorada em silêncio e as linhas são gravadas sem o valor que veio da origem",
                            isCorrect: true,
                        },
                        {
                            text: "A coluna é criada no alvo com valor nulo, e o preenchimento exige uma segunda sentença",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um `MERGE` diário falha com `DELTA_MULTIPLE_SOURCE_ROW_MATCHING_TARGET_ROW_IN_MERGE`. Qual é a causa e a correção?",
                    difficulty: "medio",
                    explanation:
                        "Apenas uma linha da origem pode casar com uma determinada linha do alvo; mais de uma torna a atualização ambígua e o comando falha. A correção é deduplicar a origem. Trocar o isolamento ou ligar evolução de schema não tem relação com o erro.",
                    options: [
                        {
                            text: "Mais de uma linha da origem casa com a mesma linha do alvo, e a origem precisa ser deduplicada",
                            isCorrect: true,
                        },
                        {
                            text: "Mais de uma cláusula `WHEN MATCHED` casa com a mesma linha do alvo, e uma delas precisa de condição",
                            isCorrect: false,
                        },
                        {
                            text: "A chave do alvo tem duplicata, e o alvo precisa de uma restrição de unicidade na chave",
                            isCorrect: false,
                        },
                        {
                            text: "O alvo mudou durante a leitura da origem, e o nível de isolamento precisa subir",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um `MERGE` em uma tabela de eventos particionada por data leva horas, embora a origem traga só o dia corrente. Qual ajuste a documentação indica primeiro?",
                    difficulty: "dificil",
                    explanation:
                        "Por padrão o MERGE procura correspondência na tabela inteira; acrescentar à condição a restrição conhecida, como a data corrente, limita a busca às partições relevantes. Subir o número de partições de shuffle aumenta o paralelismo, mas não evita a leitura da tabela toda.",
                    options: [
                        {
                            text: "Acrescentar à condição de correspondência o filtro de data, para buscar só nas partições relevantes",
                            isCorrect: true,
                        },
                        {
                            text: "Elevar `spark.sql.shuffle.partitions`, para o shuffle do `MERGE` ganhar paralelismo e terminar antes",
                            isCorrect: false,
                        },
                        {
                            text: "Ligar a evolução de schema na sentença, para o comando deixar de comparar o schema das duas pontas",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar as cláusulas por `UPDATE SET *` e `INSERT *`, para o comando copiar colunas sem avaliar condição",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Change Data Feed: consumir a mudança",
            blocks: [
                {
                    type: "text",
                    value: "A tabela de prata recebe atualização e exclusão, e a de ouro só sabe somar inclusão. Reprocessar tudo a cada hora funciona até a tabela crescer. O Change Data Feed existe para essa dor: ele rastreia mudanças em nível de linha entre versões de uma tabela Delta Lake, ou de uma tabela Apache Iceberg v3, e entrega a linha antes e depois de cada atualização. No fim da aula você liga o feed, lê por consulta e por fluxo, e sabe o que acontece com um consumidor quando a origem sofre atualização e exclusão.",
                },
                {
                    type: "code",
                    value: "-- liga o feed já na criação da tabela\nCREATE TABLE prod.vendas.clientes (\n  cliente_id BIGINT,\n  nome STRING,\n  plano STRING\n) TBLPROPERTIES (delta.enableChangeDataFeed = true);\n\n-- liga o feed em uma tabela que já existe\nALTER TABLE prod.vendas.clientes\n  SET TBLPROPERTIES (delta.enableChangeDataFeed = true);\n\n-- confere se ficou ligado\nSHOW TBLPROPERTIES prod.vendas.clientes;",
                },
                {
                    type: "text",
                    value: "A propriedade é `delta.enableChangeDataFeed`, e o padrão dela é `false`: feed é coisa que se pede. Como qualquer propriedade `delta.`, ela aceita o prefixo de padrões de sessão `spark.databricks.delta.properties.defaults.`, documentado na referência de propriedades de tabela, que define o valor padrão para as tabelas novas da sessão e não mexe nas que já existem.\n\nDuas consequências de ligar depois, e as duas aparecem em prova. A primeira: o feed legado registra apenas as mudanças feitas depois de ter sido habilitado, então se ele foi desligado e religado mais tarde, a lacuna no meio não pode ser consultada. A segunda: se a tabela já tiver colunas com os nomes que o feed usa, não é possível usar o feed até renomear essas colunas.",
                },
                {
                    type: "table",
                    value: '[["Coluna acrescentada", "Tipo", "O que ela traz"], ["_change_type", "String", "um de `insert`, `update_preimage`, `update_postimage` ou `delete`"], ["_commit_version", "Long", "a versão do log, ou da tabela, que contém a mudança"], ["_commit_timestamp", "Timestamp", "o momento em que aquele commit foi criado"]]',
                },
                {
                    type: "text",
                    value: "O valor de `_change_type` é o coração da leitura. Inclusão gera uma linha `insert`. Exclusão gera uma linha `delete`. Atualização gera **duas** linhas: a imagem anterior, que é a linha antes da atualização, com `update_preimage`, e a imagem posterior, que é a linha depois da atualização, com `update_postimage`.\n\nEssa contagem de duas linhas por atualização é a pegadinha mais frequente. Um consumidor que apenas soma as linhas do feed conta a atualização duas vezes; um consumidor que quer o estado final filtra `_change_type` em `insert` e `update_postimage`; e um consumidor de auditoria é justamente quem precisa da imagem anterior, para registrar o valor que existia antes. O schema entregue é o da versão mais recente da tabela.",
                },
                {
                    type: "code",
                    value: "-- por versão, e as duas pontas entram no resultado\nSELECT * FROM table_changes('prod.vendas.clientes', 10, 14);\n\n-- da versão 10 até a mais recente\nSELECT * FROM table_changes('prod.vendas.clientes', 10);\n\n-- por carimbo de tempo, no formato aceito\nSELECT * FROM table_changes('prod.vendas.clientes', '2026-10-01 00:00:00');\n\n-- o estado final de cada linha que mudou, sem a imagem anterior\nSELECT cliente_id, plano, _change_type, _commit_version, _commit_timestamp\nFROM table_changes('prod.vendas.clientes', 10, 14)\nWHERE _change_type IN ('insert', 'update_postimage', 'delete');",
                },
                {
                    type: "text",
                    value: "A função de leitura por consulta é `table_changes('<nome_da_tabela>', <inicio>[, <fim>])`. O início e o fim podem ser versão, como inteiro, ou carimbo de tempo, como texto no formato `yyyy-MM-dd[ HH:mm:ss[.SSS]]`. **As duas pontas são inclusivas**, e omitir o fim faz a leitura ir até a versão mais recente. Nome com caractere especial vai entre crases, como em `` `schema`.`dotted.tableName` ``.\n\nNa leitura em lote pela API de DataFrame, a opção é `readChangeFeed` igual a `true` mais `startingVersion` e `endingVersion`, ou `startingTimestamp` e `endingTimestamp`. A versão ou o carimbo de início é **obrigatório** em leitura em lote. Pedir versão anterior à habilitação do feed gera erro, e por padrão versão ou carimbo além do último commit devolve o erro `timestampGreaterThanLatestCommit`. No Databricks Runtime 11.3 LTS e acima, pôr `spark.databricks.delta.changeDataFeed.timestampOutOfRange.enabled` em `true` muda isso: início além do último commit passa a devolver resultado vazio, e fim além do último commit passa a devolver as mudanças até o último commit.",
                },
                {
                    type: "code",
                    value: '# leitura em lote: a ponta inicial é obrigatória\nmudancas = (spark.read\n    .option("readChangeFeed", "true")\n    .option("startingVersion", 10)\n    .option("endingVersion", 14)\n    .table("prod.vendas.clientes"))\n\n# leitura em fluxo: sem startingVersion, o primeiro lote traz o snapshot atual\nfluxo = (spark.readStream\n    .option("readChangeFeed", "true")\n    .option("startingVersion", 10)\n    .table("prod.vendas.clientes"))',
                },
                {
                    type: "text",
                    value: "Em fluxo, a leitura é a mesma opção `readChangeFeed` igual a `true` em `readStream`, e três comportamentos mudam o resultado:\n\n- na **primeira partida**, o fluxo devolve o snapshot atual da tabela como registros de inclusão e só depois as mudanças futuras. Informar `startingVersion` evita reprocessar as linhas que já existiam como inclusão;\n- os limites de vazão são `maxFilesPerTrigger`, `maxBytesPerTrigger` e `excludeRegex`, e eles se aplicam a **commits inteiros**, com exceção do snapshot inicial. Ou seja: o limite não corta um commit no meio;\n- quando é preciso recuperar de um checkpoint corrompido, você tem de informar um local de checkpoint novo.\n\nPara guardar a mudança de forma permanente, a recomendação da documentação é gravar o resultado do feed em outra tabela, de forma incremental.",
                },
                {
                    type: "text",
                    value: "Agora o caso que o título da aula promete: a origem sofreu atualização e exclusão. Se o seu consumidor lê a tabela Delta direto, sem o feed, o Structured Streaming aceita apenas entrada de inclusão e lança exceção se qualquer modificação ocorrer na tabela de origem. Um `UPDATE`, `DELETE`, `MERGE INTO` ou sobrescrita na tabela lida derruba o fluxo. Daí as três opções, e a diferença entre elas é o que a prova pergunta:\n\n- `skipChangeCommits` é a opção atual: ela ignora por completo as transações que excluem ou modificam registros existentes, processando apenas o que foi acrescentado. Os arquivos reescritos por essas operações são ignorados, então a atualização e a exclusão **não chegam** ao destino e você precisa de lógica própria para propagá-las;\n- `ignoreChanges` é legado, do Databricks Runtime 11.3 LTS e abaixo, e reemite os arquivos de dado reescritos: linhas inalteradas são emitidas junto com as novas, então o consumidor a jusante tem de aguentar duplicata. Exclusão não é propagada, e essa opção tem precedência sobre `ignoreDeletes`;\n- `ignoreDeletes` também é legado e trata apenas transações que excluem dado na fronteira de partição, isto é, a remoção de uma partição inteira.\n\nA recomendação fecha o raciocínio: use `skipChangeCommits` em toda carga nova e na maior parte das cargas que não usam feed de mudança, e para carga que precisa processar inclusão, atualização e exclusão use o Change Data Feed, de preferência lendo o feed em vez de ler a tabela direto.",
                },
                {
                    type: "table",
                    value: '[["Caminho", "O que chega ao destino", "Quando usar"], ["Ler a tabela direto, sem opção", "só inclusão, e o fluxo falha na primeira modificação", "origem que de fato só recebe append"], ["skipChangeCommits", "só inclusão, e a transação de modificação é ignorada sem erro", "carga nova que não precisa propagar alteração"], ["ignoreChanges, legado", "arquivos reescritos inteiros, com linha inalterada junto, e exclusão não propagada", "carga antiga que já sabe lidar com duplicata"], ["ignoreDeletes, legado", "nada da exclusão, e só vale quando ela remove partição inteira", "origem em que exclusão é sempre descarte de partição"], ["Change Data Feed", "inclusão, imagem anterior, imagem posterior e exclusão, linha por linha", "carga que precisa aplicar atualização e exclusão a jusante"]]',
                },
                {
                    type: "quote",
                    value: "`skipChangeCommits` não propaga atualização nem exclusão, ele as ignora: quem precisa aplicar a mudança a jusante lê o Change Data Feed, não a tabela.",
                },
                {
                    type: "text",
                    value: "Por último, a versão da documentação de hoje. O que foi descrito até aqui é o feed legado, que registra a mudança no momento da escrita e vale apenas para tabela Delta. A documentação atual descreve também um feed automático, que calcula a mudança no momento da leitura a partir do rastreio de linha, sem configuração por tabela; ele exige Databricks Runtime 19 ou acima e tabela registrada no Unity Catalog, seja tabela Delta gerenciada com rastreio de linha habilitado, tabela Iceberg v3 gerenciada ou tabela Delta externa com rastreio de linha. Como as mudanças não são calculadas em cada escrita de `MERGE INTO` e `UPDATE`, ele melhora o desempenho de escrita.\n\nOs dois não convivem: não é possível usar o feed legado e o automático juntos, e a migração passa por `ALTER TABLE <nome> UNSET TBLPROPERTIES ('delta.enableChangeDataFeed')`. Duas limitações do automático valem anotar: cliente Iceberg externo não consegue consultá-lo, e ele não é suportado em tabela com filtro de linha ou máscara de coluna. E uma limitação que vale para os dois: mudança de schema não aditiva, como renomear ou remover coluna, alterar tipo ou alterar nulabilidade, bloqueia a leitura que atravessa aquela transação, então divida a faixa em antes e depois da mudança.",
                },
            ],
            questions: [
                {
                    statement:
                        "Como o Change Data Feed legado é habilitado em uma tabela Delta que já existe?",
                    difficulty: "facil",
                    explanation:
                        "O feed legado é uma propriedade de tabela, delta.enableChangeDataFeed, com padrão false, e um ALTER TABLE SET TBLPROPERTIES a liga. Não existe comando dedicado nem opção de leitura que ligue o feed: readChangeFeed apenas lê o que já está gravado.",
                    options: [
                        {
                            text: "Com `ALTER TABLE` definindo a propriedade `delta.enableChangeDataFeed` como `true`",
                            isCorrect: true,
                        },
                        {
                            text: "Com `ALTER TABLE` definindo a propriedade `delta.enableRowTracking` como `true`",
                            isCorrect: false,
                        },
                        {
                            text: "Com a opção `readChangeFeed` igual a `true` na primeira leitura feita sobre a tabela",
                            isCorrect: false,
                        },
                        {
                            text: "Com o comando `ENABLE CHANGE DATA FEED` aplicado sobre a tabela de destino",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma única sentença `UPDATE` altera o plano de um cliente em uma tabela com o feed ligado. Quantas linhas e com quais valores de `_change_type` essa alteração aparece no feed?",
                    difficulty: "medio",
                    explanation:
                        "Atualização gera duas linhas no feed: update_preimage, com a linha antes, e update_postimage, com a linha depois. Quem espera uma linha só conta errado, e insert com delete é a representação de outro produto, não a do feed.",
                    options: [
                        {
                            text: "Duas linhas, uma `update_preimage` e uma `update_postimage`",
                            isCorrect: true,
                        },
                        {
                            text: "Uma linha só, com `_change_type` igual a `update_postimage`",
                            isCorrect: false,
                        },
                        {
                            text: "Duas linhas, uma `delete` e uma `insert`, nessa ordem de commit",
                            isCorrect: false,
                        },
                        {
                            text: "Uma linha só, com `_change_type` igual a `update` e a imagem nova",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que a consulta `SELECT * FROM table_changes('vendas.clientes', 10, 14)` devolve?",
                    difficulty: "medio",
                    explanation:
                        "As duas pontas da faixa são inclusivas, então as versões 10 e 14 entram no resultado. Omitir o fim seria ler até a versão mais recente, e não há exclusão de ponta nem necessidade de somar uma versão de cada lado.",
                    options: [
                        {
                            text: "As mudanças das versões 10 a 14, com as duas pontas incluídas",
                            isCorrect: true,
                        },
                        {
                            text: "As mudanças das versões 11 a 13, com as duas pontas excluídas",
                            isCorrect: false,
                        },
                        {
                            text: "As mudanças da versão 10 até a mais recente, ignorando o segundo argumento",
                            isCorrect: false,
                        },
                        {
                            text: "As mudanças das versões 10 a 14, mas só as de inclusão e de exclusão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um fluxo lê uma tabela Delta de prata direto, sem feed, e passa a falhar depois que um `MERGE` diário começou a rodar sobre essa tabela. O time precisa que a atualização e a exclusão cheguem à tabela de ouro. Qual caminho atende?",
                    difficulty: "dificil",
                    explanation:
                        "skipChangeCommits faz o fluxo voltar a rodar, mas ignora por completo a transação de modificação, então a alteração não chega ao destino. Para processar inclusão, atualização e exclusão a recomendação é ler o Change Data Feed da tabela.",
                    options: [
                        {
                            text: "Ler o Change Data Feed da tabela, que entrega inclusão, atualização e exclusão",
                            isCorrect: true,
                        },
                        {
                            text: "Ligar `skipChangeCommits` no fluxo, que passa a propagar também a modificação",
                            isCorrect: false,
                        },
                        {
                            text: "Ligar `ignoreDeletes` no fluxo, que trata atualização e exclusão sem duplicata",
                            isCorrect: false,
                        },
                        {
                            text: "Elevar `maxFilesPerTrigger` no fluxo, que passa a ler o commit do `MERGE` inteiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um fluxo novo com `readChangeFeed` igual a `true` é iniciado sobre uma tabela de dez milhões de linhas e o primeiro lote entrega tudo como inclusão. Qual é a explicação e o ajuste?",
                    difficulty: "medio",
                    explanation:
                        "Na primeira partida, o fluxo devolve o snapshot atual da tabela como registros de inclusão e só depois as mudanças futuras; informar startingVersion evita reprocessar o que já existia. Os limites de vazão mudam o tamanho do lote, não o ponto de partida.",
                    options: [
                        {
                            text: "É o comportamento de primeira partida, e `startingVersion` evita reprocessar o que já existia",
                            isCorrect: true,
                        },
                        {
                            text: "É o comportamento de feed sem retenção, e `endingVersion` limita o primeiro lote ao trecho recente",
                            isCorrect: false,
                        },
                        {
                            text: "É sinal de que o feed não estava ligado, e `ALTER TABLE` precisa ser repetido antes do fluxo",
                            isCorrect: false,
                        },
                        {
                            text: "É efeito do limite de vazão padrão, e `maxBytesPerTrigger` reduz o primeiro lote à mudança",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Viagem no tempo, restauração e clone",
            blocks: [
                {
                    type: "text",
                    value: "Um job rodou com a regra errada e sobrescreveu a tabela de ouro às três da manhã. Você tem três ferramentas e elas não são intercambiáveis: consultar uma versão antiga, restaurar a tabela para ela, ou clonar o estado antigo em outra tabela para conferir antes de mexer na produção. No fim da aula você escolhe a certa, sabe o que a restauração faz com o histórico e com quem lê a tabela, e sabe o que o clone profundo leva e o que o clone raso deixa para trás.",
                },
                {
                    type: "code",
                    value: "-- por versão\nSELECT * FROM prod.vendas.pedidos VERSION AS OF 123;\n\n-- por carimbo de tempo\nSELECT * FROM prod.vendas.pedidos TIMESTAMP AS OF '2026-10-01T22:15:12.013Z';\n\n-- a forma curta: @v mais a versão, ou @ mais yyyyMMddHHmmssSSS\nSELECT * FROM prod.vendas.pedidos@v123;\nSELECT * FROM prod.vendas.pedidos@20261001221512013;",
                },
                {
                    type: "code",
                    value: '# em Python, a mesma viagem vira opção de leitura\nantes = spark.read.option("versionAsOf", 123).table("prod.vendas.pedidos")\nontem = spark.read.option("timestampAsOf", "2026-10-01").table("prod.vendas.pedidos")\n\n# o diff que resolve a conversa com o time de negócio\nagora = spark.table("prod.vendas.pedidos")\nperdidas = antes.exceptAll(agora)',
                },
                {
                    type: "text",
                    value: "Antes de viajar, descubra para onde. `DESCRIBE HISTORY nome_da_tabela` devolve o histórico de escritas da tabela, com a operação, o usuário e o carimbo de tempo de cada escrita, em ordem cronológica inversa. É a partir dele que você escolhe a versão, e três colunas dele respondem quase toda pergunta de investigação: `operationParameters`, que traz o mapa de parâmetros da operação, como os predicados, `operationMetrics`, que traz as métricas, como linhas e arquivos modificados, e `userMetadata`, que traz os metadados de commit definidos por você, quando houver.",
                },
                {
                    type: "table",
                    value: '[["Coluna de DESCRIBE HISTORY", "Para que serve na investigação"], ["version e timestamp", "a versão que a operação gerou e o momento em que ela foi comitada, que são as duas entradas da viagem no tempo"], ["operation e operationParameters", "o nome da operação e o mapa de parâmetros, como os predicados usados"], ["readVersion", "a versão da tabela que foi lida para realizar a escrita, útil para ver sobre que estado a operação decidiu"], ["isolationLevel", "o nível de isolamento usado naquela escrita"], ["isBlindAppend", "se a operação apenas acrescentou dado, o que explica por que ela quase não conflita"], ["operationMetrics", "o mapa de métricas, por exemplo numTargetRowsUpdated, numTargetRowsCopied e numTargetFilesRemoved em um MERGE"], ["job e notebook", "os detalhes de quem escreveu, preenchidos só quando o commit veio de job ou de notebook"]]',
                },
                {
                    type: "text",
                    value: "Consultar a versão antiga resolve diagnóstico. Para voltar a tabela ao estado dela, o comando é `RESTORE`, e a sintaxe aceita versão ou carimbo de tempo. Quatro fatos que a prova cobra:\n\n- **permissão**: para restaurar uma tabela é preciso ter `MODIFY` nela;\n- **o histórico não é apagado**. A restauração é mais um commit: o exemplo da própria documentação mostra a restauração como a versão 3 da tabela, gravando `RemoveFile` do arquivo compactado e `AddFile` dos dois arquivos antigos. Você continua podendo consultar a versão ruim depois de restaurar;\n- **as entradas de log do `RESTORE` têm `dataChange` igual a true**, e por isso a restauração é uma operação que muda dado e pode resultar em dado duplicado para as cargas a jusante. Consumidor em fluxo vai reprocessar as linhas restauradas;\n- **não existe restauração sem arquivo**. Não é possível restaurar para uma versão cujos arquivos de dado foram excluídos, manualmente ou pelo `VACUUM`. Restauração parcial é possível se `spark.sql.files.ignoreMissingFiles` estiver em `true`, e aí você está aceitando voltar com menos dado do que havia.",
                },
                {
                    type: "code",
                    value: "-- restaurar devolve métricas do que entrou e saiu\nRESTORE TABLE prod.vendas.pedidos TO VERSION AS OF 123;\nRESTORE TABLE prod.vendas.pedidos TO TIMESTAMP AS OF '2026-10-01 00:00:00';\n\n-- colunas do resultado: table_size_after_restore, num_of_files_after_restore,\n-- num_removed_files, num_restored_files, removed_files_size, restored_files_size\n\n-- e a restauração aparece como uma versão nova no histórico\nDESCRIBE HISTORY prod.vendas.pedidos;",
                },
                {
                    type: "quote",
                    value: "Restaurar não apaga o passado, acrescenta uma versão: a tabela volta ao conteúdo antigo e o histórico ganha mais um commit, com `dataChange` igual a true.",
                },
                {
                    type: "text",
                    value: "Quando o certo é não mexer na produção, entra o clone. São dois, e a diferença é o dado:\n\n- **clone profundo**, escrito `DEEP CLONE` ou apenas `CLONE`, copia o dado e os metadados da tabela de origem para o destino;\n- **clone raso**, `SHALLOW CLONE`, copia apenas os metadados, e os arquivos de dado não são copiados: o clone passa a referenciar os arquivos de dado da origem.\n\nOs dois copiam schema, informação de particionamento, invariantes, nulabilidade e `TBLPROPERTIES`. Só o clone profundo copia os metadados de fluxo e os metadados do `COPY INTO`, e essa é a diferença que resolve migração: como o clone profundo leva os metadados de fluxo, um fluxo que escrevia na origem pode ser parado e continuado no clone a partir de onde parou.\n\nE o que clone nenhum copia: a descrição da tabela, os metadados de commit definidos pelo usuário, **o histórico da tabela Delta** e as propriedades do Unity Catalog, como as tags. O clone tem histórico independente, e por isso consulta de viagem no tempo em uma tabela clonada não funciona com as mesmas entradas que funcionam na origem. Quem clona esperando levar o histórico vai descobrir isso na hora errada.",
                },
                {
                    type: "table",
                    value: '[["Aspecto", "DEEP CLONE", "SHALLOW CLONE"], ["Arquivos de dado", "copiados para o destino", "não copiados, o clone referencia os arquivos da origem"], ["Schema, partição, invariantes, nulabilidade e TBLPROPERTIES", "copiados", "copiados"], ["Metadados de fluxo e metadados do COPY INTO", "copiados, e um fluxo pode continuar no clone de onde parou", "não copiados"], ["Histórico da tabela, descrição e tags do Unity Catalog", "não copiados, o clone tem histórico independente", "não copiados, o clone tem histórico independente"], ["Dependência da origem depois de criado", "nenhuma, o clone se sustenta sozinho", "total, VACUUM na origem quebra a leitura do clone"], ["Custo de criação", "proporcional ao dado copiado", "quase nenhum, é só metadado"]]',
                },
                {
                    type: "code",
                    value: "-- clone profundo, com o dado\nCREATE TABLE sandbox.vendas.pedidos_copia DEEP CLONE prod.vendas.pedidos;\nCREATE OR REPLACE TABLE sandbox.vendas.pedidos_copia DEEP CLONE prod.vendas.pedidos;\nCREATE TABLE IF NOT EXISTS sandbox.vendas.pedidos_copia CLONE prod.vendas.pedidos;\n\n-- clone raso, só metadado, e dá para clonar uma versão antiga\nCREATE TABLE sandbox.vendas.pedidos_teste\n  SHALLOW CLONE prod.vendas.pedidos VERSION AS OF 123;\n\n-- clone raso que já existe não aceita CREATE OR REPLACE no Unity Catalog:\n-- é DROP TABLE e CREATE TABLE de novo, ou um nome novo\nDROP TABLE sandbox.vendas.pedidos_teste;",
                },
                {
                    type: "text",
                    value: "O risco do clone raso tem nome de erro. Como ele referencia os arquivos de dado da origem, se você rodar `VACUUM` na tabela de origem os clientes não conseguem mais ler esses arquivos e recebem `FileNotFoundException`. O reparo documentado é rodar o clone de novo, com substituição, sobre o clone raso; se isso acontece com frequência, a recomendação é usar clone profundo, que não depende da origem.\n\nOutras condições de contorno que valem para o clone:\n\n- clone de tabela Delta que já existe gera um commit incremental, com apenas os metadados e o dado novos desde o último clone, o que é o que permite sincronizar um clone profundo de tempo em tempo sem copiar tudo outra vez;\n- no Unity Catalog, clone raso de tabela gerenciada é suportado no Databricks Runtime 13.3 LTS e acima, e não é possível usar `CREATE OR REPLACE` para sobrescrever um clone raso que já existe: use `DROP TABLE` e depois `CREATE TABLE`, ou outro nome;\n- quem lê um clone raso precisa de acesso de leitura aos arquivos de dado da origem, além do diretório do clone;\n- tabela de streaming e visão materializada não suportam `CLONE`, nem como origem nem como destino.",
                },
                {
                    type: "text",
                    value: "Fecha a aula o limite de todas as três ferramentas: para consultar, restaurar ou clonar uma versão anterior é preciso ter retido tanto os arquivos de log quanto os arquivos de dado daquela versão. Já existe runtime que não deixa nem tentar: no Databricks Runtime 18.0 e acima, consultas de viagem no tempo são bloqueadas quando pedem versão mais antiga que a propriedade `delta.deletedFileRetentionDuration`, cujo padrão é sete dias. Em runtime anterior a tentativa simplesmente encontra arquivo faltando.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual consulta lê a tabela `prod.vendas.pedidos` como ela estava na versão 123?",
                    difficulty: "facil",
                    explanation:
                        "A sintaxe documentada é VERSION AS OF com o número da versão, e a forma curta equivalente é @v123. AS OF VERSION e o argumento de carimbo em VERSION AS OF não existem, e RESTORE não consulta, ele altera a tabela.",
                    options: [
                        {
                            text: "`SELECT * FROM prod.vendas.pedidos VERSION AS OF 123`",
                            isCorrect: true,
                        },
                        {
                            text: "`SELECT * FROM prod.vendas.pedidos AS OF VERSION 123`",
                            isCorrect: false,
                        },
                        {
                            text: "`SELECT * FROM prod.vendas.pedidos WITH VERSION 123`",
                            isCorrect: false,
                        },
                        {
                            text: "`RESTORE prod.vendas.pedidos TO VERSION 123 READ ONLY`",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que acontece com o histórico e com os consumidores em fluxo depois de um `RESTORE TABLE` para uma versão antiga?",
                    difficulty: "medio",
                    explanation:
                        "A restauração é um commit novo, com dataChange igual a true nas entradas de log, então o histórico cresce e a operação conta como mudança de dado, podendo gerar duplicata a jusante. Ela não apaga as versões posteriores nem passa invisível.",
                    options: [
                        {
                            text: "O histórico ganha uma versão nova, e a jusante pode haver dado duplicado",
                            isCorrect: true,
                        },
                        {
                            text: "O histórico perde as versões posteriores, e a jusante nada é reprocessado",
                            isCorrect: false,
                        },
                        {
                            text: "O histórico ganha uma versão nova, e a jusante nada é reprocessado",
                            isCorrect: false,
                        },
                        {
                            text: "O histórico fica igual, porque a tabela volta a apontar para a versão antiga",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time clona uma tabela de produção com `DEEP CLONE` para um ambiente de teste e precisa consultar nela a versão de três dias atrás da tabela original. O que ele encontra?",
                    difficulty: "medio",
                    explanation:
                        "Clone nenhum copia o histórico da tabela Delta: o clone tem histórico independente, e consulta de viagem no tempo nele não funciona com as mesmas entradas da origem. O clone profundo copia o dado e os metadados, não as versões passadas.",
                    options: [
                        {
                            text: "Não encontra, porque o histórico não é copiado e o clone tem histórico próprio",
                            isCorrect: true,
                        },
                        {
                            text: "Encontra, porque o clone profundo copia o dado e também o histórico de versões",
                            isCorrect: false,
                        },
                        {
                            text: "Encontra, porque o clone profundo mantém referência ao log da tabela de origem",
                            isCorrect: false,
                        },
                        {
                            text: "Não encontra, porque viagem no tempo exige a propriedade de retenção no clone",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Consultas sobre um `SHALLOW CLONE` de uma tabela fora do Unity Catalog, criado na semana passada, começaram a falhar com `FileNotFoundException`. O que explica e qual é o reparo documentado?",
                    difficulty: "dificil",
                    explanation:
                        "O clone raso referencia os arquivos de dado da origem; um VACUUM na origem apaga esses arquivos e a leitura do clone quebra. O reparo é rodar o clone de novo com substituição, e a saída definitiva é clone profundo, que não depende da origem.",
                    options: [
                        {
                            text: "O `VACUUM` rodou na origem e apagou os arquivos que o clone referencia, e o clone precisa ser refeito",
                            isCorrect: true,
                        },
                        {
                            text: "O `VACUUM` rodou no clone e apagou os arquivos próprios dele, e a tabela de origem precisa ser restaurada",
                            isCorrect: false,
                        },
                        {
                            text: "O schema da origem evoluiu e invalidou o metadado do clone, e o clone precisa de `MSCK REPAIR`",
                            isCorrect: false,
                        },
                        {
                            text: "O clone raso expirou junto com a retenção de log da origem, e a retenção precisa ser elevada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma migração precisa levar uma tabela Delta para outro catálogo e continuar, no destino, um fluxo que escrevia na tabela de origem a partir de onde ele parou. Qual operação viabiliza isso?",
                    difficulty: "dificil",
                    explanation:
                        "Só o clone profundo copia os metadados de fluxo e os do COPY INTO, e é por isso que um fluxo pode ser parado na origem e continuado no clone. O clone raso não leva esses metadados, e um CREATE TABLE AS SELECT copia apenas o conteúdo.",
                    options: [
                        {
                            text: "`DEEP CLONE`, que copia os metadados de fluxo junto com o dado e os demais metadados",
                            isCorrect: true,
                        },
                        {
                            text: "`SHALLOW CLONE`, que copia os metadados de fluxo e apenas referencia o dado da origem",
                            isCorrect: false,
                        },
                        {
                            text: "`CREATE TABLE AS SELECT`, que copia o conteúdo e recria o checkpoint do fluxo",
                            isCorrect: false,
                        },
                        {
                            text: "`RESTORE`, que recria a tabela no destino na versão em que o fluxo havia parado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "VACUUM, retenção e o preço do histórico",
            blocks: [
                {
                    type: "text",
                    value: "Guardar histórico custa armazenamento, e apagar histórico custa capacidade de auditoria e de reparo. No fim desta aula você sabe quais duas propriedades controlam esse equilíbrio, o que o `VACUUM` apaga e o que ele não toca, por que o feed de mudança é a parte mais cara e mais perigosa do histórico, e o que precisa acontecer para um dado pessoal realmente sair da tabela.",
                },
                {
                    type: "text",
                    value: "Comece separando duas retenções que vivem sendo confundidas, porque elas governam coisas diferentes:\n\n- `delta.logRetentionDuration` diz por quanto tempo o histórico da tabela é mantido, e o padrão é `interval 30 days`. É a retenção dos arquivos de log, que são apagados automaticamente e de forma assíncrona depois das operações de checkpoint, e não pelo `VACUUM`;\n- `delta.deletedFileRetentionDuration` diz por quanto tempo um arquivo de dado logicamente excluído é mantido antes da exclusão física, e o padrão é `interval 1 week`, isto é, sete dias. É ele que define a janela do `VACUUM`.\n\nA consequência prática aparece na primeira tentativa de viagem no tempo: para consultar uma versão anterior você precisa ter retido **tanto o log quanto os arquivos de dado** daquela versão. Trinta dias de log com sete dias de arquivo de dado dão, na prática, sete dias de viagem no tempo, e um histórico que mostra versões que não podem mais ser lidas.",
                },
                {
                    type: "table",
                    value: '[["Propriedade", "O que ela governa", "Padrão"], ["delta.logRetentionDuration", "por quanto tempo o histórico da tabela é mantido, isto é, os arquivos de log", "interval 30 days"], ["delta.deletedFileRetentionDuration", "por quanto tempo o arquivo de dado logicamente excluído sobrevive, o que define a janela do VACUUM", "interval 1 week, sete dias"], ["delta.enableChangeDataFeed", "se a tabela grava feed de mudança, que tem custo de armazenamento próprio", "false"]]',
                },
                {
                    type: "code",
                    value: "-- listar o que seria apagado, até mil arquivos, sem apagar nada\nVACUUM prod.vendas.pedidos DRY RUN;\n\n-- apagar, no modo padrão\nVACUUM prod.vendas.pedidos;\n\n-- modo enxuto, que usa o log em vez de listar o diretório inteiro\nVACUUM prod.vendas.pedidos LITE;\n\n-- esticar a janela para trinta dias de viagem no tempo\nALTER TABLE prod.vendas.pedidos\n  SET TBLPROPERTIES ('delta.deletedFileRetentionDuration' = '30 days');",
                },
                {
                    type: "text",
                    value: "O que o `VACUUM` apaga, na definição da documentação: todos os arquivos do diretório da tabela que não são gerenciados pelo Delta, mais os arquivos de dado que já não estão no estado mais recente do log de transações da tabela e são mais antigos que um limiar de retenção. O limiar padrão é de sete dias.\n\nTrês detalhes que decidem questão de prova:\n\n- a conta do tempo não é a data de modificação no armazenamento. Os arquivos de dado são excluídos conforme o momento em que foram **logicamente removidos** do log de transações do Delta mais as horas de retenção;\n- o `VACUUM` pula todo diretório que começa com sublinhado, o que inclui o `_delta_log`. A exceção é particionar a tabela por uma coluna que comece com sublinhado, caso em que ele varre todas as partições válidas da tabela;\n- o log de transações não é governado pelo `VACUUM`. Quem apaga arquivo de log é o processo assíncrono que roda depois do checkpoint, limitado por `delta.logRetentionDuration`.\n\nE o que se perde: rodar `VACUUM` em uma tabela Delta remove os arquivos de dado necessários para a viagem no tempo, então você perde a capacidade de consultar versões mais antigas que o período de retenção, e também de restaurar para elas. Com cache de disco, o dado em cache de arquivo já apagado pode continuar em um cluster até ele reiniciar.",
                },
                {
                    type: "quote",
                    value: "O `VACUUM` conta a idade do arquivo pelo momento em que ele saiu do log de transações, não pela data de modificação no armazenamento, e pula todo diretório que começa com sublinhado, inclusive o `_delta_log`.",
                },
                {
                    type: "table",
                    value: '[["Opção do VACUUM", "O que ela faz", "Condição"], ["DRY RUN", "devolve a lista de até mil arquivos que seriam apagados, sem apagar", "serve de conferência antes de rodar de verdade"], ["FULL", "apaga o dado fora da retenção e todos os arquivos do diretório da tabela não referenciados por ela", "é o padrão, a partir do Databricks Runtime 16.1"], ["LITE", "usa o log de transações para achar o que não é mais referenciado, em vez de listar o diretório", "falha com DELTA_CANNOT_VACUUM_LITE se o log já foi podado"]]',
                },
                {
                    type: "text",
                    value: "Sobre rodar o comando, três avisos e uma automação. A Databricks recomenda com ênfase uma janela de retenção de no mínimo sete dias, porque job que roda por vários dias pode escrever arquivo que ainda não foi comitado, e retenção curta demais faria o `VACUUM` apagar esse arquivo não comitado antes do job terminar. Existe uma verificação de segurança para impedir um `VACUUM` perigoso, e ela pode ser desligada pondo `spark.databricks.delta.retentionDurationCheck.enabled` em `false`, mas só se você tiver certeza de que nenhuma operação sobre a tabela dura mais que o intervalo de retenção que pretende usar. O modo enxuto, além disso, exige ao menos um `VACUUM` bem-sucedido dentro do período de retenção do log de transações.\n\nA automação é a otimização preditiva, que roda `VACUUM` automaticamente nas tabelas gerenciadas do Unity Catalog, e a recomendação é habilitá-la nessas tabelas. Com ela ligada, na maior parte dos casos você não precisa rodar o comando à mão, o que muda a pergunta: em vez de agendar a limpeza, você passa a configurar a retenção.",
                },
                {
                    type: "text",
                    value: "Agora o preço do feed de mudança, que é a parte do histórico que mais surpreende na fatura. Com o feed legado, as mudanças podem ser gravadas em arquivos separados, o que aumenta um pouco o custo de armazenamento, e esses arquivos de dado de mudança são gerenciados no diretório `_change_data` e removidos pelo `VACUUM`.\n\nO que define o tamanho da conta é o tipo de operação. Algumas operações, como escrita apenas de inclusão e exclusão de partição inteira, **não geram arquivo de dado de mudança**: para elas o feed é calculado direto a partir do log de transações. Então uma tabela de ingestão só de append praticamente não paga nada pelo feed, enquanto uma tabela que recebe `MERGE INTO` e `UPDATE` linha a linha paga em cada commit. É por isso que o feed automático descrito na documentação atual, que calcula a mudança no momento da leitura a partir do rastreio de linha, melhora o desempenho de escrita: ele não grava o arquivo de mudança a cada `MERGE INTO` ou `UPDATE`.",
                },
                {
                    type: "text",
                    value: "A retenção do feed é a armadilha seguinte, porque ela não é configurável à parte. Os arquivos de dado de mudança seguem a política de retenção da tabela, e as mudanças derivadas do log de transações seguem a política de retenção de checkpoint. O comando `VACUUM` apaga os arquivos de dado de mudança, e quando uma versão é removida o feed daquela versão não pode mais ser lido.\n\nDaí a frase que vale decorar: um feed de mudança não foi feito para servir de registro permanente de todas as mudanças de uma tabela. Os registros ficam apenas dentro de uma janela de retenção limitada. Quem precisa de histórico permanente grava o resultado do feed em outra tabela, de forma incremental, e essa tabela passa a ser sua, com o armazenamento e a governança por sua conta.",
                },
                {
                    type: "code",
                    value: "-- a persistência recomendada: o feed vira dado de uma tabela sua.\n-- 12 é a versão em que o feed foi ligado: pedir versão anterior dá erro\nCREATE TABLE IF NOT EXISTS audit.vendas.clientes_mudancas AS\nSELECT * FROM table_changes('prod.vendas.clientes', 12);\n\n-- e, de lote em lote, só a faixa nova\nINSERT INTO audit.vendas.clientes_mudancas\nSELECT * FROM table_changes('prod.vendas.clientes', 15, 20);\n\n-- a partir daqui, a imagem anterior do dado pessoal mora nesta tabela também,\n-- e ela entra na rotina de expurgo como qualquer outra\nDELETE FROM audit.vendas.clientes_mudancas WHERE cliente_id = 4711;",
                },
                {
                    type: "text",
                    value: "Fecha a aula a tensão que a prova gosta de montar: o feed guarda a imagem anterior da linha, e um pedido de exclusão de dado pessoal quer exatamente que essa imagem desapareça. Depois de um `DELETE` na tabela, o valor antigo continua legível por três caminhos, e cada um tem o seu gatilho de expiração:\n\n- pela **viagem no tempo**, enquanto o log e os arquivos de dado daquela versão estiverem retidos;\n- pelo **feed de mudança**, na linha `delete` e nas linhas de imagem anterior, enquanto aquela versão não tiver saído da janela de retenção. Quando a versão é removida, o feed dela deixa de ser legível, e os arquivos de `_change_data` saem no `VACUUM`;\n- pela **tabela em que você persistiu o feed**, que não tem retenção automática nenhuma e só esvazia se você apagar.\n\nOu seja, apagar de verdade é apagar na tabela, deixar a versão sair da retenção, rodar `VACUUM` e tratar a tabela de histórico do feed como mais um lugar de onde o registro precisa sair. Vale lembrar que o feed legado registra apenas as mudanças feitas depois de ligado, então desligar e religar o feed deixa uma lacuna que não pode ser consultada, e no Databricks Runtime 18.0 e acima a consulta de viagem no tempo é bloqueada quando pede versão mais antiga que `delta.deletedFileRetentionDuration`.",
                },
                {
                    type: "quote",
                    value: "O feed de mudança não é registro permanente: ele vive dentro da janela de retenção da tabela, o `VACUUM` apaga os arquivos de `_change_data`, e versão removida não tem mais feed para ler.",
                },
            ],
            questions: [
                {
                    statement: "Que arquivos o comando `VACUUM` apaga em uma tabela Delta?",
                    difficulty: "facil",
                    explanation:
                        "O comando apaga os arquivos de dado que já não estão no estado mais recente do log e são mais antigos que o limiar de retenção, mais os arquivos do diretório que o Delta não gerencia. Versão recente não é apagada, e arquivo de log não é assunto dele.",
                    options: [
                        {
                            text: "Os arquivos de dado fora do estado atual do log e mais antigos que o limiar de retenção",
                            isCorrect: true,
                        },
                        {
                            text: "Os arquivos de dado de todas as versões anteriores à atual, sem olhar para o limiar de retenção",
                            isCorrect: false,
                        },
                        {
                            text: "Os arquivos de log das versões que já saíram da janela de retenção do histórico da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "As linhas marcadas como excluídas dentro dos arquivos de dado que a tabela ainda referencia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time quer encurtar o histórico de uma tabela e pergunta se o `VACUUM` apaga os arquivos JSON do log de transações. O que responder?",
                    difficulty: "medio",
                    explanation:
                        "O VACUUM pula todo diretório que começa com sublinhado, inclusive o _delta_log. Os arquivos de log são apagados automaticamente e de forma assíncrona depois das operações de checkpoint, dentro de delta.logRetentionDuration.",
                    options: [
                        {
                            text: "Não apaga, porque ele pula diretório que começa com sublinhado, e o log sai depois do checkpoint",
                            isCorrect: true,
                        },
                        {
                            text: "Apaga, porque os arquivos de log entram na mesma janela de retenção que vale para os de dado da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "Apaga, porque o modo enxuto do comando foi feito para podar o log de transações",
                            isCorrect: false,
                        },
                        {
                            text: "Não apaga, porque o log só é removido quando a tabela inteira é descartada do catálogo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma tabela tem `delta.logRetentionDuration` em trinta dias e nenhuma mudança em `delta.deletedFileRetentionDuration`. Depois de um `VACUUM`, uma consulta a uma versão de vinte dias atrás falha. Por quê?",
                    difficulty: "medio",
                    explanation:
                        "Viagem no tempo exige o log e os arquivos de dado daquela versão. O log de trinta dias ainda lista a versão, mas o VACUUM já apagou os arquivos de dado fora dos sete dias padrão, então a versão aparece no histórico e não pode ser lida.",
                    options: [
                        {
                            text: "Porque o `VACUUM` já apagou os arquivos de dado da versão, que saem em sete dias",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o log daquela versão já foi apagado pelo `VACUUM` junto com os arquivos de dado",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a viagem no tempo só aceita carimbo de tempo depois de um `VACUUM`",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a retenção de log de trinta dias precisa ser convertida em versões",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em uma tabela com o Change Data Feed legado ligado, quais operações não geram arquivo de dado de mudança?",
                    difficulty: "dificil",
                    explanation:
                        "Escrita apenas de inclusão e exclusão de partição inteira não geram arquivo de mudança: nesses casos o feed é calculado a partir do log de transações. Quem paga armazenamento de verdade é a tabela que recebe MERGE INTO e UPDATE linha a linha.",
                    options: [
                        {
                            text: "Escrita apenas de inclusão e exclusão de partição inteira, calculadas pelo log",
                            isCorrect: true,
                        },
                        {
                            text: "Atualização de uma coluna só e exclusão por chave, as duas calculadas pelo log",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer operação, porque o feed é sempre calculado no momento da leitura",
                            isCorrect: false,
                        },
                        {
                            text: "Operação de `MERGE INTO` sem cláusula de exclusão, calculada pelo checkpoint",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de atender a um pedido de exclusão de dado pessoal com um `DELETE`, um time precisa garantir que o valor antigo não fique legível. Qual avaliação está correta?",
                    difficulty: "medio",
                    explanation:
                        "O valor sobrevive na viagem no tempo e nas linhas de imagem anterior do feed até a versão sair da retenção, com o VACUUM apagando os arquivos de _change_data, e sobrevive sem prazo na tabela em que o feed foi persistido, que não tem retenção automática.",
                    options: [
                        {
                            text: "O valor segue legível pelo histórico e pelo feed até a versão sair da retenção, e sem prazo na tabela que persistiu o feed",
                            isCorrect: true,
                        },
                        {
                            text: "O valor sai na hora de todos os caminhos, porque o `DELETE` reescreve os arquivos afetados e invalida o feed daquela linha",
                            isCorrect: false,
                        },
                        {
                            text: "O valor segue legível só pelo histórico, porque o feed guarda apenas a chave da linha excluída e nunca a imagem anterior",
                            isCorrect: false,
                        },
                        {
                            text: "O valor segue legível só pelo feed, porque a viagem no tempo passa a ignorar linha excluída por pedido de conformidade",
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
    MODULO_8,
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: "avancado",
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log(
                "Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.",
            );
            return;
        }
        await db
            .update(trails)
            .set({ workloadHours: CARGA_HORARIA, description: DESCRICAO })
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
                        explanation: q.explanation,
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
        "Seed concluído: " +
            MODULOS.length +
            " módulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questões.",
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
