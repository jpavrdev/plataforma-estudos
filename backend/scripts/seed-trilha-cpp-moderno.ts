// Seed da trilha C++ Moderno, estagio 4 do roadmap.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-cpp-moderno.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "C++ Moderno";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "O C++ que os code reviews cobram: semântica de valor e const-correctness, RAII e ownership com smart pointers, move semantics de verdade, templates sem medo com concepts, a STL com o custo de cada container na cabeça e tratamento de erros no estilo de quem escreve sistemas.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Valor, referência e const",
    aulas: [
        {
            titulo: "Semântica de valor",
            blocks: [
                {
                    type: "text",
                    value: "# Cópia é o padrão\n\nEm C++, atribuição e passagem de parâmetro COPIAM o objeto inteiro. Quando você escreve b = a entre dois std::vector, o programa aloca memória nova e duplica cada elemento; a partir dali, a e b vivem vidas separadas. Isso soa óbvio até você chegar de Java, Python ou JavaScript, onde a mesma linha copia apenas uma referência e os dois nomes passam a apontar pro MESMO objeto.\n\nEssa escolha define a linguagem. O lado bom é o raciocínio local: se ninguém mais tem uma referência pro seu vetor, ninguém o modifica pelas suas costas. Nada de aliasing surpresa, nada de cópia defensiva como em Java. O lado caro: copiar um vector com um milhão de strings significa alocar um bloco novo pro vetor e um bloco novo POR STRING, e isso pode acontecer numa linha de aparência inocente.\n\nO objetivo da trilha começa aqui: saber QUANDO uma cópia acontece, quanto ela custa e como dizer explicitamente que você não quer pagar por ela. Referências, move e containers, tudo que vem adiante, é variação desse tema.",
                },
                {
                    type: "code",
                    value: '#include <string>\n#include <vector>\n\nstd::vector<std::string> nomes = {"ana", "bruno", "carla"};\n\nstd::vector<std::string> copia = nomes;  // aloca e duplica TUDO\ncopia[0] = "alice";                      // nomes[0] continua "ana"\n\n// A mesma regra vale em parametros:\nvoid processaCopia(std::vector<std::string> v);        // recebe uma COPIA\nvoid processaLeitura(const std::vector<std::string>& v); // le o original\n\n// Em Java ou Python, "copia = nomes" apenas criaria\n// um segundo nome pro MESMO objeto.',
                },
                {
                    type: "table",
                    value: '[["Linguagem","O que b = a faz com um objeto","Consequência"],["C++","Copia o valor inteiro","Dois objetos independentes"],["Java","Copia a referência","Dois nomes pro mesmo objeto"],["Python","Copia a referência","Mutação aparece nos dois nomes"],["JavaScript","Copia a referência","Mesmo objeto compartilhado"]]',
                },
                {
                    type: "quote",
                    value: "Em C++, atribuição copia. Essa única frase explica metade dos custos escondidos da linguagem e todos os sustos de aliasing que você NÃO vai ter.",
                },
                {
                    type: "text",
                    value: '## Onde a cópia custa de verdade\n\nNem toda cópia é problema. Copiar um int, um double ou um pequeno struct de dois campos custa o mesmo que copiar um ponteiro; o compilador resolve em registradores e a discussão acaba. O custo aparece quando o objeto é DONO de memória no heap: vector, string, map. Copiar um desses significa alocar de novo e percorrer o conteúdo, e alocação é das operações mais caras que um programa comum faz.\n\nOs pontos clássicos onde cópias caras se escondem: parâmetro por valor de um tipo pesado, retorno guardado em variável nova sem necessidade, um push_back de objeto que ainda vai ser usado, um loop que copia o elemento a cada iteração porque o autor esqueceu o &.\n\nA postura profissional não é ter medo da cópia, é enxergá-la. Em code review, a pergunta "essa linha copia?" tem sempre resposta exata: sim ou não, definida pela linguagem. Quem domina essa resposta escreve C++ rápido sem truque nenhum, só escolhendo bem as assinaturas.',
                },
            ],
            questions: [
                {
                    statement:
                        "Em C++, o que acontece por padrão quando você atribui um std::vector a outro (b = a)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O conteúdo inteiro é copiado; b vira objeto independente",
                            isCorrect: true,
                        },
                        {
                            text: "b passa a apontar pro mesmo vetor que a, como em Java",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador adia a cópia até b ser modificado pela primeira vez",
                            isCorrect: false,
                        },
                        {
                            text: "Os elementos são movidos de a pra b, esvaziando o original",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual vantagem direta a semântica de valor traz pro raciocínio sobre o código?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sem aliasing: ninguém altera seu objeto por outro nome",
                            isCorrect: true,
                        },
                        {
                            text: "Menos memória gasta, já que os objetos são compartilhados",
                            isCorrect: false,
                        },
                        {
                            text: "Passagem de parâmetro sempre mais rápida que em Java",
                            isCorrect: false,
                        },
                        {
                            text: "Threads podem escrever no mesmo dado sem sincronização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Copiar um std::vector<std::string> com um milhão de itens custa caro por quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Além do bloco do vetor, cada string aloca e copia o seu",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o vector guarda os elementos em memória não contígua",
                            isCorrect: false,
                        },
                        {
                            text: "Porque strings são imutáveis e precisam ser recriadas duas vezes",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a cópia dispara o coletor de lixo no meio da operação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Comparando linguagens: o que muda entre b = a em Python e em C++ pra objetos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Python copia a referência; C++ copia o valor do objeto",
                            isCorrect: true,
                        },
                        {
                            text: "Python copia o valor; C++ compartilha a referência interna",
                            isCorrect: false,
                        },
                        {
                            text: "Nas duas o objeto é copiado, mas C++ faz isso preguiçosamente",
                            isCorrect: false,
                        },
                        {
                            text: "Nas duas só a referência é copiada; C++ apenas otimiza depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma função recebe std::vector<std::string> POR VALOR e é chamada dentro de um loop quente. Qual é a consequência?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Uma cópia completa do vetor e das strings a cada chamada",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhuma: o compilador sempre elide cópias de parâmetros",
                            isCorrect: false,
                        },
                        {
                            text: "Uma cópia só na primeira chamada; depois o cache reaproveita",
                            isCorrect: false,
                        },
                        {
                            text: "Só o cabeçalho do vetor é copiado; os dados são emprestados",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Referências e const-correctness",
            blocks: [
                {
                    type: "text",
                    value: '# A assinatura que documenta intenção\n\nReferência é um segundo nome pro mesmo objeto: sem cópia, sem sintaxe de ponteiro, sem possibilidade de ser nula. Combinada com const, ela vira a ferramenta central de design de API em C++. Um parâmetro const T& diz "eu leio o seu objeto, não copio e não modifico"; um T& diz "eu vou MODIFICAR o seu objeto"; um T por valor diz "eu quero uma cópia minha, faça o que quiser com a sua".\n\nO mesmo vale dentro das classes: um método marcado como const promete não alterar o estado observável do objeto. E a promessa é verificada: dentro de um método const, qualquer tentativa de mexer num membro é erro de compilação; num objeto acessado por referência const, só métodos const podem ser chamados.\n\nIsso é o que a comunidade chama de const-correctness: o hábito de marcar tudo que não muda. Não é estilo, é informação. Quem lê a assinatura sabe o contrato sem abrir a implementação, e o compilador fiscaliza o contrato a cada build.',
                },
                {
                    type: "code",
                    value: "#include <iostream>\n#include <string>\n\nclass Conta {\npublic:\n    explicit Conta(std::string dono) : dono_(std::move(dono)) {}\n\n    double saldo() const { return saldo_; }   // promete nao mudar a conta\n    const std::string& dono() const { return dono_; }\n    void depositar(double v) { saldo_ += v; } // muda estado: sem const\n\nprivate:\n    std::string dono_;\n    double saldo_ = 0.0;\n};\n\nvoid imprimir(const Conta& c) {       // le sem copiar\n    // c.depositar(10);               // NAO compila: metodo nao-const\n    std::cout << c.dono() << \": \" << c.saldo() << '\\n';\n}",
                },
                {
                    type: "table",
                    value: '[["Assinatura","O que comunica a quem chama"],["void f(T x)","Quero uma cópia própria; seu objeto fica intacto"],["void f(const T& x)","Só leio; nada de cópia, nada de mudança"],["void f(T& x)","Vou modificar o SEU objeto"],["double saldo() const","Consultar não altera o estado do objeto"]]',
                },
                {
                    type: "quote",
                    value: "const não é enfeite: é a parte da assinatura que diz o que a função NÃO faz. API sem const obriga o leitor a abrir a implementação pra descobrir o contrato.",
                },
                {
                    type: "text",
                    value: "## As regras práticas de passagem\n\nPra decidir como receber um parâmetro, o critério em C++ moderno cabe em três linhas. Tipo barato de copiar (int, double, ponteiro, string_view, structs pequenos): passe POR VALOR; a cópia custa um registrador e referência só adicionaria indireção. Tipo caro que você só lê (string, vector, objetos de domínio): passe por const T&. Precisa modificar o objeto do chamador: T&, e o nome da função deve deixar isso gritante.\n\nMarque const também nos métodos, em variáveis locais que não mudam e nos retornos por referência de leitura. Cada const a mais estreita o que o leitor precisa considerar: uma função que só recebe const& não pode ser a culpada pela mutação que você está caçando no debug.\n\nExiste um efeito colateral valioso: const-correctness prepara o terreno pra otimização e pra concorrência. Objetos que só são lidos podem ser compartilhados entre threads sem trava. O compilador não usa const sozinho pra otimizar quase nada, mas o SEU raciocínio usa, e ele é o que evita os bugs caros.",
                },
            ],
            questions: [
                {
                    statement: "O que a assinatura void f(const T& x) comunica a quem chama?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A função só lê x: sem cópia e sem modificação",
                            isCorrect: true,
                        },
                        {
                            text: "A função guarda uma cópia particular de x pra depois",
                            isCorrect: false,
                        },
                        {
                            text: "A função pode alterar x, mas devolve o original intacto",
                            isCorrect: false,
                        },
                        {
                            text: "O argumento precisa viver até o fim do programa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que um método marcado como const promete?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Chamá-lo não muda o estado observável do objeto",
                            isCorrect: true,
                        },
                        {
                            text: "Que o valor retornado nunca poderá ser modificado",
                            isCorrect: false,
                        },
                        {
                            text: "Que ele só pode ser chamado uma única vez por objeto",
                            isCorrect: false,
                        },
                        {
                            text: "Que o objeto inteiro vira imutável depois da chamada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pra um parâmetro int ou double, por que passar por valor em vez de const&?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cabem em registrador; referência só adiciona indireção",
                            isCorrect: true,
                        },
                        {
                            text: "Porque const& não funciona com tipos aritméticos primitivos",
                            isCorrect: false,
                        },
                        {
                            text: "Porque valores pequenos não podem ser referenciados com segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a cópia deles é eliminada pelo coletor da linguagem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num objeto acessado por referência const, o que o compilador permite chamar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Apenas os métodos marcados como const na classe",
                            isCorrect: true,
                        },
                        {
                            text: "Qualquer método, desde que dentro do mesmo arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "Somente métodos estáticos e construtores da classe",
                            isCorrect: false,
                        },
                        {
                            text: "Todos os métodos, gerando cópia temporária automática",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que dizemos que const-correctness é documentação verificada?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A intenção fica na assinatura e o compilador barra violações",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o padrão exige um comentário formal em cada função const",
                            isCorrect: false,
                        },
                        {
                            text: "Porque const obriga testes unitários pra cada método marcado",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o linker valida os comentários contra o código gerado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ponteiros crus ainda têm lugar",
            blocks: [
                {
                    type: "text",
                    value: '# O papel que sobrou pro ponteiro\n\nC++ moderno não aboliu o ponteiro cru; aboliu o ponteiro cru DONO. A distinção é tudo. Um T* em código moderno significa uma coisa só: "eu enxergo esse objeto, ele pertence a outra pessoa, e talvez ele nem exista". É o observador não-dono, e o nullptr é justamente o valor que representa a ausência.\n\nCompare com a referência: T& não pode ser nula e não pode ser reapontada, então ela comunica presença OBRIGATÓRIA. O critério de API sai de graça: parâmetro obrigatório vira referência; parâmetro opcional vira ponteiro (ou std::optional, que você verá no módulo de erros). Quem lê a assinatura sabe se precisa checar o nulo.\n\nO que morreu de verdade foi o par new e delete escritos à mão no código de aplicação. Posse manual exige que TODO caminho de saída da função lembre do delete: cada return antecipado, cada exceção. Basta um esquecimento pra vazar. O módulo 2 mostra como RAII e smart pointers eliminam a categoria inteira desse bug, sem custo.',
                },
                {
                    type: "code",
                    value: '#include <string>\n\n// Observador nao-dono e OPCIONAL: pode ser nullptr\nvoid notificar(Logger* log, const std::string& msg) {\n    if (log) log->registrar(msg);   // checa antes de usar\n}\n\n// Obrigatorio: referencia, sem checagem de nulo\nvoid salvar(Banco& banco, const Registro& r);\n\n// O que NAO fazer em codigo de aplicacao moderno:\nvoid relatorio() {\n    Cliente* c = new Cliente("Ana");\n    if (!c->ativo()) return;   // VAZOU: o delete abaixo nunca roda\n    // ...\n    delete c;\n}',
                },
                {
                    type: "table",
                    value: '[["Você precisa de","Use","Por quê"],["Ler sem copiar, sempre presente","const T&","Não nulo por construção"],["Modificar, sempre presente","T&","Sem checagem de nulo no caminho"],["Observar, pode faltar","T*","nullptr representa a ausência"],["Posse de um recurso","unique_ptr ou valor","Liberação automática, sem delete"]]',
                },
                {
                    type: "quote",
                    value: "Ponteiro cru em C++ moderno diz apenas: eu enxergo esse objeto. No momento em que ele diz 'esse objeto é meu e eu deleto', o código já está errado.",
                },
                {
                    type: "text",
                    value: "## Como reconhecer os usos legítimos\n\nEm código de 2026 bem cuidado, o ponteiro cru aparece em três lugares honestos. Primeiro: parâmetros e retornos opcionais de observação, como o Logger* do exemplo, onde nulo é um estado normal. Segundo: interior de estruturas de dados e iteração de baixo nível, onde ele é detalhe de implementação encapsulado. Terceiro: fronteiras com APIs de C, que só falam ponteiro.\n\nFora disso, desconfie. Um new solto no meio de uma função é sinal de review reprovado; um delete então, quase certeza de bug em algum caminho. Membro de classe do tipo T* dono, com delete no destrutor escrito à mão, é exatamente o padrão legado que o projeto final desta trilha vai modernizar.\n\nA regra que resume a aula: posse NUNCA em ponteiro cru; observação opcional SEMPRE pode ser. Com ela na cabeça, ler uma assinatura vira leitura de contrato: quem é dono, quem empresta, o que pode faltar. É metade do trabalho de entender qualquer API em C++.",
                },
            ],
            questions: [
                {
                    statement: "Em C++ moderno, o que um ponteiro cru T* deve significar numa API?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um observador sem posse, que pode ser nulo",
                            isCorrect: true,
                        },
                        {
                            text: "Posse exclusiva do objeto apontado até o delete",
                            isCorrect: false,
                        },
                        {
                            text: "Um dono compartilhado, contado pelo runtime",
                            isCorrect: false,
                        },
                        {
                            text: "Uma referência obrigatória que nunca é nula",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que nullptr expressa num parâmetro de ponteiro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A ausência é aceitável: o argumento é opcional",
                            isCorrect: true,
                        },
                        {
                            text: "Que o objeto apontado já foi destruído antes",
                            isCorrect: false,
                        },
                        {
                            text: "Um erro fatal que encerra o programa na chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Que a posse do objeto retorna pra quem chamou",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o critério entre receber T& e receber T* numa função?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Referência quando obrigatório; ponteiro quando opcional",
                            isCorrect: true,
                        },
                        {
                            text: "Referência pra tipos grandes; ponteiro pra tipos pequenos",
                            isCorrect: false,
                        },
                        {
                            text: "Ponteiro quando a função modifica; referência quando só lê",
                            isCorrect: false,
                        },
                        {
                            text: "Referência em código novo; ponteiro apenas em código antigo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que new e delete manuais são banidos do código de aplicação moderno?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Retorno antecipado ou exceção pulam o delete e vazam",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o new moderno é mais lento que malloc em toda chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Porque delete não funciona com objetos que têm destrutor",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o padrão da linguagem removeu o operador new",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma função cria um objeto com new, tem vários returns e chama delete só na última linha. Qual é o defeito?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Os returns antecipados saem sem liberar: vazamento",
                            isCorrect: true,
                        },
                        {
                            text: "O delete final libera duas vezes o mesmo bloco",
                            isCorrect: false,
                        },
                        {
                            text: "O new passa a falhar a partir da segunda chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: o compilador insere os deletes que faltam",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "lvalue e rvalue",
            blocks: [
                {
                    type: "text",
                    value: '# Tem nome ou é temporário?\n\nToda expressão em C++ tem, além de um tipo, uma CATEGORIA DE VALOR. A intuição que resolve a maioria dos casos: lvalue é o que tem nome e endereço estável, e continua existindo depois da linha; rvalue é o temporário, que nasce numa expressão e morre no fim dela. A variável x é lvalue; x + 1 é rvalue; std::string("tmp") é rvalue; o literal 42 é rvalue.\n\nPor que a linguagem se dá ao trabalho de distinguir? Porque temporários são uma OPORTUNIDADE. Um objeto que vai morrer no fim da expressão não precisa ser copiado com cuidado: dá pra roubar os recursos dele sem que ninguém perceba. Pra isso funcionar, o compilador precisa saber com certeza quando algo é temporário, e a categoria de valor é exatamente essa informação.\n\nO C++11 deu um tipo de referência pra isso: T&& é a referência rvalue, que só se liga a temporários. Já a velha const T& é generosa: liga em lvalue e em rvalue. Essa dupla é a base mecânica do move semantics, assunto central do módulo 3.',
                },
                {
                    type: "code",
                    value: '#include <string>\n#include <utility>\n\nint x = 10;              // x e lvalue; o literal 10 e rvalue\nint y = x + 1;           // x + 1 e um temporario: rvalue\n\nstd::string nome = "ana";\nstd::string grito = nome + "!";   // nome + "!" e rvalue\n\nvoid f(const std::string& s);   // aceita lvalue E rvalue\nvoid g(std::string&& s);        // aceita SO rvalue\n\n// f(nome);                  ok: lvalue\n// f(nome + "!");            ok: rvalue liga em const&\n// g(std::string("tmp"));    ok: temporario\n// g(nome);                  NAO compila: nome e lvalue\n// g(std::move(nome));       ok: cast pra rvalue (modulo 3)',
                },
                {
                    type: "table",
                    value: '[["Expressão","Categoria","Por quê"],["x","lvalue","Tem nome e endereço estável"],["x + 1","rvalue","Temporário sem nome"],["std::string(\\"tmp\\")","rvalue","Nasce e morre na expressão"],["std::move(x)","rvalue (xvalue)","Cast que trata x como temporário"],["s dentro de g(std::string&& s)","lvalue","Parâmetro tem nome e endereço"]]',
                },
                {
                    type: "quote",
                    value: "A pergunta que separa as categorias é simples: isso tem nome e continua existindo depois da linha? Tem nome, é lvalue. É temporário anônimo, é rvalue.",
                },
                {
                    type: "text",
                    value: '## A pegadinha que derruba todo mundo\n\nDentro de void g(std::string&& s), qual é a categoria de s? O TIPO de s é referência rvalue, mas s TEM NOME, logo a expressão s é um lvalue. Parece pedantismo e é a chave de tudo: se você passar s adiante pra outra função, ela será tratada como lvalue e será COPIADA, não movida. Pra repassar o temporário como temporário, é preciso escrever std::move(s) de novo. Guarde a frase: referência rvalue nomeada é lvalue.\n\nO quadro completo do padrão tem cinco categorias (a novidade útil é o xvalue, o "expiring value" que o std::move produz), mas a divisão prática entre "tem identidade e permanece" e "pode ser saqueado" cobre o dia a dia de quem escreve aplicação.\n\nO que você leva desta aula: const T& aceita tudo e promete só ler; T&& captura temporários e abre a porta pro roubo de recursos; e um T&& com nome volta a ser lvalue. Com esses três fatos, o módulo de move semantics deixa de ser mágica e vira mecânica.',
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza um lvalue?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Tem nome e endereço; sobrevive à expressão",
                            isCorrect: true,
                        },
                        {
                            text: "É sempre uma constante conhecida na compilação",
                            isCorrect: false,
                        },
                        {
                            text: "É qualquer valor retornado por uma função",
                            isCorrect: false,
                        },
                        {
                            text: "É um temporário destruído no fim da linha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que tipo de expressão uma referência T&& (sem const) aceita?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Apenas rvalues: temporários e resultados de std::move",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas lvalues que tenham endereço estável na memória",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer expressão da linguagem, como faz a const T&",
                            isCorrect: false,
                        },
                        {
                            text: "Somente literais numéricos e literais de texto do código",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a linguagem distingue lvalues de rvalues?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pra detectar temporários e permitir roubar seus recursos",
                            isCorrect: true,
                        },
                        {
                            text: "Pra impedir que temporários sejam passados a funções",
                            isCorrect: false,
                        },
                        {
                            text: "Pra decidir quais variáveis ficam na memória e quais em registrador",
                            isCorrect: false,
                        },
                        {
                            text: "Pra separar valores const dos mutáveis durante a execução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde uma referência const T& consegue se ligar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Em lvalues e também em rvalues temporários",
                            isCorrect: true,
                        },
                        {
                            text: "Somente em lvalues nomeados no escopo atual",
                            isCorrect: false,
                        },
                        {
                            text: "Somente em temporários criados na mesma linha",
                            isCorrect: false,
                        },
                        {
                            text: "Em qualquer coisa, exceto literais de texto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dentro de void g(std::string&& s), qual é a categoria da expressão s?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "É um lvalue: tem nome, mesmo sendo referência rvalue",
                            isCorrect: true,
                        },
                        {
                            text: "É um rvalue, porque o tipo declarado é string&&",
                            isCorrect: false,
                        },
                        {
                            text: "É um xvalue até a primeira leitura, depois vira const",
                            isCorrect: false,
                        },
                        {
                            text: "Depende da categoria do argumento passado na chamada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "auto e dedução",
            blocks: [
                {
                    type: "text",
                    value: "# Quando auto clareia e quando esconde\n\nO auto pede ao compilador que deduza o tipo a partir da expressão. Ele nasceu pra matar ruído: ninguém precisa digitar std::map<std::string, std::vector<int>>::const_iterator quando a linha de baixo deixa óbvio o que a variável é. Com structured bindings, um loop sobre mapa vira for (const auto& [chave, valor] : mapa), que se lê como a intenção.\n\nA primeira regra de segurança: auto COPIA. Em auto x = expr, o x é um objeto novo, deduzido SEM referência e sem const. Se a expressão devolve uma referência pra algo caro, o auto sozinho paga uma cópia silenciosa. Quer referenciar, escreva auto&; quer só ler, const auto&. A escolha entre essas três formas é exatamente a mesma decisão de passagem de parâmetro que você já treinou.\n\nA segunda regra: auto esconde o tipo do LEITOR, não do compilador. Em expressão cujo tipo é a informação relevante (aritmética com tamanhos e índices, fronteiras de API pública), escrever o tipo por extenso é gentileza com quem revisa.",
                },
                {
                    type: "code",
                    value: "#include <map>\n#include <string>\n#include <vector>\n\nstd::map<std::string, std::vector<int>> notas;\n\n// Clareia: o par chave/valor com nomes, sem tipo gigante\nfor (const auto& [aluno, lista] : notas) {\n    // usar(aluno, lista);\n}\n\nstd::vector<int> v = {1, 2, 3};\nauto a = v[0];         // int: copia, como esperado\nauto& b = v[0];        // referencia: escrever em b muda v[0]\n\n// A armadilha do proxy:\nstd::vector<bool> flags = {true, false};\nauto p = flags[0];     // NAO e bool: e um proxy interno preso a flags\nbool ok = flags[0];    // conversao explicita: agora sim um bool",
                },
                {
                    type: "table",
                    value: '[["Forma","O que faz","Quando usar"],["auto x = expr","Deduz e COPIA o valor","Tipo óbvio pelo contexto"],["auto& x = expr","Referência mutável","Alterar o original no loop"],["const auto& x","Referência de leitura","Ler elementos caros sem copiar"],["tipo explícito","Documenta a intenção","Fronteira de API; tipo importa"]]',
                },
                {
                    type: "quote",
                    value: "auto tira o ruído, não a responsabilidade: você continua precisando saber o tipo. A diferença é que agora quem confere é o compilador, não o leitor.",
                },
                {
                    type: "text",
                    value: "## A armadilha do proxy\n\nAlguns tipos mentem para o auto. O caso clássico é std::vector<bool>: por otimização histórica de espaço, operator[] não devolve bool, devolve um objeto proxy que REFERENCIA um bit dentro do vetor. Com bool b = flags[0], o proxy converte e você recebe um bool de verdade. Com auto p = flags[0], o p GUARDA O PROXY, que continua amarrado ao vetor: se flags for realocado ou destruído, usar p é comportamento indefinido.\n\nO mesmo padrão aparece em bibliotecas de álgebra linear com expression templates, em que a soma de matrizes devolve um objeto de expressão, não uma matriz. A defesa é simples: quando a expressão pode devolver proxy, nomeie o tipo desejado no lado esquerdo e force a conversão.\n\nFecha o módulo o resumo de postura: auto por padrão onde o tipo é óbvio, auto& e const auto& conscientes de cópia, tipo explícito onde o leitor precisa dele, e desconfiança treinada nos raros tipos-proxy. Dedução é conforto, e conforto bom é o que não esconde custo.",
                },
            ],
            questions: [
                {
                    statement: "O que auto x = expr faz com o resultado da expressão?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Deduz o tipo e guarda uma CÓPIA do valor",
                            isCorrect: true,
                        },
                        {
                            text: "Cria uma referência implícita pro resultado",
                            isCorrect: false,
                        },
                        {
                            text: "Guarda o valor sem tipo até o primeiro uso",
                            isCorrect: false,
                        },
                        {
                            text: "Converte o resultado pro tipo mais genérico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando const auto& é a escolha certa num for de intervalo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pra ler elementos caros sem copiar cada um",
                            isCorrect: true,
                        },
                        {
                            text: "Pra modificar os elementos durante o percurso",
                            isCorrect: false,
                        },
                        {
                            text: "Pra forçar uma cópia imutável de cada elemento",
                            isCorrect: false,
                        },
                        {
                            text: "Pra iterar mapas, que não aceitam auto simples",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em que situação auto costuma ATRAPALHAR a leitura do código?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quando o tipo importa e não dá pra inferir do contexto",
                            isCorrect: true,
                        },
                        {
                            text: "Quando o tipo deduzido é um contêiner da biblioteca padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Sempre que aparece em funções com mais de dez linhas",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a expressão da direita chama uma função externa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a diferença entre auto& e auto num loop que altera elementos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "auto& referencia o original; auto altera só uma cópia",
                            isCorrect: true,
                        },
                        {
                            text: "auto& copia com custo menor; auto copia com custo maior",
                            isCorrect: false,
                        },
                        {
                            text: "auto& só funciona com vetores; auto com qualquer contêiner",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma: o compilador escolhe a forma mais eficiente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que auto p = flags[0] é perigoso quando flags é um std::vector<bool>?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "p guarda um proxy preso ao vetor, não um bool",
                            isCorrect: true,
                        },
                        {
                            text: "p vira int, e comparações com true passam a falhar",
                            isCorrect: false,
                        },
                        {
                            text: "p copia o vetor de flags inteiro por engano",
                            isCorrect: false,
                        },
                        {
                            text: "p fica indefinido porque bool não tem operador []",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - RAII e ownership",
    aulas: [
        {
            titulo: "RAII a fundo",
            blocks: [
                {
                    type: "text",
                    value: '# O recurso amarrado ao escopo\n\nRAII (Resource Acquisition Is Initialization) é a ideia mais importante do C++, e o nome péssimo esconde uma mecânica simples: o CONSTRUTOR adquire o recurso, o DESTRUTOR libera, e o compilador garante que o destrutor roda quando o objeto sai de escopo. Recurso aqui é qualquer coisa que precisa de devolução: memória, arquivo aberto, mutex travado, conexão de rede, transação de banco.\n\nA consequência prática: você não escreve código de liberação. Não existe close esquecido, unlock esquecido, free esquecido, porque a liberação não é uma linha que alguém precisa lembrar; é uma consequência gramatical do fim do escopo. O bloco termina, os destrutores rodam, na ordem inversa da construção.\n\nE o detalhe que separa C++ de linguagens com garbage collector: o momento é DETERMINÍSTICO. O arquivo fecha exatamente ali, o mutex destrava exatamente ali, não "quando o coletor passar". Pra recursos escassos como locks e conexões, esse "exatamente ali" é a diferença entre um sistema previsível e um sistema que engasga.',
                },
                {
                    type: "code",
                    value: '#include <fstream>\n#include <mutex>\n#include <stdexcept>\n#include <string>\n\nstd::mutex m;\n\nvoid gravar(const std::string& linha) {\n    std::lock_guard<std::mutex> trava(m);         // trava no construtor\n    std::ofstream arq("log.txt", std::ios::app);  // abre no construtor\n\n    if (!arq) throw std::runtime_error("nao abriu o log");\n    arq << linha << \'\\n\';\n\n}   // saindo do escopo, COM ou SEM excecao:\n    // arq fecha, depois trava destrava (ordem inversa)',
                },
                {
                    type: "table",
                    value: '[["Recurso","Classe RAII","O que o destrutor faz"],["Memória dinâmica","vector, string, unique_ptr","Libera o bloco"],["Arquivo","ifstream, ofstream","Fecha o descritor"],["Mutex","lock_guard, scoped_lock","Destrava"],["Conexão ou transação","Wrapper seu","Encerra ou faz rollback"]]',
                },
                {
                    type: "quote",
                    value: "Em C++ você não escreve 'libere isso': escreve 'isso vive neste escopo'. A liberação vira consequência da gramática, inclusive quando uma exceção atravessa a função.",
                },
                {
                    type: "text",
                    value: "## Exception safety de graça\n\nO argumento definitivo a favor do RAII é o caminho do erro. Quando uma exceção é lançada, o stack unwinding destrói, um a um, todos os objetos locais já construídos entre o throw e o catch. Se cada recurso vive dentro de um objeto RAII, o caminho de erro limpa TUDO sozinho, na ordem certa, sem uma linha escrita por você. No exemplo da aula, o throw acontece com o mutex travado; mesmo assim ninguém fica em deadlock, porque o lock_guard destrava durante o unwinding.\n\nCompare com linguagens que precisam de try/finally ou with: ali a limpeza é opt-in, e cada ponto de uso precisa lembrar do padrão. Em C++ a limpeza é opt-out: acontece a menos que você sabote.\n\nA disciplina que fica: TODO recurso mora dentro de um objeto cujo destrutor o devolve. Se você está segurando um recurso numa variável crua e liberando à mão, pare e embrulhe. As próximas aulas apresentam os embrulhos prontos da biblioteca padrão pro caso mais comum de todos, a memória.",
                },
            ],
            questions: [
                {
                    statement: "O que a sigla RAII descreve, na prática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Construtor adquire o recurso; destrutor libera no fim do escopo",
                            isCorrect: true,
                        },
                        {
                            text: "Um coletor de lixo opcional presente na biblioteca padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Uma convenção de nomes pra funções que alocam memória crua",
                            isCorrect: false,
                        },
                        {
                            text: "O padrão de chamar free e close no fim de cada função escrita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quem garante que o destrutor de um objeto local vai rodar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O compilador, quando o objeto sai do escopo",
                            isCorrect: true,
                        },
                        {
                            text: "O runtime, na próxima pausa do coletor",
                            isCorrect: false,
                        },
                        {
                            text: "O programador, chamando destroy à mão",
                            isCorrect: false,
                        },
                        {
                            text: "O sistema operacional, ao encerrar o processo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a vantagem do destrutor determinístico sobre um garbage collector pra um mutex?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O destrave acontece na hora exata, não quando o coletor rodar",
                            isCorrect: true,
                        },
                        {
                            text: "O destrutor consome menos memória que o coletor em toda execução",
                            isCorrect: false,
                        },
                        {
                            text: "O coletor não consegue liberar mutexes, apenas memória de objetos",
                            isCorrect: false,
                        },
                        {
                            text: "O destrutor roda em thread separada e nunca bloqueia o programa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que se diz que RAII dá exception safety de graça?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O stack unwinding destrói os locais e libera cada recurso",
                            isCorrect: true,
                        },
                        {
                            text: "Porque exceções são desativadas em código que usa objetos RAII",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o catch devolve os recursos listados no bloco do try",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o throw só é permitido depois de liberar os recursos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois objetos RAII são construídos em sequência no mesmo escopo. Em que ordem os destrutores rodam?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Na ordem inversa da construção, ao sair do escopo",
                            isCorrect: true,
                        },
                        {
                            text: "Na mesma ordem da construção, ao sair do escopo",
                            isCorrect: false,
                        },
                        {
                            text: "Em ordem indefinida, decidida pelo otimizador",
                            isCorrect: false,
                        },
                        {
                            text: "Em paralelo, um destrutor por thread disponível",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "unique_ptr",
            blocks: [
                {
                    type: "text",
                    value: "# O dono único de custo zero\n\nstd::unique_ptr<T> é RAII aplicado à memória com a regra mais simples possível: UM dono por objeto. O unique_ptr guarda o ponteiro, o destrutor dele chama delete, e a cópia é proibida em tempo de compilação, porque copiar criaria dois donos. O que existe é MOVER: a posse é transferida, o dono antigo fica nulo, e continua havendo exatamente um responsável.\n\nO custo é o argumento que desarma os céticos: nenhum. Um unique_ptr com deleter padrão tem o tamanho de um ponteiro cru e gera o mesmo código de máquina que o new/delete manual escrito certo. Não há contador, não há sincronização, não há overhead escondido. Você troca uma classe de bugs (vazamento, double free, delete esquecido) por nada.\n\nCrie sempre com std::make_unique<T>(args): a alocação e a construção do dono acontecem numa expressão só, sem new aparecendo no seu código. Na revisão, a regra é binária: new visível fora de uma fábrica é cheiro; make_unique é o padrão.",
                },
                {
                    type: "code",
                    value: "#include <memory>\n\nauto motor = std::make_unique<Motor>(220);   // um dono, custo zero\nmotor->ligar();\n\n// std::unique_ptr<Motor> copia = motor;     // NAO compila: sem copia\nstd::unique_ptr<Motor> dono2 = std::move(motor);  // posse transferida\n// motor agora esta nulo; dono2 libera no fim do escopo\n\n// A posse aparece na assinatura:\nstd::unique_ptr<Relatorio> gerar();            // cria e ENTREGA a posse\nvoid arquivar(std::unique_ptr<Relatorio> r);   // ASSUME a posse\nvoid imprimir(const Relatorio& r);             // so le; posse fica fora",
                },
                {
                    type: "table",
                    value: '[["Assinatura","Contrato de posse"],["unique_ptr<T> f()","A função cria e ENTREGA o dono ao chamador"],["void f(unique_ptr<T> p)","A função ASSUME a posse do objeto"],["void f(const T& x)","Só lê; a posse permanece com o chamador"],["T* f()","Devolve observador; ninguém transfere posse"]]',
                },
                {
                    type: "quote",
                    value: "unique_ptr é o delete que você não escreve: o mesmo tamanho de um ponteiro, a mesma velocidade, e a posse documentada no sistema de tipos.",
                },
                {
                    type: "text",
                    value: "## unique_ptr desenhando APIs\n\nO ganho silencioso do unique_ptr é o que ele faz pelas assinaturas. Uma fábrica que retorna std::unique_ptr<Relatorio> diz, sem comentário nenhum: eu criei, o dono agora é você. Uma função que recebe unique_ptr POR VALOR diz: me entregue a posse; o chamador precisa escrever std::move no ponto da chamada, e essa palavra na tela é o aviso visual de que ele abriu mão do objeto.\n\nPra apenas usar o objeto, a função NÃO deve receber unique_ptr: recebe const T& ou T&. Passar smart pointer pra quem só lê acopla a função à estratégia de posse do chamador e impede de chamá-la com objetos na pilha. Quem só lê não precisa saber quem é o dono.\n\nComplete o quadro com dois utilitários: p.get() devolve o ponteiro cru pra interoperar com APIs que observam, e p.reset() libera antecipadamente ou troca o objeto. E quando o objeto é opcional dentro de uma classe, um membro unique_ptr nulo representa a ausência com liberação automática garantida.",
                },
            ],
            questions: [
                {
                    statement: "O que o unique_ptr garante sobre o objeto que ele aponta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um único dono, com delete automático no destrutor",
                            isCorrect: true,
                        },
                        {
                            text: "Vários donos simultâneos, com contagem de referências",
                            isCorrect: false,
                        },
                        {
                            text: "Que o objeto será realocado pra memória mais rápida",
                            isCorrect: false,
                        },
                        {
                            text: "Que o objeto sobrevive até o fim do programa inteiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que criar com std::make_unique em vez de new direto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cria objeto e dono numa expressão só, sem new solto",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o new foi removido das versões novas do C++",
                            isCorrect: false,
                        },
                        {
                            text: "Porque make_unique aloca em memória compartilhada",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o compilador não otimiza objetos vindos de new",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o custo do unique_ptr comparado a um ponteiro cru bem gerenciado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Praticamente zero: mesmo tamanho e mesmo código gerado",
                            isCorrect: true,
                        },
                        {
                            text: "Um contador atômico atualizado a cada atribuição feita",
                            isCorrect: false,
                        },
                        {
                            text: "Uma tabela interna de donos consultada a cada acesso",
                            isCorrect: false,
                        },
                        {
                            text: "O dobro da memória, pra guardar o ponteiro e o backup",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o unique_ptr proíbe cópia, permitindo apenas move?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cópia criaria dois donos e um double free no futuro",
                            isCorrect: true,
                        },
                        {
                            text: "Porque copiar ponteiros é lento demais pra produção",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o objeto apontado pode não ter construtor de cópia",
                            isCorrect: false,
                        },
                        {
                            text: "Limitação histórica do C++11 mantida por compatibilidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma função recebe std::unique_ptr<T> por valor. O que isso exige e significa pra quem chama?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Escrever std::move e abrir mão da posse do objeto",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: o ponteiro é copiado e os dois seguem donos",
                            isCorrect: false,
                        },
                        {
                            text: "Chamar get() e entregar o ponteiro cru interno",
                            isCorrect: false,
                        },
                        {
                            text: "Garantir que o objeto foi alocado fora do heap",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "shared_ptr e weak_ptr",
            blocks: [
                {
                    type: "text",
                    value: "# Posse compartilhada tem preço\n\nstd::shared_ptr<T> implementa posse COMPARTILHADA: cada cópia incrementa um contador, cada destruição decrementa, e o último dono a sair apaga a luz, deletando o objeto. Junto do objeto vive um bloco de controle com o contador, e é aí que mora o custo: o contador é ATÔMICO, porque donos podem morar em threads diferentes. Cada cópia de shared_ptr é uma operação atômica de leitura-modificação-escrita, que força sincronização entre núcleos e invalida linha de cache. Copiado dentro de um loop quente, o shared_ptr vira gargalo mensurável.\n\nPrefira std::make_shared<T>(args) ao construir: objeto e bloco de controle nascem numa alocação única e vizinha, melhor pra alocador e pra cache, em vez de duas alocações separadas.\n\nE a regra de design que evita o abuso: shared_ptr é pra quando a posse é GENUINAMENTE compartilhada, sem um dono com vida garantidamente mais longa. Se existe um dono natural, unique_ptr nele e referências pros demais resolvem mais barato e mais claro.",
                },
                {
                    type: "code",
                    value: "#include <memory>\n#include <vector>\n\nstruct Pai;\n\nstruct Filho {\n    std::weak_ptr<Pai> pai;   // observa SEM prender: quebra o ciclo\n    void reagir();\n};\n\nstruct Pai {\n    std::vector<std::shared_ptr<Filho>> filhos;  // pai e dono dos filhos\n};\n\nvoid usar(const std::shared_ptr<Filho>& f) {\n    if (auto p = f->pai.lock()) {   // promove weak -> shared\n        // p e um shared_ptr valido enquanto este bloco viver\n    } else {\n        // o pai ja morreu: trate a ausencia\n    }\n}",
                },
                {
                    type: "table",
                    value: '[["Aspecto","shared_ptr","weak_ptr"],["Conta no contador de posse","Sim, atômico","Não; observa o bloco"],["Mantém o objeto vivo","Sim","Não"],["Como acessa","Direto, como ponteiro","lock() devolve shared ou vazio"],["Papel num ciclo","Cria o vazamento","Quebra o vazamento"]]',
                },
                {
                    type: "quote",
                    value: "Quando todo mundo é dono, ninguém é dono: shared_ptr espalhado pela base costuma ser a assinatura de um design que nunca decidiu quem manda em quem.",
                },
                {
                    type: "text",
                    value: "## Ciclos, e como o weak_ptr os quebra\n\nA contagem de referências tem um ponto cego famoso: o CICLO. Se Pai guarda shared_ptr de Filho e Filho guarda shared_ptr de Pai, os contadores dos dois nunca chegam a zero, mesmo quando o resto do programa esqueceu ambos. Nenhum destrutor roda; a memória vaza em silêncio. Garbage collectors detectam ciclos; contagem de referências, não.\n\nA solução é decidir a DIREÇÃO da posse: o pai é dono do filho (shared_ptr pra baixo), o filho apenas OBSERVA o pai (weak_ptr pra cima). O weak_ptr conhece o bloco de controle mas não conta como dono. Pra usar, chame lock(): se o objeto ainda vive, você recebe um shared_ptr temporário que o mantém vivo durante o uso; se já morreu, recebe vazio e trata a ausência. Sem dangling, sem prender a vida de ninguém.\n\nO padrão vale pra qualquer relação de volta: caches que apontam pra entradas, observers que apontam pro publicador, filhos pra pais. Posse desce; observação sobe.",
                },
            ],
            questions: [
                {
                    statement: "Quando o objeto gerenciado por shared_ptr é destruído?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando o último dono solta e o contador chega a zero",
                            isCorrect: true,
                        },
                        {
                            text: "Quando o primeiro dos donos sai do escopo em que vive",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o coletor de ciclos roda a próxima varredura",
                            isCorrect: false,
                        },
                        {
                            text: "Quando alguém chama delete no ponteiro interno dele",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que um weak_ptr faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Observa o objeto sem mantê-lo vivo no contador",
                            isCorrect: true,
                        },
                        {
                            text: "Mantém o objeto vivo com contagem mais barata",
                            isCorrect: false,
                        },
                        {
                            text: "Aponta pra objetos que vivem apenas na pilha",
                            isCorrect: false,
                        },
                        {
                            text: "Congela o objeto, impedindo qualquer modificação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "De onde vem o custo real de copiar um shared_ptr?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Do incremento atômico, que sincroniza os núcleos",
                            isCorrect: true,
                        },
                        {
                            text: "Da cópia profunda do objeto apontado a cada cópia",
                            isCorrect: false,
                        },
                        {
                            text: "Da realocação do bloco de controle pra outro endereço",
                            isCorrect: false,
                        },
                        {
                            text: "Do registro de cada novo dono numa tabela do sistema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um ciclo de shared_ptr vaza memória?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os contadores se seguram e nunca chegam a zero",
                            isCorrect: true,
                        },
                        {
                            text: "O bloco de controle corrompe quando há dois donos",
                            isCorrect: false,
                        },
                        {
                            text: "O contador atômico estoura o limite e congela",
                            isCorrect: false,
                        },
                        {
                            text: "Objetos em ciclo são movidos pra memória estática",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a vantagem de construir com std::make_shared?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Objeto e bloco de controle numa alocação única",
                            isCorrect: true,
                        },
                        {
                            text: "O contador deixa de precisar de operações atômicas",
                            isCorrect: false,
                        },
                        {
                            text: "O objeto pode ser copiado sem incrementar o contador",
                            isCorrect: false,
                        },
                        {
                            text: "Elimina o bloco de controle e usa só o ponteiro",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Regra dos zero, três e cinco",
            blocks: [
                {
                    type: "text",
                    value: "# Quando o compilador basta\n\nO compilador sabe gerar seis funções especiais pra sua classe: construtor padrão, destrutor, construtor de cópia, atribuição de cópia, construtor de move e atribuição de move. A REGRA DO ZERO diz: se todos os seus membros já são tipos RAII (string, vector, unique_ptr), não escreva NENHUMA delas. As versões geradas copiam membro a membro, movem membro a membro e destroem membro a membro, e isso é exatamente o comportamento correto. Classe de domínio bem desenhada tem zero funções especiais e zero bugs de gerenciamento.\n\nO problema começa quando a classe gerencia um recurso CRU: um ponteiro de new[], um handle de arquivo do sistema, um socket. O destrutor gerado não sabe liberar isso, então você escreve um destrutor. E aqui entra a REGRA DOS TRÊS, herdada do C++98: quem escreve o destrutor precisa escrever também a cópia (construtor e atribuição), porque as versões geradas copiariam o PONTEIRO, não o recurso, e dois destrutores liberariam o mesmo bloco.",
                },
                {
                    type: "code",
                    value: "#include <string>\n#include <vector>\n\n// Regra do ZERO: membros RAII, nenhuma funcao especial escrita\nclass Pedido {\n    std::string cliente_;\n    std::vector<Item> itens_;\n    // copia, move e destruicao CORRETAS geradas pelo compilador\n};\n\n// Regra dos CINCO: a classe gerencia um recurso cru\nclass Textura {\npublic:\n    explicit Textura(const char* arquivo);\n    ~Textura();                                  // 1: libera o handle\n    Textura(const Textura&);                     // 2: copia profunda\n    Textura& operator=(const Textura&);          // 3\n    Textura(Textura&&) noexcept;                 // 4: rouba o handle\n    Textura& operator=(Textura&&) noexcept;      // 5\nprivate:\n    unsigned handle_ = 0;\n};",
                },
                {
                    type: "table",
                    value: '[["Situação da classe","Regra","O que escrever"],["Só membros RAII","Zero","Nada; o compilador gera tudo certo"],["Gerencia recurso cru","Cinco","Destrutor, cópia e move (ou =delete)"],["Base polimórfica","Zero + virtual","Destrutor virtual =default"],["Cópia não faz sentido","Explícita","Cópia =delete; move se fizer sentido"]]',
                },
                {
                    type: "quote",
                    value: "Se você escreveu um destrutor, o compilador não sabe mais copiar nem mover sua classe corretamente. A regra dos cinco é a conta completa desse aviso.",
                },
                {
                    type: "text",
                    value: "## Dos três aos cinco, e as ferramentas =default e =delete\n\nO C++11 somou o move ao pacote e os três viraram CINCO: destrutor, cópia (construtor e atribuição) e move (construtor e atribuição). O detalhe traiçoeiro: declarar destrutor ou cópia SUPRIME a geração do move. A classe continua compilando, mas todo std::move nela silenciosamente vira cópia. É o tipo de regressão de performance que nenhum teste funcional pega, e a razão de a regra dos cinco ser cobrada em review.\n\nDuas palavras completam o vocabulário. Com =default você pede explicitamente a versão gerada (útil pro destrutor virtual de uma base: virtual ~Base() = default). Com =delete você proíbe a operação: uma classe que não deve ser copiada declara a cópia como deletada e o erro aparece na COMPILAÇÃO de quem tentar, não em produção.\n\nA hierarquia de preferência em 2026: regra do zero sempre que possível (empurre o recurso cru pra um membro RAII dedicado); regra dos cinco completa quando inevitável; e =delete pra fechar portas que não devem existir.",
                },
            ],
            questions: [
                {
                    statement: "Quando a regra do zero se aplica a uma classe?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando todos os membros já são tipos RAII adequados",
                            isCorrect: true,
                        },
                        {
                            text: "Quando a classe não tem nenhum membro de dado interno",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a classe nunca é instanciada fora de testes",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o projeto compila com exceções desativadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais funções compõem a regra dos cinco?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Destrutor, cópia (ctor e =) e move (ctor e =)",
                            isCorrect: true,
                        },
                        {
                            text: "Construtor padrão, destrutor e três operadores",
                            isCorrect: false,
                        },
                        {
                            text: "Cinco construtores com listas de parâmetros diferentes",
                            isCorrect: false,
                        },
                        {
                            text: "new, delete, new[], delete[] e o destrutor da classe",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que escrever um destrutor obriga a cuidar também da cópia?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A cópia gerada é rasa e levaria a liberação dupla",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador apaga a cópia quando vê um destrutor",
                            isCorrect: false,
                        },
                        {
                            text: "Destrutor manual desativa o RAII dos membros da classe",
                            isCorrect: false,
                        },
                        {
                            text: "A linguagem exige as cinco funções sempre juntas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Pra que servem =default e =delete?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pedir a versão gerada e proibir a operação, na ordem",
                            isCorrect: true,
                        },
                        {
                            text: "Definir valores padrão e remover membros herdados",
                            isCorrect: false,
                        },
                        {
                            text: "Ativar e desativar exceções em funções específicas",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher entre alocação na pilha e alocação no heap",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma classe declara destrutor e nada mais. O que acontece com o move dela?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Não é gerado: cada std::move vira cópia silenciosa",
                            isCorrect: true,
                        },
                        {
                            text: "É gerado normalmente, junto com as demais funções",
                            isCorrect: false,
                        },
                        {
                            text: "Vira erro de compilação em qualquer uso de std::move",
                            isCorrect: false,
                        },
                        {
                            text: "É gerado, mas lança exceção na primeira utilização",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ownership como design",
            blocks: [
                {
                    type: "text",
                    value: '# A assinatura conta quem é dono\n\nJunte as peças do módulo e o resultado é um sistema de comunicação: em C++ moderno, a ASSINATURA declara a relação de posse entre quem chama e quem é chamado. T por valor: quero minha própria cópia (ou vou consumir o dado). const T&: só leio, o dono é você. T&: modifico o seu, o dono segue sendo você. T*: observo, pode não existir. unique_ptr<T> por valor: me transfira a posse. shared_ptr<T>: seremos donos juntos, com contador. weak_ptr<T>: quero poder perguntar se ainda existe.\n\nLida assim, uma API vira um mapa de responsabilidades. Você bate o olho em std::unique_ptr<Conexao> abrir(Config) e sabe que a função fabrica e entrega; em void enviar(const Pacote&) e sabe que ninguém muda nem retém nada; em Estatisticas* metricas() e sabe que o retorno é emprestado e pode faltar.\n\nO contrário também vale: assinatura que mente sobre posse é dívida. Um T* retornado que o chamador "precisa saber" que deve deletar é exatamente o tipo de contrato invisível que esta trilha ensina a eliminar.',
                },
                {
                    type: "code",
                    value: "#include <memory>\n\nclass Sessao {\npublic:\n    // Assume a posse da conexao: o chamador entrega com std::move\n    explicit Sessao(std::unique_ptr<Conexao> con)\n        : con_(std::move(con)) {}\n\n    void usar(const Config& cfg);      // le; nao retem nada\n    void renomear(std::string nome);   // valor: vai GUARDAR a copia\n    Estatisticas* metricas();          // observador; pode ser nullptr\n\nprivate:\n    std::unique_ptr<Conexao> con_;     // a Sessao e a dona\n    std::string nome_;\n};",
                },
                {
                    type: "table",
                    value: '[["Você quer","Assinatura","Onde fica a posse"],["Ler um objeto caro","const T&","Com o chamador"],["Modificar no lugar","T&","Com o chamador"],["Guardar ou consumir uma cópia","T por valor","Cópia é sua"],["Assumir posse única","unique_ptr<T> por valor","Transferida pra você"],["Compartilhar posse real","shared_ptr<T>","Dividida e contada"],["Observar, podendo faltar","T*","De ninguém; só observa"]]',
                },
                {
                    type: "quote",
                    value: "A assinatura é o contrato de posse. Se pra descobrir quem deleta o quê você precisa abrir a implementação, a API já falhou o review.",
                },
                {
                    type: "text",
                    value: '## Aplicando a tabela sem dogma\n\nDois lembretes impedem que a tabela vire religião. Primeiro: a hierarquia de custo e clareza favorece as formas simples. A maior parte das funções deve receber const T& ou valor barato; smart pointer em parâmetro só aparece quando a POSSE em si faz parte do contrato. Função que só lê um Widget não recebe shared_ptr<Widget>: recebe const Widget&, e funciona com objeto na pilha, no heap, membro de outra classe, tanto faz.\n\nSegundo: shared_ptr é a resposta CORRETA quando a pergunta é "vários donos com vidas independentes, e o último apaga a luz". Um cache que entrega blobs pra threads que os usam por tempo indeterminado é o exemplo honesto: nem o cache pode morrer prendendo os usuários, nem os usuários sabem quem termina por último. Aí o contador atômico paga o próprio aluguel.\n\nFora desses casos, o desenho padrão do módulo se sustenta: cada recurso com um dono claro (valor ou unique_ptr), emprestado por referência pra quem usa, observado por ponteiro cru ou weak_ptr quando pode faltar.',
                },
            ],
            questions: [
                {
                    statement: "Numa API moderna, o que const T& comunica sobre posse?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A posse fica com o chamador; a função apenas lê",
                            isCorrect: true,
                        },
                        {
                            text: "A função assume a posse até o fim da execução",
                            isCorrect: false,
                        },
                        {
                            text: "O objeto passa a ter dois donos com contagem",
                            isCorrect: false,
                        },
                        {
                            text: "A posse é transferida e o chamador perde acesso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa um parâmetro std::unique_ptr<T> por valor?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A função pede a transferência da posse única",
                            isCorrect: true,
                        },
                        {
                            text: "A função quer apenas observar sem custo extra",
                            isCorrect: false,
                        },
                        {
                            text: "O objeto será copiado profundamente na entrada",
                            isCorrect: false,
                        },
                        {
                            text: "O chamador continua dono e a função só empresta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que uma função que só lê um Widget NÃO deve receber shared_ptr<Widget>?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Acopla à estratégia de posse e exclui objetos da pilha",
                            isCorrect: true,
                        },
                        {
                            text: "Porque shared_ptr não permite chamar métodos const",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a leitura zeraria o contador de referências",
                            isCorrect: false,
                        },
                        {
                            text: "Porque parâmetros shared_ptr são proibidos pelo padrão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando receber T por valor é a escolha certa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quando a função vai guardar ou consumir uma cópia própria",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre que T tiver qualquer membro alocado no heap",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a função precisa modificar o objeto do chamador",
                            isCorrect: false,
                        },
                        {
                            text: "Somente quando T é uma classe sem construtor de cópia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um cache entrega blobs pra várias threads que os usam por tempo indeterminado. Qual desenho de posse se justifica?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "shared_ptr: donos com vidas independentes, o último libera",
                            isCorrect: true,
                        },
                        {
                            text: "unique_ptr no cache e ponteiros crus pros usuários finais",
                            isCorrect: false,
                        },
                        {
                            text: "Cópia do blob por thread, pra evitar qualquer contagem",
                            isCorrect: false,
                        },
                        {
                            text: "Referências const pra todos, com o cache podendo morrer",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Move semantics",
    aulas: [
        {
            titulo: "O problema das cópias caras",
            blocks: [
                {
                    type: "text",
                    value: "# O desperdício que o C++ antigo aceitava\n\nPegue a operação mais comum de um programa de verdade: montar uma coleção e devolvê-la. No C++98, cada passo dessa rotina podia disparar uma cópia completa. Um temporário de string criado numa concatenação era COPIADO pro destino e jogado fora. Um push_back de temporário copiava o objeto pra dentro do vetor e destruía o original um instante depois. E quando o vector crescia além da capacidade, todos os elementos eram copiados pro bloco novo, um a um.\n\nRepare no absurdo específico do caso: a fonte da cópia era um objeto PRESTES A MORRER. Copiávamos um milhão de bytes de um buffer que seria liberado na linha seguinte, quando bastaria... ficar com o buffer. O objeto moribundo não precisava de despedida cara; precisava ser saqueado.\n\nOs programadores da época contornavam com truques: passar o destino por referência pra preencher, funções swap espertas, contadores de referência manuais. O C++11 transformou o truque em recurso de linguagem: o MOVE, a capacidade oficial de transferir os recursos de um objeto que está de saída.",
                },
                {
                    type: "code",
                    value: '#include <string>\n#include <vector>\n\nstd::vector<std::string> carregar();   // devolve 1 milhao de nomes\n\n// A rotina inocente, e o que o C++98 fazia com ela:\nstd::string a = "relatorio-";\nstd::string b = a + "final";      // temporario "relatorio-final": COPIADO\n\nstd::vector<std::string> nomes;\nnomes.push_back(a + "v2");        // outro temporario COPIADO pro vetor\n\nstd::vector<std::string> todos = carregar();\n// retorno por valor: copia integral, salvo quando a elisao (RVO) salvava',
                },
                {
                    type: "table",
                    value: '[["Operação","C++98","C++11 em diante"],["Retornar vector por valor","Cópia, salvo elisão","Elisão ou move barato"],["push_back de temporário","Cópia completa","Move: rouba o bloco"],["Concatenar strings encadeadas","Temporários copiados","Temporários movidos"],["Realocação no crescimento","Copia elemento a elemento","Move, se noexcept"]]',
                },
                {
                    type: "quote",
                    value: "O crime do C++ antigo não era copiar: era copiar de um objeto que morreria na linha seguinte, pagando preço de mudança por algo que era um despejo.",
                },
                {
                    type: "text",
                    value: "## O que o move promete\n\nA ideia central cabe numa frase: quando a FONTE é um temporário, em vez de duplicar os recursos dela, o destino os TOMA. Pra um vector, isso significa três ponteiros trocando de mãos (início, fim, capacidade) em vez de uma alocação nova e um percurso de cópia; pra uma string, o buffer inteiro muda de dono em tempo constante. O custo despenca de O(n) com alocação pra O(1) sem alocação.\n\nE a segurança vem da aula de lvalue e rvalue do módulo 1: o compilador SABE quando uma expressão é um temporário. A sobrecarga que recebe T&& só é escolhida pra rvalues, então o roubo de recursos só acontece quando ninguém mais vai olhar pra fonte. Nenhuma cópia legítima muda de comportamento; só o desperdício desaparece.\n\nNeste módulo você vai ver as quatro peças da mecânica: o que std::move realmente é (aula 2), como escrever construtor e atribuição de move com noexcept (aula 3), o que o compilador já elide sem você pedir (aula 4) e os lugares onde o move NÃO acontece e a cópia volta em silêncio (aula 5).",
                },
            ],
            questions: [
                {
                    statement: "No C++98, o que acontecia num push_back de um temporário caro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O temporário era copiado pro vetor e destruído em seguida",
                            isCorrect: true,
                        },
                        {
                            text: "O temporário entrava no vetor sem custo, por referência",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador recusava temporários em push_back na época",
                            isCorrect: false,
                        },
                        {
                            text: "O vetor guardava um ponteiro pro temporário original",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que torna a cópia de um vector grande uma operação cara?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Alocar um bloco novo e copiar cada elemento pra ele",
                            isCorrect: true,
                        },
                        {
                            text: "A verificação de tipos feita em tempo de execução",
                            isCorrect: false,
                        },
                        {
                            text: "O bloqueio do heap inteiro durante toda a operação",
                            isCorrect: false,
                        },
                        {
                            text: "A conversão dos elementos pra um formato serializado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a ideia central do move semantics?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Transferir os recursos de um objeto que está morrendo",
                            isCorrect: true,
                        },
                        {
                            text: "Comprimir os dados dos objetos antes de cada cópia",
                            isCorrect: false,
                        },
                        {
                            text: "Alocar todos os temporários num heap mais rápido",
                            isCorrect: false,
                        },
                        {
                            text: "Adiar as cópias até o fim do escopo da função atual",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que mover um vector custa O(1) enquanto copiá-lo custa O(n)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O move só troca os ponteiros internos de dono",
                            isCorrect: true,
                        },
                        {
                            text: "O move copia os elementos em blocos maiores",
                            isCorrect: false,
                        },
                        {
                            text: "O move usa instruções vetoriais e a cópia não",
                            isCorrect: false,
                        },
                        {
                            text: "O move delega a cópia pra uma thread paralela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como o compilador garante que o roubo de recursos só acontece com segurança?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A sobrecarga T&& só é escolhida pra expressões rvalue",
                            isCorrect: true,
                        },
                        {
                            text: "Um contador em runtime marca os objetos já saqueados",
                            isCorrect: false,
                        },
                        {
                            text: "O linker remove as cópias que julga desnecessárias",
                            isCorrect: false,
                        },
                        {
                            text: "Todo objeto movido é bloqueado contra novas leituras",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "std::move não move",
            blocks: [
                {
                    type: "text",
                    value: '# O cast mais mal batizado da linguagem\n\nstd::move não move nada. É um CAST: converte a expressão pra rvalue (tecnicamente um xvalue), e nada mais. Nenhum byte anda de lugar quando você escreve std::move(x). O que a conversão faz é mudar QUAL sobrecarga será escolhida na sequência: com a expressão marcada como rvalue, o construtor de move (ou a atribuição de move) do tipo passa a ganhar a disputa da resolução de sobrecarga. Quem move é o CONSTRUTOR; o std::move só abre a porta.\n\nA leitura correta de auto b = std::move(a) é: "declaro que não me importo mais com o valor de a; tipo, faça o que for mais barato". Se o tipo tem move, os recursos de a são roubados. Se não tem, o código COMPILA DO MESMO JEITO e faz uma cópia. Essa é a pegadinha silenciosa: std::move é um pedido, não uma garantia, e a aula 5 mostra os casos em que o pedido é negado.\n\nInternamente é só static_cast<T&&>(x). Um nome como as_rvalue teria poupado uma década de confusão.',
                },
                {
                    type: "code",
                    value: '#include <string>\n#include <utility>\n\nstd::string origem = "um texto grande o bastante pro heap";\nstd::string destino = std::move(origem);   // AQUI o move ctor rouba o buffer\n\n// origem esta agora VALIDA, MAS NAO ESPECIFICADA:\norigem.size();          // ok chamar; o valor nao e prometido\norigem = "de novo";     // ok: reatribuir e o uso classico\norigem.clear();         // ok: leva a um estado conhecido\n\n// if (origem == "...")  NAO presuma conteudo sem reatribuir antes\n\n// std::move e literalmente so isto:\n// static_cast<std::string&&>(origem)',
                },
                {
                    type: "table",
                    value: '[["Objeto movido","Uso seguro","Uso errado"],["std::string","Reatribuir, clear, destruir","Presumir o conteúdo antigo"],["std::vector","assign, push_back, destruir","Presumir size ou capacidade"],["std::unique_ptr","Testar contra nullptr, reset","Derreferenciar sem checar"]]',
                },
                {
                    type: "quote",
                    value: "std::move não move: apenas declara que você abriu mão do valor. Quem move é o construtor de move do tipo, e somente se ele existir.",
                },
                {
                    type: "text",
                    value: "## O estado válido-mas-não-especificado\n\nO que sobra na fonte depois do move? O padrão responde com precisão burocrática: um estado VÁLIDO, PORÉM NÃO ESPECIFICADO. Válido significa que os invariantes da classe seguem de pé: pode destruir, pode reatribuir, pode chamar métodos sem pré-condição (size, clear, empty). Não especificado significa que o VALOR não é prometido: a string movida costuma ficar vazia na prática (com SSO ela pode até manter os caracteres), mas escrever código que dependa disso é bug esperando compilador novo.\n\nA disciplina de uso é curta: depois de mover, ou o objeto morre, ou recebe valor novo antes de qualquer leitura. std::unique_ptr é a exceção agradável, com garantia mais forte: movido, fica nulo, e testar contra nullptr é legítimo.\n\nEm review, procure o padrão perigoso: um std::move no meio da função e a mesma variável LIDA linhas abaixo. Ou o move está cedo demais, ou a leitura sobrou de uma refatoração. Os sanitizers não pegam esse erro, porque não é UB; é só um valor que ninguém prometeu.",
                },
            ],
            questions: [
                {
                    statement: "O que std::move faz, exatamente?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Converte a expressão pra rvalue, sem mover nada",
                            isCorrect: true,
                        },
                        {
                            text: "Copia os bytes da fonte pro destino na hora",
                            isCorrect: false,
                        },
                        {
                            text: "Libera a memória da fonte e devolve o ponteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Marca o objeto como imutável até ser destruído",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quem efetivamente transfere os recursos num move?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O construtor ou a atribuição de move do tipo",
                            isCorrect: true,
                        },
                        {
                            text: "A própria função std::move, ao ser executada",
                            isCorrect: false,
                        },
                        {
                            text: "O destrutor da fonte, no fim do escopo dela",
                            isCorrect: false,
                        },
                        {
                            text: "O alocador global, ao detectar o temporário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que significa o estado 'válido, mas não especificado' de um objeto movido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Invariantes de pé; o valor atual não é prometido",
                            isCorrect: true,
                        },
                        {
                            text: "O objeto está corrompido e só pode ser destruído",
                            isCorrect: false,
                        },
                        {
                            text: "O objeto mantém o valor antigo até a próxima escrita",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer uso do objeto é comportamento indefinido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais usos são seguros num objeto que acabou de ser movido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reatribuir um valor novo, limpar ou destruir",
                            isCorrect: true,
                        },
                        {
                            text: "Ler o conteúdo, desde que na mesma função",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar com o valor que ele tinha antes do move",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: tocar no objeto movido é sempre erro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você aplica std::move num tipo sem construtor de move. O que acontece?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Compila e cai na cópia, sem nenhum aviso",
                            isCorrect: true,
                        },
                        {
                            text: "Erro de compilação apontando o move ausente",
                            isCorrect: false,
                        },
                        {
                            text: "Exceção de move lançada em tempo de execução",
                            isCorrect: false,
                        },
                        {
                            text: "O objeto é movido byte a byte pelo compilador",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Construtor e atribuição move",
            blocks: [
                {
                    type: "text",
                    value: "# Escrevendo o roubo à mão\n\nQuando a classe segue a regra do zero, o move vem de graça. Mas você precisa saber escrevê-lo, tanto pros casos inevitáveis de recurso cru quanto pra LER o que o compilador gera. A receita do construtor de move tem três passos: ROUBAR os ponteiros e valores da fonte (cópia rasa, barata), ZERAR a fonte pra que o destrutor dela não libere o que agora é seu, e nada mais. Sem alocação, sem percorrer dados: só troca de titularidade.\n\nA atribuição de move soma dois cuidados: liberar o recurso ATUAL do destino antes de roubar (senão ele vaza) e proteger contra self-move, porque a = std::move(a), ainda que absurdo, não pode corromper o objeto.\n\nE a palavra que não é opcional: NOEXCEPT. Move que não aloca não tem motivo pra lançar, e declarar isso muda o comportamento da biblioteca padrão, como o próximo bloco mostra. Todo construtor e atribuição de move que você escrever nesta trilha leva noexcept, e o seu revisor vai cobrar o mesmo.",
                },
                {
                    type: "code",
                    value: "#include <cstddef>\n\nclass Buffer {\npublic:\n    Buffer(Buffer&& outro) noexcept\n        : dados_(outro.dados_), tam_(outro.tam_) {   // 1: rouba\n        outro.dados_ = nullptr;                      // 2: zera a fonte\n        outro.tam_ = 0;\n    }\n\n    Buffer& operator=(Buffer&& outro) noexcept {\n        if (this != &outro) {          // guarda contra self-move\n            delete[] dados_;           // libera o recurso atual\n            dados_ = outro.dados_;     // rouba\n            tam_ = outro.tam_;\n            outro.dados_ = nullptr;    // zera\n            outro.tam_ = 0;\n        }\n        return *this;\n    }\n\nprivate:\n    char* dados_ = nullptr;\n    std::size_t tam_ = 0;\n};",
                },
                {
                    type: "table",
                    value: '[["Passo do move","Por quê"],["Roubar ponteiros e tamanhos","Custo O(1), nenhuma alocação"],["Zerar a fonte","O destrutor dela não pode liberar o roubado"],["Liberar o destino (na atribuição)","O recurso antigo vazaria"],["Guardar contra self-move","a = std::move(a) não pode corromper"],["Marcar noexcept","O vector só move na realocação se não lança"]]',
                },
                {
                    type: "quote",
                    value: "Move sem noexcept é move pela metade: compila, funciona no teste, e o vector silenciosamente escolhe COPIAR seus objetos na hora de crescer.",
                },
                {
                    type: "text",
                    value: "## Por que o vector exige noexcept\n\nQuando um vector realoca, ele precisa transportar os elementos pro bloco novo, mantendo a GARANTIA FORTE: se algo lançar no meio, o vector original permanece intacto. Com cópia, a garantia é fácil: se a cópia número 700 mil lançar, o bloco antigo segue completo; joga-se o novo fora. Com move, não: os primeiros 700 mil elementos já foram SAQUEADOS do bloco antigo, e não há como voltar atrás sem mover de novo (e o move de volta também poderia lançar).\n\nA saída da biblioteca é contratual: o vector usa std::move_if_noexcept. Se o move do seu tipo é noexcept, ele move, rápido. Se não é, ele COPIA tudo, pra preservar a garantia. A consequência prática é brutal: esquecer o noexcept não quebra nada visível, só faz cada realocação pagar cópia integral.\n\nVerifique com um teste de compilação: static_assert(std::is_nothrow_move_constructible_v<Buffer>). Uma linha no header e a regressão silenciosa vira erro de build quando alguém mexer na classe.",
                },
            ],
            questions: [
                {
                    statement: "Quais são os dois passos essenciais de um construtor de move?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Roubar os ponteiros da fonte e zerá-la em seguida",
                            isCorrect: true,
                        },
                        {
                            text: "Alocar um bloco novo e copiar os dados pra ele",
                            isCorrect: false,
                        },
                        {
                            text: "Travar a fonte com mutex e clonar os membros dela",
                            isCorrect: false,
                        },
                        {
                            text: "Serializar a fonte e reconstruí-la dentro do destino",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a fonte precisa ser zerada depois do roubo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O destrutor dela liberaria a memória que agora é sua",
                            isCorrect: true,
                        },
                        {
                            text: "O padrão exige fontes zeradas pra fins de depuração",
                            isCorrect: false,
                        },
                        {
                            text: "Ponteiros duplicados são detectados e abortam o programa",
                            isCorrect: false,
                        },
                        {
                            text: "A fonte zerada economiza memória até o fim do escopo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que a atribuição de move precisa fazer além do que o construtor de move faz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Liberar o recurso atual do destino e tratar self-move",
                            isCorrect: true,
                        },
                        {
                            text: "Realocar o destino pro tamanho exato da fonte movida",
                            isCorrect: false,
                        },
                        {
                            text: "Notificar o alocador global da troca de titularidade",
                            isCorrect: false,
                        },
                        {
                            text: "Copiar os dados como reserva antes de roubar a fonte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o vector precisa da garantia noexcept pra mover na realocação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um throw no meio deixaria elementos já saqueados, sem volta",
                            isCorrect: true,
                        },
                        {
                            text: "Moves com exceção ativa são mais lentos que cópias comuns",
                            isCorrect: false,
                        },
                        {
                            text: "O noexcept permite mover vários elementos em paralelo",
                            isCorrect: false,
                        },
                        {
                            text: "Sem noexcept o destrutor dos elementos não pode ser chamado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Sua classe tem move correto, porém sem noexcept. O que acontece quando um vector dela cresce?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Os elementos são COPIADOS, preservando a garantia forte",
                            isCorrect: true,
                        },
                        {
                            text: "A realocação falha e o vector recusa novos elementos",
                            isCorrect: false,
                        },
                        {
                            text: "Os elementos são movidos normalmente, sem diferença",
                            isCorrect: false,
                        },
                        {
                            text: "O programa encerra na primeira realocação executada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "RVO e NRVO",
            blocks: [
                {
                    type: "text",
                    value: "# O compilador elide antes de você otimizar\n\nAntes de aplicar move em tudo, conheça o que o compilador já faz SOZINHO. RVO (Return Value Optimization) é a elisão de cópia no retorno: em vez de construir o objeto dentro da função e transportá-lo pra fora, o compilador constrói o objeto DIRETO no lugar do chamador. Nenhuma cópia, nenhum move: as duas pontas usam o mesmo endereço desde o início.\n\nDesde o C++17, isso deixou de ser otimização opcional num caso importante: retornar um prvalue (return std::vector<int>(1000000)) tem elisão GARANTIDA por regra da linguagem. Não é o otimizador sendo gentil; é o padrão exigindo. O tipo nem precisa ter construtor de cópia ou de move nesse caso.\n\nQuando você retorna uma variável local NOMEADA (constrói v, preenche, return v), entra a NRVO (Named RVO): permitida e praticada pelos compiladores na enorme maioria dos casos, mas não garantida. E o plano B, se a NRVO não se aplicar, já é bom: variável local em return é tratada como rvalue automaticamente, então sai um MOVE, nunca uma cópia cara.",
                },
                {
                    type: "code",
                    value: "#include <vector>\n\nstd::vector<int> fabricar() {\n    return std::vector<int>(1'000'000, 0);   // prvalue: elisao GARANTIDA (C++17)\n}\n\nstd::vector<int> preparar() {\n    std::vector<int> v;          // variavel nomeada\n    v.reserve(1'000'000);\n    // preencher(v);\n    return v;                    // NRVO provavel; pior caso: MOVE\n}\n\nauto dados = fabricar();   // construido direto em 'dados': zero copia\n\n// O anti-padrao que a elisao aposentou:\nvoid preparar_no_estilo_antigo(std::vector<int>& saida);  // out-param",
                },
                {
                    type: "table",
                    value: '[["Forma de retorno","O que acontece","Custo"],["return T(args)","Elisão garantida desde C++17","Zero"],["return local nomeada","NRVO comum; senão, move","Zero ou O(1)"],["return std::move(local)","Elisão IMPEDIDA; move forçado","O(1) desnecessário"],["Parâmetro de saída T&","Sem elisão; API poluída","Legibilidade paga junto"]]',
                },
                {
                    type: "quote",
                    value: "Retornar por valor deixou de ser um gesto caro: o compilador constrói o resultado direto no destino. Leia o que ele já faz antes de otimizar por conta.",
                },
                {
                    type: "text",
                    value: '## Retorne por valor, sem medo\n\nA consequência de RVO, NRVO e move juntos é uma regra de API libertadora: RETORNE POR VALOR. A função que fabrica um vector devolve o vector; a que monta uma string devolve a string. O velho reflexo de receber um T& de saída pra "evitar a cópia do retorno" perdeu a razão técnica de existir, e custa caro em legibilidade: parâmetro de saída não deixa claro o que a função produz, impede compor chamadas e obriga o chamador a pré-construir um objeto vazio.\n\nPra NRVO trabalhar a seu favor, ajude o compilador: retorne UMA variável local (não escolha entre duas em ramos diferentes), do mesmo tipo do retorno, sem envolvê-la em condicionais criativos. Funções que criam e devolvem num fluxo direto ganham elisão quase sempre.\n\nE fica o teste mental pro review: se você vê um std::move num return de variável local, ou um parâmetro de saída numa função nova, a pergunta é "que cópia isso está tentando evitar?". Em 2026, a resposta quase sempre é: uma que já não existia.',
                },
            ],
            questions: [
                {
                    statement: "O que a RVO faz com o objeto retornado por valor?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Constrói o objeto direto no destino, sem cópia nem move",
                            isCorrect: true,
                        },
                        {
                            text: "Copia o objeto usando um buffer intermediário rápido",
                            isCorrect: false,
                        },
                        {
                            text: "Move o objeto duas vezes, da função pro chamador",
                            isCorrect: false,
                        },
                        {
                            text: "Guarda o objeto num cache global de retornos recentes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Desde o C++17, quando a elisão de cópia no retorno é GARANTIDA?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ao retornar um prvalue, como return T(args)",
                            isCorrect: true,
                        },
                        {
                            text: "Em qualquer return de uma função marcada inline",
                            isCorrect: false,
                        },
                        {
                            text: "Somente em funções que retornam tipos primitivos",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a função é chamada uma única vez no programa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Se a NRVO não se aplicar a uma variável local retornada, qual é o pior caso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um move da local, tratada como rvalue no return",
                            isCorrect: true,
                        },
                        {
                            text: "Uma cópia completa do objeto local retornado",
                            isCorrect: false,
                        },
                        {
                            text: "Um erro de compilação pedindo std::move explícito",
                            isCorrect: false,
                        },
                        {
                            text: "Uma realocação do objeto no heap do chamador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o parâmetro de saída (T& out) perdeu a justificativa de performance?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Elisão e move fazem o retorno por valor custar quase nada",
                            isCorrect: true,
                        },
                        {
                            text: "Referências ficaram mais caras que cópias nos compiladores",
                            isCorrect: false,
                        },
                        {
                            text: "O padrão proibiu referências não-const como parâmetros",
                            isCorrect: false,
                        },
                        {
                            text: "Out-params impedem o compilador de aplicar qualquer inline",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como você AJUDA a NRVO a acontecer numa função?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Retornando sempre a mesma local, do tipo exato do retorno",
                            isCorrect: true,
                        },
                        {
                            text: "Marcando a variável local com std::move no return final",
                            isCorrect: false,
                        },
                        {
                            text: "Declarando a função como constexpr sempre que possível",
                            isCorrect: false,
                        },
                        {
                            text: "Retornando referências pra locais em vez de valores",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Onde o move não acontece",
            blocks: [
                {
                    type: "text",
                    value: "# Os lugares onde a cópia volta em silêncio\n\nO move tem uma propriedade traiçoeira: quando ele NÃO acontece, o programa continua correto, só que mais lento. Nenhum warning por padrão, nenhum teste falhando. Esta aula é o mapa dos buracos.\n\nO primeiro e mais comum: CONST MATA MOVE. std::move numa variável const produz um const T&&, que não casa com o construtor de move (ele pede T&& sem const). A resolução de sobrecarga cai educadamente na cópia, que aceita const T&. Uma variável local const std::string, movida no return ou pra dentro de um membro, copia. A lição não é abandonar const, é saber que objeto declarado const é objeto que será copiado, e decidir com essa informação.\n\nO segundo: PARÂMETROS RECEBIDOS POR VALOR precisam de std::move na hora de guardar. Dentro de Perfil(std::string nome), o nome é um lvalue (tem nome!); nome_(nome) copia. O idioma correto é nome_(std::move(nome)): o parâmetro já é a sua cópia particular, mova-o pro destino final sem pagar de novo.",
                },
                {
                    type: "code",
                    value: '#include <string>\n#include <utility>\n\nconst std::string nome = "imutavel";\nauto copia = std::move(nome);   // COPIA: const nao casa com string&&\n\nclass Perfil {\npublic:\n    explicit Perfil(std::string nome)\n        : nome_(std::move(nome)) {}   // sem o move, o parametro e COPIADO\nprivate:\n    std::string nome_;\n};\n\nstd::string monta() {\n    std::string s = "resultado";\n    return std::move(s);   // PESSIMIZACAO: impede a NRVO; escreva return s;\n}',
                },
                {
                    type: "table",
                    value: '[["Escrita","O que acontece de verdade","Conserto"],["std::move em objeto const","Cai na cópia, sem aviso","Repensar o const ou aceitar a cópia"],["Membro iniciado sem move","Parâmetro copiado pro membro","membro_(std::move(param))"],["return std::move(local)","Elisão impedida; move forçado","return local"],["Ler variável após movê-la","Valor não especificado em uso","Mover apenas no último uso"]]',
                },
                {
                    type: "quote",
                    value: "O move que não acontece não avisa: o programa segue certo e lento. A diferença entre os dois estados é um const, um return ou um move esquecido.",
                },
                {
                    type: "text",
                    value: "## A pessimização do return std::move\n\nO terceiro buraco é o mais irônico: EXCESSO de move. Escrever return std::move(local) parece zelo e é sabotagem: o padrão só permite NRVO quando o return menciona a variável diretamente; embrulhada num std::move, a elisão fica PROIBIDA, e o que seria custo zero vira um move de verdade. Compiladores modernos até avisam (-Wpessimizing-move no Clang e no GCC); em 2026, esse warning ligado é baseline de projeto sério.\n\nA regra de bolso pro return: variável local ou parâmetro por valor, return direto, sem move; o compilador faz o melhor sozinho. std::move em retorno só se justifica ao devolver um MEMBRO de um objeto que está sendo desmontado, e mesmo aí com o cuidado de quem sabe que o objeto fica vago.\n\nFeche o módulo com o checklist de caça: const em variável que você pretendia mover; membro iniciado sem std::move a partir de parâmetro por valor; std::move decorativo em return de local; e leitura de variável depois de movida. Quatro padrões, quatro buscas rápidas no diff de qualquer PR.",
                },
            ],
            questions: [
                {
                    statement: "O que acontece ao aplicar std::move numa variável const?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O código compila e faz uma cópia silenciosa",
                            isCorrect: true,
                        },
                        {
                            text: "Erro de compilação por mover algo constante",
                            isCorrect: false,
                        },
                        {
                            text: "O const é removido e o move ocorre normalmente",
                            isCorrect: false,
                        },
                        {
                            text: "O objeto fica vazio, mas continua sendo const",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No construtor Perfil(std::string nome), como guardar o parâmetro no membro sem cópia extra?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Iniciar com nome_(std::move(nome)) na lista",
                            isCorrect: true,
                        },
                        {
                            text: "Iniciar com nome_(nome), que já evita a cópia",
                            isCorrect: false,
                        },
                        {
                            text: "Receber o parâmetro como const std::string&&",
                            isCorrect: false,
                        },
                        {
                            text: "Declarar o membro nome_ como referência simples",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que return std::move(local) é uma pessimização?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Impede a NRVO e força um move que seria custo zero",
                            isCorrect: true,
                        },
                        {
                            text: "Transforma o move em cópia por causa do retorno",
                            isCorrect: false,
                        },
                        {
                            text: "Faz a função retornar referência pra variável morta",
                            isCorrect: false,
                        },
                        {
                            text: "Dobra o tamanho do binário gerado pela função",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o construtor de move não é escolhido pra um objeto const?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele pede T&& sem const; a resolução cai na cópia",
                            isCorrect: true,
                        },
                        {
                            text: "Objetos const vivem numa região só de leitura",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador apaga o move de classes com membros const",
                            isCorrect: false,
                        },
                        {
                            text: "std::move verifica const em runtime e desiste",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Num diff de PR, quais padrões indicam move que não vai acontecer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "const em variável movida e membro iniciado sem move",
                            isCorrect: true,
                        },
                        {
                            text: "Uso de reserve antes de push_back em vetores grandes",
                            isCorrect: false,
                        },
                        {
                            text: "Retorno por valor em funções que fabricam objetos",
                            isCorrect: false,
                        },
                        {
                            text: "Parâmetros const T& em funções que apenas leem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Templates sem medo",
    aulas: [
        {
            titulo: "Função e classe template",
            blocks: [
                {
                    type: "text",
                    value: "# O compilador escreve o código\n\nUm template não é uma função: é um MOLDE de função. Quando você escreve template <typename T> e usa menor(3, 7), o compilador INSTANCIA o molde com T = int, gerando uma função concreta menor<int> como se você a tivesse digitado. Use com double e nasce outra função; com std::string, mais uma. Esse processo se chama monomorfização: cada tipo usado ganha o próprio código de máquina, especializado e otimizável, sem nenhuma indireção em tempo de execução.\n\nCompare com o polimorfismo de herança: uma função virtual é UMA função, escolhida em runtime via vtable, pagando a indireção a cada chamada. O template resolve tudo em compilação, de graça no runtime, ao custo de binário maior (uma cópia por tipo) e de compilação mais lenta.\n\nE o requisito sobre T é ESTRUTURAL, não nominal: menor exige apenas que T tenha operator<. Não importa de quem T herda, importa o que T sabe fazer. É duck typing, só que verificado em tempo de compilação: se o tipo não tem a operação, o programa nem nasce.",
                },
                {
                    type: "code",
                    value: '#include <string>\n#include <utility>\n\ntemplate <typename T>\nconst T& menor(const T& a, const T& b) {\n    return b < a ? b : a;      // exige apenas operator< em T\n}\n\nmenor(3, 7);                   // instancia menor<int>\nmenor(2.5, 1.5);               // instancia menor<double>\nmenor(std::string("b"), std::string("a"));   // menor<std::string>\n\ntemplate <typename T>\nclass Caixa {\npublic:\n    explicit Caixa(T v) : valor_(std::move(v)) {}\n    const T& valor() const { return valor_; }\nprivate:\n    T valor_;\n};\n\nCaixa<int> ci(42);\nCaixa caixa(std::string("oi"));  // CTAD (C++17) deduz Caixa<std::string>',
                },
                {
                    type: "table",
                    value: '[["Aspecto","Template","Herança com virtual"],["Quando resolve","Compilação","Execução, via vtable"],["Custo por chamada","Zero; código específico","Indireção da vtable"],["Requisito sobre o tipo","Estrutural: ter as operações","Nominal: herdar da base"],["Efeito no binário","Uma cópia por tipo usado","Uma única função"]]',
                },
                {
                    type: "quote",
                    value: "Template é o compilador escrevendo código no seu lugar: uma função concreta por tipo usado, com o requisito verificado antes de o programa existir.",
                },
                {
                    type: "text",
                    value: '## O que instancia, e quando\n\nDois detalhes do modelo evitam surpresas. Primeiro: só instancia O QUE É USADO. Uma classe template com vinte métodos, da qual você chama três, gera código pra três; os outros dezessete nem são totalmente verificados pro seu tipo. É por isso que um std::vector de um tipo sem operator== funciona perfeitamente, até o dia em que alguém chama v1 == v2 e o erro aparece: a comparação só é exigida quando a comparação é instanciada.\n\nSegundo: a verificação profunda do corpo acontece NA INSTANCIAÇÃO. O compilador confere a sintaxe do molde quando o lê, mas só confere se T aguenta as operações quando um T concreto chega. Consequência prática: erros de template apontam pro momento do USO, com um rastro de "required from here", e a aula 5 deste módulo ensina a ler esse rastro sem pânico.\n\nCom o CTAD do C++17, o uso diário ficou limpo: Caixa caixa(std::string("oi")) deduz o parâmetro do template pelo argumento do construtor, como as funções sempre fizeram.',
                },
            ],
            questions: [
                {
                    statement: "O que acontece quando você chama menor(3, 7) num template?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O compilador instancia uma função concreta com T = int",
                            isCorrect: true,
                        },
                        {
                            text: "O runtime escolhe a versão certa numa tabela de tipos",
                            isCorrect: false,
                        },
                        {
                            text: "A chamada é interpretada, sem gerar código de máquina",
                            isCorrect: false,
                        },
                        {
                            text: "Uma única função genérica atende todos os tipos via cast",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o requisito que um tipo precisa cumprir pra usar um template?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Suportar as operações que o corpo do template usa",
                            isCorrect: true,
                        },
                        {
                            text: "Herdar de uma interface comum definida pelo template",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar o tipo numa lista de instâncias permitidas",
                            isCorrect: false,
                        },
                        {
                            text: "Implementar construtor padrão e operador de igualdade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a diferença de custo em runtime entre template e função virtual?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Template gera código direto; virtual paga a indireção",
                            isCorrect: true,
                        },
                        {
                            text: "Virtual é mais rápida por reaproveitar uma função só",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois custam o mesmo depois do otimizador passar",
                            isCorrect: false,
                        },
                        {
                            text: "Template paga a dedução de tipo a cada chamada feita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um vector de tipo sem operator== compila e funciona. Quando o problema apareceria?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Só quando alguém instanciar a comparação, chamando v1 == v2",
                            isCorrect: true,
                        },
                        {
                            text: "Na primeira inserção de um elemento dentro do vector",
                            isCorrect: false,
                        },
                        {
                            text: "Imediatamente, ao declarar o vector desse tipo no código",
                            isCorrect: false,
                        },
                        {
                            text: "Em tempo de execução, com uma exceção de tipo inválido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o CTAD (C++17) permite escrever?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Caixa c(valor), deduzindo o tipo do template pelo argumento",
                            isCorrect: true,
                        },
                        {
                            text: "Templates com número variável de tipos sem declaração",
                            isCorrect: false,
                        },
                        {
                            text: "Conversão automática entre instâncias de tipos distintos",
                            isCorrect: false,
                        },
                        {
                            text: "Instanciação de templates em tempo de execução do programa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Por que template vive no header",
            blocks: [
                {
                    type: "text",
                    value: '# O modelo de compilação explicado\n\nA regra que todo iniciante tropeça: definição de template mora no HEADER. O motivo é o modelo de compilação do C++. Cada arquivo .cpp é uma unidade de tradução compilada isoladamente; pra instanciar menor<int>, o compilador precisa VER o corpo completo do molde naquele momento. Se o corpo está escondido noutro .cpp, a unidade atual só consegue anotar "alguém me deva menor<int>", e como nenhuma unidade gera essa instância, o LINKER quebra com o clássico undefined reference.\n\nPor isso o padrão da prática é direto: template inteiro no .hpp, corpo junto da declaração. Cada .cpp que inclui o header instancia o que usa; o linker, ao final, encontra as instâncias duplicadas entre unidades e descarta as cópias extras, ficando com uma de cada.\n\nO preço não é de correção, é de BUILD: o mesmo menor<int> é compilado em cada unidade que o usa, e projetos com templates pesados em headers muito incluídos sentem isso em minutos de recompilação. As mitigações existem e são o assunto do bloco final.',
                },
                {
                    type: "code",
                    value: '// menor.hpp: o template INTEIRO vive aqui\n#pragma once\n\ntemplate <typename T>\nconst T& menor(const T& a, const T& b) {\n    return b < a ? b : a;\n}\n\n// relatorio.cpp e uso.cpp incluem menor.hpp:\n// cada um instancia menor<int>; o linker descarta a duplicata.\n\n// Mitigacao de build, quando um tipo domina o uso:\n// menor.cpp\n//   template const int& menor<int>(const int&, const int&);  // instancia AQUI\n// demais unidades:\n//   extern template const int& menor<int>(const int&, const int&);\n//   // "nao instancie: essa instancia ja existe em outro lugar"',
                },
                {
                    type: "table",
                    value: '[["Estratégia","O que faz","Efeito no build"],["Tudo no header","Cada unidade instancia o que usa","Simples; recompila bastante"],["extern template","Instancia uma vez num .cpp","Menos trabalho repetido"],["Módulos (C++20)","Interface compilada uma vez","Adoção ainda desigual em 2026"]]',
                },
                {
                    type: "quote",
                    value: "O linker aceita ver a mesma instância de template em dez unidades: descarta nove. O que ele não perdoa é não encontrar nenhuma.",
                },
                {
                    type: "text",
                    value: '## Convivendo com o custo de build\n\nAs armas contra o build lento têm alcance diferente. A instanciação explícita com extern template serve quando poucas instâncias dominam: você declara "não instancie aqui" nas unidades usuárias e materializa a instância uma única vez num .cpp dedicado. Bibliotecas fazem isso pros tipos comuns (a própria libstdc++ faz com std::string, que é basic_string<char> instanciado).\n\nOs MÓDULOS do C++20 atacam a raiz: a interface é compilada uma vez pra um formato binário e importada, em vez de reprocessada textualmente a cada inclusão. Em 2026, o suporte dos três grandes compiladores existe e a std já é importável como módulo no C++23, mas a migração de ecossistema (build systems, bibliotecas antigas) segue gradual; projetos novos podem adotar, os legados avançam devagar.\n\nEnquanto isso, valem as higienes: headers de template enxutos, includes mínimos neles, e tipos pesados instanciados explicitamente. E o critério de sempre: meça o build antes de sair movendo código; a lentidão real quase sempre tem três ou quatro culpados concentrados.',
                },
            ],
            questions: [
                {
                    statement:
                        "Por que a definição de um template precisa estar visível no header?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O compilador precisa do corpo pra instanciar em cada uso",
                            isCorrect: true,
                        },
                        {
                            text: "Headers são a única parte lida pelo linker no final",
                            isCorrect: false,
                        },
                        {
                            text: "Templates em .cpp são apagados pelo pré-processador",
                            isCorrect: false,
                        },
                        {
                            text: "O padrão proíbe qualquer função definida fora de headers",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas unidades de tradução instanciam menor<int>. O que o linker faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mantém uma instância e descarta a duplicata",
                            isCorrect: true,
                        },
                        {
                            text: "Falha o link, acusando símbolo duplicado",
                            isCorrect: false,
                        },
                        {
                            text: "Mescla as duas instâncias numa versão híbrida",
                            isCorrect: false,
                        },
                        {
                            text: "Renomeia uma delas pra evitar a colisão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "De onde vem o custo de build dos templates em headers?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A mesma instância é recompilada em cada unidade que a usa",
                            isCorrect: true,
                        },
                        {
                            text: "O linker precisa reordenar os símbolos a cada build feito",
                            isCorrect: false,
                        },
                        {
                            text: "Headers grandes são carregados em memória sem compressão",
                            isCorrect: false,
                        },
                        {
                            text: "Templates desativam o cache de objetos do compilador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a declaração extern template faz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Evita instanciar ali: a instância vem de outra unidade",
                            isCorrect: true,
                        },
                        {
                            text: "Exporta o template pra ser usado por outra linguagem",
                            isCorrect: false,
                        },
                        {
                            text: "Move a instanciação da compilação pro tempo de execução",
                            isCorrect: false,
                        },
                        {
                            text: "Permite definir o corpo do template em arquivo separado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você define o corpo do template só num .cpp e o usa de outro arquivo. O que acontece?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Erro de link: nenhuma unidade gerou a instância usada",
                            isCorrect: true,
                        },
                        {
                            text: "Erro de sintaxe na leitura do arquivo de cabeçalho",
                            isCorrect: false,
                        },
                        {
                            text: "Funciona: o linker instancia templates sob demanda",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador copia o corpo automaticamente pro header",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Especialização e overload",
            blocks: [
                {
                    type: "text",
                    value: "# Dois jeitos de customizar por tipo\n\nCedo ou tarde o genérico precisa de exceções: serializar bool diferente de int, formatar string com aspas, tratar ponteiro de outro jeito. O C++ dá duas ferramentas, e escolher errado gera bugs finos.\n\nA ESPECIALIZAÇÃO substitui o corpo do template pra um tipo específico: template <> struct Serial<bool> reescreve a versão de bool por inteiro. Classes aceitam especialização TOTAL (um tipo exato) e PARCIAL (uma família: Serial<std::vector<T>> pra qualquer T). É a ferramenta certa pra customizar CLASSES, onde sobrecarga não existe.\n\nO OVERLOAD é a segunda função com o mesmo nome, mais específica: ao lado do template genérico rotulo(const T&), você declara rotulo(const std::string&). Na chamada, a resolução de sobrecarga prefere a função não-template que casa exato. Pra FUNÇÕES, essa é a ferramenta certa, pelas razões da próxima seção. E função nem tem especialização parcial: o recurso simplesmente não existe na linguagem; o que parece isso é sempre outro overload.",
                },
                {
                    type: "code",
                    value: '#include <string>\n#include <vector>\n\n// Generico + overload: o caminho certo pra FUNCOES\ntemplate <typename T>\nstd::string rotulo(const T&) { return "valor"; }\n\nstd::string rotulo(const std::string& s) { return "texto: " + s; }\n// rotulo(42)      -> "valor"        (template)\n// rotulo(nome)    -> "texto: ..."   (overload exato vence)\n\n// Especializacao: o caminho certo pra CLASSES\ntemplate <typename T>\nstruct Serial {\n    static std::string gravar(const T& v);\n};\n\ntemplate <>\nstruct Serial<bool> {                       // total: so bool\n    static std::string gravar(const bool& v) { return v ? "sim" : "nao"; }\n};\n\ntemplate <typename T>\nstruct Serial<std::vector<T>> {             // parcial: qualquer vector\n    static std::string gravar(const std::vector<T>& v);\n};',
                },
                {
                    type: "table",
                    value: '[["Objetivo","Ferramenta","Motivo"],["Função com caso especial","Overload","Participa da resolução; previsível"],["Classe com layout por tipo","Especialização total ou parcial","Sobrecarga não existe pra classes"],["Família de tipos numa função","Outro template mais específico","Parcial de função não existe"],["Comportamento por propriedade","Concepts e requires (aula 4)","Critério legível e verificado"]]',
                },
                {
                    type: "quote",
                    value: "Regra de bolso que evita uma classe inteira de sustos: especializa-se CLASSE, sobrecarrega-se FUNÇÃO. Quando estiver em dúvida, é overload.",
                },
                {
                    type: "text",
                    value: "## Por que overload ganha pra funções\n\nA especialização total de função EXISTE (template <> std::string rotulo<bool>...), e é exatamente por isso que a regra precisa ser dita: ela tem um comportamento surpreendente. Especializações NÃO participam da resolução de sobrecarga. O compilador primeiro escolhe entre as funções e templates PRIMÁRIOS; só depois de eleger um template ele verifica se existe especialização dele pra usar. Resultado famoso: dependendo da ordem de declaração e do conjunto de overloads, a sua especialização é solenemente ignorada, e qual função roda muda com a posição dela no arquivo.\n\nOverloads não têm esse problema: todos entram juntos na disputa, com regras únicas (a mais específica vence), e o resultado não depende de ordem entre arquivos. Por isso a diretriz das guidelines é seca: pra customizar função por tipo, escreva outro overload, nunca template <>.\n\nAnote o resumo operacional: classe pede especialização (não há alternativa); função pede overload (a alternativa existe e morde). No módulo seguinte da trilha, os concepts vão dar um terceiro caminho pra funções, restringindo por PROPRIEDADE do tipo em vez de tipo exato.",
                },
            ],
            questions: [
                {
                    statement: "Qual recurso existe pra classes, mas NÃO existe pra funções?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Especialização parcial de template",
                            isCorrect: true,
                        },
                        {
                            text: "Sobrecarga com tipos diferentes",
                            isCorrect: false,
                        },
                        {
                            text: "Instanciação implícita pelo uso",
                            isCorrect: false,
                        },
                        {
                            text: "Parâmetro de template com padrão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com o template genérico e um overload rotulo(const std::string&), o que a chamada com uma string faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Usa o overload: a função exata vence o template",
                            isCorrect: true,
                        },
                        {
                            text: "Usa o template, que sempre tem prioridade",
                            isCorrect: false,
                        },
                        {
                            text: "Falha por ambiguidade entre as duas versões",
                            isCorrect: false,
                        },
                        {
                            text: "Escolhe aleatoriamente em cada compilação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que preferir overload a especialização pra customizar FUNÇÕES?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Especialização fica fora da resolução de sobrecarga",
                            isCorrect: true,
                        },
                        {
                            text: "Especialização de função compila mais devagar sempre",
                            isCorrect: false,
                        },
                        {
                            text: "Overloads podem ser inline e especializações não podem",
                            isCorrect: false,
                        },
                        {
                            text: "Especialização exige herança entre os tipos envolvidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que Serial<std::vector<T>> com T livre exemplifica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Especialização parcial: cobre a família dos vectors",
                            isCorrect: true,
                        },
                        {
                            text: "Especialização total: cobre um único tipo exato",
                            isCorrect: false,
                        },
                        {
                            text: "Um overload de classe com prioridade sobre o template",
                            isCorrect: false,
                        },
                        {
                            text: "Uma instanciação explícita feita pra tipos genéricos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o comportamento de template <> em funções é considerado traiçoeiro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Qual função roda pode mudar com a ordem de declaração",
                            isCorrect: true,
                        },
                        {
                            text: "Ela impede o compilador de aplicar o inline nas chamadas",
                            isCorrect: false,
                        },
                        {
                            text: "Ela é removida pelo linker quando há outros overloads",
                            isCorrect: false,
                        },
                        {
                            text: "Ela só funciona com tipos primitivos da linguagem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Concepts (C++20)",
            blocks: [
                {
                    type: "text",
                    value: '# Restrições que se leem como frases\n\nDurante vinte anos, restringir um template era artesanato com enable_if e SFINAE: funcionava, e era ilegível. O C++20 promoveu a restrição a recurso de primeira classe: CONCEPTS. Um concept é um conjunto NOMEADO de requisitos sobre tipos, verificado em compilação, escrito com a palavra requires numa sintaxe declarativa.\n\nO efeito aparece nos dois lados. Na declaração, template <std::integral T> diz na primeira linha o que a função aceita; o contrato sai do comentário e entra no código. No erro, a mensagem muda de natureza: em vez de duzentas linhas de substituição falhada nas entranhas da biblioteca, o compilador diz "constraint not satisfied" e aponta QUAL requisito o seu tipo não cumpre. É a diferença entre um diagnóstico e um despejo de contexto.\n\nEm 2026, C++20 é a base comum dos projetos novos, e concepts são o padrão pra código genérico que outras pessoas vão usar. A biblioteca já traz um vocabulário pronto em <concepts> (integral, floating_point, convertible_to, same_as) e os concepts de ranges (sortable, range, input_iterator).',
                },
                {
                    type: "code",
                    value: '#include <concepts>\n#include <string>\n\ntemplate <std::integral T>\nT dobro(T x) { return x * 2; }\n// dobro(21)   ok;  dobro(2.5)  erro: double nao satisfaz std::integral\n\n// Um concept seu: "tem nome() que devolve algo conversivel a string"\ntemplate <typename T>\nconcept TemNome = requires(const T& t) {\n    { t.nome() } -> std::convertible_to<std::string>;\n};\n\ntemplate <TemNome T>\nstd::string cracha(const T& t) {\n    return "[" + std::string(t.nome()) + "]";\n}\n\n// Forma abreviada, boa pra assinaturas curtas:\nvoid registrar(const TemNome auto& t);',
                },
                {
                    type: "table",
                    value: '[["Antes, com SFINAE","Agora, com concepts"],["enable_if aninhado e ilegível","requires declarativo, uma linha"],["Erro com páginas de substituição","\'constraint not satisfied\' e o requisito"],["Contrato escondido em comentário","Requisito nomeado na assinatura"],["Falha nas entranhas da biblioteca","Falha na PORTA, no ponto da chamada"]]',
                },
                {
                    type: "quote",
                    value: "Concept bom tem nome de contrato, não de truque: TemNome, Ordenavel, Serializavel. Se o nome não explica o requisito, o concept nasceu errado.",
                },
                {
                    type: "text",
                    value: "## O requires por dentro, sem exagerar\n\nA expressão requires(const T& t) { ... } lista o que precisa COMPILAR pro tipo passar: expressões válidas ({ t.nome() }), tipos de retorno compatíveis (-> std::convertible_to<...>), tipos aninhados existentes (typename T::value_type). Importante: a checagem é sintática e de tipos, feita inteiramente em compilação; ninguém executa t.nome() pra testar. Um tipo pode satisfazer o concept e ainda se comportar mal em runtime; concept verifica FORMA, não semântica.\n\nNa resolução de sobrecarga, os concepts também ordenam: entre dois templates viáveis, vence o de restrição mais específica, o que permite escrever o caso geral e o caso refinado sem truque.\n\nE o conselho de maturidade: restrinja o que a função REALMENTE exige, não tudo que o tipo poderia ter. Concept inchado é tão ruim quanto ausente: recusa tipos legítimos e acopla a interface a detalhes. Comece com os concepts da biblioteca; escreva os seus quando o domínio pedir vocabulário próprio, e dê a eles os nomes que o seu time usaria numa conversa.",
                },
            ],
            questions: [
                {
                    statement: "O que é um concept no C++20?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um conjunto nomeado de requisitos verificado em compilação",
                            isCorrect: true,
                        },
                        {
                            text: "Uma interface virtual que os tipos precisam implementar",
                            isCorrect: false,
                        },
                        {
                            text: "Um teste unitário executado antes da função genérica",
                            isCorrect: false,
                        },
                        {
                            text: "Uma anotação de documentação lida pelas ferramentas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que template <std::integral T> garante sobre T?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Que T é um tipo inteiro, verificado na compilação",
                            isCorrect: true,
                        },
                        {
                            text: "Que T cabe em 64 bits em qualquer plataforma",
                            isCorrect: false,
                        },
                        {
                            text: "Que valores de T nunca sofrem overflow em runtime",
                            isCorrect: false,
                        },
                        {
                            text: "Que T é conversível pra double sem perder precisão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como os concepts melhoram as mensagens de erro de template?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O erro aponta o requisito não cumprido, no ponto da chamada",
                            isCorrect: true,
                        },
                        {
                            text: "Os erros são adiados pra execução, com mensagens amigáveis",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador corrige o tipo automaticamente e só avisa",
                            isCorrect: false,
                        },
                        {
                            text: "As mensagens somem: código com concepts não gera erros",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que uma expressão requires de fato verifica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Se as expressões listadas compilam pro tipo, sem executar nada",
                            isCorrect: true,
                        },
                        {
                            text: "Se o tipo passa nos testes de comportamento em tempo de execução",
                            isCorrect: false,
                        },
                        {
                            text: "Se o tipo foi registrado como compatível pelo autor da classe",
                            isCorrect: false,
                        },
                        {
                            text: "Se os métodos do tipo retornam valores válidos pra amostras",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois templates satisfazem uma chamada, um com restrição mais específica. O que ocorre?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Vence o de restrição mais específica, sem ambiguidade",
                            isCorrect: true,
                        },
                        {
                            text: "Erro de ambiguidade: restrições não ordenam candidatos",
                            isCorrect: false,
                        },
                        {
                            text: "Vence o declarado primeiro na ordem dos arquivos",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador instancia os dois e escolhe em runtime",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ler erro de template",
            blocks: [
                {
                    type: "text",
                    value: '# Técnica contra o muro de texto\n\nErro de template assusta pelo VOLUME, não pela dificuldade. Um deslize de um caractere pode despejar trezentas linhas, mas a informação útil ocupa três. A técnica é saber quais três.\n\nRegra um: leia o PRIMEIRO erro, ignore o resto. O segundo erro em diante costuma ser eco do primeiro; consertado o primeiro, recompile e reavalie. Regra dois: procure a cadeia de "required from here" e siga até a linha que aponta pro SEU arquivo. O erro estoura fundo, dentro da biblioteca, mas foi o seu uso que o disparou; a linha do seu código é o ponto de conserto. Regra três: no bloco "no matching function", os candidatos rejeitados vêm com o motivo de cada rejeição; leia os motivos, não os nomes gigantes.\n\nE aprenda a DESCARTAR ruído: os tipos aparecem com todos os parâmetros default expandidos (std::vector<int, std::allocator<int>>, basic_string com três argumentos). Apare mentalmente os allocators e char_traits; o que sobra é legível.',
                },
                {
                    type: "code",
                    value: "// A saida real (resumida) pra: menor(42, std::string(\"a\"))\n\nerro: no matching function for call to 'menor(int, std::string)'\nuso.cpp:12:10: note: candidate: 'const T& menor(const T&, const T&)'\nuso.cpp:12:10: note:   template argument deduction/substitution failed:\nuso.cpp:12:10: note:   deduced conflicting types for parameter 'T'\n                       ('int' and 'std::basic_string<char>')\nuso.cpp:12:10: required from here\n\n// Leitura em tres passos:\n// 1. primeiro erro: nenhuma versao de menor serviu\n// 2. motivo do candidato: T deduzido como int E como string, conflito\n// 3. required from here: a linha 12 do MEU uso.cpp dispara tudo",
                },
                {
                    type: "table",
                    value: '[["Sinal na saída","Onde olhar","O que significa"],["required from here","Última linha com arquivo SEU","O uso que disparou o erro"],["no matching function","Lista de candidatos abaixo","Nenhuma versão serviu à chamada"],["candidate ... failed","O motivo de cada candidato","Por que aquela versão foi rejeitada"],["constraint not satisfied","O concept citado","Qual requisito o tipo não cumpre"]]',
                },
                {
                    type: "quote",
                    value: "Trezentas linhas de erro de template contêm três linhas de informação: o primeiro erro, o motivo do candidato e o required from here que aponta pro seu código.",
                },
                {
                    type: "text",
                    value: '## Reduzir até o erro confessar\n\nQuando a leitura direta não resolve, troque de estratégia: ENCOLHA o caso. Copie a chamada problemática pra um arquivo mínimo, com tipos concretos no lugar dos genéricos, e recompile. Metade das vezes o erro fica óbvio na versão pequena (um const a mais, um & esquecido, um tipo que não era o que você achava). A outra metade, você acaba de fabricar o exemplo perfeito pra pedir ajuda.\n\nDuas ferramentas aceleram o ciclo. static_assert com um traço ou concept (static_assert(std::copyable<Meutipo>)) testa a hipótese "esse tipo cumpre o requisito?" com resposta binária, antes de envolver o template inteiro. E restringir suas próprias funções genéricas com concepts (aula anterior) move o erro do fundo da biblioteca pra PORTA da função, transformando o despejo em frase.\n\nO hábito completo: primeiro erro, required from here, motivo dos candidatos, e caso mínimo quando empacar. Com esse ritual, o muro de texto vira rotina de dois minutos, e templates deixam de ser a parte assustadora do code review.',
                },
            ],
            questions: [
                {
                    statement: "Qual erro deve ser lido primeiro numa saída longa de template?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O primeiro: os seguintes costumam ser eco dele",
                            isCorrect: true,
                        },
                        {
                            text: "O último, que resume os anteriores em uma linha",
                            isCorrect: false,
                        },
                        {
                            text: "O mais longo, por conter o contexto completo",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer um: todos apontam pra mesma linha de código",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a linha 'required from here' indica?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O ponto do SEU código que disparou a instanciação",
                            isCorrect: true,
                        },
                        {
                            text: "A linha da biblioteca padrão que contém o defeito",
                            isCorrect: false,
                        },
                        {
                            text: "O arquivo que precisa ser incluído pra compilar",
                            isCorrect: false,
                        },
                        {
                            text: "A posição onde o linker procurou o símbolo ausente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No bloco 'no matching function', o que merece leitura atenta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O motivo da rejeição de cada candidato listado",
                            isCorrect: true,
                        },
                        {
                            text: "A contagem de candidatos, que revela o defeito",
                            isCorrect: false,
                        },
                        {
                            text: "Os nomes completos dos tipos com seus allocators",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem dos candidatos, do mais novo pro mais velho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa 'deduced conflicting types for parameter T'?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os argumentos da chamada pedem dois T diferentes",
                            isCorrect: true,
                        },
                        {
                            text: "O tipo T foi definido duas vezes no mesmo header",
                            isCorrect: false,
                        },
                        {
                            text: "T é abstrato e não pode ser instanciado direto",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador esgotou a memória durante a dedução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando a leitura direta falha, qual é a técnica recomendada?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Reduzir a um caso mínimo com tipos concretos e recompilar",
                            isCorrect: true,
                        },
                        {
                            text: "Recompilar com otimização máxima pra encurtar a saída",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o template por macros até o erro desaparecer",
                            isCorrect: false,
                        },
                        {
                            text: "Silenciar os warnings e tratar só o que sobrar no link",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - STL com custo na cabeça",
    aulas: [
        {
            titulo: "vector por dentro",
            blocks: [
                {
                    type: "text",
                    value: '# Tamanho, capacidade e o bloco contíguo\n\nstd::vector é um bloco CONTÍGUO no heap mais três ponteiros: início, fim do conteúdo e fim do bloco. Daí saem os dois números que você precisa distinguir: size() é quantos elementos existem; capacity() é quantos cabem antes de precisar de bloco novo. Enquanto size < capacity, um push_back custa construir um elemento no fim, e nada mais.\n\nQuando a capacidade esgota, acontece a REALOCAÇÃO: aloca-se um bloco maior (crescimento geométrico, tipicamente 1,5x a 2x), os elementos são transportados (movidos, se o move for noexcept, como você viu no módulo 3), e o bloco velho é liberado. É um evento caro, mas raro por construção: com crescimento geométrico, inserir n elementos custa O(n) amortizado no total, e é isso que "push_back é O(1) amortizado" significa.\n\nA consequência operacional imediata: quando você SABE quantos elementos virão, diga. v.reserve(n) faz uma única alocação adiantada e zera as realocações do preenchimento. É a otimização de uma linha com melhor retorno da STL.',
                },
                {
                    type: "code",
                    value: "#include <iostream>\n#include <vector>\n\nstd::vector<int> v;\nv.reserve(1000);                 // capacidade 1000, size 0\n\nfor (int i = 0; i < 1000; ++i)\n    v.push_back(i);              // ZERO realocacoes no laco\n\nstd::cout << v.size() << ' ' << v.capacity() << '\\n';  // 1000 1000\n\nint* p = &v[0];\nauto it = v.begin();\nv.push_back(1001);   // capacidade esgotada: REALOCA\n// p e it agora apontam pro bloco LIBERADO: usar qualquer um e UB",
                },
                {
                    type: "table",
                    value: '[["Operação","Custo","Invalida iteradores e ponteiros?"],["push_back sem realocar","O(1)","Não"],["push_back com realocação","O(n) naquele evento","TODOS"],["insert no meio","O(n): desloca a cauda","Do ponto em diante; todos se realocar"],["reserve(n)","O(n) uma única vez","Todos, uma vez"],["operator[] e percurso","O(1) por acesso","Não"]]',
                },
                {
                    type: "quote",
                    value: "Todo iterador de vector carrega uma data de validade invisível: o próximo push_back pode ser a realocação que transforma o seu ponteiro em bomba.",
                },
                {
                    type: "text",
                    value: '## Invalidação: o bug clássico\n\nO preço do bloco contíguo é a INVALIDAÇÃO: realocou, todos os ponteiros, referências e iteradores pro conteúdo antigo viram lixo. O bug clássico tem duas formas. A primeira: guardar um ponteiro ou referência pra um elemento e continuar inserindo; funciona nos testes (enquanto a capacidade aguenta) e explode em produção no dia em que o dado cresce. A segunda: inserir ou apagar DENTRO de um loop que itera o próprio vector, usando o iterador antigo depois da modificação.\n\nAs defesas, em ordem de preferência: não guarde ponteiros pra dentro de um vector que ainda muda (guarde ÍNDICES, que sobrevivem à realocação); se o tamanho final é conhecido, reserve antes e a capacidade não muda durante o preenchimento; e ao apagar iterando, use o retorno de erase (it = v.erase(it)) ou o std::erase_if do C++20, que encapsula o padrão inteiro.\n\nFica também o aviso de simetria: shrink_to_fit e a própria erase não devolvem memória garantidamente nem barateiam nada por si; medir antes de "otimizar" memória vale tanto quanto pra CPU.',
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença entre size() e capacity() num vector?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "size conta os elementos; capacity, quantos cabem sem realocar",
                            isCorrect: true,
                        },
                        {
                            text: "size mede em bytes; capacity mede em número de elementos",
                            isCorrect: false,
                        },
                        {
                            text: "size inclui os elementos removidos; capacity só os ativos",
                            isCorrect: false,
                        },
                        {
                            text: "São sinônimos mantidos por compatibilidade com o C++98",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que v.reserve(1000) faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Aloca capacidade pra 1000 sem criar elementos",
                            isCorrect: true,
                        },
                        {
                            text: "Cria 1000 elementos com valor padrão no vetor",
                            isCorrect: false,
                        },
                        {
                            text: "Limita o vetor a no máximo 1000 elementos",
                            isCorrect: false,
                        },
                        {
                            text: "Reserva 1000 bytes no cache da CPU pro vetor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que push_back é O(1) AMORTIZADO e não O(1) sempre?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Realocações raras de custo O(n) se diluem entre as inserções",
                            isCorrect: true,
                        },
                        {
                            text: "O custo depende do valor inserido em cada uma das chamadas",
                            isCorrect: false,
                        },
                        {
                            text: "O alocador arredonda os pedidos pra potências de dois",
                            isCorrect: false,
                        },
                        {
                            text: "A primeira inserção paga a inicialização de todo o bloco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando um push_back invalida iteradores e ponteiros existentes?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quando dispara realocação por falta de capacidade",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre: qualquer inserção invalida tudo por regra",
                            isCorrect: false,
                        },
                        {
                            text: "Nunca: só o erase invalida iteradores de vector",
                            isCorrect: false,
                        },
                        {
                            text: "Somente quando o elemento inserido é maior que 64 bytes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você precisa referenciar elementos de um vector que ainda vai crescer. Qual é a forma robusta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Guardar índices, que continuam válidos após realocação",
                            isCorrect: true,
                        },
                        {
                            text: "Guardar ponteiros crus, que o vector atualiza sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar iteradores, que realocam junto com o bloco",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar referências const, imunes à realocação do bloco",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "map vs unordered_map",
            blocks: [
                {
                    type: "text",
                    value: "# Árvore, hash e o custo que a tabela não mostra\n\nstd::map é uma árvore binária balanceada (rubro-negra nas implementações): busca, inserção e remoção em O(log n), chaves sempre em ORDEM, e por isso consultas de faixa (lower_bound, upper_bound) e iteração ordenada saem naturais. std::unordered_map é uma tabela hash: O(1) amortizado na busca por chave exata, nenhuma ordem, e rehash ocasional quando o fator de carga estoura.\n\nSó que a notação assintótica esconde o fator que mais pesa em 2026: MEMÓRIA. Os dois são containers de NÓS: cada elemento é uma alocação separada, espalhada pelo heap. Buscar num map de um milhão de entradas são vinte saltos de ponteiro, e cada salto é um provável cache miss de centenas de ciclos. O unordered salta menos, mas ainda persegue ponteiros pros baldes.\n\nPor isso a heurística que surpreende iniciantes: pra coleções PEQUENAS (dezenas, poucas centenas), um vector de pares com busca linear ou binária costuma vencer OS DOIS, porque percorre memória contígua que o prefetcher da CPU adora.",
                },
                {
                    type: "code",
                    value: '#include <map>\n#include <string>\n#include <unordered_map>\n#include <vector>\n\nstd::map<std::string, int> ordenado;         // arvore: O(log n), EM ORDEM\nstd::unordered_map<std::string, int> tabela; // hash: O(1) medio, SEM ordem\n\n// Iteracao em ordem alfabetica: so o map garante\nfor (const auto& [chave, valor] : ordenado) {\n    // relatorio(chave, valor);\n}\n\n// Consulta de faixa: natural na arvore\nauto de = ordenado.lower_bound("m");\nauto ate = ordenado.upper_bound("p");\n\n// N pequeno: contiguidade vence as duas estruturas\nstd::vector<std::pair<std::string, int>> plano;  // + busca linear/binaria',
                },
                {
                    type: "table",
                    value: '[["Critério","map","unordered_map","vector de pares"],["Busca por chave","O(log n)","O(1) amortizado","O(n), ou O(log n) ordenado"],["Iteração em ordem","Sim","Não","Se você mantiver ordenado"],["Localidade de cache","Ruim: nós espalhados","Mediana: baldes","Ótima: bloco contíguo"],["Brilha quando","Faixas e ordem importam","N grande, chave exata","N pequeno; leitura em massa"]]',
                },
                {
                    type: "quote",
                    value: "A tabela de complexidade não tem coluna pra cache miss. É nessa coluna invisível que o vector ganha do map em metade dos casos reais.",
                },
                {
                    type: "text",
                    value: "## O critério de escolha, sem ranking\n\nA decisão saudável parte de duas perguntas. Primeira: você precisa de ORDEM ou de consultas por faixa? Se sim, map (ou um vector mantido ordenado, se as inserções são raras e as leituras dominam). Se não, a briga é entre unordered_map e vector: só chave exata, N grande e mutável, fica o unordered; N pequeno ou fase de leitura intensa depois de montar uma vez, o vector plano tende a ganhar.\n\nSegunda: esse container está num caminho QUENTE? Se está, a resposta final não vem de tabela nenhuma, vem de MEDIÇÃO com dados reais, porque o resultado depende do tamanho das chaves (hash de string longa custa), da distribuição de acessos e do que mais disputa o cache.\n\nDois ajustes finos que valem conhecer: unordered_map aceita reserve(n) pra evitar rehash durante cargas (o mesmo reflexo do vector), e chaves de string se beneficiam de heterogeneous lookup (find com string_view, sem construir std::string temporária). São os dois primeiros parafusos a apertar antes de trocar a estrutura inteira.",
                },
            ],
            questions: [
                {
                    statement: "Qual estrutura interna o std::map usa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Árvore balanceada, com as chaves em ordem",
                            isCorrect: true,
                        },
                        {
                            text: "Tabela hash com listas de colisão por balde",
                            isCorrect: false,
                        },
                        {
                            text: "Bloco contíguo ordenado por busca binária",
                            isCorrect: false,
                        },
                        {
                            text: "Lista encadeada com um índice de atalhos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o unordered_map oferece na busca por chave exata?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O(1) amortizado, sem garantir nenhuma ordem",
                            isCorrect: true,
                        },
                        {
                            text: "O(log n), com as chaves sempre ordenadas",
                            isCorrect: false,
                        },
                        {
                            text: "O(1) garantido em todos os casos possíveis",
                            isCorrect: false,
                        },
                        {
                            text: "O(n), compensado pela iteração mais rápida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um vector de pares costuma vencer map e unordered_map com N pequeno?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Memória contígua: o cache e o prefetcher trabalham a favor",
                            isCorrect: true,
                        },
                        {
                            text: "A busca linear tem complexidade menor que a da árvore",
                            isCorrect: false,
                        },
                        {
                            text: "O vector dispensa comparações de chave durante a busca",
                            isCorrect: false,
                        },
                        {
                            text: "Os mapas travam um mutex interno a cada operação de busca",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando o map é a escolha certa contra o unordered_map?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quando ordem e consultas por faixa fazem parte do problema",
                            isCorrect: true,
                        },
                        {
                            text: "Quando as chaves são strings de qualquer tamanho usado",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o programa tem mais de uma thread lendo o mapa",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a memória disponível é maior que o conjunto de dados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o custo escondido dos containers de nós que a notação O() não mostra?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cada nó aloca separado; a busca salta pela memória",
                            isCorrect: true,
                        },
                        {
                            text: "Os nós precisam ser rebalanceados a cada leitura feita",
                            isCorrect: false,
                        },
                        {
                            text: "O destrutor percorre a estrutura duas vezes ao liberar",
                            isCorrect: false,
                        },
                        {
                            text: "As chaves são copiadas pra área de troca do sistema",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "string e SSO",
            blocks: [
                {
                    type: "text",
                    value: '# A string que não vai pro heap\n\nstd::string é um vector de chars com um truque a mais: SSO, a small string optimization. Strings CURTAS moram dentro do próprio objeto, num buffer interno, sem nenhuma alocação no heap. Só quando o texto ultrapassa o limite é que a string aloca. O limite exato varia por implementação (em 2026, a libc++ guarda até 22 chars inline e a libstdc++ até 15), então a regra portátil é qualitativa: identificadores, códigos e nomes curtos são de graça; textos longos alocam.\n\nO impacto é grande porque strings curtas DOMINAM programas reais: chaves de mapa, campos de log, nomes de arquivo. Copiar uma string SSO é copiar bytes na pilha, sem heap; um vector<string> de palavras curtas é bem mais amigável ao cache do que "um monte de ponteiros" sugere.\n\nDuas consequências práticas: benchmarks de string feitos só com textos curtinhos medem o SSO, não a string; e o move de uma string curta não é mais barato que a cópia, porque não há ponteiro pra roubar, os bytes são copiados de qualquer jeito.',
                },
                {
                    type: "code",
                    value: '#include <string>\n#include <string_view>\n\nstd::string curta = "id-42";     // SSO: mora no objeto, SEM heap\nstd::string longa(200, \'x\');     // acima do limite: aloca no heap\n\n// string_view: ponteiro + tamanho, NAO-DONO, barato de copiar\nvoid logar(std::string_view v);\n\nlogar("literal");        // sem criar std::string temporaria\nlogar(curta);            // enxerga o buffer da string\nlogar(longa.substr(0, 10));       // CUIDADO: substr cria string temporaria\n\nstd::string_view recorte(std::string_view v) {\n    return v.substr(0, 3);        // substr de view: so ajusta ponteiro/tam\n}\n\nstd::string_view perigo() {\n    std::string local = "temporaria";\n    return local;         // DANGLING: a dona morre no return\n}',
                },
                {
                    type: "table",
                    value: '[["Tipo","É dono?","Custo de copiar","Uso certo"],["std::string","Sim","Bytes (SSO) ou alocação","Guardar e modificar texto"],["std::string_view","Não","Dois registradores","Parâmetro de leitura"],["const std::string&","Empresta","Zero","Ler quando JÁ existe string"],["const char*","Não","Um registrador","Interoperar com APIs de C"]]',
                },
                {
                    type: "quote",
                    value: "string_view é um empréstimo sem fiador: barato, direto, e sua responsabilidade garantir que o dono do texto continue vivo enquanto a view circula.",
                },
                {
                    type: "text",
                    value: "## string_view e a disciplina do não-dono\n\nstd::string_view é um par ponteiro-tamanho: uma JANELA de leitura pra caracteres que pertencem a outra pessoa. Como parâmetro de entrada, é o padrão moderno: aceita string, literal, pedaço de buffer, tudo sem alocar nem copiar, e substr numa view custa aritmética de ponteiro, não alocação.\n\nO perigo é o mesmo do span e de toda referência: DANGLING. A view não estende a vida de ninguém. Os dois acidentes clássicos: retornar view pra uma string local (morre no return) e guardar view como MEMBRO de classe enquanto o texto original é temporário ou realoca. Lembre que métodos como std::string::substr devolvem string NOVA temporária; encadear .substr(...) numa chamada que recebe view cria exatamente o temporário que morre no fim da expressão.\n\nA disciplina que resolve: view em PARÂMETRO, à vontade; view em retorno ou membro, só com um contrato explícito de vida (por exemplo, views pra literais estáticos ou pra um buffer que a própria classe possui). Na dúvida, promova pra std::string e pague a cópia com orgulho: bug de dangling custa mais caro que qualquer alocação.",
                },
            ],
            questions: [
                {
                    statement: "O que a small string optimization (SSO) faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Guarda strings curtas dentro do objeto, sem heap",
                            isCorrect: true,
                        },
                        {
                            text: "Comprime strings longas antes de alocar no heap",
                            isCorrect: false,
                        },
                        {
                            text: "Compartilha o buffer entre cópias da mesma string",
                            isCorrect: false,
                        },
                        {
                            text: "Move strings pequenas pra memória estática do binário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que um std::string_view carrega por dentro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um ponteiro e um tamanho, sem posse do texto",
                            isCorrect: true,
                        },
                        {
                            text: "Uma cópia compacta dos caracteres apontados",
                            isCorrect: false,
                        },
                        {
                            text: "Um contador de referências pro dono do texto",
                            isCorrect: false,
                        },
                        {
                            text: "Um handle opaco validado a cada acesso feito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que string_view costuma ser melhor que const std::string& como parâmetro de leitura?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Aceita literais e pedaços de buffer sem criar string temporária",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a referência const exige que o texto esteja no heap",
                            isCorrect: false,
                        },
                        {
                            text: "Porque string_view valida o encoding do texto na entrada",
                            isCorrect: false,
                        },
                        {
                            text: "Porque referências não funcionam com strings otimizadas por SSO",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual destes usos de string_view é um bug de dangling?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Retornar uma view pra string local da própria função",
                            isCorrect: true,
                        },
                        {
                            text: "Receber view como parâmetro e ler durante a chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Criar uma view sobre um literal de string do código",
                            isCorrect: false,
                        },
                        {
                            text: "Fazer substr numa view pra recortar um trecho lido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando guardar um string_view como membro de classe é aceitável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Com contrato explícito de que o texto vive mais que a view",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre: a view renova o ponteiro quando o texto realoca",
                            isCorrect: false,
                        },
                        {
                            text: "Nunca: membros string_view não compilam dentro de classes",
                            isCorrect: false,
                        },
                        {
                            text: "Somente quando o texto original mora no heap do processo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Algoritmos e lambdas",
            blocks: [
                {
                    type: "text",
                    value: "# Diga a operação pelo nome\n\nUm loop cru com for, if e break é um quebra-cabeça que o leitor remonta toda vez. A dupla <algorithm> mais lambda troca o quebra-cabeça por um NOME: find_if acha o primeiro que satisfaz; count_if conta; transform mapeia; sort ordena por um critério; erase_if remove. O leitor lê a intenção; o compilador vê código monomorfizado (o lambda vira um functor inline, sem o custo de ponteiro de função).\n\nO lambda é a peça que destravou esse estilo: uma função anônima com CAPTURA de contexto. [limite](const Pedido& p) { return p.total > limite; } carrega o limite pra dentro do predicado. Capture por valor ([x]) pra guardar uma cópia; por referência ([&x]) pra ver a variável original, com a responsabilidade de que ela continue viva enquanto o lambda rodar.\n\nA regra de segurança que evita o acidente clássico: lambda que SOBREVIVE ao escopo (guardado num membro, numa fila de callbacks, numa thread) captura por VALOR. Captura por referência é pra uso imediato, dentro da expressão ou da função.",
                },
                {
                    type: "code",
                    value: "#include <algorithm>\n#include <ranges>\n#include <vector>\n\nstd::vector<Pedido> pedidos = carregar();\n\n// Ordenar por criterio: lambda como comparador\nstd::sort(pedidos.begin(), pedidos.end(),\n          [](const Pedido& a, const Pedido& b) { return a.total > b.total; });\n\n// Achar o primeiro acima do limite\ndouble limite = 1000.0;\nauto caro = std::find_if(pedidos.begin(), pedidos.end(),\n                         [limite](const Pedido& p) { return p.total > limite; });\n\n// Remover cancelados: C++20, uma chamada\nstd::erase_if(pedidos, [](const Pedido& p) { return p.cancelado; });\n\n// Ranges (C++20): pipeline preguicoso, sem vetor intermediario\nauto totais = pedidos\n    | std::views::filter([](const Pedido& p) { return !p.cancelado; })\n    | std::views::transform([](const Pedido& p) { return p.total; });",
                },
                {
                    type: "table",
                    value: '[["Loop cru","Algoritmo","A intenção que o nome grita"],["for com if e break","find_if","Achar o primeiro que satisfaz"],["for com contador e if","count_if","Contar quantos satisfazem"],["for copiando e convertendo","transform / views::transform","Mapear valores"],["for removendo com índice manual","erase_if","Remover pelo critério"],["for acumulando num total","accumulate / fold_left","Reduzir a um valor"]]',
                },
                {
                    type: "quote",
                    value: "Cada for cru que vira find_if é uma decisão a menos pro leitor reconstruir. Algoritmo com nome é comentário que o compilador verifica.",
                },
                {
                    type: "text",
                    value: "## Ranges: a evolução que compõe\n\nOs algoritmos clássicos têm duas fricções: o par begin/end repetitivo e a composição ruim (filtrar E transformar pede vetor intermediário ou um loop híbrido). Os RANGES do C++20 resolvem as duas. std::ranges::sort(pedidos) recebe o container inteiro; e as VIEWS (filter, transform, take, drop) se encadeiam com o pipe, formando pipelines PREGUIÇOSOS: nada é calculado até alguém percorrer o resultado, e nenhum container intermediário nasce.\n\nA leitura muda de forma: dados | filtro | transformação, na ordem em que você contaria o processo em voz alta. E como views são não-donas (janelas sobre o container original, parentes do string_view), valem as mesmas regras de vida: não deixe a view sobreviver ao container, e não modifique o container enquanto itera a view.\n\nO critério de adoção em 2026: ranges pra pipelines de leitura e transformação, onde brilham; algoritmos clássicos seguem perfeitos pra ações pontuais (sort, find) e são o que você mais vai encontrar em bases existentes. Os dois estilos convivem no mesmo arquivo sem conflito; o que não deve sobreviver ao review é o for cru fazendo o trabalho que um nome faria.",
                },
            ],
            questions: [
                {
                    statement: "O que std::find_if faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Devolve o primeiro elemento que satisfaz o predicado",
                            isCorrect: true,
                        },
                        {
                            text: "Conta os elementos que satisfazem o predicado dado",
                            isCorrect: false,
                        },
                        {
                            text: "Remove do container os elementos que casam com o teste",
                            isCorrect: false,
                        },
                        {
                            text: "Ordena os elementos de acordo com o predicado passado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a captura [limite] num lambda significa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O lambda guarda uma CÓPIA da variável limite",
                            isCorrect: true,
                        },
                        {
                            text: "O lambda referencia a variável original limite",
                            isCorrect: false,
                        },
                        {
                            text: "O limite vira parâmetro obrigatório da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "O lambda só roda se limite for diferente de zero",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a regra de segurança pra lambdas que sobrevivem ao escopo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Capturar por valor, pra não referenciar variáveis mortas",
                            isCorrect: true,
                        },
                        {
                            text: "Capturar por referência, pra evitar cópias desnecessárias",
                            isCorrect: false,
                        },
                        {
                            text: "Evitar capturas e usar apenas variáveis globais no corpo",
                            isCorrect: false,
                        },
                        {
                            text: "Declarar o lambda como noexcept antes de armazená-lo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa dizer que as views de ranges são preguiçosas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nada é computado até alguém percorrer o resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Elas processam em thread de fundo de baixa prioridade",
                            isCorrect: false,
                        },
                        {
                            text: "Elas guardam um cache dos resultados já visitados",
                            isCorrect: false,
                        },
                        {
                            text: "Elas só funcionam com containers pequenos na pilha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a vantagem estrutural do pipeline filter | transform sobre dois loops com vetor intermediário?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Compõe sem materializar container intermediário nenhum",
                            isCorrect: true,
                        },
                        {
                            text: "Executa os dois estágios em threads separadas do pool",
                            isCorrect: false,
                        },
                        {
                            text: "Garante ordenação estável dos elementos filtrados",
                            isCorrect: false,
                        },
                        {
                            text: "Reduz a complexidade assintótica de O(n) pra O(log n)",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Escolher container",
            blocks: [
                {
                    type: "text",
                    value: '# vector primeiro, o resto com motivo\n\nDepois de quatro aulas de custos, a síntese do módulo é uma política: comece com VECTOR, troque quando o padrão de acesso der um motivo nomeável. Não porque vector seja "o melhor container", mas porque memória contígua é o default que a máquina de 2026 recompensa: cache aproveitado, prefetch funcionando, zero alocação por elemento. As alternativas existem pra padrões de acesso específicos, e a tabela desta aula é o mapa deles.\n\nO exemplo que encerra a lenda urbana: std::list. No papel, inserção O(1) no meio; na prática, cada nó é uma alocação e cada avanço um salto de ponteiro, e ACHAR o ponto de inserção custa um percurso que enterra a vantagem. Em 2026, com a distância entre CPU e memória ainda crescendo, a list perde do vector até em benchmarks de inserção no meio pra tamanhos moderados. Ela sobrevive pra um nicho: elementos que NÃO PODEM se mover (ponteiros externos pra eles) com inserções em posições já conhecidas.\n\nCritério, não ranking: cada estrutura tem o padrão de acesso em que vence. Seu trabalho é nomear o seu padrão antes de escolher.',
                },
                {
                    type: "table",
                    value: '[["Padrão de acesso","Comece com","Troque se"],["Sequência; percorrer e acrescentar no fim","vector","Elementos não puderem se mover: list"],["Fila: entra atrás, sai na frente","deque","Precisar de bloco contíguo: vector"],["Chave e valor, só busca exata","unordered_map","Precisar de ordem ou faixas: map"],["Conjunto de únicos","unordered_set","Precisar de ordem: set"],["Pilha (LIFO)","vector ou stack","Quase nunca"],["Lookup pequeno e estável","vector ordenado + binary_search","Crescer e mudar muito: mapa"]]',
                },
                {
                    type: "code",
                    value: "#include <algorithm>\n#include <string>\n#include <vector>\n\n// Lookup pequeno e estavel: 30 codigos consultados milhoes de vezes.\n// Monta uma vez, ordena, busca binaria: contiguidade + O(log n).\nstd::vector<std::pair<std::string, int>> tabela = carregarCodigos();\nstd::sort(tabela.begin(), tabela.end());\n\nint buscar(const std::vector<std::pair<std::string, int>>& t,\n           const std::string& chave) {\n    auto it = std::lower_bound(\n        t.begin(), t.end(), chave,\n        [](const auto& par, const std::string& k) { return par.first < k; });\n    if (it != t.end() && it->first == chave) return it->second;\n    return -1;\n}",
                },
                {
                    type: "quote",
                    value: "A pergunta profissional nunca é 'qual container é o melhor?', é 'como esses dados são acessados?'. Nomeie o padrão de acesso e a escolha se faz sozinha.",
                },
                {
                    type: "text",
                    value: '## O ritual de escolha em quatro perguntas\n\nFormalize o hábito. Pergunta um: preciso de CHAVE ou de SEQUÊNCIA? Sequência aponta pra vector e parentes; chave aponta pros mapas. Pergunta dois: ORDEM importa (iteração ordenada, faixas)? Sim empurra pra map/set ou vector ordenado; não libera as versões unordered. Pergunta três: qual o TAMANHO típico e quem domina, leitura ou escrita? Pequeno ou leitura em massa favorecem contiguidade; grande e mutável favorece as estruturas de chave. Pergunta quatro: esse código está num caminho quente? Se sim, a resposta vira hipótese e o benchmark com dados reais dá o veredito.\n\nRepare que o ritual produz um MOTIVO dizível: "unordered_map porque é busca exata numa coleção grande e sem ordem". Essa frase é o que o revisor quer ler na descrição do PR, e o que você quer reencontrar quando voltar ao código em seis meses.\n\nE quando o perfil de acesso mudar (a coleção que era pequena cresceu, a escrita que era rara virou frequente), a troca é local: o container é detalhe de implementação atrás de uma interface, e mudar o default barato pra estrutura certa é refactor de uma tarde, não de um mês.',
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é o container default recomendado pra uma sequência de elementos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "vector, pela memória contígua e custo por elemento",
                            isCorrect: true,
                        },
                        {
                            text: "list, pela inserção em tempo constante no meio",
                            isCorrect: false,
                        },
                        {
                            text: "deque, por crescer nas duas pontas sem realocar",
                            isCorrect: false,
                        },
                        {
                            text: "set, por manter os elementos sempre ordenados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pra uma fila em que se insere atrás e se remove da frente, qual é o ponto de partida?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "deque, que cresce e encolhe nas duas pontas",
                            isCorrect: true,
                        },
                        {
                            text: "vector, que remove da frente em tempo constante",
                            isCorrect: false,
                        },
                        {
                            text: "map, que mantém a ordem de chegada por chave",
                            isCorrect: false,
                        },
                        {
                            text: "unordered_set, que descarta duplicatas na entrada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que std::list raramente vence na prática, apesar da inserção O(1)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nós espalhados: cache frio e uma alocação por elemento",
                            isCorrect: true,
                        },
                        {
                            text: "A inserção O(1) dela só vale nas duas pontas da lista",
                            isCorrect: false,
                        },
                        {
                            text: "O padrão descontinuou a list nas versões recentes",
                            isCorrect: false,
                        },
                        {
                            text: "Ela não aceita tipos com construtor de move noexcept",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma tabela de 30 códigos fixos é consultada milhões de vezes. Qual desenho tende a vencer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "vector ordenado com busca binária: contíguo e pequeno",
                            isCorrect: true,
                        },
                        {
                            text: "map, pela garantia O(log n) com rebalanceamento",
                            isCorrect: false,
                        },
                        {
                            text: "list ordenada, pra inserir novos códigos sem realocar",
                            isCorrect: false,
                        },
                        {
                            text: "unordered_map com rehash agressivo pra zerar colisões",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que deve acompanhar a escolha de container num PR revisável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O motivo nomeado: o padrão de acesso que justifica a troca",
                            isCorrect: true,
                        },
                        {
                            text: "Um benchmark completo pra cada container da biblioteca",
                            isCorrect: false,
                        },
                        {
                            text: "A promessa de migrar pra estrutura mais nova do padrão",
                            isCorrect: false,
                        },
                        {
                            text: "A tabela de complexidade copiada na descrição da mudança",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Erros sem exceção",
    aulas: [
        {
            titulo: "Exceções",
            blocks: [
                {
                    type: "text",
                    value: '# O modelo, o custo e quem o desliga\n\nO modelo de exceções do C++ tem uma elegância real: o erro sobe SOZINHO até quem sabe tratá-lo, atravessando dez camadas sem poluir nenhuma assinatura, e o stack unwinding destrói os objetos locais no caminho, o que faz do RAII o par perfeito do throw. Erro raro, tratado longe, com limpeza automática: esse é o caso de uso pra que exceções foram desenhadas.\n\nO custo é assimétrico por design. As implementações modernas são "zero-cost" no CAMINHO FELIZ: nenhum ciclo gasto enquanto nada é lançado, porque a informação de unwinding fica em tabelas estáticas no binário. Já o CAMINHO DO THROW é caro e, pior, IMPREVISÍVEL: percorrer tabelas, desenrolar frames, destruir objetos; a latência varia com a profundidade da pilha e o estado do cache.\n\nEssa imprevisibilidade explica quem desliga (-fno-exceptions): jogos com orçamento de 16 ms por frame, embarcado com binário contado em kilobytes, kernels e sistemas de latência crítica. Não é implicância cultural; é o custo do caminho frio não caber no orçamento.',
                },
                {
                    type: "code",
                    value: '#include <fstream>\n#include <iostream>\n#include <stdexcept>\n#include <string>\n\nConfig carregar(const std::string& caminho) {\n    std::ifstream arq(caminho);\n    if (!arq) throw std::runtime_error("config ausente: " + caminho);\n    return parse(arq);   // parse tambem pode lancar; ninguem aqui trata\n}\n\nint main() {\n    try {\n        auto cfg = carregar("app.conf");\n        // subir(cfg);\n    } catch (const std::exception& e) {   // captura por referencia const\n        std::cerr << "falha na subida: " << e.what() << \'\\n\';\n        return 1;\n    }\n    return 0;\n}',
                },
                {
                    type: "table",
                    value: '[["Aspecto","Como o modelo se comporta"],["Caminho feliz","Custo próximo de zero: tabelas estáticas prontas"],["Caminho do throw","Caro e de latência imprevisível"],["Limpeza no percurso","Unwinding chama destrutores: RAII obrigatório"],["Quem costuma desligar","Jogos, embarcado, kernel, latência crítica"],["Uso legítimo","Erro excepcional, tratado longe do ponto de origem"]]',
                },
                {
                    type: "quote",
                    value: "Exceção é pra o excepcional. No momento em que um throw participa do fluxo NORMAL do programa, você tem um goto caro com sintaxe respeitável.",
                },
                {
                    type: "text",
                    value: "## O critério de uso que sobrevive ao review\n\nTrês regras separam o uso maduro do abuso. Primeira: exceção pra falha EXCEPCIONAL, aquela que o chamador imediato não tem como resolver (config ausente na subida, invariante quebrada, sem memória). Falha ESPERADA do domínio (usuário não encontrado, entrada inválida, timeout de rede) não é excepcional: é resultado, e as próximas aulas mostram os tipos que a representam melhor.\n\nSegunda: lance por VALOR, capture por REFERÊNCIA CONST (catch (const std::exception& e)). Capturar por valor fatia o objeto pro tipo da base e perde a informação do tipo derivado; capturar por ponteiro cria dúvida de posse.\n\nTerceira: exceções pedem código EXCEPTION-SAFE embaixo, e isso em C++ significa uma coisa concreta: todo recurso em RAII, nenhuma limpeza manual entre o ponto que pode lançar e o fim do escopo. Se um código mistura new solto com funções que lançam, o vazamento não é risco, é cronograma. Nos módulos anteriores você construiu exatamente a base que torna exceções seguras; sem ela, o modelo inteiro desaba.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que acontece com os objetos locais quando uma exceção atravessa uma função?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O unwinding chama o destrutor de cada um deles",
                            isCorrect: true,
                        },
                        {
                            text: "Eles vazam, a menos que haja um bloco finally",
                            isCorrect: false,
                        },
                        {
                            text: "Ficam vivos até o catch decidir o destino deles",
                            isCorrect: false,
                        },
                        {
                            text: "São movidos automaticamente pro escopo do catch",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa dizer que exceções modernas são 'zero-cost'?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O caminho SEM throw não paga nada em tempo de execução",
                            isCorrect: true,
                        },
                        {
                            text: "Lançar e capturar uma exceção custam o mesmo que um if comum",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho do binário não muda nada ao habilitar exceções",
                            isCorrect: false,
                        },
                        {
                            text: "O throw é otimizado pelo compilador pra rodar em tempo constante",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que jogos e sistemas embarcados costumam compilar sem exceções?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O caminho do throw tem custo imprevisível e o binário cresce",
                            isCorrect: true,
                        },
                        {
                            text: "Exceções não funcionam em processadores sem sistema operacional",
                            isCorrect: false,
                        },
                        {
                            text: "O padrão proíbe throw em código que roda a mais de 60 fps",
                            isCorrect: false,
                        },
                        {
                            text: "Essas plataformas não têm memória heap pra criar exceções",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a forma correta de lançar e capturar exceções?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Lançar por valor e capturar por referência const",
                            isCorrect: true,
                        },
                        {
                            text: "Lançar por ponteiro e capturar por valor na base",
                            isCorrect: false,
                        },
                        {
                            text: "Lançar por referência e capturar por ponteiro cru",
                            isCorrect: false,
                        },
                        {
                            text: "Lançar e capturar sempre pelo tipo mais derivado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Durante o unwinding de uma exceção, o destrutor de um objeto lança outra. O que acontece?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "std::terminate: duas exceções ativas não coexistem",
                            isCorrect: true,
                        },
                        {
                            text: "A segunda exceção substitui a primeira no mesmo catch",
                            isCorrect: false,
                        },
                        {
                            text: "As duas são enfileiradas e tratadas em sequência",
                            isCorrect: false,
                        },
                        {
                            text: "A segunda é suprimida e registrada em um log interno",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "optional e expected",
            blocks: [
                {
                    type: "text",
                    value: '# Ausência e falha, tipadas no retorno\n\nA falha ESPERADA merece morar no tipo de retorno, onde o compilador obriga todo mundo a olhar pra ela. O C++ moderno dá dois veículos.\n\nstd::optional<T> representa AUSÊNCIA: a busca que pode não achar, o campo que pode não existir, o parse do que pode estar vazio. Ou tem um T, ou não tem nada, e "nada" aqui não é erro: é resposta legítima. O uso idiomático testa e acessa: if (auto u = buscar(id)) { usar(*u); }.\n\nstd::expected<T, E>, do C++23, representa FALHA COM MOTIVO: ou o valor, ou um erro TIPADO dizendo por quê. É a resposta pra pergunta que optional não responde: "não veio... mas por quê?". O erro viaja como valor comum, sem unwinding, com custo previsível de um branch, e a assinatura vira contrato completo: std::expected<Config, ErroConfig> carregar(...) lista sucesso E fracasso no mesmo lugar. Em 2026, com os três grandes compiladores suportando, expected é o padrão emergente pra falha esperada em APIs novas.',
                },
                {
                    type: "code",
                    value: '#include <expected>\n#include <optional>\n#include <string_view>\n\nstd::optional<Usuario> buscar(int id);   // nao achar NAO e erro\n\nif (auto u = buscar(42)) {\n    usar(*u);                            // * acessa o valor contido\n}\n\nenum class ErroConfig { ausente, malformada, permissao };\n\nstd::expected<Config, ErroConfig> carregar(std::string_view caminho);\n\n// Encadeamento monadico (C++23): o erro atravessa sem if em cascata\nint porta = carregar("app.conf")\n    .transform([](const Config& c) { return c.porta; })\n    .value_or(8080);\n\n// Tratando o motivo quando ele importa:\nauto cfg = carregar("app.conf");\nif (!cfg) {\n    reportar(cfg.error());               // o ErroConfig tipado\n}',
                },
                {
                    type: "table",
                    value: '[["Situação","Tipo de retorno","Por quê"],["Pode não existir","optional<T>","Ausência é resposta, não falha"],["Pode falhar com motivo","expected<T, E>","O erro viaja tipado no retorno"],["Falha rara, tratada longe","Exceção","Atravessa camadas sem poluir assinaturas"],["Sempre existe","T direto","Não invente incerteza onde não há"]]',
                },
                {
                    type: "quote",
                    value: "optional responde 'tem ou não tem'; expected responde 'veio, ou este é o motivo'. Escolher entre os dois é decidir se o chamador precisa do porquê.",
                },
                {
                    type: "text",
                    value: "## Encadear sem pirâmide de if\n\nO ganho de escala vem das operações MONÁDICAS do C++23, que os dois tipos compartilham. and_then encadeia a próxima etapa que também pode falhar; transform aplica uma função ao valor, se houver; or_else e value_or resolvem o caso vazio no fim da corrente. Um pipeline carregar().and_then(validar).transform(extrairPorta).value_or(8080) lê como a lógica de negócio, e o primeiro erro da corrente curto-circuita as etapas seguintes sem um único if aninhado.\n\nTrês disciplinas mantêm o padrão saudável. Primeira: optional é pra AUSÊNCIA; se existe motivo de falha que o chamador pode querer distinguir, é expected (resistir à preguiça do optional que engole o porquê). Segunda: acessar com * sem testar é UB com optional e com expected; os pipelines existem justamente pra concentrar o teste num lugar. Terceira: o tipo de erro E deve ser pequeno e enumerável (a próxima aula cuida dele); expected com E gigante vira exceção disfarçada com custo de cópia.\n\nCom esses dois tipos, a falha esperada sai do comentário e entra no contrato. O que sobra pra exceção é o que sempre foi dela: o genuinamente excepcional.",
                },
            ],
            questions: [
                {
                    statement: "O que um std::optional<T> expressa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um valor que pode legitimamente não existir",
                            isCorrect: true,
                        },
                        {
                            text: "Um valor que só é calculado no primeiro acesso",
                            isCorrect: false,
                        },
                        {
                            text: "Um erro recuperável com a mensagem embutida",
                            isCorrect: false,
                        },
                        {
                            text: "Um valor alocado fora do heap por segurança",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que std::expected<T, E> carrega?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ou o valor T, ou um erro tipado E com o motivo",
                            isCorrect: true,
                        },
                        {
                            text: "O valor T junto de um log completo da operação",
                            isCorrect: false,
                        },
                        {
                            text: "Uma exceção capturada e pronta pra relançamento",
                            isCorrect: false,
                        },
                        {
                            text: "Dois valores alternativos escolhidos em runtime",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o critério entre retornar optional<T> e expected<T, E>?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Se o chamador precisa do motivo da falha, é expected",
                            isCorrect: true,
                        },
                        {
                            text: "optional pra tipos pequenos; expected pra tipos grandes",
                            isCorrect: false,
                        },
                        {
                            text: "expected exige exceções ativas; optional funciona sem",
                            isCorrect: false,
                        },
                        {
                            text: "optional é só pra ponteiros; expected pra valores comuns",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o encadeamento com and_then e transform elimina?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A cascata de if aninhados checando cada etapa",
                            isCorrect: true,
                        },
                        {
                            text: "A necessidade de definir tipos de erro no projeto",
                            isCorrect: false,
                        },
                        {
                            text: "O custo de mover valores entre as etapas da corrente",
                            isCorrect: false,
                        },
                        {
                            text: "A obrigação de tratar o caso vazio no fim do fluxo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que .value_or(8080) faz num expected<int, E>?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Devolve o valor, ou 8080 no caso de erro, sem lançar",
                            isCorrect: true,
                        },
                        {
                            text: "Substitui o erro por 8080 e relança em seguida",
                            isCorrect: false,
                        },
                        {
                            text: "Devolve 8080 somente se o valor contido for nulo",
                            isCorrect: false,
                        },
                        {
                            text: "Grava 8080 dentro do expected pra usos futuros",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Códigos de erro bem feitos",
            blocks: [
                {
                    type: "text",
                    value: "# enum class e o retorno que grita\n\nAntes de expected existir, e ainda hoje em fronteiras de sistema e código sem exceções, o veículo da falha é o CÓDIGO DE ERRO. A versão bem feita começa com enum class: enumeração com escopo (ErroRede::timeout, não timeout solto no namespace) e SEM conversão implícita pra int, o que mata a família de bugs de comparar erro com número mágico ou somar erros por acidente. Inclua o caso de sucesso explícito (ok = 0) e a leitura fica natural.\n\nO problema histórico dos códigos de erro nunca foi expressividade, foi IGNORABILIDADE: o chamador esquece de olhar o retorno e a falha some. A resposta moderna é o atributo [[nodiscard]] na função: descartar o retorno vira WARNING no compilador, e warning em projeto sério vira ERRO no CI (-Werror). O esquecimento passa de bug latente pra build quebrado, que é onde bugs devem morrer.\n\nComplete com a regra cultural inegociável: NENHUMA falha é engolida em silêncio. Se a decisão consciente é seguir em frente, o mínimo é registrar em log; o caminho de erro sem rastro é o mais caro de depurar depois.",
                },
                {
                    type: "code",
                    value: '#include <cstdio>\n\nenum class ErroRede { ok = 0, timeout, dns, recusado };\n\n[[nodiscard]] ErroRede enviar(const Pacote& p);\n\nvoid processa(const Pacote& p) {\n    // O idioma: testar no if com variavel local\n    if (auto e = enviar(p); e != ErroRede::ok) {\n        logErro("envio falhou", e);      // caminho de erro SEMPRE com rastro\n        return;\n    }\n    confirmar(p);\n}\n\nvoid descuido(const Pacote& p) {\n    enviar(p);   // [[nodiscard]]: warning aqui; com -Werror, build quebrado\n}',
                },
                {
                    type: "table",
                    value: '[["Prática","Sem ela","Com ela"],["enum class no lugar de int","Números mágicos e comparação solta","Tipo fechado, escopo próprio"],["[[nodiscard]] na função","Retorno ignorado em silêncio","Warning; o CI promove a erro"],["Caso ok explícito","Adivinhação com 0 e -1","Intenção legível no código"],["Log no caminho de erro","Falha desaparece sem rastro","Depuração com história completa"]]',
                },
                {
                    type: "quote",
                    value: "Código de erro ignorado é pior que exceção não capturada: a exceção pelo menos derruba o processo gritando; o código ignorado segue em frente, errado e mudo.",
                },
                {
                    type: "text",
                    value: '## std::error_code e o mapa das fronteiras\n\nA biblioteca padrão tem a própria infraestrutura pra códigos: std::error_code, um par valor-categoria que carrega erros de origens diferentes (sistema operacional, bibliotecas, os seus) num tipo único, sem alocação e sem exceção. É o que a std::filesystem usa nas sobrecargas com parâmetro de error_code, a alternativa sem throw de cada operação. Vale conhecer pra interoperar; pra código de domínio, o enum class próprio, pequeno e específico, costuma comunicar melhor.\n\nO mapa completo do módulo, então: exceções pro excepcional que atravessa camadas; expected pra falha esperada com motivo, em APIs novas; optional pra ausência; enum class com [[nodiscard]] onde o estilo de código de erro é o vigente (fronteiras de C, projetos sem exceções, hot paths que não toleram unwinding). Os quatro convivem no mesmo sistema, cada um no seu andar.\n\nO que não convive com nenhum deles é a falha silenciosa. Qualquer que seja o veículo, a pergunta de review é a mesma: "se isso falhar às 3 da manhã, que rastro sobra?". Se a resposta é nenhum, o PR não está pronto.',
                },
            ],
            questions: [
                {
                    statement: "Qual vantagem o enum class tem sobre um int como código de erro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Escopo próprio e nenhuma conversão implícita pra número",
                            isCorrect: true,
                        },
                        {
                            text: "Ocupa menos memória que um int em todas as plataformas",
                            isCorrect: false,
                        },
                        {
                            text: "Pode ser lançado como exceção sem custo adicional",
                            isCorrect: false,
                        },
                        {
                            text: "É serializado automaticamente pros arquivos de log",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o atributo [[nodiscard]] faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Gera warning quando o retorno da função é descartado",
                            isCorrect: true,
                        },
                        {
                            text: "Impede que a função seja removida pelo otimizador",
                            isCorrect: false,
                        },
                        {
                            text: "Proíbe chamar a função fora de blocos try/catch",
                            isCorrect: false,
                        },
                        {
                            text: "Marca o retorno pra ser liberado pelo destrutor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como um warning de [[nodiscard]] vira proteção de verdade num time?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Com -Werror no CI, que promove o warning a erro de build",
                            isCorrect: true,
                        },
                        {
                            text: "Ativando a checagem equivalente no linker da plataforma",
                            isCorrect: false,
                        },
                        {
                            text: "Repetindo o atributo em todas as chamadas da função",
                            isCorrect: false,
                        },
                        {
                            text: "Convertendo os warnings em exceções na inicialização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a falha engolida em silêncio é o pior desfecho?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O sistema segue errado sem deixar rastro pra depurar",
                            isCorrect: true,
                        },
                        {
                            text: "Ela corrompe o log com mensagens fora de ordem",
                            isCorrect: false,
                        },
                        {
                            text: "Ela sempre evolui pra um crash nas horas seguintes",
                            isCorrect: false,
                        },
                        {
                            text: "Ela invalida os testes de unidade da função chamada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Pra que serve o std::error_code da biblioteca padrão?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Carregar erros de origens variadas num tipo único, sem throw",
                            isCorrect: true,
                        },
                        {
                            text: "Converter qualquer exceção em código numérico portátil",
                            isCorrect: false,
                        },
                        {
                            text: "Padronizar as mensagens de erro exibidas ao usuário final",
                            isCorrect: false,
                        },
                        {
                            text: "Numerar automaticamente os enums de erro do projeto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "noexcept",
            blocks: [
                {
                    type: "text",
                    value: "# O contrato de não lançar\n\nnoexcept é uma promessa verificável: esta função NÃO lança. Se a promessa for quebrada e uma exceção tentar sair de uma função noexcept, o programa chama std::terminate na hora. Repare no desenho: não é UB, não é exceção que escapa; é encerramento imediato e barulhento. O contrato é duro de propósito, porque quem depende dele toma decisões irreversíveis.\n\nO maior dependente você já conhece do módulo de move: o vector usa move_if_noexcept na realocação. Move noexcept, ele move; move sem a marca, ele COPIA tudo pra preservar a garantia forte. Essa é a razão número um pra marcar: construtor de move e atribuição de move noexcept sempre que a implementação permitir (e roubo de ponteiros permite: não aloca, não lança).\n\nO segundo efeito é de código gerado: chamadas pra funções noexcept dispensam a infraestrutura de unwinding daquele trecho, o que encolhe binário e destrava otimizações locais. É ganho real, mas menor que o do vector; trate como bônus, não como motivo.",
                },
                {
                    type: "code",
                    value: "#include <type_traits>\n#include <utility>\n\nclass Imagem {\npublic:\n    Imagem(Imagem&& outra) noexcept;              // move: roubo, nao lanca\n    Imagem& operator=(Imagem&& outra) noexcept;\n\n    void trocar(Imagem& outra) noexcept {         // swap: base de idiomas\n        std::swap(dados_, outra.dados_);\n        std::swap(tam_, outra.tam_);\n    }\n\n    ~Imagem();          // destrutor ja e noexcept IMPLICITO\n\nprivate:\n    unsigned char* dados_ = nullptr;\n    std::size_t tam_ = 0;\n};\n\n// Trave o contrato no build: se alguem quebrar o noexcept do move,\n// este assert falha na compilacao, nao em producao.\nstatic_assert(std::is_nothrow_move_constructible_v<Imagem>);",
                },
                {
                    type: "table",
                    value: '[["Onde marcar noexcept","Por quê"],["Move ctor e move assignment","vector move na realocação; senão copia"],["swap","Base de idiomas de atribuição e rollback"],["Destrutores","Já implícito; lançar deles é terminate"],["Funções de limpeza e handlers","Rodam em caminhos de erro; não podem falhar"],["Tudo indiscriminadamente","NÃO: contrato difícil de reverter depois"]]',
                },
                {
                    type: "quote",
                    value: "noexcept não é otimização, é PROMESSA com pena de morte: quebrou, terminate. Marque onde a semântica garante, não onde o benchmark pediu.",
                },
                {
                    type: "text",
                    value: '## Onde marcar, onde resistir\n\nA lista positiva é curta e forte. Move e swap: marque, é o caso com retorno concreto (vector, algoritmos de rearranjo). Destrutores: já são noexcept implícitos desde o C++11; a regra prática é nunca deixar exceção sair de um, porque destrutor que lança durante um unwinding é terminate na certa. Funções de limpeza, handlers de erro, callbacks chamados em caminho de falha: marque, quem trata erro não pode criar outro.\n\nA lista de resistência importa igualmente. NÃO saia marcando API pública inteira "porque hoje não lança": noexcept é contrato de INTERFACE, e retirá-lo amanhã quebra quem dependeu (inclusive decisões de otimização tomadas pelo compilador em cima da marca). Função cuja implementação pode legitimamente vir a lançar (aloca, faz I/O, chama código de terceiros) fica sem a marca, honestamente.\n\nFeche com a ferramenta de fiscalização: static_assert com is_nothrow_move_constructible nos tipos que dependem do move barato. Uma linha por classe, e a promessa deixa de ser tradição oral pra virar contrato que o build executa.',
                },
            ],
            questions: [
                {
                    statement: "O que acontece se uma exceção tenta sair de uma função noexcept?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O programa chama std::terminate imediatamente",
                            isCorrect: true,
                        },
                        {
                            text: "A exceção é convertida em código de erro numérico",
                            isCorrect: false,
                        },
                        {
                            text: "Comportamento indefinido: qualquer coisa pode ocorrer",
                            isCorrect: false,
                        },
                        {
                            text: "A exceção sobe normalmente, mas com custo dobrado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais funções são as candidatas número um ao noexcept?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Construtor de move, atribuição de move e swap",
                            isCorrect: true,
                        },
                        {
                            text: "Todas as funções públicas de cada classe do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Funções que fazem I/O de arquivo e chamadas de rede",
                            isCorrect: false,
                        },
                        {
                            text: "Somente funções template instanciadas mais de uma vez",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual decisão da biblioteca padrão depende do noexcept do seu move?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O vector mover, em vez de copiar, ao realocar",
                            isCorrect: true,
                        },
                        {
                            text: "O map aceitar o tipo como chave de busca",
                            isCorrect: false,
                        },
                        {
                            text: "O sort usar o algoritmo paralelo por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "O unique_ptr dispensar o deleter customizado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que NÃO marcar noexcept em toda API pública por via das dúvidas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É contrato de interface: reverter depois quebra quem dependeu",
                            isCorrect: true,
                        },
                        {
                            text: "Cada noexcept adiciona uma checagem em tempo de execução",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador ignora a marca quando ela aparece demais",
                            isCorrect: false,
                        },
                        {
                            text: "Funções noexcept não podem ser chamadas de blocos try",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o status do destrutor em relação ao noexcept?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "É noexcept implícito; lançar dele encerra o programa",
                            isCorrect: true,
                        },
                        {
                            text: "Precisa da marca explícita pra não propagar exceções",
                            isCorrect: false,
                        },
                        {
                            text: "Não pode ser noexcept, pois libera recursos que falham",
                            isCorrect: false,
                        },
                        {
                            text: "É noexcept apenas quando a classe não tem membros",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Asserts, invariantes e UB",
            blocks: [
                {
                    type: "text",
                    value: '# O contrato com o compilador\n\nassert(condição) é documentação EXECUTÁVEL: declara uma pré-condição ou invariante ("este vetor nunca chega vazio aqui") e derruba o programa no ponto exato em que a premissa mentiu. Em release, com NDEBUG definido, os asserts somem por completo, custo zero. Essa dualidade define o uso: assert é pra bugs de PROGRAMAÇÃO (violações de contrato interno), nunca pra erros de runtime esperados (entrada de usuário, arquivo ausente), que continuam com os tipos do restante do módulo, ativos também em release.\n\nO primo de compilação é o static_assert, que verifica propriedades de tipos e constantes no build (você o viu travando o noexcept do move). Entre os dois, uma boa base cobre os contratos nos dois tempos: o que dá pra provar no build, static_assert; o que só existe em execução, assert.\n\nE os asserts têm um papel maior do que parecem: eles demarcam a fronteira do COMPORTAMENTO INDEFINIDO, o assunto que fecha o módulo e que o C++ te obriga a entender de verdade.',
                },
                {
                    type: "code",
                    value: '#include <cassert>\n#include <vector>\n\ndouble media(const std::vector<double>& v) {\n    assert(!v.empty() && "media exige vetor nao vazio");  // contrato interno\n    double soma = 0.0;\n    for (double x : v) soma += x;\n    return soma / v.size();\n}\n\n// UB classico: o compilador ASSUME que nada disso acontece\nint dobra(int a) { return a * 2; }   // overflow de int com sinal: UB\n// v[i] fora dos limites: UB (use v.at(i) se quiser excecao)\n// ler ponteiro apos free/delete: UB\n// data race entre threads sem sincronizacao: UB\n\n// Em cima dessas suposicoes o otimizador REESCREVE seu codigo:\n// um "if (a + 1 < a)" pra detectar overflow de int com sinal\n// pode ser eliminado por inteiro: o compilador prova que "nunca" ocorre.',
                },
                {
                    type: "table",
                    value: '[["Ferramenta","Pega o quê","Quando roda"],["assert","Contrato interno violado","Debug; some com NDEBUG"],["static_assert","Propriedade de tipo ou constante","Compilação"],["UBSan","Overflow com sinal, shift inválido, null","Testes instrumentados"],["ASan","Out-of-bounds, use-after-free, leaks","Testes instrumentados"],["TSan","Data races entre threads","Testes instrumentados"]]',
                },
                {
                    type: "quote",
                    value: "UB não é 'às vezes funciona': é o compilador otimizando em cima da promessa de que aquilo NUNCA acontece. Funcionar no teste é o disfarce, não a absolvição.",
                },
                {
                    type: "text",
                    value: '## UB: a cláusula que você assinou sem ler\n\nComportamento indefinido é o contrato central do C++: a linguagem promete performance máxima em troca de você JAMAIS fazer certas coisas (overflow de int com sinal, acesso fora dos limites, usar ponteiro liberado, data race). Sobre o código que viola, o padrão não promete NADA: nem crash, nem mensagem, nem consistência entre builds.\n\nO ponto que separa quem entende de quem decora: o compilador OTIMIZA assumindo que UB não acontece. Ele deleta checagens que "não podem" ser verdadeiras, reordena acessos, remove loops inteiros. Por isso o programa com UB "funciona" no debug e quebra no release com otimização, ou funciona nesta versão do compilador e não na próxima. O teste que passou não prova ausência de UB; prova que HOJE a roleta parou num número bom.\n\nA defesa em 2026 é padrão de indústria: SANITIZERS no CI. ASan e UBSan instrumentam o binário de teste e transformam o UB silencioso em erro barulhento com stack trace, a um custo que roda em qualquer pipeline. Testes verdes com sanitizers ligados: essa é a definição operacional de "não tem UB conhecido", e o décimo item do checklist que fecha a trilha no projeto final.',
                },
            ],
            questions: [
                {
                    statement: "Pra que tipo de problema o assert é a ferramenta certa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Violações de contrato interno: bugs de programação",
                            isCorrect: true,
                        },
                        {
                            text: "Erros de entrada do usuário em formulários",
                            isCorrect: false,
                        },
                        {
                            text: "Falhas de rede e de leitura de arquivos externos",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer falha que precise aparecer em produção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que acontece com os asserts quando NDEBUG está definido?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "São removidos por completo, com custo zero",
                            isCorrect: true,
                        },
                        {
                            text: "Passam a registrar em log em vez de abortar",
                            isCorrect: false,
                        },
                        {
                            text: "Viram exceções capturáveis pelo chamador",
                            isCorrect: false,
                        },
                        {
                            text: "Continuam ativos, mas sem imprimir mensagem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que define o comportamento indefinido (UB)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Contrato violado: o padrão não promete mais nada",
                            isCorrect: true,
                        },
                        {
                            text: "Um erro que sempre resulta em crash imediato",
                            isCorrect: false,
                        },
                        {
                            text: "Comportamento que varia só entre sistemas operacionais",
                            isCorrect: false,
                        },
                        {
                            text: "Um aviso de compilação que pode ser suprimido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um programa com UB pode passar nos testes e quebrar em produção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O otimizador reescreve assumindo que o UB nunca ocorre",
                            isCorrect: true,
                        },
                        {
                            text: "Os testes rodam com menos memória que a produção",
                            isCorrect: false,
                        },
                        {
                            text: "O UB só se manifesta sob carga de muitos usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Compiladores adicionam proteções apenas em produção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o status do overflow de int COM SINAL em C++?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Comportamento indefinido; o otimizador conta com isso",
                            isCorrect: true,
                        },
                        {
                            text: "Dá a volta em módulo 2^32, exatamente como no unsigned",
                            isCorrect: false,
                        },
                        {
                            text: "Lança std::overflow_error nos builds feitos em modo debug",
                            isCorrect: false,
                        },
                        {
                            text: "Satura no maior valor representável possível do tipo int",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: modernizando um buffer legado",
    aulas: [
        {
            titulo: "O legado",
            blocks: [
                {
                    type: "text",
                    value: '# Leitura de cena do crime\n\nO projeto que fecha a trilha é uma leitura guiada: você vai pegar uma classe Buffer escrita no estilo C-com-classes de vinte anos atrás e modernizá-la aula a aula, aplicando tudo que os módulos anteriores construíram. O código abaixo é real no pior sentido: compila, "funciona" no caminho feliz, e carrega uma coleção completa de crimes de gerenciamento.\n\nAntes de seguir pro próximo bloco, leia a classe e liste você mesmo os problemas. É o exercício de review mais honesto que existe: sem diff, sem descrição de PR, só o código e o seu critério. Procure por posse, por cópia, por const, pelos caminhos de erro.\n\nA lista canônica, pra conferir com a sua: o destrutor vazio deixa o new[] sem delete[] (vazamento em TODA instância); copiarDe copia o PONTEIRO, não os dados (cópia rasa: dois objetos donos do mesmo bloco); os membros públicos deixam qualquer código trocar o ponteiro ou o tamanho e quebrar o invariante; não há UM const na classe; e a cópia gerada pelo compilador (construtor e atribuição) é rasa também, com os mesmos dois donos.',
                },
                {
                    type: "code",
                    value: '// buffer.h, estilo 2004: leia e liste os crimes antes de avancar\n#include <cstddef>\n\nclass Buffer {\npublic:\n    Buffer(std::size_t n) { dados = new char[n]; tam = n; }\n    ~Buffer() {}                       // new[] sem delete[]: VAZAMENTO\n\n    char* pegar() { return dados; }    // expoe o interno; nada de const\n\n    void copiarDe(const Buffer& b) {   // "copia"...\n        dados = b.dados;               // ...RASA: copia o ponteiro\n        tam = b.tam;                   // e o bloco antigo? vazou tambem\n    }\n\n    char* dados;                       // publicos: qualquer um mexe\n    std::size_t tam;\n};\n\n// Bonus sombrio: Buffer b2 = b1; usa a copia GERADA, rasa do mesmo jeito.',
                },
                {
                    type: "table",
                    value: '[["Crime no código","Consequência concreta"],["new[] sem delete[] no destrutor","Vazamento a cada Buffer criado"],["copiarDe copia o ponteiro","Dois donos do mesmo bloco; caos à espreita"],["Cópia gerada também é rasa","Buffer b2 = b1 duplica a posse"],["Membros públicos","Qualquer código quebra o invariante"],["Nenhum const na classe","Leitura e escrita indistinguíveis na API"]]',
                },
                {
                    type: "quote",
                    value: "Código legado não é código velho: é código cujos contratos vivem na cabeça de alguém que já saiu da empresa. O trabalho de modernizar é trazer os contratos pro código.",
                },
                {
                    type: "text",
                    value: "## Por que ele 'funciona', e o plano de ataque\n\nA pergunta incômoda: como um código assim sobreviveu vinte anos? Porque os crimes dele são SILENCIOSOS. O vazamento só derruba processos de vida longa; a cópia rasa só explode quando alguém copia E os dois objetos são usados de verdade; e como o destrutor está vazio, nem o double free denuncia (dois destrutores certos teriam transformado a cópia rasa em crash imediato, que é o jeito do bug pedir socorro). O legado se sustenta num equilíbrio de defeitos que se escondem mutuamente, e é por isso que consertar UM crime de cada vez pode DESTAMPAR outro: corrigir o destrutor sem tocar na cópia rasa converte vazamento em double free.\n\nEssa observação define o método das próximas aulas: mudanças em camadas, cada uma deixando a classe num estado coerente. Aula 2: RAII no armazenamento, destrutor e cópia corretos de uma vez (regra do zero). Aula 3: move explícito com noexcept, e o custo em vector<Buffer> medido conceitualmente. Aula 4: a API externa, com const, span e erros tipados. Aula 5: o checklist que você leva pros seus reviews.",
                },
            ],
            questions: [
                {
                    statement: "Qual defeito o destrutor vazio da classe Buffer causa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Vazamento: o new[] nunca encontra o delete[]",
                            isCorrect: true,
                        },
                        {
                            text: "Double free do bloco a cada destruição de objeto",
                            isCorrect: false,
                        },
                        {
                            text: "Corrupção do heap na primeira escrita no buffer",
                            isCorrect: false,
                        },
                        {
                            text: "Erro de compilação por destrutor sem conteúdo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza a cópia RASA feita por copiarDe?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Copia o ponteiro; os dois objetos partilham o bloco",
                            isCorrect: true,
                        },
                        {
                            text: "Copia os dados, mas ignora o campo de tamanho",
                            isCorrect: false,
                        },
                        {
                            text: "Copia só os primeiros bytes do bloco de origem",
                            isCorrect: false,
                        },
                        {
                            text: "Aloca um bloco novo, porém deixa sem inicializar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que os membros públicos dados e tam são um problema de design?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Qualquer código pode quebrar o invariante da classe",
                            isCorrect: true,
                        },
                        {
                            text: "Membros públicos ocupam mais memória que privados",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador não otimiza acessos a campos públicos",
                            isCorrect: false,
                        },
                        {
                            text: "Campos públicos impedem a classe de ter destrutor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a cópia rasa não explode de imediato nesse legado específico?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem delete no destrutor, o double free nunca acontece",
                            isCorrect: true,
                        },
                        {
                            text: "O sistema operacional detecta e separa os dois blocos",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador converte a cópia rasa em cópia profunda",
                            isCorrect: false,
                        },
                        {
                            text: "Blocos de char são imunes a liberações duplicadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Se você corrigir SÓ o destrutor (delete[] nele), o que a cópia rasa passa a causar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Double free: os dois destrutores liberam o mesmo bloco",
                            isCorrect: true,
                        },
                        {
                            text: "Nada acontece: o destrutor certo também conserta a cópia",
                            isCorrect: false,
                        },
                        {
                            text: "Vazamento maior ainda, porque cada cópia aloca um bloco novo",
                            isCorrect: false,
                        },
                        {
                            text: "Erro de compilação em todas as chamadas antigas de copiarDe",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "RAII no buffer",
            blocks: [
                {
                    type: "text",
                    value: '# O destrutor que desaparece\n\nA primeira camada da modernização ataca a raiz de todos os crimes: o armazenamento cru. A jogada não é escrever o delete[] que falta; é fazer o recurso morar num MEMBRO RAII, e deixar a regra do zero trabalhar.\n\nCom std::vector<char> como armazenamento, a transformação é brutal: o destrutor some (o vector libera), a cópia vira PROFUNDA de graça (copiar o Buffer copia o bloco), o move vem junto e noexcept, e o invariante ponteiro-tamanho deixa de existir como problema, porque o vector carrega os dois amarrados. A classe encolhe e cada linha removida era uma linha que podia ter bug.\n\nA alternativa quando redimensionamento não faz parte do contrato: std::unique_ptr<char[]> mais um std::size_t. Ganha-se um objeto menor (o vector guarda três ponteiros; o unique_ptr, um) e a garantia estrutural de que ninguém "cresce" o buffer por acidente. Paga-se com trabalho: a cópia some (unique_ptr não copia; o compilador suprime a cópia da classe) e, se cópia fizer sentido, você a escreve profunda, à mão, como na aula seguinte.',
                },
                {
                    type: "code",
                    value: "#include <cstddef>\n#include <memory>\n#include <vector>\n\n// Opcao A: vector como armazenamento. REGRA DO ZERO completa.\nclass Buffer {\npublic:\n    explicit Buffer(std::size_t n) : dados_(n) {}   // zera os bytes\n\n    std::size_t tamanho() const { return dados_.size(); }\n\nprivate:\n    std::vector<char> dados_;\n    // sem destrutor, sem copia manual, sem move manual: TUDO gerado certo\n};\n\n// Opcao B: tamanho fixo apos a criacao, objeto mais enxuto.\nclass BufferFixo {\npublic:\n    explicit BufferFixo(std::size_t n)\n        : dados_(std::make_unique<char[]>(n)), tam_(n) {}\n\n    std::size_t tamanho() const { return tam_; }\n\nprivate:\n    std::unique_ptr<char[]> dados_;   // copia da classe: SUPRIMIDA\n    std::size_t tam_ = 0;\n};",
                },
                {
                    type: "table",
                    value: '[["Aspecto","vector<char>","unique_ptr<char[]> + tamanho"],["Destrutor","Gerado, correto","Gerado, correto"],["Cópia","Profunda, de graça","Suprimida; escreva ou proíba"],["Move","De graça, noexcept","Gerado pro ponteiro; ajuste o tamanho"],["Redimensionar","resize e push_back existem","Não existe; é contrato fixo"],["Tamanho do objeto","Três ponteiros","Um ponteiro e um size_t"]]',
                },
                {
                    type: "quote",
                    value: "A melhor linha do refactor é a que se apaga: cada função especial que o compilador passa a gerar é uma função que ninguém mais mantém errada.",
                },
                {
                    type: "text",
                    value: '## Escolhendo entre A e B com critério\n\nQual opção o projeto segue? Depende do CONTRATO que o Buffer promete, e é uma decisão de design honesta nas duas direções. Se o buffer é um bloco de trabalho que cresce, encolhe e serve de área de montagem, o vector é imbatível: toda a mecânica pronta, testada e com os nomes que o ecossistema conhece. Se o buffer representa um recurso de tamanho FIXO por construção (um frame de imagem, um pacote de tamanho negociado), a versão com unique_ptr documenta essa rigidez no próprio tipo: não existe resize pra alguém chamar por engano.\n\nRepare no padrão de raciocínio, porque ele é o produto real da trilha: a escolha de armazenamento saiu de "tanto faz" pra uma frase com critério (contrato de tamanho, custo do objeto, quem precisa copiar). É exatamente a frase que a descrição do seu PR de modernização deve conter.\n\nPro projeto, seguimos com a opção B, unique_ptr mais tamanho: ela deixa cópia e move EXPLÍCITOS, que é o que a próxima aula precisa ensinar. Num sistema real, a opção A seria a recomendação default, e você já sabe defender as duas.',
                },
            ],
            questions: [
                {
                    statement: "Por que o destrutor manual desaparece na versão com vector?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O destrutor gerado destrói o membro, que libera o bloco",
                            isCorrect: true,
                        },
                        {
                            text: "O vector adia a liberação pro final do programa",
                            isCorrect: false,
                        },
                        {
                            text: "A linguagem dispensa destrutores em classes pequenas",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador insere o delete[] que faltava no código",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que acontece com a CÓPIA da classe na versão com vector?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Vira cópia profunda correta, gerada de graça",
                            isCorrect: true,
                        },
                        {
                            text: "Continua rasa, até alguém escrever a versão certa",
                            isCorrect: false,
                        },
                        {
                            text: "É suprimida: vector não permite cópia de classes",
                            isCorrect: false,
                        },
                        {
                            text: "Passa a lançar exceção quando o buffer está vazio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na versão com unique_ptr<char[]>, o que acontece com a cópia da classe?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É suprimida: unique_ptr não copia; escreva-a ou proíba-a",
                            isCorrect: true,
                        },
                        {
                            text: "É gerada rasa, copiando apenas o ponteiro como no legado",
                            isCorrect: false,
                        },
                        {
                            text: "É gerada profunda, duplicando o bloco de char por inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Vira um move automático em todas as atribuições da classe",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando a versão com unique_ptr<char[]> é preferível ao vector?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quando o tamanho é fixo por contrato e resize seria um erro",
                            isCorrect: true,
                        },
                        {
                            text: "Quando o buffer precisa crescer com frequência durante o uso",
                            isCorrect: false,
                        },
                        {
                            text: "Quando os dados precisam ficar em memória não contígua",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a classe precisa ser copiada em todos os retornos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o ganho estrutural de trocar o char* cru por um membro RAII?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A classe volta à regra do zero: o compilador gera tudo certo",
                            isCorrect: true,
                        },
                        {
                            text: "O acesso aos bytes fica mais rápido pela indireção nova",
                            isCorrect: false,
                        },
                        {
                            text: "O buffer passa a caber no cache L1 do processador",
                            isCorrect: false,
                        },
                        {
                            text: "A classe deixa de precisar de construtor com parâmetro",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Move no buffer",
            blocks: [
                {
                    type: "text",
                    value: '# Move explícito, cópia consciente\n\nCom unique_ptr como armazenamento, o move da classe quase se escreve sozinho: Buffer(Buffer&&) noexcept = default funciona, porque o unique_ptr sabe se mover (o ponteiro troca de dono e a fonte fica nula). O =default é a forma preferida: menos código seu, semântica padrão, e o noexcept explícito documenta e trava o contrato que o vector exige.\n\nMas há um detalhe de gente grande no =default: ele move CADA membro, e mover um std::size_t é... copiá-lo. Depois do move, a fonte fica com dados_ nulo e tam_ INTACTO: um estado que viola o invariante informal "tam_ descreve dados_". Como o objeto movido é válido-mas-não-especificado, isso é aceitável pelo contrato da linguagem; mas se o SEU invariante exige coerência (por exemplo, tamanho() é chamável em qualquer estado), escreva o move à mão zerando tam_ da fonte, como no exemplo. É uma decisão de contrato, e agora você tem o vocabulário pra tomá-la conscientemente.\n\nA cópia, suprimida pelo unique_ptr, volta à mão e PROFUNDA: aloca bloco novo e copia os bytes. Custo explícito, visível na assinatura, exatamente onde um leitor de review vai procurar.',
                },
                {
                    type: "code",
                    value: "#include <algorithm>\n#include <cstddef>\n#include <memory>\n\nclass Buffer {\npublic:\n    explicit Buffer(std::size_t n)\n        : dados_(std::make_unique<char[]>(n)), tam_(n) {}\n\n    // MOVE manual: rouba e mantem o invariante da fonte coerente\n    Buffer(Buffer&& outro) noexcept\n        : dados_(std::move(outro.dados_)), tam_(outro.tam_) {\n        outro.tam_ = 0;                  // fonte: nulo e tamanho zero\n    }\n    Buffer& operator=(Buffer&& outro) noexcept {\n        dados_ = std::move(outro.dados_);   // libera o atual e rouba\n        tam_ = outro.tam_;\n        outro.tam_ = 0;\n        return *this;\n    }\n\n    // COPIA profunda explicita: o custo aparece na assinatura\n    Buffer(const Buffer& b)\n        : dados_(std::make_unique<char[]>(b.tam_)), tam_(b.tam_) {\n        std::copy_n(b.dados_.get(), b.tam_, dados_.get());\n    }\n    Buffer& operator=(const Buffer& b) {\n        Buffer copia(b);                 // idioma copy-and-swap simplificado\n        std::swap(dados_, copia.dados_);\n        std::swap(tam_, copia.tam_);\n        return *this;\n    }\n\n    std::size_t tamanho() const noexcept { return tam_; }\n\nprivate:\n    std::unique_ptr<char[]> dados_;\n    std::size_t tam_ = 0;\n};",
                },
                {
                    type: "table",
                    value: '[["Cenário em vector<Buffer>","Sem move (só cópia)","Com move noexcept"],["push_back de temporário","Aloca e copia o bloco inteiro","Troca de ponteiros, O(1)"],["Realocação no crescimento","Recopia todos os blocos","Move barato, elemento a elemento"],["100 buffers de 1 MB crescendo","Centenas de MB copiados","Alguns ponteiros trocados"],["Move sem noexcept","Não se aplica","vector volta a COPIAR na realocação"]]',
                },
                {
                    type: "quote",
                    value: "A diferença entre um vector<Buffer> que voa e um que rasteja é uma palavra na assinatura do move. O compilador não avisa qual dos dois você escreveu; o profiler avisa.",
                },
                {
                    type: "text",
                    value: "## Medindo a diferença, nem que seja de cabeça\n\nVocê não precisa de benchmark pra RACIOCINAR sobre o ganho; precisa das contas de padeiro que os módulos anteriores deram. Um vector<Buffer> com reserve adequado e push_back de temporários: com move noexcept, cada inserção é uma troca de ponteiros, custo constante e minúsculo. Sem move (ou com move sem noexcept, que pro vector é a mesma coisa na realocação), cada crescimento do vector recopia TODOS os blocos já inseridos: com 100 buffers de 1 MB, uma única realocação move centenas de megabytes pela memória.\n\nO experimento conceitual que vale fazer no seu ambiente: preencha um vector<Buffer> com e sem o noexcept no move, meça com o profiler ou até com um relógio, e confira a previsão. Mais importante que o número é o hábito: a static_assert(std::is_nothrow_move_constructible_v<Buffer>) entra no header do projeto pra ninguém regredir esse contrato sem quebrar o build.\n\nEstado da modernização após esta aula: destrutor correto, cópia profunda explícita, move noexcept coerente. O que falta é a CASCA: a API que o mundo externo usa, com const, views e erros tipados. É a última camada, na próxima aula.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que Buffer(Buffer&&) noexcept = default funciona com unique_ptr?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O unique_ptr sabe se mover: troca o dono e anula a fonte",
                            isCorrect: true,
                        },
                        {
                            text: "O =default converte o move em cópia profunda segura",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador substitui o unique_ptr por ponteiro cru",
                            isCorrect: false,
                        },
                        {
                            text: "O noexcept impede a fonte de ser usada depois do move",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Na classe modernizada, por que a cópia precisa ser escrita à mão?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O membro unique_ptr suprime a cópia gerada da classe",
                            isCorrect: true,
                        },
                        {
                            text: "Classes com move manual perdem a cópia por regra",
                            isCorrect: false,
                        },
                        {
                            text: "A cópia gerada seria profunda demais pro caso de uso",
                            isCorrect: false,
                        },
                        {
                            text: "O noexcept do move invalida o construtor de cópia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual sutileza o move =default deixaria na FONTE após o move?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "dados_ nulo com tam_ intacto: invariante incoerente",
                            isCorrect: true,
                        },
                        {
                            text: "dados_ e tam_ zerados, como o invariante pede",
                            isCorrect: false,
                        },
                        {
                            text: "O bloco copiado de volta pra fonte por segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Um estado inválido que impede até o destrutor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num vector<Buffer> que cresce, qual é o efeito prático do move noexcept?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Realocações trocam ponteiros em vez de recopiar os blocos",
                            isCorrect: true,
                        },
                        {
                            text: "O vector deixa de precisar de qualquer realocação ao crescer",
                            isCorrect: false,
                        },
                        {
                            text: "As inserções passam a rodar numa thread separada do pool",
                            isCorrect: false,
                        },
                        {
                            text: "Os buffers passam a ser armazenados fora do heap comum",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como travar no BUILD o contrato de move noexcept da classe Buffer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "static_assert com is_nothrow_move_constructible no header",
                            isCorrect: true,
                        },
                        {
                            text: "Um teste unitário que move o Buffer e mede o tempo gasto",
                            isCorrect: false,
                        },
                        {
                            text: "Um comentário de aviso ao lado do construtor de move",
                            isCorrect: false,
                        },
                        {
                            text: "Compilar o projeto duas vezes e comparar os binários",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "API final",
            blocks: [
                {
                    type: "text",
                    value: "# A casca que documenta o contrato\n\nMiolo pronto, falta a API, e aqui entram as decisões de fronteira dos módulos 5 e 6. Primeiro, CONST-CORRECTNESS completa: tamanho() e a leitura são const (e noexcept, já que não alocam nem falham); a escrita, não. O usuário da classe descobre pelo tipo o que cada método faz com o estado.\n\nSegundo, VIEWS na fronteira: em vez de expor char* cru como o legado fazia, a leitura devolve std::span<const char> (janela não-dona com ponteiro E tamanho amarrados) e a escrita, std::span<char>. Quem consome não tem como errar o tamanho, e a função gravar(std::span<const char>) aceita Buffer, vector, array e o que mais for contíguo, sem cópia. Nomes de arquivo e texto entram como std::string_view pela mesma lógica.\n\nTerceiro, ERROS TIPADOS na criação que pode falhar: a fábrica deArquivo devolve std::expected<Buffer, ErroBuffer>. Arquivo ausente não é excepcional no domínio dela; é resultado nomeado, no retorno, com [[nodiscard]] garantindo que ninguém finge que não viu.",
                },
                {
                    type: "code",
                    value: "#include <cstddef>\n#include <expected>\n#include <memory>\n#include <span>\n#include <string_view>\n\nenum class ErroBuffer { arquivo_ausente, leitura_falhou, vazio };\n\nclass Buffer {\npublic:\n    // Criacao que pode falhar: resultado nomeado, impossivel de ignorar\n    [[nodiscard]] static std::expected<Buffer, ErroBuffer>\n    deArquivo(std::string_view caminho);\n\n    // Leitura: janela const, com tamanho amarrado ao ponteiro\n    std::span<const char> leitura() const noexcept {\n        return { dados_.get(), tam_ };\n    }\n\n    // Escrita: mesma janela, mutavel; a intencao esta no tipo\n    std::span<char> escrita() noexcept { return { dados_.get(), tam_ }; }\n\n    std::size_t tamanho() const noexcept { return tam_; }\n\nprivate:\n    explicit Buffer(std::size_t n);      // construcao interna da fabrica\n    std::unique_ptr<char[]> dados_;\n    std::size_t tam_ = 0;\n};\n\n// Consumidores genericos, sem acoplamento com Buffer:\nvoid gravar(std::span<const char> bytes);   // aceita Buffer, vector, array",
                },
                {
                    type: "table",
                    value: '[["Peça da API","Escolha","O que ela comunica"],["Entrada de caminho e texto","string_view","Só leio; aceito qualquer origem"],["Saída de bytes pra leitura","span<const char>","Janela sem posse, imutável"],["Saída de bytes pra escrita","span<char>","Janela mutável, tamanho junto"],["Criação que pode falhar","expected<Buffer, ErroBuffer>","Sucesso ou motivo tipado"],["Consultas de estado","métodos const noexcept","Sem efeito e sem surpresa"]]',
                },
                {
                    type: "quote",
                    value: "A API boa é a que torna o erro DESAJEITADO de escrever: tamanho amarrado ao ponteiro, const no que lê, motivo tipado no que falha. O resto é o compilador cobrando.",
                },
                {
                    type: "text",
                    value: '## span, a mesma disciplina do string_view\n\nstd::span (C++20) merece o parágrafo próprio porque fecha uma ferida antiga do C: o par (ponteiro, tamanho) viajando SEPARADO pelas assinaturas, com cada função torcendo pra receber os dois coerentes. O span os amarra num objeto só, leve (dois registradores), não-dono, com a variante const documentando imutabilidade. Ele é pro bloco contíguo o que string_view é pro texto, e carrega a MESMA regra de vida: a janela não estende a vida do dono; span guardado além do escopo do Buffer é dangling esperando leitura.\n\nRepare também no desenho da fábrica: o construtor virou privado e a criação pública passa pelo deArquivo, que valida ANTES de construir. Objeto construído é objeto válido; o estado "meio construído, confira depois" morreu com a API velha do legado.\n\nA classe está pronta: RAII no armazenamento, move honesto, cópia consciente, const na leitura, views na fronteira, erro tipado na criação. Do arquivo original, sobrou a intenção. A última aula transforma o percurso inteiro num checklist que cabe no seu próximo review.',
                },
            ],
            questions: [
                {
                    statement: "O que um std::span<const char> devolvido pela leitura carrega?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ponteiro e tamanho juntos, sem posse e sem escrita",
                            isCorrect: true,
                        },
                        {
                            text: "Uma cópia dos bytes, protegida contra alteração",
                            isCorrect: false,
                        },
                        {
                            text: "Um handle que precisa ser liberado pelo chamador",
                            isCorrect: false,
                        },
                        {
                            text: "O bloco inteiro movido pra fora da classe Buffer",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a fábrica deArquivo retorna expected<Buffer, ErroBuffer>?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Arquivo ausente é falha esperada: vira resultado tipado",
                            isCorrect: true,
                        },
                        {
                            text: "Exceções não funcionam dentro de funções estáticas",
                            isCorrect: false,
                        },
                        {
                            text: "O expected torna a criação do objeto mais rápida",
                            isCorrect: false,
                        },
                        {
                            text: "O padrão exige expected em construtores de classe",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual problema clássico do C o span resolve nas assinaturas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ponteiro e tamanho viajando separados e desincronizados",
                            isCorrect: true,
                        },
                        {
                            text: "A impossibilidade de passar arrays pra dentro de funções",
                            isCorrect: false,
                        },
                        {
                            text: "O custo de copiar blocos grandes a cada chamada feita",
                            isCorrect: false,
                        },
                        {
                            text: "A falta de verificação de limites em tempo de execução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que gravar(std::span<const char>) é melhor que gravar(const Buffer&)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Desacopla: aceita Buffer, vector e array contíguos",
                            isCorrect: true,
                        },
                        {
                            text: "O span é validado em runtime e a referência não é",
                            isCorrect: false,
                        },
                        {
                            text: "Referências const não podem apontar pra buffers",
                            isCorrect: false,
                        },
                        {
                            text: "O span copia os dados e protege o Buffer original",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um span devolvido por leitura() é guardado num membro e usado após o Buffer morrer. O que acontece?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Dangling: a janela não estende a vida do dono",
                            isCorrect: true,
                        },
                        {
                            text: "O span detecta a morte do dono e lança exceção",
                            isCorrect: false,
                        },
                        {
                            text: "O span mantém o bloco vivo até ser destruído",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: spans const copiam os dados na criação",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento",
            blocks: [
                {
                    type: "text",
                    value: "# O checklist do C++ moderno pra code review\n\nO percurso do Buffer condensou a trilha inteira: valor e const no módulo 1, RAII e posse no 2, move no 3, os custos da STL no 5, erros tipados no 6, e a fronteira genérica que os templates do módulo 4 sustentam por baixo da biblioteca. O que fica pra rotina é um CHECKLIST: dez perguntas que você passa em qualquer PR de C++, seu ou dos outros, na ordem em que os problemas costumam doer.\n\nUse-o como régua de leitura, não como burocracia. Em um PR pequeno, os dez itens levam cinco minutos; num PR que tropeça em três deles, você acabou de economizar um incidente de produção. E repare que TODOS os itens são verificáveis olhando assinatura e estrutura, sem rodar nada: é revisão de contrato, a mais barata que existe.\n\nA tabela abaixo é o artefato final da trilha. Copie pro seu template de review, ajuste o vocabulário ao seu time, e trate cada exceção a um item como algo que merece uma frase de justificativa na descrição do PR.",
                },
                {
                    type: "table",
                    value: '[["Item do checklist","O que checar no review"],["1. Posse clara","A assinatura diz quem é dono; nenhum new/delete nu"],["2. Regra do zero","Membros RAII antes de qualquer função especial manual"],["3. const por padrão","Métodos e parâmetros de leitura marcados"],["4. Passagem certa","const T& pra caro; valor pra barato ou posse"],["5. Move honesto","Move noexcept onde há recurso; sem std::move em return"],["6. Retorno por valor","Sem parâmetro de saída; a elisão trabalha"],["7. vector primeiro","Outro container só com o padrão de acesso nomeado"],["8. Erros tipados","optional, expected ou enum [[nodiscard]]; nada mudo"],["9. Views com dono vivo","string_view e span jamais sobrevivem à origem"],["10. UB sob vigilância","asserts nas pré-condições; sanitizers verdes no CI"]]',
                },
                {
                    type: "code",
                    value: "// O antes e o depois, lado a lado, como resumo executivo:\n\n// LEGADO                          // MODERNO\n// char* dados; size_t tam;        std::unique_ptr<char[]> + tamanho\n// ~Buffer() {}                    destrutor gerado (regra do zero no membro)\n// copiarDe: ponteiro copiado      copia profunda explicita\n// (sem move)                      move noexcept, travado por static_assert\n// char* pegar()                   span<const char> leitura() const noexcept\n// bool carregar(...)              [[nodiscard]] expected<Buffer, ErroBuffer>",
                },
                {
                    type: "quote",
                    value: "Checklist não substitui pensamento: comprime experiência. Os dez itens cabem num cartão; o critério pra aplicá-los, exceção por exceção, é o que esta trilha treinou.",
                },
                {
                    type: "text",
                    value: "## Pra onde apontar esse critério agora\n\nO jeito mais rápido de consolidar o que você construiu aqui é revisar código VELHO seu com o checklist na mão. Escolha uma classe que você escreveu antes da trilha e faça nela o que fizemos com o Buffer: liste os crimes, ataque em camadas, escreva o motivo de cada escolha. A segunda leitura recomendada é a biblioteca padrão em si: repare como as assinaturas de vector, string_view e expected praticam exatamente os contratos que você aprendeu a exigir.\n\nSobre o futuro da linguagem, mantenha a postura que a trilha inteira praticou: em 2026, C++20 é a base comum, C++23 já entrega expected e println nos três grandes compiladores, e o C++26 vem com contratos e reflexão no horizonte. Ferramentas novas vão continuar chegando; os PILARES que você levou daqui (semântica de valor, posse explícita, RAII, custo consciente, erro tipado) são estáveis há uma década e seguem sendo o que separa código que sobrevive de código que assombra.\n\nO resto é prática deliberada: um review por dia com a régua desta trilha vale mais que qualquer resumo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a característica comum aos dez itens do checklist final?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "São verificáveis lendo assinaturas e estrutura do código",
                            isCorrect: true,
                        },
                        {
                            text: "Exigem rodar benchmarks antes de aprovar qualquer PR",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicam-se somente a código novo, nunca a refactors",
                            isCorrect: false,
                        },
                        {
                            text: "Dependem de ferramentas pagas de análise estática",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pelo item 'posse clara', o que um new solto no meio de uma função indica?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um ponto de review reprovado: posse fora de RAII",
                            isCorrect: true,
                        },
                        {
                            text: "Uma otimização válida pra objetos muito grandes",
                            isCorrect: false,
                        },
                        {
                            text: "Um requisito das APIs de C usadas pelo projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Um estilo aceitável se houver delete no mesmo arquivo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um PR troca vector por outro container sem dizer o motivo. Qual item do checklist cobra o quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O item 7: nomear o padrão de acesso que justifica a troca",
                            isCorrect: true,
                        },
                        {
                            text: "O item 2: reescrever as funções especiais da classe",
                            isCorrect: false,
                        },
                        {
                            text: "O item 9: provar que o container não realoca nunca",
                            isCorrect: false,
                        },
                        {
                            text: "O item 4: converter os parâmetros pra passagem por valor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que 'sanitizers verdes no CI' encerra o checklist, segundo a trilha?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É a definição operacional de 'sem UB conhecido' no projeto",
                            isCorrect: true,
                        },
                        {
                            text: "Sanitizers substituem os testes de unidade do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "É o único item que o compilador não consegue ajudar",
                            isCorrect: false,
                        },
                        {
                            text: "Sanitizers provam matematicamente a ausência de bugs",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual prática a trilha recomenda pra consolidar o critério aprendido?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Revisar código antigo seu aplicando o checklist em camadas",
                            isCorrect: true,
                        },
                        {
                            text: "Decorar a tabela de complexidade de todos os containers",
                            isCorrect: false,
                        },
                        {
                            text: "Migrar todos os projetos imediatamente pro padrão mais novo",
                            isCorrect: false,
                        },
                        {
                            text: "Reescrever as classes legadas sem tocar nas assinaturas",
                            isCorrect: false,
                        },
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
        console.log("Trilha criada: " + trilha.name);
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log(
                "Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.",
            );
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
        "Seed concluido: " +
            MODULOS.length +
            " modulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questoes.",
    );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
