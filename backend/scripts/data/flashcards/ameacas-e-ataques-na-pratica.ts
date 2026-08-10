import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Ameaças e Ataques na Prática, segunda trilha do roadmap de
 * Segurança.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento de
 * cenário; as cartas guardam as regras enunciadas de passagem, as listas
 * fechadas e as frases-chave que a aula usa para fixar cada ideia.
 */
export const ameacasEAtaquesNaPratica: CartasDaTrilha = {
    trilha: "Ameaças e Ataques na Prática",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quantos passos o ataque tem, além da entrada?",
                        verso: "Seis ao todo, sendo a entrada apenas um deles.",
                    },
                    {
                        frente: "O que quem defende só o perímetro entrega?",
                        verso: "O resto do caminho, de graça.",
                    },
                    {
                        frente: "Que engano olhar apenas a entrada provoca?",
                        verso: "Achar que barrar o acesso já encerra o ataque.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é o valor real da kill chain?",
                        verso: "Lembrar que interromper cedo custa muito menos.",
                    },
                    {
                        frente: "Quanto custa interromper tarde?",
                        verso: "Uma resposta a incidente inteira.",
                    },
                    {
                        frente: "O que a kill chain não pede que se decore?",
                        verso: "Os sete nomes das fases.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o invasor troca numa tarde?",
                        verso: "Endereço de servidor e hash de arquivo.",
                    },
                    {
                        frente: "O que o invasor não troca com facilidade?",
                        verso: "O jeito dele trabalhar.",
                    },
                    {
                        frente: "Que detecção envelhece melhor, segundo a aula?",
                        verso: "A baseada em comportamento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Como a maioria das vítimas é escolhida?",
                        verso: "Não é escolhida: é encontrada por varredura automática.",
                    },
                    {
                        frente: "O que ser encontrado por varredura muda?",
                        verso: "A preparação, e não o tamanho do prejuízo.",
                    },
                    {
                        frente: "Que ideia a aula desmonta sobre alvos?",
                        verso: "A de que só empresa grande vira alvo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que o inventário não é burocracia?",
                        verso: "Não dá para defender o que não se sabe que existe.",
                    },
                    {
                        frente: "O que a lista do inventário representa?",
                        verso: "Os lugares por onde alguém entra sem ninguém olhar.",
                    },
                    {
                        frente: "O que o vetor inicial marca no ataque?",
                        verso: "O ponto por onde o invasor conseguiu entrar.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que acontece com segredo exposto em repositório público?",
                        verso: "Não é apagado, é trocado.",
                    },
                    {
                        frente: "O que remover o arquivo do repositório esconde?",
                        verso: "Só o humano distraído, nunca o histórico.",
                    },
                    {
                        frente: "O que a OSINT reúne sobre a empresa?",
                        verso: "O que ela mesma publica de graça na internet.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quanto custa bloquear o endereço que varreu você?",
                        verso: "Uma linha de regra, e um clique para o invasor trocar.",
                    },
                    {
                        frente: "Que defesa vale mais que bloquear o endereço?",
                        verso: "Fechar a porta que não precisava estar aberta.",
                    },
                    {
                        frente: "O que a enumeração busca depois da varredura?",
                        verso: "Versão, serviço e usuário do que respondeu.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que detecção não existe contra senha correta?",
                        verso: "A por assinatura de malware.",
                    },
                    {
                        frente: "Que informação sobra para detectar o login legítimo?",
                        verso: "O contexto: de onde veio, a que horas e para quê.",
                    },
                    {
                        frente: "Por que a credencial válida é a porta preferida?",
                        verso: "Ela entra sem quebrar nada e sem disparar alarme.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que pergunta separa empresa preparada de empresa sortuda?",
                        verso: "Quanto tempo se leva para corrigir o que está exposto.",
                    },
                    {
                        frente: "O que a aula considera inevitável em qualquer empresa?",
                        verso: "Ter falhas.",
                    },
                    {
                        frente: "Que falha exposta preocupa mais?",
                        verso: "A que já tem exploração pública circulando.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que acontece de estranho no ataque via terceiros?",
                        verso: "Seus controles funcionaram e o invasor entrou mesmo assim.",
                    },
                    {
                        frente: "Por que canal o invasor chega na cadeia de suprimentos?",
                        verso: "Pelo canal que a própria empresa autorizou.",
                    },
                    {
                        frente: "Em que a defesa se apoia nesses casos?",
                        verso: "Em vigiar comportamento, e não a origem.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que um controle que exige perfeição realmente é?",
                        verso: "Uma esperança, e não um controle.",
                    },
                    {
                        frente: "O que fazer no lugar de exigir que ninguém erre?",
                        verso: "Reduzir o custo do erro.",
                    },
                    {
                        frente: "Que condição faz o controle humano falhar?",
                        verso: "O dia corrido, com a pessoa sob pressão.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que conselho sobre phishing envelheceu mal?",
                        verso: "Procurar erro de português na mensagem.",
                    },
                    {
                        frente: "Como é o phishing que dói hoje?",
                        verso: "Bem escrito, no momento certo e sobre assunto esperado.",
                    },
                    {
                        frente: "Que variante do phishing mira a alta gestão?",
                        verso: "O whaling.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Para onde o filtro de correio empurrou o golpe?",
                        verso: "Para o telefone e para o celular pessoal.",
                    },
                    {
                        frente: "Por que esse canal favorece o golpista?",
                        verso: "A empresa enxerga menos e o funcionário está mais sozinho.",
                    },
                    {
                        frente: "Que isca a aula descreve fora da tela?",
                        verso: "O código impresso colado por cima do original.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é verdadeiro na fraude de fatura desviada?",
                        verso: "O fornecedor, a nota, o valor e o histórico.",
                    },
                    {
                        frente: "O que muda na fraude de fatura desviada?",
                        verso: "Só o número da conta bancária.",
                    },
                    {
                        frente: "Por que nenhum filtro pega esse golpe?",
                        verso: "Não há anexo malicioso nem link falso na mensagem.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que fator a pessoa pode digitar no lugar errado?",
                        verso: "Qualquer um que ela consiga digitar.",
                    },
                    {
                        frente: "Que fator resiste ao phishing?",
                        verso: "O que o navegador se recusa a entregar fora do site certo.",
                    },
                    {
                        frente: "O que a fadiga de MFA explora?",
                        verso: "O cansaço de receber notificação até alguém aprovar.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta substituiu que arquivo é esse?",
                        verso: "Por que ele está fazendo isso agora.",
                    },
                    {
                        frente: "O que nenhum antivírus vai apagar?",
                        verso: "O interpretador de comandos do próprio sistema.",
                    },
                    {
                        frente: "Que abuso a classificação por arquivo não cobre?",
                        verso: "O de ferramenta legítima já instalada na máquina.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que raio um incidente com trojan tem?",
                        verso: "Conhecido, limitado a quem executou o arquivo.",
                    },
                    {
                        frente: "O que o worm faz enquanto se analisa?",
                        verso: "Infecta mais máquinas a cada minuto.",
                    },
                    {
                        frente: "Que urgência o worm impõe à resposta?",
                        verso: "A de conter antes mesmo de terminar a análise.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando olhar de fora vale mais que olhar de dentro?",
                        verso: "Quando o próprio sistema pode estar mentindo.",
                    },
                    {
                        frente: "Que evidência o rootkit não consegue filtrar?",
                        verso: "O tráfego que sai pelo cabo.",
                    },
                    {
                        frente: "O que um RAT dá ao invasor?",
                        verso: "Controle remoto interativo da máquina.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o infostealer alimenta?",
                        verso: "O mercado de credenciais roubadas.",
                    },
                    {
                        frente: "Que erro comum deixa o invasor dentro de casa?",
                        verso: "Trocar a senha sem encerrar as sessões.",
                    },
                    {
                        frente: "Que dado o infostealer costuma levar junto?",
                        verso: "Cookies de sessão e senhas salvas no navegador.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que presente a persistência dá ao defensor?",
                        verso: "Ela precisa ficar gravada em algum lugar para funcionar.",
                    },
                    {
                        frente: "O que diferencia a persistência do que só roda em memória?",
                        verso: "Ela deixa rastro no disco ou na configuração.",
                    },
                    {
                        frente: "Que objetivo a persistência cumpre?",
                        verso: "Fazer o acesso voltar depois do reinício.",
                    },
                ],
            },
        },
    },
};
