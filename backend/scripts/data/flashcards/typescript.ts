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
    },
};
