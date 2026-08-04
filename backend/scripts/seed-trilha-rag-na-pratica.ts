// Seed da trilha RAG na Prática, estagio 6 do roadmap de Engenharia de IA.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-rag-na-pratica.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "RAG na Prática";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Respostas fundamentadas nos seus documentos: a anatomia de um RAG, ingestão e chunking, embeddings com banco vetorial (pgvector de verdade), retrieval com busca híbrida e reranking, o prompt aumentado com citações, avaliação com conjunto de teste e um assistente sobre documentos de ponta a ponta.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Por que RAG",
    aulas: [
        {
            titulo: "O problema que o RAG resolve",
            blocks: [
                {
                    type: "text",
                    value: "# O chatbot que não conhece a sua empresa\n\nO chatbot da trilha anterior tem um teto: ele só sabe o que está no system prompt e o que as ferramentas consultam ponto a ponto. Pergunte sobre o manual interno de 400 páginas, a base de artigos do suporte ou os contratos do jurídico, e não há de onde tirar: o modelo não conhece os SEUS documentos, e o conhecimento dele congelou no corte de treinamento.\n\nRAG (retrieval-augmented generation, geração aumentada por recuperação) é a resposta padrão da indústria: ANTES de gerar, o sistema BUSCA os trechos relevantes nos seus documentos e os coloca no contexto; o modelo responde fundamentado neles, citando de onde tirou. Três problemas resolvidos de uma vez: conhecimento privado (seus dados), atualidade (documento atualizado hoje responde hoje) e verificabilidade (a resposta aponta a fonte).",
                },
                {
                    type: "table",
                    value: '[["Dor sem RAG","Com RAG"],["Modelo não conhece dados privados","Trechos dos seus documentos entram no contexto"],["Conhecimento congelado no corte","A base é atualizada sem retreinar nada"],["Resposta sem fonte verificável","Citação do documento e trecho de origem"],["Alucinação em pergunta factual","Resposta ancorada no texto recuperado"]]',
                },
                {
                    type: "quote",
                    value: "RAG transforma pergunta de memória em pergunta de leitura: em vez de confiar no que o modelo decorou, o sistema entrega o texto certo e pede a resposta fundamentada nele.",
                },
                {
                    type: "text",
                    value: '## Por que não outras vias\n\nVocê já conhece as alternativas e seus limites. Colocar TUDO no contexto: caro, lento e degrada no meio (janela de contexto, Fundamentos módulo 4); funciona para UM documento, não para uma base. Fine-tuning: ensina comportamento e estilo, não é banco de fatos atualizável (e cada atualização vira retreino). Ferramentas pontuais: perfeitas para dados estruturados (o pedido 123), impraticáveis para "o que o manual diz sobre férias".\n\nO RAG ocupa exatamente esse meio: conhecimento textual, volumoso e mutável, consultado por significado. A aula seguinte abre o capô da arquitetura.',
                },
            ],
            questions: [
                {
                    statement: "Quais três problemas o RAG resolve de uma vez?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Conhecimento privado, atualidade e resposta com fonte",
                            isCorrect: true,
                        },
                        {
                            text: "Custo zero, velocidade infinita e criatividade total",
                            isCorrect: false,
                        },
                        {
                            text: "Streaming, memória e cancelamento de resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Autenticação, rate limit e orçamento de tokens",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o RAG faz antes de o modelo gerar a resposta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Busca os trechos relevantes nos documentos e os põe no contexto",
                            isCorrect: true,
                        },
                        {
                            text: "Treina o modelo rapidamente com todos os documentos mais novos",
                            isCorrect: false,
                        },
                        {
                            text: "Resume a conversa inteira para caber na janela",
                            isCorrect: false,
                        },
                        {
                            text: "Converte a pergunta do usuário para o inglês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Por que "colocar tudo no contexto" não substitui o RAG numa base grande?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Custo e latência por chamada, além da degradação no meio do contexto",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a API proíbe documentos no prompt",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o modelo só lê documentos em PDF",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o contexto dos modelos não aceita texto escrito em português",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que fine-tuning não é a ferramenta para conhecimento factual mutável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ensina comportamento, não é banco de fatos; atualizar exige retreinar",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o fine-tuning apaga todo o conhecimento anterior do modelo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque só funciona em modelos de embedding",
                            isCorrect: false,
                        },
                        {
                            text: "Porque é proibido em modelos proprietários",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        '"O que o manual diz sobre férias?" é caso de RAG, e "qual o status do pedido 123?" é caso de ferramenta. Qual é o critério?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Texto volumoso por significado pede RAG; dado estruturado pontual pede ferramenta",
                            isCorrect: true,
                        },
                        {
                            text: "Perguntas de RH pedem RAG; de vendas, ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "O RAG serve para os clientes externos; ferramentas, para os funcionários internos",
                            isCorrect: false,
                        },
                        {
                            text: "Não há critério: os dois resolvem qualquer caso",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A anatomia de um RAG",
            blocks: [
                {
                    type: "text",
                    value: "# Dois fluxos, um sistema\n\nTodo RAG tem dois fluxos que rodam em momentos diferentes. INDEXAÇÃO (offline, quando os documentos chegam ou mudam): carregar os arquivos, extrair o texto, dividir em pedaços (chunks), gerar o embedding de cada pedaço e gravar tudo no banco vetorial com metadados. CONSULTA (online, a cada pergunta): gerar o embedding da pergunta, buscar os pedaços mais próximos, montar o prompt com eles e gerar a resposta com citações.\n\nGuarde o diagrama mental: documentos passam por [extrair, dividir, vetorizar, gravar] uma vez; perguntas passam por [vetorizar, buscar, montar, gerar] toda vez. Os módulos desta trilha percorrem exatamente essas caixas, uma a uma.",
                },
                {
                    type: "table",
                    value: '[["Fluxo","Quando roda","Etapas"],["Indexação","Na chegada ou mudança de documentos","Extrair texto, dividir, vetorizar, gravar"],["Consulta","A cada pergunta do usuário","Vetorizar a pergunta, buscar, montar o prompt, gerar"]]',
                },
                {
                    type: "quote",
                    value: "Indexação é o trabalho de biblioteca (organizar as estantes uma vez); consulta é o bibliotecário achando os três livros certos para a pergunta de agora. RAG bom é biblioteca bem organizada.",
                },
                {
                    type: "text",
                    value: "## Onde mora a qualidade\n\nUma verdade que economiza meses: quando um RAG responde mal, o culpado quase sempre está na RECUPERAÇÃO, não na geração. Se os trechos certos chegam ao prompt, os modelos atuais respondem bem; se chegam trechos errados (ou o certo não chega), nenhum prompt salva. Por isso esta trilha gasta a maior parte do tempo na metade esquerda do diagrama: chunking, embeddings, retrieval e avaliação da busca.\n\nA regra de depuração que você vai usar sempre: antes de mexer no prompt, imprima OS TRECHOS RECUPERADOS. Oito em dez problemas estão visíveis ali.",
                },
                {
                    type: "code",
                    value: "# O esqueleto dos dois fluxos (pseudocodigo do que a trilha constroi)\n\ndef indexar(documento):\n    texto = extrair_texto(documento)          # modulo 2\n    pedacos = dividir_em_chunks(texto)        # modulo 2\n    for p in pedacos:\n        vetor = embedding(p.texto)            # modulo 3\n        gravar(vetor, p.texto, p.metadados)   # modulo 3\n\ndef responder(pergunta):\n    vetor = embedding(pergunta)\n    trechos = buscar_proximos(vetor, k=8)     # modulo 4\n    prompt = montar_prompt(pergunta, trechos) # modulo 5\n    return gerar_com_citacoes(prompt)         # modulo 5",
                },
            ],
            questions: [
                {
                    statement: "Quais são os dois fluxos de todo RAG?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Indexação (offline) e consulta (a cada pergunta)",
                            isCorrect: true,
                        },
                        {
                            text: "Treinamento e inferência do modelo de geração",
                            isCorrect: false,
                        },
                        {
                            text: "Upload e download de documentos",
                            isCorrect: false,
                        },
                        {
                            text: "Cache e invalidação de respostas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais etapas compõem a indexação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Extrair texto, dividir, vetorizar e gravar com metadados",
                            isCorrect: true,
                        },
                        {
                            text: "Perguntar, buscar, montar e gerar",
                            isCorrect: false,
                        },
                        {
                            text: "Compilar, testar, versionar e publicar o código-fonte",
                            isCorrect: false,
                        },
                        {
                            text: "Resumir, traduzir, revisar e aprovar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando um RAG responde mal, onde costuma estar o problema?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Na recuperação: os trechos certos não chegaram ao prompt",
                            isCorrect: true,
                        },
                        {
                            text: "Na temperatura alta demais da geração",
                            isCorrect: false,
                        },
                        {
                            text: "No idioma dos documentos indexados",
                            isCorrect: false,
                        },
                        {
                            text: "No banco de dados relacional principal da aplicação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a primeira ação de depuração num RAG com respostas ruins?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Imprimir os trechos recuperados e inspecioná-los",
                            isCorrect: true,
                        },
                        {
                            text: "Reescrever o system prompt do zero",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o modelo de geração pelo maior do catálogo",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o max_tokens da resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um documento foi atualizado hoje. O que precisa rodar para as respostas refletirem a mudança?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A indexação daquele documento (extrair, dividir, vetorizar, gravar)",
                            isCorrect: true,
                        },
                        {
                            text: "O retreinamento completo do modelo de geração da resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: o modelo de geração percebe a mudança nos documentos sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "A troca do modelo de embeddings",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "RAG, contexto longo e fine-tuning: o mapa de decisão",
            blocks: [
                {
                    type: "text",
                    value: '# Três ferramentas, três perguntas\n\nA dúvida mais comum de arquitetura em 2026: com janelas gigantes e fine-tuning acessível, quando usar cada coisa? O mapa por pergunta. "O CONHECIMENTO cabe e é usado UMA vez?" Contexto longo: análise pontual de um contrato, chamada única, sem infraestrutura. "O conhecimento é GRANDE, MUTÁVEL e consultado TODA HORA?" RAG: paga-se a indexação uma vez e cada consulta usa só os trechos certos (barato por pergunta). "O problema é COMPORTAMENTO (formato, tom, vocabulário do domínio), não fatos?" Fine-tuning: ensina o jeito, não o conteúdo.\n\nE são combináveis: o caso clássico maduro é RAG para os fatos + um modelo ajustado para o tom da casa + contexto longo para o documento avulso que o usuário anexa na conversa.',
                },
                {
                    type: "table",
                    value: '[["Situação","Ferramenta certa","Por quê"],["Analisar um contrato agora, uma vez","Contexto longo","Sem infraestrutura; cabe na janela"],["Base de 10 mil artigos, consultas diárias","RAG","Indexa uma vez; consulta barata e atual"],["Respostas no formato rígido da empresa","Fine-tuning","Comportamento aprendido, sem gastar prompt"],["Manual que muda toda semana","RAG","Reindexar o documento; nada de retreino"],["Fatos + tom da casa juntos","RAG + fine-tuning","Cada um no seu papel"]]',
                },
                {
                    type: "quote",
                    value: "Contexto longo para o avulso, RAG para a base viva, fine-tuning para o comportamento. Quem escolhe pelo hype paga em fatura ou em retreino; quem escolhe pela pergunta certa, não.",
                },
                {
                    type: "text",
                    value: "## O custo comparado, de cabeça\n\nOrdens de grandeza para decisão rápida. Contexto longo: custo alto POR CHAMADA (paga o documento inteiro toda vez; cache ajuda em repetição). RAG: custo de indexação pequeno e único (embeddings são baratos, Fundamentos módulo 3) + consulta barata (só os trechos entram no prompt). Fine-tuning: custo de treino e de manutenção por atualização, e não garante fato (modelo ajustado também alucina).\n\nCom o mapa na mão, os módulos seguintes constroem o RAG de verdade, começando pela matéria-prima: transformar arquivos bagunçados em texto limpo e bem dividido.",
                },
            ],
            questions: [
                {
                    statement:
                        "Análise pontual de um único contrato que cabe na janela: qual ferramenta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Contexto longo, em chamada única",
                            isCorrect: true,
                        },
                        {
                            text: "RAG com banco vetorial completo",
                            isCorrect: false,
                        },
                        {
                            text: "Fine-tuning com o contrato",
                            isCorrect: false,
                        },
                        {
                            text: "Treinar um modelo do zero",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Base grande, mutável e consultada toda hora: qual ferramenta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "RAG: indexa uma vez, consulta barata e atualizada",
                            isCorrect: true,
                        },
                        {
                            text: "Contexto longo com a base inteira por chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Fine-tuning mensal com a base",
                            isCorrect: false,
                        },
                        {
                            text: "Planilha compartilhada com o modelo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o fine-tuning ensina bem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Comportamento: formato, tom e vocabulário do domínio",
                            isCorrect: true,
                        },
                        {
                            text: "Fatos atualizados da semana corrente",
                            isCorrect: false,
                        },
                        {
                            text: "O conteúdo integral dos documentos internos da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "A estrutura do banco vetorial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Por que "jogar a base inteira no contexto a cada pergunta" perde para o RAG em produto recorrente?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Paga-se a base toda por chamada; o RAG paga só os trechos certos",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o contexto corrompe documentos grandes",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a janela de contexto só aceita um único documento por vez",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o RAG não tem custo nenhum de operação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa quer fatos sempre atuais E respostas no formato rígido da casa. Qual arquitetura o mapa sugere?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "RAG para os fatos combinado com fine-tuning para o comportamento",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas um fine-tuning semanal feito com os documentos mais novos",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas contexto longo com cache de prompt",
                            isCorrect: false,
                        },
                        {
                            text: "Dois modelos gigantes respondendo em paralelo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Casos reais e o formato do valor",
            blocks: [
                {
                    type: "text",
                    value: '# Onde o RAG paga o próprio custo\n\nOs padrões de caso que se repetem no mercado. SUPORTE: a base de artigos vira assistente que responde com o procedimento certo e o link (deflexão de tickets, o ROI mais fácil de medir). CONHECIMENTO INTERNO: políticas, manuais e wikis respondendo a "como faço X" sem caçada no drive. DOMÍNIOS REGULADOS (jurídico, saúde, financeiro): a citação não é luxo, é requisito; a resposta vale pelo trecho que aponta. E DOCUMENTAÇÃO TÉCNICA: devs perguntando à doc do produto em linguagem natural.\n\nO denominador comum: perguntas em linguagem natural sobre um corpo de texto que já existe, muda com frequência e tem dono. Se o seu caso tem esses três traços, RAG provavelmente paga.',
                },
                {
                    type: "table",
                    value: '[["Caso","Pergunta típica","O valor entregue"],["Suporte ao cliente","Como troco o produto?","Resposta com o procedimento e o link do artigo"],["Conhecimento interno","Qual a política de reembolso de viagem?","Fim da caçada por documentos no drive"],["Jurídico e regulados","O contrato X cobre o cenário Y?","Resposta ancorada com trecho citado"],["Documentação técnica","Como pagino a listagem na API?","Doc consultável em linguagem natural"]]',
                },
                {
                    type: "quote",
                    value: "O sinal de caso bom para RAG: texto que já existe, muda com frequência e tem dono claro. Sem esses três, o problema costuma ser outro (e a ferramenta também).",
                },
                {
                    type: "text",
                    value: "## O que o RAG não é\n\nAntissinais, para não vender o que não entrega. RAG não faz CONTA sobre dados (some vendas do trimestre? é SQL e ferramenta, não busca de texto). RAG não cria conhecimento NOVO (ele acha e fundamenta o que está escrito; análise inédita é outro trabalho). E RAG não conserta base RUIM: documentos desatualizados e contraditórios produzem respostas fundamentadas... no erro. A qualidade da base é teto da qualidade do sistema, e o módulo 2 começa exatamente aí: preparar a matéria-prima direito.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o denominador comum dos bons casos de RAG?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Perguntas em linguagem natural sobre texto que existe, muda e tem dono",
                            isCorrect: true,
                        },
                        {
                            text: "Cálculos financeiros detalhados sobre as tabelas de vendas da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Geração de imagens a partir de descrições",
                            isCorrect: false,
                        },
                        {
                            text: "Tradução automática de contratos para outro idioma",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a citação é essencial em domínios regulados?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A resposta vale pelo trecho que aponta; verificação é requisito",
                            isCorrect: true,
                        },
                        {
                            text: "Porque citações deixam a resposta mais curta",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os reguladores proíbem respostas de texto sem itálico",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o modelo cobra menos com citações",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        '"Some as vendas do último trimestre por região" é um antissinal de RAG porque:',
                    difficulty: "medio",
                    options: [
                        {
                            text: "É conta sobre dados estruturados: caso de SQL e ferramenta",
                            isCorrect: true,
                        },
                        {
                            text: "Vendas são dados sigilosos demais para qualquer busca",
                            isCorrect: false,
                        },
                        {
                            text: "O RAG não lê números em documentos",
                            isCorrect: false,
                        },
                        {
                            text: "Trimestres não cabem na janela de contexto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que acontece se a base indexada estiver desatualizada e contraditória?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Respostas bem fundamentadas no erro; a base é o teto da qualidade",
                            isCorrect: true,
                        },
                        {
                            text: "O RAG corrige os documentos automaticamente",
                            isCorrect: false,
                        },
                        {
                            text: "O banco vetorial rejeita sozinho os documentos ruins da base",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: o modelo ignora o que estiver errado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual métrica de negócio costuma medir o ROI de RAG no suporte?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Deflexão de tickets: casos resolvidos sem atendente humano",
                            isCorrect: true,
                        },
                        {
                            text: "O número de tokens gastos por resposta",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de documentos na base",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho médio de todas as perguntas feitas pelos clientes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O mapa dos problemas (e da trilha)",
            blocks: [
                {
                    type: "text",
                    value: "# Conhecer as doenças antes dos remédios\n\nFechando o módulo de fundação, o catálogo honesto do que dá errado em RAG, que é também o mapa dos próximos módulos. RECUPERAÇÃO FALHA o trecho certo não vem: chunking ruim (módulo 2), embedding fraco ou índice mal operado (módulo 3), busca ingênua (módulo 4). CONTEXTO MAL MONTADO o trecho certo vem e se perde: ordem ruim, excesso de trechos, prompt que não exige fundamento (módulo 5). GERAÇÃO INDISCIPLINADA: o modelo ignora os trechos e responde da memória, ou mistura fontes (módulo 5). E o CEGO NO ESCURO: sem avaliação, cada mexida é um chute (módulo 6).\n\nO projeto do módulo 7 integra tudo; a partir do módulo 2, cada aula ataca uma caixa específica.",
                },
                {
                    type: "table",
                    value: '[["Sintoma","Causa provável","Módulo do remédio"],["Resposta ignora o documento que existe","Chunking ou retrieval falhando","2, 3 e 4"],["Trecho certo veio, resposta errou","Prompt aumentado mal montado","5"],["Resposta mistura fatos de fora da base","Geração sem disciplina de fundamento","5"],["Melhorou aqui, piorou ali, ninguém sabe","Falta de conjunto de avaliação","6"],["Tudo junto e não sei por onde começar","Falta de método","7 (projeto guiado)"]]',
                },
                {
                    type: "quote",
                    value: "RAG quebra em quatro lugares: a busca não acha, o prompt desperdiça, a geração desobedece ou ninguém mede. Diagnóstico certo economiza semanas de mexida às cegas.",
                },
                {
                    type: "text",
                    value: "## Como estudar esta trilha\n\nSugestão de percurso: monte desde já um mini corpus SEU (dez a vinte documentos de um assunto que você conhece bem) e replique cada módulo nele. Conhecer o corpus de cor é o que permite julgar a qualidade da busca no olho enquanto o conjunto de avaliação (módulo 6) não existe. No módulo 7, esse mini corpus vira o seu projeto completo.",
                },
            ],
            questions: [
                {
                    statement: "Quais são os quatro lugares onde um RAG quebra?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Busca que não acha, prompt mal montado, geração indisciplinada, falta de medição",
                            isCorrect: true,
                        },
                        {
                            text: "CPU, memória, disco e rede de todos os servidores de produção da aplicação inteira",
                            isCorrect: false,
                        },
                        {
                            text: "Login, cadastro, pagamento e logout",
                            isCorrect: false,
                        },
                        {
                            text: "HTML, CSS, JavaScript e SQL",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        '"O trecho certo veio no contexto, mas a resposta saiu errada." Onde está o remédio?',
                    difficulty: "facil",
                    options: [
                        {
                            text: "Na montagem do prompt aumentado e na disciplina da geração",
                            isCorrect: true,
                        },
                        {
                            text: "Na troca do banco vetorial da aplicação por um bem maior",
                            isCorrect: false,
                        },
                        {
                            text: "Na reindexação completa do corpus",
                            isCorrect: false,
                        },
                        {
                            text: "No simples aumento do k da busca vetorial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        '"Melhorou uma pergunta e piorou outras, e ninguém percebeu por semanas." Qual é a causa raiz?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Falta de conjunto de avaliação medindo cada mudança",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo de embeddings expirou",
                            isCorrect: false,
                        },
                        {
                            text: "O corpus cresceu além do permitido",
                            isCorrect: false,
                        },
                        {
                            text: "A temperatura da geração de respostas subiu sozinha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a trilha recomenda montar um mini corpus próprio desde o início?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Conhecer o corpus de cor permite julgar a busca no olho durante o estudo",
                            isCorrect: true,
                        },
                        {
                            text: "Corpus grande é proibido para quem está começando",
                            isCorrect: false,
                        },
                        {
                            text: "O banco vetorial exige no máximo vinte documentos indexados por vez",
                            isCorrect: false,
                        },
                        {
                            text: "Documentos alheios não podem ser indexados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A resposta veio com fatos que não estão em NENHUM documento da base. Qual doença do catálogo é essa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Geração indisciplinada: o modelo respondeu da memória, fora do fundamento",
                            isCorrect: true,
                        },
                        {
                            text: "Chunking feito com pedaços grandes demais para a busca",
                            isCorrect: false,
                        },
                        {
                            text: "Índice vetorial sem nenhuma manutenção",
                            isCorrect: false,
                        },
                        {
                            text: "Conjunto de avaliação desatualizado desde a última mudança feita na base",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Ingestão e chunking",
    aulas: [
        {
            titulo: "Dos arquivos ao texto limpo",
            blocks: [
                {
                    type: "text",
                    value: "# A parte sem glamour que define tudo\n\nDocumentos reais chegam bagunçados: PDFs com colunas e cabeçalhos repetidos, HTML cheio de menu e rodapé, Word com tabelas, planilhas, e-mails com assinaturas quilométricas. A primeira etapa da indexação é EXTRAIR o texto útil e descartar o ruído, e a qualidade daqui contamina tudo adiante: lixo indexado é lixo recuperado, entregue ao modelo como se fosse fonte.\n\nAs armas por formato: PDFs digitais têm texto extraível (bibliotecas como pypdf/pdfplumber); PDFs ESCANEADOS são imagem e exigem OCR (hoje, modelos de visão fazem esse papel muito bem, lendo layout e manuscrito razoável); HTML pede a remoção de navegação e template (extração de conteúdo principal); markdown e texto puro são presente de aniversário.",
                },
                {
                    type: "table",
                    value: '[["Formato","Desafio típico","Abordagem"],["PDF digital","Colunas, cabeçalho e rodapé repetidos","Extração com biblioteca + limpeza de repetição"],["PDF escaneado","É imagem, não texto","OCR ou modelo de visão"],["HTML","Menu, rodapé e template junto","Extrair o conteúdo principal"],["Word e slides","Tabelas e caixas soltas","Conversores dedicados por formato"],["Markdown / texto","Quase nenhum","Usar direto, preservando títulos"]]',
                },
                {
                    type: "quote",
                    value: "Lixo indexado é lixo recuperado, com selo de fonte oficial. Uma hora limpando a extração vale mais que dez ajustando prompt.",
                },
                {
                    type: "text",
                    value: "## O que preservar na limpeza\n\nLimpar não é ralar tudo: a ESTRUTURA vale ouro adiante. Títulos e subtítulos (viram fronteiras naturais de chunk e metadados de contexto), listas e tabelas (achatadas com critério, para o texto continuar legível) e a ordem do documento. O alvo da extração: um texto limpo e linear, com os títulos marcados, pronto para a tesoura do chunking, que é a próxima aula.\n\nDica de projeto: guarde SEMPRE o original e a versão extraída lado a lado. Quando uma resposta citar algo estranho, você vai querer comparar as duas para saber se o problema nasceu na extração.",
                },
            ],
            questions: [
                {
                    statement: "Por que a qualidade da extração contamina o sistema inteiro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Lixo indexado é recuperado e entregue ao modelo como fonte",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a extração define o custo total dos tokens de saída",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o banco vetorial rejeita texto sujo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o modelo se recusa a ler PDFs",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre PDF digital e escaneado para a extração?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O digital tem texto extraível; o escaneado é imagem e pede OCR ou visão",
                            isCorrect: true,
                        },
                        {
                            text: "O digital é sempre bem menor em tamanho de arquivo que o escaneado",
                            isCorrect: false,
                        },
                        {
                            text: "O escaneado extrai mais rápido por ser imagem",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma: os dois se extraem do mesmo jeito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que deve ser preservado na limpeza do texto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A estrutura: títulos, listas com critério e a ordem do documento",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas as palavras do texto, sem nenhuma marcação de estrutura",
                            isCorrect: false,
                        },
                        {
                            text: "O menu e o rodapé, que dão contexto à página",
                            isCorrect: false,
                        },
                        {
                            text: "Os bytes originais do arquivo binário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que guardar o original e a versão extraída lado a lado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para depurar citações estranhas comparando as duas versões",
                            isCorrect: true,
                        },
                        {
                            text: "Para dobrar o backup em caso de perda",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o banco vetorial exige os dois formatos gravados",
                            isCorrect: false,
                        },
                        {
                            text: "Para treinar o modelo com o par de arquivos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um site indexado responde perguntas citando o texto do MENU de navegação. Onde nasceu o problema?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Na extração do HTML, que não removeu o template da página",
                            isCorrect: true,
                        },
                        {
                            text: "No modelo de embeddings, que dá preferência aos menus",
                            isCorrect: false,
                        },
                        {
                            text: "Na temperatura alta demais da geração de respostas",
                            isCorrect: false,
                        },
                        {
                            text: "No excesso de documentos indexados",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Chunking: por que e como dividir",
            blocks: [
                {
                    type: "text",
                    value: "# A tesoura mais importante do RAG\n\nPor que dividir os documentos? Duas razões que puxam em direções opostas. A busca por embedding compara SIGNIFICADOS: um vetor de um documento de 50 páginas é uma média borrada de mil assuntos (a busca não acha nada com precisão); pedaços menores têm significado nítido. Mas o modelo precisa de CONTEXTO para responder: um pedaço de uma frase é preciso na busca e inútil na resposta.\n\nO chunking equilibra os dois: pedaços grandes o bastante para fazer sentido sozinhos, pequenos o bastante para ter UM assunto. A faixa de trabalho comum: algumas centenas de tokens por chunk (o clássico 300 a 800), com a estrutura do documento mandando mais que o número.",
                },
                {
                    type: "table",
                    value: '[["Chunk pequeno demais","Chunk grande demais"],["Preciso na busca, inútil na resposta","Acha mal: vetor é média de muitos assuntos"],["Frase solta sem contexto","Traz parágrafos irrelevantes junto"],["Mais chunks, mais custo de busca","Menos chunks, prompt inchado por trecho"],["Perde a explicação em volta","Dilui o trecho que importava"]]',
                },
                {
                    type: "quote",
                    value: "O chunk ideal responde sozinho a uma pergunta pequena: um assunto, com começo, meio e fim. Grande o bastante para fazer sentido, pequeno o bastante para ser encontrado.",
                },
                {
                    type: "text",
                    value: '## O teste do chunk órfão\n\nPegue um chunk aleatório do seu índice e leia SEM o documento em volta: dá para entender do que se trata? Se a leitura começa em "conforme mencionado acima, o valor será dobrado", o chunk é órfão: referências sem antecedente, pronome sem dono, condição sem contexto. Chunks órfãos são o defeito número um de RAGs iniciantes, e as duas próximas aulas trazem as ferramentas para evitá-los: estratégias de corte com overlap e metadados que devolvem o contexto perdido.',
                },
            ],
            questions: [
                {
                    statement:
                        "Por que um documento inteiro de 50 páginas busca mal por embedding?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O vetor vira uma média borrada de muitos assuntos",
                            isCorrect: true,
                        },
                        {
                            text: "Documentos grandes não geram embedding",
                            isCorrect: false,
                        },
                        {
                            text: "O banco vetorial limita os textos a uma página",
                            isCorrect: false,
                        },
                        {
                            text: "Páginas demais custam tokens de saída",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a faixa de trabalho comum para o tamanho de chunk?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Algumas centenas de tokens, com a estrutura mandando",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre exatamente 100 caracteres",
                            isCorrect: false,
                        },
                        {
                            text: "O documento inteiro, sem divisão",
                            isCorrect: false,
                        },
                        {
                            text: "Uma palavra por chunk, para precisão máxima na busca",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é um chunk órfão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um pedaço com referências sem antecedente, que não se entende sozinho",
                            isCorrect: true,
                        },
                        {
                            text: "Um chunk sem embedding gravado no banco",
                            isCorrect: false,
                        },
                        {
                            text: "Um chunk duplicado em dois documentos",
                            isCorrect: false,
                        },
                        {
                            text: "Um chunk que nunca chegou a ser recuperado em nenhuma busca do sistema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o teste prático de qualidade de um chunk?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Lê-lo isolado e verificar se faz sentido sozinho",
                            isCorrect: true,
                        },
                        {
                            text: "Contar se tem exatamente 500 tokens",
                            isCorrect: false,
                        },
                        {
                            text: "Verificar se contém alguma palavra-chave",
                            isCorrect: false,
                        },
                        {
                            text: "Conferir se o embedding gravado tem norma unitária",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'A busca recupera trechos certeiros, mas o modelo responde "o texto não diz o valor" mesmo com o valor no documento, uma frase antes do chunk. Qual é o diagnóstico?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Chunk pequeno ou mal cortado deixou a informação vizinha de fora",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo de geração não lê números",
                            isCorrect: false,
                        },
                        {
                            text: "O banco vetorial corrompeu o trecho inteiro durante a gravação",
                            isCorrect: false,
                        },
                        {
                            text: "A temperatura da geração está alta demais na chamada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Estratégias de corte e o overlap",
            blocks: [
                {
                    type: "text",
                    value: '# Onde passar a tesoura\n\nDa pior para a melhor. TAMANHO FIXO por caracteres: corta no meio de frases e ideias; só aceitável como fallback. RECURSIVA (o padrão das bibliotecas): tenta cortar nas fronteiras maiores primeiro (parágrafos), depois frases, depois palavras, até caber no tamanho alvo; respeita o texto razoavelmente bem. POR ESTRUTURA (a melhor quando existe): usa os títulos e seções do documento como fronteiras (a seção "Política de reembolso" vira um chunk, ou alguns), alinhando os cortes com os assuntos de verdade. Documentos técnicos e manuais quase sempre permitem essa via, e é por isso que preservar títulos na extração importava.\n\nE o OVERLAP: repetir um pedaço do fim de um chunk no começo do seguinte (10 a 20% do tamanho), como costura. A informação que caiu na fronteira aparece inteira em pelo menos um dos dois.',
                },
                {
                    type: "code",
                    value: 'def dividir_recursivo(texto, alvo_tokens=500, overlap=80):\n    # Tenta fronteiras na ordem: secoes (##), paragrafos, frases\n    for separador in ["\\n## ", "\\n\\n", ". "]:\n        partes = cortar_por(texto, separador, alvo_tokens)\n        if partes:\n            return costurar_overlap(partes, overlap)\n    return cortar_bruto(texto, alvo_tokens, overlap)   # ultimo recurso\n\n# Por estrutura (quando o documento tem titulos):\n# cada secao vira chunk; secao grande e subdividida recursivamente,\n# e cada chunk carrega o caminho: \'Manual RH > Ferias > Abono\'',
                },
                {
                    type: "table",
                    value: '[["Estratégia","Como corta","Quando usar"],["Tamanho fixo","A cada N caracteres, cego","Nunca por escolha; só fallback"],["Recursiva","Parágrafos, depois frases, até caber","O padrão para texto corrido"],["Por estrutura","Nos títulos e seções do documento","Sempre que a estrutura existir"],["Overlap 10-20%","Costura entre chunks vizinhos","Sempre; barato e evita perda na fronteira"]]',
                },
                {
                    type: "quote",
                    value: "A melhor fronteira de chunk é a que o AUTOR do documento já desenhou: títulos e seções. A recursiva aproxima; a fixa ignora; o overlap perdoa os erros de todas.",
                },
                {
                    type: "text",
                    value: "## Casos especiais\n\nTabelas: não corte no meio; mantenha a tabela inteira num chunk com a linha de cabeçalho (tabela sem cabeçalho é adivinhação). Código e FAQ: cada bloco ou par pergunta-resposta já é um chunk natural. Listas de passos: mantenha o procedimento junto (passo 3 sem os passos 1 e 2 é o chunk órfão clássico). A regra geral por trás dos casos: a UNIDADE DE SENTIDO manda no corte, e o tamanho alvo é orientação, não lei.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a ordem de qualidade das estratégias de corte?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Por estrutura, depois recursiva; tamanho fixo só como fallback",
                            isCorrect: true,
                        },
                        {
                            text: "Tamanho fixo sempre; olhar a estrutura é pura perda de tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer uma: o resultado é idêntico",
                            isCorrect: false,
                        },
                        {
                            text: "Recursiva apenas para PDFs; fixa para HTML",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o overlap entre chunks?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Repetir um trecho da fronteira no chunk seguinte, como costura",
                            isCorrect: true,
                        },
                        {
                            text: "Indexar cada documento duas vezes por pura segurança extra",
                            isCorrect: false,
                        },
                        {
                            text: "Um chunk especial só com os títulos",
                            isCorrect: false,
                        },
                        {
                            text: "A sobreposição de dois documentos iguais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a estratégia recursiva corta o texto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tenta fronteiras maiores primeiro (parágrafos, frases) até caber no alvo",
                            isCorrect: true,
                        },
                        {
                            text: "Sorteia pontos de corte aleatórios no texto",
                            isCorrect: false,
                        },
                        {
                            text: "Corta exatamente a cada 500 caracteres, sempre",
                            isCorrect: false,
                        },
                        {
                            text: "Pede ao modelo de geração para escolher os cortes de cada documento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como tratar uma tabela no chunking?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mantê-la inteira num chunk, com a linha de cabeçalho junto",
                            isCorrect: true,
                        },
                        {
                            text: "Cortar a cada cinco linhas para obter chunks uniformes",
                            isCorrect: false,
                        },
                        {
                            text: "Descartar tabelas, que não geram bom embedding",
                            isCorrect: false,
                        },
                        {
                            text: "Separar o cabeçalho num chunk e os dados noutro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um procedimento de 6 passos foi cortado no passo 3, e as respostas ensinam o procedimento pela metade. Qual combinação evita isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Corte por estrutura respeitando a unidade do procedimento, com overlap",
                            isCorrect: true,
                        },
                        {
                            text: "Chunks de tamanho fixo menores, para granularidade",
                            isCorrect: false,
                        },
                        {
                            text: "Remover listas de passos da base indexada",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a temperatura para o modelo completar os passos que faltam",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Metadados: o contexto que viaja com o chunk",
            blocks: [
                {
                    type: "text",
                    value: '# O chunk não anda sozinho\n\nCada chunk gravado leva junto seus METADADOS: de qual documento veio (título, fonte, URL), de qual seção (o caminho de títulos: "Manual RH > Férias > Abono"), de quando (data de atualização do documento) e de quem pode vê-lo (permissões, quando a base não é pública). São eles que transformam um pedaço de texto solto em fonte citável e filtrável.\n\nOs usos concretos: a CITAÇÃO da resposta sai do metadado (documento e seção, não "chunk 47"); FILTROS na busca (só documentos do produto X, só versões vigentes); PERMISSÕES (o usuário só busca no que pode ler, tema sério adiante); e DESAMBIGUAÇÃO no prompt (o modelo lê "[Manual RH > Férias] texto..." e sabe o contexto do trecho, o antídoto barato para o chunk órfão).',
                },
                {
                    type: "code",
                    value: 'chunk = {\n    "texto": "O abono de ferias corresponde a um terco da remuneracao...",\n    "metadados": {\n        "doc_id": "manual-rh-2026",\n        "titulo_doc": "Manual de RH 2026",\n        "caminho": "Ferias > Abono pecuniario",\n        "fonte_url": "https://intranet/manual-rh#abono",\n        "atualizado_em": "2026-05-10",\n        "acesso": ["funcionarios"],\n    },\n}\n# No prompt, o trecho entra prefixado pelo caminho; na resposta,\n# a citacao usa titulo_doc + caminho + fonte_url',
                },
                {
                    type: "table",
                    value: '[["Metadado","Uso principal"],["Documento de origem e URL","Citação verificável na resposta"],["Caminho de seções","Contexto no prompt; cura o chunk órfão"],["Data de atualização","Filtrar versão vigente; auditar respostas velhas"],["Permissões de acesso","Busca restrita ao que o usuário pode ler"],["Identificador do documento","Reindexar e deletar sem varrer tudo"]]',
                },
                {
                    type: "quote",
                    value: 'Metadado é o que separa "um texto parecido apareceu" de "o Manual de RH, seção Férias, atualizado em maio, diz isto". A citação da resposta nasce aqui, na indexação.',
                },
                {
                    type: "text",
                    value: '## O metadado que evita processo\n\nDestaque para PERMISSÕES: se a base tem documentos restritos (salários, contratos, dados de clientes), o filtro de acesso na BUSCA é obrigatório desde o primeiro dia. O caminho do vazamento é sempre o mesmo: indexa-se tudo junto "para testar", o filtro fica para depois, e alguém pergunta exatamente o que não podia ver. A resposta chega educada, fundamentada e citando a fonte. Grave o campo de acesso agora; o módulo 4 mostra o filtro na consulta.',
                },
            ],
            questions: [
                {
                    statement: "De onde sai a citação verificável da resposta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dos metadados do chunk: documento, seção e URL",
                            isCorrect: true,
                        },
                        {
                            text: "Da memória do modelo de geração",
                            isCorrect: false,
                        },
                        {
                            text: "De uma busca na web feita na hora da resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Do system prompt da aplicação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual metadado é o antídoto barato para o chunk órfão?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O caminho de seções prefixando o trecho no prompt",
                            isCorrect: true,
                        },
                        {
                            text: "A data de criação do arquivo original no disco",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho exato do chunk em tokens",
                            isCorrect: false,
                        },
                        {
                            text: "O nome do autor do documento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o identificador do documento nos chunks?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reindexar ou deletar os chunks daquele documento sem varrer tudo",
                            isCorrect: true,
                        },
                        {
                            text: "Ordenar as respostas por ordem alfabética",
                            isCorrect: false,
                        },
                        {
                            text: "Cobrar o custo de embedding separadamente por documento da base",
                            isCorrect: false,
                        },
                        {
                            text: "Impedir que o documento seja citado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando o filtro de permissões na busca deve ser implementado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Desde o primeiro dia, se a base tem documentos restritos",
                            isCorrect: true,
                        },
                        {
                            text: "Depois do lançamento, quando houver tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Nunca: a busca vetorial já é privada por natureza própria",
                            isCorrect: false,
                        },
                        {
                            text: "Só quando um auditor externo pedir",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um funcionário perguntou sobre salários de diretoria e o assistente respondeu citando a planilha restrita. Qual foi a falha?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Documentos restritos indexados sem filtro de acesso na busca",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo de geração ignorou o system prompt",
                            isCorrect: false,
                        },
                        {
                            text: "O chunking cortou a planilha restrita exatamente no lugar errado",
                            isCorrect: false,
                        },
                        {
                            text: "O embedding da pergunta saiu impreciso",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O pipeline de ingestão que não apodrece",
            blocks: [
                {
                    type: "text",
                    value: '# Ingestão é processo, não evento\n\nA base viva muda: documentos novos chegam, versões substituem versões, coisas são removidas. O pipeline de ingestão precisa de três propriedades para não apodrecer. IDEMPOTÊNCIA: rodar duas vezes sobre o mesmo documento não pode duplicar chunks (o clássico: reindexou tudo "para garantir" e agora cada busca devolve o mesmo trecho em dobro); o remédio é upsert por identidade do chunk (doc_id + posição, ou hash do conteúdo). ATUALIZAÇÃO: documento mudou, os chunks antigos dele saem e os novos entram (delete por doc_id + reindexa; o hash do documento diz se mudou de verdade). REMOÇÃO: documento apagado ou vencido sai do índice, senão o sistema cita fantasmas com convicção.\n\nOperacionalmente: um job agendado (ou gatilho de mudança) percorre as fontes, compara hashes e processa só o delta. Logs de quantos documentos e chunks entraram, mudaram e saíram fecham o ciclo.',
                },
                {
                    type: "code",
                    value: "def ingerir(fonte):\n    for doc in fonte.listar():\n        h = hash_conteudo(doc)\n        registro = indice.registro(doc.id)\n        if registro and registro.hash == h:\n            continue                          # nada mudou: idempotencia barata\n        indice.deletar_chunks(doc.id)         # atualizacao: sai o antigo...\n        for chunk in dividir(extrair(doc)):\n            indice.gravar(doc.id, h, chunk)   # ...entra o novo\n    for sumido in indice.docs_fora_de(fonte.ids()):\n        indice.deletar_chunks(sumido)         # remocao: sem fantasmas",
                },
                {
                    type: "table",
                    value: '[["Propriedade","Sem ela","Implementação"],["Idempotência","Chunks duplicados poluindo a busca","Upsert por identidade; hash do conteúdo"],["Atualização","Respostas citando a versão velha","Delete por doc_id e reindexação do documento"],["Remoção","Citações de documentos que não existem","Comparar o índice com a fonte e limpar"],["Observabilidade","Ingestão quebra em silêncio","Log de entradas, mudanças e remoções"]]',
                },
                {
                    type: "quote",
                    value: "As três perguntas do pipeline saudável: rodar de novo duplica algo? documento mudado atualiza? documento removido some? Três sins e a base envelhece bem.",
                },
                {
                    type: "text",
                    value: "## Fechando o módulo\n\nA matéria-prima está pronta: texto limpo, cortado com critério, com metadados completos e um pipeline que aguenta o tempo. O módulo 3 pega esses chunks e os transforma em vetores num banco de verdade: pgvector, índices de vizinhança e a operação do índice no dia a dia.",
                },
            ],
            questions: [
                {
                    statement: "O que é idempotência no pipeline de ingestão?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Rodar de novo sobre o mesmo documento não duplica chunks",
                            isCorrect: true,
                        },
                        {
                            text: "Processar todos os documentos em paralelo",
                            isCorrect: false,
                        },
                        {
                            text: "Indexar cada documento em dois bancos",
                            isCorrect: false,
                        },
                        {
                            text: "Nunca mais precisar rodar a ingestão de novo na base",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se atualiza um documento que mudou?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Deletar os chunks antigos dele e indexar os novos",
                            isCorrect: true,
                        },
                        {
                            text: "Indexar os novos por cima, mantendo os antigos",
                            isCorrect: false,
                        },
                        {
                            text: "Reindexar a base inteira do zero",
                            isCorrect: false,
                        },
                        {
                            text: "Editar os vetores antigos manualmente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o hash do conteúdo na ingestão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Detectar se o documento mudou de verdade e pular o que não mudou",
                            isCorrect: true,
                        },
                        {
                            text: "Criptografar todos os chunks que ficam gravados no banco vetorial",
                            isCorrect: false,
                        },
                        {
                            text: "Ordenar os documentos por tamanho",
                            isCorrect: false,
                        },
                        {
                            text: "Gerar o embedding sem chamar o modelo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o sintoma de remoção faltando no pipeline?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Respostas citando documentos que já foram apagados",
                            isCorrect: true,
                        },
                        {
                            text: "Chunks gravados com embedding de dimensão errada",
                            isCorrect: false,
                        },
                        {
                            text: "Buscas mais lentas nos fins de semana",
                            isCorrect: false,
                        },
                        {
                            text: "Custo de geração dobrando por resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Toda busca devolve o mesmo trecho duas vezes desde a última manutenção. Qual propriedade faltou?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Idempotência: a reindexação duplicou os chunks",
                            isCorrect: true,
                        },
                        {
                            text: "Observabilidade: faltou log da ingestão",
                            isCorrect: false,
                        },
                        {
                            text: "Atualização: o documento mudou sem reindexar",
                            isCorrect: false,
                        },
                        {
                            text: "Permissões: o filtro de acesso está aberto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Embeddings e o banco vetorial",
    aulas: [
        {
            titulo: "Dos chunks aos vetores",
            blocks: [
                {
                    type: "text",
                    value: "# A ponte que você já conhece\n\nOs Fundamentos apresentaram embeddings (significado como vetor, similaridade como distância); agora eles entram em produção. Cada chunk do módulo 2 passa pelo modelo de embedding e vira um vetor; a pergunta do usuário passa pelo MESMO modelo na consulta; e a busca é achar os vetores de chunk mais próximos do vetor da pergunta.\n\nAs decisões de operação que voltam com força: o MESMO modelo para indexar e consultar (vetores de modelos diferentes não se comparam; misturar quebra a busca em silêncio); embeddings em LOTE na indexação (as APIs aceitam listas: dezenas de chunks por chamada, mais barato e mais rápido); e a dimensão do vetor registrada junto do índice, porque ela define a coluna no banco.",
                },
                {
                    type: "code",
                    value: "def vetorizar_chunks(chunks, tamanho_lote=64):\n    for lote in em_lotes(chunks, tamanho_lote):\n        resposta = cliente.embeddings.create(\n            model=MODELO_EMBEDDING,            # o MESMO da consulta, sempre\n            input=[c.texto for c in lote],\n        )\n        for chunk, item in zip(lote, resposta.data):\n            chunk.vetor = item.embedding       # ex.: 1536 dimensoes\n            yield chunk\n# Custo tipico: fracoes de centavo por milhao de tokens; indexar\n# milhares de documentos custa menos que um almoco",
                },
                {
                    type: "table",
                    value: '[["Decisão","Regra","Por quê"],["Modelo de embedding","O mesmo na indexação e na consulta","Vetores de modelos diferentes não se comparam"],["Chamadas de indexação","Em lote (listas de chunks)","Mais barato e rápido que um a um"],["Dimensão do vetor","Fixada e registrada com o índice","Define a coluna e valida inserções"],["Normalização","Seguir a recomendação do modelo","Cosseno e produto escalar coincidem"],["Texto embedado","O chunk, às vezes com o caminho junto","Contexto extra pode melhorar a busca"]]',
                },
                {
                    type: "quote",
                    value: "A regra de ouro segue absoluta: um índice, um modelo de embedding. Trocou o modelo, reindexou tudo; misturou, a busca vira sorteio sem mensagem de erro.",
                },
                {
                    type: "text",
                    value: '## O que exatamente embedar\n\nDetalhe fino que melhora buscas: o texto que vai ao modelo de embedding pode ser o chunk puro ou o chunk PREFIXADO pelo caminho de seções ("Férias > Abono: o abono corresponde a..."). O prefixo dá contexto ao vetor (o chunk órfão fica menos órfão também na busca). Teste as duas formas no seu corpus quando o conjunto de avaliação existir (módulo 6); na dúvida, comece com o caminho junto. O que NUNCA entra no embedding: metadados de controle (datas, permissões), que são para filtrar, não para significar.',
                },
            ],
            questions: [
                {
                    statement: "Qual modelo de embedding usar na consulta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O mesmo usado na indexação dos chunks",
                            isCorrect: true,
                        },
                        {
                            text: "Qualquer um: vetores são intercambiáveis",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo de geração da resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Um diferente por dia, para variar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que vetorizar em lote na indexação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mais barato e rápido que uma chamada por chunk",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a API recusa chamadas individuais",
                            isCorrect: false,
                        },
                        {
                            text: "Para os vetores saírem com mais dimensões",
                            isCorrect: false,
                        },
                        {
                            text: "Para pular a etapa de chunking",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que acontece se metade do índice foi vetorizada por um modelo e metade por outro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A busca degrada em silêncio: as distâncias entre as metades não fazem sentido",
                            isCorrect: true,
                        },
                        {
                            text: "O banco de dados rejeita a segunda metade na hora, com um erro bem claro",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: os modelos convergem naturalmente para o mesmo espaço vetorial",
                            isCorrect: false,
                        },
                        {
                            text: "A busca fica duas vezes mais rápida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que pode ser embedado junto do chunk para melhorar a busca?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O caminho de seções como prefixo de contexto",
                            isCorrect: true,
                        },
                        {
                            text: "As permissões de acesso de cada documento",
                            isCorrect: false,
                        },
                        {
                            text: "O hash de controle da ingestão",
                            isCorrect: false,
                        },
                        {
                            text: "O custo em tokens do chunk",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que datas e permissões NÃO entram no texto embedado?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "São metadados de filtro, não de significado; poluem o vetor",
                            isCorrect: true,
                        },
                        {
                            text: "Porque números não geram embedding válido",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a API remove todas as datas automaticamente do texto",
                            isCorrect: false,
                        },
                        {
                            text: "Porque encarecem a chamada de embedding",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "pgvector: vetores dentro do Postgres",
            blocks: [
                {
                    type: "text",
                    value: "# O banco que você já tem\n\nPara guardar e buscar vetores, a opção que esta trilha adota como fio condutor é o pgvector: a extensão que ensina o Postgres a ter colunas de vetor e operadores de distância. O argumento é de arquitetura: seus chunks, metadados e vetores vivem no MESMO banco que o resto da aplicação, com as ferramentas que você já domina (SQL, joins, transações, backup) e sem um serviço novo para operar.\n\nO essencial cabe em três comandos: ativar a extensão, criar a tabela com a coluna vector (na dimensão do seu modelo) e inserir. A busca é um SELECT com ORDER BY de distância.",
                },
                {
                    type: "code",
                    value: "CREATE EXTENSION IF NOT EXISTS vector;\n\nCREATE TABLE chunks (\n    id          bigserial PRIMARY KEY,\n    doc_id      text NOT NULL,\n    caminho     text,\n    texto       text NOT NULL,\n    metadados   jsonb NOT NULL DEFAULT '{}',\n    embedding   vector(1536) NOT NULL      -- a dimensao do SEU modelo\n);\n\n-- Busca: os 8 chunks mais proximos do vetor da pergunta\nSELECT id, doc_id, caminho, texto\nFROM chunks\nORDER BY embedding <=> $1     -- <=> distancia de cosseno\nLIMIT 8;",
                },
                {
                    type: "table",
                    value: '[["Operador","Distância","Uso típico"],["<=>","Cosseno","O padrão para embeddings de texto"],["<->","Euclidiana (L2)","Equivalente em vetores normalizados"],["<#>","Produto interno (negativo)","Quando o modelo recomenda dot product"]]',
                },
                {
                    type: "quote",
                    value: "pgvector coloca a busca semântica DENTRO do banco que você já opera: SQL, joins com as suas tabelas, transações e backup de graça. Para a maioria dos produtos, é o ponto de partida certo.",
                },
                {
                    type: "text",
                    value: '## O superpoder do SQL junto\n\nO ganho escondido: a busca vetorial COMPÕE com o SQL normal. WHERE doc_id, WHERE metadados @> filtro, JOIN com a tabela de permissões do seu app, tudo na mesma query da distância. Nos bancos vetoriais dedicados isso existe como "filtered search"; no Postgres é só SQL de terça-feira. O módulo 4 usa isso o tempo todo (filtros e permissões na consulta); antes, a próxima aula resolve o problema de velocidade: como essa busca escala de mil para milhões de chunks.',
                },
            ],
            questions: [
                {
                    statement: "O que o pgvector adiciona ao Postgres?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Coluna de vetor e operadores de distância para busca",
                            isCorrect: true,
                        },
                        {
                            text: "Um modelo de embedding embutido dentro do banco",
                            isCorrect: false,
                        },
                        {
                            text: "Um servidor de chat dentro do banco",
                            isCorrect: false,
                        },
                        {
                            text: "Backup automático na nuvem do provedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual operador do pgvector é o padrão para embeddings de texto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O <=> de distância de cosseno",
                            isCorrect: true,
                        },
                        {
                            text: "O LIKE de comparação de texto",
                            isCorrect: false,
                        },
                        {
                            text: "O JOIN de junção de tabelas",
                            isCorrect: false,
                        },
                        {
                            text: "O GROUP BY de agregação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o argumento de arquitetura a favor do pgvector como ponto de partida?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Vetores no mesmo banco da aplicação, com SQL, joins e backup já dominados",
                            isCorrect: true,
                        },
                        {
                            text: "É o único banco do mercado que aceita vetores de embeddings de texto",
                            isCorrect: false,
                        },
                        {
                            text: "Dispensa o modelo de embedding na etapa de indexação",
                            isCorrect: false,
                        },
                        {
                            text: "Vem com interface gráfica de busca pronta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que define o número dentro de vector(1536) na criação da tabela?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A dimensão do modelo de embedding escolhido",
                            isCorrect: true,
                        },
                        {
                            text: "O número máximo de chunks aceito na tabela",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho do texto de cada chunk",
                            isCorrect: false,
                        },
                        {
                            text: "A versão da extensão instalada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        '"Buscar só nos documentos que ESTE usuário pode ler" vira o quê no pgvector?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um WHERE ou JOIN de permissões na mesma query da distância",
                            isCorrect: true,
                        },
                        {
                            text: "Um serviço separado de autorização vetorial",
                            isCorrect: false,
                        },
                        {
                            text: "Uma cópia do índice por usuário do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Impossível: a busca vetorial não aceita filtros de nenhum tipo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Índices de vizinhança: HNSW e a escala",
            blocks: [
                {
                    type: "text",
                    value: "# De mil a milhões\n\nSem índice, o ORDER BY de distância compara a pergunta com TODOS os vetores (busca exata, sequencial). Com milhares de chunks, tranquilo; com milhões, lento demais para tempo real. A solução são os índices de vizinhança aproximada (ANN): estruturas que acham os vizinhos QUASE sempre certos em uma fração do tempo.\n\nNo pgvector, dois tipos. HNSW (o padrão recomendado): um grafo de camadas navegável, buscas rápidas e recall alto, ao custo de mais memória e construção mais lenta. IVFFlat (alternativa): agrupa vetores em listas e busca nas mais promissoras; constrói rápido e leve, mas exige dados na tabela ANTES de criar (as listas são aprendidas dos dados) e o recall é mais sensível a ajuste. A palavra nova é RECALL: a fração dos vizinhos verdadeiros que a busca aproximada encontra; o dial de cada índice troca velocidade por recall.",
                },
                {
                    type: "code",
                    value: "-- HNSW: o padrao para comecar (nao exige tabela populada)\nCREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);\n\n-- Dial de consulta do HNSW: maior = mais recall, mais lento\nSET hnsw.ef_search = 60;\n\n-- IVFFlat: criar SO com a tabela ja populada\n-- CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops)\n--   WITH (lists = 1000);\n-- SET ivfflat.probes = 20;   -- listas visitadas por busca",
                },
                {
                    type: "table",
                    value: '[["Aspecto","HNSW","IVFFlat"],["Velocidade de busca","Excelente","Boa, sensível a ajuste"],["Recall típico","Alto por padrão","Depende de lists e probes"],["Construção","Mais lenta, mais memória","Rápida e leve"],["Exige dados antes de criar","Não","Sim (aprende as listas dos dados)"],["Recomendação da trilha","Padrão","Casos de memória apertada"]]',
                },
                {
                    type: "quote",
                    value: "Índice aproximado troca um tiquinho de recall por ordens de grandeza de velocidade. HNSW como padrão, ef_search como dial, e a busca exata vira a régua para medir o que se perdeu.",
                },
                {
                    type: "text",
                    value: "## Quando ligar (e como conferir)\n\nAté dezenas de milhares de chunks, a busca exata costuma bastar (e é a régua perfeita). Cresceu ou a latência apareceu: crie o HNSW e MEÇA o recall (rode as mesmas perguntas com e sem índice e compare os resultados; a diferença é o que o aproximado perdeu). Se perguntas do conjunto de avaliação pioraram depois do índice, suba o ef_search antes de culpar o resto do sistema. Regra de operação: todo ajuste de índice passa pelo conjunto de avaliação, nunca pelo olhômetro.",
                },
            ],
            questions: [
                {
                    statement: "O que os índices ANN (vizinhança aproximada) trocam?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um pouco de recall por muito mais velocidade",
                            isCorrect: true,
                        },
                        {
                            text: "Espaço em disco por precisão absoluta",
                            isCorrect: false,
                        },
                        {
                            text: "Segurança por facilidade de operação",
                            isCorrect: false,
                        },
                        {
                            text: "Custo de embedding por custo de geração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é recall na busca vetorial?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A fração dos vizinhos verdadeiros que a busca aproximada encontra",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo de resposta médio da consulta",
                            isCorrect: false,
                        },
                        {
                            text: "O número total de chunks que estão armazenados na tabela do banco",
                            isCorrect: false,
                        },
                        {
                            text: "A memória usada pelo índice no servidor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual índice o pgvector recomenda como padrão e qual seu dial de consulta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "HNSW, com ef_search controlando recall x velocidade",
                            isCorrect: true,
                        },
                        {
                            text: "IVFFlat, com o número total de linhas da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "B-tree, com o fillfactor da página",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: índices não se aplicam a vetores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual particularidade o IVFFlat tem na criação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Exige a tabela já populada, pois aprende as listas dos dados",
                            isCorrect: true,
                        },
                        {
                            text: "Só funciona com vetores de 512 dimensões",
                            isCorrect: false,
                        },
                        {
                            text: "Precisa de uma licença comercial separada da extensão paga",
                            isCorrect: false,
                        },
                        {
                            text: "Apaga os dados existentes ao ser criado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de criar o índice, algumas perguntas do conjunto de avaliação pioraram. Qual é o primeiro ajuste?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Subir o ef_search e medir de novo: recall baixo é o suspeito",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar o modelo de geração da resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzir o tamanho dos chunks pela metade",
                            isCorrect: false,
                        },
                        {
                            text: "Apagar o conjunto de avaliação que já ficou desatualizado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O mercado de bancos vetoriais",
            blocks: [
                {
                    type: "text",
                    value: "# Além do Postgres\n\nO pgvector é o fio condutor da trilha, mas o mercado tem uma prateleira dedicada, e conhecê-la faz parte do ofício. Qdrant: motor vetorial de código aberto, rápido, com filtros ricos, operável em casa ou como serviço. Weaviate: aberto, com módulos que integram vetorização e busca híbrida prontas. Pinecone: serviço gerenciado puro (sem operar nada), escala grande, preço de serviço. Elasticsearch/OpenSearch: se a empresa JÁ os opera para busca textual, ganharam busca vetorial e híbrida decentes, e reaproveitar pode vencer.\n\nE a categoria vizinha: bibliotecas locais (FAISS à frente) para busca em memória sem servidor nenhum, ótimas para protótipos, notebooks e sistemas embarcados.",
                },
                {
                    type: "table",
                    value: '[["Opção","Natureza","Brilha quando"],["pgvector","Extensão do Postgres","O app já tem Postgres; joins e transações juntos"],["Qdrant","Motor dedicado open source","Volume alto e filtros ricos, operando em casa"],["Weaviate","Motor dedicado open source","Busca híbrida e integração de vetorização prontas"],["Pinecone","Serviço gerenciado","Escala sem equipe de infraestrutura"],["Elastic / OpenSearch","Busca textual com vetores","A empresa já opera; reaproveitar stack"],["FAISS","Biblioteca em memória","Protótipos e busca local sem servidor"]]',
                },
                {
                    type: "quote",
                    value: 'A pergunta não é "qual banco vetorial é o melhor", é "qual o meu volume, quem opera e o que eu já tenho". Para a maioria dos produtos, o Postgres que já existe responde as três.',
                },
                {
                    type: "text",
                    value: "## Critérios e o momento de migrar\n\nOs sinais de que o pgvector deixou de bastar: dezenas de milhões de vetores com latência sofrendo mesmo com HNSW ajustado, necessidade de sharding do índice além do que o Postgres oferece com conforto, ou requisitos específicos (multi-tenancy pesada de índices isolados, quantização agressiva de memória). A migração é conceitualmente simples porque a INTERFACE é a mesma (gravar vetor + metadados; buscar vizinhos com filtro), e o resto do seu RAG nem percebe, se você escondeu o banco atrás de um módulo seu, como fez com o provedor de LLM na trilha anterior.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual opção é um serviço gerenciado puro, sem operar infraestrutura?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pinecone",
                            isCorrect: true,
                        },
                        {
                            text: "pgvector",
                            isCorrect: false,
                        },
                        {
                            text: "FAISS",
                            isCorrect: false,
                        },
                        {
                            text: "PostgreSQL",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para protótipo local sem servidor nenhum, qual categoria serve?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Biblioteca em memória, como FAISS",
                            isCorrect: true,
                        },
                        {
                            text: "Serviço gerenciado com contrato anual",
                            isCorrect: false,
                        },
                        {
                            text: "Cluster de Elasticsearch dedicado",
                            isCorrect: false,
                        },
                        {
                            text: "Data warehouse corporativo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quando reaproveitar Elasticsearch/OpenSearch para vetores faz sentido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quando a empresa já os opera para busca textual",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre: são os únicos com busca híbrida",
                            isCorrect: false,
                        },
                        {
                            text: "Nunca: busca textual e vetorial não convivem",
                            isCorrect: false,
                        },
                        {
                            text: "Só em aplicações sem documentos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são os sinais de que o pgvector deixou de bastar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dezenas de milhões de vetores com latência alta e necessidade de sharding",
                            isCorrect: true,
                        },
                        {
                            text: "Qualquer base com mais de mil chunks",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro filtro de metadados que for aplicado na consulta do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "A primeira troca de modelo de embedding depois do lançamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que torna a migração de banco vetorial barata para o resto do sistema?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Esconder o banco atrás de um módulo seu com a interface gravar/buscar",
                            isCorrect: true,
                        },
                        {
                            text: "Usar o mesmo nome de tabela em todos os bancos",
                            isCorrect: false,
                        },
                        {
                            text: "Manter os vetores duplicados nos dois bancos para sempre, por garantia",
                            isCorrect: false,
                        },
                        {
                            text: "Evitar índices para não criar dependência",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Operando o índice no dia a dia",
            blocks: [
                {
                    type: "text",
                    value: '# O índice como parte do produto\n\nFechando o módulo, a rotina de operação que mantém a busca saudável. VERSIONAR O MODELO DE EMBEDDING como configuração do índice: o registro "este índice foi construído com o modelo X" evita o clássico da consulta com modelo trocado. REINDEXAÇÃO PLANEJADA para a troca de modelo: constrói-se o índice novo em paralelo (tabela ou coluna nova), valida-se com o conjunto de avaliação, e a consulta vira de uma vez; nada de misturar. MONITORAR o essencial: latência da busca (percentis), recall amostrado contra busca exata, e o crescimento (contagem de chunks, tamanho do índice, memória).\n\nE o backup: com pgvector, os vetores entram no backup do Postgres que você já faz (mais um ponto para o banco único); em bancos dedicados, snapshot próprio na rotina.',
                },
                {
                    type: "code",
                    value: "-- Config do indice como dado, nao como memoria de equipe\nCREATE TABLE indice_config (\n    id              int PRIMARY KEY DEFAULT 1,\n    modelo_embedding text NOT NULL,      -- ex: 'embed-v4-2026'\n    dimensao        int NOT NULL,\n    criado_em       timestamptz NOT NULL DEFAULT now()\n);\n\n-- A aplicacao LE essa config e valida na inicializacao:\n-- se MODELO_EMBEDDING do codigo != modelo_embedding do indice, ABORTA\n-- (melhor cair no deploy que buscar errado em silencio)",
                },
                {
                    type: "table",
                    value: '[["Rotina","Frequência","Pega o quê"],["Validar modelo do índice na inicialização","Todo deploy","Consulta com modelo diferente do índice"],["Recall amostrado vs busca exata","Semanal ou após ajustes","Índice aproximado degradando"],["Latência da busca em percentis","Contínuo","Crescimento pedindo ajuste ou migração"],["Contagem e tamanho do índice","Contínuo","Ingestão quebrada ou explosão de dados"],["Backup com restauração testada","Conforme a política do banco","O dia em que tudo dá errado"]]',
                },
                {
                    type: "quote",
                    value: "A config do índice (modelo, dimensão, data) é dado versionado, não memória de equipe. A aplicação valida no deploy e aborta na divergência: melhor quebrar alto que buscar errado em silêncio.",
                },
                {
                    type: "text",
                    value: "## Fechando o módulo\n\nOs chunks agora vivem num banco de verdade: vetorizados com disciplina, indexados com HNSW, com o mercado mapeado e a operação de gente grande. O módulo 4 finalmente FAZ a pergunta: retrieval de verdade, do top-k ingênuo à busca híbrida com reranking e filtros.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que registrar o modelo de embedding como configuração do índice?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Para a aplicação validar no deploy e abortar se divergir",
                            isCorrect: true,
                        },
                        {
                            text: "Para o provedor dar desconto no modelo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o banco exige esse campo para criar os índices",
                            isCorrect: false,
                        },
                        {
                            text: "Para exibir o nome do modelo na interface",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se faz a troca de modelo de embedding com segurança?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Índice novo em paralelo, validação e virada de uma vez",
                            isCorrect: true,
                        },
                        {
                            text: "Trocando o modelo da consulta primeiro, aos poucos",
                            isCorrect: false,
                        },
                        {
                            text: "Atualizando os vetores um por um durante o uso",
                            isCorrect: false,
                        },
                        {
                            text: "Não há como: o modelo é definitivo para sempre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se mede se o índice aproximado está degradando?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Recall amostrado: comparar resultados com a busca exata",
                            isCorrect: true,
                        },
                        {
                            text: "Contando os documentos novos da semana",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntando aos usuários mais ativos se a busca piorou",
                            isCorrect: false,
                        },
                        {
                            text: "Verificando o tamanho do arquivo de log",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual vantagem de backup o pgvector traz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os vetores entram no backup do Postgres que já existe",
                            isCorrect: true,
                        },
                        {
                            text: "Vetores dispensam backup por serem recalculáveis na hora",
                            isCorrect: false,
                        },
                        {
                            text: "O backup fica menor sem os vetores",
                            isCorrect: false,
                        },
                        {
                            text: "A extensão faz upload automático para a nuvem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Por que "abortar no deploy" é melhor que seguir com modelo divergente do índice?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A divergência não gera erro em runtime, só busca errada silenciosa",
                            isCorrect: true,
                        },
                        {
                            text: "Porque abortar libera memória do servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o Postgres trava por completo com os modelos divergentes",
                            isCorrect: false,
                        },
                        {
                            text: "Não é melhor: deploy nunca deve abortar",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Retrieval de verdade",
    aulas: [
        {
            titulo: "Top-k e seus limites",
            blocks: [
                {
                    type: "text",
                    value: "# A busca ingênua e onde ela quebra\n\nA consulta básica você já tem: vetoriza a pergunta, pega os k mais próximos (top-k), pronto. Funciona surpreendentemente bem, e três limites aparecem com o uso. O K FIXO serve mal às duas pontas: pergunta simples desperdiça (k=8 traz 6 trechos irrelevantes que poluem o prompt), pergunta ampla subserve (a resposta precisava de 12 trechos). A REDUNDÂNCIA: os top-k tendem a ser parecidos ENTRE SI (cinco versões do mesmo parágrafo), ocupando espaço que faltaria para o segundo assunto da pergunta. E o VIÉS DO VIZINHO: o mais próximo em embedding nem sempre é o mais ÚTIL (a pergunta menciona um erro; o chunk mais próximo descreve o erro, o útil ensina a corrigir).\n\nOs remédios do módulo: limiar de corte junto do k, diversificação (MMR), busca híbrida (aula 2), reranking (aula 3) e transformação da consulta (aula 5).",
                },
                {
                    type: "table",
                    value: '[["Limite do top-k puro","Sintoma no produto","Remédio"],["k fixo para toda pergunta","Poluição ou falta, conforme o caso","Limiar de corte junto do k"],["Resultados redundantes entre si","Cinco versões do mesmo trecho","Diversificação (MMR)"],["Próximo não é o mais útil","Descrição vem, solução não","Reranking (aula 3)"],["Vocabulário exato se perde","Código de erro não é encontrado","Busca híbrida (aula 2)"]]',
                },
                {
                    type: "quote",
                    value: "Top-k puro é o rascunho da busca: ótimo primeiro passo, insuficiente último passo. Os k mais próximos não são necessariamente os k mais úteis, nem diversos, nem suficientes.",
                },
                {
                    type: "text",
                    value: '## Limiar e diversidade, os ajustes baratos\n\nDois upgrades imediatos. LIMIAR DE CORTE: além do LIMIT k, descarte o que ficou longe demais (a similaridade mínima calibrada no SEU corpus, lição dos Fundamentos); pergunta fora da base passa a devolver POUCO ou NADA, que é a matéria-prima do "não sei" honesto no módulo 5. DIVERSIFICAÇÃO (MMR, maximal marginal relevance): em vez de pegar os k mais próximos da pergunta, pegue um a um, penalizando candidatos parecidos com os JÁ escolhidos; troca redundância por cobertura. Ambos são pós-processamento barato sobre a mesma busca.',
                },
            ],
            questions: [
                {
                    statement: "Qual é o problema do k fixo para toda pergunta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sobra trecho irrelevante na simples e falta na ampla",
                            isCorrect: true,
                        },
                        {
                            text: "O banco vetorial limita o k a cinco",
                            isCorrect: false,
                        },
                        {
                            text: "O valor de k muda o custo do embedding de cada pergunta",
                            isCorrect: false,
                        },
                        {
                            text: "Valores pares de k são mais lentos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o MMR (diversificação) troca?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Redundância entre resultados por cobertura de assuntos",
                            isCorrect: true,
                        },
                        {
                            text: "Velocidade da busca pela precisão total do embedding",
                            isCorrect: false,
                        },
                        {
                            text: "Chunks pequenos por chunks maiores",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem dos metadados no prompt",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o limiar de corte junto do top-k?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Descartar o que ficou longe demais, viabilizando o não sei honesto",
                            isCorrect: true,
                        },
                        {
                            text: "Acelerar o índice HNSW nas horas de pico de acessos do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzir a dimensão dos vetores gravados",
                            isCorrect: false,
                        },
                        {
                            text: "Ordenar os trechos por data de criação no prompt",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o viés do vizinho?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O trecho mais próximo em embedding nem sempre é o mais útil",
                            isCorrect: true,
                        },
                        {
                            text: "O índice sempre prefere os documentos mais recentes da base",
                            isCorrect: false,
                        },
                        {
                            text: "A busca favorece chunks do mesmo autor",
                            isCorrect: false,
                        },
                        {
                            text: "Vizinhos no disco são lidos primeiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A busca devolve cinco variações do mesmo parágrafo e nada sobre a segunda parte da pergunta. Qual remédio ataca exatamente isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Diversificação com MMR, penalizando candidatos repetidos",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o k para vinte e aceitar a poluição no prompt",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzir o overlap do chunking para zero",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o operador de cosseno por euclidiano",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Busca híbrida: significado + palavra exata",
            blocks: [
                {
                    type: "text",
                    value: '# Onde o embedding tropeça\n\nA busca vetorial entende paráfrase, mas tropeça no EXATO: códigos de erro (E-4012), nomes de produto, siglas internas, números de artigo de lei, identificadores. Para o embedding, "E-4012" e "E-4013" são quase o mesmo vetor; para o usuário, são problemas diferentes. A busca LEXICAL (palavra-chave, com o clássico BM25) é o oposto: cega para sinônimos, imbatível no termo exato.\n\nA busca HÍBRIDA roda as duas e combina: a vetorial cobre o significado, a lexical garante o literal. É o padrão de mercado para bases técnicas, jurídicas e de suporte, exatamente onde termos exatos importam.',
                },
                {
                    type: "code",
                    value: "-- Postgres tem os dois mundos: pgvector + full-text search\n-- Lado lexical (uma vez): coluna tsvector indexada\nALTER TABLE chunks ADD COLUMN tsv tsvector\n  GENERATED ALWAYS AS (to_tsvector('portuguese', texto)) STORED;\nCREATE INDEX ON chunks USING gin(tsv);\n\n-- Na consulta: duas buscas...\n-- vetorial:  ORDER BY embedding <=> $vetor LIMIT 20\n-- lexical:   WHERE tsv @@ websearch_to_tsquery('portuguese', $pergunta) LIMIT 20\n\n-- ...e a fusao por posicao (RRF): score = soma de 1/(60 + posicao_em_cada_lista)\n-- Quem aparece bem nas DUAS listas sobe; quem brilha em uma so tambem entra",
                },
                {
                    type: "table",
                    value: '[["Busca","Forte em","Cega para"],["Vetorial (embedding)","Paráfrase, sinônimo, intenção","Termo exato, código, sigla"],["Lexical (BM25 / full-text)","Termo exato, identificador","Sinônimo e paráfrase"],["Híbrida (fusão RRF)","Os dois mundos","Custa duas buscas por consulta"]]',
                },
                {
                    type: "quote",
                    value: "O teste da híbrida: busque um código de erro exato e uma paráfrase vaga. Só vetorial falha no primeiro; só lexical falha no segundo; a híbrida entrega os dois.",
                },
                {
                    type: "text",
                    value: "## A fusão sem drama\n\nComo combinar duas listas com scores incomparáveis (distância de cosseno x pontuação BM25)? O RRF (reciprocal rank fusion) ignora os scores e usa as POSIÇÕES: cada documento soma 1/(60+posição) em cada lista onde aparece. Simples, sem normalização delicada, e funciona notavelmente bem; é o padrão dos motores. No Postgres, duas CTEs e uma soma; em Qdrant/Weaviate/Elastic, a híbrida vem pronta na API. Custo: duas buscas por consulta, ambas baratas e paralelizáveis.",
                },
            ],
            questions: [
                {
                    statement: "Onde a busca vetorial tropeça?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Em termos exatos: códigos de erro, siglas, identificadores",
                            isCorrect: true,
                        },
                        {
                            text: "Em perguntas parafraseadas sem palavras em comum com o texto",
                            isCorrect: false,
                        },
                        {
                            text: "Em documentos com mais de dez páginas",
                            isCorrect: false,
                        },
                        {
                            text: "Em textos escritos em português",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a busca híbrida combina?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A vetorial (significado) com a lexical (termo exato)",
                            isCorrect: true,
                        },
                        {
                            text: "Dois modelos de geração bem diferentes em paralelo",
                            isCorrect: false,
                        },
                        {
                            text: "Dois bancos vetoriais em paralelo",
                            isCorrect: false,
                        },
                        {
                            text: "A busca com o cache de prompt",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o RRF combina as duas listas de resultados?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pelas posições: cada documento soma 1/(60+posição) em cada lista",
                            isCorrect: true,
                        },
                        {
                            text: "Somando os scores brutos de cosseno e BM25",
                            isCorrect: false,
                        },
                        {
                            text: "Escolhendo aleatoriamente entre as listas",
                            isCorrect: false,
                        },
                        {
                            text: "Ficando somente com a lista de busca que tiver mais itens no total",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o RRF usa posições em vez dos scores das buscas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os scores das duas buscas são incomparáveis entre si",
                            isCorrect: true,
                        },
                        {
                            text: "Posições ocupam menos memória no servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Os scores são mantidos secretos nos bancos gerenciados",
                            isCorrect: false,
                        },
                        {
                            text: "Posições mudam menos entre execuções",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Suporte técnico: usuários buscam tanto "erro E-4012" quanto "tela fica branca ao salvar". Qual arquitetura de busca atende os dois?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Híbrida: lexical garante o código exato, vetorial pega a descrição vaga",
                            isCorrect: true,
                        },
                        {
                            text: "Só vetorial com k bem alto para compensar",
                            isCorrect: false,
                        },
                        {
                            text: "Só lexical com sinônimos cadastrados à mão",
                            isCorrect: false,
                        },
                        {
                            text: "Duas bases totalmente separadas, uma para cada tipo de usuário do produto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Reranking: o segundo olhar",
            blocks: [
                {
                    type: "text",
                    value: "# Recuperar largo, ordenar fino\n\nO embedding compara pergunta e chunk SEPARADAMENTE (cada um virou vetor sem ver o outro); é rápido e escalável, mas grosseiro. O RERANKER lê pergunta e candidato JUNTOS (arquitetura cross-encoder) e pontua a relevância do par com muito mais precisão; é caro demais para varrer o índice, perfeito para reordenar poucos candidatos.\n\nDaí o funil clássico de duas etapas: a busca (híbrida) recupera LARGO (30 a 50 candidatos, priorizando recall), e o reranker reordena fino e corta para os 5 a 8 melhores que entram no prompt. Cada etapa no seu regime: a barata cobre, a precisa escolhe.",
                },
                {
                    type: "code",
                    value: "def buscar_com_rerank(pergunta, k_largo=40, k_final=6):\n    candidatos = busca_hibrida(pergunta, k=k_largo)      # recall alto, barato\n    pontuados = reranker.score(\n        query=pergunta,\n        documents=[c.texto for c in candidatos],          # pares (pergunta, doc)\n    )\n    melhores = ordenar_por_score(candidatos, pontuados)[:k_final]\n    return [c for c in melhores if c.score >= LIMIAR]     # corte de confianca\n# Rerankers: servicos dedicados (Cohere, Voyage e afins) ou modelos\n# abertos rodando na sua infra; latencia tipica de dezenas a poucas centenas de ms",
                },
                {
                    type: "table",
                    value: '[["Etapa","Modelo","Vê o quê","Papel"],["Recuperação","Embedding (bi-encoder)","Pergunta e chunk separados","Cobrir: 30-50 candidatos baratos"],["Reranking","Cross-encoder","O par pergunta+chunk junto","Escolher: os 5-8 realmente relevantes"],["Geração","LLM","Pergunta + trechos escolhidos","Redigir fundamentado"]]',
                },
                {
                    type: "quote",
                    value: "O funil de retrieval maduro: recupere largo com o barato, reordene fino com o preciso, entregue pouco ao caro. Recall na primeira etapa, precisão na segunda, qualidade na terceira.",
                },
                {
                    type: "text",
                    value: "## Quando o reranker paga a conta\n\nO reranker soma latência (dezenas a centenas de ms) e um custo por consulta; entra quando a precisão do que chega ao prompt é o gargalo MEDIDO. Os sinais: os trechos certos estão nos 40 recuperados mas fora dos 8 enviados (recall alto no largo, precisão baixa no fino), respostas com fundamento fraco em base grande e parecida, ou o k final inchado na tentativa de compensar. O conjunto de avaliação do módulo 6 mede exatamente isso (o certo veio? em que posição?), e é ele que diz se o reranker entra, não a moda.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é a diferença entre o embedding e o reranker na forma de avaliar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O embedding vê pergunta e chunk separados; o reranker lê o par junto",
                            isCorrect: true,
                        },
                        {
                            text: "O embedding é sempre pago e o reranker é sempre gratuito na API",
                            isCorrect: false,
                        },
                        {
                            text: "O reranker só funciona em inglês",
                            isCorrect: false,
                        },
                        {
                            text: "Não há diferença real: os dois são o mesmo modelo por dentro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como funciona o funil de duas etapas do retrieval?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Recuperar largo e barato, depois reordenar fino e cortar",
                            isCorrect: true,
                        },
                        {
                            text: "Buscar uma vez e enviar tudo ao modelo",
                            isCorrect: false,
                        },
                        {
                            text: "Reordenar primeiro e buscar depois",
                            isCorrect: false,
                        },
                        {
                            text: "Gerar a resposta primeiro e buscar a confirmação depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o reranker não varre o índice inteiro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ler cada par pergunta+documento é caro; só cabe em poucos candidatos",
                            isCorrect: true,
                        },
                        {
                            text: "O índice vetorial bloqueia leituras feitas por modelos externos",
                            isCorrect: false,
                        },
                        {
                            text: "Rerankers têm limite legal de documentos",
                            isCorrect: false,
                        },
                        {
                            text: "O índice já devolve a ordem perfeita dos resultados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual sinal indica que o reranker vai pagar a conta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os trechos certos estão entre os 40 recuperados, mas fora dos 8 enviados",
                            isCorrect: true,
                        },
                        {
                            text: "A latência da busca vetorial está baixa demais para justificar mudanças",
                            isCorrect: false,
                        },
                        {
                            text: "O corpus indexado tem menos de cem documentos no total",
                            isCorrect: false,
                        },
                        {
                            text: "O custo do embedding subiu no mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de adicionar o reranker, qual métrica do conjunto de avaliação deve melhorar diretamente?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A posição dos trechos certos entre os enviados ao prompt",
                            isCorrect: true,
                        },
                        {
                            text: "O número total de chunks indexados",
                            isCorrect: false,
                        },
                        {
                            text: "O custo por chamada do modelo de embedding usado na busca",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho médio das respostas geradas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Filtros e permissões na consulta",
            blocks: [
                {
                    type: "text",
                    value: '# Buscar só onde se deve\n\nOs metadados do módulo 2 entram em ação. FILTROS DE ESCOPO: a busca restrita ao que interessa (só o manual do produto X, só a versão vigente, só o idioma do usuário), combinando o WHERE com a distância na mesma query; com pgvector, é SQL puro. Filtro certo reduz o espaço de busca E melhora a precisão: menos candidatos irrelevantes disputando o top-k.\n\nE a regra de segurança inegociável: PERMISSÕES SE APLICAM NA BUSCA, não depois. Filtrar depois de recuperar ("deixa o modelo ver e a gente esconde na resposta") é vazamento: o conteúdo restrito já entrou no prompt, já influenciou a resposta, já pode ser extraído por injection. O usuário busca APENAS no subconjunto que pode ler, e isso é um WHERE obrigatório, aplicado no banco, testado como segurança.',
                },
                {
                    type: "code",
                    value: "-- Escopo + permissao + distancia, tudo na mesma query\nSELECT c.id, c.texto, c.caminho, c.metadados\nFROM chunks c\nWHERE c.metadados->>'produto' = $produto          -- filtro de escopo\n  AND c.metadados->>'status' = 'vigente'\n  AND c.acesso && $grupos_do_usuario               -- permissao NA BUSCA\nORDER BY c.embedding <=> $vetor_da_pergunta\nLIMIT 40;\n\n-- Teste de seguranca obrigatorio: usuario sem acesso pergunta\n-- exatamente sobre o documento restrito -> a busca devolve VAZIO",
                },
                {
                    type: "table",
                    value: '[["Filtro","Exemplo","Efeito"],["Escopo de produto/área","Só documentos do produto X","Menos ruído disputando o top-k"],["Versão vigente","status = vigente","Nunca citar política revogada"],["Idioma","lang = pt-BR","Trechos que o usuário entende"],["Permissões (obrigatório)","Grupos do usuário na query","Restrito nem chega ao prompt"]]',
                },
                {
                    type: "quote",
                    value: "Permissão se aplica na BUSCA, nunca depois: o que o usuário não pode ler não pode nem virar candidato. Filtrar na resposta é vazamento com etapa extra.",
                },
                {
                    type: "text",
                    value: "## O detalhe do índice filtrado\n\nUma nota de performance honesta: filtros muito seletivos junto de índices aproximados podem interagir mal (o HNSW navega o grafo global e descarta os filtrados, podendo devolver menos resultados que o pedido). O pgvector moderno lida bem na maioria dos casos; para filtros extremamente seletivos, as saídas são k maior antes do filtro, índices parciais por escopo, ou particionamento por tenant. Sinal de alerta no monitoramento: buscas filtradas devolvendo sistematicamente menos que k resultados.",
                },
            ],
            questions: [
                {
                    statement: "Onde as permissões de acesso devem ser aplicadas?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Na busca: o restrito nem vira candidato",
                            isCorrect: true,
                        },
                        {
                            text: "Na resposta final, escondendo trechos",
                            isCorrect: false,
                        },
                        {
                            text: "No frontend, ocultando as citações",
                            isCorrect: false,
                        },
                        {
                            text: "Em nenhum lugar: RAG é sempre público",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Além de segurança, o que um bom filtro de escopo melhora?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A precisão: menos candidatos irrelevantes no top-k",
                            isCorrect: true,
                        },
                        {
                            text: "O custo do modelo de geração cobrado por token",
                            isCorrect: false,
                        },
                        {
                            text: "A velocidade do chunking na ingestão",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho dos embeddings gravados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: 'Por que "filtrar depois de recuperar" é vazamento?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "O conteúdo restrito já entrou no prompt e pode ser extraído",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o filtro posterior é mais lento",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o banco não permite filtros tardios",
                            isCorrect: false,
                        },
                        {
                            text: "Não é vazamento se a resposta final esconder tudo muito bem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual teste de segurança valida o filtro de permissões?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Usuário sem acesso pergunta sobre o restrito e a busca devolve vazio",
                            isCorrect: true,
                        },
                        {
                            text: "O administrador do sistema consegue ver todos os documentos da base",
                            isCorrect: false,
                        },
                        {
                            text: "A busca devolve exatamente k resultados sempre",
                            isCorrect: false,
                        },
                        {
                            text: "O índice HNSW constrói sem avisos no log",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Buscas com filtro muito seletivo passaram a devolver menos resultados que o k pedido. Qual é a explicação provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Interação do filtro com o índice aproximado descartando candidatos do grafo",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo de embedding expirou no provedor",
                            isCorrect: false,
                        },
                        {
                            text: "O overlap do chunking está alto demais na configuração",
                            isCorrect: false,
                        },
                        {
                            text: "O RRF está fundindo as duas listas de resultados de busca na ordem errada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Transformando a consulta",
            blocks: [
                {
                    type: "text",
                    value: '# A pergunta do usuário não é a melhor busca\n\nÚltima peça do retrieval: melhorar a PRÓPRIA CONSULTA antes de buscar. Perguntas reais chegam vagas ("e as férias?"), coladas no contexto da conversa ("e no caso dela?"), múltiplas ("qual o prazo e quem aprova?") ou num vocabulário diferente do documento. Um passo barato de LLM antes da busca resolve boa parte.\n\nAs técnicas em ordem de uso. REESCRITA COM CONTEXTO (a obrigatória em chat): reescrever a pergunta incorporando a conversa ("e no caso dela?" vira "qual o prazo de férias para funcionária em licença maternidade?"); sem isso, RAG conversacional busca com pronomes. DECOMPOSIÇÃO: pergunta múltipla vira duas buscas, uma por sub-pergunta, com os resultados fundidos. MULTI-QUERY: gerar 2 ou 3 variações da pergunta e buscar com todas (cobre vocabulários diferentes). E HyDE: pedir ao modelo uma resposta HIPOTÉTICA e buscar com o embedding DELA (a resposta imaginada se parece mais com os documentos que a pergunta; útil quando pergunta e documento têm formas muito diferentes).',
                },
                {
                    type: "code",
                    value: 'PROMPT_REESCRITA = """Reescreva a ultima pergunta do usuario como uma\npergunta COMPLETA e independente, incorporando o contexto da conversa.\nSo a pergunta reescrita, nada mais.\n\nConversa:\n{ultimas_mensagens}\n\nPergunta reescrita:"""\n\ndef consultar(conversa, pergunta):\n    completa = llm_pequeno(PROMPT_REESCRITA, conversa, pergunta)   # barato\n    sub = decompor_se_multipla(completa)          # 1 ou N sub-perguntas\n    resultados = fundir([busca_hibrida(s) for s in sub])\n    return rerank(completa, resultados)',
                },
                {
                    type: "table",
                    value: '[["Técnica","Resolve","Custo"],["Reescrita com contexto","Pronomes e referências do chat","1 chamada pequena; obrigatória em conversa"],["Decomposição","Perguntas múltiplas numa só","1 chamada + buscas extras"],["Multi-query","Vocabulário diferente do documento","2-3 buscas extras"],["HyDE","Pergunta e documento com formas distantes","1 geração + 1 busca; testar antes de adotar"]]',
                },
                {
                    type: "quote",
                    value: 'Em RAG conversacional, a reescrita da pergunta não é otimização, é requisito: quem busca com "e no caso dela?" recupera nada e chama de alucinação depois.',
                },
                {
                    type: "text",
                    value: "## Fechando o módulo\n\nO retrieval completo está montado: top-k com limiar e diversidade, híbrida para o exato, reranker para a precisão, filtros e permissões na query, e a consulta transformada antes de tudo. É a metade esquerda do RAG operando em nível profissional. O módulo 5 entrega esse material ao modelo do jeito certo: o prompt aumentado, as citações e o não sei honesto.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que a reescrita com contexto é obrigatória em RAG conversacional?",
                    difficulty: "facil",
                    options: [
                        {
                            text: 'Perguntas com pronomes ("e no caso dela?") buscam nada sem o contexto',
                            isCorrect: true,
                        },
                        {
                            text: "Porque a API recusa perguntas curtas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os modelos de embeddings ignoram as interrogações das frases",
                            isCorrect: false,
                        },
                        {
                            text: "Para traduzir a pergunta do usuário para o inglês antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando usar decomposição da consulta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando uma pergunta contém várias sub-perguntas",
                            isCorrect: true,
                        },
                        {
                            text: "Quando o corpus tem menos de dez documentos",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o índice HNSW está lento",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a resposta precisa ser longa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o HyDE?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Gerar uma resposta hipotética e buscar com o embedding dela",
                            isCorrect: true,
                        },
                        {
                            text: "Um índice vetorial de alta densidade",
                            isCorrect: false,
                        },
                        {
                            text: "Um modelo de reranking de código aberto que roda localmente",
                            isCorrect: false,
                        },
                        {
                            text: "A fusão de listas por posição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a lógica por trás do HyDE?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A resposta imaginada se parece mais com os documentos que a pergunta",
                            isCorrect: true,
                        },
                        {
                            text: "Perguntas hipotéticas custam menos tokens que as normais na API",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo lembra as respostas que já gerou antes na sessão",
                            isCorrect: false,
                        },
                        {
                            text: "Embeddings de respostas são menores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        '"Qual o prazo de aprovação e quem assina?" recupera bem só sobre prazo. Qual técnica corrige?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Decomposição: uma busca por sub-pergunta, com fusão dos resultados",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o k da busca única para trinta e aceitar o ruído extra",
                            isCorrect: false,
                        },
                        {
                            text: "Remover o limiar de corte da busca",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o operador de cosseno pelo produto interno na query",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Montando a resposta",
    aulas: [
        {
            titulo: "O prompt aumentado",
            blocks: [
                {
                    type: "text",
                    value: "# A entrega do material ao modelo\n\nOs trechos certos chegaram; agora é montar o prompt que os transforma em resposta fundamentada. A estrutura canônica: o SYSTEM define o papel e as regras de fundamento (responder APENAS com base nos trechos; sem a informação, dizer que não achou; citar a fonte de cada afirmação); os TRECHOS entram identificados e delimitados (cada um com número e origem: [1] Manual RH > Férias); e a PERGUNTA fecha o prompt.\n\nAs lições da trilha de Fundamentos aplicadas: trechos mais relevantes nas PONTAS da lista (o meio é a região fraca), material estável em posição estável (documentos repetidos favorecem o cache) e orçamento consciente (5 a 8 trechos bons superam 20 medianos, em qualidade E custo).",
                },
                {
                    type: "code",
                    value: 'SYSTEM_RAG = """Voce responde com base EXCLUSIVAMENTE nos trechos fornecidos.\nRegras:\n- Cada afirmacao factual termina com a citacao [n] do trecho de origem\n- Se os trechos nao contem a resposta, diga: \'Nao encontrei essa\n  informacao na base\' e sugira reformular; NAO complete com conhecimento seu\n- Trechos conflitantes: aponte o conflito e cite os dois\n- Responda em portugues, direto ao ponto"""\n\ndef montar_prompt(pergunta, trechos):\n    blocos = [f"[{i+1}] ({t.caminho})\\n{t.texto}" for i, t in enumerate(trechos)]\n    contexto = "\\n\\n---\\n\\n".join(blocos)\n    return f"Trechos da base:\\n\\n{contexto}\\n\\nPergunta: {pergunta}"',
                },
                {
                    type: "table",
                    value: '[["Peça do prompt","Conteúdo","Cuidado"],["System de fundamento","Regras: só os trechos, citar, não sei","Com a SAÍDA para cada caso"],["Trechos identificados","[n] + origem + texto delimitado","Relevantes nas pontas; 5-8 bons"],["Pergunta","A reescrita completa (módulo 4)","Por último, fechando o prompt"]]',
                },
                {
                    type: "quote",
                    value: "O prompt aumentado tem um contrato: o modelo é um leitor que responde SOBRE o material entregue, não um sábio que responde DE MEMÓRIA. Cada regra do system reforça esse papel.",
                },
                {
                    type: "text",
                    value: '## Por que a numeração importa\n\nOs identificadores [1], [2] não são estética: são o mecanismo das CITAÇÕES (a resposta aponta [2], e a aplicação resolve [2] para o documento e o link via metadados) e da DEPURAÇÃO (a resposta citou [3]? olhe o trecho 3 e confira). Sem números, a citação vira prosa vaga ("segundo o manual...") que não se verifica nem se audita. A próxima aula transforma esses números em citações de verdade na interface.',
                },
            ],
            questions: [
                {
                    statement: "Qual é a estrutura canônica do prompt aumentado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "System de fundamento, trechos identificados e a pergunta",
                            isCorrect: true,
                        },
                        {
                            text: "A pergunta primeiro, com os documentos inteiros depois",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas a pergunta, sem contexto nenhum",
                            isCorrect: false,
                        },
                        {
                            text: "O histórico completo de todas as conversas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que o system de fundamento deve instruir quando os trechos não respondem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dizer que não encontrou na base, sem completar de memória",
                            isCorrect: true,
                        },
                        {
                            text: "Responder com o conhecimento geral que o modelo já tem",
                            isCorrect: false,
                        },
                        {
                            text: "Repetir os trechos recebidos na íntegra",
                            isCorrect: false,
                        },
                        {
                            text: "Encerrar a conversa sem resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que 5 a 8 trechos bons superam 20 medianos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Menos diluição e custo; o meio de contexto longo é a região fraca",
                            isCorrect: true,
                        },
                        {
                            text: "A API limita o prompt a oito blocos",
                            isCorrect: false,
                        },
                        {
                            text: "Vinte trechos travam o cache de prompt",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo só lê os cinco primeiros itens da lista de trechos enviada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que servem os identificadores [1], [2] nos trechos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ancorar as citações da resposta e permitir depuração",
                            isCorrect: true,
                        },
                        {
                            text: "Ordenar os trechos por data de criação no prompt",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzir o custo de tokens do contexto",
                            isCorrect: false,
                        },
                        {
                            text: "Impedir o modelo de misturar idiomas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois trechos recuperados se contradizem. O que o system bem escrito manda fazer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Apontar o conflito e citar os dois trechos",
                            isCorrect: true,
                        },
                        {
                            text: "Escolher em silêncio o trecho mais recente",
                            isCorrect: false,
                        },
                        {
                            text: "Ignorar ambos e responder de memória",
                            isCorrect: false,
                        },
                        {
                            text: "Somar as duas versões numa média",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Citações que se verificam",
            blocks: [
                {
                    type: "text",
                    value: '# A resposta que mostra a fonte\n\nCitação é o que separa "o assistente disse" de "o Manual de RH, seção Férias, diz". O ciclo completo: o modelo cita [n] nas afirmações (porque o system exige e os trechos estão numerados); a aplicação PARSEIA os [n] da resposta e os resolve para os metadados (título, seção, link); e a interface exibe a citação clicável, idealmente com o trecho destacável ao passar o mouse ou abrir.\n\nO efeito no produto é dobrado: confiança do usuário (ele confere em um clique) e disciplina do modelo (o hábito de citar por afirmação reduz a tentação de completar de memória, porque afirmação sem trecho fica visivelmente nua).',
                },
                {
                    type: "code",
                    value: 'import re\n\ndef resolver_citacoes(resposta, trechos):\n    usados = sorted({int(n) for n in re.findall(r"\\[(\\d+)\\]", resposta)})\n    fontes = []\n    for n in usados:\n        if 1 <= n <= len(trechos):\n            t = trechos[n - 1]\n            fontes.append({"n": n, "titulo": t.titulo_doc,\n                           "caminho": t.caminho, "url": t.fonte_url})\n    return {"texto": resposta, "fontes": fontes}\n# Guardar tambem QUAIS trechos foram enviados por resposta:\n# e o rastro de auditoria de por que o sistema respondeu o que respondeu',
                },
                {
                    type: "table",
                    value: '[["Elo do ciclo","Quem faz","Falha típica"],["Citar [n] por afirmação","O modelo, guiado pelo system","Resposta sem citações; reforçar regra e exemplo"],["Parsear e resolver os [n]","A aplicação, via metadados","Número fora da lista: ignorar com log"],["Exibir fonte clicável","A interface","Citação que não abre o documento"],["Auditar depois","O log da resposta + trechos enviados","Sem rastro, sem investigação possível"]]',
                },
                {
                    type: "quote",
                    value: "Citação boa fecha o ciclo: o modelo aponta [2], a aplicação resolve para o documento, o usuário confere no clique. Qualquer elo quebrado e a citação vira decoração.",
                },
                {
                    type: "text",
                    value: "## O caso da citação inventada\n\nAtenção ao modo de falha próprio: o modelo pode citar um número que não existe ([9] com seis trechos) ou citar o trecho ERRADO para a afirmação. O primeiro é fácil (parse valida o intervalo, log do desvio); o segundo é sutil e é uma das coisas que a avaliação do módulo 6 mede (a citação sustenta a afirmação?). Regra de exibição: só renderize como fonte o que existe na lista enviada; número órfão nunca vira link.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o ciclo completo de uma citação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Modelo cita [n], aplicação resolve via metadados, interface exibe clicável",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo busca o link correto na web na hora e cola direto na resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Usuário adiciona as fontes manualmente depois",
                            isCorrect: false,
                        },
                        {
                            text: "O banco vetorial injeta os links sozinho nas respostas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Além da confiança do usuário, o que o hábito de citar melhora?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A disciplina do modelo: afirmação sem trecho fica visível",
                            isCorrect: true,
                        },
                        {
                            text: "A velocidade média de geração da resposta pelo modelo",
                            isCorrect: false,
                        },
                        {
                            text: "O custo total por token de cada chamada feita",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho do índice vetorial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A resposta citou [9], mas só seis trechos foram enviados. O que a aplicação faz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Valida o intervalo, não renderiza o órfão e registra o desvio",
                            isCorrect: true,
                        },
                        {
                            text: "Cria um documento totalmente novo na base para o número nove",
                            isCorrect: false,
                        },
                        {
                            text: "Exibe o link quebrado para transparência",
                            isCorrect: false,
                        },
                        {
                            text: "Descarta a resposta inteira sempre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que guardar quais trechos foram enviados em cada resposta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É o rastro de auditoria de por que o sistema respondeu aquilo",
                            isCorrect: true,
                        },
                        {
                            text: "Para reaproveitar os mesmos trechos em outros usuários depois",
                            isCorrect: false,
                        },
                        {
                            text: "Para treinar o modelo de embedding depois",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o banco exige a cópia dos trechos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual falha de citação é sutil e exige avaliação para detectar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Citar o trecho errado: o número existe, mas não sustenta a afirmação",
                            isCorrect: true,
                        },
                        {
                            text: "Citar um número que esteja fora do intervalo de trechos enviados",
                            isCorrect: false,
                        },
                        {
                            text: "Esquecer o ponto final depois da citação",
                            isCorrect: false,
                        },
                        {
                            text: "Usar colchetes em vez de parênteses nas citações do texto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O não sei honesto",
            blocks: [
                {
                    type: "text",
                    value: '# A resposta mais subestimada do RAG\n\n"Não encontrei essa informação na base" é uma RESPOSTA CORRETA, e produtos maduros a tratam como cidadã de primeira classe. A alternativa (o modelo completando de memória quando os trechos não respondem) é o pior dos mundos: a resposta vem fluente, sem fundamento, com a autoridade visual de um sistema que cita fontes.\n\nO não sei se constrói em camadas. Na BUSCA: o limiar de corte (módulo 4) faz pergunta fora da base devolver pouco ou nada; poucos candidatos fracos é o primeiro sinal. No PROMPT: a regra explícita com a saída ("sem a resposta nos trechos, diga que não encontrou e sugira reformular"). Na APLICAÇÃO: se a busca voltou vazia, nem chame o modelo com contexto oco; responda o não-encontrei fixo (mais barato e sem risco). E na MÉTRICA: o conjunto de avaliação PRECISA ter perguntas sem resposta na base, medindo se o sistema resiste à tentação.',
                },
                {
                    type: "table",
                    value: '[["Camada","Mecanismo","O que evita"],["Busca","Limiar de corte; vazio é sinal","Trechos fracos fingindo relevância"],["Aplicação","Busca vazia responde fixo, sem chamar o modelo","Gerar sobre contexto oco"],["Prompt","Regra do não sei com saída sugerida","O modelo completando de memória"],["Avaliação","Perguntas-armadilha sem resposta na base","Regressão silenciosa da honestidade"]]',
                },
                {
                    type: "quote",
                    value: "Num sistema que cita fontes, a alucinação veste terno: vem fluente e com aparência de fundamentada. O não sei honesto é o anticorpo, e se constrói em camadas, não numa frase do prompt.",
                },
                {
                    type: "text",
                    value: '## O não sei que ajuda\n\nA versão pobre para o usuário: "não encontrei". A versão boa fecha com caminho: o que foi procurado ("não encontrei nada sobre reembolso de cursos na base atual"), uma reformulação sugerida quando os candidatos fracos dão pista ("quer perguntar sobre auxílio educação? encontrei material próximo disso") e o canal alternativo ("para casos não cobertos, o RH atende em..."). Não achar com elegância também é UX, e as recusas com saída da trilha anterior valem aqui inteiras.',
                },
            ],
            questions: [
                {
                    statement: "Por que o não sei é uma resposta correta em RAG?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Se a base não cobre, a alternativa é alucinação com cara de fundamentada",
                            isCorrect: true,
                        },
                        {
                            text: "Porque economiza tokens de saída",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os usuários preferem não ter nenhuma resposta exibida na tela",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a API premia recusas educadas com desconto na fatura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a aplicação faz quando a busca volta vazia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Responde o não-encontrei fixo, sem nem chamar o modelo",
                            isCorrect: true,
                        },
                        {
                            text: "Chama o modelo sem contexto nenhum para ele tentar",
                            isCorrect: false,
                        },
                        {
                            text: "Repete a mesma busca até vir algo",
                            isCorrect: false,
                        },
                        {
                            text: "Encerra a sessão do usuário na mesma hora",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual sinal da BUSCA alimenta o não sei?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Poucos candidatos e fracos após o limiar de corte",
                            isCorrect: true,
                        },
                        {
                            text: "Latência alta demais na consulta feita ao índice",
                            isCorrect: false,
                        },
                        {
                            text: "Muitos candidatos com score máximo",
                            isCorrect: false,
                        },
                        {
                            text: "O índice HNSW em manutenção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o conjunto de avaliação precisa de perguntas SEM resposta na base?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para medir se o sistema resiste à tentação de inventar",
                            isCorrect: true,
                        },
                        {
                            text: "Para aumentar o número total de casos do conjunto",
                            isCorrect: false,
                        },
                        {
                            text: "Para testar a velocidade da busca vazia",
                            isCorrect: false,
                        },
                        {
                            text: "Para treinar o modelo com casos negativos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que transforma um não sei pobre num não sei que ajuda?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Dizer o que foi procurado, sugerir reformulação e apontar o canal alternativo",
                            isCorrect: true,
                        },
                        {
                            text: "Pedir desculpas em três parágrafos formais",
                            isCorrect: false,
                        },
                        {
                            text: "Prometer que a base de documentos será atualizada em breve",
                            isCorrect: false,
                        },
                        {
                            text: "Responder com um trecho qualquer da base apenas para não frustrar o cliente",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "RAG conversacional: chat sobre a base",
            blocks: [
                {
                    type: "text",
                    value: '# Onde as duas trilhas se encontram\n\nO RAG raramente vive numa caixa de busca: ele vive num CHAT. E o chat traz a memória da trilha anterior para o meio do fluxo: a cada turno, a pergunta nova chega colada na conversa ("e no caso dela?"), e o pipeline vira: reescrever a pergunta com o contexto (módulo 4), buscar com a pergunta reescrita, montar o prompt com system + HISTÓRICO da conversa + trechos novos + pergunta, e gerar com citações.\n\nAs decisões que aparecem: os trechos de turnos ANTERIORES não ficam no histórico reenviado (incham o contexto; se o assunto voltar, a busca os traz de novo, fresquinhos); o histórico entra pela janela deslizante da trilha anterior; e o streaming com SSE funciona idêntico (o RAG só muda o que entra no prompt, não o transporte).',
                },
                {
                    type: "code",
                    value: "def turno_rag(conversa, pergunta_crua):\n    pergunta = reescrever_com_contexto(conversa, pergunta_crua)   # modulo 4\n    trechos = retrieval_completo(pergunta, usuario=conversa.user) # hibrida+rerank+filtros\n    if not trechos:\n        return NAO_ENCONTREI_FIXO\n    mensagens = [\n        system_rag(),\n        *janela_deslizante(conversa.mensagens),   # SEM trechos antigos\n        contexto_de_trechos(trechos),             # so os deste turno\n        user(pergunta_crua),                      # a crua: o modelo ve o dialogo real\n    ]\n    return gerar_streaming(mensagens)             # SSE identico ao da trilha anterior",
                },
                {
                    type: "table",
                    value: '[["Peça do turno","De onde vem","Decisão-chave"],["Pergunta reescrita","LLM pequeno + contexto","Buscar com ELA, não com a crua"],["Trechos do turno","Retrieval completo com permissões","Só os deste turno entram no prompt"],["Histórico","Janela deslizante (trilha anterior)","Sem os trechos de turnos passados"],["Resposta","Geração com citações, streamada","O transporte não muda com RAG"]]',
                },
                {
                    type: "quote",
                    value: "No chat sobre a base, cada turno busca de novo: trechos são ingrediente fresco por pergunta, não bagagem acumulada no histórico. O que vale lembrar é a conversa; o que vale buscar é a base.",
                },
                {
                    type: "text",
                    value: '## O caso do documento anexado\n\nHíbrido comum: o usuário ANEXA um documento na conversa ("analisa esse contrato junto com a política de vocês"). O padrão: o anexo entra por contexto direto (cabe na janela? entra inteiro neste turno) ou por indexação efêmera (grande demais: chunking + busca também nele, com escopo da conversa e descarte depois). Os dois caminhos convivem com o RAG da base, e o mapa de decisão do módulo 1 (contexto para o avulso, RAG para a base) decide por documento.',
                },
            ],
            questions: [
                {
                    statement: "Com qual pergunta o sistema busca no turno de um chat?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Com a reescrita completa, que incorpora o contexto da conversa",
                            isCorrect: true,
                        },
                        {
                            text: "Com a pergunta crua, exatamente como foi digitada no chat",
                            isCorrect: false,
                        },
                        {
                            text: "Com a primeira pergunta feita na conversa inteira",
                            isCorrect: false,
                        },
                        {
                            text: "Com o system prompt da aplicação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Os trechos recuperados em turnos anteriores ficam no histórico reenviado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Não: incham o contexto; se o assunto voltar, a busca os traz de novo",
                            isCorrect: true,
                        },
                        {
                            text: "Sim: uma vez recuperado, o trecho nunca mais sai do histórico enviado",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, mas comprimidos em uma linha cada",
                            isCorrect: false,
                        },
                        {
                            text: "Depende da temperatura da geração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que muda no streaming quando o chat vira RAG?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nada no transporte: muda apenas o que entra no prompt",
                            isCorrect: true,
                        },
                        {
                            text: "O SSE precisa de um canal extra só para as citações",
                            isCorrect: false,
                        },
                        {
                            text: "Streaming deixa de funcionar com trechos",
                            isCorrect: false,
                        },
                        {
                            text: "A resposta passa a vir de uma vez só",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O usuário anexa um contrato pequeno na conversa. Qual é o caminho padrão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Entra por contexto direto neste turno, convivendo com o RAG da base",
                            isCorrect: true,
                        },
                        {
                            text: "É indexado na base permanente da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "É recusado: um chat sobre a base não aceita anexos dos usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Substitui a base de conhecimento inteira na conversa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um anexo de 300 páginas não cabe na janela. Qual é o padrão para ele?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Indexação efêmera: chunking e busca com escopo da conversa, descartada depois",
                            isCorrect: true,
                        },
                        {
                            text: "Cortar apenas as primeiras 50 páginas do documento e ignorar todo o resto dele",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir ao usuário que resuma o documento antes",
                            isCorrect: false,
                        },
                        {
                            text: "Enviar o documento por e-mail ao suporte",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Custo e latência do RAG",
            blocks: [
                {
                    type: "text",
                    value: "# A conta do turno completo\n\nFechando o módulo, a economia. Um turno de RAG conversacional soma: a reescrita (chamada pequena, centavos), o embedding da pergunta (irrisório), a busca (infra própria, milissegundos), o reranker (se houver: pequeno custo + dezenas de ms) e a GERAÇÃO, onde mora o grosso: o prompt aumentado carrega system + histórico + trechos, e os trechos costumam ser o maior bloco de tokens de entrada.\n\nAs alavancas, na ordem de impacto: MENOS trechos melhores (o reranker paga a si mesmo cortando de 20 para 6), trechos ENXUTOS (chunks do tamanho certo, sem overlap exagerado no prompt), CACHE de prompt (system estável no prefixo; em bases pequenas e perguntas repetitivas, até os trechos frequentes se beneficiam) e o MODELO CERTO (geração fundamentada é tarefa que o intermediário faz muito bem; o flagship raramente se paga aqui).",
                },
                {
                    type: "table",
                    value: '[["Etapa do turno","Custo típico","Alavanca"],["Reescrita da pergunta","Centavos (modelo pequeno)","Manter; é o melhor custo-benefício do RAG"],["Embedding + busca","Irrisório + infra própria","Índice saudável (módulo 3)"],["Reranker","Pequeno por consulta","Entra quando corta trechos da geração"],["Geração","O grosso: trechos na entrada","Menos e melhores trechos; modelo intermediário"],["Latência total","Soma das etapas em série","Paralelizar buscas; streaming na resposta"]]',
                },
                {
                    type: "quote",
                    value: "No RAG, o token caro é o trecho desnecessário multiplicado por toda pergunta. Retrieval preciso não é só qualidade: é a maior alavanca de custo do sistema.",
                },
                {
                    type: "text",
                    value: "## Latência em série e o que paralelizar\n\nAs etapas rodam em série (reescrever, buscar, rerankear, gerar), e a soma aparece no TTFT. Onde ganhar: buscas da híbrida em paralelo (vetorial e lexical ao mesmo tempo), reranker com lote único, e o streaming da resposta escondendo a geração (o usuário lê enquanto gera). Meça o turno por etapa (a trilha de produção agrega em tracing): quando o TTFT doer, o vilão costuma ser reescrita + rerank somando meio segundo, e ambos têm dial. Módulo 6 a seguir: medir a qualidade de tudo isso com método.",
                },
            ],
            questions: [
                {
                    statement: "Onde mora o grosso do custo de um turno de RAG?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Na geração: os trechos são o maior bloco de tokens de entrada",
                            isCorrect: true,
                        },
                        {
                            text: "No embedding da pergunta do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Na busca vetorial feita dentro do banco de dados",
                            isCorrect: false,
                        },
                        {
                            text: "No parse de todas as citações numeradas da resposta final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a maior alavanca de custo do RAG?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Menos trechos e melhores chegando à geração",
                            isCorrect: true,
                        },
                        {
                            text: "Desligar as citações das respostas",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o k para reaproveitar buscas",
                            isCorrect: false,
                        },
                        {
                            text: "Usar o flagship para responder mais rápido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o reranker pode pagar a si mesmo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cortando os trechos da geração (de 20 para 6, por exemplo)",
                            isCorrect: true,
                        },
                        {
                            text: "Substituindo o modelo de embedding por um bem mais novo",
                            isCorrect: false,
                        },
                        {
                            text: "Eliminando a necessidade de índice",
                            isCorrect: false,
                        },
                        {
                            text: "Gerando a resposta final sozinho, sem o modelo de chat",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais buscas podem rodar em paralelo no turno?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A vetorial e a lexical da busca híbrida",
                            isCorrect: true,
                        },
                        {
                            text: "A reescrita e a geração da resposta",
                            isCorrect: false,
                        },
                        {
                            text: "A ingestão e a consulta do índice",
                            isCorrect: false,
                        },
                        {
                            text: "O chunking e o backup do banco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O TTFT do RAG dobrou. Além da geração, quais etapas em série são as suspeitas com dial?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Reescrita da pergunta e reranker somando latência antes de gerar",
                            isCorrect: true,
                        },
                        {
                            text: "O parse das citações e a exibição de todas as fontes no frontend",
                            isCorrect: false,
                        },
                        {
                            text: "O backup do índice e a ingestão noturna",
                            isCorrect: false,
                        },
                        {
                            text: "A criação do índice HNSW a cada busca",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Avaliando um RAG",
    aulas: [
        {
            titulo: "Por que avaliar (e o que medir)",
            blocks: [
                {
                    type: "text",
                    value: "# Sair da anedota\n\nRAG tem um problema social: TODO ajuste parece melhorar (quem mexeu testa as duas perguntas favoritas, elas melhoram, mexida aprovada). Sem medição, o sistema anda em círculos: o chunking novo melhora umas perguntas e piora outras, o reranker entra pelo hype, e ninguém sabe dizer se o sistema de hoje é melhor que o do mês passado.\n\nA saída é a mesma disciplina de sempre, adaptada ao RAG: um conjunto de avaliação com perguntas reais e respostas esperadas, rodado a cada mudança, medindo as DUAS metades separadas: a BUSCA achou os trechos certos? e a GERAÇÃO respondeu certo, fundamentada neles? Separar as metades é o pulo: sem isso, você mexe no prompt quando o problema era o chunking, e vice-versa.",
                },
                {
                    type: "table",
                    value: '[["Metade","Pergunta que responde","Métricas (aulas seguintes)"],["Retrieval","O trecho certo veio? Em que posição?","Recall@k, MRR"],["Geração","A resposta está certa e fundamentada?","Exatidão, groundedness, citações"],["Sistema inteiro","O usuário sai atendido?","Taxa de resposta correta ponta a ponta"],["Honestidade","Resiste ao que não está na base?","Taxa de não sei correto nas armadilhas"]]',
                },
                {
                    type: "quote",
                    value: "Avaliar RAG é medir as duas metades separadas: busca e geração. Quem mede só o fim não sabe QUAL metade consertar; quem não mede nada conserta a metade errada com convicção.",
                },
                {
                    type: "text",
                    value: "## O ciclo de trabalho\n\nO fluxo que este módulo monta: conjunto de avaliação (aula 2) → métricas de retrieval (aula 3) → métricas de geração (aula 4) → o processo de melhoria com método (aula 5). A regra operacional desde já: NENHUMA mudança de chunking, modelo, k, prompt ou índice entra sem rodar o conjunto antes e depois. É o mesmo hábito do conjunto de casos das trilhas anteriores, agora com nome de gente grande, e é a fundação direta dos evals da trilha de produção.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o problema social do RAG sem medição?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Todo ajuste parece melhorar nas duas perguntas favoritas de quem mexeu",
                            isCorrect: true,
                        },
                        {
                            text: "Ninguém do time de dados quer trabalhar com a busca vetorial no dia a dia",
                            isCorrect: false,
                        },
                        {
                            text: "Os usuários se recusam a fazer perguntas",
                            isCorrect: false,
                        },
                        {
                            text: "O banco de dados cresce sem controle",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são as duas metades a medir separadamente?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O retrieval (achou os trechos?) e a geração (respondeu fundamentado?)",
                            isCorrect: true,
                        },
                        {
                            text: "O frontend e o backend da aplicação de chat, medidos separadamente",
                            isCorrect: false,
                        },
                        {
                            text: "A ingestão dos documentos e o backup do índice vetorial",
                            isCorrect: false,
                        },
                        {
                            text: "O custo e a latência das chamadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que separar as metades na avaliação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para saber QUAL metade consertar, em vez de mexer na errada",
                            isCorrect: true,
                        },
                        {
                            text: "Porque as métricas custam menos separadas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a API exige avaliações independentes por contrato",
                            isCorrect: false,
                        },
                        {
                            text: "Para dobrar o número de relatórios",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a regra operacional do módulo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nenhuma mudança entra sem rodar o conjunto de avaliação antes e depois",
                            isCorrect: true,
                        },
                        {
                            text: "Toda mudança entra direto no sistema e se avalia depois em produção",
                            isCorrect: false,
                        },
                        {
                            text: "Só mudanças de prompt precisam de avaliação",
                            isCorrect: false,
                        },
                        {
                            text: "A avaliação completa roda somente uma vez por ano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "As respostas pioraram e o time discute se o problema é o prompt ou o chunking. O que resolve a discussão?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "As métricas por metade: retrieval caiu aponta chunking; geração caiu aponta prompt",
                            isCorrect: true,
                        },
                        {
                            text: "A opinião de quem tem mais tempo de casa na equipe de engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar os dois ao mesmo tempo por garantia",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntar ao próprio modelo de geração qual das duas metades está com o problema",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O conjunto de avaliação",
            blocks: [
                {
                    type: "text",
                    value: "# A matéria-prima da verdade\n\nO conjunto de avaliação de RAG é uma lista de casos: PERGUNTA + TRECHOS-VERDADE (quais chunks da base sustentam a resposta) + RESPOSTA-VERDADE (o que uma resposta correta contém). De 30 a 100 casos já mudam o jogo. As fontes, da melhor para a pior: perguntas REAIS de usuários (logs, tickets, buscas na intranet), perguntas que especialistas do domínio fariam, e perguntas geradas por LLM a partir dos documentos (escala fácil, mas cuidado: saem com o vocabulário do documento, superestimando a busca; misture e revise).\n\nA composição importa tanto quanto o tamanho: fáceis diretas, médias que exigem juntar trechos, difíceis de borda, perguntas com termos EXATOS (códigos, siglas: o teste da híbrida), perguntas parafraseadas longe do vocabulário do documento, e as ARMADILHAS: perguntas plausíveis SEM resposta na base (resposta-verdade: não sei).",
                },
                {
                    type: "code",
                    value: 'caso = {\n    "id": "rh-032",\n    "pergunta": "Posso vender dez dias de ferias?",\n    "trechos_verdade": ["manual-rh-2026#ferias-abono-p2"],   # ids de chunks\n    "resposta_verdade": "Sim, ate 10 dias (um terco de 30); prazo de\\n      solicitacao ate 15 dias antes do inicio das ferias",\n    "tipo": "media",          # facil | media | dificil | exata | armadilha\n}\n# Armadilha: {"pergunta": "Qual o valor do vale-alimentacao?",\n#             "trechos_verdade": [], "resposta_verdade": "nao ha na base",\n#             "tipo": "armadilha"}',
                },
                {
                    type: "table",
                    value: '[["Tipo de caso","Testa o quê","Proporção sugerida"],["Fácil direta","O caminho feliz","~30%"],["Média (juntar trechos)","Retrieval múltiplo e síntese","~25%"],["Termo exato (código, sigla)","A busca híbrida","~15%"],["Parafraseada distante","O embedding de verdade","~15%"],["Armadilha (sem resposta)","O não sei honesto","~15%"]]',
                },
                {
                    type: "quote",
                    value: "Conjunto sem armadilhas aprova sistema mentiroso; conjunto sem paráfrases aprova busca de brinquedo. A composição do conjunto é o exame que o seu RAG vai passar ou não.",
                },
                {
                    type: "text",
                    value: "## Vivo, com dono e versionado\n\nO conjunto é artefato de engenharia: versionado no repositório, com dono, e VIVO: toda falha real de produção interessante vira caso novo (a pergunta que enganou o sistema ontem é o teste de regressão de amanhã). E os trechos-verdade precisam de manutenção quando a base muda (o chunk renomeado quebra a referência; o id estável do módulo 2 ajuda). Meia hora por semana mantém o conjunto honesto; é barato pelo que ele paga.",
                },
            ],
            questions: [
                {
                    statement: "O que compõe um caso do conjunto de avaliação de RAG?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pergunta, trechos-verdade e resposta-verdade",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas a pergunta e o tempo de resposta",
                            isCorrect: false,
                        },
                        {
                            text: "O log completo do servidor no dia",
                            isCorrect: false,
                        },
                        {
                            text: "O custo em tokens de cada resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a melhor fonte de perguntas para o conjunto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Perguntas reais de usuários (logs, tickets, buscas)",
                            isCorrect: true,
                        },
                        {
                            text: "Perguntas aleatórias de um gerador de texto",
                            isCorrect: false,
                        },
                        {
                            text: "As duas perguntas favoritas de quem desenvolve",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntas de outra empresa do mesmo ramo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o risco das perguntas geradas por LLM a partir dos documentos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Saem com o vocabulário do documento e superestimam a busca",
                            isCorrect: true,
                        },
                        {
                            text: "São gramaticalmente incorretas demais",
                            isCorrect: false,
                        },
                        {
                            text: "Custam mais que entrevistar usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Não podem ser usadas por questões de direitos autorais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que as perguntas-armadilha testam?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Se o sistema responde não sei quando a base não cobre",
                            isCorrect: true,
                        },
                        {
                            text: "A velocidade do índice sob carga",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho máximo permitido para o prompt aumentado",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem das citações na resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma pergunta real enganou o sistema em produção ontem. O que fazer com ela?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Virar caso novo do conjunto: o teste de regressão de amanhã",
                            isCorrect: true,
                        },
                        {
                            text: "Apagar dos logs para não constranger",
                            isCorrect: false,
                        },
                        {
                            text: "Responder manualmente ao usuário e seguir em frente sem registro",
                            isCorrect: false,
                        },
                        {
                            text: "Banir o usuário que perguntou",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Métricas de retrieval",
            blocks: [
                {
                    type: "text",
                    value: "# A busca achou?\n\nCom trechos-verdade anotados, medir a busca é conta simples. RECALL@K: dos trechos-verdade, quantos apareceram entre os k recuperados? É a métrica mãe (se o trecho não veio, nada adiante salva). Medida em k pequeno (o que entra no prompt: recall@6) e em k largo (o que a primeira etapa recuperou: recall@40); a DIFERENÇA entre os dois diz onde investir: recall@40 alto com recall@6 baixo pede reranker; recall@40 baixo pede busca melhor (chunking, híbrida, embedding).\n\nMRR (mean reciprocal rank): em que POSIÇÃO o primeiro trecho certo apareceu (1/posição, na média)? Complementa o recall: mesmo presente, trecho certo em posição ruim briga com o lost in the middle no prompt. E a taxa de VAZIO CORRETO nas armadilhas: a busca devolve pouco ou nada quando não deveria achar (o limiar funcionando)?",
                },
                {
                    type: "code",
                    value: 'def avaliar_retrieval(casos, k_final=6, k_largo=40):\n    métricas = []\n    for caso in casos:\n        rec = buscar(caso.pergunta, k=k_largo)         # ids recuperados, em ordem\n        verdade = set(caso.trechos_verdade)\n        if not verdade:                                 # armadilha\n            métricas.append({"vazio_ok": len(rec_acima_do_limiar(rec)) == 0})\n            continue\n        no_final = verdade & set(ids(rec[:k_final]))\n        no_largo = verdade & set(ids(rec))\n        pos = primeira_posicao(rec, verdade)\n        métricas.append({\n            "recall_final": len(no_final) / len(verdade),\n            "recall_largo": len(no_largo) / len(verdade),\n            "rr": 1 / pos if pos else 0,\n        })\n    return agregar(métricas)   # medias por tipo de caso, nao so a geral',
                },
                {
                    type: "table",
                    value: '[["Métrica","Pergunta que responde","Diagnóstico quando baixa"],["Recall@k final (ex.: 6)","O certo chegou ao prompt?","Se o largo está alto: reranker/ordenação"],["Recall@k largo (ex.: 40)","O certo foi recuperado?","Chunking, híbrida, embedding, consulta"],["MRR","O certo veio em boa posição?","Ordenação; risco de meio perdido"],["Vazio correto (armadilhas)","O limiar segura o que não existe?","Calibrar limiar de corte"]]',
                },
                {
                    type: "quote",
                    value: "Recall@largo diz se a busca ACHA; recall@final diz se o achado CHEGA ao prompt. A diferença entre os dois é o mapa de investimento: busca melhor ou ordenação melhor.",
                },
                {
                    type: "text",
                    value: '## Agregação que informa\n\nA média geral esconde; agregue POR TIPO de caso: recall das exatas (a saúde da híbrida), das parafraseadas (a saúde do embedding), das médias (retrieval múltiplo). "Recall@6 geral de 0,82" vira acionável quando se abre: exatas 0,95, parafraseadas 0,63 → o embedding (ou a consulta) é o gargalo, e a mexida certa fica óbvia. Toda rodada de avaliação sai com essa tabela aberta por tipo.',
                },
            ],
            questions: [
                {
                    statement: "O que o recall@k mede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quantos dos trechos-verdade apareceram entre os k recuperados",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo médio de resposta da busca medido em milissegundos",
                            isCorrect: false,
                        },
                        {
                            text: "O número de chunks totais do índice",
                            isCorrect: false,
                        },
                        {
                            text: "A satisfação declarada pelos usuários na pesquisa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o MRR acrescenta ao recall?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A posição em que o primeiro trecho certo apareceu",
                            isCorrect: true,
                        },
                        {
                            text: "O custo em tokens da recuperação",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade total de buscas feitas por minuto",
                            isCorrect: false,
                        },
                        {
                            text: "O idioma dos trechos recuperados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Recall@40 alto e recall@6 baixo: qual é o investimento indicado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reranker/ordenação: a busca acha, mas o achado não chega ao prompt",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar o modelo de embedding inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Refazer o chunking inteiro da base com pedaços bem maiores que antes",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o max_tokens da geração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Recall@40 baixo: onde estão os suspeitos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Chunking, busca híbrida, embedding ou a transformação da consulta",
                            isCorrect: true,
                        },
                        {
                            text: "O parse das citações na resposta",
                            isCorrect: false,
                        },
                        {
                            text: "O streaming da resposta final até o navegador de cada usuário",
                            isCorrect: false,
                        },
                        {
                            text: "A temperatura configurada na geração das respostas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Recall geral de 0,82; aberto por tipo: exatas 0,95, parafraseadas 0,63. Qual é a leitura?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A híbrida vai bem; o gargalo é semântico (embedding ou consulta)",
                            isCorrect: true,
                        },
                        {
                            text: "O sistema está todo uniforme e não precisa de mais nada agora",
                            isCorrect: false,
                        },
                        {
                            text: "As exatas precisam de reforço lexical urgente",
                            isCorrect: false,
                        },
                        {
                            text: "O conjunto de avaliação está grande demais",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Métricas de geração",
            blocks: [
                {
                    type: "text",
                    value: "# A resposta prestou?\n\nSegunda metade: dado que os trechos vieram, a resposta final se avalia em três eixos. CORREÇÃO: bate com a resposta-verdade? (checagens programáticas quando dá: o valor, a data, o sim/não; e LLM-as-judge para o resto: um modelo compara resposta e verdade e pontua, com o cuidado de calibrar o juiz contra avaliações humanas numa amostra). GROUNDEDNESS (fundamento): toda afirmação da resposta está SUSTENTADA pelos trechos enviados? (o juiz recebe resposta + trechos e caça afirmações órfãs; é a métrica anti-alucinação). E CITAÇÕES: presentes, válidas e apontando o trecho que de fato sustenta cada afirmação.\n\nMais a taxa de NÃO SEI CORRETO nas armadilhas, agora fim a fim: com a busca devolvendo nada, a resposta final recusou de fato (ou o modelo inventou por cima do vazio?).",
                },
                {
                    type: "code",
                    value: 'PROMPT_JUIZ_FUNDAMENTO = """Avalie se a RESPOSTA esta sustentada pelos TRECHOS.\nPara cada afirmacao factual da resposta:\n- SUSTENTADA: um trecho a apoia diretamente\n- NAO SUSTENTADA: nenhum trecho a apoia\n\nDevolva JSON: {"afirmacoes": [{"texto": ..., "veredito": ..., "trecho": n|null}],\n               "nota_fundamento": 0.0 a 1.0}\n\nTRECHOS: {trechos}\nRESPOSTA: {resposta}"""\n# Juiz com structured outputs + modelo intermediario; calibrar:\n# 30 casos avaliados por humano, comparar vereditos, ajustar o prompt do juiz',
                },
                {
                    type: "table",
                    value: '[["Métrica","Como se mede","Pega o quê"],["Correção","Checagem programática + juiz vs verdade","Resposta errada com trecho certo"],["Groundedness","Juiz caça afirmações sem trecho","Alucinação por cima do material"],["Qualidade das citações","Parse + juiz (a citação sustenta?)","Citação órfã ou apontando errado"],["Não sei correto (fim a fim)","Armadilhas na resposta final","Invenção por cima do vazio"]]',
                },
                {
                    type: "quote",
                    value: "Groundedness é a métrica anti-alucinação do RAG: cada afirmação da resposta precisa de um trecho que a sustente. Juiz automatizado mede em escala; calibração humana numa amostra mantém o juiz honesto.",
                },
                {
                    type: "text",
                    value: "## O juiz também erra\n\nLLM-as-judge é ferramenta, não oráculo: juízes tendem à leniência, se impressionam com respostas longas e variam com o prompt. As defesas mínimas: rubrica explícita (o que é sustentada, com exemplos), structured outputs no veredito, modelo intermediário (juiz não precisa de flagship) e CALIBRAÇÃO periódica: 30 casos julgados por humano, concordância medida, prompt do juiz ajustado quando divergir. A trilha de produção aprofunda o tema; aqui basta o juiz honesto o suficiente para comparar a versão de hoje com a de ontem.",
                },
            ],
            questions: [
                {
                    statement: "O que a groundedness mede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Se cada afirmação da resposta está sustentada pelos trechos enviados",
                            isCorrect: true,
                        },
                        {
                            text: "A velocidade da geração da resposta final pelo modelo escolhido",
                            isCorrect: false,
                        },
                        {
                            text: "O número médio de citações usadas por parágrafo",
                            isCorrect: false,
                        },
                        {
                            text: "A simpatia do tom usado na resposta ao usuário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando usar checagem programática na correção?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando a verdade é verificável por código: valor, data, sim/não",
                            isCorrect: true,
                        },
                        {
                            text: "Nunca: somente juízes de LLM avaliam respostas",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas em respostas longas com mais de dez linhas de texto",
                            isCorrect: false,
                        },
                        {
                            text: "Só quando o juiz estiver indisponível",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são os vieses conhecidos do LLM-as-judge?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Leniência e impressionar-se com respostas longas",
                            isCorrect: true,
                        },
                        {
                            text: "Rigor excessivo com respostas curtas e corretas",
                            isCorrect: false,
                        },
                        {
                            text: "Preferência por respostas em outros idiomas",
                            isCorrect: false,
                        },
                        {
                            text: "Incapacidade de ler citações numeradas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se mantém o juiz honesto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Calibração periódica contra avaliações humanas numa amostra",
                            isCorrect: true,
                        },
                        {
                            text: "Trocando o juiz de provedor toda semana",
                            isCorrect: false,
                        },
                        {
                            text: "Usando sempre o modelo mais caro como juiz",
                            isCorrect: false,
                        },
                        {
                            text: "Deixando o juiz avaliar as próprias respostas que ele deu",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Resposta correta, groundedness baixa: o que isso significa e por que preocupa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O modelo acertou de memória, sem os trechos: a sorte não escala nem se audita",
                            isCorrect: true,
                        },
                        {
                            text: "O sistema está perfeito desse jeito; a groundedness é só um detalhe técnico",
                            isCorrect: false,
                        },
                        {
                            text: "O juiz automatizado quebrou e deve ser ignorado no relatório",
                            isCorrect: false,
                        },
                        {
                            text: "A busca trouxe trechos demais para o prompt",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Melhorar com método",
            blocks: [
                {
                    type: "text",
                    value: "# O laboratório de RAG\n\nFechando o módulo, o processo que junta tudo. O protocolo de mudança: (1) rode o conjunto e guarde o BASELINE (todas as métricas, abertas por tipo); (2) mude UMA coisa (o chunking, o k, o reranker, o prompt: uma); (3) rode de novo, compare COM as aberturas; (4) melhorou sem regredir? entra, e o resultado vai para o changelog; regrediu em algum tipo? investigue antes de aceitar o trade.\n\nA ordem de investigação quando a métrica fim-a-fim está ruim (o funil de suspeitos): primeiro retrieval largo (a busca acha?), depois ordenação (chega ao prompt?), depois prompt e geração (usa direito?), por fim as citações. É a ordem de dependência: não adianta polir o prompt sobre busca quebrada.",
                },
                {
                    type: "code",
                    value: '# O relatorio de uma rodada (o que se compara entre versoes)\nrelatorio = {\n    "versao": "v14: chunking por estrutura (era recursivo)",\n    "retrieval": {\n        "recall@6": {"geral": 0.84, "exatas": 0.95, "parafraseadas": 0.71},\n        "recall@40": {"geral": 0.93},\n        "mrr": 0.78,\n    },\n    "geracao": {"correcao": 0.81, "groundedness": 0.92, "citacoes_ok": 0.88},\n    "armadilhas": {"nao_sei_correto": 0.87},\n    "custo_medio_turno": "US$ 0.011",\n}\n# vs v13: recall parafraseadas 0.58 -> 0.71; nada regrediu; APROVADA',
                },
                {
                    type: "table",
                    value: '[["Passo do protocolo","Regra"],["Baseline antes de mexer","Todas as métricas, abertas por tipo"],["Uma mudança por vez","Senão o efeito não tem dono"],["Comparar aberto, não só a média","Média esconde regressão localizada"],["Changelog de versões","Decisões com número e data"],["Funil de suspeitos na investigação","Busca larga, ordenação, prompt, citações"]]',
                },
                {
                    type: "quote",
                    value: "O funil de suspeitos poupa semanas: busca acha? chega ao prompt? o prompt usa? as citações fecham? Nessa ordem, porque polir prompt sobre busca quebrada é maquiagem.",
                },
                {
                    type: "text",
                    value: "## Fechando o módulo\n\nVocê tem o laboratório: conjunto vivo com armadilhas, métricas das duas metades abertas por tipo, juiz calibrado e um protocolo de mudança que transforma opinião em número. É o que separa RAG de demo de RAG de produto. O módulo 7 fecha a trilha montando tudo num projeto de ponta a ponta, com esse laboratório como rede de segurança.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o protocolo de mudança do RAG?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Baseline, uma mudança, rodar de novo, comparar aberto, registrar",
                            isCorrect: true,
                        },
                        {
                            text: "Mudar tudo de uma vez só e testar depois no olho, sem registro",
                            isCorrect: false,
                        },
                        {
                            text: "Subir direto para produção e esperar as reclamações",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntar ao modelo se a mudança é boa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que comparar as métricas abertas por tipo, e não só a média?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A média esconde regressões localizadas em um tipo de pergunta",
                            isCorrect: true,
                        },
                        {
                            text: "Médias são difíceis de calcular à mão",
                            isCorrect: false,
                        },
                        {
                            text: "Tipos diferentes de pergunta usam bancos de dados diferentes",
                            isCorrect: false,
                        },
                        {
                            text: "O changelog não aceita números médios",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a ordem do funil de suspeitos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Busca larga, ordenação, prompt e geração, citações",
                            isCorrect: true,
                        },
                        {
                            text: "Citações primeiro, depois prompt, ordenação e busca",
                            isCorrect: false,
                        },
                        {
                            text: "Custo, latência, recall, correção",
                            isCorrect: false,
                        },
                        {
                            text: "Frontend, backend, banco, modelo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a ordem do funil segue a dependência?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Polir o prompt sobre busca quebrada não conserta nada",
                            isCorrect: true,
                        },
                        {
                            text: "Porque as citações são a parte mais cara",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a busca é a única das etapas que tem métricas",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem é alfabética por conveniência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma mudança subiu a média geral, mas derrubou o recall das armadilhas (não sei correto caiu). O que o protocolo manda?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Investigar antes de aceitar: regressão localizada pode custar caro",
                            isCorrect: true,
                        },
                        {
                            text: "Aprovar direto: a média geral é o único número que importa aqui",
                            isCorrect: false,
                        },
                        {
                            text: "Remover as armadilhas do conjunto",
                            isCorrect: false,
                        },
                        {
                            text: "Dobrar a mesma mudança para compensar a regressão",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: assistente sobre documentos",
    aulas: [
        {
            titulo: "O desenho do projeto",
            blocks: [
                {
                    type: "text",
                    value: "# A estante inteira para o chatbot\n\nO projeto: dar ao assistente da Livraria Paginacem (o chatbot da trilha anterior) uma base de conhecimento de verdade: as políticas da loja, o guia de compra e o catálogo editorial comentado, respondendo com citações. A arquitetura soma as duas trilhas: o chat com system, ferramentas, streaming e memória JÁ EXISTE; o RAG entra como a fonte de conhecimento textual, ao lado das ferramentas de dados pontuais.\n\nAs peças novas: o pipeline de ingestão (documentos em markdown no repositório, para simplificar a fonte), a tabela de chunks com pgvector no MESMO Postgres do app, o retrieval completo (híbrida + reescrita + filtros) e o prompt aumentado com citações. E a decisão de arquitetura interessante do projeto: QUANDO usar RAG versus ferramenta? A regra do módulo 1 vira roteamento vivo: pergunta de conhecimento (políticas, guias) vai ao RAG; pergunta de dado pontual (o pedido 123) vai à ferramenta.",
                },
                {
                    type: "table",
                    value: '[["Peça","De onde vem","Módulo"],["Chat, system, streaming, memória","Trilha Aplicações com LLMs","(pronta)"],["Ingestão de markdown com hash","Pipeline idempotente","2"],["Chunks + pgvector no Postgres do app","Banco vetorial","3"],["Híbrida + reescrita + limiar","Retrieval","4"],["Prompt aumentado + citações + não sei","Montagem da resposta","5"],["Conjunto de avaliação com armadilhas","O laboratório","6"]]',
                },
                {
                    type: "quote",
                    value: "O projeto não substitui o chatbot: ENSINA o chatbot a ler. Ferramentas continuam com os dados pontuais; o RAG assume o conhecimento textual; o modelo roteia entre os dois.",
                },
                {
                    type: "text",
                    value: "## O percurso\n\nAula 2: ingestão e índice de pé (a estante montada). Aula 3: o retrieval encaixado no fluxo do chat (a consulta funcionando). Aula 4: avaliação e o ciclo de melhoria (o laboratório rodando). Aula 5: o fecho da trilha e a ponte para agentes. Como na trilha anterior, o roteiro de aceitação fecha cada etapa; e o seu mini corpus do módulo 1 pode substituir a Paginacem se você preferir o seu domínio.",
                },
            ],
            questions: [
                {
                    statement: "O que o projeto acrescenta ao chatbot da trilha anterior?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma base de conhecimento com RAG e citações, ao lado das ferramentas",
                            isCorrect: true,
                        },
                        {
                            text: "Um novo frontend completo reescrito do zero em um outro framework",
                            isCorrect: false,
                        },
                        {
                            text: "A troca do provedor de LLM por um modelo local aberto",
                            isCorrect: false,
                        },
                        {
                            text: "A remoção do streaming para simplificar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde vivem os chunks e vetores do projeto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No mesmo Postgres do app, com pgvector",
                            isCorrect: true,
                        },
                        {
                            text: "Num serviço gerenciado externo obrigatório",
                            isCorrect: false,
                        },
                        {
                            text: "Em arquivos JSON no disco do servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Na memória do processo, sem persistência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o sistema decide entre RAG e ferramenta numa pergunta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Conhecimento textual vai ao RAG; dado pontual vai à ferramenta",
                            isCorrect: true,
                        },
                        {
                            text: "Sorteia entre os dois para balancear a carga",
                            isCorrect: false,
                        },
                        {
                            text: "Sempre o RAG primeiro, com a ferramenta apenas como fallback",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário escolhe num menu antes de perguntar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que os documentos do projeto ficam em markdown no repositório?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Simplifica a fonte da ingestão, mantendo o foco no pipeline",
                            isCorrect: true,
                        },
                        {
                            text: "Markdown é o único formato de texto que gera embedding",
                            isCorrect: false,
                        },
                        {
                            text: "PDFs são proibidos em projetos didáticos",
                            isCorrect: false,
                        },
                        {
                            text: "O banco vetorial exige markdown na entrada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        '"Qual a política de troca?" e "cadê meu pedido PED-123?" chegam ao assistente. Qual é o roteamento correto?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A primeira vai ao RAG das políticas; a segunda, à ferramenta de pedidos",
                            isCorrect: true,
                        },
                        {
                            text: "As duas vão ao RAG, que resolve tudo",
                            isCorrect: false,
                        },
                        {
                            text: "As duas vão à ferramenta de pedidos",
                            isCorrect: false,
                        },
                        {
                            text: "As duas perguntas são recusadas na hora pelo assistente por ambiguidade",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Montando a estante: ingestão e índice",
            blocks: [
                {
                    type: "text",
                    value: "# Do repositório ao índice\n\nPrimeira etapa executável: os documentos da Paginacem (políticas de troca e envio, guia de compra, catálogo comentado) entram como arquivos markdown num diretório versionado. O pipeline do módulo 2, aplicado: percorrer os arquivos, hash do conteúdo (só o mudado reprocessa), extrair com os títulos preservados, chunking POR ESTRUTURA (os headers do markdown são as fronteiras naturais), metadados completos (arquivo, caminho de seções, data) e o upsert idempotente na tabela de chunks.\n\nA vetorização em lote com o modelo de embedding escolhido (registrado na config do índice, com a validação de inicialização do módulo 3) e o índice HNSW fecham a estante. O comando de ingestão vira um script do projeto: rodou, relatou (N documentos, M chunks, X novos, Y atualizados, Z removidos).",
                },
                {
                    type: "code",
                    value: '# ingestao.py: o pipeline completo do projeto\ndef ingerir_diretorio(caminho="docs/"):\n    stats = {"novos": 0, "atualizados": 0, "removidos": 0}\n    for arquivo in listar_markdown(caminho):\n        h = hash_arquivo(arquivo)\n        if registro_igual(arquivo.id, h):\n            continue\n        deletar_chunks(arquivo.id)\n        pedacos = dividir_por_headers(ler(arquivo), alvo=500, overlap=80)\n        vetores = embedding_em_lote([p.texto_com_caminho for p in pedacos])\n        gravar_chunks(arquivo.id, h, pedacos, vetores)\n        stats["novos" if registro_novo(arquivo.id) else "atualizados"] += 1\n    stats["removidos"] = limpar_orfaos(ids_atuais(caminho))\n    return stats',
                },
                {
                    type: "table",
                    value: '[["Checagem da etapa","Como verificar"],["Idempotência","Rodar duas vezes seguidas: a segunda relata zero mudanças"],["Chunks legíveis","Amostrar dez chunks: o teste do órfão passa"],["Metadados completos","Todo chunk com arquivo, caminho e data"],["Índice válido","Config registra modelo e dimensão; HNSW criado"],["Atualização","Editar um arquivo, rodar: só ele reprocessa"]]',
                },
                {
                    type: "quote",
                    value: "A estante está montada quando a ingestão roda duas vezes e a segunda não muda nada, e quando dez chunks aleatórios passam no teste do órfão. Só então vale conectar a busca.",
                },
                {
                    type: "text",
                    value: "## Primeira busca de fumaça\n\nAntes de integrar ao chat, o teste de fumaça direto no banco: cinco perguntas que você sabe responder, a query de vizinhança do módulo 3, e a leitura crítica dos resultados. É o momento de calibrar o limiar de corte no SEU corpus (anote as similaridades de acertos óbvios e de lixo óbvio; o corte mora entre eles). Erros aqui são baratos; a partir da próxima aula, tudo passa pelo fluxo completo.",
                },
            ],
            questions: [
                {
                    statement: "Por que o chunking do projeto usa os headers do markdown?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "São as fronteiras naturais de assunto do documento",
                            isCorrect: true,
                        },
                        {
                            text: "Markdown não permite nenhuma outra forma de corte",
                            isCorrect: false,
                        },
                        {
                            text: "Headers geram embeddings mais baratos",
                            isCorrect: false,
                        },
                        {
                            text: "O banco exige um header por chunk",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o relatório da ingestão informa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Documentos e chunks: novos, atualizados e removidos",
                            isCorrect: true,
                        },
                        {
                            text: "O custo total da geração de respostas do chatbot",
                            isCorrect: false,
                        },
                        {
                            text: "O número de usuários do chatbot",
                            isCorrect: false,
                        },
                        {
                            text: "As perguntas mais frequentes do mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a checagem de idempotência da etapa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Rodar duas vezes: a segunda relata zero mudanças",
                            isCorrect: true,
                        },
                        {
                            text: "Rodar uma vez sem erros no terminal",
                            isCorrect: false,
                        },
                        {
                            text: "Contar se os chunks dobraram logo após a rodada",
                            isCorrect: false,
                        },
                        {
                            text: "Verificar o tamanho do arquivo de log",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se calibra o limiar de corte no corpus do projeto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Anotando similaridades de acertos e de lixo óbvios; o corte fica entre eles",
                            isCorrect: true,
                        },
                        {
                            text: "Copiando o valor 0,75 de um tutorial",
                            isCorrect: false,
                        },
                        {
                            text: "Usando o menor valor que o banco aceita",
                            isCorrect: false,
                        },
                        {
                            text: "Deixando o próprio modelo de geração decidir o valor certo na hora da busca",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Editou um único arquivo de política e rodou a ingestão. O que o relatório deve mostrar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um atualizado e o resto intocado: só o mudado reprocessa",
                            isCorrect: true,
                        },
                        {
                            text: "Todos os documentos da base atualizados por segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Zero mudanças: edições não afetam o índice",
                            isCorrect: false,
                        },
                        {
                            text: "A base inteira removida e recriada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Conectando a consulta ao chat",
            blocks: [
                {
                    type: "text",
                    value: "# O turno completo no ar\n\nSegunda etapa: o fluxo do módulo 5 dentro do chatbot existente. A pergunta chega; a reescrita com contexto roda (a conversa vem da memória que o chat já tem); o retrieval completo busca (híbrida no pgvector + limiar + os 6 melhores; reranker fica anotado como upgrade se a avaliação pedir); e a decisão: trechos bons chegaram, o prompt aumentado gera com citações; nada passou do limiar, a pergunta segue o fluxo NORMAL do chatbot (ferramentas, system), que já sabe recusar o que não sabe.\n\nRepare na integração fina: o RAG não substitui o fluxo do chat, ele o ENRIQUECE quando tem material. A resposta com citações renderiza as fontes clicáveis (o parse do módulo 5), e os trechos enviados ficam logados por resposta (auditoria).",
                },
                {
                    type: "code",
                    value: "async def turno(conversa, texto):\n    pergunta = reescrever_com_contexto(conversa, texto)\n    trechos = retrieval(pergunta, k_final=6)          # hibrida + limiar\n    if trechos:\n        mensagens = montar_prompt_rag(conversa, trechos, texto)\n        resposta = await gerar_streaming(mensagens)   # SSE do chat existente\n        return com_citacoes(resposta, trechos)        # parse + fontes + log\n    return await fluxo_normal_do_chat(conversa, texto)  # ferramentas, system\n# O roteamento e implicito: quem decide e o retrieval (achou ou nao),\n# com o system do fluxo normal cobrindo o resto",
                },
                {
                    type: "table",
                    value: '[["Momento do turno","Decisão","Origem"],["Reescrita da pergunta","Sempre que houver conversa","Módulo 4"],["Retrieval com limiar","Achou: caminho RAG; não: fluxo normal","Módulos 4 e 5"],["Prompt aumentado","System de fundamento + trechos + pergunta","Módulo 5"],["Citações e log","Fontes clicáveis; trechos logados","Módulo 5"],["Fluxo normal","Ferramentas e recusas do chatbot","Trilha anterior"]]',
                },
                {
                    type: "quote",
                    value: "A integração elegante: o retrieval decide o caminho. Achou material, a resposta nasce fundamentada; não achou, o chatbot continua sendo o chatbot que já sabia recusar.",
                },
                {
                    type: "text",
                    value: '## O roteiro de fumaça da etapa\n\nAntes da avaliação formal, o sanity check conversacional: pergunta de política responde com citação clicável? Pergunta de pedido continua indo à ferramenta? "E no caso de presente?" (pronome + contexto) reescreve e busca certo? Pergunta fora da base cai no fluxo normal com recusa elegante? Duas perguntas seguidas sobre o mesmo documento mantêm a conversa natural? Cinco sins e a etapa fecha.',
                },
            ],
            questions: [
                {
                    statement: "O que acontece quando o retrieval não passa nada do limiar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A pergunta segue o fluxo normal do chatbot (ferramentas, system)",
                            isCorrect: true,
                        },
                        {
                            text: "O sistema devolve erro 500 ao usuário",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo responde de memória sem dar nenhum aviso ao usuário",
                            isCorrect: false,
                        },
                        {
                            text: "A conversa é encerrada imediatamente pelo sistema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "De onde vem a conversa usada na reescrita da pergunta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Da memória que o chatbot da trilha anterior já mantém",
                            isCorrect: true,
                        },
                        {
                            text: "De um banco de dados novo criado somente para o RAG",
                            isCorrect: false,
                        },
                        {
                            text: "Do provedor, que guarda as sessões",
                            isCorrect: false,
                        },
                        {
                            text: "Do navegador do usuário, via cookie",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que os trechos enviados ficam logados por resposta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Auditoria: saber com que material cada resposta foi gerada",
                            isCorrect: true,
                        },
                        {
                            text: "Para reaproveitá-los depois em outros usuários do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o SSE exige log de payload por conexão",
                            isCorrect: false,
                        },
                        {
                            text: "Para treinar o modelo de embedding",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual teste do roteiro de fumaça valida a reescrita?",
                    difficulty: "medio",
                    options: [
                        {
                            text: '"E no caso de presente?" busca certo com o contexto incorporado',
                            isCorrect: true,
                        },
                        {
                            text: "A primeira pergunta da conversa sempre responde bem rápido",
                            isCorrect: false,
                        },
                        {
                            text: "O índice HNSW constrói sem nenhum erro no log",
                            isCorrect: false,
                        },
                        {
                            text: "O custo por turno fica abaixo de um centavo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Neste desenho, quem faz o roteamento entre RAG e fluxo normal?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O próprio retrieval: achou material, caminho RAG; não achou, fluxo normal",
                            isCorrect: true,
                        },
                        {
                            text: "Um classificador dedicado de intenções treinado totalmente à parte do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário, escolhendo o modo no menu",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor de LLM, pela temperatura",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O laboratório do projeto",
            blocks: [
                {
                    type: "text",
                    value: "# Medindo a estante\n\nTerceira etapa: o módulo 6 aplicado. O conjunto de avaliação da Paginacem: 40 casos sobre os documentos reais do projeto (fáceis, médias, exatas com nomes de edição, parafraseadas e 6 armadilhas), com trechos-verdade anotados pelos ids de chunk. O runner roda as duas metades (retrieval e geração com juiz) e imprime o relatório aberto por tipo.\n\nE o ciclo de melhoria de verdade, com as mexidas clássicas do projeto na ordem do funil: o baseline primeiro; depois experimente UMA por vez (chunk de 300 vs 500, k final 4 vs 6 vs 8, com e sem reescrita, limiar mais alto) e VEJA os números se moverem. É a experiência formativa da trilha: sentir uma mexida de chunking mover recall de parafraseadas, e o limiar mover a taxa de não sei.",
                },
                {
                    type: "table",
                    value: '[["Experimento sugerido","Métrica que deve reagir"],["Chunk 300 vs 500 tokens","Recall e groundedness (contexto por trecho)"],["k final 4 vs 6 vs 8","Correção vs custo por turno"],["Com e sem reescrita da pergunta","Recall das perguntas conversacionais"],["Limiar mais alto de corte","Não sei correto vs recall geral"],["Só vetorial vs híbrida","Recall das exatas (nomes, códigos)"]]',
                },
                {
                    type: "quote",
                    value: "A hora mais formativa da trilha: rodar o baseline, mexer numa coisa e VER o número se mover. Depois dessa sensação, mexer sem medir vira desconforto físico.",
                },
                {
                    type: "text",
                    value: "## O que aceitar como bom\n\nReferências honestas para um projeto didático bem tocado: recall@6 geral acima de 0,8 (com parafraseadas acima de 0,7), groundedness acima de 0,9, não sei correto acima de 0,8 nas armadilhas. Números muito abaixo apontam o funil de suspeitos; números muito acima do esperado merecem desconfiança do conjunto (casos fáceis demais?). E o registro final no changelog: a versão entregue, com números, é o retrato do que você construiu.",
                },
            ],
            questions: [
                {
                    statement: "O que compõe o conjunto de avaliação do projeto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "40 casos sobre os documentos reais, com trechos-verdade e armadilhas",
                            isCorrect: true,
                        },
                        {
                            text: "Perguntas genéricas de conhecimentos gerais fora do domínio da loja",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas as perguntas que já funcionam bem",
                            isCorrect: false,
                        },
                        {
                            text: "Os logs de erro do servidor web da aplicação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual experimento deve mover o recall das perguntas exatas?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Só vetorial vs busca híbrida",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o max_tokens da resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a cor das citações no front",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar a ingestão duas vezes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O limiar de corte mais alto mexe em qual trade-off?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não sei correto sobe, recall geral pode cair",
                            isCorrect: true,
                        },
                        {
                            text: "Custo sobe, latência desce na mesma medida",
                            isCorrect: false,
                        },
                        {
                            text: "Groundedness cai, citações sobem",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: o limiar não afeta métricas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Números muito acima do esperado no conjunto merecem qual reação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Desconfiança do conjunto: os casos podem estar fáceis demais",
                            isCorrect: true,
                        },
                        {
                            text: "Comemoração imediata e encerramento definitivo da avaliação",
                            isCorrect: false,
                        },
                        {
                            text: "Aumento imediato do k para aproveitar",
                            isCorrect: false,
                        },
                        {
                            text: "Remoção das armadilhas do conjunto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a experiência formativa central desta etapa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ver uma mexida específica mover a métrica específica esperada",
                            isCorrect: true,
                        },
                        {
                            text: "Escrever o maior conjunto de avaliação possível de uma vez",
                            isCorrect: false,
                        },
                        {
                            text: "Alcançar 100% em todas as métricas do relatório",
                            isCorrect: false,
                        },
                        {
                            text: "Automatizar o deploy do índice HNSW",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fechando a trilha: o que você leva",
            blocks: [
                {
                    type: "text",
                    value: "# O retrato do que foi construído\n\nRecapitulando a jornada: você sabe QUANDO o RAG é a ferramenta (e quando é contexto longo ou fine-tuning), monta a matéria-prima com respeito (extração, chunking por estrutura, metadados, pipeline idempotente), opera vetores num banco de verdade (pgvector, HNSW, o mercado mapeado), busca como gente grande (híbrida, reranking, filtros com permissão NA query, consulta transformada), entrega ao modelo do jeito certo (prompt aumentado, citações verificáveis, não sei honesto) e MEDE tudo (conjunto vivo, duas metades, juiz calibrado, protocolo de mudança).\n\nOs cinco hábitos que esta trilha adiciona aos da anterior: imprimir os trechos antes de culpar o prompt; permissão na busca, nunca depois; cada resposta com seu rastro de trechos logado; armadilhas no conjunto desde o dia um; e uma mudança por vez, com número antes e depois.",
                },
                {
                    type: "table",
                    value: '[["Preciso de...","Ferramenta","Módulo"],["Decidir se RAG é o caminho","O mapa RAG x contexto x fine-tuning","1"],["Preparar documentos","Extração + chunking por estrutura + metadados","2"],["Guardar e buscar vetores","pgvector com HNSW, config validada","3"],["Achar o trecho certo","Híbrida + reranker + filtros + reescrita","4"],["Responder fundamentado","Prompt aumentado + citações + não sei","5"],["Saber se melhorou","Conjunto com armadilhas + duas metades","6"]]',
                },
                {
                    type: "quote",
                    value: "RAG maduro se resume numa frase: o trecho certo, no prompt certo, com a citação certa, medido a cada mudança. Todo o resto é implementação disso.",
                },
                {
                    type: "text",
                    value: "## A ponte para os agentes\n\nRepare no que o seu assistente ainda NÃO faz: ele responde com base no que existe, mas não AGE. Se a resposta certa exigisse consultar o estoque, comparar duas políticas e ABRIR um chamado de troca, o fluxo atual não daria conta: seria preciso decidir passos, usar várias ferramentas em sequência e pedir aprovação para a ação com consequência. Esse é exatamente o salto da próxima trilha do roadmap: Agentes de IA, onde o modelo deixa de só responder e passa a executar tarefas, com o RAG que você construiu virando UMA das ferramentas na mão dele.",
                },
            ],
            questions: [
                {
                    statement: "Qual frase resume o RAG maduro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O trecho certo, no prompt certo, com a citação certa, medido a cada mudança",
                            isCorrect: true,
                        },
                        {
                            text: "O maior modelo, com o maior contexto, sempre",
                            isCorrect: false,
                        },
                        {
                            text: "Indexar tudo de uma vez e deixar o modelo se virar sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "Responder rápido sempre e deixar para medir depois, se sobrar algum tempo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual hábito novo a trilha adiciona sobre depuração?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Imprimir os trechos recuperados antes de culpar o prompt",
                            isCorrect: true,
                        },
                        {
                            text: "Reiniciar o banco de dados inteiro antes de investigar",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar de provedor ao primeiro erro",
                            isCorrect: false,
                        },
                        {
                            text: "Desligar as citações para simplificar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o assistente com RAG ainda não faz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Agir: decidir passos, encadear ferramentas e executar com aprovação",
                            isCorrect: true,
                        },
                        {
                            text: "Responder com citações verificáveis",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar as perguntas que estão fora da base",
                            isCorrect: false,
                        },
                        {
                            text: "Manter a memória da conversa entre os turnos do chat com o usuário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Na próxima trilha, o que o RAG construído aqui vira?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma das ferramentas na mão do agente",
                            isCorrect: true,
                        },
                        {
                            text: "Um sistema aposentado e substituído",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo de embedding do agente",
                            isCorrect: false,
                        },
                        {
                            text: "O banco de dados de usuários",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        '"Compare as duas políticas e abra o chamado de troca" não cabe no fluxo atual porque:',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Exige decidir passos, várias ferramentas em sequência e aprovação para agir",
                            isCorrect: true,
                        },
                        {
                            text: "Políticas internas não podem ser comparadas por modelos de linguagem nunca",
                            isCorrect: false,
                        },
                        {
                            text: "O RAG não recupera dois documentos de uma vez",
                            isCorrect: false,
                        },
                        {
                            text: "Chamados de troca não existem no domínio da livraria",
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
