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
    },
};
