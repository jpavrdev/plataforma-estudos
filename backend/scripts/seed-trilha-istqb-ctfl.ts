// Seed da trilha ISTQB CTFL (iniciante). Idempotente e não
// destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-istqb-ctfl.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "ISTQB CTFL";
const DESCRICAO =
    "Preparação para a prova ISTQB Certified Tester Foundation Level, no syllabus v4.0: fundamentos e vocabulário exato do exame, os sete princípios e o processo de teste, teste no ciclo de vida com TDD, ATDD, BDD e DevOps, níveis, tipos e manutenção, teste estático e revisões, as técnicas de caixa-preta e de caixa-branca com exercícios de aplicação, gestão do teste com risco, estimativa e métricas, e ferramentas. Trilha voltada ao certificado oficial, com o peso de cada capítulo na prova.";
const CARGA_HORARIA = 20;

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
        titulo: "Módulo 1 - Fundamentos de teste",
        aulas: [
            {
                titulo: "O que é teste e quais são seus objetivos",
                blocks: [
                    {
                        type: "text",
                        value: "# O que é teste e quais são seus objetivos\n\nBem-vindo à trilha de preparação para o **ISTQB Certified Tester Foundation Level**, na versão 4.0 do syllabus. O objetivo aqui é direto: te levar aprovado na prova oficial.\n\nA prova tem **40 questões de múltipla escolha**, **60 minutos** (75 se o exame não for no seu idioma nativo), e o corte é **65%**, ou seja, 26 acertos. Cada questão vale um ponto, tem quatro alternativas e apenas uma correta.\n\nUma característica dela merece atenção desde já: a prova cobra **definições precisas**. Muita gente que testa há anos erra questões porque usa as palavras de um jeito no dia a dia e o syllabus define de outro. Por isso esta trilha insiste tanto em terminologia. Não é preciosismo, é o que está sendo avaliado.",
                    },
                    {
                        type: "text",
                        value: "## A definição de teste\n\nMuita gente acha que teste é apenas executar o software e ver se funciona. O syllabus é mais amplo:\n\nO teste é um **conjunto de atividades** que ajuda a descobrir defeitos e a avaliar a qualidade de artefatos de software. Ele inclui atividades que **não executam** o software, como revisar requisitos e código, e atividades que executam, como rodar casos de teste.\n\nRepare em duas consequências dessa definição. Primeira: revisar um documento é teste. Segunda: teste não é uma fase, é um conjunto de atividades que acompanha o desenvolvimento.",
                    },
                    {
                        type: "quote",
                        value: "**Teste dinâmico** executa o software. **Teste estático** examina artefatos sem executar. Os dois são teste. A prova cobra essa distinção com frequência.",
                    },
                    {
                        type: "text",
                        value: '## Os objetivos típicos do teste\n\nO syllabus lista objetivos típicos, e vale conhecê-los porque questões pedem "qual é um objetivo do teste":\n\n- **Prevenir defeitos**, avaliando artefatos como requisitos, histórias e desenho.\n- **Verificar** se todos os requisitos especificados foram atendidos.\n- **Validar** se o objeto de teste está completo e funciona como as pessoas esperam.\n- **Construir confiança** no nível de qualidade do objeto de teste.\n- **Encontrar defeitos e falhas**, reduzindo o nível de risco de qualidade inadequada.\n- **Fornecer informação suficiente** para as partes interessadas decidirem.\n- **Cumprir requisitos contratuais, legais ou regulatórios**, ou aderir a normas.\n\nRepare no que **não** está na lista: corrigir defeitos (isso é depuração) e decidir se a versão sobe (isso é do negócio, com base na informação que o teste dá).',
                    },
                    {
                        type: "text",
                        value: "## Os objetivos mudam com o contexto\n\nUm ponto que a prova gosta de explorar: os objetivos variam conforme o contexto.\n\nNo **teste de componente**, um objetivo comum é encontrar o maior número possível de falhas para que os defeitos sejam identificados e corrigidos cedo.\n\nNo **teste de aceitação**, o objetivo costuma ser confirmar que o sistema funciona como esperado e construir confiança de que ele atende aos requisitos.\n\nEm um sistema com exigência regulatória, cumprir a norma pode ser o objetivo dominante.\n\nEssa é a aplicação prática do princípio de que o teste depende do contexto, que a gente vê no módulo 2.",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** teste é um conjunto de atividades, estáticas e dinâmicas, que descobre defeitos e avalia qualidade. Os objetivos típicos são sete, e mudam conforme o contexto e o nível de teste.",
                    },
                ],
                questions: [
                    {
                        statement: "Segundo o syllabus, o que o teste inclui?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Atividades que executam o software e atividades que não executam.",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas atividades que executam o software com dados de entrada preparados antes.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas a revisão de artefatos feita antes do início da construção do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "A execução dos casos planejados e a correção dos defeitos que forem encontrados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual das opções NÃO é um objetivo típico do teste?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Corrigir os defeitos encontrados durante a execução.",
                                isCorrect: true,
                            },
                            {
                                text: "Fornecer informação suficiente para que as partes interessadas possam decidir.",
                                isCorrect: false,
                            },
                            {
                                text: "Cumprir requisitos contratuais, legais ou regulatórios aplicáveis ao produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Construir confiança no nível de qualidade do objeto de teste que foi construído.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a duração e o corte da prova CTFL v4.0?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "60 minutos e 65% de acerto.",
                                isCorrect: true,
                            },
                            {
                                text: "90 minutos e 70% de acerto, com 65 questões de múltipla escolha no total.",
                                isCorrect: false,
                            },
                            {
                                text: "120 minutos e 75% de acerto, com tempo adicional para quem precisar solicitar.",
                                isCorrect: false,
                            },
                            {
                                text: "60 minutos e 50% de acerto, considerando as questões que não são pontuadas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "No teste de componente, qual objetivo costuma predominar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Encontrar o maior número possível de falhas para corrigir os defeitos cedo.",
                                isCorrect: true,
                            },
                            {
                                text: "Construir confiança de que o sistema atende às expectativas de quem vai utilizá-lo.",
                                isCorrect: false,
                            },
                            {
                                text: "Confirmar que os requisitos contratuais acordados com o cliente foram cumpridos.",
                                isCorrect: false,
                            },
                            {
                                text: "Validar se o produto resolve o problema de negócio que motivou a construção dele.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe revisa a especificação de requisitos e encontra três contradições. Isso é teste?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Sim, é teste estático, que faz parte do conjunto de atividades de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Não, porque teste exige executar o software com dados de entrada definidos antes.",
                                isCorrect: false,
                            },
                            {
                                text: "Não, porque revisão de documento pertence à garantia da qualidade e não ao teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, mas apenas quando a revisão é conduzida por alguém da equipe de qualidade.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Teste e depuração: duas atividades diferentes",
                blocks: [
                    {
                        type: "text",
                        value: "## A distinção que a prova cobra\n\nTeste e depuração são atividades distintas, e a prova pergunta isso de forma direta e de forma disfarçada.\n\nO **teste** pode disparar falhas causadas por defeitos no software, ou pode detectar defeitos diretamente por meio de teste estático.\n\nA **depuração** é a atividade de desenvolvimento que se preocupa em **encontrar, analisar e corrigir** esses defeitos. Ela não é teste.",
                    },
                    {
                        type: "table",
                        value: '[["", "Teste dinâmico", "Depuração"], ["Quem costuma fazer", "Quem testa", "Quem desenvolve"], ["O que produz", "Falhas observadas e relatadas", "Correção no código"], ["Pergunta que responde", "O comportamento bate com o esperado?", "Onde está a causa e como corrigir?"], ["Quando acontece", "Ao exercitar o objeto de teste", "Depois de uma falha relatada"]]',
                    },
                    {
                        type: "text",
                        value: "## A sequência típica\n\nO syllabus descreve a sequência para o teste dinâmico:\n\n1. O **teste** dispara uma falha.\n2. A **depuração** reproduz a falha, diagnostica a causa e corrige o defeito.\n3. O **teste de confirmação** verifica se as correções resolveram o problema.\n4. O **teste de regressão** verifica se as correções não causaram efeitos adversos em outras partes.\n\nRepare que os passos 3 e 4 voltam a ser teste, e normalmente são feitos pela mesma pessoa que reportou.\n\nPara o **teste estático** a sequência é mais curta: ele identifica o defeito diretamente, sem falha nenhuma, e a depuração se resume a corrigir. Não há o que reproduzir, porque nada foi executado.",
                    },
                    {
                        type: "quote",
                        value: 'Uma pegadinha comum: no teste estático, a depuração **não** envolve reproduzir a falha nem diagnosticar a causa, porque o defeito foi encontrado diretamente. Questões que descrevem "reproduzir e diagnosticar" estão falando de teste dinâmico.',
                    },
                    {
                        type: "text",
                        value: "## Quem faz o quê\n\nO syllabus reconhece que, na prática, os papéis se misturam: quem desenvolve pode fazer teste de componente e depurar; quem testa pode fazer teste de confirmação e de regressão.\n\nO que a prova cobra não é quem executa, e sim **a natureza da atividade**. Se a atividade busca localizar a causa no código e corrigir, é depuração, mesmo que quem faça seja da equipe de teste. Se a atividade busca observar o comportamento e compará-lo com o esperado, é teste, mesmo que quem faça seja da equipe de desenvolvimento.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a diferença entre teste e depuração?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O teste dispara ou detecta defeitos; a depuração localiza a causa e corrige.",
                                isCorrect: true,
                            },
                            {
                                text: "O teste é feito pela equipe de qualidade e a depuração pela de desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste acontece antes da entrega e a depuração apenas depois que o produto sobe.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste examina artefatos e a depuração executa o software com dados preparados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a sequência correta após o teste dinâmico disparar uma falha?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Depuração, teste de confirmação e teste de regressão.",
                                isCorrect: true,
                            },
                            {
                                text: "Teste de regressão, depuração e teste de confirmação do defeito que foi corrigido.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de confirmação, teste de regressão e depuração da causa raiz identificada.",
                                isCorrect: false,
                            },
                            {
                                text: "Análise de causa raiz, teste de aceitação e nova execução da suíte de regressão.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Como a depuração difere quando o defeito é encontrado por teste estático?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Não há falha a reproduzir nem causa a diagnosticar: o defeito já foi localizado.",
                                isCorrect: true,
                            },
                            {
                                text: "A depuração deixa de ser necessária, porque o artefato ainda não virou código.",
                                isCorrect: false,
                            },
                            {
                                text: "A depuração precisa reproduzir a falha antes de analisar a causa do problema.",
                                isCorrect: false,
                            },
                            {
                                text: "A depuração passa a ser responsabilidade de quem conduziu a revisão do artefato.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma pessoa da equipe de teste localiza a linha responsável pelo defeito e corrige o código. Como se classifica essa atividade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Depuração, porque a natureza da atividade é localizar a causa e corrigir.",
                                isCorrect: true,
                            },
                            {
                                text: "Teste, porque quem executou a atividade pertence à equipe de qualidade do time.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de confirmação, já que a correção precisa ser verificada logo em seguida.",
                                isCorrect: false,
                            },
                            {
                                text: "Revisão técnica, porque envolveu análise do código-fonte construído pela equipe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual atividade verifica se a correção não causou efeitos adversos em partes não alteradas?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Teste de regressão.",
                                isCorrect: true,
                            },
                            {
                                text: "Teste de confirmação, que reexecuta o cenário que havia falhado antes da correção.",
                                isCorrect: false,
                            },
                            {
                                text: "Depuração, que analisa o impacto da alteração feita nas demais partes do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de manutenção, acionado sempre que o sistema recebe qualquer modificação.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Por que o teste é necessário",
                blocks: [
                    {
                        type: "text",
                        value: "## A contribuição do teste para o sucesso\n\nO syllabus lista as formas pelas quais o teste contribui para o sucesso, e cada uma já apareceu em prova:\n\n- **É um jeito barato de detectar defeitos.** Corrigir defeitos encontrados por teste é mais barato do que corrigir os que chegam ao cliente.\n- **Contribui diretamente para a qualidade**, ao dar informação que permite corrigir o produto.\n- **Fornece representação direta da qualidade** do objeto em um dado momento, o que apoia a decisão de liberar.\n- **Ajuda a cumprir exigências contratuais e regulatórias.**\n- **Dá visão sobre a qualidade** para as partes interessadas.",
                    },
                    {
                        type: "text",
                        value: "## Teste, garantia da qualidade e controle de qualidade\n\nEssa distinção rende questão em toda prova. Três conceitos, três focos:\n\nA **garantia da qualidade** (QA) é orientada ao **processo**. Ela se concentra na implementação e na melhoria dos processos, partindo da premissa de que um bom processo, bem seguido, tende a produzir um bom produto. Aplica-se a todo o ciclo de vida.\n\nO **controle de qualidade** (QC) é orientado ao **produto**. Ele reúne as atividades corretivas que buscam alcançar níveis apropriados de qualidade no que foi construído. O **teste faz parte do controle de qualidade**.\n\nO **teste**, portanto, é uma das atividades de controle de qualidade, e contribui também para a garantia da qualidade quando os dados que produz alimentam a melhoria do processo.",
                    },
                    {
                        type: "table",
                        value: '[["", "Garantia da qualidade (QA)", "Controle de qualidade (QC)"], ["Orientação", "Processo", "Produto"], ["Premissa", "Bom processo gera bom produto", "É preciso verificar o que foi construído"], ["Natureza", "Preventiva", "Corretiva"], ["O teste está aqui?", "Contribui, com dados", "Sim, o teste é parte do QC"]]',
                    },
                    {
                        type: "quote",
                        value: "Grave a frase: **o teste faz parte do controle de qualidade, e não da garantia da qualidade**. Questões costumam apresentar a inversão como distrator.",
                    },
                    {
                        type: "text",
                        value: "## O papel do teste na redução de risco\n\nUma ideia central: o teste não elimina o risco, ele o **reduz** e o **torna visível**.\n\nAo encontrar defeitos, o teste reduz o risco de qualidade inadequada chegar ao cliente. Ao informar o que foi coberto e o que não foi, ele torna o risco residual explícito, permitindo decisão consciente.\n\nEssa é a razão pela qual a decisão de liberar cabe às partes interessadas, e não ao teste: o teste fornece a informação, o negócio assume o risco.",
                    },
                ],
                questions: [
                    {
                        statement: "O teste faz parte de qual atividade?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Do controle de qualidade, que é orientado ao produto.",
                                isCorrect: true,
                            },
                            {
                                text: "Da garantia da qualidade, que é orientada ao processo de trabalho da equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "Da gestão de configuração, que mantém o versionamento dos artefatos do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Da gestão de projeto, que acompanha prazo, custo e escopo ao longo da entrega.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a premissa da garantia da qualidade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que um processo adequado, bem seguido, tende a produzir um bom produto.",
                                isCorrect: true,
                            },
                            {
                                text: "Que todo produto precisa ser inspecionado antes de ser entregue ao cliente final.",
                                isCorrect: false,
                            },
                            {
                                text: "Que os defeitos precisam ser encontrados o quanto antes no ciclo de desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a qualidade só pode ser medida depois que o produto entra em operação real.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Segundo o syllabus, qual é a relação entre teste e risco?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O teste reduz o risco e o torna visível, sem jamais eliminá-lo.",
                                isCorrect: true,
                            },
                            {
                                text: "O teste elimina o risco de qualidade inadequada quando a cobertura chega a 100%.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste transfere o risco da equipe de desenvolvimento para a equipe de qualidade.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste mede o risco financeiro que o projeto representa para a organização.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que a decisão de liberar uma versão não cabe ao teste?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque o teste fornece a informação e o negócio assume o risco da decisão.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a equipe de teste não tem acesso ao ambiente de produção da organização.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a decisão depende exclusivamente da cobertura de código atingida na entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o processo formal exige a assinatura da gerência de projeto antes da entrega.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual das opções descreve uma contribuição do teste para o sucesso, conforme o syllabus?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ser um meio de custo relativamente baixo para detectar defeitos.",
                                isCorrect: true,
                            },
                            {
                                text: "Garantir que o produto entregue não apresentará nenhuma falha em operação real.",
                                isCorrect: false,
                            },
                            {
                                text: "Substituir a necessidade de definir processos adequados de desenvolvimento no time.",
                                isCorrect: false,
                            },
                            {
                                text: "Assumir a responsabilidade formal pela qualidade final do produto que foi construído.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Erro, defeito, falha e causa raiz",
                blocks: [
                    {
                        type: "text",
                        value: "## Quatro palavras com definições exatas\n\nEsta é uma das aulas mais rentáveis da trilha, porque a prova cobra essas definições diretamente e em cenários.\n\n**Erro** (também chamado de engano): a **ação humana** que produz um resultado incorreto. Acontece na cabeça de uma pessoa.\n\n**Defeito** (também chamado de falta, ou bug): a **imperfeição ou deficiência em um artefato** que pode fazer com que ele não cumpra seu comportamento esperado. Fica gravado no artefato.\n\n**Falha**: o **evento observado** em que um componente ou sistema não executa a função exigida dentro dos limites especificados. Acontece na execução.\n\n**Causa raiz**: a **origem fundamental** de um problema, aquela que, se removida ou alterada, previne a recorrência.",
                    },
                    {
                        type: "table",
                        value: '[["Termo", "Onde acontece", "Exemplo"], ["Erro", "Na pessoa", "Entender \\"acima de 65\\" como \\"65 ou mais\\""], ["Defeito", "No artefato", "Operador > escrito no lugar de >="], ["Falha", "Na execução", "Cliente de 65 anos não recebe o desconto"], ["Causa raiz", "No processo", "Regra escrita sem exemplo numérico"]]',
                    },
                    {
                        type: "text",
                        value: "## A cadeia e as suas exceções\n\nA cadeia padrão é: um erro produz um defeito, que **pode** causar uma falha quando executado.\n\nDuas observações que a prova explora:\n\n**Nem todo defeito causa falha.** Alguns defeitos exigem circunstâncias muito específicas para se manifestar, ou estão em trechos nunca executados. O defeito continua existindo.\n\n**Nem toda falha vem de defeito.** Falhas podem ser causadas por **condições ambientais**, como radiação, campo eletromagnético, poluição ou variação de energia, que alteram o hardware ou o firmware.\n\nE existe um terceiro caso importante: uma falha pode ser reportada quando o sistema está correto. Isso acontece por engano de quem observou, por ambiente mal configurado, ou por dados de teste errados. Essa não é uma falha de verdade, e sim um **falso positivo**.",
                    },
                    {
                        type: "quote",
                        value: 'As causas de erro humano que o syllabus cita: pressão de prazo, complexidade do artefato, processo ou tecnologia, muita interação entre sistemas, e fatores humanos como cansaço, falta de experiência e má comunicação. Questões podem pedir "qual dessas leva ao erro".',
                    },
                    {
                        type: "text",
                        value: "## Análise de causa raiz\n\nA análise de causa raiz busca a origem fundamental, e não o sintoma. Ela normalmente acontece quando um defeito é detectado, e o objetivo é agir sobre a origem para prevenir a recorrência de defeitos semelhantes.\n\nUm exemplo do próprio syllabus, encadeado: um pagamento incorreto (falha) é rastreado até uma linha de código com um valor errado (defeito), que foi escrito porque a especificação era ambígua (erro), que existia porque quem escreveu não tinha conhecimento suficiente de como o cálculo funciona (causa raiz).\n\nAgir na causa raiz, nesse caso, significa treinar ou envolver quem entende do cálculo na escrita da especificação. Corrigir só o código resolve aquele pagamento e não impede os próximos.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a definição de defeito?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma imperfeição em um artefato que pode impedir o comportamento esperado.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma ação humana que produz um resultado incorreto durante a construção do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Um evento em que o componente não executa a função exigida dentro do especificado.",
                                isCorrect: false,
                            },
                            {
                                text: "A origem fundamental de um problema, cuja remoção previne que ele volte a ocorrer.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma falha foi observada em um sistema, mas a investigação mostrou que o código está correto e o ambiente de teste estava mal configurado. Como se classifica isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Falso positivo, porque não houve falha real do sistema em teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Falha causada por condição ambiental, que é uma das origens previstas no syllabus.",
                                isCorrect: false,
                            },
                            {
                                text: "Defeito no artefato de configuração, que precisa ser registrado e corrigido pela equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "Erro humano de quem executou, que deve ser tratado com treinamento da pessoa envolvida.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual das situações é um exemplo de falha que NÃO foi causada por defeito no software?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Radiação alterando o comportamento do firmware durante a operação.",
                                isCorrect: true,
                            },
                            {
                                text: "Um requisito ambíguo que levou a equipe a implementar a regra de forma incorreta.",
                                isCorrect: false,
                            },
                            {
                                text: "Um trecho de código que não trata o caso em que a lista recebida está vazia.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma configuração de ambiente gravada com valor incorreto no servidor de produção.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um pagamento incorreto foi rastreado até uma linha de código errada, escrita a partir de uma especificação ambígua, produzida por quem não dominava o cálculo. Qual é a causa raiz?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A falta de conhecimento de quem escreveu a especificação.",
                                isCorrect: true,
                            },
                            {
                                text: "A linha de código com o valor errado, que produziu o pagamento incorreto observado.",
                                isCorrect: false,
                            },
                            {
                                text: "A especificação ambígua, que permitiu mais de uma interpretação da regra de negócio.",
                                isCorrect: false,
                            },
                            {
                                text: "O pagamento incorreto, que é o evento observado e reportado pelo cliente afetado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual das opções é citada pelo syllabus como causa de erro humano?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Pressão de prazo e complexidade do artefato.",
                                isCorrect: true,
                            },
                            {
                                text: "Ausência de ferramentas de automação adequadas ao contexto do projeto executado.",
                                isCorrect: false,
                            },
                            {
                                text: "Baixa cobertura de código atingida pela suíte de testes construída pela equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "Falta de rastreabilidade entre a base de teste e os casos que foram projetados.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Verificação, validação e o vocabulário da prova",
                blocks: [
                    {
                        type: "text",
                        value: "## Duas palavras que a prova separa\n\n**Verificação** confirma que requisitos especificados foram atendidos. Compara o que foi construído com a **especificação**.\n\n**Validação** confirma que o objeto atende às necessidades reais das partes interessadas. Compara o que foi construído com a **necessidade**.\n\nUm sistema pode passar na verificação e falhar na validação: ele faz exatamente o que foi especificado, e o que foi especificado não resolve o problema. É por isso que os dois objetivos aparecem separados na lista de objetivos do teste.",
                    },
                    {
                        type: "text",
                        value: "## Um glossário mínimo para a prova\n\nEstes termos aparecem em enunciados e alternativas o tempo todo. Vale gravar cada um.\n\n- **Objeto de teste** (test object): o artefato ou o sistema a ser testado.\n- **Base de teste** (test basis): a fonte de informação usada para derivar os testes, como requisitos, histórias, modelos ou código.\n- **Condição de teste** (test condition): um aspecto do objeto de teste que precisa ser verificado, produzido pela análise.\n- **Caso de teste** (test case): o conjunto de pré-condições, entradas, ações, resultados esperados e pós-condições.\n- **Procedimento de teste**: a sequência de casos de teste em ordem de execução, com as ações necessárias.\n- **Testware**: todos os artefatos produzidos pelo teste, do plano aos scripts e relatórios.\n- **Resultado esperado** e **resultado obtido**: a comparação entre os dois é o que gera a decisão de passou ou falhou.\n- **Oráculo de teste**: a fonte que determina o resultado esperado.",
                    },
                    {
                        type: "table",
                        value: '[["Termo", "Produzido por", "Responde"], ["Base de teste", "Vem de fora do teste", "De onde derivamos os testes?"], ["Condição de teste", "Análise de teste", "O que precisa ser verificado?"], ["Caso de teste", "Modelagem de teste", "Como verificar, com quais dados?"], ["Procedimento de teste", "Implementação de teste", "Em que ordem e com quais ações?"]]',
                    },
                    {
                        type: "quote",
                        value: "A distinção **condição de teste** contra **caso de teste** é cobrada com frequência. Condição é o que verificar (produto da análise). Caso é como verificar, com dados e resultado esperado (produto da modelagem).",
                    },
                    {
                        type: "text",
                        value: '## Como a prova costuma perguntar\n\nTrês formatos aparecem, e reconhecer o formato ajuda a responder rápido:\n\n**Definição direta.** "Qual é a definição de X?" A resposta é a do glossário, sem adaptação.\n\n**Cenário curto.** Descreve uma situação e pergunta como classificá-la. Aqui é preciso mapear o cenário para o termo exato, e os distratores costumam ser termos vizinhos.\n\n**Aplicação.** Dá um trecho de código, uma tabela ou valores e pede um cálculo, como cobertura ou valores de fronteira. São as questões de nível K3, concentradas no capítulo de técnicas.\n\nUma dica prática para a prova: leia a pergunta **até o fim** antes das alternativas, e desconfie de alternativas com palavras absolutas como "sempre", "nunca", "garante" e "elimina". O syllabus raramente afirma em termos absolutos, e essas alternativas costumam ser distratores.',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando o módulo:** teste é um conjunto de atividades estáticas e dinâmicas com sete objetivos típicos; teste e depuração são atividades distintas; o teste pertence ao controle de qualidade; erro, defeito e falha têm definições exatas e formam uma cadeia com exceções; e verificação e validação respondem perguntas diferentes.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a diferença entre verificação e validação?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Verificação confronta com a especificação; validação, com a necessidade real.",
                                isCorrect: true,
                            },
                            {
                                text: "Verificação é feita por quem testa e validação por quem vai usar o sistema pronto.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificação usa teste estático e validação usa exclusivamente teste dinâmico.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificação acontece antes da construção e validação depois da entrega ao cliente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que é a base de teste?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A fonte de informação usada para derivar os testes.",
                                isCorrect: true,
                            },
                            {
                                text: "O conjunto de casos de teste projetados para cobrir os requisitos da entrega atual.",
                                isCorrect: false,
                            },
                            {
                                text: "O artefato ou o sistema que está sendo submetido às atividades de teste planejadas.",
                                isCorrect: false,
                            },
                            {
                                text: "O ambiente configurado com os dados necessários para executar os cenários definidos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            '"O sistema deve recusar cadastro com CPF já existente" é um exemplo de quê?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Condição de teste, porque descreve o que precisa ser verificado.",
                                isCorrect: true,
                            },
                            {
                                text: "Caso de teste, porque já descreve o comportamento esperado do sistema em operação.",
                                isCorrect: false,
                            },
                            {
                                text: "Procedimento de teste, porque indica a ação que precisa ser executada na verificação.",
                                isCorrect: false,
                            },
                            {
                                text: "Base de teste, porque é a fonte da qual os testes serão derivados pela equipe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que determina o resultado esperado de um caso de teste?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O oráculo de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "O resultado obtido na primeira execução do caso no ambiente de homologação.",
                                isCorrect: false,
                            },
                            {
                                text: "A condição de teste identificada durante a atividade de análise de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "O procedimento de teste que define a ordem de execução dos casos projetados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a dica de prova apresentada, qual característica de uma alternativa costuma indicar distrator?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Palavras absolutas como sempre, nunca, garante e elimina.",
                                isCorrect: true,
                            },
                            {
                                text: "Alternativas mais longas que as demais, com detalhamento técnico do comportamento.",
                                isCorrect: false,
                            },
                            {
                                text: "Alternativas que citam termos exatos do glossário oficial publicado pela ISTQB.",
                                isCorrect: false,
                            },
                            {
                                text: "Alternativas que descrevem um cenário concreto em vez de uma definição abstrata.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Princípios, processo e pessoas",
        aulas: [
            {
                titulo: "Os sete princípios do teste",
                blocks: [
                    {
                        type: "text",
                        value: "## Sete princípios, e a prova cobra todos\n\nOs sete princípios são conteúdo garantido na prova, normalmente em duas formas: pedindo o nome do princípio que explica um cenário, ou pedindo qual princípio uma afirmação contraria. Vale decorar os sete e, mais importante, saber reconhecê-los em situação.",
                    },
                    {
                        type: "table",
                        value: '[["#", "Princípio", "Em uma frase"], ["1", "Teste mostra presença de defeitos, não ausência", "Testar reduz a chance de defeitos ocultos, mas nunca prova correção"], ["2", "Teste exaustivo é impossível", "Exceto em casos triviais, não dá para testar tudo"], ["3", "Teste antecipado economiza tempo e dinheiro", "Defeito encontrado cedo custa menos"], ["4", "Defeitos se agrupam", "Poucos módulos concentram a maioria dos defeitos"], ["5", "Cuidado com o paradoxo do pesticida", "Testes repetidos param de encontrar novidade"], ["6", "O teste depende do contexto", "Não existe abordagem única para todo produto"], ["7", "Ausência de erros é uma ilusão", "Software sem defeito e sem utilidade continua inútil"]]',
                    },
                    {
                        type: "text",
                        value: "## Detalhes que a prova explora\n\n**Princípio 1.** A formulação correta é que o teste pode mostrar que defeitos estão presentes, mas não pode provar que não há defeitos. Testar reduz a probabilidade de defeitos não descobertos permanecerem, mas mesmo sem falhas encontradas o teste não é prova de correção.\n\n**Princípio 2.** Teste exaustivo é impossível **exceto em casos triviais**. Essa ressalva importa: em um sistema com pouquíssimas entradas possíveis, o teste exaustivo é viável. Em vez dele, usam-se técnicas, priorização e teste baseado em risco para focar o esforço.\n\n**Princípio 3.** Também chamado de testar cedo, ou shift left. Tanto o teste estático quanto o dinâmico devem começar o mais cedo possível.\n\n**Princípio 4.** O agrupamento observado é usado como entrada para a análise de risco e para focar o esforço. Ele é uma aplicação do princípio de Pareto.\n\n**Princípio 5.** Se os mesmos testes são repetidos muitas vezes, eles se tornam cada vez menos eficazes em encontrar defeitos novos. Para superar, testes existentes precisam ser revisados e atualizados, e testes novos precisam ser escritos. A ressalva: testes repetidos ainda são úteis para regressão.\n\n**Princípio 6.** Não existe abordagem única. O teste é feito de forma diferente em contextos diferentes, e a abordagem depende de fatores como risco, domínio, ciclo de vida e regulação.\n\n**Princípio 7.** Verificar requisitos e corrigir defeitos não ajuda se o sistema construído não atende às necessidades e expectativas dos usuários, ou se não é competitivo em relação a alternativas.",
                    },
                    {
                        type: "quote",
                        value: "A confusão mais comum é entre os princípios 1 e 7. O **1** diz que o teste não prova ausência de defeitos. O **7** diz que ausência de defeitos não garante sucesso do produto. São afirmações diferentes: o primeiro trata do que o teste consegue provar, o segundo do que a qualidade significa.",
                    },
                    {
                        type: "text",
                        value: '## Reconhecendo o princípio em cenário\n\nVale treinar o mapeamento, porque a prova quase sempre pergunta assim:\n\n- "A suíte roda há anos e não encontra nada de novo" → princípio 5.\n- "Nenhum teste falhou, então não há defeitos" → contraria o princípio 1.\n- "Vamos testar todas as combinações possíveis" → contraria o princípio 2.\n- "O módulo de faturamento sempre dá problema, vamos olhar mais nele" → princípio 4.\n- "Usamos o mesmo rigor para o jogo e para o equipamento médico" → contraria o princípio 6.\n- "O sistema não tem bugs, mas ninguém quer usar" → princípio 7.\n- "Vamos revisar os requisitos antes de codar" → princípio 3.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual princípio afirma que testes repetidos deixam de encontrar defeitos novos?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O paradoxo do pesticida.",
                                isCorrect: true,
                            },
                            {
                                text: "O agrupamento de defeitos em poucos módulos do sistema construído pela equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "A impossibilidade do teste exaustivo em qualquer sistema de tamanho realista.",
                                isCorrect: false,
                            },
                            {
                                text: "A dependência do contexto, que faz cada produto exigir abordagem diferente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a ressalva do princípio de que o teste exaustivo é impossível?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ele é possível em casos triviais, com pouquíssimas entradas possíveis.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele passa a ser possível quando a suíte é totalmente automatizada pela equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele é possível em sistemas que possuem especificação completa e atualizada.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele deixa de valer quando existe tempo suficiente no cronograma do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre o primeiro e o sétimo princípio?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O primeiro trata do que o teste prova; o sétimo, do que a qualidade significa.",
                                isCorrect: true,
                            },
                            {
                                text: "O primeiro se aplica ao teste dinâmico e o sétimo ao teste estático dos artefatos.",
                                isCorrect: false,
                            },
                            {
                                text: "O primeiro trata de defeitos no código e o sétimo de defeitos nos requisitos escritos.",
                                isCorrect: false,
                            },
                            {
                                text: "O primeiro vale para sistemas críticos e o sétimo para produtos de mercado geral.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equipe usa o agrupamento de defeitos observado em entregas anteriores. Para que esse princípio serve, segundo o syllabus?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Como entrada para a análise de risco e para focar o esforço de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Como base para calcular a quantidade de defeitos que ainda restam no sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Como critério de saída, permitindo encerrar o teste nas áreas menos problemáticas.",
                                isCorrect: false,
                            },
                            {
                                text: "Como métrica de produtividade das pessoas que desenvolveram aqueles módulos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo o princípio do paradoxo do pesticida, os testes antigos se tornam inúteis?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não, eles continuam úteis para regressão, mas param de achar novidade.",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, e por isso devem ser removidos da suíte assim que o efeito for percebido.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, porque os defeitos que eles cobriam já foram todos corrigidos pela equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "Não, porque a repetição aumenta a confiança no resultado obtido a cada execução.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "As atividades do processo de teste",
                blocks: [
                    {
                        type: "text",
                        value: "## Não existe processo universal\n\nO syllabus é explícito: não existe um processo de teste universal, mas existe um **conjunto comum de atividades** sem as quais fica menos provável atingir os objetivos. Esse conjunto é o que a prova cobra.",
                    },
                    {
                        type: "text",
                        value: "## As sete atividades\n\n**1. Planejamento de teste.** Define objetivos e a abordagem para atingi-los dentro das restrições do contexto.\n\n**2. Monitoramento e controle de teste.** Monitoramento é a checagem contínua das atividades e a comparação do progresso real com o planejado. Controle são as ações corretivas para atingir os objetivos. Acontecem de forma contínua, ao longo das demais.\n\n**3. Análise de teste.** Analisa a base de teste para identificar características testáveis e definir e priorizar as condições de teste associadas. Responde **o que testar**, considerando o risco.\n\n**4. Modelagem de teste.** Elabora as condições em casos de teste e outros itens de testware. Responde **como testar**. Envolve identificar os elementos de cobertura, colaborar com representantes do negócio e projetar os dados.\n\n**5. Implementação de teste.** Cria ou obtém o testware necessário para a execução, como procedimentos, suítes, dados de teste e o ambiente.\n\n**6. Execução de teste.** Executa os testes conforme o cronograma, compara os resultados obtidos com os esperados, registra as anomalias e analisa para estabelecer as causas.\n\n**7. Conclusão de teste.** Ocorre em marcos como a liberação de uma versão ou o fim de uma iteração. Verifica entregáveis pendentes, arquiva o testware útil, entrega o ambiente, comunica os resultados e analisa lições aprendidas.",
                    },
                    {
                        type: "table",
                        value: '[["Atividade", "Pergunta que responde", "Entregável típico"], ["Planejamento", "O que vamos alcançar e como?", "Plano de teste"], ["Monitoramento e controle", "Estamos no rumo?", "Relatórios de progresso"], ["Análise", "O que testar?", "Condições de teste priorizadas"], ["Modelagem", "Como testar?", "Casos de teste e dados"], ["Implementação", "Está tudo pronto para executar?", "Procedimentos, suítes, ambiente"], ["Execução", "O resultado bate com o esperado?", "Resultados e relatos de defeito"], ["Conclusão", "O que aprendemos e o que arquivar?", "Relatório de conclusão"]]',
                    },
                    {
                        type: "quote",
                        value: "A confusão mais frequente da prova é entre **análise** e **modelagem**. Análise produz **condições de teste** (o que verificar). Modelagem produz **casos de teste** (como verificar, com dados e resultado esperado).",
                    },
                    {
                        type: "text",
                        value: "## O processo no contexto\n\nO syllabus destaca que o processo de teste deve ser adaptado ao contexto. Os fatores que influenciam incluem:\n\n- as partes interessadas, com suas necessidades e expectativas;\n- os membros da equipe, com habilidades e conhecimento;\n- o domínio do negócio, a criticidade e os riscos do produto;\n- as restrições técnicas, o ciclo de vida adotado e as ferramentas;\n- as políticas e práticas organizacionais;\n- as normas internas e externas exigidas.\n\nPor isso a mesma atividade pode ter peso muito diferente em dois projetos, e por isso um processo copiado de outra empresa raramente funciona sem ajuste.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual atividade do processo produz as condições de teste?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Análise de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Modelagem de teste, que elabora os casos concretos a partir do que foi identificado.",
                                isCorrect: false,
                            },
                            {
                                text: "Implementação de teste, que prepara o testware necessário para começar a executar.",
                                isCorrect: false,
                            },
                            {
                                text: "Planejamento de teste, que define os objetivos e a abordagem para a atividade.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quais atividades acontecem de forma contínua ao longo das demais?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Monitoramento e controle de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Análise e modelagem de teste, que se repetem a cada nova entrega da equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "Execução e conclusão de teste, realizadas ao final de cada ciclo de desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "Planejamento e implementação, que preparam o terreno para as demais atividades.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em qual atividade o ambiente de teste é preparado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Implementação de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Execução de teste, imediatamente antes de rodar os casos que foram projetados.",
                                isCorrect: false,
                            },
                            {
                                text: "Planejamento de teste, quando os recursos necessários são definidos e reservados.",
                                isCorrect: false,
                            },
                            {
                                text: "Modelagem de teste, junto com a criação dos casos e dos dados correspondentes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que caracteriza a atividade de conclusão de teste?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ocorre em marcos, arquiva o testware útil e analisa lições aprendidas.",
                                isCorrect: true,
                            },
                            {
                                text: "Ocorre continuamente, comparando o progresso real com o que havia sido planejado.",
                                isCorrect: false,
                            },
                            {
                                text: "Ocorre ao final de cada caso executado, registrando o resultado obtido na ferramenta.",
                                isCorrect: false,
                            },
                            {
                                text: "Ocorre antes da execução, verificando se os critérios de entrada foram atendidos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo o syllabus, o que influencia como o processo de teste é adaptado?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "As partes interessadas, o domínio, os riscos, o ciclo de vida e as normas exigidas.",
                                isCorrect: true,
                            },
                            {
                                text: "Exclusivamente o modelo de ciclo de vida de desenvolvimento adotado no projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "A quantidade de pessoas disponíveis na equipe de teste durante aquele período.",
                                isCorrect: false,
                            },
                            {
                                text: "O conjunto de ferramentas de automação já licenciadas pela organização contratante.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Testware e rastreabilidade",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é testware\n\n**Testware** é o conjunto de artefatos produzidos pelas atividades de teste. Cada atividade produz o seu, e a prova pode pedir qual artefato vem de qual atividade.",
                    },
                    {
                        type: "table",
                        value: '[["Atividade", "Testware produzido"], ["Planejamento", "Plano de teste, cronograma, registro de riscos, critérios de entrada e saída"], ["Monitoramento e controle", "Relatórios de progresso, documentação de diretivas de controle, informação de risco"], ["Análise", "Condições de teste priorizadas, relatos de defeito sobre a base de teste"], ["Modelagem", "Casos de teste priorizados, cartas de teste, requisitos de dados e de ambiente"], ["Implementação", "Procedimentos, suítes, dados de teste, cronograma de execução, ambiente montado"], ["Execução", "Registros de execução, relatos de defeito"], ["Conclusão", "Relatório de conclusão, itens de ação para melhoria, mudanças a documentar"]]',
                    },
                    {
                        type: "text",
                        value: "## Um detalhe que a prova cobra\n\nRepare que **relatos de defeito aparecem em duas atividades**: na análise, quando a revisão da base de teste encontra defeitos nos requisitos, e na execução, quando falhas são observadas.\n\nIsso reforça a ideia de que o teste encontra defeitos antes de existir código, e é uma pegadinha comum em questões que perguntam quando um relato de defeito pode ser produzido.",
                    },
                    {
                        type: "text",
                        value: "## Rastreabilidade\n\nA rastreabilidade liga os elementos da base de teste às condições, aos casos, aos procedimentos e aos resultados de execução. O syllabus destaca quatro benefícios, e todos já apareceram em prova:\n\n**Avaliar cobertura.** Boa rastreabilidade permite medir a cobertura em relação à base de teste, e por isso a base precisa mencionar explicitamente os elementos a serem cobertos.\n\n**Analisar impacto de mudanças.** Quando um requisito muda, a rastreabilidade mostra quais testes precisam ser revistos.\n\n**Tornar a auditoria possível.** Em contextos regulados, é preciso demonstrar o que foi verificado e como.\n\n**Atender critérios de governança de TI.**\n\nAlém disso, a rastreabilidade melhora a compreensão dos relatórios: ao ligar o resultado da execução aos objetivos de negócio, ela permite reportar o status em termos que a gestão entende, e não apenas em quantidade de casos.",
                    },
                    {
                        type: "quote",
                        value: 'Um jeito de guardar: a rastreabilidade responde "**o que essa mudança afeta?**" e "**o que ainda não foi coberto?**". As duas perguntas que ninguém consegue responder quando ela não existe.',
                    },
                    {
                        type: "text",
                        value: "## Cobertura e elementos de cobertura\n\nDurante a modelagem, são identificados os **elementos de cobertura**: os itens que serão exercitados pelos casos de teste. A cobertura é sempre medida em relação a algo, e o que é medido depende da técnica aplicada.\n\nAlguns exemplos que aparecem na prova: partições de equivalência, valores de fronteira, colunas de uma tabela de decisão, transições de um modelo de estados, comandos do código e decisões do código.\n\nA frase que resume: **a cobertura é medida em relação aos itens cobertos pela técnica aplicada**, e não em um número absoluto e universal.",
                    },
                ],
                questions: [
                    {
                        statement: "Em quais atividades relatos de defeito podem ser produzidos?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Na análise de teste e na execução de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas na execução de teste, quando as falhas são observadas durante a bateria.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas na implementação de teste, quando o ambiente e os dados são preparados.",
                                isCorrect: false,
                            },
                            {
                                text: "Na conclusão de teste, quando os resultados do ciclo são consolidados e relatados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é um benefício da rastreabilidade citado no syllabus?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Permitir avaliar a cobertura em relação à base de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Reduzir a quantidade de casos necessários para cobrir os requisitos especificados.",
                                isCorrect: false,
                            },
                            {
                                text: "Garantir que os defeitos encontrados serão corrigidos antes da entrega da versão.",
                                isCorrect: false,
                            },
                            {
                                text: "Eliminar a necessidade de manter documentação de requisitos atualizada no projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Que artefato é produzido pela atividade de modelagem de teste?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Casos de teste priorizados e os requisitos de dados e de ambiente.",
                                isCorrect: true,
                            },
                            {
                                text: "Procedimentos de teste e suítes organizadas na ordem prevista para a execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Condições de teste priorizadas conforme o risco identificado em cada área do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Relatório de conclusão com o resumo do que foi executado e do que ficou pendente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Como a rastreabilidade contribui para os relatórios de teste?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Permite reportar o status ligando o resultado aos objetivos de negócio.",
                                isCorrect: true,
                            },
                            {
                                text: "Permite calcular automaticamente a quantidade de defeitos ainda não descobertos.",
                                isCorrect: false,
                            },
                            {
                                text: "Permite reduzir o tamanho do relatório ao agrupar casos que verificam o mesmo item.",
                                isCorrect: false,
                            },
                            {
                                text: "Permite dispensar a comunicação verbal do status durante as reuniões da equipe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A cobertura de teste é medida em relação a quê?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Aos itens cobertos pela técnica que foi aplicada.",
                                isCorrect: true,
                            },
                            {
                                text: "À quantidade total de linhas de código escritas pela equipe de desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "Ao número de casos executados em relação ao número de casos que foram projetados.",
                                isCorrect: false,
                            },
                            {
                                text: "Ao percentual de requisitos que a equipe conseguiu implementar naquela entrega.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Papéis, habilidades e independência",
                blocks: [
                    {
                        type: "text",
                        value: "## Dois papéis principais\n\nO syllabus define dois papéis principais no teste, e a prova pede a distinção.\n\nA **gerência de teste** assume responsabilidade geral pelo processo de teste, pela liderança das atividades e pela equipe. Cuida de planejar, monitorar, controlar e concluir. O foco é a atividade.\n\nO **teste** assume responsabilidade técnica pelo aspecto de engenharia. Cuida de analisar, modelar, implementar e executar, além de avaliar resultados e reportar. O foco é o objeto de teste.\n\nUma ressalva importante: esses papéis dependem do contexto. Em times ágeis, algumas tarefas de gerência podem ser feitas pela equipe inteira ou pelo scrum master, e as duas responsabilidades podem estar na mesma pessoa em times pequenos.",
                    },
                    {
                        type: "table",
                        value: '[["Responsabilidade", "Papel"], ["Escrever e atualizar o plano de teste", "Gerência de teste"], ["Definir a abordagem e coordenar com quem cuida do produto", "Gerência de teste"], ["Analisar a base de teste e definir condições", "Teste"], ["Projetar casos e preparar dados", "Teste"], ["Executar e avaliar resultados", "Teste"], ["Iniciar análise e desenho, monitorar progresso e resultados", "Gerência de teste"], ["Automatizar e manter os testes automatizados", "Teste"]]',
                    },
                    {
                        type: "text",
                        value: "## Habilidades essenciais\n\nO syllabus lista habilidades genéricas relevantes, e a prova pode pedir qual delas corresponde a uma descrição:\n\n- **Conhecimento de teste**, para aumentar a eficácia da atividade.\n- **Meticulosidade, cuidado, curiosidade e atenção ao detalhe**, para produzir observações precisas.\n- **Boas habilidades de comunicação, escuta ativa e ser bom no trabalho em equipe.**\n- **Pensamento analítico, pensamento crítico e criatividade**, para aumentar a eficácia.\n- **Conhecimento técnico**, para aumentar a eficiência, por exemplo com ferramentas.\n- **Conhecimento do domínio**, para entender e comunicar com quem usa o sistema.\n\nA comunicação merece destaque, porque o syllabus dedica um trecho a ela: encontrar e comunicar defeitos pode ser visto como crítica ao produto e a quem o construiu. Por isso o teste precisa comunicar **de forma construtiva e factual**, sem culpar, com colaboração e buscando entendimento mútuo.",
                    },
                    {
                        type: "text",
                        value: "## Independência de teste\n\nA independência aumenta a eficácia na descoberta de defeitos, por causa de diferenças de perspectiva, formação e vieses. Ela existe em graus, e o syllabus lista uma escala:\n\n1. Nenhuma independência: quem escreveu o código testa o próprio código.\n2. Quem desenvolve testa o código de outra pessoa da mesma equipe.\n3. Uma equipe de teste dentro da equipe de desenvolvimento.\n4. Testadores de outra área de negócio ou de uma equipe de teste especializada.\n5. Testadores externos à organização.\n\n**Benefícios**: reconhecer tipos diferentes de falhas, verificar e questionar suposições feitas durante a especificação e a implementação.\n\n**Reveses**: isolamento da equipe de desenvolvimento, atraso no feedback, resistência à informação recebida, e desenvolvedores podendo perder o senso de responsabilidade pela qualidade.",
                    },
                    {
                        type: "quote",
                        value: "A prova gosta de perguntar os **reveses** da independência, e não só os benefícios. Guarde: isolamento, feedback lento, resistência à informação e perda do senso de responsabilidade por parte de quem desenvolve.",
                    },
                    {
                        type: "text",
                        value: "## A abordagem de time completo\n\nNa abordagem de time completo, praticada especialmente em times ágeis, qualquer pessoa com o conhecimento e as habilidades necessárias pode executar qualquer tarefa, e **todos são responsáveis pela qualidade**.\n\nQuem testa trabalha junto com representantes do negócio e com quem desenvolve, garantindo que os níveis desejados de qualidade sejam atingidos. Isso inclui apoiar e colaborar na criação dos testes de negócio, e trabalhar em conjunto para definir a estratégia.\n\nO syllabus aponta um benefício e um limite: a abordagem promove uso eficaz das habilidades da equipe e comunicação, mas **pode não ser adequada em todos os contextos**, como sistemas críticos de segurança, em que a independência maior é preferível.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual responsabilidade pertence ao papel de gerência de teste?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Escrever e atualizar o plano de teste e monitorar o progresso.",
                                isCorrect: true,
                            },
                            {
                                text: "Analisar a base de teste e definir as condições de teste da entrega corrente.",
                                isCorrect: false,
                            },
                            {
                                text: "Projetar os casos de teste e preparar os dados necessários para a execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar os cenários planejados e avaliar os resultados obtidos em cada um deles.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o maior grau de independência na escala apresentada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Testadores externos à organização.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma equipe de teste especializada dentro da mesma organização que desenvolve.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma equipe de teste que faz parte da equipe de desenvolvimento do produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Quem desenvolve testando o código escrito por outra pessoa da mesma equipe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é um revés da independência de teste, segundo o syllabus?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Quem desenvolve pode perder o senso de responsabilidade pela qualidade.",
                                isCorrect: true,
                            },
                            {
                                text: "A equipe de teste passa a encontrar menos defeitos por desconhecer o código-fonte.",
                                isCorrect: false,
                            },
                            {
                                text: "O custo do projeto aumenta pela necessidade de contratar profissionais externos.",
                                isCorrect: false,
                            },
                            {
                                text: "A rastreabilidade entre a base de teste e os casos projetados deixa de existir.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em qual contexto a abordagem de time completo pode não ser adequada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Em sistemas críticos de segurança, em que maior independência é preferível.",
                                isCorrect: true,
                            },
                            {
                                text: "Em equipes pequenas, nas quais uma pessoa acumula mais de um papel do processo.",
                                isCorrect: false,
                            },
                            {
                                text: "Em projetos com ciclo de vida iterativo e entregas frequentes de incremento.",
                                isCorrect: false,
                            },
                            {
                                text: "Em produtos digitais com requisitos que mudam ao longo das iterações do time.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que o syllabus destaca a comunicação construtiva ao reportar defeitos?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque encontrar defeitos pode ser visto como crítica ao produto e a quem o construiu.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o relatório precisa conter a análise de causa raiz para ser considerado completo.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a comunicação verbal substitui o registro formal na ferramenta de gestão usada.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a equipe de desenvolvimento decide quais defeitos serão aceitos como válidos.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Fixando o capítulo 1",
                blocks: [
                    {
                        type: "text",
                        value: "## O peso deste capítulo na prova\n\nO capítulo 1 vale **8 das 40 questões**, ou seja, 20% da prova. É o segundo maior peso, atrás apenas do capítulo de técnicas. E é o capítulo com melhor relação entre esforço e retorno, porque as questões são majoritariamente de definição e de reconhecimento de cenário.\n\nVale voltar a esta aula na véspera da prova.",
                    },
                    {
                        type: "table",
                        value: '[["Conceito", "O que gravar"], ["Teste", "Conjunto de atividades, estáticas e dinâmicas"], ["Depuração", "Encontrar, analisar e corrigir o defeito; não é teste"], ["Erro", "Ação humana que produz resultado incorreto"], ["Defeito", "Imperfeição no artefato"], ["Falha", "Evento observado na execução"], ["Causa raiz", "Origem fundamental; removê-la previne recorrência"], ["QA", "Orientada ao processo, preventiva"], ["QC", "Orientado ao produto, corretivo; o teste está aqui"], ["Verificação", "Confronta com a especificação"], ["Validação", "Confronta com a necessidade real"]]',
                    },
                    {
                        type: "text",
                        value: "## Os erros mais cometidos\n\nCinco confusões que derrubam candidato nesse capítulo:\n\n**Achar que teste é só execução.** Revisão é teste, e teste estático encontra defeitos diretamente.\n\n**Trocar QA e QC.** O teste faz parte do controle de qualidade. Garantia da qualidade é processo.\n\n**Confundir defeito com falha.** Defeito está no artefato e existe mesmo sem execução. Falha é o evento observado.\n\n**Achar que toda falha vem de defeito no código.** Condições ambientais causam falhas, e defeitos podem estar no requisito ou na configuração.\n\n**Confundir análise com modelagem.** Análise produz condições, modelagem produz casos.",
                    },
                    {
                        type: "quote",
                        value: "Uma frase que resolve várias questões de uma vez: **teste encontra, depuração corrige; erro é humano, defeito é do artefato, falha é da execução; QA é processo, QC é produto**.",
                    },
                    {
                        type: "text",
                        value: "## Como este capítulo se conecta ao resto\n\nO capítulo 1 é a base do vocabulário, e cada capítulo seguinte o reutiliza:\n\n- Os **sete princípios** reaparecem no capítulo 5, quando o teste baseado em risco explica por que priorizar.\n- A distinção **estático e dinâmico** vira o capítulo 3 inteiro.\n- As **atividades do processo** organizam o capítulo 5, que detalha planejamento, monitoramento e conclusão.\n- O par **erro, defeito e falha** volta no capítulo 5, na gestão de defeitos.\n- A **independência** e a abordagem de time completo reaparecem no capítulo 2, quando o teste entra no ciclo de vida ágil.\n\nOu seja, o esforço investido aqui rende nos outros cinco.",
                    },
                    {
                        type: "text",
                        value: '## Um exercício rápido de fixação\n\nAntes de seguir, tente responder de memória:\n\n1. Quais são os sete objetivos típicos do teste?\n2. Qual é a sequência após uma falha ser disparada no teste dinâmico?\n3. Qual é a diferença entre condição de teste e caso de teste?\n4. Cite dois reveses da independência de teste.\n5. Qual princípio é contrariado por "a suíte passou, logo não há defeitos"?\n\nSe travou em alguma, volte à aula correspondente antes de ir para o módulo 2. Este capítulo é o alicerce e não compensa deixar buraco nele.',
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o peso do capítulo 1 na prova CTFL v4.0?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "8 das 40 questões, ou seja, 20% da prova.",
                                isCorrect: true,
                            },
                            {
                                text: "11 das 40 questões, o que faz dele o capítulo de maior peso da prova oficial.",
                                isCorrect: false,
                            },
                            {
                                text: "4 das 40 questões, junto com o capítulo de teste estático do mesmo syllabus.",
                                isCorrect: false,
                            },
                            {
                                text: "2 das 40 questões, o menor peso entre os seis capítulos que compõem o exame.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual afirmação está correta sobre defeito e falha?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O defeito existe no artefato mesmo sem execução; a falha é o evento observado.",
                                isCorrect: true,
                            },
                            {
                                text: "O defeito só existe quando o trecho correspondente é executado pelo sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "A falha existe no artefato e o defeito é o comportamento observado na execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Defeito e falha são sinônimos, e a diferença é apenas de contexto de uso.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a afirmação correta sobre garantia da qualidade e teste?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A garantia da qualidade é orientada ao processo e o teste pertence ao controle.",
                                isCorrect: true,
                            },
                            {
                                text: "A garantia da qualidade é orientada ao produto e o teste é uma de suas atividades.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste pertence à garantia da qualidade e o controle cuida apenas do processo.",
                                isCorrect: false,
                            },
                            {
                                text: "Garantia e controle de qualidade são o mesmo conceito com nomes diferentes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Uma questão apresenta o cenário: "o time usa a mesma profundidade de teste para um site institucional e para um sistema hospitalar". Qual princípio é contrariado?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "O teste depende do contexto.",
                                isCorrect: true,
                            },
                            {
                                text: "O teste mostra a presença de defeitos, mas não consegue provar a ausência deles.",
                                isCorrect: false,
                            },
                            {
                                text: "Defeitos se agrupam em poucos módulos, normalmente os mais complexos do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste exaustivo é impossível em qualquer sistema de tamanho minimamente realista.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, por que investir esforço no capítulo 1 rende nos demais?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque ele define o vocabulário que os outros cinco capítulos reutilizam.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque ele concentra a maior parte das questões de aplicação da prova oficial.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque os demais capítulos apenas aprofundam os exemplos já apresentados nele.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque as questões dos outros capítulos são todas de nível de memorização simples.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Teste no ciclo de vida",
        aulas: [
            {
                titulo: "Modelos de ciclo de vida e o impacto no teste",
                blocks: [
                    {
                        type: "text",
                        value: "## O que o syllabus cobra aqui\n\nO capítulo 2 vale **6 das 40 questões**, 15% da prova. A primeira parte trata de como o ciclo de vida escolhido afeta o teste.\n\nO syllabus agrupa os modelos em duas famílias e descreve o efeito de cada uma.",
                    },
                    {
                        type: "text",
                        value: "## Modelos sequenciais\n\nEm um modelo sequencial, o processo é uma sequência linear de atividades, e cada fase deve terminar antes da seguinte começar. O exemplo clássico é o modelo em cascata.\n\nConsequência para o teste: as atividades de teste **dinâmico** só podem acontecer depois que todas as fases anteriores terminaram e o software está pronto, o que concentra o teste no fim.\n\nO **modelo em V** é a variação relevante: ele integra o processo de teste ao longo do desenvolvimento, implementando o princípio de testar cedo. Cada nível de desenvolvimento tem um nível de teste correspondente, e o teste dinâmico de cada nível é executado quando o software correspondente fica disponível.",
                    },
                    {
                        type: "text",
                        value: "## Modelos iterativos e incrementais\n\nNo desenvolvimento **incremental**, os requisitos são estabelecidos, o desenho é feito e o sistema é construído em pedaços, ou seja, em incrementos. O tamanho de cada incremento varia.\n\nNo desenvolvimento **iterativo**, grupos de funcionalidades são especificados, projetados, construídos e testados juntos em ciclos, e cada ciclo pode gerar uma versão funcional.\n\nConsequência para o teste: cada incremento precisa ser testado, e **o teste de regressão é cada vez mais importante conforme os incrementos se acumulam**. A verificação de que o que já funcionava continua funcionando cresce em custo e importância.\n\nExemplos citados: Scrum, Kanban, Spiral, e as práticas de Rational Unified Process e Extreme Programming.",
                    },
                    {
                        type: "table",
                        value: '[["", "Sequencial", "Iterativo e incremental"], ["Quando o teste dinâmico ocorre", "Depois das fases anteriores", "A cada incremento"], ["Feedback", "Tardio", "Frequente"], ["Regressão", "Menos crítica", "Cada vez mais crítica"], ["Custo de mudar requisito", "Alto", "Menor, faz parte do modelo"]]',
                    },
                    {
                        type: "quote",
                        value: "A afirmação que a prova cobra: em modelos iterativos e incrementais, **o teste de regressão ganha importância crescente**, porque cada incremento pode quebrar o que já existia.",
                    },
                    {
                        type: "text",
                        value: "## O que muda e o que não muda\n\nUm ponto que evita erro: o ciclo de vida muda **quando** e **com que frequência** as atividades de teste acontecem, mas não muda quais atividades existem nem os princípios que valem.\n\nAnálise, modelagem, implementação, execução e conclusão acontecem nos dois modelos. O que muda é o tamanho do ciclo, a frequência do feedback e o peso relativo de cada atividade.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Em um modelo sequencial, quando o teste dinâmico pode acontecer?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Depois que as fases anteriores terminaram e o software está disponível.",
                                isCorrect: true,
                            },
                            {
                                text: "Durante toda a construção, acompanhando cada componente que fica pronto.",
                                isCorrect: false,
                            },
                            {
                                text: "Antes do início da construção, a partir da especificação aprovada pelo cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas depois que o sistema entra em operação no ambiente de produção real.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual característica o modelo em V acrescenta em relação ao cascata puro?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Integra o processo de teste ao desenvolvimento, com um nível para cada fase.",
                                isCorrect: true,
                            },
                            {
                                text: "Permite que os requisitos sejam alterados livremente ao longo da construção.",
                                isCorrect: false,
                            },
                            {
                                text: "Divide o produto em incrementos entregues separadamente para o cliente final.",
                                isCorrect: false,
                            },
                            {
                                text: "Elimina a necessidade de teste dinâmico ao ampliar o uso de revisões formais.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que a regressão ganha importância em modelos iterativos e incrementais?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque cada incremento pode quebrar o que já estava funcionando antes.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque os requisitos são congelados e não podem mais mudar após a primeira entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o teste de componente deixa de ser executado nesses modelos de ciclo de vida.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a equipe de teste só recebe acesso ao sistema ao final de cada iteração.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a diferença entre desenvolvimento incremental e iterativo?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O incremental constrói o sistema em pedaços; o iterativo trabalha em ciclos.",
                                isCorrect: true,
                            },
                            {
                                text: "O incremental usa teste estático e o iterativo usa exclusivamente teste dinâmico.",
                                isCorrect: false,
                            },
                            {
                                text: "O incremental exige requisitos congelados e o iterativo permite alterá-los sempre.",
                                isCorrect: false,
                            },
                            {
                                text: "O incremental é aplicado em sistemas críticos e o iterativo em produtos de mercado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o modelo de ciclo de vida NÃO altera no teste?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Quais atividades do processo de teste existem e quais princípios valem.",
                                isCorrect: true,
                            },
                            {
                                text: "A frequência com que o feedback sobre a qualidade chega até a equipe do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "O momento em que o teste dinâmico pode ser executado ao longo do desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "O peso relativo que cada atividade de teste assume durante o andamento do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Boas práticas de teste em qualquer ciclo de vida",
                blocks: [
                    {
                        type: "text",
                        value: "## Quatro práticas que valem sempre\n\nO syllabus lista boas práticas independentes do ciclo de vida adotado. Elas são cobradas de forma direta, então vale gravá-las.\n\n**1. Cada atividade de desenvolvimento tem uma atividade de teste correspondente.** Nenhuma etapa de construção fica sem verificação associada.\n\n**2. Cada nível de teste tem objetivos específicos.** Isso evita redundância entre níveis: o mesmo comportamento não precisa ser verificado com a mesma profundidade em todos eles.\n\n**3. A análise e a modelagem de teste de um nível começam durante a fase de desenvolvimento correspondente.** Não se espera o software ficar pronto para começar a pensar os testes.\n\n**4. Quem testa participa da revisão dos artefatos assim que rascunhos ficam disponíveis.** Isso implementa o princípio de testar cedo e traz a perspectiva do teste antes de o código existir.",
                    },
                    {
                        type: "quote",
                        value: "A prática 2 merece atenção: **objetivos específicos por nível** é o que evita a redundância. Uma regra verificada exaustivamente no teste de componente não precisa ser reverificada exaustivamente no teste de sistema.",
                    },
                    {
                        type: "text",
                        value: "## Por que essas práticas importam\n\nElas resolvem os dois problemas mais comuns de organização do teste.\n\nO primeiro é o **teste espremido no fim**, que aparece quando não existe atividade de teste associada a cada atividade de desenvolvimento. O resultado é a fila de verificação nos últimos dias, sem tempo para corrigir.\n\nO segundo é a **redundância entre níveis**, que aparece quando cada nível tenta verificar tudo. O sintoma é uma suíte cara que testa a mesma regra em três lugares e mesmo assim deixa lacunas em outros.\n\nAs práticas 3 e 4 são a materialização do shift left dentro de qualquer ciclo de vida, inclusive sequencial. Mesmo em cascata dá para revisar requisitos cedo e projetar casos durante o desenho.",
                    },
                    {
                        type: "text",
                        value: "## Escolhendo a abordagem\n\nO syllabus lista os fatores que influenciam a escolha do ciclo de vida e, por consequência, da abordagem de teste:\n\n- natureza do projeto e do produto;\n- prioridades do negócio, como prazo de mercado;\n- domínio do negócio, como sistemas críticos de segurança;\n- riscos do produto e do projeto;\n- restrições regulatórias.\n\nO ponto que a prova cobra: a escolha da abordagem de teste **deriva** do contexto, e o mesmo produto pode exigir abordagens diferentes conforme o risco de cada parte. É o princípio 6 aplicado.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Segundo as boas práticas, o que deve existir para cada atividade de desenvolvimento?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma atividade de teste correspondente.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma fase de homologação com aprovação formal antes do início da etapa seguinte.",
                                isCorrect: false,
                            },
                            {
                                text: "Um conjunto de testes automatizados cobrindo o código produzido naquela atividade.",
                                isCorrect: false,
                            },
                            {
                                text: "Um relatório de progresso enviado às partes interessadas ao final de cada etapa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que cada nível de teste deve ter objetivos específicos?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Para evitar redundância entre os níveis na verificação do mesmo comportamento.",
                                isCorrect: true,
                            },
                            {
                                text: "Para permitir que cada nível seja executado por uma equipe diferente da organização.",
                                isCorrect: false,
                            },
                            {
                                text: "Para garantir que a cobertura de código seja medida separadamente em cada nível.",
                                isCorrect: false,
                            },
                            {
                                text: "Para facilitar a divisão do orçamento de teste entre as etapas do projeto atual.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quando a análise e a modelagem de teste de um nível devem começar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Durante a fase de desenvolvimento correspondente àquele nível.",
                                isCorrect: true,
                            },
                            {
                                text: "Depois que o software daquele nível estiver disponível para execução.",
                                isCorrect: false,
                            },
                            {
                                text: "No início do projeto, junto com o planejamento geral das atividades previstas.",
                                isCorrect: false,
                            },
                            {
                                text: "Ao final da fase anterior, como critério de entrada para a fase seguinte.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual problema a ausência de atividade de teste associada a cada atividade de desenvolvimento costuma gerar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O teste espremido no fim, sem tempo para corrigir o que for encontrado.",
                                isCorrect: true,
                            },
                            {
                                text: "A redundância entre os níveis de teste executados pela equipe durante o ciclo.",
                                isCorrect: false,
                            },
                            {
                                text: "A dificuldade de medir a cobertura de código atingida pela suíte automatizada.",
                                isCorrect: false,
                            },
                            {
                                text: "O aumento do custo das ferramentas necessárias para executar os testes previstos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo o syllabus, o que influencia a escolha do ciclo de vida e da abordagem de teste?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Natureza do produto, prioridades do negócio, domínio, riscos e regulação.",
                                isCorrect: true,
                            },
                            {
                                text: "Exclusivamente o tamanho da equipe de desenvolvimento disponível no projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "A preferência da equipe de teste quanto às ferramentas que domina melhor.",
                                isCorrect: false,
                            },
                            {
                                text: "O orçamento aprovado para a aquisição de licenças de software no ano corrente.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "TDD, ATDD e BDD",
                blocks: [
                    {
                        type: "text",
                        value: "## Teste como motor do desenvolvimento\n\nO syllabus apresenta três abordagens em que o teste **guia** a construção, em vez de vir depois dela. As três são cobradas, e a confusão entre elas é frequente.",
                    },
                    {
                        type: "text",
                        value: "## TDD, desenvolvimento orientado a testes\n\nDireciona a codificação por meio de casos de teste, em vez de um desenho de software extenso.\n\nO ciclo é: escrever o teste primeiro, escrever o código para fazer o teste passar, refatorar o código. Os testes são escritos **primeiro**, o código é desenvolvido para passar nos testes, e depois os dois são refatorados.\n\nPonto-chave para a prova: no TDD os testes são majoritariamente **em nível de componente** e **automatizados**.",
                    },
                    {
                        type: "text",
                        value: "## ATDD, desenvolvimento orientado a testes de aceitação\n\nDeriva os testes dos **critérios de aceitação**, como parte do processo de desenho do sistema.\n\nOs testes são escritos **antes** da parte da aplicação ser desenvolvida, para satisfazê-los. Eles podem ser criados por representantes do negócio, por quem desenvolve e por quem testa, atuando em conjunto.\n\nPonto-chave: o ATDD parte dos critérios de aceitação e envolve as três perspectivas.",
                    },
                    {
                        type: "text",
                        value: "## BDD, desenvolvimento orientado a comportamento\n\nExpressa o comportamento desejado de uma aplicação com casos de teste escritos em uma **forma de linguagem natural**, fácil de entender por todas as partes interessadas. Normalmente usa o formato dado, quando e então.\n\nOs casos de teste são então traduzidos automaticamente em testes executáveis.\n\nPonto-chave: o BDD trata da **forma de expressar** o comportamento, em linguagem compreensível por quem não é técnico.",
                    },
                    {
                        type: "table",
                        value: '[["Abordagem", "De onde os testes vêm", "Nível típico", "Ênfase"], ["TDD", "Do que o código precisa fazer", "Componente", "Guiar a codificação"], ["ATDD", "Dos critérios de aceitação", "Aceitação", "Alinhar negócio e time antes de codar"], ["BDD", "Do comportamento desejado", "Varia", "Linguagem comum a todos"]]',
                    },
                    {
                        type: "quote",
                        value: "O que as três têm em comum, e que a prova cobra: **os testes são escritos antes do código**, e servem também como forma de especificação. A diferença está em de onde derivam e em como são expressos.",
                    },
                    {
                        type: "text",
                        value: "## Um alerta do syllabus\n\nOs testes criados nessas abordagens podem ser automatizados e executados como parte da integração contínua, o que dá feedback rápido. Mas o syllabus faz uma ressalva importante: **eles não substituem o teste independente e o teste baseado em experiência**.\n\nOu seja, ter uma suíte verde de TDD não elimina a necessidade de exploração, de teste não funcional e de olhar independente. Alternativas que afirmem essa substituição são distratores.",
                    },
                ],
                questions: [
                    {
                        statement: "No TDD, em que nível os testes são majoritariamente escritos?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Em nível de componente, de forma automatizada.",
                                isCorrect: true,
                            },
                            {
                                text: "Em nível de aceitação, derivados dos critérios acordados com o negócio.",
                                isCorrect: false,
                            },
                            {
                                text: "Em nível de sistema, verificando o comportamento completo de ponta a ponta.",
                                isCorrect: false,
                            },
                            {
                                text: "Em nível de integração, focando nas interfaces entre os módulos construídos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "De onde o ATDD deriva os testes?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Dos critérios de aceitação, como parte do desenho do sistema.",
                                isCorrect: true,
                            },
                            {
                                text: "Do comportamento desejado, expresso em linguagem natural estruturada e comum.",
                                isCorrect: false,
                            },
                            {
                                text: "Da estrutura interna do código, garantindo cobertura de comando e de decisão.",
                                isCorrect: false,
                            },
                            {
                                text: "Dos defeitos encontrados nas entregas anteriores do mesmo produto pela equipe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que caracteriza o BDD em relação às outras duas abordagens?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A forma de expressar o comportamento, em linguagem natural compreensível por todos.",
                                isCorrect: true,
                            },
                            {
                                text: "O ciclo de escrever o teste, fazer passar e refatorar o código produzido.",
                                isCorrect: false,
                            },
                            {
                                text: "A derivação dos testes a partir dos critérios de aceitação da história de usuário.",
                                isCorrect: false,
                            },
                            {
                                text: "A execução automática dos testes a cada integração feita no repositório do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que TDD, ATDD e BDD têm em comum?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Os testes são escritos antes do código e servem também como especificação.",
                                isCorrect: true,
                            },
                            {
                                text: "Os testes são escritos em nível de componente por quem desenvolve a funcionalidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Os testes derivam dos critérios de aceitação acordados com as partes interessadas.",
                                isCorrect: false,
                            },
                            {
                                text: "Os testes são expressos em linguagem natural para facilitar a leitura pelo negócio.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual ressalva o syllabus faz sobre os testes criados nessas abordagens?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Não substituem o teste independente nem o baseado em experiência.",
                                isCorrect: true,
                            },
                            {
                                text: "Só podem ser automatizados quando a equipe adota integração contínua no projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Precisam ser reescritos sempre que o código passa por uma refatoração relevante.",
                                isCorrect: false,
                            },
                            {
                                text: "Não podem ser usados em projetos com ciclo de vida sequencial de desenvolvimento.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "DevOps, shift left e integração contínua",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é DevOps para o syllabus\n\nDevOps é uma abordagem organizacional que busca criar sinergia ao fazer com que desenvolvimento e operações trabalhem juntos, com um objetivo comum, alinhando os incentivos.\n\nEla exige uma mudança cultural e depende de **entrega contínua** (CD), **integração contínua** (CI) e infraestrutura como código. Isso permite estabelecer um pipeline de entrega em que o código é construído, integrado e testado automaticamente.",
                    },
                    {
                        type: "text",
                        value: "## Benefícios e riscos\n\nO syllabus lista os dois lados, e a prova cobra os dois.\n\n**Benefícios:**\n- feedback rápido sobre a qualidade do código e sobre o impacto das mudanças;\n- CI promove a abordagem shift left no teste, encorajando quem desenvolve a submeter código de alta qualidade;\n- promove processos automatizados como CI/CD, que facilitam o estabelecimento de ambientes estáveis;\n- aumenta a visão sobre características de qualidade não funcionais;\n- a automação por meio do pipeline reduz a necessidade de teste manual repetitivo;\n- o risco de regressão é minimizado pelo escalonamento e pela execução automatizada dos testes de regressão.\n\n**Riscos e desafios:**\n- o pipeline de DevOps precisa ser definido e estabelecido;\n- CI e CD exigem introdução e manutenção de ferramentas, o que custa recurso;\n- a automação de teste requer recursos adicionais e pode ser difícil de estabelecer.",
                    },
                    {
                        type: "quote",
                        value: "Um detalhe que a prova explora: DevOps **não elimina o teste manual**. Ele reduz a necessidade do teste manual **repetitivo**, e o syllabus afirma explicitamente que ainda é necessário algum nível de teste manual, especialmente do ponto de vista do usuário.",
                    },
                    {
                        type: "text",
                        value: "## Shift left\n\nTestar cedo, ou shift left, significa que o teste deve ser realizado o mais cedo possível no ciclo de vida.\n\nBoas práticas citadas pelo syllabus:\n\n- **revisar a especificação sob a perspectiva de teste**, o que costuma encontrar defeitos em potencial, como ambiguidade e incompletude;\n- **escrever casos de teste antes do código ser escrito**, e executar o código em um arcabouço de teste durante a implementação;\n- **usar integração contínua**, que é ainda melhor com entrega contínua, porque dá feedback rápido e adiciona testes automatizados de componente ao código;\n- **completar análise estática do código-fonte antes do teste dinâmico**, ou como parte de um processo automatizado;\n- **realizar teste não funcional a partir do nível de componente**, sempre que possível, já que é uma forma de teste antecipado que encontra defeitos cedo, quando corrigir é mais barato.",
                    },
                    {
                        type: "text",
                        value: "## O custo do shift left\n\nUm ponto honesto que o syllabus registra e a prova pode cobrar: a abordagem shift left **pode resultar em esforço e custo adicionais no início**, e espera-se que economize esforço e custo mais tarde no projeto.\n\nAlém disso, para funcionar, ela precisa do apoio das partes interessadas, que precisam ser convencidas e aceitar essa noção. Não é uma decisão apenas técnica.",
                    },
                ],
                questions: [
                    {
                        statement: "Segundo o syllabus, o que DevOps exige além de ferramentas?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma mudança cultural, com desenvolvimento e operações alinhados num objetivo comum.",
                                isCorrect: true,
                            },
                            {
                                text: "A eliminação da equipe de teste, absorvida pelas equipes de desenvolvimento do produto.",
                                isCorrect: false,
                            },
                            {
                                text: "A adoção obrigatória de um ciclo de vida iterativo e incremental na organização.",
                                isCorrect: false,
                            },
                            {
                                text: "A automação de cem por cento dos casos de teste existentes na suíte da equipe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual afirmação sobre DevOps e teste manual está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "DevOps reduz a necessidade de teste manual repetitivo, mas não o elimina.",
                                isCorrect: true,
                            },
                            {
                                text: "DevOps elimina a necessidade de teste manual em todos os níveis de teste do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "DevOps aumenta a necessidade de teste manual por causa da complexidade do pipeline.",
                                isCorrect: false,
                            },
                            {
                                text: "DevOps não afeta o teste manual, porque atua apenas na etapa de implantação da versão.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é um risco de DevOps citado pelo syllabus?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A introdução e a manutenção de ferramentas de CI e CD consomem recursos.",
                                isCorrect: true,
                            },
                            {
                                text: "O feedback sobre a qualidade do código passa a chegar mais devagar para a equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "O risco de regressão aumenta com a execução automatizada dos testes existentes.",
                                isCorrect: false,
                            },
                            {
                                text: "A visão sobre características de qualidade não funcionais diminui com a automação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual das opções é uma boa prática de shift left citada no syllabus?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Completar a análise estática do código antes do teste dinâmico.",
                                isCorrect: true,
                            },
                            {
                                text: "Concentrar o teste não funcional no nível de sistema, quando tudo está integrado.",
                                isCorrect: false,
                            },
                            {
                                text: "Escrever os casos de teste depois do código, garantindo aderência à implementação.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar a suíte de regressão apenas na véspera da entrega, para economizar tempo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o custo reconhecido da abordagem shift left?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Esforço e custo adicionais no início, com economia esperada mais tarde.",
                                isCorrect: true,
                            },
                            {
                                text: "Redução da qualidade do produto nas primeiras iterações do desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumento permanente do custo total do projeto em relação à abordagem tradicional.",
                                isCorrect: false,
                            },
                            {
                                text: "Necessidade de contratar profissionais externos para conduzir as revisões iniciais.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Retrospectivas e melhoria do processo de teste",
                blocks: [
                    {
                        type: "text",
                        value: "## O que são retrospectivas\n\nRetrospectivas, também chamadas de reuniões pós-projeto ou pós-mortem, são reuniões realizadas ao final de um projeto ou de uma iteração, em que os membros da equipe discutem:\n\n- o que foi bem-sucedido e deve ser mantido;\n- o que não foi bem-sucedido e poderia ser melhorado;\n- como incorporar as melhorias e manter os sucessos no futuro.\n\nO momento, a organização e os participantes dependem do ciclo de vida adotado, e a facilitação por alguém neutro costuma ser um fator de sucesso.",
                    },
                    {
                        type: "text",
                        value: "## Os benefícios típicos na perspectiva do teste\n\nO syllabus lista quatro, e a prova pergunta por eles:\n\n**Aumento da eficácia e da eficiência do sistema de teste.** O processo de teste melhora com base no que a equipe observou.\n\n**Melhoria da qualidade do testware.** Os artefatos de teste evoluem, como a suíte de regressão e os dados.\n\n**Vínculo e aprendizado da equipe.** O grupo aprende junto e se fortalece.\n\n**Melhoria da qualidade da base de teste.** Requisitos e histórias melhoram, o que reduz defeitos na origem.\n\n**Melhor cooperação entre desenvolvimento e teste.** As duas partes se alinham sobre o que atrapalhou.",
                    },
                    {
                        type: "quote",
                        value: "Repare que os benefícios não são apenas de processo: dois deles falam de **artefatos** (testware e base de teste) e um fala de **pessoas**. Questões podem apresentar um benefício de cada categoria.",
                    },
                    {
                        type: "text",
                        value: "## Fixando o capítulo 2, primeira parte\n\nAntes de seguir para níveis e tipos de teste, vale consolidar o que este módulo cobriu, que é a seção 2.1 do syllabus.",
                    },
                    {
                        type: "table",
                        value: '[["Conceito", "O que gravar"], ["Modelo sequencial", "Teste dinâmico concentrado no fim; modelo em V integra os níveis"], ["Iterativo e incremental", "Teste a cada incremento; regressão cada vez mais importante"], ["Boas práticas", "Atividade de teste para cada atividade de desenvolvimento; objetivos por nível"], ["TDD", "Teste primeiro, guia a codificação, nível de componente"], ["ATDD", "Deriva dos critérios de aceitação, com as três perspectivas"], ["BDD", "Comportamento em linguagem natural, traduzido em teste executável"], ["DevOps", "CI, CD e cultura; reduz teste manual repetitivo, não o elimina"], ["Shift left", "Testar cedo; custa mais no início e economiza depois"], ["Retrospectivas", "Melhoram processo, testware, base de teste e cooperação"]]',
                    },
                    {
                        type: "text",
                        value: '## Um erro comum de prova neste tema\n\nAlternativas que afirmam que uma prática **elimina** a necessidade de outra costumam ser distratores. Três exemplos que aparecem:\n\n- "DevOps elimina o teste manual" está errado: reduz o repetitivo.\n- "TDD elimina a necessidade de teste independente" está errado: o syllabus afirma o contrário explicitamente.\n- "Shift left elimina o teste no fim do ciclo" está errado: ele reduz o que chega lá.\n\nSempre que ler "elimina", "garante" ou "dispensa", desconfie e procure a alternativa mais moderada.',
                    },
                ],
                questions: [
                    {
                        statement: "Quais perguntas uma retrospectiva busca responder?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O que foi bem, o que não foi e como incorporar as melhorias no futuro.",
                                isCorrect: true,
                            },
                            {
                                text: "Quantos defeitos foram encontrados e qual a severidade atribuída a cada um deles.",
                                isCorrect: false,
                            },
                            {
                                text: "Se os critérios de saída foram atingidos e se a versão pode ser liberada ao cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Qual será o escopo da próxima iteração e quantas histórias cabem no ciclo seguinte.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é um benefício das retrospectivas na perspectiva do teste?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Melhoria da qualidade da base de teste, o que reduz defeitos na origem.",
                                isCorrect: true,
                            },
                            {
                                text: "Redução do tempo de execução da suíte automatizada de regressão do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumento da cobertura de código atingida pelos testes escritos pela equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "Eliminação da necessidade de análise de risco nas iterações seguintes do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual afirmação sobre shift left é correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Pode custar mais no início e economizar esforço mais tarde no projeto.",
                                isCorrect: true,
                            },
                            {
                                text: "Elimina a necessidade de teste nas fases finais do ciclo de desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "Reduz o custo total desde a primeira iteração em que é aplicado pela equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "Depende apenas de decisão técnica da equipe, sem envolver as partes interessadas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a dica de prova, qual palavra em uma alternativa costuma indicar distrator?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Elimina, garante ou dispensa.",
                                isCorrect: true,
                            },
                            {
                                text: "Reduz, contribui ou apoia, por serem afirmações vagas demais para a prova oficial.",
                                isCorrect: false,
                            },
                            {
                                text: "Automatizado, porque o syllabus prioriza abordagens manuais em quase todos os casos.",
                                isCorrect: false,
                            },
                            {
                                text: "Contexto, porque o syllabus evita mencionar variação entre projetos diferentes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quem costuma facilitar uma retrospectiva, como fator de sucesso?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Alguém neutro em relação ao que está sendo discutido.",
                                isCorrect: true,
                            },
                            {
                                text: "A gerência de teste, que responde pelo processo e pelas atividades da equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "A pessoa que cuida do produto, por conhecer as prioridades do negócio envolvido.",
                                isCorrect: false,
                            },
                            {
                                text: "Quem desenvolveu a maior parte do incremento entregue durante aquela iteração.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Níveis, tipos e manutenção",
        aulas: [
            {
                titulo: "Os cinco níveis de teste",
                blocks: [
                    {
                        type: "text",
                        value: "## Níveis são grupos de atividades\n\nNíveis de teste são grupos de atividades organizadas e gerenciadas em conjunto. Cada nível é uma instância do processo de teste, realizada em relação ao software de um dado estágio de desenvolvimento.\n\nO syllabus define **cinco níveis**, e a prova cobra tanto o nome quanto o que cada um verifica.",
                    },
                    {
                        type: "table",
                        value: '[["Nível", "O que testa", "Base de teste típica"], ["Componente (unidade)", "Componentes isolados", "Desenho detalhado, código, modelo de dados"], ["Integração de componentes", "Interfaces e interações entre componentes", "Desenho do software e da arquitetura, fluxos"], ["Sistema", "Comportamento e capacidades do sistema como um todo", "Requisitos, especificação, casos de uso, manuais"], ["Integração de sistemas", "Interfaces do sistema com outros sistemas e serviços externos", "Arquitetura de sistemas, contratos, protocolos"], ["Aceitação", "Prontidão para implantação e uso", "Processos de negócio, requisitos do usuário, regulação"]]',
                    },
                    {
                        type: "text",
                        value: "## A distinção que mais confunde\n\nIntegração de **componentes** e integração de **sistemas** são níveis diferentes, e a prova explora isso.\n\n**Integração de componentes** verifica as interfaces e as interações entre os componentes **do próprio sistema**. É tipicamente automatizado e faz parte da integração contínua.\n\n**Integração de sistemas** verifica as interfaces entre o sistema em teste e **outros sistemas ou serviços externos**. Pode ser feito depois do teste de sistema, ou em paralelo com ele em desenvolvimento iterativo.\n\nUm sinal prático: se a outra ponta é um serviço de terceiro, um sistema legado ou um microserviço de outra equipe, é integração de sistemas.",
                    },
                    {
                        type: "text",
                        value: "## Atributos que distinguem um nível de outro\n\nO syllabus diz que os níveis se distinguem por atributos, e não apenas por nome:\n\n- objeto de teste;\n- objetivos do teste;\n- base de teste;\n- defeitos e falhas típicos;\n- abordagem e responsabilidades específicas.\n\nÉ por isso que dois níveis podem usar a mesma técnica e ainda assim serem níveis diferentes: o objeto e o objetivo mudam.",
                    },
                    {
                        type: "quote",
                        value: "Uma questão frequente pede o **objeto de teste** de cada nível. Componente: o componente isolado. Integração de componentes: as interfaces entre eles. Sistema: o sistema completo. Integração de sistemas: as interfaces externas. Aceitação: o sistema pronto para uso.",
                    },
                    {
                        type: "text",
                        value: "## As formas de teste de aceitação\n\nO teste de aceitação tem formas próprias, e todas já apareceram em prova:\n\n**Aceitação do usuário (UAT)**: verifica se o sistema atende às necessidades dos usuários em um ambiente operacional, real ou simulado. O foco principal é a **adequação ao uso**.\n\n**Aceitação operacional (OAT)**: realizado por operadores ou administradores em um ambiente simulado de produção. Verifica backup e restauração, instalação, desinstalação, recuperação de desastre, gestão de usuários, tarefas de manutenção, tarefas de segurança e verificação de vulnerabilidades.\n\n**Aceitação contratual e regulatória**: verifica critérios acordados em contrato ou exigidos por regulação, e costuma ser feito por usuários ou por avaliadores externos.\n\n**Alfa e beta**: realizados por usuários potenciais ou existentes. O **alfa** ocorre nas instalações da organização que desenvolve, não na equipe de desenvolvimento. O **beta** ocorre no local dos próprios usuários. Servem para ganhar confiança antes da liberação geral.",
                    },
                ],
                questions: [
                    {
                        statement: "O que o teste de integração de sistemas verifica?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "As interfaces entre o sistema em teste e outros sistemas ou serviços externos.",
                                isCorrect: true,
                            },
                            {
                                text: "As interfaces e as interações entre os componentes internos do próprio sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "O comportamento e as capacidades do sistema completo, de ponta a ponta.",
                                isCorrect: false,
                            },
                            {
                                text: "A prontidão do sistema para ser implantado e utilizado pelas pessoas usuárias.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Onde o teste alfa é realizado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Nas instalações de quem desenvolve, mas não pela equipe de desenvolvimento.",
                                isCorrect: true,
                            },
                            {
                                text: "No local dos próprios usuários potenciais, em ambiente real de utilização do produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Em um ambiente simulado de produção, conduzido pelos operadores do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "No ambiente de integração contínua, de forma automatizada a cada nova versão.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual forma de teste de aceitação verifica backup, restauração e recuperação de desastre?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Aceitação operacional.",
                                isCorrect: true,
                            },
                            {
                                text: "Aceitação do usuário, que verifica a adequação ao uso pelas pessoas que vão operar.",
                                isCorrect: false,
                            },
                            {
                                text: "Aceitação contratual, que confere os critérios acordados formalmente com o cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste beta, realizado por usuários potenciais no ambiente real de utilização.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo o syllabus, o que distingue um nível de teste de outro?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Objeto de teste, objetivos, base, defeitos típicos e responsabilidades.",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas o momento do ciclo de vida em que aquele nível é executado pela equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "A técnica de projeto de teste aplicada para derivar os casos daquele nível.",
                                isCorrect: false,
                            },
                            {
                                text: "O grau de automação alcançado pelos casos de teste executados naquele nível.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um sistema precisa trocar dados com o serviço de um parceiro externo. Qual nível verifica essa troca?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Integração de sistemas.",
                                isCorrect: true,
                            },
                            {
                                text: "Integração de componentes, que trata das interfaces entre partes do mesmo sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de componente, verificando isoladamente o módulo que faz a chamada externa.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de aceitação, com a participação das pessoas que operam o sistema no dia a dia.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Tipos de teste: funcional e não funcional",
                blocks: [
                    {
                        type: "text",
                        value: "## Tipos não são níveis\n\nUm erro clássico: confundir nível com tipo. **Níveis** dizem em que estágio do desenvolvimento o teste ocorre. **Tipos** dizem o que está sendo avaliado. Qualquer tipo pode ser aplicado em qualquer nível.\n\nO syllabus organiza os tipos em quatro grupos: funcional, não funcional, caixa-preta e caixa-branca. Os dois primeiros tratam do que é avaliado; os dois últimos, de onde os testes são derivados.",
                    },
                    {
                        type: "text",
                        value: "## Teste funcional\n\nAvalia as funções que o componente ou sistema deve executar, ou seja, **o que** o objeto de teste deve fazer.\n\nPode ser realizado em todos os níveis, e as funções devem ser descritas em artefatos de trabalho como especificações de requisitos, histórias de usuário ou casos de uso. Em alguns casos podem ser assumidas como conhecidas.\n\nA **completude funcional** pode ser medida com cobertura funcional: a extensão em que algum tipo de elemento funcional foi exercitado, expressa em porcentagem. Isso exige rastreabilidade entre os testes e as funções.",
                    },
                    {
                        type: "text",
                        value: "## Teste não funcional\n\nAvalia atributos de qualidade **diferentes** das características funcionais, ou seja, **quão bem** o sistema se comporta.\n\nO syllabus se apoia na norma ISO/IEC 25010 e cita as características de qualidade, que a prova pode pedir pelo nome:\n\n- **Eficiência de desempenho**\n- **Compatibilidade**\n- **Usabilidade** (na norma mais recente, interação)\n- **Confiabilidade**\n- **Segurança**\n- **Manutenibilidade**\n- **Portabilidade**\n- **Adequação funcional** (que é funcional)\n\nAssim como o funcional, o não funcional pode e deve ser realizado em **todos os níveis**, e o mais cedo possível. Descobrir um defeito não funcional tarde costuma ser devastador, porque a correção pode exigir mudança de arquitetura.",
                    },
                    {
                        type: "table",
                        value: '[["Característica", "Pergunta que responde", "Exemplo de verificação"], ["Eficiência de desempenho", "É rápido e usa bem os recursos?", "Tempo de resposta sob carga esperada"], ["Compatibilidade", "Convive com outros sistemas e ambientes?", "Funciona nos navegadores suportados"], ["Usabilidade", "É fácil de aprender e de usar?", "Pessoas concluem a tarefa sem ajuda"], ["Confiabilidade", "Falha pouco e se recupera bem?", "Disponibilidade e tempo de recuperação"], ["Segurança", "Protege dados e acessos?", "Autorização, criptografia, vulnerabilidades"], ["Manutenibilidade", "É fácil de alterar e corrigir?", "Modularidade, analisabilidade, testabilidade"], ["Portabilidade", "Move-se para outro ambiente?", "Instalação e adaptação a outra plataforma"]]',
                    },
                    {
                        type: "quote",
                        value: "Duas afirmações que a prova cobra e que muita gente erra: teste não funcional **pode ser feito em todos os níveis**, inclusive no de componente, e **deve ser feito o mais cedo possível**, porque a correção tardia pode ser devastadora.",
                    },
                    {
                        type: "text",
                        value: "## A cobertura funcional\n\nVale entender a mecânica: a cobertura funcional é medida em relação a elementos funcionais cobertos, com rastreabilidade entre os testes e as funções.\n\nPor exemplo, se existem 20 requisitos funcionais e os testes exercitam 15 deles, a cobertura funcional é de 75%. A prova pode pedir esse cálculo simples.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a diferença entre nível e tipo de teste?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Nível diz em que estágio o teste ocorre; tipo diz o que está sendo avaliado.",
                                isCorrect: true,
                            },
                            {
                                text: "Nível diz quem executa o teste e tipo diz qual técnica de projeto foi aplicada.",
                                isCorrect: false,
                            },
                            {
                                text: "Nível se aplica a teste dinâmico e tipo se aplica apenas ao teste estático.",
                                isCorrect: false,
                            },
                            {
                                text: "Nível define a profundidade e tipo define a ordem em que os casos são executados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em quais níveis o teste não funcional pode ser realizado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Em todos os níveis, inclusive no de componente.",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas no nível de sistema, quando todas as partes já estão integradas e no ar.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas nos níveis de sistema e de aceitação, com o produto próximo do estado final.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas no nível de aceitação, com a participação de quem vai operar o produto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um time verifica se o sistema continua funcionando após a queda de um dos servidores e mede quanto tempo leva para voltar. Qual característica de qualidade está sendo avaliada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Confiabilidade.",
                                isCorrect: true,
                            },
                            {
                                text: "Eficiência de desempenho, que trata do tempo de resposta e do uso de recursos.",
                                isCorrect: false,
                            },
                            {
                                text: "Portabilidade, que trata da capacidade de mover o sistema para outro ambiente.",
                                isCorrect: false,
                            },
                            {
                                text: "Manutenibilidade, que trata da facilidade de alterar e corrigir o sistema construído.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um sistema tem 20 requisitos funcionais e os testes exercitam 15 deles. Qual é a cobertura funcional?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "75%.",
                                isCorrect: true,
                            },
                            {
                                text: "100%, porque a cobertura funcional considera apenas os requisitos que foram testados.",
                                isCorrect: false,
                            },
                            {
                                text: "25%, correspondente à proporção de requisitos que ainda não foram exercitados.",
                                isCorrect: false,
                            },
                            {
                                text: "Não é possível calcular sem conhecer a cobertura de código atingida pela suíte.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que o teste não funcional deve ser feito o mais cedo possível?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque a correção tardia pode exigir mudança de arquitetura.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque as ferramentas de teste não funcional só operam em ambiente de desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque os requisitos não funcionais deixam de ser válidos ao longo do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o teste funcional depende dos resultados do não funcional para ser executado.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Caixa-preta e caixa-branca como tipos de teste",
                blocks: [
                    {
                        type: "text",
                        value: "## Os outros dois grupos\n\nAlém de funcional e não funcional, o syllabus trata caixa-preta e caixa-branca como **tipos de teste**, definidos pela origem dos casos.\n\n**Teste de caixa-preta** é baseado em especificação: deriva os testes da documentação externa ao objeto de teste. O objetivo principal é verificar o comportamento do sistema em relação às suas especificações.\n\n**Teste de caixa-branca** é baseado em estrutura: deriva os testes da estrutura interna ou da implementação do sistema. O objetivo principal é cobrir a estrutura subjacente com os testes, no grau aceitável.",
                    },
                    {
                        type: "table",
                        value: '[["", "Caixa-preta", "Caixa-branca"], ["Origem dos testes", "Documentação externa e especificação", "Estrutura interna e implementação"], ["Objetivo principal", "Verificar comportamento contra a especificação", "Cobrir a estrutura no grau aceitável"], ["Precisa do código?", "Não", "Sim"], ["Cobertura medida em", "Itens da base de teste", "Comandos, decisões, caminhos"]]',
                    },
                    {
                        type: "text",
                        value: "## Combinando os grupos\n\nO ponto que a prova gosta de explorar: os grupos **se combinam**. Um teste pode ser funcional e de caixa-preta, funcional e de caixa-branca, não funcional e de caixa-preta, e assim por diante.\n\nExemplos que ajudam a fixar:\n\n- Verificar a regra de desconto derivando os casos do requisito: **funcional e caixa-preta**.\n- Verificar a mesma regra derivando os casos dos ramos do código: **funcional e caixa-branca**.\n- Medir tempo de resposta a partir de um requisito de desempenho: **não funcional e caixa-preta**.\n- Analisar o consumo de memória de uma função específica olhando a implementação: **não funcional e caixa-branca**.",
                    },
                    {
                        type: "quote",
                        value: 'Grave a formulação do syllabus: caixa-preta é **baseado em especificação**, caixa-branca é **baseado em estrutura**. Alternativas que definem caixa-branca como "feito por quem programa" são distratores, porque tratam de quem executa e não da origem dos testes.',
                    },
                    {
                        type: "text",
                        value: "## Um exemplo do syllabus\n\nO syllabus dá um exemplo que vale conhecer: os testes de caixa-preta podem ser derivados de casos de uso, e os de caixa-branca podem exercitar os caminhos do código.\n\nEle também esclarece que caixa-preta e caixa-branca **não são níveis**, e podem ser aplicados em qualquer um deles: dá para fazer caixa-branca em nível de componente e também em nível de integração, por exemplo verificando a cobertura de chamadas entre módulos.",
                    },
                ],
                questions: [
                    {
                        statement: "Como o syllabus define teste de caixa-branca?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Baseado em estrutura, derivando os testes da implementação interna.",
                                isCorrect: true,
                            },
                            {
                                text: "Baseado em especificação, derivando os testes da documentação externa do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Baseado em experiência, usando o conhecimento de quem projeta os casos de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Executado por quem desenvolve o código, diferentemente do teste de caixa-preta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Medir o tempo de resposta a partir de um requisito de desempenho é qual combinação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não funcional e caixa-preta.",
                                isCorrect: true,
                            },
                            {
                                text: "Não funcional e caixa-branca, porque exige analisar o código que executa a operação.",
                                isCorrect: false,
                            },
                            {
                                text: "Funcional e caixa-preta, porque verifica o comportamento descrito na especificação.",
                                isCorrect: false,
                            },
                            {
                                text: "Funcional e caixa-branca, porque deriva os cenários dos caminhos possíveis do código.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o objetivo principal do teste de caixa-branca?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Cobrir a estrutura subjacente com os testes, no grau aceitável.",
                                isCorrect: true,
                            },
                            {
                                text: "Verificar o comportamento do sistema em relação às suas especificações escritas.",
                                isCorrect: false,
                            },
                            {
                                text: "Prever onde os defeitos provavelmente estão com base na experiência acumulada.",
                                isCorrect: false,
                            },
                            {
                                text: "Avaliar atributos de qualidade diferentes das características funcionais do produto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Caixa-preta e caixa-branca podem ser aplicados em quais níveis?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Em qualquer nível, porque são tipos e não níveis de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Caixa-branca apenas no nível de componente e caixa-preta nos demais níveis do processo.",
                                isCorrect: false,
                            },
                            {
                                text: "Caixa-preta apenas nos níveis de sistema e aceitação, mais próximos do uso real.",
                                isCorrect: false,
                            },
                            {
                                text: "Ambos apenas nos níveis em que a equipe tem acesso à especificação e ao código.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Por que "caixa-branca é o teste feito por quem programa" é uma definição incorreta?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque a definição trata da origem dos testes, e não de quem os executa.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque quem programa também executa testes de caixa-preta durante a construção.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque caixa-branca só pode ser executado por ferramentas de análise automatizada.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o syllabus não reconhece caixa-branca como um tipo de teste válido.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Teste de confirmação e teste de regressão",
                blocks: [
                    {
                        type: "text",
                        value: "## Duas execuções com objetivos diferentes\n\nDepois de uma mudança, dois testes entram em cena, e a prova cobra a distinção com frequência.\n\n**Teste de confirmação** confirma que um defeito original foi de fato corrigido. Dependendo do risco, pode-se verificar a versão corrigida do software executando **todos os casos que falharam** por causa do defeito, ou adicionando novos testes para cobrir as mudanças feitas na correção.\n\n**Teste de regressão** confirma que **não foram causadas consequências adversas** por uma mudança, incluindo mudança no código já testado. Essas consequências podem afetar o mesmo componente, outros componentes do mesmo sistema ou até outros sistemas.",
                    },
                    {
                        type: "text",
                        value: "## Quando cada um é acionado\n\nO teste de regressão não é acionado apenas por correção de defeito. O syllabus é explícito: mudanças podem ser correções, mas também **funcionalidades novas** ou **alterações em funcionalidades existentes**.\n\nA regressão também deve ser realizada quando o **ambiente muda**, por exemplo quando uma versão nova do sistema operacional ou do banco de dados é implantada.\n\nE existe um caso que a prova gosta: a análise de impacto ajuda a decidir a extensão da regressão, indicando quais áreas podem ser afetadas.",
                    },
                    {
                        type: "quote",
                        value: "Como os testes de regressão são executados muitas vezes e evoluem lentamente, eles são **fortes candidatos à automação**. A automação deles deve começar cedo no projeto. É a afirmação exata do syllabus.",
                    },
                    {
                        type: "text",
                        value: "## Em desenvolvimento iterativo\n\nEm desenvolvimento incremental e iterativo, funcionalidades novas, mudanças e refatoração levam a mudanças frequentes no código, o que torna a regressão necessária a cada iteração.\n\nIsso reforça a importância da automação: sem ela, o custo da regressão cresce a cada incremento até inviabilizar o ciclo.",
                    },
                    {
                        type: "text",
                        value: "## Um resumo para a prova",
                    },
                    {
                        type: "table",
                        value: '[["", "Confirmação", "Regressão"], ["Objetivo", "Confirmar que o defeito foi corrigido", "Confirmar que nada mais quebrou"], ["Escopo", "Os casos que falharam, mais testes da correção", "Áreas afetadas, conforme análise de impacto"], ["Acionado por", "Correção de defeito", "Qualquer mudança, inclusive de ambiente"], ["Candidato à automação", "Menos crítico", "Sim, forte candidato"]]',
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o objetivo do teste de confirmação?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Confirmar que o defeito original foi de fato corrigido.",
                                isCorrect: true,
                            },
                            {
                                text: "Confirmar que a mudança não causou consequências adversas em outras partes.",
                                isCorrect: false,
                            },
                            {
                                text: "Decidir rapidamente se o ambiente recebido está estável para iniciar a bateria.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificar se o sistema atende aos critérios de aceitação acordados com o negócio.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O teste de regressão é acionado por quais situações?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Correções, funcionalidades novas, alterações e mudanças de ambiente.",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas por correções de defeitos encontrados em execuções anteriores da suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas por funcionalidades novas adicionadas ao produto durante a iteração corrente.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas quando a análise de risco indicar probabilidade alta de falha em produção.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que os testes de regressão são fortes candidatos à automação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque são executados muitas vezes e evoluem lentamente.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque exigem julgamento humano difícil de reproduzir de forma manual e consistente.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque cobrem cenários que mudam a cada iteração do desenvolvimento do produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque encontram mais defeitos novos do que qualquer outro tipo de teste executado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma nova versão do banco de dados foi implantada no ambiente, sem mudança no código da aplicação. O que o syllabus recomenda?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Realizar teste de regressão, porque o ambiente mudou.",
                                isCorrect: true,
                            },
                            {
                                text: "Realizar apenas teste de confirmação dos defeitos que estavam abertos na versão.",
                                isCorrect: false,
                            },
                            {
                                text: "Não realizar teste adicional, já que o código da aplicação não foi alterado.",
                                isCorrect: false,
                            },
                            {
                                text: "Realizar teste de aceitação do usuário para confirmar a adequação ao uso esperado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que ajuda a decidir a extensão do teste de regressão?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A análise de impacto, que indica as áreas possivelmente afetadas.",
                                isCorrect: true,
                            },
                            {
                                text: "A quantidade de defeitos encontrados na execução anterior da suíte de regressão.",
                                isCorrect: false,
                            },
                            {
                                text: "O tempo disponível no cronograma antes da data acordada para a entrega da versão.",
                                isCorrect: false,
                            },
                            {
                                text: "A cobertura de código atingida pelos testes automatizados existentes no projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Teste de manutenção",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando o teste de manutenção acontece\n\nSistemas precisam ser mantidos por conta de correções, de mudanças no ambiente operacional e de novas funcionalidades. O **teste de manutenção** foca em testar as mudanças e as partes não alteradas que possam ter sido afetadas.\n\nA manutenção pode ser **planejada** ou **corretiva**, e pode ser acionada por três grupos de gatilhos.",
                    },
                    {
                        type: "table",
                        value: '[["Gatilho", "O que envolve", "Exemplos"], ["Modificação", "Melhorias planejadas, correções, patches, atualizações de ambiente", "Nova funcionalidade, correção urgente, patch do sistema operacional"], ["Migração", "Mover para outra plataforma ou trocar componente", "Nova plataforma, novo banco, mudança de fornecedor"], ["Aposentadoria", "Encerrar a vida da aplicação", "Arquivamento de dados, migração de dados, restauração"]]',
                    },
                    {
                        type: "text",
                        value: "## O que cada gatilho exige\n\n**Modificação.** Exige testar as mudanças e realizar teste de regressão nas partes não alteradas que possam ser afetadas. Atualizações de ambiente, como um patch do sistema operacional, também disparam manutenção.\n\n**Migração.** Exige teste operacional do novo ambiente, além de testar o software alterado. Quando dados são transferidos de outra aplicação, também é preciso **teste de conversão**.\n\n**Aposentadoria.** Pode exigir teste de arquivamento de dados, especialmente quando há longos períodos de retenção. Também pode exigir testar procedimentos de restauração e recuperação após o arquivamento.",
                    },
                    {
                        type: "quote",
                        value: "Um detalhe pouco lembrado e cobrado: **aposentadoria de sistema também exige teste**, incluindo arquivamento e restauração dos dados. Muita gente marca a alternativa errada por achar que desligar um sistema não envolve teste.",
                    },
                    {
                        type: "text",
                        value: "## O escopo do teste de manutenção\n\nO escopo depende de três fatores, que a prova pede:\n\n- **o grau de risco da mudança**, por exemplo o grau em que a área alterada se comunica com outros componentes;\n- **o tamanho do sistema existente**;\n- **o tamanho da mudança**.\n\nQuanto maior o sistema e a mudança, maior o esforço de regressão necessário.",
                    },
                    {
                        type: "text",
                        value: "## Análise de impacto\n\nA análise de impacto avalia as mudanças feitas em uma versão de manutenção para identificar as consequências pretendidas, além dos efeitos colaterais esperados e possíveis, e para identificar as áreas afetadas no sistema.\n\nEla ajuda a decidir quais testes de regressão executar, e o syllabus registra que ela pode ser **difícil** em algumas situações:\n\n- quando as especificações estão desatualizadas ou faltando;\n- quando não existe rastreabilidade entre os testes e a base de teste;\n- quando as ferramentas oferecem apoio insuficiente;\n- quando as pessoas que conheciam o sistema não estão mais disponíveis;\n- quando não houve preocupação com manutenibilidade durante o desenvolvimento.\n\nEsse último item é uma boa ilustração de por que manutenibilidade é uma característica de qualidade que vale testar.",
                    },
                ],
                questions: [
                    {
                        statement: "Quais são os três gatilhos do teste de manutenção?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Modificação, migração e aposentadoria.",
                                isCorrect: true,
                            },
                            {
                                text: "Correção, regressão e confirmação das mudanças aplicadas ao sistema existente.",
                                isCorrect: false,
                            },
                            {
                                text: "Planejamento, execução e conclusão do ciclo de manutenção do produto entregue.",
                                isCorrect: false,
                            },
                            {
                                text: "Requisito novo, defeito encontrado e solicitação formal da área de negócio.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A migração de dados de outra aplicação exige qual tipo de teste adicional?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Teste de conversão.",
                                isCorrect: true,
                            },
                            {
                                text: "Teste de arquivamento, para garantir a retenção adequada dos registros históricos.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de confirmação dos defeitos que estavam abertos na versão anterior do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de aceitação contratual, conferindo os critérios acordados com o fornecedor.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que a aposentadoria de um sistema pode exigir em termos de teste?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Teste de arquivamento de dados e de procedimentos de restauração.",
                                isCorrect: true,
                            },
                            {
                                text: "Nenhum teste, porque o sistema deixará de ser utilizado pela organização.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas teste de regressão nas funcionalidades que serão desativadas gradualmente.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas teste de aceitação do usuário, confirmando a concordância com o encerramento.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quais fatores determinam o escopo do teste de manutenção?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O grau de risco da mudança, o tamanho do sistema e o tamanho da mudança.",
                                isCorrect: true,
                            },
                            {
                                text: "A quantidade de pessoas na equipe e o prazo disponível para a entrega da versão.",
                                isCorrect: false,
                            },
                            {
                                text: "O ciclo de vida adotado e o grau de automação alcançado pela suíte de testes.",
                                isCorrect: false,
                            },
                            {
                                text: "A severidade dos defeitos encontrados e a prioridade atribuída pelo negócio a eles.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em qual situação a análise de impacto se torna difícil?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Quando não existe rastreabilidade entre os testes e a base de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Quando o sistema possui documentação completa e atualizada de todos os requisitos.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando a equipe original permanece disponível para consulta durante a manutenção.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando a manutenibilidade foi tratada como característica de qualidade no projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Teste estático",
        aulas: [
            {
                titulo: "O que o teste estático alcança",
                blocks: [
                    {
                        type: "text",
                        value: "## O capítulo mais barato da prova\n\nO capítulo 3 vale **4 das 40 questões**, 10% da prova, e o syllabus estima apenas 80 minutos de estudo para ele. É o melhor retorno por esforço do exame inteiro, e vale garantir os quatro pontos.\n\nAo contrário do teste dinâmico, o **teste estático não exige a execução do software** que está sendo testado.",
                    },
                    {
                        type: "text",
                        value: "## Os dois tipos de teste estático\n\nO syllabus divide em duas formas:\n\n**Exames manuais**, ou seja, **revisões**: análise de artefatos feita por pessoas.\n\n**Análise estática**, feita por ferramentas: análise automatizada do código ou de outros artefatos.\n\nAs duas avaliam código ou outros artefatos com ou sem apoio de ferramenta, e o objetivo primário é **melhorar a qualidade e detectar defeitos**.",
                    },
                    {
                        type: "text",
                        value: "## O que pode ser examinado\n\nPraticamente qualquer artefato pode ser examinado por teste estático, desde que seja **legível e compreensível**. O syllabus lista exemplos:\n\n- especificações de requisitos;\n- código-fonte;\n- planos de teste;\n- casos de teste;\n- itens de backlog de produto;\n- cartas de teste;\n- documentação de projeto;\n- contratos;\n- modelos.\n\nO syllabus destaca que artefatos **difíceis de alterar depois de prontos**, como contratos, são candidatos especialmente valiosos, porque a correção posterior custa caro.\n\nJá artefatos que não são legíveis nem compreensíveis, como código executável de terceiros sem fonte, não podem ser analisados por teste estático.",
                    },
                    {
                        type: "quote",
                        value: "Duas afirmações que aparecem em prova: **não é qualquer artefato que pode ser examinado**, apenas os legíveis e compreensíveis; e a **análise estática por ferramenta** é uma forma de teste estático, não uma coisa à parte.",
                    },
                    {
                        type: "text",
                        value: "## O valor do teste estático\n\nO valor central: **detectar defeitos nas fases iniciais** do ciclo, cumprindo o princípio de testar cedo. Isso identifica defeitos que não são facilmente encontrados por teste dinâmico, permite verificar artefatos que ainda não são executáveis, e é mais barato de corrigir.\n\nAlém disso, o teste estático:\n\n- melhora a consistência e a qualidade dos artefatos;\n- pode levar a melhorias no processo de desenvolvimento;\n- reduz custo e tempo de desenvolvimento;\n- reduz o custo total da qualidade ao longo da vida do software, por causa das poucas falhas encontradas depois.\n\nE há um efeito indireto que a prova cobra: revisões de requisitos ajudam a **melhorar a comunicação** entre as partes interessadas.",
                    },
                ],
                questions: [
                    {
                        statement: "Quais são as duas formas de teste estático?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Exames manuais, ou revisões, e análise estática por ferramenta.",
                                isCorrect: true,
                            },
                            {
                                text: "Revisão informal e inspeção formal, conforme o grau de rigor aplicado ao processo.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de componente e teste de integração, aplicados antes da execução dinâmica.",
                                isCorrect: false,
                            },
                            {
                                text: "Análise de requisitos e análise de risco, realizadas no início do ciclo de vida.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual artefato NÃO pode ser examinado por teste estático?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Código executável de terceiros, sem acesso ao fonte.",
                                isCorrect: true,
                            },
                            {
                                text: "Um contrato firmado entre a organização e o fornecedor do serviço contratado.",
                                isCorrect: false,
                            },
                            {
                                text: "Um item de backlog de produto ainda não refinado pela equipe responsável.",
                                isCorrect: false,
                            },
                            {
                                text: "Um modelo de dados desenhado durante a fase de arquitetura do sistema novo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que artefatos difíceis de alterar depois de prontos são candidatos valiosos ao teste estático?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque a correção posterior custa caro, e encontrar cedo evita esse custo.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque esses artefatos costumam conter mais defeitos do que os demais do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a legislação exige revisão formal de todo contrato antes da assinatura.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque somente eles podem ser analisados por ferramentas de análise estática.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor central do teste estático?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Detectar defeitos nas fases iniciais, quando corrigir é mais barato.",
                                isCorrect: true,
                            },
                            {
                                text: "Medir o desempenho do sistema antes que ele seja implantado em produção.",
                                isCorrect: false,
                            },
                            {
                                text: "Substituir o teste dinâmico em produtos com baixo risco operacional envolvido.",
                                isCorrect: false,
                            },
                            {
                                text: "Confirmar que os defeitos corrigidos não se manifestam mais no sistema entregue.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o peso do capítulo de teste estático na prova?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "4 das 40 questões.",
                                isCorrect: true,
                            },
                            {
                                text: "11 das 40 questões, o que faz dele o capítulo mais extenso do syllabus oficial.",
                                isCorrect: false,
                            },
                            {
                                text: "8 das 40 questões, o mesmo peso do capítulo de fundamentos do exame aplicado.",
                                isCorrect: false,
                            },
                            {
                                text: "2 das 40 questões, empatado com o capítulo que trata de ferramentas de teste.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Estático e dinâmico: o que cada um encontra",
                blocks: [
                    {
                        type: "text",
                        value: "## Objetivos comuns e diferenças\n\nTeste estático e dinâmico têm **objetivos comuns**: dar suporte à detecção de defeitos e melhorar a qualidade dos artefatos. Eles se complementam, e não competem.\n\nA diferença essencial está em **o que encontram** e **como encontram**.",
                    },
                    {
                        type: "table",
                        value: '[["", "Teste estático", "Teste dinâmico"], ["Executa o software?", "Não", "Sim"], ["O que encontra", "Defeitos diretamente no artefato", "Falhas causadas por defeitos"], ["Quando pode começar", "Assim que o artefato existe", "Quando há software executável"], ["Encontra defeito em requisito?", "Sim", "Não diretamente"], ["Encontra problema de desempenho?", "Dificilmente", "Sim"]]',
                    },
                    {
                        type: "text",
                        value: "## O que só o estático encontra\n\nO syllabus lista os defeitos que são mais fáceis e baratos de encontrar por teste estático, e a prova cobra essa lista:\n\n- **defeitos em requisitos**: inconsistências, ambiguidades, contradições, omissões, imprecisões e redundâncias;\n- **defeitos de projeto**: estruturas de banco ineficientes e má decomposição de módulos;\n- **certos tipos de defeito de código**: variáveis com valores indefinidos, variáveis declaradas e nunca usadas, código inalcançável e código duplicado;\n- **desvios de padrões**: por exemplo, não aderência a convenções de codificação;\n- **especificações incorretas de interface**: unidades de medida diferentes usadas por dois sistemas que se comunicam;\n- **vulnerabilidades de segurança**: como suscetibilidade a estouro de buffer;\n- **lacunas ou imprecisões na rastreabilidade** ou na cobertura da base de teste.",
                    },
                    {
                        type: "quote",
                        value: "Repare que **código inalcançável e código duplicado** aparecem na lista do estático. Teste dinâmico não revela código morto, porque ele simplesmente nunca executa. Essa é uma pegadinha frequente.",
                    },
                    {
                        type: "text",
                        value: "## O que só o dinâmico encontra\n\nO teste dinâmico revela o que só aparece com o software rodando: comportamento incorreto em execução, problemas de desempenho, consumo de recursos, comportamento sob carga, interação com o ambiente real e falhas dependentes de tempo ou de concorrência.\n\nPor isso o syllabus insiste que os dois se complementam. Uma organização que só faz revisão encontra defeitos cedo e barato, mas não sabe se o sistema funciona. Uma que só faz teste dinâmico descobre tarde o que poderia ter evitado na origem.",
                    },
                    {
                        type: "text",
                        value: "## Uma consequência prática\n\nExiste uma ideia poderosa aqui: **o teste estático pode encontrar defeitos que jamais causariam falha**.\n\nUm trecho de código inalcançável, uma variável nunca usada, uma inconsistência em um requisito que ninguém implementou. Nenhum deles causaria uma falha observável, e todos são problemas reais que aumentam o custo de manutenção e o risco futuro.\n\nIsso amplia a definição do que o teste faz: não é apenas caçar falhas, é melhorar a qualidade dos artefatos.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual tipo de defeito é encontrado mais facilmente por teste estático?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Código inalcançável e variáveis declaradas e nunca utilizadas.",
                                isCorrect: true,
                            },
                            {
                                text: "Degradação de desempenho quando o sistema recebe muitos acessos simultâneos.",
                                isCorrect: false,
                            },
                            {
                                text: "Comportamento incorreto que só aparece na interação com o ambiente de produção.",
                                isCorrect: false,
                            },
                            {
                                text: "Falhas dependentes de tempo que ocorrem em situações de concorrência entre processos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que o teste dinâmico não revela código morto?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque esse código nunca é executado, então não produz comportamento observável.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque as ferramentas de execução ignoram trechos que não possuem cobertura definida.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque código morto não é considerado defeito pela definição adotada no syllabus.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a análise de cobertura só é feita durante a atividade de teste estático.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual objetivo o teste estático e o dinâmico têm em comum?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Dar suporte à detecção de defeitos e melhorar a qualidade dos artefatos.",
                                isCorrect: true,
                            },
                            {
                                text: "Medir a cobertura de código atingida pelos casos executados durante o ciclo.",
                                isCorrect: false,
                            },
                            {
                                text: "Confirmar que o sistema atende às necessidades reais de quem vai utilizá-lo.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificar o comportamento do sistema em condições de carga e de estresse elevado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Duas equipes usam unidades de medida diferentes na interface entre seus sistemas. Que tipo de teste encontra isso mais facilmente?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Teste estático, ao revisar a especificação da interface.",
                                isCorrect: true,
                            },
                            {
                                text: "Teste dinâmico de integração, executando a troca de mensagens entre os dois sistemas.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de aceitação do usuário, com a participação de quem opera os dois sistemas.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de desempenho, medindo o tempo de resposta na comunicação entre os sistemas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a implicação de o teste estático encontrar defeitos que jamais causariam falha?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O teste não é apenas caçar falhas: é melhorar a qualidade dos artefatos.",
                                isCorrect: true,
                            },
                            {
                                text: "Esses defeitos devem ser ignorados, já que não afetam o comportamento observado.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste estático deve ser priorizado sobre o dinâmico em todos os projetos.",
                                isCorrect: false,
                            },
                            {
                                text: "A cobertura de código deixa de ser uma métrica relevante para a equipe de teste.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Feedback antecipado e frequente",
                blocks: [
                    {
                        type: "text",
                        value: "## Por que o syllabus dedica uma seção a isso\n\nA seção 3.2.1 trata dos benefícios do feedback antecipado e frequente das partes interessadas, e a prova cobra os benefícios pelo nome.\n\nQuando o feedback é entregue tarde, o risco é construir o produto errado por muito tempo. Quando é antecipado e frequente, os problemas aparecem enquanto ainda são baratos de corrigir.",
                    },
                    {
                        type: "text",
                        value: "## Os benefícios listados\n\nO syllabus lista:\n\n- **comunicar cedo o impacto potencial** de defeitos e problemas, o que permite reagir a tempo;\n- **prevenir mal-entendidos sobre os requisitos** e garantir que mudanças sejam entendidas e implementadas cedo;\n- **permitir que a equipe de desenvolvimento melhore a compreensão** do que está construindo;\n- **focar e implementar as funcionalidades mais valiosas** primeiro, entregando valor antes;\n- **descobrir e resolver problemas cedo**, como requisitos ambíguos, faltantes ou mal compreendidos, que de outra forma seriam caros de corrigir.",
                    },
                    {
                        type: "quote",
                        value: "Repare que os benefícios não são apenas de qualidade: dois deles falam de **valor de negócio** (focar no mais valioso, entregar valor antes). Questões podem apresentar um benefício de negócio como alternativa correta.",
                    },
                    {
                        type: "text",
                        value: "## O risco do feedback tardio\n\nO syllabus é explícito sobre a consequência de não ter esse feedback: se ele for entregue tarde demais no ciclo de vida, **fica muito menos eficaz** para conduzir melhorias.\n\nIsso é a mesma ideia do custo crescente do defeito, aplicada ao feedback: uma informação que chegaria a tempo de mudar o rumo, quando chega no fim, só serve para constatar o estrago.",
                    },
                    {
                        type: "text",
                        value: "## Como isso se conecta ao ágil\n\nEm desenvolvimento iterativo, o feedback antecipado e frequente é estrutural: cada iteração entrega algo e recebe reação. Cerimônias como refinamento, review e retrospectiva são mecanismos de feedback.\n\nJá em modelos sequenciais o feedback precisa ser buscado deliberadamente, por meio de revisões e de entregas parciais para validação, porque o modelo não o produz naturalmente.\n\nEssa é uma boa forma de lembrar o conteúdo: em ágil o feedback vem do processo; em cascata, da revisão.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é um benefício do feedback antecipado e frequente, segundo o syllabus?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Prevenir mal-entendidos sobre os requisitos.",
                                isCorrect: true,
                            },
                            {
                                text: "Reduzir a quantidade de casos de teste necessários para cobrir a base de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Garantir que o produto entregue não apresentará falhas no ambiente de produção.",
                                isCorrect: false,
                            },
                            {
                                text: "Eliminar a necessidade de teste dinâmico nas funcionalidades já revisadas pelo time.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual benefício do feedback antecipado tem natureza de negócio, e não de qualidade técnica?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Focar e implementar primeiro as funcionalidades mais valiosas.",
                                isCorrect: true,
                            },
                            {
                                text: "Descobrir requisitos ambíguos que seriam caros de corrigir mais adiante no ciclo.",
                                isCorrect: false,
                            },
                            {
                                text: "Permitir que a equipe melhore a compreensão do que está sendo construído no projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Comunicar cedo o impacto potencial de defeitos encontrados nos artefatos revisados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece quando o feedback é entregue tarde demais no ciclo de vida?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ele se torna muito menos eficaz para conduzir melhorias.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele passa a ser responsabilidade exclusiva da equipe de teste do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele deixa de ser registrado, porque as decisões já foram tomadas pela equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele aumenta de valor, porque chega com informação mais completa sobre o produto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Como o feedback é obtido em modelos sequenciais?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Deliberadamente, por meio de revisões e entregas parciais para validação.",
                                isCorrect: true,
                            },
                            {
                                text: "Naturalmente, porque cada fase produz um artefato aprovado antes da seguinte.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas ao final do projeto, quando o sistema completo é entregue ao cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Por meio das cerimônias de refinamento e retrospectiva realizadas pela equipe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual princípio de teste está por trás do feedback antecipado e frequente?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Testar cedo economiza tempo e dinheiro.",
                                isCorrect: true,
                            },
                            {
                                text: "O teste mostra a presença de defeitos, mas nunca prova a ausência deles no produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Defeitos se agrupam em poucos módulos, normalmente os mais complexos do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste exaustivo é impossível, exceto em casos triviais com poucas entradas.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O processo de revisão e os papéis",
                blocks: [
                    {
                        type: "text",
                        value: "## As cinco atividades do processo de revisão\n\nO syllabus define um processo com cinco atividades, e a prova pede a ordem e o conteúdo de cada uma.\n\n**1. Planejamento.** Define o escopo, incluindo o propósito da revisão, o que revisar, as características de qualidade a avaliar, os critérios de saída, informações de apoio como normas, o esforço e o prazo.\n\n**2. Início da revisão.** Garante que todos e tudo estejam preparados: distribui os artefatos, explica o escopo, os objetivos, o processo, os papéis e os entregáveis.\n\n**3. Revisão individual.** Cada participante realiza a revisão individual, avaliando a qualidade e identificando anomalias, recomendações e questões.\n\n**4. Comunicação e análise dos achados.** Como as anomalias encontradas na revisão individual não são necessariamente defeitos, elas precisam ser comunicadas e analisadas. Para cada uma, decide-se o status, a propriedade e as ações necessárias.\n\n**5. Correção e relato.** Cria um relato de defeito para cada anomalia que exija mudança, corrige os defeitos, registra o status atualizado e verifica se os critérios de saída foram atingidos.",
                    },
                    {
                        type: "quote",
                        value: "Um detalhe fino que a prova cobra: **anomalias encontradas não são necessariamente defeitos**. É por isso que existe a atividade de comunicação e análise antes de gerar relatos de defeito.",
                    },
                    {
                        type: "text",
                        value: "## Os papéis e as responsabilidades\n\nCinco papéis principais, e a prova pergunta as responsabilidades de cada um.",
                    },
                    {
                        type: "table",
                        value: '[["Papel", "Responsabilidades"], ["Autor", "Cria o artefato sob revisão e corrige os defeitos, se necessário"], ["Gerência", "Decide o que será revisado, aloca tempo, orçamento e pessoas"], ["Facilitador (moderador)", "Garante o andamento eficaz da reunião, media pontos de vista divergentes"], ["Líder da revisão", "Assume responsabilidade geral, decide quem participa e quando ocorre"], ["Revisor", "Pode ser especialista do domínio ou de outra área; identifica anomalias"], ["Escriba", "Coleta as anomalias e registra a informação da revisão"]]',
                    },
                    {
                        type: "text",
                        value: "## Um detalhe sobre o facilitador\n\nO syllabus diz que o facilitador é frequentemente **a pessoa de quem depende o sucesso da revisão**. Ele media entre os vários pontos de vista e garante que a reunião ocorra de forma eficaz.\n\nNão confundir com o **líder da revisão**, que assume responsabilidade geral pela revisão, decide quem vai participar e organiza quando e onde ela ocorre. Em revisões menores, os dois papéis podem ser da mesma pessoa.",
                    },
                    {
                        type: "text",
                        value: "## Papéis e níveis de formalidade\n\nNem toda revisão usa todos os papéis. Em uma revisão informal, pode haver apenas autor e revisor. Em uma inspeção, todos os papéis costumam existir e ser explicitamente atribuídos.\n\nA quantidade de papéis e o rigor do processo acompanham o **nível de formalidade** da revisão, que é o tema da próxima aula.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a primeira atividade do processo de revisão?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Planejamento, que define escopo, propósito e critérios de saída.",
                                isCorrect: true,
                            },
                            {
                                text: "Início da revisão, quando os artefatos são distribuídos e o contexto é explicado.",
                                isCorrect: false,
                            },
                            {
                                text: "Revisão individual, quando cada participante examina o artefato recebido.",
                                isCorrect: false,
                            },
                            {
                                text: "Comunicação e análise dos achados registrados por cada participante da revisão.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que existe a atividade de comunicação e análise dos achados?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque as anomalias encontradas não são necessariamente defeitos.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o autor precisa aprovar cada achado antes que ele seja registrado formalmente.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a gerência precisa autorizar a correção de cada defeito encontrado na revisão.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque as ferramentas de análise estática exigem confirmação manual dos resultados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quem decide quem participa da revisão e quando ela ocorre?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O líder da revisão.",
                                isCorrect: true,
                            },
                            {
                                text: "O facilitador, que também media os pontos de vista divergentes durante a reunião.",
                                isCorrect: false,
                            },
                            {
                                text: "A gerência, que aloca o tempo e o orçamento necessários para a atividade acontecer.",
                                isCorrect: false,
                            },
                            {
                                text: "O autor, que conhece melhor o artefato e sabe quem pode contribuir com a revisão.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a responsabilidade do escriba?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Coletar as anomalias e registrar a informação da revisão.",
                                isCorrect: true,
                            },
                            {
                                text: "Garantir o andamento eficaz da reunião e mediar divergências entre os participantes.",
                                isCorrect: false,
                            },
                            {
                                text: "Criar o artefato sob revisão e corrigir os defeitos identificados pelos revisores.",
                                isCorrect: false,
                            },
                            {
                                text: "Decidir o que será revisado e alocar os recursos necessários para a atividade.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em que atividade os relatos de defeito são criados?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Correção e relato, para cada anomalia que exija mudança.",
                                isCorrect: true,
                            },
                            {
                                text: "Revisão individual, no momento em que cada participante identifica a anomalia.",
                                isCorrect: false,
                            },
                            {
                                text: "Comunicação e análise, quando o grupo discute cada achado e decide o status dele.",
                                isCorrect: false,
                            },
                            {
                                text: "Início da revisão, junto com a distribuição dos artefatos aos participantes.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Os tipos de revisão e os fatores de sucesso",
                blocks: [
                    {
                        type: "text",
                        value: "## Quatro tipos, do informal ao formal\n\nO syllabus define quatro tipos de revisão, que variam pelo nível de formalidade. A prova pede o nome a partir da descrição, então vale gravar o que caracteriza cada um.",
                    },
                    {
                        type: "table",
                        value: '[["Tipo", "Formalidade", "Quem conduz", "Preparação prévia", "Objetivo principal"], ["Revisão informal", "Nenhuma", "Não definido", "Não exigida", "Detectar anomalias"], ["Walkthrough", "Baixa a média", "O autor", "Opcional", "Entendimento comum, achar defeitos, avaliar qualidade"], ["Revisão técnica", "Média", "Facilitador ou revisor", "Sim", "Consenso técnico, decisões, achar defeitos"], ["Inspeção", "Alta", "Facilitador, com papéis definidos", "Sim, obrigatória", "Achar o máximo de anomalias, com métricas e melhoria de processo"]]',
                    },
                    {
                        type: "text",
                        value: "## Detalhes de cada tipo\n\n**Revisão informal.** Não segue processo definido e não exige documentação formal dos resultados. O objetivo principal é detectar anomalias.\n\n**Walkthrough.** Conduzido pelo autor, que guia os participantes pelo artefato. Serve para estabelecer entendimento comum, encontrar defeitos, avaliar qualidade, gerar ideias e novas abordagens. A preparação individual antes da reunião é opcional, e pode incluir a participação de pares e especialistas.\n\n**Revisão técnica.** Realizada por revisores tecnicamente qualificados e liderada por um facilitador ou por um revisor. Serve para ganhar consenso, tomar decisões, detectar anomalias, avaliar qualidade e considerar alternativas. A preparação individual antes da reunião é obrigatória, e a reunião é opcional.\n\n**Inspeção.** O tipo mais formal, segue um processo definido com saídas documentadas e papéis explicitamente definidos. O objetivo é encontrar o máximo possível de anomalias, e também avaliar qualidade, criar confiança, motivar autores a melhorar e **melhorar o processo de desenvolvimento**. A coleta de métricas e a melhoria do processo são características suas.",
                    },
                    {
                        type: "quote",
                        value: "Um detalhe fino: na **revisão técnica** a preparação individual é obrigatória e a reunião é opcional. No **walkthrough** acontece o contrário: a reunião é o centro e a preparação é opcional. Questões exploram exatamente essa inversão.",
                    },
                    {
                        type: "text",
                        value: "## Os fatores de sucesso\n\nO syllabus lista fatores de sucesso organizacionais e relacionados a pessoas. A prova pede tanto os fatores quanto o que **contraria** um deles.\n\n**Organizacionais:**\n- cada revisão tem objetivos claros, definidos no planejamento e usados como critério de saída mensurável;\n- o tipo de revisão é adequado para atingir os objetivos, é apropriado ao tipo e ao nível dos artefatos e adequado às pessoas envolvidas;\n- as técnicas de revisão são adequadas para encontrar defeitos efetivamente;\n- documentos grandes são preparados e revisados em pequenos pedaços, para que os revisores mantenham a concentração;\n- há tempo e recursos adequados;\n- a gerência apoia o processo de revisão.\n\n**Relacionados a pessoas:**\n- as pessoas certas estão envolvidas para atender aos objetivos;\n- revisores dedicam tempo adequado e atenção ao detalhe;\n- as revisões são realizadas em pequenos pedaços, para que os revisores não percam a concentração durante a revisão individual e a reunião;\n- as anomalias encontradas são reconhecidas, apreciadas e tratadas objetivamente;\n- a reunião é bem gerenciada, de modo que os participantes a considerem um bom uso do tempo;\n- a revisão é conduzida em uma atmosfera de confiança, e o resultado **não é usado para avaliar os participantes**;\n- os participantes evitam linguagem corporal e comportamentos que indiquem tédio, exasperação ou hostilidade;\n- há treinamento adequado, especialmente para os tipos mais formais;\n- há uma cultura de aprendizado e de melhoria de processo.",
                    },
                    {
                        type: "text",
                        value: "## Fixando o capítulo 3\n\nSão quatro pontos na prova. Se você guardar a tabela dos quatro tipos, a ordem das cinco atividades do processo, os papéis e a lista de defeitos que o estático encontra, os quatro pontos ficam bem prováveis.\n\nO erro mais comum aqui é confundir walkthrough com revisão técnica. A âncora: **walkthrough tem o autor conduzindo**, revisão técnica tem **pares qualificados com preparação obrigatória**.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual tipo de revisão é conduzido pelo autor do artefato?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Walkthrough.",
                                isCorrect: true,
                            },
                            {
                                text: "Inspeção, que é o tipo mais formal e possui papéis explicitamente definidos.",
                                isCorrect: false,
                            },
                            {
                                text: "Revisão técnica, conduzida por um facilitador ou por um dos revisores qualificados.",
                                isCorrect: false,
                            },
                            {
                                text: "Revisão informal, que não segue um processo definido nem documenta os resultados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na revisão técnica, a preparação individual e a reunião são obrigatórias?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A preparação é obrigatória e a reunião é opcional.",
                                isCorrect: true,
                            },
                            {
                                text: "A reunião é obrigatória e a preparação individual antes dela é considerada opcional.",
                                isCorrect: false,
                            },
                            {
                                text: "As duas são obrigatórias, porque o tipo exige rigor equivalente ao da inspeção.",
                                isCorrect: false,
                            },
                            {
                                text: "As duas são opcionais, ficando a critério do facilitador que conduz a atividade.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual característica é exclusiva da inspeção entre os tipos de revisão?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A coleta de métricas e o objetivo de melhorar o processo de desenvolvimento.",
                                isCorrect: true,
                            },
                            {
                                text: "A participação de revisores tecnicamente qualificados na análise do artefato.",
                                isCorrect: false,
                            },
                            {
                                text: "A existência de um facilitador que conduz a reunião e media as divergências.",
                                isCorrect: false,
                            },
                            {
                                text: "O objetivo de detectar anomalias no artefato que está sendo submetido à revisão.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual prática contraria um fator de sucesso das revisões?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Usar o resultado da revisão para avaliar o desempenho dos participantes.",
                                isCorrect: true,
                            },
                            {
                                text: "Dividir documentos grandes em pedaços menores para revisar aos poucos.",
                                isCorrect: false,
                            },
                            {
                                text: "Definir objetivos claros e mensuráveis durante o planejamento da revisão.",
                                isCorrect: false,
                            },
                            {
                                text: "Escolher o tipo de revisão adequado ao artefato e às pessoas envolvidas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a âncora sugerida para não confundir walkthrough com revisão técnica?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Walkthrough tem o autor conduzindo; a técnica tem pares com preparação obrigatória.",
                                isCorrect: true,
                            },
                            {
                                text: "Walkthrough é mais formal que a revisão técnica e exige papéis definidos por escrito.",
                                isCorrect: false,
                            },
                            {
                                text: "Walkthrough coleta métricas de processo e a revisão técnica apenas detecta anomalias.",
                                isCorrect: false,
                            },
                            {
                                text: "Walkthrough é conduzido por ferramenta e a revisão técnica é conduzida por pessoas.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Técnicas de projeto de teste",
        aulas: [
            {
                titulo: "As três categorias de técnica",
                blocks: [
                    {
                        type: "text",
                        value: "## O capítulo de maior peso\n\nO capítulo 4 vale **11 das 40 questões**, mais de um quarto da prova, e concentra as questões de **nível K3**, que pedem aplicação e não apenas reconhecimento. É aqui que a prova se ganha ou se perde.\n\nO syllabus organiza as técnicas em três categorias.",
                    },
                    {
                        type: "table",
                        value: '[["Categoria", "De onde deriva os testes", "Cobertura medida em"], ["Caixa-preta", "Análise da base de teste, sem estrutura interna", "Itens da base de teste, conforme a técnica"], ["Caixa-branca", "Estrutura interna e implementação", "Comandos, decisões e outros elementos do código"], ["Baseada em experiência", "Conhecimento e experiência de quem testa", "Não é formalmente medida"]]',
                    },
                    {
                        type: "text",
                        value: "## Caixa-preta\n\nAs técnicas de caixa-preta compartilham três características:\n\n- os testes são derivados da análise da base de teste apropriada;\n- os testes focam nas **entradas e saídas** do objeto de teste, sem referência à estrutura interna;\n- a cobertura é medida em relação aos itens testados na base de teste e à técnica aplicada.\n\nAs quatro técnicas de caixa-preta do syllabus são: **partição de equivalência**, **análise de valor limite**, **teste por tabela de decisão** e **teste de transição de estados**.",
                    },
                    {
                        type: "text",
                        value: "## Caixa-branca\n\nAs técnicas de caixa-branca compartilham:\n\n- os testes são derivados da estrutura interna ou da implementação do sistema;\n- a extensão da cobertura pode ser medida a partir dos testes existentes, e testes adicionais podem ser derivados sistematicamente para aumentá-la.\n\nAs duas técnicas de caixa-branca do syllabus são: **teste de comando** e **teste de ramo**.",
                    },
                    {
                        type: "text",
                        value: "## Baseada em experiência\n\nAs técnicas baseadas em experiência compartilham:\n\n- os testes são derivados do conhecimento e da experiência de quem testa;\n- as lacunas de cobertura das técnicas mais sistemáticas costumam ser bem exploradas por elas;\n- a eficácia depende muito das habilidades de quem testa.\n\nAs três técnicas do syllabus são: **suposição de erro**, **teste exploratório** e **teste baseado em checklist**.",
                    },
                    {
                        type: "quote",
                        value: "Guarde a contagem: **quatro** técnicas de caixa-preta, **duas** de caixa-branca e **três** baseadas em experiência. A prova pode pedir quantas ou quais pertencem a cada categoria.",
                    },
                ],
                questions: [
                    {
                        statement: "Quantas técnicas de caixa-preta o syllabus define?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Quatro.",
                                isCorrect: true,
                            },
                            {
                                text: "Duas, correspondentes ao teste de comando e ao teste de ramo do código-fonte.",
                                isCorrect: false,
                            },
                            {
                                text: "Três, correspondentes à suposição de erro, ao exploratório e ao checklist.",
                                isCorrect: false,
                            },
                            {
                                text: "Cinco, incluindo também as abordagens colaborativas de escrita de história de usuário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quais são as duas técnicas de caixa-branca definidas no syllabus?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Teste de comando e teste de ramo.",
                                isCorrect: true,
                            },
                            {
                                text: "Partição de equivalência e análise de valor limite aplicadas ao código-fonte.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de caminho e teste de condição múltipla combinados nos ramos possíveis.",
                                isCorrect: false,
                            },
                            {
                                text: "Análise estática e revisão técnica conduzida por pares tecnicamente qualificados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual característica é comum às técnicas baseadas em experiência?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A eficácia depende muito das habilidades de quem testa.",
                                isCorrect: true,
                            },
                            {
                                text: "A cobertura pode ser medida com precisão em relação aos itens da base de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Os testes são derivados da estrutura interna do sistema que está sendo verificado.",
                                isCorrect: false,
                            },
                            {
                                text: "Elas substituem as técnicas sistemáticas quando a especificação está completa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Onde as técnicas baseadas em experiência costumam ser mais valiosas?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Nas lacunas de cobertura deixadas pelas técnicas mais sistemáticas.",
                                isCorrect: true,
                            },
                            {
                                text: "Nos cenários já cobertos pelas técnicas de caixa-preta, aumentando a confiança.",
                                isCorrect: false,
                            },
                            {
                                text: "Na medição da cobertura de comando e de decisão atingida pela suíte existente.",
                                isCorrect: false,
                            },
                            {
                                text: "Na verificação dos critérios de aceitação acordados com as partes interessadas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o peso do capítulo de técnicas na prova?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "11 das 40 questões.",
                                isCorrect: true,
                            },
                            {
                                text: "9 das 40 questões, o mesmo peso do capítulo de gestão das atividades de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "8 das 40 questões, empatado com o capítulo de fundamentos do syllabus atual.",
                                isCorrect: false,
                            },
                            {
                                text: "6 das 40 questões, correspondendo ao capítulo de teste no ciclo de vida.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Partição de equivalência",
                blocks: [
                    {
                        type: "text",
                        value: "## A ideia\n\nA partição de equivalência divide os dados em **partições**, também chamadas de classes de equivalência, com base na premissa de que **todos os elementos de uma dada partição devem ser processados da mesma forma**.\n\nA teoria diz que basta um único teste para cobrir cada partição, porque se um valor da partição revela um defeito, os demais provavelmente revelariam o mesmo, e se um não revela, os demais provavelmente também não.",
                    },
                    {
                        type: "text",
                        value: "## Partições válidas e inválidas\n\nExistem dois tipos:\n\n**Partições válidas**: contêm valores que devem ser **aceitos** pelo componente ou sistema.\n\n**Partições inválidas**: contêm valores que devem ser **rejeitados**.\n\nO syllabus lembra que partições podem ser identificadas para qualquer elemento de dado relacionado ao objeto de teste, incluindo entradas, saídas, valores de configuração, valores internos, valores relacionados a tempo e parâmetros de interface.\n\nE há uma regra: as partições **podem ser divididas em sub-partições** quando necessário.",
                    },
                    {
                        type: "text",
                        value: "## Um exemplo trabalhado\n\nRegra: um sistema de matrícula aceita candidatos de **16 a 70 anos**. Abaixo de 16 recusa por idade mínima, acima de 70 recusa por idade máxima.\n\n**Partições válidas:**\n- 16 a 70: aceita.\n\n**Partições inválidas:**\n- menor que 16: recusa por mínima;\n- maior que 70: recusa por máxima;\n- valor não numérico;\n- campo vazio.\n\nUm representante de cada dá cinco casos de teste. A cobertura de 100% das partições exige exercitar cada partição identificada com pelo menos um caso.",
                    },
                    {
                        type: "table",
                        value: '[["Partição", "Tipo", "Representante", "Resultado esperado"], ["16 a 70", "Válida", "35", "Aceita a matrícula"], ["Menor que 16", "Inválida", "12", "Recusa por idade mínima"], ["Maior que 70", "Inválida", "80", "Recusa por idade máxima"], ["Não numérico", "Inválida", "abc", "Recusa por formato"], ["Vazio", "Inválida", "(em branco)", "Recusa por campo obrigatório"]]',
                    },
                    {
                        type: "quote",
                        value: "Uma regra que a prova cobra: para evitar mascaramento de defeito, as **partições inválidas devem ser testadas individualmente**, ou seja, sem serem combinadas com outras partições inválidas no mesmo caso.",
                    },
                    {
                        type: "text",
                        value: "## Como a cobertura é medida\n\nA cobertura é medida como o **número de partições exercitadas por pelo menos um caso de teste**, dividido pelo número total de partições identificadas, normalmente expresso em porcentagem.\n\nSe você identificou 5 partições e cobriu 4, a cobertura é de 80%. A prova pode pedir esse cálculo.\n\nE um cuidado: a cobertura é sobre as partições **identificadas**. Se a análise esqueceu uma partição, a cobertura pode ser de 100% e ainda assim haver lacuna. Isso conecta com o princípio de que o teste não prova ausência de defeitos.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a premissa da partição de equivalência?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Todos os elementos de uma partição devem ser processados da mesma forma.",
                                isCorrect: true,
                            },
                            {
                                text: "Os defeitos se concentram nos valores extremos de cada faixa definida pela regra.",
                                isCorrect: false,
                            },
                            {
                                text: "Cada combinação de condições precisa ser exercitada por pelo menos um caso de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "O comportamento do sistema depende do estado atual e do evento que ele recebe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um campo aceita valores de 16 a 70. Quantas partições existem, contando as inválidas de faixa?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Três: menor que 16, de 16 a 70, e maior que 70.",
                                isCorrect: true,
                            },
                            {
                                text: "Duas: os valores aceitos pela regra e os valores que são recusados pelo sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma: a faixa válida definida pela regra de negócio descrita no requisito.",
                                isCorrect: false,
                            },
                            {
                                text: "Quatro: incluindo também os dois valores exatos de fronteira como partições próprias.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma análise identificou 5 partições e os casos cobrem 4 delas. Qual é a cobertura?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "80%.",
                                isCorrect: true,
                            },
                            {
                                text: "100%, porque todas as partições válidas identificadas foram exercitadas pelos casos.",
                                isCorrect: false,
                            },
                            {
                                text: "50%, considerando apenas a proporção entre partições válidas e partições inválidas.",
                                isCorrect: false,
                            },
                            {
                                text: "Não é possível calcular sem saber quantos casos de teste foram executados no total.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que partições inválidas devem ser testadas individualmente?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Para evitar que uma validação mascare o defeito de outra.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o sistema pode travar ao receber mais de um valor inválido na mesma requisição.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a cobertura só é contabilizada quando cada caso exercita uma única partição.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque as ferramentas de automação não permitem enviar dois campos inválidos juntos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma suíte atinge 100% de cobertura de partições. O que ainda pode haver?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Lacuna, se a análise deixou de identificar alguma partição existente.",
                                isCorrect: true,
                            },
                            {
                                text: "Nada, porque cobrir todas as partições garante que o campo está livre de defeitos.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas defeitos de desempenho, que não são cobertos por técnicas de caixa-preta.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas defeitos de código morto, que só o teste de caixa-branca consegue revelar.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Análise de valor limite",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando a técnica se aplica\n\nA análise de valor limite (BVA) é uma **extensão** da partição de equivalência, mas **só pode ser usada quando a partição é ordenada e consiste em dados numéricos ou sequenciais**.\n\nOs valores mínimo e máximo de uma partição são seus **valores de fronteira**. A técnica se baseia na observação de que defeitos tendem a se concentrar próximos aos valores extremos.",
                    },
                    {
                        type: "text",
                        value: "## Duas variantes\n\nO syllabus define duas variantes, e a prova cobra a diferença.\n\n**BVA de dois valores**: para cada fronteira, existem **dois valores de teste**: o valor da fronteira e o valor vizinho mais próximo, pertencente à partição adjacente. A cobertura de 100% exige exercitar todos os valores de fronteira de todas as partições.\n\n**BVA de três valores**: para cada fronteira, existem **três valores de teste**: o valor da fronteira e **ambos os vizinhos**. A cobertura de 100% exige exercitar todos os valores de fronteira e seus vizinhos.\n\nO syllabus observa que a variante de três valores é **mais rigorosa**, porque pode detectar defeitos que a de dois valores não detectaria.",
                    },
                    {
                        type: "text",
                        value: "## Um exemplo trabalhado\n\nRegra: um campo aceita valores inteiros de **1 a 100**.\n\nAs fronteiras são 1 e 100.\n\n**BVA de dois valores:** para a fronteira 1, os valores são 0 e 1. Para a fronteira 100, os valores são 100 e 101. Total: **quatro valores** (0, 1, 100, 101).\n\n**BVA de três valores:** para a fronteira 1, os valores são 0, 1 e 2. Para a fronteira 100, os valores são 99, 100 e 101. Total: **seis valores** (0, 1, 2, 99, 100, 101).",
                    },
                    {
                        type: "table",
                        value: '[["Variante", "Por fronteira", "Campo de 1 a 100", "Total"], ["Dois valores", "Fronteira e o vizinho da partição adjacente", "0, 1 e 100, 101", "4"], ["Três valores", "Fronteira e ambos os vizinhos", "0, 1, 2 e 99, 100, 101", "6"]]',
                    },
                    {
                        type: "quote",
                        value: "Uma pegadinha frequente: com a variante de **dois valores**, o vizinho escolhido é o da **partição adjacente**, ou seja, o de fora. Com a de **três valores**, entram os dois vizinhos, de dentro e de fora.",
                    },
                    {
                        type: "text",
                        value: "## Um segundo exemplo, com decimais\n\nRegra: frete grátis para compras **a partir de R$ 200,00**. O sistema trabalha com duas casas decimais.\n\nA fronteira é 200,00. Com duas casas decimais, o vizinho mais próximo abaixo é 199,99 e o vizinho acima é 200,01.\n\n**BVA de dois valores:** 199,99 e 200,00.\n**BVA de três valores:** 199,99, 200,00 e 200,01.\n\nO detalhe importante: a **precisão do dado define o vizinho**. Se o sistema trabalhasse com inteiros, o vizinho abaixo de 200 seria 199. Questões costumam informar a precisão no enunciado, e ignorá-la leva à alternativa errada.",
                    },
                ],
                questions: [
                    {
                        statement: "Quando a análise de valor limite pode ser aplicada?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Quando a partição é ordenada e consiste em dados numéricos ou sequenciais.",
                                isCorrect: true,
                            },
                            {
                                text: "Sempre que existirem partições de equivalência identificadas para o campo analisado.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o comportamento do sistema depende da combinação de várias condições.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando a especificação está incompleta e é preciso explorar o comportamento real.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um campo aceita inteiros de 1 a 100. Quantos valores a BVA de dois valores exige?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Quatro.",
                                isCorrect: true,
                            },
                            {
                                text: "Seis, correspondentes a cada fronteira e a ambos os seus vizinhos imediatos.",
                                isCorrect: false,
                            },
                            {
                                text: "Dois, correspondentes apenas aos dois valores de fronteira definidos pela regra.",
                                isCorrect: false,
                            },
                            {
                                text: "Três, incluindo as duas fronteiras e um valor representativo do meio da faixa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Na BVA de dois valores, qual vizinho é escolhido?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O vizinho mais próximo pertencente à partição adjacente.",
                                isCorrect: true,
                            },
                            {
                                text: "O vizinho mais próximo dentro da mesma partição em que a fronteira se encontra.",
                                isCorrect: false,
                            },
                            {
                                text: "Ambos os vizinhos, de dentro e de fora da partição analisada pela técnica.",
                                isCorrect: false,
                            },
                            {
                                text: "Um valor qualquer da partição adjacente, desde que esteja fora da faixa válida.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A regra é frete grátis a partir de R$ 200,00, com duas casas decimais. Quais valores a BVA de três valores exige nessa fronteira?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "199,99, 200,00 e 200,01.",
                                isCorrect: true,
                            },
                            {
                                text: "199,00, 200,00 e 201,00, considerando os vizinhos inteiros da fronteira definida.",
                                isCorrect: false,
                            },
                            {
                                text: "199,99 e 200,00, que são a fronteira e o vizinho da partição adjacente a ela.",
                                isCorrect: false,
                            },
                            {
                                text: "100,00, 200,00 e 300,00, cobrindo um valor abaixo, a fronteira e um acima dela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Segundo o syllabus, qual variante é mais rigorosa?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A de três valores, porque pode detectar defeitos que a de dois não detecta.",
                                isCorrect: true,
                            },
                            {
                                text: "A de dois valores, porque força a verificação da partição adjacente à fronteira.",
                                isCorrect: false,
                            },
                            {
                                text: "As duas têm o mesmo rigor, mudando apenas a quantidade de casos executados.",
                                isCorrect: false,
                            },
                            {
                                text: "Depende do tipo de dado do campo que está sendo verificado pela técnica.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Tabela de decisão e transição de estados",
                blocks: [
                    {
                        type: "text",
                        value: "## Tabela de decisão\n\nO teste por tabela de decisão é eficaz para registrar **regras de negócio complexas** que um sistema precisa implementar.\n\nAo criar a tabela, identificam-se as **condições** (as entradas) e as **ações** resultantes (as saídas). Elas formam as linhas da tabela, normalmente com as condições em cima e as ações embaixo.\n\nCada **coluna** corresponde a uma regra de decisão: uma combinação única de condições que resulta na execução das ações associadas.",
                    },
                    {
                        type: "text",
                        value: "## Notação\n\nOs valores das condições e das ações usam notação própria, que a prova pode apresentar:\n\n- **V** ou **S** (verdadeiro, sim): a condição é satisfeita;\n- **F** ou **N** (falso, não): a condição não é satisfeita;\n- **X** ou **E**: a ação deve ocorrer;\n- **em branco**: a ação não deve ocorrer;\n- **traço**: o valor da condição é **irrelevante** para a ação, ou seja, tanto faz.\n\nUma tabela de decisão **completa** tem colunas suficientes para cobrir toda combinação de condições. Ela pode ser **simplificada** removendo colunas com combinações impossíveis e mesclando colunas em que a condição é irrelevante, o que produz a chamada tabela minimizada.",
                    },
                    {
                        type: "table",
                        value: '[["Condição / Ação", "R1", "R2", "R3", "R4"], ["Cliente é premium?", "S", "S", "N", "N"], ["Tem mais de um ano?", "S", "N", "S", "N"], ["Aplicar 20%", "X", "", "", ""], ["Aplicar 10%", "", "X", "", ""], ["Aplicar 5%", "", "", "X", ""], ["Sem desconto", "", "", "", "X"]]',
                    },
                    {
                        type: "text",
                        value: "## Cobertura na tabela de decisão\n\nO critério mínimo de cobertura é normalmente **ao menos um caso de teste por coluna** da tabela, o que inclui as combinações de condições consideradas.\n\nA força da técnica está em **expor combinações que a especificação não descreveu**. Ao montar a tabela completa, as colunas sem ação definida saltam aos olhos, e cada uma vira uma pergunta para o negócio.",
                    },
                    {
                        type: "quote",
                        value: "Uma pergunta clássica de prova: com **N condições binárias**, a tabela completa tem **2 elevado a N** colunas. Com 2 condições, 4 colunas; com 3, 8; com 4, 16.",
                    },
                    {
                        type: "text",
                        value: "## Teste de transição de estados\n\nUm **diagrama de transição de estados** modela o comportamento de um sistema mostrando seus possíveis estados e as transições válidas entre eles. Uma transição é iniciada por um **evento**, que pode ser qualificado por uma **condição de guarda**, e ela pode disparar uma **ação**.\n\nA mudança de estado costuma ser chamada de transição, e a **tabela de transição de estados** mostra todas as transições válidas e as potencialmente inválidas entre estados.",
                    },
                    {
                        type: "text",
                        value: "## Os critérios de cobertura de transição de estados\n\nO syllabus define dois critérios, e a diferença é cobrada:\n\n**Cobertura de todos os estados**: exige que todos os estados sejam visitados. É o critério mais fraco, e por isso costuma ser atingido com poucos testes.\n\n**Cobertura de transições válidas**, também chamada de cobertura de nível 0 de sequência: exige que **todas as transições válidas** sejam exercitadas. É o critério mais usado.\n\n**Cobertura de todas as transições**: exige exercitar todas as transições, **válidas e inválidas**.\n\nUm detalhe importante: atingir a cobertura de todos os estados **não garante** a cobertura de transições, porque um estado pode ser alcançado por um caminho e outras transições que levam a ele podem nunca ser exercitadas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Na notação de tabela de decisão, o que um traço na linha de uma condição indica?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que o valor da condição é irrelevante para a ação naquela coluna.",
                                isCorrect: true,
                            },
                            {
                                text: "Que a condição não foi satisfeita e a ação correspondente não deve ocorrer.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a combinação daquela coluna é impossível e deve ser removida da tabela.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a condição depende do resultado de outra condição listada acima dela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma regra tem 4 condições binárias. Quantas colunas tem a tabela de decisão completa?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "16.",
                                isCorrect: true,
                            },
                            {
                                text: "8, correspondentes ao dobro da quantidade de condições envolvidas na regra descrita.",
                                isCorrect: false,
                            },
                            {
                                text: "4, uma coluna para cada condição que participa da regra de negócio especificada.",
                                isCorrect: false,
                            },
                            {
                                text: "32, resultado de elevar a quantidade de condições ao quadrado e dobrar o total.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a maior contribuição da tabela de decisão?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Expor combinações que a especificação não descreveu.",
                                isCorrect: true,
                            },
                            {
                                text: "Reduzir a quantidade de casos de teste em relação à partição de equivalência.",
                                isCorrect: false,
                            },
                            {
                                text: "Medir a cobertura de decisão atingida no código que implementa a regra de negócio.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificar o comportamento do sistema conforme a sequência de eventos recebidos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que qualifica uma transição em um diagrama de estados, além do evento?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma condição de guarda.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma ação disparada obrigatoriamente antes que a transição possa acontecer.",
                                isCorrect: false,
                            },
                            {
                                text: "Um estado intermediário criado para representar a mudança em andamento no fluxo.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma coluna da tabela de decisão associada à regra de negócio correspondente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que a cobertura de todos os estados não garante a cobertura de transições?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque um estado pode ser alcançado por um caminho, deixando outras transições sem exercitar.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque estados e transições são elementos independentes e não possuem relação entre si.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a cobertura de estados considera apenas as transições que foram consideradas inválidas.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque nem todo estado do modelo pode ser alcançado durante a execução dos casos de teste.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Caixa-branca: cobertura de comando e de decisão",
                blocks: [
                    {
                        type: "text",
                        value: "## Duas técnicas e duas métricas\n\nO syllabus define duas técnicas de caixa-branca, cada uma com sua métrica de cobertura. Esta aula concentra as questões de aplicação mais frequentes da prova.\n\n**Teste de comando** exercita os **comandos executáveis** do código. A cobertura de comando é a porcentagem de comandos exercitados pelos testes.\n\n**Teste de ramo** exercita os **ramos** do código. Um ramo é uma transferência de controle entre dois nós no grafo de fluxo de controle, e mostra as sequências possíveis em que os comandos podem ser executados. A cobertura de ramo é a porcentagem de ramos exercitados.",
                    },
                    {
                        type: "text",
                        value: "## A relação entre as duas\n\nEste é um dos pontos mais cobrados do capítulo:\n\n**Cobertura de ramo de 100% garante cobertura de comando de 100%.** Exercitar todos os ramos necessariamente executa todos os comandos alcançáveis.\n\n**O contrário não vale.** É possível executar todos os comandos sem exercitar todos os ramos.\n\nO exemplo clássico é um `se` sem `senão`: um único caso com a condição verdadeira executa todos os comandos, mas deixa o ramo falso sem exercitar.",
                    },
                    {
                        type: "code",
                        value: "se (saldo > 0) entao\n    liberar()\nfim\nregistrar()",
                    },
                    {
                        type: "text",
                        value: "Com um caso em que `saldo` vale 100:\n\n- **Cobertura de comando: 100%.** Os comandos `liberar()` e `registrar()` foram executados.\n- **Cobertura de ramo: 50%.** Só o ramo verdadeiro foi exercitado; o falso, que pula direto para `registrar()`, não.\n\nPara chegar a 100% de cobertura de ramo, é preciso um segundo caso com `saldo` igual a zero ou negativo.",
                    },
                    {
                        type: "quote",
                        value: "A regra prática para a prova: conte os **comandos executáveis** para a cobertura de comando, e conte os **resultados possíveis de cada decisão** para a cobertura de ramo. Um `se` sem `senão` ainda tem dois ramos.",
                    },
                    {
                        type: "text",
                        value: "## Um exemplo com decisão composta\n\nConsidere o trecho a seguir e a pergunta: quantos casos bastam para 100% de cobertura de ramo?",
                    },
                    {
                        type: "code",
                        value: "se (idade >= 18 e possuiCarteira) entao\n    aprovar()\nsenao\n    recusar()\nfim",
                    },
                    {
                        type: "text",
                        value: 'A resposta é **dois**: um caso em que a decisão composta resulta verdadeira e outro em que resulta falsa.\n\nCobrir as quatro combinações das duas condições individuais seria **cobertura de condição múltipla**, um critério mais forte que o syllabus de nível fundamental **não exige**. Alternativas que respondem "quatro" exploram exatamente essa confusão.',
                    },
                    {
                        type: "text",
                        value: "## O valor do teste de caixa-branca\n\nO syllabus destaca dois pontos que a prova cobra:\n\n**Quando o teste de caixa-branca é feito no nível de sistema**, ele pode revelar código que não é exercitado por nenhum teste derivado da especificação. Isso ajuda a encontrar código não desejado, como código morto ou até código malicioso.\n\n**Quando é feito no nível de componente**, ele leva em conta toda a implementação, o que permite descobrir defeitos mesmo quando a especificação está **vaga, desatualizada ou incompleta**.\n\nOu seja, a caixa-branca não depende da qualidade da especificação, que é justamente o ponto fraco das técnicas de caixa-preta.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual relação entre cobertura de comando e de ramo está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Cobertura de ramo de 100% garante cobertura de comando de 100%.",
                                isCorrect: true,
                            },
                            {
                                text: "Cobertura de comando de 100% garante cobertura de ramo de 100% no mesmo conjunto.",
                                isCorrect: false,
                            },
                            {
                                text: "As duas coberturas são sempre iguais quando o código não possui laços de repetição.",
                                isCorrect: false,
                            },
                            {
                                text: "As duas são independentes e nenhuma delas implica a outra em nenhuma situação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um trecho tem um se sem senão. Um caso com a condição verdadeira executa todos os comandos. Quais são as coberturas?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Comando 100% e ramo 50%.",
                                isCorrect: true,
                            },
                            {
                                text: "Comando 100% e ramo 100%, já que todos os comandos do trecho foram executados.",
                                isCorrect: false,
                            },
                            {
                                text: "Comando 50% e ramo 50%, porque apenas um dos caminhos possíveis foi exercitado.",
                                isCorrect: false,
                            },
                            {
                                text: "Comando 50% e ramo 100%, porque a decisão foi avaliada durante aquela execução.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um trecho tem se (A e B) entao ... senao ... fim. Quantos casos bastam para 100% de cobertura de ramo?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Dois.",
                                isCorrect: true,
                            },
                            {
                                text: "Quatro, uma para cada combinação possível das duas condições que formam a decisão.",
                                isCorrect: false,
                            },
                            {
                                text: "Três, cobrindo o caminho verdadeiro, o falso e um valor de fronteira para a idade.",
                                isCorrect: false,
                            },
                            {
                                text: "Um, desde que o caso escolhido percorra o caminho de aprovação previsto pela regra.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que o teste de caixa-branca no nível de sistema pode revelar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Código não exercitado por nenhum teste da especificação, como código morto.",
                                isCorrect: true,
                            },
                            {
                                text: "Defeitos de desempenho que só aparecem quando o sistema recebe carga elevada.",
                                isCorrect: false,
                            },
                            {
                                text: "Requisitos ambíguos que geraram interpretações diferentes durante a construção.",
                                isCorrect: false,
                            },
                            {
                                text: "Combinações de regras de negócio que a especificação deixou de descrever.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a vantagem do teste de caixa-branca quando a especificação está incompleta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ele considera toda a implementação, então não depende da qualidade da especificação.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele deriva os casos das partições de equivalência identificadas no requisito escrito.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele mede a cobertura em relação aos itens da base de teste que foram documentados.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele exige menos esforço de análise do que as técnicas de caixa-preta equivalentes.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Gestão do teste e ferramentas",
        aulas: [
            {
                titulo: "Técnicas baseadas em experiência e colaborativas",
                blocks: [
                    {
                        type: "text",
                        value: "## As três técnicas baseadas em experiência\n\n**Suposição de erro.** Antecipa a ocorrência de erros, defeitos e falhas com base no conhecimento de quem testa: como a aplicação funcionou no passado, que tipos de erro quem desenvolve tende a cometer, e falhas ocorridas em outras aplicações. Uma abordagem metódica para essa técnica é criar uma **lista de possíveis erros, defeitos e falhas** e projetar testes que os exponham. Essas listas podem vir de experiência, de dados de defeitos e falhas, ou de conhecimento comum sobre por que software falha.\n\n**Teste exploratório.** Testes são projetados, executados e avaliados **simultaneamente**, enquanto se aprende sobre o objeto de teste. Os resultados são usados para aprender mais e para criar os testes seguintes. É mais útil quando há **poucas especificações ou especificações inadequadas**, e quando há **forte pressão de tempo**. Serve também para complementar outras técnicas mais formais. Costuma ser conduzido como **teste baseado em sessões**, dentro de um intervalo definido, com uma **carta de teste** que traz os objetivos, e com **notas de sessão** registrando os passos e as descobertas.\n\n**Teste baseado em checklist.** Os testes são projetados, implementados e executados para cobrir as condições de teste de um checklist. Os checklists podem ser construídos com base em experiência, em conhecimento sobre o que é importante para o usuário, ou no entendimento de por que e como o software falha. Os itens costumam ser formulados como perguntas, e cada item deve poder ser checado separadamente e de forma direta.",
                    },
                    {
                        type: "quote",
                        value: "O syllabus registra dois pontos sobre checklists: eles **crescem com o tempo**, o que pode gerar itens redundantes e listas grandes demais, e por isso precisam de manutenção regular. Além disso, como os itens são de alto nível, pode haver **variação nos resultados** entre execuções diferentes.",
                    },
                    {
                        type: "text",
                        value: "## As abordagens colaborativas\n\nO syllabus dedica uma seção às abordagens de teste baseadas em colaboração, que focam em **prevenir defeitos** por meio da colaboração e da comunicação, e não em detectá-los.\n\n**Escrita colaborativa de história de usuário.** Uma história de usuário representa uma funcionalidade que será valiosa para quem usa ou compra o sistema. Ela tem três elementos críticos, conhecidos como os **três Cs**: **cartão** (o meio que descreve a história), **conversa** (a explicação de como o software será usado) e **confirmação** (os critérios de aceitação).\n\nO formato mais comum é: **como [papel], quero [meta], para que [benefício]**. As histórias devem incluir as características funcionais e as não funcionais, e cada uma precisa de critérios de aceitação.\n\nA escrita colaborativa costuma usar técnicas como brainstorming e mapa mental, e a colaboração garante um entendimento compartilhado do que deve ser entregue. Uma abordagem comum é a dos **três amigos**: negócio (define o problema), desenvolvimento (define como resolver) e teste (questiona o que pode dar errado e explora possibilidades).",
                    },
                    {
                        type: "text",
                        value: "## Critérios de aceitação\n\nOs critérios de aceitação de uma história são as condições que a implementação deve atender para ser aceita pelas partes interessadas. Podem ser vistos como as **condições de teste** que devem ser satisfeitas.\n\nO syllabus cita os usos: definir o escopo da história, chegar a consenso entre as partes interessadas, descrever cenários positivos e negativos, servir de base para o teste de aceitação e permitir planejamento e estimativa precisos.\n\nDois formatos comuns:\n\n**Orientado a cenário**, no estilo dado, quando e então, vindo do desenvolvimento orientado a comportamento;\n\n**Orientado a regra**, em forma de lista com marcadores ou como uma tabela de verificação de entrada e saída.\n\nO syllabus alerta que a maioria dos critérios pode ser escrita nos dois formatos, e que a escolha depende do contexto e da preferência das partes envolvidas.",
                    },
                    {
                        type: "text",
                        value: "## ATDD\n\nNo ATDD, os testes são criados **antes** da implementação da história. São criados por representantes do negócio, por quem desenvolve e por quem testa, durante uma oficina de especificação colaborativa, e podem estar em formato de linguagem natural ou em formato executável.\n\nA oficina primeiro chega a um entendimento comum, listando as características da história e resolvendo ambiguidades. Depois, os testes são criados: **primeiro para o caminho mais provável**, ou caminho feliz, e depois para **casos negativos** e para **características não funcionais**, como usabilidade e desempenho.\n\nAs frases de teste devem ser expressas em linguagem natural compreensível pelas partes interessadas, contendo as pré-condições necessárias, as entradas e os resultados esperados.",
                    },
                ],
                questions: [
                    {
                        statement: "Quais são os três Cs de uma história de usuário?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Cartão, conversa e confirmação.",
                                isCorrect: true,
                            },
                            {
                                text: "Contexto, condição e consequência descritos no formato de cenário estruturado.",
                                isCorrect: false,
                            },
                            {
                                text: "Critério, caso e cobertura definidos durante a modelagem dos testes da história.",
                                isCorrect: false,
                            },
                            {
                                text: "Cliente, construção e conclusão, correspondendo às três fases de entrega da história.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quando o teste exploratório é mais útil, segundo o syllabus?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Quando há poucas especificações ou elas são inadequadas, e há pressão de tempo.",
                                isCorrect: true,
                            },
                            {
                                text: "Quando a especificação está completa e atualizada, permitindo derivar casos formais.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o sistema já passou por várias iterações e a suíte de regressão está madura.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando é necessário medir a cobertura de comando e de decisão do código construído.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "No ATDD, qual é a ordem de criação dos testes?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Primeiro o caminho feliz, depois os negativos e as características não funcionais.",
                                isCorrect: true,
                            },
                            {
                                text: "Primeiro os casos negativos, porque concentram a maior parte dos defeitos do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Primeiro as características não funcionais, que são mais caras de corrigir depois.",
                                isCorrect: false,
                            },
                            {
                                text: "Em qualquer ordem, desde que todos sejam criados antes do início da implementação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o problema típico dos checklists ao longo do tempo?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Crescem e acumulam itens redundantes, exigindo manutenção regular.",
                                isCorrect: true,
                            },
                            {
                                text: "Tornam-se específicos demais e deixam de se aplicar a telas novas do produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Passam a exigir conhecimento do código-fonte por parte de quem os executa.",
                                isCorrect: false,
                            },
                            {
                                text: "Deixam de permitir que os itens sejam verificados de forma direta e separada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o foco das abordagens de teste baseadas em colaboração?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Prevenir defeitos por meio de colaboração e comunicação.",
                                isCorrect: true,
                            },
                            {
                                text: "Detectar defeitos mais cedo, aumentando a eficácia da revisão dos artefatos.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar a cobertura da base de teste com casos derivados de forma sistemática.",
                                isCorrect: false,
                            },
                            {
                                text: "Reduzir o custo do teste ao distribuir a execução entre os membros da equipe.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Planejamento, estimativa e priorização",
                blocks: [
                    {
                        type: "text",
                        value: "## O capítulo de gestão\n\nO capítulo 5 vale **9 das 40 questões**, o segundo maior peso. Ele cobre planejamento, risco, monitoramento, gestão de configuração e gestão de defeitos.\n\nUm **plano de teste** descreve os objetivos, os recursos e os processos de um projeto de teste. Ele documenta os meios e o cronograma para atingir os objetivos, ajuda a garantir que as atividades atendam aos critérios estabelecidos, e serve como meio de comunicação com os membros da equipe e com outras partes interessadas.\n\nO syllabus destaca que o processo de planejar ajuda a **considerar o futuro**, a lidar com os desafios relacionados a objetivos, técnicas, tarefas, pessoas e recursos, e a chegar a acordos.",
                    },
                    {
                        type: "text",
                        value: "## O conteúdo típico do plano\n\n- contexto do teste, como escopo, objetivos e restrições;\n- premissas e restrições do projeto de teste;\n- partes interessadas, como papéis, responsabilidades, relevância para o teste e necessidades de contratação e treinamento;\n- comunicação, incluindo formas e frequência;\n- registro de riscos, com riscos de produto e de projeto;\n- abordagem de teste, com níveis, tipos, técnicas, entregáveis, critérios de entrada e saída, independência, métricas, gestão de defeitos e dados;\n- orçamento e cronograma.",
                    },
                    {
                        type: "text",
                        value: "## Critérios de entrada e de saída\n\n**Critérios de entrada** definem as pré-condições para começar uma atividade. Se não forem atendidos, é provável que a atividade seja mais difícil, cara e demorada. Exemplos típicos: disponibilidade de recursos, testware e ambiente, e nível de qualidade inicial suficiente.\n\n**Critérios de saída** definem o que deve ser atingido para declarar a atividade concluída. Exemplos: medidas de completude, como cobertura atingida, critérios de completude, como quantidade de defeitos em aberto, e critérios de custo, prazo e risco.\n\nEm desenvolvimento ágil, os critérios de saída costumam ser chamados de **definição de pronto** e os de entrada de **definição de preparado**.",
                    },
                    {
                        type: "quote",
                        value: "Um detalhe que a prova cobra: **acabar o tempo alocado ou acabar o orçamento também são critérios de saída válidos**, desde que as partes interessadas tenham revisado e aceitado o risco de liberar sem mais testes.",
                    },
                    {
                        type: "text",
                        value: "## Técnicas de estimativa\n\nQuatro técnicas aparecem no syllabus, e a prova cobra pelo nome e pelo cálculo.\n\n**Estimativa baseada em rateio.** Usa dados de projetos anteriores, permitindo comparar com o esforço médio gasto em trabalho semelhante.\n\n**Estimativa baseada em opinião de especialista.** A experiência de quem detém o papel estima o esforço das tarefas.\n\n**Estimativa de três pontos.** Usa três valores: o mais otimista (a), o mais provável (m) e o mais pessimista (b). A estimativa é **E = (a + 4m + b) / 6**, e a margem de erro é **(b - a) / 6**.\n\n**Planning poker.** Técnica baseada em sabedoria da multidão, em que a equipe estima em conjunto com cartas e discute as divergências até convergir.",
                    },
                    {
                        type: "text",
                        value: "## Um cálculo de três pontos\n\nCom a = 6, m = 9 e b = 18:\n\nE = (6 + 4×9 + 18) / 6 = (6 + 36 + 18) / 6 = 60 / 6 = **10 horas**.\n\nMargem de erro = (18 - 6) / 6 = 12 / 6 = **2 horas**.\n\nResultado: a estimativa é de 10 horas, com margem de 2 horas, ou seja, entre 8 e 12 horas. A prova pode pedir a estimativa, a margem ou o intervalo.",
                    },
                    {
                        type: "text",
                        value: "## Priorização, pirâmide e quadrantes\n\n**Priorização de casos de teste.** Três estratégias: **baseada em risco**, executando primeiro os que cobrem os riscos mais importantes; **baseada em cobertura**, executando primeiro os que dão maior cobertura; e **baseada em requisito**, seguindo a prioridade dos requisitos definida pelas partes interessadas. Idealmente executam-se em ordem de prioridade, mas as **dependências entre casos** podem obrigar a executar um de menor prioridade antes.\n\n**Pirâmide de testes.** Modelo que mostra que testes de granularidades diferentes existem em quantidades diferentes. Quanto **mais baixo** o nível, mais isolados, rápidos e numerosos. Quanto **mais alto**, mais integrados, lentos e em menor quantidade.\n\n**Quadrantes de teste.** Agrupam níveis e tipos conforme dois eixos: **voltado ao negócio ou à tecnologia**, e **apoiar a equipe** (guiar o desenvolvimento) ou **criticar o produto** (avaliar o construído). Ajudam a garantir que todos os tipos e níveis relevantes estejam contemplados.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma tarefa foi estimada em 4 horas no otimista, 6 no provável e 14 no pessimista. Qual é a estimativa de três pontos?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "7 horas.",
                                isCorrect: true,
                            },
                            {
                                text: "8 horas, correspondentes à média aritmética simples entre os três valores informados.",
                                isCorrect: false,
                            },
                            {
                                text: "6 horas, correspondentes ao cenário mais provável apontado por quem fez a estimativa.",
                                isCorrect: false,
                            },
                            {
                                text: "9 horas, somando ao cenário provável metade da diferença entre os dois extremos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em desenvolvimento ágil, como os critérios de entrada costumam ser chamados?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Definição de preparado.",
                                isCorrect: true,
                            },
                            {
                                text: "Definição de pronto, que estabelece quando o incremento pode ser considerado concluído.",
                                isCorrect: false,
                            },
                            {
                                text: "Critérios de aceitação, acordados com quem cuida do produto durante o refinamento.",
                                isCorrect: false,
                            },
                            {
                                text: "Meta da iteração, definida pela equipe no início do ciclo de desenvolvimento atual.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Acabar o orçamento alocado pode ser um critério de saída válido?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Sim, desde que as partes interessadas revisem e aceitem o risco de liberar assim.",
                                isCorrect: true,
                            },
                            {
                                text: "Não, porque critérios de saída precisam tratar apenas de cobertura e de defeitos.",
                                isCorrect: false,
                            },
                            {
                                text: "Não, porque o orçamento é uma restrição de projeto e não um critério de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, e não é necessário comunicar a decisão às partes interessadas do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que a pirâmide de testes representa sobre os níveis mais baixos?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "São mais isolados, mais rápidos e mais numerosos.",
                                isCorrect: true,
                            },
                            {
                                text: "São mais integrados, mais lentos e existem em menor quantidade na suíte do time.",
                                isCorrect: false,
                            },
                            {
                                text: "São executados por quem desenvolve, enquanto os altos ficam com a equipe de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Cobrem requisitos de negócio, enquanto os altos cobrem requisitos técnicos do sistema.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que pode obrigar a executar um caso de menor prioridade antes de um de maior?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "As dependências entre os casos de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "A quantidade de defeitos que cada caso encontrou nas execuções anteriores da suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "O tempo de execução de cada caso, começando sempre pelos mais rápidos disponíveis.",
                                isCorrect: false,
                            },
                            {
                                text: "A preferência de quem executa, para manter a produtividade ao longo da jornada.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Gestão de risco",
                blocks: [
                    {
                        type: "text",
                        value: "## A definição\n\n**Risco** é um fator que pode resultar em consequências futuras negativas. O **nível de risco** é determinado pela combinação de dois fatores:\n\n- a **probabilidade** de o evento acontecer;\n- o **impacto**, ou seja, o dano provocado caso ele aconteça.\n\nA gestão de risco envolve análise de risco e controle de risco, e o teste baseado em risco usa essa análise para orientar o esforço.",
                    },
                    {
                        type: "text",
                        value: "## Risco de produto e risco de projeto\n\n**Risco de produto** se relaciona a características de qualidade do produto. Exemplos citados pelo syllabus: o software pode não satisfazer as necessidades ou expectativas dos usuários, pode causar dano financeiro, ambiental ou à saúde de pessoas, pode ter problemas de integridade e segurança de dados, ou pode não cumprir requisitos legais.\n\n**Risco de projeto** se relaciona à gestão e ao controle do projeto. Exemplos: atraso de entregas, estimativas imprecisas, mudanças de escopo, problemas organizacionais como falta de pessoal ou de treinamento, problemas políticos, questões técnicas como requisitos mal definidos, e problemas com fornecedores.",
                    },
                    {
                        type: "table",
                        value: '[["Situação", "Tipo de risco"], ["O cálculo de juros pode produzir valor incorreto", "Produto"], ["O ambiente de teste pode não ficar pronto na data", "Projeto"], ["O sistema pode não suportar o pico de acessos", "Produto"], ["A pessoa-chave da equipe pode sair do projeto", "Projeto"], ["Dados pessoais podem ser expostos", "Produto"], ["O fornecedor pode não entregar o componente contratado", "Projeto"]]',
                    },
                    {
                        type: "quote",
                        value: "A âncora para não errar: se a frase descreve algo que o **software** faz de errado, é risco de produto. Se descreve algo que **o projeto** faz de errado, é risco de projeto.",
                    },
                    {
                        type: "text",
                        value: "## Análise e controle de risco de produto\n\nA **análise de risco de produto** consiste em identificar e avaliar os riscos. Ela determina o nível de cada um pela probabilidade e pelo impacto, e o resultado orienta:\n\n- a **extensão** do teste;\n- o **nível de detalhe** do teste;\n- a **prioridade** de execução;\n- se técnicas adicionais devem ser aplicadas;\n- se revisões independentes são necessárias.\n\nO **controle de risco de produto** compreende as medidas tomadas em resposta aos riscos identificados, com quatro opções que a prova cobra:\n\n- **mitigar**, reduzindo probabilidade ou impacto, por exemplo escolhendo pessoas com a experiência adequada e aplicando as técnicas de teste apropriadas;\n- **aceitar**, decidindo conviver com o risco;\n- **transferir**, repassando a responsabilidade a outra parte;\n- **preparar um plano de contingência**, para acionar caso o risco se materialize.",
                    },
                    {
                        type: "text",
                        value: "## Um ponto que a prova cobra\n\nO syllabus é explícito: a análise de risco de produto deve ser realizada de forma **iterativa** ao longo do projeto.\n\nRiscos novos surgem, riscos existentes mudam de nível e riscos deixam de existir conforme o produto evolui. Tratar a análise como atividade única do início faz o teste ser orientado por uma foto desatualizada da realidade.",
                    },
                ],
                questions: [
                    {
                        statement: "Como o nível de risco é determinado?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Pela combinação entre a probabilidade do evento e o impacto que ele causaria.",
                                isCorrect: true,
                            },
                            {
                                text: "Pela quantidade de defeitos encontrados naquela área nas entregas anteriores.",
                                isCorrect: false,
                            },
                            {
                                text: "Pelo custo estimado de corrigir os defeitos que permanecem abertos na versão.",
                                isCorrect: false,
                            },
                            {
                                text: "Pelo tempo restante no cronograma antes da data acordada para a entrega final.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            '"Estimativas imprecisas e mudanças de escopo" são exemplos de qual tipo de risco?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Risco de projeto.",
                                isCorrect: true,
                            },
                            {
                                text: "Risco de produto, porque afetam a qualidade do que será entregue ao cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Risco residual, que sobra depois que os testes planejados foram executados.",
                                isCorrect: false,
                            },
                            {
                                text: "Risco técnico, tratado exclusivamente pela equipe de desenvolvimento do sistema.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Contratar um seguro ou repassar a responsabilidade a outra parte corresponde a qual medida de controle?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Transferir.",
                                isCorrect: true,
                            },
                            {
                                text: "Mitigar, reduzindo a probabilidade ou o impacto do risco que foi identificado.",
                                isCorrect: false,
                            },
                            {
                                text: "Aceitar, decidindo conviver com o risco e registrar formalmente essa decisão.",
                                isCorrect: false,
                            },
                            {
                                text: "Preparar plano de contingência para acionar caso o risco venha a se materializar.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o resultado da análise de risco de produto orienta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A extensão, o nível de detalhe e a prioridade do teste, entre outras decisões.",
                                isCorrect: true,
                            },
                            {
                                text: "A quantidade exata de defeitos que serão encontrados durante a execução da suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "A severidade e a prioridade que serão atribuídas a cada defeito registrado.",
                                isCorrect: false,
                            },
                            {
                                text: "Os critérios de entrada que precisam ser cumpridos antes de a execução começar.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com que frequência a análise de risco de produto deve ser realizada?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "De forma iterativa ao longo do projeto.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma única vez, no início, para servir de base ao plano de teste do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "A cada defeito de severidade crítica encontrado durante a execução dos testes.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas quando o escopo do projeto sofrer alteração aprovada pelas partes interessadas.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Monitoramento, relatórios, configuração e defeitos",
                blocks: [
                    {
                        type: "text",
                        value: "## Monitoramento e controle\n\nO **monitoramento de teste** se preocupa em coletar informação sobre o teste, e serve para avaliar o progresso e medir se os critérios de saída foram satisfeitos.\n\nO **controle de teste** usa essa informação para dar orientações e tomar ações corretivas, de modo a alcançar um teste mais eficaz e eficiente.\n\nExemplos de ações de controle citados: repriorizar testes quando um risco se materializa, reavaliar se um item atende aos critérios de entrada ou saída por causa de retrabalho, e ajustar o cronograma conforme a disponibilidade do ambiente.",
                    },
                    {
                        type: "text",
                        value: "## Métricas usadas em teste\n\nO syllabus lista categorias de métricas, e a prova pergunta por elas:\n\n- **métricas de progresso do projeto**, como tarefas concluídas, uso de recursos e esforço;\n- **métricas de progresso do teste**, como implementação de casos, preparação do ambiente, número de testes executados, passados e falhados;\n- **métricas de qualidade do produto**, como disponibilidade, tempo de resposta e tempo médio até falha;\n- **métricas de defeito**, como quantidade e prioridade dos defeitos encontrados e corrigidos, densidade e taxa de detecção;\n- **métricas de risco**, como nível de risco residual;\n- **métricas de cobertura**, como cobertura de requisitos, de código ou de risco;\n- **métricas de custo**, como custo do teste e custo organizacional da qualidade.",
                    },
                    {
                        type: "text",
                        value: "## Os dois relatórios\n\n**Relatório de progresso de teste.** Apoia o controle contínuo do teste e deve fornecer informação suficiente para modificações no cronograma, nos recursos ou no plano. É normalmente emitido em base regular, com o status das atividades e do progresso, impedimentos, testes planejados para o período seguinte, e a qualidade do objeto de teste.\n\n**Relatório de conclusão de teste.** É preparado quando um projeto, um nível ou um ciclo de teste é concluído, idealmente quando os critérios de saída são atingidos. Traz um resumo do que foi realizado, uma avaliação do teste conduzido em relação a critérios, e os desvios em relação ao plano.\n\nEm ambos os casos, o conteúdo varia conforme **o objeto de teste, as necessidades do projeto e o ciclo de vida**. A comunicação deve ser adaptada ao público.",
                    },
                    {
                        type: "quote",
                        value: "Duas frases que resolvem questões: o relatório de **progresso** apoia o **controle contínuo**; o de **conclusão** resume um ciclo **encerrado**. E os dois se adaptam ao público que vai lê-los.",
                    },
                    {
                        type: "text",
                        value: "## Gestão de configuração\n\nA gestão de configuração dá disciplina para identificar e controlar os itens de teste, os objetos de teste e o testware. Ela garante que, ao longo do ciclo, todos esses itens sejam:\n\n- **identificados de forma única**;\n- **versionados**;\n- **rastreados** quanto às mudanças;\n- **relacionados entre si**, de modo que a rastreabilidade possa ser mantida ao longo do processo.\n\nSem isso, quem testa não sabe qual versão está testando, e os resultados deixam de ser reproduzíveis.",
                    },
                    {
                        type: "text",
                        value: "## Gestão de defeitos\n\nAnomalias podem ser relatadas em qualquer fase do ciclo de vida, e a forma de relato depende do contexto. Um processo de gestão de defeitos deve ser estabelecido, incluindo o **fluxo de trabalho** para lidar com itens individuais desde a descoberta até o encerramento, e as **regras de classificação**.\n\nOs objetivos de um relatório de defeito são:\n\n- fornecer a quem for lidar com ele informação suficiente para resolver o problema;\n- fornecer meios de acompanhar a qualidade do objeto de teste;\n- fornecer ideias para melhorar o processo de desenvolvimento e de teste.\n\nO conteúdo típico inclui: identificador, título e resumo curto, data do relato, autor e papel, identificação do objeto de teste e do ambiente, contexto do defeito como o caso de teste executado, descrição da falha para reproduzir e resolver, incluindo passos, logs e capturas, resultados esperados e obtidos, severidade, prioridade, status, referências e conclusões e recomendações.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a diferença entre monitoramento e controle de teste?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Monitoramento coleta informação; controle usa a informação para agir.",
                                isCorrect: true,
                            },
                            {
                                text: "Monitoramento é feito pela gerência e controle pela equipe técnica de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Monitoramento acontece no fim do ciclo e controle durante toda a execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Monitoramento trata do produto e controle trata do processo de trabalho da equipe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: '"Tempo médio até falha" pertence a qual categoria de métrica?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Métricas de qualidade do produto.",
                                isCorrect: true,
                            },
                            {
                                text: "Métricas de progresso do teste, que acompanham a execução dos casos planejados.",
                                isCorrect: false,
                            },
                            {
                                text: "Métricas de defeito, que medem quantidade, densidade e taxa de detecção de defeitos.",
                                isCorrect: false,
                            },
                            {
                                text: "Métricas de risco, que acompanham o nível de risco residual ao longo do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quando o relatório de conclusão de teste é preparado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Quando um projeto, nível ou ciclo termina, ao atingir os critérios de saída.",
                                isCorrect: true,
                            },
                            {
                                text: "Periodicamente durante a execução, para apoiar o controle contínuo das atividades.",
                                isCorrect: false,
                            },
                            {
                                text: "Sempre que um defeito de severidade crítica é encontrado durante a execução do ciclo.",
                                isCorrect: false,
                            },
                            {
                                text: "No início do projeto, junto com o plano de teste aprovado pelas partes interessadas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que a gestão de configuração garante em relação ao testware?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Identificação única, versionamento, rastreamento de mudanças e relação entre itens.",
                                isCorrect: true,
                            },
                            {
                                text: "Que todos os artefatos de teste sejam automatizados e executados no pipeline do time.",
                                isCorrect: false,
                            },
                            {
                                text: "Que os defeitos encontrados sejam registrados com severidade e prioridade adequadas.",
                                isCorrect: false,
                            },
                            {
                                text: "Que os critérios de entrada e de saída sejam cumpridos antes de cada execução.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é um objetivo do relatório de defeito, segundo o syllabus?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Fornecer ideias para melhorar o processo de desenvolvimento e de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Registrar quem introduziu o defeito para orientar a avaliação de desempenho.",
                                isCorrect: false,
                            },
                            {
                                text: "Decidir se a versão pode ser liberada para o ambiente de produção da empresa.",
                                isCorrect: false,
                            },
                            {
                                text: "Substituir a comunicação verbal entre a equipe de teste e a de desenvolvimento.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Ferramentas, automação e o dia da prova",
                blocks: [
                    {
                        type: "text",
                        value: "## O capítulo 6\n\nO capítulo de ferramentas vale apenas **2 das 40 questões**, e o syllabus estima 20 minutos de estudo. É o menor peso da prova, e não vale investir muito tempo nele.\n\nAs ferramentas dão apoio a várias atividades, e o syllabus agrupa por finalidade:\n\n- gestão de teste e de requisitos;\n- gestão de defeitos;\n- gestão de configuração;\n- análise estática;\n- modelagem e implementação de teste;\n- execução e comparação de resultados;\n- medição de cobertura;\n- teste não funcional, como desempenho;\n- ferramentas de DevOps, que apoiam o pipeline de entrega;\n- colaboração;\n- escalabilidade e padronização da implantação;\n- apoio a necessidades específicas, como acessibilidade.",
                    },
                    {
                        type: "text",
                        value: "## Benefícios e riscos da automação\n\n**Benefícios:**\n- economia de tempo, reduzindo o trabalho manual repetitivo;\n- prevenção de erros humanos simples, por maior consistência e repetibilidade;\n- avaliação mais objetiva, por exemplo de cobertura;\n- acesso mais fácil à informação sobre o teste, com estatísticas e gráficos.\n\n**Riscos:**\n- expectativas irreais sobre os benefícios da ferramenta;\n- estimativas imprecisas do tempo, custo e esforço para introduzir a ferramenta e para manter os ativos de teste;\n- uso da ferramenta quando o teste manual seria mais apropriado;\n- dependência excessiva da ferramenta, esquecendo a importância do raciocínio humano;\n- necessidade de manter os ativos de teste conforme o objeto de teste evolui;\n- comprometimento da portabilidade e da compatibilidade quando a ferramenta é abandonada ou substituída.",
                    },
                    {
                        type: "quote",
                        value: "O ponto mais cobrado deste capítulo: a automação **não substitui o raciocínio humano** e **não conserta um processo ruim**. Alternativas que afirmam o contrário são distratores.",
                    },
                    {
                        type: "text",
                        value: "## Chegamos ao fim: o que você construiu\n\nSete módulos atrás, o objetivo era claro: passar no CTFL. Vale olhar o mapa completo.",
                    },
                    {
                        type: "table",
                        value: '[["Capítulo", "Peso na prova", "Onde está na trilha"], ["1. Fundamentos de teste", "8 questões", "Módulos 1 e 2"], ["2. Teste no ciclo de vida", "6 questões", "Módulos 3 e 4"], ["3. Teste estático", "4 questões", "Módulo 5"], ["4. Análise e modelagem", "11 questões", "Módulo 6 e a primeira aula do 7"], ["5. Gestão das atividades", "9 questões", "Módulo 7"], ["6. Ferramentas", "2 questões", "Módulo 7"]]',
                    },
                    {
                        type: "text",
                        value: '## O plano para o dia da prova\n\n**Antes.** Faça o simulado da plataforma quantas vezes precisar. Ele tem 100 questões no banco e sorteia 40 por tentativa, com a mesma distribuição por capítulo da prova real, então cada tentativa é diferente. Use o filtro de assuntos para treinar só os capítulos em que você errou mais. A meta é passar dos 65% com folga em tentativas seguidas, não uma vez por sorte.\n\n**Estratégia de tempo.** São 60 minutos para 40 questões, ou seja, 1,5 minuto por questão. Faça uma primeira passada respondendo tudo que você sabe de imediato e marcando as difíceis. Volte às marcadas com o tempo que sobrar. Nunca deixe questão em branco: não há penalidade por erro, e um chute educado vale mais que nada.\n\n**Leitura da questão.** Leia o enunciado até o fim antes das alternativas. Preste atenção em palavras como "NÃO", "EXCETO" e "MELHOR", que invertem ou restringem o que está sendo pedido. Desconfie de alternativas com "sempre", "nunca", "garante" e "elimina": o syllabus raramente afirma em termos absolutos.\n\n**Nos cálculos.** As questões de aplicação estão concentradas no capítulo 4: cobertura de comando e de ramo, valores de fronteira, colunas de tabela de decisão, e a fórmula de três pontos no capítulo 5. Refaça a conta antes de marcar, porque os distratores costumam ser exatamente o resultado do erro comum.',
                    },
                    {
                        type: "quote",
                        value: "Se você chegou até aqui e está acertando o simulado com folga, você está pronto. A prova cobra exatamente o que está no syllabus, sem pegadinha fora do escopo. Boa prova.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o peso do capítulo de ferramentas na prova?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "2 das 40 questões.",
                                isCorrect: true,
                            },
                            {
                                text: "9 das 40 questões, o mesmo peso do capítulo que trata da gestão das atividades.",
                                isCorrect: false,
                            },
                            {
                                text: "4 das 40 questões, empatado com o capítulo que trata do teste estático no syllabus.",
                                isCorrect: false,
                            },
                            {
                                text: "6 das 40 questões, correspondendo ao capítulo de teste no ciclo de vida de software.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é um risco da automação citado no syllabus?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Dependência excessiva da ferramenta, esquecendo o raciocínio humano.",
                                isCorrect: true,
                            },
                            {
                                text: "Redução da consistência da execução em comparação com a execução manual.",
                                isCorrect: false,
                            },
                            {
                                text: "Impossibilidade de coletar métricas objetivas sobre a cobertura alcançada.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumento do trabalho manual repetitivo executado pela equipe de qualidade.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quanto tempo em média você tem por questão na prova?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Cerca de 1,5 minuto.",
                                isCorrect: true,
                            },
                            {
                                text: "Cerca de 3 minutos, considerando os 120 minutos totais previstos para o exame.",
                                isCorrect: false,
                            },
                            {
                                text: "Cerca de 1 minuto, já que a prova tem 60 questões para serem respondidas em 60 minutos.",
                                isCorrect: false,
                            },
                            {
                                text: "Cerca de 2 minutos, contando com o tempo adicional concedido a todos os candidatos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual estratégia a aula recomenda para questões difíceis durante a prova?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Marcar e voltar depois, sem deixar nenhuma questão em branco ao final.",
                                isCorrect: true,
                            },
                            {
                                text: "Resolver na ordem, sem avançar até ter certeza da resposta de cada questão.",
                                isCorrect: false,
                            },
                            {
                                text: "Deixar em branco quando houver dúvida, para evitar penalidade por resposta errada.",
                                isCorrect: false,
                            },
                            {
                                text: "Responder sempre a alternativa mais longa, que costuma conter mais detalhes técnicos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que refazer a conta nas questões de aplicação?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque os distratores costumam ser o resultado do erro mais comum.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o tempo disponível permite conferir todas as questões da prova duas vezes.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque as questões de cálculo valem mais pontos do que as demais no exame oficial.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a calculadora não é permitida e o cálculo mental é mais sujeito a falha.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: "iniciante",
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.");
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

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
