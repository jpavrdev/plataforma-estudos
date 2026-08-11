import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Por Dentro da Máquina, terceira trilha do roadmap de C++ e
 * Baixo Nível.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta e a
 * leitura do cenário; as cartas guardam os números fechados, os nomes
 * próprios e as armadilhas que a aula enuncia de passagem.
 */
export const porDentroDaMaquina: CartasDaTrilha = {
    trilha: "Por Dentro da Máquina",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que nome os grupos de quatro bits recebem?",
                        verso: "Nibbles, cada um traduzido por um dígito hexadecimal.",
                    },
                    {
                        frente: "Que faixa um byte de oito bits cobre?",
                        verso: "De zero a 255, com 256 combinações possíveis.",
                    },
                    {
                        frente: "Como se converte decimal para binário na mão?",
                        verso: "Dividindo por dois e lendo os restos de baixo para cima.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como se nega um número no complemento de dois?",
                        verso: "Invertendo todos os bits e somando um ao resultado.",
                    },
                    {
                        frente: "Que diferença separa o overflow com e sem sinal em C?",
                        verso: "Sem sinal é definido e circular; com sinal é indefinido.",
                    },
                    {
                        frente: "Que armadilha a promoção cria ao misturar sinais?",
                        verso: "O negativo vira sem sinal e a comparação inverte.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que divisão de bits o float de 32 e o double de 64 usam?",
                        verso: "Um de sinal, 8 e 23 no float; um, 11 e 52 no double.",
                    },
                    {
                        frente: "Que bit o padrão não guarda por ser sempre igual?",
                        verso: "O um antes da vírgula, implícito no normalizado.",
                    },
                    {
                        frente: "Como dinheiro deve ser guardado, em vez de float?",
                        verso: "Em inteiros contando centavos ou em tipo decimal.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Como se obtém o valor real de um número em ponto fixo?",
                        verso: "Dividindo o inteiro guardado por dois elevado aos fracionários.",
                    },
                    {
                        frente: "Que garantia o ponto fixo dá que o float não dá?",
                        verso: "Determinismo: os mesmos bits em qualquer processador.",
                    },
                    {
                        frente: "Que preço o ponto fixo cobra em troca?",
                        verso: "A faixa curta e fixa, com a escala por sua conta.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que ano e quantos bits o ASCII original tem?",
                        verso: "De 1963, com 7 bits e 128 símbolos definidos.",
                    },
                    {
                        frente: "Que problema o Unicode resolve, e qual sobra ao UTF-8?",
                        verso: "O catálogo de code point; gravar em bytes fica com o UTF-8.",
                    },
                    {
                        frente: "Que quatro respostas o tamanho de uma string admite?",
                        verso: "Bytes, code points, unidades de 16 bits e o que se vê.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que verbo resume cada um dos quatro operadores?",
                        verso: "AND filtra, OR liga, XOR inverte e NOT vira do avesso.",
                    },
                    {
                        frente: "Que diferença separa o e simples do e dobrado?",
                        verso: "O simples opera bit a bit; o dobrado é lógico e curto-circuita.",
                    },
                    {
                        frente: "Que propriedade do XOR desfaz a própria aplicação?",
                        verso: "Aplicar a mesma máscara duas vezes volta ao original.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que quatro gestos a máscara de um bit permite?",
                        verso: "Ligar, desligar, alternar e testar aquela posição.",
                    },
                    {
                        frente: "Que shift o padrão deixa indefinido?",
                        verso: "O de n maior ou igual à largura do próprio tipo.",
                    },
                    {
                        frente: "Que regra de ouro a manipulação de bits impõe?",
                        verso: "Usar sempre tipo sem sinal e de largura explícita.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como a notação 3:2 de um datasheet deve ser lida?",
                        verso: "Do bit 3 ao bit 2, inclusive, formando o campo.",
                    },
                    {
                        frente: "Que três passos escrevem um campo sem destruir vizinhos?",
                        verso: "Limpar a região, preparar o valor e escrever com OR.",
                    },
                    {
                        frente: "Que pegadinha os bitfields de struct em C carregam?",
                        verso: "O layout é definido pela implementação e muda de compilador.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quando a ordem dos bytes deixa de ser invisível?",
                        verso: "Quando o valor vira sequência em arquivo ou socket.",
                    },
                    {
                        frente: "Que funções da libc convertem para a ordem de rede?",
                        verso: "As duas de host para rede e as duas de volta.",
                    },
                    {
                        frente: "Que forma portátil lê um inteiro de um buffer?",
                        verso: "Montar por shifts, na ordem que o formato define.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que múltiplo o tamanho de uma struct sempre respeita?",
                        verso: "O do maior alinhamento entre os campos dela.",
                    },
                    {
                        frente: "Que otimização custa zero linha de lógica na struct?",
                        verso: "Reordenar os campos do maior para o menor.",
                    },
                    {
                        frente: "Que ferramenta lista os buracos de cada struct?",
                        verso: "O pahole, mostrando offset e padding do binário.",
                    },
                ],
            },
        },
    },
};
