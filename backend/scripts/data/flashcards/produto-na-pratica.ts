import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Produto na Prática, quinta trilha do roadmap de Produto.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento de
 * cenário; as cartas ficam com as listas fechadas, os nomes de cada peça e as
 * regras práticas que a aula enuncia de passagem.
 */
export const produtoNaPratica: CartasDaTrilha = {
    trilha: "Produto na Prática",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a proposta do Financem no plano de lançamento?",
                        verso: "Saber quanto dá pra gastar sem comprometer o imposto do mês.",
                    },
                    {
                        frente: "Que três respostas de cabeça indicam um GTM saudável?",
                        verso: "Quem usa primeiro, onde ela está e que frase faz ela clicar.",
                    },
                    {
                        frente: "O que acontece quando a campanha promete mais que o produto?",
                        verso: "Cadastro e cancelamento na mesma semana, e confiança queimada.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que nome tem a fase interna de lançamento?",
                        verso: "Dogfooding: o próprio time usa e acha o absurdo óbvio.",
                    },
                    {
                        frente: "Que três coisas cada fase precisa ter, na regra do Financem?",
                        verso: "Dono, data máxima e critério numérico escrito antes de abrir.",
                    },
                    {
                        frente: "Que pergunta honesta se faz antes de pular uma fase?",
                        verso: "O que faríamos se o pior acontecesse com a base inteira dentro?",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais são os quatro tipos de feature flag?",
                        verso: "De release, de experimento, operacional e de permissão.",
                    },
                    {
                        frente: "Que tipos de flag são permanentes por natureza?",
                        verso: "As de permissão e as operacionais, com nome claro e documentação.",
                    },
                    {
                        frente: "Que pergunta substitui a de quando o código sobe?",
                        verso: "Para quem isso já está ligado?",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que um checklist copiado da internet vale pouco?",
                        verso: "Ele é a memória escrita dos erros do seu time, não de outro.",
                    },
                    {
                        frente: "Como é o ritual de go de um lançamento?",
                        verso: "Quinze minutos na véspera, item por item, podendo dizer que não.",
                    },
                    {
                        frente: "Por que sexta à tarde continua sendo má janela de lançamento?",
                        verso: "Não é superstição: quem sabe consertar já viajou.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que ordem ler os sinais da primeira semana?",
                        verso: "Saúde, adoção, qualidade do uso e só então a opinião.",
                    },
                    {
                        frente: "Que tipo de problema pede iteração em vez de reversão?",
                        verso: "O de ajuste: texto confuso, passo a mais, limite mal escolhido.",
                    },
                    {
                        frente: "O que registrar no fim da primeira semana?",
                        verso: "O que esperávamos, o que aconteceu e o que faremos, com os números.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Como funciona o loop pago de crescimento?",
                        verso: "A receita do usuário adquirido financia a aquisição do próximo.",
                    },
                    {
                        frente: "Que dois loops compensam a viralidade fraca do Financem?",
                        verso: "O de conteúdo sobre imposto e o de parceria com contadores.",
                    },
                    {
                        frente: "O que medir antes de comemorar o desenho de um loop?",
                        verso: "Quanto tempo cada volta do ciclo realmente leva.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três partes uma boa definição de ativação tem?",
                        verso: "Ação, quantidade e prazo, tudo escrito numa frase só.",
                    },
                    {
                        frente: "Que passos do onboarding podem esperar?",
                        verso: "Os que trabalham pra nós: origem, telefone e aceite de comunicação.",
                    },
                    {
                        frente: "O que costuma aparecer no percentil 90 do time to value?",
                        verso: "Um número absurdo, enquanto a mediana parece aceitável.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que gatilhos externos respeitam o usuário no Financem?",
                        verso: "Aviso no dia da nota, resumo na sexta e alerta perto do limite.",
                    },
                    {
                        frente: "Como um padrão escuro cobra a conta depois?",
                        verso: "Em desinstalação, avaliação ruim na loja e desconfiança.",
                    },
                    {
                        frente: "De onde vem retenção alta, quase sempre?",
                        verso: "De hábito: o produto se encaixa numa rotina que já existe.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é o risco principal do canal orgânico?",
                        verso: "Depender do algoritmo de alguém que pode mudar a regra.",
                    },
                    {
                        frente: "Que duas defesas protegem contra a saturação de canal?",
                        verso: "Manter um canal fora do leilão e medir o payback do cliente.",
                    },
                    {
                        frente: "Por que a alta do custo de aquisição não é culpa do time?",
                        verso: "É física do canal: o público mais óbvio se esgota com o tempo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quais cinco elementos todo experimento de growth carrega?",
                        verso: "Hipótese, métrica de decisão, critério de parada, guarda e registro.",
                    },
                    {
                        frente: "Que pergunta a revisão trimestral de experimentos faz?",
                        verso: "O que aprendemos que mudou o rumo do produto?",
                    },
                    {
                        frente: "Que exemplo mostra o ganho que rouba de outro lugar?",
                        verso: "Cadastro encurtado sobe contas criadas e desaba a ativação.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que eixo de cobrança o Financem escolheu, e com que ajuste?",
                        verso: "Funcionalidade, com um teto generoso de notas no plano gratuito.",
                    },
                    {
                        frente: "Quantos planos costumam ser o limite prático da clareza?",
                        verso: "Três: acima disso a decisão de compra trava.",
                    },
                    {
                        frente: "Quando o modelo de cobrança por uso é justo?",
                        verso: "Quando existe custo variável real por unidade consumida.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o custo define, se não define o preço?",
                        verso: "O piso: abaixo dele o negócio não se paga.",
                    },
                    {
                        frente: "Que contrapartidas justificam um desconto em negociação?",
                        verso: "Prazo maior, pagamento antecipado ou caso de sucesso público.",
                    },
                    {
                        frente: "O que observar ao tratar preço como hipótese?",
                        verso: "Conversão, objeções que aparecem e desconto concedido.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três terrenos o teste de preço por sorteio toca?",
                        verso: "Justiça, confiança e o terreno jurídico do consumidor.",
                    },
                    {
                        frente: "Que critérios de preço diferente as pessoas aceitam?",
                        verso: "Praça, moeda e segmento declarado, como estudante ou pequena empresa.",
                    },
                    {
                        frente: "Qual é o limite ético ao mexer no empacotamento?",
                        verso: "Não retirar valor de quem já estava pagando por ele.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Como se compõe o MRR de um mês?",
                        verso: "O do mês anterior mais novo e expansão, menos contração e churn.",
                    },
                    {
                        frente: "Que receita não entra no MRR?",
                        verso: "A avulsa e a de projeto pontual, porque não são previsíveis.",
                    },
                    {
                        frente: "O que a contração alta diz ao time de produto?",
                        verso: "O cliente encolheu o uso semanas antes de encolher o plano.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que quatro tipos de limite o plano gratuito pode usar?",
                        verso: "Por volume, por funcionalidade, por tempo ou por pessoa.",
                    },
                    {
                        frente: "Que quatro papéis o plano gratuito pode cumprir?",
                        verso: "Loop de conteúdo, de indicação, efeito de rede ou confiança.",
                    },
                    {
                        frente: "O que significa precisar de 20% de conversão pra fechar a conta?",
                        verso: "Que aquilo não é freemium: é teste gratuito com prazo.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro territórios técnicos cobrem quase toda conversa?",
                        verso: "API, banco de dados, deploy e dívida técnica.",
                    },
                    {
                        frente: "Que três hábitos fazem a engenharia confiar no PM?",
                        verso: "Trazer o problema antes, sustentar a prioridade e dizer não pra fora.",
                    },
                    {
                        frente: "Que dois vícios o PM deve evitar na conversa técnica?",
                        verso: "Fingir que entendeu e usar termo decorado pra parecer da turma.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quais são os quatro tipos de dívida técnica?",
                        verso: "Deliberada registrada, deliberada esquecida, por aprendizado e por idade.",
                    },
                    {
                        frente: "Que fatia de capacidade se reserva para saúde técnica?",
                        verso: "Entre dez e vinte por cento, com o time escolhendo o que entra.",
                    },
                    {
                        frente: "Que direito o PM ganha ao reservar essa fatia?",
                        verso: "Pedir de vez em quando qual efeito ela produziu.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é o padrão de qualidade reconhecível de uma API?",
                        verso: "Ir do zero ao primeiro sucesso sozinho, sem falar com ninguém.",
                    },
                    {
                        frente: "O que é a interface principal de um produto de API?",
                        verso: "A documentação, e não um anexo do produto.",
                    },
                    {
                        frente: "Que exemplo de código serve numa documentação de API?",
                        verso: "O que roda colado, sem precisar de nenhuma edição.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "De que escolhas técnicas o PM deve ficar longe?",
                        verso: "Linguagem, padrão de código e estrutura interna dos módulos.",
                    },
                    {
                        frente: "Como é uma condição de revisão que de fato dispara?",
                        verso: "De negócio e observável: quando passarmos de cinco mil clientes.",
                    },
                    {
                        frente: "Que exemplo mostra o limite do comprar pronto?",
                        verso: "Terceirizar o motor de projeção seria entregar o produto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quais são as quatro frentes do PM durante um incidente?",
                        verso: "Impacto, comunicação, decisão de produto e proteção do time.",
                    },
                    {
                        frente: "De que premissa parte a análise pós-incidente?",
                        verso: "As pessoas agiram razoavelmente com a informação que tinham.",
                    },
                    {
                        frente: "Que números tornam a qualidade visível no plano?",
                        verso: "Tempo fora do ar, taxa de erro e incidentes por trimestre.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que a IA não encolheu, apesar de baratear o artefato?",
                        verso: "O custo de estar errado sobre o que importa.",
                    },
                    {
                        frente: "Quem continua responsável pelo resumo de entrevista feito por IA?",
                        verso: "Você, por conferir cada trecho no material original.",
                    },
                    {
                        frente: "O que a empresa paga de verdade ao contratar um PM?",
                        verso: "A responsabilidade pela escolha, que a ferramenta não assume.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantas mensagens o Financem acumulou num trimestre, e de onde?",
                        verso: "Cerca de três mil, entre suporte, loja, pesquisa e comunidade.",
                    },
                    {
                        frente: "Quantas mensagens sortear na amostragem de conferência?",
                        verso: "Entre trinta e cinquenta, lidas à mão e comparadas.",
                    },
                    {
                        frente: "Quando a classificação sai ruim, onde costuma estar o erro?",
                        verso: "Na definição das categorias, e não no modelo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que fidelidade a IA não acelera em nada?",
                        verso: "A conversa com usuário e a prova técnica de escala.",
                    },
                    {
                        frente: "Que tipo de protótipo era caro demais e ficou viável?",
                        verso: "O de dado simulado com comportamento realista.",
                    },
                    {
                        frente: "Por que protótipo feio pode render mais no discovery?",
                        verso: "Ele recebe crítica útil; o bonito recebe elogio.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quanto basta escrever à mão antes de pedir a organização?",
                        verso: "Seis linhas com o diagnóstico e a decisão, sem capricho.",
                    },
                    {
                        frente: "O que fazer com o texto antes de mandar pra alguém?",
                        verso: "Ler inteiro e reescrever ao menos uma parte com suas palavras.",
                    },
                    {
                        frente: "Que combinado de time evita conversa desagradável depois?",
                        verso: "Dizer que o rascunho saiu com apoio de IA, quando saiu.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que quatro perguntas a empresa precisa responder sobre a ferramenta?",
                        verso: "Se é aprovada, se treina com o dado, onde ele fica e a base legal.",
                    },
                    {
                        frente: "O que remover antes de enviar conteúdo para ferramenta externa?",
                        verso: "Nome, telefone, email, documento e endereço da pessoa.",
                    },
                    {
                        frente: "Por que a opacidade da IA é um limite de trabalho?",
                        verso: "Não dá pra saber a origem, então ela não vale como evidência.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que se espera da entrega de um APM ou Product Analyst?",
                        verso: "Execução confiável, com dado apurado e aprendizado registrado.",
                    },
                    {
                        frente: "Qual é a armadilha comum ao pensar no próximo nível?",
                        verso: "Achar que ele é a versão mais rápida do trabalho de hoje.",
                    },
                    {
                        frente: "Que custo real tem trocar de empresa por salário?",
                        verso: "Recomeçar do zero a construção de confiança.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que dever de casa quem vem de negócio precisa fazer?",
                        verso: "Vocabulário técnico e o hábito de duvidar do que o cliente pede.",
                    },
                    {
                        frente: "Como criar valor visível antes de pedir a vaga de produto?",
                        verso: "Ajudar em pesquisa, escrever o que ninguém escreveu e levar dado.",
                    },
                    {
                        frente: "Que ajuste desconfortável pode vir na virada para produto?",
                        verso: "Ajuste salarial, saindo de dev sênior para produto pleno.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é o critério único por trás dos quatro tipos de case?",
                        verso: "Querem ouvir como você pensa, não a resposta pronta.",
                    },
                    {
                        frente: "Como treinar estimativa para entrevista?",
                        verso: "Um número por dia em cinco minutos, com as premissas escritas.",
                    },
                    {
                        frente: "Que três histórias ter prontas para a parte comportamental?",
                        verso: "Um conflito, uma decisão que deu errado e uma virada com dado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que regra resolve o sigilo ao contar um resultado?",
                        verso: "Se não pode citar o número, cite o efeito e o método.",
                    },
                    {
                        frente: "Que formato de página um case de portfólio precisa ter?",
                        verso: "Uma página escaneável, com títulos que já contam a história.",
                    },
                    {
                        frente: "Quantos cases valem mais num portfólio?",
                        verso: "Dois bem escritos valem mais que oito descrições rasas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que se mapeia entre os dias 31 e 60?",
                        verso: "Onde está o dado, em que métrica confiar e quem decide o quê.",
                    },
                    {
                        frente: "Que frase fecha portas mais rápido num começo de trabalho?",
                        verso: "Na minha antiga empresa a gente fazia assim.",
                    },
                    {
                        frente: "Por que não aceitar a métrica do painel sem investigar?",
                        verso: "Muita empresa acompanha há anos um número que mede outra coisa.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que restrições a parte de contexto precisa citar?",
                        verso: "Time, prazo, restrição técnica e restrição regulatória.",
                    },
                    {
                        frente: "Que dois pontos a parte de aprendizado precisa entregar?",
                        verso: "O que faria diferente e o que passou a fazer sempre.",
                    },
                    {
                        frente: "Que erro frequente estraga a parte de resultado?",
                        verso: "Mostrar só o que deu certo e omitir todo o resto.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que decisão difícil o case do Financem deixa visível?",
                        verso: "Exigir a conexão de receita, que derrubou as contas criadas.",
                    },
                    {
                        frente: "Por que a conexão obrigatória foi mantida mesmo assim?",
                        verso: "O objetivo do ciclo era ativação, não número de cadastros.",
                    },
                    {
                        frente: "Que canal o público estreito do Financem justificou?",
                        verso: "Comunidade e contador, em vez de mídia paga.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como a ativação do Financem é relatada com base e prazo?",
                        verso: "De 24% para 38% em oito semanas, sobre 1.200 novos por mês.",
                    },
                    {
                        frente: "O que não melhorou no período do case do Financem?",
                        verso: "A retenção em trinta dias ficou praticamente parada.",
                    },
                    {
                        frente: "Que erro de instrumentação o case admite?",
                        verso: "A conciliação entrou tarde e custou duas semanas às cegas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que quatro frases compõem a versão de cinco minutos?",
                        verso: "Problema e de quem, decisão e descarte, número e aprendizado.",
                    },
                    {
                        frente: "O que a pergunta sobre metade do tempo testa?",
                        verso: "Priorização de verdade: o que você cortaria primeiro.",
                    },
                    {
                        frente: "Em que momento avisar que o case é fictício?",
                        verso: "Na primeira frase, antes de qualquer número.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como a dúvida metódica aparece no dia a dia?",
                        verso: "Testando a suposição mais arriscada antes de construir.",
                    },
                    {
                        frente: "Que caminhos de aprofundamento a aula sugere?",
                        verso: "Dados, pesquisa, lado técnico, negócio ou um domínio específico.",
                    },
                    {
                        frente: "O que significa honestidade com número, na prática?",
                        verso: "Não vender sorte como mérito nem esconder o que falhou.",
                    },
                ],
            },
        },
    },
};
