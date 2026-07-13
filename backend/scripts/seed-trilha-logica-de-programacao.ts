// Seed da trilha Logica de Programacao (iniciante), estagio 1 do roadmap de Back-end.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Atencao: se existir uma trilha de teste vazia com este nome, apague-a antes de rodar
// (o seed pula quando a trilha ja tem qualquer aula).
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-logica-de-programacao.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Lógica de Programação";
const DESCRICAO =
    "A base de tudo em programação: pensamento algorítmico, variáveis e tipos, condicionais, laços, funções e coleções, resolvendo problemas de verdade com código. O ponto de partida de quem vai para o back-end.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULOS: Modulo[] = [
    {
        "titulo": "Módulo 1 - O que é lógica de programação e algoritmos",
        "aulas": [
            {
                "titulo": "O que é programar e o que é um algoritmo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é programar e o que é um algoritmo\n\nSe você nunca escreveu uma linha de código na vida, este é o lugar certo para começar. Esqueça por um instante a ideia de que programar é algo misterioso, cheio de fórmulas complicadas ou reservado para gênios. Programar é, antes de tudo, uma forma de pensar e de se comunicar. E é exatamente isso que você vai aprender a partir de agora, com calma, um passo de cada vez.\n\nNesta aula você vai entender o que realmente significa \"programar\" e o que é um \"algoritmo\", as duas ideias mais importantes de toda a programação. Todo o resto que você vai aprender daqui para frente (variáveis, condições, repetições, funções) é só uma forma de expressar algoritmos de um jeito que o computador entenda."
                    },
                    {
                        "type": "text",
                        "value": "## O computador faz exatamente o que você manda\n\nProgramar é dar instruções para o computador executar. Parece simples, mas tem um detalhe que muda tudo: o computador faz exatamente o que você manda, nem mais, nem menos, e na ordem exata em que você manda.\n\nImagine que você pede para alguém que nunca fez um sanduíche na vida: \"faça um sanduíche de pão com manteiga\". Para você, isso envolve abrir o pacote de pão, pegar duas fatias, abrir o pote de manteiga, passar com uma faca, e juntar as fatias. Mas se essa pessoa seguir literalmente só as palavras que você disse, sem usar nenhum conhecimento prévio, ela pode tentar passar manteiga direto no pacote fechado.\n\nO computador é exatamente essa pessoa. Ele não tem senso comum, não \"adivinha\" o que você quis dizer e não completa etapas que você esqueceu de escrever. Por isso, programar exige ser preciso: você precisa descrever cada passo, na ordem certa, sem pular nada que pareça óbvio para um ser humano."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um algoritmo\n\nUm algoritmo é uma sequência de passos, bem definida e ordenada, para resolver um problema ou realizar uma tarefa. Repare que essa definição não fala em computador em nenhum momento: algoritmos existem muito antes dos computadores, e você usa vários deles no seu dia a dia sem perceber.\n\nUma receita de bolo é um algoritmo: ela descreve, passo a passo, o que fazer para transformar ingredientes soltos em um bolo pronto. Trocar um pneu furado também é um algoritmo: existe uma ordem de passos que leva do \"pneu furado\" ao \"carro rodando de novo\", e essa ordem não é qualquer uma.\n\nQuando você programa, está basicamente escrevendo um algoritmo numa linguagem que o computador consegue entender e executar, como o JavaScript, que é a linguagem que vamos usar aqui."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Passo\",\"O que fazer\"],[\"1\",\"Separar os ingredientes: farinha, ovos, açúcar, leite e fermento\"],[\"2\",\"Misturar os ingredientes secos e os líquidos em uma tigela\"],[\"3\",\"Bater a massa até ficar homogênea\"],[\"4\",\"Untar a forma e despejar a massa dentro dela\"],[\"5\",\"Assar no forno preaquecido por cerca de 40 minutos\"],[\"6\",\"Esperar esfriar antes de desenformar e servir\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que a ordem e a precisão importam\n\nNum algoritmo, a ordem dos passos não é um detalhe: ela faz parte da solução. Trocar a ordem pode fazer o algoritmo falhar completamente, ou até causar um acidente.\n\nPense de novo na troca de pneu. Não dá para colocar o estepe antes de tirar a roda furada, nem abaixar o carro antes de apertar as porcas. A tarefa é a mesma, os passos são os mesmos, mas **a ordem** entre eles é o que garante que tudo funcione (e que ninguém se machuque).\n\nO mesmo vale para precisão: dizer \"misture os ingredientes\" é vago, mas dizer \"misture a farinha, o açúcar e o fermento numa tigela, depois adicione os ovos e o leite\" já é preciso o bastante para alguém (ou um computador) seguir sem depender de adivinhação."
                    },
                    {
                        "type": "code",
                        "value": "// Um algoritmo pode ser escrito assim, passo a passo, mesmo antes de virar código de verdade.\n// Isto aqui já é um arquivo JavaScript válido: comentários não fazem o computador executar nada,\n// mas ajudam a organizar o raciocínio antes de programar.\n\n// Algoritmo: trocar um pneu furado\n// 1. Parar o carro em um local seguro e sinalizar\n// 2. Pegar o estepe, o macaco e a chave de rodas\n// 3. Afrouxar um pouco as porcas da roda furada (ainda com o carro no chão)\n// 4. Levantar o carro com o macaco\n// 5. Terminar de tirar as porcas e retirar a roda furada\n// 6. Colocar a roda do estepe no lugar\n// 7. Colocar e apertar as porcas\n// 8. Abaixar o carro e apertar as porcas com mais força"
                    },
                    {
                        "type": "quote",
                        "value": "Programar é dar instruções precisas e ordenadas para o computador executar. Um algoritmo é a receita por trás de qualquer programa: uma sequência de passos que resolve um problema, na ordem certa."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que melhor descreve o que significa \"programar\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dar instruções ordenadas para o computador executar",
                                "isCorrect": true
                            },
                            {
                                "text": "Decorar de cor os comandos de uma linguagem de programação",
                                "isCorrect": false
                            },
                            {
                                "text": "Desenhar a tela de um aplicativo ou site",
                                "isCorrect": false
                            },
                            {
                                "text": "Consertar o computador quando ele trava",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é um exemplo de algoritmo do dia a dia?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma receita de bolo, passo a passo",
                                "isCorrect": true
                            },
                            {
                                "text": "A cor da capa de um livro",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome de um restaurante preferido pela família",
                                "isCorrect": false
                            },
                            {
                                "text": "O preço de uma passagem de ônibus",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você pede para um amigo que nunca cozinhou: \"faça um sanduíche de pão com manteiga\". Ele segue exatamente as palavras que você disse, na ordem que disse, e tenta passar manteiga direto no pacote de pão ainda fechado. Esse exemplo mostra principalmente que:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "instruções são seguidas ao pé da letra, mesmo quando algo parece óbvio",
                                "isCorrect": true
                            },
                            {
                                "text": "não é possível descrever o preparo de um sanduíche como uma sequência de passos",
                                "isCorrect": false
                            },
                            {
                                "text": "faltou comprar mais pão antes de começar a receita",
                                "isCorrect": false
                            },
                            {
                                "text": "seu amigo não sabe seguir receitas de cozinha",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No algoritmo de trocar um pneu, as porcas da roda são afrouxadas ainda com o carro no chão, antes de levantá-lo com o macaco. Por que essa ordem é importante?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o atrito com o chão trava a roda, facilitando soltar as porcas",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a ordem dos passos nunca muda o resultado de um algoritmo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o macaco só consegue erguer o carro após soltar todas as porcas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque assim o carro fica mais estável quando é erguido pelo macaco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação sobre algoritmos é verdadeira?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É a sequência de passos em si, descrita em texto, desenho ou código",
                                "isCorrect": true
                            },
                            {
                                "text": "Só passa a existir depois de escrito em uma linguagem como o JavaScript",
                                "isCorrect": false
                            },
                            {
                                "text": "Mudar a ordem dos passos nunca altera o resultado final",
                                "isCorrect": false
                            },
                            {
                                "text": "Precisa sempre de um computador para existir e ser executado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Pensando como um programador: quebrar o problema em passos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Pensando como um programador\n\nNa aula anterior você viu que programar é dar instruções precisas, e que um algoritmo é a sequência de passos por trás de qualquer solução. Mas como alguém chega a essa sequência de passos, especialmente quando o problema parece grande e complicado?\n\nÉ aí que entra o pensamento computacional: um jeito de encarar problemas que todo programador desenvolve com a prática, e que você também pode treinar desde já, mesmo sem escrever uma linha de código. Ele se apoia em três ideias principais: decompor, reconhecer padrões e abstrair."
                    },
                    {
                        "type": "text",
                        "value": "## Decomposição: quebrar o problema grande\n\nDecomposição é dividir um problema grande em partes menores, que são mais fáceis de entender e resolver uma de cada vez. Em vez de tentar resolver tudo de uma só vez (o que costuma travar qualquer pessoa, programando ou não), você separa o problema em pedaços menores e ataca um pedaço por vez.\n\nImagine organizar a festa de aniversário do seu filho. Encarada de uma vez só, a tarefa parece enorme: \"organizar a festa\". Mas se você quebrar em partes menores, como escolher a data e o local, montar a lista de convidados, comprar comida e decorar a casa, cada parte sozinha é bem mais simples de resolver. Depois é só juntar as partes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Parte menor do problema\",\"O que envolve\"],[\"Escolher a data e o local\",\"Ver a agenda da família e reservar o espaço\"],[\"Montar a lista de convidados\",\"Decidir quem vai ser convidado e enviar os convites\"],[\"Comprar comida e bebida\",\"Definir o cardápio e fazer as compras\"],[\"Decorar a casa\",\"Comprar ou preparar a decoração e montar tudo no dia\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Reconhecer padrões\n\nReconhecer padrões é perceber que problemas, ou partes de um problema, se repetem ou se parecem entre si, mesmo que os detalhes mudem. Quando você percebe um padrão, pode reaproveitar a mesma solução várias vezes, em vez de reinventar tudo do zero a cada situação parecida.\n\nPor exemplo, toda vez que você troca uma lâmpada, os passos são praticamente os mesmos: desligar a energia, tirar a lâmpada queimada, colocar a nova, ligar a energia de novo. Não importa se é a lâmpada da cozinha ou do quarto, o padrão de passos se repete. Na programação, reconhecer esse tipo de padrão é o que leva a criar, por exemplo, uma função que você usa várias vezes (você vai estudar isso no módulo de funções), em vez de reescrever a mesma lógica sem parar."
                    },
                    {
                        "type": "text",
                        "value": "## Abstração: focar no essencial\n\nAbstração é decidir o que é essencial para resolver o problema, e ignorar de propósito os detalhes que não importam para aquela tarefa específica. Toda solução boa deixa coisas de fora, e isso não é preguiça: é foco.\n\nUm mapa de aplicativo de trânsito é um bom exemplo de abstração. Ele representa ruas como linhas e pontos de referência como ícones, e ignora completamente detalhes como a cor das casas ou o tipo de árvore em cada calçada. Para o problema de chegar de um ponto a outro, esses detalhes não importam, então eles ficam de fora."
                    },
                    {
                        "type": "code",
                        "value": "// Problema: calcular o total de uma compra, aplicando desconto quando for o caso\n// Antes de programar, vale decompor o problema em passos menores:\n\n// Passo 1: somar o preço de todos os itens do carrinho\n// Passo 2: verificar se essa soma passa de um valor mínimo para ganhar desconto\n// Passo 3: se passar do valor mínimo, aplicar o desconto sobre a soma\n// Passo 4: mostrar o valor final para o cliente\n\n// Repare que cada passo, sozinho, é bem mais simples do que calcular a compra inteira de uma vez só"
                    },
                    {
                        "type": "quote",
                        "value": "Pensar como programador é treinar o olhar: quebrar o grande em pedaços menores (decomposição), notar o que se repete (padrões) e manter o foco só no que realmente importa para o problema (abstração)."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é \"decomposição\" no pensamento computacional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quebrar um problema grande em partes menores",
                                "isCorrect": true
                            },
                            {
                                "text": "Apagar um programa que não funciona mais",
                                "isCorrect": false
                            },
                            {
                                "text": "Diminuir o tamanho da tela do computador",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever todo o código de uma vez, sem planejar nada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Perceber que \"toda vez que preciso trocar uma lâmpada, sigo os mesmos passos: desligar a energia, tirar a lâmpada queimada, colocar a nova e ligar a energia de novo\" é um exemplo de:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "identificar um padrão que se repete",
                                "isCorrect": true
                            },
                            {
                                "text": "abstração dos detalhes menos importantes",
                                "isCorrect": false
                            },
                            {
                                "text": "um erro de lógica no meio do processo",
                                "isCorrect": false
                            },
                            {
                                "text": "um algoritmo que não pode ser repetido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ana quer organizar a festa de aniversário do filho. Em vez de tentar pensar em tudo de uma vez, ela separa a tarefa em: escolher a data e o local, montar a lista de convidados, comprar comida e decorar a casa. O que Ana está aplicando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "decomposição: dividiu a festa em partes menores",
                                "isCorrect": true
                            },
                            {
                                "text": "abstração: ignorou detalhes importantes da festa",
                                "isCorrect": false
                            },
                            {
                                "text": "um algoritmo pronto, copiado de outra pessoa",
                                "isCorrect": false
                            },
                            {
                                "text": "um fluxograma, porque desenhou setas no papel",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor está criando o mapa de um aplicativo de trânsito. Ele representa cada rua como uma linha simples no mapa, e ignora de propósito detalhes como a cor das casas ou o tipo de árvore da calçada. Essa escolha de manter só o que é essencial para o problema é um exemplo de:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "abstração",
                                "isCorrect": true
                            },
                            {
                                "text": "decomposição",
                                "isCorrect": false
                            },
                            {
                                "text": "sequência de passos",
                                "isCorrect": false
                            },
                            {
                                "text": "um erro no programa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre pensamento computacional, assinale a alternativa correta:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "decomposição, padrões e abstração organizam o raciocínio antes mesmo de programar",
                                "isCorrect": true
                            },
                            {
                                "text": "pensamento computacional só existe depois de aprender uma linguagem de programação real",
                                "isCorrect": false
                            },
                            {
                                "text": "reconhecer padrões é copiar e colar o mesmo código sem entender o que ele faz",
                                "isCorrect": false
                            },
                            {
                                "text": "abstração significa incluir o máximo de detalhes possível no problema",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Entrada, processamento e saída",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Entrada, processamento e saída\n\nAgora que você já sabe o que é um algoritmo e como quebrar um problema em partes, vale conhecer um padrão que se repete na imensa maioria dos programas que existem: o modelo de entrada, processamento e saída.\n\nPense num liquidificador. Você coloca frutas e água (entrada), ele bate tudo (processamento), e sai um suco pronto (saída). Praticamente todo programa de computador segue essa mesma lógica: ele recebe alguma coisa, faz algum trabalho com essa coisa, e devolve um resultado."
                    },
                    {
                        "type": "text",
                        "value": "## Entrada: o que o programa recebe\n\nEntrada é qualquer informação que o programa recebe para poder trabalhar. Pode ser um número que o usuário digita no teclado, o texto de um formulário, um arquivo salvo no computador, ou até a leitura de um sensor de temperatura.\n\nSem entrada, a maioria dos programas não teria com o que trabalhar. Se você pede para alguém calcular a soma de dois números, primeiro você precisa dizer quais são os dois números: essa informação é a entrada."
                    },
                    {
                        "type": "text",
                        "value": "## Processamento: o que o programa faz com a entrada\n\nProcessamento é o trabalho que o programa realiza em cima da entrada: somar, comparar, organizar, filtrar, calcular. É a parte \"pensante\" do programa, onde a entrada é transformada em alguma coisa nova ou mais útil.\n\nNo exemplo da soma de dois números, o processamento é o próprio cálculo: pegar os dois valores recebidos e somá-los."
                    },
                    {
                        "type": "text",
                        "value": "## Saída: o resultado que o programa devolve\n\nSaída é o resultado que o programa entrega depois de processar a entrada. Pode ser um texto ou número mostrado na tela, um som, um arquivo salvo, ou uma mensagem enviada para outro programa.\n\nNos próximos módulos, a nossa principal forma de ver a saída de um programa vai ser o console, aquela \"telinha\" onde o JavaScript mostra mensagens de texto. Você vai usar isso já na próxima aula."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\",\"Entrada\",\"Processamento\",\"Saída\"],[\"Calculadora simples\",\"Os números digitados\",\"Somar, subtrair, multiplicar ou dividir os números\",\"O resultado mostrado no visor\"],[\"Caixa eletrônico\",\"O valor do saque digitado\",\"Verificar se há saldo suficiente na conta\",\"Dinheiro liberado ou mensagem de saldo insuficiente\"],[\"Site de busca\",\"O termo digitado na busca\",\"Procurar páginas relacionadas ao termo\",\"Lista de resultados mostrada na tela\"],[\"Aplicativo de previsão do tempo\",\"O nome da cidade digitado\",\"Consultar e calcular a previsão para a cidade\",\"A previsão do tempo mostrada na tela\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// Um programa simples costuma seguir este ciclo: entrada, processamento e saída\n\n// Programa: calcular a média de duas notas\n\n// Entrada: nota1 e nota2 (os dois valores que o aluno digitou)\n// Processamento: somar nota1 com nota2 e dividir o resultado por 2\n// Saída: mostrar a média na tela\n\n// Nas próximas aulas você vai aprender a escrever isso em código de verdade"
                    },
                    {
                        "type": "quote",
                        "value": "Quase todo programa segue este ciclo: recebe alguma informação (entrada), faz algum trabalho com ela (processamento) e devolve um resultado (saída)."
                    }
                ],
                "questions": [
                    {
                        "statement": "No modelo de entrada, processamento e saída, o que é a \"entrada\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O que o programa recebe para usar, como um número digitado",
                                "isCorrect": true
                            },
                            {
                                "text": "O resultado final que aparece na tela, pronto para o usuário ver",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome da pessoa que escreveu o programa originalmente",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo que o programa demora para terminar de rodar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma calculadora recebe os números 4 e 6, soma os dois valores e mostra 10 na tela. Nesse exemplo, o que representa a saída?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "o número 10 exibido na tela",
                                "isCorrect": true
                            },
                            {
                                "text": "os números 4 e 6 digitados",
                                "isCorrect": false
                            },
                            {
                                "text": "a soma sendo calculada por dentro",
                                "isCorrect": false
                            },
                            {
                                "text": "o botão de ligar da calculadora",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um aplicativo de previsão do tempo, o usuário digita o nome da cidade, o aplicativo consulta os dados e calcula a previsão, e por fim mostra \"Amanhã: 28 graus e sol\" na tela. O que representa o processamento, nesse exemplo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "o cálculo da previsão a partir dos dados da cidade",
                                "isCorrect": true
                            },
                            {
                                "text": "o nome da cidade que o usuário digitou no início",
                                "isCorrect": false
                            },
                            {
                                "text": "a frase final mostrada na tela com a previsão",
                                "isCorrect": false
                            },
                            {
                                "text": "o usuário abrindo o aplicativo no celular para consultar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre o modelo de entrada, processamento e saída, é correto afirmar que:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "a maioria segue esse ciclo, mesmo com a entrada vindo de um arquivo salvo",
                                "isCorrect": true
                            },
                            {
                                "text": "todo programa obrigatoriamente precisa pedir uma entrada digitada no teclado",
                                "isCorrect": false
                            },
                            {
                                "text": "a saída de todo programa sempre precisa ser um número",
                                "isCorrect": false
                            },
                            {
                                "text": "o processamento é uma etapa opcional, que dá para pular",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um programa lê a temperatura de um sensor a cada minuto, calcula a média das últimas 10 leituras, e liga um alarme sonoro se essa média passar de 40 graus. Qual alternativa identifica corretamente as três partes do modelo, nesse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "entrada: leituras do sensor; processamento: média e comparação com 40; saída: alarme ligado",
                                "isCorrect": true
                            },
                            {
                                "text": "entrada: o alarme sonoro; processamento: as leituras do sensor; saída: o cálculo da média",
                                "isCorrect": false
                            },
                            {
                                "text": "entrada: o cálculo da média; processamento: o alarme sonoro; saída: as leituras do sensor",
                                "isCorrect": false
                            },
                            {
                                "text": "nesse caso não existe entrada nem saída, porque tudo acontece automaticamente sem intervenção",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Do pseudocódigo ao fluxograma",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do pseudocódigo ao fluxograma\n\nAntes de sair escrevendo código de verdade, muitos programadores fazem um rascunho do algoritmo primeiro. É a mesma lógica de um arquiteto que faz uma planta antes de construir uma casa: pensar na estrutura antes de colocar tijolo em cima de tijolo economiza retrabalho.\n\nNesta aula você vai conhecer duas ferramentas para esse rascunho: o pseudocódigo e o fluxograma. Nenhuma das duas é uma linguagem de programação, mas as duas ajudam (e muito) a organizar o pensamento antes de programar."
                    },
                    {
                        "type": "text",
                        "value": "## O que é pseudocódigo\n\nPseudocódigo é uma forma de escrever os passos de um algoritmo em português (ou numa mistura de português com palavras-chave), de um jeito organizado, sem se preocupar com a sintaxe exata de uma linguagem de programação.\n\nA ideia é simples: primeiro você resolve o \"o quê\" (quais passos resolvem o problema, e em que ordem), e só depois se preocupa com o \"como\" (a sintaxe correta do JavaScript, com seus parênteses, vírgulas e ponto e vírgula)."
                    },
                    {
                        "type": "code",
                        "value": "INICIO\n  LER nota1\n  LER nota2\n  media = (nota1 + nota2) / 2\n  ESCREVER media\nFIM\n\n// Repare: isto não é JavaScript de verdade, é pseudocódigo.\n// Ele descreve os passos de forma clara, sem seguir a sintaxe exata de nenhuma linguagem."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um fluxograma\n\nFluxograma é uma forma de representar um algoritmo visualmente, usando caixinhas com formatos diferentes ligadas por setas. Cada formato de caixa tem um significado específico, e as setas mostram a ordem em que os passos acontecem, exatamente como a sequência que você estudou na aula 1.\n\nVocê não precisa desenhar um fluxograma para todo programinha pequeno, mas para problemas maiores, ver o algoritmo desenhado ajuda a enxergar o caminho todo de uma vez, incluindo os pontos onde o programa pode tomar caminhos diferentes (você vai estudar isso a fundo no módulo de condicionais)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Elemento\",\"Formato\",\"O que significa\"],[\"Início ou fim\",\"Oval\",\"Marca onde o algoritmo começa ou termina\"],[\"Ação\",\"Retângulo\",\"Um passo que faz algo, como calcular ou mostrar um valor\"],[\"Decisão\",\"Losango\",\"Uma pergunta que leva a caminhos diferentes (você vai ver isso em breve)\"],[\"Seta\",\"Seta\",\"Indica a ordem, ligando um passo ao próximo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Pseudocódigo, fluxograma e código: três formas do mesmo algoritmo\n\nRepare que pseudocódigo, fluxograma e código em JavaScript podem descrever exatamente o mesmo algoritmo, mudando apenas a forma de representação: texto estruturado, desenho com caixas e setas, ou uma linguagem que o computador realmente entende e executa.\n\nNenhuma das três é \"mais certa\" que a outra. Pseudocódigo e fluxograma são ferramentas para você pensar e se organizar. O código é a etapa final, onde o algoritmo vira alguma coisa que roda de verdade. E é exatamente para isso que a próxima aula existe."
                    },
                    {
                        "type": "quote",
                        "value": "Pseudocódigo e fluxograma são rascunhos do seu algoritmo: ajudam a organizar as ideias antes de escrever a primeira linha de código de verdade."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é pseudocódigo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma forma de descrever os passos de um algoritmo em português",
                                "isCorrect": true
                            },
                            {
                                "text": "Um tipo de erro que aparece no console do navegador",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome de uma linguagem de programação real, tipo Python",
                                "isCorrect": false
                            },
                            {
                                "text": "Um desenho feito só com setas e caixas, sem nenhuma palavra escrita",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um fluxograma, qual formato geralmente representa o início ou o fim do algoritmo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um oval",
                                "isCorrect": true
                            },
                            {
                                "text": "Um losango",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma seta",
                                "isCorrect": false
                            },
                            {
                                "text": "Um retângulo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de escrever o código de um programa que calcula o troco de uma compra, uma programadora escreve num papel: \"LER valor da compra, LER valor pago, troco = valor pago menos valor da compra, ESCREVER troco\". O que ela está fazendo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Escrevendo um pseudocódigo para organizar o raciocínio",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrevendo diretamente o código final em JavaScript, sem rascunho",
                                "isCorrect": false
                            },
                            {
                                "text": "Desenhando um fluxograma com caixas e setas",
                                "isCorrect": false
                            },
                            {
                                "text": "Testando o programa pronto em busca de erros",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal diferença entre pseudocódigo e fluxograma?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pseudocódigo usa texto estruturado; fluxograma usa desenhos com caixas e setas",
                                "isCorrect": true
                            },
                            {
                                "text": "Pseudocódigo é só para programadores avançados; fluxograma é só para iniciantes",
                                "isCorrect": false
                            },
                            {
                                "text": "Fluxograma é uma linguagem de programação de verdade; pseudocódigo não é",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe diferença real: são a mesma coisa, só com nomes diferentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre pseudocódigo, fluxograma e código real (como JavaScript), assinale a alternativa correta:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Os três podem descrever o mesmo algoritmo, mudando só a forma de representação",
                                "isCorrect": true
                            },
                            {
                                "text": "É obrigatório desenhar um fluxograma antes de escrever qualquer linha de código",
                                "isCorrect": false
                            },
                            {
                                "text": "O pseudocódigo precisa seguir exatamente a sintaxe do JavaScript",
                                "isCorrect": false
                            },
                            {
                                "text": "Depois do pseudocódigo pronto, o fluxograma nunca mais serve pra nada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Seu primeiro código: console.log",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Seu primeiro código: console.log\n\nChegou a hora que você estava esperando: hoje você vai escrever e rodar de verdade a sua primeira linha de código em JavaScript. Depois de entender o que é programar, o que é um algoritmo, como quebrar problemas em passos e como planejar com pseudocódigo, está na hora de ver tudo isso ganhar vida na tela.\n\nO comando que você vai aprender agora, o console.log, é provavelmente o comando mais usado por programadores no mundo inteiro, do primeiro dia de estudo até anos de experiência."
                    },
                    {
                        "type": "text",
                        "value": "## O que é o console\n\nO console é o lugar onde o JavaScript pode mostrar mensagens de texto, números e resultados para quem está programando. Pense nele como uma tela simples, só de texto, separada da tela \"bonita\" que o usuário final normalmente vê.\n\nProgramadores usam o console o tempo todo para testar pequenos trechos de código, mostrar o valor de uma informação naquele momento, ou entender por que um programa não está se comportando como esperado. Você vai usar o console em praticamente todas as aulas daqui para frente."
                    },
                    {
                        "type": "code",
                        "value": "console.log(\"Olá, mundo!\");\n\n// saída no console:\n// Olá, mundo!"
                    },
                    {
                        "type": "text",
                        "value": "## Entendendo o console.log por partes\n\nVamos separar o comando console.log(\"Olá, mundo!\"); em pedaços para entender cada um:\n\n- **console**: representa o próprio console, o lugar onde as mensagens aparecem.\n- **.log( )**: é o comando que significa \"escreva isto no console\". Tudo o que você quer mostrar vai dentro dos parênteses.\n- **\"Olá, mundo!\"**: é o texto que será mostrado. Textos em JavaScript sempre ficam entre aspas.\n- **;**: marca o fim da instrução, indicando ao JavaScript que aquele comando terminou ali.\n\nNão se preocupe em decorar esses nomes agora. Com a prática, escrever console.log vai virar automático."
                    },
                    {
                        "type": "code",
                        "value": "console.log(\"Bem-vindo à lógica de programação!\");\nconsole.log(2 + 3);\nconsole.log(10 - 4);\n\n// saída:\n// Bem-vindo à lógica de programação!\n// 5\n// 6"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Erro comum\",\"O que acontece\",\"Como corrigir\"],[\"Esquecer as aspas no texto\",\"O JavaScript tenta entender o texto como um comando ou variável, e dá erro\",\"Sempre colocar textos entre aspas\"],[\"Esquecer de fechar um parêntese\",\"O código não funciona e aparece um erro de sintaxe\",\"Conferir se cada ( tem um ) correspondente\"],[\"Escrever Console.log com C maiúsculo\",\"O JavaScript não reconhece o comando e dá erro\",\"Escrever sempre console.log, tudo em letras minúsculas\"],[\"Esquecer o ponto e vírgula no final\",\"Na maioria das vezes o código ainda funciona, mas não é uma boa prática\",\"Adicionar ; no final de cada instrução\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Você acabou de dar sua primeira instrução para o computador executar, e viu o resultado na tela com os seus próprios olhos. Guarde essa sensação: é o primeiro passo de muitos que ainda vêm por aí."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando usamos em JavaScript para mostrar uma mensagem no console?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "console.log()",
                                "isCorrect": true
                            },
                            {
                                "text": "console.show()",
                                "isCorrect": false
                            },
                            {
                                "text": "print.console()",
                                "isCorrect": false
                            },
                            {
                                "text": "mostrar.log()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\nconsole.log(\"Olá, mundo!\");",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Olá, mundo!",
                                "isCorrect": true
                            },
                            {
                                "text": "console.log",
                                "isCorrect": false
                            },
                            {
                                "text": "\"Olá, mundo!\", com as aspas incluídas",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma saída aparece no console",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída do código abaixo?\nconsole.log(2 + 3);",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "5",
                                "isCorrect": true
                            },
                            {
                                "text": "2 + 3",
                                "isCorrect": false
                            },
                            {
                                "text": "\"2 + 3\"",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro, porque números não podem ficar entre parênteses",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma iniciante escreveu o código abaixo e recebeu um erro:\nconsole.log(Olá, mundo!);\nQual é o motivo mais provável do erro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Faltou colocar aspas no texto, então o JavaScript não reconhece",
                                "isCorrect": true
                            },
                            {
                                "text": "A palavra console foi escrita errada, com letra maiúscula demais",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é possível usar acento ou exclamação dentro do console.log",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltou escrever a palavra imprimir antes de console.log",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre o console e o comando console.log, assinale a alternativa correta:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O console mostra textos, números e resultados, e ajuda a testar o código",
                                "isCorrect": true
                            },
                            {
                                "text": "console.log só funciona se for o único comando do programa",
                                "isCorrect": false
                            },
                            {
                                "text": "Tudo que aparece no console é salvo automaticamente dentro do arquivo do projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "console.log é o único comando que existe na linguagem JavaScript",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Variáveis, tipos e operadores",
        "aulas": [
            {
                "titulo": "Variáveis: guardando valores (let e const)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Variáveis: guardando valores (let e const)\n\nImagine que você tem uma caixa. Nela você cola uma etiqueta escrita \"idade\" e guarda dentro o número 20. Sempre que precisar saber a idade, é só abrir a caixa com esse nome. É exatamente isso que uma **variável** faz em um programa: ela é um espaço com nome (a etiqueta) que guarda um valor (o conteúdo da caixa) para você usar mais tarde.\n\nSem variáveis, um programa não conseguiria guardar nada: nem o nome de um usuário, nem o resultado de uma conta. Nesta aula você vai aprender a criar variáveis em JavaScript usando duas palavras: `let` e `const`."
                    },
                    {
                        "type": "code",
                        "value": "// Para criar uma variável usamos \"let\", seguido do nome e do valor\nlet nome = \"Ana\";\n\nconsole.log(nome);\n// saida: Ana"
                    },
                    {
                        "type": "text",
                        "value": "## Trocando o valor de uma variável\n\nUma variável criada com `let` pode ter seu valor trocado depois. Quando você escreve `nome = \"outra coisa\"` de novo (sem repetir o `let`), você não está criando uma nova caixa: está apenas trocando o que tem dentro da caixa que já existe. É por isso que ela se chama **variável**: o valor pode variar."
                    },
                    {
                        "type": "code",
                        "value": "let idade = 20;\nconsole.log(idade);\n// saida: 20\n\nidade = 21;\nconsole.log(idade);\n// saida: 21"
                    },
                    {
                        "type": "text",
                        "value": "## Quando o valor não deve mudar: const\n\nÀs vezes você guarda um valor que não deve mudar nunca durante o programa, como o valor de um imposto fixo ou o número de dias de uma semana. Para esses casos existe o `const` (de \"constante\"). Ele funciona como o `let` na hora de criar a variável, mas depois disso o JavaScript não deixa você atribuir um novo valor a ela: se tentar, o programa para com um erro.\n\nUma boa prática: use `const` sempre que puder, e só troque para `let` quando você já sabe que vai precisar mudar o valor depois."
                    },
                    {
                        "type": "code",
                        "value": "const PI = 3.14;\nconsole.log(PI);\n// saida: 3.14\n\n// A linha abaixo daria erro, porque PI foi criada com const:\n// PI = 3.15;\n// Erro: Assignment to constant variable.\n\n// Nomes bons de variável ajudam a entender o código:\nlet nomeDoAluno = \"Pedro\";   // bom: descreve o que guarda\nlet x = \"Pedro\";             // funciona, mas não diz nada sobre o valor"
                    },
                    {
                        "type": "quote",
                        "value": "Variável é uma caixa com nome: com `let` o conteúdo pode mudar, com `const` ele fica fixo. Dê nomes claros às suas variáveis, e você mesmo vai entender o próprio código dias depois."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções abaixo cria corretamente uma variável chamada idade guardando o valor 15?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "let idade = 15;",
                                "isCorrect": true
                            },
                            {
                                "text": "let 15 = idade;",
                                "isCorrect": false
                            },
                            {
                                "text": "idade == 15;",
                                "isCorrect": false
                            },
                            {
                                "text": "let idade == 15;",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de executar o código abaixo, o que aparece no console?\nlet cidade = \"Recife\";\ncidade = \"Salvador\";\nconsole.log(cidade);",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Recife",
                                "isCorrect": false
                            },
                            {
                                "text": "Salvador",
                                "isCorrect": true
                            },
                            {
                                "text": "cidade",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que acontece se você tentar reatribuir um novo valor a uma variável criada com const?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O valor é alterado normalmente, como em uma variável com let",
                                "isCorrect": false
                            },
                            {
                                "text": "O programa trava com erro, pois const não é reatribuível",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor antigo e o novo ficam guardados juntos na mesma variável",
                                "isCorrect": false
                            },
                            {
                                "text": "A variável se transforma automaticamente em let",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual dos nomes abaixo é um nome de variável válido em JavaScript?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "1nome",
                                "isCorrect": false
                            },
                            {
                                "text": "nome de usuario",
                                "isCorrect": false
                            },
                            {
                                "text": "nomeDeUsuario",
                                "isCorrect": true
                            },
                            {
                                "text": "nome-de-usuario",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que acontece quando você executa o código abaixo?\nlet pontos = 10;\nlet pontos = 20;\nconsole.log(pontos);",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O console mostra 20",
                                "isCorrect": false
                            },
                            {
                                "text": "O console mostra 10",
                                "isCorrect": false
                            },
                            {
                                "text": "O código dá erro: let não permite redeclarar pontos",
                                "isCorrect": true
                            },
                            {
                                "text": "O console mostra 10 primeiro, e depois mostra 20",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tipos de dados: número, texto e booleano",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Todo valor tem um tipo\n\nNa aula passada você guardou valores dentro de variáveis, mas nem todo valor é do mesmo \"tipo\". Pense em um organizador de gavetas: uma parte guarda números, outra guarda papéis com texto, outra guarda só coisas que estão \"ligadas\" ou \"desligadas\". Em JavaScript, os três tipos mais básicos são:\n\n- **number**: números, inteiros ou com casas decimais\n- **string**: texto, sempre escrito entre aspas\n- **boolean**: apenas dois valores possíveis, `true` (verdadeiro) ou `false` (falso)\n\nO JavaScript descobre o tipo sozinho, olhando para o valor. Para conferir o tipo de uma variável, existe o operador `typeof`."
                    },
                    {
                        "type": "code",
                        "value": "let idade = 25;        // number (número inteiro)\nlet preco = 19.90;     // number (número com casas decimais)\nlet nome = \"Maria\";    // string (texto entre aspas)\nlet ativo = true;      // boolean (verdadeiro ou falso)\n\nconsole.log(typeof idade);\n// saida: number\n\nconsole.log(typeof nome);\n// saida: string\n\nconsole.log(typeof ativo);\n// saida: boolean"
                    },
                    {
                        "type": "text",
                        "value": "## Juntando textos: concatenação e template string\n\nQuando os dois lados de um `+` são texto, o `+` não soma: ele **concatena**, ou seja, junta um texto no final do outro. É a forma mais antiga de montar uma frase com valores de variáveis dentro.\n\nExiste também uma forma mais moderna e mais fácil de ler: a **template string**. Em vez de aspas comuns, você usa crase (`) para abrir e fechar o texto, e coloca `${nomeDaVariavel}` no meio para inserir o valor de uma variável ali."
                    },
                    {
                        "type": "code",
                        "value": "let nomeX = \"Carlos\";\nlet idadeX = 30;\n\n// Concatenando com +\nconsole.log(\"Nome: \" + nomeX + \", idade: \" + idadeX);\n// saida: Nome: Carlos, idade: 30\n\n// Com template string (mais fácil de ler e escrever)\nconsole.log(`Nome: ${nomeX}, idade: ${idadeX}`);\n// saida: Nome: Carlos, idade: 30"
                    },
                    {
                        "type": "text",
                        "value": "## Cuidado: \"10\" não é o mesmo que 10\n\nUma armadilha comum para quem está começando: `\"10\"` (com aspas) é uma string, um texto que por acaso parece um número. Já `10` (sem aspas) é um number de verdade. Eles até podem parecer iguais na tela, mas se comportam de formas diferentes nas contas.\n\nO operador `+` é o mais traiçoeiro aqui: se pelo menos um dos lados for string, o `+` concatena em vez de somar. Por isso `\"5\" + 3` não dá 8: dá o texto `\"53\"`, porque o `3` é transformado em texto e colado depois do `\"5\"`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Expressão\", \"Aparece no console\", \"Tipo do resultado\"], [\"10 + 5\", \"15\", \"number\"], [\"\\\"10\\\" + 5\", \"105\", \"string\"], [\"\\\"5\\\" + 3\", \"53\", \"string\"], [\"5 + \\\"3\\\"\", \"53\", \"string\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Todo valor tem um tipo: number para números, string para texto (sempre entre aspas ou crase) e boolean para verdadeiro ou falso. E cuidado com o +: perto de uma string, ele não soma, ele junta."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o tipo (typeof) do valor 42 em JavaScript?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "string",
                                "isCorrect": false
                            },
                            {
                                "text": "number",
                                "isCorrect": true
                            },
                            {
                                "text": "boolean",
                                "isCorrect": false
                            },
                            {
                                "text": "texto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é um valor do tipo string?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "25",
                                "isCorrect": false
                            },
                            {
                                "text": "true",
                                "isCorrect": false
                            },
                            {
                                "text": "\"25\"",
                                "isCorrect": true
                            },
                            {
                                "text": "false",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que aparece no console depois deste código?\nlet cidade = \"Belo Horizonte\";\nlet pais = \"Brasil\";\nconsole.log(`Cidade: ${cidade}, país: ${pais}`);",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cidade: ${cidade}, país: ${pais}",
                                "isCorrect": false
                            },
                            {
                                "text": "Cidade: Belo Horizonte, país: Brasil",
                                "isCorrect": true
                            },
                            {
                                "text": "Cidade: cidade, país: pais",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso não é um código válido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de let ativo = false; qual é o resultado de console.log(typeof ativo);?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "false",
                                "isCorrect": false
                            },
                            {
                                "text": "boolean",
                                "isCorrect": true
                            },
                            {
                                "text": "true",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o resultado de console.log(\"5\" + 3);?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "8 (um number)",
                                "isCorrect": false
                            },
                            {
                                "text": "\"53\" (uma string)",
                                "isCorrect": true
                            },
                            {
                                "text": "53 (um number)",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de execução, por misturar texto com número",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Operadores aritméticos (e o resto com %)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## JavaScript também é uma calculadora\n\nAlém de guardar valores, o JavaScript sabe fazer contas. Os operadores aritméticos funcionam quase igual à matemática que você já conhece: soma, subtração, multiplicação e divisão. Só tem um operador a mais, que talvez seja novo para você: o `%`, que devolve o resto de uma divisão, e é um dos mais úteis no dia a dia de quem programa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Operador\", \"Significado\", \"Exemplo\", \"Resultado\"], [\"+\", \"soma\", \"10 + 3\", \"13\"], [\"-\", \"subtração\", \"10 - 3\", \"7\"], [\"*\", \"multiplicação\", \"10 * 3\", \"30\"], [\"/\", \"divisão\", \"9 / 2\", \"4.5\"], [\"%\", \"resto da divisão\", \"10 % 3\", \"1\"]]"
                    },
                    {
                        "type": "code",
                        "value": "console.log(10 + 3);\n// saida: 13\n\nconsole.log(10 - 3);\n// saida: 7\n\nconsole.log(10 * 3);\n// saida: 30\n\nconsole.log(9 / 2);\n// saida: 4.5"
                    },
                    {
                        "type": "text",
                        "value": "## O resto da divisão (%) e a ordem das contas\n\nO `%` devolve o que sobra quando uma divisão não é exata. É como dividir 10 balas entre 3 amigos: cada um fica com 3 balas, e sobra 1 na mão. Em código, `10 % 3` é exatamente esse resto: `1`.\n\nUma das aplicações mais comuns do `%` é descobrir se um número é par ou ímpar: todo número par dividido por 2 tem resto 0, e todo número ímpar tem resto 1.\n\nAssim como na matemática da escola, multiplicação e divisão são calculadas antes de soma e subtração. Se você quiser forçar uma ordem diferente, use parênteses, exatamente como faria no papel."
                    },
                    {
                        "type": "code",
                        "value": "// Descobrindo se um número é par ou ímpar\nlet numero = 7;\nconsole.log(numero % 2);\n// saida: 1 (sobrou 1, então numero é ímpar)\n\nlet outroNumero = 8;\nconsole.log(outroNumero % 2);\n// saida: 0 (não sobrou nada, então outroNumero é par)"
                    },
                    {
                        "type": "code",
                        "value": "console.log(2 + 3 * 4);\n// saida: 14 (multiplica 3 * 4 primeiro, depois soma o 2)\n\nconsole.log((2 + 3) * 4);\n// saida: 20 (o parêntese força a soma a acontecer primeiro)"
                    },
                    {
                        "type": "quote",
                        "value": "Os operadores aritméticos fazem contas como na matemática, e o % é ótimo para descobrir sobras, como saber se um número é par ou ímpar. Na dúvida sobre a ordem das contas, use parênteses."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o resultado de console.log(10 % 3);?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "3",
                                "isCorrect": false
                            },
                            {
                                "text": "3.33",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": true
                            },
                            {
                                "text": "30",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual operador devolve o resto de uma divisão em JavaScript?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "/",
                                "isCorrect": false
                            },
                            {
                                "text": "%",
                                "isCorrect": true
                            },
                            {
                                "text": "*",
                                "isCorrect": false
                            },
                            {
                                "text": "//",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o resultado de console.log(2 + 3 * 4);?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "20",
                                "isCorrect": false
                            },
                            {
                                "text": "14",
                                "isCorrect": true
                            },
                            {
                                "text": "24",
                                "isCorrect": false
                            },
                            {
                                "text": "9",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma variável chamada idade guarda um número inteiro. Qual expressão resulta em 0 quando esse número é par?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "idade / 2",
                                "isCorrect": false
                            },
                            {
                                "text": "idade % 2",
                                "isCorrect": true
                            },
                            {
                                "text": "idade * 2",
                                "isCorrect": false
                            },
                            {
                                "text": "idade - 2",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o resultado de console.log(10 - 4 % 3 + 2 * 2);?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "13",
                                "isCorrect": true
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "9",
                                "isCorrect": false
                            },
                            {
                                "text": "5",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Comparações: = x === e os sinais de comparação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Fazendo perguntas com o código\n\nAté agora você fez contas que devolvem números. Mas também é possível fazer perguntas ao JavaScript, do tipo \"esse valor é maior que aquele?\" ou \"esses dois valores são iguais?\". Essas perguntas são os **operadores de comparação**, e a resposta é sempre um boolean: `true` ou `false`, exatamente como você viu na aula sobre tipos de dados."
                    },
                    {
                        "type": "code",
                        "value": "console.log(5 > 3);\n// saida: true\n\nconsole.log(5 < 3);\n// saida: false\n\nconsole.log(5 >= 5);\n// saida: true\n\nconsole.log(5 <= 4);\n// saida: false\n\nconsole.log(5 === 5);\n// saida: true\n\nconsole.log(5 !== 5);\n// saida: false"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Operador\", \"Significado\", \"Exemplo\", \"Resultado\"], [\"===\", \"igual a (valor e tipo)\", \"5 === 5\", \"true\"], [\"!==\", \"diferente de\", \"5 !== 3\", \"true\"], [\">\", \"maior que\", \"5 > 3\", \"true\"], [\"<\", \"menor que\", \"5 < 3\", \"false\"], [\">=\", \"maior ou igual a\", \"5 >= 5\", \"true\"], [\"<=\", \"menor ou igual a\", \"5 <= 4\", \"false\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O erro mais comum de quem está começando: = e ===\n\nEsse é o ponto em que quase todo iniciante tropeça uma vez: `=` e `===` parecem parecidos, mas fazem coisas completamente diferentes.\n\n- `=` é **atribuição**: guarda um valor dentro de uma variável. `idade = 18` significa \"coloque 18 dentro de idade\".\n- `===` é **comparação**: pergunta se dois valores são iguais, e devolve `true` ou `false`. `idade === 18` significa \"idade é igual a 18?\".\n\nExiste também o `==`, mais antigo, que compara os valores mas ignora o tipo, convertendo um lado na tentativa de bater com o outro. Isso pode gerar resultados que confundem até quem já tem experiência. Por isso, prefira sempre `===` e `!==`: eles comparam o valor e o tipo juntos, sem conversões escondidas, e o resultado é mais previsível."
                    },
                    {
                        "type": "code",
                        "value": "let numero = 10;\n// isso é atribuição: guarda 10 dentro de numero\n\nconsole.log(numero === 10);\n// saida: true (isso é comparação: numero é igual a 10?)\n\nconsole.log(\"5\" == 5);\n// saida: true (== converte o tipo antes de comparar)\n\nconsole.log(\"5\" === 5);\n// saida: false (=== compara valor E tipo, sem conversão)"
                    },
                    {
                        "type": "code",
                        "value": "let idadeAna = 25;\nlet idadeBruno = 30;\n\nconsole.log(idadeAna > idadeBruno);\n// saida: false\n\nconsole.log(idadeAna !== idadeBruno);\n// saida: true"
                    },
                    {
                        "type": "quote",
                        "value": "Um único sinal de igual (=) guarda um valor. Três sinais (===) perguntam se dois valores são iguais. Prefira sempre === e !== no lugar de == e !=: o resultado é mais previsível."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o resultado de console.log(7 > 5);?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "true",
                                "isCorrect": true
                            },
                            {
                                "text": "false",
                                "isCorrect": false
                            },
                            {
                                "text": "7",
                                "isCorrect": false
                            },
                            {
                                "text": "5",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual símbolo devemos usar em JavaScript para comparar se dois valores são iguais, considerando também o tipo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "=",
                                "isCorrect": false
                            },
                            {
                                "text": "==",
                                "isCorrect": false
                            },
                            {
                                "text": "===",
                                "isCorrect": true
                            },
                            {
                                "text": "eq",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença entre estas duas linhas?\nlinha 1: idade = 18;\nlinha 2: idade === 18;",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As duas linhas fazem exatamente a mesma coisa",
                                "isCorrect": false
                            },
                            {
                                "text": "A linha 1 guarda 18 em idade; a linha 2 pergunta se é igual a 18",
                                "isCorrect": true
                            },
                            {
                                "text": "A linha 1 compara valores; a linha 2 guarda um valor booleano",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas comparam, mas com tipos diferentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das expressões abaixo resulta em false?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "10 !== 5",
                                "isCorrect": false
                            },
                            {
                                "text": "10 === 10",
                                "isCorrect": false
                            },
                            {
                                "text": "10 >= 11",
                                "isCorrect": true
                            },
                            {
                                "text": "10 <= 10",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que aparece no console?\nconsole.log(\"10\" === 10);\nconsole.log(\"10\" == 10);",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "true e depois true",
                                "isCorrect": false
                            },
                            {
                                "text": "false e depois false",
                                "isCorrect": false
                            },
                            {
                                "text": "false e depois true",
                                "isCorrect": true
                            },
                            {
                                "text": "true e depois false",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Operadores lógicos: e, ou, não",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Combinando perguntas\n\nÀs vezes uma única pergunta não basta. Pense em entrar numa festa: pode ser que você precise ter convite E estar na lista de convidados. Ou talvez baste ter convite OU ser amigo de quem está organizando. Em JavaScript, esses \"e\" e \"ou\" são operadores lógicos, e existe também o \"não\", que inverte uma resposta. Os três são:\n\n- `&&` (e): só é true se os dois lados forem true\n- `||` (ou): é true se pelo menos um dos lados for true\n- `!` (não): inverte o valor, transforma true em false e false em true"
                    },
                    {
                        "type": "code",
                        "value": "console.log(true && true);\n// saida: true\n\nconsole.log(true && false);\n// saida: false\n\nconsole.log(true || false);\n// saida: true\n\nconsole.log(false || false);\n// saida: false\n\nconsole.log(!true);\n// saida: false\n\nconsole.log(!false);\n// saida: true"
                    },
                    {
                        "type": "table",
                        "value": "[[\"A\", \"B\", \"A && B\", \"A || B\"], [\"true\", \"true\", \"true\", \"true\"], [\"true\", \"false\", \"false\", \"true\"], [\"false\", \"true\", \"false\", \"true\"], [\"false\", \"false\", \"false\", \"false\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Combinando comparações de verdade\n\nO uso mais comum de `&&` e `||` é juntar comparações, para criar regras mais completas. Por exemplo: \"a pessoa pode dirigir se tiver 18 anos ou mais E tiver carteira de motorista\". Isso vira uma comparação com `>=` combinada a uma variável boolean, usando `&&`.\n\nQuando misturar várias comparações numa mesma expressão, você pode usar parênteses para deixar bem claro o que deve ser calculado em cada parte, do mesmo jeito que fez com contas na aula sobre operadores aritméticos."
                    },
                    {
                        "type": "code",
                        "value": "let idade = 20;\nlet temCarteira = true;\n\nconsole.log(idade >= 18 && temCarteira);\n// saida: true (as duas condições são verdadeiras)\n\nlet temCupom = false;\nlet totalCompra = 150;\n\nconsole.log(totalCompra > 100 || temCupom);\n// saida: true (basta uma condição verdadeira para o ||)"
                    },
                    {
                        "type": "code",
                        "value": "let chovendo = false;\nconsole.log(!chovendo);\n// saida: true (não está chovendo)\n\nlet idadeVisitante = 15;\nconsole.log(!(idadeVisitante >= 18));\n// saida: true (não é verdade que a idade é maior ou igual a 18)"
                    },
                    {
                        "type": "quote",
                        "value": "&& exige que os dois lados sejam verdadeiros, || basta que um lado seja verdadeiro, e ! inverte o valor. Combine comparações com esses operadores para escrever regras mais completas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o resultado de console.log(true && false);?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "true",
                                "isCorrect": false
                            },
                            {
                                "text": "false",
                                "isCorrect": true
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            },
                            {
                                "text": "erro de execução",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o resultado de console.log(!true);?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "true",
                                "isCorrect": false
                            },
                            {
                                "text": "false",
                                "isCorrect": true
                            },
                            {
                                "text": "!true",
                                "isCorrect": false
                            },
                            {
                                "text": "null",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o resultado de console.log(false || true);?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "false",
                                "isCorrect": false
                            },
                            {
                                "text": "true",
                                "isCorrect": true
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma loja só oferece frete grátis se o valor da compra for maior que 100 OU o cliente tiver um cupom. Sendo total o valor da compra e temCupom um boolean, qual expressão representa essa regra corretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "total > 100 && temCupom",
                                "isCorrect": false
                            },
                            {
                                "text": "total > 100 || temCupom",
                                "isCorrect": true
                            },
                            {
                                "text": "total > 100 || !temCupom",
                                "isCorrect": false
                            },
                            {
                                "text": "total < 100 || temCupom",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o valor de console.log((5 > 2 && 3 > 10) || (7 === 7 && 4 < 10));?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "true",
                                "isCorrect": true
                            },
                            {
                                "text": "false",
                                "isCorrect": false
                            },
                            {
                                "text": "7",
                                "isCorrect": false
                            },
                            {
                                "text": "erro de execução",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Condicionais: decisões no código",
        "aulas": [
            {
                "titulo": "Tomando decisões com if",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Condicionais: o programa toma decisões\n\nAté aqui, os seus programas rodam sempre do mesmo jeito: começam na primeira linha e vão até a última, sem desviar. Mas o mundo real está cheio de decisões, e um programa útil também precisa decidir. Uma loja só aprova uma compra se o cliente tiver saldo suficiente. Um site só libera o conteúdo se o usuário estiver logado. Um jogo só declara vitória se o jogador atingiu a pontuação certa.\n\nPense em uma decisão do seu dia a dia: **se chover, eu levo o guarda-chuva**. Repare na estrutura dessa frase: existe uma condição (\"chover\") e existe uma ação que só acontece quando essa condição é verdadeira (\"levar o guarda-chuva\"). Se não chover, a ação simplesmente não acontece, e você segue a vida sem guarda-chuva.\n\n## Conhecendo o if\n\nEm JavaScript, essa ideia tem um nome e uma sintaxe: a estrutura `if` (do inglês, \"se\"). Ela testa uma condição booleana, o `true` ou `false` que você já viu no módulo 2, e só executa um bloco de código quando essa condição é `true`."
                    },
                    {
                        "type": "code",
                        "value": "let saldo = 200;\nlet preco = 150;\n\nif (saldo >= preco) {\n  console.log(\"Compra aprovada!\");\n}\n\n// saida: Compra aprovada!"
                    },
                    {
                        "type": "text",
                        "value": "Repare nas três partes do `if`:\n\n- A palavra `if`, seguida de uma condição entre parênteses: `(saldo >= preco)`. Essa condição precisa resultar em `true` ou `false`, exatamente como os operadores de comparação que você já usou no módulo 2.\n- Um bloco de código entre chaves `{ }`. É o que executa quando a condição é verdadeira.\n- Se a condição for `false`, o bloco inteiro é ignorado, como se nem existisse, e o programa segue direto para a linha depois da chave de fechamento.\n\n## Quando a condição é falsa\n\nVamos ver o outro lado: o que acontece quando a condição não se cumpre."
                    },
                    {
                        "type": "code",
                        "value": "let idade = 15;\n\nif (idade >= 18) {\n  console.log(\"Pode entrar na festa\");\n}\n\nconsole.log(\"Programa terminou\");\n\n// saida:\n// Programa terminou"
                    },
                    {
                        "type": "text",
                        "value": "Como `idade` vale 15, a condição `idade >= 18` é `false`. O bloco do `if` nunca roda, então a mensagem \"Pode entrar na festa\" nunca aparece. Mas o `console.log(\"Programa terminou\")` está fora das chaves do `if`, então ele roda de qualquer forma: o `if` só controla o que está dentro dele.\n\n## Dois erros muito comuns\n\nO primeiro erro é esquecer as chaves quando o bloco tem mais de uma linha. Em JavaScript, se você escrever `if (condição) linha1; linha2;` sem chaves, apenas `linha1` pertence ao `if`, e `linha2` roda sempre. Por isso, sempre coloque as chaves, mesmo quando o bloco tem uma linha só: é mais seguro e mais fácil de ler.\n\nO segundo erro é digitar `=` (atribuição) em vez de `===` (comparação) dentro da condição. Esse deslize não trava o programa com um erro, e é exatamente por isso que ele é perigoso: muda o comportamento do código sem avisar."
                    },
                    {
                        "type": "code",
                        "value": "let idade = 15;\n\n// Erro: usar = (atribuicao) em vez de === (comparacao)\nif (idade = 18) {\n  console.log(\"Maior de idade\");\n}\n\n// saida: Maior de idade\n\n// idade = 18 ATRIBUI 18 a idade, e o if usa o resultado dessa\n// atribuicao, que e 18. JavaScript trata qualquer numero diferente\n// de zero como um valor \"verdadeiro\", entao o if roda mesmo com\n// idade tendo sido 15 antes. O certo era: if (idade === 18)"
                    },
                    {
                        "type": "quote",
                        "value": "O if executa um bloco somente quando sua condição é true. Sempre use chaves, mesmo em blocos de uma linha só, e sempre use === para comparar, nunca =."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a saída no console deste código?\n\nlet nota = 7;\n\nif (nota >= 6) {\n  console.log(\"Aprovado\");\n}\n\nconsole.log(\"Fim\");",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Aprovado, e depois Fim",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas Aprovado",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas Fim",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma mensagem, o código gera erro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída no console deste código?\n\nlet idade = 12;\n\nif (idade >= 18) {\n  console.log(\"Maior de idade\");\n}\n\nconsole.log(\"Verificação concluída\");",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Apenas Verificação concluída",
                                "isCorrect": true
                            },
                            {
                                "text": "Maior de idade, e depois Verificação concluída",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas Maior de idade",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma mensagem aparece",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nlet x = 3;\n\nif (x > 5)\n  console.log(\"x é grande\");\n  console.log(\"sempre imprime\");",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Apenas \"sempre imprime\"",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas \"x é grande\"",
                                "isCorrect": false
                            },
                            {
                                "text": "\"x é grande\" e depois \"sempre imprime\"",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma mensagem, porque faltam as chaves e o código não roda",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código, e por quê?\n\nlet numero = 0;\n\nif (numero = 5) {\n  console.log(\"Entrou no if\");\n}",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "\"Entrou no if\", pois = atribui 5 a numero, e o if trata 5 como verdadeiro",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada é impresso, porque numero era 0, que é falso",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de sintaxe: JavaScript não permite = dentro de um if",
                                "isCorrect": false
                            },
                            {
                                "text": "\"Entrou no if\", porque = e === funcionam exatamente da mesma forma dentro de uma condição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer aprovar uma compra somente quando o saldo for maior ou igual ao preço. Qual trecho de código faz isso corretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "if (saldo >= preco) {\n  console.log(\"Aprovado\");\n}",
                                "isCorrect": true
                            },
                            {
                                "text": "if (saldo = preco) {\n  console.log(\"Aprovado\");\n}",
                                "isCorrect": false
                            },
                            {
                                "text": "if saldo >= preco {\n  console.log(\"Aprovado\");\n}",
                                "isCorrect": false
                            },
                            {
                                "text": "if (saldo >= preco);\n{\n  console.log(\"Aprovado\");\n}",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "if/else: o outro caminho",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## if/else: o outro caminho\n\nNo módulo anterior você viu o `if`: ele executa um bloco quando a condição é verdadeira e, quando é falsa, simplesmente não faz nada. Mas muitas decisões do dia a dia têm dois lados. Se chover, você leva guarda-chuva; se não chover, você leva boné para o sol. Sempre existe uma ação para os dois casos, não só para um.\n\nEm JavaScript, quem representa esse \"caso contrário\" é a palavra `else` (em inglês, \"senão\"). Ela se junta ao `if` para criar dois caminhos: um para quando a condição é verdadeira, outro para quando é falsa."
                    },
                    {
                        "type": "code",
                        "value": "let idade = 15;\n\nif (idade >= 18) {\n  console.log(\"Maior de idade\");\n} else {\n  console.log(\"Menor de idade\");\n}\n\n// saida: Menor de idade"
                    },
                    {
                        "type": "text",
                        "value": "## Como o else funciona\n\nRepare em três detalhes importantes:\n\n- O `else` nunca tem sua própria condição entre parênteses. Ele representa \"em qualquer outro caso\", ou seja, quando a condição do `if` deu `false`.\n- O `else` é opcional. Você pode usar só `if`, sem `else`, como fez no módulo anterior. Mas quando usa os dois juntos, sempre um dos blocos roda, nunca os dois, e nunca nenhum.\n- Assim como o `if`, o bloco do `else` também precisa das chaves `{ }`, mesmo que tenha uma linha só.\n\nUm uso clássico do if/else é decidir se um número é par ou ímpar. Um número é par quando o resto da divisão dele por 2 é zero, e você já conhece o operador que calcula esse resto: o `%`, do módulo 2."
                    },
                    {
                        "type": "code",
                        "value": "let numero = 7;\n\nif (numero % 2 === 0) {\n  console.log(numero + \" é par\");\n} else {\n  console.log(numero + \" é ímpar\");\n}\n\n// saida: 7 é ímpar"
                    },
                    {
                        "type": "code",
                        "value": "// Outro exemplo classico: descobrir qual de dois numeros e o maior\nlet a = 12;\nlet b = 7;\n\nif (a >= b) {\n  console.log(a + \" é o maior\");\n} else {\n  console.log(b + \" é o maior\");\n}\n\n// saida: 12 é o maior"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Condição do if\",\"Sem else\",\"Com else\"],[\"true\",\"Executa o bloco do if\",\"Executa o bloco do if\"],[\"false\",\"Não executa nada\",\"Executa o bloco do else\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O else é o caminho de quando a condição do if é falsa. Ele não tem condição própria, é opcional, e junto com o if garante que sempre um dos dois blocos vai rodar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a saída no console?\n\nlet idade = 20;\n\nif (idade >= 18) {\n  console.log(\"Maior de idade\");\n} else {\n  console.log(\"Menor de idade\");\n}",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Maior de idade",
                                "isCorrect": true
                            },
                            {
                                "text": "Menor de idade",
                                "isCorrect": false
                            },
                            {
                                "text": "Maior de idade e Menor de idade, os dois",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma mensagem aparece",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída no console?\n\nlet numero = 10;\n\nif (numero % 2 === 0) {\n  console.log(\"par\");\n} else {\n  console.log(\"ímpar\");\n}",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "par",
                                "isCorrect": true
                            },
                            {
                                "text": "ímpar",
                                "isCorrect": false
                            },
                            {
                                "text": "10",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída no console?\n\nlet a = 6;\nlet b = 6;\n\nif (a >= b) {\n  console.log(a + \" é o maior\");\n} else {\n  console.log(b + \" é o maior\");\n}",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "6 é o maior",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma mensagem, porque os dois números são iguais",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de execução, porque a e b são iguais",
                                "isCorrect": false
                            },
                            {
                                "text": "6 é o maior aparece duas vezes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma estrutura if/else, é possível o bloco do if e o bloco do else executarem os dois na mesma rodada do programa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, sempre apenas um dos dois roda",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, sempre que a condição for true",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, os dois sempre rodam",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende da posição das chaves no código",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código, e por quê?\n\nlet ativo = false;\n\nif (ativo = true) {\n  console.log(\"Conta ativa\");\n} else {\n  console.log(\"Conta inativa\");\n}",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "\"Conta ativa\", pois ativo = true atribui true e vira a condição do if",
                                "isCorrect": true
                            },
                            {
                                "text": "\"Conta inativa\", porque ativo começou como false",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de sintaxe: não é permitido usar = dentro de um if",
                                "isCorrect": false
                            },
                            {
                                "text": "\"Conta ativa\" na primeira execução e \"Conta inativa\" nas seguintes",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "else if: várias condições em cadeia",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## else if: encadeando várias condições\n\nAté agora você viu decisões com dois caminhos: `if` sozinho (um caminho) e `if/else` (dois caminhos). Mas muita decisão da vida real tem mais de duas opções. Pense em como uma escola costuma classificar uma prova: nota de 9 a 10 é conceito A, de 7 a 8.9 é B, de 5 a 6.9 é C, abaixo de 5 é D. São quatro caminhos possíveis, não dois.\n\nPara isso, o JavaScript deixa você encadear condições com `else if` (\"senão, se\"). Você pode usar quantos `else if` precisar entre o `if` e o `else` final."
                    },
                    {
                        "type": "code",
                        "value": "let nota = 8;\n\nif (nota >= 9) {\n  console.log(\"Conceito A\");\n} else if (nota >= 7) {\n  console.log(\"Conceito B\");\n} else if (nota >= 5) {\n  console.log(\"Conceito C\");\n} else {\n  console.log(\"Conceito D\");\n}\n\n// saida: Conceito B"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Faixa de nota\",\"Conceito\"],[\"nota >= 9\",\"A\"],[\"7 <= nota < 9\",\"B\"],[\"5 <= nota < 7\",\"C\"],[\"nota < 5\",\"D\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A ordem importa\n\nO JavaScript testa as condições de cima para baixo e para no primeiro `if` ou `else if` que der `true`. Todos os outros, mesmo que também fossem verdadeiros, são ignorados. Por isso a ordem das checagens não é um detalhe, é parte da lógica.\n\nVeja o que acontece quando a ordem está errada:"
                    },
                    {
                        "type": "code",
                        "value": "let nota = 9.5;\n\nif (nota >= 5) {\n  console.log(\"Conceito C\");\n} else if (nota >= 7) {\n  console.log(\"Conceito B\");\n} else if (nota >= 9) {\n  console.log(\"Conceito A\");\n}\n\n// saida: Conceito C\n\n// nota vale 9.5, entao as tres condicoes seriam verdadeiras. Mas o\n// JavaScript para na primeira que encontra: \"nota >= 5\" ja e true,\n// entao os dois \"else if\" seguintes nunca chegam a ser testados.\n// Nesse codigo, \"Conceito A\" e \"Conceito B\" nunca aparecem para\n// nenhuma nota, porque toda nota que passaria neles tambem passa\n// em \"nota >= 5\", que vem primeiro."
                    },
                    {
                        "type": "code",
                        "value": "let idade = 15;\n\nif (idade < 13) {\n  console.log(\"Criança\");\n} else if (idade < 18) {\n  console.log(\"Adolescente\");\n} else if (idade < 60) {\n  console.log(\"Adulto\");\n} else {\n  console.log(\"Idoso\");\n}\n\n// saida: Adolescente"
                    },
                    {
                        "type": "quote",
                        "value": "else if encadeia várias condições em ordem. O JavaScript testa de cima para baixo e para na primeira verdadeira, então a ordem das checagens muda o resultado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a saída?\n\nlet nota = 9;\n\nif (nota >= 9) {\n  console.log(\"Conceito A\");\n} else if (nota >= 7) {\n  console.log(\"Conceito B\");\n} else if (nota >= 5) {\n  console.log(\"Conceito C\");\n} else {\n  console.log(\"Conceito D\");\n}",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Conceito A",
                                "isCorrect": true
                            },
                            {
                                "text": "Conceito B",
                                "isCorrect": false
                            },
                            {
                                "text": "Conceito C",
                                "isCorrect": false
                            },
                            {
                                "text": "Conceito D",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída?\n\nlet idade = 70;\n\nif (idade < 13) {\n  console.log(\"Criança\");\n} else if (idade < 18) {\n  console.log(\"Adolescente\");\n} else if (idade < 60) {\n  console.log(\"Adulto\");\n} else {\n  console.log(\"Idoso\");\n}",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Idoso",
                                "isCorrect": true
                            },
                            {
                                "text": "Adulto",
                                "isCorrect": false
                            },
                            {
                                "text": "Adolescente",
                                "isCorrect": false
                            },
                            {
                                "text": "Criança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída?\n\nlet nota = 4;\n\nif (nota >= 9) {\n  console.log(\"Conceito A\");\n} else if (nota >= 7) {\n  console.log(\"Conceito B\");\n} else if (nota >= 5) {\n  console.log(\"Conceito C\");\n} else {\n  console.log(\"Conceito D\");\n}",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Conceito D",
                                "isCorrect": true
                            },
                            {
                                "text": "Conceito C",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum conceito é exibido",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro, porque nenhuma condição bateu",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No código abaixo, em que situação a mensagem \"Conceito A\" seria exibida?\n\nif (nota >= 5) {\n  console.log(\"Conceito C\");\n} else if (nota >= 7) {\n  console.log(\"Conceito B\");\n} else if (nota >= 9) {\n  console.log(\"Conceito A\");\n}",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Em nenhuma situação, pois quem chegaria a isso já caiu antes em nota >= 5",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando nota for exatamente 9 ou mais, pois passa direto pela primeira checagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando nota for menor que 5, pulando as duas primeiras condições",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre que nota for um número par, independente do valor exato",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se a cadeia de categorias por idade fosse escrita nesta ordem:\n\nif (idade < 60) {\n  console.log(\"Adulto\");\n} else if (idade < 18) {\n  console.log(\"Adolescente\");\n} else if (idade < 13) {\n  console.log(\"Criança\");\n} else {\n  console.log(\"Idoso\");\n}\n\nQual seria a saída para idade = 10?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Adulto",
                                "isCorrect": true
                            },
                            {
                                "text": "Criança",
                                "isCorrect": false
                            },
                            {
                                "text": "Idoso",
                                "isCorrect": false
                            },
                            {
                                "text": "Adolescente",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Condições compostas com e, ou, não",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Condições compostas: e, ou, não\n\nMuitas decisões dependem de mais de uma coisa ao mesmo tempo. Para entrar em uma festa, normalmente é preciso ter idade suficiente **e** ter o ingresso, as duas coisas juntas. Já um desconto de meia-entrada costuma valer para quem é estudante **ou** idoso, basta uma das duas condições.\n\nVocê já conheceu esses operadores lógicos no módulo 2:\n\n- `&&` (e): o resultado só é `true` quando as duas condições são `true`.\n- `||` (ou): o resultado é `true` quando pelo menos uma das condições é `true`.\n- `!` (não): inverte um valor booleano, transforma `true` em `false` e vice-versa.\n\nAgora vamos usar os três dentro de condições de `if`, para tomar decisões mais completas. Um exemplo clássico que pede o `&&`: descobrir qual de três números é o maior. Um número só é o maior quando ele é maior ou igual aos outros dois ao mesmo tempo."
                    },
                    {
                        "type": "code",
                        "value": "let a = 4;\nlet b = 15;\nlet c = 9;\n\nif (a >= b && a >= c) {\n  console.log(a + \" é o maior\");\n} else if (b >= a && b >= c) {\n  console.log(b + \" é o maior\");\n} else {\n  console.log(c + \" é o maior\");\n}\n\n// saida: 15 é o maior"
                    },
                    {
                        "type": "code",
                        "value": "let estudante = false;\nlet idoso = true;\n\nif (estudante || idoso) {\n  console.log(\"Tem direito a meia-entrada\");\n} else {\n  console.log(\"Paga o valor cheio\");\n}\n\n// saida: Tem direito a meia-entrada"
                    },
                    {
                        "type": "text",
                        "value": "Repare na diferença entre os dois operadores. No exemplo dos três números, `a` só é o maior quando `a >= b` e `a >= c` ao mesmo tempo: se qualquer uma dessas duas comparações for `false`, o `&&` inteiro vira `false` e aquele `if` (ou `else if`) não roda. Já no exemplo do desconto, basta uma das duas condições (`estudante` ou `idoso`) ser `true` para o `||` valer `true`.\n\nO terceiro operador, `!`, inverte uma condição. Ele é útil quando você quer testar \"quando NÃO for o caso\"."
                    },
                    {
                        "type": "code",
                        "value": "let bloqueado = false;\n\nif (!bloqueado) {\n  console.log(\"Acesso liberado\");\n} else {\n  console.log(\"Acesso negado\");\n}\n\n// saida: Acesso liberado\n\n// !bloqueado inverte o valor de bloqueado. Como bloqueado e false,\n// !bloqueado vira true, e o bloco do if roda."
                    },
                    {
                        "type": "table",
                        "value": "[[\"condição1\",\"condição2\",\"condição1 && condição2\",\"condição1 || condição2\"],[\"true\",\"true\",\"true\",\"true\"],[\"true\",\"false\",\"false\",\"true\"],[\"false\",\"true\",\"false\",\"true\"],[\"false\",\"false\",\"false\",\"false\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Use && quando todas as condições precisam ser verdadeiras, || quando basta uma, e ! para inverter uma condição. Combinar esses operadores deixa o if pronto para decisões mais completas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a saída?\n\nlet a = 4;\nlet b = 4;\nlet c = 9;\n\nif (a >= b && a >= c) {\n  console.log(a + \" é o maior\");\n} else if (b >= a && b >= c) {\n  console.log(b + \" é o maior\");\n} else {\n  console.log(c + \" é o maior\");\n}",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "9 é o maior",
                                "isCorrect": true
                            },
                            {
                                "text": "4 é o maior",
                                "isCorrect": false
                            },
                            {
                                "text": "O código dá erro porque a e b são iguais",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma mensagem aparece",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída?\n\nlet estudante = false;\nlet idoso = false;\n\nif (estudante || idoso) {\n  console.log(\"Tem direito a meia-entrada\");\n} else {\n  console.log(\"Paga o valor cheio\");\n}",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Paga o valor cheio",
                                "isCorrect": true
                            },
                            {
                                "text": "Tem direito a meia-entrada",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas mensagens aparecem",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma mensagem aparece",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída?\n\nlet bloqueado = true;\n\nif (!bloqueado) {\n  console.log(\"Acesso liberado\");\n} else {\n  console.log(\"Acesso negado\");\n}",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Acesso negado",
                                "isCorrect": true
                            },
                            {
                                "text": "Acesso liberado",
                                "isCorrect": false
                            },
                            {
                                "text": "true",
                                "isCorrect": false
                            },
                            {
                                "text": "false",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual condição é verdadeira somente quando idade representa um adolescente, ou seja, está entre 13 e 17 anos, incluindo os dois extremos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "idade >= 13 && idade <= 17",
                                "isCorrect": true
                            },
                            {
                                "text": "idade >= 13 || idade <= 17",
                                "isCorrect": false
                            },
                            {
                                "text": "idade > 13 && idade < 17",
                                "isCorrect": false
                            },
                            {
                                "text": "idade >= 13 && idade < 13",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída?\n\nlet idade = 16;\nlet comResponsavel = true;\n\nif (idade >= 18 || (idade >= 12 && comResponsavel)) {\n  console.log(\"Pode assistir o filme\");\n} else {\n  console.log(\"Não pode assistir\");\n}",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Pode assistir o filme",
                                "isCorrect": true
                            },
                            {
                                "text": "Não pode assistir",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de sintaxe por causa dos parênteses",
                                "isCorrect": false
                            },
                            {
                                "text": "Não dá para saber sem rodar o código várias vezes",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "switch: escolhendo entre muitos casos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## switch: escolhendo entre muitos casos\n\nPense em transformar o número do dia da semana (1 a 7) no nome do dia. Ou em decidir uma mensagem diferente para cada opção de um menu. Nesses casos, você compara sempre a mesma variável com vários valores exatos, um por um. Uma cadeia de `else if` resolve, mas fica repetitiva quando os casos são muitos."
                    },
                    {
                        "type": "code",
                        "value": "let dia = 3;\n\nif (dia === 1) {\n  console.log(\"Domingo\");\n} else if (dia === 2) {\n  console.log(\"Segunda-feira\");\n} else if (dia === 3) {\n  console.log(\"Terça-feira\");\n} else if (dia === 4) {\n  console.log(\"Quarta-feira\");\n} else if (dia === 5) {\n  console.log(\"Quinta-feira\");\n} else if (dia === 6) {\n  console.log(\"Sexta-feira\");\n} else if (dia === 7) {\n  console.log(\"Sábado\");\n} else {\n  console.log(\"Dia inválido\");\n}\n\n// saida: Terça-feira"
                    },
                    {
                        "type": "code",
                        "value": "let dia = 3;\n\nswitch (dia) {\n  case 1:\n    console.log(\"Domingo\");\n    break;\n  case 2:\n    console.log(\"Segunda-feira\");\n    break;\n  case 3:\n    console.log(\"Terça-feira\");\n    break;\n  case 4:\n    console.log(\"Quarta-feira\");\n    break;\n  case 5:\n    console.log(\"Quinta-feira\");\n    break;\n  case 6:\n    console.log(\"Sexta-feira\");\n    break;\n  case 7:\n    console.log(\"Sábado\");\n    break;\n  default:\n    console.log(\"Dia inválido\");\n}\n\n// saida: Terça-feira"
                    },
                    {
                        "type": "text",
                        "value": "Os dois códigos acima fazem exatamente a mesma coisa, mas repare como o `switch` deixa mais organizado quando são muitos valores exatos para comparar. Veja as peças:\n\n- `switch (dia)`: o valor que vai ser comparado, uma vez só, com cada `case`.\n- `case 3:`: significa \"se dia for igual a 3\". Quando bate, o JavaScript executa as linhas dali para baixo.\n- `break`: encerra o `switch` ali, sem entrar nos próximos `case`. Sem ele, o código continua executando os `case` seguintes, mesmo que não batam mais, o que quase nunca é o que você quer.\n- `default`: roda quando nenhum `case` bateu, é o equivalente ao `else` no `switch`."
                    },
                    {
                        "type": "code",
                        "value": "let dia = 2;\n\nswitch (dia) {\n  case 1:\n    console.log(\"Domingo\");\n  case 2:\n    console.log(\"Segunda-feira\");\n  case 3:\n    console.log(\"Terça-feira\");\n  default:\n    console.log(\"Dia inválido\");\n}\n\n// saida:\n// Segunda-feira\n// Terça-feira\n// Dia inválido\n\n// Faltou o break em cada case. O switch encontrou o case 2, executou\n// aquela linha e, como nao tem break, continuou executando TODOS os\n// casos seguintes, mesmo sem bater. Isso se chama \"fall-through\" e e\n// quase sempre um bug. Regra pratica: todo case termina com break."
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar switch e quando usar else if\n\nUse `switch` quando você compara a mesma variável com vários valores exatos, como número do dia, opção de menu ou categoria fixa. Use `else if` quando as condições envolvem faixas (`nota >= 7`), comparações diferentes em cada checagem, ou operadores lógicos (`&&`, `||`). O `switch` só compara igualdade (parecido com `===`), ele não substitui um `else if` com condições mais ricas."
                    },
                    {
                        "type": "quote",
                        "value": "O switch compara um único valor com vários case possíveis. Cada case deve terminar com break, para não cair nos casos seguintes, e o default cobre o que sobrar. Para faixas e condições compostas, o else if continua sendo a ferramenta certa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a saída?\n\nlet dia = 5;\n\nswitch (dia) {\n  case 1:\n    console.log(\"Domingo\");\n    break;\n  case 5:\n    console.log(\"Quinta-feira\");\n    break;\n  default:\n    console.log(\"Dia inválido\");\n}",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quinta-feira",
                                "isCorrect": true
                            },
                            {
                                "text": "Domingo",
                                "isCorrect": false
                            },
                            {
                                "text": "Dia inválido",
                                "isCorrect": false
                            },
                            {
                                "text": "Quinta-feira e depois Dia inválido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída?\n\nlet opcao = 9;\n\nswitch (opcao) {\n  case 1:\n    console.log(\"Criar conta\");\n    break;\n  case 2:\n    console.log(\"Entrar\");\n    break;\n  default:\n    console.log(\"Opção inválida\");\n}",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Opção inválida",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar conta",
                                "isCorrect": false
                            },
                            {
                                "text": "Entrar",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma mensagem aparece",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída?\n\nlet numero = 2;\n\nswitch (numero) {\n  case 1:\n    console.log(\"um\");\n  case 2:\n    console.log(\"dois\");\n  case 3:\n    console.log(\"três\");\n  default:\n    console.log(\"outro\");\n}",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "dois, três e outro, nessa ordem, porque faltam os break",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas dois, porque numero é 2",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas outro, porque numero não é 1 nem 3",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de execução, porque o switch não tem nenhum break",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual situação é mais adequada para usar switch em vez de else if?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Comparar uma variável com vários valores exatos, como o mês",
                                "isCorrect": true
                            },
                            {
                                "text": "Verificar se um número está dentro de uma faixa ampla, como nota >= 7",
                                "isCorrect": false
                            },
                            {
                                "text": "Combinar duas condições diferentes usando && ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Verificar se uma variável é diferente de outra usando !==",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída?\n\nlet letra = \"a\";\n\nswitch (letra) {\n  case \"a\":\n    console.log(\"Primeira\");\n  case \"b\":\n    console.log(\"Segunda\");\n    break;\n  case \"c\":\n    console.log(\"Terceira\");\n    break;\n  default:\n    console.log(\"Outra\");\n}",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Primeira e Segunda, pois falta break no case \"a\" e o de \"b\" para ali",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas Primeira, pois o switch para assim que encontra o case certo",
                                "isCorrect": false
                            },
                            {
                                "text": "Primeira, Segunda e Terceira, pois nenhum break interrompe nada",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas Segunda, pois letra não é igual a nenhum outro case",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Repetição: laços (loops)",
        "aulas": [
            {
                "titulo": "Por que repetir: a ideia de laço",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que repetir: a ideia de laço\n\nAté aqui você aprendeu a guardar valores em variáveis (módulo 2) e a fazer o programa escolher caminhos com `if` (módulo 3). Agora vem uma pergunta bem comum no dia a dia de quem programa: e se eu precisar fazer a mesma coisa várias vezes seguidas?\n\nPense em mostrar os números de 1 a 5 no console. Você já sabe fazer isso:"
                    },
                    {
                        "type": "code",
                        "value": "// Imagine que você precisa mostrar os números de 1 a 5 no console.\nconsole.log(1);\nconsole.log(2);\nconsole.log(3);\nconsole.log(4);\nconsole.log(5);\n\n// Funciona! Mas e se fossem 100 números? Ou 1000?\n// Copiar e colar essa linha centenas de vezes não é programar, é sofrer."
                    },
                    {
                        "type": "text",
                        "value": "Funcionou. Agora imagine que o pedido fosse mostrar os números de 1 a 100. Ou de 1 a 10.000. Copiar e colar `console.log` centenas de vezes não é programar, é trabalho braçal, e ainda por cima arriscado: um erro de digitação em uma das linhas e ninguém percebe.\n\nA programação tem uma ferramenta pronta para isso: o **laço** (em inglês, *loop*). Um laço repete um trecho de código quantas vezes for preciso, sem você escrever a mesma linha de novo."
                    },
                    {
                        "type": "text",
                        "value": "## A receita de um laço\n\nPense numa situação bem simples: beber um copo de água, um gole de cada vez, até ele esvaziar. Essa ideia tem três partes:\n\n- **Um ponto de partida**: o copo começa cheio.\n- **Uma condição que diz quando parar**: 'enquanto ainda tiver água no copo'.\n- **Algo que muda a cada repetição**: a cada gole, sai um pouco de água, até a condição deixar de ser verdadeira.\n\nTodo laço que você vai aprender (`while` e `for`) segue essa mesma receita: repita um bloco de código enquanto uma condição for verdadeira, mudando algo a cada volta até a condição virar falsa."
                    },
                    {
                        "type": "code",
                        "value": "// A mesma ideia (mostrar números em sequência), agora usando um laço:\nfor (let i = 1; i <= 100; i++) {\n  console.log(i);\n}\n// Três linhas mostram os números de 1 a 100. Se fossem 10.000, o código\n// continuaria do mesmo tamanho: só mudaria o número 100 ali em cima.\n// As próximas aulas explicam cada peça dessa receita: while e for."
                    },
                    {
                        "type": "text",
                        "value": "Sempre que você perceber que vai 'fazer a mesma coisa várias vezes' dentro de um problema, isso é sinal de que um laço vai ajudar: mostrar uma sequência de números, repetir uma pergunta até o usuário responder certo, processar item por item de uma lista (você vai ver isso com calma no módulo 6). Nas próximas aulas você aprende as duas formas de escrever um laço em JavaScript: `while` e `for`."
                    },
                    {
                        "type": "quote",
                        "value": "Um laço é a receita repita enquanto for verdade. Você escreve a instrução uma única vez; o computador se encarrega de repetir o quanto for necessário."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual destas situações do dia a dia é mais parecida com a ideia de um laço (loop) na programação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Passar o aspirador em cada cômodo da casa, um de cada vez",
                                "isCorrect": true
                            },
                            {
                                "text": "Escolher entre pizza ou hambúrguer no jantar",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar o número de telefone de um amigo numa agenda",
                                "isCorrect": false
                            },
                            {
                                "text": "Comparar a idade de duas pessoas para saber quem é mais velho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que escrever console.log cem vezes seguidas para mostrar os números de 1 a 100 é uma má prática?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque dá muito trabalho escrever, é fácil errar e difícil de mudar depois",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o JavaScript não permite mais que 10 linhas de código repetidas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque console.log só pode ser usado uma vez em cada programa",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque números maiores que 10 não podem ser exibidos no console",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Pense na ideia 'beba um gole de água até o copo esvaziar', usada para explicar um laço. Nessa comparação, o que representa a parte que muda a cada repetição, aproximando o fim?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A água que ainda resta dentro do copo",
                                "isCorrect": true
                            },
                            {
                                "text": "O formato do copo",
                                "isCorrect": false
                            },
                            {
                                "text": "A vontade de beber água",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de pessoas que estão na sala",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfor (let i = 1; i <= 100; i++) {\n  console.log(i);\n}\n\nQuantos números esse código mostra no console?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "100",
                                "isCorrect": true
                            },
                            {
                                "text": "99",
                                "isCorrect": false
                            },
                            {
                                "text": "101",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende do computador que executa o código",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das alternativas abaixo descreve corretamente para que serve um laço (loop) na programação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Executar um conjunto de instruções várias vezes, sem copiar e colar o código",
                                "isCorrect": true
                            },
                            {
                                "text": "Fazer o programa escolher entre dois caminhos diferentes, dependendo de uma condição",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar vários valores dentro de uma única variável",
                                "isCorrect": false
                            },
                            {
                                "text": "Impedir que o programa tenha erros de digitação",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "while: repetindo enquanto for verdade (e o loop infinito)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A primeira forma de repetir: while\n\nA primeira forma de repetir código em JavaScript é o `while` (em inglês, 'enquanto'). A ideia é direta: **enquanto uma condição for verdadeira, repita o bloco de código**. Assim que a condição virar falsa, o laço para.\n\nA estrutura lembra o `if` que você já conhece, só que em vez de rodar uma vez só, o `while` volta a testar a condição depois de cada repetição:"
                    },
                    {
                        "type": "code",
                        "value": "let i = 1; // variável de controle, começa em 1\n\nwhile (i <= 5) { // repete ENQUANTO i for menor ou igual a 5\n  console.log(i);\n  i = i + 1; // sem isso, i nunca mudaria: loop infinito!\n}\n\nconsole.log(\"Terminou! i agora vale\", i);\n// saida:\n// 1\n// 2\n// 3\n// 4\n// 5\n// Terminou! i agora vale 6"
                    },
                    {
                        "type": "text",
                        "value": "## O perigo do loop infinito\n\nRepare em duas coisas no código acima: a variável `i` é criada **antes** do `while`, e ela muda **dentro** do laço (`i = i + 1`). Isso não é opcional. Se a variável usada na condição nunca mudar, a condição nunca vai virar falsa, e o laço repete para sempre. Isso se chama **loop infinito**, e ele trava o programa (no navegador, a página congela; no terminal, o programa nunca termina).\n\nVeja um exemplo do que **não** fazer:"
                    },
                    {
                        "type": "code",
                        "value": "// CUIDADO: exemplo de loop infinito. Não rode isso de verdade!\nlet contador = 1;\n\nwhile (contador <= 5) {\n  console.log(contador);\n  // esqueceram de mudar \"contador\" aqui dentro...\n  // a condição \"contador <= 5\" nunca vai ficar falsa.\n  // o programa trava, repetindo para sempre.\n}"
                    },
                    {
                        "type": "text",
                        "value": "Nesse exemplo, `contador` começa em 1 e a condição é `contador <= 5`, mas nada dentro do laço muda o valor de `contador`. A condição vai ser sempre verdadeira, para sempre.\n\nAntes de rodar qualquer `while`, vale a pena checar três pontos:\n\n- A variável de controle existe **antes** do `while`.\n- A condição depende dessa variável.\n- Alguma linha **dentro** do laço muda essa variável, aproximando o fim.\n\nSe o seu programa 'travar' ao testar um laço, desconfie de loop infinito e revise esses três pontos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Volta\",\"i no início\",\"i <= 5 ?\",\"O que acontece\"],[\"1\",\"1\",\"verdadeira\",\"imprime 1; depois i passa a valer 2\"],[\"2\",\"2\",\"verdadeira\",\"imprime 2; depois i passa a valer 3\"],[\"3\",\"3\",\"verdadeira\",\"imprime 3; depois i passa a valer 4\"],[\"4\",\"4\",\"verdadeira\",\"imprime 4; depois i passa a valer 5\"],[\"5\",\"5\",\"verdadeira\",\"imprime 5; depois i passa a valer 6\"],[\"6\",\"6\",\"falsa\",\"o laço para; nada é impresso\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "while repete enquanto a condição for verdadeira. Toda variável usada na condição precisa mudar dentro do laço, senão a condição nunca vira falsa e o laço nunca para."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o comando while faz em um programa JavaScript?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Repete um bloco enquanto a condição continuar verdadeira",
                                "isCorrect": true
                            },
                            {
                                "text": "Executa um bloco de código apenas uma única vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolhe entre dois caminhos possíveis, igual o comando if",
                                "isCorrect": false
                            },
                            {
                                "text": "Encerra o programa imediatamente, sem terminar o resto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de criar a variável de controle de um while (como let i = 1) e escrever a condição (i <= 5), o que ainda é indispensável fazer dentro do laço para ele não travar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Alterar, a cada volta, o valor da variável da condição",
                                "isCorrect": true
                            },
                            {
                                "text": "Declarar de novo a variável, com let, a cada nova volta",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar console.log pelo menos duas vezes",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar a condição por uma igualdade, com ===",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nlet i = 0;\nwhile (i < 3) {\n  console.log('Oi');\n  i = i + 1;\n}\n\nQuantas vezes a palavra 'Oi' aparece no console?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "3",
                                "isCorrect": true
                            },
                            {
                                "text": "2",
                                "isCorrect": false
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "Infinitas vezes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nlet n = 10;\nwhile (n > 0) {\n  console.log(n);\n}\n\nO que acontece quando esse código roda?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Entra em loop infinito, pois n nunca muda dentro do laço",
                                "isCorrect": true
                            },
                            {
                                "text": "Mostra os números de 10 até 1 e depois para sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Não mostra nada, porque a condição n > 0 já começa como falsa",
                                "isCorrect": false
                            },
                            {
                                "text": "Dá um erro de sintaxe antes mesmo de rodar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nlet i = 1;\nwhile (i <= 4) {\n  i = i + 1;\n}\nconsole.log(i);\n\nQual valor aparece no console?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "5",
                                "isCorrect": true
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "6",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "for: o laço contado",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## for: tudo numa linha só\n\nO `while` funciona bem, mas quando você já sabe de antemão quantas vezes quer repetir algo, o JavaScript oferece uma forma mais compacta: o `for`. Ele junta numa única linha as três peças que você viu na aula passada: onde começar, até quando ir e como andar a cada volta.\n\nVeja o mesmo exemplo da aula anterior, primeiro do jeito `while` e depois reescrito com `for`:"
                    },
                    {
                        "type": "code",
                        "value": "// Do jeito while (aula passada)\nlet i = 1;\nwhile (i <= 5) {\n  console.log(i);\n  i = i + 1;\n}\n\n// A mesma coisa com for: início, condição e incremento numa linha só\nfor (let j = 1; j <= 5; j++) {\n  console.log(j);\n}\n\n// as duas versões imprimem exatamente a mesma coisa: 1 2 3 4 5"
                    },
                    {
                        "type": "text",
                        "value": "## As três partes do for\n\n`for (let j = 1; j <= 5; j++)` tem exatamente três partes, separadas por ponto e vírgula:\n\n- **Inicialização** (`let j = 1`): roda uma única vez, antes de tudo, criando a variável de controle.\n- **Condição** (`j <= 5`): testada antes de cada volta; quando for falsa, o laço para.\n- **Incremento** (`j++`): roda ao final de cada volta. `j++` é um atalho para `j = j + 1`.\n\nAs três partes ficam juntas, na mesma linha, o que deixa bem visível como o laço se comporta do início ao fim."
                    },
                    {
                        "type": "text",
                        "value": "Quando usar `for` em vez de `while`? Na prática, sempre que você já sabe (ou consegue calcular) quantas vezes quer repetir, como percorrer um intervalo de números de um valor até outro. Como início, condição e incremento ficam juntos, fica mais difícil esquecer de mudar a variável de controle, o que reduz o risco do loop infinito visto na aula passada.\n\nUm padrão muito comum é percorrer um intervalo de 0 (ou 1) até um valor `n`:"
                    },
                    {
                        "type": "code",
                        "value": "// Percorrer um intervalo de 0 até n (aqui, n = 10)\nlet n = 10;\nfor (let i = 0; i <= n; i++) {\n  console.log(i);\n}\n// saida: 0 1 2 3 4 5 6 7 8 9 10 (onze números, de 0 a 10)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Volta\",\"j no início\",\"j <= 5 ?\",\"Imprime\",\"j depois do j++\"],[\"1\",\"1\",\"verdadeira\",\"1\",\"2\"],[\"2\",\"2\",\"verdadeira\",\"2\",\"3\"],[\"3\",\"3\",\"verdadeira\",\"3\",\"4\"],[\"4\",\"4\",\"verdadeira\",\"4\",\"5\"],[\"5\",\"5\",\"verdadeira\",\"5\",\"6\"],[\"6\",\"6\",\"falsa\",\"(nada, o laço para)\",\"-\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "for junta numa linha só o que o while precisa de três: onde começar, até quando ir e como andar. Quando você sabe de antemão quantas vezes repetir, o for costuma ser a escolha mais natural."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais são as três partes que ficam dentro dos parênteses de um for, e em que ordem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Inicialização; condição; incremento, nessa ordem",
                                "isCorrect": true
                            },
                            {
                                "text": "Condição; incremento; inicialização, nessa ordem",
                                "isCorrect": false
                            },
                            {
                                "text": "Variável; valor; operador, nessa ordem",
                                "isCorrect": false
                            },
                            {
                                "text": "Início; meio; fim, em qualquer ordem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que j++ significa dentro de um for?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Soma 1 ao valor de j, igual a j = j + 1",
                                "isCorrect": true
                            },
                            {
                                "text": "Compara se j é maior do que outro número",
                                "isCorrect": false
                            },
                            {
                                "text": "Divide o valor de j por 2",
                                "isCorrect": false
                            },
                            {
                                "text": "Zera o valor de j",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo, com n valendo 10:\n\nfor (let i = 0; i <= n; i++) {\n  console.log(i);\n}\n\nQuantas vezes esse laço executa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "11 vezes",
                                "isCorrect": true
                            },
                            {
                                "text": "10 vezes",
                                "isCorrect": false
                            },
                            {
                                "text": "9 vezes",
                                "isCorrect": false
                            },
                            {
                                "text": "12 vezes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o for a seguir:\n\nfor (let i = 1; i <= 5; i++) {\n  console.log(i);\n}\n\nCom qual valor de i a condição i <= 5 deixa de ser verdadeira, fazendo o laço parar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "i valendo 6",
                                "isCorrect": true
                            },
                            {
                                "text": "i valendo 5",
                                "isCorrect": false
                            },
                            {
                                "text": "i valendo 4",
                                "isCorrect": false
                            },
                            {
                                "text": "i valendo 0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa repetir uma ação exatamente 20 vezes, sempre a mesma quantidade, já conhecida antes de o laço começar. Por que o for costuma ser mais indicado que o while nesse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o for junta início, condição e incremento numa linha só",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o for roda mais rápido que o while no computador",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o while não consegue repetir mais do que 10 vezes",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o for não precisa de nenhuma variável de controle declarada antes de começar",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Contador e acumulador: somando e contando",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Usando um laço para calcular algo\n\nCom `while` e `for` você já sabe repetir código. Agora vem a parte mais útil no dia a dia: usar um laço para **calcular algo**, não só imprimir números. Dois padrões aparecem o tempo todo:\n\n- **Acumulador**: uma variável que vai guardando um total, somando um pouco a cada volta (por exemplo, uma soma).\n- **Contador**: uma variável que vai contando quantas vezes algo aconteceu (por exemplo, quantos números pares existem numa faixa).\n\nOs dois seguem o mesmo princípio: a variável começa **antes** do laço, com um valor inicial neutro, e é atualizada **dentro** do laço, a cada volta."
                    },
                    {
                        "type": "code",
                        "value": "// Somar os números de 1 até n usando um acumulador\nlet n = 5;\nlet soma = 0; // acumulador, começa em 0 (o \"neutro\" da soma)\n\nfor (let i = 1; i <= n; i++) {\n  soma = soma + i; // a cada volta, soma o valor de i no total\n}\n\nconsole.log(soma); // saida: 15  (1 + 2 + 3 + 4 + 5)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"i\",\"soma antes da volta\",\"conta feita\",\"soma depois da volta\"],[\"1\",\"0\",\"0 + 1\",\"1\"],[\"2\",\"1\",\"1 + 2\",\"3\"],[\"3\",\"3\",\"3 + 3\",\"6\"],[\"4\",\"6\",\"6 + 4\",\"10\"],[\"5\",\"10\",\"10 + 5\",\"15\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Contador: quantas vezes algo acontece\n\nO contador é parecido com o acumulador, mas em vez de somar valores diferentes, ele soma sempre 1, e só quando uma condição é satisfeita. É assim que você responde perguntas do tipo 'quantos números pares existem entre 1 e 10?'."
                    },
                    {
                        "type": "code",
                        "value": "// Contar quantos números pares existem de 1 até 10\nlet total = 10;\nlet quantidadePares = 0; // contador, começa em 0\n\nfor (let i = 1; i <= total; i++) {\n  if (i % 2 === 0) { // resto da divisão por 2 é zero: número par\n    quantidadePares = quantidadePares + 1;\n  }\n}\n\nconsole.log(quantidadePares); // saida: 5  (2, 4, 6, 8, 10)"
                    },
                    {
                        "type": "code",
                        "value": "// Calcular a média dos números de 1 até n, usando acumulador e contador juntos\nlet n = 5;\nlet soma = 0;       // acumulador: guarda o total\nlet quantidade = 0;  // contador: guarda quantos números entraram na soma\n\nfor (let i = 1; i <= n; i++) {\n  soma = soma + i;\n  quantidade = quantidade + 1;\n}\n\nlet media = soma / quantidade;\nconsole.log(media); // saida: 3  (1+2+3+4+5 = 15, e 15 / 5 = 3)"
                    },
                    {
                        "type": "quote",
                        "value": "Acumulador e contador são o mesmo truque: uma variável criada antes do laço, atualizada a cada volta. O acumulador soma valores; o contador soma 1 cada vez que uma condição é satisfeita."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual valor inicial é mais indicado para um acumulador que vai somar números dentro de um laço?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "0",
                                "isCorrect": true
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "O maior valor possível",
                                "isCorrect": false
                            },
                            {
                                "text": "Não precisa de um valor inicial, o JavaScript decide sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que um contador faz dentro de um laço?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Soma 1 cada vez que uma condição é satisfeita",
                                "isCorrect": true
                            },
                            {
                                "text": "Guarda o último valor lido, sobrescrevendo o anterior",
                                "isCorrect": false
                            },
                            {
                                "text": "Multiplica todos os números que passam pelo laço",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede que o laço se repita mais de uma vez",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nlet soma = 0;\nfor (let i = 1; i <= 4; i++) {\n  soma = soma + i;\n}\nconsole.log(soma);\n\nQual o valor de soma no final?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "10",
                                "isCorrect": true
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            },
                            {
                                "text": "14",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nlet quantidade = 0;\nfor (let i = 1; i <= 10; i++) {\n  if (i % 2 !== 0) {\n    quantidade = quantidade + 1;\n  }\n}\nconsole.log(quantidade);\n\nQual o valor de quantidade no final?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "5",
                                "isCorrect": true
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "6",
                                "isCorrect": false
                            },
                            {
                                "text": "10",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O código abaixo deveria somar os números de 1 até 5, mas tem um erro sutil na condição. Qual o valor de soma no final?\n\nlet soma = 0;\nfor (let i = 1; i < 5; i++) {\n  soma = soma + i;\n}\nconsole.log(soma);",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "10",
                                "isCorrect": true
                            },
                            {
                                "text": "15",
                                "isCorrect": false
                            },
                            {
                                "text": "5",
                                "isCorrect": false
                            },
                            {
                                "text": "14",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "break, continue e laços aninhados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Mais controle dentro do laço\n\nAté agora, todo laço que você viu roda do início ao fim, sempre testando a condição a cada volta. Mas às vezes você quer mais controle: parar o laço mais cedo, ou pular uma volta específica sem parar tudo. Para isso existem dois comandos:\n\n- **`break`**: interrompe o laço imediatamente, como quando você procura uma chave num molho e para de procurar assim que acha a certa.\n- **`continue`**: pula o restante da volta atual e já vai para a próxima, como quando você folheia uma revista pulando as páginas de propaganda, sem parar de folhear."
                    },
                    {
                        "type": "code",
                        "value": "// Procurar o primeiro número, entre 1 e 20, que seja divisível por 7\nfor (let i = 1; i <= 20; i++) {\n  if (i % 7 === 0) {\n    console.log(\"Achei:\", i);\n    break; // para o laço assim que encontra, não precisa continuar\n  }\n}\n// saida: Achei: 7"
                    },
                    {
                        "type": "code",
                        "value": "// Mostrar os números de 1 a 10, mas pulando os múltiplos de 3\nfor (let i = 1; i <= 10; i++) {\n  if (i % 3 === 0) {\n    continue; // pula esta volta, vai direto para a próxima\n  }\n  console.log(i);\n}\n// saida: 1 2 4 5 7 8 10   (pulou o 3, o 6 e o 9)"
                    },
                    {
                        "type": "text",
                        "value": "## Laço dentro de laço\n\nUm laço pode conter outro laço dentro dele. Isso é útil quando você precisa repetir algo para cada repetição de outra coisa, como montar uma tabuada inteira (uma tabela de multiplicação para cada número) ou percorrer uma grade com linhas e colunas.\n\nA regra é simples: para **cada** volta do laço de fora, o laço de dentro roda **inteiro**, do começo ao fim. Por isso, o custo de laços aninhados cresce rápido: se o laço de fora roda `n` vezes e o de dentro roda `m` vezes, o total de voltas é `n × m`, não `n + m`."
                    },
                    {
                        "type": "code",
                        "value": "// Tabuada de 1 a 3 usando laços aninhados (for dentro de for)\nfor (let tabuada = 1; tabuada <= 3; tabuada++) {\n  console.log(\"Tabuada do \" + tabuada + \":\");\n  for (let vez = 1; vez <= 3; vez++) {\n    console.log(tabuada + \" x \" + vez + \" = \" + (tabuada * vez));\n  }\n}\n// para cada valor de \"tabuada\" (3 no total), o laço de dentro roda 3 vezes\n// por completo: ao todo, são 3 x 3 = 9 linhas de multiplicação impressas"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Voltas de fora\",\"Voltas de dentro\",\"Total de voltas (fora × dentro)\"],[\"3\",\"3\",\"9\"],[\"5\",\"5\",\"25\"],[\"10\",\"10\",\"100\"],[\"100\",\"100\",\"10000\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "break interrompe o laço inteiro; continue pula só a volta atual e segue para a próxima; e um laço dentro do outro multiplica o trabalho, já que o de fora decide quantas vezes o de dentro roda inteiro."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o comando break faz dentro de um laço?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Para o laço na hora, sem rodar mais nenhuma volta",
                                "isCorrect": true
                            },
                            {
                                "text": "Pula só a volta atual e continua no laço",
                                "isCorrect": false
                            },
                            {
                                "text": "Reinicia o laço do começo",
                                "isCorrect": false
                            },
                            {
                                "text": "Troca o valor da variável de controle para zero imediatamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o comando continue faz dentro de um laço?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pula o resto do código daquela volta e já vai para a próxima",
                                "isCorrect": true
                            },
                            {
                                "text": "Encerra o laço por completo, sem repetir mais nenhuma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz o laço rodar em dobro a cada volta",
                                "isCorrect": false
                            },
                            {
                                "text": "Reinicia o valor de todas as variáveis do programa inteiro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfor (let i = 1; i <= 5; i++) {\n  if (i === 3) {\n    break;\n  }\n  console.log(i);\n}\n\nO que aparece no console?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "1 e 2",
                                "isCorrect": true
                            },
                            {
                                "text": "1, 2 e 3",
                                "isCorrect": false
                            },
                            {
                                "text": "1, 2, 3, 4 e 5",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada é impresso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfor (let i = 1; i <= 5; i++) {\n  if (i === 3) {\n    continue;\n  }\n  console.log(i);\n}\n\nO que aparece no console?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "1, 2, 4 e 5",
                                "isCorrect": true
                            },
                            {
                                "text": "1, 2, 3, 4 e 5",
                                "isCorrect": false
                            },
                            {
                                "text": "1 e 2",
                                "isCorrect": false
                            },
                            {
                                "text": "1, 2 e 3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfor (let a = 1; a <= 4; a++) {\n  for (let b = 1; b <= 3; b++) {\n    console.log(a, b);\n  }\n}\n\nQuantas vezes o console.log de dentro executa, ao todo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "12 vezes",
                                "isCorrect": true
                            },
                            {
                                "text": "4 vezes",
                                "isCorrect": false
                            },
                            {
                                "text": "3 vezes",
                                "isCorrect": false
                            },
                            {
                                "text": "7 vezes",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Funções: organizar e reutilizar",
        "aulas": [
            {
                "titulo": "O que é uma função e como criar uma",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é uma função?\n\nImagine uma receita de bolo escrita num caderno. Toda vez que alguém quiser fazer o bolo, não precisa reinventar os passos: basta seguir a receita, que já tem um nome (\"Bolo de cenoura\") e uma lista de passos pronta para ser usada de novo, quantas vezes for preciso.\n\nUma **função** é isso dentro do código: um pedaço de lógica que você escreve uma única vez, dá um nome, e pode chamar (executar) sempre que precisar, em qualquer parte do programa.\n\nAté o Módulo 4, todo código que você escreveu rodava direto, de cima para baixo. Se quisesse repetir uma tarefa mais adiante, teria que copiar e colar o mesmo trecho de novo. Funções resolvem exatamente esse problema."
                    },
                    {
                        "type": "text",
                        "value": "## Criando uma função\n\nEm JavaScript, você cria (declara) uma função com a palavra `function`, um nome, parênteses `()` e um bloco de código entre chaves `{}`:\n\n- `function` avisa: a partir daqui você está definindo uma função\n- o nome, escolhido por você, é como vai chamar essa função depois (segue a mesma convenção das variáveis: começa com letra minúscula, sem espaços, tipo `saudar` ou `mostrarLinha`)\n- os parênteses `()` guardam as entradas da função (você vai ver isso com calma na próxima aula)\n- o que fica entre `{}` é o corpo da função: o que ela faz quando é executada"
                    },
                    {
                        "type": "code",
                        "value": "function saudar() {\n  console.log(\"Bom dia!\");\n}\n\n// Só definir a função não executa nada ainda.\n// Para rodar o código de dentro dela, é preciso CHAMAR pelo nome:\nsaudar();\n// saida: Bom dia!\n\n// A mesma função pode ser chamada quantas vezes você quiser:\nsaudar();\nsaudar();\n// saida: Bom dia!\n// saida: Bom dia!"
                    },
                    {
                        "type": "text",
                        "value": "## Definir x chamar\n\nDefinir uma função é como programar um botão de controle remoto: você decide o que ele vai fazer quando for apertado, mas nada acontece só por ter programado o botão. Chamar a função é apertar o botão de verdade, e é aí que o código de dentro roda.\n\nSe uma função for definida mas nunca chamada em nenhum lugar do programa, o código de dentro dela simplesmente nunca executa. Ela fica ali, guardada, esperando ser usada."
                    },
                    {
                        "type": "code",
                        "value": "function mostrarLinha() {\n  console.log(\"------------------------\");\n}\n\nmostrarLinha();\nconsole.log(\"Lista de compras\");\nmostrarLinha();\nconsole.log(\"1. Arroz\");\nconsole.log(\"2. Feijão\");\nmostrarLinha();\n\n// saida:\n// ------------------------\n// Lista de compras\n// ------------------------\n// 1. Arroz\n// 2. Feijão\n// ------------------------\n// repare: a mesma função mostrarLinha foi reaproveitada 3 vezes,\n// sem copiar e colar o console.log de novo"
                    },
                    {
                        "type": "quote",
                        "value": "Uma função é um pedaço de lógica com nome, escrito uma vez e usado quantas vezes você precisar. Definir a função não executa nada: só chamar (nome seguido de parênteses) roda o código de dentro dela."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que acontece quando uma função é apenas definida, mas nunca chamada em nenhum lugar do programa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O código de dentro dela nunca é executado",
                                "isCorrect": true
                            },
                            {
                                "text": "O código de dentro dela roda uma vez, automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "O JavaScript gera um erro de sintaxe",
                                "isCorrect": false
                            },
                            {
                                "text": "O código roda apenas no final do programa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de definir function saudar() { console.log(\"Oi\"); }, qual linha executa essa função?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "saudar();",
                                "isCorrect": true
                            },
                            {
                                "text": "saudar;",
                                "isCorrect": false
                            },
                            {
                                "text": "function saudar();",
                                "isCorrect": false
                            },
                            {
                                "text": "chamar saudar()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfunction mostrarLinha() {\n  console.log(\"---\");\n}\n\nmostrarLinha();\nmostrarLinha();\nconsole.log(\"fim\");\n\nQuantas vezes o texto \"---\" aparece no console?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "2 vezes",
                                "isCorrect": true
                            },
                            {
                                "text": "1 vez",
                                "isCorrect": false
                            },
                            {
                                "text": "3 vezes",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma vez",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das alternativas descreve melhor por que usamos funções no código?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Para dar nome a um pedaço de lógica e reaproveitá-lo sem reescrever",
                                "isCorrect": true
                            },
                            {
                                "text": "Para deixar o programa mais lento de propósito",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o JavaScript exige que todo código esteja dentro de alguma função",
                                "isCorrect": false
                            },
                            {
                                "text": "Para impedir que uma variável seja usada mais de uma vez",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfunction mostrarMensagem() {\n  console.log(\"Você me chamou!\");\n}\n\nconsole.log(\"Início do programa\");\n\nO que aparece no console quando esse código roda?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Só \"Início do programa\"",
                                "isCorrect": true
                            },
                            {
                                "text": "\"Início do programa\" e, em seguida, \"Você me chamou!\"",
                                "isCorrect": false
                            },
                            {
                                "text": "Só \"Você me chamou!\"",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro, porque toda função precisa ser chamada em algum momento",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Parâmetros e argumentos: entradas da função",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Funções que recebem informações\n\nA função `saudar`, da aula passada, sempre imprime a mesma mensagem fixa. Mas e se você quiser saudar pessoas diferentes, cada uma pelo seu nome, sem escrever uma função nova para cada pessoa?\n\nÉ para isso que existem os **parâmetros**: eles permitem que uma função receba informações de fora e use esses valores no que ela faz."
                    },
                    {
                        "type": "text",
                        "value": "### Parâmetro x argumento\n\nOs dois termos parecem sinônimos, mas cada um tem seu momento certo:\n\n- **Parâmetro** é o nome que você dá à entrada quando DEFINE a função (funciona como uma variável reservada para receber um valor).\n- **Argumento** é o valor de verdade que você passa quando CHAMA a função.\n\nAnalogia: pense numa máquina de suco. O parâmetro é o encaixe onde a fruta entra (\"aqui entra uma fruta\"). O argumento é a fruta específica que você coloca ali: uma maçã hoje, uma laranja amanhã. O encaixe é sempre o mesmo, mas o que passa por ele muda a cada uso."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Termo\",\"Onde aparece\",\"Exemplo\"],[\"Parâmetro\",\"Na definição da função\",\"function somar(a, b) { ... }\"],[\"Argumento\",\"Na chamada da função\",\"somar(2, 3)\"]]"
                    },
                    {
                        "type": "code",
                        "value": "function saudar(nome) {\n  console.log(\"Bom dia, \" + nome + \"!\");\n}\n\nsaudar(\"Ana\");\n// saida: Bom dia, Ana!\n\nsaudar(\"Carlos\");\n// saida: Bom dia, Carlos!\n\nsaudar(\"Mariana\");\n// saida: Bom dia, Mariana!\n\n// é a mesma função, mas o parâmetro nome recebe um argumento\n// diferente em cada chamada, então o resultado muda"
                    },
                    {
                        "type": "code",
                        "value": "function somar(a, b) {\n  const resultado = a + b;\n  console.log(resultado);\n}\n\nsomar(2, 3);\n// saida: 5\n\nsomar(10, 20);\n// saida: 30\n\n// a função tem dois parâmetros: a e b\n// cada chamada envia dois argumentos, na mesma ordem"
                    },
                    {
                        "type": "text",
                        "value": "### A ordem dos argumentos importa\n\nOs argumentos são associados aos parâmetros seguindo a mesma ordem em que aparecem. Em `somar(2, 3)`, o `2` vai para `a` e o `3` vai para `b`. Nesse caso, trocar a ordem não muda o resultado da soma, mas em operações onde a ordem faz diferença (como subtração ou divisão), inverter os argumentos muda o resultado.\n\nSe você esquecer de passar um argumento, o parâmetro correspondente fica com o valor especial `undefined` (aquele mesmo valor que você já viu no Módulo 2)."
                    },
                    {
                        "type": "quote",
                        "value": "Parâmetro é o nome combinado na definição da função. Argumento é o valor real enviado na chamada. A mesma função, alimentada com argumentos diferentes, produz resultados diferentes: é isso que a torna reutilizável de verdade."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na função function multiplicar(x, y) { return x * y; }, o que são x e y?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Parâmetros",
                                "isCorrect": true
                            },
                            {
                                "text": "Argumentos",
                                "isCorrect": false
                            },
                            {
                                "text": "Variáveis globais",
                                "isCorrect": false
                            },
                            {
                                "text": "Valores de retorno",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na chamada multiplicar(4, 5), o que são 4 e 5?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Argumentos",
                                "isCorrect": true
                            },
                            {
                                "text": "Parâmetros",
                                "isCorrect": false
                            },
                            {
                                "text": "Nomes de função",
                                "isCorrect": false
                            },
                            {
                                "text": "Escopos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfunction subtrair(a, b) {\n  console.log(a - b);\n}\n\nsubtrair(10, 3);\n\nO que aparece no console?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "7",
                                "isCorrect": true
                            },
                            {
                                "text": "-7",
                                "isCorrect": false
                            },
                            {
                                "text": "13",
                                "isCorrect": false
                            },
                            {
                                "text": "3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Usando a mesma função subtrair(a, b) da questão anterior, o que muda se você chamar subtrair(3, 10) em vez de subtrair(10, 3)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O resultado muda, porque a ordem dos argumentos define quem é a e quem é b",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada muda, porque subtração não depende da ordem dos números",
                                "isCorrect": false
                            },
                            {
                                "text": "O programa não roda, porque a ordem dos argumentos precisa ser sempre crescente",
                                "isCorrect": false
                            },
                            {
                                "text": "A função ignora o segundo argumento quando ele é maior que o primeiro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfunction saudar(nome) {\n  console.log(\"Oi, \" + nome);\n}\n\nsaudar();\n\nO que aparece no console quando saudar() é chamada sem nenhum argumento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Oi, undefined",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro impede o programa de rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "Oi,  (sem nada depois, e sem erro nem undefined)",
                                "isCorrect": false
                            },
                            {
                                "text": "Oi, nome",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "return: devolvendo um resultado (x só imprimir)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Devolvendo um resultado com return\n\nAs funções que você viu até agora mostram algo diretamente no console, usando `console.log` lá dentro delas. Isso é ótimo para exibir uma mensagem na tela, mas e se você quiser usar o RESULTADO da função em outro lugar do programa: guardar numa variável, somar com outro valor, passar para outra função?\n\nPara isso existe a palavra `return`: ela devolve um valor para quem chamou a função, e esse valor passa a poder ser usado de verdade pelo resto do programa."
                    },
                    {
                        "type": "code",
                        "value": "// Essa função só IMPRIME a soma, não devolve nada\nfunction somarImprime(a, b) {\n  console.log(a + b);\n}\n\nsomarImprime(2, 3);\n// saida: 5\n\n// e se eu tentar guardar o \"resultado\" dela?\nconst resultado1 = somarImprime(2, 3);\n// saida: 5   (isso é o console.log de dentro da função rodando de novo)\n\nconsole.log(resultado1);\n// saida: undefined\n// a função não tem return, então ela devolve undefined por padrão"
                    },
                    {
                        "type": "code",
                        "value": "// Essa função DEVOLVE a soma com return\nfunction somarRetorna(a, b) {\n  return a + b;\n}\n\nconst resultado2 = somarRetorna(2, 3);\nconsole.log(resultado2);\n// saida: 5\n\n// agora o valor devolvido pode ser usado em outras contas:\nconst dobro = somarRetorna(2, 3) * 2;\nconsole.log(dobro);\n// saida: 10"
                    },
                    {
                        "type": "text",
                        "value": "### A diferença crucial: return x console.log\n\nEsse é um dos erros mais comuns de quem está aprendendo a programar, por isso vale a pena grifar:\n\n- `console.log(...)` só MOSTRA um valor no console. Depois de mostrado, esse valor não fica guardado em lugar nenhum do programa.\n- `return ...` DEVOLVE um valor para quem chamou a função. Esse valor pode ser guardado numa variável, usado numa conta ou enviado para outra função.\n\n### O que acontece depois do return\n\nAssim que o `return` é executado, a função para ali mesmo: nenhuma linha escrita depois dele, dentro da mesma função, chega a rodar.\n\nE se a função não tiver nenhum `return`? Ela termina depois da última linha e devolve `undefined` para quem chamou, mesmo que tenha feito algum `console.log` pelo caminho."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"console.log dentro da função\",\"return dentro da função\"],[\"O que faz\",\"Mostra um valor no console\",\"Devolve um valor para quem chamou\"],[\"Dá para guardar numa variável?\",\"Não, guarda undefined\",\"Sim\"],[\"Serve para\",\"O humano ler na tela\",\"O programa usar o valor depois\"]]"
                    },
                    {
                        "type": "code",
                        "value": "function verificarIdade(idade) {\n  if (idade >= 18) {\n    return \"maior de idade\";\n  }\n  console.log(\"essa linha só roda se a idade for menor que 18\");\n  return \"menor de idade\";\n}\n\nconsole.log(verificarIdade(20));\n// saida: maior de idade\n// repare: o console.log do meio nem chega a rodar,\n// porque o return de dentro do if já encerra a função antes dele"
                    },
                    {
                        "type": "quote",
                        "value": "return devolve um valor para quem chamou a função, pronto para ser usado no resto do programa. console.log só mostra um valor na tela. Uma função sem return sempre devolve undefined, mesmo que ela imprima coisas no console."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a palavra return faz dentro de uma função?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Devolve um valor para quem chamou a função",
                                "isCorrect": true
                            },
                            {
                                "text": "Mostra um valor no console",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga o valor de uma variável",
                                "isCorrect": false
                            },
                            {
                                "text": "Chama a função de novo, automaticamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfunction dobro(n) {\n  return n * 2;\n}\n\nconst valor = dobro(5);\nconsole.log(valor);\n\nO que aparece no console?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "10",
                                "isCorrect": true
                            },
                            {
                                "text": "5",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            },
                            {
                                "text": "n * 2",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfunction triplo(n) {\n  console.log(n * 3);\n}\n\nconst valor = triplo(4);\nconsole.log(valor);\n\nO que aparece no console, na ordem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "12 e, em seguida, undefined",
                                "isCorrect": true
                            },
                            {
                                "text": "12 e, em seguida, 12 de novo",
                                "isCorrect": false
                            },
                            {
                                "text": "Só 12",
                                "isCorrect": false
                            },
                            {
                                "text": "Só undefined",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfunction classificar(nota) {\n  if (nota >= 6) {\n    return \"aprovado\";\n  }\n  return \"reprovado\";\n}\n\nconsole.log(classificar(8));\n\nO que aparece no console?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "aprovado",
                                "isCorrect": true
                            },
                            {
                                "text": "reprovado",
                                "isCorrect": false
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfunction verificar(numero) {\n  if (numero > 0) {\n    return \"positivo\";\n    console.log(\"chequei o número\");\n  }\n  return \"não positivo\";\n}\n\nconsole.log(verificar(5));\n\nAlém do resultado devolvido, o que mais aparece no console?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nada mais: o código depois do return nunca chega a ser executado",
                                "isCorrect": true
                            },
                            {
                                "text": "\"chequei o número\" aparece antes de \"positivo\"",
                                "isCorrect": false
                            },
                            {
                                "text": "\"chequei o número\" aparece depois de \"positivo\"",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de sintaxe, porque não pode existir código depois de um return",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escopo: variáveis locais e globais",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Escopo: onde cada variável existe\n\nToda variável tem um lugar onde ela existe e pode ser usada: esse território chama-se **escopo**. Entender escopo evita um erro bem comum entre iniciantes: tentar usar uma variável fora do lugar onde ela foi criada e o programa reclamar que ela nem existe.\n\nAnalogia: pense numa sala de reunião. O que é combinado ali dentro (papéis na mesa, um quadro rabiscado) fica só naquela sala; quando a reunião acaba e todo mundo sai, aquilo some. Já um aviso pregado no mural da entrada do prédio, todo mundo que passa por ali consegue ver."
                    },
                    {
                        "type": "text",
                        "value": "### Escopo local e escopo global\n\n- **Escopo local**: variáveis declaradas dentro de uma função (com `let` ou `const`) só existem ali dentro. Fora da função, ninguém enxerga essas variáveis.\n- **Escopo global**: variáveis declaradas fora de qualquer função existem no programa inteiro, e podem ser lidas de dentro de qualquer função."
                    },
                    {
                        "type": "code",
                        "value": "function calcularDobro(numero) {\n  const resultado = numero * 2; // resultado é uma variável LOCAL\n  console.log(resultado);\n}\n\ncalcularDobro(5);\n// saida: 10\n\n// console.log(resultado);\n// se você descomentar a linha acima, o programa quebra com um erro:\n// \"resultado is not defined\"\n// porque resultado só existe DENTRO de calcularDobro"
                    },
                    {
                        "type": "code",
                        "value": "const nomeDoApp = \"ensina.dev\"; // variável global\n\nfunction mostrarBoasVindas() {\n  console.log(\"Bem-vindo ao \" + nomeDoApp);\n  // a função consegue ler nomeDoApp porque ela é global\n}\n\nmostrarBoasVindas();\n// saida: Bem-vindo ao ensina.dev"
                    },
                    {
                        "type": "text",
                        "value": "### Por que variável local é bom\n\nParece uma limitação, mas escopo local é uma proteção: cada função pode usar os nomes de variável que quiser, sem se preocupar em conflitar com outra parte do programa. Duas funções diferentes podem ter, cada uma, uma variável chamada `resultado`, sem conflito nenhum, porque cada `resultado` só existe dentro da sua própria função."
                    },
                    {
                        "type": "code",
                        "value": "function areaQuadrado(lado) {\n  const resultado = lado * lado;\n  return resultado;\n}\n\nfunction areaTriangulo(base, altura) {\n  const resultado = (base * altura) / 2;\n  return resultado;\n}\n\nconsole.log(areaQuadrado(4));\n// saida: 16\n\nconsole.log(areaTriangulo(6, 3));\n// saida: 9\n\n// cada \"resultado\" é local à sua própria função: não existe conflito"
                    },
                    {
                        "type": "quote",
                        "value": "Variável declarada dentro de uma função é local: só existe, e só pode ser usada, ali dentro. Variável declarada fora de qualquer função é global e pode ser lida de qualquer lugar do programa. Preferir variáveis locais evita que uma parte do código interfira, sem querer, em outra."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma variável local?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma variável declarada dentro de uma função, existindo só ali",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma variável que existe em todo o programa, em qualquer função",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma variável que nunca muda de valor depois de criada",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma variável declarada usando o comando console.log",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfunction calcular() {\n  const total = 100;\n  console.log(total);\n}\n\ncalcular();\nconsole.log(total);\n\nO que acontece quando esse código roda?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Imprime 100, depois quebra: total não existe fora da função",
                                "isCorrect": true
                            },
                            {
                                "text": "Imprime 100 duas vezes, pois a função roda de novo no final",
                                "isCorrect": false
                            },
                            {
                                "text": "Imprime 100 e depois undefined, pois a variável global some",
                                "isCorrect": false
                            },
                            {
                                "text": "Quebra com erro antes mesmo de a função calcular ser chamada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nconst cidade = \"Recife\";\n\nfunction mostrarCidade() {\n  console.log(\"Cidade: \" + cidade);\n}\n\nmostrarCidade();\n\nO que aparece no console?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cidade: Recife",
                                "isCorrect": true
                            },
                            {
                                "text": "Cidade: undefined",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro, porque a função não pode acessar cidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Cidade:  (em branco)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfunction contarOvelhas() {\n  const total = 5;\n  return total;\n}\n\nfunction contarPatos() {\n  const total = 12;\n  return total;\n}\n\nconsole.log(contarOvelhas());\nconsole.log(contarPatos());\n\nO que aparece no console?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "5 e, em seguida, 12",
                                "isCorrect": true
                            },
                            {
                                "text": "12 e, em seguida, 12",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro, porque total foi declarado duas vezes",
                                "isCorrect": false
                            },
                            {
                                "text": "5 e, em seguida, 5",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é considerado uma boa prática declarar variáveis dentro da função em vez de sempre criar variáveis globais?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque variáveis locais não conflitam com nomes usados em outras partes do código",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque variáveis globais são mais lentas para o computador processar",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o JavaScript proíbe declarar mais de uma variável global no mesmo programa",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque variáveis locais podem ser lidas de qualquer parte do programa, o que é mais seguro",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dividir para conquistar: funções que usam funções",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que usar funções: dividir para conquistar\n\nVocê já viu como criar funções, passar parâmetros e devolver resultados com `return`. Agora é hora de juntar tudo e entender POR QUE isso importa tanto na prática.\n\nQuando um problema é grande, a estratégia mais poderosa da programação é dividir para conquistar: quebrar um problema grande em pedaços menores, resolver cada pedaço com sua própria função, e depois juntar tudo. É a mesma lógica de organizar uma festa: em vez de uma pessoa fazer tudo sozinha, alguém cuida da comida, outra da decoração, outra da música, cada tarefa isolada e com um responsável."
                    },
                    {
                        "type": "text",
                        "value": "### Não repetir código (DRY)\n\nExistem duas razões enormes para usar funções:\n\n1. **Não repetir código**: se a mesma lógica aparece em vários lugares do programa, ela deveria estar dentro de uma função, chamada onde for preciso. Isso tem até um nome conhecido no mundo da programação: **DRY** (Don't Repeat Yourself, algo como \"não se repita\").\n2. **Dar nome e legibilidade**: uma função com um bom nome, como `ehPar(numero)` ou `calcularMedia(notas)`, deixa o código quase uma frase em português, mais fácil de entender do que um monte de contas soltas."
                    },
                    {
                        "type": "code",
                        "value": "function ehPar(numero) {\n  return numero % 2 === 0;\n}\n\nconsole.log(ehPar(4));\n// saida: true\n\nconsole.log(ehPar(7));\n// saida: false\n\n// dá para usar o retorno direto dentro de um if:\nif (ehPar(10)) {\n  console.log(\"10 é par\");\n}\n// saida: 10 é par"
                    },
                    {
                        "type": "code",
                        "value": "function maiorDeDois(a, b) {\n  if (a > b) {\n    return a;\n  }\n  return b;\n}\n\nfunction maiorDeTres(a, b, c) {\n  // uma função chamando outra: maiorDeTres reaproveita maiorDeDois\n  const maiorEntreAeB = maiorDeDois(a, b);\n  return maiorDeDois(maiorEntreAeB, c);\n}\n\nconsole.log(maiorDeDois(4, 9));\n// saida: 9\n\nconsole.log(maiorDeTres(4, 9, 2));\n// saida: 9\n\nconsole.log(maiorDeTres(4, 9, 15));\n// saida: 15\n\n// maiorDeTres não precisou reescrever a lógica de comparar dois\n// números: ela reaproveitou maiorDeDois duas vezes"
                    },
                    {
                        "type": "text",
                        "value": "### Boa prática: uma função, uma responsabilidade\n\nUma função bem escrita faz **uma coisa só**, e faz bem feita. Se uma função calcula, imprime, valida e salva tudo ao mesmo tempo, ela fica difícil de entender, testar e reaproveitar. Prefira várias funções pequenas e bem nomeadas a uma função gigante que faz de tudo.\n\nO nome também importa: `maiorDeDois`, `ehPar` e `calcularMedia` já contam, só pelo nome, o que a função faz. Nomes vagos como `funcao1` ou `fazCoisa` obrigam quem lê o código a abrir a função inteira só para entender para que ela serve."
                    },
                    {
                        "type": "quote",
                        "value": "Dividir para conquistar é quebrar um problema grande em funções menores, cada uma cuidando de uma parte, e uma função pode chamar outra para montar a solução completa. Funções pequenas, bem nomeadas e com uma responsabilidade só são mais fáceis de entender, testar e reaproveitar."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa \"dividir para conquistar\" na programação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quebrar um problema grande em várias partes menores e simples",
                                "isCorrect": true
                            },
                            {
                                "text": "Dividir o valor de uma variável inteira por dois, sempre",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar o maior número possível de variáveis globais no programa",
                                "isCorrect": false
                            },
                            {
                                "text": "Excluir do código as partes que não estão funcionando direito",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o princípio DRY (Don't Repeat Yourself) recomenda?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Não repetir a mesma lógica em vários lugares do código",
                                "isCorrect": true
                            },
                            {
                                "text": "Nunca declarar mais de uma função no mesmo arquivo de código",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever todo o código numa única linha",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre usar return em vez de console.log",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando as funções abaixo:\n\nfunction maiorDeDois(a, b) {\n  if (a > b) {\n    return a;\n  }\n  return b;\n}\n\nfunction maiorDeTres(a, b, c) {\n  const maiorEntreAeB = maiorDeDois(a, b);\n  return maiorDeDois(maiorEntreAeB, c);\n}\n\nO que maiorDeTres(7, 3, 5) devolve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "7",
                                "isCorrect": true
                            },
                            {
                                "text": "3",
                                "isCorrect": false
                            },
                            {
                                "text": "5",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função chamada calcularEImprimirRelatorio calcula valores, formata texto e imprime tudo no console, de uma vez só. Qual é o problema mais provável dessa abordagem, segundo a boa prática de funções?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fica mais difícil entender, testar e reaproveitar cada parte",
                                "isCorrect": true
                            },
                            {
                                "text": "O JavaScript não permite funções com mais de uma linha de código",
                                "isCorrect": false
                            },
                            {
                                "text": "A função roda mais devagar por ter um nome longo",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe problema: quanto mais coisas uma função faz, melhor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considerando o código abaixo:\n\nfunction dobro(n) {\n  return n * 2;\n}\n\nfunction quadruplo(n) {\n  return dobro(dobro(n));\n}\n\nconsole.log(quadruplo(3));\n\nO que aparece no console?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "12",
                                "isCorrect": true
                            },
                            {
                                "text": "6",
                                "isCorrect": false
                            },
                            {
                                "text": "9",
                                "isCorrect": false
                            },
                            {
                                "text": "24",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Coleções: listas e objetos",
        "aulas": [
            {
                "titulo": "Arrays: guardando uma lista de valores",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Arrays: guardando uma lista de valores\n\nAté agora, cada dado que você quis guardar morou em uma variável separada: `let nome = \"Ana\"`, `let idade = 20`. Isso funciona bem para um ou dois valores. Mas e se você precisasse guardar os preços de 5 produtos de um carrinho de compras? Ou os nomes de 30 alunos de uma turma? Criar `preco1`, `preco2`, `preco3` e assim por diante vira uma bagunça rapidamente, ainda mais quando você nem sabe de antemão quantos valores vai precisar guardar.\n\nPara isso existe o **array** (em português, também chamado de lista ou vetor): uma única variável que guarda vários valores, organizados em ordem, um atrás do outro. Pense em uma fileira de caixinhas numeradas: cada caixinha guarda um valor, e você acessa qualquer uma delas pelo número dela."
                    },
                    {
                        "type": "text",
                        "value": "## Criando um array e o índice que começa em 0\n\nUm array é criado com colchetes `[ ]`, com os valores separados por vírgula. Você guarda o array inteiro em uma variável, do mesmo jeito que guardaria um número ou um texto.\n\nCada valor dentro do array ocupa uma posição chamada **índice**. Aqui está o detalhe mais importante deste módulo, o que mais confunde quem está começando: em JavaScript, e na grande maioria das linguagens de programação, a contagem de posições começa em **0**, não em 1. O primeiro elemento está no índice 0, o segundo no índice 1, e assim por diante."
                    },
                    {
                        "type": "code",
                        "value": "let precos = [10, 25, 8, 40];\nlet frutas = [\"maçã\", \"banana\", \"uva\"];\n\nconsole.log(precos);\n// saida: [ 10, 25, 8, 40 ]\n\nconsole.log(frutas);\n// saida: [ 'maçã', 'banana', 'uva' ]\n\n// para ler um valor, uso o nome do array e o indice entre colchetes\nconsole.log(frutas[0]); // saida: maçã (primeiro elemento, indice 0)\nconsole.log(frutas[1]); // saida: banana\nconsole.log(frutas[2]); // saida: uva (terceiro e ultimo elemento, indice 2)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Índice\",\"Elemento\"],[\"0\",\"maçã\"],[\"1\",\"banana\"],[\"2\",\"uva\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Tamanho e o índice que não existe\n\nTodo array tem uma propriedade chamada `length`, que guarda quantos elementos ele tem. Como a contagem começa em 0, o índice do último elemento é sempre `length - 1` (e não `length`, esse é um erro comum). Em `frutas`, que tem 3 elementos, `frutas.length` vale 3, e o último índice válido é 2.\n\nVocê também pode trocar o valor guardado em uma posição, atribuindo um novo valor a ela com `=`. E se você tentar acessar um índice que não existe no array (por exemplo, o índice 10 em um array de 3 posições), o JavaScript não dá erro: ele devolve `undefined`, avisando que ali não tem nada guardado."
                    },
                    {
                        "type": "code",
                        "value": "let frutas = [\"maçã\", \"banana\", \"uva\"];\n\nconsole.log(frutas.length); // saida: 3\n\n// o indice do ultimo elemento e sempre length - 1\nconsole.log(frutas[frutas.length - 1]); // saida: uva\n\n// trocando o valor da posicao 1\nfrutas[1] = \"pera\";\nconsole.log(frutas);\n// saida: [ 'maçã', 'pera', 'uva' ]\n\n// indice que nao existe: nao da erro, devolve undefined\nconsole.log(frutas[10]); // saida: undefined"
                    },
                    {
                        "type": "quote",
                        "value": "Array é uma variável que guarda vários valores em ordem. Você cria com `[ ]`, acessa e altera cada posição pelo índice, e o índice sempre começa em 0. Tentar acessar uma posição que não existe não quebra o programa: só devolve `undefined`."
                    }
                ],
                "questions": [
                    {
                        "statement": "Dado o código a seguir, qual é o índice do primeiro elemento, \"azul\"?\n\nlet cores = [\"azul\", \"verde\", \"amarelo\"];",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": true
                            },
                            {
                                "text": "-1",
                                "isCorrect": false
                            },
                            {
                                "text": "3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dado let numeros = [10, 20, 30, 40];, o que console.log(numeros[1]) imprime?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "10",
                                "isCorrect": false
                            },
                            {
                                "text": "20",
                                "isCorrect": true
                            },
                            {
                                "text": "30",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dado let letras = [\"a\", \"b\", \"c\"];, o que console.log(letras[3]) imprime?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "\"c\", porque é sempre o último elemento do array",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de sintaxe, e o programa para de rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined, pois o índice 3 não existe no array",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma string vazia \"\", padrão para índices inválidos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um array tarefas tem 5 elementos. Qual é o índice do último elemento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "5",
                                "isCorrect": false
                            },
                            {
                                "text": "4",
                                "isCorrect": true
                            },
                            {
                                "text": "6",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nlet lista = [5, 12, 8, 21];\nlista[3] = 100;\nconsole.log(lista[lista.length - 1]);",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "21",
                                "isCorrect": false
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            },
                            {
                                "text": "100",
                                "isCorrect": true
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Mexendo no array: adicionar, remover e o tamanho",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Arrays não são fixos: eles crescem e encolhem\n\nUma das coisas mais úteis de um array é que ele não tem um tamanho fixo. Você pode começar com uma lista vazia e ir adicionando itens conforme o programa roda, como uma lista de compras que cresce enquanto você anota o que falta no mercado. Também dá para remover itens, como quando você risca um item já comprado.\n\nJavaScript tem métodos prontos para isso, chamados com um ponto depois do nome do array: `array.metodo()`. O primeiro deles é o `push`, que adiciona um ou mais valores no **final** do array, fazendo ele crescer."
                    },
                    {
                        "type": "code",
                        "value": "let tarefas = [\"estudar\", \"almoçar\"];\nconsole.log(tarefas);\n// saida: [ 'estudar', 'almoçar' ]\n\ntarefas.push(\"malhar\");\nconsole.log(tarefas);\n// saida: [ 'estudar', 'almoçar', 'malhar' ]\nconsole.log(tarefas.length); // saida: 3\n\n// da para adicionar mais de um valor de uma vez\ntarefas.push(\"dormir\", \"repetir\");\nconsole.log(tarefas);\n// saida: [ 'estudar', 'almoçar', 'malhar', 'dormir', 'repetir' ]\nconsole.log(tarefas.length); // saida: 5"
                    },
                    {
                        "type": "text",
                        "value": "## pop: removendo do fim\n\n`pop` faz o oposto do `push`: remove o **último** elemento do array e devolve esse valor removido, fazendo o array encolher uma posição. Se o array já estiver vazio, `pop` não quebra o programa, apenas devolve `undefined`."
                    },
                    {
                        "type": "code",
                        "value": "let tarefas = [\"estudar\", \"almoçar\", \"malhar\"];\n\nlet ultima = tarefas.pop();\nconsole.log(ultima); // saida: malhar (o valor que foi removido)\nconsole.log(tarefas);\n// saida: [ 'estudar', 'almoçar' ]\nconsole.log(tarefas.length); // saida: 2\n\nlet vazio = [];\nconsole.log(vazio.pop()); // saida: undefined (nao tem nada para remover)"
                    },
                    {
                        "type": "text",
                        "value": "## unshift e shift: mexendo no começo\n\nExistem dois métodos parecidos que mexem no **início** do array em vez do fim: `unshift` adiciona um ou mais valores no começo, e `shift` remove e devolve o primeiro valor. Eles funcionam como o `push` e o `pop`, só que do outro lado da fila. São bem menos usados no dia a dia do que `push` e `pop`, mas vale saber que existem."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método\",\"O que faz\",\"Onde mexe\"],[\"push(valor)\",\"Adiciona um ou mais valores\",\"No fim\"],[\"pop()\",\"Remove e devolve o último valor\",\"No fim\"],[\"unshift(valor)\",\"Adiciona um ou mais valores\",\"No começo\"],[\"shift()\",\"Remove e devolve o primeiro valor\",\"No começo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Arrays não têm tamanho fixo: push adiciona no fim, pop remove do fim, e o length sempre reflete o tamanho atual. unshift e shift fazem o mesmo processo, só que no começo do array."
                    }
                ],
                "questions": [
                    {
                        "statement": "Dado let lista = [1, 2, 3]; lista.push(4);, qual é o valor de lista.length depois desse código?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "3",
                                "isCorrect": false
                            },
                            {
                                "text": "4",
                                "isCorrect": true
                            },
                            {
                                "text": "5",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o método pop() faz em um array?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Remove e devolve o primeiro elemento do array",
                                "isCorrect": false
                            },
                            {
                                "text": "Adiciona um elemento no final do array",
                                "isCorrect": false
                            },
                            {
                                "text": "Remove e devolve o último elemento do array",
                                "isCorrect": true
                            },
                            {
                                "text": "Apaga todos os elementos do array",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nlet numeros = [5, 10];\nnumeros.push(15);\nlet removido = numeros.pop();\nconsole.log(removido);",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "5",
                                "isCorrect": false
                            },
                            {
                                "text": "15",
                                "isCorrect": true
                            },
                            {
                                "text": "10",
                                "isCorrect": false
                            },
                            {
                                "text": "[5, 10]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar let cores = [\"azul\", \"verde\"]; cores.unshift(\"vermelho\");, qual é o valor de cores[0]?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "\"azul\"",
                                "isCorrect": false
                            },
                            {
                                "text": "\"verde\"",
                                "isCorrect": false
                            },
                            {
                                "text": "\"vermelho\"",
                                "isCorrect": true
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nlet pilha = [10, 20, 30];\npilha.pop();\npilha.push(40, 50);\nconsole.log(pilha[pilha.length - 1]);",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "30",
                                "isCorrect": false
                            },
                            {
                                "text": "40",
                                "isCorrect": false
                            },
                            {
                                "text": "50",
                                "isCorrect": true
                            },
                            {
                                "text": "20",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Percorrendo arrays (for e for...of)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que percorrer um array\n\nVocê já sabe usar `for` e `while` para repetir uma ação várias vezes (módulo 4). Agora que os dados moram dentro de um array, a repetição mais comum do dia a dia de quem programa é: passar por cada elemento do array, um de cada vez, para ler, somar, contar ou verificar alguma coisa. Isso se chama **percorrer** o array (em inglês, iterar).\n\nDá para escrever `arr[0]`, `arr[1]`, `arr[2]`... na mão, mas isso só funciona se você souber exatamente quantos elementos tem, e vira inviável se o array tiver 1000 posições. É para isso que usamos um laço.\n\n## for clássico: percorrendo pelo índice\n\nO jeito mais tradicional é usar um `for` com um contador `i` que começa em 0 e vai até o último índice válido, que é `length - 1`. Por isso a condição do laço usa `i < arr.length` (menor que o tamanho, e não menor ou igual, senão você tentaria acessar uma posição que não existe)."
                    },
                    {
                        "type": "code",
                        "value": "let frutas = [\"maçã\", \"banana\", \"uva\"];\n\nfor (let i = 0; i < frutas.length; i++) {\n  console.log(i + \": \" + frutas[i]);\n}\n// saida:\n// 0: maçã\n// 1: banana\n// 2: uva"
                    },
                    {
                        "type": "text",
                        "value": "## for...of: percorrendo sem se preocupar com o índice\n\nMuitas vezes você só quer o valor de cada elemento, sem precisar do índice. Para esses casos, o JavaScript tem uma versão mais simples de laço, o `for...of`, que entrega direto cada valor do array, um por vez, sem você ter que escrever `arr[i]`."
                    },
                    {
                        "type": "code",
                        "value": "let frutas = [\"maçã\", \"banana\", \"uva\"];\n\nfor (let fruta of frutas) {\n  console.log(fruta);\n}\n// saida:\n// maçã\n// banana\n// uva"
                    },
                    {
                        "type": "text",
                        "value": "## Somando e contando elementos de um array\n\nLembra do acumulador do módulo de laços, aquela variável que vai guardando um total conforme o laço repete? Com arrays, o padrão é o mesmo: você cria uma variável fora do laço (o acumulador, começando em 0), e a cada volta soma ou verifica o valor daquela posição."
                    },
                    {
                        "type": "code",
                        "value": "let precos = [10, 25, 8, 40];\n\n// somando todos os precos\nlet total = 0;\nfor (let preco of precos) {\n  total = total + preco;\n}\nconsole.log(total); // saida: 83\n\n// contando quantos precos sao maiores que 10\nlet quantos = 0;\nfor (let preco of precos) {\n  if (preco > 10) {\n    quantos = quantos + 1;\n  }\n}\nconsole.log(quantos); // saida: 2"
                    },
                    {
                        "type": "quote",
                        "value": "Para percorrer um array, use for quando precisar do índice (por exemplo, para numerar os itens ou comparar posições) e for...of quando só precisar do valor de cada elemento. O padrão do acumulador, uma variável que vai somando ou contando a cada volta, funciona igual dentro de um array."
                    }
                ],
                "questions": [
                    {
                        "statement": "No for clássico for (let i = 0; i < arr.length; i++), com que valor a variável i começa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": true
                            },
                            {
                                "text": "arr.length",
                                "isCorrect": false
                            },
                            {
                                "text": "-1",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual código abaixo percorre corretamente o array numeros, imprimindo cada valor, usando for...of?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "for (let n of numeros) { console.log(n); }",
                                "isCorrect": true
                            },
                            {
                                "text": "for (let n of numeros.length) { console.log(n); }",
                                "isCorrect": false
                            },
                            {
                                "text": "for (let i = 0; i of numeros; i++) { console.log(i); }",
                                "isCorrect": false
                            },
                            {
                                "text": "for of (let n numeros) { console.log(n); }",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nlet numeros = [3, 6, 9];\nlet total = 0;\nfor (let n of numeros) {\n  total = total + n;\n}\nconsole.log(total);",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "9",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            },
                            {
                                "text": "18",
                                "isCorrect": true
                            },
                            {
                                "text": "3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um array com 6 elementos, qual é a condição correta para um for clássico percorrer todos eles usando i como índice?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "i <= arr.length",
                                "isCorrect": false
                            },
                            {
                                "text": "i < arr.length",
                                "isCorrect": true
                            },
                            {
                                "text": "i < arr.length - 1",
                                "isCorrect": false
                            },
                            {
                                "text": "i > 0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nlet idades = [15, 22, 17, 30, 16];\nlet menores = 0;\nfor (let i = 0; i < idades.length; i++) {\n  if (idades[i] < 18) {\n    menores = menores + 1;\n  }\n}\nconsole.log(menores);",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "2",
                                "isCorrect": false
                            },
                            {
                                "text": "3",
                                "isCorrect": true
                            },
                            {
                                "text": "5",
                                "isCorrect": false
                            },
                            {
                                "text": "18",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Objetos: descrevendo uma coisa com chave e valor",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Descrevendo uma coisa só, com várias informações\n\nO array é ótimo para guardar uma lista de valores parecidos: preços, nomes, tarefas. Mas e quando você precisa descrever **uma coisa só**, com várias informações diferentes? Por exemplo, uma pessoa tem nome, idade e cidade. Você até poderia usar um array, `[\"Ana\", 20, \"São Paulo\"]`, mas aí precisaria decorar que a posição 0 é o nome, a 1 é a idade e a 2 é a cidade. Isso é frágil: um dia você troca a ordem sem querer e todo o programa quebra.\n\nPara isso existe o **objeto**: uma coleção de informações identificadas por **nome**, não por posição. Cada informação é um par **chave e valor**: a chave é o nome da informação, e o valor é o conteúdo dela. Um objeto é criado com chaves `{ }`, e cada par é escrito como `chave: valor`, separado por vírgula do próximo par."
                    },
                    {
                        "type": "code",
                        "value": "let pessoa = {\n  nome: \"Ana\",\n  idade: 20,\n  cidade: \"São Paulo\"\n};\n\nconsole.log(pessoa);\n// saida: { nome: 'Ana', idade: 20, cidade: 'São Paulo' }"
                    },
                    {
                        "type": "text",
                        "value": "## Acessando uma propriedade: ponto ou colchetes\n\nCada par chave-valor de um objeto é chamado de **propriedade**. Existem duas formas de ler o valor de uma propriedade: com ponto (`objeto.chave`), a forma mais comum e mais fácil de ler, ou com colchetes e o nome da chave entre aspas (`objeto[\"chave\"]`), útil quando o nome da chave está guardado dentro de uma variável."
                    },
                    {
                        "type": "code",
                        "value": "let pessoa = {\n  nome: \"Ana\",\n  idade: 20\n};\n\n// duas formas de ler a mesma propriedade\nconsole.log(pessoa.nome); // saida: Ana\nconsole.log(pessoa[\"idade\"]); // saida: 20\n\n// alterando um valor existente\npessoa.idade = 21;\n\n// criando uma propriedade nova\npessoa.cidade = \"Recife\";\n\nconsole.log(pessoa);\n// saida: { nome: 'Ana', idade: 21, cidade: 'Recife' }"
                    },
                    {
                        "type": "text",
                        "value": "## Array ou objeto: qual usar?\n\nEsse é o ponto principal para não confundir os dois. Um **array** é uma lista ordenada, onde cada valor tem uma posição numérica (0, 1, 2...) e normalmente todos os valores são do mesmo tipo de coisa (uma lista de preços, uma lista de nomes). Um **objeto** descreve uma coisa só, com propriedades nomeadas e sem ordem definida: cada informação tem um nome que diz o que ela é (nome, idade, cidade)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Array\",\"Objeto\"],[\"Como cria\",\"[ ]\",\"{ }\"],[\"Cada posição ou propriedade tem\",\"Um índice numérico (0, 1, 2...)\",\"Um nome (chave)\"],[\"Como acessa um valor\",\"arr[0]\",\"obj.chave ou obj[\\\"chave\\\"]\"],[\"Usado mais para\",\"Uma lista de valores parecidos\",\"Descrever algo com vários detalhes\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Objeto guarda informações sobre uma coisa só, usando pares chave e valor. Você acessa e altera cada propriedade pelo nome dela, com ponto ou colchetes, não por índice numérico. Use array para uma lista de valores parecidos, e objeto para descrever algo com várias características diferentes."
                    }
                ],
                "questions": [
                    {
                        "statement": "Dado let aluno = { nome: \"Carlos\", idade: 17 };, o que console.log(aluno.idade) imprime?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "\"Carlos\"",
                                "isCorrect": false
                            },
                            {
                                "text": "17",
                                "isCorrect": true
                            },
                            {
                                "text": "\"idade\"",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a forma correta de criar um objeto vazio em JavaScript?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "let obj = [];",
                                "isCorrect": false
                            },
                            {
                                "text": "let obj = {};",
                                "isCorrect": true
                            },
                            {
                                "text": "let obj = ();",
                                "isCorrect": false
                            },
                            {
                                "text": "let obj = (());",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dado let produto = { nome: \"Caderno\", preco: 15 };, qual código lê o valor da propriedade preco usando colchetes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "produto(preco)",
                                "isCorrect": false
                            },
                            {
                                "text": "produto.[preco]",
                                "isCorrect": false
                            },
                            {
                                "text": "produto[\"preco\"]",
                                "isCorrect": true
                            },
                            {
                                "text": "produto{preco}",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nlet carro = { modelo: \"Fusca\", ano: 1975 };\ncarro.ano = 1980;\nconsole.log(carro.ano);",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "1975",
                                "isCorrect": false
                            },
                            {
                                "text": "1980",
                                "isCorrect": true
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            },
                            {
                                "text": "\"Fusca\"",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal diferença entre um array e um objeto em JavaScript?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Array só pode guardar números, e objeto só pode guardar textos",
                                "isCorrect": false
                            },
                            {
                                "text": "Objeto só pode ter uma única propriedade, mas array pode ter várias posições",
                                "isCorrect": false
                            },
                            {
                                "text": "Array usa posições numeradas; objeto usa chaves nomeadas como propriedade",
                                "isCorrect": true
                            },
                            {
                                "text": "Array e objeto são a mesma coisa, só muda a forma de escrever",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Array de objetos: uma lista de registros",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Juntando tudo: uma lista de registros\n\nVocê já sabe guardar vários valores parecidos em um array, e já sabe descrever uma coisa só com várias informações usando um objeto. Agora vem a combinação mais usada na prática, e a mais parecida com o que você vai encontrar no back-end: um **array de objetos**, uma lista onde cada posição é um objeto completo.\n\nPense em uma lista de tarefas: você não quer só os títulos (um array de textos), você quer, para cada tarefa, saber também se ela já foi concluída. A solução é um array em que cada elemento é um objeto com as propriedades `titulo` e `concluida`. Repare que isso se parece com uma planilha: cada posição do array é uma linha, e cada propriedade do objeto é uma coluna. Esse é o mesmo modelo mental que você vai usar mais para a frente, quando trabalhar com registros vindos de um banco de dados."
                    },
                    {
                        "type": "code",
                        "value": "let tarefas = [\n  { titulo: \"estudar JavaScript\", concluida: true },\n  { titulo: \"lavar louça\", concluida: false },\n  { titulo: \"fazer exercício\", concluida: true },\n  { titulo: \"ler um livro\", concluida: false }\n];\n\nconsole.log(tarefas.length); // saida: 4\nconsole.log(tarefas[0]); // saida: { titulo: 'estudar JavaScript', concluida: true }\nconsole.log(tarefas[0].titulo); // saida: estudar JavaScript"
                    },
                    {
                        "type": "text",
                        "value": "## Percorrendo o array de objetos\n\nPara percorrer um array de objetos, o `for...of` que você já conhece funciona perfeitamente: a cada volta, a variável recebe um objeto inteiro, e você lê as propriedades dele com ponto, igual fez com objetos soltos."
                    },
                    {
                        "type": "code",
                        "value": "let tarefas = [\n  { titulo: \"estudar JavaScript\", concluida: true },\n  { titulo: \"lavar louça\", concluida: false },\n  { titulo: \"fazer exercício\", concluida: true },\n  { titulo: \"ler um livro\", concluida: false }\n];\n\nfor (let tarefa of tarefas) {\n  console.log(tarefa.titulo + \" - concluida: \" + tarefa.concluida);\n}\n// saida:\n// estudar JavaScript - concluida: true\n// lavar louça - concluida: false\n// fazer exercício - concluida: true\n// ler um livro - concluida: false"
                    },
                    {
                        "type": "text",
                        "value": "## Buscando e contando dentro do array de objetos\n\nJuntando o laço com o `if` que você já conhece do módulo de condicionais, dá para responder perguntas sobre a lista: quantas tarefas estão concluídas? Existe uma tarefa com um título específico? O padrão é sempre o mesmo: percorrer o array e, a cada volta, checar uma condição usando as propriedades do objeto atual."
                    },
                    {
                        "type": "code",
                        "value": "let tarefas = [\n  { titulo: \"estudar JavaScript\", concluida: true },\n  { titulo: \"lavar louça\", concluida: false },\n  { titulo: \"fazer exercício\", concluida: true },\n  { titulo: \"ler um livro\", concluida: false }\n];\n\n// contando quantas tarefas estao concluidas\nlet totalConcluidas = 0;\nfor (let tarefa of tarefas) {\n  if (tarefa.concluida === true) {\n    totalConcluidas = totalConcluidas + 1;\n  }\n}\nconsole.log(totalConcluidas); // saida: 2\n\n// buscando uma tarefa pelo titulo\nlet buscada = \"lavar louça\";\nfor (let tarefa of tarefas) {\n  if (tarefa.titulo === buscada) {\n    console.log(\"encontrada, concluida: \" + tarefa.concluida);\n  }\n}\n// saida: encontrada, concluida: false"
                    },
                    {
                        "type": "quote",
                        "value": "Um array de objetos é uma lista de registros: cada posição é um objeto com suas próprias propriedades. Para trabalhar com ele, percorra com for...of e, dentro do laço, leia as propriedades com ponto. Somar um if à repetição é como você conta, filtra ou busca dentro da lista."
                    }
                ],
                "questions": [
                    {
                        "statement": "Dado let tarefas = [{ titulo: \"estudar\", concluida: true }, { titulo: \"correr\", concluida: false }];, o que tarefas[0].titulo retorna?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "\"correr\"",
                                "isCorrect": false
                            },
                            {
                                "text": "true",
                                "isCorrect": false
                            },
                            {
                                "text": "\"estudar\"",
                                "isCorrect": true
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um array de objetos, o que cada posição do array representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um único valor numérico, sempre um índice do array",
                                "isCorrect": false
                            },
                            {
                                "text": "Um objeto completo, com propriedades próprias",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome de uma variável usada no array",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre um texto entre aspas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nlet itens = [{ nome: \"caneta\", preco: 2 }, { nome: \"caderno\", preco: 15 }];\nlet total = 0;\nfor (let item of itens) {\n  total = total + item.preco;\n}\nconsole.log(total);",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "2",
                                "isCorrect": false
                            },
                            {
                                "text": "17",
                                "isCorrect": true
                            },
                            {
                                "text": "15",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a forma correta de contar quantas tarefas estão concluídas em um array de objetos tarefas, cada um com a propriedade concluida (true ou false)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Somar todos os valores de tarefas.length",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar tarefas.pop() até o array ficar vazio e contar quantas vezes isso aconteceu",
                                "isCorrect": false
                            },
                            {
                                "text": "Percorrer com for...of e somar 1 ao contador quando concluida for true",
                                "isCorrect": true
                            },
                            {
                                "text": "Comparar tarefas[0] com tarefas[1]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a saída deste código?\n\nlet produtos = [\n  { nome: \"mouse\", estoque: 5 },\n  { nome: \"teclado\", estoque: 0 },\n  { nome: \"monitor\", estoque: 3 }\n];\nlet semEstoque = 0;\nfor (let produto of produtos) {\n  if (produto.estoque === 0) {\n    semEstoque = semEstoque + 1;\n  }\n}\nconsole.log(semEstoque);",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "0",
                                "isCorrect": false
                            },
                            {
                                "text": "3",
                                "isCorrect": false
                            },
                            {
                                "text": "8",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Resolvendo problemas de verdade",
        "aulas": [
            {
                "titulo": "Como atacar um problema de programação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Como atacar um problema de programação\n\nNos módulos anteriores você aprendeu, separadamente, a guardar valores em variáveis, tomar decisões com condicionais, repetir tarefas com laços, organizar a lógica em funções e guardar coleções de dados em arrays e objetos. Chegou a hora de juntar tudo isso para resolver problemas de verdade, do jeito que um programador faz no dia a dia.\n\nA boa notícia é que existe um roteiro simples que funciona para praticamente qualquer problema, por menor que ele seja."
                    },
                    {
                        "type": "text",
                        "value": "## Um roteiro de quatro passos\n\n- **Entenda o enunciado.** Leia com calma. O que exatamente o problema está pedindo como resposta? Que informações você já tem para começar?\n- **Quebre em passos pequenos.** Em vez de pensar no problema inteiro de uma vez, escreva (em português mesmo, ou pseudocódigo) a sequência de ações que leva do início ao resultado.\n- **Escolha as ferramentas.** Para cada passo, decida o que ele precisa: uma variável para guardar algo, um laço para repetir, uma condicional para decidir, um array para guardar vários valores.\n- **Escreva e teste aos poucos.** Não escreva o programa inteiro de uma vez. Escreva um pedaço, rode, confira o resultado com console.log, e só então siga para o próximo pedaço."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Passo\",\"Pergunta que você se faz\",\"Resultado esperado\"],[\"Entender\",\"O que o problema pede como resposta final?\",\"Uma frase clara descrevendo a saída\"],[\"Quebrar em passos\",\"Quais ações, em ordem, chegam a essa resposta?\",\"Uma lista de passos em português\"],[\"Escolher ferramentas\",\"Cada passo precisa de variável, laço, condicional ou função?\",\"Um esboço de quais recursos usar\"],[\"Testar aos poucos\",\"Esse pedaço fez o que eu esperava?\",\"Um console.log confirmando (ou não) a expectativa\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Um exemplo resolvido do zero\n\nProblema: \"Você tem as idades das pessoas inscritas em uma oficina. Descubra quantas delas são maiores de idade (18 anos ou mais).\"\n\nVamos aplicar o roteiro antes de escrever qualquer código:\n\n1. **Entender**: a resposta é um número (a contagem de pessoas com 18 anos ou mais). Não preciso listar quem são, só contar.\n2. **Quebrar em passos**: preciso de uma lista de idades; preciso de um contador começando em 0; preciso percorrer a lista, uma idade de cada vez; para cada idade, se ela for maior ou igual a 18, somo 1 ao contador; no final, mostro o contador.\n3. **Escolher ferramentas**: um array para as idades, uma variável number para o contador, um for...of para percorrer, um if com >= para decidir.\n4. **Escrever aos poucos**: primeiro só o laço imprimindo cada idade, depois acrescento o if, depois o contador. Só no fim eu confio no resultado."
                    },
                    {
                        "type": "code",
                        "value": "const idades = [15, 22, 17, 30, 18, 12, 45];\n\nlet maioresDeIdade = 0;\n\nfor (const idade of idades) {\n  if (idade >= 18) {\n    maioresDeIdade = maioresDeIdade + 1;\n  }\n}\n\nconsole.log(maioresDeIdade);\n// saida: 4"
                    },
                    {
                        "type": "quote",
                        "value": "Todo problema grande é uma coleção de problemas pequenos. Entenda antes de codar, quebre em passos, escolha as ferramentas certas para cada passo e teste sempre aos poucos, nunca o programa inteiro de uma vez."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o primeiro passo recomendado antes de começar a escrever o código de um problema novo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Entender bem o que o enunciado está pedindo como resposta",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever o código o mais rápido possível",
                                "isCorrect": false
                            },
                            {
                                "text": "Decidir o nome de todas as variáveis antes de mais nada",
                                "isCorrect": false
                            },
                            {
                                "text": "Procurar um código pronto parecido na internet",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quebrar um problema grande em passos menores ajuda principalmente porque:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cada parte fica mais fácil de pensar e testar",
                                "isCorrect": true
                            },
                            {
                                "text": "O código final fica mais longo, mas mais completo",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso evita ter que usar variáveis",
                                "isCorrect": false
                            },
                            {
                                "text": "O programa passa a rodar mais rápido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No código que conta quantas idades são maiores ou iguais a 18, qual variável guarda o resultado final que é mostrado no console?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "maioresDeIdade",
                                "isCorrect": true
                            },
                            {
                                "text": "idades",
                                "isCorrect": false
                            },
                            {
                                "text": "idade",
                                "isCorrect": false
                            },
                            {
                                "text": "idade >= 18",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Testar o código aos poucos, em vez de escrever o programa inteiro de uma vez, ajuda principalmente porque:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fica mais fácil descobrir em qual parte está o erro",
                                "isCorrect": true
                            },
                            {
                                "text": "O programa passa a ocupar menos memória",
                                "isCorrect": false
                            },
                            {
                                "text": "Evita completamente a necessidade de usar console.log",
                                "isCorrect": false
                            },
                            {
                                "text": "O código final fica automaticamente mais curto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Observe: const idades = [10, 18, 20, 16, 19]; let contador = 0; for (const idade of idades) { if (idade > 18) { contador = contador + 1; } } console.log(contador); O que este código imprime?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "2",
                                "isCorrect": true
                            },
                            {
                                "text": "3",
                                "isCorrect": false
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "5",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Algoritmos em arrays: buscar, contar e achar o maior",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Algoritmos em arrays: buscar, contar e achar o maior\n\nAgora que você sabe atacar um problema, vale conhecer algumas \"receitas prontas\" que aparecem o tempo todo quando o assunto é array: procurar um item, contar quantos itens satisfazem uma condição e achar o maior ou o menor valor. Essas três receitas resolvem uma fatia enorme dos problemas que você vai encontrar."
                    },
                    {
                        "type": "text",
                        "value": "## Busca linear\n\nBuscar um item em um array, sem nenhum truque especial, é simplesmente percorrer os itens um a um comparando cada um com o que você procura. Isso se chama busca linear. Assim que encontra o item, o algoritmo pode parar (não precisa olhar o resto). Se chegar ao final sem encontrar, a resposta é que o item não está lá."
                    },
                    {
                        "type": "code",
                        "value": "const frutas = [\"maçã\", \"banana\", \"uva\", \"pera\"];\n\nfunction contemFruta(lista, procurada) {\n  for (const fruta of lista) {\n    if (fruta === procurada) {\n      return true; // achou, nao precisa continuar o laco\n    }\n  }\n  return false; // percorreu tudo e nao achou\n}\n\nconsole.log(contemFruta(frutas, \"uva\"));\n// saida: true\n\nconsole.log(contemFruta(frutas, \"manga\"));\n// saida: false"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Índice\",\"Fruta\",\"É a que procuramos (\\\"uva\\\")?\",\"O que o código faz\"],[\"0\",\"maçã\",\"não\",\"continua para o próximo índice\"],[\"1\",\"banana\",\"não\",\"continua para o próximo índice\"],[\"2\",\"uva\",\"sim\",\"retorna true e para o laço\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Contar e achar o maior (ou o menor)\n\nContar quantos itens satisfazem uma condição usa o mesmo contador que você já viu no Módulo 4: uma variável que começa em 0 e soma 1 toda vez que a condição é verdadeira dentro do laço.\n\nAchar o maior (ou o menor) valor segue outra receita: você \"aposta\" que o primeiro item do array é o campeão e vai comparando com os demais. Sempre que encontra alguém maior (ou menor, se estiver procurando o mínimo), troca o campeão de lugar."
                    },
                    {
                        "type": "code",
                        "value": "const notas = [7, 3, 9, 5, 10, 4];\n\n// 1) contar quantos itens satisfazem uma condicao\nlet aprovados = 0;\nfor (const nota of notas) {\n  if (nota >= 6) {\n    aprovados = aprovados + 1;\n  }\n}\nconsole.log(aprovados);\n// saida: 3\n\n// 2) achar o maior valor do array\nlet maiorNota = notas[0]; // comeca \"apostando\" no primeiro item\nfor (const nota of notas) {\n  if (nota > maiorNota) {\n    maiorNota = nota; // achou alguem maior, troca o campeao\n  }\n}\nconsole.log(maiorNota);\n// saida: 10"
                    },
                    {
                        "type": "quote",
                        "value": "Busca, contar e achar o maior são o mesmo movimento de fundo: percorrer o array e comparar cada item. Domine esse movimento e você resolve boa parte dos problemas do dia a dia com arrays."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na busca linear, o que o código faz assim que encontra o item procurado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pode parar e devolver o resultado na hora",
                                "isCorrect": true
                            },
                            {
                                "text": "Continua percorrendo o array inteiro mesmo assim",
                                "isCorrect": false
                            },
                            {
                                "text": "Reinicia o laço a partir do primeiro item",
                                "isCorrect": false
                            },
                            {
                                "text": "Remove o item encontrado do array",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para contar quantos itens de um array satisfazem uma condição, qual é o padrão mais comum?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma variável contadora que começa em 0 e soma 1",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma variável que começa em 1 e nunca muda de valor",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar apenas o length do array",
                                "isCorrect": false
                            },
                            {
                                "text": "Somar o valor de todos os itens do array",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Observe: const numeros = [4, 8, 1, 9, 3]; let maior = numeros[0]; for (const n of numeros) { if (n > maior) { maior = n; } } console.log(maior); O que este código imprime?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "9",
                                "isCorrect": true
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o código que acha o maior valor de um array começa com maior = numeros[0], em vez de começar com maior = 0?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque, se todos os números forem negativos, começar com 0 daria erro",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o primeiro item de um array em JavaScript é sempre o maior",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o número 0 não pode ser usado em comparações",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda variável precisa obrigatoriamente começar com um valor do array",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O código a seguir acha o maior valor de um array: let maior = numeros[0]; for (const n of numeros) { if (n > maior) { maior = n; } }. Qual mudança faria esse código achar o MENOR valor em vez do maior?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Trocar o operador > por < na condição do if",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar numeros[0] por 0 na primeira linha",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o for por um while",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar apenas o nome da variável maior para menor, sem mexer no operador",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Colocando em ordem: a ideia de ordenação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Colocando em ordem: a ideia de ordenação\n\nMuita coisa fica mais fácil de entender quando está organizada: uma lista de tarefas por prioridade, um ranking de notas da maior para a menor, nomes em ordem alfabética. Ordenar é exatamente isso: reorganizar os itens de um array seguindo um critério.\n\nNesta aula você vai entender a ideia por trás da ordenação e conhecer a ferramenta pronta que o JavaScript oferece para isso."
                    },
                    {
                        "type": "text",
                        "value": "## Ordenação por seleção: a ideia\n\nLembra do algoritmo que acha o menor valor de um array, da aula passada? A ordenação por seleção usa exatamente essa ideia, repetida várias vezes:\n\n1. Procure o menor valor do trecho do array que ainda falta ordenar.\n2. Troque esse menor valor de lugar com o primeiro item desse trecho.\n3. Considere esse primeiro item já ordenado e repita o processo só com o restante.\n4. Continue até sobrar um único item.\n\nNo final, o array inteiro está em ordem crescente. É uma ideia simples, embora repita bastante trabalho, por isso, na prática, quase ninguém escreve essa lógica na mão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Passo\",\"Array antes do passo\",\"Menor do trecho restante\",\"Array depois de trocar\"],[\"1\",\"[4, 1, 3, 2]\",\"1\",\"[1, 4, 3, 2]\"],[\"2\",\"[1, 4, 3, 2], falta ordenar a partir do índice 1\",\"2\",\"[1, 2, 3, 4]\"],[\"3\",\"[1, 2, 3, 4], falta ordenar a partir do índice 2\",\"3 (já está no lugar certo)\",\"[1, 2, 3, 4]\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Na prática: o método sort()\n\nEntender a ideia da ordenação por seleção ajuda a raciocinar, mas no dia a dia você não vai escrever esse algoritmo na mão toda vez. O JavaScript já tem um método pronto para arrays: sort()."
                    },
                    {
                        "type": "code",
                        "value": "const nomes = [\"Carlos\", \"Ana\", \"Bruno\"];\n\nnomes.sort();\n\nconsole.log(nomes);\n// saida: [\"Ana\", \"Bruno\", \"Carlos\"]"
                    },
                    {
                        "type": "code",
                        "value": "const numeros = [10, 1, 2];\n\nconsole.log(numeros.sort());\n// saida: [1, 10, 2]  (nao e o que voce esperava!)\n\n// por padrao, sort() compara os itens como se fossem texto.\n// para numeros, precisamos dizer como comparar:\nconsole.log(numeros.sort((a, b) => a - b));\n// saida: [1, 2, 10]"
                    },
                    {
                        "type": "quote",
                        "value": "Ordenar é repetir, de forma organizada, algo que você já sabe fazer: comparar e escolher o menor (ou o maior). No dia a dia, confie no sort() do JavaScript, mas sempre diga a ele como comparar números."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa \"ordenar\" um array?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reorganizar os itens do array seguindo um critério",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover os itens repetidos do array",
                                "isCorrect": false
                            },
                            {
                                "text": "Contar quantos itens o array tem",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformar todos os números do array em texto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual método pronto do JavaScript reorganiza os itens de um array?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "sort()",
                                "isCorrect": true
                            },
                            {
                                "text": "order()",
                                "isCorrect": false
                            },
                            {
                                "text": "arrange()",
                                "isCorrect": false
                            },
                            {
                                "text": "index()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Observe: const numeros = [3, 1, 2]; console.log(numeros.sort()); O que este código imprime?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "[1, 2, 3]",
                                "isCorrect": true
                            },
                            {
                                "text": "[3, 2, 1]",
                                "isCorrect": false
                            },
                            {
                                "text": "[3, 1, 2]",
                                "isCorrect": false
                            },
                            {
                                "text": "Dá erro, porque sort() não existe para arrays de números",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na ordenação por seleção, depois de achar o menor valor do trecho e colocá-lo na frente, o que o algoritmo faz a seguir?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Repete o processo no restante, ignorando o item já posicionado",
                                "isCorrect": true
                            },
                            {
                                "text": "Para, porque o array já está pronto",
                                "isCorrect": false
                            },
                            {
                                "text": "Começa de novo do zero, considerando outra vez todos os itens",
                                "isCorrect": false
                            },
                            {
                                "text": "Troca o maior valor de lugar com o menor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual código ordena corretamente o array [10, 2, 33, 4] do menor para o maior número?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "numeros.sort((a, b) => a - b);",
                                "isCorrect": true
                            },
                            {
                                "text": "numeros.sort();",
                                "isCorrect": false
                            },
                            {
                                "text": "numeros.sort((a, b) => b - a);",
                                "isCorrect": false
                            },
                            {
                                "text": "numeros.reverse();",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Quando dá errado: depurando seu código",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Quando dá errado: depurando seu código\n\nSe o seu código não funcionar de primeira, parabéns, você é um programador normal. Errar faz parte do processo. O que separa quem programa bem de quem trava no primeiro erro é saber como investigar. Esse processo de encontrar e corrigir um problema no código se chama depuração (debugging).\n\nNesta aula você vai aprender um roteiro simples para descobrir o que deu errado."
                    },
                    {
                        "type": "text",
                        "value": "## Um roteiro para investigar\n\nQuando o código não funciona, seja porque ele quebrou com um erro, seja porque roda até o fim mas dá um resultado errado, siga esta ordem:\n\n- **Leia a mensagem de erro com calma.** Ela quase sempre diz o tipo do problema e a linha onde ele aconteceu.\n- **Isole o trecho.** Em vez de olhar o programa inteiro, teste só a parte suspeita, separada do resto.\n- **Use console.log para inspecionar valores.** Imprima as variáveis em pontos-chave do código para ver se elas têm o valor que você espera.\n- **Teste hipóteses, uma de cada vez.** Tem uma ideia do que pode estar errado? Mude só aquilo, rode de novo e veja se o resultado muda como você previu."
                    },
                    {
                        "type": "code",
                        "value": "const nomes = [\"Ana\", \"Bruno\"];\n\nconsole.log(nomes[5].toUpperCase());\n\n// TypeError: Cannot read properties of undefined (reading 'toUpperCase')\n//\n// nomes[5] nao existe (o array so tem os indices 0 e 1),\n// entao nomes[5] e undefined, e undefined nao tem toUpperCase.\n// a propria mensagem ja aponta o problema: \"reading toUpperCase\" de undefined."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Erro comum\",\"O que costuma acontecer\",\"Como perceber\"],[\"Usar = em vez de ===\",\"o if sempre entra como verdadeiro, porque = atribui um valor em vez de comparar\",\"reveja toda comparação: use === para comparar, = somente para atribuir\"],[\"Off-by-one no laço (i <= array.length)\",\"aparece undefined no final, ou um item a mais é processado por engano\",\"confira o limite do for: use i < array.length para percorrer só os índices válidos\"],[\"Esquecer o return\",\"a função roda e calcula certo por dentro, mas devolve undefined\",\"confira se toda função que deveria devolver um valor tem um return\"],[\"Nomes de variáveis parecidos (ex.: nota e notas)\",\"o código roda sem nenhum erro, mas usa o valor errado\",\"dê nomes bem diferentes e claros para cada variável\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando o código roda, mas o resultado está errado\n\nO caso mais chato de depurar é quando não aparece nenhum erro: o programa roda até o fim, só que o resultado não é o esperado. Aqui o console.log é seu melhor amigo, imprima os valores no meio do caminho para ver em qual passo as coisas saem do previsto.\n\nVeja um exemplo: o código deveria somar as notas de um aluno, mas está devolvendo um valor estranho."
                    },
                    {
                        "type": "code",
                        "value": "const notas = [7, 8, 6];\n\nfunction somarNotas(lista) {\n  let soma = 0;\n  for (let i = 0; i <= lista.length; i++) {\n    soma = soma + lista[i];\n  }\n  return soma;\n}\n\nconsole.log(somarNotas(notas));\n// saida: NaN  (nao e o esperado)\n\n// investigando com console.log dentro do laco:\nfunction somarNotasComLog(lista) {\n  let soma = 0;\n  for (let i = 0; i <= lista.length; i++) {\n    console.log(\"i =\", i, \"lista[i] =\", lista[i]);\n    soma = soma + lista[i];\n  }\n  return soma;\n}\n\nsomarNotasComLog(notas);\n// i = 0 lista[i] = 7\n// i = 1 lista[i] = 8\n// i = 2 lista[i] = 6\n// i = 3 lista[i] = undefined   <- aqui esta o problema\n//\n// o laco usa i <= lista.length, entao ele tenta acessar lista[3],\n// que nao existe. o certo e i < lista.length."
                    },
                    {
                        "type": "quote",
                        "value": "Um erro não é um fracasso, é uma pista. Leia a mensagem com calma, isole o trecho, imprima os valores com console.log e teste uma hipótese de cada vez, até o comportamento bater com o que você esperava."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que você deve fazer primeiro ao ver uma mensagem de erro no console?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ler a mensagem com calma, ela geralmente indica o tipo do problema e a linha",
                                "isCorrect": true
                            },
                            {
                                "text": "Ignorar e rodar o código de novo, torcendo para não acontecer outra vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar todo o código e recomeçar do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Comentar todas as linhas do arquivo até o erro sumir",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual ferramenta simples ajuda a inspecionar o valor de uma variável no meio da execução do código?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "console.log()",
                                "isCorrect": true
                            },
                            {
                                "text": "return, dentro de uma função",
                                "isCorrect": false
                            },
                            {
                                "text": "if, junto de uma condição",
                                "isCorrect": false
                            },
                            {
                                "text": "sort(), para ordenar arrays",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função deveria devolver a soma de dois números. Ao rodar console.log(somar(2, 3)), aparece undefined no console, sem nenhum erro. O que é mais provável ter acontecido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A função esqueceu de usar return no final",
                                "isCorrect": true
                            },
                            {
                                "text": "Os números 2 e 3 não existem em JavaScript",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando console.log foi escrito de forma errada",
                                "isCorrect": false
                            },
                            {
                                "text": "A função foi definida duas vezes no mesmo arquivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Observe: const numeros = [10, 20, 30]; for (let i = 0; i <= numeros.length; i++) { console.log(numeros[i]); }. O que acontece de errado nesse laço?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele tenta acessar numeros[3], que não existe",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele pula o primeiro item do array",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele entra em um loop infinito",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele imprime todos os itens do array em ordem invertida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Observe: function contemNumero(lista, procurado) { for (const n of lista) { if (n === procurado) { return true; } return false; } } console.log(contemNumero([5, 8, 2, 9], 2)); O array contém o número 2, mas esse código imprime false. Qual é a causa do bug?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O return false ficou fora do if, dentro do laço",
                                "isCorrect": true
                            },
                            {
                                "text": "O operador === deveria ser trocado por ==",
                                "isCorrect": false
                            },
                            {
                                "text": "A função não recebe os parâmetros na ordem correta",
                                "isCorrect": false
                            },
                            {
                                "text": "O array [5, 8, 2, 9] não é considerado válido nessa versão do JavaScript",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Mini-projeto: uma lista de tarefas (e o próximo passo)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Mini-projeto: uma lista de tarefas\n\nChegou a hora de juntar tudo que você aprendeu nesta trilha: variáveis, condicionais, laços, funções e coleções (arrays e objetos). Vamos construir, aos poucos, um pequeno gerenciador de tarefas que roda inteiramente na memória do programa (quando o programa termina, a lista some, mas isso não é problema agora, o objetivo aqui é praticar a lógica).\n\nO projeto vai ter:\n- um array para guardar as tarefas (cada tarefa é um objeto com título e status)\n- uma função para adicionar uma tarefa nova\n- uma função para listar as tarefas\n- uma função para marcar uma tarefa como concluída\n- uma função para contar quantas tarefas ainda estão pendentes\n\nVamos construir peça por peça."
                    },
                    {
                        "type": "code",
                        "value": "const tarefas = [];\n\nfunction adicionarTarefa(titulo) {\n  const novaTarefa = {\n    titulo: titulo,\n    concluida: false,\n  };\n  tarefas.push(novaTarefa);\n}\n\nadicionarTarefa(\"Estudar lacos\");\nadicionarTarefa(\"Fazer o exercicio de funcoes\");\nadicionarTarefa(\"Revisar arrays e objetos\");\n\nconsole.log(tarefas);\n// saida:\n// [\n//   { titulo: \"Estudar lacos\", concluida: false },\n//   { titulo: \"Fazer o exercicio de funcoes\", concluida: false },\n//   { titulo: \"Revisar arrays e objetos\", concluida: false }\n// ]"
                    },
                    {
                        "type": "text",
                        "value": "## Listando, concluindo e contando\n\nCada tarefa é um objeto com dois campos: titulo (texto) e concluida (um boolean que começa false). Três funções vão trabalhar em cima desse array:\n\n- listarTarefas() percorre o array com for...of e mostra o título de cada tarefa, marcando de forma diferente as que já foram concluídas.\n- concluirTarefa(titulo) faz uma busca linear, igual à da aula 2: procura pelo título e, quando encontra, muda concluida para true.\n- contarPendentes() percorre o array e conta quantas tarefas ainda têm concluida igual a false, o mesmo padrão de contador da aula 2."
                    },
                    {
                        "type": "code",
                        "value": "function listarTarefas() {\n  for (const tarefa of tarefas) {\n    if (tarefa.concluida) {\n      console.log(\"[x] \" + tarefa.titulo);\n    } else {\n      console.log(\"[ ] \" + tarefa.titulo);\n    }\n  }\n}\n\nfunction concluirTarefa(titulo) {\n  for (const tarefa of tarefas) {\n    if (tarefa.titulo === titulo) {\n      tarefa.concluida = true;\n      return;\n    }\n  }\n}\n\nlistarTarefas();\n// saida:\n// [ ] Estudar lacos\n// [ ] Fazer o exercicio de funcoes\n// [ ] Revisar arrays e objetos\n\nconcluirTarefa(\"Estudar lacos\");\nlistarTarefas();\n// saida:\n// [x] Estudar lacos\n// [ ] Fazer o exercicio de funcoes\n// [ ] Revisar arrays e objetos"
                    },
                    {
                        "type": "code",
                        "value": "function contarPendentes() {\n  let pendentes = 0;\n  for (const tarefa of tarefas) {\n    if (tarefa.concluida === false) {\n      pendentes = pendentes + 1;\n    }\n  }\n  return pendentes;\n}\n\nconsole.log(contarPendentes());\n// saida: 2"
                    },
                    {
                        "type": "text",
                        "value": "## Você chegou até aqui\n\nOlha o caminho que você percorreu nesta trilha: começou entendendo o que é um algoritmo (um passo a passo para resolver um problema), aprendeu a guardar informação em variáveis, a tomar decisões com condicionais, a repetir tarefas com laços, a organizar a lógica em funções e a guardar coleções de dados em arrays e objetos. Neste último módulo, você juntou tudo isso para atacar problemas de verdade, usar algoritmos simples sobre arrays, organizar dados e, principalmente, saber o que fazer quando o código não funciona de primeira.\n\nEsse raciocínio sustenta qualquer linguagem ou framework que você for aprender depois. A partir daqui, você já pensa e escreve como programador, mesmo que ainda esteja no começo.\n\nO próximo passo do roadmap de Back-end é a trilha **Protocolos da Web**: como o navegador conversa com um servidor, o que é uma requisição HTTP, o que são métodos como GET e POST, e como essas trocas de mensagens formam a base de toda aplicação que roda na internet. É a mesma lógica que você aprendeu aqui, agora aplicada à comunicação entre máquinas."
                    },
                    {
                        "type": "quote",
                        "value": "Você aprendeu a pensar em passos, guardar dados, tomar decisões, repetir tarefas, organizar código em funções e trabalhar com coleções. Isso é lógica de programação, a base de tudo que vem a seguir. A próxima parada é entender como a web conversa: Protocolos da Web."
                    }
                ],
                "questions": [
                    {
                        "statement": "No mini-projeto da lista de tarefas, cada tarefa é representada como:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um objeto com os campos titulo e concluida",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma string com o título da tarefa",
                                "isCorrect": false
                            },
                            {
                                "text": "Um array com duas posições",
                                "isCorrect": false
                            },
                            {
                                "text": "Um número que representa a posição da tarefa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se você chamar adicionarTarefa três vezes, cada vez passando um título diferente, quantos itens o array tarefas passa a ter?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "3",
                                "isCorrect": true
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende de quantas vezes listarTarefas() foi chamada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de adicionar 4 tarefas e concluir 1 delas com concluirTarefa, o que a função contarPendentes() deve retornar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "3",
                                "isCorrect": true
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            },
                            {
                                "text": "1",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A função concluirTarefa(titulo) percorre o array tarefas com um for...of. O que ela faz ao encontrar uma tarefa cujo titulo é igual ao parâmetro recebido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Muda o campo concluida da tarefa para true",
                                "isCorrect": true
                            },
                            {
                                "text": "Remove essa tarefa do array",
                                "isCorrect": false
                            },
                            {
                                "text": "Cria uma tarefa nova com esse mesmo título de novo",
                                "isCorrect": false
                            },
                            {
                                "text": "Imprime todas as tarefas no console",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se você chamar concluirTarefa(\"Tarefa que nao existe\") com um título que não está em nenhuma tarefa do array, o que acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O laço não acha correspondência, e termina sem alterar nada",
                                "isCorrect": true
                            },
                            {
                                "text": "O programa quebra com um erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tarefa nova é criada automaticamente com esse título",
                                "isCorrect": false
                            },
                            {
                                "text": "Todas as tarefas do array são marcadas como concluídas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: "iniciante", description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.");
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
    console.log("Seed concluido: " + MODULOS.length + " modulos, " + totalAulas + " aulas, " + totalQuestoes + " questoes.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
