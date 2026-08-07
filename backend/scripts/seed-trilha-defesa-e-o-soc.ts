// Seed da trilha Defesa e o SOC, estagio 5 do roadmap de Seguranca
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-defesa-e-o-soc.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Defesa e o SOC";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "A rotina de quem defende, do dado bruto à decisão: como um centro de operações coleta log de verdade, o que um SIEM faz e o que ele não faz, como se escreve uma detecção que sobrevive ao contato com a realidade, como se tria um alerta sem afogar em falso positivo, o ciclo de resposta a incidente e a caça que começa antes de qualquer alarme tocar.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - O centro de operações de segurança",
    aulas: [
        {
            titulo: "O que é um SOC e o que ele entrega",
            blocks: [
                {
                    type: "text",
                    value: "# Não é uma sala com telas, é uma função\n\nCentro de operações de segurança, conhecido pela sigla SOC, é a função organizacional responsável por detectar, investigar e responder a atividade maliciosa. A imagem de filme, com telão e mapa do mundo piscando, atrapalha mais do que ajuda: SOC é processo e gente, não decoração.\n\nA entrega dele cabe em três verbos. Detectar, que significa transformar dado bruto em alerta relevante. Investigar, que significa decidir se aquele alerta é real e qual o alcance. Responder, que significa interromper e recuperar. Tudo o mais, ferramenta, turno, painel, existe para sustentar esses três.\n\nSOC não precisa ser interno. Muitas empresas contratam serviço gerenciado, e a escolha é econômica: monitoramento contínuo exige cobertura fora do horário comercial, e manter equipe própria em turnos é caro. O modelo híbrido é comum: o serviço externo faz a primeira triagem e a empresa mantém quem conhece o contexto do negócio.",
                },
                {
                    type: "table",
                    value: '[["Modelo","Como funciona","Quando faz sentido"],["Interno","Equipe própria em turnos","Empresa grande, com regulação forte"],["Gerenciado","Fornecedor externo monitora","Empresa sem escala para turnos"],["Híbrido","Externo tria, interno decide","Maioria dos casos intermediários"],["Sob demanda","Contrato acionado no incidente","Empresa pequena, risco aceito"]]',
                },
                {
                    type: "text",
                    value: "# O trabalho real, sem romantismo\n\nVale ajustar a expectativa de quem está entrando. A maior parte do tempo de um analista não é caçar invasor sofisticado: é triar alertas, muitos deles falsos positivos, e documentar o que foi decidido. Isso não é falha do modelo, é a natureza do trabalho, e quem entende cedo se frustra menos.\n\nO que diferencia um SOC bom de um SOC ruim não é a quantidade de alertas gerados, é quantos deles mereciam existir. Um ambiente que dispara mil alertas por dia com três reais não tem visibilidade, tem barulho, e o efeito é o analista aprender a ignorar.\n\nA segunda diferença é o ciclo de melhoria. SOC bom transforma cada incidente em detecção nova e cada falso positivo recorrente em ajuste de regra. Sem esse ciclo, a equipe repete o mesmo trabalho para sempre e o volume só cresce.",
                },
                {
                    type: "quote",
                    value: "Mil alertas por dia com três reais não é visibilidade, é barulho. E o efeito prático do barulho é ensinar o analista a ignorar.",
                },
            ],
            questions: [
                {
                    statement: "Quais são as três entregas centrais de um SOC?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Detectar, investigar e responder a atividade maliciosa",
                            isCorrect: true,
                        },
                        {
                            text: "Instalar, configurar e atualizar as ferramentas de defesa",
                            isCorrect: false,
                        },
                        {
                            text: "Auditar, documentar e reportar as falhas encontradas",
                            isCorrect: false,
                        },
                        {
                            text: "Bloquear, isolar e reinstalar as máquinas atingidas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que muitas empresas optam por SOC gerenciado?",
                    difficulty: "facil",
                    options: [
                        { text: "Manter equipe própria em turnos sai caro", isCorrect: true },
                        { text: "Fornecedores têm acesso a dados exclusivos", isCorrect: false },
                        {
                            text: "A legislação exige monitoramento por terceiros",
                            isCorrect: false,
                        },
                        {
                            text: "Ferramentas só funcionam em modelo terceirizado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como funciona o modelo híbrido de SOC?",
                    difficulty: "medio",
                    options: [
                        { text: "O externo faz a triagem e o interno decide", isCorrect: true },
                        { text: "O interno monitora de dia e o externo à noite", isCorrect: false },
                        { text: "Cada um cobre metade dos sistemas da empresa", isCorrect: false },
                        { text: "O externo responde e o interno apenas audita", isCorrect: false },
                    ],
                },
                {
                    statement: "O que melhor distingue um SOC eficaz de um ineficaz?",
                    difficulty: "medio",
                    options: [
                        { text: "Quantos alertas mereciam de fato existir", isCorrect: true },
                        { text: "Quantos alertas são gerados a cada dia", isCorrect: false },
                        { text: "Quantas ferramentas estão integradas nele", isCorrect: false },
                        { text: "Quantos analistas trabalham por turno", isCorrect: false },
                    ],
                },
                {
                    statement: "Que ciclo de melhoria caracteriza um SOC maduro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Incidente vira detecção e falso positivo vira ajuste",
                            isCorrect: true,
                        },
                        {
                            text: "Alerta vira relatório e relatório vira indicador",
                            isCorrect: false,
                        },
                        {
                            text: "Ferramenta nova substitui a regra escrita à mão",
                            isCorrect: false,
                        },
                        {
                            text: "Turno da noite revisa o que o turno do dia fez",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Papéis, níveis e a carreira",
            blocks: [
                {
                    type: "text",
                    value: "# Onde você entra e para onde se vai\n\nA estrutura clássica organiza o SOC em níveis. O primeiro nível recebe os alertas, faz a triagem inicial e resolve o que é padrão, escalando o que foge do roteiro. O segundo investiga a fundo, correlaciona fontes e conduz incidentes. O terceiro cuida do que é mais especializado: caça a ameaças, análise de artefato, engenharia de detecção.\n\nAo redor dos níveis existem funções que não são de plantão. Engenharia de detecção escreve e mantém as regras. Inteligência de ameaças alimenta o time com contexto sobre adversários. Resposta a incidente conduz os casos graves. Em equipes pequenas, tudo isso é a mesma pessoa em horários diferentes.\n\nA carreira costuma começar no primeiro nível, e há uma armadilha conhecida: ficar preso a fechar alerta sem nunca entender por que a regra existe. Quem cresce rápido é quem lê a regra que gerou o alerta, entende o comportamento por trás e começa a propor ajuste. Essa curiosidade é a diferença entre operar e evoluir.",
                },
                {
                    type: "table",
                    value: '[["Função","O que faz no dia","Habilidade central"],["Analista nível 1","Tria alerta e resolve o padrão","Método e consistência"],["Analista nível 2","Investiga e conduz incidente","Correlação entre fontes"],["Analista nível 3","Caça e analisa o difícil","Profundidade técnica"],["Engenharia de detecção","Escreve e mantém regras","Traduzir comportamento em consulta"],["Inteligência","Traz contexto do adversário","Análise e comunicação"],["Resposta a incidente","Conduz o caso grave","Decisão sob pressão"]]',
                },
                {
                    type: "text",
                    value: "# O que realmente se cobra numa entrevista\n\nQuem contrata para o primeiro nível não espera que você conheça todas as ferramentas do mercado, porque cada empresa usa um conjunto diferente e isso se aprende em semanas. O que se cobra é raciocínio: dado um alerta, o que você pergunta primeiro, que dado busca, como decide.\n\nOs fundamentos que aparecem em toda entrevista são os das trilhas anteriores. Redes, para entender o que uma conexão significa. Linux e linha de comando, porque metade da investigação acontece lendo log em servidor. E o vocabulário de ataque, para saber o que o invasor faria em seguida.\n\nA habilidade mais subestimada é escrever. Analista documenta o tempo todo, e a nota que você deixa num alerta será lida por outra pessoa às três da manhã, com pressa. Nota clara, com o que foi visto, o que foi verificado e o que foi decidido, vale mais que domínio de qualquer ferramenta específica.",
                },
                {
                    type: "quote",
                    value: "Ferramenta se aprende em semanas, raciocínio não. Por isso a entrevista pergunta o que você faria com um alerta, e não que botão você aperta.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a responsabilidade típica do analista de nível 1?",
                    difficulty: "facil",
                    options: [
                        { text: "Triar alertas e resolver os casos padrão", isCorrect: true },
                        { text: "Escrever e manter as regras de detecção", isCorrect: false },
                        { text: "Conduzir a caça proativa por ameaças", isCorrect: false },
                        { text: "Analisar artefatos maliciosos em profundidade", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a engenharia de detecção faz num SOC?",
                    difficulty: "medio",
                    options: [
                        { text: "Escreve e mantém as regras que geram alerta", isCorrect: true },
                        { text: "Responde aos incidentes graves em plantão", isCorrect: false },
                        { text: "Coleta contexto sobre grupos adversários", isCorrect: false },
                        { text: "Configura os equipamentos de rede da empresa", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual armadilha de carreira é comum no primeiro nível?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fechar alerta sem entender por que a regra existe",
                            isCorrect: true,
                        },
                        {
                            text: "Escalar casos demais para o analista de nível 2",
                            isCorrect: false,
                        },
                        { text: "Documentar em excesso cada decisão tomada", isCorrect: false },
                        { text: "Aprender apenas uma ferramenta do mercado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que se cobra principalmente numa entrevista para nível 1?",
                    difficulty: "medio",
                    options: [
                        { text: "Raciocínio diante de um alerta, não ferramenta", isCorrect: true },
                        {
                            text: "Domínio da ferramenta usada por aquela empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Certificação específica emitida por fabricante",
                            isCorrect: false,
                        },
                        { text: "Experiência anterior em resposta a incidente", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a escrita é uma habilidade central para o analista?",
                    difficulty: "dificil",
                    options: [
                        { text: "A nota será lida por outra pessoa, com pressa", isCorrect: true },
                        {
                            text: "Os relatórios são exigidos por auditoria externa",
                            isCorrect: false,
                        },
                        {
                            text: "A documentação substitui o registro das ferramentas",
                            isCorrect: false,
                        },
                        {
                            text: "O texto é usado para treinar as regras automáticas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Os indicadores que medem um SOC",
            blocks: [
                {
                    type: "text",
                    value: "# Medir errado piora o trabalho\n\nToda operação acaba medida, e em segurança a escolha do indicador muda o comportamento da equipe. Medir quantidade de alertas fechados por hora parece produtividade e produz o pior resultado possível: analista fechando rápido, sem investigar, para bater meta.\n\nOs dois indicadores mais usados são tempo médio para detectar e tempo médio para responder. O primeiro mede quanto tempo passa entre o início da atividade maliciosa e a percepção. O segundo mede da percepção até a contenção. Ambos são úteis, e ambos precisam ser lidos com cuidado, porque melhoram artificialmente se você detectar só o que é fácil.\n\nUm indicador que diz mais sobre saúde é a taxa de falso positivo por regra. Regra que gera cem alertas e nenhum verdadeiro está consumindo o recurso mais escasso da operação, que é atenção humana, e deveria ser ajustada ou desligada.",
                },
                {
                    type: "table",
                    value: '[["Indicador","O que mede","Risco de usar mal"],["Tempo para detectar","Do início da atividade à percepção","Melhora se você só detecta o fácil"],["Tempo para responder","Da percepção à contenção","Incentiva conter sem entender"],["Taxa de falso positivo","Ruído por regra","Nenhum grande, é dos mais honestos"],["Cobertura de técnicas","Quanto do ATT&CK você enxerga","Vira colecionar regra sem qualidade"],["Alertas fechados por hora","Volume por analista","Incentiva fechar sem investigar"]]',
                },
                {
                    type: "text",
                    value: "# O indicador que quase ninguém acompanha\n\nExiste uma medida simples e reveladora: quantos incidentes foram descobertos por alguém de fora. Cliente que avisa, fornecedor que liga, órgão que notifica, pesquisador que encontra dado exposto. Cada um desses é uma detecção que a sua operação não fez.\n\nEssa contagem é desconfortável justamente por ser honesta. Ela não melhora ajustando regra nem comprando ferramenta; só melhora quando a visibilidade melhora de verdade. Equipes maduras acompanham essa proporção ao longo do tempo e a tratam como termômetro principal.\n\nO fechamento é uma regra geral que vale para qualquer indicador aqui: se a métrica pode ser melhorada sem que a segurança melhore, ela vai ser, e sem má intenção. Escolha indicadores em que enganar o número exija exatamente o trabalho que você queria que fosse feito.",
                },
                {
                    type: "quote",
                    value: "Se um número pode ser melhorado sem melhorar a segurança, ele vai ser. Escolha métrica em que trapacear dê o mesmo trabalho que fazer certo.",
                },
            ],
            questions: [
                {
                    statement: "Por que medir alertas fechados por hora é problemático?",
                    difficulty: "facil",
                    options: [
                        { text: "Incentiva fechar rápido sem investigar direito", isCorrect: true },
                        { text: "Exige uma ferramenta paga para ser calculado", isCorrect: false },
                        { text: "Varia demais conforme o turno do analista", isCorrect: false },
                        { text: "Não considera o tempo gasto em reuniões", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o tempo médio para detectar mede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Do início da atividade maliciosa até a percepção",
                            isCorrect: true,
                        },
                        {
                            text: "Da percepção do alerta até a contenção efetiva",
                            isCorrect: false,
                        },
                        { text: "Do primeiro alerta até o fechamento do caso", isCorrect: false },
                        { text: "Da abertura do chamado até a resposta inicial", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que o tempo para detectar pode melhorar sem a segurança melhorar?",
                    difficulty: "dificil",
                    options: [
                        { text: "Detectar apenas o que é fácil reduz a média", isCorrect: true },
                        {
                            text: "O relógio dos servidores pode estar dessincronizado",
                            isCorrect: false,
                        },
                        {
                            text: "Alertas automáticos não entram no cálculo da média",
                            isCorrect: false,
                        },
                        {
                            text: "O indicador ignora incidentes fora do expediente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a taxa de falso positivo por regra é um bom indicador?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostra que regra consome atenção sem entregar valor",
                            isCorrect: true,
                        },
                        {
                            text: "Indica quantos ataques reais foram interrompidos",
                            isCorrect: false,
                        },
                        {
                            text: "Mede a cobertura das técnicas conhecidas do ATT&CK",
                            isCorrect: false,
                        },
                        {
                            text: "Reflete a velocidade do time durante a triagem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que revela a contagem de incidentes descobertos por terceiros?",
                    difficulty: "medio",
                    options: [
                        { text: "Detecções que a própria operação deixou passar", isCorrect: true },
                        { text: "O nível de exposição pública da empresa", isCorrect: false },
                        {
                            text: "A qualidade do relacionamento com fornecedores",
                            isCorrect: false,
                        },
                        { text: "A quantidade de dados sensíveis armazenados", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Fadiga de alerta e o custo do ruído",
            blocks: [
                {
                    type: "text",
                    value: "# O problema mais subestimado da área\n\nFadiga de alerta é o desgaste que leva analistas a tratar avisos com menos atenção porque a maioria não dá em nada. É um problema humano com consequência técnica direta, e não se resolve com disciplina nem com cobrança.\n\nO mecanismo é simples. Se noventa e nove por cento dos alertas de uma regra são falsos, o cérebro aprende a esperar que o próximo também seja. A verificação vira superficial, e o único alerta verdadeiro do mês chega numa fila em que a expectativa já é de descartar.\n\nExiste um caso famoso que virou lição da indústria: uma grande varejista foi comprometida e o alerta correspondente foi de fato gerado pela ferramenta, mas se perdeu no volume e ninguém agiu a tempo. A tecnologia funcionou e a operação falhou, e a diferença entre as duas coisas é exatamente o que este módulo trata.",
                },
                {
                    type: "table",
                    value: '[["Causa do ruído","Como se manifesta","O que fazer"],["Regra ampla demais","Dispara em atividade normal","Estreitar com contexto"],["Falta de exceção","Sistema legítimo cai na regra","Exceção documentada e revisada"],["Duplicação","Mesma coisa alerta em três lugares","Consolidar em um alerta só"],["Severidade errada","Tudo é crítico","Reservar o topo para o que exige ação"],["Alerta sem ação","Ninguém sabe o que fazer","Definir procedimento ou desligar"]]',
                },
                {
                    type: "text",
                    value: "# A regra que ninguém sabe o que fazer com ela\n\nO teste mais útil para avaliar um alerta é perguntar o que exatamente o analista deve fazer ao recebê-lo. Se não existe resposta clara, aquele alerta não deveria existir, porque ele só consome atenção e cria a sensação falsa de vigilância.\n\nDaí vem uma prática que separa operações maduras: todo alerta tem procedimento associado, com o que verificar, que dado consultar e quais critérios levam a escalar. Isso reduz a variação entre analistas, acelera a triagem e transforma conhecimento individual em conhecimento da equipe.\n\nA segunda prática é aceitar desligar. Existe resistência natural a desativar uma regra, por medo de perder justo aquele caso. Mas manter regra que ninguém investiga não é cobertura, é teatro, e o custo é pago em atenção que faltará no alerta que importava.",
                },
                {
                    type: "quote",
                    value: "Alerta sem procedimento não é cobertura, é teatro. Se ninguém sabe o que fazer quando ele chega, ele já falhou antes de disparar.",
                },
            ],
            questions: [
                {
                    statement: "O que é fadiga de alerta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Perda de atenção causada pelo excesso de avisos",
                            isCorrect: true,
                        },
                        { text: "Atraso na entrega dos alertas pela ferramenta", isCorrect: false },
                        { text: "Falha da regra em disparar quando deveria", isCorrect: false },
                        {
                            text: "Sobrecarga do servidor que processa os eventos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a fadiga de alerta não se resolve com cobrança?",
                    difficulty: "medio",
                    options: [
                        { text: "É uma resposta previsível a um volume irreal", isCorrect: true },
                        { text: "Os analistas não têm treinamento suficiente", isCorrect: false },
                        {
                            text: "As ferramentas não permitem ajustar severidade",
                            isCorrect: false,
                        },
                        {
                            text: "O turno da noite sempre tem menos gente disponível",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual pergunta ajuda a decidir se um alerta deveria existir?",
                    difficulty: "medio",
                    options: [
                        { text: "O que o analista deve fazer ao recebê-lo", isCorrect: true },
                        { text: "Quantas vezes ele disparou no último mês", isCorrect: false },
                        { text: "Qual ferramenta foi usada para criá-lo", isCorrect: false },
                        { text: "Quem foi o responsável por escrevê-lo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o valor de associar um procedimento a cada alerta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reduz a variação entre analistas e acelera a triagem",
                            isCorrect: true,
                        },
                        {
                            text: "Elimina a necessidade de escalar casos ao nível 2",
                            isCorrect: false,
                        },
                        { text: "Garante que nenhum falso positivo será gerado", isCorrect: false },
                        {
                            text: "Permite fechar mais alertas dentro de cada turno",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que existe resistência a desligar uma regra ruidosa?",
                    difficulty: "dificil",
                    options: [
                        { text: "Medo de perder justamente o caso verdadeiro", isCorrect: true },
                        {
                            text: "Exigência de auditoria de manter toda regra ativa",
                            isCorrect: false,
                        },
                        {
                            text: "Impossibilidade técnica de desativar regras prontas",
                            isCorrect: false,
                        },
                        {
                            text: "Perda do histórico de alertas já registrados nela",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "As siglas e o que cada ferramenta faz",
            blocks: [
                {
                    type: "text",
                    value: "# Um mapa para não se perder no vocabulário\n\nA área de defesa é povoada de siglas, e boa parte da confusão de quem começa vem daí. O jeito de organizar é perguntar de cada ferramenta duas coisas: que dado ela vê e o que ela consegue fazer com esse dado.\n\nO SIEM vê eventos de muitas fontes, centraliza e permite consultar e correlacionar. Ele é o lugar da investigação ampla, e sua força é juntar coisas que aconteceram em sistemas diferentes.\n\nA ferramenta de detecção e resposta em endpoint, chamada de EDR, vê o que acontece dentro da máquina em profundidade, como processos criados e conexões abertas, e consegue agir ali, isolando a máquina ou encerrando um processo. Quando essa ideia se estende para além do endpoint, integrando também rede, correio e nuvem, o mercado chama de XDR.",
                },
                {
                    type: "table",
                    value: '[["Sigla","Que dado enxerga","O que consegue fazer"],["SIEM","Eventos de muitas fontes","Consultar, correlacionar e alertar"],["EDR","Detalhe do que ocorre na máquina","Detectar e agir no endpoint"],["XDR","Endpoint, rede, correio e nuvem","Correlacionar e responder no conjunto"],["SOAR","Alertas e ações das outras ferramentas","Automatizar tarefas repetitivas"],["NDR","Tráfego de rede","Detectar padrão anômalo na rede"],["Antivírus","Arquivos e execução","Bloquear o conhecido"]]',
                },
                {
                    type: "text",
                    value: "# Onde a automação ajuda e onde atrapalha\n\nA ferramenta de orquestração e automação, o SOAR, existe para tirar do analista o trabalho mecânico: consultar reputação de um endereço, buscar em que outras máquinas um arquivo apareceu, abrir chamado, enriquecer o alerta com o cargo do usuário envolvido. Tudo isso é repetitivo e não exige julgamento.\n\nA tentação seguinte é automatizar também a decisão, e é aí que mora o risco. Isolar automaticamente qualquer máquina com alerta crítico parece ótimo até o dia em que a regra dispara errado no servidor de faturamento no fechamento do mês. Automação de ação precisa começar pelo que é reversível e de baixo impacto.\n\nA regra prática que funciona é separar enriquecimento de decisão. Automatize a coleta de contexto sem medo, porque errar ali custa uma consulta desnecessária. Automatize ação apenas quando o custo de errar for aceitável, e mantenha o humano no caminho quando não for.",
                },
                {
                    type: "quote",
                    value: "Automatize sem medo o que só coleta contexto. Pense duas vezes antes de automatizar o que desliga alguma coisa, porque a regra vai errar num dia ruim.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a função central de um SIEM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Centralizar eventos e permitir correlacionar fontes",
                            isCorrect: true,
                        },
                        { text: "Isolar a máquina comprometida da rede interna", isCorrect: false },
                        { text: "Bloquear arquivos maliciosos já conhecidos", isCorrect: false },
                        {
                            text: "Inspecionar o tráfego cifrado que sai da empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que diferencia o EDR do SIEM?",
                    difficulty: "medio",
                    options: [
                        { text: "Vê o detalhe da máquina e consegue agir nela", isCorrect: true },
                        { text: "Guarda eventos por mais tempo que o SIEM", isCorrect: false },
                        { text: "Analisa apenas o tráfego que passa na rede", isCorrect: false },
                        { text: "Funciona sem precisar de agente instalado", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve uma ferramenta de orquestração e automação?",
                    difficulty: "medio",
                    options: [
                        { text: "Automatizar tarefas repetitivas sem julgamento", isCorrect: true },
                        {
                            text: "Substituir o analista na decisão sobre incidentes",
                            isCorrect: false,
                        },
                        {
                            text: "Detectar comportamento anômalo dentro da máquina",
                            isCorrect: false,
                        },
                        {
                            text: "Armazenar os eventos por prazo maior que o SIEM",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a regra prática para decidir o que automatizar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Automatizar contexto sempre, ação só se for aceitável errar",
                            isCorrect: true,
                        },
                        {
                            text: "Automatizar tudo aquilo que a ferramenta permitir fazer",
                            isCorrect: false,
                        },
                        {
                            text: "Automatizar apenas o que ocorre fora do expediente",
                            isCorrect: false,
                        },
                        {
                            text: "Automatizar somente após seis meses de operação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o termo XDR descreve?",
                    difficulty: "medio",
                    options: [
                        { text: "Detecção e resposta estendida além do endpoint", isCorrect: true },
                        { text: "Armazenamento estendido dos eventos coletados", isCorrect: false },
                        {
                            text: "Execução de análise de artefato em ambiente isolado",
                            isCorrect: false,
                        },
                        {
                            text: "Inspeção estendida do tráfego cifrado da empresa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Dados, a matéria-prima",
    aulas: [
        {
            titulo: "Fontes de log e o que cada uma revela",
            blocks: [
                {
                    type: "text",
                    value: "# Você só detecta o que consegue ver\n\nToda detecção começa num dado que alguém decidiu coletar. Se o evento não é gerado, ou é gerado e não chega ao lugar onde você consulta, nenhuma regra do mundo vai encontrá-lo. Por isso a primeira pergunta de qualquer projeto de detecção não é que ferramenta usar, é que fonte de dado responde a essa pergunta.\n\nCada fonte enxerga um pedaço da história. O registro de autenticação mostra quem entrou, de onde e se conseguiu. O registro de processo mostra o que foi executado e por quem. O registro de rede mostra quem falou com quem. Nenhuma delas sozinha conta o incidente inteiro, e é a combinação que gera a narrativa.\n\nA consequência prática é que cobertura de detecção é, antes de tudo, cobertura de coleta. Um SOC com ferramenta cara e três fontes coletadas enxerga menos que um SOC modesto com as fontes certas ligadas.",
                },
                {
                    type: "table",
                    value: '[["Fonte","O que revela","Etapa que ajuda a pegar"],["Autenticação","Quem entrou, de onde, com sucesso ou não","Acesso inicial e escalonamento"],["Criação de processo","O que foi executado e por quem","Execução e movimentação"],["Rede e conexões","Quem falou com quem e quanto","Comando e controle, exfiltração"],["DNS","Que nomes foram consultados","Comando e controle"],["Correio","Mensagens, anexos e regras criadas","Acesso inicial e fraude"],["Nuvem e identidade","Permissões, tokens e consentimentos","Persistência em nuvem"]]',
                },
                {
                    type: "text",
                    value: "# As fontes com melhor retorno para começar\n\nQuando o orçamento e o tempo são limitados, existe uma ordem que a prática consagrou. Autenticação vem primeiro, porque credencial válida é o vetor de entrada mais comum e porque o volume é gerenciável. Criação de processo vem em seguida, porque é a fonte que mais responde perguntas na investigação de endpoint.\n\nDNS costuma ser subestimado e tem uma relação custo-benefício excelente: o volume é alto mas a estrutura é simples, e ele enxerga tentativa de comunicação mesmo quando a conexão é bloqueada depois. Uma máquina que consulta um domínio recém-criado dezenas de vezes já contou algo, independentemente do que aconteceu na sequência.\n\nCorreio fecha o grupo inicial, e não só pelo phishing: é nele que aparecem as regras de caixa criadas por invasor, sinal clássico de comprometimento de conta que você viu na trilha anterior.",
                },
                {
                    type: "quote",
                    value: "Cobertura de detecção é cobertura de coleta. Regra sofisticada sobre fonte que não existe é um exercício de estilo, não uma defesa.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a primeira pergunta de um projeto de detecção?",
                    difficulty: "facil",
                    options: [
                        { text: "Que fonte de dado responde a essa pergunta", isCorrect: true },
                        { text: "Qual ferramenta do mercado devemos comprar", isCorrect: false },
                        { text: "Quantos analistas serão necessários no turno", isCorrect: false },
                        { text: "Qual o orçamento disponível para o projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o registro de criação de processo revela?",
                    difficulty: "facil",
                    options: [
                        { text: "O que foi executado na máquina e por quem", isCorrect: true },
                        { text: "Quais máquinas conversaram entre si na rede", isCorrect: false },
                        { text: "Quais nomes de domínio foram consultados", isCorrect: false },
                        { text: "Quais permissões foram concedidas na nuvem", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o registro de DNS tem boa relação custo-benefício?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostra a tentativa mesmo se a conexão for bloqueada",
                            isCorrect: true,
                        },
                        {
                            text: "Gera volume pequeno comparado às outras fontes",
                            isCorrect: false,
                        },
                        {
                            text: "Substitui a coleta de eventos de rede por completo",
                            isCorrect: false,
                        },
                        {
                            text: "Identifica o processo responsável por cada consulta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que autenticação costuma ser a primeira fonte a integrar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Credencial válida é o vetor de entrada mais comum",
                            isCorrect: true,
                        },
                        { text: "É a fonte com menor volume gerado por dia", isCorrect: false },
                        { text: "É a única exigida pelas normas de auditoria", isCorrect: false },
                        { text: "É a que exige menos configuração nos sistemas", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Além de phishing, que sinal importante o registro de correio revela?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Regras de caixa criadas por quem comprometeu a conta",
                            isCorrect: true,
                        },
                        {
                            text: "Tentativas de autenticação falhas contra o servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Conexões de saída feitas pelo cliente de correio",
                            isCorrect: false,
                        },
                        {
                            text: "Processos executados a partir de anexos recebidos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Normalização e enriquecimento",
            blocks: [
                {
                    type: "text",
                    value: "# Cada fonte fala uma língua diferente\n\nUm evento de autenticação de um sistema chama o usuário de conta, outro chama de principal, um terceiro chama de sujeito. O endereço de origem aparece como origem, como cliente e como remoto. Se você tentar escrever uma consulta que atravesse essas fontes sem tratar isso, vai escrever uma consulta por sistema e mantê-las para sempre.\n\nNormalizar é traduzir tudo para um vocabulário comum antes de guardar: um campo de usuário, um campo de endereço de origem, um campo de resultado. A partir daí, uma consulta única funciona sobre todas as fontes, e a regra que você escreve hoje continua valendo quando entrar um sistema novo.\n\nO preço é pago na entrada, ao mapear cada fonte para o modelo comum, e é um trabalho chato que rende juros por anos. Equipes que pulam essa etapa acabam com centenas de regras duplicadas e nenhuma capacidade de correlacionar.",
                },
                {
                    type: "table",
                    value: '[["Etapa","O que faz","Exemplo"],["Coleta","Traz o evento para o centro","Agente envia o log do servidor"],["Análise","Separa o texto em campos","Extrai usuário e origem da linha"],["Normalização","Traduz para nomes comuns","Conta e principal viram usuário"],["Enriquecimento","Acrescenta contexto externo","Endereço ganha país e reputação"],["Indexação","Deixa pesquisável","Consulta responde em segundos"]]',
                },
                {
                    type: "text",
                    value: "# Enriquecer é o que transforma dado em decisão\n\nNormalizar deixa o dado consultável; enriquecer deixa o dado interpretável. Um login bem-sucedido de um endereço qualquer não diz muito. O mesmo login, enriquecido com a informação de que aquele endereço fica em outro país, de que o usuário é administrador do domínio e de que ele fez login no escritório vinte minutos antes, conta uma história completa.\n\nOs enriquecimentos com melhor retorno são internos, não comprados. Saber a que setor pertence o usuário, se a conta é privilegiada, se a máquina é servidor ou estação, se o ativo é crítico para o negócio. Nada disso exige assinatura de serviço externo e tudo isso muda a prioridade de um alerta.\n\nUm detalhe operacional que evita dor de cabeça: enriquecer no momento da ingestão congela o contexto daquele instante, o que é ótimo para investigação futura, porque o cargo do usuário pode mudar depois. Enriquecer só na consulta mostra o presente e pode reescrever o passado sem querer.",
                },
                {
                    type: "quote",
                    value: "Normalizar deixa o dado consultável. Enriquecer deixa o dado interpretável. Sem o segundo, o analista vira tradutor de campo em vez de investigador.",
                },
            ],
            questions: [
                {
                    statement: "O que a normalização de log resolve?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Traduzir campos de fontes diferentes para um padrão",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir o volume de eventos armazenados por dia",
                            isCorrect: false,
                        },
                        {
                            text: "Cifrar os registros antes de gravá-los em disco",
                            isCorrect: false,
                        },
                        {
                            text: "Eliminar os eventos duplicados enviados por agentes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a consequência de não normalizar antes de escrever regras?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma regra por sistema, duplicada para sempre", isCorrect: true },
                        { text: "Perda dos eventos antigos já armazenados", isCorrect: false },
                        { text: "Impossibilidade de coletar fontes novas", isCorrect: false },
                        { text: "Aumento do custo de licença da ferramenta", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o enriquecimento acrescenta ao evento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Contexto que permite interpretar o que aconteceu",
                            isCorrect: true,
                        },
                        {
                            text: "Campos padronizados com nomes iguais entre fontes",
                            isCorrect: false,
                        },
                        {
                            text: "Compressão que reduz o espaço ocupado em disco",
                            isCorrect: false,
                        },
                        {
                            text: "Assinatura que garante a integridade do registro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais enriquecimentos costumam ter melhor retorno?",
                    difficulty: "medio",
                    options: [
                        { text: "Os internos, como setor e criticidade do ativo", isCorrect: true },
                        { text: "Os comprados de fornecedores de inteligência", isCorrect: false },
                        { text: "Os de geolocalização de endereços de origem", isCorrect: false },
                        { text: "Os de reputação pública de domínio consultado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a vantagem de enriquecer no momento da ingestão?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Congela o contexto daquele instante para o futuro",
                            isCorrect: true,
                        },
                        {
                            text: "Reduz o tempo de resposta das consultas feitas",
                            isCorrect: false,
                        },
                        {
                            text: "Permite corrigir o contexto de eventos antigos",
                            isCorrect: false,
                        },
                        {
                            text: "Diminui o espaço ocupado por cada evento salvo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Retenção, custo e o que guardar",
            blocks: [
                {
                    type: "text",
                    value: "# Guardar tudo para sempre não é opção\n\nLog custa dinheiro em três lugares: coletar, indexar e armazenar. Em ambientes grandes, o custo da plataforma de log costuma ser um dos maiores da segurança, e a conversa sobre o que guardar e por quanto tempo é uma das mais frequentes da carreira.\n\nA tentação de guardar tudo esbarra num fato incômodo: o volume cresce mais rápido que o orçamento, e boa parte dele nunca será consultada. Por outro lado, cortar demais transforma investigação em adivinhação, e a hora em que você descobre que faltou dado é exatamente a pior possível.\n\nO caminho que funciona é separar em camadas. O dado quente, dos últimos dias ou semanas, fica indexado e rápido, porque é o que a triagem consulta o tempo todo. O dado frio vai para armazenamento barato, ainda recuperável, para investigação de incidente antigo. E existe dado que simplesmente não precisa ser guardado.",
                },
                {
                    type: "table",
                    value: '[["Camada","Prazo típico","Uso","Custo"],["Quente","Dias a semanas","Triagem e alerta","Alto"],["Morno","Meses","Investigação de incidente","Médio"],["Frio","Um ano ou mais","Auditoria e caso antigo","Baixo"],["Descartado","Nenhum","Ruído sem valor investigativo","Zero"]]',
                },
                {
                    type: "text",
                    value: "# Quanto tempo é suficiente\n\nA referência prática vem do próprio dwell time que você estudou: se o invasor costuma permanecer semanas antes de ser percebido, retenção de sete dias significa que, ao detectar, o começo da história já foi apagado. Retenção precisa cobrir o tempo de permanência típico com folga.\n\nNa prática, a maioria das operações trabalha com algo entre noventa dias e um ano de dado recuperável, com os últimos trinta indexados para consulta rápida. Setores regulados têm exigências próprias, e o jurídico deve entrar nessa definição, porque prazo legal de guarda é obrigação, não escolha técnica.\n\nUma decisão que economiza muito sem perder investigação é filtrar na origem. Evento de depuração de aplicação, verificação de saúde repetida a cada segundo e ruído de rede interna já conhecido consomem volume enorme e quase nunca respondem a pergunta de segurança. Cortar isso libera orçamento para guardar por mais tempo o que importa.",
                },
                {
                    type: "quote",
                    value: "Retenção menor que o tempo de permanência do invasor garante que, quando você detectar, o começo da história já terá sido apagado por você mesmo.",
                },
            ],
            questions: [
                {
                    statement: "Por que guardar todo log para sempre não é viável?",
                    difficulty: "facil",
                    options: [
                        { text: "O volume cresce mais rápido que o orçamento", isCorrect: true },
                        {
                            text: "As ferramentas limitam o total de eventos salvos",
                            isCorrect: false,
                        },
                        { text: "A legislação proíbe retenção acima de um ano", isCorrect: false },
                        {
                            text: "Eventos antigos perdem integridade com o tempo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza a camada de dado quente?",
                    difficulty: "medio",
                    options: [
                        { text: "Indexado e rápido, usado pela triagem diária", isCorrect: true },
                        { text: "Guardado barato, recuperável sob demanda", isCorrect: false },
                        { text: "Retido apenas para atender auditoria legal", isCorrect: false },
                        { text: "Descartado por não responder pergunta útil", isCorrect: false },
                    ],
                },
                {
                    statement: "Que referência ajuda a definir o prazo mínimo de retenção?",
                    difficulty: "dificil",
                    options: [
                        { text: "O tempo de permanência típico do invasor", isCorrect: true },
                        { text: "O prazo de garantia da ferramenta contratada", isCorrect: false },
                        { text: "O intervalo entre auditorias internas anuais", isCorrect: false },
                        { text: "A frequência de rotação das senhas de acesso", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o jurídico deve participar da definição de retenção?",
                    difficulty: "medio",
                    options: [
                        { text: "Prazo legal de guarda é obrigação, não escolha", isCorrect: true },
                        { text: "O custo do armazenamento precisa de aprovação", isCorrect: false },
                        { text: "A ferramenta exige contrato assinado por eles", isCorrect: false },
                        { text: "Os dados coletados pertencem ao departamento", isCorrect: false },
                    ],
                },
                {
                    statement: "Que prática economiza volume sem prejudicar a investigação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Filtrar na origem o ruído sem valor investigativo",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir a retenção de todas as fontes pela metade",
                            isCorrect: false,
                        },
                        {
                            text: "Coletar apenas os eventos marcados como críticos",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar somente os alertas, e não os eventos brutos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Relógio, fuso e a linha do tempo",
            blocks: [
                {
                    type: "text",
                    value: "# Sem hora confiável não existe investigação\n\nInvestigar é montar uma linha do tempo: isso aconteceu, depois aquilo, então aquilo outro. Se os relógios das fontes não concordam, a ordem dos eventos fica errada e a conclusão vai junto. É um problema banal de infraestrutura com consequência analítica severa.\n\nO caso clássico é o servidor com relógio atrasado alguns minutos. Na linha do tempo montada pelo analista, a conexão suspeita aparece antes do login que a originou, e a interpretação natural passa a ser que a conexão não tem relação com aquele acesso. Uma diferença de minutos inverteu causa e efeito.\n\nA correção é conhecida: todas as fontes sincronizadas com a mesma referência de tempo, e monitoramento da própria sincronia, porque um servidor que perde o sincronismo não avisa ninguém. Esse é daqueles controles que ninguém lembra até o dia em que faz falta.",
                },
                {
                    type: "table",
                    value: '[["Problema","Efeito na investigação","Correção"],["Relógios dessincronizados","Ordem dos eventos fica errada","Sincronização com referência única"],["Fusos misturados","Diferença de horas entre fontes","Guardar tudo em tempo universal"],["Horário de verão","Salto ou repetição na linha do tempo","Não depender de hora local"],["Hora de recebimento e de ocorrência","Atraso vira mudança de ordem","Guardar as duas e usar a de ocorrência"],["Fonte sem hora própria","Tudo carimbado na chegada","Corrigir a origem ou marcar a limitação"]]',
                },
                {
                    type: "text",
                    value: "# Duas horas para cada evento\n\nHá uma distinção que confunde muitos iniciantes: um evento tem a hora em que aconteceu e a hora em que chegou ao seu sistema. Elas quase nunca são iguais, porque coleta tem fila, rede tem atraso e agente pode ficar sem conexão por horas e enviar tudo de uma vez depois.\n\nA regra é usar a hora de ocorrência para reconstruir a história e a hora de chegada para avaliar a saúde da coleta. Confundir as duas gera dois erros comuns: linha do tempo distorcida por atraso de transporte, e a impressão falsa de que não houve atividade num período em que apenas o envio estava travado.\n\nO conselho operacional é padronizar em tempo universal na hora de guardar e converter para o fuso local apenas na exibição. Ambientes com escritórios em fusos diferentes que guardam hora local acabam com investigações em que a mesma sequência aparece de três formas distintas, e reconstruir isso depois é um trabalho ingrato e evitável.",
                },
                {
                    type: "quote",
                    value: "Alguns minutos de diferença entre relógios bastam para inverter causa e efeito numa linha do tempo, e a conclusão errada parece perfeitamente lógica.",
                },
            ],
            questions: [
                {
                    statement: "Por que a sincronia de relógios é crítica na investigação?",
                    difficulty: "facil",
                    options: [
                        { text: "Sem ela a ordem dos eventos fica incorreta", isCorrect: true },
                        {
                            text: "Sem ela os eventos não conseguem ser indexados",
                            isCorrect: false,
                        },
                        { text: "Sem ela a retenção configurada deixa de valer", isCorrect: false },
                        { text: "Sem ela os agentes param de enviar registros", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a diferença entre hora de ocorrência e hora de chegada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma é quando o evento aconteceu, outra quando chegou",
                            isCorrect: true,
                        },
                        {
                            text: "Uma usa fuso local, a outra usa tempo universal",
                            isCorrect: false,
                        },
                        {
                            text: "Uma vem do agente, a outra vem sempre do firewall",
                            isCorrect: false,
                        },
                        {
                            text: "Uma é gravada em disco, a outra fica só em memória",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve a hora de chegada do evento?",
                    difficulty: "medio",
                    options: [
                        { text: "Avaliar a saúde e o atraso da coleta", isCorrect: true },
                        { text: "Reconstruir a sequência real do incidente", isCorrect: false },
                        { text: "Definir a retenção aplicada àquele evento", isCorrect: false },
                        { text: "Calcular o tempo de resposta da equipe", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que guardar tudo em tempo universal e converter só na exibição?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Evita a mesma sequência aparecer de formas distintas",
                            isCorrect: true,
                        },
                        {
                            text: "Reduz o espaço ocupado pelo campo de data e hora",
                            isCorrect: false,
                        },
                        {
                            text: "Permite aplicar retenção diferente por escritório",
                            isCorrect: false,
                        },
                        {
                            text: "Garante que o horário de verão seja aplicado certo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que monitorar a própria sincronia dos relógios?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Servidor que perde o sincronismo não avisa ninguém",
                            isCorrect: true,
                        },
                        { text: "A referência de tempo muda a cada atualização", isCorrect: false },
                        {
                            text: "O agente de coleta desativa a sincronia sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "A norma exige um relatório mensal de sincronia",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cobertura e qualidade do dado",
            blocks: [
                {
                    type: "text",
                    value: "# A pergunta que revela o tamanho do buraco\n\nExiste um exercício simples e desconfortável: pegue as técnicas mais relevantes para o seu setor e, para cada uma, responda com que fonte de dado você a detectaria. A lista de técnicas sem resposta é o seu mapa de cegueira, e ele costuma ser maior do que a equipe imagina.\n\nEsse levantamento vale mais que qualquer painel, porque ele não mede o que você vê, mede o que você não vê. É um deslocamento importante: métricas normais contam alertas gerados, e essa conta o que jamais geraria alerta algum.\n\nO resultado costuma reordenar prioridades. Times descobrem que têm cinco regras sobre um assunto bem coberto e nenhuma fonte capaz de enxergar movimentação lateral, que é onde o invasor passa a maior parte do tempo.",
                },
                {
                    type: "table",
                    value: '[["Dimensão","Pergunta","Sintoma de problema"],["Cobertura","A fonte existe e chega até mim","Técnica sem fonte correspondente"],["Completude","Todos os equipamentos enviam","Um setor inteiro sem registro"],["Fidelidade","O campo traz o que promete","Usuário vazio na maioria dos eventos"],["Pontualidade","Chega a tempo de agir","Atraso de horas na coleta"],["Continuidade","Segue chegando sempre","Fonte que parou e ninguém viu"]]',
                },
                {
                    type: "text",
                    value: "# Qualidade importa tanto quanto quantidade\n\nUma fonte pode estar integrada e ainda assim ser inútil. Se metade dos eventos de autenticação chega sem preencher o campo de usuário, nenhuma regra sobre comportamento de conta vai funcionar direito, e o pior é que ela vai parecer funcionar, disparando pouco e passando a impressão de calmaria.\n\nPor isso equipes maduras monitoram a qualidade do que coletam: proporção de campos essenciais vazios, volume por fonte comparado ao esperado, atraso médio de ingestão. Esses números são pouco glamourosos e explicam a maior parte das detecções que falharam silenciosamente.\n\nFecha o módulo a ideia que sustenta os próximos: dado é a matéria-prima, e regra é o que se faz com ela. Investir em regra sofisticada sobre dado ruim é construir em terreno instável, e o esforço de arrumar a base sempre rende mais do que parece no começo.",
                },
                {
                    type: "quote",
                    value: "Fonte integrada com campo essencial vazio é pior que fonte ausente: a ausência você percebe, a regra que não dispara passa por calmaria.",
                },
            ],
            questions: [
                {
                    statement: "O que o exercício de mapear técnicas contra fontes revela?",
                    difficulty: "facil",
                    options: [
                        { text: "Onde você é cego, e não apenas o que você vê", isCorrect: true },
                        {
                            text: "Quantos alertas cada regra gerou no último mês",
                            isCorrect: false,
                        },
                        {
                            text: "Qual ferramenta do mercado cobre mais técnicas",
                            isCorrect: false,
                        },
                        { text: "Quantos analistas são necessários por turno", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que uma fonte integrada pode ainda assim ser inútil?",
                    difficulty: "medio",
                    options: [
                        { text: "Campos essenciais podem chegar vazios", isCorrect: true },
                        { text: "A retenção configurada pode ser muito curta", isCorrect: false },
                        { text: "O volume gerado pode exceder a licença", isCorrect: false },
                        { text: "O agente pode estar em versão desatualizada", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que regra sobre dado incompleto é perigosa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ela dispara pouco e passa impressão de calmaria",
                            isCorrect: true,
                        },
                        { text: "Ela gera falso positivo em volume muito alto", isCorrect: false },
                        { text: "Ela consome mais recurso da plataforma de log", isCorrect: false },
                        { text: "Ela impede que outras regras sejam executadas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual dimensão de qualidade trata da fonte que parou de enviar?",
                    difficulty: "medio",
                    options: [
                        { text: "Continuidade, se ela segue chegando sempre", isCorrect: true },
                        { text: "Fidelidade, se o campo traz o que promete", isCorrect: false },
                        { text: "Completude, se todo equipamento está enviando", isCorrect: false },
                        {
                            text: "Pontualidade, se chega a tempo de permitir ação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual descoberta comum o levantamento de cobertura costuma trazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Muitas regras no que é fácil e nada no que importa",
                            isCorrect: true,
                        },
                        {
                            text: "Excesso de fontes coletadas sem uso pela equipe",
                            isCorrect: false,
                        },
                        { text: "Retenção maior que a necessária em toda fonte", isCorrect: false },
                        {
                            text: "Duplicação de agentes instalados nos servidores",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - SIEM na prática",
    aulas: [
        {
            titulo: "O que um SIEM faz de verdade",
            blocks: [
                {
                    type: "text",
                    value: "# Um banco de dados com pressa e memória\n\nDesmistificando: um SIEM é, no fundo, uma plataforma que recebe eventos de muitas fontes, guarda de forma pesquisável e permite escrever consultas que geram alertas. O nome vem de gestão de informação e eventos de segurança, e a parte que mais importa no dia a dia é a capacidade de perguntar coisas ao passado rapidamente.\n\nEle faz três coisas que ferramentas isoladas não fazem. Primeiro, junta: o evento do firewall e o evento do servidor ficam no mesmo lugar, com o mesmo vocabulário. Segundo, correlaciona: permite escrever uma regra que só dispara quando dois fatos de fontes diferentes acontecem juntos. Terceiro, retém: guarda por meses, o que permite investigar o que aconteceu antes de você suspeitar.\n\nO que ele não faz é igualmente importante. SIEM não protege nada sozinho, não bloqueia nada por padrão e não descobre ameaça que ninguém ensinou a procurar. Ele é um instrumento de observação, e o valor depende inteiramente do que se coleta e de quem escreve as perguntas.",
                },
                {
                    type: "table",
                    value: '[["O SIEM faz","O SIEM não faz"],["Centraliza eventos de fontes diferentes","Protege ou bloqueia por conta própria"],["Correlaciona fatos de sistemas distintos","Descobre o que ninguém ensinou a procurar"],["Retém para investigação do passado","Substitui a coleta que não existe"],["Gera alerta a partir de regra escrita","Decide se o alerta é verdadeiro"],["Sustenta painel e relatório","Melhora a qualidade do dado de origem"]]',
                },
                {
                    type: "text",
                    value: "# O ponto que decide o sucesso da implantação\n\nProjetos de SIEM falham por um motivo repetido: a empresa compra a plataforma antes de decidir o que quer detectar. O resultado é um ano ligando fontes, uma conta cara e um punhado de regras genéricas do fabricante que ninguém entende nem ajusta.\n\nO caminho inverso funciona melhor. Comece por uma lista curta de perguntas que a operação precisa responder, do tipo alguém entrou de fora do país com conta privilegiada, ou uma conta de serviço fez login interativo. Cada pergunta dessas define que fonte integrar, que campos precisam existir e que regra escrever.\n\nEssa inversão muda também a conversa de orçamento, porque cada volume de dado passa a ter uma justificativa concreta em vez de um genérico precisamos de mais visibilidade. E dá à equipe uma medida honesta de progresso: quantas das perguntas prioritárias já conseguimos responder.",
                },
                {
                    type: "quote",
                    value: "SIEM não descobre nada sozinho: ele responde exatamente o que alguém escreveu. Comprar a plataforma antes de ter as perguntas é comprar um cofre sem saber o que guardar.",
                },
            ],
            questions: [
                {
                    statement: "Quais são as três capacidades centrais de um SIEM?",
                    difficulty: "facil",
                    options: [
                        { text: "Centralizar, correlacionar e reter eventos", isCorrect: true },
                        { text: "Bloquear, isolar e reinstalar as máquinas", isCorrect: false },
                        { text: "Analisar, classificar e remover artefatos", isCorrect: false },
                        { text: "Inventariar, corrigir e validar os sistemas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um SIEM não faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Descobrir ameaça que ninguém ensinou a procurar",
                            isCorrect: true,
                        },
                        {
                            text: "Guardar eventos de forma pesquisável por meses",
                            isCorrect: false,
                        },
                        { text: "Juntar fontes diferentes no mesmo vocabulário", isCorrect: false },
                        { text: "Gerar alerta a partir de uma regra escrita", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que projetos de SIEM costumam falhar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A plataforma é comprada antes das perguntas existirem",
                            isCorrect: true,
                        },
                        {
                            text: "As fontes de dado geram volume acima do suportado",
                            isCorrect: false,
                        },
                        {
                            text: "As regras do fabricante são incompatíveis entre si",
                            isCorrect: false,
                        },
                        {
                            text: "A equipe não recebe treinamento oficial suficiente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual abordagem de implantação tende a funcionar melhor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Partir das perguntas que a operação precisa responder",
                            isCorrect: true,
                        },
                        {
                            text: "Integrar todas as fontes disponíveis antes de tudo",
                            isCorrect: false,
                        },
                        {
                            text: "Ativar todas as regras que o fabricante entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Definir a retenção máxima permitida pelo orçamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que medida honesta de progresso essa abordagem oferece?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Quantas perguntas prioritárias já são respondidas",
                            isCorrect: true,
                        },
                        {
                            text: "Quantas fontes de dado já foram integradas ao todo",
                            isCorrect: false,
                        },
                        {
                            text: "Quantos eventos por segundo a plataforma processa",
                            isCorrect: false,
                        },
                        {
                            text: "Quantas regras do fabricante estão ativas hoje",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Escrevendo uma consulta de investigação",
            blocks: [
                {
                    type: "text",
                    value: "# Toda plataforma tem sua língua, e a lógica é a mesma\n\nCada SIEM tem uma linguagem de consulta própria, e a sintaxe varia. A boa notícia é que a estrutura do raciocínio não varia, e é ela que se leva de um emprego para outro. Toda consulta de investigação faz alguma combinação de cinco movimentos.\n\nFiltrar, para reduzir ao subconjunto que interessa. Selecionar, para ficar só com os campos relevantes. Agrupar, para contar por alguma dimensão. Ordenar, para trazer o mais relevante ao topo. E juntar, para cruzar duas fontes pela chave comum.\n\nQuem entende esses cinco movimentos aprende qualquer linguagem de SIEM em poucos dias, porque passa a procurar como se escreve cada um deles naquela sintaxe, em vez de decorar exemplos soltos.",
                },
                {
                    type: "code",
                    value: "// A mesma investigação, em pseudocódigo, para focar no raciocínio\n// Pergunta: quais contas falharam muito e depois conseguiram entrar?\n\nfonte = eventos_de_autenticacao\n  onde  data >= agora - 24h\n\nfalhas = fonte\n  onde  resultado = 'falha'\n  agrupar_por usuario, origem\n  contar   como total_falhas\n  onde  total_falhas > 20\n\nsucessos = fonte\n  onde  resultado = 'sucesso'\n\nresultado = juntar falhas com sucessos\n  pela chave usuario\n  onde  sucessos.data > falhas.ultima_falha\n  ordenar_por total_falhas desc",
                },
                {
                    type: "table",
                    value: '[["Movimento","Para que serve","Cuidado"],["Filtrar","Reduzir ao que interessa","Filtrar cedo, para a consulta ser rápida"],["Selecionar","Ficar com os campos úteis","Não descartar o que vai precisar depois"],["Agrupar","Contar por dimensão","Escolher a dimensão que responde a pergunta"],["Ordenar","Trazer o relevante ao topo","Ordenar pelo que importa, não pela data"],["Juntar","Cruzar duas fontes","Confirmar que a chave existe nas duas"]]',
                },
                {
                    type: "quote",
                    value: "Filtre cedo e junte tarde. Consulta que varre meses inteiros antes de reduzir o conjunto costuma expirar antes de responder qualquer coisa.",
                },
            ],
            questions: [
                {
                    statement: "Por que aprender os movimentos vale mais que decorar sintaxe?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A lógica se repete em qualquer plataforma de SIEM",
                            isCorrect: true,
                        },
                        {
                            text: "As plataformas usam todas a mesma linguagem hoje",
                            isCorrect: false,
                        },
                        {
                            text: "A sintaxe muda a cada atualização da ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "As consultas prontas cobrem a maioria dos casos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o movimento de agrupar numa consulta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Contar ocorrências por alguma dimensão escolhida",
                            isCorrect: true,
                        },
                        { text: "Reduzir o conjunto ao período que interessa", isCorrect: false },
                        { text: "Cruzar duas fontes por uma chave comum", isCorrect: false },
                        { text: "Trazer os resultados mais relevantes ao topo", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que filtrar cedo é uma boa prática?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A consulta fica rápida e não expira antes do fim",
                            isCorrect: true,
                        },
                        {
                            text: "O resultado passa a incluir mais eventos úteis",
                            isCorrect: false,
                        },
                        {
                            text: "A plataforma cobra por consulta e não por volume",
                            isCorrect: false,
                        },
                        {
                            text: "Os campos selecionados ficam corretamente ordenados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que cuidado o movimento de juntar duas fontes exige?",
                    difficulty: "medio",
                    options: [
                        { text: "Confirmar que a chave existe nas duas fontes", isCorrect: true },
                        {
                            text: "Ordenar as duas fontes pela data antes de unir",
                            isCorrect: false,
                        },
                        { text: "Usar a mesma retenção configurada nas duas", isCorrect: false },
                        { text: "Garantir que as duas venham do mesmo agente", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "A consulta do exemplo busca falhas seguidas de sucesso. Que comportamento ela procura?",
                    difficulty: "dificil",
                    options: [
                        { text: "Tentativa por senha que acabou dando certo", isCorrect: true },
                        { text: "Conta bloqueada por excesso de tentativas", isCorrect: false },
                        { text: "Sessão roubada usada de outra localidade", isCorrect: false },
                        { text: "Aplicativo autorizado sem digitar senha", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Correlação entre fontes",
            blocks: [
                {
                    type: "text",
                    value: "# Onde o SIEM ganha o salário\n\nCorrelação é o que uma ferramenta isolada não consegue: dizer que dois fatos, cada um sem graça sozinho, juntos contam outra história. Um login bem-sucedido é normal. Um anexo aberto é normal. Um anexo aberto seguido, dois minutos depois, de um login da mesma conta a partir de outro país já não é.\n\nO ganho é duplo. Aumenta a precisão, porque a combinação é bem mais rara que cada parte, o que reduz falso positivo. E aumenta a cobertura, porque permite detectar comportamentos que nenhum evento isolado revelaria.\n\nExistem três formas comuns de correlacionar. Por sequência, quando a ordem importa. Por acúmulo, quando o volume importa. E por ausência, quando o que chama atenção é algo que deveria ter acontecido e não aconteceu, como um agente que parou de reportar.",
                },
                {
                    type: "table",
                    value: '[["Tipo","Exemplo","O que denuncia"],["Sequência","Anexo aberto e depois login de outro país","Comprometimento após phishing"],["Acúmulo","Muitas falhas seguidas de um sucesso","Ataque por senha bem-sucedido"],["Ausência","Agente que parou de reportar","Coleta cegada ou máquina desligada"],["Cruzamento","Conta de serviço com login interativo","Uso indevido de credencial técnica"],["Comparação","Volume de saída acima do normal daquele host","Possível exfiltração"]]',
                },
                {
                    type: "text",
                    value: "# A janela de tempo é a decisão mais delicada\n\nToda correlação por sequência precisa de uma janela: em quanto tempo os dois fatos precisam ocorrer para serem considerados relacionados. Escolher esse número é a parte que mais erra.\n\nJanela curta demais perde o caso real, porque invasor não segue cronograma e pode voltar horas depois. Janela longa demais junta coisas que nada têm a ver, e a regra passa a disparar por coincidência, o que é pior do que não existir, porque gasta atenção e ensina o time a desconfiar dela.\n\nO caminho prático é derivar a janela do comportamento observado, não do palpite. Olhe casos passados, veja quanto tempo costuma separar os dois eventos e escolha algo que cubra a maioria com folga. E deixe a janela explícita e comentada na regra, porque a próxima pessoa que a mantiver vai precisar saber de onde saiu aquele número.",
                },
                {
                    type: "quote",
                    value: "Regra que dispara por coincidência é pior que regra que não existe: além de não ajudar, ela ensina o time a desconfiar de todas as outras.",
                },
            ],
            questions: [
                {
                    statement: "O que a correlação permite que uma fonte isolada não permite?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ver histórias que só aparecem na combinação de fatos",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir o volume de eventos armazenados por dia",
                            isCorrect: false,
                        },
                        { text: "Bloquear automaticamente a conta suspeita", isCorrect: false },
                        {
                            text: "Aumentar a retenção configurada para cada fonte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a correlação reduz falso positivo?",
                    difficulty: "medio",
                    options: [
                        { text: "A combinação é bem mais rara que cada parte", isCorrect: true },
                        {
                            text: "As fontes se validam mutuamente ao correlacionar",
                            isCorrect: false,
                        },
                        {
                            text: "A regra passa a considerar apenas eventos críticos",
                            isCorrect: false,
                        },
                        {
                            text: "O volume analisado diminui ao juntar as fontes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é correlação por ausência?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Chamar atenção para o que deveria ter acontecido",
                            isCorrect: true,
                        },
                        { text: "Comparar o volume atual com a média histórica", isCorrect: false },
                        { text: "Exigir que dois eventos ocorram em sequência", isCorrect: false },
                        { text: "Somar ocorrências até ultrapassar um limiar", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o risco de uma janela de correlação longa demais?",
                    difficulty: "dificil",
                    options: [
                        { text: "A regra passa a disparar por coincidência", isCorrect: true },
                        { text: "A consulta consome memória além do disponível", isCorrect: false },
                        {
                            text: "Os eventos antigos saem da retenção configurada",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem entre os dois eventos deixa de importar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como definir bem a janela de tempo de uma correlação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Derivar de casos passados, com folga sobre a maioria",
                            isCorrect: true,
                        },
                        {
                            text: "Usar sempre cinco minutos como padrão da equipe",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher o maior valor que a plataforma aceitar",
                            isCorrect: false,
                        },
                        {
                            text: "Igualar ao intervalo de coleta configurado na fonte",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Painéis que servem para alguma coisa",
            blocks: [
                {
                    type: "text",
                    value: "# A maioria dos painéis é decoração cara\n\nPainel bonito é o entregável favorito de projeto de segurança e um dos menos úteis quando feito sem propósito. O sintoma é fácil de reconhecer: um telão com gráficos coloridos que ninguém olha para decidir nada, e que continua igual quer o dia esteja calmo, quer haja um incidente em curso.\n\nO teste que separa o painel útil do decorativo é direto: que decisão ele apoia, e quem a toma? Se não há resposta, o painel existe para impressionar visita.\n\nDaí vem a regra de construir a partir do público. O painel do analista de plantão precisa responder o que exige minha atenção agora. O do coordenador precisa mostrar se a operação está dando conta do volume. O da direção precisa mostrar tendência e risco, sem jargão. São três painéis diferentes, e tentar servir os três numa tela só resulta em nenhum bem servido.",
                },
                {
                    type: "table",
                    value: '[["Público","Pergunta que ele faz","O que mostrar"],["Analista de plantão","O que precisa de mim agora","Fila por prioridade e idade do alerta"],["Coordenador","Estamos dando conta","Volume, tempo de resposta, gargalo"],["Engenharia de detecção","Que regra está ruim","Falso positivo por regra"],["Direção","Estamos melhorando","Tendência e incidentes relevantes"],["Auditoria","Isso é comprovável","Cobertura e retenção"]]',
                },
                {
                    type: "text",
                    value: "# Três armadilhas comuns\n\nA primeira é o mapa do mundo com linhas de ataque. Ele é o símbolo da segurança em filme e quase nunca apoia decisão: saber que houve varredura vinda de outro país não muda o que o analista faz em seguida.\n\nA segunda é o gráfico que só cresce, como total acumulado de eventos processados. Ele mede atividade da máquina, não saúde da operação, e passa a falsa sensação de progresso.\n\nA terceira é o painel sem linha de comparação. Um número sozinho não diz nada: quarenta alertas hoje é bom ou ruim? Só a comparação com o período anterior, ou com o esperado, transforma número em informação. Sempre que puder, mostre a variação junto do valor, e prefira poucos indicadores bem escolhidos a uma parede de gráficos que ninguém consegue ler de relance.",
                },
                {
                    type: "quote",
                    value: "O teste do painel útil cabe numa pergunta: que decisão ele apoia, e quem a toma? Sem resposta, ele existe para impressionar visita.",
                },
            ],
            questions: [
                {
                    statement: "Qual teste separa um painel útil de um decorativo?",
                    difficulty: "facil",
                    options: [
                        { text: "Que decisão ele apoia e quem a toma", isCorrect: true },
                        { text: "Quantas fontes de dado ele consegue exibir", isCorrect: false },
                        { text: "Com que frequência ele é atualizado por dia", isCorrect: false },
                        {
                            text: "Quantas pessoas conseguem acessá-lo na empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o painel do analista de plantão deve responder?",
                    difficulty: "facil",
                    options: [
                        { text: "O que exige atenção dele agora", isCorrect: true },
                        { text: "Se a operação está dando conta do volume", isCorrect: false },
                        { text: "Se o risco geral está caindo no trimestre", isCorrect: false },
                        { text: "Quais regras geram mais falso positivo", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o mapa do mundo com linhas de ataque é criticado?",
                    difficulty: "medio",
                    options: [
                        { text: "Saber a origem não muda o que o analista faz", isCorrect: true },
                        {
                            text: "A geolocalização dos endereços costuma ser errada",
                            isCorrect: false,
                        },
                        { text: "O gráfico consome muito recurso da plataforma", isCorrect: false },
                        {
                            text: "As linhas exibidas não representam eventos reais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o problema do total acumulado de eventos processados?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mede atividade da máquina, não saúde da operação",
                            isCorrect: true,
                        },
                        {
                            text: "Fica desatualizado por causa do atraso de coleta",
                            isCorrect: false,
                        },
                        { text: "Depende da retenção configurada em cada fonte", isCorrect: false },
                        {
                            text: "Varia demais conforme o turno que está de plantão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um número sozinho costuma não informar nada?",
                    difficulty: "dificil",
                    options: [
                        { text: "Sem comparação não se sabe se é bom ou ruim", isCorrect: true },
                        { text: "Sem gráfico o valor não pode ser interpretado", isCorrect: false },
                        {
                            text: "Sem atualização constante o dado fica obsoleto",
                            isCorrect: false,
                        },
                        {
                            text: "Sem filtro por fonte o total mistura contextos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Os limites do SIEM",
            blocks: [
                {
                    type: "text",
                    value: "# Saber onde a ferramenta acaba\n\nProfissional maduro conhece os limites do que usa, e o SIEM tem quatro bem definidos. O primeiro é o de dado: ele responde apenas sobre o que foi coletado, então toda cegueira de coleta vira cegueira de detecção, por melhor que a plataforma seja.\n\nO segundo é o de latência. Muitas implantações têm atraso entre o evento acontecer e ficar consultável, e regras rodam em intervalos. Para resposta imediata em endpoint, a ferramenta de endpoint age em segundos e o SIEM chega depois, o que faz dele um instrumento excelente de investigação e um instrumento lento de bloqueio.\n\nO terceiro é o de custo, que na prática vira limite técnico: como o preço acompanha o volume, decisões de arquitetura acabam sendo decisões financeiras, e isso precisa ser dito na mesa em vez de descoberto na fatura.",
                },
                {
                    type: "table",
                    value: '[["Limite","O que significa","Como conviver"],["Dado","Só responde sobre o que foi coletado","Tratar cobertura como projeto contínuo"],["Latência","Há atraso até ficar consultável","Deixar bloqueio para quem age no ponto"],["Custo","Preço acompanha volume","Filtrar ruído e usar camadas de retenção"],["Contexto","Não sabe o que é normal no negócio","Enriquecer com dado interno"],["Julgamento","Não decide se o alerta é real","Manter o analista no caminho"]]',
                },
                {
                    type: "text",
                    value: "# O limite que mais atrapalha iniciantes\n\nO quarto limite é o de contexto de negócio, e é o que mais gera frustração. O SIEM não sabe que a madrugada de domingo é quando o time de dados roda a carga mensal, nem que aquela conta de serviço tem permissão ampla por uma decisão consciente tomada há dois anos.\n\nSem esse contexto, comportamento legítimo e anômalo se parecem, e é por isso que a mesma regra funciona bem numa empresa e é insuportável em outra. Não existe conjunto universal de regras boas: existe conjunto ajustado àquele ambiente.\n\nA consequência para a sua carreira é animadora. A parte que não dá para comprar pronta é justamente a que agrega valor: conhecer o ambiente, saber o que é normal ali e traduzir isso em regra. Ferramenta qualquer empresa compra; quem sabe o que é normal na casa é o profissional, e é isso que a próxima parte da trilha vai desenvolver.",
                },
                {
                    type: "quote",
                    value: "Não existe conjunto universal de boas regras. Existe conjunto ajustado àquele ambiente, e ajustar exige saber o que é normal ali.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o limite de dado de um SIEM?",
                    difficulty: "facil",
                    options: [
                        { text: "Ele só responde sobre o que foi coletado", isCorrect: true },
                        { text: "Ele descarta eventos acima de certo volume", isCorrect: false },
                        { text: "Ele guarda apenas os alertas, não os eventos", isCorrect: false },
                        { text: "Ele aceita no máximo dez fontes integradas", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o SIEM é melhor para investigar do que para bloquear?",
                    difficulty: "medio",
                    options: [
                        { text: "Há atraso até o evento ficar consultável", isCorrect: true },
                        { text: "Ele não tem permissão de agir nos sistemas", isCorrect: false },
                        { text: "As regras dele só rodam uma vez por dia", isCorrect: false },
                        {
                            text: "Ele não consegue identificar a máquina de origem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o limite de custo vira um limite técnico?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O preço acompanha o volume e restringe o que coletar",
                            isCorrect: true,
                        },
                        {
                            text: "A licença limita o número de regras simultâneas",
                            isCorrect: false,
                        },
                        {
                            text: "O contrato define quantos analistas podem acessar",
                            isCorrect: false,
                        },
                        {
                            text: "O fornecedor cobra por cada consulta executada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a mesma regra funciona numa empresa e é insuportável em outra?",
                    difficulty: "dificil",
                    options: [
                        { text: "O que é normal muda de ambiente para ambiente", isCorrect: true },
                        {
                            text: "As plataformas interpretam a regra de formas distintas",
                            isCorrect: false,
                        },
                        {
                            text: "O volume de eventos altera o limiar de disparo",
                            isCorrect: false,
                        },
                        {
                            text: "As versões da ferramenta mudam a sintaxe aceita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual parte do trabalho de detecção não pode ser comprada pronta?",
                    difficulty: "medio",
                    options: [
                        { text: "Conhecer o ambiente e o que é normal nele", isCorrect: true },
                        { text: "Integrar as fontes de dado na plataforma", isCorrect: false },
                        { text: "Manter a retenção dentro do orçamento anual", isCorrect: false },
                        { text: "Atualizar a ferramenta nas versões novas", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Engenharia de detecção",
    aulas: [
        {
            titulo: "O que é uma boa detecção",
            blocks: [
                {
                    type: "text",
                    value: "# Regra é software, e software se projeta\n\nEngenharia de detecção é o ofício de transformar conhecimento sobre ataque em regra que funciona no seu ambiente. O nome tem engenharia porque a disciplina se parece mais com desenvolvimento de software do que com configuração de ferramenta: regra tem requisito, tem teste, tem versão e tem manutenção.\n\nUma detecção boa reúne quatro qualidades. É precisa, ou seja, quando dispara costuma ser algo real. É durável, ou seja, não quebra quando o invasor troca de arquivo ou de servidor. É acionável, ou seja, existe algo claro a fazer quando ela toca. E é explicável, ou seja, quem a lê entende o que ela procura e por quê.\n\nA que falta com mais frequência é a última. Regra sem explicação vira intocável: ninguém sabe se pode ajustar, ninguém sabe por que aquele número está ali, e o time convive com ela como se fosse herança arqueológica.",
                },
                {
                    type: "table",
                    value: '[["Qualidade","O que significa","Sintoma quando falta"],["Precisa","Dispara em coisa real","Enxurrada de falso positivo"],["Durável","Não quebra com troca trivial","Para de funcionar sem ninguém notar"],["Acionável","Existe o que fazer ao receber","Alerta que todo mundo fecha sem ler"],["Explicável","Quem lê entende o porquê","Regra que ninguém ousa mexer"]]',
                },
                {
                    type: "text",
                    value: "# Precisão e cobertura brigam entre si\n\nExiste uma tensão que acompanha toda decisão de detecção. Regra estreita, que exige muitas condições, é precisa e perde variações. Regra ampla pega mais variações e traz mais ruído. Não há resposta certa universal, e a escolha depende do que está em jogo.\n\nO critério prático é o custo de errar em cada direção. Para técnica que aparece no meio de um comprometimento grave, perder o caso é caríssimo, e vale aceitar mais ruído. Para comportamento comum, com impacto pequeno, o ruído custa mais do que o caso perdido.\n\nUma prática que resolve boa parte da tensão é escalonar em severidade em vez de decidir entre disparar e não disparar. A condição ampla gera um sinal de baixa prioridade, que alimenta caça e investigação, e a combinação estreita gera alerta de alta prioridade, que interrompe o plantão. Assim você não perde a visibilidade nem afoga o analista.",
                },
                {
                    type: "quote",
                    value: "Regra sem explicação vira intocável. Ninguém sabe por que aquele número está ali, então ninguém ajusta, e ela envelhece intocada até parar de servir.",
                },
            ],
            questions: [
                {
                    statement: "Quais qualidades definem uma boa detecção?",
                    difficulty: "facil",
                    options: [
                        { text: "Precisa, durável, acionável e explicável", isCorrect: true },
                        { text: "Rápida, barata, automática e silenciosa", isCorrect: false },
                        { text: "Ampla, genérica, portátil e atualizada", isCorrect: false },
                        { text: "Simples, curta, testada e documentada", isCorrect: false },
                    ],
                },
                {
                    statement: "O que significa uma detecção ser durável?",
                    difficulty: "medio",
                    options: [
                        { text: "Não quebra quando o invasor troca de arquivo", isCorrect: true },
                        { text: "Permanece ativa por mais de um ano seguido", isCorrect: false },
                        {
                            text: "Continua funcionando após atualizar a ferramenta",
                            isCorrect: false,
                        },
                        { text: "Consome pouco recurso ao ser executada", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual qualidade costuma faltar com mais frequência?",
                    difficulty: "medio",
                    options: [
                        { text: "Explicável, e a regra vira intocável", isCorrect: true },
                        { text: "Precisa, e a regra dispara demais", isCorrect: false },
                        { text: "Durável, e a regra para sozinha", isCorrect: false },
                        { text: "Acionável, e ninguém investiga", isCorrect: false },
                    ],
                },
                {
                    statement: "Que tensão acompanha as decisões de detecção?",
                    difficulty: "medio",
                    options: [
                        { text: "Precisão e cobertura puxam para lados opostos", isCorrect: true },
                        {
                            text: "Custo e retenção competem pelo mesmo orçamento",
                            isCorrect: false,
                        },
                        { text: "Automação e julgamento humano se anulam", isCorrect: false },
                        { text: "Velocidade e retenção não podem coexistir", isCorrect: false },
                    ],
                },
                {
                    statement: "Que prática permite manter cobertura sem afogar o plantão?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Escalonar severidade em vez de decidir disparar ou não",
                            isCorrect: true,
                        },
                        {
                            text: "Desligar as regras amplas e manter só as estreitas",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar as regras amplas apenas fora do expediente",
                            isCorrect: false,
                        },
                        {
                            text: "Enviar todos os alertas para uma fila única e ampla",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Do comportamento à regra",
            blocks: [
                {
                    type: "text",
                    value: "# O caminho que vai da ideia ao alerta\n\nO ponto de partida nunca deve ser a sintaxe. Começa-se descrevendo o comportamento em português, de forma que qualquer pessoa da equipe entenda: um documento do editor de texto criando um processo de interpretador de comandos.\n\nDo comportamento vem a fonte: que dado registraria isso? No exemplo, o registro de criação de processo, com processo pai e processo filho. Se a fonte não existe, o trabalho não é escrever a regra, é integrar a fonte, e vale reconhecer isso cedo em vez de tentar contornar com dado impróprio.\n\nSó então vem a lógica, que costuma ser mais simples do que se imagina: filtrar eventos em que o pai pertence a um conjunto de aplicações de escritório e o filho pertence a um conjunto de interpretadores. E, por fim, vem o teste, que é onde a maioria das regras revela problema.",
                },
                {
                    type: "code",
                    value: "// Da frase à regra, em pseudocódigo\n// Comportamento: aplicação de escritório abrindo interpretador de comandos\n\naplicacoes_escritorio = ['editor_texto', 'planilha', 'apresentacao']\ninterpretadores      = ['shell', 'interpretador_script', 'gerenciador_pacote']\n\nalerta = eventos_de_criacao_de_processo\n  onde  processo_pai   em aplicacoes_escritorio\n  e     processo_filho em interpretadores\n  e     nao (usuario em contas_de_automacao_conhecidas)\n\n  severidade = alta\n  contexto   = [maquina, usuario, linha_de_comando, processo_avo]",
                },
                {
                    type: "table",
                    value: '[["Passo","Pergunta","Erro comum"],["Comportamento","O que exatamente quero pegar","Descrever a ferramenta em vez da ação"],["Fonte","Que dado registraria isso","Forçar dado impróprio por falta do certo"],["Lógica","Como expresso isso na consulta","Escrever antes de entender o normal"],["Exceção","O que é legítimo e se parece","Deixar para descobrir na produção"],["Contexto","O que o analista precisa junto","Alerta seco, sem nada para decidir"]]',
                },
                {
                    type: "quote",
                    value: "Escreva a regra em português antes de escrever em consulta. Se você não consegue explicar o comportamento numa frase, ainda não sabe o que está procurando.",
                },
            ],
            questions: [
                {
                    statement: "Por onde deve começar a escrita de uma detecção?",
                    difficulty: "facil",
                    options: [
                        { text: "Pela descrição do comportamento em português", isCorrect: true },
                        { text: "Pela sintaxe da consulta na plataforma usada", isCorrect: false },
                        { text: "Pela definição da severidade do alerta gerado", isCorrect: false },
                        {
                            text: "Pela lista de exceções já conhecidas do ambiente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que fazer quando a fonte necessária para a regra não existe?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Integrar a fonte, em vez de usar dado impróprio",
                            isCorrect: true,
                        },
                        {
                            text: "Escrever a regra com o dado mais parecido possível",
                            isCorrect: false,
                        },
                        {
                            text: "Adiar a detecção até trocar a plataforma usada",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir a regra por um painel de acompanhamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Na regra do exemplo, que comportamento está sendo procurado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Aplicação de escritório criando um interpretador",
                            isCorrect: true,
                        },
                        {
                            text: "Interpretador executando uma aplicação de escritório",
                            isCorrect: false,
                        },
                        {
                            text: "Usuário comum executando processo com privilégio",
                            isCorrect: false,
                        },
                        {
                            text: "Documento sendo aberto a partir de anexo de correio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que incluir contexto junto do alerta?",
                    difficulty: "medio",
                    options: [
                        { text: "Sem ele o analista não tem como decidir nada", isCorrect: true },
                        { text: "Ele reduz o volume de eventos processados", isCorrect: false },
                        { text: "Ele evita que a regra gere falso positivo", isCorrect: false },
                        { text: "Ele é exigido pelas normas de auditoria", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que descobrir exceções só em produção é um erro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A regra estreia gerando ruído e perde credibilidade",
                            isCorrect: true,
                        },
                        { text: "As exceções não podem ser adicionadas depois", isCorrect: false },
                        { text: "A plataforma bloqueia mudanças em regra ativa", isCorrect: false },
                        {
                            text: "O histórico de alertas precisa ser reprocessado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Testar e ajustar a regra",
            blocks: [
                {
                    type: "text",
                    value: "# Duas perguntas antes de ligar\n\nToda regra nova precisa responder duas coisas. Ela pega o que deveria pegar? E ela deixa em paz o que é normal? A primeira se testa provocando o comportamento em ambiente controlado. A segunda se testa rodando a lógica contra o histórico já coletado.\n\nO segundo teste é o mais barato e o mais negligenciado. Antes de ativar, rode a consulta sobre os últimos trinta dias de dado real. O número de resultados responde imediatamente quantos alertas por dia aquela regra geraria, e é comum descobrir ali que a regra dispararia duzentas vezes por dia por causa de um comportamento legítimo que ninguém lembrava.\n\nQuando aparecem esses casos legítimos, a resposta certa quase nunca é remover a regra. É acrescentar exceção específica, documentada, com data e motivo. Exceção sem registro do porquê é uma bomba-relógio: daqui a um ano ninguém saberá se ainda vale, e o receio de mexer mantém um buraco aberto para sempre.",
                },
                {
                    type: "table",
                    value: '[["Teste","Como fazer","O que revela"],["Detecta o certo","Provocar o comportamento em ambiente de teste","Se a lógica realmente pega"],["Ignora o normal","Rodar contra o histórico coletado","Volume de ruído esperado por dia"],["Sobrevive à variação","Repetir com variações do comportamento","Se a regra é durável ou frágil"],["Tem contexto","Ler o alerta como se fosse o analista","Se dá para decidir com o que veio"],["Tem procedimento","Escrever o passo a passo da triagem","Se o alerta é acionável de fato"]]',
                },
                {
                    type: "text",
                    value: "# Ajuste é permanente, não uma fase\n\nAmbiente muda: entra sistema novo, o time de dados cria uma automação, um fornecedor passa a usar uma ferramenta de acesso remoto. Toda mudança dessas pode transformar uma regra silenciosa numa fonte de ruído, e ninguém avisa a segurança quando isso acontece.\n\nPor isso equipes maduras revisam periodicamente as regras mais ruidosas e as que nunca dispararam. As primeiras consomem atenção; as segundas podem estar quebradas em silêncio, e regra que nunca disparou merece a pergunta desconfiada de se ela ainda funciona.\n\nUm hábito barato que resolve muito: sempre que um alerta for fechado como falso positivo, registrar o motivo em campo estruturado. Depois de algumas semanas, esse campo mostra sozinho quais regras precisam de ajuste e por quê, transformando o incômodo diário do plantão em insumo de melhoria.",
                },
                {
                    type: "quote",
                    value: "Regra que nunca disparou não é necessariamente uma regra que não teve o que pegar. Pode ser uma regra quebrada em silêncio, e vale a desconfiança.",
                },
            ],
            questions: [
                {
                    statement: "Quais duas perguntas toda regra nova deve responder?",
                    difficulty: "facil",
                    options: [
                        { text: "Pega o que deveria e deixa o normal em paz", isCorrect: true },
                        { text: "Roda rápido e consome pouco recurso", isCorrect: false },
                        { text: "Cobre a técnica e gera relatório mensal", isCorrect: false },
                        { text: "Tem severidade e tem responsável definido", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual é o valor de rodar a regra contra o histórico antes de ativar?",
                    difficulty: "medio",
                    options: [
                        { text: "Revela quantos alertas por dia ela geraria", isCorrect: true },
                        { text: "Confirma que a fonte está sendo coletada", isCorrect: false },
                        { text: "Mede o tempo de execução da consulta escrita", isCorrect: false },
                        { text: "Valida a sintaxe aceita pela plataforma usada", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Ao encontrar um caso legítimo que dispara a regra, qual é a resposta certa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Acrescentar exceção documentada, com data e motivo",
                            isCorrect: true,
                        },
                        { text: "Remover a regra e substituir por um painel", isCorrect: false },
                        { text: "Reduzir a severidade do alerta para baixa", isCorrect: false },
                        {
                            text: "Restringir a regra ao horário comercial apenas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que exceção sem motivo registrado é perigosa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ninguém saberá depois se ela ainda deve existir",
                            isCorrect: true,
                        },
                        { text: "A plataforma remove exceções antigas sozinha", isCorrect: false },
                        {
                            text: "Ela desativa a regra inteira em vez de um caso",
                            isCorrect: false,
                        },
                        {
                            text: "As auditorias exigem justificativa por escrito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que hábito barato transforma o plantão em insumo de melhoria?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Registrar o motivo ao fechar como falso positivo",
                            isCorrect: true,
                        },
                        {
                            text: "Anotar o tempo gasto na triagem de cada alerta",
                            isCorrect: false,
                        },
                        {
                            text: "Encaminhar todos os casos duvidosos ao nível 2",
                            isCorrect: false,
                        },
                        { text: "Revisar as regras somente após cada incidente", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Detecção como código",
            blocks: [
                {
                    type: "text",
                    value: "# Tratar regra como se trata software\n\nO problema clássico: as regras vivem só dentro da ferramenta, alguém as edita direto na interface, e não existe histórico de quem mudou o quê nem por quê. Quando algo quebra, ninguém sabe qual alteração causou, e voltar atrás vira arqueologia.\n\nDetecção como código resolve isso aplicando às regras a mesma disciplina do desenvolvimento. As regras ficam em arquivos, versionadas em repositório, com histórico completo. Mudança passa por revisão de outra pessoa. E uma esteira leva a versão aprovada até a ferramenta automaticamente.\n\nA revisão por outra pessoa é a parte que mais rende, e não é burocracia. Quem revisa pergunta coisas que quem escreveu não perguntou: essa exceção é ampla demais? esse limiar veio de onde? isso não vai disparar durante o fechamento mensal? É o mesmo ganho que revisão de código traz há décadas.",
                },
                {
                    type: "table",
                    value: '[["Prática","O que resolve","Ganho concreto"],["Regras em arquivo","Fim da edição direta e invisível","Histórico de quem mudou e quando"],["Revisão por par","Ponto cego de quem escreveu","Erro pego antes de virar ruído"],["Teste automático","Regra que quebra em silêncio","Falha aparece na esteira"],["Publicação automática","Divergência entre repositório e ferramenta","O que está lá é o que foi aprovado"],["Formato aberto","Amarração a um fornecedor","Migrar sem reescrever tudo"]]',
                },
                {
                    type: "text",
                    value: "# Formato aberto e portabilidade\n\nExiste um benefício estratégico menos óbvio. Escrever a lógica num formato aberto, independente de fornecedor, e converter para a linguagem da ferramenta atual desacopla o conhecimento da plataforma.\n\nO valor aparece no dia em que a empresa troca de SIEM, o que acontece mais do que se imagina, por preço ou por fusão. Quem tem as regras só na sintaxe do produto antigo recomeça do zero. Quem descreveu a lógica em formato portátil converte e segue.\n\nVale a ressalva honesta: nem toda regra se expressa bem em formato genérico, e as mais sofisticadas costumam precisar de recursos específicos da plataforma. O caminho pragmático é manter em formato aberto o conjunto grande de detecções diretas e aceitar que um punhado das mais complexas vai ficar amarrado à ferramenta.",
                },
                {
                    type: "quote",
                    value: "Regra editada direto na interface, sem histórico, é conhecimento que existe só na cabeça de quem a escreveu, e essa pessoa um dia troca de emprego.",
                },
            ],
            questions: [
                {
                    statement: "Qual problema a detecção como código resolve?",
                    difficulty: "facil",
                    options: [
                        { text: "Falta de histórico sobre quem mudou o quê", isCorrect: true },
                        { text: "Excesso de volume coletado pelas fontes", isCorrect: false },
                        { text: "Atraso entre o evento e a consulta possível", isCorrect: false },
                        { text: "Custo da licença cobrada pela plataforma", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual prática mais rende dentro dessa disciplina?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Revisão da regra por outra pessoa antes de subir",
                            isCorrect: true,
                        },
                        {
                            text: "Publicação automática direto para a ferramenta",
                            isCorrect: false,
                        },
                        { text: "Nomeação padronizada dos arquivos de regra", isCorrect: false },
                        { text: "Registro do autor no comentário de cada regra", isCorrect: false },
                    ],
                },
                {
                    statement: "Que tipo de pergunta um revisor costuma fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Esse limiar veio de onde e essa exceção é ampla demais",
                            isCorrect: true,
                        },
                        {
                            text: "Essa regra roda em quanto tempo e usa quanta memória",
                            isCorrect: false,
                        },
                        {
                            text: "Essa fonte tem retenção suficiente para a consulta",
                            isCorrect: false,
                        },
                        {
                            text: "Esse alerta será enviado para qual canal da equipe",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o benefício de escrever regras em formato aberto?",
                    difficulty: "medio",
                    options: [
                        { text: "Não recomeçar do zero ao trocar de plataforma", isCorrect: true },
                        { text: "Reduzir o tempo de execução de cada consulta", isCorrect: false },
                        { text: "Permitir que a regra rode sem coletar dados", isCorrect: false },
                        {
                            text: "Dispensar a revisão por outra pessoa da equipe",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o limite honesto do formato aberto?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Regras sofisticadas precisam de recurso da plataforma",
                            isCorrect: true,
                        },
                        {
                            text: "Regras abertas rodam mais devagar que as nativas",
                            isCorrect: false,
                        },
                        {
                            text: "O formato aberto não aceita exceções documentadas",
                            isCorrect: false,
                        },
                        {
                            text: "A conversão precisa ser refeita a cada alteração",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Medindo cobertura de detecção",
            blocks: [
                {
                    type: "text",
                    value: "# Contar regra não mede nada\n\nA pergunta que a direção faz é legítima: estamos bem cobertos? A resposta errada e comum é citar o número de regras ativas. Duzentas regras podem cobrir vinte técnicas com dez variações cada, ou podem ser duzentas formas de olhar o mesmo lugar.\n\nA medida útil usa o catálogo de técnicas como eixo. Para cada técnica relevante ao seu setor, classifique honestamente onde você está: sem fonte de dado, com fonte mas sem regra, com regra não testada, ou com regra testada. Só a última conta como coberta de verdade.\n\nO resultado costuma ser desconfortável, e é justamente por isso que serve: mostra a diferença entre a sensação de cobertura e a cobertura real. Também dá à conversa de orçamento um argumento concreto, com técnica nomeada e fonte faltante, em vez de um pedido genérico de mais investimento.",
                },
                {
                    type: "table",
                    value: '[["Nível","Situação","Conta como coberto"],["Cego","Não existe fonte de dado","Não"],["Coletado","Fonte existe, sem regra","Não"],["Detectado","Regra existe, nunca testada","Parcialmente"],["Validado","Regra testada e funcionando","Sim"],["Mitigado","O ambiente impede a técnica","Sim, e melhor ainda"]]',
                },
                {
                    type: "text",
                    value: "# Como validar sem simular ataque de verdade\n\nA validação ideal é provocar o comportamento e conferir se o alerta nasce. Isso não exige exercício ofensivo elaborado nem ferramenta cara: boa parte das técnicas se reproduz com ações administrativas inofensivas num ambiente de teste, como criar uma tarefa agendada, adicionar um usuário local ou executar um utilitário legítimo de forma incomum.\n\nA regra de segurança do exercício é fazer isso em ambiente isolado, com autorização escrita e comunicação prévia ao time de plantão, para não gerar um incidente falso. Quem valida detecção sem avisar acaba consumindo a resposta da equipe e queimando confiança.\n\nUma armadilha vale menção: cobertura alta contra o catálogo não significa segurança alta. O catálogo lista o que já foi observado, e sempre haverá o que ainda não foi. Cobertura é uma bússola boa e um destino ruim, e é por isso que a próxima parte da trilha trata da caça, que existe justamente para o que nenhuma regra previu.",
                },
                {
                    type: "quote",
                    value: "Cobertura é bússola, não destino. Ela mede o que já foi observado por alguém, e o invasor não tem obrigação de ficar dentro do catálogo.",
                },
            ],
            questions: [
                {
                    statement: "Por que contar regras ativas não mede cobertura?",
                    difficulty: "facil",
                    options: [
                        { text: "Muitas regras podem olhar o mesmo lugar", isCorrect: true },
                        { text: "Regras antigas deixam de funcionar sozinhas", isCorrect: false },
                        { text: "O número varia conforme a plataforma usada", isCorrect: false },
                        {
                            text: "As regras do fabricante não devem ser contadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que eixo torna a medida de cobertura útil?",
                    difficulty: "medio",
                    options: [
                        { text: "As técnicas relevantes para o seu setor", isCorrect: true },
                        { text: "As fontes de dado já integradas ao SIEM", isCorrect: false },
                        { text: "Os incidentes ocorridos no último ano", isCorrect: false },
                        { text: "Os sistemas críticos listados pelo negócio", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual nível conta como coberto de verdade?",
                    difficulty: "medio",
                    options: [
                        { text: "Regra existente e testada de fato", isCorrect: true },
                        { text: "Fonte coletada e disponível para consulta", isCorrect: false },
                        { text: "Regra escrita e ativada na plataforma", isCorrect: false },
                        { text: "Técnica documentada no catálogo interno", isCorrect: false },
                    ],
                },
                {
                    statement: "Que cuidado o exercício de validação exige?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ambiente isolado, autorização e aviso ao plantão",
                            isCorrect: true,
                        },
                        {
                            text: "Ferramenta ofensiva licenciada e equipe externa",
                            isCorrect: false,
                        },
                        {
                            text: "Execução fora do expediente para evitar impacto",
                            isCorrect: false,
                        },
                        { text: "Aprovação prévia do fornecedor da plataforma", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que cobertura alta não significa segurança alta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O catálogo lista o observado, não tudo que existe",
                            isCorrect: true,
                        },
                        { text: "As regras testadas expiram após alguns meses", isCorrect: false },
                        { text: "A cobertura ignora as técnicas já mitigadas", isCorrect: false },
                        { text: "O cálculo considera apenas o setor da empresa", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Triagem de alerta",
    aulas: [
        {
            titulo: "O fluxo de triagem",
            blocks: [
                {
                    type: "text",
                    value: "# O trabalho que ocupa a maior parte do dia\n\nTriagem é decidir, para cada alerta, se ele merece investigação, e é o que um analista de primeiro nível mais faz. O objetivo não é resolver tudo: é separar rápido o que é ruído do que precisa de atenção, sem gastar uma hora no que se resolve em três minutos e sem fechar em três minutos o que precisava de uma hora.\n\nO fluxo que funciona tem quatro passos. Entender o que a regra procurava, porque decidir sem saber o que disparou é adivinhação. Reunir o contexto mínimo, que é quem, onde, quando e o que aconteceu antes. Decidir entre encerrar, escalar ou continuar investigando. E registrar, sempre, porque a decisão sem registro não existe para quem vem depois.\n\nO erro mais comum de quem começa é pular o primeiro passo. Chega o alerta, o analista vai direto olhar a máquina, procura algo estranho e encontra alguma coisa, porque toda máquina tem alguma coisa. Sem saber o que a regra procurava, ele investiga o que chamou a atenção dele, não o que causou o alerta.",
                },
                {
                    type: "table",
                    value: '[["Passo","Pergunta central","Erro típico"],["Entender a regra","O que ela procurava exatamente","Investigar sem saber o que disparou"],["Reunir contexto","Quem, onde, quando, o que antes","Olhar o evento isolado"],["Decidir","Encerra, escala ou continua","Deixar em aberto sem critério"],["Registrar","O que vi, verifiquei e decidi","Fechar sem nota, ou com uma palavra"]]',
                },
                {
                    type: "text",
                    value: "# Ordem de atendimento e o relógio\n\nA fila raramente está vazia, então a ordem importa. A prioridade combina duas coisas: a gravidade do que a regra sugere e a criticidade do que foi atingido. Alerta médio num controlador de domínio pesa mais que alerta alto numa estação de estagiário, e é por isso que enriquecer com criticidade do ativo, lá do módulo de dados, muda a operação de verdade.\n\nO segundo fator é a idade do alerta. Alerta parado envelhece mal: se ele for verdadeiro, cada hora é uma hora a mais para o invasor. Uma fila ordenada apenas por severidade costuma deixar alertas médios apodrecerem por dias, e é exatamente ali que os casos reais costumam se esconder.\n\nA boa prática é combinar severidade, criticidade e idade num único critério de ordenação, e acompanhar quantos alertas passam do prazo definido. Esse número, o de alertas vencidos, costuma revelar mais sobre a saúde da operação do que a contagem total.",
                },
                {
                    type: "quote",
                    value: "Antes de olhar a máquina, leia a regra. Sem saber o que disparou o alerta, você vai investigar o que te chamou atenção, e toda máquina tem alguma coisa estranha.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o objetivo da triagem?",
                    difficulty: "facil",
                    options: [
                        { text: "Separar rápido o ruído do que merece atenção", isCorrect: true },
                        { text: "Resolver completamente cada alerta recebido", isCorrect: false },
                        { text: "Ajustar as regras que geraram falso positivo", isCorrect: false },
                        { text: "Documentar todos os eventos do turno atual", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o primeiro passo do fluxo de triagem?",
                    difficulty: "facil",
                    options: [
                        { text: "Entender o que a regra procurava", isCorrect: true },
                        { text: "Isolar a máquina que gerou o alerta", isCorrect: false },
                        { text: "Consultar a reputação do endereço externo", isCorrect: false },
                        { text: "Escalar o caso para o analista de nível 2", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que pular a leitura da regra leva a conclusões erradas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Você investiga o que chamou atenção, não o que disparou",
                            isCorrect: true,
                        },
                        {
                            text: "A regra some do histórico depois de algumas horas",
                            isCorrect: false,
                        },
                        {
                            text: "O alerta perde a prioridade original ao ser aberto",
                            isCorrect: false,
                        },
                        {
                            text: "A ferramenta bloqueia a consulta sem esse passo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que fatores devem compor a prioridade de atendimento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Gravidade, criticidade do ativo e idade do alerta",
                            isCorrect: true,
                        },
                        { text: "Gravidade, fonte de origem e volume gerado", isCorrect: false },
                        { text: "Criticidade, turno de plantão e nome da regra", isCorrect: false },
                        { text: "Idade, tamanho do evento e tipo de máquina", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que uma fila ordenada só por severidade é problemática?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Alertas médios apodrecem e casos reais se escondem ali",
                            isCorrect: true,
                        },
                        {
                            text: "A severidade é definida pelo fabricante da ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "Os alertas críticos acabam sendo fechados sem análise",
                            isCorrect: false,
                        },
                        {
                            text: "A ordenação não considera o volume total do turno",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "As perguntas que resolvem a maioria dos casos",
            blocks: [
                {
                    type: "text",
                    value: "# Um roteiro que serve para quase tudo\n\nA maior parte dos alertas se resolve com um punhado de perguntas, feitas na ordem. Elas não dependem de ferramenta e funcionam tanto para um alerta de endpoint quanto para um de nuvem.\n\nA primeira é sobre a identidade: quem é esse usuário ou essa máquina, o que ele costuma fazer e que privilégios tem. A segunda é sobre normalidade: isso já aconteceu antes aqui, com esse usuário, com essa máquina? Muitas vezes a resposta encerra o caso, porque aquele comportamento acontece toda terça-feira.\n\nA terceira é sobre o entorno: o que aconteceu antes e depois na mesma máquina e com a mesma conta. Um evento isolado quase nunca decide; a vizinhança temporal decide. A quarta é sobre alcance: isso está acontecendo em outro lugar? Um caso isolado e uma dúzia de máquinas com o mesmo padrão são incidentes de gravidade completamente diferente.",
                },
                {
                    type: "table",
                    value: '[["Pergunta","O que buscar","O que a resposta muda"],["Quem é","Cargo, privilégio, setor","Peso do caso"],["É normal aqui","Histórico do usuário e da máquina","Muitas vezes encerra"],["O que veio antes e depois","Eventos vizinhos no tempo","Dá sentido ao evento isolado"],["Está em outro lugar","Mesmo padrão em outras máquinas","Muda de caso para incidente"],["O que muda se for real","Impacto concreto","Define a urgência de escalar"]]',
                },
                {
                    type: "text",
                    value: "# A pergunta que evita o erro mais caro\n\nExiste uma última pergunta que muda o comportamento do analista quando fica clara: se isso for verdadeiro, o que acontece? Ela desloca a análise do técnico para o consequente e ajuda quando o alerta é ambíguo, que é a maioria.\n\nSe o pior cenário é uma estação isolada com adware, o custo de errar fechando é baixo. Se o pior cenário é um administrador de domínio comprometido, o custo de errar fechando é a empresa inteira, e vale escalar mesmo com dúvida.\n\nDaí sai um princípio operacional simples de comunicar: na dúvida, escale casos de alto impacto e encerre casos de baixo impacto. Isso parece óbvio escrito, e no plantão a tentação é oposta, porque o caso de alto impacto dá trabalho e a fila está crescendo. Nomear o princípio ajuda o time a resistir a essa tentação.",
                },
                {
                    type: "quote",
                    value: "Um evento isolado quase nunca decide nada. É a vizinhança dele no tempo, o que veio antes e depois, que transforma dado solto em conclusão.",
                },
            ],
            questions: [
                {
                    statement: "Qual pergunta costuma encerrar boa parte dos alertas?",
                    difficulty: "facil",
                    options: [
                        { text: "Isso já aconteceu antes aqui, com esse usuário", isCorrect: true },
                        { text: "Qual regra exatamente foi acionada agora", isCorrect: false },
                        { text: "Qual a severidade definida para esse alerta", isCorrect: false },
                        { text: "Quem escreveu essa regra dentro da equipe", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que olhar o que aconteceu antes e depois?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A vizinhança temporal dá sentido ao evento isolado",
                            isCorrect: true,
                        },
                        {
                            text: "O evento isolado costuma vir com dados corrompidos",
                            isCorrect: false,
                        },
                        {
                            text: "A ferramenta só permite consultar em intervalos",
                            isCorrect: false,
                        },
                        {
                            text: "Os eventos antigos têm mais detalhe registrado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que muda ao descobrir que o mesmo padrão ocorre em outras máquinas?",
                    difficulty: "medio",
                    options: [
                        { text: "O caso deixa de ser isolado e vira incidente", isCorrect: true },
                        { text: "A regra passa a ser classificada como ruidosa", isCorrect: false },
                        {
                            text: "O alerta perde prioridade por ser comportamento comum",
                            isCorrect: false,
                        },
                        {
                            text: "A investigação pode ser encerrada com mais segurança",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para que serve perguntar o que acontece se o alerta for verdadeiro?",
                    difficulty: "medio",
                    options: [
                        { text: "Desloca a análise para a consequência do erro", isCorrect: true },
                        { text: "Confirma se a regra está corretamente escrita", isCorrect: false },
                        {
                            text: "Define a fonte de dado que deve ser consultada",
                            isCorrect: false,
                        },
                        { text: "Estabelece o prazo máximo para fechar o caso", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual princípio orienta a decisão em caso de dúvida?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Escalar o de alto impacto e encerrar o de baixo",
                            isCorrect: true,
                        },
                        {
                            text: "Escalar todos os casos duvidosos ao nível seguinte",
                            isCorrect: false,
                        },
                        {
                            text: "Encerrar tudo que não tiver evidência conclusiva",
                            isCorrect: false,
                        },
                        { text: "Adiar a decisão até o próximo turno assumir", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Falso positivo, verdadeiro positivo e o benigno",
            blocks: [
                {
                    type: "text",
                    value: "# Três classificações, e a do meio é a mais útil\n\nTodo alerta triado recebe uma classificação, e a maioria das equipes usa duas: falso positivo, quando a regra errou, e verdadeiro positivo, quando havia atividade maliciosa. Falta uma terceira que resolve muita confusão: o verdadeiro benigno.\n\nVerdadeiro benigno é quando a regra acertou tecnicamente, o comportamento aconteceu mesmo, mas ele é legítimo. O administrador realmente criou uma conta nova, o time de dados realmente executou um script incomum. A regra não errou, o contexto explica.\n\nA distinção importa porque a ação é diferente. Falso positivo pede correção da lógica, porque a regra está detectando o que não pretendia. Verdadeiro benigno pede exceção ou enriquecimento de contexto, porque a lógica está certa e falta ao alerta a informação que teria evitado o trabalho.",
                },
                {
                    type: "table",
                    value: '[["Classificação","O que significa","Ação certa"],["Falso positivo","A regra detectou o que não pretendia","Corrigir a lógica da regra"],["Verdadeiro benigno","Aconteceu, mas é legítimo","Exceção ou mais contexto no alerta"],["Verdadeiro positivo","Atividade maliciosa confirmada","Escalar e responder"],["Inconclusivo","Faltou dado para decidir","Registrar a lacuna de coleta"]]',
                },
                {
                    type: "text",
                    value: "# O inconclusivo merece existir\n\nVale uma quarta classificação, muitas vezes esquecida: inconclusivo por falta de dado. Acontece quando o analista não consegue decidir porque a fonte necessária não existe, expirou da retenção ou chegou incompleta.\n\nEmpurrar esses casos para falso positivo é conveniente e destrutivo, porque apaga do histórico exatamente o sinal que justificaria investir em coleta. Registrado como inconclusivo, com a lacuna nomeada, ele vira argumento concreto na próxima conversa de orçamento.\n\nDois cuidados fecham o assunto. Primeiro, o fechamento sempre carrega o motivo, não só a etiqueta: benigno porque a automação de backup roda nesse horário vale muito mais que apenas benigno. Segundo, verdadeiro positivo não significa incidente grave, apenas que o comportamento malicioso ocorreu; a gravidade é outra dimensão, e confundir as duas gera relatório assustador ou tranquilizador demais.",
                },
                {
                    type: "quote",
                    value: "Fechar como falso positivo o que na verdade foi inconclusivo é apagar do histórico justamente a evidência de que faltava coleta.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza um verdadeiro benigno?",
                    difficulty: "facil",
                    options: [
                        { text: "O comportamento ocorreu, mas é legítimo", isCorrect: true },
                        { text: "A regra detectou o que não pretendia detectar", isCorrect: false },
                        { text: "A atividade maliciosa foi de fato confirmada", isCorrect: false },
                        { text: "Faltou dado para o analista poder decidir", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual ação corresponde a um falso positivo?",
                    difficulty: "medio",
                    options: [
                        { text: "Corrigir a lógica da regra que disparou", isCorrect: true },
                        { text: "Criar exceção documentada para aquele caso", isCorrect: false },
                        { text: "Escalar imediatamente para o nível seguinte", isCorrect: false },
                        { text: "Registrar a lacuna de coleta identificada", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual ação corresponde a um verdadeiro benigno?",
                    difficulty: "medio",
                    options: [
                        { text: "Exceção ou mais contexto dentro do alerta", isCorrect: true },
                        { text: "Reescrita completa da lógica da regra", isCorrect: false },
                        { text: "Aumento da severidade para o próximo caso", isCorrect: false },
                        { text: "Desativação da fonte que gerou o evento", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que classificar como inconclusivo em vez de falso positivo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Preserva o sinal que justifica investir em coleta",
                            isCorrect: true,
                        },
                        { text: "Evita que a regra seja desativada pela equipe", isCorrect: false },
                        {
                            text: "Permite reabrir o caso quando houver mais tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Reduz a taxa de falso positivo dos indicadores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que verdadeiro positivo não é sinônimo de incidente grave?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Gravidade é outra dimensão além de ter ocorrido",
                            isCorrect: true,
                        },
                        {
                            text: "Verdadeiro positivo só vale após confirmação do nível 2",
                            isCorrect: false,
                        },
                        {
                            text: "A gravidade é definida automaticamente pela regra",
                            isCorrect: false,
                        },
                        {
                            text: "Incidente exige que mais de uma máquina seja atingida",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Escalonar e documentar",
            blocks: [
                {
                    type: "text",
                    value: "# Escalar é passar contexto, não passar problema\n\nEscalonar bem é uma habilidade subestimada. O erro comum é encaminhar o alerta cru com a frase parece suspeito, o que obriga o próximo analista a refazer tudo desde o começo e desperdiça o tempo que já foi investido.\n\nO escalonamento bom carrega quatro coisas. O que foi observado, em fatos, com horários. O que já foi verificado, incluindo o que foi descartado e por quê. Qual é a hipótese, dita como hipótese. E o que se pede, que pode ser uma decisão, um acesso que você não tem ou uma segunda opinião.\n\nO último item é o mais esquecido e o mais valioso. Escalonamento sem pedido explícito vira uma batata quente: chega ao próximo nível sem que ninguém saiba se é para investigar, para decidir ou apenas para tomar conhecimento.",
                },
                {
                    type: "table",
                    value: '[["Elemento","Exemplo ruim","Exemplo bom"],["Observado","Alerta estranho na máquina X","Às 3h12 o processo Y criou Z na máquina X"],["Verificado","Olhei e não achei nada","Conferi histórico do usuário, sem casos parecidos"],["Hipótese","Acho que fomos hackeados","Possível persistência, ainda sem confirmação"],["Pedido","Segue para análise","Preciso de acesso ao servidor para confirmar"]]',
                },
                {
                    type: "text",
                    value: "# A nota que você deixa é o produto do seu trabalho\n\nA documentação parece burocracia e é o que dá continuidade à operação. Alerta fechado com a palavra ok não informa nada: seis meses depois, quando um incidente for investigado e alguém encontrar aquele alerta relacionado, a nota vazia vai custar horas.\n\nUma nota boa cabe em três linhas e responde três coisas: o que eu vi, o que eu verifiquei e o que eu concluí. Escrever assim é rápido depois do hábito formado, e a diferença aparece na investigação futura, na passagem de turno e na revisão de regra.\n\nUm hábito extra que vale o esforço: registrar o que você descartou, não só o que confirmou. Saber que o analista anterior já conferiu o histórico do usuário e não achou nada evita repetir o mesmo trabalho, e é uma das poucas formas de a operação ficar mais rápida com o tempo em vez de apenas mais ocupada.",
                },
                {
                    type: "quote",
                    value: "Escalonamento sem pedido explícito é batata quente. Diga o que você quer do próximo nível: decisão, acesso ou segunda opinião.",
                },
            ],
            questions: [
                {
                    statement: "O que um bom escalonamento deve carregar?",
                    difficulty: "facil",
                    options: [
                        { text: "Observado, verificado, hipótese e pedido", isCorrect: true },
                        { text: "Alerta cru, severidade e nome da regra", isCorrect: false },
                        { text: "Máquina, usuário e horário do evento", isCorrect: false },
                        { text: "Fonte, retenção e volume analisado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual elemento é o mais esquecido no escalonamento?",
                    difficulty: "medio",
                    options: [
                        { text: "O pedido explícito do que se espera", isCorrect: true },
                        { text: "O horário exato em que tudo ocorreu", isCorrect: false },
                        { text: "A severidade atribuída pela ferramenta", isCorrect: false },
                        { text: "O nome da máquina onde o alerta nasceu", isCorrect: false },
                    ],
                },
                {
                    statement: "O que uma nota de fechamento deve responder?",
                    difficulty: "medio",
                    options: [
                        { text: "O que vi, o que verifiquei e o que concluí", isCorrect: true },
                        { text: "Qual regra disparou e em que horário exato", isCorrect: false },
                        { text: "Quanto tempo levei e quantos eventos analisei", isCorrect: false },
                        { text: "Qual ferramenta usei e qual consulta escrevi", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que registrar também o que foi descartado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Evita que o próximo repita o mesmo trabalho", isCorrect: true },
                        {
                            text: "Aumenta a taxa de verdadeiro positivo registrada",
                            isCorrect: false,
                        },
                        {
                            text: "É exigido pelas normas de auditoria de segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Permite reabrir o alerta depois do prazo padrão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o custo de fechar um alerta com uma nota vazia?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma investigação futura vai gastar horas nele", isCorrect: true },
                        { text: "A ferramenta reabre o alerta automaticamente", isCorrect: false },
                        { text: "A regra correspondente é desativada sozinha", isCorrect: false },
                        { text: "O indicador de tempo de resposta fica errado", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Contexto: o que realmente muda a resposta",
            blocks: [
                {
                    type: "text",
                    value: "# O mesmo alerta, três respostas diferentes\n\nUm exercício mostra melhor que qualquer definição. O alerta é o mesmo: execução de um utilitário de administração remota numa estação. Nada mudou tecnicamente entre os três casos abaixo, e a resposta certa muda por completo.\n\nNo primeiro, a estação é do time de suporte, o utilitário é o padrão da empresa e o horário é comercial. Encerra como benigno em dois minutos. No segundo, a estação é do financeiro, o utilitário não é o padrão e o horário é três da manhã. Escala imediatamente. No terceiro, a estação é do financeiro, o utilitário não é o padrão, e o usuário abriu um anexo de correio dez minutos antes. Isso é um incidente em curso.\n\nO que separou os três não foi conhecimento técnico sobre a ferramenta: foi contexto. E é por isso que analista que conhece a casa vale mais que analista que conhece a ferramenta.",
                },
                {
                    type: "table",
                    value: '[["Contexto","Pergunta que ele responde","Onde costuma estar"],["Papel do usuário","Esse comportamento cabe no trabalho dele","Diretório de identidades e RH"],["Padrão do ambiente","Essa ferramenta é usada aqui","Inventário de software"],["Janela de mudança","Havia manutenção programada agora","Sistema de chamados"],["Criticidade do ativo","O que se perde se for real","Inventário do negócio"],["Histórico do usuário","Ele já fez isso antes","Log dos últimos meses"]]',
                },
                {
                    type: "text",
                    value: "# Trazer o contexto para dentro do alerta\n\nSe contexto decide, ele não deveria depender de o analista lembrar de procurar. O caminho é embutir no alerta o que já se sabe: setor e cargo do usuário, criticidade da máquina, se existe chamado de mudança aberto naquele momento, quantas vezes aquele comportamento apareceu nos últimos trinta dias.\n\nEsse último campo é surpreendentemente eficaz e barato. Um contador de quantas vezes o mesmo padrão ocorreu no ambiente recentemente resolve sozinho uma quantidade enorme de triagens, porque separa de imediato o que é rotina do que é inédito.\n\nFecha o módulo o ponto que atravessa a trilha: ferramenta entrega evento, e contexto transforma evento em decisão. A parte do trabalho que não se compra pronta é justamente saber o que é normal na sua casa, e ela se constrói prestando atenção no ambiente, não estudando manual de produto.",
                },
                {
                    type: "quote",
                    value: "Analista que conhece a casa vale mais que analista que conhece a ferramenta. O mesmo alerta tem três respostas certas diferentes dependendo do contexto.",
                },
            ],
            questions: [
                {
                    statement: "No exercício das três situações, o que muda a resposta certa?",
                    difficulty: "facil",
                    options: [
                        { text: "O contexto em volta do mesmo evento técnico", isCorrect: true },
                        { text: "A severidade atribuída pela regra ao alerta", isCorrect: false },
                        { text: "A ferramenta usada para fazer a investigação", isCorrect: false },
                        { text: "O nível do analista que atendeu o chamado", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Que contexto responde se o comportamento cabe no trabalho do usuário?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O papel dele, vindo do diretório de identidades",
                            isCorrect: true,
                        },
                        { text: "O inventário de software instalado na máquina", isCorrect: false },
                        { text: "A criticidade do ativo definida pelo negócio", isCorrect: false },
                        { text: "A janela de mudança registrada em chamado", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que embutir contexto no próprio alerta em vez de deixar para a triagem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A decisão não deve depender de o analista lembrar",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta manual consome licença da plataforma",
                            isCorrect: false,
                        },
                        {
                            text: "O contexto expira da retenção antes da triagem",
                            isCorrect: false,
                        },
                        {
                            text: "As fontes de contexto não ficam disponíveis à noite",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que campo barato resolve sozinho muitas triagens?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Quantas vezes o padrão ocorreu nos últimos 30 dias",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo médio de resposta da equipe naquele mês",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de eventos processados pela fonte",
                            isCorrect: false,
                        },
                        {
                            text: "O nome do analista que atendeu o caso anterior",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual parte do trabalho de triagem não se compra pronta?",
                    difficulty: "medio",
                    options: [
                        { text: "Saber o que é normal dentro daquele ambiente", isCorrect: true },
                        { text: "Integrar as fontes necessárias à plataforma", isCorrect: false },
                        { text: "Definir a severidade padrão de cada regra", isCorrect: false },
                        { text: "Manter a documentação dos procedimentos", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Resposta a incidente",
    aulas: [
        {
            titulo: "O ciclo de resposta",
            blocks: [
                {
                    type: "text",
                    value: "# Seis fases que se repetem em qualquer incidente\n\nResposta a incidente é a disciplina de lidar com o comprometimento depois que ele é confirmado. O modelo mais usado organiza o trabalho em seis fases: preparação, identificação, contenção, erradicação, recuperação e lições aprendidas.\n\nA preparação acontece antes de qualquer coisa e é onde se ganha ou se perde o incidente: plano escrito, contatos definidos, acessos de emergência, backup testado. A identificação é confirmar que aconteceu e entender o alcance. A contenção é impedir que piore. A erradicação é remover o acesso do invasor. A recuperação é voltar a operar. E as lições aprendidas fecham o ciclo alimentando de volta a preparação.\n\nO detalhe que a figura do ciclo esconde é que na prática essas fases se sobrepõem. Você contém uma máquina enquanto ainda identifica o alcance nas outras, e frequentemente volta a identificar depois de conter, porque a contenção revela algo novo.",
                },
                {
                    type: "table",
                    value: '[["Fase","Pergunta central","Erro típico"],["Preparação","Estamos prontos antes de precisar","Deixar o plano só na cabeça de alguém"],["Identificação","O que aconteceu e até onde foi","Concluir o alcance cedo demais"],["Contenção","Como impedir que piore","Agir e destruir evidência junto"],["Erradicação","O invasor ainda tem como voltar","Limpar o achado e parar por ali"],["Recuperação","Podemos voltar com segurança","Voltar antes de erradicar"],["Lições","O que muda a partir de agora","Reunião sem ação registrada"]]',
                },
                {
                    type: "text",
                    value: "# Quem manda durante um incidente\n\nUma decisão de organização evita muito caos: alguém precisa coordenar. O papel de coordenador de incidente não é do mais técnico da sala, é de quem mantém a visão do todo, distribui tarefas, controla o relógio e fala com o restante da empresa.\n\nSem esse papel definido, três pessoas investigam a mesma máquina, ninguém cuida da comunicação e decisões importantes ficam no ar porque cada um assume que outro vai tomar. Com ele, os técnicos podem se concentrar no técnico.\n\nA segunda definição que evita atrito é a de autoridade: quem pode autorizar desligar um sistema de produção. Essa pergunta feita durante o incidente custa horas; respondida antes, custa uma linha no plano. É o tipo de coisa que a simulação de mesa revela e que nenhuma auditoria de documento pega.",
                },
                {
                    type: "quote",
                    value: "Quem coordena o incidente não precisa ser o mais técnico da sala. Precisa manter a visão do todo, o relógio e a comunicação, para que os técnicos possam ser técnicos.",
                },
            ],
            questions: [
                {
                    statement: "Quais são as seis fases do ciclo de resposta a incidente?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Preparação, identificação, contenção, erradicação, recuperação e lições",
                            isCorrect: true,
                        },
                        {
                            text: "Detecção, análise, bloqueio, limpeza, restauração e auditoria final",
                            isCorrect: false,
                        },
                        {
                            text: "Alerta, triagem, escalonamento, resposta, relatório e revisão",
                            isCorrect: false,
                        },
                        {
                            text: "Coleta, correlação, alerta, decisão, ação e documentação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em qual fase o incidente é ganho ou perdido?",
                    difficulty: "medio",
                    options: [
                        { text: "Na preparação, feita bem antes do incidente", isCorrect: true },
                        { text: "Na contenção, quando se impede o avanço", isCorrect: false },
                        { text: "Na identificação, ao medir o alcance real", isCorrect: false },
                        { text: "Na recuperação, ao restaurar os sistemas", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que dizer que as fases se sobrepõem na prática?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Contém-se uma máquina enquanto ainda se identifica outras",
                            isCorrect: true,
                        },
                        {
                            text: "As ferramentas executam as fases em paralelo sozinhas",
                            isCorrect: false,
                        },
                        {
                            text: "O plano exige que todas comecem ao mesmo tempo",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem das fases muda conforme o tipo de ataque",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel do coordenador de incidente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Manter a visão do todo, o relógio e a comunicação",
                            isCorrect: true,
                        },
                        {
                            text: "Executar a análise técnica mais complexa do caso",
                            isCorrect: false,
                        },
                        {
                            text: "Decidir sozinho se a empresa vai pagar resgate",
                            isCorrect: false,
                        },
                        { text: "Documentar cada ação tomada pelos analistas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual pergunta custa horas se feita durante o incidente?",
                    difficulty: "dificil",
                    options: [
                        { text: "Quem autoriza desligar um sistema de produção", isCorrect: true },
                        { text: "Qual ferramenta usar para isolar a máquina", isCorrect: false },
                        { text: "Quantos analistas estão de plantão agora", isCorrect: false },
                        { text: "Onde ficam guardados os registros antigos", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Conter sem destruir evidência",
            blocks: [
                {
                    type: "text",
                    value: "# O impulso certo na hora errada\n\nAo confirmar um comprometimento, o instinto é agir: desligar a máquina, apagar o arquivo, bloquear a conta. O instinto está certo na intenção e frequentemente errado na execução, porque cada uma dessas ações pode destruir a evidência que explicaria o que aconteceu.\n\nO exemplo mais claro é desligar. Desligar elimina tudo que estava só na memória, e boa parte do malware moderno vive exatamente ali. Isolar da rede tem efeito parecido de contenção e preserva o estado da máquina, e por isso costuma ser a escolha melhor.\n\nA ordem que funciona é preservar, conter e só então limpar. Preservar pode ser simplesmente coletar o que é volátil antes de mexer: lista de processos, conexões abertas, sessões ativas, e uma cópia da memória quando houver ferramenta para isso.",
                },
                {
                    type: "table",
                    value: '[["Ação","Efeito de contenção","Custo em evidência"],["Isolar da rede","Alto, corta o canal","Baixo, o estado permanece"],["Desligar a máquina","Alto","Alto, perde a memória"],["Bloquear a conta","Alto para aquela identidade","Baixo"],["Encerrar processo","Médio","Médio, perde o estado dele"],["Apagar o arquivo","Baixo, não expulsa ninguém","Alto, perde o artefato"]]',
                },
                {
                    type: "text",
                    value: "# Contenção parcial e o efeito de alertar o invasor\n\nExiste uma decisão delicada: conter uma parte pode avisar o invasor de que ele foi descoberto. Um operador experiente que perde acesso a uma máquina entende o recado e pode acelerar, destruindo dados ou disparando a cifragem antes que você termine de mapear.\n\nPor isso a orientação comum em incidentes com sinal de operador humano ativo é preparar a contenção ampla e executá-la de uma vez, em vez de ir cortando aos poucos. Isso exige mapear o alcance primeiro, o que por sua vez exige tempo, e é aí que mora o julgamento.\n\nO critério prático que ajuda a decidir: se o risco de destruição imediata é alto, contenha já e aceite o mapa incompleto. Se o invasor parece estar em fase de reconhecimento e o dano potencial ainda é baixo, vale investir algumas horas mapeando antes de agir. Essa decisão é do coordenador, com o negócio ciente, e não do analista sozinho no plantão.",
                },
                {
                    type: "quote",
                    value: "Desligar a máquina apaga a memória, e é nela que boa parte do malware moderno vive. Isolar da rede contém quase igual e preserva a resposta.",
                },
            ],
            questions: [
                {
                    statement: "Por que desligar a máquina comprometida costuma ser ruim?",
                    difficulty: "facil",
                    options: [
                        { text: "Elimina tudo que estava apenas na memória", isCorrect: true },
                        { text: "Não interrompe o canal do invasor com ela", isCorrect: false },
                        { text: "Impede a restauração posterior do backup", isCorrect: false },
                        { text: "Aciona mecanismos de destruição do malware", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a ordem correta ao conter um comprometimento?",
                    difficulty: "medio",
                    options: [
                        { text: "Preservar, conter e só então limpar", isCorrect: true },
                        { text: "Limpar, preservar e depois conter", isCorrect: false },
                        { text: "Conter, limpar e preservar ao final", isCorrect: false },
                        { text: "Preservar, limpar e conter por último", isCorrect: false },
                    ],
                },
                {
                    statement: "Que ação contém bem e preserva a evidência?",
                    difficulty: "medio",
                    options: [
                        { text: "Isolar a máquina da rede sem desligá-la", isCorrect: true },
                        { text: "Apagar o arquivo malicioso encontrado nela", isCorrect: false },
                        { text: "Encerrar o processo suspeito imediatamente", isCorrect: false },
                        { text: "Reinstalar o sistema operacional da máquina", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual é o risco de conter aos poucos quando há operador humano ativo?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele percebe e pode acelerar a destruição", isCorrect: true },
                        { text: "A contenção parcial não interrompe o canal", isCorrect: false },
                        { text: "Os registros ficam incompletos para análise", isCorrect: false },
                        { text: "As máquinas isoladas perdem a configuração", isCorrect: false },
                    ],
                },
                {
                    statement: "De quem é a decisão entre conter já ou mapear mais antes?",
                    difficulty: "medio",
                    options: [
                        { text: "Do coordenador, com o negócio ciente", isCorrect: true },
                        { text: "Do analista de plantão que detectou", isCorrect: false },
                        { text: "Do fornecedor da ferramenta de resposta", isCorrect: false },
                        { text: "Do time de infraestrutura responsável", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Erradicar e recuperar",
            blocks: [
                {
                    type: "text",
                    value: "# Achar não é o mesmo que remover tudo\n\nErradicação é garantir que o invasor perdeu todos os caminhos de volta, e é a fase em que mais se subestima o trabalho. A armadilha é encontrar o artefato inicial, removê-lo e declarar encerrado, esquecendo que a essa altura ele provavelmente já plantou outras formas de retornar.\n\nA lista mínima do que precisa ser revisto vem direto das etapas que você estudou na trilha anterior: mecanismos de persistência criados, contas novas ou alteradas, chaves de acesso adicionadas, permissões concedidas em nuvem, regras de correio criadas e credenciais que passaram pelas máquinas comprometidas.\n\nEsse último item é o mais esquecido e o mais custoso. Toda credencial que existiu numa máquina comprometida deve ser considerada exposta, incluindo senhas de serviço e chaves de aplicação. Trocar isso dá trabalho e é exatamente o que impede o invasor de voltar pela porta da frente na semana seguinte.",
                },
                {
                    type: "table",
                    value: '[["O que revisar","Por quê","Sinal de que faltou"],["Persistências criadas","O acesso volta ao reiniciar","Máquina limpa reinfecta sozinha"],["Contas e permissões","Acesso legítimo plantado","Login válido de origem estranha"],["Chaves adicionadas","Entrada sem senha","Acesso administrativo inexplicado"],["Credenciais expostas","Servem em outros sistemas","Comprometimento de outra máquina"],["Regras de correio","Escondem a conversa do dono","Fraude continua após limpeza"]]',
                },
                {
                    type: "text",
                    value: "# Recuperar com ordem e com prova\n\nA recuperação devolve a operação, e a sequência importa. Sistemas críticos primeiro, restaurados a partir de fonte confiável, e com monitoramento reforçado durante um período, porque é justamente nos primeiros dias que uma erradicação incompleta se revela.\n\nRestaurar de backup exige um cuidado que passa despercebido: escolher um ponto anterior ao comprometimento, e não simplesmente o mais recente. Como o invasor costuma estar dentro há semanas, o backup de ontem pode conter a persistência dele. Saber a data provável do acesso inicial, que veio da fase de identificação, é o que permite escolher direito.\n\nO critério para declarar encerrado deve ser explícito e combinado antes: por exemplo, nenhum indicador do incidente observado por um número definido de dias, credenciais trocadas, correções aplicadas e monitoramento adicional sem achados. Sem critério escrito, o encerramento acaba acontecendo por cansaço, que é o pior motivo possível.",
                },
                {
                    type: "quote",
                    value: "Toda credencial que passou por máquina comprometida está exposta. Trocar dá trabalho, e é o que impede o invasor de voltar pela porta da frente na semana seguinte.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a armadilha mais comum na erradicação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Remover o artefato inicial e declarar encerrado",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar credenciais antes de conter o incidente",
                            isCorrect: false,
                        },
                        { text: "Reinstalar sistemas que ainda estavam limpos", isCorrect: false },
                        { text: "Isolar máquinas que não foram comprometidas", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que credenciais de máquinas comprometidas devem ser trocadas?",
                    difficulty: "medio",
                    options: [
                        { text: "Devem ser consideradas expostas ao invasor", isCorrect: true },
                        { text: "Expiram automaticamente após um incidente", isCorrect: false },
                        { text: "Ficam corrompidas durante a contenção feita", isCorrect: false },
                        { text: "São exigidas em formato novo pela auditoria", isCorrect: false },
                    ],
                },
                {
                    statement: "Que cuidado a restauração a partir de backup exige?",
                    difficulty: "dificil",
                    options: [
                        { text: "Escolher ponto anterior ao comprometimento", isCorrect: true },
                        { text: "Usar sempre a cópia mais recente disponível", isCorrect: false },
                        { text: "Restaurar todos os sistemas simultaneamente", isCorrect: false },
                        {
                            text: "Manter a máquina isolada durante a restauração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que reforçar o monitoramento nos primeiros dias após recuperar?",
                    difficulty: "medio",
                    options: [
                        { text: "É quando erradicação incompleta se revela", isCorrect: true },
                        { text: "É quando o backup ainda pode ser revertido", isCorrect: false },
                        { text: "É quando a auditoria costuma solicitar dados", isCorrect: false },
                        { text: "É quando as regras novas entram em vigor", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que definir critério de encerramento antes do incidente?",
                    difficulty: "medio",
                    options: [
                        { text: "Sem ele o caso é encerrado por cansaço", isCorrect: true },
                        { text: "Sem ele a ferramenta não fecha o chamado", isCorrect: false },
                        { text: "Sem ele o seguro não cobre o prejuízo", isCorrect: false },
                        { text: "Sem ele não é possível gerar relatório", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Comunicação durante o incidente",
            blocks: [
                {
                    type: "text",
                    value: "# A parte técnica é metade do trabalho\n\nDurante um incidente relevante, muita gente precisa saber de coisas diferentes: a direção quer saber impacto e prazo, o jurídico quer saber se há dado pessoal envolvido, o time de produto quer saber o que dizer ao cliente, e os funcionários querem saber por que o sistema não abre.\n\nO erro que mais custa é o silêncio técnico. A equipe mergulha na investigação e não comunica nada por horas, e o vácuo é preenchido por boato. Comunicar de hora em hora, mesmo que para dizer que ainda não há conclusão, mantém a confiança e evita decisões apressadas tomadas por quem está no escuro.\n\nO segundo erro é o oposto: afirmar cedo demais. Dizer que não houve vazamento antes de ter olhado é o tipo de frase que precisa ser desmentida depois, e desmentido custa mais que demora. A linguagem correta separa o que se sabe do que se investiga.",
                },
                {
                    type: "table",
                    value: '[["Público","O que precisa saber","Ritmo"],["Direção","Impacto, prazo e decisão necessária","Frequente, mesmo sem novidade"],["Jurídico","Se há dado pessoal envolvido","Cedo, assim que houver indício"],["Atendimento","O que dizer a quem perguntar","Antes de o cliente perguntar"],["Funcionários","O que muda no trabalho deles","Assim que a operação for afetada"],["Reguladores","O que a lei exige e no prazo","Conforme a norma aplicável"]]',
                },
                {
                    type: "text",
                    value: "# Canal alternativo e a hipótese incômoda\n\nExiste um detalhe operacional que só se aprende doendo: se o correio corporativo pode estar comprometido, coordenar o incidente por ele é entregar o plano ao invasor. Há casos documentados de operadores lendo a conversa da equipe de resposta e se antecipando a cada movimento.\n\nPor isso o plano precisa prever um canal alternativo, fora do ambiente afetado, combinado antes e conhecido por todos. Combinar isso durante o incidente é tarde, porque o meio que você usaria para combinar é justamente o suspeito.\n\nUm último cuidado, sobre a comunicação para fora. No Brasil, incidente com dado pessoal aciona obrigações previstas na lei geral de proteção de dados, incluindo comunicação à autoridade e, em certos casos, aos titulares. Quem decide isso é o jurídico com a direção, mas quem os aciona a tempo costuma ser a equipe técnica, e demorar a acionar transforma um problema de segurança em um problema regulatório.",
                },
                {
                    type: "quote",
                    value: "Se o correio pode estar comprometido, coordenar o incidente por ele é entregar o plano ao invasor. O canal alternativo se combina antes, nunca durante.",
                },
            ],
            questions: [
                {
                    statement: "Qual erro de comunicação mais custa durante um incidente?",
                    difficulty: "facil",
                    options: [
                        { text: "O silêncio técnico, que é preenchido por boato", isCorrect: true },
                        { text: "O excesso de detalhe enviado à direção", isCorrect: false },
                        { text: "O uso de linguagem simples com o jurídico", isCorrect: false },
                        { text: "A comunicação antecipada ao atendimento", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que afirmar cedo que não houve vazamento é arriscado?",
                    difficulty: "medio",
                    options: [
                        { text: "Desmentido depois custa mais que a demora", isCorrect: true },
                        { text: "A afirmação tem valor legal e não pode mudar", isCorrect: false },
                        { text: "A equipe perde acesso aos dados para conferir", isCorrect: false },
                        { text: "O regulador exige silêncio até o encerramento", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que o incidente não deve ser coordenado pelo correio corporativo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele pode estar comprometido e o invasor ler tudo",
                            isCorrect: true,
                        },
                        {
                            text: "Ele não guarda histórico suficiente das mensagens",
                            isCorrect: false,
                        },
                        {
                            text: "Ele fica indisponível durante a contenção da rede",
                            isCorrect: false,
                        },
                        {
                            text: "Ele não permite incluir pessoas de fora da empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o canal alternativo precisa ser combinado antes?",
                    difficulty: "dificil",
                    options: [
                        { text: "O meio usado para combinar seria o suspeito", isCorrect: true },
                        {
                            text: "A configuração leva vários dias para funcionar",
                            isCorrect: false,
                        },
                        {
                            text: "A ferramenta exige contrato assinado previamente",
                            isCorrect: false,
                        },
                        { text: "Os contatos mudam com frequência na empresa", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual é o papel da equipe técnica nas obrigações legais do incidente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Acionar jurídico e direção a tempo de decidirem",
                            isCorrect: true,
                        },
                        { text: "Notificar diretamente a autoridade competente", isCorrect: false },
                        { text: "Definir se o caso precisa ser comunicado", isCorrect: false },
                        { text: "Redigir o comunicado enviado aos titulares", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Pós-incidente e lição aprendida",
            blocks: [
                {
                    type: "text",
                    value: "# A fase que quase todo mundo pula\n\nDepois que a operação volta, a vontade coletiva é esquecer. É justamente aí que está o maior retorno do incidente, porque ele revelou de graça, ainda que dolorosamente, onde as defesas falharam de verdade.\n\nA reunião de lições aprendidas precisa acontecer perto do fim, com todos que participaram, e responder quatro perguntas. O que aconteceu, em linha do tempo. O que funcionou. O que não funcionou. E o que muda a partir de agora, com dono e prazo.\n\nO item que separa a reunião útil da inútil é o último. Reunião sem ação registrada, com responsável e data, é desabafo coletivo. Duas ações concretas que serão realmente feitas valem mais que quinze recomendações genéricas que ninguém acompanhará.",
                },
                {
                    type: "table",
                    value: '[["Pergunta","O que buscar","Cuidado"],["O que aconteceu","Linha do tempo com horários","Não confundir suposição com fato"],["O que funcionou","O que ajudou de verdade","Registrar, para não perder ao mudar"],["O que não funcionou","Falha de processo, dado ou decisão","Focar no sistema, não na pessoa"],["O que muda","Ação, dono e prazo","Poucas ações reais, não uma lista"]]',
                },
                {
                    type: "text",
                    value: "# Sem culpa, e isso não é frouxidão\n\nA cultura da reunião determina a qualidade da informação. Se o clima for de procurar culpado, as pessoas omitem, e você perde exatamente o detalhe que explicaria a falha. Analisar sem culpa não significa não haver responsabilidade; significa perguntar por que a ação errada pareceu certa naquele momento.\n\nQuase sempre a resposta aponta para o sistema, não para a pessoa. O alerta não tinha contexto suficiente. O procedimento não existia. A ferramenta apresentava a informação de forma confusa. A pessoa estava no quarto turno seguido. Todas essas causas são corrigíveis; culpa não é.\n\nFecha o módulo o elo com o resto da trilha: cada incidente deve sair com detecção nova, lacuna de coleta mapeada e procedimento ajustado. É assim que a operação melhora de verdade, transformando prejuízo em capacidade, e é isso que separa a equipe que amadurece da que apenas envelhece.",
                },
                {
                    type: "quote",
                    value: "Analisar sem culpa não é frouxidão: é perguntar por que a ação errada pareceu certa naquele momento. A resposta quase sempre aponta o sistema, e sistema se conserta.",
                },
            ],
            questions: [
                {
                    statement: "Por que a fase de lições aprendidas é a mais pulada?",
                    difficulty: "facil",
                    options: [
                        { text: "Depois da volta, a vontade coletiva é esquecer", isCorrect: true },
                        { text: "Ela exige a presença de auditoria externa", isCorrect: false },
                        { text: "Ela só pode ocorrer meses após o encerramento", isCorrect: false },
                        {
                            text: "Ela depende de relatório do fornecedor da ferramenta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual item separa a reunião de lições útil da inútil?",
                    difficulty: "medio",
                    options: [
                        { text: "Ação registrada com dono e prazo definidos", isCorrect: true },
                        { text: "Presença de todos os níveis da hierarquia", isCorrect: false },
                        { text: "Linha do tempo detalhada minuto a minuto", isCorrect: false },
                        { text: "Relatório formal enviado para a direção", isCorrect: false },
                    ],
                },
                {
                    statement: "O que significa analisar sem culpa?",
                    difficulty: "medio",
                    options: [
                        { text: "Perguntar por que a ação errada pareceu certa", isCorrect: true },
                        { text: "Evitar registrar quem tomou cada decisão", isCorrect: false },
                        { text: "Encerrar o caso sem apontar nenhuma falha", isCorrect: false },
                        { text: "Deixar a apuração de responsabilidade ao RH", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que essa cultura melhora a qualidade da análise?",
                    difficulty: "dificil",
                    options: [
                        { text: "Com clima de culpa as pessoas omitem detalhes", isCorrect: true },
                        { text: "Sem culpa a reunião termina bem mais rápido", isCorrect: false },
                        { text: "A ausência de culpa é exigida pela norma", isCorrect: false },
                        {
                            text: "Culpados identificados atrasam as ações corretivas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Com o que cada incidente deve terminar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Detecção nova, lacuna mapeada e procedimento ajustado",
                            isCorrect: true,
                        },
                        {
                            text: "Relatório assinado, indicador atualizado e reunião feita",
                            isCorrect: false,
                        },
                        {
                            text: "Ferramenta contratada, regra ativada e time treinado",
                            isCorrect: false,
                        },
                        {
                            text: "Backup revisado, senha trocada e sistema reinstalado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Caça a ameaças",
    aulas: [
        {
            titulo: "O que é caça a ameaças",
            blocks: [
                {
                    type: "text",
                    value: "# Procurar sem que nada tenha tocado o alarme\n\nCaça a ameaças, ou threat hunting, é a busca ativa por atividade maliciosa que as detecções existentes não pegaram. A diferença em relação à triagem é a direção do trabalho: na triagem o alerta chama você, na caça você vai atrás sem alerta nenhum.\n\nA justificativa é direta. Toda regra detecta o que alguém previu, e o invasor não tem obrigação de fazer o que foi previsto. Se você só reage a alerta, sua visibilidade é exatamente do tamanho da sua imaginação passada, e é por isso que operações maduras reservam tempo para caçar.\n\nDois mal-entendidos vale desfazer. Caça não é ficar olhando painel esperando algo estranho aparecer, isso é monitoramento passivo. E caça não é privilégio de time grande: uma hora por semana com hipótese clara já produz resultado, e frequentemente o primeiro achado é uma lacuna de coleta em vez de um invasor.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Triagem","Caça"],["Origem","O alerta chama você","Você formula a pergunta"],["Insumo","Regra que disparou","Hipótese sobre comportamento"],["Sucesso","Decidir certo e rápido","Achar o que ninguém viu"],["Resultado frequente","Caso encerrado","Detecção nova ou lacuna encontrada"],["Ritmo","Contínuo, por turno","Reservado, em blocos de tempo"]]',
                },
                {
                    type: "text",
                    value: "# O resultado que quase ninguém espera\n\nQuem começa a caçar imagina que o sucesso é encontrar um invasor. Na prática, a maioria das caçadas termina sem invasor nenhum, e mesmo assim entrega valor. Os achados típicos são outros e igualmente úteis.\n\nO mais comum é a lacuna de visibilidade: você formula a pergunta, vai buscar o dado e descobre que ele não existe. Isso vira item de trabalho concreto. O segundo é a higiene: contas antigas ativas, serviços expostos sem necessidade, permissões amplas herdadas. Nada disso é ataque, e tudo isso é caminho para um.\n\nO terceiro achado é o mais valioso a longo prazo: comportamento normal do ambiente que você não conhecia. Cada caçada ensina o que é rotina naquela empresa, e esse conhecimento melhora a triagem de todo mundo. Por isso caçada sem invasor não é caçada perdida, desde que o aprendizado seja registrado.",
                },
                {
                    type: "quote",
                    value: "Se você só reage a alerta, sua visibilidade tem exatamente o tamanho da sua imaginação passada. Caçar é a forma de olhar além do que alguém já previu.",
                },
            ],
            questions: [
                {
                    statement: "O que diferencia a caça a ameaças da triagem?",
                    difficulty: "facil",
                    options: [
                        { text: "Na caça você vai atrás sem nenhum alerta", isCorrect: true },
                        { text: "Na caça o alerta chega com prioridade alta", isCorrect: false },
                        { text: "Na caça só o nível 3 pode participar", isCorrect: false },
                        { text: "Na caça usa-se ferramenta ofensiva própria", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que reagir apenas a alertas é insuficiente?",
                    difficulty: "facil",
                    options: [
                        { text: "A regra detecta só o que alguém previu antes", isCorrect: true },
                        { text: "Os alertas chegam sempre com atraso de horas", isCorrect: false },
                        { text: "As ferramentas limitam o número de regras", isCorrect: false },
                        { text: "O volume de alertas cresce a cada semana", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o achado mais comum de uma caçada?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma lacuna de visibilidade na coleta", isCorrect: true },
                        { text: "Um invasor ativo dentro do ambiente", isCorrect: false },
                        { text: "Uma regra de detecção mal escrita", isCorrect: false },
                        { text: "Um alerta antigo fechado por engano", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que caçada sem invasor não é caçada perdida?",
                    difficulty: "medio",
                    options: [
                        { text: "Ela ensina o que é normal naquele ambiente", isCorrect: true },
                        { text: "Ela comprova que o ambiente está seguro", isCorrect: false },
                        { text: "Ela reduz o volume de alertas do dia seguinte", isCorrect: false },
                        { text: "Ela cumpre exigência periódica de auditoria", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que caça não é privilégio de equipe grande?",
                    difficulty: "dificil",
                    options: [
                        { text: "Uma hora semanal com hipótese clara já rende", isCorrect: true },
                        { text: "As ferramentas de caça são todas gratuitas", isCorrect: false },
                        { text: "A caça pode ser automatizada por completo", isCorrect: false },
                        { text: "Times pequenos têm ambientes mais simples", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Formulando uma hipótese",
            blocks: [
                {
                    type: "text",
                    value: "# Caçar sem hipótese é passear pelo log\n\nA diferença entre caça produtiva e tempo perdido é a hipótese. Uma hipótese boa é uma afirmação específica e verificável sobre o que poderia estar acontecendo, escrita antes de olhar o dado. Sem ela, o analista abre a ferramenta, olha coisas interessantes e sai três horas depois sem conclusão.\n\nUma hipótese útil tem três partes: o comportamento suposto, onde ele apareceria e o que confirmaria ou refutaria. Por exemplo, se alguém estivesse usando uma conta de serviço para movimentar entre servidores, eu veria logins interativos dessa conta, que normalmente só faz login de serviço.\n\nRepare que a hipótese já embute a definição do normal. Isso é proposital: escrever a hipótese obriga você a declarar o que espera, e boa parte do valor da caça está exatamente nesse exercício, porque frequentemente a suposição sobre o normal está errada e descobrir isso já muda a triagem.",
                },
                {
                    type: "table",
                    value: '[["Origem da hipótese","Exemplo","Força"],["Inteligência","Grupo do nosso setor usa tal técnica","Alta, contexto real"],["Incidente anterior","Aquilo pode ter deixado outros pontos","Alta, evidência local"],["Lacuna conhecida","Não temos detecção para persistência X","Média, dirigida"],["Anomalia observada","Aquele host mudou de comportamento","Média, exige cuidado"],["Curiosidade","Será que alguém faz Y por aqui","Baixa, mas às vezes rende"]]',
                },
                {
                    type: "text",
                    value: "# Um método simples que cabe numa hora\n\nO ciclo prático tem cinco passos e serve para qualquer nível de maturidade. Escreva a hipótese. Defina o dado que a testa. Execute a consulta. Analise o resultado separando o esperado do inesperado. E registre o que aprendeu, inclusive quando a resposta for nada encontrado.\n\nO passo mais negligenciado é o último. Sem registro, a mesma caçada é repetida meses depois por outra pessoa, e o conhecimento sobre o normal do ambiente não se acumula. Um documento simples, com hipótese, consulta usada e conclusão, transforma esforço individual em capacidade da equipe.\n\nUm cuidado analítico fecha a aula: hipótese não confirmada não prova ausência. Não achar movimentação lateral por conta de serviço significa que você não achou com aquela consulta, naquele período, naquela fonte. Escrever isso com precisão evita a falsa segurança de concluir que não há nada.",
                },
                {
                    type: "quote",
                    value: "Escrever a hipótese obriga você a declarar o que considera normal. Descobrir que essa suposição estava errada já paga a caçada, mesmo sem invasor nenhum.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza uma boa hipótese de caça?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Afirmação específica e verificável, escrita antes",
                            isCorrect: true,
                        },
                        {
                            text: "Pergunta ampla que permite explorar o log todo",
                            isCorrect: false,
                        },
                        { text: "Suspeita levantada durante a análise do dado", isCorrect: false },
                        {
                            text: "Indicador recebido de uma fonte de inteligência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são as três partes de uma hipótese útil?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Comportamento suposto, onde apareceria e o que confirma",
                            isCorrect: true,
                        },
                        {
                            text: "Técnica, grupo responsável e período analisado",
                            isCorrect: false,
                        },
                        {
                            text: "Fonte de dado, consulta escrita e resultado obtido",
                            isCorrect: false,
                        },
                        {
                            text: "Severidade, criticidade do ativo e prazo de resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual passo do ciclo de caça é o mais negligenciado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Registrar o aprendizado, inclusive quando nada é achado",
                            isCorrect: true,
                        },
                        {
                            text: "Executar a consulta escrita na plataforma disponível",
                            isCorrect: false,
                        },
                        { text: "Definir qual fonte de dado testa a hipótese", isCorrect: false },
                        { text: "Separar o resultado esperado do inesperado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual origem de hipótese costuma ter mais força?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Inteligência sobre técnicas usadas no seu setor",
                            isCorrect: true,
                        },
                        { text: "Curiosidade sobre um comportamento qualquer", isCorrect: false },
                        { text: "Anomalia percebida por acaso num painel", isCorrect: false },
                        { text: "Sugestão padrão que veio com a ferramenta", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que hipótese não confirmada não prova ausência?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Você não achou naquela consulta, fonte e período",
                            isCorrect: true,
                        },
                        { text: "As consultas de caça têm precisão limitada", isCorrect: false },
                        { text: "O invasor pode ter apagado o registro depois", isCorrect: false },
                        {
                            text: "A hipótese precisa ser testada por duas pessoas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Caçando com o ATT&CK",
            blocks: [
                {
                    type: "text",
                    value: "# Um catálogo de hipóteses prontas\n\nA dificuldade mais comum de quem começa a caçar é não saber o que procurar. O catálogo de técnicas resolve isso na prática, porque cada técnica pode ser lida como uma hipótese pronta: alguém poderia estar fazendo isso aqui, e se estivesse, apareceria em tal fonte.\n\nO caminho que funciona é escolher técnicas por relevância, não por ordem de lista. Comece pelas que aparecem em campanhas contra o seu setor, pelas que a sua análise de cobertura marcou como sem detecção e pelas que atingiriam ativos críticos.\n\nEscolhida a técnica, a página dela já entrega o que você precisa: a descrição do comportamento vira hipótese, a seção de detecção indica a fonte, e os exemplos de procedimento dão variações concretas para testar. É a forma mais barata de sair do zero em caça.",
                },
                {
                    type: "table",
                    value: '[["Tática","Hipótese que ela sugere","Fonte que testa"],["Persistência","Alguém criou tarefa ou serviço fora do padrão","Inventário e criação de processo"],["Escalonamento","Conta comum ganhou privilégio recentemente","Alteração de grupo e autenticação"],["Movimentação","Máquinas que nunca se falaram passaram a falar","Conexões internas"],["Comando e controle","Alguma máquina conversa em intervalo regular","Rede e DNS"],["Exfiltração","Volume de saída acima do normal daquele host","Metadados de tráfego"]]',
                },
                {
                    type: "text",
                    value: "# Comparar contra o normal, não contra uma lista\n\nA técnica de caça mais produtiva não procura o que é ruim, procura o que é raro. Em ambiente corporativo, atividade legítima é repetitiva: os mesmos programas, nas mesmas máquinas, nos mesmos horários. O invasor, mesmo usando ferramentas legítimas, produz combinações incomuns.\n\nNa prática isso vira uma consulta de contagem: agrupe por alguma dimensão, ordene do menos frequente para o mais frequente e olhe a cauda. Programas executados em uma única máquina do parque inteiro, contas que fizeram login em um único servidor, domínios consultados por um único host. A cauda rara é onde vale gastar os olhos.\n\nEssa abordagem tem uma vantagem grande sobre listas de indicadores: ela não depende de alguém já ter visto aquela ameaça antes. E tem uma armadilha honesta, que é confundir raro com malicioso. Muita coisa rara é apenas incomum, e o trabalho de caça é justamente separar as duas com contexto.",
                },
                {
                    type: "quote",
                    value: "Não procure o que é ruim, procure o que é raro. Atividade legítima em empresa é repetitiva, e a cauda rara é onde vale gastar os olhos.",
                },
            ],
            questions: [
                {
                    statement: "Como o catálogo de técnicas ajuda quem começa a caçar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cada técnica pode ser lida como hipótese pronta",
                            isCorrect: true,
                        },
                        {
                            text: "Ele lista os indicadores atualizados por semana",
                            isCorrect: false,
                        },
                        { text: "Ele indica qual ferramenta comprar para caçar", isCorrect: false },
                        { text: "Ele define a ordem em que caçar cada tática", isCorrect: false },
                    ],
                },
                {
                    statement: "Como escolher quais técnicas caçar primeiro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Por relevância ao setor, cobertura e ativos críticos",
                            isCorrect: true,
                        },
                        {
                            text: "Pela ordem em que aparecem listadas no catálogo",
                            isCorrect: false,
                        },
                        { text: "Pelas que têm mais exemplos de procedimento", isCorrect: false },
                        { text: "Pelas que a ferramenta já traz configuradas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual abordagem de caça costuma ser a mais produtiva?",
                    difficulty: "medio",
                    options: [
                        { text: "Procurar o que é raro em vez do que é ruim", isCorrect: true },
                        { text: "Comparar tudo contra listas de indicadores", isCorrect: false },
                        { text: "Revisar os alertas fechados no último mês", isCorrect: false },
                        { text: "Executar as regras do fabricante manualmente", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que essa abordagem funciona mesmo contra ameaça desconhecida?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Não depende de alguém já ter visto aquilo antes",
                            isCorrect: true,
                        },
                        { text: "Ela analisa o conteúdo de todos os arquivos", isCorrect: false },
                        {
                            text: "Ela usa inteligência artificial para classificar",
                            isCorrect: false,
                        },
                        {
                            text: "Ela compara com o comportamento de outras empresas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a armadilha da caça pelo que é raro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Confundir raro com malicioso sem olhar contexto",
                            isCorrect: true,
                        },
                        { text: "Gerar volume alto demais para a plataforma", isCorrect: false },
                        { text: "Depender de retenção maior que a disponível", isCorrect: false },
                        {
                            text: "Exigir acesso administrativo a todas as máquinas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Do achado à detecção permanente",
            blocks: [
                {
                    type: "text",
                    value: "# Caçar a mesma coisa duas vezes é desperdício\n\nO valor de uma caçada só se realiza quando o achado vira algo permanente. Se você encontrou um comportamento hoje e não transformou isso em detecção, na próxima vez vai precisar caçar de novo, e talvez não tenha tempo.\n\nA regra prática é: toda caçada bem-sucedida termina com uma de três coisas. Uma detecção nova, quando o comportamento é detectável e vale alertar. Uma mudança no ambiente, quando dá para eliminar a possibilidade em vez de vigiá-la. Ou um item de coleta, quando faltou dado para concluir.\n\nEsse é o ciclo que faz a operação amadurecer. A caça encontra o que a detecção não pegou, a detecção absorve o que a caça encontrou, e a caça segue para a próxima fronteira. Sem essa transferência, a equipe fica caçando eternamente os mesmos comportamentos.",
                },
                {
                    type: "table",
                    value: '[["Achado","Destino certo","Por quê"],["Comportamento malicioso detectável","Detecção nova","Vale alertar automaticamente"],["Configuração perigosa","Mudança no ambiente","Melhor eliminar que vigiar"],["Faltou dado para concluir","Item de coleta","A lacuna vai voltar a atrapalhar"],["Comportamento legítimo incomum","Registro do normal","Acelera triagens futuras"],["Falso alarme da hipótese","Registro do que foi descartado","Evita repetir a mesma caçada"]]',
                },
                {
                    type: "text",
                    value: "# Nem tudo que se acha vira alerta\n\nUm julgamento importante: encontrar um comportamento não significa que ele deve gerar alerta. Se ele acontece cem vezes por dia de forma legítima, transformá-lo em alerta cria justamente o ruído que este curso passou seis módulos combatendo.\n\nNesses casos o destino certo é outro. Pode virar um sinal de baixa prioridade que alimenta futuras caçadas em vez de acordar o plantão. Pode virar um enriquecimento, um campo de contexto que aparece em outros alertas. Ou pode virar simplesmente conhecimento registrado sobre o normal do ambiente.\n\nA pergunta que decide é a mesma do módulo de engenharia de detecção: o que o analista faria ao receber isso? Se a resposta for olhar e fechar, aquilo não é alerta, é contexto. Fazer essa distinção bem é o que impede que um programa de caça bem-intencionado termine afogando a operação que ele deveria fortalecer.",
                },
                {
                    type: "quote",
                    value: "Nem todo achado vira alerta. Se a resposta a receber aquilo for olhar e fechar, aquilo não é alerta, é contexto, e o lugar dele é dentro de outro alerta.",
                },
            ],
            questions: [
                {
                    statement: "Com o que uma caçada bem-sucedida deve terminar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Detecção nova, mudança no ambiente ou item de coleta",
                            isCorrect: true,
                        },
                        {
                            text: "Relatório assinado, indicador novo e reunião marcada",
                            isCorrect: false,
                        },
                        {
                            text: "Alerta configurado, exceção criada e regra revisada",
                            isCorrect: false,
                        },
                        {
                            text: "Máquina isolada, credencial trocada e caso encerrado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que transferir o achado para a detecção é essencial?",
                    difficulty: "medio",
                    options: [
                        { text: "Senão a equipe caça eternamente a mesma coisa", isCorrect: true },
                        { text: "Senão a plataforma descarta o dado analisado", isCorrect: false },
                        { text: "Senão o achado não pode ser documentado", isCorrect: false },
                        { text: "Senão a auditoria não valida a atividade", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Quando uma configuração perigosa é encontrada, qual é o destino certo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mudar o ambiente, porque eliminar é melhor que vigiar",
                            isCorrect: true,
                        },
                        {
                            text: "Criar detecção para avisar sempre que ela for usada",
                            isCorrect: false,
                        },
                        { text: "Registrar como conhecimento sobre o normal", isCorrect: false },
                        { text: "Abrir item de coleta para a fonte faltante", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que nem todo comportamento encontrado deve virar alerta?",
                    difficulty: "dificil",
                    options: [
                        { text: "Se for frequente e legítimo, ele só gera ruído", isCorrect: true },
                        {
                            text: "As plataformas limitam o número de regras ativas",
                            isCorrect: false,
                        },
                        { text: "Alertas novos exigem aprovação da direção", isCorrect: false },
                        { text: "O comportamento pode mudar na semana seguinte", isCorrect: false },
                    ],
                },
                {
                    statement: "Que pergunta decide se um achado vira alerta ou contexto?",
                    difficulty: "medio",
                    options: [
                        { text: "O que o analista faria ao receber isso", isCorrect: true },
                        { text: "Quantas vezes aquilo ocorreu no último mês", isCorrect: false },
                        { text: "Qual técnica do catálogo aquilo representa", isCorrect: false },
                        { text: "Qual fonte de dado registrou o comportamento", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "O que você leva desta trilha",
            blocks: [
                {
                    type: "text",
                    value: "# De rastro de ataque a ofício de defesa\n\nA trilha anterior te deu o lado do adversário e terminou listando o rastro de cada etapa. Esta pegou esses rastros e transformou em trabalho: coletar o dado que os contém, escrever a regra que os encontra, triar o que ela dispara, responder quando é real e caçar o que ela não pegou.\n\nO fio condutor foi a diferença entre ter ferramenta e ter operação. Ferramenta qualquer empresa compra. Operação é o conjunto de decisões que você aprendeu a tomar: que fonte integrar primeiro, quando uma regra merece existir, o que perguntar diante de um alerta, quando conter e quando mapear mais, e o que fazer com um achado.\n\nSe você levar uma única ideia daqui, que seja a de que atenção humana é o recurso mais escasso da defesa. Quase toda boa prática desta trilha, do ajuste de regra ao contexto embutido no alerta, existe para proteger esse recurso.",
                },
                {
                    type: "table",
                    value: '[["Módulo","O que você sabe fazer agora"],["O centro de operações","Entender papéis, medir sem se enganar e reconhecer ruído"],["Dados","Escolher fontes, normalizar, enriquecer e definir retenção"],["SIEM","Consultar, correlacionar e conhecer os limites da ferramenta"],["Engenharia de detecção","Transformar comportamento em regra testada e explicável"],["Triagem","Decidir com método e registrar de forma útil"],["Resposta","Conter sem destruir evidência, erradicar e comunicar"],["Caça","Formular hipótese e converter achado em capacidade"]]',
                },
                {
                    type: "text",
                    value: "# Como continuar a partir daqui\n\nA prática vale mais que leitura extra, e dá para praticar sem emprego na área. Monte um laboratório simples com duas máquinas virtuais, ligue coleta de eventos, execute ações administrativas comuns e tente escrever a consulta que as encontra. Isso treina exatamente o raciocínio que uma entrevista cobra.\n\nUm exercício que rende muito: pegue uma técnica do catálogo, descreva o comportamento em português, decida que fonte a registraria, escreva a consulta e teste. Repetir isso dez vezes ensina mais do que qualquer curso de ferramenta específica.\n\nA próxima trilha do seu roadmap muda o ângulo: em vez de defender a rede e os sistemas, você vai olhar para dentro das aplicações, onde as falhas nascem do código e da configuração. É o mesmo raciocínio, aplicado a outra superfície, e completa o repertório de quem quer atuar em segurança de verdade.",
                },
                {
                    type: "quote",
                    value: "Atenção humana é o recurso mais escasso da defesa. Quase tudo que você aprendeu aqui existe para gastá-la no lugar certo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o fio condutor desta trilha?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A diferença entre ter ferramenta e ter operação",
                            isCorrect: true,
                        },
                        {
                            text: "A superioridade de uma plataforma sobre as outras",
                            isCorrect: false,
                        },
                        { text: "A necessidade de automatizar toda a resposta", isCorrect: false },
                        { text: "A importância de certificação para a carreira", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual recurso a trilha aponta como o mais escasso da defesa?",
                    difficulty: "medio",
                    options: [
                        { text: "A atenção humana da equipe", isCorrect: true },
                        { text: "O orçamento de ferramentas", isCorrect: false },
                        { text: "O espaço de armazenamento de log", isCorrect: false },
                        { text: "O tempo de retenção contratado", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Que exercício a trilha sugere para treinar sem estar empregado na área?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Laboratório com coleta e consultas escritas por você",
                            isCorrect: true,
                        },
                        { text: "Leitura semanal de relatórios de inteligência", isCorrect: false },
                        { text: "Estudo do manual da plataforma mais usada", isCorrect: false },
                        {
                            text: "Participação em competições de captura de bandeira",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual sequência resume o que a trilha ensinou a fazer com um rastro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Coletar, detectar, triar, responder e caçar o resto",
                            isCorrect: true,
                        },
                        {
                            text: "Bloquear, isolar, limpar, restaurar e documentar",
                            isCorrect: false,
                        },
                        {
                            text: "Inventariar, corrigir, auditar, medir e relatar",
                            isCorrect: false,
                        },
                        {
                            text: "Alertar, escalar, decidir, comunicar e encerrar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para onde a próxima trilha do roadmap aponta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para dentro das aplicações, onde a falha nasce do código",
                            isCorrect: true,
                        },
                        {
                            text: "Para a análise aprofundada de artefatos maliciosos reais",
                            isCorrect: false,
                        },
                        {
                            text: "Para a gestão de risco e conformidade regulatória",
                            isCorrect: false,
                        },
                        {
                            text: "Para a arquitetura de redes corporativas seguras",
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
