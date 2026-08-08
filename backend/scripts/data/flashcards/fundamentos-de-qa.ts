import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Fundamentos de QA, primeira trilha do roadmap de QA e Testes.
 *
 * Sem trilhos de linguagem: tudo em "neutra".
 *
 * Esta trilha é de vocabulário e princípio, e o quiz dela usa muito caso
 * aplicado. Sobra para as cartas exatamente a definição crua: qual pergunta cada
 * papel faz, o que cada etapa entrega, onde cada termo mora.
 */
export const fundamentosDeQa: CartasDaTrilha = {
    trilha: "Fundamentos de QA",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quais são as duas metades da qualidade?",
                        verso: "Externa, que quem usa percebe, e interna, que quem constrói percebe.",
                    },
                    {
                        frente: "Quem percebe a qualidade interna?",
                        verso: "Quem constrói o produto.",
                    },
                    {
                        frente: "O que acontece quando a qualidade interna está ruim?",
                        verso: "O time entrega devagar e quebra coisas ao mudar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "QA é preventivo ou detectivo?",
                        verso: "Preventivo. Quem é detectivo é o QC.",
                    },
                    {
                        frente: "Que pergunta o QC faz?",
                        verso: "Este produto tem defeitos?",
                    },
                    {
                        frente: "Que pergunta o QA faz?",
                        verso: "Por que os defeitos surgem aqui?",
                    },
                    {
                        frente: "Quando o QA age, na linha do tempo?",
                        verso: "Do início ao fim, o tempo todo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que três tempos o trabalho de QA acontece?",
                        verso: "Antes do código, durante o desenvolvimento e depois de pronto.",
                    },
                    {
                        frente: "Qual é o entregável de QA, se não é a lista de bugs?",
                        verso: "Informação de risco, para o time decidir melhor.",
                    },
                    {
                        frente: "O que acontece com quem só entra no fim?",
                        verso: "Vira funil, e o time trava esperando a aprovação.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quanto custa corrigir um defeito achado no refinamento?",
                        verso: "Uma conversa e um ajuste no texto: a referência de custo.",
                    },
                    {
                        frente: "Shift left é testar mais ou testar antes?",
                        verso: "Testar antes. Não é aumentar o volume.",
                    },
                    {
                        frente: "O que custa corrigir um defeito em produção?",
                        verso: "Investigar, corrigir às pressas, arrumar dados e atender clientes.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Onde mora o erro, na corrente de três elos?",
                        verso: "Na pessoa: é o engano humano.",
                    },
                    {
                        frente: "Uma falha existe sem execução?",
                        verso: "Não. Falha é comportamento observado, e precisa rodar.",
                    },
                    {
                        frente: "O que é um falso positivo em teste?",
                        verso: "Teste que falha sem haver defeito.",
                    },
                    {
                        frente: "O que é um falso negativo em teste?",
                        verso: "Teste que passa mesmo havendo defeito.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que o paradoxo do pesticida diz sobre uma suíte antiga?",
                        verso: "Ela ainda protege contra regressão, mas para de descobrir coisa nova.",
                    },
                    {
                        frente: "O que muda ao aceitar que teste mostra presença, não ausência?",
                        verso: "Falar em risco residual, em vez de dizer que está aprovado.",
                    },
                    {
                        frente: "Que princípio manda investir onde já houve mais problema?",
                        verso: "O agrupamento de defeitos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que entregável a modelagem produz?",
                        verso: "Casos de teste e os dados de teste.",
                    },
                    {
                        frente: "Que pergunta a etapa de conclusão responde?",
                        verso: "Podemos parar? E o que aprendemos?",
                    },
                    {
                        frente: "Parar de testar é decisão de quê?",
                        verso: "De risco aceito, e não de exaustão.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que prioridade de teste um rodapé da página inicial merece?",
                        verso: "Mínima: baixa probabilidade e baixo impacto.",
                    },
                    {
                        frente: "Que frase é o entregável mais valioso de QA?",
                        verso: "Testamos isto nesta profundidade, não testamos aquilo, o risco é este.",
                    },
                    {
                        frente: "Por que o login costuma ter prioridade alta mesmo sem ser complexo?",
                        verso: "O impacto é alto: bloqueia todo mundo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o teste estático examina?",
                        verso: "Requisito, código, protótipo e documento.",
                    },
                    {
                        frente: "Quando o teste estático pode começar?",
                        verso: "Assim que o artefato existe.",
                    },
                    {
                        frente: "Que pergunta resolve metade dos problemas de requisito?",
                        verso: "Como eu vou saber que isso está pronto e certo?",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a referência de comparação da verificação?",
                        verso: "O requisito, o contrato e o desenho.",
                    },
                    {
                        frente: "Quem costuma responder pela validação?",
                        verso: "Quem usa, o negócio e o cliente.",
                    },
                    {
                        frente: "Quando a verificação passa e a validação falha?",
                        verso: "Quando o time constrói perfeitamente a coisa errada.",
                    },
                ],
            },
        },
    },
};
