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
    },
};
