import type { CartasDaTrilha } from "../../seed-flashcards.ts";

export const javascript: CartasDaTrilha = {
    trilha: "JavaScript",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Na analogia do corpo, o que o CSS representa numa página?",
                        verso: "A roupa e a maquiagem: ele cuida da aparência.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a vantagem do script externo sobre o script interno?",
                        verso: "O mesmo arquivo .js serve a várias páginas, sem copiar código.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Para que serve o console.error em vez do console.log?",
                        verso: "Destaca a mensagem como erro, em vermelho no console.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que erro aparece ao escrever Console.log com C maiúsculo?",
                        verso: "ReferenceError: Console is not defined.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre reatribuir e redeclarar uma variável?",
                        verso: "Reatribuir troca o valor; redeclarar cria de novo com o mesmo nome.",
                    },
                    {
                        frente: "O let pode ser redeclarado?",
                        verso: "Não. Ele aceita valor novo, mas não ser criado duas vezes.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre null e undefined?",
                        verso: "undefined nunca recebeu valor; null é o nada colocado de propósito.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a template literal faz com uma quebra de linha no meio?",
                        verso: "Mantém a quebra no texto, sem precisar de caractere especial.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que .length não leva parênteses?",
                        verso: "Porque é uma propriedade, e não um método.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre Number() e parseInt()?",
                        verso: "Number é tudo ou nada; parseInt pega o número do começo e ignora o resto.",
                    },
                ],
            },
        },
        3: {
            2: {
                neutra: [
                    {
                        frente: "O que o atalho *= faz com uma variável?",
                        verso: "Multiplica pelo valor da direita e guarda o resultado nela mesma.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O operador ! muda o valor guardado na variável?",
                        verso: "Não. Ele devolve o inverso, sem alterar o que estava lá.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre conversão explícita e coerção?",
                        verso: "Na explícita você pede a mudança; na coerção o JavaScript faz sozinho.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Onde fica o bloco que depende da condição do if?",
                        verso: "Entre chaves, logo depois dos parênteses da condição.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantos valores falsy existem em JavaScript?",
                        verso: "Seis: false, 0, texto vazio, null, undefined e NaN.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando o ternário é melhor escolha que o if?",
                        verso: "Ao escolher entre dois valores simples e guardar o resultado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quando o switch perde para o else if?",
                        verso: "Em faixas, como nota maior que 7, e em condições compostas.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Em que momento a condição do for é testada?",
                        verso: "Antes de cada volta, inclusive antes da primeira.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantas vezes um do...while roda no mínimo?",
                        verso: "Uma, porque a condição só é testada no fim da volta.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O for...of precisa do length do array?",
                        verso: "Não. Ele entrega o item da vez, sem contador nenhum.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que muda ao corrigir uma lógica que está dentro de uma função?",
                        verso: "Edita-se só o corpo dela, e todas as chamadas já usam a versão nova.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que acontece com o código escrito depois do return?",
                        verso: "Nunca roda: o return encerra a função na hora.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é retorno implícito numa arrow function?",
                        verso: "Sem chaves, o resultado da expressão já é devolvido sem escrever return.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quando a variável local desaparece?",
                        verso: "Quando a função ou o bloco em que ela nasceu termina.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Por que o último item do array é length menos um?",
                        verso: "Porque a contagem dos índices começa em zero.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o push devolve?",
                        verso: "O novo tamanho do array, e não o item que entrou.",
                    },
                    {
                        frente: "Em que ponta unshift e shift mexem?",
                        verso: "No início: unshift adiciona e shift remove o primeiro.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o forEach recebe como argumento?",
                        verso: "Um callback, executado uma vez para cada item da lista.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O map muda o array original?",
                        verso: "Não. Ele devolve um array novo, do mesmo tamanho.",
                    },
                    {
                        frente: "O que o find devolve quando nenhum item passa no teste?",
                        verso: "undefined, porque ele procura um item só.",
                    },
                ],
            },
        },
        8: {
            1: {
                neutra: [
                    {
                        frente: "Quando usar colchetes em vez de ponto para ler uma chave?",
                        verso: "Quando a chave está numa variável ou tem espaço no nome.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre uma função comum e um método?",
                        verso: "O método vive dentro de um objeto e é chamado a partir dele.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que Object.values devolve?",
                        verso: "Um array só com os valores do objeto.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Um JSON pode guardar funções?",
                        verso: "Não. Ele guarda só dados, e método não sobrevive à conversão.",
                    },
                ],
            },
        },
        9: {
            1: {
                neutra: [
                    {
                        frente: "O que é um nó no DOM?",
                        verso: "Cada peça da árvore: um título, uma lista, cada item dela.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o querySelector devolve quando nada casa com o seletor?",
                        verso: "null, e mexer nele depois quebra o programa.",
                    },
                    {
                        frente: "Como se escreve o seletor de classe dentro do querySelector?",
                        verso: "Com ponto antes do nome, igual ao CSS.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que preferir textContent a innerHTML?",
                        verso: "O innerHTML interpreta tags, e conteúdo de fora vira risco de segurança.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual evento avisa que o conteúdo de um campo mudou?",
                        verso: "O input, disparado a cada alteração digitada.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que método cria um elemento novo pelo JavaScript?",
                        verso: "O document.createElement, passando o nome da tag.",
                    },
                ],
            },
        },
    },
};
