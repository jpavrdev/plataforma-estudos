import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Discovery e Pesquisa, segunda trilha do roadmap de Produto.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz da trilha usa muito caso
 * aplicado; as cartas ficam com os números de referência (quantas entrevistas,
 * quanto tempo) e com as distinções das tabelas, que é o que se esquece.
 */
export const discoveryEPesquisa: CartasDaTrilha = {
    trilha: "Discovery e Pesquisa",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quem puxa a resposta de cada um dos quatro riscos?",
                        verso: "Produto o de valor, design o de usabilidade, engenharia o técnico.",
                    },
                    {
                        frente: "Que pergunta o risco de viabilidade técnica faz?",
                        verso: "Dá para construir isso e sustentar depois?",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que custo o produto que ninguém usa continua cobrando?",
                        verso: "A manutenção do código morto, por anos seguidos.",
                    },
                    {
                        frente: "O que é custo de oportunidade num ciclo perdido?",
                        verso: "O problema real ficou sem ninguém atacando.",
                    },
                    {
                        frente: "Quanto custa corrigir uma suposição errada na entrevista?",
                        verso: "Uma frase e uma pergunta nova, depois de meia hora de conversa.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quem faz o discovery contínuo, diferente do projeto de pesquisa?",
                        verso: "O próprio trio que vai construir, e não uma agência.",
                    },
                    {
                        frente: "Qual é a entrega do discovery contínuo?",
                        verso: "A decisão e o teste da semana, não um relatório.",
                    },
                    {
                        frente: "Por que o estudo de três meses acaba na gaveta?",
                        verso: "Chega fora do ritmo em que o time decide.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que os dois diamantes do double diamond representam?",
                        verso: "O espaço do problema e o espaço da solução.",
                    },
                    {
                        frente: "Qual é a saída esperada da fase de descobrir?",
                        verso: "Oportunidades cruas, ainda sem escolha.",
                    },
                    {
                        frente: "Que movimento cada fase do double diamond faz?",
                        verso: "Descobrir e desenvolver abrem; definir e entregar fecham.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que fica no degrau mais fraco da escada de evidência?",
                        verso: "A opinião sobre a ideia e o elogio gratuito.",
                    },
                    {
                        frente: "Sobre o que o dado de uso silencia?",
                        verso: "Sobre o porquê: ele mostra onde e quanto, não o motivo.",
                    },
                    {
                        frente: "Onde a declaração do entrevistado engana?",
                        verso: "Na memória seletiva sobre o próprio passado.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Quantas entrevistas por segmento costumam bastar numa rodada?",
                        verso: "De cinco a oito, quando os padrões começam a se repetir.",
                    },
                    {
                        frente: "O que ouvir só usuário atual limita?",
                        verso: "Só melhora o que já existe.",
                    },
                    {
                        frente: "O que quem abandonou revela, e por que é difícil?",
                        verso: "O motivo real da desistência, mas é difícil de achar e agendar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que perguntar se a pessoa usaria não serve?",
                        verso: "Pede opinião sobre o futuro, e isso vira cortesia.",
                    },
                    {
                        frente: "O que o teste da mãe pede na prática?",
                        verso: "Perguntar o que a pessoa fez, não o que ela acha.",
                    },
                    {
                        frente: "Que pergunta mede prioridade em dinheiro?",
                        verso: "Quanto você já gastou nisso este ano?",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que significa o roteiro ser bússola, e não trilho?",
                        verso: "Garante a cobertura, mas a ordem pode mudar.",
                    },
                    {
                        frente: "Quanto dura uma entrevista de discovery bem conduzida?",
                        verso: "De trinta a quarenta e cinco minutos.",
                    },
                    {
                        frente: "O que a etapa de história específica precisa entregar?",
                        verso: "Um episódio com data e ferramenta, não uma generalidade.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que contar até três em silêncio depois da resposta?",
                        verso: "A pessoa costuma completar com a parte boa.",
                    },
                    {
                        frente: "O que fazer quando o entrevistado pede a solução no meio?",
                        verso: "Devolver para o problema, em vez de virar demonstração.",
                    },
                    {
                        frente: "Qual é o problema de perguntar se algo não é frustrante?",
                        verso: "Planta a emoção na pessoa em vez de descobri-la.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em quanto tempo a síntese depois da entrevista deve acontecer?",
                        verso: "Em vinte e quatro a quarenta e oito horas, com memória fresca.",
                    },
                    {
                        frente: "O que o time faz num mapa de afinidade?",
                        verso: "Agrupa cartões parecidos até um padrão aparecer.",
                    },
                    {
                        frente: "Como classificar quando o entrevistado pede um botão?",
                        verso: "Como solução pedida: pergunte o problema por trás.",
                    },
                    {
                        frente: "O que separa uma dor de um desejo declarado?",
                        verso: "A dor vem com comportamento; o desejo, só com vontade.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que fica de fora do nível de outcome da árvore?",
                        verso: "A lista de entregas do trimestre.",
                    },
                    {
                        frente: "O que fica de fora do nível de oportunidade?",
                        verso: "Nome de feature ou de tecnologia.",
                    },
                    {
                        frente: "O que o nível de teste guarda na árvore?",
                        verso: "O experimento que decide se a solução segue.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que caracteriza uma oportunidade bem escrita?",
                        verso: "Está na voz do usuário e não embute tecnologia.",
                    },
                    {
                        frente: "Um pedido de exportar para Excel é o quê, na árvore?",
                        verso: "Uma solução, que ainda esconde a oportunidade por trás.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quem mantém a árvore de oportunidades atualizada?",
                        verso: "O trio de produto: produto, design e engenharia.",
                    },
                    {
                        frente: "Onde a entrevista semanal para de ajudar?",
                        verso: "Ela não mede quanta gente vive aquela dor.",
                    },
                    {
                        frente: "O que o funil de uso entrega para a árvore, e o que não entrega?",
                        verso: "Entrega onde procurar; não diz qual é a dor da etapa.",
                    },
                    {
                        frente: "De quem vem o ticket de suporte, e por que isso limita?",
                        verso: "Só de quem procurou ajuda, deixando os calados de fora.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Entre o que a comparação de oportunidades acontece?",
                        verso: "Entre ramos irmãos, no mesmo nível da árvore.",
                    },
                    {
                        frente: "O que o critério de alcance mede?",
                        verso: "Quantas pessoas do segmento vivem aquela dor.",
                    },
                    {
                        frente: "Que critérios têm o peso mais alto na comparação de ramos?",
                        verso: "Tamanho da dor, alcance e alinhamento com o outcome.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quantas ideias vale gerar antes de qualquer filtro?",
                        verso: "De dez a quinze.",
                    },
                    {
                        frente: "Por que cada pessoa gera ideias sozinha antes do grupo?",
                        verso: "Para o grupo não ancorar na voz mais alta da sala.",
                    },
                    {
                        frente: "Por que levar três soluções concorrentes em vez de uma?",
                        verso: "Comparar revela suposições que uma ideia sozinha esconde.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que é uma suposição por trás de uma solução?",
                        verso: "Algo que precisa ser verdade para a solução funcionar.",
                    },
                    {
                        frente: "Quais são as quatro famílias de suposição?",
                        verso: "Desejabilidade, usabilidade, viabilidade técnica e de negócio.",
                    },
                    {
                        frente: "Que pergunta guia a família de viabilidade de negócio?",
                        verso: "Cabe em custo, jurídico e no modelo da empresa?",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quais são os dois eixos do mapa de suposições?",
                        verso: "Importância da suposição e evidência que já existe.",
                    },
                    {
                        frente: "O que fazer com muita importância e pouca evidência?",
                        verso: "Testar agora, antes de o time construir.",
                    },
                    {
                        frente: "O que fazer com pouca importância e pouca evidência?",
                        verso: "Nada: é ruído, não gaste tempo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que definir o critério de sucesso antes de rodar o teste?",
                        verso: "Sem número combinado antes, todo resultado vira bom.",
                    },
                    {
                        frente: "Quais são os cinco campos de um teste bem desenhado?",
                        verso: "Suposição, método, critério, amostra e prazo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual suposição deve ser testada primeiro?",
                        verso: "A mais importante e com menos evidência hoje.",
                    },
                    {
                        frente: "Por que valor costuma ser testado antes de usabilidade?",
                        verso: "Fluxo perfeito não salva algo que ninguém quer.",
                    },
                    {
                        frente: "Quando testar viabilidade técnica logo na primeira semana?",
                        verso: "Quando ela é o risco que pode matar a solução inteira.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que campo do registro de aprendizado quase todo time esquece?",
                        verso: "A decisão tomada: seguir, ajustar ou matar.",
                    },
                    {
                        frente: "O que é a ideia zumbi?",
                        verso: "Ideia que volta sempre, sem evidência nova nenhuma.",
                    },
                    {
                        frente: "Qual é o erro comum no campo de resultado?",
                        verso: "Já escrever a conclusão em vez do número cru observado.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a regra prática pra escolher a fidelidade do protótipo?",
                        verso: "Escrever a pergunta antes e usar a menor fidelidade que responde a ela.",
                    },
                    {
                        frente: "Segundo a aula, qual protótipo é caro de verdade?",
                        verso: "O que o time não tem mais coragem de jogar fora.",
                    },
                    {
                        frente: "Qual é o segundo sinal de que a fidelidade subiu cedo demais?",
                        verso: "O time defender o protótipo quando o usuário trava.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quais são as duas perguntas salva-vidas numa sessão de teste?",
                        verso: "O que você está pensando agora? E o que você esperava que acontecesse?",
                    },
                    {
                        frente: "Que severidade de problema exige correção antes de lançar?",
                        verso: "A que impede: a pessoa não conclui sem ajuda de alguém.",
                    },
                    {
                        frente: "Por que separar as anotações de usabilidade das de valor?",
                        verso: "Misturar as duas leituras produz confiança falsa.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é o botão falso como teste de demanda?",
                        verso: "Botão que registra o clique e avisa na hora que aquilo ainda não existe.",
                    },
                    {
                        frente: "O que separa sinal forte de sinal fraco num teste de demanda?",
                        verso: "O custo que a pessoa paga pra sinalizar interesse.",
                    },
                    {
                        frente: "O que fazer com quem se cadastrou quando o time decide não fazer?",
                        verso: "Avisar mesmo assim, com uma mensagem curta e honesta.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que os testes com gente por trás ensinam de mais valioso?",
                        verso: "As regras de exceção, que não aparecem em fluxograma de reunião.",
                    },
                    {
                        frente: "Em que situações o Wizard of Oz não deve ser usado?",
                        verso: "Com dado sensível sem consentimento e em decisão crítica sem supervisão.",
                    },
                    {
                        frente: "O que combinar antes de subir um Wizard of Oz?",
                        verso: "Quantas semanas vai durar e qual pergunta encerra o teste.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que as ferramentas de 2026 aceleram no discovery?",
                        verso: "Execução, variação e volume: mais versões, mais rápido e mais barato.",
                    },
                    {
                        frente: "Que quatro trabalhos do discovery seguem humanos?",
                        verso: "Escolher o risco, recrutar, ouvir sem induzir e decidir com evidência fraca.",
                    },
                    {
                        frente: "Como guardar a frase literal no registro de aprendizado?",
                        verso: "Com o participante e o minuto da gravação ao lado.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Quais duas opções toda pergunta fechada precisa oferecer?",
                        verso: "Outro e não se aplica, pra quem não cabe nas caixinhas do time.",
                    },
                    {
                        frente: "Qual é o teto razoável de duração de uma survey?",
                        verso: "De cinco a oito minutos; depois disso o abandono cresce rápido.",
                    },
                    {
                        frente: "O que é o viés de aquiescência?",
                        verso: "A tendência humana de concordar com afirmações de quem te atende.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como é uma tela de MaxDiff?",
                        verso: "Quatro ou cinco itens, pedindo o mais e o menos importante do grupo.",
                    },
                    {
                        frente: "Quais são as duas perguntas do modelo Kano para cada item?",
                        verso: "A funcional, com o item presente, e a disfuncional, com ele ausente.",
                    },
                    {
                        frente: "Por que item encantador precisa entrar com parcimônia?",
                        verso: "Custa caro e envelhece: câmera boa em celular já foi encanto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o vaivém entre carrinho e página do produto indica?",
                        verso: "Falta uma informação ali: prazo, compatibilidade ou política de troca.",
                    },
                    {
                        frente: "Qual é o sinal mais honesto de valor nos dados de uso?",
                        verso: "Recorrência: gente que volta sozinha na semana seguinte.",
                    },
                    {
                        frente: "O que um dicionário de eventos precisa registrar?",
                        verso: "Nome, momento exato em que dispara, propriedades e dono.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Como reescrever 'todo mundo quer isso' depois de seis entrevistas?",
                        verso: "Seis de seis pessoas disseram isso; ainda não sabemos o tamanho.",
                    },
                    {
                        frente: "Por que três fontes independentes valem mais que uma fonte enorme?",
                        verso: "Cada uma tem um viés, e viéses diferentes raramente erram junto.",
                    },
                    {
                        frente: "Em que consiste o erro do quantitativo sem contexto?",
                        verso: "Otimizar por trimestres um botão que nem deveria estar na tela.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quem costuma responder survey espontânea?",
                        verso: "O muito engajado ou o muito irritado; o do meio fica calado.",
                    },
                    {
                        frente: "Por que a lista de cancelados é a fonte mais valiosa da empresa?",
                        verso: "Guarda as piores experiências, que já sumiram da base ativa.",
                    },
                    {
                        frente: "O que escrever ao lado de todo percentual que sai da sua mão?",
                        verso: "O número absoluto, o canal da coleta e a data.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Como o contrato do Caronaê é cobrado das empresas?",
                        verso: "Por funcionário ativo, com um teto de custo mensal por empresa.",
                    },
                    {
                        frente: "Que teste a aula dá pra saber se uma meta serve como outcome?",
                        verso: "Se dá pra bater entregando, é output; se dá pra errar fazendo tudo certo, é longe.",
                    },
                    {
                        frente: "Quais três grupos o trio recrutou pras entrevistas?",
                        verso: "Quem nunca andou, quem andou uma vez e parou, e o usuário frequente.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De quem é o teste da mãe usado nas entrevistas do Caronaê?",
                        verso: "Do Rob Fitzpatrick: perguntas que nem a sua mãe consegue enfeitar.",
                    },
                    {
                        frente: "Que pergunta o trio faz quando alguém pede uma funcionalidade?",
                        verso: "Me conta a última vez que você precisou disso.",
                    },
                    {
                        frente: "Onde a solução pedida pelo usuário vai parar?",
                        verso: "No fim da árvore, como candidata a teste se o ramo for escolhido.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais quatro critérios o trio usou pra pontuar os ramos?",
                        verso: "Alcance, gravidade, alinhamento e capacidade, de um a três cada.",
                    },
                    {
                        frente: "O que o critério de capacidade pergunta sobre um ramo?",
                        verso: "Se o time ataca aquilo sozinho, sem depender de outra área.",
                    },
                    {
                        frente: "Como o trio registrou os ramos que ficaram de fora?",
                        verso: "Por escrito, com data e motivo, no mesmo documento da árvore.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "De quem são as quatro famílias de risco do mapa de suposições?",
                        verso: "Do Marty Cagan: desejabilidade, usabilidade, viabilidade técnica e de negócio.",
                    },
                    {
                        frente: "Como escrever uma suposição pra evitar autoengano?",
                        verso: "Como afirmação que pode ser falsa, não como algo a entender.",
                    },
                    {
                        frente: "Qual era o critério de custo combinado pro concierge do Caronaê?",
                        verso: "Custo médio de até doze reais por acionamento da garantia.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o trio manteve e o que trocou depois dos dois testes?",
                        verso: "Manteve o outcome e o ramo do horário; trocou só a solução.",
                    },
                    {
                        frente: "Quanto tempo levou o ciclo inteiro, do outcome até a decisão?",
                        verso: "Duas semanas e meia, sem uma linha de código na feature.",
                    },
                    {
                        frente: "Que duas perguntas fazer quando alguém propõe construir algo grande?",
                        verso: "O que precisa ser verdade pra isso funcionar? E como descobrir barato?",
                    },
                ],
            },
        },
    },
};
