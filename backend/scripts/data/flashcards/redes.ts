import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Redes, quarta trilha do roadmap de DevOps.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta e a
 * escolha no cenário; as cartas ficam com as listas fechadas, as siglas por
 * extenso e as regras de cálculo que sustentam essas contas.
 */
export const redes: CartasDaTrilha = {
    trilha: "Redes",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que três coisas dois hosts precisam para conversar?",
                        verso: "Um meio de transmissão, um endereço em cada ponta e um protocolo.",
                    },
                    {
                        frente: "Que quatro escalas de rede a aula separa?",
                        verso: "LAN num prédio, MAN numa cidade, WAN entre cidades e a internet.",
                    },
                    {
                        frente: "Que três mecanismos tornam a entrega confiável?",
                        verso: "Verificação de erro, confirmação com retransmissão e numeração.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quem criou o modelo OSI, e para que ele serve?",
                        verso: "A ISO, como modelo de referência para descrever a comunicação.",
                    },
                    {
                        frente: "Com que camadas cada camada do OSI conversa?",
                        verso: "Só com a de cima e a de baixo, nunca pulando níveis.",
                    },
                    {
                        frente: "Em que camadas ping e curl atuam, respectivamente?",
                        verso: "O ping perto da camada de rede; o curl na de aplicação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que nome alternativo o modelo TCP/IP recebe?",
                        verso: "Pilha TCP/IP, por causa das camadas empilhadas.",
                    },
                    {
                        frente: "Por que o TCP/IP se firmou no lugar do OSI?",
                        verso: "Veio com implementações que funcionavam e eram livres.",
                    },
                    {
                        frente: "Como os dois modelos convivem na prática de DevOps?",
                        verso: "Opera-se com TCP/IP e diagnostica-se com o vocabulário do OSI.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que analogia a aula usa para o encapsulamento?",
                        verso: "Uma carta dentro de vários envelopes, um dentro do outro.",
                    },
                    {
                        frente: "Que camada acrescenta também um rótulo no fim do bloco?",
                        verso: "A de enlace, que põe o trailer de verificação.",
                    },
                    {
                        frente: "Como cada camada trata o que veio da camada de cima?",
                        verso: "Como carga, sem precisar interpretar o conteúdo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a sigla PDU significa?",
                        verso: "Protocol Data Unit: a unidade de dados de cada camada.",
                    },
                    {
                        frente: "O que uma captura de pacotes traz de fato?",
                        verso: "O quadro inteiro, com o pacote e o segmento aninhados dentro.",
                    },
                    {
                        frente: "Que PDU o switch e o roteador usam para decidir?",
                        verso: "O switch olha o quadro pelo MAC; o roteador, o pacote pelo IP.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que valor de primeiro octeto ficou reservado, e para quê?",
                        verso: "O 127, para loopback, ou seja, a própria máquina.",
                    },
                    {
                        frente: "Para que servem as classes D e E, historicamente?",
                        verso: "Multicast e uso experimental, fora das três de uso geral.",
                    },
                    {
                        frente: "Que desperdício as classes fixas causavam?",
                        verso: "Quem precisava de 300 hosts levava uma classe B de 65 mil.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que padrão fixo a máscara de rede sempre segue?",
                        verso: "Uma sequência de bits um seguida de uma sequência de zeros.",
                    },
                    {
                        frente: "Que operação acha o endereço de rede a partir do IP?",
                        verso: "Um E lógico bit a bit entre o endereço e a máscara.",
                    },
                    {
                        frente: "O que acontece com os hosts quando o prefixo cresce?",
                        verso: "Sobram menos bits e menos hosts cabem naquela rede.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que cada bit emprestado ao subnetting faz?",
                        verso: "Dobra o número de sub-redes e corta os hosts pela metade.",
                    },
                    {
                        frente: "Por que a conta de hosts subtrai dois no final?",
                        verso: "Descontam-se o endereço de rede e o de broadcast.",
                    },
                    {
                        frente: "Que quatro motivos justificam criar sub-redes?",
                        verso: "Organizar, isolar o broadcast, aplicar segurança e não desperdiçar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quais são as três faixas privadas, em notação CIDR?",
                        verso: "10.0.0.0/8, 172.16.0.0/12 e 192.168.0.0/16.",
                    },
                    {
                        frente: "Que outro nome o PAT recebe, e o que ele usa?",
                        verso: "Sobrecarga, e ele usa a porta de origem para diferenciar.",
                    },
                    {
                        frente: "Por que dois IPs privados iguais não geram conflito?",
                        verso: "Cada um vive dentro da própria rede e não roteia para fora.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em quantos grupos um endereço IPv6 é escrito?",
                        verso: "Oito grupos de quatro dígitos hexadecimais, com dois-pontos.",
                    },
                    {
                        frente: "Que duas regras abreviam um endereço IPv6?",
                        verso: "Cortar zeros à esquerda e resumir grupos zerados uma vez só.",
                    },
                    {
                        frente: "Como o host em dual stack escolhe o protocolo?",
                        verso: "Pelo que o destino suporta, preferindo o IPv6 quando dá.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que nome alternativo a tabela MAC do switch recebe?",
                        verso: "Tabela CAM, que liga cada MAC à porta física dele.",
                    },
                    {
                        frente: "O que o switch faz quando não conhece o MAC de destino?",
                        verso: "Faz flooding: replica o quadro por todas as outras portas.",
                    },
                    {
                        frente: "Que domínios o switch divide, e quais ele não divide?",
                        verso: "Divide os de colisão, um por porta; não divide os de broadcast.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantos bits o MAC tem, e o que os primeiros 24 dizem?",
                        verso: "Quarenta e oito bits; os 24 primeiros são o OUI do fabricante.",
                    },
                    {
                        frente: "Por que o MAC não serve para rotear entre redes?",
                        verso: "Ele é plano: nada nele aponta onde a máquina está.",
                    },
                    {
                        frente: "O que fica constante e o que é reescrito no caminho?",
                        verso: "Os IPs seguem fim a fim; os MACs são reescritos a cada salto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que primeira decisão o host toma ao enviar um pacote?",
                        verso: "Se o destino está na mesma sub-rede, comparando com a máscara.",
                    },
                    {
                        frente: "Que nome tem a regra que escolhe a rota mais específica?",
                        verso: "Longest prefix match: vence o prefixo mais longo.",
                    },
                    {
                        frente: "Que rotas um servidor costuma ter na tabela?",
                        verso: "As das redes diretamente conectadas e a rota default.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a sigla ARP significa, por extenso?",
                        verso: "Address Resolution Protocol, que traduz um IP em MAC.",
                    },
                    {
                        frente: "Que MAC o host resolve quando o destino é remoto?",
                        verso: "O do gateway, nunca o do destino final na outra rede.",
                    },
                    {
                        frente: "Por que as entradas do cache ARP expiram?",
                        verso: "Para acompanhar mudanças, como uma placa trocada na rede.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que padrão marca o quadro com o número da VLAN?",
                        verso: "O 802.1Q, que insere a tag com o VLAN ID no quadro.",
                    },
                    {
                        frente: "Quantos bits o VLAN ID tem, e quantos valores úteis?",
                        verso: "Doze bits, o que dá até 4094 valores utilizáveis.",
                    },
                    {
                        frente: "Qual é a diferença entre porta de acesso e de tronco?",
                        verso: "A de acesso leva uma VLAN sem tag; a de tronco leva várias com tag.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que problema a camada de transporte resolve, além do IP?",
                        verso: "Entregar ao processo certo, e não só à máquina certa.",
                    },
                    {
                        frente: "Que quatro garantias o TCP entrega, e a que custo?",
                        verso: "Numera, confirma, reenvia e ordena, custando etapas e cabeçalho maior.",
                    },
                    {
                        frente: "Por que streaming e voz preferem UDP?",
                        verso: "Um quadro atrasado é inútil: melhor perder que esperar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que dois objetivos o handshake do TCP cumpre?",
                        verso: "Confirmar que os dois lados aceitam e sincronizar os números iniciais.",
                    },
                    {
                        frente: "Como uma conexão TCP se encerra de forma ordenada?",
                        verso: "Com FIN e ACK em cada um dos dois sentidos independentes.",
                    },
                    {
                        frente: "Que flag corta a conexão na hora, e quando ela aparece?",
                        verso: "O RST, por exemplo ao falar numa porta sem ninguém escutando.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantos bits a porta tem, e qual é a faixa dela?",
                        verso: "Dezesseis bits, indo de zero a 65535.",
                    },
                    {
                        frente: "O que define uma conexão TCP de forma única?",
                        verso: "O par de sockets, de origem e destino, somado ao protocolo.",
                    },
                    {
                        frente: "Que faixa o Linux usa por padrão para portas efêmeras?",
                        verso: "Algo em torno de 32768 a 60999, escolhida pelo sistema.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quem mantém a convenção das portas padrão?",
                        verso: "A IANA, com as conhecidas na faixa de zero a 1023.",
                    },
                    {
                        frente: "Quando o DNS recorre ao TCP em vez do UDP?",
                        verso: "Quando a resposta é grande demais para o datagrama.",
                    },
                    {
                        frente: "Que faixas de porta vêm acima das conhecidas?",
                        verso: "As registradas e, mais acima, a dinâmica das efêmeras.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que quatro mecanismos somados tornam o TCP confiável?",
                        verso: "Numeração, confirmação, retransmissão e a janela do receptor.",
                    },
                    {
                        frente: "Que pista mais rápida que o temporizador denuncia uma perda?",
                        verso: "Vários ACKs repetidos pedindo sempre o mesmo byte.",
                    },
                    {
                        frente: "O que a janela anunciada em cada ACK controla?",
                        verso: "Quanto o emissor pode mandar sem confirmação, pelo buffer livre.",
                    },
                ],
            },
        },
    },
};
