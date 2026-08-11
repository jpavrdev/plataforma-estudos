import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Dados para Produto, quarta trilha do roadmap de Produto.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz da trilha cobra as contas
 * do Financem; as cartas ficam com as definições, as listas fechadas e os
 * números de referência que sustentam essas contas.
 */
export const dadosParaProduto: CartasDaTrilha = {
    trilha: "Dados para Produto",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que três perguntas fazem a triagem de uma métrica candidata?",
                        verso: "Tem responsável? Tem alavanca em semanas? Ela pode piorar?",
                    },
                    {
                        frente: "Que decisão o time tirou da razão de 20% entre diários e mensais?",
                        verso: "Investir no resumo semanal e medir de novo em quatro semanas.",
                    },
                    {
                        frente: "O que perguntar quando o tempo médio na tela sobe?",
                        verso: "Se o tempo maior veio de valor entregue ou de confusão.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três coisas uma boa north star combina?",
                        verso: "Largura, profundidade e frequência do valor entregue.",
                    },
                    {
                        frente: "Qual é o teste de uma candidata a north star?",
                        verso: "Se subir 30%, o usuário fica claramente melhor e o negócio de pé?",
                    },
                    {
                        frente: "Quantas north stars um produto deve ter, e com que companhia?",
                        verso: "Uma só, acompanhada de duas ou três métricas de contexto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é o erro de um time que só acompanha métricas de entrada?",
                        verso: "Comemora a alavanca enquanto o resultado despenca sem ser checado.",
                    },
                    {
                        frente: "Quantos assinantes novos igualariam o efeito de um ponto de churn?",
                        verso: "Mil e vinte por mês, contra novecentos hoje, e isso custa mídia.",
                    },
                    {
                        frente: "O que faz a discussão sobre a árvore de métricas ser produtiva?",
                        verso: "As suposições ficarem visíveis, pra discordância cair sobre elas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que distingue uma taxa de uma razão?",
                        verso: "Na taxa o numerador é subconjunto do denominador; na razão, não.",
                    },
                    {
                        frente: "Qual é o antídoto contra taxa com denominador ambíguo?",
                        verso: "Escrever o denominador dentro do próprio nome da métrica.",
                    },
                    {
                        frente: "Quando a média de ticket deixa de informar?",
                        verso: "Quando mistura populações; aí valem mediana e faixas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quais são as cinco camadas de um painel de produto?",
                        verso: "North star, entradas, funil, saúde técnica e exploração.",
                    },
                    {
                        frente: "Onde mora a consulta de exploração?",
                        verso: "Fora do painel: vira gráfico fixo só se a pergunta for recorrente.",
                    },
                    {
                        frente: "Por que quebrar o painel por plataforma e coorte de entrada?",
                        verso: "O agregado esconde um lado caindo enquanto o outro sobe.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que remédio cada uma das três primeiras etapas do AARRR pede?",
                        verso: "Canal na aquisição, primeiro uso na ativação e produto na retenção.",
                    },
                    {
                        frente: "Em que ordem se lê e em que ordem se trabalha o AARRR?",
                        verso: "Lê de cima pra baixo; trabalha de baixo pra cima em produto jovem.",
                    },
                    {
                        frente: "Por que aquisição paga é comparada a aluguel?",
                        verso: "Parou de pagar, parou de chegar: não fica nada acumulado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Pra que serve o custo por instalação, já que ele engana?",
                        verso: "Pra comparar criativos dentro de um mesmo canal.",
                    },
                    {
                        frente: "O que quebrou a atribuição determinística até 2026?",
                        verso: "Restrição de identificador no celular e fim do cookie de terceiro.",
                    },
                    {
                        frente: "Quais três caminhos honestos sobraram para atribuição?",
                        verso: "Modelagem estatística, pesquisa no cadastro e experimento por região.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais quatro filtros um bom critério de ativação precisa passar?",
                        verso: "Correlaciona, acontece cedo, alcança muita gente e o produto influencia.",
                    },
                    {
                        frente: "Qual é a diferença entre setup moment e habit moment?",
                        verso: "Setup é a configuração; hábito é o retorno espontâneo depois.",
                    },
                    {
                        frente: "Quanto reteve quem não conectou nenhuma conta no Financem?",
                        verso: "Três por cento em trinta dias, contra 50% de quem conectou duas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Como se calcula a vida média de um assinante?",
                        verso: "Um dividido pelo churn mensal: 5% ao mês dá vinte meses.",
                    },
                    {
                        frente: "Com fator K de 0,36, quantos usuários 100 acabam virando?",
                        verso: "Cerca de 156, porque um dividido por 0,64 dá 1,56.",
                    },
                    {
                        frente: "Para que o NPS de fato serve?",
                        verso: "Série temporal do mesmo público e, principalmente, o campo aberto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o Financem faz, como produto?",
                        verso: "Conecta contas, categoriza gastos e manda um resumo semanal.",
                    },
                    {
                        frente: "Que três perguntas o funil completo permite fazer?",
                        verso: "Onde se perde mais em absoluto, em relativo e o que dá pra mexer já.",
                    },
                    {
                        frente: "Quanto custaria comprar os mesmos 160 assinantes extras?",
                        verso: "Mais de 13 mil instalações, algo como R$ 156.000 por mês.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que causa a queda de retenção entre o dia zero e o dia um?",
                        verso: "Expectativa quebrada: o anúncio prometeu outra coisa.",
                    },
                    {
                        frente: "Que remédio a queda a partir do sétimo dia pede?",
                        verso: "Encontrar o gatilho recorrente: ali é problema de hábito.",
                    },
                    {
                        frente: "O que significa uma curva de retenção que sobe desde o começo?",
                        verso: "Quase sempre erro de coorte ou de definição de evento.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a leitura de uma coluna da tabela de coorte responde?",
                        verso: "Se o produto está melhorando pra quem chega agora.",
                    },
                    {
                        frente: "Por que a tabela de coorte sai triangular?",
                        verso: "As coortes recentes ainda não viveram todos os meses.",
                    },
                    {
                        frente: "Que recorte de coorte costuma revelar mais que a data?",
                        verso: "O comportamento: quem conectou duas contas contra quem conectou uma.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Sobre que base a aula recomenda medir retenção?",
                        verso: "Sobre os ativados: só quem chegou ao valor pode voltar.",
                    },
                    {
                        frente: "Qual é a diferença entre retenção de dia exato e por intervalo?",
                        verso: "A de intervalo aceita uso em qualquer momento da janela.",
                    },
                    {
                        frente: "Que janelas descrevem melhor um produto de ritmo semanal?",
                        verso: "Semana 1, semana 4 e semana 12, no lugar de D1 e D7.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quanto da base some em um ano com churn de 5% ao mês?",
                        verso: "Mais da metade, se ninguém entrar no lugar.",
                    },
                    {
                        frente: "Que remédio técnico ataca o churn involuntário?",
                        verso: "Nova tentativa de cobrança em dias diferentes e aviso antes.",
                    },
                    {
                        frente: "Por que o valor de vida não pode ser tratado como caixa?",
                        verso: "É projeção, e usar como dinheiro disponível já quebrou empresa.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como a aula define o estado em risco?",
                        verso: "Sem nenhum uso entre oito e vinte e nove dias.",
                    },
                    {
                        frente: "Sobre quantas pessoas se calcula o custo por ressuscitado?",
                        verso: "Sobre os 96 que ficaram, não sobre os 640 que voltaram.",
                    },
                    {
                        frente: "Que razão descreve melhor um produto de uso semanal?",
                        verso: "Semanais sobre mensais, no lugar de diários sobre mensais.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que acontece com a propriedade de evento depois do envio?",
                        verso: "Fica congelada: descreve aquele acontecimento e não muda.",
                    },
                    {
                        frente: "O que se perde quando a versão do app não viaja com o evento?",
                        verso: "Descobrir que a queda de ontem começou numa build específica.",
                    },
                    {
                        frente: "O que escrever antes de instrumentar um evento novo?",
                        verso: "A pergunta que ele responde; sem ela, vira linha morta.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que o objeto vem antes da ação no nome do evento?",
                        verso: "A ordem alfabética agrupa tudo que fala do mesmo assunto.",
                    },
                    {
                        frente: "Que cinco verbos padronizam a taxonomia de eventos?",
                        verso: "Visualizado, iniciado, concluído, falhou e cancelado.",
                    },
                    {
                        frente: "Que campo do plano de eventos impede que ele vire inventário?",
                        verso: "As perguntas que aquele evento serve para responder.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais são as cinco camadas de ferramenta de dados?",
                        verso: "Coleta, analytics de produto, web analytics, armazém e exploração.",
                    },
                    {
                        frente: "Que cinco critérios decidem a escolha de ferramenta?",
                        verso: "Quem consulta, volume, portabilidade, conformidade e tempo de subida.",
                    },
                    {
                        frente: "O que o critério de portabilidade pergunta?",
                        verso: "Se você consegue exportar o dado bruto e levar o histórico.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quais três falhas respondem pela maioria dos dados quebrados?",
                        verso: "Duplicação de envio, perda de evento e identidade não costurada.",
                    },
                    {
                        frente: "Que duas causas produzem evento duplicado?",
                        verso: "Nova tentativa sem chave de idempotência e disparo a cada redesenho.",
                    },
                    {
                        frente: "Quando os dois históricos de uma pessoa precisam ser costurados?",
                        verso: "No momento do login, unindo o anônimo ao usuário.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que cinco princípios da LGPD organizam a instrumentação?",
                        verso: "Finalidade, minimização, transparência, prazo de guarda e direitos.",
                    },
                    {
                        frente: "Que combinação identifica boa parte da população sem nome?",
                        verso: "CEP, data de nascimento e gênero juntos.",
                    },
                    {
                        frente: "O que precisa existir antes do primeiro pedido de exclusão?",
                        verso: "O mapa de para onde cada evento viaja fora de casa.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que o sorteio compra que nenhum ajuste posterior consegue?",
                        verso: "Comparabilidade até nas variáveis que você nem mediu.",
                    },
                    {
                        frente: "Por que o contrafactual não existe na prática?",
                        verso: "Ninguém vive as duas versões ao mesmo tempo.",
                    },
                    {
                        frente: "Em que três casos o teste A/B não se aplica?",
                        verso: "Preço público, mudança de marca e efeito de rede entre grupos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que a métrica primária precisa ser única?",
                        verso: "Quem declara três vai declarar vitória pela que der certo.",
                    },
                    {
                        frente: "Qual é a regra de bolso para tamanho de amostra por variante?",
                        verso: "Dezesseis vezes p vezes um menos p, sobre o efeito ao quadrado.",
                    },
                    {
                        frente: "Qual é a primeira pergunta do desenho de um experimento?",
                        verso: "Qual é o menor efeito que mudaria a nossa decisão?",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é poder estatístico e qual é o padrão de mercado?",
                        verso: "A chance de detectar o efeito se ele existir; o padrão é 80%.",
                    },
                    {
                        frente: "Por que relatar o intervalo em vez do p-valor?",
                        verso: "A faixa mostra tamanho do efeito e incerteza, e engana menos.",
                    },
                    {
                        frente: "Quando qualquer diferença fica estatisticamente significante?",
                        verso: "Com base grande o bastante, até 0,2 ponto sem valor prático.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que taxa de falso positivo dez espiadas produzem?",
                        verso: "Perto de 20%, contra os 5% combinados no desenho.",
                    },
                    {
                        frente: "O que é o teste A e A e para que ele serve?",
                        verso: "Dois grupos idênticos, pra ver se a infraestrutura acusa diferença.",
                    },
                    {
                        frente: "Em que ordem ler o resultado de um experimento?",
                        verso: "Guardrails, primária, secundárias e só os segmentos já declarados.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três cuidados melhoram uma comparação antes e depois?",
                        verso: "Janelas iguais, um grupo sem a mudança e métricas que não deviam mexer.",
                    },
                    {
                        frente: "O que a aleatorização por região resolve?",
                        verso: "Boa parte dos casos de efeito de rede e de preço público.",
                    },
                    {
                        frente: "Que três coisas o relatório de um desenho fraco precisa escrever?",
                        verso: "O desenho usado, o que ele não descarta e qual seria o teste ideal.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que cinco linhas formam o contrato antes da primeira consulta?",
                        verso: "Pergunta, decisão, dado, recorte e o que faria mudar de ideia.",
                    },
                    {
                        frente: "O que mais se negocia junto com a pergunta?",
                        verso: "A profundidade: duas horas e duas semanas respondem diferente.",
                    },
                    {
                        frente: "Que resposta profissional muitos analistas evitam dar?",
                        verso: "Que a pergunta não pode ser respondida com o dado de hoje.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que é padronização numa análise de segmento?",
                        verso: "Aplicar as taxas do período novo ao mix do período antigo.",
                    },
                    {
                        frente: "O total se moveu e nenhum segmento se moveu. Qual é a resposta?",
                        verso: "O mix: mudou a composição do público, não o produto.",
                    },
                    {
                        frente: "Por que os cortes comportamentais são mais perigosos?",
                        verso: "O comportamento pode ser consequência, e não causa.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que ganho no meio do funil vale mais que no fim?",
                        verso: "Ele se propaga para todas as etapas seguintes.",
                    },
                    {
                        frente: "Quanto autoriza cada banco no fluxo de conexão do Financem?",
                        verso: "Setenta e dois no A, sessenta e oito no B e trinta e seis no C.",
                    },
                    {
                        frente: "Como uma análise de funil vira tarefa em vez de slide?",
                        verso: "Quebrando a etapa por dimensão até achar o dono do problema.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que técnica descarta história errada em quinze minutos?",
                        verso: "Procurar o grupo que não deveria ter sido afetado pela mudança.",
                    },
                    {
                        frente: "Por que variação relativa sem a base absoluta engana?",
                        verso: "Crescer 200% pode ser três usuários virando nove.",
                    },
                    {
                        frente: "Quando dizer que provavelmente contribuiu, sem isolar?",
                        verso: "Sempre que a evidência é fraca: conclusão fraca é profissional.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que significa não conseguir escrever o resumo de três linhas?",
                        verso: "Que você ainda não entendeu o que descobriu.",
                    },
                    {
                        frente: "Quando cortar o eixo vertical é aceitável?",
                        verso: "Em série de linha com variação pequena e o corte sinalizado.",
                    },
                    {
                        frente: "Qual é a métrica do ofício de análise?",
                        verso: "Decisão tomada com mais informação, não relatório entregue.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que o plano pago do Financem acrescenta ao gratuito?",
                        verso: "Projeção de saldo, metas por categoria e histórico ilimitado.",
                    },
                    {
                        frente: "Quem é o público do Financem?",
                        verso: "Adulto de 25 a 45 anos, renda média, com mais de uma conta.",
                    },
                    {
                        frente: "Com quantas unidades cada usuário contribui pra north star?",
                        verso: "No máximo quatro por mês, uma por semana conferida.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três entradas alimentam os usuários ativos semanais?",
                        verso: "Novos ativados, taxa de retorno semanal e ressuscitados.",
                    },
                    {
                        frente: "Que guardrail o time de aquisição observa?",
                        verso: "A média de semanas conferidas da coorte que ele trouxe.",
                    },
                    {
                        frente: "Quanto rende mexer nos dois fatores da árvore ao mesmo tempo?",
                        verso: "Efeito multiplicativo: 23,2% acima do ponto de partida.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantos eventos o plano do Financem tem?",
                        verso: "Quinze, cobrindo o caminho inteiro da north star.",
                    },
                    {
                        frente: "Que propriedades o evento de cancelamento carrega?",
                        verso: "O motivo e os dias de casa, que separam voluntário de involuntário.",
                    },
                    {
                        frente: "Que segunda pergunta os eventos não conseguem responder?",
                        verso: "O que a pessoa faz com a informação do resumo, fora da tela.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quanto o banco C responde das 6.400 perdas da autorização?",
                        verso: "3.072 pessoas, quase metade do buraco daquela etapa.",
                    },
                    {
                        frente: "Qual foi o segundo vazamento escolhido, e com que hipótese?",
                        verso: "O retorno na semana dois, apoiado no achado das duas contas.",
                    },
                    {
                        frente: "Por que mexer no formulário de cadastro renderia pouco?",
                        verso: "A perda vem de intenção baixa comprada na mídia paga.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que decisão foi combinada para um ganho entre dois e cinco pontos?",
                        verso: "Iterar com uma variante nova, sem lançar para a base.",
                    },
                    {
                        frente: "Que ritual semanal sustenta o ciclo?",
                        verso: "Meia hora com north star, entradas, funil e a coorte mais recente.",
                    },
                    {
                        frente: "Que duas posturas atravessam a trilha inteira?",
                        verso: "Honestidade aritmética e ceticismo com o próprio gráfico.",
                    },
                ],
            },
        },
    },
};
