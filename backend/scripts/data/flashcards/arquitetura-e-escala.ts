import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Arquitetura e Escala, trilha que fecha o roadmap de DevOps.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento do
 * cenário; as cartas guardam as listas fechadas de sinal e sintoma, os
 * critérios de decisão e as trocas que cada escolha cobra.
 */
export const arquiteturaEEscala: CartasDaTrilha = {
    trilha: "Arquitetura e Escala",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Por que o tamanho do commit não define uma decisão de arquitetura?",
                        verso: "Uma linha pode ser arquitetural e uma mudança grande pode não ser.",
                    },
                    {
                        frente: "Que duas perguntas medem se uma decisão é arquitetural?",
                        verso: "Quanto do sistema depende dela e quão fundo construíram em cima.",
                    },
                    {
                        frente: "Que exemplo de uma linha só a aula dá como arquitetural?",
                        verso: "Toda escrita no banco gravar também um evento numa fila.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que diz um p99 que sobe bem mais do que o p50?",
                        verso: "Uma fatia das requisições esbarra num recurso disputado.",
                    },
                    {
                        frente: "Que efeito perverso o health check falhando tem no pico?",
                        verso: "A instância sai do load balancer bem na hora de mais acesso.",
                    },
                    {
                        frente: "Que gatilho decide a hora de escalar, e qual não decide?",
                        verso: "O número medido decide; o tempo desde o lançamento não.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como o custo da escala vertical cresce ante a capacidade?",
                        verso: "Mais que proporcional: dobrar uma máquina grande custa mais que o dobro.",
                    },
                    {
                        frente: "Que preço de entrada a escala horizontal cobra?",
                        verso: "A aplicação precisa rodar em vários lugares sem estado local.",
                    },
                    {
                        frente: "Como as duas escalas se combinam na prática?",
                        verso: "Máquinas de tamanho razoável, com autoscaling mexendo no número.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Em que unidades latência e throughput são medidos?",
                        verso: "Latência em milissegundos e throughput em requisições por segundo.",
                    },
                    {
                        frente: "Que custo o load balancer soma a cada requisição?",
                        verso: "Um salto de rede a mais entre o cliente e a réplica.",
                    },
                    {
                        frente: "Quando a fila volta a aumentar a latência de ponta a ponta?",
                        verso: "Quando ela cresce mais rápido do que os workers esvaziam.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que troca a escala horizontal faz, dita nos dois sentidos?",
                        verso: "Troca o teto físico pela exigência de não ter estado local.",
                    },
                    {
                        frente: "Em que ordem a trilha propõe escalar o sistema?",
                        verso: "Monólito, depois banco, depois fila e só então serviços.",
                    },
                    {
                        frente: "Que troca o cache faz, e o que ela exige em seguida?",
                        verso: "Troca dado atualizado por resposta rápida e exige invalidação.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que cinco facilidades a aula credita ao monólito?",
                        verso: "Entender, testar, deployar, debugar e não ter rede interna.",
                    },
                    {
                        frente: "Por que monólito não é sinônimo de bagunça?",
                        verso: "Ele aceita módulos internos bem definidos no mesmo processo.",
                    },
                    {
                        frente: "O que uma chamada entre módulos do monólito não pode fazer?",
                        verso: "Falhar na rede, atrasar ou cair no meio do caminho.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que duas estratégias de distribuição a aula compara?",
                        verso: "O round-robin em sequência e o least connections, por conexão aberta.",
                    },
                    {
                        frente: "Quando o least connections ganha do round-robin?",
                        verso: "Quando as requisições têm duração bem desigual entre si.",
                    },
                    {
                        frente: "Que ferramentas fazem o papel de load balancer?",
                        verso: "O nginx, o HAProxy ou o balanceador gerenciado da nuvem.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que quatro esconderijos de estado local a aula lista?",
                        verso: "Sessão, cache manual, arquivo enviado e contador em memória.",
                    },
                    {
                        frente: "Que teste prático confirma que a aplicação é stateless?",
                        verso: "Desligar uma réplica agora e ninguém perceber.",
                    },
                    {
                        frente: "Por que o JWT dispensa estado no servidor?",
                        verso: "O token carrega os dados e qualquer réplica valida a assinatura.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Em que o load balancer se apoia para grudar o cliente?",
                        verso: "Num cookie ou no IP de origem daquele cliente.",
                    },
                    {
                        frente: "Que exceção honesta a aula concede ao sticky session?",
                        verso: "Conexão longa como WebSocket, presa a quem a abriu.",
                    },
                    {
                        frente: "Por que uma réplica nova pouco ajuda com sticky session?",
                        verso: "Ela não recebe quem já está preso nas antigas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três sinais mostram o monólito em si começando a doer?",
                        verso: "Deploy lento, times disputando o repositório e subida tudo ou nada.",
                    },
                    {
                        frente: "Que quatro remédios resolvem a dor dentro do monólito?",
                        verso: "Índice, connection pooling, cache na frente e módulos mais claros.",
                    },
                    {
                        frente: "O que multiplicar réplicas da aplicação não multiplica?",
                        verso: "O banco, que segue sendo uma instância só para todas.",
                    },
                ],
            },
        },
    },
};
