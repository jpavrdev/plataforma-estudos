import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de ISTQB CTFL, trilha de certificação sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário; as
 * cartas guardam o vocabulário exato do syllabus, as listas fechadas e as
 * distinções que a prova transforma em distrator.
 */
export const istqbCtfl: CartasDaTrilha = {
    trilha: "ISTQB CTFL",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que o teste dinâmico faz?",
                        verso: "Executa o software.",
                    },
                    {
                        frente: "O que o teste estático faz?",
                        verso: "Examina artefatos sem executar.",
                    },
                    {
                        frente: "Os dois contam como teste?",
                        verso: "Contam, e a prova cobra essa distinção com frequência.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o teste faz e o que a depuração faz?",
                        verso: "O teste encontra; a depuração corrige.",
                    },
                    {
                        frente: "O que a depuração não envolve no teste estático?",
                        verso: "Reproduzir a falha nem diagnosticar a causa.",
                    },
                    {
                        frente: "Por que ela não envolve isso ali?",
                        verso: "O defeito foi encontrado direto no artefato.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "De que o teste faz parte?",
                        verso: "Do controle de qualidade.",
                    },
                    {
                        frente: "De que ele não faz parte?",
                        verso: "Da garantia da qualidade.",
                    },
                    {
                        frente: "Como esse distrator aparece na prova?",
                        verso: "Invertendo os dois.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é um erro?",
                        verso: "Uma ação humana.",
                    },
                    {
                        frente: "O que é um defeito?",
                        verso: "A imperfeição no artefato.",
                    },
                    {
                        frente: "O que é uma falha?",
                        verso: "O comportamento errado na execução.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é uma condição de teste?",
                        verso: "O que verificar, produto da análise.",
                    },
                    {
                        frente: "O que é um caso de teste?",
                        verso: "Como verificar, produto da modelagem.",
                    },
                    {
                        frente: "Que outra dupla a prova cobra junto dessa?",
                        verso: "Verificação contra validação.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que o primeiro princípio diz?",
                        verso: "O teste não prova ausência de defeitos.",
                    },
                    {
                        frente: "O que o sétimo princípio diz?",
                        verso: "Ausência de defeitos não garante um produto útil.",
                    },
                    {
                        frente: "Quantos princípios o syllabus lista?",
                        verso: "Sete.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a análise produz?",
                        verso: "Condições de teste.",
                    },
                    {
                        frente: "O que a modelagem produz?",
                        verso: "Casos de teste.",
                    },
                    {
                        frente: "Qual é a confusão mais frequente da prova aqui?",
                        verso: "Trocar análise por modelagem.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que duas perguntas a rastreabilidade responde?",
                        verso: "O que essa mudança afeta e o que ainda não foi coberto.",
                    },
                    {
                        frente: "O que é o testware?",
                        verso: "Todo artefato produzido pelo trabalho de teste.",
                    },
                    {
                        frente: "O que a rastreabilidade liga?",
                        verso: "A base de teste aos casos e aos resultados.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que reveses a independência traz?",
                        verso: "Isolamento, feedback lento e resistência à informação.",
                    },
                    {
                        frente: "Que outro revés o syllabus cita?",
                        verso: "A perda de conhecimento do produto pela equipe.",
                    },
                    {
                        frente: "Por que a prova pergunta os reveses?",
                        verso: "Porque a maioria só decora os benefícios.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que frase resume erro, defeito e falha?",
                        verso: "Erro é humano, defeito é do artefato, falha é da execução.",
                    },
                    {
                        frente: "Que frase separa teste de depuração?",
                        verso: "Teste encontra, depuração corrige.",
                    },
                    {
                        frente: "Que frase separa garantia de controle?",
                        verso: "Garantia é processo, controle é produto.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que ganha importância em modelos iterativos?",
                        verso: "O teste de regressão.",
                    },
                    {
                        frente: "Por que ele ganha importância ali?",
                        verso: "Cada incremento pode quebrar o que já funcionava.",
                    },
                    {
                        frente: "O que o modelo de ciclo de vida influencia no teste?",
                        verso: "Quando e como cada nível acontece.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que evita a redundância entre níveis?",
                        verso: "Objetivos específicos para cada nível.",
                    },
                    {
                        frente: "Que exemplo a aula usa dessa redundância?",
                        verso: "Repetir no sistema uma regra já exaustiva no componente.",
                    },
                    {
                        frente: "Quando o teste deve começar, nas boas práticas?",
                        verso: "O mais cedo possível no ciclo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que as três abordagens dirigidas por teste têm em comum?",
                        verso: "Os testes são escritos antes do código.",
                    },
                    {
                        frente: "Que outro papel esses testes cumprem?",
                        verso: "Servem também como forma de especificação.",
                    },
                    {
                        frente: "Onde está a diferença entre elas?",
                        verso: "No nível do teste e em quem o escreve.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o DevOps não elimina?",
                        verso: "O teste manual.",
                    },
                    {
                        frente: "O que ele reduz?",
                        verso: "A necessidade do teste manual repetitivo.",
                    },
                    {
                        frente: "O que o shift left propõe?",
                        verso: "Antecipar as atividades de teste no ciclo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que artefatos as retrospectivas melhoram?",
                        verso: "O testware e a base de teste.",
                    },
                    {
                        frente: "Que outro benefício elas trazem?",
                        verso: "A colaboração entre as pessoas do time.",
                    },
                    {
                        frente: "Quando uma retrospectiva acontece?",
                        verso: "Ao fim de um marco, de uma iteração ou do projeto.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Quantos níveis de teste o syllabus lista?",
                        verso: "Cinco.",
                    },
                    {
                        frente: "Qual é o objeto do teste de componente?",
                        verso: "O componente isolado.",
                    },
                    {
                        frente: "Qual é o objeto do teste de integração de componentes?",
                        verso: "As interfaces entre eles.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Em que níveis o teste não funcional pode ser feito?",
                        verso: "Em todos, inclusive no de componente.",
                    },
                    {
                        frente: "Quando ele deve começar?",
                        verso: "O mais cedo possível.",
                    },
                    {
                        frente: "O que o teste funcional verifica?",
                        verso: "O que o sistema faz.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que a caixa-preta é baseada?",
                        verso: "Na especificação.",
                    },
                    {
                        frente: "Em que a caixa-branca é baseada?",
                        verso: "Na estrutura.",
                    },
                    {
                        frente: "Que erro comum a prova explora nessa dupla?",
                        verso: "Trocar a base do teste por quem o executa.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o teste de confirmação verifica?",
                        verso: "Se o defeito corrigido realmente sumiu.",
                    },
                    {
                        frente: "O que o teste de regressão verifica?",
                        verso: "Se a mudança quebrou o que já funcionava.",
                    },
                    {
                        frente: "Por que a regressão é forte candidata à automação?",
                        verso: "Roda muitas vezes e evolui devagar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que evento pouco lembrado também exige teste?",
                        verso: "A aposentadoria do sistema.",
                    },
                    {
                        frente: "O que testar nessa aposentadoria?",
                        verso: "O arquivamento e a restauração dos dados.",
                    },
                    {
                        frente: "O que dispara o teste de manutenção?",
                        verso: "Correção, melhoria, migração ou mudança de ambiente.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que artefatos podem ser examinados no teste estático?",
                        verso: "Só os legíveis e compreensíveis.",
                    },
                    {
                        frente: "O que a análise estática por ferramenta procura?",
                        verso: "Desvios de padrão e problemas no código, sem executar.",
                    },
                    {
                        frente: "O que o teste estático alcança que o dinâmico não alcança?",
                        verso: "Defeitos antes de qualquer execução.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que problemas só o teste estático revela?",
                        verso: "Código inalcançável e código duplicado.",
                    },
                    {
                        frente: "Por que o dinâmico não revela código morto?",
                        verso: "Ele simplesmente nunca executa aquele trecho.",
                    },
                    {
                        frente: "O que o teste dinâmico revela melhor?",
                        verso: "As falhas de comportamento durante a execução.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que benefícios de negócio o feedback antecipado traz?",
                        verso: "Focar no mais valioso e entregar valor antes.",
                    },
                    {
                        frente: "Que benefício de qualidade ele traz?",
                        verso: "Corrigir mais cedo, com custo menor.",
                    },
                    {
                        frente: "Por que a frequência importa nesse feedback?",
                        verso: "Reduz o tempo entre criar e descobrir o problema.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Toda anomalia encontrada é um defeito?",
                        verso: "Não necessariamente.",
                    },
                    {
                        frente: "Que atividade existe por causa disso?",
                        verso: "A de comunicar e analisar antes de classificar.",
                    },
                    {
                        frente: "Que papéis a revisão tem?",
                        verso: "Autor, moderador, revisor, escriba e gerente.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a revisão técnica exige e o que ela dispensa?",
                        verso: "Exige preparação individual; a reunião é opcional.",
                    },
                    {
                        frente: "O que o walkthrough inverte nisso?",
                        verso: "A reunião é o centro; a preparação é opcional.",
                    },
                    {
                        frente: "Que tipo de revisão é o mais formal?",
                        verso: "A inspeção.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Quantas técnicas de caixa-preta existem?",
                        verso: "Quatro.",
                    },
                    {
                        frente: "Quantas técnicas de caixa-branca existem?",
                        verso: "Duas.",
                    },
                    {
                        frente: "Quantas técnicas baseadas em experiência existem?",
                        verso: "Três.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como as partições inválidas devem ser testadas?",
                        verso: "Individualmente, sem combinar umas com as outras.",
                    },
                    {
                        frente: "Por que essa regra existe?",
                        verso: "Para evitar que um defeito mascare o outro.",
                    },
                    {
                        frente: "O que uma partição de equivalência agrupa?",
                        verso: "Valores que o sistema deve tratar do mesmo jeito.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que vizinho a variante de dois valores escolhe?",
                        verso: "O da partição adjacente, ou seja, o de fora.",
                    },
                    {
                        frente: "O que a variante de três valores acrescenta?",
                        verso: "Também o vizinho de dentro do limite.",
                    },
                    {
                        frente: "Onde os defeitos se concentram, segundo a técnica?",
                        verso: "Nas bordas das partições.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quantas colunas a tabela completa tem com N condições binárias?",
                        verso: "Dois elevado a N.",
                    },
                    {
                        frente: "Quantas colunas ela tem com três condições?",
                        verso: "Oito.",
                    },
                    {
                        frente: "O que a transição de estados modela?",
                        verso: "Os estados e os eventos que levam de um a outro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que contar para a cobertura de comando?",
                        verso: "Os comandos executáveis.",
                    },
                    {
                        frente: "O que contar para a cobertura de decisão?",
                        verso: "Os resultados possíveis de cada decisão.",
                    },
                    {
                        frente: "Qual das duas coberturas é mais forte?",
                        verso: "A de decisão: ela inclui a de comando.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que acontece com os checklists ao longo do tempo?",
                        verso: "Crescem, e podem virar listas grandes demais.",
                    },
                    {
                        frente: "O que essa lista grande provoca?",
                        verso: "Itens redundantes e revisões mais lentas.",
                    },
                    {
                        frente: "Que cuidado o syllabus recomenda?",
                        verso: "Revisar e podar o checklist periodicamente.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Acabar o tempo alocado é critério de saída válido?",
                        verso: "É, desde que as partes interessadas aceitem.",
                    },
                    {
                        frente: "Que outro critério do mesmo tipo vale?",
                        verso: "Acabar o orçamento.",
                    },
                    {
                        frente: "O que a priorização de teste decide?",
                        verso: "O que executar primeiro, quando o tempo é limitado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que caracteriza um risco de produto?",
                        verso: "Algo que o software faz de errado.",
                    },
                    {
                        frente: "O que caracteriza um risco de projeto?",
                        verso: "Algo que o projeto faz de errado.",
                    },
                    {
                        frente: "O que o risco combina, na definição?",
                        verso: "Probabilidade e impacto.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o relatório de progresso apoia?",
                        verso: "O controle contínuo.",
                    },
                    {
                        frente: "O que o relatório de conclusão faz?",
                        verso: "Resume um ciclo já encerrado.",
                    },
                    {
                        frente: "Para que serve a gestão de configuração no teste?",
                        verso: "Manter o testware versionado e rastreável.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a automação não substitui?",
                        verso: "O raciocínio humano.",
                    },
                    {
                        frente: "O que a automação não conserta?",
                        verso: "Um processo ruim.",
                    },
                    {
                        frente: "Como as afirmações contrárias aparecem na prova?",
                        verso: "Como distratores.",
                    },
                ],
            },
        },
    },
};
