// Seed da trilha LLMs em Produção, estagio 8 do roadmap de Engenharia de IA.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-llms-em-producao.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "LLMs em Produção";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "O que separa o demo do produto: avaliação com golden set e LLM como juiz, observabilidade com tracing e alertas, custo e latência sob controle com cache e roteamento, segurança com guardrails e LGPD, o serviço no ar com filas, fallback e canário, fine-tuning com SFT, DPO e LoRA, e o checklist completo de produção aplicado num projeto final.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Avaliação: a régua do sistema",
    aulas: [
        {
            titulo: "Por que avaliar vem primeiro",
            blocks: [
                {
                    type: "text",
                    value: '# O abismo entre o demo e o produto\n\nO demo que impressionou a diretoria não prova nada sobre produção, e a razão é estrutural: no demo, VOCÊ escolhe os exemplos (e escolhe os que funcionam); em produção, o USUÁRIO escolhe, e ele escolhe os que você nunca imaginou. Sistemas com LLM são probabilísticos: a mesma mudança de prompt que melhora um caso piora outro, e ninguém enxerga isso olhando três exemplos na tela.\n\nO teste de vibração (rodar meia dúzia de perguntas de cabeça e sentir que "ficou bom") funciona com 5 exemplos e falha com 500 usuários. O nome técnico do que ele não pega é REGRESSÃO SILENCIOSA: você troca o prompt, o caso que estava olhando melhora, e três casos que não estava olhando quebram. Sem uma suíte de avaliação, quem descobre é o cliente, semanas depois, e a essa altura ninguém lembra qual mudança causou o quê.',
                },
                {
                    type: "table",
                    value: '[["Aspecto","Demo","Produto"],["Quem escolhe os casos","Você (os que funcionam)","O usuário (todos, inclusive os raros)"],["Custo do erro","Constrangimento passageiro","Cliente perdido; dado errado agindo"],["Mudança de prompt","\\"parece que melhorou\\"","Medida contra um conjunto fixo"],["Modelo novo do provedor","Troca na empolgação","Passa pela suíte antes de subir"],["Meta","Impressionar uma vez","Ser confiável no percentil 95"]]',
                },
                {
                    type: "quote",
                    value: 'Em produção, a pergunta nunca é "o sistema acerta?". É "com que frequência, em quais categorias, e como você vai SABER quando começar a piorar?".',
                },
                {
                    type: "text",
                    value: '## Avaliação como alicerce, não como etapa final\n\nEsta trilha inteira se apoia neste módulo, e a ordem não é acidente: sem medição, otimizar custo (módulo 3) é chute, trocar de modelo (módulo 5) é roleta e fine-tuning (módulo 6) é ato de fé. Toda decisão técnica das próximas semanas termina na mesma pergunta: "a suíte diz que melhorou ou piorou?".\n\nO fluxo maduro tem nome: desenvolvimento guiado por avaliação (eval-driven development). Antes de mexer no prompt, escreva o caso de teste do comportamento desejado, como no TDD. Exemplo concreto: o provedor lança um modelo 40% mais barato e o time quer trocar hoje. O caminho profissional não é trocar nem esperar seis meses: é rodar a suíte com o modelo novo, comparar as duas colunas e decidir com números. Uma tarde de trabalho, e a decisão sai do achismo.',
                },
            ],
            questions: [
                {
                    statement:
                        "Por que o demo que impressiona não prova que o sistema está pronto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No demo você escolhe os exemplos; em produção, o usuário escolhe",
                            isCorrect: true,
                        },
                        {
                            text: "Porque demos rodam em hardware mais fraco que o de produção",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o provedor limita a qualidade fora do ambiente pago",
                            isCorrect: false,
                        },
                        {
                            text: "Porque usuários de demo são mais exigentes que os clientes reais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é uma regressão silenciosa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma mudança melhora o caso olhado e quebra outros sem ninguém notar",
                            isCorrect: true,
                        },
                        {
                            text: "Um erro de rede que derruba o serviço sem aparecer nos logs do dia",
                            isCorrect: false,
                        },
                        {
                            text: "A queda gradual de velocidade do modelo com o passar dos meses",
                            isCorrect: false,
                        },
                        {
                            text: "Um bug que só acontece quando o sistema está sem tráfego à noite",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o teste de vibração (conferir uns poucos casos de cabeça) não escala?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Poucos exemplos na cabeça não representam a variedade real dos usuários",
                            isCorrect: true,
                        },
                        {
                            text: "Porque testar manualmente é proibido em times de engenharia maduros",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o provedor cobra pelos testes feitos fora da suíte oficial",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a memória humana não guarda mais que três casos por vez",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na trilha, por que avaliação vem antes de custo, troca de modelo e fine-tuning?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem medir qualidade, qualquer otimização vira aposta às cegas",
                            isCorrect: true,
                        },
                        {
                            text: "Porque é a única etapa exigida por contrato pelos provedores",
                            isCorrect: false,
                        },
                        {
                            text: "Porque avaliar é mais barato que qualquer outra atividade do ciclo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque as outras etapas dependem de uma suíte já paga e auditada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O provedor lançou um modelo mais barato e o time quer trocar hoje. Qual é o caminho profissional?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Rodar a suíte de avaliação com o modelo novo e comparar antes de trocar",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar imediatamente, porque o preço menor sempre justifica a mudança",
                            isCorrect: false,
                        },
                        {
                            text: "Esperar seis meses até outras empresas testarem o modelo primeiro",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir ao provedor um relatório oficial e fazer a troca com base nele",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O golden set",
            blocks: [
                {
                    type: "text",
                    value: '# O conjunto dourado\n\nGolden set é a coleção FIXA de casos que representa o uso real do produto: cada caso tem a entrada (a pergunta, o documento, o pedido) e a saída esperada, que pode ser um texto exato ou um conjunto de critérios ("menciona o prazo de 7 dias", "não inventa política que não existe"). É o conjunto de testes do seu sistema probabilístico.\n\nDe onde vêm os casos: logs reais de produção (anonimizados), tíquetes de suporte que geraram reclamação, arestas inventadas de propósito (entrada vazia, outra língua, pergunta ambígua) e casos adversariais (tentativas de injection). Tamanho: comece com 20 a 50 casos bons e cresça com o produto; 50 casos variados valem mais que 500 redundantes, porque casos quase iguais medem o mesmo ponto e deixam as arestas descobertas.',
                },
                {
                    type: "table",
                    value: '[["Fonte","Exemplo","Papel no conjunto"],["Logs reais","Pergunta frequente de usuário","Representar o dia a dia"],["Tíquetes de suporte","Caso que virou reclamação","Garantir que o erro não volta"],["Arestas inventadas","Entrada vazia; língua diferente","Cobrir o raro antes de acontecer"],["Adversariais","Tentativa de injection no texto","Medir a resistência ao pior cenário"]]',
                },
                {
                    type: "quote",
                    value: "Todo bug de produção que você corrige sem transformar em caso do golden set é um bug que vai voltar sem ninguém perceber.",
                },
                {
                    type: "text",
                    value: "## Manutenção e contaminação\n\nO golden set é vivo: cada incidente novo vira caso, e casos obsoletos saem quando o produto muda de comportamento de propósito. Versione junto do código (o conjunto de hoje precisa ser comparável ao de ontem).\n\nDois cuidados clássicos. CONTAMINAÇÃO: se um caso aparece como exemplo few-shot dentro do prompt, ele não pode estar na avaliação, senão você está medindo memorização, não capacidade. E SAÍDA ESPERADA flexível: para texto livre, prefira critérios verificáveis a texto exato, porque duas respostas diferentes podem estar ambas corretas. A régua precisa aceitar isso sem virar frouxa.",
                },
            ],
            questions: [
                {
                    statement: "O que é o golden set?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um conjunto fixo de casos reais com saída ou critérios esperados",
                            isCorrect: true,
                        },
                        {
                            text: "O grupo dos melhores usuários pagantes da plataforma no mês",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de prompts secretos mantida pelo provedor da API",
                            isCorrect: false,
                        },
                        {
                            text: "Um ranking público de modelos publicado a cada trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a melhor fonte para os primeiros casos do golden set?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Logs reais de produção anonimizados e casos de suporte",
                            isCorrect: true,
                        },
                        {
                            text: "Exemplos gerados pelo próprio modelo que será avaliado",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntas aleatórias criadas por um gerador automático",
                            isCorrect: false,
                        },
                        {
                            text: "Os exemplos do site oficial de documentação do provedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que todo bug de produção deve virar caso do golden set?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para a correção ficar protegida contra regressões futuras",
                            isCorrect: true,
                        },
                        {
                            text: "Para o time de suporte fechar o tíquete mais rapidamente",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a lei de software exige registro formal de cada falha",
                            isCorrect: false,
                        },
                        {
                            text: "Para aumentar o tamanho do conjunto e parecer mais completo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é contaminação entre prompt e avaliação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Usar o mesmo caso como exemplo few-shot e como caso de teste",
                            isCorrect: true,
                        },
                        {
                            text: "Misturar casos de dois produtos diferentes na mesma suíte",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar dados pessoais sem anonimizar dentro do conjunto",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar a avaliação na mesma máquina que serve a produção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um golden set com 500 casos quase iguais é pior que um com 50 variados. Por quê?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Casos redundantes medem o mesmo ponto e deixam arestas sem cobertura",
                            isCorrect: true,
                        },
                        {
                            text: "Porque conjuntos grandes são proibidos nas ferramentas de avaliação",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os 500 casos custam mais e o custo alto invalida a medição",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a estatística só funciona para conjuntos menores que cem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Métricas objetivas",
            blocks: [
                {
                    type: "text",
                    value: '# Quando a régua é exata\n\nNem toda avaliação precisa de um juiz caro: saídas estruturadas têm métricas objetivas, determinísticas e gratuitas. Classificação (rota, intenção, sentimento): acurácia, precisão e recall por classe. Extração de campos (nota fiscal, currículo): exact match e F1 por campo. JSON estruturado: validação contra o schema mais asserções programáticas (campo presente, valor no intervalo, soma bate). Texto com fatos verificáveis: asserções de conteúdo ("contém o número do pedido", "não contém o termo proibido").\n\nA regra de ouro da engenharia de avaliação: ESTRUTURE o que puder (peça JSON, peça classes) e avalie objetivamente o estruturado. O juiz de LLM fica reservado para o que sobrar.',
                },
                {
                    type: "code",
                    value: '# Asserções objetivas sobre a saída estruturada\nresultado = extrair_pedido(texto_do_cliente)\n\nassert resultado["numero_pedido"] == caso["esperado"]["numero_pedido"]\nassert resultado["motivo"] in MOTIVOS_VALIDOS\nassert 0 <= resultado["valor_reembolso"] <= caso["valor_maximo"]\n\n# Roda em milissegundos, custa zero, nunca muda de opinião.',
                },
                {
                    type: "table",
                    value: '[["Tipo de saída","Métrica","Custo por caso"],["Classe (rota; sentimento)","Acurácia; precisão e recall","Zero"],["Campos extraídos","Exact match; F1 por campo","Zero"],["JSON estruturado","Validação de schema e asserções","Zero"],["Texto livre","Precisa de juiz (próxima aula)","Tokens do juiz"]]',
                },
                {
                    type: "quote",
                    value: "A métrica objetiva roda em milissegundos, custa zero e nunca muda de opinião: use o juiz de LLM só onde ela não alcança.",
                },
                {
                    type: "text",
                    value: "## O limite honesto\n\nTexto livre de verdade (um resumo, uma resposta de suporte, uma explicação) não tem exact match possível: qualidade ali é multidimensional (correção, tom, completude, concisão), e duas respostas diferentes podem ser ambas boas. Forçar régua exata em texto livre gera medição falsa.\n\nNa prática, os bons sistemas são MISTOS: a resposta tem uma parte estruturada (o JSON da ação, os campos extraídos) e uma parte livre (a explicação ao usuário). Avalie cada parte com a régua certa: schema e asserções na estruturada, juiz com rubrica na livre. É a estratégia que a próxima aula completa.",
                },
            ],
            questions: [
                {
                    statement: "Qual métrica serve para um classificador de intenção?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Acurácia, com precisão e recall por classe",
                            isCorrect: true,
                        },
                        {
                            text: "A contagem de tokens da resposta gerada",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo de treino do modelo por rodada",
                            isCorrect: false,
                        },
                        {
                            text: "A nota de um juiz LLM com rubrica longa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como avaliar uma saída JSON de forma barata?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Validar contra o schema e checar campos com asserções",
                            isCorrect: true,
                        },
                        {
                            text: "Pedir a outro modelo uma nota subjetiva de qualidade",
                            isCorrect: false,
                        },
                        {
                            text: "Imprimir o JSON e revisar manualmente linha por linha",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar o tamanho em bytes com a resposta de referência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que preferir métrica objetiva a juiz LLM sempre que possível?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Roda em milissegundos, custa zero e não tem viés de julgamento",
                            isCorrect: true,
                        },
                        {
                            text: "Porque juízes LLM são proibidos em avaliações formais de mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Porque métricas objetivas melhoram a qualidade do modelo avaliado",
                            isCorrect: false,
                        },
                        {
                            text: "Porque asserções detectam qualquer problema de tom e estilo no texto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde o exact match deixa de funcionar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Em texto livre, onde qualidade tem várias dimensões",
                            isCorrect: true,
                        },
                        {
                            text: "Em campos extraídos de documentos com data e valor",
                            isCorrect: false,
                        },
                        {
                            text: "Em saídas JSON validadas contra um schema fixo",
                            isCorrect: false,
                        },
                        {
                            text: "Em classificadores com poucas classes bem definidas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual a estratégia recomendada para um sistema com saída mista (JSON mais um campo de texto livre)?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Asserções e schema no estruturado; juiz apenas no campo livre",
                            isCorrect: true,
                        },
                        {
                            text: "Juiz LLM em tudo, para manter uma régua única e comparável",
                            isCorrect: false,
                        },
                        {
                            text: "Exact match em tudo, inclusive no texto livre da resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma métrica: saídas mistas não podem ser bem avaliadas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "LLM como juiz",
            blocks: [
                {
                    type: "text",
                    value: '# Julgando texto livre\n\nPara o que a régua exata não alcança, a técnica padrão do mercado é o LLM COMO JUIZ: um modelo capaz avalia a saída de outro seguindo uma RUBRICA explícita. A rubrica é o coração: critérios BINÁRIOS e verificáveis ("a resposta cita o prazo correto?", "o tom é profissional?", "inventou alguma política?") funcionam muito melhor que nota de 1 a 5, que vira ruído entre rodadas.\n\nJuízes têm vieses documentados e você precisa conhecê-los: viés de POSIÇÃO (em comparações A contra B, a ordem influencia o veredito; mitigação: julgar duas vezes com a ordem trocada), viés de VERBOSIDADE (respostas longas ganham da resposta certa; mitigação: critério explícito de concisão) e AUTO-PREFERÊNCIA (o modelo prefere o próprio estilo; mitigação: juiz de família diferente da do avaliado).',
                },
                {
                    type: "table",
                    value: '[["Viés do juiz","Sintoma","Mitigação"],["Posição","A primeira opção vence demais","Julgar duas vezes com ordem trocada"],["Verbosidade","Resposta longa ganha da correta","Critério de concisão na rubrica"],["Auto-preferência","Nota maior para o estilo do próprio modelo","Juiz de família diferente"],["Rubrica vaga","Notas inconsistentes entre rodadas","Critérios binários com exemplos"]]',
                },
                {
                    type: "quote",
                    value: "Juiz sem rubrica é teste de vibração automatizado: mais rápido e igualmente cego. A rubrica é o produto do seu trabalho; o juiz é só o estagiário que a aplica.",
                },
                {
                    type: "text",
                    value: "## Calibração e custo\n\nJuiz não se usa sem CALIBRAR: rotule 30 a 50 casos com humanos (o time, com a mesma rubrica), rode o juiz nos mesmos casos e meça a concordância. Concordância alta: o juiz está pronto para escalar. Baixa: o problema quase sempre é a rubrica ambígua; refine e repita. Sem esse passo, você tem um número que parece ciência e mede nada.\n\nJuiz custa tokens. Quando a suíte crescer, rode as métricas objetivas em tudo e o juiz numa amostra representativa, e guarde o veredito em cache para saídas idênticas. Avaliar 100 casos com juiz custa centavos e roda em minutos; uma regressão em produção custa clientes. A conta fecha fácil, mas só se o juiz for calibrado.",
                },
            ],
            questions: [
                {
                    statement: "O que é a técnica de LLM como juiz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um modelo avalia a saída de outro seguindo uma rubrica",
                            isCorrect: true,
                        },
                        {
                            text: "Dois modelos debatem entre si até concordarem numa resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Um tribunal de humanos revisa cada resposta do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor audita as respostas do cliente por contrato",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que preferir critérios binários a nota de 1 a 5?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sim ou não por critério dá menos ruído e mais consistência",
                            isCorrect: true,
                        },
                        {
                            text: "Porque notas de 1 a 5 custam cinco vezes mais tokens no juiz",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a escala numérica de notas é patenteada por uma big tech",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os modelos não conseguem gerar números de um dígito só",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o viés de posição e como mitigar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O juiz favorece uma ordem; julgue duas vezes com ordem trocada",
                            isCorrect: true,
                        },
                        {
                            text: "O juiz favorece respostas longas; corte o texto antes de julgar",
                            isCorrect: false,
                        },
                        {
                            text: "O juiz esquece o começo; use janelas de contexto bem maiores",
                            isCorrect: false,
                        },
                        {
                            text: "O juiz prefere o próprio estilo; esconda o nome do modelo dele",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como saber se o seu juiz LLM é confiável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Medir a concordância dele com rótulos humanos numa amostra",
                            isCorrect: true,
                        },
                        {
                            text: "Perguntar ao próprio juiz o quanto ele confia nas notas dadas",
                            isCorrect: false,
                        },
                        {
                            text: "Conferir se as notas ficam altas na maioria absoluta dos casos",
                            isCorrect: false,
                        },
                        {
                            text: "Usar o modelo mais caro e confiar por definição na capacidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A suíte cresceu e o custo do juiz começou a pesar. O que fazer sem perder o sinal?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Avaliar em amostra representativa e manter objetivas no restante",
                            isCorrect: true,
                        },
                        {
                            text: "Abandonar o juiz e voltar para o teste manual de cada release",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzir a rubrica a um único critério para economizar tokens",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o juiz por um modelo minúsculo sem calibração nenhuma",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A suíte no ciclo de desenvolvimento",
            blocks: [
                {
                    type: "text",
                    value: "# A suíte como portão\n\nQuando rodar a suíte? A resposta é a mesma do CI de código: a CADA MUDANÇA que afeta o comportamento. Mudou o prompt do sistema? Suíte inteira (o efeito é imprevisível e espalhado). Trocou o modelo? Suíte inteira mais a coluna de custo. Mexeu no chunking do RAG? Comece pela categoria de casos que depende dos documentos. Corrigiu um bug? O caso novo do bug e os vizinhos.\n\nO relatório que importa não é a média: é o DIFF. Quais casos mudaram de estado, de passou para falhou e vice-versa? Uma melhora de 2% na média pode esconder uma queda de 20% numa categoria crítica, e o relatório que só mostra a média é cúmplice da regressão.",
                },
                {
                    type: "table",
                    value: '[["Mudança","O que rodar","Por quê"],["Prompt do sistema","Suíte inteira","Efeito imprevisível e espalhado"],["Troca de modelo","Suíte inteira mais custo","Comportamento e preço mudam juntos"],["Chunking ou embeddings do RAG","Categoria dependente de documentos","Efeito localizado primeiro"],["Correção de bug pontual","Caso novo e a vizinhança dele","Confirmar sem quebrar ao lado"]]',
                },
                {
                    type: "quote",
                    value: "A média sobe e uma categoria crítica afunda: relatório que só mostra a média é cúmplice da regressão.",
                },
                {
                    type: "text",
                    value: "## Go/no-go objetivo\n\nDeploy de prompt precisa de critério de aprovação combinado ANTES: por exemplo, nenhuma categoria pode cair mais que 2 pontos, e os casos marcados como críticos (segurança, dados de cliente) precisam de 100%. Sem limiar prévio, toda discussão de release vira negociação de opinião.\n\nO ciclo completo do desenvolvimento guiado por avaliação: um bug chega, vira caso, o caso reproduz o erro; você mexe no prompt até o caso passar; a suíte confirma que nada mais quebrou; o deploy sai com números. Prompt engineering sem suíte é tentativa e erro com memória curta; com suíte, cada ajuste vira conhecimento acumulado. É a diferença entre mexer no escuro e mexer com a luz acesa.",
                },
            ],
            questions: [
                {
                    statement: "Quando rodar a suíte de avaliação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A cada mudança de prompt, modelo ou pipeline, como um CI",
                            isCorrect: true,
                        },
                        {
                            text: "Somente uma vez por trimestre, no fechamento contábil",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas quando algum usuário reclamar duas vezes seguidas",
                            isCorrect: false,
                        },
                        {
                            text: "Só antes de apresentações importantes para a diretoria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o diff de casos importa mais que a média geral?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A média pode subir escondendo queda numa categoria crítica",
                            isCorrect: true,
                        },
                        {
                            text: "A média é um número quebrado e difícil de ler no relatório",
                            isCorrect: false,
                        },
                        {
                            text: "O diff é o formato exigido pelos provedores nos contratos",
                            isCorrect: false,
                        },
                        {
                            text: "Porque médias só funcionam em conjuntos com mais de mil casos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza o desenvolvimento guiado por avaliação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O caso de teste nasce antes do ajuste de prompt, como no TDD",
                            isCorrect: true,
                        },
                        {
                            text: "O prompt é escrito pelo modelo juiz antes do desenvolvedor",
                            isCorrect: false,
                        },
                        {
                            text: "Os testes são gerados depois do deploy para documentar o sistema",
                            isCorrect: false,
                        },
                        {
                            text: "A avaliação substitui o code review humano em todos os PRs",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Mudou só o chunking do RAG. Por onde começar a avaliação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pela categoria de casos que dependem dos documentos",
                            isCorrect: true,
                        },
                        {
                            text: "Pelo custo total do serviço nos últimos noventa dias",
                            isCorrect: false,
                        },
                        {
                            text: "Pelos casos adversariais de segurança da aplicação",
                            isCorrect: false,
                        },
                        {
                            text: "Pela latência média do provedor no horário de pico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como definir um go/no-go objetivo para o deploy de um prompt novo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Limiares por categoria e casos críticos obrigatórios em 100%",
                            isCorrect: true,
                        },
                        {
                            text: "Aprovação por votação simples entre os devs do time no chat",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer melhora na média geral já libera o deploy na hora",
                            isCorrect: false,
                        },
                        {
                            text: "A decisão fica com o provedor, que conhece o modelo melhor",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Observabilidade",
    aulas: [
        {
            titulo: "O que registrar de cada chamada",
            blocks: [
                {
                    type: "text",
                    value: '# A caixa-preta aberta\n\nSistemas com LLM falham de um jeito novo: a resposta ruim não lança exceção, não gera stack trace, não aparece em lugar nenhum. O usuário reclama "ontem ele respondeu errado" e, sem registro, isso é irreproduzível: você não sabe qual prompt foi enviado, qual modelo estava no ar, o que o RAG recuperou.\n\nO registro mínimo por chamada: o prompt COMPLETO (system e mensagens), a resposta, o modelo e a versão do prompt em uso, os parâmetros, os tokens (entrada, saída e quanto veio de cache), a latência total e o TTFT, o custo calculado e os IDs de usuário e sessão. Log de aplicação tradicional registra o que o código fez; aqui você registra também o que o modelo LEU e DISSE, senão não há depuração possível.',
                },
                {
                    type: "code",
                    value: 'registro = {\n    "trace_id": "a91f...",\n    "usuario": "u_4812",\n    "modelo": "modelo-x-2026-05",\n    "versao_prompt": "suporte-v14",\n    "tokens": {"entrada": 2431, "saida": 388, "cache": 1900},\n    "latencia_ms": 2140,\n    "ttft_ms": 480,\n    "custo_brl": 0.0261,\n    "prompt": "...",   # completo, com PII mascarada\n    "resposta": "...",\n}',
                },
                {
                    type: "table",
                    value: '[["Campo","Para que serve"],["Prompt e resposta completos","Reproduzir e depurar o caso"],["Modelo e versão do prompt","Saber o que estava no ar naquela hora"],["Tokens e custo","A conta do módulo 3 fecha com dados"],["Latência total e TTFT","Alerta de degradação"],["IDs de usuário e sessão","Seguir o fio de uma reclamação"]]',
                },
                {
                    type: "quote",
                    value: "Reclamação sem registro é anedota. Com o prompt, a versão e a resposta guardados, ela vira um caso reproduzível com data e hora.",
                },
                {
                    type: "text",
                    value: "## Retenção, privacidade e custo do log\n\nPrompts carregam dado pessoal: o log herda as obrigações da LGPD (módulo 4). Prática mínima: mascarar PII no registro quando a depuração não precisa dela, restringir o acesso (nem todo mundo do time precisa ler conversas de cliente) e definir retenção (90 dias resolve a maioria das operações).\n\nPrompts são grandes e volume acumula: comprima, e para a cauda antiga guarde amostra em vez de tudo. Se o armazenamento explodir, corte pela retenção e pela amostragem do antigo, nunca pelo conteúdo do recente: o log de ontem íntegro vale mais que seis meses de metadados sem texto.",
                },
            ],
            questions: [
                {
                    statement: "Por que o log tradicional não basta para sistemas com LLM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Resposta ruim não gera erro: é preciso guardar prompt e saída",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o formato JSON dos logs não aceita texto de modelos",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os provedores proíbem registrar as respostas das APIs",
                            isCorrect: false,
                        },
                        {
                            text: "Porque logs tradicionais expiram em menos de vinte e quatro horas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais campos mínimos registrar por chamada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Prompt, resposta, modelo, tokens, latência, custo e versão",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas o horário e o código de status HTTP da requisição",
                            isCorrect: false,
                        },
                        {
                            text: "Somente a resposta final, para economizar armazenamento",
                            isCorrect: false,
                        },
                        {
                            text: "O hash do prompt, sem o texto, por regra de compliance",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que registrar a versão do prompt em cada chamada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para saber qual prompt estava no ar quando o caso aconteceu",
                            isCorrect: true,
                        },
                        {
                            text: "Para o provedor calcular o desconto de cache corretamente",
                            isCorrect: false,
                        },
                        {
                            text: "Para impedir que dois devs editem o prompt ao mesmo tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Para numerar os logs na ordem crescente de importância deles",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Prompts logados carregam dados pessoais. O que fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mascarar PII, restringir acesso e definir retenção",
                            isCorrect: true,
                        },
                        {
                            text: "Desligar os logs de vez para eliminar qualquer risco legal",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar tudo para sempre, porque log não é banco de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar os prompts por resumos gerados por outro modelo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O armazenamento dos logs explodiu. Como cortar custo sem cegar a operação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Comprimir, amostrar a cauda antiga e manter recentes íntegros",
                            isCorrect: true,
                        },
                        {
                            text: "Apagar primeiro os logs de erro, que são os maiores do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Parar de logar prompts e manter apenas os custos por chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzir a retenção para um dia e confiar na memória do time",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Tracing de fluxos compostos",
            blocks: [
                {
                    type: "text",
                    value: "# Da chamada solta ao trace\n\nProduto real não é uma chamada: uma pergunta dispara reescrita de query, busca no pgvector, rerank e geração (o RAG da trilha anterior), ou N voltas de um agente com ferramentas. Logs soltos de cada chamada viram confete: você vê as peças e não vê o fluxo.\n\nA solução é o TRACE: uma árvore de spans amarrada por um ID de correlação que nasce na requisição do usuário e atravessa tudo. Cada span registra tipo (LLM, retrieval, tool), duração, custo e os metadados da etapa: a reescrita guarda a query antes e depois; a busca guarda o top-k com scores; a geração guarda o prompt final e o TTFT; cada volta do agente vira um span com a ferramenta e os argumentos.",
                },
                {
                    type: "table",
                    value: '[["Span","Tipo","O que registrar"],["Reescrita","LLM","Query original e reescrita"],["Busca","Retrieval","Top-k com scores e filtros usados"],["Rerank","Retrieval","Ordem antes e depois"],["Geração","LLM","Prompt final; tokens; TTFT"],["Ferramenta (agente)","Tool","Argumentos e resultado resumido"]]',
                },
                {
                    type: "quote",
                    value: "O trace responde a única pergunta que importa na depuração de um fluxo composto: em qual elo da corrente a coisa quebrou.",
                },
                {
                    type: "text",
                    value: '## O diagnóstico que só o trace dá\n\nSem trace: "o sistema respondeu errado". Com trace: "a resposta veio errada porque a busca devolveu chunks irrelevantes, e a busca falhou porque a reescrita perdeu o nome do produto da pergunta original". A correção deixa de ser chute (mexer no prompt de geração, que estava certo) e vira cirurgia (ajustar a reescrita).\n\nEm 2026 o mercado convergiu para as convenções semânticas de IA generativa do OpenTelemetry como formato comum de spans de LLM: instrumentando nelas, você troca de backend de observabilidade sem reinstrumentar o código. Vale adotar desde o primeiro dia, mesmo usando uma ferramenta específica por cima.',
                },
            ],
            questions: [
                {
                    statement: "O que é um trace?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A árvore de spans de uma requisição, correlacionados por ID",
                            isCorrect: true,
                        },
                        {
                            text: "O arquivo de configuração do modelo usado em produção",
                            isCorrect: false,
                        },
                        {
                            text: "Uma lista com os usuários mais ativos do dia no produto",
                            isCorrect: false,
                        },
                        {
                            text: "O backup diário do banco de dados vetorial da aplicação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No RAG, quais spans tipicamente aparecem sob a requisição?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Reescrita, busca, rerank e geração final",
                            isCorrect: true,
                        },
                        {
                            text: "Compilação, deploy, teste e monitoração",
                            isCorrect: false,
                        },
                        {
                            text: "Cadastro, login, sessão e o logout do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Treino, validação, ajuste e a publicação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual pergunta o trace responde na depuração?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Em qual etapa do fluxo a resposta começou a dar errado",
                            isCorrect: true,
                        },
                        {
                            text: "Quanto o provedor vai faturar do cliente no fim do mês",
                            isCorrect: false,
                        },
                        {
                            text: "Qual desenvolvedor escreveu o prompt que está no ar hoje",
                            isCorrect: false,
                        },
                        {
                            text: "Quantos usuários novos se cadastraram durante o incidente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que registrar a query antes e depois da reescrita no span?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reescrita ruim é causa comum de busca errada; o diff mostra",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o banco vetorial exige as duas para indexar direito",
                            isCorrect: false,
                        },
                        {
                            text: "Para cobrar do usuário pelos caracteres digitados a mais",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a reescrita é a etapa mais cara de todo o pipeline",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que adotar as convenções de IA generativa do OpenTelemetry em 2026?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Padroniza os spans e liberta das ferramentas proprietárias",
                            isCorrect: true,
                        },
                        {
                            text: "É obrigatório por lei para sistemas com IA em produção",
                            isCorrect: false,
                        },
                        {
                            text: "Dobra a velocidade média das chamadas de API dos provedores",
                            isCorrect: false,
                        },
                        {
                            text: "Substitui a necessidade de qualquer outro log na aplicação",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ferramentas de observabilidade em 2026",
            blocks: [
                {
                    type: "text",
                    value: "# O mercado e o critério\n\nO mercado de 2026 tem opções maduras: Langfuse (código aberto, self-host ou nuvem; tracing, avaliação e gestão de prompts no mesmo lugar), LangSmith (SaaS da LangChain, integração nativa com LangChain e LangGraph), alternativas como Phoenix, Braintrust e Weave, e o caminho genérico: instrumentar com OpenTelemetry e apontar para o backend que o time já opera (Grafana, Jaeger).\n\nComo os nomes trocam de posição a cada trimestre, o que esta aula ensina é o CRITÉRIO: posso self-hostar (dado sensível, LGPD rígida)? integra com minha stack e framework? roda meu golden set dentro dela? versiona prompts? quanto custa por trace no meu volume? qual o custo de sair dela depois?",
                },
                {
                    type: "table",
                    value: '[["Critério","Pergunta a fazer","Pesa mais quando"],["Hospedagem","Posso rodar na minha infra?","Dado sensível; LGPD rígida"],["Integração","SDK para minha stack e framework?","Time pequeno; prazo curto"],["Avaliação embutida","Rodo o golden set na ferramenta?","Quer o ciclo fechado num lugar"],["Gestão de prompts","Versiona e testa prompts?","Time itera muito em prompt"],["Aberto ou SaaS","Código aberto ou caixa preta?","Estratégia de longo prazo"]]',
                },
                {
                    type: "quote",
                    value: 'Escolha a ferramenta pela pergunta "o que ela precisa fazer pelo meu ciclo?", não pelo logo que mais aparece nas conferências do ano.',
                },
                {
                    type: "text",
                    value: "## O caminho desta trilha e a ordem de adoção\n\nNo nosso cenário (dados de cliente, Postgres já operado, pgvector no mesmo banco), Langfuse self-host é um encaixe natural: os traces ficam na sua infra e a stack não ganha um fornecedor novo de dados sensíveis. Quem já tem Grafana e OpenTelemetry maduros faz o caminho genérico com as convenções da aula anterior.\n\nOrdem de adoção que funciona: TRACING primeiro (sem visão, nada mais anda), AVALIAÇÃO integrada depois (o golden set do módulo 1 rodando contra traces reais) e gestão de prompts quando a dor de versionar em planilha aparecer. Adotar tudo de uma vez no primeiro sprint é receita para não adotar nada.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza o Langfuse em 2026?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Código aberto, com opção de self-host, tracing e avaliação",
                            isCorrect: true,
                        },
                        {
                            text: "Um modelo de linguagem treinado só para gerar traces",
                            isCorrect: false,
                        },
                        {
                            text: "O serviço de nuvem oficial e exclusivo de um provedor de modelos",
                            isCorrect: false,
                        },
                        {
                            text: "Uma GPU dedicada apenas a rodar as avaliações localmente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando o self-host da observabilidade pesa na decisão?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando os dados são sensíveis e a LGPD aperta",
                            isCorrect: true,
                        },
                        {
                            text: "Quando o time quer evitar escrever qualquer código",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a empresa não tem nenhum servidor próprio",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o produto ainda não tem usuário nenhum",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a trilha ensina critério em vez de ranking de ferramentas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nomes e líderes mudam rápido; os critérios permanecem",
                            isCorrect: true,
                        },
                        {
                            text: "Porque rankings são proibidos em material didático sério",
                            isCorrect: false,
                        },
                        {
                            text: "Porque todas as ferramentas desse mercado são idênticas",
                            isCorrect: false,
                        },
                        {
                            text: "Para evitar processos judiciais dos fornecedores citados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Sua stack já tem Grafana e OpenTelemetry maduros. Qual o caminho natural?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Exportar os spans de IA para o backend que o time já opera",
                            isCorrect: true,
                        },
                        {
                            text: "Migrar a stack inteira para a ferramenta mais nova da moda",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar dois SaaS diferentes só para comparar os traces",
                            isCorrect: false,
                        },
                        {
                            text: "Desistir da observabilidade até a stack inteira ser trocada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a ordem recomendada de adoção da observabilidade?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Tracing primeiro, avaliação depois, gestão de prompts por último",
                            isCorrect: true,
                        },
                        {
                            text: "Gestão de prompts primeiro, porque os prompts mudam todo dia",
                            isCorrect: false,
                        },
                        {
                            text: "Tudo de uma vez, para o time aprender no mesmo trimestre inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Avaliação primeiro, porque tracing só serve com muitos usuários",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Métricas, dashboards e alertas",
            blocks: [
                {
                    type: "text",
                    value: '# Do trace ao dashboard\n\nTraces individuais servem para depurar; AGREGADOS servem para operar. As métricas de ouro de um serviço com LLM: latência (p50, p95, p99 e TTFT), taxa de erro (falha da API, timeout, bloqueio de guardrail), custo (por hora, por dia, por feature, por usuário) e os PROXIES de qualidade (feedback dos usuários, taxa de "não sei" do RAG, taxa de reformulação da pergunta).\n\nPercentil, não média: a média mistura os atendidos rápido com quem sofreu e esconde os dois; o p95 conta a experiência de quem espera mais. E o custo aqui é métrica de ENGENHARIA de primeira classe: um loop de agente mal fechado queima em uma madrugada o orçamento do mês, e é o alerta de custo por hora que acorda alguém a tempo.',
                },
                {
                    type: "table",
                    value: '[["Métrica","Alerta típico","Suspeita quando dispara"],["Custo por hora","Acima do teto combinado","Loop de agente; pico de abuso"],["p95 de latência","Acima do SLO","Provedor degradado; prompt inchou"],["Taxa de erro da API","Acima de X% em Y minutos","Incidente do provedor"],["TTFT","Salto repentino","Cache frio; rota errada de modelo"],["Feedback negativo","Queda sustentada","Regressão de qualidade no ar"]]',
                },
                {
                    type: "quote",
                    value: "Custo é métrica de engenharia: o loop que ninguém limitou gasta em uma madrugada o orçamento do mês, e é o alerta de custo que acorda alguém.",
                },
                {
                    type: "text",
                    value: '## Drift de uso\n\nUma degradação que nenhum alerta de infraestrutura pega: o PERFIL das perguntas muda com o tempo. O produto lançou uma feature nova, chegou um público diferente, mudou a estação do ano, e as perguntas de hoje não se parecem com as do golden set de três meses atrás. A suíte continua verde e o usuário real sofre.\n\nDefesa: monitore a distribuição das categorias de pergunta (o classificador de rota do módulo 3 dá isso de graça) e compare com a distribuição da suíte. Quando descolarem, é hora de renovar o golden set com casos recentes. A taxa de "não sei" subindo é outro sintoma do mesmo fenômeno: perguntas novas que a base de conhecimento ainda não cobre.',
                },
            ],
            questions: [
                {
                    statement: "Por que p95 em vez de média na latência?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A média esconde a cauda; p95 mostra quem espera mais",
                            isCorrect: true,
                        },
                        {
                            text: "A média é mais difícil de calcular nos dashboards",
                            isCorrect: false,
                        },
                        {
                            text: "O p95 é o único percentil aceito pelos provedores",
                            isCorrect: false,
                        },
                        {
                            text: "A média muda demais entre um dia útil e o feriado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Um alerta de custo por hora acima do teto protege de quê?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Loop descontrolado ou abuso queimando orçamento à noite",
                            isCorrect: true,
                        },
                        {
                            text: "Reajuste anual de preço na tabela oficial dos provedores",
                            isCorrect: false,
                        },
                        {
                            text: "Cobrança duplicada no cartão corporativo da empresa no mês",
                            isCorrect: false,
                        },
                        {
                            text: "Aumento do salário do time de engenharia por hora extra",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: 'O que a taxa de "não sei" do RAG sinaliza quando sobe?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Buracos na base ou retrieval piorando: investigar os traces",
                            isCorrect: true,
                        },
                        {
                            text: "Usuários mais educados fazendo perguntas cada vez mais simples",
                            isCorrect: false,
                        },
                        {
                            text: "Que o modelo ficou mais honesto depois de uma atualização",
                            isCorrect: false,
                        },
                        {
                            text: "Que o sistema finalmente atingiu a maturidade ideal de operação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é drift de uso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O perfil das perguntas muda e a suíte deixa de representar",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo muda de versão sem nenhum aviso dentro do provedor",
                            isCorrect: false,
                        },
                        {
                            text: "A latência que cresce lentamente nos horários de pico do dia",
                            isCorrect: false,
                        },
                        {
                            text: "O custo que sobe junto com a cotação do dólar todos os meses",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O TTFT subiu de repente sem nenhum deploy seu. Quais as hipóteses prováveis?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cache de prompt frio ou degradação do lado do provedor",
                            isCorrect: true,
                        },
                        {
                            text: "Os usuários digitando mais devagar nas conversas novas",
                            isCorrect: false,
                        },
                        {
                            text: "O dashboard arredondando os números para cima no gráfico",
                            isCorrect: false,
                        },
                        {
                            text: "A moderação de conteúdo bloqueando respostas boas demais",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Feedback do usuário e o ciclo fechado",
            blocks: [
                {
                    type: "text",
                    value: "# O sinal que fecha o ciclo\n\nFeedback EXPLÍCITO: o joinha para cima ou para baixo (com motivo opcional), o report de problema e, o mais valioso de todos, a CORREÇÃO EDITADA: o usuário conserta a resposta e te entrega, de graça, um caso de golden set com gabarito.\n\nFeedback IMPLÍCITO: o usuário reformula a pergunta logo em seguida (a resposta não serviu), abandona a conversa no meio, copia a resposta para a área de transferência (sinal positivo). Cada um tem confiabilidade diferente e nenhum deles é verdade absoluta: quem responde pesquisa é minoria enviesada (os muito satisfeitos e os muito irritados respondem mais), então trate as taxas como TENDÊNCIA a acompanhar, não como nota do sistema.",
                },
                {
                    type: "table",
                    value: '[["Sinal","Tipo","Confiabilidade"],["Joinha negativo com motivo","Explícito","Alta; aponta direto o problema"],["Correção editada da resposta","Explícito","Altíssima; vira caso pronto"],["Reformulação da pergunta","Implícito","Média; pode ser só curiosidade"],["Cópia da resposta","Implícito","Média; sinal positivo"],["Abandono da sessão","Implícito","Baixa; muitas causas possíveis"]]',
                },
                {
                    type: "quote",
                    value: "Reclamação sem trace é anedota; com trace é diagnóstico; com caso na suíte é vacina. O ciclo fechado transforma uma na outra toda semana.",
                },
                {
                    type: "text",
                    value: '## A revisão por amostragem\n\nComo a taxa de feedback explícito é baixa (1 a 5% em produtos típicos), a operação madura complementa com REVISÃO HUMANA POR AMOSTRAGEM: toda semana, alguém do time lê uma amostra de conversas (20 é um bom começo), priorizando as com feedback negativo e as com "não sei". Padrões que nenhuma métrica pega aparecem ali: o tom que irrita, a pergunta recorrente que a base não cobre, o fluxo que confunde.\n\nO ciclo completo, que é o coração da operação: feedback negativo leva ao trace; o trace dá o diagnóstico; o caso entra no golden set; a correção passa pela suíte; o deploy sai medido. Cada volta desse ciclo deixa o sistema um pouco melhor e a suíte um pouco mais representativa. Privacidade na revisão: acesso mínimo e PII mascarada valem aqui também.',
                },
            ],
            questions: [
                {
                    statement: "Qual feedback explícito vira caso de golden set quase pronto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A correção editada da resposta feita pelo usuário",
                            isCorrect: true,
                        },
                        {
                            text: "O número de estrelas do aplicativo na loja oficial",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de mensagens trocadas por cada sessão",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo total que o usuário passou logado no produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que amostrar conversas para revisão humana?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Poucos usuários dão feedback; a amostra revela o resto",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a revisão humana é exigida pela lei brasileira",
                            isCorrect: false,
                        },
                        {
                            text: "Para treinar os revisores novos contratados pelo time",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o juiz LLM se recusa a avaliar conversas reais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Reformulação imediata da pergunta sinaliza o quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Provável resposta insatisfatória; sinal implícito negativo",
                            isCorrect: true,
                        },
                        {
                            text: "Que o usuário só está treinando a digitação no aplicativo",
                            isCorrect: false,
                        },
                        {
                            text: "Que a resposta anterior foi perfeita e completa demais",
                            isCorrect: false,
                        },
                        {
                            text: "Que o modelo pediu mais detalhes antes de poder responder",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como fechar o ciclo a partir de um joinha negativo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Trace, diagnóstico, caso na suíte, correção e deploy medido",
                            isCorrect: true,
                        },
                        {
                            text: "Responder ao usuário pedindo desculpas formais por e-mail",
                            isCorrect: false,
                        },
                        {
                            text: "Reiniciar o serviço para limpar o estado interno do modelo",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar de provedor imediatamente após a primeira reclamação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que tratar métricas de feedback como tendência e não verdade absoluta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Quem responde é minoria enviesada; extremos respondem mais",
                            isCorrect: true,
                        },
                        {
                            text: "Porque os números de feedback chegam com um mês de atraso",
                            isCorrect: false,
                        },
                        {
                            text: "Porque usuários satisfeitos mentem nas avaliações públicas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a plataforma arredonda as taxas para baixo no painel",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Custo e latência",
    aulas: [
        {
            titulo: "A conta do produto",
            blocks: [
                {
                    type: "text",
                    value: "# Unit economics de LLM\n\nA fórmula é curta: custo por chamada = tokens de entrada vezes o preço de entrada, mais tokens de saída vezes o preço de saída (que costuma ser de 3 a 5 vezes maior). O que a fórmula não conta é onde o dinheiro VAI no seu produto: num RAG, a entrada domina (system prompt, chunks, histórico: milhares de tokens para gerar algumas centenas); numa geração longa, a saída domina; num agente, TUDO multiplica pelo número de voltas, porque cada volta repaga o contexto acumulado.\n\nDaí a conta que interessa ao negócio: custo por conversa (chamadas vezes custo médio), custo por usuário por mês, e a projeção contra o faturamento. Projete em três cenários ANTES de lançar: uso médio, uso do p95 e abuso. A média engana; são os outros dois que definem o risco da fatura.",
                },
                {
                    type: "table",
                    value: '[["Perfil de produto","O que domina o custo","Alavanca principal"],["Chat simples","Histórico crescente na entrada","Janela de memória; resumo"],["RAG","Chunks no contexto","Menos chunks melhores; cache"],["Agente","Voltas do loop","Limite de voltas; dieta de contexto"],["Geração longa (relatórios)","Tokens de saída","Limitar tamanho; modelo mais barato"],["Classificação em massa","Volume de chamadas","Modelo pequeno; batch"]]',
                },
                {
                    type: "quote",
                    value: "O preço por token é público e igual para todos; o custo do SEU produto é o preço vezes as suas decisões de arquitetura. A fatura mede a engenharia.",
                },
                {
                    type: "text",
                    value: "## Medir antes de otimizar\n\nO módulo 2 deixou o custo visível por feature e por usuário; é essa visão que impede o erro clássico de otimizar o que não pesa. Se 80% da fatura vem do assistente RAG e 5% do classificador, uma semana de trabalho no classificador economiza centavos.\n\nQuando a fatura subir, o primeiro passo profissional é sempre o mesmo: quebrar o custo por feature no dashboard e atacar a que domina. E vale a régua inversa também: engenheiro caro passando um sprint para economizar dez reais por mês é prejuízo. As aulas seguintes apresentam as quatro alavancas na ordem de retorno típica: cache, roteamento, batch e o controle da latência que vem junto.",
                },
            ],
            questions: [
                {
                    statement: "Por que tokens de saída pesam mais que os de entrada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O preço por token de saída é maior, em geral de 3 a 5 vezes",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a saída é sempre maior que a entrada em qualquer uso",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a entrada é gratuita nos planos empresariais anuais",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o provedor arredonda a saída para o milhar seguinte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Num assistente RAG, qual parcela costuma dominar o custo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A entrada, inflada pelos chunks e pelo histórico",
                            isCorrect: true,
                        },
                        {
                            text: "A saída, porque respostas de RAG são muito longas",
                            isCorrect: false,
                        },
                        {
                            text: "O rerank, cobrado em dobro pelos bancos vetoriais",
                            isCorrect: false,
                        },
                        {
                            text: "O armazenamento mensal dos embeddings no Postgres",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que mais infla o custo de um agente comparado ao chat?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada volta do loop repaga o contexto acumulado inteiro",
                            isCorrect: true,
                        },
                        {
                            text: "A taxa fixa cobrada por ferramenta declarada no cardápio",
                            isCorrect: false,
                        },
                        {
                            text: "O aluguel da GPU dedicada exigida por qualquer agente",
                            isCorrect: false,
                        },
                        {
                            text: "As mensagens de sistema, cobradas em dobro nos agentes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que projetar o custo em três cenários (médio, p95 e abuso) antes de lançar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A média engana; picos e abuso definem o risco real da fatura",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o provedor exige a projeção assinada dentro do contrato",
                            isCorrect: false,
                        },
                        {
                            text: "Para o financeiro reservar a verba com um ano de antecedência",
                            isCorrect: false,
                        },
                        {
                            text: "Porque planilhas de três cenários impressionam a diretoria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A fatura subiu e o time quer otimizar. Qual o primeiro passo profissional?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Quebrar o custo por feature e atacar a que domina a fatura",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar tudo para o modelo mais barato disponível no catálogo",
                            isCorrect: false,
                        },
                        {
                            text: "Cortar a feature mais nova, que provavelmente causou a alta",
                            isCorrect: false,
                        },
                        {
                            text: "Renegociar o contrato com o provedor antes de medir qualquer coisa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cache de prompt e cache semântico",
            blocks: [
                {
                    type: "text",
                    value: "# Pagar uma vez pelo que se repete\n\nDois caches com nomes parecidos e naturezas diferentes. O CACHE DE PROMPT é do provedor: quando o começo da requisição é idêntico ao de uma chamada recente (system prompt, ferramentas, documentos fixos), esse prefixo não é reprocessado; você paga uma fração dele (desconto na casa de 90% no trecho cacheado, nos grandes provedores em 2026) e o TTFT despenca. A condição é ter um prefixo ESTÁVEL: conteúdo fixo primeiro, conteúdo variável no fim, a mesma regra de layout que você aprendeu na dieta de contexto.\n\nO CACHE SEMÂNTICO é seu: pergunta repetida (ou quase) devolve resposta pronta sem chamar o modelo. Implementação: embedding da pergunta, busca por similaridade (o pgvector de novo), limiar e TTL.",
                },
                {
                    type: "code",
                    value: "# Layout que aproveita o cache de prompt\nmensagens = [\n    system_prompt,          # fixo: cacheado\n    definicao_ferramentas,  # fixo: cacheado\n    politicas_da_empresa,   # fixo: cacheado\n    *historico,             # muda por conversa\n    pergunta_do_usuario,    # muda sempre: no fim\n]\n# Um timestamp no system prompt muda o prefixo\n# a cada chamada e mata o cache inteiro.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Cache de prompt (provedor)","Cache semântico (seu)"],["O que economiza","Reprocessar o prefixo fixo","A chamada inteira"],["Onde vive","No provedor","Na sua infra (Redis; pgvector)"],["Condição","Prefixo idêntico e estável","Similaridade acima do limiar"],["Risco","Quase nenhum","Falso hit; resposta velha"],["Ganho típico","Grande desconto no prefixo e TTFT","Chamada zerada nas repetidas"]]',
                },
                {
                    type: "quote",
                    value: "O desconto do cache de prompt não vem de um botão: vem de ordenar o contexto com o fixo na frente. É engenharia de layout, e aparece na fatura.",
                },
                {
                    type: "text",
                    value: '## Os riscos do cache semântico\n\nO cache semântico tem três armadilhas. FALSO HIT: "segunda via do boleto" e "cancelar o boleto" são vizinhas no espaço vetorial e têm respostas opostas; limiar alto e teste com pares difíceis são obrigatórios. RESPOSTA VELHA: quando a base de conhecimento muda, as entradas de cache ligadas àquele conteúdo precisam ser invalidadas, senão o cache serve a política antiga. PERSONALIZAÇÃO: resposta que depende do usuário (o pedido DELE, o plano DELE) não pode ser servida a outro; inclua o escopo na chave ou não cacheie.\n\nMonitore a taxa de acerto dos dois caches no dashboard do módulo 2: queda repentina no cache de prompt quase sempre denuncia um prefixo que deixou de ser estável.',
                },
            ],
            questions: [
                {
                    statement: "O que o cache de prompt do provedor economiza?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O reprocessamento do prefixo fixo, com desconto e TTFT menor",
                            isCorrect: true,
                        },
                        {
                            text: "Os tokens de saída de todas as respostas repetidas do dia",
                            isCorrect: false,
                        },
                        {
                            text: "O custo do banco vetorial usado pelo sistema de retrieval",
                            isCorrect: false,
                        },
                        {
                            text: "A cobrança das ferramentas declaradas mas nunca chamadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual condição ativa o cache de prompt?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Prefixo idêntico e estável entre as chamadas",
                            isCorrect: true,
                        },
                        {
                            text: "Temperatura zerada em todas as requisições",
                            isCorrect: false,
                        },
                        {
                            text: "Um plano empresarial contratado com o provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntas curtas com menos de cem caracteres",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um timestamp no system prompt mata o cache?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Muda o prefixo a cada chamada e invalida o trecho cacheado",
                            isCorrect: true,
                        },
                        {
                            text: "Porque datas são bloqueadas pela moderação dos provedores",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o relógio do servidor atrasa em relação ao da API",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o cache só aceita prompts escritos em inglês puro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o principal risco do cache semântico de respostas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Falso hit: perguntas parecidas com respostas diferentes",
                            isCorrect: true,
                        },
                        {
                            text: "Custo maior que chamar o modelo em todos os casos de uso",
                            isCorrect: false,
                        },
                        {
                            text: "Bloqueio da conta por uso excessivo de embeddings no dia",
                            isCorrect: false,
                        },
                        {
                            text: "Perda do histórico da conversa a cada acerto de cache novo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A base de conhecimento foi atualizada. O que fazer com o cache semântico?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Invalidar as entradas ligadas ao conteúdo que mudou",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: o cache expira sozinho quando o disco enche",
                            isCorrect: false,
                        },
                        {
                            text: "Dobrar o TTL para compensar o custo da atualização",
                            isCorrect: false,
                        },
                        {
                            text: "Migrar o cache para a nuvem do provedor do modelo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Roteamento de modelos",
            blocks: [
                {
                    type: "text",
                    value: '# O modelo certo para cada pergunta\n\nA diferença de preço entre o menor e o maior modelo de um catálogo é de dezenas de vezes em 2026. Se 70 a 80% do seu tráfego é pergunta simples (consulta de política, classificação, saudação), mandar tudo para o modelo top é pagar caviar para quem pediu pão. ROTEAMENTO: cada pedido vai para o menor modelo que dá conta dele.\n\nTrês jeitos de decidir a rota: HEURÍSTICA (regras sobre tamanho, palavras-chave, feature de origem: grátis e grosseira), CLASSIFICADOR pequeno (um modelo nano rotula a dificuldade por centavos), ou a ESCOLHA DO PRODUTO (a feature define o tier: o botão "análise profunda" usa o grande; o preenchimento automático usa o pequeno). Há ainda a escalada por falha: o barato tenta, um detector de qualidade (asserções, juiz leve) decide se escala para o caro.',
                },
                {
                    type: "table",
                    value: '[["Estratégia","Como decide","Prós e contras"],["Heurística","Regras sobre tamanho e origem","Grátis e rápida; grosseira"],["Classificador nano","Modelo pequeno rotula a dificuldade","Bom custo; exige suíte por rota"],["Escolha do produto","A feature define o tier","Simples e previsível; menos fina"],["Escalada por falha","Barato tenta; detector escala","Máxima economia; latência dobra no difícil"]]',
                },
                {
                    type: "quote",
                    value: "Ninguém escala um sênior para somar dois números: roteamento é alocar a inteligência (e o preço dela) na medida exata do problema.",
                },
                {
                    type: "text",
                    value: '## O risco e a rede de proteção\n\nO perigo do roteamento é rotear para baixo demais: a qualidade cai em silêncio na rota barata e ninguém percebe, porque a média geral continua boa. A rede de proteção é a suíte POR ROTA: o golden set do módulo 1 ganha uma coluna "rota esperada", e cada rota tem seus próprios limiares de aprovação. Homologue o modelo barato na categoria dele ANTES de mandar tráfego, e monitore o feedback por rota no dashboard.\n\nA conta que justifica o trabalho: num produto com 100 mil chamadas por mês, mover 75% para um modelo 20 vezes mais barato corta a fatura em mais de 70%, mantendo o modelo grande exatamente onde ele faz diferença.',
                },
            ],
            questions: [
                {
                    statement: "O que é roteamento de modelos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mandar cada pedido para o menor modelo que dá conta dele",
                            isCorrect: true,
                        },
                        {
                            text: "Distribuir as chamadas entre datacenters de várias regiões",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar de provedor automaticamente a cada hora do dia",
                            isCorrect: false,
                        },
                        {
                            text: "Dividir um prompt grande em vários pedaços menores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o roteamento derruba a fatura?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A diferença de preço entre tiers chega a dezenas de vezes",
                            isCorrect: true,
                        },
                        {
                            text: "Porque provedores dão desconto para quem usa dois modelos",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o modelo barato responde sem cobrar os tokens de entrada",
                            isCorrect: false,
                        },
                        {
                            text: "Porque rotear reduz o número total de perguntas dos usuários",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como funciona a escalada por falha?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O barato tenta; um detector de qualidade decide escalar",
                            isCorrect: true,
                        },
                        {
                            text: "O caro tenta primeiro e o barato revisa a resposta dele",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois respondem juntos e o sistema soma as respostas",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário escolhe o modelo numa lista a cada pergunta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o risco central do roteamento e como vigiar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Qualidade caindo em silêncio na rota barata; suíte por rota",
                            isCorrect: true,
                        },
                        {
                            text: "Excesso de logs gerados pelas rotas duplicadas do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Bloqueio do provedor por alternar modelos com frequência",
                            isCorrect: false,
                        },
                        {
                            text: "Latência infinita quando as duas rotas respondem juntas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma feature de resumo curto e uma de análise jurídica. Qual o roteamento sensato?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Resumo no tier barato; análise no capaz; medir cada rota",
                            isCorrect: true,
                        },
                        {
                            text: "Tudo no tier caro, porque análise jurídica contamina o resto",
                            isCorrect: false,
                        },
                        {
                            text: "Tudo no tier barato até algum cliente reclamar formalmente",
                            isCorrect: false,
                        },
                        {
                            text: "Sortear o modelo por requisição para equilibrar o custo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Batch e processamento assíncrono",
            blocks: [
                {
                    type: "text",
                    value: "# Nem tudo precisa de resposta agora\n\nExistem dois mundos de chamada: o INTERATIVO (um humano esperando na tela: streaming, latência baixa, prioridade) e o LOTE (ninguém esperando: relatório noturno, classificação retroativa, embeddings da base inteira, enriquecimento de dados). Confundir os dois custa caro nos dois sentidos: lote no canal interativo compete com seus usuários pelo rate limit; interativo no canal de lote frustra gente.\n\nPara o lote de verdade, os provedores oferecem a BATCH API: você envia um arquivo de jobs, recebe os resultados em até 24 horas (em geral bem antes) e paga cerca de METADE do preço em 2026. Classificar 200 mil tíquetes antigos pela metade do custo, de madrugada, sem disputar limite com o tráfego do dia: essa é a conta.",
                },
                {
                    type: "table",
                    value: '[["Necessidade","Canal certo","Exemplo"],["Segundos, usuário na tela","API interativa com streaming","Chat; assistente"],["Minutos, ninguém na tela","Fila própria com workers","Análise de documento recém subido"],["Horas, volume grande","Batch API com desconto","Classificar 200 mil tíquetes antigos"],["Recorrente e agendado","Batch API fora do pico","Relatório diário; embeddings novos"]]',
                },
                {
                    type: "quote",
                    value: 'Pergunte "quem está esperando, e quanto tempo aceita esperar?": a resposta escolhe o canal, e o canal define o preço.',
                },
                {
                    type: "text",
                    value: '## A fila do meio-termo\n\nEntre os dois extremos existe o semi-urgente: o usuário subiu um contrato e espera a análise "em alguns minutos". Nem streaming síncrono (a conexão aberta por minutos é frágil), nem batch de 24 horas. A resposta é a FILA PRÓPRIA: o job entra numa fila (Redis, SQS), workers consomem respeitando o rate limit, o usuário é notificado ao terminar.\n\nDois requisitos de engenharia nessa fila: IDEMPOTÊNCIA (retry acontece; o job processado duas vezes não pode duplicar o efeito) e observabilidade do tempo de fila (módulo 2). Essa mesma fila vira peça central da resiliência no módulo 5: picos de tráfego viram espera de segundos em vez de erro na cara do usuário.',
                },
            ],
            questions: [
                {
                    statement: "O que a Batch API dos provedores oferece?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Lotes com prazo de horas por cerca de metade do preço",
                            isCorrect: true,
                        },
                        {
                            text: "Respostas instantâneas com prioridade sobre o chat",
                            isCorrect: false,
                        },
                        {
                            text: "Um modelo exclusivo treinado para tarefas em lote",
                            isCorrect: false,
                        },
                        {
                            text: "Envio gratuito desde que o lote passe de mil jobs",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual trabalho é candidato natural ao batch?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Classificar duzentos mil tíquetes antigos sem pressa",
                            isCorrect: true,
                        },
                        {
                            text: "Responder o chat do usuário logado na tela agora",
                            isCorrect: false,
                        },
                        {
                            text: "Gerar o streaming da resposta token por token",
                            isCorrect: false,
                        },
                        {
                            text: "Aprovar as ações críticas de um agente em tempo real",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Documento subido pelo usuário, análise pronta em alguns minutos. Qual o canal certo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fila própria com workers respeitando o rate limit",
                            isCorrect: true,
                        },
                        {
                            text: "Batch API, que devolve tudo em até vinte e quatro horas",
                            isCorrect: false,
                        },
                        {
                            text: "Chamada interativa síncrona segurando a conexão aberta",
                            isCorrect: false,
                        },
                        {
                            text: "Um cron diário que processa os documentos de madrugada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que jobs de fila precisam ser idempotentes?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Retry acontece; o job repetido não pode duplicar o efeito",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a fila embaralha a ordem de chegada dos trabalhos",
                            isCorrect: false,
                        },
                        {
                            text: "Porque workers só processam números pares de mensagens",
                            isCorrect: false,
                        },
                        {
                            text: "Para o provedor conseguir cobrar cada job exatamente uma vez",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Além do desconto, que vantagem operacional o batch noturno traz?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Não compete com o tráfego interativo nem com o rate limit do dia",
                            isCorrect: true,
                        },
                        {
                            text: "Elimina a necessidade de avaliação em todos os resultados gerados",
                            isCorrect: false,
                        },
                        {
                            text: "Garante respostas de melhor qualidade pela calma noturna do modelo",
                            isCorrect: false,
                        },
                        {
                            text: "Zera o custo de todos os tokens de saída durante a madrugada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Latência percebida",
            blocks: [
                {
                    type: "text",
                    value: '# A espera que o usuário sente\n\nOito segundos de tela parada são uma eternidade; oito segundos com texto fluindo desde o meio segundo inicial são uma leitura confortável. A latência TOTAL pode até ser a mesma: a PERCEBIDA é outra, e é ela que decide se o produto parece rápido. A métrica da percepção é o TTFT, que o módulo 2 já pôs no dashboard.\n\nAs alavancas, em ordem de retorno: STREAMING sempre que houver humano na tela (custo zero, efeito enorme); CACHE DE PROMPT (o TTFT do prefixo praticamente some); MODELO MENOR nas etapas invisíveis (reescrita de query e roteamento não precisam do modelo top; o usuário nunca vê essas etapas); PARALELIZAR o que não tem dependência; e o ESQUELETO de estados na interface ("buscando nos documentos...", "consultando seu pedido..."): não muda a latência real e muda completamente a espera.',
                },
                {
                    type: "table",
                    value: '[["Alavanca","Efeito","Onde dói"],["Streaming","Percepção despenca","Nenhum custo extra"],["Cache de prompt","TTFT do prefixo some","Exige layout estável"],["Modelo menor nos bastidores","Etapas invisíveis aceleram","Homologar na suíte antes"],["Paralelizar etapas","Soma vira o máximo delas","Complexidade; dependências"],["Estados visíveis na interface","Espera vira progresso","Só percepção; o real não muda"]]',
                },
                {
                    type: "quote",
                    value: "O usuário não mede a latência com cronômetro, mede com paciência: o streaming compra paciência, o silêncio gasta.",
                },
                {
                    type: "text",
                    value: "## O orçamento de latência\n\nPara atacar a latência com método, decomponha o p95 pelo trace (módulo 2): reescrita 300ms, busca 150ms, rerank 200ms, TTFT da geração 900ms. Agora o alvo é visível: otimize a MAIOR fatia primeiro, e transforme o orçamento em SLO interno por etapa, com alerta quando estourar.\n\nComplete com timeouts honestos: chamada interativa sem timeout é usuário desistindo antes do sistema. Timeout curto, mensagem clara e retry é melhor experiência que espera infinita. E feche o módulo com a boa notícia: custo e latência quase sempre melhoram JUNTOS, porque contexto menor custa menos tokens E processa mais rápido. A dieta de contexto que você aprendeu na trilha de agentes paga dobrado aqui.",
                },
            ],
            questions: [
                {
                    statement: "Por que o streaming melhora tanto a experiência?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O texto flui desde o primeiro segundo; a espera vira leitura",
                            isCorrect: true,
                        },
                        {
                            text: "Porque reduz o número total de tokens cobrados na resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o modelo pensa bem melhor gerando token por token",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o navegador renderiza texto parado mais devagar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual métrica captura a latência percebida?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O TTFT, tempo até o primeiro token aparecer",
                            isCorrect: true,
                        },
                        {
                            text: "O uptime mensal do provedor em porcentagem",
                            isCorrect: false,
                        },
                        {
                            text: "A soma de tokens de entrada e saída da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "O p50 do tempo total incluindo o fim da geração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como usar o trace para atacar a latência?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Decompor o p95 por etapa e otimizar a maior fatia",
                            isCorrect: true,
                        },
                        {
                            text: "Somar as médias de todas as etapas e dividir por dois",
                            isCorrect: false,
                        },
                        {
                            text: "Otimizar primeiro a etapa mais barata de mexer no código",
                            isCorrect: false,
                        },
                        {
                            text: "Reiniciar os workers e medir de novo até o número cair",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde um modelo menor acelera sem o usuário perceber?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nas etapas invisíveis, como reescrita de query e roteamento",
                            isCorrect: true,
                        },
                        {
                            text: "Na resposta final, onde a velocidade importa mais que tudo",
                            isCorrect: false,
                        },
                        {
                            text: "Em nenhum lugar: trocar modelo nunca altera a latência real",
                            isCorrect: false,
                        },
                        {
                            text: "No juiz da suíte, que precisa responder em milissegundos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que custo e latência costumam melhorar juntos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Contexto menor custa menos tokens e processa mais rápido",
                            isCorrect: true,
                        },
                        {
                            text: "Porque os provedores dão desconto para chamadas rápidas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o cache converte latência diretamente em receita",
                            isCorrect: false,
                        },
                        {
                            text: "É coincidência: as duas métricas não têm relação técnica",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Segurança e privacidade",
    aulas: [
        {
            titulo: "Prompt injection em produção",
            blocks: [
                {
                    type: "text",
                    value: '# O ataque número um\n\nVocê conhece prompt injection das trilhas anteriores: instrução maliciosa embutida em dado que o sistema lê. Em produção o risco escala, porque as superfícies se multiplicam: o RAG lê documentos que outras pessoas escreveram, o agente lê páginas e e-mails, e usuários reais testam limites por esporte. No OWASP Top 10 para aplicações com LLM (a referência de mercado), injection ocupa o primeiro lugar da lista, e não é por acaso.\n\nDois sabores: DIRETA (o próprio usuário tenta no chat: "ignore suas regras e...") e INDIRETA (a instrução vem escondida num documento, tíquete ou página que o sistema processa: o autor do texto ataca ATRAVÉS do seu sistema). A indireta é a mais perigosa, porque o alvo nem sabe que carregou o ataque para dentro.',
                },
                {
                    type: "table",
                    value: '[["Camada de defesa","O que faz","Contra o quê"],["Privilégio mínimo","Corta o que a IA pode fazer","Limita o estrago de qualquer ataque"],["Delimitação de origem","Marca o que é dado externo","Confusão entre instrução e dado"],["Validação de saída","Checa formato e política antes de agir","Ação maliciosa gerada"],["Aprovação humana","Humano no laço das ações críticas","O irreversível"],["Monitoração","Detecta padrões de tentativa","Aprender com cada ataque"]]',
                },
                {
                    type: "quote",
                    value: "Você não vence a injection com um filtro mais esperto; você a torna inofensiva com um sistema onde a instrução injetada não tem poder para nada.",
                },
                {
                    type: "text",
                    value: "## Por que filtro simples falha, e o que funciona\n\nLista negra de palavras não segura: linguagem natural tem infinitas formas de pedir a mesma coisa (paráfrase, outra língua, encoding, narrativa hipotética). A defesa real é DEFESA EM CAMADAS, e nenhuma camada é bala de prata: privilégio mínimo (a IA só acessa e faz o que a feature exige), separação clara entre instrução e dado (delimitar e rotular a origem do conteúdo externo no prompt), tratar a SAÍDA do modelo como não confiável (validar formato e política antes de executar qualquer coisa), aprovação humana no crítico (herança da trilha de agentes) e monitorar tentativas (módulo 2).\n\nUma regra de projeto que economiza sustos: o system prompt VAI vazar um dia (extração é um esporte na internet). Então nunca coloque segredo nele: nada de chave, senha ou informação que não possa aparecer num print.",
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença entre injection direta e indireta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Direta vem do usuário; indireta, escondida no que o sistema lê",
                            isCorrect: true,
                        },
                        {
                            text: "Direta ataca o modelo; indireta ataca o banco de dados da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Direta acontece em produção; indireta, apenas em desenvolvimento",
                            isCorrect: false,
                        },
                        {
                            text: "Direta usa português; indireta usa línguas estrangeiras raras",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que lista negra de palavras falha contra injection?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A linguagem natural tem variações infinitas para o mesmo pedido",
                            isCorrect: true,
                        },
                        {
                            text: "Porque as listas negras são caras demais para manter no ar",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o modelo remove os filtros automaticamente durante a leitura",
                            isCorrect: false,
                        },
                        {
                            text: "Porque as palavras proibidas mudam a cada versão nova dos modelos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa tratar a saída do modelo como não confiável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Validar formato e política antes de qualquer ação com ela",
                            isCorrect: true,
                        },
                        {
                            text: "Descartar as respostas e gerar tudo de novo duas vezes",
                            isCorrect: false,
                        },
                        {
                            text: "Mostrar a resposta apenas para administradores do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Assinar digitalmente cada resposta antes do envio ao usuário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o system prompt não deve conter segredos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele pode vazar; projete assumindo que será lido um dia",
                            isCorrect: true,
                        },
                        {
                            text: "Porque segredos aumentam o custo por token da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o provedor publica os prompts em relatório anual",
                            isCorrect: false,
                        },
                        {
                            text: "Porque prompts mais longos ficam bem mais lentos de processar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que privilégio mínimo é a camada mais valiosa contra injection?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Mesmo o ataque perfeito só alcança o que a IA já podia fazer",
                            isCorrect: true,
                        },
                        {
                            text: "Porque elimina a necessidade das outras camadas de defesa",
                            isCorrect: false,
                        },
                        {
                            text: "Porque impede que qualquer texto malicioso chegue até o modelo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque detecta o atacante e bloqueia a conta dele na hora",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Guardrails de entrada e saída",
            blocks: [
                {
                    type: "text",
                    value: "# As grades do sistema\n\nGuardrails são checagens automáticas em volta do modelo. Na ENTRADA: moderação de conteúdo abusivo ou ilegal (API de moderação ou modelo pequeno), detecção de PII (mascarar antes de enviar ao provedor quando a tarefa permite), limites de tamanho e de taxa, e o filtro de ESCOPO: pergunta fora do tema do produto recebe recusa educada de um classificador barato, sem gastar o modelo caro.\n\nNa SAÍDA: validação estrutural (o JSON bate com o schema?), política de conteúdo (não prometer o que o produto não faz, não dar aconselhamento fora do escopo definido), groundedness no RAG (a resposta se apoia nos documentos?) e a regra absoluta: PII de um usuário JAMAIS aparece para outro.",
                },
                {
                    type: "table",
                    value: '[["Guardrail","Lado","Exemplo"],["Moderação de abuso","Entrada","Conteúdo ilegal barrado antes do modelo"],["Escopo do produto","Entrada","Pergunta de imposto num app de receitas"],["Schema da resposta","Saída","JSON inválido volta para regenerar"],["Política de conteúdo","Saída","Sem promessa fora do contrato"],["Vazamento de PII","Saída","Dado de outro usuário nunca sai"]]',
                },
                {
                    type: "quote",
                    value: "Guardrail bom é o que ninguém percebe: barra o raro sem atrapalhar o comum, e cada bloqueio vira métrica em dashboard, não mistério.",
                },
                {
                    type: "text",
                    value: "## Pipeline, ferramentas e o custo do exagero\n\nOrganize as checagens como pipeline por CUSTO: regex e regras primeiro (grátis), classificador pequeno depois (centavos), juiz LLM só no que é crítico. Existem bibliotecas para isso (guardrails-ai, NeMo Guardrails), mas asserções próprias bem escritas cobrem a maioria dos produtos; comece simples.\n\nO erro de calibração mais comum não é a grade fraca: é a grade AGRESSIVA demais. Falso positivo bloqueia uso legítimo, frustra usuário e corrói a confiança no produto. Por isso guardrail se opera como qualquer sistema: taxa de bloqueio no dashboard (módulo 2), revisão periódica de amostras dos bloqueados e ajuste fino contínuo. E quando bloquear, recuse com dignidade: explique o limite e ofereça o caminho certo, em vez de um erro seco.",
                },
            ],
            questions: [
                {
                    statement: "Por que checar escopo na entrada com um classificador barato?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Recusar fora do tema antes de gastar o modelo caro",
                            isCorrect: true,
                        },
                        {
                            text: "Para treinar o classificador com perguntas variadas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o modelo grande não entende temas fora do escopo",
                            isCorrect: false,
                        },
                        {
                            text: "Para contar quantos usuários tentam mudar de assunto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual guardrail de saída protege o RAG?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Groundedness: a resposta precisa se apoiar nos documentos",
                            isCorrect: true,
                        },
                        {
                            text: "Compressão: a resposta precisa caber numa única linha curta",
                            isCorrect: false,
                        },
                        {
                            text: "Tradução: toda resposta do RAG precisa sair em três idiomas",
                            isCorrect: false,
                        },
                        {
                            text: "Velocidade: respostas devem chegar em menos de um segundo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em que ordem organizar as checagens do pipeline?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Baratas e rápidas primeiro; juiz LLM só onde for crítico",
                            isCorrect: true,
                        },
                        {
                            text: "Aleatória, para o atacante não aprender o padrão das grades",
                            isCorrect: false,
                        },
                        {
                            text: "As mais caras primeiro, para garantir a máxima qualidade",
                            isCorrect: false,
                        },
                        {
                            text: "Todas em paralelo, sem ordem, para reduzir a latência média",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o custo do guardrail agressivo demais?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Falso positivo: uso legítimo bloqueado e usuário frustrado",
                            isCorrect: true,
                        },
                        {
                            text: "Tokens extras cobrados pelo provedor a cada bloqueio feito",
                            isCorrect: false,
                        },
                        {
                            text: "Multa contratual do provedor por excesso de conteúdo recusado",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: bloquear demais é sempre mais seguro que de menos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como operar os guardrails depois do lançamento?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Medir taxa de bloqueio e revisar amostras dos bloqueados",
                            isCorrect: true,
                        },
                        {
                            text: "Congelar as regras para não introduzir regressões novas",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a rigidez a cada semana por princípio de precaução",
                            isCorrect: false,
                        },
                        {
                            text: "Delegar a revisão ao próprio modelo que gerou as respostas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Dados pessoais e LGPD",
            blocks: [
                {
                    type: "text",
                    value: "# O que entra no prompt é dado tratado\n\nUm prompt com nome, CPF e histórico de compras é TRATAMENTO de dado pessoal sob a LGPD, igual a qualquer banco de dados. Na relação com o provedor de modelo, sua empresa é a CONTROLADORA (decide o porquê) e o provedor é o OPERADOR (processa sob suas instruções): isso exige contrato.\n\nAs perguntas que o contrato precisa responder: o provedor treina modelos com os seus dados? (as APIs empresariais sérias não treinam por padrão em 2026, mas confirme e documente), quanto tempo retém os prompts? (existe opção de retenção zero?), onde processa? (transferência internacional pede salvaguardas) e o acordo de processamento de dados (DPA) está assinado?",
                },
                {
                    type: "table",
                    value: '[["Onde o dado vive","Risco","Prática"],["Prompt enviado à API","Retenção pelo provedor","Contrato; retenção zero; minimizar"],["Logs e traces","Vazamento interno","Mascarar PII; acesso mínimo; retenção"],["Cache semântico","Servir dado de um usuário a outro","Escopo por usuário nas chaves"],["Memória de longo prazo","Perfil sem consentimento","Transparência; opt-out; eliminação"],["Embeddings da base","Reidentificação indireta","Tratar como dado; apagar junto"]]',
                },
                {
                    type: "quote",
                    value: "A LGPD não pergunta se o seu produto usa IA; pergunta onde o dado pessoal passa e quem responde por ele em cada parada do caminho.",
                },
                {
                    type: "text",
                    value: '## Minimização e o direito de ser esquecido\n\nO princípio mais útil no dia a dia é a MINIMIZAÇÃO: só vai no prompt o dado que a tarefa exige. Se o modelo precisa do histórico de pedidos mas não do nome, mande "cliente_4812" no lugar do nome: pseudonimizar reduz o risco (sem eliminá-lo: reidentificação indireta existe, então o rigor continua).\n\nQuando um titular pede eliminação, o mapa da tabela acima vira checklist: o dado não vive só no banco principal. Vive nos logs e traces, no cache semântico, na memória de longo prazo do agente e nos embeddings derivados de textos pessoais. Quem mapeou onde o dado passa responde ao pedido em dias; quem não mapeou descobre na fiscalização. A escolha da base legal (consentimento, legítimo interesse) é decisão jurídica: o seu papel de engenharia é entregar esse mapa técnico preciso.',
                },
            ],
            questions: [
                {
                    statement:
                        "Ao enviar dados de cliente na API de um modelo, quem é quem na LGPD?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sua empresa controla; o provedor opera sob contrato",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor controla tudo; a sua empresa apenas assiste",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário vira o controlador por ter gerado o dado",
                            isCorrect: false,
                        },
                        {
                            text: "Ninguém: dados em prompt ficam fora do alcance da lei",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é minimização aplicada a prompts?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Enviar só o dado necessário, mascarando o que der",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir o prompt para caber no limite de tokens",
                            isCorrect: false,
                        },
                        {
                            text: "Comprimir o texto com gzip antes de enviar à API",
                            isCorrect: false,
                        },
                        {
                            text: "Resumir a conversa a cada dez mensagens trocadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que verificar no contrato com o provedor sobre dados?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Treino com seus dados, retenção, local e DPA assinado",
                            isCorrect: true,
                        },
                        {
                            text: "O tamanho da janela de contexto de cada modelo do catálogo",
                            isCorrect: false,
                        },
                        {
                            text: "O desconto por volume e o prazo do boleto corporativo",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de datacenters que o provedor tem no mundo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um titular pediu eliminação. Onde o dado pode estar além do banco principal?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Logs, traces, caches, memórias e embeddings derivados",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas no banco principal; o resto é temporário por lei",
                            isCorrect: false,
                        },
                        {
                            text: "Somente no provedor, que assume tudo depois da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Em lugar nenhum, se o usuário usou o modo anônimo do site",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que pseudonimizar (cliente_4812) não encerra a conversa da LGPD?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Reduz o risco, mas a reidentificação segue possível",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a lei brasileira proíbe qualquer apelido em banco",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o modelo troca os códigos de volta pelos nomes",
                            isCorrect: false,
                        },
                        {
                            text: "Encerra sim: dado pseudonimizado sai do escopo da lei",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Segredos, acesso e abuso",
            blocks: [
                {
                    type: "text",
                    value: "# A chave do cofre\n\nChave de API é dinheiro vivo: quem a tiver gasta o SEU orçamento. As regras que você conhece desde as primeiras trilhas viram operação aqui: nunca no frontend (qualquer visitante lê o código da página e copia), nunca no repositório, sempre em cofre (variável de ambiente, secret manager), com ROTAÇÃO periódica e um runbook de vazamento pronto: revogar, trocar, auditar o uso no período.\n\nA arquitetura que sustenta tudo é o PROXY próprio: o frontend fala com o SEU backend, e só o backend fala com o provedor. De uma vez, você ganha: chave protegida, autenticação e autorização por usuário, rate limit por usuário, logging central (módulo 2), guardrails centrais (aula anterior) e a liberdade de trocar de provedor sem tocar no cliente (módulo 5).",
                },
                {
                    type: "table",
                    value: '[["Risco","Vetor","Defesa"],["Chave vazada","Frontend; repositório; log","Cofre; proxy; rotação; runbook"],["Custo por abuso","Bot ou usuário desmedido","Rate limit; quota; alerta de custo"],["Uso malicioso da sua conta","Geração de spam ou golpe","Moderação; termos; banimento"],["Acesso interno indevido","Logs com PII abertos ao time","Papéis; acesso mínimo; auditoria"]]',
                },
                {
                    type: "quote",
                    value: "Chave vazada não derruba o serviço na hora: ela aparece dias depois, na fatura. O alerta de custo é quem conta a notícia a tempo.",
                },
                {
                    type: "text",
                    value: '## Abuso: o custo que anda sozinho\n\nMesmo sem vazamento, o custo pode fugir: um usuário rodando script, um bot raspando seu chat, alguém usando seu produto "grátis" como proxy de LLM para o próprio negócio. As defesas: rate limit por usuário e por IP, QUOTA por plano (o grátis tem teto diário honesto, mostrado na interface antes de estourar), degradação para tier barato quando exceder e o alerta de custo por hora do módulo 2 como última linha.\n\nA história se repete desde 2023: produto com geração ilimitada e sem quota vira mina de ouro alheia em semanas. Generosidade sem teto não é estratégia de crescimento, é doação de orçamento para quem automatizar primeiro.',
                },
            ],
            questions: [
                {
                    statement: "Por que a chave da API nunca vai no frontend?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Qualquer visitante a copia e gasta pela sua conta",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o navegador corta chaves com mais de vinte letras",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o CORS bloqueia chamadas feitas com chave válida",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o provedor só aceita chamadas vindas de servidores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o papel do backend proxy entre o app e o provedor?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Proteger a chave e aplicar auth, limites e logging",
                            isCorrect: true,
                        },
                        {
                            text: "Deixar as respostas mais rápidas encurtando a rota",
                            isCorrect: false,
                        },
                        {
                            text: "Traduzir as respostas do inglês para o português",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzir o preço por token pelo volume agregado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que um rate limit por usuário previne?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um usuário ou bot consumindo o orçamento de todos",
                            isCorrect: true,
                        },
                        {
                            text: "A fila de mensagens de crescer no horário de pico",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo de repetir respostas para o mesmo usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Os logs de estourarem o limite diário de armazenamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Você descobriu a chave num commit público. Qual o primeiro passo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Revogar a chave imediatamente e auditar o uso dela",
                            isCorrect: true,
                        },
                        {
                            text: "Apagar o commit e considerar o problema resolvido",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o nome do repositório para despistar os bots",
                            isCorrect: false,
                        },
                        {
                            text: "Abrir tíquete com o provedor e aguardar o retorno",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Produto com tier grátis de geração sem limite. Qual o desfecho previsível?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Bots terceirizam o custo em você; quota e limites antes",
                            isCorrect: true,
                        },
                        {
                            text: "Crescimento saudável, porque uso grátis atrai clientes bons",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: provedores bloqueiam abuso automaticamente na origem",
                            isCorrect: false,
                        },
                        {
                            text: "Lucro maior, porque o custo por token cai com o volume alto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Red team e resposta a incidentes",
            blocks: [
                {
                    type: "text",
                    value: "# Atacar antes que ataquem\n\nRED TEAM é o exercício de atacar o próprio sistema antes do lançamento: injections conhecidas (as listas públicas do OWASP são o ponto de partida), jailbreaks clássicos (persona, cenário hipotético, encoding), extração de system prompt, tentativa de puxar dado de outro usuário, conteúdo fora da política e abuso de ferramentas no agente.\n\nO que o red team encontra não morre num relatório: vira a SUÍTE ADVERSARIAL, o golden set do mal, rodando no CI junto com a suíte normal do módulo 1. Existem ferramentas de red teaming automatizado (garak e PyRIT são conhecidas em 2026) para o arsenal genérico; o ataque CASEIRO, dirigido às regras do seu produto, pega o que o genérico não vê: uma tarde do time fingindo ser o vilão vale ouro.",
                },
                {
                    type: "table",
                    value: '[["Fase do incidente","Ação","Ferramenta"],["Detectar","Alerta de custo; padrão anômalo; denúncia","Dashboards e canal aberto"],["Conter","Feature flag off; modo restrito; revogar chave","Kill switch preparado antes"],["Comunicar","Afetados; autoridade quando exigido","Modelo de comunicação pronto"],["Corrigir","Patch; prompt; guardrail novo","Deploy com a suíte"],["Aprender","Post-mortem; caso novo na suíte","Suíte adversarial cresce"]]',
                },
                {
                    type: "quote",
                    value: "O red team barato é você fingindo ser o vilão por uma tarde; o caro é o vilão de verdade descobrindo primeiro.",
                },
                {
                    type: "text",
                    value: '## Quando acontece mesmo assim\n\nO plano de incidente tem cinco fases, e a mais negligenciada é a preparação da CONTENÇÃO: o KILL SWITCH: um flag que desliga a feature de IA (ou degrada para um modo restrito, tipo FAQ estático) SEM precisar de deploy. Ele se prepara em tempo de paz; no incidente, só se aperta.\n\nSe o incidente envolver dado pessoal, a LGPD entra: comunicar os afetados e a ANPD nos prazos previstos faz parte do plano, não é improviso. E depois do fogo apagado, o POST-MORTEM SEM CULPADOS: a pergunta é "o que no sistema permitiu isso?", nunca "quem errou?". Culpar pessoas ensina o time a esconder; analisar sistemas ensina o sistema a resistir. Cada incidente fecha virando caso na suíte adversarial: a vacina do próximo.',
                },
            ],
            questions: [
                {
                    statement: "O que é a suíte adversarial?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um golden set de ataques que roda como teste de regressão",
                            isCorrect: true,
                        },
                        {
                            text: "Uma equipe externa contratada por hora para invadir o site",
                            isCorrect: false,
                        },
                        {
                            text: "O firewall de rede configurado no modo mais agressivo",
                            isCorrect: false,
                        },
                        {
                            text: "Um modelo treinado apenas com exemplos de conteúdo ruim",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é um kill switch no contexto de produto com IA?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um flag que desliga ou restringe a IA sem precisar de deploy",
                            isCorrect: true,
                        },
                        {
                            text: "O botão do provedor que apaga a conta e os dados na hora",
                            isCorrect: false,
                        },
                        {
                            text: "Um atalho do teclado que encerra a sessão do navegador",
                            isCorrect: false,
                        },
                        {
                            text: "O comando que reinicia os servidores de GPU do cluster",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o red team caseiro complementa as ferramentas automáticas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele mira as regras e fluxos específicos do seu produto",
                            isCorrect: true,
                        },
                        {
                            text: "Porque as ferramentas automáticas são todas pagas em dólar",
                            isCorrect: false,
                        },
                        {
                            text: "Porque rodar ferramenta de ataque é ilegal fora de sandbox",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o time interno ataca com mais educação e cuidado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Vazou dado pessoal num incidente. Além de conter, o que a LGPD pede?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Comunicar afetados e a ANPD nos prazos previstos",
                            isCorrect: true,
                        },
                        {
                            text: "Publicar o post-mortem completo nas redes sociais",
                            isCorrect: false,
                        },
                        {
                            text: "Pagar a multa antecipadamente para reduzir o processo",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar de provedor de API antes de qualquer aviso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o post-mortem sem culpados produz de valor?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Causas sistêmicas viram correções e casos na suíte",
                            isCorrect: true,
                        },
                        {
                            text: "Uma lista de advertências formais para o RH arquivar",
                            isCorrect: false,
                        },
                        {
                            text: "A prova de que o incidente não teve custo financeiro",
                            isCorrect: false,
                        },
                        {
                            text: "Um relatório confidencial que ninguém mais consulta",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - O serviço no ar",
    aulas: [
        {
            titulo: "Arquitetura de referência",
            blocks: [
                {
                    type: "text",
                    value: "# O desenho que aguenta produção\n\nJuntando as peças que a trilha vem montando: o frontend fala com o SEU backend (o proxy do módulo 4); o backend aplica auth, guardrails, cache e roteamento, e só então fala com o provedor; a fila do módulo 3 absorve o assíncrono; o Postgres guarda dados, vetores (pgvector) e os checkpoints do agente; a observabilidade do módulo 2 enxerga tudo.\n\nUma decisão estrutural sustenta a escala: o serviço é STATELESS. Qualquer réplica atende qualquer requisição, porque o estado (conversa, memória, checkpoint) vive no banco, nunca na RAM do processo: com N réplicas atrás do balanceador, a próxima mensagem do usuário cai em outra máquina, e precisa encontrar a conversa lá. Você aprendeu isso como boa prática na trilha de aplicações; aqui é requisito de sobrevivência.",
                },
                {
                    type: "table",
                    value: '[["Peça","Papel","Falha típica sem ela"],["Backend proxy","Chave; auth; limites; logs","Chave exposta; custo sem dono"],["Fila com workers","Absorver picos e o assíncrono","Erro 429 na cara do usuário"],["Postgres (dados; vetores; estado)","Estado fora das réplicas","Conversa presa numa máquina"],["Observabilidade","Traces; métricas; alertas","Operação cega"],["Staging com a suíte","Ensaio geral de cada mudança","Regressão direto em produção"]]',
                },
                {
                    type: "quote",
                    value: "Produção não é onde o código roda; é onde ele falha na frente de todo mundo. A arquitetura existe para a falha caber nela sem virar catástrofe.",
                },
                {
                    type: "text",
                    value: "## Ambientes e o que o LLM muda\n\nTrês ambientes com configuração própria (chaves, modelos, limites): dev, staging e produção. Staging existe para uma coisa: rodar a suíte do módulo 1 contra a configuração REAL antes de ela chegar em usuário.\n\nE uma calibração de expectativa: a maior parte desse desenho é engenharia de backend clássica que você já conhece das trilhas de base. O LLM muda ONDE a dor mora: o custo é por uso e explode fácil (módulo 3), a latência é alta e variável (streaming e TTFT viram tema de arquitetura), e o serviço depende de um terceiro que você não controla: a resiliência da próxima aula existe por causa disso.",
                },
            ],
            questions: [
                {
                    statement: "Por que o estado da conversa não pode viver na RAM da réplica?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Com N réplicas, a próxima requisição cai em outra máquina",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a RAM é mais cara que o banco de dados na nuvem",
                            isCorrect: false,
                        },
                        {
                            text: "Porque conversas em memória violam a LGPD por definição",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o provedor exige o histórico completo dentro do prompt",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o papel do staging com a suíte?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ensaiar o deploy e rodar a suíte antes de produção",
                            isCorrect: true,
                        },
                        {
                            text: "Servir os usuários gratuitos com hardware mais fraco",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar o backup diário do banco de dados de produção",
                            isCorrect: false,
                        },
                        {
                            text: "Treinar o modelo com os dados da semana anterior",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que muda na engenharia com um LLM no meio do serviço?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Custo, latência variável e a dependência externa dominam",
                            isCorrect: true,
                        },
                        {
                            text: "Tudo: os padrões clássicos de backend deixam de valer",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: a API do modelo se comporta como qualquer banco",
                            isCorrect: false,
                        },
                        {
                            text: "Somente a linguagem: serviços com LLM exigem Python puro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde os guardrails devem rodar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "No seu backend, antes e depois da chamada ao provedor",
                            isCorrect: true,
                        },
                        {
                            text: "No frontend, para economizar chamadas de rede do app",
                            isCorrect: false,
                        },
                        {
                            text: "No provedor, que conhece o modelo melhor que o cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Num serviço de terceiros fora do fluxo da requisição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a troca de provedor fica simples com o backend proxy?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O cliente não muda; só o adaptador interno é trocado",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o proxy converte os preços dos tokens entre as moedas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os provedores compartilham as chaves entre si",
                            isCorrect: false,
                        },
                        {
                            text: "Não fica: trocar provedor sempre exige reescrever o app",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Resiliência: retry, breaker e fallback",
            blocks: [
                {
                    type: "text",
                    value: '# Projetado para falhar bem\n\nO provedor VAI falhar: 429 de rate limit, 5xx, timeout, degradação lenta. A pergunta de projeto não é "se", é "o que o seu produto faz enquanto isso?". As camadas, de dentro para fora:\n\nRETRY com backoff exponencial e JITTER, só para erro transitório: espera 1s, 2s, 4s, com um sorteio somado a cada espera. O jitter existe porque, sem ele, todos os clientes que falharam juntos tentam de novo JUNTOS, martelando o serviço que tentava se recuperar. TIMEOUT em toda chamada: sem timeout, a thread fica pendurada e o usuário desiste antes do sistema. CIRCUIT BREAKER: depois de N falhas seguidas, para de tentar (abre), espera, e testa a volta com poucas requisições (meia-abertura): insistir contra um serviço caído só piora a fila de quem espera.',
                },
                {
                    type: "code",
                    value: "async def chamar_com_resiliencia(req):\n    if breaker.aberto():\n        return await fallback(req)      # nem tenta o principal\n    for tentativa in range(3):\n        try:\n            return await provedor.chamar(req, timeout=10)\n        except ErroTransitorio:\n            await asyncio.sleep(2 ** tentativa + random.random())\n    breaker.registrar_falha()\n    return await fallback(req)          # modelo B ou degradação honesta",
                },
                {
                    type: "table",
                    value: '[["Mecanismo","Quando age","Cuidado"],["Retry com backoff e jitter","Erro transitório isolado","Nunca em erro de auth; idempotência"],["Timeout","Chamada pendurada","Curto no interativo"],["Circuit breaker","Falha em sequência","Meia-abertura para voltar devagar"],["Fallback de modelo","Provedor degradado","Homologado na suíte ANTES"],["Degradação honesta","Tudo indisponível","Mensagem clara; nunca fingir"]]',
                },
                {
                    type: "quote",
                    value: "Retry sem backoff é um ataque de negação de serviço contra quem você depende; retry com backoff e jitter é paciência organizada.",
                },
                {
                    type: "text",
                    value: '## A escada de fallback\n\nQuando o principal cai de vez, desce-se a escada: modelo alternativo do mesmo provedor, provedor alternativo (o proxy da aula anterior paga o investimento aqui), e no fim a DEGRADAÇÃO HONESTA: "estou com instabilidade, tente em instantes" com um caminho estático útil (FAQ, busca simples). O que não se faz: fingir que está tudo bem, segurar a conexão aberta para sempre ou derrubar o produto inteiro porque UMA feature perdeu a API.\n\nA regra que transforma fallback em engenharia (e não em torcida): o plano B se homologa em tempo de paz. Rode a suíte do módulo 1 no modelo alternativo AGORA, conheça a diferença de qualidade e custo, e o incidente vira uma troca ensaiada em vez de um experimento no escuro.',
                },
            ],
            questions: [
                {
                    statement: "Para que serve o jitter no backoff?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Evitar que todos os clientes tentem de novo em sincronia",
                            isCorrect: true,
                        },
                        {
                            text: "Deixar o log de erros mais legível para a auditoria",
                            isCorrect: false,
                        },
                        {
                            text: "Acelerar as retentativas nos horários de menor tráfego",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzir o preço das chamadas repetidas com desconto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando o retry NÃO deve acontecer?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando o erro não é transitório, como chave revogada",
                            isCorrect: true,
                        },
                        {
                            text: "Depois das vinte e duas horas, fora do horário comercial",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a chamada anterior demorou menos de um segundo",
                            isCorrect: false,
                        },
                        {
                            text: "Nos fins de semana, quando o suporte não está de plantão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o circuit breaker faz que o retry não faz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para de insistir quando a falha é sistêmica e testa a volta",
                            isCorrect: true,
                        },
                        {
                            text: "Reinicia o servidor degradado do provedor remotamente pela API",
                            isCorrect: false,
                        },
                        {
                            text: "Aumenta a temperatura do modelo até as respostas melhorarem",
                            isCorrect: false,
                        },
                        {
                            text: "Divide a requisição em pedaços menores e tenta de novo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que homologar o modelo de fallback antes do incidente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Descobrir a qualidade do plano B durante a crise é tarde",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o provedor reserva o modelo só para quem homologa",
                            isCorrect: false,
                        },
                        {
                            text: "Para ganhar o selo de resiliência exigido pelos clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a API do fallback usa um protocolo diferente do REST",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Caiu tudo: provedor principal e fallback. O que o produto deve fazer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Degradar com honestidade: avisar e oferecer o caminho estático",
                            isCorrect: true,
                        },
                        {
                            text: "Segurar todas as requisições abertas até algum provedor voltar",
                            isCorrect: false,
                        },
                        {
                            text: "Responder com texto gerado por template fingindo ser o modelo",
                            isCorrect: false,
                        },
                        {
                            text: "Desligar o produto inteiro e voltar apenas no dia seguinte",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Filas, picos e rate limits",
            blocks: [
                {
                    type: "text",
                    value: "# Quando todo mundo chega junto\n\nO provedor limita requisições e tokens por minuto (RPM e TPM), por conta e por modelo. Num pico legítimo (campanha de marketing, segunda-feira de manhã), o tráfego estoura o teto e vira 429 em cascata: usuários reais vendo erro porque outros usuários reais chegaram junto.\n\nA fila do módulo 3 vira amortecedor: o que pode esperar segundos entra na fila, e os workers consomem no ritmo que o teto permite (um token bucket próprio, calibrado ABAIXO do limite do provedor, para o interativo sempre ter espaço). Prioridade explícita: o interativo (usuário na tela) fura a fila do lote. E BACKPRESSURE: quando a fila cresce além do saudável, o sistema sinaliza (tempo estimado na interface, lote adiado), em vez de aceitar tudo e falhar depois.",
                },
                {
                    type: "table",
                    value: '[["Sinal","Diagnóstico provável","Ação"],["429 esporádico","Rajada local passageira","O backoff resolve sozinho"],["429 em cascata no pico","Tráfego acima do teto contratado","Fila; prioridade; pedir aumento"],["Fila crescendo sem parar","Chegada acima da vazão máxima","Backpressure; degradar o lote"],["Espera alta só no lote","Priorização funcionando","Aceitável; seguir monitorando"],["429 fora de qualquer pico","Loop ou abuso interno","Caçar o vazamento nos traces"]]',
                },
                {
                    type: "quote",
                    value: "O rate limit do provedor é uma parede de vidro: não se move empurrando com mais força no dia do pico; move-se negociando semanas antes.",
                },
                {
                    type: "text",
                    value: '## Capacidade se planeja, não se improvisa\n\nA vazão máxima da sua fila é aritmética: teto de tokens por minuto dividido pelos tokens médios por job. Com esse número, a pergunta "aguentamos a campanha de marketing?" tem resposta ANTES da campanha: simule o pico previsto, e se não couber, o caminho é pedir aumento de limite ao provedor (dão, mediante histórico e contrato, mas leva dias: negocia-se antes, não durante) ou preparar o segundo provedor.\n\nE um diagnóstico que vale memorizar: se os workers já rodam no teto do provedor e a fila segue crescendo, ESCALAR WORKER NÃO RESOLVE NADA: o gargalo não é você, é o teto. Mais worker só faz a fila andar em círculos mais rápido. É o caso clássico em que a solução é contratual, não técnica.',
                },
            ],
            questions: [
                {
                    statement: "Qual o papel da fila diante do rate limit do provedor?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Amortecer picos consumindo no ritmo que o teto permite",
                            isCorrect: true,
                        },
                        {
                            text: "Eliminar o limite agrupando os jobs numa chamada única",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar as respostas prontas para reuso em outros usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Acelerar o provedor com requisições em paralelo dobrado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o interativo tem prioridade sobre o lote na fila?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Há um usuário esperando na tela; o lote pode aguardar",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o lote custa bem mais caro por token processado",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o provedor recusa lotes durante o horário comercial",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a fila embaralha jobs interativos com os antigos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A fila cresce sem parar e os workers já estão no teto do provedor. Escalar mais workers resolve?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não: o gargalo é o teto; negociar limite ou segundo provedor",
                            isCorrect: true,
                        },
                        {
                            text: "Sim: workers extras conseguem processar além do limite contratado",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, desde que os workers novos rodem em regiões diferentes",
                            isCorrect: false,
                        },
                        {
                            text: "Não: o certo é apagar a fila e recomeçar do zero à noite",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "429 constante fora de horário de pico indica o quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Provável loop ou abuso interno queimando o limite; investigar",
                            isCorrect: true,
                        },
                        {
                            text: "Que o provedor reduz o teto de todos durante a madrugada",
                            isCorrect: false,
                        },
                        {
                            text: "Que a fila está funcionando rápido demais para o horário",
                            isCorrect: false,
                        },
                        {
                            text: "Comportamento normal de qualquer API de nuvem em 2026",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma campanha de marketing dobrará o tráfego em duas semanas. O que fazer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Projetar o pico, pedir aumento de limite e ensaiar antes",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: o autoscale da nuvem absorve qualquer crescimento",
                            isCorrect: false,
                        },
                        {
                            text: "Desligar o lote para sempre e liberar espaço no limite",
                            isCorrect: false,
                        },
                        {
                            text: "Confiar no retry, que reenvia tudo até o provedor aceitar",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Versionamento, deploy e canário",
            blocks: [
                {
                    type: "text",
                    value: "# Prompt é artefato de deploy\n\nMudar uma frase do prompt muda o comportamento do produto tanto quanto mudar código. A consequência lógica: prompt (e a configuração em volta: modelo, temperatura, ferramentas, o k do RAG) se trata como código. Versionado no git (ou no registry da ferramenta de observabilidade), com a versão carimbada em cada trace (módulo 2) e rollback de um comando.\n\nA esteira de deploy de uma mudança de prompt: a suíte roda no CI (módulo 1), sobe para staging, e entra em produção via CANÁRIO: a versão nova atende uma fração do tráfego (10%, por exemplo) por um período, com as métricas comparadas lado a lado (feedback, taxa de erro, custo, latência). Números bons: vai a 100%. Ruins: rollback e ninguém se machucou além dos 10%.",
                },
                {
                    type: "table",
                    value: '[["Mudança","Esteira mínima","Por quê"],["Texto do prompt","Suíte; canário curto","Efeito amplo e sutil"],["Modelo (versão ou tier)","Suíte; custo; staging; canário","Comportamento e preço mudam juntos"],["Parâmetro (temperatura; k)","Suíte da categoria afetada","Efeito mais localizado"],["Ferramenta nova no agente","Suíte adversarial também","A superfície de ataque cresce"],["Guardrail","Taxa de bloqueio em canário","Falso positivo pega usuário real"]]',
                },
                {
                    type: "quote",
                    value: "Se mudar uma vírgula do prompt muda o produto, a vírgula merece a mesma esteira que o código: versão, teste, canário e caminho de volta.",
                },
                {
                    type: "text",
                    value: '## Pin de modelo e a migração planejada\n\nUse a versão DATADA do modelo, nunca o alias "latest": alias que aponta para onde o provedor quiser é upgrade silencioso em produção sem passar pela sua esteira: comportamento novo, suíte nunca rodada, ninguém sabendo o que mudou. Com o pin, a troca de modelo é sempre uma decisão SUA, com data e números.\n\nO preço do pin é a lição de casa: provedores descontinuam versões antigas com aviso. O anúncio de descontinuação entra no radar do time como uma tarefa com prazo: rodar a suíte no sucessor, ajustar o que regrediu, migrar via canário DENTRO da janela. Quem ignora o aviso faz a migração no pior dia possível: o último, sem teste, no susto. Canário difere de teste A/B no propósito: canário protege contra regressão; A/B decide entre duas versões saudáveis por métrica de produto.',
                },
            ],
            questions: [
                {
                    statement: "Por que versionar prompts como código?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mudança de prompt muda o produto; precisa de histórico e volta",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o git recusa repositórios que não têm a pasta de prompts",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os prompts fora do git acabam apagados pelo provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Para os designers poderem editar o texto sem chamar os devs",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o deploy canário de um prompt?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Servir a versão nova a uma fração e comparar as métricas",
                            isCorrect: true,
                        },
                        {
                            text: "Publicar no ambiente de testes interno por uma semana",
                            isCorrect: false,
                        },
                        {
                            text: "Enviar a mudança por e-mail para aprovação da diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar a versão nova só de madrugada, fora do horário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Canário e teste A/B: qual a diferença de propósito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Canário barra regressão; A/B escolhe entre versões boas",
                            isCorrect: true,
                        },
                        {
                            text: "Canário roda no frontend e o A/B roda no lado do backend",
                            isCorrect: false,
                        },
                        {
                            text: "São dois sinônimos usados por times de tamanhos diferentes",
                            isCorrect: false,
                        },
                        {
                            text: "Canário exige mais tráfego que o A/B para dar significância",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que pinar a versão do modelo em vez de usar o alias mais recente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Upgrade silencioso muda o comportamento sem passar na esteira",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o alias mais recente custa quase o dobro em toda chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Porque as versões pinadas respondem bem mais rápido no cache",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a lei exige contrato novo a cada versão de modelo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O provedor anunciou a descontinuação do seu modelo pinado. Qual o plano?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Rodar a suíte no sucessor, ajustar e migrar via canário no prazo",
                            isCorrect: true,
                        },
                        {
                            text: "Ignorar o aviso: aliases antigos continuam para clientes fiéis",
                            isCorrect: false,
                        },
                        {
                            text: "Migrar às cegas no último dia do prazo, para adiar o trabalho",
                            isCorrect: false,
                        },
                        {
                            text: "Entrar na justiça contra o provedor para manter o modelo no ar",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Runbook de operação",
            blocks: [
                {
                    type: "text",
                    value: "# O manual de quando dói\n\nÀs 3 da manhã, com alerta tocando, ninguém pensa bem: o RUNBOOK pensa por você. É o documento com os passos prontos por cenário de incidente: o SINTOMA (qual alerta disparou), o DIAGNÓSTICO rápido (onde olhar: qual dashboard, quais traces, a página de status do provedor), a AÇÃO de mitigação (primeiro parar o sangramento, causa raiz depois) e o ESCALONAMENTO (quando acordar quem).\n\nOs cenários clássicos de um serviço com LLM, cada um com sua página: provedor fora ou degradado (o breaker abriu? o fallback assumiu?), custo explodindo (qual feature? qual usuário? loop?), qualidade caindo (deploy recente? rollback), fila represada (aula anterior), chave vazada (módulo 4) e guardrail bloqueando demais (taxa de falso positivo).",
                },
                {
                    type: "table",
                    value: '[["Alerta","Primeira página do runbook","Mitigação típica"],["Erro do provedor acima de X%","Status page; breaker; fallback","Fallback homologado assume"],["Custo por hora acima do teto","Custo por feature nos dashboards","Quota; kill switch da feature"],["Feedback negativo subindo","Deploys recentes; amostra de traces","Rollback de prompt ou modelo"],["p95 acima do SLO","TTFT; taxa de cache; fila; provedor","Cache; rota; escalar workers"],["Fila acima de N minutos","Vazão dos workers; teto de TPM","Prioridade; degradar o lote"]]',
                },
                {
                    type: "quote",
                    value: "Alerta bom termina em verbo. Se dispara e ninguém sabe o que fazer, o problema não é o incidente: é o alerta, que virou ruído decorativo.",
                },
                {
                    type: "text",
                    value: "## O ciclo que mantém o runbook vivo\n\nRunbook desatualizado é pior que nenhum: mente com autoridade. Quem o mantém vivo é o ciclo de operação: cada POST-MORTEM (módulo 4) termina atualizando ou criando a página do cenário; o GAME DAY semestral (simular um incidente de mentira: provedor fora, custo estourando) testa se as páginas funcionam e se o time as encontra; e as métricas de operação (tempo médio de recuperação, o MTTR, e incidentes por mês) mostram se a maturidade está subindo.\n\nCom isso o módulo fecha: o serviço tem arquitetura para falha, absorve picos, faz deploy com rede de proteção e opera com método. Falta a última fronteira técnica (o modelo sob medida, módulo 6) e a consolidação de tudo no projeto final.",
                },
            ],
            questions: [
                {
                    statement: "O que é um runbook?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Passos prontos por cenário para agir durante incidentes",
                            isCorrect: true,
                        },
                        {
                            text: "O diário pessoal de anotações do desenvolvedor sênior",
                            isCorrect: false,
                        },
                        {
                            text: "A documentação comercial do produto para os clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Um script Python que reinicia os servidores sozinho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que todo alerta precisa de um runbook associado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Alerta sem ação clara vira ruído e passa a ser ignorado",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a ferramenta de alertas exige um link para salvar",
                            isCorrect: false,
                        },
                        {
                            text: "Para os alertas contarem como documentação na auditoria",
                            isCorrect: false,
                        },
                        {
                            text: "Porque alertas sem página não disparam fora do expediente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O custo por hora estourou o teto às 3h. Qual o primeiro movimento do runbook?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Achar a feature ou usuário que queima e conter com quota",
                            isCorrect: true,
                        },
                        {
                            text: "Abrir uma reunião de emergência com o financeiro da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Desligar todos os servidores até o time acordar às nove",
                            isCorrect: false,
                        },
                        {
                            text: "Enviar e-mail ao provedor pedindo estorno da madrugada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O feedback negativo subiu logo após um deploy de prompt. Qual a ação padrão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Rollback da versão e análise dos traces com calma depois",
                            isCorrect: true,
                        },
                        {
                            text: "Esperar uma semana para confirmar a tendência nos números",
                            isCorrect: false,
                        },
                        {
                            text: "Responder aos usuários explicando a mudança de comportamento",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a temperatura para variar mais as respostas do ar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o MTTR mede e por que importa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Tempo médio de recuperação: quão rápido a operação sara",
                            isCorrect: true,
                        },
                        {
                            text: "O total de minutos de reunião por incidente registrado",
                            isCorrect: false,
                        },
                        {
                            text: "A taxa de retenção mensal dos usuários após incidentes",
                            isCorrect: false,
                        },
                        {
                            text: "O número de tokens gastos na mitigação de cada alerta",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Fine-tuning e modelos abertos",
    aulas: [
        {
            titulo: "Quando ajustar o modelo",
            blocks: [
                {
                    type: "text",
                    value: '# A escada de intervenção\n\nExiste uma ordem de custo-benefício para melhorar um sistema com LLM, e ela raramente é respeitada por empolgação: primeiro PROMPT (horas de trabalho), depois RAG (dias), e só então FINE-TUNING (semanas: dados, treino, avaliação e manutenção para sempre). "Vamos treinar nosso próprio modelo" antes de esgotar os dois primeiros degraus é o erro mais caro da área.\n\nA divisão de trabalho que decide o degrau certo: fine-tuning ensina COMPORTAMENTO (forma, estilo, formato, vocabulário do domínio, seguir um padrão à risca); RAG entrega CONHECIMENTO atualizável (fatos que mudam: política, catálogo, preço). Fato treinado no peso exige novo treino a cada mudança; fato no RAG atualiza com um UPDATE no banco. Confundir os dois custa semanas de projeto.',
                },
                {
                    type: "table",
                    value: '[["Necessidade","Ferramenta certa","Por quê"],["Fatos da empresa atualizados","RAG","Atualiza sem retreinar nada"],["Tom e formato rígidos em escala","Fine-tuning","Consistência barata por chamada"],["Poucos exemplos de ajuste","Prompt com few-shot","Sem custo de treino nenhum"],["Encurtar um prompt gigante","Fine-tuning destilando instruções","Prompt menor; custo por chamada cai"],["Corrigir um caso que errou","Caso na suíte e ajuste de prompt","Cirúrgico e reversível"]]',
                },
                {
                    type: "quote",
                    value: "Fine-tuning ensina o modelo a SER de um jeito; RAG ensina o que ele precisa SABER agora. Trocar um pelo outro é o erro mais caro da área.",
                },
                {
                    type: "text",
                    value: '## A pergunta de gate\n\nQuando o fine-tuning vale: formato muito específico em escala grande (extração com regras finas), tom de marca inegociável, jargão denso de domínio, encurtar um prompt de instruções gigante (destilar as instruções no peso e pagar menos por chamada) e o caso clássico de custo: ensinar um modelo PEQUENO a fazer, na sua tarefa estreita, o que hoje exige um grande.\n\nAntes de aprovar o projeto, a pergunta de gate, sempre com a suíte do módulo 1 como juíza: "o ganho MEDIDO sobre o melhor prompt com o modelo base paga o custo de construir o dataset e MANTER o tune vivo?". Manter, porque o modelo base evolui: a cada geração nova, seu tune do modelo antigo precisa ser re-treinado e re-avaliado ou vai ficando para trás. Fine-tuning não é um projeto: é uma assinatura.',
                },
            ],
            questions: [
                {
                    statement: "Qual a ordem da escada de intervenção?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Prompt primeiro, depois RAG e por último fine-tuning",
                            isCorrect: true,
                        },
                        {
                            text: "Fine-tuning primeiro, para começar do jeito definitivo",
                            isCorrect: false,
                        },
                        {
                            text: "RAG primeiro, porque contexto resolve qualquer problema",
                            isCorrect: false,
                        },
                        {
                            text: "Tanto faz: as três técnicas produzem o mesmo resultado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o fine-tuning ensina bem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Comportamento, forma e estilo consistentes",
                            isCorrect: true,
                        },
                        {
                            text: "Fatos novos que mudam toda semana na empresa",
                            isCorrect: false,
                        },
                        {
                            text: "A senha dos sistemas internos com segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Idiomas que o modelo base nunca viu antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que fatos atualizáveis pedem RAG e não fine-tuning?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fato muda: o RAG atualiza na hora; o tune exige retreinar",
                            isCorrect: true,
                        },
                        {
                            text: "Porque fatos ocupam mais espaço nos pesos do que estilo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o fine-tuning é proibido para dados factuais reais",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o RAG é sempre mais barato em qualquer cenário de uso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um prompt de 4 mil tokens de instruções repetido em cada chamada. O que o tuning oferece?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Destilar as instruções no peso e encurtar o prompt em produção",
                            isCorrect: true,
                        },
                        {
                            text: "Comprimir os tokens do prompt num formato binário próprio da API",
                            isCorrect: false,
                        },
                        {
                            text: "Fazer o provedor cobrar o prompt longo só uma vez por mês",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a janela para o prompt caber sem custo adicional",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual a pergunta de gate antes de aprovar um projeto de fine-tuning?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O ganho medido na suíte paga o custo de manter o tune vivo?",
                            isCorrect: true,
                        },
                        {
                            text: "O nome do modelo tunado ficará bonito no material de venda?",
                            isCorrect: false,
                        },
                        {
                            text: "A concorrência já anunciou que treina modelos próprios?",
                            isCorrect: false,
                        },
                        {
                            text: "O time consegue terminar o treino antes da sexta-feira?",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "SFT na prática",
            blocks: [
                {
                    type: "text",
                    value: "# Ensinar pelo exemplo\n\nSFT (supervised fine-tuning) é o formato básico: você mostra pares de entrada e saída IDEAL, e o modelo aprende a imitar. O insumo é o dataset, e vale gravar: QUALIDADE ganha de quantidade por goleada. Centenas a poucos milhares de exemplos excelentes batem dezenas de milhares de medianos, porque o modelo aprende exatamente o que você mostrar, inclusive os defeitos.\n\nDe onde vêm exemplos bons: produção CURADA (as melhores respostas reais, revisadas: o feedback do módulo 2 aponta as candidatas), especialistas escrevendo do zero e o caminho sintético com revisão (um modelo grande gera, humano cura). O formato: conversas completas, com o system prompt de produção, cobrindo a diversidade real do uso, a mesma lição do golden set.",
                },
                {
                    type: "code",
                    value: '// Uma linha do dataset (JSONL): a conversa com a resposta ideal\n{"messages": [\n  {"role": "system", "content": "Voce extrai pedidos da Paginacem..."},\n  {"role": "user", "content": "quero devolver o livro que veio rasgado"},\n  {"role": "assistant", "content": "{\\"acao\\": \\"devolucao\\", \\"motivo\\": \\"avaria\\", \\"itens\\": [...]}"}\n]}',
                },
                {
                    type: "table",
                    value: '[["Passo","Prática","Armadilha"],["Curar dados","Melhores casos reais revisados","Volume sem qualidade"],["Separar avaliação","Suíte fora do treino","Contaminação infla a nota"],["Treinar","Épocas e defaults conservadores","Overfitting decorando exemplos"],["Comparar","Base com prompt bom contra o tune","Comparar com baseline fraco"],["Decidir","Margem clara a favor do tune","Aprovar por empolgação"]]',
                },
                {
                    type: "quote",
                    value: "O dataset É o produto do fine-tuning: o treino é apertar um botão; a curadoria é a engenharia.",
                },
                {
                    type: "text",
                    value: "## Treino, overfitting e a comparação honesta\n\nO treino em si roda pela API de tuning do provedor ou da plataforma: upload do JSONL, poucas épocas, defaults conservadores. O inimigo técnico é o OVERFITTING: o modelo decora os exemplos em vez de generalizar. O sinal: métrica de treino cada vez melhor, desempenho na suíte de avaliação (que ficou FORA do treino, separação sagrada) piorando. Mitigação: menos épocas, mais diversidade no dataset.\n\nE a decisão final exige comparação honesta: o adversário do tune não é o modelo base pelado, é o base com o MELHOR prompt que você conseguir escrever. Vencer baseline fraco é autoengano com gráfico. Exemplo com números redondos: extração da Paginacem, base grande com prompt bom acerta 94% custando X por chamada; pequeno tunado acerta 93% custando X dividido por 8. Para esse caso de uso, o ponto perdido pode valer a fatura 8 vezes menor: decisão de produto, tomada com a suíte na mesa.",
                },
            ],
            questions: [
                {
                    statement: "O que é SFT?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Treinar com pares de entrada e saída ideais para imitar",
                            isCorrect: true,
                        },
                        {
                            text: "Deixar o modelo conversar sozinho até se aperfeiçoar",
                            isCorrect: false,
                        },
                        {
                            text: "Somar dois modelos diferentes num único arquivo de pesos",
                            isCorrect: false,
                        },
                        {
                            text: "Filtrar as respostas ruins do modelo com um segundo filtro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qualidade ou quantidade no dataset de SFT?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Centenas de exemplos excelentes batem milhares medianos",
                            isCorrect: true,
                        },
                        {
                            text: "Quantidade sempre: dez mil ruins superam mil excelentes",
                            isCorrect: false,
                        },
                        {
                            text: "Tanto faz: o treino corrige os exemplos ruins sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma das duas: o que importa é a marca do provedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o dataset de avaliação fica fora do treino?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Treinar no que avalia contamina e infla a nota final",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a API de tuning recusa arquivos muito grandes",
                            isCorrect: false,
                        },
                        {
                            text: "Para economizar os tokens cobrados nas épocas de treino",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a avaliação exige outro formato de arquivo JSON",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o sinal clássico de overfitting no tune?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Métrica de treino ótima e desempenho pior na avaliação",
                            isCorrect: true,
                        },
                        {
                            text: "Custo de treino maior que o previsto no orçamento do mês",
                            isCorrect: false,
                        },
                        {
                            text: "Respostas mais lentas em todas as chamadas de produção",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo se recusando a responder o que estava no dataset",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O pequeno tunado perde 1 ponto para o grande com prompt, custando 8 vezes menos. Qual a decisão?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Depende do produto: com margem de qualidade, o custo decide",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre o grande: um ponto de acurácia paga qualquer custo",
                            isCorrect: false,
                        },
                        {
                            text: "Sempre o pequeno: custo baixo vence qualquer diferença",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: o empate técnico obriga a treinar um terceiro modelo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Preferências: DPO e RLHF",
            blocks: [
                {
                    type: "text",
                    value: '# Ensinar o gosto, não o gabarito\n\nSFT funciona quando existe a resposta ideal para imitar. Mas muita qualidade não tem gabarito: entre duas respostas ACEITÁVEIS, uma é mais clara, mais útil, mais no tom. Para essas dimensões existe o treino por PREFERÊNCIA: em vez de "a resposta certa é esta", o dado diz "entre A e B, preferimos A".\n\nO método clássico é o RLHF (um modelo de recompensa aprende as preferências e um loop de reinforcement learning otimiza contra ele): é o que os grandes provedores usam nos seus modelos, e é caro e instável demais para times de produto. A alternativa que virou padrão fora dos labs em 2026 é o DPO (direct preference optimization): treina DIRETAMENTE nos pares escolhida contra rejeitada, sem modelo de recompensa nem RL. Mais simples, mais estável, resultado comparável na escala de produto.',
                },
                {
                    type: "table",
                    value: '[["Método","Como aprende","Custo e uso típico"],["SFT","Imita saídas ideais","O primeiro passo de qualquer tune"],["RLHF","Recompensa mais RL por cima","Provedores e labs; caro e instável"],["DPO","Direto nos pares escolhida e rejeitada","Padrão de produto em 2026; simples"],["Juiz como gerador de pares","LLM cria pares que humanos revisam","Escala barata; exige calibração"]]',
                },
                {
                    type: "quote",
                    value: "SFT dá o gabarito; DPO dá o gosto. Produto maduro costuma precisar dos dois, nessa ordem, e nunca do segundo sem o primeiro.",
                },
                {
                    type: "text",
                    value: '## De onde vêm os pares, e o risco do gosto errado\n\nA matéria-prima quase de graça: o feedback de produção do módulo 2. Um joinha negativo seguido de regeneração aprovada é um par pronto (rejeitada e escolhida); uma correção editada idem. Complementos: anotadores internos com rubrica (a mesma do juiz do módulo 1) e o juiz LLM gerando pares em escala, com calibração humana por amostra.\n\nQuando usar: DEPOIS do SFT, quando as dimensões subjetivas da suíte estagnaram e há volume de feedback para colher. E o risco específico: otimizar preferência com rubrica desalinhada treina o GOSTO ERRADO: o modelo aprende a agradar o anotador (respostas longas, bajulação, concordância fácil), não a servir o usuário. A rubrica de preferência merece a mesma calibração que o juiz: é ela que define o que "melhor" significa.',
                },
            ],
            questions: [
                {
                    statement: "O que o DPO otimiza?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A escolha entre duas respostas: aprender a preferida",
                            isCorrect: true,
                        },
                        {
                            text: "O tamanho do arquivo final dos pesos do modelo treinado",
                            isCorrect: false,
                        },
                        {
                            text: "A velocidade de geração dos tokens durante a produção",
                            isCorrect: false,
                        },
                        {
                            text: "O preço cobrado pelo provedor a cada época de treino",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o DPO virou padrão em times de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Treina direto nos pares, sem modelo de recompensa nem RL",
                            isCorrect: true,
                        },
                        {
                            text: "Porque é o único método aceito nas APIs dos provedores",
                            isCorrect: false,
                        },
                        {
                            text: "Porque dispensa qualquer dado rotulado por humanos no fluxo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque roda no navegador sem precisar de GPU dedicada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "De onde saem bons pares de preferência quase de graça?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Do feedback de produção: joinhas e respostas editadas",
                            isCorrect: true,
                        },
                        {
                            text: "Dos exemplos prontos do site oficial de documentação",
                            isCorrect: false,
                        },
                        {
                            text: "De um gerador aleatório que embaralha respostas antigas",
                            isCorrect: false,
                        },
                        {
                            text: "Da equipe jurídica, que revisa os contratos da empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a ordem entre SFT e treino de preferência?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Preferência depois do SFT, quando o subjetivo estagna",
                            isCorrect: true,
                        },
                        {
                            text: "Preferência antes, para preparar o modelo para o gabarito",
                            isCorrect: false,
                        },
                        {
                            text: "Nunca juntos: escolher um dos dois métodos por projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Tanto faz: a ordem dos treinos não muda o resultado final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o risco de otimizar preferências com rubrica desalinhada?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Treinar o gosto errado: agradar o anotador, não o usuário",
                            isCorrect: true,
                        },
                        {
                            text: "Corromper os pesos base e perder o modelo permanentemente",
                            isCorrect: false,
                        },
                        {
                            text: "Estourar a janela de contexto com pares longos de treino",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: toda preferência humana sempre melhora o modelo final",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "LoRA e eficiência",
            blocks: [
                {
                    type: "text",
                    value: "# Ajustar sem reescrever o cérebro\n\nFine-tuning COMPLETO atualiza todos os bilhões de parâmetros: precisa de GPU de sobra e cada versão é um checkpoint de dezenas de gigabytes. O LoRA (low-rank adaptation) mudou a economia disso: congela o modelo base e treina só matrizes PEQUENAS acopladas ao lado (os adapters). Uma fração mínima dos parâmetros é treinada, com qualidade próxima do completo na esmagadora maioria dos usos de produto.\n\nAs consequências operacionais importam mais que a matemática: o treino cabe numa GPU modesta (e o QLoRA aperta mais ainda, quantizando o base durante o treino), e o ARTEFATO é um arquivo de megabytes, não gigabytes: versiona no git como qualquer artefato, distribui fácil, faz rollback fácil.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Fine-tuning completo","LoRA"],["Parâmetros treinados","Todos os bilhões","Fração mínima em matrizes anexas"],["GPU de treino","Cluster caro","Uma GPU modesta (QLoRA menos ainda)"],["Artefato por versão","Checkpoint de gigabytes","Adapter de megabytes"],["Servir N variantes","N cópias do modelo na memória","Um base e N adapters dinâmicos"],["Qualidade em produto","A referência","Próxima na maioria dos casos"]]',
                },
                {
                    type: "quote",
                    value: "O LoRA transformou o fine-tuning de projeto de laboratório em artefato de engenharia: pequeno o bastante para versionar, barato o bastante para errar e tentar de novo.",
                },
                {
                    type: "text",
                    value: "## Multi-tenant e o que os provedores escondem\n\nO truque que o LoRA habilita em produção: servir N variantes com a infra de UMA. O modelo base fica carregado na GPU e os adapters são acoplados dinamicamente por requisição (servidores de inferência modernos, como o vLLM da próxima aula, fazem isso nativamente). Um adapter por cliente, ou por tarefa, pagando a memória de um único modelo: é o desenho padrão de produto B2B com personalização por cliente.\n\nQuando o completo ainda se justifica: mudança profunda de capacidade (novo idioma inteiro, domínio muito distante do pré-treino), coisa rara em produto e comum em lab. E uma curiosidade útil: as APIs de tuning dos provedores usam variantes eficientes como essas por baixo do pano; você não vê, mas é o que explica preço, velocidade e limites do serviço.",
                },
            ],
            questions: [
                {
                    statement: "Qual a ideia central do LoRA?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Congelar o base e treinar matrizes pequenas anexas",
                            isCorrect: true,
                        },
                        {
                            text: "Treinar duas vezes o modelo inteiro para reforçar",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzir a janela de contexto para acelerar o treino",
                            isCorrect: false,
                        },
                        {
                            text: "Apagar camadas do modelo que não são mais usadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o adapter facilita a operação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "É pequeno: fácil de versionar, guardar e distribuir",
                            isCorrect: true,
                        },
                        {
                            text: "Porque dispensa avaliação depois de cada treino novo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque se instala direto no navegador dos usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Porque cresce junto com o modelo base a cada release",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o LoRA viabiliza multi-tenant com um modelo por cliente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um base na GPU e adapters trocados dinamicamente por request",
                            isCorrect: true,
                        },
                        {
                            text: "Uma GPU exclusiva para cada cliente, cobrada no plano premium",
                            isCorrect: false,
                        },
                        {
                            text: "Cada cliente baixa o modelo base inteiro no primeiro acesso",
                            isCorrect: false,
                        },
                        {
                            text: "Um prompt gigante que simula os ajustes finos de cada cliente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o QLoRA acrescenta ao LoRA?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Base quantizado no treino: cabe em GPU ainda menor",
                            isCorrect: true,
                        },
                        {
                            text: "Quantidade maior de dados por época de treinamento",
                            isCorrect: false,
                        },
                        {
                            text: "Qualidade garantida acima do full fine-tuning clássico",
                            isCorrect: false,
                        },
                        {
                            text: "Queda automática de preço nas APIs dos provedores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando o fine-tuning completo ainda se justifica?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Mudança profunda de capacidade, raro fora dos laboratórios",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre que o orçamento do trimestre estiver disponível",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o adapter treinado passar de dez megabytes de tamanho",
                            isCorrect: false,
                        },
                        {
                            text: "Em todo produto B2B, por exigência dos contratos grandes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Modelos abertos e self-host",
            blocks: [
                {
                    type: "text",
                    value: "# Rodar o seu\n\nModelo ABERTO é o de pesos publicados: você baixa, roda na sua GPU, ajusta como quiser. Em 2026 as famílias conhecidas incluem Llama, Mistral, Qwen, DeepSeek e Gemma, mas guarde o critério, não o ranking: o líder troca a cada trimestre, e quem decide qual serve para VOCÊ é a sua suíte rodada nos candidatos, nunca o benchmark público do momento.\n\nQuando self-host entra na mesa: dado que NÃO PODE sair da sua infra (regulação, sigilo industrial: o requisito elimina a API antes de qualquer conta), volume alto e ESTÁVEL (a matemática abaixo), controle total (a versão que você congela é sua para sempre, tune profundo com LoRA incluído) e latência de rede local quando ela importa.",
                },
                {
                    type: "table",
                    value: '[["Cenário","Melhor caminho","Por quê"],["Dado proibido de sair","Self-host","O requisito elimina a API"],["Volume alto e estável","Self-host ou inferência de abertos","A conta fecha contra o fixo"],["Volume baixo ou errático","API paga por uso","GPU parada é prejuízo puro"],["Time sem gente de infra","API ou inferência gerenciada","Operar GPU é um ofício próprio"],["Tune profundo e controle","Self-host com LoRA","Liberdade total sobre os pesos"]]',
                },
                {
                    type: "quote",
                    value: "Modelo aberto é grátis como filhote de cachorro: o custo não está em adquirir, está em criar. A GPU parada come orçamento mesmo dormindo.",
                },
                {
                    type: "text",
                    value: "## A conta, a ferramenta e o meio-termo\n\nA conta de compensação: GPU dedicada custa um valor FIXO por mês, rodando ou parada; o mesmo volume em API custa por uso. Volume mensal estável acima do ponto de equilíbrio: o fixo começa a pagar. Volume baixo ou errático: API ganha sempre. E some o custo escondido: alguém do time vira responsável por drivers, quantização, autoscale e upgrades: tempo de engenharia é o item mais caro da planilha.\n\nA ferramenta padrão para servir é o vLLM: servidor de inferência com batching contínuo e uso eficiente de memória, expondo uma API compatível com o formato dos provedores: o seu proxy do módulo 5 mal percebe a troca. E existe o meio-termo que resolve muita empresa: provedores de INFERÊNCIA de modelos abertos, que servem Llama e afins por token, sem você operar GPU: preço menor que os modelos top fechados, zero infra. A migração, em qualquer direção, é sempre o mesmo rito: suíte nos candidatos, comparação honesta, canário.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza um modelo aberto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Os pesos publicados, para rodar e ajustar por conta própria",
                            isCorrect: true,
                        },
                        {
                            text: "O código do site do provedor disponível no GitHub oficial",
                            isCorrect: false,
                        },
                        {
                            text: "A ausência de custo em qualquer cenário de uso comercial",
                            isCorrect: false,
                        },
                        {
                            text: "A licença que obriga a publicar os seus dados de treino",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual requisito elimina a API fechada de cara?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dado que não pode sair da infraestrutura por regulação",
                            isCorrect: true,
                        },
                        {
                            text: "A necessidade de respostas em menos de dez segundos",
                            isCorrect: false,
                        },
                        {
                            text: "Equipe com mais de cinco desenvolvedores no projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Uso de mais de um idioma nas conversas dos usuários",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que GPU ociosa muda a conta do self-host?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O custo é fixo por mês; sem volume constante, vira prejuízo",
                            isCorrect: true,
                        },
                        {
                            text: "Porque as GPUs paradas estragam bem mais rápido pelo calor",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a nuvem multa instâncias com uso abaixo da média",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os drivers expiram quando não são usados por dias",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o vLLM oferece a quem serve modelo aberto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Inferência eficiente com batching e API compatível",
                            isCorrect: true,
                        },
                        {
                            text: "Treinamento distribuído de modelos em várias nuvens",
                            isCorrect: false,
                        },
                        {
                            text: "Um marketplace de adapters prontos para qualquer base",
                            isCorrect: false,
                        },
                        {
                            text: "A conversão automática de modelos fechados em abertos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Migrar do fechado para um aberto: qual o processo profissional?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Rodar a suíte no candidato, comparar e migrar via canário",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar direto: abertos de 2026 empatam com qualquer fechado",
                            isCorrect: false,
                        },
                        {
                            text: "Esperar o benchmark público do trimestre e seguir o líder",
                            isCorrect: false,
                        },
                        {
                            text: "Migrar metade dos usuários sem avisar e ouvir o suporte",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: do demo ao produto",
    aulas: [
        {
            titulo: "O cenário e os requisitos",
            blocks: [
                {
                    type: "text",
                    value: "# A Paginacem vai ao ar\n\nO assistente da livraria Paginacem que você construiu nas trilhas anteriores (o RAG de políticas e catálogo, o agente de operações que consulta pedidos e propõe reembolsos com aprovação) funciona lindamente no demo. A diretoria assistiu, gostou e decidiu: lançar para os 40 mil clientes. Este módulo é o caminho entre essas duas frases, aplicando a trilha inteira num caso só.\n\nO primeiro passo é escrever o que ninguém escreve no card do produto: os REQUISITOS NÃO FUNCIONAIS. Orçamento de API: R$ 3.000 por mês. Latência: p95 percebida abaixo de 6 segundos, TTFT abaixo de 1,5. Disponibilidade: crítica em horário comercial; fora dele, degradar com honestidade é aceitável. Privacidade: dados de cliente sob LGPD. Segurança: o agente executa ações reais, então as regras da trilha de agentes (aprovação humana no crítico) seguem valendo em produção.",
                },
                {
                    type: "table",
                    value: '[["Gap encontrado","Risco se lançar assim","Aula que fecha"],["Sem suíte de avaliação","Regressão invisível a cada mudança","A2"],["Sem tracing nem métricas","Operação cega; reclamação sem diagnóstico","A2"],["Custo não projetado","Fatura surpresa; sem teto nem alerta","A3"],["Sem guardrails formais","Injection; vazamento; fora de escopo","A4"],["Sem fallback nem fila","Provedor espirra e o produto cai","A4"],["Deploy manual de prompt","Mudança sem teste e sem volta","A4"]]',
                },
                {
                    type: "quote",
                    value: "O demo prova que a ideia funciona; o checklist de produção prova que ela sobrevive à segunda-feira de manhã.",
                },
                {
                    type: "text",
                    value: '## O método do módulo\n\nCom os requisitos escritos, o inventário e a GAP ANALYSIS: o que existe (o assistente funcional em staging) contra o que falta (a tabela acima é o mapa das próximas aulas). Cada gap vira trabalho com decisão CONCRETA: números, limiares, ferramentas escolhidas.\n\nUma prática de time que este módulo usa o tempo todo: cada decisão grande gera um ADR (architecture decision record), uma página curta com o contexto, a decisão e o porquê. Daqui a um ano, quando alguém perguntar "por que Langfuse self-host e não o SaaS?", a resposta estará escrita, e não na memória de quem já saiu da empresa. Você pode discordar dos números que o módulo escolhe; o valor do exercício está em decidir COM CRITÉRIO e deixar o critério registrado.',
                },
            ],
            questions: [
                {
                    statement: "O que são requisitos não funcionais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Orçamento, latência, disponibilidade, privacidade e segurança",
                            isCorrect: true,
                        },
                        {
                            text: "As funcionalidades que o produto ainda não implementou",
                            isCorrect: false,
                        },
                        {
                            text: "Os bugs conhecidos que o time decidiu não corrigir agora",
                            isCorrect: false,
                        },
                        {
                            text: "As páginas do aplicativo que ainda não têm função definida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que fazer gap analysis antes de lançar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mapear o que falta entre o demo e a operação real",
                            isCorrect: true,
                        },
                        {
                            text: "Listar os concorrentes diretos do produto no mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Medir o desempenho dos vendedores no último trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher o nome comercial da nova versão do produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que registrar decisões em ADRs curtos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O porquê de cada escolha sobrevive à memória do time",
                            isCorrect: true,
                        },
                        {
                            text: "Porque auditorias exigem atas assinadas em cartório",
                            isCorrect: false,
                        },
                        {
                            text: "Para gerar material de marketing técnico do lançamento",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ADRs substituem os testes automatizados da suíte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O agente propõe reembolsos. Qual requisito herdado segue valendo em produção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Aprovação humana nas ações críticas e irreversíveis",
                            isCorrect: true,
                        },
                        {
                            text: "Loop sem limite de voltas para não frustrar clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Autonomia total do agente, porque produção exige velocidade",
                            isCorrect: false,
                        },
                        {
                            text: "Executar reembolsos à noite, quando ninguém está olhando",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com orçamento de R$ 3.000 por mês, o que a engenharia precisa calcular primeiro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O custo por conversa projetado no volume esperado de uso",
                            isCorrect: true,
                        },
                        {
                            text: "O salário do time dividido pelo número de features novas",
                            isCorrect: false,
                        },
                        {
                            text: "A taxa de câmbio média prevista para o próximo semestre",
                            isCorrect: false,
                        },
                        {
                            text: "O preço dos concorrentes para cobrar sempre um pouco menos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Medir: suíte e observabilidade",
            blocks: [
                {
                    type: "text",
                    value: "# Os olhos e a régua\n\nPrimeiro gap a fechar: medição. O golden set inicial da Paginacem nasce com 60 casos: 25 de políticas (o RAG: perguntas reais de troca, frete, prazo), 15 de pedidos (o agente: fluxos com ferramenta e aprovação), 10 arestas (perguntas ambíguas, fora de escopo, língua estrangeira) e 10 adversariais (injection dentro de tíquete, tentativa de puxar dado de outro cliente).\n\nAs réguas por categoria: groundedness nas políticas (juiz LLM com rubrica de critérios binários, calibrado contra 30 rótulos do time), INVARIANTES nos fluxos do agente (a ferramenta certa foi chamada? a aprovação foi pedida no crítico? conceito herdado da trilha de agentes), recusa educada nos fora de escopo e obediência ZERO nas injections. A suíte roda no CI a cada mudança de prompt: o portão do módulo 1, agora de verdade.",
                },
                {
                    type: "table",
                    value: '[["Categoria da suíte","Tamanho","Régua principal"],["Políticas (RAG)","25 casos","Groundedness por juiz calibrado"],["Pedidos (agente)","15 casos","Invariantes de fluxo e aprovação"],["Arestas e escopo","10 casos","Recusa educada quando deve"],["Adversariais","10 casos","Nenhuma instrução injetada obedecida"],["Feedback real (contínuo)","Cresce toda semana","Joinhas e edições viram casos"]]',
                },
                {
                    type: "quote",
                    value: "Sessenta casos bem escolhidos no dia do lançamento valem mais que seiscentos coletados às pressas depois do primeiro incidente.",
                },
                {
                    type: "text",
                    value: '## Observabilidade: a decisão e o ciclo\n\nA ferramenta: Langfuse SELF-HOST. O ADR registra o porquê: os traces carregam dados de cliente (LGPD pesa contra mandar para um SaaS novo) e o time já opera Postgres, que é tudo que o Langfuse pede. Instrumentação nas convenções do OpenTelemetry, spans de reescrita, busca, rerank, geração e cada ferramenta do agente, com custo, TTFT e a versão do prompt em cada trace.\n\nDashboards e alertas ligados no primeiro dia: custo por hora (teto de R$ 6, derivado do orçamento mensal distribuído com folga), p95 e TTFT, taxa de erro do provedor, taxa de "não sei" e feedback (joinha nos widgets do chat). E o ciclo humano: 20 conversas revisadas por semana, priorizando negativas, com o achado virando caso da suíte. O BASELINE da semana zero fica registrado: toda mudança futura se compara com ele.',
                },
            ],
            questions: [
                {
                    statement: "Por que a suíte inicial tem casos adversariais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Para medir a resistência a injection desde o primeiro dia",
                            isCorrect: true,
                        },
                        {
                            text: "Para deixar o relatório da diretoria mais impressionante",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o provedor exige testes de ataque no contrato de API",
                            isCorrect: false,
                        },
                        {
                            text: "Para treinar o modelo a responder com mais agressividade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o baseline registrado permite?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Comparar qualquer mudança futura com o ponto de partida",
                            isCorrect: true,
                        },
                        {
                            text: "Cobrar o provedor quando o modelo piorar com o tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Pular a suíte nas mudanças pequenas de configuração",
                            isCorrect: false,
                        },
                        {
                            text: "Publicar os números na página inicial do produto novo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que Langfuse self-host nesse cenário?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dados de cliente nos traces e o Postgres já operado pelo time",
                            isCorrect: true,
                        },
                        {
                            text: "Porque é a única ferramenta do mercado que funciona com agentes",
                            isCorrect: false,
                        },
                        {
                            text: "Porque SaaS de observabilidade não aceita clientes do Brasil",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o self-host dispensa qualquer configuração e manutenção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o papel da revisão semanal de 20 conversas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Achar padrões que métricas não pegam e gerar casos novos",
                            isCorrect: true,
                        },
                        {
                            text: "Cumprir a meta de reuniões recorrentes do trimestre do time",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir a suíte automática durante as semanas de férias",
                            isCorrect: false,
                        },
                        {
                            text: "Ranquear os clientes pelo tom das mensagens que enviaram",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O teto do alerta de custo (R$ 6 por hora) foi derivado de quê?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Do orçamento mensal distribuído por hora com folga",
                            isCorrect: true,
                        },
                        {
                            text: "Da média de custo dos concorrentes do mesmo porte",
                            isCorrect: false,
                        },
                        {
                            text: "Do limite técnico de tokens por minuto do provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Do valor sugerido na documentação da ferramenta",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A conta: custo, cache e latência",
            blocks: [
                {
                    type: "text",
                    value: "# Fazendo a conta fechar\n\nProjeção de volume: 40 mil clientes, adoção estimada em 3% ao mês = 1.200 conversas, média de 6 turnos = cerca de 7.200 gerações, mais as chamadas invisíveis (reescrita, roteamento). Contexto típico do RAG: 2.500 tokens de entrada, 300 de saída. A planilha nos três cenários (médio, p95 de uso, abuso) diz que o cenário médio cabe no orçamento, e o de abuso NÃO cabe: a conta já entrega duas decisões: precisa de cache e rota, e precisa de quota.\n\nAs decisões, cada uma com seu ADR: CACHE DE PROMPT (system e políticas fixas na frente do layout: o desconto no prefixo e o corte de TTFT vêm de graça com a disciplina de layout), ROTEAMENTO (consultas simples de política, cerca de 70% do tráfego histórico, vão para o modelo pequeno HOMOLOGADO pela suíte na categoria; o agente e os casos difíceis ficam no grande), FILA nos fluxos de agente (o pico de segunda-feira vira espera de segundos) e BATCH no retroativo (classificar conversas antigas de madrugada, pela metade do preço).",
                },
                {
                    type: "table",
                    value: '[["Decisão","Efeito esperado","Guarda no dashboard"],["Cache de prompt no prefixo fixo","Corta custo de entrada e TTFT","Taxa de acerto do cache"],["Rota pequena para consultas simples","Grande parte do tráfego barateia","Suíte por rota; feedback por rota"],["Fila nos fluxos de agente","Pico vira espera curta, não erro","Tempo de fila"],["Batch no retroativo","Metade do preço fora do pico","Prazo aceito pelo caso de uso"],["Quota de 20 conversas por cliente","Orçamento blindado contra abuso","Interface honesta do limite"]]',
                },
                {
                    type: "quote",
                    value: "A conta que fecha no papel antes do lançamento é a que não vira reunião de emergência depois da primeira fatura.",
                },
                {
                    type: "text",
                    value: '## Latência e a revisão mensal\n\nPara os alvos de latência: streaming já existia; o cache de prompt derruba o TTFT do prefixo; o esqueleto de estados no widget ("consultando seu pedido...") transforma a espera do agente em progresso visível. O orçamento de latência por etapa (decomposto do trace) vira SLO interno com alerta.\n\nE a cláusula de realidade: a projeção usou 3% de adoção. Se vierem 10%, quem segura são as guardas: o alerta de custo por hora dispara cedo, a quota limita o estouro por cliente e a fila degrada o lote antes de tocar o interativo. A conta se revisa TODO MÊS contra o uso real: o drift de uso do módulo 2 também é financeiro.',
                },
            ],
            questions: [
                {
                    statement: "Por que rotear consultas simples para um modelo pequeno?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A maior parte do tráfego fica barata sem perder qualidade",
                            isCorrect: true,
                        },
                        {
                            text: "Porque modelos pequenos entendem melhor os clientes novos",
                            isCorrect: false,
                        },
                        {
                            text: "Para reservar o modelo grande para a equipe interna da loja",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o provedor obriga o uso de dois modelos por contrato",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a quota de 20 conversas por cliente protege?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O orçamento mensal contra abuso e uso desmedido",
                            isCorrect: true,
                        },
                        {
                            text: "A velocidade do banco de dados nos horários de pico",
                            isCorrect: false,
                        },
                        {
                            text: "O ranking do produto nas lojas de aplicativos móveis",
                            isCorrect: false,
                        },
                        {
                            text: "A meta de vendas do time comercial no fim do trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que valida a rota barata antes de ela assumir a maior parte do tráfego?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A suíte rodada na rota nova, comparando com o baseline",
                            isCorrect: true,
                        },
                        {
                            text: "A opinião do time no canal do Slack após o teste manual",
                            isCorrect: false,
                        },
                        {
                            text: "O selo de homologação emitido pelo próprio provedor da API",
                            isCorrect: false,
                        },
                        {
                            text: "Uma semana de produção com todos os clientes de uma vez",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o layout do prompt importa para o custo aqui?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Prefixo fixo estável ativa o cache e corta entrada e TTFT",
                            isCorrect: true,
                        },
                        {
                            text: "Prompts bonitos recebem desconto de fidelidade do provedor",
                            isCorrect: false,
                        },
                        {
                            text: "O layout muda a cobrança dos tokens de saída da resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o modelo consegue ler mais rápido textos formatados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A projeção usou 3% de adoção. Se vierem 10%, o que protege o orçamento?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Alerta de custo, quota por cliente e fila degradando o lote",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: adoção alta é sempre boa notícia sem risco algum",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor, que congela o preço quando o uso triplica",
                            isCorrect: false,
                        },
                        {
                            text: "A sorte de o hardware aguentar até a próxima reunião",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Blindar: segurança, resiliência e deploy",
            blocks: [
                {
                    type: "text",
                    value: "# À prova de segunda-feira\n\nGuardrails da Paginacem: na entrada, o classificador nano de ESCOPO (livraria e pedidos; imposto de renda recebe recusa educada), moderação e limite de tamanho; na saída, groundedness no RAG, schema nas ações do agente e a checagem de OWNERSHIP dentro de cada ferramenta: o pedido consultado pertence ao cliente logado, sempre (a regra da trilha de agentes virou código de produção). Tudo com taxa de bloqueio no dashboard e amostra revisada na sexta.\n\nResiliência: timeout de 10 segundos na geração, retry duplo com backoff e jitter, breaker no provedor, FALLBACK homologado (o modelo alternativo já passou pela suíte: a diferença de nota está documentada no ADR) e a degradação honesta de última instância (mensagem clara mais FAQ estático). KILL SWITCH por feature: chat e agente têm flags SEPARADAS, porque desligar o agente problemático não pode matar o chat saudável.",
                },
                {
                    type: "table",
                    value: '[["Camada","Decisão da Paginacem","Verificação"],["Escopo de entrada","Nano classifica; recusa educada","Taxa de recusa e amostra semanal"],["Saída do agente","Schema e ownership por ferramenta","Zero PII cruzada na suíte"],["Fallback","Modelo B homologado na suíte","Diferença de nota documentada"],["Kill switch","Flag separada por feature","Testado no game day"],["Canário","10% do tráfego por 24 a 48h","Feedback; erro; custo comparados"]]',
                },
                {
                    type: "quote",
                    value: "Lançar sem kill switch é decolar sem trem de pouso: quase sempre dá certo, e o quase é exatamente o problema.",
                },
                {
                    type: "text",
                    value: "## Deploy e o ensaio geral\n\nA esteira: prompts no git com versão, CI rodando a suíte inteira (a adversarial junto), staging, e o CANÁRIO de 10% por 24 a 48 horas comparando feedback, erro, custo e latência com a versão antiga. Rollback é um revert.\n\nAntes do lançamento, o ENSAIO GERAL em dois atos. O game day: simular o provedor fora (o breaker abre? o fallback assume? as mensagens fazem sentido? o runbook foi encontrado?). E o red team de uma tarde: as injections dirigidas ao domínio (tíquete com instrução escondida mandando aprovar reembolso). O resultado esperado, e obtido: a proposta maliciosa até nasce, e MORRE na tela de aprovação humana, que exibe a evidência e o operador nega. Defesa em camadas funcionando: o texto hostil entrou, e não teve poder. O caso vira teste permanente da suíte adversarial, e o lançamento sai por coortes de clientes, com os dashboards abertos.",
                },
            ],
            questions: [
                {
                    statement: "Por que kill switch separado para chat e agente?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Desligar o agente com problema sem derrubar o chat",
                            isCorrect: true,
                        },
                        {
                            text: "Porque cada flag exige uma licença paga separada",
                            isCorrect: false,
                        },
                        {
                            text: "Para os dois times de produto não brigarem no deploy",
                            isCorrect: false,
                        },
                        {
                            text: "Porque flags juntas travam o painel de configuração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a checagem de ownership nas ferramentas impede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um cliente acessar pedido ou dado de outro cliente",
                            isCorrect: true,
                        },
                        {
                            text: "O agente usar duas ferramentas na mesma conversa",
                            isCorrect: false,
                        },
                        {
                            text: "O cliente abrir mais de uma conversa na mesma semana",
                            isCorrect: false,
                        },
                        {
                            text: "A loja alterar as políticas sem avisar os clientes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o canário de 10% por 24 a 48 horas compara?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Feedback, erro, custo e latência entre versão nova e antiga",
                            isCorrect: true,
                        },
                        {
                            text: "O número de linhas de código entre as duas versões novas",
                            isCorrect: false,
                        },
                        {
                            text: "A opinião dos desenvolvedores sobre a beleza do prompt",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo de compilação do backend em cada um dos ambientes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o objetivo do game day antes do lançamento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ensaiar incidentes com tudo de mentira antes do de verdade",
                            isCorrect: true,
                        },
                        {
                            text: "Comemorar o fim do projeto com a equipe de engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Apresentar o produto para a diretoria em ambiente seguro",
                            isCorrect: false,
                        },
                        {
                            text: "Medir a velocidade de digitação do time de operações",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A injection do teste virou proposta de reembolso e PAROU na aprovação humana. Qual o veredito?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Defesa em camadas funcionou; registrar e virar caso da suíte",
                            isCorrect: true,
                        },
                        {
                            text: "Falha total: o texto malicioso nem deveria ter sido lido",
                            isCorrect: false,
                        },
                        {
                            text: "Sorte de principiante que não se repete em produção real",
                            isCorrect: false,
                        },
                        {
                            text: "Motivo para remover a aprovação humana, que só atrasou o ataque",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O lançamento e o ofício",
            blocks: [
                {
                    type: "text",
                    value: "# A régua final\n\nPrimeira semana no ar, números reais contra a projeção: adoção de 4,1% (acima da estimativa, dentro das guardas), custo dentro do teto com a rota barata absorvendo 72% do tráfego, um incidente (fila represada na segunda de manhã; o runbook foi seguido, prioridade segurou o interativo, 18 minutos de espera alta no lote e nenhum erro na cara de cliente). O ciclo semanal girando: 4 casos novos na suíte vindos de feedback real.\n\nO produto não está PRONTO: está OPERADO. É essa a mudança de mentalidade que fecha a trilha: o ciclo de feedback, trace, caso, suíte, correção e canário não termina nunca, e é ele (não o lançamento) que faz o produto melhorar toda semana.",
                },
                {
                    type: "table",
                    value: '[["Pilar","Pergunta final","Ferramenta desta trilha"],["Medir","A suíte roda a cada mudança?","Golden set; juiz calibrado; CI"],["Observar","Vejo custo, latência e qualidade agora?","Traces; dashboards; alertas"],["Custear","A conta fecha no pior cenário?","Projeção; cache; rotas; quotas"],["Blindar","Injection e vazamento têm camadas?","Guardrails; privilégio mínimo; red team"],["Operar","Incidente às 3h tem página?","Runbook; on-call; game day"],["Evoluir","Feedback vira caso e melhoria?","Ciclo semanal; canário; ADRs"]]',
                },
                {
                    type: "quote",
                    value: "Demo é o que o sistema faz quando tudo dá certo; produto é o que ele faz quando tudo dá errado. O seu trabalho é a diferença entre os dois.",
                },
                {
                    type: "text",
                    value: "## O ofício\n\nOlhe o caminho percorrido: como os modelos funcionam por dentro, construir aplicações sobre as APIs, fundamentar respostas com RAG, dar mãos ao modelo com agentes, e agora sustentar tudo isso no ar com medição, operação e custo sob controle. O título do cargo varia com a empresa (AI engineer, engenheiro de aplicações de IA, dev que domina LLMs); o OFÍCIO é um só: transformar modelos probabilísticos em produtos confiáveis, com medição no lugar de fé.\n\nO campo vai continuar mudando rápido: modelos, ferramentas e nomes trocam a cada trimestre. Os fundamentos que você levou daqui (tokens e contexto, retrieval, loops de agente, avaliação, resiliência, o ciclo de operação) mudam devagar, e são eles que fazem o profissional atravessar as trocas de moda sem recomeçar do zero. O método de aprender o que vier é o mesmo que você praticou: construir, medir, operar. Modelos passam; o método fica. Bom trabalho.",
                },
            ],
            questions: [
                {
                    statement: "Por que o produto nunca está pronto e sim operado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O ciclo de feedback, suíte e canário roda sem fim",
                            isCorrect: true,
                        },
                        {
                            text: "Porque sempre falta orçamento para o último sprint",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os provedores mudam o preço a cada trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Porque nenhum time consegue zerar o backlog de bugs",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que diferencia demo de produto, segundo a trilha?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Como o sistema se comporta quando as coisas dão errado",
                            isCorrect: true,
                        },
                        {
                            text: "A quantidade de features visíveis na tela inicial do site",
                            isCorrect: false,
                        },
                        {
                            text: "O número de usuários simultâneos que o marketing anuncia",
                            isCorrect: false,
                        },
                        {
                            text: "A linguagem de programação escolhida para o backend",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que os fundamentos valem mais que o nome das ferramentas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ferramentas trocam a cada trimestre; fundamentos ficam",
                            isCorrect: true,
                        },
                        {
                            text: "Porque os fundamentos caem em todas as entrevistas de emprego",
                            isCorrect: false,
                        },
                        {
                            text: "Porque as ferramentas mais modernas não têm boa documentação",
                            isCorrect: false,
                        },
                        {
                            text: "Porque estudar cada ferramenta nova cansa bem mais que a teoria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Na primeira semana real, o que comparar com a projeção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Adoção, custo por conversa e os incidentes operados",
                            isCorrect: true,
                        },
                        {
                            text: "O número total de commits do time durante o lançamento",
                            isCorrect: false,
                        },
                        {
                            text: "As curtidas do anúncio de lançamento nas redes sociais",
                            isCorrect: false,
                        },
                        {
                            text: "A idade média dos clientes que abriram o assistente na semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o ofício do AI engineer, na síntese da trilha?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Transformar modelos probabilísticos em produtos confiáveis",
                            isCorrect: true,
                        },
                        {
                            text: "Treinar os maiores modelos possíveis dentro da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Escrever os prompts mais criativos do mercado de tecnologia",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir os times inteiros de backend por agentes autônomos",
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
