import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Qualidade e Governança de Dados, do roadmap de Engenharia de
 * Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * processo; as cartas guardam as definições fechadas, as divisões de
 * papel e as regras que a aula enuncia de passagem.
 */
export const qualidadeEGovernancaDeDados: CartasDaTrilha = {
    trilha: "Qualidade e Governança de Dados",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que duas propriedades diferentes um pipeline tem?",
                        verso: "Disponibilidade e corretude.",
                    },
                    {
                        frente: "O que só a corretude garante?",
                        verso: "Que o dado é confiável.",
                    },
                    {
                        frente: "Um pipeline pode estar no ar e errado ao mesmo tempo?",
                        verso: "Pode, e é o caso mais perigoso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a completude mede?",
                        verso: "Se o campo esperado está preenchido.",
                    },
                    {
                        frente: "O que a unicidade mede?",
                        verso: "Se o registro aparece uma vez só.",
                    },
                    {
                        frente: "O que a validade garante?",
                        verso: "A forma, e não a verdade do dado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a validade pergunta?",
                        verso: "Se o dado segue as regras.",
                    },
                    {
                        frente: "O que a acurácia pergunta?",
                        verso: "Se o dado ainda é verdade.",
                    },
                    {
                        frente: "O que a atualidade mede?",
                        verso: "Há quanto tempo o dado foi atualizado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é uma regra que ninguém consegue testar?",
                        verso: "Uma intenção, e não uma regra de qualidade.",
                    },
                    {
                        frente: "O que separa a intenção do contrato?",
                        verso: "O limite numérico declarado.",
                    },
                    {
                        frente: "Que qualidade uma boa regra precisa ter?",
                        verso: "Ser mensurável de forma automática.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é escrever regra sem perfilar o dado?",
                        verso: "Apostar no limite certo.",
                    },
                    {
                        frente: "O que o profiling entrega no lugar da aposta?",
                        verso: "Um número visto de verdade.",
                    },
                    {
                        frente: "O que o profiling mostra sobre uma coluna?",
                        verso: "Distribuição, nulos, valores distintos e extremos.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Contra o que protege o teste que só roda na integração?",
                        verso: "Contra o código quebrar o pipeline.",
                    },
                    {
                        frente: "Contra o que ele não protege?",
                        verso: "Contra o dado quebrar sozinho, em silêncio.",
                    },
                    {
                        frente: "Que diferença separa teste de software de teste de dado?",
                        verso: "Um valida o código; o outro valida o que chegou.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que é testar apenas no mart?",
                        verso: "Conferir a carga depois que o caminhão já descarregou.",
                    },
                    {
                        frente: "O que testar cedo permite decidir?",
                        verso: "Se o problema segue adiante ou para ali mesmo.",
                    },
                    {
                        frente: "Onde o primeiro teste deve ficar?",
                        verso: "Na entrada, logo depois da ingestão.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que uma suíte de expectations é, além de uma lista?",
                        verso: "A definição explícita do que dado bom significa ali.",
                    },
                    {
                        frente: "Que qualidade essa definição tem?",
                        verso: "Fica visível para todos, não só para quem escreveu.",
                    },
                    {
                        frente: "O que uma expectation declara?",
                        verso: "Uma afirmação que a tabela precisa satisfazer.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que caso o teste genérico resolve?",
                        verso: "O caso comum.",
                    },
                    {
                        frente: "Que caso o teste singular resolve?",
                        verso: "O caso único daquela tabela.",
                    },
                    {
                        frente: "Que caso o teste customizado resolve?",
                        verso: "O que se repete, mas não vem pronto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "No que bloquear demais transforma o pipeline?",
                        verso: "Num alarme que ninguém mais escuta.",
                    },
                    {
                        frente: "No que bloquear de menos transforma o teste?",
                        verso: "Numa formalidade que ninguém corrige.",
                    },
                    {
                        frente: "O que decide entre avisar e bloquear?",
                        verso: "A criticidade daquele dado.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta o teste de dados responde?",
                        verso: "Se o dado está do jeito que se esperava.",
                    },
                    {
                        frente: "Que pergunta a observabilidade de dados responde?",
                        verso: "Se o dado está diferente do normal, mesmo passando nos testes.",
                    },
                    {
                        frente: "O que a observabilidade cobre que o teste não cobre?",
                        verso: "O problema que ninguém previu.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que cinco pilares a observabilidade de dados tem?",
                        verso: "Frescor, volume, schema, distribuição e linhagem.",
                    },
                    {
                        frente: "O que os cinco pilares não substituem?",
                        verso: "Nenhum teste.",
                    },
                    {
                        frente: "Que superfície eles cobrem?",
                        verso: "A tabela inteira, de forma contínua.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que duzentos alertas por semana produzem?",
                        verso: "O mesmo efeito de não ter observabilidade nenhuma.",
                    },
                    {
                        frente: "Por que esse efeito acontece?",
                        verso: "Ninguém lê.",
                    },
                    {
                        frente: "O que a detecção de anomalia compara?",
                        verso: "O comportamento de agora com o histórico da tabela.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que custa mais caro: o dado errado ou o pipeline quebrado?",
                        verso: "O dado errado que ninguém percebe.",
                    },
                    {
                        frente: "Por que ele custa mais?",
                        verso: "Vira decisão errada antes de virar incidente.",
                    },
                    {
                        frente: "O que o data downtime mede?",
                        verso: "O tempo em que o dado ficou errado, ausente ou parado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a plataforma de observabilidade não substitui?",
                        verso: "Nenhum teste escrito pelo time.",
                    },
                    {
                        frente: "Que superfície ela cobre?",
                        verso: "A que nenhum time teria tempo de testar tabela por tabela.",
                    },
                    {
                        frente: "Que trabalho ela automatiza?",
                        verso: "O monitoramento contínuo de cada tabela.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que o lineage não é?",
                        verso: "Um diagrama bonito para reunião.",
                    },
                    {
                        frente: "Que duas perguntas urgentes ele responde?",
                        verso: "O que quebra se eu mudar isso, e de onde veio esse número.",
                    },
                    {
                        frente: "Quando o lineage mais importa?",
                        verso: "Na hora da mudança e na hora do incidente.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o lineage de tabela diz?",
                        verso: "Que duas tabelas se relacionam.",
                    },
                    {
                        frente: "O que o lineage de coluna diz?",
                        verso: "Qual pedaço de uma virou qual pedaço da outra.",
                    },
                    {
                        frente: "Que pergunta só o lineage de coluna responde?",
                        verso: "De onde veio exatamente aquele campo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que comparação a aula usa para o catálogo de dados?",
                        verso: "A de buscador dos dados internos.",
                    },
                    {
                        frente: "O que o catálogo não é?",
                        verso: "Apenas uma lista de tabelas.",
                    },
                    {
                        frente: "Que três coisas ele ajuda a fazer?",
                        verso: "Descobrir que o dado existe, entendê-lo e saber quem cuida.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é um glossário sem link para o dado físico?",
                        verso: "Documentação.",
                    },
                    {
                        frente: "No que ele vira quando ligado à implementação?",
                        verso: "Garantia de que dois times falam da mesma coisa.",
                    },
                    {
                        frente: "Que exemplo a aula usa para essa ambiguidade?",
                        verso: "Cliente ativo, definido de dois jeitos diferentes.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual não é o critério para escolher a ferramenta?",
                        verso: "Ser a mais nova ou a mais completa numa lista.",
                    },
                    {
                        frente: "Qual é o critério real?",
                        verso: "O encaixe com a stack e com o time que vai usar.",
                    },
                    {
                        frente: "Que fator do ambiente pesa nessa escolha?",
                        verso: "O quanto a stack já é centrada num fornecedor só.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que a tecnologia faz com o dado?",
                        verso: "Documenta o dado que existe.",
                    },
                    {
                        frente: "O que a governança decide?",
                        verso: "Quem tem autoridade para dizer o que o dado significa.",
                    },
                    {
                        frente: "Que segunda decisão a governança toma?",
                        verso: "Quem pode usar aquele dado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o data owner faz?",
                        verso: "Responde pelo dado.",
                    },
                    {
                        frente: "O que o data steward faz?",
                        verso: "Cuida do dado no dia a dia.",
                    },
                    {
                        frente: "Como a aula resume a diferença entre os dois?",
                        verso: "Um decide, o outro garante que a decisão seja seguida.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é um conjunto de dados sem dono e sem documentação?",
                        verso: "Só uma tabela que alguém lembrou de exportar.",
                    },
                    {
                        frente: "O que faz de um dado um produto?",
                        verso: "Ter dono, qualidade garantida e documentação.",
                    },
                    {
                        frente: "Que ideia central o data mesh defende?",
                        verso: "Tratar o dado como produto, com dono no domínio.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que classificar um dado decide?",
                        verso: "Quem pode vê-lo e por quanto tempo ele deve existir.",
                    },
                    {
                        frente: "Quando essa decisão precisa ser tomada?",
                        verso: "Antes de qualquer incidente.",
                    },
                    {
                        frente: "O que a classificação orienta depois?",
                        verso: "Os controles de acesso e a retenção.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quando uma política de dados existe de verdade?",
                        verso: "Quando alguém a segue sem precisar ser lembrado.",
                    },
                    {
                        frente: "O que ela é até lá?",
                        verso: "Só um documento.",
                    },
                    {
                        frente: "O que a cultura acrescenta à política?",
                        verso: "O hábito que dispensa a cobrança.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a pergunta que define o dado pessoal?",
                        verso: "Se ele permite chegar a uma pessoa específica.",
                    },
                    {
                        frente: "Qual não é a pergunta?",
                        verso: "O quão privado o dado parece.",
                    },
                    {
                        frente: "O que a combinação de dados pode provocar?",
                        verso: "Identificar alguém mesmo com campos inofensivos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que princípio da lei mais economiza dor de cabeça?",
                        verso: "A minimização.",
                    },
                    {
                        frente: "Por que a minimização economiza tanto?",
                        verso: "O dado não coletado não precisa ser protegido nem apagado.",
                    },
                    {
                        frente: "Que direitos o titular tem sobre os dados dele?",
                        verso: "Acesso, correção, portabilidade e exclusão, entre outros.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que indica que o dado é apenas pseudonimizado?",
                        verso: "Existir em algum lugar uma chave que devolve a identidade.",
                    },
                    {
                        frente: "O que a lei diz sobre o dado pseudonimizado?",
                        verso: "Continua valendo: ele ainda é dado pessoal.",
                    },
                    {
                        frente: "O que a anonimização precisa garantir?",
                        verso: "Que não existe caminho de volta até a pessoa.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o mascaramento protege?",
                        verso: "Quem olha a tela.",
                    },
                    {
                        frente: "O que criptografia e tokenização protegem?",
                        verso: "O dado guardado.",
                    },
                    {
                        frente: "Que erro confundir os dois provoca?",
                        verso: "Deixar dado pessoal exposto achando que está seguro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é o dado pessoal mais seguro?",
                        verso: "O que nunca foi coletado.",
                    },
                    {
                        frente: "Qual é o segundo mais seguro?",
                        verso: "O que foi protegido logo na entrada.",
                    },
                    {
                        frente: "O que protege tarde demais?",
                        verso: "Proteger depois que o dado já se espalhou.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que o controle de acesso não decide?",
                        verso: "Se alguém é confiável.",
                    },
                    {
                        frente: "O que o controle de acesso decide?",
                        verso: "Até onde vai o estrago se a confiança for quebrada.",
                    },
                    {
                        frente: "Que princípio guia a concessão de acesso?",
                        verso: "O menor privilégio necessário.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Onde termina a investigação sem trilha de auditoria?",
                        verso: "Na frase de que não temos como saber.",
                    },
                    {
                        frente: "O que a trilha de auditoria registra?",
                        verso: "Quem acessou o quê, e quando.",
                    },
                    {
                        frente: "Quando a trilha precisa já existir?",
                        verso: "Antes do incidente, nunca depois.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é barato num warehouse moderno?",
                        verso: "Guardar o dado.",
                    },
                    {
                        frente: "O que sai caro?",
                        verso: "Consultar o dado do jeito errado.",
                    },
                    {
                        frente: "Que dois custos o FinOps de dados separa?",
                        verso: "O de armazenamento e o de processamento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que hábito de consulta mais economiza?",
                        verso: "Filtrar e pedir só as colunas necessárias.",
                    },
                    {
                        frente: "Que estrutura reduz o dado varrido?",
                        verso: "O particionamento alinhado ao filtro mais comum.",
                    },
                    {
                        frente: "Que gasto passa despercebido no fim do mês?",
                        verso: "O da consulta repetida por painéis automáticos.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que uma plataforma de dados confiável não é?",
                        verso: "A que nunca falha.",
                    },
                    {
                        frente: "O que ela é, então?",
                        verso: "A que avisa antes de alguém confiar no número errado.",
                    },
                    {
                        frente: "O que sustenta essa confiança no dia a dia?",
                        verso: "Teste, observabilidade, linhagem e governança juntos.",
                    },
                ],
            },
        },
    },
};
