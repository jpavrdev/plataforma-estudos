import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Cálculo 3, sexta trilha do roadmap de Matemática.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta feita;
 * as cartas guardam as definições fechadas, os critérios de escolha de
 * coordenadas e as condições que a aula enuncia de passagem.
 *
 * As fórmulas vão por extenso, em palavras: a carta é lida no verso curto
 * do baralho, sem a renderização de LaTeX que as aulas usam.
 */
export const calculo3: CartasDaTrilha = {
    trilha: "Cálculo 3",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que uma função de várias variáveis recebe e devolve?",
                        verso: "Recebe um ponto do espaço e devolve um número.",
                    },
                    {
                        frente: "O que muda em relação ao cálculo de uma variável?",
                        verso: "Só a quantidade de entradas; a intuição continua valendo.",
                    },
                    {
                        frente: "Que representação gráfica uma função de duas variáveis tem?",
                        verso: "Uma superfície no espaço.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que pergunta encontrar o domínio faz?",
                        verso: "Onde a fórmula tem o direito de existir.",
                    },
                    {
                        frente: "Que restrições costumam recortar o domínio?",
                        verso: "Raiz de negativo, divisão por zero e logaritmo não positivo.",
                    },
                    {
                        frente: "O que a imagem de uma função de várias variáveis reúne?",
                        verso: "Os valores que ela chega a devolver.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que uma curva de nível transforma?",
                        verso: "Uma superfície tridimensional num mapa plano legível.",
                    },
                    {
                        frente: "O que os pontos de uma mesma curva de nível têm?",
                        verso: "Todos devolvem o mesmo valor para a função.",
                    },
                    {
                        frente: "Que leitura as curvas de nível permitem?",
                        verso: "A do relevo, como no mapa de uma montanha.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quantos caminhos levam a um ponto do plano?",
                        verso: "Infinitos, contra apenas dois na reta.",
                    },
                    {
                        frente: "Que conclusão dois caminhos com limites diferentes dão?",
                        verso: "Que o limite não existe naquele ponto.",
                    },
                    {
                        frente: "O que testar caminhos jamais prova?",
                        verso: "Que o limite existe: serve só para negar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que ponte a continuidade estabelece?",
                        verso: "Entre o valor no ponto e os valores ao redor dele.",
                    },
                    {
                        frente: "O que aparece onde essa ponte se rompe?",
                        verso: "Uma descontinuidade.",
                    },
                    {
                        frente: "Que condição a continuidade num ponto exige?",
                        verso: "O limite existir e coincidir com o valor da função.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que foco derivar parcialmente exige?",
                        verso: "Olhar uma variável por vez, fingindo o resto parado.",
                    },
                    {
                        frente: "Como as demais variáveis são tratadas na parcial?",
                        verso: "Como constantes.",
                    },
                    {
                        frente: "Quantas parciais uma função de duas variáveis tem?",
                        verso: "Duas, uma para cada variável.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantas inclinações uma superfície tem num ponto?",
                        verso: "Uma para cada direção, e não uma única.",
                    },
                    {
                        frente: "Que direções as derivadas parciais privilegiam?",
                        verso: "As paralelas aos eixos.",
                    },
                    {
                        frente: "O que a parcial mede geometricamente?",
                        verso: "A subida da superfície naquela direção.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a simetria das parciais mistas garante?",
                        verso: "A ordem de derivar duas vezes não altera o resultado.",
                    },
                    {
                        frente: "Em que funções essa simetria vale?",
                        verso: "Nas bem comportadas, com as parciais contínuas.",
                    },
                    {
                        frente: "Quantas parciais de segunda ordem duas variáveis geram?",
                        verso: "Quatro, sendo duas delas mistas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o plano tangente representa?",
                        verso: "A melhor aproximação plana da superfície ali.",
                    },
                    {
                        frente: "Que impressão a superfície dá bem de perto?",
                        verso: "A de ser reta, e não curva.",
                    },
                    {
                        frente: "O que a existência das parciais não garante?",
                        verso: "A diferenciabilidade da função naquele ponto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que troca o diferencial realiza?",
                        verso: "A variação verdadeira por uma soma linear de variações fáceis.",
                    },
                    {
                        frente: "Que arte a aula atribui ao diferencial?",
                        verso: "A de linearizar o pequeno.",
                    },
                    {
                        frente: "Que derivadas aparecem no diferencial total?",
                        verso: "As parciais, multiplicando a variação de cada variável.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que situação a regra da cadeia acompanha?",
                        verso: "Uma grandeza variando quando tudo de que ela depende muda.",
                    },
                    {
                        frente: "Que soma a regra da cadeia produz?",
                        verso: "Uma parcela por caminho de dependência entre as variáveis.",
                    },
                    {
                        frente: "Que desenho ajuda a montar a regra da cadeia?",
                        verso: "A árvore de dependências entre as variáveis.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quando a derivação implícita mostra seu valor?",
                        verso: "Quando a relação não se deixa escrever com y isolado.",
                    },
                    {
                        frente: "Que razão a derivação implícita usa?",
                        verso: "A das parciais da relação, com o sinal trocado.",
                    },
                    {
                        frente: "Que forma a relação assume na derivação implícita?",
                        verso: "A de uma equação igualada a zero.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que pergunta a derivada direcional responde?",
                        verso: "Como a função muda em qualquer rumo escolhido.",
                    },
                    {
                        frente: "Que exigência o vetor da direção tem?",
                        verso: "Ser unitário, de módulo igual a um.",
                    },
                    {
                        frente: "Que caso particular a derivada direcional recupera?",
                        verso: "As parciais, quando a direção segue um dos eixos.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para onde o gradiente sempre aponta?",
                        verso: "Para onde a subida é mais íngreme.",
                    },
                    {
                        frente: "O que o comprimento do gradiente informa?",
                        verso: "O quanto essa subida é acentuada.",
                    },
                    {
                        frente: "O que compõe o vetor gradiente?",
                        verso: "As derivadas parciais, uma em cada coordenada.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que ângulo o gradiente forma com a curva de nível?",
                        verso: "Reto: ele a cruza perpendicularmente.",
                    },
                    {
                        frente: "Por que o gradiente não corre pela curva de nível?",
                        verso: "Ali a função não muda, e ele mede variação.",
                    },
                    {
                        frente: "Que uso o gradiente tem no plano tangente?",
                        verso: "Serve de vetor normal à superfície de nível.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que encontrar os pontos críticos exige?",
                        verso: "Resolver um sistema com as parciais igualadas a zero.",
                    },
                    {
                        frente: "O que classificar um ponto crítico envolve?",
                        verso: "Entender a geometria em volta daquela solução.",
                    },
                    {
                        frente: "Que tipos um ponto crítico pode ter?",
                        verso: "Máximo local, mínimo local ou ponto de sela.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que atalho o teste da segunda derivada oferece?",
                        verso: "O discriminante, que classifica sem análise direta.",
                    },
                    {
                        frente: "O que fazer quando o discriminante zera?",
                        verso: "Analisar direto, porque o atalho não decide.",
                    },
                    {
                        frente: "Que matriz dá nome a esse teste?",
                        verso: "A Hessiana, com as parciais de segunda ordem.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que dois lugares o extremo se esconde?",
                        verso: "Num ponto crítico do interior ou na fronteira.",
                    },
                    {
                        frente: "Que condição a região precisa cumprir?",
                        verso: "Ser fechada e limitada.",
                    },
                    {
                        frente: "Que trabalho a fronteira acrescenta?",
                        verso: "Estudá-la à parte, muitas vezes parametrizada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que troca Lagrange propõe?",
                        verso: "Trocar o isolamento de variável pelo alinhamento de gradientes.",
                    },
                    {
                        frente: "Que relação os gradientes têm no ponto ótimo?",
                        verso: "São paralelos, um sendo múltiplo do outro.",
                    },
                    {
                        frente: "Que equação entra junto no sistema de Lagrange?",
                        verso: "A própria restrição do problema.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que pergunta abre todo problema de otimização?",
                        verso: "O que exatamente se quer tornar máximo ou mínimo.",
                    },
                    {
                        frente: "Que papel a restrição cumpre no problema?",
                        verso: "Delimita as escolhas possíveis.",
                    },
                    {
                        frente: "Que conferência fecha o problema aplicado?",
                        verso: "Ver se a resposta faz sentido no contexto.",
                    },
                ],
            },
        },
    },
};
