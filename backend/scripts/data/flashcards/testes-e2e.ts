import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Testes E2E com Cypress e Playwright, terceira trilha do roadmap de
 * QA e Testes.
 *
 * Sem trilhos de linguagem: tudo em "neutra". A trilha compara duas ferramentas o
 * tempo todo, então boa parte das cartas fixa em que cada uma difere, que é
 * exatamente o que confunde quem alterna entre projetos.
 */
export const testesE2e: CartasDaTrilha = {
    trilha: "Testes E2E com Cypress e Playwright",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quanto tempo custa um teste de ponta a ponta?",
                        verso: "De segundos a minutos, contra milissegundos no unitário.",
                    },
                    {
                        frente: "O que pode quebrar um teste de ponta a ponta?",
                        verso: "Layout, rede, dado e tempo. Tudo entra na conta.",
                    },
                    {
                        frente: "O que a falha de um teste de ponta a ponta aponta?",
                        verso: "Só que o fluxo não completou, sem dizer onde.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a diferença arquitetural entre Cypress e Playwright?",
                        verso: "O Cypress roda dentro do navegador; o Playwright o controla por protocolo.",
                    },
                    {
                        frente: "Que navegador o Playwright cobre e o Cypress não?",
                        verso: "O WebKit.",
                    },
                    {
                        frente: "Como o paralelismo difere entre os dois?",
                        verso: "No Playwright vem incluído e gratuito; no Cypress é pago ou manual.",
                    },
                    {
                        frente: "Qual ferramenta de investigação de falha o Playwright oferece?",
                        verso: "O trace viewer, com linha do tempo, prints, rede e console.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Para que serve o baseURL na configuração?",
                        verso: "Escrever caminhos curtos e trocar de ambiente por variável.",
                    },
                    {
                        frente: "Por que configurar retries só no CI e zero localmente?",
                        verso: "Reduz ruído no servidor e ainda deixa ver a instabilidade na máquina.",
                    },
                    {
                        frente: "O que a opção de paralelismo total exige dos testes?",
                        verso: "Que sejam independentes entre si.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quais são as três partes de um teste de ponta a ponta?",
                        verso: "Preparar o estado, agir no fluxo e verificar o resultado observável.",
                    },
                    {
                        frente: "O que pesa mais nesse teste do que num unitário?",
                        verso: "A preparação do estado inicial, que dá mais trabalho que o fluxo.",
                    },
                    {
                        frente: "O que se ganha ao quebrar um teste de seis fluxos em seis?",
                        verso: "A falha aponta o fluxo exato, e os testes paralelizam.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a maior fonte de instabilidade em suítes de ponta a ponta?",
                        verso: "O dado usado pelos testes.",
                    },
                    {
                        frente: "Qual é a desvantagem do dado fixo compartilhado?",
                        verso: "Os testes se contaminam e o paralelismo deixa de ser seguro.",
                    },
                    {
                        frente: "Qual é a solução mais barata contra colisão em paralelo?",
                        verso: "Usar identificadores únicos por teste.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que tipo de seletor tem a pior resistência a mudanças?",
                        verso: "O caminho estrutural no DOM, baseado em posição.",
                    },
                    {
                        frente: "Qual é a vantagem extra do seletor por papel e nome acessível?",
                        verso: "Se o teste não acha o elemento, um leitor de tela também não acharia.",
                    },
                    {
                        frente: "Qual é o principal risco de usar texto visível como seletor?",
                        verso: "Ele quebra em internacionalização e em mudança de redação.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a vantagem do atributo de teste sobre uma classe de CSS?",
                        verso: "Estabelece contrato explícito de que aquele atributo serve a testes.",
                    },
                    {
                        frente: "Quando não vale usar atributo de teste?",
                        verso: "Quando existe botão com nome claro, achável por papel.",
                    },
                    {
                        frente: "Como escolher um item em uma lista de vinte iguais?",
                        verso: "Localizando o item pelo conteúdo único dele e agindo dentro.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando digitar tecla por tecla em vez de preencher de uma vez?",
                        verso: "Quando o comportamento depende da digitação: sugestão ou máscara.",
                    },
                    {
                        frente: "Qual é a armadilha do comando de digitação do Cypress?",
                        verso: "Ele não limpa o campo antes, e concatena com o valor anterior.",
                    },
                    {
                        frente: "O que fazer quando o clique falha por elemento não receber evento?",
                        verso: "Investigar o que está por cima, como banner ou sobreposição.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é o padrão mais confiável para agir num item de lista?",
                        verso: "Filtrar o item pelo conteúdo único e agir dentro dele.",
                    },
                    {
                        frente: "O que verificar num teste de estado vazio?",
                        verso: "Que a mensagem aparece e que nenhum item é exibido.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como as ferramentas resolvem a janela do sistema no upload?",
                        verso: "Definem o arquivo direto no campo, sem abrir a janela.",
                    },
                    {
                        frente: "Que cenário de upload mais revela defeito?",
                        verso: "Um arquivo acima do tamanho máximo permitido.",
                    },
                    {
                        frente: "Por que aguardar o evento de download antes de clicar?",
                        verso: "O evento acontece antes de o clique terminar.",
                    },
                ],
            },
        },
    },
};
