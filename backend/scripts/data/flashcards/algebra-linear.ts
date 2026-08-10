import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Álgebra Linear, terceira trilha do roadmap de Matemática.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta feita;
 * as cartas guardam as definições fechadas, os nomes dos métodos e as
 * condições que a aula enuncia de passagem.
 *
 * As fórmulas vão por extenso, em palavras: a carta é lida no verso curto
 * do baralho, sem a renderização de LaTeX que as aulas usam.
 */
export const algebraLinear: CartasDaTrilha = {
    trilha: "Álgebra Linear",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quantos finais um sistema linear pode ter?",
                        verso: "Três: uma solução, infinitas soluções ou nenhuma.",
                    },
                    {
                        frente: "Que formas uma equação linear proíbe nas incógnitas?",
                        verso: "Potência, raiz e produto entre elas.",
                    },
                    {
                        frente: "O que significa resolver um sistema linear?",
                        verso: "Achar os valores que satisfazem todas as equações ao mesmo tempo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a matriz aumentada carrega além dos coeficientes?",
                        verso: "A coluna dos termos independentes, separada das demais.",
                    },
                    {
                        frente: "Quais são as três operações elementares de linha?",
                        verso: "Trocar duas linhas, multiplicar por escalar não nulo e somar múltiplo.",
                    },
                    {
                        frente: "Que vantagem a matriz aumentada traz ao processo?",
                        verso: "Mexer no sistema sem reescrever as incógnitas a cada passo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que arrumação a eliminação de Gauss produz?",
                        verso: "Zeros abaixo dos pivôs, na forma escalonada.",
                    },
                    {
                        frente: "O que é o pivô de uma linha escalonada?",
                        verso: "O primeiro número não nulo daquela linha.",
                    },
                    {
                        frente: "Que passo resolve o sistema depois de escalonar?",
                        verso: "A substituição de baixo para cima, linha a linha.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que Gauss-Jordan acrescenta à eliminação de Gauss?",
                        verso: "Zeros também acima dos pivôs, entregando a solução pronta.",
                    },
                    {
                        frente: "Que forma a matriz assume ao fim de Gauss-Jordan?",
                        verso: "A escalonada reduzida, com a resposta na última coluna.",
                    },
                    {
                        frente: "Que valor todo pivô tem na forma reduzida?",
                        verso: "Um, com zeros em toda a sua coluna.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que nome o sistema sem solução recebe?",
                        verso: "Sistema impossível.",
                    },
                    {
                        frente: "O que distingue o sistema possível determinado?",
                        verso: "A solução única, com pivô em cada incógnita.",
                    },
                    {
                        frente: "O que produz infinitas soluções num sistema?",
                        verso: "A variável livre, aquela sem pivô na sua coluna.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que condição a soma de matrizes exige?",
                        verso: "Mesma ordem, somando entrada a entrada.",
                    },
                    {
                        frente: "O que a ordem de uma matriz informa?",
                        verso: "Quantas linhas e quantas colunas ela tem, nessa sequência.",
                    },
                    {
                        frente: "O que multiplicar por escalar faz na matriz?",
                        verso: "Multiplica todas as entradas pelo mesmo número.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que encaixe a multiplicação de matrizes exige?",
                        verso: "As colunas da primeira igualando as linhas da segunda.",
                    },
                    {
                        frente: "Que propriedade a multiplicação de matrizes não tem?",
                        verso: "A comutativa: trocar a ordem muda o resultado.",
                    },
                    {
                        frente: "Que operação a multiplicação de matrizes representa?",
                        verso: "O encadeamento de transformações, uma após a outra.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a transposta faz com a matriz?",
                        verso: "Troca linhas por colunas.",
                    },
                    {
                        frente: "O que caracteriza uma matriz simétrica?",
                        verso: "Ser igual à própria transposta.",
                    },
                    {
                        frente: "Que papel a identidade cumpre no produto?",
                        verso: "O de elemento neutro, deixando a outra matriz intacta.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que operação a inversa torna possível?",
                        verso: "A divisão no mundo das matrizes, desfazendo a original.",
                    },
                    {
                        frente: "Que produto define a inversa de uma matriz?",
                        verso: "O que devolve a identidade nas duas ordens.",
                    },
                    {
                        frente: "Que formato toda matriz invertível tem?",
                        verso: "Quadrada, com o mesmo número de linhas e colunas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que matriz acompanha a original no escalonamento?",
                        verso: "A identidade, ao lado, recebendo as mesmas operações.",
                    },
                    {
                        frente: "Que sinal indica que a inversa não existe?",
                        verso: "Uma linha inteira de zeros aparecendo no escalonamento.",
                    },
                    {
                        frente: "O que sobra no lugar da identidade ao final?",
                        verso: "A inversa, quando o lado esquerdo vira identidade.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que informação um único determinante já revela?",
                        verso: "Se a matriz pode ou não ser invertida.",
                    },
                    {
                        frente: "Que regra prática resolve o determinante de ordem três?",
                        verso: "A de Sarrus, repetindo as duas primeiras colunas ao lado.",
                    },
                    {
                        frente: "Que matrizes têm determinante?",
                        verso: "Só as quadradas, com linhas e colunas em igual número.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que fila escolher antes de expandir por Laplace?",
                        verso: "A com mais zeros, que economiza boa parte da conta.",
                    },
                    {
                        frente: "O que o cofator acrescenta ao menor complementar?",
                        verso: "O sinal, alternado conforme a posição na matriz.",
                    },
                    {
                        frente: "O que é o menor complementar de uma entrada?",
                        verso: "O determinante que sobra ao apagar a linha e a coluna dela.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que acontece ao trocar duas linhas da matriz?",
                        verso: "O determinante troca de sinal.",
                    },
                    {
                        frente: "Que determinante uma linha de zeros garante?",
                        verso: "Zero, sem precisar de conta.",
                    },
                    {
                        frente: "Que efeito multiplicar uma linha por escalar tem?",
                        verso: "O determinante fica multiplicado por esse mesmo escalar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o determinante zerado faz com a inversa?",
                        verso: "Ela desaparece: a matriz deixa de ser invertível.",
                    },
                    {
                        frente: "Que garantia o determinante não nulo dá ao sistema?",
                        verso: "A de solução única.",
                    },
                    {
                        frente: "Que nome a matriz de determinante zero recebe?",
                        verso: "Matriz singular.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que a regra de Cramer transforma cada incógnita?",
                        verso: "Num quociente de determinantes.",
                    },
                    {
                        frente: "Que condição a regra de Cramer exige do sistema?",
                        verso: "Determinante não nulo e tantas equações quanto incógnitas.",
                    },
                    {
                        frente: "Que troca monta o determinante de cada incógnita?",
                        verso: "A da coluna dela pela coluna dos termos independentes.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que faz de um objeto um vetor?",
                        verso: "Poder ser somado e escalado seguindo as mesmas regras de sempre.",
                    },
                    {
                        frente: "O que a letra n indica no espaço de vetores?",
                        verso: "A quantidade de coordenadas de cada vetor.",
                    },
                    {
                        frente: "Como se somam dois vetores?",
                        verso: "Coordenada a coordenada, na mesma posição.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma combinação linear monta?",
                        verso: "A soma dos vetores multiplicados por escalares quaisquer.",
                    },
                    {
                        frente: "O que o espaço gerado reúne?",
                        verso: "Todos os vetores possíveis de montar combinando aqueles.",
                    },
                    {
                        frente: "Que metáfora a aula usa para o espaço gerado?",
                        verso: "Ingredientes e todos os pratos que dá para preparar com eles.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a independência linear significa, em resumo?",
                        verso: "Ausência de redundância entre os vetores do conjunto.",
                    },
                    {
                        frente: "Que combinação denuncia dependência linear?",
                        verso: "Uma que dá o vetor nulo sem todos os escalares zerados.",
                    },
                    {
                        frente: "O que um vetor dependente acrescenta ao conjunto?",
                        verso: "Nada: os outros juntos já alcançam a direção dele.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que ponto todo subespaço precisa conter?",
                        verso: "A origem, sem exceção.",
                    },
                    {
                        frente: "Que duas operações um subespaço precisa suportar?",
                        verso: "A soma de vetores e a multiplicação por escalar.",
                    },
                    {
                        frente: "Que diferença separa subespaço de subconjunto qualquer?",
                        verso: "O subespaço herda a estrutura; o outro apenas mora dentro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que uma base precisa reunir?",
                        verso: "Independência linear e capacidade de gerar todo o espaço.",
                    },
                    {
                        frente: "O que a dimensão conta num espaço?",
                        verso: "Os graus de liberdade, o número de vetores da base.",
                    },
                    {
                        frente: "Que liberdade a escolha da base admite?",
                        verso: "Bases diferentes, sempre com a mesma quantidade de vetores.",
                    },
                ],
            },
        },
    },
};
