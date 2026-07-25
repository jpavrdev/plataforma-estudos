// Seed da trilha Redes (fundamentos a nuvem/on-prem). Conteúdo autoral,
// quiz-only. Idempotente: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-redes.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Redes";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Redes de computadores para DevOps, dos fundamentos à nuvem: os modelos OSI e TCP/IP, endereçamento IP e sub-redes (CIDR, NAT), roteamento e comutação, a camada de transporte (TCP e UDP) e portas, DNS e resolução de nomes, os serviços de borda (TLS, proxy reverso, balanceamento de carga e firewall) e as redes em nuvem e o híbrido on-prem (VPC, security groups, VPN e Direct Connect). A base que sustenta expor, conectar e proteger serviços em produção.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

// Preenchido na montagem, um módulo por vez, a partir da autoria por subagente.
const MODULOS = [
    {
        "titulo": "Módulo 1 - Fundamentos de redes",
        "aulas": [
            {
                "titulo": "O que é uma rede",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é uma rede\n\nUma rede de computadores é um conjunto de dispositivos conectados que trocam dados entre si. Todo dispositivo capaz de enviar ou receber dados na rede é chamado de host. Um host pode ser um notebook, um servidor em um datacenter, um celular ou até um sensor de IoT.\n\nPara dois hosts conversarem, eles precisam de três coisas:\n\n- Um meio de transmissão (cabo de cobre, fibra óptica ou ondas de rádio no Wi-Fi).\n- Um endereço que identifique cada ponta, como o endereço IP.\n- Um conjunto de regras comuns, o protocolo, que define o formato e a ordem das mensagens.\n\nSem um protocolo compartilhado, os bits até chegam ao outro lado, mas não significam nada. Por isso os padrões abertos são a base da comunicação em rede."
                    },
                    {
                        "type": "text",
                        "value": "## Cliente e servidor\n\nBoa parte da comunicação em rede segue o modelo cliente-servidor. O cliente é quem inicia a conversa e faz um pedido; o servidor fica esperando pedidos e responde. Quando você acessa um site, o navegador (cliente) pede uma página e o servidor web devolve o conteúdo.\n\nO mesmo host pode agir como cliente em uma conversa e como servidor em outra. Um servidor de aplicação, por exemplo, é servidor para o navegador do usuário e, ao mesmo tempo, cliente do banco de dados que ele consulta.\n\nExiste também o modelo par a par (P2P), em que os hosts têm papéis equivalentes e trocam dados diretamente, sem um servidor central. Em DevOps, o modelo cliente-servidor é o que aparece na maioria das APIs, bancos e serviços que você opera."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Escala\",\"Alcance típico\",\"Exemplo\"],[\"LAN\",\"Um prédio ou andar\",\"Rede local do escritório ou de um rack\"],[\"MAN\",\"Uma cidade\",\"Rede que liga campi de uma universidade\"],[\"WAN\",\"Cidades ou países\",\"Links que conectam filiais distantes\"],[\"Internet\",\"Alcance global\",\"Interligação pública de milhões de redes\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Trocar dados de forma confiável\n\nO objetivo final de uma rede não é apenas entregar bits, é entregar os dados certos, na ordem certa e sem corrupção. Vários problemas atrapalham isso: pacotes se perdem, chegam fora de ordem, são duplicados ou chegam com erro.\n\nPara lidar com isso, a rede usa mecanismos como:\n\n- Verificação de erros, para descartar dados corrompidos.\n- Confirmação de recebimento (ACK) e retransmissão do que se perdeu.\n- Numeração, para remontar os dados na ordem original.\n\nQuem opera sistemas em DevOps sente esses conceitos no dia a dia: latência alta, perda de pacote e timeouts são a forma como a rede avisa que algo não vai bem."
                    },
                    {
                        "type": "quote",
                        "value": "Host é qualquer dispositivo endereçável que envia ou recebe dados. Cliente e servidor são papéis em uma conversa, não tipos fixos de máquina: o mesmo host pode ser cliente de um serviço e servidor de outro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em uma rede, qual termo designa qualquer dispositivo capaz de enviar ou receber dados e que possui um endereço na rede?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Host",
                                "isCorrect": true
                            },
                            {
                                "text": "Protocolo",
                                "isCorrect": false
                            },
                            {
                                "text": "Meio de transmissão",
                                "isCorrect": false
                            },
                            {
                                "text": "Pacote",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um servidor de aplicação recebe requisições do navegador do usuário e, para respondê-las, consulta um banco de dados. Nessa segunda conversa, com o banco, qual é o papel do servidor de aplicação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cliente, pois é ele quem inicia o pedido",
                                "isCorrect": true
                            },
                            {
                                "text": "Servidor, pois é ele quem hospeda a aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Servidor, pois tem mais processamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Roteador, pois encaminha os dados ao banco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A rede que interliga as filiais de uma empresa em cidades diferentes, usando links de longa distância, é classificada como qual escala?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "WAN",
                                "isCorrect": true
                            },
                            {
                                "text": "LAN",
                                "isCorrect": false
                            },
                            {
                                "text": "MAN",
                                "isCorrect": false
                            },
                            {
                                "text": "PAN",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante uma transferência, alguns pacotes se perdem no caminho. Qual mecanismo de rede permite recuperar esses dados para garantir a entrega?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Confirmação de recebimento e retransmissão",
                                "isCorrect": true
                            },
                            {
                                "text": "Troca do meio físico de cobre para fibra óptica",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumento da largura de banda contratada do link",
                                "isCorrect": false
                            },
                            {
                                "text": "Uso de um endereço IP fixo no host",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois hosts estão fisicamente conectados e os bits chegam de um lado ao outro, mas as aplicações não conseguem se entender. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falta um protocolo em comum",
                                "isCorrect": true
                            },
                            {
                                "text": "O cabo de rede está rompido no meio",
                                "isCorrect": false
                            },
                            {
                                "text": "As placas de rede estão desabilitadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há energia elétrica no switch",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O modelo OSI",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O modelo OSI\n\nO modelo OSI (Open Systems Interconnection) é um modelo de referência criado pela ISO para descrever como a comunicação em rede acontece, dividida em sete camadas. Ele não é um software que você instala, é um mapa conceitual: cada camada tem uma responsabilidade bem definida e conversa apenas com a camada de cima e a de baixo.\n\nA grande vantagem do OSI é organizar o raciocínio. Quando algo falha, saber em qual camada o problema mora ajuda a diagnosticar mais rápido e a separar responsabilidades entre cabo, endereçamento, entrega e aplicação."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Nº\",\"Camada\",\"Função principal\",\"Exemplo\"],[\"7\",\"Aplicação\",\"Interface com o software e os dados do usuário\",\"HTTP, DNS\"],[\"6\",\"Apresentação\",\"Formato, codificação e criptografia dos dados\",\"TLS, JPEG\"],[\"5\",\"Sessão\",\"Abre, mantém e encerra o diálogo\",\"Controle de sessão\"],[\"4\",\"Transporte\",\"Entrega fim a fim, portas e confiabilidade\",\"TCP, UDP\"],[\"3\",\"Rede\",\"Endereçamento lógico e roteamento\",\"IP\"],[\"2\",\"Enlace\",\"Entrega no enlace local e endereço físico\",\"Ethernet, MAC\"],[\"1\",\"Física\",\"Transmite os bits pelo meio\",\"Cabo, fibra, rádio\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como memorizar a ordem\n\nA ordem das camadas cai em prova e em entrevista, então vale ter um apoio. Da camada 1 para a 7, a sequência é: Física, Enlace, Rede, Transporte, Sessão, Apresentação, Aplicação.\n\nUm macete comum em português usa a primeira letra de cada camada, de baixo para cima, na frase: Fui Este Rapaz Toda Sexta, Após Anoitecer. O importante é não trocar a ordem de rede (3) e transporte (4), que é onde a maioria dos erros aparece.\n\nRepare que o endereçamento acontece em dois níveis: o endereço físico (MAC) vive na camada 2, e o endereço lógico (IP) vive na camada 3."
                    },
                    {
                        "type": "text",
                        "value": "## Diagnóstico por camadas\n\nNa prática, pensar por camadas transforma um problema vago em perguntas objetivas:\n\n- O cabo está conectado e o link está ativo? (camada 1)\n- O switch entrega o dado no segmento local? (camada 2)\n- O host tem IP, máscara e gateway corretos? (camada 3)\n- A porta do serviço responde e a conexão TCP fecha? (camada 4)\n- O certificado e o protocolo da aplicação estão corretos? (camadas 6 e 7)\n\nAs ferramentas se encaixam nessas camadas: ping e traceroute atuam mais perto da camada 3, enquanto um curl a uma API exercita a camada 7."
                    },
                    {
                        "type": "quote",
                        "value": "Decore a ordem de baixo para cima: Física, Enlace, Rede, Transporte, Sessão, Apresentação, Aplicação. Confundir Rede (camada 3, IP) com Transporte (camada 4, TCP e portas) é o erro mais cobrado em prova."
                    }
                ],
                "questions": [
                    {
                        "statement": "No modelo OSI, o endereçamento lógico e o roteamento entre redes diferentes acontecem em qual camada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Rede (camada 3)",
                                "isCorrect": true
                            },
                            {
                                "text": "Enlace (camada 2)",
                                "isCorrect": false
                            },
                            {
                                "text": "Transporte (camada 4)",
                                "isCorrect": false
                            },
                            {
                                "text": "Física (camada 1)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual sequência representa corretamente as camadas do modelo OSI, da camada 1 para a 7?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Física, Enlace, Rede, Transporte, Sessão, Apresentação, Aplicação",
                                "isCorrect": true
                            },
                            {
                                "text": "Física, Rede, Enlace, Transporte, Apresentação, Sessão, Aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicação, Sessão, Transporte, Rede, Enlace, Apresentação, Física",
                                "isCorrect": false
                            },
                            {
                                "text": "Física, Enlace, Transporte, Rede, Sessão, Aplicação, Apresentação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um técnico afirma que o endereço MAC e o endereço IP operam na mesma camada do OSI. Por que essa afirmação está incorreta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "MAC fica na camada 2 e IP na camada 3",
                                "isCorrect": true
                            },
                            {
                                "text": "MAC fica na camada 1 e IP na camada 2",
                                "isCorrect": false
                            },
                            {
                                "text": "MAC fica na camada 3 e IP na camada 4",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos ficam na camada 2, mas com formatos diferentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Investigando por que uma aplicação não conecta, você confirma que o host tem IP válido e alcança o gateway, mas a porta 5432 não responde. Em qual camada do OSI está o foco desse teste de porta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Transporte (camada 4)",
                                "isCorrect": true
                            },
                            {
                                "text": "Rede (camada 3), do gateway",
                                "isCorrect": false
                            },
                            {
                                "text": "Sessão (camada 5)",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicação (camada 7)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma requisição HTTPS falha com erro de certificado, embora a conexão TCP seja estabelecida normalmente. No modelo OSI, qual camada trata da criptografia e do formato dos dados envolvidos nesse erro?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Camada 6, de apresentação",
                                "isCorrect": true
                            },
                            {
                                "text": "Camada 4, de transporte (TCP)",
                                "isCorrect": false
                            },
                            {
                                "text": "Camada 2, de enlace",
                                "isCorrect": false
                            },
                            {
                                "text": "Camada 3, de rede",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O modelo TCP/IP",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O modelo TCP/IP\n\nEnquanto o OSI é um modelo de referência teórico, o modelo TCP/IP é o que a internet realmente usa. Ele nasceu junto com os protocolos que sustentam a rede mundial e por isso é mais enxuto: são quatro camadas em vez de sete.\n\nO nome vem dos seus dois protocolos mais importantes, o TCP (na camada de transporte) e o IP (na camada de internet). Ele também é conhecido como pilha TCP/IP."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada TCP/IP\",\"Corresponde no OSI\",\"Função\",\"Protocolos\"],[\"Aplicação\",\"Camadas 5 a 7\",\"Dados e serviços ao usuário\",\"HTTP, DNS, SSH\"],[\"Transporte\",\"Camada 4\",\"Entrega fim a fim e portas\",\"TCP, UDP\"],[\"Internet\",\"Camada 3\",\"Endereçamento IP e roteamento\",\"IP, ICMP\"],[\"Acesso à rede\",\"Camadas 1 e 2\",\"Envio no meio local\",\"Ethernet, Wi-Fi\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como se mapeia ao OSI\n\nA correspondência entre os dois modelos não é perfeita, mas segue um padrão claro:\n\n- A camada de aplicação do TCP/IP concentra o que o OSI separa em três (aplicação, apresentação e sessão).\n- Transporte e internet batem quase um para um com transporte e rede do OSI.\n- A camada de acesso à rede junta enlace e física em uma só.\n\nAlguns autores dividem a camada de acesso à rede em enlace e física, formando uma versão de cinco camadas. O ponto central é entender que o TCP/IP agrupa, e o OSI detalha."
                    },
                    {
                        "type": "text",
                        "value": "## Por que o TCP/IP domina\n\nO TCP/IP se firmou por um motivo simples: veio com implementações que funcionavam e eram livres, enquanto o OSI ficou mais no papel. Hoje, todo serviço que você opera fala TCP/IP.\n\nNa prática de DevOps, os dois modelos convivem. Ninguém configura uma camada de sessão OSI, mas todo mundo fala em endereço IP (internet), porta TCP (transporte) e requisição HTTP (aplicação). Usa-se o TCP/IP para operar e o OSI como vocabulário para diagnosticar."
                    },
                    {
                        "type": "quote",
                        "value": "O OSI tem 7 camadas e serve de referência; o TCP/IP tem 4 e é o que roda na internet. Na camada de aplicação, o TCP/IP funde as três camadas superiores do OSI (sessão, apresentação e aplicação) em uma só."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quantas camadas tem o modelo TCP/IP e quais protocolos dão nome a ele?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quatro camadas; TCP e IP",
                                "isCorrect": true
                            },
                            {
                                "text": "Sete camadas; TCP e IP",
                                "isCorrect": false
                            },
                            {
                                "text": "Quatro camadas; HTTP e IP",
                                "isCorrect": false
                            },
                            {
                                "text": "Cinco camadas; TCP e UDP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A camada de aplicação do modelo TCP/IP corresponde a quais camadas do modelo OSI?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Aplicação, apresentação e sessão",
                                "isCorrect": true
                            },
                            {
                                "text": "Aplicação, transporte e internet",
                                "isCorrect": false
                            },
                            {
                                "text": "Apresentação e transporte apenas",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente a camada de aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O endereçamento IP e o roteamento entre redes, no modelo TCP/IP, ficam em qual camada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Internet",
                                "isCorrect": true
                            },
                            {
                                "text": "Acesso à rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Transporte",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No modelo TCP/IP, a camada de acesso à rede reúne as funções de quais camadas do OSI?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Enlace e física",
                                "isCorrect": true
                            },
                            {
                                "text": "Rede e transporte",
                                "isCorrect": false
                            },
                            {
                                "text": "Física e rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Enlace e rede",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao depurar uma conexão, você fala em endereço IP, porta TCP e requisição HTTP. No modelo TCP/IP, esses três termos pertencem, nessa ordem, a quais camadas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Internet, transporte e aplicação",
                                "isCorrect": true
                            },
                            {
                                "text": "Acesso à rede, internet e transporte",
                                "isCorrect": false
                            },
                            {
                                "text": "Internet, aplicação e transporte",
                                "isCorrect": false
                            },
                            {
                                "text": "Transporte, internet e aplicação",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Encapsulamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é encapsulamento\n\nEncapsulamento é o processo pelo qual os dados descem pela pilha de protocolos e, em cada camada, ganham um cabeçalho (header) com as informações que aquela camada precisa. É como colocar uma carta dentro de vários envelopes, um dentro do outro: cada envelope carrega o endereço que um trecho do caminho vai ler.\n\nQuando os dados chegam ao destino, o processo se inverte: cada camada lê e remove o seu cabeçalho antes de passar o conteúdo para a camada de cima. Esse caminho de volta é o desencapsulamento."
                    },
                    {
                        "type": "text",
                        "value": "## Descendo as camadas\n\nNo host de origem, os dados começam na aplicação e descem até o meio físico. A cada camada, um cabeçalho é adicionado (e, no enlace, também um rótulo no fim do quadro, o trailer):\n\n- A aplicação gera os dados.\n- O transporte adiciona o cabeçalho com as portas de origem e destino.\n- A rede adiciona o cabeçalho com os endereços IP.\n- O enlace adiciona o cabeçalho com os endereços MAC e o trailer de verificação.\n- A física transmite tudo como bits.\n\nCada camada entende apenas o próprio cabeçalho e trata o que veio de cima como carga (payload), sem precisar interpretar o conteúdo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"Cabeçalho adicionado\",\"PDU resultante\"],[\"Aplicação\",\"Dados da aplicação\",\"Dados\"],[\"Transporte\",\"Portas de origem e destino\",\"Segmento\"],[\"Rede\",\"Endereços IP\",\"Pacote\"],[\"Enlace\",\"Endereço MAC e trailer\",\"Quadro\"],[\"Física\",\"Sinais no meio\",\"Bits\"]]"
                    },
                    {
                        "type": "code",
                        "value": "[ Quadro | [ Pacote | [ Segmento | [ Dados ] ] ] | trailer ]\n   MAC          IP           TCP          HTTP\n\nCada camada envolve o conteudo da camada de cima:\n- Segmento = cabecalho TCP + dados\n- Pacote   = cabecalho IP  + segmento\n- Quadro   = cabecalho MAC + pacote + trailer"
                    },
                    {
                        "type": "text",
                        "value": "## Desencapsulamento na recepção\n\nNo host de destino, o fluxo é o contrário. Os bits sobem pela pilha e cada camada remove o cabeçalho que a camada equivalente do outro lado adicionou:\n\n- A física recebe os bits e monta o quadro.\n- O enlace confere o trailer, remove o cabeçalho MAC e entrega o pacote.\n- A rede remove o cabeçalho IP e entrega o segmento.\n- O transporte remove o cabeçalho de portas e entrega os dados.\n- A aplicação recebe os dados prontos para uso.\n\nEssa simetria é a base do modelo em camadas: o cabeçalho escrito por uma camada só é lido pela mesma camada do outro lado."
                    },
                    {
                        "type": "quote",
                        "value": "Encapsular é descer as camadas adicionando um cabeçalho em cada uma; desencapsular é subir removendo esses cabeçalhos no destino. Cada camada só lê o cabeçalho escrito pela camada equivalente do outro lado."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza o encapsulamento em uma rede?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cada camada adiciona um cabeçalho ao descer a pilha",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada camada remove um cabeçalho ao subir a pilha",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados atravessam a pilha inteira sem qualquer alteração",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente a camada física adiciona um cabeçalho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No host que recebe os dados, o desencapsulamento acontece em qual sentido da pilha de camadas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "De baixo para cima, removendo cabeçalhos",
                                "isCorrect": true
                            },
                            {
                                "text": "De cima para baixo, removendo cabeçalhos",
                                "isCorrect": false
                            },
                            {
                                "text": "De cima para baixo, adicionando cabeçalhos",
                                "isCorrect": false
                            },
                            {
                                "text": "De baixo para cima, adicionando cabeçalhos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante o encapsulamento, em qual camada o cabeçalho com os endereços IP de origem e destino é adicionado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rede",
                                "isCorrect": true
                            },
                            {
                                "text": "Transporte",
                                "isCorrect": false
                            },
                            {
                                "text": "Enlace",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao receber os dados da camada acima, a camada de transporte adiciona seu cabeçalho e trata todo o conteúdo recebido como carga. Como se chama esse conteúdo transportado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Payload",
                                "isCorrect": true
                            },
                            {
                                "text": "Trailer",
                                "isCorrect": false
                            },
                            {
                                "text": "Preâmbulo",
                                "isCorrect": false
                            },
                            {
                                "text": "Checksum",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista captura um quadro Ethernet e quer chegar aos dados HTTP. Em que ordem ele encontra os cabeçalhos, do mais externo ao mais interno?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "MAC, IP, TCP, dados",
                                "isCorrect": true
                            },
                            {
                                "text": "IP, MAC, TCP, dados",
                                "isCorrect": false
                            },
                            {
                                "text": "TCP, IP, MAC, dados",
                                "isCorrect": false
                            },
                            {
                                "text": "MAC, TCP, IP, dados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Unidades de dados por camada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Unidades de dados (PDU)\n\nCada camada trabalha com um nome específico para o bloco de dados que manipula. Esse bloco é a PDU (Protocol Data Unit), a unidade de dados daquela camada. Usar o termo certo evita confusão ao ler logs, documentação e ao responder em uma entrevista.\n\nA regra é direta: o nome muda conforme o cabeçalho que já foi adicionado. Nas camadas mais baixas, o mesmo conteúdo aparece com nomes diferentes porque cada camada o enxerga do seu ponto de vista."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada (OSI)\",\"PDU\",\"Conteúdo\"],[\"Física\",\"Bit\",\"Sinais no meio: elétrico, óptico ou rádio\"],[\"Enlace\",\"Quadro (frame)\",\"Cabeçalho MAC, pacote e trailer\"],[\"Rede\",\"Pacote (packet)\",\"Cabeçalho IP e segmento\"],[\"Transporte\",\"Segmento (segment)\",\"Cabeçalho de portas e dados\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Termos que confundem\n\nAlguns pontos costumam gerar erro em prova:\n\n- No transporte, o TCP usa segmento, mas o UDP usa datagrama. É a mesma camada, com nomes diferentes por protocolo.\n- Na camada de rede, o IP também trabalha com datagrama IP, que é sinônimo de pacote nesse contexto.\n- No dia a dia, muita gente chama tudo de pacote. Tecnicamente, pacote é a PDU da camada de rede, e usar o termo certo mostra domínio do assunto.\n\nA dica é ancorar cada nome na sua camada: bit embaixo, depois quadro, depois pacote, depois segmento."
                    },
                    {
                        "type": "text",
                        "value": "## Onde isso aparece na prática\n\nSaber a PDU de cada camada ajuda a ler ferramentas e métricas:\n\n- Um switch encaminha quadros olhando o endereço MAC (camada 2).\n- Um roteador encaminha pacotes olhando o endereço IP (camada 3).\n- Métricas de perda de pacote e de retransmissão de segmento apontam camadas diferentes do problema.\n\nQuando alguém fala em captura de pacotes, costuma se referir ao quadro inteiro capturado, com o pacote e o segmento aninhados dentro. Entender esse aninhamento evita ler um gráfico na camada errada."
                    },
                    {
                        "type": "quote",
                        "value": "Ordene as PDUs de baixo para cima: bit (física), quadro (enlace), pacote (rede) e segmento (transporte). No transporte, lembre que TCP fala em segmento e UDP em datagrama."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a unidade de dados (PDU) da camada de rede?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pacote",
                                "isCorrect": true
                            },
                            {
                                "text": "Quadro",
                                "isCorrect": false
                            },
                            {
                                "text": "Segmento",
                                "isCorrect": false
                            },
                            {
                                "text": "Bit",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao trafegar na camada de enlace, o bloco de dados recebe qual nome?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quadro",
                                "isCorrect": true
                            },
                            {
                                "text": "Pacote",
                                "isCorrect": false
                            },
                            {
                                "text": "Segmento",
                                "isCorrect": false
                            },
                            {
                                "text": "Datagrama",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O UDP trabalha com datagramas. Qual é o nome equivalente que o TCP usa para a sua unidade na camada de transporte?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Segmento",
                                "isCorrect": true
                            },
                            {
                                "text": "Datagrama",
                                "isCorrect": false
                            },
                            {
                                "text": "Pacote",
                                "isCorrect": false
                            },
                            {
                                "text": "Quadro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um switch de camada 2 toma decisões de encaminhamento com base no endereço MAC. Qual PDU ele manipula nesse processo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quadro",
                                "isCorrect": true
                            },
                            {
                                "text": "Pacote",
                                "isCorrect": false
                            },
                            {
                                "text": "Segmento",
                                "isCorrect": false
                            },
                            {
                                "text": "Bit",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Colocando as PDUs na ordem em que aparecem, da camada física à de transporte, qual sequência está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Bit, quadro, pacote, segmento",
                                "isCorrect": true
                            },
                            {
                                "text": "Bit, pacote, quadro, segmento",
                                "isCorrect": false
                            },
                            {
                                "text": "Quadro, bit, pacote, segmento",
                                "isCorrect": false
                            },
                            {
                                "text": "Bit, quadro, segmento, pacote",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Endereçamento e sub-redes",
        "aulas": [
            {
                "titulo": "Endereço IPv4",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um endereço IPv4\n\nUm endereço IPv4 identifica uma interface de rede dentro de uma rede. Ele tem 32 bits, divididos em quatro grupos de 8 bits chamados octetos. Cada octeto vira um número decimal de 0 a 255, e os quatro aparecem separados por pontos. É a chamada notação decimal pontuada, como em 192.168.0.10.\n\nComo cada octeto tem 8 bits, ele vai de 0 (00000000) a 255 (11111111). Por isso um valor como 256 nunca aparece em um endereço válido. Os 32 bits juntos permitem cerca de 4,3 bilhões de combinações."
                    },
                    {
                        "type": "text",
                        "value": "## Parte de rede e parte de host\n\nUm endereço IPv4 não é um número solto: ele se divide em duas partes. A parte de rede diz a qual rede o host pertence, e a parte de host identifica o dispositivo específico dentro dela.\n\n- Todos os dispositivos da mesma rede compartilham a mesma parte de rede.\n- Cada dispositivo tem uma parte de host diferente, que o torna único ali dentro.\n\nÉ o que separa a máquina 192.168.0.10 da 192.168.0.11: mesma rede (192.168.0), hosts diferentes (10 e 11). Onde termina a rede e começa o host depende da máscara, o assunto da próxima aula."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Classe\", \"1º octeto\", \"Máscara padrão\", \"Hosts por rede\"], [\"A\", \"1 a 126\", \"255.0.0.0 (/8)\", \"16.777.214\"], [\"B\", \"128 a 191\", \"255.255.0.0 (/16)\", \"65.534\"], [\"C\", \"192 a 223\", \"255.255.255.0 (/24)\", \"254\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Das classes ao CIDR\n\nNos primeiros anos da internet, o tamanho da parte de rede era definido pelo primeiro octeto, o que criou três classes de uso geral: a classe A (primeiro octeto de 1 a 126), a classe B (128 a 191) e a classe C (192 a 223). O valor 127 ficou reservado para loopback (o famoso 127.0.0.1, a própria máquina), e as classes D e E cuidavam de multicast e uso experimental.\n\nO problema é que esse esquema era rígido e desperdiçava endereços: quem precisava de 300 hosts não cabia numa classe C (254) e recebia uma classe B inteira (65.534), jogando milhares fora. A solução foi o CIDR (Classless Inter-Domain Routing), que abandonou as classes fixas e deixou a fronteira entre rede e host cair em qualquer bit. As classes viraram história; o CIDR é como se endereça hoje, e é o tema das próximas aulas."
                    },
                    {
                        "type": "code",
                        "value": "# 192.168.0.10 em binário, os 32 bits em quatro octetos\n192      168      0        10\n11000000 10101000 00000000 00001010\n\n# cada octeto vai de 0 (00000000) a 255 (11111111)"
                    },
                    {
                        "type": "quote",
                        "value": "Um endereço IPv4 tem 32 bits em quatro octetos (0 a 255), na notação decimal pontuada. Ele se divide em parte de rede, comum a todos os hosts do segmento, e parte de host, única para cada dispositivo. As classes A, B e C deram lugar ao CIDR."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um endereço IPv4 é formado por quantos bits?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "32 bits",
                                "isCorrect": true
                            },
                            {
                                "text": "64 bits",
                                "isCorrect": false
                            },
                            {
                                "text": "128 bits",
                                "isCorrect": false
                            },
                            {
                                "text": "16 bits",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual dos valores abaixo não pode aparecer em um octeto de um endereço IPv4?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "256",
                                "isCorrect": true
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            },
                            {
                                "text": "128",
                                "isCorrect": false
                            },
                            {
                                "text": "255",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O endereço 200.10.5.4 tem 200 no primeiro octeto. A qual classe histórica ele pertence?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Classe C",
                                "isCorrect": true
                            },
                            {
                                "text": "Classe A",
                                "isCorrect": false
                            },
                            {
                                "text": "Classe B",
                                "isCorrect": false
                            },
                            {
                                "text": "Classe D",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois computadores estão no mesmo segmento de rede local e conversam sem passar por um roteador. O que precisa ser igual nos dois endereços IP?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A parte de rede do endereço.",
                                "isCorrect": true
                            },
                            {
                                "text": "A parte de host do endereço.",
                                "isCorrect": false
                            },
                            {
                                "text": "O último octeto do endereço.",
                                "isCorrect": false
                            },
                            {
                                "text": "O primeiro bit do endereço.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na notação decimal pontuada, a que corresponde o último octeto (10) de 192.168.0.10 em binário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "00001010",
                                "isCorrect": true
                            },
                            {
                                "text": "00010100",
                                "isCorrect": false
                            },
                            {
                                "text": "10100000",
                                "isCorrect": false
                            },
                            {
                                "text": "00001100",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Máscara de rede e CIDR",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A máscara de rede\n\nA máscara de rede é o que diz onde termina a parte de rede e começa a parte de host. Ela tem os mesmos 32 bits do endereço, mas com um padrão fixo: uma sequência de bits 1, seguida de uma sequência de bits 0.\n\n- Os bits 1 marcam a parte de rede.\n- Os bits 0 marcam a parte de host.\n\nNa máscara 255.255.255.0, os três primeiros octetos são todos 1 (255 em decimal) e o último é todo 0. Ou seja, os 24 primeiros bits são rede e os 8 últimos são host."
                    },
                    {
                        "type": "text",
                        "value": "## A notação CIDR\n\nEscrever 255.255.255.0 o tempo todo é cansativo. A notação CIDR resume a máscara pelo número de bits 1 que ela tem, colocado após uma barra. Assim, 255.255.255.0 vira /24, porque são 24 bits de rede.\n\nA conta é direta: /24 são 24 bits para a rede e sobram 8 para o host; /16 são 16 e 16; /8 são 8 e 24. Quanto maior o número após a barra, mais bits vão para a rede e menos sobram para os hosts."
                    },
                    {
                        "type": "table",
                        "value": "[[\"CIDR\", \"Máscara decimal\", \"Bits de host\", \"Hosts válidos\"], [\"/8\", \"255.0.0.0\", \"24\", \"16.777.214\"], [\"/16\", \"255.255.0.0\", \"16\", \"65.534\"], [\"/24\", \"255.255.255.0\", \"8\", \"254\"], [\"/25\", \"255.255.255.128\", \"7\", \"126\"], [\"/26\", \"255.255.255.192\", \"6\", \"62\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Endereço de rede e broadcast\n\nDentro de cada rede, dois endereços não podem ser usados por hosts:\n\n- O endereço de rede tem todos os bits de host em 0. É o nome do segmento, como 192.168.1.0 numa /24.\n- O endereço de broadcast tem todos os bits de host em 1. Serve para falar com todos de uma vez, como 192.168.1.255 numa /24.\n\nPara achar o endereço de rede, aplica-se um E lógico (AND) bit a bit entre o IP e a máscara. O broadcast é esse mesmo endereço de rede, mas com a parte de host toda preenchida com 1. Tudo que fica entre os dois sobra para os hosts."
                    },
                    {
                        "type": "code",
                        "value": "# IP 192.168.1.50 com máscara /24 (255.255.255.0)\nIP        = 192.168.1.50\nMáscara   = 255.255.255.0\nRede      = 192.168.1.0      (bits de host zerados)\nBroadcast = 192.168.1.255    (bits de host em 1)\nHosts     = 192.168.1.1 até 192.168.1.254\n\n# o endereço de rede é o E lógico (AND) bit a bit:\n192.168.1.50  = 11000000.10101000.00000001.00110010\n255.255.255.0 = 11111111.11111111.11111111.00000000\n192.168.1.0   = 11000000.10101000.00000001.00000000"
                    },
                    {
                        "type": "quote",
                        "value": "A máscara usa bits 1 para a rede e bits 0 para o host, e o CIDR a resume pelo número de bits 1 (/24). O endereço de rede tem a parte de host toda em 0; o de broadcast, toda em 1."
                    }
                ],
                "questions": [
                    {
                        "statement": "O prefixo /24 corresponde a qual máscara de rede em decimal?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "255.255.255.0",
                                "isCorrect": true
                            },
                            {
                                "text": "255.255.0.0",
                                "isCorrect": false
                            },
                            {
                                "text": "255.0.0.0",
                                "isCorrect": false
                            },
                            {
                                "text": "255.255.255.255",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma máscara de rede, o que os bits em 1 indicam?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A parte de rede do endereço.",
                                "isCorrect": true
                            },
                            {
                                "text": "A parte de host do endereço.",
                                "isCorrect": false
                            },
                            {
                                "text": "O endereço de broadcast.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de sub-redes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o endereço de rede do host 192.168.1.50/24?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "192.168.1.0",
                                "isCorrect": true
                            },
                            {
                                "text": "192.168.1.1",
                                "isCorrect": false
                            },
                            {
                                "text": "192.168.1.50",
                                "isCorrect": false
                            },
                            {
                                "text": "192.168.1.255",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o endereço de broadcast da rede do host 10.0.0.33/24?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "10.0.0.255",
                                "isCorrect": true
                            },
                            {
                                "text": "10.0.0.0",
                                "isCorrect": false
                            },
                            {
                                "text": "10.0.0.33",
                                "isCorrect": false
                            },
                            {
                                "text": "10.255.255.255",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quantos endereços de host válidos existem em uma sub-rede /26?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "62",
                                "isCorrect": true
                            },
                            {
                                "text": "64",
                                "isCorrect": false
                            },
                            {
                                "text": "30",
                                "isCorrect": false
                            },
                            {
                                "text": "126",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Sub-redes (subnetting)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dividir uma rede em sub-redes\n\nFazer subnetting é pegar uma rede e quebrá-la em pedaços menores, as sub-redes. A ideia é emprestar bits da parte de host para a parte de rede: cada bit emprestado dobra o número de sub-redes e reduz pela metade os hosts de cada uma.\n\nSaindo de uma /24 e emprestando um bit, você chega a duas /25. Emprestando dois bits, quatro /26, e assim por diante. A rede original continua a mesma; o que muda é como ela passa a ser fatiada por dentro."
                    },
                    {
                        "type": "text",
                        "value": "## Por que criar sub-redes\n\nDividir dá trabalho, então precisa valer a pena. Os motivos mais comuns:\n\n- Organizar: separar setores ou funções, como servidores numa sub-rede e estações em outra.\n- Isolar: limitar o domínio de broadcast e conter problemas, já que o tráfego de uma sub-rede não inunda as outras.\n- Segurança: aplicar regras de firewall entre sub-redes, controlando quem fala com quem.\n- Otimizar: dar a cada segmento só o tamanho de que ele precisa, sem desperdiçar endereços."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Novo prefixo\", \"Sub-redes a partir da /24\", \"Hosts por sub-rede\"], [\"/25\", \"2\", \"126\"], [\"/26\", \"4\", \"62\"], [\"/27\", \"8\", \"30\"], [\"/28\", \"16\", \"14\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# uma /24 dividida em quatro /26 (bloco de 64 endereços)\nRede original: 192.168.10.0/24\n\n192.168.10.0/26     hosts .1   a .62    broadcast .63\n192.168.10.64/26    hosts .65  a .126   broadcast .127\n192.168.10.128/26   hosts .129 a .190   broadcast .191\n192.168.10.192/26   hosts .193 a .254   broadcast .255"
                    },
                    {
                        "type": "text",
                        "value": "## Estimar quantos hosts cabem\n\nPara saber quantos hosts uma sub-rede comporta, conte os bits de host (32 menos o prefixo) e use a fórmula 2 elevado a esse número, menos 2. O menos 2 desconta os dois endereços que nenhum host pode usar: o de rede e o de broadcast.\n\n- Uma /26 tem 6 bits de host: 2^6 menos 2, ou seja 62 hosts.\n- Uma /28 tem 4 bits de host: 2^4 menos 2, ou seja 14 hosts.\n\nNa prática, você faz o caminho inverso: parte da quantidade de hosts necessária e escolhe o menor bloco que a acomoda, para não desperdiçar endereços."
                    },
                    {
                        "type": "quote",
                        "value": "Criar sub-redes empresta bits do host para a rede: cada bit dobra o número de sub-redes e corta os hosts pela metade. Os hosts úteis de um prefixo são 2 elevado aos bits de host, menos 2 (rede e broadcast)."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa fazer subnetting?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dividir uma rede maior em sub-redes menores.",
                                "isCorrect": true
                            },
                            {
                                "text": "Juntar várias redes menores em uma só maior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Traduzir endereços privados em públicos na saída.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar a máscara de rede por um endereço público.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é um motivo comum para dividir uma rede em sub-redes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Conter o broadcast e isolar o tráfego.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o número de bits do endereço IP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar de vez a necessidade de máscara.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformar IPv4 em IPv6 automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao dividir uma rede /24 em blocos /26, quantas sub-redes você obtém?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "4",
                                "isCorrect": true
                            },
                            {
                                "text": "2",
                                "isCorrect": false
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            },
                            {
                                "text": "16",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quantos endereços de host válidos cabem em uma sub-rede /27?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "30",
                                "isCorrect": true
                            },
                            {
                                "text": "32",
                                "isCorrect": false
                            },
                            {
                                "text": "14",
                                "isCorrect": false
                            },
                            {
                                "text": "62",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa de uma sub-rede para 100 hosts e quer desperdiçar o mínimo de endereços. Qual prefixo escolher?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "/25",
                                "isCorrect": true
                            },
                            {
                                "text": "/26",
                                "isCorrect": false
                            },
                            {
                                "text": "/24",
                                "isCorrect": false
                            },
                            {
                                "text": "/27",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Endereços privados, públicos e NAT",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Endereços públicos e privados\n\nNem todo endereço IPv4 vale na internet. Existem dois grandes grupos:\n\n- Endereço público: único no mundo e roteável na internet. É o que um servidor precisa para ser alcançado de fora, e é distribuído por autoridades de registro.\n- Endereço privado: reservado para uso interno em redes locais. Pode se repetir em milhares de redes ao mesmo tempo, porque não é roteado na internet pública.\n\nO IP privado da sua máquina em casa pode ser idêntico ao de outra pessoa do outro lado do mundo, sem causar conflito, pois cada um vive dentro da sua própria rede."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Faixa privada\", \"CIDR\", \"Máscara\", \"Total de endereços\"], [\"10.0.0.0 a 10.255.255.255\", \"10.0.0.0/8\", \"255.0.0.0\", \"16.777.216\"], [\"172.16.0.0 a 172.31.255.255\", \"172.16.0.0/12\", \"255.240.0.0\", \"1.048.576\"], [\"192.168.0.0 a 192.168.255.255\", \"192.168.0.0/16\", \"255.255.0.0\", \"65.536\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## NAT: do privado para o público\n\nSe o endereço privado não roteia na internet, como um computador interno acessa um site? A resposta é o NAT (Network Address Translation). Na saída, o roteador troca o endereço privado de origem pelo endereço público que ele possui. Na volta, faz a troca inversa e entrega a resposta ao host certo.\n\nAssim, uma rede inteira de endereços privados aparece na internet sob poucos endereços públicos, ou até um só. O NAT foi uma das razões de o IPv4 durar tanto tempo apesar da escassez de endereços."
                    },
                    {
                        "type": "text",
                        "value": "## PAT: muitos hosts, um IP público\n\nQuando vários hosts internos precisam sair pelo mesmo endereço público, entra o PAT (Port Address Translation), também chamado de sobrecarga, ou overload. Além de trocar o endereço, o roteador usa a porta de origem para diferenciar cada conexão.\n\nEle mantém uma tabela que associa cada par de endereço e porta interno a uma porta no endereço público. Quando a resposta chega, a porta indica a qual host interno ela pertence. É o que roda no roteador da maioria das casas e escritórios: dezenas de dispositivos navegando por um único IP público."
                    },
                    {
                        "type": "code",
                        "value": "# tabela de tradução (PAT): vários hosts, um IP público\n\nInterno (privado)      Público visto na internet\n192.168.0.10:51000  -> 203.0.113.5:40001\n192.168.0.11:52000  -> 203.0.113.5:40002\n192.168.0.12:51000  -> 203.0.113.5:40003\n\n# a porta de origem no lado público identifica cada host interno"
                    },
                    {
                        "type": "quote",
                        "value": "Endereços privados (10.0.0.0/8, 172.16.0.0/12 e 192.168.0.0/16) não roteiam na internet e podem se repetir entre redes. O NAT troca o privado por um público na saída; o PAT usa portas para muitos hosts saírem por um só IP público."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual dos endereços abaixo pertence a uma faixa privada (RFC 1918)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "192.168.0.1",
                                "isCorrect": true
                            },
                            {
                                "text": "8.8.8.8",
                                "isCorrect": false
                            },
                            {
                                "text": "1.1.1.1",
                                "isCorrect": false
                            },
                            {
                                "text": "200.20.20.20",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o NAT faz quando um host interno acessa a internet?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Troca o endereço privado de origem por um público.",
                                "isCorrect": true
                            },
                            {
                                "text": "Troca o endereço público de origem por um privado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Distribui um endereço IP para cada host da rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloqueia o acesso dos hosts privados à internet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O endereço 8.8.8.8 é considerado público ou privado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Público, pois não está nas faixas privadas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Privado, pois está na faixa 10.0.0.0/8.",
                                "isCorrect": false
                            },
                            {
                                "text": "Privado, porque o número é baixo e repetido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reservado, porque serve para o loopback local.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o PAT (sobrecarga) permite em uma rede?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Muitos hosts dividirem um IP público usando portas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada host privado receber um IP público próprio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um host público falar com vários privados por porta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os endereços privados passarem a rotear na internet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual endereço está dentro da faixa privada 172.16.0.0/12?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "172.20.5.1",
                                "isCorrect": true
                            },
                            {
                                "text": "172.15.0.1",
                                "isCorrect": false
                            },
                            {
                                "text": "172.32.0.1",
                                "isCorrect": false
                            },
                            {
                                "text": "173.16.0.1",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "IPv6 (conceito)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que o IPv6 surgiu\n\nO IPv4 usa 32 bits, o que dá cerca de 4,3 bilhões de endereços. Parecia muito nos anos 1980, mas com a explosão de computadores, celulares e dispositivos conectados, esse total foi se esgotando. Paliativos como o NAT esticaram a vida do IPv4, mas não resolveram a raiz do problema.\n\nO IPv6 nasceu para acabar de vez com essa escassez. Ele usa 128 bits, o que eleva o total de endereços a um número gigantesco, cerca de 340 undecilhões. Na prática, endereços deixam de ser um recurso escasso."
                    },
                    {
                        "type": "text",
                        "value": "## Como o IPv6 é escrito\n\nUm endereço IPv6 tem 128 bits, escritos em hexadecimal e organizados em oito grupos de quatro dígitos, separados por dois-pontos. Um exemplo completo é 2001:0db8:0000:0000:0000:0000:0000:0001.\n\nEscrever tudo isso seria penoso, então há duas regras de abreviação:\n\n- Zeros à esquerda de cada grupo podem ser omitidos: 0db8 vira db8, 0001 vira 1.\n- Uma sequência de grupos zerados pode virar dois-pontos duplos (::), que só podem aparecer uma vez no endereço.\n\nCom isso, o endereço do exemplo encolhe para 2001:db8::1."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"IPv4\", \"IPv6\"], [\"Tamanho\", \"32 bits\", \"128 bits\"], [\"Notação\", \"decimal pontuada\", \"hexadecimal com dois-pontos\"], [\"Exemplo\", \"192.168.0.10\", \"2001:db8::1\"], [\"Total de endereços\", \"cerca de 4,3 bilhões\", \"cerca de 340 undecilhões\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# o mesmo endereço IPv6, do completo ao abreviado\nCompleto:  2001:0db8:0000:0000:0000:0000:0000:0001\nSem zeros: 2001:db8:0:0:0:0:0:1\nCom ::     2001:db8::1\n\n# o :: substitui uma sequência de grupos zerados\n# e só pode aparecer uma vez no endereço"
                    },
                    {
                        "type": "text",
                        "value": "## Coexistência: dual stack\n\nA troca do IPv4 pelo IPv6 não acontece de um dia para o outro. Os dois protocolos convivem, e a forma mais comum de coexistência é o dual stack: o host roda IPv4 e IPv6 ao mesmo tempo, com um endereço de cada.\n\nQuando vai falar com um destino, ele usa o protocolo que aquele destino suporta. Se o outro lado só tem IPv4, usa IPv4; se tem IPv6, prefere IPv6. Assim a rede caminha para o IPv6 sem quebrar o que ainda depende de IPv4."
                    },
                    {
                        "type": "quote",
                        "value": "O IPv6 surgiu contra o esgotamento do IPv4 e usa 128 bits em hexadecimal, contra os 32 bits do IPv4. No dual stack, o host roda os dois protocolos ao mesmo tempo e usa o que o destino suportar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual foi a principal motivação para a criação do IPv6?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O esgotamento dos endereços do IPv4.",
                                "isCorrect": true
                            },
                            {
                                "text": "A lentidão do roteamento em redes IPv4.",
                                "isCorrect": false
                            },
                            {
                                "text": "A falta de suporte a NAT no IPv4.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência de máscara de rede no IPv4.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quantos bits tem um endereço IPv6?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "128 bits",
                                "isCorrect": true
                            },
                            {
                                "text": "32 bits",
                                "isCorrect": false
                            },
                            {
                                "text": "64 bits",
                                "isCorrect": false
                            },
                            {
                                "text": "256 bits",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como é escrito um endereço IPv6?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em hexadecimal, em grupos com dois-pontos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Em decimal, em octetos separados por pontos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em binário, em blocos separados por barras.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em hexadecimal, em octetos separados por pontos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que caracteriza uma configuração dual stack?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O host roda IPv4 e IPv6 ao mesmo tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O host usa dois endereços IPv4 distintos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um servidor converte todo IPv6 em IPv4.",
                                "isCorrect": false
                            },
                            {
                                "text": "A rede mantém uma cópia de reserva do IPv4.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a forma abreviada correta de 2001:0db8:0000:0000:0000:0000:0000:0001?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "2001:db8::1",
                                "isCorrect": true
                            },
                            {
                                "text": "2001:db8:0:1",
                                "isCorrect": false
                            },
                            {
                                "text": "2001:db8:1::",
                                "isCorrect": false
                            },
                            {
                                "text": "2001::db8::1",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Roteamento e comutação",
        "aulas": [
            {
                "titulo": "Switch x roteador",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Switch x roteador\n\nDois equipamentos formam a espinha dorsal de qualquer rede: o **switch** e o **roteador**. À primeira vista parecem fazer a mesma coisa, levar dados de um ponto a outro, mas operam em camadas diferentes e resolvem problemas diferentes. Confundir os dois leva a erros clássicos de topologia e de diagnóstico.\n\nA diferença começa na camada em que cada um atua. O switch trabalha na **camada 2** (enlace), aquela que move quadros dentro de uma mesma rede local. O roteador trabalha na **camada 3** (rede), aquela que move pacotes entre redes distintas. Guardar essa separação torna simples todo o resto da aula."
                    },
                    {
                        "type": "text",
                        "value": "## O switch trabalha na camada 2\n\nO switch conecta os dispositivos de uma mesma **LAN** (rede local): os servidores de um rack, as máquinas de um escritório, os nós de um segmento. Ele encaminha **quadros** (frames) olhando o **endereço MAC** de destino, e não o IP.\n\nPara isso, mantém uma **tabela MAC** (também chamada de tabela CAM): um mapa de qual endereço MAC está atrás de qual porta física. Quando um quadro chega, o switch lê o MAC de destino, procura na tabela e envia o quadro somente pela porta correta. Se ainda não conhece aquele MAC, replica o quadro por todas as portas (flooding) e aprende a resposta quando o destino responde.\n\nO switch não enxerga IP, não altera o pacote e não decide rotas entre redes. O trabalho dele é rápido e local: entregar o quadro certo à porta certa dentro da LAN."
                    },
                    {
                        "type": "text",
                        "value": "## O roteador trabalha na camada 3\n\nO roteador conecta **redes diferentes** entre si: a sua LAN e a internet, duas sub-redes de um data center, a rede on-prem e a nuvem. Ele encaminha **pacotes** olhando o **endereço IP** de destino e consultando uma **tabela de rotas** (assunto da aula 3).\n\nEnquanto o switch pergunta \"por qual porta alcanço este MAC dentro da LAN?\", o roteador pergunta \"por qual caminho alcanço esta rede?\". Ele fica na fronteira entre redes e é o ponto de passagem obrigatório para todo tráfego que sai do segmento local.\n\nUm detalhe que liga as duas camadas: ao encaminhar o pacote para o próximo salto, o roteador reescreve os endereços MAC do quadro, mas preserva os IPs de origem e destino. A aula 2 detalha esse ponto."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Switch\", \"Roteador\"], [\"Camada OSI\", \"Camada 2 (enlace)\", \"Camada 3 (rede)\"], [\"Endereço usado\", \"MAC\", \"IP\"], [\"Unidade de dado\", \"Quadro (frame)\", \"Pacote\"], [\"Escopo\", \"Dentro de uma LAN\", \"Entre redes diferentes\"], [\"Estrutura de apoio\", \"Tabela MAC\", \"Tabela de rotas\"], [\"Domínio de broadcast\", \"Um só para todas as portas\", \"Um por interface\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Domínio de broadcast\n\nUm **broadcast** é um quadro destinado a todos os hosts do segmento de uma vez (o endereço MAC de destino `FF:FF:FF:FF:FF:FF`). Protocolos como o ARP, tema da aula 4, dependem dele.\n\nUm **domínio de broadcast** é o conjunto de dispositivos que recebem esse quadro. Aqui está a diferença prática entre os dois equipamentos:\n\n- O **switch propaga** o broadcast: um quadro de broadcast que entra por uma porta sai por todas as outras. Por padrão, todas as portas de um switch formam **um único domínio de broadcast**.\n- O **roteador barra** o broadcast: ele não repassa quadros de broadcast de uma interface para outra. Por isso cada interface de um roteador delimita **um domínio de broadcast separado**.\n\nO ponto central: o switch divide domínios de colisão (uma porta cada), mas não divide domínios de broadcast; quem separa domínios de broadcast é o roteador. Guarde essa ideia, porque a aula 5 mostra como dividir o domínio de broadcast sem um roteador para cada segmento."
                    },
                    {
                        "type": "quote",
                        "value": "O switch é camada 2 e vive dentro da LAN, encaminhando quadros por MAC; o roteador é camada 3 e liga redes diferentes, encaminhando pacotes por IP. Todas as portas de um switch são um único domínio de broadcast; cada interface de um roteador é um domínio de broadcast à parte."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em qual camada o switch opera e por qual endereço ele encaminha os dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Camada 2, encaminhando quadros pelo endereço MAC.",
                                "isCorrect": true
                            },
                            {
                                "text": "Camada 3, encaminhando pacotes pelo endereço IP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Camada 3, encaminhando quadros pelo endereço MAC.",
                                "isCorrect": false
                            },
                            {
                                "text": "Camada 2, encaminhando pacotes pelo endereço IP.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um servidor precisa enviar tráfego para uma rede diferente da sua. Qual equipamento faz esse encaminhamento entre redes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O switch, que já conhece todos os MACs da rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "O roteador, que trabalha na camada 3 por IP.",
                                "isCorrect": true
                            },
                            {
                                "text": "O switch, que trabalha na camada 2 por MAC.",
                                "isCorrect": false
                            },
                            {
                                "text": "Qualquer um dos dois, já que ambos encaminham dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um quadro chega a um switch com um MAC de destino que não está na tabela MAC. O que o switch faz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Encaminha o quadro ao roteador mais próximo para que ele decida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descarta o quadro, pois não conhece a porta de destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Replica o quadro pelas demais portas e aprende a resposta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Converte o MAC em IP e consulta a tabela de rotas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Três switches estão ligados entre si, sem nenhum roteador, todos na mesma faixa de IP. Quantos domínios de broadcast existem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Três, um domínio de broadcast para cada switch da cadeia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um só, porque switches não separam broadcast.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um por porta física de cada um dos switches.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum, pois broadcast não passa por switch.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você liga duas sub-redes distintas por meio de um roteador. Um broadcast disparado em uma delas chega à outra?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sim, o roteador repassa broadcasts entre as interfaces.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas apenas se as sub-redes tiverem o mesmo IP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, o roteador delimita o domínio de broadcast.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só se houver um switch instalado entre elas.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Endereço MAC x IP",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Endereço MAC x IP\n\nTodo dispositivo em rede carrega dois endereços que trabalham juntos sem se confundir: o **MAC** e o **IP**. Um é físico e local, o outro é lógico e roteável. A regra que resume os papéis: o **IP diz para onde ir**; o **MAC diz para quem entregar no próximo salto**.\n\n## O endereço MAC: físico, da camada 2\n\nO **MAC** (Media Access Control) é o endereço da **camada 2**, gravado na **placa de rede** (NIC) de fábrica. Ele identifica aquela interface dentro da LAN.\n\n- Tem 48 bits, escrito em hexadecimal, como `00:1A:2B:3C:4D:5E`.\n- Os primeiros 24 bits (OUI) identificam o fabricante; os demais são únicos por placa.\n- É **plano**: não carrega informação de onde a máquina está, apenas de quem ela é.\n\nPor ser plano e local, o MAC só tem utilidade **dentro do mesmo segmento**. Ele não serve para rotear, porque nada nele aponta um caminho."
                    },
                    {
                        "type": "text",
                        "value": "## O endereço IP: lógico, da camada 3\n\nO **IP** (Internet Protocol) é o endereço da **camada 3**. Ele não vem na placa: é **configurável**, atribuído por software, de forma manual ou automática (via DHCP). A mesma máquina recebe um IP diferente ao mudar de rede.\n\n- É **lógico**: representa a posição da máquina em uma rede, não o hardware.\n- É **hierárquico**: a parte de rede e a parte de host permitem agrupar endereços em sub-redes e, com isso, **rotear**.\n- Muda conforme o contexto: casa, escritório e nuvem dão IPs diferentes ao mesmo notebook.\n\nÉ essa natureza hierárquica e configurável que torna o IP roteável: os roteadores decidem caminhos olhando a parte de rede do IP de destino."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Endereço MAC\", \"Endereço IP\"], [\"Camada\", \"2 (enlace)\", \"3 (rede)\"], [\"Natureza\", \"Físico, gravado na placa\", \"Lógico, configurável\"], [\"Formato\", \"48 bits em hexadecimal\", \"IPv4: 32 bits em decimal\"], [\"Estrutura\", \"Plano\", \"Hierárquico (rede + host)\"], [\"Escopo de uso\", \"Dentro da LAN\", \"Fim a fim, entre redes\"], [\"Muda no caminho?\", \"Sim, a cada salto\", \"Não, permanece o mesmo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quem é usado em cada ponto do caminho\n\nImagine o host A (na LAN 1) enviando um pacote ao host B (na LAN 2), passando por um roteador R.\n\n1. A monta o pacote com **IP de origem A** e **IP de destino B**. Esses dois IPs não mudam durante toda a viagem (enquanto não houver NAT, tema de outro módulo).\n2. Como B está em outra rede, A não entrega direto a B. Ele coloca o pacote em um quadro com **MAC de destino do roteador R** e envia.\n3. R recebe, olha o IP de destino, decide a saída e **reescreve o quadro**: novo MAC de origem (o dele) e novo MAC de destino (o de B).\n4. B recebe o quadro, confere que o MAC é o seu e sobe o pacote, que ainda traz os IPs originais de A e B.\n\nRepare no padrão: o par de IPs é fim a fim e constante; o par de MACs é reescrito a cada salto. O MAC responde \"para quem entrego agora?\"; o IP responde \"qual é o destino final?\"."
                    },
                    {
                        "type": "code",
                        "value": "$ ip addr show eth0\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 ...\n    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff\n    inet 192.168.0.20/24 brd 192.168.0.255 scope global eth0\n\n# link/ether -> o endereco MAC, gravado na placa (camada 2)\n# inet       -> o endereco IP, configurado nesta rede (camada 3)"
                    },
                    {
                        "type": "quote",
                        "value": "O MAC é físico, da camada 2, gravado na placa e válido só dentro da LAN; o IP é lógico, da camada 3, configurável e roteável entre redes. No caminho de um pacote, os IPs de origem e destino permanecem fim a fim, enquanto os MACs são reescritos a cada salto."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual endereço é físico, vem gravado na placa de rede e pertence à camada 2?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O endereço IP.",
                                "isCorrect": false
                            },
                            {
                                "text": "O endereço MAC.",
                                "isCorrect": true
                            },
                            {
                                "text": "O gateway padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "A máscara de sub-rede.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um mesmo notebook recebe um endereço em casa e outro no escritório. Que tipo de endereço tem esse comportamento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O MAC, que muda conforme o local onde a máquina se conecta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O IP, que é lógico e configurável por rede.",
                                "isCorrect": true
                            },
                            {
                                "text": "O MAC, atribuído automaticamente pelo DHCP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum, pois ambos são fixos de fábrica.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pacote sai do host A e chega ao host B, em outra rede, passando por um roteador. O que acontece com os endereços no trajeto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Tanto os IPs quanto os MACs são reescritos em todo salto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os MACs se mantêm; os IPs são reescritos a cada salto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os IPs se mantêm; os MACs são reescritos a cada salto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada muda: os quatro endereços chegam idênticos a B.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o endereço MAC, sozinho, não serve para entregar um pacote a uma máquina em outra rede?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque possui apenas 32 bits, número insuficiente para rotear.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque é plano e não indica em que rede o destino está.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque muda toda vez que o host é reiniciado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque somente o roteador possui um endereço MAC.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao rodar `ip addr`, você vê `link/ether 00:1a:2b:3c:4d:5e` e `inet 10.0.5.12/24` na mesma interface. O que cada linha representa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ambas mostram o mesmo endereço, apenas em formatos diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "link/ether é o IP interno; inet é o IP público.",
                                "isCorrect": false
                            },
                            {
                                "text": "link/ether é o MAC (camada 2); inet é o IP (camada 3).",
                                "isCorrect": true
                            },
                            {
                                "text": "link/ether é o gateway; inet é o endereço do host.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tabela de rotas e gateway",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tabela de rotas e gateway\n\nQuando um host ou um roteador precisa enviar um pacote, ele enfrenta uma pergunta simples: por qual interface e para qual próximo salto mando isto? A resposta vem da **tabela de rotas**, a lista de destinos conhecidos e de como alcançar cada um. A decisão é determinística: o sistema compara o IP de destino com as rotas e escolhe a que melhor se encaixa.\n\n## Local ou remoto: a primeira decisão\n\nO host começa verificando se o destino está **na mesma sub-rede** que ele, usando a máscara de rede.\n\n- **Destino local** (mesma sub-rede): entrega **direta**, dentro da LAN, sem roteador. O host resolve o MAC do destino (via ARP, aula 4) e envia o quadro.\n- **Destino remoto** (outra sub-rede): o host não alcança aquela rede sozinho e repassa o pacote ao **gateway**, o roteador que leva o tráfego adiante.\n\nRede local se resolve na própria LAN; todo o resto vai para o gateway."
                    },
                    {
                        "type": "text",
                        "value": "## O gateway padrão e a rota default\n\nO **gateway padrão** (default gateway) é o endereço para onde o host manda tudo o que **não** é local. Na tabela de rotas, ele aparece como a **rota default**, escrita como `0.0.0.0/0`.\n\nEsse `/0` significa \"qualquer destino\": é a rota mais genérica possível, a que casa com todo IP. Funciona como uma cláusula \"para todo o resto, use este caminho\". Sem uma rota default, um host só fala com as redes que conhece explicitamente; com ela, alcança a internet inteira por um único caminho de saída.\n\nEm um servidor, é comum haver poucas rotas: as das redes diretamente conectadas e a rota default apontando para o roteador da rede."
                    },
                    {
                        "type": "code",
                        "value": "$ ip route\ndefault via 192.168.0.1 dev eth0\n192.168.0.0/24 dev eth0 proto kernel scope link src 192.168.0.20\n10.8.0.0/24 via 192.168.0.254 dev eth0\n\n# 1a linha: rota default (0.0.0.0/0) -> tudo que nao for local vai ao gateway .1\n# 2a linha: rede local diretamente conectada, entrega direta na LAN\n# 3a linha: rota especifica para 10.8.0.0/24 via outro roteador (.254)"
                    },
                    {
                        "type": "text",
                        "value": "## A regra da rota mais específica\n\nUm mesmo IP de destino pode casar com mais de uma rota da tabela. Quando isso acontece, vale a **rota mais específica**, ou seja, a de **prefixo mais longo** (o número maior depois da barra). Essa regra tem o nome de **longest prefix match**.\n\nVeja a tabela do exemplo anterior diante de um pacote para `10.8.0.5`:\n\n- A rota default `0.0.0.0/0` casa (ela casa com tudo), prefixo /0.\n- A rota `10.8.0.0/24` também casa, prefixo /24.\n\nComo /24 é mais específico que /0, o pacote segue pela rota `10.8.0.0/24`, e não pela default. A rota default é sempre a última escolha, o \"se nada mais casar\". É esse mecanismo que permite exceções: uma rota específica para uma rede parceira convive com a default que cobre todo o resto."
                    },
                    {
                        "type": "table",
                        "value": "[[\"IP de destino\", \"Rota escolhida\", \"Motivo\"], [\"192.168.0.20\", \"192.168.0.0/24\", \"Está na sub-rede local, entrega direta\"], [\"10.8.0.5\", \"10.8.0.0/24\", \"Prefixo mais longo que a default\"], [\"172.16.4.9\", \"0.0.0.0/0 (default)\", \"Nenhuma rota específica casa, vai ao gateway\"], [\"8.8.8.8\", \"0.0.0.0/0 (default)\", \"Destino externo, segue pela rota default\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O host compara o IP de destino com a tabela de rotas: se o destino é local, entrega direto na LAN; se não, manda para o gateway pela rota default 0.0.0.0/0. Quando mais de uma rota casa, vale a mais específica, a de prefixo mais longo (longest prefix match)."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que representa o gateway padrão (rota default 0.0.0.0/0) na tabela de rotas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O caminho para todo destino que não é local.",
                                "isCorrect": true
                            },
                            {
                                "text": "A rota usada apenas para a própria sub-rede local.",
                                "isCorrect": false
                            },
                            {
                                "text": "O endereço MAC do switch da LAN.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor DNS configurado no host.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois servidores estão na mesma sub-rede. Como um envia um pacote ao outro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sempre pelo gateway padrão, que repassa à LAN.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pelo roteador, que reescreve os IPs no caminho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Direto na LAN, sem passar pelo gateway.",
                                "isCorrect": true
                            },
                            {
                                "text": "Por broadcast para todas as redes vizinhas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela tem as rotas `0.0.0.0/0` e `10.8.0.0/24`. Um pacote vai para `10.8.0.5`. Qual rota é usada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A 0.0.0.0/0, por ser a rota padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas em paralelo, para dar redundância.",
                                "isCorrect": false
                            },
                            {
                                "text": "A 10.8.0.0/24, por ser a mais específica.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma: o pacote é descartado por ambiguidade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um servidor tem apenas as rotas das redes diretamente conectadas, sem rota default. O que acontece ao acessar um IP na internet?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Funciona, pois toda placa tem rota default de fábrica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falha, porque não há caminho para destinos externos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Funciona, pois o switch encontra o caminho externo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O host cria uma rota default automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um servidor deve mandar o tráfego de `10.20.0.0/16` por um túnel VPN e todo o resto pela internet. Como as rotas convivem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A default precisa ser removida para a VPN funcionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "A rota /16 cobre a VPN; a default cobre o restante.",
                                "isCorrect": true
                            },
                            {
                                "text": "As duas conflitam e só uma pode existir por vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "O host alterna entre elas a cada pacote, em rodízio.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "ARP",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# ARP\n\nAs aulas anteriores fixaram dois fatos: dentro da LAN, a entrega acontece por **endereço MAC** (camada 2); e o host decide o próximo salto por **endereço IP** (camada 3). Isso deixa uma lacuna. O host sabe o **IP** de quem deve receber o quadro a seguir (o destino local ou o gateway), mas para montar o quadro ele precisa do **MAC** correspondente. Como descobrir o MAC a partir do IP?\n\nQuem resolve isso é o **ARP** (Address Resolution Protocol). Ele traduz um **IP conhecido** no **MAC** que está por trás dele, dentro da mesma LAN."
                    },
                    {
                        "type": "text",
                        "value": "## Como o ARP funciona\n\nO ARP resolve o MAC com uma pergunta e uma resposta, ambas dentro do segmento local:\n\n1. **ARP request** (pergunta): o host envia um **broadcast** para toda a LAN: \"quem tem o IP `192.168.0.1`? me diga o seu MAC\". Por ser broadcast, todos na rede recebem.\n2. **ARP reply** (resposta): apenas o dono daquele IP responde, e o faz em **unicast**, direto ao perguntador: \"o `192.168.0.1` está no MAC `00:1a:2b:3c:4d:5e`\".\n\nCom o MAC em mãos, o host monta o quadro e envia o pacote. O ARP age só na camada 2, entre vizinhos do mesmo segmento, e não atravessa roteadores. Isso leva a um ponto que confunde muita gente, detalhado na tabela abaixo: para um destino em outra rede, o host resolve o MAC do **gateway**, não o do destino final."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Destino do pacote\", \"IP resolvido pelo ARP\", \"Para quem vai o quadro\"], [\"Mesma LAN (local)\", \"O próprio IP de destino\", \"Direto ao host de destino\"], [\"Outra rede (remoto)\", \"O IP do gateway\", \"Ao roteador, que segue o roteamento\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A tabela ARP (cache)\n\nSeria um desperdício perguntar de novo a cada pacote. Por isso o host guarda o que aprende em uma **tabela ARP**, também chamada de **cache ARP**: um mapa de IP para MAC dos vizinhos com quem falou há pouco.\n\nAntes de emitir um ARP request, o host consulta o cache. Se o IP já está lá, usa o MAC guardado na hora. As entradas **expiram** depois de um tempo, para acompanhar mudanças na rede (uma placa trocada, um IP que passou para outra máquina). É um equilíbrio entre eficiência e manter a informação atualizada."
                    },
                    {
                        "type": "code",
                        "value": "$ ip neigh\n192.168.0.1 dev eth0 lladdr 00:1a:2b:3c:4d:5e REACHABLE\n192.168.0.35 dev eth0 lladdr 00:1a:2b:aa:bb:cc STALE\n\n# cada linha: um IP vizinho -> o MAC aprendido (lladdr) -> o estado da entrada\n# REACHABLE: recem-confirmada  |  STALE: valida, porem antiga (pode revalidar)"
                    },
                    {
                        "type": "quote",
                        "value": "Dentro da LAN a entrega é por MAC, mas o host decide pelo IP; o ARP fecha essa lacuna resolvendo IP para MAC. A pergunta vai em broadcast (request) e a resposta volta em unicast (reply), com o resultado guardado no cache ARP. Para um destino remoto, o host resolve o MAC do gateway, nunca o do destino final."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para que serve o ARP dentro de uma LAN?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Descobrir o MAC correspondente a um IP conhecido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Descobrir o IP correspondente a um MAC conhecido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Traduzir nomes de domínio em endereços IP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher a melhor rota entre duas redes distintas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como um host pergunta \"quem tem este IP?\" para descobrir o MAC correspondente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pergunta ao switch, que já conhece todos os IPs da rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "Envia um ARP request em broadcast para a LAN.",
                                "isCorrect": true
                            },
                            {
                                "text": "Envia um ARP request em unicast ao gateway.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consulta o servidor DNS da rede.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Após um ARP request, quem responde e de que forma?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Todos os hosts da LAN respondem, cada um em unicast.",
                                "isCorrect": false
                            },
                            {
                                "text": "O switch, em broadcast para toda a rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o dono do IP, em unicast ao perguntador.",
                                "isCorrect": true
                            },
                            {
                                "text": "O gateway, sempre, independentemente do IP.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o host mantém uma tabela ARP (cache) em vez de perguntar a cada pacote?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Para armazenar as rotas que foram aprendidas com o gateway.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para reusar o MAC já aprendido e evitar broadcasts.",
                                "isCorrect": true
                            },
                            {
                                "text": "Para traduzir nomes em IPs mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o switch exige um cache em cada host.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um host acessa um servidor na internet. De qual MAC ele precisa para montar o quadro de saída?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O MAC do servidor de destino na internet.",
                                "isCorrect": false
                            },
                            {
                                "text": "O MAC do gateway, o próximo salto na LAN.",
                                "isCorrect": true
                            },
                            {
                                "text": "O MAC do servidor DNS que resolveu o nome.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum: tráfego externo dispensa endereço MAC.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "VLAN (conceito)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# VLAN (conceito)\n\nUm switch, sozinho, coloca todas as suas portas em uma **única LAN** e, como visto na aula 1, em um **único domínio de broadcast**. Em uma rede pequena isso funciona. Conforme ela cresce, juntar tudo no mesmo segmento traz problemas: broadcast demais competindo pela banda, e nenhum isolamento entre grupos que deveriam ficar separados (produção e desenvolvimento, servidores e visitantes).\n\nA saída clássica seria comprar um switch para cada grupo. A **VLAN** (Virtual LAN) resolve o mesmo problema sem hardware extra: ela **segmenta logicamente** um único switch em várias LANs independentes."
                    },
                    {
                        "type": "text",
                        "value": "## Uma LAN lógica dentro do switch\n\nCom VLANs, você agrupa portas do switch em redes separadas por configuração, não por fiação. As portas da VLAN 10 formam uma LAN; as da VLAN 20 formam outra; e o mesmo switch físico atende as duas sem que elas se enxerguem.\n\nDuas consequências diretas:\n\n- **Cada VLAN é um domínio de broadcast próprio.** Um broadcast disparado na VLAN 10 fica na VLAN 10; a VLAN 20 nem toma conhecimento. Foi assim que dividimos o domínio de broadcast sem um roteador por segmento.\n- **VLANs não se falam sozinhas.** Como são redes distintas (camada 3), o tráfego de uma VLAN para outra precisa passar por um **roteador** (ou por um switch de camada 3). Sem esse roteamento, ficam isoladas, o que muitas vezes é justamente o objetivo."
                    },
                    {
                        "type": "text",
                        "value": "## A marcação 802.1Q: como o tráfego se mantém separado\n\nDentro de um switch, separar as portas basta. Mas e quando duas VLANs precisam atravessar **o mesmo cabo** entre dois switches? É aí que entra o padrão **802.1Q**.\n\nO 802.1Q insere uma pequena **marcação** (tag) no quadro Ethernet, contendo o **VLAN ID** (o número da VLAN, de 12 bits, até 4094 valores úteis). Com a tag, o switch do outro lado sabe a qual VLAN aquele quadro pertence. Daí surgem dois tipos de porta:\n\n- **Porta de acesso** (access): pertence a **uma** VLAN e troca quadros **sem tag** com o dispositivo final (um servidor não sabe o que é VLAN).\n- **Porta de tronco** (trunk): transporta **várias** VLANs pelo mesmo enlace, usando a **tag** 802.1Q para não misturar o tráfego.\n\nO dispositivo final nunca vê a tag: ela existe só entre switches, para manter as VLANs separadas enquanto dividem a mesma infraestrutura."
                    },
                    {
                        "type": "code",
                        "value": "Quadro Ethernet SEM tag (porta de acesso):\n [ MAC destino | MAC origem | tipo | dados | FCS ]\n\nQuadro Ethernet COM tag 802.1Q (porta de tronco):\n [ MAC destino | MAC origem | TAG 802.1Q | tipo | dados | FCS ]\n                              |__ VLAN ID (ex.: 10)\n\nA tag entra entre o MAC de origem e o campo de tipo, carregando o VLAN ID."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conceito\", \"Porta de acesso\", \"Porta de tronco (trunk)\"], [\"VLANs que carrega\", \"Uma\", \"Várias\"], [\"Quadros\", \"Sem tag\", \"Com tag 802.1Q\"], [\"Liga-se a\", \"Dispositivo final (servidor, PC)\", \"Outro switch ou roteador\"], [\"Enxerga a VLAN?\", \"Não, é transparente ao host\", \"Sim, usa o VLAN ID\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A VLAN segmenta logicamente um mesmo switch em várias LANs independentes, e cada VLAN vira um domínio de broadcast separado, sem hardware extra. O tráfego entre VLANs exige um roteador. O padrão 802.1Q marca o quadro com o VLAN ID para levar várias VLANs pelo mesmo enlace (tronco), enquanto as portas de acesso entregam quadros sem tag aos dispositivos finais."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que uma VLAN permite fazer em um único switch?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Segmentar a LAN em redes lógicas separadas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a velocidade das portas físicas do switch.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter endereços MAC em endereços IP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rotear pacotes entre redes diferentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um broadcast é enviado por um host na VLAN 10. Quem o recebe?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Todos os hosts do switch, em qualquer VLAN.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas os hosts da VLAN 10.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas os hosts da VLAN 20.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente o gateway padrão da rede.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um host da VLAN 10 precisa se comunicar com um host da VLAN 20. O que é necessário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Apenas configurar as duas portas de acesso na mesma VLAN.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um roteador ou switch de camada 3 entre as VLANs.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada, pois estão no mesmo switch físico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um cabo direto ligando os dois hosts.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois switches precisam transportar as VLANs 10 e 20 pelo mesmo cabo entre eles. Que tipo de porta os liga?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porta de acesso, uma configurada para cada VLAN transportada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porta de tronco, que marca os quadros com 802.1Q.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porta de acesso, que envia tudo sem marcação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Qualquer porta, pois a VLAN viaja no endereço IP.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um servidor está ligado a uma porta de acesso na VLAN 30. Que quadros ele recebe do switch?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Quadros de todas as VLANs que estão configuradas no switch.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quadros sem tag; a marcação fica só entre switches.",
                                "isCorrect": true
                            },
                            {
                                "text": "Quadros com a tag 802.1Q da VLAN 30.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente broadcasts, filtrados por VLAN ID.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Camada de transporte e portas",
        "aulas": [
            {
                "titulo": "TCP x UDP",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A camada de transporte\n\nA camada de rede, com o IP, sabe levar um pacote de um host a outro pela internet. Mas um host raramente roda um serviço só: ao mesmo tempo pode ter um servidor web, um SSH e um banco no ar. Chegar à máquina certa não basta; é preciso entregar os dados ao processo certo. Esse é o trabalho da camada de transporte.\n\nDois protocolos dominam essa camada, e a diferença entre eles guia boa parte das decisões de rede no dia a dia. O TCP entrega com garantias, cuidando para que nada se perca e tudo chegue em ordem. O UDP entrega sem garantias, trocando segurança por velocidade e simplicidade. Entender quando cada um faz sentido evita escolhas erradas em APIs, DNS, streaming e muito mais."
                    },
                    {
                        "type": "text",
                        "value": "## TCP: orientado a conexão e confiável\n\nO TCP (Transmission Control Protocol) é orientado a conexão: antes de mandar qualquer dado, os dois lados abrem uma conexão e combinam que estão prontos para conversar. A partir daí, o TCP se responsabiliza pela entrega. Ele numera os dados, confirma o que chega, reenvia o que se perde e monta tudo de volta na ordem em que saiu.\n\nO resultado é um canal confiável: se um trecho some no caminho, o TCP percebe e reenvia, e a aplicação recebe o fluxo íntegro e ordenado, sem precisar tratar perdas por conta própria. Esse cuidado tem um custo. A abertura da conexão e as confirmações adicionam etapas e um cabeçalho maior, o que pesa um pouco na latência e no overhead. Para quem transfere um arquivo ou carrega uma página, o preço vale a pena: melhor esperar um instante do que receber dados corrompidos ou faltando."
                    },
                    {
                        "type": "text",
                        "value": "## UDP: sem conexão e rápido\n\nO UDP (User Datagram Protocol) segue a filosofia oposta. Ele é sem conexão: não há abertura nem combinação prévia, o remetente simplesmente dispara os datagramas ao destino. Também não há confirmação, nem numeração, nem reenvio. Se um datagrama se perde, ele se perde, e cabe à aplicação decidir se refaz o pedido ou apenas segue em frente.\n\nEssa simplicidade é justamente a vantagem: menos etapas e um cabeçalho enxuto significam menos atraso. Por isso o UDP brilha onde velocidade importa mais que perfeição. O DNS usa UDP porque uma consulta é curta e refazê-la é barato. Streaming de áudio e vídeo e chamadas de voz preferem UDP porque um quadro atrasado é inútil: melhor pular do que travar esperando o reenvio. Jogos online seguem a mesma lógica, priorizando a resposta imediata. Já web, transferência de arquivos, e-mail e SSH ficam com o TCP, porque ali cada byte conta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"TCP\", \"UDP\"], [\"Conexão\", \"Orientado a conexão, com handshake\", \"Sem conexão, envia direto\"], [\"Entrega\", \"Garantida, confirma e retransmite\", \"Sem garantia, perda não volta\"], [\"Ordem\", \"Entrega os dados em ordem\", \"Sem ordem garantida\"], [\"Velocidade e overhead\", \"Mais lento, cabeçalho maior\", \"Mais rápido, cabeçalho enxuto\"], [\"Uso típico\", \"Web, arquivos, e-mail, SSH\", \"DNS, streaming, voz, jogos\"]]"
                    },
                    {
                        "type": "code",
                        "value": "$ ss -tuln\nNetid  State    Local Address:Port\ntcp    LISTEN   0.0.0.0:443          # HTTPS: web sobre TCP\ntcp    LISTEN   0.0.0.0:22           # SSH sobre TCP\nudp    UNCONN   0.0.0.0:53           # DNS sobre UDP"
                    },
                    {
                        "type": "quote",
                        "value": "TCP troca um pouco de velocidade por garantia; UDP troca garantia por velocidade. A escolha depende do que dói mais na sua aplicação: perder dados ou esperar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe precisa transferir um arquivo grande em que todos os bytes devem chegar íntegros e na ordem certa. Qual protocolo de transporte atende esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "TCP",
                                "isCorrect": true
                            },
                            {
                                "text": "UDP",
                                "isCorrect": false
                            },
                            {
                                "text": "ICMP",
                                "isCorrect": false
                            },
                            {
                                "text": "ARP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual protocolo de transporte envia os dados sem estabelecer conexão antes, sem handshake?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "UDP",
                                "isCorrect": true
                            },
                            {
                                "text": "TCP",
                                "isCorrect": false
                            },
                            {
                                "text": "HTTP",
                                "isCorrect": false
                            },
                            {
                                "text": "TLS",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta de DNS é uma pergunta curta que espera resposta rápida, e uma eventual perda pode ser refeita pela aplicação. Que protocolo atende tradicionalmente esse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "UDP",
                                "isCorrect": true
                            },
                            {
                                "text": "TCP",
                                "isCorrect": false
                            },
                            {
                                "text": "SMTP",
                                "isCorrect": false
                            },
                            {
                                "text": "FTP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa transmissão de vídeo ao vivo, um quadro perdido é melhor descartado do que reenviado com atraso. Qual característica do UDP combina com isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele não retransmite pacotes perdidos",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele confirma o recebimento de cada pacote",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele garante a ordem dos pacotes",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele abre conexão antes de enviar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor sugere usar UDP numa API de pagamentos porque 'é mais rápido'. Qual correção está certa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A API precisa de TCP, que garante entrega e ordem",
                                "isCorrect": true
                            },
                            {
                                "text": "UDP serve porque a velocidade é o que mais importa",
                                "isCorrect": false
                            },
                            {
                                "text": "Tanto faz, os dois garantem a entrega dos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "UDP também confirma e reenvia os pacotes perdidos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O three-way handshake",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que abrir uma conexão\n\nComo o TCP é orientado a conexão, ele não sai enviando dados de imediato. Primeiro, os dois lados precisam concordar que vão conversar e trocar algumas informações iniciais. Essa abertura acontece em três mensagens, o que dá nome ao processo: three-way handshake, ou aperto de mão em três vias.\n\nO objetivo é duplo. De um lado, confirmar que cliente e servidor estão vivos e dispostos a estabelecer a conexão. De outro, sincronizar os números de sequência iniciais de cada lado, os valores que o TCP usará depois para numerar e confirmar os dados. Sem esse acerto inicial, não haveria como garantir a entrega ordenada que o TCP promete."
                    },
                    {
                        "type": "text",
                        "value": "## SYN, SYN-ACK e ACK\n\nOs três passos acontecem sempre nesta ordem. No primeiro, o cliente envia um segmento com a flag SYN (de synchronize), anunciando que quer abrir a conexão e informando seu número de sequência inicial. É o pedido de conexão.\n\nNo segundo, o servidor responde com SYN-ACK, um único segmento que junta duas coisas: o ACK confirma o SYN que ele recebeu do cliente, e o SYN carrega o número de sequência inicial do próprio servidor. É como dizer 'recebi o seu, e aqui vai o meu'. No terceiro, o cliente devolve um ACK confirmando o número do servidor. Terminado esse ACK, a conexão está estabelecida e os dados começam a fluir. Repare que só o primeiro e o último partem do cliente; o do meio é a resposta combinada do servidor."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Passo\", \"Quem envia\", \"Flag\", \"Significado\"], [\"1\", \"Cliente\", \"SYN\", \"Pede a conexão e envia seu número inicial\"], [\"2\", \"Servidor\", \"SYN-ACK\", \"Confirma o do cliente e envia o seu número\"], [\"3\", \"Cliente\", \"ACK\", \"Confirma o número do servidor; conexão aberta\"]]"
                    },
                    {
                        "type": "code",
                        "value": "$ tcpdump -n 'tcp port 80'\nIP 10.0.0.5.51514 > 10.0.0.9.80: Flags [S], seq 1000               # SYN\nIP 10.0.0.9.80 > 10.0.0.5.51514: Flags [S.], seq 5000, ack 1001    # SYN-ACK\nIP 10.0.0.5.51514 > 10.0.0.9.80: Flags [.], ack 5001               # ACK"
                    },
                    {
                        "type": "text",
                        "value": "## O encerramento com FIN\n\nAbrir a conexão custa três mensagens; fechá-la de forma ordenada usa a flag FIN (de finish). Quando um lado termina de enviar, manda um FIN dizendo 'não tenho mais dados', e o outro confirma com um ACK. Como uma conexão TCP tem dois sentidos independentes, o outro lado faz o mesmo quando ele também acaba: envia seu FIN e recebe o ACK correspondente. Por isso o fechamento educado costuma mostrar dois FIN, um de cada direção.\n\nExiste ainda um encerramento abrupto, com a flag RST (reset), que corta a conexão na hora, sem essa despedida. Ele aparece quando algo dá errado, por exemplo ao tentar falar numa porta onde não há ninguém escutando. O RST derruba a conexão de imediato, enquanto o FIN a encerra com calma, deixando cada lado terminar o que estava enviando."
                    },
                    {
                        "type": "quote",
                        "value": "A conexão TCP abre em três passos e sempre na mesma ordem: SYN do cliente, SYN-ACK do servidor, ACK do cliente. Só depois desse último ACK os dados começam a trafegar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a ordem correta das mensagens no three-way handshake do TCP?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SYN, SYN-ACK, ACK",
                                "isCorrect": true
                            },
                            {
                                "text": "ACK, SYN, SYN-ACK",
                                "isCorrect": false
                            },
                            {
                                "text": "SYN, ACK, SYN-ACK",
                                "isCorrect": false
                            },
                            {
                                "text": "SYN-ACK, SYN, ACK",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para iniciar uma conexão TCP, qual segmento o cliente envia primeiro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SYN",
                                "isCorrect": true
                            },
                            {
                                "text": "ACK",
                                "isCorrect": false
                            },
                            {
                                "text": "FIN",
                                "isCorrect": false
                            },
                            {
                                "text": "RST",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um servidor recebe um SYN de um cliente e decide aceitar a conexão. O que ele envia de volta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SYN-ACK",
                                "isCorrect": true
                            },
                            {
                                "text": "Só um ACK",
                                "isCorrect": false
                            },
                            {
                                "text": "Outro SYN sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Um FIN",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No tcpdump aparecem, em sequência, os flags [S], depois [S.] e depois [.]. O que está acontecendo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma conexão TCP sendo estabelecida",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma conexão TCP sendo encerrada",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma retransmissão por perda de pacote",
                                "isCorrect": false
                            },
                            {
                                "text": "Um envio de dados por UDP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No encerramento ordenado de uma conexão TCP costumam aparecer dois FIN, um de cada lado. Por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cada sentido da conexão é fechado de forma independente",
                                "isCorrect": true
                            },
                            {
                                "text": "O primeiro FIN quase sempre se perde e precisa ser reenviado",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor exige dois FIN separados para confirmar o fim",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada FIN abre uma nova conexão paralela para os dados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Portas e sockets",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A porta identifica o serviço\n\nO endereço IP leva o pacote até o host certo, mas ali dentro pode haver vários serviços no ar ao mesmo tempo. Falta dizer para qual deles a informação vai. Esse é o papel da porta: um número de 16 bits, de 0 a 65535, que identifica o serviço ou a aplicação dentro do host.\n\nQuando um pacote chega, o sistema olha a porta de destino para decidir qual processo deve recebê-lo. Um pedido para a porta 443 vai para o servidor web; um para a 22, para o SSH. É a porta que permite a uma única máquina, com um único IP, oferecer muitos serviços sem que eles se confundam."
                    },
                    {
                        "type": "text",
                        "value": "## O socket: IP mais porta\n\nJuntar o endereço IP e a porta forma um socket, escrito como IP:porta, por exemplo 10.0.0.9:443. O socket identifica uma ponta da comunicação: um lugar específico, um serviço específico, num host específico. Um servidor abre um socket e fica escutando ali, à espera de quem queira se conectar.\n\nMas um socket sozinho não descreve uma conversa inteira, apenas uma das pontas. Uma conexão TCP é definida pelo par de sockets: o socket de origem, do cliente, e o socket de destino, do servidor. Somado ao protocolo, esse par é o que torna cada conexão única e distinguível de todas as outras que passam pela mesma máquina."
                    },
                    {
                        "type": "text",
                        "value": "## Portas de serviço e portas efêmeras\n\nAs duas pontas usam a porta de um jeito diferente. O servidor escuta numa porta fixa e conhecida, a porta de serviço, escolhida para que os clientes saibam onde encontrá-lo: 443 para HTTPS, 22 para SSH. Ela não muda de um cliente para outro.\n\nDo lado do cliente não faz sentido fixar uma porta. Para cada conexão, o sistema operacional escolhe uma porta temporária e livre, a porta efêmera, geralmente de um intervalo alto (no Linux, por padrão, algo em torno de 32768 a 60999). Quando a conexão termina, essa porta é liberada e pode ser reaproveitada. É esse detalhe que explica como um servidor na porta 443 atende milhares de clientes ao mesmo tempo: cada conexão tem um socket de origem diferente, então cada par de sockets é único, mesmo todos apontando para a mesma porta 443 do servidor."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Elemento\", \"Exemplo\", \"Papel\"], [\"IP de origem\", \"10.0.0.5\", \"Host do cliente\"], [\"Porta de origem\", \"51514\", \"Porta efêmera do cliente\"], [\"IP de destino\", \"10.0.0.9\", \"Host do servidor\"], [\"Porta de destino\", \"443\", \"Porta de serviço (HTTPS)\"]]"
                    },
                    {
                        "type": "code",
                        "value": "$ ss -tn\nState   Local Address:Port    Peer Address:Port\nESTAB   10.0.0.5:51514        10.0.0.9:443       # porta efemera 51514 -> servico 443\nESTAB   10.0.0.5:38220        10.0.0.9:443       # outra conexao ao mesmo servico\nESTAB   10.0.0.5:44907        10.0.0.7:22        # conexao SSH, porta 22"
                    },
                    {
                        "type": "quote",
                        "value": "A porta diz qual serviço; o socket é IP mais porta; e a conexão só fica definida pelo par de sockets, o da origem e o do destino."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um servidor roda web, SSH e um banco ao mesmo tempo. O que o número de porta identifica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Qual serviço deve receber os dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Para qual host o pacote foi enviado",
                                "isCorrect": false
                            },
                            {
                                "text": "Qual caminho o pacote seguiu na rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Qual placa de rede foi usada no envio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é um socket na camada de transporte?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A combinação de IP e porta",
                                "isCorrect": true
                            },
                            {
                                "text": "O número de sequência do TCP",
                                "isCorrect": false
                            },
                            {
                                "text": "O endereço físico da placa (MAC)",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do host no DNS",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um servidor web atende milhares de clientes, todos na porta 443. Como o sistema distingue uma conexão da outra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pelo par de sockets de origem e destino",
                                "isCorrect": true
                            },
                            {
                                "text": "Pela porta 443, que é diferente em cada cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Pelo nome de domínio informado pelo cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Pelo endereço MAC da placa de cada cliente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao abrir uma conexão, que tipo de porta o cliente costuma usar como origem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma porta efêmera dada pelo sistema",
                                "isCorrect": true
                            },
                            {
                                "text": "A mesma porta de serviço do servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre a porta 80, fixa",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma porta, apenas o IP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando também o protocolo, o que define de forma única uma conexão TCP?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O par de sockets de origem e destino",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas a porta de destino do servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o endereço IP do servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas a porta efêmera do cliente",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Portas conhecidas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Portas padrão: uma convenção útil\n\nSe cada serviço escutasse numa porta qualquer, ninguém saberia onde encontrá-lo. Para resolver isso, os serviços mais comuns têm portas padrão, definidas por convenção e mantidas pela IANA. São as portas conhecidas, na faixa de 0 a 1023, onde vivem os serviços clássicos da internet.\n\nGraças a esse acordo, o cliente não precisa perguntar em que porta está o serviço: ele assume o padrão. Ao digitar um endereço https, o navegador vai direto à porta 443; um cliente SSH tenta a 22 sem que você diga. Um serviço até pode rodar numa porta diferente da padrão, mas aí é preciso informar os clientes explicitamente, indicando a porta na configuração ou no comando."
                    },
                    {
                        "type": "text",
                        "value": "## As portas mais comuns\n\nAlgumas portas aparecem o tempo todo no trabalho com redes e merecem estar na ponta da língua. A 22 é do SSH, o acesso remoto seguro ao shell. A 25 é do SMTP, usada no envio de e-mail entre servidores. A 53 é do DNS, que traduz nomes em endereços IP; ela costuma usar UDP nas consultas do dia a dia e recorre ao TCP quando a resposta é grande demais ou numa transferência de zona.\n\nNa web, a 80 é do HTTP, o tráfego sem criptografia, e a 443 é do HTTPS, o mesmo tráfego protegido por TLS. Hoje quase todo site usa a 443, e é comum a 80 apenas redirecionar o visitante para ela. Saber essas associações de cor agiliza muita coisa: liberar a porta certa no firewall, entender o que um scan de portas encontrou ou descobrir por que um serviço não responde."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Porta\", \"Serviço\", \"Para que serve\", \"Transporte\"], [\"22\", \"SSH\", \"Acesso remoto seguro ao shell\", \"TCP\"], [\"25\", \"SMTP\", \"Envio de e-mail entre servidores\", \"TCP\"], [\"53\", \"DNS\", \"Resolve nomes em endereços IP\", \"UDP e TCP\"], [\"80\", \"HTTP\", \"Web sem criptografia\", \"TCP\"], [\"443\", \"HTTPS\", \"Web com criptografia (TLS)\", \"TCP\"]]"
                    },
                    {
                        "type": "code",
                        "value": "$ grep -wE 'ssh|smtp|domain|http|https' /etc/services\nssh        22/tcp\nsmtp       25/tcp\ndomain     53/udp     # DNS\ndomain     53/tcp     # DNS\nhttp       80/tcp\nhttps      443/tcp"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa no dia a dia\n\nConhecer as portas padrão é operação básica de infraestrutura. Regras de firewall e grupos de segurança liberam ou bloqueiam justamente por número de porta: abrir a 443 para o mundo, mas manter a 22 restrita a poucos endereços, é uma decisão de segurança comum. Quando um serviço não responde, uma das primeiras perguntas é se a porta certa está aberta e escutando.\n\nAcima das portas conhecidas (0 a 1023) existem as portas registradas e, mais acima, a faixa dinâmica de onde saem as portas efêmeras dos clientes. Nem todo serviço fica na porta padrão: bancos de dados e aplicações internas costumam usar portas próprias, e um mesmo software pode ser configurado para escutar noutra porta. Por isso, mais do que decorar, vale saber checar: ferramentas como ss e nc mostram o que está escutando e se a porta responde."
                    },
                    {
                        "type": "quote",
                        "value": "As portas padrão são um acordo para que o cliente ache o serviço sem perguntar: 22 é SSH, 53 é DNS, 80 é HTTP, 443 é HTTPS, 25 é SMTP."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a porta padrão do HTTPS?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "443",
                                "isCorrect": true
                            },
                            {
                                "text": "80",
                                "isCorrect": false
                            },
                            {
                                "text": "22",
                                "isCorrect": false
                            },
                            {
                                "text": "25",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O SSH, para acesso remoto ao shell, escuta por padrão em qual porta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "22",
                                "isCorrect": true
                            },
                            {
                                "text": "53",
                                "isCorrect": false
                            },
                            {
                                "text": "80",
                                "isCorrect": false
                            },
                            {
                                "text": "443",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um servidor recebe consultas de resolução de nomes na porta 53. Que serviço é esse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "DNS",
                                "isCorrect": true
                            },
                            {
                                "text": "SMTP",
                                "isCorrect": false
                            },
                            {
                                "text": "HTTP",
                                "isCorrect": false
                            },
                            {
                                "text": "SSH",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa liberar no firewall o tráfego de um site em HTTPS. Qual porta deve abrir?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "443",
                                "isCorrect": true
                            },
                            {
                                "text": "80",
                                "isCorrect": false
                            },
                            {
                                "text": "8080",
                                "isCorrect": false
                            },
                            {
                                "text": "22",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No firewall aparece tráfego de saída na porta 25. A que serviço ela corresponde por padrão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SMTP, envio de e-mail",
                                "isCorrect": true
                            },
                            {
                                "text": "DNS, resolução de nomes",
                                "isCorrect": false
                            },
                            {
                                "text": "HTTP, tráfego web",
                                "isCorrect": false
                            },
                            {
                                "text": "SSH, acesso remoto",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A confiabilidade do TCP",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Numerar e confirmar cada byte\n\nO TCP promete algo forte: entregar todos os bytes, íntegros e na ordem em que saíram, mesmo sobre uma rede que perde e embaralha pacotes. Ele cumpre isso com poucos mecanismos que trabalham juntos, e o primeiro deles é numerar tudo.\n\nCada byte que o TCP envia recebe um número de sequência, que marca sua posição no fluxo de dados. Ao receber os dados, o outro lado responde com uma confirmação, o ACK, informando qual o próximo byte que espera, ou seja, até onde já recebeu sem falhas. Assim o emissor sabe exatamente o que chegou. E como cada trecho carrega seu número, o receptor consegue remontar tudo na ordem certa mesmo que os segmentos cheguem fora de ordem: o que veio adiantado espera os que faltam."
                    },
                    {
                        "type": "text",
                        "value": "## Reenviar o que não foi confirmado\n\nNumerar e confirmar só valem de algo se o TCP fizer alguma coisa quando um ACK não chega. E faz: ao enviar um segmento, ele dispara um temporizador. Se a confirmação daquele trecho não voltar dentro do prazo, o TCP assume que o segmento se perdeu e o envia de novo. Esse reenvio é a retransmissão.\n\nHá ainda uma pista mais rápida de perda: se o emissor recebe vários ACKs repetidos pedindo sempre o mesmo byte, é sinal de que um segmento no meio do caminho sumiu, e ele retransmite sem esperar o temporizador estourar. De um jeito ou de outro, o dado perdido é reenviado até ser confirmado. É essa insistência que sustenta a garantia de entrega: nada é dado como recebido enquanto o ACK não chega."
                    },
                    {
                        "type": "code",
                        "value": "$ tcpdump -n 'tcp port 443'\nIP 10.0.0.5.51514 > 10.0.0.9.443: Flags [P.], seq 1:101, ack 1, win 64240     # envia os bytes 1 a 100\nIP 10.0.0.9.443 > 10.0.0.5.51514: Flags [.], ack 101, win 64240               # recebi ate 100, mande do 101\nIP 10.0.0.5.51514 > 10.0.0.9.443: Flags [P.], seq 101:201, ack 1, win 64240   # envia os bytes 101 a 200\nIP 10.0.0.5.51514 > 10.0.0.9.443: Flags [P.], seq 101:201, ack 1, win 64240   # sem ACK, retransmite o trecho"
                    },
                    {
                        "type": "text",
                        "value": "## A janela: o controle de fluxo\n\nFalta um problema: e se o emissor for muito mais rápido que o receptor? Sem freio, ele encheria a memória do outro lado e os dados acabariam descartados. Para evitar isso, todo ACK carrega também uma janela (window): o quanto de dados o receptor ainda consegue aceitar naquele momento, conforme o espaço livre no seu buffer.\n\nO emissor respeita esse limite e nunca deixa mais dados sem confirmação em trânsito do que a janela permite. Conforme o receptor processa o que chegou e libera espaço, ele anuncia uma janela maior, e o fluxo acelera; se está sobrecarregado, anuncia uma janela menor, e o emissor segura o ritmo. Esse ajuste contínuo é o controle de fluxo, que casa a velocidade do emissor com a capacidade do receptor. No tcpdump acima, é o campo win que mostra esse valor a cada segmento."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mecanismo\", \"O que faz\", \"O que garante\"], [\"Número de sequência\", \"Numera os bytes no fluxo\", \"Remontar os dados na ordem certa\"], [\"Confirmação (ACK)\", \"Avisa até onde os dados chegaram\", \"O emissor sabe o que foi entregue\"], [\"Retransmissão\", \"Reenvia o que não foi confirmado\", \"Nada se perde em definitivo\"], [\"Janela (window)\", \"Anuncia quanto o receptor aceita\", \"Não sobrecarregar o receptor\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Numerar os bytes, confirmar o que chega, reenviar o que falta e respeitar a janela do receptor: é a soma desses quatro mecanismos que torna o TCP confiável."
                    }
                ],
                "questions": [
                    {
                        "statement": "No TCP, o que a confirmação (ACK) informa ao emissor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Até onde os dados já chegaram",
                                "isCorrect": true
                            },
                            {
                                "text": "Qual a porta de destino usada",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantos saltos o pacote deu",
                                "isCorrect": false
                            },
                            {
                                "text": "Qual a velocidade da rede",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um segmento TCP se perde no caminho e o emissor não recebe o ACK dele. O que o TCP faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Retransmite o segmento",
                                "isCorrect": true
                            },
                            {
                                "text": "Ignora e segue adiante",
                                "isCorrect": false
                            },
                            {
                                "text": "Encerra a conexão na hora",
                                "isCorrect": false
                            },
                            {
                                "text": "Troca para o protocolo UDP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Alguns segmentos chegam fora de ordem ao receptor. O que permite remontá-los na sequência correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os números de sequência",
                                "isCorrect": true
                            },
                            {
                                "text": "Os números das portas",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho da janela",
                                "isCorrect": false
                            },
                            {
                                "text": "O endereço MAC de origem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve a janela (window) anunciada nos segmentos TCP?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Limitar o envio à capacidade do receptor",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir qual porta de serviço o destino usa",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher a rota mais curta na rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografar os dados em trânsito",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um receptor está sobrecarregado e passa a anunciar uma janela cada vez menor. Como o emissor reage?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reduz o volume de dados em trânsito",
                                "isCorrect": true
                            },
                            {
                                "text": "Acelera para esvaziar o buffer do receptor",
                                "isCorrect": false
                            },
                            {
                                "text": "Encerra a conexão e abre outra",
                                "isCorrect": false
                            },
                            {
                                "text": "Passa a enviar sem esperar ACK",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - DNS e resolução de nomes",
        "aulas": [
            {
                "titulo": "O que é o DNS",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O DNS traduz nomes em endereços\n\nQuando você digita `exemplo.com` no navegador, a máquina não sabe conversar com \"exemplo.com\". O que trafega na rede são endereços IP, como `203.0.113.10`. Alguém precisa descobrir qual IP responde por aquele nome antes de qualquer conexão acontecer. Esse trabalho é do DNS (Domain Name System), o sistema que traduz nomes legíveis por pessoas em endereços que as máquinas usam.\n\nCada acesso a um site, cada chamada de API e cada envio de e-mail começa com uma consulta de DNS silenciosa. Ela roda antes do primeiro pacote de dados e, na maioria das vezes, você nem percebe que aconteceu."
                    },
                    {
                        "type": "text",
                        "value": "## Por que não usar o IP direto\n\nSe no fim das contas a conexão usa o IP, por que não digitar o IP e pronto? Por dois motivos.\n\nPrimeiro, nomes são fáceis de lembrar e endereços não. `wikipedia.org` gruda na memória; um IPv6 como `2001:db8::8a2e:370:7334` não. Nomes também carregam significado e marca, o que um número nunca faz.\n\nSegundo, o IP por trás de um nome pode mudar sem aviso. O site pode trocar de servidor, migrar de provedor ou passar a responder por vários IPs para dividir carga. Enquanto o nome continua o mesmo, o dono do domínio ajusta para qual IP ele aponta, e quem acessa pelo nome nem fica sabendo da troca."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Lista telefônica\", \"DNS\"], [\"Nome da pessoa\", \"Nome do domínio (exemplo.com)\"], [\"Número de telefone\", \"Endereço IP (203.0.113.10)\"], [\"Procurar o nome para achar o número\", \"Consultar o nome para achar o IP\"], [\"O número muda, o nome fica\", \"O IP muda, o domínio fica\"]]"
                    },
                    {
                        "type": "code",
                        "value": "; consulta: qual o IP de exemplo.com?\nexemplo.com.  ->  203.0.113.10\n\n; a maquina so conecta depois de ter o IP em maos\n; nome que a pessoa digita   ->   endereco que a rede usa"
                    },
                    {
                        "type": "quote",
                        "value": "O DNS desacopla o nome do endereço. As pessoas guardam o nome, estável e fácil de lembrar; a infraestrutura por trás pode trocar de IP quando precisar, sem quebrar quem acessa."
                    },
                    {
                        "type": "text",
                        "value": "## A lista telefônica da internet\n\nUma imagem clássica ajuda: o DNS é a lista telefônica da internet. Numa lista telefônica você conhece o nome da pessoa e procura o número para ligar. No DNS você conhece o nome do site e procura o IP para conectar. A diferença é a escala e a velocidade: são bilhões de nomes e as respostas chegam em milissegundos.\n\nPara quem cuida de infraestrutura, o DNS é onde se decide quem atende por cada nome. Publicar um serviço, apontar um domínio para um servidor novo ou dividir tráfego entre máquinas passa por ajustar registros de DNS. É uma das primeiras peças a checar quando um site não abre."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma pessoa digita site.com no navegador e a página abre. Qual é o papel do DNS nesse acesso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Traduzir o nome site.com no endereço IP do servidor",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografar os dados trocados com o servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar em cache o conteúdo da página aberta",
                                "isCorrect": false
                            },
                            {
                                "text": "Comprimir as imagens para a página carregar mais rápido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que os sites são divulgados por nomes como loja.com em vez do endereço IP numérico?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Nomes são fáceis de lembrar e o IP por trás pode mudar",
                                "isCorrect": true
                            },
                            {
                                "text": "Nomes trafegam pela rede mais rápido que números",
                                "isCorrect": false
                            },
                            {
                                "text": "O IP só funciona dentro de redes locais, nunca na internet",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada nome aceita um único IP e nunca mais de um",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa migra o site para um servidor novo, com IP diferente. Por que os visitantes seguem acessando pelo mesmo nome?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O domínio passa a apontar para o novo IP, e o nome não muda",
                                "isCorrect": true
                            },
                            {
                                "text": "O navegador guarda o site inteiro e ignora a troca de servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "O IP antigo e o novo passam a ser exatamente iguais",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome vira um número fixo que independe de qualquer IP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na analogia do DNS como lista telefônica da internet, o endereço IP corresponde a qual elemento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ao número de telefone que você disca",
                                "isCorrect": true
                            },
                            {
                                "text": "Ao nome da pessoa que você procura na lista",
                                "isCorrect": false
                            },
                            {
                                "text": "À capa da lista com o título impresso",
                                "isCorrect": false
                            },
                            {
                                "text": "Ao índice que ordena os nomes por letra",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual momento a consulta de DNS acontece durante um acesso a um site?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Antes de conectar, para descobrir o IP",
                                "isCorrect": true
                            },
                            {
                                "text": "Depois que a página inteira termina de carregar",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente quando o usuário atualiza a página na tela",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas quando a conexão usa criptografia ativa",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A hierarquia do DNS",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O DNS é uma árvore\n\nO espaço de nomes do DNS não é uma lista plana; é uma árvore invertida, com a raiz no topo e os nomes se ramificando abaixo dela. Um nome como `www.exemplo.com` se lê da direita para a esquerda, do mais geral para o mais específico:\n\n- `.` a raiz (o ponto final, quase sempre implícito)\n- `com` o domínio de topo\n- `exemplo` o domínio registrado\n- `www` o host dentro do domínio\n\nCada nível é responsável apenas por saber quem cuida do nível logo abaixo. Ninguém guarda a árvore inteira, e é essa divisão que faz o DNS atender o mundo todo sem um único ponto central sobrecarregado."
                    },
                    {
                        "type": "text",
                        "value": "## Os três níveis que respondem\n\nUma consulta que sobe do zero passa por três tipos de servidor autoritativo, de cima para baixo:\n\n- **Servidores raiz**: são o ponto de partida. Não conhecem `exemplo.com`, mas sabem quem cuida de cada domínio de topo, como `.com` ou `.br`. Existem 13 identidades de servidor raiz (de \"a\" a \"m\"), espalhadas em centenas de cópias pelo mundo.\n- **Servidores de TLD (Top-Level Domain)**: cada domínio de topo tem os seus. O TLD `.com` não sabe o IP de `exemplo.com`, mas sabe quais servidores respondem por `exemplo.com`.\n- **Servidor autoritativo do domínio**: é a fonte da verdade sobre `exemplo.com`. Ele guarda os registros do domínio e responde com o IP de `www.exemplo.com`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Nível\", \"Exemplo\", \"O que sabe responder\"], [\"Raiz\", \".\", \"Quais servidores cuidam de cada TLD\"], [\"TLD\", \".com, .org, .br\", \"Quais servidores são autoritativos de cada domínio\"], [\"Autoritativo\", \"exemplo.com\", \"Os registros do domínio, como o IP do host\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Delegação: cada nível aponta para o próximo\n\nO elo que liga os níveis se chama delegação. Delegar é passar a responsabilidade por uma parte da árvore para outro conjunto de servidores. A raiz delega o `.com` aos servidores de TLD que cuidam dele; o TLD `.com` delega `exemplo.com` aos servidores que o dono do domínio indicou no registro.\n\nEssa delegação aparece na prática como registros NS (Name Server), que dizem: a partir daqui, pergunte a estes servidores. Quando você registra um domínio e informa os servidores de nome dele, está preenchendo exatamente o ponto de delegação no TLD. É assim que a autoridade desce, nível a nível, até chegar em quem de fato responde pelo seu domínio."
                    },
                    {
                        "type": "code",
                        "value": "; FQDN = nome totalmente qualificado (com o ponto final da raiz)\nwww.exemplo.com.\n\n; lido da direita para a esquerda:\n;   .          raiz (ponto final, quase sempre implicito)\n;   com        TLD, o dominio de topo\n;   exemplo    dominio registrado\n;   www        host dentro do dominio\n\n; sem o ponto final o nome pode ser relativo:\n; app  ->  a rede completa para  app.interno.exemplo.com."
                    },
                    {
                        "type": "quote",
                        "value": "Nenhum servidor conhece a árvore inteira. Cada nível sabe apenas quem cuida do nível abaixo e delega o resto: a raiz aponta o TLD, o TLD aponta o autoritativo, e o autoritativo responde pelo domínio."
                    }
                ],
                "questions": [
                    {
                        "statement": "No nome www.exemplo.com, qual parte está mais próxima da raiz da árvore do DNS?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "com, o domínio de topo",
                                "isCorrect": true
                            },
                            {
                                "text": "www, o host do início",
                                "isCorrect": false
                            },
                            {
                                "text": "exemplo, o domínio registrado",
                                "isCorrect": false
                            },
                            {
                                "text": "as três partes estão no mesmo nível",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta chega a um servidor raiz pedindo o IP de loja.com.br. O que o servidor raiz faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Indica quais servidores cuidam do TLD .br",
                                "isCorrect": true
                            },
                            {
                                "text": "Entrega direto o IP final de loja.com.br",
                                "isCorrect": false
                            },
                            {
                                "text": "Recusa a consulta por não ser um TLD válido",
                                "isCorrect": false
                            },
                            {
                                "text": "Guarda o registro do domínio e o devolve",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao registrar um domínio, você informa os servidores de nome dele. Que ponto do DNS isso configura?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A delegação do domínio no servidor de TLD",
                                "isCorrect": true
                            },
                            {
                                "text": "O cache do resolver recursivo do seu provedor",
                                "isCorrect": false
                            },
                            {
                                "text": "O endereço IP fixo do site na raiz",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela de rotas do roteador local",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual servidor guarda os registros oficiais de exemplo.com e responde com o IP do host?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O servidor autoritativo do domínio",
                                "isCorrect": true
                            },
                            {
                                "text": "Qualquer um dos treze servidores raiz",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor de TLD do .com",
                                "isCorrect": false
                            },
                            {
                                "text": "O resolver recursivo do usuário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que caracteriza um FQDN (nome totalmente qualificado) como www.exemplo.com.?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Traz o caminho completo até a raiz do DNS",
                                "isCorrect": true
                            },
                            {
                                "text": "É sempre o nome mais curto possível de um host",
                                "isCorrect": false
                            },
                            {
                                "text": "Vale apenas dentro de uma rede local privada",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispensa o domínio de topo para ser resolvido",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tipos de registro",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Registros: os dados dentro do domínio\n\nUm domínio não guarda um único valor. Ele guarda um conjunto de registros (resource records), cada um com um tipo que diz o que aquele dado significa. O servidor autoritativo mantém esses registros no que se chama zona do domínio.\n\nCada registro tem, em essência, quatro campos: o nome, o tipo, um TTL (tempo de vida em cache, que veremos adiante) e o valor. O tipo é o que muda tudo: o mesmo nome pode ter um registro que aponta para um IP, outro que indica o servidor de e-mail e outro com um texto de verificação. Saber ler o tipo certo é o que evita confundir o site com o e-mail do domínio."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo\", \"Aponta para\", \"Serve para\"], [\"A\", \"Endereço IPv4\", \"Nome do host para o IPv4 do servidor\"], [\"AAAA\", \"Endereço IPv6\", \"Nome do host para o IPv6 do servidor\"], [\"CNAME\", \"Outro nome\", \"Apelido que aponta para outro nome\"], [\"MX\", \"Servidor de e-mail\", \"Para onde entregar o e-mail do domínio\"], [\"NS\", \"Servidor de nome\", \"Quais servidores são autoritativos da zona\"], [\"TXT\", \"Texto livre\", \"Verificações e políticas (SPF, posse do domínio)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A e AAAA: o nome vira endereço\n\nO registro A é o mais direto: liga um nome a um endereço IPv4. Um `exemplo.com` com registro A de valor `203.0.113.10` diz que quem procura exemplo.com deve conectar nesse IPv4.\n\nO AAAA (lê-se \"quad-A\") faz o mesmo para IPv6, o formato de endereço mais novo e bem mais longo, como `2001:db8::10`. Um mesmo nome pode ter A e AAAA ao mesmo tempo: quem tem IPv6 usa o AAAA, quem não tem cai no A. Os dois convivem sem conflito porque respondem a perguntas diferentes, qual o IPv4 e qual o IPv6."
                    },
                    {
                        "type": "text",
                        "value": "## Apelido, e-mail, autoridade e texto\n\nO CNAME cria um apelido: em vez de um IP, ele aponta para outro nome. `loja.exemplo.com` pode ser um CNAME para `exemplo.com`, e a resolução segue a partir do nome de destino. Uma regra importante: um CNAME não pode conviver com outros registros no mesmo nome, e por isso não se usa CNAME na raiz do domínio (o apex), onde já existem registros como NS e MX.\n\nO MX indica para onde entregar e-mail do domínio; ele aponta para um nome de servidor de e-mail (que por sua vez tem seu A ou AAAA), não para um IP direto. O NS lista os servidores autoritativos da zona, os mesmos que aparecem na delegação. E o TXT guarda texto livre, muito usado para provar posse do domínio e para políticas de e-mail como SPF e DKIM."
                    },
                    {
                        "type": "code",
                        "value": "; nome              TTL   classe tipo   valor\nexemplo.com.        3600  IN     A      203.0.113.10\nexemplo.com.        3600  IN     AAAA   2001:db8::10\nwww.exemplo.com.    3600  IN     CNAME  exemplo.com.\nexemplo.com.        3600  IN     MX     10 mail.exemplo.com.\nexemplo.com.        3600  IN     NS     ns1.provedor.net.\nexemplo.com.        3600  IN     TXT    \"v=spf1 include:_spf.provedor.net -all\""
                    },
                    {
                        "type": "quote",
                        "value": "Cada tipo de registro responde a uma pergunta diferente sobre o domínio: A e AAAA dão o IP do host, CNAME aponta para outro nome, MX diz para onde vai o e-mail, NS diz quem é autoritativo e TXT carrega texto de verificação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você quer que o nome app.exemplo.com aponte para o IPv4 203.0.113.20. Qual tipo de registro usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Registro A",
                                "isCorrect": true
                            },
                            {
                                "text": "Registro MX",
                                "isCorrect": false
                            },
                            {
                                "text": "Registro TXT",
                                "isCorrect": false
                            },
                            {
                                "text": "Registro NS",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um domínio precisa receber e-mails. Que registro define para qual servidor os e-mails devem ser entregues?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Registro MX",
                                "isCorrect": true
                            },
                            {
                                "text": "Registro A",
                                "isCorrect": false
                            },
                            {
                                "text": "Registro CNAME",
                                "isCorrect": false
                            },
                            {
                                "text": "Registro AAAA",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que não se usa um registro CNAME na raiz (apex) de um domínio, como em exemplo.com?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um CNAME não coexiste com outros registros ali",
                                "isCorrect": true
                            },
                            {
                                "text": "Um CNAME aceita somente endereços IPv6 no destino",
                                "isCorrect": false
                            },
                            {
                                "text": "A raiz de um domínio não aceita registro nenhum",
                                "isCorrect": false
                            },
                            {
                                "text": "Um CNAME depende de um IP fixo para poder funcionar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um provedor pede que você adicione um valor de texto no DNS para provar que o domínio é seu. Qual registro usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Registro TXT",
                                "isCorrect": true
                            },
                            {
                                "text": "Registro AAAA",
                                "isCorrect": false
                            },
                            {
                                "text": "Registro MX",
                                "isCorrect": false
                            },
                            {
                                "text": "Registro NS",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um servidor passou a ter também um endereço IPv6, além do IPv4. Que registro adicionar sem remover o que já existe?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "AAAA, que responde pelo IPv6 ao lado do A",
                                "isCorrect": true
                            },
                            {
                                "text": "Um segundo A com o endereço IPv6 escrito nele",
                                "isCorrect": false
                            },
                            {
                                "text": "Um CNAME apontando o IPv6 para o IPv4",
                                "isCorrect": false
                            },
                            {
                                "text": "Um NS informando o novo endereço IPv6",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Resolver e cache",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O resolver faz o trabalho por você\n\nSeu computador não sai perguntando à raiz, ao TLD e ao autoritativo por conta própria. Ele tem só um cliente pequeno, o stub resolver, que joga a pergunta inteira para um resolver recursivo e espera a resposta pronta. Esse resolver recursivo costuma ser o do seu provedor de internet, o da sua rede, ou um público como `1.1.1.1` e `8.8.8.8`.\n\nO resolver recursivo é quem corre atrás da resposta. Partindo do zero, ele pergunta a um servidor raiz, que o encaminha ao TLD; pergunta ao TLD, que o encaminha ao autoritativo; e pergunta ao autoritativo, que finalmente entrega o IP. No fim, o resolver devolve esse IP ao seu computador. Todo esse vaivém acontece longe do cliente, que só fez uma pergunta e recebeu uma resposta."
                    },
                    {
                        "type": "text",
                        "value": "## Recursiva x iterativa: duas formas de perguntar\n\nExistem dois modos de consulta, e a diferença está em quem assume o trabalho.\n\nNuma consulta recursiva, quem pergunta exige a resposta final: resolva isso e me devolva o IP, ou um erro. Quem recebe assume a responsabilidade de ir atrás até o fim. É o que seu computador faz com o resolver recursivo.\n\nNuma consulta iterativa, quem pergunta aceita o que o outro tiver na mão: a resposta, se ele souber, ou uma indicação de quem perguntar em seguida (um encaminhamento, ou referral). Quem pergunta é que segue de servidor em servidor. É assim que o resolver recursivo fala com a raiz, o TLD e o autoritativo: ele pergunta, recebe um \"não sei, pergunte ali\", e segue adiante por conta própria.\n\nO ponto que costuma confundir: o resolver recursivo recebe uma consulta recursiva do cliente, mas resolve o problema fazendo várias consultas iterativas mundo afora."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Consulta recursiva\", \"Consulta iterativa\"], [\"Quem pede\", \"Cliente (stub) ao resolver\", \"Resolver aos servidores da árvore\"], [\"O que espera\", \"A resposta final, pronta\", \"A resposta ou um encaminhamento\"], [\"Quem persegue a resposta\", \"O servidor que recebeu\", \"Quem fez a pergunta\"], [\"Exemplo\", \"PC para o 8.8.8.8\", \"8.8.8.8 para raiz, TLD e autoritativo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Cache e TTL: não repetir a busca\n\nFazer todo esse caminho a cada acesso seria lento e um desperdício. Por isso o resolver recursivo guarda em cache o que aprende. Depois de descobrir o IP de `exemplo.com`, ele mantém essa resposta na memória e entrega na hora nas próximas vezes, sem incomodar a raiz nem o autoritativo.\n\nQuanto tempo a resposta pode ficar em cache? Isso quem define é o TTL (Time To Live), um valor em segundos que acompanha cada registro. Um TTL de 3600 diz que pode guardar por uma hora. Enquanto o TTL não expira, o resolver responde do cache; quando expira, ele descarta o dado e busca de novo. TTL alto alivia a busca e deixa a mudança demorar a valer; TTL baixo faz o oposto. E não é só o resolver que guarda cache: o sistema operacional e o navegador também têm os seus."
                    },
                    {
                        "type": "code",
                        "value": "; consulta do zero (cache vazio): qual o IP de www.exemplo.com?\n\nstub (seu PC)  --recursiva-->  resolver 8.8.8.8   \"resolva e devolva\"\n\nresolver  --iterativa-->  raiz          \"pergunte ao TLD .com\"\nresolver  --iterativa-->  TLD .com      \"pergunte a ns1.exemplo.com\"\nresolver  --iterativa-->  autoritativo  \"A = 203.0.113.10\"\n\nresolver  --resposta-->  stub           \"www.exemplo.com = 203.0.113.10\"\n; o resolver guarda em cache pelo tempo do TTL; a proxima vez responde na hora"
                    },
                    {
                        "type": "quote",
                        "value": "O cliente faz uma consulta recursiva e recebe a resposta pronta; o resolver recursivo, por trás, faz consultas iterativas pela árvore, seguindo os encaminhamentos da raiz ao autoritativo. O cache e o TTL guardam o resultado para não repetir o caminho."
                    }
                ],
                "questions": [
                    {
                        "statement": "Seu computador precisa do IP de um site e envia a pergunta ao 1.1.1.1. Quem percorre a raiz, o TLD e o autoritativo atrás da resposta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O resolver recursivo, no lugar do cliente",
                                "isCorrect": true
                            },
                            {
                                "text": "O próprio computador, um servidor por vez",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor raiz, que busca até o fim",
                                "isCorrect": false
                            },
                            {
                                "text": "O navegador, que acessa cada nível",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na consulta que seu computador faz ao resolver, o que caracteriza o modo recursivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quem recebe deve devolver a resposta final",
                                "isCorrect": true
                            },
                            {
                                "text": "Quem pergunta segue de servidor em servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada servidor responde só o que já sabe",
                                "isCorrect": false
                            },
                            {
                                "text": "A resposta vem sempre do servidor raiz",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quando o resolver recursivo consulta a raiz e o TLD, ele usa o modo iterativo. O que ele recebe nesse modo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A resposta ou a indicação de quem perguntar",
                                "isCorrect": true
                            },
                            {
                                "text": "Sempre o IP final já resolvido pelo servidor raiz",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma recusa até que a busca vire recursiva",
                                "isCorrect": false
                            },
                            {
                                "text": "O conteúdo do site já pronto, vindo do cache",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um registro tem TTL de 3600. O que esse valor determina?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Por quanto tempo a resposta fica em cache",
                                "isCorrect": true
                            },
                            {
                                "text": "Quantos servidores a consulta precisa visitar",
                                "isCorrect": false
                            },
                            {
                                "text": "O número máximo de acessos por hora ao site",
                                "isCorrect": false
                            },
                            {
                                "text": "A prioridade do servidor de e-mail do domínio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um resolver recursivo público recebe a pergunta de um cliente e vai atrás da resposta na árvore do DNS. Como se classificam essas duas pontas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Recebe uma consulta recursiva e faz consultas iterativas",
                                "isCorrect": true
                            },
                            {
                                "text": "Recebe uma consulta iterativa e faz consultas recursivas",
                                "isCorrect": false
                            },
                            {
                                "text": "Usa o modo recursivo dos dois lados da conversa",
                                "isCorrect": false
                            },
                            {
                                "text": "Usa o modo iterativo dos dois lados da conversa",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "DNS na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Perguntar ao DNS na mão\n\nNo dia a dia de DevOps, você vai consultar o DNS diretamente para conferir o que está publicado, sem depender do navegador. Duas ferramentas fazem isso: o `dig` e o `nslookup`. Ambas mandam uma consulta a um resolver e mostram a resposta crua, com o tipo de registro, o valor e o TTL restante.\n\nO `dig` (Domain Information Groper) é o preferido em Linux por mostrar tudo em detalhe: qual registro você pediu, o que voltou e de qual servidor. O `nslookup` existe em praticamente todo sistema, inclusive Windows, e resolve o básico de forma mais enxuta. Você escolhe o nome a consultar, o tipo de registro (A, MX, TXT e outros) e, se quiser, contra qual servidor perguntar."
                    },
                    {
                        "type": "code",
                        "value": "; pedir o registro A (IPv4) de um nome\ndig exemplo.com A +short\n203.0.113.10\n\n; pedir o servidor de e-mail (MX)\ndig exemplo.com MX +short\n10 mail.exemplo.com.\n\n; perguntar a um resolver especifico (aqui, o 1.1.1.1)\ndig @1.1.1.1 exemplo.com A\n\n; equivalente basico com nslookup\nnslookup -type=MX exemplo.com"
                    },
                    {
                        "type": "text",
                        "value": "## Mudou um registro? Espere o TTL\n\nQuando você altera um registro (troca o IP de um A, por exemplo), a mudança não vale para todo mundo no mesmo instante. Pelo mundo afora, muitos resolvers ainda têm o valor antigo em cache e vão continuar entregando ele até o TTL daquele registro expirar. Esse intervalo em que uns já veem o novo e outros ainda veem o antigo é o que se chama, no dia a dia, de propagação.\n\nO TTL é a alavanca que você controla. Se sabe que vai mexer num registro, reduza o TTL com antecedência (por exemplo, de 3600 para 300 segundos) horas antes da mudança. Assim, quando trocar o valor, os caches expiram rápido e quase todo mundo pega o novo em poucos minutos. Depois que estabilizar, você volta o TTL para um valor maior. Vale lembrar: o relógio da propagação é o TTL que já estava no cache, não o novo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"TTL recomendado\", \"Efeito\"], [\"Registro estável\", \"Alto (ex.: 3600s ou mais)\", \"Menos consultas, mudança demora a valer\"], [\"Vai mudar em breve\", \"Baixo (ex.: 300s)\", \"Cache expira rápido, a troca se espalha logo\"], [\"Depois de estabilizar\", \"Voltar para alto\", \"Alivia os resolvers de novo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## DNS interno: nomes dentro da sua rede\n\nO DNS não serve só para a internet pública. Dentro de uma rede privada ou de um cluster, ele é a cola que permite um serviço achar o outro sem IP fixo. Num cluster Kubernetes, por exemplo, cada serviço ganha um nome interno (algo como `pedidos.default.svc.cluster.local`), e um DNS interno resolve esse nome para o IP atual do serviço. Como os IPs dos contêineres mudam o tempo todo, apontar para o nome, e não para o IP, é o que mantém tudo funcionando.\n\nA ideia é a mesma do DNS público, em escala menor e privada: um resolver interno responde pelos nomes da sua rede e encaminha para os resolvers externos o que for de fora. Assim, `pedidos` resolve internamente e `exemplo.com` continua saindo para a internet. Esse padrão de achar serviços pelo nome é a base do que se chama descoberta de serviços (service discovery)."
                    },
                    {
                        "type": "quote",
                        "value": "O TTL manda na propagação: baixe o TTL antes de mudar um registro para a troca se espalhar rápido. E o DNS não é só da internet pública: dentro de um cluster, resolver nomes de serviço para o IP atual é o que deixa os serviços se acharem sem IP fixo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você quer conferir qual IP está publicado para um domínio, direto pela linha de comando. Qual ferramenta serve para isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "dig ou nslookup, que consultam o DNS",
                                "isCorrect": true
                            },
                            {
                                "text": "ping, que mede a latência da conexão",
                                "isCorrect": false
                            },
                            {
                                "text": "curl, que baixa o conteúdo da página",
                                "isCorrect": false
                            },
                            {
                                "text": "traceroute, que mostra o caminho dos pacotes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa ver para qual servidor os e-mails de um domínio são entregues. Que consulta faz sentido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pedir o registro MX do domínio",
                                "isCorrect": true
                            },
                            {
                                "text": "Pedir o registro A do domínio",
                                "isCorrect": false
                            },
                            {
                                "text": "Pedir o registro NS do domínio",
                                "isCorrect": false
                            },
                            {
                                "text": "Pedir o registro AAAA do domínio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você trocou o IP no registro A e alguns usuários ainda caem no servidor antigo. Qual a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Resolvers ainda têm o valor antigo em cache pelo TTL",
                                "isCorrect": true
                            },
                            {
                                "text": "O registro A não aceita ser alterado depois de criado",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor novo precisa de um registro CNAME antes",
                                "isCorrect": false
                            },
                            {
                                "text": "O domínio expirou e voltou para o dono anterior",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você vai migrar um site na próxima semana e quer que a troca de IP se espalhe rápido. O que fazer antes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduzir o TTL do registro com antecedência",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o TTL do registro com antecedência",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o registro NS do domínio antes",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o registro A por um CNAME antes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num cluster, os IPs dos contêineres mudam o tempo todo. Por que os serviços se encontram usando nomes internos, e não IPs?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um DNS interno traduz o nome no IP atual do serviço",
                                "isCorrect": true
                            },
                            {
                                "text": "Os contêineres passam a ter um IP fixo que nunca muda",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada serviço memoriza todos os IPs do cluster ao iniciar",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome vira um IP só uma vez e nunca mais é trocado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Serviços de borda e segurança de rede",
        "aulas": [
            {
                "titulo": "TLS e HTTPS por dentro",
                "blocks": [
                    {
                        "type": "text",
                        "value": "HTTPS não é um protocolo separado do HTTP. É o mesmo HTTP rodando dentro de uma camada de segurança chamada TLS (Transport Layer Security). Quando você acessa um endereço `https://`, o navegador abre uma conexão TCP na porta 443 e, antes de enviar qualquer requisição, negocia com o servidor um túnel cifrado. Só depois que esse túnel está de pé é que o `GET /` viaja por dentro dele.\n\nO TLS entrega três garantias:\n\n- **Confidencialidade**: quem estiver no meio do caminho (um Wi-Fi público, um roteador comprometido) vê tráfego embaralhado, não o conteúdo.\n- **Integridade**: se alguém alterar um byte no caminho, o outro lado percebe e derruba a conexão.\n- **Autenticidade**: o cliente tem como confirmar que fala com o servidor certo, e não com um impostor."
                    },
                    {
                        "type": "text",
                        "value": "O handshake TLS é a conversa inicial que estabelece o túnel. Em linhas gerais:\n\n1. O cliente manda um `ClientHello`: as versões de TLS que suporta e a lista de cifras que sabe usar.\n2. O servidor responde com `ServerHello`, escolhe a cifra e envia seu **certificado**.\n3. Os dois executam uma **troca de chaves** com criptografia assimétrica. O objetivo não é cifrar os dados com ela, e sim combinar em segredo uma **chave de sessão** que ambos passarão a compartilhar.\n4. Dali em diante, todo o tráfego (as requisições e respostas HTTP) é cifrado com criptografia **simétrica**, usando essa chave de sessão.\n\nO TLS 1.3 enxugou esse processo e reduziu o número de idas e voltas (round trips), o que deixa a conexão mais rápida de estabelecer."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Criptografia assimétrica\", \"Criptografia simétrica\"], [\"Chaves\", \"Par: pública e privada\", \"Uma só, compartilhada\"], [\"Onde entra no TLS\", \"No handshake, para negociar\", \"Nos dados, após o handshake\"], [\"Custo de CPU\", \"Alto, mais lenta\", \"Baixo, mais rápida\"], [\"Papel\", \"Provar identidade e combinar o segredo\", \"Cifrar o tráfego em volume\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A assimétrica é cara e serve para negociar com segurança; a simétrica é rápida e serve para transportar os dados. O TLS usa cada uma onde ela é melhor."
                    },
                    {
                        "type": "text",
                        "value": "E como o cliente confia no certificado que o servidor apresentou? O certificado é um documento que amarra um nome de domínio a uma chave pública e vem **assinado por uma Autoridade Certificadora (CA)**. A CA é uma entidade em quem os sistemas operacionais e navegadores já confiam de fábrica: eles trazem uma lista de CAs raiz.\n\nQuando o certificado chega, o cliente verifica a **cadeia de confiança**: o certificado do site foi assinado por uma CA intermediária, que foi assinada por uma CA raiz conhecida. Confere também se o nome do domínio bate e se o certificado não expirou nem foi revogado. Um certificado **autoassinado** (self-signed), sem uma CA reconhecida por trás, dispara o aviso de 'conexão não é segura', porque nada prova a identidade."
                    },
                    {
                        "type": "code",
                        "value": "# Ver o certificado que um servidor apresenta e a cadeia até a CA\nopenssl s_client -connect exemplo.com.br:443 -servername exemplo.com.br\n\n# Inspecionar validade, domínio e emissor de um certificado salvo\nopenssl x509 -in cert.pem -noout -subject -issuer -dates"
                    }
                ],
                "questions": [
                    {
                        "statement": "Um usuário acessa o internet banking por um Wi-Fi público usando HTTPS. Um atacante na mesma rede captura os pacotes. O que ele consegue ler do tráfego?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Apenas dados cifrados, ilegíveis sem a chave de sessão",
                                "isCorrect": true
                            },
                            {
                                "text": "As senhas e os valores digitados, que trafegam em texto puro",
                                "isCorrect": false
                            },
                            {
                                "text": "Todo o conteúdo, já que Wi-Fi público desabilita o TLS",
                                "isCorrect": false
                            },
                            {
                                "text": "O conteúdo e a chave de sessão negociada no handshake",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante o handshake TLS, por que a criptografia assimétrica serve para negociar a chave de sessão, e não para cifrar todo o tráfego?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque é cara em CPU, e a simétrica cifra os dados com eficiência",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a assimétrica não consegue cifrar dados, apenas assinar",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a simétrica é mais segura e protege melhor dados sensíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a chave pública muda a cada pacote e não serviria a um fluxo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao subir um serviço interno, a equipe gerou um certificado autoassinado e os navegadores passaram a mostrar 'sua conexão não é segura'. Qual é a causa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falta uma CA confiável por trás, então a identidade não se prova",
                                "isCorrect": true
                            },
                            {
                                "text": "O certificado autoassinado não cifra o tráfego, apenas identifica o host",
                                "isCorrect": false
                            },
                            {
                                "text": "A porta 443 exige um certificado emitido pelo próprio navegador",
                                "isCorrect": false
                            },
                            {
                                "text": "Certificados autoassinados usam só criptografia simétrica, insegura",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma conexão HTTPS nova, em que momento a primeira requisição HTTP (o GET) é enviada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Depois do handshake, já cifrada com a chave de sessão",
                                "isCorrect": true
                            },
                            {
                                "text": "Antes do handshake, para o servidor saber qual recurso proteger",
                                "isCorrect": false
                            },
                            {
                                "text": "Durante o handshake, junto do ClientHello inicial",
                                "isCorrect": false
                            },
                            {
                                "text": "Em texto claro, e o TLS cifra apenas a resposta do servidor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um proxy corporativo inspeciona o HTTPS dos funcionários sem disparar avisos no navegador. Para isso funcionar, o que precisa estar presente nas máquinas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma CA do proxy instalada como confiável nos clientes",
                                "isCorrect": true
                            },
                            {
                                "text": "A chave privada do servidor de destino copiada para o proxy",
                                "isCorrect": false
                            },
                            {
                                "text": "O TLS 1.3 desativado, já que ele impede qualquer interceptação",
                                "isCorrect": false
                            },
                            {
                                "text": "A porta 443 redirecionada para 80 para remover a camada de cifra",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Proxy reverso",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Um proxy reverso é um servidor que fica **na frente** de um ou mais servidores de aplicação e atende as requisições no lugar deles. O cliente acha que fala direto com o serviço, mas quem responde na porta pública é o proxy, que então repassa a requisição para o **backend** apropriado e devolve a resposta.\n\nNão confunda com o proxy de encaminhamento (forward proxy), que fica do lado do cliente e representa quem faz a requisição, como o proxy de saída de uma empresa. O proxy reverso representa o **servidor**: ele existe para o lado de quem responde."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Proxy de encaminhamento\", \"Proxy reverso\"], [\"Fica na frente de\", \"Dos clientes\", \"Dos servidores\"], [\"Representa\", \"Quem faz a requisição\", \"Quem responde\"], [\"Uso típico\", \"Saída controlada da rede interna\", \"Entrada dos serviços publicados\"], [\"O cliente sabe que existe?\", \"Em geral sim, configurado nele\", \"Em geral não, é transparente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "Na prática, o proxy reverso concentra tarefas que seria ruim espalhar por cada backend:\n\n- **Terminar TLS**: o proxy cuida do HTTPS e do certificado e conversa com os backends em HTTP simples na rede interna. Um só ponto gerencia certificados.\n- **Rotear por host ou caminho**: `api.exemplo.com` vai para um conjunto de servidores; `exemplo.com/blog` vai para outro. É roteamento de camada 7, que enxerga a requisição HTTP.\n- **Esconder e proteger os backends**: os servidores reais ficam em rede privada, sem IP público. Só o proxy é exposto.\n- **Serviços de apoio**: cache, compressão, limitação de taxa (rate limit) e logs centralizados."
                    },
                    {
                        "type": "code",
                        "value": "# Bloco conceitual de nginx como proxy reverso com TLS terminado\nserver {\n    listen 443 ssl;\n    server_name api.exemplo.com.br;\n\n    ssl_certificate     /etc/nginx/certs/exemplo.crt;\n    ssl_certificate_key /etc/nginx/certs/exemplo.key;\n\n    location / {\n        proxy_pass http://backend_interno:8080;\n        proxy_set_header Host $host;\n        proxy_set_header X-Forwarded-For $remote_addr;\n    }\n}"
                    },
                    {
                        "type": "quote",
                        "value": "O backend não precisa saber de TLS, de certificado nem de qual domínio o chamou. O proxy reverso resolve isso na borda e entrega a requisição pronta."
                    },
                    {
                        "type": "text",
                        "value": "Esconder os backends tem valor direto de segurança. Se os servidores de aplicação não têm IP público, um atacante não os alcança diretamente: precisa passar pelo proxy, que é o único exposto e onde você concentra as defesas (limites de taxa, filtros, TLS atualizado). Reduzir a superfície a um único ponto controlado é mais fácil de proteger e de observar do que defender cada servidor por conta própria."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em uma arquitetura web, o proxy reverso ocupa qual posição em relação aos servidores de aplicação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Na frente deles, recebe as requisições e as encaminha",
                                "isCorrect": true
                            },
                            {
                                "text": "Ao lado dos clientes, controlando a saída da rede interna",
                                "isCorrect": false
                            },
                            {
                                "text": "Dentro de cada backend, como uma biblioteca da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Depois do banco de dados, filtrando as consultas SQL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual característica distingue um proxy reverso de um proxy de encaminhamento (forward proxy)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O reverso representa os servidores; o de encaminhamento, os clientes",
                                "isCorrect": true
                            },
                            {
                                "text": "O reverso cifra o tráfego; o de encaminhamento sempre o deixa em texto claro",
                                "isCorrect": false
                            },
                            {
                                "text": "O reverso atua na camada 4; o de encaminhamento, na camada 7",
                                "isCorrect": false
                            },
                            {
                                "text": "O reverso só serve conteúdo estático; o de encaminhamento, dinâmico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer gerenciar os certificados HTTPS em um único lugar e deixar os servidores de aplicação falando HTTP na rede interna. Que função do proxy reverso atende isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Terminação de TLS na borda, repassando HTTP aos backends",
                                "isCorrect": true
                            },
                            {
                                "text": "Balanceamento round-robin entre os certificados disponíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Roteamento por caminho, que escolhe o certificado pela URL",
                                "isCorrect": false
                            },
                            {
                                "text": "Cache de respostas, que dispensa o uso de certificados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um proxy reverso precisa enviar `api.loja.com` para um grupo de servidores e `loja.com/imagens` para outro. Em que informação ele se baseia para decidir?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No host e no caminho da requisição HTTP (camada 7)",
                                "isCorrect": true
                            },
                            {
                                "text": "No endereço MAC de origem informado no pacote recebido",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas no IP de destino, sem olhar a requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "No número de sequência do segmento TCP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Atrás de um proxy reverso, a aplicação passou a registrar o IP do proxy como origem de tudo, perdendo o IP real do cliente. Como o proxy costuma resolver isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Inserindo o IP do cliente no cabeçalho X-Forwarded-For",
                                "isCorrect": true
                            },
                            {
                                "text": "Reescrevendo o IP de origem do pacote para o do cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Abrindo a conexão TCP em nome do endereço original do cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Desligando a terminação de TLS para preservar o cabeçalho IP",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Balanceamento de carga",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Um balanceador de carga (load balancer) recebe as requisições e as distribui entre vários servidores que rodam a mesma aplicação. Ele serve a dois objetivos ao mesmo tempo:\n\n- **Escalar**: em vez de um servidor gigante, você coloca vários menores atrás do balanceador e reparte a carga. Para crescer, adiciona mais servidores, o que chamamos de escala horizontal.\n- **Tolerar falhas**: se um servidor cai, o balanceador para de mandar tráfego para ele e os demais seguem atendendo. O usuário não percebe."
                    },
                    {
                        "type": "text",
                        "value": "Balanceadores operam em camadas diferentes, e a distinção importa:\n\n- **Camada 4 (transporte)**: decide para qual servidor mandar olhando só endereço IP e porta, sem abrir o conteúdo. Encaminha o fluxo TCP ou UDP como um repassador rápido. Não sabe se ali dentro é HTTP e não enxerga caminho nem host.\n- **Camada 7 (aplicação)**: entende o protocolo de aplicação, tipicamente HTTP. Consegue rotear por caminho, host ou cabeçalho, terminar TLS e inspecionar a requisição. Faz mais coisas, ao custo de mais processamento por requisição."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Camada 4 (transporte)\", \"Camada 7 (aplicação)\"], [\"Decide olhando\", \"IP e porta\", \"Conteúdo HTTP: host, caminho, cabeçalho\"], [\"Enxerga a URL?\", \"Não\", \"Sim\"], [\"Termina TLS?\", \"Não, repassa cifrado\", \"Pode terminar\"], [\"Custo por requisição\", \"Menor, mais rápido\", \"Maior, mais recursos\"], [\"Roteia por regra da aplicação?\", \"Não\", \"Sim\"]]"
                    },
                    {
                        "type": "text",
                        "value": "Escolhido o tipo, o balanceador precisa de um critério para dizer qual servidor recebe a próxima requisição. Alguns algoritmos comuns:\n\n- **Round-robin**: distribui em rodízio, um para cada servidor na sequência. Simples e justo quando os servidores são parecidos.\n- **Menos conexões (least connections)**: manda para quem tem menos conexões ativas no momento.\n- **Ponderado (weighted)**: dá mais tráfego a servidores mais potentes.\n\nNada disso funciona sem **health check**: o balanceador testa cada servidor de tempos em tempos, por exemplo com uma requisição a `/health`. Quem não responde direito sai da rotação até voltar a passar. É isso que faz a tolerância a falhas acontecer na prática."
                    },
                    {
                        "type": "quote",
                        "value": "O algoritmo decide quem recebe a próxima requisição; o health check decide quem está apto a recebê-la. Um sem o outro não sustenta alta disponibilidade."
                    },
                    {
                        "type": "code",
                        "value": "# Balanceamento L7 com nginx: rodízio entre três backends\nupstream app {\n    server 10.0.1.10:8080;\n    server 10.0.1.11:8080;\n    server 10.0.1.12:8080 weight=2;\n}\n\nserver {\n    listen 80;\n    location / {\n        proxy_pass http://app;\n    }\n}"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação roda em quatro servidores idênticos atrás de um balanceador de carga. Que par de benefícios essa arquitetura entrega?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Escalar a capacidade e tolerar a falha de um servidor",
                                "isCorrect": true
                            },
                            {
                                "text": "Cifrar o banco de dados e comprimir os backups",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar a latência de rede e dispensar o DNS",
                                "isCorrect": false
                            },
                            {
                                "text": "Versionar o código e automatizar o deploy dos servidores",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um balanceador precisa enviar as requisições de `/checkout` para um grupo de servidores e as de `/imagens` para outro. Em que camada ele precisa operar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Camada 7, porque a decisão depende do caminho HTTP",
                                "isCorrect": true
                            },
                            {
                                "text": "Camada 4, porque o caminho HTTP vem no cabeçalho TCP",
                                "isCorrect": false
                            },
                            {
                                "text": "Camada 4, pois basta olhar a porta de destino",
                                "isCorrect": false
                            },
                            {
                                "text": "Camada 3, usando o IP de origem do cliente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço usa um protocolo próprio sobre TCP, não HTTP, e só precisa repartir as conexões entre servidores com o menor overhead possível. Que balanceador é o mais adequado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "De camada 4, que distribui por IP e porta sem ler o conteúdo",
                                "isCorrect": true
                            },
                            {
                                "text": "De camada 7, que inspeciona cada requisição HTTP da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "De camada 7, que termina o TLS antes de encaminhar",
                                "isCorrect": false
                            },
                            {
                                "text": "De camada 3, que roteia pacotes entre sub-redes distintas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dos servidores atrás do balanceador travou e parou de responder. O que evita que os usuários continuem sendo enviados para ele?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O health check, que o tira da rotação ao detectar a falha",
                                "isCorrect": true
                            },
                            {
                                "text": "O algoritmo round-robin, que pula servidores lentos",
                                "isCorrect": false
                            },
                            {
                                "text": "A terminação de TLS, que revalida o servidor a cada conexão nova",
                                "isCorrect": false
                            },
                            {
                                "text": "O cache do balanceador, que responde no lugar do servidor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um balanceador configurado com round-robin puro entre servidores idênticos, como as próximas requisições são distribuídas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em rodízio, uma para cada servidor na sequência",
                                "isCorrect": true
                            },
                            {
                                "text": "Todas para o servidor com menos conexões ativas",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre para o servidor de maior peso configurado",
                                "isCorrect": false
                            },
                            {
                                "text": "Conforme o IP de origem, fixando o cliente a um servidor",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Firewall",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Um firewall filtra o tráfego de rede aplicando **regras**. Cada pacote ou conexão que tenta passar é avaliado contra uma lista de regras que olham campos como:\n\n- **IP de origem e de destino**: de onde vem e para onde vai.\n- **Porta**: normalmente indica o serviço, como 443 para HTTPS e 22 para SSH.\n- **Protocolo**: TCP, UDP, ICMP.\n\nCom base nisso, o firewall decide **permitir (allow)** ou **bloquear (deny)** aquele tráfego. Ele pode estar num equipamento de rede, no sistema operacional do servidor, como o iptables no Linux, ou como um serviço gerenciado na nuvem."
                    },
                    {
                        "type": "text",
                        "value": "A diferença entre um firewall **stateless** e um **stateful** está em lembrar, ou não, das conexões:\n\n- **Stateless**: avalia cada pacote isoladamente, sem memória do que veio antes. Para liberar a resposta de volta, é preciso uma regra explícita para o tráfego de retorno. Simples e rápido, mas trabalhoso de configurar direito.\n- **Stateful**: mantém uma **tabela de conexões**. Quando permite uma conexão, lembra dela e libera automaticamente os pacotes de resposta relacionados, sem precisar de regra separada. É o comportamento esperado na maioria dos casos hoje."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Stateless\", \"Stateful\"], [\"Unidade avaliada\", \"Pacote isolado\", \"Conexão inteira\"], [\"Memória de conexões\", \"Não mantém\", \"Mantém tabela de estado\"], [\"Tráfego de retorno\", \"Exige regra explícita\", \"Liberado automaticamente\"], [\"Custo de recursos\", \"Menor\", \"Maior, guarda estado\"], [\"Configuração\", \"Mais trabalhosa\", \"Mais simples no dia a dia\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Stateless pergunta 'este pacote combina com alguma regra?'. Stateful pergunta 'este pacote faz parte de uma conexão que eu já permiti?'. A segunda pergunta é o que evita abrir portas à toa."
                    },
                    {
                        "type": "text",
                        "value": "A lógica de decisão costuma ter uma **política padrão**. O recomendado é **negar tudo por omissão (default deny)** e abrir explicitamente só o que o serviço precisa. O oposto, permitir tudo e bloquear casos específicos, deixa escapar o que você esqueceu de prever.\n\nIsso leva ao princípio de **expor o mínimo**: um servidor web precisa da porta 443 aberta ao público, mas o SSH (22) deveria aceitar conexão só da rede de administração, e o banco de dados não deveria ter porta alguma aberta para a internet. Cada porta aberta é uma superfície a mais para atacar. Menos portas expostas, menos risco."
                    },
                    {
                        "type": "code",
                        "value": "# Política padrão: derruba o que entra, permite o que sai\niptables -P INPUT DROP\niptables -P OUTPUT ACCEPT\n\n# Firewall stateful: libera respostas de conexões já estabelecidas\niptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT\n\n# Abrir só o necessário\niptables -A INPUT -p tcp --dport 443 -j ACCEPT\niptables -A INPUT -p tcp --dport 22 -s 10.0.0.0/24 -j ACCEPT"
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao criar uma regra de firewall para liberar o acesso HTTPS a um servidor, que campos a regra normalmente combina?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "IP de origem, IP de destino, porta e protocolo",
                                "isCorrect": true
                            },
                            {
                                "text": "Nome de usuário, senha e método de autenticação",
                                "isCorrect": false
                            },
                            {
                                "text": "URL, cabeçalhos HTTP e corpo da requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Versão do TLS e algoritmo de cifra negociado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um firewall stateful permitiu uma conexão de saída de um servidor para uma API externa. O que acontece com os pacotes de resposta dessa API?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São liberados por pertencerem a uma conexão já permitida",
                                "isCorrect": true
                            },
                            {
                                "text": "São bloqueados até existir uma regra de entrada explícita para eles",
                                "isCorrect": false
                            },
                            {
                                "text": "São avaliados um a um, sem relação com a conexão de saída",
                                "isCorrect": false
                            },
                            {
                                "text": "São descartados, pois o firewall só controla a saída",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um firewall stateless, o que é preciso fazer para que a resposta de uma conexão permitida consiga voltar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar uma regra explícita para o tráfego de retorno",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada, pois ele associa a resposta à conexão de ida automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativar a tabela de estado para rastrear a conexão",
                                "isCorrect": false
                            },
                            {
                                "text": "Terminar o TLS para inspecionar o pacote de volta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seguindo o princípio de expor o mínimo, como um servidor de banco de dados deveria estar em relação à internet?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sem portas abertas ao público, acessível só na rede interna",
                                "isCorrect": true
                            },
                            {
                                "text": "Com a porta do banco aberta ao público, mas protegida por senha forte",
                                "isCorrect": false
                            },
                            {
                                "text": "Com todas as portas abertas e bloqueio por IP suspeito",
                                "isCorrect": false
                            },
                            {
                                "text": "Exposto na porta 443, reaproveitando o firewall do site",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe adota 'negar tudo por padrão e abrir só o necessário'. Comparado a 'permitir tudo e bloquear casos conhecidos', qual é a principal vantagem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O que foi esquecido continua bloqueado, em vez de exposto",
                                "isCorrect": true
                            },
                            {
                                "text": "As regras processam mais rápido por serem em menor número",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispensa health check, pois o firewall assume esse papel",
                                "isCorrect": false
                            },
                            {
                                "text": "Torna o firewall stateful sem precisar de tabela de estado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "CDN e a borda (conceito)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Uma CDN (Content Delivery Network) é uma rede de servidores espalhados geograficamente que guardam **cópias do seu conteúdo** perto de quem acessa. Em vez de todo usuário buscar o arquivo no seu servidor de **origem**, que pode estar do outro lado do mundo, ele recebe a cópia do **ponto de presença (PoP)** mais próximo.\n\nIsso resolve dois problemas:\n\n- **Latência**: os dados percorrem menos distância física, então chegam mais rápido. Um usuário no Brasil pega a cópia de um PoP em São Paulo, não de um servidor na Europa.\n- **Alívio da origem**: se a borda responde, seu servidor de origem recebe muito menos requisições. Ele deixa de ser o gargalo em picos de acesso."
                    },
                    {
                        "type": "text",
                        "value": "O funcionamento gira em torno do cache. Quando o conteúdo pedido já está guardado no PoP, é um **cache hit**: a borda responde na hora. Quando não está, é um **cache miss**: a borda busca na origem, entrega ao usuário e **guarda uma cópia** para os próximos pedidos.\n\nCada cópia tem um tempo de validade (TTL). Passado o prazo, a borda volta a consultar a origem para não servir algo velho. Por isso a CDN é ótima para conteúdo **estático** (imagens, CSS, JavaScript, vídeos), que muda pouco. Conteúdo **dinâmico e personalizado**, como o carrinho de um usuário específico, é mais difícil de cachear, embora a borda ainda ajude com TLS e roteamento."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Cache hit\", \"Cache miss\"], [\"De onde sai a resposta\", \"Do PoP na borda\", \"Da origem, passando pela borda\"], [\"Latência para o usuário\", \"Menor\", \"Maior\"], [\"Carga na origem\", \"Nenhuma para esse objeto\", \"A origem é consultada\"], [\"O que a borda faz\", \"Serve a cópia guardada\", \"Busca e guarda a cópia\"]]"
                    },
                    {
                        "type": "text",
                        "value": "A borda não serve só para acelerar. Por estar distribuída e dimensionada para absorver muito tráfego, ela é o lugar natural para **mitigar ataques de negação de serviço (DDoS)**. Um ataque volumétrico que derrubaria um único servidor de origem se dilui entre os muitos PoPs, longe da sua infraestrutura. A borda absorve e filtra o tráfego malicioso perto de onde ele nasce, e só o tráfego legítimo, muitas vezes já cacheado, chega à origem.\n\nÉ comum a borda concentrar também terminação de TLS, um firewall de aplicação (WAF) e limitação de taxa. Ela vira a primeira linha de contato e de defesa antes que qualquer coisa toque seus servidores."
                    },
                    {
                        "type": "quote",
                        "value": "A CDN aproxima o conteúdo do usuário para ganhar velocidade e, de quebra, afasta o tráfego hostil da origem. Cache e defesa moram no mesmo lugar: a borda."
                    },
                    {
                        "type": "code",
                        "value": "# A origem instrui a borda: pode guardar este objeto por 1 hora\nHTTP/1.1 200 OK\nContent-Type: image/png\nCache-Control: public, max-age=3600\n\n# A CDN sinaliza na resposta se serviu do cache\nX-Cache: HIT"
                    }
                ],
                "questions": [
                    {
                        "statement": "Um site brasileiro com servidor de origem na Europa colocou uma CDN. Por que os usuários no Brasil passaram a carregar as imagens mais rápido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Recebem a cópia de um PoP próximo, sem ir à origem distante",
                                "isCorrect": true
                            },
                            {
                                "text": "A CDN comprime as imagens até elas ficarem sem perda de qualidade",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor de origem foi movido fisicamente para o Brasil",
                                "isCorrect": false
                            },
                            {
                                "text": "O protocolo HTTP é trocado por um mais rápido na CDN",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante um pico de acesso, o servidor de origem atrás de uma CDN recebeu bem menos requisições do que o total de usuários. O que explica isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A borda respondeu a maioria dos pedidos a partir do cache",
                                "isCorrect": true
                            },
                            {
                                "text": "O balanceador de carga recusou parte das conexões no pico",
                                "isCorrect": false
                            },
                            {
                                "text": "O firewall bloqueou os usuários excedentes por limite de taxa",
                                "isCorrect": false
                            },
                            {
                                "text": "A origem duplicou sua capacidade automaticamente no pico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um objeto é pedido pela primeira vez em um PoP e ainda não está no cache. O que a CDN faz nesse cache miss?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Busca na origem, entrega ao usuário e guarda uma cópia",
                                "isCorrect": true
                            },
                            {
                                "text": "Responde com erro até a origem enviar o objeto ativamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Serve uma versão vencida guardada em outro PoP qualquer",
                                "isCorrect": false
                            },
                            {
                                "text": "Redireciona o usuário direto para o servidor de origem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a borda de uma CDN é usada para mitigar ataques DDoS volumétricos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tráfego se dilui entre muitos PoPs, longe da origem",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada PoP encerra a origem para blindá-la durante o ataque",
                                "isCorrect": false
                            },
                            {
                                "text": "A borda converte o ataque em cache hit inofensivo",
                                "isCorrect": false
                            },
                            {
                                "text": "A CDN cifra o tráfego malicioso e o neutraliza na entrada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de publicar uma correção em um arquivo CSS, alguns usuários continuam vendo a versão antiga por um tempo. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A cópia antiga ainda está válida no cache da borda pelo TTL",
                                "isCorrect": true
                            },
                            {
                                "text": "A origem parou de responder e a borda serve um erro salvo",
                                "isCorrect": false
                            },
                            {
                                "text": "O balanceador fixou esses usuários em um servidor desatualizado",
                                "isCorrect": false
                            },
                            {
                                "text": "O certificado TLS expirou e travou a atualização do arquivo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Redes em nuvem e híbrido",
        "aulas": [
            {
                "titulo": "VPC e sub-redes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A VPC: sua rede isolada na nuvem\n\nQuando você sobe recursos em um provedor de nuvem, eles não ficam soltos na internet. Eles vivem dentro de uma VPC (Virtual Private Cloud), que é uma rede virtual privada, isolada das redes dos outros clientes do provedor. É o equivalente, na nuvem, à rede que você teria no seu próprio data center: um espaço onde as suas máquinas conversam entre si por endereços privados e onde você decide o que entra e o que sai.\n\nA VPC vive em uma região do provedor e é toda sua. Nada nela é compartilhado com outra conta, mesmo que a máquina física por baixo seja a mesma. Esse isolamento é a base de tudo que vem depois: sub-redes, rotas e regras de segurança."
                    },
                    {
                        "type": "text",
                        "value": "## O CIDR da VPC e as sub-redes\n\nAo criar a VPC, a primeira decisão é o bloco CIDR dela, por exemplo `10.0.0.0/16`. Esse bloco define o espaço de endereços IP privados disponíveis, todos dentro das faixas privadas que você já viu (10.x, 172.16 a 172.31.x, 192.168.x). Com um `/16` você tem cerca de 65 mil endereços para distribuir.\n\nA VPC inteira não recebe máquinas diretamente. Você fatia esse espaço em sub-redes, cada uma com um pedaço menor do CIDR, por exemplo `10.0.1.0/24`. Cada máquina nasce dentro de uma sub-rede e recebe um IP daquele pedaço. Duas regras valem sempre: o bloco da sub-rede precisa caber no CIDR da VPC e as sub-redes não podem se sobrepor."
                    },
                    {
                        "type": "code",
                        "value": "VPC  10.0.0.0/16   (cerca de 65 mil enderecos privados)\n |\n |- sub-rede publica  10.0.1.0/24  zona A  (rota para a internet)\n |- sub-rede privada  10.0.2.0/24  zona A  (sem rota para a internet)\n |- sub-rede publica  10.0.3.0/24  zona B\n |- sub-rede privada  10.0.4.0/24  zona B"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Sub-rede pública\", \"Sub-rede privada\"], [\"Rota para a internet\", \"Sim, via internet gateway\", \"Não tem rota direta\"], [\"Uso típico\", \"Balanceador, servidor web, bastion\", \"Banco de dados, back-end, cache\"], [\"Recebe conexão de fora\", \"Pode receber\", \"Não recebe direto da internet\"], [\"IP nas máquinas\", \"Costuma ter IP público\", \"Em geral só IP privado\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Zonas de disponibilidade\n\nUma região da nuvem é dividida em zonas de disponibilidade (Availability Zones), que são data centers separados fisicamente, com energia e rede independentes, mas ligados por conexões rápidas. Cada sub-rede fica em uma única zona.\n\nÉ isso que dá tolerância a falhas. Se você coloca a aplicação em uma sub-rede só, uma pane naquela zona derruba tudo. Distribuindo sub-redes em zonas diferentes (uma pública e uma privada por zona, por exemplo), a aplicação continua de pé mesmo que uma zona inteira caia. Por isso os desenhos de produção quase sempre repetem a mesma estrutura de sub-redes em duas ou três zonas."
                    },
                    {
                        "type": "quote",
                        "value": "A VPC é a sua rede isolada na nuvem. Você define o CIDR dela e a fatia em sub-redes: as públicas têm rota para a internet, as privadas não. Espalhar essas sub-redes por zonas de disponibilidade diferentes é o que mantém a aplicação de pé quando uma zona falha."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe cria a primeira VPC da empresa em um provedor de nuvem. O que a VPC oferece por padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma rede virtual isolada das redes de outros clientes",
                                "isCorrect": true
                            },
                            {
                                "text": "Um servidor virtual com o sistema operacional instalado",
                                "isCorrect": false
                            },
                            {
                                "text": "Um domínio público já registrado para os sites da empresa",
                                "isCorrect": false
                            },
                            {
                                "text": "Um banco de dados gerenciado com backup automático",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao criar a VPC, qual definição estabelece o espaço de endereços IP privados que ela vai usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O bloco CIDR da VPC, por exemplo 10.0.0.0/16",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome de domínio público que será associado à VPC",
                                "isCorrect": false
                            },
                            {
                                "text": "A zona de disponibilidade principal da VPC",
                                "isCorrect": false
                            },
                            {
                                "text": "O tipo de instância que roda dentro da VPC",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um banco de dados não deve ser alcançável diretamente da internet. Em qual sub-rede ele deve ficar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Na sub-rede privada, sem rota direta para a internet",
                                "isCorrect": true
                            },
                            {
                                "text": "Na sub-rede pública, que já tem rota aberta para a internet",
                                "isCorrect": false
                            },
                            {
                                "text": "Em qualquer sub-rede, pois a VPC já bloqueia tudo",
                                "isCorrect": false
                            },
                            {
                                "text": "Fora da VPC, em uma rede compartilhada do provedor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para tolerar a falha de uma zona de disponibilidade, como distribuir as sub-redes de uma aplicação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar sub-redes em zonas de disponibilidade diferentes",
                                "isCorrect": true
                            },
                            {
                                "text": "Concentrar todas as sub-redes em uma única zona",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar uma sub-rede só, com um CIDR bem grande",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar a VPC por várias contas separadas dentro do provedor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de uma VPC 10.0.0.0/16, uma equipe vai criar várias sub-redes. O que precisa ser verdade sobre os blocos delas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cada bloco cabe no CIDR da VPC, sem sobrepor outro",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada bloco repete o endereço da VPC inteira nas sub-redes",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada bloco precisa ser maior que o CIDR total da VPC",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada bloco deve ficar fora da faixa de IPs da VPC",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Gateways e roteamento na VPC",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O internet gateway e a sub-rede pública\n\nUma sub-rede não é pública por causa do nome. O que a torna pública é ter uma rota para a internet, e essa rota aponta para o internet gateway. O internet gateway (IGW) é um componente que você anexa à VPC, um por VPC, e que faz a ponte entre as máquinas com IP público e a internet, nos dois sentidos.\n\nSem essa rota, mesmo uma máquina com IP público não fala com a internet. Com ela, as máquinas daquela sub-rede que tenham IP público passam a receber e a enviar tráfego externo. É por isso que balanceadores, servidores web e o bastion ficam em sub-rede pública."
                    },
                    {
                        "type": "text",
                        "value": "## O NAT gateway e a saída da sub-rede privada\n\nA sub-rede privada não tem rota para o internet gateway, então suas máquinas não são alcançáveis de fora. Só que muitas vezes elas precisam sair para a internet: baixar um pacote, chamar uma API externa, buscar uma atualização. Abrir a sub-rede inteira ao mundo só por causa disso seria um risco enorme.\n\nO NAT gateway resolve o problema. Ele fica em uma sub-rede pública e faz tradução de endereços para o tráfego que sai da sub-rede privada. As máquinas privadas iniciam a conexão de saída e a resposta volta pelo mesmo caminho. O detalhe que importa: ninguém de fora consegue iniciar uma conexão de entrada por ele. O NAT gateway é uma via de mão única, só para quem começa a conversa de dentro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Internet gateway\", \"NAT gateway\"], [\"Onde atua\", \"Na VPC, para a sub-rede pública\", \"Na sub-rede pública, servindo a privada\"], [\"Sentido do tráfego\", \"Entrada e saída\", \"Só saída iniciada de dentro\"], [\"Conexão de entrada da internet\", \"Permite\", \"Não permite\"], [\"Quem usa\", \"Máquinas com IP público\", \"Máquinas da sub-rede privada\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## As route tables amarram tudo\n\nCada sub-rede tem uma route table associada, uma lista de regras no formato destino e alvo. Quando um pacote sai de uma máquina, o provedor olha o destino do pacote e escolhe a regra cujo bloco casa com ele.\n\nToda route table começa com a rota local, que cobre o CIDR da VPC e não pode ser removida: é ela que permite as sub-redes conversarem entre si sem passar por nenhum gateway. A partir daí, o que muda entre pública e privada é o destino `0.0.0.0/0`, o resto do mundo: na sub-rede pública ele aponta para o internet gateway; na privada, para o NAT gateway."
                    },
                    {
                        "type": "code",
                        "value": "# Route table da sub-rede publica\n# destino        alvo\n  10.0.0.0/16    local        (trafego dentro da VPC)\n  0.0.0.0/0      igw-abc123   (internet, pelo internet gateway)\n\n# Route table da sub-rede privada\n# destino        alvo\n  10.0.0.0/16    local\n  0.0.0.0/0      nat-def456   (saida pelo NAT gateway, sem entrada)"
                    },
                    {
                        "type": "quote",
                        "value": "O que define uma sub-rede como pública é a rota para o internet gateway, não o nome. A privada não tem essa rota: para sair à internet sem aceitar conexões de entrada, ela usa o NAT gateway. E a rota local, presente em toda route table, é o que liga as sub-redes dentro da VPC."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que efetivamente torna uma sub-rede pública em uma VPC?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma rota para a internet via internet gateway",
                                "isCorrect": true
                            },
                            {
                                "text": "Ter a palavra publica escrita no nome da sub-rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Estar na primeira zona de disponibilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Ter mais endereços livres que as demais",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Instâncias em uma sub-rede privada precisam baixar atualizações da internet, mas não podem receber conexões de fora. O que resolve isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "NAT gateway, que permite só a saída para a internet",
                                "isCorrect": true
                            },
                            {
                                "text": "Internet gateway ligado diretamente na sub-rede privada",
                                "isCorrect": false
                            },
                            {
                                "text": "Um segundo CIDR adicionado à sub-rede privada",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma zona de disponibilidade extra para a sub-rede",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um servidor web precisa receber acesso HTTPS vindo da internet. O que a sub-rede dele precisa ter?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rota para um internet gateway e um IP público",
                                "isCorrect": true
                            },
                            {
                                "text": "Rota para um NAT gateway na sub-rede privada da VPC",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas a rota local da VPC, sem mais nada",
                                "isCorrect": false
                            },
                            {
                                "text": "Um link dedicado até o data center on-prem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma instância privada sai para a internet por um NAT gateway. Um serviço externo consegue abrir conexão de entrada até ela por esse caminho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, o NAT gateway só trata conexões iniciadas de dentro",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, o NAT gateway encaminha qualquer conexão vinda de fora",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, desde que a instância tenha um IP público",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque a sub-rede privada não tem route table",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em toda route table de uma VPC existe uma rota que não pode ser removida. Qual é e para que serve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A rota local, que liga as sub-redes dentro da VPC",
                                "isCorrect": true
                            },
                            {
                                "text": "A rota 0.0.0.0/0, que manda todo o tráfego para a internet",
                                "isCorrect": false
                            },
                            {
                                "text": "A rota para o NAT gateway da sub-rede privada",
                                "isCorrect": false
                            },
                            {
                                "text": "A rota de BGP aprendida do data center on-prem",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Segurança de rede na nuvem",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Security group: firewall por instância\n\nO security group é o firewall mais próximo da máquina. Ele é aplicado por instância (na prática, na interface de rede dela) e você lista as regras de entrada e de saída que quer permitir. Duas características definem o comportamento dele.\n\nPrimeiro, ele é stateful: guarda o estado das conexões. Se você permite uma conexão de entrada, a resposta correspondente pode sair sem que você crie uma regra de saída para ela, e vice-versa. Segundo, ele só tem regras de allow: você diz o que é permitido, e tudo que não foi permitido está automaticamente negado. Não existe regra de deny em um security group."
                    },
                    {
                        "type": "text",
                        "value": "## Network ACL: firewall por sub-rede\n\nA network ACL (NACL) atua uma camada acima, na borda da sub-rede inteira. Todo tráfego que entra ou sai da sub-rede passa por ela antes de chegar às máquinas. O comportamento difere do security group em dois pontos.\n\nEla é stateless: não guarda estado. Se você libera uma conexão de entrada, precisa liberar também a saída correspondente, de forma explícita, e isso inclui as portas efêmeras (as portas altas que o outro lado usa na resposta). E ela aceita regras de allow e de deny, avaliadas por número, em ordem: a primeira regra que casa com o pacote decide. É isso que permite bloquear um IP ou uma faixa específica, algo que o security group não faz."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Security group\", \"Network ACL\"], [\"Onde é aplicado\", \"Por instância\", \"Por sub-rede\"], [\"Estado\", \"Stateful\", \"Stateless\"], [\"Tipos de regra\", \"Só allow\", \"Allow e deny\"], [\"Resposta da conexão\", \"Liberada sozinha\", \"Precisa de regra explícita\"], [\"Ordem das regras\", \"Todas avaliadas juntas\", \"Por número, a primeira que casa\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como os dois se complementam\n\nEles não competem: trabalham em camadas, o que se chama defesa em profundidade. A network ACL é a peneira grossa na entrada da sub-rede, boa para barrar faixas de IP inteiras com regras de deny. O security group é a peneira fina em cada instância, onde você libera exatamente as portas que aquele serviço precisa.\n\nNo dia a dia, a maior parte das regras vive nos security groups, justamente por serem stateful e por instância: você abre a porta 443 do servidor web e não precisa se preocupar com a porta efêmera da volta. A NACL entra quando você quer um bloqueio amplo, na fronteira da sub-rede, valendo para todas as máquinas de uma vez."
                    },
                    {
                        "type": "code",
                        "value": "# Security group de um servidor web (stateful, so allow)\n\n# Entrada:\n  permitir TCP 443  de 0.0.0.0/0      # HTTPS de qualquer origem\n  permitir TCP 22   de 10.0.0.0/16    # SSH so de dentro da VPC\n\n# Saida:\n  permitir tudo                       # a resposta ja sai sozinha (stateful)"
                    },
                    {
                        "type": "quote",
                        "value": "Security group e network ACL se completam. O security group é stateful, vale por instância e só tem allow: a resposta de uma conexão liberada sai sozinha. A network ACL é stateless, vale por sub-rede e aceita deny: precisa liberar ida e volta, mas consegue barrar faixas de IP inteiras."
                    }
                ],
                "questions": [
                    {
                        "statement": "Como se caracteriza um security group em uma VPC?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Firewall por instância, stateful, só com regras de allow",
                                "isCorrect": true
                            },
                            {
                                "text": "Firewall por sub-rede, stateless, com regras de allow e deny",
                                "isCorrect": false
                            },
                            {
                                "text": "Roteador que troca rotas com o data center on-prem",
                                "isCorrect": false
                            },
                            {
                                "text": "Serviço que traduz endereços para a saída à internet",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual nível uma network ACL é aplicada e o que a distingue do security group?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Na sub-rede, é stateless e aceita regras de deny",
                                "isCorrect": true
                            },
                            {
                                "text": "Na instância, é stateful e só aceita regras de allow",
                                "isCorrect": false
                            },
                            {
                                "text": "Na VPC inteira, substituindo todos os security groups",
                                "isCorrect": false
                            },
                            {
                                "text": "No internet gateway, filtrando só o tráfego de saída",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você libera a entrada na porta 443 em um security group. Precisa criar também uma regra de saída para a resposta dessa conexão sair?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, o security group é stateful e libera a resposta",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, sem uma regra de saída explícita a resposta é descartada",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, e ainda precisa liberar a porta 443 na saída",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque a resposta usa a mesma porta 443 fixa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma network ACL controla uma sub-rede. Para uma conexão de entrada permitida, por que costuma ser preciso liberar também portas de saída altas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque ela é stateless e a resposta sai por porta efêmera",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o security group da instância bloqueia a saída por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ela é stateful e guarda o estado da conexão",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o NAT gateway exige portas altas abertas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A equipe quer bloquear um intervalo de IPs malicioso na borda de uma sub-rede inteira. Qual recurso permite isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A network ACL, que aceita regras de deny por sub-rede",
                                "isCorrect": true
                            },
                            {
                                "text": "O security group, que aceita regras de deny por instância",
                                "isCorrect": false
                            },
                            {
                                "text": "A route table, criando uma rota de bloqueio para o IP",
                                "isCorrect": false
                            },
                            {
                                "text": "O internet gateway, negando o intervalo na entrada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Conectar o on-prem (híbrido)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Ligar o data center à nuvem\n\nPoucas empresas migram tudo para a nuvem de uma vez. O cenário comum é híbrido: parte dos sistemas continua no data center próprio (o on-prem) e parte já roda na nuvem, e os dois lados precisam conversar por endereços privados, como se fossem uma rede só. Um sistema on-prem pode precisar de um banco na nuvem, e um serviço na nuvem pode precisar de dados que ainda vivem no data center.\n\nExistem dois jeitos principais de fazer essa ponte: uma VPN site-to-site, que usa a internet pública, ou um link dedicado, do tipo Direct Connect, que é uma conexão privada. A escolha entre eles é um equilíbrio entre custo, tempo de instalação e qualidade da conexão."
                    },
                    {
                        "type": "text",
                        "value": "## VPN site-to-site\n\nA VPN site-to-site cria um túnel criptografado entre o roteador do seu data center e o gateway da VPC. O tráfego viaja pela internet pública, mas vai cifrado de ponta a ponta, então quem estiver no meio do caminho não consegue lê-lo.\n\nA grande vantagem é o custo e a rapidez: você usa o link de internet que já tem e sobe o túnel em horas. A limitação está justamente em depender da internet pública. A latência oscila, a banda varia conforme a rede do momento e não há garantia de desempenho. Para tráfego moderado, para começar rápido ou para servir de backup, a VPN resolve muito bem."
                    },
                    {
                        "type": "text",
                        "value": "## Link dedicado, tipo Direct Connect\n\nUm link dedicado é uma conexão física privada entre o seu data center e o provedor, montada através de um parceiro ou de um ponto de presença. O tráfego não passa pela internet pública: ele corre por um caminho reservado só para você.\n\nIsso entrega banda estável, latência previsível e mais consistência, o que pesa quando há muito dado trafegando ou requisitos de conformidade. Em troca, o custo é maior e a instalação é lenta: pode levar semanas, porque envolve infraestrutura física. É a escolha de quem tem volume grande e constante e não pode depender da variação da internet."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"VPN site-to-site\", \"Link dedicado (Direct Connect)\"], [\"Meio\", \"Internet pública, com criptografia\", \"Conexão privada dedicada\"], [\"Custo\", \"Mais baixo\", \"Mais alto\"], [\"Tempo para subir\", \"Horas\", \"Semanas\"], [\"Banda e latência\", \"Variáveis\", \"Estáveis e previsíveis\"], [\"Quando usar\", \"Começo rápido, tráfego moderado, backup\", \"Volume alto, latência previsível\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Para ligar o on-prem à nuvem, a VPN site-to-site é o túnel criptografado pela internet: barata e rápida de subir, mas com desempenho variável. O link dedicado, tipo Direct Connect, é a conexão privada: cara e lenta de instalar, porém estável. Muitas empresas usam o link dedicado na produção e deixam uma VPN de backup."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer ligar rápido o data center à nuvem, com custo baixo e tráfego moderado. Qual opção se encaixa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "VPN site-to-site, com túnel criptografado pela internet",
                                "isCorrect": true
                            },
                            {
                                "text": "Um internet gateway ligado direto ao data center on-prem",
                                "isCorrect": false
                            },
                            {
                                "text": "Link dedicado, com fibra exclusiva até o provedor",
                                "isCorrect": false
                            },
                            {
                                "text": "Peering entre duas VPCs da mesma conta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual característica descreve um link dedicado do tipo Direct Connect?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Conexão privada e estável, sem passar pela internet",
                                "isCorrect": true
                            },
                            {
                                "text": "Túnel criptografado que trafega pela internet pública",
                                "isCorrect": false
                            },
                            {
                                "text": "Serviço gratuito incluído em qualquer VPC nova",
                                "isCorrect": false
                            },
                            {
                                "text": "Rota estática configurada dentro da route table",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre o caminho que o tráfego de uma VPN site-to-site percorre, o que é correto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Passa pela internet pública, protegido por criptografia",
                                "isCorrect": true
                            },
                            {
                                "text": "Passa por uma fibra dedicada e privada, sem criptografia",
                                "isCorrect": false
                            },
                            {
                                "text": "Não sai da VPC, ficando só na rede do provedor",
                                "isCorrect": false
                            },
                            {
                                "text": "Vai direto ao on-prem sem tocar em roteadores",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema troca um volume grande e constante de dados com a nuvem e exige latência previsível. Qual conexão atende melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um link dedicado, com banda reservada e estável",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma VPN pela internet pública, mais sujeita a variação",
                                "isCorrect": false
                            },
                            {
                                "text": "Um NAT gateway dimensionado para alto tráfego",
                                "isCorrect": false
                            },
                            {
                                "text": "Um internet gateway com IP público fixo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa usa link dedicado para produção, mas quer um plano B se ele cair. Um desenho comum para isso é:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Manter uma VPN site-to-site como conexão de backup",
                                "isCorrect": true
                            },
                            {
                                "text": "Duplicar o internet gateway em outra sub-rede pública",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o link dedicado por dois NAT gateways",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o link e usar só peering entre VPCs",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Roteamento híbrido e fechamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Roteamento híbrido com BGP\n\nDepois de erguer a ponte (VPN ou link dedicado), falta os dois lados saberem quais faixas de IP existem em cada rede. Dá para escrever essas rotas à mão, de forma estática, mas isso não escala: toda mudança vira trabalho manual dos dois lados, e um esquecimento derruba a comunicação.\n\nO BGP (Border Gateway Protocol) resolve isso trocando rotas de forma dinâmica. O roteador do on-prem anuncia as faixas do data center e o gateway da nuvem anuncia as faixas da VPC. Cada lado aprende sozinho como chegar ao outro. Quando você adiciona uma nova sub-rede em um dos lados, o BGP propaga a rota automaticamente, sem ninguém editar tabela nenhuma."
                    },
                    {
                        "type": "text",
                        "value": "## Peering entre VPCs\n\nÀs vezes o que você precisa ligar não é o on-prem, e sim duas VPCs, talvez de times ou contas diferentes. O peering entre VPCs faz essa conexão: cria um vínculo direto entre elas para que as máquinas conversem por IP privado, como se estivessem na mesma rede, sem passar pela internet.\n\nDois pontos definem o peering. Ele não é transitivo: se a VPC A tem peering com a B, e a B com a C, isso não faz A enxergar a C; seria preciso um peering direto entre A e C. E os blocos CIDR das VPCs não podem se sobrepor, senão o roteamento fica ambíguo, sem saber para qual lado mandar um endereço que existe nas duas."
                    },
                    {
                        "type": "code",
                        "value": "# Anuncios de rota trocados por BGP\n\n# On-prem anuncia para a nuvem:\n  192.168.0.0/16    (faixas do data center)\n\n# Nuvem anuncia para o on-prem:\n  10.0.0.0/16       (faixas da VPC)\n\n# Cada lado aprende a rota do outro, sem configuracao manual."
                    },
                    {
                        "type": "text",
                        "value": "## O caminho da trilha\n\nVale olhar para trás e ver o quanto o quadro se completou. Você começou pelos modelos que organizam a comunicação (OSI e TCP/IP), desceu ao endereçamento IP com CIDR e NAT, viu como os pacotes acham o caminho no roteamento e na comutação, entendeu o transporte com TCP e UDP e o papel das portas, passou pelo DNS que traduz nomes em endereços e pelos serviços de borda que expõem e protegem uma aplicação (TLS, proxy reverso, balanceamento de carga e firewall).\n\nNeste último módulo, tudo isso reapareceu na nuvem. A VPC é endereçamento e sub-redes; os gateways e as route tables são roteamento; o security group e a network ACL são firewall; a VPN e o link dedicado são a mesma rede se estendendo até o on-prem. Não é um assunto novo: são os fundamentos aplicados em outro lugar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa da trilha\", \"O que você leva\"], [\"Modelos OSI e TCP/IP\", \"Enxergar a comunicação em camadas\"], [\"IP, CIDR e NAT\", \"Endereçar e dividir redes\"], [\"Roteamento e comutação\", \"Levar o pacote até o destino\"], [\"TCP, UDP e portas\", \"Entregar dados e separar serviços\"], [\"DNS\", \"Traduzir nomes em endereços\"], [\"Serviços de borda\", \"Expor e proteger a aplicação\"], [\"Nuvem e híbrido\", \"Aplicar tudo em VPC e on-prem\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Redes na nuvem não são um mundo novo: são os fundamentos de sempre em outra roupa. A VPC é endereçamento e sub-redes, os gateways são roteamento, os security groups e as NACLs são firewall, e a VPN ou o link dedicado estendem a rede até o on-prem. Com essa base, você tem o que precisa para expor, conectar e proteger serviços em produção."
                    }
                ],
                "questions": [
                    {
                        "statement": "No roteamento híbrido, para que serve o BGP entre o on-prem e a nuvem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Trocar rotas dinamicamente entre as duas redes",
                                "isCorrect": true
                            },
                            {
                                "text": "Distribuir a carga entre vários servidores web",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografar o túnel que liga as duas redes",
                                "isCorrect": false
                            },
                            {
                                "text": "Traduzir os endereços privados em públicos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time adiciona uma nova faixa de IPs no data center. Com BGP configurado, o que acontece do lado da nuvem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A nova rota é aprendida sem edição manual das tabelas",
                                "isCorrect": true
                            },
                            {
                                "text": "É preciso cadastrar a nova rota à mão em cada sub-rede",
                                "isCorrect": false
                            },
                            {
                                "text": "A VPC recria as suas sub-redes automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "O link dedicado precisa ser provisionado de novo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o peering entre VPCs permite?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que duas VPCs se comuniquem por IP privado",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o on-prem troque rotas via BGP com a VPC",
                                "isCorrect": false
                            },
                            {
                                "text": "Que uma sub-rede privada receba IP público",
                                "isCorrect": false
                            },
                            {
                                "text": "Que uma VPC acesse a internet sem gateway",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As VPCs A e B têm peering, e B e C também. Sem nada a mais, A alcança C por esse caminho?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, o peering não é transitivo entre as VPCs",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque VPCs nunca podem ter dois peerings",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, desde que as três estejam na mesma zona",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, o peering repassa o tráfego de A até C",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de criar um peering entre duas VPCs, o que precisa ser verdade sobre os blocos CIDR delas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não podem se sobrepor, senão o roteamento fica ambíguo",
                                "isCorrect": true
                            },
                            {
                                "text": "Precisam estar na mesma zona de disponibilidade da conta",
                                "isCorrect": false
                            },
                            {
                                "text": "Precisam ser exatamente iguais nas duas VPCs",
                                "isCorrect": false
                            },
                            {
                                "text": "Precisam ser públicos e registrados na internet",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    }
] as unknown as Modulo[];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.");
        return;
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
        "Seed concluído: " + MODULOS.length + " módulos, " + totalAulas + " aulas, " + totalQuestoes + " questões.",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
