import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de TypeScript, trilha sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * tipagem; as cartas guardam as definições fechadas, o comportamento do
 * compilador e as regras que a aula enuncia de passagem.
 */
export const typescript: CartasDaTrilha = {
    trilha: "TypeScript",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que problema o TypeScript resolve no JavaScript?",
                        verso: "O erro de tipo que só aparecia em execução.",
                    },
                    {
                        frente: "Quando o TypeScript aponta esse erro?",
                        verso: "Na hora de escrever, antes de rodar.",
                    },
                    {
                        frente: "O que o TypeScript acrescenta ao JavaScript?",
                        verso: "Uma camada de tipos, sem mudar o que roda.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que extensão um arquivo TypeScript usa?",
                        verso: "A extensão ts.",
                    },
                    {
                        frente: "O que o compilador produz a partir dele?",
                        verso: "JavaScript comum.",
                    },
                    {
                        frente: "Como o TypeScript costuma ser instalado?",
                        verso: "Como dependência de desenvolvimento do projeto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o arquivo de configuração define?",
                        verso: "As regras do compilador para aquele projeto.",
                    },
                    {
                        frente: "Que opção liga as checagens mais rígidas?",
                        verso: "A de modo estrito.",
                    },
                    {
                        frente: "O que o modo estrito evita?",
                        verso: "Que valores nulos passem sem verificação.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que tipos primitivos o TypeScript traz?",
                        verso: "String, número, booleano, nulo e indefinido.",
                    },
                    {
                        frente: "O que a inferência faz?",
                        verso: "Descobre o tipo a partir do valor atribuído.",
                    },
                    {
                        frente: "Quando declarar o tipo à mão vale a pena?",
                        verso: "Quando a inferência não alcança o que se quer expressar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que acontece com os tipos ao compilar?",
                        verso: "São apagados: não existem em execução.",
                    },
                    {
                        frente: "O que o tipo é, então?",
                        verso: "Promessa de quem escreve, não garantia de quem executa.",
                    },
                    {
                        frente: "O que dado vindo de fora exige?",
                        verso: "Validação em tempo de execução.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que uma tupla fixa?",
                        verso: "A quantidade e o tipo de cada posição.",
                    },
                    {
                        frente: "O que um array declara?",
                        verso: "Uma lista de itens do mesmo tipo.",
                    },
                    {
                        frente: "O que o tipo de objeto descreve?",
                        verso: "As propriedades esperadas e seus tipos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um tipo de união permite?",
                        verso: "Que o valor seja de um entre vários tipos.",
                    },
                    {
                        frente: "O que o estreitamento faz?",
                        verso: "Reduz a união ao tipo certo, dentro de um bloco.",
                    },
                    {
                        frente: "Que verificações estreitam um tipo?",
                        verso: "As de typeof, comparação e checagem de propriedade.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um tipo literal aceita?",
                        verso: "Só aquele valor exato.",
                    },
                    {
                        frente: "O que a asserção de constante faz num objeto?",
                        verso: "Deixa tudo somente leitura e com tipos literais.",
                    },
                    {
                        frente: "O que um enum agrupa?",
                        verso: "Um conjunto nomeado de valores relacionados.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que um parâmetro opcional exige na ordem?",
                        verso: "Vir depois dos obrigatórios.",
                    },
                    {
                        frente: "O que o tipo de retorno documenta?",
                        verso: "O que a função promete devolver.",
                    },
                    {
                        frente: "Quando o retorno pode ser inferido?",
                        verso: "Quase sempre, a partir do corpo da função.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o any desliga?",
                        verso: "A checagem de tipo naquele valor.",
                    },
                    {
                        frente: "Como o unknown se diferencia do any?",
                        verso: "Aceita qualquer entrada, mas exige verificação antes do uso.",
                    },
                    {
                        frente: "O que o never representa?",
                        verso: "O valor que nunca acontece.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que uma interface descreve?",
                        verso: "O formato de um objeto.",
                    },
                    {
                        frente: "Que vantagem a interface tem sobre o alias?",
                        verso: "Pode ser reaberta e estendida por declaração.",
                    },
                    {
                        frente: "O que o alias consegue nomear além de objetos?",
                        verso: "Uniões, tuplas e tipos primitivos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a marca de opcional permite?",
                        verso: "Que a propriedade não exista no objeto.",
                    },
                    {
                        frente: "O que a marca de somente leitura impede?",
                        verso: "Que a propriedade seja reatribuída depois.",
                    },
                    {
                        frente: "O que uma assinatura de índice descreve?",
                        verso: "Chaves que não se conhecem de antemão.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que uma interseção faz com dois tipos?",
                        verso: "Exige tudo dos dois ao mesmo tempo.",
                    },
                    {
                        frente: "O que a composição prefere à herança profunda?",
                        verso: "Juntar peças pequenas de tipo.",
                    },
                    {
                        frente: "Que problema uma interseção contraditória cria?",
                        verso: "Um tipo impossível de satisfazer.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para que um generic serve?",
                        verso: "Para ligar a entrada à saída de uma função.",
                    },
                    {
                        frente: "Que sinal indica um generic desnecessário?",
                        verso: "O parâmetro de tipo aparecer uma vez só na assinatura.",
                    },
                    {
                        frente: "O que o generic evita repetir?",
                        verso: "A mesma função escrita de novo para cada tipo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que uma restrição limita?",
                        verso: "Que tipos podem entrar naquele parâmetro.",
                    },
                    {
                        frente: "Que palavra introduz a restrição?",
                        verso: "A de extensão do tipo.",
                    },
                    {
                        frente: "Que ganho a restrição traz dentro da função?",
                        verso: "Permite usar as propriedades garantidas pelo limite.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que os tipos utilitários fazem?",
                        verso: "Derivam um tipo novo a partir de outro.",
                    },
                    {
                        frente: "O que o utilitário de parcial faz?",
                        verso: "Torna todas as propriedades opcionais.",
                    },
                    {
                        frente: "O que o utilitário de escolha faz?",
                        verso: "Seleciona apenas as propriedades indicadas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que forma um tipo condicional tem?",
                        verso: "Se um tipo estende outro, então um; senão, outro.",
                    },
                    {
                        frente: "O que ele permite decidir?",
                        verso: "O tipo resultante, a partir do tipo de entrada.",
                    },
                    {
                        frente: "Onde os condicionais costumam aparecer?",
                        verso: "Dentro de utilitários e de bibliotecas.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um tipo mapeado percorre?",
                        verso: "As chaves de outro tipo.",
                    },
                    {
                        frente: "O que ele produz?",
                        verso: "Um tipo novo, com cada chave transformada.",
                    },
                    {
                        frente: "Que utilitários nascem dessa ideia?",
                        verso: "Os de parcial, obrigatório e somente leitura.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que um tipo de literal de template monta?",
                        verso: "Uma string tipada, a partir de pedaços.",
                    },
                    {
                        frente: "Que combinação ele costuma usar?",
                        verso: "Uniões, que se multiplicam em todas as formas possíveis.",
                    },
                    {
                        frente: "Para que ele é útil na prática?",
                        verso: "Nomes de evento e chaves derivadas de outras.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Para quem o tipo existe?",
                        verso: "Para ajudar quem escreve o código.",
                    },
                    {
                        frente: "Que sinal indica que a tipagem passou do ponto?",
                        verso: "O tipo virar o problema em vez da solução.",
                    },
                    {
                        frente: "Qual é a resposta certa nesse caso?",
                        verso: "Simplificar.",
                    },
                ],
            },
        },
    },
};
