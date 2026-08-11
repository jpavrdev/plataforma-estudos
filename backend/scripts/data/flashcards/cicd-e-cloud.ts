import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de CI/CD e Cloud, quinta trilha do roadmap de QA e Testes.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra muito cenário
 * aplicado, então as cartas ficam com o vocabulário (pipeline, job, step,
 * runner, gatilho) e com as diferenças que se confundem.
 */
export const cicdECloud: CartasDaTrilha = {
    trilha: "CI/CD e Cloud",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que risco existe em buildar a imagem antes de atualizar o código?",
                        verso: "A imagem sai de uma versão desatualizada, sem o último commit.",
                    },
                    {
                        frente: "Que erro no registry faz o deploy usar a imagem antiga?",
                        verso: "Esquecer de publicar a tag nova.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que significa Integração Contínua na prática?",
                        verso: "Integrar com frequência e validar cada mudança automaticamente.",
                    },
                    {
                        frente: "Quem costuma achar o bug sem CI, e quem acha com CI?",
                        verso: "Sem CI, o usuário em produção; com CI, o time em minutos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre entrega e deploy contínuo?",
                        verso: "Na entrega alguém decide o momento; no deploy contínuo, é sozinho.",
                    },
                    {
                        frente: "O que a Integração Contínua garante, sozinha?",
                        verso: "Que a mudança builda e passa nos testes.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é um runner?",
                        verso: "A máquina que executa os steps de um job do pipeline.",
                    },
                    {
                        frente: "Qual é a diferença entre job e step?",
                        verso: "Job é um bloco de trabalho; step é um passo dentro dele.",
                    },
                    {
                        frente: "O que é o gatilho de um pipeline?",
                        verso: "O evento que liga a esteira, como um push ou um pull request.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que release pequena é menos arriscada que release grande?",
                        verso: "É mais fácil de entender e de reverter quando dá problema.",
                    },
                    {
                        frente: "O que muda no tempo até detectar um erro com CI?",
                        verso: "De dias, ou só em produção, para minutos após o push.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Contra qual código o gatilho de pull request roda?",
                        verso: "Contra o resultado da mescla entre a branch e o destino.",
                    },
                    {
                        frente: "Quando o gatilho de pull request dispara?",
                        verso: "Quando o PR é aberto, atualizado ou reaberto.",
                    },
                    {
                        frente: "Que campo do workflow define os eventos que disparam o pipeline?",
                        verso: "O campo on.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que comando instala dependências de forma reprodutível no CI?",
                        verso: "O npm ci, que respeita exatamente o lockfile.",
                    },
                    {
                        frente: "Que etapa pega tipo incompatível sem nenhum teste cobrir o trecho?",
                        verso: "O typecheck.",
                    },
                    {
                        frente: "O que a etapa de build verifica?",
                        verso: "Se o projeto compila e empacota.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é uma branch protection rule?",
                        verso: "Uma regra que define exigências para poder mesclar.",
                    },
                    {
                        frente: "O que acontece com o merge quando um check obrigatório falha?",
                        verso: "O GitHub bloqueia o botão até o check passar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde um bug é mais barato de corrigir?",
                        verso: "Ainda no pull request, antes do merge.",
                    },
                    {
                        frente: "Qual é o custo de pegar o bug só em produção?",
                        verso: "Alto: rollback, hotfix e usuário impactado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Depois da CI configurada, quando os testes passam a rodar?",
                        verso: "A cada push e a cada pull request, sozinhos.",
                    },
                    {
                        frente: "O que substitui o comando que o dev rodava na máquina?",
                        verso: "Um step do job, rodando o mesmo comando.",
                    },
                ],
            },
        },
    },
};
