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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que nome o program counter recebe no x86-64?",
                        verso: "RIP, guardando o endereço da próxima instrução.",
                    },
                    {
                        frente: "Que unidade cuida de cada uma das três etapas?",
                        verso: "A busca lê a memória, o controle decodifica e a ULA executa.",
                    },
                    {
                        frente: "Quanto dura um ciclo a três gigahertz?",
                        verso: "Cerca de 0,33 nanossegundo, a régua de tudo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que dois motivos limitam a quantidade de registradores?",
                        verso: "A física da distância e o espaço de nomeá-los na instrução.",
                    },
                    {
                        frente: "Quem decide quais variáveis moram em registrador?",
                        verso: "O compilador, na alocação de registradores.",
                    },
                    {
                        frente: "Por que função pequena roda desproporcionalmente rápido?",
                        verso: "O miolo inteiro cabe em registradores, sem ir à memória.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que flags o CMP liga sem devolver valor?",
                        verso: "As de zero e de negativo, lidas pelo salto seguinte.",
                    },
                    {
                        frente: "Que disciplina o rastreio manual de assembly exige?",
                        verso: "Uma linha por vez, anotando os registradores depois de cada.",
                    },
                    {
                        frente: "Que cinco partes um for esconde em assembly?",
                        verso: "Inicialização, corpo, incremento, comparação e salto atrás.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que cinco estágios o pipeline didático tem?",
                        verso: "Busca, decodificação, execução, memória e escrita.",
                    },
                    {
                        frente: "Que medida o pipeline melhora, e qual ele não muda?",
                        verso: "Melhora a vazão; a latência de uma instrução segue igual.",
                    },
                    {
                        frente: "Que taxa de acerto o previsor alcança em código típico?",
                        verso: "Acima de 95%, deixando o desvio previsível quase de graça.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que diferença separa ISA de microarquitetura?",
                        verso: "A ISA é o contrato; a microarquitetura, a implementação.",
                    },
                    {
                        frente: "Que modelo de licença cada uma das três ISAs segue?",
                        verso: "O x86 proprietário, o ARM licenciado e o terceiro aberto.",
                    },
                    {
                        frente: "Que três critérios decidem uma ISA hoje?",
                        verso: "Ecossistema de software, energia por operação e custo.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que tamanhos e latência a L1 e a L2 costumam ter?",
                        verso: "A L1 com dezenas de KiB e 4 ciclos; a L2 maior, com 12.",
                    },
                    {
                        frente: "Que duas localidades fazem a hierarquia funcionar?",
                        verso: "A temporal do que acabou de ser usado e a espacial do vizinho.",
                    },
                    {
                        frente: "Na escala humanizada, quanto a RAM demoraria?",
                        verso: "Cinco minutos, se um ciclo durasse um segundo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que operação aloca e libera espaço na pilha?",
                        verso: "Uma subtração no topo, e a soma de volta ao retornar.",
                    },
                    {
                        frente: "Por que a região da pilha vive quente na cache?",
                        verso: "Toda chamada reutiliza o mesmo topo o tempo inteiro.",
                    },
                    {
                        frente: "Que mecanismo detecta o estouro de pilha na hora?",
                        verso: "A página de guarda, inacessível logo além do fim.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três alocadores a aula nomeia?",
                        verso: "O ptmalloc da glibc, o jemalloc e o tcmalloc.",
                    },
                    {
                        frente: "Que faixa de custo o malloc percorre entre os caminhos?",
                        verso: "Dezenas de nanossegundos no rápido e microssegundos no lento.",
                    },
                    {
                        frente: "Que dois pecados capitais a memória manual permite?",
                        verso: "O vazamento e o uso do ponteiro depois de liberado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quantos int de quatro bytes cabem numa linha de cache?",
                        verso: "Dezesseis, então um miss abastece quinze acessos.",
                    },
                    {
                        frente: "Que hardware acompanha o padrão sequencial de acesso?",
                        verso: "O prefetcher, buscando a linha seguinte antes do pedido.",
                    },
                    {
                        frente: "Em que ordem o C guarda uma matriz na memória?",
                        verso: "Por linhas, com os vizinhos de coluna colados.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três ganhos a memória virtual compra?",
                        verso: "Isolamento, permissão por página e flexibilidade de mapa.",
                    },
                    {
                        frente: "Que diferença separa a falta menor da maior?",
                        verso: "A menor só mapeia; a maior precisa ir buscar no disco.",
                    },
                    {
                        frente: "Por que o primeiro toque na memória alocada custa mais?",
                        verso: "Ele ainda dispara a falta que mapeia aquela página.",
                    },
                ],
            },
        },
    },
};
