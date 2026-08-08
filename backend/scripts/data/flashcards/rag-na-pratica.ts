import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de RAG na Prática, terceira trilha do roadmap de Engenharia de IA.
 *
 * Sem trilhos de linguagem: tudo em "neutra".
 *
 * Mesma régua das demais: o quiz de cada aula já cobra as cinco ideias centrais,
 * então aqui ficam os números de referência, os nomes de biblioteca e as regras
 * operacionais que a aula explica de passagem.
 */
export const ragNaPratica: CartasDaTrilha = {
    trilha: "RAG na Prática",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que a sigla RAG quer dizer?",
                        verso: "Retrieval-augmented generation, geração aumentada por recuperação.",
                    },
                    {
                        frente: "Que dor o RAG resolve quanto ao corte de conhecimento?",
                        verso: "A base é atualizada sem retreinar nada.",
                    },
                    {
                        frente: "Para que tipo de conhecimento o RAG é a via certa?",
                        verso: "Textual, volumoso e mutável, consultado por significado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quais são as quatro etapas do fluxo de consulta?",
                        verso: "Vetorizar a pergunta, buscar, montar o prompt e gerar.",
                    },
                    {
                        frente: "Qual fluxo do RAG roda offline?",
                        verso: "A indexação, quando os documentos chegam ou mudam.",
                    },
                    {
                        frente: "Por que a maior parte do esforço fica na recuperação?",
                        verso: "É onde a qualidade mora: chunking, embeddings, busca e avaliação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é o perfil de custo do contexto longo?",
                        verso: "Alto por chamada: paga o documento inteiro toda vez.",
                    },
                    {
                        frente: "Qual é o perfil de custo do RAG?",
                        verso: "Indexação pequena e única, mais consulta barata.",
                    },
                    {
                        frente: "Modelo ajustado por fine-tuning deixa de alucinar?",
                        verso: "Não. Ele também alucina; ajuste não garante fato.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três traços indicam caso bom para RAG?",
                        verso: "Texto que já existe, muda com frequência e tem dono claro.",
                    },
                    {
                        frente: "O RAG cria conhecimento novo?",
                        verso: "Não. Ele acha e fundamenta o que já está escrito.",
                    },
                    {
                        frente: "Que valor a documentação técnica ganha com RAG?",
                        verso: "Virar consultável em linguagem natural.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que problemas causam a falha de recuperação?",
                        verso: "Chunking ruim, embedding ou índice fracos, e busca ingênua.",
                    },
                    {
                        frente: "De que tamanho deve ser o mini corpus de estudo?",
                        verso: "De dez a vinte documentos de um assunto que você conhece.",
                    },
                    {
                        frente: "Por que conhecer o corpus de cor ajuda no começo?",
                        verso: "Permite julgar a busca no olho enquanto não há avaliação.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que bibliotecas Python extraem texto de PDF digital?",
                        verso: "pypdf e pdfplumber.",
                    },
                    {
                        frente: "O que hoje substitui bem o OCR clássico?",
                        verso: "Modelos de visão, que leem layout e manuscrito razoável.",
                    },
                    {
                        frente: "Qual é o alvo final da extração?",
                        verso: "Texto limpo e linear, com os títulos marcados.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que problema o chunk pequeno demais cria na resposta?",
                        verso: "É preciso na busca e inútil na resposta, sem contexto.",
                    },
                    {
                        frente: "Que problema o chunk grande demais cria na busca?",
                        verso: "O vetor vira média de muitos assuntos e acha mal.",
                    },
                    {
                        frente: "Qual é o defeito número um de RAGs iniciantes?",
                        verso: "Chunks órfãos, que não se entendem sozinhos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "De quanto costuma ser o overlap entre chunks?",
                        verso: "De 10% a 20% do tamanho do chunk.",
                    },
                    {
                        frente: "Qual estratégia de corte serve só como fallback?",
                        verso: "O tamanho fixo por caracteres, que corta no meio das ideias.",
                    },
                    {
                        frente: "Que unidade manda no corte, acima do tamanho alvo?",
                        verso: "A unidade de sentido.",
                    },
                    {
                        frente: "Como tratar código e FAQ no chunking?",
                        verso: "Cada bloco ou par pergunta-resposta já é um chunk natural.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que metadado permite filtrar a versão vigente?",
                        verso: "A data de atualização do documento.",
                    },
                    {
                        frente: "Como o caminho de seções aparece no prompt?",
                        verso: "Prefixando o trecho com a trilha de títulos da seção.",
                    },
                    {
                        frente: "Qual é o caminho clássico do vazamento numa base mista?",
                        verso: "Indexar tudo para testar e deixar o filtro para depois.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quais são as três perguntas do pipeline saudável?",
                        verso: "Rodar duplica? Documento mudado atualiza? Removido some?",
                    },
                    {
                        frente: "Como se garante a idempotência dos chunks?",
                        verso: "Upsert por identidade: doc_id com posição, ou hash do conteúdo.",
                    },
                    {
                        frente: "Como o job de ingestão evita reprocessar tudo?",
                        verso: "Compara hashes e processa só o delta.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Por que vetorizar os chunks em lote na indexação?",
                        verso: "As APIs aceitam listas: dezenas por chamada, mais barato e rápido.",
                    },
                    {
                        frente: "O que nunca deve entrar no texto embedado?",
                        verso: "Metadados de controle, como datas e permissões.",
                    },
                    {
                        frente: "Que prefixo pode melhorar o vetor de um chunk?",
                        verso: "O caminho de seções, que devolve contexto ao trecho.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o pgvector acrescenta ao Postgres?",
                        verso: "Coluna de vetor e operadores de distância.",
                    },
                    {
                        frente: "Que operador do pgvector calcula distância de cosseno?",
                        verso: "O operador de losangos, escrito como menor igual maior.",
                    },
                    {
                        frente: "Que ganho escondido a busca vetorial tem dentro do Postgres?",
                        verso: "Compõe com SQL normal: WHERE, JOIN e transações na mesma query.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a sigla ANN significa na busca vetorial?",
                        verso: "Busca por vizinhança aproximada.",
                    },
                    {
                        frente: "Qual dial do HNSW troca velocidade por recall?",
                        verso: "O ef_search, ajustado na consulta.",
                    },
                    {
                        frente: "Até que volume a busca exata costuma bastar?",
                        verso: "Até dezenas de milhares de chunks.",
                    },
                    {
                        frente: "Que particularidade o IVFFlat tem na criação?",
                        verso: "Exige a tabela já populada: ele aprende as listas dos dados.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que biblioteca serve para busca vetorial em memória, sem servidor?",
                        verso: "O FAISS.",
                    },
                    {
                        frente: "Que motores vetoriais dedicados de código aberto a aula cita?",
                        verso: "Qdrant e Weaviate.",
                    },
                    {
                        frente: "O que torna barata a migração de banco vetorial?",
                        verso: "Esconder o banco atrás de um módulo com interface gravar e buscar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como trocar o modelo de embedding com segurança?",
                        verso: "Índice novo em paralelo, validação e virada de uma vez.",
                    },
                    {
                        frente: "Que rotina roda a cada deploy para proteger o índice?",
                        verso: "Validar o modelo do índice e abortar se divergir.",
                    },
                    {
                        frente: "Que vantagem de backup o pgvector traz?",
                        verso: "Os vetores entram no backup do Postgres que já existe.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Quantos candidatos um k fixo alto demais traz de ruim?",
                        verso: "Trechos irrelevantes que poluem o prompt da pergunta simples.",
                    },
                    {
                        frente: "O que a sigla MMR quer dizer?",
                        verso: "Maximal marginal relevance, a diversificação dos resultados.",
                    },
                    {
                        frente: "Como o MMR escolhe os resultados?",
                        verso: "Um a um, penalizando quem se parece com os já escolhidos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que algoritmo clássico faz a busca lexical?",
                        verso: "O BM25.",
                    },
                    {
                        frente: "O que a sigla RRF quer dizer?",
                        verso: "Reciprocal rank fusion, a fusão por posição.",
                    },
                    {
                        frente: "Qual é a conta do RRF para cada documento?",
                        verso: "Somar 1 dividido por 60 mais a posição, em cada lista.",
                    },
                    {
                        frente: "Qual é o custo da busca híbrida?",
                        verso: "Duas buscas por consulta, ambas baratas e paralelizáveis.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que arquitetura de modelo faz o reranking?",
                        verso: "O cross-encoder, que lê pergunta e candidato juntos.",
                    },
                    {
                        frente: "Quantos candidatos a etapa larga costuma recuperar?",
                        verso: "De 30 a 50, priorizando recall.",
                    },
                    {
                        frente: "Quantos trechos sobram depois do reranking?",
                        verso: "De 5 a 8, os realmente relevantes.",
                    },
                    {
                        frente: "Quanta latência um reranker costuma somar?",
                        verso: "De dezenas a centenas de milissegundos.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que teste valida o filtro de permissões?",
                        verso: "Usuário sem acesso pergunta do restrito e a busca volta vazia.",
                    },
                    {
                        frente: "Que filtro impede citar política revogada?",
                        verso: "O de versão vigente, no status do documento.",
                    },
                    {
                        frente: "Que saídas existem para filtro muito seletivo com índice aproximado?",
                        verso: "k maior antes do filtro, índice parcial ou partição por tenant.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual técnica de transformação é obrigatória em chat?",
                        verso: "A reescrita com contexto, que resolve os pronomes.",
                    },
                    {
                        frente: "O que o multi-query faz?",
                        verso: "Gera duas ou três variações da pergunta e busca com todas.",
                    },
                    {
                        frente: "Qual é a lógica por trás do HyDE?",
                        verso: "A resposta imaginada se parece mais com os documentos que a pergunta.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Onde os trechos mais relevantes devem ficar na lista?",
                        verso: "Nas pontas, porque o meio do contexto é a região fraca.",
                    },
                    {
                        frente: "Onde a pergunta entra no prompt aumentado?",
                        verso: "Por último, fechando o prompt.",
                    },
                    {
                        frente: "Como cada trecho entra identificado no prompt?",
                        verso: "Com número e origem, como o manual e a seção de onde veio.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quem parseia os números de citação da resposta?",
                        verso: "A aplicação, que os resolve pelos metadados.",
                    },
                    {
                        frente: "O que a interface deve fazer com a citação?",
                        verso: "Exibir clicável, idealmente com o trecho destacável.",
                    },
                    {
                        frente: "Que número de citação nunca deve virar link?",
                        verso: "O órfão, fora do intervalo de trechos enviados.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em quantas camadas o não sei honesto se constrói?",
                        verso: "Quatro: busca, prompt, aplicação e avaliação.",
                    },
                    {
                        frente: "Por que a alucinação em RAG é pior que num chat comum?",
                        verso: "Vem com a autoridade visual de um sistema que cita fontes.",
                    },
                    {
                        frente: "Que três coisas um bom não sei entrega?",
                        verso: "O que foi procurado, uma reformulação sugerida e o canal certo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que entra no prompt de um turno de RAG conversacional?",
                        verso: "System, histórico, trechos novos e a pergunta reescrita.",
                    },
                    {
                        frente: "Como o histórico entra no RAG conversacional?",
                        verso: "Pela janela deslizante, sem os trechos de turnos passados.",
                    },
                    {
                        frente: "O que é indexação efêmera de um anexo?",
                        verso: "Chunking e busca com escopo da conversa, descartados depois.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que porte de modelo costuma bastar para geração fundamentada?",
                        verso: "O intermediário; o flagship raramente se paga aqui.",
                    },
                    {
                        frente: "Que etapa do turno tem o melhor custo-benefício do RAG?",
                        verso: "A reescrita da pergunta, que custa centavos.",
                    },
                    {
                        frente: "Como o streaming ajuda na latência do RAG?",
                        verso: "Esconde a geração: o usuário lê enquanto o texto sai.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro dimensões a avaliação de RAG cobre?",
                        verso: "Retrieval, geração, sistema inteiro e honestidade.",
                    },
                    {
                        frente: "O que a dimensão de honestidade mede?",
                        verso: "Se o sistema resiste ao que não está na base.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De que tamanho é um conjunto de avaliação que já muda o jogo?",
                        verso: "De 30 a 100 casos.",
                    },
                    {
                        frente: "Que proporção de armadilhas o conjunto sugere?",
                        verso: "Cerca de 15% das perguntas.",
                    },
                    {
                        frente: "Que tipo de caso testa a busca híbrida?",
                        verso: "As perguntas com termo exato: código e sigla.",
                    },
                    {
                        frente: "Quanto tempo de manutenção o conjunto pede?",
                        verso: "Meia hora por semana mantém o conjunto honesto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a sigla MRR quer dizer?",
                        verso: "Mean reciprocal rank, a média do inverso da posição.",
                    },
                    {
                        frente: "Por que a média geral do recall esconde o problema?",
                        verso: "Só aberta por tipo de caso ela vira acionável.",
                    },
                    {
                        frente: "Que métrica mostra o limiar de corte funcionando?",
                        verso: "A taxa de vazio correto nas perguntas-armadilha.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a groundedness mede numa resposta de RAG?",
                        verso: "Se cada afirmação está sustentada pelos trechos enviados.",
                    },
                    {
                        frente: "Quais são os vieses conhecidos do LLM como juiz?",
                        verso: "Leniência e se impressionar com respostas longas.",
                    },
                    {
                        frente: "Quando a correção pode ser programática?",
                        verso: "Quando a verdade é verificável por código: valor, data, sim ou não.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a ordem do funil de suspeitos do RAG?",
                        verso: "Busca larga, ordenação, prompt e geração, e por fim as citações.",
                    },
                    {
                        frente: "Quais são os cinco passos do protocolo de mudança?",
                        verso: "Baseline, uma mudança, rodar de novo, comparar aberto e registrar.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O RAG substitui as ferramentas do chatbot no projeto?",
                        verso: "Não. Ferramentas ficam com o dado pontual; o RAG com o texto.",
                    },
                    {
                        frente: "Onde vivem os chunks e vetores do projeto?",
                        verso: "No mesmo Postgres do app, com pgvector.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quando a estante do projeto está pronta?",
                        verso: "Quando a segunda ingestão não muda nada e os chunks passam no teste do órfão.",
                    },
                    {
                        frente: "Por que o chunking do projeto usa os headers do markdown?",
                        verso: "São as fronteiras naturais de assunto do documento.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que decide o caminho do turno no projeto?",
                        verso: "O retrieval: achou material, vai por RAG; não achou, fluxo normal.",
                    },
                    {
                        frente: "Por que os trechos enviados ficam logados por resposta?",
                        verso: "Auditoria: saber com que material cada resposta foi gerada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quantos casos tem o conjunto de avaliação do projeto?",
                        verso: "Quarenta, sobre os documentos reais, com armadilhas.",
                    },
                    {
                        frente: "Que trade-off o limiar de corte mais alto cria?",
                        verso: "O não sei correto sobe e o recall geral pode cair.",
                    },
                    {
                        frente: "Números muito acima do esperado pedem que reação?",
                        verso: "Desconfiar do conjunto: os casos podem estar fáceis demais.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que frase resume o RAG maduro?",
                        verso: "O trecho certo, no prompt certo, com a citação certa, sempre medido.",
                    },
                    {
                        frente: "Que hábito de depuração a trilha adiciona?",
                        verso: "Imprimir os trechos recuperados antes de culpar o prompt.",
                    },
                    {
                        frente: "Que ferramentas o mapa aponta para preparar documentos?",
                        verso: "Extração, chunking por estrutura e metadados.",
                    },
                ],
            },
        },
    },
};
