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
    },
};
