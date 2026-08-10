import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de C++ Moderno, quarta trilha do roadmap de C++ e Baixo Nível.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a leitura de
 * assinatura e o julgamento de design; as cartas guardam as regras
 * fechadas, os nomes próprios e as armadilhas ditas de passagem.
 */
export const cppModerno: CartasDaTrilha = {
    trilha: "C++ Moderno",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que raciocínio a semântica de valor garante ao leitor?",
                        verso: "O local: ninguém altera o objeto pelas suas costas.",
                    },
                    {
                        frente: "Que tipos tornam a cópia irrelevante em custo?",
                        verso: "Int, double e struct pequeno, resolvidos em registrador.",
                    },
                    {
                        frente: "Que pergunta de review a linguagem responde sempre?",
                        verso: "Se aquela linha copia, com resposta exata de sim ou não.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três qualidades a referência tem sobre o ponteiro?",
                        verso: "Sem cópia, sem sintaxe de ponteiro e nunca nula.",
                    },
                    {
                        frente: "Que critério decide passar por valor em C++ moderno?",
                        verso: "O tipo ser barato de copiar, como int ou string_view.",
                    },
                    {
                        frente: "Que ganho o const traz para a concorrência?",
                        verso: "Objeto só lido pode ser compartilhado sem trava.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o C++ moderno aboliu, e o que ele manteve?",
                        verso: "Aboliu o ponteiro dono; manteve o observador opcional.",
                    },
                    {
                        frente: "Que critério de API a referência e o ponteiro dividem?",
                        verso: "Obrigatório vira referência; opcional vira ponteiro.",
                    },
                    {
                        frente: "Que sinal reprova um trecho em revisão de código?",
                        verso: "Um new solto no meio da função, e pior ainda um delete.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que pergunta separa lvalue de rvalue na prática?",
                        verso: "Se aquilo tem nome e sobrevive depois da linha.",
                    },
                    {
                        frente: "Que categoria um rvalue com nome assume na expressão?",
                        verso: "Lvalue, apesar de o tipo ser referência rvalue.",
                    },
                    {
                        frente: "Que categoria o std::move produz no padrão?",
                        verso: "O xvalue, o valor expirando que pode ser saqueado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que dois qualificadores o auto sozinho descarta?",
                        verso: "A referência e o const da expressão deduzida.",
                    },
                    {
                        frente: "De quem o auto esconde o tipo, e de quem não esconde?",
                        verso: "Do leitor; o compilador continua sabendo exatamente.",
                    },
                    {
                        frente: "Que tipo clássico engana o auto ao ser indexado?",
                        verso: "O vector de bool, que devolve um proxy de bit.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que garantia o C++ dá que o coletor de lixo não dá?",
                        verso: "O momento determinístico da liberação do recurso.",
                    },
                    {
                        frente: "Que mecanismo libera os recursos durante uma exceção?",
                        verso: "O stack unwinding, destruindo os locais já construídos.",
                    },
                    {
                        frente: "Que diferença separa o RAII do try com finally?",
                        verso: "No RAII a limpeza é automática; lá ela é opcional.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que custo o unique_ptr acrescenta ao ponteiro cru?",
                        verso: "Nenhum: mesmo tamanho e mesmo código de máquina.",
                    },
                    {
                        frente: "Que operação o unique_ptr proíbe em compilação?",
                        verso: "A cópia, para garantir um dono único do objeto.",
                    },
                    {
                        frente: "Que tipo uma função que só usa o objeto deve receber?",
                        verso: "Uma referência, e nunca o smart pointer do chamador.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que vantagem o make_shared traz sobre duas alocações?",
                        verso: "Objeto e bloco de controle nascem juntos e vizinhos.",
                    },
                    {
                        frente: "Que problema o ciclo de shared_ptr cria?",
                        verso: "Os contadores nunca zeram e a memória nunca é liberada.",
                    },
                    {
                        frente: "Que regra de direção resolve a relação entre pai e filho?",
                        verso: "Posse desce e observação sobe, com weak para cima.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quantas funções especiais o compilador sabe gerar?",
                        verso: "Seis, do construtor padrão às duas de movimento.",
                    },
                    {
                        frente: "Que efeito declarar o destrutor tem sobre o move?",
                        verso: "Ele suprime a geração automática das duas de move.",
                    },
                    {
                        frente: "Que par de palavras pede e proíbe a versão gerada?",
                        verso: "O default, que pede, e o delete, que fecha a porta.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que informação a assinatura declara sobre o recurso?",
                        verso: "A relação de posse entre quem chama e quem é chamado.",
                    },
                    {
                        frente: "Que pergunta o shared_ptr responde corretamente?",
                        verso: "Vários donos de vidas independentes, o último apaga a luz.",
                    },
                    {
                        frente: "Que desenho padrão o módulo defende para cada recurso?",
                        verso: "Um dono claro, emprestado por referência a quem usa.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que absurdo o C++ antigo aceitava na cópia?",
                        verso: "Copiar de um objeto que morreria na linha seguinte.",
                    },
                    {
                        frente: "Que três coisas mudam de mãos ao mover um vector?",
                        verso: "Os ponteiros de início, de fim e o de capacidade.",
                    },
                    {
                        frente: "Que truques a época usava antes do move existir?",
                        verso: "Destino por referência, swap esperto e contador manual.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que estado o padrão promete ao objeto de origem?",
                        verso: "Válido, porém não especificado após o move.",
                    },
                    {
                        frente: "Que disciplina o objeto movido exige em seguida?",
                        verso: "Ou ele morre, ou recebe valor novo antes de ser lido.",
                    },
                    {
                        frente: "Que garantia mais forte o unique_ptr dá ao ser movido?",
                        verso: "Ele fica nulo, um estado especificado e testável.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que dois cuidados a atribuição de move soma?",
                        verso: "Liberar o recurso atual e proteger contra mover para si.",
                    },
                    {
                        frente: "Que função da biblioteca decide entre mover e copiar?",
                        verso: "O move_if_noexcept, usado quando o vector realoca.",
                    },
                    {
                        frente: "Que teste de compilação flagra o move sem noexcept?",
                        verso: "Um static_assert de construtor de move sem exceção.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que diferença separa a RVO da NRVO?",
                        verso: "A NRVO trata variável local nomeada e não é garantida.",
                    },
                    {
                        frente: "Como ajudar a NRVO a funcionar no retorno?",
                        verso: "Retornar uma local só, do mesmo tipo, sem condicional.",
                    },
                    {
                        frente: "Que reflexo antigo o move e a elisão tornaram obsoleto?",
                        verso: "Devolver por parâmetro de saída para evitar cópia.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que o const impede o move sem dar erro?",
                        verso: "O tipo não casa com o construtor e a cópia assume.",
                    },
                    {
                        frente: "Que efeito o move escrito no return provoca?",
                        verso: "Ele bloqueia a NRVO e piora em vez de otimizar.",
                    },
                    {
                        frente: "Quando o move num return ainda se justifica?",
                        verso: "Ao devolver um membro de um objeto que vai morrer.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que diferença separa o template da função virtual?",
                        verso: "O template resolve em compilação; a virtual, em execução.",
                    },
                    {
                        frente: "Que tipo de requisito o template impõe ao tipo?",
                        verso: "Estrutural: importa o que ele faz, não de quem herda.",
                    },
                    {
                        frente: "Que parte de uma classe template chega a ser gerada?",
                        verso: "Só os métodos realmente usados no código.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que trabalho o linker faz com instâncias duplicadas?",
                        verso: "Descarta as repetidas e mantém uma só no binário.",
                    },
                    {
                        frente: "Que preço o template no header cobra do projeto?",
                        verso: "O de build: cada unidade recompila as mesmas instâncias.",
                    },
                    {
                        frente: "Que recurso do C++20 ataca a raiz do custo de build?",
                        verso: "Os módulos, compilados uma vez e importados prontos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que regra de bolso resume a escolha entre as duas?",
                        verso: "Especializa-se classe e sobrecarrega-se função.",
                    },
                    {
                        frente: "Que comportamento surpreendente a especialização tem?",
                        verso: "O resultado depende da ordem de declaração dos arquivos.",
                    },
                    {
                        frente: "Que disputa o overload entra que a especialização não?",
                        verso: "A resolução de sobrecarga, em que a mais específica vence.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que artesanato os concepts substituíram?",
                        verso: "O enable_if com SFINAE, que funcionava e era ilegível.",
                    },
                    {
                        frente: "Que expressão lista o que precisa compilar no tipo?",
                        verso: "O requires, com as chamadas e retornos exigidos.",
                    },
                    {
                        frente: "Que critério ordena dois templates viáveis com concept?",
                        verso: "Vence o de restrição mais específica entre eles.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quantas linhas úteis um muro de erro costuma ter?",
                        verso: "Umas três, no meio de centenas de eco e ruído.",
                    },
                    {
                        frente: "Que ruído se apara mentalmente na saída do erro?",
                        verso: "Os allocators e parâmetros padrão já expandidos.",
                    },
                    {
                        frente: "Que estratégia resolve quando a leitura direta falha?",
                        verso: "Encolher o caso num arquivo mínimo com tipos concretos.",
                    },
                ],
            },
        },
    },
};
