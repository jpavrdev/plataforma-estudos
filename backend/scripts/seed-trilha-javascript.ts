// Trilha de JavaScript para iniciantes, blocos com quiz de 5 questões por aula.
// questões por aula. Idempotente pelo marcador "Módulo 1 - Introdução ao JavaScript", que só
// existe nesta estrutura nova. É destrutivo: apaga módulos/aulas/questões antigos
// da trilha antes de recriar (o progresso da trilha AWS é reiniciado).
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-javascript.ts
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

const NOME = "JavaScript";
const MARCADOR = "Módulo 1 - Introdução ao JavaScript";

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
        titulo: "Módulo 1 - Introdução ao JavaScript",
        aulas: [
            {
                titulo: "O que é JavaScript e onde ele roda",
                blocks: [
                    {
                        type: "text",
                        value: "# O que é JavaScript e onde ele roda\n\nSeja muito bem-vindo à sua primeira aula de JavaScript! Se você chegou aqui sem nunca ter programado na vida, pode ficar tranquilo: é exatamente para você que esta trilha foi pensada. A gente vai do zero absoluto, com calma, sem pular degraus e sem jargão que ninguém explica.\n\nNesta primeira aula você ainda não vai escrever código. A ideia é entender **o que é** o JavaScript, **para que ele serve** e **onde ele roda**, antes de colocar a mão na massa. Ter esse mapa na cabeça vai fazer todo o resto da trilha fazer muito mais sentido.",
                    },
                    {
                        type: "quote",
                        value: '**JavaScript** é uma **linguagem de programação**: com ela você dá **ordens** ao computador, como "mostre este aviso", "some estes dois números" ou "quando alguém clicar no botão, faça tal coisa". Na web, o JavaScript é a linguagem do **comportamento**: é ele que faz a página **reagir** e ganhar vida. E o lugar onde ele roda, por enquanto, é **dentro do navegador**.',
                    },
                    {
                        type: "text",
                        value: "## Relembrando o trio da web\n\nSe você veio da trilha de HTML, já conhece esta história; se não veio, é rapidinho. Uma página moderna nasce da união de **três** tecnologias, e a forma mais fácil de lembrar o papel de cada uma é pensar numa **pessoa**:\n\n- **HTML** é o **esqueleto**: a estrutura, o que existe na página (títulos, textos, imagens, botões).\n- **CSS** é a **aparência**: a roupa, as cores, os tamanhos, o visual.\n- **JavaScript** é o **comportamento**: os músculos que se movem, a página que **reage** e **muda** conforme a pessoa usa.\n\nNesta trilha o foco é o terceiro integrante: o **JavaScript**, o comportamento. É a peça que transforma uma página parada numa página que responde, calcula, avisa e se atualiza sozinha.",
                    },
                    {
                        type: "table",
                        value: '[["Tecnologia","Cuida de...","Analogia (o corpo)","Exemplo no dia a dia"],["HTML","Estrutura e conteúdo","O esqueleto","Dizer que ali existe um botão"],["CSS","Estilo e aparência","A roupa e a maquiagem","Deixar o botão verde e arredondado"],["JavaScript","Comportamento e interação","Os músculos","Fazer algo acontecer quando o botão é clicado"]]',
                    },
                    {
                        type: "text",
                        value: '## Uma diferença importante: descrever x programar\n\nO HTML e o CSS **descrevem** coisas: "isto é um título", "aquele texto é azul". Eles não tomam decisões nem fazem contas. O JavaScript é de outra natureza: ele é uma **linguagem de programação** de verdade. Isso quer dizer que, com ele, o computador consegue:\n\n- **fazer cálculos** (somar, multiplicar, calcular um total);\n- **tomar decisões** ("se o campo estiver vazio, avise o usuário");\n- **repetir tarefas** (percorrer uma lista de 100 nomes, um por um);\n- **guardar e transformar informações** (lembrar o que a pessoa digitou).\n\nUma analogia ajuda: se o HTML é a **planta** de uma casa e o CSS é a **decoração**, o JavaScript é a **parte elétrica e o encanamento**, o que faz as coisas funcionarem: a luz que acende no interruptor, a água que corre quando você abre a torneira. É o que dá **funcionamento** à casa.',
                    },
                    {
                        type: "text",
                        value: "## Um primeiro gostinho de código\n\nVocê vai entender tudo isto em detalhe nas próximas aulas, mas vale ver a cara do JavaScript agora. Não precisa decorar nada; só repare que é **texto que dá uma ordem**. O trecho abaixo manda o computador escrever uma mensagem num lugar chamado **console** (já já explicamos o que é isso):",
                    },
                    {
                        type: "code",
                        value: 'console.log("Olá! Estou aprendendo JavaScript.");\n// no console aparece: Olá! Estou aprendendo JavaScript.',
                    },
                    {
                        type: "text",
                        value: '## Código que RODA\n\nAqui mora a maior diferença entre o JavaScript e o HTML: o JavaScript é **executado**. O computador **lê a sua ordem e a cumpre**, produzindo um resultado. No exemplo acima, a ordem `console.log(...)` significa "escreva isto no console", e o resultado é a frase aparecendo lá.\n\nPor isso, ao longo da trilha, quase todo exemplo de código vem com um **comentário** mostrando o que ele produz. Sempre que você vir `// no console aparece: ...`, é o resultado daquela linha depois de rodar. Veja o JavaScript fazendo contas de verdade:',
                    },
                    {
                        type: "code",
                        value: "console.log(7 + 3);    // no console aparece: 10\nconsole.log(10 - 4);   // no console aparece: 6\nconsole.log(5 * 8);    // no console aparece: 40\nconsole.log(20 / 4);   // no console aparece: 5",
                    },
                    {
                        type: "text",
                        value: 'Repare que o computador **não** mostrou "7 + 3" como texto: ele **calculou** e mostrou o resultado, `10`. Dois detalhes do teclado: o sinal `*` é o de **multiplicação** (a programação usa o asterisco no lugar do "x" da matemática) e a barra `/` é a **divisão**. Isso já mostra o JavaScript **pensando** por você, algo que o HTML jamais faria: para o HTML, "7 + 3" seria só um texto qualquer.',
                    },
                    {
                        type: "text",
                        value: '## Onde o JavaScript roda: dentro do navegador\n\nToda página que você abre roda num **navegador** (Chrome, Firefox, Edge, Safari). E aqui está a parte importante: **todo navegador já vem com um "motor" que entende e executa JavaScript**. Você não precisa instalar nada. Esse motor tem até nome, no Chrome ele se chama **V8**, mas você não precisa decorar isso.\n\nOu seja, quando uma página tem JavaScript, o navegador faz duas coisas: monta a estrutura (lendo o HTML) e, ao encontrar o código JavaScript, **executa** esse código ali mesmo, na máquina de quem está visitando. É por isso que uma página consegue reagir na hora a um clique, sem consultar a internet de novo: o JavaScript está rodando **no seu próprio computador**, dentro do navegador.',
                    },
                    {
                        type: "quote",
                        value: "Você **não precisa instalar nada** para começar a programar em JavaScript: o navegador que você já usa todos os dias tem, embutido, um motor que executa código JavaScript. Programar para a web começa com ferramentas que você já tem na mão.",
                    },
                    {
                        type: "text",
                        value: '## E o Node.js? JavaScript fora do navegador\n\nTalvez você já tenha ouvido falar em **Node.js**. Durante muitos anos, o JavaScript só rodava dentro do navegador. Aí alguém teve a ideia de pegar aquele motor (o V8, do Chrome) e colocá-lo para rodar **sozinho**, fora do navegador, direto no computador ou num servidor. Esse programa é o **Node.js**.\n\nCom o Node, o JavaScript passou a servir também para o **servidor**: aquele computador distante que guarda os dados e responde aos pedidos dos sites (a "cozinha" do restaurante, se você lembra da analogia de cliente e servidor). Ou seja, hoje dá para usar a mesma linguagem nos dois lados.\n\nGuarde isso só como cultura geral. **Nesta trilha, o nosso foco é o JavaScript rodando no navegador**, que é o jeito mais direto e visual de começar. O Node fica para mais adiante na sua jornada.',
                    },
                    {
                        type: "text",
                        value: '## O que dá para fazer com JavaScript\n\nPara você se animar, aqui vão algumas coisas que o JavaScript faz nas páginas que você usa todo dia. Praticamente **toda interação** de um site passa por ele:\n\n- **Reagir a cliques e ao teclado**: abrir um menu, curtir um post, arrastar um card.\n- **Validar formulários**: avisar "faltou preencher o e-mail" antes de enviar.\n- **Atualizar a página sem recarregar**: aquele feed que carrega mais conteúdo quando você chega ao fim da tela.\n- **Fazer cálculos na hora**: o total do carrinho que muda enquanto você adiciona itens.\n- **Animações e até jogos**: de um menuzinho que desliza a jogos inteiros que rodam no navegador.\n- **Mostrar avisos e mensagens**: aquela caixinha de "tem certeza que deseja sair?".\n\nTudo isso é comportamento, e comportamento, na web, é trabalho do JavaScript. Veja dois gostinhos. O JavaScript consegue, por exemplo, mostrar um aviso na tela:',
                    },
                    {
                        type: "code",
                        value: 'alert("Bem-vindo ao site!");\n// abre uma caixinha no navegador escrito: Bem-vindo ao site!',
                    },
                    {
                        type: "text",
                        value: "E também consegue **comparar** valores e decidir se uma afirmação é verdadeira ou falsa (não precisa entender a sintaxe agora, só a ideia):",
                    },
                    {
                        type: "code",
                        value: "console.log(10 > 5);\n// no console aparece: true  (verdadeiro: 10 é mesmo maior que 5)\n\nconsole.log(2 > 8);\n// no console aparece: false (falso: 2 não é maior que 8)",
                    },
                    {
                        type: "text",
                        value: "Repare na diferença: no primeiro exemplo o JavaScript **agiu** (mostrou uma caixa na tela); no segundo, ele **raciocinou** (respondeu `true`, verdadeiro, ou `false`, falso). Essa capacidade de agir e de decidir é justamente o que o HTML nunca teve, e é o que você vai aprender a usar ao longo de toda a trilha. Por enquanto, basta perceber que o JavaScript **executa**, enquanto o HTML apenas **descreve**.",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** o **JavaScript** é uma **linguagem de programação**, a linguagem do **comportamento** da web, que forma o trio com o **HTML** (estrutura) e o **CSS** (aparência). Diferente deles, o JavaScript é **executado**: ele calcula, decide e reage. Ele roda **dentro do navegador**, que já traz um motor pronto para isso (nada a instalar), e também pode rodar no **servidor** com o **Node.js**, embora aqui o nosso foco seja o navegador.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Na divisão de tarefas da web, o JavaScript é responsável por qual papel?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O comportamento e a interatividade: fazer a página reagir, calcular e mudar.",
                                isCorrect: true,
                            },
                            {
                                text: "A estrutura e o conteúdo da página (o esqueleto).",
                                isCorrect: false,
                            },
                            {
                                text: "As cores, as fontes e os espaçamentos da página.",
                                isCorrect: false,
                            },
                            {
                                text: "Guardar os arquivos do site num servidor na internet.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Onde o JavaScript roda quando estamos programando páginas web, que é o foco desta trilha?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Num programa pago que precisa ser instalado à parte.",
                                isCorrect: false,
                            },
                            {
                                text: "Dentro do navegador, que já vem com um motor que executa JavaScript.",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas em servidores caros, que precisam ser alugados.",
                                isCorrect: false,
                            },
                            {
                                text: "Direto no processador, sem nenhum programa intermediário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença central entre o JavaScript e o HTML?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O HTML faz cálculos e o JavaScript apenas colore o texto.",
                                isCorrect: false,
                            },
                            {
                                text: "Não há diferença: são dois nomes para a mesma tecnologia.",
                                isCorrect: false,
                            },
                            {
                                text: "O JavaScript é uma linguagem de programação que é executada (calcula, decide, reage); o HTML apenas descreve e estrutura o conteúdo.",
                                isCorrect: true,
                            },
                            {
                                text: "O JavaScript só funciona em celulares e o HTML só em computadores.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que é o Node.js?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um navegador novo que veio para substituir o Chrome.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma linguagem diferente do JavaScript, usada só para estilos.",
                                isCorrect: false,
                            },
                            {
                                text: "Um site onde se hospedam páginas HTML de graça.",
                                isCorrect: false,
                            },
                            {
                                text: "Um programa que executa JavaScript fora do navegador, permitindo usar a linguagem também no servidor.",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            'Um colega diz: "para testar meu primeiro código JavaScript, preciso comprar um servidor e instalar vários programas". Qual resposta corrige melhor essa ideia?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Não precisa: o navegador que você já usa tem um motor de JavaScript embutido, então dá para executar código sem instalar nem comprar nada.",
                                isCorrect: true,
                            },
                            {
                                text: "Está certo: sem um servidor pago, nenhum JavaScript roda.",
                                isCorrect: false,
                            },
                            {
                                text: "Está certo, mas só o Firefox consegue rodar JavaScript.",
                                isCorrect: false,
                            },
                            {
                                text: "Não precisa de servidor, mas é obrigatório instalar o Node.js antes de qualquer teste no navegador.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Colocando JavaScript numa página",
                blocks: [
                    {
                        type: "text",
                        value: "# Colocando JavaScript numa página\n\nNa aula anterior você entendeu **o que** é o JavaScript. Agora vamos ao **como**: de que jeito a gente pega esse código e o coloca para rodar dentro de uma página HTML. É aqui que você escreve (e vê funcionar) o seu primeiro JavaScript de verdade.\n\nAdiantando o final: a ponte entre o HTML e o JavaScript é uma tag só, a `<script>`. Depois que você entender ela, o resto é praticar.",
                    },
                    {
                        type: "quote",
                        value: "Para colocar JavaScript numa página, a gente usa a tag `<script>`. O código pode ir **dentro** dela (script **interno**) ou num **arquivo `.js` separado**, carregado com o atributo `src` (script **externo**). Por um motivo que já já veremos, o costume é colocar o `<script>` **logo antes de fechar o `</body>`**.",
                    },
                    {
                        type: "text",
                        value: "## A tag `<script>`\n\nVocê já conhece as tags do HTML, aquelas etiquetas entre `<` e `>`. A `<script>` é mais uma delas, com uma missão especial: **tudo o que estiver dentro dela é tratado como JavaScript**, e não como conteúdo da página.\n\nQuando você escreve o código direto entre `<script>` e `</script>`, dizemos que é um **script interno** (ele mora dentro do próprio arquivo HTML). Veja uma página completa e mínima, com JavaScript embutido:",
                    },
                    {
                        type: "code",
                        value: '<!DOCTYPE html>\n<html lang="pt-br">\n  <head>\n    <meta charset="UTF-8">\n    <title>Meu primeiro JavaScript</title>\n  </head>\n  <body>\n    <h1>Olá!</h1>\n\n    <script>\n      console.log("Oi, esta mensagem veio do JavaScript!");\n    </script>\n  </body>\n</html>',
                    },
                    {
                        type: "text",
                        value: '## O que essa página faz\n\nSe você salvar esse código num arquivo `.html` e abrir no navegador, vai ver o título "Olá!" na tela, como sempre. Mas a linha de dentro do `<script>` também rodou, silenciosamente. A mensagem "Oi, esta mensagem veio do JavaScript!" foi parar num lugar que o visitante comum não vê: o **console** do navegador.\n\nNão se preocupe em achar o console agora, ele é o tema da próxima aula inteira. Por enquanto, basta saber que `console.log(...)` é a forma mais simples de o JavaScript "falar" com quem está programando.',
                    },
                    {
                        type: "text",
                        value: "## `console.log`: a sua ferramenta número um\n\nO `console.log` vai ser o seu melhor amigo por um bom tempo. A ideia é simples: você põe alguma coisa **entre os parênteses** e o JavaScript **escreve** essa coisa no console. Serve para ver resultados, conferir se o código chegou até certo ponto e investigar problemas.\n\nA estrutura é sempre a mesma: a palavra `console.log`, um par de parênteses `( )` e, no fim, um ponto e vírgula `;` marcando o fim da ordem.",
                    },
                    {
                        type: "code",
                        value: 'console.log("uma mensagem de texto");\n// no console aparece: uma mensagem de texto\n\nconsole.log(42);\n// no console aparece: 42\n\nconsole.log(3 + 4);\n// no console aparece: 7',
                    },
                    {
                        type: "text",
                        value: 'Note uma coisa importante: quando você quer imprimir um **texto**, ele vai entre **aspas** ("assim"). Quando é um **número** ou uma **conta**, vai **sem aspas** (`42`, `3 + 4`). Isso porque, com aspas, o JavaScript entende "isto é um texto, mostre exatamente assim"; sem aspas, ele entende "isto é um número, posso calcular". Guarde essa diferença, ela volta muito.',
                    },
                    {
                        type: "text",
                        value: '## `alert`: uma caixinha na cara do usuário\n\nEnquanto o `console.log` fala baixinho no console (que só quem programa costuma abrir), o `alert` faz o oposto: ele mostra uma **caixa de aviso** bem no meio da tela, que o visitante precisa fechar clicando em "OK". É impossível não ver.',
                    },
                    {
                        type: "code",
                        value: 'alert("Bem-vindo ao meu site!");\n// abre uma caixinha no navegador com o texto: Bem-vindo ao meu site!',
                    },
                    {
                        type: "text",
                        value: 'O `alert` é ótimo para os primeiros testes, porque o resultado aparece na cara e não tem como não notar. Mas, no dia a dia, ele é usado com parcimônia: como **trava a página** até a pessoa clicar em "OK", acaba incomodando se usado demais. Para investigar código, prefira o `console.log`; para um aviso pontual ao usuário, o `alert` cumpre bem o papel.',
                    },
                    {
                        type: "text",
                        value: "## Script externo: o código num arquivo à parte\n\nEscrever o JavaScript dentro do HTML funciona bem para poucas linhas. Mas, quando o código cresce, o costume é colocá-lo num **arquivo separado**, com a extensão `.js`. Isso mantém o HTML limpo (só estrutura), deixa o JavaScript organizado no seu próprio canto e ainda permite reaproveitar o mesmo script em várias páginas.\n\nPara isso, a gente cria um arquivo, por exemplo `app.js`, com o código puro (sem a tag `<script>` dentro dele):",
                    },
                    {
                        type: "code",
                        value: '// arquivo: app.js\nconsole.log("Este código mora num arquivo separado!");',
                    },
                    {
                        type: "text",
                        value: "E, no HTML, usamos o `<script>` com o atributo `src` (de _source_, fonte) apontando para o nome desse arquivo. Repare que, com o `src`, a tag `<script>` fica **vazia** por dentro, porque o código está lá no `.js`:",
                    },
                    {
                        type: "code",
                        value: '<!DOCTYPE html>\n<html lang="pt-br">\n  <head>\n    <meta charset="UTF-8">\n    <title>Script externo</title>\n  </head>\n  <body>\n    <h1>Olá!</h1>\n\n    <!-- carrega o código do arquivo app.js -->\n    <script src="app.js"></script>\n  </body>\n</html>',
                    },
                    {
                        type: "text",
                        value: "## Por que o `<script>` costuma ficar antes do `</body>`\n\nVocê deve ter notado que, nos exemplos, o `<script>` aparece **lá embaixo, pouco antes do `</body>`**. Isso não é por acaso. Lembre que o navegador lê a página **de cima para baixo**, na ordem em que as coisas aparecem.\n\nSe o JavaScript rodar cedo demais, **antes** de o HTML ter sido montado, ele pode tentar mexer em elementos (um botão, um parágrafo) que **ainda não existem** na página, e aí dá erro. Colocando o `<script>` no finalzinho, você garante que, quando o código rodar, **todo o HTML acima já foi lido e montado**. É como só montar o quebra-cabeça depois que todas as peças estão na mesa.",
                    },
                    {
                        type: "code",
                        value: '<body>\n  <!-- 1. Primeiro o navegador lê e monta este botão... -->\n  <button>Clique</button>\n\n  <!-- 2. ...e só então roda o script, com o botão já existindo na página. -->\n  <script src="app.js"></script>\n</body>',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Script interno","Script externo"],["Onde fica o código","Dentro da tag `<script>`, no HTML","Num arquivo `.js` separado"],["Como se liga ao HTML","O código vai entre `<script>` e `</script>`","`<script src=\\"app.js\\"></script>`"],["Melhor para","Poucas linhas e testes rápidos","Projetos maiores e código reutilizável"],["Mantém o HTML limpo?","Nem tanto","Sim"]]',
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** o JavaScript entra na página pela tag `<script>`. No **script interno**, o código vai entre `<script>` e `</script>`; no **externo**, ele fica num arquivo `.js` e é carregado com `<script src="app.js"></script>`. O costume é pôr o `<script>` **antes do `</body>`**, para o HTML já estar montado quando o código rodar. E as suas duas primeiras ferramentas de saída são o `console.log` (fala no console) e o `alert` (mostra uma caixa na tela).',
                    },
                ],
                questions: [
                    {
                        statement: "Qual tag é usada para colocar JavaScript numa página HTML?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`<script>`",
                                isCorrect: true,
                            },
                            {
                                text: "`<js>`",
                                isCorrect: false,
                            },
                            {
                                text: "`<code>`",
                                isCorrect: false,
                            },
                            {
                                text: "`<style>`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'O que o comando `console.log("Olá")` faz?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "Muda a cor do texto da página para azul.",
                                isCorrect: false,
                            },
                            {
                                text: 'Escreve a mensagem "Olá" no console do navegador.',
                                isCorrect: true,
                            },
                            {
                                text: "Apaga todo o conteúdo da página.",
                                isCorrect: false,
                            },
                            {
                                text: "Cria um novo arquivo chamado Olá.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre o `alert` e o `console.log`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não há diferença: os dois mostram uma caixa na tela.",
                                isCorrect: false,
                            },
                            {
                                text: "O `console.log` trava a página e o `alert` nunca faz isso.",
                                isCorrect: false,
                            },
                            {
                                text: "O `alert` mostra uma caixa de aviso na tela, que o visitante vê e precisa fechar; o `console.log` escreve no console, normalmente visto só por quem programa.",
                                isCorrect: true,
                            },
                            {
                                text: "O `alert` só funciona em arquivos `.js` externos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para carregar um arquivo JavaScript externo chamado `app.js`, qual linha está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`<script>app.js</script>`",
                                isCorrect: false,
                            },
                            {
                                text: '`<script href="app.js"></script>`',
                                isCorrect: false,
                            },
                            {
                                text: '`<script src="app.js"></script>`',
                                isCorrect: true,
                            },
                            {
                                text: '`<link src="app.js">`',
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que costumamos colocar a tag `<script>` logo antes de fechar o `</body>`?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque o JavaScript só funciona se estiver na última linha do arquivo.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o navegador lê a página de cima para baixo; deixando o script no fim, todo o HTML acima já foi montado quando o código roda, evitando erros ao mexer em elementos que ainda não existiriam.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque assim a página fica com um visual mais bonito.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o navegador se recusa a ler qualquer `<script>` que esteja no `<head>`.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O console do navegador",
                blocks: [
                    {
                        type: "text",
                        value: '# O console do navegador\n\nVocê já mandou o JavaScript escrever mensagens com `console.log`, mas onde, afinal, essas mensagens aparecem? No **console**. Esta aula é dedicada a ele, porque o console vai ser o seu **laboratório**: o lugar onde você imprime resultados, investiga o que deu errado e testa ideias soltas de código sem precisar criar arquivo nenhum.\n\nDominar o console cedo faz uma diferença enorme no aprendizado. É a ferramenta que transforma "programar" em algo visível e concreto.',
                    },
                    {
                        type: "quote",
                        value: "O **console** é uma janela, embutida no navegador, onde o JavaScript escreve mensagens e onde **você** também pode digitar código e ver o resultado na hora. Ele faz parte das **DevTools** (as ferramentas de desenvolvedor) e é o melhor amigo de quem está aprendendo: um laboratório sempre à mão.",
                    },
                    {
                        type: "text",
                        value: '## Abrindo as ferramentas de desenvolvedor\n\nO console fica dentro das **DevTools**, um painel escondido que todo navegador tem. Existem duas formas fáceis de abri-lo:\n\n- Aperte a tecla **F12** (funciona na maioria dos navegadores no Windows e no Linux).\n- Ou clique com o **botão direito** em qualquer lugar da página e escolha **"Inspecionar"** (ou "Inspect").\n\nVai aparecer um painel, geralmente ao lado ou embaixo, cheio de abas. Procure a aba chamada **Console** e clique nela. É ali que a mágica acontece. No começo pode parecer intimidador, mas você vai usar só um cantinho dele por enquanto.',
                    },
                    {
                        type: "table",
                        value: '[["Navegador","Windows / Linux","Mac"],["Chrome / Edge","F12  ou  Ctrl + Shift + J","Cmd + Option + J"],["Firefox","F12  ou  Ctrl + Shift + K","Cmd + Option + K"],["Safari","Ative antes o menu Desenvolvedor","Cmd + Option + C"]]',
                    },
                    {
                        type: "text",
                        value: "## A aba Console é interativa\n\nAqui vem a parte mais legal: o console não serve só para **ler** as mensagens do `console.log`. Ele também é **interativo**, ou seja, você pode **digitar** um código ali, apertar **Enter** e ver o resultado na mesma hora. É como uma calculadora superpoderosa que entende JavaScript.\n\nExperimente agora: abra o console, digite uma conta simples e aperte Enter:",
                    },
                    {
                        type: "code",
                        value: "2 + 2\n// depois de apertar Enter, o console responde: 4\n\n10 * 3\n// depois de apertar Enter, o console responde: 30",
                    },
                    {
                        type: "text",
                        value: "Percebeu? Nem precisou de `console.log` para ver a resposta de uma conta: quando você digita direto no console e aperta Enter, ele já mostra o resultado logo abaixo. Esse é o jeito mais rápido de **experimentar** qualquer coisa em JavaScript. Errou? Sem problema: apague, digite de novo e teste outra vez. Nada quebra.",
                    },
                    {
                        type: "text",
                        value: "## `console.log` com mais de uma informação\n\nDentro do `console.log`, você pode passar **vários valores de uma vez**, separando-os por **vírgula**. O console mostra todos na mesma linha, com um espaço entre eles. Isso é ótimo para montar mensagens que misturam texto e números:",
                    },
                    {
                        type: "code",
                        value: 'console.log("A resposta é:", 42);\n// no console aparece: A resposta é: 42\n\nconsole.log("Soma:", 5 + 5, "| Produto:", 5 * 5);\n// no console aparece: Soma: 10 | Produto: 25',
                    },
                    {
                        type: "text",
                        value: '## Mais tipos de recado: `console.warn` e `console.error`\n\nO `console.log` é o pão com manteiga, mas o console tem primos úteis para **destacar** mensagens conforme a gravidade:\n\n- **`console.warn(...)`**: mostra um **aviso** (_warning_), geralmente com fundo amarelo e um ícone de alerta. Serve para "olha, isto aqui merece atenção".\n- **`console.error(...)`**: mostra um **erro**, geralmente em vermelho e com um ícone de erro. Serve para "algo deu errado aqui".\n\nEles funcionam igualzinho ao `console.log`, só mudam a **aparência** e ajudam a separar o que é rotina do que é problema:',
                    },
                    {
                        type: "code",
                        value: 'console.log("Tudo certo por aqui.");\n// aparece normal, em texto comum\n\nconsole.warn("Atenção: o estoque está acabando.");\n// aparece em amarelo, com ícone de aviso\n\nconsole.error("Erro: não foi possível salvar o arquivo.");\n// aparece em vermelho, com ícone de erro',
                    },
                    {
                        type: "text",
                        value: '## Usando o console para investigar\n\nUma das maiores utilidades do `console.log` é **investigar** o que está acontecendo no seu código, uma técnica carinhosamente apelidada de "debugar imprimindo". A ideia é espalhar mensagens pelo código para ver **até onde** ele chegou e **com quais valores**:',
                    },
                    {
                        type: "code",
                        value: 'console.log("1. O programa começou.");\nconsole.log("2. Vou calcular o total...");\nconsole.log("Total:", 3 * 40);\nconsole.log("3. Terminei!");\n\n// no console aparece, em quatro linhas:\n// 1. O programa começou.\n// 2. Vou calcular o total...\n// Total: 120\n// 3. Terminei!',
                    },
                    {
                        type: "text",
                        value: 'Lendo essas mensagens em ordem, você "acompanha" o programa rodando por dentro, passo a passo. Se alguma linha esperada **não** aparecer no console, você descobre exatamente onde o código parou. Simples assim, e incrivelmente eficaz.\n\nVale insistir num hábito que vai te acompanhar para sempre: toda vez que aprender algo novo nesta trilha, **abra o console e teste**. Digitou, Enter, viu o resultado. Essa curiosidade de "e se eu fizer assim?" é o que mais acelera o aprendizado em programação.',
                    },
                    {
                        type: "table",
                        value: '[["Comando","Para que serve","Como costuma aparecer"],["`console.log(...)`","Imprimir mensagens e resultados no dia a dia","Texto normal"],["`console.warn(...)`","Destacar um aviso que merece atenção","Fundo amarelo, ícone de alerta"],["`console.error(...)`","Sinalizar que algo deu errado","Vermelho, ícone de erro"]]',
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** o **console** vive dentro das **DevTools** (abra com **F12**, ou clique com o botão direito e "Inspecionar", na aba **Console**). Ele **imprime** o que o `console.log` manda e é **interativo**: dá para digitar código, apertar Enter e ver o resultado na hora. O `console.log` aceita **vários valores separados por vírgula**, e os primos `console.warn` (aviso, amarelo) e `console.error` (erro, vermelho) ajudam a destacar mensagens. Use o console como laboratório: teste tudo o que aprender.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual tecla costuma abrir as ferramentas de desenvolvedor (DevTools) na maioria dos navegadores no Windows e no Linux?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "F12",
                                isCorrect: true,
                            },
                            {
                                text: "F1",
                                isCorrect: false,
                            },
                            {
                                text: "A tecla Esc",
                                isCorrect: false,
                            },
                            {
                                text: "A barra de espaço",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Dentro das DevTools, qual aba mostra as mensagens do `console.log` e permite digitar código?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A aba Network (Rede)",
                                isCorrect: false,
                            },
                            {
                                text: "A aba Elements (Elementos)",
                                isCorrect: false,
                            },
                            {
                                text: "A aba Console",
                                isCorrect: true,
                            },
                            {
                                text: "A aba Sources (Fontes)",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você digita `6 * 7` diretamente no console e aperta Enter. O que acontece?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O console mostra o resultado da conta, `42`, logo abaixo.",
                                isCorrect: true,
                            },
                            {
                                text: "Nada acontece, porque contas só funcionam dentro de um arquivo `.js`.",
                                isCorrect: false,
                            },
                            {
                                text: "A página inteira é recarregada.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele mostra o texto `6 * 7`, sem calcular.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual comando você usaria para destacar, em vermelho, que algo deu errado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`console.log(...)`",
                                isCorrect: false,
                            },
                            {
                                text: "`console.error(...)`",
                                isCorrect: true,
                            },
                            {
                                text: "`console.red(...)`",
                                isCorrect: false,
                            },
                            {
                                text: "`alert.error(...)`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'Qual é a saída de `console.log("Nota:", 8 + 2)`?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`Nota: 8 + 2` (mostra a conta sem calcular)",
                                isCorrect: false,
                            },
                            {
                                text: "`Nota:10`, sem espaço nenhum e sem calcular a conta",
                                isCorrect: false,
                            },
                            {
                                text: "`Nota: 10` (o texto e o resultado da conta, separados por um espaço)",
                                isCorrect: true,
                            },
                            {
                                text: '`"Nota:", 8 + 2`, com as aspas e a vírgula visíveis',
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Comentários e seu primeiro programa",
                blocks: [
                    {
                        type: "text",
                        value: '# Comentários e seu primeiro programa\n\nChegamos à última aula do módulo, e ela é especial: você vai escrever (e entender, linha por linha) o seu **primeiro programa completo** em JavaScript. Antes, porém, vamos aprender um recurso que parece bobo, mas é essencial no dia a dia de quem programa: os **comentários**.\n\nDe quebra, no fim da aula, você vai conhecer os **tropeços clássicos** de quem está começando, para reconhecê-los de longe quando (não "se", mas "quando") eles aparecerem.',
                    },
                    {
                        type: "quote",
                        value: "Um **comentário** é um trecho de texto que o JavaScript **ignora** por completo na hora de rodar. Ele não faz nada no programa: existe só para os **humanos** lerem, para explicar o que o código faz, deixar lembretes ou desativar um trecho temporariamente. Em JavaScript há dois tipos: o de **uma linha** (`//`) e o de **bloco** (`/* */`).",
                    },
                    {
                        type: "text",
                        value: "## Comentário de uma linha: `//`\n\nO tipo mais comum é o comentário de **uma linha**. Você escreve duas barras `//` e, a partir dali até o **fim daquela linha**, tudo é ignorado pelo JavaScript. Ele pode ocupar uma linha só para ele ou vir no **final** de uma linha de código, feito um bilhetinho ao lado:",
                    },
                    {
                        type: "code",
                        value: '// Esta linha inteira é um comentário: o JavaScript nem olha para ela.\nconsole.log("Olá!"); // e este comentário explica a linha ao lado\n\n// console.log("Não vou rodar"); <- desativei esta linha pondo // na frente\n// no console aparece só: Olá!',
                    },
                    {
                        type: "text",
                        value: "## Comentário de bloco: `/* */`\n\nQuando o recado é **grande** e ocupa **várias linhas**, o comentário de uma linha fica trabalhoso (você teria que pôr `//` em cada linha). Para isso existe o comentário de **bloco**: tudo o que estiver entre `/*` (abre) e `*/` (fecha) é ignorado, não importa quantas linhas ocupe:",
                    },
                    {
                        type: "code",
                        value: '/*\n  Este é um comentário de bloco.\n  Posso escrever à vontade em várias linhas,\n  e nada disto vai rodar ou aparecer para o usuário.\n*/\nconsole.log("Só esta linha roda de verdade.");\n// no console aparece: Só esta linha roda de verdade.',
                    },
                    {
                        type: "text",
                        value: '## Para que servem os comentários\n\nPode parecer estranho escrever um texto que o computador **ignora**, mas os comentários são valiosíssimos. Eles servem, principalmente, para:\n\n- **Explicar** um trecho difícil, para você (ou outra pessoa) entender depois. O "você do futuro" vai agradecer.\n- **Deixar lembretes** do tipo "melhorar isto mais tarde".\n- **Desativar** temporariamente uma linha de código, sem precisar apagá-la, só para testar uma ideia.\n\nUm conselho de ouro: comente o **porquê** das coisas, não o óbvio. Escrever `// soma 2 + 2` ao lado de `2 + 2` não ajuda ninguém; já explicar **por que** aquela conta existe pode salvar o seu dia lá na frente.',
                    },
                    {
                        type: "text",
                        value: "## Seu primeiro programa completo\n\nChegou a hora. Vamos montar um programinha de verdade, curtinho e todo comentado, que **faz uma conta e mostra o resultado**. O cenário: calcular quanto custa uma compra de camisetas. Leia com calma; logo abaixo a gente destrincha o que está acontecendo.",
                    },
                    {
                        type: "code",
                        value: '/* ==========================================\n   Meu primeiro programa: total de uma compra\n   ========================================== */\n\n// Aviso que o programa começou\nconsole.log("Calculando o total da compra...");\n\n// A conta: 3 camisetas a R$ 40 cada (o sinal * é a multiplicação)\nconsole.log("Total a pagar: R$", 3 * 40);\n\n// Aviso que o programa terminou\nconsole.log("Pronto!");\n\n/*\n  No console aparece, em três linhas:\n  Calculando o total da compra...\n  Total a pagar: R$ 120\n  Pronto!\n*/',
                    },
                    {
                        type: "text",
                        value: '## Entendendo o programa\n\nRepare em três ideias que já dá para tirar daqui:\n\n1. **O código roda de cima para baixo**, uma linha de cada vez, na ordem em que está escrito. Por isso as mensagens aparecem naquela sequência.\n2. **`3 * 40` é uma conta**, escrita sem aspas, então o JavaScript a **calcula** e mostra `120`. Se tivesse aspas ("3 * 40"), ele mostraria o texto cru, sem calcular.\n3. **Os comentários** (as linhas com `//` e o bloco `/* */`) organizam e explicam tudo, mas **não influenciam** o resultado: apague todos eles e o programa faz exatamente a mesma coisa.\n\nPronto: você acabou de ler e entender um programa completo. É simples, mas é exatamente assim que tudo começa.',
                    },
                    {
                        type: "text",
                        value: "## Erros clássicos de iniciante\n\nAgora, os tropeços. Todo mundo passa por eles, então não se assuste. O primeiro, e talvez o mais comum, é que **o JavaScript diferencia maiúsculas de minúsculas**. Para ele, `console`, `Console` e `CONSOLE` são três coisas **diferentes**. O comando certo é tudo em minúsculas: `console.log`. Se você escrever com a inicial maiúscula, dá erro:",
                    },
                    {
                        type: "code",
                        value: '// ERRADO: "Console" com C maiúsculo não existe\nConsole.log("Oi");\n// no console aparece um erro em vermelho:\n// Uncaught ReferenceError: Console is not defined\n\n// CERTO: tudo minúsculo\nconsole.log("Oi");\n// no console aparece: Oi',
                    },
                    {
                        type: "text",
                        value: '## Esquecer as aspas do texto\n\nO segundo clássico: **texto tem que ir entre aspas**. Quando você escreve uma palavra sem aspas, o JavaScript acha que é o nome de alguma coisa do código (uma "variável", assunto do próximo módulo) e, como não encontra nada com esse nome, reclama:',
                    },
                    {
                        type: "code",
                        value: '// ERRADO: sem aspas, o JavaScript procura algo chamado Olá e não acha\nconsole.log(Olá);\n// no console aparece um erro:\n// Uncaught ReferenceError: Olá is not defined\n\n// CERTO: com aspas, vira um texto comum\nconsole.log("Olá");\n// no console aparece: Olá',
                    },
                    {
                        type: "text",
                        value: '## Mais dois deslizes frequentes\n\nAinda na lista dos tropeços comuns:\n\n- **Esquecer de fechar os parênteses ou as aspas.** Todo `(` pede um `)`, e toda aspa que abre pede a que fecha. Escrever `console.log("Oi"` sem o `)` final deixa o comando pela metade e gera erro.\n- **Usar a crase no lugar das aspas.** Para textos, use aspas retas: aspas duplas (`"..."`) ou aspas simples (`\'...\'`). A crase (aquele tracinho perto da tecla 1) tem um uso especial que você verá mais adiante; para textos comuns, fique nas aspas.\n\nA boa notícia: o console **avisa** quando algo assim acontece, quase sempre com uma mensagem em vermelho apontando a linha. Ler esses avisos (mesmo em inglês) é uma habilidade que se desenvolve com o tempo, e eles quase sempre dão a pista do que corrigir.',
                    },
                    {
                        type: "table",
                        value: '[["Erro comum","O que o console mostra","Como evitar"],["Escrever `Console.log` (C maiúsculo)","`ReferenceError: Console is not defined`","O comando é todo minúsculo: `console.log`"],["Texto sem aspas: `console.log(Olá)`","`ReferenceError: Olá is not defined`","Ponha o texto entre aspas: `console.log(\\"Olá\\")`"],["Não fechar parênteses ou aspas","`SyntaxError` (erro de sintaxe)","Todo `(` pede `)`; toda aspa que abre, fecha"]]',
                    },
                    {
                        type: "text",
                        value: "## Parabéns por concluir o Módulo 1!\n\nFaça uma pausa para comemorar: você entendeu o que é o JavaScript, aprendeu a colocá-lo numa página, conheceu o console e escreveu o seu primeiro programa comentado. Não é pouca coisa para quem começou do zero há poucas aulas.\n\nO melhor conselho para agora é **praticar no console**: abra-o, escreva `console.log` com mensagens suas, faça contas, provoque de propósito um daqueles erros só para ver a cara dele. Quanto mais você brincar, mais natural tudo fica.\n\nNo **próximo módulo**, o JavaScript vai ganhar memória: você vai aprender a guardar valores em **variáveis** (dar nomes a números e textos) e os seus programas vão ficar bem mais espertos. Até lá!",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** **comentários** são textos que o JavaScript ignora, feitos para humanos; use `//` para uma linha e `/* */` para várias. Um programa **roda de cima para baixo**, e contas **sem aspas** são calculadas (com aspas, viram texto). Os erros clássicos de iniciante são trocar **maiúsculas por minúsculas** (`Console.log` não existe; é `console.log`), **esquecer as aspas** de um texto e **não fechar** parênteses ou aspas. O console **avisa** os erros em vermelho: aprender a ler esses avisos é meio caminho andado.",
                    },
                ],
                questions: [
                    {
                        statement: "Como se escreve um comentário de uma linha em JavaScript?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`// assim`",
                                isCorrect: true,
                            },
                            {
                                text: "`<!-- assim -->`",
                                isCorrect: false,
                            },
                            {
                                text: "`# assim`",
                                isCorrect: false,
                            },
                            {
                                text: "`** assim **`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que o JavaScript faz com o texto que está dentro de um comentário?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Executa o comentário primeiro, antes do resto do código.",
                                isCorrect: false,
                            },
                            {
                                text: "Mostra o comentário numa caixa de aviso na tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Ignora por completo: o comentário não roda e serve só para os humanos lerem.",
                                isCorrect: true,
                            },
                            {
                                text: "Transforma o comentário no título da página.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'Por que `Console.log("Oi")` (com C maiúsculo) gera um erro?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque faltou um ponto e vírgula no fim da linha.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o JavaScript diferencia maiúsculas de minúsculas, e o comando certo é `console.log`, todo minúsculo; `Console` não existe.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque `console.log` não aceita textos entre aspas.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque comentários não podem ter letras maiúsculas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a forma correta de escrever um comentário de bloco (que ocupa várias linhas)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`// texto aqui //`",
                                isCorrect: false,
                            },
                            {
                                text: "`<!-- texto aqui -->`",
                                isCorrect: false,
                            },
                            {
                                text: "`/* texto aqui */`",
                                isCorrect: true,
                            },
                            {
                                text: "`** texto aqui **`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'No console, `console.log("2 + 2")` (com aspas) mostra `2 + 2`, mas `console.log(2 + 2)` (sem aspas) mostra `4`. Por quê?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "É um bug do navegador; as duas formas deveriam mostrar `4`.",
                                isCorrect: false,
                            },
                            {
                                text: "Com aspas o JavaScript soma; sem aspas ele apenas repete o que foi digitado.",
                                isCorrect: false,
                            },
                            {
                                text: "Com aspas, o conteúdo é tratado como texto e exibido literalmente; sem aspas, `2 + 2` é uma conta que o JavaScript calcula antes de mostrar.",
                                isCorrect: true,
                            },
                            {
                                text: "A diferença é só a cor: uma aparece em vermelho e a outra em azul.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Variáveis e tipos de dados",
        aulas: [
            {
                titulo: "Variáveis: guardando valores",
                blocks: [
                    {
                        type: "text",
                        value: "# Variáveis: guardando valores\n\nNo módulo anterior, o JavaScript já sabia calcular e mostrar coisas, mas ele era meio esquecido: cada valor aparecia, era usado na hora e ia embora. A partir de agora isso muda. Neste módulo o JavaScript vai **ganhar memória**, e a peça que dá essa memória a ele tem um nome: a **variável**.\n\nEsta é uma das ideias mais importantes de toda a programação. Vá com calma, porque tudo o que você aprender daqui para a frente vai se apoiar neste conceito. A boa notícia é que ele é bem intuitivo quando visto do jeito certo.",
                    },
                    {
                        type: "quote",
                        value: "Uma **variável** é como uma **caixa com uma etiqueta**: você guarda um valor dentro dela e dá um **nome** à caixa. Depois, sempre que quiser aquele valor de volta, é só chamar pelo nome. Em JavaScript, a gente cria essas caixas com as palavras `let` e `const`, e coloca um valor dentro usando o sinal de igual `=`.",
                    },
                    {
                        type: "text",
                        value: '## A analogia da caixa com etiqueta\n\nImagine uma prateleira cheia de caixas. Em cada caixa você guarda uma coisa e cola uma **etiqueta** com um nome, para não se perder. Numa você escreve "idade" e guarda o número 25; em outra escreve "nome" e guarda o texto "Ana".\n\nA partir daí, você não precisa mais lembrar **o que** está guardado: basta pedir pela etiqueta. "Me dá o que está na caixa `idade`", e vem o 25. Uma **variável** é exatamente isso: um espaço na memória do computador, com um **nome** que você escolhe, guardando um **valor** que você pode consultar e usar quantas vezes quiser.',
                    },
                    {
                        type: "text",
                        value: '## Declarando uma variável com `let`\n\n**Declarar** uma variável é o ato de criar a caixa. Em JavaScript, uma das formas de fazer isso é com a palavra `let`. A receita é sempre a mesma: a palavra `let`, o **nome** que você escolhe, o sinal de igual `=` e o **valor** que vai dentro.\n\nO sinal `=` aqui **não** quer dizer "é igual a" da matemática. Ele quer dizer **"receba"**: a caixa da esquerda **recebe** o valor da direita. A gente chama isso de **atribuição**.',
                    },
                    {
                        type: "code",
                        value: 'let idade = 25;\n// criei a caixa "idade" e guardei o número 25 dentro dela\n\nconsole.log(idade);\n// no console aparece: 25  (pedi o conteúdo da caixa pelo nome)',
                    },
                    {
                        type: "text",
                        value: 'Repare que, dentro do `console.log`, eu escrevi `idade` **sem aspas**. Isso é de propósito: com aspas, `"idade"` seria o texto literal, a palavra; sem aspas, `idade` é o **nome da caixa**, e o JavaScript troca esse nome pelo valor guardado (o 25). Guardar essa diferença vale ouro.',
                    },
                    {
                        type: "text",
                        value: "## Reatribuir: trocar o conteúdo da caixa\n\nA palavra `let` cria uma caixa cujo conteúdo **pode mudar** com o tempo. Trocar o valor guardado se chama **reatribuir**, e é simples: escreva o nome, o `=` e o novo valor. Note que na hora de reatribuir você **não** repete o `let`, porque a caixa já existe; você só está trocando o que tem dentro.",
                    },
                    {
                        type: "code",
                        value: "let pontos = 10;\nconsole.log(pontos); // no console aparece: 10\n\npontos = 30;         // troquei o conteúdo da caixa (sem repetir let)\nconsole.log(pontos); // no console aparece: 30\n\npontos = pontos + 5; // pega o valor atual (30), soma 5 e guarda de volta\nconsole.log(pontos); // no console aparece: 35",
                    },
                    {
                        type: "text",
                        value: 'Aquela última linha costuma embaralhar a cabeça de quem começa, então vale destrinchar: o JavaScript primeiro **calcula o lado direito** (`pontos + 5`, ou seja, `30 + 5`, que dá `35`) e só depois **guarda o resultado** de volta na caixa `pontos`. Por isso o `=` é "receba", e não "é igual a": a caixa recebe o novo valor.',
                    },
                    {
                        type: "text",
                        value: "## `const`: uma caixa lacrada\n\nNem todo valor precisa mudar. O seu ano de nascimento, o número de dias da semana, a taxa de um imposto: são valores que, uma vez definidos, ficam **fixos**. Para esses casos existe o `const` (de _constant_, constante).\n\nUma variável criada com `const` funciona como uma **caixa lacrada**: você guarda o valor na criação e ele **não pode ser trocado** depois. Se você tentar reatribuir, o JavaScript reclama e para com um erro.",
                    },
                    {
                        type: "code",
                        value: 'const pi = 3.14;\nconsole.log(pi); // no console aparece: 3.14\n\npi = 3.15;\n// ERRO: Assignment to constant variable.\n// (tradução: "atribuição a uma variável constante" - não pode!)',
                    },
                    {
                        type: "text",
                        value: "Esse erro é um **amigo**, não um inimigo. Ao usar `const`, você deixa claro para o JavaScript (e para quem lê o código) que aquele valor é para ficar como está. Se em algum ponto o programa tentar mudá-lo por engano, o erro aparece na hora e te avisa do problema, em vez de deixá-lo passar despercebido.",
                    },
                    {
                        type: "text",
                        value: "## `let` ou `const`? Uma regra simples\n\nNa dúvida, a recomendação da comunidade é direta e vale a pena adotar desde já:\n\n- Comece **sempre** com `const`.\n- Só troque para `let` **se** você perceber que aquele valor realmente vai precisar mudar.\n\nParece contraintuitivo, mas usar `const` por padrão deixa o código mais **seguro** e mais fácil de entender: quem lê sabe, de imediato, quais valores são fixos e quais podem variar. Menos caixas destrancadas por aí, menos surpresas.",
                    },
                    {
                        type: "table",
                        value: '[["Palavra","Pode reatribuir?","Pode redeclarar?","Quando usar"],["`const`","Não","Não","O padrão: valores que não mudam"],["`let`","Sim","Não","Quando o valor vai mudar ao longo do tempo"],["`var`","Sim","Sim","Evite: é o jeito antigo e confuso"]]',
                    },
                    {
                        type: "text",
                        value: "## Por que fugir do `var`\n\nTalvez você encontre por aí, em códigos ou tutoriais antigos, uma terceira palavra: o `var`. Ela foi, por muitos anos, a **única** forma de declarar variáveis em JavaScript. A partir de 2015, a linguagem ganhou o `let` e o `const`, que vieram justamente para **corrigir** comportamentos confusos do `var`.\n\nUm dos problemas mais chatos é que o `var` deixa você **redeclarar** a mesma variável sem reclamar nenhum, o que abre a porta para bugs silenciosos: você acha que criou uma caixa nova, mas na verdade apagou uma que já existia.",
                    },
                    {
                        type: "code",
                        value: "var total = 100;\nvar total = 200; // o var permite isto sem erro nenhum... perigoso!\nconsole.log(total); // no console aparece: 200\n\nlet saldo = 100;\nlet saldo = 200;\n// ERRO: Identifier 'saldo' has already been declared.\n// o let te protege: avisa que essa caixa já existe",
                    },
                    {
                        type: "text",
                        value: "Viu a diferença? O `var` deixou a segunda declaração passar e sobrescreveu o valor caladinho; o `let` **barrou** e apontou o problema. Some a isso outras regras de escopo confusas do `var` (que você vai entender melhor mais para a frente) e a conclusão é uma só: **hoje, use `const` e `let`; deixe o `var` para os livros de história**.",
                    },
                    {
                        type: "text",
                        value: "## Regras e convenções para nomes\n\nO nome de uma variável não pode ser qualquer coisa. Há **regras** (que o JavaScript obriga) e **convenções** (combinados da comunidade que deixam o código legível). Comecemos pelas regras obrigatórias:\n\n- O nome pode ter **letras, números, `_` e `$`**, mas **não pode começar com número**.\n- **Não pode ter espaços** nem sinais como `-` (hífen).\n- **Não pode** ser uma palavra reservada da linguagem (como `let`, `const` ou `return`).\n- O JavaScript **diferencia maiúsculas de minúsculas**: `idade` e `Idade` são duas caixas diferentes.",
                    },
                    {
                        type: "code",
                        value: "let nomeCompleto = \"Ana Souza\"; // ok\nlet idade2 = 30;                // ok: número pode, só não no começo\nlet _interno = true;            // ok: pode começar com _ ou $\n\n// Os exemplos abaixo dariam ERRO se você tirasse o //:\n// let 2idade = 30;      -> não pode começar com número\n// let nome completo;    -> não pode ter espaço\n// let const = 5;        -> 'const' é palavra reservada",
                    },
                    {
                        type: "text",
                        value: 'Agora a **convenção** mais importante do JavaScript para nomes de variáveis: o **camelCase**. A ideia é juntar as palavras sem espaço, deixando a primeira toda minúscula e cada palavra seguinte com a **inicial maiúscula**, formando "corcovas" que lembram as de um camelo (daí o nome).\n\nAssim, "nome completo" vira `nomeCompleto`; "preço total" vira `precoTotal`; "data de nascimento" vira `dataDeNascimento`. Além de padronizar, isso deixa o nome fácil de ler. Escolha sempre nomes **descritivos**: `preco` é muito melhor do que `p`, porque explica sozinho o que a caixa guarda.',
                    },
                    {
                        type: "code",
                        value: '// Bom: nomes descritivos em camelCase\nconst precoTotal = 150;\nconst nomeDoCliente = "Bruno";\nlet quantidadeEmEstoque = 42;\n\n// Evite: nomes vagos ou fora do padrão\n// const x = 150;          -> não diz nada sobre o que guarda\n// const preco_total = 150; -> funciona, mas não é o padrão do JS',
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** uma **variável** é uma caixa com nome que guarda um valor. Você a cria (declara) com `const` (caixa lacrada, não muda) ou `let` (pode mudar), e coloca o valor com `=` (que significa "receba"). Prefira `const` por padrão e só use `let` quando o valor for mudar; **fuja do `var`**, que é o jeito antigo e confuso. Nomes seguem **regras** (sem espaço, sem começar com número, nada de palavras reservadas) e a **convenção camelCase** (`nomeCompleto`), sempre descritivos.',
                    },
                ],
                questions: [
                    {
                        statement: "Na analogia usada na aula, o que é uma variável?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma caixa com uma etiqueta (nome) que guarda um valor para você usar depois.",
                                isCorrect: true,
                            },
                            {
                                text: "Um comando que apaga tudo o que está na tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Um tipo especial de comentário que o JavaScript ignora.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma cor que você aplica ao texto da página.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual palavra você usa para declarar uma variável cujo valor NÃO deve mudar?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`const`",
                                isCorrect: true,
                            },
                            {
                                text: "`let`",
                                isCorrect: false,
                            },
                            {
                                text: "`var`",
                                isCorrect: false,
                            },
                            {
                                text: "`fixo`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece quando você tenta reatribuir um valor a uma variável declarada com `const`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O JavaScript troca o valor normalmente, sem avisar nada.",
                                isCorrect: false,
                            },
                            {
                                text: 'O JavaScript para com um erro ("Assignment to constant variable"), porque `const` não permite reatribuição.',
                                isCorrect: true,
                            },
                            {
                                text: "O valor antigo e o novo são somados automaticamente.",
                                isCorrect: false,
                            },
                            {
                                text: "A variável é apagada da memória.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual destes nomes de variável segue a convenção camelCase do JavaScript?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`precoTotal`",
                                isCorrect: true,
                            },
                            {
                                text: "`preco_total`",
                                isCorrect: false,
                            },
                            {
                                text: "`PrecoTotal`",
                                isCorrect: false,
                            },
                            {
                                text: "`preco-total`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que a recomendação hoje é usar `let` e `const` em vez de `var`?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque `var` só funciona em celulares e `let`/`const` funcionam em computadores.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque `var` é mais rápido, mas foi proibido pelos navegadores.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque `var` permite redeclarar a mesma variável sem avisar (fonte de bugs) e tem regras de escopo confusas; `let` e `const` são mais seguros e claros.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque `var` não aceita números como valor, só textos.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Os tipos de dados",
                blocks: [
                    {
                        type: "text",
                        value: '# Os tipos de dados\n\nAgora que você sabe guardar valores em variáveis, surge uma pergunta natural: que **tipos** de valores dá para guardar? Um número não é a mesma coisa que um texto, e um texto não é a mesma coisa que um "sim ou não". O JavaScript enxerga essas diferenças, e chama cada categoria de valor de **tipo de dado**.\n\nEntender os tipos é entender a **matéria-prima** com que você vai trabalhar. Nesta aula a gente conhece os principais e aprende um comando pequeno e poderoso para descobrir o tipo de qualquer valor.',
                    },
                    {
                        type: "quote",
                        value: 'Todo valor em JavaScript tem um **tipo**. Os tipos básicos, chamados de **primitivos**, são: **`string`** (texto), **`number`** (número), **`boolean`** (verdadeiro ou falso), **`undefined`** ("ainda sem valor") e **`null`** ("vazio de propósito"). Para descobrir o tipo de um valor, use o operador `typeof`.',
                    },
                    {
                        type: "text",
                        value: '## O que é um "tipo"\n\nPense num supermercado que separa os produtos por seção: hortifrúti, limpeza, bebidas. Saber a seção de um produto já diz muito sobre ele e sobre o que dá para fazer com ele. Com os valores é parecido: o **tipo** diz que **natureza** aquele valor tem e quais operações fazem sentido.\n\nFaz sentido **multiplicar** dois números, mas não faz sentido multiplicar dois nomes. Faz sentido deixar um texto **em maiúsculas**, mas não um número. O tipo é o que permite ao JavaScript saber o que é possível fazer com cada valor. Vamos conhecer os primitivos, um a um.',
                    },
                    {
                        type: "text",
                        value: '## `string`: textos\n\nO tipo `string` guarda **texto**: qualquer sequência de caracteres, seja uma letra, uma palavra, uma frase inteira ou até um texto vazio. A marca registrada da `string` são as **aspas** ao redor: simples (`\'...\'`) ou duplas (`"..."`). É por causa delas que o JavaScript sabe "isto aqui é texto".',
                    },
                    {
                        type: "code",
                        value: 'let nome = "Ana Beatriz";\nlet saudacao = \'Bom dia!\';\nlet letra = "a";\n\nconsole.log(nome);     // no console aparece: Ana Beatriz\nconsole.log(typeof nome); // no console aparece: string',
                    },
                    {
                        type: "text",
                        value: "## `number`: números\n\nO tipo `number` guarda **números**, e aqui vai uma diferença importante em relação a outras linguagens: no JavaScript, **não existe** separação entre número inteiro e número com vírgula, é tudo `number`. Os números vão **sem aspas** (senão viram texto!), e a parte decimal usa **ponto**, não vírgula, como manda o padrão da programação.",
                    },
                    {
                        type: "code",
                        value: "let idade = 25;      // um inteiro\nlet altura = 1.75;   // um decimal (repare no PONTO, não vírgula)\nlet saldo = -40;     // números negativos também valem\n\nconsole.log(altura);        // no console aparece: 1.75\nconsole.log(typeof idade);  // no console aparece: number\nconsole.log(typeof altura); // no console aparece: number",
                    },
                    {
                        type: "text",
                        value: '## `boolean`: verdadeiro ou falso\n\nO tipo `boolean` (nome em homenagem ao matemático George Boole) é o mais enxuto de todos: ele só tem **dois** valores possíveis, `true` (verdadeiro) e `false` (falso). Também vão **sem aspas**, senão viram texto. Pode parecer pouco, mas esse "sim ou não" é o coração das **decisões** que o seu programa vai tomar mais adiante ("se o saldo for suficiente, então...").',
                    },
                    {
                        type: "code",
                        value: "let maiorDeIdade = true;\nlet estaChovendo = false;\n\nconsole.log(maiorDeIdade);        // no console aparece: true\nconsole.log(typeof estaChovendo); // no console aparece: boolean\n\n// booleanos também nascem de comparações:\nconsole.log(10 > 5); // no console aparece: true",
                    },
                    {
                        type: "text",
                        value: '## `undefined` e `null`: as duas formas de "vazio"\n\nNem todo valor é um número ou um texto: às vezes o valor é justamente a **ausência** de valor. O JavaScript tem dois tipos para isso, e a diferença entre eles é sutil, mas útil:\n\n- **`undefined`** é o vazio **automático**: quando você declara uma variável mas ainda **não coloca nada** dentro, o JavaScript preenche a caixa com `undefined`, que significa mais ou menos "ainda sem valor".\n- **`null`** é o vazio **de propósito**: é você, programador, dizendo "esta caixa está intencionalmente vazia". O JavaScript nunca coloca `null` sozinho; ele só aparece quando você o escreve.',
                    },
                    {
                        type: "code",
                        value: 'let premio;             // declarei, mas não atribuí nada\nconsole.log(premio);    // no console aparece: undefined\n\nlet desconto = null;    // eu, de propósito, digo "aqui não há nada"\nconsole.log(desconto);  // no console aparece: null',
                    },
                    {
                        type: "text",
                        value: "## O operador `typeof`\n\nVocê já viu ele aparecer nos exemplos: o `typeof` é um operador que **revela o tipo** de um valor. Você escreve `typeof` seguido do valor (ou do nome da variável) e ele devolve um **texto** com o nome do tipo. É uma ferramenta ótima para investigar e para tirar dúvidas quando o comportamento do código te surpreender.",
                    },
                    {
                        type: "code",
                        value: 'console.log(typeof "Olá");  // no console aparece: string\nconsole.log(typeof 42);      // no console aparece: number\nconsole.log(typeof true);    // no console aparece: boolean\nconsole.log(typeof undefined); // no console aparece: undefined\nconsole.log(typeof null);    // no console aparece: object  (!)',
                    },
                    {
                        type: "text",
                        value: 'Aquele último resultado costuma pegar todo mundo de surpresa: `typeof null` devolve `"object"`, e **não** `"null"` como seria de esperar. Isso é um **bug histórico** do JavaScript, que existe desde a primeira versão da linguagem lá em 1995 e nunca foi corrigido para não quebrar sites antigos. Não é você que está errando: é só uma peculiaridade da linguagem que vale a pena conhecer para não tropeçar nela.',
                    },
                    {
                        type: "table",
                        value: '[["Tipo","O que guarda","Exemplo","`typeof` devolve"],["`string`","Texto (entre aspas)","`\\"Olá\\"`","`\\"string\\"`"],["`number`","Números (inteiros ou decimais)","`25`, `1.75`","`\\"number\\"`"],["`boolean`","Verdadeiro ou falso","`true`, `false`","`\\"boolean\\"`"],["`undefined`","Vazio automático (sem valor ainda)","`undefined`","`\\"undefined\\"`"],["`null`","Vazio de propósito","`null`","`\\"object\\"` (bug histórico)"]]',
                    },
                    {
                        type: "text",
                        value: '## JavaScript é de tipagem dinâmica\n\nRepare numa coisa que talvez tenha passado batido: em nenhum momento você precisou **avisar** ao JavaScript de que tipo cada variável seria. Você não escreveu "esta caixa é de número" ou "esta é de texto"; simplesmente guardou o valor e o JavaScript **descobriu o tipo sozinho**, olhando para o que foi guardado.\n\nMais do que isso: a **mesma** variável pode guardar um texto agora e um número daqui a pouco. O tipo não é da caixa, é do **valor** que está dentro dela naquele momento. Essa característica tem nome: **tipagem dinâmica**.',
                    },
                    {
                        type: "code",
                        value: 'let coisa = "um texto";\nconsole.log(typeof coisa); // no console aparece: string\n\ncoisa = 42;                // a mesma caixa agora guarda um número\nconsole.log(typeof coisa); // no console aparece: number\n\ncoisa = true;              // e agora um booleano\nconsole.log(typeof coisa); // no console aparece: boolean',
                    },
                    {
                        type: "text",
                        value: "Essa liberdade é uma faca de dois gumes. De um lado, é prático e flexível. De outro, exige **atenção**: como o JavaScript não te obriga a fixar o tipo, é fácil, sem querer, acabar com um número onde você esperava um texto (ou vice-versa) e ter uma surpresa. Por isso o `typeof` vai ser um aliado tão frequente: na dúvida sobre o que uma variável está guardando, pergunte a ele.",
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** todo valor tem um **tipo**. Os **primitivos** são `string` (texto, entre aspas), `number` (números, com ponto decimal e sem aspas), `boolean` (`true`/`false`), `undefined` (vazio automático) e `null` (vazio de propósito). O operador `typeof` revela o tipo de um valor, com a curiosidade de que `typeof null` devolve `"object"` por um bug histórico. E, como o JavaScript é de **tipagem dinâmica**, o tipo vem do valor guardado, não da variável, e a mesma variável pode mudar de tipo.',
                    },
                ],
                questions: [
                    {
                        statement: 'Qual é o tipo do valor `"Olá, mundo"`?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "`string`, porque é um texto entre aspas.",
                                isCorrect: true,
                            },
                            {
                                text: "`number`, porque tem várias letras.",
                                isCorrect: false,
                            },
                            {
                                text: "`boolean`, porque toda frase é verdadeira.",
                                isCorrect: false,
                            },
                            {
                                text: "`undefined`, porque textos não têm tipo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para que serve o operador `typeof`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Para apagar o valor de uma variável.",
                                isCorrect: false,
                            },
                            {
                                text: "Para revelar (mostrar) o tipo de um valor.",
                                isCorrect: true,
                            },
                            {
                                text: "Para transformar qualquer valor em texto maiúsculo.",
                                isCorrect: false,
                            },
                            {
                                text: "Para somar dois números.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você declara `let premio;` mas não coloca nenhum valor. O que `console.log(premio)` mostra?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`null`",
                                isCorrect: false,
                            },
                            {
                                text: "`0`",
                                isCorrect: false,
                            },
                            {
                                text: "`undefined`, porque a variável foi declarada mas ainda não recebeu valor.",
                                isCorrect: true,
                            },
                            {
                                text: "Um erro, porque toda variável precisa de um valor.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'O que significa dizer que o JavaScript é de "tipagem dinâmica"?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que só é possível usar um tipo de valor por programa.",
                                isCorrect: false,
                            },
                            {
                                text: "Que você não precisa declarar o tipo, e a mesma variável pode guardar valores de tipos diferentes ao longo do tempo.",
                                isCorrect: true,
                            },
                            {
                                text: "Que os tipos mudam de cor conforme você digita.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o JavaScript proíbe trocar o valor de uma variável.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao rodar `console.log(typeof null)`, qual é a saída (e por quê)?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: '`"null"`, que é o nome esperado do tipo.',
                                isCorrect: false,
                            },
                            {
                                text: '`"object"`, por um bug histórico do JavaScript que nunca foi corrigido.',
                                isCorrect: true,
                            },
                            {
                                text: '`"undefined"`, porque `null` e `undefined` são a mesma coisa.',
                                isCorrect: false,
                            },
                            {
                                text: "Um erro, porque não se pode usar `typeof` com `null`.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Strings e template literals",
                blocks: [
                    {
                        type: "text",
                        value: "# Strings e template literals\n\nTextos estão em todo lugar num programa: nomes, mensagens, avisos, endereços de e-mail. No JavaScript, todo texto é uma **string**, e nesta aula você vai aprender a criar strings e, principalmente, a **juntá-las** com valores de variáveis para montar mensagens sob medida.\n\nNo fim, você vai conhecer o recurso mais elegante do JavaScript para trabalhar com texto, os **template literals**, que provavelmente vão virar os seus preferidos.",
                    },
                    {
                        type: "quote",
                        value: "Uma **string** pode ser escrita com **aspas simples** (`'...'`) ou **duplas** (`\"...\"`), que funcionam igual. Para juntar textos, o jeito clássico é a **concatenação** com o operador `+`. O jeito **moderno**, e mais legível, é o **template literal**: um texto escrito entre **crases** (`` ` ``) no qual você encaixa valores com `${...}`.",
                    },
                    {
                        type: "text",
                        value: "## Aspas simples e duplas\n\nPara criar uma string, você envolve o texto em aspas. O JavaScript aceita dois tipos, e eles são **equivalentes**: aspas **duplas** (`\"...\"`) e aspas **simples** (`'...'`). Escolher um ou outro é questão de gosto e, às vezes, de conveniência, como você vai ver já já. O que **não** pode é misturar: se abriu com aspas duplas, feche com aspas duplas.",
                    },
                    {
                        type: "code",
                        value: "let nome = \"Ana\";      // aspas duplas\nlet cidade = 'Recife'; // aspas simples: funciona igualzinho\n\nconsole.log(nome);   // no console aparece: Ana\nconsole.log(cidade); // no console aparece: Recife",
                    },
                    {
                        type: "text",
                        value: "Ter os dois tipos é útil quando o **próprio texto** contém uma aspa. A saída é envolver a string com o **outro** tipo de aspa. Se o texto tem aspas duplas dentro, use aspas simples por fora; se tem um apóstrofo, use aspas duplas por fora. Assim o JavaScript não se confunde sobre onde a string termina.",
                    },
                    {
                        type: "code",
                        value: 'let fala = \'Ela disse "oi" e foi embora\';  // duplas dentro -> simples fora\nlet visita = "Vou à casa d\'Ana";           // apóstrofo dentro -> duplas fora\n\nconsole.log(fala);   // no console aparece: Ela disse "oi" e foi embora\nconsole.log(visita); // no console aparece: Vou à casa d\'Ana',
                    },
                    {
                        type: "text",
                        value: '## Concatenação: juntando textos com `+`\n\nVocê já viu o `+` somando números. Com textos, ele faz outra coisa: **junta** (gruda) as strings, uma na outra, formando um texto maior. Esse "colar textos" tem um nome bonito: **concatenação**. É assim que a gente monta uma mensagem misturando partes fixas com o valor de variáveis.',
                    },
                    {
                        type: "code",
                        value: 'let nome = "Ana";\nlet saudacao = "Olá, " + nome + "!";\nconsole.log(saudacao); // no console aparece: Olá, Ana!',
                    },
                    {
                        type: "text",
                        value: "Repare num detalhe fácil de esquecer: os **espaços**. O `+` cola os textos **exatamente** como estão, sem inventar espaço nenhum. Se você não deixar o espaço dentro das aspas, as palavras saem grudadas. Esse é um dos deslizes mais comuns de quem começa a concatenar.",
                    },
                    {
                        type: "code",
                        value: 'let nome = "Ana";\n\nconsole.log("Bem-vinda, " + nome); // no console aparece: Bem-vinda, Ana\nconsole.log("Bem-vinda," + nome);  // no console aparece: Bem-vinda,Ana\n//                     ^ faltou o espaço aqui, então grudou',
                    },
                    {
                        type: "text",
                        value: 'A concatenação funciona, mas repare como ela fica **trabalhosa** quando a mensagem cresce: são muitas aspas, muitos sinais de `+` e muito espaço para controlar na mão. Uma frase média já vira um festival de `" + ... + "`, e é fácil errar. Foi para resolver justamente isso que o JavaScript ganhou uma alternativa muito melhor.',
                    },
                    {
                        type: "text",
                        value: "## Template literals: o jeito moderno\n\nO **template literal** é uma forma de escrever strings usando a **crase** (`` ` ``), aquele tracinho inclinado que costuma ficar perto da tecla do número 1, no lugar das aspas. A grande vantagem é que, dentro de uma crase, você pode encaixar o valor de uma variável usando a marcação `${...}`: escreve `$`, abre chave, põe o nome da variável e fecha a chave.\n\nO JavaScript então **substitui** aquele `${...}` pelo valor guardado. Compare com a concatenação e veja como fica mais limpo:",
                    },
                    {
                        type: "code",
                        value: 'let nome = "Ana";\nlet idade = 25;\n\n// Do jeito antigo, com concatenação:\nconsole.log("Olá, " + nome + "! Você tem " + idade + " anos.");\n\n// Do jeito moderno, com template literal:\nconsole.log(`Olá, ${nome}! Você tem ${idade} anos.`);\n\n// as duas linhas mostram: Olá, Ana! Você tem 25 anos.',
                    },
                    {
                        type: "text",
                        value: "Muito mais fácil de ler, não é? Você escreve a frase **de forma natural** e só marca, com `${...}`, os buracos onde entram os valores. Sem contar aspas, sem contar `+`, sem se preocupar com espaço: o que está fora do `${...}` sai exatamente como você escreveu.",
                    },
                    {
                        type: "text",
                        value: "## Dá para colocar contas e métodos dentro do `${...}`\n\nO que vai dentro de `${...}` não precisa ser só o nome de uma variável: pode ser uma **expressão** inteira, ou seja, qualquer pedacinho de código que **resulte num valor**. Uma conta, uma comparação, até a chamada de um método de string. O JavaScript resolve o que está lá dentro e encaixa o resultado no texto.",
                    },
                    {
                        type: "code",
                        value: 'let preco = 40;\nlet quantidade = 3;\nconsole.log(`Total: R$ ${preco * quantidade}`);\n// no console aparece: Total: R$ 120\n\nlet nome = "ana";\nconsole.log(`Bem-vinda, ${nome.toUpperCase()}!`);\n// no console aparece: Bem-vinda, ANA!',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Concatenação (`+`)","Template literal (crase)"],["Delimitador","`\\"...\\"` ou `\'...\'`","`` `...` ``"],["Inserir uma variável","`\\"Oi, \\" + nome`","`` `Oi, ${nome}` ``"],["Controle de espaços","Manual (fácil esquecer)","Natural (você escreve a frase)"],["Várias linhas","Difícil e verboso","Fácil (quebra de linha real)"]]',
                    },
                    {
                        type: "text",
                        value: "## Quebra de linha: o escape `\\n` e o template de várias linhas\n\nE se você quiser que um texto ocupe **mais de uma linha**? Dentro de aspas, existe uma marcação especial para isso: a sequência `\\n` (uma barra invertida seguida da letra `n`). Ela representa uma **quebra de linha**. Essas combinações que começam com `\\` e têm um significado especial são chamadas de **sequências de escape**.",
                    },
                    {
                        type: "code",
                        value: 'console.log("Linha 1\\nLinha 2");\n// no console aparece em duas linhas:\n// Linha 1\n// Linha 2',
                    },
                    {
                        type: "text",
                        value: "Com **template literals** você tem uma opção ainda mais direta: como o texto vai entre crases, basta **apertar Enter** e quebrar a linha de verdade dentro do código. A quebra que você vê no editor aparece igual na saída, sem precisar do `\\n`.",
                    },
                    {
                        type: "code",
                        value: 'let nome = "Ana";\nlet bilhete = `Oi, ${nome},\ntudo bem?\nAté logo!`;\n\nconsole.log(bilhete);\n// no console aparece em três linhas:\n// Oi, Ana,\n// tudo bem?\n// Até logo!',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** strings vão entre **aspas simples ou duplas** (equivalentes; use o outro tipo por fora quando o texto tiver aspas). Para juntar textos, a **concatenação** usa `+` (cuidado com os espaços!). O jeito moderno é o **template literal**, entre **crases**, onde `${...}` encaixa o valor de variáveis e até de expressões (`${preco * 3}`). A quebra de linha é `\\n` dentro de aspas, ou uma quebra real dentro de um template literal.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual símbolo delimita um template literal?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A crase (`` ` ``).",
                                isCorrect: true,
                            },
                            {
                                text: 'As aspas duplas (`"`).',
                                isCorrect: false,
                            },
                            {
                                text: "As aspas simples (`'`).",
                                isCorrect: false,
                            },
                            {
                                text: "A barra (`/`).",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Na concatenação, qual operador junta dois textos?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O operador `+`.",
                                isCorrect: true,
                            },
                            {
                                text: "O operador `&`.",
                                isCorrect: false,
                            },
                            {
                                text: "O operador `.`.",
                                isCorrect: false,
                            },
                            {
                                text: "O operador `*`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Com `let nome = "Ana";`, qual é a saída de `` console.log(`Oi, ${nome}!`) ``?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "`Oi, Ana!`",
                                isCorrect: true,
                            },
                            {
                                text: "`Oi, ${nome}!` (mostra o texto sem substituir)",
                                isCorrect: false,
                            },
                            {
                                text: "`Oi, nome!`",
                                isCorrect: false,
                            },
                            {
                                text: "Um erro, porque não se usa `${}` em textos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Dentro de uma string com aspas, o que a sequência `\\n` faz?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Insere uma quebra de linha (o texto continua na linha de baixo).",
                                isCorrect: true,
                            },
                            {
                                text: "Apaga a letra `n` do texto.",
                                isCorrect: false,
                            },
                            {
                                text: "Deixa o texto em negrito.",
                                isCorrect: false,
                            },
                            {
                                text: "Insere um espaço em branco só.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Com `let n = "Ana";`, qual das opções usa um template literal CORRETO para produzir `Oi, Ana!`?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`` `Oi, ${n}!` ``",
                                isCorrect: true,
                            },
                            {
                                text: '`"Oi, ${n}!"` (aspas duplas em vez de crase)',
                                isCorrect: false,
                            },
                            {
                                text: "`` `Oi, {n}!` `` (sem o cifrão antes da chave)",
                                isCorrect: false,
                            },
                            {
                                text: "`` `Oi, $(n)!` `` (parênteses no lugar das chaves)",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Métodos de string",
                blocks: [
                    {
                        type: "text",
                        value: "# Métodos de string\n\nToda string em JavaScript já vem com uma caixa de ferramentas embutida: um conjunto de **métodos** capazes de medir, transformar, procurar e recortar o texto para você. Nesta aula você vai conhecer os métodos mais usados no dia a dia, aqueles que aparecem em praticamente todo programa que mexe com texto.\n\nNão precisa decorar tudo de primeira. A ideia é você saber que essas ferramentas **existem** e ter uma noção do que cada uma faz, para saber onde procurar quando precisar.",
                    },
                    {
                        type: "quote",
                        value: "Um **método** é uma **ação** que um valor já sabe fazer. Você chama um método escrevendo o valor, um **ponto** e o nome do método com **parênteses**: `texto.toUpperCase()`. Um detalhe de ouro: os métodos de string **não alteram** a string original, eles **devolvem uma nova**, porque strings são imutáveis.",
                    },
                    {
                        type: "text",
                        value: "## O que é um método (e o ponto)\n\nSe uma variável é um substantivo (a coisa), um **método** é um verbo (o que a coisa sabe fazer). Uma string sabe se colocar em maiúsculas, sabe dizer o seu tamanho, sabe procurar um pedaço dentro de si. Para pedir uma dessas ações, você usa a **notação de ponto**: escreve o texto (ou a variável que o guarda), um **ponto** `.` e o nome do método seguido de **parênteses** `()`.\n\nOs parênteses são onde vão as informações extras de que o método precisa (se precisar de alguma). Vamos aos principais.",
                    },
                    {
                        type: "text",
                        value: "## `length`: o tamanho do texto\n\nO `length` conta **quantos caracteres** a string tem, incluindo espaços e pontuação. Ele é o único da lista que **não** leva parênteses, porque não é bem um método, e sim uma **propriedade** (uma informação que a string carrega, e não uma ação que ela executa). Na prática: escreva o texto, ponto e `length`, sem `()`.",
                    },
                    {
                        type: "code",
                        value: 'let palavra = "JavaScript";\nconsole.log(palavra.length); // no console aparece: 10  (repare: sem parênteses)\n\nconsole.log("Olá, mundo".length); // no console aparece: 10  (o espaço conta!)\nconsole.log("".length);           // no console aparece: 0   (texto vazio)',
                    },
                    {
                        type: "text",
                        value: '## `toUpperCase` e `toLowerCase`: mudando a caixa\n\nEsses dois transformam a caixa das letras: `toUpperCase()` devolve o texto **todo em maiúsculas** e `toLowerCase()` devolve **todo em minúsculas**. São muito usados para **padronizar** um texto antes de compará-lo, já que, para o JavaScript, `"Ana"` e `"ana"` são diferentes.',
                    },
                    {
                        type: "code",
                        value: 'let nome = "ana";\n\nconsole.log(nome.toUpperCase()); // no console aparece: ANA\nconsole.log("GRITARIA".toLowerCase()); // no console aparece: gritaria\n\nconsole.log(nome); // no console aparece: ana  (o original NÃO mudou!)',
                    },
                    {
                        type: "text",
                        value: 'Aquela última linha revela a tal **imutabilidade**: mesmo depois de chamar `nome.toUpperCase()`, a variável `nome` continua valendo `"ana"`. O método não mexeu no original; ele **produziu um novo texto** (`"ANA"`) e o entregou. Se você quiser guardar esse resultado, precisa colocá-lo numa variável: `let gritado = nome.toUpperCase();`.',
                    },
                    {
                        type: "text",
                        value: "## `includes` e `indexOf`: procurando dentro do texto\n\nMuitas vezes você quer saber se um texto **contém** um certo pedaço. Para isso há dois métodos:\n\n- **`includes(pedaco)`** responde com um **booleano**: `true` se o pedaço existe dentro da string, `false` se não existe.\n- **`indexOf(pedaco)`** vai além e diz **em que posição** o pedaço começa. Importante: a contagem das posições começa em **zero** (a primeira letra é a posição 0). Se não encontrar, ele devolve `-1`.",
                    },
                    {
                        type: "code",
                        value: 'let email = "ana@site.com";\n\nconsole.log(email.includes("@"));  // no console aparece: true\nconsole.log(email.includes("!"));  // no console aparece: false\n\nconsole.log(email.indexOf("@"));   // no console aparece: 3  (o @ é a 4ª letra, posição 3)\nconsole.log(email.indexOf("x"));   // no console aparece: -1 (não encontrou)',
                    },
                    {
                        type: "text",
                        value: "## `slice`: recortando um pedaço\n\nO `slice(inicio, fim)` **recorta** e devolve um trecho da string. Você informa a posição onde o corte **começa** e a posição onde ele **termina**, lembrando que a contagem começa no zero e que o caractere da posição `fim` **não** entra (o corte vai até logo antes dele). Se você passar só o início, ele recorta dali até o final. E aceita até números **negativos**, que contam a partir do fim do texto.",
                    },
                    {
                        type: "code",
                        value: 'let texto = "JavaScript";\n\nconsole.log(texto.slice(0, 4)); // no console aparece: Java   (do 0 até antes do 4)\nconsole.log(texto.slice(4));    // no console aparece: Script (do 4 até o fim)\nconsole.log(texto.slice(-6));   // no console aparece: Script (os 6 últimos caracteres)',
                    },
                    {
                        type: "text",
                        value: "## `replace`: trocando um pedaço por outro\n\nO `replace(alvo, novo)` procura o `alvo` dentro do texto e o substitui pelo `novo`, devolvendo o texto já modificado. Há uma pegadinha clássica aqui: por padrão, o `replace` troca **apenas a primeira** ocorrência que encontrar, não todas. Para trocar todas, existe o irmão `replaceAll`.",
                    },
                    {
                        type: "code",
                        value: 'let frase = "Eu gosto de gato";\nconsole.log(frase.replace("gato", "cachorro"));\n// no console aparece: Eu gosto de cachorro\n\nlet data = "2024-01-15";\nconsole.log(data.replace("-", "/"));\n// no console aparece: 2024/01-15  (trocou só o PRIMEIRO traço!)\nconsole.log(data.replaceAll("-", "/"));\n// no console aparece: 2024/01/15  (replaceAll troca todos)',
                    },
                    {
                        type: "text",
                        value: "## `split`: dividindo o texto numa lista\n\nO `split(separador)` **quebra** o texto em vários pedaços, cortando toda vez que encontra o `separador` que você indicar, e devolve uma **lista** (um _array_) com as partes. É extremamente útil para separar itens de uma linha, palavras de uma frase ou partes de uma data. Você vai aprender bastante sobre listas no próximo módulo; por enquanto, repare no formato com colchetes `[ ]`.",
                    },
                    {
                        type: "code",
                        value: "let itens = \"maçã,banana,uva\";\nconsole.log(itens.split(\",\"));\n// no console aparece: ['maçã', 'banana', 'uva']\n\nlet nomeCompleto = \"Ana Beatriz Souza\";\nconsole.log(nomeCompleto.split(\" \"));\n// no console aparece: ['Ana', 'Beatriz', 'Souza']",
                    },
                    {
                        type: "text",
                        value: "## `trim`: removendo espaços das pontas\n\nO `trim()` **remove os espaços em branco** que sobraram no **começo** e no **fim** do texto (os espaços do meio ele não toca). Parece pouca coisa, mas é um dos métodos mais úteis do mundo real: quando alguém preenche um formulário, é comuníssimo sobrar um espaço acidental antes ou depois do que foi digitado, e o `trim()` faz essa limpeza.",
                    },
                    {
                        type: "code",
                        value: 'let digitado = "   ana@site.com   ";\n\nconsole.log(digitado.trim());        // no console aparece: ana@site.com\nconsole.log(digitado.trim().length); // no console aparece: 12\n\n// dá para encadear métodos, um após o outro:\nconsole.log(digitado.trim().toUpperCase()); // no console aparece: ANA@SITE.COM',
                    },
                    {
                        type: "text",
                        value: "Aquela última linha mostra um recurso poderoso: o **encadeamento**. Como cada método devolve uma nova string, você pode chamar outro método **em seguida**, no resultado do anterior. O JavaScript resolve da esquerda para a direita: primeiro `trim()` limpa os espaços, e sobre esse resultado o `toUpperCase()` deixa tudo maiúsculo.",
                    },
                    {
                        type: "table",
                        value: '[["Método","O que faz","Exemplo","Resultado"],["`.length`","Conta os caracteres (propriedade)","`\\"olá\\".length`","`3`"],["`.toUpperCase()`","Deixa tudo maiúsculo","`\\"olá\\".toUpperCase()`","`\\"OLÁ\\"`"],["`.toLowerCase()`","Deixa tudo minúsculo","`\\"OLÁ\\".toLowerCase()`","`\\"olá\\"`"],["`.includes(x)`","O texto contém x?","`\\"gato\\".includes(\\"a\\")`","`true`"],["`.indexOf(x)`","Posição de x (ou `-1`)","`\\"gato\\".indexOf(\\"t\\")`","`2`"],["`.slice(i, f)`","Recorta um trecho","`\\"gato\\".slice(0, 2)`","`\\"ga\\"`"],["`.replace(a, b)`","Troca a por b (só o 1º)","`\\"gato\\".replace(\\"g\\", \\"p\\")`","`\\"pato\\"`"],["`.split(sep)`","Divide numa lista","`\\"a,b\\".split(\\",\\")`","`[\'a\', \'b\']`"],["`.trim()`","Tira espaços das pontas","`\\"  oi  \\".trim()`","`\\"oi\\"`"]]',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** métodos são **ações** que a string sabe fazer, chamadas com `texto.metodo()`. Você tem `length` (tamanho, sem parênteses), `toUpperCase`/`toLowerCase` (caixa das letras), `includes`/`indexOf` (procurar), `slice` (recortar), `replace` (trocar o primeiro), `split` (dividir numa lista) e `trim` (limpar as pontas). Como strings são **imutáveis**, esses métodos **devolvem um novo texto** sem alterar o original, e podem ser **encadeados**.",
                    },
                ],
                questions: [
                    {
                        statement: 'Qual é o resultado de `"JavaScript".length`?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "`10`",
                                isCorrect: true,
                            },
                            {
                                text: "`9`",
                                isCorrect: false,
                            },
                            {
                                text: '`"JavaScript"`',
                                isCorrect: false,
                            },
                            {
                                text: "`0`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o método `toUpperCase()` faz com uma string?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Devolve o texto com todas as letras em maiúsculas.",
                                isCorrect: true,
                            },
                            {
                                text: "Conta quantas letras o texto tem.",
                                isCorrect: false,
                            },
                            {
                                text: "Remove os espaços do começo e do fim.",
                                isCorrect: false,
                            },
                            {
                                text: "Inverte a ordem das letras.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'Qual é a saída de `"gato".includes("a")`?',
                        difficulty: "medio",
                        options: [
                            {
                                text: '`true`, porque a letra `a` existe dentro de `"gato"`.',
                                isCorrect: true,
                            },
                            {
                                text: "`false`, porque `includes` só funciona com palavras inteiras.",
                                isCorrect: false,
                            },
                            {
                                text: "`1`, que é a posição da letra.",
                                isCorrect: false,
                            },
                            {
                                text: '`"a"`, a própria letra procurada.',
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'Qual é o resultado de `"2024-01-15".replace("-", "/")`?',
                        difficulty: "medio",
                        options: [
                            {
                                text: '`"2024/01-15"`, porque `replace` troca apenas a primeira ocorrência.',
                                isCorrect: true,
                            },
                            {
                                text: '`"2024/01/15"`, porque `replace` troca todas as ocorrências.',
                                isCorrect: false,
                            },
                            {
                                text: '`"20240115"`, porque `replace` apaga os traços.',
                                isCorrect: false,
                            },
                            {
                                text: "Um erro, porque `replace` não aceita traços.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'Depois de `let n = "ana"; n.toUpperCase();`, quanto vale `n`?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: '`"ana"`, porque os métodos de string não alteram o original: eles devolvem um novo texto.',
                                isCorrect: true,
                            },
                            {
                                text: '`"ANA"`, porque `toUpperCase` mudou a variável `n`.',
                                isCorrect: false,
                            },
                            {
                                text: "`undefined`, porque a string foi consumida pelo método.",
                                isCorrect: false,
                            },
                            {
                                text: "Um erro, porque faltou guardar o resultado.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Trabalhando com números",
                blocks: [
                    {
                        type: "text",
                        value: '# Trabalhando com números\n\nNúmeros são a matéria-prima de todo cálculo: totais de compras, médias de notas, idades, distâncias, preços. Você já viu o JavaScript somar lá no primeiro módulo; agora vamos com calma pelas operações, pelas armadilhas comuns e por um punhado de ferramentas que arredondam, sorteiam e formatam números.\n\nAqui você também vai resolver um mistério que confunde muita gente no começo: por que, às vezes, `"5" + 3` dá `"53"` em vez de `8`.',
                    },
                    {
                        type: "quote",
                        value: "O tipo `number` faz **contas** com os operadores `+ - * /`, além do **resto** `%` e da **potência** `**`. Quando um número chega em forma de **texto** (como o que vem de um formulário), você o converte com `Number()`, `parseInt()` ou `parseFloat()`. Se a conversão não faz sentido, o resultado é `NaN`. E o objeto `Math` mais o método `toFixed()` ajudam a arredondar, sortear e formatar.",
                    },
                    {
                        type: "text",
                        value: '## As operações\n\nAlém das quatro operações que você já conhece (soma `+`, subtração `-`, multiplicação `*` e divisão `/`), o JavaScript traz mais duas que valem a pena conhecer:\n\n- O **resto** da divisão, com o sinal `%` (também chamado de _módulo_): é o que **sobra** de uma divisão inteira. Por exemplo, `10 % 3` é `1`, porque 3 cabe 3 vezes em 10 (dá 9) e sobra 1. É o truque clássico para descobrir se um número é par (`n % 2` dá `0`) ou ímpar.\n- A **potência**, com o sinal `**`: `2 ** 3` significa "2 elevado a 3", ou seja, dois multiplicado por ele mesmo três vezes.',
                    },
                    {
                        type: "code",
                        value: "console.log(10 + 3); // no console aparece: 13\nconsole.log(10 - 3); // no console aparece: 7\nconsole.log(10 * 3); // no console aparece: 30\nconsole.log(10 / 3); // no console aparece: 3.3333333333333335\nconsole.log(10 % 3); // no console aparece: 1   (o resto da divisão)\nconsole.log(2 ** 3); // no console aparece: 8   (2 elevado a 3)",
                    },
                    {
                        type: "text",
                        value: "## A ordem das operações\n\nAssim como na matemática da escola, o JavaScript respeita uma **ordem de precedência**: a multiplicação e a divisão são feitas **antes** da soma e da subtração. Se você quiser forçar uma ordem diferente, use **parênteses**, que sempre têm prioridade. Na dúvida, coloque parênteses: além de garantir o resultado, deixam a conta mais clara para quem lê.",
                    },
                    {
                        type: "code",
                        value: "console.log(2 + 3 * 4);   // no console aparece: 14  (primeiro 3*4=12, depois +2)\nconsole.log((2 + 3) * 4); // no console aparece: 20  (o parêntese vem primeiro: 5*4)",
                    },
                    {
                        type: "text",
                        value: "## O texto que parece número\n\nAqui está uma das maiores fontes de confusão para quem começa. Quando um número chega **dentro de aspas**, ele **é uma string**, não um `number`, mesmo parecendo um número aos nossos olhos. E, como você viu na aula de strings, o `+` entre textos **concatena** em vez de somar. O resultado costuma surpreender:",
                    },
                    {
                        type: "code",
                        value: 'let a = "5"; // repare nas aspas: isto é um TEXTO, não um número\nlet b = 3;\n\nconsole.log(a + b);        // no console aparece: 53   (concatenou, virou texto!)\nconsole.log(typeof (a + b)); // no console aparece: string',
                    },
                    {
                        type: "text",
                        value: "Esse caso não é raro: **tudo o que o usuário digita num formulário chega como string**, mesmo que ele digite números. Se você tentar somar sem converter, vai colar os dígitos em vez de calcular. A solução é **transformar o texto em número** antes de fazer a conta.",
                    },
                    {
                        type: "text",
                        value: '## Convertendo texto em número\n\nO JavaScript oferece três ferramentas principais para converter texto em número, cada uma com um jeito:\n\n- **`Number(texto)`** é a mais rigorosa: converte se o texto **inteiro** for um número válido; caso contrário, falha.\n- **`parseInt(texto)`** extrai um número **inteiro** do começo do texto, ignorando o que vier depois (ótimo para coisas como `"15px"`).\n- **`parseFloat(texto)`** faz o mesmo, mas aceita a parte **decimal** (o _float_, número com ponto).',
                    },
                    {
                        type: "code",
                        value: 'let texto = "42";\nconsole.log(Number(texto));     // no console aparece: 42  (agora é number)\nconsole.log(Number(texto) + 8); // no console aparece: 50  (agora sim, somou!)\n\nconsole.log(parseInt("15px"));      // no console aparece: 15   (pegou só o inteiro do começo)\nconsole.log(parseFloat("3.14 kg")); // no console aparece: 3.14 (aceitou o decimal)\nconsole.log(parseInt("3.99"));      // no console aparece: 3    (parseInt corta os decimais)',
                    },
                    {
                        type: "text",
                        value: '## `NaN`: quando a conta não faz sentido\n\nE se você mandar converter um texto que **não** é número, tipo `"banana"`? O JavaScript não trava nem dá erro; em vez disso, ele devolve um valor especial: o **`NaN`**, sigla para _Not a Number_ ("não é um número"). O `NaN` é o jeito da linguagem dizer "tentei fazer uma conta numérica, mas isso aqui não deu certo".',
                    },
                    {
                        type: "code",
                        value: 'console.log(Number("banana")); // no console aparece: NaN\nconsole.log(10 / "oi");         // no console aparece: NaN\nconsole.log(0 / 0);             // no console aparece: NaN\n\nconsole.log(typeof NaN);        // no console aparece: number  (curioso, mas é do tipo number!)',
                    },
                    {
                        type: "text",
                        value: 'Sim, é estranho: o `NaN`, que significa "não é um número", tem tipo `number`. Encare-o como um number **defeituoso**, o sinal de que uma conta deu errado em algum ponto. Se você vir um `NaN` surgindo no seu programa, é quase sempre pista de que faltou uma conversão ou de que um valor não numérico se meteu no meio de uma conta.',
                    },
                    {
                        type: "text",
                        value: '## O objeto `Math`: arredondar e sortear\n\nO JavaScript traz uma coleção de ferramentas matemáticas prontas dentro de um objeto chamado `Math` (com **M maiúsculo**). Você o usa escrevendo `Math.` seguido do nome da função. Três das mais úteis servem para **arredondar**:\n\n- **`Math.round(n)`** arredonda para o inteiro **mais próximo** (o `.5` vai para cima).\n- **`Math.floor(n)`** arredonda **sempre para baixo** ("chão", _floor_).\n- **`Math.ceil(n)`** arredonda **sempre para cima** ("teto", _ceiling_).',
                    },
                    {
                        type: "code",
                        value: "console.log(Math.round(4.5)); // no console aparece: 5  (o mais próximo)\nconsole.log(Math.round(4.4)); // no console aparece: 4\nconsole.log(Math.floor(4.9)); // no console aparece: 4  (sempre para baixo)\nconsole.log(Math.ceil(4.1));  // no console aparece: 5  (sempre para cima)",
                    },
                    {
                        type: "text",
                        value: "Outra função muito querida é o **`Math.random()`**, que **sorteia** um número decimal entre 0 (inclusive) e 1 (exclusive). Sozinho ele parece pouco, mas combinado com multiplicação e `Math.floor` vira a base de qualquer **sorteio**: dados, cartas, números da sorte.",
                    },
                    {
                        type: "code",
                        value: "console.log(Math.random());\n// sorteia um decimal entre 0 e 1, por exemplo: 0.6273481923\n\n// Sorteio de 1 a 6, como um dado:\nlet dado = Math.floor(Math.random() * 6) + 1;\nconsole.log(dado); // aparece um número de 1 a 6, por exemplo: 4",
                    },
                    {
                        type: "text",
                        value: "## `toFixed`: definindo as casas decimais\n\nPor fim, um método que resolve um problema muito prático: mostrar valores com um número fixo de casas decimais (pense em **dinheiro**, sempre com duas). O `toFixed(casas)` faz isso. Só há um detalhe importantíssimo para não esquecer: ele **devolve um texto**, uma string, não um number. Faz sentido, já que o objetivo dele é a **exibição** do valor.",
                    },
                    {
                        type: "code",
                        value: "let preco = 3.14159;\n\nconsole.log(preco.toFixed(2)); // no console aparece: 3.14  (duas casas)\nconsole.log(preco.toFixed(0)); // no console aparece: 3     (nenhuma casa)\n\nconsole.log(typeof preco.toFixed(2)); // no console aparece: string  (virou texto!)",
                    },
                    {
                        type: "text",
                        value: "O `toFixed` também é o remédio para uma esquisitice famosa dos números decimais no computador. Por causa da forma como as máquinas guardam frações, algumas contas simples saem com uma sobrinha de casas decimais inesperada. Veja o clássico caso do `0.1 + 0.2` e como o `toFixed` arruma a aparência:",
                    },
                    {
                        type: "code",
                        value: "console.log(0.1 + 0.2);\n// no console aparece: 0.30000000000000004  (!!)\n\nconsole.log((0.1 + 0.2).toFixed(2));\n// no console aparece: 0.30  (agora sim, apresentável)",
                    },
                    {
                        type: "table",
                        value: '[["Ferramenta","Para que serve","Exemplo","Resultado"],["`Number(x)`","Texto para número (tudo ou nada)","`Number(\\"42\\")`","`42`"],["`parseInt(x)`","Texto para inteiro (pega o começo)","`parseInt(\\"15px\\")`","`15`"],["`parseFloat(x)`","Texto para decimal","`parseFloat(\\"3.14kg\\")`","`3.14`"],["`NaN`","\\"Não é um número\\" (conversão falhou)","`Number(\\"oi\\")`","`NaN`"],["`Math.round(x)`","Arredonda para o mais próximo","`Math.round(4.5)`","`5`"],["`Math.random()`","Sorteia um decimal de 0 a 1","`Math.random()`","`0.42...`"],["`n.toFixed(k)`","Fixa k casas decimais (vira texto)","`(3.14159).toFixed(2)`","`\\"3.14\\"`"]]',
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** o tipo `number` opera com `+ - * /`, mais o resto `%` e a potência `**`, respeitando a ordem (use parênteses na dúvida). Número que chega **entre aspas** é texto, e `+` o concatena, por isso converta com `Number`, `parseInt` ou `parseFloat` antes de calcular. Conversão sem sentido vira `NaN` ("não é número"). O objeto `Math` arredonda (`round`, `floor`, `ceil`) e sorteia (`random`), e o `toFixed` fixa casas decimais, sempre **devolvendo um texto**.',
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o resultado de `10 % 3`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`1`, o resto da divisão de 10 por 3.",
                                isCorrect: true,
                            },
                            {
                                text: "`3`, o quociente da divisão.",
                                isCorrect: false,
                            },
                            {
                                text: "`30`, porque `%` multiplica.",
                                isCorrect: false,
                            },
                            {
                                text: "`0`, porque a divisão é exata.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'O que `Number("42")` devolve?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "O número `42` (o texto foi convertido para `number`).",
                                isCorrect: true,
                            },
                            {
                                text: 'O texto `"42"`, sem mudar nada.',
                                isCorrect: false,
                            },
                            {
                                text: "`NaN`, porque não dá para converter.",
                                isCorrect: false,
                            },
                            {
                                text: "Um erro, porque `Number` não aceita textos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Com `let a = "5";` e `let b = 3;`, qual é a saída de `console.log(a + b)`?',
                        difficulty: "medio",
                        options: [
                            {
                                text: '`"53"`, porque `a` é um texto e o `+` concatena em vez de somar.',
                                isCorrect: true,
                            },
                            {
                                text: "`8`, porque o JavaScript soma automaticamente.",
                                isCorrect: false,
                            },
                            {
                                text: "`NaN`, porque não dá para juntar texto com número.",
                                isCorrect: false,
                            },
                            {
                                text: "`53`, mas como número (tipo `number`).",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'O que o JavaScript devolve ao rodar `Number("banana")`?',
                        difficulty: "medio",
                        options: [
                            {
                                text: '`NaN`, sigla para "Not a Number", porque `"banana"` não é um número válido.',
                                isCorrect: true,
                            },
                            {
                                text: "`0`, porque assume zero quando não sabe converter.",
                                isCorrect: false,
                            },
                            {
                                text: 'O texto `"banana"` de volta.',
                                isCorrect: false,
                            },
                            {
                                text: "Um erro que trava o programa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que `(3.14159).toFixed(2)` devolve, e de que tipo?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: '`"3.14"`, do tipo `string`, porque `toFixed` devolve um texto formatado.',
                                isCorrect: true,
                            },
                            {
                                text: "`3.14`, do tipo `number`.",
                                isCorrect: false,
                            },
                            {
                                text: "`3.1`, do tipo `number`.",
                                isCorrect: false,
                            },
                            {
                                text: "`3.142`, do tipo `string`.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Operadores e expressões",
        aulas: [
            {
                titulo: "Operadores aritméticos",
                blocks: [
                    {
                        type: "text",
                        value: "# Operadores aritméticos\n\nChegamos ao Módulo 3, e aqui o JavaScript vira uma calculadora nas suas mãos. Você já fez umas continhas lá no Módulo 1 (lembra do `3 * 40`?) e já sabe guardar valores em variáveis. Agora vamos organizar tudo isso: nesta aula você conhece os **operadores aritméticos**, os símbolos que fazem contas.\n\nA ideia é simples e reconfortante: se você sabe as quatro operações da escola, você já sabe 90% do que vem aqui. O resto são dois ou três símbolos novos e uma regrinha de ordem. Bora com calma.",
                    },
                    {
                        type: "quote",
                        value: "Um **operador aritmético** é um símbolo que faz uma conta entre dois valores, como o `+` que soma ou o `*` que multiplica. O JavaScript lê a conta, **calcula na hora** e devolve o resultado, exatamente como uma calculadora faria.",
                    },
                    {
                        type: "text",
                        value: '## As quatro operações de sempre\n\nVocê começa em casa: soma, subtração, multiplicação e divisão usam símbolos que você já viu no Módulo 1. Só vale reforçar dois detalhes do teclado: a multiplicação é o asterisco `*` (não o "x" da escola) e a divisão é a barra `/`.\n\n- `+` faz a **soma**\n- `-` faz a **subtração**\n- `*` faz a **multiplicação**\n- `/` faz a **divisão**',
                    },
                    {
                        type: "code",
                        value: "console.log(7 + 3);   // aparece: 10\nconsole.log(10 - 4);  // aparece: 6\nconsole.log(6 * 5);   // aparece: 30\nconsole.log(20 / 4);  // aparece: 5",
                    },
                    {
                        type: "text",
                        value: "## O resto da divisão: `%`\n\nAgora o primeiro símbolo novo: o `%`, chamado de **resto** (ou módulo). Ele não te dá a divisão inteira, ele devolve **o que sobra** dela. Pense em repartir 10 balas entre 3 crianças: cada uma fica com 3 balas e **sobra 1**. Esse 1 que sobrou é o resto.\n\nCuidado para não confundir: aqui o `%` **não** tem nada a ver com porcentagem. Em programação, ele é o resto da divisão.",
                    },
                    {
                        type: "code",
                        value: "console.log(10 % 3);  // aparece: 1   (10 dividido por 3 sobra 1)\nconsole.log(10 % 2);  // aparece: 0   (10 e par: divide certinho)\nconsole.log(9 % 2);   // aparece: 1   (9 e impar: sobra 1)\nconsole.log(20 % 5);  // aparece: 0   (20 dividido por 5 nao sobra nada)",
                    },
                    {
                        type: "text",
                        value: "## Para que serve o resto\n\nPode parecer um operador sem graça, mas o `%` é surpreendentemente útil. O uso mais comum é descobrir se um número é **par ou ímpar**: todo número par dividido por 2 tem resto `0`, e todo ímpar tem resto `1`. Guarde esse truque, ele aparece muito.",
                    },
                    {
                        type: "code",
                        value: "console.log(8 % 2);   // aparece: 0  ->  8 e par\nconsole.log(15 % 2);  // aparece: 1  ->  15 e impar\nconsole.log(100 % 2); // aparece: 0  ->  100 e par",
                    },
                    {
                        type: "text",
                        value: "## Potência: `**`\n\nO segundo símbolo novo é o `**` (dois asteriscos colados), que eleva um número a uma **potência**. Ou seja, multiplica o número por ele mesmo uma certa quantidade de vezes. `2 ** 3` é o mesmo que 2 vezes 2 vezes 2.",
                    },
                    {
                        type: "code",
                        value: "console.log(2 ** 3);   // aparece: 8     (2 * 2 * 2)\nconsole.log(5 ** 2);   // aparece: 25    (5 ao quadrado)\nconsole.log(10 ** 3);  // aparece: 1000  (10 * 10 * 10)\nconsole.log(9 ** 0.5); // aparece: 3     (a raiz quadrada de 9!)",
                    },
                    {
                        type: "table",
                        value: '[["Símbolo","Nome","Exemplo","Resultado"],["`+`","Soma","`4 + 2`","`6`"],["`-`","Subtração","`4 - 2`","`2`"],["`*`","Multiplicação","`4 * 2`","`8`"],["`/`","Divisão","`4 / 2`","`2`"],["`%`","Resto da divisão","`5 % 2`","`1`"],["`**`","Potência","`4 ** 2`","`16`"]]',
                    },
                    {
                        type: "text",
                        value: "## Somar 1 e subtrair 1: `++` e `--`\n\nDuas ações são tão comuns que ganharam um atalho próprio: somar 1 e subtrair 1. Pense num contador de pontos de um jogo, ou nas vidas que você perde. Para isso existem o **incremento** `++` (soma 1) e o **decremento** `--` (subtrai 1).\n\nEles funcionam sobre uma variável: `pontos++` pega o valor guardado em `pontos` e o aumenta em 1.",
                    },
                    {
                        type: "code",
                        value: "let pontos = 10;\npontos++;             // o mesmo que: pontos = pontos + 1\nconsole.log(pontos);  // aparece: 11\n\nlet vidas = 3;\nvidas--;              // o mesmo que: vidas = vidas - 1\nconsole.log(vidas);   // aparece: 2",
                    },
                    {
                        type: "text",
                        value: "## Precedência: quem faz a conta primeiro\n\nQuando uma conta mistura vários operadores, o JavaScript não resolve da esquerda para a direita de qualquer jeito: ele segue a **mesma ordem da matemática**. Multiplicação e divisão vêm **antes** de soma e subtração. A essa ordem damos o nome de **precedência**.\n\nVeja: em `2 + 3 * 4`, o JavaScript faz primeiro o `3 * 4` (que dá 12) e só depois soma o 2, chegando a **14**. Não é 20.",
                    },
                    {
                        type: "code",
                        value: "console.log(2 + 3 * 4);  // aparece: 14  (primeiro 3*4=12, depois +2)\nconsole.log(10 - 4 / 2); // aparece: 8   (primeiro 4/2=2, depois 10-2)\nconsole.log(2 * 3 + 4);  // aparece: 10  (primeiro 2*3=6, depois +4)",
                    },
                    {
                        type: "text",
                        value: "## Parênteses mandam mais\n\nE se você quiser somar primeiro? É só usar **parênteses**. Assim como na matemática, o que está dentro dos parênteses é calculado **antes de tudo**. Eles são a forma de você assumir o controle da ordem, e um bônus: deixam a conta mais clara para quem lê.",
                    },
                    {
                        type: "code",
                        value: "console.log((2 + 3) * 4);   // aparece: 20  (agora soma primeiro: 5*4)\nconsole.log(2 + 3 * 4);     // aparece: 14  (sem parenteses: multiplica primeiro)\nconsole.log((10 - 4) / 2);  // aparece: 3   (primeiro 10-4=6, depois /2)",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** os operadores aritméticos fazem contas. Você já conhecia `+`, `-`, `*` e `/`; agora somou o resto `%` (o que sobra de uma divisão, ótimo para achar par e ímpar) e a potência `**`. Os atalhos `++` e `--` somam e subtraem 1. E, na hora de calcular, o JavaScript respeita a **precedência** (multiplicação e divisão antes de soma e subtração), que você controla com **parênteses**.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual símbolo faz a multiplicação em JavaScript?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`*` (o asterisco)",
                                isCorrect: true,
                            },
                            {
                                text: "`x` (a letra xis)",
                                isCorrect: false,
                            },
                            {
                                text: "`%` (o sinal de porcentagem)",
                                isCorrect: false,
                            },
                            {
                                text: "`/` (a barra)",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quanto vale `10 % 3`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`1`, que é o resto da divisão de 10 por 3",
                                isCorrect: true,
                            },
                            {
                                text: "`3`, que é o resultado inteiro da divisão",
                                isCorrect: false,
                            },
                            {
                                text: "`0`, porque 10 divide certinho por 3",
                                isCorrect: false,
                            },
                            {
                                text: "`3.33`, o valor exato da divisão",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que faz o operador `**`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Eleva um número a uma potência (por exemplo, `2 ** 3` é 8)",
                                isCorrect: true,
                            },
                            {
                                text: "Calcula o resto da divisão entre dois números",
                                isCorrect: false,
                            },
                            {
                                text: "Multiplica dois números diferentes",
                                isCorrect: false,
                            },
                            {
                                text: "Soma 1 ao valor de uma variável",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Depois de `let n = 5; n++;`, quanto vale `n`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`6`, porque `++` soma 1 ao valor",
                                isCorrect: true,
                            },
                            {
                                text: "`5`, porque `++` não muda nada",
                                isCorrect: false,
                            },
                            {
                                text: "`4`, porque `++` subtrai 1",
                                isCorrect: false,
                            },
                            {
                                text: "`1`, porque `++` zera e soma 1",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o resultado de `2 + 3 * 4`, lembrando a ordem das operações?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`14`, porque a multiplicação (`3 * 4`) acontece antes da soma",
                                isCorrect: true,
                            },
                            {
                                text: "`20`, porque o JavaScript soma `2 + 3` primeiro",
                                isCorrect: false,
                            },
                            {
                                text: "`24`, multiplicando tudo de uma vez",
                                isCorrect: false,
                            },
                            {
                                text: "`9`, somando os três números",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Atribuição e comparação",
                blocks: [
                    {
                        type: "text",
                        value: "# Atribuição e comparação\n\nNesta aula a gente separa duas coisas que, à primeira vista, se confundem: **guardar** um valor e **comparar** dois valores. São duas famílias de operadores com papéis bem diferentes, e entender a diferença agora vai te poupar de um monte de dor de cabeça mais para a frente.\n\nDe um lado, a **atribuição**, que guarda um valor numa variável. Do outro, a **comparação**, que faz uma pergunta e responde com `true` (verdadeiro) ou `false` (falso). Vamos aos dois.",
                    },
                    {
                        type: "quote",
                        value: "O sinal `=` **atribui**: ele guarda o valor da direita dentro da variável da esquerda. Já o `===` **compara**: ele pergunta se dois valores são iguais e responde `true` ou `false`. Apesar de parecidos na aparência, um **guarda** e o outro **pergunta**, nunca confunda os dois.",
                    },
                    {
                        type: "text",
                        value: '## O operador de atribuição: `=`\n\nVocê já usou o `=` no módulo de variáveis, mas vale reforçar uma ideia importante: em programação, o `=` **não** significa "é igual a", como na matemática. Ele significa **"receba"**. A conta acontece do lado direito, e o resultado é guardado na variável do lado esquerdo.\n\nOu seja, `idade = 25` se lê como "idade **recebe** 25", e não "idade é igual a 25". Essa direção (da direita para a esquerda) é a chave para entender tudo o que vem a seguir.',
                    },
                    {
                        type: "code",
                        value: "let idade = 25;\nconsole.log(idade);  // aparece: 25\n\nlet total = 10 + 5;  // primeiro calcula 15, depois guarda em total\nconsole.log(total);  // aparece: 15\n\nidade = 26;          // guarda um novo valor, por cima do antigo\nconsole.log(idade);  // aparece: 26",
                    },
                    {
                        type: "text",
                        value: "## Os atalhos: `+=`, `-=`, `*=`, `/=`\n\nUma cena muito comum é pegar o valor que já está numa variável e mexer nele: somar mais um tanto, tirar um pouco. Escrever `saldo = saldo + 50` funciona, mas é longo. Para isso existem os **atalhos de atribuição**, que juntam uma conta com o `=`.\n\nO `saldo += 50` faz exatamente o mesmo que `saldo = saldo + 50`: pega o valor atual, soma 50 e guarda o resultado de volta. E existe um atalho desses para cada operação.",
                    },
                    {
                        type: "code",
                        value: "let saldo = 100;\nsaldo += 50;         // o mesmo que: saldo = saldo + 50\nconsole.log(saldo);  // aparece: 150\n\nsaldo -= 30;         // o mesmo que: saldo = saldo - 30\nconsole.log(saldo);  // aparece: 120\n\nsaldo *= 2;          // o mesmo que: saldo = saldo * 2\nconsole.log(saldo);  // aparece: 240",
                    },
                    {
                        type: "table",
                        value: '[["Atalho","Equivale a","Exemplo (partindo de x = 10)","x fica"],["`+=`","`x = x + ...`","`x += 5`","`15`"],["`-=`","`x = x - ...`","`x -= 5`","`5`"],["`*=`","`x = x * ...`","`x *= 5`","`50`"],["`/=`","`x = x / ...`","`x /= 5`","`2`"],["`%=`","`x = x % ...`","`x %= 5`","`0`"]]',
                    },
                    {
                        type: "text",
                        value: "## Comparação: perguntas de sim ou não\n\nAgora a outra família. Os **operadores de comparação** pegam dois valores e fazem uma pergunta cuja resposta só pode ser `true` (verdadeiro) ou `false` (falso). Esse tipo de valor, `true`/`false`, tem até nome: chama-se **booleano**, e vai ser o coração das decisões que você vai programar mais adiante.\n\nOs operadores de maior e menor são iguaizinhos aos da matemática:\n\n- `>` maior que\n- `<` menor que\n- `>=` maior ou igual a\n- `<=` menor ou igual a",
                    },
                    {
                        type: "code",
                        value: "console.log(10 > 5);   // aparece: true   (10 e maior que 5)\nconsole.log(3 > 8);    // aparece: false  (3 nao e maior que 8)\nconsole.log(7 <= 7);   // aparece: true   (7 e menor ou igual a 7)\nconsole.log(4 >= 10);  // aparece: false  (4 nao e maior nem igual a 10)",
                    },
                    {
                        type: "text",
                        value: "## Igual e diferente: `===` e `!==`\n\nPara perguntar se dois valores são **iguais**, a gente usa **três** sinais de igual: `===`. E para perguntar se são **diferentes**, usa `!==`. Repare que o de igualdade tem três sinais, não um. Aquele `=` sozinho, você lembra, é para **guardar** valores, não para comparar.",
                    },
                    {
                        type: "code",
                        value: 'console.log(5 === 5);       // aparece: true   (5 e igual a 5)\nconsole.log(5 === 8);       // aparece: false  (5 nao e igual a 8)\nconsole.log(5 !== 8);       // aparece: true   (5 e diferente de 8, verdade)\nconsole.log("oi" === "oi"); // aparece: true   (textos iguais)',
                    },
                    {
                        type: "text",
                        value: '## A pegadinha mais famosa: `===` contra `==`\n\nAqui mora um dos assuntos mais importantes de toda esta trilha. Além do `===` (três sinais), existe no JavaScript o `==` (dois sinais). Os dois comparam igualdade, mas de um jeito diferente, e essa diferença já causou bugs no mundo inteiro.\n\n- O `===` compara **valor e tipo**. Ele só diz `true` se as duas coisas forem realmente iguais, inclusive do mesmo tipo. É o chamado **igual estrito**.\n- O `==` compara de um jeito **frouxo**: antes de comparar, ele **converte os tipos** por baixo dos panos. Por isso ele acha que o texto `"5"` e o número `5` são iguais.',
                    },
                    {
                        type: "code",
                        value: 'console.log(5 === 5);    // aparece: true   (numero igual a numero: ok)\nconsole.log("5" === 5);  // aparece: false  (o texto "5" NAO e o numero 5)\n\nconsole.log("5" == 5);   // aparece: true   (o == converte e engana!)\nconsole.log(0 == "");    // aparece: true   (mais uma confusao do ==)',
                    },
                    {
                        type: "quote",
                        value: "Use **sempre** o `===` (e o `!==`). Eles comparam **valor e tipo**, sem conversões escondidas, então o resultado é sempre o que você espera. O `==` faz conversões automáticas que geram surpresas, então deixe-o de lado. Essa é uma das regras de ouro do JavaScript: na dúvida, **três sinais**.",
                    },
                    {
                        type: "table",
                        value: '[["Comparação","Com `===` (estrito)","Com `==` (frouxo)"],["número 5 com número 5","`true`","`true`"],["texto 5 com número 5","`false`","`true`"],["número 0 com texto vazio","`false`","`true`"],["`true` com número 1","`false`","`true`"]]',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** o `=` **atribui** (guarda o valor da direita na variável da esquerda), e tem atalhos práticos como `+=` e `-=`. Já os operadores de **comparação** (`>`, `<`, `>=`, `<=`, `===`, `!==`) fazem perguntas e respondem `true` ou `false`. O ponto mais importante da aula: prefira **sempre** o `===` ao `==`, porque o `===` compara valor e tipo sem conversões escondidas, evitando as surpresas clássicas do JavaScript.",
                    },
                ],
                questions: [
                    {
                        statement: "Em JavaScript, o que faz o operador `=`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Guarda (atribui) o valor da direita na variável da esquerda",
                                isCorrect: true,
                            },
                            {
                                text: "Compara se dois valores são iguais e responde true ou false",
                                isCorrect: false,
                            },
                            {
                                text: "Mostra sempre o valor true na tela",
                                isCorrect: false,
                            },
                            {
                                text: "Soma dois números, como o `+`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "`saldo += 20` é a mesma coisa que qual linha?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`saldo = saldo + 20`",
                                isCorrect: true,
                            },
                            {
                                text: "`saldo = 20`",
                                isCorrect: false,
                            },
                            {
                                text: "`saldo = saldo * 20`",
                                isCorrect: false,
                            },
                            {
                                text: "`saldo = 20 - saldo`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'Qual é o resultado de `"5" === 5`?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "`false`, porque um valor é texto e o outro é número (o `===` compara também o tipo)",
                                isCorrect: true,
                            },
                            {
                                text: "`true`, porque os dois representam o cinco",
                                isCorrect: false,
                            },
                            {
                                text: "Um erro, porque não dá para comparar texto com número",
                                isCorrect: false,
                            },
                            {
                                text: "`5`, o valor em comum entre os dois",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que devemos preferir `===` a `==`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque o `===` compara valor e tipo, sem conversões escondidas que causam surpresas",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o `==` não funciona em navegadores modernos",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o `===` é mais rápido de digitar",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o `==` só serve para comparar números",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre `x = 5` e `x === 5`?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`x = 5` guarda o valor 5 na variável x; `x === 5` pergunta se x é igual a 5 e responde `true` ou `false`",
                                isCorrect: true,
                            },
                            {
                                text: "Não há diferença: os dois comparam x com 5",
                                isCorrect: false,
                            },
                            {
                                text: "`x = 5` compara e `x === 5` guarda o valor",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois guardam o valor 5 dentro de x",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Operadores lógicos",
                blocks: [
                    {
                        type: "text",
                        value: '# Operadores lógicos\n\nNa aula passada você aprendeu a fazer perguntas que respondem `true` ou `false`, como `idade >= 18`. Agora vem o passo natural: e se você precisar juntar **duas** perguntas numa só? Por exemplo, para entrar numa festa talvez seja preciso ser maior de idade **E** ter ingresso. É disso que tratam os **operadores lógicos**: eles combinam valores `true` e `false` para chegar a uma resposta final.\n\nSão três: o **E** (`&&`), o **OU** (`||`) e o **NÃO** (`!`). Com eles você monta condições mais espertas, do tipo "isto e aquilo", "isto ou aquilo", "o contrário disto".',
                    },
                    {
                        type: "quote",
                        value: "Os **operadores lógicos** combinam valores booleanos (`true`/`false`). O **E** (`&&`) só dá `true` quando as **duas** partes são verdadeiras. O **OU** (`||`) dá `true` quando **pelo menos uma** é verdadeira. E o **NÃO** (`!`) simplesmente **inverte**: transforma `true` em `false` e vice-versa.",
                    },
                    {
                        type: "text",
                        value: '## O E lógico: `&&`\n\nO operador `&&` (dois "e comercial" colados) representa o **E**. Ele exige que as **duas** condições sejam verdadeiras ao mesmo tempo para o resultado ser `true`. Se qualquer uma das partes for `false`, o resultado inteiro é `false`.\n\nPense na porta da festa: só entra quem é maior de idade **E** tem ingresso. Faltou uma das duas, não entra.',
                    },
                    {
                        type: "code",
                        value: "console.log(true && true);    // aparece: true   (as duas verdadeiras)\nconsole.log(true && false);   // aparece: false  (uma e falsa: ja chega)\nconsole.log(false && true);   // aparece: false  (a outra e falsa)\nconsole.log(false && false);  // aparece: false  (nenhuma verdadeira)\n\nconsole.log(10 > 5 && 3 > 1); // aparece: true   (10>5 e 3>1, as duas certas)",
                    },
                    {
                        type: "table",
                        value: '[["A","B","A `&&` B"],["`true`","`true`","`true`"],["`true`","`false`","`false`"],["`false`","`true`","`false`"],["`false`","`false`","`false`"]]',
                    },
                    {
                        type: "text",
                        value: "## O OU lógico: `||`\n\nO operador `||` (duas barras verticais) representa o **OU**. Ele é mais generoso: **basta uma** das condições ser verdadeira para o resultado ser `true`. Só dá `false` quando as duas partes são falsas.\n\nUm exemplo do dia a dia: você ganha desconto se for estudante **OU** se for a sua primeira compra. Qualquer uma das duas já garante o desconto.",
                    },
                    {
                        type: "code",
                        value: "console.log(true || true);     // aparece: true   (as duas verdadeiras)\nconsole.log(true || false);    // aparece: true   (basta uma verdadeira)\nconsole.log(false || true);    // aparece: true   (a outra e verdadeira)\nconsole.log(false || false);   // aparece: false  (nenhuma verdadeira)\n\nconsole.log(2 > 9 || 5 === 5); // aparece: true   (2>9 e falso, mas 5===5 e verdade)",
                    },
                    {
                        type: "table",
                        value: '[["A","B","A `||` B"],["`true`","`true`","`true`"],["`true`","`false`","`true`"],["`false`","`true`","`true`"],["`false`","`false`","`false`"]]',
                    },
                    {
                        type: "text",
                        value: '## O NÃO lógico: `!`\n\nO operador `!` (ponto de exclamação) representa o **NÃO**, e é o mais simples de todos: ele **inverte** o valor. O que era `true` vira `false`, e o que era `false` vira `true`. Ele vem sempre **antes** do valor, colado nele.\n\nÉ útil para dizer "o contrário disto". Por exemplo, se `logado` guarda se a pessoa está logada, então `!logado` significa "não está logada".',
                    },
                    {
                        type: "code",
                        value: "console.log(!true);      // aparece: false  (inverteu)\nconsole.log(!false);     // aparece: true   (inverteu)\n\nconsole.log(!(10 > 5));  // aparece: false  (10>5 e true, o ! vira false)\nconsole.log(!(2 > 9));   // aparece: true   (2>9 e false, o ! vira true)",
                    },
                    {
                        type: "text",
                        value: "## Curto-circuito: o JavaScript é preguiçoso (no bom sentido)\n\nAqui vai um detalhe esperto. O JavaScript lê as condições da esquerda para a direita e **para assim que já sabe a resposta**. Isso se chama **curto-circuito**.\n\n- No `&&`, se a primeira parte já é `false`, o resultado será `false` de qualquer jeito, então o JavaScript nem olha a segunda parte.\n- No `||`, se a primeira parte já é `true`, o resultado será `true` de qualquer jeito, então ele também não perde tempo com a segunda.\n\nNão é só curiosidade: isso ajuda o programa a evitar trabalho desnecessário e, mais adiante, a se proteger de erros.",
                    },
                    {
                        type: "code",
                        value: "let temIngresso = false;\nlet idade = 20;\n\n// Como temIngresso ja e false, o E inteiro da false.\n// O JavaScript nem chega a checar a idade.\nconsole.log(temIngresso && idade >= 18); // aparece: false\n\nlet ehVip = true;\n// Como ehVip ja e true, o OU inteiro da true, sem checar o resto.\nconsole.log(ehVip || idade >= 65);        // aparece: true",
                    },
                    {
                        type: "text",
                        value: '## O operador de coalescência nula: `??`\n\nPara fechar, um operador moderno e muito útil: o `??`, chamado de **coalescência nula**. Ele serve para dar um **valor padrão** quando algo está faltando. A regra é: `a ?? b` devolve `a`, a menos que `a` seja `null` ou `undefined` (os dois jeitos do JavaScript dizer "não tem valor"); nesse caso, devolve `b`.\n\nEle parece com o `||`, mas tem uma diferença importante. O `||` troca por padrão **qualquer** valor considerado "vazio", incluindo o número `0` e o texto vazio. Já o `??` é mais preciso: só troca quando **realmente não há valor** (`null` ou `undefined`). Por isso ele é a escolha certa quando o `0` é um valor válido.',
                    },
                    {
                        type: "code",
                        value: 'let apelido = null;\nconsole.log(apelido ?? "visitante"); // aparece: visitante (apelido nao tem valor)\n\nlet nome = "Ana";\nconsole.log(nome ?? "visitante");    // aparece: Ana (nome tem valor, mantem)\n\n// A diferenca crucial para o ||:\nconsole.log(0 || 10);  // aparece: 10  (o || acha que 0 e "vazio" e troca)\nconsole.log(0 ?? 10);  // aparece: 0   (o ?? respeita o 0 como valor valido)',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** os operadores lógicos combinam `true` e `false`. O **E** (`&&`) exige as duas partes verdadeiras; o **OU** (`||`) se contenta com uma; o **NÃO** (`!`) inverte o valor. Graças ao **curto-circuito**, o JavaScript para de avaliar assim que já sabe a resposta. E o `??` (coalescência nula) entrega um valor padrão só quando o original é `null` ou `undefined`, o que o torna mais seguro que o `||` quando o `0` é um valor legítimo.",
                    },
                ],
                questions: [
                    {
                        statement: "O operador `&&` (E) devolve `true` em qual situação?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Quando as duas condições são verdadeiras",
                                isCorrect: true,
                            },
                            {
                                text: "Quando pelo menos uma condição é verdadeira",
                                isCorrect: false,
                            },
                            {
                                text: "Quando as duas condições são falsas",
                                isCorrect: false,
                            },
                            {
                                text: "Quando qualquer condição é falsa",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o resultado de `!true`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`false`, porque o `!` inverte o valor",
                                isCorrect: true,
                            },
                            {
                                text: "`true`, porque o `!` não muda nada",
                                isCorrect: false,
                            },
                            {
                                text: "`0`, porque `!` transforma em número",
                                isCorrect: false,
                            },
                            {
                                text: "Um erro, porque `!` não existe",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O operador `||` (OU) devolve `false` somente quando:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "As duas partes são falsas",
                                isCorrect: true,
                            },
                            {
                                text: "Pelo menos uma parte é falsa",
                                isCorrect: false,
                            },
                            {
                                text: "As duas partes são verdadeiras",
                                isCorrect: false,
                            },
                            {
                                text: "A primeira parte é verdadeira",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o resultado de `true || false`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`true`, porque no OU basta uma parte ser verdadeira",
                                isCorrect: true,
                            },
                            {
                                text: "`false`, porque uma das partes é falsa",
                                isCorrect: false,
                            },
                            {
                                text: "`true && false`, sem calcular",
                                isCorrect: false,
                            },
                            {
                                text: "Um erro de sintaxe",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre `0 || 10` e `0 ?? 10`?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: '`0 || 10` dá `10` (o `||` troca o 0 por achá-lo "vazio"); `0 ?? 10` dá `0` (o `??` só troca `null` ou `undefined`)',
                                isCorrect: true,
                            },
                            {
                                text: "Os dois dão `10`",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois dão `0`",
                                isCorrect: false,
                            },
                            {
                                text: "`0 || 10` dá `0` e `0 ?? 10` dá `10`",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Conversão e coerção de tipos",
                blocks: [
                    {
                        type: "text",
                        value: '# Conversão e coerção de tipos\n\nVocê já sabe que o JavaScript trabalha com **tipos** diferentes de valores: número (como `42`), texto ou string (como `"Ana"`) e booleano (`true`/`false`). Nesta aula, a última do módulo, você vai aprender a **transformar** um tipo em outro, e a entender uma mania que o JavaScript tem de fazer essas transformações **sozinho**, às vezes te pegando de surpresa.\n\nSão duas situações. Quando é **você** quem manda mudar o tipo, chamamos de **conversão explícita**. Quando é o **JavaScript** que muda por conta própria no meio de uma conta, chamamos de **coerção implícita**. Vamos conhecer as duas e, principalmente, aprender a não cair nas pegadinhas.',
                    },
                    {
                        type: "quote",
                        value: "**Conversão explícita** é quando **VOCÊ** pede a mudança de tipo, com ferramentas como `Number()`, `String()` e `Boolean()`. **Coerção implícita** é quando o **JAVASCRIPT** muda o tipo sozinho para conseguir fazer uma operação, o que pode gerar resultados surpreendentes. A boa notícia: entendendo as regras, a surpresa acaba.",
                    },
                    {
                        type: "text",
                        value: '## Virar número: `Number()`\n\nO `Number()` pega um valor e tenta transformá-lo num **número**. O caso mais comum é converter um texto que contém dígitos, como `"42"`, no número `42`. Isso é pão com manteiga no dia a dia, porque tudo o que o usuário digita num formulário chega como **texto**, mesmo quando é para ser um número.\n\nSe o texto não parecer um número de jeito nenhum, o `Number()` devolve um valor especial chamado `NaN` (do inglês _Not a Number_, "não é um número"). É o jeito do JavaScript dizer "não consegui converter isto".',
                    },
                    {
                        type: "code",
                        value: 'console.log(Number("42"));     // aparece: 42    (agora e numero, da para calcular)\nconsole.log(Number("3.14"));   // aparece: 3.14\nconsole.log(Number("10") + 5); // aparece: 15    (converteu e somou de verdade)\n\nconsole.log(Number("abc"));    // aparece: NaN   (nao da para virar numero)',
                    },
                    {
                        type: "text",
                        value: '## Virar texto: `String()`\n\nO caminho contrário é o `String()`, que transforma qualquer valor em **texto**. Um número como `42` vira o texto `"42"`. Parece pouca coisa, mas é muito útil na hora de montar mensagens juntando números com palavras.',
                    },
                    {
                        type: "code",
                        value: 'console.log(String(42));     // aparece: 42   (mas agora e o texto "42")\nconsole.log(String(true));   // aparece: true (o texto "true")\nconsole.log(String(3.14));   // aparece: 3.14\n\n// Um jeito de perceber a diferenca: texto nao faz conta.\nconsole.log(String(10) + 5); // aparece: 105  (juntou textos, nao somou!)',
                    },
                    {
                        type: "text",
                        value: '## Virar booleano: `Boolean()`\n\nO `Boolean()` transforma um valor em `true` ou `false`. Mas como saber o que vira o quê? O JavaScript tem uma listinha curta de valores considerados "vazios" ou "sem conteúdo", que viram `false`. A esses damos o apelido de **falsy**. Todo o resto vira `true`, e chamamos de **truthy**.\n\nOs valores **falsy** (que viram `false`) são poucos e vale a pena conhecê-los: o número `0`, o texto vazio, o `null`, o `undefined`, o `NaN` e o próprio `false`. Qualquer outra coisa, incluindo qualquer texto com conteúdo e qualquer número diferente de zero, é **truthy**.',
                    },
                    {
                        type: "code",
                        value: 'console.log(Boolean(0));     // aparece: false  (zero e "vazio")\nconsole.log(Boolean(""));    // aparece: false  (texto vazio)\nconsole.log(Boolean("oi"));  // aparece: true   (texto com conteudo)\nconsole.log(Boolean(42));    // aparece: true   (numero diferente de zero)\nconsole.log(Boolean(-1));    // aparece: true   (negativo tambem conta!)',
                    },
                    {
                        type: "table",
                        value: '[["Valor","Vira..."],["`0`","`false` (falsy)"],["texto vazio","`false` (falsy)"],["`null`","`false` (falsy)"],["`undefined`","`false` (falsy)"],["`NaN`","`false` (falsy)"],["`false`","`false` (falsy)"],["qualquer texto com conteúdo","`true` (truthy)"],["qualquer número diferente de zero","`true` (truthy)"]]',
                    },
                    {
                        type: "text",
                        value: '## Coerção implícita: quando o JavaScript decide por você\n\nAté aqui foi você quem pediu a conversão. Agora vem a parte que confunde todo iniciante: às vezes o JavaScript converte os tipos **sozinho**, sem você pedir, para conseguir fazer uma operação. Isso é a **coerção implícita**.\n\nO grande protagonista dessa história é o sinal `+`, porque ele tem **dois empregos**. Entre números, ele **soma**. Mas quando um dos lados é texto, ele muda de função e passa a **juntar textos** (uma operação chamada **concatenação**). Ou seja, o mesmo `+` ora soma, ora "gruda".',
                    },
                    {
                        type: "code",
                        value: 'console.log(5 + 1);       // aparece: 6    (numero + numero: soma)\nconsole.log("5" + 1);     // aparece: 51   (texto + numero: o 1 vira "1" e gruda)\nconsole.log("Ana" + "!"); // aparece: Ana! (texto + texto: junta os dois)\nconsole.log(1 + 2 + "3"); // aparece: 33   (soma 1+2=3, depois gruda o "3")',
                    },
                    {
                        type: "text",
                        value: '## O `+` é a exceção; os outros forçam número\n\nAqui está a chave para entender as pegadinhas: **só o `+`** tem essa dupla personalidade. Os outros operadores aritméticos (`-`, `*`, `/`, `%`) não sabem juntar textos, então eles fazem o contrário: **convertem o texto em número** para conseguir calcular.\n\nPor isso `"5" - 1` dá `4` (o texto virou número), enquanto `"5" + 1` dá `"51"` (o número virou texto). Duas contas parecidíssimas, dois caminhos opostos. É essa assimetria que assusta quem está começando.',
                    },
                    {
                        type: "code",
                        value: 'console.log("5" + 1);  // aparece: 51  (o + junta textos: "5" e "1")\nconsole.log("5" - 1);  // aparece: 4   (o - forca numero: 5 - 1)\nconsole.log("5" * 2);  // aparece: 10  (o * forca numero: 5 * 2)\nconsole.log("10" / 2); // aparece: 5   (o / forca numero: 10 / 2)',
                    },
                    {
                        type: "table",
                        value: '[["Conta","O que acontece","Resultado"],["5 (texto) `+` 1","o `+` junta textos","51 (texto)"],["5 (texto) `-` 1","o `-` força número","4 (número)"],["5 (texto) `*` 2","o `*` força número","10 (número)"],["5 (número) `+` 5 (texto)","o `+` junta textos","55 (texto)"]]',
                    },
                    {
                        type: "text",
                        value: '## Como evitar as pegadinhas\n\nAgora a parte boa: com três hábitos simples, essas surpresas praticamente somem da sua vida.\n\n- **Converta você mesmo**, na hora certa. Se um valor chega como texto e você quer somar, passe pelo `Number()` antes: `Number("5") + 1` dá `6`, sem sustos.\n- **Não confie no `+`** para somar quando um dos lados pode ser texto. Deixe claro o que você quer.\n- **Compare com `===`** (lembra da aula passada?). Ele não faz conversões escondidas, então nunca vai te dizer que `"5"` é igual a `5`.\n\nRepare que essas pegadinhas e a regra do `===` são a mesma história por trás: o JavaScript convertendo tipos sozinho. Quem entende a coerção, entende os dois de uma vez.',
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** a **conversão explícita** é você quem manda, com `Number()` (vira número, ou `NaN` se não der), `String()` (vira texto) e `Boolean()` (vira `true`/`false`, seguindo a lista de valores **falsy**). A **coerção implícita** é o JavaScript convertendo sozinho: o `+` junta textos quando um lado é texto (por isso `"5" + 1` dá `"51"`), enquanto `-`, `*` e `/` forçam número (por isso `"5" - 1` dá `4`). Para não cair nas pegadinhas: converta na mão com `Number()` e compare sempre com `===`.',
                    },
                ],
                questions: [
                    {
                        statement: 'O que o `Number("42")` faz?',
                        difficulty: "facil",
                        options: [
                            {
                                text: 'Transforma o texto "42" no número 42',
                                isCorrect: true,
                            },
                            {
                                text: 'Transforma o número 42 no texto "42"',
                                isCorrect: false,
                            },
                            {
                                text: "Verifica se 42 é um número par",
                                isCorrect: false,
                            },
                            {
                                text: "Soma 42 com ele mesmo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'Qual é o resultado de `"5" + 1`?',
                        difficulty: "facil",
                        options: [
                            {
                                text: '`"51"`, porque o `+` junta os textos (o número 1 vira "1")',
                                isCorrect: true,
                            },
                            {
                                text: "`6`, porque o `+` sempre soma",
                                isCorrect: false,
                            },
                            {
                                text: "`4`, subtraindo 1 de 5",
                                isCorrect: false,
                            },
                            {
                                text: "`NaN`, porque não dá para somar texto com número",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'Por que `"5" - 1` dá `4`, mas `"5" + 1` dá `"51"`?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque o `-` força a conversão para número, enquanto o `+` junta textos quando um dos lados é texto",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o `-` está errado e deveria dar um erro",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o JavaScript soma no primeiro caso e subtrai no segundo",
                                isCorrect: false,
                            },
                            {
                                text: "Porque textos nunca podem ser subtraídos, então vira 4 por acaso",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual destes valores é falsy (vira `false` num `Boolean()`)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O número `0`",
                                isCorrect: true,
                            },
                            {
                                text: 'O texto "oi"',
                                isCorrect: false,
                            },
                            {
                                text: "O número `-1`",
                                isCorrect: false,
                            },
                            {
                                text: "O número `42`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Você tem `let entrada = "10"` (um texto vindo de um formulário) e quer somar 5 para obter 15. Qual é a forma segura?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`Number(entrada) + 5`, convertendo o texto para número antes de somar",
                                isCorrect: true,
                            },
                            {
                                text: "`entrada + 5`, que já resulta em 15",
                                isCorrect: false,
                            },
                            {
                                text: "`entrada - 5`, porque o menos soma os textos",
                                isCorrect: false,
                            },
                            {
                                text: "`String(entrada) + 5`, para garantir que vira número",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Condicionais",
        aulas: [
            {
                titulo: "Tomando decisões com if/else",
                blocks: [
                    {
                        type: "text",
                        value: '# Tomando decisões com if/else\n\nBem-vindo ao Módulo 4! Até aqui os seus programas rodavam sempre da mesma forma: o JavaScript lia as linhas de cima para baixo e cumpria todas, uma por uma, sem escolher nada. A partir de agora isso muda. Neste módulo o seu código vai aprender a **tomar decisões**: fazer uma coisa numa situação e outra coisa em outra situação.\n\nPense em como você decide as coisas no dia a dia. Ao sair de casa, você olha o céu: **se** está chovendo, leva o guarda-chuva; **senão**, deixa em casa. Essa palavrinha "se" é o coração da aula de hoje. Em JavaScript, quem toma decisões é o `if` (que é justamente o "se" em inglês).',
                    },
                    {
                        type: "quote",
                        value: "O `if` executa um bloco de código **apenas se** uma condição for verdadeira. A **condição** vai entre **parênteses** `( )`, e o **bloco** a ser executado vai entre **chaves** `{ }`. Quando a condição é falsa, o JavaScript simplesmente **pula** o bloco, como se ele não existisse.",
                    },
                    {
                        type: "text",
                        value: '## O programa que decide\n\nAté agora você viu o JavaScript **calcular** (`3 * 40`) e **comparar** (`10 > 5` responde `true`). Aquela resposta `true` ou `false` de uma comparação parecia só uma curiosidade, mas é ela que dá poder ao `if`. A ideia é simples: o `if` olha para uma condição e, **se** ela for verdadeira (`true`), executa um trecho de código; se for falsa (`false`), não executa.\n\nÉ a mesma lógica de uma decisão da vida real:\n\n- **Se** a conta do restaurante passou de 100 reais, divida em duas vezes.\n- **Se** o aluno tirou nota 7 ou mais, ele foi aprovado.\n- **Se** o campo de e-mail está vazio, mostre um aviso.\n\nCada uma dessas frases tem uma **condição** (a parte depois do "se") e uma **ação** (o que fazer quando a condição é verdadeira). O `if` é exatamente isso escrito em código.',
                    },
                    {
                        type: "text",
                        value: "## A estrutura do if\n\nUm `if` tem sempre três ingredientes, sempre na mesma ordem. Vale gravar o formato, porque ele não muda:\n\n1. A palavra `if`.\n2. A **condição** entre parênteses `( )`, uma pergunta que só pode ser respondida com verdadeiro ou falso.\n3. O **bloco** de código entre chaves `{ }`, que só roda quando a condição é verdadeira.\n\nEm texto, o esqueleto fica assim: `if (a condição é verdadeira?) { faça isto }`. Veja o primeiro exemplo de verdade:",
                    },
                    {
                        type: "code",
                        value: 'let idade = 20;\n\nif (idade >= 18) {\n  console.log("Você é maior de idade.");\n}\n// no console aparece: Você é maior de idade.',
                    },
                    {
                        type: "text",
                        value: 'Vamos ler essa linha com calma. A condição é `idade >= 18`, que significa "a idade é maior ou igual a 18?". Como `idade` vale `20`, a resposta é `true`. Sendo verdadeira, o JavaScript **entra** nas chaves e executa o `console.log`, mostrando a mensagem.\n\nO símbolo `>=` é um dos **operadores de comparação**, os mesmos que uma condição costuma usar. Vale ter esta tabelinha por perto:',
                    },
                    {
                        type: "table",
                        value: '[["Operador","Significa","Exemplo","Resultado"],["`>`","maior que","`5 > 3`","`true`"],["`<`","menor que","`5 < 3`","`false`"],["`>=`","maior ou igual a","`8 >= 8`","`true`"],["`<=`","menor ou igual a","`4 <= 2`","`false`"],["`===`","igual a","`5 === 5`","`true`"],["`!==`","diferente de","`5 !== 4`","`true`"]]',
                    },
                    {
                        type: "text",
                        value: "## Quando a condição é falsa\n\nE o que acontece quando a condição **não** é verdadeira? O bloco é ignorado, e o programa segue em frente na linha de baixo, como se o `if` nem estivesse ali. Repare:",
                    },
                    {
                        type: "code",
                        value: 'let idade = 15;\n\nif (idade >= 18) {\n  console.log("Você é maior de idade.");\n}\n\nconsole.log("Fim da checagem.");\n// no console aparece só: Fim da checagem.',
                    },
                    {
                        type: "text",
                        value: 'Aqui `idade` vale `15`, então `idade >= 18` é `false`. O JavaScript pula o bloco do `if` (a mensagem "Você é maior de idade." nunca aparece) e vai direto para a última linha, que roda normalmente. Ou seja, o `if` decide **se aquele trecho acontece ou não**.',
                    },
                    {
                        type: "text",
                        value: '## E se a condição for falsa? O else\n\nMuitas vezes queremos fazer uma coisa quando a condição é verdadeira **e outra coisa** quando ela é falsa, não só "fazer ou não fazer". Para isso existe o `else` (que significa "senão"). Ele vem logo depois do bloco do `if`, com o seu próprio par de chaves, e só roda quando a condição do `if` deu falsa.\n\nÉ o "senão" da vida real: **se** chover, levo guarda-chuva; **senão**, levo óculos de sol. Um dos dois sempre acontece.',
                    },
                    {
                        type: "code",
                        value: 'let idade = 15;\n\nif (idade >= 18) {\n  console.log("Pode entrar na festa.");\n} else {\n  console.log("Desculpe, apenas maiores de 18 anos.");\n}\n// no console aparece: Desculpe, apenas maiores de 18 anos.',
                    },
                    {
                        type: "text",
                        value: 'Agora sempre cai uma mensagem: se a idade fosse 18 ou mais, apareceria "Pode entrar na festa."; como é 15, aparece a do `else`. Com `if` sozinho, o bloco roda ou é pulado. Com `if/else`, o programa escolhe **entre dois caminhos** e sempre segue exatamente um deles.',
                    },
                    {
                        type: "text",
                        value: '## Mais de dois caminhos: else if\n\nE quando os caminhos são **vários**? Pense em transformar uma nota num conceito: 9 ou mais é A, 7 ou mais é B, 5 ou mais é C, abaixo disso é reprovado. Para encaixar vários casos em sequência, existe o `else if` ("senão, se..."). Você encadeia quantos `else if` precisar e pode fechar com um `else` para o caso "nenhum dos anteriores".',
                    },
                    {
                        type: "code",
                        value: 'let nota = 7;\n\nif (nota >= 9) {\n  console.log("Conceito A");\n} else if (nota >= 7) {\n  console.log("Conceito B");\n} else if (nota >= 5) {\n  console.log("Conceito C");\n} else {\n  console.log("Reprovado");\n}\n// no console aparece: Conceito B',
                    },
                    {
                        type: "text",
                        value: 'O JavaScript testa as condições **de cima para baixo** e roda o bloco da **primeira** que for verdadeira, ignorando todas as outras. Com `nota` igual a `7`, ele checa `nota >= 9` (falso), depois `nota >= 7` (verdadeiro!) e para ali, mostrando "Conceito B". Por isso a **ordem importa**: se você começasse por `nota >= 5`, todo mundo com 7 cairia no C, porque essa condição também é verdadeira e viria primeiro. O `else` final é a rede de segurança: roda quando nenhuma condição anterior bateu.',
                    },
                    {
                        type: "text",
                        value: "## O erro clássico: `=` no lugar de `===`\n\nUm tropeço famosíssimo de quem começa é confundir os iguais. Um único `=` é **atribuição**: ele **guarda** um valor numa variável. Já o `===` (três iguais) é **comparação**: ele **pergunta** se dois valores são iguais e responde `true` ou `false`. Numa condição, você quase sempre quer o `===`.",
                    },
                    {
                        type: "code",
                        value: 'let cor = "azul";\n\n// ERRADO: um só = ATRIBUI, não compara.\n// if (cor = "verde") { ... }  aqui a cor viraria "verde" e o if sempre rodaria!\n\n// CERTO: === compara e devolve true ou false.\nif (cor === "azul") {\n  console.log("A cor é azul.");\n}\n// no console aparece: A cor é azul.',
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** o `if` executa um bloco **só se** a **condição** (entre parênteses) for verdadeira; o bloco fica entre **chaves**. O `else` cuida do caso falso ("senão"), e o `else if` encadeia **vários caminhos**, dos quais o JavaScript roda o **primeiro** verdadeiro, de cima para baixo. Cuidado com o erro clássico: `=` **atribui** um valor, enquanto `===` **compara**; dentro de uma condição, o que você quer quase sempre é o `===`.',
                    },
                ],
                questions: [
                    {
                        statement: "O que o `if` faz?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Executa um bloco de código apenas se a condição entre parênteses for verdadeira.",
                                isCorrect: true,
                            },
                            {
                                text: "Executa o bloco sempre, não importa a condição.",
                                isCorrect: false,
                            },
                            {
                                text: "Repete um bloco de código várias vezes seguidas.",
                                isCorrect: false,
                            },
                            {
                                text: "Guarda um valor dentro de uma variável.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Onde fica a condição de um `if`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Entre chaves `{ }`, junto com o bloco.",
                                isCorrect: false,
                            },
                            {
                                text: "Entre parênteses `( )`, logo depois da palavra `if`.",
                                isCorrect: true,
                            },
                            {
                                text: "Entre aspas, como um texto qualquer.",
                                isCorrect: false,
                            },
                            {
                                text: "Depois do ponto e vírgula, no fim da linha.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "No `if/else`, quando o bloco do `else` é executado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Sempre, junto com o bloco do `if`.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando a condição do `if` é verdadeira.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando a condição do `if` é falsa.",
                                isCorrect: true,
                            },
                            {
                                text: "Nunca; o `else` é apenas decorativo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com `let nota = 5;`, o que este código mostra? `if (nota >= 9) { ...Conceito A } else if (nota >= 7) { ...Conceito B } else if (nota >= 5) { ...Conceito C } else { ...Reprovado }`",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Conceito A",
                                isCorrect: false,
                            },
                            {
                                text: "Conceito B",
                                isCorrect: false,
                            },
                            {
                                text: "Conceito C",
                                isCorrect: true,
                            },
                            {
                                text: "Reprovado",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que escrever `if (saldo = 0)` (com um único `=`) é um erro perigoso?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque um único `=` atribui: ele muda `saldo` para 0 em vez de comparar. Para comparar, o correto é `===`.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque `=` compara, mas só funciona com textos.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque falta um ponto e vírgula dentro dos parênteses.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque condições não aceitam o número 0 de jeito nenhum.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Truthy e falsy",
                blocks: [
                    {
                        type: "text",
                        value: '# Truthy e falsy\n\nNas condições da aula passada, você sempre colocou uma **comparação** dentro do `if`, como `idade >= 18`, que resulta claramente em `true` ou `false`. Mas o JavaScript é mais flexível do que isso: ele aceita **qualquer valor** dentro dos parênteses de um `if`, não só comparações.\n\nE aí surge uma pergunta interessante: se eu escrever `if ("Ana")` ou `if (0)`, como o JavaScript decide se aquilo "conta" como verdadeiro ou falso? A resposta tem nome, e são duas palavrinhas que você vai ouvir muito: **truthy** e **falsy**.',
                    },
                    {
                        type: "quote",
                        value: "Quando você coloca um valor que **não** é booleano dentro de uma condição, o JavaScript o converte para `true` ou `false` para poder decidir. Os valores que viram `false` são chamados de **falsy**; **todos** os outros são **truthy**. Como a lista de valores falsy é curta, o truque é **decorar essa lista**: tudo o que não estiver nela é truthy.",
                    },
                    {
                        type: "text",
                        value: '## O if sempre quer um "sim" ou um "não"\n\nUm `if` precisa de uma resposta de sim ou não para decidir se roda o bloco. Quando você entrega uma comparação, ela já devolve `true` ou `false`, e está tudo certo. Mas quando você entrega **outra coisa**, um número, um texto, o "nada", o JavaScript não desiste: ele **converte** aquele valor para verdadeiro ou falso e segue em frente.\n\nPense num porteiro que só entende "pode entrar" ou "não pode entrar". Se você chega com qualquer objeto na mão, ele tem uma regra para interpretar: certos objetos ele lê como "pode" (truthy) e outros como "não pode" (falsy). O JavaScript faz igualzinho com os valores.',
                    },
                    {
                        type: "code",
                        value: 'let nome = "Ana";\n\nif (nome) {\n  console.log("Tem um nome preenchido!");\n}\n// no console aparece: Tem um nome preenchido!',
                    },
                    {
                        type: "text",
                        value: 'Repare que `nome` não é `true` nem `false`: é o texto `"Ana"`. Ainda assim, o `if` rodou. Isso porque um texto com conteúdo é **truthy**: o JavaScript o interpretou como "sim, tem algo aqui". Foi como perguntar "existe um nome?" e receber um "sim".\n\n## A lista de valores falsy\n\nAqui está o segredo que facilita tudo: em vez de tentar decorar o que é truthy (seria uma lista infinita), decore o que é **falsy**. São poucos, e você pode contá-los nos dedos:',
                    },
                    {
                        type: "table",
                        value: '[["Valor falsy","O que é"],["`false`","o próprio booleano falso"],["`0`","o número zero"],["`\\"\\"`","um texto vazio (aspas sem nada dentro)"],["`null`","o \\"nada\\" atribuído de propósito"],["`undefined`","um valor que ainda não foi definido"],["`NaN`","o \\"Not a Number\\", resultado de uma conta inválida"]]',
                    },
                    {
                        type: "text",
                        value: 'São só esses seis. Vale ler a lista em voz alta algumas vezes: `false`, `0`, texto vazio, `null`, `undefined` e `NaN`. Veja todos eles "falhando" numa condição, ou seja, fazendo o bloco ser pulado:',
                    },
                    {
                        type: "code",
                        value: 'if (false)     { console.log("não vou rodar"); }\nif (0)         { console.log("não vou rodar"); }\nif ("")        { console.log("não vou rodar"); }\nif (null)      { console.log("não vou rodar"); }\nif (undefined) { console.log("não vou rodar"); }\nif (NaN)       { console.log("não vou rodar"); }\n\nconsole.log("Nenhum bloco acima rodou: todos os valores eram falsy.");\n// no console aparece só: Nenhum bloco acima rodou: todos os valores eram falsy.',
                    },
                    {
                        type: "text",
                        value: '## Todo o resto é truthy\n\nA regra de ouro: **qualquer valor que não esteja na lista de falsy é truthy**. Isso inclui alguns casos que costumam surpreender no começo:\n\n- Qualquer número diferente de zero, **inclusive os negativos** (`-1`, `-99`).\n- Qualquer texto com pelo menos um caractere, **mesmo que esse caractere seja um zero** (`"0"`) ou a palavra false escrita como texto (`"false"`).\n- Um espaço em branco também conta como texto preenchido (`" "`), porque não está vazio.\n\nO ponto que mais pega gente desprevenida é a diferença entre o **número** `0` e o **texto** `"0"`:',
                    },
                    {
                        type: "code",
                        value: 'if ("0") {\n  console.log("O texto com um zero é truthy: não está vazio.");\n}\n\nif (-1) {\n  console.log("O número -1 é truthy: só o zero é falsy.");\n}\n\n// no console aparece, em duas linhas:\n// O texto com um zero é truthy: não está vazio.\n// O número -1 é truthy: só o zero é falsy.',
                    },
                    {
                        type: "text",
                        value: 'Sacou a diferença? O número `0` é falsy, mas o texto `"0"` é truthy, porque para o JavaScript ele é um texto com um caractere dentro, e todo texto não vazio é truthy. Da mesma forma, `-1` é truthy: entre os números, **só o `0` é falsy**.\n\n## Para que isso serve na prática\n\nO uso mais comum de truthy e falsy é checar, de forma curtinha, se um valor "existe" ou "foi preenchido". Em vez de escrever uma comparação longa, você coloca a própria variável na condição. Lê-se `if (email)` como "se tem e-mail". Como um campo em branco vira o texto vazio `""`, que é falsy, dá para avisar o usuário facilmente:',
                    },
                    {
                        type: "code",
                        value: 'let email = "";   // o usuário não digitou nada\n\nif (email) {\n  console.log("Enviando para: " + email);\n} else {\n  console.log("Por favor, preencha o e-mail.");\n}\n// no console aparece: Por favor, preencha o e-mail.',
                    },
                    {
                        type: "text",
                        value: '## Espiando o booleano por trás: `Boolean()`\n\nSe bater a dúvida "esse valor é truthy ou falsy?", dá para perguntar diretamente ao JavaScript. A função `Boolean(valor)` devolve o `true` ou `false` que aquele valor viraria numa condição. É uma ótima forma de testar e ganhar confiança:',
                    },
                    {
                        type: "code",
                        value: 'console.log(Boolean("Ana"));   // no console aparece: true\nconsole.log(Boolean(42));      // no console aparece: true\nconsole.log(Boolean("0"));     // no console aparece: true\n\nconsole.log(Boolean(0));       // no console aparece: false\nconsole.log(Boolean(""));      // no console aparece: false\nconsole.log(Boolean(null));    // no console aparece: false',
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** dentro de uma condição, o JavaScript converte qualquer valor para verdadeiro ou falso. Os valores **falsy** (que viram `false`) são só seis: `false`, `0`, `""` (texto vazio), `null`, `undefined` e `NaN`. **Todo o resto é truthy**, inclusive números negativos e textos como `"0"` ou `" "`. Por isso `if (nome)` funciona como "se tem nome", e a função `Boolean(valor)` mostra em qual dos dois lados um valor cai.',
                    },
                ],
                questions: [
                    {
                        statement: "Qual destes valores é falsy?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`0` (o número zero)",
                                isCorrect: true,
                            },
                            {
                                text: "`42`",
                                isCorrect: false,
                            },
                            {
                                text: '`"Ana"` (um texto com conteúdo)',
                                isCorrect: false,
                            },
                            {
                                text: "`-5`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que quer dizer um valor ser truthy?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Que o JavaScript o trata como verdadeiro quando ele aparece numa condição.",
                                isCorrect: true,
                            },
                            {
                                text: "Que ele é sempre igual ao número 1.",
                                isCorrect: false,
                            },
                            {
                                text: "Que ele causa um erro dentro de um `if`.",
                                isCorrect: false,
                            },
                            {
                                text: "Que ele só pode ser usado com `console.log`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Numa condição, o texto `"0"` (o zero entre aspas) é considerado o quê?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Falsy, porque contém um zero.",
                                isCorrect: false,
                            },
                            {
                                text: "Truthy, porque é um texto não vazio (tem um caractere dentro).",
                                isCorrect: true,
                            },
                            {
                                text: "Nem truthy nem falsy: dá erro.",
                                isCorrect: false,
                            },
                            {
                                text: "Igual ao número 0, portanto falsy.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Com `let cidade = "";` (texto vazio), o que este código mostra? `if (cidade) { console.log("tem cidade"); } else { console.log("cidade vazia"); }`',
                        difficulty: "medio",
                        options: [
                            {
                                text: "tem cidade, porque toda variável é truthy.",
                                isCorrect: false,
                            },
                            {
                                text: 'cidade vazia, porque o texto vazio `""` é falsy.',
                                isCorrect: true,
                            },
                            {
                                text: "Nada, porque falta uma condição.",
                                isCorrect: false,
                            },
                            {
                                text: "Um erro, porque não se pode usar texto num `if`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Um colega afirma: "números negativos são falsy, porque não são positivos". Qual resposta corrige melhor essa ideia?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Está errado: entre os números, só o `0` (e o `NaN`) é falsy; qualquer outro, inclusive negativos como `-1`, é truthy.",
                                isCorrect: true,
                            },
                            {
                                text: "Está certo: `-1`, `-2` e afins são todos falsy.",
                                isCorrect: false,
                            },
                            {
                                text: "Está certo, mas só quando o número está entre aspas.",
                                isCorrect: false,
                            },
                            {
                                text: "Depende do navegador: em alguns `-1` é falsy, em outros não.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O operador ternário",
                blocks: [
                    {
                        type: "text",
                        value: '# O operador ternário\n\nO `if/else` que você aprendeu é a ferramenta principal para decisões, e vai ser assim para sempre. Mas existe uma situação muito comum em que ele fica um pouco "gordo": quando tudo o que você quer é **escolher entre dois valores** conforme uma condição. Para esse caso específico, o JavaScript oferece um atalho elegante que cabe numa linha só: o **operador ternário**.',
                    },
                    {
                        type: "quote",
                        value: "O operador ternário tem a forma `condição ? valorSeVerdadeiro : valorSeFalso`. Ele **avalia** a condição e **devolve** um dos dois valores: o que vem depois do `?` quando a condição é verdadeira, ou o que vem depois do `:` quando é falsa. É como um `if/else` compacto que, em vez de só executar, **produz um resultado**.",
                    },
                    {
                        type: "text",
                        value: '## De onde vem o nome "ternário"\n\nO nome parece complicado, mas tem uma explicação simples. Um **operador** é um símbolo que trabalha com valores. O `+`, por exemplo, é um operador **binário**: trabalha com **dois** valores (`2 + 3`). O ternário é o único operador da linguagem que trabalha com **três** partes de uma vez:\n\n1. A **condição** (a pergunta).\n2. O valor a devolver **se ela for verdadeira**.\n3. O valor a devolver **se ela for falsa**.\n\nEssas três partes são separadas pelos símbolos `?` e `:`. Daí o nome: "ternário" vem de "três".',
                    },
                    {
                        type: "text",
                        value: "## Do if/else ao ternário\n\nA melhor forma de entender é ver a mesma decisão escrita das duas maneiras. Digamos que a gente queira guardar numa variável se a pessoa é maior ou menor de idade. Com o `if/else` que você já conhece, fica assim:",
                    },
                    {
                        type: "code",
                        value: 'let idade = 20;\nlet situacao;\n\nif (idade >= 18) {\n  situacao = "maior de idade";\n} else {\n  situacao = "menor de idade";\n}\n\nconsole.log(situacao);\n// no console aparece: maior de idade',
                    },
                    {
                        type: "text",
                        value: "São seis linhas para uma decisão bem simples. Agora veja exatamente a mesma lógica com o operador ternário, tudo numa única linha:",
                    },
                    {
                        type: "code",
                        value: 'let idade = 20;\nlet situacao = idade >= 18 ? "maior de idade" : "menor de idade";\n\nconsole.log(situacao);\n// no console aparece: maior de idade',
                    },
                    {
                        type: "text",
                        value: 'As duas versões fazem a **mesma coisa**. A condição `idade >= 18` é avaliada: como é verdadeira, o ternário devolve o valor depois do `?` (`"maior de idade"`), que é guardado em `situacao`. Se a idade fosse 15, ele devolveria o valor depois do `:` (`"menor de idade"`).\n\n## Lendo o ternário em voz alta\n\nUm truque para não se perder é ler o ternário como uma frase. O `?` vira "?" e o `:` vira "senão". Assim, `idade >= 18 ? "maior" : "menor"` se lê: "a idade é maior ou igual a 18? Então **maior**; senão, **menor**". O molde mental é sempre este:',
                    },
                    {
                        type: "code",
                        value: '// PERGUNTA ? RESPOSTA-SE-SIM : RESPOSTA-SE-NÃO\n\nlet saldo = 0;\nlet aviso = saldo > 0 ? "Você tem crédito." : "Sem saldo disponível.";\n\nconsole.log(aviso);\n// no console aparece: Sem saldo disponível.',
                    },
                    {
                        type: "text",
                        value: '## O grande trunfo: usar o resultado na hora\n\nComo o ternário **devolve um valor**, você pode encaixá-lo em qualquer lugar que espere um valor: dentro de um `console.log`, no meio de uma concatenação de texto, e por aí vai. Isso é algo que o `if/else` não faz, porque ele **executa** blocos, mas não "vira" um valor. Repare no ternário morando dentro de uma mensagem:',
                    },
                    {
                        type: "code",
                        value: 'let pontos = 85;\n\nconsole.log("Situação: " + (pontos >= 70 ? "Aprovado" : "Reprovado"));\n// no console aparece: Situação: Aprovado',
                    },
                    {
                        type: "text",
                        value: 'Os parênteses em volta do ternário, ali no meio da concatenação, ajudam o JavaScript (e quem lê) a enxergar onde a mini-decisão começa e termina. É um hábito recomendável sempre que o ternário aparece grudado a outra coisa.\n\n## Quando o `if` continua sendo a melhor escolha\n\nO ternário é ótimo para decisões pequenas, mas ele tem um lado traiçoeiro: é fácil abusar dele e acabar com um código impossível de ler. Fuja do ternário quando:\n\n- houver **três ou mais caminhos** (aninhar um ternário dentro do outro vira um nó);\n- cada caminho precisar **fazer várias coisas** (e não apenas devolver um valor);\n- a leitura ficar confusa, mesmo que "funcione".\n\nVeja um exemplo de ternário **exagerado**, encaixado dentro de outro, que tecnicamente funciona mas é penoso de decifrar:',
                    },
                    {
                        type: "code",
                        value: 'let nota = 7;\n\n// Ternários aninhados: funciona, mas é difícil de ler.\nlet conceito = nota >= 9 ? "A" : nota >= 7 ? "B" : nota >= 5 ? "C" : "D";\nconsole.log(conceito);\n// no console aparece: B\n\n// Para três ou mais caminhos, um if/else if (ou um switch) fica muito mais claro.',
                    },
                    {
                        type: "table",
                        value: '[["Situação","Escolha mais indicada"],["Escolher entre dois valores simples","Ternário"],["Guardar o resultado direto numa variável","Ternário"],["Usar a decisão dentro de um texto ou `console.log`","Ternário"],["Três ou mais caminhos","`if/else if` ou `switch`"],["Cada caminho executa várias ações","`if/else`"]]',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** o operador **ternário** tem a forma `condição ? valorSeVerdadeiro : valorSeFalso` e **devolve** um dos dois valores, funcionando como um `if/else` que cabe numa linha e produz um resultado. Ele brilha para **escolher entre dois valores** e usá-los na hora (numa variável, num texto, num `console.log`). Mas quando há **vários caminhos** ou cada ramo faz **muita coisa**, o `if/else` (ou o `switch`) é mais legível: prefira clareza a esperteza.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a forma correta do operador ternário?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`condição ? valorSeVerdadeiro : valorSeFalso`",
                                isCorrect: true,
                            },
                            {
                                text: "`condição : valorSeVerdadeiro ? valorSeFalso`",
                                isCorrect: false,
                            },
                            {
                                text: "`if condição ? valor`",
                                isCorrect: false,
                            },
                            {
                                text: "`condição => valor1 | valor2`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que esse operador se chama ternário?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Porque trabalha com três partes: a condição, o valor se verdadeiro e o valor se falso.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque só pode ser usado três vezes por programa.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque sempre devolve o número três.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque foi o terceiro operador criado na linguagem.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Qual é o valor de `resultado` depois desta linha? `let resultado = 5 > 3 ? "sim" : "não";`',
                        difficulty: "medio",
                        options: [
                            {
                                text: '`"não"`, porque `5 > 3` é falso.',
                                isCorrect: false,
                            },
                            {
                                text: '`"sim"`, porque `5 > 3` é verdadeiro.',
                                isCorrect: true,
                            },
                            {
                                text: "`true`, o resultado da comparação.",
                                isCorrect: false,
                            },
                            {
                                text: "`5`, o primeiro número da linha.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Qual ternário é equivalente a este if/else? `if (temperatura >= 30) { roupa = "leve"; } else { roupa = "casaco"; }`',
                        difficulty: "medio",
                        options: [
                            {
                                text: '`let roupa = temperatura >= 30 ? "leve" : "casaco";`',
                                isCorrect: true,
                            },
                            {
                                text: '`let roupa = temperatura >= 30 : "leve" ? "casaco";`',
                                isCorrect: false,
                            },
                            {
                                text: '`let roupa = temperatura >= 30 ? "casaco" : "leve";`',
                                isCorrect: false,
                            },
                            {
                                text: '`let roupa = if temperatura >= 30 ? "leve";`',
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em qual situação o `if/else` é uma escolha melhor do que o ternário?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Quando há vários caminhos ou cada caminho executa várias ações; aninhar ternários prejudica a leitura.",
                                isCorrect: true,
                            },
                            {
                                text: "Sempre: o ternário nunca deve ser usado em código de verdade.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando você quer apenas guardar um único valor numa variável.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando a condição usa o operador `>`.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O switch",
                blocks: [
                    {
                        type: "text",
                        value: "# O switch\n\nVocê já sabe encadear vários `else if` para tratar muitos casos. Isso funciona muito bem, mas quando todos esses casos são **comparações de uma mesma variável** com valores fixos, a cadeia começa a ficar repetitiva: `dia === 1`, `dia === 2`, `dia === 3`... sempre a mesma variável, sempre o mesmo `===`. Para esse cenário específico, o JavaScript tem uma estrutura mais enxuta e organizada: o `switch`.",
                    },
                    {
                        type: "quote",
                        value: '**Atenção ao ponto que mais causa bugs.** O `switch` compara **um valor** contra vários `case` (casos). Ao encontrar o `case` cujo valor bate, ele executa o código dali para baixo **até topar com um `break`**. O `default` é o caso "nenhum dos anteriores", como um `else`. **Esquecer o `break`** faz a execução "vazar" para os casos seguintes.',
                    },
                    {
                        type: "text",
                        value: "## O problema que o switch resolve\n\nImagine transformar o número de um dia (1 a 7) no nome dele. Com `else if`, repare como a dupla `dia ===` se repete em toda linha:",
                    },
                    {
                        type: "code",
                        value: 'let dia = 3;\n\nif (dia === 1) {\n  console.log("Domingo");\n} else if (dia === 2) {\n  console.log("Segunda");\n} else if (dia === 3) {\n  console.log("Terça");\n} else {\n  console.log("Dia inválido");\n}\n// no console aparece: Terça',
                    },
                    {
                        type: "text",
                        value: "## A mesma coisa com switch\n\nAgora a versão com `switch`. Você escreve a variável **uma vez só**, entre parênteses, e lista os valores possíveis como `case`. Compare com o exemplo acima: é a mesma lógica.",
                    },
                    {
                        type: "code",
                        value: 'let dia = 3;\n\nswitch (dia) {\n  case 1:\n    console.log("Domingo");\n    break;\n  case 2:\n    console.log("Segunda");\n    break;\n  case 3:\n    console.log("Terça");\n    break;\n  default:\n    console.log("Dia inválido");\n}\n// no console aparece: Terça',
                    },
                    {
                        type: "text",
                        value: '## A anatomia do switch\n\nSão quatro peças, e vale conhecer cada uma:\n\n- **`switch (dia)`**: entre parênteses vai o **valor** que será comparado com cada caso.\n- **`case 3:`**: significa "se o valor for igual a 3". A comparação é **estrita**, como um `===` (o `case "3"` com texto **não** casaria com o número `3`).\n- **`break`**: diz "terminei, pode sair do `switch`". Sem ele, a execução continua descendo.\n- **`default`**: roda quando **nenhum** `case` bateu, igual ao `else`. É opcional, mas quase sempre vale a pena ter um.\n\nVeja o `default` entrando em ação quando o valor não bate com nenhum `case`:',
                    },
                    {
                        type: "code",
                        value: 'let mes = 13;\n\nswitch (mes) {\n  case 1:\n    console.log("Janeiro");\n    break;\n  case 2:\n    console.log("Fevereiro");\n    break;\n  default:\n    console.log("Mês fora do intervalo de 1 a 12.");\n}\n// no console aparece: Mês fora do intervalo de 1 a 12.',
                    },
                    {
                        type: "text",
                        value: '## O perigo de esquecer o break\n\nEste é o tropeço mais famoso do `switch`, e todo mundo cai nele pelo menos uma vez. Quando um `case` casa mas **não** tem `break`, o JavaScript não para ali: ele continua executando os `case` **de baixo** também, até encontrar um `break` ou chegar ao fim do `switch`. Esse comportamento tem até nome em inglês, *fall-through* (algo como "cair através"). Veja o estrago:',
                    },
                    {
                        type: "code",
                        value: 'let dia = 1;\n\nswitch (dia) {\n  case 1:\n    console.log("Domingo");\n    // Esquecemos o break aqui!\n  case 2:\n    console.log("Segunda");\n    break;\n  case 3:\n    console.log("Terça");\n    break;\n}\n// no console aparece, em duas linhas:\n// Domingo\n// Segunda',
                    },
                    {
                        type: "text",
                        value: 'O que aconteceu? O valor `1` casou com o `case 1` e imprimiu "Domingo", como esperado. Mas, sem o `break`, a execução **vazou** para o `case 2` e imprimiu "Segunda" também, só parando no `break` que existe ali. Ou seja, um `break` esquecido faz aparecer coisa que não devia. A regra prática é simples: **ponha um `break` no fim de cada `case`**, e você evita 99% dos problemas.',
                    },
                    {
                        type: "text",
                        value: '## Quando o vazamento é proposital: agrupar casos\n\nCuriosamente, esse "vazamento" nem sempre é um bug: às vezes ele é usado **de propósito**. Quando você empilha vários `case` **sem código entre eles**, todos caem no mesmo bloco, o que é uma forma elegante de dizer "se for isto **ou** aquilo, faça a mesma coisa":',
                    },
                    {
                        type: "code",
                        value: 'let dia = 7;\n\nswitch (dia) {\n  case 1:\n  case 7:\n    console.log("Fim de semana!");\n    break;\n  case 2:\n  case 3:\n  case 4:\n  case 5:\n  case 6:\n    console.log("Dia de semana.");\n    break;\n}\n// no console aparece: Fim de semana!',
                    },
                    {
                        type: "text",
                        value: 'Aqui os `case 1` e `case 7` estão "colados", sem nada entre eles, então ambos levam ao mesmo `console.log`. É como escrever "se o dia for 1 ou 7". O mesmo vale para os dias 2 a 6, que compartilham a mensagem de dia útil. Repare que **esse** vazamento é intencional e útil, bem diferente do `break` esquecido da seção anterior.\n\n## switch ou uma cadeia de else if?\n\nAs duas estruturas resolvem problemas parecidos, mas cada uma tem o seu ponto forte. O `switch` brilha quando você compara **uma única variável** com vários valores **exatos e fixos** (um número de menu, um dia, um status como `"pago"` ou `"pendente"`). Já o `else if` é insubstituível quando as condições são **faixas** (`nota >= 7`) ou **compostas** (`idade >= 18 && temIngresso`), porque o `case` só sabe comparar por igualdade exata.',
                    },
                    {
                        type: "table",
                        value: '[["Situação","Escolha mais indicada"],["Uma variável comparada a valores exatos","`switch`"],["Muitos casos fixos (menu, dia, status)","`switch`"],["Faixas ou intervalos (`nota >= 7`)","`else if`"],["Condições compostas (`a && b`)","`else if`"],["Apenas dois ou três casos simples","`if/else` ou ternário"]]',
                    },
                    {
                        type: "text",
                        value: "## Parabéns por concluir o Módulo 4!\n\nQue jornada! Neste módulo o seu código deixou de ser uma esteira que faz tudo igual e ganhou a capacidade de **decidir**. Você aprendeu o `if`, o `else` e o `else if` para escolher caminhos; entendeu como o JavaScript enxerga qualquer valor como **truthy** ou **falsy** numa condição; conheceu o **operador ternário** para decisões enxutas de uma linha; e fechou com o `switch`, ideal para comparar uma variável contra muitos valores fixos.\n\nCom essas quatro ferramentas, os seus programas já conseguem reagir de formas diferentes a situações diferentes, que é o que dá inteligência a qualquer software. No **próximo módulo**, o JavaScript vai aprender a **repetir** tarefas sem você ter que copiar e colar código: são os **laços de repetição**. Até lá, e continue testando tudo no console!",
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** o `switch` compara um valor com vários `case` e roda o código do caso que bate **até um `break`**; o `default` cobre o "nenhum dos casos". O maior perigo é **esquecer o `break`**, o que faz a execução **vazar** para os próximos casos (o *fall-through*), embora esse vazamento também possa ser usado de propósito para **agrupar casos**. Prefira o `switch` para comparar uma variável com **valores exatos e fixos**, e a cadeia de `else if` para **faixas** e **condições compostas**.',
                    },
                ],
                questions: [
                    {
                        statement: "Para que serve o `break` dentro de um `switch`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Para sair do `switch` assim que o caso certo termina, impedindo a execução de vazar para os próximos `case`.",
                                isCorrect: true,
                            },
                            {
                                text: "Para repetir o `case` atual várias vezes.",
                                isCorrect: false,
                            },
                            {
                                text: "Para pular o `switch` inteiro sem rodar nada.",
                                isCorrect: false,
                            },
                            {
                                text: "Para comparar dois valores diferentes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No `switch`, qual parte roda quando nenhum `case` corresponde ao valor?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O `default`.",
                                isCorrect: true,
                            },
                            {
                                text: "O primeiro `case` da lista.",
                                isCorrect: false,
                            },
                            {
                                text: "O último `case` da lista.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma; o programa trava.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'O que este código mostra? `let n = 1; switch (n) { case 1: console.log("um"); case 2: console.log("dois"); break; case 3: console.log("três"); break; }`',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Apenas um.",
                                isCorrect: false,
                            },
                            {
                                text: "um e dois (em duas linhas), porque falta o `break` no `case 1` e a execução vaza até o `break` do `case 2`.",
                                isCorrect: true,
                            },
                            {
                                text: "um, dois e três.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas dois.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em qual situação o `switch` costuma ser melhor do que uma cadeia de `else if`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Quando você compara uma mesma variável com vários valores exatos e fixos.",
                                isCorrect: true,
                            },
                            {
                                text: "Quando as condições são faixas, como `nota >= 7`.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando cada condição combina várias comparações com `&&`.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando existe apenas uma condição a testar.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'O que este `switch` mostra e por quê? `let dia = 6; switch (dia) { case 1: case 7: console.log("Fim de semana"); break; case 2: case 3: case 4: case 5: case 6: console.log("Dia de semana"); break; }`',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Dia de semana, porque o `case 6` cai no mesmo bloco dos casos 2 a 5 (eles estão agrupados, sem código nem `break` entre si).",
                                isCorrect: true,
                            },
                            {
                                text: "Fim de semana, porque 6 é maior que 5.",
                                isCorrect: false,
                            },
                            {
                                text: "Nada, porque só o `case 7` tem mensagem própria.",
                                isCorrect: false,
                            },
                            {
                                text: "Dia de semana e Fim de semana, nas duas linhas.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Loops",
        aulas: [
            {
                titulo: "O loop for",
                blocks: [
                    {
                        type: "text",
                        value: "# O loop for\n\nBem-vindo ao **Módulo 5**! Até aqui você já sabe guardar informações em **variáveis** e fazer o programa **tomar decisões** com `if` e `else`. Agora vamos ensinar o computador a fazer uma coisa em que ele é imbatível: **repetir**. Se tem algo que máquina faz sem reclamar e sem cansar, é a mesma tarefa mil vezes seguidas.\n\nNesta aula você vai conhecer o **`for`**, o loop mais usado do JavaScript. Ele serve para **repetir um trecho de código várias vezes** sem você precisar copiar e colar. No fim, contar de 1 a 100 vai virar coisa de três linhas.",
                    },
                    {
                        type: "quote",
                        value: "Um **loop** (ou **laço de repetição**) é um trecho de código que **roda várias vezes** seguidas. O **`for`** é o loop ideal quando você **sabe quantas vezes** quer repetir. Ele tem três partes numa linha só: a **inicialização** (onde a contagem começa), a **condição** (até quando repetir) e o **incremento** (como a contagem avança a cada volta).",
                    },
                    {
                        type: "text",
                        value: '## O problema: copiar e colar cansa\n\nImagine que você precisa escrever a mensagem "Olá!" cinco vezes no console. Com o que você já sabe, faria assim, uma linha embaixo da outra:',
                    },
                    {
                        type: "code",
                        value: 'console.log("Olá!");\nconsole.log("Olá!");\nconsole.log("Olá!");\nconsole.log("Olá!");\nconsole.log("Olá!");\n// no console aparece "Olá!" cinco vezes, uma em cada linha',
                    },
                    {
                        type: "text",
                        value: "Funciona, mas repare no incômodo: foram **cinco linhas quase idênticas**. E se fossem **cem** mensagens? Ou **mil**? Copiar e colar viraria um pesadelo, e qualquer ajuste (trocar o texto, por exemplo) teria que ser feito em todas as linhas. Programar bem é, muitas vezes, **fugir da repetição manual**. É aí que entra o loop.\n\n## Chega de copiar: o loop `for`\n\nO **`for`** faz o mesmo trabalho, mas mandando o computador repetir sozinho. Pense nele como uma **máquina de carimbar**: você configura quantas batidas quer, aperta o botão, e ela carimba na quantidade certa. Veja as cinco mensagens de antes, agora com um `for`:",
                    },
                    {
                        type: "code",
                        value: 'for (let i = 1; i <= 5; i++) {\n  console.log("Olá!");\n}\n// no console aparece "Olá!" cinco vezes, exatamente como antes',
                    },
                    {
                        type: "text",
                        value: 'Cinco linhas viraram três, e trocar o número 5 por 100 já faria o programa repetir cem vezes. Essa é a mágica do loop.\n\n## As três partes do `for`\n\nAquela primeira linha, entre parênteses, é o **coração** do `for`. Ela tem **três partes**, separadas por ponto e vírgula `;`. Vamos abrir uma por uma, usando o exemplo `for (let i = 1; i <= 5; i++)`:\n\n- **Inicialização** (`let i = 1`): roda **uma única vez**, no comecinho. Cria uma variável para **contar** as voltas, começando em 1.\n- **Condição** (`i <= 5`): é testada **antes de cada volta**. Enquanto for **verdadeira**, o loop continua; quando ficar **falsa**, ele para. Aqui: "repita enquanto o `i` for menor ou igual a 5".\n- **Incremento** (`i++`): roda **no fim de cada volta**. É o que faz a contagem **avançar**. O `i++` é um atalho para "some 1 ao `i`".\n\nO bloco de código que vai **repetir** fica entre as chaves `{ }`, logo abaixo.',
                    },
                    {
                        type: "table",
                        value: '[["Parte","Exemplo","O que faz","Quando roda"],["Inicialização","`let i = 1`","Cria e prepara o contador","Uma vez, no início"],["Condição","`i <= 5`","Decide se continua repetindo","Antes de cada volta"],["Incremento","`i++`","Faz a contagem avançar","No fim de cada volta"]]',
                    },
                    {
                        type: "text",
                        value: "## O contador `i`\n\nAquela variável `i` tem um papel especial: ela é o **contador** do loop, quem guarda em que **volta** estamos. O nome `i` é uma tradição antiga (vem de _índice_), mas poderia ser qualquer nome. A cada volta, o valor de `i` muda, e a gente pode **usar** esse valor lá dentro. Veja o que acontece se imprimirmos o próprio `i`:",
                    },
                    {
                        type: "code",
                        value: 'for (let i = 1; i <= 5; i++) {\n  console.log("Volta número", i);\n}\n// no console aparece, em cinco linhas:\n// Volta número 1\n// Volta número 2\n// Volta número 3\n// Volta número 4\n// Volta número 5',
                    },
                    {
                        type: "text",
                        value: 'Acompanhe a lógica: na primeira volta o `i` vale 1, o console mostra "Volta número 1", e o `i++` transforma o `i` em 2. O loop testa a condição de novo (2 é menor ou igual a 5? sim), roda outra volta... e assim por diante até o `i` virar 6. Aí `6 <= 5` é **falso**, e o loop para. Por isso ele repetiu exatamente **cinco** vezes.\n\n## Contando de outras formas\n\nO `for` é flexível: mudando as três partes, você conta como quiser. Um detalhe cultural da programação: é muito comum começar a contagem no **zero**. Repare como a condição vira `i < 5` (menor que 5) para ainda assim dar cinco voltas:',
                    },
                    {
                        type: "code",
                        value: "// Começando do zero (cinco voltas: 0, 1, 2, 3, 4)\nfor (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n// no console aparece: 0, depois 1, 2, 3 e 4 (um por linha)",
                    },
                    {
                        type: "text",
                        value: 'E se você quiser contar **de trás para frente**? Basta começar num número alto e, em vez de somar, **subtrair** a cada volta. O atalho para "subtraia 1" é `i--`:',
                    },
                    {
                        type: "code",
                        value: '// Contagem regressiva, de 5 até 1\nfor (let i = 5; i >= 1; i--) {\n  console.log(i);\n}\nconsole.log("Já!");\n// no console aparece: 5, 4, 3, 2, 1 e, por fim, Já!',
                    },
                    {
                        type: "text",
                        value: '## Pulando de 2 em 2\n\nO incremento não precisa ser de 1 em 1. Trocando o `i++` por `i += 2` (que significa "some 2 ao `i`"), a contagem anda de **dois em dois**. É assim que a gente lista, por exemplo, os números **pares**:',
                    },
                    {
                        type: "code",
                        value: "// Números pares de 0 a 10\nfor (let i = 0; i <= 10; i += 2) {\n  console.log(i);\n}\n// no console aparece: 0, 2, 4, 6, 8 e 10",
                    },
                    {
                        type: "text",
                        value: "## Juntando tudo: uma soma\n\nPara fechar, um exemplo que mostra o loop trabalhando de verdade. Vamos **somar** todos os números de 1 a 5. A ideia é ter uma variável `total` guardando o resultado parcial e, a cada volta, **acrescentar** o valor de `i` a ela:",
                    },
                    {
                        type: "code",
                        value: 'let total = 0;\nfor (let i = 1; i <= 5; i++) {\n  total = total + i;   // acrescenta o i da volta atual ao total\n}\nconsole.log("A soma de 1 a 5 é:", total);\n// no console aparece: A soma de 1 a 5 é: 15',
                    },
                    {
                        type: "text",
                        value: "Passo a passo, o `total` foi crescendo: 0, depois 1, depois 3 (1+2), depois 6 (3+3), depois 10 (6+4) e por fim 15 (10+5). Um trabalho que seria chato de fazer na mão, o loop resolveu num piscar de olhos. Guarde esse padrão de **acumular um resultado dentro do loop**: você vai usá-lo muito.",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** o **`for`** repete um bloco de código quando você **sabe quantas vezes** quer. Suas três partes são a **inicialização** (`let i = 1`, prepara o contador, roda uma vez), a **condição** (`i <= 5`, testada antes de cada volta) e o **incremento** (`i++`, avança a contagem no fim de cada volta). O contador `i` guarda a volta atual e pode ser usado lá dentro. Mudando as três partes, você conta para cima, para baixo ou de 2 em 2.",
                    },
                ],
                questions: [
                    {
                        statement: "Para que serve um loop como o `for`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Para repetir um trecho de código várias vezes, sem precisar copiar e colar.",
                                isCorrect: true,
                            },
                            {
                                text: "Para deixar o texto da página colorido.",
                                isCorrect: false,
                            },
                            {
                                text: "Para apagar todas as variáveis da memória.",
                                isCorrect: false,
                            },
                            {
                                text: "Para impedir que o código rode.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No `for (let i = 1; i <= 5; i++)`, qual parte é a **condição**, que decide se o loop continua?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`let i = 1`",
                                isCorrect: false,
                            },
                            {
                                text: "`i <= 5`",
                                isCorrect: true,
                            },
                            {
                                text: "`i++`",
                                isCorrect: false,
                            },
                            {
                                text: "`console.log`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o `i++` faz dentro de um `for`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Multiplica o `i` por 2 a cada volta.",
                                isCorrect: false,
                            },
                            {
                                text: "Reinicia o `i` para 1.",
                                isCorrect: false,
                            },
                            {
                                text: "Soma 1 ao `i`, fazendo a contagem avançar a cada volta.",
                                isCorrect: true,
                            },
                            {
                                text: "Para o loop imediatamente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quantas vezes o loop `for (let i = 0; i < 3; i++)` repete o bloco de dentro?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "2 vezes.",
                                isCorrect: false,
                            },
                            {
                                text: "3 vezes (o `i` vale 0, 1 e 2).",
                                isCorrect: true,
                            },
                            {
                                text: "4 vezes.",
                                isCorrect: false,
                            },
                            {
                                text: "Infinitas vezes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual das três partes do `for` roda **uma única vez**, no comecinho do loop?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A inicialização (`let i = 1`).",
                                isCorrect: true,
                            },
                            {
                                text: "A condição (`i <= 5`), que roda uma vez só.",
                                isCorrect: false,
                            },
                            {
                                text: "O incremento (`i++`), que roda uma vez no fim.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma: todas rodam a cada volta.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "while e do...while",
                blocks: [
                    {
                        type: "text",
                        value: '# `while` e `do...while`\n\nNa aula passada você aprendeu o `for`, o loop perfeito para quando a gente **sabe quantas vezes** quer repetir. Mas nem sempre sabemos esse número de antemão. Às vezes a regra é "continue **enquanto** tal coisa for verdade", sem saber quantas voltas isso vai dar.\n\nPara esses casos existe o **`while`** (que em inglês quer dizer **enquanto**) e o seu primo **`do...while`**. Nesta aula você vai ver como cada um funciona, quando escolher um ou outro e, muito importante, como **não** cair na armadilha do **loop infinito**.',
                    },
                    {
                        type: "quote",
                        value: "O **`while`** repete um bloco **enquanto** uma condição for verdadeira, e testa essa condição **antes** de cada volta. O **`do...while`** faz quase a mesma coisa, mas testa a condição **no fim**, o que garante que o bloco rode **pelo menos uma vez**. A diferença entre eles é só **quando** a pergunta é feita: antes ou depois.",
                    },
                    {
                        type: "text",
                        value: '## Quando o `for` não é a melhor escolha\n\nO `for` junta as três partes (inicialização, condição, incremento) numa linha só, o que é ótimo quando você conta um número certo de vezes. O `while` é mais **enxuto**: ele pede **só a condição**. O controle do contador fica por sua conta, o que o torna ideal para situações do tipo "repita até acontecer alguma coisa".\n\n## A anatomia do `while`\n\nO `while` é a simplicidade em pessoa: a palavra `while`, uma **condição** entre parênteses e o bloco a repetir entre chaves. Enquanto a condição for verdadeira, o bloco roda de novo. Veja a contagem de 1 a 5, agora com `while`:',
                    },
                    {
                        type: "code",
                        value: "let i = 1;                 // preparo o contador ANTES do loop\nwhile (i <= 5) {           // enquanto o i for menor ou igual a 5...\n  console.log(i);          // ...mostra o i...\n  i++;                     // ...e avança a contagem (NÃO esqueça disto!)\n}\n// no console aparece: 1, 2, 3, 4 e 5",
                    },
                    {
                        type: "text",
                        value: "Compare com o `for`: as **mesmas três partes** continuam ali, só que espalhadas. A **inicialização** (`let i = 1`) foi para **antes** do loop; a **condição** (`i <= 5`) ficou nos parênteses; e o **incremento** (`i++`) foi para **dentro** do bloco, escrito à mão por você. É justamente esse `i++` manual que exige atenção, como veremos já já.\n\n## `for` ou `while`? Lado a lado\n\nOs dois trechos abaixo fazem **exatamente a mesma coisa**. Isso mostra que, no fundo, `for` e `while` são dois jeitos de escrever a mesma ideia. Escolha o que deixar o código mais claro:",
                    },
                    {
                        type: "code",
                        value: "// Com for: as três partes numa linha só\nfor (let i = 1; i <= 3; i++) {\n  console.log(i);\n}\n\n// Com while: as três partes espalhadas, mesmo resultado\nlet j = 1;\nwhile (j <= 3) {\n  console.log(j);\n  j++;\n}\n// os dois mostram: 1, 2 e 3",
                    },
                    {
                        type: "text",
                        value: "## O perigo do loop infinito\n\nAqui mora o maior cuidado com o `while`. Lembra que o `i++` fica por **sua** conta? Se você **esquecer** de avançar o contador, a condição nunca fica falsa, e o loop **nunca para**. Isso é o temido **loop infinito**: o programa trava, repetindo para sempre, e a aba do navegador pode até congelar.\n\nO exemplo abaixo tem esse defeito de propósito. **Não rode isto:** o `i` começa em 1 e nunca muda, então `i <= 5` é eternamente verdadeiro:",
                    },
                    {
                        type: "code",
                        value: '// ATENÇÃO: loop infinito de propósito. NÃO rode este código!\nlet i = 1;\nwhile (i <= 5) {\n  console.log("repetindo para sempre...");\n  // faltou o i++ aqui! O i nunca muda, a condição nunca fica falsa.\n}\n// o console seria inundado com a mesma mensagem, sem parar',
                    },
                    {
                        type: "quote",
                        value: 'Todo loop precisa de um jeito de **acabar**. Antes de rodar um `while`, faça a si mesmo uma pergunta: "o que, aqui dentro, vai fazer a condição virar **falsa** algum dia?". No `while`, quase sempre a resposta é o **incremento do contador**. Esquecer dele é a causa número um dos loops infinitos.',
                    },
                    {
                        type: "text",
                        value: '## `do...while`: rodar pelo menos uma vez\n\nO **`do...while`** é uma variação do `while` com uma diferença sutil, mas importante: ele coloca a condição **no fim**. A estrutura é "**`do`** (faça) este bloco, **`while`** (enquanto) tal condição for verdadeira". Como o teste só acontece **depois** da primeira execução, o bloco roda **no mínimo uma vez**, aconteça o que acontecer:',
                    },
                    {
                        type: "code",
                        value: "let i = 1;\ndo {\n  console.log(i);          // roda primeiro...\n  i++;\n} while (i <= 5);          // ...e só depois testa a condição\n// no console aparece: 1, 2, 3, 4 e 5",
                    },
                    {
                        type: "text",
                        value: "## A diferença que aparece nos casos-limite\n\nQuando a condição já começa **verdadeira**, `while` e `do...while` se comportam igual. A diferença aparece quando a condição já começa **falsa**. Repare: o `while` testa antes, vê que é falso e **não roda nada**; o `do...while` roda uma vez **antes** de testar, então mostra algo mesmo assim:",
                    },
                    {
                        type: "code",
                        value: '// A condição já começa falsa (10 não é menor que 5)\nlet n = 10;\n\nwhile (n < 5) {\n  console.log("while:", n);\n}\n// o while NÃO mostra nada: testou antes e a condição já era falsa\n\ndo {\n  console.log("do...while:", n);\n} while (n < 5);\n// o do...while mostra uma vez: do...while: 10',
                    },
                    {
                        type: "table",
                        value: '[["","`while`","`do...while`"],["Onde testa a condição","No **início**, antes de cada volta","No **fim**, depois de cada volta"],["Roda no mínimo","**Zero** vez (pode nem rodar)","**Uma** vez, garantido"],["Melhor para","Repetir só se a condição já valer","Quando algo precisa acontecer ao menos uma vez"]]',
                    },
                    {
                        type: "text",
                        value: '## Quando usar cada um\n\nNa prática, o **`while`** é o mais comum: use-o quando o bloco **só deve rodar se** a condição já for verdadeira (por exemplo, "enquanto ainda houver itens na lista"). O **`do...while`** brilha quando você precisa **fazer algo pelo menos uma vez e depois decidir se repete**, como pedir uma senha ao usuário: você mostra o pedido uma vez e repete só se ele errar. E, quando você **sabe o número exato** de repetições, muitas vezes o `for` da aula anterior continua sendo a escolha mais limpa.',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** o **`while`** repete **enquanto** uma condição for verdadeira e a testa **antes** de cada volta (pode não rodar nenhuma vez). O **`do...while`** testa **no fim**, então roda **pelo menos uma vez**. Nos dois, o **incremento** do contador fica por sua conta: esquecê-lo causa o **loop infinito**, que trava o programa. Sempre garanta que a condição vai virar **falsa** em algum momento.",
                    },
                ],
                questions: [
                    {
                        statement: "O que a palavra `while` significa e faz num loop?",
                        difficulty: "facil",
                        options: [
                            {
                                text: 'Significa "enquanto": repete o bloco enquanto a condição for verdadeira.',
                                isCorrect: true,
                            },
                            {
                                text: 'Significa "pare": encerra o programa na hora.',
                                isCorrect: false,
                            },
                            {
                                text: 'Significa "uma vez": roda o bloco só uma vez.',
                                isCorrect: false,
                            },
                            {
                                text: 'Significa "talvez": roda o bloco de forma aleatória.',
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que é um loop infinito?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um loop que roda exatamente uma vez.",
                                isCorrect: false,
                            },
                            {
                                text: "Um loop cuja condição nunca fica falsa, então ele nunca para e pode travar o programa.",
                                isCorrect: true,
                            },
                            {
                                text: "Um loop que só funciona com números.",
                                isCorrect: false,
                            },
                            {
                                text: "Um loop que sempre conta de trás para frente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a principal diferença entre o `while` e o `do...while`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O `while` só funciona com texto; o `do...while`, só com números.",
                                isCorrect: false,
                            },
                            {
                                text: "O `do...while` testa a condição no fim, então roda pelo menos uma vez; o `while` testa antes e pode não rodar nenhuma vez.",
                                isCorrect: true,
                            },
                            {
                                text: "Não há diferença: são dois nomes para a mesma coisa.",
                                isCorrect: false,
                            },
                            {
                                text: "O `while` é mais rápido porque não usa contador.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No `while`, o que costuma causar um loop infinito por descuido?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Usar `console.log` dentro do loop.",
                                isCorrect: false,
                            },
                            {
                                text: "Escrever a condição entre parênteses.",
                                isCorrect: false,
                            },
                            {
                                text: "Esquecer de avançar o contador (o `i++`) dentro do bloco, fazendo a condição nunca virar falsa.",
                                isCorrect: true,
                            },
                            {
                                text: "Colocar chaves `{ }` ao redor do bloco.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se a condição de um loop já começa **falsa**, quantas vezes cada bloco roda?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O `while` roda uma vez e o `do...while`, nenhuma.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dois rodam uma vez.",
                                isCorrect: false,
                            },
                            {
                                text: "O `while` não roda nenhuma vez; o `do...while` roda uma vez, porque só testa no fim.",
                                isCorrect: true,
                            },
                            {
                                text: "Os dois entram em loop infinito.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "break e continue",
                blocks: [
                    {
                        type: "text",
                        value: "# `break` e `continue`\n\nVocê já sabe montar loops com `for` e `while`. Agora vamos ganhar um controle mais fino sobre eles com dois comandos curtinhos e poderosos: o **`break`** e o **`continue`**.\n\nAté aqui, quando um loop começava, ele ia até o fim respeitando só a condição. Com o `break` e o `continue`, você passa a **interferir no meio do caminho**: parar tudo mais cedo ou pular uma volta específica. São duas ferramentas que aparecem o tempo todo no dia a dia de quem programa.",
                    },
                    {
                        type: "quote",
                        value: "O **`break`** **sai do loop na hora**: assim que ele é executado, a repetição termina e o programa segue para depois do loop. Já o **`continue`** **pula o resto da volta atual** e vai direto para a **próxima**, sem sair do loop. Numa frase: o `break` **abandona** o loop; o `continue` apenas **pula uma volta**.",
                    },
                    {
                        type: "text",
                        value: "## `break`: parar tudo na hora\n\nPense no `break` como o **botão de parada de emergência** de uma esteira: no instante em que alguém aperta, tudo para. Dentro de um loop, quando o JavaScript encontra um `break`, ele **abandona a repetição imediatamente**, mesmo que a condição ainda fosse verdadeira e ainda faltassem voltas.\n\nNo exemplo abaixo, o loop iria de 1 a 10, mas mandamos ele parar assim que o `i` chega a 5:",
                    },
                    {
                        type: "code",
                        value: 'for (let i = 1; i <= 10; i++) {\n  if (i === 5) {\n    break;                 // chegou no 5? sai do loop agora\n  }\n  console.log(i);\n}\nconsole.log("Acabou.");\n// no console aparece: 1, 2, 3, 4 e, por fim, Acabou.',
                    },
                    {
                        type: "text",
                        value: "Repare que o `5` **não** apareceu: quando o `i` virou 5, o `break` foi executado **antes** do `console.log(i)`, e o loop terminou ali. Os números 6, 7, 8, 9 e 10 nem chegaram a acontecer. O programa pulou direto para a linha de depois do loop.\n\n## Um uso real do `break`: procurar e parar\n\nO `break` é perfeito para quando você **procura uma coisa** e, ao **encontrá-la**, não precisa mais continuar. Imagine varrer uma lista de nomes atrás de um deles: assim que achar, pode parar de procurar. Continuar seria desperdício.",
                    },
                    {
                        type: "code",
                        value: 'const nomes = ["Ana", "Bruno", "Carla", "Diego"];\nconst procurado = "Carla";\n\nfor (let i = 0; i < nomes.length; i++) {\n  if (nomes[i] === procurado) {\n    console.log("Achei na posição", i);\n    break;                 // encontrou: não precisa olhar o resto\n  }\n  console.log("Ainda procurando...");\n}\n// no console aparece:\n// Ainda procurando...   (olhou Ana)\n// Ainda procurando...   (olhou Bruno)\n// Achei na posição 2    (encontrou Carla e parou)',
                    },
                    {
                        type: "text",
                        value: '## `continue`: pular esta volta\n\nO **`continue`** é mais delicado que o `break`. Em vez de encerrar o loop, ele apenas **abandona a volta atual** e salta para a **próxima**. É como dizer "esta aqui não me interessa, vamos para a seguinte". O loop **não** termina; só aquela passagem é interrompida.\n\nVeja como imprimir só os números **ímpares** de 1 a 10, usando o `continue` para **pular** os pares:',
                    },
                    {
                        type: "code",
                        value: "for (let i = 1; i <= 10; i++) {\n  if (i % 2 === 0) {         // se o i for par...\n    continue;                // ...pula esta volta e vai para a próxima\n  }\n  console.log(i);\n}\n// no console aparece: 1, 3, 5, 7 e 9 (só os ímpares)",
                    },
                    {
                        type: "text",
                        value: 'O truque ali é o `i % 2 === 0`, que pergunta "o resto da divisão de `i` por 2 é zero?", ou seja, "o `i` é par?". Quando é, o `continue` entra em ação e **pula** o `console.log(i)` daquela volta, indo direto para o `i++` e a próxima repetição. Quando o `i` é ímpar, o `continue` não roda, e o número é impresso normalmente.\n\n## Outro exemplo: pulando os múltiplos de 3\n\nA mesma ideia serve para pular qualquer coisa. Aqui listamos os números de 1 a 10, mas **pulando** os que são múltiplos de 3 (o 3, o 6 e o 9):',
                    },
                    {
                        type: "code",
                        value: "for (let i = 1; i <= 10; i++) {\n  if (i % 3 === 0) {\n    continue;                // pula 3, 6 e 9\n  }\n  console.log(i);\n}\n// no console aparece: 1, 2, 4, 5, 7, 8 e 10",
                    },
                    {
                        type: "table",
                        value: '[["Comando","O que faz","O loop continua?"],["`break`","Sai do loop imediatamente","Não: o loop termina de vez"],["`continue`","Pula o resto da volta atual","Sim: segue na próxima volta"]]',
                    },
                    {
                        type: "text",
                        value: "## `break` e `continue` também valem no `while`\n\nEsses dois comandos não são exclusividade do `for`: funcionam **dentro de qualquer loop**, inclusive no `while`. Aqui, um `while` que contaria até 100, mas o `break` corta a brincadeira assim que o `i` passa de 3:",
                    },
                    {
                        type: "code",
                        value: "let i = 1;\nwhile (i <= 100) {\n  if (i > 3) {\n    break;                 // passou de 3? encerra o while\n  }\n  console.log(i);\n  i++;\n}\n// no console aparece: 1, 2 e 3",
                    },
                    {
                        type: "text",
                        value: "## Cuidado com o `continue` no `while`\n\nUm alerta útil: no `while`, o `continue` pula direto para o teste da condição. Se o seu **incremento** (`i++`) estiver **depois** do `continue`, ele acaba sendo pulado também, e você cai num loop infinito sem querer. Por isso, no `while`, garanta que o contador avance **antes** de um possível `continue`. Nessas horas, o `for` (que já tem o incremento embutido) costuma ser mais seguro.",
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** o **`break`** **encerra o loop na hora** (ótimo para "procurar e parar"), enquanto o **`continue`** apenas **pula a volta atual** e segue para a próxima (ótimo para "ignorar certos casos"). Os dois funcionam tanto no `for` quanto no `while`. Cuidado especial com o `continue` no `while`: se ele pular o incremento do contador, vira loop infinito.',
                    },
                ],
                questions: [
                    {
                        statement: "O que o comando `break` faz dentro de um loop?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Sai do loop imediatamente, encerrando a repetição.",
                                isCorrect: true,
                            },
                            {
                                text: "Reinicia o loop do começo.",
                                isCorrect: false,
                            },
                            {
                                text: "Deixa o loop duas vezes mais rápido.",
                                isCorrect: false,
                            },
                            {
                                text: "Cria uma nova variável contadora.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "E o comando `continue`, o que faz?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Encerra o programa inteiro.",
                                isCorrect: false,
                            },
                            {
                                text: "Pula o resto da volta atual e vai para a próxima volta.",
                                isCorrect: true,
                            },
                            {
                                text: "Sai do loop de vez.",
                                isCorrect: false,
                            },
                            {
                                text: "Repete a volta atual para sempre.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No loop `for (let i = 1; i <= 10; i++)`, existe um `if (i === 4) { break; }` **antes** do `console.log(i)`. O que é impresso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "1, 2, 3 (para ao chegar no 4, sem imprimi-lo).",
                                isCorrect: true,
                            },
                            {
                                text: "1, 2, 3, 4.",
                                isCorrect: false,
                            },
                            {
                                text: "4, 5, 6, 7, 8, 9 e 10.",
                                isCorrect: false,
                            },
                            {
                                text: "Todos os números de 1 a 10.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre o `break` e o `continue`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não há diferença: os dois saem do loop.",
                                isCorrect: false,
                            },
                            {
                                text: "O `break` sai do loop de vez; o `continue` só pula a volta atual e segue repetindo.",
                                isCorrect: true,
                            },
                            {
                                text: "O `break` só funciona no `while` e o `continue` só no `for`.",
                                isCorrect: false,
                            },
                            {
                                text: "O `break` pula uma volta e o `continue` encerra o loop.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que usar `continue` num `while` exige atenção redobrada?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque o `continue` não funciona em loops `while`.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque, se o incremento do contador vier depois do `continue`, ele é pulado e o loop pode virar infinito.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o `continue` apaga o valor do contador.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o `while` transforma o `continue` em `break` automaticamente.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Percorrendo com for...of",
                blocks: [
                    {
                        type: "text",
                        value: "# Percorrendo com `for...of`\n\nUma das tarefas mais comuns em programação é **percorrer** uma coleção: passar por **cada item** de um array, um de cada vez, para fazer algo com ele. Você já viu que dá para fazer isso com o `for` tradicional e um contador. Agora vamos conhecer um jeito **mais moderno e mais simples**: o **`for...of`**.\n\nO grande charme do `for...of` é que ele te entrega **diretamente cada item**, sem você precisar se preocupar com índice, com `length` nem com contador. Menos peças para acertar, código mais limpo.",
                    },
                    {
                        type: "quote",
                        value: 'O **`for...of`** percorre, um por um, os **itens** de um array (ou os **caracteres** de uma string), entregando cada valor direto para você. A leitura é quase uma frase em inglês: "for each item of the array" (para cada item do array). Diferente do `for` clássico, aqui **não existe índice nem contador** para gerenciar.',
                    },
                    {
                        type: "text",
                        value: "## Relembrando: o `for` clássico num array\n\nAntes de mostrar o jeito novo, vale ver o jeito antigo para comparar. Para percorrer um array com o `for` tradicional, a gente usa um contador `i` como **índice** e acessa cada item com `array[i]`. O `array.length` (o **tamanho** do array) diz até onde ir:",
                    },
                    {
                        type: "code",
                        value: 'const frutas = ["maçã", "banana", "uva"];\n\nfor (let i = 0; i < frutas.length; i++) {\n  console.log(frutas[i]);\n}\n// no console aparece: maçã, banana e uva',
                    },
                    {
                        type: "text",
                        value: "Funciona bem, mas repare em quanta coisa você precisa acertar: criar o `i`, começar no `0`, lembrar do `< frutas.length`, fazer o `i++` e ainda escrever `frutas[i]`. É fácil escorregar num detalhe (começar no 1, usar `<=` sem querer) e pegar o item errado ou passar do fim do array.\n\n## O jeito moderno: `for...of`\n\nAgora o mesmo resultado com `for...of`. Compare a diferença: sumiu o índice, sumiu o `length`, sumiu o `frutas[i]`. Você declara uma variável para **o item da vez** e o loop cuida do resto:",
                    },
                    {
                        type: "code",
                        value: 'const frutas = ["maçã", "banana", "uva"];\n\nfor (const fruta of frutas) {\n  console.log(fruta);\n}\n// no console aparece: maçã, banana e uva (igualzinho, com bem menos código)',
                    },
                    {
                        type: "text",
                        value: '## A anatomia do `for...of`\n\nA estrutura é curtinha: `for (const item of colecao)`. Vamos ler cada pedaço:\n\n- **`const item`**: cria uma variável que, **a cada volta**, guarda **um item** da coleção. Aqui a gente costuma usar `const`, porque dentro da volta esse valor não muda.\n- **`of`**: a palavrinha-chave que liga a variável à coleção. É ela que diferencia o `for...of` do `for` comum.\n- **`colecao`**: o array (ou a string) que você quer percorrer.\n\nNa primeira volta, o `item` vale o primeiro elemento; na segunda, o segundo; e assim até o último. Quando os itens acabam, o loop termina sozinho, sem você precisar dizer "até quando".',
                    },
                    {
                        type: "text",
                        value: "## Percorrendo os caracteres de uma string\n\nUma sacada bacana: o `for...of` não serve só para arrays. Ele também percorre uma **string** letra por letra, tratando cada **caractere** como um item. Isso é ótimo para examinar um texto de perto:",
                    },
                    {
                        type: "code",
                        value: 'const palavra = "Olá";\n\nfor (const letra of palavra) {\n  console.log(letra);\n}\n// no console aparece, em três linhas: O, l e á',
                    },
                    {
                        type: "text",
                        value: "## Um exemplo útil: somando uma lista de números\n\nAssim como fizemos com o `for`, dá para **acumular** um resultado percorrendo um array. Aqui somamos todas as notas de uma lista. Repare como o código fica direto ao ponto, focado só no que importa: pegar cada `nota` e juntar no `total`.",
                    },
                    {
                        type: "code",
                        value: 'const notas = [8, 6, 10, 7];\nlet total = 0;\n\nfor (const nota of notas) {\n  total = total + nota;\n}\nconsole.log("Soma das notas:", total);\n// no console aparece: Soma das notas: 31',
                    },
                    {
                        type: "table",
                        value: '[["","`for` clássico","`for...of`"],["O que você controla","Índice, condição e incremento","Nada: só o item da vez"],["Como acessa o item","`array[i]`","A própria variável (`item`)"],["Precisa do `length`?","Sim","Não"],["Melhor para","Quando você precisa do índice","Percorrer os valores, de forma simples"]]',
                    },
                    {
                        type: "text",
                        value: '## Então o `for` clássico virou lixo?\n\nNada disso! O `for...of` é mais simples para o caso mais comum ("me dê cada item"), e por isso costuma ser a primeira escolha. Mas o `for` clássico ainda é muito útil quando você **precisa do índice** (a posição do item), quando quer pular de 2 em 2 ou percorrer de trás para frente. Veja uma situação em que saber a **posição** importa, e o `for` clássico se encaixa melhor:',
                    },
                    {
                        type: "code",
                        value: 'const alunos = ["Ana", "Bruno", "Carla"];\n\n// Aqui a POSIÇÃO importa (queremos numerar a lista), então o for clássico cai bem\nfor (let i = 0; i < alunos.length; i++) {\n  console.log(i + 1, "-", alunos[i]);\n}\n// no console aparece:\n// 1 - Ana\n// 2 - Bruno\n// 3 - Carla',
                    },
                    {
                        type: "text",
                        value: "## Parabéns por concluir o Módulo 5!\n\nQue jornada! Neste módulo você ensinou o computador a **repetir** tarefas, uma das coisas mais poderosas da programação. Você conheceu o **`for`** (quando sabe quantas vezes), o **`while`** e o **`do...while`** (quando repete por uma condição), aprendeu a controlar o fluxo com **`break`** e **`continue`** e, por fim, viu o jeito moderno de percorrer coleções com o **`for...of`**.\n\nO melhor a fazer agora é **praticar no console**: crie um array com seus filmes favoritos e percorra com `for...of`; faça uma contagem regressiva com `for`; some os números de 1 a 100 com um loop. Quanto mais você brincar, mais natural fica. Até o próximo módulo!",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** o **`for...of`** percorre os **itens** de um array ou os **caracteres** de uma string, entregando cada valor direto, **sem índice nem contador** (`for (const item of colecao)`). Ele é o jeito mais simples para o caso mais comum. Quando você precisa da **posição** (o índice), quer pular itens ou ir de trás para frente, o **`for` clássico** continua sendo a ferramenta certa.",
                    },
                ],
                questions: [
                    {
                        statement: "Para que serve o `for...of`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Para percorrer, um por um, os itens de um array (ou os caracteres de uma string).",
                                isCorrect: true,
                            },
                            {
                                text: "Para somar dois números quaisquer.",
                                isCorrect: false,
                            },
                            {
                                text: "Para mudar a cor de fundo da página.",
                                isCorrect: false,
                            },
                            {
                                text: "Para criar uma condição `if`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No `for...of`, o que você NÃO precisa gerenciar, ao contrário do `for` clássico?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O índice e o contador: o `for...of` entrega o item diretamente.",
                                isCorrect: true,
                            },
                            {
                                text: "As chaves `{ }` do bloco.",
                                isCorrect: false,
                            },
                            {
                                text: "A palavra `console.log`.",
                                isCorrect: false,
                            },
                            {
                                text: "O nome que você dá à variável.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'O que o loop `for (const letra of "Oi") { console.log(letra); }` imprime?',
                        difficulty: "medio",
                        options: [
                            {
                                text: 'O texto "Oi" de uma vez só, numa linha.',
                                isCorrect: false,
                            },
                            {
                                text: "`O` e `i`, um em cada linha.",
                                isCorrect: true,
                            },
                            {
                                text: "O número 2 (o tamanho da palavra).",
                                isCorrect: false,
                            },
                            {
                                text: "Um erro, porque `for...of` não funciona com strings.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Dado `const cores = ["azul", "verde"]`, qual código imprime cada cor usando `for...of`?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "`for (let i = 0; i < cores.length; i++) { console.log(i); }`",
                                isCorrect: false,
                            },
                            {
                                text: "`for (const cor of cores) { console.log(cor); }`",
                                isCorrect: true,
                            },
                            {
                                text: "`for (cor in cores) { console.log(cor); }`",
                                isCorrect: false,
                            },
                            {
                                text: "`for...of cores { console.log(cor); }`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em qual situação o `for` clássico ainda é mais adequado que o `for...of`?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Quando você quer apenas ler cada item, sem mais nada.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando você precisa saber a posição (o índice) de cada item, ou pular de 2 em 2.",
                                isCorrect: true,
                            },
                            {
                                text: "Quando o array tem só um item.",
                                isCorrect: false,
                            },
                            {
                                text: "Nunca: o `for...of` substitui o `for` clássico em todos os casos.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Funções",
        aulas: [
            {
                titulo: "O que são funções",
                blocks: [
                    {
                        type: "text",
                        value: "# O que são funções\n\nVocê já percorreu um bom caminho: sabe guardar valores em variáveis e dar ordens ao computador, linha por linha. Até aqui, o seu código era uma sequência de instruções que roda uma vez, de cima para baixo. Neste módulo você vai aprender a **empacotar** um pedaço de código, dar um **nome** a ele e mandá-lo rodar quantas vezes quiser. Esse pacote com nome é uma **função**.\n\nAs funções são uma das ideias mais importantes de toda a programação. Elas deixam o seu código **organizado**, **reutilizável** e muito mais fácil de entender. Vamos com calma, do começo.",
                    },
                    {
                        type: "quote",
                        value: "Uma **função** é um **bloco de código com um nome**, que você escreve **uma vez** e pode **executar quantas vezes quiser**. Em vez de repetir as mesmas linhas em vários lugares, você as guarda dentro de uma função e, sempre que precisar, apenas **chama** essa função pelo nome.",
                    },
                    {
                        type: "text",
                        value: "## O problema da repetição\n\nImagine que, em vários pontos do seu programa, você precisa dar as boas-vindas a alguém mostrando três mensagens. Sem funções, você acaba **copiando e colando** as mesmas linhas toda vez:",
                    },
                    {
                        type: "code",
                        value: '// Boas-vindas (primeira vez)\nconsole.log("Olá!");\nconsole.log("Seja bem-vindo.");\nconsole.log("Bom te ver por aqui.");\n\n// Boas-vindas de novo, em outra parte do programa (as MESMAS três linhas)\nconsole.log("Olá!");\nconsole.log("Seja bem-vindo.");\nconsole.log("Bom te ver por aqui.");\n\n// no console aparecem seis linhas, com as três mensagens repetidas',
                    },
                    {
                        type: "text",
                        value: 'Copiar e colar assim traz três problemas: o código fica **maior** e mais cansativo de ler; se um dia você quiser **mudar** a mensagem, precisa alterar em **todos** os lugares (e é fácil esquecer um); e a **intenção** do código fica menos clara. As funções resolvem tudo isso de uma vez.\n\nPense numa **receita de bolo**. Você escreve a receita **uma vez**, com o passo a passo, e dá um nome a ela: "bolo de cenoura". Depois, sempre que quiser o bolo, não reescreve a receita inteira: apenas diz "fazer o bolo de cenoura". A função é exatamente isso, uma receita guardada com um nome, pronta para ser executada quando você chamar.',
                    },
                    {
                        type: "text",
                        value: '## Declarando uma função com `function`\n\nPara criar uma função, usamos a palavra-chave `function`. A estrutura básica tem quatro partes:\n\n- a palavra `function`, que avisa "vou criar uma função";\n- um **nome** para a função (você escolhe, de preferência um verbo que diga o que ela faz);\n- um par de **parênteses** `()` (por enquanto vazios; eles vão importar na próxima aula);\n- um par de **chaves** `{ }` que envolve o **corpo** da função, ou seja, as linhas que ela executa.',
                    },
                    {
                        type: "code",
                        value: '// Declarando (criando) a função chamada saudar\nfunction saudar() {\n  console.log("Olá!");\n  console.log("Seja bem-vindo.");\n  console.log("Bom te ver por aqui.");\n}\n\n// Repare: nada apareceu no console ainda!\n// Declarar a função apenas a GUARDA na memória; não executa o corpo dela.',
                    },
                    {
                        type: "text",
                        value: "## Chamar (invocar) a função\n\nDeclarar a função é como escrever a receita e guardá-la na gaveta: o bolo ainda não foi feito. Para a função **rodar de verdade**, você precisa **chamá-la** (também se diz **invocar**). Chamar é simples: escreva o **nome** da função seguido dos **parênteses** `()`.",
                    },
                    {
                        type: "code",
                        value: 'function saudar() {\n  console.log("Olá!");\n  console.log("Seja bem-vindo.");\n  console.log("Bom te ver por aqui.");\n}\n\nsaudar(); // aqui a função é chamada: agora sim o corpo roda\nsaudar(); // e podemos chamá-la de novo, quantas vezes quisermos\n\n// no console aparecem as três mensagens DUAS vezes (uma por chamada):\n// Olá!\n// Seja bem-vindo.\n// Bom te ver por aqui.\n// Olá!\n// Seja bem-vindo.\n// Bom te ver por aqui.',
                    },
                    {
                        type: "text",
                        value: "## Declarar não é executar\n\nEssa é a confusão mais comum de quem começa, então vale reforçar. Existem **dois momentos** distintos:\n\n- **Declarar** a função (`function saudar() { ... }`): você só a **define** e guarda. O corpo **não** roda agora.\n- **Chamar** a função (`saudar()`): aqui o JavaScript vai até a função e **executa** o corpo dela, linha por linha.\n\nSem os parênteses da chamada, a função nunca roda. Escrever apenas `saudar` (sem o `()`) não executa nada: só se refere à função.",
                    },
                    {
                        type: "code",
                        value: '// Uma função que "carimba" uma linha separadora\nfunction separador() {\n  console.log("--------------------");\n}\n\nconsole.log("Relatório de vendas");\nseparador();\nconsole.log("Total: R$ 1200");\nseparador();\n\n// no console aparece:\n// Relatório de vendas\n// --------------------\n// Total: R$ 1200\n// --------------------',
                    },
                    {
                        type: "text",
                        value: "## Por que as funções são tão úteis\n\nRecapitulando as vantagens que já apareceram nos exemplos:\n\n- **Evitam repetição**: você escreve a lógica uma vez e reaproveita com uma simples chamada.\n- **Facilitam a manutenção**: para mudar o comportamento, você edita **um lugar só**, o corpo da função, e todas as chamadas passam a usar a versão nova.\n- **Organizam o código**: dar um nome a um bloco (`saudar`, `separador`, `calcularTotal`) transforma um monte de linhas soltas em uma **ação com significado**.\n- **Escondem a complexidade**: quem chama `saudar()` não precisa saber **como** ela funciona por dentro, só o que ela faz.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Sem função","Com função"],["Repetir a lógica","Copiar e colar as mesmas linhas","Chamar `saudar()` quantas vezes quiser"],["Mudar o comportamento","Editar em todos os lugares","Editar só o corpo da função"],["Ler o código","Muitas linhas soltas","Um nome claro que diz a intenção"],["Chance de erro","Alta (é fácil esquecer um trecho)","Baixa (a lógica mora num lugar só)"]]',
                    },
                    {
                        type: "text",
                        value: "## Um bom nome faz diferença\n\nPor convenção, nomes de função costumam ser **verbos** (ou começar com um), porque uma função representa uma **ação**: `saudar`, `calcularTotal`, `mostrarMenu`, `enviarEmail`. Quando o nome tem mais de uma palavra, usamos o estilo **camelCase**: a primeira palavra em minúsculas e as seguintes com a inicial maiúscula, sem espaços (`calcularTotal`).\n\nUm bom nome faz o código quase se explicar sozinho: ao ler `mostrarMenu()`, você já sabe o que vai acontecer, sem precisar abrir a função para conferir.",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** uma **função** é um **bloco de código com um nome**, que você **declara** com a palavra `function` e **executa** ao **chamá-la** pelo nome seguido de `()`. Declarar apenas guarda a função; só a **chamada** roda o corpo dela. Funções **evitam repetição**, **facilitam a manutenção** e **organizam** o programa, dando um nome claro a cada ação. Por convenção, o nome é um **verbo** em **camelCase**.",
                    },
                ],
                questions: [
                    {
                        statement: "O que é uma função em JavaScript?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um bloco de código com um nome, que você escreve uma vez e pode executar quantas vezes quiser.",
                                isCorrect: true,
                            },
                            {
                                text: "Um tipo de variável que só guarda números.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma tag do HTML que estiliza a página.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma cor especial aplicada ao texto do site.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Como se chama (executa) uma função chamada `saudar`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Escrevendo `function saudar` de novo.",
                                isCorrect: false,
                            },
                            {
                                text: "Escrevendo `saudar()`, o nome seguido dos parênteses.",
                                isCorrect: true,
                            },
                            {
                                text: "Escrevendo `call saudar`.",
                                isCorrect: false,
                            },
                            {
                                text: "Escrevendo `saudar[]`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece quando você apenas declara uma função, mas nunca a chama?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O corpo dela roda uma vez, automaticamente.",
                                isCorrect: false,
                            },
                            {
                                text: "O corpo dela roda repetidamente, num laço infinito.",
                                isCorrect: false,
                            },
                            {
                                text: "Nada do corpo dela roda: declarar só guarda a função na memória.",
                                isCorrect: true,
                            },
                            {
                                text: "O JavaScript acusa um erro por ter uma função não usada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a principal vantagem de usar uma função em vez de copiar e colar as mesmas linhas em vários lugares?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A página passa a carregar mais rápido para o visitante.",
                                isCorrect: false,
                            },
                            {
                                text: "Evita repetição: você escreve a lógica uma vez e, para alterá-la, edita um só lugar.",
                                isCorrect: true,
                            },
                            {
                                text: "O texto do site fica automaticamente colorido.",
                                isCorrect: false,
                            },
                            {
                                text: "O código deixa de precisar de ponto e vírgula.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Considere o código a seguir: `function apitar() { console.log("bip"); }` e depois duas chamadas `apitar();` `apitar();`. O que aparece no console?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`bip` uma única vez, mesmo com duas chamadas.",
                                isCorrect: false,
                            },
                            {
                                text: "`bip` duas vezes, uma para cada chamada da função.",
                                isCorrect: true,
                            },
                            {
                                text: "`apitar` duas vezes, o nome da função.",
                                isCorrect: false,
                            },
                            {
                                text: "Nada, porque a função não devolve nenhum valor.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Parâmetros, argumentos e return",
                blocks: [
                    {
                        type: "text",
                        value: "# Parâmetros, argumentos e return\n\nNa aula anterior, a nossa função `saudar` fazia sempre **exatamente a mesma coisa**: mostrava as mesmas três mensagens. Útil, mas limitado. E se quiséssemos saudar cada pessoa **pelo nome**? Ou uma função que some **quaisquer** dois números, e não sempre os mesmos?\n\nPara isso, as funções sabem fazer duas coisas novas que você aprende agora: **receber valores de entrada** (para trabalhar com dados diferentes a cada chamada) e **devolver um resultado** para quem as chamou. São os **parâmetros** e o `return`.",
                    },
                    {
                        type: "quote",
                        value: "Um **parâmetro** é uma **entrada** da função: um nome que representa um valor que virá de fora, informado no momento da chamada. O `return` é a **saída**: o **resultado** que a função **devolve** para quem a chamou. Entra por um lado, sai pelo outro, como uma máquina que recebe ingredientes e entrega um produto.",
                    },
                    {
                        type: "text",
                        value: "## Passando valores de entrada\n\nLembra dos **parênteses** `()` que, na aula passada, ficavam vazios? É dentro deles que declaramos os **parâmetros**: nomes que a função vai usar para se referir aos valores recebidos. Pense numa máquina de suco: você coloca **uma fruta** (a entrada) e ela trabalha com a fruta que você colocou, seja laranja ou uva.\n\nVeja uma saudação que recebe um parâmetro chamado `nome`:",
                    },
                    {
                        type: "code",
                        value: 'function saudar(nome) {\n  console.log("Olá, " + nome + "! Seja bem-vindo.");\n}\n\nsaudar("Ana");   // no console aparece: Olá, Ana! Seja bem-vindo.\nsaudar("Bruno"); // no console aparece: Olá, Bruno! Seja bem-vindo.',
                    },
                    {
                        type: "text",
                        value: '## Parâmetro x argumento\n\nEssas duas palavras andam juntas e é comum confundi-las, mas a diferença é simples:\n\n- O **parâmetro** é o nome que aparece na **declaração** da função, dentro dos parênteses. No exemplo, `nome` é o parâmetro. Ele é como uma **caixa vazia** esperando um valor.\n- O **argumento** é o **valor de verdade** que você passa na **chamada**. Em `saudar("Ana")`, o texto `"Ana"` é o argumento. É o que vai **dentro** da caixa.\n\nOu seja: você **declara com parâmetros** e **chama com argumentos**. Na hora da chamada, o argumento é copiado para dentro do parâmetro, e a função roda usando esse valor.',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Parâmetro","Argumento"],["Onde aparece","Na declaração da função","Na chamada da função"],["O que é","Um nome (uma caixa vazia)","O valor de verdade"],["Exemplo","`function dobro(n)`","`dobro(5)`"],["Quando existe","Ao escrever a função","Ao executar a função"]]',
                    },
                    {
                        type: "text",
                        value: "## Vários parâmetros\n\nUma função pode receber **quantos parâmetros quiser**, separados por **vírgula**. E a **ordem importa**: o primeiro argumento da chamada vira o primeiro parâmetro, o segundo vira o segundo, e assim por diante.",
                    },
                    {
                        type: "code",
                        value: 'function somar(a, b) {\n  console.log(a + b);\n}\n\nsomar(2, 3);   // no console aparece: 5\nsomar(10, 25); // no console aparece: 35\n\n// A ORDEM importa: o 1º argumento vira "a", o 2º vira "b"\nfunction subtrair(a, b) {\n  console.log(a - b);\n}\nsubtrair(10, 3); // no console aparece: 7  (10 - 3)\nsubtrair(3, 10); // no console aparece: -7 (3 - 10)',
                    },
                    {
                        type: "text",
                        value: "## Parâmetro com valor padrão\n\nE se a função for chamada **sem** um argumento que ela esperava? Por padrão, aquele parâmetro fica `undefined` (um valor especial que representa a ausência de valor), e o resultado pode não ser o desejado. Para evitar isso, dá para definir um **valor padrão** (default): um valor que o parâmetro assume **quando nenhum argumento é passado**. Escreve-se com um `=` ao lado do parâmetro.",
                    },
                    {
                        type: "code",
                        value: 'function saudar(nome = "visitante") {\n  console.log("Olá, " + nome + "!");\n}\n\nsaudar("Ana"); // no console aparece: Olá, Ana!\nsaudar();      // no console aparece: Olá, visitante!  (usou o valor padrão)',
                    },
                    {
                        type: "text",
                        value: "## Devolvendo um resultado com `return`\n\nAté agora, as nossas funções **mostravam** coisas na tela com `console.log`, mas não **devolviam** nada para o programa. Muitas vezes, porém, a gente quer que a função **calcule** um valor e o **entregue de volta**, para guardarmos numa variável ou usarmos em outra conta. Para isso existe a palavra-chave `return`.\n\nQuando o JavaScript encontra um `return`, ele **encerra** a função e manda o valor indicado **de volta** para o ponto onde ela foi chamada. É como a máquina de suco finalmente **entregando o copo** na sua mão.",
                    },
                    {
                        type: "code",
                        value: "function somar(a, b) {\n  return a + b; // devolve o resultado, em vez de só imprimir\n}\n\n// O valor devolvido pode ser guardado numa variável...\nconst total = somar(2, 3);\nconsole.log(total); // no console aparece: 5\n\n// ...ou usado direto em outra expressão\nconsole.log(somar(10, 5) * 2); // no console aparece: 30  (15 * 2)",
                    },
                    {
                        type: "text",
                        value: '## O que acontece depois do `return`\n\nUm detalhe essencial: o `return` **encerra a função na hora**. Qualquer linha escrita **depois** dele, dentro da função, **não é executada**. É como o "fim" da receita: entregou o resultado, acabou.',
                    },
                    {
                        type: "code",
                        value: 'function testar() {\n  console.log("Esta linha roda.");\n  return "resultado";\n  console.log("Esta linha NUNCA roda, pois vem depois do return.");\n}\n\nconst r = testar();\nconsole.log(r);\n\n// no console aparece:\n// Esta linha roda.\n// resultado',
                    },
                    {
                        type: "text",
                        value: "## Mostrar na tela x devolver um valor\n\nNão confunda as duas coisas, porque é outra dúvida clássica:\n\n- `console.log(valor)` apenas **mostra** o valor na tela. Ótimo para você acompanhar o que acontece, mas o programa **não fica com** esse valor para reaproveitar.\n- `return valor` **devolve** o valor para o programa. Ele não aparece na tela sozinho, mas pode ser **guardado** e **reutilizado**.\n\nUma função que faz um cálculo geralmente deve **retornar** o resultado (assim quem chamou decide o que fazer com ele), e não imprimi-lo por conta própria. Se, ao chamar `somar(2, 3)`, nada aparece na tela, não é um erro: o valor foi **devolvido**, e cabe a você mostrá-lo com um `console.log`, se quiser.",
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** os **parâmetros** são as **entradas** que a função declara dentro dos `()`; os **argumentos** são os **valores reais** passados na chamada. Um parâmetro pode ter um **valor padrão** (`nome = "visitante"`), usado quando nenhum argumento é informado. O `return` **devolve** um resultado para quem chamou e **encerra** a execução ali: nada depois dele roda. Lembre-se: `console.log` **mostra** na tela; `return` **devolve** um valor para o programa usar.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Na função `function dobro(n) { return n * 2; }`, o que é o `n`?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um parâmetro: a entrada que a função recebe.",
                                isCorrect: true,
                            },
                            {
                                text: "O resultado que a função devolve.",
                                isCorrect: false,
                            },
                            {
                                text: "O nome da função.",
                                isCorrect: false,
                            },
                            {
                                text: "Um comentário dentro da função.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que a palavra `return` faz numa função?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Repete a função desde o início.",
                                isCorrect: false,
                            },
                            {
                                text: "Devolve um resultado para quem chamou a função.",
                                isCorrect: true,
                            },
                            {
                                text: "Apaga a função da memória.",
                                isCorrect: false,
                            },
                            {
                                text: "Mostra o resultado numa caixa de alerta na tela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'Na chamada `saudar("Ana")`, o texto `"Ana"` é o quê?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "O parâmetro da função.",
                                isCorrect: false,
                            },
                            {
                                text: "O argumento: o valor passado na chamada.",
                                isCorrect: true,
                            },
                            {
                                text: "O nome da função.",
                                isCorrect: false,
                            },
                            {
                                text: "O valor de retorno da função.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Para que serve o valor padrão em `function saudar(nome = "visitante")`?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Define o valor que `nome` assume quando a função é chamada sem argumento.",
                                isCorrect: true,
                            },
                            {
                                text: 'Obriga a sempre passar exatamente o texto "visitante".',
                                isCorrect: false,
                            },
                            {
                                text: "Impede que a função receba qualquer argumento.",
                                isCorrect: false,
                            },
                            {
                                text: "Faz a função rodar duas vezes automaticamente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Considere: `function calcular(a, b) { return a * b; console.log("fim"); }` e depois `console.log(calcular(4, 5));`. O que aparece no console?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: 'Apenas `20`; a linha com "fim" não roda, pois vem depois do return.',
                                isCorrect: true,
                            },
                            {
                                text: "`20` e, na linha seguinte, `fim`.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas `fim`.",
                                isCorrect: false,
                            },
                            {
                                text: "O texto `4 * 5`, sem calcular.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Arrow functions",
                blocks: [
                    {
                        type: "text",
                        value: '# Arrow functions\n\nVocê já sabe declarar funções com a palavra `function`. Agora vamos conhecer uma **segunda forma** de escrever funções, mais curta e muito usada no JavaScript moderno: a **arrow function** (em português, "função de seta"), que ganha esse nome por causa do símbolo `=>`, uma setinha.\n\nVocê vai encontrar arrow functions o tempo todo em códigos por aí, então vale entender bem como elas funcionam. A boa notícia: a ideia é a mesma de sempre, só a **escrita** muda.',
                    },
                    {
                        type: "quote",
                        value: "Uma **arrow function** é uma forma mais **enxuta** de escrever uma função, usando o símbolo `=>` no lugar da palavra `function`. Ela quase sempre é **guardada numa variável** (com `const`) e, quando o corpo é curto, permite uma escrita bem compacta, com **retorno automático**.",
                    },
                    {
                        type: "text",
                        value: '## Função guardada numa variável\n\nAntes da seta, um passo importante: no JavaScript, uma função também é um **valor**, como um número ou um texto. Isso significa que dá para **guardar uma função dentro de uma variável**, usando `const`. Quando fazemos isso, dizemos que a função é uma **function expression** (uma função "expressão").\n\nRepare que, aqui, a função não tem nome próprio depois de `function`: quem dá nome a ela é a **variável**. Para chamá-la, usamos o nome da variável seguido de `()`, como sempre.',
                    },
                    {
                        type: "code",
                        value: '// Uma função guardada na variável saudar\nconst saudar = function () {\n  console.log("Olá!");\n};\n\nsaudar(); // no console aparece: Olá!',
                    },
                    {
                        type: "text",
                        value: "## A sintaxe da arrow function\n\nA arrow function nasce de uma function expression com dois ajustes: a gente **remove** a palavra `function` e **coloca** o símbolo `=>` entre os parênteses e as chaves. Veja a mesma saudação, agora como arrow function:",
                    },
                    {
                        type: "code",
                        value: '// A MESMA função, agora como arrow function\nconst saudar = () => {\n  console.log("Olá!");\n};\n\nsaudar(); // no console aparece: Olá!\n\n// Comparando as duas escritas:\n// const saudar = function () { ... };  <- function expression\n// const saudar = () => { ... };        <- arrow function',
                    },
                    {
                        type: "text",
                        value: "## Arrow function com parâmetros\n\nOs **parâmetros** funcionam igualzinho: vão dentro dos parênteses, antes da seta. Tudo o que você aprendeu sobre parâmetros, argumentos e valores padrão continua valendo aqui.",
                    },
                    {
                        type: "code",
                        value: "const somar = (a, b) => {\n  return a + b;\n};\n\nconsole.log(somar(2, 3)); // no console aparece: 5",
                    },
                    {
                        type: "text",
                        value: "## Forma curta: retorno implícito\n\nAqui está o charme das arrow functions. Quando o corpo é **uma única expressão** cujo valor você quer devolver, dá para **abrir mão das chaves `{ }` e da palavra `return`**: o valor da expressão é retornado **automaticamente**. Isso se chama **retorno implícito**.\n\nCompare a forma longa com a forma curta; as duas fazem **exatamente a mesma coisa**:",
                    },
                    {
                        type: "code",
                        value: "// Forma longa: com chaves e return explícito\nconst somar = (a, b) => {\n  return a + b;\n};\n\n// Forma curta: sem chaves e sem return (retorno implícito)\nconst somarCurto = (a, b) => a + b;\n\nconsole.log(somar(2, 3));      // no console aparece: 5\nconsole.log(somarCurto(2, 3)); // no console aparece: 5",
                    },
                    {
                        type: "text",
                        value: "## Um parâmetro só: parênteses opcionais\n\nMais um encurtamento: quando a arrow function tem **exatamente um** parâmetro, os parênteses ao redor dele são **opcionais**. As duas primeiras linhas abaixo são equivalentes. Só cuidado: sem **nenhum** parâmetro, os parênteses vazios continuam **obrigatórios**.",
                    },
                    {
                        type: "code",
                        value: 'const dobro = (n) => n * 2; // com parênteses\nconst triplo = n => n * 3;  // sem parênteses (um parâmetro só)\n\nconsole.log(dobro(5));  // no console aparece: 10\nconsole.log(triplo(5)); // no console aparece: 15\n\n// Sem NENHUM parâmetro, os parênteses vazios são obrigatórios:\nconst oi = () => console.log("oi");\noi(); // no console aparece: oi',
                    },
                    {
                        type: "table",
                        value: '[["Forma","Como se escreve","Observação"],["Declaração","`function somar(a, b) { return a + b; }`","Tem nome próprio; a forma clássica"],["Function expression","`const somar = function (a, b) { return a + b; };`","Guardada numa variável"],["Arrow (longa)","`const somar = (a, b) => { return a + b; };`","Usa `=>` e chaves"],["Arrow (curta)","`const somar = (a, b) => a + b;`","Retorno implícito, sem chaves nem return"]]',
                    },
                    {
                        type: "text",
                        value: "## Quando usar cada forma\n\nAs duas formas criam funções que se comportam de maneira muito parecida, e a escolha é, em boa parte, questão de **estilo** e de **contexto**:\n\n- A **declaração** com `function` é ótima para funções **nomeadas** e mais longas.\n- As **arrow functions** brilham em funções **curtas** e, principalmente, quando precisamos passar uma função **para outra função** (os famosos _callbacks_, que aparecem muito ao trabalhar com listas e com cliques). Você vai usá-las bastante em breve.\n\nPor enquanto, não se preocupe em decorar regras. O que mais importa agora é saber **ler as duas formas** e escrever do jeito que achar mais claro. Com a prática, a escolha vira algo natural.",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** uma **arrow function** usa o símbolo `=>` no lugar da palavra `function` e costuma ser guardada numa variável (`const somar = (a, b) => { ... }`). Quando o corpo é uma **única expressão**, dá para omitir as chaves e o `return`, ganhando o **retorno implícito** (`const somar = (a, b) => a + b;`). Com **um** parâmetro, os parênteses são opcionais; com **nenhum**, são obrigatórios. Declaração e arrow são duas formas de escrever funções: o importante, por ora, é saber **ler e usar** as duas.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual símbolo é a marca registrada de uma arrow function?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`=>`",
                                isCorrect: true,
                            },
                            {
                                text: "`->`",
                                isCorrect: false,
                            },
                            {
                                text: "`=`",
                                isCorrect: false,
                            },
                            {
                                text: "`>>`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Onde as arrow functions costumam ser guardadas para que possamos chamá-las depois?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Dentro de um comentário.",
                                isCorrect: false,
                            },
                            {
                                text: "Dentro de uma variável, por exemplo com `const`.",
                                isCorrect: true,
                            },
                            {
                                text: "Dentro de uma tag `<style>`.",
                                isCorrect: false,
                            },
                            {
                                text: "Dentro do título da página.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual das arrow functions abaixo usa retorno implícito (sem a palavra `return` escrita)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`const somar = (a, b) => a + b;`",
                                isCorrect: true,
                            },
                            {
                                text: "`const somar = (a, b) => { return a + b; };`",
                                isCorrect: false,
                            },
                            {
                                text: "`const somar = function (a, b) { return a + b; };`",
                                isCorrect: false,
                            },
                            {
                                text: "`function somar(a, b) { return a + b; }`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na arrow function `const dobro = n => n * 2;`, por que os parênteses ao redor de `n` puderam ser omitidos?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque arrow functions nunca usam parênteses.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque há exatamente um parâmetro, e nesse caso os parênteses são opcionais.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque `n` é um número, e números dispensam parênteses.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a função não tem a palavra return.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Dada a arrow function `const triplo = n => n * 3;`, qual é o valor de `triplo(4)`?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "12, porque o retorno implícito devolve o resultado de `n * 3`.",
                                isCorrect: true,
                            },
                            {
                                text: "7, somando 4 com 3.",
                                isCorrect: false,
                            },
                            {
                                text: "34, juntando o 3 com o 4.",
                                isCorrect: false,
                            },
                            {
                                text: "undefined, porque falta a palavra return.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Escopo de variáveis",
                blocks: [
                    {
                        type: "text",
                        value: '# Escopo de variáveis\n\nVocê já criou variáveis e já escreveu funções. Falta juntar as duas ideias e responder a uma pergunta importante: uma variável criada **dentro** de uma função pode ser usada **fora** dela? A resposta tem a ver com um conceito chamado **escopo**, o tema desta aula, que fecha o módulo de funções.\n\nEntender escopo evita uma penca de erros confusos do tipo "essa variável existe, por que o JavaScript diz que não?". Vamos destrinchar isso com calma.',
                    },
                    {
                        type: "quote",
                        value: "**Escopo** é a **região do código onde uma variável existe** e pode ser usada. Uma variável declarada **dentro** de uma função é **local**: só existe ali dentro e desaparece quando a função termina. Uma variável declarada **fora** de todas as funções é **global**: existe no programa inteiro.",
                    },
                    {
                        type: "text",
                        value: "## Variável local\n\nUma variável declarada **dentro** de uma função (com `let` ou `const`) é chamada de **local**. Ela nasce quando a função é chamada e **só existe dentro daquela função**. Lá fora, é como se ela nunca tivesse existido.\n\nUma analogia: pense na função como uma **sala** com um quadro branco. Você entra, anota um número no quadro, usa esse número enquanto está na sala e, ao sair, o quadro é **apagado**. Quem está do lado de fora nunca viu o que você escreveu.",
                    },
                    {
                        type: "code",
                        value: "function calcular() {\n  const resultado = 2 + 3; // variável LOCAL: só existe aqui dentro\n  console.log(resultado);  // no console aparece: 5\n}\n\ncalcular();\n\n// Tentar usar resultado aqui fora dá erro:\nconsole.log(resultado);\n// no console aparece um erro em vermelho:\n// Uncaught ReferenceError: resultado is not defined",
                    },
                    {
                        type: "text",
                        value: '## Variável global\n\nJá uma variável declarada **fora** de qualquer função, no "corpo principal" do programa, é **global**. Ela existe em todo lugar e pode ser lida **de dentro** das funções também. Voltando à analogia: é como um cartaz no **corredor** do prédio, que qualquer sala consegue enxergar.',
                    },
                    {
                        type: "code",
                        value: 'const site = "ensina.dev"; // variável GLOBAL\n\nfunction mostrarSite() {\n  // de dentro da função, enxergamos a variável global sem problema\n  console.log("Bem-vindo ao " + site);\n}\n\nmostrarSite();     // no console aparece: Bem-vindo ao ensina.dev\nconsole.log(site); // no console aparece: ensina.dev  (também funciona aqui fora)',
                    },
                    {
                        type: "text",
                        value: "## Por que a variável de dentro não vaza para fora\n\nIsso pode parecer uma limitação chata, mas é uma das melhores qualidades das funções. Como cada função tem o seu **próprio espaço**, as variáveis locais de uma **não colidem** com as de outra, mesmo que tenham o **mesmo nome**. Cada `total` vive na sua própria sala, sem interferir no `total` da sala ao lado.\n\nIsso deixa as funções **independentes** e **seguras**: você pode escrever uma função sem medo de que os nomes usados lá dentro atrapalhem o resto do programa.",
                    },
                    {
                        type: "code",
                        value: 'function precoA() {\n  const total = 10; // este total só existe dentro de precoA\n  console.log("A:", total);\n}\n\nfunction precoB() {\n  const total = 99; // um total totalmente diferente, dentro de precoB\n  console.log("B:", total);\n}\n\nprecoA(); // no console aparece: A: 10\nprecoB(); // no console aparece: B: 99\n// os dois total não se misturam: cada um vive na sua função',
                    },
                    {
                        type: "text",
                        value: "## Escopo de bloco: `let` e `const`\n\nO escopo não vale só para funções. Com `let` e `const`, a variável fica presa ao **bloco** onde foi declarada, ou seja, ao trecho entre as chaves `{ }` mais próximas. Isso inclui o bloco de um `if`, de um `for` e afins. Fora daquele bloco, a variável não existe.",
                    },
                    {
                        type: "code",
                        value: 'if (true) {\n  let mensagem = "oi"; // existe só dentro deste bloco { } do if\n  console.log(mensagem); // no console aparece: oi\n}\n\n// aqui fora, o bloco do if já fechou e a variável não existe mais\nconsole.log(mensagem);\n// no console aparece um erro:\n// Uncaught ReferenceError: mensagem is not defined',
                    },
                    {
                        type: "text",
                        value: "## Uma nota sobre o `var`\n\nTalvez você encontre por aí um jeito antigo de declarar variáveis: a palavra `var`. Além de outras diferenças, o `var` **não respeita o escopo de bloco**: uma variável criada com `var` dentro de um `if` **vaza** para fora do bloco, o que costuma gerar confusão e bugs.\n\nÉ justamente por isso que, hoje, preferimos `let` e `const`: eles têm um escopo mais previsível, preso ao bloco. Guarde só o essencial: **use `let` e `const`; evite `var`**.",
                    },
                    {
                        type: "code",
                        value: "// Com var, a variável VAZA do bloco (comportamento antigo e confuso):\nif (true) {\n  var x = 10;\n}\nconsole.log(x); // no console aparece: 10  (o var escapou do if!)\n\n// Com let ou const, isso daria erro, que é o comportamento mais seguro.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Variável local","Variável global"],["Onde é declarada","Dentro de uma função ou bloco","Fora de todas as funções"],["Onde pode ser usada","Só ali dentro","No programa inteiro"],["Quando desaparece","Quando a função ou o bloco termina","Enquanto o programa estiver rodando"],["Palavra recomendada","`let` / `const`","`let` / `const` (evite `var`)"]]',
                    },
                    {
                        type: "text",
                        value: "## Boas práticas de escopo\n\nUma regra de ouro que os programadores seguem: **declare cada variável no menor escopo possível**. Ou seja, se um valor só é usado dentro de uma função, crie-o **dentro** dela, e não como global. Variáveis globais demais deixam o programa difícil de entender (qualquer parte do código pode mexer nelas) e aumentam a chance de conflitos de nome.\n\nPrefira **`const`** sempre que o valor não mudar, use **`let`** quando precisar reatribuir, e mantenha cada variável perto de onde ela é usada. Assim, o escopo trabalha a seu favor.",
                    },
                    {
                        type: "text",
                        value: "## Parabéns por concluir o Módulo 6!\n\nQue módulo importante você fechou! Agora você sabe **criar funções** com `function`, passar **parâmetros** e receber **argumentos**, **devolver** resultados com `return`, escrever **arrow functions** com `=>` e entender onde cada variável vive, graças ao **escopo**. As funções são a base de praticamente tudo o que vem pela frente.\n\nO melhor jeito de fixar é **praticar** no console: crie funções suas (uma que calcule a área de um retângulo, outra que diga se um número é par), chame-as com valores diferentes e observe os resultados. Nos próximos módulos, você vai usar funções o tempo todo, inclusive para trabalhar com **listas** e para fazer a página **reagir** a cliques. Até lá!",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** **escopo** é a região onde uma variável existe. Variáveis declaradas dentro de uma função são **locais** (só valem ali e somem quando a função termina); as declaradas fora de tudo são **globais** (valem no programa inteiro). Com `let` e `const`, o escopo é de **bloco**: a variável vive apenas dentro das `{ }` onde nasceu, e por isso uma variável criada dentro da função não existe fora dela. Evite `var` (que vaza do bloco) e declare cada variável no **menor escopo possível**.",
                    },
                ],
                questions: [
                    {
                        statement: 'O que é o "escopo" de uma variável?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "A região do código onde a variável existe e pode ser usada.",
                                isCorrect: true,
                            },
                            {
                                text: "A cor com que a variável aparece no editor.",
                                isCorrect: false,
                            },
                            {
                                text: "O tipo de valor que a variável guarda.",
                                isCorrect: false,
                            },
                            {
                                text: "O número de letras do nome da variável.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma variável declarada com `const` dentro de uma função é chamada de quê?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Local, porque só existe dentro daquela função.",
                                isCorrect: true,
                            },
                            {
                                text: "Global, porque existe no programa inteiro.",
                                isCorrect: false,
                            },
                            {
                                text: "Pública, porque qualquer função pode alterá-la.",
                                isCorrect: false,
                            },
                            {
                                text: "Permanente, porque nunca é apagada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Considere: `function f() { const x = 5; }` e depois `f();` `console.log(x);`. O que acontece na última linha?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Mostra `5`, o valor guardado em `x`.",
                                isCorrect: false,
                            },
                            {
                                text: "Mostra `undefined`.",
                                isCorrect: false,
                            },
                            {
                                text: "Dá um erro (ReferenceError), pois `x` é local e não existe fora da função.",
                                isCorrect: true,
                            },
                            {
                                text: "Mostra a letra `x`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que uma variável global pode ser usada dentro de uma função, mas uma variável local não pode ser usada fora dela?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque variáveis globais são processadas mais rápido.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o escopo global abrange todo o programa (inclusive o interior das funções), enquanto o escopo local fica restrito ao interior da função.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque funções não conseguem ter variáveis próprias.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque variáveis locais só funcionam em arrow functions.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um trecho declara `var x = 1;` dentro de um `if` e, fora do `if`, `console.log(x)` mostra `1`. Se trocarmos `var` por `let`, o que passa a acontecer nesse `console.log(x)` de fora?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Passa a dar erro, porque `let` tem escopo de bloco e `x` deixa de existir fora do `if`.",
                                isCorrect: true,
                            },
                            {
                                text: "Continua mostrando `1`, sem nenhuma diferença.",
                                isCorrect: false,
                            },
                            {
                                text: "Passa a mostrar `undefined`.",
                                isCorrect: false,
                            },
                            {
                                text: "Passa a mostrar `0`.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Arrays",
        aulas: [
            {
                titulo: "O que são arrays",
                blocks: [
                    {
                        type: "text",
                        value: "# O que são arrays\n\nBem-vindo ao Módulo 7! Até aqui, cada variável que você criou guardava **um único valor**: um nome, uma idade, um preço. Mas a vida real é cheia de **coleções**: a sua lista de compras, os nomes dos alunos de uma turma, as músicas de uma playlist, as notas de uma prova. Guardar cada item numa variável separada seria um pesadelo.\n\nÉ exatamente para isso que existe o **array**: uma forma de guardar **vários valores dentro de uma única variável**, organizados em ordem. Se você entende o que é uma **lista de compras**, você já entende a ideia central de um array. Vamos com calma, do zero.",
                    },
                    {
                        type: "quote",
                        value: "Um **array** é uma **lista ordenada de valores**. Você o cria com **colchetes** `[]`, separando os itens por vírgula. Cada item ocupa uma **posição**, chamada de **índice**, e essa contagem começa no **zero** (`0`), não no um. Para pegar um item, você usa o número da posição dele; e o `length` diz **quantos** itens a lista tem.",
                    },
                    {
                        type: "text",
                        value: "## O problema que os arrays resolvem\n\nImagine que você precise guardar o nome de três frutas. Com o que você sabe até agora, faria três variáveis soltas:",
                    },
                    {
                        type: "code",
                        value: 'let fruta1 = "maçã";\nlet fruta2 = "banana";\nlet fruta3 = "uva";\n\n// E se fossem 100 frutas? Seriam 100 variáveis...',
                    },
                    {
                        type: "text",
                        value: "Repare no incômodo: são três variáveis com nomes quase iguais, e nada as conecta, o computador não sabe que elas formam **um grupo**. Se amanhã forem cem frutas, o plano desanda. O array resolve isso juntando tudo numa **única** variável, que é uma lista:",
                    },
                    {
                        type: "code",
                        value: 'let frutas = ["maçã", "banana", "uva"];\n\nconsole.log(frutas);\n// no console aparece: ["maçã", "banana", "uva"]',
                    },
                    {
                        type: "text",
                        value: "## Criando um array com `[]`\n\nO sinal que dá origem a um array são os **colchetes** `[` e `]` (a tecla costuma ficar perto do Enter). Dentro deles, você lista os valores separados por **vírgula**. Um array pode guardar textos, números ou até uma mistura, e também pode nascer **vazio**, para ser preenchido depois:",
                    },
                    {
                        type: "code",
                        value: 'let nomes = ["Ana", "Bruno", "Carla"];   // três textos\nlet idades = [23, 31, 19];                // três números\nlet vazio = [];                           // um array vazio, sem itens ainda\n\nconsole.log(idades);\n// no console aparece: [23, 31, 19]',
                    },
                    {
                        type: "text",
                        value: '## Cada item tem uma posição: o índice\n\nAqui mora o detalhe mais importante (e o que mais confunde no começo): dentro do array, cada item tem um **número de posição**, chamado **índice**, e essa contagem **começa no zero**. Ou seja, o **primeiro** item é o de índice `0`, o segundo é o `1`, o terceiro é o `2`, e assim por diante.\n\nPense numa fila de pessoas em que o primeiro da fila recebe a plaquinha número **0**. Estranho no início, mas é assim que praticamente toda linguagem de programação conta. Veja a lista `["maçã", "banana", "uva"]` com os seus índices:',
                    },
                    {
                        type: "table",
                        value: '[["Índice (posição)","Valor"],["`0`","maçã"],["`1`","banana"],["`2`","uva"]]',
                    },
                    {
                        type: "text",
                        value: '## Acessando um item pelo índice\n\nPara pegar um item específico, você escreve o nome do array seguido do **índice entre colchetes**. É como dizer "me dê o item da posição tal":',
                    },
                    {
                        type: "code",
                        value: 'let frutas = ["maçã", "banana", "uva"];\n\nconsole.log(frutas[0]);   // no console aparece: maçã   (o primeiro!)\nconsole.log(frutas[1]);   // no console aparece: banana\nconsole.log(frutas[2]);   // no console aparece: uva    (o último)',
                    },
                    {
                        type: "text",
                        value: 'Como a contagem começa no `0`, o índice do **último** item é sempre **um a menos** que a quantidade de itens: a nossa lista tem três frutas, mas o último mora no índice `2`. E se você pedir uma posição que **não existe**, o JavaScript não quebra, ele apenas responde `undefined`, uma palavra especial que significa "aqui não tem valor nenhum":',
                    },
                    {
                        type: "code",
                        value: 'let frutas = ["maçã", "banana", "uva"];\n\nconsole.log(frutas[5]);\n// no console aparece: undefined  (não existe item na posição 5)',
                    },
                    {
                        type: "text",
                        value: "## Quantos itens tem? O `length`\n\nTodo array sabe informar o próprio tamanho através de `length` (comprimento, em inglês). Você escreve o nome do array, um ponto e `length`, sem parênteses. O resultado é a **quantidade de itens**:",
                    },
                    {
                        type: "code",
                        value: 'let frutas = ["maçã", "banana", "uva"];\n\nconsole.log(frutas.length);\n// no console aparece: 3\n\nlet vazio = [];\nconsole.log(vazio.length);   // no console aparece: 0',
                    },
                    {
                        type: "text",
                        value: "O `length` é muito útil combinado com o que vimos: como o último índice é sempre `length - 1`, dá para pegar o **último item** de qualquer lista, mesmo sem saber de cor o tamanho dela:",
                    },
                    {
                        type: "code",
                        value: 'let frutas = ["maçã", "banana", "uva"];\n\nlet ultimoIndice = frutas.length - 1;   // 3 - 1 = 2\nconsole.log(frutas[ultimoIndice]);      // no console aparece: uva',
                    },
                    {
                        type: "text",
                        value: "## Modificando um item\n\nUm array não é fixo: você pode **trocar** o valor de uma posição. Basta acessar aquele índice e usar o sinal de igual `=` para atribuir um novo valor, exatamente como faz com uma variável comum. O item antigo é substituído:",
                    },
                    {
                        type: "code",
                        value: 'let frutas = ["maçã", "banana", "uva"];\n\nfrutas[1] = "manga";   // troca o item da posição 1\n\nconsole.log(frutas);\n// no console aparece: ["maçã", "manga", "uva"]',
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** um **array** é uma **lista ordenada de valores**, criada com colchetes `[]` e itens separados por vírgula. Cada item tem um **índice** que começa em `0`, então o primeiro item é `array[0]` e o último é `array[array.length - 1]`. O `length` informa **quantos** itens existem, pedir um índice inexistente devolve `undefined`, e você **modifica** um item atribuindo um novo valor à sua posição (`array[1] = "novo"`).',
                    },
                ],
                questions: [
                    {
                        statement: "O que é um array em JavaScript?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma lista ordenada de vários valores guardados numa única variável.",
                                isCorrect: true,
                            },
                            {
                                text: "Um comando que apaga variáveis da memória.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma forma de deixar o texto colorido na tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Um valor único, como um só número ou um só texto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Como se cria um array vazio em JavaScript?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`()`",
                                isCorrect: false,
                            },
                            {
                                text: "`{}`",
                                isCorrect: false,
                            },
                            {
                                text: "`[]`",
                                isCorrect: true,
                            },
                            {
                                text: "`<>`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Na lista `let cores = ["azul", "verde", "rosa"]`, o que `cores[0]` devolve?',
                        difficulty: "medio",
                        options: [
                            {
                                text: '`"verde"`',
                                isCorrect: false,
                            },
                            {
                                text: "`undefined`",
                                isCorrect: false,
                            },
                            {
                                text: '`"rosa"`',
                                isCorrect: false,
                            },
                            {
                                text: '`"azul"`',
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Se um array tem 4 itens, quanto vale o seu `length`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`3`",
                                isCorrect: false,
                            },
                            {
                                text: "`4`",
                                isCorrect: true,
                            },
                            {
                                text: "`5`",
                                isCorrect: false,
                            },
                            {
                                text: "`0`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Você tem `let lista = ["a", "b", "c", "d"]` e quer pegar o ÚLTIMO item sem contar na mão. Qual expressão funciona sempre?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`lista[lista.length - 1]`",
                                isCorrect: true,
                            },
                            {
                                text: "`lista[lista.length]`",
                                isCorrect: false,
                            },
                            {
                                text: "`lista[-1]`",
                                isCorrect: false,
                            },
                            {
                                text: "`lista.last()`",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Adicionar e remover itens",
                blocks: [
                    {
                        type: "text",
                        value: "# Adicionar e remover itens\n\nNa aula anterior, você criou arrays e aprendeu a olhar e trocar itens pelo índice. Mas listas de verdade **mudam de tamanho o tempo todo**: você adiciona um produto ao carrinho, risca um item da lista de compras, entra uma pessoa nova na fila. Nesta aula, você vai aprender os métodos que fazem o array **crescer e encolher**.\n\nA boa notícia é que o JavaScript já traz tudo pronto, com nomes curtos. Vamos conhecer quatro deles para mexer nas **pontas** da lista (`push`, `pop`, `shift`, `unshift`) e dois mais espertos para mexer no **meio** (`indexOf` e `splice`).",
                    },
                    {
                        type: "quote",
                        value: "`push` e `pop` trabalham no **fim** da lista: `push` **adiciona** um item no final e `pop` **remove** o último. `unshift` e `shift` fazem o mesmo no **começo**: `unshift` adiciona no início e `shift` remove o primeiro. Já `indexOf` **descobre a posição** de um valor, e `splice` **insere ou remove** itens em qualquer lugar. Todos eles **alteram o array original**, uma ideia chamada **mutação**.",
                    },
                    {
                        type: "text",
                        value: "## Adicionar no fim: `push`\n\nO método mais usado é o `push` (empurrar, em inglês). Ele **acrescenta** um item **no final** do array. Você escreve o nome da lista, um ponto, `push` e, entre parênteses, o valor a adicionar:",
                    },
                    {
                        type: "code",
                        value: 'let carrinho = ["camiseta", "boné"];\n\ncarrinho.push("tênis");\n\nconsole.log(carrinho);\n// no console aparece: ["camiseta", "boné", "tênis"]',
                    },
                    {
                        type: "text",
                        value: "Uma curiosidade: o `push` **devolve o novo tamanho** da lista depois de adicionar. Isso às vezes é útil, mas o mais importante é o efeito: a lista ficou maior.",
                    },
                    {
                        type: "code",
                        value: "let numeros = [10, 20];\n\nlet tamanho = numeros.push(30);\n\nconsole.log(numeros);   // no console aparece: [10, 20, 30]\nconsole.log(tamanho);   // no console aparece: 3  (o novo length)",
                    },
                    {
                        type: "text",
                        value: "## Remover do fim: `pop`\n\nO par do `push` é o `pop`. Ele faz o contrário: **remove o último item** da lista e ainda **devolve** esse item removido, caso você queira usá-lo. Repare que o `pop` não leva nada entre os parênteses, ele sempre tira do fim:",
                    },
                    {
                        type: "code",
                        value: 'let pilha = ["base", "meio", "topo"];\n\nlet removido = pilha.pop();\n\nconsole.log(removido);   // no console aparece: topo   (o que saiu)\nconsole.log(pilha);      // no console aparece: ["base", "meio"]',
                    },
                    {
                        type: "text",
                        value: "Uma imagem ajuda a fixar: pense numa **pilha de pratos**. Você coloca um prato novo **em cima** (`push`) e, quando precisa de um, tira o **de cima** também (`pop`). Você sempre mexe pelo topo, ou seja, pelo fim da lista.",
                    },
                    {
                        type: "text",
                        value: "## Mexendo no começo: `unshift` e `shift`\n\nE se você quiser adicionar ou remover no **início** da lista? Para isso existe a outra dupla:\n\n- `unshift` **adiciona** um item no **começo**, empurrando os demais para a frente.\n- `shift` **remove** o **primeiro** item e o devolve, puxando os outros uma posição para trás.\n\nOs nomes são menos intuitivos, mas o jeito de usar é igualzinho ao do `push` e do `pop`:",
                    },
                    {
                        type: "code",
                        value: 'let fila = ["Bruno", "Carla"];\n\nfila.unshift("Ana");   // Ana fura a fila e vai para o começo\nconsole.log(fila);     // no console aparece: ["Ana", "Bruno", "Carla"]\n\nlet primeiro = fila.shift();   // o primeiro da fila é atendido e sai\nconsole.log(primeiro);         // no console aparece: Ana\nconsole.log(fila);             // no console aparece: ["Bruno", "Carla"]',
                    },
                    {
                        type: "table",
                        value: '[["Método","Ponta que mexe","O que faz","O que devolve"],["`push`","Fim","Adiciona um item","O novo tamanho"],["`pop`","Fim","Remove o último item","O item removido"],["`unshift`","Início","Adiciona um item","O novo tamanho"],["`shift`","Início","Remove o primeiro item","O item removido"]]',
                    },
                    {
                        type: "text",
                        value: "## Uma ideia importante: mutação\n\nVocê deve ter notado uma coisa: em nenhum momento a gente criou uma lista nova. O `push`, o `pop`, o `shift` e o `unshift` **modificam o próprio array original**, ali mesmo. A palavra técnica para isso é **mutação**: dizemos que esses métodos **mutam** a lista.\n\nParece um detalhe, mas é fundamental. Depois de um `carrinho.push(...)`, a variável `carrinho` **não é a mesma de antes**: ela mudou por dentro. Guarde essa ideia; mais adiante você vai conhecer métodos que fazem o oposto, deixando o original intacto e devolvendo uma lista nova.",
                    },
                    {
                        type: "code",
                        value: 'let lista = ["a", "b"];\n\nconsole.log(lista);   // antes:  ["a", "b"]\nlista.push("c");\nconsole.log(lista);   // depois: ["a", "b", "c"]  <- a MESMA lista mudou',
                    },
                    {
                        type: "text",
                        value: '## Descobrir a posição: `indexOf`\n\nÀs vezes você não sabe em que posição um valor está, e precisa descobrir. O método `indexOf` recebe um valor e devolve o **índice** onde ele aparece pela primeira vez. Se o valor **não estiver** na lista, ele devolve `-1`, um código combinado que significa "não encontrei":',
                    },
                    {
                        type: "code",
                        value: 'let frutas = ["maçã", "banana", "uva"];\n\nconsole.log(frutas.indexOf("banana"));   // no console aparece: 1\nconsole.log(frutas.indexOf("melancia")); // no console aparece: -1  (não tem)',
                    },
                    {
                        type: "text",
                        value: "## Inserir e remover em qualquer lugar: `splice`\n\nO `push` e o `pop` só mexem nas pontas. Quando você precisa remover (ou inserir) um item **no meio** da lista, entra o `splice`. Na forma mais comum, ele recebe **dois números**: a **posição** onde começar e **quantos** itens remover a partir dali:",
                    },
                    {
                        type: "code",
                        value: 'let cores = ["vermelho", "verde", "azul", "preto"];\n\n// a partir da posição 1, remove 1 item (o "verde")\ncores.splice(1, 1);\n\nconsole.log(cores);\n// no console aparece: ["vermelho", "azul", "preto"]',
                    },
                    {
                        type: "text",
                        value: "O `splice` fica ainda mais poderoso junto com o `indexOf`: primeiro você **descobre a posição** de um valor, depois **remove** exatamente aquele item, mesmo sem saber onde ele estava:",
                    },
                    {
                        type: "code",
                        value: 'let convidados = ["Ana", "Bruno", "Carla"];\n\nlet posicao = convidados.indexOf("Bruno");   // posicao = 1\nconvidados.splice(posicao, 1);               // remove o item dessa posição\n\nconsole.log(convidados);\n// no console aparece: ["Ana", "Carla"]',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** para mexer no **fim** da lista, use `push` (adiciona) e `pop` (remove o último); para o **começo**, `unshift` (adiciona) e `shift` (remove o primeiro). O `indexOf` devolve a **posição** de um valor (ou `-1` se não existir), e o `splice(posição, quantidade)` **remove ou insere** itens em qualquer ponto, combinando muito bem com o `indexOf`. Todos esses métodos **mutam** o array original, ou seja, alteram a própria lista.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual método adiciona um item no FINAL do array?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`pop`",
                                isCorrect: false,
                            },
                            {
                                text: "`push`",
                                isCorrect: true,
                            },
                            {
                                text: "`shift`",
                                isCorrect: false,
                            },
                            {
                                text: "`unshift`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o método `pop` faz?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Remove o último item do array (e o devolve).",
                                isCorrect: true,
                            },
                            {
                                text: "Adiciona um item no começo da lista.",
                                isCorrect: false,
                            },
                            {
                                text: "Conta quantos itens existem.",
                                isCorrect: false,
                            },
                            {
                                text: "Inverte a ordem dos itens.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para remover o PRIMEIRO item de uma lista, qual método você usa?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`push`",
                                isCorrect: false,
                            },
                            {
                                text: "`pop`",
                                isCorrect: false,
                            },
                            {
                                text: "`shift`",
                                isCorrect: true,
                            },
                            {
                                text: "`unshift`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'O que `["a", "b", "c"].indexOf("z")` devolve, já que "z" não está na lista?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "`0`",
                                isCorrect: false,
                            },
                            {
                                text: "`undefined`",
                                isCorrect: false,
                            },
                            {
                                text: "um erro que quebra o programa",
                                isCorrect: false,
                            },
                            {
                                text: "`-1`",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            'Depois de `let l = ["a", "b"]; l.push("c");`, o que se pode afirmar?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: 'O `push` criou uma lista nova e deixou a original como `["a", "b"]`.',
                                isCorrect: false,
                            },
                            {
                                text: 'A lista `l` foi modificada (mutada) e agora é `["a", "b", "c"]`.',
                                isCorrect: true,
                            },
                            {
                                text: '`l` continua sendo `["a", "b"]`, pois arrays nunca mudam.',
                                isCorrect: false,
                            },
                            {
                                text: "O `push` só funciona com números, então dá erro.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Percorrendo arrays",
                blocks: [
                    {
                        type: "text",
                        value: "# Percorrendo arrays\n\nVocê já sabe criar listas e mexer nos itens. Mas e quando você quer fazer algo com **cada um** dos itens? Imprimir todos os nomes de uma turma, somar todas as notas, mostrar cada produto de um catálogo... Fazer isso item por item, na mão, seria inviável numa lista grande.\n\nA solução é **percorrer** o array: passar por cada item, do primeiro ao último, repetindo a mesma ação. Nesta aula você vai ver **três jeitos** de fazer isso, do mais tradicional ao mais moderno.",
                    },
                    {
                        type: "quote",
                        value: "**Percorrer** (ou **iterar**) um array é **visitar cada item**, um de cada vez, para fazer algo com ele. Há três formas principais: o `for` **clássico** (que usa o índice para caminhar pela lista), o `for...of` (que já entrega **o valor** de cada item) e o `forEach` (que executa uma **função** para cada item da lista).",
                    },
                    {
                        type: "text",
                        value: "## O jeito clássico: `for` com índice\n\nA forma mais antiga usa o laço `for` que você já conhece, combinado com o índice. A ideia é criar um contador `i` que começa em `0` e vai crescendo até o último índice. A cada volta, você acessa o item com `array[i]`:",
                    },
                    {
                        type: "code",
                        value: 'let frutas = ["maçã", "banana", "uva"];\n\nfor (let i = 0; i < frutas.length; i++) {\n  console.log(i, frutas[i]);\n}\n\n// no console aparece, em três linhas:\n// 0 maçã\n// 1 banana\n// 2 uva',
                    },
                    {
                        type: "text",
                        value: 'Vale reler a condição com atenção: `i < frutas.length`. Como os índices vão de `0` até `length - 1`, o contador precisa parar **antes** de chegar ao `length`. Por isso usamos o "menor que" (`<`), e não o "menor ou igual". Esse `for` é ótimo quando você **precisa do número da posição** de cada item, ou quer parar no meio do caminho.',
                    },
                    {
                        type: "text",
                        value: "## Um jeito mais limpo: `for...of`\n\nNa maioria das vezes, porém, você não se importa com o número da posição, só quer **os valores**. Para esses casos existe o `for...of`, bem mais fácil de ler: ele entrega, a cada volta, **o próximo item** direto numa variável que você nomeia, sem contador nenhum:",
                    },
                    {
                        type: "code",
                        value: 'let frutas = ["maçã", "banana", "uva"];\n\nfor (let fruta of frutas) {\n  console.log(fruta);\n}\n\n// no console aparece, em três linhas:\n// maçã\n// banana\n// uva',
                    },
                    {
                        type: "text",
                        value: "Compare os dois: no `for` clássico você escreve `frutas[i]` e cuida do contador; no `for...of`, a variável `fruta` já **é** o item. Menos peças para errar, código mais limpo. A regra prática: se você **precisa do índice**, vá de `for` clássico; se só quer **os valores**, o `for...of` costuma ser a melhor escolha.",
                    },
                    {
                        type: "text",
                        value: '## `forEach`: rodar uma função em cada item\n\nO terceiro jeito é o método `forEach` ("para cada", em inglês). A ideia é diferente e muito usada: você **entrega uma função** ao `forEach`, e ele se encarrega de **chamar essa função uma vez para cada item** do array. Essa função que a gente passa para outra pessoa executar tem um nome: **callback**.\n\nNão se assuste com a palavra. Um **callback** é só uma função que você não chama você mesmo, você a **entrega** para que o `forEach` a chame no momento certo, em cada item:',
                    },
                    {
                        type: "code",
                        value: 'let frutas = ["maçã", "banana", "uva"];\n\nfrutas.forEach(function (fruta) {\n  console.log(fruta);\n});\n\n// no console aparece, em três linhas:\n// maçã\n// banana\n// uva',
                    },
                    {
                        type: "text",
                        value: 'Olhe para o `(fruta)` ali: é o **parâmetro** da função, e a cada volta ele recebe o item da vez (primeiro `"maçã"`, depois `"banana"`, depois `"uva"`). Você escolhe esse nome; poderia ser `item`, `f` ou o que fizesse sentido. O `forEach` cuida de percorrer; você só descreve **o que fazer** com cada item.',
                    },
                    {
                        type: "text",
                        value: "Se você também precisar do **índice**, o `forEach` entrega ele como um **segundo parâmetro**, depois do item. Basta declarar os dois entre os parênteses:",
                    },
                    {
                        type: "code",
                        value: 'let frutas = ["maçã", "banana", "uva"];\n\nfrutas.forEach(function (fruta, indice) {\n  console.log(indice, "->", fruta);\n});\n\n// no console aparece, em três linhas:\n// 0 -> maçã\n// 1 -> banana\n// 2 -> uva',
                    },
                    {
                        type: "text",
                        value: 'Uma analogia fecha a ideia: usar o `forEach` é como dar uma ordem a um assistente e dizer "**para cada** nome desta lista, faça isto aqui". Você não passa por cada linha manualmente; você descreve a tarefa uma vez, e ela é aplicada a todos. Muito do JavaScript moderno é escrito nesse estilo.',
                    },
                    {
                        type: "table",
                        value: '[["Forma","O que você recebe a cada volta","Melhor quando..."],["`for` clássico","O índice `i` (e você usa `array[i]`)","Precisa da posição ou quer parar no meio"],["`for...of`","Direto o valor de cada item","Só quer os valores, com código legível"],["`forEach`","Cada item (e, se quiser, o índice) numa função","Quer rodar uma função em cada item"]]',
                    },
                    {
                        type: "text",
                        value: "## Um exemplo do dia a dia: somar tudo\n\nPercorrer não serve só para imprimir. Um uso clássico é **acumular** um resultado, como somar todos os números de uma lista. A receita: criar uma variável em `0` fora do laço e ir somando cada item dentro dele:",
                    },
                    {
                        type: "code",
                        value: 'let notas = [8, 6, 10, 7];\nlet total = 0;\n\nfor (let nota of notas) {\n  total = total + nota;\n}\n\nconsole.log("Soma:", total);                  // no console aparece: Soma: 31\nconsole.log("Média:", total / notas.length);  // no console aparece: Média: 7.75',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** **percorrer** um array é visitar cada item para fazer algo com ele. O `for` **clássico** usa um índice `i` de `0` a `length - 1` e acessa `array[i]`, ideal quando você precisa da posição. O `for...of` entrega **o valor** de cada item, sem contador, e costuma ser o mais legível. O `forEach` executa uma **função (callback)** para cada item, recebendo o item (e, se quiser, o índice). E, com uma variável acumuladora, dá para **somar** ou combinar todos os itens da lista.",
                    },
                ],
                questions: [
                    {
                        statement: 'O que significa "percorrer" (ou iterar) um array?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "Apagar todos os itens de uma vez.",
                                isCorrect: false,
                            },
                            {
                                text: "Visitar cada item, um de cada vez, para fazer algo com ele.",
                                isCorrect: true,
                            },
                            {
                                text: "Deixar a lista em ordem alfabética.",
                                isCorrect: false,
                            },
                            {
                                text: "Trocar o array inteiro por um único número.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No laço `for (let fruta of frutas)`, o que a variável `fruta` recebe a cada volta?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O valor de cada item da lista.",
                                isCorrect: true,
                            },
                            {
                                text: "O índice (número da posição) de cada item.",
                                isCorrect: false,
                            },
                            {
                                text: "O tamanho total da lista.",
                                isCorrect: false,
                            },
                            {
                                text: "Sempre o primeiro item, repetido.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Num `for` clássico sobre um array, qual condição costuma controlar a parada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`i <= array`",
                                isCorrect: false,
                            },
                            {
                                text: "`i > 0`",
                                isCorrect: false,
                            },
                            {
                                text: "`array.length < i`",
                                isCorrect: false,
                            },
                            {
                                text: "`i < array.length`",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "O `forEach` precisa que você entregue a ele...",
                        difficulty: "medio",
                        options: [
                            {
                                text: "um número de posição.",
                                isCorrect: false,
                            },
                            {
                                text: "um outro array.",
                                isCorrect: false,
                            },
                            {
                                text: "uma função (callback) para rodar em cada item.",
                                isCorrect: true,
                            },
                            {
                                text: "um texto entre aspas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você quer apenas IMPRIMIR cada nome de uma lista, sem se preocupar com números de posição. Qual opção é a mais direta e legível?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Um `for` clássico com contador `i` e `frutas[i]`.",
                                isCorrect: false,
                            },
                            {
                                text: "Acessar `frutas[0]`, `frutas[1]`, `frutas[2]`... na mão.",
                                isCorrect: false,
                            },
                            {
                                text: "Não é possível imprimir os itens de um array.",
                                isCorrect: false,
                            },
                            {
                                text: "Um `for...of`, que já entrega o valor de cada item.",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Métodos poderosos",
                blocks: [
                    {
                        type: "text",
                        value: '# Métodos poderosos\n\nVocê já sabe percorrer um array na mão. Agora vem a parte que deixa o JavaScript realmente elegante: um punhado de métodos que fazem tarefas comuns, **transformar**, **filtrar** e **procurar** itens, em uma única linha, de um jeito claro e direto.\n\nA diferença de mentalidade é grande. Em vez de descrever **passo a passo** como caminhar pela lista, você diz **o que quer**: "transforme cada item", "fique só com os que passam neste teste", "ache o primeiro que serve". Vamos conhecer os quatro mais importantes: `map`, `filter`, `find` e `includes`.',
                    },
                    {
                        type: "quote",
                        value: "`map` **transforma** cada item e devolve um **novo array** do mesmo tamanho. `filter` **seleciona** os itens que passam num teste e devolve um **novo array** (igual ou menor). `find` devolve o **primeiro item** que passa no teste (ou `undefined`). E `includes` responde apenas **`true` ou `false`**: o valor existe na lista? Diferente do `push` e do `splice`, o `map`, o `filter` e o `find` **não alteram** o array original.",
                    },
                    {
                        type: "text",
                        value: "## `map`: transformar cada item\n\nO `map` (mapear) serve para **transformar** uma lista em outra. Você entrega uma função dizendo **como transformar um item**, e o `map` a aplica em todos, montando um **novo array** com os resultados, sempre do **mesmo tamanho** do original.\n\nPense numa **linha de produção**: entram maçãs de um lado, cada uma passa pela mesma máquina, e saem maçãs descascadas do outro, na mesma quantidade. Veja dobrando cada número:",
                    },
                    {
                        type: "code",
                        value: "let numeros = [1, 2, 3, 4];\n\nlet dobro = numeros.map(function (n) {\n  return n * 2;\n});\n\nconsole.log(dobro);      // no console aparece: [2, 4, 6, 8]\nconsole.log(numeros);    // no console aparece: [1, 2, 3, 4]  <- o original ficou intacto",
                    },
                    {
                        type: "text",
                        value: "Dois pontos merecem destaque. Primeiro, a função usa o `return` para dizer **no que** cada item se transforma, e esse valor entra no novo array. Segundo: o array original **não muda**, o `map` sempre cria uma lista nova. Serve para qualquer transformação, como colocar nomes em maiúsculas:",
                    },
                    {
                        type: "code",
                        value: 'let nomes = ["ana", "bruno", "carla"];\n\nlet maiusculos = nomes.map(function (nome) {\n  return nome.toUpperCase();\n});\n\nconsole.log(maiusculos);\n// no console aparece: ["ANA", "BRUNO", "CARLA"]',
                    },
                    {
                        type: "text",
                        value: "## `filter`: ficar só com alguns\n\nO `filter` (filtrar) funciona como uma **peneira**. Você entrega uma função que faz uma **pergunta de sim ou não** sobre cada item (devolvendo `true` ou `false`), e o `filter` monta um novo array **só com os itens que responderam `true`**. Os demais ficam de fora:",
                    },
                    {
                        type: "code",
                        value: "let idades = [15, 22, 17, 30, 18];\n\nlet maiores = idades.filter(function (idade) {\n  return idade >= 18;\n});\n\nconsole.log(maiores);\n// no console aparece: [22, 30, 18]  (só quem tem 18 anos ou mais)",
                    },
                    {
                        type: "text",
                        value: "Repare que o novo array pode ser **menor** que o original (aqui, cinco viraram três), porque só passam os que satisfazem a condição. Se ninguém passar, você recebe um array **vazio** `[]`. O original, de novo, continua o mesmo.",
                    },
                    {
                        type: "text",
                        value: "## `find`: achar o primeiro que serve\n\nO `filter` devolve **todos** os que passam no teste. Mas e quando você quer **apenas um**, o **primeiro** que satisfaz a condição? Aí entra o `find` (encontrar). Ele usa a mesma ideia de uma função que responde `true` ou `false`, mas devolve **o próprio item** (não um array) assim que encontra o primeiro que serve. Se nenhum servir, devolve `undefined`:",
                    },
                    {
                        type: "code",
                        value: "let numeros = [4, 9, 2, 15, 6];\n\nlet primeiroGrande = numeros.find(function (n) {\n  return n > 8;\n});\n\nconsole.log(primeiroGrande);\n// no console aparece: 9  (o primeiro maior que 8; ele para de procurar aqui)",
                    },
                    {
                        type: "text",
                        value: "Guarde bem a diferença entre os dois primos: o `filter` devolve **um array** (pode ter zero, um ou vários itens); o `find` devolve **um item só**, o primeiro que bate com a busca. Use `filter` quando quiser **todos** os que servem, e `find` quando quiser **um**.",
                    },
                    {
                        type: "text",
                        value: '## `includes`: existe ou não?\n\nÀs vezes a pergunta é ainda mais simples: "esse valor **está** na lista?". Para isso existe o `includes` (incluir), que devolve direto `true` ou `false`. É perfeito para verificações rápidas, como checar se um item já está no carrinho:',
                    },
                    {
                        type: "code",
                        value: 'let carrinho = ["camiseta", "boné", "tênis"];\n\nconsole.log(carrinho.includes("boné"));    // no console aparece: true\nconsole.log(carrinho.includes("meia"));    // no console aparece: false',
                    },
                    {
                        type: "table",
                        value: '[["Método","A função de teste faz...","O método devolve"],["`map`","transforma cada item (`return` do novo valor)","um NOVO array, do mesmo tamanho"],["`filter`","responde `true`/`false` (fica quem der `true`)","um NOVO array, igual ou menor"],["`find`","responde `true`/`false`","o PRIMEIRO item que der `true` (ou `undefined`)"],["`includes`","(recebe um valor, não uma função)","`true` ou `false`"]]',
                    },
                    {
                        type: "text",
                        value: '## Juntando tudo: encadear métodos\n\nAqui está o pulo do gato. Como o `filter` e o `map` devolvem **arrays**, você pode chamar um método **logo depois do outro**, formando uma sequência que se lê quase como uma frase. Isso se chama **encadear** (em inglês, "chaining"). Imagine uma lista de preços e você quer **os preços com 10% de desconto, só dos itens acima de 100 reais**:',
                    },
                    {
                        type: "code",
                        value: "let precos = [80, 150, 200, 50];\n\nlet comDesconto = precos\n  .filter(function (preco) { return preco > 100; })   // fica [150, 200]\n  .map(function (preco) { return preco * 0.9; });     // vira [135, 180]\n\nconsole.log(comDesconto);\n// no console aparece: [135, 180]",
                    },
                    {
                        type: "text",
                        value: "Leia a corrente de cima para baixo: começou com quatro preços, o `filter` **peneirou** os que passam de 100 (sobraram dois), e o `map` **transformou** cada um aplicando o desconto. Tudo isso sem escrever um único laço à mão. Esse estilo, de encadear métodos que descrevem **o que** você quer, é uma das marcas registradas do JavaScript moderno, e você vai reencontrá-lo muitas vezes daqui para a frente.",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** os métodos poderosos deixam você dizer **o que** quer, não o passo a passo. `map` **transforma** cada item, gerando um novo array do mesmo tamanho; `filter` **seleciona** os que passam num teste `true`/`false`, gerando um array igual ou menor; `find` devolve o **primeiro** item que passa (ou `undefined`); e `includes` responde **`true`/`false`** se um valor existe. Como `map` e `filter` devolvem arrays, dá para **encadeá-los** numa sequência limpa, e nenhum deles altera o array original.",
                    },
                ],
                questions: [
                    {
                        statement: "O que o método `map` devolve?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um único número.",
                                isCorrect: false,
                            },
                            {
                                text: "Um novo array com cada item transformado.",
                                isCorrect: true,
                            },
                            {
                                text: "O array original, modificado por dentro.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas `true` ou `false`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O `includes` devolve que tipo de resposta?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`true` ou `false` (se o valor existe ou não na lista).",
                                isCorrect: true,
                            },
                            {
                                text: "Um novo array com todos os itens.",
                                isCorrect: false,
                            },
                            {
                                text: "O primeiro item da lista.",
                                isCorrect: false,
                            },
                            {
                                text: "O tamanho da lista.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "No `filter`, quais itens entram no novo array?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Todos os itens, sempre.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas o primeiro item.",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhum: o `filter` esvazia a lista.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas os itens para os quais a função responde `true`.",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre `find` e `filter`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não há diferença: são dois nomes para o mesmo método.",
                                isCorrect: false,
                            },
                            {
                                text: "O `find` devolve um ARRAY e o `filter` devolve um item.",
                                isCorrect: false,
                            },
                            {
                                text: "O `find` devolve o PRIMEIRO item que passa no teste; o `filter` devolve um ARRAY com todos os que passam.",
                                isCorrect: true,
                            },
                            {
                                text: "O `find` altera o array original e o `filter` não.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Considere o código:\n\nlet nums = [1, 2, 3, 4];\nlet r = nums\n  .filter(function (n) { return n > 2; })\n  .map(function (n) { return n * 10; });\n\nQuanto vale `r`?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`[10, 20, 30, 40]`",
                                isCorrect: false,
                            },
                            {
                                text: "`[3, 4]`",
                                isCorrect: false,
                            },
                            {
                                text: "`[30, 40]`",
                                isCorrect: true,
                            },
                            {
                                text: "`[30, 40, 50]`",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 8 - Objetos",
        aulas: [
            {
                titulo: "O que são objetos",
                blocks: [
                    {
                        type: "text",
                        value: "# O que são objetos\n\nBem-vindo ao módulo de **objetos**, um dos assuntos mais importantes de toda a sua jornada em JavaScript. Se você chegou até aqui, já sabe guardar um valor numa **variável** e já sabe montar uma **lista** de valores com os **arrays**. Os objetos são o próximo degrau natural: eles servem para guardar **vários dados relacionados** sobre uma mesma coisa, cada um com o seu **nome**.\n\nNesta primeira aula você vai entender o que é um objeto, como criar um do zero e como pegar e mudar as informações guardadas nele. Vamos com calma, do jeito acolhedor de sempre.",
                    },
                    {
                        type: "quote",
                        value: "Um **objeto** agrupa **dados relacionados** em pares de **chave** e **valor**. Pense numa **ficha de cadastro**: cada linha tem um **rótulo** (nome, idade, e-mail) e um **preenchimento** ao lado. No objeto, o rótulo é a **chave** e o preenchimento é o **valor**. Criamos objetos com **chaves** `{}` e acessamos os dados pelo **ponto** `.` ou pelos **colchetes** `[]`.",
                    },
                    {
                        type: "text",
                        value: "## A analogia da ficha de cadastro\n\nImagine a **ficha de cadastro** que você preenche numa academia ou numa biblioteca. Ela tem vários campos, e cada campo é formado por duas partes: um **rótulo** à esquerda e a **informação** que você escreve à direita.\n\n- **Nome:** Ana Souza\n- **Idade:** 25\n- **É estudante?** sim\n\nRepare que todos esses dados falam da **mesma pessoa**. Não faria sentido guardar cada um numa variável solta e sem ligação. O objeto existe justamente para **juntar** essas informações numa coisa só, mantendo cada dado com o seu **nome**. Na linguagem dos objetos, o rótulo se chama **chave** (ou **propriedade**) e a informação ao lado se chama **valor**.",
                    },
                    {
                        type: "text",
                        value: "## Criando um objeto com chaves {}\n\nPara criar um objeto em JavaScript, a gente usa um par de **chaves** `{ }`. Dentro delas, escrevemos os pares no formato **chave: valor**, geralmente um em cada linha, separando um par do outro por **vírgula**.\n\nVeja a ficha da Ana virando um objeto de verdade:",
                    },
                    {
                        type: "code",
                        value: 'const pessoa = {\n  nome: "Ana Souza",\n  idade: 25,\n  estudante: true\n};\n\nconsole.log(pessoa);\n// no console aparece: { nome: "Ana Souza", idade: 25, estudante: true }',
                    },
                    {
                        type: "text",
                        value: '## Entendendo as partes\n\nEsse pequeno bloco tem bastante coisa para reparar:\n\n- **`nome`, `idade` e `estudante`** são as **chaves** (os rótulos). São elas que dão nome a cada dado.\n- **`"Ana Souza"`, `25` e `true`** são os **valores**. Repare que os valores podem ser de **tipos diferentes**: um texto, um número e um booleano, tudo no mesmo objeto.\n- Depois de cada par vem uma **vírgula** (no último ela é opcional).\n- Guardamos o objeto inteiro numa variável, aqui chamada `pessoa`, para poder usá-lo depois.\n\nCada par `chave: valor` é chamado de **propriedade** do objeto. Dizemos, por exemplo, que "o objeto `pessoa` tem a propriedade `idade` com valor `25`".',
                    },
                    {
                        type: "text",
                        value: "## Pegando um dado com o ponto .\n\nCriar o objeto é só metade da história. A outra metade é **acessar** os dados guardados nele. A forma mais comum é a **notação de ponto**: você escreve o nome do objeto, um **ponto** `.` e o nome da chave que quer ler.",
                    },
                    {
                        type: "code",
                        value: "console.log(pessoa.nome);\n// no console aparece: Ana Souza\n\nconsole.log(pessoa.idade);\n// no console aparece: 25\n\nconsole.log(pessoa.estudante);\n// no console aparece: true",
                    },
                    {
                        type: "text",
                        value: "## Pegando um dado com colchetes []\n\nExiste um segundo jeito de acessar uma propriedade: a **notação de colchetes**. Aqui você escreve o nome do objeto e, entre **colchetes** `[]`, o nome da chave **entre aspas**, como se fosse um texto.",
                    },
                    {
                        type: "code",
                        value: 'console.log(pessoa["nome"]);\n// no console aparece: Ana Souza\n\nconsole.log(pessoa["idade"]);\n// no console aparece: 25',
                    },
                    {
                        type: "text",
                        value: '## Quando usar cada um\n\nNa maior parte do tempo, o **ponto** é mais curto e mais fácil de ler, e é o que você vai usar quase sempre. Mas os **colchetes** têm um superpoder que o ponto não tem: eles aceitam a chave **guardada numa variável**. Como dentro dos colchetes vai um texto, podemos colocar ali uma variável que contém o nome da chave.\n\nOs colchetes também são obrigatórios quando a chave tem um formato "esquisito", por exemplo com **espaço** no nome, algo que o ponto não consegue ler.',
                    },
                    {
                        type: "code",
                        value: 'const campo = "idade";\nconsole.log(pessoa[campo]);\n// no console aparece: 25  (campo vale "idade", então lemos pessoa["idade"])\n\nconst livro = {\n  "ano de lançamento": 1997\n};\nconsole.log(livro["ano de lançamento"]);\n// no console aparece: 1997  (com espaço na chave, só os colchetes funcionam)',
                    },
                    {
                        type: "table",
                        value: '[["Situação","Com ponto `.`","Com colchetes `[]`"],["Ler uma chave conhecida","`pessoa.nome`","`pessoa[campo]` (campo é variável)"],["Chave guardada numa variável","não funciona","funciona"],["Chave com espaço no nome","não funciona","funciona"],["No dia a dia","mais curta e comum","mais flexível"]]',
                    },
                    {
                        type: "text",
                        value: "## Adicionando e modificando propriedades\n\nUm objeto não é uma pedra: depois de criado, ele pode **crescer** e **mudar**. Para **modificar** um valor que já existe, ou para **adicionar** uma propriedade nova, usamos o sinal de **igual** `=`, do mesmo jeito que atribuímos valor a uma variável.\n\nA regra é simples: se a chave **já existe**, o valor é **trocado**; se a chave **não existe** ainda, ela é **criada** na hora.",
                    },
                    {
                        type: "code",
                        value: 'const carro = {\n  marca: "Fiat",\n  ano: 2020\n};\n\n// Modificando: a chave "ano" já existe, então o valor é trocado\ncarro.ano = 2024;\nconsole.log(carro.ano);\n// no console aparece: 2024\n\n// Adicionando: a chave "cor" não existia, então ela é criada agora\ncarro.cor = "prata";\nconsole.log(carro);\n// no console aparece: { marca: "Fiat", ano: 2024, cor: "prata" }',
                    },
                    {
                        type: "text",
                        value: '## E se a propriedade não existir?\n\nUma dúvida comum: o que acontece se você tentar ler uma chave que o objeto **não tem**? O JavaScript não quebra nem mostra erro em vermelho. Ele simplesmente devolve `undefined`, uma palavra especial que significa "isto aqui não tem valor definido".\n\nIsso costuma ser a pista de um erro de digitação no nome da chave, então fique atento quando um `undefined` aparecer sem querer.',
                    },
                    {
                        type: "code",
                        value: 'const pessoa = {\n  nome: "Ana Souza",\n  idade: 25\n};\n\nconsole.log(pessoa.email);\n// no console aparece: undefined  (o objeto não tem a chave "email")\n\nconsole.log(pessoa.Nome);\n// no console aparece: undefined  (cuidado: "Nome" com N maiúsculo é diferente de "nome")',
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** um **objeto** guarda **dados relacionados** em pares de **chave: valor**, como uma **ficha de cadastro**. Criamos com **chaves** `{}`, separando os pares por vírgula. Para **ler** um valor usamos o **ponto** (`pessoa.nome`) ou os **colchetes** (`pessoa["nome"]`), sendo que os colchetes aceitam a chave vinda de uma variável. Para **adicionar** ou **modificar**, usamos o **igual** (`carro.cor = "prata"`). E ler uma chave que não existe devolve `undefined`.',
                    },
                ],
                questions: [
                    {
                        statement: "O que é um objeto em JavaScript?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma forma de agrupar dados relacionados em pares de chave e valor.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma lista ordenada de valores acessados por um índice numérico.",
                                isCorrect: false,
                            },
                            {
                                text: "Um tipo de comentário que o JavaScript ignora ao rodar.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma função que roda sozinha assim que a página abre.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Como se cria um objeto literal em JavaScript?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Com um par de chaves `{ }`, escrevendo pares no formato `chave: valor`.",
                                isCorrect: true,
                            },
                            {
                                text: "Com colchetes `[ ]`, separando apenas valores por vírgula.",
                                isCorrect: false,
                            },
                            {
                                text: "Com parênteses `( )` logo depois da palavra `function`.",
                                isCorrect: false,
                            },
                            {
                                text: "Com aspas duplas em volta de todo o conteúdo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Dado `const p = { nome: "Léo", idade: 30 }`, o que `p.nome` mostra no console?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Léo",
                                isCorrect: true,
                            },
                            {
                                text: "nome",
                                isCorrect: false,
                            },
                            {
                                text: "undefined",
                                isCorrect: false,
                            },
                            {
                                text: '{ nome: "Léo" }',
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em que situação os colchetes `[]` são necessários no lugar do ponto para acessar uma propriedade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Quando a chave está guardada numa variável ou tem espaço/símbolo no nome.",
                                isCorrect: true,
                            },
                            {
                                text: "Sempre; o ponto nunca funciona para ler propriedades.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas quando o valor da propriedade é um número.",
                                isCorrect: false,
                            },
                            {
                                text: "Somente dentro de comentários de bloco.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Você tem `const u = { email: "a@x.com" }` e, por engano, escreve `u.emial`. O que aparece e por quê?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`undefined`, porque o objeto não tem a chave `emial` (foi um erro de digitação; o certo é `email`).",
                                isCorrect: true,
                            },
                            {
                                text: "Um erro em vermelho que trava a página inteira.",
                                isCorrect: false,
                            },
                            {
                                text: "`a@x.com`, porque o JavaScript corrige sozinho o nome parecido.",
                                isCorrect: false,
                            },
                            {
                                text: "`null`, porque toda chave inexistente vira `null`.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Métodos e o this",
                blocks: [
                    {
                        type: "text",
                        value: "# Métodos e o this\n\nNa aula anterior, os valores guardados nos nossos objetos eram sempre **dados parados**: textos, números, booleanos. Mas lembra que, lá atrás, você aprendeu que uma **função** também pode ser guardada numa variável? Pois é: uma função também pode ser guardada como o **valor** de uma propriedade.\n\nQuando isso acontece, damos um nome especial a essa propriedade: ela vira um **método**. Nesta aula você vai aprender a criar métodos e a usar uma palavrinha muito importante que aparece dentro deles: o `this`.",
                    },
                    {
                        type: "quote",
                        value: "Um **método** é simplesmente uma **função guardada como propriedade** de um objeto: em vez de um dado parado, a propriedade guarda uma **ação**. Dentro de um método, a palavra `this` aponta para **o próprio objeto** a que o método pertence, permitindo que a ação use os dados daquele objeto.",
                    },
                    {
                        type: "text",
                        value: "## Uma propriedade que é uma função\n\nAté agora, do lado direito dos dois-pontos, colocávamos um valor parado. Nada nos impede de colocar ali uma **função**. Quando o valor de uma propriedade é uma função, aquela propriedade deixa de ser um dado e passa a ser uma **ação** que o objeto sabe fazer.\n\nVeja um objeto `cachorro` que, além do nome, sabe **latir**:",
                    },
                    {
                        type: "code",
                        value: 'const cachorro = {\n  nome: "Rex",\n  latir: function () {\n    console.log("Au au!");\n  }\n};',
                    },
                    {
                        type: "text",
                        value: "## Chamando o método\n\nGuardar a função não faz ela rodar. Para **executar** o método, usamos o nome do objeto, o **ponto**, o nome do método e, no fim, um par de **parênteses** `()`, exatamente como chamamos qualquer função. Sem os parênteses, você apenas aponta para a função, sem mandá-la rodar.",
                    },
                    {
                        type: "code",
                        value: "cachorro.latir();\n// no console aparece: Au au!\n\n// Sem os parênteses, você não roda o método, só olha para ele:\nconsole.log(cachorro.latir);\n// no console aparece: [Function: latir]  (a função em si, não o resultado dela)",
                    },
                    {
                        type: "text",
                        value: "## A forma curta de escrever métodos\n\nComo criar métodos é muito comum, o JavaScript oferece um atalho: você pode **omitir** a parte `: function` e escrever só o nome do método seguido dos parênteses e das chaves. O resultado é idêntico, só que mais enxuto. É essa forma curta que você mais vai encontrar por aí.",
                    },
                    {
                        type: "code",
                        value: 'const gato = {\n  nome: "Mimi",\n  // forma curta: sem os dois-pontos e sem a palavra function\n  miar() {\n    console.log("Miau!");\n  }\n};\n\ngato.miar();\n// no console aparece: Miau!',
                    },
                    {
                        type: "text",
                        value: "## O método precisa dos dados do próprio objeto\n\nOs métodos ficam realmente úteis quando a ação usa os **dados guardados no objeto**. Imagine uma `pessoa` com um método que se apresenta dizendo o nome. Como, lá de dentro do método, a gente alcança a propriedade `nome` do mesmo objeto?\n\nVocê poderia pensar em repetir o nome da variável (`pessoa.nome`) dentro do método. Funciona, mas tem um problema: se um dia a variável mudar de nome, o método quebra. Existe uma forma melhor e mais segura.",
                    },
                    {
                        type: "code",
                        value: 'const pessoa = {\n  nome: "Ana",\n  apresentar() {\n    // Funciona, mas depende do nome da variável de fora (pessoa):\n    console.log("Oi, eu sou " + pessoa.nome);\n  }\n};\n\npessoa.apresentar();\n// no console aparece: Oi, eu sou Ana',
                    },
                    {
                        type: "text",
                        value: '## Chegou o this\n\nPara resolver isso, o JavaScript oferece a palavra-chave `this`. Dentro de um método, `this` significa **"este objeto aqui"**, ou seja, o próprio objeto de onde o método foi chamado. É como uma pessoa que, ao falar de si mesma, diz **"meu"** nome em vez de repetir o próprio nome inteiro toda hora.\n\nTrocando `pessoa.nome` por `this.nome`, o método passa a ler a propriedade do seu próprio objeto, sem depender do nome da variável de fora:',
                    },
                    {
                        type: "code",
                        value: 'const pessoa = {\n  nome: "Ana",\n  idade: 25,\n  apresentar() {\n    console.log("Oi, eu sou " + this.nome + " e tenho " + this.idade + " anos.");\n  }\n};\n\npessoa.apresentar();\n// no console aparece: Oi, eu sou Ana e tenho 25 anos.',
                    },
                    {
                        type: "text",
                        value: "## Uma forma mais limpa com crases\n\nJuntar textos com vários sinais de `+` acaba cansando a vista. Se você já conhece os **template literals** (aqueles textos escritos entre **crases**, em vez de aspas), dá para montar a mesma frase de um jeito bem mais legível: a gente encaixa o valor de `this.nome` direto no meio do texto usando `${ }`.",
                    },
                    {
                        type: "code",
                        value: 'const pessoa = {\n  nome: "Ana",\n  idade: 25,\n  apresentar() {\n    // As crases permitem encaixar valores com ${ } no meio do texto\n    console.log(`Oi, eu sou ${this.nome} e tenho ${this.idade} anos.`);\n  }\n};\n\npessoa.apresentar();\n// no console aparece: Oi, eu sou Ana e tenho 25 anos.',
                    },
                    {
                        type: "text",
                        value: "## Um método que muda o próprio objeto\n\nOs métodos também podem **alterar** os dados do próprio objeto usando o `this`. Veja uma conta bancária que sabe receber depósitos: o método `depositar` soma o valor recebido ao `this.saldo`, guardando o novo total no próprio objeto.",
                    },
                    {
                        type: "code",
                        value: 'const conta = {\n  titular: "Bruno",\n  saldo: 100,\n  depositar(valor) {\n    this.saldo = this.saldo + valor;\n    console.log("Novo saldo: " + this.saldo);\n  }\n};\n\nconta.depositar(50);\n// no console aparece: Novo saldo: 150\n\nconta.depositar(30);\n// no console aparece: Novo saldo: 180',
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Função comum","Método"],["O que é","Um bloco de código reutilizável","Uma função guardada dentro de um objeto"],["Onde vive","Solta, numa variável ou declaração","Como propriedade de um objeto"],["Como se chama","`saudar()`","`pessoa.saudar()`"],["Acessa os dados do objeto?","não tem um objeto dono","sim, pela palavra `this`"]]',
                    },
                    {
                        type: "text",
                        value: "## Uma observação para guardar\n\nO `this` é um assunto que tem camadas mais profundas, e você vai revisitá-lo no futuro. Por enquanto, guarde a ideia mais importante e mais útil: **dentro de um método chamado como `objeto.metodo()`, o `this` é o próprio `objeto`**. Sempre que quiser que um método use ou mude os dados da sua própria casa, o caminho é o `this`.",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** um **método** é uma **função guardada como propriedade** de um objeto, uma **ação** que o objeto sabe fazer. Chamamos com o **ponto** e **parênteses** (`gato.miar()`), e podemos escrevê-lo na **forma curta** (`miar() { ... }`). Dentro do método, `this` aponta para **o próprio objeto**, dando acesso aos seus dados (`this.nome`) e permitindo até mudá-los (`this.saldo = ...`).",
                    },
                ],
                questions: [
                    {
                        statement: "O que é um método, na linguagem dos objetos?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma função guardada como propriedade de um objeto.",
                                isCorrect: true,
                            },
                            {
                                text: "Um tipo especial de variável que só guarda números.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma chave cujo valor é sempre um texto.",
                                isCorrect: false,
                            },
                            {
                                text: "Um comentário que descreve o objeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Dentro de um método, a palavra `this` normalmente se refere a quê?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ao próprio objeto a que o método pertence.",
                                isCorrect: true,
                            },
                            {
                                text: "Ao navegador que abriu a página.",
                                isCorrect: false,
                            },
                            {
                                text: "Sempre ao número zero.",
                                isCorrect: false,
                            },
                            {
                                text: "À última função declarada no arquivo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Como se executa o método `latir` do objeto `cachorro`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`cachorro.latir()`",
                                isCorrect: true,
                            },
                            {
                                text: "`cachorro.latir` (sem os parênteses, apenas aponta para a função)",
                                isCorrect: false,
                            },
                            {
                                text: "`latir(cachorro)`",
                                isCorrect: false,
                            },
                            {
                                text: "`new cachorro.latir`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'No objeto `const pessoa = { nome: "Ana", apresentar() { console.log(this.nome); } }`, o que `pessoa.apresentar()` mostra?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ana",
                                isCorrect: true,
                            },
                            {
                                text: "this.nome",
                                isCorrect: false,
                            },
                            {
                                text: "undefined",
                                isCorrect: false,
                            },
                            {
                                text: "nome",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que costuma ser melhor usar `this.saldo` do que repetir `conta.saldo` dentro de um método do objeto `conta`?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque `this` aponta para o próprio objeto, então o método continua funcionando mesmo que a variável externa mude de nome; ele não fica preso ao nome `conta`.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque `this.saldo` é apenas mais rápido de digitar e o resto é indiferente.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque `conta.saldo` sempre gera um erro em vermelho.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque `this` transforma o número em texto automaticamente.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Percorrendo objetos",
                blocks: [
                    {
                        type: "text",
                        value: "# Percorrendo objetos\n\nQuando um objeto tem poucas propriedades, a gente lê uma por uma na mão, com o ponto. Mas e quando queremos **visitar todas** as propriedades, sem saber ao certo quantas são, ou para montar um relatório com tudo o que está lá dentro? Para isso existem ferramentas próprias para **percorrer** um objeto.\n\nNesta aula você vai conhecer o laço `for...in` e três ajudantes muito usados: `Object.keys`, `Object.values` e `Object.entries`. No fim, a gente esclarece uma confusão comum entre percorrer um **objeto** e percorrer um **array**.",
                    },
                    {
                        type: "quote",
                        value: "Para **percorrer** um objeto, o laço `for...in` visita **uma chave de cada vez**. Já os métodos `Object.keys`, `Object.values` e `Object.entries` transformam o objeto em um **array** (de chaves, de valores ou dos dois juntos), pronto para você usar. Objetos se percorrem por **chave**; arrays, por **posição**.",
                    },
                    {
                        type: "text",
                        value: '## O laço for...in\n\nO `for...in` é um laço feito sob medida para objetos. A cada volta, ele coloca **o nome de uma chave** numa variável que você escolhe, até passar por todas. A leitura em português fica quase natural: "para cada `chave` dentro de `pessoa`, faça...".',
                    },
                    {
                        type: "code",
                        value: 'const pessoa = {\n  nome: "Ana",\n  idade: 25,\n  cidade: "Recife"\n};\n\nfor (const chave in pessoa) {\n  console.log(chave);\n}\n// no console aparece, em três linhas:\n// nome\n// idade\n// cidade',
                    },
                    {
                        type: "text",
                        value: '## Pegando o valor dentro do laço\n\nRepare que o `for...in` te dá a **chave**, não o valor. Para chegar ao valor, a gente usa aquela notação de **colchetes** da primeira aula: como a chave está numa **variável** (`chave`), os colchetes são o caminho certo, `pessoa[chave]`. O ponto não serviria aqui, porque `pessoa.chave` procuraria uma propriedade chamada literalmente "chave".',
                    },
                    {
                        type: "code",
                        value: 'const pessoa = {\n  nome: "Ana",\n  idade: 25,\n  cidade: "Recife"\n};\n\nfor (const chave in pessoa) {\n  console.log(chave + ": " + pessoa[chave]);\n}\n// no console aparece, em três linhas:\n// nome: Ana\n// idade: 25\n// cidade: Recife',
                    },
                    {
                        type: "text",
                        value: "## Object.keys: as chaves numa lista\n\nÀs vezes você quer todas as **chaves** do objeto reunidas num **array**, para contar quantas são ou para usar as ferramentas de array que já conhece. O `Object.keys` faz exatamente isso: você passa o objeto entre parênteses e ele devolve um array com os nomes das chaves.",
                    },
                    {
                        type: "code",
                        value: 'const pessoa = {\n  nome: "Ana",\n  idade: 25,\n  cidade: "Recife"\n};\n\nconsole.log(Object.keys(pessoa));\n// no console aparece: [ "nome", "idade", "cidade" ]\n\nconsole.log(Object.keys(pessoa).length);\n// no console aparece: 3  (o objeto tem três propriedades)',
                    },
                    {
                        type: "text",
                        value: "## Object.values: os valores numa lista\n\nSe o que você quer são os **valores**, e não as chaves, o `Object.values` devolve um array só com os valores, na mesma ordem em que aparecem no objeto.",
                    },
                    {
                        type: "code",
                        value: 'const pessoa = {\n  nome: "Ana",\n  idade: 25,\n  cidade: "Recife"\n};\n\nconsole.log(Object.values(pessoa));\n// no console aparece: [ "Ana", 25, "Recife" ]',
                    },
                    {
                        type: "text",
                        value: "## Object.entries: chave e valor juntos\n\nE quando você precisa dos dois ao mesmo tempo? O `Object.entries` devolve um array em que **cada item é um par** `[chave, valor]`. Ou seja, um array de pequenos arrays, cada um com a chave na primeira posição e o valor na segunda.",
                    },
                    {
                        type: "code",
                        value: 'const pessoa = {\n  nome: "Ana",\n  idade: 25\n};\n\nconsole.log(Object.entries(pessoa));\n// no console aparece: [ [ "nome", "Ana" ], [ "idade", 25 ] ]',
                    },
                    {
                        type: "table",
                        value: '[["Ferramenta","O que faz / devolve","Resultado (exemplo)"],["`for...in`","percorre uma chave de cada vez","visita `nome`, depois `idade`, ..."],["`Object.keys(obj)`","um array com as chaves","um array com nome, idade, cidade"],["`Object.values(obj)`","um array com os valores","um array com Ana, 25, Recife"],["`Object.entries(obj)`","um array de pares chave-valor","um array de pares como nome e Ana"]]',
                    },
                    {
                        type: "text",
                        value: "## Objeto ou array? Cuidado para não trocar\n\nUma confusão muito comum de quem está começando é misturar as formas de percorrer **objeto** e **array**. A diferença nasce da natureza de cada um: o **array** é uma lista **ordenada**, acessada por **posição** (o índice `0`, `1`, `2`...); o **objeto** é um conjunto de dados **com nome**, acessado por **chave**.\n\nPor isso, cada um tem o seu laço preferido: para percorrer um **array** valor por valor, o certo é o `for...of`; para percorrer um **objeto** chave por chave, o certo é o `for...in`. Trocar um pelo outro costuma dar resultado estranho.",
                    },
                    {
                        type: "code",
                        value: '// ARRAY: lista ordenada, percorrida por posição com for...of\nconst frutas = ["maçã", "banana", "uva"];\nfor (const fruta of frutas) {\n  console.log(fruta);\n}\n// no console aparece: maçã, depois banana, depois uva\n\n// OBJETO: dados com nome, percorridos por chave com for...in\nconst pessoa = { nome: "Ana", idade: 25 };\nfor (const chave in pessoa) {\n  console.log(chave + " = " + pessoa[chave]);\n}\n// no console aparece: nome = Ana, depois idade = 25',
                    },
                    {
                        type: "text",
                        value: "## Uma dica para não errar\n\nGuarde este resumo mental: **`of` é para os valores de um array; `in` é para as chaves de um objeto**. As duas palavrinhas são parecidas, mas fazem coisas diferentes. E, se em algum momento você tiver um objeto e quiser usá-lo com as ferramentas de array, o truque é transformá-lo antes com `Object.keys`, `Object.values` ou `Object.entries`.",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** para percorrer um objeto, o `for...in` visita **uma chave por vez**, e você pega o valor com `objeto[chave]`. Quando quiser o objeto em forma de **array**, use `Object.keys` (chaves), `Object.values` (valores) ou `Object.entries` (pares `[chave, valor]`). Não confunda com array: **`for...of`** percorre os **valores de um array** por posição; **`for...in`** percorre as **chaves de um objeto**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual laço é feito sob medida para percorrer as chaves de um objeto?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "`for...in`",
                                isCorrect: true,
                            },
                            {
                                text: "`for...of`",
                                isCorrect: false,
                            },
                            {
                                text: "`while`",
                                isCorrect: false,
                            },
                            {
                                text: "`console.log`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que `Object.keys(obj)` devolve?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um array com os nomes das chaves do objeto.",
                                isCorrect: true,
                            },
                            {
                                text: "Um array com os valores do objeto.",
                                isCorrect: false,
                            },
                            {
                                text: "O número de letras da primeira chave.",
                                isCorrect: false,
                            },
                            {
                                text: "O objeto inteiro convertido em texto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Dentro de `for (const chave in pessoa)`, como você acessa o valor da propriedade atual?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`pessoa[chave]`, com colchetes, porque a chave está numa variável.",
                                isCorrect: true,
                            },
                            {
                                text: "`pessoa.chave`, com o ponto.",
                                isCorrect: false,
                            },
                            {
                                text: "`chave.pessoa`",
                                isCorrect: false,
                            },
                            {
                                text: "`pessoa(chave)`",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que `Object.entries({ a: 1, b: 2 })` devolve?",
                        difficulty: "medio",
                        options: [
                            {
                                text: 'Um array de pares: `[ [ "a", 1 ], [ "b", 2 ] ]`.',
                                isCorrect: true,
                            },
                            {
                                text: 'Apenas as chaves: `[ "a", "b" ]`.',
                                isCorrect: false,
                            },
                            {
                                text: "Apenas os valores: `[ 1, 2 ]`.",
                                isCorrect: false,
                            },
                            {
                                text: "O número `2`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a diferença correta entre `for...of` e `for...in`?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`for...of` percorre os valores de um array (por posição); `for...in` percorre as chaves de um objeto.",
                                isCorrect: true,
                            },
                            {
                                text: "São idênticos; muda apenas o nome.",
                                isCorrect: false,
                            },
                            {
                                text: "`for...of` só funciona com números e `for...in` só com textos.",
                                isCorrect: false,
                            },
                            {
                                text: "`for...in` percorre valores de array e `for...of` percorre chaves de objeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "JSON",
                blocks: [
                    {
                        type: "text",
                        value: "# JSON\n\nChegamos à última aula do módulo, e ela conecta os objetos que você aprendeu com o **mundo real** da programação. Todo dia, aplicativos e sites conversam entre si pela internet: um app de celular pede dados a um servidor, um site salva informações, dois sistemas trocam recados. Para essa conversa funcionar, eles precisam de um **idioma comum**. Esse idioma, na maior parte da web, se chama **JSON**.\n\nA melhor notícia: o JSON tem a cara de um objeto JavaScript, então você já está quase pronto para entendê-lo.",
                    },
                    {
                        type: "quote",
                        value: "**JSON** (JavaScript Object Notation) é um **formato de texto** para **guardar e trocar dados**. Ele nasceu do jeito de escrever objetos em JavaScript, mas é apenas **texto**, o que permite enviá-lo pela internet e usá-lo em qualquer linguagem. Duas ferramentas fazem a ponte: `JSON.stringify` transforma um **objeto em texto** e `JSON.parse` transforma o **texto de volta em objeto**.",
                    },
                    {
                        type: "text",
                        value: '## O problema que o JSON resolve\n\nDados dentro do seu programa vivem como objetos, arrays, números. Mas, para **viajar** pela internet de um computador a outro, tudo precisa virar uma coisa só: **texto**. Não dá para enviar um objeto JavaScript "vivo" pela rede; dá para enviar um texto que **descreve** aquele objeto.\n\nPense numa carta: você não coloca a pessoa dentro do envelope, você envia um **papel escrito** que conta o que precisa. O JSON é esse papel: uma forma combinada de escrever os dados como texto, que quem recebe consegue **ler e remontar**. Como praticamente toda linguagem entende JSON, ele virou o idioma padrão dessa troca.',
                    },
                    {
                        type: "text",
                        value: "## Como o JSON se parece\n\nUm texto JSON é muito parecido com um objeto JavaScript: tem chaves `{}`, tem pares de **chave: valor** e vírgulas separando. A diferença que salta aos olhos é que, no JSON, **toda chave vem entre aspas duplas**, e os textos também usam **sempre aspas duplas**. Veja um mesmo cadastro escrito como texto JSON:",
                    },
                    {
                        type: "code",
                        value: '// Isto é uma string (texto). Repare nas aspas duplas em TODAS as chaves.\nconst textoJson = \'{ "nome": "Ana", "idade": 25, "estudante": true }\';\n\nconsole.log(typeof textoJson);\n// no console aparece: string  (para o JavaScript, isto ainda é apenas texto)',
                    },
                    {
                        type: "text",
                        value: "## JSON.stringify: de objeto para texto\n\nNa prática, você quase nunca escreve o JSON na mão. Você tem um **objeto** no seu programa e quer transformá-lo em texto JSON para salvar ou enviar. Quem faz isso é o `JSON.stringify`: você passa o objeto e ele devolve a versão em **texto**.",
                    },
                    {
                        type: "code",
                        value: 'const pessoa = {\n  nome: "Ana",\n  idade: 25,\n  estudante: true\n};\n\nconst texto = JSON.stringify(pessoa);\nconsole.log(texto);\n// no console aparece: {"nome":"Ana","idade":25,"estudante":true}\n\nconsole.log(typeof texto);\n// no console aparece: string  (o objeto virou texto!)',
                    },
                    {
                        type: "text",
                        value: "## Deixando o texto mais legível\n\nPor padrão, o `JSON.stringify` gera tudo numa linha só, compacto, ótimo para a máquina, mas ruim para os olhos. Se você passar mais dois argumentos, `null` e um número, ele **indenta** o resultado com aquela quantidade de espaços, deixando o texto organizado para leitura.",
                    },
                    {
                        type: "code",
                        value: 'const pessoa = { nome: "Ana", idade: 25 };\n\nconsole.log(JSON.stringify(pessoa, null, 2));\n// no console aparece, organizado em várias linhas:\n// {\n//   "nome": "Ana",\n//   "idade": 25\n// }',
                    },
                    {
                        type: "text",
                        value: "## JSON.parse: de texto para objeto\n\nO caminho de volta é igualmente importante. Quando você **recebe** um texto JSON (de um servidor, de um arquivo), ele chega como uma **string** e, do jeito que está, você não consegue usar o ponto para ler as propriedades. É preciso **remontar** o objeto. Quem faz isso é o `JSON.parse`: você passa o texto e ele devolve um **objeto** de verdade.",
                    },
                    {
                        type: "code",
                        value: 'const texto = \'{ "nome": "Ana", "idade": 25 }\';\n\nconst pessoa = JSON.parse(texto);\nconsole.log(pessoa.nome);\n// no console aparece: Ana  (agora dá para usar o ponto!)\n\nconsole.log(pessoa.idade + 5);\n// no console aparece: 30  (idade voltou a ser número, então dá para somar)',
                    },
                    {
                        type: "text",
                        value: '## Onde você vai encontrar o JSON\n\nEssa dupla `JSON.stringify` e `JSON.parse` aparece o tempo todo na vida real:\n\n- **Conversando com servidores:** quando um site busca dados (a famosa "API"), a resposta quase sempre vem em texto JSON, que você transforma em objeto com `JSON.parse`.\n- **Salvando dados no navegador:** para guardar algo no `localStorage`, é preciso salvar como texto; então você usa `JSON.stringify` para gravar e `JSON.parse` para ler de volta.\n- **Arquivos de configuração:** muitos programas guardam suas opções em arquivos `.json`.\n\nOu seja, entender JSON é entender como os dados circulam pela web.',
                    },
                    {
                        type: "text",
                        value: "## Objeto JavaScript x JSON: parecidos, mas não iguais\n\nÉ fácil confundir os dois, porque a aparência é quase a mesma. A diferença central é: um **objeto JavaScript** é uma estrutura **viva** dentro do seu programa (pode ter métodos, ser modificada, ter valores de vários tipos); o **JSON** é só **texto**, seguindo regras mais rígidas. As principais regras do JSON:\n\n- Toda **chave** fica entre **aspas duplas** (no objeto JS isso é opcional).\n- Textos usam **somente aspas duplas**, nunca aspas simples.\n- **Não** pode ter **funções/métodos**, nem `undefined`, nem comentários.\n- **Não** pode ter vírgula sobrando depois do último item.",
                    },
                    {
                        type: "table",
                        value: '[["Aspecto","Objeto JavaScript","JSON"],["O que é","estrutura viva no programa","apenas texto (uma string)"],["Aspas nas chaves","opcionais","obrigatórias, sempre duplas"],["Pode ter métodos (funções)?","sim","não"],["Aspas nos textos","simples ou duplas","somente duplas"],["Para que serve","usar e manipular dados no código","guardar e transportar dados"]]',
                    },
                    {
                        type: "code",
                        value: '// Objeto JavaScript: chaves sem aspas, pode ter método\nconst pessoaObjeto = {\n  nome: "Ana",\n  saudar() {\n    console.log("Oi!");\n  }\n};\n\n// JSON (texto): chaves entre aspas duplas, sem método\nconst pessoaJson = \'{ "nome": "Ana" }\';\n// Note: o método NÃO vai para o JSON; JSON guarda dados, não ações.',
                    },
                    {
                        type: "text",
                        value: "## Um erro clássico com JSON\n\nComo o JSON só aceita **aspas duplas**, tentar interpretar um texto com **aspas simples** faz o `JSON.parse` reclamar. Este é um tropeço bem comum, então já fica o alerta:",
                    },
                    {
                        type: "code",
                        value: "// ERRADO: aspas simples dentro do JSON\nconst ruim = \"{ 'nome': 'Ana' }\";\n// JSON.parse(ruim) daria erro: aspas simples não formam JSON válido\n\n// CERTO: aspas duplas nas chaves e nos textos\nconst bom = '{ \"nome\": \"Ana\" }';\nconsole.log(JSON.parse(bom).nome);\n// no console aparece: Ana",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** **JSON** é um **formato de texto** para **trocar e guardar dados**, com a cara de um objeto JavaScript, mas seguindo regras rígidas (chaves e textos **sempre entre aspas duplas**, sem métodos e sem comentários). Use `JSON.stringify` para virar **objeto em texto** e `JSON.parse` para virar **texto em objeto**. É assim que os dados viajam pela web.\n\nE com isto você conclui o **Módulo de Objetos**! Você aprendeu a agrupar dados em pares chave-valor, a criar métodos com `this`, a percorrer objetos e a levá-los para o mundo real com JSON. Parabéns por mais um módulo concluído!",
                    },
                ],
                questions: [
                    {
                        statement: "O que é o JSON?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um formato de texto para guardar e trocar dados entre sistemas.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma linguagem de programação concorrente do JavaScript.",
                                isCorrect: false,
                            },
                            {
                                text: "Um tipo de comentário usado dentro de objetos.",
                                isCorrect: false,
                            },
                            {
                                text: "Um navegador criado pela equipe do JavaScript.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o `JSON.stringify` faz?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Transforma um objeto em texto (string) no formato JSON.",
                                isCorrect: true,
                            },
                            {
                                text: "Transforma um texto JSON de volta em objeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Apaga todas as propriedades de um objeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Soma os valores numéricos de um objeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Você recebeu do servidor o texto `\'{ "nome": "Léo" }\'` e quer usá-lo como objeto para ler `.nome`. O que usar?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "`JSON.parse`, que transforma o texto de volta em objeto.",
                                isCorrect: true,
                            },
                            {
                                text: "`JSON.stringify`, que transforma o texto em objeto.",
                                isCorrect: false,
                            },
                            {
                                text: "`Object.keys`, que já devolve o objeto pronto.",
                                isCorrect: false,
                            },
                            {
                                text: "Nada: dá para usar o ponto direto no texto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual destas é uma regra do JSON (mais rígida que a de um objeto JavaScript comum)?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Toda chave e todo texto ficam entre aspas duplas.",
                                isCorrect: true,
                            },
                            {
                                text: "As chaves nunca podem ter aspas.",
                                isCorrect: false,
                            },
                            {
                                text: "Os textos devem ficar entre aspas simples.",
                                isCorrect: false,
                            },
                            {
                                text: "É obrigatório ter pelo menos um método.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que `JSON.parse(\"{ 'nome': 'Ana' }\")` provoca um erro?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque o JSON exige aspas duplas; com aspas simples, o texto não é JSON válido.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque `JSON.parse` só aceita números, nunca textos.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque faltou declarar um método dentro do objeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque `JSON.parse` foi descontinuado e não existe mais.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 9 - DOM e eventos",
        aulas: [
            {
                titulo: "O que é o DOM",
                blocks: [
                    {
                        type: "text",
                        value: "# O que é o DOM\n\nSeja bem-vindo ao último módulo da trilha! Aqui as três tecnologias que você aprendeu finalmente se encontram: o **HTML** monta a estrutura, o **CSS** cuida da aparência e o **JavaScript** entra para dar **vida** a tudo isso. Neste módulo você vai aprender a fazer o JavaScript **ler** e **mudar** a página de verdade, reagindo ao que a pessoa faz.\n\nE o primeiro passo é entender uma sigla que assusta no nome, mas é simples na ideia: o **DOM**. Nesta aula ainda vamos com calma, sem mudar nada na tela; a meta é entender **o que** o navegador faz com o seu HTML e **como** o JavaScript consegue enxergar a página.",
                    },
                    {
                        type: "quote",
                        value: "**DOM** quer dizer *Document Object Model* (Modelo de Objetos do Documento). É assim: quando o navegador lê o seu HTML, ele **não** guarda aquele texto como texto. Ele constrói, na memória, uma **árvore de objetos** que representa a página, um objeto para cada tag. Essa árvore viva é o **DOM**, e o JavaScript mexe nela através de um objeto central chamado `document`.",
                    },
                    {
                        type: "text",
                        value: "## Do HTML escrito à página viva\n\nPense na diferença entre a **planta de uma casa** e a **casa construída**. A planta é um papel com riscos; a casa é feita de paredes, portas e janelas que você abre e fecha. O seu arquivo `.html` é a planta: um texto. Quando o navegador abre esse arquivo, ele **constrói a casa** a partir da planta, e o resultado dessa construção é o **DOM**.\n\nOu seja, o navegador faz um trabalho de tradução: lê o HTML (o texto) e monta uma versão **viva** da página, feita de objetos que o JavaScript consegue tocar. Cada tag do seu HTML vira um objeto nessa versão viva.",
                    },
                    {
                        type: "text",
                        value: '## Uma árvore de elementos\n\nRepare que o HTML é **aninhado**: umas tags ficam dentro das outras. O `<body>` contém um `<h1>` e uma `<ul>`; a `<ul>` contém vários `<li>`. Essa organização de "dentro de" forma naturalmente uma **árvore**, igualzinho a uma **árvore genealógica** de uma família.\n\nNessa árvore, a gente usa nomes de parentesco:\n\n- um elemento que está **dentro** de outro é **filho** (child);\n- o que está **por fora** é o **pai** (parent);\n- elementos no mesmo nível são **irmãos** (siblings).\n\nNo topo de tudo fica um ancestral comum, a raiz da página. Entender a página como uma árvore ajuda demais na hora de encontrar e mudar as coisas.',
                    },
                    {
                        type: "code",
                        value: '<!-- Este HTML... -->\n<body>\n  <h1>Minhas tarefas</h1>\n  <ul>\n    <li>Estudar DOM</li>\n    <li>Praticar</li>\n  </ul>\n</body>\n\n<!-- ...vira, na cabeça do navegador, esta árvore:\n\n  body\n  |- h1  (texto "Minhas tarefas")\n  |- ul\n     |- li  (texto "Estudar DOM")\n     |- li  (texto "Praticar")\n\n  O body é o pai; h1 e ul são filhos dele e irmãos entre si. -->',
                    },
                    {
                        type: "table",
                        value: '[["Termo","O que é","Exemplo na árvore"],["Nó (node)","Cada peça da árvore","O h1, a ul, cada li"],["Elemento","Um nó que veio de uma tag","O <h1> virou um objeto"],["Pai (parent)","O nó que contém outro","A ul é pai dos li"],["Filho (child)","O nó contido em outro","Cada li é filho da ul"],["Irmãos (siblings)","Nós no mesmo nível","Os dois li entre si"]]',
                    },
                    {
                        type: "text",
                        value: "## O objeto `document`: a porta de entrada\n\nToda essa árvore você acessa por uma única porta: um objeto que o navegador te entrega de graça, já pronto, chamado `document`. Ele representa **a página inteira**. É a partir do `document` que o JavaScript vai procurar elementos, ler textos e fazer mudanças.\n\nComo ele já existe sozinho, você pode conversar com ele na hora. Abra o console (aquele da tecla F12) em qualquer site e experimente:",
                    },
                    {
                        type: "code",
                        value: "// O título da aba (o que está dentro de <title>)\nconsole.log(document.title);\n// no console aparece o título da página atual\n\n// O endereço da página\nconsole.log(document.URL);\n// no console aparece algo como: https://ensina.dev/...\n\n// O body inteiro, como objeto\nconsole.log(document.body);\n// no console aparece o elemento <body> com todo o seu conteúdo",
                    },
                    {
                        type: "text",
                        value: "## O DOM não é o arquivo HTML\n\nAqui vai uma ideia que confunde no começo, então preste atenção: quando o JavaScript muda a página, ele muda o **DOM** (a casa construída), e **não** o seu arquivo `.html` (a planta). O arquivo salvo no disco continua igualzinho.\n\nÉ por isso que, se você usa o JavaScript para trocar um título na tela e depois **recarrega** a página, o título volta ao original: o navegador lê a planta (o HTML) de novo e reconstrói a casa do zero. As mudanças que o JavaScript faz valem para **aquela** construção, ali, enquanto a página está aberta.",
                    },
                    {
                        type: "quote",
                        value: "Mudar a página pelo JavaScript é mudar o **DOM na memória**, a versão viva da página, não o arquivo HTML gravado no disco. Por isso as mudanças feitas por código somem quando você recarrega: o navegador reconstrói tudo a partir do HTML original.",
                    },
                    {
                        type: "text",
                        value: '## Uma ponte de mão dupla\n\nO `document` é uma **ponte** entre dois mundos: o do JavaScript (a lógica) e o da página (o que a pessoa vê). E essa ponte tem mão dupla:\n\n- **Ler**: o JavaScript pode olhar a página e perguntar "qual o texto deste título?", "quantos itens tem esta lista?".\n- **Escrever**: o JavaScript pode mudar a página: "troque este texto", "pinte este botão de verde", "esconda este aviso".\n\nTodo o resto do módulo é sobre atravessar essa ponte: primeiro **achando** o elemento certo, depois **mudando** ele, e por fim fazendo tudo isso **reagir** ao usuário.',
                    },
                    {
                        type: "code",
                        value: '// Um gostinho do que vem por aí: trocar o texto do primeiro <h1> da página.\n// (Nas próximas aulas a gente destrincha cada pedaço disto.)\n\nconst titulo = document.querySelector("h1");\ntitulo.textContent = "Texto trocado pelo JavaScript!";\n// o <h1> da página passa a mostrar: Texto trocado pelo JavaScript!',
                    },
                    {
                        type: "text",
                        value: "## Para onde vamos agora\n\nVocê já tem o mapa mental que faltava: o navegador transforma o seu HTML numa **árvore de objetos** (o DOM), e o JavaScript conversa com essa árvore pelo objeto `document`. Guardar essa imagem, a página como uma árvore viva que dá para ler e mudar, vai fazer todas as próximas aulas encaixarem.\n\nNa próxima aula a gente dá o primeiro passo prático da ponte: **selecionar** um elemento, ou seja, apontar para a peça exata da página com que a gente quer mexer.",
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** o **DOM** (*Document Object Model*) é a **árvore de objetos** que o navegador monta na memória a partir do seu HTML, um objeto para cada tag. É a versão **viva** da página, e não o arquivo de texto. O JavaScript acessa essa árvore pelo objeto `document`, que já vem pronto e funciona como uma **ponte** para **ler** e **mudar** a página. Mudanças feitas por código valem para o DOM na memória e somem ao recarregar.",
                    },
                ],
                questions: [
                    {
                        statement: "O que é o DOM que o navegador cria a partir do seu HTML?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma árvore de objetos, na memória, que representa a página e que o JavaScript pode ler e mudar.",
                                isCorrect: true,
                            },
                            {
                                text: "Uma cópia do arquivo HTML salva numa pasta do computador.",
                                isCorrect: false,
                            },
                            {
                                text: "Um programa separado que você precisa instalar para o site funcionar.",
                                isCorrect: false,
                            },
                            {
                                text: "A folha de estilos CSS que colore a página.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual objeto o JavaScript usa como porta de entrada para toda a página?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O objeto `document`.",
                                isCorrect: true,
                            },
                            {
                                text: "O objeto `console`.",
                                isCorrect: false,
                            },
                            {
                                text: "O objeto `window.html`.",
                                isCorrect: false,
                            },
                            {
                                text: "O objeto `page`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você usa JavaScript para trocar um título na tela e depois recarrega a página. O título volta ao original. Por quê?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque o JavaScript muda o DOM na memória, não o arquivo HTML; ao recarregar, o navegador reconstrói a página a partir do HTML original.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o JavaScript nunca consegue mudar um título de verdade.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque recarregar a página apaga o arquivo HTML do disco.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o título só muda se você salvar o arquivo antes de recarregar.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Numa lista `<ul>` que contém vários `<li>`, como descrevemos essa relação na árvore do DOM?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A `<ul>` é o pai; os `<li>` são filhos dela e irmãos entre si.",
                                isCorrect: true,
                            },
                            {
                                text: "Os `<li>` são os pais da `<ul>`.",
                                isCorrect: false,
                            },
                            {
                                text: "A `<ul>` e os `<li>` não têm relação nenhuma na árvore.",
                                isCorrect: false,
                            },
                            {
                                text: "Cada `<li>` é pai da `<ul>` que o contém.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação descreve corretamente a diferença entre o arquivo HTML e o DOM?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O arquivo HTML é o texto que você escreve (a planta); o DOM é a versão viva, feita de objetos, que o navegador constrói a partir desse texto.",
                                isCorrect: true,
                            },
                            {
                                text: "São exatamente a mesma coisa, apenas com nomes diferentes.",
                                isCorrect: false,
                            },
                            {
                                text: "O DOM é o arquivo salvo no disco; o HTML é o que aparece na tela.",
                                isCorrect: false,
                            },
                            {
                                text: "O HTML roda no servidor e o DOM roda no processador, sem relação entre eles.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Selecionando elementos",
                blocks: [
                    {
                        type: "text",
                        value: '# Selecionando elementos\n\nNa aula anterior você entendeu que a página é uma árvore de objetos. Agora vem a pergunta prática: de todos aqueles objetos, como o JavaScript aponta para **um em especial**, o botão que eu quero, aquele parágrafo ali, esta lista?\n\nEsse "apontar para o elemento certo" se chama **selecionar**. É o primeiro passo de quase tudo o que a gente faz no DOM: antes de mudar alguma coisa, você precisa **encontrá-la**.',
                    },
                    {
                        type: "quote",
                        value: 'Para achar um elemento na página, o JavaScript usa `document.querySelector("seletor")`, passando um **seletor CSS** (o mesmo tipo que você usa para estilizar). Ele devolve o **primeiro** elemento que casar. Guardar esse elemento numa **variável** (`const`) deixa você reutilizá-lo sem procurar de novo.',
                    },
                    {
                        type: "text",
                        value: '## Achar antes de mexer\n\nImagine que você está numa festa cheia e precisa entregar um recado a uma pessoa específica. Antes de falar, você precisa **localizar** essa pessoa no meio da multidão. Com a página é igual: são dezenas de elementos, e o JavaScript precisa de um jeito de dizer "é este aqui" antes de mudar qualquer coisa.\n\nA boa notícia é que você já sabe descrever elementos: os **seletores CSS**. Lembra de escrever `p`, `.destaque` ou `#menu` no CSS para escolher o que estilizar? No DOM a gente usa **exatamente** esses mesmos seletores para escolher o que o JavaScript vai pegar.',
                    },
                    {
                        type: "text",
                        value: '## `querySelector`: o primeiro que casar\n\nO método mais usado para selecionar é o `document.querySelector`. Você entrega a ele um **seletor CSS entre aspas** e ele varre a página de cima para baixo e devolve o **primeiro** elemento que combina com aquele seletor.\n\nOs seletores são os velhos conhecidos do CSS: o **nome da tag** (`"p"`), o **ponto** para classe (`".destaque"`) e a **cerquilha** para id (`"#titulo"`).',
                    },
                    {
                        type: "code",
                        value: '<!-- A página -->\n<h1 id="titulo">Bem-vindo</h1>\n<p class="destaque">Primeiro parágrafo</p>\n<p>Segundo parágrafo</p>\n\n<script>\n  // Pelo nome da tag: pega o PRIMEIRO <p> da página\n  const paragrafo = document.querySelector("p");\n  console.log(paragrafo.textContent); // Primeiro parágrafo\n\n  // Pela classe: repare no ponto, igual no CSS\n  const destaque = document.querySelector(".destaque");\n  console.log(destaque.textContent);  // Primeiro parágrafo\n\n  // Pelo id: repare na cerquilha, igual no CSS\n  const titulo = document.querySelector("#titulo");\n  console.log(titulo.textContent);    // Bem-vindo\n</script>',
                    },
                    {
                        type: "text",
                        value: "## Guardar numa variável\n\nRepare que, nos exemplos, a gente sempre faz `const algumaCoisa = document.querySelector(...)`. Isso é importante: a busca devolve o elemento, e a gente **guarda** esse elemento numa variável com um nome claro.\n\nPor quê? Porque quase sempre vamos usar o mesmo elemento **várias vezes**: ler o texto dele, depois mudar a cor, depois reagir a um clique. Se guardarmos uma vez numa variável, não precisamos ficar procurando o mesmo elemento repetidas vezes. É como anotar o endereço de alguém: você o descobre uma vez e depois é só consultar a anotação.",
                    },
                    {
                        type: "code",
                        value: '<button id="salvar">Salvar</button>\n\n<script>\n  // Achamos o botão UMA vez e guardamos na variável "botao"\n  const botao = document.querySelector("#salvar");\n\n  // Agora usamos essa mesma variável quantas vezes quisermos:\n  console.log(botao.textContent);    // Salvar\n  botao.textContent = "Salvando..."; // muda o texto do botão\n  // (sem precisar chamar querySelector de novo)\n</script>',
                    },
                    {
                        type: "text",
                        value: "## `querySelectorAll`: todos que casarem\n\nO `querySelector` traz **um** elemento (o primeiro). Mas e quando você quer **todos** os que casam com o seletor, todos os itens de uma lista, por exemplo? Aí entra o irmão dele: o `document.querySelectorAll`.\n\nEle devolve uma **coleção** com todos os elementos que combinam, parecida com uma lista. Você pode contar quantos vieram com `.length` e percorrer um por um com o `forEach`, aquele mesmo que você viu ao estudar arrays.",
                    },
                    {
                        type: "code",
                        value: '<ul>\n  <li>Maçã</li>\n  <li>Banana</li>\n  <li>Uva</li>\n</ul>\n\n<script>\n  // Pega TODOS os <li> da página numa coleção\n  const itens = document.querySelectorAll("li");\n\n  console.log(itens.length); // 3  (vieram três itens)\n\n  // Percorre a coleção e mostra o texto de cada um\n  itens.forEach((item) => {\n    console.log(item.textContent);\n  });\n  // no console aparece, em três linhas: Maçã / Banana / Uva\n</script>',
                    },
                    {
                        type: "table",
                        value: '[["Método","O que devolve","Quando usar"],["`getElementById(id)`","Um elemento (o do id) ou null","Quando o elemento tem um id"],["`querySelector(sel)`","O primeiro que casar, ou null","Pegar um elemento específico"],["`querySelectorAll(sel)`","Todos que casarem (uma coleção)","Pegar vários elementos de uma vez"]]',
                    },
                    {
                        type: "text",
                        value: '## `getElementById`: o atalho pelo id\n\nExiste ainda um método mais antigo e muito usado quando o elemento tem um **id**: o `document.getElementById`. Como todo id é único na página, ele vai direto no alvo.\n\nUma diferença de escrita para não tropeçar: aqui você passa **só o nome do id, sem a cerquilha** `#`. É `getElementById("titulo")`, e não `getElementById("#titulo")`. Já no `querySelector`, como ele aceita qualquer seletor CSS, o `#` é obrigatório. Na prática, `document.getElementById("x")` e `document.querySelector("#x")` fazem a mesma coisa.',
                    },
                    {
                        type: "code",
                        value: '<h1 id="titulo">Olá</h1>\n\n<script>\n  // Sem a cerquilha: passa só o nome do id\n  const titulo = document.getElementById("titulo");\n  console.log(titulo.textContent); // Olá\n\n  // A forma equivalente com querySelector (aqui a # é obrigatória):\n  const mesmoTitulo = document.querySelector("#titulo");\n  console.log(mesmoTitulo.textContent); // Olá\n</script>',
                    },
                    {
                        type: "text",
                        value: '## E se não achar nada?\n\nVale saber desde já: se o `querySelector` (ou o `getElementById`) **não encontra** nenhum elemento com aquele seletor, ele não dá erro na hora, apenas devolve um valor especial que significa "nada": o `null`.\n\nIsso costuma pegar o iniciante de surpresa, porque o erro só aparece **depois**, quando você tenta mexer no que "não existe". Duas causas clássicas: um **erro de digitação** no seletor (escreveu `".btn"` mas a classe é `"botao"`) ou o velho problema do `<script>` rodando **antes** de o elemento existir na página, por isso a gente coloca o script antes do `</body>`.',
                    },
                    {
                        type: "code",
                        value: '<script>\n  // Não existe nenhum elemento com a classe "nao-existe"\n  const fantasma = document.querySelector(".nao-existe");\n  console.log(fantasma); // null  (não achou nada)\n\n  // Tentar mexer no que é null dá erro:\n  // fantasma.textContent = "oi";\n  // -> Uncaught TypeError: Cannot set properties of null\n</script>',
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** para **selecionar** elementos, use `document.querySelector("seletor")`, que devolve o **primeiro** que casar com um **seletor CSS** (`"p"`, `".classe"`, `"#id"`), ou `document.querySelectorAll(...)`, que devolve **todos** numa coleção percorrível com `forEach`. Quando há id, `document.getElementById("id")` vai direto (sem o `#`). **Guarde** o resultado numa `const` para reutilizar. Se nada casa, o retorno é `null`, e mexer em `null` dá erro.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual método devolve o primeiro elemento que casa com um seletor CSS?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O método `document.querySelector(...)`.",
                                isCorrect: true,
                            },
                            {
                                text: "O método `document.createElement(...)`.",
                                isCorrect: false,
                            },
                            {
                                text: "O método `document.style(...)`.",
                                isCorrect: false,
                            },
                            {
                                text: "O método `document.print(...)`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para pegar de uma vez TODOS os `<li>` da página, qual método usar?",
                        difficulty: "facil",
                        options: [
                            {
                                text: 'O método `document.querySelectorAll("li")`.',
                                isCorrect: true,
                            },
                            {
                                text: 'O método `document.querySelector("li")`, que já traz todos.',
                                isCorrect: false,
                            },
                            {
                                text: 'O método `document.getElementById("li")`.',
                                isCorrect: false,
                            },
                            {
                                text: 'O método `document.querySelectorMany("li")`.',
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual chamada seleciona corretamente o elemento cujo id é `menu` usando `getElementById`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: '`document.getElementById("menu")` (sem a cerquilha).',
                                isCorrect: true,
                            },
                            {
                                text: '`document.getElementById("#menu")` (com a cerquilha).',
                                isCorrect: false,
                            },
                            {
                                text: "`document.getElementById(menu)` (sem aspas).",
                                isCorrect: false,
                            },
                            {
                                text: '`document.getElementById(".menu")` (com ponto).',
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'No seletor `document.querySelector(".destaque")`, o que o ponto antes de `destaque` indica?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que estamos selecionando pela classe `destaque` (igual no CSS).",
                                isCorrect: true,
                            },
                            {
                                text: "Que estamos selecionando pelo id `destaque`.",
                                isCorrect: false,
                            },
                            {
                                text: "Que estamos selecionando pelo nome da tag `destaque`.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o elemento será apagado da página.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Você escreve `const btn = document.querySelector(".enviar")`, mas não existe nenhum elemento com essa classe. O que acontece?',
                        difficulty: "dificil",
                        options: [
                            {
                                text: "`btn` recebe `null`; e, se você tentar mexer em `btn` depois, aí sim ocorre um erro.",
                                isCorrect: true,
                            },
                            {
                                text: "O navegador cria automaticamente um elemento com a classe `enviar`.",
                                isCorrect: false,
                            },
                            {
                                text: "A página inteira deixa de carregar imediatamente.",
                                isCorrect: false,
                            },
                            {
                                text: "`btn` recebe o primeiro elemento da página, seja ele qual for.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Mudando conteúdo e estilo",
                blocks: [
                    {
                        type: "text",
                        value: '# Mudando conteúdo e estilo\n\nVocê já sabe **achar** um elemento. Agora vem a parte que dá aquele sorriso de "eu fiz isso acontecer": **mudar** o elemento. Trocar o texto, mudar a cor, acender e apagar um destaque, tudo pelo JavaScript, ao vivo, na tela.\n\nNesta aula você vai aprender três ferramentas de mudança: mexer no **texto**, mexer no **estilo** direto e, a forma mais elegante, **ligar e desligar classes** do CSS. Com elas você já cria interatividade visual de verdade.',
                    },
                    {
                        type: "quote",
                        value: "Depois de selecionar um elemento e guardá-lo numa variável, você muda três coisas principais: o **conteúdo**, com `textContent` (texto puro) ou `innerHTML` (com tags); o **estilo direto**, com `style`; e as **classes** do CSS, com `classList` (`add`, `remove`, `toggle`). Mudar classe costuma ser a melhor opção, porque deixa a aparência no CSS, onde ela deve ficar.",
                    },
                    {
                        type: "text",
                        value: '## `textContent`: trocar o texto\n\nA mudança mais comum é trocar o **texto** de um elemento. Para isso existe o `textContent`, que representa o texto de dentro do elemento. Ele funciona nos dois sentidos, a tal ponte de mão dupla:\n\n- **lendo**: `elemento.textContent` te dá o texto atual;\n- **escrevendo**: `elemento.textContent = "novo texto"` troca o texto na tela na hora.\n\nPense no `textContent` como o "recheio de texto" da tag: você pode espiar o recheio ou trocar por outro.',
                    },
                    {
                        type: "code",
                        value: '<h1 id="saudacao">Olá, visitante</h1>\n\n<script>\n  const saudacao = document.querySelector("#saudacao");\n\n  // Lendo o texto atual\n  console.log(saudacao.textContent); // Olá, visitante\n\n  // Escrevendo um texto novo: a tela muda na hora\n  saudacao.textContent = "Olá, Maria!";\n  // o <h1> passa a mostrar: Olá, Maria!\n</script>',
                    },
                    {
                        type: "text",
                        value: "## `innerHTML`: trocar o HTML de dentro\n\nE se, em vez de texto puro, você quiser colocar conteúdo **com tags** dentro do elemento, um trecho em negrito, um link, vários itens? Aí entra o `innerHTML`, que representa **todo o HTML** de dentro da tag. O que você escreve nele é interpretado como HTML de verdade.\n\nIsso dá mais poder, mas pede cuidado: use `innerHTML` só com conteúdo que **você** controla. Jogar ali dentro um texto que veio de um usuário, sem tratar, abre uma porta clássica de falha de segurança. Para simplesmente trocar um texto, prefira o `textContent`, que é mais seguro e mais rápido.",
                    },
                    {
                        type: "code",
                        value: '<div id="aviso"></div>\n\n<script>\n  const aviso = document.querySelector("#aviso");\n\n  // Com innerHTML, as tags são interpretadas como HTML:\n  aviso.innerHTML = "<strong>Atenção:</strong> promoção acaba hoje!";\n  // na tela aparece "Atenção:" em negrito, seguido do resto\n\n  // Compare com o textContent, que mostraria as tags como texto cru:\n  // aviso.textContent = "<strong>Atenção</strong>";\n  // -> apareceria literalmente: <strong>Atenção</strong>\n</script>',
                    },
                    {
                        type: "table",
                        value: '[["","`textContent`","`innerHTML`"],["Trata o valor como","Texto puro","HTML (interpreta as tags)"],["`<b>oi</b>` vira","O texto <b>oi</b> na tela","A palavra oi em negrito"],["Segurança","Mais seguro","Exige cuidado com conteúdo externo"],["Use para","Trocar um texto simples","Inserir conteúdo com tags"]]',
                    },
                    {
                        type: "text",
                        value: "## Mudando o estilo com `style`\n\nDá para mexer no **visual** de um elemento direto pelo JavaScript, usando a propriedade `style`. Cada propriedade do CSS vira uma propriedade dentro de `style`, com um detalhe de escrita: nomes que no CSS têm **hífen** viram **camelCase** no JavaScript.\n\nOu seja, o `background-color` do CSS vira `style.backgroundColor` no JavaScript (o hífen some e a próxima letra fica maiúscula). Já `color`, que não tem hífen, continua `style.color`.",
                    },
                    {
                        type: "code",
                        value: '<p id="texto">Olhe como eu mudo de cor</p>\n\n<script>\n  const texto = document.querySelector("#texto");\n\n  texto.style.color = "white";            // cor da letra\n  texto.style.backgroundColor = "tomato"; // background-color -> backgroundColor\n  texto.style.padding = "12px";           // um respiro em volta\n  texto.style.borderRadius = "8px";       // border-radius -> borderRadius\n  // o parágrafo aparece com letra branca sobre fundo vermelho, arredondado\n</script>',
                    },
                    {
                        type: "text",
                        value: '## O jeito mais elegante: classes com `classList`\n\nMudar `style` propriedade por propriedade funciona, mas fica bagunçado quando são muitas mudanças. Existe um caminho melhor, que mantém a aparência **no CSS**, onde ela deve morar: você deixa o visual pronto numa **classe** e usa o JavaScript só para **pôr e tirar** essa classe do elemento.\n\nA ferramenta para isso é o `classList`, que traz três ações principais:\n\n- `classList.add("nome")`: **adiciona** a classe (liga o visual);\n- `classList.remove("nome")`: **remove** a classe (desliga o visual);\n- `classList.toggle("nome")`: **alterna**, se tem, tira; se não tem, põe.',
                    },
                    {
                        type: "code",
                        value: '<style>\n  /* O visual pronto, morando no CSS */\n  .destaque { background: yellow; font-weight: bold; }\n</style>\n\n<p id="frase">Uma frase qualquer</p>\n\n<script>\n  const frase = document.querySelector("#frase");\n\n  // Liga o visual: agora a frase fica amarela e em negrito\n  frase.classList.add("destaque");\n\n  // Desliga o visual: volta ao normal\n  frase.classList.remove("destaque");\n</script>',
                    },
                    {
                        type: "text",
                        value: '## `toggle`: o interruptor de luz\n\nO `toggle` é o queridinho da interatividade. Ele é um **interruptor**: se a classe **não** está no elemento, ele a coloca; se **já** está, ele a tira. Assim, com uma única linha rodando de novo e de novo, você **liga e desliga** um efeito, perfeito para um botão que ativa e desativa alguma coisa.\n\nUm exemplo típico é um "modo escuro" que a pessoa aciona e desaciona no mesmo botão.',
                    },
                    {
                        type: "code",
                        value: '<style>\n  .tema-escuro { background: #222; color: #eee; }\n</style>\n\n<body>\n  <button id="btnTema">Alternar tema</button>\n\n  <script>\n    const botao = document.querySelector("#btnTema");\n\n    // (na próxima aula você aprende o addEventListener;\n    //  por enquanto veja só o toggle em ação)\n    // Cada vez que esta linha roda, o tema escuro liga ou desliga:\n    document.body.classList.toggle("tema-escuro");\n  </script>\n</body>',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando:** com o elemento em mãos, você muda o **conteúdo** com `textContent` (texto puro, mais seguro) ou `innerHTML` (interpreta tags, use com cuidado); muda o **estilo direto** com `style`, lembrando que `background-color` vira `style.backgroundColor` (camelCase); e, o mais elegante, liga e desliga **classes** do CSS com `classList.add`, `classList.remove` e `classList.toggle`. Preferir classes deixa a aparência no CSS e o JavaScript só decidindo **quando** aplicá-la.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual propriedade troca o texto (puro) de dentro de um elemento?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A propriedade `textContent`.",
                                isCorrect: true,
                            },
                            {
                                text: "A propriedade `innerColor`.",
                                isCorrect: false,
                            },
                            {
                                text: "A propriedade `document`.",
                                isCorrect: false,
                            },
                            {
                                text: "A propriedade `addText`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: 'O que faz `elemento.classList.toggle("ativo")`?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "Alterna a classe `ativo`: se o elemento não a tem, adiciona; se já a tem, remove.",
                                isCorrect: true,
                            },
                            {
                                text: "Adiciona a classe `ativo` e nunca mais a remove.",
                                isCorrect: false,
                            },
                            {
                                text: "Apaga o elemento da página.",
                                isCorrect: false,
                            },
                            {
                                text: "Muda o texto do elemento para `ativo`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No CSS, a propriedade é `background-color`. Como você a escreve ao mexer pelo `style` no JavaScript?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`elemento.style.backgroundColor` (em camelCase, sem o hífen).",
                                isCorrect: true,
                            },
                            {
                                text: "`elemento.style.background-color` (igual ao CSS, com hífen).",
                                isCorrect: false,
                            },
                            {
                                text: "`elemento.style.BACKGROUND_COLOR` (tudo maiúsculo).",
                                isCorrect: false,
                            },
                            {
                                text: "`elemento.css.backgroundColor` (usando `css` no lugar de `style`).",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual a diferença entre `textContent` e `innerHTML`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "`textContent` trata o valor como texto puro; `innerHTML` interpreta o valor como HTML (as tags viram elementos).",
                                isCorrect: true,
                            },
                            {
                                text: "Não há diferença: os dois fazem exatamente a mesma coisa.",
                                isCorrect: false,
                            },
                            {
                                text: "`textContent` só funciona em imagens e `innerHTML` só em botões.",
                                isCorrect: false,
                            },
                            {
                                text: "`innerHTML` apaga a página e `textContent` a recarrega.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você quer um botão que liga e desliga um visual já definido na classe `.ativo` do CSS. Qual é a abordagem mais elegante?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: 'Usar `classList.toggle("ativo")`, deixando a aparência no CSS e o JavaScript só decidindo quando aplicá-la.',
                                isCorrect: true,
                            },
                            {
                                text: "Escrever dezenas de linhas de `style` para ligar e outras tantas para desligar.",
                                isCorrect: false,
                            },
                            {
                                text: "Recarregar a página inteira a cada clique.",
                                isCorrect: false,
                            },
                            {
                                text: "Trocar o `textContent` do botão a cada clique.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Eventos",
                blocks: [
                    {
                        type: "text",
                        value: '# Eventos\n\nAté agora, o seu JavaScript rodava uma vez, de cima para baixo, e acabava. Mas uma página de verdade fica **esperando** a pessoa fazer coisas: clicar, digitar, enviar um formulário. Como o código "acorda" na hora certa e responde a essas ações?\n\nA resposta são os **eventos**. Esta é, talvez, a aula mais importante do módulo: é aqui que a página finalmente **reage**, e deixa de ser um cartaz parado para virar algo que responde a você.',
                    },
                    {
                        type: "quote",
                        value: 'Um **evento** é algo que acontece na página: um clique, uma tecla, o envio de um formulário. Com `elemento.addEventListener("evento", função)` você diz ao navegador: *fique de olho neste elemento; quando este evento acontecer, rode esta função*. A função só roda **quando** a ação ocorre, quantas vezes ela ocorrer.',
                    },
                    {
                        type: "text",
                        value: '## Ficar de olho e reagir\n\nPense numa **campainha** de casa. Você não fica a manhã toda parado na porta esperando visita; você instala uma campainha e vai viver a sua vida. **Quando** alguém aperta o botão, a campainha toca e aí você atende. O aperto é o **evento**; atender a porta é a **reação**.\n\nNo DOM é a mesma ideia. Você não fica perguntando o tempo todo "já clicaram? já clicaram?". Em vez disso, você **instala um ouvinte** num elemento e segue em frente. Quando o evento acontece, o navegador chama a sua função automaticamente.',
                    },
                    {
                        type: "text",
                        value: '## `addEventListener`: instalando o ouvinte\n\nA ferramenta central é o método `addEventListener` (em português, "adicionar ouvinte de evento"). Você o chama **no elemento** que quer vigiar e passa **duas coisas**:\n\n1. o **nome do evento**, entre aspas, por exemplo `"click"`;\n2. a **função** que deve rodar quando o evento acontecer, chamada de *handler* (ou "manipulador").\n\nEssa função fica ali, guardada, esperando. Ela não roda quando o código é lido; ela roda **depois**, toda vez que a ação acontecer.',
                    },
                    {
                        type: "code",
                        value: '<button id="botao">Clique em mim</button>\n\n<script>\n  const botao = document.querySelector("#botao");\n\n  // "Quando ESTE botão receber um clique, rode ESTA função"\n  botao.addEventListener("click", function () {\n    console.log("O botão foi clicado!");\n  });\n\n  // Nada aparece ainda: a função só roda quando você clicar.\n  // A cada clique, aparece no console: O botão foi clicado!\n</script>',
                    },
                    {
                        type: "text",
                        value: '## Reagindo com uma mudança na página\n\nUm `console.log` prova que o clique funcionou, mas a graça é **mudar a página** na reação. E você já sabe fazer isso: dentro da função, é só usar as ferramentas da aula passada (`textContent`, `classList`, `style`).\n\nJuntando as duas ideias, selecionar e reagir, dá para, por exemplo, fazer um botão que conta quantas vezes foi clicado. Repare que a variável `contador` vive **fora** da função e é ela que "lembra" o número entre um clique e outro.',
                    },
                    {
                        type: "code",
                        value: '<button id="mais">Cliquei 0 vezes</button>\n\n<script>\n  const botao = document.querySelector("#mais");\n  let contador = 0; // guarda o total de cliques\n\n  botao.addEventListener("click", function () {\n    contador = contador + 1; // soma mais um a cada clique\n    botao.textContent = "Cliquei " + contador + " vezes";\n  });\n  // clicando, o texto vira "Cliquei 1 vezes", "Cliquei 2 vezes"...\n</script>',
                    },
                    {
                        type: "text",
                        value: "## O objeto do evento\n\nQuando o navegador chama a sua função, ele entrega a ela um **presente**: um objeto com informações sobre o que acabou de acontecer. Basta declarar um parâmetro para recebê-lo, muita gente chama de `event`, ou só `e`.\n\nDentro desse objeto tem coisa útil. A mais usada é o `event.target`: o **elemento exato** que disparou o evento. Assim, dentro da função, você sabe **quem** foi clicado sem precisar selecioná-lo de novo.",
                    },
                    {
                        type: "code",
                        value: '<button class="cor">Vermelho</button>\n<button class="cor">Verde</button>\n\n<script>\n  const botoes = document.querySelectorAll(".cor");\n\n  botoes.forEach((botao) => {\n    botao.addEventListener("click", function (event) {\n      // event.target é o botão que recebeu ESTE clique\n      console.log("Você clicou em:", event.target.textContent);\n      event.target.style.fontWeight = "bold";\n    });\n  });\n  // clicar no "Verde" mostra: Você clicou em: Verde (e ele fica em negrito)\n</script>',
                    },
                    {
                        type: "text",
                        value: '## Eventos de digitação: `input`\n\nNem só de cliques vive a interatividade. Quando a pessoa **digita** num campo de texto, dispara o evento `input`, uma vez a cada tecla. É com ele que você faz aquelas reações "ao vivo": um contador de caracteres, uma busca que filtra enquanto você digita, um espelho que repete o que está sendo escrito.\n\nPara ler o que foi digitado, use a propriedade `value` do campo (é `value`, e não `textContent`: campos de formulário guardam o conteúdo no `value`).',
                    },
                    {
                        type: "code",
                        value: '<input id="campo" placeholder="Digite algo">\n<p id="espelho"></p>\n\n<script>\n  const campo = document.querySelector("#campo");\n  const espelho = document.querySelector("#espelho");\n\n  campo.addEventListener("input", function () {\n    // campo.value = o texto atual dentro do input\n    espelho.textContent = "Você digitou: " + campo.value;\n  });\n  // a cada tecla, o parágrafo mostra em tempo real o que foi digitado\n</script>',
                    },
                    {
                        type: "text",
                        value: '## Enviar formulário: `submit` e o `preventDefault`\n\nQuando um formulário é enviado (a pessoa clica em "Enviar" ou aperta Enter), dispara o evento `submit`, **no elemento `<form>`**. Só que ele traz um comportamento padrão herdado da web antiga: **recarregar a página**. Isso apaga tudo o que o seu JavaScript fez.\n\nPara impedir esse recarregamento e tratar o envio você mesmo, chame `event.preventDefault()` (em português, "previna o comportamento padrão") logo no começo da função. É quase um reflexo: tratou `submit`, chamou `preventDefault`.',
                    },
                    {
                        type: "code",
                        value: '<form id="formulario">\n  <input id="nome" placeholder="Seu nome">\n  <button type="submit">Enviar</button>\n</form>\n<p id="resultado"></p>\n\n<script>\n  const form = document.querySelector("#formulario");\n  const nome = document.querySelector("#nome");\n  const resultado = document.querySelector("#resultado");\n\n  form.addEventListener("submit", function (event) {\n    event.preventDefault(); // impede o recarregamento da página\n    resultado.textContent = "Olá, " + nome.value + "!";\n  });\n  // ao enviar, a página NÃO recarrega e aparece: Olá, [nome]!\n</script>',
                    },
                    {
                        type: "table",
                        value: '[["Evento","Acontece quando...","Elemento típico"],["`click`","A pessoa clica","Botões, links, qualquer coisa"],["`input`","O conteúdo de um campo muda","`<input>`, `<textarea>`"],["`submit`","Um formulário é enviado","`<form>`"],["`mouseover`","O mouse passa por cima","Qualquer elemento"],["`keydown`","Uma tecla é pressionada","Campos, a página toda"]]',
                    },
                    {
                        type: "quote",
                        value: '**Recapitulando:** um **evento** é uma ação na página, e `elemento.addEventListener("evento", função)` registra uma função para rodar **quando** ela acontece. O evento mais comum é o `"click"`. A função recebe o **objeto do evento** (`event`), cujo `event.target` é o elemento que disparou a ação. Para campos, o `"input"` reage à digitação (leia o texto em `campo.value`); para formulários, o `"submit"` reage ao envio, e você chama `event.preventDefault()` para impedir o recarregamento da página.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual método registra uma função para rodar quando um evento acontece num elemento?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O método `addEventListener`.",
                                isCorrect: true,
                            },
                            {
                                text: "O método `querySelector`.",
                                isCorrect: false,
                            },
                            {
                                text: "O método `createElement`.",
                                isCorrect: false,
                            },
                            {
                                text: "O método `preventDefault`.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o nome do evento que acontece quando a pessoa clica num botão?",
                        difficulty: "facil",
                        options: [
                            {
                                text: 'O evento `"click"`.',
                                isCorrect: true,
                            },
                            {
                                text: 'O evento `"press"`.',
                                isCorrect: false,
                            },
                            {
                                text: 'O evento `"hover"`.',
                                isCorrect: false,
                            },
                            {
                                text: 'O evento `"submit"`.',
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Dentro da função que reage ao evento, o que é `event.target`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O elemento exato que disparou o evento (por exemplo, o botão que foi clicado).",
                                isCorrect: true,
                            },
                            {
                                text: "O texto que a pessoa digitou no teclado.",
                                isCorrect: false,
                            },
                            {
                                text: "A cor de fundo da página.",
                                isCorrect: false,
                            },
                            {
                                text: "Um número que conta quantos cliques houve.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao tratar o evento `submit` de um formulário, para que serve `event.preventDefault()`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Impede o comportamento padrão de recarregar a página, deixando você tratar o envio pelo JavaScript.",
                                isCorrect: true,
                            },
                            {
                                text: "Envia o formulário duas vezes para garantir.",
                                isCorrect: false,
                            },
                            {
                                text: "Apaga tudo o que a pessoa digitou no formulário.",
                                isCorrect: false,
                            },
                            {
                                text: "Impede que o usuário clique no botão de enviar.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você quer reagir ao que a pessoa digita num `<input>` e ler o texto atual do campo. Qual combinação está correta?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: 'Ouvir o evento `"input"` e ler o texto em `campo.value`.',
                                isCorrect: true,
                            },
                            {
                                text: 'Ouvir o evento `"click"` e ler o texto em `campo.textContent`.',
                                isCorrect: false,
                            },
                            {
                                text: 'Ouvir o evento `"submit"` e ler o texto em `campo.innerHTML`.',
                                isCorrect: false,
                            },
                            {
                                text: 'Ouvir o evento `"input"` e ler o texto em `campo.target`.',
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Mini-projeto: juntando tudo",
                blocks: [
                    {
                        type: "text",
                        value: "# Mini-projeto: juntando tudo\n\nChegamos ao fim da trilha, e não há jeito melhor de fechar do que **construindo** algo de verdade. Neste projeto final, as três tecnologias trabalham juntas, cada uma no seu papel: o **HTML** desenha a estrutura, o **CSS** dá o visual e o **JavaScript** faz tudo reagir.\n\nVamos montar uma **lista de tarefas** interativa: um campo para escrever a tarefa, um botão que a adiciona à lista, e a possibilidade de **marcar como feita** ou **remover** cada item, tudo ao vivo, sem recarregar a página. Vá acompanhando com calma; no fim, o código completo e comentado está reunido para você copiar e brincar.",
                    },
                    {
                        type: "quote",
                        value: "Todo projeto de front-end segue a mesma receita: o **HTML** cria a estrutura, o **CSS** cuida da aparência, e o **JavaScript** faz o comportamento em três passos, **selecionar** os elementos, **ouvir** os eventos e **mudar** o DOM em resposta. Guarde essa receita: ela é o resumo de tudo o que você aprendeu.",
                    },
                    {
                        type: "text",
                        value: "## O que vamos construir\n\nAntes de escrever, vale desenhar o combinado. A nossa lista de tarefas vai fazer o seguinte:\n\n- a pessoa **digita** uma tarefa no campo e clica em **Adicionar** (ou aperta Enter);\n- a tarefa vira um **item novo** na lista, na hora;\n- **clicar** num item o marca como **feito** (com um risco no texto);\n- cada item tem um **X** para **removê-lo** da lista.\n\nRepare que cada um desses comportamentos usa exatamente o que você aprendeu: selecionar, eventos de `submit` e `click`, ler `value`, mudar o DOM e alternar classe com `classList.toggle`.",
                    },
                    {
                        type: "text",
                        value: '## Passo 1: o esqueleto (HTML)\n\nComeçamos pela estrutura. É bem enxuta: um formulário com um campo e um botão, e uma lista `<ul>` vazia, que o JavaScript vai preenchendo. O formulário ganha o comportamento de "enviar ao apertar Enter" de graça, por isso usamos um `<form>`.',
                    },
                    {
                        type: "code",
                        value: '<h1>Minha lista de tarefas</h1>\n\n<!-- O formulário: campo + botão de adicionar -->\n<form id="form">\n  <input id="campo" placeholder="O que precisa ser feito?" />\n  <button type="submit">Adicionar</button>\n</form>\n\n<!-- A lista começa vazia; o JavaScript vai enchê-la -->\n<ul id="lista"></ul>',
                    },
                    {
                        type: "text",
                        value: '## Passo 2: a roupa (CSS)\n\nAgora um pouco de estilo para não ficar sem graça. O ponto mais importante é a classe `.feita`: é ela que dá o visual de "tarefa concluída" (texto riscado e apagadinho). Quem vai **ligar e desligar** essa classe, mais tarde, é o JavaScript, com o `classList.toggle`.',
                    },
                    {
                        type: "code",
                        value: '<style>\n  body { font-family: sans-serif; max-width: 400px; margin: 40px auto; }\n  form { display: flex; gap: 8px; }\n  input { flex: 1; padding: 8px; }\n\n  li {\n    display: flex;\n    justify-content: space-between;\n    padding: 8px;\n    border-bottom: 1px solid #ddd;\n    cursor: pointer;\n  }\n\n  /* O visual de "tarefa feita": o JS liga esta classe com toggle */\n  li.feita {\n    text-decoration: line-through;\n    color: #999;\n  }\n\n  /* O X de remover */\n  .remover { color: crimson; font-weight: bold; }\n</style>',
                    },
                    {
                        type: "text",
                        value: '## Passo 3: dar vida (JavaScript)\n\nAqui mora a lógica. Primeiro, seguindo a receita, a gente **seleciona** os elementos fixos (o formulário, o campo e a lista) e guarda cada um numa variável. Depois, **ouvimos** o `submit` do formulário para **adicionar** a tarefa.\n\nPara criar um item novo na hora, usamos duas ferramentas novas, mas bem intuitivas: `document.createElement("li")` **cria** um elemento do zero (um `<li>` que ainda não está na tela), e `lista.appendChild(item)` **encaixa** esse item como filho da lista, aí sim ele aparece. É como fabricar uma peça e depois pendurá-la na árvore do DOM.',
                    },
                    {
                        type: "code",
                        value: '<script>\n  // 1. SELECIONAR os elementos fixos e guardar em variáveis\n  const form = document.querySelector("#form");\n  const campo = document.querySelector("#campo");\n  const lista = document.querySelector("#lista");\n\n  // 2. OUVIR o envio do formulário para adicionar a tarefa\n  form.addEventListener("submit", function (event) {\n    event.preventDefault();           // não recarrega a página\n    const texto = campo.value.trim(); // o que foi digitado, sem espaços sobrando\n    if (texto === "") return;          // ignora se estiver vazio\n\n    criarTarefa(texto); // 3. MUDAR o DOM: cria o item (função abaixo)\n    campo.value = "";   // limpa o campo para a próxima tarefa\n  });\n</script>',
                    },
                    {
                        type: "text",
                        value: '## Criando o item, com marcar e remover\n\nFalta a função `criarTarefa`, o coração do projeto. Ela **cria** o `<li>`, coloca dentro dele o texto e um "X" de remover, e liga os eventos de cada um:\n\n- **um clique no item** alterna a classe `feita` (o `toggle` funcionando como interruptor: risca e desrisca);\n- **um clique no X** remove o item da lista com `item.remove()`. Repare no `event.stopPropagation()`: ele evita que o clique no X "vaze" e também marque a tarefa como feita, já que o X está **dentro** do item.',
                    },
                    {
                        type: "code",
                        value: '<script>\n  function criarTarefa(texto) {\n    // Cria um <li> do zero (ainda fora da tela)\n    const item = document.createElement("li");\n\n    // O texto da tarefa dentro de um <span>\n    const rotulo = document.createElement("span");\n    rotulo.textContent = texto;\n\n    // O "X" de remover\n    const x = document.createElement("span");\n    x.textContent = "X";\n    x.classList.add("remover");\n\n    // Clique no item inteiro: marca/desmarca como feita\n    item.addEventListener("click", function () {\n      item.classList.toggle("feita");\n    });\n\n    // Clique no X: remove o item (e não deixa marcar como feita)\n    x.addEventListener("click", function (event) {\n      event.stopPropagation();\n      item.remove();\n    });\n\n    // Monta o item: texto + X, e encaixa na lista\n    item.appendChild(rotulo);\n    item.appendChild(x);\n    lista.appendChild(item);\n  }\n</script>',
                    },
                    {
                        type: "text",
                        value: "## O projeto completo, num arquivo só\n\nAgora o prêmio: tudo reunido num único `index.html` que você pode salvar e abrir no navegador. É o mesmo HTML, CSS e JavaScript de cima, montados na ordem certa, com o `<script>` no fim (antes do `</body>`), para o HTML já existir quando o código rodar.\n\nLeia o arquivo inteiro como quem lê uma receita pronta: você vai reconhecer **cada pedaço**.",
                    },
                    {
                        type: "code",
                        value: '<!DOCTYPE html>\n<html lang="pt-br">\n<head>\n  <meta charset="UTF-8" />\n  <title>Lista de tarefas</title>\n  <style>\n    body { font-family: sans-serif; max-width: 400px; margin: 40px auto; }\n    form { display: flex; gap: 8px; }\n    input { flex: 1; padding: 8px; }\n    li {\n      display: flex;\n      justify-content: space-between;\n      padding: 8px;\n      border-bottom: 1px solid #ddd;\n      cursor: pointer;\n    }\n    li.feita { text-decoration: line-through; color: #999; }\n    .remover { color: crimson; font-weight: bold; }\n  </style>\n</head>\n<body>\n  <h1>Minha lista de tarefas</h1>\n\n  <form id="form">\n    <input id="campo" placeholder="O que precisa ser feito?" />\n    <button type="submit">Adicionar</button>\n  </form>\n\n  <ul id="lista"></ul>\n\n  <script>\n    // SELECIONAR os elementos fixos\n    const form = document.querySelector("#form");\n    const campo = document.querySelector("#campo");\n    const lista = document.querySelector("#lista");\n\n    // OUVIR o envio do formulário\n    form.addEventListener("submit", function (event) {\n      event.preventDefault();\n      const texto = campo.value.trim();\n      if (texto === "") return;\n      criarTarefa(texto);\n      campo.value = "";\n    });\n\n    // MUDAR o DOM: cria um item novo na lista\n    function criarTarefa(texto) {\n      const item = document.createElement("li");\n\n      const rotulo = document.createElement("span");\n      rotulo.textContent = texto;\n\n      const x = document.createElement("span");\n      x.textContent = "X";\n      x.classList.add("remover");\n\n      // clicar no item marca/desmarca como feita\n      item.addEventListener("click", function () {\n        item.classList.toggle("feita");\n      });\n\n      // clicar no X remove o item\n      x.addEventListener("click", function (event) {\n        event.stopPropagation();\n        item.remove();\n      });\n\n      item.appendChild(rotulo);\n      item.appendChild(x);\n      lista.appendChild(item);\n    }\n  </script>\n</body>\n</html>',
                    },
                    {
                        type: "text",
                        value: '## Parabéns: você fechou a trilha!\n\nPare um instante para ver o tamanho do caminho. Você começou sem saber o que era o JavaScript e acabou de construir um aplicativinho **interativo**, que cria, marca e remove tarefas ao vivo, unindo HTML, CSS e JavaScript num projeto só. Isso é, de verdade, o que um desenvolvedor front-end faz o dia inteiro, só que com mais peças.\n\nE agora, o passo que mais importa: **mexa** no projeto. Mude as cores no CSS, troque o texto do botão, tente fazer o campo pedir uma confirmação antes de remover. Quebre, conserte, experimente. Foi essa curiosidade de "e se eu fizer assim?" que te trouxe até aqui, e é ela que vai te levar muito mais longe. Parabéns e boa jornada!',
                    },
                    {
                        type: "quote",
                        value: "**Recapitulando o módulo:** o navegador transforma o HTML numa árvore de objetos, o **DOM**, acessível pelo `document`. Você **seleciona** elementos com `querySelector` / `querySelectorAll` / `getElementById`, **muda** conteúdo e visual com `textContent`, `innerHTML`, `style` e `classList`, e faz a página **reagir** com `addEventListener` (`click`, `input`, `submit`). Juntando as três tecnologias, HTML para estrutura, CSS para aparência e JavaScript para comportamento, você constrói interfaces interativas de verdade. Fim da trilha; começo da sua jornada.",
                    },
                ],
                questions: [
                    {
                        statement: "Na receita do front-end, qual é o papel do JavaScript?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O comportamento: selecionar elementos, ouvir eventos e mudar a página em resposta.",
                                isCorrect: true,
                            },
                            {
                                text: "A estrutura e o conteúdo da página.",
                                isCorrect: false,
                            },
                            {
                                text: "As cores, as fontes e os espaçamentos.",
                                isCorrect: false,
                            },
                            {
                                text: "Hospedar o site num servidor na internet.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual método cria um novo elemento (por exemplo, um `<li>`) do zero, ainda fora da tela?",
                        difficulty: "facil",
                        options: [
                            {
                                text: 'O método `document.createElement("li")`.',
                                isCorrect: true,
                            },
                            {
                                text: 'O método `document.querySelector("li")`.',
                                isCorrect: false,
                            },
                            {
                                text: 'O método `document.removeElement("li")`.',
                                isCorrect: false,
                            },
                            {
                                text: 'O método `document.newTag("li")`.',
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Depois de criar um elemento com `createElement`, o que faz `lista.appendChild(item)`?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Encaixa o `item` como filho da `lista`, fazendo-o finalmente aparecer na página.",
                                isCorrect: true,
                            },
                            {
                                text: "Apaga o `item` da memória.",
                                isCorrect: false,
                            },
                            {
                                text: "Cria uma cópia do `item` no arquivo HTML salvo no disco.",
                                isCorrect: false,
                            },
                            {
                                text: "Muda a cor do `item` para azul.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'No projeto, clicar num item da lista chama `item.classList.toggle("feita")`. Qual é o efeito?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Liga e desliga o visual de tarefa concluída (o risco no texto), alternando a cada clique.",
                                isCorrect: true,
                            },
                            {
                                text: "Remove o item da lista para sempre.",
                                isCorrect: false,
                            },
                            {
                                text: "Adiciona uma nova tarefa igual à atual.",
                                isCorrect: false,
                            },
                            {
                                text: "Recarrega a página inteira.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No envio do formulário, por que chamamos `event.preventDefault()` logo no começo da função?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque o comportamento padrão do `submit` recarrega a página, o que apagaria as tarefas já adicionadas; o `preventDefault` impede isso.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque sem ele o formulário nunca envia.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque ele adiciona a tarefa à lista automaticamente.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque ele limpa o campo de texto depois de enviar.",
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
                    "Trilha de JavaScript para iniciantes: dê comportamento e interatividade às suas páginas. Variáveis e tipos, operadores, condicionais, loops, funções, arrays, objetos, e o DOM para manipular a página e reagir ao usuário, com muito código pra rodar e praticar.",
            })
            .returning();
    }

    const jaTem = await db
        .select({ id: modules.id })
        .from(modules)
        .where(and(eq(modules.trailId, trilha.id), eq(modules.title, MARCADOR)));
    if (jaTem.length) {
        console.log("Trilha JavaScript já está semeada, nada a fazer.");
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
    console.log("Trilha JavaScript construída: " + DADOS.length + " módulos.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
