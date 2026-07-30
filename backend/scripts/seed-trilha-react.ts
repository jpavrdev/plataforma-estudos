// Seed da trilha React (React 19.2). Conteúdo autoral.
// A linha 19.2 começou em outubro de 2025 e é a que a trilha ensina: Actions,
// useActionState e useOptimistic, ref como prop, useEffectEvent, Activity e o
// React Compiler 1.0.
//
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml run --rm -T --no-deps backend node scripts/seed-trilha-react.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "React";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "React 19.2 do primeiro componente ao deploy: JSX, props e estado, efeitos e o que não deveria ser efeito, composição com hooks próprios e context, as Actions do React 19 com useActionState e useOptimistic, desempenho com o React Compiler, testes com Testing Library e Server Components. A biblioteca de interface mais usada do mundo.";
const CARGA_HORARIA = 24;

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - React do zero",
    aulas: [
        {
            titulo: "O que é React e o que ele resolve",
            blocks: [
                {
                    type: "text",
                    value: "# Descrever, não manipular\n\nAntes do React, atualizar uma tela era **dizer ao navegador o que mudar**: achar o elemento, trocar o texto, remover a classe, esconder o outro. Com muitos estados possíveis, a quantidade de combinações explode e a tela sai de sincronia com os dados.\n\nO React inverte isso: você **descreve como a tela deveria estar** para um determinado estado, e ele calcula o que precisa mudar no navegador.",
                },
                {
                    type: "code",
                    value: '// Manipulando: você diz cada passo\nconst el = document.getElementById("contador");\nel.textContent = valor;\nif (valor > 10) el.classList.add("alerta");\nelse el.classList.remove("alerta");\n\n// Descrevendo: você diz como deve ficar\nfunction Contador({ valor }) {\n  return <span className={valor > 10 ? "alerta" : ""}>{valor}</span>;\n}',
                },
                {
                    type: "text",
                    value: "## Componentes\n\nA unidade do React é o **componente**: uma função que recebe dados e devolve o que aparece na tela. Componentes se compõem, e é assim que uma interface grande é montada a partir de peças pequenas.\n\n## A versão\n\nEsta trilha usa o **React 19.2**, cuja linha começou em outubro de 2025. O React 19 trouxe as Actions e mudanças que simplificaram bastante o dia a dia, e o **React Compiler** chegou à versão 1.0.",
                },
                {
                    type: "quote",
                    value: "Você descreve o resultado para cada estado. Quem decide o que mudar no navegador é o React, não o seu código.",
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença central entre React e manipular o DOM na mão?",
                    difficulty: "medio",
                    options: [
                        { text: "Você descreve o resultado, não os passos", isCorrect: true },
                        {
                            text: "O React executa a página bem mais rápido sempre",
                            isCorrect: false,
                        },
                        { text: "O React dispensa o uso de HTML na aplicação", isCorrect: false },
                        { text: "O React roda no servidor em vez do navegador", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é um componente em React?",
                    difficulty: "facil",
                    options: [
                        { text: "Uma função que devolve o que aparece na tela", isCorrect: true },
                        { text: "Um arquivo com o HTML de uma página inteira", isCorrect: false },
                        {
                            text: "Uma classe que herda de uma classe base do React",
                            isCorrect: false,
                        },
                        { text: "Um objeto com os dados que a tela vai exibir", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual versão do React esta trilha usa?",
                    difficulty: "facil",
                    options: [
                        { text: "React 19.2", isCorrect: true },
                        { text: "React 16.8", isCorrect: false },
                        { text: "React 17.0", isCorrect: false },
                        { text: "React 18.2", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que manipular o DOM na mão fica difícil de manter?",
                    difficulty: "dificil",
                    options: [
                        { text: "A quantidade de combinações de estado explode", isCorrect: true },
                        {
                            text: "O navegador limita quantas alterações são feitas",
                            isCorrect: false,
                        },
                        {
                            text: "O JavaScript não consegue acessar todos os elementos",
                            isCorrect: false,
                        },
                        { text: "O HTML precisa ser reescrito a cada alteração", isCorrect: false },
                    ],
                },
                {
                    statement: "Como uma interface grande é montada em React?",
                    difficulty: "facil",
                    options: [
                        { text: "Compondo componentes pequenos", isCorrect: true },
                        {
                            text: "Escrevendo um componente com toda a tela dentro",
                            isCorrect: false,
                        },
                        {
                            text: "Separando o HTML, o CSS e o JavaScript em arquivos",
                            isCorrect: false,
                        },
                        {
                            text: "Gerando o HTML a partir de um arquivo de modelo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Criando o projeto com Vite",
            blocks: [
                {
                    type: "text",
                    value: "# O ponto de partida\n\nO **Vite** é a ferramenta padrão para começar um projeto React hoje. Ele sobe um servidor de desenvolvimento que atualiza a tela na hora e gera o build de produção.",
                },
                {
                    type: "code",
                    value: "npm create vite@latest minha-app -- --template react-ts\ncd minha-app\nnpm install\nnpm run dev\n# http://localhost:5173",
                },
                {
                    type: "text",
                    value: "O template `react-ts` já vem com TypeScript configurado, e é o que a maioria dos projetos usa. Vale começar assim mesmo sem saber TypeScript ainda: os tipos ajudam antes de você entender todos eles.\n\n## A estrutura\n\nO projeto gerado é pequeno de propósito. `index.html` é o ponto de entrada, `src/main.tsx` conecta o React à página e `src/App.tsx` é o primeiro componente.",
                },
                {
                    type: "code",
                    value: '// src/main.tsx\nimport { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App";\n\ncreateRoot(document.getElementById("root")!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n);',
                },
                {
                    type: "text",
                    value: "## StrictMode\n\nO `StrictMode` só existe em desenvolvimento e **monta cada componente duas vezes** de propósito. Isso assusta quem vê um `console.log` aparecer duplicado, mas é um recurso: ele revela efeitos que não são seguros para rodar mais de uma vez.\n\nEm produção nada disso acontece. Se um bug some ao remover o StrictMode, o bug é real e continua lá.",
                },
            ],
            questions: [
                {
                    statement: "Qual ferramenta é o padrão para criar projeto React hoje?",
                    difficulty: "facil",
                    options: [
                        { text: "O Vite", isCorrect: true },
                        {
                            text: "O Create React App, mantido pela equipe do React",
                            isCorrect: false,
                        },
                        { text: "O Webpack, configurado manualmente no projeto", isCorrect: false },
                        { text: "O Parcel, que dispensa qualquer configuração", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `StrictMode` faz em desenvolvimento?",
                    difficulty: "medio",
                    options: [
                        { text: "Monta cada componente duas vezes", isCorrect: true },
                        { text: "Impede que erros de tipo passem despercebidos", isCorrect: false },
                        {
                            text: "Bloqueia o uso de recursos que serão removidos",
                            isCorrect: false,
                        },
                        {
                            text: "Executa os componentes em modo somente leitura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o StrictMode monta duas vezes?",
                    difficulty: "dificil",
                    options: [
                        { text: "Para revelar efeitos que não podem repetir", isCorrect: true },
                        { text: "Para medir o tempo de renderização de cada um", isCorrect: false },
                        {
                            text: "Para garantir que o estado inicial esteja correto",
                            isCorrect: false,
                        },
                        { text: "Para comparar o resultado das duas montagens", isCorrect: false },
                    ],
                },
                {
                    statement: "O StrictMode afeta o comportamento em produção?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, ele só existe em desenvolvimento", isCorrect: true },
                        {
                            text: "Sim, ele deixa a aplicação um pouco mais lenta",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, ele mantém a montagem dupla dos componentes",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, ele bloqueia recursos considerados inseguros",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Se um bug some ao remover o StrictMode, o que isso significa?",
                    difficulty: "dificil",
                    options: [
                        { text: "O bug é real e continua no código", isCorrect: true },
                        {
                            text: "O StrictMode estava criando o problema sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "O componente precisa ser reescrito como classe",
                            isCorrect: false,
                        },
                        {
                            text: "O bug só acontece no ambiente de desenvolvimento",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "JSX",
            blocks: [
                {
                    type: "text",
                    value: "# HTML dentro do JavaScript\n\nO **JSX** parece HTML, mas é JavaScript. Cada tag vira uma chamada de função que o React usa para montar a tela.\n\nComo é JavaScript, algumas palavras mudam: `class` já existe na linguagem, então vira `className`; `for` vira `htmlFor`.",
                },
                {
                    type: "code",
                    value: 'const nome = "Ana";\nconst logado = true;\n\nfunction Saudacao() {\n  return (\n    <div className="caixa">\n      <h1>Olá, {nome}</h1>\n      {logado && <p>Bem-vinda de volta</p>}\n      <p>{logado ? "Sair" : "Entrar"}</p>\n    </div>\n  );\n}',
                },
                {
                    type: "text",
                    value: "## Chaves\n\nAs chaves saem do JSX e entram no JavaScript. Dentro delas vale qualquer **expressão**, mas não instrução: um `if` solto não funciona, e por isso condicional em JSX usa `&&` ou o ternário.",
                },
                {
                    type: "table",
                    value: '[["Em HTML", "Em JSX", "Por quê"], ["class", "className", "class é palavra reservada"], ["for", "htmlFor", "for é palavra reservada"], ["onclick", "onClick", "eventos em camelCase"], ["style=\'cor\'", "style={{ cor: \'x\' }}", "recebe um objeto"], ["<br>", "<br />", "toda tag precisa fechar"]]',
                },
                {
                    type: "text",
                    value: "## Um elemento raiz\n\nUm componente devolve **um** elemento. Para devolver vários sem criar uma `div` a mais, use o fragmento, que não vira nada no HTML final.",
                },
                {
                    type: "code",
                    value: "return (\n  <>\n    <h1>Título</h1>\n    <p>Texto</p>\n  </>\n);",
                },
            ],
            questions: [
                {
                    statement: "O que o JSX é, tecnicamente?",
                    difficulty: "medio",
                    options: [
                        { text: "JavaScript que vira chamadas de função", isCorrect: true },
                        { text: "HTML interpretado direto pelo navegador", isCorrect: false },
                        { text: "Um formato de modelo compilado no servidor", isCorrect: false },
                        { text: "Uma linguagem de marcação própria do React", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `class` vira `className` em JSX?",
                    difficulty: "medio",
                    options: [
                        { text: "class é palavra reservada do JavaScript", isCorrect: true },
                        { text: "Porque o React usa classes CSS diferentes", isCorrect: false },
                        { text: "Porque o nome em HTML foi descontinuado", isCorrect: false },
                        { text: "Para diferenciar de componentes de classe", isCorrect: false },
                    ],
                },
                {
                    statement: "O que pode ir dentro das chaves no JSX?",
                    difficulty: "medio",
                    options: [
                        { text: "Qualquer expressão JavaScript", isCorrect: true },
                        { text: "Qualquer instrução, incluindo if e for", isCorrect: false },
                        { text: "Apenas variáveis já declaradas antes", isCorrect: false },
                        { text: "Somente texto e números, sem funções", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o fragmento `<>`?",
                    difficulty: "medio",
                    options: [
                        { text: "Devolver vários elementos sem criar um a mais", isCorrect: true },
                        {
                            text: "Agrupar componentes que compartilham o mesmo estado",
                            isCorrect: false,
                        },
                        { text: "Marcar um trecho que não será renderizado", isCorrect: false },
                        { text: "Criar um componente sem precisar de nome", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se escreve estilo em linha no JSX?",
                    difficulty: "medio",
                    options: [
                        { text: "Passando um objeto para style", isCorrect: true },
                        { text: "Passando uma string com o CSS dentro", isCorrect: false },
                        { text: "Usando o atributo css em vez de style", isCorrect: false },
                        { text: "Importando o arquivo de CSS no componente", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Componentes e props",
            blocks: [
                {
                    type: "text",
                    value: "# Passando dados para baixo\n\nAs **props** são os argumentos de um componente. Elas descem de quem usa para quem é usado, e **não podem ser alteradas** por quem recebe: o componente lê e devolve a tela, sem mexer no que veio.",
                },
                {
                    type: "code",
                    value: 'type Props = {\n  nome: string;\n  preco: number;\n  emPromocao?: boolean;\n};\n\nfunction Card({ nome, preco, emPromocao = false }: Props) {\n  return (\n    <div className={emPromocao ? "card card--promo" : "card"}>\n      <h3>{nome}</h3>\n      <p>{preco.toFixed(2)}</p>\n    </div>\n  );\n}\n\n// Usando\n<Card nome="Caneca" preco={29.9} emPromocao />',
                },
                {
                    type: "text",
                    value: 'Repare em duas coisas: o valor entre chaves é JavaScript, então `preco={29.9}` passa um número enquanto `preco="29.9"` passaria texto. E `emPromocao` sozinho equivale a `emPromocao={true}`.\n\n## Fluxo em uma direção\n\nDados descem por props. Quando um componente filho precisa avisar o pai de algo, o pai passa uma **função** como prop, e o filho a chama. É o padrão mais importante do React.',
                },
                {
                    type: "code",
                    value: "function Lista({ itens, aoSelecionar }) {\n  return (\n    <ul>\n      {itens.map((item) => (\n        <li key={item.id} onClick={() => aoSelecionar(item)}>\n          {item.nome}\n        </li>\n      ))}\n    </ul>\n  );\n}\n\n// O pai decide o que fazer\n<Lista itens={produtos} aoSelecionar={(p) => setSelecionado(p)} />",
                },
                {
                    type: "quote",
                    value: "Props descem, eventos sobem. Quem tem o estado é quem decide o que fazer com o evento.",
                },
            ],
            questions: [
                {
                    statement: "O componente pode alterar as props que recebe?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, elas são somente leitura", isCorrect: true },
                        { text: "Sim, desde que avise o componente pai depois", isCorrect: false },
                        { text: "Sim, quando elas forem objetos ou arrays", isCorrect: false },
                        { text: "Sim, mas apenas dentro de um efeito", isCorrect: false },
                    ],
                },
                {
                    statement: 'Qual a diferença entre `preco={29.9}` e `preco="29.9"`?',
                    difficulty: "medio",
                    options: [
                        { text: "O primeiro passa número e o segundo texto", isCorrect: true },
                        { text: "O primeiro é avaliado e o segundo é ignorado", isCorrect: false },
                        { text: "O segundo é convertido para número pelo React", isCorrect: false },
                        { text: "Não há diferença, o React trata os dois igual", isCorrect: false },
                    ],
                },
                {
                    statement: "Como um filho avisa o pai de um evento?",
                    difficulty: "medio",
                    options: [
                        { text: "Chamando uma função recebida por prop", isCorrect: true },
                        {
                            text: "Alterando diretamente o estado do componente pai",
                            isCorrect: false,
                        },
                        {
                            text: "Emitindo um evento que sobe pela árvore sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "Usando uma variável global compartilhada entre eles",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `emPromocao` sozinho na tag significa?",
                    difficulty: "medio",
                    options: [
                        { text: "O mesmo que passar o valor true", isCorrect: true },
                        { text: "Que a prop foi declarada mas está vazia", isCorrect: false },
                        { text: "Que a prop recebe o valor padrão declarado", isCorrect: false },
                        { text: "Que a prop será preenchida pelo componente", isCorrect: false },
                    ],
                },
                {
                    statement: "Em qual direção os dados fluem em React?",
                    difficulty: "facil",
                    options: [
                        { text: "De cima para baixo, por props", isCorrect: true },
                        { text: "De baixo para cima, do filho para o pai", isCorrect: false },
                        { text: "Nos dois sentidos, de forma automática", isCorrect: false },
                        { text: "Entre componentes irmãos, diretamente", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Listas e chaves",
            blocks: [
                {
                    type: "text",
                    value: "# Renderizando uma coleção\n\nListas em React saem de um `map` sobre um array. Cada item precisa de uma prop `key`, e essa é a fonte de um dos bugs mais comuns de quem começa.",
                },
                {
                    type: "code",
                    value: "function ListaProdutos({ produtos }) {\n  return (\n    <ul>\n      {produtos.map((p) => (\n        <li key={p.id}>{p.nome}</li>\n      ))}\n    </ul>\n  );\n}",
                },
                {
                    type: "text",
                    value: "## Por que a chave importa\n\nA `key` diz ao React **qual item é qual** entre uma renderização e outra. Com ela, inserir um item no começo da lista move os existentes; sem ela, o React compara por posição e pode reaproveitar o elemento errado.\n\nO efeito aparece quando os itens têm estado interno: um campo de texto preenchido acaba associado à linha errada depois de uma remoção.",
                },
                {
                    type: "code",
                    value: "// Errado: o índice muda quando a lista muda\n{itens.map((item, i) => <Linha key={i} item={item} />)}\n\n// Certo: um identificador estável do próprio dado\n{itens.map((item) => <Linha key={item.id} item={item} />)}",
                },
                {
                    type: "table",
                    value: '[["Chave", "Quando serve"], ["id do banco", "sempre, é a melhor opção"], ["slug ou código único", "quando não há id numérico"], ["índice do array", "só em lista fixa que nunca reordena"], ["Math.random()", "nunca, muda a cada renderização"]]',
                },
                {
                    type: "text",
                    value: "A última linha merece destaque: uma chave aleatória faz o React descartar e recriar todos os itens a cada renderização, perdendo estado e desempenho.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve a prop `key` em uma lista?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dizer ao React qual item é qual entre renderizações",
                            isCorrect: true,
                        },
                        {
                            text: "Definir a ordem em que os itens serão exibidos",
                            isCorrect: false,
                        },
                        {
                            text: "Identificar o item no momento em que ele for clicado na tela",
                            isCorrect: false,
                        },
                        { text: "Guardar o valor do item para uso posterior", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando usar o índice como chave é aceitável?",
                    difficulty: "dificil",
                    options: [
                        { text: "Em lista fixa que nunca reordena", isCorrect: true },
                        { text: "Sempre, é o padrão recomendado pela equipe", isCorrect: false },
                        { text: "Quando os itens não têm identificador próprio", isCorrect: false },
                        { text: "Quando a lista tem poucos itens dentro dela", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao usar `Math.random()` como chave?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Todos os itens são recriados a cada renderização",
                            isCorrect: true,
                        },
                        {
                            text: "As chaves ficam garantidamente únicas na lista",
                            isCorrect: false,
                        },
                        {
                            text: "O React avisa no console e usa o índice no lugar",
                            isCorrect: false,
                        },
                        { text: "Os itens perdem a ordem original do array", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o bug de chave errada mais aparece?",
                    difficulty: "dificil",
                    options: [
                        { text: "Quando os itens têm estado interno", isCorrect: true },
                        { text: "Quando a lista tem mais de cem itens", isCorrect: false },
                        { text: "Quando os itens são componentes simples", isCorrect: false },
                        { text: "Quando a lista é renderizada uma vez só", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a melhor chave para uma lista vinda do banco?",
                    difficulty: "facil",
                    options: [
                        { text: "O id do registro", isCorrect: true },
                        { text: "A posição do item dentro do array", isCorrect: false },
                        { text: "O nome exibido em cada um dos itens", isCorrect: false },
                        { text: "Um número gerado no momento da renderização", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Estado e eventos",
    aulas: [
        {
            titulo: "useState",
            blocks: [
                {
                    type: "text",
                    value: "# Dados que mudam\n\nProps vêm de fora e não mudam. O **estado** é o dado que pertence ao componente e muda com o tempo. Alterar o estado faz o React renderizar de novo.",
                },
                {
                    type: "code",
                    value: 'import { useState } from "react";\n\nfunction Contador() {\n  const [valor, setValor] = useState(0);\n\n  return (\n    <button onClick={() => setValor(valor + 1)}>\n      Cliquei {valor} vezes\n    </button>\n  );\n}',
                },
                {
                    type: "text",
                    value: "O `useState` devolve uma tupla: o valor atual e a função que o altera. O argumento é o valor **inicial**, usado só na primeira renderização.\n\n## Atualizar a partir do anterior\n\nQuando o valor novo depende do antigo, passe uma **função** para o setter. Isso evita o bug de somar duas vezes e obter apenas um.",
                },
                {
                    type: "code",
                    value: "// Errado: as duas leem o mesmo valor antigo\nsetValor(valor + 1);\nsetValor(valor + 1);   // resultado: soma um, não dois\n\n// Certo: cada uma recebe o resultado da anterior\nsetValor((v) => v + 1);\nsetValor((v) => v + 1);   // resultado: soma dois",
                },
                {
                    type: "text",
                    value: "## Nunca altere o estado no lugar\n\nO React compara a referência para saber se algo mudou. Alterar um array ou objeto existente não muda a referência, e a tela não atualiza. Sempre crie um valor novo.",
                },
                {
                    type: "code",
                    value: '// Errado: a referência é a mesma, o React não vê mudança\nitens.push(novo);\nsetItens(itens);\n\n// Certo: um array novo\nsetItens([...itens, novo]);\nsetItens(itens.filter((i) => i.id !== id));\nsetUsuario({ ...usuario, nome: "Ana" });',
                },
            ],
            questions: [
                {
                    statement: "O que o `useState` devolve?",
                    difficulty: "facil",
                    options: [
                        { text: "O valor atual e a função que o altera", isCorrect: true },
                        { text: "Apenas o valor guardado no estado atual", isCorrect: false },
                        { text: "Um objeto com o valor e o valor anterior", isCorrect: false },
                        { text: "Uma função que lê e escreve o valor", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o argumento do `useState` é usado?",
                    difficulty: "medio",
                    options: [
                        { text: "Só na primeira renderização", isCorrect: true },
                        { text: "Em toda renderização do componente", isCorrect: false },
                        { text: "Sempre que o componente recebe props novas", isCorrect: false },
                        { text: "Quando o estado volta a ser indefinido", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que passar uma função ao setter quando o valor depende do anterior?",
                    difficulty: "dificil",
                    options: [
                        { text: "Cada chamada recebe o resultado da anterior", isCorrect: true },
                        { text: "A função executa bem mais rápido que o valor", isCorrect: false },
                        {
                            text: "O React exige função quando há mais de um setter",
                            isCorrect: false,
                        },
                        {
                            text: "A função evita que o componente renderize de novo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que alterar um array com `push` não atualiza a tela?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A referência continua a mesma e o React não vê mudança",
                            isCorrect: true,
                        },
                        { text: "O push não é permitido dentro de componentes", isCorrect: false },
                        {
                            text: "O array precisa ser convertido para um objeto antes disso",
                            isCorrect: false,
                        },
                        {
                            text: "O setter precisa ser chamado duas vezes seguidas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se acrescenta um item a um array em estado?",
                    difficulty: "medio",
                    options: [
                        { text: "Criando um array novo com espalhamento", isCorrect: true },
                        { text: "Chamando push e depois o setter do estado", isCorrect: false },
                        { text: "Alterando o array e forçando a renderização", isCorrect: false },
                        { text: "Usando concat direto dentro do JSX", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Eventos e formulários controlados",
            blocks: [
                {
                    type: "text",
                    value: "# Eventos\n\nEventos em JSX são props em camelCase que recebem uma função. Repare que se passa a **função**, não a chamada dela.",
                },
                {
                    type: "code",
                    value: "// Certo: passa a função\n<button onClick={salvar}>Salvar</button>\n\n// Certo: função anônima quando precisa de argumento\n<button onClick={() => remover(item.id)}>Remover</button>\n\n// Errado: chama na hora da renderização\n<button onClick={remover(item.id)}>Remover</button>",
                },
                {
                    type: "text",
                    value: "## Formulário controlado\n\nNo **componente controlado**, o valor do campo vem do estado e cada digitação o atualiza. O estado vira a única fonte da verdade, e é isso que permite validar, formatar e habilitar o botão conforme o conteúdo.",
                },
                {
                    type: "code",
                    value: 'function Formulario() {\n  const [email, setEmail] = useState("");\n  const [aceito, setAceito] = useState(false);\n\n  function enviar(e: React.FormEvent) {\n    e.preventDefault();\n    console.log({ email, aceito });\n  }\n\n  return (\n    <form onSubmit={enviar}>\n      <input\n        type="email"\n        value={email}\n        onChange={(e) => setEmail(e.target.value)}\n      />\n      <input\n        type="checkbox"\n        checked={aceito}\n        onChange={(e) => setAceito(e.target.checked)}\n      />\n      <button disabled={!email || !aceito}>Enviar</button>\n    </form>\n  );\n}',
                },
                {
                    type: "text",
                    value: "O `e.preventDefault()` no submit impede o comportamento padrão do navegador de recarregar a página.\n\nUm detalhe que confunde: caixas de seleção usam `checked` e `e.target.checked`, não `value`.",
                },
            ],
            questions: [
                {
                    statement: "O que se passa para uma prop de evento?",
                    difficulty: "medio",
                    options: [
                        { text: "A função, não a chamada dela", isCorrect: true },
                        { text: "A chamada da função com os argumentos", isCorrect: false },
                        { text: "O nome da função entre aspas simples", isCorrect: false },
                        { text: "Um objeto descrevendo o que fazer", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com `onClick={remover(id)}`?",
                    difficulty: "dificil",
                    options: [
                        { text: "A função é chamada na renderização", isCorrect: true },
                        { text: "A função é chamada apenas ao clicar no botão", isCorrect: false },
                        { text: "O React avisa que a sintaxe está errada", isCorrect: false },
                        { text: "O argumento é ignorado e a função não roda", isCorrect: false },
                    ],
                },
                {
                    statement: "O que caracteriza um formulário controlado?",
                    difficulty: "medio",
                    options: [
                        { text: "O valor do campo vir do estado", isCorrect: true },
                        { text: "O formulário ser validado antes do envio", isCorrect: false },
                        { text: "Os campos serem preenchidos automaticamente", isCorrect: false },
                        { text: "O envio ser bloqueado até tudo estar correto", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `e.preventDefault()` no submit?",
                    difficulty: "medio",
                    options: [
                        { text: "Impedir que a página recarregue", isCorrect: true },
                        { text: "Impedir que o formulário seja enviado vazio", isCorrect: false },
                        { text: "Cancelar o evento quando há erro de validação", isCorrect: false },
                        {
                            text: "Evitar que o clique dispare duas vezes seguidas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual prop uma caixa de seleção usa?",
                    difficulty: "medio",
                    options: [
                        { text: "checked, e não value", isCorrect: true },
                        { text: "value, como qualquer outro campo", isCorrect: false },
                        { text: "selected, indicando a marcação", isCorrect: false },
                        { text: "state, ligado direto ao useState", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "O estado é uma foto, não uma variável",
            blocks: [
                {
                    type: "text",
                    value: "# O que mais confunde no React\n\nDentro de uma renderização, o estado é um valor **fixo**. Chamar o setter não altera a variável que já está na tela: ele agenda uma renderização nova, com um valor novo.\n\nÉ por isso que o `console.log` logo depois do setter mostra o valor antigo, e isso não é bug.",
                },
                {
                    type: "code",
                    value: "function Exemplo() {\n  const [n, setN] = useState(0);\n\n  function clicar() {\n    setN(n + 1);\n    console.log(n);   // mostra o valor ANTIGO, sempre\n  }\n\n  return <button onClick={clicar}>{n}</button>;\n}",
                },
                {
                    type: "text",
                    value: "## Cada renderização tem seu próprio estado\n\nA função do componente roda de novo a cada renderização, e as variáveis dela são novas. O `n` de dentro de `clicar` pertence à renderização em que aquele clique foi registrado, e não muda depois.\n\nEsse comportamento se chama **closure sobre o estado**, e explica quase todo comportamento estranho envolvendo `setTimeout` e efeitos.",
                },
                {
                    type: "code",
                    value: "function Alerta() {\n  const [n, setN] = useState(0);\n\n  function avisarDepois() {\n    setTimeout(() => {\n      alert(n);   // mostra o n de QUANDO foi clicado\n    }, 3000);\n  }\n\n  return (\n    <>\n      <button onClick={() => setN(n + 1)}>{n}</button>\n      <button onClick={avisarDepois}>Avisar em 3s</button>\n    </>\n  );\n}",
                },
                {
                    type: "quote",
                    value: "Estado é uma foto do momento da renderização. Se você precisa do valor mais recente dentro de um callback, use a forma de função do setter.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que o `console.log` logo depois do setter mostra o valor antigo?",
                    difficulty: "dificil",
                    options: [
                        { text: "O estado é fixo dentro daquela renderização", isCorrect: true },
                        {
                            text: "O setter demora alguns milissegundos para aplicar",
                            isCorrect: false,
                        },
                        { text: "O console mostra o valor de forma assíncrona", isCorrect: false },
                        {
                            text: "O React guarda o log antes de atualizar o valor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que chamar o setter faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Agenda uma renderização nova", isCorrect: true },
                        { text: "Altera a variável de estado imediatamente", isCorrect: false },
                        { text: "Força a atualização da tela na mesma hora", isCorrect: false },
                        { text: "Guarda o valor para a próxima função chamada", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual valor um `setTimeout` enxerga do estado?",
                    difficulty: "dificil",
                    options: [
                        { text: "O da renderização em que foi criado", isCorrect: true },
                        { text: "O mais recente no momento em que dispara", isCorrect: false },
                        { text: "O valor inicial passado ao useState", isCorrect: false },
                        { text: "Sempre o valor indefinido, por ser assíncrono", isCorrect: false },
                    ],
                },
                {
                    statement: "Como esse comportamento se chama?",
                    difficulty: "medio",
                    options: [
                        { text: "Closure sobre o estado", isCorrect: true },
                        { text: "Renderização assíncrona dos componentes", isCorrect: false },
                        { text: "Congelamento do estado pelo StrictMode", isCorrect: false },
                        { text: "Atraso de propagação entre componentes", isCorrect: false },
                    ],
                },
                {
                    statement: "Como obter o valor mais recente dentro de um callback?",
                    difficulty: "medio",
                    options: [
                        { text: "Usando a forma de função do setter", isCorrect: true },
                        { text: "Declarando o estado fora do componente", isCorrect: false },
                        { text: "Chamando o setter duas vezes seguidas", isCorrect: false },
                        { text: "Lendo o valor direto do elemento na tela", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Levantando o estado",
            blocks: [
                {
                    type: "text",
                    value: "# Quando dois componentes precisam do mesmo dado\n\nEstado vive dentro de um componente e não é visível pelos irmãos. Quando dois precisam do mesmo dado, ele **sobe** para o pai comum mais próximo, que passa o valor e a função de alterar para os dois.",
                },
                {
                    type: "code",
                    value: 'function Painel() {\n  const [filtro, setFiltro] = useState("");\n\n  return (\n    <>\n      <Busca valor={filtro} aoMudar={setFiltro} />\n      <Resultados filtro={filtro} />\n    </>\n  );\n}\n\nfunction Busca({ valor, aoMudar }) {\n  return <input value={valor} onChange={(e) => aoMudar(e.target.value)} />;\n}\n\nfunction Resultados({ filtro }) {\n  const visiveis = produtos.filter((p) => p.nome.includes(filtro));\n  return <ul>{visiveis.map((p) => <li key={p.id}>{p.nome}</li>)}</ul>;\n}',
                },
                {
                    type: "text",
                    value: "## Onde o estado deve morar\n\nA regra: no componente **mais próximo** que precisa dele. Subir demais faz o pai renderizar por mudanças que não lhe dizem respeito; deixar embaixo demais impede o compartilhamento.\n\n## Estado que não deveria existir\n\nO erro mais comum de modelagem é guardar em estado algo que **pode ser calculado**. Isso cria duas fontes da verdade que precisam ser sincronizadas, e uma delas sempre fica para trás.",
                },
                {
                    type: "code",
                    value: "// Errado: o total precisa ser atualizado junto, sempre\nconst [itens, setItens] = useState([]);\nconst [total, setTotal] = useState(0);\n\n// Certo: o total é derivado, e nunca fica errado\nconst [itens, setItens] = useState([]);\nconst total = itens.reduce((s, i) => s + i.preco, 0);",
                },
            ],
            questions: [
                {
                    statement: "O que fazer quando dois componentes irmãos precisam do mesmo dado?",
                    difficulty: "medio",
                    options: [
                        { text: "Subir o estado para o pai comum", isCorrect: true },
                        { text: "Passar o dado direto entre os dois irmãos", isCorrect: false },
                        { text: "Duplicar o estado em cada um dos dois", isCorrect: false },
                        { text: "Guardar o dado em uma variável global", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde o estado deve morar?",
                    difficulty: "medio",
                    options: [
                        { text: "No componente mais próximo que precisa dele", isCorrect: true },
                        { text: "Sempre no componente raiz da aplicação", isCorrect: false },
                        { text: "No componente que exibe o dado na tela", isCorrect: false },
                        {
                            text: "Em um arquivo separado, com todo o estado global",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o problema de guardar em estado algo que pode ser calculado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Cria duas fontes da verdade para sincronizar", isCorrect: true },
                        { text: "Consome bem mais memória no navegador", isCorrect: false },
                        { text: "Impede que o componente use outros estados", isCorrect: false },
                        {
                            text: "Faz o componente renderizar duas vezes seguidas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o custo de subir o estado alto demais?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O pai renderiza por mudanças que não lhe importam",
                            isCorrect: true,
                        },
                        { text: "Os filhos deixam de receber as props corretas", isCorrect: false },
                        {
                            text: "O estado acaba sendo compartilhado sem nenhum controle",
                            isCorrect: false,
                        },
                        {
                            text: "A aplicação perde o estado ao trocar de página",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o total de uma lista deve ser obtido?",
                    difficulty: "medio",
                    options: [
                        { text: "Calculado a partir dos itens na renderização", isCorrect: true },
                        { text: "Guardado em um estado próprio e atualizado", isCorrect: false },
                        { text: "Calculado dentro de um efeito após a mudança", isCorrect: false },
                        { text: "Recebido do servidor a cada alteração feita", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "useReducer",
            blocks: [
                {
                    type: "text",
                    value: "# Quando o useState não dá mais conta\n\nCom vários estados que mudam juntos, a lógica de atualização se espalha por muitos handlers. O **useReducer** junta tudo em uma função só, que recebe o estado atual e uma ação e devolve o estado novo.",
                },
                {
                    type: "code",
                    value: 'type Estado = { itens: Item[]; carregando: boolean; erro: string | null };\n\ntype Acao =\n  | { tipo: "carregando" }\n  | { tipo: "sucesso"; itens: Item[] }\n  | { tipo: "erro"; mensagem: string }\n  | { tipo: "remover"; id: number };\n\nfunction redutor(estado: Estado, acao: Acao): Estado {\n  switch (acao.tipo) {\n    case "carregando":\n      return { ...estado, carregando: true, erro: null };\n    case "sucesso":\n      return { itens: acao.itens, carregando: false, erro: null };\n    case "erro":\n      return { ...estado, carregando: false, erro: acao.mensagem };\n    case "remover":\n      return { ...estado, itens: estado.itens.filter((i) => i.id !== acao.id) };\n  }\n}\n\nconst [estado, despachar] = useReducer(redutor, {\n  itens: [], carregando: false, erro: null,\n});\n\ndespachar({ tipo: "remover", id: 3 });',
                },
                {
                    type: "text",
                    value: "## Quando vale a troca\n\n- Vários campos que mudam juntos e precisam ficar consistentes\n- A mesma transição acontece em lugares diferentes da tela\n- Você quer testar a lógica de estado sem renderizar nada\n\nO redutor é uma **função pura**: mesma entrada, mesma saída, sem efeito colateral. Isso o torna trivial de testar, e é uma vantagem que o `useState` não oferece.",
                },
                {
                    type: "code",
                    value: 'test("remover tira o item da lista", () => {\n  const antes = { itens: [{ id: 1 }, { id: 2 }], carregando: false, erro: null };\n  const depois = redutor(antes, { tipo: "remover", id: 1 });\n  expect(depois.itens).toHaveLength(1);\n});',
                },
            ],
            questions: [
                {
                    statement: "O que o `useReducer` junta em um lugar só?",
                    difficulty: "medio",
                    options: [
                        { text: "A lógica de atualização do estado", isCorrect: true },
                        { text: "Todos os estados usados pelo componente", isCorrect: false },
                        { text: "Os efeitos que dependem daquele estado", isCorrect: false },
                        { text: "As props recebidas do componente pai", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um redutor recebe e devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "Estado atual e ação, devolve o estado novo", isCorrect: true },
                        { text: "Apenas a ação, e devolve um valor booleano", isCorrect: false },
                        { text: "O estado antigo, e altera ele no lugar", isCorrect: false },
                        { text: "As props, e devolve o componente renderizado", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que um redutor é fácil de testar?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele é uma função pura, sem efeito colateral", isCorrect: true },
                        { text: "Ele roda fora do ciclo de renderização", isCorrect: false },
                        { text: "Ele é executado apenas uma vez por ação", isCorrect: false },
                        {
                            text: "Ele é chamado direto pelo React, sem receber props",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando trocar `useState` por `useReducer`?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando vários campos mudam juntos", isCorrect: true },
                        { text: "Quando o estado é usado por mais de um filho", isCorrect: false },
                        { text: "Quando o componente tem mais de um efeito", isCorrect: false },
                        { text: "Quando o estado vem de uma chamada de API", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se dispara uma mudança com useReducer?",
                    difficulty: "medio",
                    options: [
                        { text: "Despachando uma ação", isCorrect: true },
                        { text: "Chamando o setter com o valor novo", isCorrect: false },
                        { text: "Alterando o estado dentro do redutor", isCorrect: false },
                        { text: "Renderizando o componente novamente", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Efeitos e dados",
    aulas: [
        {
            titulo: "useEffect: o que é e o que não é",
            blocks: [
                {
                    type: "text",
                    value: "# Sincronizar com o mundo de fora\n\nO `useEffect` existe para **sincronizar o componente com algo externo ao React**: uma conexão, uma assinatura, o título da página, uma API do navegador.\n\nEle **não** é um gancho de ciclo de vida, e não é onde você reage a cliques. A maior parte do mau uso de efeito vem de tratá-lo como um lugar para colocar lógica que aconteceria de qualquer jeito.",
                },
                {
                    type: "code",
                    value: "useEffect(() => {\n  document.title = `${naoLidas} mensagens`;\n}, [naoLidas]);\n\nuseEffect(() => {\n  const conexao = criarConexao(salaId);\n  conexao.conectar();\n  return () => conexao.desconectar();\n}, [salaId]);",
                },
                {
                    type: "text",
                    value: "## Quando ele roda\n\nO efeito roda **depois** de a tela ser pintada, e de novo sempre que alguma dependência muda. A função devolvida é a **limpeza**, e roda antes da próxima execução e ao desmontar o componente.",
                },
                {
                    type: "table",
                    value: '[["Dependências", "Quando o efeito roda"], ["sem array", "depois de toda renderização"], ["array vazio", "uma vez, ao montar"], ["[a, b]", "ao montar e quando a ou b mudam"]]',
                },
                {
                    type: "quote",
                    value: "Se o efeito não sincroniza com nada fora do React, ele provavelmente não deveria ser um efeito.",
                },
            ],
            questions: [
                {
                    statement: "Para que o `useEffect` existe?",
                    difficulty: "medio",
                    options: [
                        { text: "Sincronizar com algo externo ao React", isCorrect: true },
                        { text: "Executar código quando o componente é montado", isCorrect: false },
                        { text: "Reagir a cliques e outras ações do usuário", isCorrect: false },
                        { text: "Calcular valores derivados de outros estados", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o efeito roda em relação à pintura da tela?",
                    difficulty: "medio",
                    options: [
                        { text: "Depois de a tela ser pintada", isCorrect: true },
                        { text: "Antes de a tela ser pintada pelo navegador", isCorrect: false },
                        { text: "Ao mesmo tempo em que a tela é montada", isCorrect: false },
                        { text: "Somente quando o componente é desmontado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a função devolvida pelo efeito faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Limpa antes da próxima execução e ao desmontar", isCorrect: true },
                        {
                            text: "Devolve o valor que foi calculado para o componente",
                            isCorrect: false,
                        },
                        { text: "Reexecuta o efeito quando algo muda", isCorrect: false },
                        { text: "Cancela o efeito antes de ele começar", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando um efeito com array vazio roda?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma vez, ao montar", isCorrect: true },
                        { text: "Depois de toda renderização do componente", isCorrect: false },
                        { text: "Sempre que qualquer estado muda de valor", isCorrect: false },
                        { text: "Apenas quando o componente é desmontado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que indica que algo não deveria ser um efeito?",
                    difficulty: "dificil",
                    options: [
                        { text: "Não sincronizar com nada fora do React", isCorrect: true },
                        { text: "Depender de mais de uma variável de estado", isCorrect: false },
                        { text: "Precisar de uma função de limpeza no fim", isCorrect: false },
                        { text: "Ser executado toda vez que a tela renderiza", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Dependências e limpeza",
            blocks: [
                {
                    type: "text",
                    value: "# O array de dependências\n\nEle lista tudo que o efeito **lê** de dentro do componente: estado, props e funções. O linter do React aponta o que falta, e ignorar esse aviso é a origem de bugs muito difíceis de achar.",
                },
                {
                    type: "code",
                    value: "// O efeito lê salaId e tema, então os dois entram\nuseEffect(() => {\n  const c = criarConexao(salaId, tema);\n  c.conectar();\n  return () => c.desconectar();\n}, [salaId, tema]);",
                },
                {
                    type: "text",
                    value: "## Não remova dependência, remova a necessidade\n\nQuando o efeito reexecuta demais, a tentação é apagar itens do array. Isso não resolve: o efeito passa a ler valores velhos, e o bug fica pior porque some do array a pista do que estava errado.\n\nO caminho certo é **mudar o efeito** para depender de menos coisas: mover a função para dentro, extrair o que não precisa reagir, ou usar `useEffectEvent`.",
                },
                {
                    type: "code",
                    value: "// Problema: a função é recriada a cada renderização,\n// então o efeito roda a cada renderização\nfunction Chat({ salaId }) {\n  function criar() { return criarConexao(salaId); }\n\n  useEffect(() => {\n    const c = criar();\n    c.conectar();\n    return () => c.desconectar();\n  }, [criar]);   // criar muda sempre\n}\n\n// Solução: mover a função para dentro do efeito\nuseEffect(() => {\n  const c = criarConexao(salaId);\n  c.conectar();\n  return () => c.desconectar();\n}, [salaId]);",
                },
                {
                    type: "text",
                    value: "## A limpeza não é opcional\n\nTodo efeito que **abre** algo precisa fechar: assinatura, temporizador, ouvinte de evento, conexão. Sem limpeza, o StrictMode revela o problema em desenvolvimento duplicando a montagem, e em produção ele aparece como vazamento de memória.",
                },
                {
                    type: "code",
                    value: 'useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);\n}, []);\n\nuseEffect(() => {\n  window.addEventListener("resize", aoRedimensionar);\n  return () => window.removeEventListener("resize", aoRedimensionar);\n}, []);',
                },
            ],
            questions: [
                {
                    statement: "O que deve entrar no array de dependências?",
                    difficulty: "medio",
                    options: [
                        { text: "Tudo que o efeito lê do componente", isCorrect: true },
                        { text: "Apenas os estados usados dentro do efeito", isCorrect: false },
                        { text: "Somente as props recebidas do componente pai", isCorrect: false },
                        { text: "Os valores que mudam com mais frequência", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao remover uma dependência necessária?",
                    difficulty: "dificil",
                    options: [
                        { text: "O efeito passa a ler valores velhos", isCorrect: true },
                        { text: "O efeito deixa de rodar por completo", isCorrect: false },
                        { text: "O React avisa com um erro na renderização", isCorrect: false },
                        { text: "O componente deixa de ser atualizado na tela", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que uma função declarada no componente causa reexecução?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ela é recriada a cada renderização", isCorrect: true },
                        { text: "Ela não pode ser usada dentro de um efeito", isCorrect: false },
                        { text: "Ela é chamada antes do efeito ser montado", isCorrect: false },
                        { text: "Ela altera o estado ao ser declarada", isCorrect: false },
                    ],
                },
                {
                    statement: "O que todo efeito que abre algo precisa fazer?",
                    difficulty: "medio",
                    options: [
                        { text: "Fechar na função de limpeza", isCorrect: true },
                        { text: "Declarar o recurso fora do componente", isCorrect: false },
                        { text: "Executar apenas uma vez ao montar", isCorrect: false },
                        { text: "Guardar a referência em um estado", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o StrictMode ajuda a achar limpeza faltando?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ele monta e desmonta duas vezes em desenvolvimento",
                            isCorrect: true,
                        },
                        {
                            text: "Ele avisa no console do navegador sobre o efeito incompleto",
                            isCorrect: false,
                        },
                        { text: "Ele impede o efeito de rodar sem a limpeza", isCorrect: false },
                        { text: "Ele mede a memória usada por cada efeito", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "useEffectEvent, novidade do React 19.2",
            blocks: [
                {
                    type: "text",
                    value: "# O dilema das dependências\n\nExiste um caso em que o array de dependências e a lógica se contradizem: o efeito precisa **ler** um valor, mas não deveria **reagir** a ele.\n\nO exemplo clássico é uma conexão de chat que mostra uma notificação com o tema atual. O efeito deve reconectar quando a sala muda, mas trocar o tema não deveria derrubar a conexão.",
                },
                {
                    type: "code",
                    value: 'function Chat({ salaId, tema }) {\n  useEffect(() => {\n    const c = criarConexao(salaId);\n    c.on("conectado", () => {\n      mostrarNotificacao("Conectado!", tema);\n    });\n    c.conectar();\n    return () => c.desconectar();\n  }, [salaId, tema]);\n  // tema no array: trocar o tema reconecta o chat, e não deveria\n  // tema fora do array: a notificação usa um tema velho\n}',
                },
                {
                    type: "text",
                    value: "## A solução do 19.2\n\nO `useEffectEvent` separa a parte que é **evento** da parte que é sincronização. O que está dentro dele sempre enxerga os valores mais recentes, e **não entra** no array de dependências.",
                },
                {
                    type: "code",
                    value: 'import { useEffect, useEffectEvent } from "react";\n\nfunction Chat({ salaId, tema }) {\n  const aoConectar = useEffectEvent(() => {\n    mostrarNotificacao("Conectado!", tema);   // tema sempre atual\n  });\n\n  useEffect(() => {\n    const c = criarConexao(salaId);\n    c.on("conectado", () => aoConectar());\n    c.conectar();\n    return () => c.desconectar();\n  }, [salaId]);   // só salaId: trocar o tema não reconecta\n}',
                },
                {
                    type: "quote",
                    value: "A regra: o que o efeito sincroniza entra nas dependências. O que ele apenas dispara vai para um effect event.",
                },
                {
                    type: "text",
                    value: "## O limite\n\nUm effect event só pode ser chamado **de dentro de um efeito**, e nunca passado para outro componente como prop. Ele não é um substituto geral para `useCallback`.",
                },
            ],
            questions: [
                {
                    statement: "Que problema o `useEffectEvent` resolve?",
                    difficulty: "medio",
                    options: [
                        { text: "Ler um valor sem reagir a ele no efeito", isCorrect: true },
                        { text: "Executar o efeito antes da tela ser pintada", isCorrect: false },
                        { text: "Evitar que o efeito rode na montagem inicial", isCorrect: false },
                        { text: "Permitir efeitos assíncronos sem limpeza", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é passado ao effect event entra no array de dependências?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, ele fica fora do array", isCorrect: true },
                        { text: "Sim, ele entra como qualquer outro valor", isCorrect: false },
                        { text: "Sim, mas apenas quando muda de valor", isCorrect: false },
                        { text: "Depende de o valor ser prop ou estado", isCorrect: false },
                    ],
                },
                {
                    statement: "Quais valores um effect event enxerga?",
                    difficulty: "medio",
                    options: [
                        { text: "Sempre os mais recentes", isCorrect: true },
                        { text: "Os da renderização em que foi criado", isCorrect: false },
                        { text: "Apenas os que estão no array de dependências", isCorrect: false },
                        { text: "Os valores iniciais do componente", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde um effect event pode ser chamado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Apenas de dentro de um efeito", isCorrect: true },
                        { text: "Em qualquer lugar do componente que o criou", isCorrect: false },
                        { text: "Em componentes filhos, passado como prop", isCorrect: false },
                        { text: "Dentro de um handler de clique também", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a regra para decidir onde algo vai?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O que sincroniza vai nas dependências, o que dispara não",
                            isCorrect: true,
                        },
                        { text: "Tudo que é função vai para um effect event", isCorrect: false },
                        {
                            text: "As props vão nas dependências e os estados não vão nunca",
                            isCorrect: false,
                        },
                        { text: "O que muda com frequência fica fora do array", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Quando não usar efeito",
            blocks: [
                {
                    type: "text",
                    value: "# A maior parte dos efeitos não deveria existir\n\nEsta é a lição que mais melhora código React na prática. Quatro casos cobrem quase todo uso desnecessário de `useEffect`.",
                },
                {
                    type: "text",
                    value: "## 1. Calcular a partir de props ou estado\n\nSe o valor pode ser calculado durante a renderização, calcule. Um efeito que atualiza estado a partir de outro estado causa **duas renderizações** e cria um valor que pode ficar desatualizado.",
                },
                {
                    type: "code",
                    value: "// Errado\nconst [total, setTotal] = useState(0);\nuseEffect(() => {\n  setTotal(itens.reduce((s, i) => s + i.preco, 0));\n}, [itens]);\n\n// Certo\nconst total = itens.reduce((s, i) => s + i.preco, 0);",
                },
                {
                    type: "text",
                    value: "## 2. Reagir a uma ação do usuário\n\nSe algo acontece **porque a pessoa clicou**, o código pertence ao handler do clique, não a um efeito que observa a mudança de estado.",
                },
                {
                    type: "code",
                    value: '// Errado: o efeito não sabe por que o carrinho mudou\nuseEffect(() => {\n  if (carrinho.length > 0) registrarAnalytics("item_adicionado");\n}, [carrinho]);\n\n// Certo: a intenção está no lugar onde ela acontece\nfunction adicionar(item) {\n  setCarrinho([...carrinho, item]);\n  registrarAnalytics("item_adicionado");\n}',
                },
                {
                    type: "text",
                    value: "## 3. Resetar estado quando a prop muda\n\nO caminho mais limpo é dar uma `key` diferente ao componente: o React o descarta e cria outro, com o estado zerado.\n\n## 4. Inicializar algo uma vez\n\nSe é inicialização da aplicação e não do componente, o lugar é fora do componente, no módulo.",
                },
                {
                    type: "code",
                    value: "// Reset por key: sem efeito nenhum\n<PerfilUsuario key={usuarioId} usuarioId={usuarioId} />",
                },
            ],
            questions: [
                {
                    statement: "O que fazer com um valor que pode ser calculado?",
                    difficulty: "medio",
                    options: [
                        { text: "Calcular durante a renderização", isCorrect: true },
                        { text: "Guardar em estado e atualizar com um efeito", isCorrect: false },
                        { text: "Calcular dentro de um efeito com dependências", isCorrect: false },
                        { text: "Memorizar o resultado com useMemo sempre", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde colocar código que acontece por causa de um clique?",
                    difficulty: "medio",
                    options: [
                        { text: "No handler do clique", isCorrect: true },
                        { text: "Em um efeito que observa a mudança de estado", isCorrect: false },
                        { text: "Em um efeito com array de dependências vazio", isCorrect: false },
                        { text: "Em uma função chamada durante a renderização", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o custo de um efeito que atualiza estado derivado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Duas renderizações e um valor que pode atrasar", isCorrect: true },
                        {
                            text: "Uma renderização a mais, sem nenhum outro efeito",
                            isCorrect: false,
                        },
                        { text: "A perda do estado quando a prop muda", isCorrect: false },
                        { text: "A necessidade de uma função de limpeza", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a forma mais limpa de resetar o estado de um componente?",
                    difficulty: "dificil",
                    options: [
                        { text: "Dar a ele uma key diferente", isCorrect: true },
                        { text: "Chamar os setters dentro de um efeito", isCorrect: false },
                        { text: "Desmontar e montar o componente na mão", isCorrect: false },
                        { text: "Passar o valor inicial de novo por prop", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde inicializar algo que é da aplicação, não do componente?",
                    difficulty: "medio",
                    options: [
                        { text: "Fora do componente, no módulo", isCorrect: true },
                        { text: "Em um efeito com dependências vazias", isCorrect: false },
                        { text: "No componente raiz da aplicação inteira", isCorrect: false },
                        { text: "Em um hook próprio chamado uma vez", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Buscando dados",
            blocks: [
                {
                    type: "text",
                    value: "# O caso de uso mais comum, e o mais cheio de armadilha\n\nBuscar dados com `useEffect` funciona, e exige cuidados que quase todo tutorial curto ignora: condição de corrida, estado de carregamento, tratamento de erro e cancelamento.",
                },
                {
                    type: "code",
                    value: "function Perfil({ usuarioId }) {\n  const [dados, setDados] = useState(null);\n  const [carregando, setCarregando] = useState(true);\n  const [erro, setErro] = useState(null);\n\n  useEffect(() => {\n    let cancelado = false;\n    setCarregando(true);\n    setErro(null);\n\n    buscarUsuario(usuarioId)\n      .then((r) => {\n        if (!cancelado) setDados(r);\n      })\n      .catch((e) => {\n        if (!cancelado) setErro(e.message);\n      })\n      .finally(() => {\n        if (!cancelado) setCarregando(false);\n      });\n\n    return () => {\n      cancelado = true;\n    };\n  }, [usuarioId]);\n\n  if (carregando) return <p>Carregando...</p>;\n  if (erro) return <p>Erro: {erro}</p>;\n  return <h1>{dados.nome}</h1>;\n}",
                },
                {
                    type: "text",
                    value: "## A condição de corrida\n\nSe o `usuarioId` muda antes de a primeira resposta chegar, duas requisições ficam no ar. A que responder por último vence, e pode ser a **antiga**. A variável `cancelado` na limpeza resolve isso: a resposta que chega depois de o efeito ser limpo é descartada.\n\n## A recomendação atual\n\nA própria documentação do React sugere não escrever isso à mão. Uma biblioteca de busca de dados resolve cache, revalidação, deduplicação de requisições e estados de carregamento, que é bem mais do que o efeito acima faz.",
                },
                {
                    type: "quote",
                    value: "Escrever a busca à mão uma vez ensina os problemas. Escrever em todo componente do projeto repete os mesmos bugs em cada tela.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma condição de corrida ao buscar dados?",
                    difficulty: "dificil",
                    options: [
                        { text: "Uma resposta antiga chegar depois da nova", isCorrect: true },
                        {
                            text: "Duas requisições saírem ao mesmo tempo do navegador",
                            isCorrect: false,
                        },
                        {
                            text: "O servidor demorar demais para responder à chamada",
                            isCorrect: false,
                        },
                        {
                            text: "O componente desmontar antes de a resposta chegar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a variável `cancelado` resolve o problema?",
                    difficulty: "dificil",
                    options: [
                        { text: "Descarta a resposta que chega após a limpeza", isCorrect: true },
                        { text: "Interrompe a requisição no meio do caminho", isCorrect: false },
                        { text: "Impede que uma segunda requisição seja feita", isCorrect: false },
                        { text: "Guarda a ordem em que as respostas chegaram", isCorrect: false },
                    ],
                },
                {
                    statement: "Quantos estados a busca à mão costuma exigir?",
                    difficulty: "medio",
                    options: [
                        { text: "Três: dados, carregando e erro", isCorrect: true },
                        { text: "Um só, com os dados que foram recebidos", isCorrect: false },
                        { text: "Dois, os dados e o indicador de carregamento", isCorrect: false },
                        { text: "Nenhum, o efeito já cuida de tudo sozinho", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a documentação do React recomenda para busca de dados?",
                    difficulty: "medio",
                    options: [
                        { text: "Usar uma biblioteca em vez de escrever à mão", isCorrect: true },
                        { text: "Escrever sempre com useEffect e três estados", isCorrect: false },
                        {
                            text: "Buscar os dados no componente raiz da aplicação",
                            isCorrect: false,
                        },
                        { text: "Fazer a busca antes de montar o componente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que uma biblioteca de dados resolve além da requisição?",
                    difficulty: "medio",
                    options: [
                        { text: "Cache, revalidação e deduplicação", isCorrect: true },
                        { text: "A validação dos tipos da resposta recebida", isCorrect: false },
                        { text: "A renderização dos dados na tela do usuário", isCorrect: false },
                        { text: "O tratamento dos erros de rede do navegador", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Composição e reuso",
    aulas: [
        {
            titulo: "Composição com children",
            blocks: [
                {
                    type: "text",
                    value: "# A prop especial\n\nO que fica **entre** as tags de um componente chega nele como a prop `children`. É o mecanismo mais simples e mais poderoso de reuso do React.",
                },
                {
                    type: "code",
                    value: 'function Card({ titulo, children }) {\n  return (\n    <section className="card">\n      <h3>{titulo}</h3>\n      <div className="card__corpo">{children}</div>\n    </section>\n  );\n}\n\n<Card titulo="Resumo">\n  <p>Qualquer conteúdo aqui dentro.</p>\n  <Botao>Ver mais</Botao>\n</Card>',
                },
                {
                    type: "text",
                    value: "## Composição contra configuração\n\nA alternativa a `children` seria uma prop para cada variação: `temBotao`, `textoBotao`, `aoClicarBotao`. Isso cresce sem limite e acaba em um componente com vinte props que ninguém entende.\n\nCom composição, quem usa decide o conteúdo, e o componente cuida só da estrutura.",
                },
                {
                    type: "code",
                    value: '// Configuração: cresce a cada caso novo\n<Modal titulo="X" temRodape textoConfirmar="Salvar" aoConfirmar={f} />\n\n// Composição: o componente não precisa prever nada\n<Modal>\n  <Modal.Titulo>X</Modal.Titulo>\n  <Modal.Corpo>...</Modal.Corpo>\n  <Modal.Rodape>\n    <Botao onClick={f}>Salvar</Botao>\n  </Modal.Rodape>\n</Modal>',
                },
                {
                    type: "text",
                    value: "## Vários espaços\n\nQuando o componente precisa de mais de um lugar para conteúdo, props que recebem JSX resolvem sem precisar de nada especial.",
                },
                {
                    type: "code",
                    value: 'function Layout({ cabecalho, lateral, children }) {\n  return (\n    <div className="layout">\n      <header>{cabecalho}</header>\n      <aside>{lateral}</aside>\n      <main>{children}</main>\n    </div>\n  );\n}\n\n<Layout cabecalho={<Menu />} lateral={<Filtros />}>\n  <Conteudo />\n</Layout>',
                },
            ],
            questions: [
                {
                    statement: "O que a prop `children` contém?",
                    difficulty: "facil",
                    options: [
                        { text: "O que está entre as tags do componente", isCorrect: true },
                        { text: "Os componentes filhos declarados no arquivo", isCorrect: false },
                        { text: "As props que não foram usadas no componente", isCorrect: false },
                        { text: "Os elementos que o componente vai renderizar", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o problema de configurar tudo por props?",
                    difficulty: "medio",
                    options: [
                        { text: "O componente acumula props sem limite", isCorrect: true },
                        { text: "As props ficam difíceis de tipar corretamente", isCorrect: false },
                        {
                            text: "O componente renderiza mais vezes que o necessário",
                            isCorrect: false,
                        },
                        { text: "As props precisam ser passadas em ordem fixa", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a composição resolve?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem usa decide o conteúdo, o componente a estrutura",
                            isCorrect: true,
                        },
                        { text: "O componente passa a renderizar mais rápido", isCorrect: false },
                        { text: "As props deixam de precisar de valor padrão", isCorrect: false },
                        {
                            text: "O estado passa a ser compartilhado entre os dois componentes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como passar conteúdo para mais de um espaço?",
                    difficulty: "medio",
                    options: [
                        { text: "Com props que recebem JSX", isCorrect: true },
                        { text: "Com vários children separados por vírgula", isCorrect: false },
                        { text: "Com um array de elementos na prop children", isCorrect: false },
                        { text: "Com um componente para cada espaço da tela", isCorrect: false },
                    ],
                },
                {
                    statement: "O que se passa em `cabecalho={<Menu />}`?",
                    difficulty: "medio",
                    options: [
                        { text: "Um elemento React como valor da prop", isCorrect: true },
                        { text: "O nome do componente a ser renderizado", isCorrect: false },
                        { text: "Uma função que devolve o componente Menu", isCorrect: false },
                        { text: "Uma string com o JSX do componente", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Hooks próprios",
            blocks: [
                {
                    type: "text",
                    value: "# Extraindo lógica com estado\n\nUm **hook próprio** é uma função que começa com `use` e chama outros hooks. Ele extrai lógica com estado para ser reaproveitada, o que componentes não conseguem fazer.\n\nO que se compartilha é a **lógica**, não o estado: cada componente que usa o hook tem a sua própria cópia.",
                },
                {
                    type: "code",
                    value: 'function useLocalStorage<T>(chave: string, inicial: T) {\n  const [valor, setValor] = useState<T>(() => {\n    const salvo = localStorage.getItem(chave);\n    return salvo ? JSON.parse(salvo) : inicial;\n  });\n\n  useEffect(() => {\n    localStorage.setItem(chave, JSON.stringify(valor));\n  }, [chave, valor]);\n\n  return [valor, setValor] as const;\n}\n\n// Em qualquer componente\nconst [tema, setTema] = useLocalStorage("tema", "claro");',
                },
                {
                    type: "text",
                    value: "Repare no `useState` com função: passar uma função faz o cálculo do valor inicial rodar **uma vez só**, em vez de a cada renderização. Ler do `localStorage` a cada renderização seria desperdício.\n\n## As regras dos hooks\n\nDuas regras que o React exige, e o linter verifica:\n\n1. Chamar hooks apenas no **topo** do componente ou de outro hook, nunca dentro de `if`, laço ou função aninhada\n2. Chamar hooks apenas de **componentes** ou de outros hooks, nunca de funções comuns",
                },
                {
                    type: "code",
                    value: "// Errado: a ordem dos hooks muda entre renderizações\nif (ativo) {\n  const [x, setX] = useState(0);\n}\n\n// Certo: a condição vai para dentro\nconst [x, setX] = useState(0);\nif (ativo) { /* usa x */ }",
                },
                {
                    type: "text",
                    value: "A razão da primeira regra: o React identifica cada hook pela **ordem** em que foi chamado. Se a ordem muda, o estado de um hook acaba entregue a outro.",
                },
            ],
            questions: [
                {
                    statement: "O que um hook próprio compartilha entre componentes?",
                    difficulty: "dificil",
                    options: [
                        { text: "A lógica, não o estado", isCorrect: true },
                        { text: "O estado, sincronizado entre todos eles", isCorrect: false },
                        { text: "Os dois, lógica e estado ao mesmo tempo", isCorrect: false },
                        { text: "Apenas os efeitos declarados dentro dele", isCorrect: false },
                    ],
                },
                {
                    statement: "Como um hook próprio precisa se chamar?",
                    difficulty: "facil",
                    options: [
                        { text: "Começando com use", isCorrect: true },
                        { text: "Terminando com Hook no fim do nome", isCorrect: false },
                        { text: "Com a primeira letra sempre em maiúscula", isCorrect: false },
                        { text: "Com o prefixo react no começo do nome", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que hooks não podem ser chamados dentro de `if`?",
                    difficulty: "dificil",
                    options: [
                        { text: "O React os identifica pela ordem de chamada", isCorrect: true },
                        {
                            text: "Porque o React proíbe condicionais nos componentes",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o estado ficaria indefinido na condição",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o linter não consegue analisar o código",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que passar uma função ao `useState` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "O cálculo inicial roda uma vez só", isCorrect: true },
                        {
                            text: "O estado passa a ser calculado a cada renderização",
                            isCorrect: false,
                        },
                        {
                            text: "O valor inicial é recalculado quando as props mudam",
                            isCorrect: false,
                        },
                        { text: "A função é chamada sempre que o estado é lido", isCorrect: false },
                    ],
                },
                {
                    statement: "De onde um hook pode ser chamado?",
                    difficulty: "medio",
                    options: [
                        { text: "De componentes ou de outros hooks", isCorrect: true },
                        { text: "De qualquer função do projeto", isCorrect: false },
                        { text: "Apenas de componentes, nunca de hooks", isCorrect: false },
                        { text: "De funções auxiliares do mesmo arquivo", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Context",
            blocks: [
                {
                    type: "text",
                    value: "# Quando passar props cansa\n\nPassar um dado por cinco níveis de componentes que não o usam é chamado de **prop drilling**. O `Context` resolve isso: um valor fica disponível para toda a árvore abaixo, sem passar por quem não precisa.",
                },
                {
                    type: "code",
                    value: 'const TemaContext = createContext<"claro" | "escuro">("claro");\n\nfunction App() {\n  const [tema, setTema] = useState<"claro" | "escuro">("claro");\n\n  return (\n    <TemaContext value={tema}>\n      <Pagina />\n    </TemaContext>\n  );\n}\n\n// Em qualquer profundidade\nfunction Botao() {\n  const tema = use(TemaContext);\n  return <button className={tema}>Clique</button>;\n}',
                },
                {
                    type: "text",
                    value: "Duas mudanças do React 19 aparecem acima: o próprio contexto vira o provedor, dispensando `<TemaContext.Provider>`, e `use()` substitui `useContext()`.\n\n## Context não é gerenciador de estado\n\nEste é o mal-entendido mais comum. O contexto **transporta** um valor; ele não guarda nem otimiza nada. Quando o valor muda, **todo componente que o consome renderiza**, mesmo que use só uma parte dele.\n\nPor isso vale separar contextos por frequência de mudança, em vez de um único contexto com tudo dentro.",
                },
                {
                    type: "code",
                    value: "// Problema: quem só quer o tema renderiza quando o usuário muda\n<AppContext value={{ tema, usuario, carrinho }}>\n\n// Melhor: contextos separados\n<TemaContext value={tema}>\n  <UsuarioContext value={usuario}>\n    <CarrinhoContext value={carrinho}>",
                },
                {
                    type: "quote",
                    value: "Use context para o que muda pouco e é lido por muitos: tema, idioma, usuário logado. Para estado que muda toda hora, ele custa caro.",
                },
            ],
            questions: [
                {
                    statement: "Que problema o Context resolve?",
                    difficulty: "medio",
                    options: [
                        { text: "Passar props por níveis que não as usam", isCorrect: true },
                        { text: "Guardar o estado global da aplicação inteira", isCorrect: false },
                        { text: "Compartilhar estado entre componentes irmãos", isCorrect: false },
                        { text: "Evitar que os componentes renderizem demais", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece quando o valor de um contexto muda?",
                    difficulty: "dificil",
                    options: [
                        { text: "Todos os consumidores renderizam de novo", isCorrect: true },
                        { text: "Apenas quem usa a parte alterada renderiza", isCorrect: false },
                        { text: "O React compara e atualiza só o necessário", isCorrect: false },
                        { text: "Somente o componente provedor é renderizado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que mudou no Context com o React 19?",
                    difficulty: "medio",
                    options: [
                        { text: "O contexto virou o próprio provedor", isCorrect: true },
                        { text: "O contexto passou a guardar estado sozinho", isCorrect: false },
                        { text: "O provedor passou a exigir um valor padrão", isCorrect: false },
                        {
                            text: "O contexto deixou de aceitar objetos como valor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que separar contextos por frequência de mudança?",
                    difficulty: "dificil",
                    options: [
                        { text: "Para não renderizar quem não usa o que mudou", isCorrect: true },
                        { text: "Para reduzir o tamanho do código do provedor", isCorrect: false },
                        {
                            text: "Porque o React limita o tamanho de cada contexto",
                            isCorrect: false,
                        },
                        {
                            text: "Para que cada contexto tenha seu próprio estado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que tipo de dado o Context é adequado?",
                    difficulty: "medio",
                    options: [
                        { text: "O que muda pouco e é lido por muitos", isCorrect: true },
                        { text: "O que muda a cada digitação em um campo", isCorrect: false },
                        { text: "O que é usado por um componente só", isCorrect: false },
                        { text: "O que precisa ser guardado entre sessões", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Refs",
            blocks: [
                {
                    type: "text",
                    value: "# Guardar algo sem renderizar\n\nO `useRef` guarda um valor que **sobrevive entre renderizações** e cujo `.current` pode ser alterado **sem** disparar renderização.\n\nSão dois usos bem diferentes: acessar um elemento do DOM e guardar um valor mutável que não afeta a tela.",
                },
                {
                    type: "code",
                    value: "function Campo() {\n  const inputRef = useRef<HTMLInputElement>(null);\n\n  function focar() {\n    inputRef.current?.focus();\n  }\n\n  return (\n    <>\n      <input ref={inputRef} />\n      <button onClick={focar}>Focar</button>\n    </>\n  );\n}",
                },
                {
                    type: "code",
                    value: "// Guardando um valor mutável: o id do temporizador\nfunction Cronometro() {\n  const idRef = useRef<number | null>(null);\n\n  function iniciar() {\n    idRef.current = setInterval(tick, 1000);\n  }\n\n  function parar() {\n    if (idRef.current) clearInterval(idRef.current);\n  }\n}",
                },
                {
                    type: "table",
                    value: '[["", "useState", "useRef"], ["Renderiza ao mudar", "sim", "não"], ["Sobrevive à renderização", "sim", "sim"], ["Ler durante a renderização", "sim", "não deve"], ["Para que serve", "o que aparece na tela", "o que não aparece"]]',
                },
                {
                    type: "text",
                    value: "## A regra que evita bug\n\nNão leia nem escreva `ref.current` **durante a renderização**. Como alterá-lo não dispara renderização, o valor lido pode não corresponder ao que está na tela, e o React não garante consistência nesse caso. Use dentro de handlers e efeitos.",
                },
            ],
            questions: [
                {
                    statement: "O que acontece ao alterar `ref.current`?",
                    difficulty: "medio",
                    options: [
                        { text: "Nada renderiza de novo", isCorrect: true },
                        { text: "O componente renderiza como com um estado", isCorrect: false },
                        { text: "O React agenda uma renderização para depois", isCorrect: false },
                        { text: "Apenas o elemento referenciado é atualizado", isCorrect: false },
                    ],
                },
                {
                    statement: "Quais são os dois usos de uma ref?",
                    difficulty: "medio",
                    options: [
                        { text: "Acessar o DOM e guardar valor mutável", isCorrect: true },
                        {
                            text: "Guardar estado e compartilhar entre componentes",
                            isCorrect: false,
                        },
                        { text: "Otimizar renderizações e memorizar funções", isCorrect: false },
                        { text: "Criar efeitos e cancelar requisições", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que não ler `ref.current` durante a renderização?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O valor pode não corresponder ao que está na tela",
                            isCorrect: true,
                        },
                        { text: "A leitura dispara uma renderização adicional", isCorrect: false },
                        {
                            text: "O React proíbe a leitura e avisa com um erro no console",
                            isCorrect: false,
                        },
                        { text: "A ref ainda não foi preenchida nesse momento", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde uma ref deve ser usada?",
                    difficulty: "medio",
                    options: [
                        { text: "Em handlers e efeitos", isCorrect: true },
                        { text: "Diretamente no corpo do componente", isCorrect: false },
                        { text: "Dentro do JSX que será renderizado", isCorrect: false },
                        { text: "Em qualquer lugar, sem restrição alguma", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual valor uma ref de elemento tem antes da montagem?",
                    difficulty: "medio",
                    options: [
                        { text: "null", isCorrect: true },
                        { text: "O elemento vazio criado pelo React", isCorrect: false },
                        { text: "Um objeto com o current indefinido", isCorrect: false },
                        { text: "O valor padrão passado ao useRef", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "ref como prop, novidade do React 19",
            blocks: [
                {
                    type: "text",
                    value: "# O fim do forwardRef\n\nAté o React 18, `ref` não era uma prop comum: passá-la a um componente próprio não funcionava, e era preciso envolver tudo em `forwardRef`.\n\nO **React 19** mudou isso: `ref` virou uma prop como qualquer outra, e o `forwardRef` deixou de ser necessário em componentes função.",
                },
                {
                    type: "code",
                    value: "// Antes do React 19\nconst Input = forwardRef<HTMLInputElement, Props>((props, ref) => {\n  return <input ref={ref} {...props} />;\n});\n\n// React 19: ref é só mais uma prop\nfunction Input({ ref, ...props }: Props & { ref?: Ref<HTMLInputElement> }) {\n  return <input ref={ref} {...props} />;\n}",
                },
                {
                    type: "text",
                    value: "## Limpeza na ref de callback\n\nOutra melhoria do 19: uma `ref` em forma de função pode devolver uma **função de limpeza**, que roda quando o elemento sai da tela. Antes, o React chamava a função com `null` no desmonte, o que exigia uma verificação em todo lugar.",
                },
                {
                    type: "code",
                    value: "<div\n  ref={(node) => {\n    const observador = new ResizeObserver(medir);\n    observador.observe(node);\n    return () => observador.disconnect();   // React 19\n  }}\n/>",
                },
                {
                    type: "text",
                    value: "## useImperativeHandle\n\nQuando o componente quer expor **ações** em vez do elemento cru, `useImperativeHandle` define o que a ref enxerga. Use com parcimônia: expor um elemento inteiro dá a quem usa poder demais sobre o interior do componente.",
                },
                {
                    type: "code",
                    value: 'type Acoes = { focar: () => void; limpar: () => void };\n\nfunction Campo({ ref }: { ref?: Ref<Acoes> }) {\n  const input = useRef<HTMLInputElement>(null);\n\n  useImperativeHandle(ref, () => ({\n    focar: () => input.current?.focus(),\n    limpar: () => { if (input.current) input.current.value = ""; },\n  }));\n\n  return <input ref={input} />;\n}',
                },
            ],
            questions: [
                {
                    statement: "O que o React 19 mudou quanto à `ref`?",
                    difficulty: "medio",
                    options: [
                        { text: "Ela virou uma prop comum", isCorrect: true },
                        { text: "Ela passou a ser criada automaticamente", isCorrect: false },
                        { text: "Ela deixou de funcionar em componentes função", isCorrect: false },
                        {
                            text: "Ela passou a exigir o uso de useImperativeHandle",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o `forwardRef` fazia?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Permitia repassar a ref para o elemento interno",
                            isCorrect: true,
                        },
                        { text: "Criava a referência usada pelo componente pai", isCorrect: false },
                        { text: "Guardava o valor da ref entre renderizações", isCorrect: false },
                        {
                            text: "Convertia a ref em uma prop comum do componente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que uma ref de callback pode devolver no React 19?",
                    difficulty: "dificil",
                    options: [
                        { text: "Uma função de limpeza", isCorrect: true },
                        { text: "O elemento que foi referenciado por ela", isCorrect: false },
                        { text: "Um valor booleano indicando sucesso", isCorrect: false },
                        { text: "A referência do componente pai da árvore", isCorrect: false },
                    ],
                },
                {
                    statement: "Como era o desmonte de uma ref de callback antes?",
                    difficulty: "dificil",
                    options: [
                        { text: "A função era chamada com null", isCorrect: true },
                        { text: "A função simplesmente não era mais chamada", isCorrect: false },
                        { text: "O React removia a referência em silêncio", isCorrect: false },
                        { text: "Era preciso chamar a limpeza manualmente", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `useImperativeHandle`?",
                    difficulty: "medio",
                    options: [
                        { text: "Expor ações em vez do elemento cru", isCorrect: true },
                        { text: "Criar uma ref dentro do próprio componente", isCorrect: false },
                        { text: "Repassar a ref recebida para outro componente", isCorrect: false },
                        { text: "Executar comandos quando a ref é acessada", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - React 19: Actions e Suspense",
    aulas: [
        {
            titulo: "Actions e useActionState",
            blocks: [
                {
                    type: "text",
                    value: "# O padrão que se repetia em todo formulário\n\nAntes do React 19, enviar um formulário exigia sempre a mesma sequência escrita à mão: estado de enviando, estado de erro, `preventDefault`, `try` e `finally`. Cinco linhas de cerimônia para cada formulário do projeto.\n\nAs **Actions** transformam isso em um recurso do framework. Uma função assíncrona passada para `action` recebe os dados do formulário, e o React cuida do resto.",
                },
                {
                    type: "code",
                    value: 'function Perfil() {\n  const [erro, submeter, enviando] = useActionState(\n    async (_anterior: string | null, dados: FormData) => {\n      try {\n        await salvarNome(dados.get("nome") as string);\n        return null;\n      } catch (e) {\n        return e instanceof Error ? e.message : "falhou";\n      }\n    },\n    null,\n  );\n\n  return (\n    <form action={submeter}>\n      <input name="nome" />\n      <button disabled={enviando}>Salvar</button>\n      {erro && <p className="erro">{erro}</p>}\n    </form>\n  );\n}',
                },
                {
                    type: "text",
                    value: "O `useActionState` devolve três coisas: o **estado** devolvido pela ação, a **função** para passar ao formulário e um booleano de **pendente**.\n\nRepare no que sumiu: não há `useState` para enviando, não há `preventDefault`, e o campo é lido pelo `name` em vez de estado controlado.",
                },
                {
                    type: "table",
                    value: '[["Antes", "Com Actions"], ["useState para enviando", "vem no terceiro retorno"], ["useState para erro", "é o valor devolvido pela ação"], ["onSubmit com preventDefault", "action recebe a função"], ["estado por campo", "FormData pelo name"]]',
                },
                {
                    type: "text",
                    value: "## O formulário se limpa sozinho\n\nQuando a ação termina sem erro, o React reinicia o formulário. É o comportamento esperado na maioria dos casos, e evita mais um trecho de código repetido.",
                },
            ],
            questions: [
                {
                    statement: "O que o `useActionState` devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "O estado, a função de envio e o pendente", isCorrect: true },
                        {
                            text: "Apenas a função que será passada ao formulário",
                            isCorrect: false,
                        },
                        {
                            text: "O estado do formulário e os erros de validação",
                            isCorrect: false,
                        },
                        { text: "Os dados enviados e o resultado da requisição", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a prop `action` de um formulário recebe no React 19?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma função, que pode ser assíncrona", isCorrect: true },
                        { text: "A URL para onde os dados serão enviados", isCorrect: false },
                        { text: "O nome da rota que trata o formulário", isCorrect: false },
                        { text: "Um objeto com a configuração do envio", isCorrect: false },
                    ],
                },
                {
                    statement: "O que deixa de ser necessário com Actions?",
                    difficulty: "medio",
                    options: [
                        { text: "O preventDefault e o estado de enviando", isCorrect: true },
                        { text: "A validação de todos os campos antes do envio", isCorrect: false },
                        { text: "O tratamento de erro dentro da função", isCorrect: false },
                        { text: "Os nomes nos campos do formulário", isCorrect: false },
                    ],
                },
                {
                    statement: "Como os campos são lidos em uma Action?",
                    difficulty: "medio",
                    options: [
                        { text: "Pelo FormData, usando o name de cada um", isCorrect: true },
                        { text: "Por estados controlados, um para cada campo", isCorrect: false },
                        { text: "Por refs apontando para cada elemento", isCorrect: false },
                        { text: "Pelo id declarado em cada um dos campos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com o formulário quando a ação termina bem?",
                    difficulty: "dificil",
                    options: [
                        { text: "O React o reinicia sozinho", isCorrect: true },
                        { text: "Ele mantém os valores que foram digitados", isCorrect: false },
                        { text: "Ele é desmontado e montado de novo na tela", isCorrect: false },
                        {
                            text: "Ele fica desabilitado até a próxima renderização",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "useOptimistic",
            blocks: [
                {
                    type: "text",
                    value: "# Responder antes de o servidor responder\n\nQuando alguém curte um post, esperar a resposta do servidor para mudar o coração deixa a interface lenta. A **atualização otimista** mostra o resultado esperado na hora e corrige depois, se der errado.\n\nEscrever isso à mão exige guardar o valor anterior e desfazer no erro. O `useOptimistic` faz o desfazer sozinho.",
                },
                {
                    type: "code",
                    value: "function Curtidas({ post }) {\n  const [otimista, curtirOtimista] = useOptimistic(\n    post.curtidas,\n    (atual: number, delta: number) => atual + delta,\n  );\n\n  async function curtir() {\n    curtirOtimista(1);        // a tela muda agora\n    await enviarCurtida(post.id);   // se falhar, volta sozinho\n  }\n\n  return <button onClick={curtir}>{otimista} curtidas</button>;\n}",
                },
                {
                    type: "text",
                    value: "## Como o desfazer funciona\n\nO valor otimista vale **enquanto a ação está pendente**. Quando ela termina, o React descarta o valor otimista e volta a mostrar o estado real. Se a ação deu certo e o estado real foi atualizado, a transição é imperceptível; se falhou, o valor antigo reaparece.\n\nIsso significa que você não escreve nenhum código de rollback.",
                },
                {
                    type: "quote",
                    value: "Use atualização otimista onde a falha é rara e o custo dela é baixo. Em transferência de dinheiro, mostre o resultado só depois da confirmação.",
                },
                {
                    type: "text",
                    value: "## Em listas\n\nO padrão mais comum é acrescentar um item que ainda está sendo enviado, marcado visualmente como pendente.",
                },
                {
                    type: "code",
                    value: 'const [mensagens, adicionarOtimista] = useOptimistic(\n  mensagensReais,\n  (atuais: Msg[], nova: string) => [\n    ...atuais,\n    { id: "temp", texto: nova, enviando: true },\n  ],\n);\n\n{mensagens.map((m) => (\n  <li key={m.id} className={m.enviando ? "pendente" : ""}>\n    {m.texto}\n  </li>\n))}',
                },
            ],
            questions: [
                {
                    statement: "O que é uma atualização otimista?",
                    difficulty: "medio",
                    options: [
                        { text: "Mostrar o resultado esperado antes da resposta", isCorrect: true },
                        {
                            text: "Enviar a requisição antes de o usuário confirmar",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar a alteração para enviar tudo de uma vez",
                            isCorrect: false,
                        },
                        {
                            text: "Repetir a requisição quando ela falha na primeira",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por quanto tempo o valor otimista vale?",
                    difficulty: "medio",
                    options: [
                        { text: "Enquanto a ação estiver pendente", isCorrect: true },
                        { text: "Até que o componente seja desmontado da tela", isCorrect: false },
                        {
                            text: "Por alguns segundos, definidos na configuração",
                            isCorrect: false,
                        },
                        { text: "Até que outra atualização otimista aconteça", isCorrect: false },
                    ],
                },
                {
                    statement: "Quem escreve o código que desfaz a alteração no erro?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ninguém, o React descarta o valor sozinho", isCorrect: true },
                        { text: "O desenvolvedor, dentro do bloco catch", isCorrect: false },
                        { text: "A própria função passada ao useOptimistic", isCorrect: false },
                        { text: "O componente pai, ao receber o erro", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde a atualização otimista não é adequada?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Quando o custo de errar é alto, como em pagamento",
                            isCorrect: true,
                        },
                        { text: "Em listas com muitos itens sendo exibidos", isCorrect: false },
                        {
                            text: "Quando a requisição demora apenas poucos milissegundos",
                            isCorrect: false,
                        },
                        { text: "Em formulários com mais de um campo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a segunda função passada ao `useOptimistic` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Calcula o valor otimista a partir do atual", isCorrect: true },
                        {
                            text: "Envia a requisição para o servidor da aplicação",
                            isCorrect: false,
                        },
                        { text: "Decide se a atualização deve ser desfeita", isCorrect: false },
                        { text: "Valida os dados antes de exibir na tela", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "useFormStatus e componentes de formulário",
            blocks: [
                {
                    type: "text",
                    value: "# O botão que sabe do formulário\n\nUm botão de envio precisa se desabilitar enquanto o formulário está sendo enviado. Passar essa informação por prop funciona, e obriga todo formulário a repassar o mesmo dado.\n\nO `useFormStatus` deixa o componente **perguntar** o estado do formulário pai, sem receber prop nenhuma.",
                },
                {
                    type: "code",
                    value: 'import { useFormStatus } from "react-dom";\n\nfunction BotaoEnviar({ children }) {\n  const { pending } = useFormStatus();\n\n  return (\n    <button disabled={pending}>\n      {pending ? "Enviando..." : children}\n    </button>\n  );\n}\n\n// Em qualquer formulário, sem passar nada\n<form action={submeter}>\n  <input name="email" />\n  <BotaoEnviar>Cadastrar</BotaoEnviar>\n</form>',
                },
                {
                    type: "text",
                    value: "## A regra que confunde\n\nO `useFormStatus` só funciona em um componente que está **dentro** do formulário. Chamá-lo no mesmo componente que renderiza o `<form>` devolve sempre `pending: false`, porque não há formulário pai.\n\nEsse é o erro mais comum com esse hook, e a mensagem não é óbvia.",
                },
                {
                    type: "code",
                    value: "// Errado: o hook está no mesmo componente do form\nfunction Formulario() {\n  const { pending } = useFormStatus();   // sempre false\n  return <form action={f}><button disabled={pending} /></form>;\n}\n\n// Certo: o hook está em um filho\nfunction Formulario() {\n  return <form action={f}><BotaoEnviar /></form>;\n}",
                },
                {
                    type: "text",
                    value: "O hook também entrega `data`, `method` e `action`, o que permite construir indicadores mais ricos sem acoplar nada ao formulário específico.",
                },
            ],
            questions: [
                {
                    statement: "O que o `useFormStatus` permite?",
                    difficulty: "medio",
                    options: [
                        { text: "Um filho saber o estado do formulário pai", isCorrect: true },
                        { text: "O formulário conhecer o estado de cada campo", isCorrect: false },
                        { text: "Validar o formulário antes de ele ser enviado", isCorrect: false },
                        {
                            text: "Cancelar o envio de um formulário em andamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde o `useFormStatus` precisa ser chamado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Em um componente dentro do formulário", isCorrect: true },
                        { text: "No mesmo componente que renderiza o form", isCorrect: false },
                        { text: "No componente pai do formulário na árvore", isCorrect: false },
                        { text: "Em qualquer lugar da aplicação, sem restrição", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao chamá-lo no componente do próprio `<form>`?",
                    difficulty: "dificil",
                    options: [
                        { text: "O pending fica sempre falso", isCorrect: true },
                        { text: "O React lança um erro avisando do problema", isCorrect: false },
                        {
                            text: "O hook devolve o estado do formulário mesmo assim",
                            isCorrect: false,
                        },
                        { text: "O formulário deixa de ser enviado ao servidor", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a alternativa que o hook substitui?",
                    difficulty: "medio",
                    options: [
                        { text: "Passar o estado de envio por prop", isCorrect: true },
                        { text: "Guardar o estado do formulário em um contexto", isCorrect: false },
                        { text: "Usar uma ref apontando para o formulário", isCorrect: false },
                        { text: "Consultar o DOM para saber se está enviando", isCorrect: false },
                    ],
                },
                {
                    statement: "De qual pacote o `useFormStatus` vem?",
                    difficulty: "medio",
                    options: [
                        { text: "react-dom", isCorrect: true },
                        { text: "react, junto dos outros hooks", isCorrect: false },
                        { text: "react-form, um pacote separado", isCorrect: false },
                        { text: "react-router, com o roteamento", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "use() e Suspense",
            blocks: [
                {
                    type: "text",
                    value: "# Um hook que quebra as regras\n\nO `use()` do React 19 lê o valor de uma promessa ou de um contexto. Diferente dos outros hooks, ele **pode ser chamado dentro de condicionais e laços**, o que o torna bem mais flexível.",
                },
                {
                    type: "code",
                    value: 'import { use, Suspense } from "react";\n\nfunction Comentarios({ promessa }: { promessa: Promise<Comentario[]> }) {\n  const comentarios = use(promessa);   // suspende até resolver\n  return <ul>{comentarios.map((c) => <li key={c.id}>{c.texto}</li>)}</ul>;\n}\n\nfunction Pagina() {\n  const promessa = buscarComentarios();\n\n  return (\n    <Suspense fallback={<p>Carregando comentários...</p>}>\n      <Comentarios promessa={promessa} />\n    </Suspense>\n  );\n}',
                },
                {
                    type: "text",
                    value: "## O que é suspender\n\nQuando o `use()` encontra uma promessa não resolvida, o componente **suspende**: o React sobe até o `Suspense` mais próximo e mostra o `fallback`. Quando a promessa resolve, ele renderiza o conteúdo real.\n\nO ganho é que o estado de carregamento sai do componente. Não há `if (carregando)` espalhado, e o local do indicador é uma decisão de quem monta a tela.",
                },
                {
                    type: "code",
                    value: "// Vários limites: cada parte revela quando estiver pronta\n<Suspense fallback={<EsqueletoPerfil />}>\n  <Perfil />\n  <Suspense fallback={<EsqueletoPosts />}>\n    <Posts />\n  </Suspense>\n</Suspense>",
                },
                {
                    type: "text",
                    value: "## O cuidado com a promessa\n\nCriar a promessa **dentro** do componente que a consome causa um laço: ele suspende, renderiza de novo, cria outra promessa, suspende outra vez. A promessa precisa vir de fora, de um framework com cache ou de uma biblioteca de dados.\n\nÉ por isso que `use()` com promessa aparece pouco em aplicações puramente cliente, e é natural em frameworks que integram busca de dados.",
                },
            ],
            questions: [
                {
                    statement: "O que diferencia o `use()` dos outros hooks?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele pode ser chamado dentro de condicionais", isCorrect: true },
                        { text: "Ele só funciona em componentes de servidor", isCorrect: false },
                        { text: "Ele não precisa ser importado do React", isCorrect: false },
                        {
                            text: "Ele devolve sempre o mesmo valor entre renderizações",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que acontece quando um componente suspende?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O React mostra o fallback do Suspense mais próximo",
                            isCorrect: true,
                        },
                        { text: "O componente é desmontado até o dado chegar", isCorrect: false },
                        {
                            text: "A renderização da página inteira é interrompida",
                            isCorrect: false,
                        },
                        {
                            text: "O React tenta renderizar de novo depois de um tempo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o ganho do Suspense sobre um estado de carregando?",
                    difficulty: "dificil",
                    options: [
                        { text: "O estado de carregamento sai do componente", isCorrect: true },
                        { text: "Os dados chegam bem mais rápido ao componente", isCorrect: false },
                        { text: "O componente deixa de precisar tratar erros", isCorrect: false },
                        { text: "O React guarda o resultado em cache sozinho", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual o problema de criar a promessa dentro do componente que a consome?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ele entra em laço, criando uma promessa nova a cada vez",
                            isCorrect: true,
                        },
                        {
                            text: "A promessa acaba nunca sendo resolvida pelo React em si",
                            isCorrect: false,
                        },
                        { text: "O componente perde o estado a cada suspensão", isCorrect: false },
                        {
                            text: "O Suspense deixa de mostrar o conteúdo de espera",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde `use()` com promessa se encaixa melhor?",
                    difficulty: "medio",
                    options: [
                        { text: "Em frameworks que integram busca de dados", isCorrect: true },
                        {
                            text: "Em qualquer aplicação React do lado do cliente",
                            isCorrect: false,
                        },
                        { text: "Em componentes que fazem várias requisições", isCorrect: false },
                        { text: "Em aplicações sem nenhum roteamento definido", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Metadados e recursos no documento",
            blocks: [
                {
                    type: "text",
                    value: "# Título e meta dentro do componente\n\nAntes do React 19, mudar o título da página ou uma meta tag exigia uma biblioteca ou um efeito mexendo no `document`. O React 19 passou a **entender** essas tags dentro de qualquer componente e movê-las para o `<head>` sozinho.",
                },
                {
                    type: "code",
                    value: 'function PaginaProduto({ produto }) {\n  return (\n    <article>\n      <title>{produto.nome} | Loja</title>\n      <meta name="description" content={produto.resumo} />\n      <link rel="canonical" href={`/produtos/${produto.slug}`} />\n\n      <h1>{produto.nome}</h1>\n      <p>{produto.descricao}</p>\n    </article>\n  );\n}',
                },
                {
                    type: "text",
                    value: 'As tags acima aparecem no meio do JSX e vão parar no `<head>` do documento. O componente que sabe o nome do produto é o mesmo que declara o título, o que elimina a sincronização manual entre os dois.\n\n## Folhas de estilo e scripts\n\nO mesmo vale para `<link rel="stylesheet">` e `<script async>`. O React cuida de **não duplicar**: se dois componentes declararem a mesma folha, ela é carregada uma vez só, e a ordem respeita a precedência informada.',
                },
                {
                    type: "code",
                    value: '<link rel="stylesheet" href="/editor.css" precedence="default" />\n<script async src="https://analytics.exemplo.com/s.js" />',
                },
                {
                    type: "text",
                    value: "## Pré-carregamento\n\nO React 19 também expõe funções para avisar o navegador do que virá, o que reduz o tempo até a tela ficar pronta.",
                },
                {
                    type: "code",
                    value: 'import { preload, preconnect, prefetchDNS } from "react-dom";\n\npreconnect("https://api.exemplo.com");\npreload("/fonte.woff2", { as: "font" });',
                },
            ],
            questions: [
                {
                    statement:
                        "O que o React 19 faz com uma tag `<title>` dentro de um componente?",
                    difficulty: "medio",
                    options: [
                        { text: "Move para o head do documento", isCorrect: true },
                        { text: "Renderiza como texto no corpo da página", isCorrect: false },
                        { text: "Ignora a tag e avisa no console do navegador", isCorrect: false },
                        { text: "Exige que ela esteja no componente raiz", isCorrect: false },
                    ],
                },
                {
                    statement: "O que era preciso antes do React 19 para mudar o título?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma biblioteca ou um efeito mexendo no document",
                            isCorrect: true,
                        },
                        { text: "Declarar o título no arquivo HTML de entrada", isCorrect: false },
                        {
                            text: "Passar o título por prop até chegar ao componente raiz",
                            isCorrect: false,
                        },
                        { text: "Usar um componente especial do próprio React", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "O que acontece se dois componentes declararem a mesma folha de estilo?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ela é carregada uma vez só", isCorrect: true },
                        {
                            text: "As duas são carregadas, na ordem em que aparecem",
                            isCorrect: false,
                        },
                        { text: "O React avisa sobre a duplicação no console", isCorrect: false },
                        { text: "Apenas a do componente mais externo é usada", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o atributo `precedence` em uma folha de estilo?",
                    difficulty: "dificil",
                    options: [
                        { text: "Definir a ordem em que ela entra no head", isCorrect: true },
                        {
                            text: "Indicar a prioridade de carregamento no navegador",
                            isCorrect: false,
                        },
                        { text: "Marcar a folha como obrigatória para a página", isCorrect: false },
                        { text: "Escolher qual folha vence em caso de conflito", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a função `preconnect` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Avisa o navegador para preparar a conexão", isCorrect: true },
                        { text: "Faz a requisição antes de o componente montar", isCorrect: false },
                        { text: "Guarda a resposta em cache para o próximo uso", isCorrect: false },
                        { text: "Verifica se o servidor está disponível", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Desempenho",
    aulas: [
        {
            titulo: "Como o React re-renderiza",
            blocks: [
                {
                    type: "text",
                    value: "# A regra principal\n\nQuando o estado de um componente muda, **ele e todos os seus descendentes** renderizam de novo. Não importa se as props dos filhos mudaram.\n\nIsso assusta quando dito assim, e na prática costuma ser barato: renderizar é executar funções e comparar objetos, não mexer no navegador. O React só toca no DOM naquilo que realmente mudou.",
                },
                {
                    type: "table",
                    value: '[["Etapa", "O que acontece", "Custo"], ["Render", "as funções rodam e devolvem JSX", "baixo"], ["Reconciliação", "o React compara com o anterior", "baixo"], ["Commit", "o DOM é alterado", "o mais caro"]]',
                },
                {
                    type: "text",
                    value: "## Otimizar cedo demais custa mais que não otimizar\n\nEnvolver tudo em `memo` e `useCallback` acrescenta comparações e complexidade em troca de ganho nenhum na maior parte dos casos. A ordem certa é: **medir primeiro**.\n\nO React DevTools tem um perfilador que mostra o que renderizou, quantas vezes e quanto tempo levou. Sem esse dado, otimização é chute.",
                },
                {
                    type: "quote",
                    value: "Renderizar não é o mesmo que atualizar o DOM. A maior parte dos problemas de desempenho em React é trabalho pesado dentro do render, não a quantidade de renderizações.",
                },
                {
                    type: "text",
                    value: "## Os problemas reais mais comuns\n\n- Cálculo pesado feito a cada renderização, sem memorização\n- Lista com milhares de itens renderizados de uma vez\n- Contexto com valor novo a cada renderização do provedor\n- Componente que renderiza a árvore inteira por um estado que deveria estar mais embaixo",
                },
            ],
            questions: [
                {
                    statement: "O que acontece quando o estado de um componente muda?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele e seus descendentes renderizam de novo", isCorrect: true },
                        {
                            text: "Apenas ele renderiza, os filhos ficam como estão",
                            isCorrect: false,
                        },
                        {
                            text: "Somente os filhos cujas props mudaram renderizam",
                            isCorrect: false,
                        },
                        { text: "A aplicação inteira é renderizada novamente", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual etapa é a mais cara?",
                    difficulty: "medio",
                    options: [
                        { text: "O commit, quando o DOM é alterado", isCorrect: true },
                        { text: "O render, quando as funções são executadas", isCorrect: false },
                        { text: "A reconciliação, ao comparar as árvores", isCorrect: false },
                        { text: "As três custam praticamente o mesmo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a ordem certa ao otimizar?",
                    difficulty: "medio",
                    options: [
                        { text: "Medir primeiro, otimizar depois", isCorrect: true },
                        { text: "Memorizar tudo e medir o ganho no fim", isCorrect: false },
                        { text: "Otimizar os componentes maiores primeiro", isCorrect: false },
                        { text: "Reduzir a quantidade de componentes na tela", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual costuma ser o problema real de desempenho?",
                    difficulty: "dificil",
                    options: [
                        { text: "Trabalho pesado dentro do render", isCorrect: true },
                        { text: "A quantidade de componentes que renderizam", isCorrect: false },
                        { text: "O tamanho do arquivo JavaScript carregado", isCorrect: false },
                        { text: "O número de estados declarados no componente", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual ferramenta mostra o que renderizou e quanto custou?",
                    difficulty: "medio",
                    options: [
                        { text: "O perfilador do React DevTools", isCorrect: true },
                        { text: "O console do navegador, com avisos do React", isCorrect: false },
                        { text: "O relatório gerado pelo build de produção", isCorrect: false },
                        { text: "O StrictMode, contando as renderizações", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "memo, useMemo e useCallback",
            blocks: [
                {
                    type: "text",
                    value: "# As três ferramentas de memorização\n\nElas resolvem problemas diferentes, e confundi-las é comum.",
                },
                {
                    type: "table",
                    value: '[["Ferramenta", "Memoriza", "Evita"], ["memo", "o componente", "renderizar com as mesmas props"], ["useMemo", "um valor calculado", "recalcular a cada renderização"], ["useCallback", "uma função", "recriar a função a cada renderização"]]',
                },
                {
                    type: "code",
                    value: "// memo: só renderiza se as props mudarem\nconst Linha = memo(function Linha({ item, aoClicar }) {\n  return <li onClick={() => aoClicar(item.id)}>{item.nome}</li>;\n});\n\n// useMemo: cálculo caro que não precisa repetir\nconst ordenados = useMemo(\n  () => itens.slice().sort((a, b) => a.nome.localeCompare(b.nome)),\n  [itens],\n);\n\n// useCallback: função estável para passar a um filho memorizado\nconst aoClicar = useCallback((id: number) => {\n  setSelecionado(id);\n}, []);",
                },
                {
                    type: "text",
                    value: "## A armadilha do memo\n\n`memo` compara props por referência. Se o pai passa um objeto, um array ou uma função criada durante a renderização, a referência é nova toda vez e o `memo` **nunca funciona**.\n\nÉ por isso que `memo` e `useCallback` costumam andar juntos: sozinho, o `memo` no exemplo abaixo não evita nada.",
                },
                {
                    type: "code",
                    value: "// O memo não adianta: aoClicar é uma função nova a cada renderização\n<Linha item={item} aoClicar={() => selecionar(item.id)} />\n\n// Agora sim: a referência de aoClicar é estável\nconst aoClicar = useCallback((id) => selecionar(id), []);\n<Linha item={item} aoClicar={aoClicar} />",
                },
                {
                    type: "quote",
                    value: "Memorizar tem custo: a comparação, a memória e o código a mais. Só vale quando o perfilador mostrou que aquele ponto é o problema.",
                },
            ],
            questions: [
                {
                    statement: "O que o `memo` memoriza?",
                    difficulty: "facil",
                    options: [
                        { text: "O componente, pelas props recebidas", isCorrect: true },
                        { text: "O valor calculado dentro do componente", isCorrect: false },
                        { text: "A função passada como prop ao componente", isCorrect: false },
                        { text: "O estado guardado dentro do componente", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o `memo` compara as props?",
                    difficulty: "dificil",
                    options: [
                        { text: "Por referência", isCorrect: true },
                        { text: "Por valor, campo a campo do objeto", isCorrect: false },
                        { text: "Por uma comparação profunda das estruturas", isCorrect: false },
                        { text: "Pela quantidade de props recebidas", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `memo` e `useCallback` costumam andar juntos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sem função estável, o memo nunca evita renderização",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o useCallback exige um componente memorizado",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os dois precisam do mesmo array de dependências",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o memo não funciona com componentes função",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o `useMemo` evita?",
                    difficulty: "medio",
                    options: [
                        { text: "Recalcular um valor a cada renderização", isCorrect: true },
                        { text: "Renderizar o componente mais de uma vez", isCorrect: false },
                        { text: "Recriar as funções passadas aos filhos", isCorrect: false },
                        { text: "Buscar os dados no servidor repetidamente", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o custo de memorizar?",
                    difficulty: "medio",
                    options: [
                        { text: "A comparação, a memória e o código a mais", isCorrect: true },
                        {
                            text: "Uma renderização extra no primeiro carregamento",
                            isCorrect: false,
                        },
                        { text: "A perda do estado quando as props mudam", isCorrect: false },
                        {
                            text: "A necessidade de declarar todas as dependências",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O React Compiler",
            blocks: [
                {
                    type: "text",
                    value: "# Memorização automática\n\nA maior crítica ao React sempre foi a quantidade de `memo`, `useMemo` e `useCallback` que um projeto grande acumula. É trabalho manual, fácil de errar, e polui o código.\n\nO **React Compiler**, que chegou à versão **1.0** na linha do React 19, resolve isso na origem: ele analisa os componentes durante o build e **insere a memorização sozinho**, onde ela é necessária.",
                },
                {
                    type: "code",
                    value: "// Você escreve assim\nfunction Lista({ itens, filtro }) {\n  const visiveis = itens.filter((i) => i.nome.includes(filtro));\n  return <ul>{visiveis.map((i) => <Linha key={i.id} item={i} />)}</ul>;\n}\n\n// O compilador gera o equivalente memorizado,\n// sem você escrever useMemo nem useCallback",
                },
                {
                    type: "code",
                    value: 'npm install --save-dev babel-plugin-react-compiler\n\n// vite.config.ts\nexport default defineConfig({\n  plugins: [\n    react({\n      babel: { plugins: [["babel-plugin-react-compiler", {}]] },\n    }),\n  ],\n});',
                },
                {
                    type: "text",
                    value: "## O que ele exige\n\nO compilador só consegue otimizar código que segue as **regras do React**: componentes puros, sem alterar props ou estado durante a renderização, sem efeito colateral no corpo do componente.\n\nQuando ele encontra algo que quebra as regras, ele **desiste daquele componente** em vez de gerar código errado. O plugin de ESLint do compilador aponta esses casos, e é a melhor forma de preparar um projeto.\n\n## O que muda no dia a dia\n\nEm um projeto que segue as regras, dá para remover boa parte das memorizações manuais. O código volta a ser o que a lógica pede, e a otimização deixa de ser decisão de quem escreve.",
                },
            ],
            questions: [
                {
                    statement: "O que o React Compiler faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Insere a memorização automaticamente no build", isCorrect: true },
                        { text: "Compila o JSX para JavaScript mais rápido", isCorrect: false },
                        { text: "Remove os componentes que nunca são usados", isCorrect: false },
                        {
                            text: "Converte os componentes de classe em componentes função",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o compilador exige do código?",
                    difficulty: "medio",
                    options: [
                        { text: "Que ele siga as regras do React", isCorrect: true },
                        { text: "Que ele esteja escrito em TypeScript", isCorrect: false },
                        { text: "Que todos os componentes usem memo", isCorrect: false },
                        { text: "Que não haja efeitos na aplicação", isCorrect: false },
                    ],
                },
                {
                    statement: "O que ele faz ao encontrar código que quebra as regras?",
                    difficulty: "dificil",
                    options: [
                        { text: "Desiste de otimizar aquele componente", isCorrect: true },
                        { text: "Interrompe o build com um erro descritivo", isCorrect: false },
                        { text: "Otimiza mesmo assim, com o risco de erro", isCorrect: false },
                        { text: "Reescreve o componente para seguir as regras", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual ferramenta ajuda a preparar um projeto para o compilador?",
                    difficulty: "medio",
                    options: [
                        { text: "O plugin de ESLint do compilador", isCorrect: true },
                        { text: "O perfilador do React DevTools", isCorrect: false },
                        { text: "O StrictMode no ambiente de desenvolvimento", isCorrect: false },
                        { text: "O modo estrito do TypeScript no projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que muda no código com o compilador ligado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dá para remover boa parte da memorização manual",
                            isCorrect: true,
                        },
                        { text: "Os componentes deixam de precisar de props", isCorrect: false },
                        { text: "Os efeitos passam a rodar em outra ordem", isCorrect: false },
                        {
                            text: "O estado passa a ser compartilhado entre eles por padrão",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Activity e prioridades",
            blocks: [
                {
                    type: "text",
                    value: "# Esconder sem descartar\n\nEsconder uma parte da tela com `display: none` mantém tudo montado, gastando recursos. Desmontar com uma condição perde o estado, e voltar exige remontar e buscar tudo de novo.\n\nO componente **`<Activity>`**, do React 19.2, oferece o meio-termo: em modo `hidden`, ele esconde os filhos, **desmonta os efeitos** e adia as atualizações, mas **preserva o estado**.",
                },
                {
                    type: "code",
                    value: '<Activity mode={abaAtiva === "perfil" ? "visible" : "hidden"}>\n  <Perfil />\n</Activity>\n\n<Activity mode={abaAtiva === "pedidos" ? "visible" : "hidden"}>\n  <Pedidos />\n</Activity>',
                },
                {
                    type: "table",
                    value: '[["Abordagem", "Estado", "Efeitos", "Custo ao voltar"], ["display none", "preservado", "ativos", "nenhum"], ["desmontar", "perdido", "desmontados", "remontar tudo"], ["Activity hidden", "preservado", "desmontados", "baixo"]]',
                },
                {
                    type: "text",
                    value: "O caso clássico é a navegação por abas: o formulário meio preenchido de uma aba continua lá quando a pessoa volta, e enquanto isso ele não mantém conexões nem temporizadores rodando.\n\n## Prioridades\n\nO `useTransition` marca uma atualização como **não urgente**. O React então prioriza o que é urgente, como o texto aparecendo enquanto se digita, e faz o resto sem travar a interface.",
                },
                {
                    type: "code",
                    value: "const [pendente, iniciarTransicao] = useTransition();\n\nfunction aoDigitar(texto: string) {\n  setTexto(texto);          // urgente: o campo responde na hora\n  iniciarTransicao(() => {\n    setFiltro(texto);       // não urgente: a lista pesada atualiza depois\n  });\n}",
                },
            ],
            questions: [
                {
                    statement: "O que `<Activity mode='hidden'>` preserva?",
                    difficulty: "medio",
                    options: [
                        { text: "O estado dos componentes escondidos", isCorrect: true },
                        {
                            text: "Os efeitos, que continuam ativos em segundo plano",
                            isCorrect: false,
                        },
                        { text: "A posição de rolagem da página inteira", isCorrect: false },
                        { text: "As requisições que estavam em andamento", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com os efeitos em modo hidden?",
                    difficulty: "medio",
                    options: [
                        { text: "São desmontados", isCorrect: true },
                        {
                            text: "Continuam rodando normalmente em segundo plano",
                            isCorrect: false,
                        },
                        { text: "São pausados e retomados ao voltar a aparecer", isCorrect: false },
                        { text: "Rodam com prioridade mais baixa que o normal", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o problema de esconder com `display: none`?",
                    difficulty: "medio",
                    options: [
                        { text: "Tudo continua montado gastando recursos", isCorrect: true },
                        { text: "O estado dos componentes acaba se perdendo", isCorrect: false },
                        {
                            text: "Os componentes precisam ser remontados ao voltar",
                            isCorrect: false,
                        },
                        { text: "O navegador continua exibindo os elementos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `useTransition` marca?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma atualização como não urgente", isCorrect: true },
                        { text: "Uma atualização que deve rodar primeiro", isCorrect: false },
                        { text: "Um componente que não deve ser renderizado", isCorrect: false },
                        { text: "Um efeito que roda fora da renderização", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o caso clássico de uso do `<Activity>`?",
                    difficulty: "medio",
                    options: [
                        { text: "Navegação por abas com formulário preenchido", isCorrect: true },
                        { text: "Listas com milhares de itens sendo exibidas", isCorrect: false },
                        { text: "Componentes que fazem requisições ao servidor", isCorrect: false },
                        { text: "Animações de entrada e saída de elementos", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Code splitting e listas grandes",
            blocks: [
                {
                    type: "text",
                    value: "# Carregar só o necessário\n\nUm aplicativo grande em um arquivo único faz a primeira tela esperar por código de páginas que talvez nunca sejam abertas. O `lazy` divide o build e carrega cada parte quando ela é pedida.",
                },
                {
                    type: "code",
                    value: 'import { lazy, Suspense } from "react";\n\nconst Relatorios = lazy(() => import("./Relatorios"));\nconst Editor = lazy(() => import("./Editor"));\n\n<Suspense fallback={<Carregando />}>\n  {aba === "relatorios" && <Relatorios />}\n  {aba === "editor" && <Editor />}\n</Suspense>',
                },
                {
                    type: "text",
                    value: "O corte natural é por **rota**: cada página vira um pedaço. Componentes pesados e pouco usados, como um editor de texto rico ou uma biblioteca de gráficos, também valem o corte.\n\nDividir demais tem custo próprio: cada pedaço é uma requisição, e dezenas de arquivos pequenos podem ser piores que um médio.",
                },
                {
                    type: "text",
                    value: "## Listas grandes\n\nRenderizar dez mil linhas cria dez mil nós no DOM, e o navegador engasga. A **virtualização** renderiza só o que está visível, mais uma pequena margem, e recicla os elementos conforme a rolagem.",
                },
                {
                    type: "table",
                    value: '[["Itens", "Abordagem"], ["até algumas centenas", "renderizar tudo"], ["milhares", "virtualizar"], ["muitos e vindos do servidor", "paginar ou rolagem infinita"]]',
                },
                {
                    type: "text",
                    value: "Antes de virtualizar, vale checar o mais simples: a pessoa realmente precisa ver dez mil linhas de uma vez? Paginação e busca costumam resolver melhor, e são mais fáceis de manter.",
                },
            ],
            questions: [
                {
                    statement: "O que o `lazy` permite?",
                    difficulty: "medio",
                    options: [
                        { text: "Carregar um componente só quando ele é pedido", isCorrect: true },
                        {
                            text: "Adiar a renderização de um componente muito pesado",
                            isCorrect: false,
                        },
                        { text: "Executar o componente em segundo plano", isCorrect: false },
                        { text: "Guardar o componente em cache no navegador", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o corte mais natural para dividir o código?",
                    difficulty: "medio",
                    options: [
                        { text: "Por rota, uma página por pedaço", isCorrect: true },
                        { text: "Por componente, um arquivo para cada um", isCorrect: false },
                        { text: "Por biblioteca usada em cada tela", isCorrect: false },
                        { text: "Por tamanho, dividindo em partes iguais", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o custo de dividir demais?",
                    difficulty: "dificil",
                    options: [
                        { text: "Cada pedaço vira uma requisição a mais", isCorrect: true },
                        { text: "O build passa a demorar bem mais para rodar", isCorrect: false },
                        { text: "Os componentes perdem o estado ao carregar", isCorrect: false },
                        { text: "O navegador guarda menos coisas em cache", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a virtualização faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Renderiza só o que está visível na tela", isCorrect: true },
                        { text: "Carrega os itens da lista em segundo plano", isCorrect: false },
                        { text: "Reduz o tamanho de cada item renderizado", isCorrect: false },
                        {
                            text: "Guarda a lista inteira na memória do navegador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que checar antes de virtualizar uma lista?",
                    difficulty: "dificil",
                    options: [
                        { text: "Se a pessoa precisa mesmo ver tudo de uma vez", isCorrect: true },
                        { text: "Se a lista cabe na memória do navegador", isCorrect: false },
                        { text: "Se os itens têm chave estável definida", isCorrect: false },
                        {
                            text: "Se o componente de cada linha já está memorizado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Do projeto ao ar",
    aulas: [
        {
            titulo: "React com TypeScript",
            blocks: [
                {
                    type: "text",
                    value: "# Tipando componentes\n\nA forma mais direta é tipar as props e deixar o retorno inferido. Não é preciso anotar o tipo do componente.",
                },
                {
                    type: "code",
                    value: "type Props = {\n  titulo: string;\n  itens: Produto[];\n  aoSelecionar: (p: Produto) => void;\n  children?: React.ReactNode;\n};\n\nfunction Lista({ titulo, itens, aoSelecionar, children }: Props) {\n  return <div>{children}</div>;\n}",
                },
                {
                    type: "table",
                    value: '[["Tipo", "Para que serve"], ["React.ReactNode", "qualquer coisa renderizável"], ["React.ReactElement", "um elemento JSX"], ["React.ComponentProps<\'button\'>", "as props de uma tag"], ["React.FormEvent", "o evento de um formulário"], ["React.Ref<T>", "uma referência a um elemento"]]',
                },
                {
                    type: "text",
                    value: "## Herdando props de um elemento\n\nO padrão que evita listar dezenas de props em um componente de botão: herdar as props do elemento nativo e acrescentar as suas.",
                },
                {
                    type: "code",
                    value: 'type BotaoProps = React.ComponentProps<"button"> & {\n  variante?: "primario" | "secundario";\n};\n\nfunction Botao({ variante = "primario", ...resto }: BotaoProps) {\n  return <button className={`btn btn--${variante}`} {...resto} />;\n}\n\n// Agora aceita onClick, disabled, type e tudo mais\n<Botao variante="secundario" disabled onClick={f}>Cancelar</Botao>',
                },
                {
                    type: "text",
                    value: "## O useState com tipo\n\nA inferência resolve quase sempre. Anotar só é necessário quando o valor inicial não representa todos os estados possíveis, como um `null` que depois vira objeto.",
                },
                {
                    type: "code",
                    value: 'const [texto, setTexto] = useState("");            // string, inferido\nconst [user, setUser] = useState<Usuario | null>(null);   // precisa anotar',
                },
            ],
            questions: [
                {
                    statement: "O que costuma bastar para tipar um componente?",
                    difficulty: "medio",
                    options: [
                        { text: "Tipar as props e deixar o retorno inferido", isCorrect: true },
                        { text: "Anotar o componente com React.FC e as props", isCorrect: false },
                        { text: "Declarar uma interface para o retorno também", isCorrect: false },
                        { text: "Tipar cada elemento JSX devolvido por ele", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual tipo representa qualquer coisa renderizável?",
                    difficulty: "medio",
                    options: [
                        { text: "React.ReactNode", isCorrect: true },
                        { text: "React.ReactElement, mais específico", isCorrect: false },
                        { text: "JSX.Element, com o elemento devolvido", isCorrect: false },
                        { text: "React.Component, a classe base do React", isCorrect: false },
                    ],
                },
                {
                    statement: "Como herdar as props de um elemento nativo?",
                    difficulty: "medio",
                    options: [
                        { text: "Com React.ComponentProps do elemento", isCorrect: true },
                        { text: "Estendendo a interface HTMLElement do DOM", isCorrect: false },
                        { text: "Declarando cada prop nativa manualmente", isCorrect: false },
                        { text: "Usando o operador de espalhamento nas props", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando é preciso anotar o tipo do `useState`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Quando o inicial não cobre todos os estados", isCorrect: true },
                        { text: "Sempre, o useState não infere sozinho", isCorrect: false },
                        { text: "Quando o estado é usado em mais de um lugar", isCorrect: false },
                        { text: "Quando o valor inicial é uma string vazia", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `...resto` faz nas props de um botão?",
                    difficulty: "medio",
                    options: [
                        { text: "Repassa as demais props ao elemento nativo", isCorrect: true },
                        { text: "Ignora as props que não foram declaradas", isCorrect: false },
                        { text: "Cria um objeto com as props obrigatórias", isCorrect: false },
                        {
                            text: "Valida todas as props recebidas pelo componente",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Roteamento",
            blocks: [
                {
                    type: "text",
                    value: "# Várias telas em uma aplicação\n\nO React não traz roteamento: ele renderiza componentes. Uma biblioteca de rotas lê a URL e decide o que mostrar, mantendo o histórico do navegador funcionando.\n\nO **React Router** é a opção mais usada em aplicações puramente cliente.",
                },
                {
                    type: "code",
                    value: 'const router = createBrowserRouter([\n  {\n    path: "/",\n    element: <Layout />,\n    children: [\n      { index: true, element: <Home /> },\n      { path: "produtos", element: <Produtos /> },\n      { path: "produtos/:id", element: <Produto /> },\n      { path: "*", element: <NaoEncontrado /> },\n    ],\n  },\n]);\n\n// Lendo o parâmetro na tela\nconst { id } = useParams();',
                },
                {
                    type: "text",
                    value: "## Rotas aninhadas\n\nO `Layout` acima aparece em todas as páginas filhas, com um `<Outlet />` marcando onde a rota atual entra. É o mesmo raciocínio de composição do módulo 4, aplicado à navegação.\n\n## Links, não âncoras\n\nUsar `<a href>` recarrega a página inteira e perde todo o estado. O componente `<Link>` da biblioteca troca a tela sem recarregar.",
                },
                {
                    type: "code",
                    value: '// Errado: recarrega tudo\n<a href="/produtos">Produtos</a>\n\n// Certo: navegação no cliente\n<Link to="/produtos">Produtos</Link>\n\n// Navegando por código\nconst navegar = useNavigate();\nnavegar(`/produtos/${id}`);',
                },
                {
                    type: "text",
                    value: "## Estado na URL\n\nFiltro, ordenação e página atual pertencem à URL, não ao estado do componente. Assim o link pode ser compartilhado, o botão voltar funciona e recarregar a página não perde o contexto.",
                },
            ],
            questions: [
                {
                    statement: "O React traz roteamento embutido?",
                    difficulty: "facil",
                    options: [
                        { text: "Não, é preciso uma biblioteca", isCorrect: true },
                        { text: "Sim, pelo componente Router do pacote react", isCorrect: false },
                        { text: "Sim, desde a versão 19 do framework", isCorrect: false },
                        { text: "Sim, mas apenas em aplicações de servidor", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao usar `<a href>` em vez de `<Link>`?",
                    difficulty: "medio",
                    options: [
                        { text: "A página recarrega e o estado se perde", isCorrect: true },
                        { text: "A navegação funciona igual, sem diferença", isCorrect: false },
                        {
                            text: "O roteador intercepta o clique automaticamente",
                            isCorrect: false,
                        },
                        { text: "O histórico do navegador deixa de registrar", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `<Outlet />` marca em um layout?",
                    difficulty: "medio",
                    options: [
                        { text: "Onde a rota filha atual é renderizada", isCorrect: true },
                        { text: "Onde os links de navegação vão aparecer", isCorrect: false },
                        { text: "O ponto de saída da aplicação para outra rota", isCorrect: false },
                        { text: "A área que será atualizada sem recarregar", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde filtro e ordenação devem morar?",
                    difficulty: "dificil",
                    options: [
                        { text: "Na URL, para poder compartilhar e voltar", isCorrect: true },
                        { text: "No estado do componente que exibe a lista", isCorrect: false },
                        { text: "Em um contexto compartilhado pela aplicação", isCorrect: false },
                        { text: "No armazenamento local do navegador", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se navega por código?",
                    difficulty: "medio",
                    options: [
                        { text: "Com a função devolvida por useNavigate", isCorrect: true },
                        { text: "Alterando o endereço com window.location", isCorrect: false },
                        { text: "Renderizando um Link e clicando nele", isCorrect: false },
                        { text: "Chamando o método push do componente Router", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Testes com Testing Library",
            blocks: [
                {
                    type: "text",
                    value: "# Testar o que a pessoa faz\n\nA **Testing Library** parte de um princípio: o teste deve interagir com a tela como um usuário interagiria. Ela desencoraja acessar estado interno ou implementação, porque isso quebra o teste a cada refatoração sem que nada tenha parado de funcionar.",
                },
                {
                    type: "code",
                    value: 'import { render, screen } from "@testing-library/react";\nimport userEvent from "@testing-library/user-event";\n\ntest("adiciona um item à lista", async () => {\n  const usuario = userEvent.setup();\n  render(<ListaDeTarefas />);\n\n  await usuario.type(screen.getByLabelText("Nova tarefa"), "Comprar pão");\n  await usuario.click(screen.getByRole("button", { name: "Adicionar" }));\n\n  expect(screen.getByText("Comprar pão")).toBeInTheDocument();\n});',
                },
                {
                    type: "text",
                    value: "## A ordem das consultas\n\nA biblioteca recomenda uma ordem de preferência, e ela não é arbitrária: quanto mais alto na lista, mais o teste se parece com o uso real e mais ele cobre acessibilidade de graça.",
                },
                {
                    type: "table",
                    value: '[["Preferência", "Consulta", "Por quê"], ["1", "getByRole", "é como leitores de tela navegam"], ["2", "getByLabelText", "é como se acha um campo"], ["3", "getByText", "é o que se lê na tela"], ["última", "getByTestId", "não reflete uso real"]]',
                },
                {
                    type: "text",
                    value: "## get, query e find\n\nTrês prefixos para três situações: `getBy` falha se não achar, `queryBy` devolve `null` e serve para afirmar ausência, e `findBy` espera o elemento aparecer, para o que é assíncrono.",
                },
                {
                    type: "code",
                    value: 'expect(screen.queryByText("Erro")).not.toBeInTheDocument();\nexpect(await screen.findByText("Salvo")).toBeInTheDocument();',
                },
            ],
            questions: [
                {
                    statement: "Qual o princípio da Testing Library?",
                    difficulty: "medio",
                    options: [
                        { text: "Interagir com a tela como um usuário faria", isCorrect: true },
                        { text: "Verificar o estado interno de cada componente", isCorrect: false },
                        {
                            text: "Cobrir todas as linhas de código do componente",
                            isCorrect: false,
                        },
                        { text: "Executar os testes sem renderizar a interface", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual consulta é a primeira na ordem de preferência?",
                    difficulty: "medio",
                    options: [
                        { text: "getByRole", isCorrect: true },
                        { text: "getByText, pelo que aparece na tela", isCorrect: false },
                        { text: "getByTestId, com um atributo próprio", isCorrect: false },
                        { text: "getByLabelText, pelo rótulo do campo", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `getByRole` é preferida?",
                    difficulty: "dificil",
                    options: [
                        { text: "É como leitores de tela navegam a página", isCorrect: true },
                        { text: "Ela executa a busca bem mais rápido", isCorrect: false },
                        { text: "Ela funciona mesmo sem renderizar a tela", isCorrect: false },
                        { text: "Ela é a única que aceita expressões regulares", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual consulta usar para afirmar que algo não está na tela?",
                    difficulty: "medio",
                    options: [
                        { text: "queryBy, que devolve null", isCorrect: true },
                        { text: "getBy, que falha quando não encontra", isCorrect: false },
                        { text: "findBy, que espera o elemento aparecer", isCorrect: false },
                        { text: "Qualquer uma, o resultado é o mesmo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual consulta usar para algo que aparece depois?",
                    difficulty: "medio",
                    options: [
                        { text: "findBy, que espera pelo elemento", isCorrect: true },
                        { text: "getBy, repetindo a busca em um laço", isCorrect: false },
                        { text: "queryBy, verificando se já apareceu", isCorrect: false },
                        { text: "getAllBy, pegando todos os elementos", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Server Components e frameworks",
            blocks: [
                {
                    type: "text",
                    value: "# Componentes que rodam no servidor\n\nOs **React Server Components** rodam **apenas no servidor**. Eles podem consultar o banco direto, ler arquivos e usar segredos, e o JavaScript deles **nunca é enviado ao navegador**.\n\nÉ uma mudança grande no modelo: parte da árvore nunca chega ao cliente, e o pacote que a pessoa baixa fica menor.",
                },
                {
                    type: "code",
                    value: "// Componente de servidor: sem 'use client'\nasync function ListaProdutos() {\n  const produtos = await db.produto.findMany();   // direto no banco\n  return <ul>{produtos.map((p) => <li key={p.id}>{p.nome}</li>)}</ul>;\n}\n\n// Componente de cliente: precisa marcar\n\"use client\";\n\nfunction Contador() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => setN(n + 1)}>{n}</button>;\n}",
                },
                {
                    type: "table",
                    value: '[["", "Servidor", "Cliente"], ["Estado e efeitos", "não", "sim"], ["Eventos de clique", "não", "sim"], ["Acesso a banco e segredos", "sim", "não"], ["JavaScript enviado", "nenhum", "sim"]]',
                },
                {
                    type: "text",
                    value: "## Onde isso existe\n\nServer Components exigem um **framework** que cuide do build e do transporte: Next.js e React Router em modo framework são os caminhos mais comuns. Em uma aplicação criada só com Vite, eles não estão disponíveis.\n\n## Quando vale\n\nPara site com muito conteúdo e SEO importante, o ganho é grande. Para painel interno atrás de login, o modelo cliente puro continua mais simples e é uma escolha legítima.",
                },
            ],
            questions: [
                {
                    statement: "Onde um Server Component roda?",
                    difficulty: "facil",
                    options: [
                        { text: "Apenas no servidor", isCorrect: true },
                        { text: "No servidor e depois de novo no cliente", isCorrect: false },
                        { text: "No cliente, com os dados vindos do servidor", isCorrect: false },
                        { text: "Nos dois, conforme a necessidade da tela", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um Server Component não pode ter?",
                    difficulty: "medio",
                    options: [
                        { text: "Estado, efeitos e eventos de clique", isCorrect: true },
                        { text: "Acesso ao banco de dados da aplicação", isCorrect: false },
                        { text: "Componentes filhos dentro do seu JSX", isCorrect: false },
                        { text: "Chamadas assíncronas com await no corpo", isCorrect: false },
                    ],
                },
                {
                    statement: "Quanto JavaScript de um Server Component vai ao navegador?",
                    difficulty: "dificil",
                    options: [
                        { text: "Nenhum", isCorrect: true },
                        { text: "Apenas a parte que trata os eventos da tela", isCorrect: false },
                        { text: "Todo ele, como qualquer outro componente", isCorrect: false },
                        { text: "Só o necessário para hidratar a página", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `'use client'` marca?",
                    difficulty: "medio",
                    options: [
                        { text: "Que o componente roda no navegador", isCorrect: true },
                        { text: "Que o componente usa dados do cliente", isCorrect: false },
                        { text: "Que o componente é renderizado sob demanda", isCorrect: false },
                        { text: "Que o componente não deve ser memorizado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é preciso para usar Server Components?",
                    difficulty: "medio",
                    options: [
                        { text: "Um framework que cuide do build e transporte", isCorrect: true },
                        {
                            text: "Apenas ter a versão 19 do React instalada no projeto",
                            isCorrect: false,
                        },
                        { text: "Um servidor Node rodando a aplicação", isCorrect: false },
                        { text: "O React Compiler ligado no projeto", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Build, deploy e o projeto final",
            blocks: [
                {
                    type: "text",
                    value: "# Colocando no ar\n\nO build de uma aplicação React em Vite gera arquivos estáticos: HTML, JavaScript e CSS. Qualquer hospedagem de conteúdo estático serve, e o custo costuma ser próximo de zero.",
                },
                {
                    type: "code",
                    value: "npm run build\n# gera a pasta dist/\n\nnpm run preview\n# serve o build local, para conferir antes de publicar",
                },
                {
                    type: "text",
                    value: "## O detalhe que quebra em produção\n\nEm uma aplicação de página única, o servidor precisa devolver o `index.html` para **qualquer** rota. Sem isso, abrir `/produtos/42` direto no navegador devolve 404: o servidor procura um arquivo que não existe.\n\nCada hospedagem tem sua forma de configurar esse redirecionamento, e é o problema mais comum do primeiro deploy.",
                },
                {
                    type: "text",
                    value: "## Variáveis de ambiente\n\nNo Vite, apenas variáveis com o prefixo `VITE_` chegam ao código. E vale lembrar do óbvio que às vezes se esquece: **tudo que vai para o navegador é público**. Chave de API secreta não entra em aplicação cliente, em hipótese alguma.",
                },
                {
                    type: "code",
                    value: "# .env\nVITE_API_URL=https://api.exemplo.com\n\n// No código\nconst url = import.meta.env.VITE_API_URL;",
                },
                {
                    type: "text",
                    value: "## O projeto final\n\nPara fechar a trilha, construa um **gerenciador de tarefas** que exercite cada módulo:\n\n1. Componentes com props tipadas e listas com chave estável\n2. Estado com `useState` e `useReducer` para as transições da lista\n3. Um hook próprio guardando as tarefas no armazenamento local\n4. Context para o tema, com o alternador em qualquer profundidade\n5. Um formulário com Action e `useOptimistic` ao criar\n6. Rotas com filtro e ordenação na URL\n7. Testes com Testing Library cobrindo criar, concluir e filtrar\n\nCada item corresponde a um módulo desta trilha.",
                },
            ],
            questions: [
                {
                    statement: "O que o build de uma aplicação React em Vite gera?",
                    difficulty: "facil",
                    options: [
                        { text: "Arquivos estáticos de HTML, JS e CSS", isCorrect: true },
                        { text: "Um servidor Node pronto para ser executado", isCorrect: false },
                        { text: "Um contêiner com a aplicação já configurada", isCorrect: false },
                        {
                            text: "Um pacote instalável pelo gerenciador do sistema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que abrir uma rota direto no navegador pode dar 404?",
                    difficulty: "dificil",
                    options: [
                        { text: "O servidor procura um arquivo que não existe", isCorrect: true },
                        {
                            text: "O roteador só funciona depois do primeiro clique",
                            isCorrect: false,
                        },
                        { text: "A rota precisa ser cadastrada na hospedagem", isCorrect: false },
                        { text: "O build não gera as páginas de cada rota", isCorrect: false },
                    ],
                },
                {
                    statement: "Como resolver esse problema de rotas?",
                    difficulty: "medio",
                    options: [
                        { text: "Devolver o index.html para qualquer rota", isCorrect: true },
                        { text: "Gerar um arquivo HTML para cada rota no build", isCorrect: false },
                        { text: "Usar apenas rotas com a cerquilha na URL", isCorrect: false },
                        { text: "Configurar o roteador para o modo de servidor", isCorrect: false },
                    ],
                },
                {
                    statement: "Quais variáveis chegam ao código em um projeto Vite?",
                    difficulty: "medio",
                    options: [
                        { text: "As que começam com VITE_", isCorrect: true },
                        { text: "Todas as declaradas no arquivo .env", isCorrect: false },
                        { text: "Apenas as declaradas no build de produção", isCorrect: false },
                        { text: "As que forem importadas explicitamente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que nunca deve ir para uma aplicação cliente?",
                    difficulty: "medio",
                    options: [
                        { text: "Chave de API secreta", isCorrect: true },
                        { text: "O endereço da API que será consumida", isCorrect: false },
                        { text: "O nome do ambiente em que ela roda", isCorrect: false },
                        { text: "A versão da aplicação que foi publicada", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

export const MODULOS: Modulo[] = [
    MODULO_1,
    MODULO_2,
    MODULO_3,
    MODULO_4,
    MODULO_5,
    MODULO_6,
    MODULO_7,
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: LEVEL,
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + NOME);
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log("Trilha já tem aulas, nada a fazer: " + NOME);
            return;
        }
        await db
            .update(trails)
            .set({ workloadHours: CARGA_HORARIA, description: DESCRICAO, trailLevel: LEVEL })
            .where(eq(trails.id, trilha.id));
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
        "Seed concluído: " +
            MODULOS.length +
            " módulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questões.",
    );
}

// Só semeia quando executado direto. Importado, expõe MODULOS/NOME sem rodar nada.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
