import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de SQL para Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a leitura do
 * cenário e a escolha da cláusula; as cartas guardam as listas fechadas,
 * o vocabulário próprio e as armadilhas que a aula enuncia de passagem.
 *
 * A trilha aparece em mais de um roadmap, então o fechamento não crava
 * roadmap nem trilha seguinte.
 */
export const sqlParaDados: CartasDaTrilha = {
    trilha: "SQL para Dados",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que três ganhos a tabela traz sobre a planilha?",
                        verso: "Responder sem carregar tudo, combinar fontes e confiar no dado.",
                    },
                    {
                        frente: "Que vantagem a consulta em texto tem sobre o clique?",
                        verso: "Ela versiona no Git e repete o mesmo resultado depois.",
                    },
                    {
                        frente: "O que a planilha deixa como registro do que foi feito?",
                        verso: "Só a sequência de cliques, que ninguém refaz igual.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que nome o conjunto de valores aceitos por uma coluna tem?",
                        verso: "Domínio, que restringe o que entra naquela coluna.",
                    },
                    {
                        frente: "Que características as tabelas de dimensão compartilham?",
                        verso: "São pequenas, mudam pouco e definem os recortes.",
                    },
                    {
                        frente: "Que exemplos de fato a aula cita além de vendas?",
                        verso: "Eventos de produto e leituras de sensor.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que diferença separa timestamp de timestamptz?",
                        verso: "O timestamptz guarda o instante com fuso; o outro não.",
                    },
                    {
                        frente: "Que efeito o fuso ignorado produz no relatório diário?",
                        verso: "O que passa das 21h no Brasil cai no dia seguinte.",
                    },
                    {
                        frente: "Que regra prática a aula dá para instante e data pura?",
                        verso: "Instante em timestamptz; competência sem hora, em date.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que diferença separa chave natural de artificial?",
                        verso: "A natural vem do negócio; a artificial só existe no banco.",
                    },
                    {
                        frente: "Que estrago a linha órfã causa numa junção interna?",
                        verso: "Ela é descartada, e o total por categoria fica menor.",
                    },
                    {
                        frente: "Por que o ambiente analítico costuma dispensar a estrangeira?",
                        verso: "Pelo custo de carga, o que joga a checagem para o analista.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como o colunar guarda cada coluna da tabela?",
                        verso: "Num arquivo separado, lido só quando a coluna é pedida.",
                    },
                    {
                        frente: "Que operação fica cara no armazenamento colunar?",
                        verso: "Buscar ou atualizar a linha inteira de um registro.",
                    },
                    {
                        frente: "Que expectativa de tempo separa os dois mundos?",
                        verso: "Dois segundos é grave no transacional e ótimo no analítico.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que propriedade do resultado permite encaixar consultas?",
                        verso: "Ele também é uma tabela, só que temporária.",
                    },
                    {
                        frente: "Que três custos o asterisco cobra numa consulta?",
                        verso: "Leitura a mais, saída instável e menos comunicação.",
                    },
                    {
                        frente: "Que uso legítimo o asterisco ainda tem?",
                        verso: "Explorar tabela desconhecida, sempre com LIMIT.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três atalhos de filtro aparecem em quase toda análise?",
                        verso: "O IN de lista, o BETWEEN de intervalo e o LIKE de padrão.",
                    },
                    {
                        frente: "Que armadilha o NOT IN esconde com nulo na lista?",
                        verso: "O resultado inteiro vem vazio, sem nenhum erro.",
                    },
                    {
                        frente: "Por que filtrar a coluna crua vence extrair função dela?",
                        verso: "A função sobre a coluna atrapalha o uso do índice.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que cláusulas decidem onde o nulo cai na ordenação?",
                        verso: "O NULLS LAST e o NULLS FIRST, ditos na consulta.",
                    },
                    {
                        frente: "De que duas formas o topo engana quem analisa?",
                        verso: "Na representatividade e na estabilidade do ranking.",
                    },
                    {
                        frente: "Que número de contexto deve acompanhar todo topo?",
                        verso: "Quanto ele pesa no total, com a mediana ao lado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três formas o count assume numa consulta?",
                        verso: "Com asterisco, com coluna e com distinct da coluna.",
                    },
                    {
                        frente: "O que count e sum devolvem quando não há linha alguma?",
                        verso: "O count devolve zero e o sum devolve nulo.",
                    },
                    {
                        frente: "Que função protege um painel do sum nulo?",
                        verso: "O coalesce, trocando o nulo por zero quando cabe.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que ordem lógica o banco segue ao executar a consulta?",
                        verso: "FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY e LIMIT.",
                    },
                    {
                        frente: "Onde o apelido do SELECT funciona, e onde não?",
                        verso: "Funciona no ORDER BY; no WHERE, ainda não existe.",
                    },
                    {
                        frente: "Que efeito filtrar no WHERE ou no HAVING tem no número?",
                        verso: "São perguntas diferentes: uma corta vendas, outra corta grupos.",
                    },
                ],
            },
        },
    },
};
