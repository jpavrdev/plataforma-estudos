import type { TopicoDeEntrevista } from "../../seed-entrevista.ts";

/**
 * Perguntas de entrevista de TypeScript.
 *
 * O nível segue o que a pergunta cobra, e não o assunto. O any aparece nos quatro
 * níveis: em estágio é o que ele significa, em sênior é a política do time sobre
 * onde ele é aceitável e como impedir que vire regra.
 */
export const typescript: TopicoDeEntrevista = {
    slug: "typescript",
    nome: "TypeScript",
    position: 9,
    perguntas: {
        estagio: [
            {
                frente: "Que problema o TypeScript resolve?",
                verso: "Pegar em tempo de escrita erros que só apareceriam rodando: campo que não existe, argumento na ordem errada, valor que pode ser nulo. Junto disso vem autocompletar confiável e refatoração segura, que é o ganho que mais se sente no dia a dia.",
            },
            {
                frente: "O TypeScript existe em tempo de execução?",
                verso: "Não. Os tipos são apagados na compilação, e o que roda é JavaScript comum. Por isso não dá para checar um tipo com if em tempo de execução, e por isso dado vindo da rede precisa ser validado de verdade, e não apenas declarado.",
            },
            {
                frente: "O que o compilador do TypeScript faz?",
                verso: "Checa os tipos e gera JavaScript, podendo ajustar a sintaxe para uma versão mais antiga. As duas coisas são independentes: dá para gerar código mesmo com erro de tipo, e dá para só checar sem gerar arquivo nenhum.",
            },
            {
                frente: "O que é inferência de tipo?",
                verso: "É o compilador deduzir o tipo a partir do valor, sem você escrever. Uma variável iniciada com texto é texto. Isso mantém o código enxuto, e é por isso que anotar tudo costuma ser ruído em vez de segurança.",
            },
            {
                frente: "Quando vale anotar o tipo em vez de deixar inferir?",
                verso: "Em fronteiras: parâmetros, retorno de função pública e objetos que descrevem contrato. Ali a anotação documenta e trava a intenção. Dentro da função, deixar inferir costuma ser melhor, porque acompanha a mudança sem manutenção.",
            },
            {
                frente: "O que o tipo any significa?",
                verso: "Que o compilador desiste daquele valor: qualquer operação passa e qualquer atribuição é aceita. Ele não é um tipo, é a ausência de checagem, e contamina o que toca. Um any no meio do caminho apaga a segurança de tudo que vem depois.",
            },
            {
                frente: "O que é unknown, e como se usa?",
                verso: "É o topo seguro: aceita qualquer valor, mas não deixa fazer nada com ele antes de você provar o que é, com checagem. É o que se usa para dado vindo de fora, porque obriga a validar antes de acessar campo.",
            },
            {
                frente: "Qual a diferença entre any e unknown?",
                verso: "Os dois aceitam qualquer coisa na entrada. O any também aceita qualquer uso, sem reclamar; o unknown exige que você estreite o tipo antes. Trocar any por unknown é a mudança de menor custo para tornar uma base mais segura.",
            },
            {
                frente: "O que o tipo never representa?",
                verso: "O valor que nunca acontece. Aparece no retorno de função que sempre lança ou nunca termina, e no caso restante de uma verificação exaustiva. É o que permite o compilador avisar quando alguém acrescenta uma opção e esquece de tratá-la.",
            },
            {
                frente: "Qual a diferença entre void e undefined?",
                verso: "Void diz que o retorno não deve ser usado, mesmo que na prática venha indefinido. Undefined é um valor de verdade. A distinção importa em retorno de chamada: uma função declarada como void aceita implementação que devolve algo, e esse valor é ignorado.",
            },
            {
                frente: "O que a opção estrita de nulos muda?",
                verso: "Nulo e indefinido deixam de ser aceitos em qualquer tipo e passam a precisar de declaração explícita. É a mudança que mais pega erro numa base, porque obriga a tratar o caso ausente onde ele existe de verdade.",
            },
            {
                frente: "O que é uma união de tipos?",
                verso: "Um tipo que aceita mais de uma forma, escrito com barra vertical, como texto ou número. Antes de usar, é preciso estreitar para saber com qual você está lidando. União de literais também é o jeito mais simples de descrever um conjunto fechado de opções.",
            },
            {
                frente: "O que é uma interseção de tipos?",
                verso: "A combinação de dois tipos em um, que exige ter tudo dos dois. Serve para compor, como um objeto que é uma entidade mais campos de auditoria. Interseção de tipos incompatíveis produz algo impossível de satisfazer.",
            },
            {
                frente: "Qual a diferença entre interface e type?",
                verso: "Interface descreve a forma de um objeto e pode ser estendida e reaberta. Type é um apelido para qualquer tipo, inclusive união e tupla. Para objeto, os dois servem; a escolha costuma ser convenção do time, e o que decide é precisar de união ou não.",
            },
            {
                frente: "Como você tipa uma função?",
                verso: "Anotando cada parâmetro e, quando útil, o retorno. O retorno costuma ser inferido bem, mas declará-lo em função pública trava o contrato e faz o erro aparecer dentro da função, e não em quem usa.",
            },
            {
                frente: "Como você declara um parâmetro opcional?",
                verso: "Com interrogação depois do nome, o que torna o tipo dele união com indefinido. Parâmetro opcional precisa vir depois dos obrigatórios. Se o valor tem um padrão razoável, valor padrão costuma ser melhor que opcional.",
            },
            {
                frente: "O que muda entre parâmetro opcional e parâmetro com valor padrão?",
                verso: "O opcional pode chegar indefinido e você trata. O com padrão nunca chega indefinido dentro da função, porque o valor é preenchido na chamada. O segundo elimina uma checagem, e é o que costuma deixar o corpo mais limpo.",
            },
            {
                frente: "Como você tipa um array?",
                verso: "Com o tipo seguido de colchetes ou com a forma genérica, que são equivalentes. O que importa é o array ser homogêneo: quando ele tem tipos diferentes por posição, o certo é uma tupla, e não uma união solta.",
            },
            {
                frente: "O que é uma tupla?",
                verso: "Um array de tamanho e tipos fixos por posição, como um par de texto e número. Serve para retorno de par, como o de um hook de estado. Usada demais ela piora a leitura, porque a posição não diz o que cada valor significa.",
            },
            {
                frente: "O que é um tipo literal?",
                verso: "Um tipo que aceita um valor específico, como o texto ativo. Combinado em união, ele descreve um conjunto fechado de opções com autocompletar. É a forma mais leve de representar estado, sem precisar de enum.",
            },
            {
                frente: "O que o as const faz?",
                verso: "Congela o valor no tipo mais específico possível: literais em vez de texto, e propriedades somente leitura. É o que permite derivar uma união a partir de uma lista de constantes, mantendo um lugar só como fonte da verdade.",
            },
            {
                frente: "Quando um enum vale a pena, e o que usar no lugar?",
                verso: "Enum gera código em tempo de execução e tem regras próprias que surpreendem. Na maioria dos casos, um objeto constante com as const mais uma união de literais entrega o mesmo com menos surpresa e sem nada no pacote final.",
            },
            {
                frente: "O que é uma asserção de tipo?",
                verso: "É dizer ao compilador que você sabe mais do que ele, com a palavra as. Ela não converte nada em tempo de execução: só cala a checagem. Se a afirmação estiver errada, o erro aparece adiante, num lugar sem relação aparente.",
            },
            {
                frente: "Por que asserção de tipo é arriscada?",
                verso: "Porque desliga a única proteção que você tinha naquele ponto, e o compilador confia. Ela é aceitável na borda, logo depois de uma validação de verdade. Espalhada pelo código, ela transforma o TypeScript em comentário.",
            },
            {
                frente: "O que o operador de não nulo faz, e qual o risco?",
                verso: "A exclamação diz que o valor não é nulo nem indefinido, sem checar nada. O risco é ser mentira: o erro em tempo de execução volta, agora sem aviso do compilador. Quase sempre existe uma checagem simples que resolve melhor.",
            },
            {
                frente: "O que é encadeamento opcional?",
                verso: "O ponto de interrogação antes do acesso, que devolve indefinido em vez de quebrar quando o valor é nulo. É útil, e vira problema quando é usado para calar erro: cinco encadeamentos seguidos costumam esconder que o dado deveria existir.",
            },
            {
                frente: "Qual a diferença entre o operador de coalescência nula e o ou lógico?",
                verso: "O de coalescência só cai no valor de reserva quando o lado esquerdo é nulo ou indefinido. O ou lógico cai também com zero, texto vazio e falso. É por isso que um contador zerado vira o valor padrão quando se usa o operador errado.",
            },
            {
                frente: "O que readonly muda numa propriedade?",
                verso: "Impede reatribuir aquele campo depois de criado, na checagem de tipos. Não congela nada em tempo de execução, e não impede alterar o conteúdo de um objeto interno. É intenção documentada, e não proteção real.",
            },
            {
                frente: "Como você tipa um objeto?",
                verso: "Descrevendo suas propriedades com nome e tipo, marcando as opcionais e evitando campos genéricos demais. Um tipo com nome no domínio vale mais que um objeto anônimo repetido em cinco lugares.",
            },
            {
                frente: "O que é uma assinatura de índice?",
                verso: "É declarar que o objeto aceita qualquer chave de um tipo, como texto, com valores de um tipo. Serve para dicionário. O custo é perder o autocompletar das chaves conhecidas, e por isso Record com união de chaves costuma ser melhor.",
            },
            {
                frente: "O que são genéricos, na ideia?",
                verso: "Tipos com parâmetro: você escreve uma função ou estrutura que funciona com vários tipos, sem perder a informação. Uma função que devolve o primeiro item de uma lista devolve o tipo do item, e não algo genérico demais.",
            },
            {
                frente: "O que é o tsconfig?",
                verso: "O arquivo que diz ao compilador quais arquivos entram, quão estrito ele deve ser, para qual versão gerar e como resolver módulos. Ele é a diferença entre um projeto que pega erros de verdade e outro que só tem tipos decorativos.",
            },
            {
                frente: "O que a opção estrita liga?",
                verso: "Um conjunto de checagens, entre elas nulos estritos, proibição de any implícito e checagem de inicialização de campos. É a configuração recomendada para projeto novo, porque ligar depois numa base grande custa muito mais.",
            },
            {
                frente: "O que target e module controlam?",
                verso: "O target define a versão de JavaScript gerada, o que determina o que precisa ser transformado. O module define o formato dos imports gerados. Os dois precisam combinar com onde o código vai rodar, senão o erro aparece só na execução.",
            },
            {
                frente: "O que a opção lib controla?",
                verso: "Quais definições do ambiente estão disponíveis, como as APIs do navegador ou os recursos de uma versão da linguagem. É por isso que um método existente pode aparecer como inexistente: falta declarar a biblioteca correspondente.",
            },
            {
                frente: "Para que serve gerar arquivos de declaração?",
                verso: "Para publicar uma biblioteca com tipos sem publicar o código-fonte, permitindo que quem consome tenha autocompletar e checagem. Sem eles, quem usa o pacote cai em any, e todo o ganho do TypeScript se perde na fronteira.",
            },
            {
                frente: "O que o modo de só checar tipos faz?",
                verso: "Roda a checagem sem gerar arquivo nenhum. É o que se usa quando outra ferramenta cuida da geração, como um empacotador ou o próprio Node removendo tipos. Assim a checagem vira um passo próprio da esteira.",
            },
            {
                frente: "Como você usa uma biblioteca que não tem tipos?",
                verso: "Instalando o pacote de tipos mantido pela comunidade quando existe, ou escrevendo um arquivo de declaração mínimo com o que você usa. Deixar cair em any funciona e apaga a checagem em todo lugar que toca aquela biblioteca.",
            },
            {
                frente: "O que é um arquivo de declaração?",
                verso: "Um arquivo só com tipos, sem implementação, que descreve a forma de um módulo ou de variáveis globais. É como o TypeScript conhece bibliotecas escritas em JavaScript e o ambiente em que o código roda.",
            },
            {
                frente: "Como você tipa variáveis de ambiente?",
                verso: "Lendo todas num módulo de configuração, validando e exportando um objeto tipado. Declarar que a variável existe não a faz existir: em tempo de execução ela pode vir indefinida, e é a validação que evita a surpresa.",
            },
            {
                frente: "Como você tipa a resposta de uma requisição?",
                verso: "Declarando o tipo esperado e, na borda, validando de verdade que a resposta tem esse formato. O tipo é uma promessa sua, não do servidor: se o contrato mudar, o compilador continua feliz e o erro aparece em produção.",
            },
            {
                frente: "Qual a diferença entre importar tipo e importar valor?",
                verso: "A importação de tipo é apagada na compilação e não gera dependência em tempo de execução. Marcar explicitamente evita importar um módulo inteiro só por causa de um tipo, e evita ciclo de importação que só existe no código gerado.",
            },
            {
                frente: "O que acontece com os tipos no código gerado?",
                verso: "Somem. Anotação, interface e tipo não deixam rastro. É por isso que não existe reflexão sobre tipos e que validação em tempo de execução precisa ser escrita à parte, com uma biblioteca ou na mão.",
            },
            {
                frente: "Como você lê uma mensagem de erro do TypeScript?",
                verso: "De baixo para cima: a última linha costuma dizer qual propriedade ou tipo não bate, e o topo dá o contexto. Em erro de objeto grande, vale isolar o trecho numa variável tipada para o compilador apontar o campo exato.",
            },
            {
                frente: "O que significa dizer que o TypeScript tem tipagem estrutural?",
                verso: "Que a compatibilidade é pela forma, e não pelo nome: se o objeto tem as propriedades exigidas, ele serve, mesmo sem declarar que implementa nada. É o oposto de linguagens onde o tipo precisa ser declarado explicitamente.",
            },
            {
                frente: "Por que um objeto literal com campo a mais dá erro?",
                verso: "Por causa da checagem de propriedades em excesso, que só vale para literais atribuídos diretamente. Ela existe para pegar erro de digitação em nome de campo. Passando pela variável antes, o erro some, porque a checagem estrutural aceita.",
            },
            {
                frente: "Como você tipa uma função assíncrona?",
                verso: "Declarando o retorno como promessa do tipo real. Uma função marcada como assíncrona sempre devolve promessa, então o tipo precisa refletir isso. O erro comum é esquecer o await e acabar tratando a promessa como se fosse o valor.",
            },
            {
                frente: "Como você tipa as props de um componente?",
                verso: "Com um tipo declarado para o objeto de propriedades, marcando o que é opcional e evitando any. Isso vira documentação viva, com autocompletar em quem usa o componente. Prop booleana solta em excesso é sinal de que faltou uma união.",
            },
            {
                frente: "Como você tipa o estado de um componente?",
                verso: "Deixando inferir quando o valor inicial já diz tudo, e anotando quando ele começa vazio ou nulo. Estado que começa nulo precisa do tipo declarado como união, senão o compilador acha que ele será sempre nulo.",
            },
            {
                frente: "O que é um tipo utilitário?",
                verso: "Um tipo pronto que transforma outro, como tornar tudo opcional, escolher algumas propriedades ou remover outras. Eles evitam duplicar a definição de um objeto para cada variação, mantendo uma fonte da verdade só.",
            },
            {
                frente: "Para que servem Partial e Required?",
                verso: "Partial torna todas as propriedades opcionais, útil para atualização parcial. Required faz o contrário. Usar Partial no lugar errado esconde campo obrigatório faltando, então ele combina com atualização, e não com criação.",
            },
            {
                frente: "Para que servem Pick e Omit?",
                verso: "Pick cria um tipo com algumas propriedades do original; Omit cria com todas menos as listadas. Servem para derivar o tipo de uma resposta a partir da entidade, sem repetir campos e sem esquecer de atualizar os dois.",
            },
            {
                frente: "Como você tipa um objeto de chave e valor?",
                verso: "Com Record, informando o tipo das chaves e dos valores. Quando as chaves são conhecidas, usar uma união de literais como chave faz o compilador cobrar que todas estejam presentes, o que é melhor que uma assinatura de índice solta.",
            },
            {
                frente: "Como você tipa um evento de formulário?",
                verso: "Com o tipo de evento correspondente, informando qual elemento o disparou, para o alvo ter as propriedades certas. Sem isso, ler o valor do campo exige asserção, que é exatamente o tipo de remendo que a tipagem deveria evitar.",
            },
            {
                frente: "Como você tipa uma lista de opções para um seletor?",
                verso: "Com um array de objetos tendo valor tipado como união de literais e rótulo como texto, marcado com as const quando é constante. Assim o valor selecionado já vem estreitado, e não como texto qualquer.",
            },
            {
                frente: "O que muda ao declarar o retorno de uma função?",
                verso: "O erro passa a aparecer dentro da função, apontando o ponto que devolve algo diferente, e não em quem chama. Também impede que uma mudança interna altere o contrato sem ninguém notar.",
            },
            {
                frente: "Como você lida com um valor que pode ser nulo?",
                verso: "Checando antes de usar, o que faz o compilador estreitar o tipo dali para baixo. Encerrar cedo com um retorno costuma ler melhor que aninhar. Silenciar com asserção devolve o erro para o tempo de execução.",
            },
            {
                frente: "O que significa a mensagem de que um tipo não é atribuível a outro?",
                verso: "Que a forma esperada exige algo que o valor não tem, ou tem em formato diferente. Costuma ser propriedade faltando, opcional onde se esperava obrigatório, ou união que inclui indefinido. O detalhe do erro aponta o campo.",
            },
            {
                frente: "Como você evita repetir o mesmo tipo em vários arquivos?",
                verso: "Declarando num módulo de tipos do domínio e importando. Duplicar a mesma interface em três lugares parece inofensivo até o dia em que uma delas ganha um campo e as outras não, e o erro só aparece em tempo de execução.",
            },
            {
                frente: "Como você nomeia tipos num projeto?",
                verso: "Pelo conceito do domínio, sem prefixo nem sufixo técnico, e no singular. Nome que descreve o papel envelhece melhor que nome que descreve a estrutura, e evita ter tipos chamados dados e informação espalhados pela base.",
            },
            {
                frente: "Onde os tipos de um projeto devem viver?",
                verso: "Perto de quem os usa: tipo de domínio junto do domínio, tipo de resposta junto do cliente da API. Uma pasta central com todos os tipos vira depósito, acopla módulos que não têm relação e cresce sem ninguém revisar.",
            },
            {
                frente: "Como você tipa uma função que recebe outra função?",
                verso: "Declarando a assinatura esperada do retorno de chamada, com parâmetros e retorno. Assim quem chama recebe autocompletar dentro do lambda. Aceitar uma função genérica sem assinatura é onde o any volta pela porta dos fundos.",
            },
            {
                frente: "O que acontece se você desligar a checagem num arquivo?",
                verso: "Aquele arquivo deixa de ser verificado e passa a exportar tipos frouxos para quem depende dele. O buraco não fica contido: ele se espalha por todo mundo que importa daquele módulo.",
            },
            {
                frente: "Como você começa a usar TypeScript num projeto JavaScript?",
                verso: "Permitindo os dois formatos e convertendo arquivo por arquivo, começando pelas bordas e pelo que é compartilhado, com a checagem rodando na esteira desde o começo. Converter tudo de uma vez produz tipos frouxos que não protegem nada.",
            },
            {
                frente: "Qual a diferença entre ignorar um erro e esperar um erro?",
                verso: "A marcação de ignorar cala qualquer erro naquela linha e continua calada quando o erro sumir. A de esperar erro reclama se a linha passar a compilar, então ela avisa que o remendo não é mais necessário. Sempre que der, use a segunda.",
            },
            {
                frente: "Por que o TypeScript não impede erro em tempo de execução?",
                verso: "Porque ele checa o que você escreveu, e não o que chega. Resposta de API, leitura de arquivo e entrada do usuário podem vir diferente do declarado. A garantia acaba na borda, e é lá que precisa existir validação de verdade.",
            },
            {
                frente: "Como você tipa um valor que vem de JSON?",
                verso: "Como unknown, e validando antes de usar. O resultado da desserialização é qualquer coisa: declarar o tipo esperado é uma promessa sem verificação, e o erro só aparece quando alguém acessa um campo que não veio.",
            },
            {
                frente: "O que é autocompletar baseado em tipos, na prática?",
                verso: "O editor usando as mesmas informações do compilador para sugerir propriedade, argumento e valor possível. É o retorno mais imediato do TypeScript, e some justamente quando o código cai em any, que é quando você mais precisaria.",
            },
            {
                frente: "Como você tipa uma constante de configuração?",
                verso: "Com as const para congelar os literais e um tipo derivado dela, em vez de declarar o tipo à mão. Assim a lista de valores válidos tem um lugar só, e acrescentar um valor atualiza o tipo automaticamente.",
            },
            {
                frente: "O que significa dizer que os tipos são apagados?",
                verso: "Que nada do sistema de tipos sobrevive à compilação: nem interface, nem genérico, nem anotação. É a razão de não existir checagem em tempo de execução com base neles e de o pacote final não crescer por causa de tipagem.",
            },
        ],
        junior: [
            {
                frente: "O que é estreitamento de tipo?",
                verso: "É o compilador reduzir uma união conforme as checagens que você faz. Depois de um if que confirma que o valor é texto, dali para baixo ele é texto. É o mecanismo que torna união utilizável sem asserção.",
            },
            {
                frente: "Como o operador typeof estreita um tipo?",
                verso: "Comparando com o nome do tipo primitivo, o compilador entende o ramo. Funciona bem para texto, número, booleano e função. Para objeto ele não ajuda muito, porque nulo também é objeto, e é aí que se usa outra forma de checagem.",
            },
            {
                frente: "Quando o instanceof serve para estreitar?",
                verso: "Quando o valor é instância de uma classe, como um erro personalizado. Não funciona para interface, que não existe em tempo de execução, nem entre contextos diferentes, como dois quadros do navegador, onde o construtor não é o mesmo.",
            },
            {
                frente: "O que é um guarda de tipo definido por você?",
                verso: "Uma função que devolve booleano e declara no retorno que o argumento é de determinado tipo. O compilador passa a confiar nela para estreitar. O risco é a implementação mentir: ali a garantia é sua, e não do compilador.",
            },
            {
                frente: "O que é uma união discriminada?",
                verso: "Uma união de objetos que compartilham um campo com valor literal diferente, como tipo sucesso e tipo erro. Checar esse campo estreita para o membro certo, com os campos daquele caso disponíveis e os outros fora de alcance.",
            },
            {
                frente: "Por que união discriminada é melhor que campos opcionais?",
                verso: "Porque ela torna estados impossíveis irrepresentáveis. Com campos opcionais, dá para ter erro e dado ao mesmo tempo, ou nenhum dos dois, e todo consumidor precisa checar tudo. Com discriminante, cada caso traz exatamente o que existe nele.",
            },
            {
                frente: "Como você garante que tratou todos os casos de uma união?",
                verso: "Atribuindo o valor restante a never no ramo final. Se alguém acrescentar um caso, o compilador acusa ali. É a checagem exaustiva, e é o que transforma acrescentar uma opção nova em erro de compilação em vez de bug silencioso.",
            },
            {
                frente: "O que o operador keyof faz?",
                verso: "Devolve a união das chaves de um tipo. Serve para escrever funções que recebem o nome de uma propriedade e devolvem o tipo certo daquele campo, em vez de aceitar texto qualquer.",
            },
            {
                frente: "O que typeof faz no espaço de tipos?",
                verso: "Pega o tipo de um valor existente, como uma constante ou um objeto de configuração. Combinado com as const, é o que permite derivar a união de opções a partir da lista real, sem manter duas declarações em sincronia.",
            },
            {
                frente: "Como você acessa o tipo de uma propriedade específica?",
                verso: "Indexando o tipo com o nome da chave entre colchetes. Isso evita repetir a declaração e mantém a ligação: se o campo mudar de tipo, quem depende dele muda junto e o erro aparece na compilação.",
            },
            {
                frente: "Qual a diferença entre Record e assinatura de índice?",
                verso: "Record com união de chaves conhecidas obriga a preencher todas e mantém autocompletar. Assinatura de índice aceita qualquer chave e devolve o tipo do valor para tudo, inclusive para chave que não existe, o que esconde erro de digitação.",
            },
            {
                frente: "O que o satisfies resolve?",
                verso: "Checa que um valor obedece a um tipo sem alargar a inferência dele. Você ganha a validação do formato e mantém os literais específicos, o que é o que se quer em objeto de configuração e mapa de rotas.",
            },
            {
                frente: "Qual a diferença entre satisfies e uma asserção?",
                verso: "A asserção afirma sem checar e pode mentir. O satisfies verifica de verdade e ainda preserva o tipo inferido. Onde antes se usava asserção para calar erro em objeto de configuração, hoje satisfies faz o certo.",
            },
            {
                frente: "Por que a variável do catch é unknown?",
                verso: "Porque em JavaScript qualquer valor pode ser lançado, não só um erro. Com a opção estrita, o compilador obriga a checar antes de acessar mensagem. Tratar como erro sem checar quebra quando alguém lança um texto.",
            },
            {
                frente: "Como você trata um erro tipado no catch?",
                verso: "Checando com instanceof contra a classe de erro esperada, e tendo um caminho para o que não bate. Erro personalizado com campo discriminante também funciona bem, porque permite tratar por código em vez de por mensagem.",
            },
            {
                frente: "Como você modela o resultado de uma operação que pode falhar?",
                verso: "Com uma união discriminada de sucesso e falha, obrigando quem chama a tratar os dois. É útil quando a falha é esperada, como validação. Para o que não deveria acontecer, exceção continua sendo o caminho.",
            },
            {
                frente: "O que é uma restrição em um genérico?",
                verso: "É limitar o parâmetro de tipo com extends, exigindo que ele tenha determinada forma. Sem restrição, dentro da função você não pode fazer nada com o valor. Com ela, você acessa o que foi exigido e mantém o tipo específico de quem chamou.",
            },
            {
                frente: "Quando um genérico é desnecessário?",
                verso: "Quando o parâmetro de tipo aparece uma vez só na assinatura. Nesse caso ele não está ligando entrada e saída, e uma união ou unknown descreveria melhor. Genérico existe para preservar a relação entre o que entra e o que sai.",
            },
            {
                frente: "O que ReturnType e Parameters fazem?",
                verso: "Extraem o tipo de retorno e a tupla de parâmetros de uma função. Servem para derivar tipos de código existente sem duplicar, principalmente ao envolver uma função de biblioteca ou tipar um dublê de teste.",
            },
            {
                frente: "O que o utilitário Awaited resolve?",
                verso: "Desembrulha o tipo de dentro de uma promessa, inclusive aninhada. É o que permite derivar o tipo de dado a partir de uma função assíncrona já existente, em vez de declarar o mesmo formato duas vezes.",
            },
            {
                frente: "Qual a diferença entre um array normal e um somente leitura?",
                verso: "O somente leitura não aceita métodos que alteram, como push e sort no lugar. É o tipo certo para parâmetro que a função não deve modificar, e comunica isso a quem lê. Um array normal é atribuível a ele, mas não o contrário.",
            },
            {
                frente: "Por que Object.keys devolve um array de texto?",
                verso: "Porque um objeto em tempo de execução pode ter mais chaves do que o tipo declara, por causa da tipagem estrutural. Devolver as chaves conhecidas seria mentira. Quando você tem certeza, o caminho é uma função utilitária com asserção controlada.",
            },
            {
                frente: "Como você itera um objeto mantendo os tipos?",
                verso: "Com entradas tipadas por uma função auxiliar, ou percorrendo uma lista de chaves conhecidas derivada por keyof. O importante é ter um lugar só onde a asserção acontece, em vez de espalhar conversões pelo laço.",
            },
            {
                frente: "Como você tipa uma função que aceita várias formas de chamada?",
                verso: "Com sobrecarga, declarando as assinaturas válidas e uma implementação compatível com todas. Serve quando o retorno depende do formato dos argumentos. Se as formas são independentes, duas funções com nomes claros costumam ser melhores.",
            },
            {
                frente: "Quando união é melhor que sobrecarga?",
                verso: "Quando o retorno não muda conforme a entrada. União mantém uma assinatura só e é mais fácil de manter. Sobrecarga existe para casos em que o tipo de saída depende do tipo de entrada, e ela precisa ser mantida à mão.",
            },
            {
                frente: "Como você tipa uma classe em TypeScript?",
                verso: "Declarando os campos com seus tipos e modificadores, e usando o construtor para exigir o que é obrigatório. Parâmetro de construtor com modificador já cria a propriedade, o que reduz repetição em classes de serviço.",
            },
            {
                frente: "O que os modificadores de acesso garantem?",
                verso: "Private e protected são checados só na compilação, então nada impede o acesso em tempo de execução. Para privacidade real existe o campo com cerquilha, que é do próprio JavaScript. A diferença aparece quando alguém consome o código compilado.",
            },
            {
                frente: "O que implements faz numa classe?",
                verso: "Declara que ela deve satisfazer um contrato, e o compilador cobra. Não muda a compatibilidade estrutural: uma classe sem implements que tenha a mesma forma continua servindo. O ganho é o erro aparecer na classe, e não em quem usa.",
            },
            {
                frente: "Como você tipa uma extensão de um objeto de biblioteca?",
                verso: "Com declaração de módulo reaberta, acrescentando a propriedade ao tipo existente. É como se acrescenta o usuário autenticado ao objeto de requisição. Requer disciplina: o tipo passa a prometer algo que só existe se o middleware rodar.",
            },
            {
                frente: "O que é fusão de declarações?",
                verso: "Duas declarações do mesmo nome se combinarem, como duas interfaces com o mesmo nome virando uma. É o mecanismo que permite estender tipos de bibliotecas. Também é uma fonte de confusão quando acontece sem querer.",
            },
            {
                frente: "Como você compartilha tipos entre dois projetos?",
                verso: "Publicando um pacote de tipos versionado, ou gerando a partir de um contrato. Importar direto do outro projeto por caminho relativo acopla os dois e quebra assim que um deles for publicado sozinho.",
            },
            {
                frente: "Como você evita ciclos de importação por causa de tipos?",
                verso: "Importando com a marcação de tipo, que é apagada e não gera dependência em tempo de execução, e movendo tipos compartilhados para um módulo sem lógica. Ciclo que só existe no código gerado é dos mais difíceis de enxergar.",
            },
            {
                frente: "Como você tipa um hook próprio no React?",
                verso: "Deixando o retorno inferido quando ele é um objeto, e usando as const quando é uma tupla, para as posições não virarem união. Sem isso, desestruturar um par devolve o tipo somado dos dois em cada posição.",
            },
            {
                frente: "Como você tipa um redutor de estado?",
                verso: "Com uma união discriminada para as ações e o tipo do estado, deixando o switch estreitar cada caso. Assim cada ação carrega só os campos que fazem sentido para ela, e acrescentar uma ação sem tratar vira erro de compilação.",
            },
            {
                frente: "Como você tipa um contexto do React?",
                verso: "Criando com valor inicial indefinido e um tipo de união, e expondo um hook que lança se for usado fora do provedor. Assim o consumidor recebe o tipo já estreitado, sem precisar checar indefinido em toda tela.",
            },
            {
                frente: "Como você tipa uma referência a elemento?",
                verso: "Informando o tipo do elemento no genérico e iniciando com nulo, porque antes da montagem ela é nula. O compilador então obriga a checar antes de usar, que é exatamente o caso que quebra quando o efeito roda cedo demais.",
            },
            {
                frente: "Como você tipa children em um componente?",
                verso: "Com o tipo de nó do React, que aceita texto, elemento, lista e nulo. Tipar como elemento único recusa texto e listas, e é uma das causas mais comuns de erro em componentes de layout.",
            },
            {
                frente: "Como você tipa uma lista genérica reutilizável?",
                verso: "Com um parâmetro de tipo para o item, e as funções de renderização e de chave recebendo esse tipo. Assim quem usa mantém o autocompletar do item dentro do render, em vez de receber algo genérico demais.",
            },
            {
                frente: "Como você deriva um tipo a partir de um esquema de validação?",
                verso: "Usando o utilitário da própria biblioteca de validação, que infere o tipo do esquema. Assim existe uma fonte da verdade: a validação em tempo de execução e o tipo em tempo de compilação não podem divergir.",
            },
            {
                frente: "Por que validar se o dado já está tipado?",
                verso: "Porque o tipo não existe em tempo de execução: ele descreve o que você espera, não o que chega. Resposta de API, arquivo e formulário podem vir diferentes. Sem validação na borda, o tipo vira documentação otimista.",
            },
            {
                frente: "Como você tipa a configuração de um projeto?",
                verso: "Lendo o ambiente num módulo, validando com esquema e exportando o objeto já tipado e imutável. O resto do código importa esse objeto e nunca lê o ambiente direto, o que também deixa claro em um lugar tudo que o serviço precisa.",
            },
            {
                frente: "Como você lida com any que veio de uma biblioteca?",
                verso: "Envolvendo o uso numa função própria que declara o tipo real e valida o mínimo. Assim o any fica contido num arquivo, em vez de se espalhar por quem chama. Deixar solto contamina silenciosamente todo o fluxo.",
            },
            {
                frente: "Como você encontra any escondido numa base?",
                verso: "Ligando as regras que proíbem any implícito e as de lint que acusam expressão insegura, e olhando onde a checagem foi desligada. O any mais perigoso não é o escrito: é o herdado de biblioteca sem tipos.",
            },
            {
                frente: "O que a checagem de índice não verificado muda?",
                verso: "Acessar posição de array ou chave de dicionário passa a incluir indefinido no tipo, porque o compilador não sabe se existe. É a opção que mais expõe bug real, e também a que mais incomoda no começo, porque exige checar.",
            },
            {
                frente: "Como você tipa uma função que envolve outra preservando a assinatura?",
                verso: "Com parâmetro de tipo capturando os parâmetros e o retorno da original, usando os utilitários de função. Assim o invólucro aceita exatamente os mesmos argumentos e devolve o mesmo tipo, sem duplicar a assinatura.",
            },
            {
                frente: "O que muda com a checagem estrita de tipos de função?",
                verso: "Parâmetros passam a ser comparados de forma mais rigorosa, o que impede passar uma função que aceita menos do que o contrato promete. Métodos continuam com a regra antiga, mais frouxa, por compatibilidade com o ecossistema.",
            },
            {
                frente: "Como você tipa um dicionário de tradução?",
                verso: "Com as const na estrutura e um tipo derivado das chaves, para o compilador aceitar só chaves existentes. Assim uma chave removida quebra na compilação em vez de virar texto faltando na tela.",
            },
            {
                frente: "Como você tipa um objeto que vem parcialmente preenchido?",
                verso: "Com Partial quando é atualização, e com uma união discriminada quando o estado incompleto significa outra coisa. Marcar tudo opcional para caber nos dois casos obriga a checar cada campo em todo lugar.",
            },
            {
                frente: "Como você impede que dois identificadores de tipos diferentes sejam trocados?",
                verso: "Marcando cada um com um campo de marca invisível, criando tipos incompatíveis mesmo sendo texto por baixo. Assim passar o identificador de pedido onde se espera o de usuário vira erro de compilação, e não bug em produção.",
            },
            {
                frente: "Como você tipa valores com unidade, como milissegundos?",
                verso: "Com tipo marcado ou com um objeto que carrega a unidade, para não somar segundo com milissegundo sem perceber. O compilador não sabe o que o número significa, e esse é um erro que aparece em produção como atraso estranho.",
            },
            {
                frente: "Como você tipa o retorno de uma consulta com colunas escolhidas?",
                verso: "Derivando da entidade com Pick, ou deixando a biblioteca inferir a partir da consulta quando ela suporta. Declarar à mão duplica a definição e some da revisão quando alguém acrescenta uma coluna.",
            },
            {
                frente: "Como você tipa um emissor de eventos?",
                verso: "Com um mapa de nome do evento para a tupla de argumentos, e métodos genéricos que usam esse mapa. Assim ouvir um evento que não existe ou tratar argumento errado vira erro de compilação, em vez de retorno de chamada nunca chamado.",
            },
            {
                frente: "Como você tipa uma função que aceita um caminho de propriedade?",
                verso: "Com keyof para um nível, e com tipo literal de template para caminhos aninhados. O segundo caso é poderoso e caro: se o objeto for grande, o tipo explode e o editor fica lento. Vale medir antes de adotar.",
            },
            {
                frente: "Como você lida com a mensagem de erro enorme de um tipo genérico?",
                verso: "Isolando o trecho numa variável com o tipo esperado, para o compilador comparar coisas menores, e simplificando o genérico até o erro ficar legível. Muitas vezes a causa é um campo opcional lá no fundo da estrutura.",
            },
            {
                frente: "Como você tipa um cliente HTTP próprio?",
                verso: "Com um genérico para o corpo de resposta e validação na borda antes de devolver. O tipo declarado é uma promessa: sem validar, ele mente quando a API mudar, e o erro só aparece páginas depois.",
            },
            {
                frente: "Como você tipa erros de uma API?",
                verso: "Com uma união discriminada por código, para o consumidor tratar cada caso, e um tipo de erro genérico para o inesperado. Erro tipado só como texto obriga todo mundo a comparar mensagem, que muda sem aviso.",
            },
            {
                frente: "Como você tipa um middleware de servidor?",
                verso: "Declarando os tipos de requisição, resposta e próximo passo do próprio framework, e estendendo a requisição quando você acrescenta contexto. O cuidado é lembrar que a extensão é uma promessa: se o middleware não rodar, o campo não existe.",
            },
            {
                frente: "Como você lida com bibliotecas que ainda usam decoradores antigos?",
                verso: "Verificando qual proposta a biblioteca segue, porque a versão do padrão e a antiga têm comportamento e configuração diferentes. Misturar as duas no mesmo projeto produz erro difícil de interpretar na inicialização.",
            },
            {
                frente: "Como você tipa um valor de enumeração vindo do banco?",
                verso: "Com união de literais espelhando os valores, e validação ao ler, porque o banco pode ter algo que o código não conhece. Confiar na conversão direta é o que faz uma linha antiga quebrar a aplicação inteira.",
            },
            {
                frente: "Como você testa que um tipo se comporta como esperado?",
                verso: "Com testes de tipo: atribuições que devem compilar e outras marcadas com a expectativa de erro. Isso vale para biblioteca e para tipos utilitários complexos, onde uma mudança pode afrouxar tudo sem quebrar nenhum teste comum.",
            },
            {
                frente: "Como você lida com um erro de tipo dentro de uma dependência?",
                verso: "Pulando a checagem dos arquivos de declaração das dependências, que é o padrão em muitos projetos, e abrindo questão no repositório dela. A opção esconde erro real de compatibilidade, então vale saber que ela está ligada.",
            },
            {
                frente: "Como você organiza os tipos de uma API que o front consome?",
                verso: "Gerando a partir do contrato quando ele existe, ou publicando um pacote de tipos versionado. E validando na borda mesmo assim. Copiar as interfaces para o front funciona por um tempo e diverge na primeira mudança.",
            },
            {
                frente: "Como você tipa um formulário com muitos campos?",
                verso: "Derivando do esquema de validação, para não manter duas listas. A tipagem do formulário e a validação precisam ser a mesma fonte, senão o campo novo aparece num lado e não no outro, e ninguém percebe até o envio falhar.",
            },
            {
                frente: "Como você lida com um tipo que é quase igual a outro?",
                verso: "Derivando com Pick, Omit ou interseção em vez de copiar. Duplicar parece mais simples, e o custo aparece quando o original muda: uma das cópias fica para trás e o compilador não avisa, porque as duas são válidas.",
            },
            {
                frente: "Como você declara um módulo que não tem tipos?",
                verso: "Com um arquivo de declaração informando o nome do módulo e o que você usa dele. Declarar como any resolve o erro e apaga a checagem; declarar as funções usadas custa poucos minutos e mantém a segurança.",
            },
            {
                frente: "Como você tipa uma função que devolve tipos diferentes conforme uma opção?",
                verso: "Com sobrecarga ou com tipo condicional sobre o parâmetro. Antes disso, vale perguntar se não são duas funções: assinatura que muda de retorno conforme uma bandeira booleana costuma ser difícil de usar e de manter.",
            },
            {
                frente: "Como você evita que um objeto de configuração aceite chave errada?",
                verso: "Tipando com um Record de chaves conhecidas ou usando satisfies contra um tipo que descreve o formato. Assim uma chave com erro de digitação vira erro de compilação, em vez de opção ignorada em silêncio.",
            },
            {
                frente: "Como você lida com valores que só existem em certos ambientes?",
                verso: "Declarando o tipo como possivelmente ausente e tratando, em vez de assumir presença. Aquilo que existe só no navegador ou só no servidor precisa de fronteira explícita, senão o código quebra do outro lado sem aviso do compilador.",
            },
            {
                frente: "Como você tipa uma função de comparação para ordenação?",
                verso: "Recebendo dois itens do mesmo tipo e devolvendo número. Quando a ordenação é por campo, um genérico com keyof garante que só campos existentes sejam aceitos, e evita ordenar por um nome que ninguém percebeu estar errado.",
            },
            {
                frente: "O que muda quando você marca uma propriedade como opcional e quando você inclui indefinido no tipo?",
                verso: "Opcional permite a chave não existir. Incluir indefinido exige a chave, aceitando o valor indefinido. Na maioria dos casos a diferença é irrelevante, e ela passa a importar quando a opção estrita de propriedades opcionais está ligada.",
            },
        ],
        pleno: [
            {
                frente: "O que são tipos condicionais?",
                verso: "Tipos que escolhem um resultado conforme uma relação entre outros, na forma se estende então senão. É o que permite descrever transformações genéricas, como desembrulhar uma promessa. Usado demais, produz tipo que ninguém consegue depurar.",
            },
            {
                frente: "Como o infer funciona?",
                verso: "Dentro de um tipo condicional, ele captura uma parte do tipo comparado e dá um nome a ela, como o elemento de um array. É assim que utilitários extraem retorno e parâmetros de uma função sem você declarar nada.",
            },
            {
                frente: "O que são tipos mapeados?",
                verso: "Tipos que percorrem as chaves de outro e produzem um novo, aplicando modificadores. É a base de Partial, Required e Readonly. Também permitem renomear chaves e filtrar propriedades por tipo, o que resolve muita duplicação.",
            },
            {
                frente: "Como você remove a opcionalidade de propriedades num tipo mapeado?",
                verso: "Com o modificador de menos aplicado à interrogação, que tira o opcional. O mesmo vale para readonly. É o que permite escrever o inverso de Partial e derivar o tipo completo a partir de um parcial.",
            },
            {
                frente: "O que são tipos literais de template?",
                verso: "Tipos que compõem texto a partir de outros tipos, como prefixo mais chave. Permitem descrever nomes de eventos e caminhos de propriedade com precisão. O custo é explosão combinatória: com muitas chaves, o tipo fica pesado para o compilador.",
            },
            {
                frente: "Quando um tipo avançado deixa de valer a pena?",
                verso: "Quando ninguém no time consegue mudá-lo com segurança, quando a mensagem de erro que ele produz é ilegível, ou quando ele deixa o editor lento. Tipo é código: se o custo de manutenção passa do risco que ele evita, ele não paga.",
            },
            {
                frente: "Como você depura um tipo complexo?",
                verso: "Quebrando em passos nomeados e inspecionando cada um no editor, e usando um utilitário que expande a estrutura para leitura. Trabalhar com um exemplo concreto pequeno vale mais que olhar o genérico inteiro.",
            },
            {
                frente: "O que é variância, e por que ela importa?",
                verso: "É como a compatibilidade de um tipo composto segue a dos tipos que ele contém. Retorno é covariante e parâmetro deveria ser contravariante. Onde a linguagem afrouxa isso, por compatibilidade histórica, surgem buracos que o compilador aceita.",
            },
            {
                frente: "Por que atribuir um array de um subtipo pode ser inseguro?",
                verso: "Porque arrays são tratados como covariantes: um array de gato passa onde se espera array de animal, e alguém pode inserir um cachorro nele. É um buraco conhecido, herdado por praticidade, e a defesa é usar array somente leitura em parâmetros.",
            },
            {
                frente: "Por que a checagem de propriedade em excesso não pega tudo?",
                verso: "Porque ela só vale para objeto literal atribuído diretamente. Passando por uma variável intermediária, a compatibilidade estrutural aceita o campo a mais. É por isso que o mesmo objeto dá erro num lugar e passa no outro.",
            },
            {
                frente: "Como você modela estados impossíveis fora do sistema?",
                verso: "Trocando conjuntos de booleanas e campos opcionais por uma união discriminada em que cada caso carrega só o que existe nele. Assim carregando com erro preenchido deixa de compilar, em vez de virar bug de tela.",
            },
            {
                frente: "Como você tipa uma máquina de estados?",
                verso: "Com uma união de estados, uma união de eventos e uma função de transição que só aceita combinações válidas. Tipos condicionais permitem cobrar que um evento só seja aceito em certos estados, o que elimina uma classe inteira de bug.",
            },
            {
                frente: "Como você geraria tipos a partir de um contrato de API?",
                verso: "Com um gerador a partir da especificação, rodando na esteira e falhando se o arquivo gerado estiver desatualizado. Isso mantém front e backend em sincronia sem trabalho manual, e transforma quebra de contrato em erro de compilação.",
            },
            {
                frente: "Quando gerar tipos é melhor que escrever à mão?",
                verso: "Quando existe uma fonte da verdade externa, como esquema de API ou de banco, e ela muda com frequência. Escrever à mão duplica e diverge. O custo do gerado é ter mais um passo de build e código versionado que ninguém edita.",
            },
            {
                frente: "Como você mantém tipo e validação em tempo de execução em sincronia?",
                verso: "Declarando o esquema uma vez e derivando o tipo dele, e não o contrário. Assim não existe a possibilidade de o tipo dizer uma coisa e a validação aceitar outra, que é o problema clássico de manter os dois à mão.",
            },
            {
                frente: "Como você escreveria um arquivo de declaração para uma biblioteca?",
                verso: "Declarando o módulo pelo nome e exportando só o que você usa, com tipos honestos. Começar mínimo e crescer conforme o uso é melhor que tentar descrever a biblioteca inteira e errar assinaturas que você nunca chamou.",
            },
            {
                frente: "Como você publica um pacote com tipos corretos?",
                verso: "Gerando as declarações, apontando o campo de tipos, declarando as entradas no mapa de exportações e testando o consumo em um projeto com cada configuração de módulos. Muita biblioteca quebra justamente na combinação que ninguém testou.",
            },
            {
                frente: "O que o mapa de exportações do package.json controla?",
                verso: "Quais caminhos internos podem ser importados e qual arquivo responde a cada formato de módulo, incluindo as declarações. É o que evita alguém importar caminho interno seu e ficar dependente de detalhe de implementação.",
            },
            {
                frente: "Como você suporta os dois formatos de módulo numa biblioteca?",
                verso: "Gerando dois artefatos e declarando cada um no mapa de exportações, com declarações de tipo compatíveis com os dois. É trabalhoso, e por isso muitas bibliotecas hoje publicam só o formato padrão e cobram isso de quem consome.",
            },
            {
                frente: "O que a resolução de módulos do TypeScript decide?",
                verso: "Como um caminho de importação vira arquivo: se aceita extensão, como lê o mapa de exportações e quais declarações encontra. É a fonte mais comum de erro em que o editor acha o módulo e a execução não, ou o contrário.",
            },
            {
                frente: "Como você organiza referências de projeto num repositório grande?",
                verso: "Dividindo em projetos com dependências declaradas, para a checagem ser incremental e respeitar fronteiras. O ganho é build parcial e erro quando alguém importa através de uma fronteira que não deveria existir.",
            },
            {
                frente: "Como você mediria o tempo de checagem de tipos?",
                verso: "Com o diagnóstico estendido do compilador, que mostra tempo por fase e quantidade de tipos criados. Isso separa projeto grande de tipo caro. Sem medir, a resposta padrão vira comprar máquina melhor.",
            },
            {
                frente: "O que costuma deixar a checagem de tipos lenta?",
                verso: "Tipos condicionais profundos, literais de template combinando muitas chaves, uniões enormes e bibliotecas com declarações gigantes. Também importar tudo de um pacote em vez do subcaminho. Poucos pontos costumam responder pela maior parte do tempo.",
            },
            {
                frente: "Como você lida com um tipo recursivo que estoura o limite?",
                verso: "Limitando a profundidade com um contador de tipo, simplificando o formato ou aceitando um tipo menos preciso. Quando um tipo precisa de truques para não estourar, normalmente existe uma modelagem mais simples do problema.",
            },
            {
                frente: "Quando interface tem vantagem sobre type por desempenho?",
                verso: "Em objetos grandes que são estendidos, porque interfaces são armazenadas de forma incremental, e interseções de type precisam ser recalculadas. A diferença só aparece em projeto grande, e aí é uma otimização barata de aplicar.",
            },
            {
                frente: "Como você adotaria uma opção estrita nova numa base grande?",
                verso: "Ligando em um pacote ou pasta por vez, com uma lista do que falta, e cobrando na esteira só o que já foi migrado. Ligar tudo de uma vez gera milhares de erros e o time desliga de novo na semana seguinte.",
            },
            {
                frente: "O que a opção que pula a checagem de bibliotecas faz?",
                verso: "Ignora erros dentro dos arquivos de declaração das dependências, o que acelera muito a checagem e esconde incompatibilidade real entre versões de tipos. Quase todo projeto liga, e vale saber que ela está ligada quando algo estranho aparece.",
            },
            {
                frente: "Como você usa TypeScript no Node sem passo de compilação?",
                verso: "Deixando o Node remover os tipos na execução, o que funciona para sintaxe que só some. O ponto crítico é que isso não checa nada: a checagem continua sendo um passo próprio, e sem ela o projeto só tem anotação decorativa.",
            },
            {
                frente: "Qual o risco de rodar sem checagem no ciclo de desenvolvimento?",
                verso: "O erro de tipo só aparece na esteira, ou nem aparece se ninguém rodar. O editor ajuda, mas não bloqueia. Por isso a checagem precisa estar num gancho ou na esteira obrigatória, e não na disciplina de cada pessoa.",
            },
            {
                frente: "Como você configura apelidos de caminho sem quebrar em execução?",
                verso: "Garantindo que a ferramenta que executa ou empacota resolva os mesmos apelidos do compilador. O TypeScript só entende no nível de tipos: se o gerador não reescrever o caminho, o módulo não é encontrado em tempo de execução.",
            },
            {
                frente: "Como você tipa um contêiner de injeção de dependência?",
                verso: "Com um mapa de tokens para tipos, e uma função de resolução genérica sobre esse mapa. Assim pedir uma dependência devolve o tipo certo e um token inexistente vira erro. Sem isso, o contêiner devolve any e apaga a tipagem do serviço inteiro.",
            },
            {
                frente: "Como você tipa consultas dinâmicas a um banco?",
                verso: "Com construtor de consultas que infere o resultado a partir das colunas escolhidas, quando a biblioteca oferece. Quando não, declarando o tipo do retorno perto da consulta e validando. Concatenar texto e declarar any é onde o erro escapa.",
            },
            {
                frente: "Como você lida com tipos gerados versionados no repositório?",
                verso: "Gerando na esteira e falhando se o resultado diferir do que está versionado. Assim o arquivo continua disponível para o editor e ninguém o edita à mão sem ser pego. Gerar sem checar leva a arquivo desatualizado por meses.",
            },
            {
                frente: "Como você garante compatibilidade de tipos entre versões de uma biblioteca?",
                verso: "Com testes de tipo que devem continuar compilando, e revisão do que muda em assinatura pública. Tipo faz parte do contrato: afrouxar ou estreitar um parâmetro quebra quem consome sem mudar uma linha de comportamento.",
            },
            {
                frente: "Como você trataria uma mudança que quebra tipos de consumidores internos?",
                verso: "Anunciando com prazo, oferecendo o tipo antigo marcado como obsoleto por uma versão e mostrando o caminho de migração. Quebra de tipo é quebra de contrato, mesmo que o código continue rodando igual.",
            },
            {
                frente: "Como você organiza tipos num monorepo?",
                verso: "Cada pacote publicando os seus, e um pacote comum só para o que é realmente compartilhado, como contratos. Um pacote de tipos que todo mundo importa vira ponto de acoplamento e faz qualquer mudança recompilar tudo.",
            },
            {
                frente: "Como você evitaria que todo o monorepo recompile a cada mudança?",
                verso: "Com referências de projeto, build incremental e cache por hash das entradas. Também limitando dependências entre pacotes. Sem isso, o custo cresce até o ponto em que ninguém roda a checagem completa localmente.",
            },
            {
                frente: "Como você lida com o editor ficando lento num projeto TypeScript?",
                verso: "Medindo o que o serviço de linguagem gasta, procurando tipos caros e importações amplas, e dividindo em projetos menores. Autocompletar lento faz as pessoas ignorarem os tipos, e aí a linguagem perde justamente o que ela dá de melhor.",
            },
            {
                frente: "Como você tipa uma função que aceita configuração parcial com padrões?",
                verso: "Recebendo o tipo parcial e devolvendo o completo depois de aplicar os padrões, para o resto do código não precisar checar opcionais. O erro comum é manter o tipo parcial circulando e checar indefinido em todo lugar.",
            },
            {
                frente: "Como você lida com dados legados sem formato definido?",
                verso: "Tipando como unknown na entrada e passando por uma camada de validação e conversão que produz o tipo novo. Assim a bagunça fica contida num arquivo, e o resto do sistema trabalha com um formato honesto.",
            },
            {
                frente: "Como você trata a diferença entre o tipo do banco e o tipo do domínio?",
                verso: "Mantendo os dois e convertendo na fronteira do repositório. Usar o tipo gerado pelo banco no domínio inteiro faz cada mudança de coluna atravessar a aplicação, e ainda coloca detalhes de persistência dentro da regra de negócio.",
            },
            {
                frente: "Como você tipa um sistema de eventos entre módulos?",
                verso: "Com um mapa central de evento para carga útil, e funções de publicação e assinatura genéricas sobre esse mapa. Assim publicar um evento com carga errada não compila, e o mapa vira a documentação do que trafega entre os módulos.",
            },
            {
                frente: "Como você tipa mensagens de uma fila?",
                verso: "Com uma união discriminada por tipo de mensagem, validada na leitura porque a mensagem pode ter sido publicada por outra versão. Tipo sozinho não protege de mensagem antiga na fila, que é o caso mais comum de erro em consumo.",
            },
            {
                frente: "Como você lida com versões de mensagens mudando ao longo do tempo?",
                verso: "Com campo de versão no formato e um tipo por versão, convertendo as antigas para a atual na entrada. Assim o consumidor trabalha com uma forma só. Sem isso, cada consumidor aprende a lidar com todas as versões por conta própria.",
            },
            {
                frente: "Como você usa JSDoc junto com TypeScript?",
                verso: "Para documentar intenção, exemplos e o que não é óbvio na assinatura, e não para repetir os tipos. Em projeto JavaScript, o JSDoc também consegue tipar de verdade, com a checagem ligada, o que é um caminho de adoção sem mudar extensão.",
            },
            {
                frente: "Como você documenta um tipo público?",
                verso: "Com comentário sobre o que ele representa no domínio e o que cada campo significa quando o nome não basta, e marcando o que está obsoleto. O editor mostra isso no autocompletar, que é onde quem consome de fato lê.",
            },
            {
                frente: "Como você lida com uma dependência cujos tipos estão errados?",
                verso: "Corrigindo localmente com uma declaração própria que sobrescreve, ou envolvendo o uso, e mandando correção para o repositório de tipos. Asserção espalhada resolve na hora e deixa a base cheia de remendo sem rastro do motivo.",
            },
            {
                frente: "Como você lida com o mesmo tipo definido em dois pacotes?",
                verso: "Escolhendo um dono e fazendo o outro importar. Dois tipos estruturalmente iguais são compatíveis, então o problema não aparece de imediato: ele aparece quando um deles muda e o outro não, e ninguém sabe qual é o certo.",
            },
            {
                frente: "Como você tipa um invólucro de cache genérico?",
                verso: "Com parâmetro de tipo para o valor e chave tipada, e o método de obter devolvendo o tipo do valor ou indefinido. O erro comum é devolver any para servir a todos os casos, o que anula a segurança de quem usa.",
            },
            {
                frente: "Como você tipa uma resposta paginada?",
                verso: "Com um genérico sobre o item e campos de cursor ou total, usado por todos os endpoints de listagem. Assim o formato é único e uma mudança de paginação atinge um tipo só, em vez de vinte declarações espalhadas.",
            },
            {
                frente: "Como você impede que o front use um campo interno da API?",
                verso: "Devolvendo um tipo de saída explícito, derivado da entidade com Omit, em vez do registro inteiro. Assim o campo interno nem existe no contrato, e acrescentar uma coluna no banco não vaza dado sem ninguém notar.",
            },
            {
                frente: "Como você tipa código que roda no navegador e no servidor?",
                verso: "Separando por pacote ou por arquivo, com as bibliotecas de ambiente declaradas corretamente em cada um. Misturar faz o compilador aceitar objetos do navegador no servidor, e o erro aparece só na execução.",
            },
            {
                frente: "Como você trataria uma função com dez parâmetros opcionais?",
                verso: "Trocando por um objeto de opções tipado, o que dá nome a cada valor e evita passar na ordem errada. Com união discriminada dá para tornar impossíveis as combinações que não fazem sentido, o que a lista de parâmetros nunca consegue.",
            },
            {
                frente: "Como você garante que um valor lido do ambiente é de um conjunto fechado?",
                verso: "Validando contra uma lista com uma função que estreita o tipo, e falhando na subida quando não bate. Declarar o tipo como união sem validar é a forma mais comum de acreditar que uma variável está certa quando ela está vazia.",
            },
            {
                frente: "Como você tipa uma função que altera o objeto recebido?",
                verso: "Deixando explícito no nome e no tipo, evitando readonly no parâmetro, ou preferindo devolver um objeto novo. Função que altera o argumento e também devolve algo é a que mais confunde quem lê, porque parece pura e não é.",
            },
            {
                frente: "Como você lida com bibliotecas que exigem configuração experimental do compilador?",
                verso: "Isolando o uso e verificando o custo: opção experimental pode mudar entre versões e travar a atualização do compilador. Quando o recurso é central para a biblioteca, isso vira uma dependência de longo prazo que precisa ser decidida em time.",
            },
            {
                frente: "Como você trataria um utilitário de tipos caseiro que virou peça central?",
                verso: "Documentando, cobrindo com testes de tipo e reduzindo ao mínimo necessário, ou trocando por um da biblioteca padrão de utilitários que o time já usa. Tipo complexo sem teste é a parte da base que ninguém ousa mudar.",
            },
            {
                frente: "Como você lida com o compilador aceitando algo que quebra em execução?",
                verso: "Assumindo que houve asserção, any ou dado externo não validado. O caminho é achar a fronteira em que a garantia se perdeu e colocar validação ali, em vez de espalhar checagem defensiva por todo o fluxo.",
            },
            {
                frente: "Como você reduziria o uso de asserções numa base?",
                verso: "Trocando por satisfies em configuração, por guardas em estreitamento e por validação na borda. Depois medindo quantas restaram e onde. A maior parte das asserções existe porque falta uma validação, e não porque o tipo é impossível.",
            },
            {
                frente: "Como você tipa uma tabela de rotas com parâmetros?",
                verso: "Com literais de template extraindo os parâmetros do caminho, para a função de navegação exigir exatamente os que a rota tem. É um caso em que o tipo avançado paga, porque link quebrado passa a não compilar.",
            },
            {
                frente: "Como você lida com a checagem de tipos demorando na esteira?",
                verso: "Rodando em paralelo com o resto, usando build incremental com cache entre execuções e dividindo por pacote. Se ainda assim demora, o problema costuma ser um tipo caro específico, e vale medir antes de aceitar como custo fixo.",
            },
            {
                frente: "Como você impediria que um pacote importe de outro que não deveria?",
                verso: "Com referências de projeto declarando as dependências permitidas, mais uma regra de lint de fronteira. A checagem por si já reclama quando não há referência, e é a forma mais barata de manter arquitetura em repositório grande.",
            },
            {
                frente: "Como você tipa retorno de uma função que pode devolver nada?",
                verso: "Com união incluindo indefinido ou nulo, escolhendo um só e sendo consistente na base inteira. Misturar os dois obriga quem chama a checar as duas coisas, e é uma das inconsistências mais comuns em projeto grande.",
            },
            {
                frente: "Como você lida com um tipo que precisa aceitar extensão pelo consumidor?",
                verso: "Com genérico que permite acrescentar campos, ou com interface que pode ser estendida. O cuidado é não abrir mais do que o necessário: tipo aberto demais vira contrato impossível de evoluir sem quebrar alguém.",
            },
            {
                frente: "Como você trataria a checagem de tipos em arquivos de teste?",
                verso: "Com a mesma rigidez do código de produção, e não com uma configuração frouxa. Teste com any esconde mudança de contrato, e o dublê deixa de refletir a assinatura real, que é justamente o que ele deveria garantir.",
            },
            {
                frente: "Como você tipa dublês de teste sem duplicar a interface?",
                verso: "Derivando do tipo real com utilitários, para o dublê quebrar quando a assinatura mudar. Escrever o dublê à mão com forma própria faz o teste continuar passando depois de uma mudança que quebra a produção.",
            },
            {
                frente: "Como você lidaria com um arquivo enorme sem tipos numa migração?",
                verso: "Deixando por último, com a checagem menos rígida só nele e uma anotação registrando o motivo, enquanto o resto avança. Tentar converter o pior arquivo primeiro é como migrações param na primeira semana.",
            },
            {
                frente: "Como você definiria o que é um arquivo migrado de verdade?",
                verso: "Sem any explícito, sem asserção sem justificativa, sem marcação de erro ignorado e com as bordas validadas. Renomear a extensão e calar os erros conta como migrado no relatório e não entrega nenhuma segurança.",
            },
            {
                frente: "Como você avaliaria trocar o compilador por uma ferramenta mais rápida?",
                verso: "Separando os dois papéis: gerar código e checar tipos. Ferramentas rápidas costumam só remover tipos, então a checagem continua precisando do compilador em algum passo. Trocar sem manter esse passo entrega build rápido e nenhuma garantia.",
            },
            {
                frente: "Como você mediria o progresso de segurança de tipos numa base?",
                verso: "Contando any explícitos e implícitos, asserções, marcações de erro ignorado e arquivos fora da checagem estrita, e acompanhando a tendência. Número absoluto importa menos que a direção e que impedir a entrada de casos novos.",
            },
        ],
        senior: [
            {
                frente: "Como você conduziria a adoção de TypeScript num time que só escreveu JavaScript?",
                verso: "Ligando a checagem na esteira desde o primeiro arquivo, convertendo por borda e por módulo compartilhado, com regras estritas chegando aos poucos. E mostrando ganho cedo, em contrato de API e refatoração, que é onde a diferença é sentida.",
            },
            {
                frente: "Como você mediria se a adoção de TypeScript valeu a pena?",
                verso: "Por defeito que deixou de chegar em produção naquela classe de erro, tempo de refatoração e quantidade de correção emergencial por campo inexistente. Contar arquivos convertidos mede esforço, não resultado.",
            },
            {
                frente: "Como você definiria a política de any de um time?",
                verso: "Proibido por padrão na esteira, permitido com comentário justificando e prazo, e sempre contido numa fronteira. O que mata uma base é o any implícito vindo de biblioteca, então a regra precisa cobrir isso e não só o escrito à mão.",
            },
            {
                frente: "Como você trataria marcações de erro ignorado espalhadas pela base?",
                verso: "Trocando pela variante que reclama quando o erro some, contando quantas existem e impedindo novas na esteira. Depois atacando por área. Cada uma delas é um lugar onde alguém sabia que estava errado e não teve tempo, e isso precisa de rastro.",
            },
            {
                frente: "Como você decidiria o nível de rigor da configuração?",
                verso: "Projeto novo nasce no modo estrito, com as opções extras que doem menos primeiro. Base existente sobe por etapa, com meta e prazo. Rigor que o time desliga na primeira semana é pior que rigor menor sustentado.",
            },
            {
                frente: "Como você revisaria um PR cheio de tipos elaborados?",
                verso: "Perguntando qual erro real cada tipo evita e se alguém do time consegue mudá-lo daqui a seis meses. Depois olhando a mensagem de erro que ele produz. Tipo que exige o autor para ser alterado é gargalo, não segurança.",
            },
            {
                frente: "Como você ensinaria TypeScript a quem vem de JavaScript?",
                verso: "Pelo que resolve problema do dia, na ordem: união e estreitamento, tipar bordas, e depois genéricos. Deixando tipos avançados para quando aparecer necessidade. Começar por tipos condicionais é a forma mais rápida de o time achar que TypeScript atrapalha.",
            },
            {
                frente: "Como você lidaria com alguém do time que considera TypeScript um estorvo?",
                verso: "Escutando onde ele estorva de verdade, porque costuma ser configuração ruim, tipos elaborados demais ou biblioteca mal tipada. Corrigindo isso, a resistência some. Impor regra sem resolver o incômodo produz any com comentário irônico.",
            },
            {
                frente: "Onde o sistema de tipos não protege, e o que fazer?",
                verso: "Em tudo que atravessa a fronteira do processo: rede, arquivo, banco, entrada do usuário, variável de ambiente. Ali é preciso validação em tempo de execução. O tipo é acordo interno; a borda é o único lugar onde ele pode ser verificado.",
            },
            {
                frente: "Como você garantiria que toda borda do sistema é validada?",
                verso: "Concentrando as entradas em poucas funções, com esquema declarado e tipo derivado, e regra de lint impedindo desserialização crua fora delas. Validação espalhada é validação esquecida em algum ponto novo.",
            },
            {
                frente: "Como você escolheria entre tipos gerados e escritos à mão?",
                verso: "Gerados quando existe fonte da verdade externa e ela muda; escritos quando o tipo expressa uma decisão de domínio. Gerar tudo produz nomes ruins e acopla o domínio ao banco. Escrever tudo diverge do contrato na primeira mudança.",
            },
            {
                frente: "Como você trataria o contrato de tipos entre dois times?",
                verso: "Como produto: pacote versionado ou geração a partir da especificação, com prazo de descontinuação e teste de contrato. Combinar formato por conversa e cada lado declarar o seu é o que gera integração que só quebra em produção.",
            },
            {
                frente: "Como você lidaria com uma API de terceiro sem contrato publicado?",
                verso: "Escrevendo o tipo do que você usa, validando na borda e cobrindo com um teste contra o ambiente real fora do caminho crítico. Assim mudança silenciosa do fornecedor aparece como falha de teste, e não como erro do usuário.",
            },
            {
                frente: "Como você conduziria a atualização da versão do compilador?",
                verso: "Lendo as mudanças de comportamento, subindo numa branch e medindo quantos erros novos aparecem, porque versão nova costuma ser mais rigorosa. Isso é ganho, e precisa de tempo alocado, senão o time trava numa versão antiga por anos.",
            },
            {
                frente: "Como você avaliaria adotar a versão nativa do compilador?",
                verso: "Pelo ganho medido de tempo de checagem e resposta do editor no seu projeto, e pelo custo de acompanhar recurso ainda não portado e ferramentas que dependem da interface antiga. Vale medir antes, e manter caminho de volta.",
            },
            {
                frente: "Como você padronizaria a configuração de TypeScript entre projetos?",
                verso: "Com uma configuração base publicada como pacote, e cada projeto estendendo com o mínimo. Assim endurecer uma regra é uma mudança de versão, e não vinte PRs. E fica visível quem se desviou do padrão e por quê.",
            },
            {
                frente: "Como você organizaria um monorepo com muitos pacotes TypeScript?",
                verso: "Com referências de projeto, fronteiras declaradas, build incremental com cache e um pacote comum pequeno. O sinal de que deu errado é a checagem completa demorar tanto que ninguém roda antes de abrir o PR.",
            },
            {
                frente: "Como você evitaria acoplamento excessivo por tipos compartilhados?",
                verso: "Compartilhando só contrato de fronteira, e deixando cada módulo com seu tipo interno. Tipo compartilhado é dependência: quando todo mundo importa do mesmo pacote, qualquer mudança nele obriga a recompilar e revisar o repositório inteiro.",
            },
            {
                frente: "Como você lidaria com o mesmo conceito tipado de três formas por times diferentes?",
                verso: "Escolhendo um dono e um tipo canônico, com os outros importando, e prazo para a migração. Antes disso vale entender se são mesmo o mesmo conceito, porque às vezes o que parece duplicação são visões legítimas e diferentes.",
            },
            {
                frente: "Como você trataria o custo de checagem crescendo na esteira?",
                verso: "Medindo por fase, dividindo em projetos e atacando os tipos caros, em vez de aceitar como custo fixo ou desligar a checagem. Esteira lenta acaba levando alguém a propor pular a checagem em PR, que é onde ela mais serve.",
            },
            {
                frente: "Como você lidaria com dívida de tipos frouxos numa base grande?",
                verso: "Congelando o que existe com uma linha de base e impedindo casos novos, depois reduzindo por área com meta. Assim o número só cai. Mutirão de tipagem sem trava de entrada devolve o mesmo problema em alguns meses.",
            },
            {
                frente: "Como você priorizaria onde endurecer os tipos primeiro?",
                verso: "Onde o defeito dói: fluxo de dinheiro, autenticação e integração com terceiros. Depois no código mais alterado. Endurecer tipo em módulo estável que ninguém toca dá número bonito e nenhum ganho de segurança.",
            },
            {
                frente: "Como você lidaria com um time que confia demais nos tipos?",
                verso: "Mostrando com um caso real: dado de API mudando e o compilador feliz. Isso muda a conversa mais rápido que argumento. Tipo substitui uma classe de teste, e não os testes de comportamento nem a validação de borda.",
            },
            {
                frente: "O que os tipos substituem em teste, e o que não?",
                verso: "Substituem os testes que só checariam formato e presença de campo. Não substituem teste de regra, de integração e de caso de borda. Time que corta testes porque adotou tipagem troca uma proteção por outra e acha que somou.",
            },
            {
                frente: "Como você usaria lint junto com o compilador?",
                verso: "O compilador cuida de tipo, o lint cuida de padrão e de uso perigoso que compila, como promessa sem await, any escapando e comparação suspeita. As regras que usam informação de tipo são as mais valiosas, e também as mais lentas.",
            },
            {
                frente: "O que o lint pega que o compilador não pega?",
                verso: "Promessa criada e não aguardada, retorno ignorado, encadeamento opcional inútil, uso de any vindo de biblioteca e convenções do time. São coisas válidas para a linguagem e erradas para o projeto, que é justamente o espaço do lint.",
            },
            {
                frente: "Como você trataria uma regra de lint que o time ignora sistematicamente?",
                verso: "Ou removendo, ou corrigindo a base e tornando obrigatória. Regra que só gera aviso ignorado ensina o time a ignorar todos os avisos. A pergunta honesta é se ela evita um erro real ou se é gosto de quem configurou.",
            },
            {
                frente: "Como você lidaria com partes do projeto que continuam em JavaScript?",
                verso: "Ligando a checagem sobre elas com JSDoc, que já entrega boa parte do ganho, ou isolando com fronteira tipada. O pior cenário é JavaScript sem checagem exportando any para módulos tipados, o que apaga a segurança de quem importa.",
            },
            {
                frente: "Como você garantiria tipos em scripts e código de infraestrutura?",
                verso: "Tratando como código de produção: mesma configuração, mesma checagem na esteira. Script de migração e de infraestrutura roda em produção com poder alto, e é justamente onde costuma se aceitar any e improviso.",
            },
            {
                frente: "Como você usaria tipos para impedir erro de negócio?",
                verso: "Tornando impossível representar o estado inválido: identificadores marcados, união discriminada em vez de campos opcionais, e tipo que exige o passo anterior. É a diferença entre o compilador dizer não e uma revisão esperar que alguém perceba.",
            },
            {
                frente: "Quando você aceitaria abrir mão de tipagem forte?",
                verso: "Em protótipo com data para morrer, em script isolado e em fronteira com biblioteca mal tipada, sempre contido e com comentário. O que não pode é a exceção virar padrão sem ninguém registrar por que ela existiu.",
            },
            {
                frente: "Como você trataria uma contribuição externa que afrouxa tipos?",
                verso: "Explicando o padrão na revisão com o motivo, e oferecendo o caminho certo em vez de só recusar. Se o afrouxamento é sintoma de tipo difícil de usar, o problema é o tipo, e a contribuição está apontando isso.",
            },
            {
                frente: "Como você decidiria criar um pacote de tipos compartilhado?",
                verso: "Quando o mesmo contrato é usado por três ou mais projetos e muda com frequência. Antes disso, duplicar custa menos que manter versão e publicação. Pacote de tipos criado cedo demais vira dependência que todo mundo precisa esperar.",
            },
            {
                frente: "Como você lidaria com a expectativa de que tipos deixam o código mais lento?",
                verso: "Mostrando que eles somem na compilação e não afetam o que roda. O custo é tempo de checagem e de build, e ele é real. A conversa fica honesta quando se separa custo de desenvolvimento de custo de execução.",
            },
            {
                frente: "Como você trataria a documentação de uma biblioteca interna tipada?",
                verso: "Deixando os tipos serem a documentação principal, com comentários no que não é óbvio e exemplos executáveis. Documento separado envelhece; o autocompletar é o que a pessoa vai ler de fato às onze da noite.",
            },
            {
                frente: "Como você impediria uso indevido de uma API interna?",
                verso: "Restringindo o que é exportado no mapa de exportações, marcando o que é interno e usando tipos que só permitem a sequência correta de chamadas. Depender de disciplina e de comentário dizendo para não usar nunca funcionou.",
            },
            {
                frente: "Como você lidaria com um contrato que precisa mudar e tem muitos consumidores?",
                verso: "Acrescentando o novo, mantendo o antigo marcado como obsoleto por uma versão, medindo o uso e removendo com prazo. Quebrar de uma vez porque o compilador aponta os erros ignora quem não faz parte do seu repositório.",
            },
            {
                frente: "Como você usaria tipos para reduzir o custo de revisão de código?",
                verso: "Deixando o compilador cuidar de forma, presença de campo e assinatura, para a revisão gastar tempo com desenho, risco e caso de borda. Revisão que passa a maior parte apontando campo errado é revisão que a ferramenta deveria ter feito.",
            },
            {
                frente: "Como você avaliaria adotar validação de esquema em todo o projeto?",
                verso: "Pelo ganho na borda contra o custo de manter esquema e a sobrecarga em caminho quente. Uso na entrada de API e em configuração paga quase sempre; validar entre módulos internos costuma ser duplicação do que o tipo já garante.",
            },
            {
                frente: "Como você lidaria com performance do editor para o time inteiro?",
                verso: "Medindo com as ferramentas de diagnóstico do serviço de linguagem, cortando tipos caros e dividindo projetos. Editor lento faz as pessoas ignorarem sublinhado vermelho e desligarem verificações, e aí a tipagem deixa de valer.",
            },
            {
                frente: "Como você definiria o que é pronto num PR de migração para TypeScript?",
                verso: "Sem any, sem asserção sem justificativa, bordas validadas e comportamento inalterado, com o teste provando. Migração que corrige bug junto fica impossível de revisar, e é onde se introduz regressão sem ninguém ver.",
            },
            {
                frente: "Como você trataria geração de código que ninguém entende?",
                verso: "Documentando o que gera o quê e quando roda, versionando o resultado e falhando na esteira se estiver desatualizado. Código gerado sem dono é o que ninguém ousa mexer e todo mundo contorna com asserção.",
            },
            {
                frente: "Como você lidaria com o compilador travando a atualização de uma dependência?",
                verso: "Verificando se o problema é declaração incompatível ou versão mínima exigida, e isolando com declaração própria enquanto resolve. Fixar a dependência sem prazo transforma uma incompatibilidade de tipos em dívida de segurança.",
            },
            {
                frente: "Como você trataria tipos em código de teste que diverge da produção?",
                verso: "Derivando o dublê do tipo real, para a mudança de assinatura quebrar o teste. Teste com tipo próprio continua verde depois de uma mudança que quebra a produção, o que é pior que não ter teste, porque dá confiança falsa.",
            },
            {
                frente: "Como você lidaria com um time que escreve tipos duplicando o esquema de validação?",
                verso: "Mostrando a derivação a partir do esquema e removendo a declaração manual, deixando uma fonte só. Duas declarações do mesmo formato divergem sempre, e a divergência aparece como campo aceito na validação e ausente no tipo.",
            },
            {
                frente: "Como você conduziria a decisão de tipar ou não uma parte legada?",
                verso: "Pelo quanto ela muda e pelo risco do que ela faz. Código estável que ninguém toca não ganha nada com migração. Isso é diferente de deixar sem checagem: dá para isolar atrás de uma fronteira tipada sem reescrever nada.",
            },
            {
                frente: "Como você usaria tipos para tornar uma API interna difícil de usar errado?",
                verso: "Exigindo o objeto de contexto correto, recusando combinações inválidas por união e devolvendo tipos que forçam o tratamento do erro. O objetivo é que o caminho errado não compile, e não que exista um documento pedindo cuidado.",
            },
            {
                frente: "Como você trataria a queixa de que os tipos deixam o desenvolvimento mais lento?",
                verso: "Separando o que é atrito legítimo, como configuração ruim e tipos elaborados, do que é o custo de descobrir um problema antes. O primeiro se resolve; o segundo é o objetivo. E vale medir o tempo gasto com bug que deixou de existir.",
            },
            {
                frente: "Como você garantiria que tipos públicos de uma biblioteca não quebrem sem aviso?",
                verso: "Com testes de tipo na suíte e revisão obrigatória do que muda em assinatura exportada. Mudança de tipo não aparece em teste de comportamento, então sem isso a quebra chega para quem consome antes de qualquer aviso.",
            },
            {
                frente: "Como você definiria fronteiras de tipos numa arquitetura em camadas?",
                verso: "Cada camada com seus tipos e conversão explícita na passagem. O tipo do banco não atravessa até a borda HTTP, e o de requisição não entra no domínio. É trabalho extra que paga toda vez que uma das pontas muda.",
            },
            {
                frente: "Como você avaliaria se o time está usando tipos para o que interessa?",
                verso: "Vendo se os erros que chegam em produção seriam pegáveis por tipo. Se são de regra, de integração e de dado, endurecer tipagem não vai mudar nada, e o esforço deveria ir para validação de borda e teste.",
            },
            {
                frente: "Como você lidaria com um tipo público que ficou impossível de evoluir?",
                verso: "Criando o tipo novo ao lado, migrando consumidores com prazo e removendo o antigo. Tentar mudar no lugar quebra todo mundo de uma vez. E vale entender por que ele engessou: normalmente ele expunha detalhe interno demais.",
            },
            {
                frente: "Como você trataria a escolha entre validação estrita e tolerância na entrada?",
                verso: "Estrita no que você grava, tolerante no que você lê de terceiros, ignorando campo desconhecido em vez de falhar. Rejeitar campo a mais em mensagem quebra o consumidor sempre que o produtor evolui, e isso vira acoplamento de deploy.",
            },
            {
                frente: "Como você garantiria que o time saiba quando validar em tempo de execução?",
                verso: "Com uma regra simples e escrita: tudo que atravessa a fronteira do processo é validado, o resto confia no tipo. Regra clara é melhor que julgamento caso a caso, porque a decisão acontece em pressa e em revisão rápida.",
            },
            {
                frente: "Como você lidaria com tipos que não acompanham a evolução do produto?",
                verso: "Tratando tipo como parte da mudança, e não como ajuste posterior. Se o modelo do domínio mudou, o tipo muda junto no mesmo PR. Tipos que descrevem o produto de dois anos atrás confundem mais do que ajudam.",
            },
            {
                frente: "Como você lidaria com uma proposta de abandonar TypeScript?",
                verso: "Perguntando qual dor específica motiva, porque costuma ser build lento, configuração ou tipos elaborados, e isso tem solução. Se a decisão for tomada mesmo assim, JSDoc com checagem mantém boa parte do ganho sem passo de compilação.",
            },
            {
                frente: "Como você trataria tipos numa base com várias equipes e ritmos diferentes?",
                verso: "Com configuração base compartilhada, fronteiras claras por pacote e regra de entrada na esteira, deixando cada time avançar no ritmo dentro do seu escopo. O que precisa ser igual é o contrato entre eles, não o estilo interno.",
            },
            {
                frente: "Como você definiria a responsabilidade sobre os tipos compartilhados?",
                verso: "Com dono declarado, revisão obrigatória e processo de proposta. Tipos de fronteira sem dono acumulam campos opcionais até não descreverem nada, porque cada time acrescenta o seu e ninguém remove.",
            },
            {
                frente: "Como você usaria a tipagem para reduzir incidentes de integração?",
                verso: "Gerando os tipos do contrato, validando na borda e mantendo teste de contrato rodando contra o ambiente real. Isso transforma mudança do outro lado em falha visível cedo, em vez de erro do usuário no dia seguinte.",
            },
            {
                frente: "Como você conduziria a revisão de uma configuração de compilador herdada?",
                verso: "Listando cada opção, o que ela liga e por que está ali, removendo o que foi copiado sem motivo. Configuração herdada costuma ter opções frouxas que ninguém escolheu, e são elas que explicam por que a base aceita coisas estranhas.",
            },
            {
                frente: "Como você garantiria que uma decisão de tipagem sobreviva à saída de quem a tomou?",
                verso: "Registrando como decisão datada, com contexto e consequências, junto do código. Tipo complexo sem registro é desfeito no primeiro PR de quem não entendeu, e o problema que ele evitava volta sem ninguém reconhecer.",
            },
            {
                frente: "Como você trataria a diferença entre tipar para o compilador e tipar para quem lê?",
                verso: "Preferindo nomes de domínio e tipos simples, mesmo quando um tipo mais preciso seria possível. Quem mantém lê muito mais vezes do que escreve. Precisão que ninguém entende cobra em toda mudança futura.",
            },
            {
                frente: "Como você avaliaria o custo total de uma abordagem de tipagem avançada?",
                verso: "Somando tempo de checagem, resposta do editor, dificuldade de revisão e de onboarding, contra os defeitos que ela evita. Poucos casos justificam. Onde justifica, vale isolar num pacote com testes de tipo e dono definido.",
            },
            {
                frente: "Como você lidaria com quem propõe adotar um recurso experimental do compilador?",
                verso: "Perguntando quem sustenta se ele mudar, e se ele trava a atualização de versão. Recurso experimental em código central vira dependência de longo prazo. Em código isolado e substituível, o risco é aceitável.",
            },
            {
                frente: "Como você trataria o uso de tipos em código de configuração de infraestrutura?",
                verso: "Com a mesma seriedade do resto: erro ali afeta produção diretamente e costuma passar despercebido em revisão. Tipar recursos e validar valores evita o erro clássico de nome de ambiente digitado errado passando batido.",
            },
            {
                frente: "Como você conduziria a padronização de nomes e formatos de tipos?",
                verso: "Com poucas regras escritas e exemplos, aplicadas por lint onde der. Discussão recorrente sobre prefixo e sufixo consome revisão e não muda resultado, então uma decisão registrada vale mais que a melhor convenção sem acordo.",
            },
            {
                frente: "Como você lidaria com a pressão para entregar sem tipar a borda?",
                verso: "Oferecendo o mínimo: validar a entrada crítica e marcar o resto com prazo. Borda sem validação é o ponto em que o sistema aceita qualquer coisa, então esse é o último lugar onde vale cortar caminho.",
            },
            {
                frente: "Como você decidiria entre tipo mais permissivo e mais restrito numa API pública?",
                verso: "Restrito no que você recebe, para poder evoluir; generoso no que você devolve, porque estreitar depois quebra consumidores. Prometer menos e entregar o que precisa é o que permite mudar sem coordenar com todo mundo.",
            },
            {
                frente: "Como você lidaria com um incidente causado por um dado que o tipo dizia existir?",
                verso: "Corrigindo a borda que aceitou o dado, e não espalhando checagem defensiva pelo fluxo. Depois procurando outras entradas com o mesmo padrão, porque quase nunca é caso único. E registrando: é o tipo de incidente que se repete até a regra de validação virar padrão.",
            },
            {
                frente: "Como você avaliaria a saúde da tipagem de um projeto que você acabou de assumir?",
                verso: "Olhando a configuração, contando any e asserções, vendo se as bordas validam e rodando a checagem para ver quanto tempo leva. Isso dá em uma tarde um retrato melhor que semanas lendo código.",
            },
        ],
    },
};
