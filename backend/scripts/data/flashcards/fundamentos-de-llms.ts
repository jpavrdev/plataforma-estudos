import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Fundamentos de LLMs, primeira trilha do roadmap de Engenharia de IA.
 *
 * A trilha não tem trilhos de linguagem, então tudo vai em "neutra".
 *
 * O que estas cartas cobram é o que a aula ensina e o quiz NÃO pergunta: siglas,
 * números de referência, nomes próprios e as consequências práticas que o texto
 * explica de passagem. O quiz de cada aula já cobra as cinco ideias centrais, e
 * repetir aqui seria gastar a revisão do aluno duas vezes na mesma coisa.
 */
export const fundamentosDeLlms: CartasDaTrilha = {
    trilha: "Fundamentos de LLMs",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que faz, em escala minúscula, a mesma coisa que um LLM?",
                        verso: "O autocomplete do teclado do celular, sugerindo a próxima palavra.",
                    },
                    {
                        frente: "O que significa a sigla LLM?",
                        verso: "Large language model, ou modelo de linguagem grande.",
                    },
                    {
                        frente: "Qual é o risco típico de um sistema de busca, diferente do de um LLM?",
                        verso: "Não achar nada relevante, em vez de gerar algo fluente e falso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Em que ano o transformer foi proposto?",
                        verso: "Em 2017.",
                    },
                    {
                        frente: "De qual empresa saiu o artigo que propôs o transformer?",
                        verso: "Do Google.",
                    },
                    {
                        frente: "O que a sigla GPT quer dizer?",
                        verso: "Generative pre-trained transformer.",
                    },
                    {
                        frente: "A LSTM é variante de qual arquitetura?",
                        verso: "Da rede neural recorrente, a RNN.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como se chama a área que abre o modelo para estudar o que cada parte faz?",
                        verso: "Interpretabilidade.",
                    },
                    {
                        frente: "O que empilhar dezenas de camadas de cabeças de atenção constrói?",
                        verso: "Uma teia de relações do texto inteiro.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que técnicas alinham o modelo comparando respostas alternativas?",
                        verso: "RLHF e DPO.",
                    },
                    {
                        frente: "Como se chama o modelo que sai só do pré-treinamento?",
                        verso: "Modelo base.",
                    },
                    {
                        frente: "Quanto tempo costuma durar o pré-treinamento de um LLM?",
                        verso: "Meses, em milhares de GPUs.",
                    },
                    {
                        frente: "O que a sigla SFT quer dizer?",
                        verso: "Supervised fine-tuning, o ajuste supervisionado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quais são as três alavancas que as leis de escala mandam crescer juntas?",
                        verso: "Parâmetros, dados e computação.",
                    },
                    {
                        frente: "De quantos parâmetros passam os maiores modelos?",
                        verso: "De um trilhão.",
                    },
                    {
                        frente: "O que virou gargalo da escala, já que a internet útil é finita?",
                        verso: "Dados de qualidade.",
                    },
                    {
                        frente: "Alucinação desaparece quando o modelo cresce?",
                        verso: "Não. Escalar não resolve alucinação.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "De que tamanho costuma ser o vocabulário de tokens de um modelo?",
                        verso: "De 50 mil a 250 mil entradas.",
                    },
                    {
                        frente: "O que a sigla BPE quer dizer?",
                        verso: "Byte-pair encoding.",
                    },
                    {
                        frente: "Em inglês, um token equivale a mais ou menos quanto?",
                        verso: "Cerca de 4 caracteres, ou 3/4 de palavra.",
                    },
                    {
                        frente: "Por que não tokenizar letra por letra?",
                        verso: "O texto viraria uma sequência longuíssima e cara de processar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quanto a mais o português costuma gastar em tokens que o inglês?",
                        verso: "De 20% a 50%.",
                    },
                    {
                        frente: "Em que três momentos o código deve contar tokens?",
                        verso: "Antes de enviar, ao receber a resposta e no planejamento de custo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantas vezes a saída costuma custar mais que a entrada?",
                        verso: "De 3 a 5 vezes.",
                    },
                    {
                        frente: "Qual é a distância de preço entre o menor e o maior modelo do mercado?",
                        verso: "Duas a três ordens de grandeza.",
                    },
                    {
                        frente: "O que ataca o custo de um system prompt longo pago em toda chamada?",
                        verso: "O cache de prompt.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que formatos rígidos como JSON pedem validação depois da geração?",
                        verso: "Símbolos e espaços têm tokenização frágil.",
                    },
                    {
                        frente: "Como um número longo pode ser fatiado pelo tokenizador?",
                        verso: "De forma irregular, com 12345 virando 123 mais 45.",
                    },
                    {
                        frente: "Além de contar letras, que tarefa de linguagem sofre com o tokenizador?",
                        verso: "Rimas exatas e jogos de palavras.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como o vídeo vira token?",
                        verso: "Como sequência de quadros tokenizados.",
                    },
                    {
                        frente: "Por que amostrar quadros em vez de enviar o vídeo inteiro?",
                        verso: "Vídeo inteiro sai caro demais em tokens.",
                    },
                    {
                        frente: "Como o áudio entra na conta de custo?",
                        verso: "Proporcional à duração, tokenizado em trechos sonoros.",
                    },
                ],
            },
        },
    },
};
