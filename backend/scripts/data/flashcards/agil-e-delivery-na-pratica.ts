import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Ágil e Delivery na Prática, sexta trilha do roadmap de Produto.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento de
 * cenário; as cartas ficam com os números do Guia do Scrum, as listas fechadas
 * e as definições que a aula enuncia de passagem.
 */
export const agilEDeliveryNaPratica: CartasDaTrilha = {
    trilha: "Ágil e Delivery na Prática",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quais são as fases sequenciais do modelo cascata?",
                        verso: "Requisitos, design, implementação, testes e entrega.",
                    },
                    {
                        frente: "Como é ser iterativo sem ser incremental?",
                        verso: "Refinar protótipo pra sempre sem entregar nada usável.",
                    },
                    {
                        frente: "O que sobra quando um projeto ágil é cancelado no meio?",
                        verso: "Um produto parcial funcionando, não uma pilha de documento.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quando e por quantas pessoas o Manifesto Ágil foi escrito?",
                        verso: "Em 2001, por dezessete profissionais reunidos em Utah.",
                    },
                    {
                        frente: "Quantos valores e princípios o Manifesto tem?",
                        verso: "Quatro valores e doze princípios.",
                    },
                    {
                        frente: "Que teste aplicar a uma prática que se diz ágil?",
                        verso: "Ela encurta o caminho até o feedback e barateia mudar de rumo?",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando o controle definido de processo funciona?",
                        verso: "Com entradas e saídas previsíveis, como uma linha de montagem.",
                    },
                    {
                        frente: "O que a Sprint Review inspeciona e o que ela adapta?",
                        verso: "Inspeciona o incremento e adapta o Product Backlog.",
                    },
                    {
                        frente: "Que papel os artefatos do Scrum cumprem no empirismo?",
                        verso: "Dar transparência: o que se pretende, o plano e o que já existe.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que nome a aula dá ao projeto de fases fixas picado em sprints?",
                        verso: "Cascata com sprint: parcelas de cronograma com nome do Scrum.",
                    },
                    {
                        frente: "Qual é o custo duplo do ágil de fachada?",
                        verso: "Paga o processo sem o benefício e o time conclui que não funciona.",
                    },
                    {
                        frente: "Que três incentivos costumam sustentar a fachada?",
                        verso: "Contrato que pune mudança, bônus pelo cronograma e medo de expor.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que ainda ajuda num contexto regulado, apesar do limite?",
                        verso: "Iterações internas e integração contínua no desenvolvimento.",
                    },
                    {
                        frente: "Que arranjos contratuais substituem o escopo e preço fechados?",
                        verso: "Contrato por fase, orçamento fixo com escopo variável e troca item a item.",
                    },
                    {
                        frente: "Qual regra geral fecha o módulo sobre quando usar empirismo?",
                        verso: "Quanto mais incerteza sobre o valor, mais o empirismo se paga.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que mudou de papéis para accountabilities em 2020?",
                        verso: "O mercado lia papel como cargo; accountability é responsabilidade.",
                    },
                    {
                        frente: "O que a organização define, fora do auto-gerenciamento?",
                        verso: "Orçamento, restrição legal e padrão de arquitetura e segurança.",
                    },
                    {
                        frente: "O que significa um time ser cross-functional?",
                        verso: "Ter as habilidades pra virar ideia em incremento sem depender de fora.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três coisas valem durante toda a Sprint?",
                        verso: "Nada ameaça o Sprint Goal, escopo renegocia e a qualidade não cai.",
                    },
                    {
                        frente: "Que trade-off uma Sprint mais curta traz?",
                        verso: "Mais feedback e menos risco por ciclo, mais tempo gasto em eventos.",
                    },
                    {
                        frente: "O que deixou de ser regra na Daily a partir de 2020?",
                        verso: "O formato das três perguntas: o time escolhe a estrutura.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é o compromisso do Increment?",
                        verso: "A Definition of Done: sem ela, não existe incremento.",
                    },
                    {
                        frente: "Qual é a diferença entre utilizável e publicado?",
                        verso: "Publicar é decisão do PO; estar pronto pra publicar é do time.",
                    },
                    {
                        frente: "Quantas Definitions of Done um time pode ter?",
                        verso: "Uma só: não existe DoD por item nem que muda com o prazo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quais são os quatro deveres concretos do Product Owner?",
                        verso: "Comunicar o Product Goal, criar itens, ordená-los e dar transparência.",
                    },
                    {
                        frente: "Quais três distorções costumam atingir o posto de PO?",
                        verso: "PO sem autoridade, PO sem tempo e PO virado analista.",
                    },
                    {
                        frente: "Que três coisas ninguém faz no lugar do PO?",
                        verso: "Falar com usuário, medir resultado e decidir o que não será feito.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que acontece com os pilares sem confiança no time?",
                        verso: "Transparência vira exposição, inspeção vira auditoria e adaptação, briga.",
                    },
                    {
                        frente: "O que significa respeito, na definição do Scrum?",
                        verso: "Tratar as pessoas como capazes e independentes.",
                    },
                    {
                        frente: "Qual valor é o mais atacado pelo dia a dia de interrupções?",
                        verso: "O foco, que é concentrar-se no trabalho da Sprint.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que três adjetivos definem um Product Backlog saudável?",
                        verso: "Emergente, ordenado e enxuto o bastante pra alguém ler o topo.",
                    },
                    {
                        frente: "Como é a granularidade de um backlog saudável?",
                        verso: "Decrescente: topo pequeno e detalhado, fim com ideia grossa.",
                    },
                    {
                        frente: "Que três forças combinam no critério de ordenação?",
                        verso: "Valor esperado, risco que a entrega resolve e dependência técnica.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De onde veio a história de usuário, e ela é do Scrum?",
                        verso: "Nasceu no Extreme Programming; não faz parte do Guia do Scrum.",
                    },
                    {
                        frente: "Que três palavras resumem a técnica, segundo Ron Jeffries?",
                        verso: "Cartão, conversa e confirmação, nessa ordem.",
                    },
                    {
                        frente: "Qual pedaço da história o mercado mais corta, e não pode faltar?",
                        verso: "O para quê: sem ele, o time não propõe um jeito melhor.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que teste diz se um critério de aceite é verificável?",
                        verso: "Duas pessoas chegam sozinhas ao mesmo veredito?",
                    },
                    {
                        frente: "Que caminhos o critério de aceite costuma esquecer?",
                        verso: "Os de erro: só o caminho feliz vira retrabalho depois.",
                    },
                    {
                        frente: "Como um bom critério de aceite precisa ser?",
                        verso: "Concreto pra virar teste e curto pra caber num cartão.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que régua diz se o refinamento aconteceu?",
                        verso: "Chegar na Planning com os itens do topo já entendidos.",
                    },
                    {
                        frente: "Que pergunta resolve quase todo problema de fatiamento?",
                        verso: "Qual é a menor versão que alguém de fora usaria e comentaria?",
                    },
                    {
                        frente: "Que padrões servem pra fatiar um item grande?",
                        verso: "Caminho feliz antes do erro, por tipo de usuário e por regra.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "De quem é a DoD e de quem são os critérios de aceite?",
                        verso: "A DoD é do time e da empresa; o critério é do item e do usuário.",
                    },
                    {
                        frente: "O que a DoD compartilhada entre times precisa cobrir?",
                        verso: "O que atravessa fronteira: integração, segurança e contrato.",
                    },
                    {
                        frente: "De que tamanho deve ser uma Definition of Done útil?",
                        verso: "De seis a dez linhas que o time aplica todo dia mesmo.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que exercício revela as esperas escondidas no quadro?",
                        verso: "Seguir um item por uma semana e anotar cada parada dele.",
                    },
                    {
                        frente: "O que diferencia item ativo de item em espera?",
                        verso: "No ativo alguém trabalha agora; o em espera aguarda gente ou ambiente.",
                    },
                    {
                        frente: "Para onde um time maduro olha primeiro no quadro?",
                        verso: "Para o que está parado, que é o que está custando prazo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é o efeito mais valioso do limite de WIP?",
                        verso: "Vira problema do time: o fluxo travou, não a minha tarefa.",
                    },
                    {
                        frente: "Como a lei de Little se enuncia em palavras?",
                        verso: "Tempo médio é a quantidade em andamento sobre a taxa de saída.",
                    },
                    {
                        frente: "Que dois caminhos existem pra entregar mais rápido?",
                        verso: "Subir a taxa de saída, que é difícil, ou baixar o que está aberto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a métrica de fluxo mais acionável no dia a dia?",
                        verso: "A idade do item aberto, que alerta hoje e não no fim do mês.",
                    },
                    {
                        frente: "Que percentis vale olhar na distribuição de tempo de entrega?",
                        verso: "Cinquenta, oitenta e cinco e noventa e cinco por cento.",
                    },
                    {
                        frente: "De que as métricas de fluxo não dependem?",
                        verso: "De estimativa: basta registrar quando o item entrou e saiu.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três classes de serviço o suporte costuma usar?",
                        verso: "Urgente, padrão e data fixa, somadas ao limite de WIP.",
                    },
                    {
                        frente: "O que continua existindo ao juntar Scrum com Kanban?",
                        verso: "Sprint Backlog, Sprint Goal e a Review inspecionando o incremento.",
                    },
                    {
                        frente: "Que três contextos favorecem o Kanban puro?",
                        verso: "Suporte, itens uniformes e miúdos, e fluxo dominado por fila.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quando o replenishment acontece?",
                        verso: "Semanalmente ou quando abre espaço na primeira coluna.",
                    },
                    {
                        frente: "O que muda na decisão do PO em fluxo contínuo?",
                        verso: "A granularidade: decide item a item, não em lote quinzenal.",
                    },
                    {
                        frente: "Por que fluxo contínuo exige mais maturidade que sprint?",
                        verso: "Sem a data de fim, ninguém é forçado a inspecionar.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que escala os pontos de história costumam usar, e por quê?",
                        verso: "Uma que lembra Fibonacci: a distância cresce junto com a incerteza.",
                    },
                    {
                        frente: "Qual condição o no estimates exige para funcionar?",
                        verso: "Fatiar os itens em tamanhos parecidos, o que dá trabalho.",
                    },
                    {
                        frente: "Por que o planning poker pede carta revelada ao mesmo tempo?",
                        verso: "Pra ninguém ancorar no palpite do mais experiente.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que lei explica velocity virar meta e perder o sentido?",
                        verso: "A lei de Goodhart: medida que vira alvo deixa de medir.",
                    },
                    {
                        frente: "O que acontece com a série de velocity quando o time muda?",
                        verso: "Reinicia em parte: o histórico anterior perde valor.",
                    },
                    {
                        frente: "O que a velocity não diz sobre o produto?",
                        verso: "Se ele melhorou, se o cliente gostou ou se a arquitetura aguenta.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como funciona a simulação de Monte Carlo, em uma frase?",
                        verso: "Sorteia semanas passadas até completar o escopo, milhares de vezes.",
                    },
                    {
                        frente: "Que três condições a previsão probabilística exige?",
                        verso: "Histórico do mesmo time, escopo contado e estabilidade razoável.",
                    },
                    {
                        frente: "Qual é o ganho maior da previsão por percentil?",
                        verso: "Político: a conversa vira sobre risco, não sobre coragem.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é release planning ágil, então?",
                        verso: "Uma sequência de fatias de valor com objetivo verificável.",
                    },
                    {
                        frente: "Que três hábitos sustentam um plano de release honesto?",
                        verso: "Separar compromisso de previsão, nomear risco e atualizar por Sprint.",
                    },
                    {
                        frente: "Como o atraso anunciado na última hora é lido de fora?",
                        verso: "Não parece azar: parece que ninguém estava olhando.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três qualidades um bom Sprint Goal tem?",
                        verso: "Curto, único e verificável por alguém de fora do time.",
                    },
                    {
                        frente: "Por que prometer contando com hora extra falha?",
                        verso: "Funciona uma vez e cobra em bug e gente cansada depois.",
                    },
                    {
                        frente: "Que três partes tem a resposta de quando não cabe tudo?",
                        verso: "O que cabe, o custo do resto e a escolha devolvida a quem decide.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que consenso entre áreas com metas diferentes produz?",
                        verso: "Média, e não direção para o produto.",
                    },
                    {
                        frente: "Que tipo de delegação pedir primeiro, para ser aceita?",
                        verso: "Pequena e específica: decidir sozinho abaixo de certo impacto.",
                    },
                    {
                        frente: "O que os dois anti-padrões de PO quebram em comum?",
                        verso: "A ligação curta entre quem decide valor e quem constrói.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quem popularizou o termo feature factory?",
                        verso: "John Cutler, para o time que produz sem saber se gerou valor.",
                    },
                    {
                        frente: "Como o time sente a feature factory por dentro?",
                        verso: "Um cansaço estranho: entrega sempre e não sente progresso.",
                    },
                    {
                        frente: "Qual limite não pode ser cruzado sobre medir resultado?",
                        verso: "Um trimestre inteiro sem nenhuma entrega com efeito verificado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que outra variação do scrumfall aparece além da sprint de fase?",
                        verso: "A sprint zero de dois meses montando arquitetura antes de entregar.",
                    },
                    {
                        frente: "O que muda o cálculo econômico de adiar o teste?",
                        verso: "Automatizar o caminho crítico e ter ambiente sob demanda.",
                    },
                    {
                        frente: "Quando é aceitável ter incremento pronto sem publicar?",
                        verso: "Com integração externa lenta: ele continua sendo incremento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que pergunta honesta se faz antes de contratar mais gente?",
                        verso: "Se dobrássemos o time amanhã, o que travaria primeiro?",
                    },
                    {
                        frente: "O que cada time precisa ter ao dividir um time em dois?",
                        verso: "O próprio PO, ou uma ordenação clara que evite disputa.",
                    },
                    {
                        frente: "O que sobreviveu bem da moda de escalar por framework?",
                        verso: "Times pequenos com contrato de API e coordenação por objetivo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que três motivos a transparência vem primeiro?",
                        verso: "É barata, não ameaça ninguém e produz os argumentos do resto.",
                    },
                    {
                        frente: "Que ordem os cinco movimentos de mudança seguem?",
                        verso: "Visibilidade, uma dor, dados de fluxo, eventos e quem decide fora.",
                    },
                    {
                        frente: "Qual é a única falha grave ao tentar mudar um time?",
                        verso: "Parar de inspecionar o que você mesmo está tentando.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Como é composto o time do Entregaí?",
                        verso: "Cinco Developers, uma Scrum Master e o Product Owner.",
                    },
                    {
                        frente: "Que duas perguntas de partida orientam um backlog herdado?",
                        verso: "Qual problema custa mais caro e qual item tem prazo externo real.",
                    },
                    {
                        frente: "Que fração dos contatos de suporte é sobre status do pedido?",
                        verso: "Quarenta por cento, o maior motivo de contato do app.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que argumento faz um item técnico disputar ordem de verdade?",
                        verso: "Risco ou custo datado, não que a coisa está velha.",
                    },
                    {
                        frente: "Que fatia menor testa a hipótese do programa de fidelidade?",
                        verso: "Um cupom para quem não pede há trinta dias.",
                    },
                    {
                        frente: "O que significa ordenar, na definição da aula?",
                        verso: "Escolher o que não será feito agora, descendo item pro fim.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual foi o Sprint Goal fechado na Planning do Entregaí?",
                        verso: "Quem tem endereço salvo compra sem redigitar, em três passos.",
                    },
                    {
                        frente: "Que três partes a comunicação do que ficou de fora tem?",
                        verso: "O que entra e por quê, o que sai e quando, e o convite a contestar.",
                    },
                    {
                        frente: "Onde a Sprint começa a falhar, na hora da capacidade?",
                        verso: "Na tentação de empurrar só mais um item além do que cabe.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que troca o PO do Entregaí fez para o contorno do Pix entrar?",
                        verso: "Saiu a redução de quatro para três passos do checkout.",
                    },
                    {
                        frente: "Que três detalhes tornam a troca no meio da Sprint profissional?",
                        verso: "Conversa antes, registro visível do que saiu e aviso no mesmo dia.",
                    },
                    {
                        frente: "Qual era o tamanho do incidente de pagamento no Entregaí?",
                        verso: "Quinze por cento das tentativas falhando e trinta contatos.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que aconteceu com o cycle time médio na Sprint do Entregaí?",
                        verso: "Caiu de seis para quatro dias, com menos itens abertos juntos.",
                    },
                    {
                        frente: "Que sugestão de fora entrou no backlog durante a Review?",
                        verso: "Avisar o cliente quando o pagamento falha, em vez de só dar erro.",
                    },
                    {
                        frente: "Que ciclo o caso inteiro percorreu, do começo ao fim?",
                        verso: "Backlog bruto virou ordem, objetivo, entrega, número e backlog novo.",
                    },
                ],
            },
        },
    },
};
