import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Geometria Analítica, quarta trilha do roadmap de Matemática.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta feita;
 * as cartas guardam as definições fechadas, os testes rápidos e as
 * condições que a aula enuncia de passagem.
 *
 * As fórmulas vão por extenso, em palavras: a carta é lida no verso curto
 * do baralho, sem a renderização de LaTeX que as aulas usam.
 */
export const geometriaAnalitica: CartasDaTrilha = {
    trilha: "Geometria Analítica",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que três dados um vetor carrega?",
                        verso: "Módulo, direção e sentido.",
                    },
                    {
                        frente: "O que um vetor ignora por completo?",
                        verso: "Onde foi desenhado: só o deslocamento importa.",
                    },
                    {
                        frente: "Como se obtêm as coordenadas de um vetor?",
                        verso: "Pela diferença entre o ponto final e o inicial.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que somar dois vetores representa?",
                        verso: "Combinar deslocamentos, um depois do outro.",
                    },
                    {
                        frente: "Que regra geométrica soma dois vetores?",
                        verso: "A do paralelogramo, ou a do polígono ligando um ao outro.",
                    },
                    {
                        frente: "Que efeito o escalar negativo produz no vetor?",
                        verso: "Inverte o sentido, além de mudar o tamanho.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o módulo e o versor guardam, cada um?",
                        verso: "O módulo guarda o tamanho e o versor guarda o rumo.",
                    },
                    {
                        frente: "Como se obtém o versor de um vetor?",
                        verso: "Dividindo o vetor pelo próprio módulo.",
                    },
                    {
                        frente: "Que módulo todo versor tem?",
                        verso: "Módulo igual a um.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que forma uma base do plano?",
                        verso: "Um par de direções independentes.",
                    },
                    {
                        frente: "O que dois vetores dependentes têm em comum?",
                        verso: "A mesma direção, um sendo múltiplo do outro.",
                    },
                    {
                        frente: "Que alcance uma base do plano tem?",
                        verso: "Reconstrói o plano inteiro por combinações.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o espaço acrescenta às ideias do plano?",
                        verso: "Apenas mais uma coordenada, sem regras novas.",
                    },
                    {
                        frente: "Quantas coordenadas um vetor no espaço tem?",
                        verso: "Três, uma para cada eixo.",
                    },
                    {
                        frente: "Que operações mudam ao passar do plano ao espaço?",
                        verso: "Nenhuma: soma e escalar seguem coordenada a coordenada.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Em que o produto escalar transforma a geometria?",
                        verso: "Em aritmética: ângulo e comprimento viram contas de coordenadas.",
                    },
                    {
                        frente: "Como o produto escalar é calculado por coordenadas?",
                        verso: "Somando os produtos das coordenadas correspondentes.",
                    },
                    {
                        frente: "Que tipo de resultado o produto escalar devolve?",
                        verso: "Um número, nunca um vetor.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que conta isola o cosseno do ângulo?",
                        verso: "O produto escalar dividido pelo produto dos módulos.",
                    },
                    {
                        frente: "Que ângulo o produto escalar negativo indica?",
                        verso: "Um ângulo obtuso, maior que o reto.",
                    },
                    {
                        frente: "Que ângulo dois vetores de mesmo sentido formam?",
                        verso: "Zero, com o cosseno valendo um.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a projeção de um vetor sobre outro mede?",
                        verso: "Quanto do primeiro segue na direção do segundo.",
                    },
                    {
                        frente: "Que forma a projeção ortogonal devolve?",
                        verso: "Um vetor, na direção daquele sobre o qual se projeta.",
                    },
                    {
                        frente: "Que operação aparece no cálculo da projeção?",
                        verso: "O produto escalar, dividido pelo módulo ao quadrado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que conta testa o perpendicularismo?",
                        verso: "O produto escalar: dá zero quando os vetores são ortogonais.",
                    },
                    {
                        frente: "Que medida o teste de ortogonalidade dispensa?",
                        verso: "A do ângulo, trocada por uma única conta.",
                    },
                    {
                        frente: "Que vetor é ortogonal a todos os outros?",
                        verso: "O vetor nulo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que grandeza física o produto escalar calcula?",
                        verso: "O trabalho de uma força ao longo do deslocamento.",
                    },
                    {
                        frente: "Que decomposição o produto escalar permite?",
                        verso: "A do vetor em parte paralela e parte perpendicular.",
                    },
                    {
                        frente: "Que uso o produto escalar tem junto do versor?",
                        verso: "Extrai a componente do vetor naquela direção.",
                    },
                ],
            },
        },
    },
};
