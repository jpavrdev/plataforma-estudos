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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Quem costuma escrever teste de unidade?",
                        verso: "Quem programa.",
                    },
                    {
                        frente: "Qual nível de teste tem o custo de manutenção mais alto?",
                        verso: "Sistema e aceitação, que também são os mais lentos.",
                    },
                    {
                        frente: "O que o nível de integração testa?",
                        verso: "A conversa entre as partes.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que tipo de caminho tem a maior chance de esconder defeito?",
                        verso: "A borda, seguida do caminho de erro.",
                    },
                    {
                        frente: "Por que o caminho feliz esconde poucos defeitos?",
                        verso: "Foi justamente o cenário que quem programou já testou.",
                    },
                    {
                        frente: "Que cenários são caminho de erro numa compra?",
                        verso: "Cartão recusado, ou estoque acabando no meio da compra.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre teste de carga e de estresse?",
                        verso: "Carga usa a demanda esperada; estresse vai além, até romper.",
                    },
                    {
                        frente: "Que tipo de teste revela travamento com muito registro?",
                        verso: "O teste de volume.",
                    },
                    {
                        frente: "Como transformar rapidez em critério verificável?",
                        verso: "Fixando percentil, tempo e carga: 95% em até 800 ms com 500 usuários.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a abrangência do smoke?",
                        verso: "Larga e rasa, para decidir se vale a pena testar.",
                    },
                    {
                        frente: "Qual é a abrangência da sanidade?",
                        verso: "Estreita e um pouco mais funda, numa área só.",
                    },
                    {
                        frente: "Quando a regressão roda?",
                        verso: "Depois de qualquer mudança, e ela cresce a cada entrega.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que a caixa-branca se baseia para desenhar o teste?",
                        verso: "Caminhos, condições e cobertura do código.",
                    },
                    {
                        frente: "O que a caixa-cinza conhece, que a caixa-preta não?",
                        verso: "Parte da estrutura interna, como o fluxo e os efeitos no banco.",
                    },
                    {
                        frente: "Quem costuma usar a abordagem de caixa-branca?",
                        verso: "Quem programa, no teste de unidade.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a ideia central da partição de equivalência?",
                        verso: "Agrupar valores tratados igual e testar um representante de cada.",
                    },
                    {
                        frente: "Por que testar as classes inválidas uma por vez?",
                        verso: "Com duas juntas, não se sabe qual validação funcionou.",
                    },
                    {
                        frente: "Que classes inválidas um campo de idade costuma ter?",
                        verso: "Negativo, não numérico e vazio.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que a análise de valor limite é tão eficaz?",
                        verso: "A maioria dos defeitos de faixa acontece exatamente nas bordas.",
                    },
                    {
                        frente: "Que valores testar numa senha de 8 a 20 caracteres?",
                        verso: "Sete, oito, vinte e vinte e um.",
                    },
                    {
                        frente: "Que valores testar num limite de frete grátis a partir de 200?",
                        verso: "199,99, 200,00 e 200,01.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando a tabela de decisão é a técnica mais adequada?",
                        verso: "Quando o resultado depende da combinação de várias condições.",
                    },
                    {
                        frente: "Com três condições de sim ou não, quantas combinações surgem?",
                        verso: "Oito, antes de qualquer simplificação.",
                    },
                    {
                        frente: "Qual é o principal ganho da tabela de decisão?",
                        verso: "Revelar as combinações que o requisito não descreveu.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quais são os quatro elementos de um modelo de estados?",
                        verso: "Estados, eventos, transições e ações.",
                    },
                    {
                        frente: "Por que testar transições inválidas rende defeito interessante?",
                        verso: "Muitas transições impossíveis simplesmente não foram bloqueadas.",
                    },
                    {
                        frente: "Quando a transição de estados é a técnica indicada?",
                        verso: "Quando o comportamento depende da situação em que o sistema está.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três elementos separam a exploração da bagunça?",
                        verso: "Missão, tempo e registro.",
                    },
                    {
                        frente: "O que o teste exploratório registra, em vez de passos?",
                        verso: "Missão, achados, dúvidas e cobertura.",
                    },
                    {
                        frente: "Qual é o ponto fraco do teste roteirizado?",
                        verso: "Só encontra aquilo que alguém já imaginou antes.",
                    },
                    {
                        frente: "Como se chama testar direto onde costuma dar problema?",
                        verso: "Suposição de erro.",
                    },
                ],
            },
        },
    },
};
