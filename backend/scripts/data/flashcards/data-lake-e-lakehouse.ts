import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Data Lake e Lakehouse, do roadmap de Engenharia de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * arquitetura; as cartas guardam as definições fechadas, os nomes dos
 * table formats e as regras de bolso que a aula enuncia de passagem.
 */
export const dataLakeELakehouse: CartasDaTrilha = {
    trilha: "Data Lake e Lakehouse",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que o warehouse tradicional é, na definição da aula?",
                        verso: "Especializado: ótimo para SQL sobre dado limpo e modelado.",
                    },
                    {
                        frente: "Para o que o warehouse tradicional fica caro e rígido?",
                        verso: "Para o que é volumoso, variado ou ainda sem forma definida.",
                    },
                    {
                        frente: "Que exigência o warehouse faz antes de guardar o dado?",
                        verso: "Um esquema definido de antemão.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que lema resume o data lake?",
                        verso: "Guardar primeiro, dar sentido depois.",
                    },
                    {
                        frente: "O que o lake troca pela flexibilidade?",
                        verso: "A rigidez do esquema antecipado.",
                    },
                    {
                        frente: "Quando o lake decide o que o dado significa?",
                        verso: "Na hora da leitura.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o object storage faz com o dado?",
                        verso: "Só guarda e devolve quando alguém pede.",
                    },
                    {
                        frente: "O que o object storage não faz?",
                        verso: "Processar o dado.",
                    },
                    {
                        frente: "O que essa simplicidade traz?",
                        verso: "Custo baixo e durabilidade, como base de todo o resto.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Lake e warehouse competem pelo mesmo trabalho?",
                        verso: "Não: cada um cobre uma etapa diferente.",
                    },
                    {
                        frente: "O que o lake é, nessa divisão?",
                        verso: "Onde o dado bruto tem espaço para existir.",
                    },
                    {
                        frente: "O que o warehouse é, nessa divisão?",
                        verso: "Onde o dado já tratado vira resposta.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que falta num lake que virou pântano?",
                        verso: "Catálogo, dono e controle de qualidade.",
                    },
                    {
                        frente: "O que o pântano faz com o custo?",
                        verso: "Transfere do armazenamento para o tempo das pessoas.",
                    },
                    {
                        frente: "O lake sem governança sai mais barato?",
                        verso: "Não: o custo só muda de lugar.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta a zona raw responde?",
                        verso: "O que aconteceu.",
                    },
                    {
                        frente: "Que pergunta a zona de staging responde?",
                        verso: "O que é válido.",
                    },
                    {
                        frente: "Que pergunta a zona curated responde?",
                        verso: "O que importa para o negócio.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que tipo de decisão o particionamento é?",
                        verso: "Física: define como os arquivos ficam no storage.",
                    },
                    {
                        frente: "Que estrago a coluna errada de partição causa?",
                        verso: "Explode o número de arquivos do lake.",
                    },
                    {
                        frente: "Que coluna costuma organizar bem o layout?",
                        verso: "A de data, no caminho das pastas.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Parquet é no lake, segundo a aula?",
                        verso: "A língua franca.",
                    },
                    {
                        frente: "Como o dado sai depois de convertido?",
                        verso: "Em colunas comprimidas, prontas para consulta eficiente.",
                    },
                    {
                        frente: "Que ganho o formato colunar traz na leitura?",
                        verso: "Ler só as colunas que a consulta pede.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que vale mais: poucos arquivos grandes ou muitos pequenos?",
                        verso: "Poucos arquivos grandes.",
                    },
                    {
                        frente: "O que muda entre os dois casos?",
                        verso: "O custo de leitura, e não o volume de dados.",
                    },
                    {
                        frente: "O que a compactação faz com os arquivos pequenos?",
                        verso: "Junta em arquivos maiores, sem mudar o conteúdo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que um catálogo transforma?",
                        verso: "Arquivos em tabelas.",
                    },
                    {
                        frente: "O que é o lake sem catálogo?",
                        verso: "Uma pasta cheia de arquivos.",
                    },
                    {
                        frente: "O que é o lake com catálogo?",
                        verso: "Um banco de dados consultável.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que uma tabela no lake cru realmente é?",
                        verso: "Uma pasta com arquivos, e não uma unidade transacional.",
                    },
                    {
                        frente: "O que nada impede no lake cru?",
                        verso: "Dois escritores pisarem no trabalho um do outro.",
                    },
                    {
                        frente: "Que leitura o lake cru permite no meio de uma escrita?",
                        verso: "A inconsistente, com só parte dos arquivos novos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quanto custa mudar duas linhas numa partição enorme?",
                        verso: "O mesmo que reescrever a partição inteira.",
                    },
                    {
                        frente: "O que não existe num arquivo Parquet?",
                        verso: "Update parcial de uma linha.",
                    },
                    {
                        frente: "Que operação o lake cru exige para corrigir um dado?",
                        verso: "Reescrever por inteiro os arquivos afetados.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que schema-on-read não é?",
                        verso: "Ausência de schema.",
                    },
                    {
                        frente: "O que ele é, então?",
                        verso: "Ausência de fiscalização no momento da escrita.",
                    },
                    {
                        frente: "Onde o schema existe quando ninguém verifica?",
                        verso: "Na cabeça de quem projetou.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é um backup manual, na comparação da aula?",
                        verso: "Uma cópia que alguém lembrou de fazer a tempo.",
                    },
                    {
                        frente: "O que é versionamento de verdade?",
                        verso: "Uma garantia estrutural, que não depende de lembrança.",
                    },
                    {
                        frente: "O que falta no lake cru para desfazer uma escrita?",
                        verso: "O registro das versões anteriores da tabela.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que não muda quando se adota um table format?",
                        verso: "O lugar e o formato dos dados.",
                    },
                    {
                        frente: "O que passa a existir com ele?",
                        verso: "Controle transacional sobre quais arquivos formam a tabela.",
                    },
                    {
                        frente: "O que define a tabela em cada momento?",
                        verso: "O conjunto de arquivos registrado nos metadados.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O table format substitui o Parquet?",
                        verso: "Não: ele organiza os mesmos arquivos colunares.",
                    },
                    {
                        frente: "O que a camada de metadados transforma?",
                        verso: "Uma pasta em tabela.",
                    },
                    {
                        frente: "O que continua sendo o formato dos dados?",
                        verso: "O Parquet, arquivo por arquivo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que define o estado de uma tabela Delta?",
                        verso: "Os commits registrados no log, aplicados em ordem.",
                    },
                    {
                        frente: "O que não define esse estado?",
                        verso: "O que está na pasta naquele instante.",
                    },
                    {
                        frente: "Onde o Delta guarda esse registro?",
                        verso: "No log de transações, ao lado dos dados.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o particionamento é no Iceberg?",
                        verso: "Um detalhe de organização por baixo.",
                    },
                    {
                        frente: "O que ele deixa de ser?",
                        verso: "Um contrato que quem consulta precisa repetir.",
                    },
                    {
                        frente: "O que o Iceberg guarda a cada escrita?",
                        verso: "Um snapshot da tabela naquele momento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quando o copy-on-write paga o custo de mesclar?",
                        verso: "No momento da escrita.",
                    },
                    {
                        frente: "Para quando o merge-on-read adia esse custo?",
                        verso: "Para o momento da leitura.",
                    },
                    {
                        frente: "Algum dos dois é superior?",
                        verso: "Não: é uma troca entre escrita e leitura.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que importa saber antes de escolher o table format?",
                        verso: "Que os três resolvem o mesmo problema central.",
                    },
                    {
                        frente: "Qual é a escolha certa entre eles?",
                        verso: "A que se encaixa no ambiente e nas ferramentas do time.",
                    },
                    {
                        frente: "Qual não é o critério principal?",
                        verso: "Qual deles é tecnicamente superior.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que o lakehouse não faz com o lake?",
                        verso: "Não o troca por outra coisa.",
                    },
                    {
                        frente: "Onde as garantias do lakehouse são aplicadas?",
                        verso: "Direto sobre os arquivos que já estão no object storage.",
                    },
                    {
                        frente: "Que garantias antes só o warehouse oferecia?",
                        verso: "As de transação, schema fiscalizado e histórico.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três camadas a arquitetura medalhão tem?",
                        verso: "Bronze, prata e ouro.",
                    },
                    {
                        frente: "O que a camada bronze guarda?",
                        verso: "O dado como chegou da origem.",
                    },
                    {
                        frente: "O que a camada ouro entrega?",
                        verso: "O dado pronto para o consumo do negócio.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o ACID garante em cada transação?",
                        verso: "Tudo ou nada.",
                    },
                    {
                        frente: "Sobre o que o MERGE se apoia?",
                        verso: "Sobre essa garantia, para fazer upsert com segurança.",
                    },
                    {
                        frente: "O que o time travel guarda?",
                        verso: "Cada versão da tabela, para permitir voltar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o schema enforcement faz na escrita?",
                        verso: "Barra o dado que não obedece ao schema declarado.",
                    },
                    {
                        frente: "O que a schema evolution permite?",
                        verso: "Mudar o schema de propósito, sem quebrar a tabela.",
                    },
                    {
                        frente: "Que diferença separa os dois?",
                        verso: "Um fiscaliza; o outro autoriza a mudança planejada.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a pergunta certa entre lake, warehouse e lakehouse?",
                        verso: "Que conjunto de garantias o caso de uso exige.",
                    },
                    {
                        frente: "O que schema rígido e SQL puro pedem?",
                        verso: "Um warehouse.",
                    },
                    {
                        frente: "Qual não é a pergunta certa?",
                        verso: "Qual dos três vence de forma absoluta.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que o MERGE substitui numa transação só?",
                        verso: "Um delete e um insert separados, ou o reprocesso inteiro.",
                    },
                    {
                        frente: "Que resultado o MERGE atômico garante?",
                        verso: "Ou a tabela reflete o novo estado, ou nada muda.",
                    },
                    {
                        frente: "Que fonte o MERGE costuma consumir no lakehouse?",
                        verso: "O fluxo de mudanças que vem do CDC.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que problemas o time travel resolve?",
                        verso: "Auditoria, depuração e reversão de curto prazo.",
                    },
                    {
                        frente: "O que o time travel não é?",
                        verso: "Um backup de longo prazo.",
                    },
                    {
                        frente: "O que limita o alcance do time travel?",
                        verso: "O período de retenção dos arquivos e do próprio log.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o comando de otimização compacta?",
                        verso: "Os arquivos, juntando os pequenos em maiores.",
                    },
                    {
                        frente: "O que a ordenação por coluna ataca?",
                        verso: "Quantos arquivos um filtro precisa abrir.",
                    },
                    {
                        frente: "Que problema cada um dos dois resolve?",
                        verso: "Um ataca o excesso de arquivos, o outro o conteúdo deles.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o vacuum libera?",
                        verso: "Espaço, apagando o que ficou para trás.",
                    },
                    {
                        frente: "Que arquivos ficaram para trás?",
                        verso: "Os antigos, substituídos pela otimização e pelo merge.",
                    },
                    {
                        frente: "Qual é o preço de apagar cedo demais?",
                        verso: "Perder o alcance do time travel justo na hora que precisa.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o particionamento ataca?",
                        verso: "Quais pastas abrir.",
                    },
                    {
                        frente: "O que a ordenação dentro dos arquivos ataca?",
                        verso: "Quais arquivos abrir dentro dessas pastas.",
                    },
                    {
                        frente: "Escolher mal a coluna de partição se corrige com mais partições?",
                        verso: "Não: o problema é a coluna, e não a quantidade.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que é um lakehouse sem governança?",
                        verso: "Um data lake com um nome mais bonito.",
                    },
                    {
                        frente: "O que continua acontecendo com os arquivos?",
                        verso: "Seguem abertos para qualquer engine ler.",
                    },
                    {
                        frente: "Que três peças a governança reúne?",
                        verso: "Catálogo, controle de acesso e linhagem.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "No que trocar de engine se transforma no lakehouse?",
                        verso: "Numa configuração de acesso, e não numa migração.",
                    },
                    {
                        frente: "O que acontece com os dados nessa troca?",
                        verso: "Continuam exatamente onde estavam.",
                    },
                    {
                        frente: "O que permite várias engines sobre a mesma tabela?",
                        verso: "O formato aberto, com metadados que qualquer uma lê.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Streaming e lote exigem dois lakehouses diferentes?",
                        verso: "Não: os dois alimentam as mesmas tabelas.",
                    },
                    {
                        frente: "O que muda entre streaming e lote?",
                        verso: "O ritmo que a fonte de dados exige.",
                    },
                    {
                        frente: "O que o streaming precisa acertar na escrita?",
                        verso: "Não deixar um rastro de arquivos pequenos.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que os times relaxam com o layout?",
                        verso: "Porque o armazenamento é barato.",
                    },
                    {
                        frente: "Onde a conta aparece no fim do mês?",
                        verso: "Na leitura, e não no armazenamento.",
                    },
                    {
                        frente: "Quem paga a conta de um layout ruim?",
                        verso: "Quem consulta, toda vez que consulta.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O lakehouse é um produto que se compra pronto?",
                        verso: "Não: é uma disciplina que se pratica.",
                    },
                    {
                        frente: "Que quatro práticas a aula deixa no fecho?",
                        verso: "Camadas claras, table format, manutenção e governança.",
                    },
                    {
                        frente: "Onde o table format deve ser usado?",
                        verso: "Onde é preciso, e não em todo lugar.",
                    },
                ],
            },
        },
    },
};
