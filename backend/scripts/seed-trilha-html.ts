// Seed da trilha HTML (regenerado no formato padrao durante a campanha de de-tell).
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "HTML";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "Trilha de HTML para iniciantes: do primeiro documento à estrutura semântica. Tags, texto, links, imagens, mídia, tabelas, formulários e boas práticas de acessibilidade e SEO, com muito código pra praticar.";

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
        "titulo": "Módulo 1 - Introdução ao HTML",
        "aulas": [
            {
                "titulo": "O que é HTML e como a web funciona",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é HTML e como a web funciona\n\nSeja muito bem-vindo à sua primeira aula de HTML! Se você nunca escreveu uma linha de código na vida, pode relaxar: é exatamente para você que esta trilha foi feita. Aqui a gente começa do zero absoluto, sem pressa e sem pular etapas.\n\nToda página que você abre na internet, o Google, o YouTube, o site do seu banco, começou como um arquivo de **HTML**. Entender o que é esse arquivo e o que acontece quando você digita um endereço no navegador é o primeiro passo para construir suas próprias páginas. É isso que vamos destrinchar agora, com calma."
                    },
                    {
                        "type": "quote",
                        "value": "**HTML** quer dizer _HyperText Markup Language_, ou Linguagem de Marcação de Hipertexto. A palavra que importa aqui é **marcação**: o HTML não faz cálculos nem toma decisões, ele apenas **dá nome e estrutura** ao conteúdo, dizendo \"isto é um título\", \"isto é um parágrafo\", \"isto é uma imagem\". Quem lê essa marcação e monta a página é o **navegador**."
                    },
                    {
                        "type": "text",
                        "value": "## O que é uma página web, afinal?\n\nPense em uma página web como uma **folha de documento** que mora em algum computador na internet e que você abre pelo navegador (Chrome, Firefox, Edge, Safari e por aí vai).\n\nEssa folha é, na verdade, um **arquivo de texto** comum, parecido com um bloco de notas, só que escrito seguindo umas regrinhas que o navegador entende. O nome desse arquivo termina em `.html`. Quando você acessa um site, seu navegador **baixa** esse arquivo de texto e o **transforma** naquela página bonita, com títulos, imagens e botões, que aparece na tela.\n\nOu seja: por trás de toda página existe **texto** que alguém escreveu. E é justamente esse texto que você vai aprender a escrever."
                    },
                    {
                        "type": "text",
                        "value": "## Marcação não é programação\n\nMuita gente começa achando que \"fazer um site\" é a mesma coisa que \"programar\". Vale separar as duas ideias logo de cara:\n\n- Uma **linguagem de programação** (como Python ou JavaScript) serve para dar **ordens** ao computador: \"some estes números\", \"se o usuário estiver logado, mostre o nome dele\", \"repita isto 10 vezes\". Ela tem lógica, decisões e cálculos.\n- Uma **linguagem de marcação**, como o HTML, serve para **descrever e organizar** um conteúdo. Você não manda o computador \"fazer\" nada, você **etiqueta** cada pedaço do conteúdo dizendo o que ele é.\n\nUma analogia ajuda: imagine que você recebeu um texto cru e precisa prepará-lo para uma revista. Você pega um marca-texto e anota nas margens: \"isto aqui é o título principal\", \"este trecho é um parágrafo\", \"esta palavra tem que ficar em destaque\". Você não reescreveu o texto nem fez contas, só **marcou** o papel de cada parte. É exatamente isso que o HTML faz com o conteúdo de uma página."
                    },
                    {
                        "type": "code",
                        "value": "<h1>Bolo de cenoura</h1>\n\n<p>Esta é a melhor receita de bolo de cenoura da vovó.</p>\n\n<p>Rende 8 fatias e fica pronto em 40 minutos.</p>"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo o exemplo acima\n\nMesmo sem saber HTML ainda, dá para adivinhar bastante coisa nesse código:\n\n- `<h1>Bolo de cenoura</h1>` marca o texto \"Bolo de cenoura\" como o **título principal** da página. O `h` vem de _heading_, que é cabeçalho em inglês.\n- Cada `<p>...</p>` marca um **parágrafo** de texto (o `p` é de _paragraph_).\n\nRepare no padrão: o texto que vai aparecer na tela fica **no meio**, cercado por essas etiquetas escritas entre `<` e `>`. Essas etiquetas são as **tags**, e são elas que dão significado ao conteúdo. Não precisa decorar nada agora, a gente vai dissecar tag por tag nas próximas aulas."
                    },
                    {
                        "type": "text",
                        "value": "## O trio da web: HTML, CSS e JavaScript\n\nO HTML quase nunca trabalha sozinho. Uma página moderna é feita de **três** tecnologias que se completam. A forma mais fácil de entender o papel de cada uma é pensar numa **pessoa**:\n\n- **HTML** é o **esqueleto**: os ossos, a estrutura que sustenta tudo. Define o que existe na página (títulos, textos, imagens, botões).\n- **CSS** é a **aparência**: a roupa, o cabelo, a cor dos olhos. Cuida de como as coisas se parecem (cores, tamanhos, espaçamentos, fontes).\n- **JavaScript** é o **comportamento**: os músculos que se movem. Faz a página **reagir** (abrir um menu ao clicar, avisar que você esqueceu de preencher um campo, atualizar dados sem recarregar).\n\nNesta trilha o nosso foco é o **HTML**, o esqueleto. Sem um bom esqueleto, não adianta roupa bonita nem movimento. Por isso ele vem primeiro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tecnologia\",\"Cuida de...\",\"Analogia (o corpo)\",\"Exemplo do dia a dia\"],[\"HTML\",\"Estrutura e conteúdo\",\"O esqueleto\",\"Marcar o que é título, parágrafo e imagem\"],[\"CSS\",\"Estilo e aparência\",\"A roupa e a maquiagem\",\"Deixar o título azul e centralizado\"],[\"JavaScript\",\"Comportamento e interação\",\"Os músculos\",\"Mostrar um aviso quando você clica num botão\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Um gostinho dos três juntos\n\nVocê não precisa entender CSS e JavaScript agora, mas vale ver como cada um entra. Vamos partir de um simples botão. Só com **HTML**, ele existe:"
                    },
                    {
                        "type": "code",
                        "value": "<button>Clique aqui</button>"
                    },
                    {
                        "type": "text",
                        "value": "Agora, com um toque de **CSS** (o atributo `style`, que dá a aparência) e de **JavaScript** (o `onclick`, que dá o comportamento), o mesmo botão ganha cor e passa a reagir ao clique:"
                    },
                    {
                        "type": "code",
                        "value": "<button style=\"background: green; color: white;\" onclick=\"alert('Olá!')\">Clique aqui</button>"
                    },
                    {
                        "type": "text",
                        "value": "Percebe a divisão de tarefas? O fato de **existir** um `<button>` é HTML; o `style` com as cores é CSS; e o `onclick`, que dispara uma ação quando alguém clica, é JavaScript. Cada tecnologia no seu quadrado."
                    },
                    {
                        "type": "text",
                        "value": "## O que o navegador faz com o HTML\n\nQuando o navegador recebe o arquivo `.html`, ele faz um trabalho parecido com o de alguém montando um móvel a partir de um manual:\n\n1. **Lê o texto de cima para baixo**, uma tag de cada vez.\n2. **Interpreta cada tag** para descobrir o que ela significa (isto é um título, aquilo é uma imagem, e assim por diante).\n3. **Monta a página na tela** seguindo essa estrutura. Esse processo tem um nome técnico: **renderização**.\n\nO ponto mais importante: o navegador **não mostra as tags** na tela. As etiquetas `<h1>` e `<p>` são instruções para o navegador, não são conteúdo. O que aparece para o visitante é só o texto que estava _dentro_ das tags, já formatado. Você escreve as etiquetas; o visitante vê o resultado. Por exemplo, você escreve isto:"
                    },
                    {
                        "type": "code",
                        "value": "<h1>Minha primeira página</h1>\n<p>Estou aprendendo <strong>HTML</strong>!</p>"
                    },
                    {
                        "type": "text",
                        "value": "E o visitante **vê** na tela apenas duas linhas: o texto \"Minha primeira página\" grande e destacado (porque é um `<h1>`) e, logo abaixo, \"Estou aprendendo HTML!\", com a palavra \"HTML\" em negrito (por causa do `<strong>`, que serve para dar destaque forte). Nenhum `<`, `>` ou nome de tag aparece: eles fizeram o trabalho de organizar o conteúdo e saíram de vista."
                    },
                    {
                        "type": "text",
                        "value": "## Cliente e servidor: quem é quem\n\nFalta uma última peça: como a página **chega** até você? Aqui entram dois personagens.\n\n- O **cliente** é o seu navegador, o programa que **pede** a página.\n- O **servidor** é um computador (quase sempre bem longe, num data center) que fica ligado o tempo todo **guardando** os arquivos e **entregando** quando alguém pede.\n\nA analogia clássica é a de um **restaurante**:\n\n- Você, sentado à mesa, é o **cliente**: faz o pedido.\n- A **cozinha** é o **servidor**: prepara e manda o prato.\n- O **garçom** é a **internet**, que leva o pedido e traz a resposta.\n\nNa prática: você digita `ensina.dev` no navegador (o cliente faz o pedido) e esse pedido viaja pela internet até o servidor. O servidor encontra o arquivo HTML e o envia de volta. O navegador recebe e renderiza a página na sua tela. Tudo isso acontece em uma fração de segundo."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** uma página web é um arquivo de **texto** com extensão `.html`. O **HTML** é uma linguagem de **marcação**: ele etiqueta o conteúdo (o que é título, parágrafo, imagem) em vez de programar lógica. Ele forma um trio com o **CSS** (aparência) e o **JavaScript** (comportamento). O **navegador**, que é o **cliente**, baixa o arquivo do **servidor** e o **renderiza**, transformando as tags numa página visível, sem nunca mostrar as etiquetas."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que o HTML é uma linguagem de marcação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele etiqueta o conteúdo, indicando o que é título, parágrafo ou imagem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele calcula valores e toma decisões, repetindo tarefas quando necessário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele define as cores, fontes e espaçamentos visuais da página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele guarda os arquivos do site dentro de um servidor na internet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na divisão de tarefas da web, qual tecnologia é responsável pela estrutura, o esqueleto da página?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "HTML",
                                "isCorrect": true
                            },
                            {
                                "text": "CSS",
                                "isCorrect": false
                            },
                            {
                                "text": "JavaScript",
                                "isCorrect": false
                            },
                            {
                                "text": "O navegador",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o navegador faz com tags como `<h1>` e `<p>` ao exibir a página?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Interpreta as tags como instruções; não as exibe, só mostra o conteúdo já formatado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Mostra as tags na tela, junto com o conteúdo, para o visitante ver a estrutura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga todo o texto escrito dentro dessas tags.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reenvia as tags ao servidor para serem processadas por lá.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na analogia do restaurante para cliente e servidor, o que representa o cliente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O navegador, que faz o pedido da página.",
                                "isCorrect": true
                            },
                            {
                                "text": "O computador remoto que guarda e entrega o arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo `.html` que compõe a página.",
                                "isCorrect": false
                            },
                            {
                                "text": "A linguagem CSS, responsável pelo visual da página.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega afirma: \"fazer uma página em HTML é programar, porque o HTML tem lógica e faz cálculos\". Qual resposta corrige melhor essa ideia?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O HTML não tem lógica nem cálculos: ele organiza o conteúdo, isso é papel do JavaScript.",
                                "isCorrect": true
                            },
                            {
                                "text": "O HTML de fato calcula valores, toma decisões e repete tarefas, como qualquer programa.",
                                "isCorrect": false
                            },
                            {
                                "text": "O HTML só deixa o texto colorido; quem estrutura a página é o CSS.",
                                "isCorrect": false
                            },
                            {
                                "text": "O HTML é um programa de servidor que devolve números ao navegador.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A estrutura de um documento HTML",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A estrutura de um documento HTML\n\nNa aula anterior você viu o que é o HTML. Agora vamos montar o **esqueleto** que toda página HTML tem, do site mais simples ao mais complexo. É um gabarito que você vai repetir a vida inteira, então vale a pena entender o papel de cada linha em vez de só copiar e colar.\n\nA boa notícia é que esse esqueleto é sempre o mesmo. Depois de escrevê-lo umas poucas vezes, ele vira automático."
                    },
                    {
                        "type": "quote",
                        "value": "Todo documento HTML começa com o mesmo **esqueleto**: uma declaração `<!DOCTYPE html>`, o elemento `<html>` que envolve tudo e, dentro dele, dois blocos, o `<head>` (informações sobre a página, que não aparecem na tela) e o `<body>` (o conteúdo visível). Aprenda essa estrutura uma vez e ela serve para sempre."
                    },
                    {
                        "type": "text",
                        "value": "## O esqueleto completo\n\nTodo documento HTML, do mais simples ao mais complexo, começa com esta mesma estrutura. Não precisa entender cada detalhe agora, só observe o formato geral. Vamos destrinchar cada parte logo em seguida:"
                    },
                    {
                        "type": "code",
                        "value": "<!DOCTYPE html>\n<html lang=\"pt-br\">\n  <head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Minha primeira página</title>\n  </head>\n  <body>\n    <h1>Olá, mundo!</h1>\n    <p>Esta é a minha primeira página em HTML.</p>\n  </body>\n</html>"
                    },
                    {
                        "type": "text",
                        "value": "## Quatro peças, de fora para dentro\n\nRepare que o documento é feito de peças **encaixadas uma dentro da outra**, como caixas dentro de caixas. São quatro peças principais:\n\n1. `<!DOCTYPE html>`: a primeira linha, um aviso para o navegador.\n2. `<html>`: a caixa que envolve **todo** o documento.\n3. `<head>`: dentro do `<html>`, guarda informações sobre a página.\n4. `<body>`: também dentro do `<html>`, guarda o conteúdo visível.\n\nVamos ver uma por uma."
                    },
                    {
                        "type": "text",
                        "value": "## 1. A primeira linha: `<!DOCTYPE html>`\n\nEssa linha esquisita, com um ponto de exclamação, **não é uma tag comum**. Ela é uma **declaração**: avisa o navegador de que o documento usa HTML na sua versão moderna, o HTML5.\n\nVocê não precisa entender a história por trás disso agora. Só guarde: **toda página começa com `<!DOCTYPE html>`, escrito exatamente assim, na primeira linha**. Sem ela, alguns navegadores entram num \"modo antigo\" e podem exibir a página de um jeito estranho."
                    },
                    {
                        "type": "text",
                        "value": "## 2. `<html>`: a raiz de tudo\n\nLogo depois vem a tag `<html>`, que é aberta no começo e fechada com `</html>` no fim. **Tudo** o que faz parte da página fica dentro dela: é a caixa mais externa, também chamada de **elemento raiz**.\n\nRepare que ela vem com uma informação extra, o `lang=\"pt-br\"`. Isso é um **atributo** (a gente estuda atributos com calma na próxima aula) e serve para dizer que a página está em **português do Brasil**. Isso ajuda leitores de tela a pronunciar as palavras corretamente e navegadores a oferecer tradução. É um detalhe pequeno que faz diferença na acessibilidade."
                    },
                    {
                        "type": "code",
                        "value": "<html lang=\"pt-br\">\n  <!-- todo o resto da página fica aqui dentro -->\n</html>"
                    },
                    {
                        "type": "text",
                        "value": "## 3. O `<head>`: os bastidores da página\n\nDentro do `<html>` moram dois blocos. O primeiro é o `<head>` (cabeça, em inglês). Pense nele como os **bastidores** de um teatro: coisas importantíssimas acontecem ali, mas o público não as vê diretamente.\n\nO `<head>` guarda **informações sobre a página**, os chamados **metadados**: qual é o título, qual a codificação de caracteres, quais arquivos de estilo carregar, e assim por diante. **Nada do que está no `<head>` aparece no corpo da página.** Veja um exemplo:"
                    },
                    {
                        "type": "code",
                        "value": "<head>\n  <meta charset=\"UTF-8\">\n  <title>Sobre mim</title>\n</head>"
                    },
                    {
                        "type": "text",
                        "value": "## Dois itens essenciais do `<head>`\n\n### `<meta charset=\"UTF-8\">`\n\nEssa linha define a **codificação de caracteres** da página. Traduzindo: ela ensina o navegador a entender letras acentuadas e símbolos.\n\nPense assim: o computador guarda tudo como números, e o `charset` é a **tabela** que diz qual número corresponde a qual letra. O `UTF-8` é a tabela mais completa e a mais usada, ela conhece \"á\", \"ç\", \"ã\", \"ê\" e praticamente qualquer símbolo. Se você esquecer essa linha, é bem provável que os acentos apareçam trocados por símbolos estranhos, tipo \"vocÃª\" no lugar de \"você\". Por isso ela nunca deve faltar.\n\n### `<title>`\n\nO `<title>` define o **nome da página**. Esse texto não aparece dentro da página em si, mas sim:\n\n- na **aba do navegador**, lá em cima;\n- no nome que fica salvo quando alguém adiciona a página aos **favoritos**;\n- no **título** que aparece nos resultados de busca do Google.\n\nOu seja, é um texto pequeno, mas que muita gente vê. Capriche nele."
                    },
                    {
                        "type": "text",
                        "value": "## 4. O `<body>`: onde a página acontece\n\nO segundo bloco dentro do `<html>` é o `<body>` (corpo, em inglês). Se o `<head>` são os bastidores, o `<body>` é o **palco**: tudo o que o visitante vê na tela mora aqui, os títulos, os parágrafos, as imagens, os links, os botões.\n\nÉ no `<body>` que você vai passar a maior parte do seu tempo construindo páginas. Um exemplo bem simples de corpo:"
                    },
                    {
                        "type": "code",
                        "value": "<body>\n  <h1>Bem-vindo ao meu site</h1>\n  <p>Aqui eu falo sobre as minhas viagens.</p>\n  <p>Fique à vontade para explorar!</p>\n</body>"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"`<head>`\",\"`<body>`\"],[\"Papel\",\"Informações sobre a página (metadados)\",\"Conteúdo da página\"],[\"Aparece na tela?\",\"Não\",\"Sim\"],[\"Exemplos do que vai dentro\",\"`<meta charset>`, `<title>`\",\"`<h1>`, `<p>`, imagens, links\"],[\"Analogia (teatro)\",\"Os bastidores\",\"O palco\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Indentação: por que o código tem \"escadinha\"\n\nVocê deve ter reparado que, nos exemplos, o código tem uns **recuos** (espaços no começo das linhas) que formam uma escadinha. Isso se chama **indentação**, e ela é feita de propósito.\n\nA indentação **não muda** o que a página faz: o navegador ignora esses espaços. Ela existe para os **humanos**. Como os elementos ficam encaixados uns dentro dos outros, o recuo mostra visualmente **quem está dentro de quem**. O que está mais para dentro (mais recuado) está contido no que está mais para fora.\n\nA regra prática é simples: cada vez que você entra em um elemento, empurra o conteúdo um pouco mais para a direita (o costume é usar 2 espaços). Compare os dois códigos abaixo. O primeiro funciona, mas é sofrível de ler:"
                    },
                    {
                        "type": "code",
                        "value": "<html lang=\"pt-br\">\n<head>\n<title>Bagunçado</title>\n</head>\n<body>\n<h1>Título</h1>\n<p>Um parágrafo perdido.</p>\n</body>\n</html>"
                    },
                    {
                        "type": "code",
                        "value": "<html lang=\"pt-br\">\n  <head>\n    <title>Organizado</title>\n  </head>\n  <body>\n    <h1>Título</h1>\n    <p>Um parágrafo bem posicionado.</p>\n  </body>\n</html>"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet do esqueleto:** todo HTML começa com `<!DOCTYPE html>`, seguido de `<html lang=\"pt-br\">`, que envolve tudo. Dentro dele vêm o `<head>` (metadados invisíveis, como `<meta charset=\"UTF-8\">` para os acentos e `<title>` para a aba) e o `<body>` (todo o conteúdo visível). A **indentação** em escadinha não muda nada para o navegador, mas mostra o encaixe dos elementos e mantém o código legível."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual elemento define o texto que aparece na aba do navegador?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<title>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<head>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<h1>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<body>`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve a linha `<!DOCTYPE html>` no início do arquivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Avisa o navegador que o documento usa a versão moderna do HTML.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cria o título principal que aparece no topo visível da página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Importa a folha de estilos CSS usada pela página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Define a cor de fundo aplicada ao documento inteiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença entre o conteúdo do `<head>` e o do `<body>`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O `<head>` guarda metadados invisíveis; o `<body>` guarda o conteúdo visível.",
                                "isCorrect": true
                            },
                            {
                                "text": "O `<head>` guarda o conteúdo visível e o `<body>` guarda os metadados da página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois exibem conteúdo na tela; a diferença é só a ordem de aparição.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `<head>` funciona no computador; o `<body>`, apenas no celular.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é importante incluir `<meta charset=\"UTF-8\">` no `<head>`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Para o navegador exibir corretamente acentos como á, ç e ã.",
                                "isCorrect": true
                            },
                            {
                                "text": "Para definir o texto exibido na aba do navegador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para deixar todo o texto da página automaticamente em negrito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para acelerar o carregamento da página no celular.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre a estrutura de um documento HTML, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O `<html>` é a raiz do documento; dentro dele ficam `<head>` e depois `<body>`.",
                                "isCorrect": true
                            },
                            {
                                "text": "O `<body>` deve vir antes do `<head>`, já que o conteúdo importa mais que os metadados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A declaração `<!DOCTYPE html>` deve ficar dentro do `<head>`, junto dos metadados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O atributo `lang=\"pt-br\"` deve ser escrito na tag `<title>`, não na `<html>`.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tags, elementos e atributos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tags, elementos e atributos\n\nVocê já viu tags como `<p>` e `<h1>` aparecerem por aí. Agora vamos **abrir** essas etiquetas e entender exatamente do que elas são feitas. Esta aula é o coração da trilha: quem domina tags, elementos e atributos domina o HTML inteiro, porque **tudo** em HTML é construído a partir dessas três ideias.\n\nVamos com calma, uma ideia de cada vez, sempre com código de verdade para você olhar."
                    },
                    {
                        "type": "quote",
                        "value": "Um **elemento** de HTML costuma ter três partes: a **tag de abertura** (ex.: `<p>`), o **conteúdo** (o que vai no meio) e a **tag de fechamento** (ex.: `</p>`, com uma barra `/`). O conjunto inteiro é o elemento. Alguns elementos, os **vazios**, não têm conteúdo nem fechamento. E dentro das tags de abertura podem existir **atributos**, informações extras no formato `nome=\"valor\"`."
                    },
                    {
                        "type": "text",
                        "value": "## Anatomia de um elemento\n\nVamos dissecar o elemento mais simples que existe, um parágrafo. Olhe com atenção para o código abaixo:"
                    },
                    {
                        "type": "code",
                        "value": "<p>Olá, mundo!</p>"
                    },
                    {
                        "type": "text",
                        "value": "Esse pedacinho tem **três partes**:\n\n1. **Tag de abertura**: `<p>`. Marca o **início** do elemento. Fica sempre entre `<` e `>`.\n2. **Conteúdo**: `Olá, mundo!`. É o que aparece na tela, o miolo do elemento.\n3. **Tag de fechamento**: `</p>`. Marca o **fim** do elemento. É igual à de abertura, mas com uma **barra** `/` antes do nome.\n\nO conjunto das três partes é o **elemento** `<p>`. A regra de ouro: quase toda tag que você **abre**, precisa depois **fechar**. Esquecer a tag de fechamento é um dos erros mais comuns de quem está começando."
                    },
                    {
                        "type": "text",
                        "value": "## Aninhamento: elementos dentro de elementos\n\nRaramente uma página tem um elemento só. O normal é colocar uns elementos **dentro** dos outros, feito caixas menores dentro de caixas maiores. Isso se chama **aninhamento**.\n\nVeja uma lista de compras. Temos um título, e uma lista (`<ul>`, de _unordered list_, lista não ordenada) que contém vários itens (`<li>`, de _list item_):"
                    },
                    {
                        "type": "code",
                        "value": "<body>\n  <h1>Minha lista de compras</h1>\n  <ul>\n    <li>Arroz</li>\n    <li>Feijão</li>\n    <li>Café</li>\n  </ul>\n</body>"
                    },
                    {
                        "type": "text",
                        "value": "Repare no encaixe: cada `<li>` está **dentro** do `<ul>`, que por sua vez está **dentro** do `<body>`. A indentação (a escadinha) mostra exatamente essa hierarquia de quem está dentro de quem.\n\nHá uma **regra de ouro** para aninhar: o elemento que você **abriu por último** deve ser o **primeiro a fechar**. É como fechar caixas, você fecha primeiro a caixa de dentro, depois a de fora. Se as tags se cruzam, o HTML fica inválido."
                    },
                    {
                        "type": "code",
                        "value": "<!-- CERTO: a tag aberta por último (strong) fecha primeiro -->\n<p>Isto é <strong>muito importante</strong>.</p>\n\n<!-- ERRADO: as tags se cruzam (strong abre dentro do p, mas fecha depois dele) -->\n<p>Isto é <strong>muito importante</p></strong>"
                    },
                    {
                        "type": "text",
                        "value": "No exemplo errado acima, a tag `<strong>` foi aberta **dentro** do parágrafo, então ela precisava ser fechada **antes** do `</p>`. Como o `</p>` veio primeiro, as tags se cruzaram. O navegador até tenta \"consertar\" isso sozinho, mas o resultado costuma sair diferente do que você esperava. Melhor não depender da sorte: feche sempre na ordem inversa da abertura."
                    },
                    {
                        "type": "text",
                        "value": "## Elementos vazios (void)\n\nNem todo elemento envolve um conteúdo. Alguns servem para representar uma coisa que **não tem texto dentro**, como uma quebra de linha ou uma imagem. Esses são os **elementos vazios**, também chamados de **void**. Eles têm **só a tag de abertura**, sem conteúdo e sem tag de fechamento. Os mais comuns:\n\n- `<br>`: uma **quebra de linha** (força o texto a pular para a linha de baixo).\n- `<hr>`: uma **linha divisória** horizontal, para separar seções.\n- `<img>`: uma **imagem**."
                    },
                    {
                        "type": "code",
                        "value": "<p>Primeira linha<br>Segunda linha</p>\n\n<hr>\n\n<img src=\"gato.jpg\" alt=\"Um gato dormindo no sofá\">"
                    },
                    {
                        "type": "text",
                        "value": "Repare que não existe `</br>` nem `</img>`: não faz sentido \"fechar\" algo que não tem conteúdo dentro. Você pode até encontrar por aí a forma `<br />` (com uma barra no fim), que também é válida, mas hoje em dia o comum é escrever só `<br>`. O importante é lembrar: **elemento vazio não tem tag de fechamento**."
                    },
                    {
                        "type": "text",
                        "value": "## Atributos: informações extras na tag\n\nRepare que, no exemplo do `<img>`, apareceram umas coisinhas dentro da tag: `src=\"gato.jpg\"` e `alt=\"Um gato dormindo no sofá\"`. Isso são **atributos**.\n\nUm atributo é uma **informação extra** que você dá a um elemento, escrita **dentro da tag de abertura**. A ideia é a seguinte: a tag `<img>` diz \"aqui vai uma imagem\", mas sozinha ela não sabe _qual_ imagem. É o atributo `src` que responde: \"a imagem está no arquivo `gato.jpg`\". Os atributos deixam os elementos mais específicos."
                    },
                    {
                        "type": "code",
                        "value": "<html lang=\"pt-br\"> ... </html>\n\n<img src=\"perfil.jpg\" alt=\"Foto de perfil sorrindo\">\n\n<a href=\"https://ensina.dev\">Visite a ensina.dev</a>"
                    },
                    {
                        "type": "text",
                        "value": "A sintaxe de um atributo é sempre a mesma: **nome do atributo**, um sinal de **igual** `=`, e o **valor** entre **aspas**.\n\n```\nnome=\"valor\"\n```\n\nAlguns detalhes que valem a pena guardar:\n\n- Os atributos ficam **só na tag de abertura**, nunca na de fechamento.\n- Você pode ter **vários** atributos no mesmo elemento, separados por um **espaço** (como o `<img>`, que tem `src` e `alt`).\n- Sempre coloque o valor **entre aspas**. Nos exemplos: `lang` diz o idioma da página, `src` diz o endereço do arquivo da imagem, `alt` dá uma descrição da imagem, e `href` diz para onde um link (`<a>`, de _anchor_, âncora) leva."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Atributo\",\"Aparece em...\",\"O que faz\"],[\"`lang`\",\"`<html>`\",\"Informa o idioma da página (ex.: `pt-br`)\"],[\"`src`\",\"`<img>`\",\"Diz o endereço (o arquivo) da imagem a ser exibida\"],[\"`alt`\",\"`<img>`\",\"Descrição em texto da imagem (acessibilidade e reserva)\"],[\"`href`\",\"`<a>`\",\"O endereço de destino para onde o link leva\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Um atributo que não pode faltar: o `alt`\n\nVale um destaque para o `alt` da imagem, porque muita gente esquece dele. O `alt` (de _alternative text_, texto alternativo) descreve a imagem em palavras. Ele é importante por dois motivos:\n\n- **Acessibilidade**: pessoas cegas navegam com **leitores de tela**, programas que leem a página em voz alta. Como o programa não \"enxerga\" a foto, ele lê o `alt`. Sem `alt`, a imagem é um silêncio.\n- **Reserva (fallback)**: se a imagem não carregar (link quebrado, internet lenta), o navegador mostra o texto do `alt` no lugar, e o visitante ao menos sabe o que deveria estar ali."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Bom: descreve o que está na imagem -->\n<img src=\"cachorro.jpg\" alt=\"Cachorro caramelo correndo na praia\">\n\n<!-- Evite: sem alt, quem usa leitor de tela não sabe o que é a imagem -->\n<img src=\"cachorro.jpg\">"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** um **elemento** = tag de abertura + conteúdo + tag de fechamento (`<p>Olá</p>`); a de fechamento leva uma `/`. Elementos ficam **aninhados** (último a abrir, primeiro a fechar). Os **vazios/void** (`<br>`, `<hr>`, `<img>`) não têm conteúdo nem fechamento. **Atributos** são informações extras na tag de abertura, no formato `nome=\"valor\"`: `lang`, `src`, `alt`, `href`. E nunca esqueça o `alt` nas imagens."
                    }
                ],
                "questions": [
                    {
                        "statement": "No elemento `<p>Olá!</p>`, qual é a tag de fechamento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`</p>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<p>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`Olá!`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<p></p>`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual destes é um elemento vazio (void), ou seja, não tem tag de fechamento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<br>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<p>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<h1>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<title>`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é um atributo em HTML e onde ele fica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É uma informação extra, tipo `nome=\"valor\"`, na tag de abertura.",
                                "isCorrect": true
                            },
                            {
                                "text": "É o texto posicionado entre a tag de abertura e a de fechamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma tag especial que sempre aparece sozinha, sem valor algum.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um comentário que o navegador simplesmente descarta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o atributo `alt` em uma tag `<img>`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Descreve a imagem em texto, para leitores de tela e como reserva.",
                                "isCorrect": true
                            },
                            {
                                "text": "Define o endereço do arquivo de imagem a ser exibido na página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Alinha a imagem à esquerda do parágrafo ao redor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumenta automaticamente a resolução da imagem exibida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções mostra um aninhamento correto de elementos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "`<p>Um texto <strong>em destaque</strong> aqui.</p>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<p>Um texto <strong>em destaque</p></strong> aqui.`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<strong><p>Um texto em destaque</strong></p>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<p>Um texto <strong>em destaque<strong> aqui.</p>`",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Seu primeiro HTML na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Seu primeiro HTML na prática\n\nChega de teoria: hoje você vai **criar e abrir** a sua primeira página de verdade, no seu próprio computador. Vai ver que é mais simples do que parece, não precisa instalar nada complicado nem estar conectado à internet.\n\nAo final desta aula você terá um arquivo HTML funcionando, saberá deixar recados no código com comentários e vai conhecer os tropeços mais comuns de quem está começando, para não cair neles."
                    },
                    {
                        "type": "quote",
                        "value": "Um arquivo HTML é só um **arquivo de texto** salvo com a extensão `.html`. Qualquer editor de texto serve para escrever, e qualquer navegador serve para abrir, com um duplo clique. Não é preciso internet nem servidor para testar uma página no seu próprio computador."
                    },
                    {
                        "type": "text",
                        "value": "## Passo 1: criar o arquivo\n\nAbra um **editor de texto** qualquer, o Bloco de Notas (Windows), o TextEdit (Mac) ou, de preferência, um editor de código como o VS Code (falaremos dele no fim).\n\nCrie um arquivo novo e salve com um nome que termine em `.html`, por exemplo `index.html`. Duas dicas:\n\n- Evite **espaços e acentos** no nome do arquivo (use `index.html`, não `minha página.html`).\n- O nome `index.html` é uma convenção para a **página inicial** de um site. É um bom padrão para começar."
                    },
                    {
                        "type": "text",
                        "value": "## Passo 2: escrever o HTML\n\nDentro do arquivo, digite (ou copie) o documento abaixo. Ele é o esqueleto que você aprendeu na aula 2, agora preenchido com um conteúdo de \"sobre mim\":"
                    },
                    {
                        "type": "code",
                        "value": "<!DOCTYPE html>\n<html lang=\"pt-br\">\n  <head>\n    <meta charset=\"UTF-8\">\n    <title>Sobre mim</title>\n  </head>\n  <body>\n    <h1>Olá, eu sou a Ana</h1>\n    <p>Estou aprendendo HTML na ensina.dev.</p>\n    <p>Meu hobby favorito é andar de bicicleta.</p>\n  </body>\n</html>"
                    },
                    {
                        "type": "text",
                        "value": "## Passo 3: abrir no navegador\n\nSalve o arquivo. Agora encontre-o no seu computador e dê **dois cliques** nele, ou arraste-o para uma aba aberta do navegador. Pronto: a sua página aparece na tela!\n\nRepare que, na barra de endereço, aparece algo como `file:///C:/Users/voce/index.html`. Esse `file://` é o jeito de o navegador dizer \"estou abrindo um arquivo direto do seu computador\". Ou seja, você **não precisa de internet nem de um servidor** para testar: o navegador lê o arquivo local. Sempre que mexer no código, salve e aperte **F5** no navegador para ver a página atualizada."
                    },
                    {
                        "type": "text",
                        "value": "## Entendendo o código linha a linha\n\nAgora que já funcionou, vamos revisitar o mesmo documento com **comentários** explicando o que cada parte faz. (Esses comentários são só para você entender; já já explicamos como eles funcionam.)"
                    },
                    {
                        "type": "code",
                        "value": "<!DOCTYPE html>\n<html lang=\"pt-br\">\n  <head>\n    <!-- charset: faz os acentos (á, ç, ã) aparecerem certos -->\n    <meta charset=\"UTF-8\">\n    <!-- title: o nome que aparece na aba do navegador -->\n    <title>Sobre mim</title>\n  </head>\n  <body>\n    <!-- Tudo daqui para baixo aparece na tela -->\n    <h1>Olá, eu sou a Ana</h1>\n    <p>Estou aprendendo HTML na ensina.dev.</p>\n  </body>\n</html>"
                    },
                    {
                        "type": "text",
                        "value": "## Comentários em HTML\n\nAqueles trechos entre `<!--` e `-->` são **comentários**. Um comentário é um recado que você deixa no código: o navegador **ignora** completamente o que estiver ali dentro, e ele **não aparece** na página para o visitante.\n\nComentários servem para três coisas principais:\n\n- **Explicar** um trecho do código, para você lembrar depois (ou para outra pessoa entender).\n- **Organizar** o arquivo em seções (\"aqui começa o rodapé\", por exemplo).\n- **Desativar** temporariamente um pedaço de código sem precisar apagá-lo."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Cabeçalho do site -->\n<h1>Minha loja</h1>\n\n<!-- Lembrete: adicionar a foto do produto aqui depois -->\n\n<!-- Este parágrafo está desativado por enquanto:\n<p>Promoção relâmpago!</p>\n-->"
                    },
                    {
                        "type": "text",
                        "value": "No exemplo acima temos os três usos: um comentário que **rotula** uma seção, um que serve de **lembrete** para o futuro, e um que **desativa** um parágrafo (o `<p>` da promoção não vai aparecer na página, porque está dentro de um comentário). Nada disso é exibido para quem visita o site."
                    },
                    {
                        "type": "text",
                        "value": "## Erros comuns de iniciante\n\nSe algo der errado, respire fundo: **todo mundo** passa por esses tropeços no começo. Saber reconhecê-los já resolve metade do problema. Vamos aos clássicos.\n\nO primeiro é **esquecer de fechar uma tag**. Toda tag que abre (menos os elementos vazios) precisa da sua tag de fechamento:"
                    },
                    {
                        "type": "code",
                        "value": "<!-- Errado: o primeiro <p> nunca foi fechado -->\n<p>Primeiro parágrafo.\n<p>Segundo parágrafo.</p>\n\n<!-- Certo: cada parágrafo abre e fecha -->\n<p>Primeiro parágrafo.</p>\n<p>Segundo parágrafo.</p>"
                    },
                    {
                        "type": "text",
                        "value": "Quando você esquece de fechar uma tag, o navegador tenta \"adivinhar\" onde o elemento termina, e o resultado costuma sair torto: espaçamentos estranhos, texto no lugar errado, formatação que \"vaza\" para onde não devia. Como o navegador não mostra uma mensagem de erro (ele apenas faz o melhor que consegue), esse tipo de problema pode ser confuso. A dica é sempre conferir se cada tag aberta tem a sua correspondente de fechamento.\n\nO segundo erro clássico é **esquecer as aspas** no valor de um atributo:"
                    },
                    {
                        "type": "code",
                        "value": "<!-- Errado: sem aspas, o valor \"Minha foto\" quebra por causa do espaço -->\n<img src=foto.jpg alt=Minha foto>\n\n<!-- Certo: sempre coloque o valor entre aspas -->\n<img src=\"foto.jpg\" alt=\"Minha foto\">"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Erro comum\",\"O que costuma acontecer\",\"Como evitar\"],[\"Esquecer de fechar a tag\",\"Layout torto, formatação vaza para onde não devia\",\"Toda tag que abre, feche (exceto os elementos vazios)\"],[\"Cruzar tags aninhadas\",\"O navegador \\\"conserta\\\" do jeito dele; resultado imprevisível\",\"Última tag a abrir é a primeira a fechar\"],[\"Valor de atributo sem aspas\",\"Quebra quando o valor tem espaços\",\"Escreva sempre `nome=\\\"valor\\\"`, com aspas\"],[\"Salvar com a extensão errada (`.txt`)\",\"O navegador mostra o código como texto, não a página\",\"Salve o arquivo como `.html`\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Dicas para seguir em frente\n\nVocê acabou de criar sua primeira página, isso é uma conquista de verdade. Antes de continuar, duas dicas que vão facilitar muito a sua vida:\n\n- Troque o Bloco de Notas por um **editor de código** como o **VS Code**: ele é gratuito, colore o código para ficar mais fácil de ler, avisa quando você esquece de fechar uma tag e ajuda a indentar automaticamente.\n- Adote o **ciclo mão na massa**: escreva um pouco, salve, aperte **F5** no navegador e veja o resultado. Errar, ajustar e testar de novo é exatamente assim que se aprende HTML.\n\nParabéns por concluir o **Módulo 1**! No próximo módulo vamos encher a página de conteúdo de verdade: títulos, listas, links, imagens e muito mais."
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet final:** um arquivo HTML é texto salvo como `.html` e abre com duplo clique no navegador (`file://`, sem precisar de internet). **Comentários** vão entre `<!--` e `-->`, não aparecem na tela e servem para explicar, organizar ou desativar trechos. Os erros mais comuns de iniciante são **esquecer de fechar tags**, **cruzar o aninhamento**, **omitir as aspas** dos atributos e **salvar com a extensão errada**. Um bom editor, como o VS Code, ajuda a evitar quase todos eles."
                    }
                ],
                "questions": [
                    {
                        "statement": "Com qual extensão você deve salvar um arquivo para que o navegador o abra como uma página web?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`.html`",
                                "isCorrect": true
                            },
                            {
                                "text": "`.txt`",
                                "isCorrect": false
                            },
                            {
                                "text": "`.doc`",
                                "isCorrect": false
                            },
                            {
                                "text": "`.web`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como se escreve um comentário em HTML?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<!-- assim -->`",
                                "isCorrect": true
                            },
                            {
                                "text": "`// assim`",
                                "isCorrect": false
                            },
                            {
                                "text": "`/* assim */`",
                                "isCorrect": false
                            },
                            {
                                "text": "`# assim`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que acontece com o texto dentro de um comentário HTML quando a página é aberta no navegador?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele é ignorado pelo navegador e não aparece na tela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele aparece na tela, mas escrito em letras cinza-claras.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele aparece somente na versão mobile, nunca no desktop.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele passa a ser o título exibido na aba do navegador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa de conexão com a internet e de um servidor para abrir e testar um arquivo `.html` que está no seu próprio computador?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não; o navegador abre o arquivo local, sem depender de internet.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim; sem um servidor ativo o navegador não exibe página alguma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim; é preciso publicar o arquivo online antes de conseguir abri-lo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, mas a página só carrega se houver conexão com a internet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No trecho `<p>Primeiro. <p>Segundo.</p>`, o primeiro parágrafo não foi fechado. Qual é a melhor descrição do problema e da correção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Falta o `</p>` do primeiro parágrafo, que ficou sem fechamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há problema nenhum; tags de parágrafo nunca exigem fechamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O erro é usar `<p>`; a tag correta seria `<paragraph>`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta um `<!DOCTYPE html>` antes dos parágrafos; é só isso.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Texto e links",
        "aulas": [
            {
                "titulo": "Títulos e parágrafos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Títulos e parágrafos\n\nBem-vindo ao Módulo 2! No módulo anterior você montou o esqueleto de uma página e entendeu como tudo se encaixa. Agora começa a parte mais gostosa: **encher a página de conteúdo**. E quase todo conteúdo de texto na web nasce de duas peças básicas, os **títulos** e os **parágrafos**.\n\nNesta aula você vai aprender a organizar um texto em seções com títulos de vários níveis, a escrever parágrafos, a quebrar linhas e a separar trechos com uma linha divisória. E vai descobrir uma característica curiosa: o HTML **não liga** para os espaços e as quebras de linha que você deixa no código."
                    },
                    {
                        "type": "quote",
                        "value": "Os títulos vão de `<h1>` (o mais importante) até `<h6>` (o menos importante) e servem para criar uma **hierarquia** de seções, como o índice de um livro, e não apenas para deixar o texto grande. O `<p>` marca um **parágrafo**. E guarde já: o navegador **colapsa** vários espaços e quebras de linha do código-fonte em um único espaço."
                    },
                    {
                        "type": "text",
                        "value": "## Os seis níveis de título\n\nO HTML oferece **seis** níveis de título, das tags `<h1>` até `<h6>`. O `h` vem de _heading_ (cabeçalho, em inglês) e o número indica a **importância**: o `<h1>` é o título mais importante da página, e a importância vai diminuindo até o `<h6>`, o menos importante.\n\nPor padrão, o navegador mostra o `<h1>` com a letra maior e vai encolhendo até o `<h6>`, o menor. Veja os seis lado a lado:"
                    },
                    {
                        "type": "code",
                        "value": "<h1>Título de nível 1</h1>\n<h2>Título de nível 2</h2>\n<h3>Título de nível 3</h3>\n<h4>Título de nível 4</h4>\n<h5>Título de nível 5</h5>\n<h6>Título de nível 6</h6>"
                    },
                    {
                        "type": "text",
                        "value": "## Hierarquia, não tamanho\n\nAqui mora o ponto mais importante da aula, e um erro clássico de iniciante. É tentador escolher um título pela **letra grande ou pequena** que ele produz: \"quero um texto médio, então uso `<h3>`\". **Não faça isso.** Os títulos existem para mostrar a **estrutura** do conteúdo, não a aparência. Quem cuida do tamanho é o CSS, que você vê mais para a frente.\n\nPense num **livro**. Ele tem um título geral (o `<h1>`), que se divide em capítulos (os `<h2>`), que por sua vez têm seções (`<h3>`) e subseções (`<h4>`). Os títulos do HTML montam exatamente esse **índice**. Três regras de ouro:\n\n- Use **um único** `<h1>` por página: é o assunto principal dela.\n- **Não pule níveis** de cima para baixo: depois de um `<h2>`, use `<h3>`, não vá direto para o `<h5>`.\n- Escolha o nível pela **importância** do trecho, nunca pelo tamanho que ele aparenta."
                    },
                    {
                        "type": "code",
                        "value": "<!-- CERTO: a hierarquia desce um degrau por vez -->\n<h1>Meu blog de viagens</h1>\n  <h2>Destinos na América do Sul</h2>\n    <h3>Patagônia</h3>\n    <h3>Deserto do Atacama</h3>\n  <h2>Dicas de bagagem</h2>\n\n<!-- EVITE: pular de h1 direto para h4 quebra o índice da página -->\n<h1>Meu blog de viagens</h1>\n  <h4>Destinos na América do Sul</h4>"
                    },
                    {
                        "type": "text",
                        "value": "Por que isso importa tanto? Por **dois motivos** bem concretos. O primeiro é a **acessibilidade**: quem usa leitor de tela costuma navegar \"pulando de título em título\" para achar o que procura, e uma hierarquia bagunçada vira um labirinto. O segundo é o **Google**: os buscadores usam os títulos para entender do que a sua página trata. Uma boa estrutura de títulos ajuda o seu site a ser encontrado."
                    },
                    {
                        "type": "text",
                        "value": "## Parágrafos com `<p>`\n\nSe os títulos são as placas que anunciam cada seção, os **parágrafos** são o texto corrido que preenche essas seções. Para marcar um parágrafo usamos a tag `<p>` (de _paragraph_), que você já conhece de vista.\n\nCada bloco de texto que forma uma ideia deve ir no seu **próprio** `<p>`. O navegador dá automaticamente um **espaço** entre um parágrafo e outro, o que deixa o texto respirando e fácil de ler:"
                    },
                    {
                        "type": "code",
                        "value": "<p>A pizza nasceu em Nápoles, na Itália, como uma comida simples e barata do povo.</p>\n\n<p>Hoje ela é servida no mundo inteiro, com recheios que variam de país para país.</p>\n\n<p>No Brasil, a pizza de calabresa é uma das mais pedidas.</p>"
                    },
                    {
                        "type": "text",
                        "value": "## O HTML engole os espaços\n\nAgora uma característica que costuma pegar todo iniciante de surpresa. No código, você pode caprichar em espaços e quebras de linha para deixar tudo bonito, mas o navegador **não liga** para isso: ele transforma **qualquer sequência** de espaços, tabs e quebras de linha em um **único espaço**. Isso se chama **colapso de espaços em branco** (_whitespace collapsing_).\n\nVeja este parágrafo escrito de um jeito propositalmente bagunçado:"
                    },
                    {
                        "type": "code",
                        "value": "<p>Este    texto    tem    muitos    espaços\n   e   várias\n   quebras   de   linha   no   código.</p>"
                    },
                    {
                        "type": "text",
                        "value": "Por mais espalhado que esteja no código, o visitante vê **uma única linha** contínua: \"Este texto tem muitos espaços e várias quebras de linha no código.\" Todos aqueles espaços e quebras viraram **um espaço só** entre cada palavra.\n\nA lição é importante: para o navegador, **você não separa parágrafos nem quebra linhas apertando Enter ou barra de espaço no código**. Quem faz isso são as tags. Para separar blocos de texto, use `<p>`. E, quando quiser forçar uma quebra dentro de um mesmo bloco, existe uma tag específica, que vem a seguir."
                    },
                    {
                        "type": "text",
                        "value": "## Quebra de linha com `<br>`\n\nÀs vezes você quer que o texto **pule para a linha de baixo** sem começar um parágrafo novo. O caso clássico é um **endereço** ou os **versos de um poema**, em que as linhas andam juntas, mas cada uma fica na sua. Para isso existe o `<br>` (de _break_, quebra).\n\nO `<br>` é um daqueles **elementos vazios** que você viu no Módulo 1: não tem conteúdo nem tag de fechamento, é só `<br>`. Cada `<br>` força **uma** quebra de linha ali onde você o coloca:"
                    },
                    {
                        "type": "code",
                        "value": "<p>\n  Rua das Flores, 123<br>\n  Bairro Jardim<br>\n  São Paulo - SP\n</p>\n\n<p>\n  Batatinha quando nasce<br>\n  espalha a rama pelo chão.\n</p>"
                    },
                    {
                        "type": "text",
                        "value": "Um cuidado importante: o `<br>` serve para quebras que fazem parte do **conteúdo** (endereços, versos, uma assinatura). Ele **não** é a ferramenta para dar espaço entre parágrafos ou empurrar coisas na página. Encher o código de `<br><br><br>` para \"espaçar\" é um vício feio, esse tipo de espaçamento é trabalho do CSS. Para separar ideias, o certo continua sendo o `<p>`."
                    },
                    {
                        "type": "text",
                        "value": "## Linha divisória com `<hr>`\n\nPor fim, quando você quer **separar visualmente** dois assuntos, existe o `<hr>` (de _horizontal rule_, régua horizontal). Ele desenha uma **linha horizontal** que atravessa a página, marcando uma mudança de tema, como aquele fio que separa seções de um documento.\n\nAssim como o `<br>`, o `<hr>` é um **elemento vazio**: escreve-se só `<hr>`, sem fechamento. Mais do que um traço bonito, ele carrega um **significado**: \"aqui termina um assunto e começa outro\"."
                    },
                    {
                        "type": "code",
                        "value": "<h2>Sobre o restaurante</h2>\n<p>Somos uma cantina italiana de comida caseira desde 1998.</p>\n\n<hr>\n\n<h2>Nosso cardápio</h2>\n<p>Massas, pizzas e sobremesas feitas na hora.</p>"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tag\",\"Para que serve\",\"É vazia (sem fechamento)?\"],[\"`<h1>` a `<h6>`\",\"Títulos em ordem de importância (hierarquia)\",\"Não\"],[\"`<p>`\",\"Parágrafo de texto\",\"Não\"],[\"`<br>`\",\"Quebra de linha dentro de um bloco\",\"Sim\"],[\"`<hr>`\",\"Linha divisória entre seções\",\"Sim\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** os títulos vão de `<h1>` (mais importante) a `<h6>` (menos importante) e montam a **hierarquia** da página, use um só `<h1>` e não pule níveis. O `<p>` marca parágrafos. O navegador **colapsa** espaços e quebras do código em um espaço só, então quebras de verdade se fazem com tags: `<br>` para pular linha dentro de um bloco (endereços, versos) e `<hr>` para uma linha divisória entre seções. `<br>` e `<hr>` são elementos vazios."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que os níveis de `<h1>` a `<h6>` representam em uma página?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma hierarquia de importância entre os títulos da página.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas seis tamanhos de letra diferentes, sem nenhum outro significado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Seis cores diferentes para pintar o texto dos títulos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade máxima de parágrafos permitida em cada seção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual tag força uma quebra de linha dentro de um mesmo bloco de texto, sem iniciar um novo parágrafo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<br>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<p>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<hr>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<h1>`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No código, você escreveu um parágrafo com vários espaços seguidos e algumas quebras de linha. Como o navegador exibe esse texto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele colapsa espaços e quebras em um único espaço entre as palavras.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele preserva exatamente os espaços e quebras de linha do código-fonte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele mostra uma mensagem de erro por causa dos espaços em excesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele apaga o parágrafo inteiro por causa da formatação inválida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que se recomenda escolher o nível do título pela importância do trecho, e não pelo tamanho da letra que ele produz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque os títulos formam a estrutura da página, e não sua aparência.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o `<h1>` só pode aparecer no máximo três vezes em cada página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador rejeita títulos fora de ordem alfabética.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o tamanho da letra dos títulos muda sozinho a cada visita.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma página tem um `<h1>` como título principal e, logo abaixo, o autor usou um `<h5>` para a primeira seção só porque achou o tamanho \"bonito\". Qual é a melhor avaliação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É um erro de hierarquia: depois do `<h1>` esperava-se `<h2>`, não `<h5>`.",
                                "isCorrect": true
                            },
                            {
                                "text": "Está correto: o nível do título deve seguir sempre o tamanho de letra desejado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Está certo, desde que a página tenha pelo menos um `<h6>` em algum lugar.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um erro, pois a tag `<h5>` não pode ser usada em nenhuma página.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Listas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Listas\n\nOlhe qualquer página que você usa no dia a dia e vai encontrar **listas** por toda parte: os itens de um menu, os passos de uma receita, os resultados de uma busca, os ingredientes de um produto. Sempre que a informação vem em **itens**, o HTML tem uma ferramenta certa para ela.\n\nNesta aula você vai conhecer os três tipos de lista do HTML: a **não ordenada** (com marcadores), a **ordenada** (numerada) e a **lista de definições** (termo e explicação). E vai aprender a encaixar uma lista dentro da outra."
                    },
                    {
                        "type": "quote",
                        "value": "Existem três tipos de lista: a **não ordenada** `<ul>`, com marcadores (bolinhas), para itens sem ordem; a **ordenada** `<ol>`, numerada, para quando a sequência importa; e a **de definições** `<dl>`, que casa um termo (`<dt>`) com a sua descrição (`<dd>`). Em `<ul>` e `<ol>`, cada item vai sempre dentro de um `<li>`."
                    },
                    {
                        "type": "text",
                        "value": "## Lista não ordenada com `<ul>`\n\nA lista **não ordenada** serve para itens em que a **ordem não importa**: uma lista de compras, os ingredientes de uma receita, as vantagens de um produto. Tanto faz o que vem primeiro.\n\nEla é feita com duas tags que andam sempre juntas: o `<ul>` (de _unordered list_, lista não ordenada) envolve a lista inteira, e cada item dentro dela vai em um `<li>` (de _list item_, item de lista). Por padrão, o navegador desenha uma **bolinha** (marcador) na frente de cada item:"
                    },
                    {
                        "type": "code",
                        "value": "<ul>\n  <li>Arroz</li>\n  <li>Feijão</li>\n  <li>Café</li>\n  <li>Pão</li>\n</ul>"
                    },
                    {
                        "type": "text",
                        "value": "Repare no encaixe, que você viu no Módulo 1: cada `<li>` fica **dentro** do `<ul>`, e a indentação (a escadinha) deixa isso na cara. Uma regra simples: dentro de um `<ul>`, os filhos diretos são sempre `<li>`, você não joga texto solto ali. O texto vai **dentro** de cada `<li>`."
                    },
                    {
                        "type": "text",
                        "value": "## Lista ordenada com `<ol>`\n\nQuando a **ordem importa**, é hora da lista **ordenada**. Pense nos **passos de uma receita**, nas instruções de montagem de um móvel ou na classificação de um campeonato: trocar a ordem muda tudo. Para isso usamos o `<ol>` (de _ordered list_, lista ordenada).\n\nA estrutura é idêntica à da lista não ordenada, os itens continuam em `<li>`, mas agora o navegador coloca **números** (1, 2, 3...) no lugar das bolinhas, e conta sozinho para você:"
                    },
                    {
                        "type": "code",
                        "value": "<ol>\n  <li>Quebre os ovos em uma tigela.</li>\n  <li>Adicione a farinha e misture.</li>\n  <li>Despeje na forma untada.</li>\n  <li>Leve ao forno por 40 minutos.</li>\n</ol>"
                    },
                    {
                        "type": "text",
                        "value": "## Mudando a numeração: `type` e `start`\n\nA lista ordenada aceita dois atributos úteis. O `type` troca o **estilo** da numeração: em vez de números, você pode usar letras ou algarismos romanos. E o `start` diz em que número a contagem **começa**, para quando você não quer começar do 1."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Numeração com letras maiúsculas: A, B, C... -->\n<ol type=\"A\">\n  <li>Introdução</li>\n  <li>Desenvolvimento</li>\n  <li>Conclusão</li>\n</ol>\n\n<!-- Começando a contagem no 5: 5, 6, 7... -->\n<ol start=\"5\">\n  <li>Quinto colocado</li>\n  <li>Sexto colocado</li>\n</ol>"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Valor de `type`\",\"Como numera\",\"Exemplo\"],[\"`1`\",\"Números (padrão)\",\"1, 2, 3\"],[\"`A`\",\"Letras maiúsculas\",\"A, B, C\"],[\"`a`\",\"Letras minúsculas\",\"a, b, c\"],[\"`I`\",\"Romanos maiúsculos\",\"I, II, III\"],[\"`i`\",\"Romanos minúsculos\",\"i, ii, iii\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Listas aninhadas\n\nE se um item da lista tiver, ele mesmo, uma sublista? É só colocar uma lista **dentro** de um `<li>`. Isso se chama lista **aninhada**, e é o jeito de representar subitens, como os tópicos e subtópicos de um índice.\n\nO detalhe que confunde no começo: a lista de dentro **não** fica solta entre os `<li>`, ela vai **dentro** do `<li>` a que pertence, junto com o texto daquele item. Veja:"
                    },
                    {
                        "type": "code",
                        "value": "<ul>\n  <li>Frutas\n    <ul>\n      <li>Maçã</li>\n      <li>Banana</li>\n    </ul>\n  </li>\n  <li>Bebidas\n    <ul>\n      <li>Água</li>\n      <li>Suco</li>\n    </ul>\n  </li>\n</ul>"
                    },
                    {
                        "type": "text",
                        "value": "Repare que o `<ul>` de dentro está **entre** a abertura e o fechamento de um `<li>` da lista de fora: primeiro vem o texto (\"Frutas\"), depois a sublista, e só então o `</li>` fecha o item. A indentação em escadinha vira sua melhor amiga aqui, é ela que deixa claro quem está dentro de quem. E você pode misturar os tipos: nada impede um `<ol>` aninhado dentro de um `<ul>`, ou o contrário."
                    },
                    {
                        "type": "text",
                        "value": "## Lista de definições com `<dl>`\n\nExiste ainda um terceiro tipo, menos famoso, mas muito útil: a **lista de definições**, feita para casar um **termo** com a sua **explicação**. É a estrutura perfeita para um **glossário**, uma lista de perguntas e respostas ou as características de um produto (\"Peso: 2 kg\", \"Cor: azul\").\n\nEla usa três tags: o `<dl>` (de _description list_) envolve tudo; o `<dt>` (de _description term_) é o **termo** que está sendo definido; e o `<dd>` (de _description details_) é a **descrição** daquele termo."
                    },
                    {
                        "type": "code",
                        "value": "<dl>\n  <dt>HTML</dt>\n  <dd>Linguagem de marcação que estrutura o conteúdo de uma página.</dd>\n\n  <dt>CSS</dt>\n  <dd>Linguagem que cuida da aparência: cores, tamanhos e espaçamentos.</dd>\n\n  <dt>Navegador</dt>\n  <dd>Programa que lê o HTML e o transforma na página que você vê.</dd>\n</dl>"
                    },
                    {
                        "type": "text",
                        "value": "No exemplo, cada `<dt>` (o termo, como \"HTML\") vem seguido do seu `<dd>` (a explicação). O navegador costuma mostrar a descrição levemente **recuada** à direita, para deixar claro que ela pertence ao termo logo acima. Um mesmo termo pode ter mais de uma descrição, e você pode ter quantos pares quiser dentro do `<dl>`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Lista\",\"Tags\",\"Quando usar\"],[\"Não ordenada\",\"`<ul>` + `<li>`\",\"Itens sem ordem (compras, ingredientes)\"],[\"Ordenada\",\"`<ol>` + `<li>`\",\"Itens em sequência (passos, ranking)\"],[\"De definições\",\"`<dl>` + `<dt>` + `<dd>`\",\"Termo e explicação (glossário, ficha)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** use `<ul>` para listas com marcadores (ordem não importa) e `<ol>` para listas numeradas (a sequência importa); nos dois, cada item vai em um `<li>`. No `<ol>`, o `type` muda o estilo (`A`, `a`, `I`, `i`) e o `start` escolhe o número inicial. Para **aninhar**, coloque a sublista **dentro** de um `<li>`. E, para casar termo e explicação, use a lista de definições `<dl>` com pares de `<dt>` (termo) e `<dd>` (descrição)."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais tags formam uma lista não ordenada (com marcadores)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<ul>` para a lista e `<li>` para cada item.",
                                "isCorrect": true
                            },
                            {
                                "text": "`<ol>` para a lista e `<li>` para cada item.",
                                "isCorrect": false
                            },
                            {
                                "text": "`<dl>` para a lista e `<dd>` para cada item.",
                                "isCorrect": false
                            },
                            {
                                "text": "`<list>` para a lista e `<item>` para cada item.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual situação a lista ordenada `<ol>` é mais adequada que a não ordenada `<ul>`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quando a ordem dos itens importa, como nos passos de uma receita.",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando os itens não têm nenhuma ordem, como numa lista de compras.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando você quer casar um termo com a sua definição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando a lista tem apenas um item.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que faz o atributo `start` em uma lista ordenada, como em `<ol start=\"5\">`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Faz a numeração da lista começar no 5 em vez de 1.",
                                "isCorrect": true
                            },
                            {
                                "text": "Limita a lista a no máximo 5 itens.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixa a lista com 5 espaços de recuo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Troca os números por letras a partir da quinta posição.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como se cria uma lista aninhada (uma sublista dentro de outra lista)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Colocando a sublista completa dentro de um `<li>` da lista de fora.",
                                "isCorrect": true
                            },
                            {
                                "text": "Colocando a sublista solta, entre dois `<li>` da lista de fora.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrevendo dois `<ul>` um ao lado do outro, sem nenhum `<li>`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é possível: listas não podem ficar dentro de outras listas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você está montando um glossário em que cada palavra tem uma explicação. Qual estrutura é a mais indicada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma lista de definições `<dl>`, com o termo em `<dt>` e a explicação em `<dd>`.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma lista ordenada `<ol>`, com o termo e a explicação no mesmo `<li>`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma sequência de `<h1>` para os termos e `<p>` para as explicações.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma lista não ordenada `<ul>` em que cada `<li>` contém só o termo, sem a explicação.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ênfase e formatação de texto",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ênfase e formatação de texto\n\nNem toda palavra em um texto tem o mesmo peso. Umas você quer **destacar**, outras dizer em voz mais baixa, outras marcar como uma sigla ou um trecho de código. O HTML tem um punhado de tags feitas para dar esse tempero ao texto, e o mais interessante é que muitas delas carregam um **significado**, não só uma aparência.\n\nNesta aula você vai conhecer as tags de ênfase (`<strong>` e `<em>`), entender por que elas são diferentes de `<b>` e `<i>`, e ainda ver como destacar detalhes, mostrar código e citar frases de outras pessoas."
                    },
                    {
                        "type": "quote",
                        "value": "Prefira as tags com **significado**: `<strong>` marca algo **importante** (o navegador mostra em negrito) e `<em>` marca uma **ênfase** de entonação (mostra em itálico). As irmãs `<b>` e `<i>` produzem a mesma aparência, mas **sem** esse sentido, use-as só quando não houver importância nem ênfase de verdade a comunicar."
                    },
                    {
                        "type": "text",
                        "value": "## `<strong>` e `<em>`: ênfase com significado\n\nAs duas tags mais usadas para destacar texto são o `<strong>` e o `<em>`. Elas são **semânticas**, ou seja, comunicam um **significado**, e não apenas um efeito visual:\n\n- `<strong>` marca um conteúdo **importante, sério ou urgente**. O navegador, por padrão, o exibe em **negrito**.\n- `<em>` (de _emphasis_, ênfase) marca uma palavra que você **enfatizaria com a voz** ao falar, mudando o sentido da frase. O navegador o exibe em **itálico**."
                    },
                    {
                        "type": "code",
                        "value": "<p><strong>Atenção:</strong> não deixe seus dados com estranhos.</p>\n\n<p>Eu disse para guardar o <em>seu</em> lápis, não o meu.</p>"
                    },
                    {
                        "type": "text",
                        "value": "Sinta a diferença de sentido. No primeiro exemplo, \"Atenção\" é uma informação **importante**, por isso o `<strong>`. No segundo, o `<em>` em \"seu\" muda a **entonação** da frase, é como se você falasse essa palavra mais forte para deixar claro de quem é o lápis. Por que isso importa? Porque um **leitor de tela** pode mudar a voz ao encontrar essas tags, transmitindo a ênfase a quem não enxerga a tela. A aparência é só a ponta do iceberg."
                    },
                    {
                        "type": "text",
                        "value": "## E o `<b>` e o `<i>`?\n\nVocê vai esbarrar em duas tags mais antigas que produzem exatamente o mesmo visual: `<b>` deixa em **negrito** e `<i>` deixa em **itálico**. A diferença é que elas são **puramente visuais**: mudam a aparência **sem** dizer que aquilo é importante ou enfático. Para um leitor de tela, elas passam despercebidas.\n\nA regra prática é simples: se existe **importância** ou **ênfase** de verdade, use `<strong>` ou `<em>`. Reserve `<b>` e `<i>` para casos em que você só quer o efeito visual por convenção, sem nenhum peso extra, como um nome científico em itálico."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Semântico: comunica importância e ênfase -->\n<p><strong>Cuidado:</strong> o piso está <em>muito</em> molhado.</p>\n\n<!-- Só visual: itálico por convenção, sem peso extra -->\n<p>O <i>Panthera onca</i> é a maior onça das Américas.</p>"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tag\",\"Significado\",\"Aparência padrão\",\"Quando usar\"],[\"`<strong>`\",\"Conteúdo importante\",\"Negrito\",\"Avisos, alertas, o que não pode passar batido\"],[\"`<b>`\",\"Nenhum (só visual)\",\"Negrito\",\"Destaque por estilo, sem importância real\"],[\"`<em>`\",\"Ênfase de entonação\",\"Itálico\",\"Palavra que mudaria o sentido se dita mais forte\"],[\"`<i>`\",\"Nenhum (só visual)\",\"Itálico\",\"Nomes científicos e termos estrangeiros, por convenção\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Destaques e detalhes: `<mark>`, `<small>`, `<sup>`, `<sub>`, `<abbr>`\n\nAlém da ênfase, o HTML traz várias tags menores para situações específicas. Vale conhecer as principais:\n\n- `<mark>` **realça** o texto, como se você tivesse passado um marca-texto amarelo por cima.\n- `<small>` marca um texto **secundário**, de letra miúda, como um aviso legal ou um rodapé.\n- `<sup>` joga o texto para **cima** (sobrescrito), útil em expoentes e ordinais, como o \"2\" de \"m²\".\n- `<sub>` joga o texto para **baixo** (subscrito), útil em fórmulas químicas, como o \"2\" de \"H₂O\".\n- `<abbr>` marca uma **abreviação ou sigla**; com o atributo `title`, mostra o significado quando o mouse para em cima."
                    },
                    {
                        "type": "code",
                        "value": "<p>Esta oferta é <mark>válida só até domingo</mark>.</p>\n\n<p>Preço: R$ 99,90 <small>(frete não incluído)</small></p>\n\n<p>A área do terreno é de 50 m<sup>2</sup>.</p>\n\n<p>A fórmula da água é H<sub>2</sub>O.</p>\n\n<p>A <abbr title=\"Organização Mundial da Saúde\">OMS</abbr> publicou o relatório.</p>"
                    },
                    {
                        "type": "text",
                        "value": "Repare no `<abbr>`: o texto que aparece é a sigla \"OMS\", mas o atributo `title` guarda o nome por extenso. Quando o visitante para o mouse sobre a sigla, o navegador mostra uma **caixinha** com \"Organização Mundial da Saúde\". É um jeito elegante de explicar uma abreviação sem poluir o texto."
                    },
                    {
                        "type": "text",
                        "value": "## Mostrando código: `<code>` e `<pre>`\n\nSe a sua página fala sobre programação (como esta trilha!), você vai querer **mostrar código** de um jeito que não se confunda com o texto normal. Duas tags cuidam disso:\n\n- `<code>` marca um trecho de código **dentro de uma frase**, geralmente exibido numa fonte monoespaçada (de largura fixa). É o que dá aquele visual de \"código\" nas palavras.\n- `<pre>` (de _preformatted_, pré-formatado) preserva os **espaços e as quebras de linha** exatamente como você escreveu. Lembra que o HTML colapsa os espaços? Dentro do `<pre>`, ele **não** colapsa, tudo é respeitado."
                    },
                    {
                        "type": "code",
                        "value": "<p>Para criar um parágrafo, use a tag <code>&lt;p&gt;</code>.</p>\n\n<pre>\nfunction ola() {\n  console.log(\"Olá!\");\n}\n</pre>"
                    },
                    {
                        "type": "text",
                        "value": "Uma dupla poderosa é usar `<code>` **dentro** de um `<pre>` para blocos de código maiores: o `<pre>` guarda a indentação e as quebras, e o `<code>` diz \"isto é código\". No exemplo apareceu também `&lt;` e `&gt;`: são os jeitos de escrever os sinais `<` e `>` como **texto visível** na página. Sem esse truque, o navegador acharia que `<p>` é uma tag de verdade e não mostraria nada. Guarde essa ideia, ela ganha um capítulo próprio mais para a frente."
                    },
                    {
                        "type": "text",
                        "value": "## Citações: `<blockquote>` e `<q>`\n\nQuando você reproduz as palavras de **outra pessoa ou fonte**, o HTML tem duas tags específicas, uma para citações longas e outra para curtas:\n\n- `<blockquote>` é para uma **citação longa**, um bloco à parte. O navegador costuma exibi-la **recuada**, destacada do resto do texto.\n- `<q>` (de _quote_, citação) é para uma **citação curta**, embutida no meio de uma frase. O navegador adiciona as **aspas** automaticamente para você."
                    },
                    {
                        "type": "code",
                        "value": "<blockquote>\n  O conhecimento é a única coisa que ninguém pode tirar de você.\n</blockquote>\n\n<p>Como diz o ditado, <q>quem não arrisca não petisca</q>.</p>"
                    },
                    {
                        "type": "text",
                        "value": "No `<q>`, você **não** digita as aspas: o navegador as coloca sozinho, e ainda usa o estilo de aspas do idioma da página. Já o `<blockquote>` é ideal para aquele destaque de \"frase de efeito\" que você vê em artigos e apresentações. As duas tags dizem ao navegador (e aos buscadores) que aquele trecho é uma **citação**, não uma frase sua."
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** para dar peso ao texto **com significado**, use `<strong>` (importante, sai em negrito) e `<em>` (ênfase, sai em itálico); `<b>` e `<i>` dão o mesmo visual, mas **sem** semântica. Para detalhes: `<mark>` (realce), `<small>` (letra miúda), `<sup>`/`<sub>` (sobrescrito/subscrito) e `<abbr title=\"...\">` (siglas). Para código, `<code>` no meio da frase e `<pre>` para preservar espaços e quebras. Para citações, `<blockquote>` (longa) e `<q>` (curta, com aspas automáticas)."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual tag marca um trecho como importante e, por padrão, o exibe em negrito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<strong>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<small>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<q>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<sub>`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para realçar um texto como se você passasse um marca-texto por cima, qual tag você usa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<mark>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<abbr>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<pre>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<em>`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal diferença entre usar `<em>` e usar `<i>`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`<em>` carrega o significado de ênfase; `<i>` é só um efeito visual.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há diferença nenhuma: as duas são idênticas em significado e aparência.",
                                "isCorrect": false
                            },
                            {
                                "text": "`<em>` deixa o texto em negrito, enquanto `<i>` deixa o texto em itálico.",
                                "isCorrect": false
                            },
                            {
                                "text": "`<em>` só funciona dentro de listas; `<i>`, apenas dentro de títulos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que acontece quando você usa a tag `<q>` para uma citação curta, como em `<q>bom dia</q>`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O navegador adiciona as aspas automaticamente ao redor do texto.",
                                "isCorrect": true
                            },
                            {
                                "text": "O texto é exibido recuado em um bloco separado, bem afastado do parágrafo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O texto some da página, pois `<q>` é um elemento vazio.",
                                "isCorrect": false
                            },
                            {
                                "text": "O navegador exige que você digite as aspas manualmente, senão dá erro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você está escrevendo a fórmula da água e precisa que o \"2\" de \"H2O\" apareça pequeno e abaixo da linha, como subscrito. Qual tag usar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "`<sub>`, que rebaixa o texto: `H<sub>2</sub>O`.",
                                "isCorrect": true
                            },
                            {
                                "text": "`<sup>`, que eleva o texto acima da linha.",
                                "isCorrect": false
                            },
                            {
                                "text": "`<small>`, que apenas diminui o tamanho da letra sem rebaixá-la.",
                                "isCorrect": false
                            },
                            {
                                "text": "`<mark>`, que realça o número com fundo colorido.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Links e âncoras",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Links e âncoras\n\nChegamos à tag que **inventou a web**. O que torna a internet uma teia, e não um monte de páginas soltas, é a capacidade de **clicar** em algo e ir para outro lugar. Esse pulo de uma página para outra é o **link**, e ele é tão central que a própria sigla HTML carrega a palavra _hypertext_ (hipertexto): texto com links.\n\nNesta aula você vai aprender a criar links para outros sites, para outras páginas do seu próprio site e até para uma seção específica da mesma página. E ainda vai ver como fazer um link abrir o programa de e-mail ou o discador do celular."
                    },
                    {
                        "type": "quote",
                        "value": "O link é feito com a tag `<a>` (de _anchor_, âncora) e o atributo `href`, que aponta o **destino**: `<a href=\"https://ensina.dev\">Visite a ensina.dev</a>`. O texto entre as tags é a parte clicável. Sem o `href`, o `<a>` não leva a lugar nenhum."
                    },
                    {
                        "type": "text",
                        "value": "## O elemento `<a>` e o atributo `href`\n\nTodo link nasce da tag `<a>`, de _anchor_ (âncora). Sozinha, porém, ela não faz nada: quem diz **para onde** o link leva é o atributo `href` (de _hypertext reference_, referência de hipertexto). O texto que você escreve **entre** a abertura e o fechamento da tag é a parte **clicável**, aquela que costuma aparecer sublinhada e colorida."
                    },
                    {
                        "type": "code",
                        "value": "<a href=\"https://ensina.dev\">Visite a ensina.dev</a>\n\n<p>Aprenda a programar na <a href=\"https://ensina.dev\">ensina.dev</a> de graça.</p>"
                    },
                    {
                        "type": "text",
                        "value": "No segundo exemplo, veja como o link vive **dentro** de um parágrafo, misturado ao texto normal: só as palavras \"ensina.dev\" ficam clicáveis. Escolha sempre um texto de link que **descreva o destino** (\"veja nossos preços\") e fuja do clássico \"clique aqui\", que não diz nada a quem usa leitor de tela e navega pulando de link em link."
                    },
                    {
                        "type": "text",
                        "value": "## Link absoluto vs relativo\n\nO valor do `href` pode ser um endereço de dois tipos, e entender a diferença evita muita dor de cabeça:\n\n- Um link **absoluto** traz o **endereço completo**, começando por `https://`. É o que você usa para apontar para **outro site**, um endereço que vale de qualquer lugar do mundo, como o de uma casa com CEP, cidade e estado.\n- Um link **relativo** traz só o **caminho até outro arquivo do seu próprio site**, sem o `https://`. É como dizer \"a segunda porta à direita\": só faz sentido a partir de onde você já está."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Absoluto: aponta para outro site (endereço completo) -->\n<a href=\"https://pt.wikipedia.org\">Ir para a Wikipédia</a>\n\n<!-- Relativo: aponta para outra página do seu próprio site -->\n<a href=\"contato.html\">Fale conosco</a>\n<a href=\"paginas/sobre.html\">Sobre nós</a>"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo\",\"Como se parece\",\"Para que serve\"],[\"Absoluto\",\"`https://site.com/pagina`\",\"Apontar para outro site (endereço completo)\"],[\"Relativo\",\"`contato.html`\",\"Apontar para outra página do próprio site\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Abrindo em nova aba: `target=\"_blank\"` e `rel=\"noopener\"`\n\nPor padrão, o link abre no **lugar** da página atual, o visitante sai da sua página. Às vezes você prefere que ele abra em uma **nova aba**, mantendo a sua página aberta atrás, comum quando o link vai para um site externo. Para isso existe o atributo `target` com o valor `_blank`.\n\nQuando fizer isso, acrescente também `rel=\"noopener\"`. É uma medida de **segurança**: sem ela, a página que abre na nova aba ganha uma brechinha para interferir na sua. Não precisa entender os detalhes agora, só guarde a dupla como um par que anda junto."
                    },
                    {
                        "type": "code",
                        "value": "<a href=\"https://pt.wikipedia.org\" target=\"_blank\" rel=\"noopener\">\n  Abrir a Wikipédia em uma nova aba\n</a>"
                    },
                    {
                        "type": "text",
                        "value": "Uma dica de bom senso: abrir em nova aba nem sempre é o certo. Muita gente prefere decidir isso sozinha (dá para fazer com o clique do meio do mouse). O costume é reservar o `target=\"_blank\"` para links que levam para **fora do seu site**, ou para casos em que tirar o visitante da página atrapalharia, como um formulário sendo preenchido."
                    },
                    {
                        "type": "text",
                        "value": "## Âncoras: pular para uma seção da página\n\nO `<a>` também consegue levar o visitante para um **ponto específico da mesma página**, sem recarregar nada. É assim que funcionam aqueles menus de \"índice\" no topo de um artigo longo, que te jogam direto para a seção escolhida.\n\nO truque tem duas partes. Primeiro, você dá um **nome** ao destino usando o atributo `id` no elemento de chegada (um `id` é uma etiqueta única, um nome que não se repete na página). Depois, cria um link cujo `href` é uma **cerquilha** `#` seguida desse mesmo nome:"
                    },
                    {
                        "type": "code",
                        "value": "<!-- Menu no topo: o link aponta para um id com # -->\n<a href=\"#contato\">Ir para a seção de contato</a>\n\n<!-- Lá embaixo na página, a seção de destino tem o id correspondente -->\n<h2 id=\"contato\">Contato</h2>\n<p>Fale com a gente pelo e-mail abaixo.</p>"
                    },
                    {
                        "type": "text",
                        "value": "Repare no par: o link usa `href=\"#contato\"` (com `#`) e a seção de destino tem `id=\"contato\"` (sem `#`). É o `#` no `href` que avisa \"este é um pulo dentro da própria página\". Um caso especial útil: o link `<a href=\"#top\">` (ou `href=\"#\"`) costuma levar de volta ao **topo** da página, ótimo para um botão \"voltar ao início\" no fim de um texto longo."
                    },
                    {
                        "type": "text",
                        "value": "## Links para e-mail e telefone: `mailto:` e `tel:`\n\nPor fim, dois tipos especiais de link muito úteis em uma página de contato. Em vez de um endereço `https://`, o `href` pode começar com `mailto:` para **abrir o programa de e-mail** já com o destinatário preenchido, ou com `tel:` para, no celular, **iniciar uma ligação**."
                    },
                    {
                        "type": "code",
                        "value": "<a href=\"mailto:contato@ensina.dev\">Envie um e-mail</a>\n\n<a href=\"tel:+5511999998888\">Ligue para nós</a>"
                    },
                    {
                        "type": "text",
                        "value": "Ao clicar no primeiro, o navegador abre o aplicativo de e-mail do visitante com o campo \"para\" já preenchido. No segundo, num celular, aparece a opção de discar aquele número na hora. Repare que o `tel:` costuma vir com o número no formato internacional (o `+55` é o código do Brasil), assim o link funciona para quem liga de qualquer lugar."
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** o link é `<a href=\"destino\">texto clicável</a>`. O destino pode ser **absoluto** (`https://...`, outro site) ou **relativo** (`contato.html`, seu próprio site). Para abrir em nova aba, use `target=\"_blank\"` junto de `rel=\"noopener\"`. Para pular a uma seção da mesma página, dê um `id` ao destino e aponte com `href=\"#id\"`. E o `href` ainda aceita `mailto:` (abre o e-mail) e `tel:` (inicia uma ligação no celular)."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual atributo da tag `<a>` define o endereço de destino do link?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`href`",
                                "isCorrect": true
                            },
                            {
                                "text": "`src`",
                                "isCorrect": false
                            },
                            {
                                "text": "`alt`",
                                "isCorrect": false
                            },
                            {
                                "text": "`link`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que faz um link cujo `href` começa com `mailto:`, como `mailto:contato@ensina.dev`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Abre o programa de e-mail com o destinatário já preenchido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Envia o e-mail automaticamente, sem abrir programa algum.",
                                "isCorrect": false
                            },
                            {
                                "text": "Abre a página de login da conta do Gmail.",
                                "isCorrect": false
                            },
                            {
                                "text": "Inicia uma ligação para o número indicado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença entre um link absoluto e um link relativo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O absoluto tem o endereço completo; o relativo, só o caminho local.",
                                "isCorrect": true
                            },
                            {
                                "text": "O absoluto carrega mais rápido; o relativo sempre carrega mais devagar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O absoluto funciona só em imagens; o relativo, apenas em textos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe diferença real: os dois sempre apontam para o mesmo lugar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que um link abra em uma nova aba do navegador, qual atributo você adiciona à tag `<a>`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`target=\"_blank\"`",
                                "isCorrect": true
                            },
                            {
                                "text": "`href=\"_blank\"`",
                                "isCorrect": false
                            },
                            {
                                "text": "`new=\"tab\"`",
                                "isCorrect": false
                            },
                            {
                                "text": "`open=\"nova\"`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que um link no topo do artigo pule direto para uma seção de \"Contato\" mais abaixo na mesma página. Como fazer?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Dar `id=\"contato\"` ao elemento da seção e criar o link com `href=\"#contato\"`.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dar `href=\"contato\"` à seção e criar o link com `id=\"#contato\"`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar `target=\"_blank\"` no link, que sozinho já rola a página até a seção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um link com `href=\"https://contato\"`, pois âncoras precisam do endereço completo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Imagens, mídia e tabelas",
        "aulas": [
            {
                "titulo": "Imagens",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Imagens\n\nAté agora as suas páginas eram só texto. A partir de hoje elas ganham cor e vida: você vai aprender a colocar **imagens**, um dos elementos que mais deixam um site interessante.\n\nA boa notícia é que exibir uma imagem em HTML é bem simples, são poucas letras. A parte que exige um pouco mais de atenção, e onde muita gente escorrega, é fazer isso do jeito **certo**: com a imagem certa, no formato certo e com uma descrição que todo mundo consiga entender. É esse pacote completo que vamos ver aqui, com calma."
                    },
                    {
                        "type": "quote",
                        "value": "A imagem entra na página com a tag `<img>`, um elemento **vazio** (sem tag de fechamento). Ela precisa de dois atributos essenciais: o `src`, que diz **qual** arquivo mostrar, e o `alt`, que **descreve a imagem em palavras**. O `alt` não é opcional nem enfeite: é ele que garante que a imagem funcione até para quem não consegue vê-la."
                    },
                    {
                        "type": "text",
                        "value": "## A tag <img>\n\nPara colocar uma imagem, usamos a tag `<img>` (de _image_, imagem). Lembra dos **elementos vazios** que você viu no Módulo 1, como o `<br>`? O `<img>` é um deles: ele não envolve nenhum texto, então **não tem tag de fechamento**. Não existe `</img>`.\n\nSozinha, a tag `<img>` não serve para nada, afinal ela não sabe qual imagem mostrar. Quem responde a essa pergunta é o atributo `src` (de _source_, fonte): ele aponta para o **arquivo** da imagem."
                    },
                    {
                        "type": "code",
                        "value": "<img src=\"gato.jpg\" alt=\"Um gato laranja dormindo em uma almofada\">"
                    },
                    {
                        "type": "text",
                        "value": "## O caminho da imagem: src\n\nO valor do `src` é o **caminho** até o arquivo da imagem, o endereço que diz ao navegador onde encontrá-la. Existem dois tipos de caminho, e entender a diferença evita muita imagem quebrada.\n\n- **Caminho relativo**: aponta para um arquivo que está **junto com a sua página**, no seu próprio projeto. É como dar uma direção a partir de onde você está: \"a foto está aqui na mesma pasta\" ou \"a foto está na pasta imagens\".\n- **Caminho absoluto**: é o endereço **completo** de uma imagem que está em outro lugar da internet, começando com `https://`. É como dar o endereço postal inteiro, com rua, cidade e CEP."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Relativo: a imagem está na MESMA pasta que a página -->\n<img src=\"perfil.jpg\" alt=\"Foto de perfil\">\n\n<!-- Relativo: a imagem está dentro de uma subpasta chamada imagens -->\n<img src=\"imagens/perfil.jpg\" alt=\"Foto de perfil\">\n\n<!-- Absoluto: a imagem está em outro site, na internet -->\n<img src=\"https://www.ensina.dev/logo.png\" alt=\"Logo da ensina.dev\">"
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar cada caminho\n\nNa maior parte do tempo você vai usar **caminhos relativos**, porque as imagens do seu site normalmente ficam guardadas junto com ele, na mesma pasta ou numa subpasta organizada (algo como `imagens/` ou `img/`). Isso mantém tudo junto: se você mover o projeto para outro computador, os caminhos continuam funcionando.\n\nO **caminho absoluto** entra quando a imagem vive em **outro servidor**, por exemplo um logo hospedado em outro site. O cuidado aqui é que, se aquele site sair do ar ou mudar o arquivo de lugar, a sua imagem quebra, porque ela não é sua, você só está apontando para ela."
                    },
                    {
                        "type": "text",
                        "value": "## O alt: a descrição que não pode faltar\n\nVocê já teve um gostinho do `alt` no Módulo 1, mas ele é tão importante que merece um capítulo só dele. O `alt` (de _alternative text_, texto alternativo) é uma **descrição da imagem em palavras**. Ele trabalha em silêncio na maior parte do tempo, mas é essencial em duas situações.\n\n- **Acessibilidade**: pessoas cegas ou com baixa visão navegam com **leitores de tela**, programas que leem a página em voz alta. O leitor não enxerga a foto, então ele lê o `alt`. Sem `alt`, a pessoa só ouve \"imagem\", sem saber do que se trata.\n- **Fallback (reserva)**: se a imagem não carregar (o arquivo sumiu, o caminho está errado, a internet falhou), o navegador mostra o texto do `alt` no lugar do quadradinho quebrado. Assim o visitante ao menos sabe o que deveria estar ali."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Bom: descreve o conteúdo da imagem de forma útil -->\n<img src=\"praia.jpg\" alt=\"Pôr do sol alaranjado sobre o mar em uma praia deserta\">\n\n<!-- Ruim: não descreve nada, não ajuda ninguém -->\n<img src=\"praia.jpg\" alt=\"imagem\">\n\n<!-- Péssimo: sem alt, o leitor de tela fica mudo e não há fallback -->\n<img src=\"praia.jpg\">"
                    },
                    {
                        "type": "text",
                        "value": "## Como escrever um bom alt\n\nUm bom `alt` descreve **o que a imagem mostra e o que ela comunica**, de forma curta e objetiva. Pense assim: se a imagem sumisse, que frase você colocaria no lugar para não perder a informação?\n\nUm detalhe fino: quando a imagem é **puramente decorativa** (um enfeite que não acrescenta informação, como uma linha ondulada de separação), o recomendado é usar um `alt` **vazio**, escrito como `alt=\"\"`. Isso avisa o leitor de tela para **pular** a imagem, em vez de anunciar um nome de arquivo sem sentido. Repare que \"sem `alt`\" e \"`alt` vazio\" são coisas diferentes: o `alt` vazio é uma escolha consciente de dizer \"aqui não há nada importante para descrever\"."
                    },
                    {
                        "type": "text",
                        "value": "## Tamanho: width e height\n\nPor padrão, a imagem aparece no seu tamanho original. Você pode definir a largura e a altura com os atributos `width` (largura) e `height` (altura), medidos em **pixels** (os pontinhos que formam a tela).\n\nAlém de controlar o tamanho, informar `width` e `height` tem um benefício menos óbvio: o navegador já **reserva o espaço** da imagem antes mesmo de ela carregar. Sem isso, o texto da página \"pula\" quando a imagem finalmente aparece e empurra tudo para baixo, aquele efeito irritante de a página dançar enquanto carrega."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Imagem com 300 pixels de largura e 200 de altura -->\n<img src=\"cachorro.jpg\" alt=\"Cachorro caramelo correndo no gramado\" width=\"300\" height=\"200\">\n\n<!-- Informando só a largura: a altura se ajusta sozinha para não distorcer -->\n<img src=\"cachorro.jpg\" alt=\"Cachorro caramelo correndo no gramado\" width=\"300\">"
                    },
                    {
                        "type": "text",
                        "value": "## Formatos de imagem: qual usar\n\nNem toda imagem é igual. O trecho final do nome do arquivo (`.jpg`, `.png` e por aí vai) indica o **formato**, e cada formato é bom para um tipo de imagem. Escolher o formato certo deixa a página mais leve e rápida. Os quatro mais comuns na web são:\n\n- **JPG** (ou JPEG): ótimo para **fotografias** e imagens com muitas cores. Comprime bem e fica leve, mas não guarda áreas transparentes.\n- **PNG**: bom para imagens com **áreas transparentes** ou com bordas bem definidas, como logos e ícones. Costuma gerar arquivos maiores que o JPG.\n- **SVG**: formato de **desenho vetorial**, perfeito para logos, ícones e ilustrações. Como é feito de formas matemáticas (e não de pontinhos), ele **não perde qualidade** por mais que você amplie.\n- **WebP**: um formato **moderno** que costuma gerar arquivos menores que JPG e PNG com qualidade parecida, e ainda aceita transparência. É uma ótima escolha para a web de hoje."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Formato\",\"Melhor para\",\"Transparência?\",\"Observação\"],[\"JPG\",\"Fotografias, imagens com muitas cores\",\"Não\",\"Arquivo leve, mas perde um pouco de qualidade ao comprimir\"],[\"PNG\",\"Logos, ícones, prints com texto\",\"Sim\",\"Nitidez perfeita, mas arquivo mais pesado\"],[\"SVG\",\"Logos, ícones, ilustrações\",\"Sim\",\"Vetorial: amplia sem perder qualidade nenhuma\"],[\"WebP\",\"Uso geral moderno na web\",\"Sim\",\"Costuma ser o mais leve; ótimo padrão hoje em dia\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## figure e figcaption: imagem com legenda\n\nÀs vezes uma imagem precisa de uma **legenda**, aquele textinho explicativo que costuma aparecer embaixo de fotos em jornais e revistas. Para isso o HTML tem uma dupla feita sob medida: `<figure>` e `<figcaption>`.\n\n- `<figure>` (figura) é uma **caixa** que agrupa a imagem e a sua legenda, deixando claro que as duas formam uma unidade.\n- `<figcaption>` (de _figure caption_, legenda da figura) é a **legenda** em si, escrita dentro da `<figure>`.\n\nUsar essa dupla não muda muito a aparência, mas dá **significado**: você está dizendo ao navegador e aos leitores de tela \"esta imagem e este texto andam juntos\"."
                    },
                    {
                        "type": "code",
                        "value": "<figure>\n  <img src=\"ponte.jpg\" alt=\"Ponte estaiada iluminada à noite sobre o rio\">\n  <figcaption>A ponte da cidade, fotografada durante o pôr do sol.</figcaption>\n</figure>"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** a imagem entra com `<img>`, um elemento **vazio** (sem fechamento), sempre com `src` (o caminho do arquivo) e `alt` (a descrição em texto, para acessibilidade e fallback). Caminhos podem ser **relativos** (arquivo junto do projeto) ou **absolutos** (`https://...`, em outro servidor). `width` e `height` definem o tamanho e reservam espaço. Escolha o **formato** pela imagem: **JPG** para fotos, **PNG/SVG** para logos e ícones, **WebP** para um padrão leve e moderno. E use `<figure>` com `<figcaption>` quando a imagem tiver legenda."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para que serve o atributo `src` na tag `<img>`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Indica o caminho do arquivo de imagem que deve ser exibido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Descreve a imagem em palavras para os leitores de tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Define a largura da imagem em pixels.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cria uma legenda embaixo da imagem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação sobre a tag `<img>` está correta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É um elemento vazio: não tem conteúdo nem tag de fechamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "É preciso sempre fechá-la com `</img>`, como qualquer outra tag.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela só funciona quando está dentro de uma tag `<figure>`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela precisa de uma tag `<source>` para poder exibir a imagem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o atributo `alt` é importante em uma imagem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque leitores de tela leem o `alt`, servindo de reserva se a imagem falhar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque faz o arquivo da imagem carregar visivelmente mais rápido no navegador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque define em qual pasta ou subpasta do site o arquivo está salvo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque centraliza automaticamente a imagem no centro exato da tela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa exibir o logo da empresa, que deve ficar nítido tanto pequeno no menu quanto grande na tela de abertura, sem perder qualidade. Qual formato é o mais indicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SVG, porque é vetorial e não perde qualidade ao ser ampliado.",
                                "isCorrect": true
                            },
                            {
                                "text": "JPG, porque é o melhor formato para qualquer imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um arquivo `.txt`, porque logos são feitos de texto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não importa o formato; todos mantêm a qualidade em qualquer tamanho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença entre uma imagem **sem** o atributo `alt` e uma com `alt=\"\"` (vazio)?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O `alt` vazio pula a imagem no leitor de tela; sem `alt`, falta a descrição dela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há diferença nenhuma: as duas formas produzem exatamente o mesmo resultado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `alt` vazio faz a imagem sumir da página; sem `alt`, ela aparece normalmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `alt` vazio deixa a imagem maior; sem `alt`, ela mantém o tamanho original.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Áudio e vídeo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Áudio e vídeo\n\nDepois das imagens, é hora de colocar as suas páginas para **tocar e reproduzir**: vídeos e áudios direto no HTML. Antigamente isso dependia de programas extras instalados no navegador (você talvez já tenha ouvido falar do antigo Flash). Hoje o HTML faz tudo **sozinho**, com tags nativas, e é muito mais simples do que parece.\n\nNesta aula você vai aprender a colocar um vídeo com botões de play e pause, tocar um áudio, oferecer o arquivo em vários formatos e, no fim, incorporar um vídeo do YouTube na sua página."
                    },
                    {
                        "type": "quote",
                        "value": "O HTML reproduz vídeo com a tag `<video>` e som com a tag `<audio>`. As duas quase sempre vêm com o atributo `controls`, que mostra os botões de play, pause e volume. Para não deixar ninguém de fora, você pode oferecer o mesmo arquivo em vários formatos usando tags `<source>` dentro delas."
                    },
                    {
                        "type": "text",
                        "value": "## Vídeo com a tag <video>\n\nA tag `<video>` coloca um player de vídeo na página. Diferente do `<img>`, ela **não é** um elemento vazio: ela abre e fecha, e no meio pode receber outras coisas.\n\nSozinha, ela mostraria só um quadro parado, sem nenhum botão. Por isso quase sempre adicionamos o atributo `controls`, que faz o navegador desenhar os **controles** do player: o play/pause, a barra de progresso, o volume e a tela cheia. Repare que `controls` é um atributo diferente: ele não tem `=` nem valor. Ou você o escreve (e o recurso liga), ou não escreve. Esses são os **atributos booleanos**, que funcionam como um interruptor de liga/desliga."
                    },
                    {
                        "type": "code",
                        "value": "<video src=\"ceu.mp4\" controls width=\"640\"></video>"
                    },
                    {
                        "type": "text",
                        "value": "## Ajustando o vídeo: width e poster\n\nAssim como nas imagens, o atributo `width` define a **largura** do player em pixels (e a altura se ajusta sozinha para não distorcer).\n\nOutro atributo muito útil é o `poster`: ele define uma **imagem de capa**, aquele quadro bonito que aparece **antes** de a pessoa apertar o play. Sem `poster`, o navegador costuma mostrar o primeiro quadro do vídeo, que nem sempre é o mais convidativo. É como a capa de um DVD: um convite para dar play."
                    },
                    {
                        "type": "code",
                        "value": "<video src=\"viagem.mp4\" controls width=\"640\" poster=\"capa-viagem.jpg\"></video>"
                    },
                    {
                        "type": "text",
                        "value": "## Áudio com a tag <audio>\n\nPara tocar som (uma música, um podcast, um efeito sonoro), a lógica é a mesma, só muda a tag: usamos `<audio>`. E, de novo, o atributo `controls` é quem mostra os botões de play, pause e volume. Sem ele o player fica invisível, e o visitante não tem como tocar o som."
                    },
                    {
                        "type": "code",
                        "value": "<audio src=\"podcast-episodio-1.mp3\" controls></audio>"
                    },
                    {
                        "type": "text",
                        "value": "## Vários formatos com <source>\n\nExiste um detalhe chato do mundo real: nem todo navegador entende todos os **formatos** de vídeo e áudio. Um navegador pode tocar `.mp4` mas engasgar em outro formato, e vice-versa.\n\nA solução elegante é oferecer o mesmo conteúdo em **mais de um formato** e deixar o navegador escolher qual ele consegue tocar. Para isso, em vez de usar o atributo `src` na tag, colocamos várias tags `<source>` **dentro** do `<video>` (ou do `<audio>`). O navegador lê de cima para baixo e usa a **primeira** que ele souber reproduzir. O atributo `type` ajuda dando a dica de qual formato é cada arquivo.\n\nDe quebra, o texto que você escreve entre `<video>` e `</video>` vira uma **mensagem de reserva**: ele só aparece para o visitante cujo navegador seja tão antigo que não entenda a tag `<video>` de jeito nenhum."
                    },
                    {
                        "type": "code",
                        "value": "<video controls width=\"640\" poster=\"capa.jpg\">\n  <source src=\"video.webm\" type=\"video/webm\">\n  <source src=\"video.mp4\" type=\"video/mp4\">\n  Seu navegador não consegue reproduzir este vídeo.\n</video>"
                    },
                    {
                        "type": "text",
                        "value": "## Os atributos loop, muted e autoplay\n\nO `<video>` e o `<audio>` têm outros **atributos booleanos** (aqueles de liga/desliga) que ajustam o comportamento da reprodução:\n\n- `loop`: quando o vídeo ou áudio termina, ele **recomeça** sozinho, num looping infinito.\n- `muted`: começa **sem som** (no mudo). A pessoa pode ligar o volume nos controles.\n- `autoplay`: tenta **tocar sozinho** assim que a página carrega, sem esperar o clique.\n\nUm aviso importante sobre o `autoplay`: como vídeo tocando som do nada é irritante, os navegadores **bloqueiam** o autoplay com som. Por isso, na prática, `autoplay` só funciona quando você também usa `muted`. A dupla `autoplay muted` é o segredo daqueles vídeos de fundo que rodam calados no topo de muitos sites."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Vídeo de fundo: toca sozinho, no mudo e em looping -->\n<video src=\"fundo.mp4\" autoplay muted loop width=\"640\"></video>"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Atributo\",\"O que faz\",\"Precisa de valor?\"],[\"`controls`\",\"Mostra os botões de play, pause e volume\",\"Não (booleano)\"],[\"`width`\",\"Define a largura do player em pixels\",\"Sim\"],[\"`poster`\",\"Imagem de capa exibida antes do play (só no vídeo)\",\"Sim\"],[\"`loop`\",\"Recomeça automaticamente ao terminar\",\"Não (booleano)\"],[\"`muted`\",\"Começa sem som, no mudo\",\"Não (booleano)\"],[\"`autoplay`\",\"Tenta tocar sozinho ao carregar (precisa de muted)\",\"Não (booleano)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Incorporar um vídeo do YouTube\n\nE se o vídeo já está no **YouTube**? Aí você não usa a tag `<video>`, porque o arquivo não é seu, ele mora nos servidores do YouTube. Nesse caso, o certo é **incorporar** (em inglês, _embed_) o player do próprio YouTube dentro da sua página, usando a tag `<iframe>`.\n\nPense no `<iframe>` (de _inline frame_, moldura embutida) como uma **janelinha** que exibe outra página inteira dentro da sua. É uma moldura que mostra o player do YouTube por dentro. Você nem precisa escrever esse código na mão: no próprio YouTube, em **Compartilhar > Incorporar**, o site te entrega o `<iframe>` pronto para copiar e colar."
                    },
                    {
                        "type": "code",
                        "value": "<iframe\n  width=\"560\"\n  height=\"315\"\n  src=\"https://www.youtube.com/embed/ID_DO_VIDEO\"\n  title=\"Player de vídeo do YouTube\"\n  allowfullscreen>\n</iframe>"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** vídeo vai na tag `<video>` e som na tag `<audio>`, quase sempre com `controls` para mostrar o player. `width` ajusta o tamanho e `poster` põe uma capa no vídeo. Ofereça vários formatos com tags `<source>` (o navegador usa a primeira que entender). `loop`, `muted` e `autoplay` são **booleanos** (sem valor), e o `autoplay` só funciona junto de `muted`. Para vídeos do YouTube, não use `<video>`: incorpore com um `<iframe>` copiado do próprio YouTube."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para que serve o atributo `controls` em um `<video>` ou `<audio>`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Exibe os botões de play, pause e volume no player.",
                                "isCorrect": true
                            },
                            {
                                "text": "Define a largura do player, medida em pixels.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz o vídeo começar a tocar sozinho ao carregar a página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Coloca uma imagem de capa exibida antes do play.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual tag é usada para tocar um arquivo de som, como uma música ou um podcast?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<audio>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<video>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<img>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<sound>`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que às vezes colocamos várias tags `<source>` dentro de um `<video>`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque nem todo navegador entende os mesmos formatos de vídeo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Para o mesmo vídeo tocar simultaneamente em várias telas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada `<source>` mostra uma parte diferente do vídeo, em sequência.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para aumentar automaticamente o volume do áudio do vídeo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que, na prática, o atributo `autoplay` costuma vir acompanhado de `muted`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque navegadores bloqueiam autoplay com som, e o muted libera.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque `muted` faz o vídeo carregar visivelmente mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, sem `muted`, o vídeo é exibido em preto e branco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o atributo `autoplay` só existe dentro da tag `<audio>`.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer exibir na sua página um vídeo que já está publicado no YouTube. Qual é a forma correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Incorporar o player do YouTube com uma tag `<iframe>`.",
                                "isCorrect": true
                            },
                            {
                                "text": "Baixar o vídeo do YouTube e colocá-lo dentro de uma tag `<img>`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar `<video src=\"...\">` apontando direto para a página do YouTube.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é possível colocar vídeos do YouTube dentro de uma página HTML.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tabelas: o básico",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tabelas: o básico\n\nSabe aquela planilha de horários, a lista de preços de um plano ou o placar de um campeonato? Tudo isso são **dados organizados em linhas e colunas**, e o HTML tem um conjunto de tags feito exatamente para isso: as **tabelas**.\n\nMontar uma tabela envolve algumas tags novas trabalhando juntas e, no começo, pode parecer um quebra-cabeça. Mas existe uma lógica simples por trás, e depois que você pega o jeito de \"linha por linha, célula por célula\", vira algo natural. Vamos com calma."
                    },
                    {
                        "type": "quote",
                        "value": "Uma tabela existe para mostrar **dados tabulares**: informações que fazem sentido em **linhas e colunas**, como uma planilha. Ela é construída de fora para dentro com `<table>` (a tabela toda), `<tr>` (cada linha) e, dentro das linhas, as células `<td>` (dados) e `<th>` (cabeçalhos). Tabela é para **dados**, nunca para montar o layout da página."
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar uma tabela (e quando não)\n\nAntes de sair montando tabelas, a regra mais importante: use tabela **só para dados tabulares**, ou seja, informações que se organizam naturalmente em linhas e colunas e que você compararia numa planilha. Alguns bons exemplos:\n\n- uma tabela de preços (produto x valor);\n- um horário de aulas (dia da semana x horário);\n- uma classificação de campeonato (time x pontos).\n\nO que você **não** deve fazer é usar tabela para **posicionar coisas na tela**, tipo criar colunas de layout ou encaixar um menu ao lado do conteúdo. Isso era comum há muitos anos, mas hoje é considerado errado, e a gente vai entender direitinho o porquê na próxima aula. Por ora, guarde a frase: **tabela é para dados, não para layout**."
                    },
                    {
                        "type": "text",
                        "value": "## As três tags fundamentais: table, tr e td\n\nToda tabela nasce da combinação de três tags, encaixadas uma dentro da outra:\n\n- `<table>`: a caixa que envolve a **tabela inteira**.\n- `<tr>` (de _table row_, linha da tabela): representa **uma linha** horizontal. Uma tabela tem vários `<tr>`, um embaixo do outro.\n- `<td>` (de _table data_, dado da tabela): representa **uma célula** de conteúdo, uma \"casinha\" da tabela. Os `<td>` ficam dentro dos `<tr>`.\n\nA lógica de montagem é sempre a mesma: a tabela é feita de **linhas** (`<tr>`), e cada linha é feita de **células** (`<td>`). Você constrói de cima para baixo, uma linha por vez, e dentro de cada linha vai preenchendo as células da esquerda para a direita."
                    },
                    {
                        "type": "code",
                        "value": "<table>\n  <tr>\n    <td>Arroz</td>\n    <td>R$ 5,00</td>\n  </tr>\n  <tr>\n    <td>Feijão</td>\n    <td>R$ 8,00</td>\n  </tr>\n</table>"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo a tabela acima\n\nEsse código cria uma tabela de **duas linhas** e **duas colunas**. Repare no encaixe, que a indentação deixa bem visível:\n\n- Cada `<tr>` é uma **linha** (temos duas: a do arroz e a do feijão).\n- Dentro de cada `<tr>`, cada `<td>` é uma **célula** (temos duas por linha: o produto e o preço).\n\nAs colunas não são declaradas em lugar nenhum: elas **surgem naturalmente** do alinhamento das células. Como toda linha tem duas células, o navegador entende que existem duas colunas e alinha tudo. Simples assim: você cuida das linhas e das células, e as colunas se formam sozinhas."
                    },
                    {
                        "type": "text",
                        "value": "## Cabeçalhos com <th>\n\nNa tabela anterior faltou algo: um **cabeçalho** dizendo o que é cada coluna. Para isso existe a tag `<th>` (de _table header_, cabeçalho da tabela). Ela é uma célula igual ao `<td>`, mas com um papel especial: marca aquele conteúdo como um **título** de coluna ou de linha.\n\nO `<th>` tem duas vantagens sobre o `<td>`. Visualmente, o navegador já o exibe em **negrito e centralizado** por padrão, destacando-o. E, mais importante, ele diz aos leitores de tela \"isto aqui é um cabeçalho\", o que ajuda quem não enxerga a entender a que coluna cada dado pertence."
                    },
                    {
                        "type": "code",
                        "value": "<table>\n  <tr>\n    <th>Produto</th>\n    <th>Preço</th>\n  </tr>\n  <tr>\n    <td>Arroz</td>\n    <td>R$ 5,00</td>\n  </tr>\n  <tr>\n    <td>Feijão</td>\n    <td>R$ 8,00</td>\n  </tr>\n</table>"
                    },
                    {
                        "type": "text",
                        "value": "## Organizando em thead, tbody e tfoot\n\nQuando a tabela cresce, ajuda separar o **cabeçalho** do **corpo** de dados. O HTML oferece três seções para isso, todas colocadas dentro do `<table>`:\n\n- `<thead>` (de _table head_): agrupa a(s) linha(s) de **cabeçalho**, lá no topo.\n- `<tbody>` (de _table body_): agrupa as linhas de **conteúdo**, o miolo da tabela.\n- `<tfoot>` (de _table foot_): agrupa uma linha de **rodapé**, ótima para totais e somas.\n\nNão é obrigatório usar as três, mas elas deixam o código mais **organizado e legível** e dão significado à tabela. Dá até para imaginar como um relatório: tem o topo (thead), o meio (tbody) e a conclusão com o total (tfoot)."
                    },
                    {
                        "type": "code",
                        "value": "<table>\n  <thead>\n    <tr>\n      <th>Produto</th>\n      <th>Preço</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Arroz</td>\n      <td>R$ 5,00</td>\n    </tr>\n    <tr>\n      <td>Feijão</td>\n      <td>R$ 8,00</td>\n    </tr>\n  </tbody>\n  <tfoot>\n    <tr>\n      <td>Total</td>\n      <td>R$ 13,00</td>\n    </tr>\n  </tfoot>\n</table>"
                    },
                    {
                        "type": "text",
                        "value": "## Um título para a tabela: caption\n\nPor fim, uma tabela costuma ganhar um **título** que explica do que ela trata. Em vez de jogar um `<h2>` solto por cima, o HTML tem a tag certa para isso: `<caption>` (legenda). Ela é a **primeira coisa** dentro do `<table>` e funciona como o nome oficial da tabela.\n\nA vantagem de usar `<caption>` em vez de um título qualquer é que ele fica **grudado** na tabela: os leitores de tela anunciam a legenda antes de ler os dados, então quem não enxerga já sabe do que aquela tabela trata antes de mergulhar nos números."
                    },
                    {
                        "type": "code",
                        "value": "<table>\n  <caption>Preços da feira desta semana</caption>\n  <thead>\n    <tr>\n      <th>Produto</th>\n      <th>Preço</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Arroz</td>\n      <td>R$ 5,00</td>\n    </tr>\n  </tbody>\n</table>"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tag\",\"O que representa\",\"Onde fica\"],[\"`<table>`\",\"A tabela inteira\",\"Envolve tudo\"],[\"`<caption>`\",\"O título da tabela\",\"Primeira coisa dentro de `<table>`\"],[\"`<tr>`\",\"Uma linha\",\"Dentro de `<table>`, `<thead>`, `<tbody>` ou `<tfoot>`\"],[\"`<th>`\",\"Uma célula de cabeçalho\",\"Dentro de um `<tr>`\"],[\"`<td>`\",\"Uma célula de dados\",\"Dentro de um `<tr>`\"],[\"`<thead>` / `<tbody>` / `<tfoot>`\",\"Seções de topo, corpo e rodapé\",\"Dentro de `<table>`\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** tabela é para **dados tabulares** (linhas e colunas), nunca para layout. Monte de fora para dentro: `<table>` envolve tudo, cada `<tr>` é uma **linha** e, dentro dela, `<td>` são células de dados e `<th>` são células de **cabeçalho** (negrito e anunciadas aos leitores de tela). As colunas surgem sozinhas do alinhamento das células. Use `<thead>`, `<tbody>` e `<tfoot>` para separar topo, corpo e rodapé, e `<caption>` como título oficial da tabela."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em uma tabela HTML, o que a tag `<tr>` representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma linha da tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma coluna da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma célula de cabeçalho.",
                                "isCorrect": false
                            },
                            {
                                "text": "O título da tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual tag cria uma célula de **cabeçalho**, exibida em negrito e anunciada como título pelos leitores de tela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<th>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<td>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<tr>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<caption>`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o uso correto de uma tabela em HTML?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mostrar dados tabulares, organizados em linhas e colunas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Posicionar o menu ao lado do conteúdo, criando o layout da página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixar qualquer texto da página automaticamente centralizado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir os parágrafos `<p>` sempre que o texto for longo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve a tag `<caption>` dentro de uma tabela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dá um título à tabela, associado a ela para leitores de tela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cria a linha de rodapé que exibe o total geral da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Define a cor de fundo aplicada a toda a tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transforma qualquer célula comum em uma célula de cabeçalho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel das seções `<thead>`, `<tbody>` e `<tfoot>` em uma tabela?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Agrupam as linhas de cabeçalho, conteúdo e rodapé, organizando a tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "São três formas diferentes de criar uma mesma célula única.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definem as cores do topo, do meio e do rodapé da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituem de vez as tags `<tr>` e `<td>`, tornando-as desnecessárias.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tabelas: combinando células",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tabelas: combinando células\n\nVocê já sabe montar tabelas com linhas e células. Agora vamos aprender um truque que resolve muitos casos do mundo real: **juntar células**. Sabe quando uma tabela tem um título que se estende por cima de várias colunas, ou uma célula que ocupa duas linhas de uma vez? É disso que se trata.\n\nAlém de juntar células, vamos amarrar de vez a acessibilidade das tabelas com o atributo `scope` e fechar o módulo entendendo, com calma, por que ninguém deve usar tabela para montar o layout de uma página."
                    },
                    {
                        "type": "quote",
                        "value": "Duas ferramentas esticam uma célula para ocupar o lugar de outras: `colspan`, que **funde células na horizontal** (a célula avança por várias colunas), e `rowspan`, que **funde na vertical** (a célula desce por várias linhas). O atributo `scope`, nos cabeçalhos `<th>`, diz se aquele cabeçalho manda na **coluna** ou na **linha**, o que ajuda os leitores de tela."
                    },
                    {
                        "type": "text",
                        "value": "## colspan: juntar colunas\n\nO atributo `colspan` (de _column span_, algo como \"abrangência de colunas\") faz uma célula se **esticar na horizontal**, ocupando o espaço de várias colunas de uma vez. Você escreve `colspan=\"2\"` para a célula valer por duas colunas, `colspan=\"3\"` por três, e assim por diante.\n\nO uso clássico é um **título que cobre a tabela inteira** ou um subtítulo que agrupa colunas. Um detalhe que confunde no começo: quando uma célula ocupa duas colunas, aquela linha precisa de **uma célula a menos**, porque uma só já fez o trabalho de duas."
                    },
                    {
                        "type": "code",
                        "value": "<table>\n  <tr>\n    <th colspan=\"2\">Contato</th>\n  </tr>\n  <tr>\n    <td>E-mail</td>\n    <td>ana@exemplo.com</td>\n  </tr>\n  <tr>\n    <td>Telefone</td>\n    <td>(11) 90000-0000</td>\n  </tr>\n</table>"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo o colspan\n\nNa tabela acima, a primeira linha tem **uma única célula**, o `<th colspan=\"2\">Contato</th>`. Como ela usa `colspan=\"2\"`, esse cabeçalho se estica e cobre as **duas colunas** de baixo, virando um título geral para o bloco de contato.\n\nAs outras linhas seguem normais, com duas células cada. Repare no equilíbrio: a linha do título tem uma célula (que vale por duas) e as demais têm duas células (que valem por uma cada). No fim, todas as linhas ocupam a mesma largura de duas colunas."
                    },
                    {
                        "type": "text",
                        "value": "## rowspan: juntar linhas\n\nO primo do `colspan` é o `rowspan` (de _row span_, \"abrangência de linhas\"). Ele faz o contrário: estica a célula na **vertical**, fazendo-a descer e ocupar várias linhas de uma vez. Você escreve `rowspan=\"2\"` para a célula valer por duas linhas, e assim por diante.\n\nO uso típico é **agrupar linhas que compartilham um mesmo valor**. Por exemplo, dois horários que acontecem no mesmo dia: em vez de repetir \"Segunda\" duas vezes, uma célula com `rowspan=\"2\"` cobre as duas linhas. O pulo do gato: a célula esticada é escrita **só na primeira** das linhas que ela abrange; as linhas seguintes já não repetem aquela célula, porque o espaço dela já está ocupado."
                    },
                    {
                        "type": "code",
                        "value": "<table>\n  <tr>\n    <th>Dia</th>\n    <th>Horário</th>\n    <th>Matéria</th>\n  </tr>\n  <tr>\n    <td rowspan=\"2\">Segunda</td>\n    <td>08:00</td>\n    <td>Matemática</td>\n  </tr>\n  <tr>\n    <td>10:00</td>\n    <td>História</td>\n  </tr>\n</table>"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo o rowspan\n\nRepare na célula `<td rowspan=\"2\">Segunda</td>`: ela desce e ocupa **duas linhas**, agrupando os dois horários daquele dia. Por isso a segunda linha da grade (a das 10:00) tem **só duas células**, e não três: a coluna do \"Dia\" já está preenchida pela célula \"Segunda\", que veio da linha de cima.\n\nEsse é o detalhe que mais confunde quem está começando: ao usar `rowspan`, as linhas seguintes ficam com menos células, porque parte do espaço delas já foi ocupada pela célula esticada de cima. Se você contar as células e achar que \"está faltando uma\", provavelmente é um `rowspan` fazendo o seu trabalho."
                    },
                    {
                        "type": "text",
                        "value": "## Cabeçalhos com scope\n\nNa aula passada você viu que o `<th>` marca uma célula como cabeçalho. Dá para ir além e dizer **de quem** aquele cabeçalho é o título, se de uma **coluna** ou de uma **linha**, com o atributo `scope`:\n\n- `scope=\"col\"`: o `<th>` é o cabeçalho de uma **coluna** inteira (o caso mais comum, no topo).\n- `scope=\"row\"`: o `<th>` é o cabeçalho de uma **linha** (fica na lateral esquerda).\n\nVisualmente o `scope` não muda quase nada, e é justamente por isso que muita gente esquece dele. Mas ele é ouro para a **acessibilidade**: com o `scope`, o leitor de tela consegue dizer algo como \"Nota da Ana: 9,5\", ligando cada dado ao seu cabeçalho, em vez de só cuspir números soltos. Em tabelas com cabeçalhos na lateral, ele faz toda a diferença."
                    },
                    {
                        "type": "code",
                        "value": "<table>\n  <caption>Notas do bimestre</caption>\n  <tr>\n    <th scope=\"col\">Aluno</th>\n    <th scope=\"col\">Nota</th>\n  </tr>\n  <tr>\n    <th scope=\"row\">Ana</th>\n    <td>9,5</td>\n  </tr>\n  <tr>\n    <th scope=\"row\">Bruno</th>\n    <td>8,0</td>\n  </tr>\n</table>"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ferramenta\",\"O que faz\"],[\"`colspan`\",\"Estica a célula na horizontal, ocupando várias colunas (ótimo para um título que cobre a tabela)\"],[\"`rowspan`\",\"Estica a célula na vertical, ocupando várias linhas (ótimo para agrupar linhas com um valor em comum)\"],[\"`scope` com `col`\",\"No `<th>`, marca o cabeçalho de uma coluna (fica no topo)\"],[\"`scope` com `row`\",\"No `<th>`, marca o cabeçalho de uma linha (fica na lateral)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que NÃO usar tabela para layout\n\nAgora a promessa que ficou pendente. Lá no início das tabelas, ficou o aviso: tabela é para dados, não para layout. Mas por quê?\n\nAntigamente, sem as ferramentas modernas de estilo, era comum montar a página inteira dentro de uma `<table>` gigante: uma célula para o menu, outra para o conteúdo, outra para o rodapé. Funcionava visualmente, mas trazia vários problemas que hoje sabemos evitar:\n\n- **Acessibilidade quebrada**: leitores de tela leem tabelas como dados. Uma página montada em tabela vira uma sopa de \"linha 1, coluna 2...\" que confunde totalmente quem usa esses programas.\n- **Rigidez no celular**: uma tabela de layout não se adapta bem a telas pequenas, e o site fica difícil de usar no telefone.\n- **Código embolado**: o significado se perde. Ninguém consegue dizer o que é conteúdo de verdade e o que é só \"encaixe\" visual.\n\nPara **posicionar** as coisas na tela (colunas, menus laterais, grades), a ferramenta certa é o **CSS**, que você vai estudar depois. O HTML cuida do **significado** (isto é um menu, isto é um artigo); o CSS cuida da **posição**. Cada tecnologia no seu quadrado, como você viu no Módulo 1."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Evite: usar tabela só para posicionar o menu ao lado do conteúdo -->\n<table>\n  <tr>\n    <td>Menu do site</td>\n    <td>Conteúdo do artigo</td>\n  </tr>\n</table>\n\n<!-- Melhor: marcar o significado com as tags certas (a posição fica para o CSS) -->\n<nav>Menu do site</nav>\n<article>Conteúdo do artigo</article>"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** `colspan=\"N\"` funde células na **horizontal** (a linha fica com menos células) e `rowspan=\"N\"` funde na **vertical** (as linhas de baixo ficam com menos células). Nos cabeçalhos, `scope=\"col\"` e `scope=\"row\"` dizem se o `<th>` manda na coluna ou na linha, um presente para a acessibilidade. E a regra de ouro do módulo: **tabela é para dados tabulares, nunca para layout**, quem posiciona as coisas na página é o CSS."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o atributo `colspan=\"2\"` faz com uma célula de tabela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Estica a célula na horizontal, ocupando duas colunas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Estica a célula na vertical, ocupando duas linhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cria duas tabelas separadas, lado a lado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pinta a célula com duas cores diferentes, em listras.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o atributo `rowspan=\"2\"` faz com uma célula de tabela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Estica a célula na vertical, ocupando duas linhas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Estica a célula na horizontal, ocupando duas colunas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Repete o conteúdo da mesma célula duas vezes seguidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Divide a linha inteira em duas tabelas separadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o atributo `scope` em um `<th>`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Diz se o `<th>` é cabeçalho de coluna ou de linha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Define quantas colunas a célula vai ocupar no total.",
                                "isCorrect": false
                            },
                            {
                                "text": "Muda a cor de fundo aplicada àquele cabeçalho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transforma o `<th>` em uma célula `<td>` comum.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que não se deve usar uma tabela para montar o layout (a posição das coisas) de uma página?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque tabela de layout quebra a acessibilidade e trava no celular.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque tabelas deixam a página com cores demais na tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a tag `<table>` foi removida das versões modernas do HTML.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque tabelas só funcionam em telas de computador, nunca no navegador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa grade de horários, você quer que a célula \"Segunda\" cubra duas linhas seguidas (dois horários do mesmo dia), sem repetir a palavra. Qual atributo usar, e o que muda na linha de baixo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Usar `rowspan=\"2\"` em \"Segunda\": a linha de baixo fica com uma célula a menos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar `colspan=\"2\"` em \"Segunda\"; a linha de baixo ganha uma célula a mais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar `rowspan=\"2\"`, repetindo \"Segunda\" também na linha de baixo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é possível: toda linha precisa ter o mesmo número de células.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Formulários",
        "aulas": [
            {
                "titulo": "Anatomia de um formulário",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Anatomia de um formulário\n\nAté agora você aprendeu a **mostrar** conteúdo: títulos, textos, listas, imagens e links. Neste módulo a página deixa de ser uma via de mão única e passa a **conversar** com o visitante. É aqui que entram os **formulários**: caixas de busca, telas de login, campos de cadastro, o \"deixe seu comentário\". Sempre que um site pede alguma informação para você, tem um formulário por trás.\n\nNesta primeira aula vamos montar o esqueleto de um formulário e entender o papel de cada peça, com calma e do zero."
                    },
                    {
                        "type": "quote",
                        "value": "Um **formulário** é um trecho da página, envolvido pela tag `<form>`, que reúne **campos** para o visitante preencher e um botão para **enviar**. Cada campo costuma ser uma dupla: um `<label>` (o rótulo, que diz o que preencher) e um `<input>` (a caixinha onde se digita). O atributo `action` diz **para onde** os dados vão e o `method` diz **como** eles viajam."
                    },
                    {
                        "type": "text",
                        "value": "## Pense em uma ficha de papel\n\nAntes do computador, para se inscrever em um curso você preenchia uma **ficha de papel**: nome, e-mail, telefone, cada informação numa linha com um rótulo do lado (\"Nome: ____\"). No fim, você entregava a ficha na secretaria.\n\nUm formulário HTML é exatamente essa ficha, só que na tela:\n\n- A **ficha inteira** é a tag `<form>`.\n- Cada **linha para preencher** é um campo (um `<input>`, por exemplo).\n- O **rótulo** ao lado de cada linha é o `<label>`.\n- **Entregar a ficha na secretaria** é apertar o botão de enviar, que manda os dados para um endereço.\n\nGuarde essa imagem: ela explica quase tudo o que vem a seguir."
                    },
                    {
                        "type": "text",
                        "value": "## O formulário mais simples possível\n\nVamos começar pelo menor formulário que faz sentido: um campo para o nome e um botão para enviar. Não se preocupe com cada detalhe ainda, só observe o formato geral:"
                    },
                    {
                        "type": "code",
                        "value": "<form>\n  <label for=\"nome\">Nome:</label>\n  <input id=\"nome\" name=\"nome\" type=\"text\">\n  <button>Enviar</button>\n</form>"
                    },
                    {
                        "type": "text",
                        "value": "Três peças aparecem aí:\n\n- `<form>`: a **ficha inteira**, que envolve tudo. Abre no começo e fecha com `</form>` no fim.\n- A dupla `<label>` + `<input>`: o **rótulo** \"Nome:\" e a **caixinha** onde se digita.\n- `<button>`: o **botão** que envia a ficha preenchida.\n\nNas próximas seções a gente abre cada uma dessas peças. Comecemos pela mais externa, o `<form>`."
                    },
                    {
                        "type": "text",
                        "value": "## A tag `<form>` e dois atributos importantes\n\nA tag `<form>` sozinha só diz \"aqui começa um formulário\". Para ela saber o que fazer quando o visitante clicar em enviar, usamos dois atributos:\n\n- `action`: o **endereço** para onde os dados serão enviados (normalmente uma página no servidor que vai recebê-los).\n- `method`: **como** os dados serão enviados. Os dois valores possíveis são `get` e `post`.\n\nVeja os dois juntos:"
                    },
                    {
                        "type": "code",
                        "value": "<form action=\"/cadastro\" method=\"post\">\n  <label for=\"email\">E-mail:</label>\n  <input id=\"email\" name=\"email\" type=\"email\">\n  <button>Cadastrar</button>\n</form>"
                    },
                    {
                        "type": "text",
                        "value": "Lendo em português: \"quando este formulário for enviado, mande os dados para o endereço `/cadastro`, usando o método `post`\". Se você **não** escrever o `action`, o formulário envia para a **própria página** onde ele está. E se não escrever o `method`, o navegador assume `get`."
                    },
                    {
                        "type": "text",
                        "value": "## GET e POST sem complicação\n\nEsses dois métodos são só **duas formas de entregar a ficha**. A diferença prática é onde os dados vão parar:\n\n- Com `method=\"get\"`, os dados viajam **na própria barra de endereço**, coladinhos no fim da URL, depois de um `?`. É como escrever o recado num **cartão-postal**: chega, mas qualquer um que olhar consegue ler. Por isso o GET é ótimo para **buscas** (o que você digita vira parte do link e pode até ser salvo nos favoritos).\n- Com `method=\"post\"`, os dados viajam **escondidos** no corpo do pedido, fora da URL. É como mandar o recado num **envelope lacrado**. É o método certo para **cadastros, logins e senhas**, coisas que não devem ficar à mostra na URL.\n\nUma pista para lembrar: se enviar o formulário **muda alguma coisa** no servidor (cria uma conta, publica um comentário), use `post`. Se só **pede uma informação** sem alterar nada (uma busca), o `get` serve bem."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Método `get`\",\"Método `post`\"],[\"Onde os dados vão\",\"Na URL, depois do `?`\",\"Escondidos no corpo do pedido\"],[\"Aparece na barra de endereço?\",\"Sim\",\"Não\"],[\"Analogia\",\"Cartão-postal (à mostra)\",\"Envelope lacrado\"],[\"Bom para\",\"Buscas e filtros\",\"Cadastros, logins, senhas\"],[\"Salva nos favoritos?\",\"Sim\",\"Não\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O par `<label>` + `<input>`: por que o rótulo importa\n\nVocê pode até jogar um `<input>` sozinho na página, mas quase sempre ele anda de mãos dadas com um `<label>`. O `<label>` é o **rótulo** do campo, o textinho \"Nome:\", \"E-mail:\", \"Senha:\" que diz ao visitante o que ele deve preencher ali.\n\nPara amarrar um rótulo ao seu campo, usamos dois atributos que se conversam:\n\n- No `<label>`, o atributo `for` (de _for_, \"para\") aponta para o campo.\n- No `<input>`, o atributo `id` dá um **nome único** àquele campo dentro da página.\n\nO truque é: o valor do `for` tem que ser **igual** ao valor do `id`. É assim que o navegador sabe que aquele rótulo pertence àquele campo."
                    },
                    {
                        "type": "code",
                        "value": "<!-- O for do label é igual ao id do input: eles ficam conectados -->\n<label for=\"email\">E-mail:</label>\n<input id=\"email\" name=\"email\" type=\"email\">"
                    },
                    {
                        "type": "text",
                        "value": "Amarrar o rótulo ao campo traz vantagens concretas:\n\n- **Clicar no rótulo** posiciona o cursor no campo (experimente: clicar na palavra \"E-mail:\" já joga o foco para a caixinha). Isso aumenta a área clicável, o que ajuda bastante no celular.\n- **Acessibilidade**: leitores de tela leem o rótulo junto com o campo, então uma pessoa cega sabe que aquela caixa é para o e-mail. Sem `<label>`, o campo é um vazio sem explicação.\n\nExiste ainda uma forma alternativa: colocar o `<input>` **dentro** do `<label>`. Aí nem precisa de `for`/`id`, a conexão é automática pelo aninhamento:"
                    },
                    {
                        "type": "code",
                        "value": "<!-- Alternativa: o input fica dentro do label, dispensando for e id -->\n<label>\n  E-mail:\n  <input name=\"email\" type=\"email\">\n</label>"
                    },
                    {
                        "type": "text",
                        "value": "## O atributo `name`: a etiqueta que vai para o servidor\n\nRepare que os campos vêm com um atributo `name`. Ele é **essencial**: o `name` é o **nome sob o qual o valor digitado é enviado**. Sem `name`, o campo até aparece na tela, mas seu conteúdo **não é enviado** quando o formulário é submetido, como uma linha da ficha que ninguém lê.\n\nPense no par nome/valor como uma etiqueta: se o campo tem `name=\"email\"` e o visitante digita `ana@teste.com`, o que chega ao servidor é o par `email = ana@teste.com`. Num formulário com vários campos, cada um manda o seu par."
                    },
                    {
                        "type": "text",
                        "value": "## Organizando campos com `<fieldset>` e `<legend>`\n\nQuando um formulário cresce, ajuda **agrupar** os campos que têm a ver uns com os outros, tipo separar \"Dados pessoais\" de \"Endereço\". Para isso existem duas tags:\n\n- `<fieldset>`: uma **cerca** que agrupa campos relacionados. O navegador costuma desenhar uma bordinha em volta do grupo.\n- `<legend>`: o **título** desse grupo, que aparece encaixado na borda do `<fieldset>`.\n\nVeja um formulário dividido em dois blocos:"
                    },
                    {
                        "type": "code",
                        "value": "<form action=\"/inscricao\" method=\"post\">\n  <fieldset>\n    <legend>Dados pessoais</legend>\n    <label for=\"nome\">Nome:</label>\n    <input id=\"nome\" name=\"nome\" type=\"text\">\n    <label for=\"nasc\">Nascimento:</label>\n    <input id=\"nasc\" name=\"nascimento\" type=\"date\">\n  </fieldset>\n\n  <fieldset>\n    <legend>Contato</legend>\n    <label for=\"email\">E-mail:</label>\n    <input id=\"email\" name=\"email\" type=\"email\">\n  </fieldset>\n\n  <button>Enviar inscrição</button>\n</form>"
                    },
                    {
                        "type": "text",
                        "value": "Além de deixar o formulário mais organizado visualmente, o `<fieldset>` com `<legend>` ajuda **muito** na acessibilidade: o leitor de tela anuncia a legenda ao entrar no grupo, então a pessoa entende que os próximos campos são \"do bloco Contato\", por exemplo. É um caprichinho que faz diferença."
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** um formulário vive dentro de `<form>`, que leva `action` (para onde enviar) e `method` (`get`, dados na URL, tipo cartão-postal; ou `post`, dados escondidos, tipo envelope lacrado). Cada campo é uma dupla `<label>` + `<input>`, conectados pelo `for` do label igual ao `id` do input, o que melhora o clique e a acessibilidade. O atributo `name` é o nome com que o valor viaja até o servidor, sem ele o campo não é enviado. Use `<fieldset>` e `<legend>` para agrupar e rotular seções de campos."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual tag envolve todo o formulário, agrupando os campos e o botão de envio?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<form>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<label>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<input>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<fieldset>`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o atributo `action` na tag `<form>`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Indica o endereço para onde os dados serão enviados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Define a cor de fundo aplicada ao formulário inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cria o rótulo exibido ao lado de cada campo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede que o formulário seja enviado pelo visitante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença central entre `method=\"get\"` e `method=\"post\"`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No `get`, os dados vão visíveis na URL; no `post`, ficam escondidos.",
                                "isCorrect": true
                            },
                            {
                                "text": "No `get` os dados são enviados normalmente, e no `post` eles somem.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `get` funciona só em celulares; o `post`, apenas em computadores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe diferença real: são a mesma coisa, só escrita diferente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No par rótulo + campo, como o `<label for=\"...\">` fica conectado ao `<input>`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O `for` do label deve ter o mesmo valor do `id` do input.",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor do `for` deve ser igual ao `name` do input.",
                                "isCorrect": false
                            },
                            {
                                "text": "O label precisa vir sempre depois do input, na mesma linha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Basta que os dois estejam dentro do mesmo `<form>`.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um `<input type=\"text\">` aparece na tela e o visitante digita seu nome, mas ao enviar o formulário esse dado não chega ao servidor. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Falta o `name` no `<input>`; sem ele, nada é enviado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Faltou fechar a tag `<input>` com uma tag `</input>`.",
                                "isCorrect": false
                            },
                            {
                                "text": "O formulário está usando `method=\"post\"` em vez de `get`.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `<label>` daquele campo está com o `for` incorreto.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tipos de input",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tipos de input\n\nNa aula passada você conheceu o `<input>`, a caixinha onde o visitante digita. O que talvez surpreenda é que **existe basicamente uma tag `<input>` só**, e ela se transforma em coisas bem diferentes conforme um único atributo: o `type`.\n\nUm `<input>` pode ser um campo de texto, uma caixa de senha, um seletor de data, uma caixa de marcar, um botão de escolha... Tudo depende do `type`. Nesta aula vamos passear pelos tipos mais úteis, um a um, com exemplos de verdade."
                    },
                    {
                        "type": "quote",
                        "value": "O `<input>` é um **camaleão**: o atributo `type` decide o que ele vira. Tipos como `text`, `email`, `password`, `number`, `tel`, `url` e `date` produzem campos de digitação com pequenos superpoderes. Já `checkbox` (caixa de marcar) e `radio` (escolha única) servem para **escolher** opções, `file` para **enviar arquivos** e `hidden` para carregar um dado **invisível** junto do formulário."
                    },
                    {
                        "type": "text",
                        "value": "## Um input, muitos tipos\n\nPense no `<input>` como um **canivete suíço**: é uma ferramenta só, mas você abre a lâmina que precisa. A \"lâmina\" aqui é o atributo `type`. Se você escrever `type=\"text\"`, tem um campo de texto comum; se trocar para `type=\"date\"`, o mesmo `<input>` vira um seletor de data com calendário.\n\nSe você **esquecer** o `type`, o navegador assume `type=\"text\"`. Mas escolher o tipo certo vale muito a pena: além de mudar a aparência, muitos tipos **ajudam quem preenche** (mostram um teclado mais adequado no celular, oferecem um calendário) e **conferem** o que foi digitado (veremos isso na aula de validação)."
                    },
                    {
                        "type": "text",
                        "value": "## Os tipos que são \"caixas de texto\"\n\nVários tipos se parecem com um campo de texto, mas cada um tem um detalhe a mais. Veja os quatro mais comuns:"
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"nome\">Nome:</label>\n<input id=\"nome\" name=\"nome\" type=\"text\">\n\n<label for=\"email\">E-mail:</label>\n<input id=\"email\" name=\"email\" type=\"email\">\n\n<label for=\"senha\">Senha:</label>\n<input id=\"senha\" name=\"senha\" type=\"password\">\n\n<label for=\"idade\">Idade:</label>\n<input id=\"idade\" name=\"idade\" type=\"number\">"
                    },
                    {
                        "type": "text",
                        "value": "O que muda de um para o outro:\n\n- `type=\"text\"`: texto livre, o tipo mais genérico. Serve para nome, apelido, cidade.\n- `type=\"email\"`: espera um endereço de e-mail. No celular, o teclado já aparece com o `@` à mão, e o navegador confere se tem cara de e-mail.\n- `type=\"password\"`: esconde o que é digitado, mostrando bolinhas ou asteriscos no lugar das letras. Ótimo para senhas (mas lembre: esconder na tela não é o mesmo que enviar com segurança, isso é papel do `method=\"post\"` e do servidor).\n- `type=\"number\"`: aceita **apenas números** e costuma vir com setinhas para aumentar e diminuir o valor."
                    },
                    {
                        "type": "text",
                        "value": "## Mais três tipos úteis: `tel`, `url` e `date`\n\nAlém desses, três tipos aparecem bastante em cadastros:"
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"tel\">Telefone:</label>\n<input id=\"tel\" name=\"telefone\" type=\"tel\">\n\n<label for=\"site\">Site:</label>\n<input id=\"site\" name=\"site\" type=\"url\">\n\n<label for=\"nasc\">Data de nascimento:</label>\n<input id=\"nasc\" name=\"nascimento\" type=\"date\">"
                    },
                    {
                        "type": "text",
                        "value": "- `type=\"tel\"`: para telefones. No celular, faz aparecer o **teclado numérico**. Ele não exige um formato fixo (telefones variam muito de país para país), mas já melhora a digitação.\n- `type=\"url\"`: para endereços de sites. O navegador confere se o que foi digitado tem jeito de link (começando com `http://` ou `https://`).\n- `type=\"date\"`: para datas. Aqui o ganho é grande: o navegador mostra um **calendário** para o visitante escolher o dia, em vez de ele digitar a data na mão e errar o formato."
                    },
                    {
                        "type": "table",
                        "value": "[[\"`type`\",\"Serve para\",\"Superpoder\"],[\"`text`\",\"Texto livre (nome, cidade)\",\"Nenhum, é o campo genérico\"],[\"`email`\",\"Endereço de e-mail\",\"Teclado com `@` e conferência do formato\"],[\"`password`\",\"Senhas\",\"Esconde os caracteres na tela\"],[\"`number`\",\"Quantidades, idade\",\"Só aceita números, com setinhas\"],[\"`tel`\",\"Telefone\",\"Abre o teclado numérico no celular\"],[\"`url`\",\"Endereço de site\",\"Confere se parece um link\"],[\"`date`\",\"Datas\",\"Mostra um calendário para escolher\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Caixas de marcar: `type=\"checkbox\"`\n\nNem tudo é digitar. Às vezes o visitante só precisa **marcar** algo. A **checkbox** (caixa de marcar) é um quadradinho que fica ligado ou desligado, perfeito para um \"sim/não\" (\"aceito os termos\") ou para deixar a pessoa escolher **vários** itens de uma lista."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Uma sozinha, para um sim/não -->\n<label>\n  <input type=\"checkbox\" name=\"termos\" value=\"aceito\">\n  Li e aceito os termos de uso\n</label>\n\n<!-- Várias, para escolher quantas quiser -->\n<p>Seus interesses:</p>\n<label><input type=\"checkbox\" name=\"interesses\" value=\"esportes\"> Esportes</label>\n<label><input type=\"checkbox\" name=\"interesses\" value=\"musica\"> Música</label>\n<label><input type=\"checkbox\" name=\"interesses\" value=\"cinema\" checked> Cinema</label>"
                    },
                    {
                        "type": "text",
                        "value": "Dois detalhes importantes:\n\n- O atributo `value` diz **o que será enviado** se a caixa estiver marcada. Na primeira caixa, se marcada, vai `termos = aceito`.\n- O atributo `checked` (escrito sozinho, sem valor) faz a caixa **já começar marcada**. Repare que \"Cinema\" vem com `checked`.\n\nAs checkboxes são **independentes**: marcar uma não desmarca as outras. É por isso que elas servem quando a pessoa pode escolher **mais de uma** opção ao mesmo tempo."
                    },
                    {
                        "type": "text",
                        "value": "## Escolha única: `type=\"radio\"`\n\nE quando a pessoa só pode escolher **uma** opção entre várias (como marcar um único item numa prova de múltipla escolha)? Aí entram os **botões de rádio** (`type=\"radio\"`). O nome vem dos antigos rádios de carro, em que apertar um botão soltava todos os outros.\n\nO segredo dos radios está no atributo `name`: **todos os botões do mesmo grupo compartilham o mesmo `name`**. É isso que os torna \"colegas\" que se excluem, marcar um desmarca automaticamente os outros do grupo."
                    },
                    {
                        "type": "code",
                        "value": "<p>Qual seu plano?</p>\n\n<label>\n  <input type=\"radio\" name=\"plano\" value=\"gratis\" checked>\n  Grátis\n</label>\n\n<label>\n  <input type=\"radio\" name=\"plano\" value=\"pro\">\n  Pro\n</label>\n\n<label>\n  <input type=\"radio\" name=\"plano\" value=\"empresa\">\n  Empresa\n</label>"
                    },
                    {
                        "type": "text",
                        "value": "Repare que os três `<input>` têm o **mesmo** `name=\"plano\"`, mas `value` diferentes. Por isso só um pode ficar marcado: eles formam **um grupo**. Quando o formulário for enviado, vai um único par, por exemplo `plano = pro`, com o `value` da opção escolhida.\n\nSe você desse `name` diferentes a cada um, eles deixariam de ser um grupo e a pessoa conseguiria marcar todos, o que derruba a ideia de \"escolha única\". Por isso, o `name` compartilhado é o coração do radio."
                    },
                    {
                        "type": "text",
                        "value": "## Enviar arquivos: `type=\"file\"`\n\nPara o visitante **anexar um arquivo** (uma foto de perfil, um currículo em PDF), existe o `type=\"file\"`. Ele vira um botão do tipo \"Escolher arquivo\" que abre o explorador de arquivos do computador ou celular."
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"foto\">Foto de perfil:</label>\n<input id=\"foto\" name=\"foto\" type=\"file\" accept=\"image/*\">\n\n<label for=\"docs\">Documentos (pode escolher vários):</label>\n<input id=\"docs\" name=\"docs\" type=\"file\" multiple>"
                    },
                    {
                        "type": "text",
                        "value": "Dois atributos ajudam bastante:\n\n- `accept` limita os **tipos de arquivo** aceitos. `accept=\"image/*\"` só deixa escolher imagens; `accept=\".pdf\"` só PDFs.\n- `multiple` (escrito sozinho) permite escolher **mais de um arquivo** de uma vez.\n\nUm detalhe: formulários que enviam arquivos precisam, no `<form>`, do atributo `enctype=\"multipart/form-data\"` para o arquivo viajar inteiro. Você não precisa decorar isso agora, só saber que existe quando for mexer com upload de verdade."
                    },
                    {
                        "type": "text",
                        "value": "## Dados invisíveis: `type=\"hidden\"`\n\nO último tipo desta aula é curioso: o `type=\"hidden\"` cria um campo que **não aparece na tela** para o visitante, mas que **é enviado** junto com o formulário. É como um bilhete escondido dentro do envelope.\n\nPara que serve algo assim? Para o site mandar junto uma informação que o **próprio sistema** precisa, mas que não faz sentido a pessoa digitar, como o número de identificação de um produto ou uma marca da página de origem."
                    },
                    {
                        "type": "code",
                        "value": "<form action=\"/comentario\" method=\"post\">\n  <!-- O visitante não vê este campo, mas ele viaja junto -->\n  <input type=\"hidden\" name=\"id_do_artigo\" value=\"42\">\n\n  <label for=\"texto\">Seu comentário:</label>\n  <textarea id=\"texto\" name=\"comentario\"></textarea>\n\n  <button>Comentar</button>\n</form>"
                    },
                    {
                        "type": "text",
                        "value": "No exemplo, quando alguém comenta, o formulário envia o comentário **e** o `id_do_artigo = 42`, para o servidor saber em qual artigo o comentário deve entrar, sem incomodar o visitante com esse número.\n\nUm aviso importante: `hidden` significa \"escondido na tela\", **não** \"secreto\". Qualquer pessoa consegue ver e até mudar esse valor olhando o código da página. Por isso, **nunca** guarde senhas ou dados sensíveis num campo `hidden`."
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** o `<input>` muda de forma pelo atributo `type`. Para digitação: `text`, `email`, `password` (esconde as letras), `number`, `tel`, `url` e `date` (mostra calendário). Para escolher: `checkbox` (marca vários, independentes) e `radio` (escolha única, todos com o **mesmo `name`** para se excluírem). O `value` define o que cada opção envia e `checked` já a deixa marcada. `file` anexa arquivos (`accept` filtra o tipo, `multiple` permite vários) e `hidden` leva um dado invisível, mas nunca secreto, junto do envio."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual atributo do `<input>` decide se ele será um campo de texto, uma senha ou um seletor de data?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`type`",
                                "isCorrect": true
                            },
                            {
                                "text": "`name`",
                                "isCorrect": false
                            },
                            {
                                "text": "`value`",
                                "isCorrect": false
                            },
                            {
                                "text": "`id`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual `type` de input esconde os caracteres digitados, mostrando bolinhas ou asteriscos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`password`",
                                "isCorrect": true
                            },
                            {
                                "text": "`text`",
                                "isCorrect": false
                            },
                            {
                                "text": "`hidden`",
                                "isCorrect": false
                            },
                            {
                                "text": "`email`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que todos os botões de um grupo de `radio` devem ter o mesmo atributo `name`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O `name` compartilhado forma um grupo de escolha única.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o `name` igual define a mesma cor para os botões.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, sem o mesmo `name`, os botões somem da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o `name` igual permite marcar vários ao mesmo tempo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença de comportamento entre `checkbox` e `radio`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Checkboxes marcam várias opções; radios do grupo marcam só uma.",
                                "isCorrect": true
                            },
                            {
                                "text": "Checkbox só aceita números; radio só aceita texto digitado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Radio permite marcar várias opções; checkbox permite só uma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há diferença nenhuma: os dois se comportam de forma idêntica.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre o `type=\"hidden\"`, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não aparece na tela, mas é enviado junto com o formulário.",
                                "isCorrect": true
                            },
                            {
                                "text": "É totalmente secreto e seguro para guardar senhas de verdade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aparece na tela, mas nunca é enviado ao servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Serve para esconder um campo, mas só na versão mobile.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Selects, textarea e outros controles",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Selects, textarea e outros controles\n\nO `<input>` dá conta de muita coisa, mas não de tudo. Quando você precisa oferecer uma **lista de opções** para escolher, um espaço para **texto longo** ou um **seletor de cor**, entram em cena outros controles de formulário.\n\nNesta aula vamos conhecer os principais: a lista suspensa `<select>`, a área de texto `<textarea>`, as sugestões do `<datalist>`, o controle deslizante `range`, o seletor `color` e o pequeno grande ajudante `placeholder`."
                    },
                    {
                        "type": "quote",
                        "value": "Além do `<input>`, o HTML traz controles próprios para tarefas específicas: `<select>` (com seus `<option>`) monta uma **lista suspensa** de onde se escolhe uma opção; `<textarea>` oferece uma **caixa de texto grande**, de várias linhas; `<datalist>` dá **sugestões** enquanto se digita; e os tipos `range` (um controle **deslizante**) e `color` (um **seletor de cores**) resolvem casos bem particulares."
                    },
                    {
                        "type": "text",
                        "value": "## A lista suspensa: `<select>`\n\nQuando há **muitas opções** e a pessoa deve escolher **uma**, encher a tela de botões de rádio fica ruim. Melhor usar uma **lista suspensa** (aquela caixinha que abre para baixo mostrando as opções). Ela é feita com duas tags trabalhando juntas:\n\n- `<select>`: a caixa em si, que envolve as opções.\n- `<option>`: cada uma das opções dentro da lista."
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"estado\">Estado:</label>\n<select id=\"estado\" name=\"estado\">\n  <option value=\"sp\">São Paulo</option>\n  <option value=\"rj\">Rio de Janeiro</option>\n  <option value=\"mg\" selected>Minas Gerais</option>\n  <option value=\"ba\">Bahia</option>\n</select>"
                    },
                    {
                        "type": "text",
                        "value": "Repare em cada `<option>`:\n\n- O que fica **entre** as tags (\"São Paulo\") é o que o visitante **vê** na lista.\n- O atributo `value` (\"sp\") é o que **será enviado** ao servidor quando aquela opção for escolhida. Assim, a pessoa lê \"São Paulo\" mas o sistema recebe o código enxuto `sp`.\n- O atributo `selected` (na de Minas Gerais) marca qual opção **já vem escolhida** por padrão. Sem ele, a lista começa na primeira opção.\n\nUm truque comum é usar a primeira `<option>` como uma instrução, deixando-a sem valor útil:"
                    },
                    {
                        "type": "code",
                        "value": "<select name=\"estado\">\n  <option value=\"\">Selecione um estado...</option>\n  <option value=\"sp\">São Paulo</option>\n  <option value=\"rj\">Rio de Janeiro</option>\n</select>"
                    },
                    {
                        "type": "text",
                        "value": "## Agrupando opções com `<optgroup>`\n\nSe a lista é comprida, dá para **agrupar** opções parecidas sob um título usando `<optgroup>` e seu atributo `label`. Os títulos servem só de organização, não são escolhíveis:"
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"time\">Time do coração:</label>\n<select id=\"time\" name=\"time\">\n  <optgroup label=\"Sudeste\">\n    <option value=\"pal\">Palmeiras</option>\n    <option value=\"fla\">Flamengo</option>\n  </optgroup>\n  <optgroup label=\"Sul\">\n    <option value=\"gre\">Grêmio</option>\n    <option value=\"int\">Internacional</option>\n  </optgroup>\n</select>"
                    },
                    {
                        "type": "text",
                        "value": "## Texto longo: `<textarea>`\n\nO `<input type=\"text\">` é uma linha só. Para textos **grandes**, um comentário, uma mensagem, uma biografia, use o `<textarea>`, uma caixa de **várias linhas** que ainda pode ser esticada pelo canto.\n\nUma diferença importante em relação ao `<input>`: o `<textarea>` **tem tag de fechamento**, e o texto inicial (se houver) vai **entre** as tags, não num atributo `value`."
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"msg\">Sua mensagem:</label>\n<textarea id=\"msg\" name=\"mensagem\" rows=\"5\" cols=\"40\"></textarea>\n\n<!-- Com um texto que já vem preenchido -->\n<label for=\"bio\">Bio:</label>\n<textarea id=\"bio\" name=\"bio\" rows=\"3\">Escreva algo sobre você.</textarea>"
                    },
                    {
                        "type": "text",
                        "value": "Os atributos `rows` e `cols` definem o tamanho inicial da caixa: `rows` é o número de **linhas** de altura e `cols`, a largura em **caracteres**. Eles só dão o tamanho de partida, o visitante geralmente pode redimensionar a caixa arrastando o cantinho. E, como no `<input>`, você continua usando o `<label>` para rotular e o `name` para o valor ser enviado."
                    },
                    {
                        "type": "text",
                        "value": "## Sugestões enquanto digita: `<datalist>`\n\nE se você quisesse o melhor dos dois mundos: **sugerir** algumas opções, mas deixar a pessoa **digitar livremente** se nenhuma servir? Esse é o papel do `<datalist>`. Ele se liga a um `<input>` comum pelo atributo `list` (do input) casado com o `id` do datalist."
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"fruta\">Fruta favorita:</label>\n<input id=\"fruta\" name=\"fruta\" list=\"frutas\">\n\n<datalist id=\"frutas\">\n  <option value=\"Maçã\">\n  <option value=\"Banana\">\n  <option value=\"Laranja\">\n  <option value=\"Manga\">\n</datalist>"
                    },
                    {
                        "type": "text",
                        "value": "A diferença para o `<select>` é sutil, mas importante: no `<select>`, a pessoa é **obrigada** a escolher uma das opções da lista. No `<datalist>`, as opções são apenas **sugestões** que aparecem enquanto se digita, mas nada impede escrever algo fora da lista (\"Jabuticaba\", por exemplo). Use `<select>` quando as opções forem fechadas e `<datalist>` quando forem só um atalho."
                    },
                    {
                        "type": "text",
                        "value": "## Deslizando valores: `type=\"range\"`\n\nPara escolher um número dentro de uma faixa **sem precisar digitar**, existe o `type=\"range\"`, aquele controle **deslizante** (uma bolinha que você arrasta numa trilha). É bom para coisas como volume, nível de satisfação ou brilho, quando o valor exato não importa tanto quanto a sensação de \"mais ou menos\"."
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"volume\">Volume:</label>\n<input id=\"volume\" name=\"volume\" type=\"range\" min=\"0\" max=\"100\" step=\"10\" value=\"30\">"
                    },
                    {
                        "type": "text",
                        "value": "Os atributos definem a faixa: `min` é o valor mínimo, `max` o máximo, `step` o **tamanho do salto** a cada movimento (de 10 em 10, no exemplo) e `value` a posição inicial. Um detalhe: o controle deslizante **não mostra** o número escolhido na tela por conta própria, então, na prática, costuma-se exibir o valor ao lado com um toque de JavaScript (assunto para depois)."
                    },
                    {
                        "type": "text",
                        "value": "## Escolhendo cores: `type=\"color\"`\n\nUm tipo simpático e bem específico: o `type=\"color\"` abre o **seletor de cores** do sistema (aquela paleta) e guarda a cor escolhida. O `value` inicial é um código de cor em hexadecimal, aquele formato que começa com `#`, que você vai encontrar bastante quando estudar CSS."
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"cor\">Escolha uma cor:</label>\n<input id=\"cor\" name=\"cor\" type=\"color\" value=\"#3366ff\">"
                    },
                    {
                        "type": "text",
                        "value": "## Uma dica em todo campo: `placeholder`\n\nPor fim, um atributo que serve para vários campos de texto: o `placeholder`. Ele mostra um **texto de exemplo** acinzentado **dentro** do campo, que desaparece assim que a pessoa começa a digitar. Serve para dar uma **dica de formato** ou um exemplo do que se espera."
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"email\">E-mail:</label>\n<input id=\"email\" name=\"email\" type=\"email\" placeholder=\"voce@exemplo.com\">\n\n<label for=\"busca\">Buscar:</label>\n<input id=\"busca\" name=\"busca\" type=\"text\" placeholder=\"Digite um termo e aperte Enter\">"
                    },
                    {
                        "type": "text",
                        "value": "Um cuidado importante: o `placeholder` **não substitui o `<label>`**. O texto do placeholder some quando a pessoa começa a digitar, então, se ele fosse o único rótulo, ela ficaria sem saber o que aquele campo pedia no meio do preenchimento. Além disso, o placeholder acinzentado costuma ter contraste baixo, o que atrapalha a leitura. Regra de ouro: use `placeholder` como uma **dica extra**, sempre com um `<label>` de verdade acompanhando."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Controle\",\"Para que serve\",\"Detalhe-chave\"],[\"`<select>` + `<option>`\",\"Escolher uma opção de uma lista fechada\",\"`value` no option é o que vai; `selected` marca o padrão\"],[\"`<optgroup>`\",\"Agrupar opções sob um título\",\"O `label` nomeia o grupo (não é escolhível)\"],[\"`<textarea>`\",\"Texto longo, de várias linhas\",\"Tem fechamento; texto vai entre as tags\"],[\"`<datalist>`\",\"Sugerir opções sem obrigar\",\"Liga-se ao input pelo `list`/`id`\"],[\"`range`\",\"Escolher número numa faixa, deslizando\",\"Usa `min`, `max` e `step`\"],[\"`color`\",\"Escolher uma cor\",\"`value` é um hexadecimal (ex.: `#3366ff`)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** use `<select>` com `<option>` para uma **lista suspensa** de opções fechadas (o `value` do option é o que se envia; `selected` marca o padrão; `<optgroup label=\"...\">` agrupa). `<textarea>` é a caixa de **texto longo** (tem fechamento, e o conteúdo vai entre as tags). `<datalist>` **sugere** opções sem obrigar, ligado ao input pelo `list`. `type=\"range\"` desliza dentro de `min`/`max`/`step`, e `type=\"color\"` abre a paleta de cores. O `placeholder` dá uma **dica** dentro do campo, mas nunca substitui o `<label>`."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual controle cria uma lista suspensa (dropdown) de opções?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<select>` com `<option>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<textarea>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<input type=\"range\">`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<datalist>` sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para um texto longo de várias linhas, como um comentário, qual elemento é o mais indicado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<textarea>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<input type=\"text\">`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<select>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<input type=\"color\">`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa `<option value=\"sp\">São Paulo</option>`, o que é enviado ao servidor se essa opção for escolhida?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`sp`, o conteúdo do atributo `value`.",
                                "isCorrect": true
                            },
                            {
                                "text": "`São Paulo`, o texto que aparece na tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tanto `sp` quanto `São Paulo`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada, porque `<option>` não envia valor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença entre um `<select>` e um `<input>` ligado a um `<datalist>`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No `<select>`, escolher é obrigatório; no `<datalist>`, é sugestão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há diferença nenhuma: os dois obrigam a escolher da lista.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `<datalist>` funciona apenas com campos numéricos.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `<select>` permite digitar livremente; o `<datalist>`, não.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o `placeholder` não deve ser usado como único rótulo de um campo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque ele some ao digitar e tem contraste baixo na tela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o `placeholder` não funciona em campos de e-mail.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o `placeholder` impede o envio do formulário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o `placeholder` só aparece depois que a pessoa digita algo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Botões e envio dos dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Botões e envio dos dados\n\nVocê já montou os campos; agora falta a parte que **coloca a ficha em movimento**: o botão de enviar. Nesta aula vamos entender os botões de um formulário, o que exatamente acontece quando a pessoa clica em \"enviar\" e como desligar um botão ou campo quando ele não deve ser usado.\n\nÉ uma aula curtinha, mas resolve uma dúvida que pega muita gente: \"escrevi o formulário, cliquei no botão... e agora?\"."
                    },
                    {
                        "type": "quote",
                        "value": "Todo formulário precisa de uma forma de ser **enviado**. O jeito mais comum é um botão de envio, feito com `<button>` ou com `<input type=\"submit\">`. Ao clicar, o navegador recolhe o valor de cada campo (pelo seu `name`), monta os pares `name=valor` e os manda para o `action` do `<form>`, usando o `method` escolhido. O atributo `disabled` **desliga** um botão ou campo, e o que está desligado nem é clicável nem é enviado."
                    },
                    {
                        "type": "text",
                        "value": "## O botão que envia\n\nA estrela do envio é o `<button>`. Colocado **dentro** de um `<form>`, ele já vem, por padrão, com o papel de **enviar o formulário**: é só clicar."
                    },
                    {
                        "type": "code",
                        "value": "<form action=\"/login\" method=\"post\">\n  <label for=\"user\">Usuário:</label>\n  <input id=\"user\" name=\"usuario\" type=\"text\">\n\n  <label for=\"pass\">Senha:</label>\n  <input id=\"pass\" name=\"senha\" type=\"password\">\n\n  <button>Entrar</button>\n</form>"
                    },
                    {
                        "type": "text",
                        "value": "## Os três tipos de botão\n\nAssim como o `<input>`, o `<button>` também tem um atributo `type`, mas aqui ele só assume três valores, cada um com um comportamento:\n\n- `type=\"submit\"`: **envia** o formulário. É o **padrão**, ou seja, um `<button>` sem `type` já se comporta assim.\n- `type=\"reset\"`: **limpa** o formulário, devolvendo todos os campos aos valores iniciais.\n- `type=\"button\"`: um botão \"neutro\", que **não faz nada sozinho**. Ele existe para ser acionado por JavaScript (abrir um menu, somar um item), fora do fluxo de envio."
                    },
                    {
                        "type": "code",
                        "value": "<form action=\"/cadastro\" method=\"post\">\n  <input name=\"nome\" type=\"text\">\n\n  <button type=\"submit\">Enviar</button>\n  <button type=\"reset\">Limpar</button>\n  <button type=\"button\">Só decoração (precisa de JavaScript)</button>\n</form>"
                    },
                    {
                        "type": "text",
                        "value": "Um alerta que evita dor de cabeça: como `submit` é o **padrão**, se você escrever um `<button>` sem `type` dentro de um formulário achando que ele \"não faz nada\", surpresa, ele **envia** o formulário. Quando quiser um botão que não envie, seja explícito com `type=\"button\"`."
                    },
                    {
                        "type": "text",
                        "value": "## Dois jeitos de fazer um botão de envio\n\nExiste um segundo caminho para o botão de enviar: o `<input type=\"submit\">`. Ele faz o mesmo que `<button type=\"submit\">`, com uma diferença na forma de escrever o rótulo. Compare:"
                    },
                    {
                        "type": "code",
                        "value": "<!-- Opção 1: com <button> (o texto vai entre as tags) -->\n<button type=\"submit\">Enviar cadastro</button>\n\n<!-- Opção 2: com <input> (o texto vai no atributo value) -->\n<input type=\"submit\" value=\"Enviar cadastro\">"
                    },
                    {
                        "type": "text",
                        "value": "As duas mostram um botão escrito \"Enviar cadastro\" e enviam o formulário do mesmo jeito. A diferença prática:\n\n- No `<input type=\"submit\">`, o rótulo do botão vem do atributo `value`. Como é um elemento vazio, ele não pode ter conteúdo dentro.\n- No `<button>`, o rótulo vai **entre as tags**, e isso permite colocar ali **outros elementos HTML**, como um ícone ao lado do texto. Por ser mais flexível, o `<button>` é o preferido hoje em dia.\n\nO mesmo vale para `reset`: existe `<input type=\"reset\">` como equivalente ao `<button type=\"reset\">`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Tag `<button>`\",\"Tag `<input>` de envio\"],[\"Como se define o rótulo\",\"Entre as tags de abertura e fechamento\",\"No atributo `value`\"],[\"Pode ter ícone/HTML dentro?\",\"Sim\",\"Não (é elemento vazio)\"],[\"Precisa de tag de fechamento?\",\"Sim (`</button>`)\",\"Não\"],[\"Recomendação atual\",\"Preferido, por ser flexível\",\"Ainda funciona, mas menos usado\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## `name` e `value`: quando o próprio botão vira um dado\n\nAqui vem um detalhe que surpreende: um botão de envio também pode ter `name` e `value`, e aí **o botão clicado vira mais um par enviado**. Isso é útil quando o mesmo formulário tem **dois caminhos de envio** e o servidor precisa saber qual foi escolhido."
                    },
                    {
                        "type": "code",
                        "value": "<form action=\"/post\" method=\"post\">\n  <textarea name=\"texto\"></textarea>\n\n  <!-- Dois botões de envio, diferenciados por name/value -->\n  <button type=\"submit\" name=\"acao\" value=\"rascunho\">Salvar rascunho</button>\n  <button type=\"submit\" name=\"acao\" value=\"publicar\">Publicar</button>\n</form>"
                    },
                    {
                        "type": "text",
                        "value": "Os dois botões enviam o formulário, mas mandam pares diferentes: clicar no primeiro envia `acao = rascunho`; clicar no segundo, `acao = publicar`. Só o par do botão **efetivamente clicado** é enviado. Assim, o servidor lê o valor de `acao` e decide se guarda como rascunho ou se publica de vez, tudo com o mesmo formulário."
                    },
                    {
                        "type": "text",
                        "value": "## O que acontece, passo a passo, ao enviar\n\nQuando a pessoa clica no botão de envio, o navegador faz uma sequência bem definida:\n\n1. **Confere a validação** dos campos (assunto da próxima aula). Se algo obrigatório está vazio ou fora do formato, ele **barra o envio** e aponta o erro.\n2. **Recolhe os valores** de cada campo que tenha `name`, montando os pares `name=valor`.\n3. **Monta o pedido** para o endereço do `action`, no formato definido pelo `method` (`get` põe os pares na URL; `post` os coloca no corpo).\n4. **Envia** e normalmente **carrega a resposta** que o servidor devolver, o que costuma trocar a página.\n\nComo o navegador cuida de tudo isso sozinho, um formulário simples funciona **sem uma linha de JavaScript**. O HTML sozinho já envia dados."
                    },
                    {
                        "type": "text",
                        "value": "## Desligando com `disabled`\n\nÀs vezes um botão ou campo **não deve** ser usado num certo momento, por exemplo, o botão \"Enviar\" antes de a pessoa aceitar os termos. Para isso existe o atributo `disabled` (escrito sozinho, sem valor), que **desativa** o elemento."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Botão desativado: aparece apagado e não pode ser clicado -->\n<button disabled>Enviar</button>\n\n<!-- Campo desativado: não dá para digitar e não é enviado -->\n<label for=\"cupom\">Cupom:</label>\n<input id=\"cupom\" name=\"cupom\" type=\"text\" value=\"BEMVINDO\" disabled>"
                    },
                    {
                        "type": "text",
                        "value": "Um elemento `disabled` tem três características:\n\n- Aparece **apagado** (acinzentado), sinalizando que está fora do ar.\n- **Não pode** ser clicado nem editado.\n- **Não é enviado** com o formulário, mesmo que tenha um `value`. Repare nisso: o campo cupom acima, apesar de ter `value=\"BEMVINDO\"`, não manda nada enquanto estiver `disabled`.\n\nNa prática, um pouco de JavaScript costuma **ligar e desligar** o `disabled` conforme a situação (habilitar o \"Enviar\" só depois que os termos forem aceitos, por exemplo). Mas a marcação de partida é esse atributo simples do HTML."
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** um `<button>` dentro do `<form>` **envia** por padrão (é `type=\"submit\"`). Os tipos são `submit` (envia), `reset` (limpa) e `button` (neutro, só com JavaScript). `<button>` e `<input type=\"submit\">` fazem o mesmo, mas o `<button>` é mais flexível (aceita HTML dentro; o input usa o `value` como rótulo). Botões com `name`/`value` mandam qual foi clicado, útil para \"salvar\" vs \"publicar\". Ao enviar, o navegador valida, recolhe os pares `name=valor` e os manda ao `action` pelo `method`. O `disabled` apaga o elemento: ele não é clicável nem enviado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o `type` padrão de um `<button>` dentro de um formulário (o que ele faz se você não escrever o `type`)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`submit`: envia o formulário.",
                                "isCorrect": true
                            },
                            {
                                "text": "`reset`: limpa o formulário.",
                                "isCorrect": false
                            },
                            {
                                "text": "`button`: não faz nada sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "`text`: vira um campo de texto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual atributo desativa um botão, deixando-o apagado e não clicável?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`disabled`",
                                "isCorrect": true
                            },
                            {
                                "text": "`hidden`",
                                "isCorrect": false
                            },
                            {
                                "text": "`readonly`",
                                "isCorrect": false
                            },
                            {
                                "text": "`reset`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença entre `type=\"reset\"` e `type=\"submit\"` num botão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`submit` envia o formulário; `reset` limpa os campos preenchidos.",
                                "isCorrect": true
                            },
                            {
                                "text": "`submit` limpa os campos e `reset` envia o formulário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois enviam o formulário; a única diferença é a cor do botão.",
                                "isCorrect": false
                            },
                            {
                                "text": "`reset` só funciona com JavaScript; `submit` funciona sozinho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma vantagem do `<button>` sobre o `<input type=\"submit\">` é que:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O `<button>` aceita HTML dentro, como um ícone de verdade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só o `<button>` é capaz de enviar formulários de verdade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `<input type=\"submit\">` não funciona em telas de celular.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `<button>` dispensa por completo a tag `<form>`.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um campo `<input type=\"text\" name=\"cupom\" value=\"BEMVINDO\" disabled>` está dentro de um formulário. O que acontece com esse campo ao enviar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aparece apagado, não pode ser editado e não é enviado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele é enviado normalmente, pois tem um `value` preenchido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele é enviado, mas só quando o formulário usa `method=\"get\"`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele impede que o formulário inteiro seja enviado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Validação nativa do HTML",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Validação nativa do HTML\n\nImagine um cadastro em que a pessoa deixa o e-mail em branco, digita \"abc\" no lugar da idade ou esquece a senha. Seria péssimo descobrir isso só lá no servidor, depois de enviar. O ideal é **avisar na hora**, ainda na tela, antes de mandar qualquer coisa.\n\nA boa notícia é que o HTML faz boa parte dessa conferência **sozinho**, sem JavaScript. Basta você adicionar alguns atributos aos campos. Isso se chama **validação nativa**, e é o assunto desta aula, que fecha o módulo de formulários."
                    },
                    {
                        "type": "quote",
                        "value": "O próprio navegador consegue **conferir os campos** antes de enviar o formulário, de graça, só com atributos no HTML. `required` torna o campo **obrigatório**; `minlength`/`maxlength` limitam o **tamanho do texto**; `min`/`max`/`step` limitam **números**; `pattern` exige um **formato** específico; e tipos como `email` e `url` já **checam o formato** sozinhos. Quando algo está errado, o navegador **barra o envio** e mostra uma **bolha de erro** apontando o campo."
                    },
                    {
                        "type": "text",
                        "value": "## O que é \"validar\" um formulário\n\n**Validar** é conferir se o que foi preenchido está **aceitável** antes de enviar: campos obrigatórios não podem ficar vazios, um e-mail precisa ter cara de e-mail, uma idade precisa ser um número dentro de uma faixa razoável, e assim por diante.\n\nAntigamente isso exigia código. Hoje, para as regras mais comuns, você só **descreve a regra com um atributo** e o navegador cuida do resto: se algo não bate, ele **impede o envio** e explica o problema para a pessoa. Vamos ver os atributos mais úteis."
                    },
                    {
                        "type": "text",
                        "value": "## Campo obrigatório: `required`\n\nO mais usado de todos. O atributo `required` (escrito sozinho, sem valor) marca um campo como **obrigatório**: o formulário **não é enviado** enquanto ele estiver vazio."
                    },
                    {
                        "type": "code",
                        "value": "<form action=\"/cadastro\" method=\"post\">\n  <label for=\"nome\">Nome:</label>\n  <input id=\"nome\" name=\"nome\" type=\"text\" required>\n\n  <label for=\"email\">E-mail:</label>\n  <input id=\"email\" name=\"email\" type=\"email\" required>\n\n  <button>Cadastrar</button>\n</form>"
                    },
                    {
                        "type": "text",
                        "value": "Se a pessoa clicar em \"Cadastrar\" com o nome em branco, o navegador **não envia**: ele para no primeiro campo obrigatório vazio, coloca o foco nele e mostra uma mensagem tipo \"Preencha este campo\". O `required` funciona em quase todos os campos: caixas de texto, `email`, `select`, `checkbox` (aí a caixa passa a ser de marcação obrigatória, como um \"aceito os termos\") e outros."
                    },
                    {
                        "type": "text",
                        "value": "## Tamanho do texto: `minlength` e `maxlength`\n\nPara campos de texto, dá para exigir um **número mínimo** e limitar um **número máximo** de caracteres:\n\n- `minlength`: a quantidade **mínima** de caracteres.\n- `maxlength`: a quantidade **máxima** de caracteres."
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"senha\">Senha (mínimo 8 caracteres):</label>\n<input id=\"senha\" name=\"senha\" type=\"password\" minlength=\"8\" required>\n\n<label for=\"apelido\">Apelido (até 15 caracteres):</label>\n<input id=\"apelido\" name=\"apelido\" type=\"text\" maxlength=\"15\">"
                    },
                    {
                        "type": "text",
                        "value": "Os dois se comportam de um jeito um pouco diferente:\n\n- O `maxlength` é um **teto rígido**: o campo simplesmente **não deixa** digitar além do limite. A pessoa nem consegue passar de 15 letras no apelido.\n- O `minlength` é conferido **na hora de enviar**: se a senha tiver menos de 8 caracteres, o navegador barra o envio e avisa que faltou.\n\nJuntos, eles são úteis para senhas, apelidos, mensagens com limite e por aí vai."
                    },
                    {
                        "type": "text",
                        "value": "## Faixa de números: `min`, `max` e `step`\n\nQuando o campo é numérico (`type=\"number\"` ou `type=\"range\"`), três atributos controlam quais números valem:\n\n- `min`: o **menor** valor aceito.\n- `max`: o **maior** valor aceito.\n- `step`: o **salto** permitido entre um valor e outro."
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"idade\">Idade (de 18 a 120):</label>\n<input id=\"idade\" name=\"idade\" type=\"number\" min=\"18\" max=\"120\" required>\n\n<label for=\"qtd\">Quantidade (de 2 em 2):</label>\n<input id=\"qtd\" name=\"qtd\" type=\"number\" min=\"0\" max=\"10\" step=\"2\">"
                    },
                    {
                        "type": "text",
                        "value": "Com isso, o navegador recusa uma idade de 15 (abaixo do `min`) ou de 200 (acima do `max`), avisando a faixa permitida. O `step=\"2\"` no segundo campo faz o valor andar de 2 em 2 (0, 2, 4, 6...), então um número ímpar como 3 seria rejeitado. É uma forma enxuta de garantir que o número faça sentido antes mesmo de sair da tela."
                    },
                    {
                        "type": "text",
                        "value": "## Tipos que já validam sozinhos: `email` e `url`\n\nLembra dos tipos de input da aula 2? Alguns deles **já validam o formato** de brinde, sem nenhum atributo a mais. O caso clássico é o `type=\"email\"`: o navegador confere se o texto tem **jeito de e-mail** (um nome, um `@`, um domínio). Se a pessoa digitar `ana.teste.com` (sem o `@`), o envio é barrado."
                    },
                    {
                        "type": "code",
                        "value": "<label for=\"email\">E-mail:</label>\n<input id=\"email\" name=\"email\" type=\"email\" required>\n\n<label for=\"site\">Site:</label>\n<input id=\"site\" name=\"site\" type=\"url\">"
                    },
                    {
                        "type": "text",
                        "value": "Repare que basta escolher o `type` certo. O `type=\"email\"` sozinho já recusa um texto sem `@`; some o `required` e o campo passa a ser, ao mesmo tempo, **obrigatório** e **conferido no formato**. O `type=\"url\"` faz o mesmo para links, exigindo algo com cara de endereço (como `https://...`). É a validação mais barata que existe: você não escreveu nenhuma regra, só escolheu o tipo adequado do campo."
                    },
                    {
                        "type": "text",
                        "value": "## Formatos sob medida: `pattern`\n\nE quando a regra é bem específica, um CEP de 8 dígitos, um nome de usuário só com letras? Aí entra o `pattern`, que permite descrever um **molde** que o texto precisa seguir. Esse molde é escrito numa linguagenzinha de padrões (as \"expressões regulares\"), que você vai estudar com calma mais para a frente; por ora, veja a ideia:"
                    },
                    {
                        "type": "code",
                        "value": "<!-- Só aceita exatamente 8 dígitos (ex.: um CEP sem traço) -->\n<label for=\"cep\">CEP:</label>\n<input id=\"cep\" name=\"cep\" type=\"text\" pattern=\"[0-9]{8}\"\n       title=\"Digite os 8 números do CEP, sem traço\" required>\n\n<!-- Só aceita letras (sem números ou símbolos) -->\n<label for=\"user\">Usuário:</label>\n<input id=\"user\" name=\"usuario\" type=\"text\" pattern=\"[A-Za-z]+\"\n       title=\"Use apenas letras\">"
                    },
                    {
                        "type": "text",
                        "value": "Não se assuste com o `[0-9]{8}`: por enquanto, basta entender que ele significa \"oito caracteres, cada um de 0 a 9\". O importante é o **conceito**: o `pattern` diz um formato exato e o navegador recusa tudo que não encaixe.\n\nUm par indispensável do `pattern` é o atributo `title`: use-o para **explicar a regra em português**. Quando o texto não bate com o padrão, o navegador mostra esse `title` na mensagem de erro, então, sem ele, a pessoa fica sem saber o que corrigir."
                    },
                    {
                        "type": "text",
                        "value": "## A bolha de erro do navegador\n\nVocê já deve ter esbarrado nela: aquela **bolhinha** que salta do campo dizendo \"Preencha este campo\" ou \"Inclua um @ no endereço de e-mail\". Ela é a cara da validação nativa. Quando um envio é barrado, o navegador:\n\n1. **Impede** o formulário de ser enviado.\n2. **Leva o foco** para o primeiro campo com problema.\n3. **Mostra a bolha** com uma explicação (a mensagem padrão, ou o seu `title`, no caso do `pattern`).\n\nDuas observações que valem ouro:\n\n- A mensagem sai **no idioma do navegador** da pessoa, e o visual da bolha muda de um navegador para outro, você ganha tudo isso de graça.\n- Essa checagem acontece **no navegador** (do lado de quem preenche). Ela melhora a experiência, mas **pode ser burlada** por alguém mal-intencionado. Por isso, todo dado ainda precisa ser **conferido de novo no servidor**. A validação do HTML é a primeira barreira, não a única."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Atributo\",\"O que garante\",\"Exemplo de uso\"],[\"`required`\",\"O campo não pode ficar vazio\",\"Campo obrigatório\"],[\"`minlength` / `maxlength`\",\"Mínimo e máximo de caracteres\",\"Senha com no mínimo 8\"],[\"`min` / `max`\",\"Menor e maior número aceito\",\"Idade de 18 a 120\"],[\"`step`\",\"De quanto em quanto o número anda\",\"De 2 em 2\"],[\"`pattern`\",\"Um formato exato (com `title` explicando)\",\"CEP com 8 dígitos\"],[\"Tipo `email` / `url`\",\"Formato de e-mail ou de link\",\"Confere o `@` sozinho\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** o HTML valida campos sozinho, sem JavaScript. `required` obriga a preencher; `minlength`/`maxlength` limitam o tamanho do texto (`maxlength` nem deixa passar; `minlength` confere no envio); `min`/`max`/`step` limitam números; `pattern` exige um formato exato (sempre com um `title` explicando a regra); e tipos como `email` e `url` já conferem o formato de brinde. Ao falhar, o navegador barra o envio e mostra a **bolha de erro** no campo. Lembre-se: isso roda no navegador e é uma conveniência, o **servidor precisa validar tudo de novo**."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual atributo torna o preenchimento de um campo obrigatório?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`required`",
                                "isCorrect": true
                            },
                            {
                                "text": "`pattern`",
                                "isCorrect": false
                            },
                            {
                                "text": "`min`",
                                "isCorrect": false
                            },
                            {
                                "text": "`disabled`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sem escrever nenhuma regra extra, qual `type` de input já confere sozinho se o texto tem cara de e-mail (com `@`)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`type=\"email\"`",
                                "isCorrect": true
                            },
                            {
                                "text": "`type=\"text\"`",
                                "isCorrect": false
                            },
                            {
                                "text": "`type=\"password\"`",
                                "isCorrect": false
                            },
                            {
                                "text": "`type=\"number\"`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença de comportamento entre `maxlength` e `minlength` num campo de texto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`maxlength` trava a digitação; `minlength` é checado só ao enviar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois travam a digitação em tempo real, além ou aquém do limite definido.",
                                "isCorrect": false
                            },
                            {
                                "text": "`minlength` limita números; `maxlength` limita apenas letras.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há diferença nenhuma: os dois só agem no momento do envio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao usar `pattern`, por que é importante incluir também o atributo `title`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o navegador mostra o `title` na mensagem de erro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque sem o `title`, o `pattern` simplesmente não funciona.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o `title` é quem define o número mínimo de caracteres.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o `title` é o responsável por enviar o campo ao servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site confia apenas na validação nativa do HTML (`required`, `pattern` etc.) e não confere nada no servidor. Por que isso é arriscado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque a validação roda no navegador e pode ser burlada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a validação nativa do HTML só funciona em celulares.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque `required` e `pattern` nunca podem ser usados juntos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a validação nativa apaga os dados antes de enviar.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - HTML semântico e boas práticas",
        "aulas": [
            {
                "titulo": "HTML semântico",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# HTML semântico\n\nAté aqui você aprendeu a montar páginas com títulos, parágrafos, listas, links e imagens. Tudo funcionando! Mas existe uma diferença enorme entre um HTML que *funciona* e um HTML *bem escrito*. É sobre essa diferença que este módulo inteiro fala, e a gente começa pela ideia mais importante de todas: a **semântica**.\n\nCalma que o nome assusta mais do que a coisa. Ao final desta aula você vai olhar para um monte de `<div>` e sentir que dá para fazer melhor, com tags que realmente *dizem alguma coisa* sobre o conteúdo."
                    },
                    {
                        "type": "quote",
                        "value": "**Semântica** é usar a tag **certa** para cada tipo de conteúdo: uma tag que descreve o **papel** daquilo na página, e não só uma caixa qualquer. Um `<nav>` diz \"isto é a navegação\"; um `<header>` diz \"isto é o cabeçalho\". Escrever HTML semântico é dar **significado** à estrutura, para que pessoas, leitores de tela e o Google entendam a sua página."
                    },
                    {
                        "type": "text",
                        "value": "## O que é semântica, afinal?\n\nA palavra **semântica** vem do estudo do **significado**. No mundo do HTML, escrever de forma semântica quer dizer **escolher a tag pelo significado do conteúdo**, e não pela aparência.\n\nUma analogia ajuda. Imagine uma mudança de casa. Você pode empacotar tudo em caixas idênticas, sem nada escrito nelas. Vai funcionar: a tralha chega ao destino. Mas na hora de desempacotar é um pesadelo, porque você precisa abrir cada caixa para descobrir o que tem dentro. Agora imagine que cada caixa tem uma **etiqueta**: \"cozinha\", \"livros\", \"banheiro\". O conteúdo é o mesmo, mas de repente tudo faz sentido, e qualquer pessoa (o carregador, ou você daqui a um ano) sabe o que é cada coisa só de bater o olho.\n\nAs tags semânticas são essas **etiquetas**. Uma `<div>` é a caixa sem nome; um `<header>` é a caixa escrita \"cabeçalho\"."
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa (três motivos fortes)\n\nVocê pode estar pensando: \"mas se funciona do mesmo jeito, por que me preocupar?\". Porque o HTML semântico traz três ganhos bem concretos:\n\n- **Acessibilidade**: pessoas cegas navegam com **leitores de tela**. Essas ferramentas usam as tags semânticas para deixar a pessoa **pular** direto para o menu, para o conteúdo principal ou para o rodapé. Com um mar de `<div>`, esses atalhos somem.\n- **SEO** (aparecer bem no Google): os buscadores leem o seu HTML para entender do que a página trata. Quando você marca o conteúdo principal como `<main>` e o menu como `<nav>`, você **entrega essa estrutura de bandeja** para o buscador.\n- **Manutenção**: seis meses depois, quando você (ou outra pessoa) abrir o código, `<header>`, `<main>` e `<footer>` contam a história da página num relance. Um monte de `<div>` aninhada não conta nada."
                    },
                    {
                        "type": "text",
                        "value": "## O problema da \"sopa de divs\"\n\nAntes das tags semânticas, era comum montar a página inteira só com `<div>`. O resultado é o que a comunidade apelidou de **\"sopa de divs\"** (_div soup_): um empilhado de caixas genéricas que funciona, mas não diz nada sobre o conteúdo. Olhe este cabeçalho de site montado só com `<div>`:"
                    },
                    {
                        "type": "code",
                        "value": "<div class=\"cabecalho\">\n  <div class=\"logo\">Minha Loja</div>\n  <div class=\"menu\">\n    <a href=\"/\">Início</a>\n    <a href=\"/produtos\">Produtos</a>\n    <a href=\"/contato\">Contato</a>\n  </div>\n</div>"
                    },
                    {
                        "type": "text",
                        "value": "Funciona? Funciona. Mas repare que **só as classes** (`cabecalho`, `menu`) dão alguma pista do papel de cada bloco, e classe é algo que **só o desenvolvedor lê**. Para o navegador, o leitor de tela e o Google, tudo ali é \"uma caixa dentro de outra caixa\". A informação de que aquilo é um cabeçalho com uma navegação simplesmente **não existe** para as máquinas.\n\nAgora vamos conhecer as tags que resolvem isso."
                    },
                    {
                        "type": "text",
                        "value": "## As tags de estrutura da página\n\nO HTML5 trouxe um conjunto de tags feitas para marcar as **grandes regiões** de uma página. São elas que substituem boa parte das `<div>`:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tag\",\"Marca...\",\"Pense nela como\"],[\"`<header>`\",\"O cabeçalho (topo) de uma página ou seção\",\"A capa de um caderno\"],[\"`<nav>`\",\"Um bloco de navegação (menu de links)\",\"O índice / sumário\"],[\"`<main>`\",\"O conteúdo principal e único da página\",\"O miolo do assunto\"],[\"`<section>`\",\"Uma seção temática do conteúdo\",\"Um capítulo\"],[\"`<article>`\",\"Um conteúdo que faz sentido sozinho\",\"Uma reportagem de revista\"],[\"`<aside>`\",\"Um conteúdo lateral, complementar\",\"Uma nota na margem\"],[\"`<footer>`\",\"O rodapé (base) de uma página ou seção\",\"A contracapa\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A mesma página, agora com significado\n\nVeja como fica o esqueleto de uma página de blog usando essas tags. Não precisa entender cada detalhe ainda; repare só em como as tags **já contam** onde começa o topo, o menu, o conteúdo e o rodapé:"
                    },
                    {
                        "type": "code",
                        "value": "<body>\n  <header>\n    <h1>Blog da Ana</h1>\n  </header>\n\n  <nav>\n    <a href=\"/\">Início</a>\n    <a href=\"/sobre\">Sobre</a>\n  </nav>\n\n  <main>\n    <article>\n      <h2>Minha viagem ao Japão</h2>\n      <p>Foram duas semanas inesquecíveis...</p>\n    </article>\n  </main>\n\n  <footer>\n    <p>Feito com carinho pela Ana, 2026.</p>\n  </footer>\n</body>"
                    },
                    {
                        "type": "text",
                        "value": "## header, nav e main de perto\n\nVamos entender as três primeiras, que aparecem em praticamente todo site:\n\n- **`<header>`**: o **cabeçalho**. Costuma guardar o logo, o título do site e, às vezes, o menu. Um detalhe: você pode ter **mais de um** `<header>` na página, porque cada `<article>` ou `<section>` pode ter o seu próprio cabeçalho.\n- **`<nav>`**: um bloco de **navegação**, ou seja, um conjunto de links importantes para se locomover pelo site (o menu principal, por exemplo). Nem todo link precisa estar num `<nav>`; ele é para os **grupos** de navegação.\n- **`<main>`**: o **conteúdo principal** da página, aquilo que é único dela. Aqui a regra é diferente: deve existir **apenas um** `<main>` por página, e ele não deve conter coisas que se repetem no site inteiro (como o menu ou o rodapé)."
                    },
                    {
                        "type": "code",
                        "value": "<header>\n  <h1>Padaria do Zé</h1>\n  <nav>\n    <a href=\"/\">Início</a>\n    <a href=\"/cardapio\">Cardápio</a>\n    <a href=\"/contato\">Contato</a>\n  </nav>\n</header>"
                    },
                    {
                        "type": "text",
                        "value": "## section, article, aside e footer\n\nE as outras quatro:\n\n- **`<section>`**: agrupa um conteúdo por **tema**, como um capítulo de um livro. Costuma começar com um título (um `<h2>`, por exemplo) que dá nome à seção.\n- **`<article>`**: marca um conteúdo que **faz sentido sozinho**, que você poderia recortar e publicar em outro lugar sem perder o sentido: um post de blog, uma notícia, um comentário, um card de produto.\n- **`<aside>`**: um conteúdo **paralelo**, ligado ao assunto mas que não faz parte dele diretamente: uma barra lateral, uma caixa de \"leia também\", um anúncio.\n- **`<footer>`**: o **rodapé**. Fica na base e costuma trazer autoria, direitos, contatos e links secundários. Assim como o `<header>`, pode haver mais de um.\n\nA dúvida clássica é \"`<section>` ou `<article>`?\". A regra de bolso: se o bloco faria sentido **publicado sozinho, fora da página**, é `<article>`; se é só um **trecho temático** dentro de um todo maior, é `<section>`."
                    },
                    {
                        "type": "code",
                        "value": "<main>\n  <article>\n    <h2>Bolo de cenoura da vovó</h2>\n    <p>Uma receita simples e infalível para o café da tarde.</p>\n\n    <aside>\n      <h3>Você também vai gostar</h3>\n      <p>Veja a nossa receita de brigadeiro caseiro.</p>\n    </aside>\n  </article>\n</main>\n\n<footer>\n  <p>© 2026 Receitas da Vovó. Todos os direitos reservados.</p>\n</footer>"
                    },
                    {
                        "type": "text",
                        "value": "## E as div e span? Continuam existindo!\n\nSemântica é ótima, mas às vezes você precisa mesmo de uma **caixa neutra**, sem significado nenhum, só para agrupar coisas e depois estilizar com CSS. Para isso servem a `<div>` e a `<span>`. Elas são as tags **sem semântica** de propósito:\n\n- **`<div>`**: uma caixa **de bloco** (ocupa a linha inteira). Serve para agrupar pedaços maiores quando não existe uma tag semântica adequada.\n- **`<span>`**: uma caixa **em linha** (fica no meio do texto, sem quebrar a linha). Serve para marcar um pedacinho de texto, geralmente para estilizar só aquele trecho.\n\nPense na `<div>` e na `<span>` como **recipientes transparentes**: elas não mudam o significado do que está dentro, só embrulham. Use-as quando **nenhuma** tag semântica se encaixar."
                    },
                    {
                        "type": "code",
                        "value": "<!-- div: agrupa um bloco (a linha inteira) -->\n<div class=\"cartao\">\n  <h3>Plano Premium</h3>\n  <p>Acesso a todos os cursos.</p>\n</div>\n\n<!-- span: marca um trecho no meio do texto -->\n<p>Este produto custa <span class=\"preco\">R$ 99</span> à vista.</p>"
                    },
                    {
                        "type": "text",
                        "value": "## div genérica vs tag semântica: como decidir\n\nA pergunta que fica é: \"quando uso `<div>` e quando uso uma tag semântica?\". A regra é simples e vale a pena guardar: **primeiro procure uma tag semântica que descreva o conteúdo; só use `<div>` (ou `<span>`) quando nenhuma servir.**\n\nSe aquilo é o cabeçalho, use `<header>`; se é o menu, use `<nav>`; se é o rodapé, use `<footer>`. Repare no \"antes e depois\" abaixo: as duas versões aparecem **idênticas** na tela, mas só a segunda **conta a sua história** para as máquinas."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Antes: tudo div, nada de significado -->\n<div class=\"topo\">\n  <div class=\"titulo\">Meu Site</div>\n</div>\n<div class=\"conteudo\">\n  <div class=\"post\">Meu primeiro post</div>\n</div>\n<div class=\"rodape\">Contato: ola@site.com</div>\n\n<!-- Depois: as tags certas para cada papel -->\n<header>\n  <h1>Meu Site</h1>\n</header>\n<main>\n  <article>Meu primeiro post</article>\n</main>\n<footer>Contato: ola@site.com</footer>"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** escrever HTML **semântico** é escolher a tag pelo **significado** do conteúdo. As grandes regiões da página têm tags próprias: `<header>` (topo), `<nav>` (menu), `<main>` (conteúdo principal e único), `<section>` (seção temática), `<article>` (conteúdo independente), `<aside>` (conteúdo lateral) e `<footer>` (rodapé). A `<div>` (bloco) e a `<span>` (em linha) são caixas **neutras**: use-as só quando nenhuma tag semântica servir. Semântica melhora **acessibilidade**, **SEO** e **manutenção** de uma vez só."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é HTML semântico?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Escolher a tag pelo significado do conteúdo, dando sentido à estrutura.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixar o código bem colorido dentro do editor de texto usado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar apenas `<div>` para tudo, porque é bem mais rápido de escrever.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever o CSS sempre junto do HTML, dentro do mesmo arquivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual tag marca o conteúdo principal e único de uma página, devendo aparecer só uma vez?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<main>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<header>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<div>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<aside>`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença entre `<div>`/`<span>` e as tags semânticas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`<div>` e `<span>` são caixas neutras; as semânticas descrevem o papel.",
                                "isCorrect": true
                            },
                            {
                                "text": "`<div>` e `<span>` descrevem o conteúdo; as semânticas é que são neutras.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe diferença real: são só nomes diferentes para a mesma coisa.",
                                "isCorrect": false
                            },
                            {
                                "text": "`<div>` e `<span>` funcionam só no celular; as semânticas, no computador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que vale a pena usar tags semânticas em vez de montar tudo com `<div>`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque dão significado à estrutura, ajudando acessibilidade e SEO.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque deixam automaticamente a página com cores mais bonitas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque fazem a internet inteira funcionar visivelmente mais rápida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não vale: é só uma questão de estética do código, sem nenhum efeito prático real.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você vai marcar o menu de navegação, o conteúdo principal e uma barra lateral de 'posts relacionados'. Quais tags usar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "`<nav>` para o menu, `<main>` para o conteúdo principal e `<aside>` para a barra lateral.",
                                "isCorrect": true
                            },
                            {
                                "text": "`<div>` para os três, já que a semântica não muda nada no resultado.",
                                "isCorrect": false
                            },
                            {
                                "text": "`<main>` para o menu, `<nav>` para a barra lateral e `<header>` para o conteúdo.",
                                "isCorrect": false
                            },
                            {
                                "text": "`<footer>` para o menu, `<section>` para o conteúdo e `<header>` para a barra lateral.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Acessibilidade básica",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Acessibilidade básica\n\nNa aula anterior você viu que o HTML semântico ajuda quem usa **leitores de tela**. Isso é parte de um assunto maior e importantíssimo: a **acessibilidade**. Uma página acessível é uma página que **todo mundo** consegue usar, inclusive quem enxerga pouco, quem não usa o mouse e quem tem alguma limitação motora.\n\nA melhor notícia é que boa parte da acessibilidade **sai de graça** quando você escreve um HTML caprichado. Nesta aula você vai aprender um punhado de hábitos simples que abrem a sua página para muito mais gente."
                    },
                    {
                        "type": "quote",
                        "value": "**Acessibilidade** é construir páginas que **qualquer pessoa** consiga usar, inclusive quem depende de um leitor de tela ou navega só pelo teclado. A base não é nenhum truque avançado: é HTML bem escrito, com `alt` nas imagens, `label` nos formulários, títulos em ordem e as tags semânticas no lugar certo."
                    },
                    {
                        "type": "text",
                        "value": "## Para quem a gente constrói\n\nQuando você faz uma página, é fácil imaginar só uma pessoa igual a você: enxergando a tela e usando o mouse. Mas a web é usada de muitos jeitos:\n\n- Pessoas **cegas ou com baixa visão** usam **leitores de tela**, programas que leem o conteúdo em voz alta (ou o enviam para um display em braile).\n- Pessoas com **limitações motoras** podem não usar o mouse e navegar tudo pelo **teclado**.\n- Pessoas com **daltonismo** podem não distinguir certas cores.\n- E há a situação de todo mundo: internet ruim, tela pequena, sol batendo no celular.\n\nFazer acessibilidade é lembrar dessas pessoas. E o alicerce de tudo é o HTML bem marcado, exatamente o que você já vem aprendendo."
                    },
                    {
                        "type": "text",
                        "value": "## 1. O alt das imagens\n\nVocê já viu o `alt` lá no módulo de imagens, mas ele é tão central para a acessibilidade que merece a revisão. O `alt` (de _alternative text_) é a **descrição em texto** de uma imagem. Quando uma pessoa cega chega numa `<img>`, o leitor de tela **lê o alt em voz alta**: é assim que ela \"vê\" a imagem.\n\nDuas regras de ouro:\n\n- Descreva o que a imagem **mostra e significa** naquele contexto, de forma curta e direta.\n- Se a imagem é **puramente decorativa** (um enfeite que não acrescenta informação), use `alt=\"\"` (vazio). Assim o leitor de tela **pula** a imagem, em vez de anunciar um nome de arquivo sem sentido."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Boa descrição: informativa e curta -->\n<img src=\"grafico.png\" alt=\"Vendas subiram 30% em 2026\">\n\n<!-- Imagem decorativa: alt vazio, o leitor de tela ignora -->\n<img src=\"enfeite.png\" alt=\"\">\n\n<!-- Evite: sem alt, o leitor lê o nome do arquivo ou nada -->\n<img src=\"IMG_4821.png\">"
                    },
                    {
                        "type": "text",
                        "value": "## 2. O label nos formulários\n\nTodo campo de formulário (`<input>`, `<textarea>` e afins) precisa de um **rótulo** que diga o que se espera ali: \"Nome\", \"E-mail\", \"Senha\". Esse rótulo é a tag `<label>`.\n\nMas não basta escrever o texto solto ao lado do campo: você precisa **conectar** o `<label>` ao `<input>`. Isso se faz com um par de atributos: o `for` do label recebe o mesmo valor do `id` do input. Assim o leitor de tela sabe que aquele rótulo pertence àquele campo, e de quebra, clicar no texto já foca o campo (ótimo no celular)."
                    },
                    {
                        "type": "code",
                        "value": "<!-- O for do label combina com o id do input -->\n<label for=\"email\">Seu e-mail</label>\n<input type=\"email\" id=\"email\" name=\"email\">\n\n<label for=\"senha\">Sua senha</label>\n<input type=\"password\" id=\"senha\" name=\"senha\">"
                    },
                    {
                        "type": "text",
                        "value": "Repare no encaixe: `for=\"email\"` no `<label>` aponta para `id=\"email\"` no `<input>`. Os dois valores precisam ser **iguais** para o par se formar. Sem essa conexão, quem usa leitor de tela chega num campo em branco sem saber o que digitar ali."
                    },
                    {
                        "type": "text",
                        "value": "## 3. A hierarquia dos títulos (headings)\n\nOs títulos vão de `<h1>` a `<h6>`, do mais importante ao menos importante. Eles não servem só para deixar o texto grande: montam o **índice** da página. Leitores de tela conseguem listar todos os títulos e pular de um para o outro, então uma hierarquia bem feita é como um sumário bem organizado.\n\nAs regras de uma boa hierarquia:\n\n- Use **um** `<h1>` por página, o título principal.\n- **Não pule níveis** ao descer: depois de um `<h1>` venha um `<h2>`, não um `<h3>`.\n- Escolha o nível pelo **significado** (a importância do título), nunca pelo tamanho da letra. Tamanho é trabalho do CSS."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Certo: hierarquia sem furos -->\n<h1>Livro de receitas</h1>\n  <h2>Bolos</h2>\n    <h3>Bolo de cenoura</h3>\n    <h3>Bolo de fubá</h3>\n  <h2>Tortas</h2>\n    <h3>Torta de limão</h3>\n\n<!-- Errado: pulou do h1 direto para o h3 -->\n<h1>Livro de receitas</h1>\n  <h3>Bolo de cenoura</h3>"
                    },
                    {
                        "type": "text",
                        "value": "## 4. Landmarks: os pontos de referência da página\n\nLembra das tags semânticas da aula passada? Elas têm um superpoder na acessibilidade: viram **landmarks** (marcos, pontos de referência). O leitor de tela oferece uma lista dessas regiões, e a pessoa **salta** direto para a que interessa, sem ouvir a página inteira do começo.\n\nÉ por isso que um `<nav>` vale muito mais do que uma `<div class=\"menu\">`: o `<nav>` é um marco que a pessoa reconhece; a `<div>` é invisível para a navegação."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tag semântica\",\"Landmark (região) que ela cria\"],[\"`<header>`\",\"Cabeçalho / topo (banner)\"],[\"`<nav>`\",\"Navegação\"],[\"`<main>`\",\"Conteúdo principal\"],[\"`<aside>`\",\"Conteúdo complementar\"],[\"`<footer>`\",\"Rodapé (informações do site)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## 5. Uma pitada de ARIA: o aria-label\n\nNa imensa maioria dos casos, um bom HTML semântico já resolve. Mas às vezes um elemento **não tem texto visível** que o descreva, e aí o leitor de tela fica sem saber o que anunciar. O exemplo clássico é um botão que mostra só um ícone, como um \"x\" de fechar ou uma lupa de busca.\n\nPara esses casos existe o **ARIA** (_Accessible Rich Internet Applications_), um conjunto de atributos extras de acessibilidade. O mais útil para começar é o **`aria-label`**: ele dá um **nome em texto** ao elemento, um nome que não aparece na tela, mas que o leitor de tela lê."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Botão só com um \"x\": sem texto de verdade, o aria-label dá o nome -->\n<button aria-label=\"Fechar\">×</button>\n\n<!-- Dando nome a uma navegação, para distinguir de outras -->\n<nav aria-label=\"Menu principal\">\n  <a href=\"/\">Início</a>\n  <a href=\"/blog\">Blog</a>\n</nav>"
                    },
                    {
                        "type": "text",
                        "value": "Uma ressalva importante: o ARIA é um **remendo** para quando o HTML sozinho não dá conta. A primeira escolha é sempre usar a tag certa e um texto de verdade. Os especialistas costumam dizer: \"nenhum ARIA é melhor do que um ARIA errado\". Comece pelo HTML bem feito e recorra ao `aria-label` só quando faltar texto."
                    },
                    {
                        "type": "text",
                        "value": "## 6. Foco e navegação por teclado\n\nMuita gente navega **sem mouse**, só com o teclado: aperta **Tab** para pular de um elemento interativo para o outro (links, botões, campos) e **Enter** ou **espaço** para ativar. O ponto onde o teclado \"está\" naquele momento é o **foco**, e os navegadores mostram um contorninho ao redor do elemento focado.\n\nDuas atitudes garantem quase toda a navegação por teclado de graça:\n\n- **Use os elementos nativos certos.** Um `<a>` para link, um `<button>` para botão, um `<input>` para campo. Eles já são focáveis e respondem ao teclado sozinhos.\n- **Não esconda o contorno de foco.** É comum ver gente removendo aquele contorno por achar feio, mas ele é o que permite à pessoa **enxergar onde está**. Sem ele, navegar por teclado vira um chute no escuro."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Certo: button nativo, já funciona com Tab e Enter -->\n<button onclick=\"enviar()\">Enviar</button>\n\n<!-- Errado: uma div \"fingindo\" ser botão não recebe foco\n     nem responde ao teclado -->\n<div onclick=\"enviar()\">Enviar</div>"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** acessibilidade é deixar a página utilizável por **todo mundo**, e quase tudo nasce de um HTML bem escrito. Ponha `alt` descritivo nas imagens (`alt=\"\"` nas decorativas); conecte cada `<label>` ao seu campo com `for` e `id` iguais; monte os títulos de `<h1>` a `<h6>` **sem pular níveis**; use as tags semânticas, que viram **landmarks** para saltar pela página; recorra ao `aria-label` só quando faltar texto visível; e prefira elementos nativos (`<a>`, `<button>`), mantendo o **contorno de foco** para quem navega pelo teclado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para que serve o atributo `alt` de uma imagem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Descrever a imagem em texto, para leitores de tela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Alinhar automaticamente a imagem no centro da página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar automaticamente a qualidade da imagem exibida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir a cor de fundo exibida atrás da imagem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que conecta um `<label>` ao seu `<input>`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O `for` do label com o mesmo valor do `id` do input.",
                                "isCorrect": true
                            },
                            {
                                "text": "Basta escrever o texto do rótulo perto do campo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O atributo `alt` colocado nos dois elementos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eles se conectam sozinhos se estiverem na mesma linha.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como é uma boa hierarquia de títulos (headings)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um só `<h1>` por página, descendo sem pular níveis de importância.",
                                "isCorrect": true
                            },
                            {
                                "text": "Vários `<h1>` na mesma página, escolhidos pelo tamanho de letra desejado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Começar sempre pelo `<h6>` e ir subindo aos poucos até o `<h1>`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar apenas `<h1>`, o único heading que os leitores de tela entendem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o `aria-label`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dá um nome em texto, invisível na tela, para o leitor de tela ler.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixar o texto do botão automaticamente em negrito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir por completo todo o HTML semântico da página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma dica visual que aparece só quando o mouse passa por cima.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é melhor usar um `<button>` do que uma `<div>` clicável para um botão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o `<button>` recebe foco e responde ao teclado; a `<div>`, não.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não faz diferença nenhuma: os dois são idênticos para a acessibilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "A `<div>` é melhor, pois os leitores de tela preferem `<div>` a `<button>`.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `<button>` só funciona com um `aria-label`; sem ele, vale como `<div>`.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O head e os metadados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O head e os metadados\n\nLá no começo da trilha você montou o esqueleto do HTML e conheceu o `<head>`, os **bastidores** da página, aquela parte que o visitante não vê. Naquele momento a gente só espiou por cima. Agora é hora de entrar nos bastidores e conhecer os **metadados**: as informações que você coloca no `<head>` para o navegador, o celular e o Google fazerem o trabalho deles direito.\n\nNada aqui aparece no corpo da página, mas cada linha tem um efeito bem concreto, de mostrar os acentos certos a definir o textinho que aparece no Google."
                    },
                    {
                        "type": "quote",
                        "value": "O `<head>` guarda os **metadados** da página: informações **sobre** ela que não aparecem na tela, mas que navegadores, celulares e buscadores leem. Alguns são praticamente obrigatórios (`charset`, `viewport`, `title`); outros melhoram como a página aparece por aí (`description`, favicon). É também no `<head>` que você conecta o **CSS** e, muitas vezes, o **JavaScript**."
                    },
                    {
                        "type": "text",
                        "value": "## Relembrando: o que é metadado\n\n**Metadado** é \"dado sobre o dado\". Se o conteúdo da página (os textos, as imagens) é o dado, o metadado é a informação **a respeito** desse conteúdo: em que idioma está, qual é o título, qual a descrição, como ler os caracteres.\n\nQuase todos os metadados moram em tags `<meta>` e afins, dentro do `<head>`. Vamos conhecer os principais, um por um, e no fim juntar tudo num `<head>` completo."
                    },
                    {
                        "type": "text",
                        "value": "## 1. meta charset: os acentos certos\n\nVocê já viu esta linha. Ela define a **codificação de caracteres**, ou seja, ensina o navegador a entender letras acentuadas e símbolos. O valor `UTF-8` é a tabela mais completa e conhece \"á\", \"ç\", \"ã\", \"ê\" e praticamente qualquer caractere.\n\nSem ela (ou com o valor errado), os acentos viram salada: \"informação\" pode aparecer como \"informaÃ§Ã£o\". Por isso o `charset` deve ser a **primeira** coisa dentro do `<head>`."
                    },
                    {
                        "type": "code",
                        "value": "<meta charset=\"UTF-8\">"
                    },
                    {
                        "type": "text",
                        "value": "## 2. meta viewport: a página no celular\n\nEsta é nova e importantíssima hoje em dia, com tanta gente acessando pelo celular. Sem ela, o celular finge que a tela é larga como a de um computador e mostra a página toda **encolhida**, minúscula, obrigando a pessoa a dar zoom para ler qualquer coisa.\n\nA linha do **viewport** avisa o celular: \"a largura da página é a largura real da tela do aparelho\". Assim o conteúdo se ajusta ao tamanho do dispositivo. Você vai copiar esta linha em toda página que fizer:"
                    },
                    {
                        "type": "code",
                        "value": "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                    },
                    {
                        "type": "text",
                        "value": "Decifrando o `content`: `width=device-width` diz \"use a largura real do aparelho\" e `initial-scale=1.0` diz \"comece sem zoom, no tamanho natural\". Não precisa decorar os detalhes; guarde a linha inteira como uma receita, ela é sempre igual. Sem ela, o seu site simplesmente não funciona bem no celular."
                    },
                    {
                        "type": "text",
                        "value": "## 3. title: o nome da página\n\nO `<title>` define o **nome da página**. Ele não aparece no corpo, mas surge em três lugares que muita gente vê:\n\n- na **aba** do navegador, lá em cima;\n- no nome salvo quando alguém guarda a página nos **favoritos**;\n- como o **título azul clicável** nos resultados de busca do Google.\n\nPor isso o `<title>` é peça-chave também para o SEO (assunto da próxima aula). Faça-o curto, específico e único para cada página."
                    },
                    {
                        "type": "code",
                        "value": "<title>Bolo de cenoura da vovó | Receitas da Ana</title>"
                    },
                    {
                        "type": "text",
                        "value": "## 4. meta description: a chamada no Google\n\nA **description** é um resumo curto da página, de uma ou duas frases. Ela também não aparece na sua página, mas o Google costuma exibi-la como o **textinho cinza** logo abaixo do título nos resultados de busca. É a sua chance de convencer a pessoa a clicar.\n\nUma boa description tem entre uns 120 e 160 caracteres, descreve com sinceridade o que a pessoa vai encontrar e, de preferência, é diferente em cada página."
                    },
                    {
                        "type": "code",
                        "value": "<meta name=\"description\" content=\"Aprenda a fazer o bolo de cenoura mais fofinho, com cobertura de brigadeiro, em 40 minutos. Receita simples, passo a passo.\">"
                    },
                    {
                        "type": "text",
                        "value": "## 5. favicon: o iconezinho da aba\n\nO **favicon** é aquela imagenzinha que aparece na **aba** do navegador, ao lado do título, e nos favoritos. É um detalhe pequeno que deixa o site com cara de profissional e ajuda a pessoa a achar a sua aba no meio de dez abertas.\n\nVocê conecta o favicon com uma tag `<link>`, apontando para o arquivo da imagem (geralmente um `.ico` ou um `.png`):"
                    },
                    {
                        "type": "code",
                        "value": "<link rel=\"icon\" href=\"favicon.ico\">"
                    },
                    {
                        "type": "text",
                        "value": "## 6. Onde entram o CSS e o JavaScript\n\nLembra do trio HTML, CSS e JavaScript? É no `<head>` (na maioria das vezes) que você **conecta** os outros dois ao seu HTML.\n\n- O **CSS** entra por uma tag `<link>`, parecida com a do favicon, mas apontando para o seu arquivo de estilos (normalmente um `.css`).\n- O **JavaScript** entra por uma tag `<script>`, apontando para o seu arquivo de código (um `.js`). É muito comum colocar o `<script>` com o atributo `defer`, que manda o navegador carregar o código sem travar a exibição da página."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Conecta a folha de estilos CSS -->\n<link rel=\"stylesheet\" href=\"estilo.css\">\n\n<!-- Conecta o arquivo de JavaScript (defer = não trava a página) -->\n<script src=\"script.js\" defer></script>"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Elemento\",\"Para que serve\",\"Aparece na tela?\"],[\"`<meta charset>`\",\"Codificação (acentos e símbolos)\",\"Não\"],[\"`<meta viewport>`\",\"Ajustar a página ao celular\",\"Não\"],[\"`<title>`\",\"Nome da página (aba, favoritos, Google)\",\"Na aba, não no corpo\"],[\"`<meta description>`\",\"Resumo exibido no Google\",\"Não (só no buscador)\"],[\"`<link rel=icon>`\",\"Favicon (ícone da aba)\",\"Na aba\"],[\"`<link rel=stylesheet>`\",\"Conecta o arquivo de CSS\",\"Efeito visual, via CSS\"],[\"`<script>`\",\"Conecta o arquivo de JavaScript\",\"Não (dá comportamento)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Juntando tudo num head completo\n\nAgora veja um `<head>` de verdade, com tudo o que aprendemos, na ordem que costuma ser usada. Este é um ótimo modelo para copiar no começo de qualquer projeto:"
                    },
                    {
                        "type": "code",
                        "value": "<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Bolo de cenoura da vovó | Receitas da Ana</title>\n  <meta name=\"description\" content=\"Receita simples de bolo de cenoura fofinho com cobertura de brigadeiro.\">\n  <link rel=\"icon\" href=\"favicon.ico\">\n  <link rel=\"stylesheet\" href=\"estilo.css\">\n  <script src=\"script.js\" defer></script>\n</head>"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet:** o `<head>` reúne os **metadados** da página. Os obrigatórios: `<meta charset=\"UTF-8\">` (acentos, sempre primeiro), `<meta name=\"viewport\" ...>` (ajusta ao celular) e `<title>` (nome na aba e no Google). Os que melhoram a sua presença: `<meta name=\"description\">` (resumo no buscador) e o **favicon** via `<link rel=\"icon\">`. E é aqui que você conecta o **CSS** (`<link rel=\"stylesheet\">`) e o **JavaScript** (`<script src=\"...\" defer>`). Nada disso aparece no corpo, mas tudo tem efeito concreto."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual metadado faz os acentos e caracteres especiais aparecerem corretamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`<meta charset=\"UTF-8\">`",
                                "isCorrect": true
                            },
                            {
                                "text": "`<meta name=\"viewport\">`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<meta name=\"description\">`",
                                "isCorrect": false
                            },
                            {
                                "text": "`<title>`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a tag `<title>` define?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O nome da página, exibido na aba do navegador e no Google.",
                                "isCorrect": true
                            },
                            {
                                "text": "O título principal exibido em letras grandes no corpo da página.",
                                "isCorrect": false
                            },
                            {
                                "text": "A cor de fundo aplicada a toda a página.",
                                "isCorrect": false
                            },
                            {
                                "text": "O idioma em que o conteúdo da página está escrito.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve a `<meta>` viewport?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ajustar a página ao tamanho real da tela, essencial no celular.",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir a codificação usada para acentos e caracteres especiais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever o resumo que aparece nos resultados de busca do Google.",
                                "isCorrect": false
                            },
                            {
                                "text": "Colocar o ícone (favicon) exibido na aba do navegador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Onde costuma aparecer o texto da `<meta>` description?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como o texto cinza abaixo do título, no resultado do Google.",
                                "isCorrect": true
                            },
                            {
                                "text": "Como o título grande exibido no topo do corpo da página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dentro da aba do navegador, logo ao lado do favicon.",
                                "isCorrect": false
                            },
                            {
                                "text": "No rodapé de todas as páginas do site inteiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como se conecta uma folha de estilos CSS externa dentro do `<head>`?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Com `<link rel=\"stylesheet\" href=\"estilo.css\">`.",
                                "isCorrect": true
                            },
                            {
                                "text": "Com `<script src=\"estilo.css\">`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Com `<meta name=\"css\" content=\"estilo.css\">`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Com `<style src=\"estilo.css\">`.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Boas práticas e SEO básico",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Boas práticas e SEO básico\n\nChegamos à última aula do módulo, e também ao fecho da nossa trilha de HTML. Você já sabe montar páginas, deixá-las semânticas, acessíveis e com um `<head>` caprichado. Agora vamos amarrar tudo com um conjunto de **boas práticas**: pequenos hábitos que separam um código amador de um código profissional, e que ainda ajudam a sua página a ser **encontrada** no Google.\n\nNada aqui é difícil. São mais atitudes do que técnicas, e uma vez incorporadas, viram automáticas."
                    },
                    {
                        "type": "quote",
                        "value": "**Boas práticas** em HTML são hábitos que deixam o seu código **limpo e legível** para humanos e **claro** para as máquinas. As duas coisas caminham juntas: um HTML bem indentado, válido e semântico é justamente o que os buscadores entendem melhor, e essa é a base do **SEO** (aparecer bem nos resultados de busca)."
                    },
                    {
                        "type": "text",
                        "value": "## 1. Código indentado e legível\n\nVocê já conhece a **indentação**, aquela \"escadinha\" que mostra quem está dentro de quem. Ela é a boa prática número um, porque o navegador ignora esses espaços, mas os **humanos** dependem deles para entender o código. Além da indentação, alguns outros hábitos deixam o HTML muito mais fácil de ler:\n\n- Escreva os nomes de tags e atributos em **minúsculas** (`<section>`, não `<SECTION>`).\n- Sempre ponha os valores dos atributos entre **aspas** (`class=\"cartao\"`).\n- Deixe **linhas em branco** separando os grandes blocos, para o código respirar.\n- Use **comentários** para marcar as seções importantes.\n\nCompare os dois trechos a seguir. Os dois geram a mesma página, mas um é um convite e o outro é um castigo:"
                    },
                    {
                        "type": "code",
                        "value": "<!-- Difícil de ler: sem indentação, tudo grudado -->\n<section><h2>Contato</h2><p>Fale com a gente pelo e-mail\nabaixo.</p><a href=\"mailto:ola@site.com\">ola@site.com</a></section>\n\n<!-- Fácil de ler: indentado, organizado, respirando -->\n<section>\n  <h2>Contato</h2>\n  <p>Fale com a gente pelo e-mail abaixo.</p>\n  <a href=\"mailto:ola@site.com\">ola@site.com</a>\n</section>"
                    },
                    {
                        "type": "text",
                        "value": "## 2. O validador do W3C\n\nComo o navegador tenta \"consertar\" os seus erros silenciosamente, é fácil deixar passar uma tag mal fechada ou um aninhamento torto sem perceber. Para pegar esses problemas existe uma ferramenta gratuita e oficial: o **validador do W3C** (o W3C é a organização que cuida dos padrões da web).\n\nVocê acessa o endereço **validator.w3.org**, cola o seu HTML (ou envia o arquivo) e ele lista todos os erros e avisos, com o número da linha de cada um. É como um corretor ortográfico, só que para o seu HTML."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Um HTML com problemas que o validador apontaria: -->\n\n<!-- 1. faltou fechar os <li> -->\n<ul>\n  <li>Item um\n  <li>Item dois\n</ul>\n\n<!-- 2. aninhamento cruzado -->\n<p>Texto <strong>em destaque</p></strong>\n\n<!-- 3. atributo sem aspas -->\n<img src=foto.jpg alt=Minha foto>"
                    },
                    {
                        "type": "text",
                        "value": "Rodar o validador de vez em quando é um ótimo hábito, principalmente enquanto você está aprendendo. Ele te ensina a enxergar os próprios erros e te dá a segurança de que a página está bem formada. Um HTML válido também é um HTML que os navegadores e buscadores interpretam com mais confiança."
                    },
                    {
                        "type": "text",
                        "value": "## 3. SEO on-page básico\n\n**SEO** quer dizer _Search Engine Optimization_, ou otimização para mecanismos de busca. Em português claro: é o conjunto de cuidados que ajudam a sua página a **aparecer bem** quando alguém pesquisa no Google. Uma parte grande do SEO é o chamado **on-page**, que é tudo aquilo que você controla dentro do próprio HTML.\n\nE aqui vem a melhor notícia desta trilha: você **já aprendeu** quase todo o SEO on-page básico. Ele é feito das mesmas boas práticas que a gente vem repetindo:"
                    },
                    {
                        "type": "text",
                        "value": "- **`<title>` bom**: único, específico e com as palavras que descrevem a página. É um dos sinais mais fortes para o Google e o que a pessoa vê primeiro no resultado.\n- **`<meta description>` convidativa**: não muda a posição, mas melhora a chance de a pessoa clicar.\n- **Títulos (`<h1>`...`<h6>`) bem usados**: um `<h1>` claro e uma hierarquia sem furos ajudam o buscador a entender a estrutura do conteúdo.\n- **`alt` nas imagens**: além de acessível, permite que o Google entenda (e mostre na busca de imagens) as suas fotos.\n- **HTML semântico**: `<main>`, `<article>`, `<nav>` e companhia entregam a estrutura da página de bandeja para o buscador.\n\nPercebe? SEO on-page básico e HTML bem escrito são quase a **mesma coisa**."
                    },
                    {
                        "type": "code",
                        "value": "<!-- Uma página amiga do SEO reúne o que você já aprendeu -->\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Bolo de cenoura fofinho | Receitas da Ana</title>\n  <meta name=\"description\" content=\"Receita passo a passo do bolo de cenoura mais fofinho, pronto em 40 minutos.\">\n</head>\n<body>\n  <main>\n    <article>\n      <h1>Bolo de cenoura fofinho</h1>\n      <img src=\"bolo.jpg\" alt=\"Fatia de bolo de cenoura com cobertura de brigadeiro\">\n      <h2>Ingredientes</h2>\n      <p>...</p>\n    </article>\n  </main>\n</body>"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Elemento de SEO on-page\",\"Por que ajuda a ser encontrado\"],[\"`<title>` único e claro\",\"É o texto principal do resultado e um forte sinal do tema\"],[\"`<meta description>`\",\"Melhora a taxa de cliques no resultado\"],[\"Hierarquia de `<h1>`–`<h6>`\",\"Mostra ao buscador a estrutura do conteúdo\"],[\"`alt` nas imagens\",\"Deixa as imagens compreensíveis e pesquisáveis\"],[\"HTML semântico\",\"Entrega a estrutura da página ao buscador\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## 4. Nomes de arquivo e organização de pastas\n\nConforme o seu site cresce, você acumula vários arquivos: páginas, imagens, estilos, scripts. Organizá-los bem desde o começo evita uma bagunça difícil de desfazer depois. Algumas convenções valiosas:\n\n- Nomes de arquivo em **minúsculas**, **sem espaços e sem acentos**. Use hífen para separar palavras: `sobre-nos.html`, e não `Sobre Nós.html`. Isso evita links quebrados e dores de cabeça nos servidores.\n- A página inicial se chama **`index.html`** por convenção: é o arquivo que o servidor abre por padrão.\n- Separe os tipos de arquivo em **pastas**: uma para o CSS, uma para o JavaScript, uma para as imagens. Os nomes mais comuns são `css/`, `js/` e `img/` (ou `imagens/`)."
                    },
                    {
                        "type": "code",
                        "value": "meu-site/\n├── index.html\n├── sobre-nos.html\n├── css/\n│   └── estilo.css\n├── js/\n│   └── script.js\n└── img/\n    └── logo.png"
                    },
                    {
                        "type": "text",
                        "value": "Com as pastas organizadas, você aponta um arquivo para o outro usando o **caminho** até ele. A partir do `index.html`, entrar numa pasta é só escrever o nome dela seguido de uma barra. Veja como o `<head>` conecta o CSS e a imagem guardados nas subpastas:"
                    },
                    {
                        "type": "code",
                        "value": "<!-- A partir do index.html, o caminho passa pela pasta -->\n<link rel=\"stylesheet\" href=\"css/estilo.css\">\n<img src=\"img/logo.png\" alt=\"Logo do meu site\">\n\n<!-- Um link para outra página na mesma pasta é só o nome do arquivo -->\n<a href=\"sobre-nos.html\">Sobre nós</a>"
                    },
                    {
                        "type": "text",
                        "value": "## Parabéns: você chegou ao fim da trilha!\n\nFaça uma pausa para reconhecer o quanto você caminhou. Você começou sem saber o que era uma tag e agora sabe estruturar uma página inteira, com conteúdo bem marcado, semântica, acessibilidade, um `<head>` completo e boas práticas de código e de SEO. Isso é uma base sólida de verdade.\n\nO próximo passo natural é dar **vida visual** a tudo isso com o **CSS** (cores, espaçamentos, layout) e depois adicionar interação com o **JavaScript**. Mas o esqueleto, a parte que sustenta tudo, você já domina. Continue praticando: crie páginas sobre coisas de que você gosta, quebre, conserte, valide. É assim que o aprendizado vira habilidade. Foi um prazer construir essa base com você!"
                    },
                    {
                        "type": "quote",
                        "value": "**Cheat sheet final:** boas práticas deixam o código legível e a página encontrável. **Indente** o HTML, use **minúsculas** e **aspas** nos atributos, e valide o resultado no **validator.w3.org**. O **SEO on-page** básico é quase um resumo da trilha: bom `<title>`, `<meta description>` convidativa, hierarquia de títulos, `alt` nas imagens e HTML **semântico**. Organize os arquivos com nomes em **minúsculas, sem espaços nem acentos** (use hífen), a página inicial como **`index.html`**, e separe **CSS**, **JS** e **imagens** em pastas. Base construída: agora é partir para o CSS!"
                    }
                ],
                "questions": [
                    {
                        "statement": "Para que serve a indentação (a 'escadinha') no HTML?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Deixar o código legível, mostrando o encaixe dos elementos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fazer a página carregar visivelmente mais rápido no navegador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mudar automaticamente as cores e as fontes da página.",
                                "isCorrect": false
                            },
                            {
                                "text": "É obrigatória: sem ela, a página simplesmente não funciona.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é o validador do W3C?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma ferramenta gratuita que aponta erros no HTML.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um editor de código que só serve para colorir o HTML.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um navegador especial, feito só para testar páginas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um servidor usado para publicar o site na internet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que significa SEO?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Otimização para mecanismos de busca, feita para o Google.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um programa que hospeda e guarda o site na internet inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma linguagem de programação usada para construir sites.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um formato de imagem otimizado especialmente para a web.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é uma boa prática para nomear arquivos de um site?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Minúsculas, sem espaços nem acentos, com hífen entre as palavras.",
                                "isCorrect": true
                            },
                            {
                                "text": "Com letras maiúsculas e espaços, para ficar mais bonito (ex.: `Sobre Nós.html`).",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre terminar os arquivos em `.txt`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar acentos e símbolos para deixar cada nome bem único.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer melhorar o SEO on-page da sua página. Qual conjunto de ações realmente ajuda?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "`<title>` claro, description boa, títulos em ordem, alt nas imagens e semântica.",
                                "isCorrect": true
                            },
                            {
                                "text": "Encher a página de `<div>` e repetir a mesma palavra escondida várias vezes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o `<title>` e a description, para a página carregar mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar todas as tags semânticas da página por `<div>` genéricas.",
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
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO })
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
