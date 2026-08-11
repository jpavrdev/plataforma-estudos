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
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro programas o comando de compilar esconde?",
                        verso: "O pré-processador, o compilador, o montador e o linker.",
                    },
                    {
                        frente: "Que três flags param o trem em cada estação?",
                        verso: "O menos E, o menos S e o menos c do compilador.",
                    },
                    {
                        frente: "Que diferença separa ligação estática de dinâmica?",
                        verso: "A estática copia a biblioteca; a dinâmica só referencia.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que quatro seções todo executável carrega?",
                        verso: "A text do código, a rodata, a data e a bss zerada.",
                    },
                    {
                        frente: "Que dois comandos mostram o mapa de seções?",
                        verso: "O size, com o resumo, e o readelf com o mapa completo.",
                    },
                    {
                        frente: "Em que sentidos o heap e a pilha crescem?",
                        verso: "O heap para endereços maiores e a pilha para menores.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que dois times a convenção divide os registradores?",
                        verso: "Os que a chamada pode sujar e os que ela deve preservar.",
                    },
                    {
                        frente: "Que três motivos tornam a convenção importante?",
                        verso: "Depurar o backtrace, o custo da chamada e a interoperação.",
                    },
                    {
                        frente: "Que otimização o compilador faz com chamada curta?",
                        verso: "O inline, colando o corpo no lugar da chamada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que faixa de custo separa a chamada comum da syscall?",
                        verso: "Um ou dois nanossegundos contra cem a trezentos.",
                    },
                    {
                        frente: "Que padrão amortiza o custo de atravessar a fronteira?",
                        verso: "O buffer, levando mais dado em menos viagens.",
                    },
                    {
                        frente: "Que mecanismo evita a travessia ao ler o relógio?",
                        verso: "O vDSO, com código do kernel exposto ao usuário.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que efeito tem trocar a biblioteca sem recompilar?",
                        verso: "O binário antigo lê offsets errados e corrompe em silêncio.",
                    },
                    {
                        frente: "Por que o C++ precisa decorar o nome dos símbolos?",
                        verso: "A sobrecarga exige símbolos distintos para cada tipo.",
                    },
                    {
                        frente: "Que estratégia a glibc usa para binários antigos?",
                        verso: "Símbolos versionados, mantidos por décadas.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro regras o protocolo de medição tem?",
                        verso: "Aquecer, repetir, resumir com mediana e comparar com a base.",
                    },
                    {
                        frente: "Que otimização pode fazer o benchmark medir nada?",
                        verso: "A eliminação de código morto, se ninguém usa o resultado.",
                    },
                    {
                        frente: "Que ferramentas aplicam o protocolo por você?",
                        verso: "O hyperfine na linha e os frameworks de microbenchmark.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que diferença de tempo o array e a lista mostram?",
                        verso: "Uns 10 milissegundos contra cerca de um segundo inteiro.",
                    },
                    {
                        frente: "Que pergunta cada um responde, o Big-O e o hardware?",
                        verso: "O Big-O diz como o custo cresce; o hardware, quanto cada passo.",
                    },
                    {
                        frente: "Quando a busca linear vence a binária no relógio?",
                        verso: "Em arrays pequenos, de até algumas dezenas de itens.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que dois impostos invisíveis dominam o perfil real?",
                        verso: "O cache miss e a mispredição de desvio.",
                    },
                    {
                        frente: "Que experimento clássico mostra a mispredição?",
                        verso: "Somar acima de um limiar com o array desordenado.",
                    },
                    {
                        frente: "Que sinal um IPC baixo dá sobre o núcleo?",
                        verso: "Que ele está esperando, não calculando.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que largura cada família de SIMD oferece?",
                        verso: "128 bits na mais antiga, 256 na seguinte e 512 na maior.",
                    },
                    {
                        frente: "Que condição a autovetorização exige do laço?",
                        verso: "Simplicidade, para o compilador enxergar o padrão.",
                    },
                    {
                        frente: "O que o SIMD multiplica, e o que ele não resolve?",
                        verso: "Multiplica conta; não resolve a espera por cache miss.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que limite a lei de Amdahl impõe ao ganho total?",
                        verso: "A fatia acelerada: 10% do tempo dá no máximo 1,11 vez.",
                    },
                    {
                        frente: "Que ordem de alavancas a otimização deve seguir?",
                        verso: "Algoritmo e estrutura antes da micro-otimização.",
                    },
                    {
                        frente: "Que metade da frase de Knuth costuma ser esquecida?",
                        verso: "A que manda não abrir mão do três por cento crítico.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que magic number abre um arquivo PNG?",
                        verso: "Os bytes 89 50 4E 47, no começo do arquivo.",
                    },
                    {
                        frente: "Como o comando file identifica um formato?",
                        verso: "Consultando um banco de magic numbers conhecidos.",
                    },
                    {
                        frente: "Que hábito de leitura a coluna ASCII do dump dá?",
                        verso: "Reconhecer o nome do formato de olho, sem converter.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que vantagem o registro de tamanho fixo entrega?",
                        verso: "Endereçar qualquer um por aritmética, sem varrer o arquivo.",
                    },
                    {
                        frente: "Como se calcula o offset absoluto de um campo?",
                        verso: "Somando a base do registro ao offset interno dele.",
                    },
                    {
                        frente: "Que valor 0x092E representa na leitura do sensor?",
                        verso: "2350, lido como 23,50 graus pela escala do formato.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que cegueira a soma simples de bytes carrega?",
                        verso: "A da ordem: trocar dois bytes mantém a soma igual.",
                    },
                    {
                        frente: "Que matemática o CRC usa para verificar?",
                        verso: "Divisão polinomial, guardando o resto como código.",
                    },
                    {
                        frente: "Que ameaça nem o checksum nem o CRC cobrem?",
                        verso: "O ataque, que recalcula o código depois de alterar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que erro quebra todo leitor antigo de um formato?",
                        verso: "Enfiar campo no meio, empurrando os offsets publicados.",
                    },
                    {
                        frente: "Que duas direções a compatibilidade tem?",
                        verso: "Para trás, com leitor novo, e para frente, com leitor velho.",
                    },
                    {
                        frente: "Que estrutura o formato adota quando cresce de verdade?",
                        verso: "A de chunks, com tipo e tamanho anunciados em cada bloco.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que releitura a trilha dá a um loop e a um if?",
                        verso: "O loop vira padrão de acesso; o if, aposta do previsor.",
                    },
                    {
                        frente: "Que exercícios curtos mantêm o modelo mental vivo?",
                        verso: "Hexdump num arquivo e ler o assembly no Compiler Explorer.",
                    },
                    {
                        frente: "Que metáfora a aula usa para o baixo nível?",
                        verso: "Um óculos que se usa, não um lugar aonde se vai.",
                    },
                ],
            },
        },
    },
};
