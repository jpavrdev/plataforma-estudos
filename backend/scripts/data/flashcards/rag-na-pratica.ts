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
    },
};
