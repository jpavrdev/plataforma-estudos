import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Estratégia e Priorização, terceira trilha do roadmap de Produto.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobre os julgamentos de
 * cenário; as cartas ficam com os nomes próprios (Rumelt, Cagan), os horizontes
 * e as listas fechadas das tabelas, que é o que escapa depois de uma leitura.
 */
export const estrategiaEPriorizacao: CartasDaTrilha = {
    trilha: "Estratégia e Priorização",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Qual é o horizonte de uma visão de produto?",
                        verso: "De três a cinco anos, contra o de um a dois da estratégia.",
                    },
                    {
                        frente: "Quais são as três assinaturas de uma visão ruim?",
                        verso: "Superlativo sem medida, abstração sem cena e ambição sem recorte.",
                    },
                    {
                        frente: "Que teste prático diz se a sua visão vale alguma coisa?",
                        verso: "Ver se ela teria ajudado nas três últimas decisões difíceis.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quem catalogou os planos que se dizem estratégia e não são?",
                        verso: "Richard Rumelt, que batizou o padrão de má estratégia.",
                    },
                    {
                        frente: "Qual é o teste rápido pra saber se um plano é estratégia?",
                        verso: "Procurar um 'não faremos' escrito com todas as letras.",
                    },
                    {
                        frente: "Em que ordem a falta de escolha cobra a conta?",
                        verso: "Primeiro do time, depois do usuário e por fim da empresa.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais quatro técnicas mantêm a régua do diagnóstico?",
                        verso: "Escrever antes, separar fato de leitura, buscar contraprova e testar proibição.",
                    },
                    {
                        frente: "De que tamanho é um bom diagnóstico?",
                        verso: "Cabe em três frases que qualquer um repete no corredor.",
                    },
                    {
                        frente: "O que mudou no diagnóstico com os painéis de 2026?",
                        verso: "Não falta dado, sobra: o difícil é escolher quais contam a história.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "A que a política orientadora é comparada na aula?",
                        verso: "Às margens da estrada: não dizem onde parar, evitam o pasto.",
                    },
                    {
                        frente: "Quais são as três peças do núcleo de estratégia de Rumelt?",
                        verso: "Diagnóstico, política orientadora e ações coerentes.",
                    },
                    {
                        frente: "O que o teste do reforço pergunta sobre duas iniciativas?",
                        verso: "Se uma deixa a outra mais fácil ou mais valiosa de entregar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que pergunta o nível de time responde, abaixo do de produto?",
                        verso: "Qual solução construir e como validar que ela funciona.",
                    },
                    {
                        frente: "Que seções compõem o one-pager de estratégia?",
                        verso: "Diagnóstico, aposta com os nãos, ações, medidas em outcome e riscos.",
                    },
                    {
                        frente: "Quando a estratégia não pode mudar?",
                        verso: "Por cansaço ou reunião ruim, sem nenhuma evidência nova.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que o SAM mede, entre o TAM e o SOM?",
                        verso: "A fatia que o produto, como ele existe hoje, consegue servir.",
                    },
                    {
                        frente: "Que quatro critérios pesam na escolha de um segmento?",
                        verso: "Intensidade da dor, acesso, disposição a pagar e efeito de rede.",
                    },
                    {
                        frente: "Que três ativos a dominação de um nicho gera?",
                        verso: "Boca a boca no grupo, profundidade de produto e dado específico.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que campo do posicionamento impede que ele vire ficção?",
                        verso: "A prova: a evidência de que a vantagem é verdade hoje.",
                    },
                    {
                        frente: "Qual é o teste de qualidade do campo 'para quem'?",
                        verso: "A exclusão: ele precisa deixar gente de fora.",
                    },
                    {
                        frente: "O que um bom 'por que ganha' precisa citar?",
                        verso: "Algo que a alternativa não consegue copiar amanhã de manhã.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que rotina de concorrência a aula recomenda?",
                        verso: "Meia hora por mês em reviews, changelog e vagas abertas.",
                    },
                    {
                        frente: "Qual é o objetivo de acompanhar concorrente?",
                        verso: "Detectar tendência, não reagir a cada evento isolado.",
                    },
                    {
                        frente: "Que três tipos de sinal do concorrente merecem atenção?",
                        verso: "Movimento de posicionamento, resultado visível e aposta estrutural.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quais são as quatro famílias de fosso?",
                        verso: "Efeito de rede, dados proprietários, custo de troca e marca.",
                    },
                    {
                        frente: "Qual é a pergunta certa de PM sobre fosso?",
                        verso: "Qual fosso estamos cavando de propósito neste trimestre?",
                    },
                    {
                        frente: "O que o fosso faz e o que ele não faz?",
                        verso: "Protege a casa; não constrói o produto bom no lugar dela.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é ancoragem numa decisão de preço?",
                        verso: "O primeiro número visto vira régua para todos os seguintes.",
                    },
                    {
                        frente: "Qual é o risco embutido no preço por uso?",
                        verso: "Conta imprevisível, que assusta o cliente antes de assinar.",
                    },
                    {
                        frente: "Como testar preço, segundo a aula?",
                        verso: "Como hipótese, com coortes e disposição a pagar, sem achismo.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Quem criou o modelo de OKR e quem o popularizou?",
                        verso: "Andy Grove, na Intel, e John Doerr depois dele.",
                    },
                    {
                        frente: "Que natureza tem o Objetivo, ao contrário do Key Result?",
                        verso: "Qualitativo, inspirador e com prazo, sem número na frase.",
                    },
                    {
                        frente: "O que é uma iniciativa, na anatomia do OKR?",
                        verso: "O trabalho em si: uma hipótese de alavanca, trocável.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a régua rápida pra saber se um número serve como KR?",
                        verso: "Se entregarmos tudo e ele não se mover, fracassamos?",
                    },
                    {
                        frente: "Quantos Key Results por objetivo a aula recomenda?",
                        verso: "De dois a quatro; acima disso vira lista de desejos.",
                    },
                    {
                        frente: "Que regra final de qualidade fecha a escrita de KRs?",
                        verso: "Alguém de fora, lendo só os KRs, diz o que melhorou pro usuário.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quanto tempo dura um check-in de OKR, e com que frequência?",
                        verso: "De quinze a trinta minutos, toda semana ou a cada duas.",
                    },
                    {
                        frente: "O que a nota de confiança acrescenta ao valor do KR?",
                        verso: "O termômetro de vamos chegar lá, que vira decisão em vez de leitura.",
                    },
                    {
                        frente: "Pode mudar OKR no meio do trimestre?",
                        verso: "Raramente, e sempre com data e motivo registrados.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que nome a aula dá à meta batida com o outcome piorado?",
                        verso: "Efeito cobra em versão corporativa.",
                    },
                    {
                        frente: "Qual é o par de guarda do KR de cadastros?",
                        verso: "A ativação em sete dias, que não pode piorar junto.",
                    },
                    {
                        frente: "Como corrigir um KR binário de entrega que não dá leitura?",
                        verso: "Quebrar em marcos verificáveis ou declarar como compromisso.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que pergunta decide se vale a pena adotar OKR?",
                        verso: "Se o custo do ritual é menor que o foco e o alinhamento que compra.",
                    },
                    {
                        frente: "Que desenho serve melhor a uma crise aguda no trimestre?",
                        verso: "Plano de guerra com check-in diário, sem a cerimônia de OKR.",
                    },
                    {
                        frente: "O que descartar quando a ferramenta não serve à estratégia?",
                        verso: "A ferramenta, nunca a estratégia.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Por que a comparação com obra civil não vale pra produto?",
                        verso: "A estimativa do nunca construído tem variância que o formato não registra.",
                    },
                    {
                        frente: "O que o executivo ganha e o que perde com o roadmap de datas?",
                        verso: "Ganha previsibilidade de entrega e perde a de resultado.",
                    },
                    {
                        frente: "Qual escolha perversa o time enfrenta quando a evidência muda?",
                        verso: "Entregar o inútil combinado ou pagar o custo de furar o roadmap.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que horizonte típico cobre a coluna Later?",
                        verso: "Além de dois trimestres, com compromisso baixo de propósito.",
                    },
                    {
                        frente: "Que nível de detalhe cabe na coluna Next?",
                        verso: "Médio: o problema definido, com a solução ainda em descoberta.",
                    },
                    {
                        frente: "Com que dois campos cada item do roadmap nasce?",
                        verso: "A justificativa do problema e a medida de como saberemos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o time passa a fazer assim que uma data vira promessa?",
                        verso: "Gerencia pra data: corta escopo, adia refatoração e esconde risco.",
                    },
                    {
                        frente: "O que de fato destrói a confiança do stakeholder?",
                        verso: "A incerteza descoberta depois, não a incerteza avisada.",
                    },
                    {
                        frente: "Que quarto nível a tabela acrescenta aos três de compromisso?",
                        verso: "Fora do plano: não está na direção atual, e o porquê é dito.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o recorte do time precisa carregar, além dos problemas?",
                        verso: "As medidas de sucesso, o que está fora do escopo e a razão.",
                    },
                    {
                        frente: "O que cortar do recorte que vai pro cliente e pra vendas?",
                        verso: "A aposta interna e qualquer data decorativa sem compromisso.",
                    },
                    {
                        frente: "Quando um tema muda de horizonte, o que precisa acontecer?",
                        verso: "Os três recortes mudam na mesma semana, com o mesmo porquê.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três perguntas cada item da pauta de revisão responde?",
                        verso: "O que aprendemos, o que muda no plano e o que fica registrado.",
                    },
                    {
                        frente: "Que três coisas caras o registro de decisão compra?",
                        verso: "Memória do time, proteção contra revisionismo e leitura do processo.",
                    },
                    {
                        frente: "O que a revisão faz com a demo impressionante do concorrente?",
                        verso: "Nada no plano: investiga o problema por trás dela.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Quais são os três limites de um framework de priorização?",
                        verso: "Depende das entradas, não escolhe o conjunto e não assina a decisão.",
                    },
                    {
                        frente: "Qual é o uso maduro do resultado de um framework?",
                        verso: "Ver se a ordem contradiz o seu julgamento e investigar quem errou.",
                    },
                    {
                        frente: "Por que score com casas decimais engana?",
                        verso: "Herda a fragilidade das entradas e ainda ganha aparência de rigor.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que valores a escala de impacto do RICE usa?",
                        verso: "Três massivo, dois alto, um médio, meio baixo e um quarto mínimo.",
                    },
                    {
                        frente: "O que significa confiança de 50% no RICE?",
                        verso: "Intuição informada, sem dado que sustente a estimativa.",
                    },
                    {
                        frente: "Quando dois itens do RICE devem ser tratados como empate?",
                        verso: "Quando o score difere só uns dez por cento entre eles.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que perfil de custo de atraso um rival ocupando o segmento cria?",
                        verso: "Crescente: cada mês de espera custa mais que o anterior.",
                    },
                    {
                        frente: "Qual é a pergunta de triagem que desarma a urgência de voz?",
                        verso: "O que muda, em número, se isso sair daqui a três meses?",
                    },
                    {
                        frente: "O custo de atraso precisa ser exato?",
                        verso: "Não: precisa ser comparável entre os itens da fila.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quais são as quatro caixas do MoSCoW?",
                        verso: "Obrigatório, importante, desejável e fora desta entrega.",
                    },
                    {
                        frente: "Que nome tem o vício de fechar a discussão com um score?",
                        verso: "Teatro de objetividade: o número encerra o debate.",
                    },
                    {
                        frente: "Qual é o ciclo de vida de um item encantador no Kano?",
                        verso: "Vira desempenho e depois vira básico, com o tempo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que recusar pelo score é mais fraco que recusar pelo critério?",
                        verso: "Score muda com uma estimativa nova; o critério é a aposta assumida.",
                    },
                    {
                        frente: "Qual é o erro comum na peça de marcar a revisita do não?",
                        verso: "Prometer um algum dia sem data nenhuma.",
                    },
                    {
                        frente: "Que três dívidas o registro da decisão de priorização paga?",
                        verso: "Evita rediscutir, dá resposta com evidência e audita o seu critério.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Quais são os quatro papéis do mapa por decisão?",
                        verso: "Quem decide, quem influencia, quem bloqueia e quem é informado.",
                    },
                    {
                        frente: "Quantas pessoas decidem uma mesma decisão?",
                        verso: "Uma: se existem três decisores, ninguém decide.",
                    },
                    {
                        frente: "O que acontece numa reunião de decisão em que alguém se surpreende?",
                        verso: "Ela não decide nada: agenda outra reunião.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que assimetria explica a opinião forte do executivo sobre detalhe?",
                        verso: "Ele vê dez por cento do contexto e responde por cem do resultado.",
                    },
                    {
                        frente: "Qual é a regra de ouro da gestão para cima?",
                        verso: "Nunca surpreender: má notícia sai da sua boca, cedo.",
                    },
                    {
                        frente: "O que fazer quando a decisão sai contra a sua recomendação?",
                        verso: "Registrar o ponto uma vez e executar com energia total.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um time sem nenhum conflito costuma indicar?",
                        verso: "Que alguém desistiu de falar, não que há alinhamento.",
                    },
                    {
                        frente: "Qual é a diferença entre posição e interesse numa negociação?",
                        verso: "Posição é o pedido; interesse é o que a pessoa quer alcançar.",
                    },
                    {
                        frente: "Como escrever a versão da outra parte ao escalar?",
                        verso: "De um jeito em que ela reconheceria a própria posição.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que cinco partes compõem a narrativa da estratégia?",
                        verso: "O que acontece, por quê, o que escolhemos, o que muda e como saberemos.",
                    },
                    {
                        frente: "Por que não vale trocar as palavras a cada apresentação?",
                        verso: "A frase precisa se repetir até virar vocabulário comum.",
                    },
                    {
                        frente: "Quanto custa evitar a área que vira opositora pelo processo?",
                        verso: "Três conversas de meia hora, contra trimestres pra recuperar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quem formulou que somar gente a projeto atrasado atrasa mais?",
                        verso: "Frederick Brooks, décadas atrás e ignorado até hoje.",
                    },
                    {
                        frente: "Qual é a forma do não construtivo numa negociação?",
                        verso: "Colocar as duas combinações possíveis e devolver a escolha.",
                    },
                    {
                        frente: "Quando registrar o que foi combinado numa negociação?",
                        verso: "No mesmo dia, em texto curto, com o que entra, o que sai e a data.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Quais são as três alavancas pra dobrar receita recorrente?",
                        verso: "Mais pagantes, ticket maior ou menos gente saindo.",
                    },
                    {
                        frente: "Por que o autônomo custa menos pra adquirir no Financem?",
                        verso: "Ele chega por indicação, não por mídia paga.",
                    },
                    {
                        frente: "Quanto tempo de caixa e quantas pessoas o Financem tem?",
                        verso: "Catorze meses de pista e um time de nove pessoas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que condição reabre a discussão do crédito no Financem?",
                        verso: "A retenção D30 passar de quarenta e cinco por cento.",
                    },
                    {
                        frente: "O que o diagnóstico do Financem proíbe, além de comprar tráfego?",
                        verso: "Tratar a retenção como problema de interface.",
                    },
                    {
                        frente: "Que três trabalhos um não com data faz de uma vez?",
                        verso: "Protege o foco, a relação e a estratégia contra teimosia.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais são as duas métricas de guarda do OKR do Financem?",
                        verso: "NPS do segmento com piso de 45 e suporte abaixo de seis horas.",
                    },
                    {
                        frente: "Como o uso semanal foi definido no KR do Financem?",
                        verso: "Três semanas ativas em quatro, saindo de 21% para 35%.",
                    },
                    {
                        frente: "Por que dobrar a receita não virou KR do time?",
                        verso: "Metade depende de preço, canal e mercado, fora do controle dele.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é o único compromisso com data firme no roadmap do Financem?",
                        verso: "A adequação à regra nova do carnê, que entra em vigor em julho.",
                    },
                    {
                        frente: "Com que frequência a janela do tema do Now é revisada?",
                        verso: "Na primeira segunda-feira de cada mês.",
                    },
                    {
                        frente: "O que o recorte de vendas corta do roadmap do Financem?",
                        verso: "As apostas do Later e qualquer data que não seja compromisso.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que cinco perguntas um leitor externo responde em cinco minutos?",
                        verso: "Desafio, aposta, o que ficou de fora, como saberemos e o que derruba.",
                    },
                    {
                        frente: "Qual é o risco declarado no one-pager do Financem?",
                        verso: "O teste de maio ficar abaixo de trinta por cento.",
                    },
                    {
                        frente: "Que sinal diz que o one-pager ainda não está pronto?",
                        verso: "Alguma das cinco perguntas exigir reunião de explicação.",
                    },
                ],
            },
        },
    },
};
