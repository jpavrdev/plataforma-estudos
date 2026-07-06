// Trilha de CSS para iniciantes, blocos com quiz de 5 questões por aula.
// questões por aula. Idempotente pelo marcador "Módulo 1 - Introdução ao CSS", que só
// existe nesta estrutura nova. É destrutivo: apaga módulos/aulas/questões antigos
// da trilha antes de recriar (o progresso da trilha AWS é reiniciado).
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-css.ts
import { db } from "../db.ts";
import {
    trails,
    modules,
    lessons,
    questions,
    questionOptions,
    questionAnswers,
    lessonProgress,
} from "../schema.ts";
import { eq, and, inArray } from "drizzle-orm";

const NOME = "CSS";
const MARCADOR = "Módulo 1 - Introdução ao CSS";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const DADOS: Modulo[] = [
    {
        titulo: "Módulo 1 - Introdução ao CSS",
        aulas: [
            {
                titulo: "O que é CSS e como funciona",
                blocks: [
                    {
                        type: "text",
                        value: "# O que é CSS e como funciona\n\nSeja bem-vindo ao seu primeiro contato com o **CSS**! Se você já deu os primeiros passos no HTML, chegou a hora de deixar suas páginas bonitas. E se ainda acha que isso tudo é um bicho de sete cabeças, pode relaxar: aqui a gente começa do zero, com calma e com muito exemplo.\n\nAté agora, com HTML, você aprendeu a **estruturar** o conteúdo: dizer o que é título, o que é parágrafo, o que é imagem. Só que uma página feita apenas de HTML tem uma cara meio sem graça, tudo preto no branco, empilhado de cima para baixo. É aí que entra o CSS: ele é a ferramenta que transforma aquela estrutura crua em algo colorido, organizado e agradável de olhar.",
                    },
                    {
                        type: "quote",
                        value: "**CSS** quer dizer _Cascading Style Sheets_, ou Folhas de Estilo em Cascata. A palavra que importa aqui é **estilo**: o CSS não cria conteúdo nem estrutura, ele apenas descreve **como** o conteúdo que já existe no HTML deve **aparecer** — a cor, o tamanho, o espaçamento, a posição. Enquanto o HTML diz _o que é_ cada coisa, o CSS diz _como cada coisa se parece_.",
                    },
                    {
                        type: "text",
                        value: "## HTML é a estrutura, CSS é a decoração\n\nA melhor forma de entender a dupla HTML + CSS é pensar numa **casa**.\n\nQuando se constrói uma casa, primeiro se levanta a **estrutura**: as paredes, o teto, as portas, as janelas, os cômodos. Isso é o **HTML**. É o que sustenta tudo e define o que existe: aqui é uma parede, ali é uma janela, este cômodo é a cozinha.\n\nSó que uma casa recém-construída, no osso, é cinza e sem graça. Aí entra o **decorador**: ele pinta as paredes, escolhe o piso, pendura os quadros, posiciona os móveis, ajusta a iluminação. Ele não derruba nem levanta nenhuma parede, apenas cuida da **aparência**. Esse é o papel do **CSS**.\n\nRepare no ponto mais importante dessa analogia: o decorador trabalha **sobre** uma estrutura que já existe. Sem parede, não há o que pintar. Por isso o HTML vem primeiro, e o CSS entra depois para embelezar o que já está lá.",
                    },
                    {
                        type: "text",
                        value: "## Uma página sem CSS e com CSS\n\nVamos ver isso na prática. Imagine um pedacinho de HTML bem simples, com um título e um parágrafo:",
                    },
                    {
                        type: "code",
                        value: "<h1>Bolo de cenoura</h1>\n<p>A melhor receita da vovó, pronta em 40 minutos.</p>",
                    },
                    {
                        type: "text",
                        value: "Aberto no navegador **sem nenhum CSS**, esse código aparece do jeito padrão: letras pretas, fundo branco, a fonte que o navegador escolher, tudo encostado no canto esquerdo. Funciona, mas é sem graça.\n\nAgora veja o que acontece quando adicionamos um pouco de **CSS** para colorir e organizar:",
                    },
                    {
                        type: "code",
                        value: "<style>\n  h1 {\n    color: darkorange;\n    text-align: center;\n  }\n  p {\n    color: gray;\n    font-family: sans-serif;\n  }\n</style>\n\n<h1>Bolo de cenoura</h1>\n<p>A melhor receita da vovó, pronta em 40 minutos.</p>",
                    },
                    {
                        type: "text",
                        value: "O **HTML continua exatamente o mesmo** — o título ainda é um `<h1>` e o texto ainda é um `<p>`. O que mudou foi o CSS que colocamos ali dentro: agora o título fica **laranja** e **centralizado**, e o parágrafo fica **cinza** com uma fonte sem serifa. Não mexemos no conteúdo, só na aparência. Essa é a mágica do CSS. Não se preocupe com os detalhes desse código ainda, a gente vai destrinchar tudo já já.",
                    },
                    {
                        type: "text",
                        value: '## A anatomia de uma regra CSS\n\nTodo o CSS do mundo é feito de **regras**. Uma regra é um pedacinho que diz: "para tal elemento, aplique tal aparência". E toda regra segue **sempre** o mesmo formato:',
                    },
                    {
                        type: "code",
                        value: "seletor {\n  propriedade: valor;\n}",
                    },
                    {
                        type: "text",
                        value: "À primeira vista parece estranho, mas são só três ideias. Vamos usar um exemplo de verdade para dissecar:",
                    },
                    {
                        type: "code",
                        value: "h1 {\n  color: blue;\n}",
                    },
                    {
                        type: "text",
                        value: 'Esse pedacinho lê-se assim: "todo `<h1>` deve ter a cor azul". Ele tem estas partes:\n\n- **Seletor** (`h1`): escolhe **quem** vai receber o estilo. Aqui, todos os elementos `<h1>` da página.\n- **Chaves** (`{ }`): abrem e fecham o **bloco de declarações**. Tudo o que estiver entre elas se aplica ao seletor.\n- **Propriedade** (`color`): diz **o que** você quer mudar. Neste caso, a cor do texto.\n- **Valor** (`blue`): diz **como** você quer aquilo. Neste caso, azul.\n- **Dois-pontos** (`:`): separa a propriedade do valor.\n- **Ponto e vírgula** (`;`): marca o **fim** da declaração.\n\nO par `propriedade: valor;` (por exemplo, `color: blue;`) tem um nome: é uma **declaração**. Uma regra pode ter uma ou várias declarações, uma embaixo da outra.',
                    },
                    {
                        type: "text",
                        value: "## Várias declarações na mesma regra\n\nNa maioria das vezes você quer mudar mais de uma coisa no mesmo elemento. É só colocar **uma declaração por linha**, cada uma terminando com ponto e vírgula:",
                    },
                    {
                        type: "code",
                        value: "p {\n  color: gray;\n  font-size: 18px;\n  text-align: center;\n}",
                    },
                    {
                        type: "text",
                        value: "Aqui, todo parágrafo `<p>` da página fica **cinza**, com letra de tamanho **18 pixels** e **centralizado**. Três declarações, três mudanças, todas dentro do mesmo bloco de chaves.\n\nUm conselho que vale ouro para quem começa: **não esqueça o ponto e vírgula** no fim de cada declaração. É ele que separa uma da outra. Esquecer o `;` é um dos errinhos mais comuns e faz a regra parar de funcionar dali em diante.",
                    },
                    {
                        type: "text",
                        value: "## Comentários no CSS\n\nAssim como no HTML você deixa recados com `<!-- -->`, no CSS também dá para escrever **comentários**: trechos que o navegador **ignora** por completo e que não mudam em nada a aparência da página.\n\nNo CSS, o comentário fica entre `/*` e `*/`. Tudo o que estiver entre esses dois sinais é um recado só para quem lê o código:",
                    },
                    {
                        type: "code",
                        value: "/* Cor principal da marca */\nh1 {\n  color: darkorange;\n}\n\n/* A regra abaixo está desativada por enquanto:\np {\n  color: red;\n}\n*/",
                    },
                    {
                        type: "text",
                        value: "No exemplo, o primeiro comentário **explica** para que serve a regra seguinte. Já o segundo **desativa** uma regra inteira: como o bloco do `p` está dentro de `/* */`, o navegador o ignora, e o parágrafo não fica vermelho. Comentários são ótimos para anotar, organizar o arquivo em seções e testar coisas sem apagar o código.\n\nAtenção a um detalhe: no CSS **não existe** o comentário de uma linha com `//` (isso é de outras linguagens). No CSS é sempre `/* */`, mesmo para um recado curtinho.",
                    },
                    {
                        type: "text",
                        value: "## O que dá pra mudar com CSS\n\nVocê deve estar se perguntando: afinal, o que exatamente eu consigo controlar com CSS? Praticamente **toda a aparência** da página. Dá para agrupar as possibilidades em quatro grandes famílias:\n\n- **Cor**: a cor do texto (`color`), a cor de fundo (`background-color`), a cor das bordas.\n- **Tamanho**: o tamanho da letra (`font-size`), a largura (`width`) e a altura (`height`) dos elementos.\n- **Espaço**: o espaço por dentro (`padding`) e por fora (`margin`) de cada elemento, afastando ou aproximando as coisas.\n- **Posição**: onde cada elemento fica e como o conteúdo se alinha (`text-align`), à esquerda, ao centro ou à direita.\n\nNão precisa decorar nenhuma dessas propriedades agora. Elas vão aparecer aos poucos ao longo da trilha. A ideia aqui é só você ter uma noção do **tamanho do universo** que o CSS abre para você.",
                    },
                    {
                        type: "table",
                        value: '[["O que você quer mudar","Uma propriedade de exemplo","O que ela faz"],["A cor do texto","`color`","Pinta as letras de uma cor"],["A cor de fundo","`background-color`","Pinta o fundo do elemento"],["O tamanho da letra","`font-size`","Deixa o texto maior ou menor"],["O espaço interno","`padding`","Afasta o conteúdo da borda do elemento"],["O alinhamento do texto","`text-align`","Alinha à esquerda, ao centro ou à direita"]]',
                    },
                    {
                        type: "text",
                        value: "## Juntando tudo num exemplo\n\nPara fechar, veja uma folha de estilo curtinha que usa várias dessas ideias de uma vez. Ela dá cor, tamanho e espaço a um título e a um parágrafo:",
                    },
                    {
                        type: "code",
                        value: "<style>\n  /* Título grande, azul e centralizado */\n  h1 {\n    color: navy;\n    font-size: 32px;\n    text-align: center;\n  }\n\n  /* Parágrafo cinza com um respiro por dentro */\n  p {\n    color: dimgray;\n    padding: 10px;\n  }\n</style>\n\n<h1>Minha primeira página com estilo</h1>\n<p>Agora o CSS deixou tudo com a nossa cara.</p>",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** o **CSS** (_Cascading Style Sheets_) cuida da **aparência** da página, enquanto o HTML cuida da estrutura — a estrutura da casa é o HTML, a decoração é o CSS. Todo CSS é feito de **regras** no formato `seletor { propriedade: valor; }`: o **seletor** escolhe o elemento, a **propriedade** diz o que mudar e o **valor** diz como. Cada declaração termina em `;`, e **comentários** vão entre `/* */`. Com CSS você controla **cor, tamanho, espaço e posição** de tudo na tela.",
                    },
                ],
                questions: [
                    {
                        statement: "De que parte de uma página web o CSS cuida?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Da aparência: cores, tamanhos, espaçamentos e posição dos elementos.",
                                isCorrect: true,
                            },
                            {
                                text: "Da estrutura e do conteúdo, definindo o que é título e o que é parágrafo.",
                                isCorrect: false,
                            },
                            {
                                text: "Do comportamento, fazendo a página reagir a cliques.",
                                isCorrect: false,
                            },
                            {
                                text: "De guardar os arquivos do site em um servidor.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o formato correto de uma regra de CSS?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`seletor { propriedade: valor; }`",
                                isCorrect: true,
                            },
                            {
                                text: "`propriedade { seletor: valor; }`",
                                isCorrect: false,
                            },
                            {
                                text: "`<seletor>propriedade: valor</seletor>`",
                                isCorrect: false,
                            },
                            {
                                text: "`valor: propriedade (seletor);`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Como se escreve um comentário em CSS?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`/* assim */`",
                                isCorrect: true,
                            },
                            {
                                text: "`<!-- assim -->`",
                                isCorrect: false,
                            },
                            {
                                text: "`// assim`",
                                isCorrect: false,
                            },
                            {
                                text: "`# assim`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Na regra `p { color: gray; }`, o que é o `color`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A propriedade, ou seja, o que está sendo alterado (a cor do texto).",
                                isCorrect: true,
                            },
                            {
                                text: "O seletor, que escolhe quais elementos recebem o estilo.",
                                isCorrect: false,
                            },
                            {
                                text: "O valor, que define qual cor será usada.",
                                isCorrect: false,
                            },
                            {
                                text: "Um comentário, que o navegador ignora.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na analogia da casa, o HTML é a estrutura (paredes, portas) e o CSS é a decoração (pintura, móveis). O que essa comparação explica sobre a relação entre os dois?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O CSS atua sobre uma estrutura que já precisa existir; sem o HTML definindo os elementos, não há o que estilizar. Por isso o HTML vem primeiro.",
                                isCorrect: true,
                            },
                            {
                                text: "Que o CSS substitui o HTML: depois de decorar, as paredes deixam de ser necessárias.",
                                isCorrect: false,
                            },
                            {
                                text: "Que HTML e CSS fazem exatamente a mesma coisa, então tanto faz qual usar.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o CSS levanta as paredes e o HTML apenas as pinta.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Como aplicar CSS",
                blocks: [
                    {
                        type: "text",
                        value: "# Como aplicar CSS\n\nNa aula anterior você entendeu o que é o CSS e como uma regra funciona. Mas ficou uma pergunta no ar: **onde** a gente escreve esse CSS para que ele grude no HTML?\n\nExistem **três formas** de aplicar CSS a uma página, e nesta aula vamos conhecer as três, uma de cada vez. Já adianto: elas não são igualmente boas. Uma delas é o jeito profissional, e as outras duas têm o seu lugar, mas com ressalvas. No fim você vai saber qual usar e por quê.",
                    },
                    {
                        type: "quote",
                        value: "Há **três formas** de aplicar CSS: **inline** (no atributo `style` de um elemento), **interno** (dentro de uma tag `<style>` no `<head>`) e **externo** (num arquivo `.css` separado, ligado à página com `<link>`). As três funcionam, mas o **externo** é o recomendado, porque separa o conteúdo (HTML) do estilo (CSS).",
                    },
                    {
                        type: "text",
                        value: '## Forma 1: CSS inline (o atributo style)\n\nA primeira forma é escrever o estilo **diretamente no elemento**, usando um atributo chamado `style`. É o chamado CSS **inline** ("na mesma linha").\n\nAqui você não escreve o seletor nem as chaves, só as declarações, porque o estilo já está colado no elemento que vai recebê-lo:',
                    },
                    {
                        type: "code",
                        value: '<h1 style="color: blue; text-align: center;">Bem-vindo</h1>\n\n<p style="color: gray;">Este parágrafo está cinza.</p>',
                    },
                    {
                        type: "text",
                        value: 'Repare que, dentro das aspas do `style`, vão apenas as declarações (`color: blue; text-align: center;`), separadas por ponto e vírgula. O estilo se aplica **só àquele elemento**, e a nenhum outro.\n\nParece prático, e para um teste rápido até é. Mas o inline tem problemas sérios:\n\n- **Não dá para reaproveitar**: se você quiser dez parágrafos cinza, terá que repetir `style="color: gray;"` dez vezes.\n- **Vira uma bagunça**: o HTML fica poluído, com estrutura e estilo misturados na mesma linha.\n- **É difícil de manter**: para trocar a cor de tudo, você teria que caçar e alterar cada elemento na mão.\n\nPor isso o inline é usado com muita parcimônia, guardado para exceções bem pontuais.',
                    },
                    {
                        type: "text",
                        value: '## Forma 2: CSS interno (a tag <style>)\n\nA segunda forma é reunir todo o CSS num único lugar da página: dentro de uma tag `<style>`, colocada no `<head>` do documento. É o CSS **interno** (ou "embutido").\n\nAgora sim voltamos a escrever regras completas, com seletor e chaves, como você aprendeu na aula passada:',
                    },
                    {
                        type: "code",
                        value: '<!DOCTYPE html>\n<html lang="pt-br">\n  <head>\n    <meta charset="UTF-8">\n    <title>Minha página</title>\n    <style>\n      h1 {\n        color: blue;\n        text-align: center;\n      }\n      p {\n        color: gray;\n      }\n    </style>\n  </head>\n  <body>\n    <h1>Bem-vindo</h1>\n    <p>Este parágrafo está cinza.</p>\n    <p>E este também, sem repetir estilo nenhum!</p>\n  </body>\n</html>',
                    },
                    {
                        type: "text",
                        value: "Bem melhor, não? Aqui uma única regra `p { color: gray; }` pinta **todos** os parágrafos de cinza de uma vez — os dois do exemplo e quantos mais você adicionar. O estilo ficou concentrado num só lugar, o `<head>`, separado do conteúdo que está no `<body>`.\n\nO CSS interno resolve o reúso **dentro de uma página**. O porém aparece quando o site tem **várias páginas**: como cada `<style>` vive dentro de um arquivo HTML, você teria que copiar o mesmo bloco de estilos para cada página. E se um dia quisesse mudar a cor do site inteiro, teria que editar página por página. É aí que entra a terceira forma.",
                    },
                    {
                        type: "text",
                        value: "## Forma 3: CSS externo (o arquivo .css)\n\nA terceira forma é a que os profissionais usam no dia a dia: colocar todo o CSS num **arquivo separado**, com a extensão `.css`, e depois **ligar** esse arquivo à página.\n\nSão dois passos. Primeiro, você cria um arquivo só de estilo, por exemplo `estilos.css`, contendo apenas as regras (sem nenhuma tag HTML, sem `<style>`):",
                    },
                    {
                        type: "code",
                        value: "/* estilos.css */\nh1 {\n  color: blue;\n  text-align: center;\n}\n\np {\n  color: gray;\n}",
                    },
                    {
                        type: "text",
                        value: "Repare que dentro do arquivo `.css` **não existe HTML nenhum**: nada de `<style>`, nada de `<body>`, só as regras puras. O arquivo é 100% CSS.\n\nO segundo passo é **avisar** a página de que ela deve usar esse arquivo. Isso é feito com a tag `<link>`, colocada no `<head>`:",
                    },
                    {
                        type: "code",
                        value: '<!DOCTYPE html>\n<html lang="pt-br">\n  <head>\n    <meta charset="UTF-8">\n    <title>Minha página</title>\n    <link rel="stylesheet" href="estilos.css">\n  </head>\n  <body>\n    <h1>Bem-vindo</h1>\n    <p>Este parágrafo está cinza.</p>\n  </body>\n</html>',
                    },
                    {
                        type: "text",
                        value: 'A tag `<link>` é um elemento vazio (não tem fechamento) e traz dois atributos importantes:\n\n- `rel="stylesheet"`: diz **que tipo** de ligação é essa. `stylesheet` significa "folha de estilos", ou seja, estou ligando um arquivo de CSS.\n- `href="estilos.css"`: diz **onde** está o arquivo, o caminho até ele. Aqui, um `estilos.css` que fica na mesma pasta do HTML.\n\nCom essa única linha, a página passa a usar **todas** as regras do arquivo externo, exatamente como se estivessem ali dentro.',
                    },
                    {
                        type: "text",
                        value: "## Por que o externo é o jeito certo\n\nO grande trunfo do CSS externo é que **um mesmo arquivo `.css` pode ser ligado a quantas páginas você quiser**. Imagine um site com 50 páginas: todas apontando para o mesmo `estilos.css`. Isso traz vantagens enormes:\n\n- **Reúso**: você escreve o estilo uma vez e usa em todas as páginas.\n- **Manutenção fácil**: para mudar a cara do site inteiro, edita **um só arquivo**, e a mudança aparece em todas as páginas de uma vez.\n- **HTML limpo**: o conteúdo (HTML) fica de um lado e o estilo (CSS) do outro; cada arquivo cuida de uma coisa.\n- **Página mais rápida**: o navegador baixa o `.css` uma vez e reaproveita nas páginas seguintes.",
                    },
                    {
                        type: "text",
                        value: "Uma analogia ajuda: o arquivo externo é como o **guarda-roupa** de uma casa. Em vez de cada pessoa esconder uma cópia da mesma roupa no próprio quarto (inline), ou cada quarto ter um armário repetido (interno), existe **um guarda-roupa central** que todos usam. Trocou a roupa lá, todo mundo aparece diferente.",
                    },
                    {
                        type: "table",
                        value: '[["Forma","Onde o CSS fica","Serve melhor para...","Recomendado?"],["Inline","No atributo `style` do elemento","Um ajuste pontual e único","Não, evite"],["Interno","Numa tag `<style>` no `<head>`","Uma página só ou testes rápidos","Com ressalvas"],["Externo","Num arquivo `.css` ligado por `<link>`","O site inteiro, projetos de verdade","Sim, é o ideal"]]',
                    },
                    {
                        type: "text",
                        value: "## Separar conteúdo de estilo\n\nPor trás da preferência pelo CSS externo existe um princípio importante da web: **separar o conteúdo da apresentação**.\n\nA ideia é que o **HTML** cuide só do conteúdo e da estrutura (o que é título, o que é parágrafo) e o **CSS** cuide só da aparência (que cor, que tamanho). Cada um no seu arquivo, cada um com a sua responsabilidade.\n\nIsso deixa tudo mais organizado: dá para mexer nas cores no arquivo `.css` sem tocar no conteúdo, e reescrever um texto no HTML sem medo de bagunçar o visual. Quando conteúdo e estilo ficam embolados na mesma linha (como no inline), perde-se justamente essa clareza. É por isso que, deste ponto em diante, quase todo o CSS que você escrever vai morar num arquivo externo.",
                    },
                    {
                        type: "quote",
                        value: '**Cheat sheet:** há três formas de aplicar CSS. **Inline** usa o atributo `style` no elemento e serve só para exceções. **Interno** usa `<style>` no `<head>` e vale para uma página. **Externo** guarda tudo num arquivo `.css` ligado pela tag `<link rel="stylesheet" href="...">` no `<head>`, e é o **jeito recomendado**: um mesmo arquivo estiliza o site inteiro, facilita a manutenção e **separa o conteúdo (HTML) do estilo (CSS)**.',
                    },
                ],
                questions: [
                    {
                        statement: "Quais são as três formas de aplicar CSS a uma página?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Inline (no atributo `style`), interno (na tag `<style>`) e externo (num arquivo `.css`).",
                                isCorrect: true,
                            },
                            {
                                text: "Somente inline e interno; não existe CSS em arquivo separado.",
                                isCorrect: false,
                            },
                            {
                                text: "Por tag, por classe e por id.",
                                isCorrect: false,
                            },
                            {
                                text: "Nome, hexadecimal e `rgb()`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual atributo aplica CSS diretamente em um único elemento (o CSS inline)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`style`",
                                isCorrect: true,
                            },
                            {
                                text: "`class`",
                                isCorrect: false,
                            },
                            {
                                text: "`css`",
                                isCorrect: false,
                            },
                            {
                                text: "`link`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual linha liga corretamente um arquivo CSS externo a uma página HTML?",
                        difficulty: "medio",
                        options: [
                            {
                                text: '`<link rel="stylesheet" href="estilos.css">`',
                                isCorrect: true,
                            },
                            {
                                text: '`<style src="estilos.css">`',
                                isCorrect: false,
                            },
                            {
                                text: '`<css href="estilos.css">`',
                                isCorrect: false,
                            },
                            {
                                text: '`<script src="estilos.css">`',
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que o CSS externo facilita a manutenção de um site com muitas páginas?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque um único arquivo `.css` estiliza todas as páginas; ao editar esse arquivo, a mudança aparece em todas de uma vez.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque cada página passa a ter o seu próprio estilo, sem depender das outras.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o CSS externo é o único que o navegador consegue exibir.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque ele coloca as declarações dentro de cada elemento, uma a uma.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você mantém um site de 50 páginas e precisa trocar a cor de todos os títulos. Qual abordagem faz isso com o menor esforço?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Ter o CSS em um arquivo externo ligado por `<link>` em todas as páginas e mudar a cor nesse único arquivo.",
                                isCorrect: true,
                            },
                            {
                                text: "Usar CSS inline e alterar o atributo `style` de cada título, um por um, nas 50 páginas.",
                                isCorrect: false,
                            },
                            {
                                text: "Usar CSS interno e editar a tag `<style>` de cada uma das 50 páginas.",
                                isCorrect: false,
                            },
                            {
                                text: "Não é possível; é preciso reescrever as 50 páginas do zero.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Seletores básicos",
                blocks: [
                    {
                        type: "text",
                        value: "# Seletores básicos\n\nVocê já sabe que uma regra CSS tem o formato `seletor { propriedade: valor; }`. Até agora a gente focou na parte da direita, as propriedades e os valores. Nesta aula o holofote vai para a parte da esquerda: o **seletor**.\n\nO seletor é a peça que decide **quem** vai receber o estilo. Escolher bem o seletor é metade do trabalho no CSS. A boa notícia é que os seletores básicos são pouquinhos e fáceis de pegar. Vamos conhecer os principais, um por um.",
                    },
                    {
                        type: "quote",
                        value: "O **seletor** é a parte da regra que escolhe **quais elementos** receberão o estilo. Os três seletores básicos são: por **tipo** (o nome da tag, como `p`), por **classe** (um nome escolhido por você, precedido de `.`, como `.destaque`) e por **id** (um identificador único, precedido de `#`, como `#topo`). Há ainda o **universal** (`*`), que atinge todos.",
                    },
                    {
                        type: "text",
                        value: "## Seletor de tipo (por tag)\n\nO seletor mais simples é o de **tipo**, também chamado de seletor de elemento ou de tag. Você já o viu na aula 1. Basta escrever o **nome da tag**, e a regra atinge **todos** os elementos daquele tipo na página.\n\nNo exemplo abaixo, toda `<p>` fica azul, não importa quantas existam:",
                    },
                    {
                        type: "code",
                        value: "<style>\n  p {\n    color: blue;\n  }\n</style>\n\n<p>Este parágrafo fica azul.</p>\n<p>Este também fica azul.</p>\n<p>E este aqui, azul igualmente.</p>",
                    },
                    {
                        type: "text",
                        value: "Simples assim: uma regrinha e todos os parágrafos mudam de cor. (Nos exemplos a seguir vamos juntar o CSS num `<style>` só para você poder testar tudo num arquivo único; num projeto de verdade, esse CSS moraria num `.css` externo, como você viu na aula passada.)\n\nO seletor de tipo é ótimo quando você quer um estilo **geral** para todos os elementos de uma espécie. Mas ele tem um limite: e se você quiser deixar azul **apenas um** parágrafo específico, e não todos? Para isso ele não serve. Precisamos de algo mais preciso, e é aí que entram as **classes**.",
                    },
                    {
                        type: "text",
                        value: '## Seletor de classe (com ponto)\n\nA **classe** é o seletor mais usado no dia a dia, porque é o mais flexível. A ideia tem duas partes que trabalham juntas:\n\n1. No **HTML**, você marca os elementos que quer estilizar com o atributo `class`, dando a eles um nome à sua escolha.\n2. No **CSS**, você escreve esse mesmo nome precedido de um **ponto** (`.`) e define o estilo.\n\nO ponto é o sinal que diz ao CSS: "isto aqui é o nome de uma classe". Veja:',
                    },
                    {
                        type: "code",
                        value: '<style>\n  .destaque {\n    color: red;\n    font-weight: bold;\n  }\n</style>\n\n<p class="destaque">Este parágrafo é importante!</p>\n<p>Este é um parágrafo comum.</p>\n<p class="destaque">Este também merece destaque.</p>',
                    },
                    {
                        type: "text",
                        value: 'No CSS, `.destaque` significa "todos os elementos que tiverem `class="destaque"`". Repare no resultado: o primeiro e o terceiro parágrafos, que levam a classe, ficam vermelhos e em negrito; o do meio, sem classe, continua normal.\n\nAs classes são poderosas por três motivos:\n\n- **Você escolhe quais elementos** recebem o estilo, marcando só eles com a classe.\n- **A mesma classe serve para vários elementos**, mesmo que sejam tags diferentes (um `<p>` e um `<h2>` podem compartilhar a classe `.destaque`).\n- **Um elemento pode ter várias classes** ao mesmo tempo, separadas por espaço no atributo, assim: `class="destaque caixa"`.\n\nUm bom nome de classe descreve o **papel** do elemento (`.destaque`, `.aviso`, `.botao`), e não o efeito exato. Isso ajuda a manter o CSS organizado.',
                    },
                    {
                        type: "code",
                        value: '<style>\n  .aviso {\n    color: darkred;\n  }\n  .caixa {\n    padding: 12px;\n  }\n</style>\n\n<!-- A mesma classe .aviso em tags diferentes -->\n<h2 class="aviso">Atenção</h2>\n<p class="aviso">Leia com cuidado.</p>\n\n<!-- Um elemento com duas classes ao mesmo tempo -->\n<p class="aviso caixa">Aviso dentro de uma caixa.</p>',
                    },
                    {
                        type: "text",
                        value: '## Seletor de id (com cerquilha)\n\nO **id** é parecido com a classe, mas com uma diferença fundamental: ele identifica **um único** elemento na página. "Id" vem de _identifier_ (identificador), e a regra é que **cada id deve ser único** — nenhum outro elemento na mesma página pode repetir aquele id.\n\nO funcionamento é análogo ao da classe, trocando duas coisas: no HTML usamos o atributo `id` (em vez de `class`), e no CSS usamos uma **cerquilha** `#` (em vez do ponto):',
                    },
                    {
                        type: "code",
                        value: '<style>\n  #cabecalho {\n    background-color: navy;\n    color: white;\n  }\n</style>\n\n<header id="cabecalho">\n  <h1>Meu site</h1>\n</header>',
                    },
                    {
                        type: "text",
                        value: 'Aqui, a regra `#cabecalho` se aplica ao único elemento que tem `id="cabecalho"`. Como o id é único, ele costuma marcar partes **singulares** da página, aquelas que só existem uma vez: o cabeçalho principal, o rodapé, um menu específico.\n\nSe você repetir o mesmo id em dois elementos, o navegador até aplica o estilo, mas isso é considerado **errado** e pode causar dor de cabeça mais adiante (principalmente quando você começar a usar JavaScript, que conta com ids únicos para achar elementos). Regra de bolso: **id não se repete**.',
                    },
                    {
                        type: "text",
                        value: "## Classe ou id: qual usar?\n\nEssa é uma dúvida clássica de quem começa. Os dois estilizam, então qual escolher? A diferença está na **quantidade**:\n\n- Use **classe** quando o estilo pode se repetir, valer para **vários** elementos. É o caso mais comum, de longe.\n- Use **id** quando se refere a **um** elemento único e específico da página.\n\nNa prática, a recomendação da maioria dos desenvolvedores é: **na dúvida, use classe**. Classes são mais flexíveis e reaproveitáveis, e você raramente se arrepende de ter usado uma. O id fica reservado para quando a unicidade realmente importa.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Classe","Id"],["Símbolo no CSS","Ponto: `.destaque`","Cerquilha: `#topo`"],["Atributo no HTML","`class=\\"...\\"`","`id=\\"...\\"`"],["Quantos podem existir?","Vários; a classe se repete","Um só; o id é único na página"],["Quando usar","Estilo que se repete (o caso comum)","Um elemento único e específico"]]',
                    },
                    {
                        type: "text",
                        value: '## Seletor universal\n\nExiste um seletor curinga que atinge **absolutamente todos** os elementos da página de uma vez: o **universal**, representado por um asterisco `*`.\n\nEle é usado com moderação, geralmente para um ajuste bem geral. Um uso clássico é "zerar" espaçamentos que o navegador aplica por padrão, para começar o estilo de um ponto neutro:',
                    },
                    {
                        type: "code",
                        value: "<style>\n  /* Aplica a TODOS os elementos da página */\n  * {\n    margin: 0;\n    padding: 0;\n  }\n</style>",
                    },
                    {
                        type: "text",
                        value: "## Agrupar seletores com vírgula\n\nÀs vezes você quer aplicar **o mesmo estilo** a vários seletores diferentes. Em vez de repetir o bloco de declarações para cada um, você pode **agrupá-los** separando os seletores por **vírgula**.\n\nImagine que você quer todos os títulos (`<h1>`, `<h2>` e `<h3>`) na cor azul-marinho. Em vez de escrever três regras iguais, escreve uma só:",
                    },
                    {
                        type: "code",
                        value: "<style>\n  /* A vírgula liga vários seletores à mesma regra */\n  h1, h2, h3 {\n    color: navy;\n    font-family: sans-serif;\n  }\n</style>\n\n<h1>Título grande</h1>\n<h2>Subtítulo</h2>\n<h3>Título menor</h3>",
                    },
                    {
                        type: "text",
                        value: 'A vírgula, ali, quer dizer **"e"**: "aplique este estilo ao `h1`, **e** ao `h2`, **e** ao `h3`". As três tags ficam azul-marinho com uma única regra.\n\nCuidado para não confundir: `h1, h2` (com vírgula) é diferente de `h1 h2` (com espaço). A vírgula agrupa seletores independentes; o espaço tem outro significado (seleciona um elemento dentro do outro), que você vai estudar mais para a frente. Por ora, guarde a vírgula como o jeito de **evitar repetição**, aplicando um estilo a vários seletores de uma vez.',
                    },
                    {
                        type: "quote",
                        value: '**Cheat sheet dos seletores:** o **seletor** escolhe quem recebe o estilo. Por **tipo** (`p`) atinge todas as tags daquele nome. Por **classe** (`.destaque`, casando com `class="destaque"`) você escolhe vários elementos e reutiliza o estilo — é o mais usado. Por **id** (`#topo`, casando com `id="topo"`) você mira **um** elemento único. O **universal** (`*`) pega todos. E a **vírgula** (`h1, h2, h3`) aplica o mesmo estilo a vários seletores de uma vez. Na dúvida entre classe e id, **use classe**.',
                    },
                ],
                questions: [
                    {
                        statement: "Qual símbolo identifica um seletor de classe no CSS?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O ponto, como em `.destaque`.",
                                isCorrect: true,
                            },
                            {
                                text: "A cerquilha, como em `#destaque`.",
                                isCorrect: false,
                            },
                            {
                                text: "O asterisco, como em `*destaque`.",
                                isCorrect: false,
                            },
                            {
                                text: "A vírgula, como em `,destaque`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual seletor atinge TODOS os elementos da página de uma só vez?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O universal, escrito `*`.",
                                isCorrect: true,
                            },
                            {
                                text: "O seletor de tipo `p`.",
                                isCorrect: false,
                            },
                            {
                                text: "A classe `.tudo`.",
                                isCorrect: false,
                            },
                            {
                                text: "O id `#todos`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença principal entre uma classe e um id?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A classe pode se repetir em vários elementos; o id deve ser único, um por página.",
                                isCorrect: true,
                            },
                            {
                                text: "O id pode se repetir à vontade; a classe só pode aparecer uma vez.",
                                isCorrect: false,
                            },
                            {
                                text: "Classe e id são a mesma coisa, só muda o símbolo.",
                                isCorrect: false,
                            },
                            {
                                text: "A classe só funciona em títulos e o id só em parágrafos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que significa a vírgula na regra `h1, h2, h3 { color: navy; }`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que o mesmo estilo se aplica aos três seletores: ao `h1`, ao `h2` e ao `h3`.",
                                isCorrect: true,
                            },
                            {
                                text: "Que ela seleciona um `h3` que esteja dentro de um `h2`, dentro de um `h1`.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o estilo vale só para o primeiro seletor, o `h1`.",
                                isCorrect: false,
                            },
                            {
                                text: "Que serão criadas três cores diferentes, uma para cada título.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você tem vários avisos espalhados pela página, em tags diferentes (um é `<p>`, outro é `<div>`), e quer que todos tenham o mesmo visual. Qual é o melhor seletor?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Uma **classe** (por exemplo `.aviso`) aplicada a todos eles, já que a classe se repete e funciona em tags diferentes.",
                                isCorrect: true,
                            },
                            {
                                text: "Um **id** repetido em cada aviso, pois o id foi feito para se repetir.",
                                isCorrect: false,
                            },
                            {
                                text: "O seletor de **tipo** `p`, que já pega todos os avisos da página.",
                                isCorrect: false,
                            },
                            {
                                text: "O seletor **universal** `*`, para atingir exatamente esses avisos.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Cores no CSS",
                blocks: [
                    {
                        type: "text",
                        value: "# Cores no CSS\n\nPoucas coisas transformam tanto uma página quanto a **cor**. Trocar o cinza sem graça por uma boa paleta muda por completo a sensação de um site. Por isso vale a pena entender bem como o CSS lida com cores, e você vai ver que existe mais de um jeito de escrever a mesma cor.\n\nNesta aula você vai conhecer as quatro formas mais comuns de dizer uma cor no CSS, dos nomes prontos aos códigos mais precisos, e vai aprender a diferença entre pintar o **texto** e pintar o **fundo**.",
                    },
                    {
                        type: "quote",
                        value: "No CSS, a **mesma cor** pode ser escrita de várias formas: por **nome** (`red`), em **hexadecimal** (`#ff0000`), com **`rgb()`** (mistura de vermelho, verde e azul) ou com **`hsl()`** (matiz, saturação e luminosidade). A versão **`rgba()`** ainda permite controlar o quão **transparente** a cor fica. E lembre: `color` pinta o **texto**, enquanto `background-color` pinta o **fundo**.",
                    },
                    {
                        type: "text",
                        value: "## color e background-color: o texto e o fundo\n\nAntes de falar dos formatos de cor, precisamos separar **duas propriedades** que todo mundo confunde no começo:\n\n- `color` define a cor do **texto** (as letras).\n- `background-color` define a cor do **fundo** do elemento (a área atrás do conteúdo).\n\nSão coisas diferentes e independentes. Veja as duas trabalhando juntas:",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .cartao {\n    color: white;\n    background-color: navy;\n  }\n</style>\n\n<p class="cartao">Texto branco sobre fundo azul-marinho.</p>',
                    },
                    {
                        type: "text",
                        value: "No exemplo, o parágrafo com a classe `.cartao` fica com as **letras brancas** (`color: white`) sobre um **fundo azul-marinho** (`background-color: navy`). Se você trocasse só o `color`, mudaria a cor das letras; se trocasse só o `background-color`, mudaria o fundo atrás delas.\n\nGuardada essa diferença, agora podemos explorar as várias formas de **escrever** uma cor. Todas elas valem tanto para `color` quanto para `background-color` (e para qualquer outra propriedade de cor).",
                    },
                    {
                        type: "text",
                        value: "## Forma 1: nomes de cor\n\nA forma mais simples de todas é usar o **nome da cor em inglês**. O CSS entende cerca de 140 nomes prontos, de `black` e `white` aos mais específicos, como `tomato`, `steelblue` ou `gold`:",
                    },
                    {
                        type: "code",
                        value: '<style>\n  h1 { color: crimson; }\n  p  { color: teal; }\n  .destaque { background-color: gold; }\n</style>\n\n<h1>Título vermelho-carmesim</h1>\n<p>Parágrafo em verde-azulado.</p>\n<p class="destaque">Fundo dourado.</p>',
                    },
                    {
                        type: "text",
                        value: "Os nomes são práticos e fáceis de lembrar, ótimos para aprender e para testes rápidos. O problema é que são **limitados**: são só cerca de 140, e dificilmente você vai achar exatamente aquele tom específico de que precisa. Para ter **liberdade total** de cor, usamos os formatos numéricos, que vêm a seguir.",
                    },
                    {
                        type: "text",
                        value: '## Forma 2: hexadecimal (#RRGGBB)\n\nO formato **hexadecimal** (ou "hex") é o mais comum no dia a dia de quem faz sites. Ele parece assustador no início, mas a lógica é simples. Uma cor hex é uma cerquilha `#` seguida de **seis caracteres**, organizados em três pares — `#RRGGBB`:\n\n- Os dois primeiros (`RR`) dizem quanto tem de **vermelho** (_red_).\n- Os dois do meio (`GG`), quanto tem de **verde** (_green_).\n- Os dois últimos (`BB`), quanto tem de **azul** (_blue_).\n\nCada par vai de `00` (nada daquela cor) até `ff` (o máximo daquela cor). Sim, aparecem letras: no sistema hexadecimal, depois do 9 vêm as letras de `a` a `f`. Você não precisa fazer contas, só entender que **quanto maior o par, mais forte aquela componente**.',
                    },
                    {
                        type: "code",
                        value: '<style>\n  .titulo { color: #1e90ff; }            /* um azul vivo */\n  .fundo  { background-color: #f5f5f5; } /* cinza bem claro */\n</style>\n\n<h1 class="titulo">Título azul</h1>\n<p class="fundo">Parágrafo com fundo cinza claro.</p>',
                    },
                    {
                        type: "text",
                        value: "Alguns valores hex que vale a pena reconhecer de cara:\n\n- `#000000` é **preto** (zero das três cores).\n- `#ffffff` é **branco** (o máximo das três).\n- `#ff0000` é **vermelho puro** (vermelho no talo, verde e azul zerados).\n\nQuando os três pares são repetidos (como `#ffffff` ou `#1188cc`), existe um **atalho** de três dígitos: `#fff` é o mesmo que `#ffffff`, e `#000` é o mesmo que `#000000`. Na prática, você quase nunca vai inventar esses códigos de cabeça: pega eles de um **seletor de cores** (o color picker do seu editor ou de um site de paletas) e cola no CSS.",
                    },
                    {
                        type: "text",
                        value: "## Forma 3: rgb() e rgba()\n\nO formato **`rgb()`** diz a mesma coisa que o hexadecimal (quanto de vermelho, verde e azul), mas usando **números** de 0 a 255, que muita gente acha mais fáceis de ler. A ordem é sempre vermelho, verde, azul:",
                    },
                    {
                        type: "code",
                        value: "<style>\n  h1 { color: rgb(30, 144, 255); }  /* o mesmo azul do #1e90ff */\n  p  { color: rgb(0, 0, 0); }       /* preto */\n</style>\n\n<h1>Título azul com rgb()</h1>\n<p>Texto preto.</p>",
                    },
                    {
                        type: "text",
                        value: "Cada número vai de `0` (nada) a `255` (o máximo) daquela componente. Assim, `rgb(255, 0, 0)` é vermelho puro, `rgb(0, 0, 0)` é preto e `rgb(255, 255, 255)` é branco. É a mesma lógica do hex, só que em números que a gente lê mais fácil.\n\nO `rgb()` tem uma versão irmã que adiciona um quarto valor: a **transparência**. É a **`rgba()`**, em que o `a` vem de _alpha_ (o canal de transparência):",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .caixa {\n    /* preto com 50% de transparência */\n    background-color: rgba(0, 0, 0, 0.5);\n  }\n</style>\n\n<div class="caixa">\n  <p>O fundo preto aqui está meio transparente.</p>\n</div>',
                    },
                    {
                        type: "text",
                        value: "Esse quarto valor, o **alpha**, vai de `0` a `1` e controla a **opacidade** da cor:\n\n- `0` é **totalmente transparente** (a cor some, dá para ver tudo atrás).\n- `1` é **totalmente opaco** (a cor cheia, igual ao `rgb()` normal).\n- `0.5` é **meio a meio**, um véu translúcido.\n\nA transparência é ótima para efeitos como uma tarja escura por cima de uma foto, deixando o texto legível sem esconder a imagem. Uma curiosidade: o hexadecimal moderno também aceita transparência com dois dígitos a mais, mas o `rgba()` costuma ser mais fácil de entender no começo.",
                    },
                    {
                        type: "text",
                        value: '## Forma 4: hsl()\n\nA última forma é a **`hsl()`**, que muita gente considera a mais **intuitiva** para escolher cores na mão, porque descreve a cor do jeito que a gente pensa. São três valores:\n\n- **H** (_hue_, matiz): a cor em si, num círculo de `0` a `360` graus. `0` é vermelho, `120` é verde, `240` é azul, e aí volta ao vermelho em `360`.\n- **S** (_saturation_, saturação): o quão viva é a cor, de `0%` (cinza sem graça) a `100%` (cor vibrante).\n- **L** (_lightness_, luminosidade): o quão clara, de `0%` (preto) a `100%` (branco), com `50%` sendo a cor "cheia".',
                    },
                    {
                        type: "code",
                        value: '<style>\n  .a { color: hsl(0, 100%, 50%); }    /* vermelho puro */\n  .b { color: hsl(120, 100%, 50%); }  /* verde puro */\n  .c { color: hsl(240, 100%, 50%); }  /* azul puro */\n</style>\n\n<p class="a">Vermelho.</p>\n<p class="b">Verde.</p>\n<p class="c">Azul.</p>',
                    },
                    {
                        type: "text",
                        value: "A grande vantagem do `hsl()` aparece quando você quer **variações** de uma cor. Fixando o matiz (o primeiro número) e mexendo só na luminosidade, você cria tons mais claros ou mais escuros da **mesma** cor com facilidade, algo bem mais trabalhoso no hexadecimal:",
                    },
                    {
                        type: "code",
                        value: '<style>\n  /* Mesmo azul (matiz 210), do mais escuro ao mais claro */\n  .escuro { background-color: hsl(210, 100%, 30%); }\n  .medio  { background-color: hsl(210, 100%, 50%); }\n  .claro  { background-color: hsl(210, 100%, 80%); }\n</style>\n\n<p class="escuro">Azul escuro</p>\n<p class="medio">Azul médio</p>\n<p class="claro">Azul claro</p>',
                    },
                    {
                        type: "text",
                        value: "## As quatro formas lado a lado\n\nPara amarrar tudo, a tabela abaixo mostra a **mesma cor** (um tom de tomate) escrita das quatro maneiras. Todas produzem exatamente o mesmo resultado na tela; só muda a notação:",
                    },
                    {
                        type: "table",
                        value: '[["Forma","O mesmo tomate escrito assim","Quando costuma ser útil"],["Nome","`tomato`","Testes rápidos e cores bem conhecidas"],["Hexadecimal","`#ff6347`","O padrão no dia a dia, vindo de um color picker"],["`rgb()`","`rgb(255, 99, 71)`","Números de 0 a 255, fáceis de ler"],["`hsl()`","`hsl(9, 100%, 64%)`","Escolher e criar variações de tom na mão"]]',
                    },
                    {
                        type: "text",
                        value: "## Afinal, qual devo usar?\n\nBoa notícia: **todas funcionam**, e você pode até misturar formatos no mesmo projeto. Mas, na prática:\n\n- Para **começar e testar**, os **nomes** são os mais fáceis.\n- No **dia a dia**, o **hexadecimal** é o mais comum, porque é o que os color pickers e as ferramentas de design costumam entregar.\n- Quando precisar de **transparência**, use `rgba()`.\n- Quando quiser **ajustar tons na mão**, o `hsl()` é o mais confortável.\n\nNão precisa decorar códigos de cor. O caminho normal é escolher a cor num seletor visual e colar o valor no CSS. O importante é **reconhecer** cada formato quando cruzar com ele.",
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet das cores:** `color` pinta o **texto** e `background-color` pinta o **fundo**. Uma cor pode ser escrita por **nome** (`tomato`), em **hexadecimal** `#RRGGBB` (cada par de `00` a `ff`, com atalho de 3 dígitos como `#fff`), com **`rgb()`** (três números de 0 a 255) ou com **`hsl()`** (matiz 0–360, saturação e luminosidade em %). Para **transparência**, use **`rgba()`** com um alpha de `0` (invisível) a `1` (opaco). Todas as formas valem para qualquer propriedade de cor.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual propriedade define a cor do fundo de um elemento?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`background-color`",
                                isCorrect: true,
                            },
                            {
                                text: "`color`",
                                isCorrect: false,
                            },
                            {
                                text: "`background-image`",
                                isCorrect: false,
                            },
                            {
                                text: "`text-color`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma cor hexadecimal como `#ff0000` tem quantos caracteres depois do `#`, e o que eles representam?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Seis, em três pares: vermelho, verde e azul.",
                                isCorrect: true,
                            },
                            {
                                text: "Três, um para cada cor primária.",
                                isCorrect: false,
                            },
                            {
                                text: "Oito, um para cada cor do arco-íris.",
                                isCorrect: false,
                            },
                            {
                                text: "Dois, apenas para o brilho da cor.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No valor `rgba(0, 0, 0, 0.5)`, o que faz o último número, o `0.5`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Controla a transparência: `0` é totalmente transparente, `1` é opaco, e `0.5` fica meio a meio.",
                                isCorrect: true,
                            },
                            {
                                text: "Define o tom de cinza do preto.",
                                isCorrect: false,
                            },
                            {
                                text: "Indica quantos pixels a cor ocupa na tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Escolhe entre as cores vermelho, verde e azul.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual destes valores representa o **vermelho puro**?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`rgb(255, 0, 0)`",
                                isCorrect: true,
                            },
                            {
                                text: "`rgb(0, 255, 0)`",
                                isCorrect: false,
                            },
                            {
                                text: "`rgb(0, 0, 255)`",
                                isCorrect: false,
                            },
                            {
                                text: "`#00ff00`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um colega afirma que `#ffffff`, `rgb(255, 255, 255)` e o nome `white` são três cores diferentes. Qual resposta o corrige?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "São a **mesma** cor (o branco) escrita de três formas diferentes; o resultado na tela é idêntico.",
                                isCorrect: true,
                            },
                            {
                                text: "Estão certas em serem diferentes: uma é branca, outra é cinza e outra é creme.",
                                isCorrect: false,
                            },
                            {
                                text: "Só o nome `white` é branco; os outros dois são tons de azul.",
                                isCorrect: false,
                            },
                            {
                                text: "São diferentes porque `rgb()` e hexadecimal nunca podem representar a mesma cor.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Seletores, cascata e especificidade",
        aulas: [
            {
                titulo: "Combinadores e seletores de atributo",
                blocks: [
                    {
                        type: "text",
                        value: '# Combinadores e seletores de atributo\n\nNo módulo passado você aprendeu a mirar elementos com seletores simples: pelo nome da tag (`p`), pela classe (`.destaque`) ou pelo id (`#topo`). Isso já resolve muita coisa, mas cedo ou tarde bate uma vontade mais fina: "quero estilizar só os parágrafos que estão **dentro** de um artigo" ou "só o item que vem **logo depois** de um título".\n\nÉ aí que entram os **combinadores**. Eles não são seletores novos: são **símbolos que você coloca entre dois seletores** para descrever a **relação** entre os elementos. Nesta aula você vai conhecer os quatro combinadores e, de quebra, um jeito de selecionar elementos pelos seus atributos.',
                    },
                    {
                        type: "quote",
                        value: "Um **combinador** é o símbolo (ou o espaço) que fica **entre dois seletores** e descreve a **relação de parentesco ou vizinhança** entre eles. Trocar esse símbolo muda por completo quais elementos são atingidos: `article p` (espaço) mira descendentes em qualquer nível; `article > p` (maior que) mira só os filhos diretos; `h2 + p` (mais) mira o irmão logo em seguida; e `h2 ~ p` (til) mira todos os irmãos seguintes.",
                    },
                    {
                        type: "text",
                        value: "## Uma árvore de parentesco\n\nAntes dos símbolos, precisamos de uma imagem na cabeça. Todo HTML é uma **árvore de família**: uns elementos ficam dentro dos outros, então dá para falar em **pais**, **filhos**, **irmãos** e até **netos**.\n\nVeja este HTML e repare no encaixe:",
                    },
                    {
                        type: "code",
                        value: "<article>\n  <h2>Título do post</h2>\n  <p>Primeiro parágrafo.</p>\n  <section>\n    <p>Parágrafo dentro de uma section.</p>\n  </section>\n</article>",
                    },
                    {
                        type: "text",
                        value: "Nessa árvore:\n\n- O `article` é o **pai** do `h2`, do primeiro `p` e da `section`.\n- Esses três são **irmãos** entre si, porque têm o mesmo pai.\n- O `p` que está dentro da `section` é **neto** do `article` (ele é filho da `section`, que é filha do `article`).\n\nOs combinadores usam exatamente esse vocabulário. Vamos a eles, um de cada vez.",
                    },
                    {
                        type: "text",
                        value: '## O combinador descendente: o espaço\n\nO mais usado de todos é também o mais discreto: um simples **espaço** entre dois seletores. `nav a` quer dizer "todo `a` que esteja **dentro** de um `nav`, não importa quão fundo". Filho, neto, bisneto: se estiver lá dentro em qualquer nível, é selecionado.',
                    },
                    {
                        type: "code",
                        value: "/* Todo link dentro de um nav perde o sublinhado — em qualquer nível */\nnav a {\n  text-decoration: none;\n}",
                    },
                    {
                        type: "code",
                        value: '<nav>\n  <a href="#">Início</a>          <!-- pega: filho direto do nav -->\n  <ul>\n    <li><a href="#">Blog</a></li> <!-- pega também: é neto do nav -->\n  </ul>\n</nav>\n\n<a href="#">Contato</a>           <!-- NÃO pega: está fora do nav -->',
                    },
                    {
                        type: "text",
                        value: '## Filho direto: o `>`\n\nÀs vezes "qualquer descendente" é demais. O combinador **filho direto**, escrito com o sinal de maior `>`, seleciona **só os filhos diretos**, ignorando netos e bisnetos. Pense assim: `article > p` mira os filhos, mas não os netos.',
                    },
                    {
                        type: "code",
                        value: "/* Só os parágrafos que são filhos DIRETOS do article ficam em negrito */\narticle > p {\n  font-weight: bold;\n}",
                    },
                    {
                        type: "code",
                        value: "<article>\n  <p>Fico em negrito: sou filho direto do article.</p>\n  <section>\n    <p>NÃO fico: sou neto (filho da section).</p>\n  </section>\n</article>",
                    },
                    {
                        type: "text",
                        value: "## Irmão adjacente: o `+`\n\nOs dois próximos combinadores olham para o lado, para os **irmãos** (elementos com o mesmo pai). O irmão **adjacente**, escrito com `+`, seleciona o elemento que vem **imediatamente depois** de outro. `h2 + p` mira o **primeiro** parágrafo logo em seguida de um `h2` — só ele, mais nenhum.",
                    },
                    {
                        type: "code",
                        value: "/* O parágrafo IMEDIATAMENTE após um h2 ganha um respiro em cima */\nh2 + p {\n  margin-top: 16px;\n}",
                    },
                    {
                        type: "code",
                        value: "<h2>Seção</h2>\n<p>Fico com o recuo: venho logo depois do h2.</p>\n<p>NÃO fico: já não sou o primeiro depois do h2.</p>",
                    },
                    {
                        type: "text",
                        value: "## Irmão geral: o `~`\n\nO irmão **geral**, escrito com o til `~`, é o primo mais generoso do `+`: em vez de pegar só o próximo, ele pega **todos os irmãos que vierem depois**. `h2 ~ p` seleciona todos os parágrafos irmãos que aparecem após um `h2`.",
                    },
                    {
                        type: "code",
                        value: "/* TODOS os parágrafos irmãos que vierem depois de um h2 ficam cinzas */\nh2 ~ p {\n  color: gray;\n}",
                    },
                    {
                        type: "code",
                        value: "<h2>Seção</h2>\n<p>Fico cinza.</p>\n<span>Não sou p, então passo batido.</span>\n<p>Também fico cinza: sou um irmão posterior do h2.</p>",
                    },
                    {
                        type: "table",
                        value: '[["Combinador","Símbolo","Seleciona","Exemplo"],["Descendente","(espaço)","Qualquer descendente, em qualquer nível","`nav a`"],["Filho direto","`>`","Só os filhos diretos","`article > p`"],["Irmão adjacente","`+`","O irmão logo em seguida","`h2 + p`"],["Irmão geral","`~`","Todos os irmãos seguintes","`h2 ~ p`"]]',
                    },
                    {
                        type: "text",
                        value: '## Selecionando por atributo: os colchetes `[ ]`\n\nAlém de tag, classe e id, você pode mirar elementos pelos seus **atributos**, aqueles pares `nome="valor"` que você viu no módulo de HTML. Basta colocar o atributo entre **colchetes** `[ ]`. É especialmente útil em **formulários**, onde vários `input` diferem só pelo atributo `type`.\n\n- `[href]` seleciona todo elemento que **tenha** o atributo `href`, não importa o valor.\n- `[type="text"]` seleciona os que têm `type` **igual a** `text`.\n- Você pode grudar o colchete num seletor de tag: `input[type="password"]` mira só os campos de senha.',
                    },
                    {
                        type: "code",
                        value: '/* Todo campo de texto ganha uma borda cinza */\ninput[type="text"] {\n  border: 1px solid #ccc;\n}\n\n/* Campos de senha ganham um fundo levemente amarelado */\ninput[type="password"] {\n  background: #fffbea;\n}\n\n/* Links que abrem em nova aba (target="_blank") ficam com outra cor */\na[target="_blank"] {\n  color: teal;\n}',
                    },
                    {
                        type: "text",
                        value: 'Dá para ir além do "igual a": existem variações para casar o **começo**, o **fim** ou um **pedaço** do valor. Por exemplo, `[href^="https"]` pega os links cujo `href` **começa** com `https`, e `[src$=".png"]` pega as imagens cujo `src` **termina** em `.png`. Você não precisa decorar isso agora, só saber que existe: quando precisar, é só consultar. Por ora, `[atributo]` e `[atributo="valor"]` já cobrem a maioria dos casos.',
                    },
                    {
                        type: "quote",
                        value: '**Cheat sheet:** os **combinadores** ficam entre dois seletores e descrevem a relação: **espaço** = qualquer descendente (`nav a`); **`>`** = filho direto (`article > p`); **`+`** = o irmão logo em seguida (`h2 + p`); **`~`** = todos os irmãos seguintes (`h2 ~ p`). Já os **seletores de atributo** miram pelos atributos entre colchetes: `[href]` (tem o atributo) ou `[type="text"]` (valor exato), ótimos em formulários e muitas vezes grudados na tag, como `input[type="password"]`.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "O que o espaço entre dois seletores, como em `article p`, seleciona?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Qualquer `p` que esteja dentro de um `article`, em qualquer nível de profundidade (filho, neto, bisneto).",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas o `p` que é filho direto do `article`.",
                                isCorrect: false,
                            },
                            {
                                text: "O `p` que vem imediatamente depois do `article`.",
                                isCorrect: false,
                            },
                            {
                                text: "Todo `article` que esteja dentro de um `p`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual combinador seleciona apenas os filhos diretos de um elemento, ignorando os netos?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`>` (maior que)",
                                isCorrect: true,
                            },
                            {
                                text: "O espaço",
                                isCorrect: false,
                            },
                            {
                                text: "`+` (mais)",
                                isCorrect: false,
                            },
                            {
                                text: "`~` (til)",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O seletor `h2 + p` estiliza qual elemento?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O primeiro parágrafo que vem imediatamente depois de um `h2`, sendo irmão dele.",
                                isCorrect: true,
                            },
                            {
                                text: "Todos os parágrafos que aparecem depois do `h2`.",
                                isCorrect: false,
                            },
                            {
                                text: "Todos os parágrafos que estão dentro do `h2`.",
                                isCorrect: false,
                            },
                            {
                                text: "O parágrafo que vem logo antes do `h2`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'O que o seletor `input[type="text"]` seleciona?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Os elementos `input` cujo atributo `type` é igual a `text`.",
                                isCorrect: true,
                            },
                            {
                                text: "Todos os elementos `input` da página, independentemente do tipo.",
                                isCorrect: false,
                            },
                            {
                                text: "Os `input` que têm a classe `text`.",
                                isCorrect: false,
                            },
                            {
                                text: "O texto que o usuário digitou dentro do campo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você quer deixar em cinza TODOS os parágrafos que aparecem depois de um `h2` e são irmãos dele, não só o primeiro. Qual seletor faz isso?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`h2 ~ p`, porque o til seleciona todos os irmãos que vêm depois.",
                                isCorrect: true,
                            },
                            {
                                text: "`h2 + p`, porque o mais seleciona todos os irmãos seguintes.",
                                isCorrect: false,
                            },
                            {
                                text: "`h2 > p`, porque os parágrafos são filhos diretos do `h2`.",
                                isCorrect: false,
                            },
                            {
                                text: "`h2 p`, porque os parágrafos ficam dentro do `h2`.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Pseudo-classes e pseudo-elementos",
                blocks: [
                    {
                        type: "text",
                        value: '# Pseudo-classes e pseudo-elementos\n\nAté agora, todos os nossos seletores miravam elementos que existem "crus" no HTML. Mas e se você quiser estilizar um botão **só enquanto o mouse está em cima** dele? Ou pintar **só o primeiro item** de uma lista? Ou ainda colocar um símbolo **antes** de um texto sem escrever esse símbolo no HTML?\n\nPara esses casos existem as **pseudo-classes** e os **pseudo-elementos**. O prefixo _pseudo_ vem do grego e quer dizer "falso", "aparente". A ideia é selecionar algo que não é um elemento comum: um **estado** ("enquanto está sob o mouse"), uma **posição** ("o primeiro filho") ou uma **parte** do elemento que nem existe no HTML.',
                    },
                    {
                        type: "quote",
                        value: "Uma **pseudo-classe** começa com **um** dois-pontos (`:hover`, `:first-child`) e mira o elemento em um certo **estado** ou **posição**. Um **pseudo-elemento** começa com **dois** dois-pontos (`::before`, `::placeholder`) e mira uma **parte** do elemento, ou cria um pedacinho novo que não existe no HTML. A regra de bolso: `:` para estado, `::` para parte.",
                    },
                    {
                        type: "text",
                        value: '## Pseudo-classes de estado: `:hover`, `:focus`, `:active`\n\nAs três pseudo-classes mais usadas descrevem como o usuário está **interagindo** com o elemento naquele instante:\n\n- `:hover` vale enquanto o **ponteiro do mouse está em cima** do elemento. É o clássico "muda de cor quando passo o mouse".\n- `:focus` vale quando o elemento está **em foco**, ou seja, selecionado para receber a digitação (um campo de formulário clicado, ou um botão alcançado com a tecla Tab).\n- `:active` vale no **instante do clique**, enquanto o botão do mouse está pressionado.',
                    },
                    {
                        type: "code",
                        value: "/* Cor normal do botão */\nbutton {\n  background: royalblue;\n  color: white;\n}\n\n/* Enquanto o mouse está em cima */\nbutton:hover {\n  background: mediumblue;\n}\n\n/* No instante em que está sendo clicado */\nbutton:active {\n  background: navy;\n}\n\n/* Quando um campo de texto está em foco */\ninput:focus {\n  border: 2px solid royalblue;\n}",
                    },
                    {
                        type: "text",
                        value: 'Vale um destaque para o `:focus`. Muita gente se incomoda com a "bordinha" que aparece nos campos e botões e some com ela no CSS. **Não faça isso sem oferecer um substituto.** Quem navega pelo teclado (por preferência ou por necessidade) usa justamente esse realce de foco para saber onde está na página. Se você tira o destaque padrão, ponha outro no lugar, como uma borda ou uma sombra bem visível. Acessibilidade também é responsabilidade do CSS.',
                    },
                    {
                        type: "text",
                        value: "## Pseudo-classes de posição: `:first-child`, `:last-child`, `:nth-child()`\n\nOutro grupo de pseudo-classes seleciona o elemento pela sua **posição entre os irmãos**:\n\n- `:first-child` mira o elemento que é o **primeiro filho** do seu pai.\n- `:last-child` mira o **último filho**.\n- `:nth-child(n)` é o mais poderoso: mira o filho de **número n**. Você pode passar um número (`:nth-child(3)` = o terceiro), a palavra `odd` (ímpares), a palavra `even` (pares) ou até uma fórmula.",
                    },
                    {
                        type: "code",
                        value: '/* Deixa o primeiro item da lista em negrito */\nli:first-child {\n  font-weight: bold;\n}\n\n/* Tira a borda de baixo do último item, para não sobrar uma linha solta */\nli:last-child {\n  border-bottom: none;\n}\n\n/* Pinta o fundo das linhas pares — o famoso "zebrado" de tabelas */\ntr:nth-child(even) {\n  background: #f2f2f2;\n}',
                    },
                    {
                        type: "text",
                        value: "O `:nth-child()` merece um segundo olhar porque o `even`/`odd` resolve um problema muito comum: o **zebrado**. Alternar a cor de fundo das linhas de uma tabela (ou dos itens de uma lista longa) deixa tudo mais fácil de ler, e você consegue isso com uma única regra, sem marcar linha por linha no HTML. Se um dia precisar de um ritmo diferente, dá para usar fórmulas como `:nth-child(3n)` (de três em três), mas para começar `even` e `odd` já cobrem quase tudo.",
                    },
                    {
                        type: "text",
                        value: "## Excluindo com `:not()`\n\nÀs vezes é mais fácil dizer o que você **não** quer. A pseudo-classe `:not()` seleciona tudo **menos** o que estiver dentro dos parênteses. Por exemplo, `li:not(.ativo)` mira todos os `li` que **não** têm a classe `ativo`.",
                    },
                    {
                        type: "code",
                        value: '/* Todos os botões, exceto os que têm a classe "desativado" */\nbutton:not(.desativado) {\n  cursor: pointer;\n}\n\n/* Todos os itens da lista, menos o último, ganham uma linha separadora */\nli:not(:last-child) {\n  border-bottom: 1px solid #ddd;\n}',
                    },
                    {
                        type: "table",
                        value: '[["Pseudo-classe","Seleciona"],["`:hover`","O elemento sob o ponteiro do mouse"],["`:focus`","O elemento em foco, pronto para receber digitação"],["`:active`","O elemento no instante do clique"],["`:first-child`","O primeiro filho do seu pai"],["`:last-child`","O último filho do seu pai"],["`:nth-child(n)`","O filho de número n (aceita `even`, `odd` e fórmulas)"],["`:not(x)`","Todos, menos os que casam com `x`"]]',
                    },
                    {
                        type: "text",
                        value: "## Pseudo-elementos: `::before` e `::after`\n\nAgora entramos nos **pseudo-elementos**, marcados por **dois** dois-pontos. Os dois mais famosos são o `::before` e o `::after`: eles **criam um pedacinho de conteúdo** logo **antes** e logo **depois** do conteúdo do elemento, sem que você precise escrever nada disso no HTML.\n\nPara esse pedacinho aparecer, ele **precisa** da propriedade `content`, que diz qual texto (ou símbolo) colocar ali. Sem `content`, o pseudo-elemento simplesmente não aparece.",
                    },
                    {
                        type: "code",
                        value: '/* Marca os campos obrigatórios com um asterisco vermelho depois do rótulo */\nlabel.obrigatorio::after {\n  content: " *";\n  color: red;\n}\n\n/* Coloca a palavra "Dica:" antes de todo parágrafo de dica */\np.dica::before {\n  content: "Dica: ";\n  font-weight: bold;\n}',
                    },
                    {
                        type: "text",
                        value: 'Um uso muito comum é adicionar **rótulos e enfeites** sem poluir o HTML. Como esse conteúdo é puramente visual, o lugar dele é no CSS, não no HTML. Você também vai encontrar `content: ""` (vazio) combinado com tamanho e cor de fundo para desenhar pequenas formas decorativas, mas isso é papo para mais adiante. Por ora, guarde a dupla: `::before`/`::after` sempre acompanhados de `content`.',
                    },
                    {
                        type: "text",
                        value: "## Estilizando o texto de dica: `::placeholder`\n\nQuando você cria um campo com o atributo `placeholder`, o navegador mostra um textinho de dica dentro do campo, que some quando o usuário começa a digitar. Esse texto é uma **parte** do campo, então também é um pseudo-elemento: o `::placeholder`. Com ele você ajusta a cor e o estilo dessa dica.",
                    },
                    {
                        type: "code",
                        value: '<input type="email" placeholder="seu@email.com">',
                    },
                    {
                        type: "code",
                        value: "/* Deixa o texto de dica cinza-claro e em itálico */\ninput::placeholder {\n  color: #999;\n  font-style: italic;\n}",
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet:** um dois-pontos (`:`) marca **pseudo-classe** (estado ou posição): `:hover` (sob o mouse), `:focus` (em foco — não suma com ele sem substituir), `:active` (no clique), `:first-child`/`:last-child`/`:nth-child()` (posição, com `even`/`odd` para o zebrado) e `:not()` (exclusão). Dois dois-pontos (`::`) marcam **pseudo-elemento** (uma parte): `::before` e `::after` sempre com `content`, e `::placeholder` para o texto de dica dos campos.",
                    },
                ],
                questions: [
                    {
                        statement: "O que a pseudo-classe `:hover` seleciona?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O elemento enquanto o ponteiro do mouse está em cima dele.",
                                isCorrect: true,
                            },
                            {
                                text: "O primeiro filho de um elemento.",
                                isCorrect: false,
                            },
                            {
                                text: "O elemento no instante exato do clique.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma parte do elemento criada só pelo CSS.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quantos dois-pontos marcam um pseudo-elemento como o `::before`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Dois (`::`).",
                                isCorrect: true,
                            },
                            {
                                text: "Um (`:`).",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum; usa-se um ponto (`.`).",
                                isCorrect: false,
                            },
                            {
                                text: "Três (`:::`).",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que a regra `tr:nth-child(even)` faz?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Aplica o estilo às linhas de posição par, criando o efeito zebrado.",
                                isCorrect: true,
                            },
                            {
                                text: "Aplica o estilo apenas à primeira linha da tabela.",
                                isCorrect: false,
                            },
                            {
                                text: "Aplica o estilo a todas as linhas, sem exceção.",
                                isCorrect: false,
                            },
                            {
                                text: "Aplica o estilo somente à linha que está sob o mouse.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual propriedade é indispensável para que um `::before` ou `::after` apareça na tela?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`content`",
                                isCorrect: true,
                            },
                            {
                                text: "`color`",
                                isCorrect: false,
                            },
                            {
                                text: "`display`",
                                isCorrect: false,
                            },
                            {
                                text: "`placeholder`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o seletor `li:not(:last-child)` seleciona?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Todos os itens da lista, exceto o último.",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas o último item da lista.",
                                isCorrect: false,
                            },
                            {
                                text: "Todos os itens da lista, sem exceção.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas o primeiro item da lista.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Herança e cascata",
                blocks: [
                    {
                        type: "text",
                        value: '# Herança e cascata\n\nVocê já sabe escrever regras e mirar os elementos certos. Agora vem uma pergunta natural: quando um elemento poderia ser afetado por **várias** regras, ou por **nenhuma** diretamente, quem decide a aparência final?\n\nA resposta envolve dois mecanismos que trabalham nos bastidores de todo CSS: a **herança**, que faz certos estilos "descerem" dos pais para os filhos automaticamente, e a **cascata**, o conjunto de regras que o navegador usa para escolher um vencedor quando mais de uma regra tenta valer. Entender essa dupla é o que separa quem "chuta CSS até funcionar" de quem realmente sabe o que está fazendo.',
                    },
                    {
                        type: "quote",
                        value: "Dois mecanismos definem o valor final de cada propriedade. A **herança** faz algumas propriedades (como cor e fonte) passarem do elemento pai para os filhos sem você repetir nada. A **cascata** é o processo de desempate: quando várias regras miram o mesmo elemento, o navegador as ordena por **origem**, depois por **especificidade** e, por fim, por **ordem de aparição** — e a que sobra vence.",
                    },
                    {
                        type: "text",
                        value: '## Herança: estilos que descem dos pais\n\n**Herança** é a ideia de que alguns estilos aplicados a um elemento são **repassados aos seus descendentes** automaticamente. É como um traço de família: se você define a cor do texto no `body`, os parágrafos, títulos e listas lá dentro tendem a "herdar" essa mesma cor, sem você repetir a regra em cada um.\n\nAs propriedades que se herdam são, quase todas, ligadas a **texto**: `color`, `font-family`, `font-size`, `font-weight`, `line-height`, `text-align`. Faz sentido: você quer que a fonte escolhida valha para a página inteira, então nada mais prático do que defini-la uma vez no topo e deixar descer.',
                    },
                    {
                        type: "code",
                        value: "/* Definido uma única vez no body... */\nbody {\n  color: #333;\n  font-family: Arial, sans-serif;\n}",
                    },
                    {
                        type: "code",
                        value: "<body>\n  <h1>Este título herda a cor #333 e a fonte Arial</h1>\n  <p>Este parágrafo também, sem precisar de nenhuma regra própria.</p>\n</body>",
                    },
                    {
                        type: "text",
                        value: "## O que NÃO se herda\n\nAgora imagine se **tudo** fosse herdado. Você põe uma borda no `body` e, de repente, cada parágrafo, cada link e cada imagem também ganha aquela borda. Um caos. Por isso, propriedades ligadas a **layout e caixa** **não** são herdadas: `border`, `margin`, `padding`, `width`, `height`, `background`.\n\nA regra prática para lembrar: o que é sobre **texto** costuma ser herdado; o que é sobre **a caixa do elemento** (tamanho, espaçamento, fundo, borda) não é. Cada elemento cuida da sua própria caixa.",
                    },
                    {
                        type: "table",
                        value: '[["Propriedade","É herdada?","Sobre o quê"],["`color`","Sim","Texto"],["`font-family`","Sim","Texto"],["`font-size`","Sim","Texto"],["`line-height`","Sim","Texto"],["`background`","Não","Caixa"],["`border`","Não","Caixa"],["`margin` / `padding`","Não","Caixa"],["`width` / `height`","Não","Caixa"]]',
                    },
                    {
                        type: "text",
                        value: '## A cascata: escolhendo um vencedor\n\nO "C" de CSS vem de _Cascading_, ou seja, **em cascata**. O nome descreve o que acontece quando **várias regras** miram o mesmo elemento e discordam: elas passam por um funil de desempate até sobrar uma vencedora. O navegador decide em três etapas, nesta ordem:\n\n1. **Origem** da regra: existe o CSS que **você** escreve (o do autor da página), o que o **usuário** pode configurar no navegador e o **estilo padrão do próprio navegador**. O seu, de autor, tem prioridade sobre o padrão do navegador.\n2. **Especificidade**: entre as suas próprias regras, a mais "específica" vence. Esse cálculo é tão importante que ganhou uma aula só para ele — a próxima.\n3. **Ordem de aparição**: se duas regras empatam em tudo, vence a que aparece **por último** no CSS.',
                    },
                    {
                        type: "text",
                        value: 'Vamos ver a terceira etapa, a mais fácil de observar. Quando duas regras têm exatamente o mesmo alvo e o mesmo peso, a **última a ser escrita** ganha, porque ela "passa por cima" da anterior:',
                    },
                    {
                        type: "code",
                        value: "p {\n  color: blue;\n}\n\n/* Vem depois e mira o mesmo p com o mesmo peso: é esta que vale */\np {\n  color: green;\n}\n\n/* Resultado na tela: o parágrafo fica verde */",
                    },
                    {
                        type: "text",
                        value: '## Controlando na mão: `inherit` e `initial`\n\nÀs vezes você quer **forçar** a herança, ou **desfazê-la**. Para isso existem dois valores especiais que servem para qualquer propriedade:\n\n- `inherit` diz "use o mesmo valor do meu elemento pai", mesmo em propriedades que normalmente não se herdam.\n- `initial` diz "volte ao valor **inicial** que o CSS define para esta propriedade", desfazendo qualquer herança. Para `color`, por exemplo, esse valor inicial é o preto.\n\nUm caso clássico do `inherit`: botões e campos de formulário, por padrão, **não** herdam a fonte da página, eles vêm com uma fonte própria do navegador. Se você quer que um botão use a mesma fonte do resto, força com `inherit`:',
                    },
                    {
                        type: "code",
                        value: "/* Faz o botão usar a mesma fonte herdada do resto da página */\nbutton {\n  font-family: inherit;\n}\n\n/* Volta a cor deste elemento ao valor inicial padrão do CSS (preto) */\n.reset {\n  color: initial;\n}",
                    },
                    {
                        type: "text",
                        value: '## `!important`: o martelo que quebra a cascata\n\nExiste uma forma de dizer ao navegador "esta declaração vence, e ponto final": basta acrescentar `!important` no fim do valor. Ela pula na frente de praticamente todas as outras regras, ignorando especificidade e ordem.\n\nParece a solução mágica para quando um estilo "não quer pegar", mas é justamente aí que mora o perigo.',
                    },
                    {
                        type: "code",
                        value: "p {\n  color: red !important; /* vence mesmo contra uma regra mais específica */\n}\n\n/* Esta, embora mais específica, PERDE por causa do !important acima */\n#conteudo p {\n  color: blue;\n}",
                    },
                    {
                        type: "text",
                        value: '### Por que evitar o `!important`\n\nO problema do `!important` é que ele **quebra o fluxo natural** da cascata. Quando você usa um para "resolver" um problema, mais cedo ou mais tarde vai precisar de **outro** `!important` para sobrepor o primeiro, e logo o seu CSS vira uma guerra de martelos onde ninguém mais sabe qual regra manda. De quebra, o código fica muito mais difícil de manter e de depurar.\n\nA recomendação é clara: **evite** o `!important`. Se um estilo não está pegando, quase sempre o certo é entender a **especificidade** (nosso próximo assunto) e ajustar o seletor, em vez de apelar para o martelo.',
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet:** a **herança** repassa aos filhos, sozinha, propriedades de **texto** (`color`, `font-family`, `font-size`...); propriedades de **caixa** (`border`, `margin`, `padding`, `background`) **não** se herdam. A **cascata** desempata regras concorrentes por **origem → especificidade → ordem** (no empate, a última vence). `inherit` força a herança; `initial` volta ao valor inicial. E o `!important` até vence tudo, mas quebra a cascata e vira dor de cabeça: **evite**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual destas propriedades é herdada dos elementos pais para os filhos por padrão?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`color`",
                                isCorrect: true,
                            },
                            {
                                text: "`border`",
                                isCorrect: false,
                            },
                            {
                                text: "`margin`",
                                isCorrect: false,
                            },
                            {
                                text: "`width`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'A que se refere a palavra "cascata" (o C de CSS)?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ao processo pelo qual o navegador decide qual regra vence quando várias miram o mesmo elemento.",
                                isCorrect: true,
                            },
                            {
                                text: "Ao efeito visual de água caindo que se aplica ao fundo das páginas.",
                                isCorrect: false,
                            },
                            {
                                text: "À ordem em que as imagens são baixadas pelo navegador.",
                                isCorrect: false,
                            },
                            {
                                text: "Ao fato de o HTML ficar aninhado em forma de árvore.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Duas regras miram o mesmo elemento com o mesmo peso (mesma especificidade). Qual delas vence?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A que aparecer por último no arquivo CSS.",
                                isCorrect: true,
                            },
                            {
                                text: "A que aparecer primeiro no arquivo CSS.",
                                isCorrect: false,
                            },
                            {
                                text: "A que tiver o seletor com o nome maior.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma; o navegador ignora as duas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o valor `inherit` faz quando aplicado a uma propriedade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Faz a propriedade usar o mesmo valor do elemento pai, mesmo que ela normalmente não seja herdada.",
                                isCorrect: true,
                            },
                            {
                                text: "Volta a propriedade ao valor padrão do navegador.",
                                isCorrect: false,
                            },
                            {
                                text: "Impede que os filhos daquele elemento herdem qualquer coisa.",
                                isCorrect: false,
                            },
                            {
                                text: "Faz a regra vencer todas as outras, como o `!important`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que a recomendação geral é evitar o `!important`?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque ele quebra o fluxo natural da cascata e leva a uma escalada de novos `!important` para sobrepor os anteriores, deixando o CSS difícil de manter.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque ele não funciona na maioria dos navegadores modernos.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque ele deixa a página mais lenta para carregar.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque ele só pode ser usado uma vez por arquivo CSS.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Especificidade",
                blocks: [
                    {
                        type: "text",
                        value: "# Especificidade\n\nNa aula anterior vimos que, quando duas regras empatam, vence a última escrita. Mas e quando elas **não** empatam? Você já deve ter passado por isto: escreveu uma regra que parecia certinha e, mesmo assim, o estilo **não pegou** — outra regra, escrita bem antes, teimava em vencer. Isso não é bug: é a **especificidade** em ação.\n\nA especificidade é a etapa da cascata que decide o vencedor **pelo peso** do seletor, não pela ordem. Uma regra mais específica vence uma menos específica **mesmo que venha antes** no arquivo. Entender esse peso é o que finalmente te dá controle sobre o CSS.",
                    },
                    {
                        type: "quote",
                        value: "A **especificidade** é uma pontuação que o navegador dá a cada seletor para decidir quem vence quando duas regras miram o mesmo elemento. Quanto mais específico o seletor, maior o peso. A hierarquia é: **id** vale mais que **classe** (e atributo, e pseudo-classe), que por sua vez vale mais que **tag** (nome de elemento). E o mais importante: **peso vence ordem** — a regra mais específica ganha mesmo que apareça antes.",
                    },
                    {
                        type: "text",
                        value: "## Nem toda regra pesa o mesmo\n\nImagine duas regras brigando pela cor de um mesmo parágrafo. Uma mira pela tag, a outra pela classe. Repare que, de propósito, a regra da classe vem **antes** no arquivo:",
                    },
                    {
                        type: "code",
                        value: "/* A classe é mais específica, então ela vence... */\n.destaque {\n  color: red;\n}\n\n/* ...mesmo que esta regra de tag venha DEPOIS no arquivo */\np {\n  color: black;\n}",
                    },
                    {
                        type: "code",
                        value: '<p class="destaque">Este parágrafo fica VERMELHO, não preto.</p>',
                    },
                    {
                        type: "text",
                        value: "Esse exemplo é a alma da aula. Só pela ordem, `p { color: black }` venceria, porque vem depois. Mas o `.destaque` é **mais específico** (classe pesa mais que tag), e por isso o vermelho ganha. Grave isto: **peso vence ordem**. A ordem só é usada como desempate quando o peso é igual.",
                    },
                    {
                        type: "text",
                        value: '## O placar: (ids, classes, tags)\n\nPara comparar seletores, pense na especificidade como um **placar de três colunas**. Da esquerda (mais forte) para a direita (mais fraca):\n\n- **Coluna 1 — ids:** quantos seletores de **id** (`#algo`) o seu seletor tem.\n- **Coluna 2 — classes:** quantas **classes** (`.algo`), **seletores de atributo** (`[type="text"]`) e **pseudo-classes** (`:hover`) ele tem.\n- **Coluna 3 — tags:** quantos nomes de **tag** (`p`, `div`) e **pseudo-elementos** (`::before`) ele tem.\n\nPara saber quem vence, compare **coluna por coluna, da esquerda para a direita**. Um único id (placar `1-0-0`) vence qualquer quantidade de classes (`0-5-0`), que por sua vez vence qualquer quantidade de tags (`0-0-9`). É como comparar centenas, dezenas e unidades: a casa da esquerda manda primeiro.',
                    },
                    {
                        type: "table",
                        value: '[["Seletor","Ids","Classes","Tags","Placar"],["`p`","0","0","1","0-0-1"],["`.destaque`","0","1","0","0-1-0"],["`p.destaque`","0","1","1","0-1-1"],["`#topo`","1","0","0","1-0-0"],["`nav ul li a`","0","0","4","0-0-4"],["`#topo .menu a`","1","1","1","1-1-1"]]',
                    },
                    {
                        type: "text",
                        value: "## Calculando na prática\n\nVamos pontuar alguns seletores contando quantos ids, classes e tags cada um tem. É só somar por coluna:",
                    },
                    {
                        type: "code",
                        value: "/* 1 tag                   ->  placar 0-0-1 */\nli { }\n\n/* 2 tags                  ->  placar 0-0-2 */\nul li { }\n\n/* 1 classe + 1 tag        ->  placar 0-1-1 */\nli.ativo { }\n\n/* 1 id                    ->  placar 1-0-0  (sozinho, vence os três de cima) */\n#menu { }\n\n/* 1 id + 1 classe + 1 tag ->  placar 1-1-1 */\n#menu li.ativo { }",
                    },
                    {
                        type: "text",
                        value: 'Repare no `#menu` sozinho: com um único id ele faz `1-0-0` e **atropela** o `ul li.ativo` (que faz `0-1-2`), porque a comparação começa pela coluna dos ids, e ali o placar já é 1 contra 0. Não adianta o outro ter mais classes e tags: a coluna da esquerda decide primeiro. É justamente por isso que ids são tão "pesados" e, como veremos, tão perigosos de usar sem critério.',
                    },
                    {
                        type: "text",
                        value: "## Empate no placar? Aí a ordem decide\n\nE quando dois seletores têm **exatamente o mesmo placar**? Aí, e só aí, entra a regra da aula passada: vence a que aparece **por último** no CSS. A ordem é o último critério de desempate, acionado apenas quando a especificidade não resolveu.",
                    },
                    {
                        type: "code",
                        value: "/* Placar 0-1-0 */\n.aviso {\n  color: orange;\n}\n\n/* Também 0-1-0: empate! Como vem depois, é esta que vale */\n.destaque {\n  color: red;\n}",
                    },
                    {
                        type: "code",
                        value: '<p class="aviso destaque">Fico VERMELHO: houve empate no placar, e o vermelho vem por último.</p>',
                    },
                    {
                        type: "text",
                        value: '## Boas práticas para não virar bagunça\n\nEspecificidade mal cuidada é uma das maiores fontes de frustração no CSS: você escreve uma regra e ela "não pega" porque outra, mais específica, está vencendo em silêncio. Alguns hábitos evitam quase toda essa dor:\n\n- **Prefira classes.** Elas têm um peso equilibrado: fáceis de sobrepor quando preciso, mas específicas o bastante para mirar o que você quer. É a ferramenta do dia a dia.\n- **Evite estilizar por id.** Um id pesa muito no placar e é difícil de sobrepor depois. Reserve os ids para outras finalidades (âncoras, JavaScript) e estilize por classe.\n- **Fuja do `!important`.** Como vimos na aula passada, ele quebra a cascata e só empurra o problema para frente.\n- **Mantenha os seletores curtos.** Um `.card .titulo` é mais fácil de gerenciar do que um `body div.container article .card h2.titulo`. Seletores longos são específicos demais e viram uma dor para sobrepor.',
                    },
                    {
                        type: "table",
                        value: '[["Em vez de...","Prefira..."],["`#menu-principal { }` (id)","`.menu-principal { }` (classe)"],["`color: red !important;`","Ajustar o seletor para vencer no placar"],["`body .container ul li a.link`","`.link` (curto e direto)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet:** a **especificidade** decide o vencedor pelo **peso**, não pela ordem — a regra mais específica ganha mesmo vindo antes. Pense num placar de três colunas: **ids | classes (e atributos e pseudo-classes) | tags (e pseudo-elementos)**, comparado da esquerda para a direita. Um id (`1-0-0`) vence qualquer punhado de classes; classes vencem qualquer punhado de tags. **Empatou** no placar? Aí, sim, vence a última escrita. Na prática: **estilize por classe**, evite id e `!important`, e mantenha os seletores curtos.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Entre um seletor de tag, um de classe e um de id, qual tem a MAIOR especificidade (o maior peso)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O seletor de id.",
                                isCorrect: true,
                            },
                            {
                                text: "O seletor de classe.",
                                isCorrect: false,
                            },
                            {
                                text: "O seletor de tag.",
                                isCorrect: false,
                            },
                            {
                                text: "Todos têm exatamente o mesmo peso.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quando duas regras têm exatamente a mesma especificidade, qual critério decide o vencedor?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A ordem: vence a que aparece por último no CSS.",
                                isCorrect: true,
                            },
                            {
                                text: "O tamanho do arquivo: vence a que estiver no arquivo maior.",
                                isCorrect: false,
                            },
                            {
                                text: "O comprimento do nome: vence o seletor com mais letras.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma vence; as duas são descartadas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'No arquivo, a regra `.destaque { color: red }` vem ANTES de `p { color: black }`. Que cor fica um `<p class="destaque">`?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Vermelho, porque a classe é mais específica que a tag, e peso vence ordem.",
                                isCorrect: true,
                            },
                            {
                                text: "Preto, porque a regra da tag vem depois no arquivo.",
                                isCorrect: false,
                            },
                            {
                                text: "Preto, porque a tag sempre vence a classe.",
                                isCorrect: false,
                            },
                            {
                                text: "Cinza, porque as duas regras se anulam.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o placar de especificidade do seletor `#menu li.ativo`, na notação (ids, classes, tags)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "1-1-1 (um id, uma classe, uma tag).",
                                isCorrect: true,
                            },
                            {
                                text: "0-1-1 (nenhum id, uma classe, uma tag).",
                                isCorrect: false,
                            },
                            {
                                text: "3-0-0 (conta tudo como se fosse id).",
                                isCorrect: false,
                            },
                            {
                                text: "1-0-2 (um id e duas tags).",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você escreveu `.botao { background: green }`, mas o botão continua azul porque existe `#app .botao { background: blue }`. Qual é a melhor atitude, seguindo as boas práticas?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Reconhecer que `#app .botao` (1-1-0) é mais específico que `.botao` (0-1-0) e ajustar o seletor ou a estrutura para competir no mesmo nível, em vez de recorrer ao `!important`.",
                                isCorrect: true,
                            },
                            {
                                text: "Adicionar `!important` na sua regra, pois é a forma recomendada de resolver esses conflitos.",
                                isCorrect: false,
                            },
                            {
                                text: "Concluir que o CSS está quebrado, pois a última regra escrita deveria sempre vencer.",
                                isCorrect: false,
                            },
                            {
                                text: "Trocar o nome da propriedade de `background` para `background-color` para forçar a mudança.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Box model e unidades",
        aulas: [
            {
                titulo: "O box model",
                blocks: [
                    {
                        type: "text",
                        value: "# O box model\n\nBem-vindo ao Módulo 3! Até aqui você aprendeu a **pintar** os elementos: mudar cores, fontes e textos. Agora vamos aprender a **dar espaço e tamanho** a eles, e tudo começa por uma ideia simples e poderosa: no CSS, **cada elemento da página é uma caixa retangular**.\n\nUm título é uma caixa. Um parágrafo é uma caixa. Uma imagem, um botão, um link: todos são caixas. Quando você entende como essas caixas são construídas por dentro, o espaçamento e o alinhamento deixam de ser um mistério. Esse é o famoso **box model** (modelo de caixas), a base de todo o layout na web.",
                    },
                    {
                        type: "quote",
                        value: "No CSS, **todo elemento é uma caixa** formada por quatro camadas, de dentro para fora: o **conteúdo** (`content`), o **preenchimento** (`padding`), a **borda** (`border`) e a **margem** (`margin`). Entender essas quatro camadas é entender como o espaço funciona em uma página.",
                    },
                    {
                        type: "text",
                        value: "## A analogia do quadro na parede\n\nImagine um **quadro emoldurado** pendurado numa parede. Olhando de dentro para fora, você encontra, na mesma ordem, as quatro camadas do box model:\n\n- A **foto** dentro do quadro é o **conteúdo** (`content`): o texto ou a imagem de verdade.\n- O **paspatur**, aquela borda de papel entre a foto e a moldura, é o **preenchimento** (`padding`): um respiro **por dentro**, entre o conteúdo e a moldura.\n- A **moldura** de madeira é a **borda** (`border`): a linha que contorna a caixa.\n- O **espaço na parede** entre este quadro e o vizinho é a **margem** (`margin`): a distância **por fora**, que afasta uma caixa das outras.\n\nGuarde essa imagem. Toda vez que ficar em dúvida sobre padding e margin, volte para o quadro na parede.",
                    },
                    {
                        type: "code",
                        value: ".cartao {\n  /* o conteúdo tem 200px de largura */\n  width: 200px;\n\n  /* respiro interno, entre o texto e a borda */\n  padding: 20px;\n\n  /* a moldura da caixa */\n  border: 4px solid #333;\n\n  /* espaço externo, afastando o cartão dos vizinhos */\n  margin: 30px;\n}",
                    },
                    {
                        type: "text",
                        value: "## Camada 1: o conteúdo (`content`)\n\nO **conteúdo** é o miolo da caixa: o texto do parágrafo, a imagem, o rótulo do botão. É a única camada que existe **de verdade** desde o começo; as outras três são espaços que você adiciona ao redor dela.\n\nO tamanho dessa área é controlado principalmente pelas propriedades `width` (largura) e `height` (altura), que estudamos a fundo na próxima aula. Por enquanto, guarde só que o conteúdo é o **centro** de tudo, a foto dentro do quadro.",
                    },
                    {
                        type: "text",
                        value: '## Camada 2: o preenchimento (`padding`)\n\nO `padding` é o espaço **por dentro** da caixa, entre o conteúdo e a borda. Ele funciona como um **empurrão para dentro**: afasta o texto das paredes da caixa para o conteúdo não ficar grudado na borda.\n\nUm detalhe importante: o `padding` faz parte da caixa. Se a caixa tem cor de fundo, essa cor **também aparece na área do padding**. Por isso ele é ótimo para dar "ar" dentro de botões e cartões.',
                    },
                    {
                        type: "code",
                        value: ".botao {\n  background: #2563eb;\n  color: white;\n  /* 12px em cima e embaixo, 24px nas laterais */\n  padding: 12px 24px;\n}",
                    },
                    {
                        type: "text",
                        value: "## Camada 3: a borda (`border`)\n\nA `border` é a **moldura** da caixa: uma linha desenhada em volta do conteúdo e do padding. Para definir uma borda, você quase sempre informa três coisas de uma vez: a **espessura**, o **estilo** e a **cor**.",
                    },
                    {
                        type: "code",
                        value: ".caixa {\n  /* espessura | estilo | cor */\n  border: 2px solid #333;\n}\n\n/* também dá para escrever separado: */\n.outra-caixa {\n  border-width: 2px;\n  border-style: dashed;   /* solid, dashed, dotted... */\n  border-color: crimson;\n}",
                    },
                    {
                        type: "text",
                        value: "## Camada 4: a margem (`margin`)\n\nA `margin` é o espaço **por fora** da caixa: a distância entre a borda dela e os elementos vizinhos. Se o padding empurra o conteúdo para dentro, a margem **empurra os vizinhos para longe**.\n\nDiferente do padding, a margem é **sempre transparente**: ela não tem cor, é só espaço vazio. Serve para separar uma caixa da outra, como o espaço entre dois quadros na parede.",
                    },
                    {
                        type: "code",
                        value: ".paragrafo {\n  /* afasta este parágrafo 16px dos elementos de cima e de baixo */\n  margin: 16px 0;\n}",
                    },
                    {
                        type: "table",
                        value: '[["Camada","Onde fica","O que faz","No quadro na parede"],["`content`","No centro","O texto ou a imagem de verdade","A foto"],["`padding`","Entre o conteúdo e a borda","Respiro por dentro da caixa","O paspatur"],["`border`","Contornando a caixa","Desenha a moldura","A moldura de madeira"],["`margin`","Por fora da borda","Afasta a caixa dos vizinhos","O espaço na parede"]]',
                    },
                    {
                        type: "text",
                        value: "## Atalho: os quatro lados de uma vez\n\nTanto o `padding` quanto a `margin` podem receber valores diferentes para cada lado. Existe um **atalho** muito usado que define os quatro lados numa linha só. A ordem segue o sentido do relógio, começando pelo topo: **cima, direita, baixo, esquerda**.",
                    },
                    {
                        type: "code",
                        value: "/* 1 valor: os quatro lados iguais */\npadding: 20px;\n\n/* 2 valores: cima/baixo | esquerda/direita */\npadding: 10px 30px;\n\n/* 4 valores: cima | direita | baixo | esquerda (sentido horário) */\npadding: 10px 20px 30px 40px;",
                    },
                    {
                        type: "text",
                        value: '## A diferença entre `margin` e `padding`\n\nEssa é a dúvida número um de quem começa, então vale fixar. As duas propriedades criam espaço, mas em **lados opostos** da borda:\n\n- O `padding` cria espaço **por dentro** da borda (entre o conteúdo e a borda). Ele **aumenta a área colorida** da caixa e faz o conteúdo "respirar".\n- A `margin` cria espaço **por fora** da borda (entre a caixa e os vizinhos). Ela é **transparente** e serve para **separar** as caixas umas das outras.\n\nUma regra prática: quando quiser dar ar **dentro** de um botão ou cartão, use `padding`. Quando quiser **afastar** dois elementos um do outro, use `margin`.',
                    },
                    {
                        type: "code",
                        value: "/* Padding: o fundo azul cresce e o texto ganha respiro POR DENTRO */\n.cartao {\n  background: #dbeafe;\n  padding: 24px;\n}\n\n/* Margin: espaço transparente POR FORA, separando um cartão do outro */\n.cartao {\n  margin-bottom: 16px;\n}",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** todo elemento é uma **caixa** com quatro camadas, de dentro para fora: `content` (a foto), `padding` (o paspatur, espaço interno), `border` (a moldura) e `margin` (o espaço na parede, externo). O `padding` empurra o conteúdo **para dentro** e recebe a cor de fundo; a `margin` empurra os vizinhos **para fora** e é sempre transparente. No atalho de quatro valores, a ordem é **cima, direita, baixo, esquerda**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Quais são as quatro camadas do box model, na ordem de dentro para fora?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`content`, `padding`, `border`, `margin`",
                                isCorrect: true,
                            },
                            {
                                text: "`margin`, `border`, `padding`, `content`",
                                isCorrect: false,
                            },
                            {
                                text: "`padding`, `content`, `margin`, `border`",
                                isCorrect: false,
                            },
                            {
                                text: "`border`, `content`, `margin`, `padding`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na analogia do quadro na parede, o que representa a margem (`margin`)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O espaço na parede entre um quadro e o quadro vizinho.",
                                isCorrect: true,
                            },
                            {
                                text: "A foto dentro do quadro.",
                                isCorrect: false,
                            },
                            {
                                text: "A moldura de madeira.",
                                isCorrect: false,
                            },
                            {
                                text: "O paspatur, entre a foto e a moldura.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre `padding` e `margin`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O `padding` é o espaço interno (entre o conteúdo e a borda); a `margin` é o espaço externo (entre a caixa e os vizinhos).",
                                isCorrect: true,
                            },
                            {
                                text: "O `padding` é o espaço externo e a `margin` é o espaço interno.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois são exatamente a mesma coisa, só muda o nome.",
                                isCorrect: false,
                            },
                            {
                                text: "O `padding` só funciona no topo e a `margin` só nas laterais.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma caixa tem cor de fundo. Onde essa cor aparece em relação às camadas?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "No conteúdo e no `padding`, que fazem parte da caixa; a `margin` continua transparente.",
                                isCorrect: true,
                            },
                            {
                                text: "Na `margin`, que é a camada mais externa e visível.",
                                isCorrect: false,
                            },
                            {
                                text: "Só na borda, nunca no interior da caixa.",
                                isCorrect: false,
                            },
                            {
                                text: "Em nenhuma camada; cor de fundo não tem a ver com o box model.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No código `padding: 10px 20px 30px 40px;`, qual valor se aplica ao lado esquerdo?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "40px, porque a ordem do atalho é cima, direita, baixo e esquerda.",
                                isCorrect: true,
                            },
                            {
                                text: "10px, porque o primeiro valor é sempre a esquerda.",
                                isCorrect: false,
                            },
                            {
                                text: "20px, porque o segundo valor é a esquerda.",
                                isCorrect: false,
                            },
                            {
                                text: "30px, porque a ordem começa pela esquerda e vai até o topo.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "box-sizing e dimensões",
                blocks: [
                    {
                        type: "text",
                        value: '# box-sizing e dimensões\n\nNa aula passada você conheceu as quatro camadas da caixa. Agora vamos falar de **tamanho**: como definir a largura e a altura de um elemento com `width` e `height`, e por que, quando você faz isso, o resultado às vezes sai **maior do que você pediu**.\n\nEsse "susto" tem explicação, e a solução cabe em uma linha de CSS que praticamente todo projeto do mundo usa. Vamos entender de onde vem o problema para a solução fazer todo o sentido.',
                    },
                    {
                        type: "quote",
                        value: "Por padrão, o CSS usa `box-sizing: content-box`: o `width` mede **só o conteúdo**, e o `padding` e a `border` são **somados por fora**, deixando a caixa maior que o número que você escreveu. Trocar para `box-sizing: border-box` faz o `width` **incluir** o padding e a borda, então a caixa tem exatamente a largura pedida. É por isso que quase todo projeto começa com essa troca.",
                    },
                    {
                        type: "text",
                        value: "## `width` e `height`\n\nAs propriedades `width` (largura) e `height` (altura) definem o tamanho da **área de conteúdo** da caixa. O valor pode ser em pixels, em porcentagem e em várias outras unidades que veremos na última aula.",
                    },
                    {
                        type: "code",
                        value: ".caixa {\n  width: 300px;\n  height: 150px;\n  background: #dbeafe;\n}",
                    },
                    {
                        type: "text",
                        value: "## O problema do box model padrão\n\nAqui vem a pegadinha clássica. Por padrão, o navegador usa um modo chamado `content-box`, no qual o `width` mede **apenas o conteúdo**. O `padding` e a `border` são adicionados **por fora** desse valor.\n\nOu seja: se você pede uma caixa de `300px` e ainda coloca padding e borda, a caixa **de verdade** na tela fica maior que 300px. Veja o exemplo:",
                    },
                    {
                        type: "code",
                        value: ".caixa {\n  width: 300px;       /* só o conteúdo */\n  padding: 20px;      /* +20 de cada lado */\n  border: 5px solid;  /* +5 de cada lado */\n}",
                    },
                    {
                        type: "text",
                        value: '## Fazendo a conta\n\nNo exemplo acima, a largura que aparece na tela **não é** 300px. O navegador soma tudo o que está na horizontal:\n\n- `300px` do conteúdo\n- `+ 20px` de padding à esquerda `+ 20px` de padding à direita\n- `+ 5px` de borda à esquerda `+ 5px` de borda à direita\n\nTotal: **350px**. Você pediu 300, recebeu 350. Numa página com várias caixas lado a lado, esses 50px "invisíveis" bagunçam todo o layout, e o pior: é difícil perceber de onde vem o problema.',
                    },
                    {
                        type: "table",
                        value: '[["O que você escreveu","Valor","Entra na largura final?"],["`width`","300px","Sim (é o conteúdo)"],["`padding` (2 lados)","20px + 20px","Sim, somado por fora"],["`border` (2 lados)","5px + 5px","Sim, somado por fora"],["**Largura real na tela**","**350px**","O total de tudo"]]',
                    },
                    {
                        type: "text",
                        value: '## A solução: `box-sizing: border-box`\n\nA propriedade `box-sizing` controla **o que o `width` inclui**. Ela tem dois valores:\n\n- `content-box`: o padrão; o `width` mede só o conteúdo (o problema de cima).\n- `border-box`: o `width` passa a incluir o padding e a borda.\n\nCom `border-box`, quando você pede `width: 300px`, a caixa tem **exatamente 300px** na tela, sem susto. O padding e a borda são "descontados" **por dentro**, comendo espaço do conteúdo em vez de esticar a caixa.',
                    },
                    {
                        type: "code",
                        value: ".caixa {\n  box-sizing: border-box;\n  width: 300px;       /* a caixa inteira mede 300px */\n  padding: 20px;\n  border: 5px solid;\n  /* o conteúdo encolhe para 250px, mas o total continua 300px */\n}",
                    },
                    {
                        type: "text",
                        value: '## Por que praticamente todo mundo usa\n\nPensar "a caixa mede o que eu pedi" é muito mais intuitivo do que ficar somando padding e borda de cabeça. Por isso virou **costume universal** aplicar `border-box` em **todos** os elementos da página logo no início do CSS.\n\nIsso é feito com o seletor `*` (asterisco), que significa "todo elemento". Este pequeno trecho abre praticamente qualquer folha de estilo profissional:',
                    },
                    {
                        type: "code",
                        value: "* {\n  box-sizing: border-box;\n}",
                    },
                    {
                        type: "text",
                        value: "## Limites: `min-width`, `max-width` e companhia\n\nNem sempre você quer um tamanho fixo. Muitas vezes quer um tamanho que **se adapta**, mas dentro de **limites**. Para isso existem quatro propriedades:\n\n- `min-width`: a caixa nunca fica **mais estreita** que isso.\n- `max-width`: a caixa nunca fica **mais larga** que isso.\n- `min-height` e `max-height`: a mesma ideia, para a altura.\n\nO caso mais comum de todos é o `max-width`. Ele é o segredo por trás de textos que não ficam largos demais em telas grandes, mas ainda encolhem bem no celular.",
                    },
                    {
                        type: "code",
                        value: "/* O container ocupa toda a largura disponível... */\n/* ...mas nunca passa de 800px em telas grandes */\n.container {\n  width: 100%;\n  max-width: 800px;\n}\n\n/* Imagem que encolhe junto com a tela, sem estourar o layout */\nimg {\n  max-width: 100%;\n}",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** `width` e `height` definem o tamanho do conteúdo. No modo padrão (`content-box`), padding e borda são **somados por fora**, e a caixa fica maior que o `width` pedido. Trocar para `box-sizing: border-box` faz o `width` **já incluir** padding e borda, e por isso quase todo projeto começa com `* { box-sizing: border-box; }`. Para tamanhos flexíveis com limites, use `min-width`/`max-width` (e as versões de altura); `max-width` é o mais usado, ótimo para conteúdo responsivo.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual propriedade define a largura de um elemento?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`width`",
                                isCorrect: true,
                            },
                            {
                                text: "`length`",
                                isCorrect: false,
                            },
                            {
                                text: "`size`",
                                isCorrect: false,
                            },
                            {
                                text: "`margin`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual valor de `box-sizing` faz o `width` incluir o padding e a borda?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`border-box`",
                                isCorrect: true,
                            },
                            {
                                text: "`content-box`",
                                isCorrect: false,
                            },
                            {
                                text: "`padding-box`",
                                isCorrect: false,
                            },
                            {
                                text: "`full-box`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No modo padrão (`content-box`), uma caixa com `width: 200px`, `padding: 10px` e `border: 5px solid` ocupa qual largura na tela?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "230px (200 + 10 + 10 de padding + 5 + 5 de borda).",
                                isCorrect: true,
                            },
                            {
                                text: "200px, porque o `width` já é o tamanho final.",
                                isCorrect: false,
                            },
                            {
                                text: "215px (200 + 10 + 5).",
                                isCorrect: false,
                            },
                            {
                                text: "220px (200 + 10 + 10).",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que é tão comum começar o CSS com `* { box-sizing: border-box; }`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Para que toda caixa tenha exatamente a largura pedida, sem o padding e a borda esticando o tamanho.",
                                isCorrect: true,
                            },
                            {
                                text: "Para deixar todos os textos da página em negrito.",
                                isCorrect: false,
                            },
                            {
                                text: "Para remover as margens de todos os elementos.",
                                isCorrect: false,
                            },
                            {
                                text: "Para fazer a página carregar mais rápido no celular.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você quer um container que ocupe a largura disponível, mas nunca fique mais largo que 960px. Qual propriedade resolve isso?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`max-width: 960px` (junto com `width: 100%`), limitando o crescimento sem fixar o tamanho.",
                                isCorrect: true,
                            },
                            {
                                text: "`min-width: 960px`, que garante no mínimo 960px de largura.",
                                isCorrect: false,
                            },
                            {
                                text: "`width: 960px` fixo, que impede o container de encolher no celular.",
                                isCorrect: false,
                            },
                            {
                                text: "`height: 960px`, que controla a altura da caixa.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A propriedade display",
                blocks: [
                    {
                        type: "text",
                        value: "# A propriedade display\n\nVocê já reparou que alguns elementos ocupam a **linha inteira** (um parágrafo empurra o próximo para baixo), enquanto outros ficam **lado a lado** (várias palavras em negrito na mesma linha)? Isso não é coincidência: cada elemento tem um **comportamento de exibição** padrão, controlado pela propriedade `display`.\n\nEntender o `display` é entender **como os elementos se organizam** na página: quem quebra linha, quem fica ao lado de quem, quem some da tela. É uma das propriedades mais importantes de todo o CSS.",
                    },
                    {
                        type: "quote",
                        value: "A propriedade `display` define como um elemento se comporta no layout. Os três valores clássicos são `block` (ocupa a linha inteira e empilha), `inline` (fica na mesma linha, do tamanho do conteúdo) e `inline-block` (fica na linha como o inline, mas aceita largura, altura e padding como o block). Já `display: none` **remove** o elemento da página por completo.",
                    },
                    {
                        type: "text",
                        value: "## O fluxo normal do documento\n\nAntes de você mexer em qualquer coisa, o navegador já organiza os elementos numa ordem natural: de cima para baixo e, dentro de cada linha, da esquerda para a direita, na mesma sequência em que aparecem no HTML. Esse comportamento padrão tem um nome: **fluxo normal** do documento.\n\nÉ como um texto sendo digitado numa folha: as palavras vão preenchendo a linha e, quando o espaço acaba (ou quando começa um novo bloco), pulam para a linha de baixo. A propriedade `display` é justamente o que decide **como cada elemento participa desse fluxo**.",
                    },
                    {
                        type: "text",
                        value: "## Elementos `block`\n\nUm elemento **block** (de bloco) se comporta como um **tijolo**: ocupa **toda a largura disponível** da linha e empurra o próximo elemento para **baixo**. Ou seja, dois blocos nunca ficam lado a lado naturalmente; eles se **empilham**.\n\nElementos como `<div>`, `<p>`, `<h1>` e `<ul>` são block por padrão. Como ocupam a linha toda, você **pode** definir `width`, `height`, `margin` e `padding` neles à vontade.",
                    },
                    {
                        type: "code",
                        value: "<p>Primeiro parágrafo.</p>\n<p>Segundo parágrafo.</p>\n\n<!-- Cada <p> é block: ocupa a linha inteira, -->\n<!-- então o segundo aparece ABAIXO do primeiro. -->",
                    },
                    {
                        type: "text",
                        value: '## Elementos `inline`\n\nUm elemento **inline** (em linha) se comporta como uma **palavra** no meio de um texto: fica **na mesma linha** que o conteúdo ao redor e ocupa **apenas o espaço do seu conteúdo**, nem um pixel a mais. Vários elementos inline se acomodam lado a lado até a linha encher.\n\nElementos como `<a>` (link), `<strong>` (negrito) e `<span>` são inline por padrão. E aqui vem um detalhe importante: em elementos inline, o `width` e o `height` **são ignorados**. Faz sentido: não dá para definir a "largura" de uma palavra no meio de uma frase sem quebrar o texto.',
                    },
                    {
                        type: "code",
                        value: '<p>Este texto tem uma <strong>palavra em destaque</strong>\ne um <a href="#">link</a> na mesma linha.</p>',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","`block`","`inline`"],["Ocupa","A linha inteira","Só o tamanho do conteúdo"],["O elemento seguinte","Vai para baixo (empilha)","Fica ao lado (mesma linha)"],["Aceita `width` e `height`?","Sim","Não (são ignorados)"],["Exemplos","`<div>`, `<p>`, `<h1>`","`<a>`, `<strong>`, `<span>`"]]',
                    },
                    {
                        type: "text",
                        value: "## `inline-block`: o melhor dos dois mundos\n\nE se você quisesse elementos **lado a lado** (como o inline), mas que **aceitassem largura e altura** (como o block)? É exatamente isso que o `display: inline-block` faz.\n\nUm elemento inline-block fica na linha, ao lado dos vizinhos, mas se comporta como uma caixinha completa: respeita `width`, `height`, `padding` e `margin` nos quatro lados. É muito usado para criar coisas como botões, itens de menu e etiquetas que ficam em fileira.",
                    },
                    {
                        type: "code",
                        value: ".tag {\n  display: inline-block;\n  width: 80px;          /* agora o width É respeitado */\n  padding: 6px 12px;\n  margin: 4px;\n  background: #dbeafe;\n  text-align: center;\n}",
                    },
                    {
                        type: "code",
                        value: '<span class="tag">HTML</span>\n<span class="tag">CSS</span>\n<span class="tag">JS</span>\n\n<!-- As três etiquetas ficam lado a lado, -->\n<!-- cada uma com 80px de largura. -->',
                    },
                    {
                        type: "text",
                        value: '## Sumindo com elementos: `display: none` vs `visibility: hidden`\n\nExistem duas formas de "esconder" um elemento, e elas são **bem diferentes**. Confundir as duas é um erro clássico.\n\n- `display: none` **remove** o elemento por completo: ele some da tela **e não ocupa mais espaço nenhum**. É como se tivesse sido apagado do HTML, e os vizinhos se movem para ocupar o lugar dele.\n- `visibility: hidden` deixa o elemento **invisível, mas o espaço dele continua reservado**. É como um convidado invisível que ainda ocupa a cadeira: você não o vê, mas o lugar segue lá, vazio.',
                    },
                    {
                        type: "code",
                        value: "/* Some e libera o espaço: os vizinhos encostam */\n.oculto {\n  display: none;\n}\n\n/* Fica invisível, mas o buraco vazio permanece */\n.invisivel {\n  visibility: hidden;\n}",
                    },
                    {
                        type: "table",
                        value: '[["Comportamento","`display: none`","`visibility: hidden`"],["Aparece na tela?","Não","Não"],["Ocupa espaço?","Não (some por completo)","Sim (o lugar fica reservado)"],["Analogia","Apagado do HTML","Convidado invisível na cadeira"]]',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** o `display` define como o elemento participa do **fluxo normal**. `block` ocupa a linha inteira e empilha os vizinhos para baixo (aceita `width`/`height`); `inline` fica na mesma linha e ignora `width`/`height`; `inline-block` combina os dois: fica na linha e aceita dimensões. Para esconder: `display: none` remove o elemento **e o espaço dele**, enquanto `visibility: hidden` só o deixa invisível, **mantendo o espaço** reservado.",
                    },
                ],
                questions: [
                    {
                        statement: "Como se comporta um elemento com `display: block`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ocupa a linha inteira e empurra o elemento seguinte para baixo (empilha).",
                                isCorrect: true,
                            },
                            {
                                text: "Fica sempre na mesma linha que os vizinhos.",
                                isCorrect: false,
                            },
                            {
                                text: "Some da página e não ocupa espaço.",
                                isCorrect: false,
                            },
                            {
                                text: "Fica invisível, mas mantém o espaço reservado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual destes elementos é `inline` por padrão?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`<strong>`",
                                isCorrect: true,
                            },
                            {
                                text: "`<div>`",
                                isCorrect: false,
                            },
                            {
                                text: "`<p>`",
                                isCorrect: false,
                            },
                            {
                                text: "`<h1>`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a principal vantagem do `display: inline-block`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Fica na mesma linha que os vizinhos (como o inline) e, ao mesmo tempo, respeita `width` e `height` (como o block).",
                                isCorrect: true,
                            },
                            {
                                text: "Faz o elemento sumir da página sem ocupar espaço.",
                                isCorrect: false,
                            },
                            {
                                text: "Ocupa sempre a linha inteira, empilhando os vizinhos.",
                                isCorrect: false,
                            },
                            {
                                text: "Impede que o elemento receba qualquer padding ou margin.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a diferença entre `display: none` e `visibility: hidden`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`display: none` remove o elemento e o espaço dele; `visibility: hidden` o deixa invisível, mas mantém o espaço reservado.",
                                isCorrect: true,
                            },
                            {
                                text: "São idênticos: os dois removem o elemento e o espaço.",
                                isCorrect: false,
                            },
                            {
                                text: "`display: none` mantém o espaço; `visibility: hidden` remove tudo.",
                                isCorrect: false,
                            },
                            {
                                text: "`display: none` funciona só no celular; `visibility: hidden`, só no computador.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você definiu `width: 100px` em um `<span>`, mas a largura não muda. Por quê?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque `<span>` é inline por padrão, e elementos inline ignoram `width` e `height`; use `inline-block` (ou `block`) para o `width` valer.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque faltou um ponto e vírgula no final da regra.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a tag `<span>` não aceita nenhum estilo CSS.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque `width` só funciona em imagens.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Unidades no CSS",
                blocks: [
                    {
                        type: "text",
                        value: "# Unidades no CSS\n\nToda vez que você escreveu `padding: 20px` ou `width: 300px` nas aulas anteriores, usou uma **unidade de medida**: o `px`. Mas o `px` é só uma entre várias, e escolher a unidade certa faz uma diferença enorme, principalmente quando a página precisa funcionar bem tanto no computador quanto no celular.\n\nNesta aula você vai conhecer as unidades mais usadas do CSS e, mais importante, vai entender **quando usar cada uma**. Vamos dividi-las em dois grandes grupos: as **absolutas** e as **relativas**.",
                    },
                    {
                        type: "quote",
                        value: "As unidades **absolutas**, como o `px`, têm um tamanho **fixo**. As **relativas**, como `%`, `em`, `rem`, `vw` e `vh`, têm um tamanho que **depende de outra coisa** (do elemento pai, da fonte raiz ou do tamanho da tela). Unidades relativas são a chave para páginas que se **adaptam** a qualquer tela.",
                    },
                    {
                        type: "text",
                        value: '## Unidades absolutas: o `px`\n\nUma unidade **absoluta** vale sempre a mesma coisa, não importa o contexto. A mais usada de longe é o **pixel** (`px`). Pense no `px` como um "pontinho" na tela: `16px` de altura é sempre `16px`, aqui e em qualquer outro lugar.\n\nO `px` é **previsível** e ótimo para coisas que devem ter um tamanho exato: a espessura de uma borda, um pequeno espaçamento, o raio de um cantinho arredondado. A desvantagem é que ele **não se adapta**: se o usuário aumenta a fonte do navegador, um texto em `px` teima em não acompanhar.',
                    },
                    {
                        type: "code",
                        value: ".caixa {\n  border: 2px solid #333;   /* borda fina e exata */\n  border-radius: 8px;        /* cantos arredondados */\n  padding: 16px;\n}",
                    },
                    {
                        type: "text",
                        value: '## Unidades relativas\n\nUma unidade **relativa** não tem um tamanho próprio: ela é calculada **em relação a alguma referência**. Muda a referência, muda o tamanho. É isso que as torna tão poderosas para layouts flexíveis. Vamos às quatro mais importantes.\n\n## `%` (porcentagem)\n\nA porcentagem é relativa ao **elemento pai**. Um `width: 50%` significa "metade da largura do elemento que me contém". Se o pai for mais largo, o filho acompanha; se for mais estreito, o filho encolhe junto.',
                    },
                    {
                        type: "code",
                        value: "/* Esta coluna sempre ocupa metade do espaço do pai */\n.coluna {\n  width: 50%;\n}",
                    },
                    {
                        type: "text",
                        value: '## `em`: relativa à fonte do elemento\n\nA unidade `em` é relativa ao **tamanho da fonte** do próprio elemento. Se a fonte de um elemento é `16px`, então `1em` vale `16px`, `2em` vale `32px`, `1.5em` vale `24px`, e assim por diante. É ótima para espaçamentos que devem **acompanhar o tamanho do texto**: um botão com `padding: 1em` mantém a proporção, quer a fonte seja grande, quer seja pequena.\n\nO `em` tem uma pegadinha: ele **se acumula** quando os elementos estão aninhados. Se um elemento pai já aumentou a fonte, o `em` do filho parte desse valor maior, o que pode fazer os tamanhos "crescerem em cascata" sem querer.',
                    },
                    {
                        type: "code",
                        value: ".botao {\n  font-size: 20px;\n  /* 1.5em = 1.5 x 20px = 30px de padding */\n  padding: 1.5em;\n}",
                    },
                    {
                        type: "text",
                        value: '## `rem`: relativa à fonte raiz\n\nO `rem` (de _root em_, "em da raiz") resolve a pegadinha do acúmulo. Em vez de olhar para a fonte do próprio elemento, ele sempre olha para a fonte do elemento **raiz**, o `<html>`. Como essa referência é **única e fixa** para a página inteira, `1rem` vale o mesmo em qualquer lugar, esteja o elemento aninhado onde estiver.\n\nPor padrão, a fonte raiz dos navegadores é `16px`, então `1rem = 16px`, `1.5rem = 24px` e `2rem = 32px`. Essa previsibilidade fez do `rem` a unidade preferida para **tamanhos de fonte e espaçamentos** em projetos modernos.',
                    },
                    {
                        type: "code",
                        value: "html {\n  font-size: 16px;   /* a referência de 1rem */\n}\n\nh1    { font-size: 2rem; }     /* 32px, sempre */\np     { font-size: 1rem; }     /* 16px, sempre */\nsmall { font-size: 0.875rem; } /* 14px, sempre */",
                    },
                    {
                        type: "text",
                        value: "## A diferença entre `em` e `rem`\n\nOs dois olham para o tamanho de uma fonte, mas para **fontes diferentes**:\n\n- `em` é relativo à fonte do **próprio elemento**. Por isso ele **acumula** em elementos aninhados.\n- `rem` é relativo à fonte do elemento **raiz** (`<html>`), que é sempre a mesma. Por isso ele **não acumula**: é estável e previsível.\n\nNa dúvida, comece com `rem`: ele evita surpresas. Deixe o `em` para quando você **quer** que o tamanho acompanhe a fonte local, como o padding interno de um botão.",
                    },
                    {
                        type: "table",
                        value: '[["Unidade","Relativa a...","Acumula no aninhamento?","Boa para..."],["`em`","A fonte do próprio elemento","Sim","Espaços que seguem a fonte local"],["`rem`","A fonte da raiz (`<html>`)","Não","Fontes e espaçamentos previsíveis"]]',
                    },
                    {
                        type: "text",
                        value: "## `vw` e `vh`: relativas ao tamanho da tela\n\nAs unidades `vw` e `vh` são relativas ao tamanho da **janela do navegador** (a _viewport_, a área visível da tela):\n\n- `vw` (_viewport width_): `1vw` = 1% da **largura** da janela; `100vw` é a largura inteira.\n- `vh` (_viewport height_): `1vh` = 1% da **altura** da janela; `100vh` é a altura inteira.\n\nSão perfeitas para elementos que devem ocupar uma fração da tela independentemente do conteúdo, como uma seção de destaque que preenche a tela toda (`height: 100vh`).",
                    },
                    {
                        type: "code",
                        value: "/* Seção que ocupa exatamente a altura inteira da tela */\n.destaque {\n  height: 100vh;\n}\n\n/* Título cujo tamanho acompanha a largura da janela */\n.titulo-gigante {\n  font-size: 5vw;\n}",
                    },
                    {
                        type: "table",
                        value: '[["Unidade","Tipo","Relativa a...","Quando usar"],["`px`","Absoluta","Nada (tamanho fixo)","Bordas, raios, detalhes exatos"],["`%`","Relativa","O elemento pai","Larguras de colunas e containers"],["`em`","Relativa","A fonte do elemento","Espaços que seguem a fonte local"],["`rem`","Relativa","A fonte da raiz","Fontes e espaçamentos previsíveis"],["`vw` / `vh`","Relativa","A largura/altura da tela","Seções em tela cheia"]]',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** unidades **absolutas** (`px`) têm tamanho fixo, ótimas para bordas e detalhes exatos. As **relativas** se adaptam: `%` é relativa ao **pai**; `em`, à fonte do **próprio elemento** (e por isso **acumula** no aninhamento); `rem`, à fonte da **raiz** (`<html>`), estável e sem acúmulo; `vw`/`vh`, ao tamanho da **tela**. A regra prática: `rem` para fontes e espaços, `%` e `vw`/`vh` para larguras e seções, `px` para os detalhes que precisam ser exatos.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual destas é uma unidade absoluta, de tamanho fixo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`px`",
                                isCorrect: true,
                            },
                            {
                                text: "`%`",
                                isCorrect: false,
                            },
                            {
                                text: "`rem`",
                                isCorrect: false,
                            },
                            {
                                text: "`vw`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A que se refere `1vh`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "1% da altura da janela do navegador (viewport).",
                                isCorrect: true,
                            },
                            {
                                text: "1% da largura da janela do navegador.",
                                isCorrect: false,
                            },
                            {
                                text: "Ao tamanho da fonte do elemento raiz.",
                                isCorrect: false,
                            },
                            {
                                text: "À largura do elemento pai.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No código `width: 50%`, a porcentagem é calculada em relação a quê?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "À largura do elemento pai (o que contém esse elemento).",
                                isCorrect: true,
                            },
                            {
                                text: "Ao tamanho total da tela, sempre.",
                                isCorrect: false,
                            },
                            {
                                text: "À fonte do elemento raiz `<html>`.",
                                isCorrect: false,
                            },
                            {
                                text: "A um valor fixo de 500px.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre `em` e `rem`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`em` é relativo à fonte do próprio elemento (e acumula no aninhamento); `rem` é relativo à fonte da raiz `<html>` (e não acumula).",
                                isCorrect: true,
                            },
                            {
                                text: "São exatamente iguais; só muda a forma de escrever.",
                                isCorrect: false,
                            },
                            {
                                text: "`rem` é uma unidade absoluta e `em` é relativa.",
                                isCorrect: false,
                            },
                            {
                                text: "`em` só funciona em fontes e `rem` só em margens.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Com a fonte raiz no padrão de 16px, quanto vale `1.5rem`?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "24px (1,5 x 16px).",
                                isCorrect: true,
                            },
                            {
                                text: "16px, porque `rem` ignora o número.",
                                isCorrect: false,
                            },
                            {
                                text: "1,5px, tomando o valor ao pé da letra.",
                                isCorrect: false,
                            },
                            {
                                text: "32px (2 x 16px).",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Tipografia, backgrounds e bordas",
        aulas: [
            {
                titulo: "Tipografia",
                blocks: [
                    {
                        type: "text",
                        value: "# Tipografia\n\nBem-vindo ao Módulo 4! A partir de agora a gente começa a deixar as páginas **bonitas** de verdade. E não existe ponto de partida melhor do que a **tipografia**, ou seja, o cuidado com a aparência das **letras**.\n\nPode parecer um detalhe pequeno, mas é uma das coisas que mais mudam a cara de um site. A fonte certa passa profissionalismo; a fonte errada afasta o visitante antes mesmo de ele ler a primeira frase. Nesta aula você vai aprender a escolher a fonte, ajustar o tamanho, a espessura e o estilo do texto, tudo com CSS.",
                    },
                    {
                        type: "quote",
                        value: "**Tipografia** é a aparência do texto. Com CSS você controla **qual** fonte usar (`font-family`), o **tamanho** das letras (`font-size`), a **espessura** ou peso (`font-weight`) e se o texto é inclinado (`font-style`). Como nem todo computador tem todas as fontes, você lista uma **pilha de fontes** com alternativas de reserva, e ainda pode carregar fontes da web com o Google Fonts.",
                    },
                    {
                        type: "text",
                        value: "## O que é uma fonte\n\nUma **fonte** (ou família tipográfica) é o **conjunto de desenhos das letras**, números e símbolos. Arial, Times New Roman e Courier são exemplos que você provavelmente já ouviu falar. Cada uma tem uma personalidade própria.\n\nAs fontes costumam ser separadas em três grandes grupos:\n\n- **Serifadas** (_serif_): têm uns pezinhos nas pontas das letras, como a Times New Roman. Passam um ar clássico, de jornal e livro.\n- **Sem serifa** (_sans-serif_): não têm esses pezinhos, como a Arial. Têm um visual limpo e moderno, muito usado na web.\n- **Monoespaçadas** (_monospace_): todas as letras ocupam a **mesma largura**, como a Courier. São a cara de código de programação.\n\nNão precisa decorar isso agora. Só guarde que existem estilos diferentes e que a escolha da fonte dá o tom de voz da sua página.",
                    },
                    {
                        type: "text",
                        value: "## `font-family`: escolhendo a fonte\n\nA propriedade `font-family` diz **qual fonte** o texto deve usar. Você poderia imaginar que basta escrever o nome de uma fonte e pronto, mas tem um detalhe importante: a fonte precisa **estar instalada no computador do visitante** para o navegador conseguir mostrá-la. E você não tem como garantir isso.\n\nA solução é listar **várias fontes**, separadas por vírgula, formando uma **pilha de fontes** (_font stack_). O navegador tenta a primeira; se não tiver, passa para a segunda; e assim por diante, até achar uma que exista.",
                    },
                    {
                        type: "code",
                        value: "/* O navegador tenta Arial; se não houver, tenta Helvetica; */\n/* por fim, usa qualquer fonte sem serifa disponível.         */\nbody {\n  font-family: Arial, Helvetica, sans-serif;\n}",
                    },
                    {
                        type: "text",
                        value: '## Sempre termine com uma família genérica\n\nRepare que o **último** item da pilha do exemplo é `sans-serif`. Esse não é o nome de uma fonte específica, e sim de uma **família genérica**: um pedido do tipo "se não achou nenhuma das anteriores, use **qualquer** fonte sem serifa que você tiver". É a sua rede de segurança, então **sempre** feche a pilha com uma genérica (`serif`, `sans-serif` ou `monospace`).\n\nMais um detalhe de sintaxe: nomes de fonte com **espaços** precisam vir entre **aspas**. Escreva `"Times New Roman"`, e não `Times New Roman` solto.',
                    },
                    {
                        type: "code",
                        value: '/* Nomes com espaco vao entre aspas. */\nh1 {\n  font-family: "Times New Roman", Georgia, serif;\n}\n\ncode {\n  font-family: "Courier New", monospace;\n}',
                    },
                    {
                        type: "table",
                        value: '[["Família genérica","Como é","Exemplo de fonte","Boa para"],["`serif`","Tem pezinhos nas letras","Times New Roman, Georgia","Textos longos, ar clássico"],["`sans-serif`","Traços limpos, sem pezinhos","Arial, Helvetica","Telas e interfaces modernas"],["`monospace`","Todas as letras com a mesma largura","Courier New, Consolas","Mostrar código"]]',
                    },
                    {
                        type: "text",
                        value: "## `font-size`: o tamanho da letra\n\nA propriedade `font-size` define o **tamanho** do texto. A unidade mais comum para começar é o **pixel**, escrito `px`. Quanto maior o número, maior a letra.\n\nNa maioria dos navegadores, o texto normal já vem com `16px` por padrão. A partir daí, você aumenta os títulos e ajusta o resto ao seu gosto.",
                    },
                    {
                        type: "code",
                        value: "h1 {\n  font-size: 32px;\n}\n\np {\n  font-size: 16px;\n}\n\nsmall {\n  font-size: 12px;\n}",
                    },
                    {
                        type: "text",
                        value: "## `font-weight`: a espessura do traço\n\nA propriedade `font-weight` controla a **espessura** (o peso) das letras, o famoso **negrito**. Você pode usar palavras ou números:\n\n- `normal`: o peso comum (equivale ao número `400`).\n- `bold`: negrito (equivale a `700`).\n- Números de `100` a `900`, de 100 em 100: quanto maior, mais grossa a letra. Nem toda fonte oferece todos esses pesos.\n\nOu seja, `font-weight: bold` e `font-weight: 700` fazem a mesma coisa.",
                    },
                    {
                        type: "code",
                        value: "h1 {\n  font-weight: bold;   /* o mesmo que 700 */\n}\n\n.destaque {\n  font-weight: 600;    /* um pouco mais grosso que o normal */\n}\n\np {\n  font-weight: normal; /* o mesmo que 400 */\n}",
                    },
                    {
                        type: "text",
                        value: "## `font-style`: o texto inclinado\n\nA propriedade `font-style` serve principalmente para deixar o texto em **itálico** (aquele estilo inclinado, usado em citações e títulos de obras). Os valores que você vai usar no dia a dia são dois:\n\n- `normal`: texto em pé, o padrão.\n- `italic`: texto inclinado.",
                    },
                    {
                        type: "code",
                        value: "em {\n  font-style: italic;\n}\n\nblockquote {\n  font-style: italic;\n}",
                    },
                    {
                        type: "text",
                        value: "## Fontes da web com o Google Fonts\n\nE se você quiser usar uma fonte bonita que quase ninguém tem instalada? A resposta são as **fontes da web**: fontes que o navegador **baixa** junto com a página. O serviço mais popular para isso é o **Google Fonts**, que é gratuito.\n\nO passo a passo é simples:\n\n1. Acesse `fonts.google.com` e escolha uma fonte (por exemplo, a **Roboto**).\n2. O site te dá um trecho de `<link>` para colar dentro do `<head>` do seu HTML.\n3. Depois é só usar o nome da fonte normalmente no `font-family`.",
                    },
                    {
                        type: "code",
                        value: '<!-- No <head> do seu HTML: carrega a fonte Roboto do Google Fonts -->\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">',
                    },
                    {
                        type: "code",
                        value: '/* Agora a fonte Roboto esta disponivel para usar no CSS. */\n/* Mantemos Arial e sans-serif como reserva, por seguranca. */\nbody {\n  font-family: "Roboto", Arial, sans-serif;\n}',
                    },
                    {
                        type: "text",
                        value: "Repare que, mesmo usando uma fonte da web, eu mantive `Arial, sans-serif` no fim da pilha. É a mesma ideia de reserva de antes: se por algum motivo a Roboto não carregar (internet lenta, por exemplo), o texto ainda aparece numa fonte parecida em vez de quebrar.",
                    },
                    {
                        type: "text",
                        value: "## O atalho `font`\n\nEscrever `font-family`, `font-size`, `font-weight` e `font-style` em linhas separadas funciona, mas dá para juntar tudo em uma linha só com o atalho `font`. Ele reúne várias propriedades da fonte de uma vez.\n\nDuas regras para não errar:\n\n- A ordem geral é: `font-style`, `font-weight`, `font-size` e, por último, a `font-family`.\n- O `font-size` e a `font-family` são **obrigatórios**; o resto é opcional.",
                    },
                    {
                        type: "code",
                        value: '/* Longo: uma propriedade por linha */\np {\n  font-style: italic;\n  font-weight: bold;\n  font-size: 16px;\n  font-family: "Roboto", sans-serif;\n}\n\n/* Curto: tudo no atalho font (mesmo resultado) */\np {\n  font: italic bold 16px "Roboto", sans-serif;\n}',
                    },
                    {
                        type: "quote",
                        value: "**Resumo:** `font-family` recebe uma **pilha de fontes** separadas por vírgula (o navegador usa a primeira que existir) e deve terminar numa **família genérica** como `sans-serif`. `font-size` define o tamanho (em `px`), `font-weight` a espessura (`normal`/`bold` ou `100` a `900`) e `font-style` o itálico. Para fontes que o visitante talvez não tenha, use o **Google Fonts** com um `<link>` no `<head>`. E o atalho `font` junta tudo, sendo `font-size` e `font-family` obrigatórios.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Na pilha `font-family: Arial, Helvetica, sans-serif;`, para que serve o último item, `sans-serif`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "É uma família genérica de reserva: se nenhuma das fontes anteriores existir, o navegador usa qualquer fonte sem serifa disponível.",
                                isCorrect: true,
                            },
                            {
                                text: "É o nome da fonte principal que sempre será usada.",
                                isCorrect: false,
                            },
                            {
                                text: "Define o tamanho da fonte.",
                                isCorrect: false,
                            },
                            {
                                text: "Faz o texto ficar em negrito.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual propriedade controla a espessura (o negrito) das letras?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`font-weight`",
                                isCorrect: true,
                            },
                            {
                                text: "`font-size`",
                                isCorrect: false,
                            },
                            {
                                text: "`font-style`",
                                isCorrect: false,
                            },
                            {
                                text: "`text-align`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que costumamos listar mais de uma fonte no `font-family`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque a fonte precisa existir no computador do visitante; a lista funciona como um plano B, e o navegador usa a primeira que estiver disponível.",
                                isCorrect: true,
                            },
                            {
                                text: "Para o texto aparecer em várias fontes ao mesmo tempo.",
                                isCorrect: false,
                            },
                            {
                                text: "Para deixar a página mais pesada e bonita.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o CSS exige no mínimo três fontes em toda regra.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para usar uma fonte do Google Fonts na sua página, o que você precisa fazer?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Adicionar o `<link>` da fonte no `<head>` do HTML e depois usar o nome dela no `font-family`.",
                                isCorrect: true,
                            },
                            {
                                text: "Instalar a fonte no computador de cada visitante manualmente.",
                                isCorrect: false,
                            },
                            {
                                text: "Nada; toda fonte do Google já vem disponível em qualquer site.",
                                isCorrect: false,
                            },
                            {
                                text: "Escrever o nome da fonte apenas no `<title>` da página.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'No atalho `font: italic bold 16px "Roboto", sans-serif;`, quais valores são obrigatórios?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O tamanho (`font-size`) e a família (`font-family`); o estilo e o peso são opcionais.",
                                isCorrect: true,
                            },
                            {
                                text: "Todos os quatro valores são obrigatórios, sempre.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas o estilo (`italic`).",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum; o atalho `font` funciona vazio.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Propriedades de texto",
                blocks: [
                    {
                        type: "text",
                        value: "# Propriedades de texto\n\nNa aula anterior você deu um rosto às letras escolhendo a fonte. Agora vamos **organizar** esse texto na página: o espaço entre as linhas, o alinhamento, os sublinhados, as maiúsculas e por aí vai.\n\nEssas propriedades parecem pequenas, mas juntas fazem toda a diferença na **legibilidade**, ou seja, no quanto o texto é confortável de ler. Um texto bem espaçado convida à leitura; um texto apertado cansa e afasta.",
                    },
                    {
                        type: "quote",
                        value: "Estas propriedades cuidam de **como o texto se distribui**: `line-height` controla o espaço entre as linhas (a entrelinha), `letter-spacing` e `word-spacing` o espaço entre letras e palavras, `text-align` o alinhamento, `text-decoration` os sublinhados e riscos, `text-transform` as maiúsculas e minúsculas, e `text-indent` o recuo da primeira linha. O grande objetivo de todas elas é a **legibilidade**.",
                    },
                    {
                        type: "text",
                        value: '## `line-height`: o espaço entre as linhas\n\nA propriedade `line-height` define a **altura de cada linha** de texto, ou seja, o espaço da **entrelinha**. Pense num caderno: se as linhas ficam muito coladas umas nas outras, a leitura fica sufocante; se ficam arejadas demais, o texto se perde. O ponto de equilíbrio deixa a leitura leve.\n\nA forma recomendada de definir esse valor é com um **número puro** (sem unidade), que funciona como um **multiplicador** do tamanho da fonte. Um `line-height: 1.5` significa "uma vez e meia a altura da fonte", um valor confortável para textos de leitura.',
                    },
                    {
                        type: "code",
                        value: "body {\n  font-size: 16px;\n  line-height: 1.5;  /* 1,5 x o tamanho da fonte = 24px por linha */\n}",
                    },
                    {
                        type: "text",
                        value: "Você também pode usar um valor fixo, como `line-height: 24px`, mas o número puro costuma ser melhor: ele **se ajusta sozinho** se você mudar o `font-size` depois. Para blocos de texto corrido, algo entre `1.4` e `1.6` é uma escolha segura.",
                    },
                    {
                        type: "text",
                        value: "## `letter-spacing` e `word-spacing`\n\nEssas duas propriedades ajustam o espaço **horizontal** do texto:\n\n- `letter-spacing`: o espaço **entre as letras**.\n- `word-spacing`: o espaço **entre as palavras**.\n\nUse com moderação. Um leve `letter-spacing` pode dar um ar elegante a um título em maiúsculas, mas exageros deixam o texto difícil de ler. Os valores costumam vir em `px` e aceitam números negativos, que **aproximam** as letras.",
                    },
                    {
                        type: "code",
                        value: "h1 {\n  text-transform: uppercase;\n  letter-spacing: 2px;   /* afasta um pouco as letras do titulo */\n}\n\n.esticado {\n  word-spacing: 8px;     /* mais espaco entre as palavras */\n}",
                    },
                    {
                        type: "text",
                        value: "## `text-align`: o alinhamento horizontal\n\nA propriedade `text-align` decide como o texto se alinha na **horizontal**, dentro do seu espaço. Os quatro valores mais usados são:\n\n- `left`: alinhado à **esquerda** (o padrão em português).\n- `right`: alinhado à **direita**.\n- `center`: **centralizado**.\n- `justify`: **justificado**, quando o texto estica para encostar nas duas margens, como em jornais.",
                    },
                    {
                        type: "code",
                        value: "h1 {\n  text-align: center;\n}\n\n.data {\n  text-align: right;\n}\n\np {\n  text-align: justify;\n}",
                    },
                    {
                        type: "table",
                        value: '[["Valor","O que faz","Quando usar"],["`left`","Alinha à esquerda","Textos em geral (padrão)"],["`right`","Alinha à direita","Datas, números, detalhes"],["`center`","Centraliza","Títulos, chamadas curtas"],["`justify`","Estica até as duas margens","Blocos longos, estilo jornal"]]',
                    },
                    {
                        type: "text",
                        value: "## `text-decoration`: linhas no texto\n\nA propriedade `text-decoration` adiciona (ou remove) **linhas** no texto. Os valores mais comuns:\n\n- `underline`: **sublinhado**.\n- `line-through`: texto **riscado** (aquele risco no meio, útil para mostrar um preço antigo).\n- `overline`: uma linha **acima** do texto.\n- `none`: **nenhuma** linha.\n\nO uso mais frequente no dia a dia é justamente o `none`: os links (`<a>`) já vêm sublinhados por padrão, e muita gente prefere **tirar** esse sublinhado.",
                    },
                    {
                        type: "code",
                        value: "/* Remove o sublinhado padrao dos links */\na {\n  text-decoration: none;\n}\n\n/* Preco antigo, riscado */\n.preco-antigo {\n  text-decoration: line-through;\n}",
                    },
                    {
                        type: "text",
                        value: "## `text-transform`: a caixa das letras\n\nA propriedade `text-transform` muda a **caixa** (maiúsculas ou minúsculas) do texto **na exibição**, sem que você precise reescrever nada no HTML. Os valores:\n\n- `uppercase`: TUDO EM MAIÚSCULAS.\n- `lowercase`: tudo em minúsculas.\n- `capitalize`: A Primeira Letra De Cada Palavra Em Maiúscula.\n- `none`: mantém como está escrito.\n\nUm detalhe importante: isso é só **visual**. O texto de verdade, lá no HTML, continua igual; o que muda é apenas como ele aparece na tela. Isso é ótimo, porque você escreve o conteúdo normalmente e decide a aparência no CSS.",
                    },
                    {
                        type: "code",
                        value: "h1 {\n  text-transform: uppercase;   /* MOSTRA EM MAIUSCULAS */\n}\n\n.nome {\n  text-transform: capitalize;  /* Primeira Letra Maiuscula */\n}",
                    },
                    {
                        type: "text",
                        value: "## `text-indent`: o recuo da primeira linha\n\nA propriedade `text-indent` cria um **recuo na primeira linha** de um parágrafo, aquele espacinho que empurra o começo do texto para a direita, como se vê em muitos livros impressos. É um toque clássico para textos longos.",
                    },
                    {
                        type: "code",
                        value: "p {\n  text-indent: 40px;  /* empurra o inicio da 1a linha em 40px */\n}",
                    },
                    {
                        type: "quote",
                        value: "**Resumo:** para um texto legível, comece com um `line-height` folgado (por volta de `1.5`). Ajuste o espaçamento com `letter-spacing` (entre letras) e `word-spacing` (entre palavras), sempre com moderação. Alinhe com `text-align` (`left`, `right`, `center`, `justify`). Use `text-decoration: none` para tirar o sublinhado dos links, `text-transform` para controlar maiúsculas/minúsculas **só na exibição**, e `text-indent` para recuar a primeira linha do parágrafo.",
                    },
                ],
                questions: [
                    {
                        statement: "O que a propriedade `line-height` controla?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O espaço entre as linhas do texto (a entrelinha).",
                                isCorrect: true,
                            },
                            {
                                text: "A cor do texto.",
                                isCorrect: false,
                            },
                            {
                                text: "O espaço entre as letras.",
                                isCorrect: false,
                            },
                            {
                                text: "O tamanho da fonte.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual regra remove o sublinhado padrão de um link?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`a { text-decoration: none; }`",
                                isCorrect: true,
                            },
                            {
                                text: "`a { text-transform: none; }`",
                                isCorrect: false,
                            },
                            {
                                text: "`a { font-style: normal; }`",
                                isCorrect: false,
                            },
                            {
                                text: "`a { text-align: none; }`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao aplicar `text-transform: uppercase` a um título, o que acontece com o texto escrito no HTML?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Nada muda no HTML; a mudança para maiúsculas é apenas visual, na hora de exibir.",
                                isCorrect: true,
                            },
                            {
                                text: "O texto no HTML é reescrito em maiúsculas permanentemente.",
                                isCorrect: false,
                            },
                            {
                                text: "O texto some do HTML e vira uma imagem.",
                                isCorrect: false,
                            },
                            {
                                text: "O navegador apaga as letras minúsculas do arquivo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que significa `text-align: justify`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O texto é esticado para encostar nas duas margens, como nas colunas de jornal.",
                                isCorrect: true,
                            },
                            {
                                text: "O texto fica centralizado na página.",
                                isCorrect: false,
                            },
                            {
                                text: "O texto é alinhado apenas à direita.",
                                isCorrect: false,
                            },
                            {
                                text: "Cada palavra fica em uma linha separada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um bloco de texto está com as linhas muito coladas e cansativo de ler. Qual ajuste melhora mais diretamente a legibilidade?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Aumentar o `line-height` para um valor mais folgado, como `1.5`, dando mais respiro entre as linhas.",
                                isCorrect: true,
                            },
                            {
                                text: "Diminuir o `line-height` para `1`, colando ainda mais as linhas.",
                                isCorrect: false,
                            },
                            {
                                text: "Aplicar `text-decoration: underline` em todo o parágrafo.",
                                isCorrect: false,
                            },
                            {
                                text: "Trocar o `text-align` para `right`.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Backgrounds",
                blocks: [
                    {
                        type: "text",
                        value: "# Backgrounds\n\nAté aqui a gente cuidou do texto. Agora vamos olhar para **trás** dele, para o **fundo** dos elementos. Em inglês, fundo é _background_, e é assim que a propriedade se chama.\n\nO fundo é como o **papel de parede** de um cômodo: fica atrás de tudo e define boa parte do clima do ambiente. Um fundo pode ser uma cor sólida, uma imagem ou até uma transição suave de cores (um gradiente). Nesta aula você vai aprender a controlar todos eles.",
                    },
                    {
                        type: "quote",
                        value: "O fundo de um elemento pode ser uma **cor** (`background-color`), uma **imagem** (`background-image` com `url()`) ou um **gradiente** (`linear-gradient()`). Sobre a imagem de fundo você controla o **tamanho** (`background-size`), a **posição** (`background-position`) e se ela **se repete** (`background-repeat`). E o atalho `background` junta tudo isso em uma linha só.",
                    },
                    {
                        type: "text",
                        value: "## `background-color`: a cor de fundo\n\nA forma mais simples de fundo é uma **cor sólida**, definida com `background-color`. Você provavelmente já viu as maneiras de escrever uma cor em CSS; todas valem aqui:\n\n- por **nome**: `red`, `white`, `black`, `steelblue`...\n- em **hexadecimal**: `#ff0000`, `#ffffff`, `#333`...\n- em **RGB**: `rgb(255, 0, 0)`.\n\nEscolha a que preferir; o resultado é o mesmo.",
                    },
                    {
                        type: "code",
                        value: ".cartao {\n  background-color: #f5f5f5;   /* um cinza bem claro */\n}\n\n.aviso {\n  background-color: gold;\n}\n\nbody {\n  background-color: rgb(240, 248, 255);\n}",
                    },
                    {
                        type: "text",
                        value: "## `background-image`: uma imagem de fundo\n\nPara colocar uma **imagem** no fundo, use `background-image` com a notação `url()`, informando o **caminho** do arquivo entre parênteses (e, de preferência, entre aspas). A imagem fica **atrás** do conteúdo do elemento.\n\nUm aviso desde já: por padrão, se a imagem for menor que o elemento, ela se **repete** para preencher todo o espaço, feito ladrilhos num piso. Já já vamos controlar isso.",
                    },
                    {
                        type: "code",
                        value: '.hero {\n  background-image: url("foto-praia.jpg");\n}\n\n/* O caminho pode ser um endereco da web tambem */\nbody {\n  background-image: url("https://exemplo.com/textura.png");\n}',
                    },
                    {
                        type: "text",
                        value: "## `background-repeat`: repetir ou não\n\nComo acabamos de ver, uma imagem de fundo se **repete** por padrão. A propriedade `background-repeat` controla isso:\n\n- `repeat`: repete em todas as direções (o padrão).\n- `no-repeat`: **não** repete, mostra a imagem uma única vez.\n- `repeat-x`: repete só na **horizontal**.\n- `repeat-y`: repete só na **vertical**.\n\nPara uma foto grande de destaque, você quase sempre vai querer `no-repeat`. Já uma pequena textura pode ficar boa repetida, como um azulejo.",
                    },
                    {
                        type: "code",
                        value: '.hero {\n  background-image: url("foto-praia.jpg");\n  background-repeat: no-repeat;\n}',
                    },
                    {
                        type: "text",
                        value: "## `background-size`: o tamanho da imagem\n\nA propriedade `background-size` diz **que tamanho** a imagem de fundo deve ter. Dois valores são especialmente úteis, e vale a pena entender bem a diferença:\n\n- `cover`: a imagem **cobre todo** o elemento, sem deixar espaços em branco. Para isso, ela pode ser **cortada** nas bordas. É o valor perfeito para fotos de fundo que ocupam a tela inteira.\n- `contain`: a imagem aparece **inteira**, sem cortar nada. Em troca, podem **sobrar espaços** ao redor se as proporções não baterem.\n\nVocê também pode dar valores exatos, como `background-size: 200px 100px` (largura e altura).",
                    },
                    {
                        type: "table",
                        value: '[["Valor","O que faz","Efeito colateral"],["`cover`","Cobre todo o elemento","Pode **cortar** partes da imagem"],["`contain`","Mostra a imagem inteira","Podem **sobrar espaços** ao redor"],["`200px 150px`","Tamanho exato (largura e altura)","Pode distorcer se a proporção não bater"],["`auto`","Tamanho original da imagem","Pode ser maior ou menor que o elemento"]]',
                    },
                    {
                        type: "code",
                        value: '.hero {\n  background-image: url("foto-praia.jpg");\n  background-repeat: no-repeat;\n  background-size: cover;   /* preenche o bloco todo, cortando o que sobra */\n}',
                    },
                    {
                        type: "text",
                        value: "## `background-position`: onde a imagem fica\n\nQuando a imagem não preenche o elemento inteiro (ou quando é cortada pelo `cover`), a propriedade `background-position` decide **qual parte** dela fica visível, ou seja, o ponto de ancoragem. Você pode usar palavras como `top`, `bottom`, `left`, `right` e `center`, combinando-as, ou valores em `px` e `%`.\n\nO valor `center` (ou `center center`) é um dos mais usados: mantém o miolo da imagem sempre visível.",
                    },
                    {
                        type: "code",
                        value: '.hero {\n  background-image: url("foto-praia.jpg");\n  background-repeat: no-repeat;\n  background-size: cover;\n  background-position: center;    /* centraliza a imagem no bloco */\n}\n\n.canto {\n  background-position: top right; /* ancora no canto superior direito */\n}',
                    },
                    {
                        type: "text",
                        value: "## Gradientes com `linear-gradient()`\n\nUm **gradiente** é uma **transição suave entre cores**, como o céu ao entardecer, que vai do laranja ao azul sem uma linha divisória. Em CSS, o gradiente mais comum é o **linear** (em linha reta), criado com a função `linear-gradient()`.\n\nUm detalhe que confunde no começo: o gradiente é tratado como uma **imagem**, não como uma cor. Por isso ele vai em `background-image` (ou no atalho `background`), e **não** em `background-color`.\n\nDentro dos parênteses você informa, de forma opcional, a **direção** e, depois, as **cores**:\n\n- a direção pode ser uma palavra como `to right` (para a direita) ou `to bottom` (para baixo), ou um ângulo como `45deg`;\n- em seguida vêm as cores, separadas por vírgula.",
                    },
                    {
                        type: "code",
                        value: "/* Da esquerda (azul) para a direita (verde) */\n.faixa {\n  background-image: linear-gradient(to right, blue, green);\n}\n\n/* De cima para baixo, com tres cores */\n.ceu {\n  background-image: linear-gradient(to bottom, #1e3c72, #2a5298, #7db9e8);\n}\n\n/* Num angulo de 45 graus */\n.diagonal {\n  background-image: linear-gradient(45deg, #ff8a00, #e52e71);\n}",
                    },
                    {
                        type: "text",
                        value: "## O atalho `background`\n\nAssim como o `font`, existe um atalho `background` que reúne várias propriedades de fundo em uma linha só: cor, imagem, repetição, posição e tamanho. Ele deixa o CSS mais enxuto.\n\nUm detalhe de sintaxe: quando você informa a posição e o tamanho juntos, eles vêm separados por uma **barra** `/`, na ordem `posição / tamanho`.",
                    },
                    {
                        type: "code",
                        value: '/* Longo: uma propriedade por linha */\n.hero {\n  background-color: #222;\n  background-image: url("foto-praia.jpg");\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: cover;\n}\n\n/* Curto: tudo no atalho background (posicao / tamanho) */\n.hero {\n  background: #222 url("foto-praia.jpg") no-repeat center / cover;\n}',
                    },
                    {
                        type: "quote",
                        value: '**Resumo:** `background-color` pinta o fundo com uma cor sólida. `background-image: url("...")` coloca uma imagem, que por padrão **se repete**; controle isso com `background-repeat` (use `no-repeat` para fotos). O `background-size` ajusta o tamanho: `cover` preenche cortando, `contain` mostra inteira podendo sobrar espaço. `background-position` escolhe a parte visível (`center` é o mais comum). Gradientes vêm de `linear-gradient()` e contam como **imagem**. O atalho `background` junta tudo, com `posição / tamanho` separados por barra.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual propriedade define uma cor sólida de fundo para um elemento?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`background-color`",
                                isCorrect: true,
                            },
                            {
                                text: "`color`",
                                isCorrect: false,
                            },
                            {
                                text: "`background-repeat`",
                                isCorrect: false,
                            },
                            {
                                text: "`border-color`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Como você indica o arquivo de uma imagem de fundo em `background-image`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: 'Com a notação `url()`, colocando o caminho do arquivo dentro dos parênteses, por exemplo `url("foto.jpg")`.',
                                isCorrect: true,
                            },
                            {
                                text: "Escrevendo apenas o nome do arquivo solto, sem nada em volta.",
                                isCorrect: false,
                            },
                            {
                                text: "Usando a função `image()` com o nome entre colchetes.",
                                isCorrect: false,
                            },
                            {
                                text: "Com a notação `src()`, como nas imagens do HTML.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual a diferença entre `background-size: cover` e `background-size: contain`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`cover` preenche todo o elemento, podendo cortar partes da imagem; `contain` mostra a imagem inteira, mas pode sobrar espaço ao redor.",
                                isCorrect: true,
                            },
                            {
                                text: "`cover` mostra a imagem inteira e `contain` corta as bordas.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois fazem exatamente a mesma coisa.",
                                isCorrect: false,
                            },
                            {
                                text: "`cover` repete a imagem e `contain` impede a repetição.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por padrão, uma imagem menor que o elemento se repete preenchendo o fundo. Qual valor faz ela aparecer uma única vez?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`background-repeat: no-repeat`",
                                isCorrect: true,
                            },
                            {
                                text: "`background-repeat: repeat`",
                                isCorrect: false,
                            },
                            {
                                text: "`background-size: cover`",
                                isCorrect: false,
                            },
                            {
                                text: "`background-position: center`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você quer um fundo com uma transição suave do azul para o verde usando `linear-gradient()`. Em qual propriedade ele deve ser aplicado, e por quê?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Em `background-image` (ou no atalho `background`), porque um gradiente é tratado como uma imagem, não como uma cor.",
                                isCorrect: true,
                            },
                            {
                                text: "Em `background-color`, porque gradiente é um tipo de cor.",
                                isCorrect: false,
                            },
                            {
                                text: "Em `color`, que define todas as cores do elemento.",
                                isCorrect: false,
                            },
                            {
                                text: "Em `background-repeat`, que é quem desenha os gradientes.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Bordas, cantos e sombras",
                blocks: [
                    {
                        type: "text",
                        value: "# Bordas, cantos e sombras\n\nChegamos à última aula do módulo, e ela é sobre os **acabamentos**: aqueles detalhes que transformam uma caixa sem graça num elemento com cara de profissional. Vamos aprender a desenhar uma **moldura** ao redor dos elementos, **arredondar** os cantos (até fazer círculos perfeitos) e criar **sombras** que dão sensação de profundidade.\n\nSão propriedades muito usadas em **cartões**, botões e fotos de perfil. Depois desta aula, suas páginas vão ganhar um caprichado e tanto.",
                    },
                    {
                        type: "quote",
                        value: "`border` desenha uma **moldura** ao redor do elemento, com espessura, estilo e cor. `border-radius` **arredonda os cantos** (e, no ponto certo, vira um círculo). `box-shadow` cria uma **sombra**, dando profundidade. E `outline` é um traço por **fora** da borda que **não ocupa espaço** no layout, muito importante para indicar o foco e ajudar na acessibilidade.",
                    },
                    {
                        type: "text",
                        value: "## `border`: a moldura do elemento\n\nA propriedade `border` desenha uma **linha ao redor** do elemento, como a moldura de um quadro. Uma borda tem **três características**:\n\n- a **espessura** (largura da linha), como `2px`;\n- o **estilo** (o tipo de traço), como `solid` (linha contínua);\n- a **cor**, como `black`.\n\nVocê pode escrever as três de uma vez no atalho `border`, na ordem **espessura, estilo, cor**. É a forma mais comum.",
                    },
                    {
                        type: "code",
                        value: "/* Atalho: espessura, estilo e cor de uma vez */\n.cartao {\n  border: 2px solid black;\n}\n\n/* O mesmo resultado, separado em tres propriedades */\n.cartao {\n  border-width: 2px;\n  border-style: solid;\n  border-color: black;\n}",
                    },
                    {
                        type: "text",
                        value: "## Estilos de borda e lados separados\n\nO **estilo** é obrigatório para a borda aparecer (sem ele, o navegador não sabe que traço desenhar). Os estilos mais usados são `solid` (contínua), `dashed` (tracejada), `dotted` (pontilhada) e `double` (linha dupla).\n\nVocê também pode aplicar borda em **apenas um lado**, com `border-top`, `border-right`, `border-bottom` e `border-left`. Um truque comum é usar só o `border-bottom` para criar um sublinhado decorativo embaixo de um título.",
                    },
                    {
                        type: "code",
                        value: '/* Estilos diferentes */\n.tracejada  { border: 2px dashed steelblue; }\n.pontilhada { border: 2px dotted gray; }\n\n/* Borda so embaixo: um "sublinhado" para o titulo */\nh2 {\n  border-bottom: 3px solid #e52e71;\n}',
                    },
                    {
                        type: "table",
                        value: '[["Estilo","Como aparece"],["`solid`","Linha contínua"],["`dashed`","Linha tracejada (tracinhos)"],["`dotted`","Linha pontilhada (bolinhas)"],["`double`","Duas linhas paralelas"],["`none`","Sem borda (o padrão)"]]',
                    },
                    {
                        type: "text",
                        value: "## `border-radius`: cantos arredondados\n\nPor padrão, os cantos de um elemento são em quina, num ângulo reto. A propriedade `border-radius` **arredonda** esses cantos. Quanto maior o valor, mais suave a curva. Os valores podem ser em `px` ou em `%`.\n\nÉ o que dá aquele visual amigável de **botões** e **cartões** modernos.",
                    },
                    {
                        type: "code",
                        value: ".botao {\n  border-radius: 8px;    /* cantos levemente arredondados */\n}\n\n.cartao {\n  border-radius: 16px;   /* cantos bem redondos */\n}",
                    },
                    {
                        type: "text",
                        value: "## Fazendo um círculo com `border-radius: 50%`\n\nAqui vai um truque muito útil: se você aplicar `border-radius: 50%` a um elemento **quadrado** (mesma largura e altura), os cantos se arredondam tanto que ele vira um **círculo perfeito**. É exatamente assim que se fazem aquelas **fotos de perfil redondas** que você vê em todo lugar.",
                    },
                    {
                        type: "code",
                        value: '<img class="avatar" src="perfil.jpg" alt="Foto de perfil">\n\n<style>\n  .avatar {\n    width: 120px;\n    height: 120px;         /* largura = altura: um quadrado */\n    border-radius: 50%;    /* 50% transforma o quadrado em circulo */\n    object-fit: cover;     /* evita distorcer a foto */\n  }\n</style>',
                    },
                    {
                        type: "text",
                        value: "## `box-shadow`: sombra e profundidade\n\nA propriedade `box-shadow` projeta uma **sombra** atrás do elemento, dando a sensação de que ele está **levemente elevado** sobre a página, como um cartão flutuando um pouco acima da mesa. É um dos recursos que mais dão um ar moderno e profissional.\n\nOs valores, nesta ordem, são:\n\n1. deslocamento **horizontal** (para a direita, se positivo);\n2. deslocamento **vertical** (para baixo, se positivo);\n3. o **desfoque** (_blur_): quanto maior, mais suave e espalhada a sombra;\n4. a **cor** da sombra.",
                    },
                    {
                        type: "code",
                        value: "/* horizontal, vertical, desfoque, cor */\n.cartao {\n  box-shadow: 0 4px 8px gray;\n}\n\n/* Sombra bem suave, um classico de cartoes */\n.cartao-suave {\n  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);\n}",
                    },
                    {
                        type: "text",
                        value: "No segundo exemplo apareceu `rgba(0, 0, 0, 0.15)`. É a cor preta (`0, 0, 0`) com uma **transparência** de apenas `0.15` (o quarto número, chamado _alpha_, vai de `0` totalmente transparente a `1` totalmente opaco). Sombras semitransparentes ficam bem mais naturais do que um cinza chapado, porque deixam o fundo aparecer um pouquinho.",
                    },
                    {
                        type: "text",
                        value: "## `outline` vs `border`\n\nÀ primeira vista, `outline` parece só mais uma borda: é um traço em volta do elemento. Mas há diferenças importantes:\n\n- o `outline` é desenhado **por fora** da borda e **não ocupa espaço** no layout; ele não empurra os elementos vizinhos nem muda o tamanho da caixa. Já a `border` **ocupa espaço** e faz parte do tamanho do elemento.\n- por isso, quando o navegador desenha ou remove um `outline`, o layout **não treme**; com a `border`, adicionar ou tirar pode deslocar as coisas ao redor.\n\nO `outline` tem um papel de destaque na **acessibilidade**: é ele que o navegador mostra em volta de um botão ou campo quando você navega pelo **teclado** (a tecla Tab), indicando onde está o **foco**.",
                    },
                    {
                        type: "code",
                        value: "/* border ocupa espaco; outline nao */\n.campo {\n  border: 1px solid #ccc;\n}\n\n/* Realce de foco (aparece ao navegar pelo teclado) */\n.campo:focus {\n  outline: 2px solid steelblue;\n}",
                    },
                    {
                        type: "text",
                        value: 'Um alerta de acessibilidade: é tentador escrever `outline: none` para "limpar" aquele contorno que aparece ao clicar. **Evite** fazer isso sem colocar outro destaque de foco no lugar. Sem nenhum indicador de foco, quem navega pelo teclado se perde na página, sem saber onde está. Se for remover o contorno padrão, ofereça um substituto visível.',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","`border`","`outline`"],["Ocupa espaço no layout?","Sim","Não"],["Afeta o tamanho da caixa?","Sim","Não"],["Fica onde?","Na moldura do elemento","Por fora da borda"],["Uso mais comum","Molduras e divisões","Realce de **foco** (acessibilidade)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Resumo:** `border` é a moldura, no formato **espessura estilo cor** (ex.: `2px solid black`); dá para aplicar por lado (`border-bottom`). `border-radius` arredonda os cantos, e `50%` num quadrado vira um **círculo** (foto de perfil). `box-shadow` cria sombra na ordem **horizontal, vertical, desfoque, cor**, ótima com cores semitransparentes (`rgba`). Já o `outline` é um traço por fora que **não ocupa espaço**, essencial para marcar o **foco**, então não o remova sem oferecer um substituto.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "No atalho `border: 2px solid black;`, o que cada parte define, na ordem?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A espessura (`2px`), o estilo do traço (`solid`) e a cor (`black`).",
                                isCorrect: true,
                            },
                            {
                                text: "A cor, o tamanho da fonte e o espaçamento.",
                                isCorrect: false,
                            },
                            {
                                text: "A posição, o desfoque e a sombra.",
                                isCorrect: false,
                            },
                            {
                                text: "A largura, a altura e a cor do elemento.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece ao aplicar `border-radius: 50%` a um elemento quadrado (mesma largura e altura)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ele vira um círculo perfeito.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele fica com metade do tamanho original.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele ganha uma borda pontilhada.",
                                isCorrect: false,
                            },
                            {
                                text: "Nada muda, pois `50%` não é um valor válido.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na propriedade `box-shadow: 0 4px 8px gray;`, o que representam os dois primeiros valores (`0` e `4px`)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O deslocamento horizontal e o vertical da sombra.",
                                isCorrect: true,
                            },
                            {
                                text: "A cor e a transparência da sombra.",
                                isCorrect: false,
                            },
                            {
                                text: "A espessura da borda e o arredondamento.",
                                isCorrect: false,
                            },
                            {
                                text: "A largura e a altura do elemento.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é uma diferença importante entre `outline` e `border`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O `outline` não ocupa espaço no layout (não empurra os vizinhos), enquanto a `border` faz parte do tamanho do elemento.",
                                isCorrect: true,
                            },
                            {
                                text: "O `outline` só funciona em imagens, e a `border` só em textos.",
                                isCorrect: false,
                            },
                            {
                                text: "A `border` é invisível e o `outline` é sempre vermelho.",
                                isCorrect: false,
                            },
                            {
                                text: "Não há diferença: são duas formas de escrever a mesma coisa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que é desaconselhado simplesmente aplicar `outline: none` nos elementos ao receber foco?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque o `outline` de foco indica, para quem navega pelo teclado, onde a pessoa está na página; removê-lo sem um substituto prejudica a acessibilidade.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque `outline: none` deixa a página mais lenta para carregar.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque isso apaga todas as bordas de todos os elementos do site.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o `outline` é obrigatório para a página ser válida em HTML.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Flexbox",
        aulas: [
            {
                titulo: "Introdução ao Flexbox",
                blocks: [
                    {
                        type: "text",
                        value: "# Introdução ao Flexbox\n\nAté aqui você aprendeu a dar cor, tamanho e espaçamento aos elementos. Agora vamos dar um passo enorme: aprender a **posicionar** as coisas na tela do jeito que você quiser. Colocar itens lado a lado, centralizar um botão no meio da página, distribuir cards com o mesmo espaço entre eles... tudo isso é trabalho de **layout**, e a ferramenta mais usada para isso hoje se chama **Flexbox**.\n\nCalma que a gente vai do zero, sem pressa. No fim desta aula você vai entender o que é o Flexbox, como ligá-lo e qual é o modelo mental que faz todo o resto se encaixar.",
                    },
                    {
                        type: "quote",
                        value: "O **Flexbox** (de _flexible box_, caixa flexível) é um **jeito de organizar elementos** em uma direção: uma linha ou uma coluna. Você escolhe um elemento para ser o **container** e escreve `display: flex` nele. A partir daí, os **filhos diretos** desse container viram **itens flexíveis** e passam a se alinhar e se distribuir com facilidade, sem gambiarra.",
                    },
                    {
                        type: "text",
                        value: "## O problema que o Flexbox resolve\n\nPor padrão, muitos elementos de HTML (como a `<div>`) são **blocos**: cada um ocupa a largura toda e **empilha** um embaixo do outro, feito tijolos numa parede. Isso é ótimo para um texto corrido, mas atrapalha quando você quer, por exemplo, um menu com os itens **lado a lado**.\n\nE tem um clássico que assombra todo iniciante: **centralizar** de verdade, principalmente na vertical. Deixar uma caixa exatamente no meio da tela, na horizontal **e** na vertical, já foi motivo de dor de cabeça e de vários truques estranhos.\n\nO Flexbox nasceu justamente para resolver isso. Ele foi feito para **alinhar** e **distribuir** elementos com poucas linhas, de um jeito previsível.",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .caixa {\n    background: #6366f1;\n    color: white;\n    padding: 20px;\n    margin: 5px;\n  }\n</style>\n\n<!-- Sem Flexbox: cada div é um bloco e empilha uma embaixo da outra -->\n<div class="caixa">Um</div>\n<div class="caixa">Dois</div>\n<div class="caixa">Três</div>',
                    },
                    {
                        type: "text",
                        value: "## Ligando o Flexbox com `display: flex`\n\nPara usar o Flexbox, a gente precisa de um **elemento pai** que envolva os itens. Nele, aplicamos a propriedade `display` com o valor `flex`. Só isso já muda tudo: aquilo que estava empilhado passa a ficar **lado a lado**.\n\nVeja o mesmo exemplo de antes, agora com as três caixas dentro de um pai com `display: flex`:",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .painel {\n    display: flex;   /* liga o Flexbox neste pai */\n  }\n  .caixa {\n    background: #6366f1;\n    color: white;\n    padding: 20px;\n    margin: 5px;\n  }\n</style>\n\n<!-- Com display: flex no pai, os filhos ficam lado a lado -->\n<div class="painel">\n  <div class="caixa">Um</div>\n  <div class="caixa">Dois</div>\n  <div class="caixa">Três</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: '## Container e itens: quem é quem\n\nO Flexbox trabalha sempre com **dois papéis**, e entender essa divisão é meio caminho andado:\n\n- O **flex container** é o elemento pai, aquele que recebeu o `display: flex`. É ele quem **manda** na organização.\n- Os **flex itens** são os **filhos diretos** do container. São eles que obedecem e se posicionam.\n\nUma analogia: pense numa **bandeja** com **copos** em cima. A bandeja é o container; os copos são os itens. Quando você mexe na bandeja, os copos se ajustam. No Flexbox é a mesma ideia: você configura o container, e os itens respondem.\n\nUm detalhe importante: só os **filhos diretos** viram itens flexíveis. Um "neto" (um elemento dentro de um filho) não é afetado diretamente pelo `display: flex` do avô.',
                    },
                    {
                        type: "code",
                        value: '<style>\n  .bandeja {\n    display: flex;       /* este é o container */\n    background: #e0e7ff;\n    padding: 10px;\n  }\n  .copo {\n    background: #4f46e5;  /* estes são os itens (filhos diretos) */\n    color: white;\n    padding: 20px;\n    margin: 5px;\n  }\n</style>\n\n<div class="bandeja">\n  <div class="copo">A</div>\n  <div class="copo">B</div>\n  <div class="copo">C</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: '## Os dois eixos: principal e cruzado\n\nAqui está o conceito mais importante do Flexbox, o que faz todo o resto fazer sentido. Todo container flex tem **dois eixos**, duas linhas invisíveis que se cruzam:\n\n- O **eixo principal** (_main axis_) é a direção em que os itens são colocados. Por padrão, ele é **horizontal**, da esquerda para a direita. É por isso que, nos exemplos acima, as caixas ficaram em linha.\n- O **eixo cruzado** (_cross axis_) é **perpendicular** ao principal. Se o principal é horizontal, o cruzado é **vertical** (de cima para baixo).\n\nGuarde essa imagem: o eixo principal é a "fila" onde os itens entram; o eixo cruzado é a direção que atravessa essa fila. Nas próximas aulas você vai alinhar itens **em cada um desses eixos** separadamente, então vale a pena fixar bem essa ideia agora.',
                    },
                    {
                        type: "table",
                        value: '[["","Eixo principal (main axis)","Eixo cruzado (cross axis)"],["Direção padrão","Horizontal (esquerda → direita)","Vertical (cima → baixo)"],["É a direção em que...","os itens entram na fila","a fila é atravessada"],["Propriedade que alinha (aula 2)","`justify-content`","`align-items`"],["Analogia","a fila do caixa","a altura de cada pessoa na fila"]]',
                    },
                    {
                        type: "code",
                        value: '<style>\n  .fila {\n    display: flex;\n    background: #f1f5f9;\n    padding: 10px;\n  }\n  .item {\n    background: #0ea5e9;\n    color: white;\n    padding: 16px 24px;\n    margin: 4px;\n  }\n</style>\n\n<!-- Os itens entram na direção do eixo principal (horizontal por padrão) -->\n<div class="fila">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n  <div class="item">4</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: "## E se eu quiser em coluna?\n\nO eixo principal **não é fixo** na horizontal. Dá para virá-lo para a **vertical**, fazendo os itens empilharem como uma coluna, com a propriedade `flex-direction` (que veremos com calma na aula 3). O ponto para guardar agora é: **quando você muda a direção principal, o eixo cruzado muda junto**, sempre perpendicular. Os dois andam de mãos dadas.\n\nPor enquanto, fique com o padrão (linha horizontal). Na próxima aula vamos usar esses dois eixos para finalmente **centralizar** qualquer coisa, na horizontal e na vertical.",
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet:** o **Flexbox** organiza os filhos de um elemento em linha ou coluna. Você o liga com `display: flex` no **container** (o pai); os **filhos diretos** viram **itens**. Todo container tem um **eixo principal** (horizontal por padrão, onde os itens se enfileiram) e um **eixo cruzado** (perpendicular, vertical por padrão). Entender esses dois eixos é a chave para alinhar qualquer coisa nas próximas aulas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual propriedade e valor transformam um elemento em um container flex?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`display: flex`",
                                isCorrect: true,
                            },
                            {
                                text: "`flex: display`",
                                isCorrect: false,
                            },
                            {
                                text: "`position: flex`",
                                isCorrect: false,
                            },
                            {
                                text: "`align: flex`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "No Flexbox, quem são os itens flexíveis?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Os filhos diretos do container (o elemento que recebeu `display: flex`).",
                                isCorrect: true,
                            },
                            {
                                text: "O próprio elemento container.",
                                isCorrect: false,
                            },
                            {
                                text: "Todos os elementos da página, sem exceção.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas os elementos que contêm texto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por padrão, em qual direção fica o eixo principal de um container flex?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Horizontal, da esquerda para a direita.",
                                isCorrect: true,
                            },
                            {
                                text: "Vertical, de cima para baixo.",
                                isCorrect: false,
                            },
                            {
                                text: "Na diagonal, do canto superior ao inferior.",
                                isCorrect: false,
                            },
                            {
                                text: "Depende do tamanho da tela do usuário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Três `<div>` (que são blocos) estão empilhadas. O que acontece quando o elemento pai delas recebe `display: flex`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Elas passam a ficar lado a lado, na direção do eixo principal.",
                                isCorrect: true,
                            },
                            {
                                text: "Continuam empilhadas uma sobre a outra, sem mudança.",
                                isCorrect: false,
                            },
                            {
                                text: "Somem da página até você adicionar mais CSS.",
                                isCorrect: false,
                            },
                            {
                                text: "Viram automaticamente uma imagem única.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Sobre os eixos do Flexbox, qual afirmação está correta?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O eixo cruzado é sempre perpendicular ao principal; se o principal é horizontal, o cruzado é vertical.",
                                isCorrect: true,
                            },
                            {
                                text: "Os dois eixos apontam sempre para a horizontal.",
                                isCorrect: false,
                            },
                            {
                                text: "O eixo principal é sempre vertical e não há como mudá-lo.",
                                isCorrect: false,
                            },
                            {
                                text: "O `display: flex` afeta diretamente também os netos (filhos dos filhos).",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Alinhamento no Flexbox",
                blocks: [
                    {
                        type: "text",
                        value: '# Alinhamento no Flexbox\n\nNa aula passada você ligou o Flexbox e conheceu os dois eixos. Agora vem a parte que faz a maioria das pessoas se apaixonar por ele: **alinhar e distribuir** os itens com uma ou duas linhas de CSS. É aqui que aquele sonho de "centralizar no meio da tela" finalmente vira algo trivial.\n\nA regra é simples e vale memorizar: **cada eixo tem a sua própria propriedade de alinhamento**. Vamos ver uma de cada vez.',
                    },
                    {
                        type: "quote",
                        value: "No Flexbox o alinhamento é dividido por eixo: `justify-content` alinha os itens no **eixo principal** (a direção da fila) e `align-items` alinha os itens no **eixo cruzado** (a direção que atravessa a fila). Para **centralizar de verdade**, na horizontal e na vertical, basta usar as duas juntas com o valor `center`.",
                    },
                    {
                        type: "text",
                        value: "## `justify-content`: distribuindo no eixo principal\n\nA propriedade `justify-content` controla como os itens ficam ao longo do **eixo principal** (por padrão, na horizontal). Ela brilha quando **sobra espaço** no container: é ela quem decide o que fazer com essa sobra.\n\nOs valores mais usados são:\n\n- `flex-start`: agrupa os itens no **início** (é o padrão). Numa linha, isso é a **esquerda**.\n- `flex-end`: agrupa os itens no **fim** (a direita).\n- `center`: agrupa os itens no **centro**.\n- `space-between`: cola o primeiro no início, o último no fim e joga **todo o espaço entre** os itens.\n- `space-around`: dá um espaço **em volta** de cada item (as pontas ficam com metade do espaço).\n- `space-evenly`: distribui o espaço de forma **igual** entre os itens e nas bordas.",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .barra {\n    display: flex;\n    justify-content: center;  /* agrupa os itens no centro do eixo principal */\n    background: #f1f5f9;\n    padding: 10px;\n  }\n  .item {\n    background: #6366f1;\n    color: white;\n    padding: 16px 24px;\n    margin: 4px;\n  }\n</style>\n\n<div class="barra">\n  <div class="item">A</div>\n  <div class="item">B</div>\n  <div class="item">C</div>\n</div>',
                    },
                    {
                        type: "code",
                        value: "/* Troque só o valor de justify-content para sentir a diferença: */\n\n.barra {\n  display: flex;\n  justify-content: space-between; /* extremos nas pontas, espaço no meio */\n}\n\n/* space-around -> espaço em volta de cada item          */\n/* space-evenly -> todos os espaços exatamente iguais     */\n/* flex-end     -> tudo empurrado para a direita          */",
                    },
                    {
                        type: "table",
                        value: '[["Valor de `justify-content`","O que faz no eixo principal"],["`flex-start`","Agrupa tudo no início (padrão)"],["`center`","Agrupa tudo no centro"],["`flex-end`","Agrupa tudo no fim"],["`space-between`","Extremos colados nas pontas, espaço entre os itens"],["`space-around`","Espaço ao redor de cada item"],["`space-evenly`","Espaços iguais entre os itens e nas bordas"]]',
                    },
                    {
                        type: "text",
                        value: "## `align-items`: alinhando no eixo cruzado\n\nSe `justify-content` cuida do eixo principal, `align-items` cuida do **eixo cruzado** (por padrão, a **vertical**). Ela decide como os itens se posicionam **de cima a baixo** dentro do container.\n\nPara enxergar o efeito, o container precisa ter uma **altura** maior que a dos itens, senão não sobra espaço na vertical para mexer. Os valores principais:\n\n- `stretch`: **estica** os itens para preencher a altura toda (é o padrão).\n- `flex-start`: alinha os itens no **topo**.\n- `flex-end`: alinha os itens **embaixo**.\n- `center`: alinha os itens no **meio** (verticalmente).\n- `baseline`: alinha pela **linha de base** do texto dos itens.",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .painel {\n    display: flex;\n    align-items: center;  /* centraliza os itens na vertical */\n    height: 200px;        /* precisa de altura para haver o que alinhar */\n    background: #f1f5f9;\n  }\n  .item {\n    background: #10b981;\n    color: white;\n    padding: 16px 24px;\n    margin: 4px;\n  }\n</style>\n\n<div class="painel">\n  <div class="item">A</div>\n  <div class="item">B</div>\n  <div class="item">C</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: "## Centralizar de verdade: as duas propriedades juntas\n\nChegou o momento mais aguardado. Para colocar algo **exatamente no centro** de uma área, na horizontal **e** na vertical, você combina as duas propriedades com o valor `center`:\n\n- `justify-content: center` centraliza no eixo principal (horizontal).\n- `align-items: center` centraliza no eixo cruzado (vertical).\n\nJuntas, elas resolvem aquele problema histórico de centralização em **três linhas**. Guarde este trio: você vai usar a vida inteira.",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .tela {\n    display: flex;\n    justify-content: center;  /* centro na horizontal */\n    align-items: center;      /* centro na vertical   */\n    height: 300px;\n    background: #1e293b;\n  }\n  .cartao {\n    background: white;\n    color: #1e293b;\n    padding: 30px 50px;\n    border-radius: 8px;\n  }\n</style>\n\n<div class="tela">\n  <div class="cartao">Estou no centro!</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: "## `align-content`: quando há várias linhas\n\nExiste ainda uma terceira propriedade de alinhamento, a `align-content`. Ela só entra em cena quando os itens ocupam **mais de uma linha** dentro do container (isso acontece quando ativamos a quebra com `flex-wrap`, assunto da próxima aula).\n\nA diferença é sutil, mas importante:\n\n- `align-items` alinha os itens **dentro da sua própria linha**.\n- `align-content` alinha o **conjunto de linhas** como um todo, distribuindo o espaço **entre as linhas** no eixo cruzado.\n\nOs valores lembram os do `justify-content` (`flex-start`, `center`, `space-between`, `space-around`, `space-evenly`, `stretch`). Se você só tem **uma linha** de itens, a `align-content` não faz efeito nenhum, e é por isso que ela costuma confundir no começo.",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .grade {\n    display: flex;\n    flex-wrap: wrap;         /* permite quebrar em várias linhas */\n    align-content: center;   /* centraliza o CONJUNTO de linhas na vertical */\n    height: 300px;\n    background: #f1f5f9;\n  }\n  .item {\n    background: #f59e0b;\n    color: white;\n    width: 120px;\n    padding: 20px;\n    margin: 5px;\n  }\n</style>\n\n<div class="grade">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n  <div class="item">4</div>\n  <div class="item">5</div>\n</div>',
                    },
                    {
                        type: "table",
                        value: '[["Propriedade","Atua em...","Serve para..."],["`justify-content`","Eixo principal","Distribuir os itens ao longo da fila"],["`align-items`","Eixo cruzado","Alinhar os itens dentro da linha"],["`align-content`","Eixo cruzado","Distribuir várias linhas (só com quebra)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet:** `justify-content` alinha no **eixo principal** (horizontal por padrão) e decide o que fazer com o espaço que sobra: `center`, `space-between`, `space-around`, `space-evenly`... `align-items` alinha no **eixo cruzado** (vertical por padrão): `center`, `flex-start`, `flex-end`, `stretch`. Para **centralizar de vez**, use as duas com `center`. Já a `align-content` só age quando há **várias linhas** (com `flex-wrap`), organizando o conjunto de linhas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual propriedade alinha os itens ao longo do eixo principal (horizontal por padrão)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`justify-content`",
                                isCorrect: true,
                            },
                            {
                                text: "`align-items`",
                                isCorrect: false,
                            },
                            {
                                text: "`align-content`",
                                isCorrect: false,
                            },
                            {
                                text: "`text-align`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para alinhar os itens no centro na vertical (eixo cruzado), qual declaração você usa?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`align-items: center`",
                                isCorrect: true,
                            },
                            {
                                text: "`justify-content: center`",
                                isCorrect: false,
                            },
                            {
                                text: "`vertical-align: middle`",
                                isCorrect: false,
                            },
                            {
                                text: "`margin: center`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual combinação centraliza um elemento exatamente no meio, na horizontal e na vertical?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`justify-content: center` e `align-items: center` juntos.",
                                isCorrect: true,
                            },
                            {
                                text: "`text-align: center` sozinho.",
                                isCorrect: false,
                            },
                            {
                                text: "`justify-content: center` sozinho.",
                                isCorrect: false,
                            },
                            {
                                text: "`margin: 0 auto` com `padding: center`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o valor `space-between` do `justify-content` faz?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Cola o primeiro item no início e o último no fim, jogando o espaço que sobra entre os itens.",
                                isCorrect: true,
                            },
                            {
                                text: "Centraliza todos os itens no meio do container.",
                                isCorrect: false,
                            },
                            {
                                text: "Dá o mesmo espaço em volta de cada item, inclusive nas bordas.",
                                isCorrect: false,
                            },
                            {
                                text: "Empilha os itens em uma coluna.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que a propriedade `align-content` às vezes parece não fazer nada?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque ela só tem efeito quando há mais de uma linha de itens (com `flex-wrap`); em uma linha só, não há linhas para distribuir.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque ela foi removida das versões modernas do CSS.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque ela funciona apenas com `display: grid`.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque ela exige que os itens tenham `position: absolute`.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Direção, quebra e espaçamento",
                blocks: [
                    {
                        type: "text",
                        value: '# Direção, quebra e espaçamento\n\nAté agora nossos itens ficaram sempre em uma linha horizontal, sem sair do lugar. Nesta aula você ganha o controle sobre a **direção** dessa fila, sobre o que acontece quando ela **não cabe** na tela e sobre o **espaço** entre os itens. São quatro propriedades que deixam o layout muito mais flexível (o nome "Flexbox" não é à toa).',
                    },
                    {
                        type: "quote",
                        value: "Quatro propriedades comandam o arranjo dos itens: `flex-direction` escolhe se a fila é uma **linha** ou uma **coluna** (e isso **gira os eixos**); `flex-wrap` permite que os itens **quebrem** para a linha de baixo quando não cabem; `gap` cria um **espaço uniforme** entre eles; e `order` muda a **ordem visual** sem mexer no HTML.",
                    },
                    {
                        type: "text",
                        value: "## `flex-direction`: linha ou coluna\n\nLembra do **eixo principal** da aula 1? A propriedade `flex-direction` é quem define para onde ele aponta. Ela aceita quatro valores:\n\n- `row` (o padrão): itens em **linha**, da esquerda para a direita. Eixo principal **horizontal**.\n- `column`: itens em **coluna**, de cima para baixo. Eixo principal **vertical**.\n- `row-reverse`: linha, mas da **direita para a esquerda**.\n- `column-reverse`: coluna, mas de **baixo para cima**.\n\nO detalhe que mais confunde: ao trocar para `column`, os **eixos giram**. Agora o eixo principal é o **vertical**, então `justify-content` passa a alinhar na **vertical**, e `align-items`, na **horizontal**. As propriedades não mudam de nome, mas o eixo em que elas agem, sim.",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .menu {\n    display: flex;\n    flex-direction: column;  /* empilha os itens numa coluna */\n    background: #f1f5f9;\n    padding: 10px;\n  }\n  .item {\n    background: #6366f1;\n    color: white;\n    padding: 12px;\n    margin: 4px;\n  }\n</style>\n\n<div class="menu">\n  <div class="item">Início</div>\n  <div class="item">Perfil</div>\n  <div class="item">Sair</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: 'Repare no efeito colateral: com `flex-direction: column`, se você quiser centralizar os itens **na horizontal** agora vai usar `align-items: center` (o eixo cruzado virou horizontal), enquanto `justify-content` cuida da distribuição **na vertical**. Sempre que um alinhamento parecer estranho, volte e pergunte: "qual é o meu eixo principal agora?".',
                    },
                    {
                        type: "text",
                        value: "## `flex-wrap`: deixando os itens quebrarem\n\nPor padrão, o Flexbox tenta manter **todos os itens na mesma linha**, custe o que custar. Se não couberem, ele **espreme** os itens para caber (esse padrão se chama `nowrap`). Em telas pequenas, isso deixa tudo apertado.\n\nCom `flex-wrap: wrap`, você libera os itens para **pular para a linha de baixo** quando o espaço acabar, igual às palavras de um texto que quebram para a próxima linha. Essa é a base de layouts que se adaptam a diferentes tamanhos de tela.\n\n- `nowrap` (padrão): tudo numa linha só, mesmo que aperte.\n- `wrap`: quebra para novas linhas quando necessário.\n- `wrap-reverse`: quebra, mas empilhando as linhas na direção contrária.",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .galeria {\n    display: flex;\n    flex-wrap: wrap;   /* os itens pulam de linha quando não cabem */\n    background: #f1f5f9;\n    padding: 10px;\n  }\n  .foto {\n    background: #0ea5e9;\n    color: white;\n    width: 150px;\n    height: 80px;\n    margin: 5px;\n  }\n</style>\n\n<div class="galeria">\n  <div class="foto">1</div>\n  <div class="foto">2</div>\n  <div class="foto">3</div>\n  <div class="foto">4</div>\n  <div class="foto">5</div>\n  <div class="foto">6</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: "## `gap`: o espaço entre os itens\n\nAté aqui, para afastar um item do outro, a gente vinha usando `margin` em cada um. Funciona, mas tem um efeito chato: sobra margem nas **pontas**, e a conta fica confusa. O jeito moderno e bem mais simples é a propriedade `gap`, aplicada **no container**.\n\nO `gap` define uma **distância uniforme** só **entre** os itens, sem sobrar espaço nas bordas. Uma única linha resolve o espaçamento de todos:\n\n- `gap: 16px` deixa 16px entre os itens, tanto na horizontal quanto na vertical (quando há quebra).\n- Dá para usar dois valores: `gap: 20px 10px` (20px entre as linhas, 10px entre as colunas).",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .cartoes {\n    display: flex;\n    gap: 16px;   /* 16px só entre os itens, sem sobrar nas bordas */\n    background: #f1f5f9;\n    padding: 16px;\n  }\n  .cartao {\n    background: #8b5cf6;\n    color: white;\n    padding: 20px 30px;\n  }\n</style>\n\n<div class="cartoes">\n  <div class="cartao">Um</div>\n  <div class="cartao">Dois</div>\n  <div class="cartao">Três</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: "## `order`: mudando a ordem visual\n\nNormalmente os itens aparecem na **mesma ordem** em que estão escritos no HTML. A propriedade `order` permite mudar essa ordem **visual** sem tocar no HTML. Ela recebe um número, e os itens são exibidos do **menor para o maior**.\n\nPor padrão, todo item tem `order: 0`. Se você der `order: 1` a um item, ele vai para o **fim** (porque 1 é maior que 0). Se der `order: -1`, ele vai para o **começo** (porque -1 é menor que 0).\n\nÉ útil para reorganizar blocos em telas diferentes, mas use com cuidado: ele muda só a ordem **visual**, não a ordem em que o conteúdo é **lido** por leitores de tela. Ou seja, não abuse dele, para não atrapalhar quem depende da acessibilidade.",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .fila {\n    display: flex;\n    gap: 8px;\n  }\n  .item {\n    background: #64748b;\n    color: white;\n    padding: 16px 24px;\n  }\n  .destaque {\n    order: -1;          /* vai para o começo, mesmo escrito por último */\n    background: #ef4444;\n  }\n</style>\n\n<div class="fila">\n  <div class="item">1º no HTML</div>\n  <div class="item">2º no HTML</div>\n  <div class="item destaque">3º no HTML</div>\n</div>',
                    },
                    {
                        type: "table",
                        value: '[["Propriedade","Onde se aplica","Para que serve"],["`flex-direction`","No container","Linha (`row`) ou coluna (`column`); gira os eixos"],["`flex-wrap`","No container","Permite os itens quebrarem para outra linha"],["`gap`","No container","Espaço uniforme entre os itens"],["`order`","No item","Muda a ordem visual (menor aparece primeiro)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet:** `flex-direction` escolhe a direção da fila, `row` (padrão) ou `column`, e ao virar coluna os **eixos giram** (o principal passa a ser vertical). `flex-wrap: wrap` deixa os itens **quebrarem** para a próxima linha quando não cabem. `gap` cria um espaço **uniforme só entre** os itens, o jeito moderno de substituir as margens. E `order` reordena os itens **visualmente** (menor primeiro) sem mudar o HTML, use com parcimônia por causa da acessibilidade.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual valor de `flex-direction` empilha os itens em uma coluna, de cima para baixo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`column`",
                                isCorrect: true,
                            },
                            {
                                text: "`row`",
                                isCorrect: false,
                            },
                            {
                                text: "`vertical`",
                                isCorrect: false,
                            },
                            {
                                text: "`stack`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual propriedade cria um espaço uniforme apenas entre os itens de um container flex?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`gap`",
                                isCorrect: true,
                            },
                            {
                                text: "`padding`",
                                isCorrect: false,
                            },
                            {
                                text: "`order`",
                                isCorrect: false,
                            },
                            {
                                text: "`margin: auto`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que a declaração `flex-wrap: wrap` permite?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que os itens pulem para a próxima linha quando não cabem na atual.",
                                isCorrect: true,
                            },
                            {
                                text: "Que todos os itens sejam espremidos em uma única linha.",
                                isCorrect: false,
                            },
                            {
                                text: "Que os itens fiquem centralizados na vertical.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a ordem dos itens seja invertida.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao mudar `flex-direction` para `column`, o que acontece com o `justify-content`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O eixo principal vira vertical, então `justify-content` passa a alinhar os itens na vertical.",
                                isCorrect: true,
                            },
                            {
                                text: "Nada muda: `justify-content` continua alinhando na horizontal.",
                                isCorrect: false,
                            },
                            {
                                text: "O `justify-content` deixa de funcionar completamente.",
                                isCorrect: false,
                            },
                            {
                                text: "Os itens desaparecem da tela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um item foi escrito por último no HTML, mas você quer que ele apareça primeiro na tela. Qual solução e qual cuidado?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Dar a ele um `order` menor que o dos outros (como `-1`); o cuidado é que isso muda só a ordem visual, não a lida por leitores de tela.",
                                isCorrect: true,
                            },
                            {
                                text: "Usar `order: 100`, que sempre leva o item para o começo.",
                                isCorrect: false,
                            },
                            {
                                text: "Não é possível reordenar sem reescrever o HTML.",
                                isCorrect: false,
                            },
                            {
                                text: "Usar `flex-wrap: wrap-reverse`, que reordena os itens sem nenhum efeito colateral.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Dimensionando os itens",
                blocks: [
                    {
                        type: "text",
                        value: '# Dimensionando os itens\n\nVocê já sabe organizar, alinhar e espaçar os itens. Falta a última peça do Flexbox: controlar o **tamanho** de cada item, quanto ele pode **crescer**, quanto pode **encolher** e qual é o seu tamanho **de partida**. É isso que dá aquele efeito "elástico" em que uns itens esticam para ocupar o espaço e outros ficam fixos.\n\nNo fim da aula, a gente junta tudo o que viu no módulo para montar uma **barra de navegação** de verdade. Bora fechar o Flexbox com chave de ouro.',
                    },
                    {
                        type: "quote",
                        value: "Cada item flexível tem três controles de tamanho no eixo principal: `flex-grow` (quanto ele pode **crescer** para ocupar a sobra de espaço), `flex-shrink` (quanto ele pode **encolher** quando falta espaço) e `flex-basis` (o tamanho **inicial**, antes de crescer ou encolher). O atalho `flex` junta os três em uma linha. E `align-self` deixa **um** item quebrar o alinhamento definido pelo container.",
                    },
                    {
                        type: "text",
                        value: '## `flex-grow`: crescer para ocupar a sobra\n\nQuando sobra espaço no eixo principal, o `flex-grow` decide se um item **estica** para ocupar essa folga. Ele recebe um número que funciona como um **peso**:\n\n- `flex-grow: 0` (padrão): o item **não cresce**, mantém o tamanho.\n- `flex-grow: 1`: o item **cresce** para ocupar o espaço livre.\n- Se vários itens têm `flex-grow`, o espaço é dividido na **proporção** dos números. Um item com `flex-grow: 2` fica com o **dobro** da sobra em relação a um com `flex-grow: 1`.\n\nPense no número como "quantas fatias do espaço que sobra este item quer".',
                    },
                    {
                        type: "code",
                        value: '<style>\n  .barra {\n    display: flex;\n    gap: 8px;\n  }\n  .item {\n    background: #6366f1;\n    color: white;\n    padding: 16px;\n  }\n  .cresce {\n    flex-grow: 1;   /* este item estica e ocupa toda a sobra */\n  }\n</style>\n\n<div class="barra">\n  <div class="item">Fixo</div>\n  <div class="item cresce">Eu estico</div>\n  <div class="item">Fixo</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: '## `flex-shrink`: encolher quando falta espaço\n\nO `flex-shrink` é o oposto do `flex-grow`: ele entra em ação quando **falta** espaço e os itens precisam **encolher** para caber. Também é um número que funciona como peso:\n\n- `flex-shrink: 1` (padrão): o item **pode encolher** se necessário.\n- `flex-shrink: 0`: o item **não encolhe** de jeito nenhum, mantém o tamanho mesmo que estoure.\n- Quanto **maior** o número, **mais** o item cede espaço em relação aos outros.\n\nUm uso comum de `flex-shrink: 0` é impedir que um logotipo ou um ícone seja "amassado" quando a tela fica estreita.',
                    },
                    {
                        type: "code",
                        value: '<style>\n  .barra {\n    display: flex;\n    width: 300px;   /* pouco espaço, de propósito */\n    gap: 8px;\n  }\n  .item {\n    background: #10b981;\n    color: white;\n    padding: 16px;\n    width: 150px;\n  }\n  .nao-encolhe {\n    flex-shrink: 0;  /* mantém os 150px mesmo faltando espaço */\n    background: #ef4444;\n  }\n</style>\n\n<div class="barra">\n  <div class="item">Encolho</div>\n  <div class="item">Encolho</div>\n  <div class="item nao-encolhe">Firme</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: '## `flex-basis`: o tamanho de partida\n\nO `flex-basis` define o tamanho **inicial** do item no eixo principal, **antes** de o grow e o shrink entrarem em ação. É como o "ponto de partida" da negociação de espaço.\n\n- O padrão é `auto`, que usa o tamanho natural do conteúdo (ou a `width`/`height`, se houver uma).\n- Você pode fixar um valor: `flex-basis: 200px` diz "comece com 200px e, a partir daí, cresça ou encolha".\n\nNa prática, dentro do Flexbox costuma-se preferir o `flex-basis` no lugar de `width` para definir o tamanho base, porque ele se integra melhor à lógica de crescer e encolher.',
                    },
                    {
                        type: "text",
                        value: "## O atalho `flex`: três em um\n\nEscrever `flex-grow`, `flex-shrink` e `flex-basis` separados dá trabalho. Por isso existe o atalho `flex`, que junta os três em uma linha, **nesta ordem**: `flex: <grow> <shrink> <basis>`.\n\nAlguns atalhos que você vai ver o tempo todo:\n\n- `flex: 1` é o mesmo que `flex: 1 1 0`: o item cresce, encolhe e parte do zero. É o jeito clássico de fazer itens dividirem o espaço **igualmente**.\n- `flex: 0 0 auto` trava o item no tamanho do conteúdo (não cresce nem encolhe).\n- `flex: 0 0 200px` fixa o item em 200px, firme.",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .colunas {\n    display: flex;\n    gap: 8px;\n  }\n  .coluna {\n    flex: 1;   /* atalho de 1 1 0: todas dividem o espaço por igual */\n    background: #8b5cf6;\n    color: white;\n    padding: 20px;\n    text-align: center;\n  }\n</style>\n\n<div class="colunas">\n  <div class="coluna">1/3</div>\n  <div class="coluna">1/3</div>\n  <div class="coluna">1/3</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: "## `align-self`: a exceção de um item só\n\nLá na aula 2, o `align-items` alinhava **todos** os itens no eixo cruzado de uma vez. Mas e se você quiser que **um único** item se comporte diferente dos demais? Para isso existe o `align-self`, aplicado **no item** (e não no container).\n\nEle aceita os mesmos valores do `align-items` (`flex-start`, `center`, `flex-end`, `stretch`, `baseline`) e **sobrescreve**, só para aquele item, o alinhamento definido pelo container. É a maneira de abrir uma exceção sem bagunçar o resto.",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .painel {\n    display: flex;\n    align-items: flex-start;  /* todos no topo... */\n    height: 200px;\n    gap: 8px;\n    background: #f1f5f9;\n  }\n  .item {\n    background: #0ea5e9;\n    color: white;\n    padding: 16px;\n  }\n  .especial {\n    align-self: center;  /* ...menos este, que vai para o meio */\n    background: #f59e0b;\n  }\n</style>\n\n<div class="painel">\n  <div class="item">Topo</div>\n  <div class="item especial">Meio</div>\n  <div class="item">Topo</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: "## Juntando tudo: uma barra de navegação\n\nAgora o grand finale: uma **barra de navegação** de verdade, usando quase tudo o que você aprendeu no módulo. O padrão é clássico: **logo à esquerda**, **links à direita**, tudo **alinhado na vertical** e com **espaço** entre os links.\n\nOs ingredientes:\n\n- `display: flex` no `<nav>` para colocar tudo em linha.\n- `justify-content: space-between` para empurrar o logo para uma ponta e os links para a outra.\n- `align-items: center` para centralizar tudo na vertical.\n- `gap` para espaçar os links entre si.",
                    },
                    {
                        type: "code",
                        value: '<style>\n  .navbar {\n    display: flex;\n    justify-content: space-between; /* logo numa ponta, links na outra */\n    align-items: center;            /* tudo centralizado na vertical  */\n    background: #1e293b;\n    padding: 16px 24px;\n  }\n  .logo {\n    color: white;\n    font-size: 20px;\n    font-weight: bold;\n  }\n  .links {\n    display: flex;\n    gap: 24px;   /* espaço entre os links */\n  }\n  .links a {\n    color: #cbd5e1;\n    text-decoration: none;\n  }\n</style>\n\n<nav class="navbar">\n  <div class="logo">ensina.dev</div>\n  <div class="links">\n    <a href="#">Início</a>\n    <a href="#">Trilhas</a>\n    <a href="#">Entrar</a>\n  </div>\n</nav>',
                    },
                    {
                        type: "table",
                        value: '[["Propriedade","Valor padrão","O que controla"],["`flex-grow`","`0`","Quanto o item cresce na sobra de espaço"],["`flex-shrink`","`1`","Quanto o item encolhe na falta de espaço"],["`flex-basis`","`auto`","Tamanho inicial antes de crescer ou encolher"],["`flex: 1`","(atalho)","Igual a `1 1 0`: divide o espaço por igual"],["`align-self`","`auto`","Alinhamento no eixo cruzado de um item só"]]',
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet final do módulo:** no eixo principal, `flex-grow` faz o item **crescer** na sobra, `flex-shrink` o faz **encolher** na falta, e `flex-basis` define o **tamanho inicial**. O atalho `flex: 1 1 0` (ou só `flex: 1`) faz itens **dividirem o espaço igualmente**. O `align-self` abre uma **exceção** de alinhamento para um item. Juntando `display: flex`, `justify-content`, `align-items` e `gap`, você monta layouts como uma **barra de navegação** em poucas linhas. Parabéns, você concluiu o módulo de Flexbox!",
                    },
                ],
                questions: [
                    {
                        statement: "O que `flex-grow: 1` faz com um item?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Permite que ele cresça para ocupar o espaço que sobra no eixo principal.",
                                isCorrect: true,
                            },
                            {
                                text: "Faz o item encolher até desaparecer.",
                                isCorrect: false,
                            },
                            {
                                text: "Centraliza o item na vertical.",
                                isCorrect: false,
                            },
                            {
                                text: "Muda a cor de fundo do item.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O atalho `flex` reúne quais três propriedades, nesta ordem?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`flex-grow`, `flex-shrink` e `flex-basis`.",
                                isCorrect: true,
                            },
                            {
                                text: "`flex-basis`, `flex-grow` e `flex-shrink`.",
                                isCorrect: false,
                            },
                            {
                                text: "`justify-content`, `align-items` e `gap`.",
                                isCorrect: false,
                            },
                            {
                                text: "`width`, `height` e `margin`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você quer que três colunas dividam o espaço disponível igualmente. Qual declaração, aplicada a cada coluna, resolve isso de forma mais direta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`flex: 1`",
                                isCorrect: true,
                            },
                            {
                                text: "`width: 33px`",
                                isCorrect: false,
                            },
                            {
                                text: "`flex-shrink: 0`",
                                isCorrect: false,
                            },
                            {
                                text: "`order: 1`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para que serve o `align-self` aplicado a um item?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Sobrescrever, só para aquele item, o alinhamento no eixo cruzado definido pelo container.",
                                isCorrect: true,
                            },
                            {
                                text: "Alinhar de uma vez todos os itens do container.",
                                isCorrect: false,
                            },
                            {
                                text: "Definir o espaço entre os itens.",
                                isCorrect: false,
                            },
                            {
                                text: "Mudar a direção do container para coluna.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Numa barra de navegação com o logo à esquerda e os links à direita, qual conjunto de propriedades no container produz esse layout?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`display: flex` com `justify-content: space-between` e `align-items: center`.",
                                isCorrect: true,
                            },
                            {
                                text: "`display: flex` com `flex-direction: column` e `flex-wrap: wrap`.",
                                isCorrect: false,
                            },
                            {
                                text: "`display: block` com `text-align: right`.",
                                isCorrect: false,
                            },
                            {
                                text: "`justify-content: center` com `flex-grow: 0` em todos os itens.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Grid",
        aulas: [
            {
                titulo: "Introdução ao Grid",
                blocks: [
                    {
                        type: "text",
                        value: '# Introdução ao Grid\n\nSe você acompanhou o módulo anterior, acabou de conhecer o **Flexbox** e viu como ele é ótimo para alinhar coisas em **uma linha** ou **uma coluna**. Guarde essa ideia de "uma direção de cada vez", porque agora a gente dá um passo adiante.\n\nChegou a vez do **Grid**, a ferramenta mais poderosa que o CSS tem para montar **layouts** de página. Com ele você organiza o conteúdo em **linhas e colunas ao mesmo tempo**, como se desenhasse uma grade e fosse encaixando as coisas nos espaços. Parece coisa de gente avançada, mas você vai ver que é surpreendentemente intuitivo. Bora do zero, com calma.',
                    },
                    {
                        type: "quote",
                        value: "O **Grid** é o sistema de layout do CSS feito para **duas dimensões**: **linhas e colunas** ao mesmo tempo. Você liga o grid no elemento **pai** (o container) com `display: grid`, define o formato da grade com propriedades como `grid-template-columns`, e os elementos **filhos** se encaixam sozinhos nas células dessa grade.",
                    },
                    {
                        type: "text",
                        value: "## De uma dimensão para duas\n\nAntes de mais nada, vale entender a diferença entre o Flexbox e o Grid. Os dois servem para posicionar elementos, mas pensam de formas diferentes.\n\n- O **Flexbox** trabalha em **uma dimensão** por vez: ou uma **linha** (itens lado a lado) ou uma **coluna** (itens empilhados). É como arrumar livros numa **única prateleira**.\n- O **Grid** trabalha em **duas dimensões** de uma vez só: **linhas e colunas juntas**. É como uma **estante inteira**, cheia de prateleiras e divisórias, em que cada objeto tem o seu quadradinho.\n\nUma imagem que ajuda demais: pense numa folha de **papel quadriculado** ou num **tabuleiro de xadrez**. Você decide quantas colunas e quantas linhas quer, e isso cria um monte de **células** (os quadradinhos). O conteúdo vai ocupando essas células. Essa é a alma do Grid.",
                    },
                    {
                        type: "text",
                        value: "## Ligando o grid: `display: grid`\n\nTodo grid começa por um **container**, o elemento **pai** que vai segurar os itens. Para transformar um elemento comum em um container de grid, você aplica `display: grid` nele, do mesmo jeito que fazia `display: flex` no Flexbox.\n\nA partir daí acontece uma mágica silenciosa: os **filhos diretos** desse container viram automaticamente **itens do grid**. Você não precisa configurar nada neles ainda; eles já entram na dança. Veja um HTML bem simples, um container `grade` com três caixas dentro:",
                    },
                    {
                        type: "code",
                        value: '<div class="grade">\n  <div class="caixa">1</div>\n  <div class="caixa">2</div>\n  <div class="caixa">3</div>\n</div>',
                    },
                    {
                        type: "code",
                        value: ".grade {\n  display: grid;\n}",
                    },
                    {
                        type: "text",
                        value: "## Só `display: grid` ainda não basta\n\nSe você aplicar apenas o `display: grid` como acima, o resultado pode decepcionar: as três caixas continuam **empilhadas uma embaixo da outra**, como se nada tivesse mudado. Calma, faz todo sentido.\n\nÉ que o grid ainda não sabe **quantas colunas** você quer. Sem essa informação, ele assume o padrão: **uma única coluna**, e vai empilhando as linhas. Ou seja, o `display: grid` só **prepara o terreno**. Quem de fato desenha a grade é a próxima propriedade.",
                    },
                    {
                        type: "text",
                        value: "## Definindo as colunas: `grid-template-columns`\n\nA propriedade `grid-template-columns` é o coração do Grid. Ela vai no **container** e serve para dizer **quantas colunas** a grade tem e **qual a largura de cada uma**.\n\nA regra é direta: você escreve um valor de largura **para cada coluna** que quiser, separados por espaço. Três valores, três colunas. Quatro valores, quatro colunas. Veja como criar três colunas fixas de 200 pixels cada:",
                    },
                    {
                        type: "code",
                        value: ".grade {\n  display: grid;\n  grid-template-columns: 200px 200px 200px;\n}",
                    },
                    {
                        type: "text",
                        value: "Agora sim: as três caixas ficam **lado a lado**, cada uma numa coluna de 200px. Se houvesse uma quarta caixa, ela **pularia para a linha de baixo**, na primeira coluna, porque a grade só tem três colunas. O grid cria as novas linhas sozinho conforme o conteúdo chega.\n\nRepare no padrão: **a quantidade de valores define a quantidade de colunas**. Isso vai te acompanhar pelo Grid inteiro.\n\nSó tem um porém: larguras fixas em `px` são meio teimosas. Se a tela do visitante for menor que 600px (200 + 200 + 200), o conteúdo vaza para fora. Precisamos de algo mais flexível.",
                    },
                    {
                        type: "text",
                        value: '## A unidade `fr`: repartindo o espaço\n\nAí entra a estrela do Grid: a unidade `fr`, de **fração** (_fraction_, em inglês). Em vez de dizer "esta coluna tem 200 pixels", você diz "esta coluna fica com **uma fatia** do espaço disponível". O grid soma todas as frações e reparte o espaço proporcionalmente entre as colunas.\n\nA analogia perfeita é uma **pizza**: não importa o tamanho exato da pizza, o que importa é **em quantas fatias** você a divide. Se você pede três colunas de `1fr` cada, o container é dividido em três fatias iguais. Se a tela cresce, as três crescem juntas; se encolhe, encolhem juntas, sempre ocupando a largura toda sem vazar.',
                    },
                    {
                        type: "code",
                        value: "/* Três colunas de tamanho igual, cada uma com 1 fatia do espaço */\n.grade {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n}",
                    },
                    {
                        type: "text",
                        value: "E se você quiser colunas de tamanhos **diferentes**? É só dar mais fatias para umas do que para outras. Pense em `2fr 1fr`: são três fatias no total, a primeira coluna leva **duas** e a segunda leva **uma**. Ou seja, a primeira fica com o **dobro** da largura da segunda.",
                    },
                    {
                        type: "code",
                        value: "/* A primeira coluna fica com o dobro da largura da segunda */\n.grade {\n  display: grid;\n  grid-template-columns: 2fr 1fr;\n}",
                    },
                    {
                        type: "text",
                        value: 'O melhor é que dá para **misturar** `fr` com larguras fixas. Um caso clássico de site: uma **barra lateral** (menu) com largura fixa e uma **área de conteúdo** que ocupa todo o resto. Escrevemos `200px 1fr`: a primeira coluna tem 200px cravados, e o `1fr` da segunda significa "pega tudo o que sobrar".',
                    },
                    {
                        type: "code",
                        value: "/* Barra lateral fixa + conteúdo que ocupa o resto */\n.grade {\n  display: grid;\n  grid-template-columns: 200px 1fr;\n}",
                    },
                    {
                        type: "text",
                        value: '## Menos repetição: `repeat()`\n\nEscrever `1fr 1fr 1fr 1fr` já é meio chato. Imagine `1fr` doze vezes para uma grade grande. Para evitar essa repetição cansativa, o Grid oferece a função `repeat()`.\n\nEla recebe duas coisas: **quantas vezes** repetir e **o que** repetir. Assim, `repeat(3, 1fr)` quer dizer "repita `1fr` três vezes", que é exatamente o mesmo que escrever `1fr 1fr 1fr`, só que muito mais curto e fácil de manter.',
                    },
                    {
                        type: "code",
                        value: "/* Estas duas regras produzem exatamente a mesma grade */\n.grade {\n  grid-template-columns: repeat(3, 1fr);\n}\n\n/* ...é o mesmo que escrever: */\n.grade {\n  grid-template-columns: 1fr 1fr 1fr;\n}",
                    },
                    {
                        type: "table",
                        value: '[["Você escreve","O que acontece","Quando usar"],["`200px 200px`","Duas colunas fixas de 200px","Quando a largura precisa ser exata"],["`1fr 1fr 1fr`","Três colunas iguais que dividem o espaço","O caso mais comum: colunas flexíveis"],["`2fr 1fr`","Primeira coluna com o dobro da segunda","Colunas com proporções diferentes"],["`200px 1fr`","Uma fixa e outra que ocupa o resto","Barra lateral + conteúdo"],["`repeat(4, 1fr)`","Quatro colunas iguais, sem repetição","Muitas colunas do mesmo tamanho"]]',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** o **Grid** faz layout em **2 dimensões**. Ligue-o no container com `display: grid` e defina as colunas com `grid-template-columns`, em que **cada valor é uma coluna**. Use `px` para larguras fixas e a unidade `fr` (fração) para dividir o espaço proporcionalmente, tipo fatias de pizza (`1fr 1fr 1fr` são três colunas iguais). Misture os dois quando precisar (`200px 1fr`) e use `repeat()` para não repetir valores (`repeat(3, 1fr)`).",
                    },
                ],
                questions: [
                    {
                        statement: "Em qual elemento você aplica a propriedade `display: grid`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "No elemento pai (o container), para que os filhos diretos virem itens do grid.",
                                isCorrect: true,
                            },
                            {
                                text: "Em cada elemento filho, um por um.",
                                isCorrect: false,
                            },
                            {
                                text: "Sempre na tag `<body>`, e em nenhum outro lugar.",
                                isCorrect: false,
                            },
                            {
                                text: "Dentro do seletor `:root`, obrigatoriamente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A regra `grid-template-columns: 1fr 1fr 1fr;` cria quantas colunas?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Três colunas de tamanho igual.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma única coluna com o triplo da largura.",
                                isCorrect: false,
                            },
                            {
                                text: "Três linhas empilhadas, não colunas.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma; a unidade `fr` não funciona em colunas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que significa a unidade `fr` em `grid-template-columns`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma fração do espaço disponível; o grid reparte o espaço proporcionalmente entre as frações.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma medida fixa sempre igual a 16 pixels.",
                                isCorrect: false,
                            },
                            {
                                text: "A moldura (frame) que envolve o grid por fora.",
                                isCorrect: false,
                            },
                            {
                                text: "A quantidade de linhas que o grid terá.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor `repeat(4, 1fr)` é equivalente a qual outro valor?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`1fr 1fr 1fr 1fr`",
                                isCorrect: true,
                            },
                            {
                                text: "`4fr`",
                                isCorrect: false,
                            },
                            {
                                text: "`1fr 4fr`",
                                isCorrect: false,
                            },
                            {
                                text: "`repeat(1fr, 4)`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você quer uma barra lateral fixa de 250px e uma área de conteúdo que ocupe todo o espaço restante. Qual valor faz isso?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`grid-template-columns: 250px 1fr;`",
                                isCorrect: true,
                            },
                            {
                                text: "`grid-template-columns: 250px 250px;`",
                                isCorrect: false,
                            },
                            {
                                text: "`grid-template-columns: 1fr 1fr;`",
                                isCorrect: false,
                            },
                            {
                                text: "`grid-template-columns: repeat(2, 250px);`",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Espaçamento e posicionamento",
                blocks: [
                    {
                        type: "text",
                        value: "# Espaçamento e posicionamento\n\nNa aula anterior você aprendeu a criar colunas com `grid-template-columns`, a unidade `fr` e a função `repeat()`. Já dá para montar grades bem úteis! Agora vamos deixar tudo mais bonito e mais poderoso.\n\nNesta aula você vai aprender três coisas: como colocar um **respiro** entre as células com `gap`, como controlar as **linhas** (as fileiras horizontais) com `grid-template-rows`, e como **posicionar um item específico** para ele ocupar mais de uma célula. No caminho, você vai conhecer as **linhas numeradas** do grid, que são a régua invisível que segura tudo no lugar.",
                    },
                    {
                        type: "quote",
                        value: "O `gap` cria um **espaçamento** entre as células do grid. O `grid-template-rows` define a **altura das linhas**, assim como `grid-template-columns` define as colunas. E, para **posicionar um item** manualmente, você usa `grid-column` e `grid-row` apontando para as **linhas numeradas** do grid, aquelas que separam uma célula da outra.",
                    },
                    {
                        type: "text",
                        value: "## Espaço entre as células: `gap`\n\nPor padrão, as células de um grid ficam **coladas** umas nas outras, sem nenhum respiro. Na maioria dos layouts a gente quer um espacinho entre elas, e é aí que entra o `gap`.\n\nO `gap` vai no **container** e define o tamanho do vão entre as células, tanto na horizontal quanto na vertical. A analogia é o **rejunte entre azulejos**: o azulejo é a célula, e o rejunte é aquele espaço regular que separa um do outro. Um único valor já cuida de todos os vãos:",
                    },
                    {
                        type: "code",
                        value: ".grade {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}",
                    },
                    {
                        type: "text",
                        value: "Com `gap: 16px`, todas as células ganham 16 pixels de distância entre si. Um detalhe importante e muito conveniente: o `gap` cria espaço **só entre** as células, **nunca nas bordas externas** do grid. Ou seja, você não fica com um vão sobrando grudado na parede do container.\n\nSe quiser vãos diferentes na horizontal e na vertical, dá para usar dois valores: o primeiro é o espaço **entre as linhas** e o segundo, **entre as colunas**. Também existem as versões `row-gap` e `column-gap` para controlar cada um por conta própria.",
                    },
                    {
                        type: "code",
                        value: "/* Um valor: mesmo espaço em todas as direções */\n.grade {\n  gap: 16px;\n}\n\n/* Dois valores: 24px entre as linhas, 8px entre as colunas */\n.grade {\n  gap: 24px 8px;\n}",
                    },
                    {
                        type: "text",
                        value: "## Definindo as linhas: `grid-template-rows`\n\nAté agora só falamos de colunas. Mas o Grid é 2D, lembra? Então existe uma propriedade gêmea para as **linhas** (as fileiras horizontais): a `grid-template-rows`. Ela funciona **exatamente igual** à de colunas, só que controla a **altura** de cada linha em vez da largura.\n\nEscreva um valor para cada linha que quiser definir. Aqui criamos uma grade com duas colunas e duas linhas, a primeira linha com 100px de altura e a segunda com 200px:",
                    },
                    {
                        type: "code",
                        value: ".grade {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  grid-template-rows: 100px 200px;\n  gap: 10px;\n}",
                    },
                    {
                        type: "text",
                        value: 'Uma dúvida comum: "e se eu tiver mais itens do que as linhas que defini?". Sem problema. Você define as linhas que quiser controlar, e o grid **cria as linhas restantes sozinho**, com a altura necessária para o conteúdo caber.\n\nPor isso, na prática, é muito comum definir só as colunas e **deixar as linhas por conta do grid**. Mas quando você precisa de uma altura específica, como um cabeçalho de 80px ou um rodapé baixinho, o `grid-template-rows` é a ferramenta certa.',
                    },
                    {
                        type: "text",
                        value: '## A régua invisível: as linhas do grid\n\nAqui vem uma ideia que destrava o posicionamento no Grid. Toda grade é cercada por **linhas numeradas**, chamadas em inglês de _grid lines_. Não confunda com as "fileiras": aqui, "linha" quer dizer o **traço** que separa uma célula da outra, como as linhas de um caderno ou as marcas de uma régua.\n\nO detalhe que pega todo mundo: a numeração começa em **1**, e ela conta os **traços**, não as células. Então, se você tem **3 colunas**, existem **4 linhas verticais**: uma antes da primeira coluna (número 1), uma entre a primeira e a segunda (número 2), outra entre a segunda e a terceira (número 3) e uma depois da última (número 4). É sempre **uma linha a mais** do que a quantidade de colunas.',
                    },
                    {
                        type: "code",
                        value: "/*\n  Grade com 3 colunas e as suas 4 linhas verticais:\n\n  1           2           3           4\n  |  coluna 1 |  coluna 2 |  coluna 3 |\n  |___________|___________|___________|\n*/",
                    },
                    {
                        type: "text",
                        value: '## Posicionando um item: `grid-column` e `grid-row`\n\nAgora a parte divertida. Sabendo os números das linhas, você pode pegar um item **específico** e dizer exatamente **onde ele começa e onde termina**. Para isso existem duas propriedades, que dessa vez vão no **item filho** (e não no container):\n\n- `grid-column`: em quais linhas **verticais** o item começa e termina (controla a largura em colunas).\n- `grid-row`: em quais linhas **horizontais** o item começa e termina (controla a altura em linhas).\n\nA sintaxe usa uma barra: `início / fim`. Por exemplo, `grid-column: 1 / 3` significa "comece na linha 1 e vá até a linha 3". Como isso atravessa a coluna 1 e a coluna 2, o item ocupa **duas colunas**.',
                    },
                    {
                        type: "code",
                        value: ".grade {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 10px;\n}\n\n/* Este item começa na linha 1 e vai até a linha 3: ocupa 2 colunas */\n.destaque {\n  grid-column: 1 / 3;\n}",
                    },
                    {
                        type: "text",
                        value: 'Preste atenção na conta: da **linha 1 até a linha 3** são **duas** células no meio (a coluna 1 e a coluna 2). É por isso que `1 / 3` ocupa duas colunas, e não três. No começo isso confunde, mas depois de fazer umas duas vezes vira automático.\n\nExiste um atalho para quem só quer saber "quantas células ocupar" sem contar linha por linha: a palavra `span` (que significa "estender por"). Escrever `grid-column: span 2` quer dizer "ocupe 2 colunas a partir de onde eu estiver", sem precisar decorar o número da linha final.',
                    },
                    {
                        type: "code",
                        value: "/* Ocupa 2 colunas, sem precisar contar as linhas */\n.destaque {\n  grid-column: span 2;\n}\n\n/* Dá para combinar: ocupa 2 colunas E 2 linhas (um item grande) */\n.banner {\n  grid-column: span 2;\n  grid-row: span 2;\n}",
                    },
                    {
                        type: "table",
                        value: '[["Propriedade","Vai no...","Para que serve"],["`gap`","Container","Espaço entre as células"],["`grid-template-rows`","Container","Altura de cada linha (fileira)"],["`grid-column`","Item filho","Em quais colunas o item começa e termina"],["`grid-row`","Item filho","Em quais linhas o item começa e termina"],["`span 2`","Item filho","Atalho para ocupar 2 células a partir da posição atual"]]',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** o `gap` (no container) cria o respiro **entre** as células, como o rejunte de azulejos, sem sobrar nas bordas. O `grid-template-rows` define a **altura das linhas**, e o grid cria sozinho as linhas que faltarem. Para posicionar um item, use `grid-column` e `grid-row` (no **filho**) apontando as **linhas numeradas** no formato `início / fim`, lembrando que `1 / 3` ocupa **2 células**. O atalho `span 2` ocupa 2 células sem contar linhas.",
                    },
                ],
                questions: [
                    {
                        statement: "Para que serve a propriedade `gap` em um grid?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Cria o espaçamento entre as células do grid.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumenta o número de colunas automaticamente.",
                                isCorrect: false,
                            },
                            {
                                text: "Deixa o texto das células em negrito.",
                                isCorrect: false,
                            },
                            {
                                text: "Remove o container do grid.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em qual elemento você aplica `grid-column` e `grid-row`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "No item filho que você quer posicionar.",
                                isCorrect: true,
                            },
                            {
                                text: "Sempre no container pai do grid.",
                                isCorrect: false,
                            },
                            {
                                text: "Na tag `<html>`.",
                                isCorrect: false,
                            },
                            {
                                text: "No seletor de cada parágrafo da página.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que a propriedade `grid-template-rows` controla?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A altura de cada linha (fileira horizontal) do grid.",
                                isCorrect: true,
                            },
                            {
                                text: "A largura de cada coluna do grid.",
                                isCorrect: false,
                            },
                            {
                                text: "O espaço entre as células.",
                                isCorrect: false,
                            },
                            {
                                text: "A cor de fundo das linhas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Numa grade com 3 colunas, quantas linhas verticais numeradas existem?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "4, sempre uma a mais do que o número de colunas.",
                                isCorrect: true,
                            },
                            {
                                text: "3, uma para cada coluna.",
                                isCorrect: false,
                            },
                            {
                                text: "2, apenas as das bordas.",
                                isCorrect: false,
                            },
                            {
                                text: "6, duas para cada coluna.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Um item tem `grid-column: 1 / 3;`. Quantas colunas ele ocupa?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "2 colunas, porque vai da linha 1 até a linha 3, atravessando as colunas 1 e 2.",
                                isCorrect: true,
                            },
                            {
                                text: "3 colunas, uma para cada número que aparece na regra.",
                                isCorrect: false,
                            },
                            {
                                text: "1 coluna, apenas a de número 1.",
                                isCorrect: false,
                            },
                            {
                                text: "4 colunas, contando também as bordas.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Áreas nomeadas",
                blocks: [
                    {
                        type: "text",
                        value: '# Áreas nomeadas\n\nNa aula passada você posicionou itens contando as **linhas numeradas** do grid. Funciona muito bem, mas convenhamos: ficar contando "linha 1, linha 3, linha 4..." pode dar um nó na cabeça em layouts maiores.\n\nBoa notícia: o Grid tem um jeito **muito mais visual** de organizar a página, quase como desenhar. Chama-se **áreas nomeadas**. A ideia é dar **nomes** aos pedaços do layout (tipo "cabeçalho", "menu", "conteúdo") e depois **desenhar** onde cada um fica, usando esses nomes. É a forma mais intuitiva de montar o layout de uma página inteira. Vem ver.',
                    },
                    {
                        type: "quote",
                        value: "Com áreas nomeadas, você primeiro **batiza** cada item com `grid-area: umNome` e depois **desenha o layout** no container com `grid-template-areas`, escrevendo os nomes como se fosse um mapa em texto. Cada linha de texto vira uma fileira da grade, e repetir um nome faz aquela área se **esticar** para ocupar mais células.",
                    },
                    {
                        type: "text",
                        value: "## Passo 1: dar nomes aos itens com `grid-area`\n\nO processo tem duas etapas. A primeira é **batizar** cada item filho com um nome à sua escolha, usando a propriedade `grid-area`. O nome é livre: escolha algo que descreva o papel daquele pedaço, como `cabecalho`, `menu`, `conteudo` e `rodape`.\n\nImagine que temos quatro blocos numa página. Damos um nome para cada um:",
                    },
                    {
                        type: "code",
                        value: ".cabecalho { grid-area: cabecalho; }\n.menu      { grid-area: menu; }\n.conteudo  { grid-area: conteudo; }\n.rodape    { grid-area: rodape; }",
                    },
                    {
                        type: "text",
                        value: "## Passo 2: desenhar o layout com `grid-template-areas`\n\nAgora vem a parte que parece mágica. No **container**, a propriedade `grid-template-areas` deixa você **desenhar** o layout usando os nomes que acabou de criar. Você escreve os nomes dentro de aspas, e o resultado parece um **mapinha** ou uma **planta baixa** da página.\n\nCada par de aspas representa uma **fileira** (uma linha) da grade. Dentro das aspas, cada nome representa uma **coluna**. Olha como fica intuitivo:",
                    },
                    {
                        type: "code",
                        value: '.pagina {\n  display: grid;\n  grid-template-areas:\n    "cabecalho cabecalho"\n    "menu      conteudo"\n    "rodape    rodape";\n}',
                    },
                    {
                        type: "text",
                        value: 'Consegue **enxergar** o layout só de olhar o texto? É essa a beleza. Vamos ler o mapa juntos:\n\n- A primeira fileira, `"cabecalho cabecalho"`, tem o nome `cabecalho` repetido nas duas colunas. Isso faz o cabeçalho **se esticar** por toda a largura, ocupando as duas colunas.\n- A segunda fileira, `"menu conteudo"`, coloca o menu na coluna da esquerda e o conteúdo na direita.\n- A terceira, `"rodape rodape"`, estica o rodapé pela largura toda, igual ao cabeçalho.\n\nA regra de ouro é essa: **repetir o nome em células vizinhas faz a área ocupar todas elas**. E cada item vai parar exatamente no lugar onde o seu nome aparece no desenho. Você não conta uma linha sequer.',
                    },
                    {
                        type: "text",
                        value: "## Deixando uma célula vazia com `.`\n\nE se você quiser um **buraco** no layout, uma célula que fica de propósito vazia? Para isso existe o **ponto** (`.`). Onde você colocar um ponto no lugar de um nome, aquela célula fica em branco.\n\nNo exemplo abaixo, a grade tem três colunas, e o canto inferior direito fica vazio de propósito:",
                    },
                    {
                        type: "code",
                        value: '.pagina {\n  display: grid;\n  grid-template-areas:\n    "cabecalho cabecalho cabecalho"\n    "menu      conteudo  conteudo"\n    "menu      rodape    .";\n}',
                    },
                    {
                        type: "text",
                        value: "## Montando o layout clássico de uma página\n\nAgora vamos juntar tudo num exemplo de verdade: o layout mais comum da web, com **cabeçalho** no topo, **barra lateral** (menu) à esquerda, **conteúdo** principal à direita e **rodapé** embaixo. Esse arranjo aparece em incontáveis sites por aí.\n\nPrimeiro, o HTML: são só quatro blocos dentro de um container. Repare que cada bloco recebe uma classe que combina com o nome que vamos usar no CSS.",
                    },
                    {
                        type: "code",
                        value: '<div class="pagina">\n  <header class="cabecalho">Cabeçalho</header>\n  <nav class="menu">Menu</nav>\n  <main class="conteudo">Conteúdo principal</main>\n  <footer class="rodape">Rodapé</footer>\n</div>',
                    },
                    {
                        type: "text",
                        value: "Agora o CSS. Além de nomear as áreas e desenhar o mapa, a gente combina com o que já sabe: `grid-template-columns` para dizer que o menu tem 200px e o conteúdo pega o resto, `grid-template-rows` para as alturas, `gap` para o respiro e uma altura mínima na página inteira.",
                    },
                    {
                        type: "code",
                        value: '.pagina {\n  display: grid;\n  grid-template-columns: 200px 1fr;\n  grid-template-rows: 80px 1fr 60px;\n  grid-template-areas:\n    "cabecalho cabecalho"\n    "menu      conteudo"\n    "rodape    rodape";\n  gap: 10px;\n  min-height: 100vh;\n}\n\n.cabecalho { grid-area: cabecalho; }\n.menu      { grid-area: menu; }\n.conteudo  { grid-area: conteudo; }\n.rodape    { grid-area: rodape; }',
                    },
                    {
                        type: "text",
                        value: 'Pare um instante para apreciar o que esse código faz. Com pouquíssimas linhas, você montou um layout completo e, o melhor de tudo, **fácil de ler**. Qualquer pessoa bate o olho no `grid-template-areas` e entende na hora onde cada coisa fica.\n\nE tem um superpoder escondido: para **reorganizar** a página, você mexe **só no desenho**. Quer o menu à direita? Inverta os nomes na fileira do meio (`"conteudo menu"`). Quer trocar a ordem das seções? Reordene as fileiras. O HTML nem precisa ser tocado. O layout virou um mapa que você edita à vontade.',
                    },
                    {
                        type: "table",
                        value: '[["Recurso","Vai no...","O que faz"],["`grid-area: nome`","Item filho","Dá um nome ao item"],["`grid-template-areas`","Container","Desenha o layout posicionando os nomes"],["Nome repetido","Dentro do desenho","A área se estica pelas células vizinhas"],["`.` (ponto)","Dentro do desenho","Deixa aquela célula vazia de propósito"]]',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** as **áreas nomeadas** são a forma mais visual de montar layouts. Primeiro dê um nome a cada item com `grid-area: nome` (no filho); depois desenhe o mapa no container com `grid-template-areas`, em que **cada aspas é uma fileira** e **cada nome é uma coluna**. Repetir o nome **estica** a área pelas células vizinhas, e um `.` deixa a célula **vazia**. Combinado com `grid-template-columns`, `grid-template-rows` e `gap`, isso monta o layout de uma página inteira que você reorganiza só editando o desenho.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para que serve a propriedade `grid-area` aplicada a um item filho?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Para dar um nome ao item, que depois será usado no desenho do layout.",
                                isCorrect: true,
                            },
                            {
                                text: "Para definir a cor de fundo do item.",
                                isCorrect: false,
                            },
                            {
                                text: "Para criar novas colunas no grid.",
                                isCorrect: false,
                            },
                            {
                                text: "Para remover o espaçamento entre as células.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Onde você aplica a propriedade `grid-template-areas`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "No container (o elemento pai do grid).",
                                isCorrect: true,
                            },
                            {
                                text: "Em cada item filho separadamente.",
                                isCorrect: false,
                            },
                            {
                                text: "Na tag `<title>`.",
                                isCorrect: false,
                            },
                            {
                                text: "No seletor de cada parágrafo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'No desenho do `grid-template-areas`, o que significa repetir o mesmo nome em células vizinhas, como em `"cabecalho cabecalho"`?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Aquela área se estica para ocupar todas as células onde o nome aparece.",
                                isCorrect: true,
                            },
                            {
                                text: "O navegador mostra um erro de nome duplicado.",
                                isCorrect: false,
                            },
                            {
                                text: "São criados dois cabeçalhos idênticos, um em cada célula.",
                                isCorrect: false,
                            },
                            {
                                text: "O segundo nome é simplesmente ignorado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que representa um ponto (`.`) dentro do `grid-template-areas`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma célula deixada vazia de propósito.",
                                isCorrect: true,
                            },
                            {
                                text: "O fim do desenho do layout.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma célula que repete o nome anterior.",
                                isCorrect: false,
                            },
                            {
                                text: "Um comentário dentro do CSS.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'As fileiras de um `grid-template-areas` são `"cabecalho cabecalho"`, `"menu conteudo"` e `"rodape rodape"`. O que esse desenho descreve?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Um cabeçalho e um rodapé que ocupam a largura toda, com o menu e o conteúdo lado a lado no meio.",
                                isCorrect: true,
                            },
                            {
                                text: "Quatro áreas empilhadas verticalmente, uma embaixo da outra.",
                                isCorrect: false,
                            },
                            {
                                text: "Duas colunas iguais, sem cabeçalho nem rodapé.",
                                isCorrect: false,
                            },
                            {
                                text: "Um layout com o menu ocupando toda a largura no topo.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Grid responsivo e Grid vs Flexbox",
                blocks: [
                    {
                        type: "text",
                        value: "# Grid responsivo e Grid vs Flexbox\n\nVocê já sabe criar grades, espaçar, posicionar e desenhar layouts inteiros. Falta um último passo para virar gente grande no Grid: fazer a grade **se adaptar sozinha** a qualquer tamanho de tela, sem ter que reescrever nada para o celular. E, para fechar o módulo com chave de ouro, vamos responder à pergunta que todo mundo faz: **afinal, uso Grid ou Flexbox?**\n\nEsta aula amarra tudo. No fim dela, você vai olhar para uma galeria de fotos que se reorganiza sozinha quando a janela muda de tamanho e vai entender exatamente como aquilo funciona.",
                    },
                    {
                        type: "quote",
                        value: "A função `minmax()` define um tamanho **mínimo** e um **máximo** para uma coluna. Combinada com `repeat(auto-fit, ...)`, ela cria uma grade que **encaixa sozinha** quantas colunas couberem e quebra o resto para a linha de baixo, sem media queries. E a regra de bolso é simples: **Grid** para layouts em **2 dimensões**; **Flexbox** para alinhar em **1 dimensão**.",
                    },
                    {
                        type: "text",
                        value: '## `minmax()`: um mínimo e um máximo\n\nLembra que o `1fr` deixa uma coluna encolher junto com a tela? O problema é que, numa tela bem estreita, ela pode encolher **demais** e espremer o conteúdo. Seria bom dizer "pode encolher, mas **até certo ponto**". É exatamente isso que a função `minmax()` faz.\n\nEla recebe dois valores: um tamanho **mínimo** e um **máximo**, nessa ordem. Escrever `minmax(200px, 1fr)` significa: "esta coluna **nunca** fica menor que 200px, mas pode crescer livremente até ocupar a sua fração do espaço". É um piso de segurança combinado com um teto flexível.',
                    },
                    {
                        type: "code",
                        value: "/* A primeira coluna nunca fica menor que 200px, mas pode crescer */\n.grade {\n  display: grid;\n  grid-template-columns: minmax(200px, 1fr) 2fr;\n  gap: 16px;\n}",
                    },
                    {
                        type: "text",
                        value: '## Uma grade que se adapta sozinha: `auto-fit`\n\nAgora o pulo do gato. Até aqui, você sempre dizia **quantas** colunas queria (`repeat(3, ...)`). Mas e se você não soubesse de antemão? Numa galeria de fotos, o ideal é caber **3 colunas** num monitor largo, talvez **2** num tablet e **1** no celular, sem você ter que decidir cada caso na mão.\n\nA solução é entregar essa decisão ao navegador com a palavra `auto-fit` dentro do `repeat()`. Em vez de um número, você diz: "encaixe **quantas colunas couberem**". Junte isso com `minmax()` para definir o tamanho de cada uma e acontece a mágica:',
                    },
                    {
                        type: "code",
                        value: '<div class="galeria">\n  <div class="foto">1</div>\n  <div class="foto">2</div>\n  <div class="foto">3</div>\n  <div class="foto">4</div>\n  <div class="foto">5</div>\n  <div class="foto">6</div>\n</div>',
                    },
                    {
                        type: "code",
                        value: ".galeria {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 16px;\n}",
                    },
                    {
                        type: "text",
                        value: 'Essa única linha de `grid-template-columns` é uma das mais famosas do CSS moderno, e agora você entende cada pedaço dela. Lendo em voz alta: "repita colunas que tenham no mínimo 200px e no máximo 1 fração, encaixando **quantas couberem**".\n\nNa prática, o navegador faz a conta sozinho o tempo todo. Numa tela de 900px cabem quatro colunas de ~200px; se o visitante encolher a janela para 640px, uma coluna não cabe mais e os itens **descem** para uma nova linha automaticamente; num celular estreito, sobra uma coluna só. Tudo isso **sem escrever nenhuma media query**. Redimensione a janela do navegador e veja a galeria se reorganizando sozinha.',
                    },
                    {
                        type: "text",
                        value: '## `auto-fit` ou `auto-fill`?\n\nExiste um primo do `auto-fit` chamado `auto-fill`, e a diferença entre os dois é sutil, tanto que costuma confundir até quem já tem experiência. Os dois quebram as colunas do mesmo jeito. A diferença só aparece **quando sobra espaço** e há poucos itens:\n\n- `auto-fill` **mantém** colunas vazias ocupando o espaço que sobra, como se reservasse lugares para itens que não vieram.\n- `auto-fit` **descarta** essas colunas vazias e deixa os itens existentes **esticarem** para preencher a largura.\n\nNa dúvida, para galerias e cartões, o `auto-fit` costuma dar o resultado que a maioria das pessoas espera: o conteúdo preenche a linha. Guarde o `auto-fill` para quando quiser manter o "encaixe" fixo mesmo com poucos itens.',
                    },
                    {
                        type: "code",
                        value: "/* Sobra espaço e há poucos itens?\n   auto-fill: deixa colunas vazias reservadas (os itens não esticam)\n   auto-fit:  remove as vazias e os itens esticam para preencher */\n\n.galeria {\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n}",
                    },
                    {
                        type: "text",
                        value: '## A grande pergunta: Grid ou Flexbox?\n\nChegamos ao momento de amarrar os dois sistemas de layout que você aprendeu. Grid e Flexbox não são rivais; são **companheiros**, cada um bom numa tarefa. A pergunta certa não é "qual é o melhor?", e sim "quantas dimensões eu preciso controlar agora?".\n\n- Precisa alinhar coisas em **uma direção só**, uma fileira de botões, um menu no topo, uma lista de tags lado a lado? Isso é **1 dimensão**: use **Flexbox**.\n- Precisa controlar **linhas e colunas ao mesmo tempo**, o layout da página inteira, uma galeria, um painel com vários blocos? Isso é **2 dimensões**: use **Grid**.\n\nTem até uma forma rápida de decidir: se você consegue resolver pensando só em "linha" **ou** só em "coluna", o Flexbox resolve. Se você precisa dos dois de uma vez, é Grid.',
                    },
                    {
                        type: "table",
                        value: '[["","Grid","Flexbox"],["Dimensões","2 (linhas e colunas)","1 (linha ou coluna)"],["Pense em...","Um tabuleiro / uma malha","Uma fileira / uma prateleira"],["Melhor para","Layout de página, galerias, painéis","Menus, barras de botões, listas de tags"],["Ponto de partida","O layout guia o conteúdo","O conteúdo guia o layout"],["Você liga com","`display: grid`","`display: flex`"]]',
                    },
                    {
                        type: "text",
                        value: '## Os dois juntos, na vida real\n\nAqui vai o segredo que os sites profissionais usam: quase nunca é "Grid **ou** Flexbox", e sim os **dois ao mesmo tempo**, cada um na sua camada. O padrão mais comum é usar o **Grid para a estrutura grande** da página e o **Flexbox para alinhar os detalhes dentro** de cada bloco.\n\nPor exemplo: o layout geral (cabeçalho, menu, conteúdo, rodapé) é um **Grid**. Mas, **dentro** do cabeçalho, você tem um logotipo à esquerda e uns links à direita, alinhados numa única fileira, e isso é trabalho para o **Flexbox**. Veja os dois convivendo em paz:',
                    },
                    {
                        type: "code",
                        value: "/* Grid cuida do layout geral da página */\n.pagina {\n  display: grid;\n  grid-template-columns: 200px 1fr;\n  gap: 10px;\n}\n\n/* Flexbox cuida do alinhamento DENTRO do cabeçalho */\n.cabecalho {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** `minmax(min, max)` dá um piso e um teto para a coluna. O combo `repeat(auto-fit, minmax(200px, 1fr))` cria uma grade que **encaixa sozinha** quantas colunas couberem e quebra o resto, **sem media queries** (`auto-fit` estica os itens; `auto-fill` mantém colunas vazias). E a regra final: **Flexbox para 1 dimensão** (menus, botões), **Grid para 2 dimensões** (páginas, galerias), muitas vezes os dois juntos. Parabéns, você concluiu o **Módulo 6** e agora domina o Grid!",
                    },
                ],
                questions: [
                    {
                        statement: "O que a função `minmax(200px, 1fr)` define para uma coluna?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um tamanho mínimo de 200px e um máximo de 1fr; a coluna nunca fica menor que 200px.",
                                isCorrect: true,
                            },
                            {
                                text: "Que a coluna terá exatamente 200px e mais nada.",
                                isCorrect: false,
                            },
                            {
                                text: "Que existem 200 colunas de 1fr cada.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma margem de 200px ao redor da coluna.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O Grid é feito para layouts de quantas dimensões?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Duas: linhas e colunas ao mesmo tempo.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma: só linhas ou só colunas.",
                                isCorrect: false,
                            },
                            {
                                text: "Três: largura, altura e profundidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma; ele apenas empilha itens.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que `repeat(auto-fit, minmax(200px, 1fr))` faz?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Encaixa quantas colunas couberem e quebra o restante para a linha de baixo, adaptando-se sozinho ao tamanho da tela.",
                                isCorrect: true,
                            },
                            {
                                text: "Cria sempre exatamente três colunas fixas.",
                                isCorrect: false,
                            },
                            {
                                text: "Repete a mesma imagem várias vezes na tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Só funciona se você também escrever uma media query.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para alinhar uma fileira de botões em uma única direção, qual ferramenta é a mais indicada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Flexbox, que é feito para uma dimensão (1D).",
                                isCorrect: true,
                            },
                            {
                                text: "Grid, que é obrigatório para qualquer alinhamento.",
                                isCorrect: false,
                            },
                            {
                                text: "A função `minmax()`, sozinha.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma das duas; use apenas `margin`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual a diferença entre `auto-fit` e `auto-fill` quando há poucos itens e sobra espaço na linha?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`auto-fit` descarta as colunas vazias e estica os itens para preencher a linha; `auto-fill` mantém as colunas vazias reservadas.",
                                isCorrect: true,
                            },
                            {
                                text: "`auto-fit` cria colunas fixas e `auto-fill` cria linhas fixas.",
                                isCorrect: false,
                            },
                            {
                                text: "`auto-fill` só funciona no celular e `auto-fit` só no computador.",
                                isCorrect: false,
                            },
                            {
                                text: "Não há diferença; são exatamente sinônimos.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Responsividade",
        aulas: [
            {
                titulo: "O que é design responsivo",
                blocks: [
                    {
                        type: "text",
                        value: "# O que é design responsivo\n\nBem-vindo ao módulo de **responsividade**, um dos mais importantes de toda a trilha. Até aqui você aprendeu a estilizar elementos, criar caixas, alinhar coisas com flexbox e grid. Agora vamos garantir que tudo isso fique bonito **em qualquer tela**: do celular pequeno na mão de alguém no ônibus até o monitor gigante de um computador.\n\nPode parecer um detalhe, mas é o que separa um site amador de um profissional. E a boa notícia é que, com poucas ideias novas, você já consegue fazer páginas que se adaptam sozinhas. Vamos começar entendendo **o problema** que a responsividade resolve.",
                    },
                    {
                        type: "quote",
                        value: "**Design responsivo** é a técnica de construir uma página que **se adapta** ao tamanho da tela de quem está olhando. Em vez de fazer um site para o computador e outro para o celular, você faz **um só** que se reorganiza sozinho: as colunas viram uma pilha, as fontes ajustam, as imagens encolhem. Como água, que toma a forma de qualquer copo.",
                    },
                    {
                        type: "text",
                        value: "## Uma tela só não existe mais\n\nLá no comecinho da web, quase todo mundo acessava a internet por um computador de mesa, com telas de tamanho parecido. Dava para desenhar uma página com uma largura fixa (digamos, 960 pixels) e pronto: ela ficava igual para quase todo mundo.\n\nHoje a realidade é bem diferente. As pessoas abrem o seu site em:\n\n- **Celulares**, com telas estreitas de uns 360 pixels de largura;\n- **Tablets**, num meio-termo confortável;\n- **Notebooks e desktops**, com telas largas de 1920 pixels ou mais;\n- Até **TVs e relógios**, em casos mais específicos.\n\nNa maioria dos sites hoje, **mais da metade** dos acessos vem do celular. Se a sua página só fica boa no computador, você está deixando de fora justamente a maior parte do público.",
                    },
                    {
                        type: "text",
                        value: "## O que acontece com um site não responsivo\n\nImagine uma página desenhada com largura fixa de 960 pixels, sem nenhum cuidado com responsividade, aberta num celular de 360 pixels. O resultado é aquele site que todo mundo já viu e detestou:\n\n- Ele aparece **inteiro, porém minúsculo**, como se você olhasse de bem longe;\n- Você precisa dar **zoom com os dedos** e arrastar para os lados para ler qualquer coisa;\n- Os botões ficam pequenos demais para acertar com o dedo;\n- Surge uma **barra de rolagem horizontal**, e ninguém gosta de rolar a página para o lado.\n\nDesign responsivo existe justamente para acabar com isso. A página deve **caber** na tela e ser **confortável** de usar, seja qual for o aparelho.",
                    },
                    {
                        type: "text",
                        value: '## Os três ingredientes da responsividade\n\nUm site responsivo se apoia em três ideias, e você vai aprender cada uma com calma ao longo do módulo:\n\n1. **Layout fluido**: usar unidades que **esticam e encolhem** (como `%` e `rem`) no lugar de larguras fixas em pixels.\n2. **Media queries**: regras de CSS que dizem "**se** a tela for pequena, faça assim; se for grande, faça assado". São o coração da adaptação.\n3. **Imagens flexíveis**: garantir que fotos e vídeos nunca **estourem** os limites da tela.\n\nNesta primeira aula vamos preparar o terreno com uma peça que **liga tudo isso**: a `meta viewport`. Sem ela, nada de responsivo funciona no celular.',
                    },
                    {
                        type: "text",
                        value: '## A meta viewport: a peça que liga tudo\n\nAqui vai um detalhe que pega muita gente de surpresa: por padrão, o navegador do celular **finge** ter uma tela larga. Ele monta a página como se estivesse num computador de uns 980 pixels e depois **encolhe tudo** para caber na telinha. É por isso que sites antigos aparecem minúsculos no celular.\n\nPara dizer ao navegador "não faça essa mágica, use a largura **real** da tela", existe uma linha que vai no `<head>` do seu HTML:',
                    },
                    {
                        type: "code",
                        value: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                    },
                    {
                        type: "text",
                        value: 'Vamos traduzir essa linha, que você já tinha visto lá no módulo de HTML sem entender direito:\n\n- `width=device-width`: diz "a largura da página é a **largura real do aparelho**". Num celular de 360 pixels, a página passa a ter 360 pixels de largura, e não 980.\n- `initial-scale=1.0`: define o **zoom inicial** em 100%, ou seja, sem nenhum zoom ao abrir.\n\nSem essa linha, todas as suas media queries e larguras em porcentagem simplesmente **não funcionam** no celular, porque o navegador continua fingindo ter uma tela grande. Por isso ela é **obrigatória** em qualquer página responsiva. Guarde bem: é a primeira coisa a conferir quando "o responsivo não está pegando" no celular.',
                    },
                    {
                        type: "code",
                        value: '<!DOCTYPE html>\n<html lang="pt-br">\n  <head>\n    <meta charset="UTF-8">\n    <!-- A linha essencial para a responsividade funcionar no celular -->\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Meu site responsivo</title>\n    <link rel="stylesheet" href="estilo.css">\n  </head>\n  <body>\n    <h1>Agora sim, pronto para qualquer tela</h1>\n  </body>\n</html>',
                    },
                    {
                        type: "text",
                        value: '## Mobile-first: comece pelo menor\n\nDefinida a viewport, falta escolher uma **estratégia**. Existem duas formas de encarar a construção de um site responsivo, e a diferença está em **por onde você começa**.\n\n- **Desktop-first**: você desenha primeiro para a tela grande e depois vai "consertando" para o celular, removendo e reorganizando coisas.\n- **Mobile-first**: você desenha primeiro para o **celular** (a tela mais apertada) e depois vai **acrescentando** coisas conforme a tela cresce.\n\nA abordagem recomendada hoje é a **mobile-first**, e ela vai ser a nossa bússola no módulo inteiro.',
                    },
                    {
                        type: "text",
                        value: '## Por que começar pelo celular\n\nPode parecer estranho começar pela tela mais difícil, mas faz muito sentido. Pense em fazer as malas para uma viagem: é bem mais fácil começar com uma **mochila pequena** e escolher só o essencial, e depois, se ganhar uma mala maior, ir **acrescentando** itens. O contrário, pegar tudo o que você tem e tentar **espremer** numa mochilinha, é um sofrimento.\n\nNo site é igual:\n\n- Começando pelo celular, você é **obrigado** a focar no conteúdo essencial. A tela pequena não perdoa excesso.\n- Depois, com mais espaço no tablet e no desktop, você **adiciona** colunas, margens maiores e detalhes.\n\nNa prática, isso significa escrever o CSS "base" pensando no celular e usar media queries para **enriquecer** o layout em telas maiores. É o caminho que vamos trilhar nas próximas aulas.',
                    },
                    {
                        type: "code",
                        value: "/* Estilo BASE: pensado para o celular (tela estreita). */\n/* Sem nenhuma media query, vale para todo mundo. */\n.container {\n  width: 100%;\n  padding: 16px;\n}\n\n.cartao {\n  /* No celular, cada cartão ocupa a linha inteira. */\n  width: 100%;\n  margin-bottom: 16px;\n}\n\n/* Mais adiante, media queries vão ADICIONAR colunas em telas maiores. */",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Desktop-first","Mobile-first (recomendado)"],["Por onde começa","Pela tela grande","Pela tela do celular"],["Como evolui","Vai removendo coisas para caber","Vai adicionando coisas conforme sobra espaço"],["Foco","Corre o risco de exagerar no conteúdo","Obriga a focar no essencial"],["Media query típica","`max-width` (de tal tamanho para baixo)","`min-width` (de tal tamanho para cima)"]]',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** **design responsivo** é fazer uma página só que se **adapta** a qualquer tela, como água em qualquer copo. Ele se apoia em **layout fluido**, **media queries** e **imagens flexíveis**. A `<meta viewport>` com `width=device-width` é **obrigatória** para o responsivo funcionar no celular, pois sem ela o navegador finge ter uma tela grande. E a estratégia recomendada é a **mobile-first**: começar pelo celular e ir **acrescentando** conforme a tela cresce.",
                    },
                ],
                questions: [
                    {
                        statement: "O que é design responsivo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "É construir uma única página que se adapta ao tamanho da tela de cada visitante.",
                                isCorrect: true,
                            },
                            {
                                text: "É criar um site separado e totalmente diferente para cada aparelho que existe.",
                                isCorrect: false,
                            },
                            {
                                text: "É deixar o site com cores mais vivas quando aberto no celular.",
                                isCorrect: false,
                            },
                            {
                                text: "É uma linguagem de programação feita só para aplicativos de celular.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual linha é essencial no `<head>` para a responsividade funcionar no celular?",
                        difficulty: "facil",
                        options: [
                            {
                                text: '`<meta name="viewport" content="width=device-width, initial-scale=1.0">`',
                                isCorrect: true,
                            },
                            {
                                text: '`<meta charset="UTF-8">`',
                                isCorrect: false,
                            },
                            {
                                text: '`<link rel="stylesheet" href="estilo.css">`',
                                isCorrect: false,
                            },
                            {
                                text: "`<title>Meu site</title>`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que faz o `width=device-width` dentro da meta viewport?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Faz a página usar a largura real do aparelho, em vez de o navegador fingir uma tela larga e encolher tudo.",
                                isCorrect: true,
                            },
                            {
                                text: "Define a largura máxima que todas as imagens da página podem ter.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumenta o zoom inicial da página para 200% ao abrir.",
                                isCorrect: false,
                            },
                            {
                                text: "Impede que o usuário role a página na vertical.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na estratégia mobile-first, por onde você começa a desenhar o site?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Pela tela do celular, acrescentando elementos conforme a tela cresce.",
                                isCorrect: true,
                            },
                            {
                                text: "Pela tela do desktop, removendo elementos conforme a tela diminui.",
                                isCorrect: false,
                            },
                            {
                                text: "Pela versão para impressora, para garantir o site em papel primeiro.",
                                isCorrect: false,
                            },
                            {
                                text: "Tanto faz: a ordem não muda em nada o resultado final.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Um colega diz: "meu site está pronto e bonito no computador, mas no celular aparece tudo minúsculo e preciso dar zoom". Qual é a explicação e a solução mais provável?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Provavelmente falta a `<meta viewport>` com `width=device-width`; sem ela o navegador do celular finge uma tela larga e encolhe a página inteira.",
                                isCorrect: true,
                            },
                            {
                                text: 'O problema é o `<meta charset="UTF-8">`, que deve ser trocado por `width=device-width`.',
                                isCorrect: false,
                            },
                            {
                                text: "Não há solução em CSS; é obrigatório criar um segundo site só para o celular.",
                                isCorrect: false,
                            },
                            {
                                text: "Basta aumentar todas as fontes para 40px e o site já fica responsivo.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Media queries",
                blocks: [
                    {
                        type: "text",
                        value: '# Media queries\n\nNa aula anterior você entendeu **por que** um site precisa se adaptar e preparou o terreno com a `meta viewport`. Agora chega a ferramenta mais poderosa da responsividade: as **media queries**.\n\nElas são o interruptor que permite dizer ao CSS: "**quando** a tela tiver tal tamanho, aplique estas regras aqui". É com elas que uma página troca de três colunas para uma só ao passar do desktop para o celular. Vamos entender a sintaxe passo a passo, sem pressa.',
                    },
                    {
                        type: "quote",
                        value: 'Uma **media query** é um bloco de CSS que só entra em ação **sob uma condição** de tela, quase sempre a **largura**. Você escreve algo como "**se** a tela tiver no mínimo 768px de largura, use estas regras". Pense num interruptor com sensor: as regras lá dentro só "acendem" quando a tela cumpre a condição.',
                    },
                    {
                        type: "text",
                        value: "## A anatomia de uma media query\n\nToda media query começa com a palavra-chave `@media`, seguida de uma **condição** e, entre chaves, um bloco de regras CSS normais. Olhe a estrutura geral:",
                    },
                    {
                        type: "code",
                        value: "@media (min-width: 768px) {\n  /* Estas regras só valem quando a tela tem 768px OU MAIS de largura. */\n  body {\n    background: lightblue;\n  }\n}",
                    },
                    {
                        type: "text",
                        value: 'Vamos separar as peças dessa regra:\n\n- `@media`: a palavra que abre a media query. As regras que dependem da tela sempre começam assim.\n- `(min-width: 768px)`: a **condição**. Aqui ela quer dizer "largura **mínima** de 768 pixels". Enquanto a tela for menor que isso, o bloco é ignorado.\n- `{ ... }`: dentro das chaves vai **CSS comum**, exatamente igual ao que você já escreve. Não há nada de novo aqui dentro; a novidade é só o "envelope" que decide **quando** aplicar.\n\nO único conceito novo, portanto, é a **condição**. E a condição que você mais vai usar envolve duas palavrinhas: `min-width` e `max-width`.',
                    },
                    {
                        type: "text",
                        value: '## min-width vs max-width\n\nEssas duas condições são as mais comuns, e é fácil confundi-las no começo. A diferença está no **sentido** da comparação:\n\n- `min-width: 768px` significa "**a partir de** 768px **para cima**". Vale para telas **iguais ou maiores**.\n- `max-width: 768px` significa "**até** 768px, **para baixo**". Vale para telas **iguais ou menores**.\n\nUma dica para não esquecer: pense na largura da tela como uma régua. O `min-width` pega tudo o que está **acima** de uma marca; o `max-width` pega tudo o que está **abaixo** dela.',
                    },
                    {
                        type: "code",
                        value: "/* min-width: aplica DAQUI PARA CIMA (telas largas). */\n@media (min-width: 768px) {\n  .menu {\n    display: flex; /* Em tablets e desktops, o menu vira uma linha. */\n  }\n}",
                    },
                    {
                        type: "code",
                        value: '/* max-width: aplica DAQUI PARA BAIXO (telas estreitas). */\n@media (max-width: 767px) {\n  .menu {\n    display: none; /* No celular, esconde o menu e mostra o "hambúrguer". */\n  }\n}',
                    },
                    {
                        type: "text",
                        value: "Repare que os dois exemplos acima resolvem o **mesmo problema** por caminhos opostos: um cuida da tela grande, o outro da pequena. Na prática, você vai escolher **um estilo** e seguir com ele no site inteiro, para não se perder.\n\nComo combinamos seguir o **mobile-first**, a nossa escolha padrão vai ser o `min-width`: escrevemos o estilo base para o celular (sem media query nenhuma) e usamos `min-width` para **ir acrescentando** conforme a tela cresce. O `max-width` fica mais associado ao caminho desktop-first.",
                    },
                    {
                        type: "text",
                        value: "## Breakpoints: onde o layout muda\n\nO ponto exato em que o layout muda de forma, aquele valor que você coloca no `min-width`, tem um nome: **breakpoint** (ponto de quebra). Não existe uma lista oficial e obrigatória, mas há valores que viraram costume no mercado, mais ou menos alinhados com os tamanhos típicos de celular, tablet e desktop.\n\nA regra de ouro, porém, é: **escolha os breakpoints onde o SEU conteúdo começa a ficar feio**, e não decore números. Ainda assim, esta tabela é um ótimo ponto de partida:",
                    },
                    {
                        type: "table",
                        value: '[["Aparelho típico","Largura aproximada","Breakpoint comum (`min-width`)"],["Celular (retrato)","360px a 480px","estilo base, sem media query"],["Celular grande / tablet pequeno","600px","`min-width: 600px`"],["Tablet","768px","`min-width: 768px`"],["Notebook / desktop","1024px","`min-width: 1024px`"],["Telas largas","1280px ou mais","`min-width: 1280px`"]]',
                    },
                    {
                        type: "text",
                        value: "## Mobile-first na prática, do menor para o maior\n\nChegou a hora de juntar tudo num exemplo de verdade. Vamos estilizar uma galeria de cartões seguindo o mobile-first. A lógica é sempre a mesma:\n\n1. Escreva o estilo **base** pensando no celular. Aqui, uma coluna só.\n2. Adicione uma media query `min-width` para o tablet, criando **duas colunas**.\n3. Adicione outra `min-width` para o desktop, criando **três colunas**.\n\nRepare como cada media query só **acrescenta** ou **ajusta** o que veio antes:",
                    },
                    {
                        type: "code",
                        value: "/* 1. BASE (celular): uma coluna. Sem media query. */\n.galeria {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 16px;\n}\n\n/* 2. Tablet: a partir de 768px, duas colunas. */\n@media (min-width: 768px) {\n  .galeria {\n    grid-template-columns: 1fr 1fr;\n  }\n}\n\n/* 3. Desktop: a partir de 1024px, três colunas. */\n@media (min-width: 1024px) {\n  .galeria {\n    grid-template-columns: 1fr 1fr 1fr;\n  }\n}",
                    },
                    {
                        type: "text",
                        value: "O HTML que acompanha esse CSS é o mais simples possível: um contêiner com vários cartões dentro.",
                    },
                    {
                        type: "code",
                        value: '<div class="galeria">\n  <div class="cartao">Item 1</div>\n  <div class="cartao">Item 2</div>\n  <div class="cartao">Item 3</div>\n  <div class="cartao">Item 4</div>\n  <div class="cartao">Item 5</div>\n  <div class="cartao">Item 6</div>\n</div>',
                    },
                    {
                        type: "text",
                        value: 'O navegador lê o CSS **de cima para baixo** e aplica o que for verdadeiro para o tamanho atual da tela:\n\n- Num celular de 400px, **nenhuma** media query bate, então vale só a base: **uma coluna**.\n- Num tablet de 800px, a condição `min-width: 768px` é verdadeira, então valem a base **e** o bloco do tablet: **duas colunas**.\n- Num desktop de 1300px, as duas media queries batem, e a última (`min-width: 1024px`) vence: **três colunas**.\n\nEssa é a mágica do mobile-first: você nunca precisa "desfazer" nada. Cada tela maior apenas soma um pouco mais de layout sobre a anterior.',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** uma **media query** aplica CSS só quando uma condição de tela é verdadeira, com a sintaxe `@media (condição) { ... }`. O `min-width` vale **a partir de** um tamanho para cima; o `max-width`, **até** um tamanho para baixo. Os pontos onde o layout muda são os **breakpoints** (600, 768 e 1024px são comuns, mas o certo é seguir o seu conteúdo). No **mobile-first**, o estilo base é o do celular e cada `min-width` só **acrescenta** layout conforme a tela cresce.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual palavra-chave inicia uma media query no CSS?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`@media`",
                                isCorrect: true,
                            },
                            {
                                text: "`@screen`",
                                isCorrect: false,
                            },
                            {
                                text: "`@responsive`",
                                isCorrect: false,
                            },
                            {
                                text: "`@if`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que significa a condição `min-width: 768px`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "As regras valem para telas com 768px de largura ou mais.",
                                isCorrect: true,
                            },
                            {
                                text: "As regras valem para telas com 768px de largura ou menos.",
                                isCorrect: false,
                            },
                            {
                                text: "A página inteira terá exatamente 768px de largura.",
                                isCorrect: false,
                            },
                            {
                                text: "A fonte terá no mínimo 768px de tamanho.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No mobile-first, qual condição é a escolha mais natural para ir acrescentando layout conforme a tela cresce?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`min-width`, porque parte do celular e adiciona regras para telas maiores.",
                                isCorrect: true,
                            },
                            {
                                text: "`max-width`, porque parte do desktop e remove regras para telas menores.",
                                isCorrect: false,
                            },
                            {
                                text: "`min-height`, porque o que importa é a altura da tela, não a largura.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma; media queries não têm relação com mobile-first.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que é um breakpoint?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O ponto (largura) em que o layout muda de forma, definido na condição da media query.",
                                isCorrect: true,
                            },
                            {
                                text: "Um erro que quebra o CSS quando a tela fica muito pequena.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma pausa que o navegador dá para terminar de carregar as imagens.",
                                isCorrect: false,
                            },
                            {
                                text: "O tamanho máximo que uma imagem pode ter na página.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com o CSS mobile-first `grid-template-columns: 1fr` na base, `1fr 1fr` em `min-width: 768px` e `1fr 1fr 1fr` em `min-width: 1024px`, quantas colunas aparecem numa tela de 800px?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Duas colunas, porque a tela satisfaz o `min-width: 768px`, mas ainda não o `min-width: 1024px`.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma coluna, porque só o estilo base é aplicado nessa largura.",
                                isCorrect: false,
                            },
                            {
                                text: "Três colunas, porque todas as media queries são aplicadas de uma vez.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma coluna, porque 800px não é um breakpoint da lista comum.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Unidades e imagens responsivas",
                blocks: [
                    {
                        type: "text",
                        value: "# Unidades e imagens responsivas\n\nVocê já tem a `meta viewport` e já sabe usar media queries. Falta um ingrediente para o layout ficar realmente fluido: as **unidades** certas. De que adianta uma media query impecável se as suas caixas têm largura travada em pixels e não esticam junto com a tela?\n\nNesta aula vamos conhecer as unidades que **escalam** (`%`, `vw`, `vh` e `rem`) e resolver de vez o problema clássico da **imagem que estoura a tela**. No fim, você vai conhecer o `object-fit` e ter um primeiro contato com o `srcset`.",
                    },
                    {
                        type: "quote",
                        value: "Unidades como `px` são **rígidas**: 300px são sempre 300px, não importa a tela. Já unidades **relativas** como `%`, `vw` e `rem` são elásticas: o mesmo valor **encolhe e cresce** junto com o contexto. O segredo de um layout fluido é preferir as unidades elásticas para tamanhos e espaçamentos.",
                    },
                    {
                        type: "text",
                        value: "## Unidades fixas vs relativas\n\nAté agora você provavelmente usou muito o **pixel** (`px`). Ele é uma unidade **absoluta**: `width: 300px` cria uma caixa de exatamente 300 pixels, seja no celular, seja no monitor gigante. O problema aparece no celular: se a tela tem só 360px, uma caixa de 300px já ocupa quase tudo, e duas lado a lado nem cabem.\n\nAs unidades **relativas** resolvem isso porque o valor delas **depende de outra coisa** (do tamanho da tela, do elemento pai ou da fonte). Elas se ajustam sozinhas. Vamos conhecer as três mais úteis para a responsividade.",
                    },
                    {
                        type: "text",
                        value: '## Porcentagem: relativa ao elemento pai\n\nA porcentagem (`%`) é a unidade relativa mais intuitiva. Uma largura de `50%` significa "**metade do espaço do elemento pai**". Se o pai encolhe, o filho encolhe junto, mantendo a proporção.\n\nÉ a base de qualquer layout fluido. No exemplo abaixo, o cartão sempre ocupa 80% da largura disponível, seja qual for a tela:',
                    },
                    {
                        type: "code",
                        value: ".cartao {\n  width: 80%;       /* Sempre 80% da largura do elemento pai. */\n  max-width: 500px; /* Mas nunca passa de 500px em telas grandes. */\n  margin: 0 auto;   /* Centraliza a caixa na horizontal. */\n}",
                    },
                    {
                        type: "text",
                        value: "Repare no truque de combinar `width: 80%` com `max-width: 500px`. Ele é um dos mais úteis da responsividade:\n\n- No **celular**, os 80% mandam: o cartão encolhe junto com a tela e sempre sobra uma respiração nas laterais.\n- No **desktop**, o `max-width` entra em cena e **trava** o cartão em 500px, para o texto não virar uma linha larguíssima e cansativa de ler.\n\nÉ elasticidade **com limite**. Guarde essa dupla, você vai usá-la o tempo todo.",
                    },
                    {
                        type: "text",
                        value: '## vw e vh: relativas à tela\n\nAs unidades `vw` e `vh` medem em relação à **janela de visualização** (a área visível da tela), e não ao elemento pai:\n\n- `vw` quer dizer _viewport width_. **1vw = 1% da largura da tela.** Então `100vw` é a largura inteira da tela.\n- `vh` quer dizer _viewport height_. **1vh = 1% da altura da tela.** Então `100vh` é a altura inteira.\n\nElas são ótimas para elementos que precisam ocupar a tela toda, como uma seção de "capa" (hero) que preenche a altura inteira ao abrir a página:',
                    },
                    {
                        type: "code",
                        value: ".capa {\n  width: 100vw;   /* Largura da tela inteira. */\n  height: 100vh;  /* Altura da tela inteira: a capa ocupa tudo o que se vê. */\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}",
                    },
                    {
                        type: "text",
                        value: "## rem: relativa à fonte base\n\nVocê talvez já tenha esbarrado no `rem` em módulos anteriores; aqui ele brilha. O `rem` é relativo ao **tamanho da fonte raiz** da página, que por padrão é **16px** no navegador. Então:\n\n- `1rem` = 16px (o padrão);\n- `2rem` = 32px;\n- `0.5rem` = 8px.\n\nPor que isso ajuda na responsividade? Porque, se você definir espaçamentos e fontes em `rem`, tudo escala de forma **coerente** e ainda respeita a preferência de quem aumentou a fonte do navegador (uma questão de acessibilidade). Em vez de dezenas de valores soltos em pixels, você raciocina em múltiplos de uma base única.",
                    },
                    {
                        type: "code",
                        value: "h1 {\n  font-size: 2rem;      /* 32px, mas escala se o usuário aumentar a fonte. */\n  margin-bottom: 1rem;  /* 16px de respiro embaixo do título. */\n}\n\n.secao {\n  padding: 2rem;        /* Espaçamento interno coerente com o resto. */\n}",
                    },
                    {
                        type: "table",
                        value: '[["Unidade","Relativa a...","Exemplo","Boa para"],["`%`","O elemento pai","`width: 50%`","Larguras fluidas de caixas"],["`vw`","A largura da tela","`width: 100vw`","Seções que ocupam a tela toda"],["`vh`","A altura da tela","`height: 100vh`","Capas de altura cheia (hero)"],["`rem`","A fonte raiz (16px)","`font-size: 2rem`","Fontes e espaçamentos coerentes"],["`px`","Nada (é fixa)","`width: 300px`","Detalhes que não devem escalar (bordas)"]]',
                    },
                    {
                        type: "text",
                        value: "## O problema clássico: a imagem que estoura a tela\n\nAgora, o vilão mais famoso da responsividade. Imagine que você coloca na página uma foto de **1200 pixels** de largura e a abre num celular de 360px. Por padrão, a imagem tenta aparecer no tamanho real, gigante, e **empurra** o layout: surge aquela barra de rolagem horizontal, e a página inteira fica torta.\n\nA solução é uma das linhas de CSS mais importantes de toda a responsividade, e você vai colocá-la em praticamente todo projeto:",
                    },
                    {
                        type: "code",
                        value: "img {\n  max-width: 100%; /* A imagem nunca fica mais larga que o espaço disponível. */\n  height: auto;    /* A altura acompanha, mantendo a proporção (sem distorcer). */\n}",
                    },
                    {
                        type: "text",
                        value: 'Essas duas linhas resolvem o problema para sempre. Vamos entender cada uma:\n\n- `max-width: 100%` diz "a imagem pode ter o tamanho natural dela, **mas nunca ultrapassar** a largura do espaço onde está". Numa tela larga, ela aparece cheia; num celular, ela **encolhe** para caber. Repare que usamos `max-width`, e não `width: 100%`: assim uma imagem pequena **não é esticada** além do seu tamanho real.\n- `height: auto` deixa a altura se ajustar **proporcionalmente** à largura. Sem ela, a imagem encolheria na largura mas manteria a altura, ficando achatada e distorcida.\n\nGuarde essa dupla como um par inseparável: onde entra `max-width: 100%`, entra `height: auto` junto.',
                    },
                    {
                        type: "text",
                        value: "## object-fit: encaixar sem distorcer\n\nÀs vezes você precisa que uma imagem ocupe uma caixa de tamanho **exato**, por exemplo uma miniatura quadrada de 200 por 200 pixels, mas as fotos vêm em proporções diferentes. Se você simplesmente forçar largura e altura, a imagem **estica** e fica deformada.\n\nA propriedade `object-fit` resolve isso, controlando como a imagem preenche a caixa dela. Os valores mais usados são:\n\n- `cover`: a imagem **cobre** a caixa inteira, cortando o que sobra nas bordas. Nunca distorce. É o mais usado.\n- `contain`: a imagem aparece **inteira** dentro da caixa, deixando espaços vazios se a proporção não bater.\n- `fill`: a imagem **estica** para preencher (pode distorcer). É o comportamento padrão.",
                    },
                    {
                        type: "code",
                        value: ".miniatura {\n  width: 200px;\n  height: 200px;\n  object-fit: cover; /* Preenche o quadrado cortando o excesso, sem distorcer. */\n  border-radius: 8px;\n}",
                    },
                    {
                        type: "table",
                        value: '[["Valor","O que faz","Distorce a imagem?"],["`cover`","Cobre a caixa toda, cortando o excesso","Não"],["`contain`","Mostra a imagem inteira, pode sobrar espaço","Não"],["`fill`","Estica para preencher a caixa (é o padrão)","Sim, pode distorcer"]]',
                    },
                    {
                        type: "text",
                        value: "## Um passo além: o srcset\n\nFazer a imagem **caber** com `max-width: 100%` resolve o visual, mas há um detalhe de desempenho: mesmo encolhida na tela, o celular ainda **baixa** a foto gigante de 1200px, gastando internet à toa.\n\nO atributo `srcset` (que é do HTML, não do CSS) resolve isso oferecendo **várias versões** da mesma imagem em tamanhos diferentes; o navegador escolhe sozinho a mais adequada para a tela. Você não precisa dominar isso agora, mas vale conhecer a ideia:",
                    },
                    {
                        type: "code",
                        value: '<!-- O navegador escolhe a versão certa conforme a largura da tela. -->\n<img\n  src="foto-800.jpg"\n  srcset="foto-400.jpg 400w, foto-800.jpg 800w, foto-1200.jpg 1200w"\n  alt="Paisagem com montanhas ao fundo">',
                    },
                    {
                        type: "text",
                        value: 'Traduzindo esse `srcset`: "existe uma versão de 400px de largura (`400w`), uma de 800px e uma de 1200px; escolha a melhor para a tela atual". Num celular, o navegador baixa a de 400px e economiza dados; num monitor grande, pega a de 1200px para não perder qualidade. O `src` comum continua ali como **reserva**, para navegadores antigos.\n\nNão se preocupe em decorar a sintaxe agora. O importante é saber que ela **existe** e para que serve; você vai aprofundar isso mais para frente.',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** prefira unidades **relativas** para um layout fluido: `%` (relativa ao pai), `vw`/`vh` (relativas à tela) e `rem` (relativa à fonte base de 16px), deixando o `px` para detalhes que não devem escalar. Combine `width` com `max-width` para ter elasticidade **com limite**. A dupla `img { max-width: 100%; height: auto; }` impede a imagem de **estourar** a tela sem distorcê-la, e o `object-fit: cover` encaixa fotos numa caixa fixa sem deformar. Por fim, o `srcset` faz o navegador baixar a **versão certa** de cada imagem.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual dupla de propriedades impede uma imagem de estourar a largura da tela sem distorcê-la?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`max-width: 100%` com `height: auto`",
                                isCorrect: true,
                            },
                            {
                                text: "`width: 1200px` com `height: 800px`",
                                isCorrect: false,
                            },
                            {
                                text: "`display: none` com `visibility: hidden`",
                                isCorrect: false,
                            },
                            {
                                text: "`position: absolute` com `top: 0`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A quê a unidade `vw` é relativa?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "À largura da tela (viewport): 1vw = 1% da largura visível.",
                                isCorrect: true,
                            },
                            {
                                text: "À largura do elemento pai.",
                                isCorrect: false,
                            },
                            {
                                text: "Ao tamanho da fonte raiz da página.",
                                isCorrect: false,
                            },
                            {
                                text: "À altura da imagem de fundo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que se costuma usar `max-width: 100%` na imagem, em vez de `width: 100%`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Com `max-width`, a imagem encolhe para caber mas não é esticada além do tamanho real quando é pequena.",
                                isCorrect: true,
                            },
                            {
                                text: "`width: 100%` não existe em CSS; só `max-width` é válido para imagens.",
                                isCorrect: false,
                            },
                            {
                                text: "`max-width` deixa a imagem colorida e `width` deixa em preto e branco.",
                                isCorrect: false,
                            },
                            {
                                text: "Não há diferença nenhuma: as duas fazem exatamente a mesma coisa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você quer encaixar fotos de proporções variadas num quadrado de 200x200 sem deformá-las. Qual propriedade resolve?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`object-fit: cover`, que preenche a caixa cortando o excesso, sem distorcer.",
                                isCorrect: true,
                            },
                            {
                                text: "`object-fit: fill`, que é a única opção que nunca distorce a imagem.",
                                isCorrect: false,
                            },
                            {
                                text: "`text-align: center`, que centraliza a imagem dentro da caixa.",
                                isCorrect: false,
                            },
                            {
                                text: "`float: left`, que ajusta a proporção da imagem automaticamente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma foto de 1200px já aparece bem dimensionada no celular graças ao `max-width: 100%`, mas a página está pesada para carregar. O que o `srcset` acrescenta nesse cenário?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Ele oferece versões menores da imagem para o navegador baixar a mais adequada à tela, economizando dados, algo que o `max-width` sozinho não faz.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele substitui o CSS e dispensa a necessidade da `meta viewport`.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele aumenta a resolução da imagem no celular para melhorar a qualidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele serve para distorcer a imagem de propósito e deixá-la menor.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Montando um layout responsivo",
                blocks: [
                    {
                        type: "text",
                        value: "# Montando um layout responsivo\n\nChegamos à aula que **amarra tudo**. Ao longo do módulo, e da trilha inteira, você aprendeu peças soltas: box model, cores, flexbox, grid, media queries, unidades relativas. Agora vamos **juntar todas elas** para construir, do zero, uma página de verdade que funciona lindamente do celular ao desktop.\n\nVá com calma e acompanhe cada passo montando o arquivo no seu computador. No fim, você vai ter um layout responsivo completo, o tipo de coisa que aparece em portfólios e projetos reais.",
                    },
                    {
                        type: "quote",
                        value: "Um layout responsivo não é uma técnica única, e sim a **soma** das que você já conhece: HTML bem estruturado, **unidades relativas** para fluir, **imagens flexíveis** para não estourar, **flexbox ou grid** para organizar e **media queries** para reorganizar. O mobile-first amarra tudo: comece pelo celular e vá acrescentando.",
                    },
                    {
                        type: "text",
                        value: "## O que vamos construir\n\nNosso projeto é a página inicial de um pequeno estúdio de design. Ela tem as partes clássicas de quase qualquer site:\n\n- Um **cabeçalho** (`header`) com o nome e um menu de navegação;\n- Uma **capa** (hero) com um título de boas-vindas;\n- Uma seção de **cartões** de serviços (aquela galeria que vira colunas em telas grandes);\n- Um **rodapé** (`footer`).\n\nO comportamento responsivo é o seguinte: no **celular**, tudo empilha numa coluna só, o menu vira uma lista vertical e os cartões ficam um embaixo do outro. No **desktop**, o menu vira uma linha e os cartões se espalham em **três colunas**. Vamos montar isso em passos.",
                    },
                    {
                        type: "text",
                        value: "## Passo 1: a estrutura em HTML\n\nPrimeiro o esqueleto, sem estilo nenhum. Repare em duas coisas que já viraram hábito: a `meta viewport` no `<head>` (essencial, como vimos na aula 1) e o uso de tags semânticas como `<header>`, `<main>`, `<section>` e `<footer>`. Aqui está o HTML:",
                    },
                    {
                        type: "code",
                        value: '<!DOCTYPE html>\n<html lang="pt-br">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Estúdio Criativo</title>\n    <link rel="stylesheet" href="estilo.css">\n  </head>\n  <body>\n    <header class="cabecalho">\n      <div class="logo">Estúdio Criativo</div>\n      <nav class="menu">\n        <a href="#">Início</a>\n        <a href="#">Serviços</a>\n        <a href="#">Contato</a>\n      </nav>\n    </header>\n\n    <main>\n      <section class="capa">\n        <h1>Ideias que ganham forma</h1>\n        <p>Design, código e um cafezinho.</p>\n      </section>\n\n      <section class="servicos">\n        <div class="cartao">\n          <h2>Design</h2>\n          <p>Identidade visual do zero.</p>\n        </div>\n        <div class="cartao">\n          <h2>Web</h2>\n          <p>Sites rápidos e responsivos.</p>\n        </div>\n        <div class="cartao">\n          <h2>Branding</h2>\n          <p>Sua marca com personalidade.</p>\n        </div>\n      </section>\n    </main>\n\n    <footer class="rodape">\n      <p>Feito com carinho na ensina.dev</p>\n    </footer>\n  </body>\n</html>',
                    },
                    {
                        type: "text",
                        value: '## Passo 2: o estilo base, pensando no celular\n\nFiéis ao **mobile-first**, escrevemos primeiro o CSS que vale para a tela mais estreita, **sem nenhuma media query**. No celular, quase tudo empilha naturalmente: o cabeçalho fica em coluna, a capa é centralizada e cada cartão ocupa a linha inteira.\n\nComeçamos com um "reset" básico e os estilos gerais:',
                    },
                    {
                        type: "code",
                        value: "/* Reset básico e uma caixa mais previsível. */\n* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: system-ui, sans-serif;\n  color: #222;\n  line-height: 1.5;\n}\n\n/* Imagens sempre flexíveis (hábito de todo projeto). */\nimg {\n  max-width: 100%;\n  height: auto;\n}\n\n/* Cabeçalho: no celular, empilha em coluna e centraliza. */\n.cabecalho {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 1rem;\n  padding: 1rem;\n  background: #2d2a4a;\n  color: white;\n}\n\n.menu {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.menu a {\n  color: white;\n  text-decoration: none;\n}",
                    },
                    {
                        type: "text",
                        value: "## Passo 3: capa e cartões, ainda no celular\n\nSeguindo na base mobile, estilizamos a capa (usando `vh` para ela ter uma boa altura) e os cartões. No celular eles ficam **empilhados**, um por linha, porque um `grid` de uma coluna é o padrão mais simples:",
                    },
                    {
                        type: "code",
                        value: "/* Capa: ocupa boa parte da altura da tela e centraliza o texto. */\n.capa {\n  min-height: 60vh;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  gap: 1rem;\n  padding: 2rem;\n  background: #f4f2ff;\n}\n\n.capa h1 {\n  font-size: 2rem;\n}\n\n/* Serviços: grid de UMA coluna no celular. */\n.servicos {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1.5rem;\n  padding: 2rem;\n}\n\n.cartao {\n  background: white;\n  border: 1px solid #e0ddf0;\n  border-radius: 12px;\n  padding: 1.5rem;\n}\n\n.rodape {\n  text-align: center;\n  padding: 1.5rem;\n  background: #2d2a4a;\n  color: white;\n}",
                    },
                    {
                        type: "text",
                        value: "## Passo 4: as media queries, do menor para o maior\n\nCom a versão mobile pronta e funcional, agora **acrescentamos** layout para as telas maiores, usando `min-width`. Duas mudanças principais:\n\n- No **tablet** (a partir de 768px), o cabeçalho vira uma **linha** (logo de um lado, menu do outro) e os cartões passam a **duas colunas**.\n- No **desktop** (a partir de 1024px), os cartões se espalham em **três colunas**.\n\nRepare que não desfazemos nada: só ajustamos o `flex-direction` e o número de colunas do grid.",
                    },
                    {
                        type: "code",
                        value: "/* TABLET: a partir de 768px. */\n@media (min-width: 768px) {\n  /* Cabeçalho vira uma linha: logo à esquerda, menu à direita. */\n  .cabecalho {\n    flex-direction: row;\n    justify-content: space-between;\n  }\n\n  .menu {\n    flex-direction: row;\n  }\n\n  /* Cartões em duas colunas. */\n  .servicos {\n    grid-template-columns: 1fr 1fr;\n  }\n}\n\n/* DESKTOP: a partir de 1024px. */\n@media (min-width: 1024px) {\n  /* Cartões em três colunas, com um respiro nas laterais. */\n  .servicos {\n    grid-template-columns: 1fr 1fr 1fr;\n    max-width: 1100px;\n    margin: 0 auto;\n  }\n}",
                    },
                    {
                        type: "text",
                        value: "## O layout completo, tudo junto\n\nVocê montou por partes para entender cada decisão. Agora, aqui está o **CSS completo**, na ordem certa, pronto para colar no arquivo `estilo.css` ao lado do HTML do Passo 1. Este é o resultado de tudo o que você aprendeu na trilha, reunido num único arquivo que funciona do celular ao desktop:",
                    },
                    {
                        type: "code",
                        value: "/* ===== BASE (mobile-first): vale para o celular ===== */\n* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: system-ui, sans-serif;\n  color: #222;\n  line-height: 1.5;\n}\n\nimg {\n  max-width: 100%;\n  height: auto;\n}\n\n.cabecalho {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 1rem;\n  padding: 1rem;\n  background: #2d2a4a;\n  color: white;\n}\n\n.menu {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.menu a {\n  color: white;\n  text-decoration: none;\n}\n\n.capa {\n  min-height: 60vh;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  gap: 1rem;\n  padding: 2rem;\n  background: #f4f2ff;\n}\n\n.capa h1 {\n  font-size: 2rem;\n}\n\n.servicos {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1.5rem;\n  padding: 2rem;\n}\n\n.cartao {\n  background: white;\n  border: 1px solid #e0ddf0;\n  border-radius: 12px;\n  padding: 1.5rem;\n}\n\n.rodape {\n  text-align: center;\n  padding: 1.5rem;\n  background: #2d2a4a;\n  color: white;\n}\n\n/* ===== TABLET: a partir de 768px ===== */\n@media (min-width: 768px) {\n  .cabecalho {\n    flex-direction: row;\n    justify-content: space-between;\n  }\n\n  .menu {\n    flex-direction: row;\n  }\n\n  .servicos {\n    grid-template-columns: 1fr 1fr;\n  }\n}\n\n/* ===== DESKTOP: a partir de 1024px ===== */\n@media (min-width: 1024px) {\n  .servicos {\n    grid-template-columns: 1fr 1fr 1fr;\n    max-width: 1100px;\n    margin: 0 auto;\n  }\n}",
                    },
                    {
                        type: "text",
                        value: "## Como essa página se transforma\n\nPare um instante para apreciar o que esse código faz sozinho, sem nenhum JavaScript. Conforme a tela cresce, a mesma página se reorganiza:",
                    },
                    {
                        type: "table",
                        value: '[["Parte da página","No celular (base)","No tablet (≥768px)","No desktop (≥1024px)"],["Cabeçalho","Empilhado e centralizado","Em linha, logo e menu nas pontas","Em linha, logo e menu nas pontas"],["Menu","Lista vertical","Em linha","Em linha"],["Cartões de serviço","1 coluna","2 colunas","3 colunas, centralizadas"]]',
                    },
                    {
                        type: "text",
                        value: '## Teste você mesmo\n\nSalve os dois arquivos (`index.html` e `estilo.css`) na mesma pasta e abra o HTML no navegador. Agora vem a parte divertida: **arraste a borda da janela** para estreitá-la e alargá-la, ou aperte **F12** e ative o modo de dispositivo (o ícone de celular/tablet) para simular telas diferentes.\n\nVeja a página se reorganizar em tempo real: os cartões saltando de uma para três colunas, o menu deitando e levantando. Não é mágica, é a soma de tudo o que você construiu, unidades relativas, imagens flexíveis, flexbox, grid e media queries, trabalhando junto.\n\n**Parabéns por concluir o módulo de responsividade!** Você agora sabe fazer o que muita gente que "sabe CSS" ainda tropeça: páginas que ficam ótimas em qualquer tela. Esse é um marco de verdade na sua jornada.',
                    },
                    {
                        type: "quote",
                        value: "**Cheat sheet final:** um layout responsivo é a **soma** das técnicas da trilha. Comece pela `meta viewport` e por um HTML semântico. Escreva o CSS **mobile-first** (base para o celular, sem media query), usando unidades **relativas** e `img { max-width: 100%; height: auto; }`. Organize com **flexbox** (menus, cabeçalhos) e **grid** (galerias de cartões). Depois, com `@media (min-width: ...)`, apenas **acrescente** colunas e ajuste direções conforme a tela cresce. Teste redimensionando a janela ou pelo modo dispositivo do navegador (F12).",
                    },
                ],
                questions: [
                    {
                        statement: 'No mobile-first, qual CSS representa o estilo "base"?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "O CSS escrito sem nenhuma media query, pensado para o celular.",
                                isCorrect: true,
                            },
                            {
                                text: "O CSS que fica dentro de `@media (min-width: 1024px)`.",
                                isCorrect: false,
                            },
                            {
                                text: "O CSS que só vale quando a página é impressa.",
                                isCorrect: false,
                            },
                            {
                                text: "O CSS escrito dentro da tag `<title>`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quais duas ferramentas de CSS foram usadas para organizar os elementos deste layout (o menu e a galeria de cartões)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Flexbox e grid.",
                                isCorrect: true,
                            },
                            {
                                text: "Float e clear.",
                                isCorrect: false,
                            },
                            {
                                text: "JavaScript e PHP.",
                                isCorrect: false,
                            },
                            {
                                text: "As tags `<table>` e `<tr>`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No exemplo, o cabeçalho muda de `flex-direction: column` para `flex-direction: row` dentro de `@media (min-width: 768px)`. Qual é o efeito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "No celular o cabeçalho fica empilhado em coluna, e a partir de 768px ele passa a ficar em linha.",
                                isCorrect: true,
                            },
                            {
                                text: "O cabeçalho some completamente em telas maiores que 768px.",
                                isCorrect: false,
                            },
                            {
                                text: "O cabeçalho fica em linha no celular e empilhado no desktop.",
                                isCorrect: false,
                            },
                            {
                                text: "Nada muda, porque `flex-direction` não afeta o layout.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que a regra `img { max-width: 100%; height: auto; }` aparece logo no estilo base do projeto?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Para garantir, desde o celular, que nenhuma imagem estoure a largura da tela nem fique distorcida.",
                                isCorrect: true,
                            },
                            {
                                text: "Para deixar todas as imagens em preto e branco no celular.",
                                isCorrect: false,
                            },
                            {
                                text: "Para esconder as imagens quando a tela é pequena.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque sem ela a `meta viewport` não funciona.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Neste layout mobile-first, o que acontece com a galeria `.servicos` numa tela de 900px de largura?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Fica com 2 colunas: a tela satisfaz o `min-width: 768px` (2 colunas), mas ainda não o `min-width: 1024px` (3 colunas).",
                                isCorrect: true,
                            },
                            {
                                text: "Fica com 3 colunas, porque qualquer tela maior que o celular já aplica a regra do desktop.",
                                isCorrect: false,
                            },
                            {
                                text: "Fica com 1 coluna, porque media queries só funcionam abaixo de 768px.",
                                isCorrect: false,
                            },
                            {
                                text: "A galeria desaparece, porque 900px não é um breakpoint definido.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: "iniciante",
                description:
                    "Trilha de CSS para iniciantes: estilize suas páginas do zero. Seletores, cascata e especificidade, box model, cores e tipografia, e layout moderno com Flexbox, Grid e responsividade, com exemplos práticos.",
            })
            .returning();
    }

    const jaTem = await db
        .select({ id: modules.id })
        .from(modules)
        .where(and(eq(modules.trailId, trilha.id), eq(modules.title, MARCADOR)));
    if (jaTem.length) {
        console.log("Trilha CSS já está semeada, nada a fazer.");
        return;
    }

    await db.transaction(async (tx) => {
        const lids = (
            await tx.select({ id: lessons.id }).from(lessons).where(eq(lessons.trailId, trilha.id))
        ).map((l) => l.id);
        if (lids.length) {
            const qids = (
                await tx
                    .select({ id: questions.id })
                    .from(questions)
                    .where(inArray(questions.lessonId, lids))
            ).map((q) => q.id);
            if (qids.length) {
                await tx.delete(questionAnswers).where(inArray(questionAnswers.questionId, qids));
                await tx.delete(questionOptions).where(inArray(questionOptions.questionId, qids));
                await tx.delete(questions).where(inArray(questions.id, qids));
            }
            await tx.delete(lessonProgress).where(inArray(lessonProgress.lessonId, lids));
            await tx.delete(lessons).where(inArray(lessons.id, lids));
        }
        await tx.delete(modules).where(eq(modules.trailId, trilha.id));

        for (let mi = 0; mi < DADOS.length; mi++) {
            const m = DADOS[mi];
            const [mod] = await tx
                .insert(modules)
                .values({ trailId: trilha.id, title: m.titulo, position: mi + 1 })
                .returning();
            for (let li = 0; li < m.aulas.length; li++) {
                const a = m.aulas[li];
                const [lesson] = await tx
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
                    const [questao] = await tx
                        .insert(questions)
                        .values({
                            lessonId: lesson.id,
                            statement: q.statement,
                            difficulty: q.difficulty,
                            position: qi + 1,
                        })
                        .returning();
                    await tx.insert(questionOptions).values(
                        q.options.map((o, k) => ({
                            questionId: questao.id,
                            text: o.text,
                            isCorrect: o.isCorrect,
                            position: k + 1,
                        })),
                    );
                }
            }
        }
    });
    console.log("Trilha CSS construída: " + DADOS.length + " módulos.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
