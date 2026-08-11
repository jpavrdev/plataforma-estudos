import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Machine Learning, sexta trilha do roadmap de Ciência de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento do
 * cenário e a leitura do código; as cartas guardam o vocabulário fechado,
 * os nomes de método e as regras que a aula enuncia de passagem.
 */
export const machineLearning: CartasDaTrilha = {
    trilha: "Machine Learning",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Por que a lista de regras do filtro de spam não se sustenta?",
                        verso: "Quem envia adapta a mensagem e cada truque pede regra nova.",
                    },
                    {
                        frente: "Que exemplo da trilha de estatística já era aprendizado?",
                        verso: "A regressão linear, que achou os coeficientes sozinha.",
                    },
                    {
                        frente: "O que o algoritmo recebe no lugar das regras prontas?",
                        verso: "Milhares de exemplos já classificados por pessoas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que verbo resume cada um dos três tipos de aprendizado?",
                        verso: "Prever no supervisionado, agrupar no não-supervisionado, agir no reforço.",
                    },
                    {
                        frente: "Que peças o aprendizado por reforço coloca em jogo?",
                        verso: "Um agente, um ambiente e recompensas por cada decisão.",
                    },
                    {
                        frente: "Que tipo de problema o scikit-learn não atende?",
                        verso: "O aprendizado por reforço, que tem bibliotecas próprias.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que seis termos formam o vocabulário básico de ML?",
                        verso: "Feature, alvo, amostra, modelo, treino e previsão.",
                    },
                    {
                        frente: "Que estruturas do pandas o X e o y assumem?",
                        verso: "O X vira DataFrame e o y vira Series de um valor por linha.",
                    },
                    {
                        frente: "Que sinônimos o alvo recebe na documentação?",
                        verso: "Target, rótulo e variável dependente do problema.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que cadeia de etapas antecede o modelo no fluxo?",
                        verso: "Buscar com SQL, limpar com pandas, explorar e visualizar.",
                    },
                    {
                        frente: "Que foco separa a estatística do aprendizado de máquina?",
                        verso: "A estatística explica e testa; o modelo quer prever bem.",
                    },
                    {
                        frente: "O que o algoritmo faz com dado mal preparado?",
                        verso: "Aprende o problema junto, sem consertar nada sozinho.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que comparação a aula faz entre algoritmo e dado?",
                        verso: "Algoritmo simples com dado bom vence sofisticado com dado ruim.",
                    },
                    {
                        frente: "Que pergunta precede confiar numa previsão?",
                        verso: "Que dados treinaram isso e quem eles representam de fato.",
                    },
                    {
                        frente: "Por que um modelo não é neutro só por ser matemática?",
                        verso: "Ele reproduz o viés que estava nos dados de treino.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que sete etapas o pipeline de ML percorre?",
                        verso: "Definir, obter, preparar, dividir, treinar, avaliar e usar.",
                    },
                    {
                        frente: "Por que o fluxo é um mapa, e não uma esteira?",
                        verso: "Avaliar costuma mandar você voltar para limpar de novo.",
                    },
                    {
                        frente: "Que etapas do pipeline vêm antes de qualquer algoritmo?",
                        verso: "Obter e preparar os dados, o grosso do trabalho.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que faixa de teste costuma ser reservada na divisão?",
                        verso: "Algo entre vinte e trinta por cento dos dados.",
                    },
                    {
                        frente: "O que o random_state garante entre duas execuções?",
                        verso: "A mesma divisão, para comparar experimentos de forma justa.",
                    },
                    {
                        frente: "Em que momento o conjunto de teste entra em cena?",
                        verso: "Só na avaliação, intocado durante todo o treino.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três métodos todo estimador do scikit-learn expõe?",
                        verso: "O fit que aprende, o predict que aplica e o score que resume.",
                    },
                    {
                        frente: "Que métrica o score devolve em cada tipo de modelo?",
                        verso: "Acurácia na classificação e R quadrado na regressão.",
                    },
                    {
                        frente: "Que vantagem a API igual entre algoritmos traz?",
                        verso: "Trocar de algoritmo sem reescrever o resto do código.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que dataset de exemplo vem junto do scikit-learn?",
                        verso: "O iris, com 150 linhas de medidas de flores.",
                    },
                    {
                        frente: "Que alinhamento X e y precisam manter entre si?",
                        verso: "A linha de X corresponde à mesma posição em y.",
                    },
                    {
                        frente: "Por que a métrica quase perfeita do iris engana?",
                        verso: "Ele é pequeno e bem separável; dado real é mais barulhento.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três conjuntos a divisão completa produz?",
                        verso: "Treino, validação e o teste guardado para o fim.",
                    },
                    {
                        frente: "Quantas vezes cada conjunto é consultado no projeto?",
                        verso: "Treino e validação, várias; o teste, uma só vez.",
                    },
                    {
                        frente: "Que técnica o módulo 5 traz para conjunto pequeno?",
                        verso: "A validação cruzada, que aproveita melhor os dados.",
                    },
                ],
            },
        },
    },
};
