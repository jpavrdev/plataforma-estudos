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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Em que pasta o GitHub Actions procura os workflows?",
                        verso: "Em .github/workflows/",
                    },
                    {
                        frente: "Que gatilho dispara o workflow manualmente?",
                        verso: "O workflow_dispatch.",
                    },
                    {
                        frente: "Que gatilho dispara em horários definidos?",
                        verso: "O schedule, no formato de cron.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o campo runs-on define num job?",
                        verso: "A máquina virtual onde o job vai rodar.",
                    },
                    {
                        frente: "Qual é a diferença entre um step com run e um com uses?",
                        verso: "run executa comandos de shell; uses executa uma action pronta.",
                    },
                    {
                        frente: "O que acontece com os steps seguintes quando um falha?",
                        verso: "São pulados: o job para na primeira falha.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Para que serve a action de checkout?",
                        verso: "Clonar o repositório no runner, no commit que disparou o workflow.",
                    },
                    {
                        frente: "Para que serve o campo with num step?",
                        verso: "Passar parâmetros de configuração para a action.",
                    },
                    {
                        frente: "O que a action de cache guarda?",
                        verso: "Arquivos entre execuções, como dependências já baixadas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que acontece com npm install se o lockfile estiver desalinhado?",
                        verso: "Ele ajusta e segue; o npm ci falha imediatamente.",
                    },
                    {
                        frente: "O que o comando de checagem de tipos com noEmit faz num step?",
                        verso: "Confere os tipos do TypeScript sem gerar arquivo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que sintaxe acessa um secret dentro do workflow?",
                        verso: "A interpolação de secrets com o nome da chave.",
                    },
                    {
                        frente: "O que acontece com um secret nos logs do Actions?",
                        verso: "Fica mascarado, diferente de variável de ambiente comum.",
                    },
                    {
                        frente: "Por que senha de banco não pode ir no YAML?",
                        verso: "Fica exposta para qualquer um com acesso ao repositório.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que campo faz um job esperar outro terminar com sucesso?",
                        verso: "O needs, listando o job pré-requisito.",
                    },
                    {
                        frente: "O que acontece com o job dependente se o anterior falhar?",
                        verso: "Ele não roda: o needs bloqueia a execução.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que é um registry de imagens no fluxo do pipeline?",
                        verso: "O lugar onde a imagem construída fica armazenada e versionada.",
                    },
                    {
                        frente: "Que registry já vem integrado ao GitHub?",
                        verso: "O GitHub Container Registry, o GHCR.",
                    },
                    {
                        frente: "Que autenticação o GHCR costuma usar?",
                        verso: "O token que o próprio Actions injeta no workflow.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Onde fica guardado o valor de um secret do repositório?",
                        verso: "Nas configurações de secrets, fora do código versionado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que tag identifica exatamente qual commit gerou a imagem?",
                        verso: "A tag com o sha do commit.",
                    },
                    {
                        frente: "Para que serve marcar a mesma imagem com mais de uma tag?",
                        verso: "Referenciar a mesma imagem de formas diferentes, sem duplicar.",
                    },
                    {
                        frente: "Quando usar a tag de versão semântica?",
                        verso: "Para marcar releases, em geral a partir de uma tag do repositório.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que o cache de camadas local não ajuda no runner?",
                        verso: "Cada execução usa uma máquina nova, sem os builds anteriores.",
                    },
                    {
                        frente: "Qual é o efeito de reaproveitar cache de camadas entre execuções?",
                        verso: "O build fica mais rápido, reusando o que não mudou.",
                    },
                ],
            },
        },
    },
};
