// Seed da trilha UI/UX Design (iniciante). Idempotente e não destrutivo: se a
// trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-uiux.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "UI/UX Design";
const DESCRICAO =
    "Trilha de UI/UX Design para iniciantes: fundamentos de UX e UI, pesquisa com usuários, design de interação, fundamentos visuais e princípios de Gestalt, usabilidade e as heurísticas de Nielsen, acessibilidade (WCAG) e do wireframe ao design system.";

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
        "titulo": "Módulo 1 - Fundamentos de UX e UI",
        "aulas": [
            {
                "titulo": "O que é experiência do usuário (UX)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é experiência do usuário (UX)\n\nSeja bem-vindo ao seu primeiro passo no mundo do design de interfaces e produtos! Muita gente chega aqui vindo do lado técnico, do front-end, e descobre que existe todo um universo por trás de um app ser gostoso ou irritante de usar. Se você acha que isso é papo abstrato, relaxa: a gente começa do zero, com exemplos do dia a dia.\n\nPense em tudo o que você usa num dia comum: o despertador do celular, o app que pede o café, o transporte por aplicativo, o mensageiro que fala com os amigos. Alguns parecem ler a sua mente e fluem sem esforço. Outros fazem você ter vontade de jogar o telefone longe. Essa sensação — de fácil ou difícil, de agradável ou frustrante — é exatamente o território da **experiência do usuário**.\n\nUX vem do inglês _User Experience_, ou experiência do usuário. O termo foi popularizado por **Don Norman**, que ajudou a cunhá-lo justamente porque palavras como interface e usabilidade eram estreitas demais para descrever toda a relação entre a pessoa e o produto."
                    },
                    {
                        "type": "quote",
                        "value": "**UX** (_User Experience_, experiência do usuário) é a soma de tudo o que uma pessoa **sente e vivencia** ao usar um produto, sistema ou serviço — se foi fácil, rápido, claro e agradável, ou confuso e frustrante. A UX não se resume à tela: abrange **toda a jornada**, do primeiro contato ao que acontece depois do uso."
                    },
                    {
                        "type": "text",
                        "value": "## A experiência vai muito além da tela\n\nUm erro comum de quem começa é achar que UX é só a telinha do app. Não é. A experiência é a **jornada inteira**.\n\nImagine que você pede comida por um aplicativo de delivery. A experiência não começa e termina na tela. Ela inclui o anúncio que te levou até lá, a facilidade de achar um restaurante, entender quanto vai custar a entrega, acompanhar o pedido no mapa, a comida chegar quente — e o que acontece se algo der errado e você precisar do suporte. Se a tela é linda, mas a comida chega fria e o suporte te ignora, a experiência foi ruim, ponto.\n\nE isso vale para muito além de apps: o caixa eletrônico do banco, a fila do autoatendimento no aeroporto, o site que sugere o próximo episódio na hora certa. Onde existe uma pessoa tentando realizar algo, existe uma experiência a ser cuidada."
                    },
                    {
                        "type": "text",
                        "value": "## Uma experiência boa e uma experiência ruim\n\nA melhor forma de sentir o que é UX é comparar.\n\nExperiência **ruim**: você quer cancelar uma assinatura e o botão está escondido atrás de cinco menus; no fim, ainda pedem que você ligue para um telefone só em horário comercial. Você se sente enganado e preso. Ou aquele formulário longo que, ao apertar voltar, apaga tudo o que você digitou. Ou a mensagem de erro que diz apenas \"Erro 0x0007\", sem explicar o que fazer.\n\nExperiência **boa**: você cancela em dois toques, com uma confirmação clara — e, por confiar, acaba voltando depois. O formulário guarda o que você preencheu. E, no lugar do código estranho, aparece \"A senha precisa de ao menos 8 caracteres\".\n\nRepare numa coisa curiosa: a gente costuma **notar mais a experiência quando ela é ruim**. Quando tudo flui, mal percebemos o design — e é justamente aí que ele está fazendo bem o seu trabalho."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinais de experiência ruim\", \"Sinais de experiência boa\"], [\"Você se perde e não encontra o que procura\", \"Você acha o que precisa em poucos toques\"], [\"Mensagens de erro confusas, como um código estranho\", \"Mensagens claras que dizem o que fazer em seguida\"], [\"Você precisa de manual ou de ajuda para tarefas simples\", \"Você usa sozinho, quase sem pensar\"], [\"Você termina irritado ou inseguro\", \"Você conclui a tarefa com confiança\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** a **UX** é tudo o que a pessoa **sente e vivencia** ao usar um produto, ao longo de **toda a jornada** — não apenas a tela. Uma boa experiência resolve a necessidade com pouco esforço e deixa a pessoa confiante; uma ruim cria obstáculos e frustração. E lembre-se: o bom design costuma ser **invisível** — a gente só repara na experiência quando ela falha."
                    }
                ],
                "questions": [
                    {
                        "statement": "De forma geral, a que se refere a experiência do usuário (UX)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ao que a pessoa sente e vivencia ao longo de toda a jornada de uso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas às cores e fontes escolhidas para as telas do aplicativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente ao código que faz o aplicativo funcionar por trás dos panos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Unicamente ao preço cobrado pela pessoa que compra o produto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A experiência do usuário se resume à tela bonita de um aplicativo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Não, a UX abrange toda a jornada, do primeiro contato ao pós-uso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, uma tela bonita garante sozinha uma boa experiência.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, UX e aparência da tela são, na prática, a mesma coisa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, a UX se refere apenas ao logotipo oficial escolhido pela marca.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app de comida tem telas lindas e fáceis, mas o pedido sempre chega frio e atrasado, e o suporte nunca responde. O que esse caso mostra sobre a UX?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que a UX é a jornada inteira, pois entrega e suporte também contam.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que a UX está ótima, já que a beleza da tela é o que mais pesa nela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a UX depende só da tela, pois entrega é tarefa de outra equipe.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a comida fria não conta, pois só a interface define a experiência.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para cancelar uma assinatura, você precisa passar por cinco menus escondidos e ainda ligar para um telefone só em horário comercial. Como se classifica essa experiência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ruim, pois isso cria obstáculos e prende a pessoa numa tarefa simples.",
                                "isCorrect": true
                            },
                            {
                                "text": "Boa, pois mais etapas de confirmação tornam o processo mais seguro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Neutra, pois o número de etapas não muda em nada a experiência.",
                                "isCorrect": false
                            },
                            {
                                "text": "Boa, pois esconder a opção evita que a pessoa cancele por impulso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Diz-se que \"o bom design é invisível\". Uma pessoa usa o app do banco todos os dias, paga tudo em segundos e nunca reparou em nenhum detalhe da interface. O que isso provavelmente indica?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que a experiência é boa, pois um bom design costuma passar despercebido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que a experiência é ruim, pois um bom app precisa chamar atenção sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o design não teve trabalho nenhum, já que ninguém notou ele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a pessoa não sabe usar o app, por isso não repara nos detalhes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que é interface do usuário (UI)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é interface do usuário (UI)\n\nNa aula anterior, você viu que a UX é a experiência inteira — tudo o que a pessoa sente ao longo da jornada. Mas surge uma pergunta natural: **onde**, exatamente, essa experiência acontece? Por onde a pessoa toca, lê e conversa com o produto?\n\nA resposta é: pela **interface**. UI vem de _User Interface_, interface do usuário. É a **camada visível e interativa** do produto — tudo o que aparece na tela e com o que a pessoa interage: botões, textos, cores, ícones, imagens, campos para digitar, menus, espaçamentos.\n\nA própria palavra ajuda: _interface_ é a \"face entre\" duas coisas, o ponto de encontro. A UI é o ponto de encontro entre a pessoa e o sistema — a parte concreta que dá para ver e tocar."
                    },
                    {
                        "type": "quote",
                        "value": "**UI** (_User Interface_, interface do usuário) é a **camada visível e interativa** do produto — botões, cores, tipografia, ícones, campos e espaçamentos. É por meio dela que a pessoa \"conversa\" com o sistema: toca, lê, digita e recebe respostas."
                    },
                    {
                        "type": "text",
                        "value": "## Os elementos de uma interface\n\nToda interface é feita de peças. Dá para organizá-las em três grupos:\n\n- **Elementos visuais**: cores, tipografia (as fontes e seus tamanhos), ícones, imagens e o espaçamento entre as coisas. É o que a pessoa vê.\n- **Elementos interativos**: botões, links, campos de texto, caixas de seleção, menus, abas. É com o que a pessoa age sobre o sistema.\n- **Feedback**: mensagens, estados (um botão que mostra \"carregando\"), pequenas animações e confirmações. É como o sistema responde à ação.\n\nOlhe para uma tela de conversa do WhatsApp: o botão verde de enviar, o campo onde você digita, o tique duplo que confirma a entrega, a foto de cada contato. Cada um desses detalhes é uma **decisão de interface**."
                    },
                    {
                        "type": "text",
                        "value": "## A interface é uma conversa\n\nUm bom jeito de pensar na UI é como um **diálogo**. Você faz algo, e a interface responde. Toca num botão, ele muda de cor ou mostra que está processando. Preenche um campo errado, ele avisa na hora.\n\nUma boa interface também **guia**: deixa a ação principal óbvia, aproxima o que é parecido e usa símbolos familiares (uma lixeira para apagar, uma lupa para buscar). Veja a diferença:\n\n- **Ruim**: dois botões idênticos e cinzentos, \"Confirmar\" e \"Cancelar\", lado a lado. Qual é qual? A pessoa hesita e erra.\n- **Bom**: o \"Confirmar\" ganha destaque colorido e o \"Cancelar\" fica discreto. Sem ler com atenção, você já sabe onde clicar.\n\nA interface está o tempo todo, em silêncio, dizendo à pessoa o que ela pode fazer e o que está acontecendo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Categoria\", \"Exemplos\", \"Para que serve\"], [\"Elementos visuais\", \"Cores, tipografia, ícones, imagens, espaçamento\", \"Organizar e comunicar pela aparência\"], [\"Elementos interativos\", \"Botões, links, campos, menus, caixas de seleção\", \"Permitir que a pessoa aja sobre o sistema\"], [\"Feedback\", \"Mensagens, estados de carregamento, confirmações\", \"Mostrar, em resposta, o que está acontecendo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** a **UI** é a camada **visível e interativa** por onde a pessoa usa o produto — feita de elementos **visuais** (cores, tipografia, ícones), **interativos** (botões, campos, menus) e de **feedback** (mensagens, estados, confirmações). Pense nela como uma conversa: a boa interface guia, dá destaque ao que importa e sempre responde à ação da pessoa."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é a interface do usuário (UI)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A camada visível do produto: botões, cores, ícones e campos.",
                                "isCorrect": true
                            },
                            {
                                "text": "O sentimento geral da pessoa ao longo de toda a jornada de uso.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor remoto onde os dados do aplicativo ficam guardados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O conjunto de leis que regulam a proteção de dados do usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual dos itens abaixo é um elemento de interface (UI)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um botão de \"Enviar\" colorido, com um ícone ao lado do texto.",
                                "isCorrect": true
                            },
                            {
                                "text": "O tempo que o pedido leva para chegar até a casa da pessoa.",
                                "isCorrect": false
                            },
                            {
                                "text": "A política de reembolso descrita nas letras miúdas do contrato.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor que processa os pagamentos por trás da aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa tela de confirmação, dois botões iguais e cinzentos aparecem lado a lado: \"Confirmar\" e \"Cancelar\". As pessoas erram e clicam no errado. Que decisão de interface resolveria melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Destacar o botão principal e deixar o outro discreto, para a hierarquia ficar clara.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a fonte de toda a página, pois letras maiores sempre reduzem erros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar as palavras dos botões para inglês, pois termos técnicos confundem menos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover os dois botões, pois menos opções na tela sempre evitam erro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app usa um ícone de lixeira para a ação de apagar. Mesmo sem ler nada, quase todo mundo entende. Por que essa é uma boa decisão de UI?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque usa um símbolo já familiar, e isso comunica a ação sem precisar de explicação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque ícones deixam a tela mais colorida, e cor é o que mais importa para a pessoa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque quanto mais ícones diferentes, mais moderna a interface parece ser.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque esconder o significado da ação torna o aplicativo mais curioso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao tocar no botão \"Enviar\", nada muda na tela: o botão não reage, não aparece carregamento nem confirmação. Em dúvida, a pessoa toca várias vezes. Que aspecto da interface está faltando?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O feedback, pois a interface precisa responder à ação tomada.",
                                "isCorrect": true
                            },
                            {
                                "text": "A quantidade de cores, pois um botão com mais cores chama mais atenção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada, pois se o toque funcionou por trás, a reação visual é dispensável.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho da fonte da página, pois letras maiores evitam qualquer dúvida.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "UX e UI: a diferença e por que confundir atrapalha",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# UX e UI: a diferença e por que confundir atrapalha\n\nAs duas siglas costumam vir grudadas, como se fossem uma coisa só: \"UX/UI\". E é justamente por virem juntas que tanta gente as confunde. Agora que você já conhece cada uma, vamos separá-las com clareza — porque misturar as duas causa problemas bem reais.\n\nUm resumo rápido antes de continuar:\n\n- **UX** é a **experiência inteira**: a jornada e como a pessoa se sente. É fácil? É útil? É agradável?\n- **UI** é a **camada visível e interativa**: botões, cores, tipografia, as telas em si.\n\nO ponto-chave é este: a **UI faz parte da UX**. A interface é apenas um dos jeitos pelos quais a experiência chega até a pessoa — mas a UX é maior, engloba muito mais do que a tela."
                    },
                    {
                        "type": "quote",
                        "value": "A **UI faz parte da UX**, não é sinônimo dela. A **UX** cuida de toda a jornada e de como a pessoa se sente; a **UI** cuida da camada visível por onde essa jornada acontece. Toda boa interface serve a uma boa experiência — mas **nem toda tela bonita entrega uma boa experiência**."
                    },
                    {
                        "type": "text",
                        "value": "## Uma analogia para nunca mais confundir\n\nPense num **restaurante**.\n\nA **UX** é a experiência de jantar por completo: a facilidade de reservar uma mesa, a recepção, o tempo de espera, o sabor da comida, o banheiro limpo, a conta que chega certa — e, no fim, se você voltaria. A **UI** é o que você vê e toca diretamente: a apresentação do prato, o cardápio bem desenhado, a mesa posta, a decoração.\n\nAgora imagine um prato lindíssimo, digno de foto (UI ótima), que chega depois de duas horas e tem gosto ruim (UX péssima). O restaurante é ruim, por mais bonito que seja o prato. Vale o contrário também: uma comida deliciosa servida de qualquer jeito, num ambiente caótico, decepciona. Você precisa dos dois — mas são **trabalhos diferentes**.\n\nOutra imagem que ajuda: num carro, a UX é como ele dirige (conforto, segurança, confiabilidade); a UI é o painel, os botões e a tela central. Um painel lindo não salva um carro que quebra toda semana."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"UX boa (resolve, é fácil)\", \"UX ruim (frustra, atrapalha)\"], [\"UI boa (bonita)\", \"O ideal: bonito e eficiente\", \"Bonito por fora, frustrante por dentro\"], [\"UI ruim (feia, datada)\", \"Feia, mas cumpre o que promete\", \"O pior: feia e frustrante\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que confundir atrapalha\n\nTratar UX e UI como a mesma coisa não é só um errinho de vocabulário — leva a decisões erradas:\n\n- **No jeito de pensar**: se a equipe acha que design é só \"deixar bonito\" (UI), ela pula a etapa de entender a pessoa e o problema. Aí se investe numa tela linda para um produto que ninguém precisa.\n- **Na conversa do dia a dia**: um chefe pede \"melhora a UX\" quando só quer trocar a cor de um botão (isso é UI); ou pede \"deixa mais bonito\" quando o problema real é um fluxo confuso (isso é UX). Falar a língua certa evita gastar energia resolvendo o problema errado.\n- **Na expectativa**: uma vaga que pede \"UX/UI\" às vezes mistura habilidades bem diferentes, e quem contrata e quem se candidata acabam frustrados.\n\nSaber a diferença é o que permite **diagnosticar o problema certo** — e é sempre mais barato consertar o problema certo do que caprichar na solução errada."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** **UX e UI não são a mesma coisa** — a UI é uma parte da UX. A UX é a jornada inteira e o sentimento; a UI é a camada visível. Uma **UI bonita não conserta uma UX ruim**: não adianta enfeitar um fluxo que não funciona. Confundir os dois faz a equipe resolver o problema errado; saber diferenciar ajuda a mirar no problema certo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual afirmação descreve corretamente a relação entre UX e UI?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A UI faz parte da UX: é a camada visível por onde a jornada acontece.",
                                "isCorrect": true
                            },
                            {
                                "text": "UX e UI são exatamente a mesma coisa, apenas com nomes diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "A UX faz parte da UI: a experiência é só um detalhe dentro da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "UX e UI existem de forma separada, sem nenhuma relação entre si.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa equipe, quem cuida de toda a jornada e de como a pessoa se sente, e quem cuida da camada visível (botões, cores)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A UX cuida da jornada e do sentimento; a UI cuida da camada visível.",
                                "isCorrect": true
                            },
                            {
                                "text": "A UI cuida da jornada e do sentimento; a UX cuida só das cores e botões.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas cuidam somente das cores; a jornada não é papel de nenhuma.",
                                "isCorrect": false
                            },
                            {
                                "text": "A UX cuida do código do sistema, e a UI cuida do servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aplicativo é lindo, premiado pelo visual, mas as pessoas o abandonam porque o fluxo de compra é confuso e trava. A equipe decide deixar as telas ainda mais bonitas. Isso resolve o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, pois o problema é o fluxo, e enfeitar a tela não resolve isso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, pois uma interface mais bonita corrige qualquer problema de uso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, pois um visual premiado torna o fluxo de compra irrelevante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, pois a solução certa é deixar todas as telas sem nenhuma cor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seu chefe pede: \"melhora a UX desse botão trocando a cor dele para azul\". Tecnicamente, mudar apenas a cor de um botão é uma decisão de quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "De UI, pois a cor é só um detalhe visual, e não a experiência inteira.",
                                "isCorrect": true
                            },
                            {
                                "text": "De UX, pois qualquer troca na tela já muda a experiência inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "De infraestrutura, pois a cor de um botão é definida no servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "De conteúdo, pois escolher uma cor é o mesmo que escrever um texto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma ferramenta tem visual simples, quase feio, mas as pessoas a adoram porque resolve a tarefa em segundos, sem erro. Um concorrente é deslumbrante, mas lento e confuso. O que esse contraste ensina?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que uma UI bonita não compensa uma UX ruim, pois resolver bem pesa mais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que a aparência é o único fator que decide se um produto é bom de usar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que UX e UI são a mesma coisa, então tanto faz qual delas melhorar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que produtos feios são sempre melhores do que produtos bonitos e lentos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O valor do design e o papel do designer",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O valor do design e o papel do designer\n\nExiste um mito teimoso de que design é luxo, um \"enfeite\" que se coloca no fim para deixar as coisas bonitas. É o contrário: o design é o que faz um produto ser **usável** para a pessoa e, para quem o cria, **rentável**. Ele gera valor de dois lados ao mesmo tempo — para a **pessoa usuária** e para o **negócio**. E, como você vai ver, esses dois lados estão ligados.\n\nNesta aula a gente separa esses dois valores e depois vê o que, de fato, faz um designer no dia a dia (adianto: é bem mais do que escolher cores)."
                    },
                    {
                        "type": "text",
                        "value": "## O valor para a pessoa usuária\n\nDo lado de quem usa, um bom design entrega ganhos concretos:\n\n- **Menos esforço e menos frustração**: a pessoa resolve a tarefa rápido, sem precisar de manual.\n- **Confiança e autonomia**: ela entende o que está acontecendo e não tem medo de errar ou de \"quebrar\" alguma coisa.\n- **Inclusão**: um design claro e acessível permite que mais gente use — pessoas idosas, pessoas com deficiência, quem está numa conexão ruim ou numa tela pequena.\n- **Tempo e tranquilidade**: cada minuto que a pessoa não perde num formulário confuso é um ganho real na vida dela.\n\nPense numa senhora que consegue pagar uma conta sozinha, pelo app do banco, sem depender de ninguém. É o valor do design se materializando na vida de alguém."
                    },
                    {
                        "type": "text",
                        "value": "## O valor para o negócio\n\nDo lado de quem cria o produto, esse mesmo cuidado vira resultado — e, sem precisar inventar número nenhum, a lógica se sustenta sozinha:\n\n- **Retenção**: se usar é fácil e agradável, a pessoa volta e continua cliente.\n- **Conversão**: menos gente desiste no meio do cadastro ou do carrinho, então mais tarefas (e vendas) chegam ao fim.\n- **Menos custo de suporte**: uma interface clara gera menos gente ligando ou abrindo chamado para tirar dúvida.\n- **Marca e confiança**: uma boa experiência vira recomendação; uma ruim vira reclamação e cliente perdido para o concorrente — que está a um toque de distância.\n- **Menos retrabalho**: descobrir um problema ainda no rascunho ou no protótipo é muito mais barato do que depois de tudo construído.\n\nA moral é simples: bom design é **investimento**, não enfeite. Cada obstáculo que você tira do caminho é uma pessoa a mais que conclui a tarefa — e um cliente a mais que fica."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ganho para a pessoa usuária\", \"Ganho para o negócio\"], [\"Resolve a tarefa com menos esforço e frustração\", \"Menos abandono e mais tarefas concluídas (conversão)\"], [\"Entende o que faz e se sente confiante\", \"Volta a usar e continua cliente (retenção)\"], [\"Precisa de menos ajuda para se virar\", \"Menos chamados de suporte (menos custo)\"], [\"Recomenda o produto para outras pessoas\", \"Marca mais forte e propaganda espontânea\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O papel do designer\n\nSe design não é só \"deixar bonito\", o que faz um designer? Boa parte do trabalho acontece **antes** de qualquer tela existir:\n\n- **Entender pessoas**: pesquisar, conversar e observar para descobrir a necessidade e a dor de verdade.\n- **Definir o problema certo**: transformar um pedido vago (\"quero um app\") num problema claro de resolver.\n- **Idear e desenhar soluções**: esboçar fluxos, wireframes e protótipos — testar ideias no barato antes de gastar no caro.\n- **Testar e ajustar**: levar o protótipo a pessoas reais, observar onde elas tropeçam e corrigir.\n- **Colaborar**: trabalhar junto de produto, desenvolvimento, conteúdo e negócio. Design é atividade de time, não de gênio solitário.\n\nHá quem resuma o papel do designer como ser a **voz da pessoa usuária dentro da empresa** — alguém que defende quem vai usar o produto. E, muitas vezes, o melhor que um designer faz é decidir o que **não** construir, para manter a solução simples. Nada disso acontece de uma vez só: é um ciclo que se repete — e é exatamente sobre esse processo que fala a próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** o design gera valor dos **dois lados**: para a pessoa (menos esforço, mais confiança, autonomia e inclusão) e para o negócio (retenção, conversão, menos suporte, marca mais forte). Por isso é **investimento, não enfeite**. E o papel do designer vai muito além do visual: é entender pessoas, definir o problema certo, criar, testar e colaborar — sendo a **voz da pessoa usuária** dentro da empresa."
                    }
                ],
                "questions": [
                    {
                        "statement": "O papel do designer se resume a deixar as telas bonitas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Não, pois o designer também entende pessoas e define o problema certo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, pois design é apenas escolher cores e fontes bonitas para a tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, pois o designer trabalha sozinho e cuida só do visual final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, pois o papel do designer é escrever o código do produto inteiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual destes é um valor que um bom design gera para o NEGÓCIO?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Menos abandono nas tarefas e menos chamados abertos no suporte.",
                                "isCorrect": true
                            },
                            {
                                "text": "Mais telas no produto, para ele parecer maior e mais completo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um cadastro mais longo, para coletar o máximo de dados possível.",
                                "isCorrect": false
                            },
                            {
                                "text": "O maior número possível de cores diferentes em cada tela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Muitas pessoas desistem no meio do checkout de uma loja por causa de um formulário confuso. A equipe simplifica esse fluxo. Que resultado de negócio isso tende a melhorar mais diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A conversão, que aumenta quando há menos obstáculos na compra.",
                                "isCorrect": true
                            },
                            {
                                "text": "O tamanho do arquivo do aplicativo, que passa a ocupar menos espaço.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de cores da marca, que aumenta junto com as vendas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de telas do fluxo, que precisa sempre crescer também.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que um banco tornou seu app mais claro, uma senhora idosa passou a pagar as contas sozinha, sem pedir ajuda. Que tipo de valor isso representa para a pessoa usuária?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Autonomia, pois um design claro deixa a pessoa usar o produto sozinha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum valor real, pois isso não muda em nada o dia a dia da pessoa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Valor estético apenas, ligado somente às cores usadas no aplicativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Valor de marketing só, que serve apenas para a propaganda do banco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer pular direto para desenhar telas bonitas de um produto novo, sem conversar com quem vai usar. Do ponto de vista do papel do designer, qual é o risco maior?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Construir algo bonito para o problema errado, sem entender a pessoa antes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum risco, pois entender a pessoa é uma etapa dispensável no design.",
                                "isCorrect": false
                            },
                            {
                                "text": "O único risco real é escolher a fonte errada para os títulos da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco é gastar tempo demais desenhando telas antes de programar.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O processo de design: design thinking e o duplo diamante",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O processo de design: design thinking e o duplo diamante\n\nExiste a fantasia de que design é um **lampejo de genialidade**: o designer olha para o horizonte, tem uma ideia brilhante e pronto. Na vida real, quase nunca é assim. Bom design costuma vir de **método e repetição**, não de sorte.\n\nA boa notícia para quem começa é que esse método pode ser aprendido. Existem \"mapas\" do processo de design que organizam por onde caminhar. Nesta aula você vai conhecer os dois mais famosos: o **design thinking** e o **duplo diamante**. Eles não competem entre si — são lentes complementares que contam a mesma história de jeitos diferentes."
                    },
                    {
                        "type": "text",
                        "value": "## Design thinking: cinco etapas centradas na pessoa\n\nO **design thinking** é uma abordagem **centrada na pessoa**, muito difundida pela consultoria IDEO e pela escola de design d.school, de Stanford. Ele se organiza em cinco etapas:\n\n- **Empatizar**: entender a fundo a pessoa — observar, entrevistar, sentir a dor dela. Tudo começa nela, não na solução.\n- **Definir**: reunir o que se descobriu e recortar um **problema claro** (por exemplo: \"as pessoas não terminam o cadastro porque ele é longo demais\").\n- **Idear**: gerar **muitas ideias** sem julgar de imediato; aqui vale a quantidade, para depois escolher.\n- **Prototipar**: transformar ideias em algo tangível e **barato** — um rascunho, um protótipo — só para poder mostrar.\n- **Testar**: colocar o protótipo na frente de **pessoas reais**, observar e aprender com a reação delas.\n\nE atenção: isso **não é uma linha reta**. Um teste pode revelar que você entendeu a pessoa errado, e aí você volta a empatizar. Repetir e ajustar faz parte."
                    },
                    {
                        "type": "text",
                        "value": "## O duplo diamante: abrir e fechar, duas vezes\n\nO **duplo diamante** (_Double Diamond_) foi criado pelo **British Design Council**, o conselho de design britânico. O nome vem do desenho: dois losangos em sequência, formando quatro fases:\n\n- **Descobrir** (_Discover_): **abrir** — explorar o problema com amplitude, pesquisar, sem pressa de resolver.\n- **Definir** (_Define_): **fechar** — focar e sintetizar tudo num problema claro e específico.\n- **Desenvolver** (_Develop_): **abrir** de novo — explorar muitas soluções possíveis, prototipar, experimentar.\n- **Entregar** (_Deliver_): **fechar** — refinar, testar e lançar a solução que de fato funciona.\n\nA forma ensina o ritmo: **divergir** (abrir, explorar amplamente) e depois **convergir** (fechar, focar) — e isso acontece **duas vezes**. O primeiro diamante pergunta \"estamos resolvendo o **problema certo**?\"; o segundo pergunta \"estamos resolvendo esse problema **do jeito certo**?\"."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fase do duplo diamante\", \"O que se busca\", \"Etapa(s) parecida(s) no design thinking\"], [\"Descobrir\", \"Explorar o problema amplamente\", \"Empatizar\"], [\"Definir\", \"Focar num problema claro\", \"Definir\"], [\"Desenvolver\", \"Explorar e criar soluções\", \"Idear e prototipar\"], [\"Entregar\", \"Refinar, testar e lançar\", \"Testar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como os dois se conversam\n\nRepare, na tabela acima, que os dois mapas contam a mesma história. Nenhum é \"o certo\" contra \"o errado\":\n\n- O **design thinking** dá o passo a passo centrado na pessoa (as cinco etapas).\n- O **duplo diamante** dá o **ritmo** de abrir e fechar e reforça algo precioso: separar o \"problema certo\" da \"solução certa\".\n\nOs dois compartilham a mesma lição, e é a mais importante que você leva desta aula: **não corra direto para a solução**. Primeiro entenda e defina bem o problema. Como se costuma dizer, **apaixone-se pelo problema, não pela primeira solução** que aparecer.\n\nE, assim como o design thinking, o duplo diamante não é uma linha reta: é um ciclo. Testou, aprendeu, muitas vezes você volta atrás e recomeça — e o produto melhora a cada volta."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** design é **processo**, não lampejo. O **design thinking** tem cinco etapas centradas na pessoa — **empatizar, definir, idear, prototipar e testar**. O **duplo diamante** tem quatro fases — **descobrir, definir, desenvolver e entregar** — no ritmo de **divergir e convergir**, duas vezes: uma para o problema, outra para a solução. Os dois ensinam a mesma coisa: **entenda o problema antes de correr para a solução** — e itere."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais são as cinco etapas do design thinking, na ordem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Empatizar, definir, idear, prototipar e testar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Programar, testar, publicar, vender e manter.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descobrir, definir, desenvolver e entregar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Planejar, orçar, contratar, executar e cobrar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quais são as quatro fases do duplo diamante?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Descobrir, definir, desenvolver e entregar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Empatizar, definir, idear e testar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Abrir, fechar, abrir e desistir.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pesquisar, programar, lançar e faturar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de propor qualquer solução, a equipe passa dias observando e entrevistando as pessoas para entender suas dores. A que etapa do design thinking isso corresponde?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Empatizar, a etapa de entender a pessoa antes de propor soluções.",
                                "isCorrect": true
                            },
                            {
                                "text": "Prototipar, a etapa de montar uma versão testável da ideia escolhida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Testar, a etapa de mostrar um protótipo já pronto para as pessoas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Idear, a etapa de gerar o maior número possível de ideias distintas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No duplo diamante, o primeiro diamante trata do problema e o segundo, da solução. O que a forma de \"abrir e fechar\" de cada diamante representa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Divergir: abrir e explorar. Depois convergir: fechar e decidir.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar e depois diminuir o orçamento do projeto por duas vezes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Abrir e depois fechar a empresa a cada nova fase do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever o código todo e depois apagá-lo, de forma repetida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Empolgada com uma ideia, uma equipe começa a construir a solução no primeiro dia, sem investigar o problema nem as pessoas. Que princípio comum ao design thinking e ao duplo diamante ela está ignorando?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que é preciso entender e definir o problema antes de correr para a solução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que a solução deve ser construída antes mesmo de existir qualquer problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a etapa de testar deve sempre vir antes da etapa de empatizar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que design é um lampejo de genialidade que dispensa qualquer processo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Conhecendo o usuário",
        "aulas": [
            {
                "titulo": "Por que pesquisar antes de projetar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que pesquisar antes de projetar\n\nVocê chegou ao **Módulo 2**, e aqui a nossa pergunta muda de figura. No módulo anterior, olhamos para o que é design e como uma boa interface se comporta. Agora vamos virar a cadeira e olhar para a pessoa do outro lado da tela: **o usuário**. Porque não adianta dominar cores, botões e telas se você estiver resolvendo o problema errado, para a pessoa errada.\n\nSe você vem do lado técnico, essa é uma virada de chave importante. No código, quando algo não funciona, o computador reclama na hora: dá erro, quebra, avisa. Já uma tela pode estar **tecnicamente perfeita** e, ainda assim, ser um fracasso, porque ninguém entende, ninguém quer ou ninguém consegue usar. E a tela, ao contrário do compilador, **não reclama**. Quem reclama é o usuário, e quase sempre quando já é tarde.\n\n## Projetar no achismo custa caro\n\nO erro mais comum de quem começa é projetar para si mesmo: \"eu acho que ficaria melhor assim\", \"eu usaria dessa forma\". O problema é que **você não é o seu usuário**. Você conhece o sistema por dentro, sabe onde cada coisa fica, entende os termos técnicos. O usuário não sabe nada disso: ele chega com a cabeça dele, os hábitos dele e a pressa dele.\n\nPesquisar antes de projetar é o que separa o **chute** da **decisão informada**. Um time pode passar meses construindo uma funcionalidade porque *achou* que as pessoas queriam, e descobrir no lançamento que ninguém liga para ela. Um punhado de conversas com usuários de verdade, lá no começo, teria evitado o desperdício. Pesquisa não é luxo nem enrolação: é o que **reduz o risco** de construir a coisa errada."
                    },
                    {
                        "type": "quote",
                        "value": "**Você não é o seu usuário.** A pessoa que vai usar o seu produto tem outra bagagem, outros hábitos e outros objetivos, e quase nunca pensa como quem construiu o sistema. Pesquisar é o jeito de trocar o \"eu acho\" pelo \"eu observei\"."
                    },
                    {
                        "type": "text",
                        "value": "## Os métodos que revelam o usuário\n\nPesquisar com usuário não exige um laboratório caro. Existem métodos simples e acessíveis, e três deles formam a base de quase tudo:\n\n- **Entrevistas**: uma conversa, em geral de um para um, com perguntas abertas. Serve para entender **motivações, contexto e frustrações**, ou seja, o *porquê* por trás do comportamento. Em vez de \"você gostou da tela?\", pergunte \"me conta a última vez que você tentou fazer isso\". A pessoa te leva para a história real.\n- **Observação**: em vez de perguntar, você **assiste** a pessoa usando o produto (ou fazendo a tarefa no mundo real). É poderosa porque revela a diferença entre o que as pessoas **dizem** que fazem e o que **de fato** fazem, e essa diferença costuma ser grande. Alguém pode jurar que confere o extrato todo dia e, na prática, nunca abrir aquela tela.\n- **Questionários**: um formulário com perguntas que você envia para **muita gente** ao mesmo tempo. É ótimo para alcançar volume e medir tendências (\"quantos preferem X?\"), mas ruim para aprofundar: um formulário não faz uma pergunta de acompanhamento quando a resposta fica interessante.\n\nCada método responde a um tipo de pergunta. Entrevista e observação **aprofundam**; questionário **alcança escala**. Bons times combinam os três, sem tratar nenhum como bala de prata."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método\",\"Como funciona\",\"Melhor para descobrir\"],[\"Entrevista\",\"Conversa individual com perguntas abertas\",\"Motivações, contexto e o porquê das escolhas\"],[\"Observação\",\"Assistir a pessoa usando ou fazendo a tarefa\",\"O que ela faz de verdade, não só o que diz\"],[\"Questionário\",\"Formulário enviado para muitas pessoas\",\"Tendências e proporções em grande escala\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Qualitativo x quantitativo: o porquê e o quanto\n\nToda pesquisa cai em uma de duas famílias, e entender a diferença evita muita confusão.\n\nA pesquisa **qualitativa** busca **profundidade**. Ela trabalha com poucas pessoas, mas escuta cada uma com atenção, atrás de motivos, sentimentos e histórias. Responde a perguntas como \"*por que* as pessoas abandonam o cadastro?\". Entrevistas e observação são qualitativos. Você não sai com um gráfico bonito, mas com **entendimento**.\n\nA pesquisa **quantitativa** busca **quantidade**. Ela trabalha com muita gente e vira número: percentuais, médias, contagens. Responde a perguntas como \"*quanta* gente abandona o cadastro na etapa de pagamento?\". Questionários com perguntas fechadas e dados de uso são quantitativos. Você sai com uma medida, mas não com o motivo.\n\nRepare que uma responde ao **porquê** e a outra ao **quanto**, e as duas se completam. O número te diz *onde* dói (por exemplo, que a maior parte das desistências se concentra numa etapa específica); a conversa te diz *por que* dói (o formulário pede o CPF antes de a pessoa confiar no site). Sozinho, o número aponta o problema mas não a solução; sozinha, a conversa explica um caso mas não diz se ele é comum."
                    },
                    {
                        "type": "quote",
                        "value": "**Resumo da aula:** pesquisar antes de projetar troca o achismo por evidência e reduz o risco de construir a coisa errada. Os métodos-base são **entrevista** (o porquê), **observação** (o que a pessoa faz de verdade) e **questionário** (escala). A pesquisa **qualitativa** busca profundidade e responde ao *porquê*; a **quantitativa** busca volume e responde ao *quanto*. Juntas, contam a história completa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que o alerta \"você não é o seu usuário\" é tão importante em UX?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque quem constrói o sistema já sabe termos e caminhos que o usuário não conhece.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o designer perde a licença para usar o próprio produto assim que ele fica pronto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o usuário, por ser leigo, enxerga mais de design do que quem construiu o produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a opinião de quem usa o produto não deveria pesar nas decisões do projeto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pesquisa qualitativa, como uma entrevista, é mais indicada para responder a qual tipo de pergunta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Por que as pessoas agem de determinada forma.",
                                "isCorrect": true
                            },
                            {
                                "text": "Qual o percentual de usuários que prefere o botão azul.",
                                "isCorrect": false
                            },
                            {
                                "text": "Qual a média de idade entre mil usuários cadastrados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantas pessoas acessaram o site no domingo passado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time desconfia de que aquilo que os usuários dizem em conversa não bate com o que eles realmente fazem no app. Qual método é o mais adequado para tirar essa dúvida?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Observação: acompanhar a pessoa usando o app no dia a dia.",
                                "isCorrect": true
                            },
                            {
                                "text": "Questionário extenso, formado só por perguntas fechadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Entrevista por telefone, com perguntas sobre opinião.",
                                "isCorrect": false
                            },
                            {
                                "text": "Contagem simples de quantos downloads o app recebeu.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa saber, com rapidez e em grande escala, qual das três funcionalidades a maioria dos usuários usa mais. Qual método responde melhor a essa pergunta de \"quantos\"?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Questionário enviado a muitos usuários, com perguntas fechadas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Poucas entrevistas longas, feitas com calma e profundidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Observação de uma única pessoa ao longo de um dia inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma conversa bem aberta e demorada com um único usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Os dados de uso mostram que a maior parte das pessoas abandona o cadastro numa etapa específica, mas ninguém sabe o motivo. Qual é a melhor forma de agir?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Combinar os dois: o número aponta o problema, e a entrevista explica o porquê.",
                                "isCorrect": true
                            },
                            {
                                "text": "Confiar só no número, que já basta sozinho para definir a solução certa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar o dado por completo e redesenhar o cadastro no achismo do time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar mais um questionário fechado, que vai revelar o motivo do abandono.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Personas: um retrato de quem você atende",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Personas: um retrato de quem você atende\n\nNa aula anterior, você saiu a campo e juntou um monte de informação sobre as pessoas: conversas, observações, respostas. Só que dados soltos são difíceis de carregar no dia a dia. Toda vez que fosse decidir algo de design, você teria de reler tudo. É aí que entra a **persona**.\n\nUma **persona** é um personagem **fictício, mas baseado em pesquisa**, que representa um grupo de usuários com necessidades e comportamentos parecidos. Ela ganha nome, rosto e uma pequena história, para que o time consiga perguntar \"espera, isso aqui funciona para a **Marina**?\" em vez de discutir sobre um \"usuário\" abstrato e sem cara.\n\n## Para que serve, de verdade\n\nProjetar para \"todo mundo\" é o mesmo que projetar para ninguém: quando você tenta agradar a todos, acaba diluindo tudo. A persona **dá foco**. Ela funciona como um filtro nas reuniões: cada ideia passa pelo crivo de \"a Marina precisa disso? ela entenderia esse termo?\". E cria **linguagem comum** no time, porque designer, desenvolvedor e negócio passam a falar da mesma pessoa, em vez de cada um imaginar um usuário diferente na própria cabeça."
                    },
                    {
                        "type": "text",
                        "value": "## O que uma boa persona carrega\n\nUm erro clássico é encher a persona de dados de documento: idade exata, cidade, estado civil, renda. Isso quase nunca muda uma decisão de tela. O que **realmente** importa numa persona são os itens ligados ao uso do produto:\n\n- **Objetivos**: o que essa pessoa quer alcançar? (Ex.: pagar as contas sem sair de casa e sem errar valores.)\n- **Frustrações e dores**: o que hoje atrapalha? (Ex.: tem medo de digitar o valor errado e pagar a mais.)\n- **Comportamentos e hábitos**: como ela age? (Ex.: confere tudo duas vezes e desconfia de telas confusas.)\n- **Contexto**: onde e como ela usa? (Ex.: no celular, no fim do dia, muitas vezes com pressa.)\n- **Familiaridade com tecnologia**, que ajuda a calibrar a linguagem e a quantidade de ajuda na tela.\n\nO nome e a foto existem só para dar **memória** e empatia ao personagem. O peso da persona está nos **objetivos, comportamentos e frustrações**: é isso que muda o que você desenha."
                    },
                    {
                        "type": "text",
                        "value": "## Um exemplo que muda decisões\n\nVamos dar vida a uma persona de um app de banco.\n\n**Marina, 34 anos.** Autônoma, cuida das finanças da casa. Usa o banco quase sempre pelo **celular, à noite, com pressa**. Objetivo: pagar contas e conferir o saldo em poucos toques. Frustração: já pagou um boleto com o valor errado uma vez e, desde então, **tem medo de errar**. Não se considera boa com tecnologia e desconfia de telas cheias de opções.\n\nRepare como a Marina, sozinha, já **sugere decisões de design**. Como ela tem medo de errar valores, uma boa tela de pagamento mostra um **resumo claro para conferência antes de confirmar**. Como usa com pressa e no celular, os botões principais precisam ser **grandes e óbvios**. Como desconfia de excesso de opções, a tela inicial deve destacar o essencial e guardar o resto. Sem a persona, essas escolhas seriam chute; com ela, viram consequência."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Persona útil (foco no comportamento)\",\"Estereótipo raso (foco no clichê)\"],[\"Descreve o medo de errar valores e o hábito de conferir duas vezes\",\"Resume a pessoa a idade, gênero e um gosto genérico\"],[\"Nasce de entrevistas e observação\",\"Nasce de suposição e senso comum\"],[\"Ajuda a decidir o que vai na tela\",\"Serve só de enfeite na apresentação\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O perigo de virar estereótipo\n\nA persona é uma ferramenta poderosa, mas tem um lado escorregadio: quando ela **deixa de vir da pesquisa** e passa a vir da nossa imaginação, vira um **estereótipo**, um clichê que reforça preconceitos e ainda por cima aponta para o lado errado. Alguns cuidados:\n\n- **Baseie na pesquisa, não no achismo.** Se você inventou a persona sozinho na sua mesa, apenas transformou os seus palpites num personagem bonitinho. O viés continua lá, agora disfarçado.\n- **Foque no comportamento, não em rótulos.** Suposições ligadas a gênero, idade ou renda raramente ajudam e muitas vezes ofendem. \"Precisa resolver rápido porque usa no intervalo do trabalho\" ajuda; \"gosta de tal coisa porque é de tal idade\" atrapalha.\n- **Não crie personas demais.** Duas a quatro costumam dar conta. Uma para cada usuário vira uma pilha que ninguém consulta.\n- **Persona não é decoração.** Se ela mora num slide bonito e nunca decide nada, não é persona, é enfeite.\n\nQuando ainda não deu tempo de pesquisar, times às vezes montam uma **proto-persona**: um rascunho baseado no que se *acredita* saber, marcado claramente como **hipótese a validar**. É um ponto de partida honesto, desde que ninguém esqueça de, mais tarde, confrontá-la com usuários reais."
                    },
                    {
                        "type": "quote",
                        "value": "**Resumo da aula:** uma **persona** é um personagem fictício, porém baseado em pesquisa, que representa um grupo de usuários e **dá foco** às decisões (\"isso funciona para a Marina?\"). O que importa nela são **objetivos, comportamentos, frustrações e contexto**, não os dados de documento. O maior risco é ela virar **estereótipo**: um clichê inventado no achismo. Persona boa nasce da pesquisa e é usada para decidir, não para enfeitar."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma persona em UX?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Personagem fictício, criado a partir de pesquisa com usuários reais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma pessoa real, contratada para testar o aplicativo todos os dias.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome técnico usado internamente para o usuário mais importante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um gráfico que mostra a quantidade de acessos por faixa etária.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa persona, qual tipo de informação costuma ser mais útil para tomar decisões de design?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Objetivos e frustrações da pessoa ao usar o produto.",
                                "isCorrect": true
                            },
                            {
                                "text": "A cidade onde nasceu e o seu estado civil atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "A cor favorita dela e o time de futebol que torce.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número exato do documento de identidade dela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time apresenta uma persona assim: \"Homem, 40 anos, casado, gosta de tecnologia\". Por que essa persona provavelmente vai ajudar pouco?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque junta só rótulos, sem os objetivos que guiam o design.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque nenhuma persona pode ter mais de trinta anos de idade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque falta informar a renda mensal exata dessa pessoa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque persona nenhuma deveria trazer idade ou gênero.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A persona Marina \"tem medo de errar valores e confere tudo duas vezes\". Qual decisão de design conversa diretamente com essa característica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mostrar um resumo claro do pagamento antes de pedir a confirmação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Esconder o valor total do pagamento para deixar a tela mais limpa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar mais opções e atalhos na mesma tela de pagamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Confirmar o pagamento de forma automática para economizar tempo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sem tempo para pesquisar, um time monta uma persona só com o que imagina sobre os usuários e já a trata como verdade absoluta no projeto. Qual é o risco principal?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A persona vira um estereótipo de achismo, carregando os vieses do time.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum risco: toda persona já é fictícia, então tanto faz a origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "O único risco real é a foto escolhida não agradar todo o time.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco é ter personas de menos; o ideal é uma para cada usuário.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Mapas de jornada: a experiência ao longo do tempo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Mapas de jornada: a experiência ao longo do tempo\n\nAté agora você conheceu **quem** é o usuário (persona) e **por que** ele age (pesquisa). Falta uma peça: entender a experiência **ao longo do tempo**. Raramente alguém resolve tudo numa tela só. A pessoa passa por **várias etapas**, e a experiência é a soma de todas elas, não de um momento isolado.\n\nUm **mapa de jornada** (ou *journey map*) é uma visão, do começo ao fim, de tudo por que uma pessoa passa para atingir um objetivo. Ele pega uma **persona** e um **cenário** (por exemplo, \"a Marina quer pagar um boleto pela primeira vez no app\") e destrincha, passo a passo, o que ela **faz, pensa e sente** em cada momento. É como transformar a experiência num filme, quadro a quadro, em vez de olhar só uma foto.\n\n## Por que mapear a jornada\n\nProblemas de experiência costumam morar **nas transições**, nos vãos entre uma etapa e outra, justamente onde ninguém olha quando pensa em \"uma tela por vez\". O mapa de jornada acende a luz nesses vãos: revela onde a pessoa trava, se frustra, desiste ou fica na dúvida. E, de quebra, coloca o time **no lugar do usuário**, olhando a experiência inteira com os olhos dele, e não com os olhos de quem construiu cada pedaço separado."
                    },
                    {
                        "type": "text",
                        "value": "## As partes de um mapa de jornada\n\nOs mapas variam de formato, mas quase todos têm os mesmos ingredientes, lidos como colunas ao longo do tempo:\n\n- **Etapas (ou fases)**: os grandes momentos da jornada, em ordem. Ex.: *descobrir, cadastrar, usar pela primeira vez, usar no dia a dia*.\n- **Ações**: o que a pessoa faz em cada etapa (\"procura o boleto\", \"digita o código\").\n- **Pensamentos**: o que passa pela cabeça dela (\"será que digitei certo?\").\n- **Emoções**: como ela se sente em cada ponto, e é aqui que mora o ouro. Costuma virar uma **curva de emoção**, subindo nos bons momentos e despencando nos ruins.\n- **Pontos de contato** (*touchpoints*): por onde ela interage, seja o app, um e-mail, o atendimento ou uma loja física.\n- **Dores e oportunidades**: onde algo trava (a dor) e o que dá para fazer a respeito (a oportunidade).\n\nNão existe um modelo único e obrigatório. O importante é que o mapa conte a **história** da pessoa naquele objetivo, com os altos e baixos honestos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\",\"O que a Marina faz\",\"Como ela se sente\",\"Oportunidade\"],[\"Descobrir\",\"Vê que dá para pagar boleto pelo app\",\"Curiosa, mas insegura\",\"Explicar em uma frase que é simples e seguro\"],[\"Encontrar\",\"Procura onde fica a opção de pagar\",\"Perdida, demora a achar\",\"Deixar Pagar visível já na tela inicial\"],[\"Digitar\",\"Insere o código do boleto\",\"Tensa, com medo de errar\",\"Validar o código e mostrar o beneficiário\"],[\"Confirmar\",\"Revê o valor e confirma\",\"Aliviada ao ver o resumo\",\"Destacar valor e data antes de confirmar\"],[\"Concluir\",\"Recebe o comprovante\",\"Satisfeita e confiante\",\"Oferecer salvar ou compartilhar o comprovante\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A curva de emoção conta a história\n\nSe você olhar só as ações, tudo parece igual: \"a pessoa clica, digita, confirma\". A **emoção** é o que revela onde a experiência de fato ganha ou perde a pessoa. Por isso o mapa costuma desenhar uma linha que sobe e desce ao longo das etapas.\n\nOs **vales** dessa curva, os pontos mais baixos, são os **pontos de dor** (*pain points*): os momentos em que a pessoa se sente perdida, insegura ou frustrada. No nosso exemplo, o vale está na etapa **Encontrar**: a Marina demora a achar onde pagar e quase desiste ali. Um mapa honesto não esconde esses vales; ele os aponta com o dedo, porque **é exatamente onde vale a pena agir**.\n\nCompare duas leituras da mesma jornada. A leitura ruim olha só o fim: \"ela pagou, então deu certo\". A leitura boa olha a curva inteira: \"ela pagou, **mas** quase desistiu na hora de achar a opção e passou aperto na hora de digitar\". A segunda leitura te entrega **onde mexer**; a primeira te deixa cego."
                    },
                    {
                        "type": "text",
                        "value": "## De dores a oportunidades\n\nCada ponto de dor é, na verdade, uma **oportunidade de design** esperando para ser aproveitada. O pulo do gato é traduzir a dor numa ação concreta. Um jeito simples de fazer isso, ponto a ponto:\n\n- **Localize o vale.** Em que etapa a emoção despenca? (Na hora de encontrar a opção de pagar.)\n- **Nomeie a dor.** O que exatamente incomoda? (A pessoa não acha onde pagar e se sente perdida.)\n- **Vire a dor do avesso.** O que resolveria? (Colocar a opção de pagar boleto em destaque na tela inicial.)\n- **Priorize.** Vales mais fundos e etapas mais comuns vêm primeiro.\n\nRepare que o mapa não conserta nada sozinho: ele **aponta onde** olhar e por quê. A decisão de como resolver continua sendo sua. Mas é muito mais fácil resolver um problema quando você sabe **exatamente em que momento** da jornada ele acontece e como a pessoa se sente ali."
                    },
                    {
                        "type": "quote",
                        "value": "**Resumo da aula:** um **mapa de jornada** mostra a experiência de uma persona, do começo ao fim, num cenário: o que ela **faz, pensa e sente** em cada **etapa**. A **curva de emoção** revela os **pontos de dor** (os vales), que são onde a experiência perde a pessoa. Cada dor vira uma **oportunidade** de design. O mapa não resolve, mas aponta com precisão **onde** e **por que** agir."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que um mapa de jornada representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A experiência do usuário, do início ao fim, até um objetivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas o layout visual de uma única tela do aplicativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista de tecnologias empregadas na construção do produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O organograma completo da equipe que desenvolve o produto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num mapa de jornada, o que são os pontos de dor (pain points)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Momentos em que o usuário fica perdido ou inseguro.",
                                "isCorrect": true
                            },
                            {
                                "text": "As telas do aplicativo consideradas mais bonitas.",
                                "isCorrect": false
                            },
                            {
                                "text": "As etapas em que o usuário se sente mais feliz.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os erros de código encontrados durante os testes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao montar um mapa de jornada, o time percebe que a curva de emoção despenca na etapa de encontrar onde pagar. O que essa queda indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um ponto de dor, ou seja, uma chance clara de melhorar ali.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que essa etapa já está perfeita e não precisa de atenção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que aquela etapa inteira deve ser removida da jornada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a curva de emoção não tem nenhuma relação com o design.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas pessoas leem a mesma jornada. Uma diz \"ela pagou no fim, então está tudo certo\". A outra aponta que \"ela quase desistiu ao procurar a opção\". Por que a segunda leitura é mais útil para o design?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque olha a jornada inteira e mostra onde a pessoa sofreu.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque em UX só o resultado final é o que realmente importa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque emoções no meio do caminho não interessam ao design.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a primeira leitura inventa um problema que não existe.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você identificou no mapa que, na etapa de digitar o boleto, a persona sente tensão por medo de errar o valor. Seguindo a lógica de transformar dor em oportunidade, qual é a resposta mais coerente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Validar o código e mostrar um resumo, evitando erro de valor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cortar a etapa de digitação para encurtar a jornada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter a tela como está, já que no fim ela consegue pagar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Incluir mais campos para preencher, tirando o foco do medo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Arquitetura da informação: organizar para achar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Arquitetura da informação: organizar para achar\n\nImagine entrar num supermercado onde os produtos estão jogados sem ordem: macarrão ao lado do sabão, leite perto das pilhas. Tudo está lá, mas você não acha nada. Agora imagine o mesmo supermercado com corredores nomeados, categorias claras e placas. O acervo é idêntico; o que muda é a **organização**. Essa é a ideia por trás da **arquitetura da informação**.\n\n**Arquitetura da informação** (AI) é a prática de **organizar, estruturar e nomear** o conteúdo de um produto para que as pessoas encontrem o que precisam e entendam onde estão. Ela é invisível quando bem feita e insuportável quando mal feita: é a diferença entre um site em que você acha tudo no primeiro palpite e um em que se perde em três cliques.\n\n## O objetivo final: findability\n\nA palavra-chave da AI é **findability**: a facilidade de **encontrar**. Não adianta o conteúdo existir se ninguém acha. Um sinal clássico de AI ruim é o usuário **desistir do menu e apelar para a busca**, ou pior, ir ao buscador externo e digitar \"tal empresa como cancelar plano\" no Google porque no próprio site não achou. Quando a navegação falha, a busca vira muleta. Uma boa AI faz o caminho ser tão natural que a pessoa nem percebe que existiu um caminho."
                    },
                    {
                        "type": "text",
                        "value": "## Agrupar e nomear: fale a língua do usuário\n\nOrganizar conteúdo envolve duas decisões que andam juntas: **como agrupar** (o que fica junto de quê) e **como nomear** (que rótulo cada grupo recebe). E aqui mora a maior armadilha: batizar as coisas com a **linguagem interna da empresa**, e não com a do usuário.\n\nCompare rótulos de menu:\n\n- **Ruim**: \"Soluções\", \"Módulos\", \"Central de Recursos\". Bonito no jargão da empresa, vago para quem chega de fora.\n- **Bom**: \"Preços\", \"Como funciona\", \"Ajuda\". A pessoa bate o olho e já sabe o que vai encontrar.\n\nHá um princípio de UX por trás disso, a **Lei de Jakob**: as pessoas passam a maior parte do tempo em **outros** sites, então esperam que o seu funcione como os que elas já conhecem. Inventar nomes e estruturas \"criativos\" quebra essa expectativa e obriga o usuário a reaprender tudo. Nomear bem é, na maioria das vezes, nomear **do jeito esperado**, claro e convencional, e não original."
                    },
                    {
                        "type": "text",
                        "value": "## Hierarquia: do geral ao específico\n\nConteúdo bem organizado tem **hierarquia**: vai do mais geral para o mais específico, como uma árvore que se abre em galhos. Categorias grandes no topo, subcategorias dentro delas, itens nas pontas. Isso deixa a pessoa **navegar por eliminação**: \"quero algo da minha conta, então vou em Minha Conta e, dentro dela, em Segurança\".\n\nUma ferramenta que deixa essa hierarquia visível é o **mapa do site** (*sitemap*): um desenho da estrutura inteira, mostrando o que contém o quê. Ele não é uma tela; é a **planta baixa** do produto, feita antes de desenhar as telas. Veja a estrutura de um app simples, escrita como uma árvore em que o recuo indica o que está dentro de quê:"
                    },
                    {
                        "type": "code",
                        "value": "Início\n├── Minha Conta\n│   ├── Dados pessoais\n│   ├── Segurança\n│   └── Notificações\n├── Pagamentos\n│   ├── Pagar boleto\n│   ├── Transferir\n│   └── Histórico\n└── Ajuda\n    ├── Perguntas frequentes\n    └── Falar com atendente"
                    },
                    {
                        "type": "text",
                        "value": "## Card sorting: deixe o usuário agrupar\n\nMas como saber qual agrupamento faz sentido **para o usuário**, e não só para você? Uma técnica simples e barata responde a isso: o **card sorting** (organização de cartões). Você escreve cada item de conteúdo num cartão e pede para a pessoa **agrupar os cartões do jeito que faz sentido para ela**. O resultado revela o modelo mental dela: quais coisas ela espera encontrar juntas.\n\nHá duas variações principais:\n\n- **Aberto**: a pessoa cria os grupos e **dá o nome** de cada um. Ótimo no começo, quando você ainda não sabe nem as categorias nem os rótulos.\n- **Fechado**: você já oferece as categorias prontas e a pessoa só **encaixa** os cartões nelas. Ótimo para **testar** uma estrutura que você já tem em mente.\n\nUm passo a passo enxuto: liste os conteúdos, escreva um por cartão, peça para algumas pessoas agruparem e observe os **padrões**, os itens que quase todo mundo junta e os rótulos que se repetem. Esses padrões viram a sua hierarquia, agora baseada no que os usuários esperam, e não no organograma da empresa."
                    },
                    {
                        "type": "quote",
                        "value": "**Resumo da aula:** a **arquitetura da informação** organiza, estrutura e **nomeia** o conteúdo para garantir **findability**, a facilidade de encontrar. Agrupe de forma lógica e **nomeie na língua do usuário** (Lei de Jakob: as pessoas esperam o padrão que já conhecem de outros sites). Dê **hierarquia** do geral ao específico, visível no **mapa do site**. E use **card sorting** (aberto para descobrir, fechado para testar) para basear a estrutura no modelo mental de quem usa."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é findability em arquitetura da informação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A facilidade de encontrar o que se procura no produto.",
                                "isCorrect": true
                            },
                            {
                                "text": "A velocidade de carregamento das páginas do site.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de cores usadas em todo o layout.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número total de telas existentes no aplicativo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é card sorting?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Técnica em que usuários agrupam o conteúdo como acham melhor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um jogo de cartas comum, usado para descontrair a equipe.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um método usado para escolher a paleta de cores do produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma forma de medir a velocidade de resposta do servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O menu de um site usa rótulos como \"Soluções\" e \"Central de Recursos\", e os usuários vivem recorrendo ao Google para achar informações que existem no próprio site. Que problema de AI isso indica, e o que ajudaria?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O jargão interno prejudica a busca; nomes claros como Preços ajudariam.",
                                "isCorrect": true
                            },
                            {
                                "text": "O site tem telas bonitas demais; o ideal seria deixá-las mais simples.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é só de cor; trocar o azul do menu já resolveria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe problema algum: recorrer ao Google já é o esperado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time ainda não sabe como agrupar nem nomear as seções de um novo app e quer descobrir o modelo mental dos usuários. Qual técnica é a mais indicada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Card sorting aberto: os usuários criam e nomeiam os grupos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Card sorting fechado, com categorias já definidas pelo time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um teste de contraste entre as cores da interface toda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma entrevista sobre a idade e a renda de cada usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao redesenhar a navegação, um time cria nomes originais e criativos para as seções, bem diferentes dos que outros apps do mesmo tipo usam. Pela Lei de Jakob, qual é o risco?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Elas esperam padrões conhecidos, e nomes diferentes atrapalham.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: quanto mais original a navegação, melhor ela fica.",
                                "isCorrect": false
                            },
                            {
                                "text": "O único risco é o texto ocupar um pouco mais de espaço.",
                                "isCorrect": false
                            },
                            {
                                "text": "A Lei de Jakob determina no máximo sete itens por menu.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Fluxos de usuário: o caminho até o objetivo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Fluxos de usuário: o caminho até o objetivo\n\nNa aula passada, você organizou **o conteúdo**: o que existe e onde mora. Agora vamos olhar o **movimento**, o caminho que a pessoa percorre, tela a tela, para realizar uma tarefa. Se a arquitetura da informação é a **planta da casa**, o **fluxo de usuário** é o **trajeto** que alguém faz da porta até a cozinha.\n\nUm **fluxo de usuário** (*user flow*) é a sequência de **telas, ações e decisões** por que uma pessoa passa para atingir um objetivo específico: fazer login, finalizar uma compra, cadastrar-se. Ele é desenhado **antes** de caprichar nas telas, ainda no rascunho, para responder a uma pergunta barata e valiosa: *o caminho faz sentido do início ao fim, sem becos sem saída?*\n\n## Por que desenhar o fluxo antes\n\nÉ muito mais barato descobrir um problema de caminho **num diagrama** do que depois de construir dez telas. Ao mapear o fluxo, você enxerga de cima: **passos que sobram**, telas que faltam e os temidos **becos sem saída**, aqueles pontos em que a pessoa erra algo e o app não oferece um jeito de voltar ou de seguir. Ver o fluxo inteiro num rascunho revela esses buracos enquanto consertá-los ainda custa um traço de caneta."
                    },
                    {
                        "type": "text",
                        "value": "## Os blocos de um fluxo\n\nUm fluxo se desenha com pouquíssimos elementos, o que o torna fácil de rabiscar no papel:\n\n- **Ponto de partida**: onde a jornada começa (\"abrir o app\", \"tocar em Comprar\").\n- **Passos e telas** (costuma-se desenhar como **retângulos**): as ações e telas pelas quais a pessoa passa (\"preencher e-mail e senha\").\n- **Decisões** (costuma-se desenhar como **losangos**): pontos em que o caminho **se divide** conforme uma condição, quase sempre um sim ou não (\"os dados estão corretos?\").\n- **Fim ou objetivo**: o ponto de chegada, onde a tarefa foi concluída (\"chegar à tela inicial já logado\").\n\nO segredo está nas **decisões**. Todo losango tem pelo menos duas saídas, e a saída do \"não\" é onde os projetos mais pecam: o que acontece quando o e-mail está errado? Se o fluxo não responde a isso, você acabou de achar um beco sem saída **no papel**, antes que ele virasse um problema de verdade."
                    },
                    {
                        "type": "code",
                        "value": "Abrir o app\n   -> Tela de login (e-mail + senha)\n      -> [Dados corretos?]\n           -> Sim  -> Tela inicial (logado)   [FIM]\n           -> Nao  -> Mensagem \"Verifique e-mail e senha\"\n                        -> voltar para a Tela de login"
                    },
                    {
                        "type": "text",
                        "value": "## Desenhando um fluxo, passo a passo\n\nVamos montar um fluxo do zero, do jeito que se faz na prática:\n\n- **1. Defina o objetivo.** Qual tarefa a pessoa quer concluir? Um fluxo, um objetivo. (Ex.: finalizar a compra.)\n- **2. Liste os passos na ordem.** Do ponto de partida até o objetivo, sem pular etapas (ver carrinho, escolher entrega, pagar, confirmar).\n- **3. Marque as decisões.** Onde o caminho se divide? (Já tem cadastro? O cupom é válido?)\n- **4. Trate cada saída, inclusive a do erro.** O que acontece no \"não\"? Sempre ofereça um caminho de volta ou de correção.\n- **5. Procure gordura.** Tem passo que dá para juntar ou eliminar? Tela que nem precisava existir?\n\nCompare dois finais para o mesmo fluxo. No **ruim**, a pessoa erra o cartão e cai numa tela de erro **sem botão nenhum**: beco sem saída, precisa fechar o app e recomeçar. No **bom**, a mesma tela de erro explica o que houve e traz um \"Tentar de novo\" que volta para o pagamento. Mesma situação, experiências opostas, e a diferença apareceu no diagrama, não no lançamento."
                    },
                    {
                        "type": "text",
                        "value": "## Menos passos, menos desistência\n\nCada passo a mais num fluxo é mais uma chance de a pessoa cansar e desistir, principalmente em tarefas como compra e cadastro. Por isso, um bom fluxo **corta o supérfluo**. O exemplo clássico é a compra: obrigar a pessoa a **criar uma conta** antes de comprar espanta muita gente; oferecer uma **compra como visitante** encurta o caminho e deixa o cadastro para depois, se ela quiser.\n\nHá uma lei de UX que sustenta essa ideia, a **Lei de Hick**: quanto **mais opções** você coloca diante da pessoa de uma vez, **mais tempo** ela leva para decidir, e maior a chance de travar. Aplicada aos fluxos, ela recomenda **uma decisão de cada vez**, com poucas escolhas por passo, em vez de uma tela entulhada de opções logo de cara. Simplificar o caminho não é preguiça; é respeito pelo tempo e pela paciência de quem usa."
                    },
                    {
                        "type": "quote",
                        "value": "**Resumo da aula:** um **fluxo de usuário** mapeia as **telas, ações e decisões** até um objetivo, desenhado **antes** das telas para revelar passos que sobram, telas que faltam e **becos sem saída**, inclusive tratando a saída do erro. Menos passos significam menos desistência (**Lei de Hick**: mais opções, decisão mais lenta). Com isso fechamos o **Módulo 2**: você já sabe **pesquisar**, dar rosto ao usuário com **personas**, enxergar a experiência com **mapas de jornada** e estruturar o produto com **arquitetura da informação** e **fluxos**. No próximo módulo, essas descobertas viram desenho de telas."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um fluxo de usuário (user flow)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A sequência de telas e decisões até atingir um objetivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A paleta de cores escolhida para todo o aplicativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista completa de usuários cadastrados no sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo total que uma página leva para carregar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num diagrama de fluxo, o que costuma representar um ponto de decisão (em geral desenhado como um losango)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O momento em que o caminho se divide, num sim ou não.",
                                "isCorrect": true
                            },
                            {
                                "text": "O título principal exibido logo no topo da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "A cor de fundo escolhida para o aplicativo inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do usuário que está logado no momento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao desenhar o fluxo de login, o time trata a resposta \"sim\" (dados corretos), mas esquece de definir o que acontece no \"não\". Que problema isso cria?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um beco sem saída: quem errar os dados fica sem caminho de volta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum, já que o erro é raro e pode ser deixado de lado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O fluxo fica mais enxuto, com menos setas para desenhar.",
                                "isCorrect": false
                            },
                            {
                                "text": "É só um problema estético, que não afeta a experiência real.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma loja online exige que a pessoa crie uma conta completa antes de comprar, e muita gente desiste nessa etapa. Qual mudança de fluxo tende a reduzir a desistência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Oferecer a compra como visitante, com cadastro opcional depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Incluir mais campos no cadastro para conhecer melhor o cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pedir também uma confirmação por telefone antes da compra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar apenas o tamanho da fonte usada no botão de cadastro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tela inicial de um app despeja dezenas de opções de uma vez, e os usuários demoram a decidir o que fazer. Qual lei de UX explica o problema, e o que ela sugere para o fluxo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A Lei de Hick: mais opções atrasam a decisão; o ideal é poucas por vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "A Lei de Fitts: por isso, bastaria afastar mais os botões entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "A Lei de Jakob: bastaria, então, trocar as cores da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma lei se aplica: a quantidade de opções não muda nada.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Design de interação",
        "aulas": [
            {
                "titulo": "Affordances e signifiers: o que dá pra fazer e a pista disso",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Affordances e signifiers: o que dá pra fazer e a pista disso\n\nSeja bem-vindo ao **Módulo 3**! Até aqui você olhou para a interface de fora: como ela é organizada, como ela se parece. Agora a gente entra no que faz a interface **funcionar de verdade** na mão do usuário: o **design de interação**. É a parte que responde à pergunta mais básica de quem usa qualquer produto: \"o que eu posso fazer aqui, e como eu faço?\".\n\nE tudo começa com duas ideias que vêm de **Don Norman**, um dos nomes mais importantes do design de produto. São palavras que parecem difíceis, mas os conceitos são simples e você convive com eles o dia inteiro: **affordance** e **signifier**. Vamos por partes."
                    },
                    {
                        "type": "text",
                        "value": "## Affordance: o que uma coisa permite fazer\n\nUma **affordance** é a relação entre um objeto e a **ação que ele permite**. Em português a gente às vezes traduz como \"o que a coisa oferece\" ou \"convida a fazer\".\n\nPense em objetos do mundo real:\n\n- Uma **cadeira** permite sentar.\n- Uma **maçaneta** permite girar ou puxar.\n- Uma **tesoura** permite cortar (e os furos permitem encaixar os dedos).\n\nRepare que a affordance não é uma propriedade só do objeto nem só da pessoa: é a **relação** entre os dois. Uma cadeira \"oferece sentar\" para um adulto; para um rato, ela oferece outra coisa (subir, se esconder embaixo).\n\nNo digital é igual. Um **link** permite navegar. Um **campo de texto** permite digitar. Um **botão** permite acionar algo. A affordance é a **ação possível** — ela existe mesmo que ninguém a enxergue."
                    },
                    {
                        "type": "text",
                        "value": "## Signifier: a pista que anuncia a ação\n\nE aí chegamos no problema: de que adianta uma ação ser possível se o usuário **não percebe** que ela existe? É aqui que entra o **signifier** (às vezes traduzido como \"sinalizador\").\n\nUm **signifier** é a **pista perceptível** que comunica ao usuário **onde** e **como** agir. É o sinal visível (ou sonoro, ou tátil) que diz \"aja aqui\".\n\n- Numa porta, uma **placa \"puxe\"** ou uma **maçaneta** é o signifier: ela anuncia a affordance de abrir.\n- Numa interface, a **aparência de botão** (uma caixa com cor de destaque, cantos arredondados, talvez uma leve sombra) é o signifier que grita \"me clique\".\n- O **cursorzinho piscando** dentro de um campo é o signifier de \"pode digitar aqui\".\n\nGuarde a diferença: a **affordance** é a ação que existe; o **signifier** é o **sinal** que revela essa ação. Bom design não depende do usuário adivinhar — ele **sinaliza**."
                    },
                    {
                        "type": "quote",
                        "value": "**Affordance** é o que o objeto **permite fazer**. **Signifier** é o **sinal visível** que anuncia isso e diz onde agir. A ação pode existir, mas se não houver um signifier, para o usuário é como se ela não existisse."
                    },
                    {
                        "type": "text",
                        "value": "## Quando o sinal mente ou some\n\nDois problemas clássicos aparecem quando affordance e signifier se descolam.\n\n**Falso signifier** — a pista promete uma ação que não existe. O caso mais comum: um texto **azul e sublinhado** no meio de um artigo que **não é um link**. A aparência grita \"clique\", o usuário clica, e nada acontece. O sinal mentiu.\n\n**Affordance escondida** — a ação existe, mas nada a anuncia. Imagine um botão \"Enviar\" estilizado como **texto simples e cinza**, sem borda, sem cor de destaque, sem nada que pareça clicável. A função está lá, mas ninguém percebe. A affordance existe; faltou o signifier.\n\nCompare os dois lados:\n\n- **Ruim:** a palavra \"Continuar\" jogada no rodapé, mesma cor do texto comum. O usuário lê e segue em frente sem saber que ali havia um botão.\n- **Bom:** um botão \"Continuar\" com fundo colorido, contraste forte e cantos arredondados. Antes de ler qualquer palavra, você já sabe: \"aquilo ali eu clico\".\n\nA regra de ouro: **faça a coisa clicável parecer clicável**, e não faça parecer clicável o que não é."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Elemento na tela\",\"Affordance (o que permite)\",\"Signifier (a pista visível)\"],[\"Botão\",\"Acionar uma ação\",\"Caixa com cor de destaque, cantos arredondados, sombra leve\"],[\"Link\",\"Navegar para outro lugar\",\"Texto sublinhado e/ou em cor diferente\"],[\"Campo de texto\",\"Digitar informação\",\"Borda, área retangular e cursor piscando\"],[\"Interruptor (toggle)\",\"Ligar ou desligar\",\"Alavanca que desliza de um lado para o outro\"],[\"Ícone de lixeira\",\"Excluir\",\"Desenho reconhecível de uma lixeira\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma affordance?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A relação entre um objeto e a ação que ele permite fazer.",
                                "isCorrect": true
                            },
                            {
                                "text": "A cor de destaque que um botão recebe.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo que a interface leva para responder a um clique.",
                                "isCorrect": false
                            },
                            {
                                "text": "O texto explicativo que aparece abaixo de um campo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é um signifier?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A pista perceptível que sinaliza ao usuário onde e como agir.",
                                "isCorrect": true
                            },
                            {
                                "text": "A ação que um objeto permite, mesmo que ninguém a perceba.",
                                "isCorrect": false
                            },
                            {
                                "text": "A resposta que o sistema dá depois de uma ação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome interno que o programador dá a um botão no código.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num artigo, uma palavra aparece azul e sublinhada, então os leitores vivem tentando clicar nela. Só que ela não é um link e nada acontece. Que problema é esse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falso signifier: o texto parece link e promete um clique que não existe.",
                                "isCorrect": true
                            },
                            {
                                "text": "Falta de feedback: a ação existe, mas o sistema nunca responde.",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de mapeamento: o clique aciona um efeito diferente do esperado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Excesso de opções: tantos links deixam a escolha mais lenta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O botão de \"Enviar\" de um formulário foi estilizado como um texto cinza comum, sem borda, cor de destaque ou sombra. A função existe, mas quase ninguém percebe que dá para clicar ali. O que foi negligenciado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O signifier: faltou o sinal visual de que aquilo é clicável.",
                                "isCorrect": true
                            },
                            {
                                "text": "A affordance: a possibilidade de enviar foi removida do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "O feedback: o sistema não confirma o envio depois do clique.",
                                "isCorrect": false
                            },
                            {
                                "text": "A consistência: o botão está diferente das outras telas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa tela sensível ao toque (touchscreen), diz-se que quase tudo que orienta o usuário é signifier, e não affordance. Qual explicação justifica melhor essa afirmação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque a superfície é plana; os signifiers, não a affordance, guiam o toque.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque telas de toque não têm affordances, apenas botões físicos as possuem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o toque só funciona se houver feedback sonoro em cada ponto da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque em telas de toque affordance e signifier significam exatamente a mesma coisa.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Feedback: o sistema respondendo a cada ação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Feedback: o sistema respondendo a cada ação\n\nNa aula anterior você viu que um bom signifier convida o usuário a agir. Mas o que acontece **depois** que ele age? Ele clicou no botão, deslizou o interruptor, enviou o formulário... e aí?\n\nSe a interface fica **muda**, o usuário fica no escuro: \"será que funcionou? será que travou? clico de novo?\". A cura para essa angústia tem um nome: **feedback**. É, provavelmente, o conceito mais importante deste módulo, porque sem ele nenhuma interação se completa."
                    },
                    {
                        "type": "text",
                        "value": "## O que é feedback\n\n**Feedback** é a **resposta do sistema a cada ação do usuário**. Toda vez que a pessoa faz algo, o produto precisa devolver um sinal dizendo duas coisas:\n\n1. **\"Recebi\"** — sua ação foi registrada.\n2. **\"E aconteceu isto\"** — qual foi o resultado.\n\nO feedback pode chegar por vários canais:\n\n- **Visual:** um botão que muda de cor ao ser pressionado, uma mensagem \"Salvo com sucesso\", um item que aparece na lista.\n- **Sonoro:** o \"tec\" ao tirar uma foto, o som de mensagem enviada.\n- **Tátil:** a vibração do celular ao confirmar um pagamento por aproximação.\n\nNão à toa, a **primeira** das 10 heurísticas de Nielsen é a **visibilidade do estado do sistema**: manter o usuário informado sobre o que está acontecendo, com uma resposta em tempo adequado. Feedback é exatamente isso na prática."
                    },
                    {
                        "type": "text",
                        "value": "## O que acontece quando não há feedback\n\nA melhor forma de valorizar o feedback é ver o estrago quando ele **falta**.\n\nImagine uma loja online. Você preenche os dados, clica em **\"Pagar\"** e... a tela não muda. Nada. Nem uma mensagem, nem um \"carregando\", nada. O que passa pela sua cabeça?\n\n- \"Será que travou?\"\n- \"Será que não registrou meu clique?\"\n- \"Melhor clicar de novo.\"\n\nE aí mora o perigo real: você clica outra vez — e acaba **pagando duas vezes**. A ausência de feedback não é só desconforto; ela gera **erro**, retrabalho e desconfiança. O usuário abandona o carrinho achando que o site é quebrado, quando na verdade o pedido até funcionou — só ninguém avisou."
                    },
                    {
                        "type": "quote",
                        "value": "Toda ação merece uma reação. Se o usuário faz algo e a interface fica muda, ele conclui uma de duas coisas: ou não funcionou, ou está quebrado. Nas duas ele tenta de novo — e é aí que os problemas começam."
                    },
                    {
                        "type": "text",
                        "value": "## Como é um bom feedback\n\nUm bom feedback tem três qualidades: é **imediato**, **claro** e **proporcional**.\n\n**Imediato** — a resposta vem logo, não depois de o usuário ficar em dúvida. Se a ação é rápida, mostre o resultado na hora. Se demora (enviar arquivo, processar pagamento), mostre um **indicador de progresso** ou um estado de **\"carregando\"** para o usuário saber que a máquina está trabalhando.\n\n**Claro** — a mensagem diz o que aconteceu em linguagem humana: \"Mensagem enviada\", \"Não foi possível salvar, verifique sua conexão\". Nada de códigos crípticos.\n\n**Proporcional** — o tamanho do aviso combina com o tamanho do evento. Confirmar uma curtida é uma mudança sutil (o coração fica vermelho). Apagar a conta para sempre pede um aviso grande e uma confirmação. Usar um alarme vermelho gigante para cada ação boba **cansa** o usuário e faz ele ignorar até os avisos importantes.\n\nExemplos que você já conhece: no **WhatsApp**, o tiquinho que vira dois e depois fica azul conta toda a história (enviado, entregue, lido) sem uma palavra. Ao **curtir** um post, o ícone muda na hora. São feedbacks pequenos, imediatos e certeiros."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ação do usuário\",\"Sem feedback (ruim)\",\"Com feedback (bom)\"],[\"Clicar em \\\"Salvar\\\"\",\"A tela não muda; o usuário não sabe se salvou\",\"Um aviso \\\"Salvo com sucesso\\\" aparece por alguns segundos\"],[\"Enviar um formulário longo\",\"Tela parada por vários segundos\",\"O botão vira \\\"Enviando...\\\" e mostra progresso\"],[\"Digitar uma senha fraca\",\"O cadastro só falha lá no fim\",\"Um aviso na hora: \\\"Senha muito curta\\\"\"],[\"Adicionar item ao carrinho\",\"Nada acontece visivelmente\",\"O contador do carrinho sobe e um aviso confirma\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é feedback em uma interface?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A resposta que o sistema dá a cada ação do usuário.",
                                "isCorrect": true
                            },
                            {
                                "text": "A pista visual que sinaliza que um elemento é clicável.",
                                "isCorrect": false
                            },
                            {
                                "text": "A opinião que o usuário escreve sobre o produto numa pesquisa.",
                                "isCorrect": false
                            },
                            {
                                "text": "A relação entre um controle e o efeito que ele produz.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das 10 heurísticas de Nielsen está mais diretamente ligada ao feedback?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Visibilidade do estado do sistema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Estética e design minimalista.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reconhecimento em vez de memorização.",
                                "isCorrect": false
                            },
                            {
                                "text": "Prevenção de erros.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário clica em \"Pagar\", mas a tela não muda nem exibe qualquer aviso. Achando que não funcionou, ele clica de novo e acaba pagando duas vezes. Qual foi a falha principal?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ausência de feedback depois do clique em Pagar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Mapeamento ruim entre o botão e o seu efeito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta de affordance no botão de pagar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Contraste insuficiente entre o texto e o fundo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma ação de processar um pagamento leva cerca de 8 segundos para concluir. Qual é o melhor feedback nesse intervalo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mostrar um indicador de \"carregando\" ou de progresso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não mostrar nada, para não poluir a tela durante o processamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tocar um alarme sonoro alto para chamar a atenção do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Congelar a tela sem nenhum aviso até o fim do processo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app dispara um alerta vermelho grande, no estilo de mensagem de erro, toda vez que o usuário simplesmente curte um post com sucesso. Qual característica do bom feedback foi desrespeitada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A proporcionalidade: a curtida, um evento trivial, recebeu alarme de erro.",
                                "isCorrect": true
                            },
                            {
                                "text": "A imediatez: o feedback demorou demais para aparecer depois da curtida.",
                                "isCorrect": false
                            },
                            {
                                "text": "A clareza: a mensagem usava termos técnicos que o usuário não entende.",
                                "isCorrect": false
                            },
                            {
                                "text": "A consistência: o alerta aparecia em uma cor diferente a cada vez.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Estados de interface: muito além do caminho feliz",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Estados de interface: muito além do caminho feliz\n\nQuando a gente imagina uma tela, tende a desenhar só a versão \"tudo certo\": a lista cheia de itens, o botão paradinho esperando o clique. Mas uma interface de verdade **não vive num estado só**. Um mesmo botão tem várias caras: parado, com o mouse em cima, sendo pressionado, desabilitado. E uma mesma tela pode estar cheia, vazia, carregando ou dando erro.\n\nDesenhar só o \"caminho feliz\" é um dos erros mais comuns de quem começa. Nesta aula você vai conhecer os **estados** que toda interface precisa prever — porque é justamente neles que a experiência costuma quebrar."
                    },
                    {
                        "type": "text",
                        "value": "## Os estados de um elemento interativo\n\nUm elemento clicável (um botão, um link) costuma ter estes estados:\n\n- **Default (padrão):** o estado de repouso, como ele aparece parado na tela.\n- **Hover (foco do mouse):** quando o cursor passa por cima. Uma leve mudança de cor confirma \"você está sobre algo clicável\". É um signifier em movimento.\n- **Foco (foco de teclado):** quando o elemento está selecionado pela navegação por teclado (tecla Tab). Costuma aparecer um contorno em volta. **Esse estado é vital para acessibilidade:** quem não usa mouse (por deficiência motora ou visual, ou por preferência) precisa enxergar **onde está** na tela. Sumir com o contorno de foco quebra a navegação por teclado.\n- **Ativo/pressionado:** o instante do clique ou toque, quando o botão parece \"afundar\".\n- **Desabilitado:** quando a ação não está disponível agora (o botão fica apagado e não responde).\n\nRepare que o **hover** vale para mouse, mas em telas de toque ele quase não existe — mais um motivo para o **foco** e os outros estados serem bem cuidados."
                    },
                    {
                        "type": "code",
                        "value": "/* O mesmo botão, quatro estados diferentes */\n.botao { background: #2563eb; }          /* default */\n.botao:hover { background: #1d4ed8; }     /* mouse em cima */\n.botao:focus { outline: 3px solid #93c5fd; } /* foco de teclado */\n.botao:disabled { background: #cbd5e1; }  /* indisponível */"
                    },
                    {
                        "type": "text",
                        "value": "## Os estados de uma tela inteira\n\nAlém dos elementos, a **tela como um todo** passa por estados que muita gente esquece de desenhar:\n\n- **Carregando (loading):** os dados ainda estão vindo. Em vez de uma tela em branco, mostre um **spinner** (a rodinha girando) ou um **skeleton** (aqueles blocos cinza no formato do conteúdo que vai chegar). Isso é feedback: \"estou trabalhando, aguarde\".\n- **Vazio (empty state):** quando ainda não há nada para mostrar — primeiro uso do app, uma busca sem resultados, uma caixa de entrada zerada.\n- **Erro:** algo deu errado (sem internet, servidor fora, dado inválido). Precisa dizer **o que** houve e, de preferência, **como resolver** (\"Sem conexão. Toque para tentar de novo\").\n- **Sucesso:** a ação deu certo e a interface confirma (\"Pedido realizado!\").\n\nOu seja: uma única \"tela de lista\" pode precisar de **quatro ou cinco desenhos** diferentes. Prever esses estados é o que separa um protótipo bonitinho de um produto que aguenta o mundo real."
                    },
                    {
                        "type": "text",
                        "value": "## O empty state: a tela vazia que ensina\n\nO **empty state** merece um parágrafo só dele, porque é uma oportunidade que quase todo iniciante desperdiça. A tela vazia não é um defeito a esconder — é a **primeira conversa** do produto com o usuário.\n\n- **Ruim:** o app de tarefas abre pela primeira vez e mostra uma área **totalmente em branco**, ou um seco \"0 itens\". O usuário pensa \"e agora?\" e pode até achar que quebrou.\n- **Bom:** a mesma tela mostra uma ilustração simpática, uma frase como **\"Você ainda não tem tarefas. Que tal criar a primeira?\"** e um botão bem visível **\"+ Nova tarefa\"**. A tela vazia deixou de ser um beco sem saída e virou um **convite para começar**.\n\nO mesmo vale para uma busca sem resultados: em vez de só \"Nada encontrado\", ofereça um caminho — \"Nenhum resultado para 'xyz'. Verifique a ortografia ou tente outro termo\". Todo estado vazio é uma chance de **orientar** em vez de abandonar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estado da tela\",\"Quando aparece\",\"O que a interface deve fazer\"],[\"Carregando\",\"Os dados ainda estão chegando\",\"Mostrar spinner ou skeleton para sinalizar espera\"],[\"Vazio\",\"Primeiro uso ou nenhum resultado\",\"Explicar e oferecer uma ação clara para começar\"],[\"Erro\",\"Falha de conexão, servidor ou dado inválido\",\"Dizer o que houve e como tentar resolver\"],[\"Sucesso\",\"A ação foi concluída\",\"Confirmar de forma clara e proporcional\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções abaixo é um estado de um botão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Hover, o estado do cursor sobre o botão.",
                                "isCorrect": true
                            },
                            {
                                "text": "O contraste entre o texto e o fundo do botão.",
                                "isCorrect": false
                            },
                            {
                                "text": "A margem que separa o botão dos outros elementos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A família tipográfica usada no rótulo do botão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o estado de foco (foco de teclado) em um elemento interativo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Indicar qual elemento está selecionado no teclado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixar o elemento mais bonito quando a página carrega.",
                                "isCorrect": false
                            },
                            {
                                "text": "Impedir que o usuário clique no elemento por engano.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazer o elemento sumir da tela quando não está em uso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário abre pela primeira vez um app de finanças. Ainda não há nenhuma transação cadastrada. Em vez de uma tela em branco, o que um bom empty state deve fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Explicar que não há dados ainda e oferecer um botão para começar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Exibir apenas o número \"0\" no centro da tela, sem mais nada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mostrar uma mensagem de erro, já que não há conteúdo para exibir.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixar a tela completamente em branco até o usuário descobrir sozinho o que fazer.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao enviar um formulário, a tela fica parada por cerca de 6 segundos sem exibir absolutamente nada, e o usuário conclui que o app travou. Qual estado ficou faltando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O estado de carregando, que avisa o processamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "O estado de hover, que muda a cor ao passar o mouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "O estado vazio, para quando não há dados a mostrar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O estado de foco, para a navegação por teclado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor estilizou apenas o estado default de um campo de formulário. Resultado: ao navegar por teclado, o usuário não enxerga em qual campo está, e ao digitar um dado inválido, nada indica o problema. Quais estados foram esquecidos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O estado de foco (teclado) e o de erro (dado inválido).",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas o estado de hover, que muda a cor ao passar o mouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os estados default e ativo, que já estavam contemplados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os estados de carregando e de sucesso.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Mapeamento e consistência",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Mapeamento e consistência\n\nVocê já sabe sinalizar a ação (signifier) e responder a ela (feedback). Faltam dois princípios que fazem a interação parecer **natural**, quase óbvia — a ponto de o usuário nem pensar. São eles o **mapeamento** e a **consistência**. Quando estão bem feitos, ninguém repara. Quando faltam, todo mundo se irrita sem saber explicar por quê."
                    },
                    {
                        "type": "text",
                        "value": "## Mapeamento: controles que apontam para o seu efeito\n\n**Mapeamento** é a relação entre um **controle** e o **efeito** que ele produz. Um bom mapeamento é **natural**: a forma, a posição ou a direção do controle já sugerem o que ele vai fazer.\n\nO exemplo clássico, também de Don Norman, é o **fogão**. Se os quatro botões estão em fila e as quatro bocas estão em quadrado, você **nunca** lembra qual botão liga qual boca — tem que testar ou ler etiqueta. Agora, se cada botão fica posicionado como a boca que ele controla, o mapeamento é natural: você olha e **sabe**.\n\nNo dia a dia isso está em todo lugar:\n\n- Seta **para cima** aumenta; **para baixo** diminui.\n- O controle de **volume** que sobe quando você arrasta para cima.\n- O botão de **brilho** representado por um sol maior/menor.\n\nQuando o mapeamento é ruim, o usuário fica **adivinhando** — e adivinhar cansa."
                    },
                    {
                        "type": "text",
                        "value": "## Mapeamento natural no digital\n\nNas telas, o mapeamento aparece na correspondência entre a **direção do gesto** e a **direção do efeito**.\n\n- **Bom:** num carrossel de fotos, a seta da **direita** avança e a da **esquerda** volta. A direção do controle bate com a direção do movimento. Deslizar o dedo para a esquerda \"empurra\" o conteúdo para a esquerda.\n- **Ruim:** um controle de volume na **horizontal** em que arrastar para a **direita diminui** o som. Vai contra tudo o que a pessoa espera; ela erra toda vez.\n\nA lição: sempre que existir uma noção de \"mais/menos\", \"antes/depois\" ou \"cima/baixo\", faça o controle **apontar na mesma direção** do efeito. O usuário não deveria precisar de um manual para descobrir para que lado a coisa vai."
                    },
                    {
                        "type": "quote",
                        "value": "Mapeamento é o controle apontar para o próprio efeito; consistência é a interface se comportar sempre do mesmo jeito. Juntos, eles deixam a interface tão previsível que o usuário para de pensar nela — e é esse o objetivo."
                    },
                    {
                        "type": "text",
                        "value": "## Consistência: interna e externa\n\n**Consistência** é a interface se comportar e se parecer **do mesmo jeito** em situações parecidas. Ela tem dois lados.\n\n**Consistência interna** — dentro do seu próprio produto, a mesma coisa funciona igual em toda parte. O botão de ação principal tem sempre a mesma cor e fica sempre no mesmo lugar; o ícone de lixeira significa \"excluir\" em todas as telas; \"Cancelar\" fica sempre do mesmo lado de \"Confirmar\".\n\n- **Ruim:** o botão \"Salvar\" aparece no topo em uma tela, no rodapé em outra e no meio numa terceira. A cada tela o usuário tem que **procurar** de novo.\n- **Bom:** \"Salvar\" sempre no mesmo canto, com a mesma cor. O usuário aprende **uma vez** e aplica em todo lugar.\n\n**Consistência externa** — seu produto segue as **convenções** que o usuário já conhece de outros apps e sites: o logo no topo à esquerda leva para a página inicial, o carrinho fica no canto superior direito, a lupa significa \"buscar\". Não é preguiça de inovar; é respeitar o que a pessoa já aprendeu lá fora. Essa ideia é tão forte que virou uma lei própria, a **Lei de Jakob**, que você vai estudar na próxima aula. Não à toa, **consistência e padrões** é uma das 10 heurísticas de Nielsen."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio\",\"O que significa\",\"Exemplo do dia a dia\"],[\"Mapeamento\",\"O controle aponta para o efeito que produz\",\"Seta para cima aumenta; botão do fogão alinhado à boca\"],[\"Consistência interna\",\"A mesma coisa funciona igual em todo o produto\",\"Botão \\\"Salvar\\\" sempre na mesma cor e posição\"],[\"Consistência externa\",\"Seguir convenções conhecidas de outros apps\",\"Logo no topo à esquerda leva à página inicial\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é mapeamento em design de interação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A relação entre um controle e o efeito que ele produz.",
                                "isCorrect": true
                            },
                            {
                                "text": "A pista visual que sinaliza que algo é clicável.",
                                "isCorrect": false
                            },
                            {
                                "text": "A resposta do sistema depois de uma ação do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de opções disponíveis em um menu.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que caracteriza a consistência interna de uma interface?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O mesmo elemento se comporta igual em todas as telas do produto.",
                                "isCorrect": true
                            },
                            {
                                "text": "O produto segue as convenções de outros aplicativos famosos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada tela usa um estilo visual bem diferente para não ficar repetitiva.",
                                "isCorrect": false
                            },
                            {
                                "text": "O sistema responde rapidamente a cada clique do usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um carrossel de imagens, a seta da direita avança as fotos e a da esquerda volta. Por que essa escolha funciona tão bem para o usuário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É um mapeamento natural: a direção do controle bate com o efeito.",
                                "isCorrect": true
                            },
                            {
                                "text": "É um bom exemplo de feedback imediato após o clique.",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma aplicação da Lei de Hick, por reduzir o número de opções.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um signifier que anuncia que o carrossel é clicável.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um mesmo aplicativo, o botão \"Salvar\" aparece ora no topo, ora no rodapé, ora no meio da tela, mudando de lugar a cada seção. O usuário perde tempo procurando por ele. Qual princípio foi quebrado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A consistência interna, já que o botão muda de lugar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O mapeamento, pois o botão não aponta para o seu efeito.",
                                "isCorrect": false
                            },
                            {
                                "text": "O feedback, pois o sistema não responde ao clique.",
                                "isCorrect": false
                            },
                            {
                                "text": "A affordance, pois o botão não parece clicável.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app novo decide ser \"original\": coloca o logo no centro (sem levar à página inicial) e o carrinho de compras no canto inferior esquerdo. Os usuários se perdem e não acham o que procuram. Qual princípio explica melhor essa frustração?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A consistência externa, que o produto contrariou sem necessidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "A Lei de Fitts, porque os alvos ficaram pequenos demais para tocar.",
                                "isCorrect": false
                            },
                            {
                                "text": "A falta de feedback ao clicar no logo e no carrinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um empty state mal projetado nas telas iniciais.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "As leis de UX: Fitts, Hick, Jakob e Miller",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# As leis de UX: Fitts, Hick, Jakob e Miller\n\nPara fechar o módulo, vamos conhecer quatro **leis de UX** clássicas. Um aviso importante: elas não são leis da física, e sim **observações confiáveis sobre como as pessoas se comportam**. Elas te dão atalhos para tomar boas decisões sem precisar testar tudo do zero.\n\nSão muitas por aí, e volta e meia alguém inventa uma \"lei\" que não existe. Aqui a gente fica com quatro das mais sólidas e úteis: **Fitts**, **Hick**, **Jakob** e **Miller**."
                    },
                    {
                        "type": "text",
                        "value": "## Lei de Fitts: alvos maiores e mais perto são mais fáceis\n\nA **Lei de Fitts** diz, em bom português, que o tempo para atingir um alvo depende de **dois fatores**: o **tamanho** do alvo e a **distância** até ele. Quanto **maior** e quanto **mais perto**, mais rápido e fácil de acertar. Quanto menor e mais longe, mais devagar e mais erro.\n\nO que isso muda no seu design:\n\n- **Botões de ação importantes devem ser grandes.** Um botão de \"Comprar\" minúsculo é um convite ao erro.\n- **Alvos de toque generosos no celular.** As diretrizes da Apple e do Material Design recomendam áreas de toque de aproximadamente 44 a 48 pixels — dedo não é seta de mouse.\n- **Coloque ações relacionadas por perto**, para o usuário não atravessar a tela toda.\n- **Bordas e cantos da tela são alvos \"infinitos\":** o cursor do mouse trava neles, então é impossível passar do ponto. Por isso menus e botões em cantos são tão fáceis de acertar.\n\nExemplo prático: num app de celular, colocar o botão principal **grande e ao alcance do polegar** (na parte de baixo) respeita a Lei de Fitts. Escondê-lo num link pequenininho no topo faz o contrário."
                    },
                    {
                        "type": "text",
                        "value": "## Lei de Hick: mais opções, decisão mais lenta\n\nA **Lei de Hick** diz que o **tempo para tomar uma decisão cresce conforme aumenta o número (e a complexidade) de opções**. Quanto mais escolhas você joga na cara da pessoa de uma vez, mais ela demora — e maior a chance de ela travar e desistir.\n\nPense no **controle remoto** antigo, lotado de 50 botões: dá até preguiça de olhar. Compare com um controle enxuto, de poucos botões: você usa sem pensar.\n\nComo aplicar:\n\n- **Reduza o número de opções** visíveis de uma vez. Mostre o essencial.\n- **Agrupe e categorize.** Um menu com 30 itens soltos é confuso; os mesmos 30 organizados em categorias ficam fáceis.\n- **Revele aos poucos** (o chamado *progressive disclosure*): mostre as opções avançadas só para quem pedir. Um bom onboarding pede **uma coisa por vez**, em vez de despejar tudo.\n\nCuidado para não confundir com a próxima lei: Hick fala de **quantidade de opções**; a lição não é ter medo de opções, e sim **organizá-las**."
                    },
                    {
                        "type": "text",
                        "value": "## Lei de Jakob: as pessoas esperam o padrão que já conhecem\n\nA **Lei de Jakob** (de Jakob Nielsen) tem uma frase que resume tudo: *\"os usuários passam a maior parte do tempo em OUTROS sites e apps\"*. Ou seja, eles chegam ao seu produto **cheios de expectativas** formadas em toda a internet — e esperam que o seu funcione **como os outros**.\n\nNa prática, isso quer dizer **seguir convenções**:\n\n- O **logo no topo à esquerda** leva para a página inicial.\n- O **carrinho** fica no canto **superior direito**.\n- A **lupa** significa buscar; o **três risquinhos** (o \"hambúrguer\") abre o menu.\n- **Link sublinhado** é clicável.\n\nIsso é a **consistência externa** da aula anterior, agora com nome de lei. A mensagem não é \"nunca inove\": é **inovar onde agrega valor** (naquilo que torna seu produto único) e **seguir o padrão no resto** (a navegação básica, os ícones comuns). Reinventar a roda no que é trivial só faz o usuário reaprender coisas que ele já sabia."
                    },
                    {
                        "type": "text",
                        "value": "## Lei de Miller: a memória de trabalho e o mito do 7\n\nA **Lei de Miller** costuma ser citada assim: \"a memória de trabalho das pessoas guarda **7 ± 2** itens de cada vez\". E é aqui que mora uma das maiores **confusões** do design.\n\nO estudo original de George Miller, dos anos 1950, falava sobre os limites de julgamento e sobre **agrupamento de informação** — não sobre um teto rígido de 7 itens num menu. Com o tempo, virou o **\"mito do 7\"**: gente limitando menus, listas e abas a exatamente 7 itens \"por causa da ciência\". Isso é **aplicar mal** a ideia.\n\nA lição que **de fato** vale é o **chunking** (agrupamento): a memória lida muito melhor com informação **dividida em blocos** do que com uma sequência crua e longa. Você já faz isso sem pensar:\n\n- Um número de telefone: **9 8888 7777**, não 988887777.\n- Um cartão de crédito: **1234 5678 9012 3456**, em blocos de quatro.\n- Um CPF, separado por pontos e traço.\n\nEntão a Lei de Miller **não** manda você usar 7 itens. Ela manda **agrupar e organizar** a informação em pedaços digeríveis. \"7\" nunca deve ser desculpa para cortar ou inchar um menu."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Lei\",\"Ideia central\",\"O que fazer no design\"],[\"Fitts\",\"Alvos maiores e mais perto são mais fáceis de acertar\",\"Botões importantes grandes; alvos de toque generosos\"],[\"Hick\",\"Mais opções deixam a decisão mais lenta\",\"Reduzir, agrupar e revelar as opções aos poucos\"],[\"Jakob\",\"As pessoas esperam os padrões que já conhecem\",\"Seguir convenções; inovar só onde agrega valor\"],[\"Miller\",\"A memória de trabalho é limitada (o mito do 7)\",\"Agrupar a informação em blocos (chunks), não perseguir o número 7\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo a Lei de Fitts, um alvo é mais fácil e rápido de acertar quando ele é...",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Maior e está mais perto do ponto de partida.",
                                "isCorrect": true
                            },
                            {
                                "text": "Menor e está mais distante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mais colorido, independentemente do tamanho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Acompanhado de um texto explicativo mais longo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual frase resume a Lei de Jakob?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os usuários esperam que seu site funcione como os outros já conhecidos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os usuários sempre preferem novidades radicais a padrões conhecidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quanto mais opções em um menu, mais rápido o usuário decide.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todo botão deve ter no máximo sete palavras no rótulo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app de celular quer que mais gente clique em seu botão principal de ação. Qual mudança se apoia diretamente na Lei de Fitts?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Deixar o botão maior, para ficar ao alcance do polegar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cercar o botão de outros cinco botões parecidos, para dar opções.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir a fonte do botão para ele ocupar menos espaço.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esconder o botão dentro de um submenu para não poluir a tela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O menu principal de um site tem 30 itens jogados em uma lista solta, e os usuários demoram muito para encontrar o que querem. Qual lei explica o problema e qual é a solução mais alinhada a ela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Lei de Hick; a solução é agrupar os itens em categorias.",
                                "isCorrect": true
                            },
                            {
                                "text": "Lei de Fitts; a solução é aumentar o tamanho de cada um dos 30 itens.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lei de Jakob; a solução é copiar exatamente o menu de um concorrente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lei de Miller; a solução é deixar exatamente 7 itens no menu.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um designer insiste em limitar TODO menu, aba e lista do produto a exatamente 7 itens, alegando que \"a Lei de Miller prova que a memória só guarda 7 coisas\". Por que esse raciocínio está equivocado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É um mito mal aplicado: o estudo tratava de chunking, não de um teto fixo de 7 itens.",
                                "isCorrect": true
                            },
                            {
                                "text": "O erro é o número: o limite correto comprovado pela Lei de Miller é de exatamente 5 itens.",
                                "isCorrect": false
                            },
                            {
                                "text": "A Lei de Miller na verdade trata do tamanho e da distância dos alvos, não da memória.",
                                "isCorrect": false
                            },
                            {
                                "text": "O raciocínio está certo; todo menu realmente deve ter sempre 7 itens.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Fundamentos visuais",
        "aulas": [
            {
                "titulo": "Hierarquia visual: guiando o olhar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Hierarquia visual: guiando o olhar\n\nSeja bem-vindo ao **Módulo 4**! Nos módulos anteriores você entendeu quem é o usuário e como desenhar um fluxo que faça sentido. Agora entramos na parte **visual** do design: como montar uma tela que, além de funcionar, guia o olhar de quem chega. E não há ponto de partida melhor do que a **hierarquia visual**.\n\nHierarquia visual é organizar os elementos de uma tela para que o olho perceba, na ordem certa, **o que é mais importante, o que vem depois e o que é só detalhe**. Toda tela conta uma pequena história, e a hierarquia decide em que ordem ela é lida. Quando falta hierarquia, tudo grita ao mesmo tempo — e quando tudo tem o mesmo peso, nada se destaca."
                    },
                    {
                        "type": "text",
                        "value": "## O que o olho vê primeiro\n\nNinguém lê uma tela palavra por palavra logo de cara. A gente **escaneia**: bate o olho, procura pontos de apoio e só então decide onde parar para ler. O Nielsen Norman Group descreve um padrão comum de leitura em forma de **F**: o olho corre pelas primeiras linhas do topo e depois desce pela lateral esquerda, dando saltos.\n\nO trabalho do designer é colocar, no caminho desse olhar, os elementos na ordem de importância. Costumamos pensar em três níveis:\n\n- **Primário**: o que precisa ser visto primeiro. Numa tela de produto, o nome e o preço; numa página de campanha, o título e o botão de ação.\n- **Secundário**: o que apoia a decisão. A descrição, as avaliações, uma imagem de apoio.\n- **Terciário**: os detalhes finos. Termos, rodapé, informações legais.\n\nSe a pessoa bate o olho e, quase de imediato, entende o que a tela oferece e qual é o próximo passo, a hierarquia está fazendo o trabalho dela."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ferramenta\",\"Como chama a atenção\",\"Exemplo na tela\"],[\"Tamanho\",\"O maior é notado primeiro\",\"Um título grande acima de um parágrafo pequeno\"],[\"Peso\",\"O mais grosso (negrito) pesa mais que o fino\",\"O total da compra em negrito\"],[\"Cor e contraste\",\"O que destoa do fundo salta aos olhos\",\"Um botão colorido numa tela clara\"],[\"Posição\",\"O topo e a esquerda são vistos antes\",\"O logo e o menu no alto da página\"],[\"Espaço\",\"O que tem espaço em volta ganha destaque\",\"Um preço isolado, cercado de branco\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Bom x ruim: a mesma tela, duas leituras\n\nImagine um **card de produto** com quatro informações: nome, descrição, preço e o botão \"Comprar\".\n\nNo jeito **ruim**, tudo sai no mesmo tamanho, na mesma cor e na mesma espessura. O olho chega e não sabe onde pousar: é preciso ler tudo para descobrir o que importa. A tela fica **plana**, sem relevo.\n\nNo jeito **bom**, criamos relevo. O **nome** vem maior, o **preço** ganha destaque em tamanho e negrito, a **descrição** fica menor e em cinza, e o **botão** recebe uma cor forte que contrasta com o fundo. Repare que não mudamos nenhuma informação — só o **peso visual** de cada uma:"
                    },
                    {
                        "type": "code",
                        "value": "/* Nome do produto: o maior e mais forte da tela */\n.produto-nome {\n  font-size: 22px;\n  font-weight: 700;\n  color: #1a1a1a;\n}\n\n/* Descricao: empurrada para o segundo plano */\n.produto-descricao {\n  font-size: 14px;\n  color: #6b7280; /* cinza pesa menos que o preto */\n}\n\n/* Botao de acao: cor forte para saltar aos olhos */\n.produto-comprar {\n  background: #2563eb;\n  color: #ffffff;\n}"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** **hierarquia visual** é guiar o olho, mostrando primeiro o mais importante e por último o detalhe. Ela se constrói com cinco ferramentas — **tamanho**, **peso**, **cor e contraste**, **posição** e **espaço**. O olho escaneia antes de ler (o padrão em **F**), então plante nesse caminho os elementos primários. E lembre-se: destaque é **relativo** — se você reforça tudo, não reforça nada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para que serve a hierarquia visual em uma tela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Para guiar o olho, mostrando o que é mais importante primeiro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Para deixar todos os elementos com exatamente o mesmo peso visual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para esconder do usuário as informações menos relevantes da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para decidir em qual linguagem de programação o site será feito.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa tela, todos os textos têm o mesmo tamanho, a mesma cor e o mesmo peso. Qual é o problema mais provável?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O olho não sabe o que é mais importante, sem hierarquia.",
                                "isCorrect": true
                            },
                            {
                                "text": "A página passa a carregar bem mais devagar no navegador.",
                                "isCorrect": false
                            },
                            {
                                "text": "As cores do texto ficam erradas em telas escuras.",
                                "isCorrect": false
                            },
                            {
                                "text": "O texto fica impossível de navegar usando o teclado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O botão \"Finalizar compra\" está no meio de vários textos do mesmo tamanho e cor, e os usuários não o encontram. Qual ajuste resolve melhor o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dar ao botão uma cor de destaque que contraste com o fundo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o tamanho de todos os textos da tela por igual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixar todo o texto da tela em negrito, sem exceção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar a fonte de toda a página por uma bem decorativa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que o preço seja uma das primeiras coisas notadas num card de produto. Além de aumentar o tamanho, qual recurso reforça esse destaque?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cercar o preço de espaço em branco, isolando-o do resto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Colocar o preço no rodapé, bem longe do resto da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar no preço a mesma cor e o mesmo tamanho do texto comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever o preço com a menor letra disponível na tela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para \"dar destaque a tudo\", um designer deixou todos os textos da tela em negrito e num tamanho grande. Ainda assim, nada parece se sobressair. Por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o destaque é relativo: se tudo pesa igual, nada se destaca.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o negrito nunca deve ser usado em interfaces digitais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque telas grandes não conseguem exibir textos em negrito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a hierarquia depende só da cor, nunca do peso ou tamanho.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tipografia: a aparência do texto",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tipografia: a aparência do texto\n\nSe você parar para reparar, a maior parte de qualquer interface é **texto**: títulos, botões, rótulos, menus, parágrafos. Por isso, cuidar da **tipografia** — a aparência e a organização do texto — é um dos jeitos mais rápidos de fazer uma tela parecer profissional ou amadora.\n\nBoa tipografia faz duas coisas ao mesmo tempo: deixa o texto **fácil de ler** e ajuda a **hierarquia** (aquilo que vimos na aula anterior). Nesta aula você vai conhecer as famílias de fontes, entender tamanho, peso e entrelinha, e aprender a montar uma **escala tipográfica** para dar ordem ao texto."
                    },
                    {
                        "type": "text",
                        "value": "## Famílias: serifada, sem serifa e monoespaçada\n\nUma **fonte** (ou família tipográfica) é o conjunto de desenhos das letras. Cada família tem uma personalidade, e elas costumam ser agrupadas em três grandes tipos:\n\n- **Serifada** (_serif_): tem pequenos \"pezinhos\" nas pontas das letras, como a Georgia e a Times New Roman. Passa um ar clássico, editorial, de livro e jornal.\n- **Sem serifa** (_sans-serif_): não tem esses pezinhos, como a Arial, a Helvetica e a Roboto. Tem um visual limpo e moderno, e é a escolha mais comum para telas e interfaces.\n- **Monoespaçada** (_monospace_): todas as letras ocupam a mesma largura, como a Courier. É a cara de código de programação.\n\nUma dica de ouro para quem começa: **menos é mais**. Duas famílias por projeto já bastam — por exemplo, uma sem serifa para os textos e uma serifada para os títulos. Misturar muitas fontes deixa a interface bagunçada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Família\",\"Marca registrada\",\"Exemplos\",\"Boa para\"],[\"Serifada\",\"Pezinhos nas pontas das letras\",\"Georgia, Times New Roman\",\"Textos longos, ar clássico\"],[\"Sem serifa\",\"Traços limpos, sem pezinhos\",\"Arial, Helvetica, Roboto\",\"Telas e interfaces modernas\"],[\"Monoespaçada\",\"Todas as letras com a mesma largura\",\"Courier, Consolas\",\"Mostrar código\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Tamanho, peso, entrelinha e legibilidade\n\nCom a família escolhida, alguns ajustes definem o conforto da leitura:\n\n- **Tamanho** (_font-size_): a maioria dos navegadores usa 16px como padrão para o corpo do texto. É um bom ponto de partida; textos muito pequenos cansam.\n- **Peso** (_font-weight_): a espessura do traço. Um título em negrito e um corpo em peso normal já criam hierarquia sem trocar de fonte.\n- **Entrelinha** (_line-height_): o espaço vertical entre as linhas. Linhas muito coladas sufocam a leitura. Para o corpo do texto, uma entrelinha por volta de **1,5** costuma ficar confortável.\n\nOutro fator de **legibilidade** é o comprimento da linha: linhas longas demais cansam o olho no caminho de volta. Uma referência clássica da tipografia é manter a linha por volta de 60 caracteres. E vale uma regra prática: no **corpo** do texto, priorize sempre a legibilidade; deixe as fontes mais decorativas apenas para títulos curtos.\n\nPara os tamanhos não saírem no chute, use uma **escala tipográfica**: em vez de escolher números aleatórios, você parte de um tamanho-base (16px) e multiplica por uma razão fixa (um valor comum é por volta de 1,25) para chegar aos títulos. O resultado é uma progressão harmônica — corpo, subtítulo, título — em vez de tamanhos soltos."
                    },
                    {
                        "type": "code",
                        "value": "/* Corpo do texto: base confortavel e boa entrelinha */\nbody {\n  font-family: \"Roboto\", Arial, sans-serif;\n  font-size: 16px;\n  line-height: 1.5;\n}\n\n/* Uma escala simples de tamanhos para dar hierarquia */\nh1 { font-size: 32px; font-weight: 700; }\nh2 { font-size: 25px; font-weight: 700; }\nh3 { font-size: 20px; font-weight: 600; }\np  { font-size: 16px; font-weight: 400; }\nsmall { font-size: 13px; }"
                    },
                    {
                        "type": "quote",
                        "value": "**Resumo:** a **tipografia** cuida da aparência e da organização do texto. Escolha entre famílias **serifadas**, **sem serifa** (as mais comuns em telas) e **monoespaçadas**, e use poucas por projeto. O conforto de leitura vem do **tamanho** (16px de base), do **peso**, da **entrelinha** (~1,5 no corpo) e de linhas que não sejam longas demais. Para os títulos, monte uma **escala tipográfica** a partir de um tamanho-base — assim os tamanhos formam uma progressão harmônica, e não um amontoado de números soltos."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a marca registrada de uma fonte serifada, como a Times New Roman?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os pequenos \"pezinhos\" nas pontas de cada letra.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todas as letras com exatamente a mesma largura.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência total de qualquer traço mais fino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ser sempre exibida em negrito em qualquer tela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a entrelinha (_line-height_) controla no texto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O espaço vertical entre uma linha e a linha seguinte.",
                                "isCorrect": true
                            },
                            {
                                "text": "A cor de fundo que fica atrás de todo o parágrafo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de fontes usadas na mesma página.",
                                "isCorrect": false
                            },
                            {
                                "text": "A largura das bordas desenhadas ao redor do texto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um parágrafo longo está com as linhas quase coladas umas nas outras, e os leitores reclamam que cansa ler. Qual ajuste tipográfico resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar a entrelinha para dar respiro entre as linhas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixar todo o parágrafo em negrito, do início ao fim.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar a fonte do parágrafo por uma monoespaçada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o tamanho da letra para caber mais texto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao definir os tamanhos de título e corpo, um designer escolheu 15px, 17px, 22px e 29px no olho, e o resultado ficou desordenado. Qual abordagem traria mais harmonia?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar uma escala tipográfica, com uma razão fixa entre os tamanhos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixar todos os textos exatamente com o mesmo tamanho de fonte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher um tamanho diferente e aleatório para cada frase da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar todos os tamanhos até eles preencherem a tela toda.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site usa uma bela fonte manuscrita e decorativa em todo o corpo do texto, e os usuários reclamam que é cansativo ler artigos longos. Qual é a melhor decisão de design?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reservar a fonte decorativa para títulos e usar outra no corpo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter a fonte decorativa e apenas deixar todo o texto em negrito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar bastante o tamanho da fonte decorativa em todo o corpo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar só a cor do texto e manter a mesma fonte decorativa no corpo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cor: harmonia, significado e contraste",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Cor: harmonia, significado e contraste\n\nA **cor** comunica antes das palavras. Antes de ler qualquer coisa, a pessoa já sente se uma tela é séria ou divertida, se um botão é perigoso ou seguro, se um aviso é urgente. Usada com intenção, a cor organiza, dá personalidade e orienta; usada no chute, ela confunde e cansa.\n\nToda cor pode ser descrita por três características: o **matiz** (a cor em si — azul, vermelho, verde), a **saturação** (o quanto ela é viva ou desbotada) e o **brilho** (o quanto é clara ou escura). Nesta aula você vai conhecer a roda de cores, montar combinações que funcionam, entender o significado das cores e — o mais importante para a acessibilidade — garantir **contraste**."
                    },
                    {
                        "type": "text",
                        "value": "## A roda de cores e as harmonias\n\nA **roda de cores** organiza os matizes em círculo. A partir das posições nela, você monta **harmonias** — combinações que costumam funcionar bem juntas:\n\n- **Complementar**: duas cores em lados **opostos** da roda (como azul e laranja). Geram forte contraste e energia; ótimas para destacar um elemento.\n- **Análoga**: cores **vizinhas** na roda (como azul, azul-esverdeado e verde). Passam calma e coesão.\n- **Tríade**: três cores **igualmente espaçadas** na roda. Colorida e equilibrada, pede uma cor dominante.\n- **Monocromática**: variações de **uma mesma cor** (tons claros e escuros de azul). Elegante e muito fácil de acertar.\n\nUma dica para não errar: escolha **uma** cor dominante e use as outras com parcimônia, só para acento."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Harmonia\",\"O que é\",\"Sensação\",\"Bom uso\"],[\"Complementar\",\"Cores opostas na roda\",\"Contraste, energia\",\"Destacar um botão ou aviso\"],[\"Análoga\",\"Cores vizinhas na roda\",\"Calma, coesão\",\"Fundos e temas suaves\"],[\"Tríade\",\"Três cores igualmente espaçadas\",\"Viva e equilibrada\",\"Ilustrações, marcas alegres\"],[\"Monocromática\",\"Tons de uma mesma cor\",\"Elegante, coesa\",\"Interfaces sóbrias\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Cor com significado — e por que o contraste é acessibilidade\n\nCores carregam significado. Em interfaces, o **verde** costuma indicar sucesso, o **vermelho** erro ou perigo, o **amarelo** um alerta. Marcas também têm suas cores, e o significado muda entre **culturas** — por isso, nunca confie **só** na cor para transmitir uma informação.\n\nPara equilibrar as proporções, uma regra prática muito usada é a **60-30-10**: cerca de 60% da tela numa cor dominante (em geral neutra), 30% numa secundária e 10% numa cor de acento, reservada para o que precisa saltar aos olhos.\n\nMas a decisão mais importante sobre cor é o **contraste**, e ela liga diretamente com a **acessibilidade**. Se o texto não se separa bem do fundo, muita gente não consegue ler — em especial pessoas com baixa visão. A **WCAG** (o guia de acessibilidade da web) define mínimos objetivos:\n\n- Texto normal: contraste de pelo menos **4,5:1** com o fundo.\n- Texto grande e componentes de interface (como a borda de um campo): pelo menos **3:1**.\n\nE há um cuidado extra ligado ao significado: **não use apenas a cor** para comunicar. Marcar um campo com erro só deixando a borda vermelha exclui quem não distingue bem as cores (daltonismo). Some sempre um ícone, um texto ou um rótulo."
                    },
                    {
                        "type": "code",
                        "value": "/* Alto contraste: texto escuro sobre fundo claro (passa em 4.5:1) */\n.aviso {\n  background: #ffffff;\n  color: #1f2937;\n}\n\n/* Erro: alem da cor, um icone e um texto acompanham o vermelho */\n.campo-erro {\n  border: 2px solid #dc2626;\n}\n\n/* EVITE: cinza-claro sobre branco quase nao contrasta */\n.texto-fraco {\n  background: #ffffff;\n  color: #d1d5db; /* baixo contraste: dificil de ler */\n}"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** descreva a cor por **matiz, saturação e brilho**, e combine matizes com as **harmonias** da roda — complementar (contraste), análoga (calma), tríade e monocromática. Cores têm **significado** (verde/sucesso, vermelho/erro), mas ele varia com a cultura, então **não comunique só pela cor**. A decisão mais importante é o **contraste**: siga os mínimos da **WCAG** (4,5:1 para texto normal, 3:1 para texto grande e componentes) para que todo mundo consiga ler."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na roda de cores, duas cores em lados opostos (como azul e laranja), que geram forte contraste, formam uma harmonia chamada...",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Complementar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Monocromática.",
                                "isCorrect": false
                            },
                            {
                                "text": "Análoga.",
                                "isCorrect": false
                            },
                            {
                                "text": "Neutra.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo a WCAG, qual é o contraste mínimo recomendado entre um texto normal e o seu fundo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "4,5:1.",
                                "isCorrect": true
                            },
                            {
                                "text": "1:1.",
                                "isCorrect": false
                            },
                            {
                                "text": "0,5:1.",
                                "isCorrect": false
                            },
                            {
                                "text": "10:1.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app mostra textos em cinza-claro sobre fundo branco. Pessoas com baixa visão dizem que não conseguem ler. O que está acontecendo e como resolver?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O contraste está baixo demais; escurecer o texto resolve.",
                                "isCorrect": true
                            },
                            {
                                "text": "A fonte está grande demais; basta reduzir o tamanho do texto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Há fontes de mais na página; remover uma resolve o contraste.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é a entrelinha; aproximar as linhas resolve.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num formulário, o único sinal de erro é a borda do campo ficar vermelha. Por que isso é um problema de acessibilidade e como corrigir?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quem não distingue as cores pode não notar o erro; falta um ícone.",
                                "isCorrect": true
                            },
                            {
                                "text": "O vermelho deixa a página mais lenta pra carregar; basta trocar por azul.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bordas nunca deveriam ter cor nenhuma; o certo é remover a borda toda.",
                                "isCorrect": false
                            },
                            {
                                "text": "O erro só deveria aparecer depois que a página for recarregada de novo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você vai definir a paleta de um app e quer um visual calmo e coeso, construído a partir de variações de uma mesma cor (do azul-claro ao azul-escuro). Qual harmonia se encaixa melhor?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Monocromática, que usa tons de uma única cor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Complementar, que combina cores opostas na roda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tríade, com três cores igualmente espaçadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma paleta com o maior número de cores possível.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Espaçamento e grid: dando estrutura à tela",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Espaçamento e grid: dando estrutura à tela\n\nEntre um elemento e outro existe uma coisa que parece \"nada\", mas faz toda a diferença: o **espaço**. Quem está começando costuma ver o espaço em branco como desperdício e tenta preencher cada cantinho. Designers experientes fazem o contrário: usam o espaço para **organizar**, **agrupar** e **dar respiro**.\n\nNesta aula você vai ver como o espaço em branco, o alinhamento, a proximidade e o ritmo deixam a tela mais clara — e como os **grids** e as **colunas** dão a estrutura invisível que mantém tudo no lugar."
                    },
                    {
                        "type": "text",
                        "value": "## Espaço em branco e proximidade\n\n**Espaço em branco** (ou espaço negativo) é toda a área \"vazia\" entre e ao redor dos elementos. Ele não precisa ser literalmente branco: é o respiro da tela. Um pouco de espaço em volta de um título ou de um botão já faz esse elemento **respirar** e ganhar importância — lembra a hierarquia da primeira aula.\n\nO espaço também **agrupa**, por causa da **proximidade**: elementos próximos são percebidos como parte de um mesmo grupo, e elementos afastados, como grupos diferentes. É por isso que, num formulário, o rótulo \"E-mail\" deve ficar **coladinho** ao seu campo e mais **longe** do campo de baixo. A distância conta uma história: \"estes dois são um par; aquele ali é outra coisa\"."
                    },
                    {
                        "type": "text",
                        "value": "## Alinhamento e ritmo\n\n**Alinhamento** é encostar os elementos em linhas invisíveis em comum. Quando vários itens compartilham a mesma borda esquerda, o olho percebe **ordem**, mesmo sem enxergar nenhuma linha. Bordas bagunçadas, cada uma começando num ponto diferente, passam sensação de desleixo.\n\n**Ritmo** é a repetição de espaçamentos **consistentes**. Se o vão entre os cards é 16px aqui, 9px ali e 23px acolá, a tela treme. Para evitar isso, equipes usam um **sistema de espaçamento**: em vez de números soltos, todos os espaços são múltiplos de um mesmo valor — um sistema comum usa **múltiplos de 8** (8, 16, 24, 32...). Assim os espaçamentos combinam entre si e ficam fáceis de repetir."
                    },
                    {
                        "type": "code",
                        "value": "/* Um sistema de espacamento em multiplos de 8 */\n:root {\n  --space-1: 8px;\n  --space-2: 16px;\n  --space-3: 24px;\n  --space-4: 32px;\n}\n\n/* Rotulo colado ao campo (proximidade); grupos afastados entre si */\n.campo {\n  margin-bottom: var(--space-3); /* respiro entre um campo e outro */\n}\n.campo label {\n  margin-bottom: var(--space-1); /* rotulo pertinho do seu input */\n}\n\n/* Espaco consistente entre os cards (ritmo) */\n.lista-cards {\n  display: flex;\n  gap: var(--space-2);\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Grids e colunas\n\nUm **grid** é uma malha invisível de **colunas** que serve de esqueleto para a tela. Em vez de posicionar cada elemento no olho, você os encaixa nessas colunas — e tudo passa a se alinhar naturalmente. Na web, o mais comum é o grid de **12 colunas**, porque 12 se divide bem: dá para montar 2, 3, 4 ou 6 blocos de larguras iguais.\n\nOs elementos do grid têm nomes simples: as **colunas** carregam o conteúdo, as **calhas** (_gutters_) são os espaços entre elas, e as **margens** protegem as laterais da tela. A grande vantagem aparece na **responsividade**: numa tela larga, um conteúdo pode ocupar 4 colunas lado a lado; numa tela de celular, as mesmas peças \"empilham\" e passam a ocupar a largura toda. O grid mantém o alinhamento em qualquer tamanho de tela."
                    },
                    {
                        "type": "quote",
                        "value": "**Resumo:** o **espaço em branco** não é desperdício — ele dá respiro e destaque. Pela **proximidade**, aproxime o que é do mesmo grupo (rótulo e campo) e afaste o que não é. O **alinhamento** a linhas em comum cria ordem, e o **ritmo** vem de espaçamentos consistentes (por exemplo, múltiplos de 8). Por baixo de tudo, um **grid** de colunas — na web, tipicamente 12 — dá o esqueleto que mantém a tela alinhada, inclusive quando ela encolhe no celular."
                    }
                ],
                "questions": [
                    {
                        "statement": "No design de interfaces, para que serve o espaço em branco (o espaço \"vazio\" entre os elementos)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Para dar respiro e organizar melhor os elementos da tela.",
                                "isCorrect": true
                            },
                            {
                                "text": "É espaço desperdiçado que deveria sempre ser preenchido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Serve apenas para deixar a página mais pesada para carregar.",
                                "isCorrect": false
                            },
                            {
                                "text": "É usado só para esconder erros de layout malfeito.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Pelo princípio da proximidade, como o olho interpreta dois elementos que estão bem próximos um do outro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Como parte de um mesmo grupo, ligados entre si.",
                                "isCorrect": true
                            },
                            {
                                "text": "Como elementos sem nenhuma relação entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como um erro de alinhamento a ser corrigido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como elementos que deveriam ter cores opostas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num formulário, o rótulo \"Telefone\" ficou à mesma distância do campo de cima e do de baixo, e os usuários se confundem sobre a qual campo ele pertence. Qual princípio resolve e como?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Proximidade: colar o rótulo no campo certo e afastar o outro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Contraste: deixar o rótulo numa cor bem mais chamativa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escala: aumentar bastante o tamanho da fonte do rótulo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ritmo: repetir o mesmo rótulo ao lado de todos os campos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Os espaços entre os cards de uma tela variam sem critério: 9px, 15px, 22px. O resultado parece bagunçado. Qual abordagem traz mais ritmo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Adotar um sistema de espaçamento fixo, como múltiplos de 8.",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover todo o espaço que existe entre os cards da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar um espaço diferente e aleatório para cada card.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a fonte dentro dos cards até preencher os vãos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa página, os blocos de conteúdo começam cada um numa borda esquerda diferente e a tela parece desorganizada, mesmo com conteúdo bom. Qual é a causa e a melhor correção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Falta de alinhamento; encaixar os blocos num grid resolve.",
                                "isCorrect": true
                            },
                            {
                                "text": "Excesso de contraste; basta reduzir as cores da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Entrelinha curta; basta afastar mais as linhas de texto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uso de fontes serifadas; basta trocar por uma sem serifa.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Princípios de Gestalt: como a mente agrupa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Princípios de Gestalt: como a mente agrupa\n\nNosso cérebro odeia bagunça. Diante de um monte de elementos, ele automaticamente procura **padrões** e agrupa as coisas para dar sentido ao conjunto. Os **princípios de Gestalt** descrevem justamente essas \"regras\" que a mente usa para organizar o que vê. A ideia-mãe é simples: **o todo é diferente da soma das partes** — a gente enxerga grupos e formas, não peças soltas.\n\nPara o design, isso é ouro: se você conhece como o olho agrupa, consegue organizar uma tela **a favor** da percepção das pessoas, em vez de lutar contra ela. Vamos ver os cinco princípios mais úteis no dia a dia."
                    },
                    {
                        "type": "text",
                        "value": "## Proximidade e semelhança\n\n**Proximidade**: elementos **próximos** são percebidos como um grupo. É o mesmo princípio da aula de espaçamento — a distância é o que diz quais itens andam juntos. Um menu cujos links estão pertinho um do outro é lido como \"um bloco\", separado do conteúdo.\n\n**Semelhança**: elementos que **se parecem** — mesma cor, forma ou tamanho — são percebidos como do mesmo tipo, mesmo estando separados. Por isso todos os links de um site costumam ter a mesma cor, e todos os botões primários o mesmo estilo: a aparência em comum diz \"nós fazemos a mesma coisa\". Se dois botões diferentes têm a cara idêntica, o usuário espera que se comportem igual."
                    },
                    {
                        "type": "text",
                        "value": "## Continuidade e fechamento\n\n**Continuidade**: o olho gosta de seguir **linhas e caminhos** contínuos. Elementos alinhados numa linha (ou curva) são vistos como uma sequência conectada. É por isso que um card **cortado pela metade** na borda da tela convida a deslizar: o olho entende que a linha continua para o lado, sinalizando \"tem mais conteúdo aqui\".\n\n**Fechamento**: quando uma forma tem pequenas falhas, a mente **completa** o desenho sozinha. A gente vê um círculo mesmo quando o traço está interrompido em alguns pontos. Muitos logos e ícones exploram isso: com poucas linhas, o cérebro fecha a figura e reconhece o objeto inteiro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio\",\"O que a mente faz\",\"Exemplo na interface\"],[\"Proximidade\",\"Agrupa o que está perto\",\"Os links de um menu lidos como um bloco\"],[\"Semelhança\",\"Agrupa o que se parece\",\"Todos os links na mesma cor\"],[\"Continuidade\",\"Segue linhas e caminhos\",\"Um card cortado convida a deslizar\"],[\"Fechamento\",\"Completa formas incompletas\",\"Um logo reconhecido mesmo com falhas\"],[\"Figura-fundo\",\"Separa o objeto do fundo\",\"Um modal claro sobre o fundo escurecido\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Figura-fundo\n\nO princípio de **figura-fundo** diz que o olho separa a cena em duas partes: a **figura** (o objeto em foco) e o **fundo** (o resto). Uma interface bem resolvida deixa sempre claro o que é figura — ou seja, com o que dá para interagir agora.\n\nO exemplo mais comum é o **modal** (aquela janelinha que abre por cima da tela): ao escurecer o fundo atrás dela, o modal vira a **figura** em evidência e todo o resto recua para o **fundo**. A pessoa entende, sem ler nada, que a atenção agora é ali. Contraste, sombra e espaço são as ferramentas que separam figura de fundo — repare como tudo o que você viu neste módulo se conecta."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** os **princípios de Gestalt** descrevem como a mente agrupa o que vê — o todo é diferente da soma das partes. **Proximidade** agrupa o que está perto; **semelhança**, o que se parece; **continuidade** faz o olho seguir linhas (o card cortado que convida a deslizar); **fechamento** completa formas incompletas; e **figura-fundo** separa o objeto em foco do resto (como um modal sobre o fundo escurecido). Usar Gestalt é organizar a tela a favor da forma como as pessoas naturalmente enxergam."
                    }
                ],
                "questions": [
                    {
                        "statement": "O princípio de Gestalt da proximidade diz que o olho agrupa os elementos com base em quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Na distância entre os elementos na tela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Na cor: só elementos coloridos formam grupo.",
                                "isCorrect": false
                            },
                            {
                                "text": "No tamanho da fonte usado em cada elemento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na ordem alfabética dos textos na página.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que, num site, todos os links costumam ter a mesma cor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pela semelhança: itens parecidos parecem do mesmo tipo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a cor dos links nunca pode ser alterada no CSS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para deixar a página mais pesada e lenta de carregar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a maioria dos navegadores só permite links vermelhos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer deixar claro que um conjunto de botões pertence ao mesmo grupo de ações, mesmo estando um pouco espalhados pela tela. Qual princípio de Gestalt você usaria?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Semelhança: dar a todos o mesmo estilo de cor e forma.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fechamento: deixar cada botão com uma falha no contorno.",
                                "isCorrect": false
                            },
                            {
                                "text": "Figura-fundo: escurecer o fundo atrás de cada botão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Continuidade: cortar um dos botões na borda da tela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao abrir uma janela de confirmação (modal), um app escurece todo o resto da tela atrás dela. Qual princípio de Gestalt explica por que isso funciona?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Figura-fundo: o modal vira a figura e o resto recua.",
                                "isCorrect": true
                            },
                            {
                                "text": "Semelhança: o modal fica com a cara do restante da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Proximidade: o modal cola em todos os outros elementos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Continuidade: o modal forma uma linha reta com o menu.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa lista horizontal, o app mostra de propósito metade de um card \"vazando\" na borda direita da tela. Qual princípio isso explora e com que objetivo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Continuidade: o corte sugere que a linha segue, convidando a deslizar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fechamento: o corte serve para esconder um erro no layout da lista.",
                                "isCorrect": false
                            },
                            {
                                "text": "Semelhança: o corte deveria ter uma cor diferente dos demais cards.",
                                "isCorrect": false
                            },
                            {
                                "text": "Figura-fundo: o corte serve para escurecer o fundo atrás da lista.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Usabilidade e heurísticas",
        "aulas": [
            {
                "titulo": "O que é usabilidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é usabilidade\n\nVocê já tentou usar um aplicativo ou um site e simplesmente não conseguiu achar o botão que precisava? Ou preencheu um formulário inteiro, clicou em enviar e recebeu um erro sem explicação, obrigando a começar tudo de novo? Se já passou por isso, você sentiu na pele o que é a **falta de usabilidade**.\n\nUsabilidade é a medida de o quanto uma interface é **fácil e agradável de usar** para as pessoas que a utilizam. Não tem a ver com ser bonita, moderna ou cheia de recursos: tem a ver com as pessoas conseguirem **fazer o que vieram fazer**, sem tropeçar no caminho. Um site pode ser lindíssimo e ter uma usabilidade péssima; e um site simples, quase feio, pode ser um prazer de usar."
                    },
                    {
                        "type": "quote",
                        "value": "**Usabilidade** é a qualidade que mede o quão fácil é usar uma interface. A definição clássica (norma ISO 9241) apoia-se em três pilares: **eficácia** (a pessoa consegue concluir o que queria?), **eficiência** (com quanto esforço e tempo?) e **satisfação** (foi uma experiência agradável?)."
                    },
                    {
                        "type": "text",
                        "value": "## Eficácia, eficiência e satisfação\n\nEsses três pilares são a espinha dorsal da usabilidade. Vale entender cada um com um exemplo do dia a dia: imagine alguém usando o totem de autoatendimento de uma lanchonete para fazer um pedido.\n\n- **Eficácia**: a pessoa **consegue** concluir a tarefa? Se ela monta o lanche, paga e recebe a senha, o totem foi eficaz. Se desiste no meio porque não achou como remover a cebola, faltou eficácia. Eficácia é sobre **conseguir ou não** chegar ao objetivo.\n- **Eficiência**: **quanto esforço** a tarefa exigiu? Se o pedido saiu em quatro toques rápidos, a eficiência é alta. Se foram vinte telas, textos confusos e idas e vindas, a tarefa até foi concluída, mas com baixa eficiência. Eficiência é sobre o **custo** (tempo, cliques, esforço mental) de chegar lá.\n- **Satisfação**: como a pessoa **se sentiu** usando aquilo? Tranquila e confiante, ou irritada e insegura? Mesmo uma tarefa concluída com sucesso pode deixar uma sensação ruim se o caminho foi estressante.\n\nRepare que os três são diferentes: dá para ser eficaz sem ser eficiente (você conclui, mas sofre), e dá para concluir uma tarefa e mesmo assim sair insatisfeito."
                    },
                    {
                        "type": "text",
                        "value": "## Os cinco componentes da usabilidade\n\nJakob Nielsen, um dos nomes mais importantes da área, detalhou a usabilidade em **cinco componentes**. Eles ajudam a enxergar que \"fácil de usar\" não é uma coisa só:\n\n- **Facilidade de aprendizado**: na primeira vez, quão rápido a pessoa entende como fazer o básico? Um app com bom aprendizado não exige manual para as tarefas comuns.\n- **Eficiência**: depois de já ter aprendido, quão rápido a pessoa realiza as tarefas? (É o mesmo pilar de antes, agora olhando o usuário já experiente.)\n- **Memorização**: quando a pessoa volta a usar depois de um tempo parada, ela lembra como funciona ou precisa reaprender tudo?\n- **Erros**: quantos erros as pessoas cometem, quão graves são e quão fácil é se recuperar deles? Uma boa interface previne erros e, quando eles acontecem, ajuda a corrigir.\n- **Satisfação**: usar aquilo é agradável?\n\nUm exemplo une tudo: um app de banco. Ele tem bom **aprendizado** se você faz seu primeiro Pix sem ajuda; boa **eficiência** se, no centésimo Pix, resolve em segundos; boa **memorização** se, ao voltar depois de um mês, ainda sabe onde tudo fica; e cuida dos **erros** se avisa antes de você transferir para a chave errada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Componente\", \"A pergunta que ele responde\"], [\"Aprendizado\", \"É fácil realizar as tarefas na primeira vez?\"], [\"Eficiência\", \"Depois de aprender, dá para fazer rápido?\"], [\"Memorização\", \"Ao voltar depois de um tempo, ainda lembro como usar?\"], [\"Erros\", \"Cometo poucos erros? Consigo me recuperar deles?\"], [\"Satisfação\", \"É agradável de usar?\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Usabilidade não é a mesma coisa que \"ser bonito\"\n\nÉ comum confundir usabilidade com estética, mas são coisas distintas. **Estética** é sobre a aparência agradar aos olhos; **usabilidade** é sobre a interface funcionar bem na prática. O ideal é ter as duas, mas quando é preciso escolher em nome de quem usa, a usabilidade vem primeiro: ninguém volta a um app lindo onde não consegue fazer nada.\n\nTambém não confunda usabilidade com **experiência do usuário (UX)**. A UX é o guarda-chuva maior, que inclui tudo o que a pessoa sente ao usar um produto (a emoção, a confiança, a marca). A usabilidade é uma **parte** essencial da UX: é a parte que garante que a coisa seja utilizável. Um produto pode ser utilizável e ainda assim ter uma UX apenas razoável, mas dificilmente terá uma boa UX se não for utilizável.\n\nNos próximos capítulos você vai conhecer ferramentas concretas para **avaliar e melhorar** a usabilidade: as dez heurísticas de Nielsen, a avaliação heurística e os testes de usabilidade."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções melhor descreve o que é usabilidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Facilidade de uso que ajuda as pessoas a concluir tarefas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aparência moderna e visualmente agradável da interface.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantidade de recursos e funções oferecidas pelo produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Velocidade com que o servidor carrega as páginas do site.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo a definição clássica, quais são os três pilares da usabilidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Eficácia, eficiência e satisfação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cor, tipografia e espaçamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rapidez, segurança e preço.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aprendizado, memória e criatividade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa consegue comprar a passagem no site, mas leva 15 minutos, passa por telas confusas e quase desiste. A tarefa foi concluída, mas com muito esforço. Que pilar da usabilidade ficou comprometido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Eficiência: a compra foi concluída, mas custou tempo e esforço demais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Eficácia: a compra não chegou a ser finalizada pela pessoa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum pilar, já que concluir a compra é tudo o que importa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Memorização: a pessoa provavelmente esquecerá o caminho percorrido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário fez um Pix sem dificuldade, mas ao voltar ao app depois de um mês não lembrava onde ficava a opção e teve que procurar por vários menus. Qual componente da usabilidade falhou?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Memorização: ela não lembrou como usar após um tempo sem acessar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aprendizado: essa foi a primeira vez que ela usou o aplicativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eficácia: ela não conseguiu concluir o Pix de forma alguma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Satisfação: o aplicativo tem uma aparência visual pouco atraente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app de finanças é premiado pelo visual deslumbrante, mas os usuários reclamam que não acham como pagar um boleto e frequentemente erram o valor. Que conclusão está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ser bonito não garante boa usabilidade: pode agradar e ainda causar erros.",
                                "isCorrect": true
                            },
                            {
                                "text": "Se o design agrada aos olhos, a usabilidade está automaticamente garantida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Estética e usabilidade são sempre a mesma coisa, então não há problema real.",
                                "isCorrect": false
                            },
                            {
                                "text": "A usabilidade depende apenas da velocidade com que as telas carregam.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "As 10 heurísticas de Nielsen (parte 1)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# As 10 heurísticas de Nielsen (parte 1)\n\nSe usabilidade é o objetivo, como saber se uma interface tem boa usabilidade? Uma das ferramentas mais famosas e úteis são as **10 heurísticas de usabilidade** de **Jakob Nielsen**, publicadas em 1994 e usadas até hoje no mundo todo.\n\nA palavra \"heurística\" assusta, mas o significado é simples: são **regras gerais**, princípios de bom senso testados na prática. Não são leis rígidas nem uma checklist exata; são dez ideias que, quando respeitadas, tornam quase qualquer interface mais fácil de usar. Nesta aula vamos ver as **cinco primeiras**, cada uma com um exemplo do que fazer e do que evitar. As outras cinco ficam para a próxima aula."
                    },
                    {
                        "type": "text",
                        "value": "## 1. Visibilidade do status do sistema\n\nO sistema deve **sempre manter a pessoa informada** sobre o que está acontecendo, com um retorno (feedback) claro e em tempo razoável. Quem usa precisa saber: deu certo? Está carregando? Onde eu estou?\n\n- **Ruim**: você toca em \"Pagar\" e a tela fica parada, sem nada mudar. Você não sabe se o toque funcionou, então toca de novo e acaba pagando duas vezes.\n- **Bom**: ao tocar em \"Pagar\", o botão vira um indicador de carregamento e, em seguida, aparece \"Pagamento aprovado\". Um app de mensagens que mostra \"enviando... enviada... lida\" é visibilidade de status em ação.\n\nBarras de progresso, indicadores de carregamento e a marcação de \"você está aqui\" em um checkout de várias etapas: tudo isso responde à pergunta silenciosa de quem usa, \"e agora, o que está rolando?\"."
                    },
                    {
                        "type": "text",
                        "value": "## 2. Correspondência entre o sistema e o mundo real\n\nA interface deve **falar a língua das pessoas**, com palavras, expressões e conceitos que elas já conhecem, e não o jargão técnico de quem construiu o sistema. A informação deve aparecer numa ordem natural e lógica.\n\n- **Ruim**: uma mensagem diz \"Erro 0x80004005: exceção não tratada no módulo de persistência\". Para quem usa, isso não quer dizer nada.\n- **Bom**: \"Não foi possível salvar suas alterações. Verifique sua conexão e tente de novo.\"\n\nEsse princípio também explica por que os ícones imitam objetos do mundo real: a **lixeira** para descartar, o **carrinho** para compras, o **envelope** para e-mail. Eles funcionam porque a pessoa já sabe, da vida real, o que aquilo significa."
                    },
                    {
                        "type": "text",
                        "value": "## 3. Controle e liberdade do usuário\n\nAs pessoas erram, mudam de ideia e clicam em coisas por engano. Por isso a interface precisa oferecer uma **saída de emergência** clara: um jeito fácil de voltar atrás sem se sentir presa. Os melhores exemplos são o **desfazer** e o **cancelar**.\n\n- **Ruim**: você exclui um e-mail por acidente e não há como recuperá-lo; ou entra numa etapa do cadastro e não existe botão de voltar.\n- **Bom**: o Gmail mostra \"Mensagem enviada. Desfazer\" por alguns segundos, permitindo cancelar o envio. Editores de texto têm o onipresente \"desfazer\" (Ctrl+Z).\n\nDar controle é dizer para a pessoa: \"pode explorar sem medo, se errar dá para voltar\". Isso reduz a ansiedade e incentiva o uso."
                    },
                    {
                        "type": "text",
                        "value": "## 4. Consistência e padrões\n\nAs pessoas não deveriam ter que se perguntar se palavras, situações ou ações diferentes significam a mesma coisa. A interface deve ser **consistente consigo mesma** e seguir os **padrões** que o mundo já usa. Existe até uma lei para isso, a **Lei de Jakob**: as pessoas passam a maior parte do tempo em outros sites e esperam que o seu funcione como aqueles que já conhecem.\n\n- **Ruim**: em uma tela o botão de confirmar se chama \"OK\", em outra \"Salvar\", em outra \"Aplicar\"; o carrinho ora é um ícone de sacola, ora a palavra \"cesta\". A cada tela a pessoa precisa reaprender.\n- **Bom**: o mesmo termo e o mesmo ícone para a mesma ação em todo o produto; o logo no canto superior esquerdo sempre leva à página inicial, porque é assim que a web inteira funciona.\n\nSeguir convenções não é falta de criatividade: é respeitar o que a pessoa já aprendeu em todos os outros apps que usa."
                    },
                    {
                        "type": "text",
                        "value": "## 5. Prevenção de erros\n\nBoas mensagens de erro ajudam, mas melhor ainda é **impedir que o erro aconteça** desde o começo. Em vez de só avisar depois que a pessoa tropeçou, o design cuidadoso tira a pedra do caminho.\n\n- **Ruim**: um campo de data aceita qualquer texto e só depois de enviar avisa que \"31/02/2026\" não existe.\n- **Bom**: um seletor de calendário que só deixa escolher datas válidas; um botão \"Excluir conta\" que pede confirmação antes de fazer algo irreversível; um formulário que desabilita o botão de enviar enquanto faltam campos obrigatórios.\n\nHá dois caminhos para prevenir erros: **eliminar** as condições que levam ao erro (como o calendário que só oferece datas reais) ou **confirmar** antes de ações perigosas (\"Tem certeza que deseja excluir?\"). Prevenir custa menos, para quem usa e para o produto, do que remediar."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que são as 10 heurísticas de Nielsen?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Princípios de bom senso para avaliar e melhorar a usabilidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma linguagem de programação voltada à criação de animações.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um conjunto de cores padronizadas obrigatórias para aplicativos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Leis que tornam um site ilegal caso não sejam seguidas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Mostrar \"enviando...\", depois \"enviada\" e por fim \"lida\" em um app de mensagens é um exemplo de qual heurística?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Visibilidade do status do sistema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Prevenção de erros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Design estético e minimalista.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ajuda e documentação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao dar erro, um app exibe \"Exceção 0x80004005 no módulo de persistência\". Qual heurística está sendo violada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Correspondência com o mundo real, pois o erro usa jargão técnico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Controle e liberdade do usuário, pois falta um botão para voltar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Visibilidade do status do sistema, pois o app não informou nada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consistência e padrões, pois o texto de erro mudou de lugar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário arquiva uma conversa por engano. Qual recurso melhor atende à heurística de controle e liberdade do usuário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Exibir um aviso de Conversa arquivada com opção de desfazer na hora.",
                                "isCorrect": true
                            },
                            {
                                "text": "Exibir uma barra de progresso enquanto a conversa é arquivada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Disponibilizar um manual explicando o passo a passo para arquivar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloquear a opção de arquivar qualquer conversa no aplicativo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe percebe que muitos usuários digitam datas impossíveis (como 31/02) num campo de texto livre. Trocar o campo por um calendário que só permite datas válidas ilustra qual heurística, e por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Prevenção de erros: elimina a condição que causaria o erro, em vez de avisar depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ajudar a reconhecer e recuperar de erros, pois melhora a mensagem exibida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Flexibilidade e eficiência de uso, pois cria um atalho para quem já é experiente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Correspondência com o mundo real, pois um calendário existe fora da tela também.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "As 10 heurísticas de Nielsen (parte 2)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# As 10 heurísticas de Nielsen (parte 2)\n\nNa aula anterior vimos as cinco primeiras heurísticas: visibilidade do status, correspondência com o mundo real, controle e liberdade, consistência e prevenção de erros. Agora vamos fechar a lista com as **cinco últimas**. Assim como as anteriores, cada uma é uma regra de bom senso, com exemplos de como acertar e como errar."
                    },
                    {
                        "type": "text",
                        "value": "## 6. Reconhecimento em vez de memorização\n\nA interface deve **reduzir o esforço de memória** de quem usa, deixando as opções, ações e informações **visíveis**. É mais fácil **reconhecer** algo que está na tela do que **lembrar** de cor. A pessoa não deveria precisar guardar na cabeça uma informação de uma tela para usar em outra.\n\n- **Ruim**: um sistema pede que você **decore** um código de produto em uma tela para digitá-lo de memória na tela seguinte.\n- **Bom**: um campo de busca que **mostra sugestões** enquanto você digita; um menu que lista as opções em vez de exigir que você saiba o comando; o histórico de endereços já visitados num app de transporte.\n\nTodo menu visível, toda lista de opções e todo autocompletar existem para que a pessoa **reconheça** o que quer, em vez de ter que lembrar."
                    },
                    {
                        "type": "text",
                        "value": "## 7. Flexibilidade e eficiência de uso\n\nUma boa interface serve **tanto ao iniciante quanto ao experiente**. Para isso, oferece **atalhos** e aceleradores que ficam discretos (quase invisíveis para quem está começando), mas que deixam quem já domina o produto muito mais rápido.\n\n- **Ruim**: um sistema que obriga **todo mundo**, sempre, a percorrer o mesmo caminho longo, sem nenhum atalho, punindo quem já é experiente.\n- **Bom**: atalhos de teclado (como Ctrl+C e Ctrl+V), a opção de **salvar favoritos**, um botão de \"repetir último pedido\" num app de comida, modelos prontos para tarefas repetidas.\n\nA ideia é não deixar o iniciante perdido nem o experiente entediado: o caminho simples fica à vista, e os atalhos ficam disponíveis para quem quiser."
                    },
                    {
                        "type": "text",
                        "value": "## 8. Design estético e minimalista\n\nAs telas não devem conter informação **irrelevante ou raramente necessária**. Cada elemento a mais compete por atenção com os elementos importantes e enfraquece todos eles. Menos ruído significa mais foco no que importa.\n\n- **Ruim**: uma tela de checkout coberta de banners, promoções piscando, campos opcionais e textos longos, onde o botão \"Finalizar compra\" se perde no meio da bagunça.\n- **Bom**: a página inicial de busca do Google, com praticamente só o campo de busca; um checkout que mostra apenas o essencial para pagar, deixando o resto de lado.\n\nMinimalista não quer dizer vazio ou sem personalidade: quer dizer que **cada coisa na tela tem um motivo para estar ali**. Na dúvida, tirar costuma ajudar mais do que acrescentar."
                    },
                    {
                        "type": "text",
                        "value": "## 9. Ajudar a reconhecer, diagnosticar e recuperar de erros\n\nQuando um erro acontece mesmo assim, a mensagem precisa ajudar a pessoa a resolver. Uma boa mensagem de erro tem três qualidades: é escrita em **linguagem simples** (sem códigos), **diz exatamente qual é o problema** e **sugere uma saída**.\n\n- **Ruim**: \"Erro. Operação inválida.\" — não diz o que deu errado nem o que fazer.\n- **Bom**: \"Sua senha precisa de pelo menos 8 caracteres e um número. Você digitou 6.\" — a pessoa entende o problema e sabe como corrigir.\n\nRepare a diferença desta heurística para a prevenção de erros (a número 5): lá o objetivo é **evitar** o erro; aqui, já que ele aconteceu, o objetivo é **ajudar a sair dele** com o menor sofrimento possível."
                    },
                    {
                        "type": "text",
                        "value": "## 10. Ajuda e documentação\n\nO ideal é que a interface seja tão clara que **não precise de explicação**. Mas, quando a ajuda é necessária, ela deve ser **fácil de encontrar**, focada na tarefa da pessoa, com **passos concretos** e sem ser um calhamaço.\n\n- **Ruim**: um manual gigante, escrito em linguagem técnica, difícil de pesquisar, onde a pessoa se perde antes de achar a resposta.\n- **Bom**: uma central de ajuda com busca, artigos curtos do tipo \"Como cancelar minha assinatura\" com o passo a passo; dicas de contexto que aparecem exatamente onde surge a dúvida.\n\nA ajuda é a **rede de segurança**, não o conserto de uma interface confusa. Se todo mundo precisa recorrer ao manual para uma tarefa simples, o problema está na interface, não na documentação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um campo de busca que mostra sugestões enquanto você digita atende principalmente a qual heurística?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reconhecimento em vez de memorização.",
                                "isCorrect": true
                            },
                            {
                                "text": "Prevenção de erros do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ajuda e documentação do produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Controle e liberdade do usuário na interface.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A página inicial do Google, quase vazia e com foco no campo de busca, é um exemplo clássico de qual heurística?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Design estético e minimalista.",
                                "isCorrect": true
                            },
                            {
                                "text": "Visibilidade do status do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Flexibilidade e eficiência de uso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Correspondência com o mundo real.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao errar o login, o sistema mostra apenas \"Erro. Operação inválida.\". Segundo a heurística de ajudar a recuperar de erros, o que faltou na mensagem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma explicação simples do problema com uma sugestão de correção.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um atalho de teclado disponível para usuários avançados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma barra de progresso mostrando o andamento do carregamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um manual completo anexado diretamente à tela de erro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app de delivery adiciona um botão \"Repetir último pedido\" para quem sempre pede a mesma coisa, sem atrapalhar quem prefere montar um pedido novo. Qual heurística isso ilustra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Flexibilidade e eficiência de uso: um atalho para quem repete o pedido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Prevenção de erros, pois evita que o cliente erre ao montar o pedido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Design minimalista, pois reduz elementos visuais desnecessários na tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Visibilidade do status, pois mostra em tempo real o andamento do pedido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa tela de cadastro há: (a) um botão de enviar desabilitado até preencher tudo e (b) a mensagem \"A senha precisa de 8 caracteres; você digitou 6\" quando algo falha. Qual heurística cada recurso representa, respectivamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "(a) Prevenção de erros e (b) recuperação de erros.",
                                "isCorrect": true
                            },
                            {
                                "text": "(a) Recuperação de erros e (b) prevenção de erros, na ordem trocada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos ilustram a visibilidade do status do sistema em ação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos ilustram apenas a heurística de ajuda e documentação.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Avaliação heurística",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Avaliação heurística\n\nAgora que você conhece as dez heurísticas, o que fazer com elas? A resposta é a **avaliação heurística**: um método rápido e barato para **encontrar problemas de usabilidade** em uma interface, usando as heurísticas como uma espécie de checklist de bom senso.\n\nUm pequeno grupo de avaliadores examina a interface, tela por tela, e vai anotando tudo o que **fere** alguma heurística. A grande vantagem é que ela **não precisa de usuários**: dá para fazer com a própria equipe, em pouco tempo, ainda no rascunho do produto. Por isso é chamada de método de **usabilidade de baixo custo**."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Nº\", \"Heurística\"], [\"1\", \"Visibilidade do status do sistema\"], [\"2\", \"Correspondência entre o sistema e o mundo real\"], [\"3\", \"Controle e liberdade do usuário\"], [\"4\", \"Consistência e padrões\"], [\"5\", \"Prevenção de erros\"], [\"6\", \"Reconhecimento em vez de memorização\"], [\"7\", \"Flexibilidade e eficiência de uso\"], [\"8\", \"Design estético e minimalista\"], [\"9\", \"Ajudar a reconhecer, diagnosticar e recuperar de erros\"], [\"10\", \"Ajuda e documentação\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como fazer, passo a passo\n\nA avaliação heurística tem um roteiro simples:\n\n1. **Reúna alguns avaliadores.** O recomendado é usar de **3 a 5 pessoas**. Uma só escapa de muita coisa; um pequeno grupo, somando os olhares, encontra a maioria dos problemas. Mais de cinco costuma trazer pouco retorno para o esforço.\n2. **Cada avaliador percorre a interface sozinho**, primeiro. Avaliar em separado evita que um influencie o outro; a discussão em grupo vem só depois.\n3. **Percorra as tarefas e telas principais**, comparando cada uma com as dez heurísticas: \"o status está visível? a linguagem é a do usuário? dá para desfazer?\".\n4. **Anote cada problema** encontrado, apontando **qual heurística** ele fere e **onde** ele aparece.\n5. **Junte as listas** de todos e some os achados numa lista única.\n\nO resultado é uma lista de problemas concretos, cada um ligado a uma heurística, pronta para orientar as correções."
                    },
                    {
                        "type": "text",
                        "value": "## Classifique a gravidade\n\nNem todo problema tem o mesmo peso. Encontrar 40 problemas não ajuda muito se você não sabe quais atacar primeiro. Por isso, cada problema recebe uma nota de **gravidade**, que costuma pesar três coisas: com que **frequência** ele acontece, quão **impactante** ele é quando acontece e quão **persistente** ele é (se atrapalha uma vez ou sempre).\n\nNa prática, os problemas vão de **cosméticos** (um desalinhamento que quase ninguém percebe) a **catastróficos** (um erro que impede a pessoa de concluir a compra). Priorizar significa gastar o esforço da equipe onde ele mais melhora a experiência: primeiro os catastróficos, depois os graves, e assim por diante."
                    },
                    {
                        "type": "text",
                        "value": "## Vantagens e limites\n\nA avaliação heurística é **rápida, barata e não precisa de usuários** — dá para fazer numa tarde, antes mesmo de ter o produto pronto. É ótima para **pegar problemas óbvios** cedo.\n\nMas ela tem um limite importante: **quem avalia não é o usuário real**. Especialistas conhecem as heurísticas e preveem muitos problemas, mas também podem **apontar coisas que não incomodam ninguém** na vida real, ou **deixar passar** dificuldades que só apareceriam com gente de verdade usando. Por isso a avaliação heurística **não substitui** o teste com usuários: as duas se completam. O caminho recomendado é usar a avaliação heurística para limpar os problemas evidentes e, depois, o **teste de usabilidade** (nossa próxima aula) para descobrir o que só a realidade revela."
                    },
                    {
                        "type": "quote",
                        "value": "**Resumo:** a **avaliação heurística** é uma inspeção feita por **3 a 5 avaliadores** que percorrem a interface, sozinhos primeiro, comparando cada tela com as **10 heurísticas** e anotando o que as fere, com o nome da heurística e a **gravidade**. É barata e não usa usuários, mas **não substitui** os testes de usabilidade: uma acha problemas previsíveis; a outra revela os reais."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma avaliação heurística?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Inspeção em que avaliadores comparam a interface com as heurísticas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Teste em que muitos usuários reais navegam livremente pelo site.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pesquisa de opinião aplicada ao público-alvo por meio de questionário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Medição automática da velocidade de carregamento das telas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quantos avaliadores costumam ser recomendados para uma avaliação heurística?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "De 3 a 5 avaliadores, o bastante para achar a maioria dos problemas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas 1 avaliador, para evitar divergências de opinião entre pessoas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pelo menos 50 avaliadores, para alcançar significância estatística.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há limite: quanto mais avaliadores, melhor é o resultado final.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que, na avaliação heurística, cada avaliador deve percorrer a interface sozinho antes de discutir com os outros?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Para que a opinião de um avaliador não influencie a dos outros.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque as regras proíbem que avaliadores conversem entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o sistema permite acesso de apenas um avaliador por vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso torna a avaliação de propósito mais lenta e detalhada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma avaliação encontrou 40 problemas: alguns são pequenos desalinhamentos e um impede finalizar a compra. Qual é o melhor próximo passo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Classificar por gravidade e corrigir primeiro o que impede a compra.",
                                "isCorrect": true
                            },
                            {
                                "text": "Corrigir na ordem em que foram anotados, do primeiro ao último.",
                                "isCorrect": false
                            },
                            {
                                "text": "Começar pelos desalinhamentos, por serem mais fáceis de corrigir.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descartar a lista, pois 40 problemas é sinal de avaliação malfeita.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de uma avaliação heurística que \"limpou\" os problemas óbvios, o time quer garantir a usabilidade. Qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A avaliação heurística não substitui o teste com usuários reais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Se a avaliação heurística foi feita, testar com usuários é desnecessário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Avaliadores especialistas enxergam tudo o que usuários reais enxergariam.",
                                "isCorrect": false
                            },
                            {
                                "text": "Testes com usuários e avaliação heurística medem exatamente a mesma coisa.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Testes de usabilidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Testes de usabilidade\n\nA avaliação heurística usa a opinião de especialistas. O **teste de usabilidade** vai à fonte: coloca **pessoas reais** para usar o produto e **observa o que elas fazem**. É a forma mais direta de descobrir onde a interface realmente trava, porque não depende de achismo — depende de comportamento.\n\nA mecânica é simples: você dá a uma pessoa representativa do seu público uma **tarefa** (\"compre um par de tênis tamanho 40\") e fica **observando** enquanto ela tenta realizá-la. Onde ela hesita, se perde, clica no lugar errado ou desiste, ali está um problema de usabilidade."
                    },
                    {
                        "type": "text",
                        "value": "## Moderado x não moderado\n\nHá duas grandes formas de rodar um teste de usabilidade:\n\n- **Moderado**: há um **facilitador** acompanhando a sessão (presencialmente ou por chamada de vídeo). Ele passa as tarefas, observa e pode **fazer perguntas** no momento (\"o que você esperava que acontecesse ao clicar aí?\"). Rende insights mais ricos e permite investigar a confusão na hora, mas custa mais tempo e exige alguém conduzindo com cuidado para não influenciar.\n- **Não moderado**: a pessoa realiza as tarefas **sozinha**, geralmente com uma ferramenta que grava a tela e os cliques, sem ninguém ao lado em tempo real. É mais **rápido, barato e escalável** (dá para coletar muitas sessões) e o ambiente fica mais natural, mas você **não pode perguntar nada** nem esclarecer uma dúvida que surja.\n\nNenhum é \"melhor\" em absoluto: o moderado brilha quando você quer **entender o porquê**; o não moderado, quando quer **muitas sessões** rápidas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Moderado\", \"Não moderado\"], [\"Facilitador presente\", \"Sim, conduz a sessão\", \"Não, a pessoa faz sozinha\"], [\"Perguntas na hora\", \"Pode perguntar e investigar\", \"Não dá para perguntar\"], [\"Custo e velocidade\", \"Mais caro e lento\", \"Mais barato e rápido\"], [\"Melhor para\", \"Entender o porquê a fundo\", \"Coletar muitas sessões\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Com quantas pessoas testar?\n\nAqui vem a parte que mais surpreende quem está começando: **não é preciso muita gente**. Para um teste que busca **descobrir problemas** (e não gerar estatísticas), cerca de **5 pessoas por rodada** já revelam a grande maioria dos problemas de usabilidade. As primeiras pessoas tropeçam praticamente nos mesmos pontos e, a partir daí, você passa a ver repetição, não novidade.\n\nO segredo não é testar com muita gente de uma vez, e sim **testar em rodadas**: teste com cinco, **conserte** os problemas encontrados e teste de novo com outras cinco na versão melhorada. Esse ciclo **testar, corrigir, testar** melhora o produto muito mais do que uma única bateria com 50 pessoas. (Estudos que buscam **números** precisos, como taxas de sucesso, exigem grupos bem maiores, mas esse é outro tipo de pesquisa.)"
                    },
                    {
                        "type": "text",
                        "value": "## Observe o comportamento, não peça opinião\n\nEste é o princípio mais importante de todos: em um teste de usabilidade, você **observa o que a pessoa faz**, não pergunta se ela gostou. O motivo é conhecido por quem pesquisa: **o que as pessoas dizem e o que elas fazem raramente batem**. Alguém pode jurar que \"achou fácil\" logo depois de levar cinco minutos e três tentativas para concluir a tarefa.\n\nNa prática, isso significa:\n\n- **Dê tarefas reais, não peça opinião.** Em vez de \"você acha esse menu intuitivo?\", peça \"encontre a política de troca\" e veja se a pessoa consegue.\n- **Peça para a pessoa pensar em voz alta.** Narrar o que está pensando (\"estou procurando o carrinho, achei que estaria aqui em cima\") revela onde a expectativa dela bate ou não com a interface.\n- **Não ajude e não induza.** Segure a vontade de socorrer: se você aponta o caminho, perde justamente o problema. E evite perguntas que já entregam a resposta (\"você não viu o botão azul ali?\").\n- **Cuidado com as tarefas que dão a dica.** Não use na tarefa as mesmas palavras dos botões da tela, senão você testa a leitura, não a usabilidade.\n\nTestar usabilidade é diferente de um **grupo de discussão**, onde se coletam opiniões. Opinião é útil para outras coisas; para saber se a interface funciona, o que vale é **ver a pessoa usando**."
                    },
                    {
                        "type": "quote",
                        "value": "**Resumo:** o **teste de usabilidade** coloca **pessoas reais** para realizar **tarefas** enquanto você **observa o comportamento** (não pede opinião). Pode ser **moderado** (com facilitador, para entender o porquê) ou **não moderado** (sozinho, rápido e escalável). Cerca de **5 pessoas por rodada** revelam a maioria dos problemas, e o ganho vem de **testar, corrigir e testar de novo**. Regra de ouro: o que as pessoas fazem vale mais do que o que elas dizem."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é, essencialmente, um teste de usabilidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Observar pessoas reais tentando realizar tarefas no produto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Perguntar aos usuários, por questionário, o que acham do visual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Medir automaticamente quantos cliques o servidor processa por segundo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reunir especialistas para comparar a interface com as heurísticas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para um teste de usabilidade que busca descobrir problemas, com quantas pessoas por rodada costuma bastar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cerca de 5 pessoas já revelam a maioria dos problemas.",
                                "isCorrect": true
                            },
                            {
                                "text": "É necessário reunir no mínimo 100 pessoas para o teste completo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Basta testar com exatamente 1 pessoa apenas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pelo menos metade dos usuários do produto inteiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante um teste, o facilitador quer saber se o menu é fácil de usar. Qual abordagem segue o princípio correto do teste de usabilidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pedir para encontrar a política de troca e observar, sem ajudar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Perguntar diretamente se a pessoa acha aquele menu intuitivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apontar onde fica o item e perguntar se a pessoa concorda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pedir para a pessoa dar uma nota de 0 a 10 para o visual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer coletar muitas sessões rapidamente e com baixo custo, sem precisar investigar cada dúvida a fundo. Qual formato de teste é mais adequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Teste não moderado: a pessoa faz tudo sozinha e a tela é gravada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Teste moderado: um facilitador acompanha e conduz cada sessão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Grupo de discussão: participantes conversam e dão suas opiniões.",
                                "isCorrect": false
                            },
                            {
                                "text": "Avaliação heurística: especialistas inspecionam a interface sozinhos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No fim do teste, uma participante diz que \"achou tudo muito fácil\", mas você a viu levar vários minutos e duas tentativas para achar o carrinho. Como interpretar isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Vale o comportamento: ela teve dificuldade real, apesar do que disse.",
                                "isCorrect": true
                            },
                            {
                                "text": "Vale a opinião dela: se disse que foi fácil, não há problema a corrigir.",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste foi inválido, porque a fala e o comportamento se contradizem.",
                                "isCorrect": false
                            },
                            {
                                "text": "A dificuldade foi culpa da participante, não da interface testada.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Acessibilidade e design inclusivo",
        "aulas": [
            {
                "titulo": "Por que acessibilidade importa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que acessibilidade importa\n\nVocê já aprendeu a estruturar páginas, estilizá-las e pensá-las como produto. Agora vamos falar de algo que separa um trabalho bem-feito de um trabalho de verdade profissional: **acessibilidade**. A ideia é simples de enunciar e muda a forma como você projeta: uma interface só está pronta quando **todas as pessoas conseguem usá-la** — inclusive quem tem alguma deficiência.\n\n\"Todas as pessoas\" não é força de expressão. Pense em quem vai chegar à sua tela:\n\n- **Deficiência visual**: pessoas cegas (que usam leitor de tela), com baixa visão (que ampliam a tela ou precisam de alto contraste) ou com **daltonismo** (que não distinguem certas cores, como verde e vermelho).\n- **Deficiência auditiva**: pessoas surdas ou com perda auditiva, que dependem de **legendas** e transcrições em vídeos e áudios.\n- **Deficiência motora**: pessoas que não conseguem usar o mouse com precisão, ou que não usam mouse, e navegam pelo **teclado** ou por outras tecnologias assistivas.\n- **Deficiência cognitiva ou neurológica**: pessoas com dislexia, TDAH, autismo ou baixa escolaridade, que se beneficiam de **linguagem clara**, layout previsível e menos distração.\n\nRepare que não é um público pequeno nem distante: é gente que usa o seu app todos os dias, muitas vezes sem você perceber."
                    },
                    {
                        "type": "quote",
                        "value": "**Acessibilidade digital** (às vezes abreviada como **a11y** — um \"a\", 11 letras, um \"y\") é a prática de projetar produtos que possam ser **percebidos, operados e compreendidos** por qualquer pessoa, independentemente de deficiência, dispositivo ou contexto. Não é um recurso extra colado no fim: é uma qualidade da própria interface, como desempenho ou segurança."
                    },
                    {
                        "type": "text",
                        "value": "## Um direito garantido por lei\n\nAcessibilidade não é favor nem capricho de quem tem tempo sobrando. É um **direito** — e, em muitos casos, uma **obrigação legal**.\n\n- No Brasil, a **LBI** (Lei Brasileira de Inclusão da Pessoa com Deficiência, Lei nº 13.146/2015) determina que sites e aplicativos sejam acessíveis. Descumprir não é só falta de consideração com o usuário: é descumprir a lei.\n- O governo federal segue o **e-MAG** (Modelo de Acessibilidade em Governo Eletrônico), um guia baseado nos padrões internacionais para os sites públicos.\n- No mundo todo, a referência técnica é a **WCAG** (_Web Content Accessibility Guidelines_), publicada pelo **W3C**, o mesmo consórcio que cuida dos padrões da web. É nela que os próximos assuntos deste módulo se apoiam.\n\nGuarde a ideia central: tratar acessibilidade como opcional é como construir um prédio sem rampa nem elevador e dizer que \"quem anda resolve\". A entrada precisa servir para todo mundo."
                    },
                    {
                        "type": "text",
                        "value": "## Todos ganham: o efeito meio-fio\n\nExiste um mito de que acessibilidade \"atrapalha os outros usuários\" ou serve a pouca gente. A realidade é o contrário, e tem até nome: o **efeito meio-fio** (_curb-cut effect_).\n\nAquelas **rampinhas na esquina da calçada** foram criadas para cadeirantes. Mas quem se beneficia delas? Quem empurra carrinho de bebê, quem puxa mala com rodinha, o entregador com o carrinho de caixas, a pessoa de muleta, o ciclista. Uma solução pensada para uma necessidade específica acabou **melhorando a vida de todo mundo**.\n\nNo digital é igual. **Legendas** foram feitas para pessoas surdas — e são usadas por quem assiste a vídeo no transporte lotado sem fone, por quem estuda um idioma, por quem está num quarto com bebê dormindo. **Alto contraste** ajuda quem tem baixa visão — e também você, tentando ler a tela do celular sob o sol forte.\n\nIsso revela uma verdade poderosa: a **deficiência muitas vezes é uma questão de contexto**, e não só uma condição permanente da pessoa."
                    },
                    {
                        "type": "text",
                        "value": "## Permanente, temporária e situacional\n\nO **design inclusivo** parte justamente dessa ideia de contexto. Uma mesma limitação pode aparecer de três formas, e projetar para uma delas costuma resolver as outras:\n\n- **Permanente**: a condição faz parte da vida da pessoa. Ex.: alguém com **um só braço**.\n- **Temporária**: dura um período e passa. Ex.: alguém com o **braço quebrado e engessado** por algumas semanas.\n- **Situacional**: depende do momento e do ambiente. Ex.: um **pai segurando o bebê no colo**, com só uma mão livre para o celular.\n\nNos três casos, a pessoa está usando o produto com **uma mão só**. Se a sua interface funciona bem com uma mão — botões alcançáveis, nada que exija dois toques simultâneos —, você atende os três de uma vez. O mesmo raciocínio vale para a visão (cegueira permanente, uma catarata temporária, o sol forte na tela agora) e para a audição (surdez, uma otite, um bar barulhento).\n\nA lição do design inclusivo é essa: **não existe \"usuário médio\"**. Projetar para a diversidade das pessoas não restringe o público — amplia."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Habilidade\",\"Permanente\",\"Temporária\",\"Situacional\"],[\"Usar as mãos\",\"Ter um só braço\",\"Braço quebrado e engessado\",\"Segurar o bebê no colo\"],[\"Ver\",\"Cegueira\",\"Catarata em recuperação\",\"Sol forte batendo na tela\"],[\"Ouvir\",\"Surdez\",\"Otite, ouvido tampado\",\"Estar num bar barulhento\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que melhor descreve acessibilidade digital?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Projetar produtos que qualquer pessoa consiga perceber, operar e entender.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixar a interface bonita e moderna, priorizando o visual sobre a usabilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Oferecer um recurso extra que só as empresas grandes precisam disponibilizar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazer o site carregar mais rápido em qualquer tipo de conexão de internet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Legendas em vídeos foram criadas pensando em pessoas surdas. Segundo o \"efeito meio-fio\", quem mais acaba se beneficiando delas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quem assiste sem fone em lugar barulhento, quem estuda idioma e mais gente no dia a dia.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só pessoas surdas; para o resto do público, as legendas apenas atrapalham a leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só quem tem baixa visão, já que as legendas aumentam as letras exibidas na tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só a equipe de desenvolvimento, para conferir se o vídeo terminou de carregar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa quebrou o braço dominante e vai ficar com ele engessado por seis semanas, usando o celular só com a outra mão. No design inclusivo, esse tipo de limitação é classificado como:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Temporária, pois vai durar só até o braço sarar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Permanente, pois a fratura deixa sequela para sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Situacional, pois depende só do local onde a pessoa está.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não conta como limitação, já que vai passar em semanas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pai está de pé no ônibus, segurando o filho no colo com um braço e o celular com a mão livre. Que tipo de limitação, no espectro do design inclusivo, esse cenário representa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Situacional, porque depende do momento e do contexto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Permanente, porque ter filho pequeno dura a vida toda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Temporária, pois em algumas semanas o bebê já anda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma: segurar o próprio filho no colo não é limitação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma reunião, alguém diz: \"acessibilidade é um recurso extra opcional; só vale a pena se sobrar tempo e orçamento\". Qual resposta corrige melhor essa visão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É um direito, exigido por lei no Brasil (LBI), e costuma beneficiar todos os usuários.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele está certo: como poucas pessoas têm deficiência, dá para deixar para depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "Acessibilidade só se aplica a sites do governo; empresas privadas podem ignorar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O melhor é criar um site separado \"para deficientes\" e manter o principal como está.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Os 4 princípios da WCAG",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Os 4 princípios da WCAG\n\nNa aula anterior falamos que a referência técnica de acessibilidade no mundo é a **WCAG** (_Web Content Accessibility Guidelines_), do W3C. Agora vamos abrir essa sigla e ver o que ela realmente pede — de um jeito que cabe na cabeça.\n\nA WCAG é grande e cheia de critérios, mas toda ela se organiza em **quatro princípios**. Em inglês, as iniciais formam a palavra **POUR** (\"despejar\"), o que ajuda a lembrar. Em português, os quatro princípios são:\n\n- **Perceptível**\n- **Operável**\n- **Compreensível**\n- **Robusto**\n\nA WCAG ainda tem três **níveis de conformidade**: **A** (o básico), **AA** (o padrão que a maioria das leis e empresas adota como meta) e **AAA** (o mais rigoroso). Quando alguém diz \"nosso site é AA\", está falando desses níveis. Na prática, mire no **AA**. Vamos ver cada princípio com exemplos."
                    },
                    {
                        "type": "text",
                        "value": "## Perceptível: dá para notar com os sentidos?\n\nA informação e os elementos da interface precisam ser apresentados de formas que as pessoas **consigam perceber** — nem todo mundo enxerga a tela ou ouve o áudio.\n\nO que esse princípio pede, na prática:\n\n- **Texto alternativo** (`alt`) nas imagens, para que quem usa leitor de tela saiba o que a imagem mostra.\n- **Legendas e transcrições** em vídeos e áudios, para quem não ouve.\n- **Contraste** suficiente entre texto e fundo, para quem tem baixa visão (assunto da próxima aula).\n- **Não passar informação só pela cor**, porque quem é daltônico pode não captar a diferença.\n\nSe a informação existe, mas chega por um único sentido, parte do público fica de fora. Perceptível é garantir mais de um caminho para a mesma informação."
                    },
                    {
                        "type": "text",
                        "value": "## Operável: dá para usar e navegar?\n\nDe nada adianta a pessoa **perceber** os elementos se ela não consegue **operá-los**. Todo controle — botão, link, campo, menu — precisa funcionar para quem não usa mouse.\n\nO que esse princípio pede:\n\n- **Navegação por teclado**: dá para chegar a tudo e acionar tudo usando só o teclado (assunto da última aula deste módulo).\n- **Tempo suficiente**: não expulsar a pessoa de um formulário por ela demorar, ou oferecer um jeito de reiniciar o tempo.\n- **Nada que possa causar convulsão**: evitar flashes piscando muitas vezes por segundo.\n- **Ajudar a navegar**: títulos claros, ordem previsível e um jeito de \"pular para o conteúdo\".\n\nOperável é a diferença entre ver o botão e conseguir apertá-lo."
                    },
                    {
                        "type": "text",
                        "value": "## Compreensível: dá para entender?\n\nA interface pode ser perceptível e operável e, ainda assim, **confundir**. O terceiro princípio cuida disso: o conteúdo e o funcionamento precisam ser **compreensíveis**.\n\nO que esse princípio pede:\n\n- **Linguagem clara**: textos diretos, sem jargão desnecessário; bom para quem tem dislexia, baixa escolaridade ou só está com pressa.\n- **Previsibilidade**: a interface se comporta de forma consistente; o mesmo botão faz a mesma coisa em todas as telas, e nada muda sozinho sem aviso.\n- **Ajuda a evitar e corrigir erros**: rótulos claros nos campos e **mensagens de erro que dizem o que aconteceu e como resolver** — não um \"erro\" seco.\n\nCompreensível é o usuário sempre saber onde está, o que aquilo faz e o que fazer em seguida."
                    },
                    {
                        "type": "text",
                        "value": "## Robusto: funciona com as tecnologias de apoio?\n\nPor fim, o conteúdo precisa ser **robusto** o bastante para funcionar em diferentes navegadores, dispositivos e, principalmente, com as **tecnologias assistivas** — como os leitores de tela.\n\nO que esse princípio pede:\n\n- **HTML semântico**: usar a etiqueta certa para cada coisa. Um `<button>` é anunciado como botão, recebe foco e responde ao teclado de graça; uma `<div>` disfarçada de botão não faz nada disso.\n- **Nome, papel e valor** (_name, role, value_): cada componente precisa expor, de forma que a máquina entenda, **o que ele é** (um checkbox), **como se chama** (\"Aceito os termos\") e **em que estado está** (marcado ou não).\n\nRobusto é escrever o código de um jeito que o leitor de tela consiga \"ler\" a interface corretamente. Na dúvida, prefira o elemento HTML nativo: ele já vem acessível."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio\",\"A pergunta que ele faz\",\"Exemplo do que resolve\"],[\"Perceptível\",\"A pessoa consegue notar a informação?\",\"alt em imagens, legendas, contraste\"],[\"Operável\",\"A pessoa consegue usar e navegar?\",\"Funciona no teclado, sem flashes\"],[\"Compreensível\",\"A pessoa consegue entender?\",\"Linguagem clara, erros explicados\"],[\"Robusto\",\"Funciona com leitor de tela e outros?\",\"HTML semântico, nome/papel/estado\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais são os quatro princípios da WCAG (o \"POUR\")?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Perceptível, Operável, Compreensível e Robusto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Prático, Original, Único e Responsivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Performance, Otimização, Usabilidade e Rapidez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Perceptível, Objetivo, Colorido e Rápido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Colocar texto alternativo (alt) nas imagens e legendas nos vídeos são exemplos de qual princípio da WCAG?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Perceptível.",
                                "isCorrect": true
                            },
                            {
                                "text": "Robusto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Operável.",
                                "isCorrect": false
                            },
                            {
                                "text": "Compreensível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um site, o formulário de cadastro só pode ser preenchido com o mouse. Usando apenas o teclado (Tab e Enter) não é possível chegar aos campos nem enviar. Qual princípio da WCAG está sendo violado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Operável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Perceptível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Compreensível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Robusto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um botão importante foi construído com uma `<div>` estilizada, sem semântica. O leitor de tela não o anuncia como botão nem informa seu estado. Qual princípio falha principalmente aqui?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Robusto, pois falta nome, papel e estado que a leitura de tela reconheça.",
                                "isCorrect": true
                            },
                            {
                                "text": "Perceptível, porque o botão não tem contraste suficiente com o fundo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Compreensível, porque o texto escrito dentro do botão está confuso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum: trocar `<div>` por `<button>` nunca muda nada na acessibilidade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site tem bom contraste e funciona todo pelo teclado. Mas as mensagens de erro dizem apenas \"dados inválidos\" (sem indicar o campo nem como corrigir), e a página reorganiza os blocos sozinha quando um campo recebe foco, confundindo o usuário. Qual princípio da WCAG esses problemas ferem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Compreensível, pela falta de clareza nos erros e da previsibilidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Perceptível, porque o site tem pouco contraste entre texto e fundo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Operável, porque o teclado não consegue navegar pelos campos do site.",
                                "isCorrect": false
                            },
                            {
                                "text": "Robusto, porque o HTML usado não é compatível com leitores de tela.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Contraste de cor e uso da cor",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Contraste de cor e uso da cor\n\nVocê escolheu uma paleta linda, aplicou um cinza-claro elegante no texto... e alguém reclama que não consegue ler. Bem-vindo ao tema do **contraste**, um dos ajustes de acessibilidade que mais aparece no dia a dia de quem faz interface.\n\n**Contraste** é a diferença de luminosidade entre duas cores — no nosso caso, entre o **texto** e o **fundo** atrás dele. Ele é medido como uma **razão**, que vai de **1:1** (as duas cores idênticas, ilegível) até **21:1** (preto puro sobre branco puro, o máximo possível).\n\nContraste baixo é uma barreira real para muita gente: pessoas com **baixa visão**, pessoas mais velhas (a visão perde contraste com a idade) e, de novo o efeito meio-fio, qualquer um lendo a tela **sob o sol**. A boa notícia é que a WCAG dá **números objetivos** para você acertar."
                    },
                    {
                        "type": "text",
                        "value": "## Os números que você precisa saber\n\nPara o nível **AA** (a meta usual), a WCAG define contrastes mínimos:\n\n- **4,5:1** para **texto normal** — o tamanho da maioria dos parágrafos e rótulos.\n- **3:1** para **texto grande** — a partir de cerca de **24px**, ou **18,66px** se estiver em **negrito**. Como a letra grande já é mais fácil de ler, ela pode ter um pouco menos de contraste.\n- **3:1** para **componentes de interface e elementos gráficos** — a borda de um campo, o traço de um ícone, o indicador de foco, as fatias de um gráfico. Não é só o texto que precisa contrastar; o que comunica também precisa.\n\nVocê não calcula isso na mão. Ferramentas de contraste (dentro do Figma, extensões de navegador, sites de _contrast checker_) recebem as duas cores e devolvem a razão, dizendo se passa ou não. No design com **tokens de cor**, o ideal é validar os pares texto/fundo da paleta uma vez e reusar com segurança."
                    },
                    {
                        "type": "code",
                        "value": "/* Ruim: cinza-claro sobre branco. Fica em torno de 2,3:1 e reprova. */\n.aviso-ruim {\n  color: #aaaaaa;        /* cinza claro */\n  background: #ffffff;   /* branco */\n}\n\n/* Bom: cinza-escuro sobre branco. Passa de 4,5:1 com folga. */\n.aviso-bom {\n  color: #595959;        /* cinza escuro */\n  background: #ffffff;   /* branco */\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Não dependa só da cor\n\nUma regra irmã do contraste, e igualmente importante: **nunca use a cor como o único jeito de passar uma informação**. Cerca de 1 em cada 12 homens tem algum tipo de **daltonismo** — a confusão entre **verde e vermelho** é a mais comum. Se a sua interface diz \"o que está em verde deu certo e o que está em vermelho deu errado\", essas pessoas simplesmente não recebem a mensagem.\n\nA solução é sempre **combinar a cor com um segundo sinal**:\n\n- **Links**: além da cor, deixe-os **sublinhados** para se destacarem do texto comum.\n- **Erros em formulário**: não pinte só a borda de vermelho; adicione um **ícone** e um **texto** (\"E-mail inválido\").\n- **Gráficos**: não distinga as linhas só pela cor; use **rótulos diretos**, **padrões** (tracejado, pontilhado) ou **marcadores** diferentes.\n- **Status**: um selo \"Pago / Pendente\" deve trazer a **palavra**, não só um pontinho colorido.\n\nPense no semáforo: ele funciona para daltônicos porque a **posição** das luzes é sempre a mesma, não só a cor. Faça o mesmo na tela: a cor reforça a informação, mas nunca é a única a carregá-la."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de elemento\",\"Contraste mínimo (AA)\",\"Exemplos\"],[\"Texto normal\",\"4,5:1\",\"Parágrafos, rótulos, legendas\"],[\"Texto grande (~24px, ou 18,66px em negrito)\",\"3:1\",\"Títulos, chamadas grandes\"],[\"Componentes e gráficos\",\"3:1\",\"Borda de campo, ícones, foco, fatias de gráfico\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** **contraste** é a diferença de luminosidade entre texto e fundo, medida como uma razão. Para o nível **AA**, mire em **4,5:1** para texto normal e **3:1** para texto grande, componentes de interface e gráficos. Use uma ferramenta de contraste para conferir, não confie no olho. E lembre da regra irmã: **não dependa só da cor** — combine-a sempre com texto, ícone, sublinhado ou padrão, para não deixar de fora quem tem daltonismo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo a WCAG (nível AA), qual é o contraste mínimo entre um texto normal e o fundo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "4,5:1",
                                "isCorrect": true
                            },
                            {
                                "text": "3:1",
                                "isCorrect": false
                            },
                            {
                                "text": "2:1",
                                "isCorrect": false
                            },
                            {
                                "text": "1:1",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o contraste mínimo (AA) exigido para texto grande e para componentes de interface, como a borda de um campo ou um ícone?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "3:1",
                                "isCorrect": true
                            },
                            {
                                "text": "4,5:1",
                                "isCorrect": false
                            },
                            {
                                "text": "7:1",
                                "isCorrect": false
                            },
                            {
                                "text": "1,5:1",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um formulário sinaliza os campos com erro pintando apenas a borda de vermelho. Por que isso é um problema de acessibilidade e como resolver?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Daltônicos podem não notar o vermelho; melhor somar ícone e texto ao erro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não é problema: todo mundo reconhece vermelho como sinal de erro na hora.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é o tom do vermelho; basta trocar por um vermelho mais claro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Basta deixar a borda vermelha mais grossa, pois isso já chama atenção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um título em negrito de 28px tem contraste de 3,2:1 com o fundo. Considerando o nível AA da WCAG, ele passa no critério de contraste?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim: como é texto grande, o mínimo é 3:1, e 3,2:1 passa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque todo texto exige pelo menos 4,5:1 de contraste.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque títulos grandes precisam de 7:1 de contraste.",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende da cor: vermelho reprovaria automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dashboard mostra três linhas em um gráfico, diferenciadas somente pela cor (vermelha, verde e laranja). Usuários daltônicos relatam que não conseguem distingui-las. Qual é a melhor correção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não depender só da cor: somar rótulos e traços diferentes em cada linha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar por cores mais vivas e saturadas, que chamam mais a atenção do olhar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar de forma igual a espessura das três linhas do gráfico inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixar o gráfico bem maior na tela, para facilitar a leitura de todos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Teclado, foco e leitores de tela",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Teclado, foco e leitores de tela\n\nMuita gente **não usa o mouse**. Pessoas cegas navegam com o teclado e um leitor de tela; pessoas com deficiência motora podem não ter a precisão para clicar; e há quem simplesmente prefira o teclado por rapidez. Se a sua interface só funciona no clique, todas essas pessoas ficam paradas na porta.\n\nA boa notícia: navegar por teclado usa poucas teclas, e você pode testar agora mesmo.\n\n- **Tab**: pula para o próximo elemento interativo (link, botão, campo). **Shift + Tab** volta para o anterior.\n- **Enter**: ativa links e botões. **Barra de espaço**: aciona botões e marca caixas de seleção.\n- **Setas**: navegam dentro de um componente, como as opções de um menu ou de um grupo de rádio.\n\nFaça o teste: abra um site e tente usá-lo **só com o teclado**, sem tocar no mouse. Consegue chegar a tudo? Consegue enviar o formulário? Se travou em algum ponto, ali existe uma barreira de acessibilidade."
                    },
                    {
                        "type": "text",
                        "value": "## Foco visível: onde eu estou?\n\nQuando você aperta **Tab**, um elemento por vez fica **em foco** — pronto para ser acionado. Para quem navega por teclado, é essencial **enxergar** qual elemento está em foco, senão a pessoa fica perdida, feito um cursor invisível. Esse destaque costuma ser um **contorno** (o _focus ring_) ao redor do elemento.\n\nAqui mora um dos erros mais comuns e mais graves de acessibilidade: achar o contorno \"feio\" e apagá-lo com `outline: none`, sem colocar nada no lugar. Isso deixa a navegação por teclado **cega**. A regra é simples: você pode **redesenhar** o foco (uma borda mais bonita, um realce de fundo), mas **nunca removê-lo** sem um substituto visível. E esse indicador precisa ter contraste suficiente (lembra do 3:1 para componentes?).\n\nDois detalhes que ajudam muito:\n\n- **Ordem lógica**: o foco deve seguir a ordem em que as coisas aparecem na tela, de cima para baixo, da esquerda para a direita — o que acontece naturalmente quando o HTML está na ordem certa.\n- **Link de pular** (_skip link_): um \"Pular para o conteúdo\" no topo, que deixa a pessoa saltar o menu enorme e ir direto ao principal."
                    },
                    {
                        "type": "code",
                        "value": "/* Nunca faça isto sozinho: some com o foco e cega o teclado */\nbutton:focus {\n  outline: none;\n}\n\n/* Faça isto: um foco visível e com bom contraste */\nbutton:focus-visible {\n  outline: 3px solid #1a5fb4;   /* contorno nítido */\n  outline-offset: 2px;          /* respiro entre o contorno e o botão */\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Texto alternativo (alt) nas imagens\n\nUm leitor de tela não \"vê\" a imagem; ele lê o **texto alternativo** que você escreveu no atributo `alt`. Escolher bem esse texto é uma das tarefas de acessibilidade mais frequentes — e depende do **papel** da imagem:\n\n- **Imagem informativa** (uma foto, um infográfico, um gráfico): descreva **a informação** que ela passa. Ex.: `alt=\"Gráfico: vendas subiram de janeiro a março\"`.\n- **Imagem decorativa** (um enfeite, uma textura de fundo que não acrescenta informação): use o **alt vazio**, `alt=\"\"`. Assim o leitor de tela **pula** a imagem em vez de atrapalhar com ruído.\n- **Imagem funcional** (o ícone dentro de um botão ou link): descreva **a ação**, não o desenho. O `alt` de uma lupa que faz busca é `alt=\"Buscar\"`, não `alt=\"lupa\"`.\n\nDuas dicas de ouro: **não comece com \"imagem de...\"** (o leitor de tela já avisa que é uma imagem) e **não deixe o `alt` de fora** numa imagem informativa — sem ele, alguns leitores leem o nome do arquivo, e ninguém merece ouvir \"IMG sublinhado 4571 ponto jpg\"."
                    },
                    {
                        "type": "text",
                        "value": "## Leitores de tela: como a interface é \"ouvida\"\n\nUm **leitor de tela** é um programa que transforma a tela em **voz** (ou em braille). Eles não são raros nem exóticos: já vêm de fábrica nos aparelhos. Os mais conhecidos são o **NVDA** (gratuito, Windows), o **JAWS** (Windows), o **VoiceOver** (iPhone e Mac) e o **TalkBack** (Android).\n\nA pessoa não vê o layout de uma vez; ela percorre a página de forma **linear** e usa atalhos para saltar por **títulos**, **links**, **regiões** (cabeçalho, menu, conteúdo) e campos. Por isso, tudo o que você viu neste módulo se conecta aqui:\n\n- Um **HTML semântico** (títulos na ordem certa, um `<button>` de verdade, um `<label>` ligado a cada campo) faz o leitor anunciar cada coisa corretamente — é o princípio **Robusto** na prática.\n- Os **alt** viram a descrição das imagens; e o **foco visível** tem seu par no \"foco\" que o leitor anuncia enquanto você tabula.\n\nVocê não precisa ser usuário avançado para testar: ligue o VoiceOver ou o TalkBack do seu celular por alguns minutos e tente navegar em um app de olhos fechados. É a forma mais rápida de sentir o que funciona e o que trava."
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** boa parte da acessibilidade se resolve com quatro hábitos. **Teclado**: dá para chegar e acionar tudo com Tab, Shift+Tab, Enter, Espaço e setas. **Foco visível**: nunca remova o contorno de foco sem um substituto — redesenhe, não apague. **Texto alternativo**: `alt` que descreve a informação nas imagens informativas, `alt=\"\"` nas decorativas e a **ação** nas funcionais. **Leitores de tela**: escreva **HTML semântico** com títulos, botões e rótulos de verdade, e teste ligando o leitor do seu próprio celular."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual tecla move o foco para o próximo elemento interativo (link, botão, campo) de uma página?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Tab (e Shift + Tab volta para o anterior).",
                                "isCorrect": true
                            },
                            {
                                "text": "Enter, que sempre avança para o próximo campo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A barra de espaço, que percorre todos os elementos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tecla Esc, que navega entre os botões.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para uma imagem puramente decorativa, que não acrescenta informação, o que se deve colocar no atributo alt?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um alt vazio (alt=\"\"), para o leitor pular a imagem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma descrição bem detalhada de tudo que aparece na imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "O texto fixo \"imagem decorativa\" dentro do atributo alt.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada: o melhor é remover o atributo alt por completo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor achou o contorno de foco \"feio\" e o removeu de todos os botões com `outline: none`, sem colocar outro indicador. Qual é o problema e a boa prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quem usa teclado se perde; o certo é redesenhar o foco, nunca apagá-lo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum problema: o contorno de foco serve só de enfeite visual.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é de desempenho; basta deixar o contorno bem mais claro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Está certo remover: o foco só atrapalha quem usa o mouse na tela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um botão de excluir mostra só o ícone de uma lixeira, sem texto. O leitor de tela anuncia apenas \"botão\", sem dizer o que ele faz. Qual é a melhor correção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dar um texto acessível, como \"Excluir\": a ação, não o desenho.",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar alt=\"ícone de lixeira\", descrevendo o desenho que aparece.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar alt=\"imagem\", só para indicar que ali existe uma figura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixar o alt vazio (alt=\"\"), tratando o botão como decorativo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um \"botão\" foi feito com uma `<div>` e um onclick. Resultado: ele não recebe foco ao apertar Tab e o leitor de tela não o anuncia como botão. Qual é a raiz do problema e a solução mais robusta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Falta HTML semântico; trocar por `<button>` já resolve foco e anúncio certos.",
                                "isCorrect": true
                            },
                            {
                                "text": "É um problema de CSS: basta estilizar a `<div>` para se parecer com botão.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um problema de contraste: basta escurecer o texto dentro da `<div>`.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um problema de cor: falta usar mais do que a cor para indicar o botão.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Do wireframe ao design system",
        "aulas": [
            {
                "titulo": "Níveis de fidelidade: do papel ao protótipo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Níveis de fidelidade: do papel ao protótipo\n\nVocê tem uma ideia de tela na cabeça. Qual é o primeiro passo: abrir o Figma e caprichar em cada cor, sombra e ícone até ficar perfeito? A resposta, quase sempre, é **não**. Quem projeta interfaces raramente sai da ideia direto para o produto pronto. No caminho existe uma escada, e cada degrau dela é um nível de **fidelidade** diferente.\n\nPense em como um filme é feito. Ninguém sai gravando com atores e câmeras caras logo de cara. Primeiro alguém rabisca um **storyboard**: quadrinhos toscos que mostram a sequência das cenas. Depois vêm os ensaios, e só no fim a gravação de verdade. Cada etapa custa mais que a anterior, então os erros são resolvidos enquanto ainda são baratos. Projetar telas funciona igualzinho: começamos rabiscando e vamos aumentando o capricho aos poucos."
                    },
                    {
                        "type": "quote",
                        "value": "**Fidelidade** é o quanto uma representação da interface se parece e se comporta como o produto final. Baixa fidelidade é rápida, tosca e barata de mudar; alta fidelidade é caprichada, realista e cara de refazer. A regra de ouro: gaste pouco enquanto a ideia ainda pode estar errada, e capriche só depois que ela já está de pé."
                    },
                    {
                        "type": "text",
                        "value": "## Os quatro níveis, do mais tosco ao mais real\n\nDo primeiro rabisco até algo que parece o app de verdade, costumamos passar por quatro degraus:\n\n- **Esboço (sketch)**: o rabisco no papel, feito à mão, em minutos. Caixas, setas e umas palavras. É o mais rápido e o mais **descartável** de todos — se não prestou, amassa e joga fora. Serve para pensar rápido e destravar ideias.\n- **Wireframe (baixa fidelidade)**: a estrutura da tela desenhada com blocos cinza, sem cor nem imagem de verdade. Mostra **o que** vai na tela e **onde**, sem se preocupar com beleza. Em geral já feito no computador.\n- **Mockup (alta fidelidade)**: a tela com a **cara final** — cores da marca, tipografia escolhida, imagens reais, ícones. Parece uma foto do produto pronto, mas ainda é **estático**: você olha, mas não clica.\n- **Protótipo**: as telas **conectadas** e clicáveis, simulando o comportamento real. Você aperta um botão e ele leva para a próxima tela. É o que mais se aproxima de usar o produto de verdade.\n\nRepare que a fidelidade sobe de forma natural: cada degrau adiciona um tipo de capricho que o anterior não tinha."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Nível\",\"Fidelidade\",\"O que já mostra\",\"Quando costuma entrar\"],[\"Esboço (sketch)\",\"Baixíssima\",\"Ideia bruta, rabiscada à mão\",\"Nos primeiros minutos, para pensar\"],[\"Wireframe\",\"Baixa\",\"Estrutura e hierarquia, sem cor\",\"No início, para alinhar o layout\"],[\"Mockup\",\"Alta\",\"Visual final: cor, fonte e imagens\",\"Depois que a estrutura foi aprovada\"],[\"Protótipo\",\"Alta, com interação\",\"Telas conectadas e clicáveis\",\"Para testar o fluxo antes de codar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Duas fidelidades diferentes: visual e interação\n\nUm detalhe que confunde bastante quem começa: fidelidade não é uma coisa só, são **duas**.\n\n- A **fidelidade visual** é o quanto a tela se parece com o produto: um wireframe tem fidelidade visual baixa (tudo cinza), um mockup tem fidelidade visual alta (a cara final).\n- A **fidelidade de interação** é o quanto a tela se comporta como o produto: um mockup, por mais lindo que seja, tem interação **zero** (é uma foto), enquanto um protótipo responde aos seus cliques.\n\nPor isso um mockup e um protótipo podem parecer idênticos na tela, mas serem coisas diferentes: um você só olha, no outro você navega. E dá para ter um protótipo **feio e clicável** (wireframes conectados) ou um mockup **lindo e parado**. As duas fidelidades sobem em ritmos próprios.\n\n## Por que subir a fidelidade aos poucos\n\nMudar um rabisco custa dez segundos e uma borracha. Mudar um mockup caprichado custa horas de trabalho refeito. E mudar algo que já virou código custa dias da equipe. Quanto mais alta a fidelidade, mais **caro** fica voltar atrás.\n\nPor isso a ordem importa: resolvemos as dúvidas grandes (\"essa tela faz sentido? o conteúdo está na ordem certa?\") enquanto tudo ainda é barato e tosco, e só investimos no capricho quando a base já está firme. Começar pelo mockup perfeito é como pintar as paredes antes de saber se a planta da casa está certa."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** a **fidelidade** mede o quanto um desenho se aproxima do produto final. Subimos por quatro degraus — **esboço** (rabisco no papel), **wireframe** (estrutura em baixa fidelidade, sem cor), **mockup** (visual final, mas estático) e **protótipo** (telas conectadas e clicáveis). Existem duas fidelidades: a **visual** (a aparência) e a de **interação** (o comportamento). Como mudar algo caprichado é caro, resolvemos as decisões grandes na baixa fidelidade e só caprichamos quando a ideia já está de pé."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual nível de fidelidade é um rabisco feito à mão no papel, em poucos minutos, e fácil de jogar fora?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O esboço (sketch).",
                                "isCorrect": true
                            },
                            {
                                "text": "O mockup de alta fidelidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O protótipo clicável.",
                                "isCorrect": false
                            },
                            {
                                "text": "O design system.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que caracteriza um wireframe de baixa fidelidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Estrutura e organização da tela em blocos cinza, sem cor nem imagem final.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cores da marca, tipografia definitiva e imagens reais, como uma foto do produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Totalmente clicável, simulando o comportamento real do app pronto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O conjunto de componentes reutilizáveis e tokens visuais de um produto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No começo de um projeto, a equipe quer decidir rápido onde ficam o menu, a busca e a lista de produtos de uma tela, sem perder tempo escolhendo cores. Qual artefato é o mais indicado para esse momento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um wireframe de baixa fidelidade, focado na estrutura e barato de mudar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um mockup de alta fidelidade, já com as cores e imagens definitivas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um protótipo de alta fidelidade, com toda a animação pronta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O código final da tela, já publicado e no ar para o público.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma designer mostra ao cliente uma tela caprichada, com cores e imagens reais, mas quando ele tenta clicar num botão nada acontece. O que é esse artefato e o que falta nele?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É um mockup: alta fidelidade visual, interação zero, por isso não clica.",
                                "isCorrect": true
                            },
                            {
                                "text": "É um protótipo malfeito, que só precisa de ajuste na cor do botão.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um wireframe, já que wireframes trazem cor e imagem reais desde o início.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um esboço, pois foi rabiscado à mão no papel antes de ganhar cor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Empolgada, uma equipe pulou os rascunhos e passou três dias fazendo um mockup perfeito da tela inicial. No teste com usuários, descobriram que a ideia por trás da tela não funcionava e tudo precisou ser repensado. Que princípio de fidelidade eles ignoraram?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Resolver as decisões grandes em baixa fidelidade primeiro, pois mudar ali ainda é barato.",
                                "isCorrect": true
                            },
                            {
                                "text": "Quanto mais alta a fidelidade desde o início, menor é o risco de errar o produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Testar com usuários só serve depois que a tela já está toda programada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um mockup pronto não pode mais ser alterado, então acertar de primeira é obrigatório.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Wireframes: o esqueleto da tela",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Wireframes: o esqueleto da tela\n\nNa aula passada, o **wireframe** apareceu como o degrau da baixa fidelidade. Agora vamos morar nele, porque é uma das ferramentas mais úteis (e mais subestimadas) de quem projeta telas.\n\nA melhor imagem para entender um wireframe é a **planta baixa** de um apartamento. A planta não tem cor de parede, marca de piso nem modelo de sofá. Ela mostra o essencial: onde fica cada cômodo, o tamanho de cada um, por onde se anda. E é de propósito que ela é assim, crua e sem enfeite — o objetivo é decidir a **organização do espaço** antes de pensar na decoração.\n\nO wireframe é a planta baixa da sua tela: um desenho simples, em tons de cinza, que mostra **o que** vai aparecer e **onde**, sem se distrair com beleza."
                    },
                    {
                        "type": "text",
                        "value": "## O que ele mostra (e o que esconde de propósito)\n\nUm wireframe é feito de blocos simples: retângulos, linhas e rótulos. Com essas peças toscas ele revela o que importa naquele momento:\n\n- **A estrutura**: quais regiões a tela tem (cabeçalho, conteúdo, rodapé) e como se dividem.\n- **A hierarquia**: o que é grande e vem primeiro, o que é pequeno e secundário.\n- **O conteúdo**: que blocos existem — um título aqui, uma lista ali, um botão de ação no canto.\n\nE, com a mesma intenção, ele **esconde** tudo o que atrapalharia essa conversa: nada de cores da marca, fontes definitivas, fotos reais ou sombras. Isso não é preguiça, é foco. Quando a tela está cinza e tosca, ninguém discute \"gostei desse azul\" — todos olham para o que de fato precisa ser decidido agora: **a organização**.\n\n## Quando usar\n\nO wireframe brilha **no início**, quando ainda há muitas dúvidas sobre o layout. Ele é rápido de fazer, rápido de jogar fora e fácil de mostrar para o time e para quem decide. Por ser tosco, ele convida à crítica: as pessoas se sentem à vontade para dizer \"e se movermos isso para cima?\", coisa que dificilmente falariam diante de uma tela que já parece pronta e caprichada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Símbolo no wireframe\",\"O que representa\"],[\"Retângulo com um X no meio\",\"Uma imagem ou foto\"],[\"Linhas horizontais\",\"Um bloco de texto\"],[\"Retângulo com um rótulo dentro\",\"Um botão ou um campo\"],[\"Faixa no topo da tela\",\"O cabeçalho ou o menu\"],[\"Caixinhas repetidas em linha ou grade\",\"Uma lista ou galeria de itens\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Passo a passo: esboçando a estrutura de uma tela\n\nVamos esboçar juntos o wireframe da **tela inicial de um app de receitas**. Não precisa de computador: papel e lápis bastam. Siga a ordem do raciocínio, não a do desenho.\n\n**Passo 1 — Liste o conteúdo essencial.** Antes de desenhar qualquer caixa, escreva o que **precisa** estar na tela: um campo de busca, uma lista de receitas em destaque, as categorias (doces, salgados) e um menu de navegação. A estrutura nasce do conteúdo, não o contrário.\n\n**Passo 2 — Ordene por importância.** Decida o que o usuário procura primeiro. Num app de receitas, buscar e ver os destaques costuma vir antes de tudo. Isso define quem fica no topo e maior.\n\n**Passo 3 — Divida a tela em regiões.** Desenhe três faixas: um **cabeçalho** no topo (nome do app e busca), a **área de conteúdo** no meio (os destaques e as categorias) e uma **navegação** no rodapé.\n\n**Passo 4 — Preencha com blocos toscos.** Agora sim, use as convenções: uma caixa com X para a foto de cada receita, linhas para os títulos, um retângulo rotulado \"Buscar\" para o campo. Sem cor, sem capricho.\n\n**Passo 5 — Confira o caminho do olhar.** Afaste o papel e olhe: o que salta primeiro? A ordem em que os blocos chamam atenção bate com a importância que você definiu no Passo 2? Se não bate, mova as caixas. Mover caixa de papel é o desenho mais barato do mundo."
                    },
                    {
                        "type": "text",
                        "value": "## O erro clássico: caprichar cedo demais\n\nUm tropeço comum de quem está começando é abrir a ferramenta de design e, antes de resolver a estrutura, sair escolhendo a cor do botão, testando fontes bonitas e procurando a foto perfeita. O resultado é conhecido: horas gastas deixando lindo um layout que ainda vai mudar de lugar inteiro.\n\n- **Jeito ruim:** decidir a paleta e a tipografia com a estrutura ainda no ar. Qualquer mudança grande joga fora todo o capricho, e as discussões giram em torno de cor em vez de organização.\n- **Jeito bom:** fechar a estrutura em caixas cinza primeiro. Quando **onde** cada coisa fica já está resolvido e aprovado, aí sim vale investir na aparência — e nada do que você caprichar corre o risco de ser descartado.\n\nManter o wireframe feio, por incrível que pareça, é uma decisão profissional: é o que garante que a energia do capricho seja gasta só depois que a base estiver firme."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** o **wireframe** é a planta baixa da tela — um desenho em baixa fidelidade, em tons de cinza, feito de retângulos, linhas e rótulos. Ele mostra de propósito só a **estrutura**, a **hierarquia** e o **conteúdo**, escondendo cor, fonte e imagens para manter o foco na organização. Use-o **no início**, quando é barato mudar. Para esboçar uma tela: liste o conteúdo, ordene por importância, divida em regiões, preencha com blocos toscos e confira o caminho do olhar. E resista à tentação de caprichar antes de a estrutura estar de pé."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um wireframe?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um desenho de baixa fidelidade que mostra a estrutura da tela em blocos cinza.",
                                "isCorrect": true
                            },
                            {
                                "text": "A versão final da tela, já com cores, fontes e imagens definitivas aplicadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um protótipo de alta fidelidade, totalmente clicável e animado na tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo de código-fonte que o navegador interpreta e executa direto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num wireframe, como costuma-se representar o lugar de uma imagem ou foto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Com um retângulo que tem um X no meio.",
                                "isCorrect": true
                            },
                            {
                                "text": "Com a foto real já aplicada, em alta resolução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Com um círculo pintado de azul.",
                                "isCorrect": false
                            },
                            {
                                "text": "Com um trecho de código HTML.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante a apresentação de um wireframe cinza, a reunião trava numa discussão sobre qual tom de azul usar no botão. Por que essa conversa está fora de hora?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O wireframe resolve a estrutura; cor é decisão de alta fidelidade, para depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque todo wireframe já deveria nascer pronto, com as cores finais definidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a cor do botão é sempre a decisão mais importante de qualquer tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a cor azul é proibida em botões por convenção do design system.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você vai criar o wireframe de uma tela do zero. Qual é o primeiro passo mais sensato?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Listar o conteúdo essencial da tela antes de desenhar qualquer caixa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escolher logo a paleta de cores e a tipografia final da marca da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exportar logo todos os ícones da tela em alta resolução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever direto o código HTML e CSS que vai virar a tela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma líder de design percebe que, quando mostra telas já caprichadas, quase ninguém sugere mudanças, mas quando mostra wireframes cinza chovem sugestões de melhoria. Como a baixa fidelidade explica essa diferença?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Por parecer inacabado, o wireframe convida à crítica; tela pronta parece decidida.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque telas caprichadas realmente têm menos problemas, então sobra pouco o que sugerir.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque wireframes escondem funcionalidades que só aparecem depois, prontas no mockup.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, quanto mais bonita a tela fica, mais confusa ela se torna para o usuário.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Prototipagem: telas que ganham vida",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Prototipagem: telas que ganham vida\n\nAté agora, mockups e wireframes são telas **paradas**. Bonitas ou toscas, elas ficam ali, imóveis, esperando você imaginar o que aconteceria se apertasse aquele botão. O **protótipo** acaba com a imaginação: ele **conecta** as telas e as deixa clicáveis, para que você realmente navegue, como se o produto já existisse.\n\nPense na diferença entre a **foto** de um carro e um **test drive**. A foto mostra o carro lindo, de todos os ângulos, mas você não sente como ele dirige. O test drive coloca você atrás do volante: acelera, freia, faz a curva. Um mockup é a foto; um protótipo é o test drive. E é dirigindo que se descobre se o carro é bom — antes de comprá-lo."
                    },
                    {
                        "type": "quote",
                        "value": "Um **protótipo** transforma telas soltas num produto que dá para experimentar: você clica e ele responde. É o test drive antes de fabricar o carro — e sai muito mais barato descobrir um problema no test drive do que já na fábrica."
                    },
                    {
                        "type": "text",
                        "value": "## Protótipos clicáveis e fluxos\n\nO que torna um protótipo clicável são as **conexões**: em cada tela, marcamos pontos sensíveis (um botão, um item da lista) e dizemos para qual tela eles levam quando tocados. É como amarrar as telas umas nas outras com barbantes invisíveis.\n\nQuando essas conexões formam um caminho completo para o usuário realizar uma tarefa, temos um **fluxo** (em inglês, _flow_). Um fluxo é a sequência de telas do começo ao fim de uma missão. O mais clássico é o **fluxo de compra** de uma loja: a pessoa vê o produto, coloca no carrinho, informa a entrega, paga e recebe a confirmação. Cada passo é uma tela, e o protótipo liga uma na outra:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Passo do fluxo\",\"Tela\"],[\"1\",\"Página do produto\"],[\"2\",\"Carrinho\"],[\"3\",\"Dados de entrega\"],[\"4\",\"Pagamento\"],[\"5\",\"Confirmação do pedido\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que prototipar antes de programar\n\nProtótipo é ensaio: ele existe para você **errar barato**. Com um fluxo clicável na mão, dá para sentar com algumas pessoas, pedir que tentem completar uma tarefa e **observar** onde elas travam — tudo isso antes de escrever uma única linha de código.\n\nImagine testar um fluxo de cadastro e perceber que metade das pessoas se perde no terceiro passo, porque não entende o que preencher. Descobrir isso no protótipo custa mover algumas caixas. Descobrir depois de o cadastro já estar programado e no ar custa retrabalho, reunião e tempo da equipe. O protótipo antecipa o tropeço para quando ele ainda é barato.\n\n## De que fidelidade meu protótipo precisa?\n\nProtótipo não é sinônimo de alta fidelidade. Você pode conectar **wireframes** cinza e ter um protótipo tosco, porém clicável, ou conectar **mockups** e ter um protótipo com a cara final. A escolha depende do que você quer testar:\n\n- Se a dúvida é sobre **navegação e fluxo** (a ordem das telas faz sentido? falta algum passo?), um protótipo de baixa fidelidade já resolve.\n- Se a dúvida é sobre **percepção visual** (as pessoas acham o botão de pagar? confiam nesta tela?), aí vale um protótipo de alta fidelidade, com cor e capricho.\n\nUse a fidelidade mínima que responde à sua pergunta. Capricho a mais é tempo a menos."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** um **protótipo** conecta as telas e as deixa clicáveis, simulando o produto de verdade — é o test drive, não a foto. As conexões entre telas formam um **fluxo**: a sequência do começo ao fim de uma tarefa, como o fluxo de compra (produto → carrinho → entrega → pagamento → confirmação). Prototipamos para **testar com pessoas e errar barato** antes de programar. E a fidelidade do protótipo é uma escolha: baixa para validar a navegação, alta para validar a percepção visual."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal diferença entre um mockup e um protótipo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O mockup é estático, só para olhar; o protótipo é clicável e interativo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O protótipo nasce sempre no papel, e o mockup, direto no computador.",
                                "isCorrect": false
                            },
                            {
                                "text": "O mockup já responde a cliques, e o protótipo é a versão parada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe diferença real: são apenas dois nomes para a mesma peça.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No contexto de prototipagem, o que é um fluxo (flow)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A sequência de telas percorrida do início ao fim de uma tarefa.",
                                "isCorrect": true
                            },
                            {
                                "text": "A cor de fundo padrão aplicada a todas as telas do protótipo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista de componentes reutilizáveis guardados no design system.",
                                "isCorrect": false
                            },
                            {
                                "text": "O código de servidor que processa os dados por trás do app.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de mandar programar, uma equipe quer verificar se as pessoas conseguem se cadastrar sem se perder na sequência de telas. Qual artefato permite esse teste?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um protótipo clicável, com as telas conectadas em sequência.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um mockup estático de uma tela só, sem nenhuma conexão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um wireframe isolado, sem nenhuma conexão entre as telas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O catálogo de componentes do design system da empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você só precisa validar se a ordem das telas de um fluxo faz sentido, sem se importar ainda com cores e imagens finais. Que tipo de protótipo é suficiente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um protótipo de baixa fidelidade, com wireframes cinza conectados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um protótipo de alta fidelidade, com todas as cores e imagens finais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum protótipo serve; só o produto final programado responde a isso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um mockup estático, sem nenhuma conexão entre as telas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao testar um protótipo do fluxo de compra, a equipe percebe que várias pessoas desistem na tela de pagamento por acharem tudo confuso. Qual é o principal valor demonstrado por esse teste?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Encontrar o problema de usabilidade enquanto ainda é barato corrigir.",
                                "isCorrect": true
                            },
                            {
                                "text": "Provar que protótipos de alta fidelidade nunca escondem problemas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Confirmar que testar com pessoas só compensa depois do lançamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mostrar que a cor da tela de pagamento não afeta a taxa de desistência.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Figma e o handoff para a pessoa dev",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Figma e o handoff para a pessoa dev\n\nDurante anos, projetar telas era um trabalho solitário: a pessoa designer caprichava num arquivo pesado, exportava umas imagens e mandava por e-mail para o resto do time. Se alguém quisesse comentar, respondia o e-mail; se a versão mudava, lá ia outro anexo. O **Figma** mudou esse jogo.\n\nO Figma é uma **ferramenta de design de interfaces** que roda no navegador e foi feita para **colaboração**. Em vez de um arquivo que vai e volta, existe um espaço único, na nuvem, onde várias pessoas trabalham ao mesmo tempo — como um documento compartilhado, só que para telas. Ele virou a referência do mercado, tanto que \"vou te mandar o Figma\" hoje quer dizer \"vou te compartilhar o design\". Aqui a gente descreve o que ele faz, sem virar tutorial de cliques: o que importa é entender o **papel** que ele cumpre."
                    },
                    {
                        "type": "text",
                        "value": "## Como o Figma organiza o trabalho\n\nAlgumas ideias centrais aparecem em praticamente qualquer ferramenta desse tipo:\n\n- **Frames**: cada _frame_ é uma moldura que representa **uma tela** (a home, a tela de login, o carrinho). Um arquivo reúne dezenas deles, lado a lado, como um mural.\n- **Componentes**: elementos que você desenha uma vez e reutiliza em toda parte — um botão, um cartão, um campo. Mudou o componente original, mudaram todas as cópias de uma vez.\n- **Colaboração em tempo real**: várias pessoas no mesmo arquivo, cada uma com o seu cursor, vendo as edições acontecerem ao vivo.\n- **Comentários**: qualquer pessoa pode grudar um balãozinho num ponto exato da tela (\"esse texto não cabe no celular?\"), sem bagunçar o design.\n- **Prototipagem embutida**: dá para ligar os frames e transformar as telas num protótipo clicável ali mesmo, sem trocar de ferramenta.\n\nJuntando tudo: o design deixa de ser um anexo estático e vira um lugar **vivo**, onde produto, design e desenvolvimento olham a mesma tela ao mesmo tempo."
                    },
                    {
                        "type": "quote",
                        "value": "No Figma, o design deixa de ser um arquivo que vai e volta por e-mail e passa a ser um espaço vivo e compartilhado — produto, design e desenvolvimento olhando a mesma tela, ao mesmo tempo, cada um deixando o seu comentário no lugar exato."
                    },
                    {
                        "type": "text",
                        "value": "## O handoff: da pessoa designer para a pessoa dev\n\nChega o momento em que a tela aprovada precisa virar produto de verdade, escrito em código. Essa passagem de bastão tem um nome: **handoff** (\"entrega\", em inglês). É quando quem projetou entrega para quem vai construir tudo o que é preciso para reproduzir a tela com fidelidade.\n\nE o que a pessoa dev precisa receber? Bem mais do que uma imagem bonita:\n\n- **Medidas e espaçamentos**: quantos pixels de distância entre um elemento e outro, o tamanho de cada bloco.\n- **Cores**: o código exato de cada cor (por exemplo, o hexadecimal), e não um \"azul mais ou menos aquele\".\n- **Tipografia**: fonte, tamanho, peso e entrelinha de cada texto.\n- **Assets**: ícones e imagens prontos para exportar, para não recriar nada na mão.\n- **Estados**: como o componente fica ao passar o mouse, ao receber foco ou quando está desabilitado. A tela mostra só o estado padrão; o resto precisa ser documentado.\n\nFerramentas como o Figma têm um **modo de inspeção** (o \"modo dev\") que mostra essas medidas e cores e chega a **gerar um CSS** de referência. Para quem vem do front-end, isso é uma mão na roda — mas atenção: esse código é um **ponto de partida**, não a palavra final. Ele não conhece os componentes e os tokens do seu projeto, então serve para consultar valores, e não para copiar e colar às cegas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que entregar no handoff\",\"Para quê\"],[\"Medidas e espaçamentos\",\"Reproduzir o layout com precisão\"],[\"Cores em código (hex)\",\"Aplicar exatamente a paleta certa\"],[\"Tipografia (tamanho, peso, entrelinha)\",\"Acertar a aparência dos textos\"],[\"Assets e ícones exportáveis\",\"Não recriar imagens na mão\"],[\"Estados dos componentes\",\"Saber como fica hover, foco e desabilitado\"],[\"Protótipo do fluxo\",\"Entender o comportamento e as transições\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** o **Figma** é a ferramenta de referência para projetar interfaces — roda no navegador, organiza telas em **frames**, permite **componentes** reutilizáveis, **colaboração em tempo real**, **comentários** e até protótipos clicáveis. O **handoff** é a entrega do design para quem vai programar, e um bom handoff vai além da imagem: leva medidas, cores em código, tipografia, assets, os **estados** dos componentes e o protótipo do fluxo. O CSS que a ferramenta gera é um ponto de partida útil, não um código final para copiar sem pensar."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o Figma?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma ferramenta de design de interfaces que roda no navegador.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma linguagem de programação usada para criar sites do zero.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um banco de dados voltado para guardar imagens em nuvem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um sistema operacional próprio para celulares e tablets.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que significa o \"handoff\" no processo de design?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A entrega do design pronto para a pessoa dev construir a tela.",
                                "isCorrect": true
                            },
                            {
                                "text": "O primeiro esboço da tela, feito à mão, ainda no papel comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "A escolha final das cores oficiais da marca do produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste do protótipo clicável junto a usuários reais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor recebeu apenas um print da tela, sem medidas, sem os códigos das cores e sem os ícones. Qual é o problema desse handoff?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Faltam medidas, cores em código e ícones; a pessoa dev terá que adivinhar tudo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: um print já esconde nele as medidas e as cores exatas da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema real é que o formato do print pesa demais para o dev abrir.",
                                "isCorrect": false
                            },
                            {
                                "text": "O handoff está completo; medidas e cores em código nunca fazem falta ao dev.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma designer no Recife e um dev em Porto Alegre precisam olhar a mesma tela e trocar observações pontuais, sem enviar anexos de um lado para o outro. Que característica do Figma resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A colaboração em tempo real, com comentários no próprio arquivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A exportação de imagens da tela pronta em alta resolução.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modo escuro disponível na interface do editor, só estético.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os atalhos de teclado configuráveis para acelerar o trabalho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dev front-end abre o modo dev do Figma, copia o CSS gerado de um botão e cola direto no projeto, sem adaptar nada. Por que isso costuma ser um problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O CSS gerado é só referência; ignora os tokens e foge do padrão da base.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Figma nunca gera CSS de verdade, apenas imagens estáticas do layout.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o CSS gerado pelo Figma já nasce perfeito e nunca exige nenhuma revisão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o certo era copiar o código a partir do mockup, e não do modo dev.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Design systems: consistência que escala",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Design systems: consistência que escala\n\nImagine uma empresa com dezenas de telas, feitas por várias pessoas ao longo dos anos. Sem nenhum combinado, o que acontece? Uma tela usa um azul, a outra usa um azul _quase_ igual. Aqui o botão tem cantos arredondados, ali é reto. Um espaçamento de 16 pixels numa tela, 14 na outra, 20 na seguinte. Multiplique isso por centenas de telas e você tem uma bagunça: o produto parece ter sido feito por dez empresas diferentes.\n\nO **design system** existe para acabar com essa bagunça. Ele é o conjunto de **regras, peças e decisões** compartilhadas que fazem todo o produto falar a mesma língua visual. Pense num jogo de **LEGO**: as peças são padronizadas e se encaixam sempre do mesmo jeito, então qualquer pessoa consegue montar algo coerente, rápido, sem inventar peça nova a cada vez."
                    },
                    {
                        "type": "text",
                        "value": "## Componentes reutilizáveis\n\nO coração de um design system são os **componentes**: peças de interface desenhadas uma única vez e reutilizadas em todo lugar. Um botão, um campo de texto, um cartão de produto, um menu — cada um definido num lugar só, com sua aparência e seu comportamento já resolvidos.\n\nA vantagem é dupla. Primeiro, **consistência**: se todos usam o mesmo componente de botão, todos os botões do produto ficam iguais, sem esforço. Segundo, **velocidade**: montar uma tela nova vira encaixar peças prontas, em vez de desenhar tudo do zero.\n\nQuem vem do front-end vai reconhecer a ideia na hora: é o mesmo princípio de um **componente** de código (como em React ou nos Web Components). Você escreve o botão uma vez e o reusa em cem telas; para mudar todos, muda num lugar só. O design system leva essa lógica para o desenho da interface, e não apenas para o código."
                    },
                    {
                        "type": "text",
                        "value": "## Design tokens: as variáveis do design\n\nSe os componentes são as peças, os **design tokens** são os **valores** guardados em variáveis com nome. Em vez de espalhar o número `#1E6FEA` por trezentos lugares, você guarda esse azul numa variável chamada, por exemplo, `cor-primaria`. Daí em diante, ninguém escreve o código da cor: todos usam o **nome** do token.\n\nOs tokens costumam cobrir as decisões visuais que se repetem o tempo todo:\n\n- **Cor**: a paleta da marca (primária, de texto, de fundo, de alerta).\n- **Espaçamento**: as distâncias padrão entre elementos (pequeno, médio, grande).\n- **Tipografia**: os tamanhos e pesos de texto (corpo, título, legenda).\n\nA mágica aparece na hora de mudar. A marca trocou o azul? Você altera **um único token**, e cada botão, link e ícone que usa `cor-primaria` muda junto, no produto inteiro. É a diferença entre trocar uma lâmpada e trocar todas as lâmpadas da cidade, uma por uma. De novo, quem programa front-end já viu isso: é exatamente a ideia das **variáveis CSS** (as _custom properties_):"
                    },
                    {
                        "type": "code",
                        "value": ":root {\n  /* Tokens de cor */\n  --cor-primaria: #1e6fea;\n  --cor-texto: #1a1a1a;\n  --cor-fundo: #ffffff;\n\n  /* Tokens de espacamento */\n  --espaco-pequeno: 8px;\n  --espaco-medio: 16px;\n  --espaco-grande: 24px;\n\n  /* Tokens de tipografia */\n  --fonte-corpo: 16px;\n  --fonte-titulo: 24px;\n  --peso-negrito: 700;\n\n  /* Token de borda */\n  --borda-raio: 8px;\n}\n\n.botao-primario {\n  background-color: var(--cor-primaria);\n  padding: var(--espaco-pequeno) var(--espaco-medio);\n  border-radius: var(--borda-raio);\n  font-size: var(--fonte-corpo);\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Consistência e um exemplo de verdade: o Material Design\n\nJuntando componentes e tokens, o design system entrega o que mais importa: **consistência**. E consistência não é só questão de bonito — ela ajuda o usuário. Uma das leis de UX, a **Lei de Jakob**, lembra que as pessoas passam a maior parte do tempo em _outros_ produtos e esperam que o seu funcione de um jeito parecido com o que já conhecem. Quando cada botão do seu app se comporta igual, a pessoa aprende uma vez e usa em toda parte.\n\nO exemplo mais conhecido é o **Material Design**, o design system criado pelo **Google**. Ele define componentes, cores, espaçamentos, tipografia, ícones e até como as coisas se movem e projetam sombra, e é usado no Android e em vários produtos da empresa. É por isso que apps tão diferentes têm um \"ar\" de família: seguem o mesmo sistema. Existem outros famosos, como as **Human Interface Guidelines** da Apple, que dão a cara aos produtos do iPhone.\n\nOs ganhos de adotar um design system se acumulam:\n\n- **Coerência**: o produto inteiro parece feito pela mesma mão.\n- **Velocidade**: menos decisões repetidas, mais reúso de peças prontas.\n- **Escala**: dá para crescer o time e o número de telas sem virar bagunça.\n- **Qualidade embutida**: boas práticas (como o contraste mínimo de 4.5:1 para texto normal) entram de fábrica nos tokens e componentes, e ninguém precisa lembrar delas a cada tela."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** um **design system** é o conjunto de regras e peças compartilhadas que faz um produto inteiro falar a mesma língua visual. Ele se apoia em **componentes reutilizáveis** (o botão desenhado uma vez e usado em toda parte, como um componente de código) e em **design tokens** (cor, espaçamento e tipografia guardados em variáveis nomeadas, como as variáveis CSS). O resultado é **consistência**, **velocidade** e **escala** — e a **Lei de Jakob** explica por que a consistência ajuda o usuário. O **Material Design**, do Google, é o exemplo mais conhecido."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um componente reutilizável num design system?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma peça de interface desenhada uma vez e usada em várias telas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma cor específica escolhida e reservada para o fundo do site.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um comentário qualquer deixado solto no arquivo do Figma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um primeiro esboço da tela, feito à mão, ainda no papel.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é um design token?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma decisão visual, como uma cor, guardada numa variável com nome.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um tipo específico de protótipo clicável de alta fidelidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo final que a pessoa dev entrega de volta ao cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma senha de acesso exclusiva ao projeto dentro do Figma.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A marca decidiu trocar o seu azul principal por um novo tom. O produto usa design tokens, com a cor guardada na variável cor-primaria. Quantos lugares, em teoria, precisam ser alterados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Apenas um: o valor do token cor-primaria, e o resto muda junto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada tela do produto, uma por uma, trocando o código da cor antiga.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum lugar: tokens não têm nenhuma relação com as cores usadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todos os componentes, que precisariam ser redesenhados um por um.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app cresceu sem combinados e hoje tem doze tons de azul, cinco estilos de botão e espaçamentos diferentes em cada tela. O que a adoção de um design system resolveria primeiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Traria consistência, com tokens e componentes que igualam cores e botões.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixaria cada tela ainda mais livre para escolher suas próprias cores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Removeria de vez a necessidade de testar o produto com usuários reais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformaria os mockups automaticamente em código pronto de produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de adotar um design system com componentes e tokens, uma equipe passou a entregar telas mais rápido e, ao mesmo tempo, o produto ficou mais coerente. Qual combinação explica os dois ganhos juntos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Componentes prontos aceleram a montagem das telas, e os tokens centralizam as decisões, dando consistência.",
                                "isCorrect": true
                            },
                            {
                                "text": "A velocidade veio de abandonar os componentes, e a consistência, de cada pessoa escolher suas próprias cores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois ganhos vieram apenas de aumentar a fidelidade dos wireframes usados no início.",
                                "isCorrect": false
                            },
                            {
                                "text": "A coerência veio do handoff bem feito, e a velocidade, de pular a prototipagem inteira.",
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
    console.log("Seed concluído: " + MODULOS.length + " módulos, " + totalAulas + " aulas, " + totalQuestoes + " questões.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
