// Seed da trilha Fundamentos de QA (iniciante). Idempotente e não
// destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-fundamentos-qa.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Fundamentos de QA";
const DESCRICAO =
    "Trilha de entrada em qualidade de software e teste para quem começa do zero: o que é qualidade e o papel de QA, os princípios e o processo de teste, os níveis e os tipos de teste funcionais e não funcionais, as técnicas de projeto de caso, o dia a dia com casos, defeitos e evidências, QA em times ágeis com Scrum, Kanban e BDD, e a ponte para a automação de testes.";
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
        titulo: "Módulo 1 - Qualidade de software e o papel do QA",
        aulas: [
            {
                titulo: "O que é qualidade de software",
                blocks: [
                    {
                        type: "text",
                        value: '# O que é qualidade de software\n\nSeja bem-vindo à sua primeira trilha de **QA**. Se você chegou aqui achando que testar software é clicar em telas até algo quebrar, prepare-se para mudar de ideia. Testar é uma disciplina com técnica, vocabulário próprio e um jeito de pensar que se aprende. E a gente vai começar do absoluto zero.\n\nAntes de falar de teste, precisamos falar de **qualidade**, porque testar é só um dos meios de chegar nela. E qualidade é uma palavra traiçoeira: todo mundo acha que sabe o que é, mas cada um pensa numa coisa diferente.\n\nPergunte a cinco pessoas de um time o que é um software de qualidade e você provavelmente vai ouvir cinco respostas: "é um software sem bugs", "é um software rápido", "é um código limpo", "é um software que o cliente gosta", "é um software que não cai". Nenhuma está errada. Todas estão incompletas.',
                    },
                    {
                        type: "text",
                        value: "## Qualidade é atender a quem usa\n\nA definição que a área usa há décadas é mais simples e mais exigente do que parece: **qualidade é o grau em que um produto atende às necessidades de quem vai usá-lo**.\n\nRepare no que essa frase faz. Ela tira o centro de gravidade do código e coloca na pessoa. Um sistema pode ter zero bugs, rodar em milissegundos e ainda assim ser de baixa qualidade, porque resolve o problema errado. E um sistema pode ter um punhado de defeitos pequenos e ser considerado excelente, porque faz muito bem exatamente aquilo de que as pessoas precisam.\n\nUm exemplo do dia a dia: imagine um aplicativo de banco que nunca trava, responde instantaneamente e tem uma tela de transferência tão confusa que metade dos usuários desiste no meio. Ele tem defeito? Tecnicamente, nenhum. Tem qualidade? Não.",
                    },
                    {
                        type: "quote",
                        value: "**Qualidade** é o grau em que um produto atende às necessidades de quem vai usá-lo. Não é ausência de bugs, não é código bonito e não é velocidade. Bugs, código e desempenho são **meios**; a necessidade atendida é o **fim**.",
                    },
                    {
                        type: "text",
                        value: "## As duas metades da qualidade\n\nPara não ficar no abstrato, a área costuma dividir qualidade em duas metades, e você vai reencontrar essa divisão a trilha inteira.\n\nA **qualidade externa** é o que a pessoa que usa consegue perceber: a tela faz o que promete, o sistema aguenta a black friday, os dados dela ficam protegidos, ela consegue usar sem manual. É a qualidade que o cliente sente.\n\nA **qualidade interna** é o que só quem mexe no código percebe: o quanto o sistema é fácil de entender, de alterar e de testar. O cliente nunca vê isso diretamente, mas sente o efeito com o tempo. Sistema com qualidade interna ruim é aquele em que toda mudança pequena demora semanas e quebra outra coisa.\n\nAs duas se sustentam. Qualidade interna ruim vira, mais cedo ou mais tarde, qualidade externa ruim: o time fica lento, os defeitos se multiplicam, e o produto para de evoluir no ritmo que o negócio precisa.",
                    },
                    {
                        type: "table",
                        value: '[["Metade", "Quem percebe", "Exemplos", "Se estiver ruim"], ["Qualidade externa", "Quem usa o produto", "Funciona, é rápido, é seguro, é fácil de usar", "O cliente reclama, cancela ou vai para o concorrente"], ["Qualidade interna", "Quem constrói o produto", "Código legível, arquitetura clara, fácil de testar", "O time entrega devagar e quebra coisas ao mudar"]]',
                    },
                    {
                        type: "text",
                        value: '## O triângulo que todo projeto enfrenta\n\nExiste uma tensão que você vai encontrar em toda empresa: **escopo, prazo e custo** puxam para um lado, e a qualidade fica no meio.\n\nQuando o prazo aperta, alguém sempre sugere "corta o teste que a gente entrega na sexta". A qualidade vira a variável de ajuste, porque é a única que não aparece no contrato. O problema é que ela não some: ela é **adiada**. O que não foi testado agora vira chamado de suporte, correção de emergência e retrabalho no mês que vem, quase sempre mais caro.\n\nParte do trabalho de QA é justamente tornar esse custo visível antes que ele aconteça. Não para dizer "não pode entregar", mas para que a decisão de entregar seja tomada com os riscos na mesa, e não no escuro.',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** qualidade é atender à necessidade de quem usa, e tem duas metades que se sustentam (externa e interna). Ela vive sob pressão de prazo e custo, e o papel de QA começa aqui: deixar visível o risco de cada decisão, para o time escolher com informação em vez de torcer.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual das opções descreve melhor o que é qualidade de software?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O grau em que o produto atende às necessidades de quem vai usá-lo.",
                                isCorrect: true,
                            },
                            {
                                text: "A ausência total de defeitos no código entregue para produção.",
                                isCorrect: false,
                            },
                            {
                                text: "A quantidade de testes automatizados que o time consegue escrever.",
                                isCorrect: false,
                            },
                            {
                                text: "A velocidade de resposta do sistema medida em cada requisição.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um aplicativo é rápido, estável e não apresenta defeitos, mas os usuários não conseguem concluir a tarefa principal porque a tela é confusa. Como classificar isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "É um problema de qualidade, porque o produto não atende à necessidade de quem usa.",
                                isCorrect: true,
                            },
                            {
                                text: "Não é um problema de qualidade, já que nenhum defeito técnico foi encontrado no sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "É um problema apenas de design, sem qualquer relação com o trabalho de QA no projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "É um problema de qualidade interna, porque afeta a estrutura do código construído.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que caracteriza a qualidade interna de um software?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O quanto o sistema é fácil de entender, alterar e testar por quem o constrói.",
                                isCorrect: true,
                            },
                            {
                                text: "O quanto o sistema agrada quem usa em termos de aparência e facilidade.",
                                isCorrect: false,
                            },
                            {
                                text: "O tempo que o sistema leva para responder às requisições feitas pelo cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "A quantidade de funcionalidades que o produto oferece em relação ao concorrente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que qualidade interna ruim acaba virando um problema para o cliente, mesmo que ele nunca veja o código?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque o time fica lento e quebra outras partes a cada mudança feita.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o cliente consegue inspecionar o código-fonte do produto que contratou.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o navegador exibe um aviso quando o código está mal organizado internamente.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a lei obriga as empresas a divulgar métricas internas de código dos produtos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quando o prazo aperta e o time corta a etapa de teste para entregar na data, o que costuma acontecer com a qualidade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ela é adiada, e o custo reaparece depois como suporte e retrabalho.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela é eliminada em definitivo, sem gerar nenhum efeito posterior no projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela aumenta, porque a pressão de prazo faz a equipe se concentrar melhor no essencial.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela fica inalterada, já que testar não influencia o resultado final entregue ao cliente.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "QA, QC e teste: três coisas diferentes",
                blocks: [
                    {
                        type: "text",
                        value: '## Três palavras que o mercado embaralha\n\nVocê vai ver vagas com o título "Analista de QA" pedindo alguém para "executar testes", e vai ver gente chamando de "QA" a pessoa que só encontra bugs. Na prática do mercado brasileiro esses termos se misturam bastante, e tudo bem. Mas entender a diferença muda a forma como você trabalha, porque cada um resolve um problema distinto.\n\nVamos separar os três com uma analogia de restaurante.',
                    },
                    {
                        type: "text",
                        value: '## A analogia do restaurante\n\nImagine uma cozinha que produz pratos.\n\nO **teste** é provar a comida antes de mandar para a mesa. É a atividade concreta: você pega o prato pronto, experimenta, e diz se está bom ou se falta sal. É pontual, acontece depois que o prato existe.\n\nO **controle de qualidade (QC)** é o conjunto de conferências sobre o produto pronto: provar a comida, checar a temperatura, ver se o prato foi montado como o cardápio promete, olhar se a apresentação está certa. QC olha para o **produto**, procurando defeitos antes que o cliente encontre.\n\nA **garantia da qualidade (QA)** é cuidar do **processo** para que o prato saia bom desde o começo: definir a receita, treinar a equipe, comprar ingrediente bom, organizar a cozinha, medir onde os erros acontecem com mais frequência e mudar o jeito de trabalhar. QA olha para o processo, e a pergunta dela não é "esse prato está bom?", e sim "por que pratos ruins conseguem sair daqui?".',
                    },
                    {
                        type: "table",
                        value: '[["Sigla", "Nome", "Foco", "Pergunta típica", "Quando age"], ["Teste", "Teste", "Uma execução", "Este caso passa ou falha?", "Depois que existe algo para executar"], ["QC", "Controle de qualidade", "O produto", "Este produto tem defeitos?", "Sobre o produto construído"], ["QA", "Garantia da qualidade", "O processo", "Por que defeitos surgem aqui?", "Do início ao fim, o tempo todo"]]',
                    },
                    {
                        type: "text",
                        value: "## Por que a diferença importa na prática\n\nUm time que só faz teste corrige bugs para sempre, um por um, sem nunca reduzir a quantidade que aparece. É enxugar gelo.\n\nUm time que faz QA olha para o padrão: se toda semana aparece um defeito de cálculo de desconto, o problema não é o defeito daquela semana. É que a regra de desconto não está clara em lugar nenhum, e cada pessoa implementa de um jeito. A correção de QA não é abrir um bug, é escrever a regra num lugar único, revisar os critérios de aceitação antes de codar e combinar exemplos com quem pediu a funcionalidade.\n\nPor isso se diz que **QA é preventivo e QC é detectivo**. Um evita que o defeito nasça; o outro encontra o defeito que já nasceu. Um bom trabalho de qualidade usa os dois: prevenir o que der, e detectar o que escapar.",
                    },
                    {
                        type: "quote",
                        value: "**QA** é preventivo e olha o **processo**. **QC** é detectivo e olha o **produto**. **Teste** é a atividade concreta de executar e verificar. Na vaga de emprego eles vêm embaralhados, mas no seu trabalho a diferença define se você vai enxugar gelo ou fechar a torneira.",
                    },
                    {
                        type: "text",
                        value: "## E onde entra a pessoa de QA no time?\n\nNa maioria dos times ágeis brasileiros, a mesma pessoa faz um pouco dos três. De manhã ela revisa os critérios de aceitação de uma história antes do desenvolvimento começar (isso é QA), à tarde executa os testes da funcionalidade que ficou pronta (isso é teste e QC), e na retrospectiva propõe mudar o jeito de escrever histórias porque metade dos bugs vem de requisito ambíguo (QA de novo).\n\nO que muda com o tempo de carreira é a proporção. Quem está começando passa mais tempo executando e reportando. Quem tem mais experiência passa mais tempo influenciando o processo, porque descobre que é ali que a quantidade de defeitos realmente cai.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o foco principal da garantia da qualidade (QA)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O processo de trabalho, para evitar que os defeitos apareçam.",
                                isCorrect: true,
                            },
                            {
                                text: "O produto pronto, para encontrar os defeitos antes do cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "A execução dos casos de teste planejados para cada entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "O registro dos bugs encontrados durante a fase de homologação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma pessoa executa a funcionalidade pronta, confere se o cálculo está correto e registra o que encontrou. Que atividade ela está fazendo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Controle de qualidade, porque está inspecionando o produto construído.",
                                isCorrect: true,
                            },
                            {
                                text: "Garantia da qualidade, porque está atuando sobre o processo do time.",
                                isCorrect: false,
                            },
                            {
                                text: "Gestão de configuração, porque está registrando versões do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Análise de requisitos, porque está conferindo o que foi pedido pelo cliente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Todo mês aparecem defeitos no cálculo de desconto, sempre por interpretações diferentes da mesma regra. Qual atitude é de QA, e não de QC?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Documentar a regra num lugar único e revisar os critérios antes de desenvolver.",
                                isCorrect: true,
                            },
                            {
                                text: "Abrir um bug detalhado, com passos e evidências, para cada erro de desconto encontrado.",
                                isCorrect: false,
                            },
                            {
                                text: "Repetir a bateria de testes de desconto a cada nova versão publicada.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar a quantidade de cenários de desconto executados na homologação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'A frase "QA é preventivo e QC é detectivo" significa que:',
                        difficulty: "medio",
                        options: [
                            {
                                text: "QA age para o defeito não nascer e QC encontra o que já nasceu.",
                                isCorrect: true,
                            },
                            {
                                text: "QA investiga a causa dos bugs e QC previne que eles voltem a acontecer depois.",
                                isCorrect: false,
                            },
                            {
                                text: "QA cuida da segurança do sistema e QC cuida do desempenho da aplicação entregue.",
                                isCorrect: false,
                            },
                            {
                                text: "QA só atua antes do código e QC só atua depois que o produto entra em produção.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, o que tende a mudar na atuação de uma pessoa de QA conforme ela ganha experiência?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ela passa mais tempo influenciando o processo e menos apenas executando.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela para de executar testes e passa a cuidar somente da automação da suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela troca a área de qualidade pela área de desenvolvimento de funcionalidades.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela deixa de participar das cerimônias do time para focar em documentação técnica.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O dia a dia de quem trabalha com QA",
                blocks: [
                    {
                        type: "text",
                        value: '## Uma semana realista\n\nNada explica melhor uma profissão do que ver o que ela faz de segunda a sexta. Vamos acompanhar uma pessoa de QA num time de produto que entrega a cada duas semanas.\n\n**Segunda.** O time está refinando as histórias da próxima sprint. A pessoa de QA lê cada uma e faz perguntas antes de qualquer linha de código existir: "e se o CPF já estiver cadastrado?", "o que acontece se o pagamento cair no meio?", "esse limite de 500 é por dia ou por transação?". Metade dessas perguntas vira um critério de aceitação novo. Cada pergunta feita aqui é um bug que não vai existir.\n\n**Terça.** Com as histórias fechadas, ela desenha os casos de teste. Não são cem cenários: são os que cobrem o comportamento esperado, os limites e os caminhos de erro. Enquanto isso, o desenvolvimento começa.\n\n**Quarta.** A primeira funcionalidade fica pronta. Ela executa os casos planejados, e depois faz o que nenhum roteiro cobre: sai explorando. Testa o que ninguém pensou, tenta usar de um jeito errado, aperta duas vezes o botão. Encontra dois problemas e registra cada um com passos, resultado esperado e resultado obtido.\n\n**Quinta.** Os bugs voltam corrigidos. Ela **reteste** o que foi corrigido e roda uma **regressão** no que já funcionava, porque correção é o momento mais provável de quebrar outra coisa.\n\n**Sexta.** Sprint review, e depois a retrospectiva. Ela leva um dado: dos sete bugs da sprint, cinco vieram de requisito ambíguo. A proposta não é testar mais, é refinar melhor.',
                    },
                    {
                        type: "quote",
                        value: "Repare no padrão da semana: a pessoa de QA aparece **antes** do código (perguntando), **durante** (planejando e executando) e **depois** (medindo e propondo mudança de processo). Quem só entra no fim vira um funil, e o time inteiro trava esperando a aprovação.",
                    },
                    {
                        type: "text",
                        value: "## As atividades que se repetem\n\nTirando o roteiro da semana, o trabalho se organiza em algumas frentes que sempre voltam:\n\n- **Analisar requisitos**: ler o que foi pedido e caçar ambiguidade, contradição e caso não previsto.\n- **Planejar**: decidir o que será testado, com qual profundidade e com qual risco aceito.\n- **Projetar casos de teste**: transformar a regra em cenários concretos e reproduzíveis.\n- **Executar**: rodar o que foi planejado, manualmente ou de forma automatizada.\n- **Explorar**: usar o sistema com liberdade, procurando o que o roteiro não previu.\n- **Reportar**: registrar defeitos de um jeito que o desenvolvedor consiga reproduzir e corrigir.\n- **Reteste e regressão**: confirmar a correção e verificar que nada mais quebrou.\n- **Comunicar risco**: dizer com clareza o que está e o que não está coberto, para a decisão de subir ser consciente.",
                    },
                    {
                        type: "text",
                        value: "## O que NÃO é papel de QA\n\nVale desfazer três mal-entendidos comuns, porque eles atrapalham a carreira de quem está entrando.\n\n**QA não é o dono da qualidade.** A qualidade é do time inteiro. Quem escreve o código tem a maior influência sobre ela. A pessoa de QA é quem cuida para que a qualidade seja discutida, medida e visível, não quem carrega o problema sozinha.\n\n**QA não é o portão que aprova ou reprova a entrega.** A decisão de subir uma versão é do time e do produto, com base em risco. O papel de QA é fornecer a informação boa o suficiente para que essa decisão não seja um chute.\n\n**QA não é digitador de bug.** Encontrar defeito é consequência, não o objetivo. O objetivo é reduzir risco. Um time que mede o valor de QA pela quantidade de bugs abertos está incentivando exatamente o comportamento errado.",
                    },
                    {
                        type: "table",
                        value: '[["Momento", "Atividade típica", "Valor que gera"], ["Antes do código", "Revisar requisito e critérios de aceitação", "Evita o defeito na origem, quando é mais barato"], ["Durante o desenvolvimento", "Projetar casos e preparar dados de teste", "Chega pronto quando a funcionalidade fica pronta"], ["Depois de pronto", "Executar, explorar e reportar", "Encontra o que escapou antes de chegar ao cliente"], ["Depois da entrega", "Medir origem dos defeitos e propor ajuste", "Reduz a quantidade de defeitos da próxima vez"]]',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** o trabalho de QA acontece nos três tempos (antes, durante e depois), e o entregável não é uma lista de bugs. É **informação de risco** para o time decidir melhor.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Na segunda-feira, a pessoa de QA lê as histórias e pergunta o que acontece se o CPF já estiver cadastrado. Qual é o principal valor dessa atividade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Evita um defeito antes do código existir, quando corrigir é mais barato.",
                                isCorrect: true,
                            },
                            {
                                text: "Adianta a execução dos casos de teste que seriam rodados depois na sprint.",
                                isCorrect: false,
                            },
                            {
                                text: "Documenta o sistema para quem for dar manutenção no futuro do produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Reduz a quantidade de reuniões que o time precisa fazer durante a sprint atual.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre reteste e regressão?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Reteste confirma a correção; regressão verifica se o resto continua funcionando.",
                                isCorrect: true,
                            },
                            {
                                text: "Reteste roda a suíte inteira; regressão roda apenas o cenário que falhou antes.",
                                isCorrect: false,
                            },
                            {
                                text: "Reteste é feito pelo desenvolvedor; regressão é feita sempre pela equipe de QA.",
                                isCorrect: false,
                            },
                            {
                                text: "Reteste acontece em produção; regressão acontece apenas no ambiente de homologação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um gestor propõe medir o desempenho da equipe de QA pela quantidade de bugs abertos por mês. Qual o problema dessa métrica?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Ela incentiva encontrar defeitos em vez de reduzir risco e preveni-los.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela é difícil de coletar, porque a ferramenta de bugs não gera esse relatório mensal.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela penaliza a equipe de desenvolvimento, que passa a receber cobranças indevidas do gestor.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela só funciona em projetos grandes, com muitas pessoas trabalhando na mesma entrega.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que a aula afirma que QA não é o dono da qualidade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque a qualidade é do time inteiro, e quem escreve o código influencia mais.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a responsabilidade formal pela qualidade pertence ao gerente de projeto da área.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque QA atua apenas depois da entrega, quando não há mais como influenciar o produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a qualidade é definida por contrato e não pode ser alterada pela equipe técnica.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na retrospectiva, QA mostra que cinco dos sete bugs da sprint vieram de requisito ambíguo. Qual proposta faz mais sentido?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Melhorar o refinamento das histórias, atacando a origem dos defeitos.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumentar o tempo de execução de testes no fim de cada sprint do time.",
                                isCorrect: false,
                            },
                            {
                                text: "Contratar mais pessoas para a equipe de qualidade cobrir mais cenários por sprint.",
                                isCorrect: false,
                            },
                            {
                                text: "Adiar a entrega da próxima sprint até que todos os bugs antigos sejam corrigidos.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O custo do defeito e por que testar cedo",
                blocks: [
                    {
                        type: "text",
                        value: "## O mesmo defeito, preços diferentes\n\nExiste um fato incômodo e muito bem documentado na engenharia de software: **quanto mais tarde um defeito é encontrado, mais caro ele fica**. E não é um pouco mais caro. A diferença é de ordem de grandeza.\n\nPense num requisito mal escrito. Se alguém percebe a ambiguidade na reunião de refinamento, o custo é uma conversa de dez minutos. Se ninguém percebe, o desenvolvedor implementa o entendimento dele, e agora corrigir custa reescrever o código. Se passa pelo teste, chega em produção: agora custa investigar o chamado, reproduzir, corrigir, testar de novo, publicar às pressas, corrigir os dados que ficaram errados no banco e responder aos clientes que reclamaram. O mesmo mal-entendido de dez minutos virou dois dias de várias pessoas.",
                    },
                    {
                        type: "table",
                        value: '[["Onde o defeito é encontrado", "O que custa corrigir", "Custo relativo"], ["Refinamento do requisito", "Uma conversa e um ajuste no texto", "1x"], ["Durante o desenvolvimento", "Reescrever um trecho antes de terminar", "Poucas vezes mais"], ["No teste, antes de subir", "Corrigir, retestar e rodar regressão", "Bem mais caro"], ["Em produção", "Investigar, corrigir às pressas, arrumar dados, atender clientes", "Muitas vezes mais"]]',
                    },
                    {
                        type: "text",
                        value: "## Por que a conta cresce tanto\n\nTrês coisas se somam a cada etapa que o defeito atravessa.\n\nPrimeiro, o **retrabalho aumenta**: no começo você muda uma frase; no fim você muda código, teste, documentação e dados já gravados.\n\nSegundo, **mais pessoas se envolvem**: o defeito em produção não ocupa só o desenvolvedor. Ocupa suporte, produto, às vezes jurídico, e para a fila de todo mundo que ia trabalhar em outra coisa.\n\nTerceiro, aparece o **custo que não está na fatura**: cliente que desiste da compra, reputação arranhada, time interrompido no meio de outra entrega. Esse é o mais caro e o que ninguém consegue medir direito.",
                    },
                    {
                        type: "quote",
                        value: "Isso é o que se chama de **shift left**: mover as atividades de qualidade para a **esquerda** da linha do tempo do projeto, o mais perto possível do início. Não é testar mais, é testar **antes**.",
                    },
                    {
                        type: "text",
                        value: "## Shift left na prática\n\nShift left virou palavra da moda, mas as ações concretas são bem pé no chão:\n\n- **Revisar o requisito antes de codar.** Ler a história com olhos de quem procura ambiguidade é a atividade de teste mais barata que existe, e ela nem executa o sistema.\n- **Combinar exemplos antes do desenvolvimento.** Em vez de discutir a regra no abstrato, escrever três exemplos concretos com números reais. É impressionante quantos desentendimentos aparecem nessa hora.\n- **Automatizar o que dá para verificar cedo.** Teste unitário roda em segundos, na máquina de quem programa, antes de qualquer coisa subir.\n- **Testar durante, e não depois.** Se a funcionalidade só é testada quando a sprint inteira já acabou, o feedback chega tarde demais para ser barato.\n\nUm detalhe importante: shift left **não elimina** o teste no fim. Ele reduz a quantidade de coisas que chegam lá. Você ainda vai testar o sistema montado, ainda vai fazer regressão, ainda vai explorar. Só que com muito menos surpresa.",
                    },
                    {
                        type: "text",
                        value: "## O outro lado: o risco de exagerar\n\nTestar cedo é bom, mas existe um limite prático. Não dá para prever tudo antes de existir sistema, e tentar prever demais atrasa o começo do trabalho sem reduzir risco de verdade. Requisito escrito com quarenta páginas de detalhe não previne defeito, ele só muda o lugar onde o mal-entendido acontece.\n\nO equilíbrio saudável é: gaste tempo antecipando o que tem **alto risco** (regra de dinheiro, cadastro que não pode duplicar, integração com sistema externo) e aceite descobrir depois o que tem **baixo risco** (o texto de um aviso, a ordem de uma listagem). Priorizar risco é o que separa antecipação útil de burocracia.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Por que corrigir um defeito encontrado em produção costuma custar muito mais do que corrigi-lo no refinamento?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Porque envolve mais retrabalho, mais pessoas e prejuízos que não aparecem na fatura.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque as ferramentas usadas em produção são mais caras do que as de desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a legislação brasileira exige multa para todo defeito que chega ao cliente final.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o código de produção é diferente do código usado no ambiente de testes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que significa shift left em qualidade de software?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Antecipar as atividades de qualidade para o início do ciclo de desenvolvimento.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumentar a quantidade de testes executados na última semana antes da entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "Transferir a responsabilidade dos testes da equipe de QA para a de desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "Priorizar os testes de interface em vez dos testes que verificam regras de negócio.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual das ações abaixo é o exemplo mais barato de atividade de teste, por não exigir nem executar o sistema?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Revisar o requisito procurando ambiguidade antes do desenvolvimento começar.",
                                isCorrect: true,
                            },
                            {
                                text: "Executar os casos de teste planejados assim que a funcionalidade fica pronta.",
                                isCorrect: false,
                            },
                            {
                                text: "Rodar a suíte automatizada de regressão no ambiente de integração contínua.",
                                isCorrect: false,
                            },
                            {
                                text: "Explorar o sistema livremente procurando comportamentos não previstos no roteiro.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um time adota shift left e passa a revisar requisitos e automatizar testes unitários. O que acontece com os testes feitos no fim do ciclo?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Continuam existindo, mas com menos surpresas chegando até eles.",
                                isCorrect: true,
                            },
                            {
                                text: "Deixam de ser necessários, já que os defeitos foram todos evitados na origem.",
                                isCorrect: false,
                            },
                            {
                                text: "Passam a ser responsabilidade exclusiva do cliente durante a homologação da entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "São substituídos por revisões de código feitas pela equipe de desenvolvimento.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, qual é o risco de tentar antecipar e detalhar absolutamente tudo antes de começar a construir?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Atrasa o trabalho sem reduzir risco de verdade, virando burocracia.",
                                isCorrect: true,
                            },
                            {
                                text: "Faz com que a equipe de desenvolvimento perca autonomia sobre as decisões técnicas.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumenta o custo das ferramentas de gestão usadas para registrar os requisitos do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Impede que os testes automatizados sejam escritos antes do código de produção.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Erro, defeito e falha: o vocabulário da área",
                blocks: [
                    {
                        type: "text",
                        value: '## Três palavras que parecem sinônimos\n\nNo dia a dia todo mundo diz "bug" para tudo. Funciona para conversar, mas atrapalha na hora de investigar, porque esconde a corrente de causa e efeito. A área separa três coisas, e cada uma acontece num lugar diferente.\n\nO **erro** (ou engano) acontece na **cabeça de uma pessoa**. Alguém entendeu a regra errado, distraiu, calculou de cabeça e trocou um sinal, leu "maior que" onde estava escrito "maior ou igual".\n\nO **defeito** (o bug propriamente dito) é o resultado do erro **gravado no artefato**: no código, no requisito, no desenho da tela, na configuração. Ele está lá, parado, mesmo que ninguém execute nada.\n\nA **falha** é o que acontece quando o sistema **executa** o defeito e se comporta de forma diferente do esperado. É a parte visível: a tela que trava, o valor errado no boleto, o erro 500.',
                    },
                    {
                        type: "quote",
                        value: 'A corrente é sempre a mesma: uma pessoa comete um **erro**, que produz um **defeito** no artefato, que **pode** causar uma **falha** quando executado. Repare no "pode": defeito em código que ninguém executa nunca vira falha, e continua sendo um defeito.',
                    },
                    {
                        type: "text",
                        value: '## Um exemplo concreto\n\nA regra do produto diz: "clientes com mais de 65 anos têm desconto".\n\nA pessoa que programou entendeu "mais de 65" e escreveu `idade > 65`. O time de produto, na verdade, queria incluir quem tem exatamente 65 anos.\n\n- O **erro** é o entendimento equivocado da regra, na cabeça de quem leu.\n- O **defeito** é o `>` no lugar do `>=`, parado no código.\n- A **falha** acontece no dia em que um cliente de 65 anos exatos passa pelo caixa e não recebe o desconto.\n\nRepare em duas coisas. Primeiro, o defeito ficou lá parado por semanas antes de qualquer falha aparecer: só clientes de 65 anos exatos disparam o problema. Segundo, dá para consertar em três lugares diferentes, e cada um resolve um nível: corrigir o código resolve aquele defeito; deixar a regra escrita de forma inequívoca resolve o erro; combinar exemplos no refinamento evita a próxima classe inteira desse problema.',
                    },
                    {
                        type: "table",
                        value: '[["Termo", "Onde acontece", "Existe mesmo sem execução?", "Exemplo"], ["Erro", "Na pessoa", "Sim, é o engano humano", "Entender \\"mais de 65\\" como \\"65 ou mais\\""], ["Defeito", "No artefato (código, requisito, tela)", "Sim, fica gravado ali", "Escrever > no lugar de >= no código"], ["Falha", "Na execução", "Não, precisa rodar", "Cliente de 65 anos não recebe o desconto"]]',
                    },
                    {
                        type: "text",
                        value: '## Por que essa separação vale a pena\n\nTrês motivos práticos.\n\n**Investigar fica mais fácil.** Ao ver uma falha, a pergunta seguinte é "qual defeito causou isso?", e depois "qual erro produziu esse defeito?". Parar no primeiro nível conserta o sintoma; chegar ao terceiro evita a repetição.\n\n**Reportar fica mais preciso.** "O sistema está com bug" não ajuda ninguém. "Executando este passo, o sistema apresenta este comportamento em vez daquele" descreve a falha, que é o que o desenvolvedor consegue reproduzir.\n\n**Nem toda falha vem de defeito no código.** Ela pode vir de um defeito no **requisito** (o sistema faz exatamente o que foi pedido, e o que foi pedido está errado), no **ambiente** (configuração, versão, dado de teste) ou até de um **falso positivo** do próprio teste. Confundir os três leva o time a caçar bug no código quando o problema está no documento.',
                    },
                    {
                        type: "text",
                        value: "## Um caso especial: o falso positivo e o falso negativo\n\nDois termos que aparecem muito e vale já guardar.\n\nUm **falso positivo** é quando o teste acusa uma falha que não existe: o teste está errado, o dado estava desatualizado, o ambiente estava fora do ar. Falso positivo demais é veneno, porque o time se acostuma a ignorar teste vermelho.\n\nUm **falso negativo** é o contrário, e mais perigoso: o teste passa, mas o defeito está lá. O caso não cobria aquele cenário, ou verificava a coisa errada. Suíte verde não é prova de que está tudo certo; é prova de que o que foi verificado passou.",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** erro é humano, defeito é o que ficou gravado, falha é o comportamento observado. Além disso, teste que falha nem sempre indica defeito (falso positivo) e teste que passa nem sempre indica ausência de defeito (falso negativo).",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma pessoa entende mal a regra de negócio e escreve o operador errado no código. Como se classifica o operador errado gravado no código?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "É um defeito, porque está registrado no artefato construído.",
                                isCorrect: true,
                            },
                            {
                                text: "É uma falha, porque o sistema vai se comportar de forma inesperada quando rodar.",
                                isCorrect: false,
                            },
                            {
                                text: "É um erro, porque nasceu de uma interpretação equivocada feita por uma pessoa.",
                                isCorrect: false,
                            },
                            {
                                text: "É um risco, porque ainda não se sabe se algum cliente será afetado por isso.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um defeito existe no código, mas nenhum usuário jamais executa aquele trecho. O que se pode afirmar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O defeito existe, mas nunca se manifesta como falha.",
                                isCorrect: true,
                            },
                            {
                                text: "O defeito deixa de existir, já que não causa impacto em nenhum cliente do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "O defeito vira automaticamente um erro, porque não chegou a ser executado pelo sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "O defeito se transforma em falha em algum momento, mesmo sem ninguém executar o trecho.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O sistema faz exatamente o que o requisito pediu, mas o requisito está errado. O que isso mostra?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que o defeito pode estar no requisito, e não no código escrito.",
                                isCorrect: true,
                            },
                            {
                                text: "Que não existe defeito algum, pois o código cumpre fielmente o que foi especificado.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a falha observada foi causada por um problema no ambiente de execução do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o teste executado gerou um falso positivo ao apontar um comportamento indevido.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que é um falso negativo em teste?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O teste passa, mas o defeito continua presente no sistema.",
                                isCorrect: true,
                            },
                            {
                                text: "O teste falha, mas não existe defeito algum no comportamento verificado do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste é ignorado pela equipe por causa da instabilidade do ambiente de execução.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste cobre um cenário que já era coberto por outro caso escrito anteriormente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que uma quantidade alta de falsos positivos é perigosa para o time?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque o time se acostuma a ignorar teste vermelho e deixa passar falha real.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque aumenta o tempo total de execução da suíte automatizada de testes do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque impede que novos casos de teste sejam adicionados à suíte já existente.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque obriga a equipe a reescrever o código de produção sempre que um teste falha.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Princípios e o processo de teste",
        aulas: [
            {
                titulo: "Os sete princípios de teste",
                blocks: [
                    {
                        type: "text",
                        value: "## Sete ideias que orientam tudo\n\nA área de teste tem sete princípios clássicos. Eles não são regras burocráticas: são conclusões que a indústria tirou depois de décadas errando. Guardar esses sete evita a maior parte dos enganos de quem está começando.\n\nVamos passar por todos, com o que cada um significa na prática.",
                    },
                    {
                        type: "text",
                        value: '## 1. Teste mostra a presença de defeitos, não a ausência\n\nSe você testou e achou defeito, você provou que existe defeito. Se você testou e não achou nada, você **não** provou que não existe. Provou apenas que o que você verificou, do jeito que verificou, passou.\n\nIsso muda o discurso do time. Em vez de "está testado, pode subir", a frase honesta é "testei estes cenários, nesta profundidade, e o risco que sobra é este". A primeira frase promete o que ninguém pode entregar.\n\n## 2. Teste exaustivo é impossível\n\nTestar todas as combinações possíveis de entradas e caminhos é impraticável em qualquer sistema real. Um formulário com dez campos de texto já tem mais combinações do que você conseguiria executar numa vida.\n\nA consequência prática é que **você sempre escolhe** o que testar. Como a escolha é inevitável, o que resta é fazê-la bem, guiada por risco e por técnica, em vez de por intuição ou por ordem alfabética das telas.',
                    },
                    {
                        type: "text",
                        value: "## 3. Testar cedo economiza tempo e dinheiro\n\nÉ o shift left que a gente viu: quanto antes a atividade de qualidade entra, mais barato sai. Revisar um requisito custa uma conversa; corrigir o mesmo mal-entendido em produção custa um mutirão.\n\n## 4. Defeitos se agrupam\n\nDefeito não se distribui por igual pelo sistema. Ele se concentra. Uns poucos módulos costumam concentrar a maioria dos problemas, normalmente os mais complexos, os mais alterados ou os que ninguém entende direito.\n\nNa prática isso vira uma orientação de onde olhar: se o módulo de faturamento deu doze bugs nos últimos três meses e o de cadastro deu um, adivinhe onde vale a pena investir teste.\n\n## 5. Cuidado com o paradoxo do pesticida\n\nRepetir sempre os mesmos testes é como usar sempre o mesmo veneno na lavoura: as pragas que sobreviveram ficam imunes. Uma suíte que nunca muda para de encontrar defeito novo, porque o time já corrigiu tudo o que ela cobre.\n\nO antídoto é revisar e renovar os casos periodicamente, e complementar o roteiro com teste exploratório, que por natureza vai a lugares que nenhum script planejado visita.",
                    },
                    {
                        type: "quote",
                        value: "O **paradoxo do pesticida** não significa que a suíte antiga é inútil. Ela continua protegendo contra regressão, e isso tem muito valor. Significa apenas que ela **para de descobrir coisa nova**, e que descobrir coisa nova exige variar.",
                    },
                    {
                        type: "text",
                        value: '## 6. Teste depende do contexto\n\nNão existe "o jeito certo de testar". Testar o aplicativo de um banco, um jogo mobile, um marca-passo e um site institucional são atividades com profundidades, técnicas e critérios completamente diferentes. O que muda é o **risco**: no marca-passo, uma falha mata; no site institucional, uma falha irrita.\n\nQuando alguém pergunta "quantos testes são suficientes?", a resposta honesta é sempre "depende do que acontece se falhar".\n\n## 7. A ilusão da ausência de erros\n\nUm sistema pode estar praticamente livre de defeitos e ainda ser um fracasso, porque resolve o problema errado ou é insuportável de usar. Corrigir bugs de um produto que ninguém quer não gera valor nenhum.\n\nEsse princípio fecha o círculo com a primeira aula: qualidade é atender à necessidade. Sistema sem defeito e sem utilidade continua sendo um sistema ruim.',
                    },
                    {
                        type: "table",
                        value: '[["Princípio", "Em uma frase", "O que ele muda na sua prática"], ["Presença, não ausência", "Teste acha defeito, não prova que não há", "Falar em risco residual, não em \\"está aprovado\\""], ["Exaustivo é impossível", "Não dá para testar tudo", "Escolher com técnica e risco, não com intuição"], ["Testar cedo", "Antes é mais barato", "Entrar no refinamento, não só no fim"], ["Agrupamento", "Defeito se concentra", "Investir onde já houve mais problema"], ["Paradoxo do pesticida", "Teste repetido para de achar novidade", "Renovar casos e explorar"], ["Depende do contexto", "Cada produto exige uma profundidade", "Calibrar pelo impacto da falha"], ["Ilusão da ausência de erros", "Sem defeito e sem utilidade continua ruim", "Checar se resolve o problema certo"]]',
                    },
                ],
                questions: [
                    {
                        statement:
                            "O time executou toda a suíte e nenhum teste falhou. O que é correto concluir?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Que o que foi verificado passou, sem garantia de que não há defeitos.",
                                isCorrect: true,
                            },
                            {
                                text: "Que o sistema está livre de defeitos e pode ir para produção com segurança.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a cobertura de código atingiu cem por cento em todos os módulos testados.",
                                isCorrect: false,
                            },
                            {
                                text: "Que os requisitos foram escritos corretamente por quem especificou a funcionalidade.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a consequência prática do princípio de que o teste exaustivo é impossível?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Você sempre escolhe o que testar, então convém escolher por risco e técnica.",
                                isCorrect: true,
                            },
                            {
                                text: "Você deve automatizar todos os cenários para conseguir executá-los em tempo hábil.",
                                isCorrect: false,
                            },
                            {
                                text: "Você deve testar apenas o caminho feliz, deixando os erros para o suporte tratar.",
                                isCorrect: false,
                            },
                            {
                                text: "Você precisa aumentar o prazo do projeto até conseguir cobrir todas as combinações.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O módulo de faturamento acumulou doze defeitos em três meses e o de cadastro apenas um. Qual princípio orienta a decisão de investir mais teste no faturamento?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O agrupamento de defeitos, que se concentram em poucas áreas.",
                                isCorrect: true,
                            },
                            {
                                text: "O paradoxo do pesticida, que faz os testes perderem eficácia com o tempo de uso.",
                                isCorrect: false,
                            },
                            {
                                text: "A ilusão da ausência de erros, que mostra a diferença entre defeito e valor entregue.",
                                isCorrect: false,
                            },
                            {
                                text: "O princípio de testar cedo, que antecipa as atividades de qualidade no projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma suíte de regressão roda há dois anos sem alteração e não encontra defeito novo há meses. O que isso indica?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O paradoxo do pesticida: ela protege contra regressão, mas não descobre novidade.",
                                isCorrect: true,
                            },
                            {
                                text: "Que a suíte está com defeito e precisa ser descartada e reescrita do zero pelo time.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o sistema atingiu maturidade e não precisa mais de nenhuma atividade de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a equipe deveria parar de rodar essa suíte para economizar tempo de execução no CI.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um produto praticamente sem defeitos fracassa porque resolve um problema que ninguém tem. Qual princípio isso ilustra?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A ilusão da ausência de erros.",
                                isCorrect: true,
                            },
                            {
                                text: "O princípio de que teste mostra presença de defeitos e não a ausência deles.",
                                isCorrect: false,
                            },
                            {
                                text: "O princípio de que a atividade de teste depende do contexto de cada produto.",
                                isCorrect: false,
                            },
                            {
                                text: "O princípio do agrupamento de defeitos em determinadas áreas do sistema.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O processo de teste do início ao fim",
                blocks: [
                    {
                        type: "text",
                        value: "## Teste não é só executar\n\nQuem está de fora imagina que testar é sentar na frente do sistema e clicar. A execução é só uma das etapas, e nem é a que dá mais trabalho. O processo completo tem cinco atividades que se repetem em qualquer projeto, seja ele cascata ou ágil, seja a entrega mensal ou diária.\n\nO nome das etapas muda de empresa para empresa. O que não muda é a sequência lógica.",
                    },
                    {
                        type: "text",
                        value: '## As cinco atividades\n\n**1. Planejamento.** Decidir o que será testado, com qual profundidade, em qual ambiente, com quais dados, e o que fica de fora. Aqui também se define o que significa "pronto o suficiente para entregar". Planejar não é escrever um documento de cinquenta páginas: em time ágil isso muitas vezes é uma conversa de vinte minutos e uma lista.\n\n**2. Análise.** Olhar o que vai ser testado (requisito, história, tela, contrato de API) e identificar **condições de teste**: as coisas que precisam ser verificadas. Ainda não são casos, são tópicos. "Cadastro com CPF já existente", "valor acima do limite diário", "pagamento recusado pelo banco".\n\n**3. Modelagem (projeto).** Transformar cada condição em **casos de teste** concretos: dados de entrada, passos e resultado esperado. É aqui que entram as técnicas que a gente vai ver no módulo 4.\n\n**4. Execução.** Rodar os casos, comparar o resultado obtido com o esperado, registrar o que deu diferente e reportar os defeitos.\n\n**5. Conclusão e avaliação.** Verificar se os critérios de saída foram atingidos, comunicar o resultado, e olhar para trás: o que deu errado no processo, o que renderia mais na próxima vez.',
                    },
                    {
                        type: "table",
                        value: '[["Etapa", "Pergunta que responde", "Entregável típico"], ["Planejamento", "O que vamos testar e até onde?", "Estratégia, escopo e critérios"], ["Análise", "O que precisa ser verificado?", "Lista de condições de teste"], ["Modelagem", "Como verificar cada condição?", "Casos de teste e dados"], ["Execução", "O resultado bate com o esperado?", "Resultado da execução e defeitos"], ["Conclusão", "Podemos parar? O que aprendemos?", "Relatório e ações de melhoria"]]',
                    },
                    {
                        type: "text",
                        value: '## Critérios de entrada e de saída\n\nDuas ideias simples evitam muita confusão.\n\nOs **critérios de entrada** dizem quando faz sentido começar a testar. Não adianta iniciar a execução se o ambiente está fora do ar, se a funcionalidade nem foi implantada ou se ninguém sabe qual é o comportamento esperado. Começar assim gera falso alarme e desperdício.\n\nOs **critérios de saída** dizem quando faz sentido parar. Podem ser: todos os casos planejados executados, nenhum defeito crítico em aberto, cobertura mínima atingida, riscos principais verificados. Sem critério de saída, testar vira uma atividade infinita, e a decisão de parar acaba sendo "acabou o prazo", que é a pior possível.',
                    },
                    {
                        type: "quote",
                        value: "Parar de testar é uma decisão de **risco aceito**, não de exaustão. Combinar os critérios de saída antes de começar transforma essa decisão em algo que o time escolhe, e não em algo que o calendário impõe.",
                    },
                    {
                        type: "text",
                        value: '## Como isso fica no dia a dia ágil\n\nEm time ágil essas etapas não viram fases separadas com semanas de duração. Elas se comprimem e se misturam dentro da sprint, quase sempre assim:\n\n- O planejamento acontece no planejamento da sprint e num acordo de estratégia mais amplo, revisitado de tempos em tempos.\n- A análise acontece no refinamento, junto com quem escreve a história.\n- A modelagem acontece enquanto o desenvolvimento roda.\n- A execução acontece assim que cada pedaço fica pronto, e não no fim da sprint.\n- A conclusão acontece na review e na retrospectiva.\n\nO erro clássico é empurrar tudo para os últimos dois dias da sprint. Aí a análise vira pressa, a modelagem some, a execução é superficial e a conclusão vira "não deu tempo".',
                    },
                ],
                questions: [
                    {
                        statement: "Na etapa de análise, o que é produzido?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A lista de condições de teste, ou seja, o que precisa ser verificado.",
                                isCorrect: true,
                            },
                            {
                                text: "Os casos de teste completos, com dados de entrada e resultado esperado definidos.",
                                isCorrect: false,
                            },
                            {
                                text: "O relatório final com os defeitos encontrados durante a execução dos cenários.",
                                isCorrect: false,
                            },
                            {
                                text: "O plano de teste com escopo, ambiente e critérios acordados com o time todo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para que servem os critérios de entrada do teste?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Definir quando faz sentido começar a testar, evitando falso alarme e desperdício.",
                                isCorrect: true,
                            },
                            {
                                text: "Definir quais defeitos serão aceitos pelo time antes da entrega ir para produção.",
                                isCorrect: false,
                            },
                            {
                                text: "Determinar quais pessoas do time podem executar os casos de teste planejados.",
                                isCorrect: false,
                            },
                            {
                                text: "Estabelecer a ordem em que os casos de teste serão executados dentro da sprint.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um time nunca define critérios de saída. Qual é a consequência mais provável?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A decisão de parar acaba sendo tomada pelo fim do prazo.",
                                isCorrect: true,
                            },
                            {
                                text: "A equipe passa a executar apenas testes automatizados durante o ciclo de entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "Os defeitos encontrados deixam de ser registrados na ferramenta usada pelo time.",
                                isCorrect: false,
                            },
                            {
                                text: "O ambiente de teste fica indisponível com mais frequência ao longo do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a ordem correta das atividades do processo de teste?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Planejamento, análise, modelagem, execução e conclusão.",
                                isCorrect: true,
                            },
                            {
                                text: "Análise, planejamento, execução, modelagem e conclusão do ciclo de testes.",
                                isCorrect: false,
                            },
                            {
                                text: "Modelagem, planejamento, análise, conclusão e execução dos casos definidos.",
                                isCorrect: false,
                            },
                            {
                                text: "Execução, análise, modelagem, planejamento e conclusão da atividade de teste.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em um time ágil, qual é o erro clássico na distribuição dessas atividades dentro da sprint?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Empurrar tudo para os últimos dias, o que atropela análise e modelagem.",
                                isCorrect: true,
                            },
                            {
                                text: "Fazer a análise durante o refinamento das histórias junto com quem as escreve.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar os testes de cada pedaço assim que ele fica pronto, sem esperar o fim.",
                                isCorrect: false,
                            },
                            {
                                text: "Discutir os aprendizados do ciclo durante a retrospectiva realizada ao final da sprint.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Risco: a bússola que decide o que testar",
                blocks: [
                    {
                        type: "text",
                        value: '## Já que não dá para testar tudo\n\nO princípio dois disse que teste exaustivo é impossível. Isso deixa uma pergunta na mesa: **como escolher**? A resposta que a indústria consolidou é: pelo risco.\n\nRisco, aqui, tem uma definição bem prática, com dois fatores:\n\n**Risco = probabilidade de falhar x impacto se falhar.**\n\nA probabilidade responde "qual a chance de ter defeito aqui?". Cresce com complexidade, com quantidade de mudanças recentes, com pressa, com tecnologia nova, com histórico ruim de defeitos naquela área.\n\nO impacto responde "e se falhar, qual o tamanho do estrago?". Cresce com dinheiro envolvido, com quantidade de usuários afetados, com exposição legal, com dano de imagem, com dificuldade de reverter.',
                    },
                    {
                        type: "table",
                        value: '[["Área do sistema", "Probabilidade", "Impacto", "Prioridade de teste"], ["Cálculo de juros do empréstimo", "Alta (regra complexa e nova)", "Alto (dinheiro e regulação)", "Máxima"], ["Login e recuperação de senha", "Média (mexeram recentemente)", "Alto (bloqueia todo mundo)", "Alta"], ["Exportação de relatório em CSV", "Média", "Médio (dá para reexportar)", "Média"], ["Texto de rodapé da página inicial", "Baixa", "Baixo", "Mínima"]]',
                    },
                    {
                        type: "text",
                        value: "## Como usar isso na prática\n\nVocê não precisa de uma planilha elaborada para começar. Um exercício de quinze minutos com o time já muda o resultado da sprint:\n\n1. **Liste** as áreas ou histórias que entram na entrega.\n2. Para cada uma, dê uma nota de 1 a 3 para probabilidade e outra para impacto.\n3. **Multiplique**. Ordene do maior para o menor.\n4. Combine a profundidade: as de nota alta ganham cenários de borda, dados variados e exploração; as de nota baixa ganham uma verificação rápida do caminho principal.\n5. **Escreva o que ficou de fora.** Essa é a parte que quase todo mundo pula, e é a mais valiosa. Risco assumido em silêncio vira surpresa depois.\n\nRepare que esse exercício não elimina risco. Ele o torna **explícito e distribuído com intenção**, em vez de deixá-lo espalhado por acaso.",
                    },
                    {
                        type: "quote",
                        value: 'O entregável mais valioso de QA raramente é a lista de bugs. É a frase: "testamos isto, nesta profundidade; não testamos aquilo; o risco que sobra é este". Com ela, quem decide entregar decide sabendo. Sem ela, decide no escuro.',
                    },
                    {
                        type: "text",
                        value: '## Risco também define quando parar\n\nTimes novos costumam achar que existe um ponto em que o teste "acaba". Não existe. Sempre dá para testar mais um cenário, mais uma combinação, mais um navegador.\n\nO que existe é um ponto em que **o risco restante é aceitável para quem decide**. E esse ponto muda com o contexto: numa correção urgente de produção, o time aceita muito mais risco do que na primeira versão do módulo de pagamento.\n\nPor isso a pergunta certa nunca é "já testamos o suficiente?", que não tem resposta objetiva. A pergunta certa é "o que ainda não sabemos, e conseguimos conviver com isso?".',
                    },
                    {
                        type: "text",
                        value: "## Risco de produto e risco de projeto\n\nVale separar dois tipos, porque a ação para cada um é diferente.\n\nO **risco de produto** é sobre o software falhar: cálculo errado, sistema fora do ar, dado vazado, lentidão na hora do pico. Ele se ataca com teste, com revisão, com monitoramento.\n\nO **risco de projeto** é sobre a entrega dar errado: ambiente que não fica pronto, pessoa-chave de férias, dependência de um time externo que atrasa, requisito que muda toda semana. Ele não se ataca com teste, e sim com combinação, negociação e plano B.\n\nConfundir os dois faz o time tentar testar mais para resolver um problema que era de organização.",
                    },
                ],
                questions: [
                    {
                        statement: "Como o risco é definido na prática de teste?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Probabilidade de falhar multiplicada pelo impacto se falhar.",
                                isCorrect: true,
                            },
                            {
                                text: "Quantidade de defeitos encontrados dividida pelo total de casos executados no ciclo.",
                                isCorrect: false,
                            },
                            {
                                text: "Tempo restante até a entrega comparado ao tempo necessário para testar o sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Número de usuários do sistema multiplicado pela quantidade de funcionalidades novas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma funcionalidade de cálculo de juros é nova, complexa e envolve dinheiro e regulação. Como ela deve ser tratada na priorização?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Com prioridade máxima, porque tem alta probabilidade e alto impacto.",
                                isCorrect: true,
                            },
                            {
                                text: "Com prioridade média, porque funcionalidades novas ainda não têm histórico de defeitos.",
                                isCorrect: false,
                            },
                            {
                                text: "Com prioridade baixa, já que o time de desenvolvimento acabou de revisar todo o código.",
                                isCorrect: false,
                            },
                            {
                                text: "Com prioridade indefinida, porque o risco só pode ser medido depois da entrega ao cliente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, qual é a parte mais valiosa e mais esquecida do exercício de priorização por risco?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Registrar o que ficou de fora, tornando o risco assumido explícito.",
                                isCorrect: true,
                            },
                            {
                                text: "Calcular a multiplicação das notas de probabilidade e impacto de cada item listado.",
                                isCorrect: false,
                            },
                            {
                                text: "Ordenar as áreas do sistema da maior para a menor pontuação obtida no exercício.",
                                isCorrect: false,
                            },
                            {
                                text: "Reunir o time inteiro por pelo menos quinze minutos antes de começar a sprint nova.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Qual pergunta a aula considera mais útil do que "já testamos o suficiente?"',
                        difficulty: "medio",
                        options: [
                            {
                                text: "O que ainda não sabemos, e conseguimos conviver com isso?",
                                isCorrect: true,
                            },
                            {
                                text: "Quantos casos de teste ainda faltam ser executados antes do fim do prazo combinado?",
                                isCorrect: false,
                            },
                            {
                                text: "Qual porcentagem de cobertura de código a suíte automatizada atingiu nesta entrega?",
                                isCorrect: false,
                            },
                            {
                                text: "Quantos defeitos foram encontrados em comparação com a entrega feita no mês anterior?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O ambiente de homologação não fica pronto e a pessoa-chave do time entra de férias na semana da entrega. Que tipo de risco é esse?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Risco de projeto, que se ataca com combinação e plano B, não com teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Risco de produto, porque atrasa a verificação e aumenta a chance de defeito escapar.",
                                isCorrect: false,
                            },
                            {
                                text: "Risco técnico, que deve ser resolvido com aumento da cobertura automatizada da suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "Risco residual, aquele que sobra depois que os testes planejados foram executados.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Testes estáticos: achar defeito sem executar nada",
                blocks: [
                    {
                        type: "text",
                        value: "## Dá para testar sem rodar o sistema\n\nChamamos de **teste dinâmico** aquele que executa o software: você roda, observa e compara. É o que a maioria das pessoas imagina quando pensa em teste.\n\nMas existe uma família inteira de atividades que encontra defeito **sem executar nada**: o **teste estático**. Em vez de rodar o sistema, você examina os artefatos: requisito, história de usuário, critério de aceitação, protótipo de tela, contrato de API, código-fonte, documentação.\n\nE aqui está o detalhe que surpreende quem está começando: o teste estático costuma ser o de melhor custo-benefício de todos. Ele encontra o defeito **na origem**, antes de virar código.",
                    },
                    {
                        type: "table",
                        value: '[["", "Teste estático", "Teste dinâmico"], ["Executa o software?", "Não", "Sim"], ["O que examina", "Requisito, código, protótipo, documento", "O comportamento do sistema rodando"], ["O que encontra", "Ambiguidade, contradição, omissão, defeito no código", "Falhas de comportamento"], ["Quando pode ser feito", "Assim que o artefato existe", "Só depois de algo executável"]]',
                    },
                    {
                        type: "text",
                        value: "## As duas formas de teste estático\n\n**Revisão** é a forma feita por pessoas. Vai desde a mais informal até a mais estruturada:\n\n- **Revisão informal**: um colega lê e comenta. Barata, rápida, sem cerimônia.\n- **Walkthrough**: quem escreveu conduz uma leitura guiada com o grupo, explicando e recebendo perguntas.\n- **Revisão técnica**: um grupo de pares avalia o artefato com foco técnico, normalmente com preparação prévia.\n- **Inspeção**: a mais formal, com papéis definidos (moderador, autor, revisor, relator), checklists e métricas. Usada onde o custo da falha é altíssimo.\n\n**Análise estática** é a forma feita por ferramenta, sobre o código, sem executá-lo: linter, verificador de tipos, análise de segurança, detector de código duplicado. É o mesmo raciocínio da revisão, automatizado e rodando a cada commit.",
                    },
                    {
                        type: "text",
                        value: '## O que procurar numa revisão de requisito\n\nEssa é a atividade de QA mais barata que existe, e a que mais rende. Ao ler uma história, procure:\n\n- **Ambiguidade**: "o sistema deve responder rápido" (rápido quanto?), "notificar o usuário" (por qual canal?).\n- **Contradição**: um trecho diz que o limite é diário, outro diz que é por transação.\n- **Omissão**: o que acontece no caminho de erro? E se o serviço externo estiver fora? E se o campo vier vazio?\n- **Regra sem exemplo**: "aplica desconto progressivo" sem nenhum número concreto. Peça três exemplos com valores reais e veja a conversa mudar.\n- **Critério não verificável**: "a tela deve ser intuitiva". Como você provaria isso? Se não dá para verificar, não dá para testar.',
                    },
                    {
                        type: "quote",
                        value: 'Uma pergunta que resolve metade dos problemas de requisito: **"como eu vou saber que isso está pronto e certo?"**. Se ninguém consegue responder com um exemplo concreto, o requisito ainda não está pronto para virar código.',
                    },
                    {
                        type: "text",
                        value: '## Por que times pulam essa etapa\n\nRevisão parece lenta. Ler um documento e discutir dá a sensação de que ninguém está produzindo nada, enquanto codar dá a sensação de progresso.\n\nO engano é comparar o custo errado. A revisão de uma história custa vinte minutos de algumas pessoas. O mesmo mal-entendido descoberto duas semanas depois custa a implementação inteira, mais a correção, mais o reteste, mais a conversa que teria acontecido de qualquer forma.\n\nUm jeito de tornar isso concreto no seu time: quando um defeito aparecer, pergunte "isso teria sido pego numa revisão de requisito?". Se a resposta for sim algumas vezes seguidas, você tem o argumento pronto para a próxima retrospectiva.',
                    },
                ],
                questions: [
                    {
                        statement: "O que caracteriza um teste estático?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Examinar artefatos como requisitos e código sem executar o software.",
                                isCorrect: true,
                            },
                            {
                                text: "Executar o sistema com dados fixos e comparar o resultado com o valor esperado.",
                                isCorrect: false,
                            },
                            {
                                text: "Rodar a suíte automatizada de regressão em um ambiente idêntico ao de produção.",
                                isCorrect: false,
                            },
                            {
                                text: "Medir o desempenho da aplicação sob carga durante um período determinado de tempo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual das opções é uma forma de análise estática feita por ferramenta?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um linter que aponta código arriscado a cada commit enviado.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma inspeção formal conduzida por um moderador com checklist e métricas definidas.",
                                isCorrect: false,
                            },
                            {
                                text: "Um walkthrough em que o autor conduz a leitura do artefato para o grupo reunido.",
                                isCorrect: false,
                            },
                            {
                                text: "Um teste exploratório em que a pessoa usa o sistema livremente procurando problemas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Um requisito diz que "a tela deve ser intuitiva". Qual é o problema com esse critério?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não é verificável, então não há como provar que foi atendido.",
                                isCorrect: true,
                            },
                            {
                                text: "É ambíguo apenas quanto ao canal de notificação usado para avisar o usuário final.",
                                isCorrect: false,
                            },
                            {
                                text: "Contradiz outro trecho do documento que trata do mesmo comportamento da tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Está incompleto porque não menciona o comportamento esperado no caminho de erro.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a forma mais formal de revisão, com papéis definidos, checklists e métricas?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Inspeção.",
                                isCorrect: true,
                            },
                            {
                                text: "Revisão técnica conduzida por um grupo de pares com preparação prévia do material.",
                                isCorrect: false,
                            },
                            {
                                text: "Walkthrough conduzido pelo autor do artefato para o grupo de pessoas interessadas.",
                                isCorrect: false,
                            },
                            {
                                text: "Revisão informal feita por um colega que lê o material e deixa seus comentários.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que a aula afirma que times costumam pular a revisão, mesmo ela sendo barata?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque revisar não dá sensação de progresso, enquanto codar dá.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque poucas ferramentas do mercado oferecem suporte adequado a esse tipo de atividade.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a revisão só pode ser feita depois que o código da funcionalidade já está pronto.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a maioria dos defeitos aparece na execução e não pode ser prevista antes disso.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Verificação e validação",
                blocks: [
                    {
                        type: "text",
                        value: "## Duas perguntas parecidas, respostas diferentes\n\nDois termos que aparecem juntos o tempo todo e que muita gente usa como sinônimo. Eles não são.\n\n**Verificação** pergunta: *estamos construindo o produto certo do jeito certo?* Ou seja, o que foi construído está de acordo com o que foi especificado? Compara o software com o requisito.\n\n**Validação** pergunta: *estamos construindo o produto certo?* Ou seja, o que foi especificado resolve de fato a necessidade de quem vai usar? Compara o software com a necessidade real.\n\nUm jeito de gravar: verificação olha para o **documento**; validação olha para a **pessoa**.",
                    },
                    {
                        type: "table",
                        value: '[["", "Verificação", "Validação"], ["Pergunta", "Construímos conforme o especificado?", "Construímos o que resolve o problema?"], ["Referência de comparação", "O requisito, o contrato, o desenho", "A necessidade real de quem usa"], ["Quem costuma responder", "O time técnico", "Quem usa, o negócio, o cliente"], ["Exemplo de atividade", "Executar casos derivados do requisito", "Teste de aceitação e uso com pessoas reais"]]',
                    },
                    {
                        type: "text",
                        value: '## Um exemplo que deixa claro\n\nO requisito diz: "o relatório deve trazer as vendas do mês anterior, agrupadas por vendedor".\n\nO time implementa exatamente isso. Você testa e confirma: as vendas do mês anterior aparecem, agrupadas por vendedor, com os totais certos. **A verificação passou.**\n\nAí o relatório chega ao gerente comercial, que olha e diz: "mas eu preciso comparar com o mesmo mês do ano passado, senão o número não me diz nada". **A validação falhou.**\n\nNinguém errou o código. O sistema faz exatamente o que foi pedido. O problema é que o que foi pedido não resolvia a necessidade. Esse é o tipo de defeito que nenhuma quantidade de teste de execução pega, porque a referência de comparação estava errada desde o começo.',
                    },
                    {
                        type: "quote",
                        value: "Verificação passa e validação falha quando o time constrói **perfeitamente** a coisa **errada**. É por isso que envolver quem vai usar, cedo e com exemplos concretos, vale mais do que qualquer bateria extra de testes.",
                    },
                    {
                        type: "text",
                        value: "## Como fazer validação de verdade\n\nValidação não acontece por acaso no fim do projeto. Algumas práticas que funcionam:\n\n- **Combinar exemplos com quem pediu**, antes de codar. Não a regra no abstrato: três casos com números reais e o resultado esperado de cada um.\n- **Mostrar cedo**, mesmo incompleto. Um protótipo navegável ou uma versão parcial revela mal-entendido em minutos, enquanto o documento esconde por semanas.\n- **Teste de aceitação com quem usa**, e não apenas com o time técnico executando o roteiro que o próprio time escreveu.\n- **Olhar o uso real** depois de entregar: onde as pessoas desistem, o que elas mais pedem no suporte, qual caminho ninguém usa.\n\nRepare que quase nada disso é executar caso de teste. Validação é sobre **conversa e evidência de uso**, e é exatamente por isso que ela costuma ser negligenciada por times muito técnicos.",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando o módulo:** sete princípios orientam a área; o processo tem cinco atividades (planejar, analisar, modelar, executar, concluir); a escolha do que testar é guiada por risco; dá para achar defeito sem executar nada (teste estático); e verificação e validação respondem perguntas diferentes. Com essa base, o próximo módulo entra nos níveis e tipos de teste.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual pergunta a verificação responde?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O que foi construído está de acordo com o que foi especificado?",
                                isCorrect: true,
                            },
                            {
                                text: "O que foi especificado resolve mesmo a necessidade de quem vai usar o produto?",
                                isCorrect: false,
                            },
                            {
                                text: "O sistema aguenta a quantidade de acessos esperada no período de maior movimento?",
                                isCorrect: false,
                            },
                            {
                                text: "O código está escrito de forma clara o suficiente para outra pessoa dar manutenção?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O relatório foi entregue exatamente como o requisito descrevia, mas o gerente diz que ele não serve para a decisão que precisa tomar. O que aconteceu?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A verificação passou e a validação falhou.",
                                isCorrect: true,
                            },
                            {
                                text: "A verificação falhou, já que o sistema não fez aquilo que estava no requisito escrito.",
                                isCorrect: false,
                            },
                            {
                                text: "A validação passou, porque quem pediu recebeu exatamente o que havia solicitado antes.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma das duas se aplica, porque o problema encontrado é de desempenho do relatório.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a referência de comparação usada na validação?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A necessidade real de quem vai usar o produto.",
                                isCorrect: true,
                            },
                            {
                                text: "O documento de requisitos aprovado pelas partes interessadas no início do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "O contrato de API definido entre os times que integram os sistemas envolvidos.",
                                isCorrect: false,
                            },
                            {
                                text: "O conjunto de casos de teste projetados pela equipe de qualidade para a entrega.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual prática ajuda mais na validação, segundo a aula?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Combinar exemplos concretos com quem pediu, antes de escrever o código.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumentar a quantidade de casos de teste derivados do documento de requisitos aprovado.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar a suíte de regressão completa antes de cada entrega feita para produção.",
                                isCorrect: false,
                            },
                            {
                                text: "Revisar o código-fonte em busca de trechos duplicados e de complexidade elevada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que times muito técnicos tendem a negligenciar a validação?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque ela depende de conversa e evidência de uso, não de executar casos.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque exige ferramentas caras que raramente estão disponíveis no orçamento do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque só pode ser feita depois que o produto está em produção há vários meses.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a responsabilidade formal por ela pertence exclusivamente à área comercial.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Níveis e tipos de teste",
        aulas: [
            {
                titulo: "Os quatro níveis de teste",
                blocks: [
                    {
                        type: "text",
                        value: "## Testar em camadas\n\nUm sistema não é testado de um jeito só. Ele é testado em **níveis**, cada um olhando para uma fatia diferente e respondendo a uma pergunta diferente. Os quatro níveis clássicos vão do menor pedaço até o produto inteiro na mão de quem vai usar.\n\nEntender os níveis evita dois desperdícios comuns: testar no nível errado (caro e lento) e testar duas vezes a mesma coisa em níveis diferentes (redundância que ninguém percebe).",
                    },
                    {
                        type: "text",
                        value: "## 1. Teste de unidade\n\nVerifica **a menor parte testável** do software isoladamente: uma função, um método, uma classe. Quem escreve normalmente é quem programa, e roda em segundos, na própria máquina.\n\nPergunta que responde: *esta função, sozinha, faz o que deveria?*\n\nExemplo: a função `calcularDesconto(valor, idade)` devolve 10 para valor 100 e idade 70.\n\n## 2. Teste de integração\n\nVerifica a **conversa entre as partes**: dois módulos, o serviço e o banco, a aplicação e uma API externa. Aqui aparecem os defeitos que nenhum teste de unidade pega, porque cada peça funciona sozinha e o problema mora no encontro delas.\n\nPergunta que responde: *estas partes conversam direito?*\n\nExemplo: salvar um pedido grava mesmo as linhas certas no banco e dispara a chamada ao serviço de pagamento no formato esperado.",
                    },
                    {
                        type: "text",
                        value: "## 3. Teste de sistema\n\nVerifica o **sistema montado**, de ponta a ponta, do jeito que ele vai existir. Não se olha para função nem para módulo: olha-se para o comportamento completo, incluindo interface, integrações e regras de negócio juntas.\n\nPergunta que responde: *o sistema inteiro faz o que foi especificado?*\n\nExemplo: fazer um pedido pelo site, do login à confirmação por email, com estoque baixando e nota gerada.\n\n## 4. Teste de aceitação\n\nVerifica se o sistema **serve para quem vai usar**. A referência aqui não é a especificação técnica, é a necessidade. É o nível em que a validação acontece de verdade.\n\nPergunta que responde: *isto resolve o problema e podemos aceitar a entrega?*\n\nAparece em algumas formas: aceitação do usuário (UAT), aceitação operacional (dá para operar, monitorar e restaurar?), aceitação contratual e regulatória (cumpre o contrato e a lei?), teste alfa e beta (uso real por um grupo antes da abertura geral).",
                    },
                    {
                        type: "table",
                        value: '[["Nível", "O que testa", "Quem costuma fazer", "Velocidade", "Custo de manutenção"], ["Unidade", "Uma função ou classe isolada", "Quem programa", "Muito rápida", "Baixo"], ["Integração", "A conversa entre partes", "Quem programa e QA", "Média", "Médio"], ["Sistema", "O produto montado inteiro", "QA", "Lenta", "Alto"], ["Aceitação", "Se atende à necessidade", "Quem usa e o negócio", "Lenta", "Alto"]]',
                    },
                    {
                        type: "quote",
                        value: "Regra prática: **teste cada coisa no nível mais barato que consiga verificá-la**. Uma regra de cálculo tem que ser testada na unidade, e não clicando na tela: na tela o mesmo teste demora cem vezes mais, quebra por qualquer mudança de layout e não diz onde está o erro.",
                    },
                    {
                        type: "text",
                        value: "## O que acontece quando o nível é escolhido errado\n\nDois sintomas típicos, e você vai reconhecer os dois em algum time:\n\n**Tudo testado pela interface.** A suíte demora horas, quebra a cada ajuste de tela, e quando falha ninguém sabe se o problema é a regra, a integração ou o botão que mudou de lugar. É caro, lento e pouco informativo.\n\n**Só teste de unidade.** Cada peça passa, o sistema montado não funciona. É o caso clássico do módulo A que envia a data como texto e o módulo B que espera um número: as duas unidades estão certas segundo os próprios testes, e a conversa entre elas está quebrada.\n\nO equilíbrio entre os níveis é justamente o assunto da pirâmide de testes, que a gente vê no módulo 7.",
                    },
                ],
                questions: [
                    {
                        statement: "O que o teste de unidade verifica?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A menor parte testável do software, de forma isolada.",
                                isCorrect: true,
                            },
                            {
                                text: "A conversa entre dois ou mais módulos que precisam trocar dados entre si.",
                                isCorrect: false,
                            },
                            {
                                text: "O sistema montado por completo, incluindo interface e integrações externas.",
                                isCorrect: false,
                            },
                            {
                                text: "Se a entrega atende à necessidade real de quem vai usar o produto no dia a dia.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O módulo A envia a data como texto e o módulo B espera um número. Cada um passa nos próprios testes de unidade. Qual nível pegaria esse defeito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Teste de integração.",
                                isCorrect: true,
                            },
                            {
                                text: "Teste de unidade, desde que a cobertura de código atingisse cem por cento em ambos.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de aceitação feito por quem usa o sistema durante a homologação da entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum nível pegaria, porque o defeito só se manifesta no ambiente de produção real.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a referência de comparação no teste de aceitação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A necessidade de quem vai usar o sistema.",
                                isCorrect: true,
                            },
                            {
                                text: "A especificação técnica escrita pela equipe de desenvolvimento durante o projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "O contrato de integração acordado entre os sistemas que trocam dados entre si.",
                                isCorrect: false,
                            },
                            {
                                text: "A lista de casos de teste projetados na etapa de modelagem do processo de teste.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um time testa toda regra de cálculo clicando na interface. Qual é o principal problema dessa escolha?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Fica caro e lento, e a falha não indica onde está o erro.",
                                isCorrect: true,
                            },
                            {
                                text: "A interface não permite verificar valores numéricos com a precisão que a regra exige.",
                                isCorrect: false,
                            },
                            {
                                text: "Os testes de interface não podem ser automatizados e precisam ser executados à mão.",
                                isCorrect: false,
                            },
                            {
                                text: "As regras de cálculo só podem ser verificadas por quem tem acesso ao código-fonte.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual regra prática a aula propõe para escolher o nível de teste?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Testar cada coisa no nível mais barato que consiga verificá-la.",
                                isCorrect: true,
                            },
                            {
                                text: "Testar tudo no nível de sistema, que é o mais próximo da experiência real do usuário.",
                                isCorrect: false,
                            },
                            {
                                text: "Distribuir a mesma quantidade de casos entre os quatro níveis existentes de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Priorizar sempre o nível de aceitação, porque é ele que valida a necessidade real.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Testes funcionais: o que o sistema faz",
                blocks: [
                    {
                        type: "text",
                        value: '## A pergunta do teste funcional\n\nAlém de níveis, os testes se dividem em **tipos**. E a primeira divisão, a mais importante de todas, é entre funcional e não funcional.\n\nO **teste funcional** verifica **o que o sistema faz**. Ele pega uma função do produto e pergunta: dado este cenário, o comportamento é o esperado? Se você consegue descrever a verificação como "quando eu faço X, o sistema deve fazer Y", você está no território funcional.\n\nÉ o tipo mais familiar e o que ocupa a maior parte do dia de quem trabalha com QA.',
                    },
                    {
                        type: "text",
                        value: "## O que entra no funcional\n\nPraticamente tudo que o produto promete fazer:\n\n- **Regras de negócio**: o desconto é aplicado na faixa certa, o limite de crédito respeita a política, o frete é calculado pela região.\n- **Fluxos**: cadastrar, autenticar, comprar, cancelar, estornar.\n- **Cálculos**: totais, impostos, juros, saldos, conversões.\n- **Validações de entrada**: campo obrigatório, formato de email, CPF inválido, data no passado.\n- **Permissões**: quem vê o quê, quem pode alterar o quê.\n- **Integrações**: o pedido enviado ao parceiro sai no formato combinado e a resposta é tratada.\n- **Persistência**: o que foi salvo pode ser recuperado igual.",
                    },
                    {
                        type: "text",
                        value: '## Caminho feliz não é suficiente\n\nQuem está começando testa o **caminho feliz**: os dados certos, na ordem certa, com o sistema no ar. É por onde se começa, mas é onde os defeitos menos aparecem, porque foi exatamente esse cenário que quem programou testou na própria máquina.\n\nO defeito mora em três outros lugares:\n\n**Caminhos alternativos**: dá para chegar ao mesmo objetivo por outro caminho? Cadastrar com login social em vez de senha, cancelar antes e depois do envio, pagar com dois meios diferentes.\n\n**Caminhos de erro**: cartão recusado, serviço externo fora do ar, sessão expirada no meio, arquivo corrompido, campo em branco, dois cliques no botão de confirmar.\n\n**Bordas**: exatamente no limite. Se a regra é "acima de mil", o que acontece com mil exato? Se o cupom vale até 31/12, e às 23h59 do dia 31? Se o carrinho aceita 10 itens, e o décimo primeiro?\n\nO módulo 4 inteiro é sobre técnicas para achar essas bordas sem depender de sorte.',
                    },
                    {
                        type: "table",
                        value: '[["Tipo de caminho", "Exemplo em uma compra", "Chance de esconder defeito"], ["Caminho feliz", "Produto em estoque, cartão aprovado, endereço válido", "Baixa"], ["Caminho alternativo", "Pagamento em duas formas, retirada na loja", "Média"], ["Caminho de erro", "Cartão recusado, estoque acabou no meio da compra", "Alta"], ["Borda", "Último item do estoque, cupom no minuto de expirar", "Muito alta"]]',
                    },
                    {
                        type: "quote",
                        value: 'Uma pergunta que gera cenário bom em qualquer funcionalidade: **"e se não der certo?"**. Quase todo requisito descreve o sucesso em detalhe e resolve o fracasso com uma frase genérica. É exatamente aí que os defeitos se acumulam.',
                    },
                    {
                        type: "text",
                        value: '## Funcional não é sinônimo de manual\n\nVale desfazer uma confusão comum: teste funcional é sobre **o que se verifica**, não sobre **como se executa**. Um teste funcional pode ser manual (uma pessoa clicando) ou automatizado (um script rodando). Do mesmo jeito, um teste não funcional também pode ser dos dois jeitos.\n\nSão dois eixos independentes, e misturá-los leva a frases confusas como "vamos automatizar os funcionais e deixar os não funcionais manuais", que não faz sentido nenhum como critério.',
                    },
                ],
                questions: [
                    {
                        statement: "O que o teste funcional verifica?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O que o sistema faz, comparando o comportamento com o esperado.",
                                isCorrect: true,
                            },
                            {
                                text: "Como o sistema se comporta sob carga, medindo tempo de resposta e uso de recursos.",
                                isCorrect: false,
                            },
                            {
                                text: "Se o código-fonte segue os padrões de escrita definidos pela equipe de desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "Se a arquitetura escolhida suporta o crescimento previsto para os próximos anos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que o caminho feliz costuma esconder poucos defeitos?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque foi justamente o cenário que quem programou já testou.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque envolve menos regras de negócio do que os caminhos alternativos do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a maioria dos usuários reais nunca segue exatamente esse caminho no dia a dia.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque as ferramentas de automação não conseguem reproduzir esse tipo de cenário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A regra diz que o frete é grátis para compras acima de R$ 200. Qual é o cenário de borda mais importante?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma compra de exatamente R$ 200.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma compra de R$ 500, bem acima do limite estabelecido pela regra de frete grátis.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma compra de R$ 50, bem abaixo do limite estabelecido pela regra de frete grátis.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma compra de R$ 200,00 exatos, para checar se o limite inclui ou exclui o valor.",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Qual afirmação sobre teste funcional está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Pode ser executado tanto de forma manual quanto automatizada.",
                                isCorrect: true,
                            },
                            {
                                text: "É sempre manual, já que exige uma pessoa interpretando o comportamento observado na tela.",
                                isCorrect: false,
                            },
                            {
                                text: "É sempre automatizado, porque verifica regras que podem ser expressas como código.",
                                isCorrect: false,
                            },
                            {
                                text: "Só pode ser executado no nível de sistema, com o produto completo montado e no ar.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual pergunta a aula sugere para gerar bons cenários em qualquer funcionalidade?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "E se não der certo?",
                                isCorrect: true,
                            },
                            {
                                text: "Quantos usuários simultâneos o sistema consegue atender sem degradar o desempenho?",
                                isCorrect: false,
                            },
                            {
                                text: "Qual é a porcentagem de cobertura de código atingida por esta funcionalidade nova?",
                                isCorrect: false,
                            },
                            {
                                text: "Quem é a pessoa responsável por aprovar a entrega desta funcionalidade específica?",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Testes não funcionais: como o sistema se comporta",
                blocks: [
                    {
                        type: "text",
                        value: '## A outra metade\n\nSe o funcional pergunta **o que** o sistema faz, o não funcional pergunta **como** ele faz. É a diferença entre "o relatório traz os números certos" e "o relatório abre em dois segundos, com mil pessoas usando ao mesmo tempo, sem vazar dado de ninguém, e dá para usar com leitor de tela".\n\nO sistema pode acertar todas as regras de negócio e ainda ser inviável. Um site de vendas que calcula tudo certo e leva quarenta segundos para carregar não vende. Um sistema de saúde que registra tudo corretamente e expõe prontuários é um problema jurídico.\n\nOs testes não funcionais costumam ser os mais esquecidos, porque os requisitos deles quase nunca estão escritos. Ninguém abre um chamado dizendo "faltou definir o tempo de resposta aceitável", mas todo mundo reclama quando está lento.',
                    },
                    {
                        type: "text",
                        value: "## As principais características\n\n**Desempenho.** Quão rápido e quanto aguenta. Se desdobra em vários testes:\n- **Carga**: comportamento sob a demanda esperada.\n- **Estresse**: comportamento acima do esperado, para achar o ponto de ruptura e ver se ele degrada com elegância ou desaba.\n- **Volume**: comportamento com muito dado (a tela que abre rápido com 100 registros e trava com 100 mil).\n- **Resistência**: comportamento ao longo de horas ou dias, que revela vazamento de memória e conexão que não é liberada.\n- **Pico**: subida súbita, tipo abertura de venda de ingresso.\n\n**Segurança.** Se protege o que precisa: autenticação, autorização, criptografia, injeção, exposição de dado sensível.\n\n**Usabilidade.** Se as pessoas conseguem usar sem sofrer: clareza, quantidade de passos, mensagens de erro que ajudam, previsibilidade.\n\n**Acessibilidade.** Se pessoas com deficiência conseguem usar: contraste, navegação por teclado, leitor de tela, texto alternativo em imagem. No Brasil isso não é só boa vontade: a Lei Brasileira de Inclusão exige acessibilidade digital.\n\n**Compatibilidade.** Se funciona nos navegadores, sistemas, versões e tamanhos de tela que importam.\n\n**Confiabilidade e disponibilidade.** Com que frequência falha, quanto tempo fica fora, quanto demora para voltar.\n\n**Manutenibilidade e portabilidade.** Quão fácil é alterar, corrigir e mover para outro ambiente.",
                    },
                    {
                        type: "table",
                        value: '[["Característica", "Pergunta", "Exemplo de critério verificável"], ["Desempenho", "É rápido o bastante?", "95% das buscas respondem em até 800 ms com 500 usuários simultâneos"], ["Segurança", "Protege o que precisa?", "Nenhum endpoint devolve dado de outro usuário ao trocar o id na URL"], ["Usabilidade", "Dá para usar sem sofrer?", "8 de 10 pessoas concluem o cadastro sem ajuda em até 3 minutos"], ["Acessibilidade", "Todos conseguem usar?", "Todo o fluxo de compra é navegável só pelo teclado"], ["Compatibilidade", "Funciona onde precisa?", "Funciona nas duas últimas versões de Chrome, Safari e Firefox"], ["Confiabilidade", "Falha pouco e volta rápido?", "Disponibilidade mensal de 99,9% e retorno em até 15 minutos"]]',
                    },
                    {
                        type: "text",
                        value: '## O problema do requisito não funcional vago\n\nRepare na coluna da direita da tabela. Todo critério tem **número** e **condição**. Isso não é preciosismo: é a diferença entre um requisito testável e um desabafo.\n\n"O sistema deve ser rápido" não dá para verificar. Rápido para quem, em qual tela, com quantas pessoas usando, em qual conexão? Duas pessoas podem olhar a mesma tela e discordar para sempre.\n\n"A busca deve responder em até 800 ms no percentil 95, com 500 usuários simultâneos" dá para verificar, dá para automatizar e dá para saber se piorou.\n\nUma boa pergunta para transformar desabafo em requisito: **"qual número faria você dizer que está ruim?"**. Quase sempre a pessoa tem esse número na cabeça, só nunca escreveu.',
                    },
                    {
                        type: "quote",
                        value: "Requisito não funcional sem número é opinião. Com número, vira critério: dá para verificar, comparar entre versões e detectar quando piorou. E piorar aos poucos, sem ninguém notar, é o destino mais comum do desempenho de um sistema.",
                    },
                    {
                        type: "text",
                        value: "## Quando testar cada um\n\nNão dá para rodar teste de carga toda semana em todo sistema, nem faz sentido. Um jeito prático de decidir:\n\n- **Sempre, em toda entrega**: acessibilidade básica e compatibilidade nos alvos principais custam pouco quando incorporadas no fluxo normal.\n- **Antes de eventos previsíveis**: carga e estresse antes da black friday, da abertura de matrícula, do lançamento.\n- **Quando algo estruturante muda**: trocou o banco, mudou a arquitetura, migrou de servidor, alterou o modelo de dados de uma tabela central.\n- **Continuamente, em segundo plano**: monitorar tempo de resposta e taxa de erro em produção é a forma mais barata de teste não funcional, porque usa tráfego real.",
                    },
                ],
                questions: [
                    {
                        statement: "O que os testes não funcionais verificam?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Como o sistema se comporta, e não o que ele faz.",
                                isCorrect: true,
                            },
                            {
                                text: "Se as regras de negócio implementadas produzem os resultados esperados pelo cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Se os fluxos de cadastro e de compra funcionam do início ao fim sem apresentar erro.",
                                isCorrect: false,
                            },
                            {
                                text: "Se as validações de campo obrigatório e formato estão aplicadas em todas as telas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre teste de carga e teste de estresse?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Carga usa a demanda esperada; estresse vai além dela para achar o ponto de ruptura.",
                                isCorrect: true,
                            },
                            {
                                text: "Carga mede o tempo de resposta e estresse mede a quantidade de memória consumida.",
                                isCorrect: false,
                            },
                            {
                                text: "Carga é executado em produção e estresse apenas no ambiente isolado de homologação.",
                                isCorrect: false,
                            },
                            {
                                text: "Carga verifica um usuário por vez e estresse verifica vários usuários simultâneos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma tela abre instantaneamente com 100 registros e trava com 100 mil. Que tipo de teste revelaria isso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Teste de volume.",
                                isCorrect: true,
                            },
                            {
                                text: "Teste de resistência, que observa o comportamento do sistema ao longo de vários dias.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de compatibilidade entre os navegadores suportados oficialmente pelo produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de usabilidade com pessoas reais executando as tarefas principais do sistema.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Por que "o sistema deve ser rápido" é um requisito não funcional ruim?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque não tem número nem condição, então não dá para verificar.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque desempenho não é uma característica não funcional reconhecida pela área de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque velocidade só pode ser medida depois que o sistema já está rodando em produção.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque exige ferramentas de teste de carga que a maioria das equipes não tem disponível.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, qual é a forma mais barata de teste não funcional contínuo?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Monitorar tempo de resposta e taxa de erro em produção, com tráfego real.",
                                isCorrect: true,
                            },
                            {
                                text: "Executar a bateria completa de testes de carga a cada entrega feita pela equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "Contratar uma auditoria externa de segurança a cada trimestre do ano corrente.",
                                isCorrect: false,
                            },
                            {
                                text: "Repetir os testes de compatibilidade em todos os navegadores a cada nova versão.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Regressão, reteste, smoke e sanidade",
                blocks: [
                    {
                        type: "text",
                        value: "## Quatro nomes que o time usa todo dia\n\nEsses quatro termos aparecem em qualquer reunião de time de produto, e são confundidos com frequência. A diferença entre eles é o **objetivo**, não a técnica.",
                    },
                    {
                        type: "text",
                        value: '## Reteste (teste de confirmação)\n\nVocê reportou um defeito, o desenvolvedor corrigiu, e agora você executa **exatamente o mesmo cenário** que falhou, para confirmar que passou a funcionar.\n\nÉ específico e estreito: um defeito, um cenário. Se você não consegue reproduzir o cenário original, você não consegue confirmar a correção, e é por isso que registrar os passos com precisão importa tanto.\n\n## Regressão\n\nVocê verifica se **o que já funcionava continua funcionando** depois de uma mudança. A mudança pode ser uma correção, uma funcionalidade nova, uma atualização de biblioteca ou uma troca de configuração.\n\nA palavra "regressão" descreve o problema: o sistema **regrediu**, voltou a um estado pior. É o defeito mais frustrante para quem usa, porque quebra algo que já estava certo.\n\nRegressão é a candidata número um à automação, porque é repetitiva, previsível e cresce sem parar: cada entrega nova adiciona coisas que precisam continuar funcionando para sempre.',
                    },
                    {
                        type: "quote",
                        value: "**Reteste** confirma que o defeito foi corrigido. **Regressão** confirma que a correção não quebrou outra coisa. Os dois andam juntos: corrigiu, confirma a correção e roda a regressão em volta.",
                    },
                    {
                        type: "text",
                        value: "## Smoke (teste de fumaça)\n\nUma bateria **curta e ampla**, executada logo após uma implantação, para responder a uma única pergunta: **vale a pena continuar testando?**\n\nO nome vem da eletrônica: liga o aparelho e vê se sai fumaça. Se sair, nem adianta testar o resto.\n\nUm smoke típico dura poucos minutos: a aplicação sobe, a tela inicial carrega, o login funciona, uma operação principal completa, a integração crítica responde. Se qualquer um falhar, o ambiente volta para o time antes que dez pessoas percam a manhã testando algo quebrado.\n\n## Sanidade\n\nUma verificação **estreita e profunda**, focada numa área específica, geralmente depois de uma correção pontual ou de uma mudança pequena. A pergunta é: *esta parte específica está coerente o suficiente para eu seguir?*\n\nA diferença para o smoke é a forma: smoke é raso e largo (toca em tudo, sem profundidade); sanidade é estreito e mais fundo (mergulha numa área só).",
                    },
                    {
                        type: "table",
                        value: '[["Tipo", "Objetivo", "Abrangência", "Quando roda"], ["Reteste", "Confirmar que o defeito foi corrigido", "Um cenário específico", "Depois da correção"], ["Regressão", "Garantir que o resto continua funcionando", "Ampla, cresce a cada entrega", "Depois de qualquer mudança"], ["Smoke", "Decidir se vale a pena testar", "Larga e rasa", "Logo após implantar"], ["Sanidade", "Checar coerência de uma área", "Estreita e um pouco mais funda", "Depois de mudança pontual"]]',
                    },
                    {
                        type: "text",
                        value: "## O problema que a regressão cria\n\nA suíte de regressão só cresce. Toda entrega adiciona comportamento que precisa continuar funcionando, e nada sai da lista.\n\nExecutando à mão, chega o dia em que rodar a regressão inteira levaria mais tempo do que a sprint. Aí o time faz a única coisa possível: **escolhe uma parte**. E escolher no susto, sem critério, é como não escolher.\n\nDuas saídas, que se combinam:\n\n**Automatizar.** É o caso de uso mais forte para automação que existe: alta repetição, resultado previsível, execução sem criatividade.\n\n**Selecionar por risco e impacto.** Rodar sempre o que é crítico e o que a mudança pode ter afetado, e rodar o resto em ciclos mais espaçados. Isso se chama seleção de regressão, e depende de saber o que a mudança tocou, algo que quem programa consegue responder em trinta segundos e QA levaria horas para adivinhar. Perguntar é mais rápido que deduzir.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o objetivo do reteste?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Confirmar que o defeito corrigido não acontece mais no cenário original.",
                                isCorrect: true,
                            },
                            {
                                text: "Verificar se as funcionalidades que já existiam continuam funcionando após a mudança.",
                                isCorrect: false,
                            },
                            {
                                text: "Decidir rapidamente se o ambiente recebido está estável o bastante para ser testado.",
                                isCorrect: false,
                            },
                            {
                                text: "Medir o tempo de resposta do sistema depois de uma alteração feita na arquitetura.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Depois de uma implantação, o time roda uma bateria curta que verifica login, tela inicial e uma operação principal. Que tipo de teste é esse?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Smoke.",
                                isCorrect: true,
                            },
                            {
                                text: "Regressão completa, cobrindo todas as funcionalidades entregues até o momento atual.",
                                isCorrect: false,
                            },
                            {
                                text: "Reteste dos defeitos que foram corrigidos durante a sprint que acabou de terminar.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de aceitação executado por quem vai usar o sistema no dia a dia da operação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença de forma entre smoke e sanidade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Smoke é raso e largo; sanidade é estreito e um pouco mais fundo.",
                                isCorrect: true,
                            },
                            {
                                text: "Smoke é automatizado por definição; sanidade é sempre executado de forma manual.",
                                isCorrect: false,
                            },
                            {
                                text: "Smoke roda em produção e sanidade roda apenas no ambiente de desenvolvimento local.",
                                isCorrect: false,
                            },
                            {
                                text: "Smoke verifica requisitos não funcionais; sanidade verifica apenas regras de negócio.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que a regressão é a principal candidata à automação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque é repetitiva, previsível e cresce a cada entrega feita.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque exige conhecimento técnico profundo que só ferramentas conseguem reproduzir.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque é o único tipo de teste que pode ser executado sem interface gráfica no sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque encontra mais defeitos novos do que qualquer outro tipo de teste do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A suíte de regressão manual ficou maior que o tempo da sprint. Qual é a saída mais eficaz, segundo a aula?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Automatizar e selecionar por risco, perguntando ao time o que a mudança tocou.",
                                isCorrect: true,
                            },
                            {
                                text: "Executar sempre a suíte inteira, aumentando o prazo de entrega de cada sprint do time.",
                                isCorrect: false,
                            },
                            {
                                text: "Escolher rapidamente alguns casos no dia da entrega, conforme o tempo disponível permitir.",
                                isCorrect: false,
                            },
                            {
                                text: "Remover da suíte os casos mais antigos, já que eles não encontram defeitos há muito tempo.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Caixa-preta, caixa-branca e caixa-cinza",
                blocks: [
                    {
                        type: "text",
                        value: "## Quanto você enxerga por dentro\n\nExiste mais um jeito de classificar teste, e ele não fala de nível nem de tipo. Fala de **quanto você sabe sobre a estrutura interna** do que está testando.\n\n**Caixa-preta.** Você olha só as entradas e as saídas. Não sabe (ou finge não saber) como o sistema faz por dentro. A referência é o requisito, o contrato ou o comportamento esperado. É como testar um forno: você põe a massa, ajusta o botão, e verifica se o bolo assou. Não precisa saber como a resistência funciona.\n\n**Caixa-branca.** Você conhece a estrutura interna e usa esse conhecimento para desenhar os testes: quais caminhos o código pode tomar, quais condições existem, quais linhas ainda não foram executadas. É o forno aberto, com o esquema elétrico na mão.\n\n**Caixa-cinza.** O meio termo, e o mais comum na vida real. Você testa pela interface externa, mas conhece parte do que acontece dentro: sabe qual tabela é gravada, qual API é chamada, qual fila recebe a mensagem. Usa esse conhecimento para escolher cenários melhores e para verificar o efeito no lugar certo.",
                    },
                    {
                        type: "table",
                        value: '[["Abordagem", "O que você conhece", "Base para desenhar o teste", "Quem costuma usar"], ["Caixa-preta", "Só entradas e saídas", "Requisito e comportamento esperado", "QA, aceitação, teste de sistema"], ["Caixa-branca", "A estrutura interna e o código", "Caminhos, condições e cobertura", "Quem programa, teste de unidade"], ["Caixa-cinza", "Parte da estrutura", "Requisito mais o conhecimento do fluxo interno", "QA com base técnica, integração e API"]]',
                    },
                    {
                        type: "text",
                        value: '## Por que caixa-cinza é tão útil\n\nImagine testar a funcionalidade "cancelar pedido".\n\nNa **caixa-preta** pura, você cancela e confere se a tela mostra "pedido cancelado". Só isso.\n\nNa **caixa-cinza**, você sabe que o cancelamento deveria fazer três coisas: mudar o status no banco, devolver o item ao estoque e disparar um email. Aí você cancela e verifica **as três**. E é aí que você descobre que a tela diz "cancelado", o status mudou, mas o estoque não voltou.\n\nEsse defeito é invisível para a caixa-preta pura e passaria despercebido até alguém reclamar que o produto sumiu do site. É o tipo de ganho que faz valer a pena, para quem trabalha com QA, entender um pouco de como o sistema funciona por dentro.',
                    },
                    {
                        type: "quote",
                        value: "Você não precisa saber programar para usar caixa-cinza. Precisa saber **fazer as perguntas certas**: o que essa ação muda no banco? Qual serviço ela chama? O que acontece se essa chamada falhar? Quase sempre quem programou responde em um minuto.",
                    },
                    {
                        type: "text",
                        value: '## Cobertura: a métrica da caixa-branca\n\nNa abordagem de caixa-branca aparece a palavra **cobertura**: qual porcentagem do código foi executada pelos testes. As formas mais comuns são cobertura de linhas (quais linhas rodaram), de comandos e de decisões (cada `if` foi testado com verdadeiro e com falso?).\n\nCobertura é uma bússola boa e uma meta ruim. Ela mostra bem o que **não** foi testado: se um trecho nunca é executado por nenhum teste, você sabe que ali é território desconhecido. Mas o contrário não vale: código coberto não significa código correto. Dá para executar todas as linhas sem verificar nada de útil, se o teste não faz asserção sobre o resultado.\n\nPor isso 100% de cobertura não é sinônimo de qualidade. É sinônimo de "todo o código foi executado durante os testes", o que é bem diferente de "todo o comportamento foi verificado".',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando o módulo:** níveis dizem **em que camada** você testa (unidade, integração, sistema, aceitação); tipos dizem **o que** você verifica (funcional e não funcional); reteste, regressão, smoke e sanidade dizem **com que objetivo** você executa; e caixa-preta, branca e cinza dizem **quanto você enxerga por dentro**. Quatro eixos independentes que se combinam.",
                    },
                ],
                questions: [
                    {
                        statement: "O que caracteriza o teste de caixa-preta?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Verificar entradas e saídas sem usar conhecimento da estrutura interna.",
                                isCorrect: true,
                            },
                            {
                                text: "Usar o conhecimento do código para desenhar cenários que cubram todos os caminhos.",
                                isCorrect: false,
                            },
                            {
                                text: "Combinar o conhecimento parcial do fluxo interno com a verificação pela interface externa.",
                                isCorrect: false,
                            },
                            {
                                text: "Medir qual porcentagem das linhas do código foi executada durante a bateria de testes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao cancelar um pedido, a tela mostra a mensagem certa e o status muda, mas o estoque não é devolvido. Qual abordagem tem mais chance de pegar esse defeito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Caixa-cinza, verificando também os efeitos no banco e nas integrações.",
                                isCorrect: true,
                            },
                            {
                                text: "Caixa-preta pura, observando apenas o que a interface apresenta para quem usa o sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Caixa-branca pura, analisando exclusivamente os caminhos possíveis dentro do código-fonte.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma delas, porque esse tipo de efeito só aparece em teste de carga sob demanda alta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, o que uma pessoa de QA precisa para usar a abordagem de caixa-cinza?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Saber fazer as perguntas certas sobre o que a ação muda por dentro.",
                                isCorrect: true,
                            },
                            {
                                text: "Saber programar na mesma linguagem usada pelo time de desenvolvimento do produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Ter acesso de escrita ao banco de dados de produção para conferir os registros gravados.",
                                isCorrect: false,
                            },
                            {
                                text: "Conhecer o esquema elétrico completo da arquitetura antes de escrever qualquer cenário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma suíte atinge 100% de cobertura de linhas. O que é correto concluir?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Que todo o código foi executado, mas não que o comportamento foi verificado.",
                                isCorrect: true,
                            },
                            {
                                text: "Que o sistema está livre de defeitos, já que nenhuma linha ficou fora dos testes.",
                                isCorrect: false,
                            },
                            {
                                text: "Que todos os requisitos funcionais e não funcionais foram cobertos pela bateria de testes.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a suíte pode substituir com segurança as atividades de teste exploratório do time.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para que a cobertura de código é realmente útil?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Para mostrar o que não foi testado, apontando território desconhecido.",
                                isCorrect: true,
                            },
                            {
                                text: "Para servir como meta contratual de qualidade acordada com o cliente do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Para comparar a produtividade entre as pessoas que escrevem testes na equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "Para substituir a priorização por risco na escolha do que deve ser testado primeiro.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Técnicas de projeto de teste",
        aulas: [
            {
                titulo: "Partição de equivalência",
                blocks: [
                    {
                        type: "text",
                        value: '## O problema: infinitos valores possíveis\n\nUm campo "idade" aceita, na prática, qualquer número. Zero, 17, 18, 64, 65, 200, menos 5, "abc", vazio. Testar todos é impossível, e testar um punhado escolhido no chute deixa buracos.\n\nA **partição de equivalência** resolve isso com uma ideia simples e poderosa: se dois valores fazem o sistema se comportar do **mesmo jeito**, testar um deles já representa o outro. Você agrupa os valores em classes de comportamento equivalente e testa **um representante de cada classe**.\n\nNão é preguiça, é economia guiada por lógica: se o sistema trata 30 e 45 exatamente igual, executar os dois não acrescenta informação nenhuma.',
                    },
                    {
                        type: "text",
                        value: '## Um exemplo passo a passo\n\nRegra: "clientes de 0 a 17 anos não podem contratar; de 18 a 64 pagam a tarifa cheia; de 65 anos em diante pagam meia".\n\nPrimeiro, encontre as classes **válidas**, aquelas que o sistema aceita e trata de um jeito:\n\n- 0 a 17: não pode contratar\n- 18 a 64: tarifa cheia\n- 65 ou mais: meia tarifa\n\nAgora, o que quase todo mundo esquece: as classes **inválidas**, aquelas que o sistema precisa recusar:\n\n- número negativo\n- valor não numérico ("abc")\n- campo vazio\n- valor absurdo (999)\n\nEscolha um representante de cada e você tem sete casos que cobrem o campo inteiro, em vez de duzentos escolhidos no chute.',
                    },
                    {
                        type: "table",
                        value: '[["Classe", "Tipo", "Representante", "Resultado esperado"], ["0 a 17", "Válida", "10", "Recusa a contratação por idade"], ["18 a 64", "Válida", "40", "Aceita com tarifa cheia"], ["65 ou mais", "Válida", "70", "Aceita com meia tarifa"], ["Negativo", "Inválida", "-3", "Mensagem de idade inválida"], ["Não numérico", "Inválida", "abc", "Mensagem de formato inválido"], ["Vazio", "Inválida", "(em branco)", "Mensagem de campo obrigatório"], ["Absurdo", "Inválida", "999", "Mensagem de idade inválida"]]',
                    },
                    {
                        type: "quote",
                        value: "A regra prática é: **uma classe, um caso**. E teste as classes inválidas **uma por vez**. Se você mandar idade negativa e email malformado no mesmo caso, e o sistema recusar, você não sabe qual das duas validações funcionou (e a outra pode estar quebrada).",
                    },
                    {
                        type: "text",
                        value: "## Onde as pessoas erram\n\n**Esquecer as classes inválidas.** É o erro mais comum. Quem está começando lista só o que o sistema aceita, e a metade que mais gera defeito fica de fora.\n\n**Confundir classe com valor.** Testar 30, 35, 40 e 45 parece caprichado, mas os quatro estão na mesma classe. São quatro execuções e a informação de uma só.\n\n**Não olhar as saídas.** A técnica também vale para o resultado, não só para a entrada. Se o sistema classifica clientes em bronze, prata e ouro, essas três saídas são classes que precisam de representante.\n\n**Partição por um campo só.** Quando a regra depende de dois campos juntos (idade e tipo de plano, por exemplo), a partição de um campo isolado não cobre a combinação. Aí a técnica certa é tabela de decisão, que a gente vê daqui a duas aulas.",
                    },
                    {
                        type: "text",
                        value: "## Um atalho mental\n\nAo olhar qualquer campo, faça três perguntas em sequência:\n\n1. **Quais faixas o sistema trata de forma diferente?** Cada faixa é uma classe válida.\n2. **O que ele precisa recusar?** Cada motivo de recusa é uma classe inválida.\n3. **Quais resultados diferentes ele pode produzir?** Cada resultado é uma classe de saída.\n\nTrês perguntas, e você sai com a lista de casos de um campo em poucos minutos, com justificativa para cada um. Isso também ajuda na hora de defender o escopo: você consegue explicar por que testou sete valores e não duzentos.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a ideia central da partição de equivalência?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Agrupar valores tratados igual e testar um representante de cada grupo.",
                                isCorrect: true,
                            },
                            {
                                text: "Testar sempre os valores que ficam exatamente nas fronteiras entre as faixas da regra.",
                                isCorrect: false,
                            },
                            {
                                text: "Combinar todas as condições possíveis numa tabela para cobrir cada regra de negócio.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar o sistema livremente, sem roteiro, procurando comportamentos inesperados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um campo aceita valores de 1 a 100. Testar 30, 40, 50 e 60 é uma boa escolha?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não, porque os quatro estão na mesma classe e trazem a mesma informação.",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, porque quanto mais valores forem executados, maior será a confiança no resultado.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, porque valores espalhados dentro da faixa cobrem melhor o comportamento do campo.",
                                isCorrect: false,
                            },
                            {
                                text: "Não, porque valores no meio da faixa nunca revelam defeito em nenhum tipo de sistema.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que a aula recomenda testar as classes inválidas uma por vez?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque com duas juntas você não sabe qual validação de fato funcionou.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o sistema pode travar ao receber mais de um valor inválido na mesma requisição.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque as ferramentas de automação não conseguem enviar dois campos inválidos juntos.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque as classes inválidas precisam ser executadas depois de todas as classes válidas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A regra diz: menores de 18 não contratam, de 18 a 64 pagam cheio, 65 ou mais pagam meia. Quantas classes válidas existem?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Três.",
                                isCorrect: true,
                            },
                            {
                                text: "Duas, porque o grupo que não pode contratar não gera uma tarifa válida no sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Sete, contando também as classes inválidas como negativo, vazio e não numérico.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma, porque todas as faixas se referem ao mesmo campo de idade do formulário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quando a partição de equivalência aplicada a um campo isolado deixa de ser suficiente?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Quando a regra depende da combinação de dois ou mais campos.",
                                isCorrect: true,
                            },
                            {
                                text: "Quando o campo aceita uma quantidade muito grande de valores numéricos diferentes.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o sistema exibe mensagens de erro diferentes para cada valor inválido recebido.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o time decide automatizar os casos em vez de executá-los de forma manual.",
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
                        value: '## Onde o defeito realmente mora\n\nSe a partição de equivalência diz "teste um valor de cada faixa", a **análise de valor limite** completa: "e teste principalmente os valores das **bordas** das faixas".\n\nO motivo é empírico e bem conhecido: a esmagadora maioria dos defeitos de faixa está no limite. Ninguém escreve `if (idade > 30)` por engano quando a regra é 65. Mas trocar `>` por `>=`, esquecer o "ou igual", errar por um no laço, isso acontece o tempo todo. Até tem nome: **erro de um a mais** (o famoso off-by-one).\n\nSe você tem tempo para poucos testes, teste as bordas.',
                    },
                    {
                        type: "text",
                        value: '## Como escolher os valores\n\nPara cada fronteira entre duas classes, você testa **o valor exato da borda e os vizinhos imediatos**.\n\nRegra de exemplo: "frete grátis para compras a partir de R$ 200".\n\nA fronteira está em 200. Os valores que interessam:\n\n- **199,99**: último valor antes da borda, deve cobrar frete\n- **200,00**: a borda exata, deve ser grátis\n- **200,01**: primeiro valor depois, deve ser grátis\n\nRepare que 50 e 800 são quase irrelevantes aqui: estão no meio das faixas e já foram representados pela partição. O valor de informação está concentrado nos três da fronteira.\n\nSe a regra tiver várias faixas, cada fronteira ganha o mesmo tratamento.',
                    },
                    {
                        type: "table",
                        value: '[["Regra", "Fronteira", "Valores a testar", "Comportamento esperado"], ["Frete grátis a partir de 200", "200", "199,99 / 200,00 / 200,01", "Cobra / grátis / grátis"], ["Senha de 8 a 20 caracteres", "8 e 20", "7 / 8 / 20 / 21", "Recusa / aceita / aceita / recusa"], ["Carrinho aceita até 10 itens", "10", "9 / 10 / 11", "Aceita / aceita / recusa"], ["Cupom válido até 31/12", "31/12 23:59", "31/12 23:59 / 01/01 00:00", "Válido / expirado"]]',
                    },
                    {
                        type: "quote",
                        value: "Toda vez que um requisito usa **acima de, a partir de, até, no mínimo, no máximo, entre**, existe uma fronteira escondida ali. E toda fronteira merece a pergunta: **o limite está dentro ou fora?** Se o requisito não deixa claro, você acabou de encontrar um defeito antes de existir código.",
                    },
                    {
                        type: "text",
                        value: '## Limites que não são números\n\nA técnica costuma ser ensinada com números, mas ela vale para qualquer coisa que tenha extremos:\n\n- **Texto**: campo vazio, um caractere, o tamanho máximo, o máximo mais um, e o que acontece com acento e emoji.\n- **Data e hora**: virada de dia, de mês, de ano, fim de semana, feriado, 29 de fevereiro, mudança de fuso.\n- **Listas**: nenhum item, um item, muitos itens, a última página da paginação.\n- **Arquivos**: arquivo vazio, no tamanho máximo permitido, um byte acima, formato não suportado.\n- **Estados**: o primeiro e o último passo de um fluxo, a transição que volta ao início.\n\nUma lista com zero itens é uma das maiores fontes de defeito em interface que existe: a tela quebra, mostra "undefined", divide por zero na média ou exibe um espaço em branco sem explicação.',
                    },
                    {
                        type: "text",
                        value: '## Combinando as duas técnicas\n\nPartição e valor limite são feitas para andar juntas, nesta ordem:\n\n1. **Particione**: identifique as faixas de comportamento, válidas e inválidas.\n2. **Encontre as fronteiras** entre elas.\n3. **Escolha os valores**: um representante do meio de cada faixa, mais os valores de borda.\n\nAplicando isso ao campo de senha de 8 a 20 caracteres: as classes são "menos de 8" (inválida), "de 8 a 20" (válida) e "mais de 20" (inválida). As fronteiras são 8 e 20. Os casos ficam: 7, 8, 14 (representante do meio), 20, 21. Cinco casos com justificativa, cobrindo o campo inteiro.',
                    },
                ],
                questions: [
                    {
                        statement: "Por que a análise de valor limite é tão eficaz?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Porque a maioria dos defeitos de faixa acontece exatamente nas bordas.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque os valores das bordas são os mais usados pelos clientes reais do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque testar as bordas dispensa a necessidade de aplicar a partição de equivalência.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque as ferramentas de automação executam valores extremos mais rápido que os demais.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'A regra diz "frete grátis para compras a partir de R$ 200". Quais valores concentram mais informação?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "199,99, 200,00 e 200,01.",
                                isCorrect: true,
                            },
                            {
                                text: "50,00, 200,00 e 800,00, cobrindo o começo, a fronteira e o fim da faixa de valores.",
                                isCorrect: false,
                            },
                            {
                                text: "100,00 e 300,00, um valor claramente abaixo e outro claramente acima da fronteira.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas 200,00, porque é o único valor mencionado explicitamente pela regra de negócio.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um campo de senha aceita de 8 a 20 caracteres. Quais valores de borda devem ser testados?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "7, 8, 20 e 21.",
                                isCorrect: true,
                            },
                            {
                                text: "8 e 20, que são exatamente os limites definidos pela regra descrita no requisito.",
                                isCorrect: false,
                            },
                            {
                                text: "1, 8, 20 e 100, cobrindo desde o menor valor possível até um valor bem acima do máximo.",
                                isCorrect: false,
                            },
                            {
                                text: "14, que representa o meio da faixa válida e portanto o comportamento normal do campo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, o que uma lista com zero itens costuma revelar em interfaces?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Defeitos como tela quebrada, texto indevido ou divisão por zero.",
                                isCorrect: true,
                            },
                            {
                                text: "Problemas de desempenho, porque a consulta ao banco demora mais quando não há registros.",
                                isCorrect: false,
                            },
                            {
                                text: "Falhas de segurança, já que a ausência de dados expõe a estrutura interna da aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Erros de compatibilidade que só aparecem em navegadores em versões mais antigas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a ordem correta ao combinar partição de equivalência e valor limite?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Particionar, encontrar as fronteiras e escolher meio e bordas.",
                                isCorrect: true,
                            },
                            {
                                text: "Testar as bordas primeiro e só depois dividir os valores restantes em classes distintas.",
                                isCorrect: false,
                            },
                            {
                                text: "Escolher valores no meio de cada faixa e ignorar as fronteiras entre elas por redundância.",
                                isCorrect: false,
                            },
                            {
                                text: "Montar a tabela de decisão e depois derivar as partições a partir das regras encontradas.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Tabela de decisão",
                blocks: [
                    {
                        type: "text",
                        value: '## Quando a regra depende de várias condições\n\nPartição e valor limite funcionam muito bem para um campo de cada vez. Mas a maioria das regras de negócio interessantes depende de **combinações**.\n\n"Cliente com plano premium e mais de um ano de casa tem desconto de 20%. Cliente premium com menos de um ano tem 10%. Cliente comum com mais de um ano tem 5%. Cliente comum recém-chegado não tem desconto."\n\nTestar "plano" e "tempo de casa" separadamente não cobre isso, porque o resultado depende dos dois juntos. Para esse tipo de regra existe a **tabela de decisão**.',
                    },
                    {
                        type: "text",
                        value: "## Como montar\n\nO procedimento tem quatro passos.\n\n1. **Liste as condições** (as entradas que influenciam a decisão).\n2. **Liste as ações** (os resultados possíveis).\n3. **Monte as combinações** das condições. Com duas condições de sim ou não, são quatro combinações; com três, oito.\n4. **Preencha a ação** de cada combinação.\n\nCada coluna preenchida vira **um caso de teste**. A tabela deixa visível o que a prosa esconde, e a pergunta mais valiosa aparece sozinha: *e a combinação que ninguém descreveu, o que faz?*",
                    },
                    {
                        type: "table",
                        value: '[["Condição / Ação", "Regra 1", "Regra 2", "Regra 3", "Regra 4"], ["É plano premium?", "Sim", "Sim", "Não", "Não"], ["Tem mais de 1 ano?", "Sim", "Não", "Sim", "Não"], ["Desconto aplicado", "20%", "10%", "5%", "Nenhum"]]',
                    },
                    {
                        type: "text",
                        value: '## O poder de revelar buraco no requisito\n\nEste é o principal ganho da técnica, e vale mais do que os casos que ela gera.\n\nImagine a regra: "para liberar o saque, o usuário precisa ter conta verificada e saldo suficiente; se estiver com pendência cadastral, o saque é bloqueado".\n\nTrês condições: verificada, saldo suficiente, pendência. São oito combinações. Ao montar a tabela, aparece a pergunta: e um usuário **não verificado, sem saldo e com pendência**? A mensagem de erro é qual das três? Mostra todas? Qual tem prioridade?\n\nO requisito não responde. Ninguém pensou nisso. E essa é uma pergunta de trinta segundos no refinamento que evitaria um bug com discussão de meia hora depois.',
                    },
                    {
                        type: "quote",
                        value: "A tabela de decisão é, antes de tudo, uma **ferramenta de análise de requisito**. Ela força a explicitar toda combinação, e as combinações que ninguém previu são exatamente onde os defeitos se escondem.",
                    },
                    {
                        type: "text",
                        value: '## Quando a tabela fica grande demais\n\nCom quatro condições de sim ou não já são dezesseis combinações; com seis, sessenta e quatro. Nem toda combinação vale um teste. Duas saídas:\n\n**Elimine as impossíveis.** Muitas combinações não existem no mundo real. Se "cliente é menor de idade" e "cliente tem CNH definitiva" não podem ser verdade ao mesmo tempo, aquela coluna some.\n\n**Agrupe as que não importam.** Quando uma condição não muda o resultado, ela vira um traço na tabela. Se pendência cadastral bloqueia o saque **independentemente** do resto, uma linha só cobre quatro combinações: pendência sim, o resto tanto faz, resultado bloqueado.\n\nDepois de eliminar e agrupar, uma tabela de dezesseis colunas costuma virar cinco ou seis casos reais. E cada um com uma justificativa clara de por que existe, que é o que você quer quando alguém perguntar por que a bateria tem esse tamanho.',
                    },
                ],
                questions: [
                    {
                        statement: "Quando a tabela de decisão é a técnica mais adequada?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Quando o resultado depende da combinação de várias condições.",
                                isCorrect: true,
                            },
                            {
                                text: "Quando um campo numérico aceita uma faixa ampla de valores diferentes entre si.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o sistema muda de estado conforme os eventos recebidos ao longo do fluxo.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando não existe requisito escrito e é preciso explorar o sistema livremente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com três condições de sim ou não, quantas combinações a tabela terá antes de qualquer simplificação?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Oito.",
                                isCorrect: true,
                            },
                            {
                                text: "Seis, resultado da multiplicação entre o número de condições e o número de valores.",
                                isCorrect: false,
                            },
                            {
                                text: "Três, uma para cada condição que influencia a decisão descrita na regra de negócio.",
                                isCorrect: false,
                            },
                            {
                                text: "Nove, resultado de elevar o número de condições ao quadrado conforme a técnica indica.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Segundo a aula, qual é o principal ganho da tabela de decisão?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Revelar as combinações que o requisito não descreveu.",
                                isCorrect: true,
                            },
                            {
                                text: "Reduzir a quantidade total de casos de teste executados pelo time em cada entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "Substituir a análise de valor limite na verificação de campos numéricos com faixas.",
                                isCorrect: false,
                            },
                            {
                                text: "Permitir que os casos gerados sejam automatizados sem esforço adicional pela equipe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma condição bloqueia a operação independentemente das demais. Como isso simplifica a tabela?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Vira uma linha com traço nas outras condições, cobrindo várias combinações.",
                                isCorrect: true,
                            },
                            {
                                text: "Obriga a remover essa condição da tabela, porque ela não influencia mais o resultado final.",
                                isCorrect: false,
                            },
                            {
                                text: "Exige que a tabela seja dividida em duas, uma para cada valor possível dessa condição.",
                                isCorrect: false,
                            },
                            {
                                text: "Faz com que todas as demais combinações precisem ser testadas em dobro por precaução.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual combinação a tabela ajudaria a descobrir na regra de saque com conta verificada, saldo e pendência?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Usuário não verificado, sem saldo e com pendência ao mesmo tempo.",
                                isCorrect: true,
                            },
                            {
                                text: "Usuário verificado, com saldo suficiente e sem pendência, que é o caminho principal.",
                                isCorrect: false,
                            },
                            {
                                text: "Usuário que tenta sacar um valor exatamente igual ao saldo disponível em sua conta.",
                                isCorrect: false,
                            },
                            {
                                text: "Usuário que faz vários saques seguidos dentro do mesmo dia útil de funcionamento.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Transição de estados",
                blocks: [
                    {
                        type: "text",
                        value: '## Quando a ordem importa\n\nAlgumas funcionalidades não dependem só do que você faz, mas de **em que situação o sistema está** quando você faz.\n\nUm pedido pode estar aguardando pagamento, pago, em separação, enviado, entregue ou cancelado. A ação "cancelar" tem resultados diferentes conforme o estado: cancelar um pedido aguardando pagamento é trivial; cancelar um pedido enviado exige logística reversa; cancelar um pedido entregue provavelmente nem deveria ser possível.\n\nQuando o comportamento depende do histórico, a técnica é o **teste de transição de estados**.',
                    },
                    {
                        type: "text",
                        value: "## Os quatro elementos\n\nUm modelo de estados tem quatro peças:\n\n- **Estados**: as situações possíveis (aguardando pagamento, pago, enviado, entregue, cancelado).\n- **Eventos**: o que acontece e pode mudar o estado (pagar, separar, despachar, confirmar entrega, cancelar).\n- **Transições**: quais mudanças de estado são permitidas para cada evento.\n- **Ações**: os efeitos colaterais de uma transição (baixar estoque, enviar email, estornar valor).\n\nDesenhar isso, mesmo num papel, quase sempre revela transição que ninguém tinha pensado.",
                    },
                    {
                        type: "table",
                        value: '[["Estado atual", "Evento", "Estado seguinte", "Ação"], ["Aguardando pagamento", "Pagar", "Pago", "Confirma reserva e avisa o cliente"], ["Aguardando pagamento", "Cancelar", "Cancelado", "Libera o estoque reservado"], ["Pago", "Despachar", "Enviado", "Gera etiqueta e envia rastreio"], ["Pago", "Cancelar", "Cancelado", "Estorna o valor e libera o estoque"], ["Enviado", "Confirmar entrega", "Entregue", "Encerra o pedido"], ["Enviado", "Cancelar", "Não permitido", "Recusa com mensagem clara"], ["Entregue", "Cancelar", "Não permitido", "Direciona para devolução"]]',
                    },
                    {
                        type: "text",
                        value: "## Os dois tipos de teste que saem daí\n\n**Transições válidas.** Percorrer os caminhos permitidos e conferir que o estado muda como deveria e que as ações acontecem. Cancelar um pedido pago precisa estornar **e** liberar o estoque: verificar só o status na tela deixa metade do comportamento sem cobertura.\n\n**Transições inválidas.** Esta é a parte que gera os defeitos mais interessantes, e a que quase todo mundo esquece. Tentar cancelar um pedido já entregue, tentar despachar um pedido não pago, tentar pagar duas vezes o mesmo pedido.\n\nO sistema deve **recusar com clareza**, e não travar, duplicar o efeito nem entrar num estado impossível. Muito bug de produção é exatamente isto: uma transição que deveria ser impossível e ninguém bloqueou.",
                    },
                    {
                        type: "quote",
                        value: 'Um cenário que rende defeito em quase todo sistema: **execute o mesmo evento duas vezes seguidas**. Clicar duas vezes em "confirmar pagamento", enviar o formulário de novo pelo botão de voltar do navegador, receber a mesma notificação do gateway em duplicidade. Se a segunda execução não for ignorada, aparece pedido duplicado, cobrança dobrada ou estoque negativo.',
                    },
                    {
                        type: "text",
                        value: '## Onde essa técnica aparece\n\nSempre que você ouvir a palavra "status", provavelmente tem um modelo de estados por trás:\n\n- Pedido, entrega, devolução\n- Assinatura (ativa, inadimplente, cancelada, em teste)\n- Chamado de suporte (aberto, em análise, aguardando cliente, resolvido, reaberto)\n- Sessão de usuário (anônimo, autenticado, expirado, bloqueado)\n- Documento (rascunho, em revisão, aprovado, publicado, arquivado)\n\nUma dica prática de análise: procure os estados que **não têm saída** e os que **não têm entrada**. Estado sem saída pode ser um beco sem saída não intencional, onde o registro fica preso para sempre. Estado sem entrada é código morto, ou pior, um estado alcançável por um caminho que ninguém mapeou.',
                    },
                ],
                questions: [
                    {
                        statement: "Quando o teste de transição de estados é a técnica indicada?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Quando o comportamento depende da situação em que o sistema está.",
                                isCorrect: true,
                            },
                            {
                                text: "Quando um campo numérico precisa ser verificado nos limites das faixas definidas.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o resultado depende da combinação de várias condições independentes entre si.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando não existe documentação e é preciso investigar o sistema de forma livre.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quais são os quatro elementos de um modelo de estados?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Estados, eventos, transições e ações.",
                                isCorrect: true,
                            },
                            {
                                text: "Condições, ações, regras e combinações organizadas em colunas dentro de uma tabela.",
                                isCorrect: false,
                            },
                            {
                                text: "Classes válidas, classes inválidas, fronteiras e representantes escolhidos para o teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Entradas, saídas, caminhos possíveis e cobertura de decisão obtida no código-fonte.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que testar transições inválidas costuma render defeitos interessantes?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque muitas transições impossíveis simplesmente não foram bloqueadas.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque elas ocorrem com mais frequência do que as transições válidas no uso real.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque exigem menos dados de preparação do que os cenários de caminho permitido.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque só podem ser reproduzidas em produção, onde os defeitos são mais graves.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao cancelar um pedido pago, o status muda para cancelado na tela. O que ainda precisa ser verificado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "As ações da transição, como o estorno e a liberação do estoque.",
                                isCorrect: true,
                            },
                            {
                                text: "O tempo de resposta da operação de cancelamento em comparação com outras operações.",
                                isCorrect: false,
                            },
                            {
                                text: "A compatibilidade da tela de cancelamento com os navegadores suportados pelo produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Se o texto da mensagem exibida segue o padrão de escrita definido pela equipe de design.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Segundo a aula, o que um estado sem saída pode indicar?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Um beco sem saída onde o registro fica preso para sempre.",
                                isCorrect: true,
                            },
                            {
                                text: "Um estado que nunca é alcançado por nenhum evento previsto no modelo desenhado.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma transição inválida que o sistema permite executar por falta de bloqueio no código.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma combinação de condições que a tabela de decisão não conseguiu representar direito.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Teste exploratório e baseado em experiência",
                blocks: [
                    {
                        type: "text",
                        value: "## O que nenhum roteiro cobre\n\nTodas as técnicas até aqui partem de algo escrito: requisito, regra, modelo. Elas são excelentes para verificar o que **se sabe** que precisa funcionar.\n\nMas boa parte dos defeitos mora naquilo que ninguém pensou em escrever. Para esse território existe uma família de abordagens **baseadas em experiência**, e a mais importante delas é o **teste exploratório**.\n\nTeste exploratório é aprendizado, projeto e execução ao mesmo tempo: você usa o sistema, aprende como ele reage, e cada descoberta define o próximo passo. Não é clicar sem rumo. É investigação com método, só que o roteiro se escreve enquanto anda.",
                    },
                    {
                        type: "text",
                        value: '## O que separa exploração de bagunça\n\nA diferença está em três coisas: **missão, tempo e registro**.\n\n**Missão.** Toda sessão começa com um objetivo escrito em uma frase: "explorar o cadastro de clientes com foco em dados inválidos e caracteres especiais". Sem missão, a pessoa passeia pelas telas que já conhece.\n\n**Tempo.** A sessão tem duração combinada, normalmente de 45 a 90 minutos. Tempo fechado obriga a priorizar e evita o buraco negro de passar o dia numa tela só.\n\n**Registro.** Durante a sessão você anota o que testou, o que achou estranho, o que não deu para testar e as perguntas que surgiram. Sem registro, o conhecimento morre com a sessão e ninguém consegue repetir nem cobrar.\n\nEssa combinação tem nome: **teste baseado em sessões**. É o que transforma exploração em atividade gerenciável, com resultado que dá para mostrar numa reunião.',
                    },
                    {
                        type: "table",
                        value: '[["", "Teste roteirizado", "Teste exploratório"], ["Quando o roteiro nasce", "Antes da execução", "Durante a execução"], ["Melhor para", "Verificar o que já se sabe, regressão, evidência", "Descobrir o desconhecido e o inesperado"], ["Repetibilidade", "Alta, qualquer um executa igual", "Baixa, depende de quem executa"], ["O que registra", "Resultado de cada passo previsto", "Missão, achados, dúvidas e cobertura"], ["Ponto fraco", "Só encontra o que foi previsto", "Difícil de auditar e de repetir sem notas"]]',
                    },
                    {
                        type: "text",
                        value: "## As outras abordagens baseadas em experiência\n\n**Suposição de erro.** Você usa a experiência para adivinhar onde o defeito provavelmente está e ataca direto. Com o tempo, todo mundo acumula a própria lista: campo de texto com aspas simples, nome com acento, upload de arquivo vazio, dois cliques rápidos no botão, voltar no navegador no meio do fluxo, sessão que expira durante o preenchimento, valor zero, valor negativo.\n\n**Teste baseado em checklist.** Uma lista de verificações acumuladas pela equipe, aplicada a qualquer tela nova: campos obrigatórios sinalizam erro, mensagens são compreensíveis, funciona no celular, dá para navegar por teclado, o botão não permite envio duplo. Menos rígido que um caso de teste e ótimo para não esquecer o básico.\n\n**Ataques de defeito.** Uma lista organizada de tipos de defeito conhecidos, usada como cardápio de ideias para atacar uma funcionalidade específica.",
                    },
                    {
                        type: "quote",
                        value: "Roteiro e exploração não competem: eles cobrem coisas diferentes. O roteiro protege o que você já sabe que precisa funcionar. A exploração descobre o que ninguém previu. Time que só faz roteiro para de encontrar novidade (é o paradoxo do pesticida em ação); time que só explora não consegue garantir que o básico continua de pé.",
                    },
                    {
                        type: "text",
                        value: '## Como fazer uma boa sessão\n\nUm roteiro simples para a sua primeira sessão exploratória:\n\n1. **Escolha a missão** e escreva em uma frase.\n2. **Reserve o tempo** e tire as distrações. Uma hora vale mais que um dia fragmentado.\n3. **Prepare o registro**: uma nota aberta, e se possível a gravação da tela, que resolve o "consegue reproduzir?" depois.\n4. **Explore variando o ângulo**: use como um novato, use com pressa, use errado de propósito, interrompa no meio, volte, atualize a página, mude a ordem dos passos.\n5. **Anote tudo que chamar atenção**, mesmo o que parecer bobagem. O "estranho, mas deve ser assim" costuma ser bug.\n6. **Feche com um resumo**: o que cobriu, o que achou, o que ficou de fora, o que investigar na próxima.\n\nE uma dica que vale ouro no começo: preste atenção em quando **você** ficou confuso usando o sistema. Sua confusão é dado. Se você, que está olhando com atenção, hesitou, quem está com pressa vai errar.',
                    },
                ],
                questions: [
                    {
                        statement: "O que caracteriza o teste exploratório?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Aprender, projetar e executar ao mesmo tempo, guiado pelas descobertas.",
                                isCorrect: true,
                            },
                            {
                                text: "Executar um roteiro previamente escrito, registrando o resultado de cada passo previsto.",
                                isCorrect: false,
                            },
                            {
                                text: "Usar o sistema sem objetivo definido até encontrar algum comportamento que pareça errado.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificar apenas as combinações de condições que foram mapeadas na tabela de decisão.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quais três elementos separam a exploração da bagunça?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Missão, tempo e registro.",
                                isCorrect: true,
                            },
                            {
                                text: "Roteiro, dados de teste e ambiente configurado antes do início de cada sessão executada.",
                                isCorrect: false,
                            },
                            {
                                text: "Automação, cobertura de código e integração contínua rodando a cada alteração enviada.",
                                isCorrect: false,
                            },
                            {
                                text: "Priorização, rastreabilidade e aprovação formal do plano por parte de quem gerencia.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma pessoa testa direto o campo de texto com aspas simples e acentos, por saber que ali costuma dar problema. Que abordagem é essa?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Suposição de erro.",
                                isCorrect: true,
                            },
                            {
                                text: "Teste baseado em checklist, aplicando uma lista fixa de verificações a cada tela nova.",
                                isCorrect: false,
                            },
                            {
                                text: "Partição de equivalência, agrupando valores por comportamento equivalente do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Teste de transição de estados, verificando o comportamento conforme o histórico do fluxo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o ponto fraco do teste roteirizado?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Só encontra aquilo que foi previsto quando o roteiro foi escrito.",
                                isCorrect: true,
                            },
                            {
                                text: "Depende muito da experiência de quem executa e não pode ser repetido por outra pessoa.",
                                isCorrect: false,
                            },
                            {
                                text: "Não gera evidência do que foi verificado, o que dificulta a auditoria da entrega feita.",
                                isCorrect: false,
                            },
                            {
                                text: "Consome mais tempo do que a exploração para cobrir a mesma quantidade de cenários.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, por que a própria confusão de quem testa é um dado relevante?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque quem está com pressa provavelmente vai errar no mesmo ponto.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque indica que a pessoa ainda não conhece bem as regras de negócio do produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque toda hesitação durante a execução caracteriza um defeito de usabilidade grave.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a confusão atrapalha a sessão e deve ser registrada para ajustar o roteiro depois.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Casos de teste, defeitos e evidências",
        aulas: [
            {
                titulo: "Escrevendo um caso de teste que qualquer um executa",
                blocks: [
                    {
                        type: "text",
                        value: '## O teste de fogo de um caso de teste\n\nUm caso de teste bem escrito passa num teste simples: **outra pessoa consegue executá-lo sem te perguntar nada**. Se para rodar o caso é preciso te chamar, saber qual usuário usar ou adivinhar o que significa "verificar se está tudo certo", ele não está pronto.\n\nIsso importa por três motivos práticos: outra pessoa vai executar quando você estiver de férias, você mesmo vai executar daqui a seis meses sem lembrar de nada, e um dia esse caso vai virar automação, e quem for automatizar precisa entender exatamente o que verificar.',
                    },
                    {
                        type: "text",
                        value: '## As partes de um caso de teste\n\n**Título.** Diz o que é verificado, de forma específica. "Testar login" é ruim. "Login com senha incorreta exibe mensagem e não autentica" é bom: já se sabe o cenário e o esperado.\n\n**Pré-condições.** O que precisa ser verdade antes de começar: qual ambiente, qual usuário, qual dado precisa existir. É a parte mais esquecida e a que mais gera "na minha máquina passou".\n\n**Passos.** Numerados, na ordem, com o dado exato. Não "preencher o formulário", e sim "preencher email com teste@exemplo.com e senha com Abc12345".\n\n**Resultado esperado.** O que deve acontecer, de forma verificável. Não "o sistema funciona", e sim "a mensagem \'Email ou senha inválidos\' aparece abaixo do campo e o usuário permanece na tela de login".\n\n**Pós-condições** (quando importar). O estado em que o sistema fica, principalmente se o caso alterou dados que outros casos vão usar.',
                    },
                    {
                        type: "code",
                        value: 'Título: Login com senha incorreta exibe mensagem e não autentica\n\nPré-condições:\n  - Ambiente: homologação\n  - Existe o usuário maria@exemplo.com com senha Senha@2026\n  - Nenhuma sessão ativa no navegador\n\nPassos:\n  1. Acessar /login\n  2. Preencher Email com: maria@exemplo.com\n  3. Preencher Senha com: SenhaErrada1\n  4. Clicar em Entrar\n\nResultado esperado:\n  - Mensagem "Email ou senha inválidos" abaixo do campo Senha\n  - A pessoa permanece em /login\n  - Nenhum cookie de sessão é criado\n  - O campo Email mantém o valor digitado',
                    },
                    {
                        type: "text",
                        value: '## Erros comuns e como evitar\n\n**Caso gigante.** Um caso que cadastra, edita, compra e cancela testa quatro coisas. Se falhar no passo 12, você não sabe o estado real e não consegue reportar direito. Prefira **um objetivo por caso**.\n\n**Resultado esperado vago.** "Deve funcionar", "deve dar erro", "deve estar correto". Se duas pessoas podem discordar sobre se passou, o resultado não está escrito.\n\n**Dado que não existe mais.** Casos que dependem de um pedido específico ou de um saldo que alguém já gastou quebram sozinhos. Ou crie o dado no próprio caso, ou deixe explícito na pré-condição como obtê-lo.\n\n**Passo dependente do anterior.** Se o caso 5 só funciona depois do caso 4, você não pode executar só o 5 nem rodar em ordem diferente. Cada caso deve ser independente.\n\n**Descrever a interface em excesso.** "Clicar no terceiro botão azul da direita" quebra assim que o design muda. Prefira o rótulo: "clicar em Entrar".',
                    },
                    {
                        type: "quote",
                        value: 'Um caso de teste tem dois leitores: **quem executa hoje** e **quem automatiza amanhã**. Escrever para os dois significa ser específico no dado e no resultado, e genérico no caminho: o que verificar não muda com o layout, mas "o botão azul da direita" muda.',
                    },
                    {
                        type: "text",
                        value: '## Quanto detalhe é detalhe demais\n\nNem todo caso precisa desse nível. A regra é calibrar pelo uso:\n\n- **Muito detalhe** quando o caso é crítico, será executado por outra pessoa, precisa virar evidência para auditoria ou vai ser automatizado.\n- **Pouco detalhe** quando quem escreve é quem executa, o cenário é simples ou o produto ainda vai mudar bastante.\n\nEm time ágil é comum usar um formato enxuto: uma linha de cenário e a expectativa, no estilo "dado que o cupom expirou ontem, quando aplico no carrinho, então vejo a mensagem de cupom expirado". Cabe num comentário da história, o time inteiro entende, e ainda vira automação com facilidade. Esse formato tem nome, é o Gherkin, e a gente vê no módulo 6.',
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o teste de fogo de um caso de teste bem escrito?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Outra pessoa consegue executá-lo sem precisar tirar dúvidas com quem escreveu.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele cobre a maior quantidade possível de funcionalidades em uma única execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele pode ser automatizado sem nenhuma alteração no texto original que foi escrito.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele descreve com precisão a posição de cada elemento na interface da aplicação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual resultado esperado está escrito de forma adequada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: 'A mensagem "Email ou senha inválidos" aparece e a pessoa permanece na tela.',
                                isCorrect: true,
                            },
                            {
                                text: "O sistema deve funcionar corretamente ao receber uma senha que não seja a cadastrada.",
                                isCorrect: false,
                            },
                            {
                                text: "O login não deve ser realizado quando os dados informados estiverem incorretos.",
                                isCorrect: false,
                            },
                            {
                                text: "Deve aparecer um aviso adequado informando o problema encontrado na autenticação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que um caso de teste gigante, que cadastra, edita, compra e cancela, é problemático?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Se falhar no meio, fica difícil saber o estado real e reportar direito.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque leva mais tempo para ser executado do que vários casos pequenos separados.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque ferramentas de automação têm limite de passos por cenário implementado.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque não permite registrar evidências durante a execução de cada etapa realizada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Qual é o problema de escrever "clicar no terceiro botão azul da direita"?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "O caso quebra assim que o design da tela mudar.",
                                isCorrect: true,
                            },
                            {
                                text: "O passo fica longo demais e dificulta a leitura por quem for executar o caso depois.",
                                isCorrect: false,
                            },
                            {
                                text: "Não é possível automatizar passos que descrevem cores de elementos na interface.",
                                isCorrect: false,
                            },
                            {
                                text: "A ferramenta de gestão de testes não aceita descrições visuais nos campos de passo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, quando vale a pena escrever um caso de teste com muito detalhe?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Quando é crítico, será executado por outra pessoa ou vai virar automação.",
                                isCorrect: true,
                            },
                            {
                                text: "Sempre, porque o detalhe é o que diferencia um caso profissional de um improvisado.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o produto ainda está em fase inicial e as telas mudam a cada nova sprint.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando quem escreve é a mesma pessoa que vai executar o caso durante o ciclo.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Plano de teste e estratégia",
                blocks: [
                    {
                        type: "text",
                        value: '## Para que serve um plano\n\nA palavra "plano" assusta, porque lembra documento de cem páginas que ninguém lê. Esqueça o formato por um instante e olhe a função: o plano existe para o time **combinar antes** o que faria discutir depois.\n\nEle responde a perguntas que, sem resposta prévia, viram conflito no pior momento: o que vai ser testado? Até onde? Em qual ambiente? Com quais dados? Quem faz o quê? Quando é seguro parar? O que a gente aceita não cobrir?\n\nEm time ágil, isso pode ser uma página no Confluence, um card fixado ou uma seção no README. O tamanho é irrelevante; combinar não é.',
                    },
                    {
                        type: "text",
                        value: "## O que um plano precisa responder\n\n**Escopo.** O que entra e, mais importante, **o que não entra**. Plano que só diz o que entra deixa todo mundo achando que o resto está coberto.\n\n**Estratégia por nível e tipo.** Quem cuida do teste de unidade, o que é verificado na integração, o que é testado manualmente e o que é automatizado, quais características não funcionais entram nesta fase.\n\n**Riscos e prioridades.** As áreas de maior risco e a profundidade que cada uma recebe.\n\n**Ambientes e dados.** Onde o teste roda, como o dado é criado, como o ambiente volta ao estado inicial.\n\n**Critérios de entrada e saída.** Quando começar e quando parar.\n\n**Papéis.** Quem executa, quem aprova, quem decide em caso de divergência.\n\n**Evidências.** O que precisa ser registrado e por quanto tempo, quando existe exigência de auditoria ou regulação.",
                    },
                    {
                        type: "table",
                        value: '[["Pergunta", "Sem resposta combinada", "Com resposta combinada"], ["O que não vamos testar?", "Todo mundo supõe que está coberto", "Risco assumido de forma consciente"], ["Qual ambiente?", "Defeito que só existe no ambiente errado", "Resultado confiável e reproduzível"], ["Como criar os dados?", "Cada um cria do seu jeito e o teste falha", "Massa previsível e reaproveitável"], ["Quando parar?", "Para quando acaba o prazo", "Para quando o risco fica aceitável"], ["Quem decide se sobe?", "Discussão na véspera da entrega", "Decisão rápida e sem atrito"]]',
                    },
                    {
                        type: "text",
                        value: "## Estratégia: como escolher a abordagem\n\nEstratégia é a parte do plano que define **como** testar, e ela muda conforme o contexto. As abordagens mais comuns:\n\n- **Baseada em risco**: prioriza pelo risco calculado. É a abordagem padrão da maioria dos times de produto.\n- **Baseada em requisito**: deriva os casos direto da especificação, garantindo rastreabilidade de cada item. Comum em contexto regulado.\n- **Baseada em modelo**: usa modelos, como o de estados, para gerar os casos.\n- **Reativa**: exploração e reação ao que o sistema mostra, com pouco planejamento prévio. Boa quando a documentação é escassa.\n- **Baseada em padrões**: segue uma norma obrigatória do setor (saúde, aviação, financeiro).\n\nNa prática você combina duas ou três. O erro é não escolher: quando ninguém define a abordagem, cada pessoa usa a sua, e o resultado é cobertura irregular sem que ninguém perceba.",
                    },
                    {
                        type: "quote",
                        value: 'A parte mais valiosa do plano não é a lista do que será testado. É a lista do que **não** será, com o risco assumido escrito ao lado. Essa é a informação que ninguém tem quando o defeito aparece e todo mundo pergunta "mas isso não foi testado?".',
                    },
                    {
                        type: "text",
                        value: "## Um plano enxuto que funciona\n\nSe você precisa começar hoje, num time que não tem nada disso, uma página com estes sete tópicos já resolve a maior parte:\n\n1. **O que vamos testar** nesta entrega, em ordem de risco.\n2. **O que não vamos testar**, e por quê.\n3. **Onde** (ambiente) e **com quais dados**.\n4. **O que é automatizado** e o que é manual.\n5. **Quando começamos** (critério de entrada).\n6. **Quando paramos** (critério de saída).\n7. **Quem decide** se a entrega sobe.\n\nEscreva, mostre ao time e ajuste com o que eles apontarem. Um plano de uma página que o time leu e concordou vale infinitamente mais que trinta páginas que ninguém abriu.",
                    },
                ],
                questions: [
                    {
                        statement: "Para que serve principalmente um plano de teste?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Combinar antes aquilo que o time discutiria depois, no pior momento.",
                                isCorrect: true,
                            },
                            {
                                text: "Registrar formalmente todos os casos de teste que serão executados na entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "Documentar a arquitetura do sistema para quem for dar manutenção no futuro.",
                                isCorrect: false,
                            },
                            {
                                text: "Comprovar para a auditoria que a equipe de qualidade cumpriu o processo definido.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Segundo a aula, qual é a parte mais valiosa do plano?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A lista do que não será testado, com o risco assumido ao lado.",
                                isCorrect: true,
                            },
                            {
                                text: "A lista completa dos casos de teste projetados para cobrir todos os requisitos.",
                                isCorrect: false,
                            },
                            {
                                text: "O cronograma detalhado com as datas de início e fim de cada atividade prevista.",
                                isCorrect: false,
                            },
                            {
                                text: "A definição dos papéis e responsabilidades de cada pessoa envolvida no projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um time trabalha em um sistema de saúde com norma obrigatória do setor. Qual abordagem de estratégia isso exige?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Baseada em padrões.",
                                isCorrect: true,
                            },
                            {
                                text: "Reativa, com exploração e reação ao que o sistema apresentar durante a execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Baseada em modelo, gerando os casos a partir de diagramas de estados desenhados.",
                                isCorrect: false,
                            },
                            {
                                text: "Baseada em risco, priorizando as áreas com maior probabilidade e maior impacto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece quando ninguém define a abordagem de teste do time?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Cada pessoa usa a sua, e a cobertura fica irregular sem ninguém perceber.",
                                isCorrect: true,
                            },
                            {
                                text: "O time passa a executar apenas testes exploratórios, por falta de roteiro definido.",
                                isCorrect: false,
                            },
                            {
                                text: "A quantidade de defeitos encontrados aumenta, porque não há restrição de escopo.",
                                isCorrect: false,
                            },
                            {
                                text: "Os testes automatizados deixam de rodar, já que não há critério de entrada acordado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação sobre o tamanho de um plano de teste é coerente com a aula?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Uma página lida e acordada pelo time vale mais que trinta que ninguém abriu.",
                                isCorrect: true,
                            },
                            {
                                text: "Quanto mais completo o documento, maior a garantia de que a cobertura será adequada.",
                                isCorrect: false,
                            },
                            {
                                text: "Times ágeis não precisam de plano, porque a estratégia emerge naturalmente na sprint.",
                                isCorrect: false,
                            },
                            {
                                text: "O plano deve ter tamanho fixo, definido pela norma adotada pela empresa contratante.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Reportando um bug que o dev consegue corrigir",
                blocks: [
                    {
                        type: "text",
                        value: '## O relatório é o seu produto\n\nEncontrar o defeito é metade do trabalho. A outra metade é comunicá-lo de um jeito que leve à correção rápida.\n\nUm relatório ruim gera um ciclo caro e irritante: o desenvolvedor não reproduz, devolve o bug com "não consegui reproduzir", você tenta de novo, descobre que faltava um detalhe do ambiente, reabre, e dois dias se passaram sem uma linha corrigida.\n\nUm relatório bom faz o contrário: a pessoa lê, reproduz de primeira, entende o esperado e corrige. É por isso que se diz que o **relatório de defeito é o principal produto escrito de quem trabalha com QA**.',
                    },
                    {
                        type: "text",
                        value: '## O que todo bom relatório tem\n\n**Título específico.** Deve dizer o quê, onde e quando. "Erro no checkout" é ruim. "Checkout: cupom expirado é aceito e aplica desconto no total" é bom, e já dá para priorizar sem abrir.\n\n**Ambiente.** Onde aconteceu: qual ambiente, qual versão, qual navegador e sistema, qual usuário ou perfil. Metade dos "não reproduzi" morre aqui.\n\n**Passos para reproduzir.** Numerados, do zero, com os dados exatos. Comece do login, não do meio.\n\n**Resultado esperado.** O que deveria acontecer, e de onde vem essa expectativa: o requisito, a regra, o critério de aceitação.\n\n**Resultado obtido.** O que de fato aconteceu, com a mensagem exata que apareceu na tela.\n\n**Evidência.** Print, vídeo, log, id da requisição. Vídeo curto vale mais que dez linhas de texto.\n\n**Frequência.** Sempre acontece ou de vez em quando? Bug intermitente exige abordagem diferente, e essa informação muda a estratégia de investigação.',
                    },
                    {
                        type: "code",
                        value: 'Título: Checkout: cupom expirado é aceito e aplica 10% de desconto\n\nAmbiente:\n  homologação v2.14.0 | Chrome 130 | Windows 11 | perfil: cliente comum\n\nPassos para reproduzir:\n  1. Entrar com cliente1@exemplo.com / Senha@2026\n  2. Adicionar o produto SKU-4471 ao carrinho\n  3. Ir para o checkout\n  4. Aplicar o cupom PROMO10 (expirado em 30/06/2026)\n  5. Observar o resumo do pedido\n\nResultado esperado:\n  Mensagem "Cupom expirado" e total sem desconto (critério de\n  aceitação 3 da história EC-812)\n\nResultado obtido:\n  Cupom aceito, mensagem "Cupom aplicado" e total com 10% de desconto\n\nFrequência: sempre (5 de 5 tentativas)\nEvidência: video-cupom-expirado.mp4, requisição id 8f3a21',
                    },
                    {
                        type: "quote",
                        value: "Antes de enviar, faça o **teste do estranho**: entregue o relatório para alguém que não acompanhou nada e veja se essa pessoa reproduz sozinha. Se ela travar em algum passo, é ali que falta informação.",
                    },
                    {
                        type: "text",
                        value: '## O que evitar\n\n**Julgamento em vez de fato.** "O sistema está uma bagunça" não ajuda. Descreva o comportamento, não a sua avaliação dele.\n\n**Vários defeitos num relatório só.** Cada um tem prioridade, causa e correção diferentes. Junte-os e um deles vai ser esquecido quando o outro for corrigido.\n\n**Suposição de causa apresentada como fato.** Escrever "o problema é no banco de dados" quando você não verificou envia a investigação para o lado errado. Se tiver uma hipótese, marque como hipótese.\n\n**Falta do esperado.** Sem ele, o desenvolvedor decide sozinho qual é o comportamento certo, e às vezes decide diferente do que o produto queria.\n\n**Bug que é dúvida.** Às vezes o comportamento é intencional e você não sabia. Perguntar antes de abrir economiza o tempo de todo mundo, e ninguém fica mal por perguntar.',
                    },
                    {
                        type: "text",
                        value: "## O ciclo de vida de um defeito\n\nDepois de aberto, o defeito percorre estados, e vale conhecer o fluxo típico:\n\n**Novo** (aberto) → **Triado** (alguém avaliou e definiu prioridade) → **Atribuído** → **Em correção** → **Corrigido** → **Em teste** (você reteste) → **Fechado**.\n\nExistem dois desvios comuns. **Rejeitado**, quando não é defeito: pode ser comportamento esperado, duplicado de outro já aberto ou erro de configuração do ambiente. E **reaberto**, quando o reteste mostra que a correção não resolveu ou resolveu pela metade.\n\nUma taxa alta de rejeitados costuma indicar requisito mal combinado, e não falta de atenção de quem reporta. Vale olhar esse número na retrospectiva: ele aponta um problema de processo, não de pessoa.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual título de bug está mais bem escrito?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Checkout: cupom expirado é aceito e aplica desconto no total.",
                                isCorrect: true,
                            },
                            {
                                text: "Erro grave encontrado durante a execução dos testes na tela de finalização.",
                                isCorrect: false,
                            },
                            {
                                text: "Problema no sistema de cupons que precisa ser corrigido com bastante urgência.",
                                isCorrect: false,
                            },
                            {
                                text: "O desconto está sendo aplicado de forma incorreta em algumas situações do fluxo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que informar o ambiente e a versão no relatório é tão importante?",
                        difficulty: "facil",
                        options: [
                            {
                                text: 'Porque boa parte dos casos de "não consegui reproduzir" vem daí.',
                                isCorrect: true,
                            },
                            {
                                text: "Porque a ferramenta de gestão de defeitos exige esses campos para permitir o cadastro.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a auditoria do projeto verifica esses dados ao revisar os registros da entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a prioridade do defeito é calculada automaticamente a partir dessas informações.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o problema de registrar vários defeitos diferentes em um único relatório?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Cada um tem prioridade e correção próprias, e algum acaba esquecido.",
                                isCorrect: true,
                            },
                            {
                                text: "O relatório fica extenso demais e desestimula a leitura por parte de quem vai corrigir.",
                                isCorrect: false,
                            },
                            {
                                text: "As ferramentas de gestão limitam a quantidade de evidências anexadas por registro.",
                                isCorrect: false,
                            },
                            {
                                text: "A rastreabilidade com os requisitos deixa de funcionar quando há mais de um defeito.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você suspeita que o problema está no banco, mas não verificou. Como proceder?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Registrar como hipótese, deixando claro que não foi verificado.",
                                isCorrect: true,
                            },
                            {
                                text: "Escrever no relatório que a causa está no banco, para agilizar o trabalho de correção.",
                                isCorrect: false,
                            },
                            {
                                text: "Omitir a suspeita, já que apenas quem desenvolve deve investigar a causa do defeito.",
                                isCorrect: false,
                            },
                            {
                                text: "Aguardar a confirmação técnica antes de abrir o relatório do defeito encontrado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Uma taxa alta de defeitos rejeitados costuma indicar o quê?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Requisito mal combinado, ou seja, um problema de processo.",
                                isCorrect: true,
                            },
                            {
                                text: "Falta de atenção de quem reporta ao executar os cenários planejados para a entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "Excesso de testes exploratórios em comparação com os testes roteirizados do time.",
                                isCorrect: false,
                            },
                            {
                                text: "Necessidade de aumentar a cobertura automatizada para reduzir os falsos positivos.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Severidade e prioridade",
                blocks: [
                    {
                        type: "text",
                        value: "## Duas perguntas que não são a mesma\n\nTodo sistema de gestão de defeitos tem esses dois campos, e todo time novo os confunde. A diferença é simples quando você separa quem responde cada um.\n\n**Severidade** mede **o tamanho do estrago técnico**: quanto aquele defeito compromete o funcionamento. Quem avalia é normalmente quem testa ou quem desenvolve, olhando o impacto no sistema.\n\n**Prioridade** mede **a urgência da correção**: em que ordem deve ser resolvido. Quem decide é normalmente o produto ou o negócio, olhando impacto no cliente, na receita, na imagem e no que mais está na fila.\n\nA frase que resume: severidade é sobre o **sistema**, prioridade é sobre o **negócio**.",
                    },
                    {
                        type: "table",
                        value: '[["Combinação", "Exemplo", "O que costuma acontecer"], ["Severidade alta, prioridade alta", "Checkout fora do ar", "Correção imediata, para tudo"], ["Severidade alta, prioridade baixa", "Crash em relatório usado uma vez por ano", "Entra na fila, corrige com calma"], ["Severidade baixa, prioridade alta", "Nome da empresa escrito errado na home", "Correção rápida, ainda que trivial"], ["Severidade baixa, prioridade baixa", "Alinhamento torto numa tela interna", "Backlog, talvez nunca"]]',
                    },
                    {
                        type: "text",
                        value: "## Os dois casos que provam a diferença\n\nRepare nas duas combinações do meio da tabela, porque são elas que mostram por que os campos são separados.\n\n**Severidade alta, prioridade baixa.** Um relatório contábil quebra o sistema inteiro quando é gerado. Tecnicamente é gravíssimo. Mas ele é usado uma vez por ano, por duas pessoas, e o fechamento anual foi mês passado. Corrigir hoje ou daqui a três semanas não muda nada para o negócio.\n\n**Severidade baixa, prioridade alta.** O nome da empresa está escrito errado na página inicial. Tecnicamente é um erro de digitação, nada quebra. Mas está na cara de todo visitante e a campanha de marketing começa amanhã. Corrige agora.\n\nSe existisse um campo só, esses dois casos seriam classificados de forma errada, e a fila de correção sairia furada.",
                    },
                    {
                        type: "quote",
                        value: 'Quando alguém disser "esse bug é crítico", pergunte: crítico **para o sistema** ou crítico **para o cliente**? Quase toda discussão de prioridade em time de produto acaba quando essa distinção fica clara.',
                    },
                    {
                        type: "text",
                        value: "## Uma escala prática de severidade\n\nAs escalas variam por empresa, mas quase todas se parecem com esta:\n\n- **Crítica (bloqueante)**: impede o uso do sistema ou de uma função essencial, sem alternativa. Perda ou corrupção de dado. Falha de segurança com exposição.\n- **Alta**: função importante não funciona, mas existe caminho alternativo ou o impacto atinge um grupo limitado.\n- **Média**: comportamento errado com contorno simples, ou que afeta cenário pouco frequente.\n- **Baixa**: problema cosmético, texto, alinhamento, algo que incomoda sem impedir nada.\n\nDuas dicas para usar bem. Primeira: **combine os critérios com o time antes**, senão cada pessoa classifica por sensação e a escala perde sentido. Segunda: cuidado com a inflação de severidade. Se tudo vira crítico, nada é crítico, e a fila volta a ser decidida por quem grita mais alto.",
                    },
                    {
                        type: "text",
                        value: "## Onde entra o risco\n\nVocê já viu risco no módulo 2, e severidade e prioridade são a versão do risco aplicada a um defeito que **já existe**.\n\nA severidade se aproxima do **impacto**: qual o tamanho do estrago. A prioridade combina impacto com **frequência de uso** e com **custo de conviver com o problema mais um tempo**.\n\nPor isso duas perguntas resolvem quase toda classificação:\n\n1. **Quantas pessoas isso afeta, e com que frequência?** Um defeito no login afeta todo mundo, toda vez. Um defeito na exportação em XML afeta três clientes, uma vez por mês.\n2. **Existe contorno?** Se dá para concluir a tarefa por outro caminho, a urgência cai bastante, mesmo que o defeito seja feio.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a diferença entre severidade e prioridade?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Severidade mede o estrago técnico; prioridade mede a urgência da correção.",
                                isCorrect: true,
                            },
                            {
                                text: "Severidade é definida por quem testa; prioridade é definida por quem escreve o código.",
                                isCorrect: false,
                            },
                            {
                                text: "Severidade se aplica a defeitos funcionais; prioridade se aplica aos não funcionais.",
                                isCorrect: false,
                            },
                            {
                                text: "Severidade é medida em produção; prioridade é medida durante a fase de homologação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um relatório contábil derruba o sistema, mas é usado uma vez por ano e o fechamento já passou. Como classificar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Severidade alta e prioridade baixa.",
                                isCorrect: true,
                            },
                            {
                                text: "Severidade alta e prioridade alta, porque derrubar o sistema exige correção imediata.",
                                isCorrect: false,
                            },
                            {
                                text: "Severidade baixa e prioridade baixa, já que quase ninguém utiliza essa funcionalidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Severidade baixa e prioridade alta, porque envolve informação contábil da empresa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O nome da empresa está escrito errado na página inicial e a campanha começa amanhã. Como classificar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Severidade baixa e prioridade alta.",
                                isCorrect: true,
                            },
                            {
                                text: "Severidade alta e prioridade alta, porque a imagem da empresa está comprometida.",
                                isCorrect: false,
                            },
                            {
                                text: "Severidade alta e prioridade baixa, já que nenhuma funcionalidade deixou de funcionar.",
                                isCorrect: false,
                            },
                            {
                                text: "Severidade média e prioridade média, por se tratar de um problema apenas visual.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o risco da inflação de severidade em um time?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Se tudo é crítico, a fila volta a ser decidida por quem grita mais alto.",
                                isCorrect: true,
                            },
                            {
                                text: "A ferramenta de gestão passa a rejeitar novos registros por excesso de itens críticos.",
                                isCorrect: false,
                            },
                            {
                                text: "Os defeitos de severidade baixa deixam de ser registrados pela equipe de qualidade.",
                                isCorrect: false,
                            },
                            {
                                text: "O tempo médio de correção diminui, porque todos os itens recebem atenção imediata.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, qual pergunta ajuda mais a reduzir a urgência de um defeito feio?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Existe contorno para concluir a tarefa por outro caminho?",
                                isCorrect: true,
                            },
                            {
                                text: "O defeito já foi encontrado em versões anteriores do sistema entregue ao cliente?",
                                isCorrect: false,
                            },
                            {
                                text: "A correção pode ser feita antes do fim da sprint que está em andamento no time?",
                                isCorrect: false,
                            },
                            {
                                text: "O defeito foi encontrado por teste exploratório ou por um caso de teste planejado?",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Critérios de aceitação e definição de pronto",
                blocks: [
                    {
                        type: "text",
                        value: '## O acordo que evita a discussão de sexta-feira\n\nDuas ferramentas simples resolvem a maior parte das brigas sobre "isso está pronto ou não". Elas parecem parecidas e resolvem coisas diferentes.\n\nOs **critérios de aceitação** são específicos de **uma história**: as condições que aquela funcionalidade precisa cumprir para ser considerada entregue. Mudam de história para história.\n\nA **definição de pronto** (DoD) é do **time**: a lista de coisas que valem para **qualquer** entrega, sem exceção. É a mesma para todas as histórias.\n\nUma história pode cumprir todos os critérios de aceitação e ainda não estar pronta, se o time definiu que pronto inclui teste automatizado e revisão de código, e nada disso foi feito.',
                    },
                    {
                        type: "table",
                        value: '[["", "Critérios de aceitação", "Definição de pronto"], ["Escopo", "Uma história específica", "Todas as histórias do time"], ["Quem escreve", "Produto junto com o time", "O time, na retrospectiva"], ["Muda com frequência?", "Sim, a cada história", "Não, é estável e evolui devagar"], ["Exemplo", "Cupom expirado exibe mensagem e não aplica desconto", "Tem teste automatizado e passou por revisão"]]',
                    },
                    {
                        type: "text",
                        value: '## Como escrever um bom critério de aceitação\n\nUm critério bom é **verificável**: dá para responder sim ou não sem discussão. Três características:\n\n**Concreto.** "O sistema deve validar o cupom" é vago. "Cupom com data anterior a hoje exibe a mensagem \'Cupom expirado\' e o total permanece sem desconto" é concreto.\n\n**Observável de fora.** Deve descrever comportamento visível, não implementação. "Grava na tabela de auditoria" é implementação; "a operação aparece no histórico do usuário" é comportamento.\n\n**Um por vez.** Um critério, uma verificação. Critério que junta três condições vira uma discussão sobre se passou pela metade.\n\nE há um exercício que revela quase todo problema: para cada critério, pergunte **"como eu provo isso?"**. Se ninguém consegue descrever a verificação, o critério não está pronto para virar código.',
                    },
                    {
                        type: "code",
                        value: 'História: aplicar cupom de desconto no checkout\n\nCritérios de aceitação:\n  1. Cupom válido aplica o percentual sobre o subtotal e exibe\n     "Cupom aplicado" com o valor descontado.\n  2. Cupom expirado exibe "Cupom expirado" e o total permanece\n     sem desconto.\n  3. Cupom inexistente exibe "Cupom inválido".\n  4. Apenas um cupom por pedido: ao aplicar o segundo, o primeiro\n     é substituído e a diferença aparece no total.\n  5. O desconto nunca deixa o total abaixo de zero.\n\nDefinição de pronto (vale para toda história):\n  - Critérios de aceitação verificados\n  - Testes automatizados escritos e passando no CI\n  - Código revisado e aprovado por outra pessoa\n  - Sem defeito crítico ou alto em aberto\n  - Documentação e variáveis de ambiente atualizadas',
                    },
                    {
                        type: "quote",
                        value: 'Repare no critério 5: "o desconto nunca deixa o total abaixo de zero". Esse tipo de critério raramente aparece de graça. Ele nasce quando alguém pergunta, no refinamento, "e se o cupom for maior que o valor do carrinho?". É exatamente o trabalho de QA aparecendo **antes** do código.',
                    },
                    {
                        type: "text",
                        value: "## O papel de QA nessa conversa\n\nAqui é onde o shift left deixa de ser teoria. Ao ler uma história com critérios de aceitação, você tem um roteiro pronto de perguntas:\n\n- **O que falta?** Qual caminho de erro ninguém descreveu, qual borda ficou de fora, qual combinação não foi tratada.\n- **O que está ambíguo?** Onde duas pessoas leriam coisas diferentes.\n- **O que não é verificável?** Qual critério ninguém consegue provar.\n- **O que contradiz?** Qual critério briga com outro, ou com uma regra que já existe no sistema.\n\nCada resposta vira um critério novo, e cada critério novo é um defeito que não vai existir. É a atividade de melhor retorno da profissão, e ela acontece numa reunião, sem abrir o sistema.\n\nE tem um efeito colateral ótimo: os critérios de aceitação, uma vez claros, **já são** o esqueleto dos seus casos de teste. Você sai do refinamento com metade do trabalho de modelagem feito.",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando o módulo:** caso de teste é escrito para quem executa depois; o plano combina antes o que geraria discussão depois; o relatório de defeito é o principal produto escrito de QA; severidade e prioridade respondem perguntas diferentes; e os critérios de aceitação, bem trabalhados no refinamento, são o melhor investimento de qualidade que existe.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a diferença entre critérios de aceitação e definição de pronto?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Os critérios são de uma história; a definição de pronto vale para todas.",
                                isCorrect: true,
                            },
                            {
                                text: "Os critérios são escritos pelo time; a definição de pronto é escrita por quem gerencia.",
                                isCorrect: false,
                            },
                            {
                                text: "Os critérios tratam de requisitos funcionais; a definição de pronto trata dos não funcionais.",
                                isCorrect: false,
                            },
                            {
                                text: "Os critérios são verificados por QA; a definição de pronto é verificada por quem programa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual critério de aceitação está escrito de forma adequada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: 'Cupom expirado exibe "Cupom expirado" e o total permanece sem desconto.',
                                isCorrect: true,
                            },
                            {
                                text: "O sistema deve validar corretamente os cupons informados pelo cliente no checkout.",
                                isCorrect: false,
                            },
                            {
                                text: "O cupom deve ser gravado na tabela de auditoria sempre que for aplicado ao pedido.",
                                isCorrect: false,
                            },
                            {
                                text: "A aplicação de cupons precisa ser rápida e não pode atrapalhar a experiência de compra.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma história cumpre todos os critérios de aceitação, mas não tem teste automatizado nem revisão de código, itens que constam na definição de pronto do time. Ela está pronta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não, porque a definição de pronto também precisa ser cumprida.",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, porque os critérios de aceitação são o que determina a entrega da funcionalidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, desde que a pessoa responsável pelo produto aprove a entrega mesmo assim.",
                                isCorrect: false,
                            },
                            {
                                text: "Depende, porque a definição de pronto se aplica somente às histórias de maior risco.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual pergunta a aula sugere para checar se um critério de aceitação está pronto?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Como eu provo isso?",
                                isCorrect: true,
                            },
                            {
                                text: "Quanto tempo o time vai levar para implementar esse comportamento descrito?",
                                isCorrect: false,
                            },
                            {
                                text: "Qual é a prioridade desse critério em relação aos demais itens da mesma história?",
                                isCorrect: false,
                            },
                            {
                                text: "Esse critério já foi implementado em alguma outra funcionalidade parecida do sistema?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o efeito colateral positivo de trabalhar bem os critérios de aceitação no refinamento?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Eles já viram o esqueleto dos casos de teste da funcionalidade.",
                                isCorrect: true,
                            },
                            {
                                text: "Eles reduzem o tempo de execução da suíte automatizada de regressão do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Eles dispensam a necessidade de escrever a definição de pronto para aquele time.",
                                isCorrect: false,
                            },
                            {
                                text: "Eles permitem calcular com precisão a severidade dos defeitos que serão encontrados.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - QA em times ágeis",
        aulas: [
            {
                titulo: "Cascata e ágil: o que muda para o QA",
                blocks: [
                    {
                        type: "text",
                        value: "## Dois jeitos de organizar o trabalho\n\nAntes de falar de Scrum e de Kanban, vale entender a mudança de fundo, porque ela explica por que o trabalho de QA é como é hoje.\n\nNo modelo **cascata** (waterfall), o projeto avança em fases sequenciais: levantar requisitos, projetar, construir, testar, entregar. Uma fase começa quando a anterior termina. O teste é uma **fase**, quase no fim, com data de início e de fim.\n\nNo modelo **ágil**, o trabalho avança em ciclos curtos, cada um produzindo algo utilizável. Requisito, código, teste e entrega acontecem **dentro do mesmo ciclo**, que dura dias ou semanas. Teste deixa de ser fase e vira **atividade contínua**.\n\nNenhum dos dois é errado por natureza. Cascata ainda faz sentido quando o escopo é fixo, mudanças são caras e existe exigência regulatória pesada. Ágil faz sentido quando o entendimento do problema evolui junto com o produto, que é o caso da maioria dos produtos digitais.",
                    },
                    {
                        type: "table",
                        value: '[["", "Cascata", "Ágil"], ["Teste é", "Uma fase no fim", "Uma atividade contínua"], ["Requisito", "Definido e congelado no início", "Refinado a cada ciclo"], ["Quando QA entra", "Quando a construção termina", "Desde o refinamento da história"], ["Feedback chega em", "Meses", "Dias"], ["Documentação", "Extensa e formal", "Enxuta e viva"], ["Custo de mudar", "Alto, exige replanejamento", "Baixo, faz parte do ciclo"]]',
                    },
                    {
                        type: "text",
                        value: '## O que muda na prática para quem trabalha com QA\n\n**O tempo some.** Em cascata havia semanas de teste. Numa sprint de duas semanas há poucos dias, e a funcionalidade fica pronta no meio. Não dá para testar tudo à mão no fim: automação e priorização por risco deixam de ser luxo.\n\n**O requisito não fica parado.** Não existe mais um documento congelado do qual derivar todos os casos. O entendimento se constrói na conversa, e QA participa dessa conversa.\n\n**Não existe mais o portão.** Em cascata QA aprovava ou reprovava a entrada em produção. Em ágil, a decisão é do time, e QA fornece a informação de risco. Perde-se poder formal e ganha-se influência real, desde que se entre cedo.\n\n**Colaboração substitui documento.** Em vez de mandar um relatório extenso e esperar resposta, você chama a pessoa e mostra na tela. É mais rápido e resolve mais.\n\n**Qualidade vira responsabilidade do time.** Não existe "joguei por cima do muro". Se subiu com defeito, o time subiu com defeito.',
                    },
                    {
                        type: "quote",
                        value: "A mudança mais importante não é de ferramenta nem de cerimônia: é **quando** QA entra. Em cascata, no fim. Em ágil, no começo. Quem tenta fazer QA de cascata dentro de um time ágil vira gargalo e reclama que não tem tempo, porque de fato não tem, se só entrar no fim.",
                    },
                    {
                        type: "text",
                        value: '## Um erro clássico: o mini-cascata dentro da sprint\n\nMuitos times dizem que são ágeis e reproduzem a cascata dentro da sprint: os primeiros dias para definir, os do meio para codar, os dois últimos para testar.\n\nO resultado é previsível. O teste começa quando não há mais tempo para corrigir. Os defeitos encontrados na quinta-feira viram "passa para a próxima sprint". A pessoa de QA fica ociosa no começo e afogada no fim. E a sprint termina com histórias em "quase pronto", que é o mesmo que não pronto.\n\nO que resolve não é heroísmo, é **fluxo**: testar cada história assim que ela fica pronta, em vez de acumular tudo para o fim. Uma história pronta na terça é testada na terça. Isso exige que o time entregue em pedaços, que exista ambiente disponível a qualquer momento, e que ninguém trate teste como etapa final. É uma mudança de organização, não de esforço.',
                    },
                ],
                questions: [
                    {
                        statement: "No modelo cascata, como o teste é organizado?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Como uma fase que acontece depois da construção estar concluída.",
                                isCorrect: true,
                            },
                            {
                                text: "Como uma atividade contínua distribuída ao longo de todo o ciclo de desenvolvimento.",
                                isCorrect: false,
                            },
                            {
                                text: "Como uma responsabilidade compartilhada entre todas as pessoas do time de produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Como um conjunto de verificações automatizadas executadas a cada alteração enviada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a mudança mais importante para QA na transição de cascata para ágil?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O momento em que QA entra no trabalho passa a ser o começo, e não o fim.",
                                isCorrect: true,
                            },
                            {
                                text: "A quantidade de ferramentas de automação disponíveis aumenta bastante no mercado.",
                                isCorrect: false,
                            },
                            {
                                text: "A documentação passa a ser mais extensa para compensar os ciclos mais curtos de entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "A responsabilidade formal pela aprovação da entrega passa a ser exclusiva da área de QA.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um time separa a sprint em dias de definição, dias de código e dois dias finais de teste. Qual é o problema?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "É uma cascata dentro da sprint, e o teste começa sem tempo de corrigir.",
                                isCorrect: true,
                            },
                            {
                                text: "A sprint fica curta demais para acomodar todas as cerimônias previstas pelo framework.",
                                isCorrect: false,
                            },
                            {
                                text: "A equipe de desenvolvimento fica sem tempo suficiente para revisar o código produzido.",
                                isCorrect: false,
                            },
                            {
                                text: "Os testes automatizados não conseguem rodar antes do fim do ciclo de desenvolvimento.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em um time ágil, quem decide se a entrega vai para produção?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O time, com base na informação de risco que QA fornece.",
                                isCorrect: true,
                            },
                            {
                                text: "A área de QA, que aprova ou reprova a entrada da versão no ambiente de produção.",
                                isCorrect: false,
                            },
                            {
                                text: "A pessoa que gerencia o projeto, após revisar o relatório final de testes executados.",
                                isCorrect: false,
                            },
                            {
                                text: "O cliente, que executa o teste de aceitação antes de autorizar formalmente a publicação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, o que resolve o acúmulo de testes no fim da sprint?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Testar cada história assim que ela fica pronta, mudando o fluxo do time.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumentar a duração da sprint para que exista mais tempo disponível para os testes.",
                                isCorrect: false,
                            },
                            {
                                text: "Contratar mais pessoas de qualidade para dividir a execução dos casos planejados.",
                                isCorrect: false,
                            },
                            {
                                text: "Reduzir a quantidade de histórias planejadas para caber no tempo de teste existente.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Scrum e o lugar do QA na sprint",
                blocks: [
                    {
                        type: "text",
                        value: '## O básico do Scrum\n\nScrum é o framework ágil mais usado, e é bem simples de descrever: o time trabalha em ciclos de tamanho fixo chamados **sprints** (uma a quatro semanas), e ao fim de cada um existe um incremento potencialmente entregável.\n\nTrês papéis:\n\n- **Product Owner**: responsável pelo produto e pela ordem do backlog. Decide o que é mais importante.\n- **Scrum Master**: cuida do processo, remove impedimentos e protege o time.\n- **Time de desenvolvimento**: quem constrói, e aqui entram desenvolvimento, QA, design, todo mundo que faz o produto acontecer.\n\nRepare que **não existe o papel de "testador" no Scrum**. Isso não significa que a função não existe: significa que quem faz QA é parte do time de desenvolvimento, com a mesma responsabilidade pelo resultado.',
                    },
                    {
                        type: "text",
                        value: "## As cerimônias e o que QA faz em cada uma\n\n**Refinamento do backlog.** A cerimônia mais importante para QA, e a mais desperdiçada. É aqui que você lê as histórias, caça ambiguidade, propõe critérios de aceitação e levanta os casos de erro. Uma pergunta boa aqui vale por horas de teste depois.\n\n**Planejamento da sprint.** O time escolhe o que entra e combina como fazer. QA traz o custo de teste na conta da estimativa, aponta o que precisa de massa de dados ou de ambiente especial, e sinaliza histórias grandes demais para serem testadas dentro do ciclo.\n\n**Daily.** Quinze minutos de alinhamento. QA usa para sinalizar impedimento cedo: ambiente fora do ar, história pronta mas sem dado para testar, defeito que trava outros cenários.\n\n**Review.** O time mostra o que ficou pronto para quem pediu. É um momento de validação: quem usa vê pela primeira vez e reage.\n\n**Retrospectiva.** O time olha o processo. É onde QA leva dados: de onde vieram os defeitos, quanto tempo ficou esperando ambiente, quantas histórias voltaram por critério ambíguo.",
                    },
                    {
                        type: "table",
                        value: '[["Cerimônia", "O que QA leva", "O que QA tira de lá"], ["Refinamento", "Perguntas, casos de erro, bordas", "Critérios de aceitação melhores"], ["Planejamento", "Custo de teste, necessidade de massa e ambiente", "Escopo realista e testável"], ["Daily", "Impedimentos e riscos do dia", "Ajuda para destravar rápido"], ["Review", "Cenários reais para demonstrar", "Reação de quem usa"], ["Retrospectiva", "Dados sobre origem dos defeitos", "Mudança de processo acordada"]]',
                    },
                    {
                        type: "quote",
                        value: "Se você só puder participar bem de **uma** cerimônia, escolha o **refinamento**. É a única em que você consegue eliminar defeitos em vez de encontrá-los, e é a que mais determina como será o resto da sua sprint.",
                    },
                    {
                        type: "text",
                        value: "## Como QA se organiza dentro da sprint\n\nTrês padrões que funcionam, e um que não funciona.\n\n**Testar por história, assim que fica pronta.** O padrão saudável. A história é desenvolvida, testada e fechada dentro da sprint, uma de cada vez. O fluxo fica contínuo e nada se acumula no fim.\n\n**Trabalhar em par com quem desenvolve.** Combinar os cenários antes de codar, e às vezes testar junto enquanto a funcionalidade nasce. Encurta o ciclo de feedback ao máximo.\n\n**Reservar tempo fixo para exploração e regressão.** Além do fluxo por história, uma janela para explorar e para cuidar da suíte, senão essas atividades nunca acontecem.\n\n**O que não funciona: testar a sprint anterior.** Alguns times deixam QA testando na sprint N o que foi desenvolvido na sprint N-1. Parece resolver o aperto de tempo, mas cria um atraso permanente: o defeito é encontrado quando quem escreveu já esqueceu o contexto, a correção compete com o trabalho novo, e a definição de pronto vira ficção, porque nada fica realmente pronto no ciclo.",
                    },
                ],
                questions: [
                    {
                        statement: "Quais são os três papéis do Scrum?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Product Owner, Scrum Master e time de desenvolvimento.",
                                isCorrect: true,
                            },
                            {
                                text: "Product Owner, Scrum Master, time de desenvolvimento e a equipe de testes do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Gerente de projeto, analista de requisitos e a equipe responsável pela construção.",
                                isCorrect: false,
                            },
                            {
                                text: "Product Owner, arquiteto de soluções e as pessoas que desenvolvem as funcionalidades.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O Scrum não define o papel de testador. O que isso significa?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que quem faz QA integra o time de desenvolvimento, com a mesma responsabilidade.",
                                isCorrect: true,
                            },
                            {
                                text: "Que a atividade de teste deve ser terceirizada para uma equipe externa especializada.",
                                isCorrect: false,
                            },
                            {
                                text: "Que os testes precisam ser automatizados, dispensando pessoas dedicadas à atividade.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a responsabilidade pelos testes pertence exclusivamente ao Product Owner do time.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual cerimônia a aula aponta como a mais importante para QA?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O refinamento do backlog.",
                                isCorrect: true,
                            },
                            {
                                text: "A review da sprint, em que o time apresenta o incremento para quem pediu a funcionalidade.",
                                isCorrect: false,
                            },
                            {
                                text: "A retrospectiva, em que o time analisa o processo e propõe melhorias para o próximo ciclo.",
                                isCorrect: false,
                            },
                            {
                                text: "A daily, em que o time se alinha rapidamente sobre o andamento das atividades do dia.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que o refinamento é apontado como a cerimônia mais valiosa para QA?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque é onde se elimina defeito em vez de encontrá-lo.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque é a cerimônia mais longa e permite discutir todos os cenários com calma.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque é o momento em que a equipe define quais casos serão automatizados na sprint.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque é quando o Product Owner aprova formalmente os critérios de aceitação escritos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um time coloca QA testando na sprint atual o que foi desenvolvido na sprint anterior. Qual é o principal problema?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Cria um atraso permanente e faz a definição de pronto virar ficção.",
                                isCorrect: true,
                            },
                            {
                                text: "Sobrecarrega a equipe de qualidade com o acúmulo de casos de teste pendentes.",
                                isCorrect: false,
                            },
                            {
                                text: "Impede que os testes automatizados sejam executados dentro do prazo de cada ciclo.",
                                isCorrect: false,
                            },
                            {
                                text: "Reduz a quantidade de histórias que o time consegue planejar em cada sprint nova.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Kanban, fluxo e o QA como gargalo",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando não há sprint\n\nNem todo time ágil trabalha em sprints. O **Kanban** organiza o trabalho por **fluxo contínuo**: não há ciclo fechado, os itens entram, atravessam o quadro e saem, um a um, conforme ficam prontos.\n\nTrês ideias sustentam o método:\n\n**Visualizar o trabalho.** Um quadro com colunas que representam o processo real do time: a fazer, em desenvolvimento, em teste, pronto. O quadro precisa refletir como o time trabalha de verdade, não o processo idealizado.\n\n**Limitar o trabalho em progresso (WIP).** Cada coluna tem um número máximo de itens. É o coração do método, e o mais difícil de aceitar.\n\n**Gerenciar o fluxo.** Olhar onde os itens ficam parados e agir sobre isso, em vez de olhar quanto cada pessoa produz.",
                    },
                    {
                        type: "text",
                        value: "## Por que limitar o trabalho em progresso\n\nA intuição diz que começar mais coisas entrega mais. É o contrário.\n\nImagine um quadro com dez itens em desenvolvimento e a coluna de teste vazia. Parece produtivo. Uma semana depois, os dez chegam juntos em teste. Agora a coluna de teste tem dez itens, e nada será concluído tão cedo. Ninguém entregou nada nessas duas semanas, mesmo com todo mundo ocupado o tempo inteiro.\n\nCom WIP limitado, se a coluna de teste está cheia, **ninguém puxa item novo**. Quem desenvolve para de começar o décimo primeiro item e vai ajudar a destravar a fila de teste. Parece contraintuitivo e é exatamente o que faz o trabalho fluir.\n\nA frase que resume o método: **pare de começar, comece a terminar**.",
                    },
                    {
                        type: "table",
                        value: '[["Sinal no quadro", "O que costuma significar", "Ação típica"], ["Fila em teste sempre cheia", "QA virou gargalo do fluxo", "Reduzir WIP e envolver o time no teste"], ["Itens voltando de teste para desenvolvimento", "Critérios pouco claros ou entrega incompleta", "Melhorar refinamento e definição de pronto"], ["Item parado há dias na mesma coluna", "Impedimento não declarado", "Levantar na daily e destravar"], ["Coluna \\"aguardando ambiente\\"", "Dependência externa não resolvida", "Tratar como risco de projeto"]]',
                    },
                    {
                        type: "text",
                        value: '## O QA como gargalo\n\nÉ o padrão mais comum em time que está aprendendo. A coluna de teste vive cheia e a conclusão apressada é "precisamos de mais gente em QA".\n\nÀs vezes é verdade. Mas antes de contratar, vale olhar as causas mais frequentes, porque nenhuma se resolve com mais gente:\n\n**Chega tudo junto no fim.** Não é falta de capacidade, é distribuição. Cinco histórias prontas na quinta criam fila mesmo com equipe grande.\n\n**Chega incompleto.** Se metade volta por não atender aos critérios, o tempo de teste é gasto duas vezes na mesma história.\n\n**Falta ambiente ou dado.** O item fica parado sem ninguém trabalhando nele. É espera, não trabalho.\n\n**Regressão manual crescendo.** A cada entrega, o custo fixo de verificar o que já existia aumenta e come o tempo do que é novo.\n\n**Só uma pessoa pode testar.** Se testar é atividade exclusiva de uma pessoa, ela é gargalo por definição. Quando quem desenvolve também testa e o time compartilha a atividade, a fila deixa de existir.',
                    },
                    {
                        type: "quote",
                        value: "Fila na coluna de teste raramente é problema de capacidade de QA. Quase sempre é problema de **fluxo**: itens grandes demais, chegando todos ao mesmo tempo, incompletos, e com regressão manual crescendo por baixo. Contratar mais gente para uma fila mal desenhada só aumenta a fila mais adiante.",
                    },
                    {
                        type: "text",
                        value: '## Duas métricas que valem a pena\n\nKanban traz duas medidas simples e muito mais úteis que "quantos casos foram executados":\n\n**Lead time**: quanto tempo passa entre o item entrar no quadro e sair pronto. É o que quem pede sente.\n\n**Cycle time**: quanto tempo passa entre alguém começar a trabalhar nele e terminar. É o que o time controla.\n\nO que faz esses números serem grandes quase nunca é a execução em si. É a **espera**: item aguardando revisão, aguardando ambiente, aguardando dado, aguardando alguém livre. Medir onde o tempo é gasto costuma revelar que o trabalho leva duas horas e a espera leva três dias, e isso muda completamente a conversa sobre o que precisa melhorar.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a ideia central do limite de trabalho em progresso no Kanban?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Restringir quantos itens ficam em cada coluna para o trabalho fluir.",
                                isCorrect: true,
                            },
                            {
                                text: "Definir quantas horas cada pessoa pode dedicar por dia a cada item do quadro.",
                                isCorrect: false,
                            },
                            {
                                text: "Estabelecer um prazo máximo para que um item atravesse todo o quadro do time.",
                                isCorrect: false,
                            },
                            {
                                text: "Limitar a quantidade de itens que podem ser planejados para cada ciclo de entrega.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A coluna de teste está cheia e a de desenvolvimento tem espaço. O que o Kanban recomenda?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não puxar item novo e ajudar a destravar a fila de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Aproveitar o espaço disponível e iniciar o desenvolvimento de mais um item do backlog.",
                                isCorrect: false,
                            },
                            {
                                text: "Mover os itens de teste de volta para o desenvolvimento até que a fila seja reduzida.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar o limite da coluna de teste para acomodar todos os itens que chegaram juntos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a frase que resume o princípio do limite de trabalho em progresso?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Pare de começar, comece a terminar.",
                                isCorrect: true,
                            },
                            {
                                text: "Quanto mais itens em andamento, maior a produtividade total do time no período.",
                                isCorrect: false,
                            },
                            {
                                text: "Todo item precisa ser concluído dentro do ciclo em que foi iniciado pela equipe.",
                                isCorrect: false,
                            },
                            {
                                text: "A qualidade é responsabilidade de todas as pessoas que participam do processo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Cinco histórias ficam prontas na quinta-feira e formam fila em teste. Qual é a causa desse gargalo?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Distribuição do trabalho, e não falta de capacidade da equipe de qualidade.",
                                isCorrect: true,
                            },
                            {
                                text: "Falta de pessoas dedicadas ao teste, o que exige a contratação de mais profissionais.",
                                isCorrect: false,
                            },
                            {
                                text: "Ausência de testes automatizados para as funcionalidades que foram entregues juntas.",
                                isCorrect: false,
                            },
                            {
                                text: "Critérios de aceitação mal escritos durante o refinamento das histórias envolvidas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Segundo a aula, o que costuma dominar o lead time de um item?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A espera por revisão, ambiente, dado ou alguém disponível.",
                                isCorrect: true,
                            },
                            {
                                text: "O tempo gasto na execução dos casos de teste projetados para aquela funcionalidade.",
                                isCorrect: false,
                            },
                            {
                                text: "A complexidade técnica da implementação escolhida por quem desenvolveu o item.",
                                isCorrect: false,
                            },
                            {
                                text: "A quantidade de defeitos encontrados durante a verificação feita pela equipe de QA.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Histórias de usuário, BDD e Gherkin",
                blocks: [
                    {
                        type: "text",
                        value: '## A história de usuário\n\nEm time ágil, o requisito costuma vir como **história de usuário**: uma frase curta que descreve uma necessidade do ponto de vista de quem usa.\n\nO formato clássico é:\n\n> Como **[papel]**, quero **[ação]**, para **[benefício]**.\n\nPor exemplo: "Como cliente, quero aplicar um cupom no checkout, para pagar menos pelo pedido".\n\nA história não é a especificação completa, e isso é intencional. Ela é um **lembrete de uma conversa que precisa acontecer**. O detalhe nasce na conversa, e os critérios de aceitação registram o que foi combinado.\n\nÉ por isso que time que trata a história como documento fechado sofre: o cartão nunca vai ter detalhe suficiente, porque não foi feito para isso.',
                    },
                    {
                        type: "text",
                        value: '## Uma boa história: o INVEST\n\nExiste um acrônimo útil para avaliar se a história está boa. Cada letra é uma característica:\n\n- **I**ndependente: dá para entregar sem depender de outra história.\n- **N**egociável: é ponto de partida para conversa, não contrato fechado.\n- **V**aliosa: entrega valor perceptível para alguém.\n- **E**stimável: o time consegue dimensionar o esforço.\n- **S**mall (pequena): cabe confortavelmente no ciclo.\n- **T**estável: dá para verificar se foi cumprida.\n\nO último item é o mais direto para QA. **História não testável não está pronta para desenvolvimento.** Se ninguém consegue descrever como provar que a história foi entregue, o time vai descobrir isso no fim, quando alguém perguntar "e aí, ficou pronto?".',
                    },
                    {
                        type: "text",
                        value: '## BDD: a conversa antes do código\n\n**BDD** (Behavior Driven Development, desenvolvimento guiado por comportamento) é uma prática que nasceu para resolver um problema específico: o abismo entre o que o negócio pede, o que o time entende e o que o sistema faz.\n\nA ideia central é ter uma conversa estruturada, **antes de codar**, entre quem entende do negócio, quem desenvolve e quem testa. As três perspectivas juntas, discutindo **exemplos concretos** em vez de regras abstratas. Essa conversa costuma ser chamada de "os três amigos".\n\nE aqui está o ponto que quase todo mundo erra: **BDD não é uma ferramenta**. Muita gente acha que "fazer BDD" é usar Cucumber. Não é. BDD é a conversa. O formato escrito é só a memória dela, e um time pode fazer BDD muito bem escrevendo os exemplos num documento simples.',
                    },
                    {
                        type: "code",
                        value: 'Funcionalidade: Aplicar cupom de desconto no checkout\n\n  Cenário: cupom válido aplica o desconto\n    Dado que tenho um carrinho de R$ 100,00\n    E existe o cupom PROMO10 com 10% de desconto, válido até amanhã\n    Quando eu aplico o cupom PROMO10\n    Então o total passa a ser R$ 90,00\n    E vejo a mensagem "Cupom aplicado"\n\n  Cenário: cupom expirado é recusado\n    Dado que tenho um carrinho de R$ 100,00\n    E existe o cupom PROMO10 com validade encerrada ontem\n    Quando eu aplico o cupom PROMO10\n    Então o total continua R$ 100,00\n    E vejo a mensagem "Cupom expirado"\n\n  Cenário: desconto não deixa o total negativo\n    Dado que tenho um carrinho de R$ 20,00\n    E existe o cupom DESC50 com R$ 50,00 de desconto\n    Quando eu aplico o cupom DESC50\n    Então o total passa a ser R$ 0,00',
                    },
                    {
                        type: "text",
                        value: '## Gherkin: a estrutura Dado, Quando, Então\n\nO formato acima é o **Gherkin**, uma linguagem estruturada e legível por qualquer pessoa. Ele tem três palavras principais:\n\n- **Dado** (Given): o contexto, o estado inicial, o que já é verdade antes.\n- **Quando** (When): a ação, o evento que dispara o comportamento. Idealmente uma só.\n- **Então** (Then): o resultado observável esperado.\n\nE duas auxiliares: **E** (And) para encadear passos do mesmo tipo, e **Mas** (But) para contrastes.\n\nO grande valor do Gherkin é ser **ambíguo para ninguém**. A mesma frase serve para o negócio conferir a regra, para quem desenvolve entender o que construir e para quem testa saber o que verificar. E, se o time quiser, ela vira teste automatizado, porque cada passo pode ser ligado a um trecho de código.\n\nAlguns cuidados que separam Gherkin bom de ruim:\n\n- **Escreva no nível do negócio**, não da interface. "Quando eu aplico o cupom PROMO10" é bom; "quando eu clico no campo de id cupom e digito PROMO10 e clico no botão Aplicar" é um script disfarçado, que quebra a cada mudança de tela.\n- **Um comportamento por cenário.** Cenário com cinco "Quando" está testando cinco coisas.\n- **Use valores concretos.** "Um valor alto" não é exemplo; "R$ 100,00" é.',
                    },
                    {
                        type: "quote",
                        value: 'A pergunta que resolve a maior parte dos problemas de requisito também é a base do BDD: **"me dá um exemplo?"**. Regra abstrata esconde divergência; exemplo com números concretos revela em segundos que três pessoas entendiam três coisas diferentes.',
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o formato clássico de uma história de usuário?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Como [papel], quero [ação], para [benefício].",
                                isCorrect: true,
                            },
                            {
                                text: "Dado [contexto], quando [ação], então [resultado esperado pela pessoa usuária].",
                                isCorrect: false,
                            },
                            {
                                text: "Se [condição] e [condição], então [ação] deve ser executada pelo sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "O sistema deve [funcionalidade] conforme especificado no documento de requisitos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que significa dizer que a história de usuário é um lembrete de uma conversa?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que o detalhe nasce na conversa, e não no texto curto do cartão.",
                                isCorrect: true,
                            },
                            {
                                text: "Que a história precisa ser aprovada em reunião antes de entrar no backlog do time.",
                                isCorrect: false,
                            },
                            {
                                text: "Que ela deve ser reescrita a cada sprint até ficar completa o suficiente para codar.",
                                isCorrect: false,
                            },
                            {
                                text: "Que apenas quem participou da conversa original pode trabalhar naquela história depois.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual letra do INVEST tem relação mais direta com o trabalho de QA?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Testável.",
                                isCorrect: true,
                            },
                            {
                                text: "Independente, porque garante que a história pode ser entregue sem depender de outras.",
                                isCorrect: false,
                            },
                            {
                                text: "Negociável, porque permite ajustar o escopo durante a conversa com quem pediu a funcionalidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Estimável, porque permite ao time dimensionar o esforço necessário para a construção.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual afirmação sobre BDD está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "É uma conversa estruturada com exemplos concretos, antes de codar.",
                                isCorrect: true,
                            },
                            {
                                text: "É uma ferramenta de automação de testes que executa cenários escritos em Gherkin.",
                                isCorrect: false,
                            },
                            {
                                text: "É uma técnica de projeto de teste que substitui a partição de equivalência tradicional.",
                                isCorrect: false,
                            },
                            {
                                text: "É um framework ágil que organiza o trabalho do time em ciclos curtos e contínuos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual cenário em Gherkin está escrito no nível adequado?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Quando eu aplico o cupom PROMO10.",
                                isCorrect: true,
                            },
                            {
                                text: "Quando eu clico no campo de id cupom, digito PROMO10 e clico no botão Aplicar da tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o método aplicarCupom é chamado com o parâmetro do código informado pelo cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o registro é gravado na tabela de cupons aplicados com a data e hora da operação.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Qualidade é responsabilidade do time inteiro",
                blocks: [
                    {
                        type: "text",
                        value: "## O muro que separava\n\nDurante muito tempo o processo funcionava assim: o time construía, jogava por cima do muro para a equipe de teste, e recebia de volta uma lista de defeitos. Cada lado com sua meta, seu chefe e seu incentivo.\n\nO arranjo produzia efeitos previsíveis. Quem desenvolvia não se sentia responsável pela qualidade, porque havia um time inteiro para isso depois. Quem testava não tinha como influenciar decisões já tomadas. O defeito era descoberto tarde, quando corrigir era caro. E as duas equipes viviam em atrito, porque uma era medida por entregar rápido e a outra por encontrar problema.\n\nO modelo ágil dissolve o muro. A qualidade passa a ser **atributo do time**, não etapa de um departamento.",
                    },
                    {
                        type: "text",
                        value: '## O que "todo mundo é responsável" significa de verdade\n\nEssa frase é repetida em todo lugar e mal compreendida na maioria delas. Ela **não** significa que a função de QA some, nem que todos fazem tudo igual. Significa uma divisão diferente:\n\n**Quem desenvolve** testa o próprio trabalho antes de entregar, escreve testes automatizados, participa da conversa sobre cenários e não trata "achar bug" como serviço de outra pessoa.\n\n**Quem faz QA** cuida da estratégia, das técnicas, dos cenários que ninguém pensou, do olhar de risco e do processo. Traz a especialidade que não se improvisa, e ensina o time a testar melhor em vez de testar por ele.\n\n**Quem cuida do produto** escreve critérios verificáveis, prioriza correção com critério e não trata qualidade como item negociável quando o prazo aperta.\n\n**O time inteiro** decide junto o que significa pronto, e assume junto o resultado do que sobe.',
                    },
                    {
                        type: "table",
                        value: '[["Sintoma do muro", "Sinal de time integrado"], ["\\"Já terminei, agora é com o QA\\"", "\\"Terminei, testei estes cenários, vamos olhar juntos os de erro\\""], ["Bug é problema de quem testou e deixou passar", "Bug em produção é aprendizado do time na retrospectiva"], ["QA descobre a funcionalidade quando ela fica pronta", "QA participou do refinamento e já sabia o que esperar"], ["Meta de QA é achar defeito", "Meta do time é entregar com risco conhecido"], ["Qualidade entra na conta quando sobra tempo", "Definição de pronto vale para toda história"]]',
                    },
                    {
                        type: "quote",
                        value: 'Um sinal simples de que o muro caiu: quando um defeito chega em produção, a primeira pergunta do time é **"o que no nosso processo deixou isso passar?"** em vez de **"quem deixou isso passar?"**. A primeira gera melhoria; a segunda gera medo e silêncio.',
                    },
                    {
                        type: "text",
                        value: '## Como QA constrói essa cultura na prática\n\nVocê não muda a cultura de um time com discurso. Muda com hábitos pequenos e repetidos:\n\n**Mostre, não reporte.** Em vez de abrir um chamado e esperar, chame a pessoa e mostre na tela. Resolve mais rápido e cria proximidade.\n\n**Compartilhe a técnica.** Explique por que você testou aquele valor de borda. Quando quem desenvolve aprende a pensar em bordas, os defeitos param de chegar até você.\n\n**Traga dado, não opinião.** "Estamos entregando com pressa" gera defesa. "Dos oito bugs desta sprint, seis vieram de critério ambíguo" gera conversa.\n\n**Comemore o defeito evitado.** Quando uma pergunta no refinamento evita um problema, diga isso em voz alta na retrospectiva. Trabalho preventivo é invisível por natureza, e o que não é visto não é valorizado.\n\n**Não seja o portão.** Assim que você vira quem aprova, o time para de se responsabilizar. Informe risco, participe da decisão, mas deixe a decisão com o time.',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando o módulo:** o ágil muda **quando** QA entra, não o que QA faz; Scrum organiza em ciclos e o refinamento é a cerimônia de maior retorno; Kanban organiza por fluxo e revela que fila em teste é problema de fluxo, não de capacidade; história de usuário é lembrete de conversa, e BDD com Gherkin registra os exemplos combinados; e qualidade é do time, com QA trazendo a especialidade em vez de carregar o problema sozinha.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual era o principal efeito do modelo em que o time jogava a entrega por cima do muro para a equipe de teste?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O defeito era descoberto tarde, quando corrigir já saía caro.",
                                isCorrect: true,
                            },
                            {
                                text: "A equipe de teste conseguia se especializar mais e encontrar defeitos com mais precisão.",
                                isCorrect: false,
                            },
                            {
                                text: "A documentação do sistema ficava mais completa por causa da formalidade do processo.",
                                isCorrect: false,
                            },
                            {
                                text: "Os prazos de entrega eram cumpridos com mais frequência do que nos modelos atuais.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'O que a frase "qualidade é responsabilidade de todo mundo" significa na prática?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Cada papel contribui de um jeito, e a função de QA continua existindo.",
                                isCorrect: true,
                            },
                            {
                                text: "Todas as pessoas do time executam as mesmas atividades de teste durante o ciclo.",
                                isCorrect: false,
                            },
                            {
                                text: "A função de QA deixa de ser necessária, já que o time inteiro passa a testar o produto.",
                                isCorrect: false,
                            },
                            {
                                text: "A responsabilidade formal pela qualidade passa a ser da pessoa que gerencia o time.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um defeito chega em produção. Qual primeira pergunta indica um time integrado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O que no nosso processo deixou isso passar?",
                                isCorrect: true,
                            },
                            {
                                text: "Quem foi a pessoa responsável por testar essa funcionalidade antes da entrega?",
                                isCorrect: false,
                            },
                            {
                                text: "Quantos casos de teste deixaram de ser executados por falta de tempo na sprint?",
                                isCorrect: false,
                            },
                            {
                                text: "Qual foi a severidade atribuída ao defeito quando ele foi registrado na ferramenta?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, por que QA não deve atuar como portão de aprovação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque o time para de se responsabilizar quando alguém aprova por ele.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a aprovação formal atrasa a entrega e reduz a velocidade do time no ciclo.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque somente quem cuida do produto tem autoridade para aprovar uma entrega nova.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a aprovação exige conhecimento técnico que a área de qualidade não costuma ter.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que a aula recomenda comemorar o defeito evitado na retrospectiva?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque trabalho preventivo é invisível, e o que não é visto não é valorizado.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a métrica de defeitos evitados é a principal forma de medir a equipe de qualidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque isso incentiva a equipe a registrar mais defeitos durante as sprints seguintes.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a retrospectiva exige que o time apresente ao menos um ponto positivo do ciclo.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Da teoria à automação",
        aulas: [
            {
                titulo: "Quando automatizar e quando não vale a pena",
                blocks: [
                    {
                        type: "text",
                        value: '## Automação não é o objetivo\n\nChegamos ao módulo que faz a ponte entre o que você aprendeu e o mundo da automação. E ele começa desfazendo a ideia mais cara do mercado: **automatizar tudo não é meta, é desperdício**.\n\nTeste automatizado é código. Como todo código, ele precisa ser escrito, revisado, executado, corrigido quando quebra e apagado quando não serve mais. Ele tem custo de criação e, principalmente, **custo de manutenção**, que é o que quase ninguém calcula na hora de decidir.\n\nA pergunta certa nunca é "isso dá para automatizar?". Quase tudo dá. A pergunta é: **"o que eu ganho automatizando isso, comparado ao que vou pagar para manter?"**.',
                    },
                    {
                        type: "text",
                        value: "## O que compensa automatizar\n\nAlguns padrões deixam a conta positiva com folga:\n\n**Alta repetição.** O teste vai rodar dezenas ou centenas de vezes. Regressão é o exemplo perfeito: cada entrega precisa confirmar que o que já existia continua funcionando, para sempre.\n\n**Resultado determinístico.** Mesma entrada, mesma saída, sempre. Cálculo, validação, regra de negócio.\n\n**Alto risco.** Fluxo de pagamento, autenticação, cálculo financeiro. Vale ter uma rede fixa mesmo com custo alto.\n\n**Verificação difícil ou tediosa à mão.** Conferir cem linhas de um relatório, comparar dois arquivos, testar quarenta combinações de uma tabela de decisão.\n\n**Feedback rápido para quem programa.** Testes que rodam em segundos e avisam antes do código sair da máquina.\n\n**Estabilidade.** A funcionalidade não muda toda semana. Automatizar tela que ainda está sendo desenhada é jogar trabalho fora.",
                    },
                    {
                        type: "text",
                        value: "## O que geralmente não compensa\n\n**Vai rodar uma vez.** Uma migração pontual, uma verificação de campanha que dura uma semana.\n\n**Área instável.** Se a tela muda a cada sprint, o teste vai passar mais tempo sendo consertado do que encontrando defeito.\n\n**Resultado subjetivo.** Usabilidade, clareza de texto, se o layout está agradável, se a experiência faz sentido. Máquina não avalia isso.\n\n**Exploração.** É definida por ser criativa e adaptativa. Automatizar exploração é uma contradição.\n\n**Cenário caríssimo de montar.** Se preparar o ambiente para o teste rodar exige três integrações externas e dados que expiram, às vezes o custo supera o benefício.",
                    },
                    {
                        type: "table",
                        value: '[["Situação", "Automatizar?", "Por quê"], ["Regressão do fluxo de compra", "Sim", "Repete sempre, alto risco, resultado previsível"], ["Cálculo de imposto com 30 combinações", "Sim", "Tedioso à mão e totalmente determinístico"], ["Tela nova que muda a cada sprint", "Ainda não", "Manutenção supera o benefício"], ["Avaliar se o texto do erro é claro", "Não", "Julgamento humano, não verificação"], ["Verificação única de uma migração", "Não", "Roda uma vez, não paga o investimento"], ["Smoke após cada implantação", "Sim", "Curto, frequente e destrava o resto"]]',
                    },
                    {
                        type: "quote",
                        value: "A pergunta prática antes de automatizar qualquer caso: **quantas vezes isso vai rodar, e quanto vai custar consertar quando quebrar?** Se você não sabe responder, provavelmente ainda não é hora de automatizar aquele cenário.",
                    },
                    {
                        type: "text",
                        value: "## O erro mais caro: automatizar tudo pela interface\n\nÉ o caminho que quase todo time percorre, e a lição custa caro.\n\nA interface é o lugar mais natural para começar, porque é onde a pessoa testa à mão. Mas teste de interface é o mais lento, o mais frágil e o mais caro de manter. Um botão que muda de nome quebra vinte testes. Um campo que passa a carregar depois quebra outros dez. E quando cinquenta testes ficam vermelhos, ninguém investiga: o time começa a ignorar a suíte, e ela morre.\n\nO padrão que funciona é distribuir por nível: a regra de negócio testada perto do código, a integração testada no nível de API, e a interface reservada para os poucos fluxos que realmente precisam ser vistos de ponta a ponta. É exatamente o que a pirâmide de testes organiza, e é a próxima aula.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a pergunta certa antes de automatizar um caso de teste?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O que eu ganho comparado ao custo de manter esse teste funcionando?",
                                isCorrect: true,
                            },
                            {
                                text: "Esse cenário pode ser reproduzido pela ferramenta de automação escolhida pelo time?",
                                isCorrect: false,
                            },
                            {
                                text: "Quanto tempo a equipe vai levar para escrever o script desse caso de teste específico?",
                                isCorrect: false,
                            },
                            {
                                text: "Qual é a severidade dos defeitos que esse caso de teste consegue encontrar no sistema?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual característica torna um teste um bom candidato à automação?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Alta repetição com resultado determinístico.",
                                isCorrect: true,
                            },
                            {
                                text: "Cenário complexo que exige julgamento humano sobre a qualidade da experiência.",
                                isCorrect: false,
                            },
                            {
                                text: "Funcionalidade nova, ainda em construção, cuja interface muda a cada sprint do time.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificação única, feita durante uma migração pontual de dados entre dois sistemas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que não vale a pena automatizar testes de usabilidade e clareza de texto?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque o resultado é subjetivo e depende de julgamento humano.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque as ferramentas de automação não conseguem interagir com elementos de texto.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque esses testes são executados poucas vezes ao longo da vida do produto digital.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque exigem um ambiente dedicado que a maioria das equipes não tem disponível.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um time automatiza tudo pela interface. Qual é a consequência mais provável?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A suíte fica lenta e frágil, e o time acaba ignorando os testes vermelhos.",
                                isCorrect: true,
                            },
                            {
                                text: "A cobertura de código atinge níveis altos e a equipe reduz o esforço com testes manuais.",
                                isCorrect: false,
                            },
                            {
                                text: "Os defeitos passam a ser encontrados mais cedo, porque a interface é a camada mais visível.",
                                isCorrect: false,
                            },
                            {
                                text: "O custo de criação aumenta, mas o de manutenção diminui com o passar do tempo do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que automatizar uma tela que ainda está sendo desenhada costuma ser desperdício?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque o teste passa mais tempo sendo consertado do que achando defeito.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque telas em construção não permitem que a ferramenta identifique os elementos.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a equipe de design ainda não aprovou o comportamento final da funcionalidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque testes de interface só devem ser criados depois que a regra de negócio estabiliza.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A pirâmide de testes",
                blocks: [
                    {
                        type: "text",
                        value: "## Como distribuir os testes entre os níveis\n\nVocê já conhece os níveis: unidade, integração, sistema e aceitação. A **pirâmide de testes** responde a uma pergunta que sobrou: **quantos de cada?**\n\nO desenho é simples. Na base, muitos testes de unidade. No meio, uma quantidade menor de testes de integração e de API. No topo, poucos testes de ponta a ponta pela interface.\n\nA forma não é estética: ela segue o custo. Quanto mais alto o nível, mais lento, mais frágil e mais caro de manter cada teste. Então você concentra volume onde é barato e reserva o topo para o que só o topo consegue verificar.",
                    },
                    {
                        type: "table",
                        value: '[["Camada", "Quantidade", "Velocidade", "O que verifica", "Fragilidade"], ["Unidade (base)", "Muitos", "Milissegundos", "Regras e lógica isoladas", "Muito baixa"], ["Integração e API (meio)", "Alguns", "Segundos", "Peças conversando, contratos, banco", "Média"], ["Ponta a ponta (topo)", "Poucos", "Minutos", "Fluxos críticos como quem usa faz", "Alta"]]',
                    },
                    {
                        type: "text",
                        value: "## Por que a forma importa\n\nImagine dois times com o mesmo produto.\n\nO **time A** tem 800 testes de unidade, 120 de API e 15 de ponta a ponta. A suíte roda em três minutos. Quando falha, a mensagem aponta a função exata. Quem programa roda tudo antes de commitar.\n\nO **time B** tem 400 testes de ponta a ponta pela interface e quase nada abaixo. A suíte roda em 90 minutos, falha sozinha algumas vezes por semana, e quando fica vermelha ninguém sabe se é a regra, a integração ou o layout. O time roda uma vez por dia, à noite, e de manhã alguém passa duas horas triando falhas.\n\nOs dois têm testes. Só um tem uma rede de segurança que o time confia. E confiança é o que determina se a suíte vai ser usada ou ignorada.",
                    },
                    {
                        type: "quote",
                        value: 'A pergunta que revela a saúde da suíte não é "quantos testes temos?", é **"quando um teste falha, o time investiga ou reinicia a execução torcendo para passar?"**. Reiniciar torcendo é o sintoma de uma pirâmide invertida.',
                    },
                    {
                        type: "text",
                        value: "## As formas erradas\n\n**Cone de sorvete (pirâmide invertida).** Muita interface, pouca base. É o formato mais comum e o mais doloroso: lento, instável e caro. Acontece naturalmente quando a automação começa por quem testa pela tela, sem envolver quem escreve o código.\n\n**Ampulheta.** Muita unidade e muita interface, quase nada no meio. O time pula a camada de API, que é justamente a mais barata para verificar integração e regra de ponta a ponta sem depender do layout. Costuma ser a camada com melhor retorno e a mais esquecida.",
                    },
                    {
                        type: "text",
                        value: "## E o troféu de testes\n\nVale conhecer uma variação moderna, porque você vai ouvir falar dela: o **troféu de testes**, popularizado no mundo de front-end.\n\nA ideia é que, com ferramentas e linguagens de hoje, a camada de maior retorno é a de **integração**, e não a de unidade. O desenho fica com uma base de análise estática (tipos e linter, que pegam uma classe inteira de erro sem escrever teste nenhum), uma faixa de unidade, uma faixa **maior** de integração, e uma ponta de testes de ponta a ponta.\n\nPirâmide e troféu não se contradizem tanto quanto parece. Os dois dizem a mesma coisa no fundo: **muitos testes rápidos e baratos embaixo, poucos testes lentos e frágeis em cima**. O que muda é onde fica o volume do meio, e isso depende do tipo de produto. Sistema com muita regra de negócio pesa na unidade; aplicação que basicamente conecta componentes e serviços pesa na integração.\n\nO que você deve levar dos dois: **não concentre o volume no topo**.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a distribuição que a pirâmide de testes propõe?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Muitos testes de unidade na base e poucos de ponta a ponta no topo.",
                                isCorrect: true,
                            },
                            {
                                text: "Quantidade equilibrada entre as três camadas para garantir cobertura uniforme do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Muitos testes de ponta a ponta, por serem os mais próximos da experiência de quem usa.",
                                isCorrect: false,
                            },
                            {
                                text: "Concentração dos testes na camada de integração, por ser a de melhor custo-benefício.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que a pirâmide tem essa forma?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque quanto mais alto o nível, mais lento, frágil e caro de manter.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque os testes de unidade encontram mais defeitos do que os das outras camadas.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque as ferramentas de teste unitário são mais baratas do que as de interface gráfica.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a maioria dos defeitos de um sistema se concentra nas funções isoladas do código.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um time tem 400 testes de interface e quase nada abaixo. Que formato é esse?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Cone de sorvete, ou pirâmide invertida.",
                                isCorrect: true,
                            },
                            {
                                text: "Ampulheta, com concentração nas pontas e vazio na camada intermediária de integração.",
                                isCorrect: false,
                            },
                            {
                                text: "Troféu de testes, com a base formada por análise estática e tipos verificados no código.",
                                isCorrect: false,
                            },
                            {
                                text: "Pirâmide clássica, apenas com um volume total maior de casos automatizados no projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual pergunta a aula propõe para revelar a saúde de uma suíte automatizada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Quando um teste falha, o time investiga ou reinicia torcendo para passar?",
                                isCorrect: true,
                            },
                            {
                                text: "Quantos testes automatizados a equipe conseguiu escrever ao longo da última sprint?",
                                isCorrect: false,
                            },
                            {
                                text: "Qual é a porcentagem de cobertura de código que a suíte atinge no projeto atual?",
                                isCorrect: false,
                            },
                            {
                                text: "Quanto tempo a suíte completa leva para ser executada no ambiente de integração?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que a pirâmide e o troféu de testes têm em comum?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Muitos testes rápidos e baratos embaixo, poucos lentos e frágeis em cima.",
                                isCorrect: true,
                            },
                            {
                                text: "A recomendação de concentrar o maior volume de testes na camada de integração do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "A defesa de que a análise estática deve substituir os testes de unidade em projetos novos.",
                                isCorrect: false,
                            },
                            {
                                text: "A exigência de atingir cobertura de código completa antes de subir qualquer versão nova.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Como um teste automatizado se parece",
                blocks: [
                    {
                        type: "text",
                        value: "## Desmistificando o código\n\nVocê não precisa saber programar para trabalhar com QA. Mas entender **o formato** de um teste automatizado muda bastante coisa: você conversa melhor com quem desenvolve, entende o que já está coberto, e sabe o que pedir.\n\nA boa notícia é que a estrutura é sempre a mesma, em qualquer linguagem e qualquer ferramenta. Todo teste automatizado segue três passos, e você já conhece o conceito deles: é o mesmo caso de teste que você escreveria à mão.",
                    },
                    {
                        type: "text",
                        value: '## O padrão AAA\n\n**Arrange (preparar).** Monte o cenário: crie os dados, configure o estado inicial, prepare o que precisa existir antes. É a pré-condição do seu caso de teste.\n\n**Act (agir).** Execute a ação que está sendo verificada. Idealmente uma só, como no "Quando" do Gherkin.\n\n**Assert (verificar).** Compare o resultado obtido com o esperado. Se bater, o teste passa; se não, falha com uma mensagem que diz o que era esperado e o que veio.\n\nRepare que é exatamente a estrutura de "pré-condições, passos, resultado esperado", e é a mesma de "Dado, Quando, Então". Três vocabulários, uma ideia.',
                    },
                    {
                        type: "code",
                        value: "// Teste de unidade: a regra de desconto, isolada\ntest('cupom expirado não aplica desconto', () => {\n  // Arrange\n  const carrinho = { subtotal: 100 }\n  const cupom = { codigo: 'PROMO10', percentual: 10, validoAte: '2026-06-30' }\n  const hoje = new Date('2026-07-29')\n\n  // Act\n  const resultado = aplicarCupom(carrinho, cupom, hoje)\n\n  // Assert\n  expect(resultado.total).toBe(100)\n  expect(resultado.mensagem).toBe('Cupom expirado')\n})",
                    },
                    {
                        type: "code",
                        value: "// Teste de API: a mesma regra, agora pela rota HTTP\ntest('POST /carrinho/cupom recusa cupom expirado', async () => {\n  // Arrange\n  const carrinho = await criarCarrinho({ subtotal: 100 })\n  await criarCupom({ codigo: 'PROMO10', percentual: 10, validoAte: '2026-06-30' })\n\n  // Act\n  const resposta = await request(app)\n    .post(`/carrinho/${carrinho.id}/cupom`)\n    .send({ codigo: 'PROMO10' })\n\n  // Assert\n  expect(resposta.status).toBe(422)\n  expect(resposta.body.mensagem).toBe('Cupom expirado')\n})",
                    },
                    {
                        type: "text",
                        value: "## O mesmo cenário em três níveis\n\nRepare que os dois exemplos verificam **a mesma regra de negócio** em níveis diferentes, e um terceiro nível ainda existiria: o teste de ponta a ponta, abrindo o navegador, colocando o produto no carrinho, digitando o cupom e conferindo a mensagem na tela.\n\nOs três são válidos. O que muda é o custo e o que cada um garante:\n\n- O de **unidade** roda em milissegundos e garante a regra. Não garante que a rota existe nem que a tela mostra a mensagem.\n- O de **API** roda em segundos e garante que a rota, a validação e o banco funcionam juntos. Não garante que a tela chama a rota certa.\n- O de **ponta a ponta** roda em segundos ou minutos e garante o caminho inteiro do jeito que a pessoa faz. Quebra com qualquer mudança de layout.\n\nAqui está a decisão prática: você não precisa das trinta combinações de cupom em todos os três níveis. Teste **todas as combinações no nível barato**, e leve ao topo **um** cenário representativo, só para provar que o caminho está ligado de ponta a ponta.",
                    },
                    {
                        type: "quote",
                        value: "Uma frase que resume a estratégia de automação madura: **teste a lógica embaixo e a ligação em cima**. As trinta variações da regra ficam na unidade; o topo prova que a tela, a rota e a regra estão conectadas.",
                    },
                    {
                        type: "text",
                        value: "## O que faz um teste automatizado ser bom\n\nOs mesmos princípios do caso de teste manual, com dois acréscimos que vêm do fato de ser código:\n\n- **Independente**: não depende de outro teste ter rodado antes, nem da ordem de execução.\n- **Repetível**: roda mil vezes com o mesmo resultado, na sua máquina e no servidor.\n- **Rápido**: no nível certo, senão ninguém roda.\n- **Legível**: o nome diz o cenário e o esperado. Quem lê a falha entende sem abrir o código.\n- **Determinístico**: sem depender de data de hoje, de ordem aleatória, de tempo de espera fixo ou de dado que outra pessoa pode ter mudado.\n\nEsse último é a causa número um dos **testes instáveis**, os famosos flaky: passam às vezes e falham às vezes, sem o código ter mudado. Teste instável é pior que teste inexistente, porque ensina o time a ignorar falha, e aí a falha real também passa despercebida.",
                    },
                ],
                questions: [
                    {
                        statement: "O que significa o padrão AAA em um teste automatizado?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Preparar o cenário, executar a ação e verificar o resultado obtido.",
                                isCorrect: true,
                            },
                            {
                                text: "Analisar o requisito, automatizar o cenário e avaliar a cobertura obtida no código.",
                                isCorrect: false,
                            },
                            {
                                text: "Agrupar os casos, aplicar as técnicas de projeto e auditar as evidências registradas.",
                                isCorrect: false,
                            },
                            {
                                text: "Arquitetar a suíte, ajustar o ambiente e acompanhar a execução feita no servidor.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A estrutura Arrange, Act e Assert corresponde a qual formato que você já conhece?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Pré-condições, passos e resultado esperado.",
                                isCorrect: true,
                            },
                            {
                                text: "Severidade, prioridade e frequência registradas no relatório de defeito encontrado.",
                                isCorrect: false,
                            },
                            {
                                text: "Escopo, estratégia e critérios de saída definidos no plano de teste da entrega.",
                                isCorrect: false,
                            },
                            {
                                text: "Estados, eventos e transições descritos no modelo usado para desenhar os cenários.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A regra de cupom tem 30 combinações. Qual é a estratégia recomendada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Cobrir as 30 no nível barato e levar um cenário representativo ao topo.",
                                isCorrect: true,
                            },
                            {
                                text: "Cobrir as 30 combinações nos três níveis, garantindo redundância total da verificação.",
                                isCorrect: false,
                            },
                            {
                                text: "Cobrir as 30 apenas no teste de ponta a ponta, que é o mais próximo do uso real.",
                                isCorrect: false,
                            },
                            {
                                text: "Escolher aleatoriamente dez combinações e distribuí-las entre as camadas existentes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o teste de unidade da regra de cupom NÃO garante?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que a rota existe e que a tela exibe a mensagem para quem usa.",
                                isCorrect: true,
                            },
                            {
                                text: "Que a regra de expiração do cupom foi implementada conforme o critério de aceitação.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o cálculo do total permanece correto quando o cupom informado já está expirado.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a função devolve a mensagem esperada quando recebe um cupom fora da validade.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que um teste instável (flaky) é considerado pior do que não ter teste?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque ensina o time a ignorar falha, e a falha real também passa despercebida.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque consome mais tempo de execução do que os testes que passam de forma consistente.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque impede que novos casos sejam adicionados à mesma suíte automatizada do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque exige que o ambiente de execução seja reconfigurado a cada nova falha registrada.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Ferramentas, certificações e carreira em QA",
                blocks: [
                    {
                        type: "text",
                        value: "## O panorama de ferramentas\n\nFerramenta muda o tempo todo, e decorar nomes não constrói carreira. Mas conhecer as **categorias** ajuda a entender o mercado e a ler uma vaga sem se assustar.\n\n**Gestão de teste e defeito.** Onde os casos, execuções e bugs vivem: Jira com Xray ou Zephyr, TestRail, Qase, Azure Test Plans.\n\n**Automação de interface web.** Cypress, Playwright, Selenium. São as que aparecem em quase toda vaga de automação hoje.\n\n**Automação de API.** Postman e Newman, REST Assured, supertest, e as próprias bibliotecas de requisição da linguagem.\n\n**Automação mobile.** Appium, Espresso (Android), XCUITest (iOS), Maestro.\n\n**Desempenho.** k6, JMeter, Gatling, Locust.\n\n**BDD.** Cucumber, SpecFlow, Behave, ou o suporte nativo de Gherkin de algumas ferramentas.\n\n**Apoio.** Ferramentas de acessibilidade (axe, Lighthouse), de comparação visual, de geração de massa de dados, e o próprio pipeline de CI onde tudo isso roda.",
                    },
                    {
                        type: "table",
                        value: '[["Categoria", "Exemplos", "Quando entra na sua rotina"], ["Gestão", "Jira, TestRail, Qase", "Desde o primeiro dia, em qualquer vaga"], ["Automação web", "Cypress, Playwright, Selenium", "Quando o time decide automatizar regressão"], ["API", "Postman, REST Assured, supertest", "Cedo, e costuma ser o melhor retorno"], ["Desempenho", "k6, JMeter", "Antes de eventos e mudanças estruturantes"], ["Acessibilidade", "axe, Lighthouse", "Deveria ser sempre, na prática é raro"]]',
                    },
                    {
                        type: "text",
                        value: "## Certificações: valem a pena?\n\nA mais conhecida da área é a **ISTQB Foundation Level** (CTFL), reconhecida internacionalmente. Boa parte do vocabulário desta trilha vem justamente do corpo de conhecimento dela: níveis, tipos, técnicas, princípios, processo de teste.\n\nVale a pena? Depende do objetivo.\n\n**A favor**: organiza o vocabulário, é reconhecida por RHs, abre porta em empresas grandes e em consultorias, e é comum em vagas na Europa. Para quem está migrando de outra área e precisa de um sinal no currículo, ajuda.\n\n**Contra**: certificação não substitui prática. Ninguém contrata alguém que sabe recitar os princípios mas nunca escreveu um relatório de defeito decente. E existem empresas, principalmente produtos digitais e startups, que não dão peso algum a ela.\n\nUm conselho honesto: se você está começando, **construa prática primeiro**. Teste um produto real, escreva casos, reporte bugs de verdade, automatize algo pequeno. A certificação rende muito mais quando você já tem contexto para pendurar os conceitos, e o portfólio prático convence mais entrevista técnica do que o certificado.",
                    },
                    {
                        type: "text",
                        value: "## Como é a carreira\n\nOs caminhos mais comuns hoje:\n\n**QA / Analista de teste.** O tronco. Começa executando e reportando, evolui para projetar estratégia, influenciar processo e cuidar de risco.\n\n**QA de automação / SDET.** Perfil mais técnico, que escreve código de teste, cuida da suíte e da infraestrutura de execução. Exige linguagem de programação e boa noção de arquitetura de testes. É o caminho de maior demanda e melhores salários hoje.\n\n**Especialista em desempenho.** Foca em carga, estresse e capacidade. Exige entender infraestrutura, banco e métricas.\n\n**Especialista em segurança de aplicação.** Caminho para quem gosta de quebrar coisas. Costuma migrar para segurança da informação.\n\n**QA Lead / Engenheiro de qualidade.** Cuida da estratégia de qualidade do time ou da empresa, mais processo e influência do que execução.",
                    },
                    {
                        type: "quote",
                        value: "O caminho mais direto para crescer em QA hoje passa por **aprender a programar**. Não para virar desenvolvedor, e sim porque isso abre a automação, permite testar em níveis mais baratos, e muda a conversa com o time: você deixa de pedir e passa a propor.",
                    },
                    {
                        type: "text",
                        value: '## O que realmente faz diferença\n\nAlém do técnico, três coisas separam quem cresce rápido de quem estaciona:\n\n**Comunicação.** Grande parte do trabalho é escrever com clareza e conversar sem gerar defesa. Um relatório bem escrito e uma pergunta bem colocada no refinamento valem mais que dominar mais uma ferramenta.\n\n**Curiosidade sobre o negócio.** Quem entende como a empresa ganha dinheiro testa melhor, porque sabe onde o risco realmente dói. Testar um sistema de logística sem entender de logística é testar telas, não risco.\n\n**Ceticismo saudável.** A pergunta "será que é isso mesmo?" é a habilidade central da profissão. Não é implicância: é o hábito de não aceitar que algo funciona só porque parece funcionar.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a certificação mais conhecida da área de teste de software?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "ISTQB Foundation Level.",
                                isCorrect: true,
                            },
                            {
                                text: "Scrum Master certificado, oferecida pelas principais organizações do mercado ágil.",
                                isCorrect: false,
                            },
                            {
                                text: "Certificação em automação com Selenium emitida pela comunidade da ferramenta.",
                                isCorrect: false,
                            },
                            {
                                text: "AWS Certified Developer, voltada a quem constrói aplicações na nuvem da Amazon.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual conselho a aula dá para quem está começando na carreira de QA?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Construir prática primeiro, porque a certificação rende mais com contexto.",
                                isCorrect: true,
                            },
                            {
                                text: "Obter a certificação antes de qualquer coisa, para conseguir a primeira oportunidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Focar em dominar o maior número possível de ferramentas de automação do mercado.",
                                isCorrect: false,
                            },
                            {
                                text: "Escolher desde o início uma especialização como desempenho ou segurança de aplicação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que caracteriza o perfil de QA de automação (SDET)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Escrever código de teste e cuidar da suíte e da infraestrutura de execução.",
                                isCorrect: true,
                            },
                            {
                                text: "Executar os casos de teste manuais planejados e registrar os defeitos encontrados.",
                                isCorrect: false,
                            },
                            {
                                text: "Definir a estratégia de qualidade da empresa e influenciar o processo dos times.",
                                isCorrect: false,
                            },
                            {
                                text: "Medir carga e capacidade do sistema, analisando métricas de infraestrutura e banco.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, por que aprender a programar é o caminho mais direto para crescer em QA?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque abre a automação e muda a conversa: você propõe em vez de pedir.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque permite substituir a equipe de desenvolvimento na correção dos defeitos encontrados.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a maioria das empresas exige certificação em uma linguagem de programação.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque os testes manuais estão sendo eliminados das empresas de produto digital.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que entender o negócio da empresa melhora o trabalho de QA?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque permite saber onde o risco realmente dói, em vez de só testar telas.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque facilita a comunicação com a área comercial durante as reuniões de alinhamento.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque reduz a necessidade de escrever casos de teste detalhados para cada funcionalidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque acelera a execução dos cenários planejados durante o ciclo de entrega da sprint.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Seu próximo passo",
                blocks: [
                    {
                        type: "text",
                        value: "## O que você construiu\n\nSete módulos atrás você provavelmente achava que testar era clicar até algo quebrar. Vale olhar o tamanho do que ficou:\n\n- **Qualidade e o papel de QA**: qualidade é atender à necessidade; QA cuida do processo, QC do produto, teste é a atividade; o defeito fica mais caro a cada etapa que atravessa; e erro, defeito e falha são coisas diferentes.\n- **Princípios e processo**: os sete princípios; as cinco atividades do processo; risco como bússola do que testar; teste estático achando defeito sem executar nada; e a diferença entre verificação e validação.\n- **Níveis e tipos**: unidade, integração, sistema e aceitação; funcional e não funcional; reteste, regressão, smoke e sanidade; caixa-preta, branca e cinza.\n- **Técnicas**: partição de equivalência, valor limite, tabela de decisão, transição de estados e teste exploratório com sessões.\n- **Dia a dia**: caso de teste que outra pessoa executa, plano enxuto que o time leu, relatório de defeito que leva à correção, severidade e prioridade, critérios de aceitação e definição de pronto.\n- **Ágil**: o que muda de cascata para ágil, o lugar de QA no Scrum e no Kanban, história de usuário, BDD e Gherkin, e qualidade como responsabilidade do time.\n- **Automação**: o que compensa automatizar, a pirâmide, como um teste se parece por dentro, e o panorama de ferramentas e carreira.\n\nIsso é a base da profissão. Daqui em diante o caminho é vertical: pegar cada peça e ir fundo.",
                    },
                    {
                        type: "quote",
                        value: "Se você levar uma única ideia desta trilha, que seja esta: o trabalho de QA não é **encontrar defeitos**. É **reduzir o risco de o time entregar algo que não serve**, e informar com honestidade o risco que sobra. Encontrar defeito é só uma das formas de fazer isso, e nem sempre é a mais eficiente.",
                    },
                    {
                        type: "text",
                        value: "## O próximo passo: Testes e Qualidade\n\nVocê aprendeu **o que** testar, **por que** e **com qual técnica**. O passo natural agora é aprender a **escrever o teste em código**.\n\nÉ exatamente isso que a trilha **Testes e Qualidade** faz. Ela pega os conceitos que você viu aqui e os transforma em prática com código:\n\n- O primeiro teste unitário rodando de verdade, com describe, it e expect, e o padrão AAA que você acabou de ver.\n- Mocks e dublês de teste, para isolar a unidade do banco e das APIs externas.\n- Testes de integração com banco efêmero e verificação de rotas HTTP de ponta a ponta.\n- TDD e como escrever código que é fácil de testar.\n- Cobertura de código, testes instáveis e a suíte rodando no CI.\n- Qualidade além do teste: linter, formatador, tipos e revisão de código.\n\nÉ a ponte entre saber testar e saber automatizar. E, se você seguir o caminho de QA de automação, é o degrau que abre todos os outros.",
                    },
                    {
                        type: "text",
                        value: "## Depois dela: Testes E2E com Cypress e Playwright\n\nCom a base de automação no lugar, o passo seguinte é o topo da pirâmide: os testes que abrem o navegador e percorrem o fluxo do jeito que a pessoa percorre.\n\nA trilha **Testes E2E com Cypress e Playwright** cobre justamente isso: escolher entre as duas ferramentas, escrever o primeiro teste, encontrar elementos de forma que não quebre a cada mudança de layout, lidar com espera e assincronismo (a maior fonte de teste instável), organizar a suíte para não virar um pesadelo de manutenção, testar API junto com interface, e colocar tudo rodando no pipeline com relatório, print e vídeo de cada falha.\n\nUm aviso que vale repetir: E2E é a camada mais cara. Ela é indispensável para os fluxos críticos e desastrosa quando vira o lugar onde tudo é testado. A trilha trata disso com bastante cuidado.",
                    },
                    {
                        type: "table",
                        value: '[["Trilha", "O que você aprende", "Pré-requisito"], ["Fundamentos de QA", "O que testar, por que e com qual técnica", "Nenhum"], ["Testes e Qualidade", "Escrever testes de unidade e integração em código", "Lógica de programação e JavaScript básico"], ["Testes E2E com Cypress e Playwright", "Automatizar fluxos completos no navegador", "Testes e Qualidade"]]',
                    },
                    {
                        type: "quote",
                        value: "Você chegou ao fim da porta de entrada. Da próxima vez que ler uma história de usuário, você não vai mais ver só um texto: vai ver as bordas que faltam, os caminhos de erro que ninguém descreveu e as perguntas que precisam ser feitas antes de qualquer linha de código. Isso já é trabalho de QA, e você já está fazendo.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Segundo o fechamento da trilha, qual é o trabalho central de QA?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Reduzir o risco de entregar algo que não serve e informar o risco que sobra.",
                                isCorrect: true,
                            },
                            {
                                text: "Encontrar a maior quantidade possível de defeitos antes que o produto chegue ao cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "Aprovar ou reprovar as entregas do time antes que elas sejam publicadas em produção.",
                                isCorrect: false,
                            },
                            {
                                text: "Automatizar todos os cenários de teste para reduzir o esforço manual da equipe.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que a trilha Testes e Qualidade acrescenta ao que você viu aqui?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Como escrever os testes em código, com unidade, integração e mocks.",
                                isCorrect: true,
                            },
                            {
                                text: "As técnicas de projeto de teste como partição de equivalência e valor limite aplicadas.",
                                isCorrect: false,
                            },
                            {
                                text: "A organização do trabalho de qualidade dentro de times que usam Scrum e Kanban.",
                                isCorrect: false,
                            },
                            {
                                text: "Os critérios para classificar severidade e prioridade dos defeitos encontrados no ciclo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o pré-requisito indicado para a trilha de Testes E2E?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A trilha Testes e Qualidade.",
                                isCorrect: true,
                            },
                            {
                                text: "Nenhum, já que os testes de ponta a ponta dispensam conhecimento de automação anterior.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma certificação da área de qualidade que comprove o domínio dos conceitos estudados.",
                                isCorrect: false,
                            },
                            {
                                text: "Experiência prévia com ferramentas de teste de desempenho como k6 ou JMeter.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual advertência a aula faz sobre os testes de ponta a ponta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "São indispensáveis nos fluxos críticos e desastrosos como lugar único de teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Só devem ser usados quando a equipe não consegue escrever testes de unidade no projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Precisam cobrir todas as combinações de regra de negócio existentes na aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Devem substituir os testes de integração sempre que a interface estiver estável.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual sequência de trilhas o fechamento propõe para quem quer seguir em automação?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Fundamentos de QA, depois Testes e Qualidade e por fim Testes E2E.",
                                isCorrect: true,
                            },
                            {
                                text: "Testes E2E primeiro, por ser o mais próximo do uso real, e depois as demais trilhas.",
                                isCorrect: false,
                            },
                            {
                                text: "Testes e Qualidade antes de Fundamentos de QA, já que a prática vem antes da teoria.",
                                isCorrect: false,
                            },
                            {
                                text: "Fundamentos de QA e Testes E2E em paralelo, deixando Testes e Qualidade como opcional.",
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
