import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Defesa e o SOC, terceira trilha do roadmap de Segurança.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento de
 * cenário; as cartas guardam as regras de bolso do dia a dia do SOC, as
 * listas fechadas e as frases-chave que a aula usa para fixar cada ideia.
 */
export const defesaEOSoc: CartasDaTrilha = {
    trilha: "Defesa e o SOC",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que mil alertas por dia com três reais é?",
                        verso: "Barulho, e não visibilidade.",
                    },
                    {
                        frente: "Que efeito prático o barulho produz?",
                        verso: "Ensina o analista a ignorar.",
                    },
                    {
                        frente: "O que um SOC entrega, no fim das contas?",
                        verso: "Detecção, triagem e resposta de forma contínua.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que se aprende em semanas, e o que não?",
                        verso: "A ferramenta se aprende; o raciocínio não.",
                    },
                    {
                        frente: "Que pergunta a entrevista faz, por causa disso?",
                        verso: "O que você faria diante de um alerta.",
                    },
                    {
                        frente: "Que pergunta a entrevista não faz?",
                        verso: "Que botão você aperta.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que destino tem a métrica fácil de burlar?",
                        verso: "Vai ser burlada, sem a segurança melhorar.",
                    },
                    {
                        frente: "Que métrica a aula recomenda escolher?",
                        verso: "Aquela em que trapacear dá o mesmo trabalho que fazer certo.",
                    },
                    {
                        frente: "Que indicadores clássicos medem um SOC?",
                        verso: "Os tempos de detecção e de resposta.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é alerta sem procedimento?",
                        verso: "Teatro, e não cobertura.",
                    },
                    {
                        frente: "Quando o alerta sem procedimento já falhou?",
                        verso: "Antes mesmo de disparar.",
                    },
                    {
                        frente: "Que custo o ruído cobra do time?",
                        verso: "A atenção, gasta no lugar errado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que dá para automatizar sem medo?",
                        verso: "O que apenas coleta contexto.",
                    },
                    {
                        frente: "O que exige pensar duas vezes antes de automatizar?",
                        verso: "O que desliga alguma coisa.",
                    },
                    {
                        frente: "Por que a automação que desliga assusta?",
                        verso: "A regra vai errar num dia ruim.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "De que a cobertura de detecção depende?",
                        verso: "Da cobertura de coleta.",
                    },
                    {
                        frente: "O que é regra sofisticada sobre fonte inexistente?",
                        verso: "Exercício de estilo, e não defesa.",
                    },
                    {
                        frente: "Que fontes um SOC costuma coletar primeiro?",
                        verso: "Estação, servidor, rede, identidade e nuvem.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que normalizar entrega ao dado?",
                        verso: "Deixa o dado consultável.",
                    },
                    {
                        frente: "O que enriquecer entrega ao dado?",
                        verso: "Deixa o dado interpretável.",
                    },
                    {
                        frente: "No que o analista vira sem enriquecimento?",
                        verso: "Tradutor de campo, em vez de investigador.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a retenção curta demais garante?",
                        verso: "Que o começo da história já foi apagado por você mesmo.",
                    },
                    {
                        frente: "Com o que a retenção precisa ser comparada?",
                        verso: "Com o tempo de permanência do invasor.",
                    },
                    {
                        frente: "Que tensão a retenção sempre carrega?",
                        verso: "A do custo de guardar contra a chance de investigar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que alguns minutos de diferença entre relógios causam?",
                        verso: "Invertem causa e efeito na linha do tempo.",
                    },
                    {
                        frente: "Por que essa inversão é perigosa?",
                        verso: "A conclusão errada parece perfeitamente lógica.",
                    },
                    {
                        frente: "Que prática evita o problema de fuso?",
                        verso: "Guardar tudo num fuso único, com relógios sincronizados.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é pior que uma fonte ausente?",
                        verso: "Fonte integrada com o campo essencial vazio.",
                    },
                    {
                        frente: "Por que a fonte ausente incomoda menos?",
                        verso: "A ausência você percebe.",
                    },
                    {
                        frente: "De que a regra que não dispara se disfarça?",
                        verso: "De calmaria.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que o SIEM descobre sozinho?",
                        verso: "Nada: ele responde o que alguém escreveu.",
                    },
                    {
                        frente: "O que é comprar a plataforma antes das perguntas?",
                        verso: "Comprar um cofre sem saber o que guardar.",
                    },
                    {
                        frente: "Que trabalho o SIEM concentra?",
                        verso: "Juntar os logs e responder consultas sobre eles.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que ordem uma boa consulta segue?",
                        verso: "Filtrar cedo e juntar tarde.",
                    },
                    {
                        frente: "O que acontece com a consulta que varre meses primeiro?",
                        verso: "Costuma expirar antes de responder qualquer coisa.",
                    },
                    {
                        frente: "Que filtro costuma reduzir mais rápido o conjunto?",
                        verso: "O da janela de tempo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é pior que uma regra que não existe?",
                        verso: "Uma regra que dispara por coincidência.",
                    },
                    {
                        frente: "Que estrago a regra por coincidência causa no time?",
                        verso: "Ensina o time a desconfiar de todas as outras.",
                    },
                    {
                        frente: "O que a correlação junta?",
                        verso: "Eventos de fontes diferentes na mesma história.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que teste diz se um painel é útil?",
                        verso: "Que decisão ele apoia, e quem toma essa decisão.",
                    },
                    {
                        frente: "Para que serve o painel sem essa resposta?",
                        verso: "Para impressionar visita.",
                    },
                    {
                        frente: "Que erro comum entulha um painel?",
                        verso: "Colocar tudo que a ferramenta sabe desenhar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Existe conjunto universal de boas regras?",
                        verso: "Não: o conjunto é sempre ajustado àquele ambiente.",
                    },
                    {
                        frente: "O que ajustar regra exige saber?",
                        verso: "O que é normal naquele ambiente.",
                    },
                    {
                        frente: "Que limite o SIEM tem diante do dado que falta?",
                        verso: "Não responde o que ninguém coletou.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que acontece com a regra sem explicação?",
                        verso: "Vira intocável, e ninguém a ajusta.",
                    },
                    {
                        frente: "Que fim a regra intocável tem?",
                        verso: "Envelhece até parar de servir.",
                    },
                    {
                        frente: "Que informação toda regra deveria carregar?",
                        verso: "O porquê de cada número e limite escolhido.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Em que língua escrever a regra primeiro?",
                        verso: "Em português, antes de virar consulta.",
                    },
                    {
                        frente: "O que não conseguir explicar o comportamento revela?",
                        verso: "Que ainda não se sabe o que se está procurando.",
                    },
                    {
                        frente: "Que ponto de partida uma boa regra tem?",
                        verso: "O comportamento do atacante, não o indicador solto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a regra que nunca disparou pode ser?",
                        verso: "Uma regra quebrada em silêncio.",
                    },
                    {
                        frente: "Que atitude a regra sem disparos merece?",
                        verso: "Desconfiança, com teste proposital.",
                    },
                    {
                        frente: "Que teste valida uma detecção?",
                        verso: "Reproduzir o comportamento e ver se ela dispara.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que problema a regra editada direto na interface cria?",
                        verso: "O conhecimento fica só na cabeça de quem a escreveu.",
                    },
                    {
                        frente: "O que a detecção como código traz junto?",
                        verso: "Histórico, revisão e a chance de voltar atrás.",
                    },
                    {
                        frente: "O que acontece com quem escreveu a regra, um dia?",
                        verso: "Troca de emprego, levando o contexto embora.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a cobertura de detecção é?",
                        verso: "Bússola, e não destino.",
                    },
                    {
                        frente: "O que a cobertura mede, exatamente?",
                        verso: "O que já foi observado e catalogado por alguém.",
                    },
                    {
                        frente: "Que obrigação o invasor não tem?",
                        verso: "A de ficar dentro do catálogo.",
                    },
                ],
            },
        },
    },
};
