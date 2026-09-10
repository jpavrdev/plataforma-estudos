import type { TopicoDeEntrevista } from "../../seed-entrevista.ts";

/**
 * Perguntas de entrevista de React.
 *
 * O nível segue o que a pergunta cobra, e não o assunto. Renderização aparece nos
 * quatro níveis: em estágio é o que dispara uma nova renderização, em sênior é como
 * o time acompanha desempenho sem transformar cada tela numa discussão de memo.
 */
export const react: TopicoDeEntrevista = {
    slug: "react",
    nome: "React",
    position: 7,
    perguntas: {
        estagio: [
            {
                frente: "Que problema o React resolve que JavaScript puro resolvia mal?",
                verso: "Manter a tela em sincronia com o estado. Sem ele, cada mudança de dado vira uma sequência de instruções manipulando o DOM na mão, e é onde a interface passa a mostrar coisas contraditórias. Com React você descreve o resultado e ele calcula a diferença.",
            },
            {
                frente: "O que é um componente?",
                verso: "Uma função que recebe dados e devolve a descrição de um pedaço da interface. Ele encapsula marcação, estilo e comportamento daquele trecho, e pode ser usado várias vezes com dados diferentes. É a unidade de reaproveitamento e de leitura do código.",
            },
            {
                frente: "O que é JSX?",
                verso: "Uma sintaxe que parece HTML e vira chamada de função na compilação. Não é template com linguagem própria: é JavaScript, então dentro das chaves vale qualquer expressão. É isso que permite montar a interface com map, ternário e variável sem sintaxe especial.",
            },
            {
                frente: "Por que o JSX usa className em vez de class?",
                verso: "Porque JSX vira JavaScript, e class é palavra reservada da linguagem. O mesmo vale para htmlFor no lugar de for. São detalhes de tradução para as propriedades do DOM, e não uma escolha de estilo do React.",
            },
            {
                frente: "Qual a diferença entre props e estado?",
                verso: "Props vêm de fora e o componente não altera: são a entrada dele. Estado é interno, pertence àquela instância e muda ao longo do tempo. Quando um dado precisa mudar e ser visto por vários componentes, ele sobe para o ancestral comum e desce como prop.",
            },
            {
                frente: "Por que não se altera o estado diretamente?",
                verso: "Porque o React não observa o objeto: ele compara a referência para saber se algo mudou. Alterar o array no lugar mantém a mesma referência, e a tela não atualiza. Por isso se cria um novo objeto ou array com a mudança aplicada.",
            },
            {
                frente: "O que o useState devolve?",
                verso: "Um par: o valor atual e a função que agenda a atualização. Chamar a função não muda a variável daquela renderização, e sim pede uma nova com o valor novo. É por isso que ler o estado logo depois de atualizar mostra o valor antigo.",
            },
            {
                frente: "O que faz um componente renderizar de novo?",
                verso: "Uma mudança de estado dele, uma mudança em um contexto que ele consome, ou o pai renderizar de novo. Não é o DOM que muda a cada vez: o React recalcula a descrição e aplica ao DOM só a diferença.",
            },
            {
                frente: "Como você atualiza o estado a partir do valor anterior?",
                verso: "Passando uma função para o atualizador, que recebe o valor mais recente. É o jeito certo quando a atualização depende do anterior, como um contador, porque várias chamadas seguidas usando a variável capturada acabam gravando o mesmo valor.",
            },
            {
                frente: "Como você guarda um objeto no estado sem perder os outros campos?",
                verso: "Criando um objeto novo, espalhando o anterior e sobrescrevendo o campo que mudou. Guardar o objeto alterado no lugar não dispara renderização, e substituir só com o campo novo apaga o resto. Em estado aninhado isso fica trabalhoso, o que costuma indicar estado mal dividido.",
            },
            {
                frente: "Como você adiciona um item a uma lista guardada no estado?",
                verso: "Criando um array novo com o conteúdo antigo mais o item, em vez de usar push. Push altera o mesmo array e o React não vê diferença. O mesmo vale para remover, que se faz com filter, e para trocar um item, que se faz com map.",
            },
            {
                frente: "Por que uma lista renderizada precisa de key?",
                verso: "Para o React saber qual elemento é qual entre duas renderizações, e assim mover em vez de recriar. Sem isso ele compara por posição, o que faz o estado interno de um item aparecer no lugar errado quando a lista muda de ordem.",
            },
            {
                frente: "Por que usar o índice como key é arriscado?",
                verso: "Porque o índice muda quando a lista é reordenada, filtrada ou tem item removido do meio. O React entende que o item continua o mesmo e mantém estado e foco no lugar errado. Com lista fixa e só de leitura, o índice é aceitável.",
            },
            {
                frente: "Como você renderiza algo condicionalmente?",
                verso: "Com um ternário quando há dois caminhos, ou com o e comercial duplo quando é mostrar ou não mostrar. Também dá para sair antes com um return. O cuidado com o e comercial é o valor zero, que não é falso o bastante para sumir e acaba aparecendo na tela.",
            },
            {
                frente: "Como você transforma uma lista de dados em elementos?",
                verso: "Com map, devolvendo um elemento por item e passando uma key estável, normalmente o identificador vindo do servidor. Filtrar antes evita renderizar o que não deve aparecer. Laço com push e depois render funciona, mas custa mais para ler.",
            },
            {
                frente: "O que a prop children permite?",
                verso: "Receber o conteúdo escrito entre a abertura e o fechamento do componente. É o que faz um cartão, um modal ou um layout aceitarem qualquer conteúdo dentro sem saber o que é. É a forma mais simples de composição no React.",
            },
            {
                frente: "Como um componente filho avisa o pai que algo aconteceu?",
                verso: "O pai passa uma função como prop e o filho a chama com o dado. O estado continua no pai, que é quem decide o que fazer. Esse é o fluxo de dados do React: dado desce por prop, evento sobe por função.",
            },
            {
                frente: "O que é um componente de formulário controlado?",
                verso: "Aquele em que o valor do campo vem do estado e toda digitação passa por um manipulador que atualiza esse estado. A vantagem é que o React é a fonte da verdade, o que facilita validar e formatar enquanto se digita.",
            },
            {
                frente: "Quando um campo não controlado faz sentido?",
                verso: "Quando você só precisa do valor no envio e não quer renderizar a cada tecla, ou ao integrar com código que manipula o DOM direto. Nesse caso o valor é lido por referência. Formulário grande é onde essa escolha começa a aparecer no desempenho.",
            },
            {
                frente: "Como você trata o envio de um formulário?",
                verso: "Num manipulador no elemento de formulário, chamando o método que impede o comportamento padrão para a página não recarregar. Colocar o envio no clique do botão funciona, mas perde o envio pelo Enter, que é o que a maioria dos usuários usa.",
            },
            {
                frente: "Por que o evento que chega no manipulador não é o evento nativo puro?",
                verso: "O React usa um evento sintético, com a mesma interface entre navegadores. Ele delega os ouvintes na raiz em vez de pendurar um por elemento, o que economiza memória. Se precisar do original, ele está acessível por uma propriedade.",
            },
            {
                frente: "O que é um fragmento e por que ele existe?",
                verso: "Um invólucro que agrupa elementos sem criar um nó no DOM. Serve porque um componente precisa devolver uma raiz só. Sem ele, todo agrupamento viraria uma div extra, e isso atrapalha layout com grid e flex, além de sujar a árvore.",
            },
            {
                frente: "Como você aplica estilo a um componente?",
                verso: "Com classe, que é o caminho padrão, seja com CSS comum, módulos ou utilitários. Estilo por objeto no atributo serve para valor dinâmico e pontual, e não substitui folha de estilo: ali não existe pseudoclasse, consulta de mídia nem reaproveitamento.",
            },
            {
                frente: "Como você aplica uma classe condicionalmente?",
                verso: "Montando a string da classe com template ou ternário, ou usando uma função que junta classes ignorando o que for falso. O importante é a classe base ficar separada do modificador, para não virar uma expressão ilegível dentro do JSX.",
            },
            {
                frente: "Quais são as regras dos hooks?",
                verso: "Chamar sempre no topo do componente ou de outro hook, nunca dentro de condição, laço ou função aninhada, e só a partir de componente ou hook próprio. O React associa cada hook pela ordem de chamada, então quebrar a ordem embaralha os estados.",
            },
            {
                frente: "O que acontece se você chamar um hook dentro de um if?",
                verso: "A ordem das chamadas passa a mudar entre renderizações, e o React entrega o estado de um hook para outro. O sintoma é valor aparecendo trocado ou erro dizendo que a quantidade de hooks mudou. A regra do linter existe justamente para pegar isso.",
            },
            {
                frente: "Para que serve o useEffect?",
                verso: "Para sincronizar o componente com algo de fora do React, como assinatura, temporizador ou manipulação direta do DOM. Ele roda depois da renderização. O que pode ser calculado durante a renderização não precisa de efeito nenhum.",
            },
            {
                frente: "Como você limpa o que um efeito criou?",
                verso: "Devolvendo uma função de limpeza, que o React chama antes de rodar o efeito de novo e ao desmontar. É onde se remove ouvinte, cancela temporizador e fecha conexão. Sem ela, cada renderização deixa um resíduo e o comportamento vai duplicando.",
            },
            {
                frente: "Quando um efeito roda de novo?",
                verso: "Sempre que algum valor do array de dependências mudar entre renderizações, comparado por identidade. Sem array, roda em toda renderização. Com array vazio, roda uma vez na montagem, e por isso ele costuma esconder dependência esquecida.",
            },
            {
                frente: "Como você busca dados quando a tela abre?",
                verso: "Num efeito com as dependências certas, guardando carregando, dado e erro no estado, ou usando uma biblioteca de dados que já cuida disso. O ponto que mais escapa é tratar o caso de a resposta chegar depois de o componente sair da tela.",
            },
            {
                frente: "Como você mostra que a tela está carregando?",
                verso: "Com um estado que começa verdadeiro e vira falso no fim da requisição, inclusive quando ela falha. Mostrar um esqueleto do conteúdo costuma ser melhor que um giro, porque evita a tela pular quando o conteúdo chega.",
            },
            {
                frente: "Como você mostra um erro de carregamento na interface?",
                verso: "Guardando o erro no estado e renderizando uma mensagem que diga o que houve e o que fazer, com opção de tentar de novo. Mensagem técnica crua não ajuda o usuário, e tela em branco sem explicação é o pior dos casos.",
            },
            {
                frente: "O que caracteriza uma aplicação de página única?",
                verso: "O navegador carrega a aplicação uma vez e as navegações trocam o conteúdo sem pedir uma página nova ao servidor. Isso deixa a troca de tela instantânea e cobra em carga inicial, em rota que precisa ser resolvida no cliente e em atenção com o endereço da URL.",
            },
            {
                frente: "Como você navega entre telas numa aplicação React?",
                verso: "Com o componente de link da biblioteca de rotas, que troca o endereço sem recarregar a página, ou com a função de navegação programática depois de uma ação. Usar uma âncora comum recarrega tudo e perde o estado da aplicação.",
            },
            {
                frente: "Como você lê um parâmetro da URL?",
                verso: "Com o hook da biblioteca de rotas que expõe os parâmetros do caminho, ou o que expõe a parte de consulta. Vale lembrar que tudo ali é texto e vem do usuário, então precisa ser validado antes de virar identificador numa requisição.",
            },
            {
                frente: "O que é prop drilling?",
                verso: "Passar uma prop por vários níveis só para ela chegar lá embaixo, sem os intermediários usarem. Deixa o código difícil de mexer e acopla componentes que não têm relação. As saídas são composição por children ou contexto, nessa ordem.",
            },
            {
                frente: "Como você reaproveita lógica entre componentes?",
                verso: "Extraindo um hook próprio, que é só uma função que usa outros hooks e devolve o que interessa. É o que substitui os padrões antigos de componente de ordem superior. Reaproveitar interface é outra coisa: para isso existe composição.",
            },
            {
                frente: "Por que o nome de um hook próprio começa com use?",
                verso: "Porque é essa convenção que diz ao React e às ferramentas que aquela função segue as regras dos hooks. Sem o prefixo, o linter não consegue checar dependências nem chamadas condicionais, e o erro só aparece em tempo de execução.",
            },
            {
                frente: "Quando vale criar um componente novo?",
                verso: "Quando um trecho tem nome próprio no domínio, se repete, ou quando o componente atual já não cabe na cabeça. Dividir cedo demais gera indireção sem ganho. O sinal mais confiável é precisar rolar muito para entender o que a função devolve.",
            },
            {
                frente: "O que significa preferir composição a herança no React?",
                verso: "Em vez de criar tipos que estendem outros, você monta comportamento passando componentes por children e por props. Um cartão genérico que recebe cabeçalho e corpo resolve o que herança resolveria, sem hierarquia rígida.",
            },
            {
                frente: "Como você passa várias props de uma vez, e qual o risco?",
                verso: "Espalhando um objeto no JSX. O risco é perder o controle do que está sendo passado: props indesejadas chegam ao DOM e geram aviso, e quem lê não sabe mais o que o componente recebe. Em componente de biblioteca isso é útil; em tela, costuma esconder bagunça.",
            },
            {
                frente: "Como você define um valor padrão para uma prop?",
                verso: "No próprio parâmetro da função, com valor padrão de JavaScript. É mais direto do que a forma antiga com propriedade estática e funciona bem com tipagem. Vale lembrar que o padrão só se aplica quando a prop vem indefinida, e não quando vem nula.",
            },
            {
                frente: "O que acontece se você esquecer o return num componente?",
                verso: "Ele devolve indefinido e o React reclama que um componente precisa devolver algo. O caso que mais confunde é abrir chave depois da seta em vez de parêntese, o que transforma o JSX em corpo de função sem retorno.",
            },
            {
                frente: "O que acontece se você chamar uma função de estado direto no corpo do componente?",
                verso: "Ele renderiza, chama de novo, renderiza outra vez, e entra em laço até o React interromper com erro de profundidade. O manipulador precisa ser passado como referência, e não chamado durante a renderização.",
            },
            {
                frente: "Por que a atualização de estado parece não valer na hora?",
                verso: "Porque a variável daquela renderização não muda: o React agenda a atualização e entrega o valor novo na próxima. Várias atualizações no mesmo evento são agrupadas em uma renderização só, o que evita telas intermediárias.",
            },
            {
                frente: "O que o modo estrito faz em desenvolvimento?",
                verso: "Monta, desmonta e monta de novo cada componente, e roda o efeito duas vezes, para expor efeito sem limpeza e código que não aguenta ser repetido. Só acontece em desenvolvimento. Se algo quebra por causa disso, o problema já existia.",
            },
            {
                frente: "O que é o ponto de entrada de uma aplicação React?",
                verso: "O arquivo que encontra um elemento do HTML e manda o React tomar conta dali para baixo, renderizando o componente raiz. É onde também ficam os provedores globais, como rotas e tema, que precisam envolver a árvore inteira.",
            },
            {
                frente: "O que uma ferramenta como o Vite faz num projeto React?",
                verso: "Serve o projeto em desenvolvimento com atualização rápida ao salvar, entende JSX e TypeScript, e gera o pacote otimizado para produção. Sem ela seria preciso configurar compilador, empacotador e servidor local na mão.",
            },
            {
                frente: "Como você usa uma variável de ambiente no front?",
                verso: "Declarando com o prefixo que a ferramenta exige e lendo pelo objeto que ela expõe. O valor é embutido no pacote na hora do build, então ele não muda em tempo de execução e fica visível para quem abrir o código no navegador.",
            },
            {
                frente: "Por que segredo não pode ficar no código do front?",
                verso: "Porque tudo que vai para o navegador pode ser lido por qualquer usuário, mesmo minificado. Chave de API secreta, senha e token de serviço precisam ficar no servidor, que faz a chamada e devolve só o resultado.",
            },
            {
                frente: "Como você depura um componente que não mostra o que você espera?",
                verso: "Vendo primeiro o que ele recebe e o que ele devolve, com as ferramentas do React inspecionando props e estado na árvore. Depois conferindo se o dado chegou pela rede. Sair espalhando log costuma achar o sintoma, e não o ponto onde o dado se perdeu.",
            },
            {
                frente: "O que as ferramentas de desenvolvedor do React mostram?",
                verso: "A árvore de componentes com props, estado e hooks de cada um, e quem é o pai de quem. Também dá para ver o que renderizou e por quê. É o caminho mais rápido para descobrir se o problema é dado errado ou renderização que não aconteceu.",
            },
            {
                frente: "O que é uma prop booleana e como ela costuma ser escrita?",
                verso: "Uma prop que liga ou desliga comportamento, escrita só com o nome quando é verdadeira. Muitas delas no mesmo componente costumam ser sinal de que faltou uma prop de variante, porque combinações inválidas passam a ser possíveis.",
            },
            {
                frente: "Como você exibe um conteúdo só depois que os dados chegam?",
                verso: "Saindo antes com o estado de carregamento e o de erro, e só então renderizando o conteúdo. Assim o caso feliz fica limpo. Renderizar acessando campo de um objeto que ainda é nulo é a causa mais comum de tela quebrada logo na abertura.",
            },
            {
                frente: "O que acontece quando o pai renderiza de novo?",
                verso: "Os filhos também são chamados de novo por padrão, mesmo com as mesmas props. Isso quase sempre é barato, porque o React só aplica ao DOM o que mudou. Vira problema quando a árvore é grande ou o componente faz trabalho pesado a cada chamada.",
            },
            {
                frente: "Como você organizaria os arquivos de um projeto React pequeno?",
                verso: "Por funcionalidade, com o componente, seus estilos e seus testes próximos, e uma pasta para o que é realmente compartilhado. Separar por tipo técnico espalha uma mudança simples por várias pastas, e isso piora conforme o projeto cresce.",
            },
            {
                frente: "Como você lidaria com um componente que recebe dez props?",
                verso: "Perguntando se ele não está fazendo coisas demais. Muitas vezes dá para agrupar o que anda junto num objeto, ou aceitar conteúdo por children em vez de configurar tudo por prop. Componente com dez props costuma ser dois componentes.",
            },
            {
                frente: "O que muda entre exportação padrão e nomeada?",
                verso: "A padrão pode ser importada com qualquer nome, o que facilita renomear sem querer e atrapalha a busca no projeto. A nomeada exige o nome exato e ajuda ferramentas de refatoração. Muitos times padronizam nomeada justamente por isso.",
            },
            {
                frente: "Como você escreveria um texto que vem do usuário sem risco?",
                verso: "Deixando o React renderizar como texto, que é o padrão e já escapa o conteúdo. O risco aparece ao usar a propriedade que injeta HTML cru, que só deve receber conteúdo sanitizado, e nunca algo digitado por outro usuário.",
            },
            {
                frente: "Como você mostraria uma lista vazia de forma amigável?",
                verso: "Com um estado vazio explícito, dizendo o que aconteceu e qual o próximo passo, em vez de renderizar nada. Lista vazia sem mensagem é lida como erro ou tela quebrada, e é um dos ajustes mais baratos de experiência.",
            },
            {
                frente: "Como você trataria um campo de busca que filtra uma lista?",
                verso: "Guardando o texto no estado e derivando a lista filtrada durante a renderização, sem criar outro estado para o resultado. Guardar o filtrado em estado obriga a sincronizar dois valores, e é onde a lista fica desatualizada.",
            },
            {
                frente: "Qual a diferença entre renderizar e montar?",
                verso: "Montar é a primeira vez que o componente entra na árvore, quando o estado é criado e os efeitos rodam pela primeira vez. Renderizar acontece em toda atualização. Confundir os dois é o que leva a colocar em efeito de montagem coisa que precisava rodar sempre.",
            },
            {
                frente: "O que acontece com o estado quando um componente sai da tela?",
                verso: "Ele é descartado junto com o componente, e volta ao valor inicial se ele reaparecer. Por isso estado que precisa sobreviver à navegação mora acima, na URL ou numa camada de cache, e não dentro do componente que some.",
            },
            {
                frente: "Como você mostraria a mesma informação em dois lugares da tela?",
                verso: "Subindo o dado para o ancestral comum e passando por prop para os dois, para existir uma fonte da verdade só. Duplicar o estado nos dois lados obriga a sincronizar na mão, e uma hora eles divergem.",
            },
            {
                frente: "Para que serve o atributo key fora de listas?",
                verso: "Trocar a key de um componente faz o React tratá-lo como outro e recriar o estado. É a forma mais simples de reiniciar um formulário ao mudar de registro, sem efeito nenhum limpando campo por campo.",
            },
            {
                frente: "Como você trataria um clique que precisa de dois comportamentos?",
                verso: "Escrevendo um manipulador com nome que descreva a intenção e chamando dali as duas coisas, em vez de encadear lógica no JSX. JSX com muita lógica dentro do atributo fica difícil de ler e impossível de testar isoladamente.",
            },
            {
                frente: "O que significa dizer que o React tem fluxo de dados de mão única?",
                verso: "O dado desce do pai para o filho por props, e mudanças sobem por funções. Não existe filho alterando a prop que recebeu. Isso torna previsível descobrir de onde veio um valor, que é o que mais custa em interface grande.",
            },
            {
                frente: "Como você evitaria que um botão seja clicado duas vezes?",
                verso: "Desabilitando enquanto a ação está em andamento, com um estado de envio, e não confiando só no visual. Isso evita a requisição duplicada mais comum. Do lado do servidor a proteção continua necessária, porque o cliente pode repetir de outras formas.",
            },
            {
                frente: "Como você exibiria uma data para o usuário?",
                verso: "Formatando na hora de mostrar, com a API de internacionalização do navegador e o idioma do usuário, e guardando sempre o valor bruto no estado. Formatar cedo e guardar texto formatado é o que impede ordenar e comparar depois.",
            },
            {
                frente: "Como você mostraria um contador de itens selecionados numa lista?",
                verso: "Guardando no estado só o conjunto de selecionados e calculando o total durante a renderização. Manter um estado separado para a contagem cria duas fontes da verdade, e a que esquece de atualizar é sempre a que aparece na tela.",
            },
        ],
        junior: [
            {
                frente: "O que o array de dependências do useEffect realmente controla?",
                verso: "Quais valores o efeito lê de fora e que, ao mudar, exigem sincronizar de novo. Não é um filtro para o efeito rodar menos vezes: omitir dependência não impede a execução, só faz o efeito trabalhar com valor velho. O linter existe para cobrar isso.",
            },
            {
                frente: "O que é uma closure obsoleta dentro de um efeito?",
                verso: "É o efeito ter capturado o valor da renderização em que foi criado e continuar usando ele depois. Aparece em temporizador e ouvinte registrados uma vez só, que enxergam sempre o estado inicial. As saídas são atualizar com função ou incluir a dependência.",
            },
            {
                frente: "Como você sabe se um efeito deveria mesmo existir?",
                verso: "Perguntando com o que ele sincroniza. Se a resposta é apenas outro estado ou uma prop, aquilo é cálculo e pertence à renderização. Efeito é para o que está fora do React: assinatura, temporizador, DOM e rede. Boa parte dos bugs de efeito são efeitos que não precisavam existir.",
            },
            {
                frente: "Quando você derivaria um valor em vez de guardar outro estado?",
                verso: "Sempre que ele puder ser calculado do que já existe, como total de uma lista ou item selecionado a partir do identificador. Estado derivado obriga a sincronizar dois valores, e o que esquece de atualizar é justamente o que aparece na tela.",
            },
            {
                frente: "Como você evitaria estado duplicado numa tela?",
                verso: "Guardando a informação uma vez só, no lugar mais alto que precisa dela, e derivando o resto. Guardar o objeto inteiro e também o identificador dele é a duplicação clássica, e depois de uma atualização os dois divergem.",
            },
            {
                frente: "O que o useMemo faz, e quando ele paga?",
                verso: "Guarda o resultado de um cálculo entre renderizações enquanto as dependências não mudarem. Paga quando o cálculo é realmente caro ou quando o resultado é usado como dependência de outro hook. Em conta simples, o próprio memo custa mais do que economiza.",
            },
            {
                frente: "O que o useCallback resolve?",
                verso: "Mantém a mesma referência de função entre renderizações, o que importa quando ela é dependência de um efeito ou prop de um filho memoizado. Sozinho ele não acelera nada: envolver toda função sem esses casos só adiciona ruído e memória.",
            },
            {
                frente: "Quando envolver um componente com memo ajuda de verdade?",
                verso: "Quando ele renderiza com frequência por causa do pai, recebe as mesmas props e faz trabalho pesado. Se alguma prop é objeto ou função criada a cada renderização, a comparação falha sempre e o memo vira custo puro sem nenhum ganho.",
            },
            {
                frente: "Por que memoizar tudo é uma má ideia?",
                verso: "Cada memo tem custo de comparação e memória, e polui o código com dependências que precisam ser mantidas. Renderização normal do React é barata. Otimização sem medição costuma resolver um problema que não existia e criar um bug de dependência que existe.",
            },
            {
                frente: "O que o useRef guarda?",
                verso: "Um objeto estável entre renderizações com uma propriedade que você pode alterar sem disparar renderização. Serve para referência a elemento do DOM e para valor mutável que a interface não mostra, como identificador de temporizador.",
            },
            {
                frente: "Qual a diferença entre useRef e useState?",
                verso: "Alterar estado renderiza de novo; alterar referência não. Estado é para o que a tela mostra, referência é para o que o componente precisa lembrar sem mostrar. Guardar em referência algo que aparece na interface deixa a tela desatualizada.",
            },
            {
                frente: "Como você colocaria o foco num campo assim que a tela abre?",
                verso: "Ligando uma referência ao elemento e chamando o foco num efeito de montagem. Vale checar se isso é bom para quem usa leitor de tela, porque mover foco sem aviso desorienta. Em modal, focar o primeiro elemento é esperado; numa página inteira, nem sempre.",
            },
            {
                frente: "O que o useReducer resolve que o useState resolve mal?",
                verso: "Estado com várias partes que mudam juntas e transições com regras, como um formulário com passos. A lógica sai dos manipuladores e vira uma função pura fácil de testar. Para um booleano ou um texto, ele só adiciona cerimônia.",
            },
            {
                frente: "Quando você usaria Context?",
                verso: "Para dado realmente global e que muda pouco, como tema, idioma e usuário logado. Ele resolve prop drilling, e não gerenciamento de estado. Estado de servidor e estado que muda a cada tecla dentro de contexto viram renderização em cascata.",
            },
            {
                frente: "Por que um Context pode causar renderização em cascata?",
                verso: "Porque todo componente que consome aquele contexto renderiza quando o valor muda, mesmo usando só um pedaço dele. Se o valor é um objeto recriado a cada renderização do provedor, isso acontece sempre, mesmo sem mudança real.",
            },
            {
                frente: "Como você evitaria recriar o valor do provedor a cada renderização?",
                verso: "Memoizando o objeto com as dependências certas, ou separando o que muda do que não muda em dois contextos: um com os dados e outro com as funções. Assim quem só dispara ações não renderiza quando o dado muda.",
            },
            {
                frente: "Como você dividiria um Context que cresceu demais?",
                verso: "Por frequência de mudança e por consumidor. Tema e usuário raramente mudam; um contador de carrinho muda a toda hora. Juntar os dois faz a árvore inteira renderizar por causa do que muda mais. Dois contextos separados custam menos que um memo elaborado.",
            },
            {
                frente: "Como você buscaria dados evitando condição de corrida?",
                verso: "Marcando a requisição como cancelada na limpeza do efeito, ou usando o sinal de aborto, e ignorando a resposta que chegar depois. Sem isso, duas buscas disparadas em sequência podem terminar fora de ordem e a tela mostra o resultado da consulta antiga.",
            },
            {
                frente: "O que acontece se o componente sair da tela antes de a resposta chegar?",
                verso: "A atualização de estado é ignorada, então não é um vazamento, mas o trabalho continua sendo feito à toa e a lógica pode seguir por um caminho inútil. O certo é abortar a requisição na limpeza, o que também libera a conexão.",
            },
            {
                frente: "O que uma biblioteca de estado de servidor resolve?",
                verso: "Cache por chave, revalidação, deduplicação de requisições iguais, estados de carregando e erro e reaproveitamento entre telas. É tudo que se reescreve mal em cada efeito de busca. O ganho maior é sumir com dezenas de efeitos parecidos.",
            },
            {
                frente: "Qual a diferença entre estado de servidor e estado de cliente?",
                verso: "Estado de servidor é cópia de um dado que pertence a outro lugar, pode estar velho e precisa ser revalidado. Estado de cliente é só seu, como o que está aberto e o que foi digitado. Tratar os dois com a mesma ferramenta é o que gera cache inconsistente.",
            },
            {
                frente: "Como você atualizaria a lista depois de criar um item?",
                verso: "Invalidando a consulta daquela lista para ela ser buscada de novo, ou inserindo o item no cache com o que o servidor devolveu. Confiar só no que o formulário tinha ignora campos calculados no servidor, e a tela fica diferente do banco.",
            },
            {
                frente: "Como você faria uma busca que só dispara quando o usuário para de digitar?",
                verso: "Com um atraso que reinicia a cada tecla, cancelando o anterior na limpeza do efeito. Isso corta a maior parte das requisições. Vale também não buscar com menos de dois ou três caracteres, e cancelar a requisição em voo quando o texto muda.",
            },
            {
                frente: "Como você trataria paginação numa listagem?",
                verso: "Guardando a página na URL, para o usuário poder compartilhar e voltar, e mantendo o conteúdo anterior visível enquanto a próxima carrega. Trocar a lista por um giro a cada página faz a tela piscar e perde a posição da rolagem.",
            },
            {
                frente: "Como você implementaria rolagem infinita?",
                verso: "Observando um elemento sentinela no fim da lista e pedindo a próxima página quando ele aparece. É preciso cuidar de não disparar duas vezes, e de oferecer um caminho alternativo por teclado, porque rolagem infinita costuma quebrar acessibilidade e rodapé.",
            },
            {
                frente: "O que é um limite de erro e o que ele pega?",
                verso: "Um componente que captura erro de renderização da sua subárvore e mostra uma interface de reserva em vez de derrubar a aplicação inteira. Ele não pega erro dentro de manipulador de evento nem de código assíncrono, que continuam sendo responsabilidade do seu try.",
            },
            {
                frente: "O que acontece com um erro lançado dentro de um efeito?",
                verso: "Se for síncrono, o limite de erro captura. Se for uma promessa rejeitada sem tratamento, ele passa direto e vira erro no console, sem afetar a tela. Por isso toda busca precisa de tratamento explícito e de um estado de erro visível.",
            },
            {
                frente: "Para que serve um portal?",
                verso: "Renderizar um componente noutro ponto do DOM mantendo a posição na árvore do React, então contexto e eventos continuam funcionando. É o que resolve modal e dica de contexto que seriam cortados por overflow ou por empilhamento do pai.",
            },
            {
                frente: "O que um modal acessível precisa ter?",
                verso: "Fechar no Escape, devolver o foco para quem o abriu, prender o foco enquanto está aberto, ter rótulo e ser anunciado como diálogo. Fechar ao clicar fora é esperado, mas não substitui o teclado. O elemento nativo de diálogo já entrega boa parte disso.",
            },
            {
                frente: "Como você tornaria um componente interativo acessível por teclado?",
                verso: "Usando o elemento certo antes de tudo: botão é botão, link é link. Se realmente for preciso um elemento genérico, ele precisa de papel, de participação na ordem de tabulação e de manipulador para Enter e espaço. Div com clique é invisível para quem não usa mouse.",
            },
            {
                frente: "Quando usar atributos de acessibilidade é sinal de problema?",
                verso: "Quando eles estão remendando um elemento errado. Anunciar uma div como botão exige recriar foco, teclado e estado na mão. A regra é preferir o elemento nativo e usar os atributos para o que o HTML não expressa, como estado expandido ou região viva.",
            },
            {
                frente: "Como você associa um rótulo a um campo de formulário?",
                verso: "Com o elemento de rótulo apontando para o identificador do campo, o que também faz o clique focar o campo. Texto solto ao lado não cria relação nenhuma, e o leitor de tela anuncia o campo sem dizer o que ele é.",
            },
            {
                frente: "Por que um formulário controlado grande pode ficar lento?",
                verso: "Porque cada tecla atualiza o estado no topo e renderiza a árvore inteira. Em formulário com dezenas de campos isso aparece como atraso na digitação. As saídas são isolar o estado por campo, usar campos não controlados ou uma biblioteca que assina só o que mudou.",
            },
            {
                frente: "Como você validaria um formulário sem irritar o usuário?",
                verso: "Validando no envio e, depois do primeiro erro, ao sair do campo, em vez de acusar a cada tecla. Mensagem perto do campo, associada a ele para o leitor de tela, e foco no primeiro erro. Validar tudo enquanto digita mostra erro em campo que ainda não terminou.",
            },
            {
                frente: "O que é carregamento preguiçoso de componente?",
                verso: "Adiar o download do código de um componente até ele ser necessário, com importação dinâmica. O React aceita isso com um invólucro que suspende enquanto o pedaço chega, e o Suspense mostra o conteúdo de espera. É como se divide o pacote por rota.",
            },
            {
                frente: "Como você dividiria o pacote de uma aplicação por rota?",
                verso: "Carregando cada rota por importação dinâmica, para o usuário baixar só a tela que abriu. Vale medir antes: às vezes o peso está numa dependência única usada em um lugar, e mover ela resolve mais do que dividir dez rotas.",
            },
            {
                frente: "Como você descobriria o que está pesando no pacote?",
                verso: "Gerando um relatório de tamanho por módulo com a ferramenta de build e olhando o que ocupa mais. Costuma ser biblioteca de data, de ícones importada inteira ou dependência duplicada em duas versões. Só então vale falar em dividir por rota.",
            },
            {
                frente: "Como você evitaria que a tela pule quando as imagens carregam?",
                verso: "Reservando o espaço com largura e altura ou proporção definidas, para o navegador saber o tamanho antes de baixar. Isso evita deslocamento de layout, que é a mudança que faz o usuário clicar no lugar errado.",
            },
            {
                frente: "Como você renderizaria uma lista com milhares de itens?",
                verso: "Renderizando só o que aparece na tela, com virtualização, e mantendo altura previsível para o cálculo funcionar. Antes disso vale perguntar se a lista precisa mesmo ter milhares de itens visíveis, porque paginar ou filtrar costuma ser melhor para o usuário.",
            },
            {
                frente: "Quando você guardaria estado na URL?",
                verso: "Quando ele precisa sobreviver a um recarregamento, ser compartilhado por link ou funcionar com o botão voltar, como filtro, busca e página. O custo é serializar e validar o que vem de lá, porque a URL é entrada do usuário como qualquer outra.",
            },
            {
                frente: "Como você protegeria uma rota que exige login?",
                verso: "Com um componente que checa a sessão e redireciona para a tela de entrada guardando o destino, para voltar depois de autenticar. O importante é lembrar que isso é experiência, não segurança: a proteção de verdade está na API.",
            },
            {
                frente: "Onde você guardaria o token de autenticação no front?",
                verso: "De preferência num cookie de sessão marcado como inacessível ao JavaScript, deixando o navegador enviar. Guardar no armazenamento local é simples e fica exposto a qualquer script injetado. A escolha depende do modelo do backend, e precisa ser deliberada.",
            },
            {
                frente: "O que você testaria num componente, e o que não vale testar?",
                verso: "O comportamento que o usuário percebe: renderizou o que devia, o clique fez o que promete, o erro aparece. Não vale testar detalhe interno como nome de estado ou quantas vezes renderizou, porque isso quebra em toda refatoração sem indicar defeito.",
            },
            {
                frente: "Como você buscaria elementos num teste de componente?",
                verso: "Por papel e nome acessível, que é como o usuário e o leitor de tela enxergam. Buscar por classe ou por identificador de teste acopla o teste à implementação e não verifica se o elemento é anunciado corretamente.",
            },
            {
                frente: "Como você testaria um componente que faz requisição?",
                verso: "Interceptando na camada de rede, com um servidor falso, em vez de substituir a função de busca. Assim o teste exercita o mesmo caminho da produção, inclusive erro e código de status, e não quebra ao trocar o cliente HTTP.",
            },
            {
                frente: "O que costuma tornar um teste de front instável?",
                verso: "Esperar por tempo fixo em vez de esperar pelo elemento aparecer, depender de ordem entre testes, e estado global que sobra de um caso para o outro. Animação e temporizador reais também entram nessa conta, e por isso costumam ser controlados no teste.",
            },
            {
                frente: "Como você reiniciaria o estado de um componente ao trocar de registro?",
                verso: "Passando o identificador do registro como key, o que faz o React descartar a instância e criar outra. É mais confiável do que um efeito limpando campo por campo, que sempre esquece um e deixa dado do registro anterior na tela.",
            },
            {
                frente: "Quando o estado deve subir para o componente pai?",
                verso: "Quando dois irmãos precisam do mesmo dado ou quando o pai precisa reagir a ele. O dado sobe até o ancestral comum mais próximo, e não mais alto que isso. Subir demais transforma o topo da árvore num depósito de estado que renderiza tudo.",
            },
            {
                frente: "Como você compartilharia estado entre dois componentes irmãos?",
                verso: "Guardando no pai comum e passando valor e função de atualização. Se a distância for grande, contexto ou uma camada de estado resolvem melhor. O que não funciona é cada um manter a sua cópia e tentar sincronizar por efeito.",
            },
            {
                frente: "Como você evitaria que o pai renderize a cada mudança de um filho?",
                verso: "Mantendo o estado no componente mais baixo que precisa dele. Se o estado mora no topo só porque foi mais fácil, toda a árvore paga. Outra saída é passar conteúdo por children, que não renderiza de novo quando o pai renderiza por estado próprio.",
            },
            {
                frente: "Como você lidaria com um efeito que precisa rodar só na primeira vez?",
                verso: "Perguntando primeiro se ele deveria ser efeito. Se for mesmo, dependências vazias com limpeza correta resolvem, e o modo estrito vai executá-lo duas vezes em desenvolvimento de propósito. Guardar uma referência para pular a segunda execução mascara o problema.",
            },
            {
                frente: "Como você mostraria o resultado de duas requisições que carregam juntas?",
                verso: "Disparando as duas em paralelo e tratando os estados separadamente, mostrando o que já chegou. Encadear a segunda depois da primeira sem necessidade cria uma cascata que dobra o tempo de espera sem nenhum motivo.",
            },
            {
                frente: "O que é uma cascata de requisições no front?",
                verso: "Cada componente só descobrir o que precisa buscar depois que o pai terminou, o que enfileira chamadas que poderiam ser simultâneas. Aparece como tela carregando em etapas. A saída é buscar no nível da rota ou pré-carregar o que já se sabe que virá.",
            },
            {
                frente: "Como você trataria uma tela que depende de vários dados, e um deles falha?",
                verso: "Decidindo o que é essencial: sem o principal, a tela mostra erro; sem o secundário, ela renderiza sem aquela parte, indicando o que faltou. Bloquear a tela inteira por um bloco lateral que falhou é pior para o usuário do que a informação parcial.",
            },
            {
                frente: "Como você faria uma atualização otimista?",
                verso: "Aplicando a mudança na interface antes da resposta e guardando o valor anterior para desfazer se falhar, com aviso claro. Vale quando a ação quase sempre dá certo e a espera incomoda, como curtir. Não vale onde o erro é comum ou o efeito é irreversível.",
            },
            {
                frente: "Como você lidaria com data e fuso na interface?",
                verso: "Recebendo instante em UTC do servidor e formatando na hora de mostrar, com o fuso e o idioma do navegador. Guardar texto já formatado impede ordenar e comparar, e montar data a partir de partes soltas é onde aparece o erro de um dia.",
            },
            {
                frente: "Como você formataria número e moeda para o usuário?",
                verso: "Com a API de internacionalização do navegador, passando idioma e moeda, que já cuida de separador e posição do símbolo. Formatar na mão com substituição de ponto por vírgula quebra assim que a aplicação atende outro país.",
            },
            {
                frente: "O que muda no código ao preparar a aplicação para outro idioma?",
                verso: "Texto sai do JSX e vira chave traduzida, plural e ordem de palavras deixam de ser montados por concatenação, e o layout precisa aguentar texto mais longo. Data, número e moeda passam a depender do idioma, não de constante.",
            },
            {
                frente: "Como você depuraria uma renderização que acontece mais do que deveria?",
                verso: "Com o perfilador das ferramentas do React, que mostra o que renderizou e por qual motivo, se foi estado, contexto ou pai. Isso costuma apontar direto para um valor recriado a cada renderização, e economiza horas de tentativa.",
            },
            {
                frente: "Como você lidaria com um componente que precisa medir o próprio tamanho?",
                verso: "Com uma referência e um observador de redimensionamento, guardando a medida em estado só se ela for usada na renderização. Medir dentro do efeito e ajustar layout em seguida causa um quadro visível de piscada, então às vezes CSS resolve melhor.",
            },
            {
                frente: "Como você trataria uma assinatura de eventos em tempo real num componente?",
                verso: "Abrindo no efeito e fechando na limpeza, com dependências que reflitam o canal assinado. Sem a limpeza, cada renderização abre mais uma conexão e o mesmo evento passa a ser tratado várias vezes, o que aparece como duplicação estranha na tela.",
            },
            {
                frente: "Como você guardaria uma preferência do usuário no navegador?",
                verso: "Lendo o valor guardado na inicialização do estado, e não num efeito depois, para a tela não piscar o padrão. Toda leitura e escrita dentro de try, porque o armazenamento pode estar bloqueado, e a preferência nunca pode derrubar a aplicação.",
            },
            {
                frente: "Como você trataria um erro de rede sem deixar o usuário travado?",
                verso: "Mostrando o que falhou, oferecendo tentar de novo e preservando o que ele já digitou. Formulário que apaga tudo depois do erro é o pior resultado possível. Se a falha é temporária, uma repetição automática antes de mostrar erro melhora bastante.",
            },
            {
                frente: "Quando você usaria uma referência para chamar algo dentro de um filho?",
                verso: "Em ações imperativas que não cabem em estado, como focar, rolar até um ponto ou tocar uma mídia. É exceção: se o pai precisa comandar o filho o tempo todo, o que faltou foi mover o estado, e não expor mais métodos.",
            },
            {
                frente: "Como você organizaria o código de uma tela que ficou grande?",
                verso: "Separando o que busca e transforma dado num hook próprio, e deixando o componente com a estrutura visual. Depois quebrando blocos com nome de domínio. Dividir só por tamanho, sem nome que signifique algo, troca um arquivo grande por cinco confusos.",
            },
            {
                frente: "Como você trataria estilos que começam a colidir entre telas?",
                verso: "Com escopo, seja por módulos de CSS, utilitários ou componentes estilizados, para a classe não vazar. Nome global genérico é o que gera colisão. O importante é o time escolher uma abordagem e manter, porque três convivendo é pior do que qualquer uma delas.",
            },
            {
                frente: "Como você lidaria com animação de entrada e saída de um elemento?",
                verso: "A entrada é simples com CSS; a saída exige manter o elemento montado até a transição terminar, o que costuma pedir um estado de saindo. É por isso que existem bibliotecas para isso, e por isso animação de saída feita na mão sempre esquece um caso.",
            },
            {
                frente: "Como você evitaria requisições repetidas quando dois componentes pedem o mesmo dado?",
                verso: "Elevando a busca para um nível acima e passando por prop, ou usando cache por chave, que junta as chamadas iguais numa só. Dois efeitos independentes buscando o mesmo recurso é uma das causas mais comuns de tráfego duplicado no front.",
            },
            {
                frente: "Como você trataria um botão que dispara ação demorada?",
                verso: "Mostrando estado de carregando no próprio botão, desabilitando durante a ação e avisando ao terminar. Se passar de alguns segundos, vale explicar o que está acontecendo. Ação sem retorno visual leva o usuário a clicar de novo.",
            },
            {
                frente: "Como você lidaria com um componente de terceiros que manipula o DOM?",
                verso: "Isolando num componente próprio, com referência ao nó, inicializando no efeito e destruindo na limpeza. O React não pode disputar aquele pedaço da árvore. Sem essa fronteira, o componente vira fonte de bug estranho a cada renderização.",
            },
        ],
        pleno: [
            {
                frente: "Como você investigaria uma interface que ficou lenta?",
                verso: "Medindo antes de mexer: perfilar a interação lenta, ver quantos componentes renderizam e quanto tempo cada um leva, e separar lentidão de renderização de lentidão de rede. Otimizar por suposição costuma espalhar memo pela base sem mover o número.",
            },
            {
                frente: "O que o perfilador do React mostra que o console não mostra?",
                verso: "Quais componentes renderizaram em cada atualização, quanto tempo levaram e por que renderizaram. Isso separa o caso de renderizar demais do caso de renderizar poucas vezes e caro, que pedem correções bem diferentes.",
            },
            {
                frente: "Qual é o custo real de uma renderização no React?",
                verso: "Executar as funções dos componentes e comparar a árvore, o que é barato. O que pesa é trabalho pesado dentro do componente, muitos nós no DOM e efeito colateral disparado a cada renderização. Renderizar de novo não é sinônimo de tocar no DOM.",
            },
            {
                frente: "Como você resolveria uma lista que trava enquanto o usuário digita no filtro?",
                verso: "Separando o campo do resultado, para digitar não renderizar a lista inteira, e marcando a atualização da lista como não urgente com uma transição. Virtualizar a lista resolve o resto. Só memoizar a linha raramente basta quando são milhares.",
            },
            {
                frente: "O que o useTransition resolve?",
                verso: "Marca uma atualização como não urgente, deixando o React interromper aquele trabalho para responder ao que o usuário está fazendo agora. É o que mantém a digitação fluida enquanto uma lista pesada recalcula, e dá um sinalizador de pendente para mostrar na interface.",
            },
            {
                frente: "Quando o useDeferredValue é melhor que uma transição?",
                verso: "Quando você não controla quem dispara a atualização, e sim consome um valor que muda rápido. Ele deixa a parte cara renderizar com o valor atrasado enquanto a parte leve acompanha o atual. É a mesma ideia aplicada do lado de quem lê.",
            },
            {
                frente: "O que é renderização concorrente, na prática?",
                verso: "O React poder começar, pausar e retomar uma renderização em vez de fazer tudo de uma vez bloqueando a tela. Isso permite priorizar interação sobre trabalho pesado. Na prática você não controla isso direto: usa transições e Suspense.",
            },
            {
                frente: "Como o React decide o que atualizar na tela?",
                verso: "Comparando a árvore nova com a anterior no mesmo lugar. Mesmo tipo, ele mantém a instância e atualiza props; tipo diferente, descarta a subárvore e monta de novo. Em listas, a key é o que diz qual item é qual.",
            },
            {
                frente: "O que acontece se você declarar um componente dentro de outro?",
                verso: "Ele é recriado a cada renderização, então o React vê um tipo diferente e desmonta a subárvore inteira, perdendo estado e foco e refazendo efeitos. É um dos bugs mais confusos de diagnosticar, e a correção é mover a definição para fora.",
            },
            {
                frente: "Como você evitaria perder o estado de um componente ao reorganizar a árvore?",
                verso: "Mantendo a posição e o tipo estáveis. Trocar entre dois ramos de um ternário no mesmo lugar recria o componente; renderizar sempre o mesmo componente e mudar as props preserva. Quando o reset é intencional, a key é a forma explícita de pedir.",
            },
            {
                frente: "O que é hidratação?",
                verso: "O navegador recebe o HTML já renderizado no servidor e o React anexa os ouvintes e o estado a essa marcação existente, em vez de recriá-la. Até a hidratação terminar, a página aparece mas não responde, e é aí que mora boa parte da percepção de lentidão.",
            },
            {
                frente: "O que causa erro de incompatibilidade na hidratação?",
                verso: "O HTML do servidor sair diferente do que o cliente renderiza na primeira passada, o que acontece com data, número aleatório, largura da janela ou leitura de armazenamento local. A saída é renderizar igual e ajustar depois, num efeito.",
            },
            {
                frente: "Quando renderizar no servidor vale a pena?",
                verso: "Quando importam a primeira pintura em conexão ruim, indexação por buscadores ou compartilhamento com prévia. O custo é infraestrutura para rodar servidor, cuidado com o que só existe no navegador e complexidade de cache. Para painel interno atrás de login, raramente paga.",
            },
            {
                frente: "O que muda quando um componente roda no servidor?",
                verso: "Ele não tem estado, efeito nem acesso ao navegador, e pode buscar dado direto da fonte sem expor credencial. O que precisa de interação vira componente de cliente. O ganho é enviar menos JavaScript; o cuidado é onde traçar essa fronteira.",
            },
            {
                frente: "Como você decidiria o que fica no servidor e o que vai para o cliente?",
                verso: "Empurrando a fronteira para as folhas: a página busca e compõe no servidor, e só os pedaços interativos são de cliente. Marcar um componente alto como de cliente arrasta toda a subárvore junto e apaga o ganho.",
            },
            {
                frente: "Como você mediria a experiência real dos usuários no front?",
                verso: "Com métricas de campo, não só de laboratório: tempo até o maior conteúdo aparecer, resposta à interação e deslocamento de layout, coletadas dos navegadores reais e olhadas por percentil. Teste sintético numa máquina boa esconde justamente quem sofre.",
            },
            {
                frente: "O que costuma piorar a resposta à interação numa aplicação React?",
                verso: "Trabalho síncrono longo na thread principal ao clicar ou digitar: renderização de árvore grande, cálculo pesado sem memo, e script de terceiros. A correção passa por dividir o trabalho, adiar o não urgente e cortar o que não é do produto.",
            },
            {
                frente: "Como você reduziria o JavaScript enviado ao navegador?",
                verso: "Medindo por módulo, removendo dependência que faz pouco, importando só o necessário em vez do pacote inteiro, e dividindo por rota. Depois avaliando o que pode virar HTML estático. Cortar cem kilobytes de biblioteca vale mais que dez memos.",
            },
            {
                frente: "Como você trataria uma dependência pesada usada em uma tela só?",
                verso: "Carregando sob demanda no ponto de uso, para ela não entrar no pacote inicial. Se ela é usada em muitas telas, vale procurar substituto menor ou implementar o pedaço que você realmente usa. Editor de texto e biblioteca de gráfico são os casos clássicos.",
            },
            {
                frente: "Como você organizaria o estado de uma aplicação React grande?",
                verso: "Separando estado de servidor, com cache e revalidação, de estado de interface, que é local sempre que possível, e de estado global de verdade, que é pouca coisa. A maior parte dos problemas vem de tratar dado do servidor como estado global.",
            },
            {
                frente: "Quando adotar uma biblioteca de estado global compensa?",
                verso: "Quando existe estado de cliente compartilhado por muitas telas com regras próprias, como um editor ou um carrinho complexo. Se o que dói é dado do servidor, a ferramenta certa é cache de requisição, e a biblioteca global só vai duplicar o que a API já sabe.",
            },
            {
                frente: "Como você estruturaria as pastas de um projeto React grande?",
                verso: "Por domínio, com cada funcionalidade dona dos seus componentes, hooks e serviços, e uma camada compartilhada pequena e disciplinada. Pastas por tipo técnico crescem até ninguém achar nada, e toda mudança passa a tocar quatro lugares.",
            },
            {
                frente: "Como você definiria a fronteira de um componente reutilizável?",
                verso: "Pelo que ele promete, não pelo que ele desenha hoje. Ele recebe dados e emite eventos, sem saber de rota, requisição ou regra de negócio. No momento em que ele importa um serviço da aplicação, deixou de ser reutilizável e virou uma tela.",
            },
            {
                frente: "Como você evitaria que um componente vire dez props booleanas?",
                verso: "Trocando combinações por uma prop de variante com valores nomeados, e aceitando conteúdo por children em vez de configurar cada pedaço. Booleana solta permite combinações que não existem no design, e é ali que aparecem os estados impossíveis.",
            },
            {
                frente: "Como você garantiria acessibilidade num time que não pensa nisso?",
                verso: "Colocando no caminho: componentes base acessíveis por padrão, verificação automática no build e um roteiro curto de teste por teclado na revisão. Depender de alguém lembrar não escala, e auditoria no fim do projeto sempre chega tarde.",
            },
            {
                frente: "O que uma verificação automática de acessibilidade não pega?",
                verso: "Ordem de foco confusa, rótulo que existe mas não faz sentido, mudança de conteúdo não anunciada e armadilha de teclado. As ferramentas pegam contraste e atributo faltando. O resto exige navegar com teclado e ouvir um leitor de tela.",
            },
            {
                frente: "Quando um teste de ponta a ponta paga o custo?",
                verso: "Nos poucos fluxos que geram receita ou que quebram tudo se falharem, como entrar, comprar e publicar. Eles são lentos e mais frágeis, então cobrir a aplicação inteira com eles cria uma suíte em que ninguém confia e todo mundo reexecuta.",
            },
            {
                frente: "Como você lidaria com testes de interface que falham de vez em quando?",
                verso: "Tratando como defeito e olhando a causa: espera por tempo fixo, animação, dado compartilhado entre casos e requisição não interceptada. Reexecutar até passar treina o time a ignorar vermelho, e o teste deixa de proteger qualquer coisa.",
            },
            {
                frente: "Como você depuraria um erro que só acontece em produção?",
                verso: "Com monitoramento capturando o erro, a versão e o rastro de ações do usuário, e mapas de origem no servidor de erros para a pilha ficar legível. Sem isso sobra reproduzir no escuro. E o dado da sessão precisa ser suficiente para reproduzir, sem vazar informação pessoal.",
            },
            {
                frente: "Como você usaria mapas de origem sem expor o código-fonte?",
                verso: "Gerando os mapas e enviando para a ferramenta de erros no build, sem publicá-los junto do site. Assim a pilha fica legível para o time e o navegador do usuário não baixa nada a mais. Publicar mapa em produção entrega o código inteiro.",
            },
            {
                frente: "O que você monitoraria numa aplicação React em produção?",
                verso: "Taxa de erro por versão e por rota, métricas de experiência do usuário, tempo das chamadas de API vistas do cliente e falhas de carregamento de pedaços. Esse último costuma ser o sintoma de deploy que apagou os arquivos antigos.",
            },
            {
                frente: "Como você trataria o cache do navegador entre deploys?",
                verso: "Com nomes de arquivo versionados por conteúdo e cache longo, e o HTML sem cache. Isso permite trocar tudo sem servir mistura de versões. E é preciso manter os arquivos antigos por um tempo, para quem está com a página aberta não quebrar ao navegar.",
            },
            {
                frente: "Como você lidaria com um usuário que está com a versão antiga aberta há horas?",
                verso: "Detectando que existe versão nova, por checagem periódica ou por falha ao carregar um pedaço, e oferecendo recarregar num aviso discreto. Recarregar sozinho no meio de um formulário é pior que a versão velha, então isso precisa ser combinado com o produto.",
            },
            {
                frente: "Como você faria uma mudança de interface chegar aos poucos?",
                verso: "Atrás de uma chave de funcionalidade avaliada no servidor ou por porcentagem, com métrica comparando os dois grupos e desligamento rápido. O código precisa aguentar os dois caminhos por um tempo, e a chave precisa ter data para morrer.",
            },
            {
                frente: "Como você trataria estado que precisa funcionar sem conexão?",
                verso: "Guardando localmente a fila de ações e reconciliando quando a rede volta, com regra clara de conflito. É bem mais caro do que parece, então vale checar se o produto precisa mesmo disso ou se basta avisar que está offline e preservar o formulário.",
            },
            {
                frente: "Como você lidaria com duas abas da mesma aplicação abertas?",
                verso: "Tratando o armazenamento compartilhado como fonte de eventos, ouvindo mudanças para sincronizar sessão e cache. O caso que mais dói é sair em uma aba e a outra continuar achando que está logada, disparando requisições que falham em série.",
            },
            {
                frente: "Como você faria upload com barra de progresso?",
                verso: "Usando uma API que expõe eventos de progresso, com cancelamento, e enviando direto para o armazenamento quando possível, com URL assinada. Passar arquivo grande pela sua API custa banda e memória do servidor sem entregar nada ao usuário.",
            },
            {
                frente: "Como você lidaria com um WebSocket dentro de uma aplicação React?",
                verso: "Com uma conexão só, num provedor acima das telas, e componentes assinando os eventos que lhes interessam. Abrir conexão dentro de componente multiplica sockets a cada montagem. Reconexão com espera crescente e estado de conexão visível são parte do trabalho.",
            },
            {
                frente: "Como você migraria componentes de classe para hooks?",
                verso: "Aos poucos, começando pelos que mudam com frequência, e sem tentar traduzir método por método: os ciclos de vida viram sincronizações, não um efeito por método. Componente de classe estável e sem bug pode ficar como está por bastante tempo.",
            },
            {
                frente: "Como você conduziria a atualização de uma versão maior do React?",
                verso: "Lendo o guia de mudanças, subindo em uma branch e rodando a suíte, com atenção a bibliotecas do ecossistema, que costumam ser o bloqueio real. Ativar avisos de descontinuação antes ajuda a preparar. Adotar recurso novo vem depois, não junto.",
            },
            {
                frente: "Como você faria a revisão de um PR de React?",
                verso: "Olhando onde o estado mora, se algum efeito é desnecessário, se as keys são estáveis, se as props criam estado impossível e se o componente é acessível por teclado. Estilo fica com a ferramenta. O que rende mais é perguntar por que aquele estado existe.",
            },
            {
                frente: "Que sinais indicam que um componente ficou grande demais?",
                verso: "Vários estados que mudam juntos, efeitos com muitas dependências, condicionais aninhadas no JSX e a necessidade de rolar para entender o retorno. Antes de quebrar, vale ver se o problema é dado mal modelado, porque dividir não conserta isso.",
            },
            {
                frente: "Como você extrairia um hook próprio sem abstrair cedo demais?",
                verso: "Esperando o terceiro uso parecido e extraindo o que é igual de verdade, mantendo os pontos de variação como parâmetro. Hook criado no primeiro uso costuma nascer com opções demais, e depois ninguém consegue mudar sem quebrar alguém.",
            },
            {
                frente: "Como você trataria regra de negócio que apareceu no componente?",
                verso: "Movendo para uma função pura fora do React, que dá para testar sem renderizar, e deixando o componente decidir só o que mostrar. Regra dentro do JSX se duplica na próxima tela, e as duas cópias divergem na primeira mudança de requisito.",
            },
            {
                frente: "Como você lidaria com muitos estados de carregamento na mesma tela?",
                verso: "Agrupando por região com esqueletos, para a página não virar um mosaico de giros, e definindo o que bloqueia e o que carrega depois. Suspense ajuda a coordenar isso. O objetivo é o layout não mudar de forma quando cada parte chega.",
            },
            {
                frente: "Como você faria pré-carregamento de dados de uma rota?",
                verso: "Disparando a busca ao passar o mouse ou ao focar o link, e carregando o código da rota junto. Assim o clique encontra dado e pedaço já em cache. É uma das melhorias mais perceptíveis, e custa pouco quando o cache já existe.",
            },
            {
                frente: "Como você evitaria que o front repita a validação do servidor de forma divergente?",
                verso: "Compartilhando o esquema de validação quando os dois lados são JavaScript, ou gerando o do cliente a partir do contrato. O front valida para dar retorno rápido, e o servidor valida porque é ele quem protege. Duas regras escritas à mão sempre divergem.",
            },
            {
                frente: "Como você trataria uma API que devolve o formato errado para a tela?",
                verso: "Adaptando na borda, num módulo de serviço que traduz para o modelo da interface, em vez de espalhar o formato do servidor pelos componentes. Assim, quando a API mudar, um arquivo muda. E fica claro qual campo a tela realmente usa.",
            },
            {
                frente: "Como você lidaria com paginação e filtros que precisam sobreviver ao voltar?",
                verso: "Guardando na URL como parâmetros de consulta e lendo de lá como fonte da verdade. Assim compartilhar link funciona e o botão voltar faz o esperado. Guardar em estado local obriga a recriar tudo, e o usuário perde o lugar.",
            },
            {
                frente: "Como você trataria animações sem atrapalhar o desempenho?",
                verso: "Animando propriedades que o navegador compõe, como transformação e opacidade, evitando animar layout. E respeitando a preferência de menos movimento do sistema, que existe por acessibilidade e é ignorada com frequência.",
            },
            {
                frente: "Como você mediria o impacto de uma otimização no front?",
                verso: "Comparando o mesmo cenário antes e depois, com número: tempo da interação no perfilador e métricas de campo depois do deploy. Sem isso, otimização vira crença. E vale conferir se o ganho aparece no dispositivo fraco, que é onde ele importa.",
            },
            {
                frente: "Como você lidaria com script de terceiros pesando na página?",
                verso: "Carregando depois do conteúdo, isolando quando der, e medindo o custo de cada um. Vale exigir dono e justificativa para cada script novo. Ferramenta de análise e chat costumam custar mais que a aplicação inteira, e ninguém revisa isso depois de instalado.",
            },
            {
                frente: "Como você trataria conteúdo vindo do usuário que precisa ser renderizado como HTML?",
                verso: "Sanitizando no servidor com uma lista do que é permitido, e só então injetando. Sanitizar apenas no cliente não protege quem consome a mesma API por outro caminho. Se der para evitar HTML e usar formato controlado, melhor ainda.",
            },
            {
                frente: "Como você lidaria com um formulário de vários passos?",
                verso: "Com o estado do formulário acima dos passos, validação por passo e possibilidade de voltar sem perder o que foi preenchido. Guardar rascunho ajuda em formulário longo. O passo atual costuma ficar na URL, para recarregar não jogar tudo fora.",
            },
            {
                frente: "Como você trataria um componente que precisa saber se está visível na tela?",
                verso: "Com o observador de interseção, que avisa quando o elemento entra e sai da janela, em vez de ouvir rolagem e calcular posição. Serve para carregar sob demanda, medir visualização e disparar rolagem infinita, com custo bem menor.",
            },
            {
                frente: "Como você organizaria a camada que fala com a API?",
                verso: "Num módulo por recurso, com tipos de entrada e saída, tratamento de erro padronizado e nada de JSX. Componente chamando fetch direto espalha URL e cabeçalho pela base, e trocar autenticação vira caçada por arquivo.",
            },
            {
                frente: "Como você trataria tokens expirando durante o uso?",
                verso: "Renovando de forma transparente na camada de rede, com uma fila para não disparar várias renovações ao mesmo tempo, e caindo para a tela de entrada quando falhar. Deixar cada componente tratar 401 gera comportamento diferente em cada tela.",
            },
            {
                frente: "Como você garantiria que o front não quebre quando a API muda?",
                verso: "Com tipos gerados do contrato ou validação do formato na borda, falhando de forma clara em vez de espalhar indefinido pela árvore. Teste de contrato ajuda a pegar cedo. Confiar que a resposta tem o campo é como surge tela branca em produção.",
            },
            {
                frente: "Como você lidaria com estados impossíveis na interface?",
                verso: "Modelando o estado como união de casos, como carregando, erro e conteúdo, em vez de três booleanas independentes. Assim carregando e erro ao mesmo tempo deixa de ser representável, e a renderização vira um switch simples.",
            },
            {
                frente: "Como você trataria uma tela que precisa de dado que só existe depois do login?",
                verso: "Resolvendo a sessão acima, num provedor, e deixando a tela assumir que o usuário existe. Cada componente checando se há usuário espalha condicional e cria o intervalo em que a tela renderiza vazia e depois pula.",
            },
            {
                frente: "Como você reduziria o tempo até a primeira tela útil?",
                verso: "Enviando menos JavaScript, buscando o dado essencial junto com a navegação em vez de depois da montagem, e mostrando esqueleto no lugar da tela em branco. Fonte e imagem entram na conta, e costumam ser esquecidas.",
            },
            {
                frente: "Como você trataria uma dependência que quebra no modo estrito?",
                verso: "Verificando se ela é mantida e se existe versão compatível, e isolando o uso num invólucro enquanto isso. Desligar o modo estrito para calar o aviso esconde um problema real de efeito sem limpeza, e ele reaparece na próxima versão do React.",
            },
            {
                frente: "Como você lidaria com um bug que só acontece num navegador?",
                verso: "Reproduzindo nele com as ferramentas próprias, e checando suporte da API usada antes de culpar o React. Costuma ser diferença de eventos, foco ou layout. Ter ao menos um teste rodando nesse navegador impede a regressão voltar.",
            },
            {
                frente: "Como você garantiria que o componente funciona em telas pequenas?",
                verso: "Desenhando primeiro para a tela pequena e crescendo com consultas de mídia, testando com teclado virtual aberto e com texto ampliado. Emulador ajuda, mas dispositivo real revela toque, rolagem e desempenho que o navegador esconde.",
            },
            {
                frente: "Como você trataria imagens em várias resoluções?",
                verso: "Servindo tamanhos diferentes com o atributo que descreve as fontes, em formato moderno, com dimensão reservada e carregamento adiado fora da primeira dobra. Enviar a imagem original para todo mundo é o desperdício mais comum de banda em front.",
            },
            {
                frente: "Como você mediria se vale a pena remover uma biblioteca?",
                verso: "Pelo peso que ela adiciona, por quanto do que ela faz você realmente usa e pelo custo de manter a substituição. Trocar uma biblioteca inteira por trezentas linhas próprias parece vitória até alguém precisar dar manutenção nelas.",
            },
            {
                frente: "Como você lidaria com um componente compartilhado que cada time quer diferente?",
                verso: "Separando o que é comportamento do que é aparência, expondo pontos de composição em vez de acumular props. Se as necessidades divergem de verdade, dois componentes honestos custam menos que um configurável demais que ninguém entende.",
            },
            {
                frente: "Como você trataria a primeira renderização que depende de algo do navegador?",
                verso: "Renderizando o mesmo que o servidor renderizaria e ajustando depois de montar, com um estado que só vira verdadeiro no cliente. Ler largura da janela ou armazenamento durante a renderização inicial é o caminho direto para erro de hidratação.",
            },
            {
                frente: "Como você lidaria com um efeito que dispara em cascata outros efeitos?",
                verso: "Puxando o cálculo para a renderização ou para o evento que originou a mudança, em vez de encadear efeitos que reagem uns aos outros. Cadeia de efeitos gera renderizações intermediárias visíveis e é quase impossível de acompanhar depois de três elos.",
            },
            {
                frente: "Como você trataria o crescimento do tempo de build do front?",
                verso: "Medindo por etapa antes de trocar de ferramenta: costuma ser checagem de tipos junto do empacotamento, plugin caro ou ausência de cache. Build lento muda o comportamento do time, que passa a agrupar mudanças e a testar menos.",
            },
        ],
        senior: [
            {
                frente: "Como você escolheria entre uma aplicação de página única e um framework com servidor?",
                verso: "Pelo produto: conteúdo público que precisa ser indexado e abrir rápido em conexão ruim pede servidor. Painel atrás de login vive bem como página única e evita operar infraestrutura de renderização. A pergunta seguinte é quem mantém isso de pé às três da manhã.",
            },
            {
                frente: "Quando você não usaria React num projeto novo?",
                verso: "Quando a página é conteúdo com pouca interação, quando o time não conhece e o prazo é curto, ou quando o produto é um widget que precisa pesar pouco dentro do site de outra pessoa. Escolher pela familiaridade do time costuma render mais que escolher pela tecnologia.",
            },
            {
                frente: "Como você avaliaria adotar componentes de servidor num projeto existente?",
                verso: "Pelo problema que resolvem ali: peso de JavaScript e cascata de requisições. A conta inclui migrar padrão de dados, rever autenticação e treinar o time numa fronteira nova. Adotar por rota, começando pelas mais pesadas, permite medir antes de comprometer tudo.",
            },
            {
                frente: "Como você conduziria a atualização de uma versão maior do React num produto grande?",
                verso: "Levantando as dependências que travam, subindo numa branch com a suíte inteira rodando e ligando os avisos antes. Depois liberando por partes, com monitoramento de erro por versão. O risco raro não está no React: está nas bibliotecas do ecossistema.",
            },
            {
                frente: "Como você definiria a estratégia de estado para vários times?",
                verso: "Padronizando a divisão, não a biblioteca: estado de servidor com cache, estado de interface local e o pouco que é global de verdade. Com uma escolha padrão para cada caixa e liberdade justificada para sair dela. Sem isso, cada tela inventa a sua e ninguém consegue revisar.",
            },
            {
                frente: "Como você evitaria que cada time escolha uma biblioteca diferente para a mesma coisa?",
                verso: "Com um conjunto padrão documentado, um modelo de projeto que já vem com ele e um caminho claro para propor mudança. Proibir não funciona; facilitar o padrão sim. E toda escolha nova precisa dizer quem mantém e o que sai em troca.",
            },
            {
                frente: "Como você conduziria a criação de um design system?",
                verso: "Começando pelos componentes que já se repetem e pelos tokens de cor, espaço e tipografia, entregando junto com uma tela real. Design system criado antes do uso vira catálogo bonito e ignorado. Adoção se mede em telas migradas, não em componentes publicados.",
            },
            {
                frente: "Como você lidaria com times que copiam e alteram o componente do design system?",
                verso: "Perguntando o que faltava, porque cópia é sintoma de rigidez ou de dificuldade de contribuir. A correção costuma ser abrir pontos de composição e facilitar o processo de proposta. Bloquear a cópia sem resolver a causa só empurra a divergência para dentro do CSS.",
            },
            {
                frente: "Como você versionaria uma biblioteca de componentes interna?",
                verso: "Com versão semântica levada a sério, mudança visual tratada como quebra quando altera layout de quem usa, e um registro de mudanças que diga o que fazer. Prazo e caminho de migração para o que sai. Sem isso os times congelam a versão e você mantém três.",
            },
            {
                frente: "Como você definiria metas de desempenho para o front?",
                verso: "Em número de campo e por percentil, ligado ao que o usuário sente: tempo até a tela útil e resposta à interação, no dispositivo mediano do seu público. Meta sem dispositivo e sem percentil é opinião, e some na primeira negociação de prazo.",
            },
            {
                frente: "Como você impediria que o tamanho do pacote cresça sem controle?",
                verso: "Com um limite verificado na esteira, que falha quando passa, e o número visível no PR. Assim a discussão acontece quando a dependência entra, e não seis meses depois. Sem trava automática, o pacote só cresce, porque cada aumento parece pequeno.",
            },
            {
                frente: "Como você avaliaria adotar micro frontends?",
                verso: "Pelo problema organizacional: times que precisam publicar sem coordenar. Se o motivo é técnico, quase sempre existe solução mais barata. O custo é duplicar dependência, unificar autenticação e estilo, e depurar uma tela que ninguém é dono inteiro.",
            },
            {
                frente: "Quando micro frontends claramente não valem?",
                verso: "Com um time só, ou com times que já publicam juntos sem dor. Ali eles trocam um build simples por orquestração, versões divergentes e desempenho pior para o usuário, que baixa React duas vezes. A vantagem é organizacional, e sem esse problema não há ganho.",
            },
            {
                frente: "Como você organizaria um monorepo de front?",
                verso: "Com fronteiras explícitas entre pacotes, build incremental com cache e regra de quem pode depender de quem. Sem isso, monorepo vira uma bola de barro com build de vinte minutos, e a facilidade de importar qualquer coisa acopla tudo.",
            },
            {
                frente: "Como você conduziria a migração de uma base legada de front?",
                verso: "Por rota ou por pedaço de tela, com as duas tecnologias convivendo atrás do mesmo domínio, começando pelo que muda mais. Reescrita completa perde regra que ninguém documentou e passa meses sem entregar. Migrar por fatia deixa o produto vivo o tempo todo.",
            },
            {
                frente: "Como você trataria a dívida de efeitos espalhados por uma base antiga?",
                verso: "Atacando por categoria e não por arquivo: os que só derivam estado, os que buscam dado sem cancelamento e os que sincronizam com o DOM. Os dois primeiros somem trocando padrão, e é aí que está a maior parte dos bugs de renderização.",
            },
            {
                frente: "Como você ensinaria hooks a um time que vem de componentes de classe?",
                verso: "Pelo modelo mental, não pela tabela de equivalência: a renderização descreve a tela para aquele estado, e efeito é sincronização com o mundo de fora. A tradução direta de ciclo de vida para efeito é o que produz a dívida que depois custa caro.",
            },
            {
                frente: "Que padrões você exigiria numa revisão de código de front?",
                verso: "Onde o estado mora, ausência de efeito desnecessário, key estável, acessibilidade por teclado e camada de rede isolada. O resto é sugestão. Lista longa de exigência transforma revisão em ritual, e o que importa passa despercebido no meio.",
            },
            {
                frente: "Como você encerraria uma discussão recorrente de estilo de código?",
                verso: "Automatizando: formatador e linter decidem, e ninguém mais discute em revisão. Onde a ferramenta não alcança, uma decisão escrita e datada. O custo de manter a discussão viva toda semana é maior que o de qualquer escolha razoável.",
            },
            {
                frente: "Como você mediria a qualidade do front além de teste passando?",
                verso: "Erros por sessão em produção, métricas de experiência do usuário, tempo para entregar uma mudança pequena e quantas telas o time evita tocar. Cobertura sozinha diz pouco, e vira meta que se engana com teste sem asserção.",
            },
            {
                frente: "Como você definiria a estratégia de testes de uma aplicação React?",
                verso: "Muitos testes de componente rápidos sobre comportamento, poucos de ponta a ponta nos fluxos de receita, e verificação visual só onde regressão de layout dói. O critério é confiança por minuto de execução, e uma suíte em que o vermelho é levado a sério.",
            },
            {
                frente: "Como você trataria requisito de suporte a navegador antigo?",
                verso: "Buscando o dado de uso real do seu público antes de aceitar a exigência, porque manter compatibilidade custa em pacote e em tempo. Se for necessário, isolar o custo com carregamento condicional em vez de rebaixar a aplicação inteira.",
            },
            {
                frente: "Como você trataria usuários em conexões ruins e aparelhos fracos?",
                verso: "Medindo com o dispositivo mediano do público e não com o notebook do time, cortando JavaScript, adiando o que não é essencial e mostrando conteúdo antes da interatividade. É onde renderização no servidor costuma justificar o custo.",
            },
            {
                frente: "Como você trataria SEO numa aplicação React?",
                verso: "Entregando HTML com o conteúdo, seja renderizando no servidor ou gerando estático, com título, descrição e endereço canônico por rota. Página que só monta no cliente pode até ser indexada, mas concorre em desvantagem, e prévia em rede social não funciona.",
            },
            {
                frente: "Como você mediria o custo de infraestrutura de renderizar no servidor?",
                verso: "Custo por requisição renderizada, incluindo CPU, memória e o que o cache absorve. Muita coisa que se renderiza a cada acesso podia ser gerada uma vez. Se quase tudo cai no cache, o custo é pequeno; se nada cai, ele cresce com o tráfego.",
            },
            {
                frente: "Como você faria o deploy do front sem quebrar quem está com a página aberta?",
                verso: "Mantendo os arquivos da versão anterior disponíveis por um tempo, versionando por conteúdo e detectando falha ao carregar um pedaço para oferecer recarregar. Apagar tudo a cada deploy quebra navegação de quem já estava dentro.",
            },
            {
                frente: "Como você conduziria um incidente causado por uma entrega de front?",
                verso: "Voltando para a versão anterior primeiro, porque no front isso costuma ser rápido, e só então investigando. Se a mudança está atrás de uma chave, desligar é ainda mais rápido. Investigar com usuários vendo tela quebrada é o erro clássico.",
            },
            {
                frente: "Como você mediria o impacto de uma mudança de interface?",
                verso: "Definindo antes qual comportamento deveria mudar e como isso aparece nos números, com grupo de comparação quando dá. Sem hipótese anterior, todo resultado vira confirmação do que se queria acreditar, e a mudança fica mesmo quando piorou.",
            },
            {
                frente: "Como você trabalharia com design quando o desenho não cabe no componente existente?",
                verso: "Trazendo o custo para a conversa cedo, com opções: aproximar do que existe, estender o componente para todos, ou aceitar a exceção documentada. Implementar em silêncio uma variação nova é como o design system começa a divergir.",
            },
            {
                frente: "Como você estimaria uma tela complexa?",
                verso: "Quebrando em partes com risco identificado: estados, integração, casos de erro e acessibilidade, que é o que costuma ficar de fora. Comparando com telas parecidas já entregues. Estimativa que só conta o caso feliz erra por um fator conhecido.",
            },
            {
                frente: "Como você decidiria entre usar um componente pronto e construir o seu?",
                verso: "Pelo quanto ele carrega de coisa que você não usa, pelo custo de customizar e por quem mantém. Data, tabela e seleção com busca costumam valer a compra, porque acessibilidade e casos de borda são caros. Botão e cartão quase nunca.",
            },
            {
                frente: "Como você avaliaria uma biblioteca de front antes de adotar?",
                verso: "Peso, manutenção ativa, quantas dependências arrasta, acessibilidade e qual o caminho de saída se ela morrer. Depois quem no time sustenta. Biblioteca que só uma pessoa entende vira dívida no dia em que ela troca de time.",
            },
            {
                frente: "Como você lidaria com uma dependência importante que foi abandonada?",
                verso: "Fixando a versão e isolando o uso atrás de um invólucro para reduzir o custo da troca, enquanto avalia substituto ou manutenção interna. Migrar às pressas depois de uma vulnerabilidade é bem pior do que planejar a saída com calma.",
            },
            {
                frente: "Como você garantiria segurança numa aplicação React?",
                verso: "Não injetando HTML de terceiros sem sanitizar, cuidando de onde o token vive, definindo política de conteúdo e revisando dependências. O front não protege dado: ele protege o usuário do próprio navegador. A autorização de verdade continua no servidor.",
            },
            {
                frente: "Como você trataria autenticação no front de forma segura?",
                verso: "Preferindo sessão em cookie inacessível ao JavaScript, com renovação transparente e saída que limpa tudo. O front trata isso como experiência, não como barreira. Toda rota protegida precisa da checagem no servidor, porque o cliente é editável.",
            },
            {
                frente: "Como você lidaria com chaves de funcionalidade no front?",
                verso: "Avaliando no servidor ou na entrega, com valor padrão seguro e data para a chave morrer. Sem prazo, elas acumulam e viram combinações que ninguém testou. Também precisam ser observáveis, para saber quem está vendo o quê num incidente.",
            },
            {
                frente: "Como você conduziria um teste A/B sem estragar a experiência?",
                verso: "Com o grupo decidido antes da renderização para não piscar entre variantes, tamanho de amostra e duração definidos antes, e uma métrica principal. Rodar até dar o resultado que se queria é o erro mais comum, e ele passa despercebido.",
            },
            {
                frente: "Como você trataria telemetria sem virar coleta abusiva?",
                verso: "Coletando o que responde a uma pergunta concreta, sem dado pessoal desnecessário, com retenção definida e respeitando consentimento. Evento coletado por via das dúvidas vira custo, risco jurídico e painel que ninguém abre.",
            },
            {
                frente: "Como você lidaria com internacionalização em escala?",
                verso: "Tirando texto do código desde o começo, com chaves organizadas por domínio, plural e formatação resolvidos pela biblioteca, e traduções carregadas por idioma. Adicionar idioma depois de dois anos de texto embutido é um dos refactors mais caros do front.",
            },
            {
                frente: "Como você faria a integração de alguém novo no front?",
                verso: "Ambiente rodando em um comando, uma tarefa real pequena na primeira semana e um mapa curto de como o projeto se divide e por quê. Documentar as três decisões que mais surpreendem economiza semanas de perguntas repetidas.",
            },
            {
                frente: "Como você documentaria componentes de forma que alguém use?",
                verso: "Com exemplos executáveis ao lado do código, mostrando os estados reais e o que não fazer. Documentação separada do repositório envelhece em semanas. E o melhor documento continua sendo a interface do componente ser difícil de usar errado.",
            },
            {
                frente: "Como você lidaria com um time que quer reescrever o front do zero?",
                verso: "Pedindo o que exatamente não dá para consertar de forma incremental e quem paga o período de dois sistemas. Muitas vezes a dor é build lento e ausência de teste, que se resolve sem reescrita. Se a reescrita for mesmo o caminho, ela precisa ser por fatia.",
            },
            {
                frente: "Como você priorizaria melhorias de desempenho?",
                verso: "Pelo que afeta mais gente no percentil ruim, começando pelo que tem número: peso do pacote, cascata de requisições e interação travando. Otimização de renderização isolada costuma render menos do que remover uma dependência ou corrigir a busca de dados.",
            },
            {
                frente: "Como você lidaria com um front acoplado a uma API ruim?",
                verso: "Isolando a tradução numa camada só, para o resto do código falar o idioma da interface, e levando os problemas medidos para o time da API: número de chamadas por tela, campos faltando, latência. Sem número, a conversa vira reclamação.",
            },
            {
                frente: "Quando uma camada intermediária para o front se justifica?",
                verso: "Quando a tela precisa juntar várias chamadas, esconder detalhe de serviços internos ou entregar exatamente o que aquela interface usa. O custo é mais um serviço para operar e versionar, e ele precisa de dono claro, senão vira terra de ninguém.",
            },
            {
                frente: "Como você negociaria mudança de contrato com o time de backend?",
                verso: "Trazendo o custo do lado do usuário com dado, propondo o formato e combinando compatibilidade nos dois sentidos durante a transição. Contrato acertado por conversa e integrado no fim é o que estoura prazo dos dois lados.",
            },
            {
                frente: "Como você evitaria que a interface espelhe o modelo do banco?",
                verso: "Modelando o estado pelo que a tela precisa mostrar e decidir, e adaptando o que vem da API na borda. Quando o componente conhece o formato do banco, cada mudança de coluna vira mudança de tela, e a linguagem do produto some do código.",
            },
            {
                frente: "Como você decidiria o que validar no cliente e o que validar no servidor?",
                verso: "Tudo é validado no servidor, sempre, porque é ele que protege. O cliente valida para dar retorno rápido e evitar ida e volta. A regra precisa ter uma fonte só, senão as duas divergem e o usuário vê mensagens diferentes para o mesmo erro.",
            },
            {
                frente: "Como você trataria performance percebida, e não só medida?",
                verso: "Mostrando resposta imediata ao clique, esqueleto no lugar de tela vazia, e atualização otimista onde faz sentido. Uma ação que responde em duzentos milissegundos parece mais rápida que outra em cem sem retorno visual nenhum.",
            },
            {
                frente: "Como você definiria o que é uma entrega de front pronta?",
                verso: "Funciona nos estados de carregando, vazio e erro, é acessível por teclado, responde em tela pequena, tem os textos revisados e não regrediu desempenho. Pronto não é a tela funcionar no caminho feliz na máquina de quem escreveu.",
            },
            {
                frente: "Como você lidaria com uma tela que ninguém do time quer mexer?",
                verso: "Descobrindo o motivo: costuma ser estado espalhado, ausência de teste e medo de quebrar. Adicionar teste de comportamento antes de tocar transforma o medo em trabalho normal. Se ela quase não é usada, a melhor manutenção é remover.",
            },
            {
                frente: "Como você trataria duplicação de lógica entre web e aplicativo móvel?",
                verso: "Extraindo o que é regra pura para um pacote compartilhado, sem componente nem navegação. Tentar compartilhar interface entre plataformas costuma render o pior dos dois lados. O que compartilha bem é validação, formatação e cliente de API.",
            },
            {
                frente: "Como você mediria se o design system está sendo adotado?",
                verso: "Contando telas migradas, importações do pacote contra CSS próprio, e quantos componentes locais duplicam algo que já existe. Número de componentes publicados não diz nada. E é preciso perguntar aos times por que não usaram, sem tom de cobrança.",
            },
            {
                frente: "Como você lidaria com pressão para entregar sem acessibilidade?",
                verso: "Mostrando que boa parte do custo é escolher o elemento certo, o que não muda prazo, e separando o que é obrigação legal do que é melhoria. Deixar para depois significa refazer, porque acessibilidade não é camada que se aplica no fim.",
            },
            {
                frente: "Como você trataria o crescimento do tempo de checagem de tipos no front?",
                verso: "Medindo o que domina, quebrando em projetos com referências e evitando tipos genéricos muito complexos em código compartilhado. Rodar a checagem em paralelo com o build ajuda no ciclo local, mas não resolve o custo de um tipo que explode.",
            },
            {
                frente: "Como você garantiria que o front continue funcionando quando um serviço cai?",
                verso: "Definindo o que é essencial por tela, degradando o resto com estado claro em vez de bloquear tudo, e com timeout em toda chamada. Uma tela que não abre porque o bloco lateral de recomendações caiu é uma decisão de projeto, e quase sempre errada.",
            },
            {
                frente: "Como você lidaria com requisitos que mudam no meio da implementação?",
                verso: "Entregando em fatias para a mudança pegar menos código pronto, e deixando explícito o custo do que já foi feito. Se muda toda semana, o problema é anterior ao front: falta decidir o produto, e nenhuma arquitetura conserta isso.",
            },
            {
                frente: "Como você decidiria remover uma funcionalidade da interface?",
                verso: "Medindo uso real, avisando quem depende e removendo o código junto, e não só o botão. Funcionalidade escondida mas viva continua custando manutenção e ainda quebra em silêncio, porque ninguém testa o que ninguém vê.",
            },
            {
                frente: "Como você equilibraria consistência visual e autonomia dos times?",
                verso: "Fixando os tokens e os componentes de base, e deixando composição livre. A consistência que importa é a que o usuário percebe: espaçamento, cor, tipografia e comportamento. Padronizar estrutura de pasta rende discussão e nenhum ganho para quem usa.",
            },
            {
                frente: "Como você lidaria com um componente crítico que só uma pessoa entende?",
                verso: "Documentando junto com ela, revisando em par as próximas mudanças e cobrindo com teste de comportamento. É risco de operação, não questão de organização. O teste é simples: essa pessoa consegue tirar férias sem o time travar?",
            },
            {
                frente: "Como você trataria erro que o usuário vê mas não reporta?",
                verso: "Instrumentando erro de renderização e falha de requisição com contexto suficiente, e olhando por rota e por versão. A maioria dos usuários abandona em silêncio. Sem telemetria, o time acredita que está tudo bem porque ninguém reclamou.",
            },
            {
                frente: "Como você decidiria entre corrigir na interface e corrigir na origem do dado?",
                verso: "Perguntando quantos consumidores existem. Se são vários, remendar em cada um multiplica a divergência, e a correção certa é na origem. Remendo na tela é aceitável como medida temporária, desde que registrado com prazo.",
            },
            {
                frente: "Como você avaliaria adotar TypeScript num front que ainda não usa?",
                verso: "Ligando por arquivo, começando pelas bordas e pelos módulos compartilhados, com regras estritas chegando aos poucos. O ganho aparece cedo em contrato de API e props. Tentar converter tudo de uma vez produz um mar de tipos frouxos que não protegem nada.",
            },
            {
                frente: "Como você lidaria com o front dependendo de dados que chegam por várias fontes?",
                verso: "Definindo uma fonte da verdade por informação e um lugar para reconciliar, em vez de cada componente escolher. Quando cache local, resposta de mutação e evento em tempo real convivem, é preciso decidir quem vence, senão a tela mostra três versões.",
            },
            {
                frente: "Como você faria a transição de um padrão antigo para um novo sem parar o produto?",
                verso: "Deixando os dois conviverem com fronteira clara, escrevendo o novo só a partir de agora e migrando o antigo quando a tela for mexida. Mutirão de migração compete com entrega e sempre perde. O que não pode é ficar sem data e sem responsável.",
            },
            {
                frente: "Como você trataria uma tela que carrega rápido mas parece lenta?",
                verso: "Olhando o que acontece entre pintar e responder: hidratação longa, fonte que troca, imagem que empurra o layout e interação que trava. Percepção é sobre estabilidade e retorno imediato, e não sobre o número total de milissegundos.",
            },
            {
                frente: "Como você definiria quem é dono de cada parte do front?",
                verso: "Por domínio de produto, com dono declarado no repositório e revisão obrigatória do dono no que é sensível. Código sem dono acumula remendo de gente de passagem, e no incidente ninguém sabe quem chamar.",
            },
            {
                frente: "Como você decidiria o que renderizar no servidor numa aplicação já em produção?",
                verso: "Pelas rotas onde a primeira pintura e a indexação importam, medindo antes e depois. Rota atrás de login com muita interação raramente ganha. Migrar tudo por coerência custa infraestrutura e uma classe nova de bug, sem melhorar o que o usuário sente.",
            },
            {
                frente: "Como você lidaria com um time que evita escrever teste de front?",
                verso: "Entendendo o motivo antes de cobrar: costuma ser teste frágil que já frustrou, ou componente difícil de testar. Começar pelo bug recém corrigido, com teste de comportamento que falha antes, mostra valor rápido. Meta de cobertura imposta produz teste sem asserção.",
            },
            {
                frente: "Como você reduziria o risco de uma entrega grande de interface?",
                verso: "Colocando em produção desligada atrás de uma chave desde cedo, integrando toda semana e liberando para uma fatia de usuários. Entrega de três meses que vai ao ar de uma vez concentra o risco na pior noite possível.",
            },
        ],
    },
};
