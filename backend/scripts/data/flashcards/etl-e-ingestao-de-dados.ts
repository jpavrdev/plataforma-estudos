import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de ETL e Ingestão de Dados, do roadmap de Engenharia de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * arquitetura; as cartas guardam as definições fechadas, os nomes dos
 * formatos e as regras de bolso que a aula enuncia de passagem.
 */
export const etlEIngestaoDeDados: CartasDaTrilha = {
    trilha: "ETL e Ingestão de Dados",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Qual é o papel de um pipeline, na definição da aula?",
                        verso: "Tornar invisível a complexidade de como o dado chegou ali.",
                    },
                    {
                        frente: "Para quem essa complexidade fica invisível?",
                        verso: "Para quem consome o dado no destino.",
                    },
                    {
                        frente: "Que responsabilidade o engenheiro de dados assume?",
                        verso: "Levar o dado da origem ao destino de forma confiável.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a etapa de ingestão faz?",
                        verso: "Traz o dado.",
                    },
                    {
                        frente: "O que a etapa de transformação faz?",
                        verso: "Dá sentido ao dado.",
                    },
                    {
                        frente: "O que a etapa de carga faz?",
                        verso: "Entrega o resultado a quem vai usar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que pergunta fazer antes de escolher streaming?",
                        verso: "Se alguém vai agir sobre o dado nos próximos segundos.",
                    },
                    {
                        frente: "Que resposta dispensa o streaming?",
                        verso: "Um relatório de amanhã de manhã já resolver.",
                    },
                    {
                        frente: "Que diferença separa batch de streaming?",
                        verso: "O batch processa em lotes; o streaming, evento a evento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a origem dita?",
                        verso: "Como você extrai.",
                    },
                    {
                        frente: "O que o destino dita?",
                        verso: "Como você entrega.",
                    },
                    {
                        frente: "O que o pipeline é, entre os dois?",
                        verso: "A ponte entre essas duas decisões.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que torna um pipeline confiável?",
                        verso: "O que ele faz quando a falha acontece.",
                    },
                    {
                        frente: "O que não torna um pipeline confiável?",
                        verso: "A ausência de falha.",
                    },
                    {
                        frente: "Que comportamento a confiabilidade exige na falha?",
                        verso: "Isolar o problema e continuar entregando o resto.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Quando o warehouse vê o dado no ETL clássico?",
                        verso: "Só depois que ele já está limpo e modelado.",
                    },
                    {
                        frente: "Onde o processamento pesado acontece no ETL?",
                        verso: "Fora do warehouse, num servidor dedicado.",
                    },
                    {
                        frente: "Que ordem as letras do ETL indicam?",
                        verso: "Extrair, transformar e carregar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que tornou guardar o dado bruto viável?",
                        verso: "Armazenamento barato e processamento elástico.",
                    },
                    {
                        frente: "O que o dado bruto guardado permite?",
                        verso: "Transformar e retransformar quantas vezes for preciso.",
                    },
                    {
                        frente: "Que ordem o ELT segue?",
                        verso: "Extrair, carregar e transformar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a pergunta certa entre ETL e ELT?",
                        verso: "Onde compensa gastar poder de processamento.",
                    },
                    {
                        frente: "Que dois lugares essa escolha compara?",
                        verso: "Um servidor dedicado antes da carga, ou o próprio destino.",
                    },
                    {
                        frente: "Qual não é a pergunta certa nessa escolha?",
                        verso: "Qual das duas abordagens é melhor.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para que a área de staging existe?",
                        verso: "Para um erro de transformação não obrigar a extrair tudo de novo.",
                    },
                    {
                        frente: "O que o staging guarda?",
                        verso: "O dado extraído, antes da transformação.",
                    },
                    {
                        frente: "Que custo o staging evita?",
                        verso: "O de bater na origem outra vez a cada erro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que etapa nova o modern data stack inventou?",
                        verso: "Nenhuma etapa nova.",
                    },
                    {
                        frente: "Que tratamento ele deu ao T do ELT?",
                        verso: "O mesmo que o código de produção sempre teve.",
                    },
                    {
                        frente: "Que práticas isso trouxe para a transformação?",
                        verso: "Versionamento, testes e documentação.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta define a estratégia de extração?",
                        verso: "Qual o volume de mudança e qual chave confiável existe.",
                    },
                    {
                        frente: "O que a extração completa faz a cada execução?",
                        verso: "Traz a tabela inteira, de novo.",
                    },
                    {
                        frente: "O que a extração incremental exige da origem?",
                        verso: "Uma chave confiável para identificar o que mudou.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como tratar o erro 429 numa extração de API?",
                        verso: "Como instrução: o servidor diz exatamente quanto esperar.",
                    },
                    {
                        frente: "O que o erro 429 não é?",
                        verso: "Uma falha do seu pipeline.",
                    },
                    {
                        frente: "Que mecanismo a API usa para entregar muitos registros?",
                        verso: "A paginação, página por página.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que organizar por prefixo de data torna possível?",
                        verso: "A extração incremental no object storage.",
                    },
                    {
                        frente: "O que o prefixo de data não é?",
                        verso: "Apenas uma questão de arrumação.",
                    },
                    {
                        frente: "Que informação o object storage dá sobre cada objeto?",
                        verso: "O caminho, o tamanho e a data de modificação.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "No que um watermark que nunca olha para trás confia?",
                        verso: "Que nada chegou atrasado.",
                    },
                    {
                        frente: "Com que frequência essa confiança se justifica?",
                        verso: "Quase nunca.",
                    },
                    {
                        frente: "O que o watermark guarda entre execuções?",
                        verso: "A marca de até onde já foi lido.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o CDC não precisa perguntar?",
                        verso: "O que mudou: ele já sabia no instante da mudança.",
                    },
                    {
                        frente: "O que separa CDC de watermark?",
                        verso: "A diferença entre escutar e perguntar.",
                    },
                    {
                        frente: "De onde o CDC costuma ler as mudanças?",
                        verso: "Do log de transações do banco.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Para que CSV e JSON são ótimos?",
                        verso: "Para trocar dados entre sistemas heterogêneos.",
                    },
                    {
                        frente: "Para que eles não foram pensados?",
                        verso: "Para leitura analítica eficiente em grande volume.",
                    },
                    {
                        frente: "Que vantagem o JSON tem sobre o CSV?",
                        verso: "Representa estrutura aninhada.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que problema o Parquet resolve no ambiente analítico?",
                        verso: "Menos bytes lidos por consulta e menos espaço ocupado.",
                    },
                    {
                        frente: "Que organização o Parquet usa?",
                        verso: "Organização colunar.",
                    },
                    {
                        frente: "Onde o Parquet virou padrão?",
                        verso: "Em data lake e data warehouse.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Avro carrega junto com o dado?",
                        verso: "O schema.",
                    },
                    {
                        frente: "Para que tipo de escrita o Avro foi desenhado?",
                        verso: "Um registro de cada vez, sem atrito.",
                    },
                    {
                        frente: "Onde o Avro é a escolha natural?",
                        verso: "No meio do caminho, com dado em movimento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a compressão troca?",
                        verso: "CPU por espaço.",
                    },
                    {
                        frente: "O que o particionamento troca?",
                        verso: "Organização por velocidade de leitura.",
                    },
                    {
                        frente: "Para que as duas decisões existem?",
                        verso: "Para o pipeline ler só o que precisa.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o schema é, além de detalhe do formato?",
                        verso: "O contrato entre quem grava e quem lê o dado.",
                    },
                    {
                        frente: "O que o schema separa na prática?",
                        verso: "A mudança tranquila do pipeline quebrado.",
                    },
                    {
                        frente: "Que mudança de schema costuma ser segura?",
                        verso: "Acrescentar um campo opcional no fim.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que acontece com dado sujo que passa despercebido?",
                        verso: "Só troca de lugar: vira métrica errada no painel.",
                    },
                    {
                        frente: "Que outro destino o dado sujo costuma ter?",
                        verso: "Viés silencioso dentro do modelo.",
                    },
                    {
                        frente: "Que problemas a limpeza trata?",
                        verso: "Nulos, tipos errados, duplicatas e outliers.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que padronizar deixa o dado?",
                        verso: "Comparável.",
                    },
                    {
                        frente: "O que enriquecer deixa o dado?",
                        verso: "Útil.",
                    },
                    {
                        frente: "Que exemplo de padronização a aula usa?",
                        verso: "Unificar formato de data, unidade e grafia.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que uma chave de deduplicação errada provoca?",
                        verso: "Apagar dado válido, em vez de limpar duplicata.",
                    },
                    {
                        frente: "O que a resolução de entidade tenta descobrir?",
                        verso: "Se dois registros diferentes são a mesma coisa.",
                    },
                    {
                        frente: "Que cuidado a deduplicação exige antes?",
                        verso: "Definir qual campo realmente identifica o registro.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a função de janela faz que o agrupamento não faz?",
                        verso: "Calcula sem colapsar as linhas.",
                    },
                    {
                        frente: "Que risco um join mal feito traz?",
                        verso: "Multiplicar linhas e inflar as somas.",
                    },
                    {
                        frente: "O que a agregação faz com o detalhe?",
                        verso: "Resume, perdendo o nível original.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a pergunta certa entre SQL e código?",
                        verso: "Qual deles o problema e o time pedem naquele caso.",
                    },
                    {
                        frente: "Qual não é a pergunta certa?",
                        verso: "Qual das duas linguagens é melhor.",
                    },
                    {
                        frente: "Que trabalho o SQL costuma fazer melhor?",
                        verso: "Junções e agregações sobre tabelas grandes.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta define a estratégia de carga?",
                        verso: "Se os dados de origem podem mudar depois de criados.",
                    },
                    {
                        frente: "Que carga os dados imutáveis pedem?",
                        verso: "Append, apenas acrescentando.",
                    },
                    {
                        frente: "Que carga os dados que mudam pedem?",
                        verso: "Upsert, atualizando ou inserindo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma carga idempotente garante?",
                        verso: "O destino termina igual, rodando uma ou cem vezes.",
                    },
                    {
                        frente: "O que indica que a carga não é idempotente?",
                        verso: "O resultado mudar a cada repetição.",
                    },
                    {
                        frente: "Por que a idempotência importa tanto?",
                        verso: "Reprocessar deixa de ser arriscado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que uma carga incremental leva ao destino?",
                        verso: "Só o que mudou desde a última execução.",
                    },
                    {
                        frente: "Que controle a carga incremental exige?",
                        verso: "Saber até onde a carga anterior chegou.",
                    },
                    {
                        frente: "Que ganho a carga incremental traz?",
                        verso: "Menos dado movido e janela de carga menor.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a carga precisa fazer numa dimensão tipo 2?",
                        verso: "Fechar a versão antiga e abrir a nova.",
                    },
                    {
                        frente: "Que coluna marca a versão vigente?",
                        verso: "A de linha atual, ou a data de fim de vigência.",
                    },
                    {
                        frente: "O que a carga da dimensão precisa detectar?",
                        verso: "Que atributo mudou desde a última versão.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quando o backfill é seguro?",
                        verso: "Só quando a carga já é idempotente.",
                    },
                    {
                        frente: "Que teste antecede um backfill grande?",
                        verso: "Rodar o mesmo dia várias vezes e comparar o resultado.",
                    },
                    {
                        frente: "O que o backfill faz, afinal?",
                        verso: "Reprocessa um período inteiro que já passou.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que o pipeline confiável faz com a falha?",
                        verso: "Isola e continua entregando o resto.",
                    },
                    {
                        frente: "Para que serve a fila de mensagens mortas?",
                        verso: "Guardar o que falhou, sem travar o resto.",
                    },
                    {
                        frente: "O que a quarentena separa?",
                        verso: "O registro inválido, para análise posterior.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que validar na entrada evita?",
                        verso: "Descobrir o problema semanas depois, num relatório.",
                    },
                    {
                        frente: "Em quanto tempo a validação na entrada revela o erro?",
                        verso: "Em segundos.",
                    },
                    {
                        frente: "O que validar na entrada não é?",
                        verso: "Burocracia.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que sinais uma carga monitorada emite?",
                        verso: "Volume, duração e taxa de erro por execução.",
                    },
                    {
                        frente: "O que a queda súbita de volume costuma indicar?",
                        verso: "Origem quebrada, ou filtro errado no caminho.",
                    },
                    {
                        frente: "Que alerta toda carga programada merece?",
                        verso: "O de execução que simplesmente não aconteceu.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a escolha entre caseiro e gerenciado não é?",
                        verso: "Uma decisão única e definitiva.",
                    },
                    {
                        frente: "O que times maduros costumam fazer?",
                        verso: "Conector gerenciado no comum, pipeline próprio no específico.",
                    },
                    {
                        frente: "Que critério separa os dois casos?",
                        verso: "Se a fonte é comum ou específica do negócio.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como um pipeline confiável nasce?",
                        verso: "Não nasce pronto: ele acumula decisões.",
                    },
                    {
                        frente: "O que essas pequenas escolhas evitam?",
                        verso: "Os grandes incêndios.",
                    },
                    {
                        frente: "Que antipadrão a trilha mais combate?",
                        verso: "Pipeline sem idempotência, validação nem monitoramento.",
                    },
                ],
            },
        },
    },
};
