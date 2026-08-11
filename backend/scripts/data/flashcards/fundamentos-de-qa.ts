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
        5: {
            1: {
                neutra: [
                    {
                        frente: "Qual é o teste de fogo de um caso de teste bem escrito?",
                        verso: "Outra pessoa executa sem tirar dúvida com quem escreveu.",
                    },
                    {
                        frente: "Por que um caso de teste gigante é problemático?",
                        verso: "Falhando no meio, fica difícil saber o estado real do sistema.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a parte mais valiosa de um plano de teste?",
                        verso: "A lista do que não será testado, com o risco assumido ao lado.",
                    },
                    {
                        frente: "Que estratégia um sistema com norma obrigatória do setor exige?",
                        verso: "A estratégia baseada em padrões.",
                    },
                    {
                        frente: "O que o plano combina sobre dados de teste?",
                        verso: "Como criar a massa, para ela ser previsível e reaproveitável.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que informar ambiente e versão no relatório de bug?",
                        verso: "Boa parte dos casos de não consegui reproduzir vem daí.",
                    },
                    {
                        frente: "Qual é o problema de juntar vários defeitos num relatório só?",
                        verso: "Cada um tem prioridade e correção próprias, e algum se perde.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre severidade e prioridade?",
                        verso: "Severidade mede o estrago técnico; prioridade, a urgência.",
                    },
                    {
                        frente: "Como classificar um crash em relatório usado uma vez por ano?",
                        verso: "Severidade alta e prioridade baixa.",
                    },
                    {
                        frente: "Como classificar o nome da empresa errado na home, com campanha amanhã?",
                        verso: "Severidade baixa e prioridade alta.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a diferença de escopo entre critério de aceitação e pronto?",
                        verso: "O critério é de uma história; a definição de pronto vale para todas.",
                    },
                    {
                        frente: "Quem escreve a definição de pronto, e quando?",
                        verso: "O time, na retrospectiva.",
                    },
                    {
                        frente: "Com que frequência cada um dos dois muda?",
                        verso: "O critério muda a cada história; a definição de pronto é estável.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "No modelo cascata, onde o teste fica?",
                        verso: "Numa fase depois de a construção terminar.",
                    },
                    {
                        frente: "Em quanto tempo o feedback chega em cascata e em ágil?",
                        verso: "Em meses na cascata, em dias no ágil.",
                    },
                    {
                        frente: "Qual é a mudança mais importante para QA ao migrar para ágil?",
                        verso: "QA passa a entrar no começo, e não no fim.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quais são os três papéis do Scrum?",
                        verso: "Product Owner, Scrum Master e time de desenvolvimento.",
                    },
                    {
                        frente: "O Scrum define o papel de testador?",
                        verso: "Não. Quem faz QA integra o time de desenvolvimento.",
                    },
                    {
                        frente: "Qual cerimônia é a mais valiosa para QA?",
                        verso: "O refinamento do backlog.",
                    },
                    {
                        frente: "O que QA leva para a retrospectiva?",
                        verso: "Dados sobre a origem dos defeitos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a frase que resume o limite de trabalho em progresso?",
                        verso: "Pare de começar, comece a terminar.",
                    },
                    {
                        frente: "O que a fila de teste sempre cheia costuma significar?",
                        verso: "Que QA virou gargalo do fluxo.",
                    },
                    {
                        frente: "O que itens voltando de teste para desenvolvimento denunciam?",
                        verso: "Critério pouco claro ou entrega incompleta.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é o formato clássico de uma história de usuário?",
                        verso: "Como um papel, quero uma ação, para um benefício.",
                    },
                    {
                        frente: "Que letra do INVEST toca mais de perto o trabalho de QA?",
                        verso: "O T, de testável.",
                    },
                    {
                        frente: "Por que a história de usuário é um lembrete de conversa?",
                        verso: "O detalhe nasce na conversa, e não no texto curto do cartão.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que sintoma denuncia o muro entre desenvolvimento e teste?",
                        verso: "A frase já terminei, agora é com o QA.",
                    },
                    {
                        frente: "O que qualidade é responsabilidade de todo mundo significa?",
                        verso: "Cada papel contribui de um jeito, e a função de QA continua existindo.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a pergunta certa antes de automatizar um caso?",
                        verso: "O que ganho, comparado ao custo de manter esse teste funcionando?",
                    },
                    {
                        frente: "Que característica faz um teste ser bom candidato à automação?",
                        verso: "Alta repetição com resultado determinístico.",
                    },
                    {
                        frente: "Por que tela que muda a cada sprint não deve ser automatizada ainda?",
                        verso: "A manutenção supera o benefício.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a distribuição que a pirâmide de testes propõe?",
                        verso: "Muitos de unidade na base e poucos de ponta a ponta no topo.",
                    },
                    {
                        frente: "Por que a pirâmide tem essa forma?",
                        verso: "Quanto mais alto o nível, mais lento, frágil e caro de manter.",
                    },
                    {
                        frente: "Como se chama a suíte com muita interface e quase nada abaixo?",
                        verso: "Cone de sorvete, ou pirâmide invertida.",
                    },
                    {
                        frente: "Em que velocidade cada camada da pirâmide roda?",
                        verso: "Milissegundos na unidade, segundos na integração, minutos no topo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o padrão AAA organiza num teste automatizado?",
                        verso: "Preparar o cenário, executar a ação e verificar o resultado.",
                    },
                    {
                        frente: "A que formato manual o AAA corresponde?",
                        verso: "Pré-condições, passos e resultado esperado.",
                    },
                    {
                        frente: "Como cobrir uma regra com trinta combinações?",
                        verso: "Todas no nível barato, e um cenário representativo no topo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a certificação mais conhecida da área de teste?",
                        verso: "O ISTQB Foundation Level.",
                    },
                    {
                        frente: "O que caracteriza o perfil de QA de automação?",
                        verso: "Escrever código de teste e cuidar da suíte e da infraestrutura.",
                    },
                    {
                        frente: "Que categoria de ferramenta costuma dar o melhor retorno cedo?",
                        verso: "As de API, como Postman e REST Assured.",
                    },
                    {
                        frente: "Que conselho a aula dá sobre certificação para quem começa?",
                        verso: "Construir prática primeiro: a certificação rende mais com contexto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é o trabalho central de QA?",
                        verso: "Reduzir o risco de entregar algo que não serve e informar o risco que sobra.",
                    },
                    {
                        frente: "O que a trilha de testes em código acrescenta aos fundamentos?",
                        verso: "Como escrever unidade, integração e mocks de verdade.",
                    },
                ],
            },
        },
    },
};
