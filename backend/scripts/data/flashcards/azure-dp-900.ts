import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de AZURE DP-900, trilha de certificação sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário; as
 * cartas guardam as separações entre conceitos parecidos e a ligação entre
 * a necessidade e o serviço de dados do Azure.
 */
export const azureDp900: CartasDaTrilha = {
    trilha: "AZURE DP-900",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que separa os três tipos de dado?",
                        verso: "O schema.",
                    },
                    {
                        frente: "Onde o dado estruturado define o schema?",
                        verso: "Antes de gravar, e ele é fixo.",
                    },
                    {
                        frente: "Onde o semiestruturado carrega o schema?",
                        verso: "Dentro do próprio dado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Onde o formato colunar vence?",
                        verso: "Na leitura analítica e na compressão.",
                    },
                    {
                        frente: "Por que ele vence ali?",
                        verso: "Busca só as colunas pedidas.",
                    },
                    {
                        frente: "Onde o formato por linha vence?",
                        verso: "Na escrita e no transporte do registro inteiro.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como o OLTP mantém o dado?",
                        verso: "Atual e normalizado, com transações.",
                    },
                    {
                        frente: "Como o OLAP mantém o dado?",
                        verso: "Histórico e desnormalizado, em esquema estrela.",
                    },
                    {
                        frente: "Que carga escreve muito e lê pouco por vez?",
                        verso: "A transacional.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o administrador de banco faz?",
                        verso: "Mantém o banco no ar e protegido.",
                    },
                    {
                        frente: "O que o engenheiro de dados faz?",
                        verso: "Constrói os pipelines e entrega o dado pronto.",
                    },
                    {
                        frente: "O que o analista de dados faz?",
                        verso: "Transforma o dado em informação para decidir.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que a chave primária identifica?",
                        verso: "A linha dentro da própria tabela.",
                    },
                    {
                        frente: "O que a chave estrangeira faz?",
                        verso: "Liga uma tabela à outra pela chave.",
                    },
                    {
                        frente: "O que uma tabela organiza?",
                        verso: "Linhas e colunas, com tipos definidos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que normalizar reduz?",
                        verso: "Repetição e anomalias.",
                    },
                    {
                        frente: "Que preço a normalização cobra?",
                        verso: "Mais tabelas e mais junções na hora de consultar.",
                    },
                    {
                        frente: "Onde a normalização é regra?",
                        verso: "No banco transacional.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que a DDL mexe?",
                        verso: "Na estrutura.",
                    },
                    {
                        frente: "Em que a DML mexe?",
                        verso: "Nos dados.",
                    },
                    {
                        frente: "Do que a DCL cuida?",
                        verso: "Das permissões.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que serviço é a ponte para migrar o SQL Server local?",
                        verso: "O Managed Instance.",
                    },
                    {
                        frente: "Para que o Azure SQL Database foi feito?",
                        verso: "Para aplicações novas na nuvem.",
                    },
                    {
                        frente: "O que a máquina virtual entrega a mais?",
                        verso: "Controle total, com mais trabalho de operação.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Para que serve o Blob?",
                        verso: "Para dados não estruturados.",
                    },
                    {
                        frente: "Para que serve o Files?",
                        verso: "Para compartilhamento montável por SMB e NFS.",
                    },
                    {
                        frente: "Para que serve o Table?",
                        verso: "Para NoSQL de chave e valor.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o Cosmos DB é?",
                        verso: "NoSQL como serviço, com distribuição global.",
                    },
                    {
                        frente: "Que latência ele promete?",
                        verso: "Poucos milissegundos.",
                    },
                    {
                        frente: "Qual é a API nativa dele?",
                        verso: "A API for NoSQL, com documentos JSON.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Quando o ETL transforma?",
                        verso: "Antes de gravar: só dado curado entra.",
                    },
                    {
                        frente: "Quando o ELT transforma?",
                        verso: "Depois de gravar o bruto, já no destino.",
                    },
                    {
                        frente: "Onde o schema-on-write vale?",
                        verso: "No data warehouse.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o Microsoft Fabric é?",
                        verso: "O serviço guarda-chuva de análise, entregue como SaaS.",
                    },
                    {
                        frente: "O que o OneLake faz?",
                        verso: "Guarda o dado uma única vez para todas as cargas.",
                    },
                    {
                        frente: "O que o Azure Databricks traz?",
                        verso: "A plataforma Spark gerenciada.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como o processamento em lote funciona?",
                        verso: "Acumula um volume e processa de tempos em tempos.",
                    },
                    {
                        frente: "Como o streaming funciona?",
                        verso: "Evento a evento, em tempo quase real.",
                    },
                    {
                        frente: "Para que o lote é bom?",
                        verso: "Para fechamentos, aceitando latência maior.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde o relatório do Power BI é construído?",
                        verso: "No Power BI Desktop.",
                    },
                    {
                        frente: "Onde ele é publicado e compartilhado?",
                        verso: "No serviço do Power BI, na nuvem.",
                    },
                    {
                        frente: "Que gráfico mostra tendência no tempo?",
                        verso: "O de linha.",
                    },
                ],
            },
        },
    },
};
